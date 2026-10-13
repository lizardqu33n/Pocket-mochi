import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import type { MochiSession } from './session.js'
import { createMochiWindow, type MochiWindowUI } from './window.js'
import { createMochiWorkspace, type MochiWorkspace } from './workspace.js'
import type { MochiNotificationPolicy } from './notifications.js'
import { MOCHI_SIDEBAR_STYLES } from './sidebar-styles.js'

/** Navigation only; conversation rendering always leases the existing session. */
export interface MochiSidebar {readonly root:HTMLElement; open():void; openMessenger():void; settings(anchor:HTMLElement):void; onMessengerVisibility(handler:(visible:boolean)=>void):()=>void; destroy():void}
export function createMochiSidebar(ctx: Pick<SpindleFrontendContext,'ui'>, session: MochiSession,
  policy: () => Pick<MochiNotificationPolicy,'enabled'|'previews'>, activateSidebar:()=>void=()=>{}): MochiSidebar {
  const root=document.createElement('section');root.className='mochi-sidebar';root.setAttribute('aria-label','Mochi account navigation')
  const style=document.createElement('style');style.textContent=MOCHI_SIDEBAR_STYLES
  const nav=document.createElement('nav'),picker=document.createElement('div'),body=document.createElement('div'),editor=document.createElement('div')
  editor.className='mochi-sidebar-picker';editor.hidden=true
  nav.className='mochi-sidebar-nav';nav.setAttribute('aria-label','Mochi navigation');picker.className='mochi-sidebar-picker';body.className='mochi-sidebar-body';body.hidden=true
  root.append(style,nav,picker,body,editor)
  let disposed=false, workspace:MochiWorkspace|undefined, fallback='', rendered='', pickerRequested=true
  let ownedWindow:ReturnType<typeof createMochiWindow>|undefined, offWindow:(()=>void)|undefined
  const visibility=new Set<(visible:boolean)=>void>()
  const button=(label:string,click:(node:HTMLButtonElement)=>void)=>{const node=document.createElement('button');node.type='button';node.textContent=label;node.onclick=()=>click(node);return node}
  const showPicker=()=>{pickerRequested=true;picker.hidden=false;body.hidden=true;if(workspace?.isOpen&&!ownedWindow?.isOpen)for(const fn of visibility)fn(false);session.prepareNavigation();render()}
  const present=()=>{
    // Match the inspected host's narrow viewport/coarse-pointer definition.
    const mobile=window.innerWidth<=600||window.matchMedia?.('(pointer: coarse)').matches
    if(!mobile){
      try { const next=createMochiWindow(ctx.ui as unknown as MochiWindowUI,session,policy);if(ownedWindow!==next){offWindow?.();ownedWindow=next;offWindow=next.onVisibilityChange(visible=>{for(const fn of visibility)fn(visible)})};next.open();fallback='';render();return }
      catch { fallback='Floating windows are unavailable in this host. Mochi is open in this drawer.' }
    }
    activateSidebar()
    workspace ||= createMochiWorkspace({root:body,session,notificationPolicy:policy,presentation:'messenger',onVisibilityChange:visible=>{for(const fn of visibility)fn(visible)}})
    picker.hidden=true;body.hidden=false;workspace.open();render()
  }
  const accounts=button('Accounts',()=>showPicker()),open=button('Open messenger',()=>present())
  nav.append(accounts,open)
  function render():void {
    if(disposed)return
    editor.hidden=!session.view.isSidebarProfileOpen||pickerRequested
    if(session.view.isSidebarProfileOpen&&!pickerRequested){
      picker.hidden=true;body.hidden=true
      const focused=editor.contains(document.activeElement)?document.activeElement as HTMLInputElement:undefined,label=focused?.getAttribute('aria-label'),start=focused?.selectionStart,end=focused?.selectionEnd
      editor.replaceChildren(session.view.renderSidebarProfile())
      const next=Array.from(editor.querySelectorAll<HTMLInputElement>('[aria-label]')).find(n=>n.getAttribute('aria-label')===label)
      if(next){next.focus({preventScroll:true});if(start!=null&&end!=null)next.setSelectionRange(start,end)}
      return
    }
    if(editor.childNodes.length){editor.replaceChildren();picker.hidden=false}
    const state=session.view.navigationState, focused=picker.contains(document.activeElement)?(document.activeElement as HTMLElement).dataset.accountId:undefined
    open.disabled=!session.view.state
    const key=JSON.stringify([state.accounts?.revision,state.accounts?.accounts.map(a=>[a.id,a.displayName,a.avatarUrl,a.archived,a.roomIds.length]),state.selectedAccountId,state.loading,state.error,state.switching,fallback])
    if(key===rendered)return
    rendered=key
    picker.replaceChildren()
    const message=(text:string)=>{const p=document.createElement('p');p.className='mochi-sidebar-message';p.textContent=text;picker.append(p)}
    if(fallback)message(fallback)
    if(state.loading)message('Loading accounts…')
    if(state.error){message(state.error);picker.append(button('Try again',()=>session.prepareNavigation()))}
    if(!state.accounts){if(!state.loading&&!state.error)message('Open Accounts to load your Mochi profiles.');return}
    const available=state.accounts.accounts.filter(a=>!a.archived)
    if(!available.length)message('No fictional accounts yet. Create one to start chatting.')
    for(const account of available){
      const node=button('',anchor=>session.view.selectNavigationAccount(account.id,anchor,present));node.className='mochi-sidebar-account';node.dataset.accountId=account.id
      node.setAttribute('aria-label',`Use Mochi account ${account.displayName}`);node.setAttribute('aria-pressed',String(state.selectedAccountId===account.id));node.disabled=state.switching
      const avatar=document.createElement('span');avatar.className='mochi-sidebar-avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent=account.displayName.slice(0,1)
      if(account.avatarUrl){const image=document.createElement('img');image.src=account.avatarUrl;image.alt='';avatar.replaceChildren(image)}
      const label=document.createElement('span');label.className='mochi-sidebar-label';const name=document.createElement('span');name.textContent=account.displayName
      const detail=document.createElement('small');detail.textContent=`${state.selectedAccountId===account.id?'Selected · ':''}${account.roomIds.length} chats`;label.append(name,detail);node.append(avatar,label);picker.append(node)
    }
    const create=button('Create account',anchor=>{pickerRequested=false;session.view.editSidebarProfile(anchor,()=>{if(session.view.state?.accountId)present();else showPicker()},true)});create.disabled=state.switching;picker.append(create)
    const legacy=button('Unassigned legacy chats',anchor=>session.view.selectNavigationAccount(undefined,anchor,present));legacy.disabled=state.switching;picker.append(legacy)
    if(focused)Array.from(picker.querySelectorAll<HTMLButtonElement>('[data-account-id]')).find(n=>n.dataset.accountId===focused)?.focus({preventScroll:true})
  }
  const dispose=()=>{if(disposed)return;disposed=true;offWindow?.();visibility.clear();session.view.setAccountNavigation(undefined);workspace?.destroy();root.remove()}
  const detach=session.observeNavigation({redraw:render,disposed:dispose})
  render()
  const openPicker=()=>{session.assertActive();activateSidebar();showPicker()}
  const settings=(anchor:HTMLElement)=>{activateSidebar();pickerRequested=false;if(session.view.isSidebarProfileOpen)render();else session.view.editSidebarProfile(anchor,()=>{if(session.view.state?.accountId)present();else showPicker()})}
  session.view.setAccountNavigation({picker:openPicker,settings})
  return {root,open:()=>{session.assertActive();showPicker()},settings,openMessenger:()=>{session.assertActive();const current=session.view.navigationState;if(current.selectedAccountId&&current.accounts?.accounts.some(a=>a.id===current.selectedAccountId&&!a.archived)&&session.view.state?.accountId===current.selectedAccountId)present();else openPicker()},onMessengerVisibility(handler){visibility.add(handler);handler(ownedWindow?.isOpen||workspace?.isOpen||false);return()=>{visibility.delete(handler)}},destroy:()=>{detach();dispose()}}
}
