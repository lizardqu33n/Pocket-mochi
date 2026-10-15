import {expect,test} from 'bun:test'
import {JSDOM} from 'jsdom'
import {readFileSync} from 'node:fs'
import image from '../src/mochi/assets/mochi-wordmark.data-url.txt' with {type:'text'}
import {MOCHI_SIDEBAR_ICON} from '../src/mochi/sidebar-icon.js'

test('built frontend renders the supplied wordmark through the existing shared-session API',async()=>{
  const dom=new JSDOM(),prior={document:globalThis.document,window:globalThis.window}
  Object.assign(globalThis,{document:dom.window.document,window:dom.window})
  let listeners=0,session:any
  try{
    const runtime=await import('../dist/frontend.js'),transport={sendToBackend:()=>{},onBackendMessage:()=>{listeners++;return()=>{listeners--}}}
    session=runtime.getMochiSession(transport)
    expect(runtime.getMochiSession(transport)).toBe(session);expect(listeners).toBe(1)
    for(const root of [session.view.renderDesktop(),session.view.render()]){
      const mark=root.querySelector('.mochi-wordmark-image') as HTMLImageElement
      expect(mark).not.toBeNull();expect(mark.alt).toBe('Mochi');expect(mark.src).toBe(image)
      expect(mark.width/mark.height).toBe(3);expect(mark.style.height).toBe('auto')
      if(root.classList.contains('mochi-desktop')){
        expect(Array.from(root.querySelectorAll('style')).some(style=>style.textContent?.includes('.mochi-shell-mascot svg{display:block;width:40px;height:36px}'))).toBe(true)
      }
    }
    const mascot=session.view.renderDesktop().querySelector('.mochi-shell-mascot svg')!
    expect(mascot.getAttribute('viewBox')).toBe('83 247 1088 789')
    expect(mascot.querySelector('image')!.getAttribute('href')).toContain('data:image/png;base64,')
    session.destroy(false);expect(listeners).toBe(0)
  }finally{session?.destroy(false);Object.assign(globalThis,prior);dom.window.close()}
})

test('built frontend contains acknowledged Power controls and their green/red/neutral styles',()=>{
  const bundle=readFileSync(new URL('../dist/frontend.js',import.meta.url),'utf8')
  for(const value of ['lumiphone:rp_context_power_state','lumiphone:rp_context_power','RP context: Unavailable','#4ade80','#f87171','#9ca3af'])expect(bundle).toContain(value)
  expect(bundle).toContain(image)
  // Bun escapes the markup in its JS literal; the source PNG data is unchanged.
  expect(bundle).toContain(MOCHI_SIDEBAR_ICON.match(/href="([^"]+)"/)![1])
})
