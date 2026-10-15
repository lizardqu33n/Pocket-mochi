import type {SpindleFrontendContext} from 'lumiverse-spindle-types'
import {applyVisualViewportSurface,clearVisualViewportSurface,currentViewport} from '../frontend/surface.js'

/** Host-managed mobile shell only. The caller retains its one session/workspace. */
export function createMochiMobileSurface(ui:SpindleFrontendContext['ui'],content:HTMLElement){
  const viewport=currentViewport()
  const options={width:viewport.width,height:viewport.height,initialPosition:{x:0,y:0},fullscreen:true,chromeless:true,snapToEdge:false,resizable:false,persistGeometry:false,touchScrollMode:'native' as const,tooltip:'Mochi'}
  const widget=ui.createFloatWidget(options)
  if(typeof widget.setFullscreen!=='function'){widget.destroy();throw Error('Full-screen Mochi is unavailable in this host.')}
  widget.setVisible(false)
  const panel=document.createElement('section');panel.className='mochi-mobile-surface';panel.setAttribute('aria-label','Mochi mobile messenger')
  const style=document.createElement('style');style.textContent='.mochi-mobile-surface{display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;background:var(--lumiverse-bg-elevated,#201e25);color:var(--lumiverse-text,#eee);padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);font:400 13px/1.5 Inter,ui-sans-serif,system-ui,sans-serif}.mochi-mobile-surface>.mochi-sidebar{flex:1;min-width:0;min-height:0;width:100%;overflow:hidden}.mochi-mobile-surface [hidden]{display:none!important}'
  panel.append(style);widget.root.style.height='100%';widget.root.append(panel)
  let opened=false,disposed=false,placeholder:Comment|undefined,opener:HTMLElement|undefined
  const sync=()=>{
    if(!opened||disposed)return
    applyVisualViewportSurface(panel,pixels=>{
      const geometry=ui.geometry as {toLayoutPx?:(value:number)=>number}|undefined
      if(geometry?.toLayoutPx)return geometry.toLayoutPx(pixels)
      const scale=Number.parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--lumiverse-ui-scale'))
      return pixels/(Number.isFinite(scale)&&scale>0?scale:1)
    })
  }
  // Listen only while open; no polling, host mutation observers or message scans.
  const listen=(add:boolean)=>{
    const method=add?'addEventListener':'removeEventListener'
    window[method]('resize',sync);window.visualViewport?.[method]('resize',sync);window.visualViewport?.[method]('scroll',sync)
    panel[method]('focusin',sync)
  }
  const blockDrag=(event:Event)=>event.stopPropagation()
  const context=(event:Event)=>event.preventDefault()
  panel.addEventListener('pointerdown',blockDrag);panel.addEventListener('contextmenu',context)
  const hide=()=>{
    if(!opened)return
    opened=false;listen(false);widget.setVisible(false);content.removeAttribute('data-mobile-messenger')
    if(placeholder?.parentNode)placeholder.replaceWith(content)
    placeholder=undefined;clearVisualViewportSurface(panel)
    if(opener?.isConnected&&!opener.closest('[hidden]'))opener.focus({preventScroll:true})
  }
  return {
    get isOpen(){return opened&&!disposed&&widget.isVisible()},
    open(){
      if(disposed)throw Error('Mochi mobile surface is disposed.')
      if(!opened){opener=document.activeElement as HTMLElement;placeholder=document.createComment('Mochi mobile return point');content.before(placeholder);panel.append(content);opened=true;listen(true)}
      content.dataset.mobileMessenger='true';widget.setFullscreen(true);sync();widget.setVisible(true)
    },
    hide,
    destroy(){if(disposed)return;hide();disposed=true;panel.removeEventListener('pointerdown',blockDrag);panel.removeEventListener('contextmenu',context);panel.remove();widget.destroy()},
  }
}
