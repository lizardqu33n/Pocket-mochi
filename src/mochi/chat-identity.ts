import {el} from '../frontend/shared.js'
import type {MochiRoom,MochiCharacter} from './types.js'

export {GROUP_ICONS} from './group-icons.js'
export function chatIdentity(room:MochiRoom,characters:MochiCharacter[]){
 const direct=room.characterIds.length===1,c=characters.find(c=>c.id===room.characterIds[0])
 return {name:direct?(room.settings?.characterNames[room.characterIds[0]]||c?.name||'Unavailable character'):room.title,avatarUrl:direct?c?.avatarUrl||'':'',direct}
}
export function chatPortrait(room:MochiRoom,characters:MochiCharacter[]):HTMLElement {
 const identity=chatIdentity(room,characters),avatar=el('span','mochi-avatar mochi-chat-avatar',identity.direct?identity.name.slice(0,1):room.groupIcon||'👥')
 avatar.setAttribute('aria-hidden','true')
 if(identity.avatarUrl){const img=el('img');img.src=identity.avatarUrl;img.alt='';avatar.replaceChildren(img)}
 else if(!identity.direct&&!room.groupIcon){avatar.classList.add('mochi-group-portraits');avatar.replaceChildren();for(const id of room.characterIds.slice(0,2)){const c=characters.find(c=>c.id===id),part=el('span','',c?.name.slice(0,1)||'?');if(c?.avatarUrl){const img=el('img');img.src=c.avatarUrl;img.alt='';part.replaceChildren(img)}avatar.append(part)}}
 return avatar
}
