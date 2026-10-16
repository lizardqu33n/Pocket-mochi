import {MochiGenerationError} from './generation-errors.js'

export const RESPONSE_PROTOCOL='mochi.response'
export interface ResponseContext {speaker:string;eligibleIds:string[];natural:boolean}
export interface ResponseMessage {speakerId:string;text:string;behavior?:unknown}

/** Shared by generation and preview. Identity comes only from resolved host context. */
export function plainTextSpeaker(context:ResponseContext):string|undefined {
 const ids=[...new Set(context.eligibleIds)]
 return context.speaker==='auto'?(ids.length===1?ids[0]:undefined):ids.includes(context.speaker)?context.speaker:undefined
}
export function responseFormat(context:ResponseContext):string {
 const fixed=plainTextSpeaker(context)
 return `Mochi response contract: ${fixed?`For ordinary dialogue, return plain text only; Mochi attributes it to ${JSON.stringify(fixed)}. Preserve natural line breaks. You may also use legacy message JSON.`:'Multiple speakers are eligible and no single responder is selected. Return structured message JSON; plain text cannot identify a speaker.'} Legacy message JSON: {"speakerId":"exact eligible id","text":"message text"}. Never speak as the user or invent speaker IDs. Eligible IDs: ${JSON.stringify(context.eligibleIds)}. ${context.speaker==='auto'?'Choose only an eligible speaker.':'Required speakerId: '+JSON.stringify(context.speaker)+'.'} JSON objects/arrays or JSON fences are reserved for structured output; put literal JSON-looking dialogue inside the text field of message JSON. Do not request actions: the versioned mochi.response protocol has no active action handlers.`
}

/** Parse once, then validate the entire batch before the caller can persist anything. */
export function parseResponse(raw:unknown,limited:boolean,context:ResponseContext):ResponseMessage[] {
 if(raw===undefined||raw===null||typeof raw==='string'&&!raw.trim())throw new MochiGenerationError(limited?'output_limit':'empty_output')
 if(typeof raw!=='string')throw new MochiGenerationError('invalid_schema')
 const trimmed=raw.trim(),fence=/^```(?:json)?\s*\n?([\s\S]*?)\s*```$/i.exec(trimmed)
 const body=fence?fence[1]:trimmed
 // Containers, explicit JSON fences and the reserved protocol marker commit to validation.
 // JSON.parse supplies structural discrimination; this guard only protects malformed output.
 const structuredIntent=/^[{[]/.test(body)||/^```(?:json\b|\s*[{[])/i.test(trimmed)||body.includes('"protocol"')&&body.includes(RESPONSE_PROTOCOL)
 let parsed:any,decoded=false
 try{parsed=JSON.parse(body);decoded=true}catch{if(structuredIntent)throw new MochiGenerationError(limited?'output_limit':'malformed_json')}
 const plain=():ResponseMessage[]=>{
  if(limited)throw new MochiGenerationError('output_limit')
  const speaker=plainTextSpeaker(context)
  if(!speaker)throw new MochiGenerationError('ambiguous_response')
  if(raw.length>32000)throw new MochiGenerationError('invalid_schema')
  return [{speakerId:speaker,text:raw}]
 }
 if(!decoded)return plain()
 if(!parsed||typeof parsed!=='object'){
  if(plainTextSpeaker(context)&&!fence&&!structuredIntent)return plain()
  throw new MochiGenerationError('invalid_schema')
 }
 if(Array.isArray(parsed))throw new MochiGenerationError('invalid_schema')
 const own=(key:string)=>Object.hasOwn(parsed,key)
 let rows:any[]
 if(own('protocol')||own('version')||own('actions')){
  if(parsed.protocol!==RESPONSE_PROTOCOL||parsed.version!==1||!Array.isArray(parsed.messages)||Object.keys(parsed).some(k=>!['protocol','version','messages','actions'].includes(k)))throw new MochiGenerationError('invalid_schema')
  if(own('actions')&&(!Array.isArray(parsed.actions)||parsed.actions.length))throw new MochiGenerationError('unsupported_action')
  rows=parsed.messages
 }else{
  if(own('action'))throw new MochiGenerationError('unsupported_action')
  if(own('messages')&&!context.natural)throw new MochiGenerationError('invalid_schema')
  if(own('messages')&&!Array.isArray(parsed.messages))throw new MochiGenerationError('invalid_schema')
  rows=context.natural&&Array.isArray(parsed.messages)?parsed.messages:[parsed]
 }
 if(rows.length>(context.natural?3:1)||!context.natural&&!rows.length)throw new MochiGenerationError('invalid_schema')
 const seen=new Set<string>()
 return rows.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.speakerId!=='string')throw new MochiGenerationError('invalid_schema')
  if(Object.hasOwn(row,'actions')||Object.hasOwn(row,'action'))throw new MochiGenerationError('unsupported_action')
  if(!context.eligibleIds.includes(row.speakerId)||context.speaker!=='auto'&&row.speakerId!==context.speaker)throw new MochiGenerationError('ineligible_speaker')
  if(seen.has(row.speakerId)||typeof row.text!=='string'||!row.text.trim()||row.text.length>32000)throw new MochiGenerationError('invalid_schema')
  seen.add(row.speakerId)
  return {speakerId:row.speakerId,text:row.text.trim(),behavior:row.behavior}
 })
}
