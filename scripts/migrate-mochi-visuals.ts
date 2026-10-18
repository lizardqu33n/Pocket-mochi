// One-time, idempotent source migration. Never rewrites application behavior.
import {readFileSync,writeFileSync} from 'node:fs'
import {migrate} from './mochi-css-contract'
const own='src/mochi/ui/mochi.css'
writeFileSync(own,migrate(readFileSync(own,'utf8')))
for(const path of ['src/styles.ts','src/frontend/components/design-system.ts','src/frontend/components/inline-styles.ts','src/frontend/components/pocket-inline-redesign.css','src/frontend/components/portal.ts']){
 let text=readFileSync(path,'utf8')
 if(path.endsWith('.css'))text=migrate(text,true)
 else text=text.replace(/export const [A-Z_]+\s*=\s*`([\s\S]*?)`/g,(full,body)=>{
  if(!body.includes('{'))return full
  const saved:string[]=[]
  const safe=body.replace(/\$\{[^}]+\}/g,(v:string)=>`/* mochi-interpolation-${saved.push(v)-1} */`)
  return full.slice(0,full.indexOf('`')+1)+migrate(safe,true).replace(/\/\* mochi-interpolation-(\d+) \*\//g,(_m:string,n:string)=>saved[Number(n)])+'`'
 })
 writeFileSync(path,text)
}
