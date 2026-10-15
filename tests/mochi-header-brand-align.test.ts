import {expect,test} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MOCHI_DESKTOP_STYLES} from '../src/mochi/desktop-styles.js'
import {MOCHI_SIDEBAR_ICON} from '../src/mochi/sidebar-icon.js'
import {mochiWordmark} from '../src/mochi/wordmark.js'

test('header visible artwork centers and heights match within a quarter pixel',()=>{
  // Alpha >16 bounds from read-only inspection of the hash-verified PNGs.
  const wordmarkScale=108/2172,wordmarkHeight=724*wordmarkScale
  const wordmarkVisibleHeight=(652-76)*wordmarkScale
  const wordmarkCenter=(76+652)/2*wordmarkScale
  const mascotScale=Math.min(40/1088,36/789)
  const mascotVisibleHeight=(1032-251)*mascotScale
  const mascotCenter=(36-789*mascotScale)/2+((251+1032)/2-247)*mascotScale
  expect(wordmarkHeight).toBe(36)
  expect(Math.abs(wordmarkCenter-mascotCenter)).toBeLessThan(.25)
  expect(Math.abs(wordmarkVisibleHeight-mascotVisibleHeight)).toBeLessThan(.25)
})

test('header uses baseline-free centered frames while keeping both original artworks',()=>{
  const dom=new JSDOM(),prior=globalThis.document;globalThis.document=dom.window.document
  try{
    const header=document.createElement('div');header.className='mochi-shell-brand'
    const name=document.createElement('h2');name.setAttribute('aria-label','Mochi');name.append(mochiWordmark())
    const mascot=document.createElement('span');mascot.className='mochi-shell-mascot';mascot.setAttribute('aria-hidden','true');mascot.innerHTML=MOCHI_SIDEBAR_ICON
    header.append(name,mascot);document.body.append(header)
    expect(header.querySelectorAll('img')).toHaveLength(1);expect(header.querySelectorAll('svg')).toHaveLength(1)
    expect(name.querySelector('img')!.alt).toBe('Mochi');expect(mascot.querySelector('svg')!.getAttribute('viewBox')).toBe('83 247 1088 789')
    expect(header.querySelector('button')).toBeNull()
    const rule=(selector:string)=>MOCHI_DESKTOP_STYLES.split('}').find(text=>text.trimStart().startsWith(selector+'{'))!
    expect(rule('.mochi-shell-brand')).toContain('align-items:center')
    expect(rule('.mochi-shell-brand h2')).toContain('display:flex');expect(rule('.mochi-shell-brand h2')).toContain('line-height:0')
    expect(rule('.mochi-shell-mascot')).toContain('height:36px');expect(rule('.mochi-shell-mascot')).toContain('display:flex')
    expect(rule('.mochi-shell-mascot svg')).toContain('display:block;width:40px;height:36px')
  }finally{globalThis.document=prior;dom.window.close()}
})
