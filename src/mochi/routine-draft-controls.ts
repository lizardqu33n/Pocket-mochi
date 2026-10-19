import {textingControls} from './texting-controls.js'
import {defaultMochiSettings} from './types.js'
import {el} from '../frontend/shared.js'
import {mochiButton as button} from './ui/icon-slots.js'
import {routineControls} from './routine-controls.js'
import {parseRoutineDraft,type RoutineDraft} from './routine-generation.js'
import {planFor} from './routines.js'
import type {MochiRoom} from './types.js'
export class RoutineDraftControls {
 constructor(private redraw:()=>void){}
 private drafts=new Map<string,{requestId?:string;draftId?:string;revision:number;raw:string;draft?:RoutineDraft;error:string;guidance:string;history:boolean;timezone:string;running?:boolean}>()
 private key(room:MochiRoom,id:string){return JSON.stringify([room.accountId,room.id,id])}
 receive(p:any):boolean {
  if(p.type!=='mochi:routine_draft'&&p.type!=='mochi:routine_error')return false
  const key=JSON.stringify([p.accountId,p.roomId,p.characterId]),d=this.drafts.get(key)
  if(!d||d.requestId!==p.requestId||d.revision!==p.revision)return true
  if(p.type==='mochi:routine_error'){d.running=false;d.error=p.message;return true}
  d.running=false;d.draftId=p.draftId;d.raw=p.raw;d.draft=p.draft;d.error='';return true
 }
 render(room:MochiRoom,id:string,name:string,send:(type:string,p:any)=>void):HTMLElement {
  const key=this.key(room,id);let draft=this.drafts.get(key)
  if(!draft||draft.revision!==room.revision){draft={revision:room.revision,raw:'',error:'',guidance:'',history:false,timezone:planFor(room,id)?.timezone||'UTC'};this.drafts.set(key,draft)}
  const d=draft,root=el('section','mochi-routine-generation');root.dataset.mochiRoutine='generation';root.append(el('h4','','AI schedule and texting style · '+name))
  const field=(text:string,node:HTMLElement)=>{const l=el('label','',text);node.setAttribute('aria-label',text+' for '+name);l.append(node);root.append(l)}
  const guidance=el('textarea');guidance.maxLength=2000;guidance.value=d.guidance;guidance.disabled=!!d.running;guidance.oninput=()=>{d.guidance=guidance.value};field('Schedule guidance',guidance)
  const history=el('input');history.type='checkbox';history.checked=d.history;history.disabled=!!d.running;history.onchange=()=>{d.history=history.checked};field('Approve including the last 20 messages from this Mochi chat in this generation',history)
  root.append(el('p','mochi-muted','Generate sends this character’s description, personality, guidance and chosen timezone to the saved chat connection. Chat history is included only with the checkbox above. A preview is never saved automatically.'))
  const zone=el('input');zone.value=d.timezone;zone.oninput=()=>{d.timezone=zone.value};zone.disabled=!!d.running;field('Generation timezone',zone)
  const error=el('p','mochi-error');error.setAttribute('role','alert');error.textContent=d.error
  const preview=el('div','mochi-routine-draft-preview');preview.setAttribute('aria-label','Schedule preview for '+name)
  const raw=el('textarea');raw.maxLength=20000;raw.rows=5;raw.disabled=!!d.running;raw.value=d.raw;raw.oninput=()=>{d.raw=raw.value;d.draft=undefined;preview.replaceChildren()};field('Compact schedule JSON',raw)
  const draw=()=>{preview.replaceChildren();if(d.draft){preview.append(routineControls(d.draft.plan,'draft '+name));const settings=defaultMochiSettings();settings.textingStyles={[id]:d.draft.texting||{}};const styles=textingControls(settings,id,'draft '+name);const update=()=>{if(d.draft)d.draft.texting=settings.textingStyles?.[id]};styles.addEventListener('input',update);styles.addEventListener('change',update);preview.append(styles)}}
  draw()
  const generate=button(d.draftId?'Regenerate schedule for '+name:'Generate schedule for '+name);generate.disabled=!!d.running;generate.onclick=()=>{d.running=true;const requestId='routine_'+crypto.randomUUID().replaceAll('-','');d.requestId=requestId;d.draftId=undefined;d.draft=undefined;preview.replaceChildren();send('mochi:routine_generate',{requestId,roomId:room.id,characterId:id,revision:room.revision,guidance:d.guidance,timezone:zone.value,includeHistory:d.history,historyConfirmed:d.history});this.redraw()}
  const parse=button('Preview edited schedule for '+name);parse.disabled=!!d.running;parse.onclick=()=>{try{d.draft=parseRoutineDraft(d.raw,planFor(room,id));d.error='';error.textContent='';draw();if(!d.draftId){const requestId='routine_'+crypto.randomUUID().replaceAll('-','');d.requestId=requestId;send('mochi:routine_parse',{requestId,roomId:room.id,characterId:id,revision:room.revision,raw:d.raw})}}catch(e){d.error=(e as Error).message;error.textContent=d.error}}
  const apply=button('Apply reviewed schedule and texting style for '+name);apply.disabled=!!d.running;apply.onclick=()=>{if(!d.draft||!d.draftId){error.textContent='Generate or preview valid JSON before applying.';return}send('mochi:routine_apply',{roomId:room.id,characterId:id,revision:room.revision,draftId:d.draftId,confirmed:true,plan:d.draft.plan,texting:d.draft.texting})}
  const reject=button('Reject schedule draft for '+name);reject.onclick=()=>{if(d.requestId)send('mochi:routine_reject',{roomId:room.id,characterId:id,revision:room.revision,draftId:d.draftId,attemptId:d.requestId});d.running=false;d.requestId=undefined;d.draftId=undefined;d.draft=undefined;d.raw='';raw.value='';preview.replaceChildren()}
  const stop=button('Stop schedule generation for '+name);stop.disabled=!d.running;stop.onclick=()=>{if(d.requestId){send('mochi:cancel',{roomId:room.id,requestId:d.requestId});d.running=false;d.requestId=undefined;this.redraw()}}
  const status=el('p','mochi-muted',d.running?'Generating schedule preview…':'');status.setAttribute('role','status');root.append(status,generate,stop,parse,reject,preview,apply,error);return root
 }
}
