import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { generateMochiReply, validateMochiSources } from '../src/mochi/generation.js'
import { defaultMochiSettings } from '../src/mochi/types.js'
import { MochiView } from '../src/mochi/view.js'
import { GENERATION_ERROR_MESSAGES } from '../src/mochi/generation-errors.js'
import { prepareSummary, requestSummary } from '../src/mochi/summarization.js'

function fixture() {
  const room:any={id:'room_'+'a'.repeat(32),ownerId:'alice',revision:1,title:'Synthetic',characterIds:['alice_char'],persona:{source:'manual',name:'Synthetic persona',description:''},messages:[],settings:defaultMochiSettings()}
  const profiles:any[]=[{id:'alice_first',is_default:false,model:'synthetic-a'},{id:'alice_default',is_default:true,model:'synthetic-b'},{id:'bob_default',is_default:true,model:'synthetic-bob'}]
  const requests:any[]=[],lookups:any[]=[]
  const host:any={permissions:{has:()=>true},connections:{
    list:async(user:string)=>{lookups.push(['list',user]);return profiles.filter(c=>c.id.startsWith(user+'_'))},
    get:async(id:string,user:string)=>{lookups.push(['get',id,user]);return profiles.find(c=>c.id===id&&id.startsWith(user+'_'))||null},
  },characters:{get:async(id:string,user:string)=>id===user+'_char'?{id,name:'Synthetic character'}:null},tokens:{countMessages:async()=>({total_tokens:100})},generate:{quiet:async(input:any)=>{requests.push(input);return {content:'{"speakerId":"alice_char","text":"Synthetic reply"}'}}},userStorage:{getJson:async(_p:any,o:any)=>o.fallback}}
  const run=()=>generateMochiReply(host,room,'alice','auto',new AbortController().signal)
  return {host,room,profiles,requests,lookups,run}
}

test('fallback uses only the user-scoped marked default and follows changes without persisting an override',async()=>{
  const f=fixture(),before=JSON.stringify(f.room)
  await f.run();expect(f.requests[0].connection_id).toBe('alice_default')
  f.profiles[0].is_default=true;f.profiles[1].is_default=false
  await f.run();expect(f.requests[1].connection_id).toBe('alice_first')
  expect(JSON.stringify(f.room)).toBe(before)
  expect(f.lookups.every(x=>x.at(-1)==='alice')).toBe(true)
})

test('explicit selection wins and unavailable explicit selection never falls back',async()=>{
  const f=fixture();f.room.settings.connectionId='alice_first'
  await f.run();expect(f.requests[0].connection_id).toBe('alice_first');expect(f.lookups.some(x=>x[0]==='list')).toBe(false)
  f.room.settings.connectionId='bob_default'
  await expect(f.run()).rejects.toMatchObject({category:'connection'});expect(f.requests).toHaveLength(1)
})

test('absent, ambiguous, foreign and revoked defaults fail safely without using the first profile',async()=>{
  for(const scenario of ['absent','ambiguous','foreign','revoked','changed','missing-api']){
    const f=fixture()
    if(scenario==='absent')f.profiles[1].is_default=false
    if(scenario==='ambiguous')f.profiles[0].is_default=true
    if(scenario==='foreign')f.host.connections.list=async()=>[f.profiles[2]]
    if(scenario==='revoked')f.host.connections.get=async()=>null
    if(scenario==='changed')f.host.connections.get=async()=>({...f.profiles[1],is_default:false})
    if(scenario==='missing-api')delete f.host.connections.list
    await expect(f.run()).rejects.toMatchObject({category:'connection'});expect(f.requests).toHaveLength(0)
  }
})

test('default lookup errors are sanitized and canceled fallback does not invoke generation',async()=>{
  const f=fixture();f.host.connections.list=async()=>{throw {status:403,message:'SYNTHETIC_SECRET'}}
  await expect(f.run()).rejects.toMatchObject({category:'connection',message:GENERATION_ERROR_MESSAGES.connection})
  const g=fixture(),controller=new AbortController();controller.abort()
  await expect(generateMochiReply(g.host,g.room,'alice','auto',controller.signal)).rejects.toMatchObject({name:'AbortError'})
  expect(g.requests).toHaveLength(0)
})

test('summary dispatch uses the verified effective connection instead of the empty stored override',async()=>{
  const f=fixture();f.room.messages=[{id:'user_1',role:'user',name:'Synthetic persona',content:'Synthetic history',createdAt:'2026-10-16T00:00:00Z'}]
  const signal=new AbortController().signal
  const plan=await prepareSummary(f.host,f.room,'alice','user_1',false,signal)
  f.host.generate.quiet=async(input:any)=>{f.requests.push(input);return {content:'{"summary":"Synthetic summary"}'}}
  expect(await requestSummary(f.host,f.room,'alice',plan,signal)).toBe('Synthetic summary')
  expect(f.requests[0].connection_id).toBe('alice_default');expect(f.room.settings.connectionId).toBe('')
})

test('settings show default fallback without turning it into a saved explicit connection; connection errors offer the selector',()=>{
  const f=fixture(),dom=new JSDOM('<body><main></main></body>'),prior=globalThis.document;globalThis.document=dom.window.document
  const root=document.querySelector('main')!,sent:any[]=[]
  let view:MochiView;const render=()=>root.replaceChildren(view.render())
  view=new MochiView(p=>sent.push(p),render,()=>{})
  try{
    view.state={rooms:[f.room],characters:[{id:'alice_char',name:'Synthetic'}],personas:[],warnings:[],connections:[{id:'alice_default',name:'Default fixture',model:'synthetic-b',isDefault:true}]};view.select(f.room.id)
    view.error=GENERATION_ERROR_MESSAGES.connection;render()
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Choose connection')!.click()
    const select=root.querySelector<HTMLSelectElement>('[aria-label="Generation connection"]')!
    expect(select.value).toBe('');expect(select.selectedOptions[0].textContent).toContain('Use Lumiverse default · Default fixture')
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Save settings')!.click()
    expect(sent.find(p=>p.type==='mochi:update').settings.connectionId).toBe('')
  }finally{view.destroy();globalThis.document=prior;dom.window.close()}
})
