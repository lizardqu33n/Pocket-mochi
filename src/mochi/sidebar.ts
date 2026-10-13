import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import type { MochiSession } from './session.js'
import { createMochiWindow, type MochiWindowUI } from './window.js'
import { createMochiWorkspace, type MochiWorkspace } from './workspace.js'
import type { MochiNotificationPolicy } from './notifications.js'
import { MOCHI_SIDEBAR_ICON } from './sidebar-icon.js'
import { MOCHI_SIDEBAR_STYLES } from './sidebar-styles.js'

/** Navigation only; conversation rendering always leases the existing session. */
export function createMochiSidebar(ctx: Pick<SpindleFrontendContext,'ui'>, session: MochiSession,
  policy: () => Pick<MochiNotificationPolicy,'enabled'|'previews'>): () => void {
  const drawer=ctx.ui.registerDrawerTab({id:'mochi',title:'Mochi',shortName:'Mochi',headerTitle:'Mochi',description:'Independent fictional accounts and conversations',keywords:['messenger','accounts','Mochi'],iconSvg:MOCHI_SIDEBAR_ICON})
  const root=document.createElement('section');root.className='mochi-sidebar';root.setAttribute('aria-label','Mochi account navigation')
  const style=document.createElement('style');style.textContent=MOCHI_SIDEBAR_STYLES
  const nav=document.createElement('nav'),picker=document.createElement('div'),body=document.createElement('div')
  nav.className='mochi-sidebar-nav';nav.setAttribute('aria-label','Mochi navigation');picker.className='mochi-sidebar-picker';body.className='mochi-sidebar-body';body.hidden=true
  root.append(style,nav,picker,body);drawer.root.append(root)
  let disposed=false, workspace:MochiWorkspace|undefined, fallback='', rendered=''
  const button=(label:string,click:(node:HTMLButtonElement)=>void)=>{const node=document.createElement('button');node.type='button';node.textContent=label;node.onclick=()=>click(node);return node}
  const showPicker=()=>{picker.hidden=false;body.hidden=true;session.prepareNavigation();render()}
  const present=()=>{
    // Match the inspected host's narrow viewport/coarse-pointer definition.
    const mobile=window.innerWidth<=600||window.matchMedia?.('(pointer: coarse)').matches
    if(!mobile){
      try { createMochiWindow(ctx.ui as unknown as MochiWindowUI,session,policy).open();fallback='';render();return }
      catch { fallback='Floating windows are unavailable in this host. Mochi is open in this drawer.' }
    }
    workspace ||= createMochiWorkspace({root:body,session,notificationPolicy:policy,presentation:'messenger'})
    picker.hidden=true;body.hidden=false;workspace.open();render()
  }
  const accounts=button('Accounts',()=>showPicker()),open=button('Open messenger',()=>present())
  nav.append(accounts,open)
  function render():void {
    if(disposed)return
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
    const create=button('Create account',anchor=>session.view.createNavigationAccount(anchor,present));create.disabled=state.switching;picker.append(create)
    const legacy=button('Unassigned legacy chats',anchor=>session.view.selectNavigationAccount(undefined,anchor,present));legacy.disabled=state.switching;picker.append(legacy)
    if(focused)Array.from(picker.querySelectorAll<HTMLButtonElement>('[data-account-id]')).find(n=>n.dataset.accountId===focused)?.focus({preventScroll:true})
  }
  const dispose=()=>{if(disposed)return;disposed=true;workspace?.destroy();offActivate();drawer.destroy();root.remove()}
  const offActivate=drawer.onActivate(showPicker)
  const detach=session.observeNavigation({redraw:render,disposed:dispose})
  render()
  return()=>{detach();dispose()}
}
