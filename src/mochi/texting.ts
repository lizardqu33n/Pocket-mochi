export const TEXTING_OPTIONS={length:['short','balanced','detailed'],capitalization:['lowercase','natural','formal'],punctuation:['minimal','natural','expressive'],emoji:['rare','occasional','frequent']} as const
export interface TextingStyle {length?:'short'|'balanced'|'detailed';capitalization?:'lowercase'|'natural'|'formal';punctuation?:'minimal'|'natural'|'expressive';emoji?:'rare'|'occasional'|'frequent';tone?:string}
export function validateTextingStyles(value:unknown):Record<string,TextingStyle>|undefined {
 if(value===undefined)return
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>100)throw Error('Invalid character texting preferences; saved settings were preserved.')
 const result:Record<string,TextingStyle>={}
 for(const [id,raw] of Object.entries(value)){
  if(!/^[A-Za-z0-9_.:-]{1,180}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid texting character identifier or style.')
  const style:Record<string,string>={}
  for(const [key,v]of Object.entries(raw)){
   if(key==='tone'){if(typeof v!=='string'||v.length>400)throw Error('Texting habits must be at most 400 characters.');if(v.trim())style.tone=v.trim()}
   else {const choices=Object.hasOwn(TEXTING_OPTIONS,key)?TEXTING_OPTIONS[key as keyof typeof TEXTING_OPTIONS] as readonly string[]:undefined;if(!choices||typeof v!=='string'||!choices.includes(v))throw Error('Invalid character texting option.');style[key]=v}
  }
  if(Object.keys(style).length)result[id]=style
 }
 return Object.keys(result).length?result:undefined
}
/** One optional section boundary for future preset placement or previewed suggestions. */
export function resolveTextingStyles(value:unknown,characters:Array<{id:string;name:string}>):string {
 const styles=validateTextingStyles(value),rows=characters.flatMap(c=>styles?.[c.id]?[{characterId:c.id,name:c.name,...styles[c.id]}]:[])
 return rows.length?'\nCHARACTER TEXTING TENDENCIES: '+JSON.stringify(rows)+'\nApply only the matching character\'s optional style tendencies. Character identity, conversation meaning and server-enforced reply rules take precedence. These are prose preferences, not delivery commands; do not add extra speakers, calls or independently delivered bubbles.':''
}
