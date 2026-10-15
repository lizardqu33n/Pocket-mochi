export const MOCHI_SIDEBAR_STYLES = `
.mochi-sidebar{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--lumiverse-text,#eee);font:inherit}
.mochi-sidebar-nav{display:flex;gap:8px;padding:12px;flex-shrink:0}
.mochi-sidebar-picker{overflow:auto;padding:0 12px 16px;min-height:0}
.mochi-sidebar-nav>button,.mochi-sidebar-picker button{font:inherit;color:inherit;background:var(--lumiverse-bg-elevated,#29262f);border:1px solid var(--lumiverse-border,#ffffff26);border-radius:10px;min-height:44px;padding:8px 12px;cursor:pointer}
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
.mochi-mobile-surface .mochi-sidebar-nav{padding:4px 8px;justify-content:space-between}
.mochi-sidebar[data-mobile-messenger] .mochi-workspace{flex:1;min-height:0;overflow:hidden}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop.mochi-view{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);height:100%;overflow:hidden}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop[data-mode=list]>.mochi-desktop-main{display:none}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop[data-mode=chat]>.mochi-desktop-list,.mochi-sidebar[data-mobile-messenger] .mochi-desktop[data-mode=detail]>.mochi-desktop-list{display:none}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop-main,.mochi-sidebar[data-mobile-messenger] .mochi-profile-panel{grid-column:1;grid-row:1}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop[data-details=true]>.mochi-desktop-main{visibility:hidden;pointer-events:none}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop[data-details=true]>.mochi-profile-panel{display:block;grid-column:1;grid-row:1;border:0}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop-back{display:block;padding:2px 8px;flex:none}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop-back button{min-height:40px}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop-main>.mochi-view{flex:1;min-height:0;min-width:0;padding:8px;overflow:auto}
.mochi-sidebar[data-mobile-messenger] .mochi-desktop-main>.mochi-view[data-conversation=true]{overflow:hidden}
.mochi-sidebar[data-mobile-messenger] .mochi-thread{flex:1 1 0;min-height:0;max-height:none;overflow:auto;overscroll-behavior:contain}
.mochi-sidebar[data-mobile-messenger] .mochi-room-header{grid-template-columns:minmax(0,1fr) auto;gap:4px;padding-bottom:6px;flex:none}
.mochi-sidebar[data-mobile-messenger] .mochi-room-header>.mochi-actions{gap:0;flex-wrap:nowrap}
.mochi-sidebar[data-mobile-messenger] .mochi-room-header .mochi-icon-button{width:36px;min-width:36px;height:40px;min-height:40px;padding:8px}
.mochi-sidebar[data-mobile-messenger] .mochi-composer{position:static;flex:none;margin-top:0;padding:6px 0 0;gap:4px}
.mochi-sidebar[data-mobile-messenger] .mochi-composer-row{min-width:0;gap:4px}
.mochi-sidebar[data-mobile-messenger] .mochi-composer textarea{min-width:0;max-height:min(112px,25dvh);font-size:16px}
.mochi-sidebar[data-mobile-messenger] .mochi-composer .mochi-icon-button{flex:none;width:44px;min-width:44px;padding:10px}
.mochi-sidebar[data-mobile-messenger] .mochi-bubble{overflow-wrap:anywhere;min-width:0}
.mochi-sidebar[data-mobile-messenger] .lp-conversation-menu-sheet{max-width:min(260px,85cqw);max-height:min(300px,55dvh)}
`
