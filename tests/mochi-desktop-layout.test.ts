import {expect,test} from 'bun:test'
import {JSDOM} from 'jsdom'
import {getMochiSession} from '../src/mochi/session.js'
import {createMochiWorkspace} from '../src/mochi/workspace.js'
import {MOCHI_DESKTOP_STYLES} from '../src/mochi/desktop-styles.js'

function fixture(account = false, empty = false) {
  const dom=new JSDOM('<body><main id="desktop"></main><main id="portal"></main></body>',{pretendToBeVisual:true})
  const prior={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:dom.window.document,window:dom.window})
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')}
  dom.window.HTMLDialogElement.prototype.close=function(){this.dispatchEvent(new dom.window.Event('close'));this.removeAttribute('open')}
  Object.defineProperties(dom.window.HTMLElement.prototype,{scrollHeight:{get(){return this.classList.contains('mochi-thread')?1000:0}},clientHeight:{get(){return this.classList.contains('mochi-thread')?200:0}}})
  const listeners=new Set<(p:unknown)=>void>(),sent:any[]=[],transport={sendToBackend:(p:any)=>sent.push(p),onBackendMessage:(fn:(p:unknown)=>void)=>{listeners.add(fn);return()=>listeners.delete(fn)}}
  const session=getMochiSession(transport),policy=()=>({enabled:true,previews:false})
  const desktop=createMochiWorkspace({root:document.getElementById('desktop')!,session,notificationPolicy:policy,presentation:'messenger'})
  const portal=createMochiWorkspace({root:document.getElementById('portal')!,session,notificationPolicy:policy})
  const accountId=account?'account_'+'c'.repeat(32):undefined
  const messages=Array.from({length:1000},(_,i)=>({id:`message_${i}`,role:'assistant',name:'A very long character name repeated for coverage',characterId:'char',content:`Synthetic message ${i}`,createdAt:new Date(1700000000000+i*60000).toISOString()}))
  const room:any={id:'room_'+'a'.repeat(32),ownerId:'alice',accountId,title:'A very long conversation name for an independent group conversation',revision:1,characterIds:['char','second'],persona:{source:'manual',sourceId:'',name:'Me',description:''},messages,settings:{autoReply:true,responseMode:'instant',connectionId:'owned',instructions:'',contextTokens:8192,outputTokens:1200,characterNames:{}}}
  const second={...structuredClone(room),id:'room_'+'b'.repeat(32),title:'Second conversation',messages:[]}
  const state:any={accountId,rooms:empty?[]:[room,second],characters:[{id:'char',name:'Long character',avatarUrl:'/synthetic.png'},{id:'second',name:'Second'}],connections:[{id:'owned',name:'Provider',model:'default'}],personas:[],warnings:[],notifications:empty?[]:[{id:'notice',roomId:second.id,accountId,read:false,title:'Synthetic',roomTitle:second.title,body:'Synthetic only',createdAt:'2026-10-01T00:00:00Z'}]}
  const emit=(p:any)=>{for(const fn of listeners)fn(p)}
  const complete=()=>emit({type:'mochi:state',requestId:sent.at(-1).requestId,state:structuredClone(state)})
  desktop.open()
  const accountState={version:1,ownerId:'alice',revision:1,accounts:account?[{id:accountId,displayName:'Synthetic account',username:'synthetic',roomIds:state.rooms.map((r:any)=>r.id)}]:[],personas:[],avatars:[],warnings:[],canUploadAvatar:false,phone:{supported:false,preference:'picker',lastAccountId:accountId}}
  emit({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:accountState})
  if(account){document.querySelector<HTMLButtonElement>('[aria-label="Use Mochi account Synthetic account"]')!.click();emit({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:accountState})}
  else Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Unassigned legacy chats')!.click()
  complete();desktop.refresh();complete()
  const choose=(id:string)=>{const r=state.rooms.find((r:any)=>r.id===id);document.querySelector<HTMLButtonElement>(`[aria-label="Open conversation: ${r.title}"]`)!.click();complete()}
  return {dom,session,desktop,portal,sent,listeners,room,second,state,complete,choose,cleanup:()=>{try{session.destroy(false)}finally{dom.window.close();Object.assign(globalThis,prior)}}}
}

test('desktop: empty-account Back restores focus to the renamed New Chat action',()=>{
  const h=fixture(true,true)
  try{
    const back=document.querySelector<HTMLButtonElement>('[aria-label="Back to conversations"]')!
    back.focus();back.click()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('New Chat')
    expect(h.listeners.size).toBe(1)
  }finally{h.cleanup()}
})

test('desktop: list, active room, real unread badges and bounded history use one session',()=>{
  const h=fixture()
  try{
    expect(document.querySelector('.mochi-desktop')!.getAttribute('data-mode')).toBe('list')
    expect(document.querySelectorAll('.mochi-desktop-room')).toHaveLength(2)
    expect(document.querySelector('.mochi-desktop-unread')!.textContent).toBe('1')
    expect(document.querySelector('.mochi-thread')).toBeNull()
    document.querySelector<HTMLButtonElement>('.mochi-desktop-room')!.focus()
    h.choose(h.room.id)
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Message')
    expect(document.querySelector('.mochi-desktop')!.getAttribute('data-mode')).toBe('chat')
    expect(document.querySelector('[aria-current=true]')!.getAttribute('aria-label')).toContain(h.room.title)
    expect(document.querySelectorAll('.mochi-message')).toHaveLength(100)
    expect(document.querySelector('.mochi-thread')!.getAttribute('tabindex')).toBe('0')
    expect(document.querySelector('.mochi-composer')).not.toBeNull()
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Show earlier messages')!.click()
    expect(document.querySelectorAll('.mochi-message')).toHaveLength(200)
    expect(h.session.view.state!.rooms[0].messages).toHaveLength(1000)
    expect(h.listeners.size).toBe(1)
    expect(MOCHI_DESKTOP_STYLES).toContain('@container (max-width:639px)')
    expect(MOCHI_DESKTOP_STYLES).toContain('overflow:auto;overscroll-behavior:contain')
  }finally{h.cleanup()}
})

test('desktop: fictional account selection and drafts survive room switch and portal handoff',()=>{
  const h=fixture(true)
  try{
    h.choose(h.room.id)
    const composer=document.querySelector<HTMLTextAreaElement>('#desktop [aria-label="Message"]')!;composer.value='Retained draft';composer.dispatchEvent(new h.dom.window.Event('input'))
    h.choose(h.second.id);expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('')
    h.choose(h.room.id);expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('Retained draft')
    h.portal.open();expect(h.desktop.isOpen).toBe(false);expect(document.querySelector('#portal .mochi-desktop')).toBeNull()
    h.desktop.open();expect(h.portal.isOpen).toBe(false)
    expect(h.session.view.state?.accountId).toBe(h.state.accountId)
    expect(document.querySelector<HTMLSelectElement>('[aria-label="Switch fictional profile"]')!.selectedOptions[0].textContent).toBe('Synthetic account · @synthetic')
    expect(document.querySelector<HTMLTextAreaElement>('#desktop [aria-label="Message"]')!.value).toBe('Retained draft')
    expect(h.listeners.size).toBe(1)
  }finally{h.cleanup()}
})

test('desktop: room switching and list navigation protect unsaved settings; empty accounts stay actionable',()=>{
  const h=fixture()
  try{
    h.choose(h.room.id)
    document.querySelector<HTMLButtonElement>('[aria-label="Settings"]')!.click();Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Advanced')!.click()
    const instructions=document.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!;instructions.value='Do not discard';instructions.dispatchEvent(new h.dom.window.Event('input'))
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Return to conversation')!.click()
    expect(h.session.view.roomId).toBe(h.room.id);expect(h.session.view.hasUnsavedChanges()).toBe(true)
    document.querySelector<HTMLButtonElement>('[aria-label="Keep editing"]')!.click()
    expect(instructions.value).toBe('Do not discard')
    h.desktop.close();h.desktop.open();expect(document.querySelector('[aria-label="Room instructions"]')).toBe(instructions)
  }finally{h.cleanup()}
  const empty=fixture(true,true)
  try{
    expect(document.querySelector('.mochi-desktop-rooms')!.textContent).toContain('No conversations yet')
    expect(document.querySelector('[aria-label="New Chat"]')).not.toBeNull()
    expect(document.querySelector('[aria-label="Mochi notifications"]')).not.toBeNull()
    expect(document.querySelector('.mochi-composer')).toBeNull()
  }finally{empty.cleanup()}
})

test('desktop: refresh preserves composer focus, scroll position and selected room without rebuilding backend ownership',()=>{
  const h=fixture()
  try{
    h.choose(h.room.id)
    const input=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;input.value='Focus draft';input.dispatchEvent(new h.dom.window.Event('input'));input.focus();input.setSelectionRange(2,5)
    const thread=document.querySelector<HTMLElement>('.mochi-thread')!
    Object.defineProperties(thread,{scrollHeight:{value:1000},clientHeight:{value:200}});thread.scrollTop=80
    h.desktop.refresh();h.complete()
    const next=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!
    expect(document.activeElement).toBe(next);expect(next.value).toBe('Focus draft');expect([next.selectionStart,next.selectionEnd]).toEqual([2,5])
    expect(document.querySelector<HTMLElement>('.mochi-thread')!.scrollTop).toBe(80)
    expect(h.session.view.roomId).toBe(h.room.id);expect(h.listeners.size).toBe(1)
  }finally{h.cleanup()}
})

test('desktop: unknown message records remain stored and cannot crash preview, anchor or actions',()=>{
  const h=fixture()
  try{
    const valid=structuredClone(h.room.messages[0])
    h.room.messages=[null,42,'unexpected',[],{}, {...valid,content:17}, {...valid,name:{}}, {...valid,id:9}, {...valid,role:'system'}, {...valid,createdAt:'invalid'}, {...valid,avatarUrl:[]}, {...valid,characterId:12}, {...valid,editedAt:{}}, valid, undefined]
    const before=structuredClone(h.room.messages)
    h.desktop.refresh();h.complete()
    expect(document.querySelector('.mochi-desktop-room-copy small')!.textContent).toBe('Message unavailable')
    h.choose(h.room.id)
    expect(document.querySelectorAll('.mochi-message')).toHaveLength(1)
    expect(document.querySelectorAll('.mochi-message-unavailable')).toHaveLength(14)
    expect(document.querySelector('.mochi-thread')!.getAttribute('data-first-message-id')).toBe('')
    expect(document.querySelectorAll('.mochi-message-actions')).toHaveLength(1)
    expect(h.session.view.state!.rooms[0].messages).toEqual(before)
    h.room.messages=[valid];h.desktop.refresh();h.complete()
    expect(document.querySelector('.mochi-desktop-room-copy small')!.textContent).toBe(`${valid.name}: ${valid.content}`)
    expect(document.querySelector('.mochi-thread')!.getAttribute('data-first-message-id')).toBe(valid.id)
  }finally{h.cleanup()}
})
