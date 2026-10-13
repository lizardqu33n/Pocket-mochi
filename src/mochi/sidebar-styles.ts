export const MOCHI_SIDEBAR_STYLES = `
.mochi-sidebar{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--lumiverse-text,#eee);font:inherit}
.mochi-sidebar-nav{display:flex;gap:8px;padding:12px;flex-shrink:0}
.mochi-sidebar-picker{overflow:auto;padding:0 12px 16px;min-height:0}
.mochi-sidebar button{font:inherit;color:inherit;background:var(--lumiverse-bg-elevated,#29262f);border:1px solid var(--lumiverse-border,#ffffff26);border-radius:10px;min-height:44px;padding:8px 12px;cursor:pointer}
.mochi-sidebar button:focus-visible{outline:2px solid var(--lumiverse-primary,#9399ab);outline-offset:2px}
.mochi-sidebar button:disabled{opacity:.6;cursor:default}
.mochi-sidebar-account{display:flex;align-items:center;text-align:left;gap:12px;width:100%;margin:8px 0}
.mochi-sidebar-account[aria-pressed=true]{border-color:var(--lumiverse-primary,#9399ab)}
.mochi-sidebar-avatar{display:grid;place-items:center;flex:0 0 40px;width:40px;height:40px;border-radius:50%;overflow:hidden;background:var(--lumiverse-bg,#18161d)}
.mochi-sidebar-avatar img{width:100%;height:100%;object-fit:cover}
.mochi-sidebar-label{min-width:0;display:flex;flex-direction:column;gap:3px;overflow-wrap:anywhere}
.mochi-sidebar-label small{opacity:.7}
.mochi-sidebar-message{margin:12px 0;font-size:.9em;opacity:.8}
.mochi-sidebar-body{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.mochi-sidebar [hidden]{display:none!important}
`
