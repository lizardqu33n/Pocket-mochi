import postcss, {type Declaration,type Rule} from 'postcss'

// Visibility, containment, semantics and input routing remain structural. These
// declarations still appear in the map, but are not generic theme parameters.
export const structural=new Set(['display','visibility','position','overflow','overflow-x','overflow-y','box-sizing','container-type','container-name','touch-action','pointer-events','user-select','overscroll-behavior','resize','content-visibility'])
export function context(rule:Rule):string[]{const out:string[]=[];for(let n:any=rule.parent;n;n=n.parent)if(n.type==='atrule')out.unshift('@'+n.name+' '+n.params);return out}
export function publicVariable(value:string){return /^var\((--mochi-[\w-]+)(?:,([\s\S]*))?\)$/.exec(value)}
export function tokenName(rule:Rule,property:string,shared=false):string {
 const selector=rule.selector.split(',')[0].replace(/:not\([^)]*\)/g,'')
 let label=selector.replace(/\.mochi-(?:view|desktop-main)\b\s*/g,'').replace(/\.(?:mochi|lp)-/g,'').replace(/\[([^\]]+)\]/g,'-$1-').replace(/[^a-z\d]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'surface'
 // Section/state/ancestry remain in the name; do not truncate or hash public IDs.
 const responsive=context(rule).join('-').replace(/[^a-z\d]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()
 return '--mochi-v2-'+(shared?'shared-':'')+label+(responsive?'-'+responsive:'')+'-'+property
}
export function themeable(decl:Declaration):boolean {
 if(decl.prop.startsWith('--')||structural.has(decl.prop))return false
 if(publicVariable(decl.value))return false
 // Keep intrinsic minimums, fill constraints and standard inherited resets.
 if(['0','0px','100%','inherit','initial','unset','revert'].includes(decl.value))return false
 if(decl.important&&/hidden|prefers-reduced-motion/.test(decl.parent?.toString()||''))return false
 if(context(decl.parent as Rule).some(c=>c.includes('prefers-reduced-motion')))return false
 return true
}
export function migrate(css:string,shared=false):string {
 const ast=postcss.parse(css)
 ast.walkRules(rule=>{
  if(shared&&!/\.(?:pocket-portal|lp-sheet|lp-floating-notification|lp-conversation-menu|lp-nav-action|lp-button|lp-input|lp-textarea|lp-select|lp-title|lp-muted|lp-toggle|lp-code-input)\b/.test(rule.selector))return
  rule.walkDecls(decl=>{if(themeable(decl))decl.value=`var(${tokenName(rule,decl.prop,shared)},${decl.value})`})
 })
 return ast.toString()
}
// Remove only the newly introduced public fallback wrapper for source-contract
// tests. Existing aliases and their fallbacks remain exactly as authored.
export function originalDefaults(css:string):string {
 const ast=postcss.parse(css)
 ast.walkDecls(decl=>{const m=publicVariable(decl.value);if(m?.[1].startsWith('--mochi-v2-')&&m[2]!==undefined)decl.value=m[2]})
 return ast.toString()
}
