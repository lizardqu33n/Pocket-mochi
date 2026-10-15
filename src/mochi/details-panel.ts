import {button,el} from '../frontend/shared.js'
import {statusFor} from './presence.js'
import type {MochiRoom,MochiCharacter} from './types.js'

/** Read-only projection of already-authorized room choices; no fetches or new profile store. */
export function roomDetails(room:MochiRoom,characters:MochiCharacter[],close:()=>void,settings:()=>void):HTMLElement{
 const panel=el('aside','mochi-profile-panel');panel.id=`mochi-room-details-${room.id}`;panel.setAttribute('aria-label','Conversation details')
 const heading=el('div','mochi-profile-heading'),title=el('h3','',room.characterIds.length===1?'Character details':'Group participants')
 const back=button('Back','lp-button');back.setAttribute('aria-label','Close conversation details');back.title='Back to conversation';back.onclick=close;heading.append(title,back);panel.append(heading)
 panel.dataset.kind=room.characterIds.length===1?'direct':'group'
 for(const id of room.characterIds){
  const character=characters.find(c=>c.id===id),name=room.settings?.characterNames[id]||character?.name||'Unavailable character'
  const card=el('section','mochi-profile-person'),avatar=el('span','mochi-avatar',name.slice(0,1));avatar.setAttribute('aria-hidden','true')
  if(character?.avatarUrl){const image=el('img');image.src=character.avatarUrl;image.alt='';avatar.replaceChildren(image)}
  const label=el('h4','',name);label.title=name
  const status=el('p','mochi-profile-status');status.dataset.characterId=id
  status.textContent=character?`Availability: ${statusFor(room,id)}`:'Character source unavailable';status.title='Availability affects when replies can arrive.'
  card.append(avatar,label,status);panel.append(card)
 }
 const snapshot=el('section','mochi-activity-snapshot');snapshot.append(el('h4','','Schedule snapshot'),el('p','','No current activity available.'));panel.append(snapshot)
 const configure=button('Open conversation settings','lp-button mochi-profile-settings');configure.onclick=settings;panel.append(configure)
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();close()}})
 return panel
}
