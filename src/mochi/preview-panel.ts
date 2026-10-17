import type {BlockDocument} from './prompt-blocks.js'
import {el,button,requestId} from '../frontend/shared.js'
import type {MochiRoom} from './types.js'
import type {previewContext} from './preview.js'
type Preview=Awaited<ReturnType<typeof previewContext>>['preview']
const scope=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
const fingerprint=(r:MochiRoom)=>JSON.stringify([r.revision,r.background?.presence,r.background?.enabled])
export class MochiPreview {
 open=false;data?:Preview;status='';scenario='continue';responder='auto'
 get isDraft():boolean{return !!this.draftBlocks}
 private expanded=new Set<string>()
 private draftBlocks?:BlockDocument
 private scope='';private snapshot='';private ticket='';private timer?:ReturnType<typeof setTimeout>
 constructor(private send:(p:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private returned:()=>void,private characterName:(id:string)=>string=id=>id){}
 reset():void{this.expanded.clear();this.cancel();this.open=false;this.draftBlocks=undefined;this.data=undefined;this.scope='';this.snapshot='';this.status='';this.scenario='continue';this.responder='auto'}
 private cancel():void{clearTimeout(this.timer);this.ticket=''}
 invalidate(message='Context changed. Refresh preview.'):void{this.cancel();this.data=undefined;this.status=message}
 sync(room:MochiRoom):void{if(this.scope&&this.scope!==scope(room)){this.reset();return}if(this.snapshot&&this.snapshot!==fingerprint(room))this.invalidate();this.scope=scope(room);this.snapshot=fingerprint(room)}
 show(room:MochiRoom,draftBlocks?:BlockDocument):void{this.sync(room);this.draftBlocks=draftBlocks?structuredClone(draftBlocks):undefined;this.open=true;this.refresh()}
 refresh():void{
  const room=this.current();if(!this.open||!room)return;this.sync(room);this.invalidate('Resolving prompt…');this.ticket=requestId('mochi_preview');const ticket=this.ticket
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.invalidate('Preview did not respond. Refresh to try again.');this.redraw()}},20000)
  this.redraw();try{this.send({type:'mochi:preview',requestId:ticket,roomId:room.id,accountId:room.accountId,scenario:this.scenario,responder:this.responder,...(this.draftBlocks?{draftBlocks:this.draftBlocks}:{})})}catch{this.invalidate('Preview is unavailable. Try refreshing.');this.redraw()}
 }
 receive(payload:any):boolean{
  if(payload?.type!=='mochi:preview'&&payload?.type!=='mochi:error')return false
  if(!this.ticket||payload.requestId!==this.ticket)return payload.type==='mochi:preview'
  const room=this.current();this.cancel()
  if(!this.open||!room||scope(room)!==this.scope||fingerprint(room)!==this.snapshot)return true
  if(payload.type==='mochi:error')this.invalidate(String(payload.message||'Preview failed. Refresh to try again.'))
  else if(payload.roomId===room.id&&payload.accountId===room.accountId&&payload.revision===room.revision&&payload.associationRevision===(room.associationRevision||0)){this.data=payload.preview;this.status='Resolved snapshot. Previewing does not contact the AI.'}
  else this.invalidate('Context changed. Refresh the conversation and preview.')
  this.redraw();return true
 }
 render(room:MochiRoom):HTMLElement{
  this.sync(room);const root=el('section','mochi-preview-panel');root.setAttribute('aria-label','AI prompt preview');root.append(el('h3','',this.draftBlocks?'Draft prompt preview — not applied':'AI prompt preview'))
  const controls=el('div','mochi-preview-controls'),scenario=el('select');scenario.setAttribute('aria-label','Preview scenario')
  for(const [value,label]of [['continue','Continue from saved history'],['automatic','Automatic reply to saved history']]){const option=el('option','',label);option.value=value;scenario.append(option)}scenario.value=this.scenario;scenario.onchange=()=>{this.scenario=scenario.value;this.refresh()}
  const responder=el('select');responder.setAttribute('aria-label','Preview responder');const auto=el('option','','Automatic speaker');auto.value='auto';responder.append(auto)
  for(const id of room.characterIds){const option=el('option','',room.settings?.characterNames[id]||this.characterName(id));option.value=id;responder.append(option)}responder.value=this.responder;responder.onchange=()=>{this.responder=responder.value;this.refresh()}
  const refresh=button('Refresh preview','lp-button');refresh.onclick=()=>this.refresh();const close=button(this.draftBlocks?'Back to preset draft':'Close preview','lp-button');close.onclick=()=>{this.cancel();this.open=false;this.redraw();this.returned()};controls.append(scenario,responder,refresh,close);root.append(controls)
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status)
  if(this.data){
   const data=this.data,b=data.budget
   const overview=el('div','mochi-preview-overview');overview.setAttribute('aria-label','Prompt overview')
   overview.append(el('span','',`${b.inputTokens} input tokens · ${b.remainingTokens} remaining`),el('span','',`${data.history.retained} / ${data.history.stored} history messages retained`))
   root.append(overview)
   if(data.preset)root.append(el('p','mochi-preview-identity',data.draft?'Unpublished draft · not applied':`${data.preset.name} · revision ${data.preset.revision}`))
   if(data.history.omitted)root.append(el('p','mochi-preview-warning',`${data.history.omitted} saved messages omitted by this preset; still stored.`))
   for(const assumption of data.assumptions.filter(a=>a.startsWith('Automatic replies are disabled')||a.startsWith('Current presence delays')))root.append(el('p','mochi-preview-warning',assumption))
   const informational=(data.warnings||[]).filter(w=>w==='Chat memory is absent, disabled or requires review; omitted.'&&!data.memory?.enabled)
   for(const warning of (data.warnings||[]).filter(w=>!informational.includes(w)))root.append(el('p','mochi-preview-warning',warning))
   const disclosure=(label:string,key=label)=>{const details=el('details','mochi-disclosure'),summary=el('summary','',label);summary.title=label;details.open=this.expanded.has(key);details.ontoggle=()=>{if(details.open)this.expanded.add(key);else this.expanded.delete(key)};details.append(summary);return details}
   // Group the actual resolved messages, exactly once. Legacy logical sections can
   // share message indexes, so they remain diagnostic mappings rather than copies.
   const groups:Array<{name:string;messages:Array<{index:number;role:string;content:string;section:string}>}>=[]
   for(const [index,message]of data.messages.entries()){
    const section=data.sections.find(s=>s.active&&s.providerMessages.includes(index)),full=section?.id||'Resolved message'
    const category=data.preset.blocks?.categories.find(c=>full.startsWith(c.name+' / '))
    const name=category?.name||(index===0?'Runtime instructions':index===data.messages.length-1?'Continuation':section?.id==='conversation_memory'?'Conversation memory':section?.id==='history'?'Conversation history':section?.id==='system_notes'?'System notes':'Resolved context')
    // Only merge adjacent messages: custom blocks may interleave categories at
    // different positions, and the displayed order must match provider order.
    let group=groups.at(-1);if(!group||group.name!==name){group={name,messages:[]};groups.push(group)}group.messages.push({index,role:message.role,content:message.content,section:full})
   }
   for(const [groupIndex,{name,messages}]of groups.entries()){const group=disclosure(`${name} · ${messages.length}`,`group:${groupIndex}:${name}`),body=el('div','mochi-preview-group')
    for(const message of messages){const short=message.section.split(' · ')[0].split(' / ').at(-1)||'Message',item=disclosure(`${short} · ${message.role}`,`message:${message.index}`);item.append(el('p','mochi-muted',`Provider message ${message.index+1} · ${message.role} · ${message.section}`),el('pre','mochi-preview-text',message.content));body.append(item)}
    group.append(body);root.append(group)
   }
   if(data.resolvedMacros?.length){const resolved=disclosure('Resolved macros');for(const macro of data.resolvedMacros)resolved.append(el('p','',macro));root.append(resolved)}
   const advanced=disclosure('Advanced diagnostics')
   advanced.append(el('p','',`Input ${b.inputTokens} · output reserve ${b.outputTokens} · envelope ${b.envelopeTokens} · budget ${b.contextTokens} · remaining ${b.remainingTokens}`),el('p','',`Host tokenizer: ${data.tokenization.tokenizerName||'not reported'}; ${data.tokenization.approximate===true?'approximate fallback':data.tokenization.approximate===false?'matched tokenizer; provider usage may differ':'precision not reported'}. Model: ${data.tokenization.model}`),el('p','',`${data.history.trimmed} trimmed from outgoing context; ${data.history.excluded||0} excluded by verified summary coverage. Range: ${data.history.firstId||'none'} → ${data.history.lastId||'none'}. Saved history is unchanged.`),el('p','',`Snapshot: ${data.resolvedAt||'not reported'}. Responder: ${data.responder||'not reported'}.`))
   if(data.memory)advanced.append(el('p','',`Conversation memory: ${data.memory.included?'included':'omitted'}; coverage ${data.memory.valid?'verified':'requires review'}.`))
   advanced.append(el('p','',`Preset: ${data.preset.id} · revision ${data.preset.revision} · ${data.preset.variant} · ${data.preset.layout}`),el('p','',`Explicit Mochi parameters: ${JSON.stringify(data.parameters)} · reasoning ${JSON.stringify(data.reasoning)}`))
   for(const text of informational)advanced.append(el('p','mochi-muted',text))
   for(const text of data.assumptions)advanced.append(el('p','',text))
   const sections=disclosure('Logical section mapping');for(const section of data.sections)sections.append(el('p','',`${section.id}: ${section.active?'active · '+section.providerMessages.map(i=>i+1).join(', '):'inactive / omitted'}`));advanced.append(sections);root.append(advanced)
  }
  return root
 }
}
export const MOCHI_PREVIEW_STYLES=`.mochi-view .mochi-preview-panel{min-width:0;min-height:0;max-height:40%;overflow:auto;flex:0 1 auto;padding:10px;border-bottom:1px solid var(--mochi-border);overflow-wrap:anywhere}.mochi-view .mochi-preview-controls{display:flex;flex-wrap:wrap;gap:6px;min-width:0}.mochi-view .mochi-preview-controls select{max-width:100%;min-width:0;background:var(--lp-surface-2,#ffffff0c);color:inherit;border:1px solid var(--mochi-border);padding:8px;border-radius:8px}.mochi-view .mochi-preview-panel button{min-height:40px}.mochi-view .mochi-preview-text{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;max-width:100%}.mochi-view .mochi-preview-panel :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}`
