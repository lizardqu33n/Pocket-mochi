/** Optional owner assets, bundled locally. No owner asset is required.
 * Example: import flower from './owner/flower.svg' with {type:'text'}
 * export const MOCHI_ICON_ASSETS = {'toolbar-presets': {svg: flower}}
 * Raster example: {'account-logout': {data: 'data:image/png;base64,...'}}
 * Invalid entries are rejected by the build check and safely ignored at runtime.
 */
export const MOCHI_ICON_ASSETS: Record<string, {svg:string}|{data:string}> = {}
