import type {MochiRoom} from './types.js'
import {replyIdentifier} from './replies.js'

export const SEARCH_PAGE_SIZE=30, SEARCH_QUERY_MAX=200
export interface SearchResult {id:string;name:string;excerpt:string;createdAt:string;position:number}
export interface SearchPage {query:string;sender:string;offset:number;total:number;nextOffset?:number;results:SearchResult[]}
export function searchQuery(value:unknown):string {
 if(typeof value!=='string'||value.length>SEARCH_QUERY_MAX)throw Error('Search text must be at most 200 characters.')
 return value.trim()
}
export function messageSender(message:any):string|undefined {
 if(message?.role==='user')return 'user'
 if(message?.role==='assistant'&&replyIdentifier(message.characterId))return 'character:'+message.characterId
}
function excerpt(text:string,index:number):string {
 const start=Math.max(0,index-60),end=Math.min(text.length,start+240)
 return (start?'…':'')+text.slice(start,end)+(end<text.length?'…':'')
}
/** One immutable, owned room snapshot. Plain text only; no index or storage mutations. */
export async function searchRoom(room:MochiRoom,input:any):Promise<SearchPage> {
 const query=searchQuery(input.query),sender=input.sender??'',offset=input.offset??0
 if(typeof sender!=='string'||sender!==''&&sender!=='user'&&(!sender.startsWith('character:')||!replyIdentifier(sender.slice(10))))throw Error('Invalid search sender.')
 if(!Number.isSafeInteger(offset)||offset<0||offset>room.messages.length)throw Error('Invalid search page. Repeat the search.')
 const results:SearchResult[]=[],needle=query.toLowerCase();let total=0
 if(!query)return{query,sender,offset:0,total:0,results}
 // Ambiguous IDs cannot navigate safely. Track only matching IDs, not another room's content.
 const ids=new Map<string,number>()
 for(let i=0;i<room.messages.length;i++){
  const m:any=room.messages[i];if(replyIdentifier(m?.id))ids.set(m.id,(ids.get(m.id)||0)+1)
  if(i&&i%512===0)await new Promise<void>(resolve=>setTimeout(resolve,0))
 }
 for(let i=room.messages.length-1;i>=0;i--){
  const m:any=room.messages[i]
  if(m&&ids.get(m.id)===1&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&typeof m.name==='string'&&typeof m.createdAt==='string'&&(!sender||messageSender(m)===sender)){
   const found=m.content.toLowerCase().indexOf(needle)
   if(found>=0){if(total>=offset&&results.length<SEARCH_PAGE_SIZE)results.push({id:m.id,name:m.name.slice(0,120),excerpt:excerpt(m.content,found),createdAt:m.createdAt.slice(0,80),position:i+1});total++}
  }
  if(i%512===0)await new Promise<void>(resolve=>setTimeout(resolve,0))
 }
 return{query,sender,offset,total,results,...(offset+results.length<total?{nextOffset:offset+results.length}:{})}
}
