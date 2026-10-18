import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tmp/phase3-icons'),require=createRequire(import.meta.url)
const {chromium}=require(require.resolve('playwright',{paths:[process.env.POCKET_PLAYWRIGHT_ROOT||root]}))
await mkdir(out,{recursive:true})
const build=spawnSync('bun',['build','scripts/fixtures/mochi-icons.ts','--target=browser','--outfile='+resolve(out,'icons.js')],{cwd:root,encoding:'utf8'});assert.equal(build.status,0,build.stderr)
await writeFile(resolve(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}*{box-sizing:border-box}</style><div id="app"></div><script src="icons.js"></script>')
const count=JSON.parse(await readFile(resolve(root,'src/mochi/ui/icon-inventory.json'),'utf8')).slots.length
const browser=await chromium.launch({headless:true,executablePath:process.env.POCKET_BROWSER_PATH}),results=[],requests=[],errors=[]
const valid='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#9866cc"/></svg>'
try{
 const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>{requests.push(r.request().url());return r.abort()})
 await page.goto(pathToFileURL(resolve(out,'index.html')).href)
 const slot=page.locator('[data-mochi-icon-action="toolbar-presets"]'),button=page.getByRole('button',{name:'toolbar-presets',exact:true})
 await button.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.__icons.clicks()),1)
 await slot.evaluate(n=>{n.style.setProperty('--mochi-icon-toolbar-presets-size','26px');n.style.setProperty('--mochi-icon-toolbar-presets-stroke-width','2.5')})
 assert.equal(await slot.evaluate(n=>getComputedStyle(n).width),'26px');assert.equal(await slot.locator('svg').evaluate(n=>getComputedStyle(n).strokeWidth),'2.5px')
 await button.evaluate(n=>n.disabled=true);await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.__icons.clicks()),1);await button.evaluate(n=>n.disabled=false)
 const replace=async raw=>page.evaluate(raw=>{const n=document.querySelector('[data-mochi-icon-action="toolbar-presets"]');n.style.setProperty('--mochi-icon-toolbar-presets-image',raw);window.__icons.refresh();return n.dataset.mochiIconState},raw)
 const svgURL='data:image/svg+xml,'+encodeURIComponent(valid)
 assert.equal(await replace(`url("${svgURL}")`),'fallback','Lucide remains while loading');await slot.locator('img').waitFor({state:'visible'});assert.equal(await slot.getAttribute('data-mochi-icon-state'),'custom');assert.equal(await slot.locator('svg').isVisible(),false)
 await page.screenshot({path:resolve(out,'successful-svg.png')});results.push({case:'css SVG substitution',state:'custom'})
 for(const raw of ['url("/missing.svg")','url("https://evil.invalid/icon.svg")','url("data:image/svg+xml,%3Csvg%3E")',`url("data:image/svg+xml,${encodeURIComponent(valid.replace('<circle','<circle onload="alert(1)"'))}")`,'url("data:image/png;base64,AAAA")']){
  await replace(raw);await page.waitForTimeout(80);assert.equal(await slot.getAttribute('data-mochi-icon-state'),'fallback');assert.equal(await slot.locator('svg').isVisible(),true);assert.equal(await slot.locator('img').isVisible(),false);results.push({case:raw,state:'fallback'})
 }
 await page.screenshot({path:resolve(out,'failed-asset-fallback.png')})
 // Actual local PNG decoding, followed by a bundled-owner SVG override.
 const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAF8AAAAASUVORK5CYII='
 await replace(`url("${png}")`);await slot.locator('img').waitFor({state:'visible'});results.push({case:'CSS PNG substitution',state:'custom'})
 await replace('none');await page.evaluate(()=>{window.__icons.assets['toolbar-presets']={svg:window.__icons.ownerExample};window.__icons.refresh()});await slot.locator('img').waitFor({state:'visible'});results.push({case:'bundled owner SVG',state:'custom'})
 await page.evaluate(()=>{delete window.__icons.assets['toolbar-presets'];window.__icons.refresh()});assert.equal(await slot.locator('svg').isVisible(),true)
 await page.evaluate(()=>{const wrap=document.createElement('nav');wrap.id='legacy';wrap.className='mochi-settings-categories';const b=window.__icons.button('Appearance','lp-button mochi-category-tab');b.setAttribute('aria-pressed','true');wrap.append(b);document.getElementById('app').append(wrap);window.__icons.refresh()})
 const selected=page.locator('#legacy [data-mochi-icon-action=selected]');await selected.waitFor({state:'visible'})
 await page.locator('#legacy').evaluate(n=>{n.style.setProperty('--mochi-v2-settings-categories-button-aria-pressed-true-after-content','"*"');window.__icons.refresh()})
 assert.equal(await selected.isVisible(),false);assert.equal(await page.locator('#legacy button').evaluate(n=>getComputedStyle(n,'::after').content),'"*"');await page.locator('#legacy').evaluate(n=>n.remove());results.push({case:'explicit v2 pseudo-content compatibility',state:'legacy'})
 const snapshot=await page.locator('#app').ariaSnapshot();assert(snapshot.includes('button "toolbar-presets"'));assert(!snapshot.includes('img'));await writeFile(resolve(out,'accessible-names.yml'),snapshot)
 assert.equal(await slot.evaluate(n=>getComputedStyle(n).animationName),'none');assert.deepEqual(requests,[]);assert.deepEqual(errors,[])
 await page.close()
 for(const width of [1280,390,320])for(const [theme,bg,text]of [['dark','#191b24','#f1edf9'],['light','#f7f3fb','#261d31'],['brown','#2c211b','#fff2e2'],['purple','#292032','#f7efff']]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.route(/^https?:/,r=>r.abort());await p.goto(pathToFileURL(resolve(out,'index.html')).href)
  await p.addStyleTag({content:`#app{background:${bg};color:${text}}button{color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px}`})
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  assert.equal(await p.getByRole('button').count(),count)
  await p.screenshot({path:resolve(out,`${theme}-${width}-catalog.png`),fullPage:true});await p.close()
 }
 await writeFile(resolve(out,'results.json'),JSON.stringify({cases:results,catalogScreenshots:12,namedButtons:count,externalRequests:requests,pageErrors:errors,keyboard:true,reducedMotion:true},null,2));console.log('Icon gallery: 12 palette/width captures; CSS SVG/PNG and bundled SVG success; 5 failures retain Lucide; named buttons, keyboard and reduced motion pass; zero HTTP requests.')
}finally{await browser.close()}
