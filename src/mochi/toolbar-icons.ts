/** Local outline artwork compatible with Lumiverse's Lucide toolbar.
 * Kept inside Mochi: no dependency on host React components or private paths. */
const paths:Record<string,string>={
 plus:'<path d="M12 5v14M5 12h14"/>',
 settings:'<path d="m9 3-.5 2-2 1.2-2-.5-2 3.5 1.5 1.5v2.6L2.5 15l2 3.5 2-.5 2 1.2L9 21h4l.5-1.8 2-1.2 2 .5 2-3.5-1.5-1.7v-2.6L19.5 9l-2-3.5-2 .5-2-1.2L13 3Z"/><circle cx="11" cy="12" r="3"/>',
 logout:'<path d="M9 4H4v16h5m6-13 5 5-5 5m-7-5h12"/>',
 sort:'<path d="M7 4v16m-4-4 4 4 4-4M14 5h7m-7 5h5m-5 5h3"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 list:'<path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01"/>',
 check:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m7 12 3 3 7-7"/>',
 archive:'<path d="M4 8v12h16V8M9 12h6"/><rect x="3" y="3" width="18" height="5" rx="1"/>',

 brain:'<path d="M12 18V5a3 3 0 0 0-5.8-1A4 4 0 0 0 3 11a4 4 0 0 0 2 7.5A3.5 3.5 0 0 0 12 18Zm0 0V5a3 3 0 0 1 5.8-1A4 4 0 0 1 21 11a4 4 0 0 1-2 7.5A3.5 3.5 0 0 1 12 18ZM7 8c2 0 3 1 3 3m7-3c-2 0-3 1-3 3M6 14c2 0 3 1 3 3m9-3c-2 0-3 1-3 3"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3M8 9h.01M16 9h.01"/>',

 sliders:'<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 panel:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18M18 7h.01M18 11h.01"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 bookmark:'<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4-6 4Z"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 pin:'<path d="m16 3 5 5-4 2-3 5-5-5 5-3 2-4ZM9 10l-3 3 5 5 3-3M8.5 15.5 3 21"/>',
 ellipsis:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
}
export const MOCHI_TOOLBAR_ICONS=Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,`<svg data-mochi-icon="${key}" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`]))
