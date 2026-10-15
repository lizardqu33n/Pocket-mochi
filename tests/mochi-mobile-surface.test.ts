import {expect,test} from 'bun:test'
import {JSDOM} from 'jsdom'
import {createMochiMobileSurface} from '../src/mochi/mobile-surface.js'
import {MOCHI_SIDEBAR_STYLES} from '../src/mochi/sidebar-styles.js'

for(const width of [320,360,390,430])test(`mobile surface ${width}: fullscreen host tracks short/tall visual viewport and cleans up`,()=>{
 const dom=new JSDOM('<body><main id="portal"><span>Native Pocket</span><section id="mochi"></section></main></body>',{pretendToBeVisual:true})
 const prior={window:globalThis.window,document:globalThis.document};Object.assign(globalThis,{window:dom.window,document:dom.window.document})
 const viewport=new dom.window.EventTarget() as any;Object.assign(viewport,{width,height:800,offsetLeft:0,offsetTop:0})
 Object.defineProperty(window,'visualViewport',{value:viewport})
 const listeners=new Set<unknown>(),add=viewport.addEventListener.bind(viewport),remove=viewport.removeEventListener.bind(viewport)
 viewport.addEventListener=(name:string,fn:unknown)=>{listeners.add(fn);add(name,fn)};viewport.removeEventListener=(name:string,fn:unknown)=>{remove(name,fn);listeners.delete(fn)}
 const root=document.createElement('div');document.body.append(root);let shown=false,fullscreen=false,destroyed=0,options:any
 const ui:any={createFloatWidget:(value:any)=>{options=value;return{root,setVisible:(v:boolean)=>{shown=v;root.hidden=!v},isVisible:()=>shown,setFullscreen:(v:boolean)=>{fullscreen=v},destroy:()=>{destroyed++;root.remove()}}},geometry:{toLayoutPx:(n:number)=>n}}
 const content=document.getElementById('mochi')!,surface=createMochiMobileSurface(ui,content)
 try{
  surface.open();surface.open();expect(surface.isOpen).toBe(true);expect(fullscreen).toBe(true);expect(options.touchScrollMode).toBe('native');expect(options.persistGeometry).toBe(false)
  expect(content.closest('#portal')).toBeNull();expect(content.dataset.mobileMessenger).toBe('true')
  const panel=root.querySelector<HTMLElement>('.mochi-mobile-surface')!;expect(panel.style.width).toBe(`${width}px`);expect(panel.style.height).toBe('800px')
  viewport.height=300;viewport.offsetTop=24;viewport.dispatchEvent(new dom.window.Event('resize'))
  expect(panel.style.height).toBe('300px');expect(panel.style.transform).toContain('24px')
  viewport.height=760;viewport.offsetTop=0;viewport.dispatchEvent(new dom.window.Event('scroll'));expect(panel.style.height).toBe('760px')
  surface.hide();expect(surface.isOpen).toBe(false);expect(content.parentElement?.id).toBe('portal');expect(content.hasAttribute('data-mobile-messenger')).toBe(false);expect(listeners.size).toBe(0)
  const oldHeight=panel.style.height;viewport.height=250;viewport.dispatchEvent(new dom.window.Event('resize'));expect(panel.style.height).toBe(oldHeight)
  expect(document.querySelector('#portal span')!.textContent).toBe('Native Pocket')
  surface.destroy();surface.destroy();expect(destroyed).toBe(1)
 }finally{surface.destroy();dom.window.close();Object.assign(globalThis,prior)}
})

test('mobile styles bound history/composer, keep one column and do not apply navigation button styles to chat',()=>{
 expect(MOCHI_SIDEBAR_STYLES).not.toContain('.mochi-sidebar button{')
 expect(MOCHI_SIDEBAR_STYLES).toContain('grid-template-rows:minmax(0,1fr)')
 expect(MOCHI_SIDEBAR_STYLES).toContain('.mochi-thread{flex:1 1 0;min-height:0;max-height:none;overflow:auto')
 expect(MOCHI_SIDEBAR_STYLES).toContain('.mochi-composer{position:static;flex:none')
 expect(MOCHI_SIDEBAR_STYLES).toContain('.mochi-room-header>.mochi-actions{gap:0;flex-wrap:nowrap}')
 expect(MOCHI_SIDEBAR_STYLES).toContain('max-height:min(112px,25dvh)')
})
