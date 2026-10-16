import type {Placement} from './macros.js'
export type BlockRole='system'|'user'|'assistant'
export type BlockPosition='before-history'|'history'|'after-history'
export interface PromptBlock {id:string;name:string;content:string;role:BlockRole;position:BlockPosition;audience:'all'|'dm'|'group';enabled:boolean;locked:boolean}
export interface PromptCategory {id:string;name:string;collapsed:boolean;blocks:PromptBlock[]}
export interface BlockDocument {version:1;categories:PromptCategory[]}
export const blockId=(kind='block')=>kind+'_'+crypto.randomUUID().replaceAll('-','')
const expression=/\{\{\s*([^{}]*?)\s*\}\}/g
export function validateBlocks(value:unknown):BlockDocument {
 const doc=value as BlockDocument,ids=new Set<string>();let count=0,size=0
 const text=(v:unknown,max:number,required=false)=>typeof v==='string'&&v.length<=max&&(!required||!!v.trim())
 if(!doc||doc.version!==1||!Array.isArray(doc.categories)||doc.categories.length>12||Object.keys(doc).some(k=>!['version','categories'].includes(k)))throw Error('Invalid block document; saved revisions were preserved.')
 for(const c of doc.categories){
  if(!c||!/^category_[a-f0-9]{32}$/.test(c.id)||ids.has(c.id)||!text(c.name,80,true)||typeof c.collapsed!=='boolean'||!Array.isArray(c.blocks)||Object.keys(c).some(k=>!['id','name','collapsed','blocks'].includes(k)))throw Error('Invalid prompt category.')
  ids.add(c.id)
  for(const b of c.blocks){
   if(!b||!/^block_[a-f0-9]{32}$/.test(b.id)||ids.has(b.id)||!text(b.name,80,true)||!text(b.content,8000)||!['system','user','assistant'].includes(b.role)||!['before-history','history','after-history'].includes(b.position)||!['all','dm','group'].includes(b.audience)||typeof b.enabled!=='boolean'||typeof b.locked!=='boolean'||Object.keys(b).some(k=>!['id','name','content','role','position','audience','enabled','locked'].includes(k)))throw Error('Invalid prompt block.')
   ids.add(b.id);count++;size+=b.content.length
   if(/[{}]{2}/.test(b.content.replace(expression,'')))throw Error('Unbalanced macro expression in '+b.name+'.')
   for(const m of b.content.matchAll(expression))if(['mochi_history','mochi_system_notes'].includes(m[1].trim())&&b.content.trim()!==m[0])throw Error('History and system notes each require their own block.')
   if(/\{\{\s*mochi_history\s*\}\}/.test(b.content)&&b.position!=='history')throw Error('Chat History must use the At chat history position.')
  }
 }
 if(count>60||size>48000)throw Error('Preset exceeds 60 blocks or 48,000 content characters.')
 return structuredClone(doc)
}
export const MACRO_REFERENCE=[
 {name:'Character information',syntax:'{{mochi_characters}}',description:'Eligible character IDs, names and descriptions. Not just a character name.',source:'Mochi',context:'Authorized room characters'},
 {name:'Persona information',syntax:'{{mochi_persona}}',description:'Saved identity plus enabled account add-on context, once.',source:'Mochi',context:'Saved room identity; matching account selections'},
 {name:'Room information',syntax:'{{mochi_room}}',description:'The saved room title.',source:'Mochi blocks',context:'Current room'},
 {name:'Room instructions',syntax:'{{mochi_room_instructions}}',description:'Saved room instructions, including supported persona outlets.',source:'Mochi',context:'Current room settings'},
 {name:'Character texting preferences',syntax:'{{mochi_texting_styles}}',description:'Resolved character texting preferences; does not alter saved preferences.',source:'Mochi',context:'Room character preferences'},
 {name:'Chat history',syntax:'{{mochi_history}}',description:'Structured dialogue with original roles. Use alone in a block at the history position.',source:'Mochi',context:'Current room history'},
 {name:'System notes',syntax:'{{mochi_system_notes}}',description:'Enabled saved notes with their system role. Use alone in a block.',source:'Mochi',context:'Current room notes'},
 {name:'Chat memory',syntax:'{{mochi_summary}}',description:'Verified enabled memory as untrusted user-role reference. Use alone in a block.',source:'Mochi',context:'Valid enabled room memory'},
 {name:'Persona add-on outlet',syntax:'{{persona_outlet::name}}',description:'Enabled named native persona outlet. Replace name with its outlet name. Alias: {{personaOutlet::name}}.',source:'Lumiverse-compatible bounded reference',context:'Enabled matching account add-on with a named outlet'},
 {name:'Native character name (unsupported)',syntax:'{{char}}',description:'Requires the native active-scene macro environment; unavailable in independent Mochi generation. Kept literal with a diagnostic.',source:'Unsupported native host context',context:'Not available here'},
]
export interface BlockTemplate {name:string;category:string;description:string;content:string;audience?:PromptBlock['audience'];position?:BlockPosition}
export const BLOCK_TEMPLATES:BlockTemplate[]=[
 {name:'Blank block',category:'Custom',description:'Write your own instructions.',content:''},
 {name:'Base Messaging',category:'Core Instructions',description:'A private, conversation-first messenger.',content:'Write as the eligible character in a private messenger. Use only the supplied context. Do not invent an external shared scene or speak for the user.'},
 {name:'Direct Message Behavior',category:'Core Instructions',description:'Focused one-to-one replies.',content:'Respond to the other person directly. Follow the thread naturally and leave room for their next message.',audience:'dm'},
 {name:'Group Chat Behavior',category:'Core Instructions',description:'Selective participation in a group.',content:'Let relevant speakers contribute naturally. Avoid round-robin replies, repeated points, and making every participant speak.',audience:'group'},
 {name:'Character Information',category:'Character & Persona',description:'Include authorized character information once.',content:'CHARACTERS: {{mochi_characters}}'},
 {name:'Persona Information',category:'Character & Persona',description:'Include the saved identity and enabled non-outlet add-ons once.',content:'USER IDENTITY: {{mochi_persona}}'},
 {name:'Persona Add-on References',category:'Character & Persona',description:'Place a named enabled add-on; replace name with your outlet name.',content:'{{persona_outlet::name}}'},
 {name:'Character Texting Preferences',category:'Character & Persona',description:'Reuse saved character preferences.',content:'{{mochi_texting_styles}}'},
 {name:'Casual Dialogue',category:'Writing & Texting',description:'Conversational phrasing without forcing slang.',content:'Use relaxed, natural dialogue appropriate to the character. Avoid unnecessary exposition and formulaic closing questions.'},
 {name:'Short Replies',category:'Writing & Texting',description:'Prefer concise messages when the moment allows.',content:'Prefer a short reply that adds something meaningful. Expand only when the conversation needs detail.'},
 {name:'Texting Style',category:'Writing & Texting',description:'Adapt to the character and conversational pace.',content:'Use messaging rhythm and punctuation that suit the character. Do not force abbreviations, emojis, or narration into every reply.'},
 {name:'Expressive Dialogue',category:'Writing & Texting',description:'Convey personality through the reply.',content:'Show emotion and personality through word choice and rhythm. Keep expressive flourishes relevant and avoid repeating the same mannerisms.'},
 ...['1990s','2000s','2010s','2020s'].map(era=>({name:era,category:'Time & Setting',description:'Optional era guidance; edit for your setting.',content:`When consistent with the supplied setting, use everyday references and communication habits plausible for the ${era}. Do not override established facts or assume every character shares the same culture or technology.`})),
 {name:'Chat Memory',category:'Conversation Context',description:'Include verified conversation memory once.',content:'{{mochi_summary}}'},
 {name:'Room Information',category:'Conversation Context',description:'Include room title and separate room instructions.',content:'ROOM: {{mochi_room}}\nROOM INSTRUCTIONS: {{mochi_room_instructions}}'},
 {name:'System Notes',category:'Conversation Context',description:'Include enabled saved room notes.',content:'{{mochi_system_notes}}',position:'after-history'},
 {name:'Supported Context References',category:'Conversation Context',description:'Keep structured saved dialogue in the history slot.',content:'{{mochi_history}}',position:'history'},
]
export function fromTemplate(t:BlockTemplate):PromptBlock{return{id:blockId(),name:t.name,content:t.content,role:'system',position:t.position||'before-history',audience:t.audience||'all',enabled:true,locked:false}}
export function starterBlocks():BlockDocument {
 const names=['Base Messaging','Direct Message Behavior','Group Chat Behavior','Character Information','Persona Information','Character Texting Preferences','Room Information','Chat Memory','Supported Context References','System Notes'],categories:PromptCategory[]=[]
 for(const name of names){const t=BLOCK_TEMPLATES.find(t=>t.name===name)!;let c=categories.find(c=>c.name===t.category);if(!c){c={id:blockId('category'),name:t.category,collapsed:false,blocks:[]};categories.push(c)}c.blocks.push(fromTemplate(t))}
 return{version:1,categories}
}
export function convertLegacy(r:{layout:string;dmInstructions:string;groupInstructions:string;placement?:Placement}):BlockDocument {
 const doc=starterBlocks()
 if(r.layout==='manual-v1')doc.categories=doc.categories.filter(c=>c.name==='Core Instructions').concat([{id:blockId('category'),name:'Previous context rows',collapsed:false,blocks:r.placement!.rows.map(row=>({...fromTemplate({name:row.title,category:'',description:'',content:row.template,position:'history'}),role:row.template.trim()==='{{mochi_summary}}'?'user':'system'}))}])
 const core=doc.categories[0];core.blocks=core.blocks.filter(b=>b.name==='Base Messaging')
 for(const [name,content,audience] of [['DM instructions',r.dmInstructions,'dm'],['Group instructions',r.groupInstructions,'group']] as const)if(content)core.blocks.push({...fromTemplate({name,content,category:'',description:''}),audience})
 return doc
}
type Message={role:BlockRole;content:string}
export function composeBlocks(document:BlockDocument,values:Record<string,string>,history:Message[],notes:Message[],outlets:Record<string,string>,variant:'dm'|'group') {
 const doc=validateBlocks(document),seen=new Set<string>(),warnings:string[]=[],resolved:string[]=[],messages:Message[]=[],sections:Array<{id:string;active:boolean;providerMessages:number[]}>=[]
 const flat=doc.categories.flatMap(c=>c.blocks.map(b=>({c,b})))
 const ordered=['before-history','history','after-history'].flatMap(pos=>flat.filter(({b})=>b.position===pos))
 for(const {c,b} of ordered){
  const title=`${c.name} / ${b.name} · ${b.role} · ${b.position} · ${b.audience}`,start=messages.length
  if(!b.enabled||b.audience!=='all'&&b.audience!==variant){sections.push({id:title+(!b.enabled?' · disabled':' · other conversation type'),active:false,providerMessages:[]});continue}
  const tokens=[...b.content.matchAll(expression)],standalone=tokens.length===1&&b.content.trim()===tokens[0][0],name=standalone?tokens[0][1].trim():'',already=seen.has(name)
  const content=b.content.replace(expression,(literal,key:string)=>{
   key=key.trim();const outlet=/^(?:persona_outlet|personaOutlet)::(.+)$/i.exec(key),normalized=outlet?'persona_outlet::'+outlet[1].trim().toLowerCase():key
   if(seen.has(normalized)){warnings.push(`Duplicate ${normalized} in ${b.name}; included only once.`);return ''}
   if(outlet){seen.add(normalized);const value=outlets[outlet[1].trim().toLowerCase()];if(typeof value!=='string'){warnings.push(`Missing or disabled ${literal} in ${b.name}; omitted.`);return ''}resolved.push(literal+' · '+b.name);return value}
   if(!Object.hasOwn(values,key)&&!['mochi_history','mochi_system_notes'].includes(key)){warnings.push(`Unsupported ${literal} in ${b.name}; kept literal.`);return literal}
   if(key==='mochi_summary'&&!standalone){warnings.push(`Memory in ${b.name} requires a standalone block; omitted.`);return ''}
   seen.add(key);resolved.push(literal+' · '+b.name)
   if(key==='mochi_summary'&&!values[key])warnings.push('Chat memory is absent, disabled or requires review; omitted.')
   if(key==='mochi_room_instructions')return (values[key]||'').replace(/\{\{\s*(?:persona_outlet|personaOutlet)::([^{}]*?)\s*\}\}/gi,(literal,name:string)=>{const token='persona_outlet::'+name.trim().toLowerCase();if(seen.has(token)){warnings.push(`Duplicate ${token}; included only once.`);return ''}seen.add(token);const value=outlets[name.trim().toLowerCase()];if(typeof value!=='string'){warnings.push(`Missing or disabled ${literal}; omitted.`);return ''}resolved.push(literal+' · room instructions');return value})
   return values[key]||''
  })
  if(name==='mochi_history'&&!already)messages.push(...history)
  else if(name==='mochi_system_notes'&&!already)messages.push(...notes)
  else if(content.trim())messages.push({role:name==='mochi_summary'?'user':b.role,content})
  sections.push({id:title,active:messages.length>start,providerMessages:Array.from({length:messages.length-start},(_,i)=>start+i+1)})
 }
 for(const key of ['mochi_characters','mochi_persona','mochi_history'])if(!seen.has(key))warnings.push(`Optional ${key} omitted by this preset; source data is still stored.`)
 if(values.mochi_summary&&!seen.has('mochi_summary'))warnings.push('Optional chat memory omitted; covered history cannot be excluded.')
 return{messages,sections,warnings,resolved,historyIncluded:seen.has('mochi_history'),summaryIncluded:seen.has('mochi_summary')&&Boolean(values.mochi_summary)}
}
