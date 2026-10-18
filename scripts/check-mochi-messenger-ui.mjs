import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
const out=resolve(process.env.MOCHI_MESSENGER_OUTPUT||resolve(root,'tmp/mochi-messenger'))
await mkdir(out,{recursive:true})
const build=spawnSync(process.env.MOCHI_BUN||'bun',['build',resolve(root,'scripts/fixtures/mochi-default-v2.ts'),'--target=browser','--outfile='+resolve(out,'view.js')],{cwd:root,encoding:'utf8'});assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}#app{width:100%;height:100dvh;min-width:0;container-type:inline-size}button,input,select,textarea{font:inherit}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><div id="app" class="lumiphone-widget-root"></div><script src="view.js"></script>')
const themes={dark:{bg:'#191b24',surface:'#232530',text:'#f1edf9',border:'#ffffff22',muted:'#aaa4b9',accent:'#baa4ef'},light:{bg:'#f7f3fb',surface:'#eee7f5',text:'#261d31',border:'#261d3133',muted:'#6c6274',accent:'#8870bd'},custom:{bg:'#142d30',surface:'#204449',text:'#e7fbf5',border:'#80c9bd55',muted:'#9cc5be',accent:'#e7bc70'}}
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[]
try{for(const width of [1280,390,320])for(const [theme,c]of Object.entries(themes)){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort())
 const capture=async scene=>{await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(40);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,scene+' page overflow');await page.screenshot({path:resolve(out,`${theme}-${width}-${scene}.png`)});results.push({width,theme,scene})}
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
    {id:'seed_3',role:'assistant',characterId:r===group?'two':'one',name:r===group?'Synthetic Mira':'Synthetic Rowan',avatarUrl:svg(r===group?'M':'R',r===group?'#557f82':'#70588e'),content:'Sounds good. Send me the details when you have a minute.',createdAt:'2026-10-17T12:02:00Z',requestId:'fixture_3'}];f.files.set(key,saved)}
   const other=await f.service.fictionalAccounts.create('synthetic-user',{displayName:'Other fictional profile',persona:{source:'manual',name:'Other',description:''}})
   f.other=other;f.group=group;f.view.load();f.view.loadNavigationAccounts()
  })
  await page.evaluate(c=>{for(const [key,value]of Object.entries({'--lp-bg':c.bg,'--lp-surface':c.bg,'--lp-surface-2':c.surface,'--lp-text':c.text,'--lp-border':c.border,'--lp-muted':c.muted,'--lp-accent':c.accent,'--lumiverse-bg':c.bg,'--lumiverse-text':c.text,'--lumiverse-border':c.border,'--lumiverse-primary':c.accent}))document.documentElement.style.setProperty(key,value)},c)
  const open=async title=>{await page.getByRole('button',{name:'Open conversation: '+title,exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor()}
  const back=async()=>{if(width<640)await page.getByLabel('Back to conversations',{exact:true}).click()}
  await page.getByRole('button',{name:'Open conversation: Weekend plans',exact:true}).waitFor();await capture('sidebar')
  assert.equal(await page.getByRole('button',{name:'Unread',exact:true}).count(),0)
  assert.equal(await page.locator('.mochi-desktop-room').count(),3)
  await open('Mochi Default v2 review');assert.equal(await page.locator('.mochi-conversation-title').innerText(),'Synthetic Rowan')
  assert.equal(await page.locator('.mochi-room-info img').count(),1);assert.equal(await page.locator('.mochi-message[data-role=user] .mochi-message-name').innerText(),'You')
  await capture('dm');assert.equal(await page.locator('.mochi-bubble').evaluateAll(ns=>new Set(ns.map(n=>getComputedStyle(n).fontFamily)).size),1,'consistent inherited message font')
  const info=await page.locator('.mochi-room-info').boundingBox(),tools=await page.locator('.mochi-custom-toolbar').boundingBox()
  if(width<640)assert(tools.y>=info.y+info.height-1);else assert(tools.x>=info.x+info.width-1)
  await page.getByRole('button',{name:'Character profile',exact:true}).click();await capture('profile')
  assert.equal(await page.locator('.mochi-profile-panel').isVisible(),true);assert.match(await page.locator('.mochi-profile-about').innerText(),/synthetic character/)
  await page.getByLabel('Close character profile',{exact:true}).click()
  await page.getByLabel('Room options',{exact:true}).click();await capture('menu');await page.keyboard.press('Escape')
  await back();await open('Weekend plans');assert.equal(await page.locator('.mochi-room-info .mochi-chat-avatar').innerText(),'🌙');await capture('group')
  await page.getByRole('button',{name:'Character profile',exact:true}).click();assert.equal(await page.locator('.mochi-profile-person').count(),2);await capture('group-profile');await page.getByLabel('Close character profile',{exact:true}).click()
  await page.getByLabel('Chat Settings',{exact:true}).click();await page.getByLabel('Group icon',{exact:true}).selectOption('🎮');await capture('group-icon-edit')
  await page.getByRole('button',{name:'Save settings',exact:true}).click();await page.waitForFunction(()=>window.__defaultFixture.view.state.rooms.find(r=>r.title==='Weekend plans').groupIcon==='🎮')
  await page.getByRole('button',{name:'Return to conversation',exact:true}).click();assert.equal(await page.locator('.mochi-room-info .mochi-chat-avatar').innerText(),'🎮');await capture('group-icon-saved')
  await back();await page.getByLabel('New Chat',{exact:true}).click();await page.getByLabel('Chat name',{exact:true}).fill('Created in messenger check')
  await page.getByRole('button',{name:'Synthetic Mira',exact:true}).click();assert.equal(await page.getByLabel('Group icon',{exact:true}).isVisible(),false)
  await page.getByRole('button',{name:'Create chat',exact:true}).click();await page.getByLabel('Message',{exact:true}).waitFor();await capture('new-chat')
  await back();const otherId=await page.evaluate(()=>window.__defaultFixture.other.id);await page.getByLabel('Switch fictional profile',{exact:true}).selectOption(otherId)
  await page.waitForFunction(id=>window.__defaultFixture.view.state.accountId===id,otherId);assert.equal(await page.locator('.mochi-desktop-room').count(),0)
  const accountId=await page.evaluate(()=>window.__defaultFixture.account.id);await page.getByLabel('Switch fictional profile',{exact:true}).selectOption(accountId)
  await page.waitForFunction(id=>window.__defaultFixture.view.state.accountId===id,accountId);assert.equal(await page.locator('.mochi-desktop-room').count(),4)
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__defaultFixture.providerCalls.length),0)
 }catch(error){await page.screenshot({path:resolve(out,'failure.png')});console.error(errors,await page.locator('body').innerText());throw error}finally{await page.close()}
}await writeFile(resolve(out,'results.json'),JSON.stringify(results,null,2));console.log(`${results.length} messenger screenshots; 1280/390/320; dark/light/custom; DM/group/profile/icons/new chat/profile switching passed; zero provider requests.`)
}finally{await browser.close()}
