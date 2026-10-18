import postcss from 'postcss'
import {createHash} from 'node:crypto'
import {context,originalDefaults} from './mochi-css-contract'
export const styleFiles=['src/mochi/ui/mochi.css','src/styles.ts','src/frontend/components/design-system.ts','src/frontend/components/inline-styles.ts','src/frontend/components/pocket-inline-redesign.css','src/frontend/components/portal.ts']
const measured=new Set(['.mochi-view .mochi-composer-row textarea[data-pocket-composer]','.mochi-view .mochi-bottom-toolbar [data-mochi-slot=conversation-menu][data-mochi-slot]','.mochi-view .mochi-message-body .mochi-action-strip','.lp-sheet[data-pocket-measured=true]'])
export function defaultDeclarations(path:string,source:string):any[] {
 source=source.replaceAll('\r\n','\n')
 const fragments=path.endsWith('.css')?[source]:[...source.matchAll(/export const [A-Z_]+\s*=\s*`([\s\S]*?)`/g)].map(m=>m[1].replace(/\$\{[^}]+\}/g,'/* imported styles */'))
 const signature:any[]=[]
 for(const css of fragments){const ast=postcss.parse(originalDefaults(css));ast.walkRules(rule=>{if(measured.has(rule.selector))return;rule.walkDecls(d=>signature.push([context(rule),rule.selector,d.prop,d.value,!!d.important]))})}
 return signature
}
export function defaultFingerprint(path:string,source:string):string {return createHash('sha256').update(JSON.stringify(defaultDeclarations(path,source))).digest('hex')}
