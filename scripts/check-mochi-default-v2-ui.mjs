import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'

const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
const output=resolve(process.env.MOCHI_DEFAULT_OUTPUT||resolve(root,'tmp/mochi-default-v2'))
await mkdir(output,{recursive:true})
const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',resolve(root,'scripts/fixtures/mochi-default-v2.ts'),'--target=browser','--outfile='+resolve(output,'view.js')],{cwd:root,encoding:'utf8'})
assert.equal(build.status,0,build.stderr)
await writeFile(resolve(output,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic Mochi Default v2</title><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;--lp-bg:#191b24;--lp-surface:#191b24;--lp-surface-2:#232530;--lp-text:#f1edf9;--lp-border:#ffffff22;--lp-muted:#aaa4b9;--lp-accent:#baa4ef}button,input,select,textarea{font:inherit}</style><div class="lumiphone-widget-root" id="app"></div><script src="view.js"></script>')
const browser=await chromium.launch({headless:true,...(process.env.POCKET_BROWSER_PATH?{executablePath:process.env.POCKET_BROWSER_PATH}:{})}),observations=[]
try{
 for(const width of [1280,390,320]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
  page.setDefaultTimeout(10000)
  page.on('pageerror',e=>errors.push(e.message))
  // Guard against accidental external traffic from this file-based synthetic fixture.
  await page.route(/^https?:/,route=>route.abort())
  try{
  await page.goto(pathToFileURL(resolve(output,'index.html')).href)
  await page.getByRole('button',{name:'Open conversation: Mochi Default v2 review',exact:true}).click()
  try{await page.getByLabel('Message',{exact:true}).waitFor()}catch(error){await page.screenshot({path:resolve(output,`failure-${width}.png`)});console.error(errors,await page.locator('body').innerText());throw error}
  assert.equal(await page.evaluate(()=>window.__defaultFixture.room.preset.id),'mochi_default_v2')
  const menu=async name=>{await page.getByLabel('Room options',{exact:true}).click();await page.getByRole('button',{name,exact:true}).click()}
  const checkLayout=async()=>{
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Page must not overflow')
   assert.equal(await page.locator('.mochi-disclosure>summary').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height<=48)),true,'Dropdown headers stay one line')
   assert.equal(await page.locator('.mochi-disclosure>summary').evaluateAll(nodes=>nodes.every(n=>parseFloat(getComputedStyle(n,'::after').borderRightWidth)>0)),true,'Dropdown chevrons remain visible')
  }
  await menu('Presets');await page.getByRole('button',{name:'Customize Mochi Default v2',exact:true}).waitFor()
  await page.locator('.mochi-preset-entry').getByText('Core Instructions · 3 blocks',{exact:true}).click()
  await checkLayout();await page.screenshot({path:resolve(output,`preset-${width}.png`)})
  const binding=page.locator('.mochi-preset-binding>summary');await binding.focus();await page.keyboard.press('Enter');assert.equal(await binding.evaluate(n=>n.parentElement.open),true)
  assert.equal(await binding.evaluate(n=>document.activeElement===n),true)
  await binding.press('Space');assert.equal(await binding.evaluate(n=>n.parentElement.open),false)
  await page.getByRole('button',{name:'Customize Mochi Default v2',exact:true}).click()
  await page.getByLabel('Edit block Base Messaging',{exact:true}).waitFor()
  await page.getByLabel('Edit block Base Messaging',{exact:true}).click()
  await page.getByLabel('Block content',{exact:true}).fill('Synthetic editable copy. Preserve all supplied context.')
  await checkLayout();await page.screenshot({path:resolve(output,`customize-${width}.png`)})
  assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
  assert.equal(await page.evaluate(()=>window.__defaultFixture.view.state.rooms[0].preset.id),'mochi_default_v2')
  await page.getByRole('button',{name:'Back to Blocks',exact:true}).click()
  await page.getByRole('button',{name:'Publish preset revision',exact:true}).click()
  await page.getByText('Library saved. Applying a revision to this chat is a separate action.',{exact:true}).waitFor()
  assert.equal(await page.evaluate(()=>window.__defaultFixture.view.state.rooms[0].preset.id),'mochi_default_v2')
  const copyId=await page.evaluate(async()=>{const f=window.__defaultFixture;return(await f.service.presets.read('synthetic-user',f.account.id)).presets[0].id})
  const apply=async id=>{const summary=page.locator('.mochi-preset-binding>summary');if(!await summary.evaluate(n=>n.parentElement.open))await summary.click();await page.getByLabel('Preset to apply',{exact:true}).selectOption(id);await page.getByRole('button',{name:'Apply selected preset',exact:true}).click();await page.getByRole('button',{name:'Confirm apply preset',exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor()}
  await apply(copyId)
  assert.equal(await page.evaluate(()=>window.__defaultFixture.view.state.rooms[0].preset.revision),2)
  await menu('Presets');await page.getByLabel('Preset to apply',{exact:true}).waitFor({state:'attached'});await apply('mochi_default_v2')
  await menu('Preview AI prompt');await page.getByLabel('Prompt overview',{exact:true}).waitFor()
  assert.ok(await page.locator('.mochi-preview-panel').evaluate(n=>n.getBoundingClientRect().width>=innerWidth-60),'Preview uses the full workspace')
  const original=await page.evaluate(()=>JSON.stringify(window.__defaultFixture.files.get('synthetic-user:mochi/v1/rooms/'+window.__defaultFixture.room.id+'.json')))
  await checkLayout();await page.screenshot({path:resolve(output,`preview-${width}.png`)})
  const advanced=page.locator('.mochi-preview-panel>details').filter({has:page.locator(':scope>summary',{hasText:'Advanced diagnostics'})})
  await advanced.locator(':scope>summary').click();assert.ok((await advanced.textContent()).includes('Synthetic counter'))
  // Open all resolved content and verify the text nodes retain the whole payload.
  await page.locator('.mochi-preview-panel details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true))
  const previewRequest=await page.evaluate(()=>window.__defaultFixture.requests.filter(r=>r.type==='mochi:preview').at(-1))
  assert.ok(previewRequest);await checkLayout();await page.screenshot({path:resolve(output,`preview-expanded-${width}.png`)})
  assert.equal(await page.evaluate(()=>JSON.stringify(window.__defaultFixture.files.get('synthetic-user:mochi/v1/rooms/'+window.__defaultFixture.room.id+'.json'))),original)
  await page.getByRole('button',{name:'Close preview',exact:true}).click()
  await menu('Settings');await page.getByRole('button',{name:'Availability & Schedules',exact:true}).click()
  const background=page.locator('details').filter({has:page.locator(':scope>summary',{hasText:'Background messaging'})})
  assert.equal(await background.evaluate(n=>n.open),false);await background.locator(':scope>summary').click();assert.equal(await background.evaluate(n=>n.open),true)
  assert.equal(await page.getByLabel('This Lumiverse login: allow background messaging (applies now)',{exact:true}).isChecked(),false)
  assert.equal(await page.getByLabel('This conversation: allow scheduled messages (applies now)',{exact:true}).isChecked(),false)
  await checkLayout();await page.screenshot({path:resolve(output,`background-${width}.png`)})
  await page.locator('#app').evaluate(n=>{n.style.setProperty('--lp-bg','#f7f3fb');n.style.setProperty('--lp-surface','#f7f3fb');n.style.setProperty('--lp-surface-2','#eee7f5');n.style.setProperty('--lp-text','#261d31');n.style.setProperty('--lp-border','#261d3133');n.style.setProperty('--lp-muted','#6c6274')})
  await page.screenshot({path:resolve(output,`background-light-${width}.png`)})
  await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
  await page.evaluate(()=>{const f=window.__defaultFixture;f.view.select('');f.view.load()})
  await page.getByRole('button',{name:'New Chat',exact:true}).click()
  assert.equal(await page.getByLabel('Initial preset',{exact:true}).inputValue(),'mochi_default_v2')
  await page.getByLabel('Room name',{exact:true}).fill('Created through the browser')
  await page.getByRole('button',{name:'Synthetic Rowan',exact:true}).click()
  await page.screenshot({path:resolve(output,`new-conversation-${width}.png`)})
  await page.getByRole('button',{name:'Create room',exact:true}).click()
  await page.getByLabel('Message',{exact:true}).waitFor()
  assert.equal(await page.evaluate(()=>window.__defaultFixture.view.state.rooms.find(r=>r.title==='Created through the browser').preset.id),'mochi_default_v2')
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
  observations.push({width,defaultV2:true,newConversationUI:true,editableCopy:true,publishSeparateFromApply:true,explicitApplyAndRestore:true,previewReadOnly:true,keyboard:true,backgroundOptIn:true,overflow:false,pageErrors:errors})
  }catch(error){await page.screenshot({path:resolve(output,`failure-${width}.png`)});console.error(errors,await page.locator('body').innerText());throw error}finally{await page.close()}
 }
 await writeFile(resolve(output,'browser-results.json'),JSON.stringify(observations,null,2))
 console.log('Mochi Default v2 synthetic Chromium checks passed at 1280, 390 and 320px; no provider requests.')
}finally{await browser.close()}
