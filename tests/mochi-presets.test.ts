import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {DEFAULT_PRESET_ID} from '../src/mochi/presets.js'
import {MochiPresetPanel} from '../src/mochi/preset-panel.js'
import {resolveMochiContext} from '../src/mochi/context.js'

function fixture(){
 const files=new Map<string,unknown>(),calls:any[]=[],events:any[]=[]
 const host:MochiHost={userStorage:{exists:async(p,u)=>files.has(u+':'+p),getJson:async(p,o)=>files.has(o.userId+':'+p)?structuredClone(files.get(o.userId+':'+p)):'fallback'in o?o.fallback:Promise.reject(Error('Missing')),setJson:async(p,d,o)=>{files.set(o.userId+':'+p,structuredClone(d))},move:async(a,b,u)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async(p,u)=>Array.from(files.keys()).filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length))},permissions:{has:()=>true},characters:{get:async(id,u)=>id===u+'_character'?{id,name:'Character'}:null,list:async()=>({data:[]})},personas:{get:async()=>null,list:async()=>({data:[]})},connections:{get:async(id,u)=>id===u+'_connection'?{id,model:'synthetic'}:null,list:async()=>[]},tokens:{countMessages:async m=>({total_tokens:Math.ceil(JSON.stringify(m).length/4)})},generate:{quiet:async r=>{calls.push(r);return{content:JSON.stringify({speakerId:'alice_character',text:'Synthetic response',reactions:[{actorId:'forged',messageId:'foreign',emoji:'❤️'}]})}}},sendToFrontend:p=>events.push(p)}
 const service=new MochiService(host)
 const create=async(fictional=false)=>{
  const accountId=fictional?(await service.fictionalAccounts.create('alice',{displayName:'Synthetic profile',username:'',persona:{source:'manual',name:'Synthetic',description:''}})).id:undefined
  const input={accountId,title:'Synthetic',characterIds:['alice_character'],persona:fictional?undefined:{source:'manual',name:'Me',description:''}}
  let room=await service.create('alice',input)
  // Model a conversation persisted before v2: an implicit legacy binding stays implicit.
  delete room.preset;files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(room))
  room=await service.update('alice',{...input,roomId:room.id,revision:room.revision,settings:{...defaultMochiSettings(),autoReply:false,responseMode:'manual',connectionId:'alice_connection'}})
  await service.message('alice',{accountId,roomId:room.id,revision:room.revision,requestId:'seed',content:'Original message'})
  return{room:await service.read('alice',room.id,accountId),accountId,input}
 }
 const react=(room:any,accountId:string|undefined,requestId:string,emoji='👍',extras:any={})=>service.react('alice',{accountId,roomId:room.id,revision:room.revision,messageId:(room.messages[0]as any).id,requestId,emoji,...extras})
 return{host,files,calls,events,service,create,react}
}

const createPreset=async(f:ReturnType<typeof fixture>,room:any)=>f.service.presets.mutate('alice',{accountId:room.accountId,revision:0,requestId:'create_preset',action:'create',name:'Synthetic style',dmInstructions:'DM instruction {{literal}}',groupInstructions:'Group instruction'})
const bind=(f:ReturnType<typeof fixture>,room:any,id:string,rev=1,requestId='bind')=>f.service.bindPreset('alice',{roomId:room.id,accountId:room.accountId,revision:room.revision,requestId,presetId:id,presetRevision:rev,confirmed:true})
for(const fictional of [false,true])test(`immutable revisions, explicit binding and archive recovery in ${fictional?'fictional':'legacy'} scope`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),other=await f.create(fictional),bank=await createPreset(f,room),p=bank.presets[0],before=structuredClone(room.messages)
 await bind(f,room,p.id);await bind(f,room,p.id)
 let saved=await f.service.read('alice',room.id,room.accountId);expect(saved.preset!.revision).toBe(1);expect(saved.messages).toEqual(before)
 await f.service.presets.mutate('alice',{accountId:room.accountId,revision:bank.revision,requestId:'publish',action:'publish',id:p.id,dmInstructions:'New DM',groupInstructions:'New group'})
 expect((await f.service.presets.resolve('alice',saved)).dmInstructions).toBe('DM instruction {{literal}}');expect((await f.service.read('alice',other.room.id,other.room.accountId)).preset).toBeUndefined()
 await bind(f,saved,p.id,2,'update');saved=await f.service.read('alice',room.id,room.accountId);expect((await f.service.presets.resolve('alice',saved)).dmInstructions).toBe('New DM')
 const current=await f.service.presets.read('alice',room.accountId);await f.service.presets.mutate('alice',{accountId:room.accountId,revision:current.revision,requestId:'archive',action:'archive',id:p.id})
 expect((await new MochiService(f.host).presets.resolve('alice',saved)).revision).toBe(2)
 await bind(f,saved,DEFAULT_PRESET_ID,1,'default');saved=await f.service.read('alice',room.id,room.accountId);expect(saved.preset).toBeUndefined();expect(saved.messages).toEqual(before)
 expect((await f.service.presets.read('alice',room.accountId)).presets[0].revisions).toHaveLength(2)
})

test('duplicate, rename, restore and receipt replay preserve published content',async()=>{
 const f=fixture(),{room}=await f.create();let bank=await createPreset(f,room),id=bank.presets[0].id
 const duplicate={revision:bank.revision,requestId:'duplicate',action:'duplicate',id,sourceRevision:1,name:'Copy'};await f.service.presets.mutate('alice',duplicate);await f.service.presets.mutate('alice',duplicate);bank=await f.service.presets.read('alice');expect(bank.presets).toHaveLength(2);expect(bank.presets[1].revisions[0].dmInstructions).toBe(bank.presets[0].revisions[0].dmInstructions)
 for(const action of ['rename','archive','restore']){bank=await f.service.presets.mutate('alice',{revision:bank.revision,requestId:action,action,id,name:'Renamed'})}
 expect(bank.presets[0].name).toBe('Renamed');expect(bank.presets[0].archived).toBe(false);expect(bank.presets[0].revisions).toHaveLength(1)
 await expect(f.service.presets.mutate('alice',{revision:bank.revision,requestId:'reserved',action:'publish',id:DEFAULT_PRESET_ID,dmInstructions:'bad',groupInstructions:'bad'})).rejects.toThrow()
})

test('account scope, malformed IDs, missing references and corrupted banks fail safely',async()=>{
 const f=fixture(),{room}=await f.create(true),other=await f.create(true),bank=await createPreset(f,room),id=bank.presets[0].id
 await expect(bind(f,other.room,id)).rejects.toThrow('unavailable');await expect(bind(f,room,'../foreign')).rejects.toThrow();await expect(bind(f,room,id,99)).rejects.toThrow('unavailable')
 await expect(f.service.presets.resolve('bob',{accountId:room.accountId,preset:{id,revision:1,accountId:room.accountId}})).rejects.toThrow()
 await expect(f.service.presets.resolve('alice',{accountId:other.accountId,preset:{id,revision:1,accountId:room.accountId}})).rejects.toThrow()
 const path='alice:mochi/v1/presets/'+room.accountId+'.json';f.files.set(path,{...bank,ownerId:'bob'});await expect(f.service.presets.read('alice',room.accountId)).rejects.toThrow('Damaged');expect((await f.service.read('alice',room.id,room.accountId)).messages).toEqual(room.messages)
})

test('concurrent/stale publication and interrupted writes preserve committed library and room',async()=>{
 const f=fixture(),{room}=await f.create(),bank=await createPreset(f,room),id=bank.presets[0].id
 const results=await Promise.allSettled(['one','two'].map(requestId=>f.service.presets.mutate('alice',{revision:1,requestId,action:'publish',id,dmInstructions:requestId,groupInstructions:''})))
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1)
 const before=structuredClone(f.files);f.host.userStorage.move=async()=>{throw Error('Interrupted')};await expect(f.service.presets.mutate('alice',{revision:2,requestId:'fail',action:'publish',id,dmInstructions:'lost',groupInstructions:''})).rejects.toThrow('Interrupted')
 expect(f.files.get('alice:mochi/v1/presets/legacy.json')).toEqual(before.get('alice:mochi/v1/presets/legacy.json'));expect((await f.service.read('alice',room.id)).preset).toBeUndefined()
 await expect(bind(f,room,id,3)).rejects.toThrow('unavailable')
})

test('custom DM/group instructions are counted once before room overrides and preview matches generation',async()=>{
 const f=fixture(),{room}=await f.create(),bank=await createPreset(f,room),id=bank.presets[0].id
 await bind(f,room,id);let saved=await f.service.read('alice',room.id)
 saved=await f.service.update('alice',{roomId:room.id,revision:saved.revision,title:saved.title,characterIds:saved.characterIds,settings:{...saved.settings,instructions:'Room override'}})
 await f.service.handle({type:'mochi:preview',roomId:room.id,requestId:'preview',scenario:'continue',responder:'auto'},'alice');const preview=f.events.at(-1).preview
 expect(preview.preset.id).toBe(id);expect(preview.preset.variant).toBe('dm');expect(preview.messages[0].content.indexOf('DM instruction')).toBeLessThan(preview.messages[0].content.indexOf('ROOM INSTRUCTIONS: Room override'));expect(preview.messages[0].content.match(/DM instruction/g)).toHaveLength(1);expect(preview.messages[0].content).toContain('{{literal}}')
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'continue',content:''});expect(f.calls[0].messages).toEqual(preview.messages)
 const effective=await f.service.presets.resolve('alice',saved),group={...saved,characterIds:['alice_character','second']};const plan=await resolveMochiContext(group,[],'auto',async m=>{expect(m[0].content).toContain('Group instruction');return 100},new AbortController().signal,false,effective);expect(plan.preset.variant).toBe('group');expect(plan.messages[0].content).not.toContain('DM instruction')
})

test('binding changes invalidate pending context; library publishing never cancels active replies',async()=>{
 const f=fixture(),{room}=await f.create(),bank=await createPreset(f,room),id=bank.presets[0].id,now=Date.now()
 room.runtime={version:1,enabled:false,jobs:[{id:'pending',kind:'response',createdAt:now,dueAt:now+1000,nextAttemptAt:now+1000,expiresAt:now+10000,revision:room.revision,responder:'alice_character',status:'queued',attempts:0}]};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',room)
 await bind(f,room,id);let saved=await f.service.read('alice',room.id);expect(saved.runtime!.jobs[0].status).toBe('cancelled');expect(saved.messages).toEqual(room.messages)
 let finish!:(r:any)=>void,ready!:()=>void;const started=new Promise<void>(resolve=>ready=resolve);f.host.generate!.quiet=async r=>{f.calls.push(r);ready();return new Promise(resolve=>finish=resolve)}
 const running=f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'active',content:''});await started
 await f.service.presets.mutate('alice',{revision:bank.revision,requestId:'publish_new',action:'publish',id,dmInstructions:'Not applied',groupInstructions:''});finish({content:JSON.stringify({speakerId:'alice_character',text:'Original reply'})});await running
 saved=await f.service.read('alice',room.id);expect((saved.messages.at(-1)as any).content).toBe('Original reply');expect(saved.preset!.revision).toBe(1);expect(JSON.stringify(f.calls[0].messages)).not.toContain('Not applied')
})

test('bound scheduled generation uses fixed published context and default restore remains migration-free',async()=>{
 const f=fixture(),{room}=await f.create(true),bank=await createPreset(f,room),id=bank.presets[0].id
 await bind(f,room,id);const saved=await f.service.read('alice',room.id,room.accountId),now=Date.now()
 saved.runtime={version:1,enabled:false,jobs:[{id:'scheduled_bound',kind:'response',createdAt:now,dueAt:now,nextAttemptAt:now,expiresAt:now+10000,revision:saved.revision,responder:'alice_character',status:'queued',attempts:0}]};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',saved)
 await f.service.presets.mutate('alice',{accountId:room.accountId,revision:bank.revision,requestId:'later_publish',action:'publish',id,dmInstructions:'New unpublished-to-room style',groupInstructions:''})
 await f.service.dispatchScheduled('alice',room.id,'scheduled_bound',()=>now,async()=>false,async()=>true);expect(f.calls).toHaveLength(1);expect(JSON.stringify(f.calls[0].messages)).toContain('DM instruction {{literal}}');expect(JSON.stringify(f.calls[0].messages)).not.toContain('New unpublished-to-room style')
 const current=await f.service.read('alice',room.id,room.accountId);await bind(f,current,DEFAULT_PRESET_ID,1,'restore');const restored=await f.service.read('alice',room.id,room.accountId);await bind(f,restored,DEFAULT_PRESET_ID,1,'again');expect((await f.service.read('alice',room.id,room.accountId)).revision).toBe(restored.revision)
 const target=await f.create(true);await bind(f,restored,id,1,'rebind');const rebound=await f.service.read('alice',room.id,room.accountId);await expect(f.service.assignRoom('alice',{roomId:room.id,accountId:room.accountId,revision:rebound.revision,associationRevision:0,targetAccountId:target.accountId,confirmed:true,preservePersona:true})).rejects.toThrow('Restore Mochi Default')
})

test('published instructions are bounded and huge custom context cannot bypass token limits',async()=>{
 const f=fixture(),{room}=await f.create();await expect(f.service.presets.mutate('alice',{revision:0,requestId:'huge',action:'create',name:'x',dmInstructions:'x'.repeat(4001),groupInstructions:''})).rejects.toThrow()
 const bank=await createPreset(f,room);await bind(f,room,bank.presets[0].id);const saved=await f.service.read('alice',room.id),preset=await f.service.presets.resolve('alice',saved)
 await expect(resolveMochiContext(saved,[],'auto',async()=>100000,new AbortController().signal,false,preset)).rejects.toThrow('budget')
})

for(const width of [320,390,900])test(`${width}px preset panel has separate publish/apply, staged draft and late-scope protection`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width});const room:any={id:'room',revision:1,characterIds:['c'],messages:[]},sent:any[]=[],bindings:any[]=[];let current=room
 const panel=new MochiPresetPanel(p=>sent.push(p),()=>current,()=>{},(id,r)=>bindings.push([id,r]),()=>{})
 try{
  panel.show(room);panel.receive({...sent.at(-1),type:'mochi:presets',bank:{version:1,revision:0,presets:[]},effective:{id:DEFAULT_PRESET_ID,name:'Mochi Default',builtIn:true,revision:1}});document.body.append(panel.render(room));Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Create preset')!.click();document.body.replaceChildren(panel.render(room))
  const name=document.querySelector<HTMLInputElement>('[aria-label="Preset name"]')!;name.value='Long name '.repeat(5);name.dispatchEvent(new dom.window.Event('input'));document.querySelector<HTMLButtonElement>('[aria-label="Edit block Base Messaging"]')!.click();document.body.replaceChildren(panel.render(room));const content=document.querySelector<HTMLTextAreaElement>('[aria-label="Block content"]')!;content.value='Literal {{future_macro}}';content.dispatchEvent(new dom.window.Event('input'));expect(panel.draft!.blocks!.categories[0].blocks[0].content).toContain('{{future_macro}}');expect(bindings).toHaveLength(0)
  document.querySelector<HTMLFormElement>('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));expect(sent.at(-1).action).toBe('create');expect(sent.at(-1).blocks.categories[0].blocks[0].content).toContain('{{future_macro}}');expect(sent.at(-1).layout).toBe('blocks-v1');expect(bindings).toHaveLength(0)
  panel.receive({type:'mochi:error',requestId:sent.at(-1).requestId,message:'Stale synthetic library'});expect(panel.draft).toBeDefined();current={...room,id:'other'};panel.receive({...sent.at(-1),type:'mochi:presets',bank:{revision:1,presets:[]}});expect(panel.bank?.revision).toBe(0);panel.reset(true);expect(panel.open).toBe(false);expect(panel.draft).toBeUndefined()
 }finally{panel.reset(true);dom.window.close();globalThis.document=previous}
})

test('two-level navigation restores overview scroll, expansion and draft without publishing or leaking block content',async()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 const room:any={id:'ux_room',revision:1,characterIds:['c'],messages:[]},sent:any[]=[],bindings:any[]=[];let root:HTMLElement
 const render=()=>{root=panel.render(room);document.body.replaceChildren(root)}
 const panel=new MochiPresetPanel(p=>sent.push(p),()=>room,render,(id,r)=>bindings.push([id,r]),()=>{})
 const click=(label:string)=>{const button=root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)||Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===label);expect(button).toBeDefined();button!.click()}
 try{
  panel.show(room);panel.receive({...sent.at(-1),type:'mochi:presets',bank:{version:1,revision:0,presets:[]},effective:{id:DEFAULT_PRESET_ID,name:'Mochi Default',builtIn:true,revision:1}})
  click('Create preset');await Promise.resolve();const doc=panel.draft!.blocks!,second=doc.categories[0].blocks[1],secondContent=second.content
  doc.categories[1].collapsed=true;root!.scrollTop=287;root!.dispatchEvent(new dom.window.Event('scroll'))
  click('Edit block Base Messaging');await Promise.resolve();expect(root!.scrollTop).toBe(0);expect(root!.querySelector('.mochi-category-list')).toBeNull();expect(root!.querySelector('button[type=submit]')).toBeNull()
  const area=root!.querySelector<HTMLTextAreaElement>('[aria-label="Block content"]')!;area.value='UX retained draft';area.dispatchEvent(new dom.window.Event('input'))
  click('Back to Blocks');await Promise.resolve();expect(root!.scrollTop).toBe(287);expect(doc.categories[1].collapsed).toBe(true);expect(root!.querySelector('[aria-label="Block content"]')).toBeNull()
  click('Edit block '+second.name);await Promise.resolve();expect(root!.querySelector<HTMLTextAreaElement>('[aria-label="Block content"]')!.value).toBe(secondContent)
  click('Done editing block');await Promise.resolve();click('Edit block Base Messaging');expect(root!.querySelector<HTMLTextAreaElement>('[aria-label="Block content"]')!.value).toBe('UX retained draft')
  expect(sent).toHaveLength(1);expect(bindings).toHaveLength(0)
 }finally{panel.reset(true);globalThis.document=previous;dom.window.close()}
})

test('preset workspace replaces conversation and retains its stylesheet on desktop and handset',async()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document
 const f=fixture(),{room}=await f.create(),sent:any[]=[];const view=new MochiView(p=>sent.push(p),()=>{},()=>{})
 try{
  view.state=await f.service.state('alice');view.select(room.id)
  for(const surface of ['desktop','chat'] as const){
   const chat=view.render(surface);expect(chat.querySelector('.mochi-composer')).not.toBeNull()
   chat.querySelector<HTMLButtonElement>('[aria-label="Presets"]')!.click()
   const page=view.render(surface);expect(page.dataset.presetWorkspace).toBe('true');expect(page.querySelector('style')!.textContent).toContain('.mochi-block-detail');expect(page.querySelector('.mochi-room-header')).toBeNull();expect(page.querySelector('.mochi-composer')).toBeNull()
   Array.from(page.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Return to conversation')!.click()
   expect(view.render(surface).querySelector('.mochi-composer')).not.toBeNull()
  }
 }finally{view.destroy();globalThis.document=previous;dom.window.close()}
})
