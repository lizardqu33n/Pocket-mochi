import type {SummarySuggestion} from './summarization.js'
import {el,button,requestId} from '../frontend/shared.js'
import type {MochiRoom} from './types.js'
import {MAX_SUMMARY_TEXT,MAX_SUMMARY_VERSIONS,currentSummary,type ConversationMemory} from './memory.js'
const scope=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
interface Draft {suggestionId?:string;text:string;enabled:boolean;excludeCovered:boolean;boundaryId:string;revision:number;baseline:string}
export class MochiMemoryPanel {
 generating=false;suggestion?:SummarySuggestion;private suggestionDrafts=new Map<string,SummarySuggestion>();private summaryTicket='';private summaryTimer?:ReturnType<typeof setTimeout>;private summaryBoundaryId='';private useCurrent=false;
 open=false;status='';memory?:ConversationMemory;valid=false;reason='';draft?:Draft
 private root?:HTMLElement;private loadedRevision=0;private focusEditor=false;private key='';private ticket='';private base=0;private submitted=false;private applyingSuggestionId?:string;private timer?:ReturnType<typeof setTimeout>;private drafts=new Map<string,Draft>()
 constructor(private send:(p:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private applied:(p:any)=>void,private returned:()=>void,private taskChanged:(id:string,running:boolean)=>void=()=>{},private unavailable:()=>boolean=()=>false){}
 private renderAgain():void{
  const tree=this.root?.getRootNode() as Document|ShadowRoot|undefined,active=tree?.activeElement
  const label=active&&this.root?.contains(active)?active.getAttribute('aria-label'):null
  const selection=active?.tagName==='TEXTAREA'?[(active as HTMLTextAreaElement).selectionStart,(active as HTMLTextAreaElement).selectionEnd]:undefined
  this.redraw()
  if(label){const target=Array.from(this.root?.querySelectorAll<HTMLElement>('[aria-label]')||[]).find(n=>n.getAttribute('aria-label')===label);target?.focus({preventScroll:true});if(selection&&target?.tagName==='TEXTAREA')(target as HTMLTextAreaElement).setSelectionRange(selection[0],selection[1])}
 }
 reset(privateState=false):void{this.stopSummary();clearTimeout(this.timer);this.ticket='';this.applyingSuggestionId=undefined;this.open=false;this.key='';this.draft=undefined;this.memory=undefined;this.valid=false;this.reason='';this.focusEditor=false;this.loadedRevision=0;this.root=undefined;this.status='';this.suggestion=undefined;this.summaryBoundaryId='';this.useCurrent=false;if(privateState){this.drafts.clear();this.suggestionDrafts.clear()}}
 show(room:MochiRoom):void{if(this.key!==scope(room))this.reset();this.key=scope(room);this.open=true;this.draft=this.drafts.get(this.key);this.suggestion=this.suggestionDrafts.get(this.key);this.request({action:'read'})}
 private stopSummary():void{
  const ticket=this.summaryTicket,room=this.current();clearTimeout(this.summaryTimer);this.summaryTicket='';this.generating=false
  if(ticket){if(room&&scope(room)===this.key)try{this.send({type:'mochi:cancel',roomId:room.id,accountId:room.accountId,generationRequestId:ticket})}catch{}this.taskChanged(ticket,false)}
 }
 private generate():void{
  const room=this.current();if(!room||!this.open||scope(room)!==this.key||this.generating||this.ticket||this.unavailable()||!this.summaryBoundaryId)return
  this.summaryTicket=requestId('mochi_summary');const ticket=this.summaryTicket;this.generating=true;this.status='Generating one summary suggestion. Saved memory is unchanged.';this.taskChanged(ticket,true);this.renderAgain()
  this.summaryTimer=setTimeout(()=>{if(this.summaryTicket===ticket){this.stopSummary();this.status='Summary generation timed out. Your saved memory and previous draft are unchanged.';this.renderAgain()}},185000)
  try{this.send({type:'mochi:summary_generate',requestId:ticket,roomId:room.id,accountId:room.accountId,associationRevision:room.associationRevision||0,revision:room.revision,boundaryId:this.summaryBoundaryId,useCurrent:this.useCurrent})}catch{this.stopSummary();this.status='Summary generation is unavailable. Your draft is retained.';this.renderAgain()}
 }
 private receiveSummary(p:any):boolean|undefined{
  const types=['mochi:summary_started','mochi:summary_suggestion','mochi:error','mochi:job_finished']
  if(!types.includes(p?.type))return
  if(!this.summaryTicket||p.requestId!==this.summaryTicket)return p.type.startsWith('mochi:summary_')?true:undefined
  if(p.type==='mochi:job_finished'){this.taskChanged(this.summaryTicket,false);return}
  const room=this.current()
  if(!this.open||!room||scope(room)!==this.key)return true
  if(p.type==='mochi:summary_started')return true
  const ticket=this.summaryTicket;clearTimeout(this.summaryTimer);this.summaryTicket='';this.generating=false;this.taskChanged(ticket,false)
  if(p.type==='mochi:error')this.status=String(p.message||'Summary generation failed. Saved memory is unchanged.')
  else if(p.roomId===room.id&&p.accountId===room.accountId&&p.associationRevision===(room.associationRevision||0)&&p.suggestion?.roomId===room.id&&p.suggestion.accountId===room.accountId){this.suggestion=p.suggestion;this.suggestionDrafts.set(this.key,this.suggestion!);this.status='AI suggestion — not saved. Review, edit, then apply explicitly.'}
  else this.status='This suggestion belongs to an obsolete room scope and was discarded.'
  this.renderAgain();return true
 }
 private request(values:any):void{
  const room=this.current();if(!room||!this.open||scope(room)!==this.key||this.ticket)return
  this.submitted=values.action!=='read';this.applyingSuggestionId=typeof values.suggestionId==='string'?values.suggestionId:undefined;this.base=room.revision;this.ticket=requestId('mochi_memory');const ticket=this.ticket
  this.status=this.submitted?'Saving memory…':'Loading memory…';this.renderAgain()
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.ticket='';this.status='No response. Refresh and check saved versions before retrying.';this.renderAgain()}},20000)
  try{this.send({type:'mochi:memory',requestId:ticket,accountId:room.accountId,roomId:room.id,revision:room.revision,associationRevision:room.associationRevision||0,...values})}catch{clearTimeout(this.timer);this.ticket='';this.status='Memory is unavailable. Your draft is retained.';this.renderAgain()}
 }
 receive(p:any):boolean{
  const summary=this.receiveSummary(p);if(summary!==undefined)return summary
  if(p?.type!=='mochi:memory'&&p?.type!=='mochi:error')return false
  if(!this.ticket||p.requestId!==this.ticket)return p.type==='mochi:memory'
  clearTimeout(this.timer);this.ticket='';const room=this.current()
  if(!this.open||!room||scope(room)!==this.key)return true
  if(p.type==='mochi:error'){this.status=String(p.message);this.renderAgain();return true}
  if(p.roomId!==room.id||p.accountId!==room.accountId||p.associationRevision!==(room.associationRevision||0)||room.revision!==this.base&&room.revision!==p.revision||!this.submitted&&p.revision!==room.revision){this.status='Conversation changed. Refresh memory; your draft is retained.';this.renderAgain();return true}
  this.loadedRevision=p.revision;this.memory=p.memory;this.valid=p.valid;this.reason=p.reason
  if(this.submitted){if(this.applyingSuggestionId&&this.suggestion?.id===this.applyingSuggestionId){this.suggestionDrafts.delete(this.key);this.suggestion=undefined}this.drafts.delete(this.key);this.draft=undefined;this.applied(p)}
  this.status=this.submitted?(p.revision===this.base?'Memory already has this state. All saved versions are retained.':p.memory?.management?'Summary disabled or cleared. All saved versions are retained.':'Saved as a new memory version.')+(this.suggestion?' AI suggestion retained; Apply will revalidate its original source.':''):'Saved memory loaded. Editing does not contact AI.';this.renderAgain();return true
 }
 private start(room:MochiRoom):void{
  const v=currentSummary({...room,memory:this.memory}),last=room.messages.at(-1) as {id?:string}|undefined
  const value={text:v?.text||'',enabled:v?.enabled??true,excludeCovered:v?.excludeCovered??false,boundaryId:v?.coverage?.boundaryId||last?.id||'',revision:room.revision}
  this.focusEditor=true;this.draft={...value,baseline:JSON.stringify(value)};this.drafts.set(this.key,this.draft);this.renderAgain()
 }
 private confirm(anchor:HTMLButtonElement,label:string,action:()=>void):void{
  const warning=el('span','mochi-preview-warning','This changes future AI context and may cancel active/pending replies. '),yes=button(label,'lp-button'),no=button('Keep current memory','lp-button')
  yes.onclick=action;no.onclick=()=>this.renderAgain();warning.append(yes,no);anchor.replaceWith(warning);yes.focus()
 }
 render(room:MochiRoom):HTMLElement{
  if(scope(room)!==this.key){this.reset();return el('div')}
  const root=el('section','mochi-memory-panel');this.root=root;root.setAttribute('aria-label','Conversation Memory');root.append(el('h3','','Conversation Memory'),el('p','mochi-muted','A summary recalls this chat for AI. Original messages stay saved and searchable. AI suggestions are generated only when you ask, and saved only after review.'))
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');root.append(status)
  const refresh=button('Refresh memory','lp-button');refresh.disabled=!!this.ticket;refresh.onclick=()=>this.request({action:'read'});const close=button('Close memory','lp-button');const leave=()=>{this.reset();this.renderAgain();this.returned()};close.onclick=()=>{if(!this.generating){leave();return}const warning=el('span','mochi-preview-warning','A summary is still generating. Closing will cancel it. Saved memories stay intact. '),yes=button('Cancel summary & close','lp-button'),no=button('Stay here','lp-button');yes.onclick=leave;no.onclick=()=>{this.renderAgain();this.root?.querySelector<HTMLButtonElement>('button')?.focus()};warning.append(yes,no);close.replaceWith(warning);no.focus()};root.append(refresh,close)
  if(this.loadedRevision&&this.loadedRevision!==room.revision)root.append(el('p','mochi-preview-warning','Conversation changed. Refresh memory to recheck coverage; unsaved text is retained.'))
  const current=currentSummary({...room,memory:this.memory}),full=(this.memory?.versions.length||0)>=MAX_SUMMARY_VERSIONS||(room.receipts?.length||0)>=10000
  if(full)root.append(el('p','mochi-preview-warning','Memory history or receipt capacity is full. New summary versions and Restore are unavailable. Disable and Clear keep all saved versions and messages; discard an editor draft first to use them. History export/management is not yet implemented.'))
  if(current){root.append(el('p','',`Saved ${new Date(current.savedAt).toLocaleString()} · ${current.enabled?'Enabled':'Disabled'} · ${current.coverage?'Summarizes messages 1–'+current.coverage.count:'No covered messages'}`));if(this.memory?.management)root.append(el('p','mochi-muted',`Memory control changed ${new Date(this.memory.management.changedAt).toLocaleString()}; saved versions were not changed.`));if(current.coverage&&!this.valid)root.append(el('p','mochi-preview-warning',this.reason+' AI uses raw history with normal token trimming until reviewed.'));root.append(el('pre','mochi-memory-text',current.text||'Summary cleared from active use. All saved versions are retained.'))}
  const generation=el('section','mochi-memory-version');generation.setAttribute('aria-label','AI summary generation');generation.append(el('h4','','1. Choose messages · 2. Generate suggestion'))
  if(!this.summaryBoundaryId){const last=room.messages.at(-1) as {id?:string}|undefined;this.summaryBoundaryId=this.draft?.boundaryId||last?.id||''}
  const end=el('input');end.type='number';end.min='1';end.max=String(room.messages.length);end.step='1';end.setAttribute('aria-label','AI summary ending message');const endIndex=room.messages.findIndex(m=>typeof m==='object'&&m!==null&&'id'in m&&m.id===this.summaryBoundaryId);end.value=endIndex<0?'':String(endIndex+1);end.disabled=this.generating
  const sourceLabel=el('label','','Summarize from the start through message');sourceLabel.append(end);generation.append(sourceLabel)
  end.oninput=()=>{const i=Number(end.value),m=Number.isSafeInteger(i)&&i>0?room.messages[i-1] as {id?:string}|undefined:undefined;this.summaryBoundaryId=typeof m?.id==='string'?m.id:''}
  const reference=el('input');reference.type='checkbox';reference.checked=this.useCurrent;reference.setAttribute('aria-label','Use verified current summary as optional reference');reference.disabled=this.generating;reference.onchange=()=>{this.useCurrent=reference.checked};const referenceLabel=el('label','','Use verified current summary as optional reference');referenceLabel.prepend(reference);generation.append(referenceLabel)
  const generate=button('Generate summary','lp-button');generate.setAttribute('aria-label','Generate summary');generate.disabled=this.generating||!!this.ticket||this.unavailable()||!room.messages.length;generate.onclick=()=>{if(this.suggestion){const yes=button('Confirm generate a replacement suggestion','lp-button');yes.onclick=()=>this.generate();generate.replaceWith(yes);yes.focus()}else this.generate()};const stop=button('Stop summary','lp-button');stop.setAttribute('aria-label','Stop summary');stop.hidden=!this.generating;stop.disabled=!this.generating;stop.onclick=()=>{this.stopSummary();this.status='Summary stopped. Your saved memory and draft are unchanged.';this.renderAgain()};generation.append(generate,stop,el('p','mochi-muted','One request, full chosen prefix. Oversized ranges are rejected rather than silently trimmed.'))
  root.append(generation)
  if(this.suggestion){
   const suggestion=this.suggestion,preview=el('section','mochi-memory-version');preview.append(el('h4','','3. Review AI suggestion — not saved'),el('p','mochi-muted',`Messages 1–${suggestion.coverage.count} · generated ${new Date(suggestion.createdAt).toLocaleString()} · input ${suggestion.budget.inputTokens}, output reserve ${suggestion.budget.outputTokens}, budget ${suggestion.budget.contextTokens}. ${suggestion.budget.approximate===true?'Host token count is approximate.':''}`))
   const body=el('textarea');body.rows=6;body.maxLength=MAX_SUMMARY_TEXT;body.value=suggestion.text;body.disabled=this.generating;body.setAttribute('aria-label','AI summary suggestion');body.oninput=()=>{suggestion.text=body.value};preview.append(body)
   const use=button('Use suggestion in summary editor','lp-button');use.disabled=!!this.ticket||this.generating
   const replace=()=>{const value={text:suggestion.text,enabled:current?.enabled??true,excludeCovered:current?.excludeCovered??false,boundaryId:suggestion.coverage.boundaryId,revision:room.revision};this.draft={...value,suggestionId:suggestion.id,baseline:JSON.stringify(value)};this.drafts.set(this.key,this.draft);this.focusEditor=true;this.renderAgain()}
   use.onclick=()=>{if(this.draft){const yes=button('Confirm replace unsaved summary draft','lp-button');yes.onclick=replace;use.replaceWith(yes);yes.focus()}else replace()}
   const discard=button('Discard AI suggestion','lp-button');discard.onclick=()=>{const yes=button('Confirm discard AI suggestion','lp-button');yes.onclick=()=>{this.suggestionDrafts.delete(this.key);this.suggestion=undefined;this.renderAgain()};discard.replaceWith(yes);yes.focus()};preview.append(use,discard);root.append(preview)
  }
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
   const dirty=el('p','mochi-muted','Draft — not applied. Save creates a new version.');dirty.setAttribute('role','status');const save=button(d.suggestionId?'Apply summary as new version':'Save summary version','lp-button');save.title='Save reviewed memory to this conversation; generating or using a suggestion does not save it.';save.type='submit';save.disabled=full||!!this.ticket||!d.suggestionId&&d.revision!==room.revision
   if(!d.suggestionId&&d.revision!==room.revision){form.append(el('p','mochi-preview-warning','Conversation changed. Review the saved messages and covered boundary before saving.'));const review=button('Use refreshed conversation revision','lp-button');review.onclick=()=>{d.revision=room.revision;this.renderAgain()};form.append(review)}
   if(this.ticket&&this.submitted)for(const control of form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLButtonElement>('input,textarea,button'))control.disabled=true
   form.onsubmit=e=>{e.preventDefault();if(full||!d.suggestionId&&d.revision!==room.revision||!d.boundaryId)return;this.confirm(save,'Confirm save summary',()=>this.request({action:'save',text:d.text,enabled:d.enabled,excludeCovered:d.excludeCovered,boundaryId:d.boundaryId,...(d.suggestionId?{suggestionId:d.suggestionId}:{}),confirmed:true}))}
   if(d.suggestionId){form.append(el('p','mochi-muted','AI-based draft. Apply revalidates the original source; changed coverage requires regeneration or explicit manual review.'));const manual=button('Review as a manual draft','lp-button');manual.disabled=!!this.ticket;manual.onclick=()=>{const yes=button('Confirm manual review of text and covered messages','lp-button');yes.onclick=()=>{delete d.suggestionId;d.revision=room.revision;this.renderAgain()};manual.replaceWith(yes);yes.focus()};form.append(manual)}
   const discard=button('Discard summary draft','lp-button');discard.disabled=!!this.ticket;discard.onclick=()=>{const yes=button('Confirm discard draft','lp-button');yes.onclick=()=>{this.drafts.delete(this.key);this.draft=undefined;this.renderAgain()};discard.replaceWith(yes);yes.focus()};form.append(dirty,save,discard);root.append(form)
  }
  if(current&&!this.draft){for(const [action,label]of [['disable','Disable summary'],['clear','Clear current summary']] as const){const b=button(label,'lp-button');b.disabled=!!this.ticket||action==='disable'&&!current.enabled;b.onclick=()=>this.confirm(b,'Confirm '+label.toLowerCase(),()=>this.request({action,confirmed:true}));root.append(b)}}
  if(this.memory){const history=el('details');history.append(el('summary','',`Previous versions (${this.memory.versions.length}/100 retained)`));for(const [i,v]of this.memory.versions.entries()){const row=el('section','mochi-memory-version');row.append(el('h4','',`Version ${i+1} · ${new Date(v.savedAt).toLocaleString()}${v.id===this.memory.currentId?' · Selected saved version':''}`),el('p','mochi-muted',`${v.enabled?'Enabled when saved':'Disabled when saved'} · ${v.coverage?'Messages 1–'+v.coverage.count:'Cleared'}${v.restoredFrom?' · Restored copy':''}`),el('pre','mochi-memory-text',v.text||'Cleared'));const restore=button('Restore version '+(i+1),'lp-button');restore.disabled=full||!!this.ticket||!!this.draft;restore.onclick=()=>this.confirm(restore,'Confirm restore as new version',()=>this.request({action:'restore',versionId:v.id,confirmed:true}));row.append(restore);history.append(row)}root.append(history)}
  return root
 }
}
export const MOCHI_MEMORY_STYLES=`.mochi-view .mochi-memory-panel{min-width:0;min-height:0;max-height:70%;overflow:auto;flex:0 1 auto;border:1px solid var(--mochi-border);border-radius:12px;margin:6px;padding:10px;background:var(--lp-surface-1,transparent);overflow-wrap:anywhere}.mochi-view .mochi-memory-editor{display:grid;gap:10px;min-width:0}.mochi-view .mochi-memory-editor label{display:grid;gap:5px;min-width:0}.mochi-view .mochi-memory-panel textarea,.mochi-view .mochi-memory-panel input[type=number]{box-sizing:border-box;width:100%;min-width:0;max-width:100%;font:inherit;color:inherit;background:var(--lp-surface-2,#ffffff0c);border:1px solid var(--mochi-border);border-radius:8px;padding:8px}.mochi-view .mochi-memory-panel button{min-height:40px;max-width:100%;white-space:normal;margin:3px}.mochi-view .mochi-memory-text{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;max-height:240px;overflow:auto}.mochi-view .mochi-memory-version{border:1px solid var(--mochi-border);border-radius:8px;padding:8px;margin:8px 0}.mochi-view .mochi-memory-panel :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}`
