import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {createHash} from 'node:crypto'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultPreset,defaultV2Preset,DEFAULT_PRESET_ID,DEFAULT_V2_PRESET_ID,validateBinding} from '../src/mochi/presets.js'
import {validateBlocks} from '../src/mochi/prompt-blocks.js'
import {resolveMochiContext} from '../src/mochi/context.js'
import {MochiPreview} from '../src/mochi/preview-panel.js'
import {MochiPresetPanel} from '../src/mochi/preset-panel.js'
import {parseResponse} from '../src/mochi/response.js'

function fixture(){
 const files=new Map<string,any>(),calls:any[]=[],events:any[]=[]
 const host:MochiHost={userStorage:{exists:async(p,u)=>files.has(u+':'+p),getJson:async(p,o)=>structuredClone(files.get(o.userId+':'+p)??o.fallback),setJson:async(p,v,o)=>{files.set(o.userId+':'+p,structuredClone(v))},move:async(a,b,u)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async(p,u)=>[...files.keys()].filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length))},characters:{get:async(id,u)=>u==='owner'&&['one','two'].includes(id)?{id,name:id,description:'CHARACTER_'+id}:null,list:async()=>({data:[]})},personas:{get:async()=>null,list:async()=>({data:[]})},permissions:{has:()=>true},connections:{get:async id=>id==='fixture'?{id,model:'synthetic'}:null,list:async()=>[]},tokens:{countMessages:async m=>({total_tokens:Math.ceil(JSON.stringify(m).length/4),model:'synthetic',approximate:true})},generate:{quiet:async r=>{calls.push(r);return{content:'Hello\nthere'}}},sendToFrontend:p=>events.push(p)}
 const service=new MochiService(host)
 const create=async(group=false,accountId?:string,preset?:any)=>service.create('owner',{title:'Synthetic room',characterIds:group?['one','two']:['one'],accountId,persona:{source:'manual',name:'Fictional user',description:'PERSONA_CONTEXT'},...(preset?{preset}:{})})
 const configure=async(room:any)=>service.update('owner',{roomId:room.id,accountId:room.accountId,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,responseMode:'manual',connectionId:'fixture',instructions:'ROOM_CONTEXT'}})
 return{host,service,files,calls,events,create,configure}
}

test('v2 has deterministic valid independent blocks and a distinct immutable identity',()=>{
 const first=defaultV2Preset(),snapshot=JSON.stringify(first)
 // Released revision 1 must never drift silently; future content needs versioning.
 expect(createHash('sha256').update(snapshot).digest('hex')).toBe('8309badb9bf4a42efbbd2798697e3438d9d3202b2270113daa75a8b26aad3842')
 expect(first.id).toBe(DEFAULT_V2_PRESET_ID);expect(first.layout).toBe('blocks-v1');expect(validateBlocks(first.blocks)).toEqual(first.blocks)
 expect(first.blocks!.categories.map(c=>c.name)).toEqual(['Core Instructions','Character & Persona','Writing & Texting','Conversation Context'])
 for(let i=0;i<5;i++)expect(JSON.stringify(defaultV2Preset())).toBe(snapshot)
 first.blocks!.categories[0].blocks[0].content='Edited independent return';expect(JSON.stringify(defaultV2Preset())).toBe(snapshot)
 expect(snapshot).not.toContain('persona_outlet::');expect(snapshot).not.toContain('1990s');expect(snapshot).not.toContain('mochi.response')
 expect(defaultPreset()).toEqual({id:'mochi_default',name:'Mochi Default',builtIn:true,revision:1,layout:'legacy-v1',dmInstructions:'',groupInstructions:''})
 for(const id of [DEFAULT_PRESET_ID,DEFAULT_V2_PRESET_ID])expect(()=>validateBinding({id,revision:2})).toThrow()
})

for(const group of [false,true])for(const fictional of [false,true])test(`new ${group?'group':'DM'} ${fictional?'profile':'legacy creation path'} explicitly binds v2`,async()=>{
 const f=fixture(),accountId=fictional?(await f.service.fictionalAccounts.create('owner',{displayName:'Synthetic',persona:{source:'manual',name:'Synthetic'}})).id:undefined
 const room=await f.create(group,accountId)
 expect(room.preset).toEqual({id:DEFAULT_V2_PRESET_ID,revision:1,...(accountId?{accountId}:{})})
 expect((await f.service.read('owner',room.id,accountId)).preset).toEqual(room.preset)
 const preset=await f.service.presets.resolve('owner',room)
 const plan=await resolveMochiContext(room,room.characterIds.map(id=>({id,name:id,description:'CHARACTER_'+id})),'auto',async()=>100,new AbortController().signal,group,preset)
 const text=JSON.stringify(plan.messages)
 expect(text).toContain(group?'Let eligible characters contribute':'Reply naturally to the other person')
 expect(text).not.toContain(group?'Reply naturally to the other person':'Let eligible characters contribute')
 expect(text.match(/CHARACTER_one/g)).toHaveLength(1)
 expect(text).toContain('no active action handlers')
 if(group)expect(text).toContain('empty messages array')
})

test('existing implicit and explicitly bound legacy conversations resolve identically without writes',async()=>{
 const f=fixture(),room=await f.create();delete room.preset;f.files.set('owner:mochi/v1/rooms/'+room.id+'.json',structuredClone(room))
 const before=JSON.stringify([...f.files]),unbound=await f.service.presets.resolve('owner',await f.service.read('owner',room.id)),bound=await f.service.presets.resolve('owner',{preset:{id:DEFAULT_PRESET_ID,revision:1}})
 expect(unbound).toEqual(defaultPreset());expect(bound).toEqual(unbound);expect(JSON.stringify([...f.files])).toBe(before)
 const resolve=(p:any)=>resolveMochiContext(room,[{id:'one',name:'one'}],'one',async()=>10,new AbortController().signal,false,p)
 expect((await resolve(unbound)).messages).toEqual((await resolve(bound)).messages)
})

test('creation honors explicit valid alternatives and rejects foreign or unavailable revisions before saving',async()=>{
 const f=fixture(),legacy=await f.create(false,undefined,{id:DEFAULT_PRESET_ID,revision:1})
 expect(legacy.preset?.id).toBe(DEFAULT_PRESET_ID)
 const bank=await f.service.presets.mutate('owner',{action:'create',name:'Intentional choice',revision:0,requestId:'create_custom',dmInstructions:'CUSTOM'})
 const custom=await f.create(false,undefined,{id:bank.presets[0].id,revision:1});expect(custom.preset?.id).toBe(bank.presets[0].id)
 const before=JSON.stringify([...f.files]);await expect(f.create(false,undefined,{id:DEFAULT_V2_PRESET_ID,revision:2})).rejects.toThrow();await expect(f.create(false,undefined,{id:bank.presets[0].id,revision:1,accountId:'foreign'})).rejects.toThrow();expect(JSON.stringify([...f.files])).toBe(before)
})

test('v2 duplication, independent publication and explicit apply/restore preserve saved revisions',async()=>{
 const f=fixture(),room=await f.create(),original=JSON.stringify(defaultV2Preset())
 let bank=await f.service.presets.mutate('owner',{action:'duplicate',id:DEFAULT_V2_PRESET_ID,sourceRevision:1,name:'My copy',revision:0,requestId:'duplicate_v2'})
 const copy=bank.presets[0],blocks=structuredClone(copy.revisions[0].blocks!)
 blocks.categories[0].blocks[0].content='CUSTOM_VOICE';blocks.categories.reverse()
 bank=await f.service.presets.mutate('owner',{action:'publish',id:copy.id,revision:1,requestId:'publish_copy',layout:'blocks-v1',blocks})
 expect(bank.presets[0].revisions).toHaveLength(2);expect(bank.presets[0].revisions[0].blocks).toEqual(defaultV2Preset().blocks)
 expect((await f.service.read('owner',room.id)).preset?.id).toBe(DEFAULT_V2_PRESET_ID)
 let current=room
 for(const [id,revision]of [[copy.id,2],[DEFAULT_PRESET_ID,1],[DEFAULT_V2_PRESET_ID,1]] as const){await f.service.bindPreset('owner',{roomId:room.id,revision:current.revision,presetId:id,presetRevision:revision,confirmed:true,requestId:'bind_'+id});current=await f.service.read('owner',room.id);expect((await f.service.presets.resolve('owner',current)).id).toBe(id)}
 expect(JSON.stringify(defaultV2Preset())).toBe(original);expect(current.messages).toEqual(room.messages)
 await expect(f.service.presets.mutate('owner',{action:'publish',id:DEFAULT_V2_PRESET_ID,revision:bank.revision,requestId:'immutable',layout:'blocks-v1',blocks})).rejects.toThrow('cannot be modified')
})

test('v2 profile reassignment retains the preset while updating its ownership binding',async()=>{
 const f=fixture(),room=await f.create(),account=await f.service.fictionalAccounts.create('owner',{displayName:'Synthetic',persona:{source:'manual',name:'Synthetic'}})
 await f.service.assignRoom('owner',{roomId:room.id,revision:room.revision,associationRevision:0,targetAccountId:account.id,confirmed:true,preservePersona:true})
 const saved=await f.service.read('owner',room.id,account.id)
 expect(saved.preset).toEqual({id:DEFAULT_V2_PRESET_ID,revision:1,accountId:account.id});expect(saved.messages).toEqual(room.messages);expect(saved.persona).toEqual(room.persona)
 expect((await f.service.presets.resolve('owner',saved)).id).toBe(DEFAULT_V2_PRESET_ID)
})

test('v2 preview and generation agree, retain roles and resolve context once without provider calls from preview',async()=>{
 const f=fixture();let room=await f.configure(await f.create())
 await f.service.message('owner',{roomId:room.id,revision:room.revision,requestId:'seed',content:'SAVED_HISTORY'})
 room=await f.service.read('owner',room.id)
 await f.service.handle({type:'mochi:preview',roomId:room.id,scenario:'continue',responder:'auto',requestId:'preview'},'owner')
 const data=f.events.at(-1).preview;expect(data).toBeDefined();expect(f.calls).toHaveLength(0)
 const text=JSON.stringify(data.messages);for(const content of ['CHARACTER_one','PERSONA_CONTEXT','ROOM_CONTEXT','SAVED_HISTORY'])expect(text.match(new RegExp(content,'g'))).toHaveLength(1)
 expect(data.messages.find((m:any)=>m.content.includes('SAVED_HISTORY')).role).toBe('user')
 expect(data.warnings.some((w:string)=>w.includes('Chat memory is absent'))).toBe(true)
 await f.service.message('owner',{roomId:room.id,revision:room.revision,requestId:'continue',content:''})
 expect(f.calls[0].messages).toEqual(data.messages);expect((await f.service.read('owner',room.id)).preset).toEqual(room.preset)
})

test('v2 keeps app enforced hybrid, silence, speaker and action guards even after creative blocks are removed',async()=>{
 const f=fixture(),room=await f.create(),preset=defaultV2Preset();preset.blocks!.categories=[]
 const plan=await resolveMochiContext(room,[{id:'one',name:'One'}],'one',async()=>50,new AbortController().signal,false,preset)
 expect(plan.messages[0].content).toContain('plain text only');expect(plan.messages[0].content).toContain('no active action handlers')
 expect(parseResponse('Hello\nworld',false,{speaker:'one',eligibleIds:['one'],natural:false})[0].text).toBe('Hello\nworld')
 expect(parseResponse('{"messages":[]}',false,{speaker:'auto',eligibleIds:['one','two'],natural:true})).toEqual([])
 expect(()=>parseResponse('{"speakerId":"foreign","text":"x"}',false,{speaker:'one',eligibleIds:['one'],natural:false})).toThrow()
 expect(()=>parseResponse('{"protocol":"mochi.response","version":1,"actions":[{"type":"delete"}]}',false,{speaker:'one',eligibleIds:['one'],natural:false})).toThrow()
 const controller=new AbortController();controller.abort();await expect(resolveMochiContext(room,[],'auto',async()=>1,controller.signal,false,preset)).rejects.toThrow()
})

test('v2 memory, notes, retained history and persona add-ons keep roles and occur once',async()=>{
 const f=fixture();let room=await f.configure(await f.create())
 await f.service.message('owner',{roomId:room.id,revision:room.revision,requestId:'history_user',content:'Covered user history'})
 room=await f.service.read('owner',room.id)
 await f.service.message('owner',{roomId:room.id,revision:room.revision,requestId:'history_assistant',content:''})
 room=await f.service.read('owner',room.id)
 await f.service.saveMemory('owner',{roomId:room.id,revision:room.revision,associationRevision:0,requestId:'verified_memory',action:'save',text:'VERIFIED_MEMORY_CONTEXT',boundaryId:(room.messages[0] as any).id,enabled:true,excludeCovered:true,confirmed:true})
 room=await f.service.read('owner',room.id)
 room.systemNotes=[{id:'note_'+'a'.repeat(32),title:'Synthetic note',body:'SYSTEM_NOTE_CONTEXT',enabled:true}]
 const before=JSON.stringify(room)
 const plan=await resolveMochiContext(room,[{id:'one',name:'one',description:'CHARACTER_one'}],'one',async()=>100,new AbortController().signal,false,defaultV2Preset(),{description:'PERSONA_CONTEXT\nLOCAL_ADDON\nGLOBAL_ADDON',outlets:{mood:'NAMED_OUTLET'}})
 for(const marker of ['VERIFIED_MEMORY_CONTEXT','SYSTEM_NOTE_CONTEXT','LOCAL_ADDON','GLOBAL_ADDON','PERSONA_CONTEXT','CHARACTER_one'])expect(JSON.stringify(plan.messages).match(new RegExp(marker,'g'))).toHaveLength(1)
 expect(plan.messages.find(m=>m.content.includes('VERIFIED_MEMORY_CONTEXT'))?.role).toBe('user')
 expect(plan.messages.find(m=>m.content.includes('VERIFIED_MEMORY_CONTEXT'))?.content).toContain('untrusted')
 expect(plan.messages.find(m=>m.content.includes('SYSTEM_NOTE_CONTEXT'))?.role).toBe('system')
 expect(plan.messages.find(m=>m.content.includes('Hello\nthere'))?.role).toBe('assistant')
 expect(plan.history).toMatchObject({stored:2,retained:1,excluded:1,trimmed:0})
 expect(JSON.stringify(plan.messages)).not.toContain('NAMED_OUTLET');expect(JSON.stringify(room)).toBe(before)
})

for(const interleaved of [false,true])test(`compact preview retains full message order and visible warnings (${interleaved?'interleaved custom positions':'built-in'})`,async()=>{
 const f=fixture(),room=await f.configure(await f.create()),draft=defaultV2Preset().blocks!
 if(interleaved){draft.categories[0].blocks[0].position='after-history';draft.categories[0].blocks[0].content+=' {{unsupported_fixture}}'}
 await f.service.handle({type:'mochi:preview',roomId:room.id,scenario:'continue',responder:'auto',requestId:'data',...(interleaved?{draftBlocks:draft}:{})},'owner');const data=f.events.at(-1).preview
 const dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document
 const sent:any[]=[],preview=new MochiPreview(p=>sent.push(p),()=>room,()=>{},()=>{})
 try{preview.show(room);preview.receive({...sent.at(-1),type:'mochi:preview',revision:room.revision,associationRevision:0,preview:data});const node=preview.render(room);document.body.append(node)
  expect([...node.querySelectorAll('pre')].map(n=>n.textContent)).toEqual(data.messages.map((m:any)=>m.content))
  expect(node.querySelector('[aria-label="Prompt overview"]')?.textContent).toContain('input tokens')
  const advanced=[...node.querySelectorAll('details')].find(n=>n.firstElementChild?.textContent==='Advanced diagnostics')!;expect(advanced.open).toBe(false);expect(advanced.textContent).toContain('Explicit Mochi parameters')
  expect([...node.querySelectorAll('.mochi-preview-warning')].every(n=>!n.closest('details'))).toBe(true)
  if(interleaved)expect(node.querySelector('.mochi-preview-warning')?.textContent).toContain('Unsupported')
  expect(sent.map(p=>p.type)).toEqual(['mochi:preview']);expect(f.calls).toHaveLength(0)
 }finally{preview.reset();dom.window.close();globalThis.document=previous}
})

test('built-in library is inspectable and customization opens an independent draft without applying',async()=>{
 const f=fixture(),room=await f.create(),dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document
 const sent:any[]=[],bindings:any[]=[],panel=new MochiPresetPanel(p=>sent.push(p),()=>room,()=>{},(...a)=>bindings.push(a),()=>{})
 try{panel.show(room);panel.receive({...sent.at(-1),type:'mochi:presets',bank:await f.service.presets.read('owner'),effective:defaultV2Preset()});document.body.append(panel.render(room))
  expect(document.body.textContent).toContain('Stable built-in revision');expect(document.body.textContent).toContain('Natural Character Voice')
  const button=[...document.querySelectorAll('button')].find(b=>b.textContent==='Customize Mochi Default v2')!;button.click()
  const request=sent.at(-1),bank=await f.service.presets.mutate('owner',request);panel.receive({...request,type:'mochi:presets',bank,effective:defaultV2Preset()})
  expect(panel.draft?.layout).toBe('blocks-v1');expect(panel.draft?.id).not.toBe(DEFAULT_V2_PRESET_ID);expect(bindings).toHaveLength(0)
  expect(panel.draft?.blocks).toEqual(defaultV2Preset().blocks)
 }finally{panel.reset(true);dom.window.close();globalThis.document=previous}
})
