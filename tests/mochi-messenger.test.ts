import {test,expect} from 'bun:test'
import {MochiService} from '../src/mochi/service.js'
import {GROUP_ICONS,groupIcon} from '../src/mochi/group-icons.js'
import {chatIdentity} from '../src/mochi/chat-identity.js'
function fixture(){
 const files=new Map<string,any>()
 const host:any={userStorage:{exists:async(p:string,u:string)=>files.has(u+':'+p),getJson:async(p:string,o:any)=>structuredClone(files.get(o.userId+':'+p)??o.fallback),setJson:async(p:string,v:any,o:any)=>files.set(o.userId+':'+p,structuredClone(v)),move:async(a:string,b:string,u:string)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async()=>[]},characters:{get:async(id:string)=>['one','two'].includes(id)?{id,name:id}:null,list:async()=>({data:[]})},personas:{list:async()=>({data:[]})},permissions:{has:()=>true},sendToFrontend:()=>{}}
 return Object.assign(new MochiService(host),{fixtureFiles:files})
}
const input={title:'Weekend plans',characterIds:['one','two'],persona:{source:'manual',name:'Stored identity',description:''}}
test('group icon roundtrip is revision-safe, scoped, optional and preserves history/identity',async()=>{
 const s=fixture(),r=await s.create('alice',{...input,groupIcon:'🌙'})
 r.messages.push({id:'seed',role:'user',name:'Stored identity',avatarUrl:'',content:'Keep this history.',createdAt:r.createdAt,requestId:'fixture'});s.fixtureFiles.set('alice:mochi/v1/rooms/'+r.id+'.json',structuredClone(r))
 expect((await s.read('alice',r.id)).groupIcon).toBe('🌙')
 const changed=await s.update('alice',{roomId:r.id,revision:r.revision,title:r.title,characterIds:r.characterIds,groupIcon:'🎮'})
 expect(changed.groupIcon).toBe('🎮');expect(changed.revision).toBe(r.revision+1);expect(changed.messages).toEqual(r.messages);expect(changed.persona).toEqual(r.persona)
 await expect(s.update('alice',{roomId:r.id,revision:r.revision,title:r.title,characterIds:r.characterIds,groupIcon:'⭐'})).rejects.toThrow()
 await expect(s.update('bob',{roomId:r.id,revision:changed.revision,title:r.title,characterIds:r.characterIds,groupIcon:'⭐'})).rejects.toThrow()
 const clear=await s.update('alice',{roomId:r.id,revision:changed.revision,title:r.title,characterIds:r.characterIds,groupIcon:''})
 expect(clear.groupIcon).toBeUndefined();expect((await s.read('alice',r.id)).groupIcon).toBeUndefined()
})
test('group icons cannot carry arbitrary image URLs, markup or unbounded data',async()=>{
 const s=fixture()
 for(const value of ['https://example.com/avatar.png','<svg onload=alert(1)>','x'.repeat(5000),{},null]){
  expect(()=>groupIcon(value)).toThrow();await expect(s.create('alice',{...input,groupIcon:value})).rejects.toThrow()
 }
 for(const icon of GROUP_ICONS)expect(groupIcon(icon)).toBe(icon)
})
test('direct message identity uses character portrait and ignores group artwork',async()=>{
 const s=fixture(),r=await s.create('alice',{...input,characterIds:['one'],groupIcon:'🌙'})
 expect(r.groupIcon).toBeUndefined()
 const characters=[{id:'one',name:'Rowan',avatarUrl:'/local.png'}]
 expect(chatIdentity(r,characters)).toEqual({name:'Rowan',avatarUrl:'/local.png',direct:true})
 const group=await s.create('alice',{...input,groupIcon:'⭐'})
 const dm=await s.update('alice',{roomId:group.id,revision:group.revision,title:group.title,characterIds:['one']})
 expect(dm.groupIcon).toBeUndefined();expect(chatIdentity(dm,characters).name).toBe('Rowan')
})
test('group icon writes cannot cross fictional-profile ownership',async()=>{
 const s=fixture(),a=await s.fictionalAccounts.create('alice',{displayName:'A',persona:input.persona}),b=await s.fictionalAccounts.create('alice',{displayName:'B',persona:input.persona})
 const r=await s.create('alice',{...input,accountId:a.id,groupIcon:'⭐'})
 await expect(s.update('alice',{roomId:r.id,accountId:b.id,revision:r.revision,title:r.title,characterIds:r.characterIds,groupIcon:'🌙'})).rejects.toThrow()
 expect((await s.read('alice',r.id,a.id)).groupIcon).toBe('⭐')
})
