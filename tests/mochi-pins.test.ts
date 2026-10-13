import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {pinsPanel} from '../src/mochi/pins-panel.js'

function fixture(){
 const files=new Map<string,unknown>(),calls:any[]=[],events:any[]=[]
 const host:MochiHost={userStorage:{exists:async(p,u)=>files.has(u+':'+p),getJson:async(p,o)=>files.has(o.userId+':'+p)?structuredClone(files.get(o.userId+':'+p)):'fallback'in o?o.fallback:Promise.reject(Error('Missing')),setJson:async(p,d,o)=>{files.set(o.userId+':'+p,structuredClone(d))},move:async(a,b,u)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async(p,u)=>Array.from(files.keys()).filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length))},permissions:{has:()=>true},characters:{get:async(id,u)=>id===u+'_character'?{id,name:'Character'}:null,list:async()=>({data:[]})},personas:{get:async()=>null,list:async()=>({data:[]})},connections:{get:async(id,u)=>id===u+'_connection'?{id,model:'synthetic'}:null,list:async()=>[]},tokens:{countMessages:async m=>({total_tokens:Math.ceil(JSON.stringify(m).length/4)})},generate:{quiet:async r=>{calls.push(r);return{content:JSON.stringify({speakerId:'alice_character',text:'Synthetic response',reactions:[{actorId:'forged',messageId:'foreign',emoji:'❤️'}]})}}},sendToFrontend:p=>events.push(p)}
 const service=new MochiService(host)
 const create=async(fictional=false)=>{
  const accountId=fictional?(await service.fictionalAccounts.create('alice',{displayName:'Synthetic profile',username:'',persona:{source:'manual',name:'Synthetic',description:''}})).id:undefined
  const input={accountId,title:'Synthetic',characterIds:['alice_character'],persona:fictional?undefined:{source:'manual',name:'Me',description:''}}
  let room=await service.create('alice',input);room=await service.update('alice',{...input,roomId:room.id,revision:room.revision,settings:{...defaultMochiSettings(),autoReply:false,responseMode:'manual',connectionId:'alice_connection'}})
  await service.message('alice',{accountId,roomId:room.id,revision:room.revision,requestId:'seed',content:'Original message'})
  return{room:await service.read('alice',room.id,accountId),accountId,input}
 }
 const react=(room:any,accountId:string|undefined,requestId:string,emoji='👍',extras:any={})=>service.react('alice',{accountId,roomId:room.id,revision:room.revision,messageId:(room.messages[0]as any).id,requestId,emoji,...extras})
 return{host,files,calls,events,service,create,react}
}

const mutate=async(f:ReturnType<typeof fixture>,room:any,values:any,requestId='pin_request')=>f.service.pinnedContent('alice',{accountId:room.accountId,roomId:room.id,revision:room.revision,requestId,...values})
for(const fictional of [false,true])test(`pins/notes persist with retry safety in ${fictional?'fictional':'legacy'} rooms`,async()=>{
 const f=fixture(),{room,accountId}=await f.create(fictional),message=room.messages[0]as any,history=structuredClone(room.messages)
 await mutate(f,room,{action:'pin',messageId:message.id,pinned:true});await mutate(f,room,{action:'pin',messageId:message.id,pinned:true})
 let saved=await f.service.read('alice',room.id,accountId);expect(saved.chatPins).toEqual([message.id]);expect(saved.messages).toEqual(history)
 await mutate(f,saved,{action:'note_save',title:'Tone',body:'Be gentle',enabled:true},'note');await mutate(f,saved,{action:'note_save',title:'Tone',body:'Be gentle',enabled:true},'note')
 saved=await new MochiService(f.host).read('alice',room.id,accountId);expect(saved.systemNotes).toHaveLength(1);expect(saved.systemNotes![0].id).toMatch(/^note_[a-f0-9]{32}$/)
 await f.service.react('alice',{accountId,roomId:room.id,revision:saved.revision,messageId:message.id,requestId:'react',emoji:'👍'});saved=await f.service.read('alice',room.id,accountId)
 await f.service.action('alice',{accountId,roomId:room.id,revision:saved.revision,messageId:message.id,requestId:'edit',action:'edit',content:'Edited'})
 saved=await f.service.read('alice',room.id,accountId);expect(saved.chatPins).toEqual([message.id]);expect((saved.messages[0]as any).reactions).toHaveLength(1)
 await f.service.action('alice',{accountId,roomId:room.id,revision:saved.revision,messageId:message.id,requestId:'delete',action:'delete',confirmed:true})
 saved=await f.service.read('alice',room.id,accountId);expect(saved.chatPins).toEqual([]);expect(saved.systemNotes).toHaveLength(1)
 await mutate(f,saved,{action:'note_delete',noteId:saved.systemNotes![0].id,confirmed:true},'delete_note');expect((await f.service.read('alice',room.id,accountId)).systemNotes).toEqual([])
 expect(f.calls).toHaveLength(0)
})

test('ownership, cross-room targets, missing notes, stale and concurrent writes are safe',async()=>{
 const f=fixture(),{room}=await f.create(true),other=await f.create(true),mid=(room.messages[0]as any).id
 await expect(mutate(f,room,{accountId:other.accountId,action:'pin',messageId:mid,pinned:true})).rejects.toThrow()
 await expect(mutate(f,other.room,{action:'pin',messageId:mid,pinned:true})).rejects.toThrow('unavailable')
 await expect(f.service.pinnedContent('bob',{roomId:room.id,accountId:room.accountId,revision:room.revision,requestId:'foreign',action:'pin',messageId:mid,pinned:true})).rejects.toThrow()
 await expect(mutate(f,room,{action:'note_save',noteId:'note_'+'a'.repeat(32),title:'x',body:'x',enabled:true})).rejects.toThrow('unavailable')
 const results=await Promise.allSettled([mutate(f,room,{action:'pin',messageId:mid,pinned:true},'one'),mutate(f,room,{action:'note_save',title:'x',body:'x',enabled:true},'two')])
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1)
 expect((await f.service.read('alice',other.room.id,other.accountId)).messages).toEqual(other.room.messages)
})

test('bounded notes reject malformed records and interrupted writes preserve histories',async()=>{
 const f=fixture(),{room}=await f.create(),path='alice:mochi/v1/rooms/'+room.id+'.json',before=structuredClone(f.files.get(path))
 await expect(mutate(f,room,{action:'note_save',title:'x',body:'x'.repeat(2001),enabled:true})).rejects.toThrow()
 f.host.userStorage.move=async()=>{throw Error('Interrupted')}
 await expect(mutate(f,room,{action:'note_save',title:'x',body:'x',enabled:true})).rejects.toThrow('Interrupted');expect(f.files.get(path)).toEqual(before)
 f.files.set(path,{...room,systemNotes:[{id:'../bad',title:'x',body:'x',enabled:true}]});await expect(f.service.read('alice',room.id)).rejects.toThrow();expect((f.files.get(path)as any).messages).toEqual(room.messages)
})

test('enabled notes resolve once in order at system depth zero; bookmarks are ordinary dialogue',async()=>{
 const f=fixture(),{room}=await f.create();room.chatPins=[(room.messages[0]as any).id]
 room.systemNotes=[{id:'note_'+'a'.repeat(32),title:'First',body:'First instruction',enabled:true},{id:'note_'+'b'.repeat(32),title:'Disabled',body:'Never include this',enabled:false},{id:'note_'+'c'.repeat(32),title:'Last',body:'Last instruction',enabled:true}]
 const original=structuredClone(room),messages=await buildMochiPrompt(room,[],'auto',async m=>{expect(m.at(-3)?.content).toContain('First instruction');return 100},new AbortController().signal)
 expect(messages.at(-3)?.role).toBe('system');expect(messages.at(-2)?.content).toContain('Last instruction');expect(messages.at(-1)?.role).toBe('user');expect(JSON.stringify(messages)).not.toContain('Never include this');expect(messages.filter(m=>m.content.includes('Original message'))).toHaveLength(1);expect(room).toEqual(original)
 room.settings!.contextTokens=2048;await expect(buildMochiPrompt(room,[],'auto',async()=>100000,new AbortController().signal)).rejects.toThrow('budget')
})

test('queued jobs use current notes; prepared drafts and active generation are not canceled',async()=>{
 const f=fixture(),{room}=await f.create(),now=Date.now()
 room.runtime={version:1,enabled:false,jobs:[{id:'response_synthetic',kind:'response',createdAt:now,dueAt:now,expiresAt:now+100000,nextAttemptAt:now,revision:room.revision,responder:'alice_character',status:'queued',attempts:0}]}
 f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(room))
 await mutate(f,room,{action:'note_save',title:'Fresh',body:'Fresh scheduled instructions',enabled:true})
 let saved=await f.service.read('alice',room.id);expect(saved.runtime!.jobs[0].revision).toBe(saved.revision)
 await f.service.dispatchScheduled('alice',room.id,'response_synthetic',()=>now,async()=>false,async()=>true)
 expect(f.calls).toHaveLength(1);expect(JSON.stringify(f.calls[0].messages)).toContain('Fresh scheduled instructions')
 saved=await f.service.read('alice',room.id);expect(saved.runtime!.jobs[0].status).toBe('delivered')
 saved.runtime!.jobs.push({id:'draft',kind:'response',createdAt:now,dueAt:now+1000,expiresAt:now+10000,nextAttemptAt:now+1000,revision:saved.revision,responder:'alice_character',status:'generated',attempts:1,draft:{characterId:'alice_character',name:'Character',avatarUrl:'',text:'Protected'}})
 const path='alice:mochi/v1/rooms/'+room.id+'.json';f.files.set(path,structuredClone(saved))
 await expect(mutate(f,saved,{action:'note_save',title:'x',body:'x',enabled:true},'blocked')).rejects.toThrow('prepared');expect((f.files.get(path)as any).runtime.jobs.at(-1).draft.text).toBe('Protected')
 await mutate(f,saved,{action:'pin',messageId:(saved.messages[0]as any).id,pinned:true},'bookmark');saved=await f.service.read('alice',room.id);expect(saved.runtime!.jobs.at(-1)!.draft!.text).toBe('Protected')
})

test('actual ordinary provider input includes only this room notes and preserves quote/reaction context',async()=>{
 const f=fixture(),{room}=await f.create(),other=await f.create();await mutate(f,room,{action:'note_save',title:'Private',body:'Only this room',enabled:true})
 let saved=await f.service.read('alice',room.id);await f.react(saved,undefined,'react');saved=await f.service.read('alice',room.id)
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'quote',content:'Quoted',replyTo:(room.messages[0]as any).id})
 saved=await f.service.read('alice',room.id);await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'continue',content:''})
 expect(f.calls).toHaveLength(1);const prompt=JSON.stringify(f.calls[0].messages);expect(prompt).toContain('Only this room');expect(prompt).toContain('Reply reference');expect(prompt).toContain('Reactions:')
 const otherPrompt=await buildMochiPrompt(other.room,[],'auto',async()=>100,new AbortController().signal);expect(JSON.stringify(otherPrompt)).not.toContain('Only this room')
})

test('active provider snapshot rejects note and pin mutations without canceling either room',async()=>{
 const f=fixture(),{room}=await f.create(),other=await f.create();let started!:()=>void,finish!:(value:any)=>void
 const ready=new Promise<void>(resolve=>started=resolve)
 f.host.generate!.quiet=async input=>{f.calls.push(input);started();return new Promise(resolve=>finish=resolve)}
 const running=f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'active',content:''});await ready
 const saved=await f.service.read('alice',room.id)
 await expect(mutate(f,saved,{action:'note_save',title:'x',body:'x',enabled:true})).rejects.toThrow('active')
 await expect(mutate(f,saved,{action:'pin',messageId:(saved.messages[0]as any).id,pinned:true})).rejects.toThrow('active')
 await mutate(f,other.room,{action:'note_save',title:'Other',body:'Other only',enabled:true},'other_note')
 finish({content:JSON.stringify({speakerId:'alice_character',text:'Original snapshot response'})});await running
 const result=await f.service.read('alice',room.id);expect((result.messages.at(-1)as any).content).toBe('Original snapshot response');expect(result.systemNotes).toBeUndefined();expect(f.calls).toHaveLength(1)
})

test('note count/total limits and repeated explicit pin state never duplicate records',async()=>{
 const f=fixture(),{room}=await f.create();let saved=room
 for(let i=0;i<8;i++){await mutate(f,saved,{action:'note_save',title:'Note '+i,body:'Body',enabled:false},'n'+i);saved=await f.service.read('alice',room.id)}
 await expect(mutate(f,saved,{action:'note_save',title:'Ninth',body:'Body',enabled:true},'ninth')).rejects.toThrow('notes')
 const mid=(saved.messages[0]as any).id;await mutate(f,saved,{action:'pin',messageId:mid,pinned:true},'p1');saved=await f.service.read('alice',room.id)
 await mutate(f,saved,{action:'pin',messageId:mid,pinned:true},'p2');saved=await f.service.read('alice',room.id);expect(saved.chatPins).toEqual([mid])
 const corrupt={...saved,systemNotes:saved.systemNotes!.map(n=>({...n,body:'x'.repeat(2000)}))};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',corrupt);await expect(f.service.read('alice',room.id)).rejects.toThrow('limits')
})

test('note editing/disabling is prospective and character rerolls retain exact bookmarks',async()=>{
 const f=fixture(),{room}=await f.create()
 await mutate(f,room,{action:'note_save',title:'Initial',body:'Initial body',enabled:true});let saved=await f.service.read('alice',room.id),note=saved.systemNotes![0]
 await mutate(f,saved,{action:'note_save',noteId:note.id,title:'Updated',body:'Updated body',enabled:false},'disable');saved=await f.service.read('alice',room.id)
 expect(saved.systemNotes![0]).toEqual({...note,title:'Updated',body:'Updated body',enabled:false})
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'first_reply',content:''});expect(JSON.stringify(f.calls[0].messages)).not.toContain('Updated body')
 saved=await f.service.read('alice',room.id);const target=(saved.messages.at(-1)as any).id
 await mutate(f,saved,{action:'pin',messageId:target,pinned:true},'assistant_pin');saved=await f.service.read('alice',room.id)
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'reroll',messageId:target,confirmed:true,content:''},true)
 saved=await f.service.read('alice',room.id);expect(saved.chatPins).toEqual([target]);expect(saved.systemNotes![0].enabled).toBe(false);expect((saved.messages.at(-1)as any).id).toBe(target)
})

test('note editor retains failed/hidden drafts scoped to account/room and clears them on destruction',()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const sent:any[]=[],view=new MochiView(p=>sent.push(p),()=>{},()=>{})
 try{
  const room:any={id:'room',revision:1,accountId:'fictional_one',title:'Room',characterIds:['character'],persona:{name:'Me'},settings:defaultMochiSettings(),messages:[]}
  view.state={accountId:room.accountId,rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select(room.id)
  const anchor=document.createElement('button');document.body.append(anchor);(view as any).openPins(anchor,room)
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='New system note')!.click()
  const title=document.querySelector<HTMLInputElement>('[aria-label="System note title"]')!,body=document.querySelector<HTMLTextAreaElement>('[aria-label="System note body"]')!;title.value='Private';title.dispatchEvent(new dom.window.Event('input'));body.value='Draft retained';body.dispatchEvent(new dom.window.Event('input'))
  document.querySelector<HTMLFormElement>('.mochi-note-editor')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}))
  expect(sent.at(-1).accountId).toBe('fictional_one');expect(sent.at(-1).action).toBe('note_save')
  view.receive({type:'mochi:error',requestId:sent.at(-1).requestId,message:'Simulated stale revision'})
  ;(view as any).openPins(anchor,{...room,revision:2});expect(document.querySelector<HTMLTextAreaElement>('[aria-label="System note body"]')!.value).toBe('Draft retained');expect(document.body.textContent).toContain('Apply draft to refreshed chat')
  document.querySelector('dialog')!.close()
  ;(view as any).openPins(anchor,{...room,id:'other_room'});expect(document.querySelector('[aria-label="System note body"]')).toBeNull();document.querySelector('dialog')!.close()
  view.destroy();expect((view as any).noteDrafts.size).toBe(0)
 }finally{view.destroy();dom.window.close();globalThis.document=previous}
})

for(const width of [320,390,900])test(`${width}px Pins & Notes controls, draft retention and old-history jump`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 Object.defineProperty(dom.window,'innerWidth',{value:width});dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const view=new MochiView(()=>{},()=>{},()=>{}),sent:any[]=[],drafts:any[]=[]
 try{
  const room:any={id:'room',revision:1,title:'Long room '.repeat(12),characterIds:['a','b'],persona:{name:'Me'},settings:defaultMochiSettings(),messages:Array.from({length:150},(_,i)=>({id:'message'+i,role:'user',name:'Long sender '.repeat(15),content:'Long content '.repeat(30),createdAt:'2026-10-13T10:00:00Z'})),chatPins:['message0'],systemNotes:[]}
  view.state={rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select(room.id);document.body.append(view.render('desktop' as any))
  const anchor=document.createElement('button');document.body.append(anchor);(view as any).openPins(anchor,room)
  document.querySelector<HTMLButtonElement>('[aria-label^="Go to pinned message"]')!.click();expect((view as any).desktopHistory.get(room.id)).toBe(150)
  const owner:any={setDraft:(d:any)=>drafts.push(d),mutate:(v:any)=>sent.push(v),jump:()=>{},unavailable:false},panel=pinsPanel(room,owner);document.body.append(panel)
  Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='New system note')!.click()
  const title=panel.querySelector<HTMLInputElement>('[aria-label="System note title"]')!,body=panel.querySelector<HTMLTextAreaElement>('[aria-label="System note body"]')!
  title.value='A title';title.dispatchEvent(new dom.window.Event('input'));body.value='A long draft '.repeat(80);body.dispatchEvent(new dom.window.Event('input'))
  expect(owner.draft.note.body).toContain('A long draft');panel.querySelector<HTMLFormElement>('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));expect(sent[0].action).toBe('note_save');expect(sent[0].body).toBe(body.value)
  Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Cancel editing')!.click();expect(panel.textContent).toContain('Discard note draft');expect(drafts.at(-1)).toBeDefined()
 }finally{view.destroy();dom.window.close();globalThis.document=previous}
})
