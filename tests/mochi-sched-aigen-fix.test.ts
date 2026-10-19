import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {fixture} from './mochi-accounts.test.js'
import {MochiView} from '../src/mochi/view.js'
import {parseRoutineDraft,routinePrompt} from '../src/mochi/routine-generation.js'
import {planFor,routineAt,routineWarnings,defaultRoutine} from '../src/mochi/routines.js'
import {routineControls} from '../src/mochi/routine-controls.js'
import {MochiCharacterPreferences} from '../src/mochi/character-preferences.js'
import {CharacterEditor} from '../src/mochi/character-editor.js'
import {RoutineDraftControls} from '../src/mochi/routine-draft-controls.js'

const raw=JSON.stringify({v:1,tz:'America/Chicago',b:[{i:'sleep',d:['mo','tu','we','th','fr','sa','su'],t:'2300-0700',a:'Sleeping',p:'offline'}]})
const plan=()=>parseRoutineDraft(raw).plan
const base='CANNOT_CALL_REAL_PROVIDER'

for(const action of ['disable','remove','delete'] as const)test(`production settings ${action} survives redraw, Save, reopening and backend restart`,async()=>{
 const f=fixture(),dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 let view:MochiView|undefined
 try{
  const account=await f.profile(),r=await f.room(account.id)
  await f.service.handle({type:'mochi:character_preferences',characterId:'alice_character',revision:0,routine:plan(),requestId:'defaults'},'alice')
  const sent:any[]=[]
  view=new MochiView(p=>sent.push(p),()=>document.body.replaceChildren(view!.render()),()=>{})
  view.state=await f.service.state('alice',account.id);view.select(r.id);view.editing=true
  const draw=()=>document.body.replaceChildren(view!.render())
  const click=(label:string)=>{const b=Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===label);expect(b, label).toBeDefined();b!.click()}
  draw()
  if(action==='disable'){const toggle=document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for Sam"]')!;toggle.checked=false;toggle.dispatchEvent(new dom.window.Event('change',{bubbles:true}))}
  else click(action==='remove'?'Remove entry sleep':'Delete weekly routine for Sam')
  expect(view.hasUnsavedChanges()).toBe(true)
  draw()
  if(action==='disable')expect(document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for Sam"]')!.checked).toBe(false)
  else expect(document.querySelector('[data-mochi-routine="panel"] [data-entry-id="sleep"]')).toBeNull()
  click('Save settings');const save=sent.at(-1);expect(save.type).toBe('mochi:update')
  await f.service.handle(save,'alice')
  expect(f.events.filter(e=>e.payload.type==='mochi:error')).toEqual([])
  view.receive(f.events.filter(e=>e.payload.type==='mochi:state'&&e.payload.requestId===save.requestId).at(-1)!.payload)
  f.restart();const saved=await f.service.read('alice',r.id,account.id),p=planFor(saved,'alice_character')!
  expect(p.entries.length).toBe(action==='disable'?1:0);expect(p.enabled).toBe(action==='remove')
  expect(saved.runtime!.routines!.alice_character.history).toHaveLength(1)
  view.select('');view.select(r.id);view.editing=true;draw()
  expect(document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for Sam"]')!.checked).toBe(p.enabled)
  expect(f.calls).toHaveLength(0)
 }finally{view?.destroy();globalThis.document=previous;dom.window.close();f.scheduler.stop()}
})

test('generation contract requests reviewed sleep covering weekends and night workers without filler',()=>{
 const prompt=routinePrompt({name:'Sam',description:base},'America/Chicago','Night shift worker')
 // AIGEN-02 keeps editable prose in the user task message, separate from the schema.
 const assembled=prompt.map(m=>m.content).join('\n')
 expect(assembled).toContain('sleep');expect(assembled).toContain('weekend');expect(assembled).toContain('night');expect(assembled).toContain('2300-0700')
 expect(JSON.parse(prompt[1].content).character.description).toBe(base)
})

test('valid sparse output without sleep stays editable and visibly warns rather than silently adding hours',()=>{
 const dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{
  const p=parseRoutineDraft(JSON.stringify({v:1,tz:'UTC',b:[]})).plan
  // Use the real editor, also used by generated draft previews.
  const root=routineControls(p,'draft Sam')
  expect(root.querySelector('[data-routine-warning]')?.textContent).toContain('No sleep')
  expect(p.entries).toEqual([])
 }finally{globalThis.document=previous;dom.window.close()}
})

for(const remove of [false,true])test(`direct Save settings persists ${remove?'last entry removal':'disabled toggle'} before any redraw`,async()=>{
 const f=fixture(),dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 let view:MochiView|undefined
 try{
  const r=await f.room();await f.service.configureRoutine('alice',{roomId:r.id,characterId:'alice_character',revision:r.revision,requestId:'seed',action:'save',plan:plan()})
  const sent:any[]=[];view=new MochiView(p=>sent.push(p),()=>{},()=>{});view.state=await f.service.state('alice');view.select(r.id);view.editing=true;document.body.append(view.render())
  if(remove)Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Remove entry sleep')!.click()
  else{const toggle=document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for Sam"]')!;toggle.checked=false;toggle.dispatchEvent(new dom.window.Event('change',{bubbles:true}))}
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Save settings')!.click()
  await f.service.handle(sent.at(-1),'alice');f.restart()
  const p=planFor(await f.service.read('alice',r.id),'alice_character')!
  if(remove)expect(p.entries).toHaveLength(0);else expect(p.enabled).toBe(false)
 }finally{view?.destroy();globalThis.document=previous;dom.window.close();f.scheduler.stop()}
})

for(const action of ['disable','remove','delete'] as const)test(`Character Preferences ${action} survives profile Save, fresh editor and restart`,async()=>{
 const f=fixture(),dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{
  let prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts)
  let saved=await prefs.save('alice',{characterId:'alice_character',revision:0,routine:plan()})
  const editor=new CharacterEditor(),sent:any[]=[],character={id:'alice_character',name:'Sam',preferences:saved}
  const render=()=>{const root=editor.render(character,p=>sent.push(p),()=>{},'availability');document.body.replaceChildren(root);return root}
  let root=render();expect(editor.dirty).toBe(false)
  if(action==='disable'){const toggle=root.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for character default Sam"]')!;toggle.checked=false;toggle.dispatchEvent(new dom.window.Event('change',{bubbles:true}))}
  else Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===(action==='remove'?'Remove entry sleep':'Delete weekly routine for character default Sam'))!.click()
  expect(editor.dirty).toBe(true);root=render()
  Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Save character profile')!.click()
  saved=await prefs.save('alice',sent.at(-1));f.restart();prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts)
  const read=await prefs.read('alice','alice_character');expect(read.routine?.entries.length).toBe(action==='disable'?1:0);expect(read.routine?.enabled).toBe(action==='remove')
  const fresh=new CharacterEditor().render({...character,preferences:read},()=>{},()=>{},'availability')
  expect(fresh.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for character default Sam"]')!.checked).toBe(read.routine!.enabled)
  await expect(prefs.save('alice',{...sent.at(-1)})).rejects.toThrow('changed')
  expect((await prefs.read('bob','bob_character')).routine).toBeUndefined();expect(f.calls).toHaveLength(0)
 }finally{globalThis.document=previous;dom.window.close();f.scheduler.stop()}
})

test('opening an unspecified character routine is clean and saving About Me does not create a routine',async()=>{
 const f=fixture(),dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{
  const prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts),saved=await prefs.read('alice','alice_character'),editor=new CharacterEditor(),sent:any[]=[]
  const c={id:'alice_character',name:'Sam',preferences:saved};editor.render(c,p=>sent.push(p),()=>{},'availability');expect(editor.dirty).toBe(false)
  const root=editor.render(c,p=>sent.push(p),()=>{},'about');Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Save character profile')!.click()
  expect((await prefs.save('alice',sent[0])).routine).toBeUndefined()
 }finally{globalThis.document=previous;dom.window.close();f.scheduler.stop()}
})

test('staged deletion is explicit, atomic, scoped, revision safe and undoable; defaults are a separate action',async()=>{
 const f=fixture();try{
  const a=await f.profile(),b=await f.profile('p2'),r=await f.room(a.id),other=await f.room(b.id),prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts)
  await prefs.save('alice',{characterId:'alice_character',revision:0,routine:plan()})
  const p={...plan(),enabled:false,entries:[]},input={accountId:a.id,roomId:r.id,revision:r.revision,requestId:'delete',title:r.title,characterIds:r.characterIds,settings:r.settings,routines:{alice_character:{base:plan(),plan:p}}}
  await expect(f.service.update('bob',input)).rejects.toThrow();await expect(f.service.update('alice',{...input,accountId:b.id})).rejects.toThrow()
  const path='alice:mochi/v1/rooms/'+r.id+'.json',before=structuredClone(f.files.get(path));f.fail(path)
  await expect(f.service.update('alice',input)).rejects.toThrow('Rename');expect(f.files.get(path)).toEqual(before);f.fail();f.restart()
  let saved=await f.service.update('alice',input);await f.service.update('alice',input)
  expect(saved.runtime!.routines!.alice_character.history).toHaveLength(1)
  await expect(f.service.update('alice',{...input,requestId:'stale'})).rejects.toThrow('changed')
  const changed={...plan(),fallback:{activity:'Unspecified time',presence:'online' as const}};await prefs.save('alice',{characterId:'alice_character',revision:1,routine:changed})
  f.restart();saved=await f.service.read('alice',r.id,a.id);expect(planFor(saved,'alice_character')).toEqual(p)
  expect(planFor(await f.service.read('alice',other.id,b.id),'alice_character')).toEqual(changed)
  saved=await f.service.update('alice',{accountId:a.id,roomId:r.id,revision:saved.revision,title:'Unrelated save',characterIds:r.characterIds,settings:r.settings})
  expect(planFor(saved,'alice_character')).toEqual(p)
  await f.service.configureRoutine('alice',{accountId:a.id,roomId:r.id,characterId:'alice_character',revision:saved.revision,requestId:'undo',action:'undo',changeId:'delete'})
  saved=await f.service.read('alice',r.id,a.id);expect(planFor(saved,'alice_character')).toEqual(changed)
  await f.service.configureRoutine('alice',{...input,revision:saved.revision,requestId:'empty',characterId:'alice_character',action:'save',plan:p})
  saved=await f.service.read('alice',r.id,a.id)
  await f.service.configureRoutine('alice',{...input,revision:saved.revision,requestId:'inherit',characterId:'alice_character',action:'defaults'})
  f.restart();expect(planFor(await f.service.read('alice',r.id,a.id),'alice_character')).toEqual(changed);expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})

test('staged edits reject changed inherited defaults, malformed plans and foreign keys without saving settings',async()=>{
 const f=fixture();try{
  const r=await f.room(),prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts),input={roomId:r.id,revision:r.revision,requestId:'staged',title:'Must not save',characterIds:r.characterIds,settings:r.settings,routines:{alice_character:{base:null,plan:defaultRoutine()}}}
  await prefs.save('alice',{characterId:'alice_character',revision:0,routine:plan()})
  await expect(f.service.update('alice',input)).rejects.toThrow('defaults changed')
  for(const routines of [{bob_character:{base:null,plan:plan()}},{alice_character:{base:plan(),plan:{...plan(),enabled:'false'}}},{alice_character:{base:plan(),plan:plan(),autonomy:'autonomous'}}])await expect(f.service.update('alice',{...input,routines})).rejects.toThrow()
  expect((await f.service.read('alice',r.id)).title).toBe(r.title)
 }finally{f.scheduler.stop()}
})

test('synthetic sleep output is retained through parse, reviewed apply, restart, overnight week wrap and DST',async()=>{
 const f=fixture();try{
  const r=await f.room();f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:raw}}
  const input={roomId:r.id,revision:r.revision,characterId:'alice_character',requestId:'sleepgen',timezone:'America/Chicago',guidance:'Sparse routine'}
  const result=await f.service.generateRoutine('alice',input);expect(result.draft.plan.entries).toEqual(plan().entries)
  expect((await f.service.read('alice',r.id)).runtime?.routines).toBeUndefined()
  await f.service.applyRoutineDraft('alice',{...input,requestId:'sleepapply',draftId:result.draftId,confirmed:true,...result.draft});f.restart()
  const saved=await f.service.read('alice',r.id)
  for(const at of ['2026-10-19T08:00:00Z','2026-03-08T07:45:00Z','2026-03-08T08:15:00Z','2026-11-01T06:45:00Z','2026-11-01T07:45:00Z'])expect(routineAt(saved,'alice_character',Date.parse(at))?.activity).toBe('Sleeping')
  expect(routineAt(saved,'alice_character',Date.parse('2026-10-19T12:00:00Z'))?.activity).toBe('Free time / hobbies')
  expect(f.calls).toHaveLength(1)
  expect(()=>parseRoutineDraft(JSON.stringify({v:1,tz:'UTC',b:[{d:['su'],t:'2300-0700',a:'Sleeping',p:'offline'},{d:['mo'],t:'0600-0800',a:'Work',p:'away'}]}))).toThrow('overlap')
 }finally{f.scheduler.stop()}
})

test('sleep warnings stay advisory for partial, daytime, unusual and intentionally sleepless schedules',()=>{
 const p=plan();expect(routineWarnings(p)).toEqual([])
 const daytime=structuredClone(p);daytime.entries[0].start=540;daytime.entries[0].end=1020;expect(routineWarnings(daytime)).toEqual([])
 p.entries[0].days=['mo'];expect(routineWarnings(p).join(' ')).toContain('weekends')
 p.entries[0].end=0;expect(routineWarnings(p).join(' ')).toContain('shorter than 4')
 const empty=parseRoutineDraft(JSON.stringify({v:1,tz:'UTC',b:[]}));expect(empty.plan.entries).toEqual([]);expect(routineWarnings(empty.plan).join(' ')).toContain('intentional')
})

test('missing-sleep generation preview warns and allows review, edit, regenerate and explicit acceptance without inserting sleep',async()=>{
 const f=fixture(),dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{
  const r=await f.room(),sent:any[]=[],panel=new RoutineDraftControls(()=>{}),noSleep=JSON.stringify({v:1,tz:'UTC',b:[]})
  f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:noSleep}}
  let root=panel.render(r,'alice_character','Sam',(type,p)=>sent.push({type,...p}))
  Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Generate schedule for Sam')!.click()
  const result=await f.service.generateRoutine('alice',sent.at(-1));panel.receive(result);root=panel.render(r,'alice_character','Sam',(type,p)=>sent.push({type,...p}))
  expect(root.querySelector('[data-routine-warning]')?.textContent).toContain('No sleep')
  expect(root.textContent).toContain('Regenerate schedule');expect(root.textContent).toContain('Add routine entry')
  expect((await f.service.read('alice',r.id)).runtime?.routines).toBeUndefined()
  Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Apply reviewed schedule and texting style for Sam')!.click()
  await f.service.applyRoutineDraft('alice',{...sent.at(-1),requestId:'intentional'});f.restart()
  expect(planFor(await f.service.read('alice',r.id),'alice_character')!.entries).toEqual([]);expect(f.calls).toHaveLength(1)
 }finally{globalThis.document=previous;dom.window.close();f.scheduler.stop()}
})

for(const width of [320,900])test(`${width}px organized Availability navigation retains chat edits and prevents wrong-scope profile Save`,async()=>{
 const f=fixture(),dom=new JSDOM('<body>',{pretendToBeVisual:true}),previous={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:dom.window.document,window:dom.window});dom.window.innerWidth=width
 let view:MochiView|undefined
 try{
  const r=await f.room(),sent:any[]=[],prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts)
  await prefs.save('alice',{characterId:'alice_character',revision:0,routine:plan()})
  const draw=()=>document.body.replaceChildren(view!.renderDesktop())
  view=new MochiView(p=>sent.push(p),draw,()=>{});view.state=await f.service.state('alice');view.select(r.id);draw()
  const click=(label:string)=>{const b=document.querySelector<HTMLButtonElement>('[aria-label="'+label+'"]')||Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===label);expect(b,label).toBeDefined();b!.click()}
  click('Chat Settings');click('Availability & Schedules');click('Edit character 1: Sam')
  expect(view.hasUnsavedChanges()).toBe(false)
  const toggle=document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for Sam"]')!;toggle.checked=false;toggle.dispatchEvent(new dom.window.Event('change',{bubbles:true}))
  const before=sent.length;click('Back to characters');click('General');click('Availability & Schedules');click('Edit character 1: Sam')
  expect(sent).toHaveLength(before);expect(document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for Sam"]')!.checked).toBe(false)
  const defaults=document.querySelector<HTMLInputElement>('[aria-label="Enable weekly routine for character default Sam"]')!;defaults.checked=false;defaults.dispatchEvent(new dom.window.Event('change',{bubbles:true}))
  click('Save settings');expect(sent.filter(p=>p.type==='mochi:update')).toHaveLength(0);expect(document.body.textContent).toContain('Save character profile or cancel character changes')
  click('Cancel character changes');click('Save settings')
  const request=sent.findLast(p=>p.type==='mochi:update');expect(request.routines.alice_character.plan.enabled).toBe(false)
  await f.service.handle(request,'alice');view.receive(f.events.findLast(e=>e.payload.requestId===request.requestId)!.payload)
  f.restart();expect(planFor(await f.service.read('alice',r.id),'alice_character')!.enabled).toBe(false)
  expect((await prefs.read('alice','alice_character')).routine!.enabled).toBe(true);expect(f.calls).toHaveLength(0)
 }finally{view?.destroy();Object.assign(globalThis,previous);dom.window.close();f.scheduler.stop()}
},30000)

test('invalid sleep output rejects the whole draft with an actionable private validation message',async()=>{
 const f=fixture();try{
  const r=await f.room(),invalid=JSON.stringify({v:1,tz:'UTC',b:[{d:['su'],t:'2300-0700',a:'Sleeping',p:'offline'},{d:['mo'],t:'0600-0800',a:'Work',p:'away'}]})
  const input={type:'mochi:routine_parse',roomId:r.id,revision:r.revision,characterId:'alice_character',requestId:'invalidsleep',raw:invalid}
  await f.service.handle(input,'alice');const error=f.events.findLast(e=>e.payload.requestId==='invalidsleep')!
  expect(error.user).toBe('alice');expect(error.payload.message).toContain('overlap');expect(error.payload.message).toContain('No changes were saved')
  expect((await f.service.read('alice',r.id)).runtime?.routines).toBeUndefined();expect(f.calls).toHaveLength(0)
  f.host.generate!.quiet=async()=>{throw Error('PRIVATE_PROVIDER_SENTINEL')}
  await f.service.handle({...input,type:'mochi:routine_generate',requestId:'private',timezone:'UTC'},'alice')
  expect(f.events.findLast(e=>e.payload.requestId==='private')!.payload.message).not.toContain('PRIVATE_PROVIDER_SENTINEL')
 }finally{f.scheduler.stop()}
})

test('deleting weekly entries retains autonomy, timezone, quiet hours and manual lock preferences',()=>{
 const dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{
  const p={...plan(),autonomy:'manual' as const,locked:true,quiet:[{days:['mo' as const],start:0,end:420}]},before=structuredClone(p)
  p.entries[0].locked=true
  const root=routineControls(p,'Sam');Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Delete weekly routine for Sam')!.click()
  expect(p).toEqual({...before,enabled:false,entries:[]})
 }finally{globalThis.document=previous;dom.window.close()}
})
