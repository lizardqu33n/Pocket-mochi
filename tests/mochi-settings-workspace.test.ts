import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {fixture} from './mochi-accounts.test.js'
import {MochiUIPreferences,defaultUIPreferences,TOOLBAR_ACTIONS} from '../src/mochi/ui-preferences.js'
import {MochiView} from '../src/mochi/view.js'
import {PersonalSettings} from '../src/mochi/personal-settings.js'

test('presentation persistence is authenticated, fictional-profile scoped, revision safe and does not mutate room/account state',async()=>{
 const f=fixture()
 try{
  const a=await f.profile(),b=await f.profile('p2'),bob=await f.profile('p3','bob'),room=await f.room(a.id),prefs=new MochiUIPreferences(f.host,f.service.fictionalAccounts)
  const before=JSON.stringify(await f.service.read('alice',room.id,a.id)),bank=JSON.stringify(await f.service.fictionalAccounts.bank('alice'))
  const value=defaultUIPreferences();value.order.reverse();value.hidden=[...TOOLBAR_ACTIONS];value.dock='compact'
  await prefs.save('alice',{accountId:a.id,revision:0,preferences:value})
  expect((await prefs.read('alice',a.id)).preferences).toEqual(value);expect((await prefs.read('alice',b.id)).revision).toBe(0);expect((await prefs.read('bob',bob.id)).preferences).toEqual(defaultUIPreferences())
  await expect(prefs.read('bob',a.id)).rejects.toThrow();await expect(prefs.save('alice',{accountId:a.id,revision:0,preferences:value})).rejects.toThrow('changed')
  await expect(prefs.save('alice',{accountId:b.id,revision:0,preferences:{...value,order:['settings']}})).rejects.toThrow('Invalid')
  expect(JSON.stringify(await f.service.read('alice',room.id,a.id))).toBe(before);expect(JSON.stringify(await f.service.fictionalAccounts.bank('alice'))).toBe(bank);expect(f.calls).toHaveLength(0)
  f.restart();expect((await new MochiUIPreferences(f.host,f.service.fictionalAccounts).read('alice',a.id)).preferences).toEqual(value)
  const path='alice:mochi/v1/ui-preferences/'+a.id+'.json';f.files.set(path,{...(f.files.get(path)),ownerId:'bob'});const damaged=JSON.stringify(f.files.get(path));await expect(prefs.save('alice',{accountId:a.id,revision:1,preferences:value})).rejects.toThrow('damaged');expect(JSON.stringify(f.files.get(path))).toBe(damaged)
 }finally{f.scheduler.stop()}
})

async function ui(width:number){
 const f=fixture(),dom=new JSDOM('<body><main></main></body>',{pretendToBeVisual:true}),prior={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:dom.window.document,window:dom.window});Object.defineProperty(window,'innerWidth',{value:width})
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const account=await f.profile(),room=await f.room(account.id),sent:any[]=[];room.characterIds.push('alice_other');const state=await f.service.state('alice',account.id);state.rooms=[room];state.characters=[{id:'alice_character',name:'Same name'},{id:'alice_other',name:'Same name'}]
 let view:MochiView;const root=document.querySelector('main')!,render=()=>{const next=view.renderDesktop(),previous=root.querySelector(':scope>.mochi-view');if(previous)previous.replaceWith(next);else root.append(next)};root.classList.add('mochi-workspace');view=new MochiView(p=>sent.push(p),render,()=>{});view.state=state;view.select(room.id);view.loadNavigationAccounts();view.receive({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:await f.service.accountsState('alice')});render()
 const click=(label:string)=>{const b=root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)||Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===label);expect(b,label+String(root.querySelector(".mochi-settings-workspace")?.textContent)).toBeDefined();b!.click()}
 const preferences=async()=>{const request=sent.filter(p=>p.type==='mochi:ui_preferences').at(-1);await f.service.handle(request,'alice');view.receive(f.events.findLast(e=>e.payload.requestId===request.requestId)!.payload)}
 return{f,dom,view,root,room,sent,click,preferences,close:()=>{view.destroy();f.scheduler.stop();Object.assign(globalThis,prior);dom.window.close()}}
}

for(const width of [320,390,900,1280])test(`${width}px Chat/Personal workspace keeps staged categories and duplicate-character values independent`,async()=>{
 const h=await ui(width)
 try{
  h.click('Chat Settings');expect(h.root.querySelector('.mochi-composer')).toBeNull();expect(h.root.querySelector('[aria-label="Chat Settings"]')).not.toBeNull()
  const changes=h.sent.filter(p=>p.type!=='mochi:choices'&&p.type!=='mochi:accounts'&&p.type!=='mochi:ui_preferences').length
  const name=h.root.querySelector<HTMLInputElement>('[aria-label="Chat name"]')!;name.value='Retained title';name.dispatchEvent(new window.Event('input'))
  for(const category of ['Texting Behavior','Availability & Schedules','Advanced','General'])h.click(category)
  expect(h.sent.filter(p=>p.type!=='mochi:choices'&&p.type!=='mochi:accounts'&&p.type!=='mochi:ui_preferences')).toHaveLength(changes)
  expect(h.root.querySelector<HTMLInputElement>('[aria-label="Chat name"]')!.value).toBe('Retained title')
  h.click('Edit character 1: Same name');await Promise.resolve();const first=h.root.querySelector<HTMLInputElement>('[aria-label="Display name for Same name · character 1"]')!;first.value='Only first';first.dispatchEvent(new window.Event('input'));h.click('Back to characters');await Promise.resolve()
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Edit character 1: Same name')
  h.click('Edit character 2: Same name');expect(h.root.querySelector<HTMLInputElement>('[aria-label="Display name for Same name · character 2"]')!.value).toBe('');h.click('Back to characters')
  h.click('Personal');await h.preferences();h.click('Chat');expect(h.root.querySelector<HTMLInputElement>('[aria-label="Chat name"]')!.value).toBe('Retained title')
  h.click('Save settings');const save=h.sent.findLast(p=>p.type==='mochi:update');expect(save.settings.characterNames.alice_character).toBe('Only first');expect(save.settings.characterNames.alice_other).toBeUndefined();expect(save.title).toBe('Retained title')
 }finally{h.close()}
})

test('toolbar customization persists, preserves overflow access and restores defaults without changing profile selection',async()=>{
 const h=await ui(900)
 try{
  h.click('Personal Settings');await h.preferences();const scope=h.view.state!.accountId
  for(const box of h.root.querySelectorAll<HTMLInputElement>('[aria-label^="Show "]')){box.checked=false;box.dispatchEvent(new window.Event('change'))}
  h.click('Move Presets up');h.click('Save presentation');await h.preferences();h.click('Return to conversation')
  expect(h.view.state!.accountId).toBe(scope);expect(h.root.querySelector('.mochi-custom-toolbar [aria-label="Chat Settings"]')).toBeNull();expect(h.root.querySelector('[aria-label="Room options"]')).not.toBeNull();expect(h.root.querySelector('[aria-label="Settings"]')).not.toBeNull();expect(h.root.querySelector('[aria-label="Personal Settings"]')).not.toBeNull();expect(h.root.querySelector('[aria-label="Message"]')).not.toBeNull()
  h.click('Personal Settings');h.click('Restore default presentation');expect(h.sent.filter(p=>p.type==='mochi:ui_preferences'&&p.action==='save')).toHaveLength(1);h.click('Save presentation');await h.preferences();h.click('Return to conversation');expect(h.root.querySelector('.mochi-custom-toolbar [aria-label="Chat Settings"]')).not.toBeNull()
 }finally{h.close()}
})

test('dirty navigation requires confirmation and preset tools return to intact advanced settings',async()=>{
 const h=await ui(900)
 try{
  h.click('Chat Settings');h.click('Advanced');h.click('Presets');expect(h.root.querySelector('[aria-label="Mochi presets"]')).not.toBeNull();expect(h.root.querySelector('.mochi-composer')).toBeNull();h.click('Return to conversation');expect(h.root.querySelector('[aria-label="Advanced settings"]')).not.toBeNull()
  h.click('General');const input=h.root.querySelector<HTMLInputElement>('[aria-label="Chat name"]')!;input.value='Dirty';input.dispatchEvent(new window.Event('input'));h.click('Return to conversation');expect(h.root.querySelector('dialog[open]')).not.toBeNull();h.click('Keep editing');expect(h.root.querySelector<HTMLInputElement>('[aria-label="Chat name"]')!.value).toBe('Dirty')
 }finally{h.close()}
})

test('presentation tickets reject late fictional scopes and foreign owners; reset forgets the prior profile',()=>{
 let account='account_'+'a'.repeat(32);const sent:any[]=[],panel=new PersonalSettings(p=>sent.push(p),()=>account,()=> 'alice',()=>{})
 panel.load();const old=sent.at(-1);account='account_'+'b'.repeat(32);panel.reset();panel.load();const current=sent.at(-1)
 const custom={...defaultUIPreferences(),dock:'compact' as const}
 panel.receive({type:'mochi:ui_preferences',requestId:old.requestId,record:{version:1,ownerId:'alice',accountId:old.accountId,revision:1,preferences:custom}});expect(panel.saved).toBeUndefined()
 panel.receive({type:'mochi:ui_preferences',requestId:current.requestId,record:{version:1,ownerId:'bob',accountId:account,revision:1,preferences:custom}});expect(panel.saved).toBeUndefined();expect(panel.value).toEqual(defaultUIPreferences());panel.reset()
})

test('opening settings and saving visual preferences do not cancel a running reply',async()=>{
 const h=await ui(900)
 try{
  (h.view as any).ownGenerations.set(h.room.id,'running_fixture');h.view.state!.jobs={[h.room.id]:'running_fixture'}
  h.click('Personal Settings');await h.preferences();h.click('Save presentation');await h.preferences();h.click('Chat');h.click('Texting Behavior');h.click('Availability & Schedules')
  expect(h.sent.some(p=>p.type==='mochi:cancel')).toBe(false);expect((h.view as any).ownGenerations.get(h.room.id)).toBe('running_fixture');expect(h.f.calls).toHaveLength(0)
 }finally{h.close()}
})


test('presentation transport failures remain private and are sent only to the authenticated owner',async()=>{
 const f=fixture()
 try{
  const a=await f.profile();f.host.userStorage.exists=async()=>{throw Error('SYNTHETIC_PRIVATE_STORAGE_SENTINEL')}
  await f.service.handle({type:'mochi:ui_preferences',action:'get',accountId:a.id,requestId:'ui_failure'},'alice')
  const response=f.events.findLast(e=>e.payload.requestId==='ui_failure')!
  expect(response.user).toBe('alice');expect(response.payload.type).toBe('mochi:error');expect(response.payload.message).not.toContain('SYNTHETIC_PRIVATE_STORAGE_SENTINEL');expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})


test('profile management during a busy running reply reaches confirmation instead of silently ignoring the click',async()=>{
 const h=await ui(900)
 try{
  h.click('Personal Settings');const choices=h.sent.findLast(p=>p.type==='mochi:choices')
  const view=h.view as any;view.busy=true;view.ownGenerations.set(h.room.id,'active_reply');h.view.state!.jobs={[h.room.id]:'active_reply'}
  const anchor=Array.from(h.root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Manage fictional profile & persona add-ons')!
  // Activating the real host drawer refreshes the view before opening the editor.
  h.view.receive({type:'mochi:choices',requestId:choices.requestId,characters:h.view.state!.characters,personas:[],connections:[]});expect(anchor.isConnected).toBe(false)
  h.view.editSidebarProfile(anchor,()=>{})
  expect(h.root.textContent).toContain('A reply is still generating. Leaving will stop this reply.')
  expect(h.view.isSidebarProfileOpen).toBe(false);expect(h.sent.some(p=>p.type==='mochi:cancel')).toBe(false)
  h.view.loadNavigationAccounts();const navigation=h.sent.findLast(p=>p.type==='mochi:accounts')
  h.view.receive({type:'mochi:accounts',requestId:navigation.requestId,state:await h.f.service.accountsState('alice')})
  expect(h.root.querySelector('dialog[open]')?.textContent).toContain('A reply is still generating')
  h.click('Stay here');expect(h.view.isSidebarProfileOpen).toBe(false);expect(view.ownGenerations.get(h.room.id)).toBe('active_reply')
  expect(document.activeElement?.textContent).toBe('Manage fictional profile & persona add-ons')
  const refreshed=Array.from(h.root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Manage fictional profile & persona add-ons')!
  h.view.editSidebarProfile(refreshed,()=>{});h.click('Cancel generation & leave');expect(h.view.isSidebarProfileOpen).toBe(true)
 }finally{h.close()}
})
