import { test, expect } from 'bun:test'
import { MochiScheduler } from '../src/mochi/scheduler.js'
import { MochiService, type MochiHost } from '../src/mochi/service.js'
import { defaultMochiSettings } from '../src/mochi/types.js'
import { defaultPresence, statusFor } from '../src/mochi/presence.js'
import { parseBehavior } from '../src/mochi/behavior.js'

function fixture() {
  const files = new Map<string, any>(), calls: any[] = [], events: any[] = []
  let now = 1000000, counter = 0, failure = '', owned = true
  const read = async (key: string) => { if (!files.has(key)) throw Error('Missing file'); return structuredClone(files.get(key)) }
  const write = async (key: string, data: any) => { if (failure === key) throw Error('Disk write failed'); files.set(key, structuredClone(data)) }
  const move = async (from: string, to: string) => { if (failure === to) throw Error('Rename failed'); files.set(to, files.get(from)); files.delete(from) }
  const host: MochiHost = {
    storage: { exists: async p => files.has('global:'+p), getJson: p => read('global:'+p), setJson: (p,v) => write('global:'+p,v), move: (a,b) => move('global:'+a,'global:'+b) },
    userStorage: { exists: async(p,u)=>files.has(u+':'+p), getJson: (p,o)=>read(o.userId+':'+p), setJson: (p,v,o)=>write(o.userId+':'+p,v), move: (a,b,u)=>move(u+':'+a,u+':'+b), list: async(p,u)=>[...files.keys()].filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length)) },
    users: { getRole: async u => { if (!['alice','bob'].includes(u!)) throw Error('User not found'); return 'user' } },
    characters: { get: async(id,u)=>owned && id===u+'_character' ? {id,name:u+' character'} : null, list: async({userId})=>({data:[{id:userId+'_character',name:'Character'}]}) },
    personas: { get: async()=>null, list: async()=>({data:[]}) }, permissions: {has:()=>true},
    connections: { get: async(id,u)=>owned && id===u+'_connection' ? {id,model:'mock-model'} : null, list:async()=>[] },
    tokens: { countMessages:async()=>({total_tokens:200}) },
    generate: { quiet:async request=>{ calls.push(request); return {content:JSON.stringify({speakerId:request.userId+'_character',text:'Server reply'})} } },
    sendToFrontend: (payload,user)=>events.push({payload,user}),
  }
  // Missing optional profile bank must behave like the real host fallback, but corrupt records must throw.
  const getJson=host.userStorage.getJson
  host.userStorage.getJson=async(p,o)=>!files.has(o.userId+':'+p)&&'fallback'in o ? o.fallback : getJson(p,o)
  let service = new MochiService(host,()=>`room_${(++counter).toString(16).padStart(32,'0')}`,()=>now)
  let scheduler = new MochiScheduler(host,service,()=>now);scheduler.start(false)
  const create=async(user='alice')=>{
    const input={title:'Independent',characterIds:[user+'_character'],persona:{source:'manual',name:'Stable persona'}}
    let room=await service.create(user,input)
    room=await service.update(user,{...input,roomId:room.id,revision:room.revision,settings:{...defaultMochiSettings(),connectionId:user+'_connection'}})
    await scheduler.configure(user,true)
    await service.configureScheduledRoom(user,{roomId:room.id,revision:room.revision,enabled:true})
    return service.read(user,room.id)
  }
  const schedule=async(room:any,id='occurrence',user='alice',dueAt=now)=>scheduler.handle({type:'mochi:schedule',roomId:room.id,revision:room.revision,occurrenceId:id,dueAt},user)
  const restart=()=>{scheduler.stop();service=new MochiService(host,undefined,()=>now);scheduler=new MochiScheduler(host,service,()=>now);scheduler.start(false)}
  return {host,files,calls,events,create,schedule,restart,get service(){return service},get scheduler(){return scheduler},get now(){return now},advance:(ms:number)=>{now+=ms},fail:(key:string)=>{failure=key},revoke:()=>{owned=false}}
}

test('server-only due delivery is durable, account scoped, and independent of interactive receipts',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room);await f.scheduler.tick()
  const saved=await f.service.read('alice',room.id)
  expect(f.calls).toHaveLength(1);expect(saved.messages).toHaveLength(1);expect(saved.receipts).toEqual([])
  expect(saved.runtime!.jobs[0].status).toBe('delivered');expect(saved.notifications![0].read).toBe(false)
  expect(f.events.every(e=>e.user==='alice')).toBe(true)
  await f.scheduler.tick();f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(1)
  f.scheduler.stop()
})
test('restart before due restores schedules without any browser or reset of budget',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room,'later','alice',f.now+60000);f.restart()
  await f.scheduler.tick();expect(f.calls).toHaveLength(0);f.advance(60000);await f.scheduler.tick();expect(f.calls).toHaveLength(1)
  expect(f.files.get('alice:mochi/v1/scheduler.json').attempts).toHaveLength(1);f.scheduler.stop()
})
test('shutdown during generation retains pending work for restart instead of treating shutdown as opt-out',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  let release!:(r:any)=>void,ready!:()=>void;const started=new Promise<void>(r=>{ready=r})
  const original=f.host.generate!.quiet
  f.host.generate!.quiet=async request=>{f.calls.push(request);ready();return new Promise(r=>{release=r})}
  const running=f.scheduler.tick();await started;f.scheduler.stop()
  release({content:'{"speakerId":"alice_character","text":"Late shutdown result"}'});await running
  const saved=await f.service.read('alice',room.id)
  expect(saved.messages).toEqual([]);expect(saved.runtime!.jobs[0].status).toBe('queued')
  f.host.generate!.quiet=original;f.advance(60000);f.restart();await f.scheduler.tick()
  expect(f.calls).toHaveLength(2);expect((await f.service.read('alice',room.id)).messages).toHaveLength(1);f.scheduler.stop()
})
test('delivered occurrence survives user deletion and cannot recreate the deleted message',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room);await f.scheduler.tick()
  const saved=await f.service.read('alice',room.id)
  await f.service.action('alice',{roomId:room.id,revision:saved.revision,requestId:'delete',action:'delete',messageId:(saved.messages[0]as any).id,confirmed:true})
  f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(1);expect((await f.service.read('alice',room.id)).messages).toEqual([]);f.scheduler.stop()
})
test('duplicate dispatch and interactive Stop do not cancel server-owned generation',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  let release!:(r:any)=>void,ready!:()=>void;const started=new Promise<void>(r=>{ready=r})
  f.host.generate!.quiet=async request=>{f.calls.push(request);ready();return new Promise(r=>{release=r})}
  const running=f.scheduler.tick();await started
  await f.scheduler.tick();await f.service.cancel('alice',room.id,'server_occurrence')
  expect(f.calls[0].signal.aborted).toBe(false);expect((await f.service.state('alice')).jobs).toEqual({})
  release({content:'{"speakerId":"alice_character","text":"Delivered"}'});await running
  expect((await f.service.read('alice',room.id)).messages).toHaveLength(1);f.scheduler.stop()
})
test('account opt-out aborts pending provider output and never commits late replies',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  let release!:(r:any)=>void,ready!:()=>void;const started=new Promise<void>(r=>{ready=r})
  f.host.generate!.quiet=async request=>{f.calls.push(request);ready();return new Promise(r=>{release=r})}
  const running=f.scheduler.tick();await started;await f.scheduler.configure('alice',false)
  release({content:'{"speakerId":"alice_character","text":"Unwanted"}'});await running
  const saved=await f.service.read('alice',room.id);expect(saved.messages).toEqual([]);expect(saved.runtime!.jobs[0].status).toBe('cancelled');f.scheduler.stop()
})
test('expired claims recover conservatively, and generated drafts never leak or regenerate',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  const key='alice:mochi/v1/rooms/'+room.id+'.json',saved=f.files.get(key)
  const job=saved.runtime.jobs[0];job.status='generating';job.attempts=1;job.claim='old_claim';job.leaseUntil=f.now+240000
  f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(0)
  f.advance(240001);await f.scheduler.tick();expect(f.calls).toHaveLength(1)
  const next=await f.create();await f.schedule(next,'generated')
  const nextStored=f.files.get('alice:mochi/v1/rooms/'+next.id+'.json'),j=nextStored.runtime.jobs[0]
  j.status='generated';j.attempts=1;j.draft={characterId:'alice_character',name:'Name',avatarUrl:'',text:'Private undelivered draft'}
  const publicState=JSON.stringify(await f.service.state('alice'))
  expect(publicState).not.toContain('Private undelivered draft');expect(publicState).not.toContain('draft');expect(publicState).not.toContain('runtime')
  f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(1);expect((await f.service.read('alice',next.id)).messages).toHaveLength(1);f.scheduler.stop()
})
test('ownership revoked during generation pauses without committing or retry loops',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  f.host.generate!.quiet=async request=>{f.calls.push(request);f.revoke();return {content:'{"speakerId":"alice_character","text":"Discard"}'}}
  await f.scheduler.tick();f.advance(300000);await f.scheduler.tick()
  const saved=await f.service.read('alice',room.id);expect(saved.messages).toEqual([]);expect(saved.runtime!.jobs[0].status).toBe('paused');expect(f.calls).toHaveLength(1);f.scheduler.stop()
})
test('room revision changes supersede pending work without an extra provider call',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'newer',content:'New conversation',responder:'auto'})
  await f.scheduler.tick();expect(f.calls).toHaveLength(1);expect((await f.service.read('alice',room.id)).runtime!.jobs[0].status).toBe('cancelled');f.scheduler.stop()
})
test('temporary outages retry at most three times with durable backoff',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  f.host.generate!.quiet=async request=>{f.calls.push(request);throw Error('503 temporarily unavailable')}
  await f.scheduler.tick();await f.scheduler.tick();expect(f.calls).toHaveLength(1)
  f.advance(60000);f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(2)
  f.advance(120000);await f.scheduler.tick();f.advance(240000);await f.scheduler.tick();expect(f.calls).toHaveLength(3)
  expect((await f.service.read('alice',room.id)).runtime!.jobs[0].status).toBe('failed');f.scheduler.stop()
})
test('long server downtime marks overdue work missed instead of generating catch-up messages',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room);f.advance(86400000);f.restart();await f.scheduler.tick()
  expect(f.calls).toHaveLength(0);expect((await f.service.read('alice',room.id)).runtime!.jobs[0].status).toBe('missed');f.scheduler.stop()
})
test('multiple opted-in accounts retain their own providers, rooms and notifications',async()=>{
  const f=fixture(),alice=await f.create(),bob=await f.create('bob');await f.schedule(alice);await f.schedule(bob,'bob_job','bob');await f.scheduler.tick()
  expect(f.calls.map(c=>c.userId).sort()).toEqual(['alice','bob'])
  expect(f.calls.every(c=>c.connection_id===c.userId+'_connection')).toBe(true)
  expect((await f.service.state('alice')).notifications!.every(n=>n.roomId===alice.id)).toBe(true)
  expect((await f.service.state('bob')).notifications!.every(n=>n.roomId===bob.id)).toBe(true)
  await expect(f.scheduler.handle({type:'mochi:schedule_cancel',roomId:alice.id,occurrenceId:'occurrence'},'bob')).rejects.toThrow('account');f.scheduler.stop()
})
test('budget reservations survive restart and block additional provider calls',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  f.files.get('alice:mochi/v1/scheduler.json').attempts=Array.from({length:6},()=>({at:f.now,roomId:room.id}))
  f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(0)
  f.scheduler.stop()
})
test('interrupted draft commit preserves generated text and recovery does not regenerate',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  const key='alice:mochi/v1/rooms/'+room.id+'.json',original=f.host.userStorage.move
  let interrupted=false
  f.host.userStorage.move=async(a,b,u)=>{
    if(!interrupted&&b==='mochi/v1/rooms/'+room.id+'.json'&&f.files.get(u+':'+a)?.runtime.jobs[0].status==='delivered'){interrupted=true;throw Error('Rename failed')}
    return original(a,b,u)
  }
  await f.scheduler.tick();expect(f.calls).toHaveLength(1);expect(f.files.get(key).runtime.jobs[0].draft.text).toBe('Server reply')
  f.advance(60000);f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(1);expect((await f.service.read('alice',room.id)).messages).toHaveLength(1);f.scheduler.stop()
})
test('damaged account/room/registry records fail closed and are never replaced with defaults',async()=>{
  const f=fixture(),room=await f.create();await f.schedule(room)
  const key='global:mochi/v1/scheduler-accounts.json',bad={version:999,accounts:['alice'],attempts:[]};f.files.set(key,bad)
  await expect(f.scheduler.tick()).rejects.toThrow('preserved');expect(f.files.get(key)).toEqual(bad);expect(f.calls).toHaveLength(0);f.scheduler.stop()
})
test('Away and DND both queue configurable durable delays without polling AI',async()=>{
  for(const status of ['away','dnd'] as const) {
    const f=fixture(),room=await f.create(),p={...defaultPresence(),manual:status,awayMs:120000,dndMs:240000}
    await f.service.configurePresence('alice',{roomId:room.id,revision:room.revision,characterId:'alice_character',presence:p})
    await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'delayed',content:'Wait for me'})
    await f.scheduler.tick();expect(f.calls).toHaveLength(0)
    f.restart();f.advance(status==='away'?119999:239999);await f.scheduler.tick();expect(f.calls).toHaveLength(0)
    f.advance(1);await f.scheduler.tick();expect(f.calls).toHaveLength(1)
    expect((await f.service.read('alice',room.id)).messages).toHaveLength(2);f.scheduler.stop()
  }
})
test('Offline waits for scheduled eligibility while manual overrides survive restart',async()=>{
  const f=fixture(),room=await f.create()
  const p={...defaultPresence(),automatic:'offline' as const,manual:'offline' as const,transitions:[{at:f.now+60000,status:'away' as const},{at:f.now+120000,status:'online' as const}]}
  await f.service.configurePresence('alice',{roomId:room.id,revision:room.revision,characterId:'alice_character',presence:p})
  await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'offline_response',content:'Hello'})
  f.advance(180000);f.restart();await f.scheduler.tick();expect(f.calls).toHaveLength(0)
  let saved=await f.service.read('alice',room.id);expect(statusFor(saved,'alice_character',f.now)).toBe('offline')
  await f.service.configurePresence('alice',{roomId:room.id,revision:saved.revision,characterId:'alice_character',presence:{...p,manual:null}})
  await f.scheduler.tick();expect(f.calls).toHaveLength(1);saved=await f.service.read('alice',room.id);expect(saved.messages).toHaveLength(2);f.scheduler.stop()
})
test('new user messages coalesce delayed replies into the newest conversation revision',async()=>{
  const f=fixture(),room=await f.create()
  await f.service.configurePresence('alice',{roomId:room.id,revision:room.revision,characterId:'alice_character',presence:{...defaultPresence(),manual:'away',awayMs:60000}})
  await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'first',content:'Old question'})
  const current=await f.service.read('alice',room.id)
  await f.service.message('alice',{roomId:room.id,revision:current.revision,requestId:'second',content:'New question'})
  f.advance(60000);await f.scheduler.tick()
  const saved=await f.service.read('alice',room.id)
  expect(saved.messages).toHaveLength(3);expect(f.calls).toHaveLength(1)
  expect(f.calls[0].messages.some((m:any)=>m.content.includes('New question'))).toBe(true)
  expect(saved.runtime!.jobs.filter(j=>j.status==='delivered')).toHaveLength(1);f.scheduler.stop()
})
test('offline rerolls and unconsented delayed sends never invoke a provider',async()=>{
  const f=fixture(),room=await f.create()
  await f.service.configurePresence('alice',{roomId:room.id,revision:room.revision,characterId:'alice_character',presence:{...defaultPresence(),manual:'offline'}})
  await f.scheduler.configure('alice',false)
  await expect(f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'unavailable',content:'Saved'})).rejects.toThrow('unavailable')
  expect(f.calls).toHaveLength(0);expect((await f.service.read('alice',room.id)).messages).toHaveLength(1);f.scheduler.stop()
})
test('one authorized request can defer delivery privately and apply status only after delivery',async()=>{
  const f=fixture(),room=await f.create()
  const configured=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,aiBehavior:true}})
  await f.schedule(configured)
  f.host.generate!.quiet=async request=>{f.calls.push(request);return {content:JSON.stringify({speakerId:'alice_character',text:'Private later reply',behavior:{delivery:'later',delayMs:60000,status:'offline'}})}}
  await f.scheduler.tick();expect(f.calls).toHaveLength(1)
  const pending=await f.service.read('alice',room.id)
  expect(pending.messages).toEqual([]);expect(pending.notifications).toEqual([]);expect(statusFor(pending,'alice_character',f.now)).toBe('online')
  expect(JSON.stringify(await f.service.state('alice'))).not.toContain('Private later reply')
  f.restart();f.advance(60000);await f.scheduler.tick()
  const delivered=await f.service.read('alice',room.id)
  expect(f.calls).toHaveLength(1);expect(delivered.messages).toHaveLength(1);expect(statusFor(delivered,'alice_character',f.now)).toBe('offline');f.scheduler.stop()
})
test('interactive AI-deferred output survives restart without losing Stop semantics or regenerating',async()=>{
  const f=fixture(),room=await f.create(),configured=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,aiBehavior:true}})
  f.host.generate!.quiet=async request=>{f.calls.push(request);return {content:JSON.stringify({speakerId:'alice_character',text:'Interactive draft',behavior:{delivery:'later',delayMs:60000}})}}
  await f.service.message('alice',{roomId:room.id,revision:configured.revision,requestId:'interactive_delay',content:'Hello'})
  expect((await f.service.read('alice',room.id)).messages).toHaveLength(1)
  expect(JSON.stringify(await f.service.state('alice'))).not.toContain('Interactive draft')
  f.restart();f.advance(60000);await f.scheduler.tick();expect(f.calls).toHaveLength(1)
  expect((await f.service.read('alice',room.id)).messages).toHaveLength(2);f.scheduler.stop()
})
test('AI status suggestions cannot override manual locks and malformed metadata falls back safely',async()=>{
  const f=fixture(),room=await f.create(),configured=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,aiBehavior:true}})
  await f.service.configurePresence('alice',{roomId:room.id,revision:configured.revision,characterId:'alice_character',presence:{...defaultPresence(),manual:'online'}})
  await f.schedule(configured)
  f.host.generate!.quiet=async request=>{f.calls.push(request);return {content:'{"speakerId":"alice_character","text":"Reply","behavior":{"delivery":"now","delayMs":0,"status":"offline"}}'}}
  await f.scheduler.tick();expect(statusFor(await f.service.read('alice',room.id),'alice_character',f.now)).toBe('online');expect(f.calls).toHaveLength(1)
  for(const bad of [null,[],{delivery:'later',delayMs:Infinity},{delivery:'now',delayMs:1},{delivery:'later',delayMs:86400001},{delivery:'now',delayMs:0,status:'admin'}]) expect(parseBehavior(bad)).toEqual({delayMs:0})
  f.scheduler.stop()
})
test('disabling deferred work erases its private draft without notifications or new provider calls',async()=>{
  const f=fixture(),room=await f.create(),configured=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,aiBehavior:true}})
  await f.schedule(configured)
  f.host.generate!.quiet=async request=>{f.calls.push(request);return {content:'{"speakerId":"alice_character","text":"Hidden","behavior":{"delivery":"later","delayMs":60000}}'}}
  await f.scheduler.tick();await f.scheduler.configure('alice',false);f.advance(60000);f.restart();await f.scheduler.tick()
  const saved=await f.service.read('alice',room.id);expect(saved.messages).toEqual([]);expect(saved.notifications).toEqual([]);expect(saved.runtime!.jobs[0].draft).toBeUndefined();expect(f.calls).toHaveLength(1);f.scheduler.stop()
})
