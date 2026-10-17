import {el,button} from '../frontend/shared.js'
import type {MochiRoom,MochiState} from './types.js'
import {statusFor} from './presence.js'

export const SETTINGS_CATEGORIES=['General','Texting Behavior','Availability & Schedules','Advanced'] as const
export class ChatSettingsLayout {
 category:string='General';private character='';private characterTab='texting';private scroll=0;private overviewScroll=0;private focus=''
 reset():void{this.category='General';this.character='';this.scroll=0;this.overviewScroll=0;this.focus=''}
 adapt(form:HTMLFormElement,room:MochiRoom,state:MochiState,redraw:()=>void,tools:(name:string,anchor:HTMLElement)=>void):HTMLFormElement{
  form.classList.add('mochi-organized-settings');form.setAttribute('aria-label','Chat Settings')
  form.querySelector('h3')?.remove()
  const sections=Array.from(form.querySelectorAll<HTMLElement>(':scope>.mochi-settings-section'))
  const title=(node:HTMLElement)=>node.querySelector('legend,summary')?.textContent||''
  const categories=new Map<string,HTMLElement>();for(const name of SETTINGS_CATEGORIES){const body=el('section','mochi-settings-category');body.setAttribute('aria-label',name+' settings');categories.set(name,body)}
  for(const node of sections){
   if(node.dataset.characterId)continue
   const name=title(node);let target=name==='Conversation'||name==='Chat ownership'?'General':name==='Background messaging'?'Availability & Schedules':'Advanced'
   if(name==='Connection & replies'){
    const texting=categories.get('Texting Behavior')!
    for(const label of ['Reply automatically after sending','Response mode','Next responder']){const field=node.querySelector(`[aria-label="${label}"]`)?.closest('label');if(field)texting.append(field)}
    const help=Array.from(node.querySelectorAll('p')).find(p=>p.textContent?.includes('Natural may choose'));if(help)texting.append(help);const responderHelp=Array.from(node.querySelectorAll('p')).find(p=>p.textContent?.startsWith('Next responder applies now'));if(responderHelp)texting.append(responderHelp)
   }
   if(name==='Connection & replies')node.querySelector('legend,summary')!.textContent='Connection & model'
   if(node.tagName==='DETAILS'&&name!=='Chat ownership')(node as HTMLDetailsElement).open=true
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
  for(const name of ['General','Texting Behavior','Availability & Schedules'])categories.get(name)!.append(el('h4','','Characters in this conversation'),overview())
  const advanced=categories.get('Advanced')!;advanced.append(el('p','mochi-muted','Advanced conversation tools · Presets publish reusable revisions; applying is separate. Preview is read-only. System Notes intentionally guide AI context.'))
  for(const name of ['Presets','Preview AI prompt','Conversation Memory','Pins & Notes']){const b=button(name);b.onclick=()=>tools(name,b);advanced.append(b)}
  const nav=el('nav','mochi-settings-categories');nav.setAttribute('aria-label','Chat settings categories')
  const scroller=el('div','mochi-settings-scroll');scroller.onscroll=()=>{this.scroll=scroller.scrollTop}
  const footer=form.querySelector<HTMLElement>(':scope>.mochi-actions')!
  form.replaceChildren(nav,scroller,footer)
  for(const name of SETTINGS_CATEGORIES){const tab=button(name);tab.setAttribute('aria-pressed',String(this.category===name));tab.onclick=()=>{this.category=name;this.character='';this.scroll=0;redraw()};nav.append(tab)}
  if(this.character){
   const detail=characters.find(s=>s.dataset.characterId===this.character)
   if(detail){
    if(detail.tagName==='DETAILS')(detail as HTMLDetailsElement).open=true
    const heading=detail.querySelector('summary,legend')!;heading.textContent=heading.textContent!.replace('presence & room name','character settings')
    const texting=el('div','mochi-character-fields'),availability=el('div','mochi-character-fields'),nickname=detail.querySelector('[aria-label^="Room name for "]')?.closest('label'),style=detail.querySelector('.mochi-texting-controls')
    if(nickname)texting.append(nickname);if(style)texting.append(style)
    for(const node of Array.from(detail.children))if(node!==heading)availability.append(node)
    const detailNav=el('nav','mochi-character-detail-nav');for(const [key,label]of [['texting','Texting & nickname'],['availability','Availability']] as const){const tab=button(label);tab.setAttribute('aria-label','Character '+key+' settings');tab.setAttribute('aria-pressed',String(this.characterTab===key));tab.onclick=()=>{this.characterTab=key;this.scroll=0;redraw()};detailNav.append(tab)}
    detail.replaceChildren(heading,detailNav,this.characterTab==='texting'?texting:availability)
    const back=button('Back to characters');back.onclick=()=>{const id=this.character;this.character='';this.scroll=this.overviewScroll;this.focus=id;redraw()}
    scroller.append(back,el('p','mochi-muted','This character within this conversation · Name and texting edits require Save. Presence, delays and schedule buttons apply immediately.'),detail)
   }else this.character=''
  }
  if(!this.character)scroller.append(categories.get(this.category)!)
  const saved=this.scroll,focus=this.focus;this.focus=''
  queueMicrotask(()=>{if(!scroller.isConnected)return;scroller.scrollTop=saved;if(focus==='back')scroller.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});else if(focus)Array.from(scroller.querySelectorAll<HTMLButtonElement>('[data-character-id]')).find(b=>b.dataset.characterId===focus)?.focus({preventScroll:true})})
  return form
 }
}

export const SETTINGS_WORKSPACE_STYLES=`
.mochi-view[data-settings-workspace=true]{display:flex;flex-direction:column;height:100%;min-height:0;padding:0;overflow:hidden}.mochi-desktop[data-settings-workspace=true]{grid-template-columns:minmax(0,1fr)!important}.mochi-desktop[data-settings-workspace=true]>.mochi-desktop-list,.mochi-desktop[data-settings-workspace=true]>.mochi-profile-panel,.mochi-desktop[data-settings-workspace=true] .mochi-desktop-back{display:none!important}.mochi-settings-workspace{display:flex;flex-direction:column;min-height:0;height:100%;overflow:hidden;background:var(--mochi-surface);color:inherit;container-type:inline-size}.mochi-settings-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-bottom:1px solid var(--mochi-border)}.mochi-settings-heading h3{margin:0;font-size:17px}.mochi-settings-tabs,.mochi-settings-categories{display:flex;flex-wrap:wrap;gap:6px;padding:8px 20px;border-bottom:1px solid var(--mochi-border);flex:none}.mochi-settings-workspace button{min-height:44px;font:inherit;color:inherit;font-size:12px}.mochi-settings-workspace button[aria-pressed=true]{border-color:var(--mochi-accent);box-shadow:inset 0 -2px var(--mochi-accent)}.mochi-settings-workspace>.mochi-muted{margin:0;padding:6px 20px;font-size:11px}.mochi-view .mochi-organized-settings{display:flex;flex:1;flex-direction:column;min-height:0;overflow:hidden;gap:0;padding:0}.mochi-settings-scroll,.mochi-personal-scroll{flex:1;min-height:0;overflow:auto;padding:16px 20px;overscroll-behavior:contain}.mochi-organized-settings>.mochi-actions{flex:none;padding:8px 20px;border-top:1px solid var(--mochi-border);background:var(--mochi-surface)}.mochi-view .mochi-settings-category{display:grid;align-content:start;gap:12px;min-width:0}.mochi-view .mochi-settings-category>.mochi-settings-section,.mochi-view .mochi-settings-scroll>.mochi-settings-section{border:0;border-radius:0;padding:0;background:transparent}.mochi-view .mochi-settings-scroll .mochi-settings-section>summary{padding:8px 0;border:0}.mochi-view .mochi-settings-scroll .mochi-settings-section[open]>:not(summary){margin:0 0 12px}.mochi-view .mochi-settings-category label,.mochi-view .mochi-personal-scroll label{min-width:0}.mochi-character-settings-list{display:grid;gap:0}.mochi-character-settings-row{display:flex;align-items:center;gap:10px;min-height:64px;padding:8px 0;border-bottom:1px solid var(--mochi-border)}.mochi-character-settings-row>div{display:grid;gap:3px;flex:1;min-width:0}.mochi-character-settings-row strong{overflow-wrap:anywhere;font-size:13px}.mochi-character-settings-row small{font-size:11px}.mochi-character-settings-row>.mochi-avatar{width:36px;height:36px;flex:none}.mochi-toolbar-preference{display:flex;gap:6px;align-items:center;border-bottom:1px solid var(--mochi-border);padding:6px 0}.mochi-toolbar-preference>label{flex:1;display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:8px}.mochi-toolbar-preference input[type=checkbox]{width:20px;height:20px;min-height:20px;accent-color:var(--mochi-accent)}.mochi-personal-presentation{display:grid;gap:12px;max-width:780px}.mochi-personal-presentation>button{justify-self:start}.mochi-profile-dock{display:flex;align-items:center;gap:8px;min-width:0}.mochi-profile-dock>.mochi-avatar{width:36px;height:36px;flex:none}.mochi-profile-dock>div{min-width:0;flex:1;display:grid}.mochi-profile-dock select{max-width:100%;min-width:0;font-size:12px}.mochi-profile-dock small{font-size:10px;overflow:hidden;text-overflow:ellipsis}.mochi-profile-dock[data-compact=true] .mochi-dock-username{display:none}.mochi-toolbar-label{font-size:11px}.mochi-view .mochi-custom-toolbar{flex-wrap:wrap;justify-content:flex-end;gap:2px}.mochi-view .mochi-custom-toolbar button{min-height:44px;min-width:40px;padding:6px}.mochi-custom-toolbar .mochi-toolbar-label{margin-left:4px}.mochi-settings-workspace :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}.mochi-settings-workspace select,.mochi-settings-workspace input,.mochi-settings-workspace textarea{max-width:100%;box-sizing:border-box}.mochi-view .mochi-settings-workspace .mochi-settings-category>button{justify-self:start}
.mochi-view[data-conversation=true] .mochi-room-header{grid-template-columns:minmax(140px,1fr) minmax(0,auto)}.mochi-view .mochi-room-header .mochi-custom-toolbar{max-width:650px}.mochi-view .mochi-room-header .mochi-custom-toolbar button{display:inline-flex;align-items:center;justify-content:center;flex:none}.mochi-view .mochi-room-header .mochi-custom-toolbar[data-presentation=labels] button:has(.mochi-toolbar-label){width:auto;height:auto;border-radius:12px;padding:8px;gap:4px;white-space:nowrap}.mochi-view .mochi-custom-toolbar button>span:first-child{display:inline-flex;flex:none}.mochi-view .mochi-custom-toolbar svg{width:18px;height:18px;flex:none}.mochi-view .mochi-custom-toolbar .mochi-toolbar-label{margin:0}.mochi-presentation-actions{display:flex;flex-wrap:wrap;gap:8px;flex:none;padding:8px 20px;border-top:1px solid var(--mochi-border);background:var(--mochi-surface)}.mochi-character-detail-nav{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.mochi-character-fields{display:grid;gap:12px}.mochi-view .mochi-presentation-actions button{min-height:44px}.mochi-view .mochi-settings-workspace .mochi-personal-scroll{overflow-wrap:anywhere}
@container(max-width:550px){.mochi-settings-heading{padding:10px 12px}.mochi-settings-heading h3{font-size:15px}.mochi-settings-tabs,.mochi-settings-categories{padding:6px 12px;gap:4px}.mochi-settings-scroll,.mochi-personal-scroll{padding:12px}.mochi-settings-categories>button{flex:1 1 40%;white-space:normal}.mochi-organized-settings>.mochi-actions{padding:8px 12px}.mochi-view .mochi-custom-toolbar{max-width:100%}.mochi-view .mochi-custom-toolbar .mochi-toolbar-label{display:none}}
`
