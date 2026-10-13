import {el,button,requestId} from '../frontend/shared.js'
import type {MochiRoom} from './types.js'
import {MAX_SUMMARY_TEXT,type ConversationMemory} from './memory.js'
const scope=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
interface Draft {text:string;enabled:boolean;excludeCovered:boolean;boundaryId:string;revision:number;baseline:string}
export class MochiMemoryPanel {
 open=false;status='';memory?:ConversationMemory;valid=false;reason='';draft?:Draft
 private root?:HTMLElement;private loadedRevision=0;private focusEditor=false;private key='';private ticket='';private base=0;private submitted=false;private timer?:ReturnType<typeof setTimeout>;private drafts=new Map<string,Draft>()
 constructor(private send:(p:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private applied:(p:any)=>void,private returned:()=>void){}
 private renderAgain():void{
  const tree=this.root?.getRootNode() as Document|ShadowRoot|undefined,active=tree?.activeElement
  const label=active&&this.root?.contains(active)?active.getAttribute('aria-label'):null
  const selection=active?.tagName==='TEXTAREA'?[(active as HTMLTextAreaElement).selectionStart,(active as HTMLTextAreaElement).selectionEnd]:undefined
  this.redraw()
  if(label){const target=Array.from(this.root?.querySelectorAll<HTMLElement>('[aria-label]')||[]).find(n=>n.getAttribute('aria-label')===label);target?.focus({preventScroll:true});if(selection&&target?.tagName==='TEXTAREA')(target as HTMLTextAreaElement).setSelectionRange(selection[0],selection[1])}
 }
 reset(privateState=false):void{clearTimeout(this.timer);this.ticket='';this.open=false;this.key='';this.draft=undefined;this.memory=undefined;this.valid=false;this.reason='';this.focusEditor=false;this.loadedRevision=0;this.root=undefined;this.status='';if(privateState)this.drafts.clear()}
 show(room:MochiRoom):void{if(this.key!==scope(room))this.reset();this.key=scope(room);this.open=true;this.draft=this.drafts.get(this.key);this.request({action:'read'})}
 private request(values:any):void{
  const room=this.current();if(!room||!this.open||scope(room)!==this.key||this.ticket)return
  this.submitted=values.action!=='read';this.base=room.revision;this.ticket=requestId('mochi_memory');const ticket=this.ticket
  this.status=this.submitted?'Saving memory…':'Loading memory…';this.renderAgain()
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.ticket='';this.status='No response. Refresh and check saved versions before retrying.';this.renderAgain()}},20000)
  try{this.send({type:'mochi:memory',requestId:ticket,accountId:room.accountId,roomId:room.id,revision:room.revision,associationRevision:room.associationRevision||0,...values})}catch{clearTimeout(this.timer);this.ticket='';this.status='Memory is unavailable. Your draft is retained.';this.renderAgain()}
 }
 receive(p:any):boolean{
  if(p?.type!=='mochi:memory'&&p?.type!=='mochi:error')return false
  if(!this.ticket||p.requestId!==this.ticket)return p.type==='mochi:memory'
  clearTimeout(this.timer);this.ticket='';const room=this.current()
  if(!this.open||!room||scope(room)!==this.key)return true
  if(p.type==='mochi:error'){this.status=String(p.message);this.renderAgain();return true}
  if(p.roomId!==room.id||p.accountId!==room.accountId||p.associationRevision!==(room.associationRevision||0)||room.revision!==this.base&&room.revision!==p.revision||!this.submitted&&p.revision!==room.revision){this.status='Conversation changed. Refresh memory; your draft is retained.';this.renderAgain();return true}
  this.loadedRevision=p.revision;this.memory=p.memory;this.valid=p.valid;this.reason=p.reason
  if(this.submitted){this.drafts.delete(this.key);this.draft=undefined;this.applied(p)}
  this.status=this.submitted?'Saved as a new memory version.':'Saved memory loaded. Editing does not contact AI.';this.renderAgain();return true
 }
 private start(room:MochiRoom):void{
  const v=this.memory?.versions.find(v=>v.id===this.memory!.currentId),last=room.messages.at(-1) as {id?:string}|undefined
  const value={text:v?.text||'',enabled:v?.enabled??true,excludeCovered:v?.excludeCovered??false,boundaryId:v?.coverage?.boundaryId||last?.id||'',revision:room.revision}
  this.focusEditor=true;this.draft={...value,baseline:JSON.stringify(value)};this.drafts.set(this.key,this.draft);this.renderAgain()
 }
 private confirm(anchor:HTMLButtonElement,label:string,action:()=>void):void{
  const warning=el('span','mochi-preview-warning','This changes future AI context and may cancel active/pending replies. '),yes=button(label,'lp-button'),no=button('Keep current memory','lp-button')
  yes.onclick=action;no.onclick=()=>this.renderAgain();warning.append(yes,no);anchor.replaceWith(warning);yes.focus()
 }
 render(room:MochiRoom):HTMLElement{
  if(scope(room)!==this.key){this.reset();return el('div')}
  const root=el('section','mochi-memory-panel');this.root=root;root.setAttribute('aria-label','Conversation Memory');root.append(el('h3','','Conversation Memory'),el('p','mochi-muted','A summary recalls this chat for AI. Original messages stay saved and searchable. No AI summarization runs here.'))
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');root.append(status)
  const refresh=button('Refresh memory','lp-button');refresh.disabled=!!this.ticket;refresh.onclick=()=>this.request({action:'read'});const close=button('Close memory','lp-button');close.onclick=()=>{this.reset();this.renderAgain();this.returned()};root.append(refresh,close)
  if(this.loadedRevision&&this.loadedRevision!==room.revision)root.append(el('p','mochi-preview-warning','Conversation changed. Refresh memory to recheck coverage; unsaved text is retained.'))
  const current=this.memory?.versions.find(v=>v.id===this.memory!.currentId)
  if(current){root.append(el('p','',`Saved ${new Date(current.savedAt).toLocaleString()} · ${current.enabled?'Enabled':'Disabled'} · ${current.coverage?'Summarizes messages 1–'+current.coverage.count:'No covered messages'}`));if(current.coverage&&!this.valid)root.append(el('p','mochi-preview-warning',this.reason+' AI uses raw history with normal token trimming until reviewed.'));root.append(el('pre','mochi-memory-text',current.text||'Summary cleared. Earlier versions remain recoverable.'))}
  if(!this.draft){const edit=button(current?'Edit current summary':'Create summary','lp-button');edit.disabled=!!this.ticket||!room.messages.length;edit.onclick=()=>{this.start(room)};root.append(edit);if(!room.messages.length)root.append(el('p','mochi-muted','Save a conversation message before selecting summary coverage.'))}
  else{
   const d=this.draft,form=el('form','mochi-memory-editor'),body=el('textarea');body.rows=7;body.maxLength=MAX_SUMMARY_TEXT;body.required=true;body.value=d.text;body.setAttribute('aria-label','Summary text');body.oninput=()=>{d.text=body.value;dirty.textContent='Unsaved summary changes — Save creates a new version.'}
   if(this.focusEditor){this.focusEditor=false;queueMicrotask(()=>{if(this.open&&body.isConnected)body.focus()})}
   const label=el('label','','Summary — recalled information');label.append(body);form.append(label)
   const boundary=el('input');boundary.type='number';boundary.min='1';boundary.max=String(room.messages.length);boundary.step='1';boundary.required=true;boundary.setAttribute('aria-label','Summarizes through message number')
   const index=room.messages.findIndex(m=>typeof m==='object'&&m!==null&&'id'in m&&m.id===d.boundaryId);boundary.value=index<0?'':String(index+1)
   const selected=el('p','mochi-muted'),describe=()=>{const m=room.messages.find(m=>typeof m==='object'&&m!==null&&'id'in m&&m.id===d.boundaryId) as {name?:string;content?:string}|undefined;selected.textContent=m?`${m.name||'Sender'}: ${(m.content||'').slice(0,160)}`:'Select an available covered message.'};describe()
   boundary.oninput=()=>{const n=Number(boundary.value),m=Number.isSafeInteger(n)&&n>0?room.messages[n-1] as {id?:string}|undefined:undefined;d.boundaryId=typeof m?.id==='string'?m.id:'';describe();dirty.textContent='Unsaved coverage changes — Save validates this exact message boundary.'}
   const range=el('label','','Cover from the start through message');range.append(boundary);form.append(range,selected)
   for(const [key,text]of [['enabled','Use summary in AI context'],['excludeCovered','Exclude summarized messages from AI context']] as const){const check=el('input');check.type='checkbox';check.setAttribute('aria-label',text);check.checked=d[key];check.onchange=()=>{d[key]=check.checked;dirty.textContent='Unsaved memory options.'};const label=el('label','',text);label.prepend(check);form.append(label)}
   form.append(el('small','mochi-muted','Exclusion is off by default and requires verified coverage plus a summary actually included in the prompt. Manual presets need a standalone {{mochi_summary}} row.'))
   const dirty=el('p','mochi-muted','Draft — not applied. Save creates a new version.');dirty.setAttribute('role','status');const save=button('Save summary version','lp-button');save.type='submit';save.disabled=!!this.ticket||d.revision!==room.revision
   if(d.revision!==room.revision){form.append(el('p','mochi-preview-warning','Conversation changed. Review the saved messages and covered boundary before saving.'));const review=button('Use refreshed conversation revision','lp-button');review.onclick=()=>{d.revision=room.revision;this.renderAgain()};form.append(review)}
   if(this.ticket&&this.submitted)for(const control of form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLButtonElement>('input,textarea,button'))control.disabled=true
   form.onsubmit=e=>{e.preventDefault();if(d.revision!==room.revision||!d.boundaryId)return;this.confirm(save,'Confirm save summary',()=>this.request({action:'save',text:d.text,enabled:d.enabled,excludeCovered:d.excludeCovered,boundaryId:d.boundaryId,confirmed:true}))}
   const discard=button('Discard summary draft','lp-button');discard.disabled=!!this.ticket;discard.onclick=()=>{const yes=button('Confirm discard draft','lp-button');yes.onclick=()=>{this.drafts.delete(this.key);this.draft=undefined;this.renderAgain()};discard.replaceWith(yes);yes.focus()};form.append(dirty,save,discard);root.append(form)
  }
  if(current&&!this.draft){for(const [action,label]of [['disable','Disable summary'],['clear','Clear current summary']] as const){const b=button(label,'lp-button');b.disabled=!!this.ticket||action==='disable'&&!current.enabled;b.onclick=()=>this.confirm(b,'Confirm '+label.toLowerCase(),()=>this.request({action,confirmed:true}));root.append(b)}}
  if(this.memory){const history=el('details');history.append(el('summary','',`Previous versions (${this.memory.versions.length}/100 retained)`));for(const [i,v]of this.memory.versions.entries()){const row=el('section','mochi-memory-version');row.append(el('h4','',`Version ${i+1} · ${new Date(v.savedAt).toLocaleString()}${v.id===this.memory.currentId?' · Current':''}`),el('p','mochi-muted',`${v.enabled?'Enabled':'Disabled'} · ${v.coverage?'Messages 1–'+v.coverage.count:'Cleared'}${v.restoredFrom?' · Restored copy':''}`),el('pre','mochi-memory-text',v.text||'Cleared'));const restore=button('Restore version '+(i+1),'lp-button');restore.disabled=!!this.ticket||!!this.draft;restore.onclick=()=>this.confirm(restore,'Confirm restore as new version',()=>this.request({action:'restore',versionId:v.id,confirmed:true}));row.append(restore);history.append(row)}root.append(history)}
  return root
 }
}
export const MOCHI_MEMORY_STYLES=`.mochi-view .mochi-memory-panel{min-width:0;min-height:0;max-height:70%;overflow:auto;flex:0 1 auto;border:1px solid var(--mochi-border);border-radius:12px;margin:6px;padding:10px;background:var(--lp-surface-1,transparent);overflow-wrap:anywhere}.mochi-view .mochi-memory-editor{display:grid;gap:10px;min-width:0}.mochi-view .mochi-memory-editor label{display:grid;gap:5px;min-width:0}.mochi-view .mochi-memory-editor textarea,.mochi-view .mochi-memory-editor input[type=number]{box-sizing:border-box;width:100%;min-width:0;max-width:100%;font:inherit;color:inherit;background:var(--lp-surface-2,#ffffff0c);border:1px solid var(--mochi-border);border-radius:8px;padding:8px}.mochi-view .mochi-memory-panel button{min-height:40px;max-width:100%;white-space:normal;margin:3px}.mochi-view .mochi-memory-text{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;max-height:240px;overflow:auto}.mochi-view .mochi-memory-version{border:1px solid var(--mochi-border);border-radius:8px;padding:8px;margin:8px 0}.mochi-view .mochi-memory-panel :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}`
