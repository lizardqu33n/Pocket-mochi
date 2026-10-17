import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
const out=resolve(process.env.MOCHI_CSS_OUTPUT||resolve(root,'tmp/mochi-css')),baseline=process.env.MOCHI_CSS_BASELINE
await mkdir(out,{recursive:true})
const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',resolve(root,'scripts/fixtures/mochi-default-v2.ts'),'--target=browser','--outfile='+resolve(out,'view.js')],{cwd:root,encoding:'utf8'})
assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic Mochi CSS comparison</title><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><div class="lumiphone-widget-root" id="app"></div><script src="view.js"></script>')
const themes={dark:{bg:'#191b24',surface:'#232530',text:'#f1edf9',border:'#ffffff22',muted:'#aaa4b9',accent:'#baa4ef'},light:{bg:'#f7f3fb',surface:'#eee7f5',text:'#261d31',border:'#261d3133',muted:'#6c6274',accent:'#8870bd'},custom:{bg:'#142d30',surface:'#204449',text:'#e7fbf5',border:'#80c9bd55',muted:'#9cc5be',accent:'#e7bc70'}}
const browser=await chromium.launch({headless:true,...(process.env.POCKET_BROWSER_PATH?{executablePath:process.env.POCKET_BROWSER_PATH}:{})}),results=[]
try{for(const width of process.env.MOCHI_CSS_EXAMPLES?[1280]:[1280,390,320])for(const [theme,colors]of Object.entries(themes).filter(([name])=>!process.env.MOCHI_CSS_EXAMPLES||name==='dark')){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
 await page.addInitScript(()=>{const OriginalDate=Date;globalThis.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:['2026-10-17T12:00:00Z']))}static now(){return new OriginalDate('2026-10-17T12:00:00Z').getTime()}}})
 const capture=async view=>{
  await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(60)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,view+' overflow')
  const name=`${theme}-${width}-${view}.png`,bytes=await page.screenshot({path:resolve(out,name)})
  if(baseline)assert.equal(bytes.equals(await readFile(resolve(baseline,name))),true,'Screenshot changed: '+name)
  results.push({theme,width,view,identical:baseline?true:null})
 }
 try{
  await page.goto(pathToFileURL(resolve(out,'index.html')).href)
  await page.evaluate(c=>{const host=document.documentElement;for(const [key,value]of Object.entries({'--lp-bg':c.bg,'--lp-surface':c.bg,'--lp-surface-1':c.bg,'--lp-surface-2':c.surface,'--lp-text':c.text,'--lp-border':c.border,'--lp-muted':c.muted,'--lp-accent':c.accent,'--lumiverse-bg':c.bg,'--lumiverse-bg-elevated':c.surface,'--lumiverse-text':c.text,'--lumiverse-border':c.border,'--lumiverse-primary':c.accent}))host.style.setProperty(key,value)},colors)
  await page.getByRole('button',{name:'Open conversation: Mochi Default v2 review',exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor()
  await capture('chat')
  const toolbar=page.locator('.mochi-room-header>.mochi-custom-toolbar'),more=page.getByLabel('Room options',{exact:true})
  const bounds=await toolbar.boundingBox(),info=await page.locator('.mochi-room-info').boundingBox(),end=await more.boundingBox()
  assert(bounds.y>=info.y+info.height-1,'toolbar must be below title/status')
  assert(end.x>=bounds.x&&end.x+end.width<=bounds.x+bounds.width+1,'More remains in toolbar bounds')
  assert.equal(await toolbar.evaluate(n=>getComputedStyle(n).flexWrap),'nowrap')
  const buttons=await toolbar.locator('.mochi-toolbar-shortcuts>button').all()
  for(const b of buttons){const r=await b.boundingBox();assert(Math.abs(r.y-end.y)<2,'shortcuts and More share one row');assert(r.height>=40&&r.width>=40,'touch target')}
  await more.focus();await page.keyboard.press('Enter')
  const sheet=page.locator('.lp-conversation-menu-sheet'),r=await sheet.boundingBox()
  assert(r&&r.x>=0&&r.x+r.width<=width+1&&r.y+r.height<=900,'menu inside viewport')
  await page.screenshot({path:resolve(out,`${theme}-${width}-toolbar-open.png`)})
  assert.equal(await sheet.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+22))}),true,'menu is not clipped')
  await page.keyboard.press('Escape');assert.equal(await page.locator('.lp-conversation-menu').evaluate(n=>n.open),false)
  assert.equal(await more.evaluate(n=>n===document.activeElement),true)
  await more.click();await page.getByLabel('Message',{exact:true}).focus();assert.equal(await page.locator('.lp-conversation-menu').evaluate(n=>n.open),false)

  if(process.env.MOCHI_CSS_EXAMPLES){
   const values=await page.evaluate(()=>{const bubble=getComputedStyle(document.querySelector('.mochi-bubble')),avatar=getComputedStyle(document.querySelector('.mochi-avatar-frame')),layout=getComputedStyle(document.querySelector('.mochi-desktop'));return{sidebar:layout.gridTemplateColumns.split(' ')[0],font:bubble.fontSize,radius:bubble.borderBottomLeftRadius,avatar:avatar.width}})
   assert.deepEqual(values,{sidebar:'280px',font:'16px',radius:'22px',avatar:'44px'});await writeFile(resolve(out,'owner-examples.json'),JSON.stringify(values,null,2));continue
  }
  // Exercise long, reordered, profile-scoped preferences without persisting fixture data.
  await page.evaluate(()=>{const f=window.__defaultFixture,p=f.view.personalSettings;window.__toolbarSaved=p.saved;p.saved={...p.saved,preferences:{...p.value,order:[...p.value.order].reverse(),hidden:['search'],presentation:'labels'}};f.view.redraw()})
  const labels=await toolbar.locator('.mochi-toolbar-shortcuts>button').evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label')))
  assert.deepEqual(labels,['Pins & Notes','Preview AI prompt','Conversation Memory','Presets','Chat Settings','Mochi notifications','Participants','Conversation details'])
  const glyphs=await toolbar.locator('.mochi-toolbar-shortcuts>button svg').evaluateAll(ns=>ns.map(n=>n.innerHTML));assert.equal(new Set(glyphs).size,glyphs.length,'distinct action artwork')
  assert.equal(await toolbar.locator('.mochi-toolbar-label').first().isVisible(),true,'saved labels remain visible on mobile')
  await toolbar.getByRole('button',{name:'Conversation details',exact:true}).focus()
  const fixed=await more.boundingBox();assert(fixed.x+fixed.width<=width+1,'More remains fixed with long labels')
  await more.click();await page.waitForTimeout(30);assert.equal(await sheet.getByRole('button',{name:'Search conversation',exact:true}).isVisible(),true,'hidden shortcut remains in More')
  await page.keyboard.press('Escape')
  await page.locator('.mochi-room-header').evaluate(n=>n.style.marginTop='530px')
  await more.click();await page.waitForTimeout(30)
  const edge=await sheet.boundingBox();assert(edge.y>=0&&edge.y+edge.height<=900,'menu flips above near bottom edge')
  assert.equal(await page.locator('.lp-conversation-menu').getAttribute('data-direction'),'up')
  await page.keyboard.press('Escape')
  await page.evaluate(()=>{window.__defaultFixture.view.personalSettings.saved=window.__toolbarSaved;window.__defaultFixture.view.redraw()})
  const menu=async name=>{await page.getByLabel('Room options',{exact:true}).click();await page.getByRole('button',{name,exact:true}).click()}
  await menu('Settings');await capture('settings');await page.getByRole('button',{name:'Availability & Schedules',exact:true}).click()
  await page.locator('details').filter({has:page.locator(':scope>summary',{hasText:'Background messaging'})}).locator(':scope>summary').click();await capture('background')
  await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
  await menu('Presets');await page.getByRole('button',{name:'Customize Mochi Default v2',exact:true}).waitFor();await capture('presets')
  await page.locator('.mochi-preset-binding>summary').click();await capture('dropdown')
  await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
  await menu('Preview AI prompt');await page.getByLabel('Prompt overview',{exact:true}).waitFor();await capture('preview')
  await page.locator('.mochi-preview-panel>details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));await capture('preview-expanded')
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
 }catch(error){await page.screenshot({path:resolve(out,'failure.png')});console.error(errors,await page.locator('body').innerText());throw error}finally{await page.close()}
}await writeFile(resolve(out,'comparison.json'),JSON.stringify(results,null,2));console.log(`${results.length} synthetic screenshots checked (${baseline?'exact PNG matches':'baseline captured'}); dark, light, custom; 1280/390/320px; no provider calls.`)
}finally{await browser.close()}
