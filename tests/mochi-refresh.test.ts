import {test,expect} from 'bun:test'
import {JSDOM,VirtualConsole} from 'jsdom'
import {MochiView} from '../src/mochi/view.js'
import {defaultMochiSettings,type MochiRoom} from '../src/mochi/types.js'
import {defaultUIPreferences} from '../src/mochi/ui-preferences.js'
function fixture(){
 const errors:any[]=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message))
 const dom=new JSDOM('<body></body>',{url:'https://synthetic.invalid',pretendToBeVisual:true,virtualConsole:vc}),prior={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window})
 const sent:any[]=[],room:MochiRoom={version:1,id:'room_'+'a'.repeat(32),revision:1,title:'Weekend',characterIds:['one','two'],persona:{source:'manual',sourceId:'',name:'Edith',description:'',avatarUrl:''},settings:defaultMochiSettings(),messages:[],createdAt:'2026-10-17T12:00:00Z',updatedAt:'2026-10-17T12:00:00Z'}
 const message=(id:string,seconds:number,extra:any={})=>({id,role:'assistant',characterId:'one',name:'Rowan',avatarUrl:'',content:'Synthetic '+id,createdAt:new Date(Date.parse(room.createdAt)+seconds*1000).toISOString(),requestId:id,...extra})
 room.messages=[message('first',0),message('second',30)]
 let view:MochiView;const redraw=()=>document.body.replaceChildren(view.renderDesktop());view=new MochiView(p=>sent.push(p),redraw,()=>redraw());view.state={rooms:[room],characters:[{id:'one',name:'Rowan',avatarUrl:'',about:'Private AI instruction text'},{id:'two',name:'Mira',avatarUrl:''}],personas:[],warnings:[]};view.select(room.id);redraw()
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const click=(label:string)=>document.querySelector<HTMLElement>(`button[aria-label="${label}"],summary[aria-label="${label}"]`)!.click()
 return {view,room,message,dom,sent,redraw,click,close:()=>{view.destroy(false);dom.window.close();Object.assign(globalThis,prior);expect(errors).toEqual([])}}
}
test('permanent header controls and fixed cog are separate from saved custom toolbar preferences',()=>{
 const f=fixture();try{
  const prefs={...defaultUIPreferences(),hidden:['search','participants','notifications','notes'],order:['preview','memory','notes','presets','settings','search','participants','notifications'],presentation:'labels'}
  ;(f.view as any).personalSettings.saved={version:1,revision:4,preferences:prefs};const before=JSON.stringify(prefs);f.redraw()
  expect([...document.querySelectorAll('.mochi-header-controls button')].map(n=>n.getAttribute('aria-label'))).toEqual(['Search conversation','Mochi notifications','Participants'])
  expect([...document.querySelectorAll('.mochi-toolbar-shortcuts>button')].map(n=>n.getAttribute('aria-label'))).toEqual(['Preview AI prompt','Conversation Memory','Presets'])
  expect(document.querySelector('.mochi-room-header .mochi-custom-toolbar')===null).toBe(true)
  expect(document.querySelector('.mochi-composer-dock')!.children[0].classList.contains('mochi-bottom-toolbar')).toBe(true)
  expect(document.querySelector('.mochi-bottom-toolbar')!.lastElementChild!.getAttribute('aria-label')).toBe('Chat Settings')
  expect(JSON.stringify(prefs)).toBe(before)
 }finally{f.close()}
})
test('inline Next Responder retains per-chat selection and send/continue semantics',()=>{
 const f=fixture();try{
  expect(document.querySelector('.mochi-composer-row .mochi-responder-popup')!==null).toBe(true)
  expect((document.querySelector('[aria-label="Next responder"]') as HTMLSelectElement).value).toBe('auto')
  f.click('Respond as Mira');expect((document.querySelector('[aria-label="Next responder"]') as HTMLSelectElement).value).toBe('two')
  f.redraw();expect((document.querySelector('[aria-label="Next responder"]') as HTMLSelectElement).value).toBe('two')
  document.querySelector('form.mochi-composer')!.dispatchEvent(new f.dom.window.Event('submit',{cancelable:true,bubbles:true}))
  expect(f.sent.at(-1).responder).toBe('two');expect(f.sent.at(-1).content).toBe('')
  expect(f.room.settings!.responseMode).toBeUndefined()
 }finally{f.close()}
})
test('smart grouping breaks on sender, time gap, reactions and edit indicators without changing history',()=>{
 const f=fixture();try{
  f.room.messages.push(f.message('edit',40,{editedAt:f.room.createdAt}),f.message('reaction',50,{reactions:[{emoji:'❤️',actor:'user',actorId:'legacy',name:'Edith'}]}),f.message('after-reaction',60),f.message('gap',600),f.message('different',610,{characterId:'two',name:'Mira'}));const before=JSON.stringify(f.room);f.redraw()
  expect([...document.querySelectorAll('.mochi-message')].map(n=>n.getAttribute('data-grouped'))).toEqual(['false','true','false','false','false','false','false'])
  expect(document.querySelector('[data-message-id=edit] .mochi-edited-label')!.textContent).toContain('edited')
  expect(document.querySelector('[data-message-id=reaction] .mochi-reactions')!.textContent).toContain('❤️')
  expect(JSON.stringify(f.room)).toBe(before)
 }finally{f.close()}
})
test('message selection supports keyboard, outside dismissal, long press and scoped actions',async()=>{
 const f=fixture();try{
  const first=document.querySelector<HTMLElement>('.mochi-message')!,second=document.querySelectorAll<HTMLElement>('.mochi-message')[1],before=JSON.stringify(f.room)
  first.dispatchEvent(new f.dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));expect(first.dataset.selected).toBe('true')
  second.querySelector<HTMLElement>('.mochi-bubble')!.click();expect(first.dataset.selected).toBe('false');expect(second.dataset.selected).toBe('true')
  second.dispatchEvent(new f.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));expect(second.dataset.selected).toBe('false');expect(document.activeElement===second).toBe(true)
  const event=new f.dom.window.Event('pointerdown',{bubbles:true});Object.assign(event,{pointerType:'touch'});first.dispatchEvent(event);await new Promise(r=>setTimeout(r,470));expect(first.dataset.selected).toBe('true')
  document.body.dispatchEvent(new f.dom.window.Event('pointerdown',{bubbles:true}));expect(first.dataset.selected).toBe('false')
  first.querySelector<HTMLElement>('.mochi-bubble')!.click();first.querySelector<HTMLButtonElement>('.mochi-action-strip [aria-label=Reply]')!.click();expect(document.querySelector('.mochi-reply-preview')!==null).toBe(true)
  expect(JSON.stringify(f.room)).toBe(before);expect(f.sent).toHaveLength(0)
 }finally{f.close()}
})
test('profile preference is session-scoped by authenticated owner; mobile opening does not rewrite desktop choice',()=>{
 const f=fixture();try{
  const internal=f.view as any;internal.profiles.state={ownerId:'alice',accounts:[]};f.redraw()
  const width=(n:number)=>{document.querySelector<HTMLElement>('.mochi-desktop')!.getBoundingClientRect=()=>({width:n,height:900,x:0,y:0,left:0,right:n,top:0,bottom:900,toJSON(){}})}
  width(1440);f.click('Close character profile');expect(window.sessionStorage.getItem('mochi:profile-panel:alice')).toBe('closed')
  f.redraw();expect(document.querySelector<HTMLElement>('.mochi-desktop')!.dataset.desktopDetails).toBe('closed')
  width(390);f.click('Character profile');expect(document.querySelector<HTMLElement>('.mochi-desktop')!.dataset.details).toBe('true');expect(window.sessionStorage.getItem('mochi:profile-panel:alice')).toBe('closed')
  internal.profiles.state.ownerId='bob';f.redraw();expect(document.querySelector<HTMLElement>('.mochi-desktop')!.dataset.desktopDetails).toBe('auto');expect(document.querySelector<HTMLElement>('.mochi-desktop')!.dataset.details).toBe('false')
  internal.profiles.state.ownerId='alice';f.redraw();expect(document.querySelector<HTMLElement>('.mochi-desktop')!.dataset.desktopDetails).toBe('closed')
  expect(document.querySelector('.mochi-profile-about')!.textContent).toContain('No Mochi bio saved yet.');expect(document.querySelector('.mochi-profile-panel')!.textContent).not.toContain('Private AI instruction text')
 }finally{f.close()}
})
test('standalone generation confirmations stay outside closed More disclosure',()=>{
 const f=fixture();try{
  ;(f.view as any).ownGenerations.set(f.room.id,'running');f.click('Mochi notifications')
  const dialog=document.querySelector('dialog')!;expect(dialog.open).toBe(true);expect(dialog.closest('details')===null).toBe(true);expect(dialog.textContent).toContain('Stay here')
 }finally{f.close()}
})
