import { test, expect } from 'bun:test'
import { fixture } from './mochi-accounts.test.js'
import { discoverPersonaAddons, addonContext, expandPersonaOutlets } from '../src/mochi/persona-addons.js'
import { generateMochiReply, resolveGenerationSources } from '../src/mochi/generation.js'
import { resolveMochiContext } from '../src/mochi/context.js'
import { defaultPreset } from '../src/mochi/presets.js'
import { MochiProfiles } from '../src/mochi/profile-screen.js'
import { JSDOM } from 'jsdom'

function addonsFixture(){
 const f=fixture(),native=f.personas.get('alice:p1')!
 native.metadata={addons:[{id:'local',label:'Local fixture',content:'LOCAL_BODY',enabled:true,sort_order:2},{id:'outlet',label:'Outlet fixture',content:'OUTLET_BODY',enabled:true,sort_order:1,outlet_name:' Mood '},{id:'disabled',label:'Off fixture',content:'OFF_BODY',enabled:false,sort_order:3}],attached_global_addons:[{id:'global',enabled:true},{id:'foreign',enabled:true}]}
 const globals=new Map<string,any>([['global',{id:'global',label:'Shared fixture',content:'GLOBAL_BODY',sort_order:0}]])
 f.host.global_addons={get:async(id,user)=>user==='alice'?globals.get(id)||null:null}
 const select=(enabledIds:string[])=>({personaId:'p1',enabledIds})
 const create=(enabledIds:string[])=>f.service.fictionalAccounts.create('alice',{persona:{source:'lumiverse',sourceId:'p1'},personaAddons:select(enabledIds)})
 const run=(room:any)=>generateMochiReply(f.host,room,'alice','auto',new AbortController().signal)
 return Object.assign(f,{native,globals,select,create,run})
}

test('native discovery preserves local/global order, outlet semantics and ownership without mutating definitions',async()=>{
 const f=addonsFixture(),before=JSON.stringify(f.native)
 try{
  const choices=await discoverPersonaAddons(f.host,f.native,'alice')
  expect(choices.map(a=>a.id)).toEqual(['outlet','local','disabled','global','foreign'])
  expect(choices[0].outletName).toBe('mood');expect(choices.at(-1)?.available).toBe(false)
  const ctx=addonContext('BASE',choices,f.select(['local','outlet','global','foreign']))
  expect(ctx.description).toBe('BASE\nLOCAL_BODY\nGLOBAL_BODY');expect(ctx.outlets).toEqual({mood:'OUTLET_BODY'})
  expect(JSON.stringify(ctx)).not.toContain('OFF_BODY');expect(JSON.stringify(f.native)).toBe(before)
  expect((await discoverPersonaAddons({...f.host,permissions:{has:()=>false}},f.native,'alice'))).toEqual([])
 }finally{f.scheduler.stop()}
})

test('account add-ons persist and edits affect future generation in existing rooms without rewriting history or snapshots',async()=>{
 const f=addonsFixture()
 try{
  const a=await f.create(['local','outlet','global']),room=await f.room(a.id),before=JSON.stringify(room)
  await f.run(room);let body=JSON.stringify(f.calls.at(-1).messages)
  expect(body.match(/LOCAL_BODY/g)).toHaveLength(1);expect(body.match(/GLOBAL_BODY/g)).toHaveLength(1);expect(body).not.toContain('OUTLET_BODY');expect(body).not.toContain('OFF_BODY')
  const updated=await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,personaAddons:f.select(['disabled'])})
  expect(updated.personaAddons?.enabledIds).toEqual(['disabled']);f.restart()
  expect((await f.service.fictionalAccounts.get('alice',a.id)).personaAddons?.enabledIds).toEqual(['disabled'])
  await f.run(room);body=JSON.stringify(f.calls.at(-1).messages)
  expect(body).toContain('OFF_BODY');expect(body).not.toContain('LOCAL_BODY');expect(body).not.toContain('GLOBAL_BODY')
  expect(JSON.stringify(await f.service.read('alice',room.id,a.id))).toBe(before)
 }finally{f.scheduler.stop()}
})

test('old accounts stay unchanged, explicit empty selection includes no add-ons, and accounts cannot borrow preferences',async()=>{
 const f=addonsFixture()
 try{
  const legacy=await f.profile(),empty=await f.create([]),enabled=await f.create(['local'])
  for(const a of [legacy,empty]){await f.run(await f.room(a.id));expect(JSON.stringify(f.calls.at(-1).messages)).not.toContain('LOCAL_BODY')}
  await f.run(await f.room(enabled.id));expect(JSON.stringify(f.calls.at(-1).messages)).toContain('LOCAL_BODY')
  await expect(f.service.fictionalAccounts.update('bob',{accountId:enabled.id,revision:enabled.revision,personaAddons:f.select(['local'])})).rejects.toThrow('not available')
  await expect(f.service.fictionalAccounts.update('alice',{accountId:enabled.id,revision:enabled.revision,personaAddons:{personaId:'p2',enabledIds:['local']}})).rejects.toThrow('available Lumiverse persona')
  await expect(f.service.fictionalAccounts.update('alice',{accountId:enabled.id,revision:enabled.revision,personaAddons:f.select(['local','local'])})).rejects.toThrow('Invalid')
 }finally{f.scheduler.stop()}
})

test('deleted, detached and inaccessible definitions are omitted and pruned on save; current content is fetched',async()=>{
 const f=addonsFixture()
 try{
  const a=await f.create(['local','global','foreign']),room=await f.room(a.id)
  expect(a.personaAddons?.enabledIds).toEqual(['local','global'])
  f.native.metadata.addons.find((a:any)=>a.id==='local').content='UPDATED_LOCAL'
  f.globals.delete('global');await f.run(room)
  const body=JSON.stringify(f.calls.at(-1).messages);expect(body).toContain('UPDATED_LOCAL');expect(body).not.toContain('GLOBAL_BODY');expect(body).not.toContain('LOCAL_BODY')
  f.native.metadata.addons=[]
  const saved=await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,personaAddons:f.select(['local','global'])})
  expect(saved.personaAddons?.enabledIds).toEqual([])
  f.personas.delete('alice:p1');await expect(f.run(room)).rejects.toThrow('persona')
 }finally{f.scheduler.stop()}
})

test('persona switching clears mismatched selections while existing room identity stays preserved',async()=>{
 const f=addonsFixture()
 try{
  const a=await f.create(['local']),room=await f.room(a.id)
  const changed=await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,persona:{source:'lumiverse',sourceId:'p2'}})
  expect(changed.personaAddons).toBeUndefined();await f.run(room)
  expect(JSON.stringify(f.calls.at(-1).messages)).toContain('MARY_PRIVATE');expect(JSON.stringify(f.calls.at(-1).messages)).not.toContain('LOCAL_BODY')
 }finally{f.scheduler.stop()}
})

test('outlet placement is case insensitive, nonrecursive and separate from persona context and raw dialogue',async()=>{
 const f=addonsFixture()
 try{
  const a=await f.create(['outlet','local']),room=await f.room(a.id)
  room.settings!.instructions='Mood: {{personaOutlet::MOOD}}'
  room.messages=[{id:'m',role:'user',name:'You',content:'{{persona_outlet::mood}}',createdAt:'2026-10-16T00:00:00Z',requestId:'r',avatarUrl:''}]
  const sources=await resolveGenerationSources(f.host,room,'alice','auto')
  const context=await resolveMochiContext(room,sources.characters,sources.speaker,async()=>100,new AbortController().signal,false,sources.preset,sources.personaContext)
  expect(context.messages[0].content.match(/OUTLET_BODY/g)).toHaveLength(1);expect(context.messages[1].content).toContain('{{persona_outlet::mood}}')
  const preset={...defaultPreset(),layout:'manual-v1' as const,placement:{version:1 as const,rows:[{id:'section_'+'a'.repeat(32),title:'Identity',template:'{{mochi_persona}}'},{id:'section_'+'b'.repeat(32),title:'Mood',template:'{{persona_outlet::mood}} {{personaOutlet::MOOD}}'}]}}
  const manual=await resolveMochiContext(room,sources.characters,sources.speaker,async()=>100,new AbortController().signal,false,preset,sources.personaContext)
  expect(JSON.stringify(manual.messages).match(/OUTLET_BODY/g)).toHaveLength(1)
  expect(expandPersonaOutlets('{{persona_outlet::missing}} {{persona_outlet::mood}}',{mood:'{{mochi_history}}'})).toBe(' {{mochi_history}}')
 }finally{f.scheduler.stop()}
})

test('profile editing shows native add-ons and persists checked account choices without resnapshotting base persona',async()=>{
 const f=addonsFixture(),dom=new JSDOM('<body></body>'),prior=globalThis.document;globalThis.document=dom.window.document
 try{
  const a=await f.create(['local']),screen=new MochiProfiles(),sent:any[]=[];screen.state=await f.service.accountsState('alice');screen.start(a)
  const form=screen.render(false,(type,input)=>sent.push({type,...input}),()=>{},()=>{});document.body.append(form)
  const local=form.querySelector<HTMLInputElement>('[aria-label="Enable add-on Local fixture"]')!,off=form.querySelector<HTMLInputElement>('[aria-label="Enable add-on Off fixture"]')!
  expect(local.checked).toBe(true);expect(off.checked).toBe(false)
  local.checked=false;local.dispatchEvent(new dom.window.Event('change'));off.checked=true;off.dispatchEvent(new dom.window.Event('change'))
  form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}))
  expect(sent[0].persona).toBeUndefined();expect(sent[0].personaAddons).toEqual(f.select(['disabled']));expect(screen.hasUnsavedChanges()).toBe(true)
 }finally{globalThis.document=prior;dom.window.close();f.scheduler.stop()}
})

test('account add-on changes during provider execution discard stale replies',async()=>{
 const f=addonsFixture()
 try{
  const a=await f.create(['local']),room=await f.room(a.id)
  f.host.generate!.quiet=async()=>{await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,personaAddons:f.select([])});return {content:'{"speakerId":"alice_character","text":"stale fixture"}'}}
  await expect(f.run(room)).rejects.toThrow('changed during generation')
  expect((await f.service.read('alice',room.id,a.id)).messages).toEqual([])
 }finally{f.scheduler.stop()}
})

test('plain hybrid replies retain authorized native persona add-on context without changing stored history',async()=>{
 const f=addonsFixture()
 try{
  const a=await f.create(['local','outlet','global']),room=await f.room(a.id),before=JSON.stringify(room)
  f.host.generate!.quiet=async request=>{f.calls.push(request);return{content:'Plain persona reply 💜\nSecond line'}}
  const reply=await f.run(room);expect(reply.text).toBe('Plain persona reply 💜\nSecond line');expect(reply.character.id).toBe(room.characterIds[0])
  const body=JSON.stringify(f.calls.at(-1).messages);expect(body.match(/LOCAL_BODY/g)).toHaveLength(1);expect(body.match(/GLOBAL_BODY/g)).toHaveLength(1);expect(body).not.toContain('OUTLET_BODY');expect(JSON.stringify(await f.service.read('alice',room.id,a.id))).toBe(before)
 }finally{f.scheduler.stop()}
})
