import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,relative} from 'node:path'
const root=resolve(import.meta.dir,'..'),dir=resolve(root,'src/mochi/ui')
const css=readFileSync(resolve(dir,'mochi.css'),'utf8'),tokens=readFileSync(resolve(dir,'mochi-tokens.css'),'utf8')
const chunks=css.split(/\/\* @mochi-section ([a-z0-9-]+) \*\//),rows:string[]=[]
const inventory:any[]=[]
for(let i=1;i<chunks.length;i+=2){
 const name=chunks[i],body=chunks[i+1].replace(/\/\*[\s\S]*?\*\//g,'')
 const declarations=[...body.matchAll(/(?:^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]+)/g)]
 const literals=declarations.filter(m=>/(?:\b\d*\.?\d+(?:px|ms|s|ch|em|rem|%)\b|#[a-f\d]{3,8}\b)/i.test(m[2]))
 const host=declarations.filter(m=>/var\(--(?:lp|lumiverse)-/.test(m[2]))
 const classes=[...new Set([...body.matchAll(/\.(mochi-[\w-]+)/g)].map(m=>m[1]))].sort()
 inventory.push({section:name,literalCandidates:literals.map(m=>({property:m[1],value:m[2].trim()})),hostAliases:host.map(m=>({property:m[1],value:m[2].trim()})),classes,important:(body.match(/!important/g)||[]).length})
 rows.push(`| ${name} | ${literals.length} | ${host.length} | ${classes.length} | ${(body.match(/!important/g)||[]).length} |`)
}
const inline:string[]=[]
function walk(dir:string){for(const item of readdirSync(dir,{withFileTypes:true})){const file=resolve(dir,item.name);if(item.isDirectory())walk(file);else if(file.endsWith('.ts'))readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{if(/\.style\.|setAttribute\(['"]style/.test(line))inline.push(`- ${relative(root,file).replaceAll('\\','/')}:${i+1} — ${line.includes('--mochi-saved-')?'saved accessibility backing variables (retain)':line.includes('widget.root.style.height')?'host root fill geometry (retain)':'measured geometry; visual limits/offsets pending extraction'}`)})}}
walk(resolve(root,'src/mochi'))
const defs=[...tokens.matchAll(/^\s*(--mochi-[\w-]+):\s*(.+);/gm)]
writeFileSync(resolve(dir,'theme-inventory.json'),JSON.stringify({schemaVersion:1,scope:'Mochi only; static heuristic, not a CSS parser',sections:inventory},null,2)+'\n')
writeFileSync(resolve(dir,'THEME-INVENTORY.md'),`# Mochi theme inventory (generated)\n\nRefresh with \`bun scripts/audit-mochi-theme.ts\`. These are heuristic migration candidates, not a requirement to turn structural CSS into tokens. Counts include literal values inside fallbacks and formulas. Repeated rules are intentionally included.\n\nThe supported public selector contract is in [THEME-CONTRACT.md](THEME-CONTRACT.md). Exact class candidates and declaration values per section are in [theme-inventory.json](theme-inventory.json). This inventory does not cover host-owned UI or shared Pocket CSS consumed by Mochi; those require a separate cross-surface audit.\n\n| Section | Literal candidates | Direct host-variable declarations | Class candidates | !important |\n|---|---:|---:|---:|---:|\n${rows.join('\n')}\n\n## Inline style audit\n\n${inline.join('\n')}\n\n## Current public tokens and original defaults\n\nCopy [starter-theme.css](starter-theme.css) for the full editable starter. Private saved backing values are deliberately not included.\n\n| Token | Default |\n|---|---|\n${defs.map(m=>'| `'+m[1]+'` | `'+m[2]+'` |').join('\n')}\n`)
console.log(`${inventory.length} sections; ${defs.length} token declarations; ${inline.length} inline geometry sites inventoried.`)
