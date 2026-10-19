import {el} from '../frontend/shared.js'
import {mochiButton as button} from './ui/icon-slots.js'
import {DAYS,AUTONOMY,defaultRoutine,planFor,routineAt,validatePlan,type RoutinePlan} from './routines.js'
import type {MochiRoom} from './types.js'

/** Semantic controls only: all presentation belongs to the existing theme contract. */
export function routineControls(plan:RoutinePlan,label:string):HTMLElement {
 const root=el('fieldset','mochi-routine-editor');root.dataset.mochiRoutine='editor';root.append(el('legend','','Weekly routine · '+label))
 const field=(title:string,node:HTMLElement)=>{const l=el('label','',title);node.setAttribute('aria-label',title+' for '+label);l.append(node);root.append(l)}
 const enable=el('input');enable.type='checkbox';enable.checked=plan.enabled;enable.onchange=()=>{plan.enabled=enable.checked};field('Enable weekly routine',enable)
 const zone=el('input');zone.value=plan.timezone;zone.maxLength=100;zone.oninput=()=>{plan.timezone=zone.value};field('IANA timezone',zone)
 const mode=el('select');for(const m of AUTONOMY){const o=el('option','',({manual:'Manual only',temporary:'Temporary overrides (suggested)',review:'Suggest permanent edits for review',autonomous:'Fully autonomous (explicit opt-in, undo available)'})[m]);o.value=m;mode.append(o)}mode.value=plan.autonomy;mode.onchange=()=>{plan.autonomy=mode.value as RoutinePlan['autonomy']};field('Character autonomy',mode)
 const lock=el('input');lock.type='checkbox';lock.checked=plan.locked;lock.onchange=()=>{plan.locked=lock.checked};field('Lock routine against character changes',lock)
 const fallback=el('input');fallback.value=plan.fallback.activity;fallback.maxLength=160;fallback.oninput=()=>{plan.fallback.activity=fallback.value};field('Uncovered time activity',fallback)
 root.append(el('p','mochi-muted','Weekly entries use local time in this timezone, including DST. End before start means overnight. Uncovered time uses the fallback. Quiet hours block delivery. Manual presence locks take precedence over routine presence.'))
 const rows=el('div','mochi-routine-entries');root.append(rows)
 const draw=()=>{
  rows.replaceChildren()
  for(const [index,e]of plan.entries.entries()){
   const row=el('fieldset','mochi-routine-entry');row.dataset.entryId=e.id;row.append(el('legend','','Entry '+(index+1)))
   const f=(title:string,node:HTMLElement)=>{const l=el('label','',title);node.setAttribute('aria-label',title+' '+e.id+' for '+label);l.append(node);row.append(l)}
   const days=el('input');days.value=e.days.join(',');days.oninput=()=>{e.days=days.value.split(',').map(d=>d.trim()) as any};f('Days mo,tu,we,th,fr,sa,su',days)
   for(const key of ['start','end'] as const){const time=el('input');time.type='time';time.value=String(Math.floor(e[key]/60)).padStart(2,'0')+':'+String(e[key]%60).padStart(2,'0');time.oninput=()=>{const [h,m]=time.value.split(':').map(Number);e[key]=h*60+m};f(key==='start'?'Start':'End',time)}
   const a=el('input');a.value=e.activity;a.maxLength=160;a.oninput=()=>{e.activity=a.value};f('Activity',a)
   const p=el('select');for(const s of ['online','away','dnd','offline']){const o=el('option','',s);o.value=s;p.append(o)}p.value=e.presence;p.onchange=()=>{e.presence=p.value as any};f('Presence',p)
   const locked=el('input');locked.type='checkbox';locked.checked=e.locked;locked.onchange=()=>{e.locked=locked.checked};f('User locked entry',locked)
   const remove=button('Remove entry '+e.id);remove.onclick=()=>{plan.entries.splice(index,1);draw()};row.append(remove);rows.append(row)
  }
 }
 draw();const add=button('Add routine entry');add.onclick=()=>{if(plan.entries.length<64){plan.entries.push({id:'entry_'+crypto.randomUUID().replaceAll('-',''),days:['mo'],start:540,end:1020,activity:'Work',presence:'away',locked:false});draw()}};root.append(add)
 const quiet=el('textarea');quiet.rows=2;quiet.maxLength=4000;quiet.value=JSON.stringify(plan.quiet);quiet.oninput=()=>{try{plan.quiet=JSON.parse(quiet.value);quiet.setCustomValidity('')}catch{quiet.setCustomValidity('Use a JSON list of quiet hours.')}};field('Quiet hours JSON: days, start and end in minutes',quiet)
 return root
}
export function roomRoutineControls(room:MochiRoom,id:string,name:string,send:(p:any)=>void):HTMLElement {
 const state=room.background?.routines?.[id],plan=structuredClone(planFor(room,id)||defaultRoutine()),root=el('section','mochi-routine-panel')
 root.dataset.characterId=id;root.dataset.mochiRoutine='panel'
 const current=routineAt(room,id,Date.now());const live=el('p','mochi-routine-activity',current?current.activity+' · '+current.presence:'Weekly routine is off');live.dataset.routineActivity=id;live.setAttribute('aria-live','polite');root.append(live,routineControls(plan,name))
 const error=el('p','mochi-error');error.setAttribute('role','alert');root.append(error)
 const dispatch=(p:any)=>send({roomId:room.id,characterId:id,revision:room.revision,...p})
 const save=button('Apply weekly routine for '+name);save.onclick=()=>{try{dispatch({action:'save',plan:validatePlan(plan)})}catch(e){error.textContent=(e as Error).message}}
 const defaults=button('Use character routine defaults for '+name);defaults.onclick=()=>dispatch({action:'defaults'});root.append(save,defaults)
 const activity=el('input');activity.maxLength=160;activity.setAttribute('aria-label','Live activity for '+name);activity.placeholder='Driving home early'
 const minutes=el('input');minutes.type='number';minutes.min='1';minutes.max='240';minutes.value='45';minutes.setAttribute('aria-label','Activity expiry minutes for '+name)
 const presence=el('select');presence.setAttribute('aria-label','Live activity presence for '+name);for(const p of ['online','away','dnd','offline']){const o=el('option','',p);o.value=p;presence.append(o)}presence.value='away'
 const override=button('Set temporary activity for '+name);override.onclick=()=>dispatch({action:'override',activity:activity.value,presence:presence.value,minutes:Number(minutes.value)})
 const clear=button('Clear temporary activity for '+name);clear.onclick=()=>dispatch({action:'clear'});root.append(activity,minutes,presence,override,clear)
 const history=el('ol','mochi-routine-history');history.setAttribute('aria-label','Routine change history for '+name)
 for(const h of state?.history.slice().reverse()||[]){const row=el('li','',new Date(h.at).toISOString()+' · '+h.source+' · '+h.id);history.append(row)}root.append(history)
 const last=state?.history.at(-1);if(last&&last.source!=='undo'){const undo=button('Undo last routine change for '+name);undo.onclick=()=>dispatch({action:'undo',changeId:last.id});root.append(undo)}
 return root
}
