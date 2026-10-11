import { test, expect } from 'bun:test'
import { fixture } from './mochi-accounts.test.js'
import { MochiProfiles } from '../src/mochi/profile-screen.js'
import { JSDOM } from 'jsdom'

test('custom portraits enforce real ownership and do not rewrite existing room snapshots',async()=>{
  const f=fixture();f.host.images={get:async(id,u)=>id==='own_portrait'&&u==='alice'?{id,mime_type:'image/png'}:null,list:async()=>({data:[{id:'own_portrait',mime_type:'image/png',original_filename:'Own'}]}),uploadFromDataUrl:async()=>({id:'own_portrait'})}
  const profile=await f.profile(),room=await f.room(profile.id)
  await expect(f.service.fictionalAccounts.update('alice',{accountId:profile.id,revision:profile.revision,avatarId:'foreign'})).rejects.toThrow('not available')
  const edited=await f.service.fictionalAccounts.update('alice',{accountId:profile.id,revision:profile.revision,avatarId:'own_portrait',username:'@'+'x'.repeat(32)})
  expect(edited.avatarUrl).toBe('/api/v1/images/own_portrait');expect(edited.username).toHaveLength(32)
  expect((await f.service.read('alice',room.id,profile.id)).persona.avatarUrl).toBe('/api/v1/images/portrait1')
  const clear=await f.service.fictionalAccounts.update('alice',{accountId:profile.id,revision:edited.revision,avatarId:''});expect(clear.avatarUrl).toBe('')
  await expect(f.service.fictionalAccounts.uploadAvatar('alice','data:image/svg+xml;base64,PHN2Zz4=')).rejects.toThrow('PNG')
  expect((await f.service.accountsState('alice')).avatars).toHaveLength(1);f.scheduler.stop()
})

test('profile forms preserve long text, explicit persona changes, saved revision and safe portrait choices',async()=>{
  const dom=new JSDOM('<body></body>'),before=globalThis.document;globalThis.document=dom.window.document
  try{
    const f=fixture(),profile=await f.profile(),screen=new MochiProfiles(),sent:any[]=[];screen.state=await f.service.accountsState('alice');screen.start(profile)
    const form=screen.render(false,(type,input)=>sent.push({type,...input}),()=>{},()=>{});dom.window.document.body.append(form)
    const name=form.querySelector<HTMLInputElement>('[aria-label="Profile display name"]')!;name.value='Very long fictional profile name';name.dispatchEvent(new dom.window.Event('input'))
    form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));expect(sent[0].revision).toBe(profile.revision);expect(sent[0].persona).toBeUndefined();expect(sent[0].displayName).toBe(name.value)
    const persona=form.querySelector<HTMLSelectElement>('[aria-label="Profile persona"]')!;persona.value='lumiverse:p2';persona.dispatchEvent(new dom.window.Event('change'));form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}))
    expect(sent[1].persona.sourceId).toBe('p2');expect(screen.draft!.displayName).toBe(name.value);f.scheduler.stop()
  }finally{globalThis.document=before;dom.window.close()}
})
