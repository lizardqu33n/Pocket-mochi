import { MochiAccounts } from './accounts.js'
import { discoverPersonaAddons, addonContext, type PersonaAddonContext } from './persona-addons.js'
import { callPocketProvider } from '../backend/generation.js'
import { defaultMochiSettings, type MochiRoom } from './types.js'
import { parseBehavior, type Behavior } from './behavior.js'
import { MochiGenerationError, providerFailure } from './generation-errors.js'
import {parseResponse} from './response.js'

export {type PromptMessage} from './context.js'
import {resolveMochiContext,type PromptMessage} from './context.js'
import {MochiPresets,type ResolvedPreset} from './presets.js'
export async function buildMochiPrompt(room:MochiRoom,characters:any[],responder:string,count:(messages:PromptMessage[])=>Promise<number>,signal:AbortSignal,natural=false,preset?:ResolvedPreset,personaContext?:PersonaAddonContext):Promise<PromptMessage[]>{
  return (await resolveMochiContext(room,characters,responder,count,signal,natural,preset,personaContext)).messages
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
  if (speaker !== 'auto' && !characters.some(c=>c.id===speaker)) throw new MochiGenerationError('ineligible_speaker')
  const preset=await new MochiPresets(host).resolve(userId,room)
  const personaContext=await resolveAccountAddonContext(host,room,userId)
  return {connection,characters,speaker,preset,personaContext}
}
export async function resolveAccountAddonContext(host:any,room:MochiRoom,userId:string):Promise<PersonaAddonContext|undefined>{
  let personaContext:PersonaAddonContext|undefined
  if(room.accountId){
    const account=await new MochiAccounts(host,async()=>{throw Error('Snapshot is read-only here.')}).get(userId,room.accountId)
    const selected=account.personaAddons
    if(selected&&room.persona.source==='lumiverse'&&selected.personaId===room.persona.sourceId){
      if(!host.permissions.has('personas'))throw Error('Persona permission is required.')
      let choices=account.personaAddonSnapshots
      if(!choices){const native=await host.personas.get(selected.personaId,userId);if(!native||native.id!==selected.personaId)throw Error('The room persona is no longer available to your account.');choices=await discoverPersonaAddons(host,native,userId)}
      personaContext=addonContext(room.persona.description,choices,selected,JSON.stringify([account.revision,selected,choices]))
    }
  }
  return personaContext
}
export interface GeneratedReply { character:any; text:string; behavior:Behavior }
export async function generateMochiReply(host: any, room: MochiRoom, userId: string, responder: string, signal: AbortSignal, eligibleIds = room.characterIds, natural = false): Promise<GeneratedReply & { replies: GeneratedReply[]; silent: boolean }> {
  const settings = room.settings || defaultMochiSettings()
  const {connection,characters,speaker,preset,personaContext}=await resolveGenerationSources(host,room,userId,responder,eligibleIds)
  const messages = await buildMochiPrompt(room, characters, speaker, async messages => {
    try { return (await host.tokens.countMessages(messages, { model: settings.model || connection.model, userId })).total_tokens }
    catch (error) { signal.throwIfAborted(); throw providerFailure(error) }
  }, signal, natural,preset,personaContext)
  let response: any
  try { response = await callPocketProvider(host, { messages, connection_id: connection.id, userId, signal, reasoning: { source: 'off' }, parameters: { max_tokens: settings.outputTokens, temperature: 0.8, ...(settings.model ? { model: settings.model } : {}) } }) }
  catch (error) { signal.throwIfAborted(); throw providerFailure(error) }
  const rows=parseResponse(response?.content,response?.finish_reason==='length',{speaker,eligibleIds:characters.map(c=>c.id),natural})
  const replies:GeneratedReply[]=rows.map(row=>({character:characters.find(c=>c.id===row.speakerId)!,text:row.text,behavior:settings.aiBehavior?parseBehavior(row.behavior):{delayMs:0}}))
  signal.throwIfAborted()
  if(JSON.stringify(await resolveAccountAddonContext(host,room,userId))!==JSON.stringify(personaContext))throw Error('Persona add-ons changed during generation; the reply was discarded. Retry explicitly.')
  signal.throwIfAborted()
  return { ...(replies[0] || {character:characters[0],text:'',behavior:{delayMs:0}}), replies, silent:!replies.length }
}
