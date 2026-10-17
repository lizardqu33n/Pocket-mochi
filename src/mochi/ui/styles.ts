import tokens from './mochi-tokens.css' with {type:'text'}
import components from './mochi.css' with {type:'text'}

// Text imports embed CSS in frontend.js. Retain the old style-element boundaries:
// desktop overrides, handset rules and editor styles keep their original cascade.
const sections=new Map<string,string>()
const chunks=components.split(/\/\* @mochi-section ([a-z0-9-]+) \*\//)
for(let i=1;i<chunks.length;i+=2){
 if(sections.has(chunks[i]))throw Error('Duplicate Mochi CSS section: '+chunks[i])
 sections.set(chunks[i],chunks[i+1])
}
export function mochiStyle(name:string):string {
 const css=sections.get(name)
 if(css===undefined)throw Error('Missing Mochi CSS section: '+name)
 return (name==='base'?tokens+'\n':'')+css
}
