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
 const entry=resolve(out,name+'-entry.ts')
 await writeFile(entry,`import ${JSON.stringify(resolve(source,'scripts/fixtures/'+fixture+'.ts').replaceAll('\\','/'))};import {showMochiNotification} from ${JSON.stringify(resolve(source,'src/mochi/notifications.ts').replaceAll('\\','/'))};Object.assign(window,{__themeToast:()=>showMochiNotification(document.getElementById('app')!,{id:'synthetic',roomId:'synthetic',title:'Synthetic Rowan',roomTitle:'Theme preview',body:'Synthetic notification',avatarUrl:''} as any,true,()=>{})});`)
 const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',entry,'--target=browser','--outfile='+resolve(out,name+'.js')],{cwd:source,encoding:'utf8'})
 assert.equal(build.status,0,build.stderr)
 await writeFile(resolve(out,name+'.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><div id="app" class="lumiphone-widget-root"></div><script src="${name}.js"></script>`)
}
const themes={dark:['#191b24','#232530','#f1edf9','#aaa4b9','#baa4ef'],light:['#f7f3fb','#eee7f5','#261d31','#6c6274','#8870bd'],brown:['#2c211b','#3d3026','#fff2e2','#cfbda8','#e8bc83'],purple:['#292032','#382b45','#f7efff','#c5b4d6','#c5a3ed']}
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
const widths=process.env.MOCHI_THEME_WIDTHS?.split(',').map(Number)||[1280,390,320]
const colors=process.env.MOCHI_THEME_COLORS?.split(',')||Object.keys(themes)
try{for(const width of widths)for(const [theme,c]of Object.entries(themes).filter(([name])=>colors.includes(name)))for(const scene of ['accounts','chat']){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.setDefaultTimeout(12000)
 page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
 await page.addInitScript(()=>{const OriginalDate=Date;globalThis.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:['2026-10-17T12:00:00Z']))}static now(){return new OriginalDate('2026-10-17T12:00:00Z').getTime()}}})
 const capture=async(name,keepFocus=false)=>{
  if(!keepFocus)await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(60)
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
   if(process.env.MOCHI_THEME_EXTENDED){
    const menu=async name=>{await page.getByLabel('Room options',{exact:true}).click();await page.locator('.lp-conversation-menu-sheet').getByRole('button',{name,exact:true}).click()}
    const category=async(name,kind='Chat')=>{
     const back=page.getByRole('button',{name:`Back to ${kind} categories`,exact:true});if(await back.isVisible())await back.click()
     await page.getByRole('navigation',{name:`${kind} settings categories`,exact:true}).getByRole('button',{name,exact:true}).click()
    }
    await page.locator('.mochi-header-controls').getByLabel('Mochi notifications',{exact:true}).hover();await capture('hover')
    await page.getByLabel('Message',{exact:true}).focus();await capture('focus',true)
    await page.locator('.mochi-bubble').first().click();await capture('message-selected')
    await page.locator('.mochi-bubble').first().click()
    const profile=page.getByRole('button',{name:'Character profile',exact:true});if(await profile.getAttribute('aria-expanded')!=='true')await profile.click();await capture('character-profile')
    if(width<640)await page.getByRole('button',{name:'Close character profile',exact:true}).click()
    await menu('Pins & Notes');await page.locator('dialog[open]').waitFor();await capture('dialog');await page.getByRole('button',{name:'Done',exact:true}).click()
    await menu('Settings')
    for(const name of ['General','AI & Replies','Characters & Texting','Availability & Schedules','Memory & Context','Advanced']){
     await category(name);await capture('settings-'+name.toLowerCase().replaceAll(/[^a-z]+/g,'-'))
     if(name==='Characters & Texting'){
      await page.getByLabel('Edit character 1: Synthetic Rowan',{exact:true}).click();await capture('character-editor')
      await page.getByRole('button',{name:'Return to conversation',exact:true}).click();await menu('Settings')
     }
    }
    await page.getByRole('navigation',{name:'Settings workspace',exact:true}).getByRole('button',{name:'Personal',exact:true}).click()
    for(const name of ['Appearance','Toolbar','Notifications','Accessibility','General']){await category(name,'Personal');await capture('personal-'+name.toLowerCase())}
    await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
    await menu('Presets');await page.getByRole('button',{name:'Customize Mochi Default v2',exact:true}).waitFor();await capture('presets')
    await page.locator('.mochi-preset-binding>summary').click();await capture('preset-dropdown')
    await page.getByRole('button',{name:'Create preset',exact:true}).click();await page.locator('.mochi-block-editor').waitFor();await capture('preset-block-editor')
    await page.evaluate(()=>{window.__defaultFixture.view.presetPanel.reset();window.__defaultFixture.view.redraw()})
    await menu('Preview AI prompt');await page.getByLabel('Prompt overview',{exact:true}).waitFor();await capture('prompt-preview')
    await page.locator('.mochi-preview-panel>details').evaluateAll(ns=>ns.forEach(n=>n.open=true));await capture('prompt-expanded')
    await page.getByRole('button',{name:'Close preview',exact:true}).click()
    await page.evaluate(()=>{window.__dismissThemeToast=window.__themeToast()});await capture('notification-toast');await page.evaluate(()=>window.__dismissThemeToast())
    await page.getByLabel('Room options',{exact:true}).click();await capture('menu-open');await page.keyboard.press('Escape')
    await page.evaluate(()=>{const v=window.__defaultFixture.view;v.error='Synthetic validation message';v.busy=true;v.redraw()});await capture('error-disabled')
    await page.evaluate(()=>{const v=window.__defaultFixture.view;v.error='';v.busy=false;window.__themeState=v.state;window.__themeRoom=v.roomId;v.state={...v.state,rooms:[]};v.roomId='';v.redraw()});await capture('empty')
    await page.evaluate(()=>{const v=window.__defaultFixture.view;v.state=null;v.busy=true;v.redraw()});await capture('loading')
    await page.evaluate(()=>{const v=window.__defaultFixture.view;v.state=window.__themeState;v.roomId=window.__themeRoom;v.busy=false;v.redraw()})
    if(!process.env.MOCHI_THEME_ORIGINAL){
     const theme=await page.addStyleTag({content:'.mochi-view {--mochi-sidebar-width:360px;--mochi-composer-height:64px;--mochi-menu-max-height:150px;--mochi-v2-settings-heading-padding:24px 32px;--mochi-v2-settings-heading-container-max-width-550px-padding:24px 32px;--mochi-v2-settings-heading-container-max-width-650px-padding:24px 32px} .mochi-sheet {--mochi-v2-shared-sheet-width:280px;--mochi-dialog-width:280px;--mochi-v2-sheet-sheet-panel-background:rgb(3,4,5)} .mochi-notification-toast {--mochi-v2-shared-floating-notification-background:rgb(1,2,3)}'})
     if(width===1280)assert.equal(Math.round((await page.locator('.mochi-desktop-list').boundingBox()).width),360)
     await page.getByLabel('Message',{exact:true}).fill('Synthetic multiline draft. '.repeat(40))
     assert.equal(await page.getByLabel('Message',{exact:true}).evaluate(n=>getComputedStyle(n).height),'64px');await page.getByLabel('Message',{exact:true}).fill('')
     await page.getByLabel('Room options',{exact:true}).click();await page.locator('[data-mochi-slot=conversation-menu]').waitFor();assert((await page.locator('.lp-conversation-menu-sheet').boundingBox()).height<=151);await page.keyboard.press('Escape')
     await menu('Settings');await category('General');assert.equal(await page.locator('.mochi-settings-heading').evaluate(n=>getComputedStyle(n).paddingTop),'24px')
     await page.getByRole('button',{name:'Return to conversation',exact:true}).click()
     await menu('Pins & Notes');assert.equal(Math.round((await page.locator('dialog[open]').boundingBox()).width),280);assert.equal(await page.locator('dialog[open] .lp-sheet-panel').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(3, 4, 5)');await page.getByRole('button',{name:'Done',exact:true}).click()
     await page.evaluate(()=>{window.__dismissThemeToast=window.__themeToast()});assert.equal(await page.locator('.mochi-notification-toast').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(1, 2, 3)');await page.evaluate(()=>window.__dismissThemeToast())
     await theme.evaluate(n=>n.remove())
    }
   }
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
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log(`${results.length} screenshots; ${colors.join('/')}; ${widths.join('/')}px; scoped overrides and no provider calls.`)
}finally{await browser.close()}
