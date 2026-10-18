import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import type { MochiSession } from './session.js'
import { createMochiWindow, type MochiWindowUI } from './window.js'
import { createMochiWorkspace, type MochiWorkspace } from './workspace.js'
import type { MochiNotificationPolicy } from './notifications.js'
import { MOCHI_SIDEBAR_STYLES } from './sidebar-styles.js'
import {MOCHI_TOOLBAR_ICONS} from './toolbar-icons.js'
import {MOCHI_STYLES} from './styles.js'
import {createMochiMobileSurface} from './mobile-surface.js'

/** Navigation only; conversation rendering always leases the existing session. */
export interface MochiSidebar {readonly root:HTMLElement; open():void; openMessenger():void; settings(anchor:HTMLElement):void; onMessengerVisibility(handler:(visible:boolean)=>void):()=>void; destroy():void}
export function createMochiSidebar(ctx: Pick<SpindleFrontendContext,'ui'>, session: MochiSession,
  policy: () => Pick<MochiNotificationPolicy,'enabled'|'previews'>, activateSidebar:()=>void=()=>{}, dismissDrawer?:()=>void): MochiSidebar {
  const root=document.createElement('section');root.className='mochi-sidebar';root.setAttribute('aria-label','Mochi account navigation')
  const style=document.createElement('style');style.textContent=MOCHI_STYLES+'\n'+MOCHI_SIDEBAR_STYLES
  const nav=document.createElement('nav'),picker=document.createElement('div'),body=document.createElement('div'),editor=document.createElement('div')
  const fallbackStatus=document.createElement('p');fallbackStatus.className='mochi-sidebar-message';fallbackStatus.setAttribute('role','status');fallbackStatus.hidden=true
  editor.className='mochi-sidebar-picker';editor.hidden=true
  nav.className='mochi-sidebar-nav';nav.setAttribute('aria-label','Mochi navigation');picker.className='mochi-sidebar-picker';body.className='mochi-sidebar-body';body.hidden=true
  root.append(style,nav,fallbackStatus,picker,body,editor)
  let query='',sort='displayName',descending=false,grid=false,bulk=false,archived=false
  const selected=new Set<string>()
  let editorActivated=false
  let disposed=false, workspace:MochiWorkspace|undefined, fallback='', pickerRequested=true
  let ownedWindow:ReturnType<typeof createMochiWindow>|undefined, offWindow:(()=>void)|undefined
  let mobileSurface:ReturnType<typeof createMochiMobileSurface>|undefined
  const visibility=new Set<(visible:boolean)=>void>()
  const button=(label:string,click:(node:HTMLButtonElement)=>void)=>{const node=document.createElement('button');node.type='button';node.textContent=label;node.onclick=()=>click(node);return node}
  const showPicker=()=>{pickerRequested=true;picker.hidden=false;body.hidden=true;if(workspace?.isOpen&&!ownedWindow?.isOpen)for(const fn of visibility)fn(false);session.prepareNavigation();render()}
  const present=()=>{
    const wasFullscreen=mobileSurface?.isOpen===true
    // Match the inspected host's narrow viewport/coarse-pointer definition.
    const mobile=window.innerWidth<=600||window.matchMedia?.('(pointer: coarse)').matches
    if(!mobile){
      mobileSurface?.hide()
      try { const next=createMochiWindow(ctx.ui as unknown as MochiWindowUI,session,policy,dismissDrawer);if(ownedWindow!==next){offWindow?.();ownedWindow=next;offWindow=next.onVisibilityChange(visible=>{for(const fn of visibility)fn(visible)})};next.open();fallback='';render();return }
      catch { fallback='Floating windows are unavailable in this host. Mochi is open in this drawer.' }
    }
    let fullscreen=false
    if(mobile){
      try{mobileSurface ||= createMochiMobileSurface(ctx.ui,root);mobileSurface.open();fullscreen=true;fallback=''}
      catch{mobileSurface?.destroy();mobileSurface=undefined;fallback='Full-screen Mochi is unavailable. The messenger is open below in the Pocket drawer.'}
    }
    if(!fullscreen)activateSidebar()
    workspace ||= createMochiWorkspace({root:body,session,notificationPolicy:policy,presentation:'messenger',isHostVisible:()=>!root.hasAttribute('data-mobile-messenger')||!!mobileSurface?.isOpen,onVisibilityChange:visible=>{if(!visible)mobileSurface?.hide();for(const fn of visibility)fn(visible)}})
    pickerRequested=false;picker.hidden=true;body.hidden=false;workspace.open();render()
    // The subtree is now outside the drawer and its workspace owns the session.
    // Use the caller's supported host bridge; never destroy the drawer/session.
    if(fullscreen&&!wasFullscreen){
      try{dismissDrawer?.()}
      catch{fallback='Mochi is open. Close the Pocket drawer manually.';render()}
    }
    if(fullscreen)body.querySelector<HTMLElement>(session.view.roomId?'[aria-label="Back to conversations"]':'.mochi-desktop-room,[aria-label="New Chat"]')?.focus({preventScroll:true})
  }
  const accounts=button('Refresh accounts',()=>session.prepareNavigation()),open=button('Open Mochi',()=>present())
  const close=button('Close',anchor=>session.view.confirmGenerationExit(()=>{workspace?.close();mobileSurface?.hide();showPicker()},anchor))
  close.setAttribute('aria-label','Close Mochi messenger');close.hidden=true
  nav.append(accounts,open,close)
  const glyph=(label:string,icon:string,click:(node:HTMLButtonElement)=>void)=>{const node=button('',click);node.className='mochi-account-icon';node.title=label;node.setAttribute('aria-label',label);node.innerHTML=MOCHI_TOOLBAR_ICONS[icon]||MOCHI_TOOLBAR_ICONS.profile;return node}
  const portrait=(name:string,url:string)=>{const node=document.createElement('span');node.className='mochi-sidebar-avatar';node.textContent=name.slice(0,1);node.setAttribute('aria-hidden','true');if(url){const img=document.createElement('img');img.src=url;img.alt='';node.replaceChildren(img)}return node}
  const edit=(anchor:HTMLElement,create=false,id?:string)=>session.view.editSidebarProfile(anchor,()=>{showPicker();queueMicrotask(()=>picker.querySelector<HTMLElement>(id?'[data-account-id="'+id+'"]':'[aria-label="New account"]')?.focus())},create,id)
  function render():void {
    if(disposed)return
    fallbackStatus.hidden=!fallback;fallbackStatus.textContent=fallback
    const editing=session.view.isSidebarProfileOpen
    close.hidden=!mobileSurface?.isOpen;open.hidden=editing||!!mobileSurface?.isOpen&&!pickerRequested;accounts.hidden=editing
    editor.hidden=!editing
    const state=session.view.navigationState
    open.disabled=!state.selectedAccountId||!session.view.state||state.switching
    if(editing){
      if(ownedWindow?.isOpen)ownedWindow.hide()
      mobileSurface?.hide();picker.hidden=true;body.hidden=true
      if(!editorActivated){editorActivated=true;activateSidebar()}
      const focused=editor.contains(document.activeElement)?document.activeElement as HTMLInputElement:undefined,label=focused?.getAttribute('aria-label'),start=focused?.selectionStart,end=focused?.selectionEnd
      editor.replaceChildren(session.view.renderSidebarProfile())
      const next=Array.from(editor.querySelectorAll<HTMLInputElement>('[aria-label]')).find(n=>n.getAttribute('aria-label')===label)
      if(next){next.focus({preventScroll:true});if(start!=null&&end!=null&&next.type!=='checkbox')next.setSelectionRange(start,end)}
      else queueMicrotask(()=>editor.querySelector<HTMLElement>('h3')?.focus())
      return
    }
    editorActivated=false
    if(editor.childNodes.length){editor.replaceChildren();pickerRequested=true}
    picker.hidden=!pickerRequested;body.hidden=pickerRequested
    const focused=picker.contains(document.activeElement)?document.activeElement as HTMLInputElement:undefined,label=focused?.getAttribute('aria-label'),position=focused?.selectionStart,accountFocus=focused?.dataset.accountId
    picker.replaceChildren()
    const message=(text:string,alert=false)=>{const p=document.createElement('p');p.className='mochi-sidebar-message';p.textContent=text;p.setAttribute('role',alert?'alert':'status');picker.append(p)}
    const title=document.createElement('h3');title.textContent='Mochi Accounts';picker.append(title)
    if(state.loading)message('Loading accounts…')
    if(state.error)message(state.error,true)
    if(!state.accounts)return
    const tools=document.createElement('div');tools.className='mochi-account-tools'
    const search=document.createElement('input');search.type='search';search.placeholder='Search accounts…';search.setAttribute('aria-label','Search accounts');search.value=query;search.oninput=()=>{query=search.value;render()};search.onkeydown=e=>{if(e.key==='Escape'){query='';render()}}
    const create=glyph('New account','plus',anchor=>edit(anchor,true));create.disabled=state.switching;tools.append(search,create);picker.append(tools)
    const bar=document.createElement('div');bar.className='mochi-account-tools'
    const sortBy=document.createElement('select');sortBy.setAttribute('aria-label','Sort accounts');for(const [value,text]of [['displayName','Name'],['updatedAt','Updated'],['createdAt','Created'],['roomIds','Chats']]){const option=document.createElement('option');option.value=value;option.textContent=text;sortBy.append(option)}sortBy.value=sort;sortBy.onchange=()=>{sort=sortBy.value;render()}
    const order=glyph(descending?'Sort ascending':'Sort descending','sort',()=>{descending=!descending;render()}),view=glyph(grid?'Show list':'Show grid',grid?'list':'grid',()=>{grid=!grid;render()}),batch=glyph('Select multiple accounts','check',()=>{bulk=!bulk;selected.clear();render()});batch.setAttribute('aria-pressed',String(bulk))
    const archive=glyph(archived?'Show active accounts':'Show archived accounts','archive',()=>{archived=!archived;selected.clear();render()});archive.setAttribute('aria-pressed',String(archived));bar.append(sortBy,order,view,batch,archive);picker.append(bar)
    const all=state.accounts.accounts.filter(a=>a.archived===archived),visible=all.filter(a=>(a.displayName+' '+a.username).toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a,b)=>{const value=sort==='roomIds'?a.roomIds.length-b.roomIds.length:sort==='displayName'?a.displayName.localeCompare(b.displayName):String(a[sort as 'updatedAt']).localeCompare(String(b[sort as 'updatedAt']));return descending?-value:value})
    message(`${visible.length} / ${all.length} ${archived?'archived ':''}accounts`)
    const list=document.createElement('div');list.className='mochi-account-list';list.dataset.layout=grid?'grid':'list';picker.append(list)
    if(!visible.length)message(query?'No matching accounts.':'No accounts here. Use New account to create an independent identity or import a persona.')
    for(const account of visible){
      const row=document.createElement('div');row.className='mochi-account-row'
      const node=button('',anchor=>{if(archived)session.view.openAccountRecovery(anchor,showPicker);else session.view.selectNavigationAccount(account.id,anchor,()=>render())});node.className='mochi-sidebar-account';node.dataset.accountId=account.id
      node.setAttribute('aria-label',`${archived?'Recover':'Use Mochi account'} ${account.displayName}`);node.setAttribute('aria-pressed',String(state.selectedAccountId===account.id));node.disabled=state.switching
      const copy=document.createElement('span');copy.className='mochi-sidebar-label';const name=document.createElement('strong'),detail=document.createElement('small');name.textContent=account.displayName;detail.textContent=(account.username?'@'+account.username+' · ':'')+account.roomIds.length+' chats';copy.append(name,detail);node.append(portrait(account.displayName,account.avatarUrl),copy)
      if(bulk){const check=document.createElement('input');check.type='checkbox';check.setAttribute('aria-label','Select '+account.displayName);check.checked=selected.has(account.id);check.onchange=()=>{check.checked?selected.add(account.id):selected.delete(account.id);render()};row.append(check)}
      row.append(node);if(!archived){const settings=glyph('Edit account '+account.displayName,'settings',anchor=>edit(anchor,false,account.id));settings.disabled=state.switching;row.append(settings)}list.append(row)
    }
    if(bulk){message(`${selected.size} selected · ${all.filter(a=>selected.has(a.id)).reduce((n,a)=>n+a.roomIds.length,0)} preserved chats`);picker.append(button('Select all shown',()=>{visible.forEach(a=>selected.add(a.id));render()}),button('Clear selection',()=>{selected.clear();render()}))}
    if(state.accounts.legacyRoomCount){const recovery=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Legacy recovery';recovery.append(summary,button(`Review ${state.accounts.legacyRoomCount} unassigned chats`,anchor=>session.view.selectNavigationAccount(undefined,anchor,present)));picker.append(recovery)}
    const startupLabel=document.createElement('label');startupLabel.className='mochi-account-startup';startupLabel.textContent='On opening Mochi';const startup=document.createElement('select');startup.setAttribute('aria-label','Mochi startup preference');for(const [value,text]of [['last-used','Last used account'],['picker','Account picker']]){const option=document.createElement('option');option.value=value;option.textContent=text;startup.append(option)}startup.value=state.accounts.phone?.preference||state.accounts.startupPreference||'last-used';startup.disabled=state.switching;startup.onchange=()=>session.view.setNavigationStartupPreference(startup.value as 'last-used'|'picker');startupLabel.append(startup);picker.append(startupLabel)
    for(const warning of state.accounts.warnings)message(warning,true)
    const next=Array.from(picker.querySelectorAll<HTMLInputElement>('[aria-label]')).find(n=>accountFocus?n.dataset.accountId===accountFocus:n.getAttribute('aria-label')===label)
    if(next){next.focus({preventScroll:true});if(position!=null&&next.type==='search')next.setSelectionRange(position,position)}
  }
  const dispose=()=>{if(disposed)return;disposed=true;offWindow?.();visibility.clear();session.view.setAccountNavigation(undefined);workspace?.destroy();mobileSurface?.destroy();root.remove()}
  const detach=session.observeNavigation({redraw:render,disposed:dispose})
  render()
  const openPicker=()=>{session.assertActive();const anchor=document.activeElement as HTMLElement;session.view.exitPortal(()=>{if(ownedWindow?.isOpen)ownedWindow.hide();if(!mobileSurface?.isOpen)activateSidebar();showPicker()},anchor,true)}
  const settings=(anchor:HTMLElement)=>edit(anchor)
  session.view.setAccountNavigation({picker:openPicker,settings,logout:anchor=>session.view.logoutNavigationAccount(anchor,()=>{ownedWindow?.hide();workspace?.close();mobileSurface?.hide();activateSidebar();showPicker()})})
  return {root,open:()=>{session.assertActive();showPicker()},settings,openMessenger:()=>{session.assertActive();const current=session.view.navigationState;if(current.selectedAccountId&&current.accounts?.accounts.some(a=>a.id===current.selectedAccountId&&!a.archived)&&session.view.state?.accountId===current.selectedAccountId)present();else openPicker()},onMessengerVisibility(handler){visibility.add(handler);handler(ownedWindow?.isOpen||workspace?.isOpen||false);return()=>{visibility.delete(handler)}},destroy:()=>{detach();dispose()}}
}
