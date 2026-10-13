import { callPocketProvider } from '../backend/generation.js'
import { defaultMochiSettings, type MochiRoom } from './types.js'
import { parseBehavior, type Behavior } from './behavior.js'

export {type PromptMessage} from './context.js'
import {resolveMochiContext,type PromptMessage} from './context.js'
import {MochiPresets,type ResolvedPreset} from './presets.js'
export async function buildMochiPrompt(room:MochiRoom,characters:any[],responder:string,count:(messages:PromptMessage[])=>Promise<number>,signal:AbortSignal,natural=false,preset?:ResolvedPreset):Promise<PromptMessage[]>{
  return (await resolveMochiContext(room,characters,responder,count,signal,natural,preset)).messages
}
export async function validateMochiSources(host: any, room: MochiRoom, userId: string): Promise<any> {
  const settings = room.settings || defaultMochiSettings()
  if (!host.permissions.has('generation')) throw new Error('Generation permission is required.')
  if (!settings.connectionId) throw new Error('Choose a generation connection in Room settings.')
  const connection = await host.connections.get(settings.connectionId, userId)
  if (!connection) throw new Error('This connection is not available to your account.')
  if (room.persona.source === 'lumiverse' && (!host.permissions.has('personas') || !await host.personas.get(room.persona.sourceId, userId))) throw new Error('The room persona is no longer available to your account. Select another identity.')
  if (room.persona.source === 'pocket') {
    const bank = await host.userStorage.getJson('identity-profiles.json', { userId, fallback: null })
    if (bank?.version !== 1 || !bank?.entries?.some((p: any) => p.id === room.persona.sourceId && p.kind === 'persona')) throw new Error('The room identity profile is no longer available. Select another identity.')
  }
  return connection
}
export async function resolveGenerationSources(host:any,room:MochiRoom,userId:string,responder:string,eligibleIds=room.characterIds){
  if (!host.tokens?.countMessages) throw new Error('This Lumiverse version does not provide the required token counter.')
  const connection = await validateMochiSources(host, room, userId)
  const characters = []
  if (!host.permissions.has('characters')) throw new Error('Character permission is required.')
  for (const id of room.characterIds) {
    const c = await host.characters.get(id, userId)
    if (!c) throw new Error('A room character is no longer available to your account.')
    if (eligibleIds.includes(id)) characters.push(c)
  }
  if (!characters.length) throw new Error('No room character is currently eligible.')
  const speaker = responder === 'auto' && characters.length === 1 ? characters[0].id : responder
  if (speaker !== 'auto' && !room.characterIds.includes(speaker)) throw new Error('The selected responder is not in this room.')
  const preset=await new MochiPresets(host).resolve(userId,room)
  return {connection,characters,speaker,preset}
}
export interface GeneratedReply { character:any; text:string; behavior:Behavior }
export async function generateMochiReply(host: any, room: MochiRoom, userId: string, responder: string, signal: AbortSignal, eligibleIds = room.characterIds, natural = false): Promise<GeneratedReply & { replies: GeneratedReply[]; silent: boolean }> {
  const settings = room.settings || defaultMochiSettings()
  const {connection,characters,speaker,preset}=await resolveGenerationSources(host,room,userId,responder,eligibleIds)
  const messages = await buildMochiPrompt(room, characters, speaker, async messages => (await host.tokens.countMessages(messages, { model: settings.model || connection.model, userId })).total_tokens, signal, natural,preset)
  const response = await callPocketProvider(host, { messages, connection_id: settings.connectionId, userId, signal, reasoning: { source: 'off' }, parameters: { max_tokens: settings.outputTokens, temperature: 0.8, ...(settings.model ? { model: settings.model } : {}) } })
  let parsed: any
  try { parsed = JSON.parse(String(response.content).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')) } catch { throw new Error('The model returned invalid message JSON. Try continuing again.') }
  const rows = natural && Array.isArray(parsed?.messages) ? parsed.messages : [parsed]
  if(rows.length>3) throw new Error('The model exceeded the natural reply limit.')
  const replies:GeneratedReply[]=[],seen=new Set<string>()
  for(const row of rows) {
    const character = characters.find(c => c.id === row?.speakerId)
    if (!character || seen.has(character.id) || (speaker !== 'auto' && character.id !== speaker)) throw new Error('The model returned an invalid responder.')
    if (typeof row.text !== 'string' || !row.text.trim() || row.text.length > 32000) throw new Error('The model returned an empty or oversized message.')
    seen.add(character.id);replies.push({character,text:row.text.trim(),behavior:settings.aiBehavior?parseBehavior(row.behavior):{delayMs:0}})
  }
  return { ...(replies[0] || {character:characters[0],text:'',behavior:{delayMs:0}}), replies, silent:!replies.length }
}
