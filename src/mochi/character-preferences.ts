import type {MochiHost} from './service.js'
import type {MochiAccounts} from './accounts.js'
import {identifier} from './scheduling.js'
import {validateTextingStyles,type TextingStyle} from './texting.js'
import {validatePresence,type CharacterPresence} from './presence.js'
export interface CharacterPreferences {version:1;ownerId:string;characterId:string;revision:number;about:string;texting?:TextingStyle;availability?:CharacterPresence}
/** Independent optional Mochi metadata. Never writes native character cards or room schedules. */
export class MochiCharacterPreferences {
 constructor(private host:MochiHost,private accounts:MochiAccounts){}
 private id(value:string){if(typeof value!=='string'||!/^[A-Za-z0-9_-]{1,180}$/.test(value)||['__proto__','constructor','prototype'].includes(value))throw Error('Invalid character.');return value}
 async read(userId:string,characterId:string,verifySource=true):Promise<CharacterPreferences>{
  const user=identifier(userId),id=this.id(characterId)
  if(verifySource&&(!this.host.permissions.has('characters')||!await this.host.characters.get(id,user)))throw Error('Character unavailable.')
  const path=`mochi/v1/character-preferences/${id}.json`
  if(!await this.host.userStorage.exists(path,user))return {version:1,ownerId:user,characterId:id,revision:0,about:''}
  const r=await this.host.userStorage.getJson(path,{userId:user}) as CharacterPreferences
  if(!r||r.version!==1||r.ownerId!==user||r.characterId!==id||!Number.isSafeInteger(r.revision)||r.revision<1)throw Error('Character preferences damaged; preserved.')
  return this.validate(r)
 }
 private validate(r:CharacterPreferences){
  if(typeof r.about!=='string'||r.about.length>2000)throw Error('About Me must be at most 2000 characters.')
  const texting=validateTextingStyles(r.texting===undefined?undefined:{[r.characterId]:r.texting})?.[r.characterId]
  const availability=r.availability===undefined?undefined:validatePresence(r.availability)
  if(availability?.transitions.length)throw Error('Schedules are conversation-specific.')
  return {...r,about:r.about.trim(),texting,availability}
 }
 async save(userId:string,input:any,canSave:()=>void=()=>{}){
  return this.accounts.guard(userId,async()=>{
   canSave()
   const saved=await this.read(userId,input.characterId)
   if(input.revision!==saved.revision)throw Error('Character defaults changed. Refresh before saving.')
   const record=this.validate({...saved,...(input.about!==undefined?{about:input.about}:{}),...(input.texting!==undefined?{texting:input.texting===null?undefined:input.texting}:{}),...(input.availability!==undefined?{availability:input.availability===null?undefined:input.availability}:{}),revision:saved.revision+1})
   const path=`mochi/v1/character-preferences/${record.characterId}.json`
   await this.host.userStorage.setJson(path+'.pending',record,{userId:userId});await this.host.userStorage.move(path+'.pending',path,userId)
   return record
  })
 }
}
