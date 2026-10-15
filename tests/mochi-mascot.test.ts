import {expect,test} from 'bun:test'
import {createHash} from 'node:crypto'
import {JSDOM} from 'jsdom'
import {MOCHI_SIDEBAR_ICON} from '../src/mochi/sidebar-icon.js'

test('compact mascot embeds the user PNG unchanged and crops only its presentation viewport',()=>{
  const dom=new JSDOM(`<body>${MOCHI_SIDEBAR_ICON}</body>`)
  try{
    const svg=dom.window.document.querySelector('svg')!,image=svg.querySelector('image')!
    expect(svg.getAttribute('viewBox')).toBe('83 247 1088 789')
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet')
    expect(svg.getAttribute('aria-hidden')).toBe('true');expect(svg.getAttribute('focusable')).toBe('false')
    expect(image.getAttribute('width')).toBe('1254');expect(image.getAttribute('height')).toBe('1254')
    const data=image.getAttribute('href')!;expect(data).toStartWith('data:image/png;base64,')
    const bytes=Buffer.from(data.split(',')[1],'base64')
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('67655a283db1f7a41f92291de46541aeb5f09a1fbdc371e82b1f2af8054596a5')
    expect(bytes.readUInt32BE(16)).toBe(1254);expect(bytes.readUInt32BE(20)).toBe(1254);expect(bytes[25]).toBe(6)
    expect(svg.querySelectorAll('image')).toHaveLength(1)
    expect(MOCHI_SIDEBAR_ICON).not.toMatch(/https?:\/\/(?!www\.w3\.org\/2000\/svg)/)
  }finally{dom.window.close()}
})
