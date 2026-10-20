// Synthetic source-composition layout regression; HTTP is blocked. Never mounts a real host.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
const require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||process.cwd()]}))
const baseline=process.argv.includes('--baseline'),out=resolve('tmp/postfix-ui',baseline?'baseline':'fixed')
await mkdir(out,{recursive:true})
const fixture=resolve(process.env.MOCHI_FIXTURE_ROOT||'.','scripts/fixtures/mochi-standalone.ts')
const build=spawnSync('bun',['build',fixture,'--target=browser','--outfile='+resolve(out,'view.js')],{encoding:'utf8'})
assert.equal(build.status,0,build.stderr)
// Model a constrained drawer, with drawer chrome above shortcuts, as in the host.
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui;background:#191b24;color:#eee}#drawer{position:relative;z-index:10;width:min(480px,100vw);height:100dvh;overflow:auto}.synthetic-widget{position:fixed}#owned-action{position:fixed;right:0;bottom:0;z-index:1000}*,*::before,*::after{animation:none!important;transition:none!important}</style><div id="drawer" hidden></div><script src="view.js"></script>')
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1280,390])for(const fallback of baseline?[false]:[false,true]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
 page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
 try{
  await page.goto(pathToFileURL(resolve(out,'index.html')).href+(fallback?'?fallback':''))
  await page.waitForFunction(()=>!!window.__mochiCore)
  assert.equal(await page.locator('.lumiphone-shell').count(),0)
  await page.locator('#owned-action').click()
  let edit=page.getByRole('button',{name:'Edit account Day worker',exact:true})
  await edit.waitFor()
  const box=async s=>{const r=await page.locator(s).boundingBox();assert.ok(r,s+' has no box');return r}
  const drawer=await box('#drawer'),picker=await box('.mochi-sidebar')
  await page.screenshot({path:resolve(out,`${width}-${fallback}-picker.png`)})
  await edit.click()
  const form=await box('.mochi-profile-screen')
  await page.screenshot({path:resolve(out,`${width}-${fallback}-editor.png`)})
  if(baseline){assert.ok(picker.width<drawer.width-60);assert.equal(form.width,0);results.push({width,picker,form,reproduced:true});continue}
  assert.ok(picker.width>=drawer.width-40,'picker must fill existing portal padding')
  assert.ok(form.width>=drawer.width-65,'editor must retain readable width')
  assert.ok(form.height>100)
  await page.waitForFunction(()=>document.activeElement?.textContent==='Edit Account')
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'INPUT')
  await page.keyboard.press('Escape')
  await edit.waitFor()
  // Exercise scrolling, cancel, and a reviewed synthetic profile write.
  await edit.click();await page.getByRole('button',{name:'Cancel profile changes',exact:true}).click();await edit.waitFor()
  await edit.click();await page.getByLabel('Profile display name',{exact:true}).fill('Day worker saved')
  await page.getByRole('button',{name:'Save profile',exact:true}).click()
  edit=page.getByRole('button',{name:'Edit account Day worker saved',exact:true});await edit.waitFor()
  await edit.click();assert.equal(await page.getByLabel('Profile display name',{exact:true}).inputValue(),'Day worker saved')
  await page.getByRole('button',{name:'Cancel profile changes',exact:true}).click()
  await page.getByRole('button',{name:'Use Mochi account Day worker saved',exact:true}).click()
  const open=page.locator('.mochi-sidebar-nav').getByRole('button',{name:'Open Mochi',exact:true})
  await open.click()
  const surface=fallback?'.mochi-sidebar-body':width===390?'.mochi-mobile-surface':'.mochi-window'
  await page.locator(surface).waitFor({state:'visible'})
  await page.getByRole('button',{name:'Open conversation: Independent messenger',exact:true}).click()
  await page.getByLabel('Message',{exact:true}).waitFor({state:'visible'})
  await page.screenshot({path:resolve(out,`${width}-${fallback}-messenger.png`)})
  if(fallback){
   assert.equal(await page.locator('#drawer').isVisible(),true);assert.match(await page.locator('[role=status]').allTextContents().then(v=>v.join(' ')),/unavailable/)
   for(let i=0;i<3;i++){
    await page.evaluate(()=>{window.__mochiCore.closeDrawer();window.__mochiCore.openDrawer()})
    await edit.waitFor();await open.click();await page.locator(surface).waitFor({state:'visible'})
    assert.equal(await page.locator('.mochi-sidebar-body .mochi-workspace').count(),1)
   }
  }
  else for(let i=0;i<3;i++){
   if(width===1280){await page.getByLabel('Mochi title bar',{exact:true}).focus();await page.keyboard.press('Escape')}
   else await page.getByRole('button',{name:'Close Mochi messenger',exact:true}).click()
   await page.locator('.mochi-launcher').click()
   await page.locator(surface).waitFor({state:'visible'})
   assert.equal(await page.locator(surface).count(),1)
  }
  assert.equal(await page.evaluate(()=>window.__mochiCore.providerCalls.length),0)
  if(fallback)await page.evaluate(()=>window.dispatchEvent(new Event('lumiverse:auth-session-invalid')))
  else await page.evaluate(()=>window.__mochiCore.changeOwner())
  assert.equal(await page.locator('.mochi-sidebar,.mochi-window,.mochi-mobile-surface,.mochi-launcher,#owned-action').count(),0)
  assert.equal(await page.evaluate(()=>window.__mochiCore.frontend.size),0)
  await page.evaluate(()=>{window.__mochiCore.dispose();window.__mochiCore.dispose()})
  assert.deepEqual(errors,[])
  results.push({width,fallback,picker,form,providerCalls:0,passed:true})
 }finally{await page.close()}
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))}finally{await browser.close()}
