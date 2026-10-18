import {mochiIcon,mochiButton,refreshMochiIcons,iconSVGData} from '../../src/mochi/ui/icon-slots'
import ownerExample from '../../src/mochi/ui/examples/orbit.svg' with {type:'text'}
import {MOCHI_ICON_ASSETS} from '../../src/mochi/ui/icon-assets'
import {mochiStyle} from '../../src/mochi/ui/styles'
import inventory from '../../src/mochi/ui/icon-inventory.json'
const root=document.getElementById('app')!;root.className='mochi-view'
const style=document.createElement('style');style.textContent=mochiStyle('base')+'#app{display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;padding:16px;height:auto;min-height:100vh}button{min-width:44px;min-height:44px}';root.append(style)
let clicks=0
for(const {slot,icon}of inventory.slots){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',slot);b.title=slot;b.append(mochiIcon(icon,slot));b.onclick=()=>clicks++;root.append(b)}
Object.assign(window,{__icons:{refresh:()=>refreshMochiIcons(root),svgData:iconSVGData,button:mochiButton,ownerExample,assets:MOCHI_ICON_ASSETS,clicks:()=>clicks}})
