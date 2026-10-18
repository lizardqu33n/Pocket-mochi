import {expect,test} from 'bun:test'
import {JSDOM,VirtualConsole} from 'jsdom'
import {MochiView} from '../src/mochi/view.js'
import {defaultMochiSettings,type MochiRoom} from '../src/mochi/types.js'
import {MOCHI_DESKTOP_STYLES} from '../src/mochi/desktop-styles.js'
import image from '../src/mochi/assets/mochi-wordmark.data-url.txt' with {type:'text'}

function fixture(width:number,group=false){
 const errors:unknown[]=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e))
 const dom=new JSDOM('<!doctype html><body></body>',{pretendToBeVisual:true,virtualConsole:console}),prior={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window});Object.defineProperty(dom.window,'innerWidth',{value:width})
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const sent:any[]=[],room:MochiRoom={version:1,id:'room_'+'a'.repeat(32),revision:1,title:'Very long conversation '.repeat(8),characterIds:group?['one','two']:['one'],persona:{source:'manual',sourceId:'',name:'You',description:'',avatarUrl:''},messages:[{id:'msg_seed',role:'user',content:'Synthetic',name:'You',avatarUrl:'',createdAt:'2026-10-14T00:00:00Z',requestId:'seed'}],settings:{...defaultMochiSettings(),characterNames:{one:'Room nickname '.repeat(12)}},createdAt:'2026-10-14T00:00:00Z',updatedAt:'2026-10-14T00:00:00Z'}
 let view:MochiView;const redraw=()=>document.body.replaceChildren(view.renderDesktop())
 view=new MochiView(p=>sent.push(p),redraw,()=>redraw());view.state={rooms:[room],characters:[{id:'one',name:'Original source',avatarUrl:'/synthetic.png'},{id:'two',name:'Second member',avatarUrl:''}],personas:[],warnings:[],notifications:[]};view.select(room.id);redraw()
 const click=(label:string)=>{const node=document.querySelector<HTMLElement>(`[aria-label="${label}"]`);if(!node)throw Error('Missing '+label);node.click()}
 return {view,room,sent,dom,redraw,click,cleanup:()=>{view.destroy(false);dom.window.close();Object.assign(globalThis,prior);expect(errors).toEqual([])}}
}
for(const width of [320,390,900])test(`${width}px DOM: desktop and compatibility headers share the supplied wordmark and preserve the mascot`,()=>{
 const f=fixture(width)
 try{
  const desktop=document.querySelector<HTMLImageElement>('.mochi-shell-brand .mochi-wordmark-image')!
  expect(desktop.src).toBe(image);expect(desktop.alt).toBe('Mochi')
  expect(document.querySelector('.mochi-shell-mascot svg')).not.toBeNull()
  const compatibility=f.view.render(),mark=compatibility.querySelector<HTMLImageElement>('.mochi-wordmark-image')!
  expect(mark.src).toBe(image);expect(mark.alt).toBe('Mochi')
  expect(compatibility.querySelector('.mochi-wordmark svg')).toBeNull()
  expect(f.sent).toHaveLength(0)
 }finally{f.cleanup()}
})
for(const width of [320,390,900,1200])test(`${width}px DOM: details toggle preserves live thread, composer, tasks and focus`,()=>{
 const f=fixture(width)
 try{
  const thread=document.querySelector('.mochi-thread')!,composer=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!
  composer.value='Unsent draft';composer.dispatchEvent(new f.dom.window.Event('input'));thread.scrollTop=57
  const internals=f.view as any;internals.ownGenerations.set(f.room.id,'inflight_reply');const sentinel={text:'Retained summary suggestion'};internals.memoryPanel.suggestion=sentinel
  const before=structuredClone(f.room),count=f.sent.length
  f.click('Character profile')
  expect(document.querySelector('.mochi-desktop')!.getAttribute('data-details')).toBe('true')
  expect(document.querySelector('[aria-label="Character profile"]')!.getAttribute('aria-expanded')).toBe('true')
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Close character profile')
  expect(document.querySelector('.mochi-profile-person h4')!.textContent).toBe(f.room.settings!.characterNames.one)
  expect(document.querySelector('.mochi-profile-status')!.textContent).toBe('Availability: online')
  expect(document.querySelector('.mochi-profile-panel')!.textContent).not.toContain('routines')
  document.querySelector('.mochi-profile-panel')!.dispatchEvent(new f.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}))
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Character profile');expect(document.querySelector('.mochi-thread')).toBe(thread);expect(thread.scrollTop).toBe(57)
  expect(document.querySelector('[aria-label="Message"]')).toBe(composer);expect(composer.value).toBe('Unsent draft');expect(f.sent).toHaveLength(count)
  expect(internals.ownGenerations.get(f.room.id)).toBe('inflight_reply');expect(internals.memoryPanel.suggestion).toBe(sentinel);expect(f.room).toEqual(before)
 }finally{f.cleanup()}
})
test('group details, source fallback and search filter do not invent profile fields or switch rooms',()=>{
 const f=fixture(900,true)
 try{
  f.click('Character profile');expect(document.querySelectorAll('.mochi-profile-person')).toHaveLength(2);expect(document.querySelector('.mochi-profile-heading h3')!.textContent).toBe('Group profile')
  const room=f.view.roomId,filter=document.querySelector<HTMLInputElement>('[aria-label="Find a conversation"]')!
  filter.value='no matches';filter.dispatchEvent(new f.dom.window.Event('input'));expect(document.querySelector<HTMLButtonElement>('.mochi-desktop-room')!.hidden).toBe(true)
  expect(f.view.roomId).toBe(room);expect(f.sent).toHaveLength(0)
  filter.value='Second member';filter.dispatchEvent(new f.dom.window.Event('input'));expect(document.querySelector<HTMLButtonElement>('.mochi-desktop-room')!.hidden).toBe(false)
  f.view.state!.characters=[];f.redraw();expect(document.querySelector('.mochi-profile-panel')!.textContent).toContain('Character source unavailable')
  expect(document.querySelector('.mochi-profile-panel')!.textContent).not.toContain('Member Since');expect(document.querySelector('.mochi-shell-brand img')!.getAttribute('alt')).toBe('Mochi')
  expect(MOCHI_DESKTOP_STYLES).toContain('@container (min-width:1000px)');expect(MOCHI_DESKTOP_STYLES).toContain('@container (max-width:639px)')
 }finally{f.cleanup()}
})
test('header search and details settings invoke original tools, with dirty settings still staged',()=>{
 const f=fixture(1200)
 try{
  f.click('Search conversation');expect(document.querySelector('[aria-label="Search conversation text"]')).not.toBeNull()
  f.click('Character profile');f.click('Close character profile');f.click('Character profile')
  Array.from(document.querySelectorAll<HTMLButtonElement>('.mochi-profile-panel button')).find(n=>n.getAttribute('aria-label')==='Open conversation settings')!.click()
  const input=document.querySelector<HTMLInputElement>('[aria-label="Chat name"]')!;expect(input).not.toBeNull()
  input.value='Uncommitted title';input.dispatchEvent(new f.dom.window.Event('input'));expect(f.view.hasUnsavedChanges()).toBe(true);expect(f.room.title).not.toBe('Uncommitted title')
  expect(f.sent.every(p=>p.type!=='mochi:update')).toBe(true)
 }finally{f.cleanup()}
})

test('refined sidebar keeps compact labeled account controls and original create/notification routes',()=>{
 const f=fixture(1080)
 try{
  const account=document.querySelector('.mochi-shell-account-row')!,tools=document.querySelector('.mochi-conversation-filters')!
  expect(account.querySelectorAll('button')).toHaveLength(1);expect(account.querySelector('[aria-label="Switch fictional profile"]')).not.toBeNull()
  for(const control of account.querySelectorAll('button')){expect(control.title).toBeTruthy();expect(control.getAttribute('aria-label')).toBeTruthy();expect(control.classList.contains('mochi-icon-button')).toBe(true)}
  expect(tools.textContent).toContain('+ New Chat')
  expect(document.querySelector('.mochi-desktop-list [aria-label="Mochi notifications"]')).toBeNull()
  expect(document.querySelector('.mochi-room-header [aria-label="Mochi notifications"]')).not.toBeNull()
  expect(document.querySelector('[aria-label="Search conversation"] svg circle')).not.toBeNull()
  f.click('Mochi notifications');expect(document.querySelector('.mochi-notification-list')).not.toBeNull()
 }finally{f.cleanup()}
})

test('All and Groups combine with account-scoped text discovery without touching read state',()=>{
 const f=fixture(1080,true)
 try{
  const other={...structuredClone(f.room),id:'room_'+'b'.repeat(32),title:'Second DM',characterIds:['one']}
  f.view.state!.rooms.push(other);f.view.state!.notifications=[{id:'notice',roomId:other.id,messageId:'msg',title:'Synthetic',roomTitle:other.title,body:'',avatarUrl:'',createdAt:other.createdAt,read:false}];f.redraw()
  const before=JSON.stringify(f.view.state),visible=()=>Array.from(document.querySelectorAll<HTMLButtonElement>('.mochi-desktop-room')).filter(row=>!row.hidden)
  const choose=(name:string)=>Array.from(document.querySelectorAll<HTMLButtonElement>('.mochi-conversation-filters button')).find(node=>node.textContent===name)!.click()
  expect(visible()).toHaveLength(2);expect(document.querySelector('.mochi-conversation-filters')!.textContent).not.toContain('Unread');expect(document.querySelector('[aria-label="New Chat"]')).not.toBeNull()
  choose('Groups');expect(visible()).toHaveLength(1);expect(visible()[0].getAttribute('aria-current')).toBe('true')
  const input=document.querySelector<HTMLInputElement>('[aria-label="Find a conversation"]')!;input.value='Second DM';input.dispatchEvent(new f.dom.window.Event('input'));expect(visible()).toHaveLength(0)
  choose('All');expect(visible()).toHaveLength(1);expect(JSON.stringify(f.view.state)).toBe(before);expect(f.sent).toHaveLength(0)
  expect(document.querySelector('.mochi-activity-snapshot')).toBeNull();expect(document.querySelector('.mochi-profile-about')!.textContent).toContain('No profile information shared.')
 }finally{f.cleanup()}
})

test('standalone menu has scoped surface/contrast/layering rules and Escape restores its opener',()=>{
 const f=fixture(390)
 try{
  expect(MOCHI_DESKTOP_STYLES).toContain('background:var(--mochi-surface,#17151d)');expect(MOCHI_DESKTOP_STYLES).toContain('z-index:50');expect(MOCHI_DESKTOP_STYLES).toContain(':is(:hover,:focus-visible)')
  const menu=document.querySelector<HTMLDetailsElement>('.lp-conversation-menu')!,opener=menu.querySelector<HTMLElement>('summary')!
  expect(Array.from(menu.querySelectorAll('button')).map(button=>button.textContent)).toEqual(expect.arrayContaining(['Settings','Pins & Notes','Conversation Memory','Presets','Search conversation','Preview AI prompt']))
  menu.open=true;menu.dispatchEvent(new f.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));expect(menu.open).toBe(false);expect(document.activeElement).toBe(opener)
  expect(f.sent).toHaveLength(0)
 }finally{f.cleanup()}
})

test('compact search keeps clear/close accessible, submitting only the existing full-room query',()=>{
 const f=fixture(1080)
 try{
  f.click('Search conversation')
  const form=document.querySelector<HTMLFormElement>('.mochi-search-controls')!,input=form.querySelector<HTMLInputElement>('input')!
  expect(input.placeholder).toBe('Search this conversation');expect(form.querySelector('[aria-label="Clear search"]')!.textContent).toBe('Clear');expect(form.querySelector('[aria-label="Close search"]')!.getAttribute('title')).toBe('Close search')
  input.value='Synthetic';input.dispatchEvent(new f.dom.window.Event('input'));form.dispatchEvent(new f.dom.window.Event('submit',{cancelable:true}))
  expect(f.sent.at(-1)).toMatchObject({type:'mochi:search',roomId:f.room.id,query:'Synthetic',sender:'',offset:0})
  f.click('Clear search');expect(document.querySelector<HTMLInputElement>('[aria-label="Search conversation text"]')!.value).toBe('')
  f.click('Close search');expect(document.querySelector('.mochi-search-panel')).toBeNull();expect(f.sent.filter(p=>p.type==='mochi:search')).toHaveLength(1)
 }finally{f.cleanup()}
})

for(const [label,selector] of [
 ['Search conversation','.mochi-search-panel'],['Participants','dialog[open]'],
 ['Chat Settings','[aria-label="Chat name"]'],['Presets','[aria-label="Mochi presets"]'],
 ['Conversation Memory','.mochi-memory-panel'],['Preview AI prompt','.mochi-preview-panel'],
 ['Pins & Notes','dialog[open]'],['Mochi notifications','[aria-label="Back to rooms"]'],
] as const)test(`distinct toolbar shortcut opens ${label}`,()=>{
 const f=fixture(390)
 try{
  const personal=(f.view as any).personalSettings
  personal.saved={preferences:{...personal.value,hidden:[]}}
  f.redraw()
  const toolbar=document.querySelector('.mochi-toolbar-shortcuts')!
  const shortcuts=Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button'))
  expect(new Set(shortcuts.map(n=>n.querySelector('svg')!.innerHTML)).size).toBe(shortcuts.length)
  shortcuts.find(n=>n.getAttribute('aria-label')===label)!.click()
  expect(document.querySelector(selector)).not.toBeNull()
  expect(f.room.messages).toHaveLength(1)
  expect(f.sent.some(p=>p.type==='mochi:generate')).toBe(false)
 }finally{f.cleanup()}
})

test('character-first header and You attribution are projections, never stored identity edits',()=>{
 const f=fixture(390)
 try{
  (f.room.messages[0] as any).name='Edith';f.redraw();const before=JSON.stringify(f.room)
  expect(document.querySelector('.mochi-conversation-title')!.textContent).toBe(f.room.settings!.characterNames.one)
  expect(document.querySelector('.mochi-room-info .mochi-chat-avatar')).not.toBeNull()
  expect(document.querySelector('.mochi-chat-name')!.textContent).toBe('Chat name: '+f.room.title)
  expect(document.querySelector('.mochi-message-name')!.textContent).toBe('You')
  expect(document.querySelector('.mochi-message')!.getAttribute('aria-label')).toBe('Message from You')
  expect(document.querySelector('.mochi-desktop-room-copy small')!.textContent).toContain('You: Synthetic')
  expect(JSON.stringify(f.room)).toBe(before)
 }finally{f.cleanup()}
})
test('group artwork is shared by list, header and profile; automatic portraits restore cleanly',()=>{
 const f=fixture(390,true)
 try{
  f.room.groupIcon='⭐';f.redraw();f.click('Character profile')
  for(const selector of ['.mochi-desktop-room .mochi-chat-avatar','.mochi-room-info .mochi-chat-avatar','.mochi-profile-group .mochi-chat-avatar'])expect(document.querySelector(selector)!.textContent).toBe('⭐')
  delete f.room.groupIcon;f.redraw()
  for(const selector of ['.mochi-desktop-room .mochi-group-portraits','.mochi-room-info .mochi-group-portraits','.mochi-profile-group .mochi-group-portraits'])expect(document.querySelector(selector)!.children).toHaveLength(2)
  expect(f.sent).toHaveLength(0)
 }finally{f.cleanup()}
})
