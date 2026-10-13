import {button,el,requestId} from '../frontend/shared.js'
import type {MochiRoom} from './types.js'
import {messageSender,SEARCH_QUERY_MAX,searchQuery,type SearchPage} from './search.js'

const scopeKey=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
export class MochiSearch {
 open=false;query='';sender='';page?:SearchPage;status='Enter text to search this conversation.'
 private scope='';private revision=0
 private pending?:{id:string;scope:string;revision:number;viewRevision:number;target?:string}
 private pageRevision=0
 private senderOptions?:{scope:string;revision:number;values:Map<string,string>}
 private timer?:ReturnType<typeof setTimeout>
 constructor(private send:(payload:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private jump:(room:MochiRoom,id:string)=>void,private returned:()=>void=()=>{}){}
 cancel():void{clearTimeout(this.timer);this.pending=undefined}
 reset():void{this.cancel();this.open=false;this.query='';this.sender='';this.page=undefined;this.scope='';this.senderOptions=undefined;this.status='Enter text to search this conversation.'}
 sync(room:MochiRoom):void{
  const key=scopeKey(room)
  if(this.scope&&this.scope!==key)this.reset()
  if(this.scope===key&&this.revision!==room.revision&&(this.page||this.pending)){this.cancel();this.page=undefined;this.status='Conversation changed. Search again for current results.'}
  this.scope=key;this.revision=room.revision
 }
 show(room:MochiRoom):void{this.sync(room);this.open=true;this.redraw()}
 run(offset=0,target?:string):void{
  const room=this.current();if(!room||!this.open)return
  this.sync(room);this.cancel()
  let query:string;try{query=searchQuery(this.query)}catch(error){this.status=(error as Error).message;this.page=undefined;this.redraw();return}
  if(!query&&!target){this.page=undefined;this.status='Enter text to search this conversation.';this.redraw();return}
  const id=requestId('mochi_search');this.pending={id,scope:scopeKey(room),revision:target||offset?this.pageRevision:room.revision,viewRevision:room.revision,target}
  this.status=target?'Finding original message…':'Searching…';this.redraw()
  this.timer=setTimeout(()=>{if(this.pending?.id===id){this.cancel();this.page=undefined;this.status='Search did not respond. Try again.';this.redraw()}},20000)
  try{this.send({type:target?'mochi:search_target':'mochi:search',requestId:id,roomId:room.id,accountId:room.accountId,associationRevision:room.associationRevision||0,revision:this.pending.revision,...(target?{messageId:target}:{query,sender:this.sender,offset})})}
  catch{this.cancel();this.page=undefined;this.status='Search is unavailable. Try again.';this.redraw()}
 }
 receive(payload:any):boolean{
  if(!['mochi:search','mochi:search_target','mochi:error'].includes(payload?.type))return false
  const request=this.pending
  if(!request||payload.requestId!==request.id)return payload.type!=='mochi:error'
  const room=this.current();this.cancel()
  if(!this.open||!room||scopeKey(room)!==request.scope||room.revision!==request.viewRevision)return true
  if(payload.type==='mochi:error'){this.page=undefined;this.status=String(payload.message||'Search failed. Try again.');this.redraw();return true}
  if(payload.accountId!==room.accountId||payload.roomId!==room.id)return true
  if(payload.type==='mochi:search_target'){
   if(payload.messageId!==request.target||!payload.room||scopeKey(payload.room)!==request.scope||payload.room.revision!==request.revision)return true
   this.revision=payload.room.revision;this.status=`${this.page?.total||0} results · original message selected.`;this.jump(payload.room,payload.messageId);return true
  }
  if(payload.associationRevision!==(room.associationRevision||0)||payload.revision<room.revision)return true
  this.pageRevision=payload.revision;this.page=payload.page;this.status=this.page?.total?`${this.page.total} results · newest first`:'No matching messages.';this.redraw();return true
 }
 render(room:MochiRoom):HTMLElement{
  this.sync(room)
  const root=el('section','mochi-search-panel');root.setAttribute('aria-label','Search this conversation')
  const form=el('form','mochi-search-controls'),input=el('input');input.type='search';input.maxLength=SEARCH_QUERY_MAX;input.value=this.query;input.setAttribute('aria-label','Search conversation text')
  input.oninput=()=>{this.query=input.value;this.cancel();this.page=undefined;this.status='Press Search for current results.';const status=root.querySelector('[role=status]');if(status)status.textContent=this.status;root.querySelector('.mochi-search-results')?.replaceChildren()}
  const filter=el('select');filter.setAttribute('aria-label','Filter search by sender')
  const all=el('option','','All senders');all.value='';filter.append(all);const user=el('option','','You');user.value='user';filter.append(user)
  // Source names may change; matching always uses exact historical character IDs.
  if(!this.senderOptions||this.senderOptions.scope!==scopeKey(room)||this.senderOptions.revision!==room.revision){const values=new Map<string,string>();for(const raw of room.messages){const m:any=raw,key=messageSender(m);if(key?.startsWith('character:')&&typeof m.name==='string')values.set(key,m.name)}this.senderOptions={scope:scopeKey(room),revision:room.revision,values}}
  const senders=this.senderOptions.values
  for(const [id,name]of senders){const option=el('option','',name);option.value=id;filter.append(option)}filter.value=this.sender;filter.onchange=()=>{this.sender=filter.value;this.run()}
  const search=button('Search','lp-button');search.type='submit'
  const clear=button('Clear search','lp-button');clear.onclick=()=>{this.cancel();this.query='';this.sender='';this.page=undefined;this.status='Enter text to search this conversation.';this.redraw()}
  const close=button('Close search','lp-button');close.onclick=()=>{if(this.pending)this.status='Search canceled. Search again when ready.';this.cancel();this.open=false;this.redraw();this.returned()}
  form.onsubmit=e=>{e.preventDefault();this.run()};form.append(input,filter,search,clear,close);root.append(form)
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status)
  const results=el('div','mochi-search-results')
  for(const result of this.page?.results||[]){const entry=button('','mochi-search-result');entry.setAttribute('aria-label',`Go to message ${result.position} by ${result.name}`);entry.append(el('strong','',result.name),el('small','',`${new Date(result.createdAt).toLocaleString()} · Message ${result.position}`),el('span','',result.excerpt));entry.onclick=()=>this.run(0,result.id);results.append(entry)}
  if(this.page){const paging=el('div','mochi-search-paging');if(this.page.offset){const prev=button('Previous results','lp-button');prev.onclick=()=>this.run(Math.max(0,this.page!.offset-30));paging.append(prev)}if(this.page.nextOffset!==undefined){const next=button('Next results','lp-button');next.onclick=()=>this.run(this.page!.nextOffset);paging.append(next)}results.append(paging)}
  root.append(results);return root
 }
}
export const MOCHI_SEARCH_STYLES=`
.mochi-view .mochi-search-panel{flex:0 1 auto;min-height:0;max-height:40%;overflow:auto;border-bottom:1px solid var(--mochi-border);padding:10px;min-width:0}
.mochi-view .mochi-search-controls{display:flex;flex-wrap:wrap;gap:6px;min-width:0}.mochi-view .mochi-search-controls input{flex:1 1 160px;min-width:0}.mochi-view .mochi-search-controls select{max-width:100%;min-width:0}
.mochi-view .mochi-search-controls input,.mochi-view .mochi-search-controls select{box-sizing:border-box;background:var(--lp-surface-2,#ffffff0c);color:inherit;border:1px solid var(--mochi-border);border-radius:8px;padding:8px;font:inherit}
.mochi-view .mochi-search-results{display:grid;gap:6px;min-width:0}.mochi-view .mochi-search-result{display:grid;gap:4px;min-width:0;max-width:100%;text-align:left;overflow-wrap:anywhere;white-space:normal;background:var(--lp-surface-2,#ffffff0c);color:inherit;border:1px solid var(--mochi-border);border-radius:10px;padding:10px;cursor:pointer}.mochi-view .mochi-search-result strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mochi-view .mochi-search-result small{font-size:11px}
.mochi-view .mochi-search-paging{display:flex;gap:6px;flex-wrap:wrap}.mochi-view .mochi-search-panel button{min-height:40px}.mochi-view .mochi-search-panel :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}
`
