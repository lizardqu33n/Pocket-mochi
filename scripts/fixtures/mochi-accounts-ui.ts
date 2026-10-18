import {MochiService} from '../../src/mochi/service.js'
import {getMochiSession} from '../../src/mochi/session.js'
import {createMochiSidebar} from '../../src/mochi/sidebar.js'
import {PORTAL_STYLES,PocketPortal} from '../../src/frontend/components/portal.js'
import {PHONE_STYLES} from '../../src/styles.js'

// Entirely in-memory synthetic view fixture. No host installation, connections,
// authentication session, network generation or persistent user data is used.
const personas=new Map<string,any>([['native1',{id:'native1',name:'Synthetic Alex',description:'Synthetic AI identity for a calm, curious person.',metadata:{addons:[{id:'local1',label:'Writing preference',content:'Keep replies concise.',enabled:false}]}}],['native2',{id:'native2',name:'Synthetic Jules',description:'Another synthetic identity.'}]])
const files=new Map<string,any>(),requests:any[]=[],providerCalls:any[]=[]
const host:any={
 userStorage:{exists:async(p:string,u:string)=>files.has(u+':'+p),getJson:async(p:string,o:any)=>structuredClone(files.get(o.userId+':'+p)??o.fallback),setJson:async(p:string,v:any,o:any)=>{files.set(o.userId+':'+p,structuredClone(v))},move:async(a:string,b:string,u:string)=>{files.set(u+':'+b,files.get(u+':'+a));files.delete(u+':'+a)},list:async(p:string,u:string)=>[...files.keys()].filter(k=>k.startsWith(u+':'+p)).map(k=>k.slice((u+':'+p).length))},
 storage:{exists:async(p:string)=>files.has(p),getJson:async(p:string)=>structuredClone(files.get(p)),setJson:async(p:string,v:any)=>{files.set(p,structuredClone(v))},move:async(a:string,b:string)=>{files.set(b,files.get(a));files.delete(a)}},
 characters:{get:async(id:string)=>({id,name:id==='one'?'Synthetic Rowan':'Synthetic Mira',description:'Independent fictional test character.'}),list:async()=>({data:[{id:'one',name:'Synthetic Rowan'},{id:'two',name:'Synthetic Mira'}]})},
 personas:{get:async(id:string)=>personas.get(id)||null,list:async()=>({data:[...personas.values()]})},permissions:{has:()=>true},connections:{get:async(id:string)=>({id,model:'synthetic'}),list:async()=>[{id:'fixture',name:'Synthetic fixture',model:'synthetic'}]},tokens:{countMessages:async(m:any)=>({total_tokens:Math.ceil(JSON.stringify(m).length/4),model:'synthetic',approximate:true,tokenizer_name:'Synthetic counter'})},
 generate:{quiet:async(r:any)=>{providerCalls.push(r);return{content:'Synthetic reply'}}},sendToFrontend:(p:any)=>{for(const fn of listeners)fn(p)},
}
const service=new MochiService(host),root=document.getElementById('app')!
const style=document.createElement('style');style.textContent=PHONE_STYLES+PORTAL_STYLES;document.head.append(style)
const listeners=new Set<(p:any)=>void>()
const session=getMochiSession({sendToBackend:p=>{requests.push(p);void service.handle(p,'synthetic-user')},onBackendMessage:fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}}})
const view=session.view
const ui:any={createFloatWidget:(options:any)=>{
 const node=document.createElement('div');node.className='synthetic-float';node.style.cssText='position:fixed;inset:0;z-index:5';document.body.append(node);let visible=false
 return {root:node,setVisible:(v:boolean)=>{visible=v;node.hidden=!v},isVisible:()=>visible,setFullscreen:()=>{},isFullscreen:()=>true,setSize:()=>{},moveTo:()=>{},getPosition:()=>({x:0,y:0}),onDragEnd:()=>()=>{},destroy:()=>node.remove()}
},geometry:{layoutViewportSize:()=>({width:innerWidth,height:innerHeight}),createResizeController:()=>()=>{}}}
let portal:PocketPortal
const sidebar=createMochiSidebar({ui},session,()=>({enabled:true,previews:false}),()=>{root.hidden=false;portal.show('mochi')})
portal=new PocketPortal(()=>document.createElement('p'),()=>sidebar.root,()=>sidebar.open(),{back:(exit,anchor)=>view.back(exit,anchor),home:(exit,anchor)=>view.exitPortal(exit,anchor,true)})
root.append(portal.root)
async function start(){
 const account=await service.fictionalAccounts.create('synthetic-user',{displayName:'Alex',username:'alex_test',persona:{source:'lumiverse',sourceId:'native1'},personaLink:{source:'lumiverse',sourceId:'native1'},personaAddons:{personaId:'native1',enabledIds:[]}})
 let room=await service.create('synthetic-user',{accountId:account.id,title:'Mochi Default v2 review',characterIds:['one']})
 room=await service.update('synthetic-user',{roomId:room.id,accountId:account.id,revision:room.revision,title:room.title,characterIds:room.characterIds,settings:{...room.settings,connectionId:'fixture',responseMode:'manual'}})
 await service.message('synthetic-user',{roomId:room.id,accountId:account.id,revision:room.revision,requestId:'seed',content:'Synthetic history remains unchanged.'})
 room=await service.read('synthetic-user',room.id,account.id)
 await service.selectAccount('synthetic-user',{accountId:account.id,revision:(await service.fictionalAccounts.bank('synthetic-user')).revision})
 Object.assign(window,{__defaultFixture:{view,session,sidebar,portal,personas,service,host,files,requests,providerCalls,room,account}})
 await service.fictionalAccounts.create('synthetic-user',{displayName:'Jules',username:'jules_test',persona:{source:'manual',name:'Jules',description:'Independent saved identity.'}})
 portal.show('mochi')
}
void start()
