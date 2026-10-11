import { expect, test } from 'bun:test'
import { MochiService, type MochiHost } from '../src/mochi/service.js'
import { MochiScheduler } from '../src/mochi/scheduler.js'
import { defaultMochiSettings } from '../src/mochi/types.js'
import { defaultPresence } from '../src/mochi/presence.js'
import { MochiView } from '../src/mochi/view.js'

const BANK = 'alice:mochi/v1/fictional-accounts.json'
function fixture() {
  const files = new Map<string, any>(), events: any[] = [], calls: any[] = []
  let counter = 0, now = 1000000, failure = '', owned = true
  const personas = new Map<string, any>([['alice:p1', { id: 'p1', name: 'Mary', description: 'MARY_PRIVATE', image_id: 'portrait1' }], ['alice:p2', { id: 'p2', name: 'Jane', description: 'JANE_PRIVATE' }], ['bob:p3', { id: 'p3', name: 'Bob persona', description: 'BOB_PRIVATE' }]])
  const read = async (key: string) => { if (!files.has(key)) throw Error('Missing file'); return structuredClone(files.get(key)) }
  const write = async (key: string, value: any) => { if (key === failure) throw Error('Disk write failed'); files.set(key, structuredClone(value)) }
  const move = async (a: string, b: string) => { if (b === failure) throw Error('Rename failed'); files.set(b, files.get(a)); files.delete(a) }
  const host: MochiHost = {
    storage: { exists: async p => files.has('global:'+p), getJson: p => read('global:'+p), setJson: (p,v) => write('global:'+p,v), move: (a,b) => move('global:'+a,'global:'+b) },
    userStorage: { exists: async(p,u) => files.has(u+':'+p), getJson: async(p,o) => !files.has(o.userId+':'+p) && 'fallback' in o ? o.fallback : read(o.userId+':'+p), setJson: (p,v,o) => write(o.userId+':'+p,v), move: (a,b,u) => move(u+':'+a,u+':'+b), list: async(p,u) => [...files.keys()].filter(k => k.startsWith(u+':'+p)).map(k => k.slice((u+':'+p).length)) },
    characters: { get: async(id,u) => id === u+'_character' ? { id, name: 'Sam' } : null, list: async({userId}) => ({ data: [{ id: userId+'_character', name: 'Sam' }] }) },
    personas: { get: async(id,u) => personas.get(u+':'+id) || null, list: async({userId}) => ({ data: [...personas].filter(([k]) => k.startsWith(userId+':')).map(([,p]) => p) }) },
    permissions: { has: () => true },
    connections: { get: async(id,u) => owned && id === u+'_connection' ? { id, model: 'synthetic' } : null, list: async u => [{ id: u+'_connection', name: 'Synthetic', model: 'synthetic' }] },
    tokens: { countMessages: async() => ({ total_tokens: 200 }) },
    generate: { quiet: async r => { calls.push(r); return { content: JSON.stringify({ speakerId: r.userId+'_character', text: 'Synthetic reply' }) } } },
    sendToFrontend: (payload,user) => events.push({ payload,user }),
  }
  let service = new MochiService(host, () => `room_${(++counter).toString(16).padStart(32,'0')}`, () => now)
  let scheduler = new MochiScheduler(host, service, () => now); scheduler.start(false)
  const profile = (sourceId='p1', user='alice') => service.fictionalAccounts.create(user, { persona: { source:'lumiverse', sourceId }, username:'@cozy_user' })
  const room = async(accountId?: string, user='alice') => {
    let room = await service.create(user, { accountId, title:'Separate chat', characterIds:[user+'_character'], persona:{source:'manual',name:'Legacy identity'} })
    room = await service.update(user,{accountId,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...defaultMochiSettings(),connectionId:user+'_connection'}})
    return room
  }
  const select = async(accountId:string) => service.selectAccount('alice', {accountId,revision:(await service.fictionalAccounts.bank('alice')).revision})
  return {files,events,calls,host,personas,profile,room,select,get service(){return service},get scheduler(){return scheduler},get now(){return now},advance:(ms:number)=>{now+=ms},fail:(p='')=>{failure=p},revoke:()=>{owned=false},restart:()=>{scheduler.stop();service=new MochiService(host,undefined,()=>now);scheduler=new MochiScheduler(host,service,()=>now);scheduler.start(false)}}
}

test('fictional profiles and selection survive restart without real-user or RP identity mixing',async()=>{
  const f=fixture(),mary=await f.profile(),jane=await f.profile('p2'),bob=await f.profile('p3','bob')
  await f.select(mary.id);f.restart()
  const bank=await f.service.accountsState('alice')
  expect(bank.selectedAccountId).toBe(mary.id);expect(bank.accounts).toHaveLength(2)
  expect(mary.username).toBe('cozy_user');expect(mary.avatarUrl).toBe('/api/v1/images/portrait1')
  expect((await f.service.accountsState('bob')).accounts.map(a=>a.id)).toEqual([bob.id])
  await expect(f.service.fictionalAccounts.get('bob',jane.id)).rejects.toThrow('not available')
  await expect(f.service.fictionalAccounts.create('alice',{persona:{source:'lumiverse',sourceId:'p3'}})).rejects.toThrow('not available')
  f.scheduler.stop()
})

test('account inboxes, notifications, histories and room associations are separate; legacy is unchanged',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),legacy=await f.room(),one=await f.room(a.id),two=await f.room(b.id)
  for(const [room,accountId,requestId] of [[one,a.id,'a_send'],[two,b.id,'b_send']] as const) await f.service.message('alice',{accountId,roomId:room.id,revision:room.revision,requestId,content:accountId})
  const sa=await f.service.state('alice',a.id),sb=await f.service.state('alice',b.id)
  expect(sa.rooms.map(r=>r.id)).toEqual([one.id]);expect(sb.rooms.map(r=>r.id)).toEqual([two.id])
  expect(sa.notifications![0].accountId).toBe(a.id);expect(sb.notifications![0].accountId).toBe(b.id)
  expect((await f.service.state('alice')).rooms.map(r=>r.id)).toEqual([legacy.id])
  expect((await f.service.accountsState('alice')).accounts.find(p=>p.id===a.id)!.roomIds).toEqual([one.id])
  await expect(f.service.read('alice',one.id)).rejects.toThrow('fictional account')
  await expect(f.service.read('bob',one.id,a.id)).rejects.toThrow('account')
  f.scheduler.stop()
})

test('wrong fictional scope cannot mutate messages, receipts, notifications or scheduling',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id),accountId=b.id
  await f.service.message('alice',{accountId:a.id,roomId:room.id,revision:room.revision,requestId:'seed',content:'Keep'})
  const saved=await f.service.read('alice',room.id,a.id),before=structuredClone(f.files.get('alice:mochi/v1/rooms/'+room.id+'.json'))
  const input={accountId,roomId:room.id,revision:saved.revision,requestId:'forbidden',content:'Overwrite'}
  const operations=[()=>f.service.message('alice',input),()=>f.service.update('alice',{...input,title:'Wrong',characterIds:room.characterIds}),()=>f.service.action('alice',{...input,action:'delete',confirmed:true,messageId:(saved.messages[0] as any).id}),()=>f.service.acknowledge('alice',input),()=>f.service.clearNotifications('alice',{accountId,action:'all',confirmed:true,rooms:[{roomId:room.id,notificationIds:saved.notifications!.map(n=>n.id)}]}),()=>f.service.cancel('alice',room.id,'unknown',accountId),()=>f.service.configureScheduledRoom('alice',{...input,enabled:false}),()=>f.service.configureIdle('alice',{...input,enabled:false}),()=>f.service.configurePresence('alice',{...input,characterId:'alice_character',presence:defaultPresence()}),()=>f.service.schedule('alice',{...input,occurrenceId:'wrong',dueAt:f.now},f.now),()=>f.service.cancelScheduled('alice',room.id,'wrong',accountId)]
  for(const op of operations) await expect(op()).rejects.toThrow('fictional account')
  expect(f.files.get('alice:mochi/v1/rooms/'+room.id+'.json')).toEqual(before);expect(f.calls).toHaveLength(1)
  f.scheduler.stop()
})

test('profile edits are revision-safe and prospective, preserving room persona and historical authorship',async()=>{
  const f=fixture(),a=await f.profile(),room=await f.room(a.id)
  await f.service.message('alice',{accountId:a.id,roomId:room.id,revision:room.revision,requestId:'old_author',content:'Mary says hello'})
  const before=await f.service.read('alice',room.id,a.id)
  const edited=await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,displayName:'Future Jane',username:'future_name',persona:{source:'lumiverse',sourceId:'p2'}})
  expect(edited.persona.description).toBe('JANE_PRIVATE')
  await expect(f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,displayName:'Stale'})).rejects.toThrow('changed elsewhere')
  expect(await f.service.read('alice',room.id,a.id)).toEqual(before)
  const later=await f.room(a.id);expect(later.persona.name).toBe('Future Jane');expect(later.persona.description).toBe('JANE_PRIVATE')
  expect(f.calls[0].messages[0].content).toContain('MARY_PRIVATE');expect(f.calls[0].messages[0].content).not.toContain('JANE_PRIVATE')
  await expect(f.service.update('alice',{accountId:a.id,roomId:room.id,revision:before.revision,persona:{source:'manual',name:'Unexpected'}})).rejects.toThrow('snapshot')
  f.scheduler.stop()
})

test('switching accounts aborts the previous interactive provider even when it ignores cancellation',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id);await f.select(a.id)
  let release!:(v:any)=>void,started!:()=>void;const ready=new Promise<void>(r=>{started=r})
  f.host.generate!.quiet=async r=>{f.calls.push(r);started();return new Promise(resolve=>{release=resolve})}
  const running=f.service.message('alice',{accountId:a.id,roomId:room.id,revision:room.revision,requestId:'late',content:'Saved user text'})
  await ready;await f.select(b.id);release({content:'{"speakerId":"alice_character","text":"Unwanted late reply"}'})
  await expect(running).rejects.toThrow()
  expect((await f.service.read('alice',room.id,a.id)).messages).toHaveLength(1)
  expect((await f.service.state('alice',b.id)).notifications).toEqual([])
  expect((await f.service.fictionalAccounts.bank('alice')).selectedAccountId).toBe(b.id);f.scheduler.stop()
})

test('archival requires confirmation and an explicit preservation policy; restore retains all room data',async()=>{
  const f=fixture(),a=await f.profile(),room=await f.room(a.id);await f.select(a.id)
  await f.scheduler.configure('alice',true)
  await f.service.configureScheduledRoom('alice',{accountId:a.id,roomId:room.id,revision:room.revision,enabled:true})
  await f.service.schedule('alice',{accountId:a.id,roomId:room.id,revision:room.revision,occurrenceId:'retained',dueAt:f.now+60000},f.now)
  const path='alice:mochi/v1/rooms/'+room.id+'.json',before=structuredClone(f.files.get(path))
  await expect(f.service.archiveAccount('alice',{accountId:a.id,revision:a.revision,roomPolicy:'preserve'})).rejects.toThrow('Confirm')
  await expect(f.service.archiveAccount('alice',{accountId:a.id,revision:a.revision,confirmed:true,roomPolicy:'delete'})).rejects.toThrow('preserve')
  await f.service.archiveAccount('alice',{accountId:a.id,revision:a.revision,confirmed:true,roomPolicy:'preserve'})
  f.advance(60000);await f.scheduler.tick();expect(f.calls).toHaveLength(0);expect(f.files.get(path)).toEqual(before)
  expect((await f.service.accountsState('alice')).accounts[0].roomIds).toEqual([room.id])
  expect((await f.service.fictionalAccounts.bank('alice')).selectedAccountId).toBe('')
  await expect(f.service.state('alice',a.id)).rejects.toThrow('not available')
  const archived=await f.service.fictionalAccounts.get('alice',a.id,true)
  await f.service.fictionalAccounts.restore('alice',{accountId:a.id,revision:archived.revision,confirmed:true})
  await f.scheduler.tick();expect((await f.service.read('alice',room.id,a.id)).messages).toHaveLength(1)
  expect(f.calls).toHaveLength(1);f.scheduler.stop()
})

test('server jobs retain their owning fictional account after selection changes and restart',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id);await f.select(a.id)
  await f.scheduler.configure('alice',true);await f.service.configureScheduledRoom('alice',{accountId:a.id,roomId:room.id,revision:room.revision,enabled:true})
  await f.service.schedule('alice',{accountId:a.id,roomId:room.id,revision:room.revision,occurrenceId:'owned_job',dueAt:f.now},f.now)
  await f.select(b.id);f.restart();await f.scheduler.tick()
  expect((await f.service.state('alice',a.id)).notifications).toHaveLength(1)
  expect((await f.service.state('alice',b.id)).notifications).toEqual([])
  expect(f.calls[0].messages[0].content).toContain('MARY_PRIVATE');expect(f.calls[0].messages[0].content).not.toContain('JANE_PRIVATE')
  const event=f.events.find(e=>e.payload.type==='mochi:notification')!
  expect(event.user).toBe('alice');expect(event.payload.accountId).toBe(a.id)
  const view=new MochiView(()=>{},()=>{},()=>{});view.state=await f.service.state('alice',b.id);view.receive(event.payload)
  expect(view.state.notifications).toEqual([]);view.destroy();f.scheduler.stop()
})

test('failed account replacement preserves committed profiles and ignores abandoned pending records',async()=>{
  const f=fixture(),a=await f.profile(),before=structuredClone(f.files.get(BANK))
  f.fail(BANK)
  await expect(f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,displayName:'Lost write'})).rejects.toThrow('Rename')
  expect(f.files.get(BANK)).toEqual(before);expect(f.files.has(BANK+'.pending')).toBe(true)
  f.restart();expect((await f.service.fictionalAccounts.get('alice',a.id)).displayName).toBe('Mary')
  f.fail();await f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,displayName:'Committed'})
  expect((await f.service.fictionalAccounts.get('alice',a.id)).displayName).toBe('Committed');f.scheduler.stop()
})

test('room creation ownership is atomic and does not need a second account-index write',async()=>{
  const f=fixture(),a=await f.profile(),before=structuredClone(f.files.get(BANK));f.fail('alice:mochi/v1/rooms/room_'+'0'.repeat(31)+'1.json')
  await expect(f.room(a.id)).rejects.toThrow('Rename')
  expect((await f.service.state('alice',a.id)).rooms).toEqual([]);expect((await f.service.accountsState('alice')).accounts[0].roomIds).toEqual([])
  expect(f.files.get(BANK)).toEqual(before);f.fail();const room=await f.room(a.id)
  expect((await f.service.accountsState('alice')).accounts[0].roomIds).toEqual([room.id]);f.scheduler.stop()
})

test('concurrent account creates preserve both profiles and stale selection is rejected',async()=>{
  const f=fixture(),[a,b]=await Promise.all([f.profile(),f.profile('p2')])
  const bank=await f.service.fictionalAccounts.bank('alice');expect(bank.accounts).toHaveLength(2)
  await f.service.selectAccount('alice',{accountId:a.id,revision:bank.revision})
  await expect(f.service.selectAccount('alice',{accountId:b.id,revision:bank.revision})).rejects.toThrow('changed elsewhere')
  expect((await f.service.fictionalAccounts.bank('alice')).selectedAccountId).toBe(a.id);f.scheduler.stop()
})

test('malformed identifiers, profiles and copied foreign account records fail closed without overwrites',async()=>{
  const f=fixture(),a=await f.profile(),before=structuredClone(f.files.get(BANK))
  await expect(f.service.fictionalAccounts.get('alice','../account')).rejects.toThrow('identifier')
  await expect(f.service.fictionalAccounts.create('alice',{persona:{source:'manual',name:'Name'},username:'x'.repeat(34)})).rejects.toThrow()
  await expect(f.service.fictionalAccounts.update('alice',{accountId:a.id,revision:a.revision,displayName:' '.repeat(4)})).rejects.toThrow('field')
  expect(f.files.get(BANK)).toEqual(before)
  const bad=structuredClone(before);bad.accounts[0].ownerId='bob';f.files.set(BANK,bad)
  await expect(f.service.fictionalAccounts.create('alice',{persona:{source:'manual',name:'Replacement'}})).rejects.toThrow('preserved')
  expect(f.files.get(BANK)).toEqual(bad);f.scheduler.stop()
})

test('authenticated callback owns account operations; payload cannot choose another real user',async()=>{
  const f=fixture()
  await f.service.handle({type:'mochi:account_create',userId:'bob',requestId:'spoof',persona:{source:'lumiverse',sourceId:'p1'}},'alice')
  expect((await f.service.accountsState('alice')).accounts).toHaveLength(1);expect((await f.service.accountsState('bob')).accounts).toEqual([])
  expect(f.events[0].user).toBe('alice');expect(f.events[0].payload.type).toBe('mochi:accounts')
  f.scheduler.stop()
})

test('wrong-account Stop cannot abort another account and archival discards its late output',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id)
  let release!:(v:any)=>void,started!:()=>void,signal!:AbortSignal;const ready=new Promise<void>(r=>{started=r})
  f.host.generate!.quiet=async r=>{signal=r.signal;started();return new Promise(resolve=>{release=resolve})}
  const running=f.service.message('alice',{accountId:a.id,roomId:room.id,revision:room.revision,requestId:'archive_late',content:'Keep this user message'})
  await ready
  await expect(f.service.cancel('alice',room.id,'archive_late',b.id)).rejects.toThrow('fictional account')
  expect(signal.aborted).toBe(false)
  expect((await f.service.state('alice',a.id)).jobs![room.id]).toBe('archive_late')
  await f.service.archiveAccount('alice',{accountId:a.id,revision:a.revision,confirmed:true,roomPolicy:'preserve'})
  expect(signal.aborted).toBe(true)
  release({content:'{"speakerId":"alice_character","text":"Discard me"}'})
  await expect(running).rejects.toThrow()
  const raw=f.files.get('alice:mochi/v1/rooms/'+room.id+'.json')
  expect(raw.messages).toHaveLength(1);expect(raw.notifications).toEqual([]);expect(raw.receipts).toEqual(['archive_late'])
  f.scheduler.stop()
})

test('account-scoped edits, rerolls and notification clear preserve the other account',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),one=await f.room(a.id),two=await f.room(b.id)
  await f.service.message('alice',{accountId:a.id,roomId:one.id,revision:one.revision,requestId:'actions_a',content:'A'})
  await f.service.message('alice',{accountId:b.id,roomId:two.id,revision:two.revision,requestId:'actions_b',content:'B'})
  const other=structuredClone(f.files.get('alice:mochi/v1/rooms/'+two.id+'.json'))
  let saved=await f.service.read('alice',one.id,a.id),message=saved.messages[1] as any
  await f.service.action('alice',{accountId:a.id,roomId:one.id,revision:saved.revision,requestId:'edit_a',messageId:message.id,action:'edit',content:'Edited A'})
  saved=await f.service.read('alice',one.id,a.id)
  await f.service.message('alice',{accountId:a.id,roomId:one.id,revision:saved.revision,requestId:'reroll_a',messageId:message.id,confirmed:true},true)
  await f.service.acknowledge('alice',{accountId:a.id,roomId:one.id})
  saved=await f.service.read('alice',one.id,a.id)
  await f.service.clearNotifications('alice',{accountId:a.id,action:'read',rooms:[{roomId:one.id,notificationIds:saved.notifications!.map(n=>n.id)}]})
  expect((await f.service.read('alice',one.id,a.id)).messages).toEqual(saved.messages)
  expect((await f.service.state('alice',a.id)).notifications).toEqual([])
  expect(f.files.get('alice:mochi/v1/rooms/'+two.id+'.json')).toEqual(other);f.scheduler.stop()
})

test('view requests and notification acknowledgements carry their fictional account scope',async()=>{
  const f=fixture(),a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id),sent:any[]=[]
  await f.service.message('alice',{accountId:a.id,roomId:room.id,revision:room.revision,requestId:'view_seed',content:'Hello'})
  const view=new MochiView(p=>sent.push(p),()=>{},()=>{});view.state=await f.service.state('alice',a.id);view.select(room.id)
  ;(view as any).markNotifications(room.id)
  expect(sent[0].accountId).toBe(a.id);view.load();expect(sent[1].accountId).toBe(a.id)
  view.receive({type:'mochi:notifications',accountId:b.id,notifications:[],notificationRevisions:{[room.id]:999}})
  expect(view.state.notifications).toHaveLength(1)
  view.destroy();f.scheduler.stop()
})

test('revoked connection and persona sources prevent generation without losing accepted account history',async()=>{
  const f=fixture(),a=await f.profile(),room=await f.room(a.id);f.revoke()
  await expect(f.service.message('alice',{accountId:a.id,roomId:room.id,revision:room.revision,requestId:'revoked_connection',content:'Saved despite failure'})).rejects.toThrow('connection')
  expect(f.calls).toEqual([]);expect((await f.service.read('alice',room.id,a.id)).messages).toHaveLength(1)
  f.personas.delete('alice:p1')
  await expect(f.room(a.id)).rejects.toThrow('persona');f.scheduler.stop()
})
