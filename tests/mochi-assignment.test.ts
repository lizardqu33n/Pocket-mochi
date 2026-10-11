import {test,expect} from 'bun:test'
import {fixture} from './mochi-accounts.test.js'
import {MochiView} from '../src/mochi/view.js'

const path=(id:string)=>'alice:mochi/v1/rooms/'+id+'.json'
const assignment=(room:any,targetAccountId:string)=>({roomId:room.id,accountId:room.accountId,targetAccountId,revision:room.revision,associationRevision:room.associationRevision||0,confirmed:true,preservePersona:true})

test('explicit legacy assignment preserves histories, snapshots, revisions, receipts and pending schedules across restart',async()=>{
 const f=fixture(),a=await f.profile(),room=await f.room()
 await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'legacy_seed',content:'Legacy history'})
 let current=await f.service.read('alice',room.id)
 await f.service.action('alice',{roomId:room.id,revision:current.revision,requestId:'legacy_edit',action:'edit',messageId:current.messages[0].id,content:'Edited history'})
 current=await f.service.read('alice',room.id)
 await f.scheduler.configure('alice',true)
 await f.service.configureScheduledRoom('alice',{roomId:room.id,revision:current.revision,enabled:true})
 await f.service.schedule('alice',{roomId:room.id,revision:current.revision,occurrenceId:'preserved_job',dueAt:f.now+60000},f.now)
 const before=structuredClone(f.files.get(path(room.id))),bank=structuredClone(f.files.get('alice:mochi/v1/fictional-accounts.json'))
 await f.service.assignRoom('alice',assignment(before,a.id))
 const expected=structuredClone(before);expected.accountId=a.id;expected.associationRevision=1;for(const n of expected.notifications)n.accountId=a.id
 expect(f.files.get(path(room.id))).toEqual(expected);expect(f.files.get('alice:mochi/v1/fictional-accounts.json')).toEqual(bank)
 expect((await f.service.state('alice')).rooms).toEqual([]);expect((await f.service.state('alice',a.id)).rooms[0].persona.name).toBe('Legacy identity')
 f.restart();f.advance(60000);await f.scheduler.tick()
 const after=await f.service.read('alice',room.id,a.id);expect(after.messages.slice(0,before.messages.length)).toEqual(before.messages);expect(after.receipts).toEqual(before.receipts)
 expect(f.calls).toHaveLength(2);expect(f.calls[1].messages[0].content).toContain('Legacy identity');expect(f.calls[1].messages[0].content).not.toContain('MARY_PRIVATE')
 f.scheduler.stop()
})

test('interrupted ownership save preserves canonical history and reassignment rejects stale ABA requests',async()=>{
 const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(),before=structuredClone(f.files.get(path(room.id)))
 f.fail(path(room.id));await expect(f.service.assignRoom('alice',assignment(room,a.id))).rejects.toThrow('Rename');expect(f.files.get(path(room.id))).toEqual(before)
 f.restart();f.fail();await f.service.assignRoom('alice',assignment(room,a.id))
 const owned=await f.service.read('alice',room.id,a.id),stale=assignment(owned,b.id)
 await f.service.assignRoom('alice',stale);await f.service.assignRoom('alice',assignment(await f.service.read('alice',room.id,b.id),a.id))
 await expect(f.service.assignRoom('alice',stale)).rejects.toThrow('assignment changed')
 const final=await f.service.read('alice',room.id,a.id);expect(final.revision).toBe(before.revision);expect(final.associationRevision).toBe(3);expect(final.persona).toEqual(before.persona);f.scheduler.stop()
})

test('assignment is explicit, account-owned and refuses active generation without canceling it',async()=>{
 const f=fixture(),a=await f.profile(),foreign=await f.profile('p3','bob'),room=await f.room()
 await expect(f.service.assignRoom('alice',{...assignment(room,a.id),confirmed:false})).rejects.toThrow('Confirm')
 await expect(f.service.assignRoom('alice',assignment(room,foreign.id))).rejects.toThrow('not available')
 let release!:(v:any)=>void,started!:()=>void;const ready=new Promise<void>(r=>started=r)
 f.host.generate!.quiet=async request=>{f.calls.push(request);started();return new Promise(r=>release=r)}
 const run=f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'assignment_race',content:'Keep reply'})
 await ready;const generating=await f.service.read('alice',room.id)
 await expect(f.service.assignRoom('alice',assignment(generating,a.id))).rejects.toThrow('active generation')
 release({content:'{"speakerId":"alice_character","text":"Original reply"}'});await run
 expect((await f.service.read('alice',room.id)).messages).toHaveLength(2)
 await f.service.assignRoom('alice',assignment(await f.service.read('alice',room.id),a.id));f.scheduler.stop()
})

test('stale old-scope notification events cannot reappear after assignment or expose the wrong room',async()=>{
 const f=fixture(),a=await f.profile(),room=await f.room()
 await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'notice_before_assignment',content:'Keep'})
 const oldState=await f.service.state('alice'),notice=structuredClone(oldState.notifications![0]),sent:any[]=[]
 const view=new MochiView(p=>sent.push(p),()=>{},()=>{});view.state=oldState
 await f.service.assignRoom('alice',assignment(await f.service.read('alice',room.id),a.id))
 view.receive(f.events.at(-1)!.payload)
 view.receive({type:'mochi:notification',notification:notice,notificationRevision:999})
 view.receive({type:'mochi:notifications',notifications:[notice],notificationRevisions:{[room.id]:999}})
 view.receive({type:'mochi:state',requestId:sent.at(-1).requestId,state:oldState})
 expect(view.state!.rooms).toEqual([]);expect(view.state!.notifications).toEqual([])
 const owned=await f.service.state('alice',a.id);expect(owned.notifications![0].roomId).toBe(room.id);expect(owned.notifications![0].accountId).toBe(a.id)
 view.destroy();f.scheduler.stop()
})
