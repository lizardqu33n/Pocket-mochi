/** Dedicated-window layout only; compatibility portal/handset rules stay intact. */
export const MOCHI_DESKTOP_STYLES = `
.mochi-workspace[data-presentation=messenger]{container-type:inline-size}
.mochi-desktop.mochi-view{display:grid;grid-template-columns:minmax(190px,240px) minmax(0,1fr);gap:0;padding:0;overflow:hidden;height:100%;min-height:0}
.mochi-desktop-list{display:flex;flex-direction:column;min-height:0;min-width:0;border-right:1px solid var(--lp-border,#ffffff26);background:var(--mochi-surface)}
.mochi-desktop-list-head{padding:12px;flex:none;display:grid;gap:8px}.mochi-desktop-list-head h3{margin:0;font-size:14px}.mochi-desktop-account{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mochi-desktop-rooms{flex:1;min-height:0;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:4px}
.mochi-desktop .mochi-desktop-room{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:10px;border-radius:10px;border:1px solid transparent;background:transparent;color:inherit;min-width:0}
.mochi-desktop-room[aria-current=true]{background:var(--lp-surface-2,#ffffff12);border-color:var(--mochi-accent)!important}.mochi-desktop-room:hover{background:var(--lp-surface-2,#ffffff12)}
.mochi-desktop-room-copy{flex:1;min-width:0;display:grid;gap:4px}.mochi-desktop-room-copy strong,.mochi-desktop-room-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mochi-desktop-room-copy strong{font-size:13px}.mochi-desktop-room-copy small{font-size:11px;opacity:.75}.mochi-desktop-room .mochi-room-avatars{flex:none}.mochi-desktop-room .mochi-avatar{width:28px;height:28px}.mochi-desktop-unread{flex:none;font-size:11px;border-radius:99px;padding:2px 6px;background:var(--mochi-accent);color:var(--mochi-surface)}
.mochi-desktop-main{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}.mochi-desktop-main>.mochi-view{flex:1;min-height:0;overflow:auto;border:0;border-radius:0;padding:12px}
.mochi-desktop-main>.mochi-view[data-conversation=true]{display:flex;flex-direction:column;overflow:hidden}.mochi-desktop-main .mochi-room-header,.mochi-desktop-main .mochi-composer,.mochi-desktop-main .mochi-view>header{flex:none}
.mochi-desktop-main .mochi-thread{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain}.mochi-desktop-main .mochi-composer{margin-top:auto}.mochi-desktop-main .mochi-thread:focus-visible{outline:2px solid var(--mochi-accent);outline-offset:-2px}
.mochi-desktop-back{flex:none;padding:6px 12px;border-bottom:1px solid var(--lp-border,#ffffff26)}.mochi-desktop-back button{font:inherit;color:inherit;background:transparent;border:0;min-height:32px;cursor:pointer}
.mochi-desktop[data-mode=account]{grid-template-columns:minmax(0,1fr)}.mochi-desktop[data-mode=account]>.mochi-desktop-list{display:none}
@container (min-width:640px){.mochi-desktop-back{display:none}}
@container (max-width:639px){.mochi-desktop.mochi-view{grid-template-columns:minmax(0,1fr)}.mochi-desktop[data-mode=list]>.mochi-desktop-main{display:none}.mochi-desktop[data-mode=chat]>.mochi-desktop-list,.mochi-desktop[data-mode=detail]>.mochi-desktop-list{display:none}.mochi-desktop-list{border-right:0}}
`
