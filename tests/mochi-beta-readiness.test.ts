import {expect,test} from 'bun:test'
import {JSDOM} from 'jsdom'
import {getMochiSession,type MochiTransport} from '../src/mochi/session.js'
import {defaultMochiSettings,type MochiRoom} from '../src/mochi/types.js'

function fixture(){
 const dom=new JSDOM('<!doctype html><body></body>'),previous={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window})
 const listeners=new Set<(payload:unknown)=>void>()
 const transport:MochiTransport={sendToBackend:()=>{},onBackendMessage:fn=>{listeners.add(fn);return()=>listeners.delete(fn)}}
 const session=getMochiSession(transport),emit=(payload:unknown)=>{for(const listener of listeners)listener(payload)}
 // Production-shaped room: there is no top-level real-owner field in MochiRoom.
 const room:MochiRoom={version:1,id:'room_'+'a'.repeat(32),revision:1,title:'Synthetic private room',characterIds:[],persona:{source:'manual',sourceId:'',name:'Synthetic',description:'',avatarUrl:''},messages:[],settings:defaultMochiSettings(),createdAt:'2026-10-13T00:00:00Z',updatedAt:'2026-10-13T00:00:00Z'}
 emit({type:'mochi:accounts',state:{ownerId:'alice'}})
 session.view.state={rooms:[room],characters:[],personas:[],warnings:[]}
 const drafts=(session.view as unknown as {drafts:Map<string,string>}).drafts
 drafts.set(room.id,'Synthetic unsent draft')
 return{dom,session,listeners,room,drafts,emit,cleanup:()=>{session.destroy(false);dom.window.close();Object.assign(globalThis,previous)}}
}

test('KNOWN RELEASE GAP: retained transport and owner-less room response cannot attest a silent real-user change',()=>{
 const f=fixture()
 try{
  expect(Object.hasOwn(f.room,'ownerId')).toBe(false)
  // Conditional reproduction: the host retains the context and sends no trusted
  // auth callback. This is evidence of missing enforcement, NOT a privacy pass.
  f.emit({type:'mochi:state',state:{rooms:[structuredClone(f.room)],characters:[],personas:[],warnings:[]}})
  expect(f.session.isDestroyed).toBe(false)
  expect(f.drafts.get(f.room.id)).toBe('Synthetic unsent draft')
  expect(f.listeners.size).toBe(1)
 }finally{f.cleanup()}
})

test('trusted same-user boundary preserves drafts; different-user boundary clears caches and subscription',()=>{
 const f=fixture()
 try{
  f.session.authenticatedIdentityChanged('alice')
  expect(f.drafts.get(f.room.id)).toBe('Synthetic unsent draft')
  f.session.authenticatedIdentityChanged('bob')
  expect(f.session.isDestroyed).toBe(true);expect(f.drafts.size).toBe(0)
  expect(f.session.view.state).toBeNull();expect(f.listeners.size).toBe(0)
 }finally{f.cleanup()}
})

test('authoritative expired-session event clears production-shaped private state',()=>{
 const f=fixture()
 try{
  f.dom.window.dispatchEvent(new f.dom.window.Event('lumiverse:auth-session-invalid'))
  expect(f.session.isDestroyed).toBe(true);expect(f.drafts.size).toBe(0);expect(f.listeners.size).toBe(0)
 }finally{f.cleanup()}
})

test('explicit logout clears private metadata and delayed owner-less responses cannot repopulate the disposed view',()=>{
 const f=fixture()
 try{
  const controller=new AbortController(),view=f.session.view as unknown as {modelControllers:Set<AbortController>;modelChoices:Map<string,unknown>}
  view.modelControllers.add(controller);view.modelChoices.set('synthetic',{models:['synthetic']})
  f.session.authenticatedIdentityChanged(null)
  f.emit({type:'mochi:state',state:{rooms:[f.room],characters:[],personas:[],warnings:[]}})
  expect(controller.signal.aborted).toBe(true);expect(view.modelChoices.size).toBe(0)
  expect(f.session.view.state).toBeNull();expect(f.drafts.size).toBe(0);expect(f.listeners.size).toBe(0)
 }finally{f.cleanup()}
})

test('network errors, principal-less reconnects and fictional-account DTOs are not trusted real-user changes',()=>{
 const f=fixture()
 try{
  f.emit({type:'mochi:error',message:'Synthetic temporary outage'})
  f.emit({type:'CONNECTED',role:'owner'})
  f.emit({type:'mochi:state',state:{accountId:'account_'+'b'.repeat(32),rooms:[{...f.room,accountId:'account_'+'b'.repeat(32)}],characters:[],personas:[],warnings:[]}})
  expect(f.session.isDestroyed).toBe(false);expect(f.drafts.get(f.room.id)).toBe('Synthetic unsent draft')
  f.session.authenticatedIdentityChanged('alice')
  expect(f.session.isDestroyed).toBe(false)
 }finally{f.cleanup()}
})
