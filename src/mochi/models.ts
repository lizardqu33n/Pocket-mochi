import {mochiButton as button} from './ui/icon-slots.js'
import { el } from '../frontend/shared.js'

export interface MochiModelChoices { models: string[]; labels: Record<string,string> }

/** The host fetches provider metadata using the signed-in user's connection. */
export async function fetchMochiModels(connectionId: string, signal: AbortSignal): Promise<MochiModelChoices> {
  const response=await fetch(`/api/v1/connections/${encodeURIComponent(connectionId)}/models`,{credentials:'same-origin',cache:'no-store',signal})
  if(!response.ok)throw new Error('Could not load models. Check this connection in Lumiverse and retry.')
  const payload=await response.json()
  if(payload.error||!Array.isArray(payload.models))throw new Error('Could not load models. Check this connection in Lumiverse and retry.')
  return {models:[...new Set<string>(payload.models.filter((id:unknown)=>typeof id==='string'&&id.length>0))],labels:payload.model_labels&&typeof payload.model_labels==='object'?payload.model_labels:{}}
}

export function mochiModelPicker(connectionId:string,defaultModel:string,value:string,change:(value:string)=>void,cache:Map<string,MochiModelChoices>,controllers:Set<AbortController>):HTMLElement {
  const root=el('div','mochi-model-picker'),label=el('label','','Model'),row=el('div','mochi-model-picker-row'),select=el('select'),refresh=button('Refresh models','lp-button'),status=el('p','mochi-muted')
  select.setAttribute('aria-label','Generation model');refresh.setAttribute('aria-label','Refresh models');status.setAttribute('role','status')
  let current=value,controller:AbortController|undefined
  const populate=(choices?:MochiModelChoices)=>{
    const fallback=el('option','',defaultModel?`Connection default · ${defaultModel}`:'Use connection default');fallback.value='';select.replaceChildren(fallback)
    const ids=[...choices?.models||[]];if(current&&!ids.includes(current))ids.unshift(current)
    for(const id of ids){const option=el('option','',choices?.labels[id]||id);option.value=id;select.append(option)}
    select.value=current;select.disabled=!connectionId
  }
  const load=async()=>{
    controller?.abort();controller=new AbortController();const request=controller;controllers.add(request)
    const timeout=setTimeout(()=>request.abort(),30000)
    refresh.disabled=true;status.textContent='Loading models…'
    try{const choices=await fetchMochiModels(connectionId,request.signal);if(request.signal.aborted)return;cache.set(connectionId,choices);if(root.isConnected&&!request.signal.aborted){populate(choices);status.textContent=choices.models.length?'':'No models returned. You can still use the connection default.'}}
    catch{if(root.isConnected)status.textContent='Could not load models. Check this connection in Lumiverse and retry.'}
    finally{clearTimeout(timeout);controllers.delete(request);if(root.isConnected)refresh.disabled=!connectionId}
  }
  select.onchange=()=>{current=select.value;change(current)};refresh.onclick=()=>{void load()}
  label.append(select);row.append(label,refresh);root.append(row,status);populate(cache.get(connectionId));refresh.disabled=!connectionId
  if(connectionId&&!cache.has(connectionId))void load()
  return root
}
