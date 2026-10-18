import {button,el} from '../frontend/shared.js'
import {statusFor} from './presence.js'
import {chatIdentity,chatPortrait} from './chat-identity.js'
import type {MochiRoom,MochiCharacter} from './types.js'

/** Read-only projection of authorized character choices; no extra fetch or profile store. */
export function roomDetails(room:MochiRoom,characters:MochiCharacter[],close:()=>void,settings:()=>void,edit?:(character:MochiCharacter)=>HTMLElement):HTMLElement{
 const panel=el('aside','mochi-profile-panel');panel.id=`mochi-room-details-${room.id}`;panel.setAttribute('aria-label','Character profile')
 const direct=room.characterIds.length===1
 panel.dataset.kind=direct?'direct':'group'
 const heading=el('div','mochi-profile-heading'),title=el('h3','',direct?'Profile':'Group profile')
 const back=button('Back','lp-button');back.setAttribute('aria-label','Close character profile');back.title='Back to conversation';back.onclick=close;heading.append(title,back);panel.append(heading)
 const cover=el('div','mochi-profile-cover');cover.setAttribute('aria-hidden','true');panel.append(cover)
 if(!direct){const hero=el('section','mochi-profile-group');hero.append(chatPortrait(room,characters),el('h4','',room.title),el('p','mochi-muted',`${room.characterIds.length} participants`));panel.append(hero)}
 for(const id of room.characterIds){
  const character=characters.find(c=>c.id===id),name=room.settings?.characterNames[id]||character?.name||'Unavailable character'
  const card=el('section','mochi-profile-person'),avatar=el('span','mochi-avatar',name.slice(0,1));avatar.setAttribute('aria-hidden','true')
  if(character?.avatarUrl){const image=el('img');image.src=character.avatarUrl;image.alt='';avatar.replaceChildren(image)}
  const label=el('h4','',name);label.title=name
  const status=el('p','mochi-profile-status');status.dataset.characterId=id
  status.textContent=character?`Availability: ${statusFor(room,id)}`:'Character source unavailable';status.title='Configured character availability; not a real user’s online status.'
  card.append(avatar,label)
  if(character&&character.name!==name)card.append(el('small','mochi-muted',character.name))
  card.append(status)
  const about=el('div','mochi-profile-about');about.append(el('h5','','About'),el('p','',character?.about||'No Mochi bio saved yet.'));if(character&&edit){const details=el('details'),summary=el('summary','','Edit Mochi About Me');details.append(summary,edit(character));about.append(details)}card.append(about);panel.append(card)
 }
 const chat=el('p','mochi-profile-chat-name','Chat name: '+room.title);panel.append(chat)
 const configure=button(direct?'Chat settings':'Chat settings & group icon','lp-button mochi-profile-settings');configure.setAttribute('aria-label','Open conversation settings');configure.onclick=settings;panel.append(configure)
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();close()}})
 return panel
}
