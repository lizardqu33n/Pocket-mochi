import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
const project=fileURLToPath(new URL('../',import.meta.url)),root=process.env.MOCHI_THEME_SOURCE||project
const host=process.env.MOCHI_LUMIVERSE_SOURCE||resolve(project,'../Lumiverse'),out=resolve(process.env.MOCHI_THEME_OUTPUT||resolve(project,'tmp/mochi-native-theme'))
const before=process.env.MOCHI_THEME_BEFORE==='1',bun=process.env.MOCHI_BUN||'bun',require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||project]}))
await mkdir(out,{recursive:true})
const build=(args,cwd)=>{const result=spawnSync(bun,['build',...args],{cwd,encoding:'utf8'});assert.equal(result.status,0,result.stderr)}
build([resolve(host,'frontend/src/theme/engine.ts'),'--target=bun','--format=esm','--tsconfig-override='+resolve(host,'frontend/tsconfig.json'),'--outfile='+resolve(out,'native-engine.mjs')],host)
const {generateThemeVariables}=await import(pathToFileURL(resolve(out,'native-engine.mjs')).href)
const config={id:'synthetic-native',name:'Synthetic native',mode:'dark',accent:{h:263,s:55,l:65},enableGlass:false,fontScale:1,radiusScale:1}
const themes={dark:generateThemeVariables(config,'dark'),light:generateThemeVariables({...config,mode:'light'},'light'),purple:generateThemeVariables({...config,baseColorsByMode:{dark:{background:'#292032',backgroundDeep:'#130e1a',primary:'#c5a3ed',text:'#f7efff'}}},'dark')}
await writeFile(resolve(out,'native-themes.json'),JSON.stringify(themes,null,2))
const nativeFiles={editor:'components/panels/persona-browser/PersonaEditor.module.css',form:'components/shared/FormComponents.module.css',addon:'components/modals/PersonaAddonsModal.module.css'},sourceHashes={}
let nativeCSS=''
for(const [prefix,name]of Object.entries(nativeFiles)){
 const css=await readFile(resolve(host,'frontend/src',name),'utf8');sourceHashes[name]=createHash('sha256').update(css).digest('hex')
 await writeFile(resolve(out,'native-'+prefix+'.css'),css)
 nativeCSS+=css.replace(/\.([a-zA-Z_][\w-]*)/g,(_m,name)=>'.native-'+prefix+'-'+name)+'\n'
}
build([resolve(root,'scripts/fixtures/mochi-native-theme-ui.ts'),'--target=browser','--outfile='+resolve(out,'view.js')],root)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:13px system-ui;background:var(--lumiverse-bg-deep);color:var(--lumiverse-text)}#app{width:min(420px,100%);height:100dvh;min-width:0;container-type:inline-size}.synthetic-float{background:var(--lumiverse-bg)}button,input,select,textarea{font:inherit}*,*::before,*::after{caret-color:transparent!important}.native-comparison{position:fixed;top:24px;left:460px;width:350px;max-height:calc(100dvh - 48px);overflow:auto;background:var(--lumiverse-bg-deep);padding:12px;border:1px solid var(--lumiverse-border)}.native-comparison h2{font-size:15px}.native-comparison *{box-sizing:border-box}.native-caption{color:var(--lumiverse-text-muted);font-size:12px}</style><div id="app" class="lumiphone-widget-root"></div><script src="view.js"></script>')
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[],colors=[]
try{for(const width of [1440,390,320])for(const [theme,vars]of Object.entries(themes)){
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<640}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);await page.route(/^https?:/,r=>r.abort())
 const capture=async scene=>{await page.waitForTimeout(50);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),scene+' page overflow');assert(await page.locator('.mochi-sidebar').evaluate(n=>n.scrollWidth<=n.clientWidth+1),scene+' sidebar overflow');await page.screenshot({path:resolve(out,`${theme}-${width}-${scene}.png`)});results.push({theme,width,scene})}
 try{
  await page.goto(pathToFileURL(resolve(out,'index.html')).href);await page.waitForFunction(()=>window.__defaultFixture?.view.navigationState.accounts?.accounts.length===2)
  await page.evaluate(({vars,nativeCSS,width})=>{
   for(const [key,value]of Object.entries(vars))document.documentElement.style.setProperty(key,value)
   const style=document.createElement('style');style.textContent=nativeCSS;document.head.append(style)
   const panel=document.createElement('aside');panel.className='native-comparison';panel.hidden=width<640;panel.innerHTML='<h2>Native Lumiverse control reference</h2><p class="native-caption">Actual installed CSS, namespaced for this synthetic comparison. Not a running Personas panel.</p><section class="native-editor-editor"><label class="native-form-formLabel">Display name</label><input aria-label="Native reference input" class="native-editor-nameInput" value="Synthetic Alex"><label class="native-form-formLabel">AI description</label><textarea class="native-editor-descTextarea">Synthetic identity only.</textarea><div><button class="native-form-btn native-form-btnPrimary">Native primary</button> <button class="native-form-btn">Secondary</button></div><article class="native-addon-addonCard"><strong>Persona Add-On</strong><span class="native-caption">Compact selectable row</span></article></section>';document.body.append(panel)
  },{vars,nativeCSS,width})
  await capture('accounts-list');await page.getByLabel('Show grid',{exact:true}).click();await capture('accounts-grid');await page.getByLabel('Show list',{exact:true}).click()
  await page.getByLabel('Search accounts',{exact:true}).fill('jules');assert.equal(await page.locator('.mochi-sidebar-account').count(),1);await page.getByLabel('Search accounts',{exact:true}).fill('')
  await page.getByLabel('Use Mochi account Alex',{exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state?.accountId===window.__defaultFixture.account.id);await capture('account-selected')
  if(before)await page.getByLabel('Account Settings',{exact:true}).click();else await page.getByLabel('Edit account Alex',{exact:true}).click()
  await capture('account-editor-native')
  if(before){
   await page.getByLabel('Enable add-on Writing preference',{exact:true}).scrollIntoViewIfNeeded();await capture('addons-continuous')
   await page.getByRole('button',{name:'Save profile',exact:true}).scrollIntoViewIfNeeded();await capture('editor-actions-native')
   continue
  }
  if(width<640){assert((await page.getByLabel('Profile display name',{exact:true}).boundingBox()).height>=40);assert((await page.getByRole('button',{name:'Save profile',exact:true}).boundingBox()).height>=40)}
  const palette=await page.evaluate(()=>{
   const css=n=>{const s=getComputedStyle(n);return {background:s.backgroundColor,color:s.color,border:s.borderColor}}
   const rgba=color=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((n,i)=>i===3?n/255:n)}
   const over=(front,back)=>front.slice(0,3).map((n,i)=>n*front[3]+back[i]*(1-front[3])).concat(1)
   const background=node=>{if(!node)return rgba(getComputedStyle(document.body).backgroundColor);return over(rgba(getComputedStyle(node).backgroundColor),background(node.parentElement))}
   const luminance=v=>v.slice(0,3).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0)
   const contrast=n=>{const bg=background(n),fg=over(rgba(getComputedStyle(n).color),bg),a=luminance(bg),b=luminance(fg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}
   const input=document.querySelector('[aria-label="Profile display name"]'),primary=document.querySelector('.mochi-profile-actions .mochi-primary'),secondary=document.querySelector('.mochi-profile-actions button:not(.mochi-primary)'),native=document.querySelector('[aria-label="Native reference input"]'),nativePrimary=document.querySelector('.native-form-btnPrimary')
   primary.style.color='var(--lumiverse-bg-deep)';const fallback=contrast(primary);primary.style.color='';window.__themeContrast=contrast
   return {fallbackPrimaryContrast:fallback,nativePrimaryContrast:contrast(nativePrimary),drawer:css(document.querySelector('.mochi-sidebar')),preview:css(document.querySelector('.mochi-profile-preview')),input:css(input),nativeInput:css(native),primary:css(primary),nativePrimary:css(nativePrimary),secondary:css(secondary),contrast:{input:contrast(input),primary:contrast(primary),secondary:contrast(secondary),body:contrast(document.querySelector('.mochi-profile-screen h3')),muted:contrast(document.querySelector('.mochi-profile-screen .mochi-muted'))}}
  })
  assert.equal(palette.input.background,palette.nativeInput.background,'native input semantic role');assert.equal(palette.primary.background,palette.nativePrimary.background,'native primary role');assert.notEqual(palette.drawer.background,palette.preview.background);assert.notEqual(palette.primary.background,palette.secondary.background)
  assert(palette.fallbackPrimaryContrast>=4.5,`${theme} fallback primary contrast ${palette.fallbackPrimaryContrast}`)
  for(const [role,value]of Object.entries(palette.contrast))assert(value>=4.5,`${theme} ${role} contrast ${value}`)
  colors.push({theme,width,...palette})
  await page.getByLabel('Profile display name',{exact:true}).focus();assert.notEqual(await page.getByLabel('Profile display name',{exact:true}).evaluate(n=>getComputedStyle(n).outlineStyle),'none');await capture('input-focus')
  assert.equal(await page.locator('.mochi-addon-details[open]').count(),0)
  await page.getByLabel('Enable add-on Writing preference',{exact:true}).scrollIntoViewIfNeeded();await capture('addons-collapsed')
  assert.equal(await page.getByLabel('Enable add-on Unavailable source',{exact:true}).isDisabled(),true)
  await page.getByLabel('Details for add-on Writing preference',{exact:true}).click();assert((await page.locator('.mochi-addon-content').first().textContent()).length>2000);await capture('addons-expanded');await page.getByLabel('Details for add-on Writing preference',{exact:true}).click()
  await page.locator('.mochi-persona-import>summary').click();await page.getByLabel('Search Lumiverse personas',{exact:true}).fill('Alex');await capture('persona-import')
  await page.getByRole('button',{name:'Save profile',exact:true}).scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Save profile',exact:true}).hover();assert(await page.getByRole('button',{name:'Save profile',exact:true}).evaluate(n=>window.__themeContrast(n))>=4.5);await capture('editor-actions-native')
  await page.getByLabel('Enable add-on Writing preference',{exact:true}).check();await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.waitForFunction(()=>!window.__defaultFixture.view.isSidebarProfileOpen)
  assert.deepEqual(await page.evaluate(async()=>{const f=window.__defaultFixture;return (await f.service.fictionalAccounts.get('synthetic-user',f.account.id)).personaAddons.enabledIds}),['local1'])
  await page.getByLabel('Edit account Alex',{exact:true}).click();await page.evaluate(()=>{const p=window.__defaultFixture.personas.get('native1');p.description='Reviewed synthetic identity update.';p.metadata.addons[0].content='Source changed only in the test fixture.'})
  await page.getByRole('button',{name:'Sync from Lumiverse',exact:true}).click();await page.getByLabel('Sync AI identity description',{exact:true}).check();await capture('manual-sync');await page.getByRole('button',{name:'Apply approved changes',exact:true}).click();await page.waitForFunction(()=>!window.__defaultFixture.view.isSidebarProfileOpen)
  await page.getByLabel('New account',{exact:true}).click();await page.getByLabel('Profile display name',{exact:true}).fill('Independent synthetic');await page.getByLabel('Profile username',{exact:true}).fill('independent');await page.getByLabel('Profile identity description',{exact:true}).fill('Independent AI context.');await capture('create-independent');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.navigationState.accounts?.accounts.length===3&&!window.__defaultFixture.view.isSidebarProfileOpen)
  await page.getByLabel('New account',{exact:true}).click();await page.getByLabel('Search Lumiverse personas',{exact:true}).fill('Jules');await page.getByLabel('Import persona Synthetic Jules',{exact:true}).click();await page.getByLabel('Link Lumiverse persona',{exact:true}).check();await capture('import-linked');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.navigationState.accounts?.accounts.length===4&&!window.__defaultFixture.view.isSidebarProfileOpen)
  await page.getByLabel('Use Mochi account Alex',{exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state?.accountId===window.__defaultFixture.account.id);assert.equal(await page.locator('.mochi-sidebar-picker .mochi-account-dock').count(),0)
  await page.getByRole('button',{name:'Open Mochi',exact:true}).click();await capture('messenger-bottom-dock')
  const dock=page.locator('.mochi-messenger-dock'),list=page.locator('.mochi-desktop-list');assert(await dock.isVisible());if(width<640)assert((await dock.getByLabel('Account Settings',{exact:true}).boundingBox()).height>=40);const d=await dock.boundingBox(),l=await list.boundingBox();assert(Math.abs(d.y+d.height-l.y-l.height)<2,'dock bottom-aligned in messenger list')
  assert.equal(await page.locator('[aria-label="Switch fictional profile"]').count(),0);assert.equal(await dock.locator('select').count(),0)
  await dock.getByLabel('Account Settings',{exact:true}).click();assert(await page.locator('#app .mochi-profile-screen').isVisible());await capture('dock-opens-outer-editor')
  await page.getByRole('button',{name:'Back to Accounts',exact:true}).click();await page.getByRole('button',{name:'Open Mochi',exact:true}).click()
  await page.evaluate(()=>{const f=window.__defaultFixture;f.view.roomId=f.room.id;f.view.ownGenerations.set(f.room.id,'synthetic-running');f.view.busy=true});await dock.getByLabel('Log out of fictional account',{exact:true}).click();assert(await page.getByRole('dialog',{name:'Stop generation and leave?',exact:true}).isVisible());await page.getByRole('button',{name:'Stay here',exact:true}).click();await page.evaluate(()=>{const f=window.__defaultFixture;f.view.ownGenerations.clear();f.view.busy=false;f.view.roomId=''})
  await dock.getByLabel('Log out of fictional account',{exact:true}).click();await capture('fictional-logout');assert(await page.getByRole('button',{name:'Open Mochi',exact:true}).isDisabled())
  await page.evaluate(()=>window.__defaultFixture.sidebar.openMessenger());assert.equal(await page.evaluate(()=>window.__defaultFixture.view.navigationState.selectedAccountId),undefined)
  await page.getByLabel('Use Mochi account Alex',{exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state?.accountId===window.__defaultFixture.account.id);await page.getByRole('button',{name:'Open Mochi',exact:true}).click();await page.getByLabel('Open conversation: Mochi Default v2 review',{exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor();await capture('messenger')
  const order=await page.evaluate(()=>{const toolbar=document.querySelector('.mochi-bottom-toolbar').getBoundingClientRect(),composer=document.querySelector('.mochi-composer-row').getBoundingClientRect();return toolbar.bottom<=composer.top+2});assert(order)
  await page.evaluate(()=>{const s=document.createElement('style');s.textContent='.mochi-view.mochi-view {--mochi-chat-font-size:17px;--mochi-bubble-radius:12px}';document.head.append(s)})
  assert.equal(await page.locator('.mochi-composer').evaluate(n=>getComputedStyle(n.closest('.mochi-view')).getPropertyValue('--mochi-chat-font-size').trim()),'17px');assert.equal(await page.locator('.native-form-btnPrimary').evaluate(n=>getComputedStyle(n).fontSize),'13px');assert.equal(await page.locator('.mochi-bubble').first().evaluate(n=>getComputedStyle(n).borderBottomLeftRadius),'12px');assert.equal(await page.locator('.mochi-bubble').first().evaluate(n=>getComputedStyle(n).fontSize),'17px');await capture('scoped-css-override')
  if(width<640){await page.setViewportSize({width,height:500});await page.getByLabel('Message',{exact:true}).fill('Reduced-height draft');await capture('mobile-keyboard');await page.getByLabel('Back to conversations',{exact:true}).click();await capture('mobile-dock-reduced-height');await page.setViewportSize({width,height:900});await page.locator('.mochi-messenger-dock').getByLabel('Account Settings',{exact:true}).click();await capture('mobile-editor');await page.getByRole('button',{name:'Back to Accounts',exact:true}).press('Escape')}
  assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0);assert.deepEqual(errors,[])
 }catch(error){await page.screenshot({path:resolve(out,'failure.png')});throw error}finally{await page.close()}
}}finally{await browser.close()}
await writeFile(resolve(out,'results.json'),JSON.stringify({captures:results.length,results,colors,nativeCSSSourceSHA256:sourceHashes,before,providerRequests:0},null,2));console.log(JSON.stringify({captures:results.length,themes:Object.keys(themes),before,passed:true}))
