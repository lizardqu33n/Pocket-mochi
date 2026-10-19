import {planFor,routineAt,validateEntry,validatePlan,validateOverride,recordRoutine,type RoutineEntry,type RoutinePlan} from './routines.js'
import {hhmm,preserveLocks} from './routine-generation.js'
import type {MochiRoom} from './types.js'
export interface RoutineActions { override?:{a:string;p:'online'|'away'|'dnd'|'offline';for:number}; edit?:RoutineEntry; planRevision:string }
function keys(v:any,allowed:string[]){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!allowed.includes(k)))throw Error('Invalid character schedule action.')}
export function parseRoutineActions(s:any,e:any,plan?:RoutinePlan):RoutineActions|undefined {
 if(s===undefined&&e===undefined)return
 const result:RoutineActions={planRevision:JSON.stringify(plan)||''}
 if(s!==undefined){keys(s,['a','p','for']);if(!Number.isInteger(s.for)||s.for<1||s.for>240)throw Error('Invalid activity expiry.');validateOverride({id:'validation',activity:s.a,presence:s.p,startedAt:0,expiresAt:s.for*60000,source:'character'});result.override={a:s.a,p:s.p,for:s.for}}
 if(e!==undefined){keys(e,['i','d','t','a','p']);if(typeof e.t!=='string'||!/^\d{4}-\d{4}$/.test(e.t))throw Error('Invalid edit range.');result.edit=validateEntry({id:e.i,days:e.d,start:hhmm(e.t.slice(0,4)),end:hhmm(e.t.slice(5)),activity:e.a,presence:e.p,locked:plan?.entries.find(b=>b.id===e.i)?.locked||false})}
 return result
}
export function validateStoredActions(v:RoutineActions):void {
 keys(v,['override','edit','planRevision']);if(typeof v.planRevision!=='string'||v.planRevision.length>40000)throw Error('Invalid action source revision.')
 if(v.override)parseRoutineActions(v.override,undefined)
 if(v.edit)validateEntry(v.edit)
}
/** Runs only inside the accepted reply's atomic room write; never invokes a provider. */
export function applyRoutineActions(room:MochiRoom,id:string,actions:RoutineActions|undefined,messageId:string,now:number):void {
 if(!actions)return
 validateStoredActions(actions)
 const plan=planFor(room,id),current=routineAt(room,id,now),presence=room.runtime?.presence?.[id]||room.characterDefaults?.[id]?.availability
 if(!room.characterIds.includes(id)||!plan?.enabled||plan.autonomy==='manual'||plan.locked||current?.quiet||current?.locked||presence?.manual||['dnd','offline'].includes(current?.presence||'')||JSON.stringify(plan)!==actions.planRevision)return
 room.runtime||={version:1,enabled:false,jobs:[]};room.runtime.routines||={}
 const state=room.runtime.routines[id]||{history:[],proposals:[]},changeId='reply_'+messageId.replaceAll('-','')
 if(state.history.some(h=>h.id===changeId)||state.proposals.some(p=>p.id===changeId))return
 let next={plan:state.plan,override:state.override},changed=false
 if(actions.override){const s=actions.override;next.override=validateOverride({id:changeId,activity:s.a,presence:s.p,startedAt:now,expiresAt:now+s.for*60000,source:'character'});changed=true}
 if(actions.edit&&(plan.autonomy==='review'||plan.autonomy==='autonomous')){
  const edit=actions.edit,previous=plan.entries.find(e=>e.id===edit.id)
  // Characters can only revise existing stable IDs, never locks/settings or create/delete blocks.
  if(previous&&!previous.locked){
   try{
    const candidate=validatePlan({...plan,entries:plan.entries.map(e=>e.id===edit.id?edit:e)});preserveLocks(plan,candidate)
    const recent=state.history.filter(h=>h.source==='character'&&h.at>now-86400000).length
    if(plan.autonomy==='autonomous'&&recent<4){next.plan=candidate;changed=true;state.proposals=[]}
    else if(state.proposals.length<8&&!state.proposals.some(p=>p.entryId===edit.id)){state.proposals.push({id:changeId,entryId:edit.id,entry:edit,planRevision:actions.planRevision,createdAt:now})}
   }catch{/* Invalid/colliding edits are discarded with the reply intact. */}
  }
 }
 if(changed)recordRoutine(state,next,changeId,now,'character')
 room.runtime.routines[id]=state
}
export function routineActionContract(room:MochiRoom,ids:string[],now=Date.now()):string {
 const enabled=ids.flatMap(id=>{const plan=planFor(room,id);return plan?.enabled&&plan.autonomy!=='manual'?[{id,autonomy:plan.autonomy,locked:plan.locked,timezone:plan.timezone,current:routineAt(room,id,now),entries:plan.entries}]:[]})
 return enabled.length?'\nOPT-IN ROUTINE ACTIONS: You may use compact JSON {"m":"message","s":{"a":"Driving home early","p":"away","for":45}} with a securely fixed speaker; otherwise include speakerId. s is optional live activity lasting 1–240 minutes. Activity and presence are separate. Optional e:{"i":"existing stable entry ID","d":["mo"],"t":"0900-1700","a":"Work","p":"away"} proposes one permanent edit only in review/autonomous mode. Never change locks, quiet hours, settings, add/delete entries or override DND/offline. No action applies until the reply is accepted. Current per-character grants: '+JSON.stringify(enabled):''
}
