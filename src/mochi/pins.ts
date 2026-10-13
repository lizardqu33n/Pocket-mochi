import type { MochiRoom, MochiSystemNote } from './types.js'
import { replyIdentifier } from './replies.js'

export const MAX_CHAT_PINS=50, MAX_SYSTEM_NOTES=8, MAX_NOTE_BODY=2000, MAX_NOTE_TOTAL=8000
export function noteId(value:unknown):string {
 if(typeof value!=='string'||!/^note_[a-f0-9]{32}$/.test(value))throw Error('Invalid system note identifier.')
 return value
}
export function validateNote(value:unknown):MochiSystemNote {
 if(!value||typeof value!=='object')throw Error('Invalid system note; saved content was preserved.')
 const n=value as Record<string,unknown>;noteId(n.id)
 if(typeof n.title!=='string'||!n.title.trim()||n.title.length>80||typeof n.body!=='string'||!n.body.trim()||n.body.length>MAX_NOTE_BODY||typeof n.enabled!=='boolean')throw Error('Invalid system note; saved content was preserved.')
 return {id:noteId(n.id),title:n.title,body:n.body,enabled:n.enabled}
}
export function validatePinnedContent(room:MochiRoom):void {
 if(room.chatPins!==undefined){
  if(!Array.isArray(room.chatPins)||room.chatPins.length>MAX_CHAT_PINS||new Set(room.chatPins).size!==room.chatPins.length||room.chatPins.some(id=>!replyIdentifier(id)))throw Error('Invalid chat pins; saved history was preserved.')
 }
 if(room.systemNotes!==undefined){
  if(!Array.isArray(room.systemNotes)||room.systemNotes.length>MAX_SYSTEM_NOTES)throw Error('Invalid system notes; saved content was preserved.')
  const notes=room.systemNotes.map(validateNote)
  if(new Set(notes.map(n=>n.id)).size!==notes.length||notes.reduce((total,n)=>total+n.body.length,0)>MAX_NOTE_TOTAL)throw Error('System note limits exceeded; saved content was preserved.')
 }
}
// Dedicated section boundary: a future preset may place this once instead of the default.
export function resolveSystemNotes(room:MochiRoom):Array<{role:'system';content:string}> {
 validatePinnedContent(room)
 return (room.systemNotes||[]).filter(n=>n.enabled).map(n=>({role:'system',content:`ROOM SYSTEM NOTE (${JSON.stringify(n.title)}):\n${n.body}`}))
}
