import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import {JSDOM} from 'jsdom'
import {defaultFingerprint} from '../scripts/mochi-css-fingerprint'
import {migrate} from '../scripts/mochi-css-contract'
import {measureMochiComposer,mochiPixelToken} from '../src/mochi/ui/geometry'
import components from '../src/mochi/ui/mochi.css' with {type:'text'}
import baseline from './fixtures/mochi-css-defaults.json'

test('every original CSS declaration retains its default, selector, condition and cascade order',()=>{
 for(const [file,hash]of Object.entries(baseline.files))expect(defaultFingerprint(file,readFileSync(new URL('../'+file,import.meta.url),'utf8'))).toBe(hash)
})
test('visual extraction is idempotent and the customization map covers all component sections',()=>{
 expect(migrate(components)).toBe(components)
 const map=JSON.parse(readFileSync(new URL('../src/mochi/ui/theme-inventory.json',import.meta.url),'utf8'))
 expect(new Set(map.rules.map((r:any)=>r.section)).size).toBe(26)
 expect(map.rules.every((r:any)=>r.selector&&r.file&&r.line&&r.declarations.length)).toBe(true)
 expect(map.rules.some((r:any)=>r.conditions.some((c:string)=>c.includes('prefers-reduced-motion')))).toBe(true)
 for(const keyword of ['settings','profile','preset','notification','composer','sheet'])expect(map.rules.some((r:any)=>r.selector.includes(keyword))).toBe(true)
})
test('composer and overlay helpers publish measurements, preserve CSS authority and reject invalid margins',()=>{
 const dom=new JSDOM('<textarea></textarea>'),input=dom.window.document.querySelector('textarea')!
 try{
  Object.defineProperty(input,'scrollHeight',{value:240});measureMochiComposer(input)
  expect(input.style.height).toBe('');expect(input.style.getPropertyValue('--mochi-measured-composer-height')).toBe('240px')
  input.style.setProperty('--mochi-action-edge-inset','12px');expect(mochiPixelToken(input,'--mochi-action-edge-inset',4)).toBe(12)
  for(const bad of ['NaN','-12px','calc(2px + 3px)','bogus']){input.style.setProperty('--mochi-action-edge-inset',bad);expect(mochiPixelToken(input,'--mochi-action-edge-inset',4)).toBe(4)}
 }finally{dom.window.close()}
})
