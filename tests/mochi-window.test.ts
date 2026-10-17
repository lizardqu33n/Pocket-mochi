import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { getMochiSession } from '../src/mochi/session.js'
import { createMochiWorkspace } from '../src/mochi/workspace.js'
import { createMochiWindow, type MochiWindowUI } from '../src/mochi/window.js'
import { PocketPortal } from '../src/frontend/components/portal.js'

function fixture() {
  const dom=new JSDOM('<body><main id="portal"></main></body>',{pretendToBeVisual:true})
  const previous={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:dom.window.document,window:dom.window})
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
  dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
  const listeners=new Set<(payload:unknown)=>void>(),sent:any[]=[]
  const transport={sendToBackend:(payload:unknown)=>sent.push(payload),onBackendMessage:(fn:(payload:unknown)=>void)=>{listeners.add(fn);return()=>listeners.delete(fn)}}
  const session=getMochiSession(transport)
  const portal=createMochiWorkspace({root:document.getElementById('portal')!,transport,notificationPolicy:()=>({enabled:true,previews:false})})
  const viewport={width:1000,height:900};let options:any,resize:any,widget:any,drag:any,created=0,cleaned=0,destroyed=0
  const ui:MochiWindowUI={geometry:{layoutViewportSize:()=>viewport,createResizeController:(_,opts)=>{resize=opts;return()=>cleaned++}},createFloatWidget:(opts)=>{
    created++;options=opts
    const root=document.createElement('div');document.body.append(root)
    let position={...opts!.initialPosition!},visible=true,fullscreen=false,previousRect:any
    widget={root,widgetId:'window',setSize:(width:number,height:number)=>{if(!fullscreen){root.style.width=`${width}px`;root.style.height=`${height}px`}},getPosition:()=>position,moveTo:(x:number,y:number)=>{position={x,y}},setVisible:(value:boolean)=>{visible=value;root.hidden=!value},isVisible:()=>visible,destroy:()=>{destroyed++;root.remove()},onDragEnd:(fn:any)=>{drag=fn;return()=>{drag=undefined}},setFullscreen:(value:boolean)=>{if(value){previousRect={...position,width:root.style.width,height:root.style.height};position={x:0,y:0};root.style.width=viewport.width+'px';root.style.height=viewport.height+'px'}else if(previousRect){position={x:previousRect.x,y:previousRect.y};root.style.width=previousRect.width;root.style.height=previousRect.height}fullscreen=value},isFullscreen:()=>fullscreen}
    return widget
  }}
  const room:any={id:'room_'+'a'.repeat(32),ownerId:'alice',title:'Synthetic',revision:1,characterIds:['char'],persona:{source:'manual',sourceId:'',name:'Me',description:''},messages:[],settings:{autoReply:true,responseMode:'instant',connectionId:'owned',instructions:'',contextTokens:8192,outputTokens:1200,characterNames:{}}}
  const state:any={rooms:[room],characters:[{id:'char',name:'Character'}],connections:[{id:'owned',name:'Provider'}],personas:[],warnings:[],notifications:[]}
  const emit=(payload:any)=>{for(const fn of listeners)fn(payload)}
  const load=()=>{
    emit({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:{version:1,ownerId:'alice',revision:1,accounts:[],personas:[],avatars:[],warnings:[],canUploadAvatar:false,phone:{supported:false,preference:'picker'}}})
    Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Unassigned legacy chats')!.click()
    emit({type:'mochi:state',requestId:sent.at(-1).requestId,state:structuredClone(state)});session.view.select(room.id)
    portal.refresh();emit({type:'mochi:state',requestId:sent.at(-1).requestId,state:structuredClone(state)})
  }
  return {dom,session,portal,ui,viewport,sent,listeners,room,load,emit,get widget(){return widget},get resize(){return resize},get options(){return options},get counts(){return{created,cleaned,destroyed}},drag:(position:any)=>drag(position),cleanup:()=>{try{session.destroy(false)}finally{dom.window.close();Object.assign(globalThis,previous)}}}
}

test('window: one owner, portal handoff, hide/restore retains room/composer/settings and cancels only interactive work',()=>{
  const h=fixture()
  try {
    h.portal.open();h.load()
    const composer=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;composer.value='Unsent';composer.dispatchEvent(new h.dom.window.Event('input'))
    const win=createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:false}));win.open()
    expect(createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:false}))).toBe(win)
    expect(h.portal.isOpen).toBe(false);expect(win.isOpen).toBe(true);expect(h.listeners.size).toBe(1);expect(h.counts.created).toBe(1)
    expect(document.querySelector<HTMLTextAreaElement>('.mochi-window [aria-label="Message"]')!.value).toBe('Unsent')
    ;(h.session.view as any).ownGenerations.set(h.room.id,'interactive')
    win.hide();expect(h.widget.isVisible()).toBe(false)
    expect(h.sent.filter(p=>p.type==='mochi:cancel')).toEqual([{type:'mochi:cancel',accountId:undefined,roomId:h.room.id,generationRequestId:'interactive'}])
    expect(h.sent.some(p=>p.type==='mochi:schedule_cancel')).toBe(false)
    win.open();expect(h.session.view.roomId).toBe(h.room.id)
    document.querySelector<HTMLButtonElement>('.mochi-window [aria-label="Settings"]')!.click();Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Advanced')!.click()
    const instructions=document.querySelector<HTMLTextAreaElement>('.mochi-window [aria-label="Room instructions"]')!;instructions.value='Draft';instructions.dispatchEvent(new h.dom.window.Event('input'))
    document.querySelector<HTMLButtonElement>('[aria-label="Hide Mochi window"]')!.click();win.open()
    expect(document.querySelector('.mochi-window [aria-label="Room instructions"]')).toBe(instructions)
    expect(h.session.view.hasUnsavedChanges()).toBe(true)
    h.portal.open();expect(win.isOpen).toBe(false);expect(h.widget.isVisible()).toBe(false)
    win.open();expect(h.portal.isOpen).toBe(false);expect(document.querySelector<HTMLTextAreaElement>('.mochi-window [aria-label="Room instructions"]')!.value).toBe('Draft')
    win.destroy();expect(h.session.isDestroyed).toBe(false);expect(h.counts.destroyed).toBe(1)
  }finally{h.cleanup()}
})

test('window: only title bar initiates host drag; resize grip and content gestures stay inside',()=>{
  const h=fixture()
  try {
    const win=createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:false}));win.open()
    let starts=0;h.widget.root.addEventListener('pointerdown',()=>starts++)
    document.querySelector('.mochi-window-bar')!.dispatchEvent(new h.dom.window.Event('pointerdown',{bubbles:true}));expect(starts).toBe(1)
    for(const selector of ['.mochi-window-body','.mochi-window-close','.mochi-window-resize'])document.querySelector(selector)!.dispatchEvent(new h.dom.window.Event('pointerdown',{bubbles:true}))
    expect(starts).toBe(1);expect(h.options.resizable).toBe(false);expect(h.options.persistGeometry).toBe(false)
    expect(h.resize.handles).toEqual(['se']);expect(h.resize.bounds).toEqual({minWidth:320,minHeight:420})
    win.destroy()
  }finally{h.cleanup()}
})

test('window: resize and restoration are bounded, keyboard resize works, logout disposes geometry and widget',()=>{
  const h=fixture()
  try {
    const win=createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:false}));win.open()
    h.resize.onChange({x:-400,y:2000,width:4000,height:4000})
    expect(h.widget.getPosition()).toEqual({x:8,y:8});expect(h.widget.root.style.width).toBe('984px');expect(h.widget.root.style.height).toBe('884px')
    h.resize.onCommit({x:900,y:800,width:100,height:100});expect(h.widget.root.style.width).toBe('320px');expect(h.widget.root.style.height).toBe('420px')
    document.querySelector('.mochi-window-resize')!.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));expect(h.widget.root.style.width).toBe('336px')
    win.hide();h.viewport.width=320;h.viewport.height=480;win.open()
    expect(h.widget.root.style.width).toBe('304px');expect(h.widget.getPosition()).toEqual({x:8,y:52})
    h.session.authenticatedIdentityChanged(null);expect(win.isOpen).toBe(false);expect(h.counts.cleaned).toBe(1);expect(h.counts.destroyed).toBe(1);expect(h.listeners.size).toBe(0)
    win.destroy();expect(h.counts.destroyed).toBe(1);expect(()=>win.open()).toThrow('disposed')
  }finally{h.cleanup()}
})

test('window: absent supported geometry fails before creation and leaves portal usable',()=>{
  const h=fixture()
  try {
    h.portal.open();expect(()=>createMochiWindow({...h.ui,geometry:undefined},h.session,()=>({enabled:true,previews:false}))).toThrow('geometry')
    expect(h.portal.isOpen).toBe(true);expect(h.counts.created).toBe(0);expect(h.listeners.size).toBe(1)
  }finally{h.cleanup()}
})

test('window: user Hide warns about active replies and Stay does not cancel; programmatic cleanup remains unconditional',()=>{
 const h=fixture()
 try{
  h.portal.open();h.load();const win=createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:false}));win.open()
  ;(h.session.view as any).ownGenerations.set(h.room.id,'synthetic_hide_reply')
  const click=(name:string)=>Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.getAttribute('aria-label')===name||b.textContent===name)!.click()
  click('Hide Mochi window');expect(win.isOpen).toBe(true);expect(document.body.textContent).toContain('A reply is still generating')
  click('Stay here');expect(win.isOpen).toBe(true);expect(h.sent.some(p=>p.type==='mochi:cancel')).toBe(false)
  click('Hide Mochi window');click('Cancel generation & leave');expect(win.isOpen).toBe(false);expect(h.sent.filter(p=>p.type==='mochi:cancel')).toHaveLength(1)
  win.open();expect(h.listeners.size).toBe(1);expect(h.sent.some(p=>p.type==='mochi:schedule_cancel')).toBe(false)
 }finally{h.cleanup()}
})

test('window: host-hidden messenger does not acknowledge or toast unread messages',()=>{
  const h=fixture()
  try{
    h.portal.open();h.load();const win=createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:true}));win.open()
    h.widget.setVisible(false);expect(win.isOpen).toBe(false);const before=h.sent.length
    h.emit({type:'mochi:notification',notificationRevision:1,notification:{id:'synthetic_notice',roomId:h.room.id,messageId:'synthetic_message',title:'Synthetic',roomTitle:'Synthetic',body:'Synthetic',avatarUrl:'',createdAt:'2026-10-12T12:00:00Z',read:false}})
    expect(h.sent.slice(before).some(p=>p.type==='mochi:notification_read')).toBe(false)
    expect(document.querySelector('.mochi-notification-toast')).toBeNull();expect(h.session.view.state!.notifications!.some(n=>n.id==='synthetic_notice'&&!n.read)).toBe(true)
    win.open();expect(win.isOpen).toBe(true)
    expect(h.sent.slice(before).filter(p=>p.type==='mochi:notification_read')).toHaveLength(1)
    win.open();expect(h.sent.slice(before).filter(p=>p.type==='mochi:notification_read')).toHaveLength(1)
  }finally{h.cleanup()}
})

test('window: supported maximize restores bounded geometry and blocks resize/drag while maximized',()=>{
  const h=fixture()
  try{
    const win=createMochiWindow(h.ui,h.session,()=>({enabled:false,previews:false}));win.open()
    const bar=document.querySelector<HTMLElement>('.mochi-window-bar')!,grip=document.querySelector<HTMLButtonElement>('.mochi-window-resize')!
    bar.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));expect(h.widget.getPosition().x).toBe(80)
    const before={width:h.widget.root.style.width,height:h.widget.root.style.height,x:h.widget.getPosition().x}
    document.querySelector<HTMLButtonElement>('[aria-label="Maximize Mochi window"]')!.click()
    expect(h.widget.isFullscreen()).toBe(true);expect(grip.hidden).toBe(true);expect(grip.disabled).toBe(true)
    expect(document.querySelector('[aria-label="Restore Mochi window"]')!.getAttribute('aria-pressed')).toBe('true')
    const fullWidth=h.widget.root.style.width
    h.resize.onChange({x:0,y:0,width:320,height:420});expect(h.widget.root.style.width).toBe(fullWidth)
    document.querySelector<HTMLButtonElement>('[aria-label="Restore Mochi window"]')!.click()
    expect(h.widget.isFullscreen()).toBe(false);expect(h.widget.root.style.width).toBe(before.width);expect(h.widget.getPosition().x).toBe(before.x);expect(grip.hidden).toBe(false)
    document.querySelector<HTMLButtonElement>('[aria-label="Maximize Mochi window"]')!.click()
    h.viewport.width=390;h.viewport.height=400;window.dispatchEvent(new h.dom.window.Event('resize'))
    document.querySelector<HTMLButtonElement>('[aria-label="Restore Mochi window"]')!.click()
    expect(parseFloat(h.widget.root.style.width)).toBeLessThanOrEqual(374);expect(parseFloat(h.widget.root.style.height)).toBeLessThanOrEqual(384)
    expect(h.widget.getPosition().x).toBeGreaterThanOrEqual(8);expect(h.counts.created).toBe(1)
  }finally{h.cleanup()}
})

test('window: opening and restoring focus content; title-only Escape returns focus without eating composer keys',()=>{
  const h=fixture()
  try{
    h.portal.open();h.load();const opener=document.createElement('button');document.body.append(opener);opener.focus()
    const win=createMochiWindow(h.ui,h.session,()=>({enabled:false,previews:false}));win.open()
    const bar=document.querySelector<HTMLElement>('.mochi-window-bar')!;expect(document.activeElement).toBe(bar)
    const composer=document.querySelector<HTMLTextAreaElement>('.mochi-window [aria-label="Message"]')!;composer.focus();composer.value='Retained';composer.dispatchEvent(new h.dom.window.Event('input'))
    composer.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));expect(win.isOpen).toBe(true)
    win.hide();expect(document.activeElement).toBe(opener);win.open();expect(document.activeElement).toBe(composer);expect(composer.value).toBe('Retained')
    const keyboard=bar.getAttribute('aria-description');expect(keyboard).toContain('arrow keys')
    bar.focus();bar.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));expect(win.isOpen).toBe(false);expect(document.activeElement).toBe(opener)
  }finally{h.cleanup()}
})

for(const width of [320,390,600,900])test(`window: ${width}px host layout viewport keeps usable bounded geometry`,()=>{
  const h=fixture()
  try{
    h.viewport.width=width;const win=createMochiWindow(h.ui,h.session,()=>({enabled:false,previews:false}));win.open()
    h.resize.onChange({x:9999,y:9999,width:9999,height:9999})
    expect(parseFloat(h.widget.root.style.width)).toBeLessThanOrEqual(width-16)
    expect(h.widget.getPosition().x+parseFloat(h.widget.root.style.width)).toBeLessThanOrEqual(width-8)
    expect(parseFloat(h.widget.root.style.width)).toBeGreaterThanOrEqual(Math.min(320,width-16))
    expect(document.querySelector('.mochi-workspace[data-presentation="messenger"]')).not.toBeNull()
  }finally{h.cleanup()}
})

test('window: temporary portal entry opens the host while original Mochi entry stays available',()=>{
  const h=fixture()
  try {
    let win:ReturnType<typeof createMochiWindow>|undefined
    const portal=new PocketPortal(()=>document.createElement('div'),()=>document.createElement('div'),()=>h.portal.open(),{
      back:exit=>exit(),home:exit=>exit(),window:()=>{win ||= createMochiWindow(h.ui,h.session,()=>({enabled:true,previews:false}));win.open()},
    })
    document.body.append(portal.root)
    portal.root.querySelector<HTMLButtonElement>('[aria-label="Open Mochi window"]')!.click()
    expect(win!.isOpen).toBe(true);expect(h.counts.created).toBe(1)
    portal.root.querySelector<HTMLButtonElement>('[aria-label="Open Mochi"]')!.click()
    expect(h.portal.isOpen).toBe(true);expect(win!.isOpen).toBe(false);expect(h.widget.isVisible()).toBe(false)
    portal.root.querySelector<HTMLButtonElement>('[aria-label="Open Mochi window"]')!.click();expect(h.counts.created).toBe(1)
  }finally{h.cleanup()}
})
