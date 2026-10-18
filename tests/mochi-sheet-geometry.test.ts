import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {showPocketSheet} from '../src/frontend/components/ui'

for(const zoom of [1,2])test(`sheet owner geometry at ${zoom}x keeps CSS authority, local DOM and focus restoration`,()=>{
 const dom=new JSDOM('<main class="lumiphone-shell"><button>Open</button><div><p>Content</p></div></main>',{pretendToBeVisual:true}),prior={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window})
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const parent=document.querySelector<HTMLElement>('main')!,anchor=document.querySelector('button')!,content=document.querySelector('p')!,home=content.parentElement!
 Object.defineProperty(parent,'offsetWidth',{value:320/zoom})
 parent.getBoundingClientRect=()=>({left:50,right:370,top:40,bottom:600,width:320,height:560,x:50,y:40,toJSON(){}})
 try{
  const style=document.createElement('style');style.textContent='.mochi-sheet {--mochi-dialog-edge:20px;--mochi-dialog-bottom-gap:30px;--mochi-dialog-height-reserve:90px;--mochi-dialog-min-height:150px}';document.head.append(style)
  const sheet=showPocketSheet(anchor,'Synthetic sheet',content,parent,'mochi-sheet')!,dialog=parent.querySelector('dialog')!
  expect(dialog.open).toBe(true);expect(dialog.parentElement).toBe(parent)
  expect(dialog.style.getPropertyValue('--pocket-measured-sheet-left')).toBe(`${70/zoom}px`)
  expect(dialog.style.getPropertyValue('--pocket-measured-sheet-width')).toBe(`${280/zoom}px`)
  expect(dialog.style.getPropertyValue('--pocket-measured-sheet-max-height')).toBe(`${470/zoom}px`)
  expect(dialog.style.getPropertyValue('--pocket-measured-sheet-bottom')).toBe(`${(window.innerHeight-600+30)/zoom}px`)
  for(const property of ['width','max-height','left','bottom','position'])expect(dialog.style.getPropertyValue(property)).toBe('')
  sheet.dismiss();expect(parent.querySelector('dialog')).toBeNull();expect(content.parentElement).toBe(home);expect(document.activeElement).toBe(anchor)
 }finally{dom.window.close();Object.assign(globalThis,prior)}
})
