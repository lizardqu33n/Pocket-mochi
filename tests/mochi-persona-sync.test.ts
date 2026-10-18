import {expect,test} from 'bun:test'
import {resolveAccountAddonContext} from '../src/mochi/generation.js'
import {fixture} from './mochi-accounts.test.js'

test('optional explicit link survives restart; selective sync preserves snapshots, username and rejected fields',async()=>{
 const f=fixture()
 try{
  const a=await f.service.fictionalAccounts.create('alice',{username:'independent',persona:{source:'lumiverse',sourceId:'p1'},personaLink:{source:'lumiverse',sourceId:'p1'}}),room=await f.room(a.id)
  const before=structuredClone(f.files.get('alice:mochi/v1/rooms/'+room.id+'.json'))
  f.personas.get('alice:p1').name='Updated Mary';f.personas.get('alice:p1').description='New AI description'
  expect((await f.service.fictionalAccounts.get('alice',a.id)).displayName).toBe('Mary')
  const review=await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:1})
  expect(review.incoming?.name).toBe('Updated Mary');expect(review.signature).toHaveLength(64)
  await f.service.fictionalAccounts.sync('alice',{accountId:a.id,revision:1,signature:review.signature,fields:['displayName'],addons:[]})
  const saved=await f.service.fictionalAccounts.get('alice',a.id)
  expect(saved.displayName).toBe('Updated Mary');expect(saved.persona.description).toBe('MARY_PRIVATE');expect(saved.username).toBe('independent')
  expect(f.files.get('alice:mochi/v1/rooms/'+room.id+'.json')).toEqual(before)
  f.restart();expect((await f.service.fictionalAccounts.get('alice',a.id)).personaLink).toEqual({source:'lumiverse',sourceId:'p1'})
  const unlinked=await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:saved.revision,personaLink:null})
  expect(unlinked.personaLink).toBeUndefined();expect(unlinked.persona.description).toBe('MARY_PRIVATE')
  await expect(f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:unlinked.revision})).rejects.toThrow('no linked')
  expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})

test('sync rejects stale account/source, cross-owner access, unknown fields and incompatible add-ons without writes',async()=>{
 const f=fixture()
 try{
  const a=await f.service.fictionalAccounts.create('alice',{persona:{source:'lumiverse',sourceId:'p1'},personaLink:{source:'lumiverse',sourceId:'p1'}})
  const review=await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:1}),input={accountId:a.id,revision:1,signature:review.signature,fields:['description'],addons:[]}
  const before=structuredClone(f.files.get('alice:mochi/v1/fictional-accounts.json'))
  f.personas.get('alice:p1').description='Changed after preview'
  await expect(f.service.fictionalAccounts.sync('alice',input)).rejects.toThrow('source changed')
  await expect(f.service.fictionalAccounts.sync('bob',input)).rejects.toThrow('not available')
  const fresh=await f.service.fictionalAccounts.syncReview('alice',input)
  await expect(f.service.fictionalAccounts.sync('alice',{...input,signature:fresh.signature,fields:['username']})).rejects.toThrow('field')
  await expect(f.service.fictionalAccounts.sync('alice',{...input,signature:fresh.signature,addons:[{id:'foreign',enabled:true}]})).rejects.toThrow('incompatible')
  expect(f.files.get('alice:mochi/v1/fictional-accounts.json')).toEqual(before)
  await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:1,displayName:'Separate edit'})
  await expect(f.service.fictionalAccounts.sync('alice',{...input,signature:fresh.signature})).rejects.toThrow('changed elsewhere')
  f.personas.delete('alice:p1')
  const missing=await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:2})
  expect(missing.incoming).toBeUndefined();expect(missing.unavailable).toContain('preserved')
 }finally{f.scheduler.stop()}
})

test('each compatible add-on needs explicit approval; missing selections remain saved and source is read-only',async()=>{
 const f=fixture()
 try{
  const native=f.personas.get('alice:p1');native.metadata={addons:[{id:'one',label:'One',content:'One',enabled:false},{id:'two',label:'Two',content:'Two',enabled:false}]}
  const a=await f.service.fictionalAccounts.create('alice',{persona:{source:'lumiverse',sourceId:'p1'},personaLink:{source:'lumiverse',sourceId:'p1'},personaAddons:{personaId:'p1',enabledIds:['one']}})
  native.metadata.addons=[{id:'two',label:'Two',content:'Two',enabled:true}]
  const source=structuredClone(native),review=await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:1})
  await f.service.fictionalAccounts.sync('alice',{accountId:a.id,revision:1,signature:review.signature,fields:[],addons:[{id:'two',enabled:true}]})
  expect((await f.service.fictionalAccounts.get('alice',a.id)).personaAddons?.enabledIds).toEqual(['one','two'])
  expect(native).toEqual(source);expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})

test('linked add-on content is independently saved until individually synced, including after source removal',async()=>{
 const f=fixture()
 try{
  const native=f.personas.get('alice:p1');native.metadata={addons:[{id:'one',label:'One',content:'Saved content',enabled:true}]}
  const a=await f.service.fictionalAccounts.create('alice',{persona:{source:'lumiverse',sourceId:'p1'},personaLink:{source:'lumiverse',sourceId:'p1'},personaAddons:{personaId:'p1',enabledIds:['one']}}),room=await f.room(a.id)
  native.metadata.addons[0].content='Incoming content'
  expect((await resolveAccountAddonContext(f.host,room,'alice'))?.description).toContain('Saved content')
  const edited=await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:1,displayName:'Name only'})
  expect((await resolveAccountAddonContext(f.host,room,'alice'))?.description).not.toContain('Incoming content')
  const review=await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:edited.revision})
  await f.service.fictionalAccounts.sync('alice',{accountId:a.id,revision:edited.revision,signature:review.signature,fields:[],addons:[{id:'one',enabled:true}]})
  expect((await resolveAccountAddonContext(f.host,room,'alice'))?.description).toContain('Incoming content')
  f.personas.delete('alice:p1')
  expect((await resolveAccountAddonContext(f.host,room,'alice'))?.description).toContain('Incoming content')
  expect(f.calls).toHaveLength(0)
 }finally{f.scheduler.stop()}
})

test('unavailable permissions and incompatible source add-ons preserve account data; link metadata is validated',async()=>{
 const f=fixture()
 try{
  await expect(f.service.fictionalAccounts.create('alice',{persona:{source:'manual',name:'Independent'},personaLink:{source:'lumiverse',sourceId:'p1'}})).rejects.toThrow('Link an imported')
  const a=await f.service.fictionalAccounts.create('alice',{persona:{source:'lumiverse',sourceId:'p1'},personaLink:{source:'lumiverse',sourceId:'p1'}}),before=structuredClone(f.files.get('alice:mochi/v1/fictional-accounts.json'))
  f.personas.get('alice:p1').metadata={addons:Array.from({length:201},(_,i)=>({id:'addon_'+i,label:'Synthetic',content:'Synthetic',enabled:true}))}
  const incompatible=await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:1});expect(incompatible.unavailable).toContain('incompatible')
  f.host.permissions.has=()=>false
  expect((await f.service.fictionalAccounts.syncReview('alice',{accountId:a.id,revision:1})).unavailable).toContain('unavailable')
  expect(f.files.get('alice:mochi/v1/fictional-accounts.json')).toEqual(before)
 }finally{f.scheduler.stop()}
})
