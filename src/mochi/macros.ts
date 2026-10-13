export const CONTEXT_MACROS=['mochi_characters','mochi_persona','mochi_room_instructions','mochi_texting_styles','mochi_system_notes','mochi_history','mochi_summary'] as const
export interface PlacementRow {id:string;title:string;template:string}
export interface Placement {version:1;rows:PlacementRow[]}
const expression=/\{\{\s*([^{}]*?)\s*\}\}/g
export function validatePlacement(value:unknown):Placement {
 const p=value as Placement
 if(!p||p.version!==1||!Array.isArray(p.rows)||p.rows.length>12||Object.keys(p).some(k=>!['version','rows'].includes(k)))throw Error('Invalid manual context plan.')
 const ids=new Set<string>();let size=0
 for(const row of p.rows){
  if(!row||!/^section_[a-f0-9]{32}$/.test(row.id)||ids.has(row.id)||typeof row.title!=='string'||!row.title.trim()||row.title.length>80||typeof row.template!=='string'||row.template.length>2000||Object.keys(row).some(k=>!['id','title','template'].includes(k)))throw Error('Invalid manual context row.');ids.add(row.id);size+=row.template.length
  if(/[{}]{2}/.test(row.template.replace(expression,'')))throw Error('Unbalanced macro expression.')
  for(const match of row.template.matchAll(expression))if(['mochi_history','mochi_system_notes'].includes(match[1].trim())&&row.template.trim()!==match[0])throw Error('History and system notes must each occupy a standalone row.')
 }
 if(size>8000)throw Error('Manual context plan is too large.')
 return p
}
export function expandPlacement(p:Placement,values:Record<string,string>,history:Array<{role:'system'|'user'|'assistant';content:string}>,notes:Array<{role:'system';content:string}>){
 validatePlacement(p);const seen=new Set<string>(),warnings:string[]=[],messages:Array<{role:'system'|'user'|'assistant';content:string}>=[],sections:Array<{id:string;active:boolean;providerMessages:number[]}>=[]
 for(const row of p.rows){
  const tokens=[...row.template.matchAll(expression)],standalone=tokens.length===1&&row.template.trim()===tokens[0][0],name=standalone?tokens[0][1].trim():''
  const start=messages.length,already=seen.has(name)
  const content=row.template.replace(expression,(literal,key:string)=>{
   key=key.trim();if(!CONTEXT_MACROS.includes(key as any)){warnings.push(`Unknown expression ${literal}; kept literal.`);return literal}
   if(seen.has(key)){warnings.push(`Duplicate ${key}; expanded only once.`);return ''}seen.add(key)
   if(key==='mochi_summary'){if(!standalone){warnings.push('Summary requires a standalone row; inline placeholders remain inactive.');seen.delete(key);return ''}if(!values[key])warnings.push('Summary is inactive: absent, disabled or coverage requires review.');return values[key]||''}
   return values[key]||''
  })
  // Replacement strings are never recursively evaluated.
  if(name==='mochi_history'&&!already)messages.push(...history)
  else if(name==='mochi_system_notes'&&!already)messages.push(...notes)
  else if(content.trim())messages.push({role:name==='mochi_summary'?'user':'system',content})
  sections.push({id:row.title,active:messages.length>start,providerMessages:Array.from({length:messages.length-start},(_,i)=>start+i+1)})
 }
 for(const key of ['mochi_characters','mochi_persona','mochi_history'])if(!seen.has(key))warnings.push(`Missing ${key}; this context is omitted.`)
 if(values.mochi_summary&&!seen.has('mochi_summary'))warnings.push('Missing mochi_summary; saved memory is omitted and summarized history cannot be excluded.')
 return{messages,sections,warnings,historyIncluded:seen.has('mochi_history'),summaryIncluded:seen.has('mochi_summary')&&Boolean(values.mochi_summary)}
}
