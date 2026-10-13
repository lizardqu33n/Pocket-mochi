import {el,button,requestId} from '../frontend/shared.js'
import {DEFAULT_PRESET_ID,type PresetBank,type ResolvedPreset,type MochiPreset} from './presets.js'
import type {MochiRoom} from './types.js'
const scope=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
interface Draft {action:'create'|'publish'|'rename';id?:string;name:string;dmInstructions:string;groupInstructions:string;revision:number;baseline:string}
export class MochiPresetPanel {
 open=false;bank?:PresetBank;effective?:ResolvedPreset;status='';draft?:Draft
 private ticket='';private key='';private timer?:ReturnType<typeof setTimeout>;private submitted=false
 private drafts=new Map<string,Draft>()
 constructor(private send:(p:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private bind:(id:string,revision:number)=>void,private returned:()=>void){}
 reset(privateState=false):void{clearTimeout(this.timer);this.ticket='';this.open=false;this.bank=undefined;this.effective=undefined;this.draft=undefined;this.key='';if(privateState)this.drafts.clear()}
 show(room:MochiRoom):void{if(this.key!==scope(room))this.reset();this.key=scope(room);this.draft=this.drafts.get(this.key);this.open=true;this.load()}
 load():void{this.request({action:'list'})}
 private request(values:any):void{
  const room=this.current();if(!room||!this.open||scope(room)!==this.key)return
  clearTimeout(this.timer);this.ticket=requestId('mochi_presets');const ticket=this.ticket;this.submitted=values.action!=='list';this.status='Loading presets…';this.redraw()
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.ticket='';this.status='No response. Refresh the library before retrying.';this.redraw()}},20000)
  try{this.send({type:'mochi:presets',requestId:ticket,roomId:room.id,accountId:room.accountId,...values})}catch{clearTimeout(this.timer);this.ticket='';this.status='Presets unavailable. Try refreshing.';this.redraw()}
 }
 receive(p:any):boolean{
  if(p?.type!=='mochi:presets'&&p?.type!=='mochi:error')return false
  if(!this.ticket||p.requestId!==this.ticket)return p.type==='mochi:presets'
  clearTimeout(this.timer);this.ticket='';const room=this.current();if(!this.open||!room||scope(room)!==this.key)return true
  if(p.type==='mochi:error'){this.status=String(p.message);this.redraw();return true}
  if(p.roomId!==room.id||p.accountId!==room.accountId||p.bank?.accountId!==room.accountId)return true
  this.bank=p.bank;this.effective=p.effective;this.status=this.submitted?'Library saved. Applying a revision to this chat is a separate action.':'Library loaded.'
  if(this.submitted){this.drafts.delete(this.key);this.draft=undefined}this.redraw();return true
 }
 private edit(action:Draft['action'],preset?:MochiPreset):void{
  if(!this.bank)return;const r=preset?.revisions.at(-1),value={action,id:preset?.id,name:preset?.name||'',dmInstructions:r?.dmInstructions||'',groupInstructions:r?.groupInstructions||'',revision:this.bank.revision}
  this.draft={...value,baseline:JSON.stringify(value)};this.drafts.set(this.key,this.draft);this.redraw()
 }
 render(room:MochiRoom):HTMLElement{
  if(this.key!==scope(room)){this.reset();return el('div')}
  const root=el('section','mochi-preset-panel');root.setAttribute('aria-label','Mochi presets');root.append(el('h3','','Mochi Presets'),el('p','mochi-muted','Published revisions stay fixed for each chat until you apply an update. Room instructions remain a separate override.'))
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');root.append(status)
  const refresh=button('Refresh preset library','lp-button');refresh.onclick=()=>this.load();const close=button('Close presets','lp-button');close.onclick=()=>{clearTimeout(this.timer);this.ticket='';this.open=false;this.redraw();this.returned()};root.append(refresh,close)
  const restore=button('Restore Mochi Default','lp-button');restore.onclick=()=>{const confirm=button('Confirm restore default','lp-button');confirm.onclick=()=>this.bind(DEFAULT_PRESET_ID,1);restore.replaceWith(confirm);confirm.focus()};root.append(restore,el('small','mochi-muted','Applying a preset or restoring Default may cancel this chat’s pending replies. Publishing alone does not.'))
  if(this.effective)root.append(el('p','',`Effective: ${this.effective.builtIn?'Built-in':'Custom'} · ${this.effective.name} · revision ${this.effective.revision}${this.effective.builtIn?' · built-in':''}`))
  if(this.bank){
   const select=el('select');select.setAttribute('aria-label','Preset to apply');const base=el('option','','Mochi Default · built-in');base.value=DEFAULT_PRESET_ID;select.append(base)
   for(const p of this.bank.presets.filter(p=>!p.archived||p.id===room.preset?.id)){const option=el('option','',`${p.name} · revision ${p.revisions.length}${p.archived?' · archived':''}`);option.value=p.id;select.append(option)}select.value=room.preset?.id||DEFAULT_PRESET_ID
   const apply=button('Apply selected preset','lp-button');apply.disabled=Boolean(this.ticket);apply.onclick=()=>{const id=select.value,p=this.bank!.presets.find(p=>p.id===id);const confirm=button('Confirm apply preset','lp-button');confirm.onclick=()=>this.bind(id,p?.revisions.length||1);apply.replaceWith(confirm);confirm.focus()};root.append(select,apply)
   const bound=this.bank.presets.find(p=>p.id===room.preset?.id);if(bound&&bound.revisions.length>room.preset!.revision){const update=button('Update to latest','lp-button');update.onclick=()=>{const confirm=button('Confirm update to latest','lp-button');confirm.onclick=()=>this.bind(bound.id,bound.revisions.length);update.replaceWith(confirm);confirm.focus()};root.append(update)}
   const create=button('Create preset','lp-button');create.disabled=Boolean(this.ticket)||Boolean(this.draft);create.onclick=()=>this.edit('create');const duplicate=button('Duplicate Mochi Default','lp-button');duplicate.disabled=Boolean(this.ticket)||Boolean(this.draft);duplicate.onclick=()=>this.request({action:'duplicate',id:DEFAULT_PRESET_ID,name:'Mochi Default copy',revision:this.bank!.revision});root.append(create,duplicate)
   if(!this.bank.presets.length)root.append(el('p','mochi-muted','No custom presets in this account yet.'))
   if(this.draft){
    const d=this.draft,form=el('form','mochi-preset-editor'),name=el('input');name.maxLength=80;name.required=true;name.value=d.name;name.readOnly=d.action==='publish';name.setAttribute('aria-label','Preset name');name.oninput=()=>{d.name=name.value}
    const dm=el('textarea'),group=el('textarea');dm.rows=3;group.rows=3;dm.maxLength=4000;group.maxLength=4000;dm.value=d.dmInstructions;group.value=d.groupInstructions;dm.setAttribute('aria-label','DM preset instructions');group.setAttribute('aria-label','Group preset instructions');dm.oninput=()=>{d.dmInstructions=dm.value};group.oninput=()=>{d.groupInstructions=group.value}
    const label=el('label','','Name');label.append(name);form.append(label)
    if(d.action!=='rename'){const dl=el('label','','DM instructions'),gl=el('label','','Group instructions');dl.append(dm);gl.append(group);form.append(dl,gl)}
    const publish=button(d.action==='rename'?'Save preset name':'Publish preset revision','lp-button');publish.type='submit';publish.disabled=Boolean(this.ticket);const cancel=button('Cancel preset editing','lp-button');cancel.onclick=()=>{const confirm=button('Discard preset draft','lp-button');confirm.onclick=()=>{this.drafts.delete(this.key);this.draft=undefined;this.redraw()};cancel.replaceWith(confirm);confirm.focus()}
    const dirty=el('small','mochi-muted','Draft retained in this session. Publish saves the library only; applying is separate.');dirty.setAttribute('role','status');form.oninput=()=>{dirty.textContent='Unsaved preset changes. Publish to save; applying to this chat is separate.'}
    if(d.revision!==this.bank.revision){publish.disabled=true;const review=button('Use refreshed library revision','lp-button');review.onclick=()=>{d.revision=this.bank!.revision;this.redraw()};const saved=this.bank.presets.find(p=>p.id===d.id);form.append(el('p','mochi-muted','Library changed. Review the current published content before using the refreshed revision.'),el('pre','',saved?JSON.stringify(saved.revisions.at(-1)): 'No saved preset for this new draft.'),review)}
    form.onsubmit=e=>{e.preventDefault();this.request({action:d.action,id:d.id,name:d.name,dmInstructions:d.dmInstructions,groupInstructions:d.groupInstructions,revision:d.revision})};form.append(dirty,publish,cancel);root.append(form)
   }else for(const p of this.bank.presets){
    const row=el('section','mochi-preset-entry');row.append(el('strong','',`${p.name} · revision ${p.revisions.length}${p.archived?' · archived':''}`))
    const edit=button('Edit / publish','lp-button');edit.disabled=p.archived||Boolean(this.ticket);edit.onclick=()=>this.edit('publish',p);const rename=button('Rename','lp-button');rename.disabled=Boolean(this.ticket);rename.onclick=()=>this.edit('rename',p)
    const copy=button('Duplicate','lp-button');copy.disabled=Boolean(this.ticket);copy.onclick=()=>this.request({action:'duplicate',id:p.id,sourceRevision:p.revisions.length,name:(p.name+' copy').slice(0,80),revision:this.bank!.revision})
    const archive=button(p.archived?'Restore archived preset':'Archive','lp-button');archive.disabled=Boolean(this.ticket);archive.onclick=()=>this.request({action:p.archived?'restore':'archive',id:p.id,revision:this.bank!.revision});row.append(edit,rename,copy,archive);root.append(row)
   }
  }
  return root
 }
}
export const MOCHI_PRESET_STYLES=`.mochi-view .mochi-preset-panel{min-width:0;min-height:0;max-height:45%;overflow:auto;flex:0 1 auto;padding:10px;border-bottom:1px solid var(--mochi-border);overflow-wrap:anywhere}.mochi-view .mochi-preset-panel button{min-height:40px;margin:3px}.mochi-view .mochi-preset-panel select{max-width:100%;min-width:0}.mochi-view .mochi-preset-editor{display:grid;gap:8px;min-width:0}.mochi-view .mochi-preset-editor label{display:grid;gap:4px;min-width:0}.mochi-view .mochi-preset-editor input,.mochi-view .mochi-preset-editor textarea{box-sizing:border-box;width:100%;min-width:0;font:inherit;background:var(--lp-surface-2,#ffffff0c);color:inherit;border:1px solid var(--mochi-border);border-radius:8px;padding:8px}.mochi-view .mochi-preset-entry{border:1px solid var(--mochi-border);border-radius:10px;padding:8px;margin-top:8px}.mochi-view .mochi-preset-panel :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}`
