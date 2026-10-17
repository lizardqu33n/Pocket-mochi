import {mochiStyle} from './ui/styles.js'
import type { SpindleFrontendContext, SpindleFloatWidgetHandle } from 'lumiverse-spindle-types'
import type { MochiSession } from './session.js'
import type { MochiSidebar } from './sidebar.js'
import { MOCHI_SIDEBAR_ICON } from './sidebar-icon.js'

/** Independent shortcut; supported widget positioning follows Pocket drag commits. */
export function createMochiLauncher(ui:SpindleFrontendContext['ui'], pocket:SpindleFloatWidgetHandle, session:MochiSession, navigation:MochiSidebar):()=>void {
  session.assertActive()
  const position=()=>{const p=pocket.getPosition();return{x:p.x>=72?p.x-64:p.x+64,y:p.y}}
  // Local host supports these geometry options beyond the published type version.
  const options={width:58,height:58,initialPosition:position(),chromeless:true,resizable:false,persistGeometry:false,snapToEdge:true,tooltip:'Mochi'}
  const widget=ui.createFloatWidget(options)
  const root=document.createElement('div'),style=document.createElement('style'),button=document.createElement('button')
  root.className='mochi-launcher-root'
  style.textContent=mochiStyle('launcher')
  button.type='button';button.className='mochi-launcher';button.title='Open Mochi messenger';button.setAttribute('aria-label','Open Mochi messenger');button.innerHTML=MOCHI_SIDEBAR_ICON
  let disposed=false,dragged=false,timer:ReturnType<typeof setTimeout>|undefined
  const click=()=>{if(!dragged&&!disposed)navigation.openMessenger()};button.addEventListener('click',click)
  root.append(style,button);widget.root.append(root)
  const offVisibility=navigation.onMessengerVisibility(visible=>{if(!disposed&&!session.isDestroyed)widget.setVisible(!visible)})
  const offPocket=pocket.onDragEnd(()=>{if(!disposed){const p=position();widget.moveTo(p.x,p.y)}})
  const offDrag=widget.onDragEnd(()=>{dragged=true;clearTimeout(timer);timer=setTimeout(()=>{dragged=false},180)})
  const dispose=()=>{if(disposed)return;disposed=true;clearTimeout(timer);offVisibility();offPocket();offDrag();button.removeEventListener('click',click);root.remove();widget.destroy()}
  const detach=session.observeNavigation({redraw:()=>{},disposed:dispose})
  return()=>{detach();dispose()}
}
