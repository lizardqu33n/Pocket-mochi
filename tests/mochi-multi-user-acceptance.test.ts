import {expect,test} from 'bun:test'
import {JSDOM} from 'jsdom'
import {fixture} from './mochi-accounts.test.js'
import {getMochiSession,type MochiTransport} from '../src/mochi/session.js'
import {createMochiWorkspace} from '../src/mochi/workspace.js'

// Two authenticated principals share one synthetic server, never real accounts,
// databases or providers. Imported account fixtures also register their tests.
const users=['alice','bob'] as const
function deferred<T>() {let resolve!:(value:T)=>void;const promise=new Promise<T>(r=>{resolve=r});return {promise,resolve}}
async function pair(f:ReturnType<typeof fixture>,fictional:boolean){
 return Promise.all(users.map(async user=>{
  const accountId=fictional?(await f.profile(user==='alice'?'p1':'p3',user)).id:undefined
  let room=await f.room(accountId,user)
  room=await f.service.update(user,{accountId,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings!,responseMode:'manual',autoReply:false}})
  await f.service.message(user,{accountId,roomId:room.id,revision:room.revision,requestId:'same_seed_id',content:user+'_PRIVATE_HISTORY'})
  return {user,accountId,room:await f.service.read(user,room.id,accountId)}
 }))
}
for(const fictional of [false,true]){
 const scope=fictional?'fictional':'legacy'
 test(`simultaneous ${scope} providers, forged principal and delayed delivery remain user-scoped`,async()=>{
  const f=fixture()
  try{
   const [a,b]=await pair(f,fictional),started=new Map(users.map(u=>[u,deferred<void>()])),replies=new Map(users.map(u=>[u,deferred<{content:string}>()]))
   f.host.generate!.quiet=async request=>{f.calls.push(request);started.get(request.userId as typeof users[number])!.resolve();return replies.get(request.userId as typeof users[number])!.promise}
   const running=[a,b].map(x=>f.service.handle({type:'mochi:send',userId:x.user==='alice'?'bob':'alice',ownerId:'forged',accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,requestId:'same_continue_id',content:''},x.user))
   await Promise.all(users.map(u=>started.get(u)!.promise))
   expect(f.calls).toHaveLength(2)
   for(const request of f.calls){
    const other=request.userId==='alice'?'bob':'alice',prompt=JSON.stringify(request.messages)
    expect(request.connection_id).toBe(request.userId+'_connection');expect(prompt).toContain(request.userId+'_PRIVATE_HISTORY');expect(prompt).not.toContain(other+'_PRIVATE_HISTORY')
    if(fictional)expect(prompt).not.toContain(request.userId==='alice'?'BOB_PRIVATE':'MARY_PRIVATE')
   }
   replies.get('bob')!.resolve({content:JSON.stringify({speakerId:'bob_character',text:'bob_PRIVATE_REPLY'})});await running[1]
   expect((await f.service.read('alice',a.room.id,a.accountId)).messages).toHaveLength(1)
   replies.get('alice')!.resolve({content:JSON.stringify({speakerId:'alice_character',text:'alice_PRIVATE_REPLY'})});await running[0]
   for(const x of [a,b]){
    const saved=await f.service.read(x.user,x.room.id,x.accountId),other=x.user==='alice'?'bob':'alice'
    expect(saved.messages).toHaveLength(2);expect(JSON.stringify(saved.messages)).toContain(x.user+'_PRIVATE_REPLY');expect(JSON.stringify(saved.messages)).not.toContain(other+'_PRIVATE')
    expect(saved.notifications).toHaveLength(1)
    for(const event of f.events.filter(e=>e.user===x.user))expect(JSON.stringify(event.payload)).not.toContain(other+'_PRIVATE')
   }
   const before=structuredClone(f.files)
   await f.service.handle({type:'mochi:send',userId:'alice',accountId:a.accountId,roomId:a.room.id,revision:a.room.revision,requestId:'forged_send',content:'forged'},'bob')
   expect(f.events.at(-1)).toMatchObject({user:'bob',payload:{type:'mochi:error',requestId:'forged_send'}});expect(f.files).toEqual(before);expect(f.calls).toHaveLength(2)
   f.restart()
   for(const x of [a,b])expect((await f.service.read(x.user,x.room.id,x.accountId)).messages).toHaveLength(2)
   expect((await f.service.state('alice',a.accountId)).rooms.map(r=>r.id)).toEqual([a.room.id]);expect((await f.service.state('bob',b.accountId)).rooms.map(r=>r.id)).toEqual([b.room.id])
  }finally{f.scheduler.stop()}
 })

 test(`simultaneous ${scope} preset revisions, previews, memory suggestions and forged mutations`,async()=>{
  const f=fixture()
  try{
   const entries=await pair(f,fictional)
   await Promise.all(entries.map(async x=>{
    const messageId=(x.room.messages[0] as any).id
    await f.service.pinnedContent(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,requestId:'same_pin',action:'pin',messageId,pinned:true})
    x.room=await f.service.read(x.user,x.room.id,x.accountId)
    await f.service.pinnedContent(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,requestId:'same_note',action:'note_save',title:'Private note',body:x.user+'_PRIVATE_NOTE',enabled:true})
    x.room=await f.service.read(x.user,x.room.id,x.accountId)
    await f.service.react(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,requestId:'same_reaction',messageId,emoji:x.user==='alice'?'👍':'❤️'})
    x.room=await f.service.read(x.user,x.room.id,x.accountId)
    await f.service.message(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,requestId:'same_quote',content:x.user+'_PRIVATE_QUOTE',replyTo:messageId})
    x.room=await f.service.read(x.user,x.room.id,x.accountId)
    expect((x.room.messages[1] as any).replyTo).toBeDefined();expect(x.room.systemNotes![0].body).toBe(x.user+'_PRIVATE_NOTE')
    const bank=await f.service.presets.mutate(x.user,{accountId:x.accountId,revision:0,requestId:'same_preset_id',action:'create',name:x.user+' private preset',dmInstructions:x.user+'_PRIVATE_PRESET',groupInstructions:'Group'})
    await f.service.bindPreset(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,requestId:'same_bind_id',presetId:bank.presets[0].id,presetRevision:1,confirmed:true})
    x.room=await f.service.read(x.user,x.room.id,x.accountId)
    await f.service.handle({type:'mochi:preview',accountId:x.accountId,roomId:x.room.id,requestId:'same_preview_id',scenario:'continue'},x.user)
    const preview=f.events.find(e=>e.user===x.user&&e.payload.type==='mochi:preview')
    expect(preview).toBeDefined();expect(JSON.stringify(preview)).toContain(x.user+'_PRIVATE_PRESET');expect(JSON.stringify(preview)).not.toContain((x.user==='alice'?'bob':'alice')+'_PRIVATE')
   }))
   const [a,b]=entries,started=new Map(users.map(u=>[u,deferred<void>()])),replies=new Map(users.map(u=>[u,deferred<{content:string}>()]))
   f.host.generate!.quiet=async request=>{f.calls.push(request);started.get(request.userId as typeof users[number])!.resolve();return replies.get(request.userId as typeof users[number])!.promise}
   const pending=entries.map(x=>f.service.generateSummary(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,associationRevision:x.room.associationRevision||0,requestId:'same_summary_id',boundaryId:(x.room.messages[0] as any).id}))
   await Promise.all(users.map(u=>started.get(u)!.promise))
   for(const request of f.calls){expect(JSON.stringify(request.messages)).toContain(request.userId+'_PRIVATE_HISTORY');expect(JSON.stringify(request.messages)).not.toContain((request.userId==='alice'?'bob':'alice')+'_PRIVATE_HISTORY')}
   replies.get('bob')!.resolve({content:'{"summary":"bob_PRIVATE_MEMORY"}'});const bs=await pending[1]
   replies.get('alice')!.resolve({content:'{"summary":"alice_PRIVATE_MEMORY"}'});const as=await pending[0]
   const memory=(x:typeof a,s:any)=>({accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,associationRevision:x.room.associationRevision||0,requestId:'same_apply_id',action:'save',suggestionId:s.id,text:s.text,boundaryId:s.coverage.boundaryId,enabled:true,excludeCovered:false,confirmed:true})
   const before=structuredClone(f.files),ap=(await f.service.presets.read('alice',a.accountId)).presets[0],bp=(await f.service.presets.read('bob',b.accountId)).presets[0]
   const forged=[
    ()=>f.service.read('bob',a.room.id,a.accountId),
    ()=>f.service.saveMemory('bob',memory(b,as)),
    ()=>f.service.bindPreset('bob',{accountId:b.accountId,roomId:b.room.id,revision:b.room.revision,requestId:'foreign_revision',presetId:ap.id,presetRevision:1,confirmed:true}),
    ()=>f.service.bindPreset('bob',{accountId:b.accountId,roomId:b.room.id,revision:b.room.revision,requestId:'missing_revision',presetId:bp.id,presetRevision:999,confirmed:true}),
    ()=>f.service.action('bob',{accountId:a.accountId,roomId:a.room.id,revision:a.room.revision,requestId:'foreign_edit',action:'delete',messageId:(a.room.messages[0] as any).id,confirmed:true}),
    ()=>f.service.pinnedContent('bob',{accountId:a.accountId,roomId:a.room.id,revision:a.room.revision,requestId:'foreign_note',action:'note_save',title:'forged',body:'forged',enabled:true}),
    ()=>f.service.react('bob',{accountId:a.accountId,roomId:a.room.id,revision:a.room.revision,requestId:'foreign_reaction',messageId:(a.room.messages[0] as any).id,emoji:'👍'}),
   ]
   for(const op of forged)await expect(op()).rejects.toThrow()
   for(const type of ['mochi:preview','mochi:memory','mochi:search']){
    await f.service.handle({type,accountId:a.accountId,roomId:a.room.id,requestId:'foreign_read',action:'read',query:'PRIVATE'},'bob');expect(f.events.at(-1)).toMatchObject({user:'bob',payload:{type:'mochi:error'}})
   }
   expect(f.files).toEqual(before)
   await Promise.all([f.service.saveMemory('alice',memory(a,as)),f.service.saveMemory('bob',memory(b,bs))])
   const alice=await f.service.read('alice',a.room.id,a.accountId)
   await f.service.clearNotifications('bob',{accountId:b.accountId,action:'all',confirmed:true,rooms:[]})
   expect(await f.service.read('alice',a.room.id,a.accountId)).toEqual(alice)
   f.restart()
   for(const x of entries){const saved=await f.service.read(x.user,x.room.id,x.accountId);expect(saved.memory!.versions[0].text).toBe(x.user+'_PRIVATE_MEMORY');expect(saved.messages).toEqual(x.room.messages);expect((await f.service.presets.resolve(x.user,saved)).dmInstructions).toBe(x.user+'_PRIVATE_PRESET')}
   expect(f.calls).toHaveLength(2)
  }finally{f.scheduler.stop()}
 })

 test(`simultaneous ${scope} durable jobs, separate opt-ins, quotas and exactly-once restart`,async()=>{
  const f=fixture()
  try{
   const entries=await pair(f,fictional)
   await Promise.all(entries.map(async x=>{
    await f.scheduler.configure(x.user,true)
    await f.service.configureScheduledRoom(x.user,{accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,enabled:true})
    await f.scheduler.handle({type:'mochi:schedule',accountId:x.accountId,roomId:x.room.id,revision:x.room.revision,occurrenceId:'same_occurrence_id',dueAt:f.now+60000,responder:x.user+'_character'},x.user)
   }))
   const [a,b]=entries,before=structuredClone(f.files)
   await expect(f.service.cancelScheduled('bob',a.room.id,'same_occurrence_id',a.accountId)).rejects.toThrow();expect(f.files).toEqual(before)
   // Independent user quotas coexist with the intentional global 120/hour cap.
   expect(await f.service.reserveAutomatic('alice',a.room.id,true)).toBe(true)
   expect(await f.service.reserveAutomatic('bob',b.room.id,true)).toBe(true)
   f.service.releaseAutomatic('alice',a.room.id);f.service.releaseAutomatic('bob',b.room.id)
   expect(f.files.get('alice:mochi/v1/scheduler.json').attempts).toHaveLength(1);expect(f.files.get('bob:mochi/v1/scheduler.json').attempts).toHaveLength(1)
   await f.scheduler.configure('alice',false)
   expect((await f.service.read('bob',b.room.id,b.accountId)).runtime!.jobs[0].status).toBe('queued')
   f.restart();f.advance(60000)
   f.host.generate!.quiet=async request=>{f.calls.push(request);return{content:JSON.stringify({speakerId:request.userId+'_character',text:request.userId+'_SCHEDULED_PRIVATE'})}}
   await f.scheduler.tick();await f.scheduler.tick();f.restart();await f.scheduler.tick()
   expect(f.calls).toHaveLength(1);expect(f.calls[0].userId).toBe('bob')
   expect((await f.service.read('alice',a.room.id,a.accountId)).messages).toHaveLength(1)
   const saved=await f.service.read('bob',b.room.id,b.accountId);expect(saved.messages).toHaveLength(2);expect(saved.runtime!.jobs[0].status).toBe('delivered');expect(saved.notifications).toHaveLength(1)
   expect(f.events.filter(e=>e.user==='alice').every(e=>!JSON.stringify(e.payload).includes('bob_SCHEDULED_PRIVATE'))).toBe(true)
  }finally{f.scheduler.stop()}
 })
}

test('one user exhausting the hourly quota does not consume the other user quota below the global cap',async()=>{
 const f=fixture()
 try{
  const [a,b]=await pair(f,false)
  await f.scheduler.configure('alice',true);await f.scheduler.configure('bob',true)
  const config=f.files.get('alice:mochi/v1/scheduler.json')
  config.attempts=Array.from({length:60},()=>({at:f.now,roomId:a.room.id}))
  f.files.set('alice:mochi/v1/scheduler.json',config)
  expect(await f.service.reserveAutomatic('alice',a.room.id,true)).toBe(false)
  expect(await f.service.reserveAutomatic('bob',b.room.id,true)).toBe(true)
  f.service.releaseAutomatic('bob',b.room.id)
  expect(f.files.get('alice:mochi/v1/scheduler.json').attempts).toHaveLength(60)
  expect(f.files.get('bob:mochi/v1/scheduler.json').attempts).toHaveLength(1)
  expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})

test('two independently bound frontend contexts retain separate drafts, events and reconnect state',async()=>{
 const f=fixture(),dom=new JSDOM('<!doctype html><body><main id="alice"></main><main id="bob"></main></body>'),previous={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window})
 const clients: Array<{user:string;listeners:Set<(p:unknown)=>void>;sent:any[];session:ReturnType<typeof getMochiSession>;workspace:ReturnType<typeof createMochiWorkspace>}> = []
 try{
  const entries=await pair(f,true)
  for(const x of entries){
   const listeners=new Set<(p:unknown)=>void>(),sent:any[]=[],transport:MochiTransport={sendToBackend:p=>{sent.push(p)},onBackendMessage:fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}}}
   const session=getMochiSession(transport),workspace=createMochiWorkspace({root:document.getElementById(x.user)!,transport,notificationPolicy:()=>({enabled:true,previews:false})})
   clients.push({user:x.user,listeners,sent,session,workspace});workspace.open()
   for(const fn of listeners)fn({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:await f.service.accountsState(x.user)})
   // The transport/server principal is assigned by the harness, never payload.
   session.view.selectNavigationAccount(x.accountId,document.getElementById(x.user)!,()=>{})
   await f.service.selectAccount(x.user,{accountId:x.accountId,revision:(await f.service.accountsState(x.user)).revision})
   for(const fn of listeners)fn({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:await f.service.accountsState(x.user)})
   for(const fn of listeners)fn({type:'mochi:state',requestId:sent.at(-1).requestId,state:await f.service.state(x.user,x.accountId)})
   expect(workspace.openRoom(x.room.id)).toBe(true)
   const input=document.querySelector<HTMLTextAreaElement>('#'+x.user+' [aria-label="Message"]')!
   input.value=x.user+'_UNSENT_PRIVATE';input.dispatchEvent(new dom.window.Event('input'))
  }
  expect(clients[0].session).not.toBe(clients[1].session)
  for(const c of clients){expect(c.listeners.size).toBe(1);c.workspace.close();c.workspace.open();expect(document.querySelector<HTMLTextAreaElement>('#'+c.user+' [aria-label="Message"]')!.value).toBe(c.user+'_UNSENT_PRIVATE')}
  const a=clients[0],b=clients[1],aSent=a.sent.length
  // Server-targeted late events go only to that context's event listeners.
  f.host.sendToFrontend=(payload,user)=>{for(const c of clients)if(c.user===user)for(const fn of c.listeners)fn(payload)}
  f.host.sendToFrontend({type:'mochi:notification',notification:{id:'notice_b',roomId:entries[1].room.id,accountId:entries[1].accountId,messageId:'message_b',title:'bob_PRIVATE',roomTitle:'Synthetic',body:'bob_PRIVATE_EVENT',createdAt:new Date().toISOString(),read:false},notificationRevision:1},'bob')
  expect(a.sent).toHaveLength(aSent);expect(document.getElementById('alice')!.textContent).not.toContain('bob_PRIVATE')
  a.session.authenticatedIdentityChanged('alice');expect(a.session.isDestroyed).toBe(false)
  for(const fn of a.listeners)fn({type:'mochi:state',requestId:a.sent.at(-1).requestId,state:await f.service.state('alice',entries[0].accountId)})
  // Complete a genuine fictional profile switch through the public navigation API.
  const second=await f.profile('p2')
  a.session.view.loadNavigationAccounts()
  for(const fn of a.listeners)fn({type:'mochi:accounts',requestId:a.sent.at(-1).requestId,state:await f.service.accountsState('alice')})
  a.session.view.selectNavigationAccount(second.id,document.getElementById('alice')!,()=>{})
  await f.service.selectAccount('alice',{accountId:second.id,revision:(await f.service.accountsState('alice')).revision})
  for(const fn of a.listeners)fn({type:'mochi:accounts',requestId:a.sent.at(-1).requestId,state:await f.service.accountsState('alice')})
  for(const fn of a.listeners)fn({type:'mochi:state',requestId:a.sent.at(-1).requestId,state:await f.service.state('alice',second.id)})
  expect(a.session.view.state?.accountId).toBe(second.id);expect(a.session.view.state?.rooms).toEqual([]);expect(a.session.isDestroyed).toBe(false)
  a.session.authenticatedIdentityChanged(null)
  expect(a.listeners.size).toBe(0);expect(b.listeners.size).toBe(1);expect(b.session.isDestroyed).toBe(false)
  b.session.authenticatedIdentityChanged('bob')
  expect(document.querySelector<HTMLTextAreaElement>('#bob [aria-label="Message"]')!.value).toBe('bob_UNSENT_PRIVATE')
 }finally{for(const c of clients)c.session.destroy(false);f.scheduler.stop();dom.window.close();Object.assign(globalThis,previous)}
})
