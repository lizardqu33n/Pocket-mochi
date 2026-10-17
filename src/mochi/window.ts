import {mochiStyle} from './ui/styles.js'
import type { SpindleFrontendContext, SpindleFloatWidgetHandle } from 'lumiverse-spindle-types'
import type { MochiSession } from './session.js'
import { createMochiWorkspace } from './workspace.js'
import type { MochiNotificationPolicy } from './notifications.js'

// Local host frontend-context.ts overrides the older published geometry typings.
export interface MochiWindowUI {
  createFloatWidget: SpindleFrontendContext['ui']['createFloatWidget']
  geometry?: {
    layoutViewportSize(): {width:number; height:number}
    createResizeController(element: HTMLElement, options: {
      handles: ['se']; bounds: {minWidth:number; minHeight:number}
      onChange(rect: WindowRect): void; onCommit(rect: WindowRect): void
    }): () => void
  }
}
interface WindowRect {x:number; y:number; width:number; height:number}
export interface MochiWindow {open():void; hide():void; destroy():void; readonly isOpen:boolean; onVisibilityChange(handler:(visible:boolean)=>void):()=>void}
const windows = new WeakMap<MochiSession, MochiWindow>()

export function createMochiWindow(ui: MochiWindowUI, session: MochiSession,
  notificationPolicy: () => Pick<MochiNotificationPolicy,'enabled'|'previews'>, onOpen?: () => void): MochiWindow {
  session.assertActive()
  const existing = windows.get(session)
  if (existing) return existing
  const geometry = ui.geometry
  if (!geometry || typeof geometry.layoutViewportSize !== 'function' || typeof geometry.createResizeController !== 'function') {
    throw new Error('This host lacks supported floating-window geometry. Use the Pocket portal.')
  }
  const bounds = () => {
    const viewport = geometry.layoutViewportSize()
    if (!Number.isFinite(viewport.width) || !Number.isFinite(viewport.height) || viewport.width < 120 || viewport.height < 160) throw new Error('Window viewport is unavailable. Use the Pocket portal.')
    return {width:Math.max(1,viewport.width-16),height:Math.max(1,viewport.height-16)}
  }
  const clamp = (rect: WindowRect): WindowRect => {
    if (![rect.x,rect.y,rect.width,rect.height].every(Number.isFinite)) throw new Error('Window geometry is invalid. Use the Pocket portal.')
    const limit = bounds(), width = Math.min(limit.width,Math.max(Math.min(320,limit.width),rect.width)), height = Math.min(limit.height,Math.max(Math.min(420,limit.height),rect.height))
    return {width,height,x:Math.max(8,Math.min(rect.x,limit.width+8-width)),y:Math.max(8,Math.min(rect.y,limit.height+8-height))}
  }
  let rect = clamp({x:64,y:64,width:840,height:720})
  const options = {width:rect.width,height:rect.height,initialPosition:{x:rect.x,y:rect.y},chromeless:true,snapToEdge:false,resizable:false,persistGeometry:false,touchScrollMode:'native' as const,tooltip:'Mochi'}
  const widget: SpindleFloatWidgetHandle = ui.createFloatWidget(options)
  let disposed = false, visibleBefore = false, resizeCleanup: (()=>void)|undefined, dragCleanup: (()=>void)|undefined
  const visibility = new Set<(visible:boolean)=>void>()
  let savedRect:WindowRect|undefined,opener:HTMLElement|undefined,lastFocus:HTMLElement|undefined
  const maximized=()=>typeof widget.isFullscreen==='function'&&widget.isFullscreen()
  const panel = document.createElement('section'); panel.className='mochi-window';panel.setAttribute('aria-label','Mochi window')
  const style = document.createElement('style')
  style.textContent=mochiStyle('window')
  const bar=document.createElement('header');bar.className='mochi-window-bar';bar.append('Mochi')
  const close=document.createElement('button');close.className='mochi-window-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Hide Mochi window');close.title='Hide Mochi window'
  bar.tabIndex=0;bar.setAttribute('aria-label','Mochi title bar');bar.setAttribute('aria-description','Use arrow keys to move the window. Escape hides it.')
  const maximize=document.createElement('button');maximize.type='button';maximize.className='mochi-window-close';maximize.textContent='□'
  const canMaximize=typeof widget.setFullscreen==='function'&&typeof widget.isFullscreen==='function'
  const syncControls=()=>{const full=maximized();maximize.setAttribute('aria-label',full?'Restore Mochi window':'Maximize Mochi window');maximize.title=full?'Restore window':'Maximize window';maximize.setAttribute('aria-pressed',String(full));grip.hidden=full;grip.disabled=full;bar.setAttribute('aria-description',full?'Window maximized. Escape hides it.':'Use arrow keys to move the window. Escape hides it.')}
  const body=document.createElement('div');body.className='mochi-window-body'
  const grip=document.createElement('button');grip.className='mochi-window-resize';grip.type='button';grip.textContent='◢';grip.dataset.resizeHandle='se';grip.setAttribute('data-spindle-float-resize-handle','');grip.setAttribute('aria-label','Resize Mochi window');grip.title='Drag to resize, or use arrow keys'
  if(canMaximize)bar.append(maximize)
  bar.append(close);panel.append(style,bar,body,grip);widget.root.style.height='100%';widget.root.append(panel)
  const focusStyle=document.createElement('style');focusStyle.textContent=mochiStyle('window-focus');panel.append(focusStyle)
  panel.addEventListener('focusin',event=>{if(event.target!==close)lastFocus=event.target as HTMLElement})
  // Host drag bubbles from its entire container. Only bare title-bar gestures may reach it.
  panel.addEventListener('pointerdown',event=>{if(event.target!==bar||maximized())event.stopPropagation()})
  panel.addEventListener('contextmenu',event=>event.preventDefault()) // Avoid host chrome Hide bypassing session cancellation.
  const apply = (next: WindowRect) => {if(maximized())return;rect=clamp(next);widget.setSize(rect.width,rect.height);widget.moveTo(rect.x,rect.y)}
  const hide=()=>{workspace.close();if(opener?.isConnected&&!opener.closest('[hidden]'))opener.focus({preventScroll:true})}
  const requestHide=()=>session.view.confirmGenerationExit(hide,close)
  maximize.onclick=()=>{if(maximized()){widget.setFullscreen(false);if(savedRect)apply(savedRect);savedRect=undefined}else{savedRect={...rect,...widget.getPosition()};widget.setFullscreen(true)}syncControls()}
  bar.addEventListener('keydown',event=>{if(event.target!==bar||event.defaultPrevented)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();requestHide();return}if(maximized()||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();event.stopPropagation();const p=widget.getPosition();apply({...rect,x:p.x+(event.key==='ArrowRight'?16:event.key==='ArrowLeft'?-16:0),y:p.y+(event.key==='ArrowDown'?16:event.key==='ArrowUp'?-16:0)})})
  const cleanup = () => {
    if(disposed)return;disposed=true
    for(const handler of visibility)handler(false);visibility.clear()
    windows.delete(session)
    window.removeEventListener('resize',restoreBounds)
    try{resizeCleanup?.()}finally{try{dragCleanup?.()}finally{panel.remove();widget.destroy()}}
  }
  const restoreBounds = () => {if(!disposed)apply({...rect,...widget.getPosition()})}
  let workspace: ReturnType<typeof createMochiWorkspace>
  try {
    widget.setVisible(false)
    const disposeResize=geometry.createResizeController(panel,{handles:['se'],bounds:{minWidth:Math.min(320,bounds().width),minHeight:Math.min(420,bounds().height)},onChange:apply,onCommit:apply})
    if(typeof disposeResize!=='function')throw new Error('Unsupported resize-controller lifecycle. Use the Pocket portal.')
    resizeCleanup=disposeResize
    dragCleanup=widget.onDragEnd(position=>{rect={...rect,...position}})
    workspace=createMochiWorkspace({root:body,session,notificationPolicy,presentation:'messenger',isHostVisible:()=>widget.isVisible(),
      onVisibilityChange:visible=>{if(!disposed){const opening=visible&&!visibleBefore;visibleBefore=visible;widget.setVisible(visible);if(opening)try{onOpen?.()}catch{/* A host handoff failure must not destroy the messenger. */}for(const handler of visibility)handler(visible)}},onDispose:cleanup})
    close.addEventListener('click',requestHide)
    syncControls()
    grip.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return
      event.preventDefault();event.stopPropagation()
      apply({...rect,...widget.getPosition(),width:rect.width+(event.key==='ArrowRight'?16:event.key==='ArrowLeft'?-16:0),height:rect.height+(event.key==='ArrowDown'?16:event.key==='ArrowUp'?-16:0)})
    })
    window.addEventListener('resize',restoreBounds)
  } catch(error) {cleanup();throw error}
  const result: MochiWindow = {get isOpen(){return !disposed&&workspace.isOpen&&widget.isVisible()},onVisibilityChange(handler){visibility.add(handler);handler(!disposed&&workspace.isOpen&&widget.isVisible());return()=>{visibility.delete(handler)}},open(){if(disposed)throw new Error('Mochi window is disposed.');const active=document.activeElement as HTMLElement|null;if(!panel.contains(active)&&active&&typeof active.focus==='function')opener=active;restoreBounds();workspace.open();widget.setVisible(true);syncControls();for(const handler of visibility)handler(true);session.view.resume();if(!panel.contains(document.activeElement)){if(lastFocus?.isConnected&&panel.contains(lastFocus)&&!lastFocus.closest('[hidden]'))lastFocus.focus({preventScroll:true});else bar.focus({preventScroll:true})}},hide(){if(!disposed)hide()},destroy(){if(!disposed)try{workspace.destroy()}finally{cleanup()}}}
  windows.set(session,result)
  return result
}
