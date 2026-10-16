import {el,button} from '../frontend/shared.js'
import {BLOCK_TEMPLATES,MACRO_REFERENCE,blockId,fromTemplate,validateBlocks,type BlockDocument,type PromptBlock,type PromptCategory} from './prompt-blocks.js'

export class PromptBlockEditor {
 private selected='';private dragging='';private macroOpen=false;private cursor={start:0,end:0};private notice='';private focusSelected=false;private detailScroll=0;private revealCategory=''
 render(doc:BlockDocument,redraw:()=>void):HTMLElement {
  const root=el('section','mochi-block-editor');root.setAttribute('aria-label','Prompt block workspace')
  const toolbar=el('div','mochi-block-toolbar'),add=button('+ Add category','lp-button')
  add.disabled=doc.categories.length>=12;add.onclick=()=>{this.revealCategory=blockId('category');doc.categories.push({id:this.revealCategory,name:'New category',collapsed:false,blocks:[]});redraw()}
  const count=doc.categories.reduce((n,c)=>n+c.blocks.length,0)
  toolbar.append(el('span','mochi-muted',`${doc.categories.length} categories · ${count} blocks`),add);root.append(toolbar,el('p','mochi-muted','Optional blocks are yours to edit or remove. Categories organize the draft; they add no hidden instructions. Order: Before history → At history → After history, then category and block order within each position.'))
  if(this.notice){const status=el('p','mochi-preview-warning',this.notice);status.setAttribute('role','status');root.append(status)}
  const workspace=el('div','mochi-block-columns'),list=el('div','mochi-category-list');workspace.append(list);root.append(workspace)
  const action=(label:string,run:()=>void,disabled=false)=>{const b=button(label,'mochi-block-action');b.disabled=disabled;b.onclick=run;return b}
  const moveBlock=(category:PromptCategory,index:number,delta:number)=>{const b=category.blocks[index];if(b.locked)return;[category.blocks[index],category.blocks[index+delta]]=[category.blocks[index+delta],b];redraw()}
  const drop=(category:PromptCategory,target?:PromptBlock)=>{
   const source=doc.categories.find(c=>c.blocks.some(b=>b.id===this.dragging)),b=source?.blocks.find(b=>b.id===this.dragging)
   if(!source||!b||b.locked||b===target)return
   source.blocks.splice(source.blocks.indexOf(b),1);category.blocks.splice(target?category.blocks.indexOf(target):category.blocks.length,0,b);category.collapsed=false;this.dragging='';redraw()
  }
  for(const [ci,c] of doc.categories.entries()){
   const category=el('details','mochi-block-category');category.open=!c.collapsed
   const summary=el('summary');summary.append(el('strong','',c.name),el('span','mochi-block-count',String(c.blocks.length)));category.append(summary)
   category.ontoggle=()=>{c.collapsed=!category.open};if(this.revealCategory===c.id)queueMicrotask(()=>{if(category.isConnected){category.scrollIntoView?.({block:'nearest'});this.revealCategory=''}})
   summary.ondragover=e=>e.preventDefault();summary.ondrop=e=>{e.preventDefault();drop(c)}
   const tools=el('div','mochi-block-toolbar'),name=el('input');name.value=c.name;name.maxLength=80;name.setAttribute('aria-label','Category name '+(ci+1));name.oninput=()=>{c.name=name.value;summary.querySelector('strong')!.textContent=name.value}
   const moveCategory=(delta:number)=>{[doc.categories[ci],doc.categories[ci+delta]]=[doc.categories[ci+delta],c];redraw()}
   tools.append(name,action('Move category up',()=>moveCategory(-1),ci===0),action('Move category down',()=>moveCategory(1),ci===doc.categories.length-1))
   const remove=action('Remove category',()=>{
    if(c.blocks.some(b=>b.locked)){this.notice='Unlock this category’s blocks before removing it.';redraw();return}
    const confirm=action('Confirm remove category and blocks',()=>{doc.categories.splice(ci,1);redraw()});remove.replaceWith(confirm);confirm.focus()
   });tools.append(remove);category.append(tools)
   for(const [i,b] of c.blocks.entries()){
    const row=el('article','mochi-prompt-block');row.dataset.enabled=String(b.enabled);row.dataset.selected=String(this.selected===b.id);row.draggable=!b.locked
    row.ondragstart=e=>{if(b.locked){e.preventDefault();return}this.dragging=b.id;e.dataTransfer?.setData('text/plain',b.id)}
    row.ondragend=()=>{this.dragging=''};row.ondragover=e=>e.preventDefault();row.ondrop=e=>{e.preventDefault();e.stopPropagation();drop(c,b)}
    const head=el('div','mochi-block-row'),toggle=el('input');toggle.type='checkbox';toggle.checked=b.enabled;toggle.disabled=b.locked;toggle.setAttribute('aria-label','Enable block '+b.name);toggle.onchange=()=>{b.enabled=toggle.checked;redraw()}
    const edit=action(b.name,()=>{this.selected=b.id;this.focusSelected=true;this.detailScroll=0;this.macroOpen=false;this.cursor={start:b.content.length,end:b.content.length};redraw()});edit.classList.add('mochi-block-name');edit.setAttribute('aria-label','Edit block '+b.name)
    head.append(toggle,edit,el('small','mochi-muted',b.role+' · '+b.position+(b.audience==='all'?'':' · '+b.audience)+(b.locked?' · locked':'')))
    const actions=el('div','mochi-block-row-actions')
    const duplicate=()=>{c.blocks.splice(i+1,0,{...b,id:blockId(),name:(b.name+' copy').slice(0,80),locked:false});redraw()}
    actions.append(action('↑',()=>moveBlock(c,i,-1),i===0||b.locked),action('↓',()=>moveBlock(c,i,1),i===c.blocks.length-1||b.locked),action('Duplicate',duplicate,count>=60),action('Delete',()=>{const confirm=action('Confirm delete '+b.name,()=>{c.blocks.splice(i,1);if(this.selected===b.id)this.selected='';redraw()});actions.lastElementChild!.replaceWith(confirm);confirm.focus()},b.locked))
    actions.children[0].setAttribute('aria-label','Move '+b.name+' up');actions.children[1].setAttribute('aria-label','Move '+b.name+' down')
    row.append(head,el('p','mochi-block-excerpt',b.content.trim().slice(0,110)||'Empty block'),actions);category.append(row)
   }
   if(!c.blocks.length)category.append(el('p','mochi-muted','No blocks. Add a template or write your own.'))
   const picker=el('details','mochi-block-picker');picker.append(el('summary','','+ Add Block'))
   const search=el('input');search.type='search';search.placeholder='Search templates';search.setAttribute('aria-label','Search block templates in '+c.name)
   const select=el('select');select.setAttribute('aria-label','Block template in '+c.name)
   const description=el('p','mochi-muted')
   const options=()=>{select.replaceChildren();const groups=new Map<string,HTMLOptGroupElement>();for(const [index,t]of BLOCK_TEMPLATES.entries()){if(!`${t.name} ${t.category} ${t.description}`.toLowerCase().includes(search.value.toLowerCase()))continue;let group=groups.get(t.category);if(!group){group=el('optgroup');group.label=t.category;groups.set(t.category,group);select.append(group)}const option=el('option','',t.name);option.value=String(index);group.append(option)}description.textContent=BLOCK_TEMPLATES[Number(select.value)]?.description||'No matching templates.'}
   search.oninput=options;select.onchange=()=>{description.textContent=BLOCK_TEMPLATES[Number(select.value)]?.description||''};options()
   const insert=action('Insert selected block',()=>{if(select.value==='')return;const b=fromTemplate(BLOCK_TEMPLATES[Number(select.value)]);c.blocks.push(b);this.selected=b.id;this.focusSelected=true;this.detailScroll=0;redraw()},count>=60);picker.append(search,select,description,insert);category.append(picker);list.append(category)
  }
  if(!doc.categories.length)list.append(el('p','mochi-muted','An empty optional preset is valid. Mochi still enforces its response contract. Add a category to start writing.'))
  const category=doc.categories.find(c=>c.blocks.some(b=>b.id===this.selected)),selected=category?.blocks.find(b=>b.id===this.selected)
  if(selected&&category){
   const b=selected,pane=el('section','mochi-block-detail');pane.setAttribute('aria-label','Block editor');const savedDetailScroll=this.detailScroll;pane.onscroll=()=>{this.detailScroll=pane.scrollTop};queueMicrotask(()=>{if(!pane.isConnected)return;pane.scrollTop=savedDetailScroll;if(this.focusSelected){pane.scrollIntoView?.({block:'nearest'});pane.querySelector<HTMLInputElement>('[aria-label="Block name"]')?.focus({preventScroll:true});this.focusSelected=false}});pane.append(el('h4','',b.name),el('p','mochi-muted','Draft block · changes are not published or applied.'))
   const field=(label:string,node:HTMLElement)=>{const wrap=el('label','',label);node.setAttribute('aria-label',label);wrap.append(node);pane.append(wrap)}
   const lock=el('input');lock.type='checkbox';lock.checked=b.locked;lock.onchange=()=>{b.locked=lock.checked;redraw()};field('Lock block against accidental edits',lock)
   const name=el('input');name.value=b.name;name.maxLength=80;name.disabled=b.locked;name.oninput=()=>{b.name=name.value};field('Block name',name)
   let textPreview:HTMLElement|undefined
   const content=el('textarea');content.value=b.content;content.rows=9;content.maxLength=8000;content.disabled=b.locked;content.oninput=()=>{b.content=content.value;if(textPreview)textPreview.textContent=b.content};const remember=()=>{this.cursor={start:content.selectionStart,end:content.selectionEnd}};content.onselect=remember;content.onkeyup=remember;content.onblur=remember;field('Block content',content)
   const macro=action('Insert Macro',()=>{remember();this.macroOpen=!this.macroOpen;redraw()},b.locked);pane.append(macro)
   if(this.macroOpen){
    const browser=el('section','mochi-macro-browser');browser.setAttribute('aria-label','Macro reference');const search=el('input');search.type='search';search.placeholder='Search macros';search.setAttribute('aria-label','Search macro reference');const results=el('div'),outlet=el('input');outlet.value='name';outlet.setAttribute('aria-label','Persona outlet name');browser.append(search,outlet,results)
    const show=()=>{results.replaceChildren();for(const m of MACRO_REFERENCE.filter(m=>`${m.name} ${m.syntax} ${m.description} ${m.source}`.toLowerCase().includes(search.value.toLowerCase()))){const card=el('article','mochi-macro-item');card.append(el('strong','',m.name),el('code','',m.syntax),el('p','mochi-muted',m.description),el('small','mochi-muted',`${m.source} · Requires: ${m.context}`));const insert=action('Insert '+m.name,()=>{const syntax=m.syntax==='{{persona_outlet::name}}'?'{{persona_outlet::'+(outlet.value.trim()||'name')+'}}':m.syntax;const start=Math.min(this.cursor.start,b.content.length),end=Math.min(this.cursor.end,b.content.length);if(b.content.length-end+start+syntax.length>8000){this.notice='Block content limit reached.';redraw();return}b.content=b.content.slice(0,start)+syntax+b.content.slice(end);this.cursor={start:start+syntax.length,end:start+syntax.length};this.macroOpen=false;redraw()},m.source.startsWith('Unsupported'));card.append(insert);results.append(card)}if(!results.children.length)results.append(el('p','mochi-muted','No matching macros.'))};search.oninput=show;show();pane.append(browser)
   }
   const advanced=el('details');advanced.append(el('summary','','Role, placement & conversation type'))
   const choice=(label:string,value:string,options:Array<[string,string]>,change:(value:string)=>void)=>{const wrap=el('label','',label),select=el('select');select.setAttribute('aria-label',label);select.disabled=b.locked;for(const [key,name]of options){const o=el('option','',name);o.value=key;select.append(o)}select.value=value;select.onchange=()=>{change(select.value);redraw()};wrap.append(select);advanced.append(wrap)}
   choice('Block role',b.role,[['system','System'],['user','User'],['assistant','Assistant']],value=>{b.role=value as PromptBlock['role']})
   choice('Block placement',b.position,[['before-history','Before chat history'],['history','At chat history'],['after-history','After chat history']],value=>{b.position=value as PromptBlock['position']})
   choice('Conversation type',b.audience,[['all','DM and group'],['dm','Direct messages only'],['group','Group chats only']],value=>{b.audience=value as PromptBlock['audience']})
   choice('Move block to category',category.id,doc.categories.map(c=>[c.id,c.name]),value=>{const target=doc.categories.find(c=>c.id===value)!;category.blocks.splice(category.blocks.indexOf(b),1);target.blocks.push(b);target.collapsed=false})
   advanced.append(el('p','mochi-muted','History retains its original roles. System Notes stay system messages; Chat Memory stays untrusted user context. Those structured references must occupy their own block.'));pane.append(advanced)
   const preview=el('details');preview.append(el('summary','','Preview block text'),el('p','mochi-muted','Unresolved draft text only. Use Preview draft prompt for authorized context and token estimates; no provider request.'),textPreview=el('pre','mochi-preview-text',b.content));pane.append(preview,action('Done editing block',()=>{this.selected='';redraw()}));workspace.append(pane)
  }
  const validation=el('p','mochi-muted');validation.setAttribute('role','status');const validate=()=>{try{validateBlocks(doc);validation.textContent='Draft structure is valid. Full prompt preview checks context and references.'}catch(error){validation.textContent=(error as Error).message}};root.addEventListener('input',validate);validate();root.append(validation)
  return root
 }
}

export const PROMPT_BLOCK_STYLES=`
.mochi-view .mochi-block-columns{display:grid;gap:12px;min-width:0}.mochi-view .mochi-block-toolbar,.mochi-view .mochi-block-row,.mochi-view .mochi-block-row-actions{display:flex;align-items:center;flex-wrap:wrap;gap:6px}.mochi-view .mochi-block-toolbar>input{flex:1 1 160px}.mochi-view .mochi-block-category{border:1px solid var(--mochi-border);border-radius:12px;margin-bottom:10px;background:var(--mochi-surface);padding:10px}.mochi-view .mochi-block-category>summary{display:list-item;cursor:pointer;min-height:44px;padding:10px 2px;font-size:13px}.mochi-view .mochi-block-count{margin-left:12px;border:1px solid var(--mochi-border);border-radius:99px;padding:2px 8px;color:inherit}.mochi-view .mochi-prompt-block{border:1px solid var(--mochi-border);border-radius:8px;padding:8px;margin:8px 0;background:color-mix(in srgb,currentColor 3%,var(--mochi-surface))}.mochi-view .mochi-prompt-block[data-selected=true]{border-color:var(--mochi-accent)}.mochi-view .mochi-prompt-block[data-enabled=false]{border-style:dashed}.mochi-view .mochi-block-action{font:inherit;min-height:44px;padding:8px 10px;border:1px solid var(--mochi-border);border-radius:8px;color:inherit;background:transparent;cursor:pointer}.mochi-view .mochi-block-action:disabled{opacity:.55;cursor:default}.mochi-view .mochi-block-action:hover:not(:disabled){background:color-mix(in srgb,var(--mochi-accent) 10%,var(--mochi-surface))}.mochi-view .mochi-block-name{font-weight:600;flex:1;text-align:left}.mochi-view .mochi-block-row small{font-size:11px}.mochi-view .mochi-block-excerpt{font-size:12px;opacity:.8;white-space:pre-wrap;overflow-wrap:anywhere;max-height:3.5em;overflow:hidden;padding:6px 0}.mochi-view .mochi-block-detail{min-width:0;border:1px solid var(--mochi-border);border-radius:12px;padding:12px;align-self:start;display:grid;gap:10px;background:var(--mochi-surface)}.mochi-view .mochi-block-detail label{border:0;padding:0}.mochi-view .mochi-block-detail details,.mochi-view .mochi-block-picker{border-top:1px solid var(--mochi-border);padding-top:8px;margin-top:8px}.mochi-view .mochi-block-detail summary,.mochi-view .mochi-block-picker summary{min-height:44px;padding:10px 0;cursor:pointer}.mochi-view .mochi-block-picker[open]{display:grid;gap:8px}.mochi-view .mochi-macro-browser{border:1px solid var(--mochi-border);padding:8px;border-radius:8px;max-height:350px;overflow:auto;display:grid;gap:8px}.mochi-view .mochi-macro-item{padding:10px 0;border-bottom:1px solid var(--mochi-border);display:grid;gap:5px}.mochi-view .mochi-macro-item code{overflow-wrap:anywhere;white-space:pre-wrap}.mochi-view .mochi-block-toolbar{margin:8px 0}.mochi-view .mochi-block-editor :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}.mochi-view .mochi-block-editor textarea{min-height:180px}.mochi-view .mochi-block-editor input[type=checkbox]{width:24px;min-height:24px;flex:none}@container(min-width:850px){.mochi-view .mochi-block-columns:has(.mochi-block-detail){grid-template-columns:minmax(240px,1fr) minmax(260px,1fr)}.mochi-view .mochi-block-detail{position:sticky;top:0;max-height:50vh;overflow:auto}}@container(max-width:849px){.mochi-view .mochi-block-detail{grid-row:1}.mochi-view .mochi-block-toolbar{align-items:stretch}.mochi-view .mochi-block-row small{flex-basis:100%}}
`
