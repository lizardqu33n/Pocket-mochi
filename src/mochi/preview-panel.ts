import {el,button,requestId} from '../frontend/shared.js'
import type {MochiRoom} from './types.js'
import type {previewContext} from './preview.js'
type Preview=Awaited<ReturnType<typeof previewContext>>['preview']
const scope=(r:MochiRoom)=>JSON.stringify([r.accountId||'',r.id,r.associationRevision||0])
const fingerprint=(r:MochiRoom)=>JSON.stringify([r.revision,r.background?.presence,r.background?.enabled])
export class MochiPreview {
 open=false;data?:Preview;status='';scenario='continue';responder='auto'
 private scope='';private snapshot='';private ticket='';private timer?:ReturnType<typeof setTimeout>
 constructor(private send:(p:any)=>void,private current:()=>MochiRoom|undefined,private redraw:()=>void,private returned:()=>void,private characterName:(id:string)=>string=id=>id){}
 reset():void{this.cancel();this.open=false;this.data=undefined;this.scope='';this.snapshot='';this.status='';this.scenario='continue';this.responder='auto'}
 private cancel():void{clearTimeout(this.timer);this.ticket=''}
 invalidate(message='Context changed. Refresh preview.'):void{this.cancel();this.data=undefined;this.status=message}
 sync(room:MochiRoom):void{if(this.scope&&this.scope!==scope(room)){this.reset();return}if(this.snapshot&&this.snapshot!==fingerprint(room))this.invalidate();this.scope=scope(room);this.snapshot=fingerprint(room)}
 show(room:MochiRoom):void{this.sync(room);this.open=true;this.refresh()}
 refresh():void{
  const room=this.current();if(!this.open||!room)return;this.sync(room);this.invalidate('Resolving prompt…');this.ticket=requestId('mochi_preview');const ticket=this.ticket
  this.timer=setTimeout(()=>{if(this.ticket===ticket){this.invalidate('Preview did not respond. Refresh to try again.');this.redraw()}},20000)
  this.redraw();try{this.send({type:'mochi:preview',requestId:ticket,roomId:room.id,accountId:room.accountId,scenario:this.scenario,responder:this.responder})}catch{this.invalidate('Preview is unavailable. Try refreshing.');this.redraw()}
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
  this.sync(room);const root=el('section','mochi-preview-panel');root.setAttribute('aria-label','AI prompt preview');root.append(el('h3','','AI prompt preview'))
  const controls=el('div','mochi-preview-controls'),scenario=el('select');scenario.setAttribute('aria-label','Preview scenario')
  for(const [value,label]of [['continue','Continue from saved history'],['automatic','Automatic reply to saved history']]){const option=el('option','',label);option.value=value;scenario.append(option)}scenario.value=this.scenario;scenario.onchange=()=>{this.scenario=scenario.value;this.refresh()}
  const responder=el('select');responder.setAttribute('aria-label','Preview responder');const auto=el('option','','Automatic speaker');auto.value='auto';responder.append(auto)
  for(const id of room.characterIds){const option=el('option','',room.settings?.characterNames[id]||this.characterName(id));option.value=id;responder.append(option)}responder.value=this.responder;responder.onchange=()=>{this.responder=responder.value;this.refresh()}
  const refresh=button('Refresh preview','lp-button');refresh.onclick=()=>this.refresh();const close=button('Close preview','lp-button');close.onclick=()=>{this.cancel();this.open=false;this.redraw();this.returned()};controls.append(scenario,responder,refresh,close);root.append(controls)
  const status=el('p','mochi-muted',this.status);status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status)
  if(this.data){
   const data=this.data,b=data.budget;root.append(el('p','',`Input ${b.inputTokens} · output reserve ${b.outputTokens} · envelope ${b.envelopeTokens} · budget ${b.contextTokens} · remaining ${b.remainingTokens}`),el('p','mochi-muted',`Host tokenizer: ${data.tokenization.tokenizerName||'not reported'}; ${data.tokenization.approximate===true?'approximate fallback':data.tokenization.approximate===false?'matched tokenizer; provider usage may differ':'precision not reported'}. Model: ${data.tokenization.model}`),el('p','',`${data.history.retained} of ${data.history.stored} saved messages retained; ${data.history.trimmed} trimmed from outgoing context. Range: ${data.history.firstId||'none'} → ${data.history.lastId||'none'}. Saved history is unchanged.`))
   if(data.history.omitted)root.append(el('p','mochi-preview-warning',`${data.history.omitted} saved messages omitted by the manual plan; they are still stored.`))
   root.append(el('p','mochi-muted',`Snapshot time: ${data.resolvedAt?new Date(data.resolvedAt).toLocaleString():'not reported'}. Responder: ${data.responder||'not reported'}.`))
   if(data.preset)root.append(el('p','mochi-preview-identity',`${data.preset.builtIn?'Built-in':'Custom'} preset: ${data.preset.name} · revision ${data.preset.revision} · ${data.preset.variant} · ${data.preset.layout==='manual-v1'?'Manual placement':'Automatic placement'}`),el('pre','mochi-preview-text',data.preset.appliedInstructions||'No additional preset instructions.'))
   for(const warning of data.warnings||[])root.append(el('p','mochi-preview-warning',warning))
   for(const text of data.assumptions)root.append(el('p','mochi-muted',text))
   root.append(el('p','',`Explicit Mochi parameters: ${JSON.stringify(data.parameters)} · reasoning ${JSON.stringify(data.reasoning)}`))
   const sections=el('details');sections.append(el('summary','','Logical sections (provider message numbers)'));for(const section of data.sections)sections.append(el('p','',`${section.id}: ${section.active?'active · '+section.providerMessages.map(i=>i+1).join(', '):'inactive / omitted'}`));root.append(sections)
   for(const [i,message]of data.messages.entries()){const block=el('details');block.append(el('summary','',`${i+1}. ${message.role}`),el('pre','mochi-preview-text',message.content));root.append(block)}
  }
  return root
 }
}
export const MOCHI_PREVIEW_STYLES=`.mochi-view .mochi-preview-panel{min-width:0;min-height:0;max-height:40%;overflow:auto;flex:0 1 auto;padding:10px;border-bottom:1px solid var(--mochi-border);overflow-wrap:anywhere}.mochi-view .mochi-preview-controls{display:flex;flex-wrap:wrap;gap:6px;min-width:0}.mochi-view .mochi-preview-controls select{max-width:100%;min-width:0;background:var(--lp-surface-2,#ffffff0c);color:inherit;border:1px solid var(--mochi-border);padding:8px;border-radius:8px}.mochi-view .mochi-preview-panel button{min-height:40px}.mochi-view .mochi-preview-text{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;max-width:100%}.mochi-view .mochi-preview-panel :focus-visible{outline:2px solid var(--mochi-accent);outline-offset:2px}`
