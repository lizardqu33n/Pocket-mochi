import {LUCIDE} from './ui/lucide.js'
/** Compatibility string API. Mochi uses mochiIcon() for asset lifecycle. */
export const MOCHI_TOOLBAR_ICONS=Object.fromEntries(Object.entries(LUCIDE).map(([key,svg])=>[key,svg.replace('<svg',`<svg data-mochi-icon="${key}" aria-hidden="true" focusable="false"`)]))
