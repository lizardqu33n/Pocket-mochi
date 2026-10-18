// Synthetic production-source checks. No host source, installation or provider.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const project=fileURLToPath(new URL('../',import.meta.url)),source=resolve(process.env.MOCHI_THEME_SOURCE||project)
const out=resolve(process.env.MOCHI_THEME_OUTPUT||resolve(project,'tmp/theme-contract')),baseline=process.env.MOCHI_THEME_BASELINE
const require=createRequire(import.meta.url),{chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||project]}))
await mkdir(out,{recursive:true})
for(const [name,fixture]of [['accounts','mochi-native-theme-ui'],['chat','mochi-default-v2']]){
 const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',resolve(source,'scripts/fixtures/'+fixture+'.ts'),'--target=browser','--outfile='+resolve(out,name+'.js')],{cwd:source,encoding:'utf8'})
 assert.equal(build.status,0,build.stderr)
 await writeFile(resolve(out,name+'.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><div id="app" class="lumiphone-widget-root"></div><script src="${name}.js"></script>`)
}
const themes={dark:['#191b24','#232530','#f1edf9','#aaa4b9','#baa4ef'],light:['#f7f3fb','#eee7f5','#261d31','#6c6274','#8870bd'],brown:['#2c211b','#3d3026','#fff2e2','#cfbda8','#e8bc83'],purple:['#292032','#382b45','#f7efff','#c5b4d6','#c5a3ed']}
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1280,390,320])for(const [theme,c]of Object.entries(themes))for(const scene of ['accounts','chat']){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.setDefaultTimeout(12000)
 page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
 await page.addInitScript(()=>{const OriginalDate=Date;globalThis.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:['2026-10-17T12:00:00Z']))}static now(){return new OriginalDate('2026-10-17T12:00:00Z').getTime()}}})
 const capture=async name=>{
  await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(60)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' overflow')
  const filename=`${theme}-${width}-${name}.png`,bytes=await page.screenshot({path:resolve(out,filename)})
  if(baseline&&!name.includes('css-zoom'))assert(bytes.equals(await readFile(resolve(baseline,filename))),'Default appearance changed: '+filename)
  results.push({theme,width,scene:name,identical:baseline&&!name.includes('css-zoom')?true:null})
 }
 try{
  await page.goto(pathToFileURL(resolve(out,scene+'.html')).href)
  await page.evaluate(c=>{for(const [k,v]of Object.entries({'--lp-bg':c[0],'--lp-surface':c[0],'--lp-surface-2':c[1],'--lp-text':c[2],'--lp-muted':c[3],'--lp-accent':c[4],'--lp-border':'#8886','--lumiverse-bg':c[0],'--lumiverse-bg-deep':c[0],'--lumiverse-bg-elevated':c[1],'--lumiverse-text':c[2],'--lumiverse-text-muted':c[3],'--lumiverse-primary':c[4],'--lumiverse-border':'#8886'}))document.documentElement.style.setProperty(k,v)},c)
  if(scene==='accounts'){
   await page.getByLabel('Edit account Alex',{exact:true}).waitFor();await capture('accounts-list')
   await page.getByLabel('Show grid',{exact:true}).click();await capture('accounts-grid')
   await page.getByLabel('Show list',{exact:true}).click();await page.getByLabel('Edit account Alex',{exact:true}).click()
   await page.getByLabel('Profile display name',{exact:true}).waitFor();await capture('account-editor')
   // Low-specificity public tokens override defaults even when defaults are
   // inserted later. A theme cannot change saved identities by styling controls.
   if(!process.env.MOCHI_THEME_ORIGINAL){
    const before=await page.evaluate(()=>JSON.stringify([...window.__defaultFixture.files]))
    await page.addStyleTag({content:'.mochi-sidebar,.mochi-sidebar .mochi-view {--mochi-accounts-preview-avatar-size:54px;--mochi-accounts-field-padding:11px;--mochi-input-bg:rgb(42, 43, 44)}'})
    await page.getByLabel('Profile display name',{exact:true}).focus()
    assert.equal(await page.getByLabel('Profile display name',{exact:true}).evaluate(n=>getComputedStyle(n).paddingTop),'11px')
    assert.equal(await page.getByLabel('Profile display name',{exact:true}).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(42, 43, 44)')
    assert.equal(await page.evaluate(()=>JSON.stringify([...window.__defaultFixture.files])),before)
    const sentinel=await page.evaluate(()=>{const n=document.createElement('input');n.id='unrelated';document.body.append(n);return getComputedStyle(n).paddingTop})
    assert.notEqual(sentinel,'11px','theme leaked into unrelated controls')
    assert.equal(await page.getByRole('button',{name:'Save profile',exact:true}).count(),1)
   }
  }else{
   await page.getByRole('button',{name:'Open conversation: Mochi Default v2 review',exact:true}).click()
   await page.getByLabel('Message',{exact:true}).waitFor();await capture('chat')
   if(!process.env.MOCHI_THEME_ORIGINAL){
    await page.addStyleTag({content:'.mochi-view {--mochi-bubble-radius:17px;--mochi-chat-font-size:18px} .mochi-view [data-mochi-icon] {--mochi-icon-stroke-width:2.5}'})
    assert.equal(await page.locator('.mochi-bubble').first().evaluate(n=>getComputedStyle(n).fontSize),'18px')
    const svg=page.locator('[data-mochi-icon]').first();if(await svg.count())assert.equal(await svg.evaluate(n=>getComputedStyle(n).strokeWidth),'2.5px')
    assert.equal(await page.getByLabel('Message',{exact:true}).isEditable(),true)
    // CSS zoom tests reflow; browser-level zoom and OS assistive technology
    // remain explicit owner acceptance checks.
    if(width===1280){await page.evaluate(()=>document.documentElement.style.zoom='2');await capture('chat-css-zoom-200')}
   }
  }
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
 }finally{await page.close()}
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log(`${results.length} screenshots; dark/light/brown/purple; 1280/390/320; scoped overrides and no provider calls.`)
}finally{await browser.close()}
