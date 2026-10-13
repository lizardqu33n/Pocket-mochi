import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {validateTextingStyles,resolveTextingStyles} from '../src/mochi/texting.js'
import {textingControls} from '../src/mochi/texting-controls.js'

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

const save=(f:ReturnType<typeof fixture>,room:any,styles:any)=>f.service.update('alice',{accountId:room.accountId,roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,textingStyles:styles}})
for(const fictional of [false,true])test(`texting styles persist in ${fictional?'fictional':'legacy'} chat without changing history/source cards`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),other=await f.create(fictional),before=structuredClone(room),card=await f.host.characters.get('alice_character','alice')
 let saved=await save(f,room,{alice_character:{length:'short',emoji:'rare',tone:'Uses complete sentences'}})
 saved=await new MochiService(f.host).read('alice',room.id,room.accountId);expect(saved.settings!.textingStyles!.alice_character.length).toBe('short');expect(saved.messages).toEqual(before.messages);expect(saved.persona).toEqual(before.persona);expect(saved.receipts).toEqual(before.receipts);expect(saved.notifications).toEqual(before.notifications);expect(saved.settings!.connectionId).toBe(before.settings!.connectionId)
 expect((await f.service.read('alice',other.room.id,other.room.accountId)).settings!.textingStyles).toBeUndefined();expect(await f.host.characters.get('alice_character','alice')).toEqual(card)
 await f.service.handle({type:'mochi:choices',accountId:room.accountId,requestId:'refresh'},'alice');expect((await f.service.read('alice',room.id,room.accountId)).settings!.textingStyles).toEqual(saved.settings!.textingStyles)
 if(fictional)await expect(f.service.update('alice',{accountId:other.accountId,roomId:room.id,revision:saved.revision,title:saved.title,characterIds:saved.characterIds,settings:saved.settings})).rejects.toThrow()
 await expect(f.service.update('bob',{roomId:room.id,revision:saved.revision,title:saved.title,characterIds:saved.characterIds,settings:saved.settings})).rejects.toThrow()
})

test('legacy and empty defaults produce identical provider context and unchanged settings saves',async()=>{
 const f=fixture(),{room}=await f.create(),plain=await buildMochiPrompt(room,[],'auto',async()=>100,new AbortController().signal)
 const empty={...room,settings:{...room.settings!,textingStyles:{alice_character:{}}}}
 expect(await buildMochiPrompt(empty,[],'auto',async()=>100,new AbortController().signal)).toEqual(plain);expect(resolveTextingStyles(undefined,[])).toBe('');expect(validateTextingStyles({alice_character:{tone:'   '}})).toBeUndefined()
 const saved=await save(f,room,{});expect(saved.revision).toBe(room.revision);expect(saved.settings!.textingStyles).toBeUndefined()
})

test('invalid values, foreign characters, stale/concurrent edits and failed writes preserve settings',async()=>{
 const f=fixture(),{room}=await f.create(),path='alice:mochi/v1/rooms/'+room.id+'.json',before=structuredClone(f.files.get(path))
 for(const styles of [{alice_character:{length:'huge'}},{alice_character:{tone:'x'.repeat(401)}},{alice_character:{emoji:true}},{alice_character:{unknown:'x'}},{'../bad':{length:'short'}}])await expect(save(f,room,styles)).rejects.toThrow()
 await expect(save(f,room,{bob_character:{length:'short'}})).rejects.toThrow('in this chat');expect(f.files.get(path)).toEqual(before)
 const updates=await Promise.allSettled([save(f,room,{alice_character:{length:'short'}}),save(f,room,{alice_character:{length:'detailed'}})])
 expect(updates.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(updates.filter(r=>r.status==='rejected')).toHaveLength(1)
 const current=await f.service.read('alice',room.id),stored=structuredClone(f.files.get(path));f.host.userStorage.move=async()=>{throw Error('Interrupted')};await expect(save(f,current,{alice_character:{emoji:'rare'}})).rejects.toThrow('Interrupted');expect(f.files.get(path)).toEqual(stored)
})

test('two characters receive distinct attributed tendencies in actual Natural provider input',async()=>{
 const f=fixture(),{room}=await f.create();f.host.characters.get=async id=>['alice_character','second_character'].includes(id)?{id,name:id,description:'Card description',personality:'Card identity'}:null
 const group=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:['alice_character','second_character'],settings:{...room.settings!,autoReply:true,responseMode:'natural',textingStyles:{alice_character:{length:'short',capitalization:'lowercase',emoji:'rare'},second_character:{length:'detailed',punctuation:'expressive',tone:'Formal complete sentences'}}}})
 await f.service.message('alice',{roomId:room.id,revision:group.revision,requestId:'group_send',content:'Hello',responder:'auto'})
 expect(f.calls).toHaveLength(1);const system=f.calls[0].messages[0].content,section=system.split('CHARACTER TEXTING TENDENCIES: ')[1].split('\n')[0],rows=JSON.parse(section)
 expect(rows[0]).toMatchObject({characterId:'alice_character',length:'short',emoji:'rare'});expect(rows[1]).toMatchObject({characterId:'second_character',length:'detailed',tone:'Formal complete sentences'});expect(system).toContain('Card description');expect(system).toContain('Card identity');expect(system.match(/CHARACTER TEXTING TENDENCIES:/g)).toHaveLength(1)
})

test('DM and scheduled generation use current authorized styles alongside notes/quotes/reactions',async()=>{
 const f=fixture(),{room}=await f.create();let saved=await save(f,room,{alice_character:{tone:'Distinct private tone'}})
 await f.service.pinnedContent('alice',{roomId:room.id,revision:saved.revision,requestId:'note',action:'note_save',title:'Note',body:'Keep note context',enabled:true});saved=await f.service.read('alice',room.id)
 await f.react(saved,undefined,'reaction');saved=await f.service.read('alice',room.id)
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'quote',content:'A reply',replyTo:(room.messages[0]as any).id});saved=await f.service.read('alice',room.id)
 const now=Date.now();saved.runtime={version:1,enabled:false,jobs:[{id:'style_response',kind:'response',createdAt:now,dueAt:now,expiresAt:now+10000,nextAttemptAt:now,revision:saved.revision,responder:'alice_character',status:'queued',attempts:0}]};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(saved))
 await f.service.dispatchScheduled('alice',room.id,'style_response',()=>now,async()=>false,async()=>true)
 expect(f.calls).toHaveLength(1);const prompt=JSON.stringify(f.calls[0].messages);for(const text of ['Distinct private tone','Keep note context','Reply reference','Reactions:'])expect(prompt).toContain(text)
 const other=await f.create(true),otherPrompt=await buildMochiPrompt(other.room,[{id:'alice_character',name:'Character'}],'alice_character',async()=>100,new AbortController().signal);expect(JSON.stringify(otherPrompt)).not.toContain('Distinct private tone')
})

test('texting material is token counted, never mutates history or bypasses the budget',async()=>{
 const f=fixture(),{room}=await f.create();room.settings!.textingStyles={alice_character:{tone:'x'.repeat(400)}};const history=structuredClone(room.messages)
 await expect(buildMochiPrompt(room,[{id:'alice_character',name:'Character'}],'alice_character',async m=>{expect(m[0].content).toContain('CHARACTER TEXTING TENDENCIES');return 100000},new AbortController().signal)).rejects.toThrow('budget');expect(room.messages).toEqual(history)
 expect(resolveTextingStyles({second:{emoji:'frequent'}},[{id:'alice_character',name:'Character'}])).toBe('')
})

for(const width of [320,390,900])test(`${width}px style controls stage changes and preserve default/source values`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width})
 try{
  const settings=defaultMochiSettings(),name='Long character '.repeat(20),controls=textingControls(settings,'character',name);document.body.append(controls)
  expect(controls.querySelectorAll('select')).toHaveLength(4);expect(settings.textingStyles).toBeUndefined();const length=controls.querySelector<HTMLSelectElement>(`[aria-label="Message length for ${name}"]`)!
  length.value='short';length.dispatchEvent(new dom.window.Event('change'));expect(settings.textingStyles!.character.length).toBe('short')
  const tone=controls.querySelector<HTMLTextAreaElement>('textarea')!;expect(tone.maxLength).toBe(400);tone.value='Casual';tone.dispatchEvent(new dom.window.Event('input'));expect(settings.textingStyles!.character.tone).toBe('Casual');length.value='';length.dispatchEvent(new dom.window.Event('change'));expect(settings.textingStyles!.character.length).toBeUndefined();expect(settings.textingStyles!.character.tone).toBe('Casual')
 }finally{dom.window.close();globalThis.document=previous}
})

test('removed-character styles remain recoverable without applying to another character',async()=>{
 const f=fixture(),{room}=await f.create();f.host.characters.get=async id=>['alice_character','second_character'].includes(id)?{id,name:id}:null
 let saved=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:['alice_character','second_character'],settings:{...room.settings,textingStyles:{alice_character:{tone:'Retained style'}}}})
 saved=await f.service.update('alice',{roomId:room.id,revision:saved.revision,title:saved.title,characterIds:['second_character'],settings:saved.settings});expect(saved.settings!.textingStyles!.alice_character.tone).toBe('Retained style');expect(resolveTextingStyles(saved.settings!.textingStyles,[{id:'second_character',name:'Other'}])).toBe('')
 await expect(save(f,saved,{alice_character:{tone:'Unauthorized nonmember edit'}})).rejects.toThrow('in this chat')
})

test('texting settings participate in existing dirty-form protection without auto-saving',()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;const sent:any[]=[],view=new MochiView(p=>sent.push(p),()=>{},()=>{})
 try{
  const room:any={id:'room',revision:1,title:'Room',characterIds:['c'],persona:{source:'manual',name:'Me',description:'',sourceId:'',avatarUrl:''},settings:defaultMochiSettings(),messages:[]};view.state={rooms:[room],characters:[{id:'c',name:'Character',avatarUrl:''}],personas:[],connections:[],warnings:[]};view.select(room.id);view.editing=true;document.body.append(view.render('desktop'));expect(view.hasUnsavedChanges()).toBe(false)
  const length=document.querySelector<HTMLSelectElement>('[aria-label="Message length for Character"]')!;length.value='short';length.dispatchEvent(new dom.window.Event('change'));expect(view.hasUnsavedChanges()).toBe(true);expect(sent).toHaveLength(0);expect(room.settings.textingStyles).toBeUndefined()
 }finally{view.destroy(false);dom.window.close();globalThis.document=previous}
})

test('restored multiline composer drafts recover bounded height without changing Enter/Stop ownership',()=>{
 const dom=new JSDOM('<body></body>'),oldDocument=globalThis.document,oldFrame=globalThis.requestAnimationFrame;globalThis.document=dom.window.document;const frames:FrameRequestCallback[]=[];globalThis.requestAnimationFrame=callback=>{frames.push(callback);return 1}
 const view=new MochiView(()=>{},()=>{},()=>{})
 try{
  const room:any={id:'room',revision:1,title:'Room',characterIds:['c'],persona:{name:'Me'},settings:defaultMochiSettings(),messages:[]};view.state={rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select(room.id);(view as any).drafts.set(room.id,'A draft\nwith several\nlines');document.body.append(view.render('desktop'))
  const composer=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;Object.defineProperty(composer,'scrollHeight',{value:180});for(const callback of frames)callback(0);expect(composer.style.height).toBe('112px');expect(composer.value).toContain('several');expect(document.querySelector('[aria-label="Send"]')).not.toBeNull()
 }finally{view.destroy(false);globalThis.requestAnimationFrame=oldFrame;globalThis.document=oldDocument;dom.window.close()}
})
