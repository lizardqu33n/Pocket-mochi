import {defaultMochiSettings,type MochiRoom} from '../../src/mochi/types.js'
export function contextCases(){
 const base:MochiRoom={version:1,id:'room_'+'a'.repeat(32),revision:1,title:'Synthetic DM',characterIds:['first'],persona:{source:'manual',sourceId:'',name:'Synthetic user',description:'Synthetic persona',avatarUrl:''},messages:[{id:'m1',role:'user',name:'Synthetic user',content:'Hello',createdAt:'2026-10-13T00:00:00Z'}],settings:{...defaultMochiSettings(),connectionId:'synthetic',model:'synthetic-model'},createdAt:'2026-10-13T00:00:00Z',updatedAt:'2026-10-13T00:00:00Z'}
 const first={id:'first',name:'First',description:'First description',personality:'First personality',scenario:'Messenger'},second={id:'second',name:'Second',description:'Second description'}
 const make=(name:string,edit:(r:MochiRoom)=>void=()=>{},characters:any[]=[first],responder='first',natural=false)=>{const room=structuredClone(base);edit(room);return{name,room,characters,responder,natural}}
 return[
  make('dm-default'),make('dm-style',r=>{r.settings!.textingStyles={first:{length:'short',emoji:'rare',tone:'Dry humor'}}}),
  make('group',r=>{r.characterIds=['first','second'];r.title='Synthetic group'},[first,second],'auto'),
  make('notes',r=>{r.systemNotes=[{id:'note_'+'a'.repeat(32),title:'Active',body:'A saved instruction',enabled:true},{id:'note_'+'b'.repeat(32),title:'Disabled',body:'Do not insert',enabled:false}]}),
  make('quotes-reactions',r=>{(r.messages[0]as any).reactions=[{emoji:'👍',actor:'user',actorId:'legacy',name:'Synthetic user'}];r.messages.push({id:'m2',role:'assistant',name:'First',content:'Reply',replyTo:'m1',createdAt:'2026-10-13T00:01:00Z'})}),
  make('trimmed',r=>{r.settings!.contextTokens=2048;r.settings!.outputTokens=128;r.messages=Array.from({length:30},(_,i)=>({id:'m'+i,role:'user',name:'Synthetic user',content:'Older dialogue '.repeat(30),createdAt:'2026-10-13T00:00:00Z'}))}),
  make('natural-timing',r=>{r.characterIds=['first','second'];r.settings!.responseMode='natural';r.settings!.aiBehavior=true},[first,second],'auto',true),
  make('scheduled',r=>{r.settings!.aiBehavior=true;r.settings!.instructions='Synthetic scheduled context'})
 ]
}
export const syntheticCount=(messages:unknown)=>Math.ceil(JSON.stringify(messages).length/4)
