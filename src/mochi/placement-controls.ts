import {mochiButton as button} from './ui/icon-slots.js'
import {el} from '../frontend/shared.js'
import {CONTEXT_MACROS,expandPlacement,type Placement} from './macros.js'
export interface PlacementDraft {layout:'legacy-v1'|'manual-v1';placement?:Placement}
export function placementControls(draft:PlacementDraft,redraw:()=>void):HTMLElement {
 const root=el('section','mochi-placement-editor');root.append(el('h4','','Context placement'))
 const mode=el('select');mode.setAttribute('aria-label','Context placement mode');for(const [value,label]of [['legacy-v1','Automatic — existing prompt'],['manual-v1','Manual — ordered context rows']]){const option=el('option','',label);option.value=value;mode.append(option)}mode.value=draft.layout
 mode.onchange=()=>{draft.layout=mode.value as PlacementDraft['layout'];if(draft.layout==='manual-v1'&&!draft.placement)draft.placement={version:1,rows:CONTEXT_MACROS.filter(k=>k!=='mochi_summary').map(key=>({id:'section_'+crypto.randomUUID().replaceAll('-',''),title:key.replace('mochi_',''),template:'{{'+key+'}}'}))};redraw()};root.append(mode)
 if(draft.layout==='manual-v1'){
  draft.placement||={version:1,rows:[]};root.append(el('p','mochi-muted','Core response rules remain first; Continue remains last. History and notes need their own rows. Only these row templates expand macros; DM/Group instructions stay literal.'))
  for(const [i,row]of draft.placement.rows.entries()){
   const card=el('section','mochi-placement-row'),heading=el('div','mochi-placement-row-head');heading.append(el('strong','',`${i+1}. ${row.title}`))
   const up=button('Move up','lp-button'),down=button('Move down','lp-button'),remove=button('Remove row','lp-button');up.disabled=i===0;down.disabled=i===draft.placement.rows.length-1;up.setAttribute('aria-label',`Move ${row.title} up`);down.setAttribute('aria-label',`Move ${row.title} down`);remove.setAttribute('aria-label',`Remove ${row.title}`)
   const move=(offset:number)=>{const rows=draft.placement!.rows;[rows[i],rows[i+offset]]=[rows[i+offset],rows[i]];redraw()};up.onclick=()=>move(-1);down.onclick=()=>move(1);remove.onclick=()=>{draft.placement!.rows.splice(i,1);redraw()};heading.append(up,down,remove)
   const title=el('input');title.maxLength=80;title.value=row.title;title.setAttribute('aria-label',`Section title ${i+1}`);title.oninput=()=>{row.title=title.value}
   const template=el('textarea');template.rows=2;template.maxLength=2000;template.value=row.template;template.setAttribute('aria-label',`Section template ${i+1}`);template.oninput=()=>{row.template=template.value};card.append(heading,title,template);root.append(card)
  }
  const choice=el('select');choice.setAttribute('aria-label','Context macro to add');for(const key of CONTEXT_MACROS){const option=el('option','',key);option.value=key;choice.append(option)}
  const add=button('Add context row','lp-button');add.disabled=draft.placement.rows.length>=12;add.onclick=()=>{const key=choice.value;draft.placement!.rows.push({id:'section_'+crypto.randomUUID().replaceAll('-',''),title:key.replace('mochi_',''),template:'{{'+key+'}}'});redraw()};root.append(choice,add)
  const warnings=el('div','mochi-preview-warning');warnings.setAttribute('role','status');const updateWarnings=()=>{try{warnings.replaceChildren(...expandPlacement(draft.placement!,{},[],[]).warnings.map(text=>el('p','',text)))}catch(error){warnings.textContent=(error as Error).message}};updateWarnings();root.addEventListener('input',updateWarnings);root.append(warnings)
 }
 return root
}
