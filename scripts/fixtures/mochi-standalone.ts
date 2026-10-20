// Synthetic host for the actual independent composition. No authenticated host,
// RP APIs, Pocket controller, phone widgets, network or persisted data.
import {startMochiRuntime} from '../../src/mochi/runtime.js'
import {setup} from '../../src/frontend.js'
import {getMochiSession} from '../../src/mochi/session.js'
const fallback=new URLSearchParams(location.search).has('fallback')
let drawerHandle:any
const files=new Map<string,any>(),backend=new Set<any>(),frontend=new Set<any>(),providerCalls:any[]=[]
const store=(scope:string)=>({
  exists:async(p:string,u?:string)=>files.has(scope+(u||'')+':'+p),
  getJson:async(p:string,o:any={})=>structuredClone(files.get(scope+(o.userId||'')+':'+p)??o.fallback),
  setJson:async(p:string,v:any,o:any={})=>{files.set(scope+(o.userId||'')+':'+p,structuredClone(v))},
  move:async(a:string,b:string,u?:string)=>{const k=scope+(u||'')+':';files.set(k+b,files.get(k+a));files.delete(k+a)},
  list:async(p:string,u?:string)=>[...files.keys()].filter(k=>k.startsWith(scope+(u||'')+':'+p)).map(k=>k.slice((scope+(u||'')+':'+p).length)),
})
const host:any={userStorage:store('user:'),storage:store('extension:'),
  characters:{get:async(id:string)=>({id,name:'Synthetic Rowan',description:'Fictional testing character.'}),list:async()=>({data:[{id:'rowan',name:'Synthetic Rowan'}]})},
  personas:{get:async()=>null,list:async()=>({data:[]})},permissions:{has:(p:string)=>['generation','characters','personas','images','ui_panels'].includes(p)},
  connections:{get:async()=>({id:'fake',model:'fake'}),list:async()=>[]},tokens:{countMessages:async()=>({total_tokens:100})},
  generate:{quiet:async(input:any)=>{providerCalls.push(input);throw Error('No generation authorized in this visual fixture.')}},
  onFrontendMessage:(fn:any)=>{backend.add(fn);return()=>backend.delete(fn)},sendToFrontend:(p:any)=>{for(const fn of frontend)fn(p)},log:{warn:()=>{}},
  ui:{closeDrawer:async()=>{document.getElementById('drawer')!.hidden=true}},
}
const runtime=startMochiRuntime(host)
const widget=(options:any)=>{
  const root=document.createElement('div');root.className='synthetic-widget';document.body.append(root)
  let position=options.initialPosition,full=false
  const moveTo=(x:number,y:number)=>{position={x,y};root.style.left=x+'px';root.style.top=y+'px'}
  const setSize=(w:number,h:number)=>{root.style.width=w+'px';root.style.height=h+'px'}
  moveTo(position.x,position.y);setSize(options.width,options.height)
  return {root,moveTo,getPosition:()=>position,setSize,setVisible:(v:boolean)=>{root.hidden=!v},isVisible:()=>!root.hidden,onDragEnd:()=>()=>{},
    setFullscreen:fallback?undefined:(value:boolean)=>{full=value;if(value){moveTo(0,0);setSize(innerWidth,innerHeight)}},isFullscreen:()=>full,destroy:()=>root.remove()}
}
const ctx:any={sendToBackend:(p:any)=>{for(const fn of backend)fn(p,'synthetic')},onBackendMessage:(fn:any)=>{frontend.add(fn);return()=>frontend.delete(fn)},
  dom:{addStyle:(css:string)=>{const style=document.createElement('style');style.textContent=css;document.head.append(style);return()=>style.remove()}},
  ready:()=>{},ui:{createFloatWidget:widget,geometry:fallback?undefined:{layoutViewportSize:()=>({width:innerWidth,height:innerHeight}),createResizeController:()=>()=>{}},
    registerDrawerTab:()=>{const root=document.getElementById('drawer')!;let active:any;return drawerHandle={root,onActivate:(fn:any)=>{active=fn;return()=>{active=undefined}},activate:()=>{root.hidden=false;active?.()},destroy:()=>root.remove()}},
    registerInputBarAction:(options:any)=>{const button=document.createElement('button');button.textContent=options.label;button.id='owned-action';document.body.append(button);return{onClick:(fn:any)=>{button.onclick=fn;return()=>{button.onclick=null}},destroy:()=>button.remove()}},
  },
}
async function start(){
  const day=await runtime.service.fictionalAccounts.create('synthetic',{displayName:'Day worker',persona:{source:'manual',name:'Day worker'}})
  await runtime.service.fictionalAccounts.create('synthetic',{displayName:'Night worker',persona:{source:'manual',name:'Night worker'}})
  await runtime.service.create('synthetic',{accountId:day.id,title:'Independent messenger',characterIds:['rowan']})
  const dispose=setup(ctx)
  ;(window as any).__mochiCore={providerCalls,dispose:()=>{dispose();runtime.stop()},frontend,
    changeOwner:()=>{const session=getMochiSession(ctx);session.authenticatedIdentityChanged('synthetic');session.authenticatedIdentityChanged('other')},
    openDrawer:()=>drawerHandle.activate(),closeDrawer:()=>{document.getElementById('drawer')!.hidden=true},
  }
}
void start()
