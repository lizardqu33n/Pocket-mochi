import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {createMochiWorkspace} from '../src/mochi/workspace.js'

function fixture(){
 const files=new Map<string,unknown>(),calls:any[]=[],events:any[]=[]
 const host:MochiHost={userStorage:{exists:async(p,u)=>files.has(u+':'+p),getJson:async(p,o)=>{if(files.has(o.userId+':'+p))return structuredClone(files.get(o.userId+':'+p));if('fallback'in o)return o.fallback;throw Error('Missing')},setJson:async(p,d,o)=>{files.set(o.userId+':'+p,structuredClone(d))},move:async(a,b,u)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async(p,u)=>Array.from(files.keys()).filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length))},permissions:{has:()=>true},characters:{get:async(id,u)=>id===u+'_character'?{id,name:'Original character'}:null,list:async()=>({data:[]})},personas:{get:async()=>null,list:async()=>({data:[]})},connections:{get:async(id,u)=>id===u+'_connection'?{id,model:'synthetic'}:null,list:async()=>[]},tokens:{countMessages:async m=>({total_tokens:Math.ceil(JSON.stringify(m).length/4)})},generate:{quiet:async r=>{calls.push(r);return{content:JSON.stringify({speakerId:'alice_character',text:'Synthetic generated response'})}}},sendToFrontend:p=>events.push(p)}
 const service=new MochiService(host)
 const create=async(fictional=false)=>{
  const accountId=fictional?(await service.fictionalAccounts.create('alice',{displayName:'Fictional',username:'',persona:{source:'manual',name:'Fictional',description:''}})).id:undefined
  const input={accountId,title:'Synthetic chat',characterIds:['alice_character'],persona:{source:'manual',name:'Me',description:''}}
  let room=await service.create('alice',input);room=await service.update('alice',{...input,persona:accountId?undefined:input.persona,roomId:room.id,revision:room.revision,settings:{...defaultMochiSettings(),autoReply:false,responseMode:'manual',connectionId:'alice_connection'}})
  return{room,accountId,input:{...input,persona:accountId?undefined:input.persona}}
 }
 let serial=0
 const send=async(room:any,accountId:string|undefined,content:string,replyTo?:unknown)=>{const current=await service.read('alice',room.id,accountId);await service.message('alice',{accountId,roomId:room.id,revision:current.revision,requestId:'synthetic_'+(++serial),content,...(replyTo!==undefined?{replyTo}:{})});return service.read('alice',room.id,accountId)}
 return{host,files,calls,events,service,create,send}
}

for(const fictional of [false,true])test(`quoted replies persist and isolate ${fictional?'fictional':'legacy'} history; edits/deletion preserve links`,async()=>{
 const f=fixture(),{room,accountId}=await f.create(fictional),other=await f.create(true)
 let saved=await f.send(room,accountId,'Original text');const original:any=saved.messages[0]
 saved=await f.send(room,accountId,'My reply',original.id);const reply:any=saved.messages[1]
 expect(reply.replyTo).toBe(original.id)
 const restarted=new MochiService(f.host);expect((await restarted.read('alice',room.id,accountId)).messages).toEqual(saved.messages)
 await expect(f.send(other.room,other.accountId,'Cross room',original.id)).rejects.toThrow('reply target')
 await expect(f.service.message('bob',{roomId:room.id,revision:saved.revision,requestId:'foreign',content:'No',replyTo:original.id})).rejects.toThrow()
 if(accountId)await expect(f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'wrong_scope',content:'No',replyTo:original.id})).rejects.toThrow()
 await f.service.action('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'edit_reply',messageId:reply.id,action:'edit',content:'Edited reply'})
 saved=await f.service.read('alice',room.id,accountId);expect((saved.messages[1]as any).replyTo).toBe(original.id);expect((saved.messages[1]as any).previousVersions[0].content).toBe('My reply')
 saved=await f.send(room,accountId,'Another reply',original.id);const removed:any=saved.messages[2]
 await f.service.action('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'delete_reply',messageId:removed.id,action:'delete',confirmed:true})
 saved=await f.service.read('alice',room.id,accountId);expect(saved.messages).toHaveLength(2);expect(saved.messages[0]).toEqual(original)
 await f.service.action('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'delete_original',messageId:original.id,action:'delete',confirmed:true})
 saved=await f.service.read('alice',room.id,accountId);expect(saved.messages).toHaveLength(1);expect((saved.messages[0]as any).replyTo).toBe(original.id)
 await expect(f.send(room,accountId,'Missing original',original.id)).rejects.toThrow('reply target')
 expect((await f.service.read('alice',other.room.id,other.accountId)).messages).toEqual([])
})

test('invalid/empty quote sends and interrupted persistence do not damage histories; retry receipts are exactly once',async()=>{
 const f=fixture(),{room,accountId}=await f.create(true);let saved=await f.send(room,accountId,'Original');const original:any=saved.messages[0]
 await expect(f.send(room,accountId,'Bad',{id:original.id})).rejects.toThrow('reply target')
 await expect(f.send(room,accountId,'',original.id)).rejects.toThrow('reply target')
 expect((await f.service.read('alice',room.id,accountId)).messages).toEqual(saved.messages)
 const input={accountId,roomId:room.id,revision:saved.revision,requestId:'retry_quote',content:'Quoted retry',replyTo:original.id}
 const move=f.host.userStorage.move;f.host.userStorage.move=async()=>{throw Error('Interrupted atomic rename')}
 await expect(f.service.message('alice',input)).rejects.toThrow('Interrupted');expect((await f.service.read('alice',room.id,accountId)).messages).toEqual(saved.messages)
 f.host.userStorage.move=move;await f.service.message('alice',input);await f.service.message('alice',input)
 saved=await f.service.read('alice',room.id,accountId);expect(saved.messages).toHaveLength(2);expect((saved.messages[1]as any).replyTo).toBe(original.id);expect(saved.receipts!.filter(id=>id==='retry_quote')).toHaveLength(1)
})

test('pending quote scope follows fictional account and room; edited/deleted preview uses current records',()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 const view=new MochiView(()=>{},()=>{},()=>{})
 try{
  const room:any={id:'room',accountId:'account_A',ownerId:'alice',revision:1,title:'Synthetic',characterIds:[],persona:{name:'Me',avatarUrl:''},settings:defaultMochiSettings(),messages:[{id:'message',role:'assistant',name:'Original Author',content:'CURRENT A',createdAt:'2026-10-13T10:00:00Z'}]}
  view.state={accountId:'account_A',rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select('room')
  ;(view as any).replyTargets.set(JSON.stringify(['account_A','room']),'message')
  expect(view.render().querySelector('.mochi-reply-preview')!.textContent).toContain('CURRENT A')
  room.messages[0].content='EDITED A';expect(view.render().querySelector('.mochi-reply-preview')!.textContent).toContain('EDITED A')
  const other={...room,accountId:'account_B',messages:[{...room.messages[0],content:'PRIVATE B'}]};view.state={...view.state,accountId:'account_B',rooms:[other]}
  expect(view.render().querySelector('.mochi-reply-preview')).toBeNull()
  view.state={...view.state,accountId:'account_A',rooms:[room]};room.messages=[]
  const missing=view.render().querySelector('.mochi-reply-preview')!;expect(missing.textContent).toContain('Message unavailable');expect(missing.textContent).not.toContain('EDITED A');expect(missing.textContent).not.toContain('PRIVATE B')
 }finally{view.destroy();dom.window.close();globalThis.document=previous}
})

test('actual provider input attributes quotes, uses current edited text and preserves histories',async()=>{
 const f=fixture(),{room,input,accountId}=await f.create(true)
 let saved=await f.send(room,accountId,'Original BEFORE');const original:any=saved.messages[0]
 await f.service.action('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'edit_origin',messageId:original.id,action:'edit',content:'Original CURRENT'})
 saved=await f.service.read('alice',room.id,accountId)
 saved=await f.service.update('alice',{...input,roomId:room.id,revision:saved.revision,settings:{...saved.settings,autoReply:true,responseMode:'instant'}})
 saved=await f.send(room,accountId,'Respond specifically',original.id)
 expect(f.calls).toHaveLength(1);const prompt=JSON.stringify(f.calls[0].messages)
 expect(prompt).toContain('Reply reference');expect(prompt).toContain('Original CURRENT');expect(prompt).not.toContain('Original BEFORE')
 expect(prompt).toContain(original.id);expect(prompt).toContain('author');expect(saved.messages).toHaveLength(3)
 expect((saved.messages[2]as any).replyTo).toBeUndefined()
 const ai:any=saved.messages[2]
 await f.service.message('alice',{accountId,roomId:room.id,revision:saved.revision,requestId:'reroll',messageId:ai.id,confirmed:true},true)
 saved=await f.service.read('alice',room.id,accountId);expect((saved.messages[2]as any).replyTo).toBeUndefined();expect((saved.messages[1]as any).replyTo).toBe(original.id)
})

test('group character quote identifies the exact original author in provider context',async()=>{
 const f=fixture(),{room,input,accountId}=await f.create(true)
 const get=f.host.characters.get;f.host.characters.get=async(id,u)=>id==='alice_other'&&u==='alice'?{id,name:'Other group member'}:get(id,u)
 let saved=await f.service.update('alice',{...input,characterIds:['alice_character','alice_other'],roomId:room.id,revision:room.revision,settings:{...room.settings,autoReply:true,responseMode:'instant'}})
 saved=await f.send(room,accountId,'First group turn');const original:any=saved.messages[1]
 expect(original.role).toBe('assistant');expect(original.characterId).toBe('alice_character')
 saved=await f.send(room,accountId,'Replying to that character',original.id)
 const prompt=JSON.stringify(f.calls[1].messages);expect(prompt).toContain(original.name);expect(prompt).toContain(original.id);expect(prompt).toContain('Reply reference')
 expect((saved.messages[2]as any).replyTo).toBe(original.id);expect((saved.messages[3]as any).replyTo).toBeUndefined();expect(f.calls).toHaveLength(2)
})

test('trimmed prompt adds bounded older quote; missing originals never fabricate content',async()=>{
 const f=fixture(),{room}=await f.create();room.messages=[{id:'original',role:'assistant',name:'Long named author',content:'OLDER '+ 'x'.repeat(4000)},{id:'latest',role:'user',name:'Me',content:'My new reply',replyTo:'original'}]
 const before=structuredClone(room.messages)
 const messages=await buildMochiPrompt(room,[],'auto',async m=>m.length>3?10000:100,new AbortController().signal)
 expect(messages).toHaveLength(3);expect(messages[1].content).toContain('Long named author');expect(messages[1].content).toContain('OLDER');expect(messages[1].content.length).toBeLessThan(800);expect(room.messages).toEqual(before)
 ;(room.messages[1]as any).replyTo='deleted'
 const missing=await buildMochiPrompt(room,[],'auto',async()=>100,new AbortController().signal)
 expect(missing[2].content).toContain('original message unavailable');expect(missing[2].content).not.toContain('OLDER')
})

test('composer quote targets survive failures/navigation; accepted sends clear only their target; quote navigation loads old messages',()=>{
 const dom=new JSDOM('<body><main></main></body>',{pretendToBeVisual:true}),previous={window:globalThis.window,document:globalThis.document};Object.assign(globalThis,{window:dom.window,document:dom.window.document})
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
 const sent:any[]=[],listeners=new Set<(p:unknown)=>void>()
 const workspace=createMochiWorkspace({root:document.querySelector('main')!,transport:{sendToBackend:p=>sent.push(p),onBackendMessage:fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}}},notificationPolicy:()=>({enabled:false,previews:false}),presentation:'messenger'})
 const emit=(p:any)=>{for(const fn of listeners)fn(p)}
 try{
  workspace.open();emit({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:{version:1,ownerId:'alice',revision:1,accounts:[],personas:[],avatars:[],warnings:[],canUploadAvatar:false}})
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent==='Unassigned legacy chats')!.click()
  const room:any={id:'room_'+'a'.repeat(32),ownerId:'alice',revision:1,title:'Long room '.repeat(10),characterIds:[],persona:{name:'Me',avatarUrl:''},settings:defaultMochiSettings(),messages:Array.from({length:130},(_,i)=>({id:'m'+i,role:'user',name:'Long author '.repeat(8),content:'Synthetic '+i,createdAt:'2026-10-13T10:00:00Z',avatarUrl:''}))}
  const state:any={rooms:[room],characters:[],personas:[],connections:[],warnings:[],notifications:[]}
  emit({type:'mochi:state',requestId:sent.at(-1).requestId,state});workspace.openRoom(room.id);emit({type:'mochi:state',requestId:sent.at(-1).requestId,state})
  document.querySelector<HTMLButtonElement>('.mochi-message-actions')!.click();Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent.includes('Reply')&&n.textContent==='Reply')!.click()
  expect(document.querySelector('.mochi-reply-preview')).not.toBeNull();expect(document.activeElement?.getAttribute('aria-label')).toBe('Message')
  const input=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;input.value='Reply draft';input.dispatchEvent(new dom.window.Event('input'));input.closest('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}))
  const payload=sent.at(-1);expect(payload.replyTo).toBe('m30');emit({type:'mochi:error',requestId:payload.requestId,message:'Synthetic failure'})
  expect(document.querySelector('.mochi-reply-preview')).not.toBeNull();workspace.close();workspace.open();expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('Reply draft')
  document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.closest('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));const retry=sent.at(-1)
  document.querySelector<HTMLButtonElement>('[data-message-id="m31"] .mochi-message-actions')!.click();Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(n=>n.textContent==='Reply')!.click()
  emit({type:'mochi:accepted',requestId:retry.requestId});emit({type:'mochi:state',requestId:retry.requestId,state})
  expect(document.querySelector('.mochi-reply-preview')!.textContent).toContain('Synthetic 31')
  const empty=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;empty.value='';empty.dispatchEvent(new dom.window.Event('input'));empty.closest('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));const continuation=sent.at(-1)
  expect(continuation.replyTo).toBeUndefined();emit({type:'mochi:accepted',requestId:continuation.requestId});emit({type:'mochi:state',requestId:continuation.requestId,state})
  expect(document.querySelector('.mochi-reply-preview')).not.toBeNull()
  document.querySelector<HTMLButtonElement>('[aria-label="Clear reply target"]')!.click()
  expect(document.querySelector('.mochi-reply-preview')).toBeNull()
  room.messages.push({id:'reply',role:'user',name:'Me',content:'Sent reply',replyTo:'m0',createdAt:'2026-10-13T11:00:00Z'})
  workspace.refresh();emit({type:'mochi:state',requestId:sent.at(-1).requestId,state})
  document.querySelector<HTMLButtonElement>('button.mochi-quote')!.click()
  expect(document.querySelector('[data-message-id="m0"]')).not.toBeNull();expect((document.activeElement as HTMLElement).dataset.messageId).toBe('m0')
 }finally{workspace.destroy();dom.window.close();Object.assign(globalThis,previous)}
})
