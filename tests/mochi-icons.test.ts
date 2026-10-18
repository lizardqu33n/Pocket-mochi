import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {iconSVGData,safeIconData,mochiIcon,mochiButton} from '../src/mochi/ui/icon-slots'

function fixture(){const dom=new JSDOM('<body></body>'),previous={document:globalThis.document,DOMParser:globalThis.DOMParser,XMLSerializer:globalThis.XMLSerializer};Object.assign(globalThis,{document:dom.window.document,DOMParser:dom.window.DOMParser,XMLSerializer:dom.window.XMLSerializer});return()=>{dom.window.close();Object.assign(globalThis,previous)}}
const valid='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#9866cc"/></svg>'
test('owner SVG and raster subset accepts static art and rejects executable or external content',()=>{
 const done=fixture();try{
  expect(iconSVGData(valid)).toStartWith('data:image/svg+xml,')
  expect(safeIconData('data:image/svg+xml;base64,'+btoa(valid))).toStartWith('data:image/svg+xml,')
  for(const bad of [valid.replace('<circle','<script'),valid.replace('<circle','<foreignObject'),valid.replace('<circle','<image href="https://evil.invalid/a"'),valid.replace('<circle','<use href="#x"'),valid.replace('<circle','<circle onload="alert(1)"'),valid.replace('<circle','<circle style="fill:url(https://evil.invalid/a)"'),valid.replace('<circle','<circle fill="url(#x)"'),valid.replace('<circle','<animate'),valid.replace('<circle','<circle xml:base="https://evil.invalid"'),valid.replace('http://www.w3.org/2000/svg','http://evil.invalid'),'<svg>', '<!DOCTYPE svg>'+valid,valid.replace('<circle','<circle unknown="1"'),valid.replace('r="8"','r="&bad;"')])expect(iconSVGData(bad)).toBeUndefined()
  for(const bad of ['https://evil.invalid/a.svg','/missing.svg','data:text/html,<svg/>','data:image/svg+xml,%ZZ','data:image/gif;base64,AAAA','x'.repeat(131073)])expect(safeIconData(bad)).toBeUndefined()
 }finally{done()}
})
test('every vendored SVG still matches its verified upstream digest',()=>{
 const p=JSON.parse(readFileSync(new URL('../src/mochi/ui/icons/provenance.json',import.meta.url),'utf8'))
 for(const [name,hash]of Object.entries(p.files))expect(createHash('sha256').update(readFileSync(new URL('../src/mochi/ui/icons/'+name+'.svg',import.meta.url))).digest('hex')).toBe(hash)
 expect(Object.keys(p.files)).toHaveLength(58)
})
test('slots retain legacy hooks and text names; glyph controls have semantic native buttons',()=>{
 const done=fixture();try{
  const n=mochiIcon('sliders','toolbar-presets');expect(n.dataset.mochiIconSlot).toBe('sliders');expect(n.dataset.mochiIconAction).toBe('toolbar-presets');expect(n.textContent).toBe('');expect(n.getAttribute('aria-hidden')).toBe('true');expect(n.querySelector('img')!.hidden).toBe(true)
  expect(mochiButton('Presets').textContent).toBe('Presets');expect(mochiButton('↑').getAttribute('aria-label')).toBe('Move up');expect(mochiButton('×').type).toBe('button')
 }finally{done()}
})
