import {mochiButton as button} from './ui/icon-slots.js'
import {el} from '../frontend/shared.js'
import type {AccountScreenState} from './profile-screen.js'
export function accountPicker(state:AccountScreenState|null,busy:boolean,choose:(id:string)=>void,create:()=>void,legacy:()=>void,startup:(preference:string)=>void,manage:()=>void,refresh:()=>void):HTMLElement{
  const page=el('section','mochi-form mochi-account-picker');page.append(el('h3','','Choose your Mochi account'),el('p','mochi-muted','Keep each fictional identity and its conversations separate.'))
  if(!state){page.append(el('p','','Loading accounts…'));return page}
  const accounts=el('div','mochi-account-list');page.append(accounts)
  for(const a of state.accounts.filter(a=>!a.archived)){
    const card=button('','mochi-card');card.disabled=busy;card.setAttribute('aria-label','Use Mochi account '+a.displayName)
    const avatar=el('span','mochi-avatar',a.displayName.slice(0,1));if(a.avatarUrl){const img=el('img');img.src=a.avatarUrl;img.alt='';avatar.replaceChildren(img)}
    const copy=el('span','mochi-card-copy');copy.append(el('strong','',a.displayName),el('small','mochi-muted',(a.username?'@'+a.username+' · ':'')+a.roomIds.length+' chats'));card.append(avatar,copy);card.onclick=()=>choose(a.id);accounts.append(card)
  }
  const preference=el('select');preference.setAttribute('aria-label','Mochi startup preference');for(const [value,label]of [['last-used','Open last-used account'],['picker','Always show account picker']]){const option=el('option','',label);option.value=value;preference.append(option)}preference.value=state.phone?.preference||'last-used';preference.disabled=busy;preference.onchange=()=>startup(preference.value)
  const label=el('label','',state.phone?.supported?'On this Pocket phone':'Shared startup preference');label.append(preference);page.append(label)
  const actions=el('div','mochi-account-actions');page.append(actions)
  const add=button('Create Mochi account','lp-button mochi-primary');add.disabled=busy;add.onclick=create;actions.append(add)
  const settings=button('Manage Mochi profiles','lp-button');settings.disabled=busy;settings.onclick=manage;actions.append(settings)
  const reload=button('Refresh accounts','lp-button mochi-secondary-action');reload.disabled=busy;reload.onclick=refresh;page.append(reload)
  const old=button('Unassigned legacy chats','lp-button mochi-secondary-action mochi-legacy-action');old.disabled=busy;old.onclick=legacy;page.append(old)
  for(const warning of state.warnings)page.append(el('p','mochi-error',warning))
  return page
}
