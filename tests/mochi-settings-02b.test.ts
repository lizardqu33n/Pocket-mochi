import {CharacterEditor} from '../src/mochi/character-editor.js'
import {JSDOM} from 'jsdom'
import {applyDeliveredStatus} from '../src/mochi/behavior.js'
import {test,expect} from 'bun:test'
import {fixture} from './mochi-accounts.test.js'
import {MochiUIPreferences,sharedUIDefaults} from '../src/mochi/ui-preferences.js'
import {MochiCharacterPreferences} from '../src/mochi/character-preferences.js'
import {defaultPresence,statusFor,delayFor} from '../src/mochi/presence.js'
import {resolveMochiContext} from '../src/mochi/context.js'

test('shared setup explicitly chooses one layout, preserves all originals, rejects stale revisions and isolates owners',async()=>{
 const f=fixture();try{
 const a=await f.profile(),b=await f.profile('p2'),prefs=new MochiUIPreferences(f.host,f.service.fictionalAccounts),style={...sharedUIDefaults(),dock:'compact' as const,messageScale:140}
 await prefs.save('alice',{accountId:a.id,revision:0,preferences:style});await prefs.save('alice',{accountId:b.id,revision:0,preferences:{...style,presentation:'labels'}})
 const originals=JSON.stringify([...f.files]),layouts=await prefs.layouts('alice');expect(layouts.length).toBe(2);expect((await prefs.shared('alice')).revision).toBe(0)
 await expect(prefs.saveShared('alice',{revision:0,preferences:sharedUIDefaults()})).rejects.toThrow('Choose')
 await expect(prefs.saveShared('alice',{revision:0,preferences:style,setupSource:a.id,sourceRevision:99})).rejects.toThrow('changed')
 expect(JSON.stringify([...f.files])).toBe(originals)
 const saved=await prefs.saveShared('alice',{revision:0,preferences:sharedUIDefaults(),setupSource:a.id,sourceRevision:1});expect(saved.preferences).toEqual(style)
 expect((await prefs.read('alice',a.id)).preferences).toEqual(style);expect((await prefs.read('alice',b.id)).preferences.presentation).toBe('labels');expect((await prefs.shared('bob')).revision).toBe(0)
 await expect(prefs.saveShared('alice',{revision:0,preferences:style})).rejects.toThrow('changed')
 const next=await prefs.saveShared('alice',{revision:1,preferences:{...style,interfaceScale:150,messageScale:170}});expect(next.revision).toBe(2)
 for(const v of [{...style,messageScale:171},{...style,interfaceScale:84}])await expect(prefs.saveShared('alice',{revision:2,preferences:v})).rejects.toThrow('scale')
 f.restart();expect((await new MochiUIPreferences(f.host,f.service.fictionalAccounts).shared('alice')).preferences.messageScale).toBe(170);expect(f.calls.length).toBe(0)
 }finally{f.scheduler.stop()}
})
test('interrupted shared setup is resumable and leaves original layouts untouched',async()=>{
 const f=fixture();try{const p=new MochiUIPreferences(f.host,f.service.fictionalAccounts),move=f.host.userStorage.move;f.host.userStorage.move=async()=>{throw Error('Interrupted')};await expect(p.saveShared('alice',{revision:0,preferences:sharedUIDefaults()})).rejects.toThrow();expect((await p.shared('alice')).revision).toBe(0);f.host.userStorage.move=move;expect((await p.saveShared('alice',{revision:0,preferences:sharedUIDefaults()})).revision).toBe(1)}finally{f.scheduler.stop()}
})
test('character About Me and defaults are owner-scoped, independent of native cards, accounts and room history',async()=>{
 const f=fixture();try{
 const a=await f.profile(),b=await f.profile('p2'),room=await f.room(a.id),other=await f.room(b.id),p=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts),card=await f.host.characters.get('alice_character','alice'),before=JSON.stringify([...f.files].filter(([k])=>k.includes('/rooms/')))
 await p.save('alice',{characterId:'alice_character',revision:0,about:'Mochi public biography',texting:{length:'short',tone:'DEFAULT_TEXT_SENTINEL'},availability:{...defaultPresence(),automatic:'away',awayMs:120000}})
 expect((await p.read('alice','alice_character')).about).toBe('Mochi public biography');expect(await f.host.characters.get('alice_character','alice')).toEqual(card)
 expect(JSON.stringify([...f.files].filter(([k])=>k.includes('/rooms/')))).toBe(before)
 for(const chat of [room,other]){const current=await f.service.read('alice',chat.id,chat.accountId);expect(current.characterDefaults?.alice_character.texting?.length).toBe('short');expect(statusFor(current,'alice_character')).toBe('away');expect(delayFor(current,'alice_character')).toBe(120000)}
 await expect(p.save('alice',{characterId:'alice_character',revision:0,about:'stale'})).rejects.toThrow('changed');await expect(p.save('bob',{characterId:'alice_character',revision:0,about:'foreign'})).rejects.toThrow('unavailable')
 const state=await f.service.state('alice',a.id);expect(state.characters.find(c=>c.id==='alice_character')?.about).toBe('Mochi public biography');expect(f.calls.length).toBe(0)
 }finally{f.scheduler.stop()}
})
test('explicit chat overrides win, resetting inheritance leaves schedules intact, defaults never enter durable room data',async()=>{
 const f=fixture();try{
 const a=await f.profile(),room=await f.room(a.id),p=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts)
 await p.save('alice',{characterId:'alice_character',revision:0,about:'PUBLIC_ONLY_SENTINEL',texting:{tone:'DEFAULT_TEXT_SENTINEL'},availability:{...defaultPresence(),automatic:'offline'}})
 let current=await f.service.update('alice',{accountId:a.id,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings!,textingStyles:{alice_character:{tone:'CHAT_TEXT_SENTINEL'}}}})
 await f.service.configurePresence('alice',{accountId:a.id,roomId:room.id,revision:current.revision,characterId:'alice_character',presence:defaultPresence()});current=await f.service.read('alice',room.id,a.id);expect(statusFor(current,'alice_character')).toBe('online')
 const resolve=async(r:any)=>resolveMochiContext({...r,preset:undefined},[{id:'alice_character',name:'Character'}],'alice_character',async()=>100,new AbortController().signal)
 let prompt=JSON.stringify((await resolve(current)).messages);expect(prompt).toContain('CHAT_TEXT_SENTINEL');expect(prompt).not.toContain('DEFAULT_TEXT_SENTINEL');expect(prompt).not.toContain('PUBLIC_ONLY_SENTINEL')
 const jobs=structuredClone(current.runtime?.jobs)
 await f.service.configurePresence('alice',{accountId:a.id,roomId:room.id,revision:current.revision,characterId:'alice_character',useDefault:true});current=await f.service.read('alice',room.id,a.id);expect(statusFor(current,'alice_character')).toBe('offline');expect(current.runtime?.jobs).toEqual(jobs)
 current=await f.service.update('alice',{accountId:a.id,roomId:room.id,revision:current.revision,title:room.title,characterIds:room.characterIds,settings:{...current.settings!,textingStyles:undefined}});prompt=JSON.stringify((await resolve(current)).messages);expect(prompt).toContain('DEFAULT_TEXT_SENTINEL');expect(prompt.match(/CHARACTER TEXTING TENDENCIES/g)?.length).toBe(1)
 const stored=f.files.get('alice:mochi/v1/rooms/'+room.id+'.json');expect(stored.characterDefaults).toBeUndefined();expect(stored.settings.textingStyles).toBeUndefined();expect(stored.messages).toEqual(current.messages)
 await expect(p.save('alice',{characterId:'alice_character',revision:1,availability:{...defaultPresence(),transitions:[{at:1,status:'offline'}]}})).rejects.toThrow('conversation-specific')
 }finally{f.scheduler.stop()}
})
test('character save transport reports failure once without retrying writes or leaking storage errors',async()=>{
 const f=fixture();try{await f.service.handle({type:'mochi:character_preferences',requestId:'character_failed',characterId:'alice_character',revision:0,about:'x'.repeat(2001)},'alice');expect(f.events.filter(e=>e.payload.requestId==='character_failed').length).toBe(1);expect(f.events.at(-1)?.payload.type).toBe('mochi:error')}finally{f.scheduler.stop()}
})

test('delivered status uses inherited delays without mutating the character-wide record',()=>{
 const defaults={...defaultPresence(),awayMs:120000,dndMs:240000},room:any={characterIds:['c'],characterDefaults:{c:{availability:defaults}}}
 applyDeliveredStatus(room,'c','away',1);expect(room.runtime.presence.c.awayMs).toBe(120000);expect(defaults.automatic).toBe('online');expect(room.runtime.presence.c.automatic).toBe('away')
})
test('transport errors do not expose storage detail or retry a character write',async()=>{
 const f=fixture();try{let writes=0;f.host.userStorage.exists=async()=>{throw Error('PRIVATE_STORAGE_SENTINEL')};f.host.userStorage.setJson=async()=>{writes++};await f.service.handle({type:'mochi:character_preferences',requestId:'private_failure',characterId:'alice_character',revision:0,about:'test'},'alice');expect(writes).toBe(0);const events=f.events.filter(e=>e.payload.requestId==='private_failure');expect(events.length).toBe(1);expect(JSON.stringify(events)).not.toContain('PRIVATE_STORAGE_SENTINEL')}finally{f.scheduler.stop()}
})

test('invalid character preferences cannot clear valid saved defaults',async()=>{
 const f=fixture();try{const prefs=new MochiCharacterPreferences(f.host,f.service.fictionalAccounts);await prefs.save('alice',{characterId:'alice_character',revision:0,texting:{tone:'Keep'},availability:defaultPresence()});for(const invalid of [{texting:false},{texting:[]},{availability:false},{availability:{}},{characterId:undefined},{characterId:'../escape'}])await expect(prefs.save('alice',{characterId:'alice_character',revision:1,...invalid})).rejects.toThrow();expect((await prefs.read('alice','alice_character')).texting?.tone).toBe('Keep')}finally{f.scheduler.stop()}
})

test('changing default status preserves a staged delay in the same editor',()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{const sent:any[]=[],editor=new CharacterEditor(),root=editor.render({id:'c',name:'Character',avatarUrl:'',preferences:{version:1,ownerId:'alice',characterId:'c',revision:0,about:''}},p=>sent.push(p),()=>{},'availability');const delay=root.querySelector<HTMLInputElement>('[aria-label="Default Away delay for Character"]')!;delay.value='25';delay.dispatchEvent(new dom.window.Event('input'));const status=root.querySelector<HTMLSelectElement>('select')!;status.value='away';status.dispatchEvent(new dom.window.Event('change'));root.querySelector<HTMLButtonElement>('.mochi-primary')!.click();expect(sent[0].availability.awayMs).toBe(1500000);expect(sent[0].availability.automatic).toBe('away');expect(editor.dirty).toBe(true)}finally{globalThis.document=previous;dom.window.close()}
})
