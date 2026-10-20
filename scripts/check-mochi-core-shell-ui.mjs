import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
const require=createRequire(import.meta.url),{chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||process.cwd()]}))
const out=resolve('evidence/shell-ui');await mkdir(out,{recursive:true})
const build=spawnSync('bun',['build','scripts/fixtures/mochi-standalone.ts','--target=browser','--outfile='+resolve(out,'view.js')],{encoding:'utf8'})
assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:var(--lumiverse-bg);color:var(--lumiverse-text);font:14px system-ui}#drawer{width:100%;height:100dvh;overflow:auto}.synthetic-widget{position:fixed}#owned-action{position:fixed;right:0;bottom:0;z-index:1000}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><div id="drawer" hidden></div><script src="view.js"></script>')
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1280,390])for(const theme of ['dark','light']){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
  page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
  try{
    await page.goto(pathToFileURL(resolve(out,'index.html')).href);await page.waitForFunction(()=>!!window.__mochiCore)
    await page.evaluate(theme=>{for(const [key,value]of Object.entries(theme==='dark'?{'--lumiverse-bg':'#191b24','--lumiverse-bg-deep':'#191b24','--lumiverse-bg-elevated':'#232530','--lumiverse-text':'#f1edf9','--lumiverse-text-muted':'#aaa4b9','--lumiverse-border':'#ffffff22','--lumiverse-primary':'#baa4ef'}:{'--lumiverse-bg':'#f7f3fb','--lumiverse-bg-deep':'#f7f3fb','--lumiverse-bg-elevated':'#eee7f5','--lumiverse-text':'#261d31','--lumiverse-text-muted':'#6c6274','--lumiverse-border':'#261d3133','--lumiverse-primary':'#8870bd'}))document.documentElement.style.setProperty(key,value)},theme)
    const capture=async view=>{const name=`${theme}-${width}-${view}.png`;await page.screenshot({path:resolve(out,name)});results.push(name)}
    assert.equal(await page.locator('.mochi-launcher').count(),1)
    await page.locator('#owned-action').click();await page.getByRole('button',{name:'Use Mochi account Day worker',exact:true}).waitFor();await capture('accounts-launcher')
    await page.getByRole('button',{name:'Use Mochi account Day worker',exact:true}).click()
    await page.waitForFunction(()=>!!document.querySelector('.mochi-sidebar [aria-label="Open Mochi"]:not([disabled]),.mochi-sidebar button:not([disabled])'))
    await page.locator('#owned-action').click();await page.getByRole('button',{name:'Open conversation: Independent messenger',exact:true}).waitFor()
    await page.getByRole('button',{name:'Open conversation: Independent messenger',exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor();await capture('messenger')
    assert.equal(await page.locator(width===390?'.mochi-mobile-surface':'.mochi-window').count(),1)
    assert.equal(await page.locator('.lumiphone-shell').count(),0)
    assert.equal(await page.evaluate(()=>window.__mochiCore.providerCalls.length),0)
    await page.evaluate(()=>window.dispatchEvent(new Event('lumiverse:auth-session-invalid')))
    assert.equal(await page.locator('.mochi-window,.mochi-mobile-surface,.mochi-launcher,#owned-action').count(),0)
    assert.equal(await page.evaluate(()=>window.__mochiCore.frontend.size),0);assert.deepEqual(errors,[])
  }finally{await page.close()}
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log(`${results.length} independent shell screenshots; day/night accounts; desktop/mobile; dark/light; auth cleanup; zero provider calls.`)}finally{await browser.close()}
