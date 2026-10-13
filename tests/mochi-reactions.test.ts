import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'

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

for(const fictional of [false,true])test(`reactions persist/toggle exactly once with ${fictional?'fictional':'legacy'} actor identity`,async()=>{
 const f=fixture(),{room,accountId}=await f.create(fictional),original=structuredClone(room.messages[0])
 await f.react(room,accountId,'toggle');await f.react(room,accountId,'toggle')
 let saved=await new MochiService(f.host).read('alice',room.id,accountId)
 expect((saved.messages[0]as any).reactions).toEqual([{emoji:'👍',actor:'user',actorId:accountId||'legacy',name:room.persona.name}]);expect((saved.messages[0]as any).content).toBe((original as any).content)
 await f.react(saved,accountId,'remove');saved=await f.service.read('alice',room.id,accountId);expect((saved.messages[0]as any).reactions).toEqual([]);expect(f.calls).toHaveLength(0)
})

test('ownership, forged actors, invalid emoji and concurrent stale revisions reject without damaging history',async()=>{
 const f=fixture(),{room,accountId}=await f.create(true),other=await f.create(true)
 await expect(f.react(room,other.accountId,'wrong')).rejects.toThrow()
 await expect(f.react(other.room,other.accountId,'cross_room','👍',{messageId:(room.messages[0]as any).id})).rejects.toThrow('unavailable')
 await expect(f.service.react('bob',{roomId:room.id,revision:room.revision,messageId:(room.messages[0]as any).id,requestId:'foreign',emoji:'👍'})).rejects.toThrow()
 await expect(f.react(room,accountId,'spoof','👍',{actor:'character',actorId:'alice_character'})).rejects.toThrow('Invalid')
 await expect(f.react(room,accountId,'invalid','<script>')).rejects.toThrow('Invalid')
 const results=await Promise.allSettled([f.react(room,accountId,'one'),f.react(room,accountId,'two','❤️')])
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1)
 expect((await f.service.read('alice',other.room.id,other.accountId)).messages).toEqual(other.room.messages)
})

test('metadata toggles preserve queued/drafted jobs and historical actors after explicit assignment',async()=>{
 const f=fixture(),{room}=await f.create(),target=await f.create(true),now=Date.now()
 room.runtime={version:1,enabled:false,jobs:[{id:'pending',kind:'response',dueAt:now+60000,expiresAt:now+120000,nextAttemptAt:now+60000,revision:room.revision,responder:'auto',status:'queued',attempts:0},{id:'drafted',kind:'response',dueAt:now+60000,expiresAt:now+120000,nextAttemptAt:now+60000,revision:room.revision,responder:'alice_character',status:'generated',attempts:1,draft:{characterId:'alice_character',name:'Character',avatarUrl:'',text:'Existing deferred text'}}]}
 f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(room))
 await f.react(room,undefined,'react');let saved=await f.service.read('alice',room.id)
 expect(saved.runtime!.jobs.map(j=>j.status)).toEqual(['queued','generated']);expect(saved.runtime!.jobs.every(j=>j.revision===saved.revision)).toBe(true);expect(saved.runtime!.jobs[1].draft!.text).toBe('Existing deferred text')
 await f.service.assignRoom('alice',{roomId:room.id,revision:saved.revision,associationRevision:0,targetAccountId:target.accountId,confirmed:true,preservePersona:true})
 saved=await f.service.read('alice',room.id,target.accountId);await f.react(saved,target.accountId,'new_actor')
 saved=await f.service.read('alice',room.id,target.accountId);expect((saved.messages[0]as any).reactions.map((r:any)=>r.actorId)).toEqual(['legacy',target.accountId]);expect(f.calls).toHaveLength(0)
})

test('active generation rejects reaction changes and Stop prevents late model operations',async()=>{
 const f=fixture(),{room,input,accountId}=await f.create(true)
 let saved=await f.service.update('alice',{...input,roomId:room.id,revision:room.revision,settings:{...room.settings,autoReply:true,responseMode:'instant'}})
 let release!:(value:any)=>void,ready!:()=>void;const started=new Promise<void>(r=>ready=r)
 f.host.generate!.quiet=async r=>{f.calls.push(r);ready();return new Promise(resolve=>release=resolve)}
 const pending=f.service.message('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'pending_generation',content:'Generate'}).catch(error=>error)
 await started;saved=await f.service.read('alice',room.id,accountId)
 await expect(f.react(saved,accountId,'busy')).rejects.toThrow('active reply')
 await f.service.cancel('alice',room.id,'pending_generation',accountId)
 release({content:JSON.stringify({speakerId:'alice_character',text:'Late',reactions:[{emoji:'❤️',messageId:(room.messages[0]as any).id}]})});expect((await pending).name).toBe('AbortError')
 saved=await f.service.read('alice',room.id,accountId);expect(saved.messages).toHaveLength(2);expect((saved.messages[0]as any).reactions).toBeUndefined();expect(f.calls).toHaveLength(1)
})

test('edits/quotes/rerolls preserve reactions; deleted targets and interrupted writes cannot toggle',async()=>{
 const f=fixture(),{room,accountId}=await f.create();await f.react(room,accountId,'react');let saved=await f.service.read('alice',room.id)
 const original:any=saved.messages[0]
 await f.service.action('alice',{roomId:room.id,revision:saved.revision,messageId:original.id,requestId:'edit',action:'edit',content:'Edited'})
 saved=await f.service.read('alice',room.id);expect((saved.messages[0]as any).reactions).toEqual(original.reactions)
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'quote',content:'Quoted',replyTo:original.id});saved=await f.service.read('alice',room.id)
 expect((saved.messages[1]as any).replyTo).toBe(original.id)
 const move=f.host.userStorage.move;f.host.userStorage.move=async()=>{throw Error('Interrupted')}
 await expect(f.react(saved,accountId,'failed','❤️')).rejects.toThrow('Interrupted');expect((await f.service.read('alice',room.id)).messages).toEqual(saved.messages);f.host.userStorage.move=move
 await f.service.action('alice',{roomId:room.id,revision:saved.revision,messageId:original.id,requestId:'delete',action:'delete',confirmed:true});saved=await f.service.read('alice',room.id)
 await expect(f.service.react('alice',{roomId:room.id,revision:saved.revision,messageId:original.id,requestId:'late',emoji:'👍'})).rejects.toThrow('unavailable')
 expect((saved.messages[0]as any).replyTo).toBe(original.id)
})

test('actual provider input attributes user reactions; unsolicited model reaction metadata is ignored with no extra call',async()=>{
 const f=fixture(),{room,input,accountId}=await f.create(true);await f.react(room,accountId,'reaction')
 let saved=await f.service.read('alice',room.id,accountId);saved=await f.service.update('alice',{...input,roomId:room.id,revision:saved.revision,settings:{...saved.settings,autoReply:true,responseMode:'instant'}})
 await f.service.message('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'generate',content:'Next'});saved=await f.service.read('alice',room.id,accountId)
 expect(f.calls).toHaveLength(1);const prompt=JSON.stringify(f.calls[0].messages);expect(prompt).toContain('Reactions:');expect(prompt).toContain('👍');expect(prompt).toContain(accountId!);expect(prompt).not.toContain('foreign')
 const ai:any=saved.messages.at(-1);expect(ai.reactions).toBeUndefined()
 await f.react({...saved,messages:[ai]},accountId,'react_ai','❤️')
 saved=await f.service.read('alice',room.id,accountId);await f.service.message('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'reroll',messageId:ai.id,confirmed:true},true)
 saved=await f.service.read('alice',room.id,accountId);expect((saved.messages.at(-1)as any).reactions[0].emoji).toBe('❤️')
})

test('prompt reaction metadata is bounded and fully token counted without mutating storage',async()=>{
 const f=fixture(),{room}=await f.create()
 room.messages=Array.from({length:50},(_,i)=>({id:'m'+i,role:'user',name:'Me',content:'Text',reactions:[{emoji:'👍',actor:'user',actorId:'legacy',name:'Me'}]}))
 const before=structuredClone(room.messages)
 const messages=await buildMochiPrompt(room,[],'auto',async m=>{expect(JSON.stringify(m)).toContain('Reactions:');return 100},new AbortController().signal)
 expect(messages.filter(m=>m.content.includes('Reactions:'))).toHaveLength(32);expect(room.messages).toEqual(before)
})

for(const width of [320,390])test(`${width}px reaction palette/chips use accessible controls and scoped actor state`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width})
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const sent:any[]=[],view=new MochiView(p=>sent.push(p),()=>{},()=>{})
 try{
  const room:any={id:'room',revision:1,title:'Synthetic',characterIds:['character'],persona:{name:'Me'},settings:defaultMochiSettings(),messages:[{id:'message',role:'assistant',name:'Character',content:'Synthetic text',createdAt:'2026-10-13T10:00:00Z',reactions:[{emoji:'👍',actor:'user',actorId:'legacy',name:'Me'},{emoji:'👍',actor:'character',actorId:'character',name:'Character'}]}]}
  view.state={rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select(room.id);document.body.append(view.render())
  const chip=document.querySelector<HTMLButtonElement>('.mochi-reaction')!;expect(chip.textContent).toBe('👍 2');expect(chip.getAttribute('aria-pressed')).toBe('true');expect(chip.title).toContain('Character');expect(chip.getAttribute('aria-label')).toContain('thumbs up')
  document.querySelector<HTMLButtonElement>('.mochi-message-actions')!.click();Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent==='React')!.click()
  const choices=document.querySelectorAll('.mochi-reaction-palette button');expect(choices).toHaveLength(8);expect(choices[0].getAttribute('aria-pressed')).toBe('true');(choices[1]as HTMLButtonElement).click()
  expect(sent.at(-1).type).toBe('mochi:reaction');expect(sent.at(-1).actorId).toBeUndefined();expect(sent.at(-1).messageId).toBe('message')
 }finally{view.destroy();dom.window.close();globalThis.document=previous}
})
