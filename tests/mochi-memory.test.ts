import {inspectMemory,proveCoverage,validateMemory,summaryPrompt,MAX_SUMMARY_VERSIONS} from '../src/mochi/memory.js'
import {resolveMochiContext} from '../src/mochi/context.js'
import {expandPlacement} from '../src/mochi/macros.js'
import {MochiMemoryPanel,MOCHI_MEMORY_STYLES} from '../src/mochi/memory-panel.js'
import {searchRoom} from '../src/mochi/search.js'
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

const save=(f:ReturnType<typeof fixture>,room:any,requestId='memory',extra:any={})=>f.service.saveMemory('alice',{roomId:room.id,accountId:room.accountId,revision:room.revision,associationRevision:room.associationRevision||0,requestId,action:'save',text:'Remember our first conversation {{mochi_history}}.',boundaryId:room.messages[0].id,enabled:true,excludeCovered:false,confirmed:true,...extra})
const mutate=(f:ReturnType<typeof fixture>,room:any,action:string,extra:any={})=>save(f,room,action,{action,...extra})
const read=(f:ReturnType<typeof fixture>,room:any)=>f.service.read('alice',room.id,room.accountId)
const resolve=(room:any,preset?:any,count:((m:any[])=>Promise<number>)=async()=>100)=>resolveMochiContext(room,[{id:'alice_character',name:'Character'}],'auto',count,new AbortController().signal,false,preset)
const placement=(templates:string[])=>({version:1 as const,rows:templates.map((template,i)=>({id:'section_'+i.toString(16).padStart(32,'0'),title:'Row '+i,template}))})
const manual=(templates:string[])=>({id:'preset_'+'a'.repeat(32),name:'Manual',builtIn:false,revision:1,dmInstructions:'',groupInstructions:'',layout:'manual-v1' as const,placement:placement(templates)})

for(const fictional of [false,true])test(`summary save/edit/restore/disable/clear preserves history and recoverable versions (${fictional?'fictional':'legacy'})`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),original=structuredClone(room.messages)
 await save(f,room);await save(f,room);let current=await read(f,room)
 expect(current.memory!.versions).toHaveLength(1);expect((await inspectMemory(current)).valid).toBe(true);expect(current.messages).toEqual(original)
 await save(f,current,'edit_summary',{text:'Edited recollection'});current=await read(f,room);const first=current.memory!.versions[0]
 await mutate(f,current,'restore',{versionId:first.id});current=await read(f,room)
 expect(current.memory!.versions.at(-1)).toMatchObject({text:first.text,coverage:first.coverage,restoredFrom:first.id});expect(current.memory!.versions.at(-1)!.id).not.toBe(first.id)
 await mutate(f,current,'disable');current=await read(f,room);expect((await resolve(current)).messages).toEqual((await resolve({...room,revision:current.revision})).messages)
 await mutate(f,current,'clear');current=await new MochiService(f.host).read('alice',room.id,room.accountId)
 expect(current.memory!.versions).toHaveLength(5);expect(current.memory!.versions.at(-1)).toMatchObject({text:'',enabled:false,excludeCovered:false});expect(current.messages).toEqual(original);expect(f.calls).toHaveLength(0);expect(current.notifications).toEqual(room.notifications)
})

for(const fictional of [false,true])test(`summary ownership/stale writes/interrupted saves/receipts (${fictional?'fictional':'legacy'})`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),other=await f.create(!fictional)
 await expect(save(f,room,'foreign',{accountId:other.accountId})).rejects.toThrow()
 await expect(f.service.saveMemory('bob',{roomId:room.id,requestId:'foreign',action:'save'})).rejects.toThrow()
 await expect(save(f,room,'boundary',{boundaryId:(other.room.messages[0]as any).id})).rejects.toThrow('unavailable')
 await expect(save(f,room,'unsafe',{confirmed:false})).rejects.toThrow('Confirm')
 await expect(save(f,room,'size',{text:'x'.repeat(12001)})).rejects.toThrow()
 await expect(save(f,room,'stale',{revision:room.revision-1})).rejects.toThrow('changed')
 const move=f.host.userStorage.move;f.host.userStorage.move=async()=>{throw Error('Interrupted atomic replacement')}
 await expect(save(f,room,'retry')).rejects.toThrow('Interrupted');expect((await read(f,room)).memory).toBeUndefined();expect((await read(f,room)).messages).toEqual(room.messages)
 f.host.userStorage.move=move;await save(f,room,'retry');await save(f,room,'retry');expect((await read(f,room)).memory!.versions).toHaveLength(1)
 const current=await read(f,room),results=await Promise.allSettled([save(f,current,'one'),save(f,current,'two')]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1)
 expect((await read(f,other.room)).messages).toEqual(other.room.messages)
 const stored=await read(f,room);expect(()=>validateMemory(stored.memory!,other.room.id,'alice')).toThrow();expect(()=>validateMemory(stored.memory!,room.id,'bob')).toThrow()
})

test('version caps and malformed memory preserve records rather than evicting',async()=>{
 const f=fixture(),{room}=await f.create();await save(f,room);const current=await read(f,room)
 const v=current.memory!.versions[0];current.memory!.versions=Array.from({length:MAX_SUMMARY_VERSIONS},(_,i)=>({...v,id:'summary_'+i.toString(16).padStart(32,'0')}));current.memory!.currentId=current.memory!.versions.at(-1)!.id
 f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(current))
 await expect(save(f,current,'limit')).rejects.toThrow('limit');expect((await read(f,room)).memory!.versions).toHaveLength(100)
 current.memory!.versions[0].coverage!.digest='corrupt';f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(current));await expect(read(f,room)).rejects.toThrow('preserved');expect(f.files.has('alice:mochi/v1/rooms/'+room.id+'.json')).toBe(true)
})

test('exact ordered prefix rejects missing, duplicate and malformed IDs without trusting offsets',async()=>{
 const f=fixture(),{room}=await f.create(),id=(room.messages[0]as any).id
 expect((await proveCoverage(room,id)).count).toBe(1)
 for(const messages of [[...room.messages,...room.messages],[null], [{...(room.messages[0]as any),id:'../foreign'}]])await expect(proveCoverage({...room,messages},id)).rejects.toThrow()
 await expect(proveCoverage(room,'unknown')).rejects.toThrow('unavailable')
})

for(const change of ['content','name','character','delete','reorder','reroll'])test(`covered ${change} invalidates digest; restore never silently repairs it`,async()=>{
 const f=fixture(),{room}=await f.create();await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'second',content:'Second'});const current=await read(f,room)
 await save(f,current,'summary',{boundaryId:(current.messages[1]as any).id,excludeCovered:true});const saved=await read(f,room),old=structuredClone(saved.memory),first:any=saved.messages[0]
 if(change==='content')first.content='Changed';if(change==='name')first.name='Different attribution';if(change==='character')first.characterId='different';if(change==='delete')saved.messages.shift();if(change==='reorder')saved.messages.reverse();if(change==='reroll')first.previousVersions=[{content:first.content,name:first.name,avatarUrl:'',savedAt:'2026-10-13T00:00:00Z'}]
 expect((await inspectMemory(saved)).valid).toBe(false);const plan=await resolve(saved);expect(plan.history.excluded).toBeUndefined();expect(plan.memory!.included).toBe(false);expect(plan.warnings.join(' ')).toContain('raw history');expect(saved.memory).toEqual(old)
 f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(saved));await mutate(f,saved,'restore',{versionId:old!.versions[0].id});const restored=await read(f,room);expect((await inspectMemory(restored)).valid).toBe(false);expect(restored.memory!.versions.at(-1)!.coverage).toEqual(old!.versions[0].coverage)
})

test('new messages do not expand coverage; verified exclusion keeps quotes, pins, reactions and full search',async()=>{
 const f=fixture(),{room}=await f.create();await f.react(room,undefined,'react');let current=await read(f,room)
 await f.service.pinnedContent('alice',{roomId:room.id,revision:current.revision,requestId:'pin',action:'pin',messageId:(room.messages[0]as any).id,pinned:true});current=await read(f,room)
 await save(f,current,'summary',{excludeCovered:true});current=await read(f,room)
 await f.service.message('alice',{roomId:room.id,revision:current.revision,requestId:'quote',content:'New quoted reply',replyTo:(room.messages[0]as any).id});current=await read(f,room);const original=structuredClone(current.messages),plan=await resolve(current)
 expect((await inspectMemory(current)).valid).toBe(true);expect(plan.history).toMatchObject({stored:2,excluded:1,retained:1,trimmed:0});expect(plan.messages[1]).toEqual({role:'user',content:summaryPrompt(current.memory!.versions[0].text)});expect(JSON.stringify(plan.messages)).toContain('excerpt');expect(JSON.stringify(plan.messages)).toContain('Original message');expect(current.messages).toEqual(original)
 expect(current.chatPins).toEqual([(room.messages[0]as any).id]);expect((current.messages[0]as any).reactions).toHaveLength(1);expect((await searchRoom(current,{query:'Original',offset:0})).results).toHaveLength(1)
})

test('summary excluded history and token trimmed history are distinct; summary cannot be silently trimmed',async()=>{
 const f=fixture(),{room}=await f.create();room.messages=Array.from({length:6},(_,i)=>({...room.messages[0]as any,id:'message_'+i,content:'Message '+i}));f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(room));await save(f,room,'summary',{boundaryId:'message_1',excludeCovered:true});const current=await read(f,room)
 const plan=await resolve(current,undefined,async m=>m.length>5?100000:100);expect(plan.history).toMatchObject({excluded:2,trimmed:2,retained:2,stored:6});expect(plan.messages[1].content).toContain('CONVERSATION MEMORY');expect(current.messages).toHaveLength(6)
 await expect(resolve(current,undefined,async()=>100000)).rejects.toThrow('budget')
})

test('Manual summary placement is singleton untrusted data, omitted summaries never exclude history',async()=>{
 const f=fixture(),{room}=await f.create();await save(f,room,'summary',{excludeCovered:true});const current=await read(f,room)
 const included=await resolve(current,manual(['{{mochi_characters}}','{{mochi_summary}}','{{mochi_summary}}','{{mochi_history}}']))
 expect(included.messages.filter(m=>m.content.includes('CONVERSATION MEMORY'))).toHaveLength(1);expect(included.messages[2].role).toBe('user');expect(included.messages[2].content).toContain('{{mochi_history}}');expect(included.history.excluded).toBe(1);expect(included.warnings.join(' ')).toContain('Duplicate')
 const missing=await resolve(current,manual(['{{mochi_history}}']));expect(missing.history.retained).toBe(1);expect(missing.history.excluded).toBeUndefined();expect(missing.warnings.join(' ')).toContain('Missing mochi_summary')
 const inline=await resolve(current,manual(['Memory: {{mochi_summary}}','{{mochi_history}}']));expect(inline.memory!.included).toBe(false);expect(inline.history.retained).toBe(1);expect(inline.warnings.join(' ')).toContain('standalone')
 const disabled=expandPlacement(placement(['{{mochi_summary}}']),{},[],[]);expect(disabled.messages).toHaveLength(0);expect(disabled.warnings.join(' ')).toContain('inactive')
})

for(const fictional of [false,true])test(`preview and interactive provider count identical summary context (${fictional?'fictional':'legacy'})`,async()=>{
 const f=fixture(),{room}=await f.create(fictional);await save(f,room,'summary',{excludeCovered:true});const current=await read(f,room)
 await f.service.handle({type:'mochi:memory',action:'read',roomId:room.id,accountId:room.accountId,requestId:'read'},'alice');expect(f.events.at(-1).valid).toBe(true);expect((await read(f,room)).revision).toBe(current.revision);expect(f.calls).toHaveLength(0)
 await f.service.handle({type:'mochi:preview',roomId:room.id,accountId:room.accountId,requestId:'preview',scenario:'continue',responder:'auto'},'alice');const preview=f.events.at(-1).preview
 expect(preview.memory.included).toBe(true);expect(preview.history.excluded).toBe(1);expect(preview.budget.inputTokens).toBe(Math.ceil(JSON.stringify(preview.messages).length/4))
 await f.service.message('alice',{roomId:room.id,accountId:room.accountId,revision:current.revision,requestId:'continue',content:''});expect(f.calls).toHaveLength(1);expect(f.calls[0].messages).toEqual(preview.messages);expect((await read(f,room)).messages[0]).toEqual(room.messages[0])
})

test('context-changing memory saves cancel pending drafts while read/browse do not mutate jobs',async()=>{
 const f=fixture(),{room}=await f.create(),now=Date.now();room.runtime={version:1,enabled:false,jobs:[{id:'response_job',kind:'response',dueAt:now+60000,expiresAt:now+120000,nextAttemptAt:now+60000,revision:room.revision,responder:'alice_character',status:'generated',attempts:1,draft:{characterId:'alice_character',name:'Character',avatarUrl:'',text:'Deferred'}}]};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(room))
 await f.service.handle({type:'mochi:memory',action:'read',roomId:room.id,requestId:'read'},'alice');expect((await read(f,room)).runtime!.jobs).toEqual(room.runtime.jobs)
 await save(f,room);const current=await read(f,room);expect(current.runtime!.jobs[0].status).toBe('cancelled');expect(current.runtime!.jobs[0].draft).toBeUndefined();expect(current.messages).toEqual(room.messages)
})

for(const fictional of [false,true])test(`scheduled occurrence resolves the same memory once and survives restart/retry (${fictional?'fictional':'legacy'})`,async()=>{
 const f=fixture(),{room}=await f.create(fictional);await save(f,room,'summary',{excludeCovered:true});const current=await read(f,room),now=Date.now()
 current.runtime={version:1,enabled:true,jobs:[{id:'memory_occurrence',kind:'scheduled',createdAt:now,dueAt:now,expiresAt:now+60000,nextAttemptAt:now,status:'queued',revision:current.revision,responder:'alice_character',attempts:0}]};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(current))
 const expected=await resolveMochiContext(current,[{id:'alice_character',name:'Character'}],'alice_character',async()=>100,new AbortController().signal),restarted=new MochiService(f.host)
 await restarted.dispatchScheduled('alice',room.id,'memory_occurrence',()=>now,async()=>true,async()=>true)
 expect(f.calls).toHaveLength(1);expect(f.calls[0].messages).toEqual(expected.messages);let delivered=await read(f,room);expect(delivered.runtime!.jobs[0].status).toBe('delivered');expect(delivered.messages).toHaveLength(2);expect(delivered.memory).toEqual(current.memory)
 await new MochiService(f.host).dispatchScheduled('alice',room.id,'memory_occurrence',()=>now,async()=>true,async()=>true);expect(f.calls).toHaveLength(1);expect((await read(f,room)).messages).toEqual(delivered.messages)
})

test('browse does not cancel active generation; confirmed summary save prevents late commit',async()=>{
 const f=fixture(),{room}=await f.create();let ready!:()=>void,release!:(r:any)=>void;const started=new Promise<void>(r=>ready=r)
 f.host.generate!.quiet=async r=>{f.calls.push(r);ready();return new Promise(resolve=>release=resolve)}
 const pending=f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'active',content:''}).catch(error=>error);await started
 await f.service.handle({type:'mochi:memory',roomId:room.id,requestId:'read_active',action:'read'},'alice');expect(f.events.at(-1).type).toBe('mochi:memory');expect((await f.service.state('alice')).jobs![room.id]).toBe('active')
 await save(f,await read(f,room));release({content:JSON.stringify({speakerId:'alice_character',text:'Late response'})});expect((await pending).name).toBe('AbortError');expect((await read(f,room)).messages).toEqual(room.messages);expect(f.calls).toHaveLength(1)
})

test('real message edit/delete/reroll invalidates coverage while metadata-only reactions remain valid',async()=>{
 const f=fixture(),{room}=await f.create();await save(f,room);let current=await read(f,room)
 await f.react(current,undefined,'react_after_summary');current=await read(f,room);expect((await inspectMemory(current)).valid).toBe(true)
 await f.service.action('alice',{roomId:room.id,revision:current.revision,messageId:(room.messages[0]as any).id,requestId:'edit_real',action:'edit',content:'Edited original'});current=await read(f,room);expect((await inspectMemory(current)).valid).toBe(false)
 await save(f,current,'review',{text:'Reviewed edited original'});current=await read(f,room);expect((await inspectMemory(current)).valid).toBe(true)
 await f.service.message('alice',{roomId:room.id,revision:current.revision,requestId:'reply',content:''});current=await read(f,room);await save(f,current,'cover_reply',{boundaryId:(current.messages.at(-1)as any).id});current=await read(f,room)
 await f.service.message('alice',{roomId:room.id,revision:current.revision,requestId:'reroll_real',confirmed:true,messageId:(current.messages.at(-1)as any).id,content:''},true);current=await read(f,room);expect((await inspectMemory(current)).valid).toBe(false)
 await f.service.action('alice',{roomId:room.id,revision:current.revision,messageId:(room.messages[0]as any).id,requestId:'delete_real',action:'delete',confirmed:true});current=await read(f,room);expect((await inspectMemory(current)).valid).toBe(false);expect(current.memory!.versions).toHaveLength(3)
})

test('memory reads recheck scope/revision after asynchronous storage and never expose stale text',async()=>{
 const f=fixture(),{room}=await f.create();await save(f,room);const current=await read(f,room),original=f.host.userStorage.getJson;let reads=0
 f.host.userStorage.getJson=async(p,o)=>{const value:any=await original(p,o);if(p.endsWith(room.id+'.json')&&++reads===2){value.revision++;f.files.set(o.userId+':'+p,structuredClone(value))}return value}
 await f.service.handle({type:'mochi:memory',roomId:room.id,requestId:'stale_read',action:'read'},'alice');expect(f.events.at(-1)).toMatchObject({type:'mochi:error',requestId:'stale_read'});expect(f.events.at(-1).message).toContain('changed');expect(f.calls).toHaveLength(0)
})

test('summary editor scoped drafts, explicit confirmation, stale refresh and late responses at 320/390/900 DOM fixtures',async()=>{
 const f=fixture(),{room}=await f.create(),other=await f.create(true);let active=room;const sent:any[]=[];const dom=new JSDOM('<!doctype html><body/>'),previous=globalThis.document;globalThis.document=dom.window.document
 const panel=new MochiMemoryPanel(p=>sent.push(p),()=>active,()=>{},()=>{},()=>{}),draw=()=>{document.body.replaceChildren(panel.render(active))},click=(text:string)=>Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===text)!.click()
 try{
  for(const width of [320,390,900]){
   panel.reset(true);panel.show(active);const ticket=sent.at(-1).requestId;panel.receive({type:'mochi:memory',requestId:ticket,roomId:room.id,revision:room.revision,associationRevision:0,valid:false,reason:'No summary'});draw();document.body.style.width=width+'px';click('Create summary');draw()
   const body=document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!;body.value='Draft '+width;body.dispatchEvent(new dom.window.Event('input'));expect(panel.draft!.text).toBe('Draft '+width);expect(document.querySelector<HTMLInputElement>('[aria-label="Summarizes through message number"]')!.value).toBe('1');expect(document.querySelector<HTMLInputElement>('[aria-label="Use summary in AI context"]')!.checked).toBe(true);expect(document.querySelector<HTMLInputElement>('[aria-label="Exclude summarized messages from AI context"]')!.checked).toBe(false)
   document.querySelector('form')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));expect(sent).toHaveLength((width===320?1:width===390?2:3));expect(document.body.textContent).toContain('Confirm save summary');expect(document.activeElement!.textContent).toContain('Confirm save summary')
   panel.reset();panel.show(active);expect(panel.draft!.text).toBe('Draft '+width);panel.reset();sent.pop()
  }
  expect(MOCHI_MEMORY_STYLES).toContain('min-width:0');expect(MOCHI_MEMORY_STYLES).toContain(':focus-visible');expect(MOCHI_MEMORY_STYLES).toContain('overflow-wrap:anywhere')
  panel.show(active);const old=sent.at(-1);active=other.room;expect(panel.receive({type:'mochi:memory',requestId:old.requestId,roomId:room.id,revision:room.revision,associationRevision:0,memory:{private:'foreign'}})).toBe(true);expect(panel.memory).toBeUndefined();panel.show(active);expect(panel.draft).toBeUndefined();panel.reset(true);active=room;panel.show(active);expect(panel.draft).toBeUndefined()
 }finally{panel.reset(true);dom.window.close();globalThis.document=previous}
})

for(const width of [320,390,900])test(`${width}px memory entry preserves composer and editor focus/caret across read refresh without extra ownership`,async()=>{
 const f=fixture(),{room}=await f.create(true),dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document;const sent:any[]=[]
 let view!:MochiView;view=new MochiView(p=>sent.push(p),()=>{document.body.replaceChildren(view.render('desktop'))},()=>{},()=>({enabled:false,visible:false,previews:false}))
 const click=(label:string)=>document.querySelector<HTMLButtonElement>('[aria-label="'+label+'"]')!.click()
 try{
  view.state=await f.service.state('alice',room.accountId);view.select(room.id);document.body.style.width=width+'px';document.body.replaceChildren(view.render('desktop'))
  const composer=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;composer.value='Private synthetic unsent draft';composer.dispatchEvent(new dom.window.Event('input'))
  click('Conversation Memory');let ticket=sent.at(-1).requestId
  view.receive({type:'mochi:memory',requestId:ticket,roomId:room.id,accountId:room.accountId,revision:room.revision,associationRevision:0,valid:false,reason:'No summary'})
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Create summary')!.click();await Promise.resolve()
  let text=document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!;text.value='A synthetic recollection';text.dispatchEvent(new dom.window.Event('input'));text.focus();text.setSelectionRange(3,7)
  const panel=(view as any).memoryPanel as MochiMemoryPanel;(panel as any).request({action:'read'});ticket=sent.at(-1).requestId
  view.receive({type:'mochi:memory',requestId:ticket,roomId:room.id,accountId:room.accountId,revision:room.revision,associationRevision:0,valid:false,reason:'No summary'})
  text=document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!;expect(text.value).toBe('A synthetic recollection');expect(document.activeElement).toBe(text);expect([text.selectionStart,text.selectionEnd]).toEqual([3,7]);expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('Private synthetic unsent draft');expect(sent.every(p=>p.type==='mochi:memory')).toBe(true)
  const current=view.state!.rooms[0];current.revision++;document.body.replaceChildren(view.render('desktop'));expect(document.body.textContent).toContain('Refresh memory to recheck coverage');expect(Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Save summary version')!.disabled).toBe(true)
  view.destroy(false);expect(panel.draft).toBeUndefined()
 }finally{view.destroy(false);dom.window.close();globalThis.document=previous}
})
