import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
const out=resolve(process.env.MOCHI_ACCOUNTS_OUTPUT||resolve(root,'tmp/mochi-accounts'))
await mkdir(out,{recursive:true})
const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',resolve(root,'scripts/fixtures/mochi-accounts-ui.ts'),'--target=browser','--outfile='+resolve(out,'view.js')],{cwd:root,encoding:'utf8'});assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:min(420px,100%);height:100dvh;min-width:0;container-type:inline-size}.pocket-portal{height:100%;display:flex;flex-direction:column}.pocket-portal-body{flex:1;min-height:0}.synthetic-float{background:var(--lp-bg)}button,input,select,textarea{font:inherit}*,*::before,*::after{caret-color:transparent!important}</style><div id="app" class="lumiphone-widget-root"></div><script src="view.js"></script>')
const themes={dark:{bg:'#191b24',surface:'#232530',text:'#f1edf9',border:'#ffffff22',muted:'#aaa4b9',accent:'#baa4ef'},light:{bg:'#f7f3fb',surface:'#eee7f5',text:'#261d31',border:'#261d3133',muted:'#6c6274',accent:'#8870bd'},custom:{bg:'#142d30',surface:'#204449',text:'#e7fbf5',border:'#80c9bd55',muted:'#9cc5be',accent:'#e7bc70'}}
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1440,390,320])for(const [theme,c]of Object.entries(themes)){
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<640}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);await page.route(/^https?:/,r=>r.abort())
 const capture=async scene=>{await page.waitForTimeout(50);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),scene+' page overflow');assert(await page.locator('.mochi-sidebar').evaluate(n=>n.scrollWidth<=n.clientWidth+1),scene+' sidebar overflow');await page.screenshot({path:resolve(out,`${theme}-${width}-${scene}.png`)});results.push({width,theme,scene})}
 try{
  await page.goto(pathToFileURL(resolve(out,'index.html')).href);await page.waitForFunction(()=>window.__defaultFixture?.view.navigationState.accounts?.accounts.length===2)
  await page.evaluate(c=>{for(const [key,value]of Object.entries({'--lp-bg':c.bg,'--lp-surface':c.bg,'--lp-surface-2':c.surface,'--lp-text':c.text,'--lp-border':c.border,'--lp-muted':c.muted,'--lp-accent':c.accent,'--lumiverse-bg':c.bg,'--lumiverse-bg-elevated':c.surface,'--lumiverse-text':c.text,'--lumiverse-text-muted':c.muted,'--lumiverse-border':c.border,'--lumiverse-primary':c.accent}))document.documentElement.style.setProperty(key,value);document.body.style.background=c.bg;document.body.style.color=c.text},c)
  await capture('accounts-list')
  await page.getByLabel('Show grid',{exact:true}).click();await capture('accounts-grid');await page.getByLabel('Show list',{exact:true}).click()
  await page.getByLabel('Search accounts',{exact:true}).fill('jules');assert.equal(await page.locator('.mochi-sidebar-account').count(),1);await page.getByLabel('Search accounts',{exact:true}).fill('')
  await page.getByLabel('Select multiple accounts',{exact:true}).click();await page.getByRole('button',{name:'Select all shown',exact:true}).click();await capture('bulk-summary');await page.getByLabel('Select multiple accounts',{exact:true}).click()
  await page.getByLabel('Use Mochi account Alex',{exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state?.accountId===window.__defaultFixture.account.id)
  assert.equal(await page.locator('.synthetic-float').count(),0);await capture('account-selected-dock');const dock=await page.locator('.mochi-account-dock').boundingBox();const sidebarBox=await page.locator('.mochi-sidebar').boundingBox();assert(Math.abs(dock.y+dock.height-sidebarBox.y-sidebarBox.height)<2,'dock stays at bottom of outer sidebar')
  await page.evaluate(()=>{const f=window.__defaultFixture;f.view.roomId=f.room.id;f.view.ownGenerations.set(f.room.id,'synthetic-pending');f.view.busy=true})
  await page.getByLabel('Log out of fictional account',{exact:true}).click();assert(await page.getByRole('dialog',{name:'Stop generation and leave?',exact:true}).isVisible());await capture('generation-warning');await page.getByRole('button',{name:'Stay here',exact:true}).click()
  await page.evaluate(()=>{const f=window.__defaultFixture;f.view.ownGenerations.clear();f.view.busy=false})
  await page.getByLabel('New account',{exact:true}).click();await page.getByLabel('Profile display name',{exact:true}).fill('Independent test');await page.getByLabel('Profile username',{exact:true}).fill('independent_test');await page.getByLabel('Profile identity description',{exact:true}).fill('Independent synthetic AI description.');await capture('create-independent')
  await page.getByRole('button',{name:'Cancel profile changes',exact:true}).click();await page.getByRole('button',{name:'Discard changes',exact:true}).click()
  await page.getByLabel('New account',{exact:true}).click();await page.getByLabel('Search Lumiverse personas',{exact:true}).fill('Jules');await page.getByLabel('Import persona Synthetic Jules',{exact:true}).click();await page.getByLabel('Link Lumiverse persona',{exact:true}).check();await capture('persona-import-link')
  await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.waitForFunction(()=>!window.__defaultFixture.view.isSidebarProfileOpen&&window.__defaultFixture.view.navigationState.accounts?.accounts.length===3)
  assert.equal(await page.locator('.synthetic-float').count(),0)
  await page.getByLabel('Use Mochi account Alex',{exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state?.accountId===window.__defaultFixture.account.id)
  await page.getByLabel('Account Settings',{exact:true}).click();await capture('edit-account')
  assert.equal(await page.locator('#app .mochi-profile-screen').count(),1);assert((await page.locator('#app .mochi-profile-screen').boundingBox()).width>=width-70||width>640);assert.equal(await page.locator('.mochi-desktop .mochi-profile-screen').count(),0)
  await page.evaluate(()=>{const p=window.__defaultFixture.personas.get('native1');p.name='Alex updated';p.description='Explicitly reviewed updated synthetic identity.';p.metadata.addons[0].enabled=true;p.metadata.addons[0].content='A reviewed new writing preference.'})
  await page.getByRole('button',{name:'Sync from Lumiverse',exact:true}).click();await page.getByLabel('Sync AI identity description',{exact:true}).check();await page.getByLabel('Sync add-on Writing preference',{exact:true}).check();await capture('sync-review-fields');await page.locator('.mochi-sidebar-picker').last().evaluate(n=>n.scrollTop=0);await capture('sync-review')
  await page.getByRole('button',{name:'Apply approved changes',exact:true}).click();await page.waitForFunction(()=>!window.__defaultFixture.view.isSidebarProfileOpen)
  assert.equal(await page.evaluate(async()=>{const f=window.__defaultFixture;return (await f.service.fictionalAccounts.get('synthetic-user',f.account.id)).displayName}),'Alex')
  assert.equal(await page.evaluate(async()=>{const f=window.__defaultFixture;return (await f.service.read('synthetic-user',f.room.id,f.account.id)).persona.description}),'Synthetic AI identity for a calm, curious person.')
  await page.getByLabel('Log out of fictional account',{exact:true}).click();await capture('fictional-logout');await page.evaluate(()=>window.__defaultFixture.sidebar.openMessenger());assert.equal(await page.locator('.synthetic-float').count(),0)
  await page.getByLabel('Use Mochi account Alex',{exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state?.accountId===window.__defaultFixture.account.id)
  await page.getByRole('button',{name:'Open Mochi',exact:true}).click();if(!await page.getByLabel('Message',{exact:true}).isVisible())await page.getByLabel('Open conversation: Mochi Default v2 review',{exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor()
  assert.equal(await page.locator('.mochi-desktop [aria-label="Switch fictional profile"]').count(),0);await capture('messenger')
  await page.getByLabel('Room options',{exact:true}).click();assert.equal(await page.locator('.lp-conversation-menu-sheet [aria-label="Search conversation"],.lp-conversation-menu-sheet [aria-label="Participants"]').count(),0);await capture('messenger-menu');await page.getByLabel('Room options',{exact:true}).press('Escape')
  // A stronger scoped selector wins even when compiled runtime styles follow the host head style.
  await page.evaluate(()=>{const s=document.createElement('style');s.id='synthetic-custom-css';s.textContent='.mochi-view.mochi-view { --mochi-chat-font-size: 17px; --mochi-bubble-radius: 12px; }';document.head.append(s)})
  assert.equal(await page.locator('.mochi-composer').evaluate(n=>getComputedStyle(n.closest('.mochi-view')).getPropertyValue('--mochi-chat-font-size').trim()),'17px');await capture('custom-css-override')
  if(width<640){await page.setViewportSize({width,height:500});await page.getByLabel('Message',{exact:true}).fill('Preserved keyboard-height draft');await capture('mobile-keyboard');await page.setViewportSize({width,height:900});await page.evaluate(()=>window.__defaultFixture.sidebar.settings(document.querySelector('[aria-label="Message"]')));await capture('mobile-outer-editor');assert.equal(await page.locator('#app .mochi-profile-screen').count(),1);assert((await page.locator('#app .mochi-profile-screen').boundingBox()).width>=width-70||width>640);await page.getByRole('button',{name:'Back to Accounts',exact:true}).click()}
  assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0);assert.deepEqual(errors,[])
 }finally{await page.close()}
}}finally{await browser.close()}
await writeFile(resolve(out,'results.json'),JSON.stringify({captures:results.length,results,network:'HTTP blocked; no provider requests'},null,2));console.log(JSON.stringify({captures:results.length,passed:true}))
