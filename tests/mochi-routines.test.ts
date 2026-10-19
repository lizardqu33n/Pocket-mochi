import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {defaultRoutine,validatePlan,routineAt,validateOverride} from '../src/mochi/routines.js'
import {statusFor,defaultPresence,activityFor} from '../src/mochi/presence.js'
import {roomRoutineControls} from '../src/mochi/routine-controls.js'
import {fixture} from './mochi-accounts.test.js'
import type {MochiRoom} from '../src/mochi/types.js'
const entry=(extra:any={})=>({id:'work',days:['mo'],start:540,end:1020,activity:'Work',presence:'away',locked:false,...extra})
function plan(extra:any={}){return validatePlan({...defaultRoutine(),enabled:true,timezone:'America/Chicago',entries:[entry()],...extra})}
const room=(p=plan())=>({characterIds:['c'],characterDefaults:{},runtime:{version:1,enabled:false,jobs:[],routines:{c:{plan:p,history:[],proposals:[]}}}} as unknown as MochiRoom)

test('weekly routine and uncovered time are computed without jobs, including overnight Sunday wrapping',()=>{
 const r=room(plan({entries:[entry({days:['su'],start:1320,end:480,activity:'Sleeping',presence:'offline'})]}))
 expect(routineAt(r,'c',Date.parse('2026-10-19T08:00:00Z'))?.activity).toBe('Sleeping')
 expect(statusFor(r,'c',Date.parse('2026-10-19T13:00:00Z'))).toBe('online')
 expect(activityFor(r,'c',Date.parse('2026-10-19T13:00:00Z'))).toBe('Free time / hobbies')
 expect(r.runtime!.jobs).toEqual([])
})
test('IANA DST uses wall time through spring gaps and repeated fall hours',()=>{
 const r=room(plan({entries:[entry({days:['su'],start:90,end:150,activity:'Rest',presence:'away'})]}))
 for(const at of ['2026-11-01T06:45:00Z','2026-11-01T07:45:00Z'])expect(routineAt(r,'c',Date.parse(at))?.activity).toBe('Rest')
 expect(routineAt(r,'c',Date.parse('2026-03-08T08:15:00Z'))?.activity).toBe('Free time / hobbies')
 expect(routineAt(r,'c',Date.parse('2026-03-08T07:45:00Z'))?.activity).toBe('Rest')
})
test('overlap validation expands overnight blocks and rejects ambiguous or oversized data',()=>{
 for(const entries of [[entry(),entry({id:'two',start:1000})],[entry({days:['su'],start:1380,end:600}),entry({start:540})],[entry({days:['mo','mo']})],[entry({start:540,end:540})]])expect(()=>plan({entries})).toThrow()
 expect(()=>plan({timezone:'Mars/City'})).toThrow()
 expect(()=>plan({entries:Array.from({length:65},(_,i)=>entry({id:'e'+i}))})).toThrow()
 expect(()=>plan({untrusted:'field'})).toThrow()
 expect(()=>validateOverride({id:'x',activity:'Travel',presence:'away',startedAt:0,expiresAt:14400001,source:'character'})).toThrow()
})
test('manual presence, quiet hours, user locks and expiry have explicit precedence',()=>{
 const now=Date.parse('2026-10-19T15:00:00Z'),r=room()
 r.runtime!.routines!.c.override={id:'x',activity:'Driving home early',presence:'online',startedAt:now,expiresAt:now+60000,source:'character'}
 expect(activityFor(r,'c',now)).toBe('Driving home early')
 expect(activityFor(r,'c',now+60000)).toBe('Work')
 r.runtime!.routines!.c.plan!.entries[0].locked=true
 expect(activityFor(r,'c',now)).toBe('Work')
 r.runtime!.presence={c:{...defaultPresence(),manual:'dnd'}}
 expect(statusFor(r,'c',now)).toBe('dnd')
 r.runtime!.routines!.c.plan!.quiet=[{days:['mo'],start:0,end:1439}]
 expect(statusFor(r,'c',now)).toBe('offline')
})
test('routine disabled preserves existing legacy presence and defaults inherit only without a chat plan',()=>{
 const r=room(defaultRoutine());r.characterDefaults={c:{version:1,ownerId:'alice',characterId:'c',revision:1,about:'',routine:plan()}}
 const now=Date.parse('2026-10-19T15:00:00Z')
 expect(statusFor(r,'c',now)).toBe('online')
 delete r.runtime!.routines!.c.plan
 expect(statusFor(r,'c',now)).toBe('away')
})
for(const fictional of [false,true])test(`routine mutation is scoped, idempotent, revision safe and undoable (${fictional})`,async()=>{
 const f=fixture();try{
 const accountId=fictional?(await f.profile()).id:undefined,r=await f.room(accountId)
 const input={accountId,roomId:r.id,revision:r.revision,characterId:'alice_character',requestId:'routine_save',action:'save',plan:plan()}
 await f.service.configureRoutine('alice',input);await f.service.configureRoutine('alice',input)
 const saved=await f.service.read('alice',r.id,accountId);expect(saved.runtime!.routines!.alice_character.history).toHaveLength(1)
 await expect(f.service.configureRoutine('alice',{...input,requestId:'stale'})).rejects.toThrow('changed')
 await expect(f.service.configureRoutine('bob',input)).rejects.toThrow()
 if(fictional)await expect(f.service.configureRoutine('alice',{...input,accountId:undefined})).rejects.toThrow()
 await f.service.configureRoutine('alice',{...input,revision:saved.revision,requestId:'live',action:'override',activity:'Driving home early',presence:'away',minutes:45})
 f.restart();const live=await f.service.read('alice',r.id,accountId)
 expect(activityFor(live,'alice_character',f.now)).toBe('Driving home early')
 f.advance(46*60000);expect(activityFor(await f.service.read('alice',r.id,accountId),'alice_character',f.now)).toBe('Free time / hobbies')
 await f.service.configureRoutine('alice',{...input,revision:live.revision,requestId:'undo',action:'undo',changeId:'live'})
 expect((await f.service.read('alice',r.id,accountId)).runtime!.routines!.alice_character.override).toBeUndefined()
 expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})
test('quiet hours prevent generation, restart catch-up and missed-job provider calls',async()=>{
 const f=fixture();try{const r=await f.room();await f.scheduler.configure('alice',true);await f.service.configureScheduledRoom('alice',{roomId:r.id,revision:r.revision,enabled:true})
 await f.service.configureRoutine('alice',{roomId:r.id,revision:r.revision,characterId:'alice_character',requestId:'quiet',action:'save',plan:plan({timezone:'UTC',quiet:[{days:[...['mo','tu','we','th','fr','sa','su']],start:0,end:1439}]})})
 const saved=await f.service.read('alice',r.id);await f.service.schedule('alice',{roomId:r.id,revision:saved.revision,occurrenceId:'due',dueAt:f.now},f.now)
 f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(0)
 f.advance(3600001);await f.scheduler.tick();expect(f.calls).toHaveLength(0);expect((await f.service.read('alice',r.id)).runtime!.jobs[0].status).toBe('missed')
 }finally{f.scheduler.stop()}
})
test('routine controls expose labeled keyboard controls, stable entry selectors, audit and explicit apply',()=>{
 const dom=new JSDOM('<body>'),prior=globalThis.document;globalThis.document=dom.window.document
 try{const r=room();r.id='room_'+'1'.repeat(32);r.revision=1;r.background={enabled:false,jobs:[],routines:r.runtime!.routines};const sent:any[]=[]
 const root=roomRoutineControls(r,'c','Sam',p=>sent.push(p));expect(root.querySelector('[data-entry-id="work"]')).not.toBeNull();expect(root.querySelector('[aria-label="IANA timezone for Sam"]')).not.toBeNull();expect(sent).toHaveLength(0)
 const apply=Array.from(root.querySelectorAll('button')).find(b=>b.textContent==='Apply weekly routine for Sam')!;apply.click();expect(sent[0].action).toBe('save');expect(root.querySelector('[role="alert"]')).not.toBeNull()
 }finally{globalThis.document=prior;dom.window.close()}
})
