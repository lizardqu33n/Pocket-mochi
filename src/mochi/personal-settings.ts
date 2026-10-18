import {mochiButton as button} from './ui/icon-slots.js'
import {el,requestId} from '../frontend/shared.js'
import {sharedUIDefaults,validateUIPreferences,TOOLBAR_LABELS,type UIPreferences,type UIPreferenceRecord} from './ui-preferences.js'
import {mochiIcon} from './ui/icon-slots.js'
export const messengerUIPreferences=sharedUIDefaults
export const PERSONAL_CATEGORIES=['Appearance','Toolbar','Notifications','Accessibility','General'] as const
export class PersonalSettings {
 saved?:UIPreferenceRecord;draft?:UIPreferences;status='';category:string='Appearance';private categoryOpen=false;private focusCategory=false;private ticket='';private scope='';private timer?:ReturnType<typeof setTimeout>;private layouts:Array<{name:string;record:UIPreferenceRecord}>=[];private source?:string
 constructor(private send:(p:any)=>void,private current:()=>string|undefined,private owner:()=>string|undefined,private redraw:()=>void){}
 get value():UIPreferences{return this.saved?.preferences||messengerUIPreferences()}
 get scales():UIPreferences{return this.draft||this.value}
 get dirty():boolean{return !!this.draft&&JSON.stringify(this.draft)!==JSON.stringify(this.value)}
 back():boolean{if(this.categoryOpen){this.categoryOpen=false;return true}return false}
 reset():void{clearTimeout(this.timer);this.ticket='';this.scope='';this.saved=undefined;this.draft=undefined;this.layouts=[];this.source=undefined;this.status='';this.category='Appearance';this.categoryOpen=false}
 discard():void{this.draft=this.saved?structuredClone(this.saved.preferences):undefined}
 load(force=false):void{const scope=this.owner()||'loading';if(!force&&this.scope===scope&&(this.ticket||this.saved))return;this.scope=scope;this.request('get')}
 private request(action:'get'|'save'):void{
  this.ticket=requestId('mochi_ui');const ticket=this.ticket;this.status=action==='save'?'Saving presentation…':'Loading presentation…';clearTimeout(this.timer)
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.ticket='';this.status='Presentation unavailable. Refresh to retry.';this.redraw()}},20000)
  const source=this.layouts.find(l=>(l.record.accountId||'legacy')===this.source)
  this.send({type:'mochi:ui_preferences',requestId:ticket,action:action==='get'?'shared_get':'shared_save',...(action==='save'?{revision:this.saved?.revision,preferences:this.draft,setupSource:this.source,sourceRevision:source?.record.revision}:{})})
 }
 receive(p:any):boolean{
  if(!this.ticket||p?.requestId!==this.ticket||!['mochi:ui_preferences','mochi:error'].includes(p.type))return p?.type==='mochi:ui_preferences'
  this.ticket='';clearTimeout(this.timer)
  if(p.type==='mochi:error'){this.status='Unable to save or load presentation. Refresh and review before retrying.';this.redraw();return true}
  const r=p.record
  if(!r||r.shared!==true||r.version!==1||!Number.isSafeInteger(r.revision)||r.revision<0||r.accountId!==undefined||this.owner()&&r.ownerId!==this.owner())return true
  try{r.preferences=validateUIPreferences(r.preferences)}catch{return true}
  const dirty=this.dirty;this.saved=r;this.layouts=p.layouts||[];if(!dirty)this.draft=structuredClone(r.preferences);this.status=r.revision?'Shared across your fictional Mochi accounts.':'Save to create your shared presentation.';this.redraw();return true
 }
 render():HTMLElement{
  const root=el('section','mochi-personal-presentation mochi-category-workspace');root.dataset.categoryOpen=String(this.categoryOpen)
  const nav=el('nav','mochi-settings-categories');nav.setAttribute('aria-label','Personal settings categories')
  for(const name of PERSONAL_CATEGORIES){const tab=button(name,'lp-button mochi-category-tab');tab.setAttribute('aria-label',name);tab.setAttribute('aria-pressed',String(this.category===name));tab.onclick=()=>{this.category=name;this.focusCategory=true;this.categoryOpen=true;this.redraw()};nav.append(tab)}
  const body=el('div','mochi-settings-scroll'),back=button('Back to Personal categories','mochi-category-back');back.onclick=()=>{this.categoryOpen=false;this.focusCategory=true;this.redraw()};body.append(back,el('h4','',this.category))
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');if(!this.saved||this.status.includes('Unable')||this.category==='General')body.append(status)
  const refresh=button('Refresh presentation');refresh.onclick=()=>{this.load(true);this.redraw()};if(this.category==='General'||!this.saved)body.append(refresh)
  root.append(nav,body)
  if(this.focusCategory){this.focusCategory=false;queueMicrotask(()=>{const target=this.categoryOpen?body.querySelector<HTMLElement>('h4'):nav.querySelector<HTMLElement>('[aria-pressed=true]');if(target){target.tabIndex=-1;target.focus({preventScroll:true});if(target.tagName==='BUTTON')target.tabIndex=0}})}
  if(!this.saved)return root
  this.draft||=structuredClone(this.value);const draft=this.draft
  if(!this.saved.revision&&this.layouts.length){
   const setup=el('section','mochi-shared-setup');setup.append(el('h4','','Choose your shared layout'),el('p','mochi-muted','Original account layouts remain saved. Choose one or start with new defaults.'))
   for(const item of [...this.layouts,{name:'New defaults',record:{preferences:messengerUIPreferences(),accountId:'defaults',revision:0}}]){
    const id=item.record.accountId||'legacy',choice=button(item.name+' · '+item.record.preferences.presentation+' · '+item.record.preferences.dock);choice.setAttribute('aria-pressed',String(this.source===id));choice.onclick=()=>{this.source=id;this.draft=structuredClone(item.record.preferences);this.redraw()};const preview=el('div','mochi-toolbar-live-preview');preview.setAttribute('aria-label','Layout preview for '+item.name);for(const key of item.record.preferences.order.filter(k=>!item.record.preferences.hidden.includes(k)&&['presets','memory','preview','notes'].includes(k))){const icon=el('span');icon.append(mochiIcon(key==='notes'?'pin':key==='presets'?'sliders':key==='memory'?'brain':key==='search'?'search':'eye','toolbar-'+key));icon.title=TOOLBAR_LABELS[key];preview.append(icon)}setup.append(choice,preview,el('small','mochi-muted','Source: '+id),el('small','mochi-muted',item.record.preferences.order.filter(k=>!item.record.preferences.hidden.includes(k)).map(k=>TOOLBAR_LABELS[k]).join(' · ')))
   }const use=button('Use selected shared layout','mochi-primary');use.disabled=!this.source||!!this.ticket;use.onclick=()=>{this.request('save');this.redraw()};setup.append(use);body.append(setup);return root
  }
  const choice=(label:string,key:'presentation'|'dock',values:Array<[string,string]>)=>{const wrap=el('label','',label),select=el('select');select.setAttribute('aria-label',label);for(const [value,name]of values){const o=el('option','',name);o.value=value;select.append(o)}select.value=draft[key];select.onchange=()=>{(draft as any)[key]=select.value;this.redraw()};wrap.append(select);body.append(wrap)}
  if(this.category==='Appearance'){
   body.append(el('p','mochi-muted','Colors inherit Lumiverse. Mochi Custom CSS can override presentation variables.'))
   choice('Interface density','dock',[['comfortable','Comfortable'],['compact','Compact']])
  }else if(this.category==='Toolbar'){
   choice('Toolbar presentation','presentation',[['icons','Compact icons'],['labels','Icons and labels']])
   const preview=el('div','mochi-toolbar-live-preview');preview.setAttribute('aria-label','Toolbar preview')
   const movable=draft.order.filter(k=>!['search','participants','notifications','settings'].includes(k))
   for(const key of movable.filter(k=>!draft.hidden.includes(k))){const icon=el('span');icon.append(mochiIcon(key==='notes'?'pin':key==='presets'?'sliders':key==='memory'?'brain':key==='search'?'search':'eye','toolbar-'+key));icon.title=TOOLBAR_LABELS[key];icon.setAttribute('aria-label',TOOLBAR_LABELS[key]);preview.append(icon)}body.append(preview)
   for(const visible of [true,false]){
    const group=el('section','mochi-toolbar-choice-group');group.append(el('h5','',visible?'Visible shortcuts':'Hidden shortcuts'))
    for(const key of movable.filter(k=>draft.hidden.includes(k)!==visible)){
     const row=el('div','mochi-toolbar-preference'),toggle=button((visible?'Hide ':'Show ')+TOOLBAR_LABELS[key]);toggle.setAttribute('aria-label','Show '+TOOLBAR_LABELS[key]);toggle.setAttribute('aria-pressed',String(visible));toggle.onclick=()=>{draft.hidden=draft.hidden.filter(k=>k!==key);if(visible)draft.hidden.push(key);this.redraw()}
     const index=movable.indexOf(key),move=(delta:number)=>{const from=draft.order.indexOf(key),to=draft.order.indexOf(movable[index+delta]);[draft.order[from],draft.order[to]]=[draft.order[to],key];this.redraw();queueMicrotask(()=>document.querySelector<HTMLButtonElement>('[aria-label="Move '+TOOLBAR_LABELS[key]+(delta<0?' up':' down')+'"]')?.focus())}
     const up=button('↑'),down=button('↓');up.setAttribute('aria-label','Move '+TOOLBAR_LABELS[key]+' up');down.setAttribute('aria-label','Move '+TOOLBAR_LABELS[key]+' down');up.disabled=index===0;down.disabled=index===movable.length-1;up.onclick=()=>move(-1);down.onclick=()=>move(1);row.append(toggle,up,down);group.append(row)
    }body.append(group)
   }body.append(el('p','mochi-muted','Search, Notifications and Participants stay in the header. Chat Settings stays at the bottom right. Hidden tools remain in Room options.'))
  }else if(this.category==='Accessibility'){
   for(const [key,label,max]of [['interfaceScale','Interface text size',150],['messageScale','Chat message text size',170]] as const){
    const wrap=el('label','mochi-scale-control',label),range=el('input'),output=el('output','',String(draft[key]||100)+'%');range.type='range';range.min='85';range.max=String(max);range.step='5';range.value=String(draft[key]||100);range.setAttribute('aria-label',label);range.setAttribute('aria-valuetext',range.value+'%');range.oninput=()=>{draft[key]=Number(range.value);output.value=range.value+'%';range.setAttribute('aria-valuetext',range.value+'%');const surface=root.closest<HTMLElement>('.mochi-desktop')||root.closest<HTMLElement>('.mochi-view');for(const node of [surface,...Array.from(surface?.querySelectorAll<HTMLElement>('.mochi-view,.mochi-sheet')||[])])node?.style.setProperty(key==='interfaceScale'?'--mochi-saved-interface-scale':'--mochi-saved-message-scale',String(Number(range.value)/100))};const reset=button('Reset '+label.toLowerCase());reset.onclick=()=>{draft[key]=100;this.redraw()};wrap.append(output,range,reset);body.append(wrap)
   }
   const preview=el('section','mochi-accessibility-preview');preview.append(el('h5','','Live preview'),el('p','','Navigation, settings and button labels'),button('Example control'),el('p','mochi-scale-message','A message bubble with independent text size.'));body.append(preview,el('p','mochi-muted','Preview updates immediately. Save applies across fictional accounts. Browser zoom remains available.'))
  }else if(this.category==='Notifications')body.append(el('p','','Mochi notification delivery follows the existing Lumiverse notification preference. Conversation read/unread controls remain in Notifications. Background messaging permission is user-wide; scheduled messages remain chat-specific.'))
  else body.append(el('p','','Account management is in Lumiverse’s outer Mochi sidebar. Presentation changes never change identities, messages or reply behavior.'))
  const actions=el('div','mochi-presentation-actions'),save=button('Save presentation','mochi-primary'),cancel=button('Cancel changes'),reset=button('Restore defaults');cancel.setAttribute('aria-label','Cancel presentation changes');reset.setAttribute('aria-label','Restore default presentation');save.disabled=!!this.ticket||(!this.saved.revision&&this.layouts.length>0&&!this.source);save.onclick=()=>{this.request('save');this.redraw()};cancel.onclick=()=>{this.discard();this.redraw()};reset.onclick=()=>{this.draft=messengerUIPreferences();this.redraw()};actions.append(save,cancel,reset);root.append(actions)
  return root
 }
}
