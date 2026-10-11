import {test,expect}from 'bun:test'
import {fixture}from './mochi-accounts.test.js'
import {storedPhoneKey,phoneContext}from '../src/mochi/phone-selection.js'
import {MochiView}from '../src/mochi/view.js'

const phoneA={chatId:'chat_a',characterId:'character',deviceOwnerActorId:'persona:chat_a:character'}
const phoneB={...phoneA,deviceOwnerActorId:'other_actor'}
const key=(p:typeof phoneA)=>[p.chatId,p.characterId,p.deviceOwnerActorId].map(encodeURIComponent).join('::')
test('native persisted identity validates semantic phone keys without native writes or RP inference',()=>{
  const raw={chatId:phoneA.chatId,characterId:phoneA.characterId,pocketPersonaActorId:phoneA.deviceOwnerActorId,contacts:[{id:'other_actor'}],discoveredActors:[],roleplayNow:'do not read me'},before=structuredClone(raw)
  expect(storedPhoneKey(phoneA,raw)).toBe(key(phoneA));expect(storedPhoneKey(phoneB,raw)).toBe(key(phoneB));expect(storedPhoneKey({...phoneA,chatId:'foreign'},raw)).toBeUndefined();expect(storedPhoneKey({...phoneA,deviceOwnerActorId:'unknown'},raw)).toBeUndefined();expect(raw).toEqual(before)
  expect(()=>phoneContext({chatId:'a'})).toThrow('identity')
})
test('two phones persist independent selections and startup preferences across service restart',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2');f.service.resolvePhone=async(_,p)=>key(p)
  for(const [phone,accountId]of [[phoneA,a.id],[phoneB,b.id]]as const)await f.service.selectAccount('alice',{phone,accountId,revision:(await f.service.fictionalAccounts.bank('alice')).revision})
  await f.service.fictionalAccounts.startup('alice',{preference:'picker',revision:(await f.service.fictionalAccounts.bank('alice')).revision},key(phoneB))
  expect((await f.service.accountsState('alice',phoneA)).phone).toEqual({supported:true,preference:'last-used',lastAccountId:a.id})
  f.restart();f.service.resolvePhone=async(_,p)=>key(p)
  expect((await f.service.accountsState('alice',phoneB)).phone).toEqual({supported:true,preference:'picker',lastAccountId:b.id});expect((await f.service.accountsState('alice',phoneA)).phone.lastAccountId).toBe(a.id);f.scheduler.stop()
})
test('selection on one phone cannot cancel another phone provider or redirect its character context',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id);f.service.resolvePhone=async(_,p)=>key(p)
  for(const phone of [phoneA,phoneB])await f.service.selectAccount('alice',{phone,accountId:a.id,revision:(await f.service.fictionalAccounts.bank('alice')).revision})
  let release!:(r:any)=>void,started!:()=>void;const ready=new Promise<void>(r=>{started=r})
  f.host.generate!.quiet=async request=>{f.calls.push(request);started();return new Promise(r=>{release=r})}
  const pending=f.service.message('alice',{phone:phoneA,accountId:a.id,roomId:room.id,revision:room.revision,requestId:'phone_owned',content:'Mary'})
  await ready;await f.service.selectAccount('alice',{phone:phoneB,accountId:b.id,revision:(await f.service.fictionalAccounts.bank('alice')).revision})
  release({content:'{"speakerId":"alice_character","text":"Mary reply"}'});await pending
  expect((await f.service.read('alice',room.id,a.id)).messages).toHaveLength(2);expect(f.calls[0].messages[0].content).toContain('MARY_PRIVATE');f.scheduler.stop()
})
test('picker startup handles stale archived selections and ignores stale account responses',async()=>{
  const f=fixture(),a=await f.profile();await f.select(a.id)
  const sent:any[]=[],view=new MochiView(p=>sent.push(p),()=>{},()=>{});view.open()
  const first=sent[0];view.receive({type:'mochi:accounts',requestId:first.requestId,state:await f.service.accountsState('alice')})
  expect(sent.at(-1).type).toBe('mochi:list');expect(sent.at(-1).accountId).toBe(a.id)
  view.receive({type:'mochi:state',requestId:sent.at(-1).requestId,state:await f.service.state('alice',a.id)})
  await f.service.archiveAccount('alice',{accountId:a.id,revision:a.revision,confirmed:true,roomPolicy:'preserve'});view.open()
  const current=sent.at(-1);view.receive({type:'mochi:accounts',requestId:first.requestId,state:{}});expect(view.busy).toBe(true)
  view.receive({type:'mochi:accounts',requestId:current.requestId,state:await f.service.accountsState('alice')});expect((view as any).pickerOpen).toBe(true);expect(view.state).toBeNull();view.destroy();f.scheduler.stop()
})
