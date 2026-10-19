import {routineControls} from './routine-controls.js'
import {defaultRoutine} from './routines.js'
import {mochiButton as button} from './ui/icon-slots.js'
import {el} from '../frontend/shared.js'
import {textingControls} from './texting-controls.js'
import {defaultMochiSettings,type MochiCharacter} from './types.js'
import {defaultPresence,STATUSES} from './presence.js'
import type {CharacterPreferences} from './character-preferences.js'
export class CharacterEditor {
 private drafts=new Map<string,{revision:number;value:CharacterPreferences;baseline:string}>()
 get dirty(){return [...this.drafts.values()].some(d=>JSON.stringify(d.value)!==d.baseline)}
 discard(){this.drafts.clear()}
 render(character:MochiCharacter,send:(p:any)=>void,redraw:()=>void,mode:'texting'|'availability'|'about'='texting'):HTMLElement{
  const root=el('section','mochi-character-defaults'),saved=character.preferences
  if(!saved){root.append(el('p','mochi-muted','Refresh character choices to edit Mochi defaults.'));return root}
  let draft=this.drafts.get(character.id)
  if(!draft||draft.revision!==saved.revision){const value=structuredClone(saved);draft={revision:saved.revision,value,baseline:JSON.stringify(value)};this.drafts.set(character.id,draft)}
  const value=draft.value
  root.append(el('h4','',mode==='about'?'Mochi About Me':'Character-wide Mochi defaults'),el('p','mochi-muted','Shared across your fictional accounts and chats. Native character instructions stay unchanged.'))
  if(mode==='about'){const label=el('label','','About Me'),bio=el('textarea');bio.maxLength=2000;bio.rows=3;bio.value=value.about;bio.setAttribute('aria-label','Mochi About Me for '+character.name);bio.oninput=()=>{value.about=bio.value};label.append(bio);root.append(label)}
  if(mode==='texting'){
   const settings=defaultMochiSettings();settings.textingStyles={[character.id]:value.texting||{}}
   const texting=textingControls(settings,character.id,'character default '+character.name);texting.querySelector('legend')!.textContent='Texting defaults';texting.querySelector('small')!.textContent='Used when a chat has no explicit texting override.'
   texting.addEventListener('input',()=>{value.texting=settings.textingStyles?.[character.id]});texting.addEventListener('change',()=>{value.texting=settings.textingStyles?.[character.id]});root.append(texting)
  }
  if(mode==='availability'){
   value.routine||=defaultRoutine();root.append(routineControls(value.routine,'character default '+character.name))
   const presence=value.availability||defaultPresence(),wrap=el('label','','Default availability'),status=el('select');status.setAttribute('aria-label','Default availability for '+character.name)
   for(const id of STATUSES){const o=el('option','',id);o.value=id;status.append(o)}status.value=presence.manual||presence.automatic;status.onchange=()=>{value.availability={...(value.availability||presence),automatic:status.value as any,manual:null,transitions:[]}};wrap.append(status);root.append(wrap)
   for(const [key,name]of [['awayMs','Away delay'],['dndMs','DND delay']] as const){const l=el('label','',name+' (minutes)'),i=el('input');i.type='number';i.min='0';i.max='1440';i.value=String(presence[key]/60000);i.setAttribute('aria-label','Default '+name+' for '+character.name);i.oninput=()=>{value.availability={...(value.availability||presence),[key]:Number(i.value)*60000,transitions:[]}};l.append(i);root.append(l)}
  }
  const actions=el('div','mochi-actions'),save=button('Save character profile','mochi-primary'),cancel=button('Cancel character changes');save.onclick=()=>send({characterId:character.id,revision:saved.revision,about:value.about,texting:value.texting||null,availability:value.availability||null,...(value.routine?{routine:value.routine}:{})});cancel.onclick=()=>{this.drafts.delete(character.id);redraw()};actions.append(save,cancel);root.append(actions);return root
 }
}
