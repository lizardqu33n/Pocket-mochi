import {expect,test} from 'bun:test'
import {JSDOM,VirtualConsole} from 'jsdom'
import {MochiView} from '../src/mochi/view.js'
import {MochiMemoryPanel} from '../src/mochi/memory-panel.js'
import {defaultMochiSettings,type MochiRoom} from '../src/mochi/types.js'

function fixture(width:number){
 const errors:unknown[]=[],console=new VirtualConsole();console.on('jsdomError',error=>errors.push(error))
 const dom=new JSDOM('<!doctype html><body></body>',{pretendToBeVisual:true,virtualConsole:console}),prior={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window});Object.defineProperty(dom.window,'innerWidth',{value:width})
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const sent:any[]=[],room:MochiRoom={version:1,id:'room_'+'a'.repeat(32),accountId:'account_'+'b'.repeat(32),revision:1,title:'Synthetic chat',characterIds:['char'],persona:{source:'manual',sourceId:'',name:'Synthetic',description:'',avatarUrl:''},messages:[{id:'msg_synthetic',role:'user',name:'You',content:'Synthetic message',createdAt:'2026-10-13T00:00:00Z',requestId:'seed'}],settings:{...defaultMochiSettings(),responseMode:'instant',connectionId:'connection'},createdAt:'2026-10-13T00:00:00Z',updatedAt:'2026-10-13T00:00:00Z',background:{enabled:true} as any}
 let view:MochiView
 const redraw=()=>document.body.replaceChildren(view.renderDesktop())
 view=new MochiView(p=>sent.push(p),redraw,()=>redraw())
 view.state={accountId:room.accountId,backgroundEnabled:true,rooms:[room],characters:[{id:'char',name:'Synthetic character',avatarUrl:''}],personas:[],connections:[{id:'connection',name:'Synthetic provider',model:'synthetic'}],warnings:[],notifications:[]};view.select(room.id);redraw()
 const click=(name:string)=>{const b=Array.from(document.querySelectorAll<HTMLElement>('button,[role=button]')).find(n=>n.getAttribute('aria-label')===name||n.textContent===name);if(!b)throw Error('Missing control '+name);b.click()}
 return{dom,view,sent,room,redraw,click,cleanup:()=>{view.destroy(false);dom.window.close();Object.assign(globalThis,prior);expect(errors).toEqual([])}}
}

for(const width of [320,390,900])test(`${width}px DOM: staged AI settings retain drafts, scope text is accurate and Save is explicit`,()=>{
 const f=fixture(width)
 try{
  f.click('Settings')
  expect(document.body.textContent).toContain('This conversation · Requires Save')
  expect(document.body.textContent).toContain('AI timing/status suggestions require Save')
  expect(document.body.textContent).toContain('Ordinary replies do not require idle/background autonomy')
  const instructions=document.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!
  instructions.value='Synthetic unsaved instructions';instructions.dispatchEvent(new f.dom.window.Event('input'))
  const ai=document.querySelector<HTMLInputElement>('[aria-label="Allow AI delivery timing and status suggestions"]')!,count=f.sent.length
  ai.checked=true;ai.dispatchEvent(new f.dom.window.Event('change'))
  expect(f.sent.length).toBe(count);expect(f.room.settings!.aiBehavior).toBeUndefined();expect(instructions.value).toBe('Synthetic unsaved instructions')
  const form=ai.closest('form')!;form.dispatchEvent(new f.dom.window.Event('submit',{bubbles:true,cancelable:true}))
  expect(f.sent.at(-1)).toMatchObject({type:'mochi:update',accountId:f.room.accountId,roomId:f.room.id,settings:{aiBehavior:true,instructions:'Synthetic unsaved instructions'}})
 }finally{f.cleanup()}
})

test('immediate login permission has explicit scope and does not submit staged room edits',()=>{
 const f=fixture(390)
 try{
  f.click('Settings');const instructions=document.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!
  instructions.value='Retained unsaved text';instructions.dispatchEvent(new f.dom.window.Event('input'))
  const permission=document.querySelector<HTMLInputElement>('[aria-label="This Lumiverse login: allow background messaging (applies now)"]')!
  permission.checked=false;permission.dispatchEvent(new f.dom.window.Event('change'))
  expect(f.sent.at(-1)).toMatchObject({type:'mochi:background_account',enabled:false});expect(f.sent.at(-1).settings).toBeUndefined()
  expect(f.view.hasUnsavedChanges()).toBe(true);expect(instructions.value).toBe('Retained unsaved text');expect(f.room.settings!.instructions).toBe('')
 }finally{f.cleanup()}
})

test('room navigation explains reply cancellation; Stay retains selection/draft and confirmed leave cancels once',()=>{
 const f=fixture(320)
 try{
  const input=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;input.value='Unsent synthetic draft';input.dispatchEvent(new f.dom.window.Event('input'))
  ;(f.view as any).ownGenerations.set(f.room.id,'synthetic_reply')
  f.click('Back to conversations');expect(document.body.textContent).toContain('A reply is still generating')
  expect(f.sent.filter(p=>p.type==='mochi:cancel')).toHaveLength(0);f.click('Stay here')
  expect(f.view.roomId).toBe(f.room.id);expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('Unsent synthetic draft')
  f.click('Back to conversations');f.click('Cancel generation & leave')
  expect(f.view.roomId).toBe('');expect(f.sent.filter(p=>p.type==='mochi:cancel')).toHaveLength(1);expect(f.sent.some(p=>p.type==='mochi:schedule_cancel')).toBe(false)
 }finally{f.cleanup()}
})

test('summary Close explains cancellation and preserves saved memory until explicit confirmation',()=>{
 const f=fixture(390)
 let panel:MochiMemoryPanel
 try{
  const redraw=()=>document.body.replaceChildren(panel.render(f.room))
  panel=new MochiMemoryPanel(p=>f.sent.push(p),()=>f.room,redraw,()=>{},()=>{})
  panel.show(f.room);panel.receive({type:'mochi:memory',requestId:f.sent.at(-1).requestId,roomId:f.room.id,accountId:f.room.accountId,associationRevision:0,revision:f.room.revision,valid:false})
  f.click('Generate summary');expect(panel.generating).toBe(true)
  f.click('Close memory');expect(document.body.textContent).toContain('Closing will cancel it');f.click('Stay here');expect(panel.generating).toBe(true)
  f.click('Close memory');f.click('Cancel summary & close')
  expect(panel.generating).toBe(false);expect(f.sent.filter(p=>p.type==='mochi:cancel')).toHaveLength(1);expect(f.room.memory).toBeUndefined();expect(f.room.messages).toHaveLength(1)
 }finally{panel!?.reset(true);f.cleanup()}
})

test('capacity UI permits explicit Clear, blocks Restore and renders managed memory without changing saved versions',()=>{
 const f=fixture(320)
 let panel:MochiMemoryPanel
 try{
  const versions=Array.from({length:100},(_,i)=>({id:'summary_'+i.toString(16).padStart(32,'0'),text:'Synthetic retained memory',enabled:true,excludeCovered:true,coverage:{boundaryId:'msg_synthetic',count:1,digest:'a'.repeat(64)},savedAt:f.room.createdAt}))
  const memory={version:1 as const,ownerId:'alice',roomId:f.room.id,currentId:versions.at(-1)!.id,versions}
  panel=new MochiMemoryPanel(p=>f.sent.push(p),()=>f.room,()=>document.body.replaceChildren(panel.render(f.room)),p=>{f.room.memory=p.memory;f.room.revision=p.revision},()=>{})
  panel.show(f.room);panel.receive({type:'mochi:memory',requestId:f.sent.at(-1).requestId,roomId:f.room.id,accountId:f.room.accountId,associationRevision:0,revision:1,memory,valid:true})
  expect(document.body.textContent).toContain('Disable and Clear keep all saved versions')
  expect(Array.from(document.querySelectorAll<HTMLButtonElement>('button')).filter(b=>b.textContent?.startsWith('Restore version ')).every(b=>b.disabled)).toBe(true)
  f.click('Clear current summary');f.click('Confirm clear current summary');const request=f.sent.at(-1)
  expect(request).toMatchObject({type:'mochi:memory',action:'clear',confirmed:true,accountId:f.room.accountId,revision:1})
  panel.receive({type:'mochi:memory',requestId:request.requestId,roomId:f.room.id,accountId:f.room.accountId,associationRevision:0,revision:2,memory:{...memory,version:2,management:{version:1,action:'clear',cleared:true,requestId:request.requestId,baseRevision:1,changedAt:f.room.updatedAt}},valid:false})
  expect(document.body.textContent).toContain('All saved versions are retained');expect(f.room.memory!.versions).toEqual(versions);expect(f.room.messages).toHaveLength(1)
 }finally{panel!?.reset(true);f.cleanup()}
})
