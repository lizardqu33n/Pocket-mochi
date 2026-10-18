import {mochiStyle} from './ui/styles.js'
import {el,button} from '../frontend/shared.js'
import type {MochiRoom,MochiState} from './types.js'
import {statusFor} from './presence.js'

export const SETTINGS_CATEGORIES=['General','AI & Replies','Characters & Texting','Availability & Schedules','Memory & Context','Advanced'] as const
export class ChatSettingsLayout {
 category:string='General';private categoryOpen=false;private focusCategory=false;private character='';private characterTab='texting';private scroll=0;private overviewScroll=0;private focus=''
 enter():void{this.character='';this.categoryOpen=false;this.scroll=0}
 back():boolean{if(this.character){this.character='';return true}if(this.categoryOpen){this.categoryOpen=false;return true}return false}
 reset():void{this.category='General';this.character='';this.categoryOpen=false;this.scroll=0;this.overviewScroll=0;this.focus=''}
 adapt(form:HTMLFormElement,room:MochiRoom,state:MochiState,redraw:()=>void,tools:(name:string,anchor:HTMLElement)=>void,defaults?:(id:string,mode:'texting'|'availability'|'about')=>HTMLElement):HTMLFormElement{
  form.classList.add('mochi-organized-settings','mochi-category-workspace');form.dataset.categoryOpen=String(this.categoryOpen);form.setAttribute('aria-label','Chat Settings')
  form.querySelector('h3')?.remove()
  const sections=Array.from(form.querySelectorAll<HTMLElement>(':scope>.mochi-settings-section'))
  const title=(node:HTMLElement)=>node.querySelector('legend,summary')?.textContent||''
  const categories=new Map<string,HTMLElement>();for(const name of SETTINGS_CATEGORIES){const body=el('section','mochi-settings-category');body.setAttribute('aria-label',name+' settings');categories.set(name,body)}
  for(const node of sections){
   if(node.dataset.characterId)continue
   const name=title(node);let target=name==='Conversation'?'General':name==='Connection & replies'?'AI & Replies':name==='Background messaging'?'Availability & Schedules':name==='Context & token limits'?'Memory & Context':'Advanced'
   if(name==='Connection & replies'){
    const texting=categories.get('AI & Replies')!
    for(const label of ['Reply automatically after sending','Response mode','Next responder']){const field=node.querySelector(`[aria-label="${label}"]`)?.closest('label');if(field)texting.append(field)}
    const help=Array.from(node.querySelectorAll('p')).find(p=>p.textContent?.includes('Natural may choose'));if(help)texting.append(help);const responderHelp=Array.from(node.querySelectorAll('p')).find(p=>p.textContent?.startsWith('Next responder applies now'));if(responderHelp)texting.append(responderHelp)
   }
   if(name==='Connection & replies')node.querySelector('legend,summary')!.textContent='Connection & model'
   if(node.tagName==='DETAILS'&&name!=='Chat ownership'&&name!=='Background messaging')(node as HTMLDetailsElement).open=true
   categories.get(target)!.append(node)
  }
  const characters=sections.filter(s=>s.dataset.characterId),overview=()=>{
   const list=el('div','mochi-character-settings-list')
   for(const [index,id]of room.characterIds.entries()){
    const c=state.characters.find(c=>c.id===id),name=c?.name||'Unavailable character',row=el('div','mochi-character-settings-row'),avatar=el('span','mochi-avatar',name.slice(0,1));if(c?.avatarUrl){const img=el('img');img.src=c.avatarUrl;img.alt='';avatar.replaceChildren(img)}
    const copy=el('div');copy.append(el('strong','',name),el('small','mochi-muted',`${statusFor(room,id)} · ${room.settings?.textingStyles?.[id]?.length||'Character default'} · character ${index+1}`))
    const edit=button('Edit');edit.setAttribute('aria-label',`Edit character ${index+1}: ${name}`);edit.dataset.characterId=id;edit.onclick=()=>{this.overviewScroll=this.scroll;this.scroll=0;this.character=id;this.characterTab=this.category==='Availability & Schedules'?'availability':'texting';this.focus='back';redraw()};row.append(avatar,copy,edit);list.append(row)
   }
   return list
  }
  for(const name of ['Characters & Texting','Availability & Schedules'])categories.get(name)!.append(el('h4','','Characters in this conversation'),overview())
  const advanced=categories.get('Advanced')!;advanced.append(el('p','mochi-muted','Advanced conversation tools · Presets publish reusable revisions; applying is separate. Preview is read-only. System Notes intentionally guide AI context.'))
  for(const name of ['Presets','Preview AI prompt','Conversation Memory','Pins & Notes']){const b=button(name);b.onclick=()=>tools(name,b);categories.get(name==='Presets'?'AI & Replies':name==='Pins & Notes'?'Advanced':'Memory & Context')!.append(b)}
  const nav=el('nav','mochi-settings-categories');nav.setAttribute('aria-label','Chat settings categories')
  const scroller=el('div','mochi-settings-scroll');scroller.onscroll=()=>{this.scroll=scroller.scrollTop}
  const footer=form.querySelector<HTMLElement>(':scope>.mochi-actions')!
  form.replaceChildren(nav,scroller,footer)
  for(const name of SETTINGS_CATEGORIES){const tab=button(name);tab.setAttribute('aria-label',name);tab.setAttribute('aria-pressed',String(this.category===name));tab.onclick=()=>{this.category=name;this.focusCategory=true;this.categoryOpen=true;this.character='';this.scroll=0;redraw()};nav.append(tab)}
  const categoryBack=button('Back to Chat categories','mochi-category-back');categoryBack.onclick=()=>{this.categoryOpen=false;this.focusCategory=true;redraw()};scroller.append(categoryBack)
  if(this.character){
   const detail=characters.find(s=>s.dataset.characterId===this.character)
   if(detail){
    if(detail.tagName==='DETAILS')(detail as HTMLDetailsElement).open=true
    const heading=detail.querySelector('summary,legend')!;heading.textContent=heading.textContent!.replace('presence & room name','character settings')
    const texting=el('div','mochi-character-fields'),availability=el('div','mochi-character-fields'),nickname=detail.querySelector('[aria-label^="Display name for "]')?.closest('label'),style=detail.querySelector('.mochi-texting-chat')
    if(nickname)texting.append(nickname);if(style)texting.append(style);if(defaults)texting.append(defaults(this.character,'texting'))
    for(const node of Array.from(detail.children))if(node!==heading)availability.append(node);if(defaults)availability.append(defaults(this.character,'availability'))
    const detailNav=el('nav','mochi-character-detail-nav');for(const [key,label]of [['texting','Texting & nickname'],['availability','Availability'],['profile','Mochi Character Profile']] as const){const tab=button(label);tab.setAttribute('aria-label','Character '+key+' settings');tab.setAttribute('aria-pressed',String(this.characterTab===key));tab.onclick=()=>{this.characterTab=key;this.scroll=0;redraw()};detailNav.append(tab)}
    detail.replaceChildren(heading,detailNav,this.characterTab==='texting'?texting:this.characterTab==='profile'&&defaults?defaults(this.character,'about'):availability)
    const back=button('Back to characters');back.onclick=()=>{const id=this.character;this.character='';this.scroll=this.overviewScroll;this.focus=id;redraw()}
    scroller.append(back,el('p','mochi-muted','This character within this conversation · Name and texting edits require Save. Presence, delays and schedule buttons apply immediately.'),detail)
   }else this.character=''
  }
  if(!this.character)scroller.append(el('h4','',this.category),categories.get(this.category)!)
  if(this.focusCategory){this.focusCategory=false;queueMicrotask(()=>{const target=this.categoryOpen?scroller.querySelector<HTMLElement>('h4'):nav.querySelector<HTMLElement>('[aria-pressed=true]');if(target){target.tabIndex=-1;target.focus({preventScroll:true});if(target.tagName==='BUTTON')target.tabIndex=0}})}
  const saved=this.scroll,focus=this.focus;this.focus=''
  queueMicrotask(()=>{if(!scroller.isConnected)return;scroller.scrollTop=saved;if(focus==='back')scroller.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});else if(focus)Array.from(scroller.querySelectorAll<HTMLButtonElement>('[data-character-id]')).find(b=>b.dataset.characterId===focus)?.focus({preventScroll:true})})
  return form
 }
}

export const SETTINGS_WORKSPACE_STYLES=mochiStyle('settings-workspace-styles')
