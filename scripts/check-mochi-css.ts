import {mochiStyle} from '../src/mochi/ui/styles.js'

// Run before the normal frontend build so accidental marker edits fail locally,
// rather than producing an extension that discovers a missing section at load.
for(const section of ['base','mochi-reply-styles','mochi-reaction-styles','mochi-pin-styles','mochi-search-styles','mochi-texting-styles','mochi-preview-styles','mochi-preset-styles','block-editor','preset-workspace-base','mochi-preset-dedicated-styles','mochi-preset-chrome-styles','preset-workspace-final','mochi-memory-styles','settings-workspace-styles','mochi-disclosure-styles','desktop','mochi-sidebar-styles','launcher','mobile-surface','window','window-focus','workspace','notifications']){
 if(!mochiStyle(section).trim())throw Error('Empty Mochi CSS section: '+section)
}
console.log('Mochi editable CSS sections verified; text imports embed them in frontend.js.')
