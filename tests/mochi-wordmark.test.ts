import {MOCHI_STYLES} from '../src/mochi/styles.js'
import {expect,test} from 'bun:test'
import {createHash} from 'node:crypto'
import {JSDOM} from 'jsdom'
import image from '../src/mochi/assets/mochi-wordmark.data-url.txt' with {type:'text'}
import {mochiWordmark} from '../src/mochi/wordmark.js'

test('embedded PNG is the exact supplied asset with its original proportions and alpha channel',()=>{
  expect(image.startsWith('data:image/png;base64,')).toBe(true)
  const bytes=Buffer.from(image.split(',')[1],'base64')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('c097b2889dd77aedb6ba6446b22db73364e258e7091c1a72c6c788ef4c3d9f76')
  expect(bytes.readUInt32BE(16)).toBe(2172);expect(bytes.readUInt32BE(20)).toBe(724)
  expect(bytes[25]).toBe(6)
})

test('wordmark stays accessible and proportional without an external asset dependency',()=>{
  const dom=new JSDOM(),prior=globalThis.document;globalThis.document=dom.window.document
  try{
    const mark=mochiWordmark(),style=document.createElement('style');style.textContent=MOCHI_STYLES;document.head.append(style);document.body.append(mark);const computed=dom.window.getComputedStyle(mark)
    expect(mark.alt).toBe('Mochi');expect(mark.src).toBe(image)
    expect(mark.width/mark.height).toBe(3);expect(computed.height).toBe('auto')
    expect(computed.maxWidth).toBe('100%');expect(computed.objectFit).toBe('contain');expect(mark.draggable).toBe(false)
  }finally{globalThis.document=prior;dom.window.close()}
})
