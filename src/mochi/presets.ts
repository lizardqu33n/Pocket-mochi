import type {MochiHost} from './service.js'
import type {MochiRoom} from './types.js'
import {fictionalAccountId} from './accounts.js'
import {identifier} from './scheduling.js'
import {validatePlacement,type Placement} from './macros.js'
export const DEFAULT_PRESET_ID='mochi_default'
export interface PresetRevision {revision:number;dmInstructions:string;groupInstructions:string;layout:'legacy-v1'|'manual-v1';placement?:Placement}
export interface MochiPreset {id:string;name:string;archived:boolean;revisions:PresetRevision[]}
export interface PresetBinding {id:string;revision:number;accountId?:string}
export interface ResolvedPreset extends PresetRevision {id:string;name:string;builtIn:boolean}
export interface PresetBank {version:1;ownerId:string;accountId?:string;revision:number;presets:MochiPreset[];receipts:string[]}
export const defaultPreset=():ResolvedPreset=>({id:DEFAULT_PRESET_ID,name:'Mochi Default',builtIn:true,revision:1,layout:'legacy-v1',dmInstructions:'',groupInstructions:''})
function presetId(value:unknown):string{if(typeof value!=='string'||!/^preset_[a-f0-9]{32}$/.test(value))throw Error('Invalid custom preset identifier.');return value}
function bounded(value:unknown,max:number,required=false):string{if(typeof value!=='string'||value.length>max||required&&!value.trim())throw Error('Invalid preset name or instructions.');return required?value.trim():value}
export function validateBinding(value:unknown,accountId?:string):PresetBinding {
 if(!value||typeof value!=='object')throw Error('Invalid preset binding; room data was preserved.')
 const b=value as PresetBinding;if(b.id!==DEFAULT_PRESET_ID)presetId(b.id)
 if(!Number.isSafeInteger(b.revision)||b.revision<1||b.accountId!==accountId||b.id===DEFAULT_PRESET_ID&&b.revision!==1)throw Error('Invalid preset revision or account binding; room data was preserved.')
 return{id:b.id,revision:b.revision,...(accountId?{accountId}:{})}
}
export class MochiPresets {
 private locks=new Map<string,Promise<unknown>>()
 constructor(private host:MochiHost){}
 private path(accountId?:unknown):string{if(accountId!==undefined)fictionalAccountId(accountId);return 'mochi/v1/presets/'+(accountId||'legacy')+'.json'}
 async read(user:string,accountId?:string):Promise<PresetBank>{
  identifier(user);const path=this.path(accountId)
  if(!await this.host.userStorage.exists(path,user))return{version:1,ownerId:user,...(accountId?{accountId}:{}),revision:0,presets:[],receipts:[]}
  const bank=await this.host.userStorage.getJson(path,{userId:user})as PresetBank
  if(!bank||bank.version!==1||bank.ownerId!==user||bank.accountId!==accountId||!Number.isSafeInteger(bank.revision)||bank.revision<1||!Array.isArray(bank.presets)||bank.presets.length>100||!Array.isArray(bank.receipts)||bank.receipts.length>10000||bank.receipts.some(id=>typeof id!=='string'))throw Error('Damaged preset library; saved revisions were preserved.')
  const ids=new Set<string>()
  for(const p of bank.presets){presetId(p?.id);if(ids.has(p.id)||typeof p.archived!=='boolean'||!Array.isArray(p.revisions)||!p.revisions.length||p.revisions.length>50)throw Error('Damaged preset history; saved revisions were preserved.');ids.add(p.id);bounded(p.name,80,true)
   for(const [i,r]of p.revisions.entries()){if(!r||r.revision!==i+1||!['legacy-v1','manual-v1'].includes(r.layout))throw Error('Unsupported preset revision; saved content was preserved.');if(r.layout==='manual-v1')validatePlacement(r.placement);else if(r.placement!==undefined)throw Error('Automatic revision cannot carry a manual plan.');bounded(r.dmInstructions,4000);bounded(r.groupInstructions,4000)}
  }
  return bank
 }
 async resolve(user:string,room:Pick<MochiRoom,'accountId'|'preset'>):Promise<ResolvedPreset>{
  if(!room.preset)return defaultPreset()
  const b=validateBinding(room.preset,room.accountId);if(b.id===DEFAULT_PRESET_ID)return defaultPreset()
  const bank=await this.read(user,room.accountId),p=bank.presets.find(p=>p.id===b.id),r=p?.revisions.find(r=>r.revision===b.revision)
  if(!p||!r)throw Error('The bound preset revision is unavailable. Restore Mochi Default explicitly or recover the library.')
  return{...r,id:p.id,name:p.name,builtIn:false}
 }
 async mutate(user:string,input:any):Promise<PresetBank>{
  const path=this.path(input.accountId),key=JSON.stringify([user,path]),previous=this.locks.get(key)||Promise.resolve()
  const task=previous.catch(()=>{}).then(async()=>{
   const bank=await this.read(user,input.accountId),receipt=identifier(input.requestId)
   if(bank.receipts.includes(receipt))return bank
   if(bank.revision!==input.revision)throw Error('Preset library changed elsewhere. Refresh before publishing.')
   if(!['create','duplicate','publish','rename','archive','restore'].includes(input.action))throw Error('Unsupported preset action.')
   const layout=input.layout??'legacy-v1';if(!['legacy-v1','manual-v1'].includes(layout))throw Error('Unsupported context layout.')
   if(layout==='legacy-v1'&&input.placement!==undefined)throw Error('Automatic mode must omit the manual plan.')
   const placement=layout==='manual-v1'?validatePlacement(input.placement):undefined
   const source=input.action==='create'||input.id===DEFAULT_PRESET_ID?undefined:bank.presets.find(p=>p.id===presetId(input.id))
   if(!['create','duplicate'].includes(input.action)&&!source)throw Error('This custom preset is unavailable; Mochi Default cannot be modified.')
   if(input.action==='create'||input.action==='duplicate'){
    if(bank.presets.length>=100)throw Error('Preset library limit reached; archive history was retained.')
    let content=defaultPreset()
    if(input.action==='duplicate'&&input.id!==DEFAULT_PRESET_ID){if(!source)throw Error('Preset to duplicate is unavailable.');const r=source.revisions.find(r=>r.revision===input.sourceRevision);if(!r)throw Error('Preset revision to duplicate is unavailable.');content={...r,id:source.id,name:source.name,builtIn:false}}
    bank.presets.push({id:`preset_${crypto.randomUUID().replaceAll('-','')}`,name:bounded(input.name,80,true),archived:false,revisions:[{revision:1,layout:input.action==='duplicate'?content.layout:layout,...(input.action==='duplicate'?content.placement?{placement:content.placement}:{}:placement?{placement}:{}),dmInstructions:input.action==='create'?bounded(input.dmInstructions??'',4000):content.dmInstructions,groupInstructions:input.action==='create'?bounded(input.groupInstructions??'',4000):content.groupInstructions}]})
   }else if(input.action==='publish'){
    if(source!.archived)throw Error('Restore this preset before publishing.');if(source!.revisions.length>=50)throw Error('Published revision limit reached. Duplicate into a new preset; existing revisions stay intact.')
    source!.revisions.push({revision:source!.revisions.length+1,layout,...(placement?{placement}:{}),dmInstructions:bounded(input.dmInstructions,4000),groupInstructions:bounded(input.groupInstructions,4000)})
   }else if(input.action==='rename')source!.name=bounded(input.name,80,true)
   else source!.archived=input.action==='archive'
   bank.receipts.push(receipt);if(bank.receipts.length>10000)throw Error('Preset receipt limit reached; records were preserved.');bank.revision++
   await this.host.userStorage.setJson(path+'.pending',bank,{userId:user});await this.host.userStorage.move(path+'.pending',path,user);return bank
  });this.locks.set(key,task);try{return await task}finally{if(this.locks.get(key)===task)this.locks.delete(key)}
 }
}
