import {prepareSummary,summaryInput,SUMMARY_CONTEXT_CAP} from '../src/mochi/summarization.js'
import {MochiScheduler} from '../src/mochi/scheduler.js'
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

const generate=(f:ReturnType<typeof fixture>,room:any,extra:any={})=>f.service.generateSummary('alice',{accountId:room.accountId,roomId:room.id,revision:room.revision,associationRevision:room.associationRevision||0,requestId:'summary_generate',boundaryId:room.messages[0].id,...extra})
const apply=(f:ReturnType<typeof fixture>,room:any,suggestion:any,extra:any={})=>f.service.saveMemory('alice',{accountId:room.accountId,roomId:room.id,revision:room.revision,associationRevision:room.associationRevision||0,requestId:'summary_apply',action:'save',suggestionId:suggestion.id,text:suggestion.text,boundaryId:suggestion.coverage.boundaryId,enabled:true,excludeCovered:false,confirmed:true,...extra})
const read=(f:ReturnType<typeof fixture>,r:any)=>f.service.read('alice',r.id,r.accountId)
function provider(f:ReturnType<typeof fixture>){f.host.generate!.quiet=async r=>{f.calls.push(r);return {content:JSON.stringify({summary:'Synthetic recollection {{mochi_history}}; Character claimed it was true.'})}}}

for(const fictional of [false,true])test(`exact prefix → suggestion → edit → apply once; no messages/receipts/jobs/notices contaminated (${fictional?'fictional':'legacy'})`,async()=>{
 const f=fixture(),{room}=await f.create(fictional);provider(f);await f.service.message('alice',{accountId:room.accountId,roomId:room.id,revision:room.revision,requestId:'newer',content:'NEWER_MESSAGE_SENTINEL'});const current=await read(f,room),before=structuredClone(f.files)
 f.events.length=0;const suggestion=await generate(f,current);expect(f.calls).toHaveLength(1);expect(f.calls[0].userId).toBe('alice');expect(f.calls[0].connection_id).toBe('alice_connection');expect(f.calls[0].tools).toEqual([]);expect(JSON.stringify(f.calls[0].messages)).not.toContain('NEWER_MESSAGE_SENTINEL');expect(JSON.parse(f.calls[0].messages[1].content).source).toHaveLength(1);expect(suggestion.coverage.count).toBe(1);expect(f.files).toEqual(before)
 const replay=await generate(f,current);expect(replay.id).toBe(suggestion.id);expect(f.calls).toHaveLength(1)
 const edited={...suggestion,text:'Reviewed '+suggestion.text};await apply(f,current,edited);await apply(f,current,edited);const saved=await read(f,room);expect(saved.memory!.versions).toHaveLength(1);expect(saved.memory!.versions[0].text).toBe(edited.text);expect(saved.messages).toEqual(current.messages);expect(saved.notifications).toEqual(current.notifications);expect(saved.runtime).toEqual(current.runtime);expect(saved.receipts).toEqual([...current.receipts!,'summary_apply']);expect(f.events.some(e=>e.type==='mochi:notification'||e.type==='mochi:accepted')).toBe(false)
})

test('counter accounts for full ordered source, attribution, quotes, reactions and optional verified reference',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);await f.react(room,undefined,'react');let current=await read(f,room)
 await f.service.saveMemory('alice',{roomId:room.id,revision:current.revision,associationRevision:0,requestId:'manual',action:'save',text:'Optional reference',boundaryId:(room.messages[0]as any).id,enabled:true,excludeCovered:false,confirmed:true});current=await read(f,room)
 await f.service.message('alice',{roomId:room.id,revision:current.revision,requestId:'quoted',content:'Quoted second',replyTo:(room.messages[0]as any).id});current=await read(f,room)
 const plan=await prepareSummary(f.host,current,'alice',(current.messages.at(-1)as any).id,true,new AbortController().signal),data=JSON.parse(plan.messages[1].content)
 expect(data.source.map((m:any)=>m.id)).toEqual(current.messages.map((m:any)=>m.id));expect(data.source[1].replyTo).toBe((room.messages[0]as any).id);expect(data.source[0].reactions[0].emoji).toBe('👍');expect(data.optionalUntrustedReference).toBe('Optional reference');expect(plan.budget.inputTokens).toBe(Math.ceil(JSON.stringify(plan.messages).length/4));expect(plan.budget.outputTokens).toBe(1200);expect(plan.messages[0].content).toContain('untrusted');expect(f.calls).toHaveLength(0)
 await expect(prepareSummary(f.host,current,'alice',(room.messages[0]as any).id,true,new AbortController().signal)).resolves.toBeDefined()
})

test('oversized ranges fail before paid requests/reservation, with no hidden clipping or loops',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);let reservations=0;f.service.reserveAutomatic=async()=>{reservations++;return true};f.host.tokens!.countMessages=async()=>({total_tokens:50000})
 await expect(generate(f,room)).rejects.toThrow('No messages were dropped');expect(f.calls).toHaveLength(0);expect(reservations).toBe(0);expect((await read(f,room)).messages).toEqual(room.messages)
 room.messages=Array.from({length:1001},(_,i)=>({...room.messages[0]as any,id:'m'+i}));await expect(summaryInput(room,'m1000',false)).rejects.toThrow('1000 messages')
 room.messages=[{...room.messages[0]as any,content:'x'.repeat(200001)}];await expect(summaryInput(room,'m0',false)).rejects.toThrow('no source text was truncated')
 f.host.tokens!.countMessages=async()=>({total_tokens:NaN});await expect(generate(f,await read(f,room),{requestId:'invalid_count'})).rejects.toThrow('budget')
 expect(f.calls).toHaveLength(0);expect(SUMMARY_CONTEXT_CAP).toBe(16384)
})

for(const kind of ['edit','delete','reroll','attribution','reaction','settings','saved_memory'])test(`Apply rejects changed ${kind} without recalculating an obsolete suggestion proof`,async()=>{
 const f=fixture(),{room,input}=await f.create();provider(f);const suggestion=await generate(f,room);let current=await read(f,room)
 if(kind==='edit'||kind==='reroll'||kind==='attribution'){const m:any=current.messages[0];if(kind==='edit')m.content='Changed';if(kind==='reroll')m.previousVersions=[{content:m.content,name:m.name,avatarUrl:'',savedAt:new Date().toISOString()}];if(kind==='attribution')m.name='Other attribution';current.revision++;f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(current))}
 if(kind==='delete'){await f.service.action('alice',{roomId:room.id,revision:current.revision,messageId:(current.messages[0]as any).id,requestId:'delete',action:'delete',confirmed:true});current=await read(f,room)}
 if(kind==='reaction'){await f.react(current,undefined,'react');current=await read(f,room)}
 if(kind==='settings')current=await f.service.update('alice',{...input,roomId:room.id,revision:current.revision,settings:{...current.settings,instructions:'Changed'}})
 if(kind==='saved_memory'){await f.service.saveMemory('alice',{roomId:room.id,revision:current.revision,associationRevision:0,requestId:'manual',action:'save',text:'New handwritten memory',boundaryId:(room.messages[0]as any).id,enabled:true,excludeCovered:false,confirmed:true});current=await read(f,room)}
 const before=structuredClone(f.files);await expect(apply(f,current,suggestion)).rejects.toThrow();expect(f.files).toEqual(before);expect(f.calls).toHaveLength(1)
})

test('new appended messages allow same-prefix Apply; changed boundary cannot claim greater coverage',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);const suggestion=await generate(f,room);await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'append',content:'Later text'});const current=await read(f,room)
 await expect(apply(f,current,suggestion,{boundaryId:(current.messages.at(-1)as any).id})).rejects.toThrow('coverage changed');await apply(f,current,suggestion);const saved=await read(f,room);expect(saved.memory!.versions[0].coverage!.count).toBe(1);expect(saved.messages).toHaveLength(2)
})

test('foreign real-user/account/room, revoked sources and restarted suggestions fail closed',async()=>{
 const f=fixture(),{room}=await f.create(true),other=await f.create(true);provider(f)
 await expect(generate(f,room,{accountId:other.accountId})).rejects.toThrow();await expect(f.service.generateSummary('bob',{roomId:room.id,requestId:'foreign'})).rejects.toThrow()
 const suggestion=await generate(f,room);await expect(apply(f,other.room,suggestion)).rejects.toThrow('unavailable');expect((await read(f,other.room)).memory).toBeUndefined()
 const service=new MochiService(f.host);await expect(service.saveMemory('alice',{accountId:room.accountId,roomId:room.id,revision:room.revision,associationRevision:0,requestId:'restart_apply',action:'save',suggestionId:suggestion.id,text:suggestion.text,boundaryId:suggestion.coverage.boundaryId,enabled:true,excludeCovered:false,confirmed:true})).rejects.toThrow('expired')
 f.host.characters.get=async()=>null;await expect(apply(f,room,suggestion)).rejects.toThrow('permissions');expect((await read(f,room)).memory).toBeUndefined();expect(f.calls).toHaveLength(1)
})

test('Stop and shared room ownership reject double Generate, interactive sends and scheduled dispatch',async()=>{
 const f=fixture(),{room}=await f.create();let ready!:()=>void,release!:(r:any)=>void;const started=new Promise<void>(r=>ready=r);f.host.generate!.quiet=async r=>{f.calls.push(r);ready();return new Promise(resolve=>release=resolve)}
 const pending=generate(f,room).catch(error=>error);await started
 await expect(generate(f,room)).rejects.toThrow('already');await expect(generate(f,room,{requestId:'second'})).rejects.toThrow('running');await expect(f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'chat',content:'Blocked'})).rejects.toThrow('already running')
 const now=Date.now(),current=await read(f,room);current.runtime={version:1,enabled:true,jobs:[{id:'due',kind:'scheduled',createdAt:now,dueAt:now,expiresAt:now+60000,nextAttemptAt:now,status:'queued',revision:current.revision,responder:'auto',attempts:0}]};f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(current));await f.service.dispatchScheduled('alice',room.id,'due',()=>now,async()=>true,async()=>true);expect(f.calls).toHaveLength(1)
 await f.service.cancel('alice',room.id,'summary_generate');release({content:JSON.stringify({summary:'Late result'})});expect((await pending).code).toBe('cancelled');expect((await read(f,room)).memory).toBeUndefined();expect((await read(f,room)).messages).toEqual(room.messages);await expect(generate(f,current)).rejects.toThrow('already');expect(f.calls).toHaveLength(1)
})

test('quota refusal, provider errors, malformed/empty/length outputs never retry or leak response text',async()=>{
 for(const [label,result]of [['empty',{content:''}],['malformed',{content:'PRIVATE_PROVIDER_RESPONSE_SENTINEL'}],['shape',{content:'{"text":"not a summary"}'}],['length',{content:'{"summary":"partial"}',finish_reason:'length'}],['anthropic_length',{content:'{"summary":"partial"}',finish_reason:'max_tokens'}],['provider',null]] as const){
  const f=fixture(),{room}=await f.create();let release=0;f.service.releaseAutomatic=()=>release++;f.host.generate!.quiet=async r=>{f.calls.push(r);if(label==='provider')throw Error('PRIVATE_PROVIDER_RESPONSE_SENTINEL');return result}
  const error=await generate(f,room).catch(error=>error);expect(error.message).not.toContain('PRIVATE_PROVIDER_RESPONSE_SENTINEL');expect(f.calls).toHaveLength(1);expect(release).toBe(1);await expect(generate(f,room)).rejects.toThrow('already');expect(f.calls).toHaveLength(1);expect((await read(f,room)).memory).toBeUndefined();expect((await read(f,room)).receipts).toEqual(room.receipts)
 }
 const f=fixture(),{room}=await f.create();provider(f);f.service.reserveAutomatic=async()=>false;await expect(generate(f,room)).rejects.toThrow('quota');expect(f.calls).toHaveLength(0)
})

test('source changes during counter/provider and concurrent handwritten saves cannot publish a suggestion',async()=>{
 for(const phase of ['counter','provider','manual_save']){
  const f=fixture(),{room}=await f.create();provider(f)
  const change=async()=>{const current=await read(f,room);(current.messages[0]as any).content='Changed source';current.revision++;f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',structuredClone(current))}
  if(phase==='counter')f.host.tokens!.countMessages=async()=>{await change();return{total_tokens:100}}
  if(phase==='provider')f.host.generate!.quiet=async r=>{f.calls.push(r);await change();return{content:'{"summary":"Obsolete"}'}}
  if(phase==='manual_save')f.host.generate!.quiet=async r=>{f.calls.push(r);await f.service.saveMemory('alice',{roomId:room.id,revision:room.revision,associationRevision:0,requestId:'manual',action:'save',text:'Handwritten',boundaryId:(room.messages[0]as any).id,enabled:true,excludeCovered:false,confirmed:true});return{content:'{"summary":"Late"}'}}
  await expect(generate(f,room)).rejects.toThrow();expect(f.calls).toHaveLength(phase==='counter'?0:1);const current=await read(f,room);expect(current.memory?.versions[0].text).toBe(phase==='manual_save'?'Handwritten':undefined)
 }
})

test('actual shared scheduler reservation preserves autonomy opt-out and enforces 30 room attempts/hour',async()=>{
 const f=fixture(),{room}=await f.create();provider(f)
 f.host.storage={exists:async p=>f.files.has('global:'+p),getJson:async p=>structuredClone(f.files.get('global:'+p)),setJson:async(p,d)=>{f.files.set('global:'+p,structuredClone(d))},move:async(a,b)=>{f.files.set('global:'+b,f.files.get('global:'+a));f.files.delete('global:'+a)}}
 const scheduler=new MochiScheduler(f.host,f.service,()=>1000000);scheduler.start(false)
 try{for(let i=0;i<30;i++)await generate(f,room,{requestId:'quota_'+i});await expect(generate(f,room,{requestId:'over_quota'})).rejects.toThrow('quota');expect(f.calls).toHaveLength(30);expect(await scheduler.enabled('alice')).toBe(false);expect((await read(f,room)).runtime).toBeUndefined();expect((await read(f,room)).receipts).toEqual(room.receipts)}finally{scheduler.stop()}
})

test('generated provenance is privately retained; returned DTO changes cannot forge its prefix',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);const suggestion=await generate(f,room);suggestion.coverage.digest='0'.repeat(64);const again=await generate(f,room);expect(again.coverage.digest).not.toBe(suggestion.coverage.digest);expect(f.calls).toHaveLength(1)
 await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'append',content:'Newer'});const current=await read(f,room);suggestion.coverage.boundaryId=(current.messages.at(-1)as any).id;await expect(apply(f,current,suggestion)).rejects.toThrow('coverage changed');expect((await read(f,room)).memory).toBeUndefined()
})

test('same-text reroll metadata during generation invalidates completion even when prompt text looks identical',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);f.host.generate!.quiet=async r=>{f.calls.push(r);const current=await read(f,room),m:any=current.messages[0];m.previousVersions=[{content:m.content,name:m.name,avatarUrl:'',savedAt:new Date().toISOString()}];current.revision++;f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',current);return{content:'{"summary":"Same-source suggestion"}'}}
 await expect(generate(f,room)).rejects.toThrow('prefix changed');expect((await read(f,room)).memory).toBeUndefined();expect(f.calls).toHaveLength(1)
})

for(const width of [320,390,900])test(`${width}px Generate/Preview/Edit/Apply preserves handwritten draft, composer, quote and shared owner`,async()=>{
 const f=fixture(),{room}=await f.create(true);provider(f);const dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document;const sent:any[]=[]
 let view!:MochiView;view=new MochiView(p=>sent.push(p),()=>document.body.replaceChildren(view.render('desktop')),()=>{},()=>({enabled:false,visible:false,previews:false}))
 const click=(text:string)=>Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===text)!.click()
 try{
  view.state=await f.service.state('alice',room.accountId);view.select(room.id);(view as any).replyTargets.set(JSON.stringify([room.accountId||'',room.id]),(room.messages[0]as any).id);document.body.style.width=width+'px';document.body.replaceChildren(view.render('desktop'))
  let composer=document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!;composer.value='Preserved composer';composer.dispatchEvent(new dom.window.Event('input'));click('Conversation Memory');let request=sent.at(-1)
  view.receive({type:'mochi:memory',requestId:request.requestId,accountId:room.accountId,roomId:room.id,revision:room.revision,associationRevision:0,valid:false,reason:'No memory'});click('Create summary');await Promise.resolve()
  let handwritten=document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!;handwritten.value='Keep this handwritten draft';handwritten.dispatchEvent(new dom.window.Event('input'));click('Generate summary');request=sent.at(-1)
  expect(request.type).toBe('mochi:summary_generate');expect(document.querySelector<HTMLButtonElement>('[aria-label="Stop summary"]')!.hidden).toBe(false);expect(document.querySelector<HTMLButtonElement>('[aria-label="Send"]')!.disabled).toBe(true);expect(view.state!.jobs![room.id]).toBe(request.requestId)
  f.events.length=0;await f.service.handle(request,'alice');for(const event of f.events)view.receive(event)
  expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!.value).toBe('Keep this handwritten draft');expect(document.body.textContent).toContain('Review AI suggestion — not saved');expect((await read(f,room)).memory).toBeUndefined();const suggestion=document.querySelector<HTMLTextAreaElement>('[aria-label="AI summary suggestion"]')!;suggestion.value='Reviewed suggestion';suggestion.dispatchEvent(new dom.window.Event('input'));click('Use suggestion in summary editor')
  expect(document.activeElement!.textContent).toBe('Confirm replace unsaved summary draft');expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!.value).toBe('Keep this handwritten draft');click('Confirm replace unsaved summary draft');await Promise.resolve();expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Summary text"]')!.value).toBe('Reviewed suggestion')
  document.querySelector<HTMLFormElement>('.mochi-memory-editor')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));click('Confirm save summary');const applyRequest=sent.at(-1);expect(applyRequest.type).toBe('mochi:memory');expect(applyRequest.suggestionId).toMatch(/^suggestion_/);expect(applyRequest.text).toBe('Reviewed suggestion')
  f.events.length=0;await f.service.handle(applyRequest,'alice');for(const event of f.events)view.receive(event);expect((await read(f,room)).memory!.versions).toHaveLength(1);expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!.value).toBe('Preserved composer');expect(document.querySelector('.mochi-reply-preview')).not.toBeNull();expect(f.calls).toHaveLength(1);expect(view.state!.jobs![room.id]).toBeUndefined()
 }finally{view.destroy(false);dom.window.close();globalThis.document=previous}
})

test('panel Stop/navigation/logout ignores late suggestions and never places them into a different account',async()=>{
 const f=fixture(),{room}=await f.create(),other=await f.create(true),sent:any[]=[],dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document;let active=room
 const panel=new MochiMemoryPanel(p=>sent.push(p),()=>active,()=>{},()=>{},()=>{}),suggestion:any={id:'suggestion_'+'a'.repeat(32),roomId:room.id,coverage:{boundaryId:(room.messages[0]as any).id,count:1,digest:'a'.repeat(64)},text:'Private late suggestion',associationRevision:0,createdAt:new Date().toISOString(),budget:{inputTokens:100,outputTokens:1200,contextTokens:8192,envelopeTokens:256}}
 try{
  panel.show(active);panel.receive({type:'mochi:memory',requestId:sent.at(-1).requestId,roomId:room.id,revision:room.revision,associationRevision:0,valid:false});document.body.replaceChildren(panel.render(active));document.querySelector<HTMLButtonElement>('[aria-label="Generate summary"]')!.click();const ticket=sent.at(-1).requestId;document.body.replaceChildren(panel.render(active));document.querySelector<HTMLButtonElement>('[aria-label="Stop summary"]')!.click();expect(sent.at(-1)).toMatchObject({type:'mochi:cancel',generationRequestId:ticket});panel.receive({type:'mochi:summary_suggestion',requestId:ticket,roomId:room.id,associationRevision:0,suggestion});expect(panel.suggestion).toBeUndefined()
  panel.reset(true);active=other.room;panel.show(active);panel.receive({type:'mochi:summary_suggestion',requestId:ticket,roomId:room.id,suggestion});expect(panel.suggestion).toBeUndefined();panel.reset(true);expect(panel.generating).toBe(false)
 }finally{panel.reset(true);dom.window.close();globalThis.document=previous}
})

test('existing reply ownership disables Generate without replacing its Stop ticket',async()=>{
 const f=fixture(),{room}=await f.create(),sent:any[]=[],dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document
 let view!:MochiView;view=new MochiView(p=>sent.push(p),()=>document.body.replaceChildren(view.render('desktop')),()=>{},()=>({enabled:false,visible:false,previews:false}))
 try{view.state=await f.service.state('alice');view.state.jobs={[room.id]:'ordinary_reply'};view.select(room.id);document.body.replaceChildren(view.render('desktop'));document.querySelector<HTMLButtonElement>('[aria-label="Conversation Memory"]')!.click();view.receive({type:'mochi:memory',requestId:sent.at(-1).requestId,roomId:room.id,associationRevision:0,revision:room.revision,valid:false});expect(document.querySelector<HTMLButtonElement>('[aria-label="Generate summary"]')!.disabled).toBe(true);expect(view.state.jobs![room.id]).toBe('ordinary_reply');document.querySelector<HTMLButtonElement>('[aria-label="Stop reply"]')!.click();expect(sent.at(-1)).toMatchObject({type:'mochi:cancel',generationRequestId:'ordinary_reply'})}finally{view.destroy(false);dom.window.close();globalThis.document=previous}
})

test('summary DTO/prompt omit provider credentials and token-counter metadata',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);f.host.connections!.get=async()=>({id:'alice_connection',model:'synthetic',api_key:'PRIVATE_CONNECTION_SENTINEL',metadata:{credential:'OTHER_SECRET_SENTINEL'}});f.host.tokens!.countMessages=async()=>({total_tokens:100,approximate:true,unexpected:'TOKEN_SECRET_SENTINEL'})
 const suggestion=await generate(f,room);expect(suggestion.budget.approximate).toBe(true);for(const secret of ['PRIVATE_CONNECTION_SENTINEL','OTHER_SECRET_SENTINEL','TOKEN_SECRET_SENTINEL']){expect(JSON.stringify(suggestion)).not.toContain(secret);expect(JSON.stringify(f.calls[0].messages)).not.toContain(secret)}
})

test('request replay cannot quietly substitute another requested boundary or reference option',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);await generate(f,room);await expect(generate(f,room,{boundaryId:'other_message'})).rejects.toThrow('different summary range');await expect(generate(f,room,{useCurrent:true})).rejects.toThrow('different summary range');expect(f.calls).toHaveLength(1)
})

test('backend timeout discards late provider output and releases the shared reservation without retry',async()=>{
 const f=fixture(),{room}=await f.create();let ready!:()=>void,release!:(r:any)=>void,expire!:()=>void;const started=new Promise<void>(r=>ready=r),oldSet=globalThis.setTimeout,oldClear=globalThis.clearTimeout
 globalThis.setTimeout=((callback:any,ms?:number,...args:any[])=>{if(ms===180000){expire=callback;return -99}return oldSet(callback,ms,...args)}) as any
 globalThis.clearTimeout=((timer:any)=>{if(timer!==-99)oldClear(timer)}) as any
 let released=0;f.service.releaseAutomatic=()=>released++;f.host.generate!.quiet=async r=>{f.calls.push(r);ready();return new Promise(resolve=>release=resolve)}
 try{const pending=generate(f,room).catch(error=>error);await started;expire();release({content:'{"summary":"Late after timeout"}'});expect((await pending).code).toBe('cancelled');expect(released).toBe(1);expect((await read(f,room)).memory).toBeUndefined();expect((await f.service.state('alice')).jobs![room.id]).toBeUndefined();expect(f.calls).toHaveLength(1)}finally{globalThis.setTimeout=oldSet;globalThis.clearTimeout=oldClear}
})

test('Apply atomic interruption retains original memory and retry appends exactly one version',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);const suggestion=await generate(f,room),move=f.host.userStorage.move
 f.host.userStorage.move=async()=>{throw Error('Interrupted')};await expect(apply(f,room,suggestion)).rejects.toThrow('Interrupted');expect((await read(f,room)).memory).toBeUndefined();expect((await read(f,room)).messages).toEqual(room.messages)
 f.host.userStorage.move=move;await apply(f,room,suggestion);await apply(f,room,suggestion);expect((await read(f,room)).memory!.versions).toHaveLength(1);expect(f.calls).toHaveLength(1)
})

test('ordinary memory saves/disable/clear/restore never discard an edited unsaved AI suggestion',async()=>{
 const f=fixture(),{room}=await f.create();provider(f);const suggestion=await generate(f,room),sent:any[]=[],dom=new JSDOM('<body/>'),previous=globalThis.document;globalThis.document=dom.window.document;let active=room
 const panel=new MochiMemoryPanel(p=>sent.push(p),()=>active,()=>{},p=>{active={...active,revision:p.revision,memory:p.memory}},()=>{})
 try{
  panel.show(active);panel.receive({type:'mochi:memory',requestId:sent.at(-1).requestId,roomId:room.id,associationRevision:0,revision:room.revision,valid:false});panel.suggestion={...suggestion,text:'User-edited unsaved AI suggestion'}
  for(const action of ['save','disable','clear','restore']){
   (panel as any).request({action,text:'Separate handwritten summary',enabled:true,excludeCovered:false,boundaryId:suggestion.coverage.boundaryId,versionId:active.memory?.versions[0].id,confirmed:true});const request=sent.at(-1);f.events.length=0;await f.service.handle(request,'alice');for(const event of f.events)panel.receive(event)
   expect(panel.suggestion!.text).toBe('User-edited unsaved AI suggestion');expect(panel.status).toContain('retained');document.body.replaceChildren(panel.render(active));expect(document.querySelector<HTMLTextAreaElement>('[aria-label="AI summary suggestion"]')!.value).toBe('User-edited unsaved AI suggestion')
  }
  expect(active.memory!.versions).toHaveLength(4);expect(f.calls).toHaveLength(1)
 }finally{panel.reset(true);dom.window.close();globalThis.document=previous}
})
