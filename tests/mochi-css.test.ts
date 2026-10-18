import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import tokens from '../src/mochi/ui/mochi-tokens.css' with {type:'text'}
import components from '../src/mochi/ui/mochi.css' with {type:'text'}
import theme from '../src/mochi/ui/mochi-theme.css' with {type:'text'}
import {mochiStyle} from '../src/mochi/ui/styles.js'
import {MOCHI_STYLES} from '../src/mochi/styles.js'
import {MOCHI_PRESET_WORKSPACE_STYLES} from '../src/mochi/preset-panel.js'
import {JSDOM} from 'jsdom'
import {showMochiNotification} from '../src/mochi/notifications.js'
import postcss from 'postcss'
import {publicVariable,originalDefaults} from '../scripts/mochi-css-contract'

test('ordinary CSS text imports retain the existing cascade section boundaries',()=>{
 const markers=[...components.matchAll(/\/\* @mochi-section ([a-z0-9-]+) \*\//g)].map(m=>m[1])
 expect(markers).toHaveLength(24);expect(new Set(markers).size).toBe(markers.length)
 for(const name of markers)expect(mochiStyle(name).trim().length).toBeGreaterThan(0)
 expect(()=>mochiStyle('missing')).toThrow('Missing Mochi CSS section')
 expect(MOCHI_STYLES).toBe(tokens+'\n'+components.split('/* @mochi-section base */')[1].split('/* @mochi-section ')[0]+'\n'+theme)
 for(const name of ['base','launcher','mobile-surface','window','workspace','notifications'])expect(mochiStyle(name).startsWith(tokens+'\n')).toBe(true)
 for(const name of markers)expect(mochiStyle(name).endsWith('\n'+theme)).toBe(true)
 const names=['block-editor','preset-workspace-base','mochi-preset-dedicated-styles','mochi-preset-chrome-styles','preset-workspace-final']
 expect(MOCHI_PRESET_WORKSPACE_STYLES).toBe(names.map(mochiStyle).join(''))
})

test('all Mochi component variables have scoped editable defaults and preserve host color inheritance',()=>{
 const definitions=new Set([...tokens.matchAll(/(--mochi-[\w-]+)\s*:/g)].map(m=>m[1]))
 postcss.parse(components).walkDecls(decl=>{
  const variable=publicVariable(decl.value)
  if(variable?.[1].startsWith('--mochi-v2-'))expect(variable[2]?.length).toBeGreaterThan(0)
 })
 for(const [,name]of originalDefaults(components).matchAll(/var\((--mochi-[\w-]+)/g))expect(definitions.has(name)||/--mochi-(?:measured-|action-(?:right|bottom)|composer-height)/.test(name)).toBe(true)
 expect(tokens).toMatch(/--mochi-sidebar-width: \d+px/);expect(tokens).toMatch(/--mochi-chat-font-size: calc\(15px \* var\(--mochi-message-scale\)\)/)
 expect(tokens).toMatch(/--mochi-bubble-radius: \d+px/);expect(tokens).toMatch(/--mochi-avatar-size: \d+px/)
 expect(tokens).toContain('var(--lumiverse-bg,var(--lp-bg,#17151d))')
 expect(tokens).toContain('var(--lumiverse-border,var(--lp-border,#ffffff18))')
 expect(tokens).not.toMatch(/:root\s*\{/);expect(components).not.toMatch(/@import\s|https?:\/\//)
})

test('normal frontend build validates and embeds CSS without a separate stylesheet install',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'))
 expect(pkg.scripts['build:frontend']).toContain('scripts/check-mochi-css.ts')
 expect(pkg.scripts['build:frontend']).toContain('--outfile=dist/frontend.js')
 expect(readFileSync(new URL('../src/mochi/ui/styles.ts',import.meta.url),'utf8')).toContain("with {type:'text'}")
})

test('notification CSS remains available outside a Mochi view and does not duplicate its stylesheet',()=>{
 const dom=new JSDOM('<body><main></main></body>'),prior=globalThis.document;globalThis.document=dom.window.document
 const shell=document.querySelector('main')!,notice:any={title:'Synthetic',body:'Synthetic body',roomTitle:'Synthetic room',avatarUrl:'data:image/gif;base64,R0lGODlhAQABAAAAACw='}
 const first=showMochiNotification(shell,notice,true,()=>{}),second=showMochiNotification(shell,notice,true,()=>{})
 try{
  expect(shell.querySelectorAll('style[data-mochi-notifications]')).toHaveLength(1)
  // jsdom cannot resolve custom-property fallback lengths; the browser batches
  // check the cascade. This DOM check exercises the original fallback sizes.
  const sheet=shell.querySelector('style')!;sheet.textContent=originalDefaults(sheet.textContent||'')
  const avatar=shell.querySelector<HTMLElement>('.mochi-notification-avatar')!,img=avatar.querySelector('img')!
  expect(dom.window.getComputedStyle(avatar).width).toBe('32px');expect(dom.window.getComputedStyle(avatar).height).toBe('32px')
  expect(dom.window.getComputedStyle(img).objectFit).toBe('cover')
  expect(dom.window.getComputedStyle(shell.querySelector('.mochi-notification-toast')!).gridTemplateColumns).toBe('32px minmax(0,1fr)')
 }finally{first();second();dom.window.close();globalThis.document=prior}
})
