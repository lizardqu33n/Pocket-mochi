import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tmp/phase3-production'),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
await mkdir(out,{recursive:true})
const build=spawnSync('bun',['build','scripts/fixtures/mochi-default-v2.ts','--target=browser','--outfile='+resolve(out,'app.js')],{cwd:root,encoding:'utf8'});assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}</style><div class="lumiphone-widget-root" id="app"></div><script src="app.js"></script>')
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1280,390,320]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),requests=[],errors=[]
 page.setDefaultTimeout(10000);await page.route(/^https?:/,r=>{requests.push(r.request().url());return r.abort()});page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.goto(pathToFileURL(resolve(out,'index.html')).href);await page.getByRole('button',{name:'Open conversation: Mochi Default v2 review',exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor()
  const rail=page.locator('.mochi-toolbar-shortcuts'),more=page.getByLabel('Room options',{exact:true})
  for(const b of await rail.locator('button').all()){const r=await b.boundingBox();assert(r.width>=40&&r.height>=40,'existing toolbar touch target');assert(await b.getAttribute('aria-label'))}
  for(const b of await page.locator('.mochi-header-controls button').all()){const r=await b.boundingBox();assert(r.width>=24&&r.height>=24,'header pointer target');assert(await b.getAttribute('aria-label'))}
  await more.focus();await page.keyboard.press('Enter');await page.locator('.lp-conversation-menu-sheet').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(await more.evaluate(n=>n===document.activeElement),true)
  const presets=page.getByRole('button',{name:'Presets',exact:true}),slot=presets.locator('[data-mochi-icon-action=toolbar-presets]'),before=await presets.boundingBox()
  await slot.evaluate(n=>n.style.setProperty('--mochi-icon-toolbar-presets-size','8px'));assert.equal(await slot.evaluate(n=>getComputedStyle(n).width),'8px');const after=await presets.boundingBox();assert.equal(after.width,before.width);assert.equal(after.height,before.height)
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#9866cc"/></svg>'
  await slot.evaluate((n,url)=>{n.style.setProperty('--mochi-icon-toolbar-presets-image',`url("${url}")`);n.dispatchEvent(new Event('mochi:icons-refresh'))},'data:image/svg+xml,'+encodeURIComponent(svg))
  await slot.locator('img').waitFor({state:'visible'});assert.equal(await presets.getAttribute('aria-label'),'Presets');assert.equal(await slot.locator('svg').isVisible(),false)
  const snapshot=await page.locator('#app').ariaSnapshot();assert(snapshot.includes('button "Presets"'));assert(snapshot.includes('button "Search conversation"'));await writeFile(resolve(out,`${width}-accessible-names.yml`),snapshot)
  await presets.click();await page.getByRole('button',{name:'Customize Mochi Default v2',exact:true}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0);assert.deepEqual(requests,[]);assert.deepEqual(errors,[])
  results.push({width,toolbarTargetsAtLeast40:true,headerTargetsAtLeast24:true,keyboardMenuFocus:true,replacementPreservesPointerAndName:true,noProviderOrHTTPRequests:true})
 }finally{await page.close()}
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log('Production icon controls pass at 1280/390/320px: target sizes, menu keyboard/focus, CSS replacement with preserved action/name, no overflow, no provider or HTTP requests.')
}finally{await browser.close()}
