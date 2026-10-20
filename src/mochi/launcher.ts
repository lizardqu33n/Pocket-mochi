import {mochiStyle} from './ui/styles.js'
import type { SpindleFrontendContext, SpindleFloatWidgetHandle } from 'lumiverse-spindle-types'
import type { MochiSession } from './session.js'
import type { MochiSidebar } from './sidebar.js'
import { MOCHI_SIDEBAR_ICON } from './sidebar-icon.js'

/** Owned shortcut; a legacy caller may explicitly supply an optional anchor. */
export function createMochiLauncher(ui:SpindleFrontendContext['ui'], pocket:SpindleFloatWidgetHandle|undefined, session:MochiSession, navigation:MochiSidebar):()=>void {
  session.assertActive()
  const bounds=()=>{
    const geometry=ui.geometry as {layoutViewportSize?:()=>{width:number;height:number}}|undefined
    const size=geometry?.layoutViewportSize?.()||{width:window.innerWidth,height:window.innerHeight}
    return {width:Number.isFinite(size.width)?size.width:window.innerWidth,height:Number.isFinite(size.height)?size.height:window.innerHeight}
  }
  const clamp=(p:{x:number;y:number})=>{const b=bounds();return{x:Math.max(0,Math.min(p.x,Math.max(0,b.width-58))),y:Math.max(0,Math.min(p.y,Math.max(0,b.height-58)))}}
  const position=()=>{if(pocket){const p=pocket.getPosition();return{x:p.x>=72?p.x-64:p.x+64,y:p.y}}const b=bounds();return clamp({x:Math.max(12,b.width-82),y:Math.max(58,b.height*.22)})}
  // Local host supports these geometry options beyond the published type version.
  const options={width:58,height:58,initialPosition:position(),chromeless:true,resizable:false,persistGeometry:false,snapToEdge:true,tooltip:'Mochi'}
  const widget=ui.createFloatWidget(options)
  const root=document.createElement('div'),style=document.createElement('style'),button=document.createElement('button')
  root.className='mochi-launcher-root'
  style.textContent=mochiStyle('launcher')
  button.type='button';button.className='mochi-launcher';button.title='Open Mochi messenger';button.setAttribute('aria-label','Open Mochi messenger');button.innerHTML=MOCHI_SIDEBAR_ICON
  let disposed=false,dragged=false,timer:ReturnType<typeof setTimeout>|undefined
  const cleanups:Array<()=>void>=[]
  const click=()=>{if(!dragged&&!disposed)navigation.openMessenger()};button.addEventListener('click',click)
  const dispose=()=>{if(disposed)return;disposed=true;clearTimeout(timer);for(const clean of cleanups.splice(0).reverse()){try{clean()}catch{/* Finish releasing the owned widget. */}}button.removeEventListener('click',click);root.remove();widget.destroy()}
  try{
    root.append(style,button);widget.root.append(root)
    cleanups.push(navigation.onMessengerVisibility(visible=>{if(!disposed&&!session.isDestroyed)widget.setVisible(!visible)}))
    if(pocket)cleanups.push(pocket.onDragEnd(()=>{if(!disposed){const p=position();widget.moveTo(p.x,p.y)}}))
    cleanups.push(widget.onDragEnd(()=>{dragged=true;clearTimeout(timer);timer=setTimeout(()=>{dragged=false},180)}))
    if(!pocket){
      const resize=()=>{if(!disposed){const p=clamp(widget.getPosition());widget.moveTo(p.x,p.y)}}
      window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize)
      const observer=new MutationObserver(resize)
      observer.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']})
      cleanups.push(()=>{window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);observer.disconnect()})
    }
    const detach=session.observeNavigation({redraw:()=>{},disposed:dispose})
    return()=>{try{detach()}finally{dispose()}}
  }catch(error){dispose();throw error}
}
