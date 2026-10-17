import {MochiService} from '../../src/mochi/service.js'
import {MochiView} from '../../src/mochi/view.js'
import {PHONE_STYLES} from '../../src/styles.js'

// Entirely in-memory synthetic view fixture. No host installation, connections,
// authentication session, network generation or persistent user data is used.
const files=new Map<string,any>(),requests:any[]=[],providerCalls:any[]=[]
const host:any={
 userStorage:{exists:async(p:string,u:string)=>files.has(u+':'+p),getJson:async(p:string,o:any)=>structuredClone(files.get(o.userId+':'+p)??o.fallback),setJson:async(p:string,v:any,o:any)=>{files.set(o.userId+':'+p,structuredClone(v))},move:async(a:string,b:string,u:string)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async(p:string,u:string)=>[...files.keys()].filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length))},
 storage:{exists:async(p:string)=>files.has(p),getJson:async(p:string)=>structuredClone(files.get(p)),setJson:async(p:string,v:any)=>{files.set(p,structuredClone(v))},move:async(a:string,b:string)=>{files.set(b,files.get(a));files.delete(a)}},
 characters:{get:async(id:string)=>({id,name:id==='one'?'Synthetic Rowan':'Synthetic Mira',description:'Independent fictional test character.'}),list:async()=>({data:[{id:'one',name:'Synthetic Rowan'},{id:'two',name:'Synthetic Mira'}]})},
 personas:{get:async()=>null,list:async()=>({data:[]})},permissions:{has:()=>true},connections:{get:async(id:string)=>({id,model:'synthetic'}),list:async()=>[{id:'fixture',name:'Synthetic fixture',model:'synthetic'}]},tokens:{countMessages:async(m:any)=>({total_tokens:Math.ceil(JSON.stringify(m).length/4),model:'synthetic',approximate:true,tokenizer_name:'Synthetic counter'})},
 generate:{quiet:async(r:any)=>{providerCalls.push(r);return{content:'Synthetic reply'}}},sendToFrontend:(p:any)=>view.receive(p),
}
const service=new MochiService(host),root=document.getElementById('app')!
const style=document.createElement('style');style.textContent=PHONE_STYLES;document.head.append(style)
const render=()=>{root.replaceChildren(view.renderDesktop())}
const view=new MochiView(p=>{requests.push(p);void service.handle(p,'synthetic-user')},render,id=>{view.select(id||'');render()})
async function start(){
 const account=await service.fictionalAccounts.create('synthetic-user',{displayName:'Default v2 acceptance',persona:{source:'manual',name:'Synthetic identity',description:'Fictional identity used only for UI checks.'}})
 let room=await service.create('synthetic-user',{accountId:account.id,title:'Mochi Default v2 review',characterIds:['one']})
 room=await service.update('synthetic-user',{roomId:room.id,accountId:account.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,connectionId:'fixture',responseMode:'manual'}})
 await service.message('synthetic-user',{roomId:room.id,accountId:account.id,revision:room.revision,requestId:'seed',content:'Synthetic history remains unchanged.'})
 room=await service.read('synthetic-user',room.id,account.id)
 await service.selectAccount('synthetic-user',{accountId:account.id,revision:(await service.fictionalAccounts.bank('synthetic-user')).revision})
 Object.assign(window,{__defaultFixture:{view,service,host,files,requests,providerCalls,room,account}})
 view.open();render()
}
void start()
