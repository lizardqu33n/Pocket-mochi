import {el,button,requestId} from '../frontend/shared.js'
import {defaultUIPreferences,validateUIPreferences,TOOLBAR_LABELS,type UIPreferences,type UIPreferenceRecord} from './ui-preferences.js'

export const messengerUIPreferences=():UIPreferences=>({...defaultUIPreferences(),order:['presets','notes','memory','preview','settings','search','notifications','participants'],hidden:[]})

export class PersonalSettings {
 saved?:UIPreferenceRecord;draft?:UIPreferences;status='';private ticket='';private scope='';private timer?:ReturnType<typeof setTimeout>
 constructor(private send:(p:any)=>void,private current:()=>string|undefined,private owner:()=>string|undefined,private redraw:()=>void){}
 get value():UIPreferences{return this.saved?.preferences||messengerUIPreferences()}
 get dirty():boolean{return !!this.draft&&JSON.stringify(this.draft)!==JSON.stringify(this.value)}
 reset():void{clearTimeout(this.timer);this.ticket='';this.scope='';this.saved=undefined;this.draft=undefined;this.status=''}
 discard():void{this.draft=this.saved?structuredClone(this.saved.preferences):undefined}
 load(force=false):void{const scope=this.current()||'legacy';if(!force&&(this.scope===scope&&(this.ticket||this.saved)))return;this.scope=scope;this.request('get')}
 private request(action:'get'|'save'):void{
  const accountId=this.current();this.ticket=requestId('mochi_ui');const ticket=this.ticket;this.status=action==='save'?'Saving presentation…':'Loading presentation…';clearTimeout(this.timer)
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.ticket='';this.status='Presentation unavailable. Refresh to retry.';this.redraw()}},20000)
  this.send({type:'mochi:ui_preferences',requestId:ticket,action,accountId,...(action==='save'?{revision:this.saved?.revision,preferences:this.draft}:{})})
 }
 receive(p:any):boolean{
  if(!this.ticket||p?.requestId!==this.ticket||!['mochi:ui_preferences','mochi:error'].includes(p.type))return p?.type==='mochi:ui_preferences'
  this.ticket='';clearTimeout(this.timer)
  if((this.current()||'legacy')!==this.scope)return true
  if(p.type==='mochi:error'){this.status='Unable to save or load presentation. Refresh and review before retrying.';this.redraw();return true}
  const record=p.record
  if(!record||record.version!==1||!Number.isSafeInteger(record.revision)||record.revision<0||record.accountId!==this.current()||this.owner()&&record.ownerId!==this.owner())return true
  try{record.preferences=validateUIPreferences(record.preferences)}catch{return true}
  const dirty=this.dirty;if(record.revision===0)record.preferences=messengerUIPreferences();this.saved=record;if(!dirty)this.draft=structuredClone(record.preferences);this.status='Presentation saved for this fictional profile; legacy preferences belong to this Lumiverse login.';this.redraw();return true
 }
 render():HTMLElement{
  const root=el('section','mochi-personal-presentation');root.setAttribute('aria-label','Messenger presentation')
  root.append(el('h4','','Messenger presentation'),el('p','mochi-muted',(this.current()?'This fictional profile':'This Lumiverse login · Legacy view')+' · Save presentation applies toolbar and dock changes only. It never switches profiles or changes conversation behavior. Lumiverse theme and login settings remain native.'))
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');root.append(status)
  const refresh=button('Refresh presentation');refresh.onclick=()=>{this.load(true);this.redraw()};root.append(refresh)
  if(!this.saved)return root
  this.draft||=structuredClone(this.value);const draft=this.draft
  const choice=(label:string,key:'presentation'|'dock',values:Array<[string,string]>)=>{const wrap=el('label','',label),select=el('select');select.setAttribute('aria-label',label);for(const [value,name]of values){const o=el('option','',name);o.value=value;select.append(o)}select.value=draft[key];select.onchange=()=>{(draft as any)[key]=select.value};wrap.append(select);root.append(wrap)}
  choice('Toolbar presentation','presentation',[['icons','Compact icons'],['labels','Icons and labels']]);choice('Profile dock appearance','dock',[['comfortable','Avatar, name and username'],['compact','Compact avatar and profile selector']])
  root.append(el('h4','','Toolbar actions'),el('p','mochi-muted','Hidden tools stay in Room options. Search, Notifications and Participants stay in the header; Chat Settings stays at the bottom right. Profile switching remains available.'))
  const movable=draft.order.filter(key=>!['search','participants','notifications','settings'].includes(key))
  for(const [index,key]of movable.entries()){
   const row=el('div','mochi-toolbar-preference'),label=el('label','',TOOLBAR_LABELS[key]),shown=el('input');shown.type='checkbox';shown.checked=!draft.hidden.includes(key);shown.setAttribute('aria-label','Show '+TOOLBAR_LABELS[key]);shown.onchange=()=>{draft.hidden=draft.hidden.filter(k=>k!==key);if(!shown.checked)draft.hidden.push(key)};label.append(shown)
   const move=(delta:number)=>{const from=draft.order.indexOf(key),to=draft.order.indexOf(movable[index+delta]);[draft.order[from],draft.order[to]]=[draft.order[to],key];this.redraw()}
   const up=button('↑'),down=button('↓');up.setAttribute('aria-label','Move '+TOOLBAR_LABELS[key]+' up');down.setAttribute('aria-label','Move '+TOOLBAR_LABELS[key]+' down');up.disabled=index===0;down.disabled=index===movable.length-1;up.onclick=()=>move(-1);down.onclick=()=>move(1);row.append(label,up,down);root.append(row)
  }
  const save=button('Save presentation'),cancel=button('Cancel changes'),reset=button('Reset to defaults');cancel.setAttribute('aria-label','Cancel presentation changes');reset.setAttribute('aria-label','Restore default presentation');const actions=el('div','mochi-presentation-actions');save.disabled=!!this.ticket;save.onclick=()=>{this.request('save');this.redraw()};cancel.onclick=()=>{this.discard();this.redraw()};reset.onclick=()=>{this.draft=messengerUIPreferences();this.redraw()};actions.append(save,cancel,reset);root.append(actions)
  return root
 }
}
