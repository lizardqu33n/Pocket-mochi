import type {MochiHost} from './service.js'
import type {MochiAccounts} from './accounts.js'
import {fictionalAccountId} from './accounts.js'
import {identifier} from './scheduling.js'

export const TOOLBAR_ACTIONS=['search','participants','notifications','settings','presets','memory','preview','notes'] as const
export type ToolbarAction=typeof TOOLBAR_ACTIONS[number]
export const TOOLBAR_LABELS:Record<ToolbarAction,string>={search:'Search conversation',participants:'Participants',notifications:'Mochi notifications',settings:'Chat Settings',presets:'Presets',memory:'Conversation Memory',preview:'Preview AI prompt',notes:'Pins & Notes'}
export interface UIPreferences {order:ToolbarAction[];hidden:ToolbarAction[];presentation:'icons'|'labels';dock:'compact'|'comfortable';interfaceScale?:number;messageScale?:number}
export interface UIPreferenceRecord {version:1;ownerId:string;accountId?:string;revision:number;preferences:UIPreferences;shared?:true}
export const defaultUIPreferences=():UIPreferences=>({order:[...TOOLBAR_ACTIONS],hidden:['presets','memory','preview','notes'],presentation:'icons',dock:'comfortable'})
export function validateUIPreferences(value:any):UIPreferences {
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['order','hidden','presentation','dock','interfaceScale','messageScale'].includes(k)))throw Error('Invalid messenger presentation preferences.')
 const valid=(items:any)=>Array.isArray(items)&&items.length<=TOOLBAR_ACTIONS.length&&new Set(items).size===items.length&&items.every(k=>TOOLBAR_ACTIONS.includes(k))
 if(!valid(value.order)||value.order.length!==TOOLBAR_ACTIONS.length||!valid(value.hidden)||!['icons','labels'].includes(value.presentation)||!['compact','comfortable'].includes(value.dock))throw Error('Invalid messenger presentation preferences.')
 for(const [key,max]of [['interfaceScale',150],['messageScale',170]] as const)if(value[key]!==undefined&&(!Number.isInteger(value[key])||value[key]<85||value[key]>max))throw Error('Invalid text scale.')
 return structuredClone(value)
}
/** New optional files use the existing authenticated userStorage API, never global storage. */
export class MochiUIPreferences {
 constructor(private host:MochiHost,private accounts:MochiAccounts){}
 async shared(userId:string):Promise<UIPreferenceRecord>{
  const user=identifier(userId),path='mochi/v1/shared-presentation.json'
  if(!await this.host.userStorage.exists(path,user))return {version:1,ownerId:user,shared:true,revision:0,preferences:sharedUIDefaults()}
  const r=await this.host.userStorage.getJson(path,{userId:user}) as UIPreferenceRecord
  if(!r||r.ownerId!==user||r.version!==1||r.shared!==true||r.accountId!==undefined||!Number.isSafeInteger(r.revision)||r.revision<1)throw Error('Shared preferences are damaged; preserved for recovery.')
  return {...r,preferences:validateUIPreferences(r.preferences)}
 }
 async layouts(userId:string){
  const bank=await this.accounts.bank(userId),layouts=[]
  for(const account of bank.accounts){const record=await this.read(userId,account.id);if(record.revision)layouts.push({name:account.displayName,record})}
  const legacy=await this.read(userId);if(legacy.revision)layouts.push({name:'Legacy layout',record:legacy})
  return layouts
 }
 async saveShared(userId:string,input:any):Promise<UIPreferenceRecord>{
  const user=identifier(userId)
  return this.accounts.guard(user,async()=>{
   const saved=await this.shared(user)
   if(input.revision!==saved.revision)throw Error('Shared presentation changed. Refresh before saving.')
   let preferences=validateUIPreferences(input.preferences)
   if(!saved.revision){
    const layouts=await this.layouts(user)
    if(layouts.length&&input.setupSource===undefined)throw Error('Choose a saved layout or new defaults explicitly.')
    if(input.setupSource!==undefined&&input.setupSource!=='defaults'){
     const source=layouts.find(l=>(l.record.accountId||'legacy')===input.setupSource)
     if(!source||source.record.revision!==input.sourceRevision)throw Error('Source layout changed. Review it again.')
     preferences=source.record.preferences
    }
   }
   const record:UIPreferenceRecord={version:1,ownerId:user,shared:true,revision:saved.revision+1,preferences},path='mochi/v1/shared-presentation.json'
   await this.host.userStorage.setJson(path+'.pending',record,{userId:user});await this.host.userStorage.move(path+'.pending',path,user)
   return record
  })
 }
 async read(userId:string,accountId?:string,includeArchived=false):Promise<UIPreferenceRecord>{
  const user=identifier(userId),account=accountId===undefined?undefined:fictionalAccountId(accountId)
  if(account)await this.accounts.get(user,account,includeArchived)
  const path=`mochi/v1/ui-preferences/${account||'legacy'}.json`
  if(!await this.host.userStorage.exists(path,user))return {version:1,ownerId:user,accountId:account,revision:0,preferences:defaultUIPreferences()}
  const record=await this.host.userStorage.getJson(path,{userId:user}) as UIPreferenceRecord
  if(!record||record.version!==1||record.ownerId!==user||record.accountId!==account||!Number.isSafeInteger(record.revision)||record.revision<1)throw Error('Saved presentation preferences are damaged; they were preserved.')
  return {...record,preferences:validateUIPreferences(record.preferences)}
 }
 async save(user:string,input:any):Promise<UIPreferenceRecord>{
  return this.accounts.guard(user,async()=>{
   const saved=await this.read(user,input.accountId),preferences=validateUIPreferences(input.preferences)
   if(input.revision!==saved.revision)throw Error('Presentation preferences changed. Refresh and review before saving.')
   const record={...saved,revision:saved.revision+1,preferences},path=`mochi/v1/ui-preferences/${saved.accountId||'legacy'}.json`
   await this.host.userStorage.setJson(path+'.pending',record,{userId:user});await this.host.userStorage.move(path+'.pending',path,user)
   return record
  })
 }
}

export const sharedUIDefaults=():UIPreferences=>({...defaultUIPreferences(),order:['presets','notes','memory','preview','settings','search','notifications','participants'],hidden:[],interfaceScale:100,messageScale:100})
