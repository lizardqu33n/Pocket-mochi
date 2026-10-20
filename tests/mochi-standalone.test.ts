import { expect, test, setSystemTime } from 'bun:test'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { startMochiRuntime } from '../src/mochi/runtime.js'
import { setup } from '../src/frontend.js'
import { getMochiSession } from '../src/mochi/session.js'
import { createMochiLauncher } from '../src/mochi/launcher.js'

const flush = async () => { for (let i=0;i<12;i++) await new Promise(resolve=>setTimeout(resolve,0)) }
function backend() {
  const files=new Map<string,any>(),events:any[]=[],calls:any[]=[],listeners=new Set<any>(),warnings:string[]=[]
  const key=(p:string,u:string)=>u+':'+p
  const read=async(p:string,o:any)=>{if(!files.has(key(p,o.userId))&&'fallback'in o)return o.fallback;return structuredClone(files.get(key(p,o.userId)))}
  const host:any={
    userStorage:{exists:async(p:string,u:string)=>files.has(key(p,u)),getJson:read,setJson:async(p:string,v:any,o:any)=>{files.set(key(p,o.userId),structuredClone(v))},move:async(a:string,b:string,u:string)=>{files.set(key(b,u),files.get(key(a,u)));files.delete(key(a,u))},list:async(p:string,u:string)=>[...files.keys()].filter(k=>k.startsWith(key(p,u))).map(k=>k.slice(key(p,u).length))},
    storage:{exists:async(p:string)=>files.has(p),getJson:async(p:string)=>structuredClone(files.get(p)),setJson:async(p:string,v:any)=>{files.set(p,structuredClone(v))},move:async(a:string,b:string)=>{files.set(b,files.get(a));files.delete(a)}},
    characters:{get:async(id:string)=>({id,name:'Synthetic character'}),list:async()=>({data:[]})},
    personas:{get:async()=>null,list:async()=>({data:[]})},permissions:{has:(p:string)=>['generation','characters','personas','images','ui_panels'].includes(p)},
    connections:{get:async()=>({id:'fake',model:'fake'}),list:async()=>[]},tokens:{countMessages:async()=>({total_tokens:100})},generate:{quiet:async(input:any)=>{calls.push(input);return {content:'fake only'}}},
    sendToFrontend:(p:any,u:string)=>events.push({p,u}),onFrontendMessage:(fn:any)=>{listeners.add(fn);return()=>{listeners.delete(fn)}},
    ui:{closeDrawer:async(o:any)=>{events.push({closed:o.userId})}},log:{warn:(s:string)=>warnings.push(s)},
  }
  for(const name of ['tools','interceptor','chat','chats','events','frontendCapabilities'])Object.defineProperty(host,name,{get(){throw Error('Forbidden Pocket/RP API: '+name)}})
  const emit=(p:any,user?:string)=>{for(const fn of listeners)fn(p,user)}
  return {host,files,events,calls,listeners,warnings,emit}
}

test('B0/B1: startup is read-only, start-once; unauthenticated and Pocket messages are inert',async()=>{
  const h=backend(),runtime=startMochiRuntime(h.host)
  try{
    expect(startMochiRuntime(h.host)).toBe(runtime);expect(h.listeners.size).toBe(1)
    h.emit({type:'mochi:accounts',ownerId:'forged'});h.emit({type:'lumiphone:model_action'},'alice')
    await flush();expect(h.events).toHaveLength(0);expect(h.calls).toHaveLength(0);expect(h.files.size).toBe(0)
    h.emit({type:'mochi:accounts',requestId:'alice_request',userId:'bob',ownerId:'bob'},'alice')
    await flush();const result=h.events.find(e=>e.p?.type==='mochi:accounts')
    expect(result.u).toBe('alice');expect(result.p.state.ownerId).toBe('alice');expect(h.calls).toHaveLength(0)
    h.emit({type:'mochi:open_shell'},'alice');await flush();expect(h.events.some(e=>e.closed==='alice')).toBe(true)
  }finally{runtime.stop();runtime.stop()}
  expect(h.listeners.size).toBe(0)
  h.emit({type:'mochi:accounts'},'alice');await flush();expect(h.calls).toHaveLength(0)
})

test('B1: stop aborts queued/interactive/scheduled jobs and suppresses late transport',async()=>{
  const h=backend(),runtime=startMochiRuntime(h.host),service=runtime.service as any
  const interactive=new AbortController(),scheduled=new AbortController(),queued=new AbortController()
  service.jobs.set(JSON.stringify(['alice','room']),{requestId:'interactive',controller:interactive})
  service.jobs.set(JSON.stringify(['bob','room']),{requestId:'server_occurrence',controller:scheduled})
  service.pending.set('queued',new Set([{requestId:'queued',controller:queued}]))
  runtime.stop()
  expect([interactive,scheduled,queued].every(c=>c.signal.aborted)).toBe(true)
  await service.handle({type:'mochi:accounts'},'alice');expect(h.events).toHaveLength(0)
})

test('B0: even an existing due synthetic job is not dispatched as a startup side effect',async()=>{
  setSystemTime(new Date('2026-10-20T12:00:00Z'))
  const h=backend(),first=startMochiRuntime(h.host)
  let second:ReturnType<typeof startMochiRuntime>|undefined
  try{
    let room=await first.service.create('alice',{title:'Existing job',characterIds:['char'],persona:{source:'manual',name:'Alice'}})
    room=await first.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,connectionId:'fake'}})
    await first.scheduler.configure('alice',true)
    await first.service.configureScheduledRoom('alice',{roomId:room.id,revision:room.revision,enabled:true})
    room=await first.service.read('alice',room.id)
    await first.scheduler.handle({type:'mochi:schedule',roomId:room.id,revision:room.revision,occurrenceId:'existing',dueAt:Date.now()},'alice')
    first.stop();const before=JSON.stringify([...h.files])
    second=startMochiRuntime(h.host);await flush()
    expect(h.calls).toHaveLength(0);expect(JSON.stringify([...h.files])).toBe(before);expect(h.listeners.size).toBe(1)
  }finally{first.stop();second?.stop();setSystemTime()}
})

test('B1: stopping real scheduled generation preserves recoverable job and rejects late provider output',async()=>{
  setSystemTime(new Date('2026-10-20T12:00:00Z'))
  const h=backend();let release!:(value:any)=>void,started!:()=>void
  const ready=new Promise<void>(resolve=>{started=resolve})
  h.host.generate.quiet=async(input:any)=>{h.calls.push(input);started();return new Promise(resolve=>{release=resolve})}
  const runtime=startMochiRuntime(h.host),service=runtime.service,scheduler=runtime.scheduler
  try{
    let room=await service.create('alice',{title:'Synthetic recovery',characterIds:['char'],persona:{source:'manual',name:'Alice'}})
    room=await service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,connectionId:'fake'}})
    await scheduler.configure('alice',true)
    await service.configureScheduledRoom('alice',{roomId:room.id,revision:room.revision,enabled:true})
    room=await service.read('alice',room.id)
    await scheduler.handle({type:'mochi:schedule',roomId:room.id,revision:room.revision,occurrenceId:'recovery',dueAt:Date.now()},'alice')
    const running=scheduler.tick();await ready;runtime.stop();const events=h.events.length
    expect(h.calls[0].signal.aborted).toBe(true)
    release({content:'{"speakerId":"char","text":"Late output must be discarded"}'});await running
    const stored=await service.read('alice',room.id)
    expect(stored.messages).toEqual([]);expect(stored.runtime!.jobs[0].status).toBe('queued');expect(h.events.length).toBe(events)
  }finally{runtime.stop();setSystemTime()}
})

test('B0: preserved Pocket-source record is readable without Pocket; missing source never becomes manual',async()=>{
  const h=backend(),runtime=startMochiRuntime(h.host),service=runtime.service
  try{
    h.files.set('alice:identity-profiles.json',{version:1,entries:[{id:'legacy_persona',kind:'persona',name:'Legacy persona',identityBrief:'Synthetic source'}]})
    const room=await service.create('alice',{title:'Preserved source',characterIds:['char'],persona:{source:'pocket',sourceId:'legacy_persona'}})
    const path='alice:mochi/v1/rooms/'+room.id+'.json',before=JSON.stringify(h.files.get(path))
    h.files.delete('alice:identity-profiles.json')
    expect((await service.read('alice',room.id)).persona.source).toBe('pocket')
    await service.handle({type:'mochi:preview',roomId:room.id,requestId:'missing_source'},'alice')
    expect(JSON.stringify(h.files.get(path))).toBe(before);expect(h.calls).toHaveLength(0)
    expect(h.events.some(e=>e.p?.type==='mochi:error'||e.p?.error)).toBe(true)
    h.files.set(path,{...h.files.get(path),version:99});const damaged=JSON.stringify(h.files.get(path))
    await expect(service.read('alice',room.id)).rejects.toThrow('preserved');expect(JSON.stringify(h.files.get(path))).toBe(damaged)
  }finally{runtime.stop()}
})

test('B1: failed listener registration rolls back without starting scheduler or generation',()=>{
  const h=backend();h.host.onFrontendMessage=()=>{throw Error('denied')}
  expect(()=>startMochiRuntime(h.host)).toThrow('denied');expect(h.calls).toHaveLength(0);expect(h.files.size).toBe(0)
})

function frontend(options:{widgets?:boolean;fail?:string}={}) {
  const dom=new JSDOM('<!doctype html><body></body>',{pretendToBeVisual:true,url:'https://synthetic.invalid'})
  const previous={document:globalThis.document,window:globalThis.window,MutationObserver:globalThis.MutationObserver}
  Object.assign(globalThis,{document:dom.window.document,window:dom.window,MutationObserver:dom.window.MutationObserver})
  const listeners=new Set<any>(),sent:any[]=[],tabs:any[]=[],actions:any[]=[],widgets:any[]=[],teardowns=new Set<any>()
  let ready=0,styles=0
  const ctx:any={
    dom:{addStyle:(css:string)=>{styles++;const style=document.createElement('style');style.textContent=css;document.head.append(style);return()=>{styles--;style.remove()}}},
    sendToBackend:(p:any)=>sent.push(p),onBackendMessage:(fn:any)=>{listeners.add(fn);return()=>{listeners.delete(fn)}},
    ready:()=>{ready++;if(options.fail==='ready')throw Error('ready failed')},onTeardown:(fn:any)=>{teardowns.add(fn);return()=>{teardowns.delete(fn)}},
    ui:{registerDrawerTab:(spec:any)=>{
      const root=document.createElement('div');document.body.append(root);let active:any
      const tab={spec,root,activate:()=>active?.(),onActivate:(fn:any)=>{active=fn;return()=>{active=undefined}},destroy:()=>{root.remove();tab.destroyed=true},destroyed:false};tabs.push(tab);return tab
    },registerInputBarAction:(spec:any)=>{
      if(options.fail==='action')throw Error('action denied')
      let click:any;const action={spec,click:()=>click?.(),onClick:(fn:any)=>{click=fn;return()=>{click=undefined}},destroy:()=>{action.destroyed=true},destroyed:false};actions.push(action);return action
    },createFloatWidget:(spec:any)=>{
      if(options.widgets===false)throw Error('widgets denied')
      const root=document.createElement('div');document.body.append(root);let position=spec.initialPosition,drag:any
      const widget={spec,root,getPosition:()=>position,moveTo:(x:number,y:number)=>{position={x,y}},setVisible:(visible:boolean)=>{root.hidden=!visible},onDragEnd:(fn:any)=>{drag=fn;return()=>{drag=undefined}},drag:()=>drag?.(position),destroy:()=>{widget.destroyed=true;root.remove()},destroyed:false};widgets.push(widget);return widget
    }},
  }
  for(const name of ['messages','events','getActiveChat'])Object.defineProperty(ctx,name,{get(){throw Error('Forbidden Pocket frontend API: '+name)}})
  const emit=(p:any)=>{for(const fn of listeners)fn(p)}
  return {ctx,dom,listeners,sent,tabs,actions,widgets,teardowns,emit,get ready(){return ready},get styles(){return styles},cleanup(){for(const fn of [...teardowns])fn();dom.window.close();Object.assign(globalThis,previous)}}
}

test('B1/B2: one owned drawer/action/session/launcher, no phone; ready once and auth teardown',()=>{
  const h=frontend();let destroy=()=>{}
  try{
    destroy=setup(h.ctx);expect(setup(h.ctx)).toBe(destroy);expect(h.ready).toBe(1);expect(h.listeners.size).toBe(1)
    expect(h.tabs.map(t=>t.spec.id)).toEqual(['mochi-independent']);expect(h.actions.map(a=>a.spec.id)).toEqual(['mochi-open-independent'])
    expect(h.widgets).toHaveLength(1);expect(h.widgets[0].spec.width).toBe(58);expect(document.querySelector('.mochi-launcher svg image')).not.toBeNull()
    expect(document.querySelector('.lumiphone-shell')).toBeNull();expect(h.sent).toEqual([])
    h.actions[0].click();expect(h.sent.some(p=>p.type==='mochi:accounts')).toBe(true)
    expect(h.sent.every(p=>p.type.startsWith('mochi:')&&!p.phone)).toBe(true)
    window.dispatchEvent(new window.Event('lumiverse:auth-session-invalid'))
    expect(h.listeners.size).toBe(0);expect(h.styles).toBe(0);expect(h.tabs[0].destroyed).toBe(true);expect(h.actions[0].destroyed).toBe(true);expect(h.widgets[0].destroyed).toBe(true)
  }finally{destroy();destroy();h.cleanup()}
})

test('B2: denied widget/geometry leaves the owned account drawer usable; owner switch destroys shell',()=>{
  const h=frontend({widgets:false});let destroy=()=>{}
  try{
    destroy=setup(h.ctx);h.tabs[0].activate();expect(h.sent.at(-1).type).toBe('mochi:accounts')
    const session=getMochiSession(h.ctx);session.authenticatedIdentityChanged('alice');session.authenticatedIdentityChanged('bob')
    expect(h.listeners.size).toBe(0);expect(h.tabs[0].destroyed).toBe(true);expect(h.styles).toBe(0)
  }finally{destroy();h.cleanup()}
})

for(const fail of ['action','ready'])test('B1: partial frontend failure releases session, styles, registrations: '+fail,()=>{
  const h=frontend({fail})
  try{expect(()=>setup(h.ctx)).toThrow();expect(h.listeners.size).toBe(0);expect(h.styles).toBe(0);expect(h.tabs.every(t=>t.destroyed)).toBe(true);expect(h.actions.every(a=>a.destroyed)).toBe(true);expect(h.widgets.every(w=>w.destroyed)).toBe(true)}finally{h.cleanup()}
})

test('B2: independent launcher clamps on viewport changes and suppresses drag clicks',async()=>{
  const h=frontend();let destroy=()=>{}
  try{
    const session=getMochiSession(h.ctx);let opens=0
    destroy=createMochiLauncher(h.ctx.ui,undefined,session,{onMessengerVisibility:(fn:any)=>{fn(false);return()=>{}},openMessenger:()=>{opens++}} as any)
    const w=h.widgets[0],button=document.querySelector<HTMLButtonElement>('.mochi-launcher')!
    w.drag();button.click();expect(opens).toBe(0);await new Promise(resolve=>setTimeout(resolve,190));button.click();expect(opens).toBe(1)
    Object.defineProperty(window,'innerWidth',{value:180,configurable:true});Object.defineProperty(window,'innerHeight',{value:180,configurable:true});window.dispatchEvent(new window.Event('resize'))
    expect(w.getPosition().x).toBeLessThanOrEqual(122);expect(w.getPosition().y).toBeLessThanOrEqual(122)
    session.destroy();expect(w.destroyed).toBe(true)
  }finally{destroy();h.cleanup()}
})

test('B0/B3: owner CSS, design system, Lucide notices/provenance and artwork retain canonical bytes',()=>{
  const assets=JSON.parse(readFileSync(new URL('./fixtures/mochi-core-01b-assets.json',import.meta.url),'utf8'))
  // Git may check text out as CRLF on Windows; freeze canonical LF content.
  for(const asset of assets)expect(createHash('sha256').update(readFileSync(new URL('../'+asset.path,import.meta.url),'utf8').replaceAll('\r\n','\n')).digest('hex')).toBe(asset.sha256)
  const provenance=JSON.parse(readFileSync(new URL('../src/mochi/ui/icons/provenance.json',import.meta.url),'utf8'))
  for(const [name,hash]of Object.entries(provenance.files))expect(createHash('sha256').update(readFileSync(new URL('../src/mochi/ui/icons/'+name+'.svg',import.meta.url),'utf8').replaceAll('\r\n','\n')).digest('hex')).toBe(hash)
})

test('C: delivery uses the dedicated Mochi namespace, 0.6.1 and compatible core capabilities',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../spindle.json',import.meta.url),'utf8'))
  expect(manifest.identifier).toBe('mochi');expect(manifest.version).toBe('0.6.1');expect(manifest.entry_backend).toBe('dist/backend.js');expect(manifest.entry_frontend).toBe('dist/frontend.js')
  expect(manifest.author).toBe('lizardqu33n')
  expect(manifest.github).toBe('https://github.com/lizardqu33n/Pocket-mochi')
  expect(manifest.homepage).toBe(manifest.github)
  expect(manifest.permissions.sort()).toEqual(['characters','generation','images','personas','ui_panels'])
  for(const entry of ['backend','frontend']){
    const bundle=readFileSync(new URL('../dist/'+entry+'.js',import.meta.url),'utf8')
    expect(bundle).not.toMatch(/phone_action|registerTagInterceptor|setupPhone|new PocketController|new RpContextPower|lumi-phone/)
    expect(bundle).toContain('mochi:')
  }
})

test('B3: both delivery bundles load against synthetic hosts without a Pocket install',async()=>{
  const h=backend(),previous=(globalThis as any).spindle
  let packaged:any
  try{
    ;(globalThis as any).spindle=h.host
    packaged=await import('../dist/backend.js')
    expect(h.listeners.size).toBe(1);expect(h.calls).toHaveLength(0)
    h.emit({type:'mochi:accounts',requestId:'bundle'},'alice');await flush()
    expect(h.events.find(e=>e.p?.type==='mochi:accounts')?.p.state.ownerId).toBe('alice')
  }finally{packaged?.teardown();(globalThis as any).spindle=previous}
  expect(h.listeners.size).toBe(0)
  const f=frontend({widgets:false});let destroy=()=>{}
  try{
    const module=await import('../dist/frontend.js')
    destroy=module.setup(f.ctx);expect(f.ready).toBe(1);expect(f.listeners.size).toBe(1);expect(f.tabs[0].spec.id).toBe('mochi-independent')
    f.tabs[0].activate();expect(f.sent.at(-1).type).toBe('mochi:accounts')
  }finally{destroy();f.cleanup()}
  expect(f.listeners.size).toBe(0)
})
