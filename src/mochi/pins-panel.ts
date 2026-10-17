import {mochiStyle} from './ui/styles.js'
import { el, button } from '../frontend/shared.js'
import type {MochiRoom,MochiSystemNote} from './types.js'
import {referencedMessage,quoteExcerpt} from './replies.js'
import {MAX_NOTE_BODY} from './pins.js'

export interface NoteDraft {note:Partial<MochiSystemNote>&{title:string;body:string;enabled:boolean};revision:number;baseline:string}
export interface PinsPanelOwner {
 draft?:NoteDraft; setDraft(draft:NoteDraft|undefined):void
 mutate(values:Record<string,unknown>,saveDraft?:boolean):void
 jump(id:string):void; unavailable:boolean
}
export function pinsPanel(room:MochiRoom,owner:PinsPanelOwner):HTMLElement {
 const root=el('div','mochi-pins-panel')
 const render=()=>{
  root.replaceChildren()
  root.append(el('h3','','Chat Pins'),el('p','mochi-muted','Bookmarks only. Pins do not change AI instructions.'))
  for(const id of room.chatPins||[]){
   const m=referencedMessage(room.messages,id);if(!m)continue
   const row=el('div','mochi-pin-row'),jump=button(`${m.name}: ${quoteExcerpt(m.content)}`,'mochi-pin-jump')
   jump.title=`${m.name} · ${new Date(m.createdAt).toLocaleString()}`;jump.setAttribute('aria-label',`Go to pinned message by ${m.name}`);jump.onclick=()=>owner.jump(id)
   const remove=button('Unpin','lp-button');remove.disabled=owner.unavailable;remove.setAttribute('aria-label',`Unpin message by ${m.name}`);remove.onclick=()=>owner.mutate({action:'pin',messageId:id,pinned:false})
   row.append(jump,remove);root.append(row)
  }
  if(!(room.chatPins||[]).some(id=>referencedMessage(room.messages,id)))root.append(el('p','mochi-muted','No pinned messages.'))
  root.append(el('h3','','System Notes'),el('p','mochi-muted','Optional AI instructions, sent in listed order after dialogue. Save applies to future replies.'))
  const start=(note?:MochiSystemNote)=>{
   const value=note?{...note}:{title:'',body:'',enabled:true}
   owner.draft={note:value,revision:room.revision,baseline:JSON.stringify(value)};owner.setDraft(owner.draft);render();root.querySelector<HTMLInputElement>('[aria-label="System note title"]')?.focus()
  }
  if(owner.draft){
   const draft=owner.draft,form=el('form','mochi-note-editor')
   const title=el('input');title.maxLength=80;title.required=true;title.value=draft.note.title;title.setAttribute('aria-label','System note title');title.oninput=()=>{draft.note.title=title.value}
   const body=el('textarea');body.rows=6;body.maxLength=MAX_NOTE_BODY;body.required=true;body.value=draft.note.body;body.setAttribute('aria-label','System note body');body.oninput=()=>{draft.note.body=body.value}
   const enabled=el('input');enabled.type='checkbox';enabled.checked=draft.note.enabled;enabled.onchange=()=>{draft.note.enabled=enabled.checked}
   const active=el('label','','Enabled for future AI replies');active.prepend(enabled)
   const save=button('Save system note','lp-button');save.type='submit';save.disabled=owner.unavailable
   const cancel=button('Cancel editing','lp-button');cancel.type='button';cancel.onclick=()=>{
    if(JSON.stringify(draft.note)!==draft.baseline){const confirm=button('Discard note draft','lp-button');confirm.onclick=()=>{owner.draft=undefined;owner.setDraft(undefined);render()};cancel.replaceWith(confirm);confirm.focus()}
    else {owner.draft=undefined;owner.setDraft(undefined);render()}
   }
   const titleLabel=el('label','','Title');titleLabel.append(title);const bodyLabel=el('label','','Instructions');bodyLabel.append(body)
   form.append(titleLabel,bodyLabel,active,el('small','mochi-muted','System role · after dialogue (depth 0) · always when enabled. Unsaved text stays in this session when this panel closes.'),save,cancel)
   if(draft.revision!==room.revision){
    save.disabled=true
    const retry=button('Apply draft to refreshed chat','lp-button');retry.type='button';retry.disabled=owner.unavailable;retry.onclick=()=>{draft.revision=room.revision;render()}
    form.append(el('p','mochi-muted','The chat changed while this draft was open. Review the saved note below before applying your draft.'),el('p','',room.systemNotes?.find(n=>n.id===draft.note.id)?.body||'This is a new or no longer available note.'),retry)
   }
   form.onsubmit=e=>{e.preventDefault();if(!title.value.trim()||!body.value.trim())return;owner.mutate({action:'note_save',revision:draft.revision,noteId:draft.note.id,title:title.value,body:body.value,enabled:enabled.checked},true)}
   root.append(form)
  }else{
   for(const n of room.systemNotes||[]){
    const row=el('section','mochi-note-row');row.append(el('strong','',n.title),el('small','mochi-muted',n.enabled?'Enabled':'Disabled'),el('p','',quoteExcerpt(n.body,300)))
    const edit=button('Edit note','lp-button');edit.disabled=owner.unavailable;edit.setAttribute('aria-label',`Edit system note ${n.title}`);edit.onclick=()=>start(n)
    const toggle=button(n.enabled?'Disable note':'Enable note','lp-button');toggle.disabled=owner.unavailable;toggle.onclick=()=>owner.mutate({action:'note_save',noteId:n.id,title:n.title,body:n.body,enabled:!n.enabled})
    const remove=button('Delete note','lp-button');remove.disabled=owner.unavailable;remove.onclick=()=>{const confirm=button('Confirm delete note','lp-button');confirm.onclick=()=>owner.mutate({action:'note_delete',noteId:n.id,confirmed:true});remove.replaceWith(confirm);confirm.focus()}
    row.append(edit,toggle,remove);root.append(row)
   }
   const add=button('New system note','lp-button');add.disabled=owner.unavailable||(room.systemNotes||[]).length>=8;add.onclick=()=>start();root.append(add)
  }
 }
 render();return root
}
export const MOCHI_PIN_STYLES=mochiStyle('mochi-pin-styles')
