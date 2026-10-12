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
export interface MochiWindow {open():void; hide():void; destroy():void; readonly isOpen:boolean}
const windows = new WeakMap<MochiSession, MochiWindow>()

export function createMochiWindow(ui: MochiWindowUI, session: MochiSession,
  notificationPolicy: () => Pick<MochiNotificationPolicy,'enabled'|'previews'>): MochiWindow {
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
  let rect = clamp({x:64,y:64,width:560,height:720})
  const options = {width:rect.width,height:rect.height,initialPosition:{x:rect.x,y:rect.y},chromeless:true,snapToEdge:false,resizable:false,persistGeometry:false,touchScrollMode:'native' as const,tooltip:'Mochi'}
  const widget: SpindleFloatWidgetHandle = ui.createFloatWidget(options)
  let disposed = false, resizeCleanup: (()=>void)|undefined, dragCleanup: (()=>void)|undefined
  const panel = document.createElement('section'); panel.className='mochi-window';panel.setAttribute('aria-label','Mochi window')
  const style = document.createElement('style')
  style.textContent='.mochi-window{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;position:relative;background:var(--lumiverse-bg-elevated,#201e25);color:var(--lumiverse-text,#eee);border:1px solid var(--lumiverse-border,#ffffff26);border-radius:14px;overflow:hidden;box-sizing:border-box;box-shadow:0 12px 32px #0005}.mochi-window-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;min-height:36px;flex-shrink:0;cursor:move;touch-action:none;user-select:none}.mochi-window-body{flex:1;min-height:0;min-width:0;overflow:hidden}.mochi-window-close,.mochi-window-resize{color:inherit;background:transparent;border:0;min-width:32px;min-height:32px;cursor:pointer}.mochi-window-resize{position:absolute;right:0;bottom:0;cursor:nwse-resize;touch-action:none}.mochi-window button:focus-visible{outline:2px solid var(--lumiverse-primary,#9399ab);outline-offset:-3px}'
  const bar=document.createElement('header');bar.className='mochi-window-bar';bar.append('Mochi')
  const close=document.createElement('button');close.className='mochi-window-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Hide Mochi window');close.title='Hide Mochi window'
  const body=document.createElement('div');body.className='mochi-window-body'
  const grip=document.createElement('button');grip.className='mochi-window-resize';grip.type='button';grip.textContent='◢';grip.dataset.resizeHandle='se';grip.setAttribute('data-spindle-float-resize-handle','');grip.setAttribute('aria-label','Resize Mochi window');grip.title='Drag to resize, or use arrow keys'
  bar.append(close);panel.append(style,bar,body,grip);widget.root.style.height='100%';widget.root.append(panel)
  // Host drag bubbles from its entire container. Only bare title-bar gestures may reach it.
  panel.addEventListener('pointerdown',event=>{if(event.target!==bar)event.stopPropagation()})
  panel.addEventListener('contextmenu',event=>event.preventDefault()) // Avoid host chrome Hide bypassing session cancellation.
  const apply = (next: WindowRect) => {rect=clamp(next);widget.setSize(rect.width,rect.height);widget.moveTo(rect.x,rect.y)}
  const cleanup = () => {
    if(disposed)return;disposed=true
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
    workspace=createMochiWorkspace({root:body,session,notificationPolicy,
      onVisibilityChange:visible=>{if(!disposed)widget.setVisible(visible)},onDispose:cleanup})
    close.addEventListener('click',()=>workspace.close())
    grip.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return
      event.preventDefault();event.stopPropagation()
      apply({...rect,...widget.getPosition(),width:rect.width+(event.key==='ArrowRight'?16:event.key==='ArrowLeft'?-16:0),height:rect.height+(event.key==='ArrowDown'?16:event.key==='ArrowUp'?-16:0)})
    })
    window.addEventListener('resize',restoreBounds)
  } catch(error) {cleanup();throw error}
  const result: MochiWindow = {get isOpen(){return !disposed&&workspace.isOpen},open(){if(disposed)throw new Error('Mochi window is disposed.');restoreBounds();workspace.open()},hide(){if(!disposed)workspace.close()},destroy(){if(!disposed)try{workspace.destroy()}finally{cleanup()}}}
  windows.set(session,result)
  return result
}
