import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {fixture} from './mochi-accounts.test.js'
import {defaultRoutine,validatePlan} from '../src/mochi/routines.js'
import {parseRoutineDraft,routinePrompt} from '../src/mochi/routine-generation.js'
import {parseResponse} from '../src/mochi/response.js'
import {parseRoutineActions,applyRoutineActions} from '../src/mochi/routine-actions.js'
import {RoutineDraftControls} from '../src/mochi/routine-draft-controls.js'
import {activityFor,statusFor,defaultPresence} from '../src/mochi/presence.js'
import {generateMochiReply} from '../src/mochi/generation.js'
import {previewContext} from '../src/mochi/preview.js'
import {MochiView} from '../src/mochi/view.js'
const compact=(extra:any={})=>JSON.stringify({v:1,tz:'UTC',b:[{i:'work',d:['mo'],t:'0900-1700',a:'Work',p:'away'}],x:{l:'short',c:'lowercase',t:'warm'},...extra})
const canonical=()=>parseRoutineDraft(compact()).plan
async function enabled(f:ReturnType<typeof fixture>,autonomy='temporary',accountId?:string){const room=await f.room(accountId);await f.service.configureRoutine('alice',{accountId,roomId:room.id,revision:room.revision,characterId:'alice_character',requestId:'enable',action:'save',plan:{...canonical(),autonomy}});return f.service.read('alice',room.id,accountId)}

test('compact schedules map sparse overnight blocks and texting style to canonical v1',()=>{
 const d=parseRoutineDraft(compact({b:[{d:['su'],t:'2200-0800',a:'Sleeping',p:'offline'}]}))
 expect(d.plan.entries).toHaveLength(1);expect(d.plan.entries[0]).toMatchObject({id:'routine_1',start:1320,end:480,days:['su'],activity:'Sleeping',presence:'offline'})
 expect(d.plan.autonomy).toBe('temporary');expect(d.texting).toEqual({length:'short',capitalization:'lowercase',tone:'warm'})
 expect(parseRoutineDraft(compact({b:[]})).plan.entries).toEqual([])
})
test('strict compact output rejects unknown fields, bad days/ranges/zones, collisions, size and privilege fields',()=>{
 for(const raw of ['```json\n'+compact()+'\n```',compact({v:2}),compact({tz:'Not/AZone'}),compact({autonomy:'autonomous'}),compact({x:{l:'huge'}}),compact({b:[{i:'__proto__',d:['mo'],t:'0900-1700',a:'Work',p:'away'}]}),compact({b:[{d:['m'],t:'0900-1700',a:'Work',p:'away'}]}),compact({b:[{d:['mo'],t:'2400-0800',a:'Work',p:'away'}]}),compact({b:[{d:['mo'],t:'0900-0900',a:'Work',p:'away'}]}),compact({b:Array.from({length:65},()=>({d:['mo'],t:'0900-1700',a:'Work',p:'away'}))}),compact()+' '.repeat(20000)])expect(()=>parseRoutineDraft(raw)).toThrow()
 const p=canonical();p.entries[0].locked=true;expect(()=>parseRoutineDraft(compact({b:[]}),p)).toThrow('locked')
})
test('source prompt includes only approved Mochi history, bounded description/personality and strict output contract',()=>{
 const without=routinePrompt({name:'Sam',description:'DESC',personality:'PERSONALITY'},'UTC','Short work week')
 expect(JSON.stringify(without)).toContain('PERSONALITY');expect(JSON.stringify(without)).not.toContain('approvedMochiHistory')
 expect(JSON.stringify(routinePrompt({name:'Sam'},'UTC','',undefined,[{text:'APPROVED'}]))).toContain('APPROVED')
 expect(()=>routinePrompt({},'UTC','x'.repeat(2001))).toThrow()
})
for(const fictional of [false,true])test(`generation is read-only until reviewed apply; edits and texting undo are atomic (${fictional})`,async()=>{
 const f=fixture();try{
 const accountId=fictional?(await f.profile()).id:undefined,r=await f.room(accountId),path='alice:mochi/v1/rooms/'+r.id+'.json',before=structuredClone(f.files.get(path))
 f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:compact()}}
 const input={accountId,roomId:r.id,characterId:'alice_character',revision:r.revision,requestId:'generate',timezone:'UTC',guidance:'Sparse routine'}
 const suggestion=await f.service.generateRoutine('alice',input)
 expect(f.files.get(path)).toEqual(before);expect(f.calls).toHaveLength(1)
 expect(JSON.stringify(f.calls[0].messages)).not.toContain('approvedMochiHistory')
 await expect(f.service.generateRoutine('alice',input)).rejects.toThrow('new request ID')
 const draft=structuredClone(suggestion.draft);draft.plan.entries[0].activity='Edited work'
 const apply={...input,requestId:'apply',draftId:suggestion.draftId,confirmed:true,...draft}
 await expect(f.service.applyRoutineDraft('bob',apply)).rejects.toThrow()
 if(fictional)await expect(f.service.applyRoutineDraft('alice',{...apply,accountId:undefined})).rejects.toThrow()
 await f.service.applyRoutineDraft('alice',apply);await f.service.applyRoutineDraft('alice',apply)
 const saved=await f.service.read('alice',r.id,accountId);expect(saved.runtime!.routines!.alice_character.plan!.entries[0].activity).toBe('Edited work');expect(saved.settings!.textingStyles!.alice_character.length).toBe('short')
 await f.service.configureRoutine('alice',{...input,requestId:'undo',revision:saved.revision,action:'undo',changeId:'apply'})
 const undone=await f.service.read('alice',r.id,accountId);expect(undone.runtime!.routines!.alice_character.plan).toBeUndefined();expect(undone.settings!.textingStyles?.alice_character).toBeUndefined()
 }finally{f.scheduler.stop()}
})
test('history requires explicit approval; reject, stale drafts and restarts cannot silently apply',async()=>{
 const f=fixture();try{const r=await f.room(),input={roomId:r.id,characterId:'alice_character',revision:r.revision,requestId:'parse',raw:compact()}
 await expect(f.service.generateRoutine('alice',{...input,includeHistory:true},true)).rejects.toThrow('approve')
 const draft=await f.service.generateRoutine('alice',{...input,requestId:'valid'},true);expect(f.calls).toHaveLength(0)
 await f.service.rejectRoutineDraft('alice',{...input,attemptId:'valid',draftId:draft.draftId})
 await expect(f.service.applyRoutineDraft('alice',{...input,requestId:'apply',draftId:draft.draftId,confirmed:true,...draft.draft})).rejects.toThrow('unavailable')
 const another=await f.service.generateRoutine('alice',{...input,requestId:'another'},true);f.restart()
 await expect(f.service.applyRoutineDraft('alice',{...input,requestId:'apply2',draftId:another.draftId,confirmed:true,...another.draft})).rejects.toThrow('unavailable')
 }finally{f.scheduler.stop()}
})
test('cancellation rejects a late provider even when the synthetic provider ignores abort',async()=>{
 const f=fixture();try{const r=await f.room();let release!:(v:any)=>void,started!:()=>void;const ready=new Promise<void>(resolve=>started=resolve)
 f.host.generate!.quiet=async input=>{f.calls.push(input);started();return new Promise(resolve=>release=resolve)}
 const pending=f.service.generateRoutine('alice',{roomId:r.id,characterId:'alice_character',revision:r.revision,requestId:'cancelme',timezone:'UTC',guidance:''})
 await ready;await f.service.cancel('alice',r.id,'cancelme');release({content:compact()});await expect(pending).rejects.toThrow()
 expect((await f.service.read('alice',r.id)).runtime?.routines).toBeUndefined();expect(f.calls).toHaveLength(1)
 }finally{f.scheduler.stop()}
})
test('compact reply actions are gated and the whole response validates before delivery',()=>{
 const context={speaker:'c',eligibleIds:['c'],natural:false,routineActions:true}
 expect(parseResponse('{"speakerId":"c","text":"Legacy message","s":"inert metadata"}',false,context)[0].routineActions).toBeUndefined()
 expect(parseResponse('{"m":"off early","s":{"a":"Driving home early","p":"away","for":45}}',false,context)[0]).toMatchObject({speakerId:'c',text:'off early',routineActions:{override:{for:45}}})
 for(const raw of ['{"m":"hello","s":{"a":"Drive","p":"online","for":999}}','{"speakerId":"other","m":"hello"}','{"m":"hello","actions":[]}'])expect(()=>parseResponse(raw,false,context)).toThrow()
 expect(()=>parseResponse('{"m":"off early"}',false,{...context,routineActions:false})).toThrow()
 expect(()=>parseResponse('{"m":"off early"}',false,{...context,speaker:'auto',eligibleIds:['c','d']})).toThrow()
})
test('accepted compact replies atomically set temporary activity once and expire after restart',async()=>{
 const f=fixture();try{const r=await enabled(f);f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:'{"m":"nah, off early, driving home","s":{"a":"Driving home early","p":"away","for":45}}'}}
 const input={roomId:r.id,revision:r.revision,requestId:'reply',content:'How is work?'};await f.service.message('alice',input);await f.service.message('alice',input)
 const saved=await f.service.read('alice',r.id);expect(saved.messages).toHaveLength(2);expect(f.calls).toHaveLength(1);expect(activityFor(saved,'alice_character',f.now)).toBe('Driving home early');expect(statusFor(saved,'alice_character',f.now)).toBe('away')
 f.restart();f.advance(45*60000);expect(activityFor(await f.service.read('alice',r.id),'alice_character',f.now)).toBe('Free time / hobbies')
 }finally{f.scheduler.stop()}
})
test('permanent edits stay pending in review mode; approval and undo preserve stable IDs',async()=>{
 const f=fixture();try{const r=await enabled(f,'review');f.host.generate!.quiet=async()=>({content:'{"m":"my work routine might change","e":{"i":"work","d":["mo"],"t":"0900-1600","a":"Short work day","p":"away"}}'})
 await f.service.message('alice',{roomId:r.id,revision:r.revision,requestId:'proposal',content:'Any routine changes?'})
 let saved=await f.service.read('alice',r.id),state=saved.runtime!.routines!.alice_character
 expect(state.plan!.entries[0].end).toBe(1020);expect(state.proposals).toHaveLength(1)
 await f.service.configureRoutine('alice',{roomId:r.id,characterId:'alice_character',revision:saved.revision,requestId:'approve',action:'approve',proposalId:state.proposals[0].id})
 saved=await f.service.read('alice',r.id);expect(saved.runtime!.routines!.alice_character.plan!.entries[0]).toMatchObject({id:'work',end:960})
 await f.service.configureRoutine('alice',{roomId:r.id,characterId:'alice_character',revision:saved.revision,requestId:'undo',action:'undo',changeId:'approve'})
 expect((await f.service.read('alice',r.id)).runtime!.routines!.alice_character.plan!.entries[0].end).toBe(1020)
 }finally{f.scheduler.stop()}
})
test('autonomous edits are bounded and cannot bypass locks, manual DND, quiet hours or stale source plans',()=>{
 const p={...canonical(),autonomy:'autonomous' as const},r:any={characterIds:['c'],runtime:{version:1,enabled:false,jobs:[],routines:{c:{plan:p,history:[],proposals:[]}}}}
 const actions=()=>parseRoutineActions({a:'Travel',p:'online',for:45},{i:'work',d:['mo'],t:'0900-1600',a:'Short work day',p:'away'},r.runtime.routines.c.plan)
 const now=1000000
 r.runtime.presence={c:{...defaultPresence(),manual:'dnd'}};applyRoutineActions(r,'c',actions(),'locked',now);expect(r.runtime.routines.c.history).toHaveLength(0)
 r.runtime.presence.c.manual=null;p.locked=true;applyRoutineActions(r,'c',actions(),'planlock',now);expect(r.runtime.routines.c.history).toHaveLength(0)
 p.locked=false;p.quiet=[{days:['th'],start:0,end:60}];applyRoutineActions(r,'c',actions(),'quiet',now);expect(r.runtime.routines.c.history).toHaveLength(0);p.quiet=[];const stale=actions();p.fallback.activity='New fallback';applyRoutineActions(r,'c',stale,'stale',now);expect(r.runtime.routines.c.history).toHaveLength(0)
 for(let i=0;i<6;i++)applyRoutineActions(r,'c',actions(),'message'+i,now+i)
 expect(r.runtime.routines.c.history.length).toBe(6);expect(r.runtime.routines.c.proposals.length).toBe(1)
 const current=r.runtime.routines.c.plan,original=structuredClone(current);current.entries[0].locked=true;const a=actions();a!.edit!.activity='Forbidden';applyRoutineActions(r,'c',a,'entrylock',now+100);expect(r.runtime.routines.c.plan.entries[0].activity).toBe(original.entries[0].activity)
})
for(const width of [320,390,900])test(width+'px draft controls expose preview/edit/reject/apply and keyboard labels without automatic requests',()=>{
 const dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 try{const panel=new RoutineDraftControls(()=>{}),sent:any[]=[],r:any={id:'room_'+'1'.repeat(32),revision:1,characterIds:['c']},root=panel.render(r,'c','Sam',(type,p)=>sent.push({type,...p}))
 dom.window.innerWidth=width;document.body.append(root);expect(root.querySelector('[aria-label="Approve including the last 20 messages from this Mochi chat in this generation for Sam"]')).not.toBeNull();expect(sent).toHaveLength(0)
 const input=root.querySelector<HTMLTextAreaElement>('[aria-label="Compact schedule JSON for Sam"]')!;input.focus();expect(document.activeElement).toBe(input);input.value=compact();input.dispatchEvent(new dom.window.Event('input'))
 Array.from(root.querySelectorAll('button')).find(b=>b.textContent==='Preview edited schedule for Sam')!.click();expect(sent[0].type).toBe('mochi:routine_parse');expect(sent.some(p=>p.type==='mochi:routine_apply')).toBe(false)
 }finally{globalThis.document=previous;dom.window.close()}
})
test('routine action prompt preview matches actual generation, including the resolved activity clock',async()=>{
 const f=fixture();try{const r=await enabled(f);f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:'Ordinary reply'}}
 await generateMochiReply(f.host,r,'alice','auto',new AbortController().signal,r.characterIds,false,f.now)
 const preview=await previewContext(f.host,r,'alice',{scenario:'continue'},false,new AbortController().signal,f.now)
 expect(preview.preview.messages).toEqual(f.calls[0].messages);expect(JSON.stringify(f.calls[0].messages)).toContain('OPT-IN ROUTINE ACTIONS')
 }finally{f.scheduler.stop()}
})
test('an immediate reply and its activity action both remain uncommitted when atomic replacement fails',async()=>{
 const f=fixture();try{const r=await enabled(f),path='alice:mochi/v1/rooms/'+r.id+'.json'
 f.host.generate!.quiet=async input=>{f.calls.push(input);f.fail(path);return {content:'{"m":"driving","s":{"a":"Driving home early","p":"away","for":45}}'}}
 await expect(f.service.message('alice',{roomId:r.id,revision:r.revision,requestId:'failedcommit',content:'Work done?'})).rejects.toThrow()
 f.fail();f.restart();const saved=await f.service.read('alice',r.id);expect(saved.messages).toHaveLength(1);expect(saved.runtime!.routines!.alice_character.override).toBeUndefined();expect(f.calls).toHaveLength(1)
 }finally{f.scheduler.stop()}
})
test('durable generated reply actions survive delivery failure and restart without another provider call',async()=>{
 const f=fixture();try{let r=await enabled(f);const plan=structuredClone(r.runtime!.routines!.alice_character.plan!);plan.fallback.presence='away'
 await f.service.configureRoutine('alice',{roomId:r.id,characterId:'alice_character',revision:r.revision,requestId:'away',action:'save',plan});r=await f.service.read('alice',r.id)
 f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:'{"m":"driving","s":{"a":"Driving home early","p":"away","for":45}}'}}
 await f.service.message('alice',{roomId:r.id,revision:r.revision,requestId:'delayed',content:'Work done?'})
 const move=f.host.userStorage.move;let failOnce=true
 f.host.userStorage.move=async(a,b,u)=>{const pending=f.files.get(u+':'+a);if(failOnce&&b.endsWith(r.id+'.json')&&pending?.runtime?.jobs.some((j:any)=>j.status==='delivered')){failOnce=false;throw Error('Rename disk failure')}return move(a,b,u)}
 f.advance(300000);await f.scheduler.tick();let saved=await f.service.read('alice',r.id);expect(saved.messages).toHaveLength(1);expect(saved.runtime!.routines!.alice_character.override).toBeUndefined();expect(f.calls).toHaveLength(1)
 f.restart();f.advance(60000);await f.scheduler.tick();saved=await f.service.read('alice',r.id);expect(saved.messages).toHaveLength(2);expect(saved.runtime!.routines!.alice_character.override!.startedAt).toBe(f.now);expect(f.calls).toHaveLength(1)
 f.restart();await f.scheduler.tick();expect((await f.service.read('alice',r.id)).messages).toHaveLength(2)
 }finally{f.scheduler.stop()}
})
test('approved history includes only this Mochi chat and stale/source-revoked previews cannot apply',async()=>{
 const f=fixture();try{let r=await f.room();r=await f.service.update('alice',{roomId:r.id,revision:r.revision,title:r.title,characterIds:r.characterIds,settings:{...r.settings,autoReply:false}})
 await f.service.message('alice',{roomId:r.id,revision:r.revision,requestId:'seed',content:'EXPLICIT_MOCHI_HISTORY'});r=await f.service.read('alice',r.id)
 f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:compact()}}
 const input={roomId:r.id,characterId:'alice_character',revision:r.revision,requestId:'approved',timezone:'UTC',guidance:'',includeHistory:true,historyConfirmed:true}
 const draft=await f.service.generateRoutine('alice',input);expect(JSON.stringify(f.calls[0].messages)).toContain('EXPLICIT_MOCHI_HISTORY')
 f.revoke();await expect(f.service.applyRoutineDraft('alice',{...input,requestId:'applyrevoked',draftId:draft.draftId,confirmed:true,...draft.draft})).rejects.toThrow()
 expect((await f.service.read('alice',r.id)).runtime?.routines).toBeUndefined()
 }finally{f.scheduler.stop()}
})
test('production view routes Generate, receives an editable preview and applies only on explicit review',async()=>{
 const f=fixture(),dom=new JSDOM('<body>'),previous=globalThis.document;globalThis.document=dom.window.document
 let view:MochiView;const sent:any[]=[]
 try{const r=await f.room();f.host.generate!.quiet=async input=>{f.calls.push(input);return {content:compact()}}
 view=new MochiView(p=>sent.push(p),()=>document.body.replaceChildren(view.render()),()=>{});view.state=await f.service.state('alice');view.select(r.id);view.editing=true;document.body.replaceChildren(view.render())
 const click=(label:string)=>Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===label)!.click()
 click('Generate schedule for Sam');const request=sent.at(-1);expect(request.type).toBe('mochi:routine_generate');await f.service.handle(request,'alice')
 const result=f.events.find(e=>e.payload.type==='mochi:routine_draft')!.payload;view.receive(result)
 expect((await f.service.read('alice',r.id)).runtime?.routines).toBeUndefined()
 const activity=document.querySelector<HTMLInputElement>('[aria-label="Activity work for draft Sam"]')!;activity.value='Owner edited work';activity.dispatchEvent(new dom.window.Event('input'))
 click('Apply reviewed schedule and texting style for Sam');expect(sent.at(-1).type).toBe('mochi:routine_apply');await f.service.handle(sent.at(-1),'alice')
 expect((await f.service.read('alice',r.id)).runtime!.routines!.alice_character.plan!.entries[0].activity).toBe('Owner edited work');expect(f.calls).toHaveLength(1)
 }finally{view!?.destroy();globalThis.document=previous;dom.window.close();f.scheduler.stop()}
})
