import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {resolveMochiContext} from '../src/mochi/context.js'
import {generateMochiReply} from '../src/mochi/generation.js'
import {contextCases,syntheticCount} from './fixtures/mochi-context-cases.js'
import golden from './fixtures/mochi-context-golden.json'
import {MochiPreview} from '../src/mochi/preview-panel.js'

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

for(const fixture of contextCases())test(`golden ${fixture.name}: exact provider-message bytes/count sequence and parameters preserved`,async()=>{
 const baseline=golden.goldens.find(g=>g.name===fixture.name)!,counts:number[]=[],before=structuredClone(fixture.room)
 const plan=await resolveMochiContext(fixture.room,fixture.characters,fixture.responder,async m=>{const n=syntheticCount(m);counts.push(n);return n},new AbortController().signal,fixture.natural)
 expect(JSON.stringify(plan.messages)).toBe(JSON.stringify(baseline.messages));expect(counts).toEqual(baseline.counts);expect(plan.budget.inputTokens).toBe(counts.at(-1)!);expect(plan.budget.envelopeTokens).toBe(256);expect(plan.budget.outputTokens).toBe(fixture.room.settings!.outputTokens);expect(fixture.room).toEqual(before)
 expect(await buildMochiPrompt(fixture.room,fixture.characters,fixture.responder,async m=>syntheticCount(m),new AbortController().signal,fixture.natural)).toEqual(baseline.messages)
 const calls:any[]=[],host:any={permissions:{has:()=>true},connections:{get:async()=>({model:'synthetic-model'})},characters:{get:async(id:string)=>fixture.characters.find(c=>c.id===id)},tokens:{countMessages:async m=>({total_tokens:syntheticCount(m)})},generate:{quiet:async r=>{calls.push(r);return{content:JSON.stringify({speakerId:fixture.characters[0].id,text:'Synthetic response'})}}}}
 await generateMochiReply(host,fixture.room,'synthetic_user',fixture.responder,new AbortController().signal,fixture.room.characterIds,fixture.natural)
 expect(calls).toHaveLength(1);expect(calls[0].messages).toEqual(baseline.messages);expect(calls[0].parameters).toEqual({max_tokens:fixture.room.settings!.outputTokens,temperature:0.8,model:'synthetic-model'});expect(calls[0].reasoning).toEqual({source:'off'})
 if(fixture.name==='trimmed'){expect(plan.history.trimmed).toBeGreaterThan(0);expect(plan.history.lastId).toBe('m29')}
})

test('durable scheduled dispatch still sends the exact pre-extraction golden prompt',async()=>{
 const f=fixture(),entry=contextCases().find(c=>c.name==='scheduled')!,room=entry.room,now=Date.now()
 room.runtime={version:1,enabled:true,jobs:[{id:'golden_scheduled',kind:'scheduled',createdAt:now,dueAt:now,expiresAt:now+60000,nextAttemptAt:now,status:'queued',revision:room.revision,responder:'first',attempts:0}]}
 f.files.set('alice:mochi/v1/rooms/'+room.id+'.json',room);f.host.characters.get=async id=>entry.characters.find(c=>c.id===id);f.host.tokens!.countMessages=async m=>({total_tokens:syntheticCount(m)});f.host.connections!.get=async()=>({model:'synthetic-model'})
 f.host.generate!.quiet=async r=>{f.calls.push(r);return{content:JSON.stringify({speakerId:'first',text:'Scheduled synthetic response'})}}
 await f.service.dispatchScheduled('alice',room.id,'golden_scheduled',()=>now,async()=>true,async()=>true)
 expect(f.calls).toHaveLength(1);expect(f.calls[0].messages).toEqual(golden.goldens.find(g=>g.name==='scheduled')!.messages);expect((await f.service.read('alice',room.id)).runtime!.jobs[0].status).toBe('delivered')
})

const preview=(f:ReturnType<typeof fixture>,room:any,values:any={})=>f.service.handle({type:'mochi:preview',requestId:'preview',roomId:room.id,accountId:room.accountId,scenario:'continue',responder:'auto',...values},'alice')
for(const fictional of [false,true])test(`authorized ${fictional?'fictional':'legacy'} preview is read-only, source-scoped and secret-free`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),before=structuredClone(f.files);f.events.length=0
 f.host.connections!.get=async()=>({model:'synthetic',api_key:'SYNTHETIC_SECRET_SENTINEL',authenticationToken:'SYNTHETIC_TOKEN_SENTINEL',parameters:{credential:'DO_NOT_RETURN'}})
 f.host.tokens!.countMessages=async m=>({total_tokens:syntheticCount(m),model:'synthetic',approximate:true,tokenizer_name:'Synthetic fallback',unexpectedSecret:'TOKENIZER_SECRET_SENTINEL'})
 await preview(f,room);const response=f.events.at(-1);expect(response.type).toBe('mochi:preview');expect(response.accountId).toBe(room.accountId);expect(response.preview.tokenization.approximate).toBe(true);expect(response.preview.budget.inputTokens).toBe(syntheticCount(response.preview.messages));expect(response.preview.assumptions.join(' ')).toContain('preset parameters')
 for(const secret of ['SYNTHETIC_SECRET_SENTINEL','SYNTHETIC_TOKEN_SENTINEL','TOKENIZER_SECRET_SENTINEL','DO_NOT_RETURN'])expect(JSON.stringify(response)).not.toContain(secret)
 expect(f.files).toEqual(before);expect(f.calls).toHaveLength(0);expect(f.events.some(e=>['mochi:accepted','mochi:notification','mochi:scheduling_updated'].includes(e.type))).toBe(false)
})

test('foreign scopes, revoked sources, invalid modes and unavailable token counter fail closed',async()=>{
 const f=fixture(),{room}=await f.create(true),other=await f.create(true)
 await preview(f,room,{accountId:other.accountId});expect(f.events.at(-1).type).toBe('mochi:error')
 await f.service.handle({type:'mochi:preview',requestId:'bob',roomId:room.id,accountId:room.accountId,scenario:'continue'},'bob');expect(f.events.at(-1).type).toBe('mochi:error')
 for(const values of [{responder:'foreign'},{scenario:'narrator'},{roomId:'../foreign'}]){await preview(f,room,values);expect(f.events.at(-1).type).toBe('mochi:error')}
 f.host.characters.get=async()=>null;await preview(f,room);expect(f.events.at(-1).type).toBe('mochi:error');expect(JSON.stringify(f.events.at(-1))).not.toContain('Original message')
 f.host.tokens=undefined;await preview(f,room);expect(f.events.at(-1).message).toContain('token counter');expect(f.calls).toHaveLength(0)
})

test('preview rechecks room/source revisions after counting; no stale prompt is exposed',async()=>{
 const f=fixture(),{room}=await f.create(),path='alice:mochi/v1/rooms/'+room.id+'.json'
 f.host.tokens!.countMessages=async m=>{const current=f.files.get('alice:'+path.slice(6))as any;f.files.set('alice:'+path.slice(6),{...current,revision:current.revision+1});return{total_tokens:syntheticCount(m)}}
 await preview(f,room);expect(f.events.at(-1).type).toBe('mochi:error');expect(f.events.at(-1).preview).toBeUndefined()
 const current=await f.service.read('alice',room.id);let changed=false;f.host.tokens!.countMessages=async m=>{changed=true;return{total_tokens:syntheticCount(m)}};f.host.characters.get=async id=>({id,name:changed?'Changed card':'Original card'})
 await preview(f,current);expect(f.events.at(-1).type).toBe('mochi:error');expect(f.calls).toHaveLength(0)
})

test('Continue versus Natural automatic preview uses actual mode/behavior gates without scheduling',async()=>{
 const f=fixture(),{room}=await f.create();const saved=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings!,autoReply:true,responseMode:'natural'}})
 await preview(f,saved,{scenario:'continue'});expect(f.events.at(-1).preview.natural).toBe(false)
 await preview(f,saved,{scenario:'automatic'});expect(f.events.at(-1).preview.natural).toBe(true);expect(f.events.at(-1).preview.messages[0].content).toContain('NATURAL RESPONSE')
 expect(f.calls).toHaveLength(0)
 const manual=await f.service.update('alice',{roomId:room.id,revision:saved.revision,title:saved.title,characterIds:saved.characterIds,settings:{...saved.settings!,responseMode:'manual'}});await preview(f,manual,{scenario:'automatic'});expect(f.events.at(-1).preview.assumptions.join(' ')).toContain('hypothetical')
})

test('preview does not cancel an active provider reply or reserve quotas',async()=>{
 const f=fixture(),{room}=await f.create();let finish!:(r:any)=>void,ready!:()=>void;const started=new Promise<void>(resolve=>ready=resolve)
 f.host.generate!.quiet=async r=>{f.calls.push(r);ready();return new Promise(resolve=>finish=resolve)};let reservations=0;f.service.reserveAutomatic=async()=>{reservations++;return true}
 const running=f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'running',content:''});await started;const before=structuredClone(f.files);f.events.length=0
 await preview(f,await f.service.read('alice',room.id));expect(f.events.at(-1).type).toBe('mochi:preview');expect(f.files).toEqual(before);expect(reservations).toBe(0)
 finish({content:JSON.stringify({speakerId:'alice_character',text:'Original reply'})});await running;expect((await f.service.read('alice',room.id)).messages.at(-1)).toMatchObject({content:'Original reply'})
})

test('preview tickets reject superseded/navigation/logout/source changes',()=>{
 const sent:any[]=[],room:any={id:'room',revision:1,messages:[]};let current=room;const panel=new MochiPreview(p=>sent.push(p),()=>current,()=>{},()=>{})
 panel.show(room);const old=sent.at(-1);panel.refresh();panel.receive({...old,type:'mochi:preview',revision:1,associationRevision:0,preview:{secret:'old'}});expect(panel.data).toBeUndefined()
 const request=sent.at(-1);current={...room,id:'other'};panel.receive({...request,type:'mochi:preview',revision:1,associationRevision:0,preview:{secret:'foreign'}});expect(panel.data).toBeUndefined()
 current=room;panel.reset();panel.show(room);panel.invalidate();panel.receive({...sent.at(-1),type:'mochi:preview',revision:1,associationRevision:0,preview:{secret:'stale source'}});expect(panel.data).toBeUndefined()
 panel.show(room);panel.reset();panel.receive({...sent.at(-1),type:'mochi:preview',revision:1,associationRevision:0,preview:{secret:'logged out'}});expect(panel.open).toBe(false);expect(panel.data).toBeUndefined()
})

for(const width of [320,390,900])test(`${width}px prompt preview retains composer, uses safe text and returns keyboard focus`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width});const sent:any[]=[];let view:MochiView;view=new MochiView(p=>sent.push(p),()=>document.body.replaceChildren(view.render('desktop')),()=>{})
 try{
  const fixture=contextCases()[0],room=fixture.room;view.state={rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select(room.id);(view as any).drafts.set(room.id,'Private draft');document.body.append(view.render('desktop'));Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Preview AI prompt')!.click();expect(document.activeElement?.getAttribute('aria-label')).toBe('Preview scenario');expect(document.querySelector('[aria-label="Message"]')).not.toBeNull()
  const data:any={messages:[{role:'system',content:'<img src=x onerror=bad> literal {{mochi_summary}}'}],sections:[{id:'core',active:true,providerMessages:[0]}],budget:{inputTokens:5,outputTokens:128,envelopeTokens:256,contextTokens:2048,remainingTokens:1659},history:{stored:1,retained:1,trimmed:0,firstId:'m1',lastId:'m1'},assumptions:['No provider call'],parameters:{temperature:0.8},reasoning:{source:'off'},tokenization:{model:'synthetic',approximate:true,tokenizerName:'Synthetic'}}
  view.receive({...sent.at(-1),type:'mochi:preview',revision:1,associationRevision:0,preview:data});expect(document.querySelector('.mochi-preview-text')!.textContent).toContain('{{mochi_summary}}');expect(document.querySelector('.mochi-preview-panel img')).toBeNull();expect(document.querySelector('.mochi-preview-panel')!.textContent).toContain('approximate fallback');expect((view as any).drafts.get(room.id)).toBe('Private draft')
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Close preview')!.click();expect(document.querySelector('.mochi-preview-panel')).toBeNull();expect(document.activeElement?.getAttribute('aria-label')).toBe('Room options');expect(sent.every(p=>p.type==='mochi:preview')).toBe(true)
 }finally{view.destroy(false);dom.window.close();globalThis.document=previous}
})
