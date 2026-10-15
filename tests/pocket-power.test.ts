import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { RpContextPower } from '../src/backend/rp-context-power.js'
import { rpContextPowerButton } from '../src/frontend/components/rp-context-power.js'

const records = new Map<string, unknown>()
const key = (path: string, userId?: string) => JSON.stringify([userId, path])
const storage = {
  getJson: async (path: string, options: any) => structuredClone(records.has(key(path,options?.userId)) ? records.get(key(path,options?.userId)) : options?.fallback),
  setJson: async (path: string, value: unknown, options: any) => { records.set(key(path,options?.userId),structuredClone(value)) },
  list: async () => [],
}
let intercept: any, frontend: any
const replies: any[] = []
;(globalThis as any).spindle = {
  userStorage:storage,
  permissions:{has:(name:string)=>['interceptor','chats','characters'].includes(name),onChanged:()=>()=>{}},
  frontendCapabilities:{declare:()=>()=>{}},
  registerInterceptor:(handler:any)=>{intercept=handler;return ()=>{}},
  onFrontendMessage:(handler:any)=>{frontend=handler;return ()=>{}},
  on:()=>()=>{},sendToFrontend:(payload:any)=>replies.push(payload),
  log:{info:()=>{},warn:()=>{},error:()=>{}},
  chats:{get:async(id:string,user:string)=>id==='forbidden'||user!=='alice'?null:{id,character_id:'char-a'},getActive:async()=>({id:'rp-a',character_id:'char-a'})},
  characters:{get:async()=>({id:'char-a',name:'Alice'}),list:async()=>({data:[],total:0})},
}
await import(process.env.POCKET_POWER_BACKEND || '../src/backend.js')
const prompt = [{role:'user',content:'Keep this <pocket-commit ref="old"/> history unchanged.'}]
const context = (chatId:string,userId='alice')=>({chatId,characterId:'char-a',userId})
const configured = (chatId:string)=>records.set(key(`phones/${chatId}__char-a.json`,'alice'),{version:1,setup:{initialized:true}})

test('actual interceptor defaults unconfigured OFF, configured ON, and OFF preserves prompts and phone records',async()=>{
  records.clear();configured('rp-a')
  expect(await intercept(prompt,context('rp-new'))).toBe(prompt)
  const on=await intercept(prompt,context('rp-a'))
  expect(on.messages.some((m:any)=>m.content.includes('Current Pocket snapshot:'))).toBe(true)
  const before=structuredClone(records.get(key('phones/rp-a__char-a.json','alice')))
  await frontend({type:'lumiphone:rp_context_power',chatId:'rp-a',characterId:'char-a',enabled:false},'alice')
  expect(replies.at(-1)).toMatchObject({type:'lumiphone:rp_context_power_state',chatId:'rp-a',enabled:false})
  expect(await intercept(prompt,context('rp-a'))).toBe(prompt)
  expect(records.get(key('phones/rp-a__char-a.json','alice'))).toEqual(before)
  expect(records.has(key('phones/rp-new__char-a.json','alice'))).toBe(false)
})

test('two RPs and two real users remain isolated; saved permissions survive a new owner instance',async()=>{
  records.clear();configured('rp-a');configured('rp-b')
  const power=new RpContextPower(storage)
  await power.save('rp-a','alice',false)
  const restarted=new RpContextPower(storage)
  expect(await restarted.enabled('rp-a','alice',async()=>true)).toBe(false)
  expect(await restarted.enabled('rp-b','alice',async()=>true)).toBe(true)
  expect(await restarted.enabled('rp-a','bob',async()=>false)).toBe(false)
  expect(await intercept(prompt,context('rp-a'))).toBe(prompt)
  expect((await intercept(prompt,context('rp-b'))).messages.length).toBeGreaterThan(prompt.length)
  await frontend({type:'lumiphone:rp_context_power',chatId:'rp-a',enabled:true},'alice')
  expect((await intercept(prompt,context('rp-a'))).messages.some((m:any)=>m.content.includes('Current Pocket snapshot:'))).toBe(true)
})

test('OFF does not consume pending references/relays or mutate Mochi records',async()=>{
  records.clear();configured('rp-a')
  const phone=records.get(key('phones/rp-a__char-a.json','alice')) as any
  phone.references=[{id:'ref',status:'armed'}];phone.relays=[{id:'relay',status:'pending'}]
  records.set(key('mochi/synthetic.json','alice'),{messages:['saved'],jobs:['queued'],notifications:['unread']})
  await new RpContextPower(storage).save('rp-a','alice',false)
  const before=structuredClone([...records])
  expect(await intercept(prompt,{...context('rp-a'),generationType:'normal'})).toBe(prompt)
  expect([...records]).toEqual(before)
})

test('legacy configured data retains ON and frontend reload returns saved per-RP state',async()=>{
  records.clear()
  records.set(key('phones/rp-legacy__char-a.json','alice'),{version:1,notes:[{id:'note',title:'Existing phone',body:'Keep me'}]})
  expect((await intercept(prompt,context('rp-legacy'))).messages.some((m:any)=>m.content.includes('Current Pocket snapshot:'))).toBe(true)
  await frontend({type:'lumiphone:rp_context_power',chatId:'rp-legacy',enabled:false,userId:'bob'},'alice')
  expect(records.has(key('rp-context/rp-legacy.json','bob'))).toBe(false)
  await frontend({type:'lumiphone:get_state',chatId:'rp-legacy',characterId:'char-a'},'alice')
  expect(replies.at(-1)).toMatchObject({type:'lumiphone:state',rpContextInjection:false,state:{chatId:'rp-legacy'}})
  await frontend({type:'lumiphone:get_state',chatId:'rp-new',characterId:'char-a'},'alice')
  expect(replies.at(-1)).toMatchObject({type:'lumiphone:state',rpContextInjection:false,state:{chatId:'rp-new'}})
})

test('invalid scope, inaccessible chat, malformed permission and write failure fail safely',async()=>{
  records.clear();const power=new RpContextPower(storage)
  for(const chat of ['../rp-a','_lobby','a/b',''])await expect(power.save(chat,'alice',true)).rejects.toThrow()
  await expect(power.save('rp-a',undefined,true)).rejects.toThrow()
  await expect(power.save('rp-a','alice','true')).rejects.toThrow()
  await frontend({type:'lumiphone:rp_context_power',chatId:'forbidden',enabled:true},'alice')
  expect(replies.at(-1).type).toBe('lumiphone:error')
  expect(records.size).toBe(0)
  records.set(key('rp-context/rp-a.json','alice'),{version:99,enabled:true})
  expect(await intercept(prompt,context('rp-a'))).toBe(prompt)
  await expect(power.save('rp-a','alice',false)).rejects.toThrow('unreadable')
  expect(records.get(key('rp-context/rp-a.json','alice'))).toEqual({version:99,enabled:true})
  const failed=new RpContextPower({...storage,setJson:async()=>{throw Error('disk unavailable')}})
  await expect(failed.save('rp-b','alice',true)).rejects.toThrow('disk unavailable')
  expect(records.has(key('rp-context/rp-b.json','alice'))).toBe(false)
})

test('power control exposes saved state and sends one explicit inverse permission',()=>{
  const dom=new JSDOM(),previous=globalThis.document;globalThis.document=dom.window.document
  try {
    const saved:boolean[]=[]
    const off=rpContextPowerButton(false,value=>saved.push(value))
    expect(off.getAttribute('aria-label')).toBe('RP context: Off')
    expect(off.getAttribute('aria-pressed')).toBe('false')
    expect(off.querySelector('svg')).not.toBeNull()
    off.click();off.click();expect(saved).toEqual([true])
    expect(off.getAttribute('aria-pressed')).toBe('false')
    const on=rpContextPowerButton(true,value=>saved.push(value));on.click();expect(saved).toEqual([true,false])
    const unknown=rpContextPowerButton(null,value=>saved.push(value));expect(unknown.disabled).toBe(true)
    expect(unknown.title).toContain('apps and Mochi stay available')
  } finally {globalThis.document=previous;dom.window.close()}
})
