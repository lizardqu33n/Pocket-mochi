import {readFileSync,writeFileSync,appendFileSync,readdirSync,mkdirSync} from 'node:fs'
import {resolve,relative} from 'node:path'
import postcss from 'postcss'
import {context,publicVariable,structural} from './mochi-css-contract'
const root=resolve(import.meta.dir,'..'),dir=resolve(root,'src/mochi/ui')
const paths=['src/mochi/ui/mochi.css','src/mochi/ui/icons.css','src/styles.ts','src/frontend/components/design-system.ts','src/frontend/components/inline-styles.ts','src/frontend/components/pocket-inline-redesign.css','src/frontend/components/portal.ts']
const rules:any[]=[],summaries=new Map<string,{rules:number,tokens:Set<string>}>()
for(const path of paths){
 const source=readFileSync(resolve(root,path),'utf8')
 const fragments=path.endsWith('.css')?[{css:source,offset:0}]:[...source.matchAll(/export const [A-Z_]+\s*=\s*`([\s\S]*?)`/g)].map(m=>({css:m[1].replace(/\$\{[^}]+\}/g,'/* imported styles */'),offset:source.slice(0,m.index!+1).split('\n').length-1}))
 for(const fragment of fragments){
  const ast=postcss.parse(fragment.css);let section=path==='src/mochi/ui/mochi.css'?'base':'shared-pocket'
  ast.walk(node=>{
   if(node.type==='comment'){const m=/@mochi-section ([\w-]+)/.exec(node.text);if(m)section=m[1]}
   if(node.type!=='rule')return
   if(!path.startsWith('src/mochi/ui/')&&!/\.(?:pocket-portal|lp-sheet|lp-floating-notification|lp-conversation-menu|lp-nav-action|lp-button|lp-input|lp-textarea|lp-select|lp-title|lp-muted|lp-toggle|lp-code-input)\b/.test(node.selector))return
   const declarations:any[]=[]
   node.walkDecls(d=>{const variable=publicVariable(d.value),token=variable?.[1]||null;declarations.push({property:d.prop,token,default:token?.startsWith('--mochi-v2-')?variable![2]:d.value,important:!!d.important,structural:structural.has(d.prop)||['0','0px','100%','inherit','initial','unset','revert'].includes(d.value)})})
   rules.push({section,file:path,line:fragment.offset+(node.source?.start?.line||1),selector:node.selector,conditions:context(node),declarations})
   const summary=summaries.get(section)||{rules:0,tokens:new Set<string>()};summary.rules++;for(const d of declarations)if(d.token)summary.tokens.add(d.token);summaries.set(section,summary)
  })
 }
}
const inline:string[]=[]
function walk(folder:string){for(const item of readdirSync(folder,{withFileTypes:true})){const file=resolve(folder,item.name);if(item.isDirectory())walk(file);else if(file.endsWith('.ts'))readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{if(/\.style\./.test(line))inline.push(`- ${relative(root,file).replaceAll('\\','/')}:${i+1} — ${line.includes('--mochi-saved-')?'saved accessibility backing values':line.includes('widget.root.style.height')?'host root fill invariant':'private geometry measurements; public CSS controls mapped separately'}`)})}}
walk(resolve(root,'src/mochi'))
const tokens=readFileSync(resolve(dir,'mochi-tokens.css'),'utf8'),defs=[...tokens.matchAll(/^\s*(--mochi-[\w-]+):\s*(.+);/gm)]
const escape=(s:string)=>s.replaceAll('|','\\|').replaceAll('\n',' ')
writeFileSync(resolve(dir,'theme-inventory.json'),JSON.stringify({schemaVersion:2,scope:'All Mochi rules and shared Pocket primitives consumed by Mochi; public selector/token contract v2',rules},null,2)+'\n')
let map='# Complete Mochi customization map\n\nGenerated with `bun scripts/audit-mochi-theme.ts`. Every Mochi rule and inherited shared control rule is listed in source/cascade order. Selectors are public compatibility hooks. Search by component, state, property or token. All conditions must match; later rules can win.\n\nRead [THEME-CONTRACT.md](THEME-CONTRACT.md) for safe layout and examples. Full declarations: [theme-inventory.json](theme-inventory.json). `selector only` means edit that exact scoped selector; visibility/containment and zero/fill/inherited resets deliberately remain structural. Scope shared selectors to a Mochi root in a theme.\n'
mkdirSync(resolve(dir,'reference'),{recursive:true})
map+='\nIcons: [complete named slot reference](reference/icons.md), [recipes and asset security](ICON-THEMING.md), [rendering-site inventory](icon-inventory.json).\n\n| Surface section | Complete selector/property reference | Rules |\n|---|---|---:|\n'
for(const [section,summary]of summaries){
 map+=`| ${section} | [Open reference](reference/${section}.md) | ${summary.rules} |\n`
 let sectionMap=`# ${section}\n\n[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)\n\nRules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.\n\n| Selector / condition | CSS controls and original fallback values | Source |\n|---|---|---|\n`
 for(const rule of rules.filter(r=>r.section===section)){
  const controls=rule.declarations.map((d:any)=>'`'+escape(d.property)+'` → '+(d.token?'`'+d.token+'`':'selector only')+' = `'+escape(d.default)+'`'+(d.important?' !important':'')).join('<br>')
  sectionMap+='| `'+escape(rule.selector)+'`'+(rule.conditions.length?'<br>'+rule.conditions.map((c:string)=>'`'+escape(c)+'`').join('<br>'):'')+' | '+controls+' | '+rule.file+':'+rule.line+' |\n'
 }
 writeFileSync(resolve(dir,'reference',section+'.md'),sectionMap)
}
writeFileSync(resolve(dir,'UI-CUSTOMIZATION-MAP.md'),map)
writeFileSync(resolve(dir,'THEME-INVENTORY.md'),'# Mochi theme coverage\n\nThe complete reference is [UI-CUSTOMIZATION-MAP.md](UI-CUSTOMIZATION-MAP.md); machine-readable data is [theme-inventory.json](theme-inventory.json). No Mochi CSS section is deferred. Structural declarations use listed selectors rather than generic visual tokens. Shared Pocket primitives are included.\n\n| Section | Rules | Distinct consumed tokens |\n|---|---:|---:|\n'+[...summaries].map(([n,s])=>`| ${n} | ${s.rules} | ${s.tokens.size} |`).join('\n')+'\n\n## Inline assignments\n\nThese are private measurements, saved accessibility backing values, or host root-fill invariants. Dialog measurements live in the shared sheet helper and are consumed through CSS variables.\n\n'+inline.join('\n')+'\n\n## Common semantic tokens\n\n| Token | Default |\n|---|---|\n'+defs.map(m=>'| `'+m[1]+'` | `'+m[2]+'` |').join('\n')+'\n')
writeFileSync(resolve(dir,'starter-theme.css'),'/* Mochi v2 theme starter. Common tokens retain the default look.\n * Every component/state/responsive control and fallback is listed in\n * UI-CUSTOMIZATION-MAP.md. Leave unedited component tokens unset so each\n * declaration retains its context-specific original CSS fallback. */\n'+tokens+'\n/* Component examples (uncomment to opt in):\n.mochi-settings-workspace { --mochi-v2-settings-heading-padding: 16px 20px; }\n.mochi-view { --mochi-menu-max-height: 300px; }\n.mochi-sheet { --mochi-dialog-width: min(520px,calc(100vw - 24px)); }\n*/\n')
appendFileSync(resolve(dir,'starter-theme.css'),'\n/* Named icon examples (opt in; see ICON-THEMING.md and reference/icons.md):\n.mochi-view { --mochi-icon-toolbar-presets-size:20px; --mochi-icon-toolbar-presets-stroke-width:2; }\n.mochi-settings-workspace { --mochi-icon-text-display:inline-flex; }\nLocal SVG/PNG image tokens use quoted data URLs and keep Lucide on load failure.\nThe complete example and security rules are in ICON-THEMING.md. */\n')
console.log(`${rules.length} public rule entries across ${summaries.size} surface sections; map and starter refreshed.`)
