// Supplemental pixel comparison. The original CSS acceptance script is also run
// unchanged and its baseline failures are reported separately, never hidden here.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
const require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||process.cwd()]}))
const root=resolve(process.argv[2]||'.'),out=resolve(process.argv[3]||'evidence/snapshots'),baseline=process.argv[4]&&resolve(process.argv[4])
await mkdir(out,{recursive:true})
const build=spawnSync('bun',['build',resolve(root,'scripts/fixtures/mochi-default-v2.ts'),'--target=browser','--outfile='+resolve(out,'view.js')],{cwd:root,encoding:'utf8'})
assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><div class="lumiphone-widget-root" id="app"></div><script src="view.js"></script>')
const themes={dark:{bg:'#191b24',surface:'#232530',text:'#f1edf9',border:'#ffffff22',muted:'#aaa4b9',accent:'#baa4ef'},light:{bg:'#f7f3fb',surface:'#eee7f5',text:'#261d31',border:'#261d3133',muted:'#6c6274',accent:'#8870bd'},custom:{bg:'#142d30',surface:'#204449',text:'#e7fbf5',border:'#80c9bd55',muted:'#9cc5be',accent:'#e7bc70'}}
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{
  for(const width of [1280,390])for(const [theme,c] of Object.entries(themes)){
    const page=await browser.newPage({viewport:{width,height:900}})
    page.setDefaultTimeout(10000)
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
    await page.addInitScript(()=>{const OriginalDate=Date;globalThis.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:['2026-10-17T12:00:00Z']))}static now(){return new OriginalDate('2026-10-17T12:00:00Z').getTime()}}})
    const capture=async(view)=>{
      await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(80)
      const name=`${theme}-${width}-${view}.png`,bytes=await page.screenshot({path:resolve(out,name)})
      if(baseline)assert(bytes.equals(await readFile(resolve(baseline,name))),'Pixel change: '+name)
      results.push({name,identical:baseline?true:null})
    }
    try{
      await page.goto(pathToFileURL(resolve(out,'index.html')).href)
      await page.evaluate(c=>{for(const [key,value]of Object.entries({'--lp-bg':c.bg,'--lp-surface':c.bg,'--lp-surface-1':c.bg,'--lp-surface-2':c.surface,'--lp-text':c.text,'--lp-border':c.border,'--lp-muted':c.muted,'--lp-accent':c.accent,'--lumiverse-bg':c.bg,'--lumiverse-bg-elevated':c.surface,'--lumiverse-text':c.text,'--lumiverse-border':c.border,'--lumiverse-primary':c.accent}))document.documentElement.style.setProperty(key,value)},c)
      await page.getByRole('button',{name:'Open conversation: Mochi Default v2 review',exact:true}).click()
      await page.getByLabel('Message',{exact:true}).waitFor();await capture('messenger')
      const menu=async name=>{await page.getByLabel('Room options',{exact:true}).click();await page.locator('.lp-conversation-menu-sheet').getByRole('button',{name,exact:true}).click()}
      await menu('Settings');await capture('settings')
      await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
      await menu('Presets');await page.getByRole('button',{name:'Customize Mochi Default v2',exact:true}).waitFor();await capture('presets')
      await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
      await menu('Conversation Memory');await capture('memory')
      await menu('Preview AI prompt');await page.getByLabel('Prompt overview',{exact:true}).waitFor();await capture('preview')
      assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
    }finally{await page.close()}
  }
  await writeFile(resolve(out,'comparison.json'),JSON.stringify(results,null,2)+'\n')
  console.log(`${results.length} synthetic screenshots; 390/1280px; dark/light/custom; zero provider calls; ${baseline?'all pixel-identical':'baseline captured'}.`)
}finally{await browser.close()}
