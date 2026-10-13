import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { getMochiSession } from '../src/mochi/session.js'
import { createMochiSidebar } from '../src/mochi/sidebar.js'
import { createMochiWorkspace } from '../src/mochi/workspace.js'
import { PocketPortal } from '../src/frontend/components/portal.js'
import { MOCHI_SIDEBAR_ICON } from '../src/mochi/sidebar-icon.js'
import { readFileSync } from 'node:fs'
import { createMochiLauncher } from '../src/mochi/launcher.js'
import type { SpindleFrontendContext } from 'lumiverse-spindle-types'

function fixture(width=900, geometry=true) {
  const dom=new JSDOM('<body><main id="portal"></main></body>',{pretendToBeVisual:true})
  const previous={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:dom.window.document,window:dom.window})
  Object.defineProperty(window,'innerWidth',{value:width,configurable:true})
  // jsdom does not implement native modal dialogs; emulate their lifecycle.
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
  dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
  const listeners=new Set<(p:unknown)=>void>(),sent:any[]=[],tabs:any[]=[];let floats=0
  const session=getMochiSession({sendToBackend:p=>sent.push(p),onBackendMessage:fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}}})
  const ui:any={registerDrawerTab:(options:any)=>{
    const root=document.createElement('div');document.body.append(root);let activate:(()=>void)|undefined
    const tab={options,root,onActivate:(fn:()=>void)=>{activate=fn;return()=>{activate=undefined}},activate:()=>activate?.(),destroy:()=>root.remove()};tabs.push(tab);return tab
  },createFloatWidget:(options:any)=>{
    floats++;const root=document.createElement('div');document.body.append(root);let position={...options.initialPosition}
    return {root,setVisible:(visible:boolean)=>{root.hidden=!visible},isVisible:()=>!root.hidden,setSize:()=>{},moveTo:(x:number,y:number)=>{position={x,y}},getPosition:()=>position,onDragEnd:()=>()=>{},destroy:()=>root.remove()}
  }}
  if(geometry)ui.geometry={layoutViewportSize:()=>({width,height:850}),createResizeController:()=>()=>{}}
  const navigation=createMochiSidebar({ui} as Pick<SpindleFrontendContext,'ui'>,session,()=>({enabled:true,previews:false}))
  const pocket=new PocketPortal(()=>{const node=document.createElement('p');node.textContent='Native Pocket phones and settings';return node},()=>navigation.root,()=>navigation.open(),undefined,{phones:'<svg data-test="original-phone" viewBox="0 0 24 24"></svg>',mochi:MOCHI_SIDEBAR_ICON})
  document.body.append(pocket.root)
  const pane={root:navigation.root,activate:()=>pocket.show('mochi')}
  const a='account_'+'a'.repeat(32),b='account_'+'b'.repeat(32)
  const bank:any={version:1,ownerId:'synthetic',revision:1,selectedAccountId:a,accounts:[a,b].map((id,i)=>({id,revision:1,persona:{name:'Synthetic',description:'',source:'manual',sourceId:'',avatarUrl:''},username:'',displayName:i?'Other profile':'Long fictional profile '.repeat(5),avatarUrl:'',archived:false,roomIds:['room_'+id]})),personas:[],avatars:[],warnings:[],canUploadAvatar:false}
  const emit=(p:any)=>{for(const fn of listeners)fn(p)}
  const request=(type:string)=>sent.filter(p=>p.type===type).at(-1)
  const accounts=()=>emit({type:'mochi:accounts',requestId:request('mochi:accounts').requestId,state:structuredClone(bank)})
  const state=(id:string|undefined,rooms=true)=>({accountId:id,rooms:rooms?[{id:'room_'+(id||'legacy'),accountId:id,ownerId:'synthetic',revision:1,title:'Long room '.repeat(15),characterIds:[],persona:{name:'Me',description:''},messages:[],settings:{autoReply:true,responseMode:'instant',instructions:'',connectionId:'',contextTokens:8192,outputTokens:1200,characterNames:{}}}]:[],characters:[],personas:[],connections:[],notifications:[],warnings:[]})
  const select=(id:string|undefined,rooms=true)=>{
    const button=id?pane.root.querySelector(`[data-account-id="${id}"]`):Array.from(pane.root.querySelectorAll('button')).find((n:any)=>n.textContent==='Unassigned legacy chats')
    ;(button as HTMLButtonElement).click()
    if(id){bank.selectedAccountId=id;bank.revision++;emit({type:'mochi:accounts',requestId:request('mochi:account_select').requestId,state:structuredClone(bank)})}
    emit({type:'mochi:state',requestId:request('mochi:list').requestId,state:state(id,rooms)})
  }
  const cleanup=()=>{try{navigation.destroy();session.destroy(false)}finally{dom.window.close();Object.assign(globalThis,previous)}}
  return {session,ui,navigation,tabs:[pane],registrations:tabs,pocket,sent,listeners,bank,a,b,emit,accounts,request,state,select,cleanup,get floats(){return floats}}
}

test('sidebar is navigation only: one subscription, no cancellation/read receipt or independent view',()=>{
  const h=fixture()
  try{
    const portal=createMochiWorkspace({root:document.getElementById('portal')!,session:h.session,notificationPolicy:()=>({enabled:false,previews:false})})
    portal.open();h.emit({type:'mochi:accounts',requestId:h.request('mochi:accounts').requestId,state:h.bank})
    h.session.view.state=h.state(h.a);h.session.view.roomId='room_'+h.a
    const view=h.session.view as any;view.ownGenerations.set(view.roomId,'synthetic-generation');view.drafts.set(view.roomId,'keep this draft');view.busy=true;view.request='synthetic-generation'
    const before=h.sent.length
    h.tabs[0].activate();h.accounts();h.tabs[0].activate();h.accounts()
    expect(h.listeners.size).toBe(1);expect(h.session.view).toBe(view);expect(portal.isOpen).toBe(true)
    expect(h.sent.slice(before).every(p=>p.type==='mochi:accounts')).toBe(true)
    expect(view.ownGenerations.get(view.roomId)).toBe('synthetic-generation');expect(view.drafts.get(view.roomId)).toBe('keep this draft');expect(h.floats).toBe(0)
    expect(view.busy).toBe(true);expect(view.request).toBe('synthetic-generation')
    expect(h.registrations).toHaveLength(0)
  }finally{h.cleanup()}
})

test('floating Mochi shortcut directly restores selected account, follows Pocket and hides/restores with one window',()=>{
  const h=fixture();let dispose:()=>void=()=>{}
  try{
    let drag:((p:{x:number;y:number})=>void)|undefined
    let pocketX=500,shortcut:any
    const create=h.ui.createFloatWidget;h.ui.createFloatWidget=(options:any)=>{const widget=create(options);if(options.tooltip==='Mochi'&&options.width===58)shortcut=widget;return widget}
    const pocket:any={getPosition:()=>({x:pocketX,y:160}),onDragEnd:(fn:any)=>{drag=fn;return()=>{drag=undefined}}}
    dispose=createMochiLauncher(h.ui,pocket,h.session,h.navigation)
    const launcher=document.querySelector<HTMLButtonElement>('.mochi-launcher')!,host=launcher.closest('.mochi-launcher-root')!.parentElement!
    launcher.click();expect(h.floats).toBe(1);expect(h.request('mochi:accounts')).toBeDefined();expect(document.querySelector('.mochi-window')).toBeNull()
    h.accounts();h.select(h.a);h.session.view.select('room_'+h.a)
    expect(host.hidden).toBe(true)
    document.querySelector<HTMLButtonElement>('[aria-label="Hide Mochi window"]')!.click();expect(host.hidden).toBe(false)
    const before=h.sent.length;launcher.click();expect(h.sent.length).toBe(before);expect(h.session.view.roomId).toBe('room_'+h.a);expect(host.hidden).toBe(true)
    expect(document.querySelectorAll('.mochi-window')).toHaveLength(1);expect(h.floats).toBe(2);drag?.({x:500,y:160});expect(shortcut.getPosition().x).toBe(436)
    pocketX=12;drag?.({x:12,y:160});expect(shortcut.getPosition().x).toBe(76)
    h.session.authenticatedIdentityChanged(null);expect(document.querySelector('.mochi-launcher')).toBeNull();expect(drag).toBeUndefined()
  }finally{dispose();h.cleanup()}
})

test('messenger account controls use sidebar editor; save/cancel return to conversations without losing drafts',()=>{
  const h=fixture()
  try{
    h.tabs[0].activate();h.accounts();h.select(h.a);h.session.view.select('room_'+h.a)
    const view=h.session.view as any;view.drafts.set(view.roomId,'Unsent draft')
    document.querySelector<HTMLButtonElement>('.mochi-window [aria-label="Switch Mochi account"]')!.click();h.accounts()
    expect(document.querySelector('.mochi-window .mochi-account-picker')).toBeNull();expect(view.roomId).toBe('room_'+h.a)
    document.querySelector<HTMLButtonElement>('.mochi-window [aria-label="Account settings"]')!.click()
    expect(h.navigation.root.querySelector('.mochi-profile-screen')).not.toBeNull();expect(document.querySelector('.mochi-window .mochi-profile-screen')).toBeNull()
    Array.from(h.navigation.root.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent==='Cancel profile changes')!.click()
    expect(view.isSidebarProfileOpen).toBe(false);expect(view.roomId).toBe('room_'+h.a);expect(view.drafts.get(view.roomId)).toBe('Unsent draft')
    h.navigation.settings(document.createElement('button'));view.profiles.draft.displayName='Changed synthetic profile'
    h.navigation.root.querySelector<HTMLFormElement>('form')!.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}))
    expect(h.request('mochi:account_update').accountId).toBe(h.a)
    h.bank.revision++;h.emit({type:'mochi:accounts',requestId:h.request('mochi:account_update').requestId,state:h.bank})
    expect(view.isSidebarProfileOpen).toBe(false);expect(view.roomId).toBe('room_'+h.a);expect(view.drafts.get(view.roomId)).toBe('Unsent draft')
    expect(document.querySelector('.mochi-window .mochi-account-picker')).toBeNull();expect(h.listeners.size).toBe(1)
  }finally{h.cleanup()}
})

test('one Pocket rail tab: adjacent internal shortcuts reuse native phones and the 01E account picker',()=>{
  const h=fixture()
  try{
    const source=readFileSync(new URL('../src/frontend/controller.ts',import.meta.url),'utf8')
    expect(source.match(/registerDrawerTab\(/g)).toHaveLength(1)
    expect(source).toContain("id: 'lumiphone'")
    expect(source).toContain('if(this.mochiSession.owns(this.mochiSurface))this.mochi.leave()')
    const shortcuts=h.pocket.root.querySelectorAll('.pocket-portal-destination')
    expect(shortcuts).toHaveLength(2);expect(shortcuts[0].querySelector('[data-test="original-phone"]')).not.toBeNull()
    expect(shortcuts[1].querySelector('.pocket-portal-art')!.innerHTML).toContain('viewBox="0 0 24 24"')
    expect(h.pocket.root.querySelector('[aria-label="Open Mochi window"]')).toBeNull()
    ;(shortcuts[1] as HTMLButtonElement).click();h.accounts();expect(h.pocket.root.contains(h.tabs[0].root)).toBe(true)
    h.select(h.a);expect(h.floats).toBe(1);expect(h.pocket.root.dataset.destination).toBe('mochi')
    h.session.view.select('room_'+h.a);const view=h.session.view as any;view.ownGenerations.set(view.roomId,'pending');view.drafts.set(view.roomId,'draft')
    const before=h.sent.length
    h.pocket.root.querySelector<HTMLButtonElement>('.pocket-portal-home')!.click()
    h.pocket.root.querySelector<HTMLButtonElement>('[aria-label="Connect to your phone"]')!.click()
    expect(h.pocket.root.textContent).toContain('Native Pocket phones and settings');expect(h.sent.length).toBe(before)
    expect(view.drafts.get(view.roomId)).toBe('draft');expect(view.ownGenerations.get(view.roomId)).toBe('pending')
    h.pocket.show('home');h.pocket.root.querySelector<HTMLButtonElement>('[aria-label="Open Mochi"]')!.click();h.accounts()
    expect(h.session.view.roomId).toBe('room_'+h.a);expect(h.floats).toBe(1);expect(h.registrations).toHaveLength(0)
  }finally{h.cleanup()}
})

test('desktop selection restores rooms per account, reuses one window and falls back for missing rooms',()=>{
  const h=fixture()
  try{
    h.tabs[0].activate();h.accounts();h.select(h.a);h.session.view.select('room_'+h.a)
    h.tabs[0].activate();h.accounts();h.select(h.b);h.session.view.select('room_'+h.b)
    h.tabs[0].activate();h.accounts();h.select(h.a)
    expect(h.session.view.roomId).toBe('room_'+h.a);expect(h.floats).toBe(1);expect(h.listeners.size).toBe(1)
    expect(document.querySelectorAll('.mochi-window')).toHaveLength(1)
    h.tabs[0].activate();h.accounts();h.select(h.b,false);expect(h.session.view.roomId).toBe('')
    h.session.authenticatedIdentityChanged(null);expect(h.listeners.size).toBe(0);expect(document.querySelector('.mochi-sidebar')).toBeNull();expect(h.session.view.state).toBeNull()
  }finally{h.cleanup()}
})

for(const width of [320,390])test(`mobile ${width}: account selection stays in Mochi drawer; legacy scope preserved`,()=>{
  const h=fixture(width)
  try{
    h.tabs[0].activate();h.accounts();h.select(h.a)
    expect(h.floats).toBe(0);expect(h.tabs[0].root.querySelector('.mochi-desktop')).not.toBeNull()
    h.tabs[0].activate();h.accounts();h.select(undefined)
    expect(h.session.view.state?.accountId).toBeUndefined();expect(h.floats).toBe(0);expect(h.listeners.size).toBe(1)
    h.session.view.select('room_legacy');h.tabs[0].activate();h.accounts();h.select(h.a)
    h.tabs[0].activate();h.accounts();h.select(undefined);expect(h.session.view.roomId).toBe('room_legacy')
  }finally{h.cleanup()}
})

test('navigation refresh stays metadata-only before selection; hidden mobile picker does not acknowledge notifications',()=>{
  const h=fixture(390)
  try{
    h.tabs[0].activate();h.session.refresh();expect(h.sent.filter(p=>p.type==='mochi:accounts')).toHaveLength(1);expect(h.sent.some(p=>p.type==='mochi:list')).toBe(false)
    h.accounts();h.select(h.a);h.session.view.select('room_'+h.a)
    h.tabs[0].activate();h.accounts();const before=h.sent.length
    h.emit({type:'mochi:notification',accountId:h.a,notificationRevision:1,notification:{id:'notice',accountId:h.a,roomId:'room_'+h.a,messageId:'message',title:'Synthetic',roomTitle:'Synthetic',body:'Synthetic',avatarUrl:'',createdAt:'2026-10-12T12:00:00Z',read:false}})
    expect(h.sent.slice(before).some(p=>p.type==='mochi:notification_read')).toBe(false)
    expect(document.querySelector('.mochi-notification-toast')).toBeNull()
  }finally{h.cleanup()}
})

test('unsupported float host uses Mochi drawer, never Pocket phone',()=>{
  const h=fixture(900,false)
  try{h.tabs[0].activate();h.accounts();h.select(h.a);expect(h.floats).toBe(0);expect(h.tabs[0].root.textContent).toContain('Floating windows are unavailable');expect(h.tabs[0].root.querySelector('.mochi-desktop')).not.toBeNull()}finally{h.cleanup()}
})

test('picker loading/error/empty states, account creation and dirty-form safeguards use existing view',()=>{
  const h=fixture()
  try{
    h.tabs[0].activate();expect(h.tabs[0].root.textContent).toContain('Loading accounts')
    h.emit({type:'mochi:error',requestId:h.request('mochi:accounts').requestId,message:'private detail'});expect(h.tabs[0].root.textContent).toContain('Unable to load accounts');expect(h.tabs[0].root.textContent).not.toContain('private detail')
    h.tabs[0].activate();h.bank.accounts=[];h.accounts();expect(h.tabs[0].root.textContent).toContain('No fictional accounts yet')
    Array.from(h.tabs[0].root.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent==='Create account')!.click()
    expect(h.floats).toBe(0);expect(document.querySelector('.mochi-profile-preview')).not.toBeNull()
    const view=h.session.view as any;view.profiles.draft.displayName='Unsaved name';expect(view.hasUnsavedChanges()).toBe(true)
    h.bank.accounts=[{id:h.b,displayName:'Other',avatarUrl:'',archived:false,roomIds:[]}];h.tabs[0].activate();h.accounts()
    const count=h.sent.length;h.tabs[0].root.querySelector<HTMLButtonElement>(`[data-account-id="${h.b}"]`)!.click()
    expect(h.sent.length).toBe(count);expect(view.profiles.draft.displayName).toBe('Unsaved name');expect(document.body.textContent).toContain('You have unsaved changes')
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent.includes('Keep editing'))!.click()
    expect(h.sent.length).toBe(count);expect(view.hasUnsavedChanges()).toBe(true)
    h.tabs[0].root.querySelector<HTMLButtonElement>(`[data-account-id="${h.b}"]`)!.click()
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent.includes('Discard changes'))!.click()
    expect(h.request('mochi:account_select').accountId).toBe(h.b)
  }finally{h.cleanup()}
})
