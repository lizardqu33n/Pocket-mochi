import {LUCIDE} from './lucide.js'
import {MOCHI_ICON_ASSETS} from './icon-assets.js'

const LIMIT=131072
const tags=new Set(['svg','g','path','circle','ellipse','rect','line','polyline','polygon'])
const attrs=new Set(['xmlns','viewBox','width','height','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','fill-rule','clip-rule','opacity','fill-opacity','stroke-opacity','transform','d','cx','cy','r','rx','ry','x','y','x1','x2','y1','y2','points'])
/** Strict static shape subset. Never insert owner markup into the live DOM. */
export function iconSVGData(svg:string):string|undefined {
 if(typeof svg!=='string'||svg.length>LIMIT||/<!|<\?|&/.test(svg))return
 const doc=new DOMParser().parseFromString(svg,'image/svg+xml'),root=doc.documentElement
 if(root.localName!=='svg'||doc.querySelector('parsererror')||!root.hasAttribute('viewBox'))return
 for(const n of [root,...root.querySelectorAll('*')]){
  if(!tags.has(n.tagName)||n.namespaceURI!=='http://www.w3.org/2000/svg')return
  for(const a of n.attributes){
   if(!attrs.has(a.name)||a.name==='xmlns'&&a.value!=='http://www.w3.org/2000/svg')return
   if(a.name!=='xmlns'&&(/url\s*\(|[<>:;\\]|(?:script|https?|data)\s*:/i.test(a.value)))return
  }
 }
 return 'data:image/svg+xml,'+encodeURIComponent(new XMLSerializer().serializeToString(root))
}
export function safeIconData(value:string):string|undefined {
 if(typeof value!=='string'||value.length>LIMIT)return
 const m=/^data:image\/(svg\+xml|png|jpeg|webp);?(base64)?,([\s\S]+)$/i.exec(value)
 if(!m)return
 try{
  if(m[1].toLowerCase()==='svg+xml')return iconSVGData(m[2]?atob(m[3]):decodeURIComponent(m[3]))
  if(m[2]&&/^[A-Za-z0-9+/]+={0,2}$/.test(m[3]))return value
 }catch{/* malformed encoding retains Lucide */}
}
export function iconAssetData(value:{svg:string}|{data:string}):string|undefined {
 if(!value||typeof value!=='object')return
 return 'svg'in value?iconSVGData(value.svg):safeIconData(value.data)
}
function cssAsset(raw:string):string|undefined {
 const m=/^url\(\s*(['"])(data:[\s\S]+)\1\s*\)$/.exec(raw.trim())
 return m?safeIconData(m[2]):undefined
}

/** Retains the Phase 1 .mochi-icon-slot and data-mochi-icon-slot hooks. */
export function mochiIcon(icon:string,slot=icon):HTMLSpanElement {
 if(!/^[a-z][a-z0-9-]*$/.test(slot))throw Error('Invalid Mochi icon slot')
 const node=document.createElement('span');node.className='mochi-icon-slot';node.dataset.mochiIconSlot=icon;node.dataset.mochiIconAction=slot
 node.setAttribute('aria-hidden','true')
 // Only verified, repository-owned Lucide markup crosses this boundary.
 node.innerHTML=(LUCIDE[icon]||LUCIDE.refresh).replace(/>\s+</g,'><').trim()
 const svg=node.querySelector('svg')!;svg.setAttribute('data-mochi-icon',icon);svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false')
 const image=document.createElement('img');image.className='mochi-icon-replacement';image.alt='';image.draggable=false;image.hidden=true;node.append(image)
 let generation=0,last=''
 const refresh=()=>{
  if(!node.isConnected)return
  const style=node.ownerDocument.defaultView?.getComputedStyle(node)
  // Explicit v2 pseudo-content overrides retain their existing presentation.
  const legacy=slot==='disclosure'?['--mochi-v2-detailsdisclosure-summary-after-content']:slot==='selected'?node.closest('.mochi-settings-categories')?['--mochi-v2-settings-categories-button-aria-pressed-true-after-content']:['--mochi-v2-character-picker-choice-aria-pressed-true-after-content','--mochi-v2-choice-aria-pressed-true-after-content']:[]
  node.dataset.mochiLegacyGlyph=String(legacy.some(token=>!!style?.getPropertyValue(token).trim()))
  const css=style?.getPropertyValue('--mochi-icon-'+slot+'-image').trim()||''
  const asset=MOCHI_ICON_ASSETS[slot]
  const source=css&&css!=='none'?cssAsset(css):asset?iconAssetData(asset):undefined
  const key=(source||'')+'|'+css
  if(last===key)return;last=key;const ticket=++generation
  // Always restore the original before trying a new candidate.
  node.dataset.mochiIconState=css&&css!=='none'||asset?'fallback':'default';image.hidden=true;svg.removeAttribute('hidden')
  image.removeAttribute('src')
  if(!source)return
  image.onload=()=>{if(ticket===generation&&image.naturalWidth&&image.naturalHeight){image.hidden=false;svg.setAttribute('hidden','');node.dataset.mochiIconState='custom'}}
  image.onerror=()=>{if(ticket===generation){image.hidden=true;svg.removeAttribute('hidden');node.dataset.mochiIconState='fallback'}}
  image.src=source
 }
 // Views are built detached, then mounted synchronously. No document-wide
 // observer, provider calls, fetches or persistent registration is needed.
 const schedule=()=>{if(typeof requestAnimationFrame==='function')requestAnimationFrame(refresh);else queueMicrotask(refresh)}
 schedule();node.addEventListener('mochi:icons-refresh',refresh)
 return node
}

/** Re-read CSS after a runtime theme edit, if the owner changes CSS in place. */
export function refreshMochiIcons(root:ParentNode):void {
 for(const slot of root.querySelectorAll('[data-mochi-icon-slot]'))slot.dispatchEvent(new slot.ownerDocument.defaultView!.Event('mochi:icons-refresh'))
}

const glyphs:Record<string,string>={'×':'close','✕':'close','↑':'up','↓':'down','⋯':'more','⠿':'drag','□':'maximize','◢':'resize'}
// Stable semantic families, independent of user names, IDs and localized content.
export const TEXT_ACTIONS: Array<[RegExp,string,string]>=[
 [/^(?:Back|Return to)/i,'back','back'],[/^Close|^Done$|^Cancel/i,'close','close'],
 [/^Refresh|^Retry|^Restore/i,'refresh','refresh'],[/^Save|^Publish|^Apply|^Confirm apply|^Use selected/i,'save','save'],
 [/^Delete|^Remove|^Confirm delete|^Discard/i,'trash','delete'],[/^New |^Create |^\+ Add|^Add /i,'plus','add'],
 [/^Edit|^Rename|^Customize/i,'edit','edit'],[/^Duplicate|^Copy/i,'copy','copy'],
 [/^Search/i,'search','search'],[/^Move .* up$/i,'up','up'],[/^Move .* down$/i,'down','down'],
 [/^.*[Ss]ettings|^Advanced$/,'settings','settings'],[/^Presets|^AI & Replies$/,'sliders','presets'],
 [/^Preview/i,'eye','preview'],[/^Memory & Context$|^Conversation Memory$/,'brain','memory'],
 [/^Pins & Notes$/,'pin','notes'],[/^Participants$/,'people','participants'],[/^Notifications$/,'notifications','notifications'],
 [/^Accessibility$/,'accessibility','accessibility'],[/^Appearance$/,'palette','appearance'],
 [/^Toolbar$/,'panel','toolbar'],[/^Availability & Schedules$/,'calendar','availability'],
 [/^General$/,'info','general'],[/^Archive/i,'archive','archive'],[/^Export/i,'download','export'],[/^Import/i,'upload','import'],
]
/** Text buttons keep their default layout; existing symbol controls use Lucide. */
export function mochiButton(label:string,className='lp-button'):HTMLButtonElement {
 const node=document.createElement('button');node.type='button';node.className=className
 const icon=glyphs[label]
 if(icon){node.setAttribute('aria-label',({up:'Move up',down:'Move down',more:'More actions',close:'Close'} as Record<string,string>)[icon]||icon);node.append(mochiIcon(icon));node.dataset.mochiAction=icon}
 else if(label.startsWith('← ')){node.append(mochiIcon('back'),document.createTextNode(label.slice(2)));node.dataset.mochiAction='back'}
 else if(label.startsWith('+ ')){node.setAttribute('aria-label',label);node.append(mochiIcon('plus','add'),document.createTextNode(label.slice(2)));node.dataset.mochiAction='add'}
 else {
  node.textContent=label
  const entry=TEXT_ACTIONS.find(([pattern])=>pattern.test(label))
  if(entry){const slot=mochiIcon(entry[1],entry[2]);slot.dataset.mochiOptional='true';node.prepend(slot);node.dataset.mochiAction=entry[2]}
 }
 if(/(?:^|\s)mochi-(?:choice|category-tab)(?:\s|$)/.test(className)){const selected=mochiIcon('check','selected');selected.dataset.mochiSelectedIndicator='true';node.append(selected)}
 return node
}

/** Replaces the custom CSS chevron, leaving native details behavior intact. */
export function mochiDisclosureIcon(details:HTMLElement):void {
 const summary=details.querySelector(':scope > summary')
 if(summary&&!summary.querySelector('[data-mochi-icon-action="disclosure"]'))summary.append(mochiIcon('chevron','disclosure'))
}
