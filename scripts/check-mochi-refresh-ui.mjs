import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
const out=resolve(process.env.MOCHI_REFRESH_OUTPUT||resolve(root,'tmp/mochi-refresh'))
await mkdir(out,{recursive:true})
const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',resolve(root,'scripts/fixtures/mochi-default-v2.ts'),'--target=browser','--outfile='+resolve(out,'view.js')],{cwd:root,encoding:'utf8'});assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}*,*::before,*::after{caret-color:transparent!important}</style><div id="app" class="lumiphone-widget-root"></div><script src="view.js"></script>')
const themes={dark:{bg:'#191b24',surface:'#232530',text:'#f1edf9',border:'#ffffff22',muted:'#aaa4b9',accent:'#baa4ef'},light:{bg:'#f7f3fb',surface:'#eee7f5',text:'#261d31',border:'#261d3133',muted:'#6c6274',accent:'#8870bd'},custom:{bg:'#142d30',surface:'#204449',text:'#e7fbf5',border:'#80c9bd55',muted:'#9cc5be',accent:'#e7bc70'}}
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1440,1050,390,320])for(const [theme,c]of Object.entries(themes)){
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<640}),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
 const capture=async scene=>{await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,scene+' page overflow');await page.screenshot({path:resolve(out,`${theme}-${width}-${scene}.png`)});results.push({width,theme,scene})}
 try{
  await page.goto(pathToFileURL(resolve(out,'index.html')).href);await page.waitForFunction(()=>window.__defaultFixture?.view.state?.rooms.length)
  await page.evaluate(async()=>{
   const f=window.__defaultFixture,svg=(letter,color)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" rx="50" fill="${color}"/><text x="50" y="64" text-anchor="middle" fill="white" font-size="44" font-family="sans-serif">${letter}</text></svg>`)
   const decorate=p=>{if(p.characters||p.state?.characters)for(const c of p.characters||p.state.characters){c.avatarUrl=svg(c.id==='one'?'R':'M',c.id==='one'?'#70588e':'#557f82');c.about=c.id==='one'?'A synthetic character who enjoys books and evening walks.':'A synthetic character who likes music and weekend plans.'}return p}
   f.host.sendToFrontend=p=>f.view.receive(decorate(p))
   const group=await f.service.create('synthetic-user',{accountId:f.account.id,title:'Weekend plans',characterIds:['one','two'],groupIcon:'🌙'})
   await f.service.update('synthetic-user',{accountId:f.account.id,roomId:group.id,revision:group.revision,title:group.title,characterIds:group.characterIds,settings:{...group.settings,responseMode:'manual'}})
   const second=await f.service.create('synthetic-user',{accountId:f.account.id,title:'Coffee catch-up',characterIds:['two']})
   await f.service.update('synthetic-user',{accountId:f.account.id,roomId:second.id,revision:second.revision,title:second.title,characterIds:second.characterIds,settings:{...second.settings,responseMode:'manual'}})
   for(const r of [f.room,group]){const key='synthetic-user:mochi/v1/rooms/'+r.id+'.json',saved=f.files.get(key);saved.messages=[
    {id:'seed_1',role:'assistant',characterId:'one',name:'Synthetic Rowan',avatarUrl:svg('R','#70588e'),content:'Hey! Are we still meeting this weekend?',createdAt:'2026-10-17T12:00:00Z',requestId:'fixture_1'},
    {id:'seed_2',role:'user',name:'Default v2 acceptance',avatarUrl:svg('Y','#8b729e'),content:'Yes! I found a quiet place near the park.',createdAt:'2026-10-17T12:01:00Z',requestId:'fixture_2'},
    {id:'seed_3',role:'assistant',characterId:r===group?'two':'one',name:r===group?'Synthetic Mira':'Synthetic Rowan',avatarUrl:svg(r===group?'M':'R',r===group?'#557f82':'#70588e'),content:'Sounds good. Send me the details when you have a minute.',createdAt:'2026-10-17T12:02:00Z',requestId:'fixture_3'}];saved.messages.push({...saved.messages[2],id:'seed_4',content:'And I will bring snacks.',createdAt:'2026-10-17T12:02:15Z'});f.files.set(key,saved)}
   const other=await f.service.fictionalAccounts.create('synthetic-user',{displayName:'Other fictional profile',persona:{source:'manual',name:'Other',description:''}})
   f.other=other;f.group=group;f.view.load();f.view.loadNavigationAccounts()
  })
  await page.evaluate(c=>{for(const [key,value]of Object.entries({'--lp-bg':c.bg,'--lp-surface':c.bg,'--lp-surface-2':c.surface,'--lp-text':c.text,'--lp-border':c.border,'--lp-muted':c.muted,'--lp-accent':c.accent,'--lumiverse-bg':c.bg,'--lumiverse-text':c.text,'--lumiverse-border':c.border,'--lumiverse-primary':c.accent}))document.documentElement.style.setProperty(key,value)},c)
  const open=async title=>{await page.getByRole('button',{name:'Open conversation: '+title,exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor()}
  const back=async()=>{if(width<640)await page.getByLabel('Back to conversations',{exact:true}).click()}
  await page.getByRole('button',{name:'Open conversation: Weekend plans',exact:true}).waitFor();await capture('sidebar')
  assert.equal(await page.getByRole('button',{name:'Unread',exact:true}).count(),0)
  assert.equal(await page.locator('.mochi-desktop-room').count(),3)
  await open('Mochi Default v2 review')
  const profile=page.locator('.mochi-profile-panel')
  assert.equal(await profile.isVisible(),width>=1280,'wide open / medium and mobile closed by default')
  assert.deepEqual(await page.locator('.mochi-header-controls>button').evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label'))),['Search conversation','Mochi notifications','Participants'])
  assert.equal(await page.locator('.mochi-room-header .mochi-custom-toolbar').count(),0)
  const toolbar=page.locator('.mochi-bottom-toolbar'),composer=page.locator('.mochi-composer-row'),thread=page.locator('.mochi-thread')
  let tools=await toolbar.boundingBox(),field=await composer.boundingBox(),history=await thread.boundingBox()
  assert(tools.y>=history.y+history.height-2&&tools.y+tools.height<=field.y+2,'toolbar directly above composer at bottom '+JSON.stringify({tools,field,history}))
  assert.deepEqual(await toolbar.locator('.mochi-toolbar-shortcuts>button').evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label'))),['Presets','Pins & Notes','Conversation Memory','Preview AI prompt'])
  const cog=await toolbar.getByRole('button',{name:'Chat Settings',exact:true}).boundingBox();assert(cog.x+cog.width>=tools.x+tools.width-12,'settings fixed at far right')
  assert.equal(await page.locator('.mochi-message[data-grouped=true]').count(),1)
  assert.equal(await page.locator('.mochi-message[data-grouped=true] .mochi-message-heading').isVisible(),false)
  await capture('dm-bottom-toolbar')
  const responderBox=await page.getByLabel('Choose next responder',{exact:true}).boundingBox(),sendBox=await page.getByLabel('Send',{exact:true}).boundingBox();assert(responderBox.width<=42&&sendBox.x-responderBox.x-responderBox.width<=8,'compact responder immediately beside Send');await page.getByLabel('Choose next responder',{exact:true}).click();await capture('responder-open')
  await page.getByRole('button',{name:'Respond as Synthetic Rowan',exact:true}).click();assert.equal(await page.getByLabel('Next responder',{exact:true}).inputValue(),'one')
  await page.getByLabel('Choose next responder',{exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('.mochi-responder-popup').evaluate(n=>n.open),false)
  const first=page.locator('.mochi-message').first(),bubble=first.locator('.mochi-bubble'),strip=first.locator('.mochi-action-strip')
  const before=await thread.evaluate(n=>n.scrollTop);await bubble.click();await page.waitForTimeout(330)
  let actionBox=await strip.boundingBox(),bubbleBox=await bubble.boundingBox()
  assert(actionBox.y+actionBox.height<=bubbleBox.y,'strip above content');assert(actionBox.x>=history.x&&actionBox.x+actionBox.width<=history.x+history.width+1,'strip within chat')
  assert.equal(await thread.evaluate(n=>n.scrollTop),before,'selection does not scroll')
  const delays=await strip.locator('button').evaluateAll(ns=>ns.map(n=>parseFloat(getComputedStyle(n).animationDelay)))
  assert.deepEqual(delays,[.15,.12,.09,.06,.03,0],'right-to-left stagger')
  await capture('selected-message')
  await first.focus();await page.keyboard.press('Escape');assert.equal(await strip.isVisible(),false)
  await page.keyboard.press('Enter');assert.equal(await strip.isVisible(),true)
  await page.getByLabel('Message',{exact:true}).click();assert.equal(await strip.isVisible(),false)
  await first.dispatchEvent('pointerdown',{pointerType:'touch'});await page.waitForTimeout(470);await first.dispatchEvent('pointerup',{pointerType:'touch'});assert.equal(await strip.isVisible(),true,'long press')
  await first.focus();await page.keyboard.press('Escape');await bubble.click();await page.emulateMedia({reducedMotion:'reduce'})
  assert.equal(await strip.locator('button').first().evaluate(n=>getComputedStyle(n).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'})
  await strip.getByRole('button',{name:'Reply',exact:true}).click();assert.equal(await page.locator('.mochi-reply-preview').count(),1);await page.getByLabel('Clear reply target',{exact:true}).click()
  await page.locator('.mochi-message').first().locator('.mochi-bubble').click();await page.locator('.mochi-message').first().getByRole('button',{name:'Edit message',exact:true}).click();assert.equal(await page.getByLabel('Edit message text',{exact:true}).isVisible(),true);await page.keyboard.press('Escape')
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedMessage=text}}}))
  const selectFirst=async()=>{const row=page.locator('.mochi-message').first();if(await row.getAttribute('data-selected')!=='true')await row.locator('.mochi-bubble').click();return row.locator('.mochi-action-strip')}
  await (await selectFirst()).getByRole('button',{name:'Copy message',exact:true}).click();await page.waitForFunction(()=>window.__copiedMessage==='Hey! Are we still meeting this weekend?')
  await (await selectFirst()).getByRole('button',{name:'React',exact:true}).click();await page.getByRole('button',{name:'Toggle heart reaction',exact:true}).click();await page.locator('.mochi-message').first().locator('.mochi-reactions').getByRole('button').waitFor()
  await (await selectFirst()).getByRole('button',{name:'Pin',exact:true}).click();await page.locator('.mochi-message').first().getByLabel('Pinned chat message',{exact:true}).waitFor()
  await (await selectFirst()).getByRole('button',{name:'Edit message',exact:true}).click();await page.getByLabel('Edit message text',{exact:true}).fill('Hey! Are we still meeting this weekend? Updated.');await page.getByRole('button',{name:'Save message',exact:true}).click();await page.locator('.mochi-message').first().locator('.mochi-edited-label').waitFor();await capture('edited-reacted-pinned')
  if(!await profile.isVisible())await page.getByRole('button',{name:'Character profile',exact:true}).click()
  assert.equal(await profile.isVisible(),true);assert.match(await profile.locator('.mochi-profile-about').innerText(),/No Mochi bio saved yet/);assert.doesNotMatch(await profile.innerText(),/enjoys books/);await capture('profile')
  await page.getByLabel('Close character profile',{exact:true}).click();assert.equal(await profile.isVisible(),false)
  if(width>=1280){await page.getByRole('button',{name:'Character profile',exact:true}).click();assert.equal(await profile.isVisible(),true);await page.setViewportSize({width:390,height:900});assert.equal(await profile.isVisible(),false);await page.waitForTimeout(40);assert.equal(await page.getByRole('button',{name:'Character profile',exact:true}).getAttribute('aria-expanded'),'false');await page.setViewportSize({width,height:900});assert.equal(await profile.isVisible(),true,'mobile collapse retains manual desktop open');await page.getByLabel('Close character profile',{exact:true}).click()}
  await page.getByLabel('Room options',{exact:true}).click();await capture('bottom-overflow');await page.keyboard.press('Escape')
  // Use saved preferences without any migration: permanent header actions ignore hidden flags.
  await page.evaluate(()=>{const f=window.__defaultFixture,p=f.view.personalSettings;f.originalPrefs=p.saved;p.saved={...p.saved,revision:3,preferences:{...p.value,hidden:['search','notifications','participants','notes'],presentation:'labels',order:['preview','memory','notes','presets','settings','search','participants','notifications']}};f.view.redraw()})
  assert.equal(await page.locator('.mochi-header-controls>button').count(),3)
  assert.deepEqual(await toolbar.locator('.mochi-toolbar-shortcuts>button').evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label'))),['Preview AI prompt','Conversation Memory','Presets'])
  await capture('saved-toolbar-labels');await page.evaluate(()=>{window.__defaultFixture.view.personalSettings.saved=window.__defaultFixture.originalPrefs;window.__defaultFixture.view.redraw()})
  await page.evaluate(()=>{const f=window.__defaultFixture;f.view.state.jobs||={};f.view.state.jobs[f.view.roomId]='synthetic-running';f.view.ownGenerations.set(f.view.roomId,'synthetic-running');f.view.redraw()})
  assert.equal(await page.getByLabel('Send',{exact:true}).isDisabled(),true);await capture('generation-stop')
  await page.locator('.mochi-header-controls').getByRole('button',{name:'Mochi notifications',exact:true}).click();await page.getByRole('button',{name:'Stay here',exact:true}).waitFor();await page.getByRole('button',{name:'Stay here',exact:true}).click()
  await page.getByLabel('Stop reply',{exact:true}).click();assert.equal(await page.evaluate(()=>window.__defaultFixture.requests.some(r=>r.type==='mochi:cancel'&&r.generationRequestId==='synthetic-running')),true)
  await page.evaluate(()=>{const f=window.__defaultFixture;f.view.state.jobs={};f.view.ownGenerations.clear();f.view.redraw()})
  await back();await open('Weekend plans');await capture('group')
  await page.getByLabel('Choose next responder',{exact:true}).click();assert.equal(await page.getByRole('button',{name:'Respond as Synthetic Mira',exact:true}).isVisible(),true);await page.keyboard.press('Escape')
  await back();const otherId=await page.evaluate(()=>window.__defaultFixture.other.id);await page.evaluate(id=>window.__defaultFixture.view.selectNavigationAccount(id,document.querySelector('.mochi-desktop-list'),()=>{}),otherId)
  await page.waitForFunction(id=>window.__defaultFixture.view.state.accountId===id,otherId);assert.equal(await page.locator('.mochi-desktop-room').count(),0)
  const accountId=await page.evaluate(()=>window.__defaultFixture.account.id);await page.evaluate(id=>window.__defaultFixture.view.selectNavigationAccount(id,document.querySelector('.mochi-desktop-list'),()=>{}),accountId)
  await page.waitForFunction(id=>window.__defaultFixture.view.state.accountId===id,accountId);assert.equal(await page.locator('.mochi-desktop-room').count(),3)
  if(width<640){await open('Mochi Default v2 review');await page.setViewportSize({width,height:500});await page.getByLabel('Message',{exact:true}).fill('Draft with keyboard-sized viewport');await capture('keyboard-height');tools=await toolbar.boundingBox();field=await composer.boundingBox();assert(field.y+field.height<=500&&tools.y+tools.height<=field.y+2,'composer accessible in reduced height')}
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
 }catch(error){await page.screenshot({path:resolve(out,'failure.png')});console.error(errors,await page.locator('body').innerText(),await page.evaluate(()=>({room:window.__defaultFixture.view.roomId,owned:[...window.__defaultFixture.view.ownGenerations],notice:window.__defaultFixture.view.generationExitNotice(),dirty:window.__defaultFixture.view.hasUnsavedChanges(),dialogs:[...document.querySelectorAll('dialog')].map(d=>({open:d.open,text:d.textContent}))})));throw error}finally{await page.close()}
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log(`${results.length} messenger screenshots; 1440/1050/390/320; dark/light/custom; header/bottom toolbar/responder/grouping/actions/preferences/Stop passed; zero provider requests.`)
}finally{await browser.close()}
