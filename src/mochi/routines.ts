import type { MochiRoom } from './types.js'
import type { PresenceStatus } from './presence.js'

export const DAYS = ['mo','tu','we','th','fr','sa','su'] as const
export const AUTONOMY = ['manual','temporary','review','autonomous'] as const
export interface RoutineEntry { id:string; days:Array<typeof DAYS[number]>; start:number; end:number; activity:string; presence:PresenceStatus; locked:boolean }
export interface QuietPeriod { days:Array<typeof DAYS[number]>; start:number; end:number }
export interface RoutinePlan { version:1; enabled:boolean; timezone:string; autonomy:typeof AUTONOMY[number]; locked:boolean; entries:RoutineEntry[]; quiet:QuietPeriod[]; fallback:{activity:string;presence:PresenceStatus} }
export interface ActivityOverride { id:string; activity:string; presence:PresenceStatus; startedAt:number; expiresAt:number; source:'user'|'character' }
export interface RoutineSnapshot { plan?:RoutinePlan; override?:ActivityOverride }
export interface RoutineChange { id:string; at:number; source:'user'|'character'|'undo'; before:RoutineSnapshot; after:RoutineSnapshot }
export interface RoutineProposal { id:string; entryId:string; entry:RoutineEntry; planRevision:string; createdAt:number }
export interface RoutineState extends RoutineSnapshot { history:RoutineChange[]; proposals:RoutineProposal[] }
const statuses = ['online','away','dnd','offline']
function object(v:any):boolean { return !!v&&typeof v==='object'&&!Array.isArray(v) }
function keys(v:any,allowed:string[]) { if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k)))throw Error('Unknown routine field.') }
export function routineId(v:unknown):string { if(typeof v!=='string'||!/^[A-Za-z0-9_-]{1,180}$/.test(v)||['__proto__','constructor','prototype'].includes(v))throw Error('Invalid routine identifier.');return v }
function activity(v:unknown):string { if(typeof v!=='string'||!v.trim()||v.length>160||/[\u0000-\u001f]/.test(v))throw Error('Activity must be 1–160 visible characters.');return v.trim() }
export function timezone(v:unknown):string {
 if(typeof v!=='string'||v.length>100||!/^([A-Za-z_+-]+\/)*[A-Za-z_+-]+$/.test(v))throw Error('Choose an IANA timezone.')
 try { return new Intl.DateTimeFormat('en',{timeZone:v}).resolvedOptions().timeZone }catch{throw Error('Choose an IANA timezone.')}
}
function period(v:any):QuietPeriod {
 if(!object(v)||!Array.isArray(v.days)||!v.days.length||v.days.length>7||new Set(v.days).size!==v.days.length||v.days.some((d:any)=>!DAYS.includes(d))||![v.start,v.end].every(n=>Number.isInteger(n)&&n>=0&&n<1440)||v.start===v.end)throw Error('Invalid weekly interval; use distinct minute boundaries and day codes mo..su.')
 return {days:[...v.days],start:v.start,end:v.end}
}
export function validateEntry(v:any):RoutineEntry {
 keys(v,['id','days','start','end','activity','presence','locked'])
 const p=period(v);if(!statuses.includes(v.presence)||typeof v.locked!=='boolean')throw Error('Invalid routine presence or lock.')
 return {...p,id:routineId(v.id),activity:activity(v.activity),presence:v.presence,locked:v.locked}
}
function intervals(p:QuietPeriod):Array<[number,number]> {
 return p.days.flatMap(day=>{const start=DAYS.indexOf(day)*1440+p.start,end=start+((p.end-p.start+1440)%1440);return end>10080?[[start,10080],[0,end-10080]] as Array<[number,number]>:[[start,end]]})
}
export function validatePlan(v:any):RoutinePlan {
 keys(v,['version','enabled','timezone','autonomy','locked','entries','quiet','fallback'])
 if(v.version!==1||typeof v.enabled!=='boolean'||typeof v.locked!=='boolean'||!AUTONOMY.includes(v.autonomy)||!Array.isArray(v.entries)||v.entries.length>64||!Array.isArray(v.quiet)||v.quiet.length>16)throw Error('Invalid routine settings or size.')
 const entries=v.entries.map(validateEntry),ids=new Set(entries.map((e:RoutineEntry)=>e.id));if(ids.size!==entries.length)throw Error('Routine entry IDs must be unique.')
 const occupied=entries.flatMap((e:RoutineEntry)=>intervals(e)).sort((a:[number,number],b:[number,number])=>a[0]-b[0])
 for(let i=1;i<occupied.length;i++)if(occupied[i][0]<occupied[i-1][1])throw Error('Weekly routine entries overlap, including overnight boundaries.')
 const quiet=v.quiet.map((p:any)=>{keys(p,['days','start','end']);return period(p)})
 keys(v.fallback,['activity','presence']);if(!statuses.includes(v.fallback.presence))throw Error('Invalid free-time presence.')
 return {version:1,enabled:v.enabled,timezone:timezone(v.timezone),autonomy:v.autonomy,locked:v.locked,entries,quiet,fallback:{activity:activity(v.fallback.activity),presence:v.fallback.presence}}
}
export function defaultRoutine():RoutinePlan { return {version:1,enabled:false,timezone:'UTC',autonomy:'temporary',locked:false,entries:[],quiet:[],fallback:{activity:'Free time / hobbies',presence:'online'}} }
export function validateOverride(v:any):ActivityOverride {
 keys(v,['id','activity','presence','startedAt','expiresAt','source'])
 if(!statuses.includes(v.presence)||!['user','character'].includes(v.source)||![v.startedAt,v.expiresAt].every(n=>Number.isSafeInteger(n)&&n>=0)||v.expiresAt<=v.startedAt||v.expiresAt-v.startedAt>240*60000)throw Error('Overrides must expire within four hours.')
 return {id:routineId(v.id),activity:activity(v.activity),presence:v.presence,startedAt:v.startedAt,expiresAt:v.expiresAt,source:v.source}
}
function snapshot(v:any):RoutineSnapshot {
 keys(v,['plan','override']);return {...(v.plan===undefined?{}:{plan:validatePlan(v.plan)}),...(v.override===undefined?{}:{override:validateOverride(v.override)})}
}
export function validateRoutineState(v:any):RoutineState {
 keys(v,['plan','override','history','proposals'])
 const current=snapshot({plan:v.plan,override:v.override})
 if(!Array.isArray(v.history)||v.history.length>32||!Array.isArray(v.proposals)||v.proposals.length>8)throw Error('Invalid routine audit history.')
 const history=v.history.map((h:any)=>{keys(h,['id','at','source','before','after']);routineId(h.id);if(!Number.isSafeInteger(h.at)||h.at<0||!['user','character','undo'].includes(h.source))throw Error('Invalid audit entry.');return {...h,before:snapshot(h.before),after:snapshot(h.after)}})
 const proposals=v.proposals.map((p:any)=>{keys(p,['id','entryId','entry','planRevision','createdAt']);routineId(p.id);routineId(p.entryId);if(p.entry.id!==p.entryId||typeof p.planRevision!=='string'||p.planRevision.length>40000||!Number.isSafeInteger(p.createdAt)||p.createdAt<0)throw Error('Invalid schedule proposal.');return {...p,entry:validateEntry(p.entry)}})
 return {...current,history,proposals}
}
export function planFor(room:MochiRoom,id:string):RoutinePlan|undefined { return (room.runtime?.routines||room.background?.routines)?.[id]?.plan||room.characterDefaults?.[id]?.routine }
function wallMinute(zone:string,now:number):number {
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now)
 const get=(type:string)=>parts.find(p=>p.type===type)!.value
 return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(get('weekday'))*1440+Number(get('hour'))*60+Number(get('minute'))
}
function contains(p:QuietPeriod,minute:number):boolean { return intervals(p).some(([a,b])=>minute>=a&&minute<b) }
export function routineAt(room:MochiRoom,id:string,now:number):{activity:string;presence:PresenceStatus;quiet:boolean;locked:boolean}|undefined {
 const plan=planFor(room,id);if(!plan?.enabled)return
 const minute=wallMinute(plan.timezone,now),entry=plan.entries.find(e=>contains(e,minute)),quiet=plan.quiet.some(p=>contains(p,minute)),base=entry||plan.fallback
 const override=(room.runtime?.routines||room.background?.routines)?.[id]?.override
 const active=override&&override.startedAt<=now&&now<override.expiresAt
 const locked=plan.locked||!!entry?.locked
 const usable=active&&(override.source==='user'||(!locked&&plan.autonomy!=='manual'&&!['dnd','offline'].includes(base.presence)))
 return {activity:usable?override.activity:base.activity,presence:quiet?'offline':usable?override.presence:base.presence,quiet,locked}
}
export function recordRoutine(state:RoutineState,next:RoutineSnapshot,id:string,at:number,source:RoutineChange['source']):void {
 const before=structuredClone({plan:state.plan,override:state.override}),after=structuredClone(next)
 state.plan=after.plan;state.override=after.override;state.history.push({id,at,source,before,after});state.history=state.history.slice(-32)
}
