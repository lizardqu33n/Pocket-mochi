import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { getMochiSession, type MochiSurface, type MochiTransport } from '../src/mochi/session.js'
import { createMochiWorkspace } from '../src/mochi/workspace.js'

function harness() {
  const dom = new JSDOM('<!doctype html><body><main id="one"></main><main id="two"></main></body>',{pretendToBeVisual:true})
  const priorDocument=globalThis.document, priorWindow=globalThis.window
  Object.assign(globalThis,{document:dom.window.document,window:dom.window})
  const listeners=new Set<(p:unknown)=>void>(), sent:any[]=[]
  const transport:MochiTransport={sendToBackend:p=>{sent.push(p)},onBackendMessage:fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}}}
  const session=getMochiSession(transport)
  const emit=(p:any)=>{for(const fn of listeners)fn(p)}
  const room:any={id:'room_'+'a'.repeat(32),ownerId:'alice',title:'Synthetic room',revision:1,characterIds:['char'],persona:{source:'manual',sourceId:'',name:'Me',description:''},messages:[],settings:{autoReply:true,responseMode:'instant',connectionId:'owned',instructions:'',contextTokens:8192,outputTokens:1200,characterNames:{}}}
  const state:any={rooms:[room],characters:[{id:'char',name:'Character'}],connections:[{id:'owned',name:'Synthetic connection',model:'default'}],personas:[],warnings:[],notifications:[]}
  const load=()=>{
    emit({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:{version:1,ownerId:'alice',revision:1,accounts:[],personas:[],avatars:[],warnings:[],canUploadAvatar:false,phone:{supported:false,preference:'picker'}}})
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent==='Unassigned legacy chats')!.click()
    emit({type:'mochi:state',requestId:sent.at(-1).requestId,state:structuredClone(state)});session.view.select(room.id)
  }
  const workspace=(id='one')=>createMochiWorkspace({root:document.getElementById(id)!,transport,notificationPolicy:()=>({enabled:true,previews:false})})
  const cleanup=()=>{try{session.destroy(false)}finally{dom.window.close();Object.assign(globalThis,{document:priorDocument,window:priorWindow})}}
  return{dom,transport,session,emit,sent,listeners,room,state,load,workspace,cleanup}
}

test('session: context picks share one view/listener and native messages remain independent',()=>{
  const h=harness()
  try{
    const picked={sendToBackend:h.transport.sendToBackend,onBackendMessage:h.transport.onBackendMessage}
    expect(getMochiSession(picked)).toBe(h.session);expect(h.listeners.size).toBe(1)
    const native:any[]=[];h.session.subscribeNative(p=>native.push(p))
    const one=h.workspace(),two=h.workspace('two')
    expect(h.listeners.size).toBe(1);expect(h.sent).toHaveLength(0)
    h.emit({type:'lumiphone:state',state:{chatId:'unrelated RP'}});expect(native).toHaveLength(1)
    h.emit({type:'mochi:scheduling_updated',accountId:'foreign',roomId:h.room.id});expect(native).toHaveLength(1)
    one.destroy();expect(h.session.isDestroyed).toBe(false);two.destroy()
  }finally{h.cleanup()}
})

test('session: compatibility handoff hides the previous surface without resetting room or composer draft',()=>{
  const h=harness()
  try{
    const one=h.workspace(),two=h.workspace('two');one.open();h.load();one.refresh()
    h.emit({type:'mochi:state',requestId:h.sent.at(-1).requestId,state:h.state})
    const input=document.querySelector<HTMLTextAreaElement>('#one [aria-label="Message"]')!
    input.value='Retained unsent text';input.dispatchEvent(new h.dom.window.Event('input'))
    const count=h.sent.length;two.open()
    expect(one.isOpen).toBe(false);expect(two.isOpen).toBe(true);expect(h.sent.length).toBe(count)
    expect(document.querySelector<HTMLTextAreaElement>('#two [aria-label="Message"]')!.value).toBe('Retained unsent text')
    expect(h.session.view.roomId).toBe(h.room.id);expect(h.listeners.size).toBe(1)
    two.destroy();expect(h.session.isDestroyed).toBe(false);one.open();expect(one.isOpen).toBe(true)
    expect(document.querySelector<HTMLTextAreaElement>('#one [aria-label="Message"]')!.value).toBe('Retained unsent text')
    one.destroy();expect(h.listeners.size).toBe(0)
  }finally{h.cleanup()}
})

test('session: hide/restore preserves nodes and settings drafts; same-owner refresh does not reset selection',()=>{
  const h=harness()
  try{
    const workspace=h.workspace();workspace.open();h.load();workspace.refresh();h.emit({type:'mochi:state',requestId:h.sent.at(-1).requestId,state:h.state})
    const composer=document.querySelector('[aria-label="Message"]');workspace.close();workspace.open();expect(document.querySelector('[aria-label="Message"]')).toBe(composer)
    document.querySelector<HTMLButtonElement>('[aria-label="Settings"]')!.click()
    const instructions=document.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!
    instructions.value='Unsaved room configuration';instructions.dispatchEvent(new h.dom.window.Event('input'))
    workspace.close();workspace.open();expect(document.querySelector('[aria-label="Room instructions"]')).toBe(instructions)
    h.session.authenticatedIdentityChanged('alice')
    expect(h.session.view.roomId).toBe(h.room.id);expect(h.session.view.hasUnsavedChanges()).toBe(true)
    h.emit({type:'mochi:state',requestId:h.sent.at(-1).requestId,state:h.state})
    expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!.value).toBe('Unsaved room configuration')
    expect(h.session.isDestroyed).toBe(false)
  }finally{h.cleanup()}
})

test('session: exactly one surface owns notification/read behavior and hidden windows do not acknowledge',()=>{
  const h=harness()
  try{
    const one=h.workspace(),two=h.workspace('two');one.open();h.load();one.refresh();h.emit({type:'mochi:state',requestId:h.sent.at(-1).requestId,state:h.state})
    one.close()
    const notice:any={id:'n1',roomId:h.room.id,messageId:'m1',title:'Character',roomTitle:'Room',body:'Private preview',createdAt:new Date().toISOString(),read:false,accountId:undefined}
    h.emit({type:'mochi:notification',notification:notice,notificationRevision:1})
    expect(h.sent.filter(p=>p.type==='mochi:notification_read')).toHaveLength(0);expect(document.querySelectorAll('.mochi-notification-toast')).toHaveLength(0)
    two.open();expect(h.sent.filter(p=>p.type==='mochi:notification_read')).toHaveLength(1)
    h.emit({type:'mochi:notification',notification:notice,notificationRevision:1});expect(h.sent.filter(p=>p.type==='mochi:notification_read')).toHaveLength(1)
    h.session.view.select('');h.emit({type:'mochi:notification',notification:{...notice,id:'n2',messageId:'m2'},notificationRevision:2})
    expect(document.querySelectorAll('.mochi-notification-toast')).toHaveLength(1)
  }finally{h.cleanup()}
})

test('session: logout destroys all surfaces, aborts metadata, clears private caches and ignores late events',()=>{
  const h=harness()
  try{
    const workspace=h.workspace();workspace.open();h.load()
    const controller=new AbortController(),view=h.session.view as any
    view.modelControllers.add(controller);view.modelChoices.set('private',{models:['secret'],labels:{}});view.drafts.set(h.room.id,'Private draft');view.profiles.draft={displayName:'Private profile'}
    h.session.authenticatedIdentityChanged(null)
    expect(controller.signal.aborted).toBe(true);expect(view.state).toBeNull();expect(view.drafts.size).toBe(0);expect(view.modelChoices.size).toBe(0);expect(view.profiles.draft).toBeNull()
    expect(h.listeners.size).toBe(0);expect(workspace.isOpen).toBe(false);expect(document.querySelector('.mochi-workspace')).toBeNull()
    h.emit({type:'mochi:state',state:h.state});expect(view.state).toBeNull()
    expect(()=>getMochiSession(h.transport)).toThrow('destroyed');expect(()=>workspace.open()).toThrow('destroyed')
  }finally{h.cleanup()}
})

test('session: authoritative real-owner change fails closed, while auth invalidation is not RP switching',()=>{
  const h=harness()
  try{
    const workspace=h.workspace();workspace.open();h.load();const count=h.sent.length
    h.emit({type:'lumiphone:state',state:{chatId:'new RP',characterId:'new character'}});expect(h.session.isDestroyed).toBe(false)
    h.emit({type:'mochi:accounts',state:{ownerId:'bob',accounts:[]}})
    expect(h.session.isDestroyed).toBe(true);expect(h.sent.length).toBe(count);expect(h.session.view.state).toBeNull();expect(h.listeners.size).toBe(0)
  }finally{h.cleanup()}
  const other=harness()
  try{other.workspace().open();other.dom.window.dispatchEvent(new other.dom.window.Event('lumiverse:auth-session-invalid'));expect(other.session.isDestroyed).toBe(true);expect(other.listeners.size).toBe(0)}finally{other.cleanup()}
})

test('session: inactive transport still cleans every surface and lease',()=>{
  const h=harness()
  try{
    const workspace=h.workspace();workspace.open();h.load();(h.session.view as any).ownGenerations.set(h.room.id,'running')
    // The session retains its transport object, like the host invalidating a context.
    h.transport.sendToBackend=()=>{throw Error('SPINDLE_FRONTEND_INACTIVE')}
    expect(()=>workspace.destroy()).toThrow('SPINDLE_FRONTEND_INACTIVE')
    expect(h.listeners.size).toBe(0);expect(h.session.isDestroyed).toBe(true);expect(document.querySelector('.mochi-workspace')).toBeNull()
  }finally{h.cleanup()}
})

test('session: portal and workspace use the same view, lease and cancellation owner',()=>{
  const h=harness()
  let portalActive=false, disposed=false
  try{
    const root=document.getElementById('one')!, native:any[]=[]
    h.session.subscribeNative(p=>native.push(p))
    const surface:MochiSurface={
      redraw:()=>{if(portalActive)root.replaceChildren(h.session.view.render())},
      navigate:id=>{h.session.view.select(id||'')},
      policy:()=>({enabled:true,previews:false,visible:portalActive}),
      notify:()=>{},reconcile:()=>{},dismiss:()=>{},
      ownership:active=>{portalActive=active;if(active)root.replaceChildren(h.session.view.render());else root.replaceChildren()},
      disposed:()=>{disposed=true;root.replaceChildren()},
    }
    h.session.attach(surface);h.session.activate(surface);h.load();h.session.refresh()
    h.emit({type:'mochi:state',requestId:h.sent.at(-1).requestId,state:h.state})
    const input=root.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!
    input.value='Portal draft';input.dispatchEvent(new h.dom.window.Event('input'))
    ;(h.session.view as any).ownGenerations.set(h.room.id,'interactive')
    const workspace=h.workspace('two');workspace.open()
    expect(portalActive).toBe(false);expect(h.session.owns(surface)).toBe(false);expect(h.listeners.size).toBe(1)
    expect(h.sent.filter(p=>p.type==='mochi:cancel')).toHaveLength(1)
    expect(document.querySelector<HTMLTextAreaElement>('#two [aria-label="Message"]')!.value).toBe('Portal draft')
    h.emit({type:'lumiphone:state',state:{chatId:'RP switch'}});expect(native).toHaveLength(1);expect(h.session.view.roomId).toBe(h.room.id)
    h.session.activate(surface);expect(workspace.isOpen).toBe(false);expect(root.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('Portal draft')
    workspace.destroy();expect(h.session.isDestroyed).toBe(false)
    h.session.destroy();expect(disposed).toBe(true);expect(h.listeners.size).toBe(0)
    expect(h.sent.filter(p=>p.type==='mochi:cancel')).toHaveLength(1)
  }finally{h.cleanup()}
})

test('session: visible configuration never marks the hidden conversation as read',()=>{
  const h=harness()
  try{
    const workspace=h.workspace();workspace.open();h.load();workspace.refresh();h.emit({type:'mochi:state',requestId:h.sent.at(-1).requestId,state:h.state})
    const view=h.session.view as any;view.profilesOpen=true
    h.emit({type:'mochi:notification',notification:{id:'profile_notice',roomId:h.room.id,messageId:'message',title:'Character',roomTitle:'Room',body:'Private',createdAt:new Date().toISOString(),read:false},notificationRevision:1})
    expect(h.sent.filter(p=>p.type==='mochi:notification_read')).toHaveLength(0)
    expect(h.session.view.state!.notifications![0].read).toBe(false)
    view.profilesOpen=false;h.session.view.resume()
    expect(h.sent.filter(p=>p.type==='mochi:notification_read')).toHaveLength(1)
  }finally{h.cleanup()}
})
