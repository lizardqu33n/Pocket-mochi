import {test,expect} from 'bun:test'
import {JSDOM} from 'jsdom'
import {MochiService,type MochiHost} from '../src/mochi/service.js'
import {defaultMochiSettings} from '../src/mochi/types.js'
import {buildMochiPrompt} from '../src/mochi/generation.js'
import {MochiView} from '../src/mochi/view.js'
import {searchRoom} from '../src/mochi/search.js'
import {MochiSearch} from '../src/mochi/search-panel.js'

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

const query=(f:ReturnType<typeof fixture>,room:any,values:any={})=>f.service.handle({type:'mochi:search',roomId:room.id,accountId:room.accountId,requestId:'search',query:'needle',...values},'alice')
for(const fictional of [false,true])test(`full saved ${fictional?'fictional':'legacy'} history search is read-only and page bounded`,async()=>{
 const f=fixture(),{room}=await f.create(fictional),path='alice:mochi/v1/rooms/'+room.id+'.json'
 room.messages=Array.from({length:650},(_,i)=>({id:'m'+i,role:i%2?'assistant':'user',characterId:i%2?'alice_character':undefined,name:i%2?'Character':'Me',content:i%10===0?'Old NEEDLE message':'Other',createdAt:'2026-10-13T10:00:00Z'}))
 room.systemNotes=[{id:'note_'+'a'.repeat(32),title:'needle',body:'needle only note',enabled:true}];f.files.set(path,structuredClone(room));const before=structuredClone(f.files)
 await query(f,room);let event=f.events.at(-1);expect(event.type).toBe('mochi:search');expect(event.page.total).toBe(65);expect(event.page.results).toHaveLength(30);expect(event.page.results[0].id).toBe('m640');expect(event.page.nextOffset).toBe(30)
 await query(f,room,{offset:60,revision:room.revision});event=f.events.at(-1);expect(event.page.results.at(-1).id).toBe('m0');expect(event.page.results).toHaveLength(5);expect(event.page.nextOffset).toBeUndefined();expect(f.files).toEqual(before);expect(f.calls).toHaveLength(0)
})

test('literal case/emoji/Unicode matching, trimmed queries and exact stable sender filtering',async()=>{
 const room:any={messages:[{id:'u',role:'user',name:'Me',content:'[.*] Café 🎉',createdAt:'now'},{id:'a',role:'assistant',characterId:'stable',name:'Renamed',content:'CAFÉ 🎉',createdAt:'now'},{id:'b',role:'assistant',characterId:'other',name:'Renamed',content:'Other',createdAt:'now'},null,{id:'broken',role:'user',content:'Café'}]}
 expect((await searchRoom(room,{query:'  café  '})).total).toBe(2);expect((await searchRoom(room,{query:'[.*]'})).total).toBe(1);expect((await searchRoom(room,{query:'🎉',sender:'character:stable'})).results[0].id).toBe('a');expect((await searchRoom(room,{query:'CAFÉ',sender:'user'})).results[0].id).toBe('u');expect((await searchRoom(room,{query:'missing'})).total).toBe(0);expect((await searchRoom(room,{query:'   '})).total).toBe(0)
 await expect(searchRoom(room,{query:'x'.repeat(201)})).rejects.toThrow('200');await expect(searchRoom(room,{query:'x',sender:'character:../foreign'})).rejects.toThrow();await expect(searchRoom(room,{query:'x',offset:-1})).rejects.toThrow()
 room.messages.push({...room.messages[0]});expect((await searchRoom(room,{query:'[.*]'})).total).toBe(0)
})

test('wrong real-user/account/room and stale pagination cannot expose saved content',async()=>{
 const f=fixture(),{room}=await f.create(true),other=await f.create(true)
 await query(f,room,{accountId:other.accountId});expect(f.events.at(-1).type).toBe('mochi:error');expect(JSON.stringify(f.events.at(-1))).not.toContain('Original message')
 await f.service.handle({type:'mochi:search',roomId:room.id,accountId:room.accountId,query:'Original',requestId:'bob'},'bob');expect(f.events.at(-1).type).toBe('mochi:error')
 await query(f,room,{roomId:'../bad'});expect(f.events.at(-1).type).toBe('mochi:error')
 await query(f,room,{offset:1,revision:room.revision-1});expect(f.events.at(-1).type).toBe('mochi:error')
 await query(f,room,{query:'Original'});expect(f.events.at(-1).page.results[0].id).toBe((room.messages[0]as any).id)
})

test('search and target validation reject changed snapshots/deleted messages without writing',async()=>{
 const f=fixture(),{room}=await f.create(),mid=(room.messages[0]as any).id
 await query(f,room,{query:'Original'});expect(f.events.at(-1).page.total).toBe(1)
 await f.service.action('alice',{roomId:room.id,revision:room.revision,messageId:mid,requestId:'edit',action:'edit',content:'Changed'})
 await query(f,room,{query:'Original'});expect(f.events.at(-1).page.total).toBe(0)
 let saved=await f.service.read('alice',room.id);await f.service.handle({type:'mochi:search_target',roomId:room.id,revision:saved.revision,associationRevision:0,messageId:mid,requestId:'target'},'alice');expect(f.events.at(-1).room.messages[0].content).toBe('Changed');expect(f.events.at(-1).room.runtime).toBeUndefined()
 await f.service.action('alice',{roomId:room.id,revision:saved.revision,messageId:mid,requestId:'delete',action:'delete',confirmed:true})
 await f.service.handle({type:'mochi:search_target',roomId:room.id,revision:saved.revision,associationRevision:0,messageId:mid,requestId:'old_target'},'alice');expect(f.events.at(-1).type).toBe('mochi:error');expect(JSON.stringify(f.events.at(-1))).not.toContain('Changed')
 saved=await f.service.read('alice',room.id);await f.service.handle({type:'mochi:search_target',roomId:room.id,revision:saved.revision,associationRevision:0,messageId:mid,requestId:'deleted'},'alice');expect(f.events.at(-1).type).toBe('mochi:error')
})

test('search racing an edit refuses mixed/stale snapshots',async()=>{
 const f=fixture(),{room}=await f.create(),path='alice:mochi/v1/rooms/'+room.id+'.json'
 room.messages=Array.from({length:1200},(_,i)=>({id:'m'+i,role:'user',name:'Me',content:'needle',createdAt:'now'}));f.files.set(path,structuredClone(room))
 const searching=query(f,room);await new Promise(resolve=>setTimeout(resolve,1));f.files.set(path,{...room,revision:room.revision+1,messages:[]});await searching
 expect(f.events.at(-1).type).toBe('mochi:error');expect(f.events.at(-1).page).toBeUndefined()
})

test('client cancels stale room/account/query responses and errors without generation ownership',()=>{
 const sent:any[]=[],room:any={id:'r',revision:2,messages:[],accountId:'one'},other={...room,accountId:'two'};let current=room,jumps=0
 const search=new MochiSearch(p=>sent.push(p),()=>current,()=>{},()=>jumps++);search.show(room);search.query='needle';search.run();const old=sent.at(-1)
 search.query='other';search.run();expect(search.receive({...old,type:'mochi:search',page:{total:1,results:[]}})).toBe(true);expect(search.page).toBeUndefined()
 const active=sent.at(-1);current=other;search.receive({...active,type:'mochi:search',revision:2,associationRevision:0,page:{total:1,results:[]}});expect(search.page).toBeUndefined();expect(jumps).toBe(0)
 current=room;search.reset();search.show(room);search.query='needle';search.run();const request=sent.at(-1);search.receive({type:'mochi:error',requestId:request.requestId,message:'Synthetic failure'});expect(search.status).toBe('Synthetic failure')
 search.run();const late=sent.at(-1);search.reset();search.receive({...late,type:'mochi:search',revision:2,associationRevision:0,page:{total:1,results:[]}});expect(search.open).toBe(false);expect(search.page).toBeUndefined();expect(sent.every(p=>p.type==='mochi:search')).toBe(true)
})

test('search results invalidate on new messages while latest server revisions can jump safely',()=>{
 const sent:any[]=[],room:any={id:'r',revision:2,messages:[]};let jumped:any
 const search=new MochiSearch(p=>sent.push(p),()=>room,()=>{},(r,id)=>{jumped=id;Object.assign(room,r)})
 search.show(room);search.query='needle';search.run();search.receive({...sent.at(-1),type:'mochi:search',revision:3,associationRevision:0,page:{total:1,offset:0,results:[{id:'old',name:'Me',position:1,excerpt:'needle',createdAt:'now'}]}})
 expect(search.page!.total).toBe(1);search.sync(room);expect(search.page!.total).toBe(1)
 search.run(0,'old');search.receive({...sent.at(-1),type:'mochi:search_target',room:{...room,revision:3}});expect(jumped).toBe('old');expect(room.revision).toBe(3);search.sync(room);expect(search.page!.total).toBe(1)
 room.revision++;search.sync(room);expect(search.page).toBeUndefined();expect(search.status).toContain('changed');search.reset()
})

for(const width of [320,390,900])test(`${width}px accessible search retains composer/reply and jumps beyond 100 messages`,()=>{
 const dom=new JSDOM('<body></body>'),previous=globalThis.document;globalThis.document=dom.window.document;Object.defineProperty(dom.window,'innerWidth',{value:width})
 let view:MochiView;const sent:any[]=[],redraw=()=>{document.body.replaceChildren(view.render('desktop'))};view=new MochiView(p=>sent.push(p),redraw,()=>{})
 try{
  const room:any={id:'room',revision:1,title:'Long room '.repeat(12),characterIds:['c'],persona:{name:'Me'},settings:defaultMochiSettings(),messages:Array.from({length:150},(_,i)=>({id:'m'+i,role:'user',name:'Long author '.repeat(20),content:i===0?'<img src=x onerror=bad> needle':'Text',createdAt:'2026-10-13T10:00:00Z'}))}
  view.state={rooms:[room],characters:[],personas:[],connections:[],warnings:[]};view.select(room.id);(view as any).drafts.set(room.id,'Unsent draft');(view as any).replyTargets.set(JSON.stringify(['',room.id]),'m149');redraw()
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Search conversation')!.click();expect(document.querySelector('[aria-label="Message"]')).not.toBeNull();expect(document.activeElement?.getAttribute('aria-label')).toBe('Search conversation text')
  const input=document.querySelector<HTMLInputElement>('[aria-label="Search conversation text"]')!;input.value='needle';input.dispatchEvent(new dom.window.Event('input'));document.querySelector<HTMLFormElement>('.mochi-search-controls')!.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));expect(document.querySelector('[role="status"]')?.textContent).toContain('Searching')
  view.receive({...sent.at(-1),type:'mochi:search',revision:1,associationRevision:0,page:{total:1,offset:0,results:[{id:'m0',name:'Long author',excerpt:'<img src=x onerror=bad> needle',createdAt:'2026-10-13T10:00:00Z',position:1}]}})
  expect(document.querySelectorAll('.mochi-search-result')).toHaveLength(1);expect(document.querySelector('.mochi-search-result img')).toBeNull();document.querySelector<HTMLButtonElement>('.mochi-search-result')!.click()
  view.receive({...sent.at(-1),type:'mochi:search_target',room});expect((view as any).desktopHistory.get(room.id)).toBe(150);expect(document.activeElement?.getAttribute('data-message-id')).toBe('m0')
  expect((view as any).drafts.get(room.id)).toBe('Unsent draft');expect((view as any).replyTargets.get(JSON.stringify(['',room.id]))).toBe('m149')
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Close search')!.click();expect(view.roomId).toBe(room.id);expect(document.querySelector('.mochi-search-panel')).toBeNull();expect(document.activeElement?.getAttribute('aria-label')).toBe('Room options');expect(sent.every(p=>p.type.startsWith('mochi:search'))).toBe(true)
 }finally{view.destroy(false);dom.window.close();globalThis.document=previous}
})
