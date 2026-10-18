import {mochiDisclosureIcon} from './ui/icon-slots.js'
import {mochiButton as button} from './ui/icon-slots.js'
import {mochiStyle} from './ui/styles.js'
import {el,requestId} from '../frontend/shared.js'
import {DEFAULT_PRESET_ID,DEFAULT_V2_PRESET_ID,builtInPresets,isBuiltInPreset,type PresetBank,type ResolvedPreset,type MochiPreset} from './presets.js'
import type {MochiRoom} from './types.js'
import {PromptBlockEditor,PROMPT_BLOCK_STYLES} from './block-editor.js'
import {starterBlocks,convertLegacy,validateBlocks,type BlockDocument} from './prompt-blocks.js'
const scope=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
interface Draft {layout:ResolvedPreset['layout'];placement?:ResolvedPreset['placement'];blocks?:BlockDocument;action:'create'|'publish'|'rename';id?:string;name:string;dmInstructions:string;groupInstructions:string;revision:number;baseline:string}
export class MochiPresetPanel {
 open=false;bank?:PresetBank;effective?:ResolvedPreset;status='';draft?:Draft
 private ticket='';private key='';private timer?:ReturnType<typeof setTimeout>;private submitted=false
 private drafts=new Map<string,Draft>()
 private selectedId?:string
 private selectedRevision?:number
 private customizing=false
 private disclosures=new Set<string>()
 private blockEditor=new PromptBlockEditor()
 private scrollTop=0;private overviewScroll=0;private wasEditingBlock=false
 constructor(private send:(p:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private bind:(id:string,revision:number)=>void,private returned:()=>void,private previewDraft?:(blocks:BlockDocument)=>void){}
 reset(privateState=false):void{clearTimeout(this.timer);this.ticket='';this.open=false;this.bank=undefined;this.effective=undefined;this.draft=undefined;this.key='';this.selectedId=undefined;this.selectedRevision=undefined;this.scrollTop=0;this.overviewScroll=0;this.wasEditingBlock=false;this.blockEditor=new PromptBlockEditor();this.customizing=false;this.disclosures.clear();if(privateState)this.drafts.clear()}
 show(room:MochiRoom):void{if(this.key!==scope(room))this.reset();this.key=scope(room);this.draft=this.drafts.get(this.key);this.open=true;this.load()}
 load():void{this.request({action:'list'})}
 private request(values:any):void{
  const room=this.current();if(!room||!this.open||scope(room)!==this.key)return
  if(values.action!=='duplicate')this.customizing=false
  clearTimeout(this.timer);this.ticket=requestId('mochi_presets');const ticket=this.ticket;this.submitted=values.action!=='list';this.status='Loading presets…';this.redraw()
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.ticket='';this.customizing=false;this.status='No response. Refresh the library before retrying.';this.redraw()}},20000)
  try{this.send({type:'mochi:presets',requestId:ticket,roomId:room.id,accountId:room.accountId,...values})}catch{clearTimeout(this.timer);this.ticket='';this.status='Presets unavailable. Try refreshing.';this.redraw()}
 }
 receive(p:any):boolean{
  if(p?.type!=='mochi:presets'&&p?.type!=='mochi:error')return false
  if(!this.ticket||p.requestId!==this.ticket)return p.type==='mochi:presets'
  clearTimeout(this.timer);this.ticket='';const room=this.current();if(!this.open||!room||scope(room)!==this.key)return true
  if(p.type==='mochi:error'){this.customizing=false;this.status=String(p.message);this.redraw();return true}
  if(p.roomId!==room.id||p.accountId!==room.accountId||p.bank?.accountId!==room.accountId)return true
  this.bank=p.bank;this.effective=p.effective;this.status=this.submitted?'Library saved. Applying a revision to this chat is a separate action.':'Library loaded.'
  if(this.submitted){this.drafts.delete(this.key);this.draft=undefined}
  if(this.customizing){this.customizing=false;const copy=this.bank!.presets.at(-1);if(copy){this.selectedId=copy.id;this.edit('publish',copy,1)}}
  this.redraw();return true
 }
 private edit(action:Draft['action'],preset?:MochiPreset,sourceRevision?:number):void{
  if(!this.bank)return;const r=preset?.revisions.find(r=>r.revision===(sourceRevision||preset.revisions.length)),value={action,id:preset?.id,name:preset?.name||'',dmInstructions:r?.dmInstructions||'',groupInstructions:r?.groupInstructions||'',revision:this.bank.revision,layout:r?.layout||'blocks-v1' as ResolvedPreset['layout'],placement:r?.placement?structuredClone(r.placement):undefined,blocks:r?.blocks?structuredClone(r.blocks):!r?starterBlocks():undefined}
  this.blockEditor=new PromptBlockEditor();this.draft={...value,baseline:JSON.stringify(value)};this.drafts.set(this.key,this.draft);this.redraw()
 }
 render(room:MochiRoom):HTMLElement{
  if(this.key!==scope(room)){this.reset();return el('div')}
  const editingBlock=Boolean(this.draft&&this.blockEditor.editing);if(editingBlock!==this.wasEditingBlock){if(editingBlock)this.overviewScroll=this.scrollTop;this.scrollTop=editingBlock?0:this.overviewScroll;this.wasEditingBlock=editingBlock}
  const root=el('section','mochi-preset-panel');root.dataset.blockEditing=String(editingBlock);root.setAttribute('aria-label','Mochi presets');root.onscroll=()=>{this.scrollTop=root.scrollTop};const savedScroll=this.scrollTop;queueMicrotask(()=>{if(root.isConnected)root.scrollTop=savedScroll});root.append(el('h3','','Mochi Presets'),el('p','mochi-muted','Edit draft → Publish revision → Apply to conversation. Each step is separate.'))
  const controls=el('details','mochi-preset-binding');controls.open=false;controls.append(el('summary','','Library & apply to conversation'),el('p','mochi-muted','Published revisions are immutable. Conversations keep their selected revision until you explicitly apply another. Block presets include saved room instructions only where referenced.'));root.append(controls)
  const status=el('div','mochi-muted',this.status);status.setAttribute('role','status');root.append(status)
  const refresh=button('Refresh preset library','lp-button');refresh.onclick=()=>this.load();const close=button('Return to conversation','lp-button');close.onclick=()=>{clearTimeout(this.timer);this.ticket='';this.open=false;this.redraw();this.returned()};const heading=el('div','mochi-preset-heading');heading.append(root.querySelector('h3')!,close);root.prepend(heading);controls.append(refresh)
  const restore=button('Restore Mochi Default','lp-button');restore.onclick=()=>{const confirm=button('Confirm restore default','lp-button');confirm.onclick=()=>this.bind(DEFAULT_PRESET_ID,1);restore.replaceWith(confirm);confirm.focus()};controls.append(restore,el('small','mochi-muted','Applying a preset or restoring Default may cancel this chat’s pending replies. Publishing alone does not.'))
  if(this.effective)controls.append(el('p','',`Applied Revision: ${this.effective.builtIn?'Built-in':'Custom'} · ${this.effective.name} · revision ${this.effective.revision}${this.effective.builtIn?' · built-in':''}`))
  if(this.bank){
   const select=el('select');select.setAttribute('aria-label','Preset to apply');for(const p of builtInPresets()){const base=el('option','',p.name+' · built-in');base.value=p.id;select.append(base)}
   for(const p of this.bank.presets.filter(p=>!p.archived||p.id===room.preset?.id)){const option=el('option','',`${p.name} · revision ${p.revisions.length}${p.archived?' · archived':''}`);option.value=p.id;select.append(option)}select.value=room.preset?.id||DEFAULT_PRESET_ID
   const revisionSelect=el('select');revisionSelect.setAttribute('aria-label','Preset revision to apply')
   const revisionOptions=()=>{revisionSelect.replaceChildren();const p=this.bank!.presets.find(p=>p.id===select.value);for(const r of p?.revisions||[{revision:1}]){const o=el('option','','Revision '+r.revision);o.value=String(r.revision);revisionSelect.append(o)}revisionSelect.value=String(select.value===room.preset?.id?room.preset.revision:p?.revisions.length||1)};revisionOptions();select.onchange=revisionOptions
   const apply=button('Apply selected preset','lp-button');apply.disabled=Boolean(this.ticket);apply.onclick=()=>{const id=select.value,p=this.bank!.presets.find(p=>p.id===id);const confirm=button('Confirm apply preset','lp-button');confirm.onclick=()=>this.bind(id,Number(revisionSelect.value));apply.replaceWith(confirm);confirm.focus()};controls.append(select,revisionSelect,apply)
   const bound=this.bank.presets.find(p=>p.id===room.preset?.id);if(bound&&bound.revisions.length>room.preset!.revision){const update=button('Update to latest','lp-button');update.onclick=()=>{const confirm=button('Confirm update to latest','lp-button');confirm.onclick=()=>this.bind(bound.id,bound.revisions.length);update.replaceWith(confirm);confirm.focus()};controls.append(update)}
   const create=button('Create preset','lp-button');create.disabled=Boolean(this.ticket)||Boolean(this.draft);create.onclick=()=>this.edit('create');const duplicate=button('Duplicate Mochi Default','lp-button');duplicate.disabled=Boolean(this.ticket)||Boolean(this.draft);duplicate.onclick=()=>this.request({action:'duplicate',id:DEFAULT_PRESET_ID,name:'Mochi Default copy',revision:this.bank!.revision});if(!this.draft)heading.append(create);controls.append(duplicate)
   const customize=button('Customize Mochi Default v2','lp-button');customize.disabled=Boolean(this.ticket)||Boolean(this.draft);customize.onclick=()=>{this.customizing=true;this.request({action:'duplicate',id:DEFAULT_V2_PRESET_ID,sourceRevision:1,name:'Mochi Default v2 copy',revision:this.bank!.revision})};if(!this.draft)heading.append(customize)
   if(!this.bank.presets.length)controls.append(el('p','mochi-muted','No custom presets in this account yet.'))
   const workspace=el('div','mochi-preset-workspace'),library=el('details','mochi-preset-library'),editor=el('div','mochi-preset-edit-pane');library.setAttribute('aria-label','Preset library');library.append(el('summary','','Browse saved presets · '+(this.bank.presets.length+2)));editor.append(el('h4','',this.draft?'Draft · '+(this.draft.name||'Untitled preset'):'Published preset'));workspace.append(library,editor);root.append(workspace)
   const inspectable:MochiPreset[]=[...builtInPresets().map(p=>({id:p.id,name:p.name,archived:false,revisions:[p]})),...this.bank.presets]
   const selected=this.selectedId||room.preset?.id||DEFAULT_PRESET_ID
   for(const p of inspectable){const item=button(`${p.name} · r${p.revisions.length}${isBuiltInPreset(p.id)?' · built-in':p.archived?' · archived':''}`,'mochi-preset-library-item');item.setAttribute('aria-pressed',String(selected===p.id));item.onclick=()=>{const choose=()=>{this.draft=undefined;this.drafts.delete(this.key);this.selectedId=p.id;this.selectedRevision=undefined;this.redraw()};if(this.draft){const confirm=button('Discard draft and open preset','lp-button');confirm.onclick=choose;item.replaceWith(confirm);confirm.focus()}else choose()};library.append(item)}
   if(!this.draft&&!inspectable.some(p=>p.id===selected))editor.append(el('p','mochi-muted','No published preset selected. Browse the library to inspect a revision, or create a draft.'))
   if(this.draft){
    const d=this.draft,form=el('form','mochi-preset-editor'),name=el('input');name.maxLength=80;name.required=true;name.value=d.name;name.readOnly=d.action==='publish';name.setAttribute('aria-label','Preset name');name.oninput=()=>{d.name=name.value}
    const label=el('label','','Preset name');label.append(name);if(!editingBlock&&d.action!=='publish')form.append(label);name.addEventListener('input',()=>{editor.querySelector('h4')!.textContent='Draft · '+(d.name||'Untitled preset')})
    if(d.action!=='rename'){
     if(d.layout!=='blocks-v1'){
      const compatibility=el('details');compatibility.append(el('summary','','Original published content · unchanged'),el('pre','',JSON.stringify({layout:d.layout,dmInstructions:d.dmInstructions,groupInstructions:d.groupInstructions,placement:d.placement},null,2)))
      const convert=button('Create block draft from this revision','lp-button');convert.onclick=()=>{d.blocks=convertLegacy(d);d.layout='blocks-v1';delete d.placement;d.dmInstructions='';d.groupInstructions='';this.redraw()}
      form.append(el('p','mochi-preview-warning','This legacy revision keeps its original assembly. Conversion creates explicit optional blocks in a new draft, with a different prompt structure. Preview before publishing and applying; saved revisions and chat bindings stay unchanged.'),compatibility,convert)
     }else{
      d.blocks||=starterBlocks();form.append(this.blockEditor.render(d.blocks,()=>this.redraw()))
      const preview=button('Preview draft prompt','lp-button');preview.disabled=!this.previewDraft;preview.onclick=()=>{try{this.previewDraft?.(validateBlocks(d.blocks))}catch(error){this.status=(error as Error).message;this.redraw()}};form.append(preview)
     }
    }
    const publish=button(d.action==='rename'?'Save preset name':'Publish preset revision','lp-button');publish.type='submit';publish.disabled=Boolean(this.ticket)||(d.action!=='rename'&&d.layout!=='blocks-v1');const cancel=button('Cancel preset editing','lp-button');cancel.onclick=()=>{const confirm=button('Discard preset draft','lp-button');confirm.onclick=()=>{this.drafts.delete(this.key);this.draft=undefined;this.redraw()};cancel.replaceWith(confirm);confirm.focus()}
    const dirty=el('small','mochi-muted','Draft retained in this session. Publish saves the library only; applying is separate.');dirty.setAttribute('role','status');form.oninput=()=>{dirty.textContent='Unsaved preset changes. Publish to save; applying to this chat is separate.'}
    if(d.revision!==this.bank.revision){publish.disabled=true;const review=button('Use refreshed library revision','lp-button');review.onclick=()=>{d.revision=this.bank!.revision;this.redraw()};const saved=this.bank.presets.find(p=>p.id===d.id);form.append(el('p','mochi-muted','Library changed. Review the current published content before using the refreshed revision.'),el('pre','',saved?JSON.stringify(saved.revisions.at(-1)): 'No saved preset for this new draft.'),review)}
    form.onsubmit=e=>{e.preventDefault();if(d.action!=='rename'&&d.layout==='blocks-v1'){try{validateBlocks(d.blocks)}catch(error){this.status=(error as Error).message;this.redraw();return}}this.request({action:d.action,id:d.id,name:d.name,dmInstructions:d.dmInstructions,groupInstructions:d.groupInstructions,revision:d.revision,layout:d.layout,...(d.layout==='manual-v1'?{placement:d.placement}:d.layout==='blocks-v1'?{blocks:d.blocks}:{})})};if(!editingBlock)form.append(dirty,publish,cancel);editor.append(form)
   }else for(const p of inspectable.filter(p=>p.id===selected)){
    const published=p.revisions.find(r=>r.revision===this.selectedRevision)||p.revisions.at(-1)!
    const row=el('section','mochi-preset-entry');row.append(el('strong','',`${p.name} · revision ${published.revision}${p.archived?' · archived':''}`))
    const revisions=el('select');revisions.setAttribute('aria-label','Published revision to inspect');for(const r of p.revisions){const o=el('option','','Revision '+r.revision+' · '+r.layout);o.value=String(r.revision);revisions.append(o)}revisions.value=String(published.revision);revisions.onchange=()=>{this.selectedRevision=Number(revisions.value);this.redraw()};row.append(revisions)

    const edit=button('Edit / publish','lp-button');edit.disabled=p.archived||Boolean(this.ticket);edit.onclick=()=>this.edit('publish',p,published.revision);const rename=button('Rename','lp-button');rename.disabled=Boolean(this.ticket);rename.onclick=()=>this.edit('rename',p)
    const copy=button(isBuiltInPreset(p.id)?'Duplicate / customize':'Duplicate','lp-button');copy.disabled=Boolean(this.ticket);copy.onclick=()=>{this.customizing=isBuiltInPreset(p.id);this.request({action:'duplicate',id:p.id,sourceRevision:published.revision,name:(p.name+' copy').slice(0,80),revision:this.bank!.revision})}
    const archive=button(p.archived?'Restore archived preset':'Archive','lp-button');archive.disabled=Boolean(this.ticket);archive.onclick=()=>this.request({action:p.archived?'restore':'archive',id:p.id,revision:this.bank!.revision});if(published.layout==='blocks-v1'){for(const c of published.blocks!.categories){const section=el('details');section.append(el('summary','',c.name+' · '+c.blocks.length+' blocks'));for(const b of c.blocks)section.append(el('p','',`${b.enabled?'Enabled':'Disabled'} · ${b.name} · ${b.role} · ${b.position} · ${b.audience}`),el('pre','',b.content));row.append(section)}}else row.append(el('p','mochi-muted',published.layout==='manual-v1'?'Legacy manual context placement':'Legacy automatic context placement'),el('pre','',published.dmInstructions||'No additional DM instructions.'),el('pre','',published.groupInstructions||'No additional Group instructions.'))
    if(isBuiltInPreset(p.id))row.append(el('p','mochi-muted','Stable built-in revision. Duplicate to customize an independent copy; publishing and applying remain separate.'),copy);else row.append(edit,rename,copy,archive);editor.append(row)
   }
  }
  if(editingBlock){controls.remove();libraryRemove(root);refresh.remove();root.querySelector('.mochi-preset-edit-pane>h4')?.remove()}
  else{const navigation=el('div','mochi-preset-navigation');navigation.append(controls);const library=root.querySelector('.mochi-preset-library');if(library)navigation.append(library);root.insertBefore(navigation,status)}
  status.hidden=this.status==='Library loaded.'
  for(const details of root.querySelectorAll<HTMLDetailsElement>('details')){if(details.closest('.mochi-block-editor'))continue;const key=details.querySelector('summary')?.textContent||'';details.classList.add('mochi-disclosure');mochiDisclosureIcon(details);details.querySelector('summary')?.setAttribute('title',key);details.open=this.disclosures.has(key);details.ontoggle=()=>{if(details.open)this.disclosures.add(key);else this.disclosures.delete(key)}}
  return root
 }
}
function libraryRemove(root:HTMLElement):void{root.querySelector('.mochi-preset-library')?.remove()}
export const MOCHI_PRESET_STYLES=mochiStyle('mochi-preset-styles')

const MOCHI_PRESET_WORKSPACE_BASE=PROMPT_BLOCK_STYLES+mochiStyle('preset-workspace-base')

const MOCHI_PRESET_DEDICATED_STYLES=mochiStyle('mochi-preset-dedicated-styles')



// Compact workspace chrome leaves the writing area prominent.
const MOCHI_PRESET_CHROME_STYLES=mochiStyle('mochi-preset-chrome-styles')



export const MOCHI_PRESET_WORKSPACE_STYLES=MOCHI_PRESET_WORKSPACE_BASE+MOCHI_PRESET_DEDICATED_STYLES+MOCHI_PRESET_CHROME_STYLES+mochiStyle('preset-workspace-final')
