import {mochiStyle} from '../src/mochi/ui/styles.js'
import {MOCHI_ICON_ASSETS} from '../src/mochi/ui/icon-assets.js'
import {iconAssetData} from '../src/mochi/ui/icon-slots.js'
import {JSDOM} from 'jsdom'

// Build-time diagnostics for optional owner artwork; runtime retains Lucide too.
if(Object.keys(MOCHI_ICON_ASSETS).length){
 const dom=new JSDOM('');Object.assign(globalThis,{DOMParser:dom.window.DOMParser,XMLSerializer:dom.window.XMLSerializer})
 try{for(const [slot,asset]of Object.entries(MOCHI_ICON_ASSETS))if(!/^[a-z][a-z0-9-]*$/.test(slot)||!iconAssetData(asset))throw Error('Invalid local Mochi icon asset: '+slot)}finally{dom.window.close()}
}

// Run before the normal frontend build so accidental marker edits fail locally,
// rather than producing an extension that discovers a missing section at load.
for(const section of ['base','mochi-reply-styles','mochi-reaction-styles','mochi-pin-styles','mochi-search-styles','mochi-texting-styles','mochi-preview-styles','mochi-preset-styles','block-editor','preset-workspace-base','mochi-preset-dedicated-styles','mochi-preset-chrome-styles','preset-workspace-final','mochi-memory-styles','settings-workspace-styles','mochi-disclosure-styles','desktop','mochi-sidebar-styles','launcher','mobile-surface','window','window-focus','workspace','notifications']){
 if(!mochiStyle(section).trim())throw Error('Empty Mochi CSS section: '+section)
}
console.log('Mochi editable CSS sections verified; text imports embed them in frontend.js.')
