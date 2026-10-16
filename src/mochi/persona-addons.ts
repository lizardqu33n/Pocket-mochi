import type { MochiHost } from './service.js'

export interface PersonaAddonChoice { id:string; label:string; content:string; enabled:boolean; available:boolean; sortOrder:number; outletName?:string; global?:boolean }
export interface PersonaAddonSelection { personaId:string; enabledIds:string[] }
export interface PersonaAddonContext { description:string; outlets:Record<string,string>; signature:string }

export function validateAddonSelection(value:unknown):PersonaAddonSelection {
  const v=value as PersonaAddonSelection
  if(!v || typeof v.personaId!=='string' || !v.personaId || v.personaId.length>180 || !Array.isArray(v.enabledIds) || v.enabledIds.length>200 || v.enabledIds.some(id=>typeof id!=='string'||!id||id.length>180) || new Set(v.enabledIds).size!==v.enabledIds.length)throw Error('Invalid persona add-on selections; saved data was preserved.')
  return {personaId:v.personaId,enabledIds:[...v.enabledIds]}
}

// Reads native definitions only. Never writes native persona/global/chat state.
export async function discoverPersonaAddons(host:Pick<MochiHost,'permissions'|'global_addons'>,persona:any,user:string):Promise<PersonaAddonChoice[]> {
  if(!host.permissions.has('personas'))return []
  const metadata=persona?.metadata||{},result:PersonaAddonChoice[]=[],seen=new Set<string>()
  const append=(a:any,global=false,enabled=a?.enabled,available=true)=>{
    if(!a||typeof a.id!=='string'||!a.id||a.id.length>180||seen.has(a.id))return
    seen.add(a.id)
    const content=typeof a.content==='string'?a.content:'',outlet=a.outlet_name??a.outletName
    result.push({id:a.id,label:typeof a.label==='string'?a.label.slice(0,200):'Unnamed add-on',content:content.length<=12000?content:'',enabled:enabled===true,available:available&&typeof a.content==='string'&&content.length<=12000,sortOrder:Number.isFinite(a.sort_order)?a.sort_order:0,...(!global&&typeof outlet==='string'&&outlet.trim()?{outletName:outlet.trim().toLowerCase()}:{}),...(global?{global:true}:{})})
  }
  const local=Array.isArray(metadata.addons)?metadata.addons:[],refs=Array.isArray(metadata.attached_global_addons)?metadata.attached_global_addons:[]
  if(local.length+refs.length>200)throw Error('This persona has too many add-ons to load safely.')
  for(const a of local)append(a)
  for(const ref of refs){
    if(!ref||typeof ref.id!=='string'||seen.has(ref.id))continue
    let a:any
    try{a=await host.global_addons?.get(ref.id,user)}catch{/* Unavailable definitions are omitted from generation. */}
    append(a?.id===ref.id?a:{id:ref.id,label:'Unavailable attached add-on'},true,ref.enabled,!!a&&a.id===ref.id)
  }
  // Native order: persona-local entries first, then attached global entries.
  return result.sort((a,b)=>Number(!!a.global)-Number(!!b.global)||a.sortOrder-b.sortOrder)
}

export async function saveAddonSelection(host:MochiHost,user:string,persona:any,value:unknown):Promise<PersonaAddonSelection> {
  const selected=validateAddonSelection(value)
  if(persona.source!=='lumiverse'||selected.personaId!==persona.sourceId||!host.permissions.has('personas'))throw Error('Choose an available Lumiverse persona for these add-ons.')
  const native=await host.personas.get(persona.sourceId,user)
  if(!native||native.id!==persona.sourceId)throw Error('This persona is not available to your account.')
  const choices=await discoverPersonaAddons(host,native,user)
  // Deleted/inaccessible selections are harmless and pruned on an explicit save.
  return {personaId:selected.personaId,enabledIds:selected.enabledIds.filter(id=>choices.some(a=>a.id===id&&a.available))}
}

export function addonContext(description:string,choices:PersonaAddonChoice[],selection:PersonaAddonSelection,signature=''):PersonaAddonContext {
  const append:string[]=[],outlets=new Map<string,string>()
  for(const a of choices){
    if(!a.available||!selection.enabledIds.includes(a.id)||!a.content.trim())continue
    const content=a.content.trim()
    if(a.outletName)outlets.set(a.outletName,outlets.has(a.outletName)?outlets.get(a.outletName)+'\n\n'+content:content)
    else append.push(content)
  }
  return {description:[description,...append].filter(Boolean).join('\n'),outlets:Object.fromEntries(outlets),signature}
}

// Named persona outlets only; no global macro environment, recursive evaluation or history expansion.
export function expandPersonaOutlets(template:string,outlets:Record<string,string>):string {
  return template.replace(/\{\{\s*(?:persona_outlet|personaOutlet)::([^{}]*?)\s*\}\}/gi,(_literal,name:string)=>Object.hasOwn(outlets,name.trim().toLowerCase())?outlets[name.trim().toLowerCase()]:'')
}
