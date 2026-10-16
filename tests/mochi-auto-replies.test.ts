import {test,expect} from 'bun:test'
import {fixture} from './mochi-accounts.test.js'
import {defaultPresence} from '../src/mochi/presence.js'
import {MochiView} from '../src/mochi/view.js'
import {JSDOM} from 'jsdom'

async function setup(owned:boolean,mode:'instant'|'natural'|'manual'='instant',status:'online'|'away'|'dnd'|'offline'='online'){
 const f=fixture(),accountId=owned?(await f.profile()).id:undefined
 let room=await f.room(accountId)
 room=await f.service.update('alice',{accountId,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,responseMode:mode,autoReply:true}})
 await f.service.configurePresence('alice',{accountId,roomId:room.id,revision:room.revision,characterId:'alice_character',presence:{...defaultPresence(),manual:status}})
 return {f,room,accountId,send:(requestId:string,content='Hello')=>f.service.message('alice',{accountId,roomId:room.id,revision:room.revision,requestId,content})}
}

test('actual composer payload uses stored Instant settings and renders accepted automatic reply',async()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 const {f,room,accountId}=await setup(true),sent:any[]=[]
 const view=new MochiView(p=>sent.push(p),()=>{},()=>{})
 try{
  view.state=await f.service.state('alice',accountId);view.select(room.id)
  const rendered=view.render();dom.window.document.body.append(rendered)
  const input=rendered.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;input.value='Ordinary composer send';input.dispatchEvent(new dom.window.Event('input'))
  input.closest('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}))
  const payload=sent.at(-1);expect(payload.type).toBe('mochi:send');expect(payload.accountId).toBe(accountId);expect(payload.content).toBe('Ordinary composer send')
  // Trigger policy is persisted room configuration, not untrusted send payload flags.
  await f.service.handle({...payload,autoReply:false,responseMode:'manual'},'alice')
  for(const event of f.events)view.receive(event.payload)
  expect(f.calls).toHaveLength(1);expect(view.state!.rooms[0].messages).toHaveLength(2);expect(view.render().querySelectorAll('.mochi-bubble')).toHaveLength(2)
 }finally{view.destroy();f.scheduler.stop();globalThis.document=previous;dom.window.close()}
})

test('Stop discards a late Instant reply, retries are not started and accepted history stays saved',async()=>{
 const {f,room,accountId,send}=await setup(true)
 let release!:(v:any)=>void,started!:()=>void;const ready=new Promise<void>(r=>started=r)
 f.host.generate!.quiet=async r=>{f.calls.push(r);started();return new Promise(resolve=>release=resolve)}
 try{
  const run=send('stop_automatic');await ready;await f.service.cancel('alice',room.id,'stop_automatic',accountId)
  release({content:'{"speakerId":"alice_character","text":"Discard late reply"}'})
  await expect(run).rejects.toThrow();await f.scheduler.tick()
  const saved=await f.service.read('alice',room.id,accountId);expect(saved.messages).toHaveLength(1);expect(saved.receipts).toContain('stop_automatic');expect(saved.notifications).toEqual([]);expect(f.calls).toHaveLength(1)
 }finally{f.scheduler.stop()}
})

test('quota rejection and provider failures surface errors without losing user history or retrying immediate sends',async()=>{
 for(const quota of [true,false]){
  const {f,room,accountId}=await setup(true)
  try{
   if(quota)f.service.reserveAutomatic=async()=>false
   else f.host.generate!.quiet=async r=>{f.calls.push(r);throw Error('503 provider temporarily unavailable')}
   await f.service.handle({type:'mochi:send',accountId,roomId:room.id,revision:room.revision,requestId:'safe_failure',content:'Keep accepted text'},'alice')
   const failure=f.events.findLast(e=>e.payload.type==='mochi:error')!.payload
   expect(failure.message).toBe(quota?"Mochi couldn't complete the reply. Your saved messages are preserved.":'The AI connection reported an error. Check the connection or provider settings.')
   await f.scheduler.tick();expect(f.calls).toHaveLength(quota?0:1)
   const saved=await f.service.read('alice',room.id,accountId);expect(saved.messages).toHaveLength(1);expect(saved.receipts).toContain('safe_failure');expect(saved.runtime!.jobs).toEqual([])
  }finally{f.scheduler.stop()}
 }
})

test('disabling background work preserves solicited queue; cancellation and bounded retries preserve history',async()=>{
 const {f,room,accountId,send}=await setup(true,'instant','away')
 try{
  await send('bounded_delayed');await f.scheduler.configure('alice',false)
  await f.service.configureScheduledRoom('alice',{accountId,roomId:room.id,revision:(await f.service.read('alice',room.id,accountId)).revision,enabled:false})
  const before=await f.service.read('alice',room.id,accountId)
  expect(before.runtime!.jobs[0].status).toBe('queued')
  await expect(f.scheduler.handle({type:'mochi:schedule',accountId,roomId:room.id,revision:before.revision,occurrenceId:'unsolicited',dueAt:f.now},'alice')).rejects.toThrow()
  f.host.generate!.quiet=async r=>{f.calls.push(r);throw Error('503 temporarily unavailable')}
  f.advance(300000);await f.scheduler.tick();for(let i=0;i<4;i++){f.advance(900000);await f.scheduler.tick()}
  let current=await f.service.read('alice',room.id,accountId);expect(f.calls).toHaveLength(3);expect(current.runtime!.jobs[0].status).toBe('failed');expect(current.messages).toEqual(before.messages);expect(current.receipts).toEqual(before.receipts)
  await f.service.message('alice',{accountId,roomId:room.id,revision:current.revision,requestId:'cancel_delayed',content:'Keep this too'})
  await f.service.cancelScheduled('alice',room.id,'response_cancel_delayed',accountId);f.advance(300000);await f.scheduler.tick()
  current=await f.service.read('alice',room.id,accountId);expect(f.calls).toHaveLength(3);expect(current.messages).toHaveLength(2);expect(current.runtime!.jobs[1].status).toBe('cancelled')
 }finally{f.scheduler.stop()}
})

test('ordinary replies ignore unavailable optional AI behavior without changing its saved opt-in',async()=>{
 const {f,room,accountId}=await setup(true)
 try{
  await f.scheduler.configure('alice',true);await f.service.configureScheduledRoom('alice',{accountId,roomId:room.id,revision:room.revision,enabled:true})
  const configured=await f.service.update('alice',{accountId,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,aiBehavior:true}})
  await f.scheduler.configure('alice',false)
  await f.service.message('alice',{accountId,roomId:room.id,revision:configured.revision,requestId:'behavior_not_autonomy',content:'Ordinary reply'})
  const saved=await f.service.read('alice',room.id,accountId);expect(f.calls).toHaveLength(1);expect(saved.messages).toHaveLength(2);expect(saved.settings!.aiBehavior).toBe(true);expect(f.calls[0].messages[0].content).not.toContain('optionally include behavior');expect(await f.scheduler.enabled('alice')).toBe(false)
 }finally{f.scheduler.stop()}
})

test('existing delayed-job cancellation controls remain accessible with autonomy disabled',async()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 const {f,room,accountId,send}=await setup(true,'instant','away'),sent:any[]=[],view=new MochiView(p=>sent.push(p),()=>{},()=>{})
 try{
  await send('visible_queue');view.state=await f.service.state('alice',accountId);view.select(room.id);view.editing=true
  const form=view.render(),cancel=form.querySelector<HTMLButtonElement>('[aria-label="Cancel scheduled message"]')!
  expect(cancel).not.toBeNull();expect(form.querySelector('[aria-label="Schedule character message"]')).toBeNull()
  cancel.click();expect(sent.at(-1).type).toBe('mochi:schedule_cancel');expect(sent.at(-1).accountId).toBe(accountId);expect(sent.at(-1).occurrenceId).toBe('response_visible_queue')
 }finally{view.destroy();f.scheduler.stop();globalThis.document=previous;dom.window.close()}
})

for(const owned of [false,true])test(`BUG-02 Instant Online auto reply works without background autonomy (${owned?'fictional':'legacy'})`,async()=>{
 const {f,room,accountId,send}=await setup(owned)
 try{
  expect(await f.scheduler.enabled('alice')).toBe(false)
  await send('instant_no_autonomy')
  const saved=await f.service.read('alice',room.id,accountId)
  expect(saved.messages[0].content).toBe('Hello');expect(saved.receipts).toContain('instant_no_autonomy')
  expect(f.calls).toHaveLength(1);expect(saved.messages).toHaveLength(2);expect(saved.notifications).toHaveLength(1)
  expect(saved.runtime!.enabled).toBe(false);expect(await f.scheduler.enabled('alice')).toBe(false)
  await f.service.message('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'empty_still_works',content:''})
  expect(f.calls).toHaveLength(2);expect((await f.service.read('alice',room.id,accountId)).messages).toHaveLength(3)
 }finally{f.scheduler.stop()}
})

for(const owned of [false,true]){
 for(const silent of [false,true])test(`Natural decision is one request with ${silent?'intentional silence':'a reply'} without autonomy (${owned?'fictional':'legacy'})`,async()=>{
  const {f,room,accountId,send}=await setup(owned,'natural')
  f.host.generate!.quiet=async r=>{f.calls.push(r);return {content:JSON.stringify({messages:silent?[]:[{speakerId:'alice_character',text:'Natural reply'}]})}}
  try{await send('natural_decision');expect(f.calls).toHaveLength(1);expect((await f.service.read('alice',room.id,accountId)).messages).toHaveLength(silent?1:2);expect(await f.scheduler.enabled('alice')).toBe(false)}finally{f.scheduler.stop()}
 })
 for(const status of ['away','dnd','offline'] as const)test(`durable ${status} response needs no background opt-in (${owned?'fictional':'legacy'})`,async()=>{
  const {f,room,accountId,send}=await setup(owned,'instant',status)
  try{
   await send('delayed_reply');let saved=await f.service.read('alice',room.id,accountId)
   expect(f.calls).toHaveLength(0);expect(saved.messages).toHaveLength(1);expect(saved.runtime!.jobs[0].kind).toBe('response');expect(saved.runtime!.enabled).toBe(false)
   const delay=status==='away'?300000:status==='dnd'?900000:60000
   f.restart();f.advance(delay-1);await f.scheduler.tick();expect(f.calls).toHaveLength(0)
   f.advance(1)
   if(status==='offline'){
    await f.scheduler.tick();expect(f.calls).toHaveLength(0)
    await f.service.configurePresence('alice',{accountId,roomId:room.id,revision:saved.revision,characterId:'alice_character',presence:{...defaultPresence(),manual:'online'}})
   }
   await f.scheduler.tick();await f.scheduler.tick();saved=await f.service.read('alice',room.id,accountId)
   expect(f.calls).toHaveLength(1);expect(saved.messages).toHaveLength(2);expect(saved.runtime!.jobs[0].status).toBe('delivered');expect(saved.receipts).toContain('delayed_reply');expect(saved.notifications![0].accountId).toBe(accountId)
   expect(await f.scheduler.enabled('alice')).toBe(false);expect(saved.runtime!.enabled).toBe(false)
  }finally{f.scheduler.stop()}
 })
 test(`Manual and autoReply=false disable ordinary replies but preserve continuation (${owned?'fictional':'legacy'})`,async()=>{
  for(const manual of [true,false]){
   const {f,room,accountId}=await setup(owned,manual?'manual':'instant')
   try{
    let current=room
    if(!manual)current=await f.service.update('alice',{accountId,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,autoReply:false}})
    await f.service.message('alice',{accountId,roomId:room.id,revision:current.revision,requestId:'nonempty_disabled',content:'Save only'})
    current=await f.service.read('alice',room.id,accountId);expect(f.calls).toHaveLength(0);expect(current.runtime!.jobs).toEqual([])
    await f.service.message('alice',{accountId,roomId:room.id,revision:current.revision,requestId:'continue_explicitly',content:''})
    expect(f.calls).toHaveLength(1);expect((await f.service.read('alice',room.id,accountId)).messages).toHaveLength(2)
   }finally{f.scheduler.stop()}
  }
 })
}
