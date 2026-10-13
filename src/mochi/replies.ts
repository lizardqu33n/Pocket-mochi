import type { MochiMessage } from './types.js'
export function replyIdentifier(value:unknown):value is string{return typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,180}$/.test(value)}
/** Resolve only a unique message in the already authenticated/scoped room. */
export function referencedMessage(messages:unknown[],id:unknown):MochiMessage|undefined {
  if(!replyIdentifier(id))return
  const matches=messages.filter((m):m is MochiMessage=>typeof m==='object'&&m!==null&&'id'in m&&m.id===id)
  const m=matches.length===1?matches[0]:undefined
  return m&&['user','assistant'].includes(m.role)&&typeof m.name==='string'&&typeof m.content==='string'?m:undefined
}
export const quoteExcerpt=(content:string,limit=220)=>content.replace(/\s+/g,' ').slice(0,limit)+(content.replace(/\s+/g,' ').length>limit?'…':'')
