import { callPocketProvider } from '../backend/generation.js'
import { defaultMochiSettings, type MochiRoom } from './types.js'
import { parseBehavior, type Behavior } from './behavior.js'
import { MochiGenerationError, providerFailure } from './generation-errors.js'

export {type PromptMessage} from './context.js'
import {resolveMochiContext,type PromptMessage} from './context.js'
import {MochiPresets,type ResolvedPreset} from './presets.js'
export async function buildMochiPrompt(room:MochiRoom,characters:any[],responder:string,count:(messages:PromptMessage[])=>Promise<number>,signal:AbortSignal,natural=false,preset?:ResolvedPreset):Promise<PromptMessage[]>{
  return (await resolveMochiContext(room,characters,responder,count,signal,natural,preset)).messages
}
export async function validateMochiSources(host: any, room: MochiRoom, userId: string): Promise<any> {
  const settings = room.settings || defaultMochiSettings()
  if (!host.permissions.has('generation') || !host.connections?.get) throw new MochiGenerationError('connection')
  let connection: any
  try {
    let id = settings.connectionId
    if (!id) {
      if (typeof host.connections.list !== 'function') throw new MochiGenerationError('connection')
      const defaults = (await host.connections.list(userId)).filter((c: any) => c.is_default === true)
      // Never substitute the first/active profile or guess between ambiguous defaults.
      if (defaults.length !== 1 || typeof defaults[0].id !== 'string' || !defaults[0].id) throw new MochiGenerationError('connection')
      id = defaults[0].id
    }
    connection = await host.connections.get(id, userId)
    if (!connection || connection.id !== id || !settings.connectionId && connection.is_default !== true) throw new MochiGenerationError('connection')
  }
  catch (error) { if (error instanceof MochiGenerationError) throw error; throw providerFailure(error) }
  if (!connection) throw new MochiGenerationError('connection')
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
  const messages = await buildMochiPrompt(room, characters, speaker, async messages => {
    try { return (await host.tokens.countMessages(messages, { model: settings.model || connection.model, userId })).total_tokens }
    catch (error) { signal.throwIfAborted(); throw providerFailure(error) }
  }, signal, natural,preset)
  let response: any
  try { response = await callPocketProvider(host, { messages, connection_id: connection.id, userId, signal, reasoning: { source: 'off' }, parameters: { max_tokens: settings.outputTokens, temperature: 0.8, ...(settings.model ? { model: settings.model } : {}) } }) }
  catch (error) { signal.throwIfAborted(); throw providerFailure(error) }
  let parsed: any
  const raw=response?.content
  const limited=response?.finish_reason==='length'
  if(raw===undefined||raw===null||typeof raw==='string'&&!raw.trim())throw new MochiGenerationError(limited?'output_limit':'empty_output')
  if(typeof raw!=='string')throw new MochiGenerationError('invalid_schema')
  const body=raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try { parsed = JSON.parse(body) } catch {
    if(limited)throw new MochiGenerationError('output_limit')
    // A deliberately conservative hint, never proof, fallback text or JSON repair.
    const suspected=/^[\p{L}*_]/u.test(body)&&!/[{}\[\]]/.test(body)
    throw new MochiGenerationError(suspected?'suspected_plain_text':'malformed_json')
  }
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||(natural&&Object.hasOwn(parsed,'messages')&&!Array.isArray(parsed.messages)))throw new MochiGenerationError('invalid_schema')
  const rows = natural && Array.isArray(parsed?.messages) ? parsed.messages : [parsed]
  if(rows.length>3) throw new MochiGenerationError('invalid_schema')
  const replies:GeneratedReply[]=[],seen=new Set<string>()
  for(const row of rows) {
    if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.speakerId!=='string')throw new MochiGenerationError('invalid_schema')
    const character = characters.find(c => c.id === row?.speakerId)
    if (!character || (speaker !== 'auto' && character.id !== speaker)) throw new MochiGenerationError('ineligible_speaker')
    if (seen.has(character.id) || typeof row.text !== 'string' || !row.text.trim() || row.text.length > 32000) throw new MochiGenerationError('invalid_schema')
    seen.add(character.id);replies.push({character,text:row.text.trim(),behavior:settings.aiBehavior?parseBehavior(row.behavior):{delayMs:0}})
  }
  return { ...(replies[0] || {character:characters[0],text:'',behavior:{delayMs:0}}), replies, silent:!replies.length }
}
