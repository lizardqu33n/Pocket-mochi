import {resolveMochiContext} from './context.js'
import {resolveGenerationSources} from './generation.js'
import {eligibleResponders,minimumDelay} from './presence.js'
import type {MochiRoom} from './types.js'

// Public response is constructed field-by-field; never serialize a connection/source DTO.
export async function previewContext(host:any,room:MochiRoom,user:string,input:any,backgroundAllowed:boolean,signal:AbortSignal,now=Date.now()){
 if(!['continue','automatic'].includes(input.scenario))throw Error('Choose Continue or automatic reply preview.')
 const responder=input.responder??'auto'
 if(typeof responder!=='string'||responder!=='auto'&&!room.characterIds.includes(responder))throw Error('The preview responder is not in this room.')
 const ids=eligibleResponders(room,responder,now),sources=await resolveGenerationSources(host,room,user,responder,ids),settings=room.settings!
 const natural=input.scenario==='automatic'&&settings.responseMode==='natural'&&responder==='auto'
 const allowBehavior=Boolean(settings.aiBehavior&&room.runtime?.enabled&&backgroundAllowed)
 const promptRoom={...room,settings:{...settings,aiBehavior:allowBehavior}}
 let tokenResult:any
 const plan=await resolveMochiContext(promptRoom,sources.characters,sources.speaker,async messages=>{tokenResult=await host.tokens.countMessages(messages,{model:settings.model||sources.connection.model,userId:user});return tokenResult.total_tokens},signal,natural,sources.preset)
 const assumptions=['Read-only snapshot of saved history; no new user message is included. Future replies and scheduled context may change.','Quota, delivery eligibility and provider-side transformations are not executed or predicted.','Connection preset parameters may be inherited by Lumiverse quiet generation. They are not available through this preview; explicit Mochi parameters are shown.']
 if(input.scenario==='automatic'&&(settings.responseMode==='manual'||!settings.autoReply))assumptions.push('Automatic replies are disabled: this is hypothetical context, not a request that would be dispatched.')
 const delay=minimumDelay(room,responder,now)
 if(delay>0)assumptions.push('Current presence delays immediate delivery. This shows current eligible character context, not an exact future scheduled prompt.')
 // Revalidate these sources after async counting in the service before exposing content.
 return {preview:{...plan,resolvedAt:new Date(now).toISOString(),scenario:input.scenario,responder:sources.speaker,natural,assumptions,tokenization:{model:typeof tokenResult.model==='string'?tokenResult.model:settings.model||sources.connection.model,approximate:typeof tokenResult.approximate==='boolean'?tokenResult.approximate:null,tokenizerName:typeof tokenResult.tokenizer_name==='string'?tokenResult.tokenizer_name:null},parameters:{max_tokens:settings.outputTokens,temperature:0.8,...(settings.model?{model:settings.model}:{})},reasoning:{source:'off'}},sources,ids,promptRoom,allowBehavior}
}
export function sourceSignature(sources:Awaited<ReturnType<typeof resolveGenerationSources>>):string {
 // Secrets are compared privately for changes, never returned or logged.
 return JSON.stringify({connection:sources.connection,characters:sources.characters.map(c=>({id:c.id,name:c.name,description:c.description,personality:c.personality,scenario:c.scenario})),speaker:sources.speaker,preset:sources.preset})
}
