import { GENERATION_ERROR_MESSAGES } from '../src/mochi/generation-errors.js'
import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {expandPlacement,validatePlacement} from '../src/mochi/macros.js'
import {resolveMochiContext} from '../src/mochi/context.js'
import {generateMochiReply} from '../src/mochi/generation.js'
import {placementControls} from '../src/mochi/placement-controls.js'
import {MochiPresetPanel} from '../src/mochi/preset-panel.js'

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

const placement=(templates:string[])=>({version:1 as const,rows:templates.map((template,i)=>({id:'section_'+i.toString(16).padStart(32,'0'),title:'Row '+i,template}))})
test('pure macros never recurse, keep unknown host expressions literal, and resolve singleton duplicates once',()=>{
 const plan=expandPlacement(placement(['{{mochi_characters}}','{{mochi_characters}}','{{char}}','{{mochi_summary}}','{{mochi_history}}','{{mochi_history}}']),{mochi_characters:'Card {{mochi_persona}}'},[{role:'user',content:'Actual dialogue'}],[])
 expect(plan.messages).toEqual([{role:'system',content:'Card {{mochi_persona}}'},{role:'system',content:'{{char}}'},{role:'user',content:'Actual dialogue'}]);expect(plan.warnings.join(' ')).toContain('Duplicate');expect(plan.warnings.join(' ')).toContain('Unknown');expect(plan.warnings.join(' ')).toContain('Missing mochi_persona');expect(plan.warnings.join(' ')).toContain('inactive')
})
test('unsafe structure, unsupported roles, mixed history/notes and malformed syntax reject',()=>{
 for(const input of [placement(['Prefix {{mochi_history}}']),placement(['{{mochi_system_notes}} suffix']),placement(['{{mochi_persona']),{...placement(['x']),rows:[{...placement(['x']).rows[0],role:'assistant'}]},placement(Array(13).fill('x'))])expect(()=>validatePlacement(input)).toThrow()
 expect(validatePlacement(placement([])).rows).toHaveLength(0)
})

for(const fictional of [false,true])test(`manual published revisions are immutable and account-scoped (${fictional?'fictional':'legacy'})`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),manual=placement(['{{mochi_system_notes}}','{{mochi_characters}}','{{mochi_persona}}','{{mochi_history}}'])
 let bank=await f.service.presets.mutate('alice',{accountId:room.accountId,revision:0,requestId:'create',action:'create',name:'Manual',dmInstructions:'Base DM',groupInstructions:'Base group',layout:'manual-v1',placement:manual}),id=bank.presets[0].id
 await f.service.bindPreset('alice',{roomId:room.id,accountId:room.accountId,revision:room.revision,requestId:'bind',presetId:id,presetRevision:1,confirmed:true})
 const saved=await f.service.read('alice',room.id,room.accountId),before=structuredClone(bank.presets[0].revisions[0]);bank=await f.service.presets.mutate('alice',{accountId:room.accountId,revision:bank.revision,requestId:'auto',action:'publish',id,dmInstructions:'New auto',groupInstructions:'',layout:'legacy-v1'})
 expect(bank.presets[0].revisions[0]).toEqual(before);expect((await f.service.presets.resolve('alice',saved)).layout).toBe('manual-v1')
 const copy=await f.service.presets.mutate('alice',{accountId:room.accountId,revision:bank.revision,requestId:'copy',action:'duplicate',id,sourceRevision:1,name:'Copy'});expect(copy.presets[1].revisions[0].placement).toEqual(manual)
 if(fictional){const other=await f.create(true);await expect(f.service.presets.resolve('alice',{accountId:other.accountId,preset:saved.preset})).rejects.toThrow()}
})

test('manual provider/preview parity positions notes and structured history once with quotes and reactions',async()=>{
 const f=fixture(),{room}=await f.create();let saved=await f.service.read('alice',room.id)
 await f.service.pinnedContent('alice',{roomId:room.id,revision:saved.revision,requestId:'note',action:'note_save',title:'Note',body:'Placed note {{mochi_history}}',enabled:true});saved=await f.service.read('alice',room.id);await f.react(saved,undefined,'react');saved=await f.service.read('alice',room.id)
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'quote',content:'Reply',replyTo:(room.messages[0]as any).id});saved=await f.service.read('alice',room.id)
 const bank=await f.service.presets.mutate('alice',{revision:0,requestId:'create',action:'create',name:'Manual',layout:'manual-v1',placement:placement(['{{mochi_system_notes}}','{{mochi_characters}}','{{mochi_persona}}','{{mochi_history}}','{{mochi_room_instructions}}'])});await f.service.bindPreset('alice',{roomId:room.id,revision:saved.revision,requestId:'bind',presetId:bank.presets[0].id,presetRevision:1,confirmed:true});saved=await f.service.read('alice',room.id)
 await f.service.handle({type:'mochi:preview',roomId:room.id,requestId:'preview',scenario:'continue',responder:'auto'},'alice');const preview=f.events.at(-1).preview
 expect(preview.messages[1]).toMatchObject({role:'system',content:'ROOM SYSTEM NOTE ("Note"):\nPlaced note {{mochi_history}}'});expect(preview.messages.filter(m=>m.role==='user')).toHaveLength(3);expect(JSON.stringify(preview.messages)).toContain('Reply reference');expect(JSON.stringify(preview.messages)).toContain('Reactions:');expect(preview.messages[0].content).not.toContain('USER IDENTITY:');expect(preview.messages.at(-1).content).toContain('Write the next character')
 await f.service.message('alice',{roomId:room.id,revision:saved.revision,requestId:'continue',content:''});expect(f.calls[0].messages).toEqual(preview.messages);expect(f.calls).toHaveLength(1)
})

test('missing history is an explicit omission, optional fields expand empty and budgets still reject oversize context',async()=>{
 const f=fixture(),{room}=await f.create(),preset:any={id:'preset_'+'a'.repeat(32),name:'Manual',builtIn:false,revision:1,dmInstructions:'',groupInstructions:'',layout:'manual-v1',placement:placement(['{{mochi_texting_styles}}','{{mochi_summary}}'])}
 const context=await resolveMochiContext(room,[],'auto',async()=>100,new AbortController().signal,false,preset)
 expect(context.messages).toHaveLength(2);expect(context.history.retained).toBe(0);expect(context.warnings.join(' ')).toContain('Missing mochi_history');expect(room.messages).toHaveLength(1)
 await expect(resolveMochiContext(room,[],'auto',async()=>100000,new AbortController().signal,false,preset)).rejects.toThrow('budget')
})

for(const [label,content]of [['empty',''],['whitespace',' \n '],['missing',undefined],['malformed','{"text":'],['valid','{"speakerId":"alice_character","text":"Valid"}']] as const)test(`provider ${label} classification preserves accepted messages and never retries`,async()=>{
 const f=fixture(),{room}=await f.create();let calls=0;f.host.generate!.quiet=async()=>{calls++;return{content}}
 const outcome=await f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'continue',content:''}).catch(error=>error)
 if(['empty','whitespace','missing'].includes(label))expect(outcome.message).toContain('empty response')
 else if(label==='malformed')expect(outcome.message).toBe(GENERATION_ERROR_MESSAGES.malformed_json)
 else expect((await f.service.read('alice',room.id)).messages.at(-1)).toMatchObject({content:'Valid'})
 expect(calls).toBe(1);expect((await f.service.read('alice',room.id)).messages[0]).toEqual(room.messages[0])
})
test('provider transport errors remain classified and sanitized',async()=>{
 const f=fixture(),{room}=await f.create();f.host.generate!.quiet=async()=>{throw Error('Synthetic transport 503')}
 await expect(f.service.message('alice',{roomId:room.id,revision:room.revision,requestId:'continue',content:''})).rejects.toThrow(GENERATION_ERROR_MESSAGES.provider)
})
test('empty Instant reply preserves newly accepted text and receipt replay does not retry the provider',async()=>{
 const f=fixture(),{room}=await f.create();const saved=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings!,autoReply:true,responseMode:'instant'}});let calls=0;f.host.generate!.quiet=async()=>{calls++;return{content:' '}}
 const input={roomId:room.id,revision:saved.revision,requestId:'empty_send',content:'New accepted text'};await expect(f.service.message('alice',input)).rejects.toThrow('empty response');expect((await f.service.read('alice',room.id)).messages.at(-1)).toMatchObject({content:'New accepted text'});await f.service.message('alice',input);expect(calls).toBe(1)
})
test('manual history trimming counts only the composed plan and preserves older quote excerpts/storage',async()=>{
 const f=fixture(),{room}=await f.create();room.messages=Array.from({length:25},(_,i)=>({id:'m'+i,role:'user',name:'Me',content:'Long text '.repeat(50),...(i===24?{replyTo:'m0'}:{}),createdAt:'now'}));room.settings!.contextTokens=2200;room.settings!.outputTokens=128
 const original=structuredClone(room.messages),preset:any={id:'preset_'+'a'.repeat(32),name:'Manual',builtIn:false,revision:1,dmInstructions:'',groupInstructions:'',layout:'manual-v1',placement:placement(['{{mochi_characters}}','{{mochi_persona}}','{{mochi_history}}'])}
 const plan=await resolveMochiContext(room,[],'auto',async m=>Math.ceil(JSON.stringify(m).length/4),new AbortController().signal,false,preset);expect(plan.history.trimmed).toBeGreaterThan(0);expect(plan.budget.remainingTokens).toBeGreaterThanOrEqual(0);expect(JSON.stringify(plan.messages)).toContain('excerpt');expect(room.messages).toEqual(original)
})

for(const width of [320,390,900])test(`${width}px placement controls expose ordered rows, keyboard actions and recoverable automatic mode`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width});const draft:any={layout:'legacy-v1'};let redraws=0
 try{
  document.body.append(placementControls(draft,()=>redraws++));const mode=document.querySelector<HTMLSelectElement>('[aria-label="Context placement mode"]')!;mode.value='manual-v1';mode.dispatchEvent(new dom.window.Event('change'));expect(draft.placement.rows).toHaveLength(6)
  document.body.replaceChildren(placementControls(draft,()=>redraws++));expect(document.querySelectorAll('.mochi-placement-row')).toHaveLength(6);document.querySelector<HTMLButtonElement>('[aria-label="Move characters down"]')!.click();expect(draft.placement.rows[1].template).toBe('{{mochi_characters}}')
  document.body.replaceChildren(placementControls(draft,()=>redraws++));const current=document.querySelector<HTMLSelectElement>('[aria-label="Context placement mode"]')!;current.value='legacy-v1';current.dispatchEvent(new dom.window.Event('change'));expect(draft.layout).toBe('legacy-v1');expect(redraws).toBeGreaterThan(0)
 }finally{dom.window.close();globalThis.document=previous}
})

for(const width of [320,390,900])test(`${width}px preset workspace separates library, published content and manual edit draft`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width});const room:any={id:'room',revision:1,characterIds:['c'],messages:[]},sent:any[]=[],panel=new MochiPresetPanel(p=>sent.push(p),()=>room,()=>{},()=>{},()=>{})
 try{
  panel.show(room);const preset={id:'preset_'+'a'.repeat(32),name:'A long custom preset name',archived:false,revisions:[{revision:1,dmInstructions:'DM text',groupInstructions:'Group text',layout:'manual-v1',placement:placement(['{{mochi_history}}'])}]};panel.receive({...sent.at(-1),type:'mochi:presets',bank:{version:1,revision:1,presets:[preset]},effective:{...preset.revisions[0],id:preset.id,name:preset.name,builtIn:false}});document.body.append(panel.render(room))
  expect(document.querySelector('[aria-label="Preset library"]')!.tagName).toBe('DETAILS');expect(document.querySelector('.mochi-preset-edit-pane')!.textContent).toContain('Published preset');expect(document.querySelector('.mochi-preset-library-item')!.getAttribute('aria-pressed')).toBe('true')
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Edit / publish')!.click();document.body.replaceChildren(panel.render(room));expect(document.querySelector('.mochi-preset-edit-pane')!.textContent).toContain('Draft ·');expect(document.body.textContent).toContain('Original published content');expect(panel.draft!.layout).toBe('manual-v1');Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Create block draft from this revision')!.click();document.body.replaceChildren(panel.render(room));expect(panel.draft!.layout).toBe('blocks-v1');expect(JSON.stringify(panel.draft!.blocks)).toContain('{{mochi_history}}');expect(preset.revisions[0].layout).toBe('manual-v1');expect(sent).toHaveLength(1)
 }finally{panel.reset(true);dom.window.close();globalThis.document=previous}
})
