// src/frontend/components/icons.ts
var POCKET_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 10 8.5-7 8.5 7v9.5a1.5 1.5 0 0 1-1.5 1.5h-5v-6H10v6H5a1.5 1.5 0 0 1-1.5-1.5z"/></svg>',
  messages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.6A8 8 0 1 1 20.5 11.5Z"/><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"/></svg>',
  contacts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 8h5M18.5 5.5v5"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5h3l1.5-2h7l1.5 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m4.5 18 4.7-4.7 3.1 3.1 2.2-2.2 5 5"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg>',
  weather: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18.5h9a4 4 0 0 0 .4-8A6 6 0 0 0 6 12.5a3 3 0 0 0 2 6Z"/><path d="M8 5V3M4.5 7 3 5.5M11.5 7 13 5.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3"/></svg>',
  trackers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6v.2H10V21a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1L4 17.1l.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 13.9h-.2V10H3a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l-.1-.1L6.9 4l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3V2.8h4V3a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 6.9l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.2V14h-.2a1.8 1.8 0 0 0-1.7 1Z"/></svg>',
  notifications: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21 3-7.2 18-3.2-7.6L3 10zM10.6 13.4 21 3"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5c.5 4.2 2.8 6.5 7 7-4.2.5-6.5 2.8-7 7-.5-4.2-2.8-6.5-7-7 4.2-.5 6.5-2.8 7-7Z"/><path d="M19 16.5c.2 2 1.3 3.1 3 3.3-1.7.2-2.8 1.3-3 3.2-.2-1.9-1.3-3-3-3.2 1.7-.2 2.8-1.3 3-3.3Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>'
};

// src/domain/gallery-page.ts
var GALLERY_PAGE_SIZE = 48;

// src/frontend/shared.ts
function el(tag, className = "", content = "") {
  const node = document.createElement(tag);
  if (className)
    node.className = className;
  if (content)
    node.textContent = content;
  return node;
}
function button(label, className = "lp-button") {
  const node = el("button", className, label);
  node.type = "button";
  return node;
}
function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()))
    return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}
function formatDate(value, detail = false) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()))
    return String(value || "");
  return new Intl.DateTimeFormat(undefined, detail ? { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric" }).format(date);
}
function dateTimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function inputValue(input) {
  return input.value.trim();
}
function requestId(prefix = "req") {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

// src/mochi/styles.ts
var MOCHI_STYLES = `
.mochi-message-meta{display:flex;gap:8px;align-items:center;max-width:100%;min-height:44px}.mochi-message[data-grouped=true]{margin-top:-8px}.mochi-view .mochi-room-header{grid-template-columns:minmax(0,1fr) 96px}
.mochi-standalone{font-size:10px;font-weight:600;border:1px solid color-mix(in srgb,var(--mochi-accent) 45%,transparent);border-radius:99px;padding:4px 8px;color:var(--mochi-accent);letter-spacing:0}.mochi-view .mochi-room-selector{font-weight:650;border-radius:99px;color:inherit;background:color-mix(in srgb,var(--mochi-accent) 7%,var(--mochi-surface));padding:9px 10px;font-size:14px}.mochi-brand{gap:6px!important}.mochi-view .mochi-message-actions{width:44px;height:44px;min-height:44px;margin-top:-3px;background:transparent;border-color:transparent}.mochi-action-panel,.mochi-participants,.mochi-notification-list{display:grid;gap:12px}.mochi-action-panel :is(button,textarea){width:100%}.mochi-action-panel textarea{min-height:110px;border:1px solid var(--lp-border);border-radius:12px;padding:12px;background:var(--lp-bg);color:var(--lp-text);font:inherit;resize:vertical}.mochi-action-panel .lp-button{display:flex;align-items:center;gap:10px;justify-content:center;min-height:44px}.mochi-action-panel svg{width:20px;height:20px}.mochi-view [data-unread=true]{box-shadow:inset 0 0 0 2px var(--mochi-accent)}.mochi-notification-toast .mochi-notification-avatar{width:32px;height:32px;border-radius:50%;overflow:hidden;flex:none;display:grid;place-items:center;background:var(--lp-surface-2)}.mochi-notification-avatar img{width:100%;height:100%;object-fit:cover}.mochi-notification-toast strong,.mochi-notification-toast span{overflow-wrap:anywhere}.mochi-notification-toast{max-width:calc(100% - 24px)}.mochi-message[data-grouped=true] .mochi-message-avatar{visibility:hidden}
.mochi-view [hidden]{display:none!important}
.mochi-view{width:100%;flex:1}
.mochi-view{--mochi-accent:color-mix(in srgb,var(--lp-accent,#a99bff) 35%,#b7a0e8);--mochi-surface:var(--lp-bg,var(--lumiverse-bg,#17151d));--mochi-border:var(--lp-border,#ffffff18);color:var(--lp-text,var(--lumiverse-text,#f7f5ff));background:var(--mochi-surface);font:inherit;line-height:1.45;padding:16px;display:flex;flex-direction:column;gap:14px;overflow:auto;height:100%;min-width:0;box-sizing:border-box;container-type:inline-size}
.mochi-view *{box-sizing:border-box}.mochi-view h2,.mochi-view h3,.mochi-view p{margin:0}.mochi-view h2{font-size:23px;letter-spacing:-.04em}.mochi-view h3{font-size:17px;overflow-wrap:anywhere}.mochi-view header,.mochi-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}.mochi-brand{display:flex;align-items:center;gap:8px}.mochi-brand>span{color:var(--mochi-accent)}.mochi-view svg{width:20px;height:20px;display:block;flex:none}
.mochi-view button{font:inherit;color:inherit;cursor:pointer}.mochi-view .lp-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 14px;border:1px solid var(--mochi-border);border-radius:12px;background:color-mix(in srgb,var(--lp-text,#fff) 4%,var(--mochi-surface));font-size:13px;font-weight:600}.mochi-view .mochi-icon-button{width:44px;padding:10px;flex:none;border-radius:50%}.mochi-view .mochi-primary{background:var(--mochi-accent);color:#21182e;border-color:transparent}.mochi-view button:disabled{opacity:.45;cursor:default}.mochi-view button:not(:disabled):hover{border-color:var(--mochi-accent)}.mochi-view :is(button,input,textarea,select):focus-visible{outline:2px solid var(--mochi-accent);outline-offset:3px}
.mochi-muted{color:var(--lp-muted,var(--lumiverse-text-muted,#a9a3b5));font-size:12px}.mochi-error{color:var(--lp-destructive,#ed7c8c);font-size:13px;overflow-wrap:anywhere}.mochi-room-header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--mochi-border)}.mochi-room-header .mochi-actions{justify-content:end}.mochi-room-info{display:grid;gap:3px;min-width:0}.mochi-member-strip{display:flex;gap:8px;flex-wrap:wrap}.mochi-member{display:flex;align-items:center;gap:6px;min-width:0;font-size:11px;max-width:100%}.mochi-member>span:last-child{overflow-wrap:anywhere}.mochi-member .mochi-avatar{width:26px;height:26px;font-size:11px;flex:none}
.mochi-card{width:100%;padding:14px;border:1px solid var(--mochi-border);border-radius:16px;background:color-mix(in srgb,var(--mochi-accent) 4%,var(--mochi-surface));display:flex;gap:12px;text-align:left;align-items:center}.mochi-card-copy{min-width:0;display:grid;gap:4px;flex:1}.mochi-card-copy strong{overflow-wrap:anywhere;font-size:14px}.mochi-preview{font-size:12px;color:var(--lp-muted,#a9a3b5);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}.mochi-room-avatars{width:48px;flex:none;display:flex;flex-wrap:wrap;gap:2px}.mochi-room-avatars .mochi-avatar{width:23px;height:23px;font-size:10px}.mochi-room-avatars[data-single=true] .mochi-avatar{width:44px;height:44px;font-size:18px}
.mochi-form{display:flex;flex-direction:column;gap:18px;min-width:0}.mochi-view label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:600;min-width:0}.mochi-view :is(input,textarea,select){box-sizing:border-box;width:100%;min-width:0;min-height:44px;padding:11px 12px;border-radius:12px;border:1px solid var(--mochi-border);background:color-mix(in srgb,var(--lp-text,#fff) 3%,var(--mochi-surface));color:inherit;font:inherit;font-size:14px;line-height:1.4}.mochi-view textarea{resize:vertical}.mochi-view option{background:var(--mochi-surface);color:var(--lp-text,#f7f5ff)}.mochi-view .mochi-toggle{flex-direction:row;align-items:center;justify-content:space-between;gap:12px;padding:12px;background:color-mix(in srgb,var(--mochi-accent) 5%,var(--mochi-surface));border:1px solid var(--mochi-border);border-radius:12px}.mochi-view input[type=checkbox]{appearance:auto;min-height:24px;width:24px;height:24px;flex:none;accent-color:var(--mochi-accent);margin:0}
.mochi-picker{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.mochi-choice{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;min-width:0;padding:12px 6px;border:1px solid transparent;border-radius:14px;background:transparent;font-size:12px!important;line-height:1.35;overflow-wrap:anywhere;text-align:center}.mochi-choice>span:last-child{width:100%;min-width:0}.mochi-choice[aria-pressed=true]{border-color:var(--mochi-accent);background:color-mix(in srgb,var(--mochi-accent) 12%,var(--mochi-surface))}.mochi-choice[aria-pressed=true]::after{content:'✓';position:absolute;right:5px;top:5px;border-radius:50%;width:18px;height:18px;background:var(--mochi-accent);color:#21182e;font-size:12px}.mochi-avatar,.mochi-message-avatar{display:flex;align-items:center;justify-content:center;width:48px;height:48px;flex:none;border-radius:50%;background:color-mix(in srgb,var(--mochi-accent) 18%,var(--mochi-surface));border:1px solid color-mix(in srgb,var(--mochi-accent) 35%,var(--mochi-border));overflow:hidden;color:var(--mochi-accent);font-weight:650}.mochi-avatar img,.mochi-message-avatar img{width:100%;height:100%;object-fit:cover}
.mochi-thread{display:flex;flex-direction:column;gap:18px;flex:1;min-height:160px;overflow-y:auto;overscroll-behavior:contain;padding:4px 0 10px}.mochi-message{display:flex;gap:8px;align-items:flex-start;min-width:0}.mochi-message[data-role=user]{flex-direction:row-reverse}.mochi-message-avatar{width:32px;height:32px;font-size:12px;margin-top:2px}.mochi-message-body{max-width:min(86%,calc(100% - 40px));min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:5px}.mochi-message[data-role=user] .mochi-message-body{align-items:flex-end}.mochi-message-name{font-size:12px;font-weight:650;overflow-wrap:anywhere}.mochi-bubble{width:fit-content;max-width:100%;background:color-mix(in srgb,var(--lp-text,#fff) 7%,var(--mochi-surface));border:1px solid var(--mochi-border);border-radius:12px;padding:10px 12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:1.5}.mochi-message[data-role=user] .mochi-bubble{background:color-mix(in srgb,var(--mochi-accent) 24%,var(--mochi-surface));border-color:color-mix(in srgb,var(--mochi-accent) 28%,var(--mochi-border))}.mochi-message time{font-size:10px;color:var(--lp-muted,#a9a3b5)}
.mochi-composer{position:sticky;bottom:0;flex-shrink:0;background:var(--mochi-surface);padding:10px 0 max(4px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--mochi-border)}.mochi-composer-row{display:flex;gap:8px;align-items:flex-end}.mochi-composer textarea{flex:1;min-height:44px;max-height:112px;resize:none;border-radius:18px;padding:11px 13px}.mochi-composer select{font-size:12px;min-height:36px;padding:7px 10px}.mochi-composer-hint{font-size:10px;color:var(--lp-muted,#a9a3b5)}.mochi-view>header,.mochi-room-header,.mochi-member-strip{flex-shrink:0}
@container (max-width:320px){.mochi-picker{grid-template-columns:repeat(2,minmax(0,1fr))}.mochi-room-header{gap:6px}.mochi-member-strip{gap:6px}.mochi-standalone{display:none}.mochi-view header .mochi-actions{gap:4px}}
/* Mochi 03.5: keep all refinements inside the independent app surface. */
.mochi-view{padding:14px;gap:12px}.mochi-view>header{padding:2px 0 10px;border-bottom:1px solid var(--mochi-border)}.mochi-view h2{font-size:28px;font-weight:800;letter-spacing:-.045em}.mochi-brand{min-width:0;gap:7px!important}.mochi-view .mochi-mascot svg{width:38px;height:32px}.mochi-view header .mochi-icon-button{position:relative;background:transparent;border-color:transparent}.mochi-unread-count{position:absolute;right:1px;top:0;min-width:17px;padding:1px 4px;border-radius:99px;background:var(--mochi-accent);color:#21182e;font-size:10px;line-height:15px}.mochi-view .mochi-room-selector{min-height:46px;padding:10px 14px;border-color:color-mix(in srgb,var(--mochi-accent) 30%,var(--mochi-border));background:color-mix(in srgb,var(--mochi-accent) 9%,var(--mochi-surface));font-size:15px}.mochi-room-header{border:0;padding-bottom:0;gap:8px}.mochi-room-info{gap:5px}.mochi-member-strip{gap:6px;padding-bottom:10px;border-bottom:1px solid var(--mochi-border)}.mochi-member-strip .mochi-member{padding:3px 7px 3px 3px;border-radius:99px;background:color-mix(in srgb,var(--mochi-accent) 5%,var(--mochi-surface));max-width:100%}.mochi-member-strip .mochi-avatar{width:30px;height:30px}.mochi-member-strip .mochi-member>span:last-child{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3}
.mochi-thread{gap:14px;padding-top:0}.mochi-message{gap:9px}.mochi-message-avatar{width:36px;height:36px;margin-top:4px}.mochi-message-body{max-width:min(86%,calc(100% - 45px));gap:2px}.mochi-message-meta{width:100%;min-height:36px;gap:6px;position:relative;padding-right:34px}.mochi-message-name{font-size:13px}.mochi-message time{white-space:nowrap;font-size:10px;flex:none}.mochi-message[data-role=user] .mochi-message-meta{justify-content:flex-end}.mochi-view .mochi-message-actions{position:absolute;right:-7px;top:-4px;width:44px;height:44px;margin:0;border:0!important;background:transparent!important;opacity:0}.mochi-view .mochi-message-actions svg{width:15px;height:15px}.mochi-message:hover .mochi-message-actions,.mochi-message:focus-within .mochi-message-actions{opacity:1}.mochi-bubble{padding:12px 14px;border-radius:17px;line-height:1.55}.mochi-message[data-role=assistant] .mochi-bubble{border-top-left-radius:6px}.mochi-message[data-role=user] .mochi-bubble{background:var(--mochi-accent);color:#21182e;border-color:transparent;border-top-right-radius:6px}.mochi-message[data-grouped=true]{margin-top:-6px}.mochi-message[data-grouped=true] .mochi-message-meta{min-height:28px}
.mochi-composer{gap:7px;padding-top:10px}.mochi-composer-row{gap:6px;align-items:center;padding:4px;border:1px solid var(--mochi-border);border-radius:26px;background:color-mix(in srgb,var(--lp-text,#fff) 4%,var(--mochi-surface))}.mochi-composer textarea{background:transparent;border:0;border-radius:20px;padding:10px 9px}.mochi-composer .mochi-icon-button{height:44px}.mochi-composer select{max-width:100%;border-radius:99px;background:transparent;border-color:transparent}.mochi-composer-hint{text-align:center}.mochi-notification-entry{display:flex;align-items:center;gap:4px;min-width:0}.mochi-notification-entry .mochi-card{flex:1;min-width:0}.mochi-notification-entry>.mochi-icon-button{background:transparent;border-color:transparent}.mochi-notification-list>.mochi-actions{justify-content:flex-start;flex-wrap:wrap}
@media (hover:none){.mochi-view .mochi-message-actions{opacity:.7}}
@container (max-width:360px){.mochi-standalone{display:none}}
/* Layout correction: compact identities, separate author/time hierarchy. */
.mochi-view .mochi-room-header{grid-template-columns:minmax(0,1fr) 44px}.mochi-view .mochi-member-strip{align-self:flex-start;width:auto;display:flex;align-items:center;gap:10px;flex-wrap:nowrap;padding:0;min-height:44px;border:0;background:transparent;text-align:left}.mochi-portrait-stack{display:flex;align-items:center;padding-left:0;flex:none}.mochi-portrait-stack .mochi-avatar{width:32px;height:32px;border:2px solid var(--mochi-surface)}.mochi-portrait-stack .mochi-avatar+.mochi-avatar{margin-left:-10px}.mochi-participant-count{font-size:12px;color:var(--lp-muted,#a9a3b5)}.mochi-thread{border-top:1px solid var(--mochi-border);padding-top:16px;gap:20px}.mochi-message-avatar{width:38px;height:38px;margin-top:0}.mochi-message-body{max-width:min(86%,calc(100% - 47px));gap:6px}.mochi-message-name{display:block;width:100%;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px;line-height:20px;overflow-wrap:normal}.mochi-message[data-role=user] .mochi-message-name{text-align:right}.mochi-message-meta{width:auto;max-width:100%;min-height:24px;padding-right:38px;gap:8px}.mochi-message[data-role=user] .mochi-message-meta{justify-content:flex-end}.mochi-message-meta small{white-space:nowrap;font-size:10px}.mochi-view .mochi-message-actions{top:-10px;right:-6px}.mochi-message[data-grouped=true]{margin-top:-16px}.mochi-message[data-grouped=true] .mochi-message-name{display:none}.mochi-message[data-grouped=true] .mochi-message-meta{min-height:24px}.mochi-bubble{padding:11px 14px}.mochi-composer{margin:0 -14px -14px;padding:10px 14px max(14px,env(safe-area-inset-bottom,0px));gap:6px;background:color-mix(in srgb,var(--mochi-accent) 3%,var(--mochi-surface))}.mochi-responder{position:relative;max-width:70%;width:fit-content;min-width:100px;min-height:44px;border-radius:99px;padding:8px 28px 8px 8px;background:color-mix(in srgb,var(--mochi-accent) 6%,var(--mochi-surface));border:1px solid var(--mochi-border)}.mochi-responder::after{content:'⌄';position:absolute;right:10px;top:10px;color:var(--lp-muted,#a9a3b5);pointer-events:none}.mochi-responder-identity{display:flex;align-items:center;gap:7px;min-width:0}.mochi-responder .mochi-avatar{width:26px;height:26px;border:0;flex:none}.mochi-responder .mochi-avatar svg{width:16px;height:16px}.mochi-responder-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.mochi-composer .mochi-responder select{position:absolute;inset:0;height:100%;width:100%;opacity:0;cursor:pointer;min-height:44px}.mochi-responder:focus-within{outline:2px solid var(--mochi-accent);outline-offset:2px}
/* Review correction: corner mascot, heart wordmark, attached metadata. */
.mochi-view>header{display:grid;grid-template-columns:minmax(0,1fr) auto 52px;gap:8px;align-items:center;min-height:60px}.mochi-view .mochi-mascot svg{width:52px;height:42px}.mochi-mascot{justify-self:end;pointer-events:none}.mochi-wordmark-i{position:relative;display:inline-block}.mochi-wordmark-i::before{content:'♥';position:absolute;top:-2px;left:50%;transform:translateX(-50%) rotate(-12deg);font-size:10px;line-height:1;color:#e89dbd;letter-spacing:0}.mochi-message-heading{display:flex;align-items:baseline;width:100%;min-width:0;gap:8px;padding-top:5px}.mochi-message-name{flex:1;width:auto;font-size:12px;line-height:18px}.mochi-message-heading time{flex:none;font-size:10px;line-height:18px}.mochi-message-avatar{margin-top:8px}.mochi-message-body{gap:4px}.mochi-thread{gap:16px;padding-top:12px}.mochi-message-meta,.mochi-message[data-grouped=true] .mochi-message-meta{width:100%;min-height:16px;gap:4px;padding-right:38px;justify-content:flex-start}.mochi-message[data-role=user] .mochi-message-meta{justify-content:flex-start}.mochi-message-meta small{font-size:10px;line-height:16px}.mochi-view .mochi-message-actions{top:-14px;right:-6px}.mochi-message[data-grouped=true]{margin-top:-12px}.mochi-message[data-grouped=true] .mochi-message-heading{padding-top:0;justify-content:flex-end}.mochi-message[data-grouped=true] .mochi-message-avatar{visibility:hidden}
/* Final messenger composition; temporary presence visuals carry no state. */
.mochi-wordmark-i::before{font-size:14px;top:-5px}.mochi-view .mochi-room-header{grid-template-columns:minmax(0,1fr) 96px;align-items:start}.mochi-room-header>.mochi-actions{padding-top:2px}.mochi-room-select{position:relative;min-width:0}.mochi-room-select-icon{position:absolute;left:12px;top:13px;pointer-events:none;color:var(--mochi-accent)}.mochi-room-select-icon svg{width:20px;height:20px}.mochi-view .mochi-room-selector{font-size:14px;font-weight:500;padding-left:40px;padding-right:24px;border-radius:24px}.mochi-room-info{gap:8px}.mochi-room-meta{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--lp-muted,#a9a3b5);min-height:18px;white-space:nowrap}.mochi-room-meta::before{content:'';width:8px;height:8px;flex:none;border-radius:50%;background:#58d998}.mochi-avatar-frame{position:relative;flex:none;width:40px;height:40px;margin-top:5px}.mochi-avatar-frame .mochi-message-avatar{width:40px;height:40px;margin-top:0}.mochi-presence-dot{position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border:2px solid var(--mochi-surface);border-radius:50%;background:#58d998}.mochi-message-body{max-width:min(86%,calc(100% - 49px));gap:4px}.mochi-message-name{font-size:11px;font-weight:600}.mochi-message-heading{gap:7px;padding-top:6px}.mochi-thread{gap:20px;padding-top:14px;border-top:0}.mochi-message-meta,.mochi-message[data-grouped=true] .mochi-message-meta{height:0;min-height:0;padding:0}.mochi-view .mochi-message-actions{top:-21px;right:-5px}.mochi-message[data-grouped=true]{margin-top:-17px}.mochi-message[data-grouped=true] .mochi-avatar-frame{visibility:hidden}.mochi-message[data-grouped=true] .mochi-message-heading{display:none}.mochi-bubble{border-radius:18px;padding:12px 14px}.mochi-message[data-role=assistant] .mochi-bubble{border-top-left-radius:8px}.mochi-message[data-role=user] .mochi-bubble{border-top-right-radius:8px}
.mochi-sheet .lp-sheet-panel{border-radius:22px;border:1px solid var(--lp-border);background:var(--lp-bg);box-shadow:0 14px 42px #0003;padding:18px}.mochi-sheet .mochi-action-panel{gap:5px}.mochi-action-context{font-size:11px;line-height:1.5;color:var(--lp-muted);overflow-wrap:anywhere;margin:0 0 8px}.mochi-sheet .mochi-action-panel>.lp-button{justify-content:flex-start;min-height:48px;padding:12px 14px;border:0;border-radius:12px;background:color-mix(in srgb,var(--lp-text) 4%,var(--lp-bg));font-size:13px}.mochi-sheet .mochi-action-panel>.lp-button:hover{background:color-mix(in srgb,var(--lp-accent) 12%,var(--lp-bg))}.mochi-sheet .mochi-action-panel>[aria-label="Delete message"],.mochi-sheet .mochi-action-panel>[aria-label="Confirm delete"]{color:var(--lp-destructive,#d9677d)}.mochi-sheet .lp-sheet-close{border-radius:99px;min-height:44px}.mochi-sheet :is(button,textarea):focus-visible{outline:2px solid var(--lp-accent);outline-offset:2px}
.mochi-action-context{display:grid;gap:3px;min-width:0}.mochi-action-author{color:var(--lp-text);font-size:12px;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.mochi-action-context small{font-size:11px;font-weight:400}
`;

// src/frontend/components/ui.ts
function classes(...values) {
  return values.filter(Boolean).join(" ");
}
function identityBlock(options) {
  const root = el("div", classes("lp-identity", options.prominent && "lp-identity-prominent", options.centered && "lp-identity-centered", options.className));
  const line = el("div", "lp-identity-line");
  line.appendChild(el("strong", "lp-identity-name", options.name));
  if (options.meta)
    line.appendChild(el("span", "lp-identity-meta", options.meta));
  root.appendChild(line);
  if (options.description)
    root.appendChild(el("p", "lp-identity-description", options.description));
  return root;
}
function statusBadge(label, tone = "neutral") {
  const node = el("span", "lp-status-badge", label);
  node.dataset.tone = tone;
  return node;
}
function actionGroup(className = "") {
  return el("div", classes("lp-actions", className));
}
function sectionBlock(label, help = "", className = "") {
  const section = el("section", classes("lp-section", className));
  const head = el("header", "lp-section-head");
  head.appendChild(el("div", "lp-section-label", label));
  if (help)
    head.appendChild(el("p", "lp-section-help", help));
  const body = el("div", "lp-section-body");
  section.append(head, body);
  return { section, body };
}
function fieldBlock(label, control, help = "") {
  const field = el("label", "lp-field");
  field.appendChild(el("span", "lp-field-label", label));
  field.appendChild(control);
  if (help)
    field.appendChild(el("span", "lp-field-help", help));
  return field;
}
function controlRow(label, control, help = "") {
  const row = el("label", "lp-card lp-control-row");
  const copy = el("span", "lp-control-copy");
  copy.appendChild(el("span", "lp-control-label", label));
  if (help)
    copy.appendChild(el("span", "lp-control-help", help));
  row.append(copy, control);
  return row;
}
function disclosure(label, ...children) {
  const root = el("details", "lp-disclosure");
  root.append(el("summary", "", label), ...children);
  return root;
}
function showPocketSheet(anchor, title, content) {
  const parent = anchor.closest(".lumiphone-shell") || anchor.closest('[role="dialog"]') || anchor.parentElement;
  if (!parent)
    return;
  const dialog = el("dialog", "lp-sheet");
  const panel = el("div", "lp-sheet-panel");
  const heading = el("h2", "lp-title", title);
  dialog.setAttribute("aria-label", title);
  const close = el("button", "lp-button lp-sheet-close", "Done");
  close.type = "button";
  const home = content.parentNode;
  const marker = document.createComment("sheet content");
  home?.insertBefore(marker, content);
  const dismiss = () => dialog.close();
  close.addEventListener("click", dismiss);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog)
      dismiss();
  });
  dialog.addEventListener("close", () => {
    if (home)
      marker.replaceWith(content);
    dialog.remove();
    if (anchor.isConnected)
      anchor.focus();
  }, { once: true });
  panel.append(heading, content, close);
  dialog.append(panel);
  parent.append(dialog);
  const bounds = parent.getBoundingClientRect();
  if (parent.matches(".lumiphone-shell")) {
    const layoutWidth = parent.offsetWidth;
    const zoom = layoutWidth && bounds.width ? bounds.width / layoutWidth : 1;
    const layoutPx = (pixels) => pixels / zoom;
    dialog.style.position = "fixed";
    dialog.style.margin = "0";
    dialog.style.left = `${layoutPx(bounds.left + 12)}px`;
    dialog.style.top = "auto";
    dialog.style.bottom = `${layoutPx(Math.max(12, window.innerHeight - bounds.bottom + 24))}px`;
    dialog.style.width = `${layoutPx(Math.max(0, bounds.width - 24))}px`;
    dialog.style.maxHeight = `${layoutPx(Math.max(120, bounds.height - 70))}px`;
  }
  dialog.showModal();
  return { dismiss };
}
function outgoingSurface(accent) {
  const hex = /^#([0-9a-f]{6})$/i.exec(accent)?.[1] || "8b7dff";
  let rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const luminance = () => rgb.map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  while (luminance() > 0.16)
    rgb = rgb.map((v) => Math.floor(v * 0.95));
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}
function avatarColor(identity) {
  const hash = Array.from(identity).reduce((n, c) => n * 31 + c.charCodeAt(0) >>> 0, 0);
  return `hsl(${hash % 360} 27% 34%)`;
}

// src/mochi/notifications.ts
function notificationBody(n, previews) {
  return previews ? n.body : "New character message";
}
var activeNotices = new WeakMap;
function reconcileMochiNotifications(shell, notices, rooms) {
  for (const toast of shell.querySelectorAll(".mochi-notification-toast")) {
    const previous = activeNotices.get(toast);
    if (!previous || !rooms.has(previous.roomId))
      continue;
    const current = notices.find((n) => n.id === previous.id && n.roomId === previous.roomId);
    if (!current || current.read || current.body !== previous.body || current.title !== previous.title || current.roomTitle !== previous.roomTitle || current.avatarUrl !== previous.avatarUrl)
      toast.remove();
  }
}
function showMochiNotification(shell, n, previews, open) {
  const toast = button("", "lp-floating-notification mochi-notification-toast");
  toast.setAttribute("role", "status");
  activeNotices.set(toast, { ...n });
  const portrait = el("span", "mochi-notification-avatar", n.title.slice(0, 1));
  portrait.style.cssText = "width:32px;height:32px;border-radius:50%;overflow:hidden;flex:none;display:grid;place-items:center;background:var(--lp-surface-2)";
  if (n.avatarUrl) {
    const image = el("img");
    image.src = n.avatarUrl;
    image.alt = "";
    image.style.cssText = "width:100%;height:100%;object-fit:cover";
    portrait.replaceChildren(image);
  }
  const copy = el("span", "lp-grow");
  copy.append(el("strong", "", `${n.title} · ${n.roomTitle}`), el("span", "", notificationBody(n, previews)));
  toast.append(portrait, copy);
  toast.onclick = () => {
    open();
    dismiss();
  };
  shell.append(toast);
  toast.style.maxWidth = "calc(100% - 24px)";
  toast.style.gridTemplateColumns = "32px minmax(0,1fr)";
  copy.style.minWidth = "0";
  copy.firstElementChild.style.overflowWrap = "anywhere";
  const timer = setTimeout(() => toast.remove(), 6000);
  const dismiss = () => {
    clearTimeout(timer);
    toast.remove();
  };
  return dismiss;
}

// src/mochi/types.ts
var defaultMochiSettings = () => ({ autoReply: true, connectionId: "", contextTokens: 8192, outputTokens: 1200, instructions: "", characterNames: {} });
var MOCHI_ROOM_ID = /^room_[a-f0-9]{32}$/;

// src/mochi/view.ts
function action(label, icon, compact = false) {
  const node = button("", `lp-button${compact ? " mochi-icon-button" : ""}`);
  node.setAttribute("aria-label", label);
  node.title = label;
  const glyph = el("span");
  glyph.setAttribute("aria-hidden", "true");
  const extra = { stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', edit: '<path d="m15 4 5 5-11 11H4v-5L15 4Z M12 7l5 5"/>', more: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>' };
  extra.close = '<path d="m6 6 12 12M18 6 6 18"/>';
  glyph.innerHTML = POCKET_ICONS[icon] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${extra[icon] || '<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2"/>'}</svg>`;
  node.append(glyph);
  if (!compact)
    node.append(el("span", "", label));
  return node;
}
function portrait(name, url = "") {
  const node = el("span", "mochi-avatar", name.slice(0, 1).toUpperCase() || "?");
  node.setAttribute("aria-hidden", "true");
  if (url) {
    const img = el("img");
    img.src = url;
    img.alt = "";
    node.replaceChildren(img);
  }
  return node;
}

class MochiView {
  send;
  redraw;
  navigate;
  notificationPolicy;
  notify;
  notificationsChanged;
  state = null;
  roomId = "";
  creating = false;
  editing = false;
  busy = false;
  error = "";
  feedback = "";
  notificationsOpen = false;
  seenNotifications = new Set;
  notificationRevisions = new Map;
  acknowledged = new Set;
  acknowledgementRequests = new Map;
  sheets = new Set;
  operation = "";
  request = "";
  drafts = new Map;
  responders = new Map;
  ownGenerations = new Map;
  selectionVersion = 0;
  requestVersion = 0;
  settingsDraft = null;
  draftRevision = 0;
  timeout;
  draft = null;
  constructor(send, redraw, navigate, notificationPolicy = () => ({ enabled: true, previews: true, visible: true }), notify = () => {}, notificationsChanged = () => {}) {
    this.send = send;
    this.redraw = redraw;
    this.navigate = navigate;
    this.notificationPolicy = notificationPolicy;
    this.notify = notify;
    this.notificationsChanged = notificationsChanged;
  }
  load() {
    this.dispatch("mochi:list");
  }
  select(id) {
    if (this.roomId !== id) {
      this.leave();
      this.selectionVersion++;
      this.roomId = id;
      this.creating = false;
      this.editing = false;
      this.draft = null;
      this.settingsDraft = null;
    }
  }
  leave() {
    for (const dismiss of this.sheets)
      dismiss();
    this.sheets.clear();
    const generationRequestId = this.ownGenerations.get(this.roomId);
    if (generationRequestId)
      this.send({ type: "mochi:cancel", roomId: this.roomId, generationRequestId });
  }
  destroy() {
    this.leave();
    clearTimeout(this.timeout);
  }
  dispatch(type, values = {}) {
    if (this.busy)
      return;
    this.request = requestId("mochi");
    this.requestVersion = this.selectionVersion;
    if (type === "mochi:send" || type === "mochi:regenerate")
      this.ownGenerations.set(this.roomId, this.request);
    this.operation = type;
    this.busy = true;
    this.error = "";
    this.feedback = "";
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.busy = false;
      this.error = "No response received. Refresh the inbox to check whether your room was saved before trying again.";
      this.redraw();
    }, 30000);
    this.send({ type, requestId: this.request, ...values });
    this.redraw();
  }
  receive(payload) {
    if (payload?.type === "mochi:error" && this.acknowledgementRequests.has(payload.requestId)) {
      for (const id of this.acknowledgementRequests.get(payload.requestId))
        this.acknowledged.delete(id);
      this.acknowledgementRequests.delete(payload.requestId);
      this.error = "Unable to mark notifications as read. Refresh to try again.";
      this.redraw();
      return true;
    }
    if (payload?.type === "mochi:job_finished") {
      const jobs = this.state?.jobs;
      if (jobs && jobs[payload.roomId] === payload.requestId)
        delete jobs[payload.roomId];
      if (this.ownGenerations.get(payload.roomId) === payload.requestId)
        this.ownGenerations.delete(payload.roomId);
      this.redraw();
      return true;
    }
    if (payload?.type === "mochi:notifications") {
      this.acknowledgementRequests.delete(payload.requestId);
      if (this.state)
        this.state.notifications = this.mergeNotifications(payload.notifications || [], payload.notificationRevisions || {});
      this.redraw();
      return true;
    }
    if (payload?.type === "mochi:notification" && payload.notification) {
      const n = payload.notification;
      if (typeof payload.notificationRevision === "number" && payload.notificationRevision <= (this.notificationRevisions.get(n.roomId) ?? -1))
        return true;
      if (this.seenNotifications.has(n.id) || this.state?.notifications?.some((saved) => saved.id === n.id))
        return true;
      if (typeof payload.notificationRevision === "number")
        this.notificationRevisions.set(n.roomId, payload.notificationRevision);
      this.seenNotifications.add(n.id);
      if (this.state)
        this.state.notifications = [n, ...(this.state.notifications || []).filter((item) => item.id !== n.id)];
      const policy = this.notificationPolicy();
      if (policy.visible && this.roomId === n.roomId && !this.editing && !this.creating && !this.notificationsOpen)
        this.markNotifications(n.roomId);
      else if (policy.enabled)
        this.notify(n);
      this.redraw();
      return true;
    }
    if (payload?.type !== "mochi:state" && payload?.type !== "mochi:error")
      return false;
    if (payload.requestId !== this.request)
      return true;
    clearTimeout(this.timeout);
    this.busy = false;
    if (payload.type === "mochi:error") {
      if (this.requestVersion === this.selectionVersion)
        this.error = String(payload.message);
    } else {
      const notifications = this.mergeNotifications(payload.state.notifications || [], Object.fromEntries(payload.state.rooms.map((r) => [r.id, r.notificationRevision || 0])));
      this.state = { ...payload.state, notifications };
      if (payload.accepted && this.operation === "mochi:send" && this.ownGenerations.get(this.roomId) === payload.requestId)
        this.drafts.set(this.roomId, "");
      for (const [id, request] of this.ownGenerations)
        if (this.state && this.state.jobs?.[id] !== request)
          this.ownGenerations.delete(id);
      if (payload.selectedRoomId && this.requestVersion === this.selectionVersion) {
        this.creating = false;
        this.editing = false;
        this.draft = null;
        this.roomId = payload.selectedRoomId;
        this.navigate(this.roomId);
      }
    }
    this.redraw();
    if (this.notificationPolicy().visible && this.roomId && !this.editing && !this.creating && !this.notificationsOpen)
      this.markNotifications(this.roomId);
    return true;
  }
  mergeNotifications(incoming, revisions) {
    const merged = new Map((this.state?.notifications || []).map((n) => [n.id, n]));
    const rooms = new Set([...Object.keys(revisions), ...incoming.map((n) => n.roomId)]);
    const accepted = new Set;
    for (const room of rooms) {
      const revision = revisions[room] ?? 0;
      if (revision < (this.notificationRevisions.get(room) ?? -1))
        continue;
      this.notificationRevisions.set(room, revision);
      accepted.add(room);
      for (const [id, n] of merged)
        if (n.roomId === room)
          merged.delete(id);
      for (const n of incoming.filter((n) => n.roomId === room)) {
        merged.set(n.id, n);
        this.seenNotifications.add(n.id);
      }
    }
    const notices = [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    this.notificationsChanged(notices, accepted);
    return notices;
  }
  render() {
    const page = el("div", "mochi-view");
    const style = el("style");
    style.textContent = MOCHI_STYLES;
    page.append(style);
    const header = el("header");
    const brand = el("div", "mochi-brand");
    const wordmark = el("h2");
    wordmark.setAttribute("aria-label", "Mochi");
    const letters = el("span", "", "Moch"), lastLetter = el("span", "mochi-wordmark-i", "ı");
    letters.setAttribute("aria-hidden", "true");
    lastLetter.setAttribute("aria-hidden", "true");
    wordmark.append(letters, lastLetter);
    brand.append(wordmark);
    const mascot = el("span", "mochi-mascot");
    mascot.setAttribute("aria-hidden", "true");
    mascot.innerHTML = '<svg viewBox="0 0 64 48" fill="none"><path d="M5 33C5 23 17 7 32 7s27 16 27 26c0 8-12 11-27 11S5 41 5 33Z" fill="#f8e4ef" stroke="#d9abc4" stroke-width="2"/><ellipse cx="17" cy="32" rx="5" ry="3" fill="#eea6c1"/><ellipse cx="47" cy="32" rx="5" ry="3" fill="#eea6c1"/><circle cx="24" cy="27" r="2.5" fill="#443242"/><circle cx="40" cy="27" r="2.5" fill="#443242"/><path d="M28 30q2 4 4 0q2 4 4 0" stroke="#443242" stroke-width="2" stroke-linecap="round"/></svg>';
    brand.append(mascot);
    header.append(brand);
    const headerActions = el("div", "mochi-actions");
    if (this.notificationPolicy().enabled) {
      const bell = action("Mochi notifications", "notifications", true);
      const unread = this.state?.notifications?.filter((n) => !n.read).length || 0;
      bell.dataset.unread = String(unread > 0);
      bell.title = `Mochi notifications · ${unread} unread`;
      if (unread)
        bell.append(el("span", "mochi-unread-count", String(unread)));
      bell.onclick = () => {
        this.leave();
        this.notificationsOpen = !this.notificationsOpen;
        this.redraw();
        if (!this.state)
          this.load();
      };
      headerActions.append(bell);
      bell.setAttribute("aria-description", `${unread} unread notifications`);
    }
    header.append(headerActions, mascot);
    page.append(header);
    if (this.error) {
      const error = el("p", "mochi-error", this.error);
      error.setAttribute("role", "alert");
      page.append(error);
    }
    if (!this.state)
      return page;
    if (this.feedback) {
      const status = el("p", "mochi-muted", this.feedback);
      status.setAttribute("role", "status");
      page.append(status);
    }
    for (const warning of this.state.warnings)
      page.append(el("p", "mochi-error", warning));
    if (this.notificationsOpen && this.notificationPolicy().enabled) {
      page.append(this.notificationList());
      return page;
    }
    const room = this.state.rooms.find((room) => room.id === this.roomId);
    if (this.creating || this.editing) {
      page.append(this.form(this.editing ? room : undefined));
      return page;
    }
    if (room) {
      const roomHeader = el("div", "mochi-room-header");
      const info = el("div", "mochi-room-info"), selector = el("select", "mochi-room-selector");
      selector.setAttribute("aria-label", "Select room");
      for (const r of this.state.rooms) {
        const option = el("option", "", r.title);
        option.value = r.id;
        selector.append(option);
      }
      selector.value = room.id;
      selector.onchange = () => this.openRoom(selector.value);
      selector.title = room.title;
      const roomSelector = el("div", "mochi-room-select");
      const groupIcon = el("span", "mochi-room-select-icon");
      groupIcon.setAttribute("aria-hidden", "true");
      groupIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/></svg>';
      roomSelector.append(groupIcon, selector);
      const roomMeta = el("p", "mochi-room-meta", `${room.characterIds.length} ${room.characterIds.length === 1 ? "participant" : "participants"} · active now`);
      roomMeta.title = "Temporary presence display; live status is not tracked.";
      info.append(roomSelector, roomMeta);
      const controls = el("div", "mochi-actions");
      const inbox = action("Room inbox", "back", true);
      inbox.onclick = () => {
        this.select("");
        this.navigate();
      };
      const edit = action("Room settings", "settings", true);
      edit.onclick = () => {
        this.leave();
        this.editing = true;
        this.draft = null;
        this.settingsDraft = null;
        this.redraw();
      };
      const participants = action("Room participants", "people", true);
      participants.onclick = () => {
        const content = el("div", "mochi-participants");
        for (const id of room.characterIds) {
          const c = this.state?.characters.find((c) => c.id === id);
          const name = room.settings?.characterNames[id] || c?.name || "Unavailable character";
          const row = el("div", "mochi-member");
          row.append(portrait(name, c?.avatarUrl), el("span", "", name));
          content.append(row);
        }
        this.sheet(participants, "Room participants", content);
      };
      participants.title = "Room participants";
      controls.append(participants, edit);
      roomHeader.append(info, controls);
      page.append(roomHeader);
      headerActions.prepend(inbox);
      page.append(this.thread(room), this.composer(room));
      return page;
    }
    if (this.roomId)
      page.append(el("p", "mochi-error", "This room is unavailable. Refresh or select another room."));
    page.append(el("p", "mochi-muted", "Your independent character rooms."));
    const create = action("New room", "plus");
    create.classList.add("mochi-primary");
    create.disabled = this.busy;
    create.onclick = () => {
      this.creating = true;
      this.draft = null;
      this.redraw();
    };
    page.append(create);
    if (!this.state.rooms.length)
      page.append(el("p", "mochi-card", "No rooms yet. Choose your characters and the identity you want to use."));
    for (const room of this.state.rooms) {
      const row = button("", "mochi-card");
      const avatars = el("div", "mochi-room-avatars");
      avatars.dataset.single = String(room.characterIds.length === 1);
      for (const id of room.characterIds.slice(0, 4)) {
        const c = this.state.characters.find((c) => c.id === id);
        avatars.append(portrait(room.settings?.characterNames[id] || c?.name || "?", c?.avatarUrl));
      }
      const copy = el("div", "mochi-card-copy");
      copy.append(el("strong", "", room.title), el("span", "mochi-muted", `${room.characterIds.length === 1 ? "Direct room" : `${room.characterIds.length} characters`} · ${room.persona.name}`));
      const last = room.messages.at(-1);
      copy.append(el("span", "mochi-preview", last?.content ? `${last.name}: ${last.content}` : "Start a conversation"));
      row.append(avatars, copy);
      row.onclick = () => this.openRoom(room.id);
      page.append(row);
    }
    return page;
  }
  form(room) {
    const state = this.state;
    if (!this.draft)
      this.draftRevision = room?.revision || 0;
    this.draft ||= { title: room?.title || "", characterIds: [...room?.characterIds || []], persona: room ? "keep" : "manual", name: room?.persona.name || "You", description: room?.persona.description || "" };
    const draft = this.draft;
    this.settingsDraft ||= structuredClone(room?.settings || defaultMochiSettings());
    const settings = this.settingsDraft;
    const form = el("form", "mochi-form");
    form.append(el("h3", "", room ? "Room settings" : "New room"));
    const field = (label, input) => {
      input.setAttribute("aria-label", label);
      const node = el("label", input.tagName === "INPUT" && input.type === "checkbox" ? "mochi-toggle" : "", label);
      node.append(input);
      form.append(node);
    };
    const title = el("input");
    title.required = true;
    title.maxLength = 120;
    title.value = draft.title;
    title.oninput = () => {
      draft.title = title.value;
    };
    field("Room name", title);
    const picker = el("div", "mochi-picker");
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", "Room characters");
    for (const character of state.characters) {
      const choice = button("", "mochi-choice");
      choice.append(portrait(character.name, character.avatarUrl));
      choice.append(el("span", "", character.name));
      choice.setAttribute("aria-pressed", String(draft.characterIds.includes(character.id)));
      choice.onclick = () => {
        draft.characterIds = draft.characterIds.includes(character.id) ? draft.characterIds.filter((id) => id !== character.id) : [...draft.characterIds, character.id];
        choice.setAttribute("aria-pressed", String(draft.characterIds.includes(character.id)));
      };
      picker.append(choice);
    }
    form.append(el("p", "", "Choose 1–12 characters"), picker);
    const persona = el("select");
    const option = (value, label) => {
      const o = el("option", "", label);
      o.value = value;
      persona.append(o);
    };
    if (room)
      option("keep", `Keep saved identity: ${room.persona.name}`);
    option("manual", "Custom identity");
    state.personas.forEach((p, i) => option(String(i), `${p.name} (${p.source === "pocket" ? "Pocket profile" : "Lumiverse persona"})`));
    persona.value = draft.persona;
    persona.onchange = () => {
      draft.persona = persona.value;
      this.redraw();
    };
    field("Your identity in this room", persona);
    if (draft.persona === "manual") {
      const name = el("input");
      name.required = true;
      name.maxLength = 120;
      name.value = draft.name;
      name.oninput = () => {
        draft.name = name.value;
      };
      field("Your name", name);
      const description = el("textarea");
      description.maxLength = 12000;
      description.rows = 3;
      description.value = draft.description;
      description.oninput = () => {
        draft.description = description.value;
      };
      field("Identity description", description);
    }
    if (room) {
      const connection = el("select");
      const empty = el("option", "", "Choose connection");
      empty.value = "";
      connection.append(empty);
      for (const c of state.connections || []) {
        const o = el("option", "", `${c.name} · ${c.model}`);
        o.value = c.id;
        connection.append(o);
      }
      connection.value = settings.connectionId;
      connection.onchange = () => {
        settings.connectionId = connection.value;
      };
      field("Generation connection", connection);
      const auto = el("input");
      auto.type = "checkbox";
      auto.checked = settings.autoReply;
      auto.onchange = () => {
        settings.autoReply = auto.checked;
      };
      field("Reply automatically after sending", auto);
      for (const [label, key] of [["Total token budget", "contextTokens"], ["Maximum reply tokens", "outputTokens"]]) {
        const input = el("input");
        input.type = "number";
        input.value = String(settings[key]);
        input.oninput = () => {
          settings[key] = Number(input.value);
        };
        field(label, input);
      }
      const instructions = el("textarea");
      instructions.maxLength = 6000;
      instructions.value = settings.instructions;
      instructions.oninput = () => {
        settings.instructions = instructions.value;
      };
      field("Room instructions", instructions);
      for (const id of room.characterIds) {
        const input = el("input");
        input.maxLength = 120;
        input.value = settings.characterNames[id] || "";
        input.oninput = () => {
          settings.characterNames[id] = input.value;
        };
        field(`Room name for ${state.characters.find((c) => c.id === id)?.name || id}`, input);
      }
    }
    const save = action(this.busy ? "Saving…" : room ? "Save settings" : "Create room", room ? "settings" : "plus");
    save.classList.add("mochi-primary");
    save.type = "submit";
    save.disabled = this.busy;
    const cancel = action("Cancel", "back");
    cancel.disabled = this.busy;
    cancel.onclick = () => {
      this.creating = false;
      this.editing = false;
      this.draft = null;
      this.redraw();
    };
    const actions = el("div", "mochi-actions");
    actions.append(save, cancel);
    form.append(actions);
    form.onsubmit = (event) => {
      event.preventDefault();
      const selected = draft.persona === "keep" ? undefined : draft.persona === "manual" ? { source: "manual", name: draft.name, description: draft.description } : state.personas[Number(draft.persona)];
      this.dispatch(room ? "mochi:update" : "mochi:create", { roomId: room?.id, revision: room ? this.draftRevision : undefined, title: draft.title, characterIds: draft.characterIds, persona: selected, ...room ? { settings } : {} });
    };
    return form;
  }
  thread(room) {
    const thread = el("div", "mochi-thread");
    thread.setAttribute("role", "log");
    thread.setAttribute("aria-label", "Room messages");
    thread.dataset.pocketThread = "mochi";
    globalThis.requestAnimationFrame?.(() => {
      thread.scrollTop = thread.scrollHeight;
    });
    let previous;
    for (const raw of room.messages) {
      const message = raw;
      const row = el("div", "mochi-message");
      row.dataset.role = message.role;
      row.dataset.messageId = message.id;
      const elapsed = previous ? Date.parse(message.createdAt) - Date.parse(previous.createdAt) : Infinity;
      row.dataset.grouped = String(Boolean(previous && previous.role === message.role && previous.characterId === message.characterId && previous.name === message.name && elapsed >= 0 && elapsed < 300000));
      previous = message;
      const avatar = el("span", "mochi-message-avatar", message.name?.slice(0, 1) || "?");
      if (message.avatarUrl) {
        const image = el("img");
        image.src = message.avatarUrl;
        image.alt = "";
        avatar.replaceChildren(image);
      }
      const avatarFrame = el("span", "mochi-avatar-frame");
      avatarFrame.append(avatar);
      if (message.role === "assistant") {
        const dot = el("span", "mochi-presence-dot");
        dot.setAttribute("aria-hidden", "true");
        dot.title = "Temporary presence indicator";
        avatarFrame.append(dot);
      }
      const body = el("div", "mochi-message-body");
      const time = el("time", "", new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      time.dateTime = message.createdAt;
      const displayName = message.role === "user" ? "You" : message.name || "Unknown";
      const name = el("strong", "mochi-message-name", displayName);
      name.title = message.name || "Unknown";
      row.setAttribute("aria-label", `Message from ${message.name || "Unknown"}`);
      const heading = el("div", "mochi-message-heading");
      heading.append(name, time);
      const meta = el("div", "mochi-message-meta");
      const more = action(`Actions for ${message.name || "message"}`, "more", true);
      more.classList.add("mochi-message-actions");
      more.onclick = () => this.messageActions(more, room, message);
      const bubble = el("div", "mochi-bubble", message.content || "");
      if (message.editedAt) {
        bubble.title = `Edited ${new Date(message.editedAt).toLocaleString()}`;
        bubble.setAttribute("aria-description", bubble.title);
      }
      meta.append(more);
      body.append(heading, bubble, meta);
      row.append(avatarFrame, body);
      thread.append(row);
    }
    if (this.state?.jobs?.[room.id]) {
      const status = el("p", "mochi-muted", "Character is replying…");
      status.setAttribute("role", "status");
      thread.append(status);
    }
    return thread;
  }
  sheet(anchor, title, content) {
    const sheet = showPocketSheet(anchor, title, content);
    if (sheet) {
      this.sheets.add(sheet.dismiss);
      content.closest("dialog")?.classList.add("mochi-sheet");
      content.closest("dialog")?.addEventListener("close", () => this.sheets.delete(sheet.dismiss), { once: true });
    }
    return sheet;
  }
  messageActions(anchor, room, message) {
    const revision = room.revision, content = el("div", "mochi-action-panel");
    const context = el("p", "mochi-action-context");
    const author = el("strong", "mochi-action-author", message.role === "user" ? "You" : message.name);
    author.title = message.name;
    const details = el("small", "", `${new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}${message.editedAt ? ` · Edited ${new Date(message.editedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`);
    if (message.editedAt)
      details.title = `Edited ${new Date(message.editedAt).toLocaleString()}`;
    context.append(author, details);
    content.append(context);
    const sheet = this.sheet(anchor, "Message actions", content);
    const copy = action("Copy message", "copy");
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(message.content);
        this.feedback = "Message copied.";
        sheet?.dismiss();
        this.redraw();
      } catch {
        this.error = "Clipboard is unavailable. Select the message text to copy it.";
        sheet?.dismiss();
        this.redraw();
      }
    };
    const edit = action("Edit message", "edit");
    edit.disabled = this.busy;
    edit.onclick = () => {
      const label = el("label", "", "Message text"), input = el("textarea");
      input.value = message.content;
      input.rows = 5;
      input.maxLength = 32000;
      input.required = true;
      input.setAttribute("aria-label", "Edit message text");
      label.append(input);
      const save = action("Save message", "edit");
      save.onclick = () => {
        if (!input.value.trim()) {
          input.focus();
          return;
        }
        this.dispatch("mochi:message_action", { roomId: room.id, revision, messageId: message.id, action: "edit", content: input.value });
        sheet?.dismiss();
      };
      content.replaceChildren(label, el("p", "mochi-muted", "Later messages stay unchanged. The previous text is retained in room storage."), save);
    };
    const remove = action("Delete message", "trash");
    remove.disabled = this.busy;
    remove.onclick = () => {
      const confirm = action("Confirm delete", "trash");
      confirm.onclick = () => {
        this.dispatch("mochi:message_action", { roomId: room.id, revision, messageId: message.id, action: "delete", confirmed: true });
        sheet?.dismiss();
      };
      content.replaceChildren(el("p", "", "Delete this saved message? Only this message and its prior versions will be removed. Later messages stay unchanged. This cannot be undone."), confirm);
    };
    content.append(copy, edit, remove);
    if (message.role === "assistant") {
      const reroll = action("Regenerate message", "refresh");
      reroll.disabled = this.busy || Boolean(this.state?.jobs?.[room.id]);
      reroll.onclick = () => {
        const confirm = action("Confirm reroll", "refresh");
        confirm.onclick = () => {
          this.dispatch("mochi:regenerate", { roomId: room.id, revision, messageId: message.id, confirmed: true });
          sheet?.dismiss();
        };
        content.replaceChildren(el("p", "", "Reroll using the conversation before this reply? The previous text is retained. Later messages stay unchanged and may no longer fit the new reply."), confirm);
      };
      content.append(reroll);
    }
  }
  markNotifications(id) {
    const unread = this.state?.notifications?.filter((n) => n.roomId === id && !n.read && !this.acknowledged.has(n.id)) || [];
    if (!unread.length)
      return;
    unread.forEach((n) => this.acknowledged.add(n.id));
    const idForRequest = requestId("mochi_read");
    this.acknowledgementRequests.set(idForRequest, unread.map((n) => n.id));
    this.send({ type: "mochi:notification_read", requestId: idForRequest, roomId: id, notificationIds: unread.map((n) => n.id) });
  }
  openRoom(id) {
    this.notificationsOpen = false;
    this.select(id);
    this.navigate(id);
    this.markNotifications(id);
    this.load();
  }
  notificationList() {
    const list = el("div", "mochi-notification-list");
    list.append(el("h3", "", "Mochi notifications"));
    const entries = this.state?.notifications || [];
    list.append(el("p", "mochi-muted", "Reading marks notifications as read. Dismissing them keeps your room messages."));
    const controls = el("div", "mochi-actions");
    const clearRead = action("Clear read", "trash");
    clearRead.disabled = this.busy || !entries.some((n) => n.read);
    clearRead.onclick = () => this.clearNotices("read", entries.filter((n) => n.read));
    const clearAll = action("Clear all", "trash");
    clearAll.disabled = this.busy || !entries.length;
    clearAll.onclick = () => {
      const content = el("div", "mochi-action-panel");
      const sheet = this.sheet(clearAll, "Clear all notifications?", content);
      const confirm = action("Confirm clear all", "trash");
      confirm.onclick = () => {
        this.clearNotices("all", entries);
        sheet?.dismiss();
      };
      content.append(el("p", "", "Dismiss these notifications, including unread ones? Saved room messages stay intact. New notifications arriving afterwards will remain."), confirm);
    };
    controls.append(clearRead, clearAll);
    list.append(controls);
    if (!entries.length)
      list.append(el("p", "mochi-muted", "No character notifications yet."));
    for (const n of entries) {
      const entry = el("div", "mochi-notification-entry");
      entry.dataset.notificationId = n.id;
      const row = button("", "mochi-card");
      const copy = el("div", "mochi-card-copy");
      copy.append(el("strong", "", `${n.title} · ${n.roomTitle}`), el("span", "mochi-preview", notificationBody(n, this.notificationPolicy().previews)), el("small", "mochi-muted", n.read ? "Read" : "New"));
      row.append(portrait(n.title, n.avatarUrl), copy);
      row.onclick = () => this.openRoom(n.roomId);
      const dismiss = action(`Dismiss notification from ${n.title}`, "close", true);
      dismiss.disabled = this.busy;
      dismiss.onclick = () => this.clearNotices("dismiss", [n]);
      entry.append(row, dismiss);
      list.append(entry);
    }
    const back = action("Back to rooms", "back");
    back.onclick = () => {
      this.notificationsOpen = false;
      this.redraw();
    };
    list.append(back);
    return list;
  }
  clearNotices(action, entries) {
    const rooms = new Map;
    for (const n of entries)
      rooms.set(n.roomId, [...rooms.get(n.roomId) || [], n.id]);
    this.dispatch("mochi:notification_clear", { action, rooms: [...rooms].map(([roomId, notificationIds]) => ({ roomId, notificationIds })), confirmed: action === "all" });
  }
  composer(room) {
    const form = el("form", "mochi-composer");
    const responder = el("select");
    responder.setAttribute("aria-label", "Next responder");
    const auto = el("option", "", "Automatic responder");
    auto.value = "auto";
    responder.append(auto);
    for (const id of room.characterIds) {
      const o = el("option", "", room.settings?.characterNames[id] || this.state?.characters.find((c) => c.id === id)?.name || id);
      o.value = id;
      responder.append(o);
    }
    const selected = this.responders.get(room.id) || "auto";
    responder.value = room.characterIds.includes(selected) ? selected : "auto";
    const responderField = el("div", "mochi-responder");
    const identity = el("span", "mochi-responder-identity");
    identity.setAttribute("aria-hidden", "true");
    const showResponder = () => {
      const character = this.state?.characters.find((c) => c.id === responder.value);
      const name = responder.value === "auto" ? "Automatic" : room.settings?.characterNames[responder.value] || character?.name || responder.value;
      const avatar = portrait(name, character?.avatarUrl);
      if (responder.value === "auto")
        avatar.innerHTML = POCKET_ICONS.contacts;
      identity.replaceChildren(avatar, el("span", "mochi-responder-name", name));
      responderField.title = `Next responder: ${name}`;
    };
    showResponder();
    responder.onchange = () => {
      this.responders.set(room.id, responder.value);
      showResponder();
    };
    responderField.append(identity, responder);
    const input = el("textarea");
    input.rows = 1;
    input.maxLength = 32000;
    input.setAttribute("aria-label", "Message");
    input.placeholder = "Message…";
    input.value = this.drafts.get(room.id) || "";
    input.dataset.pocketComposer = `mochi_${room.id}`;
    const guidance = `Messaging as ${room.persona.name}. Enter to send; Shift+Enter for a new line. Send empty to continue.`;
    input.setAttribute("aria-description", guidance);
    input.title = guidance;
    input.oninput = () => {
      this.drafts.set(room.id, input.value);
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
    };
    input.onkeydown = (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    };
    const job = this.state?.jobs?.[room.id];
    const submit = action("Send", "send", true);
    submit.classList.add("mochi-primary");
    submit.type = "submit";
    submit.disabled = this.busy || Boolean(job);
    const stop = action("Stop reply", "stop", true);
    stop.disabled = !job;
    stop.hidden = !job;
    stop.onclick = () => this.send({ type: "mochi:cancel", roomId: room.id, generationRequestId: job });
    form.onsubmit = (event) => {
      event.preventDefault();
      if (!this.busy && !job)
        this.dispatch("mochi:send", { roomId: room.id, revision: room.revision, content: input.value, responder: responder.value });
    };
    const actions = el("div", "mochi-composer-row");
    actions.append(input, submit, stop);
    form.append(responderField, actions);
    return form;
  }
}

// src/frontend/components/tts-connection.ts
async function listTtsConnections(signal) {
  const response = await fetch("/api/v1/tts-connections?limit=100", { credentials: "same-origin", signal });
  if (!response.ok)
    throw new Error("Could not load Lumiverse TTS connections.");
  const payload = await response.json();
  return (Array.isArray(payload.data) ? payload.data : []).flatMap((item) => {
    if (!item || typeof item !== "object")
      return [];
    const value = item;
    return typeof value.id === "string" && typeof value.name === "string" ? [{
      id: value.id,
      name: value.name,
      model: typeof value.model === "string" ? value.model : undefined,
      voice: typeof value.voice === "string" ? value.voice : undefined
    }] : [];
  });
}
async function listTtsChoices(connectionId, kind, signal) {
  const response = await fetch(`/api/v1/tts-connections/${encodeURIComponent(connectionId)}/${kind}`, { credentials: "same-origin", signal });
  if (!response.ok)
    throw new Error("Could not load TTS choices.");
  const payload = await response.json();
  if (payload.error)
    throw new Error("Could not load TTS choices.");
  return (Array.isArray(payload[kind]) ? payload[kind] : []).flatMap((item) => {
    if (!item || typeof item !== "object")
      return [];
    const value = item;
    if (typeof value.id !== "string" || !value.id)
      return [];
    const name = typeof value.label === "string" ? value.label : typeof value.name === "string" ? value.name : value.id;
    return [{ id: value.id, label: `${name}${typeof value.language === "string" && value.language ? ` (${value.language})` : ""}` }];
  });
}
async function synthesizeVoiceMessage(connectionId, text, signal, options) {
  const response = await fetch("/api/v1/tts/synthesize", {
    method: "POST",
    credentials: "same-origin",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId, text, voice: options?.voice || undefined, model: options?.model || undefined })
  });
  if (!response.ok)
    throw new Error("The selected TTS connection could not generate audio. Check it in Lumiverse Connections.");
  const blob = await response.blob();
  if (!blob.size || !/^audio\//i.test(blob.type))
    throw new Error("The TTS connection did not return playable audio.");
  return blob;
}

// src/frontend/components/voice-message.ts
class VoiceMessagePlayer {
  active;
  stop() {
    if (!this.active)
      return;
    const { button, status, utterance, abort, audio, url, timer } = this.active;
    this.active = undefined;
    if (utterance) {
      utterance.onend = utterance.onerror = null;
      window.speechSynthesis.cancel();
    }
    abort?.abort();
    clearTimeout(timer);
    if (audio) {
      audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (url)
      URL.revokeObjectURL(url);
    if (status)
      status.textContent = "";
    button.textContent = "▶ Play voice message";
    button.setAttribute("aria-pressed", "false");
  }
  render(message, voiceURI = "", enabled = true, connectionId = "", connectionOptions) {
    const container = document.createElement("div");
    container.className = "lp-voice-message";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lp-voice-play";
    button.textContent = "▶ Play voice message";
    button.setAttribute("aria-label", `Play voice message from ${message.senderName}`);
    button.setAttribute("aria-pressed", "false");
    const status = document.createElement("span");
    status.className = "lp-voice-status";
    status.setAttribute("role", "status");
    const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    button.disabled = !enabled || !supported && !connectionId;
    if (button.disabled)
      status.textContent = enabled ? "Speech playback unavailable in this browser." : "Voice playback is disabled in Settings.";
    button.addEventListener("click", () => {
      const same = this.active?.button === button;
      this.stop();
      if (same)
        return;
      if (connectionId) {
        const active = { button, status, abort: new AbortController };
        this.active = active;
        button.textContent = "■ Stop voice message";
        button.setAttribute("aria-pressed", "true");
        status.textContent = "Preparing voice message…";
        active.timer = setTimeout(() => {
          if (this.active === active) {
            this.stop();
            status.textContent = "TTS generation timed out. Try again.";
          }
        }, 90000);
        synthesizeVoiceMessage(connectionId, message.text, active.abort.signal, connectionOptions).then(async (blob) => {
          if (this.active !== active)
            return;
          clearTimeout(active.timer);
          active.url = URL.createObjectURL(blob);
          active.audio = new window.Audio(active.url);
          active.audio.onended = () => {
            if (this.active === active)
              this.stop();
          };
          active.audio.onerror = () => {
            if (this.active === active) {
              this.stop();
              status.textContent = "Could not play the generated audio. The transcript is available below.";
            }
          };
          await active.audio.play();
          if (this.active === active)
            status.textContent = "";
        }).catch((error) => {
          if (this.active !== active)
            return;
          this.stop();
          status.textContent = error instanceof Error ? error.message : "TTS playback failed. The transcript is available below.";
        });
        return;
      }
      const utterance = new window.SpeechSynthesisUtterance(message.text);
      const voices = window.speechSynthesis.getVoices();
      let hash = 0;
      for (const char of message.senderActorId || message.senderName)
        hash = hash * 31 + char.charCodeAt(0) >>> 0;
      const defaults = voices.filter((voice) => voice.lang.split("-")[0] === (document.documentElement.lang || navigator.language || "en").split("-")[0]);
      const pool = defaults.length ? defaults : voices;
      const voice = voices.find((voice) => voice.voiceURI === voiceURI) || pool[hash % (pool.length || 1)];
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      this.active = { button, utterance };
      status.textContent = "";
      button.textContent = "■ Stop voice message";
      button.setAttribute("aria-pressed", "true");
      const finish = () => {
        if (this.active?.utterance === utterance) {
          this.active = undefined;
          button.textContent = "▶ Play voice message";
          button.setAttribute("aria-pressed", "false");
        }
      };
      utterance.onend = finish;
      utterance.onerror = () => {
        finish();
        status.textContent = "Could not play this voice message. The transcript is available below.";
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        finish();
        status.textContent = "Speech playback failed. Try again.";
      }
    });
    const transcript = document.createElement("details");
    transcript.className = "lp-voice-transcript";
    const title = document.createElement("summary");
    title.textContent = "Voice message transcript";
    const text = document.createElement("p");
    text.textContent = message.text;
    transcript.append(title, text);
    container.append(button, status, transcript);
    return container;
  }
}

// src/domain/clock-label.ts
var CLOCK_DAY_PART_KEYS = ["dawn", "early_morning", "morning", "late_morning", "noon", "afternoon", "late_afternoon", "evening", "night", "late_night", "midnight"];
function clockDayPart(value) {
  if (typeof value !== "string")
    return "";
  const key = value.trim().toLowerCase().replace(/[_-]/g, " ");
  const match = [...CLOCK_DAY_PART_KEYS].sort((a, b) => b.length - a.length).find((part) => key === part.replaceAll("_", " ") || key.startsWith(part.replaceAll("_", " ") + ","));
  return match || "";
}
function clockLabel(value, dayPart) {
  const raw = typeof value === "string" ? value.trim() : "";
  const key = clockDayPart(dayPart) || clockDayPart(raw);
  if (key) {
    const label = key.replaceAll("_", " ");
    return raw.toLowerCase() === label ? raw : label[0].toUpperCase() + label.slice(1);
  }
  if (/^(?:[01]?\d|2[0-3]):[0-5]\d(?:\s*[AP]M)?$/i.test(raw) || /^[+-]?\d{1,4} minutes?$/.test(raw))
    return raw;
  return "";
}

// src/domain/trackers.ts
var TRACKER_HISTORY_LIMIT = 40;
var KINDS = new Set(["meter", "counter", "state", "timer"]);
var CLOCKS = new Set(["real", "roleplay"]);
var MODES = new Set(["manual", "model", "automatic", "jev"]);
var PRESENTATIONS = new Set(["relationship", "meter", "vitals", "segmented", "counter", "timer", "state", "compact"]);
var TARGETS = new Set(["character", "persona", "relationship", "scene", "world", "custom"]);
function record(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function clean(value, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
function iso(value, fallback) {
  const text = clean(value, 80);
  return Number.isFinite(Date.parse(text)) ? text : fallback;
}
function trackerId(prefix = "trk") {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`}`;
}
function trackerKey(value, fallback = "tracker") {
  const key = clean(value, 120).toLocaleLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return key || fallback;
}
function validateTrackerConfig(value) {
  if (value.updateMode === "jev")
    validateJevTracker(value);
  if (!clean(value.label, 120))
    throw new Error("Give your tracker a name.");
  if (!KINDS.has(value.kind))
    throw new Error("Choose a tracker type.");
  const allowed = value.kind === "state" ? ["state", "compact"] : value.kind === "counter" ? ["counter", "compact"] : value.kind === "timer" ? ["timer", "compact"] : ["meter", "vitals", "relationship", "segmented", "compact"];
  if (!allowed.includes(String(value.presentation)))
    throw new Error("Choose a display that matches this tracker type.");
  if (value.kind === "state") {
    const states = Array.isArray(value.states) ? value.states.map((entry) => clean(entry, 80)).filter(Boolean) : [];
    if (!states.length || !states.includes(String(value.state)))
      throw new Error("Choose a current state from the allowed states.");
    if (value.updateMode === "automatic")
      throw new Error("States use manual or story updates.");
    if (value.initialState && !states.includes(String(value.initialState)))
      throw new Error("Keep the reset state in the allowed states.");
  } else {
    for (const key of ["value", "initialValue", "min", "max", "ratePerHour"]) {
      if (!Number.isFinite(Number(value[key])))
        throw new Error("Tracker numbers must be finite.");
    }
    if (Number(value.max) <= Number(value.min))
      throw new Error("Maximum must be greater than minimum.");
    for (const key of ["value", "initialValue"])
      if (Number(value[key]) < Number(value.min) || Number(value[key]) > Number(value.max))
        throw new Error("Starting and reset values must fit the range.");
    if (value.kind === "counter" && !(Number(value.step) > 0))
      throw new Error("Counter step must be positive.");
    if (value.kind === "timer" && !["up", "down"].includes(String(value.direction)))
      throw new Error("Choose a timer direction.");
  }
  if (!MODES.has(value.updateMode))
    throw new Error("Choose how this tracker updates.");
  if (value.updateMode === "automatic" && !Number(value.ratePerHour))
    throw new Error("Choose a non-zero change per hour for time updates.");
  if (value.updateMode === "model" && value.allowModelWrite !== true)
    throw new Error("Story updates require model changes to be enabled.");
  if (!record(value.target) || !TARGETS.has(value.target.type) || !clean(value.target.label))
    throw new Error("Choose who or what this tracker belongs to.");
  for (const band of Array.isArray(value.bands) ? value.bands : []) {
    if (!record(band) || !clean(band.label) || !Number.isFinite(Number(band.min)) || !Number.isFinite(Number(band.max)) || Number(band.max) <= Number(band.min) || Number(band.min) < Number(value.min) || Number(band.max) > Number(value.max))
      throw new Error("Each band needs a label and a valid range inside the tracker range.");
  }
}
function normalizeTrackerTarget(value, fallback = { type: "custom", id: "", label: "Unassigned" }) {
  if (!record(value))
    return fallback;
  const type = TARGETS.has(value.type) ? value.type : fallback.type;
  return { type, id: clean(value.id, 180), label: clean(value.label, 160) || fallback.label };
}
function normalizeBands(value, min, max, color) {
  const bands = (Array.isArray(value) ? value : []).flatMap((item) => {
    if (!record(item))
      return [];
    const bandMin = Math.max(min, Math.min(max, finite(item.min, min)));
    const bandMax = Math.max(bandMin, Math.min(max, finite(item.max, max)));
    const label = clean(item.label, 80);
    return label ? [{ min: bandMin, max: bandMax, label, color: clean(item.color, 40) || color, meaning: item.meaning === "good" || item.meaning === "bad" ? item.meaning : "neutral" }] : [];
  }).slice(0, 12);
  if (bands.length || max <= min)
    return bands;
  const span = max - min;
  return [
    { min, max: min + span * 0.33, label: "Low", color },
    { min: min + span * 0.33, max: min + span * 0.67, label: "Steady", color },
    { min: min + span * 0.67, max, label: "High", color }
  ];
}
function normalizeHistory(value) {
  return (Array.isArray(value) ? value : []).flatMap((item) => {
    if (!record(item))
      return [];
    const operation = ["set", "add", "subtract", "reset", "set_state", "automatic"].includes(String(item.operation)) ? item.operation : "set";
    const source = item.source === "model" || item.source === "tag" || item.source === "automatic" || item.source === "migration" || item.source === "jev" ? item.source : "user";
    const createdAt = iso(item.createdAt, new Date().toISOString());
    return [{
      id: clean(item.id, 160) || trackerId("hist"),
      previous: typeof item.previous === "string" ? clean(item.previous, 160) : finite(item.previous, 0),
      next: typeof item.next === "string" ? clean(item.next, 160) : finite(item.next, 0),
      operation,
      amount: Number.isFinite(Number(item.amount)) ? Number(item.amount) : undefined,
      reason: clean(item.reason, 300),
      source,
      createdAt,
      roleplayAt: clean(item.roleplayAt, 80) || undefined
    }];
  }).slice(-TRACKER_HISTORY_LIMIT);
}
function normalizeTracker(value, context = {}) {
  if (!record(value))
    return null;
  const now = context.now || new Date().toISOString();
  const label = clean(value.label, 120);
  if (!label)
    return null;
  const legacy = !KINDS.has(value.kind);
  const kind = legacy ? "meter" : value.kind;
  const min = finite(value.min, kind === "counter" ? 0 : 0);
  const max = Math.max(min, finite(value.max, kind === "counter" ? 999999 : 100));
  const numeric = Math.max(min, Math.min(max, finite(value.value, min)));
  const initialValue = Math.max(min, Math.min(max, finite(value.initialValue, numeric)));
  const color = clean(value.color, 40) || "#8b7dff";
  const ratePerHour = Math.max(-1e5, Math.min(1e5, finite(value.ratePerHour, 0)));
  const target = legacy ? { type: "custom", id: "", label: "Unassigned" } : normalizeTrackerTarget(value.target, context.characterId ? { type: "character", id: context.characterId, label: context.characterName || "Character" } : { type: "custom", id: "", label: "Unassigned" });
  const clock = legacy ? "real" : CLOCKS.has(value.clock) ? value.clock : "real";
  const updateMode = MODES.has(value.updateMode) ? value.updateMode : ratePerHour ? "automatic" : "manual";
  const presentation = PRESENTATIONS.has(value.presentation) ? value.presentation : kind === "counter" ? "counter" : kind === "timer" ? "timer" : kind === "state" ? "state" : "meter";
  const base = {
    id: clean(value.id, 120) || trackerId(),
    key: trackerKey(value.key || label),
    label,
    kind,
    value: numeric,
    initialValue,
    min,
    max,
    unit: clean(value.unit, 40),
    color,
    target,
    updateMode,
    clock,
    allowModelWrite: legacy || updateMode === "jev" ? false : value.allowModelWrite === true,
    modelPrompt: clean(value.modelPrompt, 2000),
    jev: normalizeJevConfig(value.jev),
    jevResult: normalizeJevResult(value.jevResult),
    presentation,
    bands: normalizeBands(value.bands, min, max, color),
    history: normalizeHistory(value.history),
    ratePerHour,
    lastUpdated: iso(value.lastUpdated, now),
    lastRoleplayAt: iso(value.lastRoleplayAt, iso(context.roleplayNow, "")),
    pausedReason: clean(value.pausedReason, 240),
    clockPaused: value.clockPaused === true,
    visibleToModel: value.visibleToModel !== false,
    createdAt: iso(value.createdAt, now),
    updatedAt: iso(value.updatedAt, iso(value.lastUpdated, now))
  };
  if (kind === "state") {
    const states = (Array.isArray(value.states) ? value.states : []).map((entry) => clean(entry, 80)).filter(Boolean).slice(0, 24);
    const initialState = clean(value.initialState, 80) || states[0] || "Unknown";
    const state = clean(value.state, 80) || initialState;
    return { ...base, kind, state, initialState, states: states.includes(state) ? states : [...states, state].slice(0, 24) };
  }
  if (kind === "counter")
    return { ...base, kind, step: Math.max(0.0001, Math.abs(finite(value.step, 1))) };
  if (kind === "timer")
    return { ...base, kind, direction: value.direction === "up" ? "up" : "down" };
  return { ...base, kind };
}
var TRACKER_TEMPLATES = [
  { group: "Character", name: "Health", values: { kind: "meter", label: "Health", key: "health", value: 100, initialValue: 100, min: 0, max: 100, unit: "%", presentation: "vitals", bands: [{ min: 0, max: 35, label: "Critical", color: "#ef6b73", meaning: "bad" }, { min: 35, max: 70, label: "Recovering", color: "#e2b85c", meaning: "neutral" }, { min: 70, max: 100, label: "Healthy", color: "#62c994", meaning: "good" }] } },
  { group: "Character", name: "Hunger", values: { kind: "meter", label: "Hunger", key: "hunger", value: 20, initialValue: 20, min: 0, max: 100, unit: "%", updateMode: "automatic", ratePerHour: 3, clock: "roleplay", bands: [{ min: 0, max: 30, label: "Sated", color: "#62c994", meaning: "good" }, { min: 30, max: 70, label: "Hungry", color: "#e2b85c", meaning: "neutral" }, { min: 70, max: 100, label: "Starving", color: "#ef6b73", meaning: "bad" }] } },
  { group: "Relationship", name: "Trust", values: { kind: "meter", label: "Trust", key: "trust", value: 50, initialValue: 50, min: 0, max: 100, unit: "%", presentation: "relationship", bands: [{ min: 0, max: 30, label: "Wary", color: "#ef6b73", meaning: "bad" }, { min: 30, max: 70, label: "Building trust", color: "#8b7dff", meaning: "neutral" }, { min: 70, max: 100, label: "Trusted", color: "#62c994", meaning: "good" }], target: { type: "relationship", id: "", label: "Current relationship" } } },
  { group: "Relationship", name: "Relationship Status", values: { kind: "state", label: "Relationship Status", key: "relationship_status", state: "Acquaintances", initialState: "Acquaintances", states: ["Strangers", "Acquaintances", "Friends", "Close", "Partners"], presentation: "state", target: { type: "relationship", id: "", label: "Current relationship" } } },
  { group: "Scene", name: "Tension", values: { kind: "meter", label: "Scene Tension", key: "scene_tension", value: 10, initialValue: 10, min: 0, max: 100, unit: "%", bands: [{ min: 0, max: 30, label: "Calm", color: "#62c994", meaning: "good" }, { min: 30, max: 70, label: "Uneasy", color: "#e2b85c", meaning: "neutral" }, { min: 70, max: 100, label: "Flashpoint", color: "#ef6b73", meaning: "bad" }], target: { type: "scene", id: "", label: "Current scene" } } },
  { group: "Resource", name: "Ammo", values: { kind: "counter", label: "Ammo", key: "ammo", value: 12, initialValue: 12, min: 0, max: 999, unit: " rounds", presentation: "counter" } },
  { group: "World", name: "World Alert", values: { kind: "state", label: "World Alert", key: "world_alert", state: "Calm", initialState: "Calm", states: ["Calm", "Watchful", "Alarmed", "Crisis"], target: { type: "world", id: "", label: "Current world" } } },
  { group: "Timer", name: "Countdown", values: { kind: "timer", label: "Countdown", key: "countdown", value: 60, initialValue: 60, min: 0, max: 60, unit: " min", direction: "down", updateMode: "automatic", ratePerHour: -60, clock: "roleplay", presentation: "timer" } },
  { group: "State", name: "Condition", values: { kind: "state", label: "Condition", key: "condition", state: "Stable", initialState: "Stable", states: ["Stable", "Wounded", "Critical", "Recovering"], presentation: "state" } },
  { group: "Blank", name: "Blank meter", values: { kind: "meter", label: "New tracker", key: "new_tracker", value: 0, initialValue: 0, min: 0, max: 100, presentation: "meter" } }
];
function addHistory(tracker, entry) {
  return { ...tracker, history: [...tracker.history, { ...entry, id: trackerId("hist") }].slice(-TRACKER_HISTORY_LIMIT) };
}
function trackerBand(tracker, value = tracker.value) {
  return tracker.bands.find((band, index) => value >= band.min && (value < band.max || index === tracker.bands.length - 1)) || null;
}
function materializeTracker(tracker, roleplayNow, wallNow = new Date().toISOString()) {
  if (tracker.kind === "state" || tracker.updateMode !== "automatic" || !tracker.ratePerHour)
    return { tracker, changed: false };
  if (tracker.clockPaused)
    return { tracker, changed: false };
  const current = tracker.clock === "roleplay" ? Date.parse(roleplayNow) : Date.parse(wallNow);
  const previous = tracker.clock === "roleplay" ? Date.parse(tracker.lastRoleplayAt) : Date.parse(tracker.lastUpdated);
  if (!Number.isFinite(current)) {
    const pausedReason = tracker.clock === "roleplay" ? "Roleplay time is approximate or unavailable." : "Real-time clock is unavailable.";
    return { tracker: { ...tracker, pausedReason }, changed: tracker.pausedReason !== pausedReason };
  }
  if (!Number.isFinite(previous)) {
    const anchor = new Date(current).toISOString();
    return {
      tracker: {
        ...tracker,
        pausedReason: "",
        lastUpdated: tracker.clock === "real" ? anchor : tracker.lastUpdated,
        lastRoleplayAt: tracker.clock === "roleplay" ? anchor : tracker.lastRoleplayAt
      },
      changed: true
    };
  }
  if (current <= previous)
    return { tracker: tracker.pausedReason ? { ...tracker, pausedReason: "" } : tracker, changed: Boolean(tracker.pausedReason) };
  const nextValue = Math.max(tracker.min, Math.min(tracker.max, tracker.value + (current - previous) / 3600000 * tracker.ratePerHour));
  const anchor = new Date(current).toISOString();
  let next = {
    ...tracker,
    value: nextValue,
    pausedReason: "",
    updatedAt: wallNow,
    lastUpdated: tracker.clock === "real" ? anchor : tracker.lastUpdated,
    lastRoleplayAt: tracker.clock === "roleplay" ? anchor : tracker.lastRoleplayAt
  };
  if (nextValue !== tracker.value)
    next = addHistory(next, {
      previous: tracker.value,
      next: nextValue,
      operation: "automatic",
      amount: nextValue - tracker.value,
      reason: tracker.clock === "roleplay" ? "Roleplay time advanced" : "Real time advanced",
      source: "automatic",
      createdAt: wallNow,
      roleplayAt: clean(roleplayNow, 80) || undefined
    });
  return { tracker: next, changed: true };
}

// src/domain/jev.ts
var object = (value) => !!value && typeof value === "object" && !Array.isArray(value);
var clean2 = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
function normalizeJevSettings(value) {
  const raw = object(value) ? value : {};
  const knownProvider = raw.provider === "llm" || raw.provider === "typesafe";
  const model = clean2(raw.model, 100);
  return { enabled: knownProvider && raw.enabled === true, provider: raw.provider === "typesafe" ? "typesafe" : "llm", model: /^jev-[a-zA-Z0-9._-]+$/.test(model) ? model : "jev-latest", autoAfterTurn: knownProvider && raw.autoAfterTurn === true };
}
function normalizeJevConfig(value) {
  const raw = object(value) ? value : {};
  const levels = (Array.isArray(raw.levels) ? raw.levels : []).flatMap((entry) => object(entry) && typeof entry.value === "number" && Number.isFinite(entry.value) && clean2(entry.label, 160) ? [{ value: entry.value, label: clean2(entry.label, 160) }] : []).slice(0, 10);
  return { question: clean2(raw.question, 240), levels, minConfidence: typeof raw.minConfidence === "number" && Number.isFinite(raw.minConfidence) ? Math.min(1, Math.max(0, raw.minConfidence)) : 0.65 };
}
function validateJevTracker(tracker) {
  const raw = object(tracker.jev) ? tracker.jev : {};
  const config = normalizeJevConfig(raw);
  if (!config.question || String(raw.question).trim().length > 240)
    throw new Error("Give the judge a short question (up to 240 characters).");
  if (tracker.kind === "timer" || tracker.kind === "counter")
    throw new Error("The judge estimates values and states. Quantities and timers use exact updates.");
  if (typeof raw.minConfidence !== "number" || raw.minConfidence < 0 || raw.minConfidence > 1 || !Number.isFinite(raw.minConfidence))
    throw new Error("Judge confidence must be between 0 and 1.");
  if (tracker.kind === "state") {
    if (!Array.isArray(tracker.states) || tracker.states.length < 2 || tracker.states.length > 16)
      throw new Error("The judge needs between 2 and 16 allowed states.");
  } else {
    if (!Array.isArray(raw.levels) || raw.levels.length < 2 || raw.levels.length > 10 || config.levels.length !== raw.levels.length)
      throw new Error("The judge needs 2–10 described numeric levels.");
    if (config.levels.some((level, index) => level.value < Number(tracker.min) || level.value > Number(tracker.max) || index > 0 && level.value <= config.levels[index - 1].value))
      throw new Error("Judge levels must increase and fit the tracker range.");
    if (new Set(config.levels.map((level) => level.label)).size !== config.levels.length)
      throw new Error("Give each judge level a different description.");
  }
}
function normalizeJevResult(value) {
  if (!object(value) || !["applied", "unchanged", "uncertain", "invalid"].includes(String(value.status)))
    return;
  return { sourceKey: clean2(value.sourceKey, 200), status: value.status, evaluatedAt: clean2(value.evaluatedAt, 80), message: clean2(value.message, 300), confidence: typeof value.confidence === "number" && Number.isFinite(value.confidence) ? value.confidence : undefined };
}

// src/domain/wallpapers.ts
var frame = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1067" viewBox="0 0 600 1067">${body}</svg>`;
var gradient = (top, bottom) => `<defs><linearGradient id="g" x2=".75" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><path fill="url(#g)" d="M0 0h600v1067H0z"/>`;
var pattern = (background, art, size = 60) => frame(`<defs><pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${art}</pattern></defs><path fill="${background}" d="M0 0h600v1067H0z"/><path fill="url(#p)" d="M0 0h600v1067H0z"/>`);
var BUILTIN_WALLPAPERS = [
  { id: "sunset", name: "Sunset Cove", collection: "Scenes", scrim: 0.08, svg: frame(gradient("#746184", "#f7c49a") + '<circle cx="390" cy="570" r="92" fill="#ffe0af"/><g fill="none" stroke="#f9dbca" stroke-width="12" stroke-linecap="round" opacity=".38"><path d="M85 330h130M310 245h100"/></g><path d="M0 690Q150 610 300 690T600 680v387H0z" fill="#c58780"/><path d="M0 835Q190 670 370 820T600 815v252H0z" fill="#9b6875"/><path d="M0 965Q260 785 600 980v87H0z" fill="#59485f"/><path d="M325 710h130m-115 28h95" stroke="#ffd7ad" stroke-width="8" stroke-linecap="round" opacity=".6"/>') },
  { id: "pink-hearts", name: "Pink Hearts", collection: "Patterns", scrim: 0.05, svg: pattern("#ffabd7", '<path d="M30 18c-12-13-28 6-14 19l14 13 14-13c14-13-2-32-14-19z" fill="#fff4fa"/><path d="M76 66c-8-9-19 4-9 13l9 9 9-9c10-9-1-22-9-13z" fill="#ff61ad"/>', 100) },
  { id: "oled-moon", name: "Black Moonrise", collection: "Scenes", scrim: 0, svg: frame('<path fill="#000" d="M0 0h600v1067H0z"/><circle cx="440" cy="280" r="58" fill="#b8adff"/><g fill="#b8adff"><circle cx="95" cy="130" r="3"/><circle cx="260" cy="400" r="2"/><circle cx="500" cy="100" r="2"/></g><path d="M0 920L200 700l210 170 190-250" fill="none" stroke="#8b7dff" stroke-width="3"/>') },
  { id: "oled-forest", name: "Black Forest", collection: "Scenes", scrim: 0, svg: frame('<path fill="#000" d="M0 0h600v1067H0z"/><g fill="none" stroke="#63d8a4" stroke-width="3"><path d="M0 800Q180 660 600 890M0 950Q350 660 600 950"/><path d="M100 550v170m-55-85 55-100 55 100m190-190v250m-80-110 80-150 80 150"/></g>') },
  { id: "midnight-grid", name: "Midnight Grid", collection: "Patterns", scrim: 0.08, svg: pattern("#151b2c", '<path d="M60 0H0v60" fill="none" stroke="#8d9ab5" stroke-opacity=".18"/>') },
  { id: "linen-dots", name: "Linen Dots", collection: "Patterns", scrim: 0.2, svg: pattern("#e7dfd2", '<circle cx="16" cy="16" r="2" fill="#86796b" opacity=".4"/>', 32) },
  { id: "sage-check", name: "Sage Check", collection: "Patterns", scrim: 0.12, svg: pattern("#a8b6a0", '<path fill="#667b60" opacity=".2" d="M0 0h40v40H0zM40 40h40v40H40z"/><path d="M0 40h80M40 0v80" stroke="#fff" stroke-opacity=".15"/>', 80) },
  { id: "blueprint", name: "Blueprint", collection: "Patterns", scrim: 0.06, svg: pattern("#17354a", '<path d="M0 0h80v80H0zM20 0v80M40 0v80M60 0v80M0 20h80M0 40h80M0 60h80" fill="none" stroke="#8eb9c8" stroke-opacity=".15"/><path d="M36 40h8M40 36v8" stroke="#8eb9c8" stroke-opacity=".55"/>', 80) },
  { id: "rose-waves", name: "Rose Waves", collection: "Patterns", scrim: 0.12, svg: pattern("#482c3a", '<path d="M-30 30Q0 0 30 30T90 30M-30 60Q0 30 30 60T90 60M-30 0Q0-30 30 0T90 0" fill="none" stroke="#c48d9c" stroke-opacity=".26" stroke-width="2"/>') },
  { id: "terrazzo", name: "Terrazzo", collection: "Patterns", scrim: 0.18, svg: pattern("#e8e2d9", '<path fill="#bd8f79" d="M12 12l17 5-9 16z"/><path fill="#738b84" d="M67 13l14 8-6 16-15-7z"/><path fill="#c7b67c" d="M41 58l20-8 7 13-22 9z"/><path fill="#8b879e" d="M10 82l10-8 8 11-14 7z"/><circle cx="82" cy="80" r="4" fill="#bd8f79"/>', 100) },
  { id: "deep-tide", name: "Deep Tide", collection: "Gradients", scrim: 0.05, svg: frame(gradient("#243354", "#0e4d50")) },
  { id: "dusk", name: "Dusk", collection: "Gradients", scrim: 0.1, svg: frame(gradient("#3d355d", "#a56872")) },
  { id: "apricot", name: "Apricot Haze", collection: "Gradients", scrim: 0.18, svg: frame(gradient("#e6b8a1", "#a395b8")) },
  { id: "aurora", name: "Aurora", collection: "Gradients", scrim: 0.1, svg: frame(gradient("#101b35", "#233d40") + '<defs><radialGradient id="a"><stop stop-color="#78c5aa" stop-opacity=".55"/><stop offset="1" stop-color="#78c5aa" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop stop-color="#a58bd5" stop-opacity=".6"/><stop offset="1" stop-color="#a58bd5" stop-opacity="0"/></radialGradient></defs><ellipse cx="70" cy="350" rx="450" ry="600" fill="url(#a)"/><ellipse cx="550" cy="800" rx="450" ry="500" fill="url(#b)"/>') },
  { id: "moonrise", name: "Moonrise", collection: "Scenes", scrim: 0.04, svg: frame(gradient("#101728", "#414364") + '<circle cx="430" cy="290" r="60" fill="#ede2bd"/><g fill="#dce4ec" opacity=".6"><circle cx="95" cy="130" r="2"/><circle cx="280" cy="210" r="2"/><circle cx="500" cy="110" r="2"/><circle cx="160" cy="400" r="2"/></g><path d="M0 820L160 560l210 300 140-190 90 140v257H0z" fill="#25293c"/><path d="M0 930l260-210 340 240v107H0z" fill="#171c2b"/>') },
  { id: "coastal", name: "Coastal Morning", collection: "Scenes", scrim: 0.17, svg: frame(gradient("#94b7c6", "#edc9a5") + '<circle cx="170" cy="390" r="70" fill="#f4deae"/><path d="M0 640Q160 600 300 650T600 630v437H0z" fill="#7ea7ae"/><path d="M0 780Q160 720 330 790T600 770v297H0z" fill="#4f828e"/><path d="M0 930Q200 820 410 950T600 940v127H0z" fill="#315c6d"/>') },
  { id: "desert", name: "Desert Light", collection: "Scenes", scrim: 0.15, svg: frame(gradient("#ddba9a", "#efdbbc") + '<circle cx="450" cy="320" r="85" fill="#f7e6be"/><path d="M0 700Q170 500 600 770v297H0z" fill="#ca9776"/><path d="M0 890Q290 590 600 830v237H0z" fill="#ac735c"/><path d="M0 940Q400 820 600 1040v27H0z" fill="#805746"/>') },
  { id: "forest", name: "Forest Layers", collection: "Scenes", scrim: 0.05, svg: frame(gradient("#203c3c", "#8ba88b") + '<path d="M0 560Q200 470 600 660v407H0z" fill="#527966"/><path d="M0 790Q350 530 600 780v287H0z" fill="#315b50"/><path d="M0 940Q220 720 600 940v127H0z" fill="#1b3d38"/>') }
];
function builtinWallpaper(id) {
  return BUILTIN_WALLPAPERS.find((entry) => entry.id === id);
}
function builtinWallpaperUrl(id) {
  const item = builtinWallpaper(id);
  return item ? `data:image/svg+xml,${encodeURIComponent(item.svg)}` : "";
}

// src/domain/samplers.ts
var SAMPLER_FIELDS = [
  ["temperature", "Temperature", 0, 2, 0.01],
  ["top_p", "Top P", 0, 1, 0.01],
  ["top_k", "Top K", 0, 500, 1],
  ["min_p", "Min P", 0, 1, 0.01],
  ["frequency_penalty", "Frequency penalty", 0, 2, 0.01],
  ["presence_penalty", "Presence penalty", 0, 2, 0.01],
  ["repetition_penalty", "Repetition penalty", 0, 2, 0.01]
];
function normalizeSamplerOverrides(value) {
  const result = {};
  if (!value || typeof value !== "object" || Array.isArray(value))
    return result;
  const raw = value;
  for (const [key, , min, max, step] of SAMPLER_FIELDS) {
    const entry = raw[key];
    const lower = key === "frequency_penalty" || key === "presence_penalty" ? -2 : min;
    const upper = key === "repetition_penalty" ? 3 : max;
    if (typeof entry === "number" && Number.isFinite(entry) && entry >= lower && entry <= upper && (step !== 1 || Number.isInteger(entry)))
      result[key] = entry;
  }
  return result;
}

// src/domain/preferences.ts
var PREFERENCES_VERSION = 5;
var HEX = /^#[0-9a-f]{6}$/i;
var THEME_COLORS = {
  midnight: {
    accent: "#8b7dff",
    bezel: "#0c0c0f",
    background: "#000000",
    surface: "#101014",
    text: "#f8f6ff",
    wallpaperPrimary: "#171327",
    wallpaperSecondary: "#123a4a",
    chatPrimary: "#08080b",
    chatSecondary: "#000000"
  },
  pink: {
    accent: "#ff69b4",
    bezel: "#f28ac2",
    background: "#fff0f8",
    surface: "#ffe0f0",
    text: "#38122c",
    wallpaperPrimary: "#ffabd7",
    wallpaperSecondary: "#ffd4eb",
    chatPrimary: "#ffe8f4",
    chatSecondary: "#fff0f8"
  },
  porcelain: {
    accent: "#6657d9",
    bezel: "#d6d0cb",
    background: "#f2f0ed",
    surface: "#f7f3ef",
    text: "#201d25",
    wallpaperPrimary: "#eeeae6",
    wallpaperSecondary: "#cfd9e8",
    chatPrimary: "#e4def8",
    chatSecondary: "#faf8f6"
  },
  rose: {
    accent: "#ffb27d",
    bezel: "#291d21",
    background: "#171318",
    surface: "#271e25",
    text: "#fff5ec",
    wallpaperPrimary: "#796484",
    wallpaperSecondary: "#e8a27b",
    chatPrimary: "#30222a",
    chatSecondary: "#19151b"
  },
  forest: {
    accent: "#63d8a4",
    bezel: "#080d0a",
    background: "#000000",
    surface: "#0e1712",
    text: "#f1fff8",
    wallpaperPrimary: "#14372a",
    wallpaperSecondary: "#1d5a41",
    chatPrimary: "#06100a",
    chatSecondary: "#000000"
  }
};
function record2(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function text(value, fallback = "", max = 12000) {
  return typeof value === "string" ? value.trim().slice(0, max) || fallback : fallback;
}
function bool(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function numberIn(value, fallback, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}
function defaultWallpaper() {
  return { source: null, fit: "cover", focalX: 0.5, focalY: 0.5, scrim: 0.22 };
}
function normalizeImageSource(value) {
  const raw = record2(value);
  if (raw.kind === "builtin") {
    const wallpaperId = text(raw.wallpaperId, "", 100);
    return builtinWallpaper(wallpaperId) ? { kind: "builtin", wallpaperId } : null;
  }
  if (raw.kind === "gallery") {
    const imageId = text(raw.imageId, "", 180);
    return imageId ? { kind: "gallery", imageId } : null;
  }
  if (raw.kind === "asset") {
    const assetId = text(raw.assetId, "", 180);
    return assetId ? { kind: "asset", assetId } : null;
  }
  if (raw.kind === "url") {
    const url = text(raw.url, "", 2000);
    return /^(https?:\/\/|\/)/i.test(url) ? { kind: "url", url } : null;
  }
  return null;
}
function normalizeWallpaper(value, legacyUrl = "") {
  const raw = record2(value);
  const fit = raw.fit === "contain" || raw.fit === "stretch" ? raw.fit : "cover";
  const migratedUrl = text(legacyUrl, "", 2000);
  return {
    source: normalizeImageSource(raw.source) || (/^(https?:\/\/|\/)/i.test(migratedUrl) ? { kind: "url", url: migratedUrl } : null),
    fit,
    focalX: numberIn(raw.focalX, 0.5, 0, 1),
    focalY: numberIn(raw.focalY, 0.5, 0, 1),
    scrim: numberIn(raw.scrim, 0.22, 0, 0.85)
  };
}
function safeColor(value, fallback) {
  const candidate = text(value, fallback, 16);
  return HEX.test(candidate) ? candidate.toLowerCase() : fallback;
}
function themePalette(theme) {
  return structuredClone(THEME_COLORS[theme === "custom" ? "midnight" : theme]);
}
function defaultPreferences() {
  return {
    version: PREFERENCES_VERSION,
    voiceMessages: true,
    ttsVoiceURI: "",
    ttsConnectionId: "",
    ttsConnectionOptions: {},
    theme: "midnight",
    colors: themePalette("midnight"),
    homeWallpaper: defaultWallpaper(),
    chatWallpaper: defaultWallpaper(),
    handsetScale: 1,
    uiScale: 1,
    animation: "spring",
    animationDurationMs: 280,
    reducedMotion: false,
    nativeTouchScrollMode: "auto",
    autoOpenOnModelAction: false,
    inlineAppearance: "cards",
    pushNotifications: false,
    useSwarmProfile: true,
    sceneEnhancer: true,
    jev: normalizeJevSettings(null),
    generationMode: "roleplay",
    automaticGenerationRetry: true,
    sidecarConnectionId: "",
    sidecarModelOverride: "",
    samplerOverrides: {},
    autoReplyAfterSend: false,
    replyCadence: "natural",
    ambientMessaging: "off",
    roleplayContextMode: "smart",
    showReconciliationStatus: true,
    recentRoleplayMessages: 8,
    notificationSounds: false,
    notificationPreviews: true,
    notifyMessages: true,
    notifyContacts: true,
    notifyTrackers: true,
    customCss: "",
    personaAppearance: {},
    generationHistory: [],
    manualVisualProfile: { positive: "", negative: "", model: "", connectionId: "", loras: [], parameters: {} }
  };
}
function normalizePreferences(value) {
  const fallback = defaultPreferences();
  const raw = record2(value);
  const version = Number(raw.version ?? 0);
  if (Number.isFinite(version) && version > PREFERENCES_VERSION)
    return fallback;
  const allowedThemes = new Set(["midnight", "porcelain", "rose", "forest", "pink", "custom"]);
  const theme = allowedThemes.has(raw.theme) ? raw.theme : fallback.theme;
  const preset = themePalette(theme);
  const colors = record2(raw.colors);
  const legacyAccent = safeColor(raw.accent, preset.accent);
  const legacyBezel = safeColor(raw.bezelColor, preset.bezel);
  const palette = {
    accent: safeColor(colors.accent, legacyAccent),
    bezel: safeColor(colors.bezel, legacyBezel),
    background: safeColor(colors.background, preset.background),
    surface: safeColor(colors.surface, preset.surface),
    text: safeColor(colors.text, preset.text),
    wallpaperPrimary: safeColor(colors.wallpaperPrimary, preset.wallpaperPrimary),
    wallpaperSecondary: safeColor(colors.wallpaperSecondary, preset.wallpaperSecondary),
    chatPrimary: safeColor(colors.chatPrimary, preset.chatPrimary),
    chatSecondary: safeColor(colors.chatSecondary, preset.chatSecondary)
  };
  const manual = record2(raw.manualVisualProfile);
  const allowedAnimations = new Set(["spring", "slide", "fade", "none"]);
  const history = (Array.isArray(raw.generationHistory) ? raw.generationHistory : []).slice(-24).flatMap((entry) => {
    const item = record2(entry);
    const requestId = text(item.requestId, "", 180);
    const task = text(item.task, "", 40);
    const tasks = new Set(["npc-contact", "profile-refresh", "scene-sync", "persona-profile", "message-reply", "message-retry", "group-reply", "reply-decision", "ambient-decision", "continuity-seed", "post-turn-audit", "scene-planner", "connection-test", "weather-week", "timeline-review", "tracker-judge"]);
    if (!requestId || !tasks.has(task))
      return [];
    const status = item.status === "completed" || item.status === "failed" ? item.status : "started";
    return [{
      requestId,
      task,
      mode: item.mode === "sidecar" ? "sidecar" : "roleplay",
      connectionId: text(item.connectionId, "", 180),
      connectionName: text(item.connectionName, "", 180),
      provider: text(item.provider, "", 120),
      model: text(item.model, "", 500),
      status,
      startedAt: text(item.startedAt, new Date(0).toISOString(), 40),
      completedAt: text(item.completedAt, "", 40) || undefined,
      latencyMs: Number.isFinite(Number(item.latencyMs)) ? Math.max(0, Math.round(Number(item.latencyMs))) : undefined,
      error: text(item.error, "", 500) || undefined
    }];
  });
  const rawPersonaAppearance = record2(raw.personaAppearance);
  const personaAppearance = {};
  for (const [personaId, value] of Object.entries(rawPersonaAppearance).slice(0, 32)) {
    if (!personaId || personaId.length > 180)
      continue;
    const item = record2(value);
    const overrideTheme = allowedThemes.has(item.theme) ? item.theme : theme;
    const overrideColors = record2(item.colors);
    const overridePreset = themePalette(overrideTheme);
    personaAppearance[personaId] = {
      enabled: bool(item.enabled, false),
      theme: overrideTheme,
      colors: {
        accent: safeColor(overrideColors.accent, overridePreset.accent),
        bezel: safeColor(overrideColors.bezel, overridePreset.bezel),
        background: safeColor(overrideColors.background, overridePreset.background),
        surface: safeColor(overrideColors.surface, overridePreset.surface),
        text: safeColor(overrideColors.text, overridePreset.text),
        wallpaperPrimary: safeColor(overrideColors.wallpaperPrimary, overridePreset.wallpaperPrimary),
        wallpaperSecondary: safeColor(overrideColors.wallpaperSecondary, overridePreset.wallpaperSecondary),
        chatPrimary: safeColor(overrideColors.chatPrimary, overridePreset.chatPrimary),
        chatSecondary: safeColor(overrideColors.chatSecondary, overridePreset.chatSecondary)
      },
      customCss: text(item.customCss, "", 30000),
      homeWallpaper: normalizeWallpaper(item.homeWallpaper, text(item.wallpaperImageUrl, "", 2000)),
      chatWallpaper: normalizeWallpaper(item.chatWallpaper, text(item.chatWallpaperImageUrl, "", 2000))
    };
  }
  const contextMode = raw.roleplayContextMode === "off" || raw.roleplayContextMode === "recent" || raw.roleplayContextMode === "story" ? raw.roleplayContextMode : "smart";
  return {
    version: PREFERENCES_VERSION,
    theme,
    voiceMessages: bool(raw.voiceMessages, true),
    ttsVoiceURI: text(raw.ttsVoiceURI, "", 500),
    ttsConnectionId: text(raw.ttsConnectionId, "", 180),
    ttsConnectionOptions: Object.fromEntries(Object.entries(record2(raw.ttsConnectionOptions)).slice(0, 100).filter(([id]) => id.length <= 180 && !["__proto__", "constructor", "prototype"].includes(id)).map(([id, value]) => [id, { voice: text(record2(value).voice, "", 500), model: text(record2(value).model, "", 500) }])),
    colors: palette,
    homeWallpaper: normalizeWallpaper(raw.homeWallpaper, text(raw.wallpaperImageUrl, "", 2000)),
    chatWallpaper: normalizeWallpaper(raw.chatWallpaper, text(raw.chatWallpaperImageUrl, "", 2000)),
    handsetScale: numberIn(raw.handsetScale, fallback.handsetScale, 0.8, 1.25),
    uiScale: numberIn(raw.uiScale, fallback.uiScale, 0.7, 1.3),
    animation: allowedAnimations.has(String(raw.animation)) ? raw.animation : fallback.animation,
    animationDurationMs: Math.round(numberIn(raw.animationDurationMs, fallback.animationDurationMs, 0, 700)),
    reducedMotion: bool(raw.reducedMotion, fallback.reducedMotion),
    nativeTouchScrollMode: raw.nativeTouchScrollMode === "native" || raw.nativeTouchScrollMode === "guarded" || raw.nativeTouchScrollMode === "auto" ? raw.nativeTouchScrollMode : raw.nativeTouchScrolling === true ? "native" : "auto",
    autoOpenOnModelAction: bool(raw.autoOpenOnModelAction, fallback.autoOpenOnModelAction),
    inlineAppearance: raw.inlineAppearance === "phone" ? "phone" : "cards",
    pushNotifications: bool(raw.pushNotifications, fallback.pushNotifications),
    useSwarmProfile: bool(raw.useSwarmProfile, fallback.useSwarmProfile),
    sceneEnhancer: bool(raw.sceneEnhancer, fallback.sceneEnhancer),
    jev: normalizeJevSettings(raw.jev),
    generationMode: raw.generationMode === "sidecar" ? "sidecar" : "roleplay",
    automaticGenerationRetry: bool(raw.automaticGenerationRetry, true),
    sidecarConnectionId: text(raw.sidecarConnectionId, "", 180),
    sidecarModelOverride: text(raw.sidecarModelOverride, "", 500),
    samplerOverrides: normalizeSamplerOverrides(raw.samplerOverrides),
    autoReplyAfterSend: bool(raw.autoReplyAfterSend, fallback.autoReplyAfterSend),
    replyCadence: raw.replyCadence === "instant" || raw.replyCadence === "quick" || raw.replyCadence === "relaxed" ? raw.replyCadence : "natural",
    ambientMessaging: raw.ambientMessaging === "sparse" || raw.ambientMessaging === "normal" ? raw.ambientMessaging : "off",
    roleplayContextMode: contextMode,
    showReconciliationStatus: bool(raw.showReconciliationStatus, fallback.showReconciliationStatus),
    recentRoleplayMessages: Math.round(numberIn(raw.recentRoleplayMessages, fallback.recentRoleplayMessages, 0, 20)),
    notificationSounds: bool(raw.notificationSounds, fallback.notificationSounds),
    notificationPreviews: bool(raw.notificationPreviews, fallback.notificationPreviews),
    notifyMessages: bool(raw.notifyMessages, fallback.notifyMessages),
    notifyContacts: bool(raw.notifyContacts, fallback.notifyContacts),
    notifyTrackers: bool(raw.notifyTrackers, fallback.notifyTrackers),
    customCss: text(raw.customCss, "", 30000),
    personaAppearance,
    generationHistory: history,
    manualVisualProfile: {
      positive: text(manual.positive, "", 12000),
      negative: text(manual.negative, "", 12000),
      model: text(manual.model, "", 500),
      connectionId: text(manual.connectionId, "", 200),
      loras: (Array.isArray(manual.loras) ? manual.loras : []).slice(0, 24).flatMap((entry) => {
        const item = record2(entry);
        const name = text(item.name, "", 500);
        if (!name)
          return [];
        return [{ name, weight: numberIn(item.weight, 1, -4, 4) }];
      }),
      parameters: record2(manual.parameters)
    }
  };
}
function wallpaperCss(primary, secondary) {
  return `linear-gradient(145deg, ${safeColor(primary, "#171327")} 0%, ${safeColor(secondary, "#123a4a")} 100%)`;
}

// src/domain/navigation.ts
var APPS = new Set(["home", "messages", "mochi", "contacts", "gallery", "camera", "notes", "weather", "calendar", "trackers", "notifications", "settings"]);
function shortId(value) {
  if (typeof value !== "string")
    return;
  const clean = value.trim().slice(0, 180);
  return clean || undefined;
}
function normalizePocketRoute(value, fallback = { app: "home" }) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fallback;
  const raw = value;
  const app = typeof raw.app === "string" && APPS.has(raw.app) ? raw.app : fallback.app;
  if (app === "mochi")
    return { app, ...typeof raw.roomId === "string" && MOCHI_ROOM_ID.test(raw.roomId) ? { roomId: raw.roomId } : {} };
  if (app === "messages")
    return {
      app,
      conversationId: shortId(raw.conversationId),
      contactId: shortId(raw.contactId),
      messageId: shortId(raw.messageId),
      view: raw.view === "new-group" || raw.view === "group-editor" || raw.view === "group-detail" || raw.view === "thread" ? raw.view : undefined
    };
  if (app === "contacts")
    return {
      app,
      contactId: shortId(raw.contactId),
      groupId: shortId(raw.groupId),
      view: ["detail", "config", "import", "quick-gen", "new", "draft", "list", "groups", "group-config", "bank", "cast-config", "cast-import", "bank-entry"].includes(String(raw.view)) ? raw.view : undefined
    };
  if (app === "trackers")
    return {
      app,
      trackerId: shortId(raw.trackerId),
      view: raw.view === "config" ? "config" : raw.view === "detail" ? "detail" : undefined
    };
  if (app === "calendar")
    return { app, eventId: shortId(raw.eventId) };
  if (app === "notes")
    return { app, noteId: shortId(raw.noteId) };
  if (app === "gallery")
    return { app, imageId: shortId(raw.imageId) };
  if (app === "settings")
    return { app, section: shortId(raw.section) };
  if (app === "camera")
    return { app, contactId: shortId(raw.contactId), ...raw.draft === true ? { draft: true } : {} };
  if (app === "weather" || app === "notifications" || app === "home")
    return { app };
  return fallback;
}

// src/domain/phone-events.ts
function callSummary(call) {
  return `${call.status === "connected" ? "Call connected" : call.status === "ended" ? "Call ended" : "Missed call"}${call.speakerphone ? " · Speakerphone" : ""}${call.durationSeconds === undefined ? "" : ` · ${Math.floor(call.durationSeconds / 60)}:${String(call.durationSeconds % 60).padStart(2, "0")}`}`;
}

// src/domain/contacts.ts
function normalizeAvatarFocus(value) {
  const raw = value && typeof value === "object" ? value : {};
  const coord = (n) => Number.isFinite(Number(n)) ? Math.min(100, Math.max(0, Number(n))) : 50;
  return { x: coord(raw.x), y: coord(raw.y) };
}
var ACCENTS = ["#8b7dff", "#ef6f9a", "#55bfa3", "#e19a55", "#5e9ee6", "#b779dc", "#df6f64", "#86a94c"];
function stableContactAccent(seed) {
  let hash = 0;
  for (const char of seed)
    hash = (hash << 5) - hash + char.charCodeAt(0) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}
function contactAvatar(contact) {
  return contact.avatarOverrideUrl || contact.sourceAvatarUrl || contact.avatarUrl;
}
function contactAccent(contact) {
  return contact.colorMode === "source" && contact.sourceAccent ? contact.sourceAccent : contact.accent;
}

// src/domain/actors.ts
function normalizeActorName(value) {
  return typeof value === "string" ? value.normalize("NFKD").replace(/\p{M}+/gu, "").trim().replace(/\s+/g, " ").toLocaleLowerCase().slice(0, 160) : "";
}
function conversationActorIds(conversation) {
  return conversation.participantActorIds?.length ? conversation.participantActorIds : conversation.participantContactIds;
}
function resolvePocketActor(state, actorId) {
  if (state.pocketPersona && state.pocketPersonaActorId && actorId === state.pocketPersonaActorId) {
    return {
      actorId,
      kind: "persona",
      name: state.pocketPersona.displayName || "You",
      role: state.pocketPersona.role || "Persona",
      identityBrief: state.pocketPersona.identityBrief || "",
      accent: state.pocketPersona.accent || "#8b7dff",
      avatarUrl: state.pocketPersona.avatarUrl || "",
      relationship: "close"
    };
  }
  const contact = state.contacts.find((entry) => entry.id === actorId);
  if (contact)
    return contactPresentation(contact, actorId);
  const discovered = state.discoveredActors.find((entry) => entry.id === actorId);
  if (!discovered)
    return null;
  const promoted = discovered.promotedContactId ? state.contacts.find((entry) => entry.id === discovered.promotedContactId) : undefined;
  if (promoted)
    return { ...contactPresentation(promoted, actorId), discovered };
  return {
    actorId,
    kind: "discovered",
    name: discovered.displayName,
    role: discovered.relationship === "close" ? "Close connection" : "Discovered actor",
    identityBrief: "",
    accent: stableContactAccent(discovered.normalizedName || discovered.id),
    avatarUrl: "",
    relationship: discovered.relationship,
    discovered
  };
}
function listPocketActors(state) {
  const promotedContactIds = new Set(state.discoveredActors.map((entry) => entry.promotedContactId).filter((entry) => Boolean(entry)));
  return [
    ...state.discoveredActors.map((entry) => resolvePocketActor(state, entry.id)).filter((entry) => Boolean(entry)),
    ...state.contacts.filter((entry) => !promotedContactIds.has(entry.id)).map((entry) => contactPresentation(entry, entry.id))
  ];
}
function contactPresentation(contact, actorId) {
  return {
    actorId,
    kind: "contact",
    name: contact.name,
    role: contact.role,
    identityBrief: contact.identityBrief || contact.description,
    accent: contactAccent(contact),
    avatarUrl: contactAvatar(contact),
    relationship: contact.relationship,
    contact
  };
}

// src/domain/device.ts
function pocketPersonaActorId(state) {
  const persisted = typeof state.pocketPersonaActorId === "string" ? state.pocketPersonaActorId.trim() : "";
  if (persisted)
    return persisted;
  const linked = state.pocketPersona?.linkedPersonaId?.trim();
  const name = normalizeActorName(state.pocketPersona?.displayName).replace(/\s+/g, "_").slice(0, 120);
  return `persona:${linked || name || `${state.chatId}:${state.characterId}` || "owner"}`;
}
function messageSenderActorId(state, message) {
  if (message.sender === "persona")
    return message.senderActorId || pocketPersonaActorId(state);
  return message.senderActorId || message.senderContactId || "";
}
function conversationDeviceActorIds(state, conversation) {
  const result = conversation.includesPocketPersona ? [pocketPersonaActorId(state)] : [];
  for (const actorId of conversation.participantActorIds || conversation.participantContactIds || []) {
    if (actorId && !result.includes(actorId))
      result.push(actorId);
  }
  return result;
}
function conversationVisibleOnDevice(state, conversation, deviceOwnerActorId) {
  return conversationDeviceActorIds(state, conversation).includes(deviceOwnerActorId || pocketPersonaActorId(state));
}
function latestDeviceInteractions(state) {
  const index = new Map;
  const rank = (message) => Number.isFinite(Date.parse(message.createdAt)) ? Date.parse(message.createdAt) : -Infinity;
  for (const conversation of state.conversations) {
    let latest;
    for (const message of conversation.messages) {
      if (message.candidateCommitState === "provisional" || message.sender === "system" && !message.call)
        continue;
      if (!latest || rank(message) >= rank(latest))
        latest = message;
    }
    if (!latest)
      continue;
    for (const owner of conversationDeviceActorIds(state, conversation)) {
      const prior = index.get(owner);
      if (!prior || rank(latest) >= rank(prior.message))
        index.set(owner, { conversation, message: latest });
    }
  }
  return index;
}
function activityDeviceOwner(state, activity, currentOwner) {
  if (activity.scope.chatId !== state.chatId || activity.scope.characterId !== state.characterId)
    return null;
  if (activity.route.app !== "messages" || !activity.route.conversationId)
    return currentOwner;
  const conversationId = activity.route.conversationId;
  const conversation = state.conversations.find((entry) => entry.id === conversationId);
  if (!conversation)
    return null;
  const participants = conversationDeviceActorIds(state, conversation);
  const preferred = activity.presentation?.kind === "observed" ? activity.presentation.recipientActorIds || [] : [];
  return [...preferred, currentOwner, ...participants].find((actorId) => participants.includes(actorId) && resolvePocketActor(state, actorId)) || null;
}
function messageDirection(state, conversation, message, deviceOwnerActorId) {
  const owner = deviceOwnerActorId || pocketPersonaActorId(state);
  const sender = messageSenderActorId(state, message);
  if (sender && sender === owner)
    return "outbound";
  const recipients = message.recipientActorIds?.length ? message.recipientActorIds : conversationDeviceActorIds(state, conversation).filter((actorId) => actorId !== sender);
  return recipients.includes(owner) ? "inbound" : "external";
}
function messageReadByDevice(state, message, deviceOwnerActorId) {
  const owner = deviceOwnerActorId || pocketPersonaActorId(state);
  if (messageSenderActorId(state, message) === owner)
    return true;
  if (message.readByActorIds?.includes(owner))
    return true;
  return owner === pocketPersonaActorId(state) ? Boolean(message.read) : false;
}
function conversationUnreadForDevice(state, conversation, deviceOwnerActorId) {
  const owner = deviceOwnerActorId || pocketPersonaActorId(state);
  if (!conversationVisibleOnDevice(state, conversation, owner))
    return 0;
  return conversation.messages.reduce((count, message) => {
    if (message.sender === "system")
      return count;
    return messageDirection(state, conversation, message, owner) === "inbound" && !messageReadByDevice(state, message, owner) ? count + 1 : count;
  }, 0);
}
function counterpartActorIds(state, conversation, deviceOwnerActorId) {
  const owner = deviceOwnerActorId || pocketPersonaActorId(state);
  return conversationDeviceActorIds(state, conversation).filter((actorId) => actorId !== owner);
}
function deviceActorName(state, actorId) {
  if (actorId === pocketPersonaActorId(state))
    return state.pocketPersona.displayName || "You";
  return resolvePocketActor(state, actorId)?.name || "Unknown actor";
}
function conversationTitleForDevice(state, conversation, deviceOwnerActorId) {
  if (conversation.kind === "group")
    return conversation.title || "Group";
  const counterparts = counterpartActorIds(state, conversation, deviceOwnerActorId);
  if (counterparts.length)
    return counterparts.map((actorId) => deviceActorName(state, actorId)).join(" & ");
  return conversation.title || "Conversation";
}
function notificationBelongsToDevice(state, deviceOwnerActorId, targetOwnerActorId) {
  const owner = deviceOwnerActorId || pocketPersonaActorId(state);
  return (targetOwnerActorId || pocketPersonaActorId(state)) === owner;
}

// src/frontend/surface.ts
var PHONE_ASPECT = 9 / 18.4;
var PHONE_BASE_WIDTH = 360;
var PHONE_SCALE_MIN = 0.8;
var PHONE_SCALE_MAX = 1.25;
var surfaceStyles = new WeakMap;
function currentViewport() {
  const visual = window.visualViewport;
  return {
    width: Math.max(1, Math.floor(visual?.width || window.innerWidth)),
    height: Math.max(1, Math.floor(visual?.height || window.innerHeight))
  };
}
function calculatePhoneSurface(scale, viewport = currentViewport(), allowFullscreen = true) {
  const normalizedScale = Math.max(PHONE_SCALE_MIN, Math.min(PHONE_SCALE_MAX, Number(scale) || 1));
  const fullscreen = allowFullscreen && (viewport.width <= 720 || viewport.height <= 540);
  if (fullscreen)
    return { ...viewport, fullscreen: true, x: 0, y: 0 };
  const margin = 24;
  const desiredWidth = PHONE_BASE_WIDTH * normalizedScale;
  const width = Math.max(240, Math.floor(Math.min(desiredWidth, viewport.width - margin, (viewport.height - margin) * PHONE_ASPECT)));
  const height = Math.floor(width / PHONE_ASPECT);
  return {
    width,
    height,
    fullscreen: false,
    x: Math.max(12, Math.floor(viewport.width - width - 18)),
    y: Math.max(12, Math.floor((viewport.height - height) / 2))
  };
}
function applyMobilePhoneSurface(widget, _scale = 1) {
  const geometry = calculatePhoneSurface(1);
  if (widget.isFullscreen() !== geometry.fullscreen)
    widget.setFullscreen(geometry.fullscreen);
  if (!geometry.fullscreen) {
    widget.setSize(geometry.width, geometry.height);
    widget.moveTo(geometry.x, geometry.y);
  }
  return geometry;
}
function applyVisualViewportSurface(host, toLayoutPx = (pixels) => pixels) {
  const visual = window.visualViewport;
  const width = Math.max(1, Math.round(visual?.width || window.innerWidth));
  const height = Math.max(1, Math.round(visual?.height || window.innerHeight));
  const offsetLeft = Math.round(visual?.offsetLeft || 0);
  const offsetTop = Math.round(visual?.offsetTop || 0);
  const styles = {
    width: `${toLayoutPx(width)}px`,
    height: `${toLayoutPx(height)}px`,
    position: "absolute",
    left: "0px",
    top: "0px",
    margin: "0px",
    transform: `translate3d(${toLayoutPx(offsetLeft)}px,${toLayoutPx(offsetTop)}px,0)`,
    "--lp-visual-height": `${toLayoutPx(height)}px`
  };
  let previous = surfaceStyles.get(host);
  if (!previous) {
    previous = new Map;
    surfaceStyles.set(host, previous);
  }
  for (const [property, value] of Object.entries(styles)) {
    const saved = previous.get(property);
    if (saved?.requested === value && host.style.getPropertyValue(property) === saved.applied)
      continue;
    host.style.setProperty(property, value);
    previous.set(property, { requested: value, applied: host.style.getPropertyValue(property) });
  }
  return { width, height, offsetLeft, offsetTop };
}
function clearVisualViewportSurface(host) {
  surfaceStyles.delete(host);
  for (const property of ["width", "height", "position", "left", "top", "transform", "margin"])
    host.style.removeProperty(property);
  host.style.removeProperty("--lp-visual-height");
}
function desktopDockSize(scale, viewport = currentViewport()) {
  const geometry = calculatePhoneSurface(scale, viewport, false);
  return Math.min(viewport.width - 40, Math.max(geometry.width + 32, 292));
}

// src/frontend/touch-scroll.ts
function resolvePocketTouchScrollMode(preference, userAgent = globalThis.navigator?.userAgent || "") {
  if (preference !== "auto")
    return preference;
  return /iPhone|iPod/i.test(userAgent) ? "native" : "guarded";
}
function supportsPocketTouchScroll(widget) {
  return typeof widget?.setTouchScrollMode === "function";
}
function applyPocketTouchScroll(widget, preference) {
  if (supportsPocketTouchScroll(widget))
    widget.setTouchScrollMode(resolvePocketTouchScrollMode(preference));
}

// src/frontend/components/identity-profiles.ts
function identityProfileControls(profiles, kind, contactId, send, readProfile) {
  const panel = el("section", "lp-card lp-settings-section lp-identity-library");
  panel.dataset.profileKind = kind;
  panel.append(el("strong", "", "Reusable phone profiles"), el("p", "lp-copy", "Save stable identity and texting style for other chats. Scene state and phone history stay here."));
  const options = profiles.filter((entry) => entry.kind === kind);
  const select = el("select", "lp-select");
  select.setAttribute("aria-label", `Saved ${kind} profile`);
  select.append(new Option(options.length ? "Choose a saved profile" : "No saved profiles yet", ""));
  for (const entry of options)
    select.append(new Option(entry.name, entry.id));
  const use = button("Use profile", "lp-button lp-button-quiet");
  use.disabled = true;
  select.addEventListener("change", () => {
    use.disabled = !select.value;
  });
  use.addEventListener("click", () => send("lumiphone:identity_profile_apply", { profileId: select.value, kind, contactId }));
  const save = button("Save current profile", "lp-button");
  save.dataset.identitySave = "true";
  save.addEventListener("click", () => {
    const requestId = send("lumiphone:identity_profile_save", { kind, contactId, profile: readProfile?.() });
    panel.dataset.identityRequest = String(requestId || "");
    save.textContent = "Saving…";
    save.disabled = true;
  });
  const actions = el("div", "lp-row");
  actions.append(save, use);
  panel.append(select, actions);
  return panel;
}
function refreshIdentityProfileControls(root, profiles, failed = false) {
  for (const panel of root.querySelectorAll(".lp-identity-library")) {
    const select = panel.querySelector("select");
    const selected = select.value;
    const entries = profiles.filter((entry) => entry.kind === panel.dataset.profileKind);
    select.replaceChildren(new Option(entries.length ? "Choose a saved profile" : "No saved profiles yet", ""));
    for (const entry of entries)
      select.append(new Option(entry.name, entry.id));
    select.value = selected;
    const save = panel.querySelector("[data-identity-save]");
    if (save.disabled) {
      save.disabled = false;
      save.textContent = failed ? "Retry saving profile" : "Saved · save again";
    }
    delete panel.dataset.identityRequest;
  }
}

// src/frontend/components/wallpaper-gallery.ts
function showWallpaperGallery(anchor, wallpaper, targetLabel, apply) {
  const content = el("div", "lp-wallpaper-library");
  const preview = el("div", "lp-wallpaper-library-preview");
  preview.setAttribute("aria-label", "Wallpaper preview");
  const clock = el("span", "lp-wallpaper-library-clock", "9:41");
  clock.setAttribute("aria-hidden", "true");
  const caption = el("strong", "lp-wallpaper-library-caption");
  preview.append(clock, caption);
  const filters = el("div", "lp-tracker-filters");
  const grid = el("div", "lp-wallpaper-library-grid");
  const use = button(`Use for ${targetLabel}`);
  let selected = BUILTIN_WALLPAPERS.find((item) => wallpaper.source?.kind === "builtin" && item.id === wallpaper.source.wallpaperId) || BUILTIN_WALLPAPERS[0];
  const select = (item) => {
    selected = item;
    preview.style.backgroundImage = `linear-gradient(#0002,#0002),url(${JSON.stringify(builtinWallpaperUrl(item.id))})`;
    caption.textContent = item.name;
    for (const card of grid.querySelectorAll("[data-wallpaper-id]"))
      card.setAttribute("aria-pressed", String(card.dataset.wallpaperId === item.id));
  };
  for (const collection of ["All", "Patterns", "Gradients", "Scenes"]) {
    const filter = button(collection, "lp-chip");
    filter.setAttribute("aria-pressed", String(collection === "All"));
    filter.addEventListener("click", () => {
      for (const chip of filters.querySelectorAll("button"))
        chip.setAttribute("aria-pressed", String(chip === filter));
      for (const card of grid.querySelectorAll("[data-collection]"))
        card.hidden = collection !== "All" && card.dataset.collection !== collection;
    });
    filters.append(filter);
  }
  for (const item of BUILTIN_WALLPAPERS) {
    const card = button("", "lp-wallpaper-library-card");
    card.dataset.wallpaperId = item.id;
    card.dataset.collection = item.collection;
    card.setAttribute("aria-label", item.name);
    const art = el("span", "lp-wallpaper-library-art");
    art.style.backgroundImage = `url(${JSON.stringify(builtinWallpaperUrl(item.id))})`;
    art.setAttribute("aria-hidden", "true");
    card.append(art, el("span", "", item.name));
    card.addEventListener("click", () => select(item));
    grid.append(card);
  }
  use.addEventListener("click", () => {
    content.closest("dialog")?.close();
    apply({ ...wallpaper, source: { kind: "builtin", wallpaperId: selected.id }, fit: "cover", focalX: 0.5, focalY: 0.5, scrim: selected.scrim });
  });
  content.append(preview, filters, grid, use);
  select(selected);
  showPocketSheet(anchor, "Pocket Wallpapers", content);
}

// src/frontend/components/image-picker.ts
function range(label, value, update) {
  const node = el("label", "lp-wallpaper-range");
  node.append(el("span", "lp-copy", label));
  const input = el("input");
  input.type = "range";
  input.min = "0";
  input.max = "1";
  input.step = ".01";
  input.value = String(value);
  input.addEventListener("input", () => update(Number(input.value)));
  node.appendChild(input);
  return node;
}
function wallpaperImageControl(label, target, wallpaper, resolved, host) {
  const card = el("section", "lp-wallpaper-control");
  card.dataset.imageTarget = target;
  const heading = el("div", "lp-row-between");
  const copy = el("span");
  copy.append(el("strong", "", label), el("span", "lp-copy", resolved.status === "error" ? `${resolved.sourceLabel} · unavailable` : resolved.sourceLabel));
  const clear = button("Clear", "lp-button lp-button-quiet");
  clear.disabled = !wallpaper.source;
  clear.addEventListener("click", () => host.change({ ...wallpaper, source: null }));
  heading.append(copy, clear);
  const preview = el("div", "lp-wallpaper-preview");
  preview.dataset.empty = String(!resolved.url);
  preview.dataset.resolutionStatus = resolved.status;
  preview.style.backgroundImage = resolved.url ? `linear-gradient(rgba(5,4,8,${wallpaper.scrim}),rgba(5,4,8,${wallpaper.scrim})),url(${JSON.stringify(resolved.url)})` : "";
  preview.style.backgroundSize = wallpaper.fit === "stretch" ? "100% 100%" : wallpaper.fit;
  preview.style.backgroundPosition = `${wallpaper.focalX * 100}% ${wallpaper.focalY * 100}%`;
  preview.textContent = resolved.url ? "" : resolved.error || "Theme background";
  const actions = el("div", "lp-wallpaper-actions");
  const presets = button("Pocket Wallpapers", "lp-button lp-button-quiet lp-wallpaper-presets-button");
  presets.addEventListener("click", () => showWallpaperGallery(presets, wallpaper, target.endsWith("chat") ? "Chat" : "Home", host.change));
  actions.append(presets);
  for (const [mode, text] of [["gallery", "Gallery"], ["upload", "Upload"], ["url", "Image URL"]]) {
    const choose = button(text, "lp-button lp-button-quiet");
    choose.addEventListener("click", () => host.choose(target, mode));
    actions.appendChild(choose);
  }
  const fit = el("select", "lp-select");
  for (const value of ["cover", "contain", "stretch"]) {
    const option = el("option", "", value[0].toUpperCase() + value.slice(1));
    option.value = value;
    option.selected = wallpaper.fit === value;
    fit.appendChild(option);
  }
  fit.setAttribute("aria-label", `${label} fit`);
  fit.addEventListener("change", () => host.change({ ...wallpaper, fit: fit.value }));
  const focal = el("div", "lp-wallpaper-focal");
  focal.append(range("Horizontal focus", wallpaper.focalX, (value) => host.change({ ...wallpaper, focalX: value })), range("Vertical focus", wallpaper.focalY, (value) => host.change({ ...wallpaper, focalY: value })), range("Scrim", wallpaper.scrim, (value) => host.change({ ...wallpaper, scrim: value })));
  card.append(heading, preview, actions, disclosure("Adjust wallpaper", fit, focal));
  return card;
}

// src/frontend/components/tts-settings.ts
function ttsSettings(getSettings, commit, onCleanup) {
  const panel = el("div");
  const connection = el("select", "lp-select");
  connection.setAttribute("aria-label", "Voice message TTS connection");
  const status = el("p", "lp-copy", "Loading Lumiverse TTS connections…");
  const provider = el("div"), browser = el("div");
  const models = el("select", "lp-select");
  models.setAttribute("aria-label", "Voice message TTS model");
  const voices = el("select", "lp-select");
  voices.setAttribute("aria-label", "Voice message provider voice");
  const browserVoices = el("select", "lp-select");
  browserVoices.setAttribute("aria-label", "Voice message TTS voice");
  let connections = [], disposed = false, request;
  const abort = new AbortController;
  onCleanup?.(() => {
    disposed = true;
    abort.abort();
    request?.abort();
  });
  const option = (value, label) => {
    const item = el("option", "", label);
    item.value = value;
    return item;
  };
  const populate = (select, choices, value, label) => {
    select.replaceChildren(option("", label));
    for (const choice of choices)
      select.append(option(choice.id, choice.label));
    if (value && !choices.some((choice) => choice.id === value))
      select.append(option(value, `Saved choice · ${value}`));
    select.value = value;
  };
  const populateConnections = () => {
    const id = getSettings().ttsConnectionId || "";
    connection.replaceChildren(option("", "Browser voices · installed on this device"));
    for (const item of connections)
      connection.append(option(item.id, item.name));
    if (id && !connections.some((item) => item.id === id))
      connection.append(option(id, "Saved connection · currently unavailable"));
    connection.value = id;
  };
  const populateProvider = () => {
    request?.abort();
    const id = getSettings().ttsConnectionId || "";
    provider.hidden = !id;
    browser.hidden = Boolean(id);
    if (!id)
      return;
    const current = connections.find((item) => item.id === id);
    const defaults = { models: `Connection default${current?.model ? ` · ${current.model}` : ""}`, voices: `Connection default${current?.voice ? ` · ${current.voice}` : ""}` };
    const saved = getSettings().ttsConnectionOptions?.[id];
    populate(models, [], saved?.model || "", defaults.models);
    populate(voices, [], saved?.voice || "", defaults.voices);
    models.disabled = voices.disabled = true;
    status.textContent = "Loading models and voices…";
    const pending = new AbortController;
    request = pending;
    const load = async (kind, select) => {
      try {
        const choices = await listTtsChoices(id, kind, pending.signal);
        if (disposed || request !== pending || getSettings().ttsConnectionId !== id)
          return false;
        populate(select, choices, getSettings().ttsConnectionOptions?.[id]?.[kind === "models" ? "model" : "voice"] || "", defaults[kind]);
        select.disabled = false;
        return true;
      } catch {
        if (!disposed && request === pending)
          select.disabled = false;
        return false;
      }
    };
    Promise.all([load("models", models), load("voices", voices)]).then((results) => {
      if (disposed || request !== pending || getSettings().ttsConnectionId !== id)
        return;
      status.textContent = results.every(Boolean) ? "Your choices apply only to Pocket. On Play, the transcript is sent to this TTS provider." : "Some choices could not be loaded. Connection defaults and saved choices remain available; check the connection in Lumiverse.";
    });
  };
  populateConnections();
  populateProvider();
  listTtsConnections(abort.signal).then((items) => {
    if (disposed)
      return;
    connections = items;
    populateConnections();
    populateProvider();
    if (!getSettings().ttsConnectionId)
      status.textContent = items.length ? "Choose a TTS connection, then its model and voice. On Play, the transcript is sent to that provider." : "Add a TTS connection in Lumiverse Connections, or use installed browser voices.";
  }).catch(() => {
    if (!disposed)
      status.textContent = "Lumiverse TTS connections are unavailable on this host. Browser voices are still available.";
  });
  connection.addEventListener("change", () => {
    commit((next) => {
      next.ttsConnectionId = connection.value;
    });
    populateProvider();
    if (!connection.value)
      status.textContent = "Browser voices use the languages installed on this device.";
  });
  for (const [select, key] of [[models, "model"], [voices, "voice"]])
    select.addEventListener("change", () => {
      const id = getSettings().ttsConnectionId;
      if (id)
        commit((next) => {
          next.ttsConnectionOptions = { ...next.ttsConnectionOptions, [id]: { ...next.ttsConnectionOptions?.[id], [key]: select.value } };
        });
    });
  const synthesis = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : undefined;
  const populateBrowser = () => {
    const available = synthesis?.getVoices() || [];
    populate(browserVoices, available.map((item) => ({ id: item.voiceURI, label: `${item.name} (${item.lang})` })), getSettings().ttsVoiceURI || "", "Automatic · consistent voice per character");
  };
  populateBrowser();
  if (synthesis && onCleanup) {
    synthesis.addEventListener("voiceschanged", populateBrowser);
    onCleanup(() => synthesis.removeEventListener("voiceschanged", populateBrowser));
  }
  browserVoices.addEventListener("change", () => commit((next) => {
    next.ttsVoiceURI = browserVoices.value;
  }));
  provider.append(fieldBlock("TTS model", models), fieldBlock("TTS voice", voices));
  browser.append(fieldBlock("Browser voice", browserVoices), el("p", "lp-copy", "Automatic selection follows the app language and keeps a stable voice per character. Languages depend on installed voices; use a TTS connection if the needed language is unavailable."));
  panel.append(fieldBlock("Playback TTS", connection), provider, browser, status, el("p", "lp-copy", "No audio plays automatically. Stop or close Pocket to cancel playback."));
  return panel;
}

// src/frontend/apps/settings.ts
function clone(value) {
  return structuredClone(value);
}
function row(label, detail = "") {
  const node = el("div", "lp-row-between lp-setting-row");
  const copy = el("span");
  copy.append(el("strong", "", label));
  if (detail)
    copy.append(el("span", "lp-copy", detail));
  node.appendChild(copy);
  return node;
}
function toggle(label, initial, update, detail = "") {
  const node = row(label, detail);
  node.dataset.setting = label.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const control = button("", "lp-toggle");
  control.setAttribute("aria-pressed", String(initial));
  control.setAttribute("aria-label", label);
  control.addEventListener("click", () => {
    const next = control.getAttribute("aria-pressed") !== "true";
    control.setAttribute("aria-pressed", String(next));
    update(next);
  });
  node.appendChild(control);
  return node;
}
function color(label, value, update) {
  const node = row(label);
  node.dataset.setting = label.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const control = el("input", "lp-color-input");
  control.type = "color";
  control.value = /^#[0-9a-f]{6}$/i.test(value) ? value : "#8b7dff";
  control.setAttribute("aria-label", label);
  control.addEventListener("input", () => update(control.value));
  node.appendChild(control);
  return node;
}
function themeColorControls(palette, update) {
  const inputs = new Map;
  const control = (label, key, accessibleLabel = label) => {
    const node = color(label, palette[key], (value) => update(key, value));
    const input = node.querySelector("input");
    input.setAttribute("aria-label", accessibleLabel);
    node.dataset.setting = accessibleLabel.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    inputs.set(key, input);
    return node;
  };
  const accent = control("Accent", "accent");
  accent.classList.add("lp-accent-control");
  const body = el("div", "lp-palette-sections");
  const bezel = control("Bezel", "bezel");
  bezel.classList.add("lp-palette-bezel");
  body.append(bezel);
  const groups = [
    ["Interface", [["Background", "background", "UI background"], ["Surface", "surface", "UI surface"], ["Text", "text", "UI text"]]],
    ["Home", [["Top", "wallpaperPrimary", "Home top"], ["Bottom", "wallpaperSecondary", "Home bottom"]]],
    ["Chat", [["Top", "chatPrimary", "Chat top"], ["Bottom", "chatSecondary", "Chat bottom"]]]
  ];
  for (const [label, entries] of groups) {
    const group = el("section", "lp-palette-group");
    group.setAttribute("aria-label", `${label} colors`);
    const grid = el("div", "lp-palette-grid");
    for (const [name, key, accessibleLabel] of entries)
      grid.append(control(name, key, accessibleLabel));
    group.append(el("h3", "lp-palette-heading", label), grid);
    body.append(group);
  }
  const advanced = disclosure("Advanced theme colors", body);
  advanced.classList.add("lp-palette-disclosure");
  return {
    accent,
    advanced,
    sync(next) {
      for (const [key, input] of inputs)
        input.value = next[key];
    }
  };
}
function slider(label, value, min, max, step, format, update, detail = "") {
  const node = el("label", "lp-slider-setting");
  const head = el("span", "lp-row-between");
  const display = el("strong", "", format(value));
  node.dataset.setting = label.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  head.append(el("span", "lp-title", label), display);
  const control = el("input");
  control.type = "range";
  control.min = String(min);
  control.max = String(max);
  control.step = String(step);
  control.value = String(value);
  control.addEventListener("input", () => {
    const next = Number(control.value);
    display.textContent = format(next);
    update(next);
  });
  node.append(head, control);
  if (detail)
    node.append(el("span", "lp-copy", detail));
  return node;
}
function categories(host) {
  const { page, content } = host.page("Settings", "Device-wide preferences");
  content.classList.add("lp-settings-list");
  const entries = [
    ["personalization", "Personalization", "Theme, wallpapers, and your Persona"],
    ["messages", "Messages", "Replies, ambient texts, roleplay context"],
    ["generation", "Pocket Generation", "Model source and connection diagnostics"],
    ["jev", "Tracker judge", "LLM or TypeSafe Jev decisions"],
    ["camera", "Camera & Swarm Studio", "Visual profile and macro diagnostics"],
    ["notifications", "Notifications", "Kinds, previews, push, and sound"],
    ["permissions", "Permissions", "Lumiverse capability access"],
    ["data", "Data & Backup", "Export, import, and reset"]
  ];
  for (const [id, label, detail] of entries) {
    const open = button("", "lp-card lp-settings-category");
    open.dataset.settingsCategory = id;
    const copy = el("span");
    copy.append(el("strong", "", label), el("span", "lp-copy", detail));
    open.append(copy, el("span", "lp-settings-chevron", "›"));
    open.addEventListener("click", () => host.navigate(id));
    content.appendChild(open);
  }
  return page;
}
function appearance(host) {
  let settings = clone(host.draft);
  const commit = (mutate, options) => {
    const next = clone(settings);
    mutate(next);
    settings = normalizePreferences(next);
    host.update(settings, options);
    updatePreview();
  };
  const { page, content } = host.page("Appearance", "Device defaults");
  const themes = el("section", "lp-card lp-settings-section");
  themes.append(el("div", "lp-eyebrow", "Theme"));
  const inline = el("select", "lp-select");
  inline.setAttribute("aria-label", "Inline phone appearance");
  for (const [value, label] of [["cards", "Scene cards"], ["phone", "Full phone"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = (settings.inlineAppearance || "cards") === value;
    inline.append(option);
  }
  inline.addEventListener("change", () => commit((next) => {
    next.inlineAppearance = inline.value === "phone" ? "phone" : "cards";
  }));
  content.append(fieldBlock("Phone events in prose", inline), el("p", "lp-copy", "Choose compact scene cards or a miniature phone. This does not change who can write your character."));
  const themeRow = el("div", "lp-theme-grid");
  for (const [name, wallpaper] of [["midnight", "moonrise"], ["porcelain", "coastal"], ["rose", "sunset"], ["forest", "forest"], ["pink", "pink-hearts"], ["custom", ""]]) {
    const dot = button("", "lp-theme-preview");
    dot.title = name === "rose" ? "Sunset" : name;
    dot.dataset.theme = name;
    dot.setAttribute("aria-label", { midnight: "Black and violet palette", porcelain: "Light neutral palette", rose: "Sunset palette with soft orange accents", forest: "Black and mint palette", pink: "Bubblegum pink palette", custom: "Custom palette" }[name]);
    dot.style.setProperty("--theme-color", name === "custom" ? settings.colors.accent : themePalette(name).accent);
    const miniature = el("span", "lp-theme-miniature");
    miniature.style.backgroundImage = wallpaper ? "url(" + JSON.stringify(builtinWallpaperUrl(wallpaper)) + ")" : "";
    miniature.append(el("span", "", "9:41"), el("span", "lp-theme-miniature-dock", "● ● ●"));
    dot.append(miniature);
    if (name === "custom")
      dot.append(el("span", "lp-theme-custom-label", "Custom"));
    const selected = el("span", "lp-theme-selected", "✓");
    selected.setAttribute("aria-hidden", "true");
    dot.append(selected);
    dot.setAttribute("aria-pressed", String(settings.theme === name));
    dot.addEventListener("click", () => commit((next) => {
      next.theme = name;
      if (name !== "custom") {
        next.colors = themePalette(name);
        next.homeWallpaper = { ...next.homeWallpaper, source: { kind: "builtin", wallpaperId: wallpaper }, fit: "cover", focalX: 0.5, focalY: 0.5 };
      }
    }));
    themeRow.appendChild(dot);
  }
  themes.appendChild(themeRow);
  const paletteControls = themeColorControls(settings.colors, (key, value) => commit((next) => {
    next.theme = "custom";
    next.colors[key] = value;
  }));
  const wallpapers = el("section", "lp-card lp-settings-section");
  wallpapers.append(el("div", "lp-eyebrow", "Wallpaper images"), wallpaperImageControl("Home wallpaper", "device-home", settings.homeWallpaper, host.resolvedWallpapers.deviceHome, {
    choose: host.chooseImage,
    change: (wallpaper) => commit((next) => {
      next.homeWallpaper = wallpaper;
    })
  }), wallpaperImageControl("Chat wallpaper", "device-chat", settings.chatWallpaper, host.resolvedWallpapers.deviceChat, {
    choose: host.chooseImage,
    change: (wallpaper) => commit((next) => {
      next.chatWallpaper = wallpaper;
    })
  }));
  const scaleCard = el("section", "lp-card lp-settings-section");
  scaleCard.append(el("div", "lp-eyebrow", "Sizing"));
  const presets = el("div", "lp-row");
  for (const [label, value] of [["Compact", 0.8], ["Default", 1], ["Large", 1.2]]) {
    const preset = button(label, "lp-chip");
    preset.setAttribute("aria-pressed", String(settings.uiScale === value));
    preset.addEventListener("click", () => commit((next) => {
      next.uiScale = value;
    }));
    presets.appendChild(preset);
  }
  scaleCard.append(presets, slider("Interface size", settings.uiScale, 0.7, 1.3, 0.05, (value) => `${Math.round(value * 100)}%`, (value) => commit((next) => {
    next.uiScale = value;
  }), "Scales Pocket primitives and density on desktop and mobile. It never shrinks the mobile viewport."), slider("Desktop phone size", settings.handsetScale, 0.8, 1.25, 0.05, (value) => `${Math.round(value * 100)}%`, (value) => commit((next) => {
    next.handsetScale = value;
  }, { resize: true }), "Controls only the physical 9:18.4 handset on desktop."));
  const motion = el("section", "lp-card lp-settings-section");
  motion.append(el("div", "lp-eyebrow", "Motion"));
  const animation = el("select", "lp-select");
  for (const value of ["spring", "slide", "fade", "none"]) {
    const option = el("option", "", value[0].toUpperCase() + value.slice(1));
    option.value = value;
    option.selected = settings.animation === value;
    animation.appendChild(option);
  }
  animation.addEventListener("change", () => commit((next) => {
    next.animation = animation.value;
  }));
  motion.append(fieldBlock("Animation", animation), slider("Animation duration", settings.animationDurationMs, 0, 700, 20, (value) => `${value} ms`, (value) => commit((next) => {
    next.animationDurationMs = value;
  })), toggle("Reduce motion", settings.reducedMotion, (value) => commit((next) => {
    next.reducedMotion = value;
  })));
  const scrolling = toggle("Native touch scrolling", resolvePocketTouchScrollMode(settings.nativeTouchScrollMode) === "native", (value) => commit((next) => {
    next.nativeTouchScrollMode = value ? "native" : "guarded";
  }), "On by default on iPhone. Turn off to restore the scroll guard. Requires the Lumiverse Spindle touch scroll API; this choice can be saved before the mobile widget opens.");
  const custom = el("section", "lp-card lp-settings-section");
  custom.append(el("div", "lp-eyebrow", "Advanced custom CSS"), el("p", "lp-copy", "Scoped separately to this Pocket surface and its inline artifacts. Stable hooks include data-pocket-app, data-pocket-thread, data-message-id, data-settings-category, and data-setting."));
  const css = el("textarea", "lp-textarea lp-code-input");
  css.value = settings.customCss;
  css.placeholder = ".lp-bubble { border-radius: 12px; }";
  css.addEventListener("input", () => commit((next) => {
    next.customCss = css.value;
  }, { persist: false }));
  const apply = button("Apply custom CSS", "lp-button");
  apply.addEventListener("click", () => commit((next) => {
    next.customCss = css.value;
  }));
  custom.append(css, apply);
  const preview = el("div", "lp-theme-live");
  preview.style.background = settings.colors.background;
  preview.style.color = settings.colors.text;
  preview.append(el("strong", "lp-theme-preview-header", "Alex"), el("span", "lp-copy", "Messages · Online"));
  const incoming = el("span", "lp-theme-preview-incoming", "Coffee after work?");
  preview.append(incoming);
  const sample = el("span", "lp-message-surface", "See you soon.");
  sample.style.background = outgoingSurface(settings.colors.accent);
  sample.style.color = "#fff";
  preview.append(sample);
  const updatePreview = () => {
    preview.style.background = settings.colors.background;
    preview.style.color = settings.colors.text;
    sample.style.background = outgoingSurface(settings.colors.accent);
    incoming.style.background = settings.colors.surface;
    paletteControls.sync(settings.colors);
    for (const choice of themeRow.querySelectorAll("button"))
      choice.setAttribute("aria-pressed", String(choice.dataset.theme === settings.theme));
    themeRow.querySelector('button[title="custom"]')?.style.setProperty("--theme-color", settings.colors.accent);
  };
  content.append(preview, themes, paletteControls.accent, paletteControls.advanced, wallpapers, scaleCard, motion, scrolling, disclosure("Custom CSS", custom));
  return page;
}
function persona(host) {
  const profile = host.state.pocketPersona;
  const { page, content } = host.page("Persona & Device", profile.displayName || host.activePersona?.name || "Pocket profile");
  const authorship = el("select", "lp-select");
  authorship.setAttribute("aria-label", "Character authorship");
  for (const [value, label] of [["roleplay", "Roleplay — I write my side"], ["impersonation", "Impersonation — AI can write my side too"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = (host.state.setup.authorship || "roleplay") === value;
    authorship.append(option);
  }
  authorship.addEventListener("change", () => host.send("lumiphone:set_authorship", { authorship: authorship.value }));
  content.append(fieldBlock("Who writes your character?", authorship), el("p", "lp-copy", "Applies to this chat. Manual sends inside Pocket are always available."));
  const identity = el("section", "lp-card lp-settings-section");
  identity.append(el("div", "lp-eyebrow", "Who is using this phone?"));
  const source = el("select", "lp-select");
  for (const [value, label] of [["lumiverse", "Follow Lumiverse Persona"], ["manual", "Use Pocket profile"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = profile.source === value || profile.source === "generated" && value === "manual";
    source.appendChild(option);
  }
  const name = el("input", "lp-input");
  name.placeholder = "Display name";
  name.value = profile.displayName;
  const pronouns = el("input", "lp-input");
  pronouns.placeholder = "Pronouns";
  pronouns.value = profile.pronouns;
  const role = el("input", "lp-input");
  role.placeholder = "Role";
  role.value = profile.role;
  const phoneProfile = profile.phoneProfile || { personality: "", appearance: "", textingStyle: "" };
  const personality = el("textarea", "lp-textarea");
  personality.placeholder = "Personality — stable traits that shape conversation";
  personality.value = phoneProfile.personality;
  const appearance = el("textarea", "lp-textarea");
  appearance.placeholder = "Minimal appearance — only recognizable details worth texting about";
  appearance.value = phoneProfile.appearance;
  const textingStyle = el("textarea", "lp-textarea");
  textingStyle.placeholder = "Texting quirks — casing, punctuation, slang/register, emoji/kaomoji habits, message length…";
  textingStyle.value = phoneProfile.textingStyle;
  const canAppear = toggle("Can appear as phone participant", profile.canAppear, () => {}, "Off by default. The active Persona is never imported as a Contact.");
  const fields = el("div", "lp-fields");
  fields.append(fieldBlock("Name", name), fieldBlock("Pronouns", pronouns), fieldBlock("Role", role), fieldBlock("Personality", personality), fieldBlock("Minimal appearance", appearance), fieldBlock("Texting quirks", textingStyle), canAppear);
  const syncDisabled = () => {
    const disabled = source.value === "lumiverse";
    for (const control of [name, pronouns, role])
      control.disabled = disabled;
    canAppear.querySelector("button").toggleAttribute("disabled", disabled);
  };
  source.addEventListener("change", syncDisabled);
  syncDisabled();
  const actions = el("div", "lp-row");
  const personaOperation = [...host.operations.values()].find((entry) => entry.task === "persona-profile" && entry.phase !== "complete" && entry.phase !== "error");
  const describe = button(personaOperation ? "Enriching…" : "Enrich with LLM", "lp-button lp-button-quiet");
  describe.disabled = !host.capabilities?.generation || Boolean(personaOperation);
  const stop = button("Stop enrichment", "lp-button lp-button-danger");
  stop.hidden = !personaOperation;
  if (personaOperation) {
    stop.dataset.operationStop = personaOperation.requestId;
    describe.dataset.operationAction = personaOperation.requestId;
  }
  stop.addEventListener("click", () => host.send("lumiphone:cancel_persona_generation", { operationRequestId: stop.dataset.operationStop }));
  let personaProgress = null;
  const mountPersonaProgress = (requestId, message = "Enriching phone profile…") => {
    personaProgress?.remove();
    personaProgress = el("div", "lp-operation-progress");
    personaProgress.dataset.operationRequest = requestId;
    personaProgress.dataset.phase = "generating";
    personaProgress.setAttribute("role", "status");
    const label = el("strong", "", message);
    label.dataset.operationMessage = "true";
    personaProgress.append(el("span", "lp-indeterminate"), label);
    identity.appendChild(personaProgress);
  };
  describe.addEventListener("click", () => {
    describe.disabled = true;
    describe.textContent = "Enriching…";
    const requestId = host.send("lumiphone:generate_pocket_persona");
    describe.dataset.operationAction = requestId;
    stop.dataset.operationStop = requestId;
    stop.hidden = false;
    actions.append(stop);
    mountPersonaProgress(requestId);
  });
  const save = button("Save profile", "lp-button");
  save.addEventListener("click", () => host.send("lumiphone:save_pocket_persona", {
    followLumiverse: source.value === "lumiverse",
    persona: {
      ...profile,
      source: source.value,
      displayName: name.value.trim(),
      pronouns: pronouns.value.trim(),
      role: role.value.trim(),
      phoneProfile: {
        personality: personality.value.trim(),
        appearance: appearance.value.trim(),
        textingStyle: textingStyle.value.trim()
      },
      canAppear: canAppear.querySelector("button")?.getAttribute("aria-pressed") === "true"
    }
  }));
  actions.append(describe, save, stop);
  identity.append(source, fields, actions);
  if (personaOperation)
    mountPersonaProgress(personaOperation.requestId, personaOperation.message);
  if (host.personaPreview) {
    const preview = el("section", "lp-card lp-settings-section");
    preview.dataset.pocketPersonaPreview = "true";
    const generatedPhone = host.personaPreview.phoneProfile || { personality: "", appearance: "", textingStyle: "" };
    preview.append(el("div", "lp-eyebrow", "Generated phone profile"), el("strong", "", host.personaPreview.displayName), el("p", "lp-copy", [host.personaPreview.pronouns, host.personaPreview.role].filter(Boolean).join(" · ")), generatedPhone.personality ? el("p", "lp-copy", `Personality: ${generatedPhone.personality}`) : el("span"), generatedPhone.appearance ? el("p", "lp-copy", `Appearance: ${generatedPhone.appearance}`) : el("span"), generatedPhone.textingStyle ? el("p", "lp-copy", `Texting: ${generatedPhone.textingStyle}`) : el("span"));
    const use = button("Use profile", "lp-button");
    use.addEventListener("click", () => host.send("lumiphone:save_pocket_persona", { persona: host.personaPreview }));
    preview.appendChild(use);
    identity.appendChild(preview);
  }
  content.appendChild(identity);
  content.append(identityProfileControls(host.identityProfiles || [], "persona", undefined, host.send, () => ({ name: name.value, pronouns: pronouns.value, role: role.value, identityBrief: profile.identityBrief, phoneProfile: { personality: personality.value, appearance: appearance.value, textingStyle: textingStyle.value } })));
  if (!host.activePersona)
    return page;
  const active = host.activePersona;
  const current = host.draft.personaAppearance[active.id] || {
    enabled: false,
    theme: host.draft.theme,
    colors: clone(host.draft).colors,
    customCss: "",
    homeWallpaper: { ...structuredClone(host.draft.homeWallpaper), source: null },
    chatWallpaper: { ...structuredClone(host.draft.chatWallpaper), source: null }
  };
  const commit = (mutate, persist = true) => {
    const next = clone(host.draft);
    const value = structuredClone(next.personaAppearance[active.id] || current);
    mutate(value);
    next.personaAppearance[active.id] = value;
    host.update(next, { persist });
    paletteControls.sync(value.colors);
  };
  const card = el("section", "lp-card lp-settings-section");
  card.append(el("div", "lp-eyebrow", "Persona appearance"), toggle(`Enable for ${active.name}`, current.enabled, (value) => commit((item) => {
    item.enabled = value;
  }), "Appearance only; connections and notifications remain device-wide."));
  const theme = el("select", "lp-select");
  for (const themeName of ["midnight", "porcelain", "rose", "forest", "pink", "custom"]) {
    const option = el("option", "", themeName === "rose" ? "Sunset" : themeName);
    option.value = themeName;
    option.selected = current.theme === themeName;
    theme.appendChild(option);
  }
  theme.addEventListener("change", () => commit((item) => {
    item.theme = theme.value;
    if (item.theme !== "custom")
      item.colors = themePalette(item.theme);
  }));
  const paletteControls = themeColorControls(current.colors, (key, value) => commit((item) => {
    item.theme = "custom";
    item.colors[key] = value;
  }));
  const personaWallpapers = el("section", "lp-settings-section");
  personaWallpapers.append(wallpaperImageControl(`${active.name} home`, "persona-home", current.homeWallpaper, host.resolvedWallpapers.personaHome, {
    choose: host.chooseImage,
    change: (wallpaper) => commit((item) => {
      item.homeWallpaper = wallpaper;
    })
  }), wallpaperImageControl(`${active.name} chat`, "persona-chat", current.chatWallpaper, host.resolvedWallpapers.personaChat, {
    choose: host.chooseImage,
    change: (wallpaper) => commit((item) => {
      item.chatWallpaper = wallpaper;
    })
  }));
  const css = el("textarea", "lp-textarea lp-code-input");
  css.placeholder = "Persona-scoped Pocket CSS";
  css.value = current.customCss;
  css.addEventListener("input", () => commit((item) => {
    item.customCss = css.value;
  }, false));
  const apply = button("Apply persona CSS", "lp-button");
  apply.addEventListener("click", () => commit((item) => {
    item.customCss = css.value;
  }));
  card.append(fieldBlock("Theme", theme), paletteControls.accent, paletteControls.advanced, personaWallpapers, disclosure("Persona custom CSS", css, apply));
  content.appendChild(card);
  return page;
}
function messages(host) {
  let settings = clone(host.draft);
  const commit = (mutate) => {
    const next = clone(settings);
    mutate(next);
    settings = normalizePreferences(next);
    host.update(settings);
  };
  const { page, content } = host.page("Messages", "Generation and context bridge");
  const voice = el("section", "lp-card lp-settings-section");
  voice.append(el("div", "lp-eyebrow", "Voice messages"), toggle("Allow character voice messages", settings.voiceMessages !== false, (value) => commit((next) => {
    next.voiceMessages = value;
  }), "Characters may send a voice message with a readable transcript. Tap Play to hear it with your chosen TTS."));
  voice.append(ttsSettings(() => settings, commit, host.onCleanup));
  content.append(voice);
  const replies = el("section", "lp-card lp-settings-section");
  replies.append(el("div", "lp-eyebrow", "Reply behavior"), toggle("Decide on a reply after user DMs", settings.autoReplyAfterSend, (value) => commit((next) => {
    next.autoReplyAfterSend = value;
  })), el("p", "lp-copy", "When someone is on the way, 20 seconds without typing or a new phone message continues the main roleplay. Continue to arrival starts it immediately; idle time does not mark them Here."));
  const cadence = el("select", "lp-select");
  for (const [value, label] of [["instant", "Instant"], ["quick", "Quick"], ["natural", "Natural"], ["relaxed", "Relaxed"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = settings.replyCadence === value;
    cadence.appendChild(option);
  }
  cadence.addEventListener("change", () => commit((next) => {
    next.replyCadence = cadence.value;
  }));
  replies.append(fieldBlock("Outgoing message grace", cadence), el("p", "lp-copy", "Messages sent during this window form one burst and receive one reply decision. Typing or focusing the composer holds the decision."));
  const ambient = el("select", "lp-select");
  for (const [value, label] of [["off", "Off"], ["sparse", "Sparse"], ["normal", "Normal"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = settings.ambientMessaging === value;
    ambient.appendChild(option);
  }
  ambient.addEventListener("change", () => commit((next) => {
    next.ambientMessaging = ambient.value;
  }));
  replies.append(fieldBlock("Ambient messages", ambient));
  replies.append(toggle("Show post-turn sync status", settings.showReconciliationStatus, (value) => commit((next) => {
    next.showReconciliationStatus = value;
  }), "Cosmetic only. Pocket still reconciles world state after eligible roleplay turns when this is hidden."));
  const context = el("section", "lp-card lp-settings-section");
  context.append(el("div", "lp-eyebrow", "Roleplay context"));
  const mode = el("select", "lp-select");
  for (const [value, label] of [["off", "Off"], ["recent", "Recent RP"], ["story", "Story context"], ["smart", "Smart"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = settings.roleplayContextMode === value;
    mode.appendChild(option);
  }
  mode.addEventListener("change", () => commit((next) => {
    next.roleplayContextMode = mode.value;
  }));
  const explanations = {
    off: "Off — phone replies use only compact actor identity and the Pocket thread.",
    recent: "Recent RP — includes a bounded tail of the committed Lumiverse transcript.",
    story: "Story — includes Pocket timeline, trackers, weather, and pinned notes without transcript lines.",
    smart: "Smart — combines Story with Recent RP when the conversation or current scene makes it relevant."
  };
  const explanation = el("p", "lp-copy", explanations[settings.roleplayContextMode]);
  mode.addEventListener("change", () => {
    explanation.textContent = explanations[mode.value];
  });
  const previewSelect = el("select", "lp-select");
  for (const conversation of host.state.conversations) {
    const option = el("option", "", conversation.title);
    option.value = conversation.id;
    previewSelect.appendChild(option);
  }
  const preview = button("Preview effective context", "lp-button lp-button-quiet");
  preview.disabled = !host.state.conversations.length;
  preview.addEventListener("click", () => host.send("lumiphone:preview_context", { conversationId: previewSelect.value }));
  context.append(mode, explanation, slider("Recent roleplay messages", settings.recentRoleplayMessages, 0, 20, 1, String, (value) => commit((next) => {
    next.recentRoleplayMessages = value;
  }), "Bounded committed host-chat context used by Recent RP and deterministic Smart mode."), previewSelect, preview);
  if (host.contextPreview) {
    const diagnostic = host.contextPreview;
    const details = el("details", "lp-context-preview");
    details.open = true;
    details.appendChild(el("summary", "", `Effective context · ~${diagnostic.estimatedTokens} tokens`));
    const stats = el("div", "lp-context-stats");
    for (const [label, value] of [
      ["Actor identity", `${diagnostic.actorIdentityChars} chars`],
      ["Scene snapshot", `${diagnostic.sceneSnapshot.chars} chars · ${diagnostic.sceneSnapshot.stale ? "stale" : "current"} · turn ${diagnostic.sceneSnapshot.sourceMessageIndex}`],
      ["Phone thread", `${diagnostic.phoneThread.count} messages · ${diagnostic.phoneThread.chars}/${diagnostic.phoneThread.budget} chars`],
      ["Recent RP", `${diagnostic.recentRoleplay.count} messages · ${diagnostic.recentRoleplay.chars}/${diagnostic.recentRoleplay.budget} chars`],
      ["Story", `${diagnostic.story.count} facts · ${diagnostic.story.chars}/${diagnostic.story.budget} chars`],
      ["Total", `${diagnostic.totalChars} chars`]
    ])
      stats.appendChild(row(label, value));
    const anchors = el("p", "lp-copy", `Authoritative latest: ${diagnostic.authoritativeLatest.id || "none"} (#${diagnostic.authoritativeLatest.index}) · Included latest: ${diagnostic.includedLatest.id || "none"} (#${diagnostic.includedLatest.index})`);
    details.append(stats, anchors);
    if (diagnostic.freshnessWarning)
      details.appendChild(el("p", "lp-warning", diagnostic.freshnessWarning));
    const advanced = el("details");
    advanced.append(el("summary", "", "Exact sanitized assembled block"));
    const exact = el("pre", "lp-context-exact", diagnostic.assembled);
    const copy = button("Copy", "lp-button lp-button-quiet");
    copy.addEventListener("click", () => void navigator.clipboard.writeText(diagnostic.assembled));
    advanced.append(exact, copy);
    details.appendChild(advanced);
    context.appendChild(details);
  }
  content.append(replies, context);
  return page;
}
function generation(host) {
  let settings = host.draft;
  const commit = (mutate) => {
    const next = clone(settings);
    mutate(next);
    settings = next;
    host.update(next);
  };
  const { page, content } = host.page("Pocket Generation", "Text model source");
  const card = el("section", "lp-card lp-settings-section");
  const mode = el("select", "lp-select");
  for (const [value, label] of [["roleplay", "Follow roleplay model"], ["sidecar", "Pocket sidecar"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = settings.generationMode === value;
    mode.appendChild(option);
  }
  const connections = el("select", "lp-select");
  const none = el("option", "", "Choose a connection");
  none.value = "";
  connections.appendChild(none);
  for (const entry of host.generation?.connections || []) {
    const option = el("option", "", `${entry.name} · ${entry.model || entry.provider}`);
    option.value = entry.id;
    option.selected = settings.sidecarConnectionId === entry.id;
    connections.appendChild(option);
  }
  connections.disabled = settings.generationMode !== "sidecar";
  mode.addEventListener("change", () => {
    commit((next) => {
      next.generationMode = mode.value === "sidecar" ? "sidecar" : "roleplay";
    });
    host.rerender();
  });
  connections.addEventListener("change", () => {
    commit((next) => {
      next.sidecarConnectionId = connections.value;
      next.sidecarModelOverride = "";
    });
    host.rerender();
  });
  const modelMount = el("div", "lp-model-combobox");
  host.mountModelCombobox(modelMount, {
    value: settings.sidecarModelOverride,
    connection: { kind: "llm", id: settings.sidecarConnectionId || undefined },
    disabled: settings.generationMode !== "sidecar" || !settings.sidecarConnectionId,
    onChange: (value) => commit((next) => {
      next.sidecarModelOverride = value;
    })
  });
  const effective = host.generation?.effective;
  const effectiveModel = settings.generationMode === "sidecar" && settings.sidecarModelOverride ? `${settings.sidecarModelOverride} (override)` : effective?.model || "model not set";
  const effectiveCard = el("div", "lp-generation-effective");
  effectiveCard.dataset.pocketGenerationEffective = "true";
  effectiveCard.append(el("strong", "", effective?.name || "No effective connection"), el("span", "lp-copy", effective ? `${effective.provider} · ${effectiveModel}` : "Configure a Lumiverse LLM connection."));
  const test = button("Test Pocket generation", "lp-button");
  test.dataset.pocketGenerationTest = "true";
  test.disabled = !host.capabilities?.generation;
  test.addEventListener("click", () => host.send("lumiphone:test_generation", { generationMode: mode.value, sidecarConnectionId: connections.value, sidecarModelOverride: settings.sidecarModelOverride }));
  card.append(toggle("Automatic retry", settings.automaticGenerationRetry, (value) => commit((next) => {
    next.automaticGenerationRetry = value;
  }), "Retry once when output is cut short. Turn off to retry manually."));
  const diagnostic = el("p", "lp-copy", "Not tested yet.");
  diagnostic.dataset.pocketGenerationDiagnostic = "true";
  const run = [...host.generation?.history || []].reverse().find((entry) => entry.task === "connection-test");
  if (run)
    diagnostic.textContent = run.status === "started" ? "● Testing…" : run.status === "completed" ? `✓ Success · ${run.latencyMs ?? 0} ms · ${run.connectionName} / ${run.model}` : `Failed · ${run.error || "Unknown provider error"}`;
  card.append(fieldBlock("Generation mode", mode), fieldBlock("Connection profile", connections), controlRow("Model override", modelMount), el("p", "lp-copy", "Leave blank to use the model configured on the selected connection profile."), effectiveCard, test, diagnostic);
  const samplers = el("div", "lp-settings-section");
  samplers.append(el("p", "lp-copy", "Overrides apply to Pocket text generation in either mode. Default keeps existing generation settings. Provider support varies."));
  const refreshers = [];
  const hints = { temperature: 1, top_p: 0.95, top_k: 0, min_p: 0, frequency_penalty: 0, presence_penalty: 0, repetition_penalty: 0 };
  for (const [key, label, min, max, step] of SAMPLER_FIELDS) {
    const row = el("div", "lp-style-control");
    const input = el("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.dataset.pocketSampler = key;
    const value = el("span", "lp-copy");
    const reset = button("Default", "lp-button lp-button-quiet");
    reset.setAttribute("aria-label", `Use default for ${label}`);
    const refresh = () => {
      const saved = settings.samplerOverrides?.[key];
      input.value = String(saved ?? hints[key]);
      value.textContent = saved === undefined ? "Default" : String(saved);
      reset.disabled = saved === undefined;
    };
    const head = el("div", "lp-row-between");
    head.append(value, reset);
    input.addEventListener("input", () => {
      commit((next) => {
        next.samplerOverrides = { ...next.samplerOverrides, [key]: Number(input.value) };
      });
      refresh();
    });
    reset.addEventListener("click", () => {
      commit((next) => {
        next.samplerOverrides = { ...next.samplerOverrides };
        delete next.samplerOverrides[key];
      });
      refresh();
    });
    row.append(fieldBlock(label, input), head);
    samplers.append(row);
    refreshers.push(refresh);
    refresh();
  }
  const reset = button("Use sampler defaults", "lp-button lp-button-quiet");
  reset.addEventListener("click", () => {
    commit((next) => {
      next.samplerOverrides = {};
    });
    for (const refresh of refreshers)
      refresh();
  });
  samplers.append(reset);
  card.appendChild(disclosure("Sampler overrides", samplers));
  if (!host.state.setup.initialized && host.resumeSetup) {
    const resume = button("Continue Pocket setup", "lp-button");
    resume.addEventListener("click", host.resumeSetup);
    card.append(resume);
  }
  content.appendChild(card);
  return page;
}
function camera(host) {
  let settings = host.draft;
  const commit = (mutate, persist = true) => {
    const next = clone(settings);
    mutate(next);
    settings = next;
    host.update(next, { persist });
  };
  const { page, content } = host.page("Camera & Swarm Studio", "Visual profile");
  const swarm = el("section", "lp-card lp-settings-section");
  swarm.append(el("div", "lp-eyebrow", "Swarm Studio"), toggle("Sync active profile", settings.useSwarmProfile, (value) => {
    const next = clone(settings);
    next.useSwarmProfile = value;
    settings = next;
    host.update(next, { persist: false });
    host.send("lumiphone:save_preferences", { preferences: next });
  }));
  const status = el("p", "lp-copy", host.swarmProfile?.status === "connected" ? `Connected · ${host.swarmProfile.checkpoint || "profile macros resolved"}` : host.swarmProfile?.status === "error" ? `Error · ${host.swarmProfile.error}` : host.swarmProfile?.status === "disabled" ? "Swarm profile sync is disabled." : "Swarm Studio macros were not detected for this character/persona.");
  status.dataset.pocketSwarmStatus = "true";
  status.dataset.status = host.swarmProfile?.status || "not-detected";
  const refresh = button("Refresh profile", "lp-button");
  refresh.addEventListener("click", () => host.send("lumiphone:get_swarm_profile"));
  const diagnostics = el("details", "lp-swarm-diagnostics");
  diagnostics.appendChild(el("summary", "", "Macro diagnostics"));
  for (const name of ["char_base", "persona_base", "swarm_negative", "swarm_preset", "swarm_checkpoint", "swarm_aspect", "swarm_loras"]) {
    const field = host.swarmProfile?.fields?.[name];
    const row = el("div", "lp-generation-run", `${name} · ${field?.detected ? `${field.length} chars · ${field.preview}` : "empty"}`);
    row.dataset.pocketSwarmMacro = name;
    diagnostics.appendChild(row);
  }
  swarm.append(status, refresh, diagnostics);
  const defaults = el("section", "lp-card lp-settings-section");
  defaults.append(el("div", "lp-eyebrow", "Camera defaults"), el("p", "lp-copy", "Leave connection and checkpoint blank to use Lumiverse’s native presets, workflow and LoRA stack. Saved overrides apply to every Pocket photo unless changed in Camera."));
  const native = button("Lumiverse image settings", "lp-button lp-button-quiet");
  native.addEventListener("click", () => host.send("lumiphone:open_native_image_settings"));
  defaults.append(native, toggle("Enhance photo description", settings.sceneEnhancer, (value) => commit((next) => {
    next.sceneEnhancer = value;
  })));
  const manual = el("section", "lp-card lp-settings-section");
  manual.append(el("div", "lp-eyebrow", "Prompt & provider overrides"));
  const positive = el("textarea", "lp-textarea");
  positive.placeholder = "Positive / character style";
  positive.value = settings.manualVisualProfile.positive;
  const negative = el("textarea", "lp-textarea");
  negative.placeholder = "Negative prompt";
  negative.value = settings.manualVisualProfile.negative;
  let modelValue = settings.manualVisualProfile.model;
  const model = el("div", "lp-model-combobox");
  const connection = el("select", "lp-select");
  connection.dataset.pocketImageConnection = "true";
  connection.append(new Option("Follow Lumiverse", ""));
  for (const entry of host.imageConnections || [])
    connection.append(new Option(entry.name, entry.id));
  if (settings.manualVisualProfile.connectionId && !(host.imageConnections || []).some((entry) => entry.id === settings.manualVisualProfile.connectionId))
    connection.append(new Option("Saved connection", settings.manualVisualProfile.connectionId));
  connection.value = settings.manualVisualProfile.connectionId;
  const modelField = el("div", "lp-field");
  modelField.append(controlRow("Checkpoint override", model));
  let stopModel;
  const mountModel = () => {
    stopModel?.();
    stopModel = host.mountModelCombobox(model, { value: modelValue, connection: { kind: "image", id: connection.value || undefined }, onChange: (value) => {
      modelValue = value;
      commit((next) => {
        next.manualVisualProfile.model = value;
      }, false);
    } });
  };
  mountModel();
  connection.addEventListener("change", () => {
    modelValue = "";
    commit((next) => {
      next.manualVisualProfile.connectionId = connection.value;
      next.manualVisualProfile.model = "";
    }, false);
    mountModel();
  });
  const follow = button("Follow Lumiverse defaults", "lp-button lp-button-quiet");
  follow.addEventListener("click", () => {
    connection.value = "";
    modelValue = "";
    commit((next) => {
      next.manualVisualProfile.connectionId = "";
      next.manualVisualProfile.model = "";
    });
    mountModel();
  });
  const saveDefaults = button("Save camera defaults", "lp-button");
  saveDefaults.addEventListener("click", () => commit((next) => {
    next.manualVisualProfile.connectionId = connection.value;
    next.manualVisualProfile.model = modelValue.trim();
  }));
  defaults.append(fieldBlock("Image connection", connection), modelField, saveDefaults, follow);
  const loras = el("textarea", "lp-textarea");
  loras.placeholder = "LoRA stack: name | weight";
  loras.value = settings.manualVisualProfile.loras.map((item) => `${item.name} | ${item.weight}`).join(`
`);
  const parameters = el("textarea", "lp-textarea lp-code-input");
  parameters.placeholder = "Provider parameters JSON";
  parameters.value = Object.keys(settings.manualVisualProfile.parameters).length ? JSON.stringify(settings.manualVisualProfile.parameters, null, 2) : "";
  for (const control of [positive, negative, loras, parameters])
    control.addEventListener("input", () => commit((next) => {
      next.manualVisualProfile.positive = positive.value;
      next.manualVisualProfile.negative = negative.value;
      next.manualVisualProfile.model = modelValue;
      next.manualVisualProfile.connectionId = connection.value;
    }, false));
  const apply = button("Apply manual profile", "lp-button");
  apply.addEventListener("click", () => {
    let parsed = {};
    try {
      parsed = parameters.value.trim() ? JSON.parse(parameters.value) : {};
    } catch {
      host.showError("Provider parameters must be valid JSON.");
      return;
    }
    commit((next) => {
      next.manualVisualProfile.positive = positive.value.trim();
      next.manualVisualProfile.negative = negative.value.trim();
      next.manualVisualProfile.model = modelValue.trim();
      next.manualVisualProfile.connectionId = connection.value.trim();
      next.manualVisualProfile.loras = loras.value.split(`
`).flatMap((line) => {
        const [name, raw] = line.split("|").map((part) => part.trim());
        if (!name)
          return [];
        const weight = Number(raw);
        return [{ name, weight: Number.isFinite(weight) ? weight : 1 }];
      });
      next.manualVisualProfile.parameters = parsed;
    });
  });
  manual.append(positive, negative, loras, parameters, apply);
  content.append(defaults, swarm, disclosure("Advanced manual overrides", manual));
  return page;
}
function jevSettings(host) {
  const settings = normalizeJevSettings(host.draft.jev);
  const { page, content } = host.page("Tracker judge", "LLM connections or TypeSafe Jev");
  const card = el("section", "lp-card lp-settings-section");
  const provider = el("select", "lp-select");
  for (const [value, label] of [["llm", "Lumiverse LLM connection"], ["typesafe", "TypeSafe Jev API"]]) {
    const option = el("option", "", label);
    option.value = value;
    provider.append(option);
  }
  provider.value = settings.provider;
  const model = el("input", "lp-input");
  model.value = settings.model;
  const enabled = el("input");
  enabled.type = "checkbox";
  enabled.checked = settings.enabled;
  const automatic = el("input");
  automatic.type = "checkbox";
  automatic.checked = settings.autoAfterTurn;
  const native = el("div", "lp-settings-section");
  const key = el("input", "lp-input");
  key.type = "password";
  key.autocomplete = "new-password";
  key.placeholder = host.jevKeyConfigured ? "A key is saved; enter a replacement" : "Enter your TypeSafe API key";
  const keyStatus = el("p", "lp-copy", host.jevKeyConfigured ? "API key saved on the host." : "No TypeSafe API key saved.");
  keyStatus.dataset.pocketJevKeyStatus = "true";
  keyStatus.setAttribute("role", "status");
  const saveKey = button("Save API key");
  saveKey.addEventListener("click", () => {
    if (!key.value.trim()) {
      host.showError("Enter your TypeSafe API key.");
      return;
    }
    host.send("lumiphone:jev_save_key", { apiKey: key.value.trim() });
    key.value = "";
  });
  const clearKey = button("Remove API key", "lp-button lp-button-quiet");
  clearKey.addEventListener("click", () => host.send("lumiphone:jev_save_key", { apiKey: "" }));
  native.append(fieldBlock("TypeSafe model", model, "Default: jev-latest."), fieldBlock("TypeSafe API key", key, "Stored per user on the host, excluded from Pocket exports."), keyStatus, saveKey, clearKey);
  const llm = el("p", "lp-copy", "Uses the connection and model selected in Pocket’s Connection tab, including sidecar models such as nano or OpenRouter. LLM confidence is an estimate; TypeSafe supplies its own confidence.");
  const sync = () => {
    native.hidden = provider.value !== "typesafe";
    llm.hidden = provider.value !== "llm";
    native.style.display = native.hidden ? "none" : "";
    llm.style.display = llm.hidden ? "none" : "";
  };
  provider.addEventListener("change", sync);
  sync();
  card.append(el("p", "lp-copy", "Judging sends the last six story messages and selected tracker targets to your chosen provider. Low-confidence or failed results keep current values."), fieldBlock("Provider", provider), controlRow("Enable tracker judge", enabled), controlRow("Evaluate after story turns", automatic), llm, native);
  const apply = button("Save judge settings");
  apply.addEventListener("click", () => {
    if (provider.value === "typesafe" && !/^jev-[a-zA-Z0-9._-]+$/.test(model.value.trim())) {
      host.showError("Enter a TypeSafe Jev model ID, such as jev-latest.");
      return;
    }
    const next = clone(host.draft);
    next.jev = normalizeJevSettings({ provider: provider.value, enabled: enabled.checked, autoAfterTurn: automatic.checked, model: model.value });
    host.update(next);
  });
  const evaluate = button("Evaluate trackers", "lp-button lp-button-quiet");
  evaluate.addEventListener("click", () => host.send("lumiphone:jev_evaluate"));
  card.append(apply, evaluate);
  content.append(card);
  return page;
}
function notifications(host) {
  const settings = host.draft;
  const commit = (mutate) => {
    const next = clone(settings);
    mutate(next);
    host.update(next);
  };
  const { page, content } = host.page("Notifications", "Device-wide behavior");
  const card = el("section", "lp-card lp-settings-section");
  card.append(toggle("Message notifications", settings.notifyMessages, (value) => commit((next) => {
    next.notifyMessages = value;
  })), toggle("Contact notifications", settings.notifyContacts, (value) => commit((next) => {
    next.notifyContacts = value;
  })), toggle("Tracker notifications", settings.notifyTrackers, (value) => commit((next) => {
    next.notifyTrackers = value;
  })), toggle("Show notification previews", settings.notificationPreviews, (value) => commit((next) => {
    next.notificationPreviews = value;
  })), toggle("Notification sounds", settings.notificationSounds, (value) => commit((next) => {
    next.notificationSounds = value;
  }), "Reserved for supported host audio surfaces."), toggle("System push notifications", settings.pushNotifications, (value) => commit((next) => {
    next.pushNotifications = value;
  })));
  content.appendChild(card);
  return page;
}
function permissions(host) {
  const { page, content } = host.page("Permissions", "Lumiverse access");
  const grid = el("div", "lp-permission-grid");
  const caps = host.capabilities;
  for (const [label, granted] of [["Generation", caps?.generation], ["Model tools", caps?.tools], ["Prompt memory", caps?.interceptor], ["Gallery", caps?.images], ["Remote images", caps?.corsProxy], ["Camera", caps?.imageGen], ["Floating phone", caps?.panels], ["Characters", caps?.characters], ["Personas", caps?.personas], ["Scene sync", caps?.sceneSync], ["Push", caps?.push]]) {
    const cell = el("div", "lp-permission", label);
    cell.dataset.granted = String(Boolean(granted));
    grid.appendChild(cell);
  }
  const manage = button("Request or update permissions", "lp-button");
  manage.addEventListener("click", () => host.requestPermissions());
  content.append(grid, manage);
  return page;
}
function data(host) {
  const { page, content } = host.page("Data & Backup", "This roleplay and this device");
  const card = el("section", "lp-card lp-settings-section");
  card.append(el("p", "lp-copy", "Exports include this roleplay phone and device preferences. Imports are validated into the current chat/character scope."));
  const exportButton = button("Export current phone");
  exportButton.addEventListener("click", () => host.send("lumiphone:export_data"));
  const importButton = button("Import into current phone");
  const file = el("input");
  file.type = "file";
  file.accept = "application/json,.json";
  file.hidden = true;
  importButton.addEventListener("click", () => file.click());
  file.addEventListener("change", async () => {
    const selected = file.files?.[0];
    if (!selected)
      return;
    try {
      host.send("lumiphone:import_data", { data: JSON.parse(await selected.text()) });
    } catch {
      host.showError("That file is not valid Pocket JSON.");
    } finally {
      file.value = "";
    }
  });
  const resetCurrent = button("Reset this roleplay phone", "lp-button lp-button-danger");
  resetCurrent.addEventListener("click", () => {
    if (window.confirm("Reset the phone for only this chat and character?"))
      host.send("lumiphone:reset_current");
  });
  const resetAll = button("Reset all roleplay phones", "lp-button lp-button-danger");
  resetAll.addEventListener("click", () => {
    if (window.confirm("Delete every Pocket chat/character state? Device preferences will remain."))
      host.send("lumiphone:reset_all_roleplay");
  });
  const resetPrefs = button("Reset device preferences", "lp-button lp-button-danger");
  resetPrefs.addEventListener("click", () => {
    if (window.confirm("Reset Pocket device preferences? Roleplay data will remain."))
      host.send("lumiphone:reset_preferences");
  });
  card.append(exportButton, importButton, file, resetCurrent, resetAll, resetPrefs);
  content.appendChild(card);
  return page;
}
function renderSettingsView(host) {
  if (!host.section)
    return categories(host);
  if (host.section === "personalization") {
    const { page, content } = host.page("Personalization", "Make Pocket yours");
    for (const [id, title, help] of [["appearance", "Device appearance", "Theme and wallpapers used by default"], ["persona", "Persona & phone identity", "Profile and optional appearance for your own phone"]]) {
      const row = button("", "lp-card lp-settings-category");
      const copy = el("span");
      copy.append(el("strong", "", title), el("span", "lp-copy", help));
      row.append(copy, el("span", "lp-settings-chevron", "›"));
      row.addEventListener("click", () => host.navigate(id));
      content.append(row);
    }
    return page;
  }
  if (host.section === "appearance")
    return appearance(host);
  if (host.section === "persona")
    return persona(host);
  if (host.section === "messages")
    return messages(host);
  if (host.section === "generation")
    return generation(host);
  if (host.section === "jev")
    return jevSettings(host);
  if (host.section === "camera")
    return camera(host);
  if (host.section === "notifications")
    return notifications(host);
  if (host.section === "permissions")
    return permissions(host);
  if (host.section === "data")
    return data(host);
  return categories(host);
}

// src/frontend/components/tracker-display.ts
function trackerPercent(tracker) {
  return Math.max(0, Math.min(100, (tracker.value - tracker.min) / Math.max(0.00001, tracker.max - tracker.min) * 100));
}
function trackerDisplayValue(tracker) {
  if (tracker.kind === "state")
    return tracker.state;
  if (tracker.kind === "timer") {
    const unit = tracker.unit.trim().toLowerCase();
    const factor = /^(min|minutes?|m)$/.test(unit) ? 60 : /^(h|hours?|hr)$/.test(unit) ? 3600 : /^(s|seconds?|sec)$/.test(unit) ? 1 : 0;
    if (factor) {
      const seconds = Math.max(0, Math.round(tracker.value * factor));
      return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");
    }
  }
  return `${Number(tracker.value.toFixed(2))}${tracker.unit}`;
}
function trackerUpdateDescription(mode) {
  return {
    manual: "Only changes when you adjust it by hand.",
    model: "The story model can update it through Pocket tools or tags when something happens. No elapsed-time drift.",
    automatic: "Changes at a fixed rate as the selected clock advances. No model judgment is involved.",
    jev: "Tracker judge estimates it from recent story messages; uncertain answers keep the current value."
  }[mode];
}
function trackerFlavor(tracker) {
  const identity = `${tracker.key} ${tracker.label} ${tracker.unit}`.toLowerCase();
  if (tracker.presentation === "relationship")
    return "relationship";
  if (tracker.presentation === "vitals" || /\b(health|hp|vital|injur|condition)\b/.test(identity))
    return "health";
  if (tracker.presentation === "timer" || tracker.kind === "timer")
    return "timer";
  if (tracker.presentation === "state" || tracker.kind === "state")
    return "state";
  if (tracker.presentation === "segmented" || /\b(energy|stamina|charge|mana|focus)\b/.test(identity))
    return "energy";
  if (/\b(ammo|rounds?|bullets?|shells?|magazine)\b/.test(identity))
    return "ammo";
  if (/\b(hunger|hungry|appetite|satiety|fullness|food)\b/.test(identity))
    return "hunger";
  if (/\b(tension|stress|danger|alert|suspense|threat)\b/.test(identity))
    return "tension";
  if (/\b(credits?|cash|money|coins?|funds?|balance)\b/.test(identity))
    return "credits";
  if (tracker.target.type === "custom")
    return "custom";
  if (tracker.presentation === "compact")
    return "compact";
  if (tracker.kind === "counter")
    return "counter";
  return "meter";
}
function trackerGlyph(kind) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 48 48");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("lp-tracker-glyph");
  const shapes = {
    link: ["M19 29l10-10", "M17 25l-3 3a7 7 0 0010 10l6-6a7 7 0 000-10", "M31 23l3-3a7 7 0 00-10-10l-6 6a7 7 0 000 10"],
    vitals: ["M24 38L9 23C-1 12 14 3 24 15c10-12 25-3 15 8Z", "M9 25h9l4-9 5 15 4-6h8"],
    counter: ["M10 11h10v10H10Z", "M28 11h10v10H28Z", "M10 29h10v10H10Z", "M28 29h10v10H28Z"],
    timer: ["M24 8a16 16 0 110 32 16 16 0 010-32Z", "M24 14v10l7 4", "M19 3h10"],
    meal: ["M9 24a15 15 0 0030 0H9Z", "M14 17h20", "M18 10v7M24 8v9M30 11v6"],
    wave: ["M6 26h6l4-10 6 20 7-27 6 17h7"],
    bolt: ["M28 5L12 27h12l-4 16 16-23H24l4-15Z"],
    wallet: ["M8 14h31v25H8Z", "M8 19h31", "M31 27h8", "M15 9h17"],
    spark: ["M24 7v8M24 33v8M7 24h8M33 24h8", "M13 13l6 6M29 29l6 6M35 13l-6 6M19 29l-6 6"],
    ammo: ["M17 6h14v8l-2 4v19a5 5 0 01-10 0V18l-2-4V6Z", "M17 14h14"]
  }[kind];
  for (const d of shapes) {
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
  }
  return svg;
}
function makeBars(className, count, filled = count) {
  const visual = el("div", className);
  visual.setAttribute("aria-hidden", "true");
  for (let index = 0;index < count; index++) {
    const bar = el("span");
    bar.dataset.filled = String(index < filled);
    visual.append(bar);
  }
  return visual;
}
function makeRing(percent, glyph, className = "") {
  const ring = el("div", `lp-tracker-ring ${className}`.trim());
  ring.setAttribute("aria-hidden", "true");
  ring.style.setProperty("--ring-percent", `${percent * 3.6}deg`);
  ring.append(el("span", "lp-tracker-ring-core"));
  ring.querySelector(".lp-tracker-ring-core").append(glyph);
  return ring;
}
function trackerDisplay(tracker, state) {
  const current = materializeTracker(tracker, state.roleplayNow).tracker;
  const flavor = trackerFlavor(current);
  const card = el("div", `lp-card lp-tracker-card lp-tracker-${current.presentation}`);
  card.dataset.trackerId = current.id;
  card.dataset.kind = current.kind;
  card.dataset.target = current.target.type;
  card.dataset.presentation = current.presentation;
  card.dataset.flavor = flavor;
  const band = current.kind === "state" ? null : trackerBand(current);
  const percent = trackerPercent(current);
  card.style.setProperty("--tracker-color", band?.color || current.color);
  card.dataset.meaning = band?.meaning || "neutral";
  card.style.setProperty("--tracker-percent", `${percent}%`);
  const heading = el("div", "lp-tracker-heading");
  heading.append(el("span", "lp-eyebrow", current.target.label || current.target.type), el("h3", "lp-title", current.label));
  const top = el("div", "lp-tracker-top");
  const mode = el("span", "lp-tracker-update", { manual: "Manual", model: "Story", automatic: "Clock", jev: "Tracker judge" }[current.updateMode]);
  mode.title = trackerUpdateDescription(current.updateMode);
  top.append(heading, mode);
  card.append(top);
  const value = el("strong", "lp-tracker-readout", trackerDisplayValue(current));
  const status = current.clockPaused ? "Paused" : current.pausedReason || (current.kind === "timer" ? current.direction === "down" && current.value <= current.min ? "Finished" : current.updateMode === "automatic" ? current.direction === "down" ? "Counting down" : "Counting up" : "Ready" : band?.label || "");
  const stage = () => el("span", "lp-tracker-stage", status);
  const rail = () => {
    const meter = el("div", "lp-tracker-rail");
    meter.setAttribute("role", "meter");
    meter.setAttribute("aria-label", current.label);
    meter.setAttribute("aria-valuemin", String(current.min));
    meter.setAttribute("aria-valuemax", String(current.max));
    meter.setAttribute("aria-valuenow", String(current.value));
    meter.setAttribute("aria-valuetext", `${trackerDisplayValue(current)}${status ? ` · ${status}` : ""}`);
    meter.append(el("span", "lp-tracker-rail-fill"));
    return meter;
  };
  const reading = () => {
    const row = el("div", "lp-tracker-reading");
    row.append(value);
    if (status)
      row.append(stage());
    return row;
  };
  if (current.presentation === "relationship") {
    const shell = el("div", "lp-bond-widget");
    const pair = el("div", "lp-tracker-pair");
    const other = resolvePocketActor(state, current.target.id);
    const subjects = [{ name: state.pocketPersona.displayName || "You", avatarUrl: state.pocketPersona.avatarUrl }, { name: other?.name || current.target.label || "Unassigned", avatarUrl: other?.avatarUrl }];
    subjects.forEach((subject, index) => {
      if (index)
        pair.append(trackerGlyph("link"));
      const person = el("div", "lp-tracker-person");
      const avatar = el("span", "lp-tracker-avatar", subject.name.slice(0, 1).toUpperCase());
      if (subject.avatarUrl) {
        const image = el("img");
        image.src = subject.avatarUrl;
        image.alt = "";
        avatar.replaceChildren(image);
      }
      person.append(avatar, el("span", "lp-tracker-person-name", subject.name));
      pair.append(person);
    });
    const bondScore = el("div", "lp-bond-score");
    bondScore.append(reading(), rail());
    shell.append(pair, bondScore);
    card.append(shell);
  } else if (current.presentation === "vitals") {
    const body = el("div", "lp-vital-body");
    body.append(makeRing(percent, trackerGlyph("vitals"), "lp-health-ring"), reading());
    card.append(body, makeBars("lp-vital-pulse", 11, Math.max(1, Math.round(percent / 10))));
    card.append(rail());
  } else if (current.presentation === "state" && current.kind === "state") {
    const currentState = el("div", "lp-state-current");
    currentState.append(el("span", "lp-state-current-dot"), el("strong", "", current.state));
    card.append(currentState);
    const path = el("ol", "lp-state-path");
    path.setAttribute("aria-label", current.label);
    for (const label of current.states) {
      const step = el("li", "", label);
      step.dataset.active = String(label === current.state);
      if (label === current.state)
        step.setAttribute("aria-current", "step");
      path.append(step);
    }
    card.append(path);
    if (current.clockPaused || current.pausedReason)
      card.append(stage());
  } else if (current.presentation === "segmented") {
    const body = el("div", "lp-energy-body");
    body.append(makeRing(percent, trackerGlyph("bolt"), "lp-energy-ring"), reading());
    card.append(body);
    const segments = rail();
    segments.className = "lp-tracker-segments";
    segments.replaceChildren();
    for (let index = 0;index < 10; index++) {
      const segment = el("span");
      segment.dataset.filled = String(percent >= (index + 1) * 10);
      segments.append(segment);
    }
    card.append(segments);
  } else if (current.presentation === "timer") {
    const body = el("div", "lp-timer-instrument");
    const island = el("div", "lp-timer-island");
    island.append(trackerGlyph("timer"), reading());
    body.append(island);
    card.append(body);
    if (current.updateMode === "automatic")
      card.append(el("span", "lp-tracker-clock-note", `${Math.abs(current.ratePerHour)} ${current.unit.trim()} / hour · ${current.clock === "real" ? "Real clock" : "Story clock"}`));
    if (current.kind === "timer" && current.direction === "down")
      card.append(rail());
  } else if (current.presentation === "counter") {
    value.textContent = String(Number(current.value.toFixed(2)));
    if (current.unit)
      value.append(el("small", "lp-counter-unit", current.unit));
    const body = el("div", "lp-counter-instrument");
    if (flavor === "ammo") {
      const ammo = el("div", "lp-ammo-visual");
      ammo.setAttribute("aria-hidden", "true");
      ammo.append(trackerGlyph("ammo"));
      const slots = Math.min(8, Math.max(0, Math.round(current.value)));
      for (let index = 0;index < 8; index++) {
        const round = el("span");
        round.dataset.loaded = String(index < slots);
        ammo.append(round);
      }
      body.append(ammo, reading());
    } else {
      body.append(trackerGlyph(flavor === "credits" ? "wallet" : "counter"), reading());
    }
    card.append(body);
  } else if (current.presentation === "meter") {
    if (flavor === "hunger") {
      const body = el("div", "lp-hunger-body");
      body.append(makeRing(percent, trackerGlyph("meal"), "lp-hunger-ring"), reading());
      card.append(body, rail());
    } else if (flavor === "tension") {
      const body = el("div", "lp-tension-body");
      body.append(reading(), trackerGlyph("wave"));
      card.append(body, makeBars("lp-tension-wave", 14, Math.max(1, Math.round(percent / 100 * 14))), rail());
    } else {
      const body = el("div", "lp-meter-body");
      const badge = el("span", "lp-meter-badge");
      badge.append(trackerGlyph(flavor === "custom" ? "spark" : "counter"));
      body.append(badge, reading());
      card.append(body, rail());
      const limits = el("div", "lp-tracker-limits");
      limits.append(el("span", "", `${current.min}${current.unit}`), el("span", "", `${current.max}${current.unit}`));
      card.append(limits);
    }
  } else {
    card.append(reading());
  }
  const latest = current.history.at(-1);
  if (latest && current.presentation !== "compact") {
    const delta = typeof latest.next === "number" && typeof latest.previous === "number" ? latest.next - latest.previous : null;
    const source = { jev: "Tracker judge", model: "Story", tag: "Story", automatic: "Time", migration: "Imported", user: "You" }[latest.source];
    const change = delta === null ? `${latest.previous} → ${latest.next}` : `${delta > 0 ? "+" : ""}${Number(delta.toFixed(2))}${current.unit}`;
    const history = el("div", "lp-tracker-last-change", `${change} · ${source}`);
    if (latest.reason)
      history.title = latest.reason;
    card.append(history);
  }
  return card;
}
function refreshTrackerDisplay(card, tracker, state) {
  const fresh = trackerDisplay(tracker, state);
  card.replaceChildren(...fresh.childNodes);
  card.style.cssText = fresh.style.cssText;
  card.dataset.meaning = fresh.dataset.meaning;
  card.dataset.flavor = fresh.dataset.flavor;
}

// src/frontend/apps/tracker-editor.ts
function choice(label, values, value) {
  const control = el("select", "lp-select");
  for (const [id, name] of values) {
    const option = el("option", "", name);
    option.value = id;
    option.selected = id === value;
    control.append(option);
  }
  return { control, field: fieldBlock(label, control) };
}
function trackerTemplates(host) {
  const { page, content } = host.page("New Tracker", "Track your story");
  content.append(el("p", "lp-copy", "Pick a starting point. You can make it yours next."));
  const grid = el("div", "lp-template-grid");
  const marks = ["♡", "◔", "✿", "♥", "ϟ", "▥", "◈", "◷", "✧", "＋"];
  TRACKER_TEMPLATES.forEach((template, index) => {
    const card = button("", "lp-template-card");
    card.append(el("span", "lp-template-mark", marks[index]), el("strong", "", template.name), el("small", "", template.group));
    card.addEventListener("click", () => host.select(`__template:${index}`, "config"));
    grid.append(card);
  });
  content.append(grid);
  return page;
}
function trackerEditor(host, current, templateIndex = 9) {
  const template = TRACKER_TEMPLATES[templateIndex] || TRACKER_TEMPLATES[9];
  const target = template.values.target || { type: "character", id: host.state.characterId, label: host.state.characterName };
  const seed = normalizeTracker({ ...template.values, target, color: host.accent }, { roleplayNow: host.state.roleplayNow });
  const source = { ...current || seed, ...host.draft };
  let commit = () => {};
  const { page, content } = host.page(current ? "Edit Tracker" : template.name, "Choose a target and update behavior", { label: host.saving ? "Saving…" : "Save", enabled: !host.saving, callback: () => commit() });
  const preview = el("div", "lp-tracker-preview");
  const error = el("p", "lp-warning");
  error.setAttribute("role", "alert");
  error.hidden = true;
  const name = el("input", "lp-input");
  name.value = source.label;
  const kind = choice("Track", [["meter", "A value"], ["counter", "A quantity"], ["state", "A state"], ["timer", "A timer"]], source.kind);
  const targets = [
    { type: "character", id: host.state.characterId, label: host.state.characterName },
    { type: "persona", id: host.state.pocketPersonaActorId, label: host.state.pocketPersona.displayName || "You" },
    ...listPocketActors(host.state).map((actor) => ({ type: "character", id: actor.actorId, label: actor.name })),
    ...listPocketActors(host.state).map((actor) => ({ type: "relationship", id: actor.actorId, label: `You & ${actor.name}` })),
    { type: "scene", id: "", label: "Current scene" },
    { type: "world", id: "", label: "World" },
    { type: "custom", id: "", label: "Something else" }
  ].filter((entry, index, all) => all.findIndex((other) => other.type === entry.type && other.id === entry.id) === index);
  if (!targets.some((entry) => entry.type === source.target.type && entry.id === source.target.id))
    targets.unshift(source.target);
  const targetIndex = targets.findIndex((entry) => entry.type === source.target.type && entry.id === source.target.id);
  const belongs = choice("For", targets.map((entry, index) => [String(index), entry.label]), String(targetIndex));
  const custom = el("input", "lp-input");
  custom.value = source.target.label;
  custom.placeholder = "What are we tracking?";
  const customField = fieldBlock("Target name", custom);
  const value = el("input", "lp-input");
  value.type = "number";
  value.step = "any";
  value.value = String(source.value);
  const states = el("textarea", "lp-textarea");
  states.value = source.kind === "state" ? source.states.join(`
`) : `Stable
Wounded
Recovering`;
  const state = choice("Current state", [], source.kind === "state" ? source.state : "");
  const mode = choice("Updates", [["manual", "By hand"], ["model", "Story events"], ["automatic", "Elapsed time"], ["jev", "Tracker judge"]], source.updateMode);
  const modeHelp = el("p", "lp-copy lp-tracker-mode-help");
  modeHelp.setAttribute("aria-live", "polite");
  mode.field.append(modeHelp);
  const modelPrompt = el("textarea", "lp-textarea");
  modelPrompt.maxLength = 2000;
  modelPrompt.value = source.modelPrompt || "";
  modelPrompt.placeholder = "Increase by 1 when a clue is discovered. Reset when the mystery is solved.";
  const promptField = fieldBlock("Tool-calling prompt", modelPrompt, "Tell the model when and how to update this tracker. Leave blank to use the default story rules.");
  const jev = sectionBlock("Tracker judge", "Estimates this value from recent story messages. Uncertain answers keep the current value.");
  const question = el("textarea", "lp-textarea");
  question.maxLength = 240;
  question.value = source.jev?.question || `What is the current ${source.label.toLowerCase()}?`;
  question.placeholder = "Ask one specific question about this target.";
  const confidence = el("input", "lp-input");
  confidence.type = "number";
  confidence.min = "0";
  confidence.max = "1";
  confidence.step = ".05";
  confidence.value = String(source.jev?.minConfidence ?? 0.65);
  const levels = el("textarea", "lp-textarea");
  levels.value = ((source.jev?.levels.length) ? source.jev.levels : [{ value: source.min, label: source.bands[0]?.label || "Low" }, { value: (source.min + source.max) / 2, label: source.bands[Math.floor(source.bands.length / 2)]?.label || "Moderate" }, { value: source.max, label: source.bands.at(-1)?.label || "High" }]).map((level) => `${level.value} | ${level.label}`).join(`
`);
  const levelField = fieldBlock("Rubric", levels, "2–10 levels, low to high: value | description. Describe what each level looks like in the story.");
  jev.body.append(fieldBlock("Question", question), levelField, fieldBlock("Minimum confidence", confidence, "0–1. TypeSafe uses provider confidence; LLM confidence is an estimate."));
  const visible = el("input");
  visible.type = "checkbox";
  visible.checked = source.visibleToModel;
  const visibleField = controlRow("Include in model context", visible, "Story updates allow the model to change this tracker. Other modes keep it read-only.");
  const valueField = fieldBlock("Starting value", value);
  const stateFields = el("div", "lp-tracker-config-fields");
  stateFields.append(fieldBlock("Allowed states", states, "One state per line."), state.field);
  const basic = sectionBlock("The essentials");
  basic.body.append(fieldBlock("Name", name), belongs.field, customField, kind.field, valueField, stateFields, mode.field, promptField, visibleField);
  const clock = choice("Clock", [["roleplay", "Story time"], ["real", "Real time"]], source.clock);
  const rate = el("input", "lp-input");
  rate.type = "number";
  rate.step = "any";
  rate.value = String(source.ratePerHour);
  const direction = choice("Direction", [["down", "Count down"], ["up", "Count up"]], source.kind === "timer" ? source.direction : "down");
  const automatic = sectionBlock("Passing time", "Story time waits when the scene clock is uncertain.");
  automatic.body.append(clock.field, direction.field, fieldBlock("Change per hour", rate, "Positive adds; negative subtracts. Timers use their chosen direction."));
  const min = el("input", "lp-input");
  min.type = "number";
  min.step = "any";
  min.value = String(source.min);
  const max = el("input", "lp-input");
  max.type = "number";
  max.step = "any";
  max.value = String(source.max);
  const initial = el("input", "lp-input");
  initial.type = "number";
  initial.step = "any";
  initial.value = String(source.initialValue);
  const unit = el("input", "lp-input");
  unit.value = source.unit;
  const step = el("input", "lp-input");
  step.type = "number";
  step.step = "any";
  step.value = String(source.kind === "counter" ? source.step : 1);
  const stepField = fieldBlock("Step size", step);
  const key = el("input", "lp-input");
  key.value = source.key;
  const color = el("input", "lp-color-input");
  color.type = "color";
  color.value = /^#[0-9a-f]{6}$/i.test(source.color) ? source.color : host.accent;
  const presentation = choice("Display", [], source.presentation);
  const range = el("div", "lp-tracker-config-fields");
  range.append(fieldBlock("Minimum", min), fieldBlock("Maximum", max), fieldBlock("Reset value", initial), fieldBlock("Unit", unit), stepField);
  const bandList = el("div", "lp-band-list");
  const bandRows = [];
  const addBand = (band) => {
    const row = el("div", "lp-band-editor");
    const low = el("input", "lp-input");
    low.type = "number";
    low.step = "any";
    low.value = String(band.min);
    low.setAttribute("aria-label", "Band minimum");
    const high = el("input", "lp-input");
    high.type = "number";
    high.step = "any";
    high.value = String(band.max);
    high.setAttribute("aria-label", "Band maximum");
    const label = el("input", "lp-input");
    label.value = band.label;
    label.placeholder = "Band name";
    label.setAttribute("aria-label", "Band name");
    const hue = el("input", "lp-color-input");
    hue.type = "color";
    hue.value = /^#[0-9a-f]{6}$/i.test(band.color) ? band.color : host.accent;
    hue.setAttribute("aria-label", "Band color");
    const remove = button("×", "lp-button lp-button-quiet");
    remove.setAttribute("aria-label", "Remove band");
    const meaning = choice("Meaning", [["neutral", "Neutral"], ["good", "Favorable"], ["bad", "Warning"]], band.meaning || "neutral");
    meaning.field.classList.add("lp-band-meaning");
    const entry = { row, min: low, max: high, label, color: hue, meaning: meaning.control };
    bandRows.push(entry);
    remove.addEventListener("click", () => {
      bandRows.splice(bandRows.indexOf(entry), 1);
      row.remove();
      remember();
    });
    row.append(label, low, high, hue, remove, meaning.field);
    bandList.append(row);
  };
  for (const band of source.bands)
    addBand(band);
  const bands = sectionBlock("Meaningful ranges", "Name what each range means. High does not always mean good.");
  const add = button("＋ Add a range", "lp-button lp-button-quiet");
  add.addEventListener("click", () => {
    addBand({ min: Number(min.value), max: Number(max.value), label: "New range", color: color.value });
    remember();
  });
  bands.body.append(bandList, add);
  const advanced = disclosure("Fine tuning", presentation.field, range, fieldBlock("Color", color), bands.section, fieldBlock("Stable key", key, "Used by model tools. New trackers receive a unique key."));
  const allowed = { meter: ["meter", "vitals", "relationship", "segmented", "compact"], counter: ["counter", "compact"], state: ["state", "compact"], timer: ["timer", "compact"] };
  const collect = () => {
    const kindValue = kind.control.value;
    const selected = targets[Number(belongs.control.value)];
    return {
      label: name.value.trim(),
      key: trackerKey(key.value || name.value),
      kind: kindValue,
      presentation: presentation.control.value,
      target: { ...selected, label: selected.type === "custom" ? custom.value.trim() : selected.label },
      value: Number(value.value),
      initialValue: Number(initial.value),
      min: Number(min.value),
      max: Number(max.value),
      unit: unit.value,
      state: state.control.value,
      initialState: current?.kind === "state" ? current.initialState : state.control.value,
      states: [...new Set(states.value.split(`
`).map((entry) => entry.trim()).filter(Boolean))],
      step: Number(step.value),
      direction: direction.control.value,
      color: color.value,
      modelPrompt: modelPrompt.value.trim(),
      updateMode: mode.control.value,
      allowModelWrite: mode.control.value === "model",
      visibleToModel: visible.checked,
      clock: clock.control.value,
      jev: { question: question.value.trim(), minConfidence: Number(confidence.value), levels: levels.value.split(`
`).filter((line) => line.trim()).map((line) => {
        const delimiter = line.indexOf("|");
        return { value: delimiter < 0 ? NaN : Number(line.slice(0, delimiter).trim()), label: delimiter < 0 ? "" : line.slice(delimiter + 1).trim() };
      }) },
      ratePerHour: kindValue === "timer" ? Math.abs(Number(rate.value)) * (direction.control.value === "down" ? -1 : 1) : Number(rate.value),
      bands: kindValue === "state" ? [] : bandRows.map((entry) => ({ min: Number(entry.min.value), max: Number(entry.max.value), label: entry.label.value.trim(), color: entry.color.value, meaning: entry.meaning.value }))
    };
  };
  const refreshFields = () => {
    const kindValue = kind.control.value;
    promptField.hidden = mode.control.value !== "model";
    customField.hidden = targets[Number(belongs.control.value)].type !== "custom";
    valueField.hidden = kindValue === "state";
    stateFields.hidden = kindValue !== "state";
    range.hidden = kindValue === "state";
    bands.section.hidden = kindValue === "state";
    stepField.hidden = kindValue !== "counter";
    automatic.section.hidden = mode.control.value !== "automatic";
    direction.field.hidden = kindValue !== "timer";
    jev.section.hidden = mode.control.value !== "jev";
    levelField.hidden = kindValue === "state";
    const jevOption = mode.control.querySelector('option[value="jev"]');
    jevOption.disabled = kindValue === "counter" || kindValue === "timer";
    if (jevOption.disabled && mode.control.value === "jev")
      mode.control.value = "manual";
    const autoOption = mode.control.querySelector('option[value="automatic"]');
    autoOption.disabled = kindValue === "state";
    if (kindValue === "state" && mode.control.value === "automatic")
      mode.control.value = "manual";
    modeHelp.textContent = trackerUpdateDescription(mode.control.value);
    const display = presentation.control.value || source.presentation;
    presentation.control.replaceChildren();
    for (const id of allowed[kindValue]) {
      const option = el("option", "", id[0].toUpperCase() + id.slice(1));
      option.value = id;
      presentation.control.append(option);
    }
    presentation.control.value = allowed[kindValue].includes(display) ? display : allowed[kindValue][0];
    const previous = state.control.value || (source.kind === "state" ? source.state : "");
    state.control.replaceChildren();
    for (const label of [...new Set(states.value.split(`
`).map((entry) => entry.trim()).filter(Boolean))]) {
      const option = el("option", "", label);
      option.value = label;
      state.control.append(option);
    }
    if ([...state.control.options].some((option) => option.value === previous))
      state.control.value = previous;
  };
  const remember = () => {
    refreshFields();
    const draft = collect();
    host.updateDraft(draft);
    const sample = normalizeTracker({ ...source, ...draft }, { roleplayNow: host.state.roleplayNow });
    preview.replaceChildren(trackerDisplay(sample, host.state));
    preview.style.setProperty("--tracker-color", draft.color);
  };
  content.append(preview, error, basic.section, automatic.section, jev.section, advanced);
  content.addEventListener("input", remember);
  content.addEventListener("change", remember);
  refreshFields();
  remember();
  commit = () => {
    const draft = collect();
    try {
      validateTrackerConfig(draft);
    } catch (failure) {
      error.textContent = failure instanceof Error ? failure.message : String(failure);
      error.hidden = false;
      error.scrollIntoView({ block: "nearest" });
      return;
    }
    if (host.saving)
      return;
    const save = page.querySelector(".lp-nav-action:last-child");
    save.disabled = true;
    save.textContent = "Saving…";
    host.save({ ...draft, id: current?.id, command: current ? "configure" : "create" });
  };
  if (current) {
    const remove = button("Delete tracker", "lp-button lp-button-danger");
    remove.addEventListener("click", () => host.send("lumiphone:delete", { kind: "tracker", id: current.id }));
    content.append(remove);
  }
  return page;
}

// src/frontend/apps/trackers.ts
function targetLabel(target) {
  return target.label || target.type;
}
function dashboard(host) {
  const { page, content } = host.page("Trackers", "Live roleplay state", { label: "Add", callback: () => host.select("__templates", "config") });
  const filters = el("div", "lp-tracker-filters");
  const all = button("All", "lp-chip");
  all.setAttribute("aria-pressed", "true");
  filters.appendChild(all);
  const choices = [...new Set(host.state.trackers.flatMap((tracker) => [tracker.kind, tracker.target.type]))];
  for (const choice of choices) {
    const filter = button(choice[0].toUpperCase() + choice.slice(1), "lp-chip");
    filter.dataset.filter = choice;
    filters.appendChild(filter);
  }
  const applyFilter = (choice = "") => {
    for (const card of content.querySelectorAll(".lp-tracker-card")) {
      card.hidden = Boolean(choice && card.dataset.kind !== choice && card.dataset.target !== choice);
    }
    for (const chip of filters.querySelectorAll(".lp-chip"))
      chip.setAttribute("aria-pressed", String((chip.dataset.filter || "") === choice));
  };
  all.addEventListener("click", () => applyFilter());
  for (const filter of filters.querySelectorAll("[data-filter]"))
    filter.addEventListener("click", () => applyFilter(filter.dataset.filter));
  content.appendChild(filters);
  for (const tracker of host.state.trackers) {
    const card = trackerDisplay(tracker, host.state);
    card.dataset.clickable = "true";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const open = () => host.select(tracker.id, "detail");
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    content.appendChild(card);
  }
  if (!host.state.trackers.length) {
    const empty = el("div", "lp-empty");
    empty.appendChild(el("p", "lp-copy", "Add Health, Trust, Hunger, Ammo, a roleplay countdown, a state, or a blank custom tracker."));
    content.appendChild(empty);
  }
  const timer = window.setInterval(() => {
    for (const tracker of host.state.trackers) {
      if (tracker.updateMode !== "automatic")
        continue;
      const card = content.querySelector(`[data-tracker-id="${CSS.escape(tracker.id)}"]`);
      if (card)
        refreshTrackerDisplay(card, tracker, host.state);
    }
  }, 1000);
  host.onCleanup(() => window.clearInterval(timer));
  return page;
}
function detail(host, tracker) {
  const { page, content } = host.page(tracker.label, targetLabel(tracker.target), { label: "⚙", callback: () => host.select(tracker.id, "config"), ariaLabel: "Tracker settings" });
  const display = trackerDisplay(tracker, host.state);
  content.appendChild(display);
  if (tracker.updateMode === "automatic") {
    const timer = window.setInterval(() => refreshTrackerDisplay(display, tracker, host.state), 1000);
    host.onCleanup(() => window.clearInterval(timer));
  }
  const policy = el("div", "lp-card lp-tracker-policy");
  policy.append(el("div", "lp-row-between", ""), el("p", "lp-copy", `${tracker.visibleToModel ? "Visible" : "Hidden"} in model context · ${tracker.allowModelWrite ? "Model may write" : "Model read-only"}`));
  policy.appendChild(el("p", "lp-copy", trackerUpdateDescription(tracker.updateMode)));
  if (tracker.pausedReason)
    policy.appendChild(el("p", "lp-warning", tracker.pausedReason));
  if (tracker.updateMode === "jev") {
    const evaluate = button(host.pending ? "Reading the story…" : "Evaluate with judge", "lp-button lp-button-quiet");
    evaluate.disabled = host.pending;
    evaluate.addEventListener("click", () => host.send("lumiphone:jev_evaluate", { trackerId: tracker.id }));
    policy.append(evaluate);
    if (tracker.jevResult)
      policy.append(el("p", tracker.jevResult.status === "invalid" || tracker.jevResult.status === "uncertain" ? "lp-warning" : "lp-copy", `${tracker.jevResult.message}${tracker.jevResult.confidence === undefined ? "" : ` · ${Math.round(tracker.jevResult.confidence * 100)}%`} · ${tracker.jevResult.evaluatedAt}`));
  }
  content.appendChild(policy);
  const operations = el("section", "lp-card lp-tracker-operations");
  operations.appendChild(el("div", "lp-eyebrow", host.pending ? "Updating…" : tracker.kind === "counter" ? "Inventory" : tracker.kind === "timer" ? "Clock controls" : tracker.kind === "state" ? "Choose a state" : "Adjust value"));
  operations.setAttribute("aria-busy", String(host.pending));
  const change = (payload) => host.send("lumiphone:action", { action: "tracker", payload: { trackerId: tracker.id, reason: "Changed in Pocket", ...payload } });
  if (tracker.kind === "state") {
    const choices = el("div", "lp-state-choices");
    for (const state of tracker.states) {
      const choice = button(state, "lp-chip");
      choice.setAttribute("aria-pressed", String(state === tracker.state));
      choice.disabled = host.pending || state === tracker.state;
      choice.addEventListener("click", () => change({ operation: "set_state", state }));
      choices.append(choice);
    }
    const reset = button(`Reset to ${tracker.initialState}`, "lp-button lp-button-quiet");
    reset.addEventListener("click", () => change({ operation: "reset" }));
    operations.append(choices, reset);
  } else {
    if (tracker.kind === "counter") {
      const steps = el("div", "lp-counter-controls");
      for (const [operation, label] of [["subtract", `Use ${tracker.step}${tracker.unit}`], ["add", `Add ${tracker.step}${tracker.unit}`]]) {
        const control = button(label);
        control.addEventListener("click", () => change({ operation, amount: tracker.step }));
        steps.append(control);
      }
      operations.append(steps);
    }
    if (tracker.kind === "timer" && tracker.updateMode === "automatic") {
      const pause = button(tracker.clockPaused ? "Resume clock" : "Pause clock");
      pause.addEventListener("click", () => change({ command: "clock", clockAction: tracker.clockPaused ? "resume" : "pause" }));
      operations.append(pause, el("p", "lp-copy", tracker.clockPaused ? "Resume from this value, without counting the paused time." : `Runs on ${tracker.clock === "real" ? "real time" : "the story clock"}.`));
    }
    const amount = el("input", "lp-input");
    amount.type = "number";
    amount.step = "any";
    amount.value = String(host.draft?.operationAmount ?? (tracker.kind === "counter" ? tracker.step : 1));
    amount.addEventListener("input", () => host.updateDraft({ ...host.draft, operationAmount: amount.value }));
    amount.setAttribute("aria-label", "Tracker amount");
    const row = el("div", "lp-tracker-operation-row");
    for (const [operation, label] of [["subtract", "−"], ["add", "+"], ["set", "Set"]]) {
      const control = button(label);
      control.addEventListener("click", () => {
        if (amount.value.trim() && Number.isFinite(Number(amount.value)))
          change({ operation, amount: Number(amount.value) });
      });
      row.appendChild(control);
    }
    const reset = button("Reset", "lp-button lp-button-quiet");
    reset.addEventListener("click", () => change({ operation: "reset" }));
    if (tracker.kind === "counter" || tracker.kind === "timer") {
      const manual = el("details", "lp-tracker-manual");
      manual.append(el("summary", "", "Adjust precisely"), amount, row);
      operations.append(manual, reset);
    } else
      operations.append(amount, row, reset);
  }
  if (host.pending)
    for (const control of operations.querySelectorAll("button,input"))
      control.disabled = true;
  content.appendChild(operations);
  const history = el("section", "lp-tracker-history");
  history.appendChild(el("div", "lp-eyebrow", `History · last ${tracker.history.length}`));
  for (const entry of [...tracker.history].reverse()) {
    const row = el("div", "lp-card lp-history-row");
    row.append(el("strong", "", `${entry.previous} → ${entry.next}`), el("span", "lp-copy", `${entry.operation} · ${entry.source}${entry.reason ? ` · ${entry.reason}` : ""}`), el("time", "lp-copy", entry.roleplayAt || entry.createdAt));
    history.appendChild(row);
  }
  if (!tracker.history.length)
    history.appendChild(el("p", "lp-copy", "No changes recorded yet."));
  content.appendChild(history);
  return page;
}
function renderTrackersView(host) {
  if (host.selectedId === "__templates")
    return trackerTemplates(host);
  const selected = host.state.trackers.find((tracker) => tracker.id === host.selectedId) || null;
  if (selected && host.selectedView === "config")
    return trackerEditor(host, selected);
  if (selected)
    return detail(host, selected);
  if (host.selectedId.startsWith("__template:"))
    return trackerEditor(host, null, Number(host.selectedId.split(":")[1]));
  return dashboard(host);
}

// src/frontend/components/event-invite.ts
function eventInvite(message, conversationId, host) {
  const invite = message.eventSuggestion;
  const card = el("section", "lp-event-invite");
  card.dataset.suggestionId = invite.id;
  card.dataset.status = invite.status;
  card.setAttribute("aria-label", `Event invitation: ${invite.title}`);
  const icon = el("span", "lp-event-invite-icon");
  icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="4"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/></svg>';
  const heading = el("div", "lp-event-invite-heading");
  heading.append(el("span", "lp-event-invite-eyebrow", invite.status === "pending" ? "You’re invited" : invite.status === "scheduled" ? "On your timeline" : "Invitation declined"), el("h3", "", invite.title));
  const top = el("div", "lp-event-invite-top");
  top.append(icon, heading);
  card.append(top);
  if (invite.whenText)
    card.append(el("p", "lp-event-invite-when", invite.whenText));
  if (invite.description)
    card.append(el("p", "lp-event-invite-description", invite.description));
  if (invite.participantNames.length)
    card.append(el("p", "lp-event-invite-people", invite.participantNames.join(" · ")));
  const actions = el("div", "lp-event-invite-actions");
  if (invite.status === "pending") {
    const accept = button("Schedule event", "lp-button");
    accept.addEventListener("click", () => host.scheduleEventSuggestion(conversationId, message.id));
    const decline = button("Decline", "lp-button lp-button-quiet");
    decline.addEventListener("click", () => host.declineEventSuggestion(conversationId, message.id));
    actions.append(accept, decline);
  } else if (invite.status === "scheduled" && invite.scheduledEventId) {
    const open = button("Open event", "lp-button lp-button-quiet");
    open.addEventListener("click", () => host.openTimeline(invite.scheduledEventId));
    actions.append(open);
  }
  if (actions.childElementCount)
    card.append(actions);
  return card;
}

// src/frontend/apps/messages.ts
var PAUSE_COPY = {
  ended: "stopped responding.",
  busy: "is busy right now.",
  away: "went unavailable.",
  sleeping: "went offline for the night.",
  unknown: "stopped responding."
};
var LOCAL_COPY = {
  in_scene: "is currently with you.",
  arrived: "is here now.",
  took_action: "continued this in the main conversation.",
  continued_in_person: "continued this in person."
};
function conversationTitle(state, conversation, deviceOwnerActorId) {
  return conversationTitleForDevice(state, conversation, deviceOwnerActorId);
}
function newConversationView(host) {
  if (host.readOnlyDevice)
    return host.empty("Inspection mode", "Switch back to the roleplay Persona device to create or send conversations.");
  const { page, content } = host.page("New Message", "Choose a contact or start a group");
  const search = el("input", "lp-input");
  search.type = "search";
  search.placeholder = "Who are we texting?";
  search.setAttribute("aria-label", "Search recipients");
  const startGroup = button("＋ New group", "lp-button lp-button-primary");
  startGroup.disabled = listPocketActors(host.state).length < 2;
  startGroup.addEventListener("click", () => host.selectConversation("", "group-editor"));
  content.append(search, startGroup);
  const collections = host.state.contactGroups || [];
  if (collections.length) {
    const { section, body } = sectionBlock("Your contact groups", "Start a chat with a saved collection.");
    for (const group of collections) {
      const start = button(`${group.name} · ${group.memberIds.length}`, "lp-button lp-button-quiet");
      start.disabled = group.memberIds.length < 2;
      start.addEventListener("click", () => host.startContactGroup(group.name, group.memberIds));
      body.append(start);
    }
    content.append(section);
  }
  const { section: directSection, body: directBody } = sectionBlock("Direct message", "Start or reopen a private Pocket conversation.");
  const latest = new Map;
  for (const conversation of host.state.conversations) {
    if (conversation.kind !== "direct" || !conversationVisibleOnDevice(host.state, conversation, host.deviceOwnerActorId))
      continue;
    const time = Date.parse(conversation.messages.at(-1)?.createdAt || conversation.updatedAt || "") || 0;
    for (const id of conversationActorIds(conversation))
      latest.set(id, Math.max(latest.get(id) || 0, time));
  }
  const contacts = [...host.state.contacts].sort((a, b) => (latest.get(b.id) || 0) - (latest.get(a.id) || 0) || a.name.localeCompare(b.name));
  let sectionLabel = "";
  for (const contact of contacts) {
    const label = latest.has(contact.id) ? "Recent" : "All contacts";
    if (label !== sectionLabel) {
      directBody.append(el("div", "lp-eyebrow", label));
      sectionLabel = label;
    }
    const row = button("", "lp-message-picker-row");
    row.type = "button";
    const actor = resolvePocketActor(host.state, contact.id);
    const avatar = el("span", "lp-avatar", contact.name.slice(0, 1).toUpperCase());
    if (actor?.accent)
      avatar.style.setProperty("--contact-accent", actor.accent);
    if (actor?.avatarUrl) {
      const image = el("img");
      image.src = actor.avatarUrl;
      image.alt = "";
      image.style.objectPosition = `${contact.avatarFocus?.x ?? 50}% ${contact.avatarFocus?.y ?? 50}%`;
      avatar.replaceChildren(image);
    }
    row.append(avatar, identityBlock({ name: contact.name, meta: contact.role }), el("span", "lp-message-picker-chevron", "›"));
    row.addEventListener("click", () => host.openDirect(contact.id));
    row.dataset.search = `${contact.name} ${contact.role}`.toLocaleLowerCase();
    directBody.appendChild(row);
  }
  if (!contacts.length)
    directBody.appendChild(el("p", "lp-copy", "No contacts are available yet."));
  const { section: groupSection, body: groupBody } = sectionBlock("Someone missing?", "Bring another person into your Pocket.");
  const addContact = button("＋ Add a contact", "lp-button lp-button-quiet");
  addContact.addEventListener("click", () => host.openContacts());
  groupBody.appendChild(addContact);
  const noMatches = el("p", "lp-copy", "Nobody by that name yet. Try another search or add a contact.");
  noMatches.hidden = true;
  search.addEventListener("input", () => {
    let count = 0;
    for (const row of directBody.querySelectorAll("[data-search]")) {
      row.hidden = !row.dataset.search.includes(search.value.trim().toLocaleLowerCase());
      if (!row.hidden)
        count++;
    }
    noMatches.hidden = count > 0 || !search.value.trim();
  });
  directBody.appendChild(noMatches);
  content.append(directSection, groupSection);
  return page;
}
function groupEditor(host, conversation) {
  if (host.readOnlyDevice)
    return host.empty("Inspection mode", "Switch back to the roleplay Persona device to modify group membership.");
  let saveGroup = () => {};
  const { page, content } = host.page(conversation ? "Group Details" : "New Group", "Choose at least two contacts", { label: "Save", callback: () => saveGroup() });
  const title = el("input", "lp-input");
  title.placeholder = "Group name";
  title.value = host.groupDraft?.title ?? conversation?.title ?? "";
  const choices = el("div", "lp-contact-checklist lp-participant-picker");
  const selected = new Set(host.groupDraft?.participants ?? (conversation ? conversationActorIds(conversation) : []));
  const count = el("p", "lp-copy");
  const selectedNames = el("div", "lp-selected-members");
  const save = page.querySelector(".lp-nav-action:last-child");
  const remember = () => {
    const participants = [...choices.querySelectorAll("input:checked")].map((entry) => entry.value);
    host.updateGroupDraft({ title: title.value, participants });
    count.textContent = `${participants.length} selected · choose at least two people`;
    selectedNames.replaceChildren(...participants.map((id) => el("span", "lp-chip", resolvePocketActor(host.state, id)?.name || id)));
    save.disabled = participants.length < 2 || host.groupSaving;
    if (host.groupSaving)
      save.textContent = "Saving…";
  };
  title.addEventListener("input", remember);
  const search = el("input", "lp-input");
  search.type = "search";
  search.placeholder = "Search group members";
  search.addEventListener("input", () => {
    for (const row of choices.querySelectorAll(".lp-picker-row"))
      row.hidden = !row.textContent.toLowerCase().includes(search.value.trim().toLowerCase());
  });
  for (const actor of listPocketActors(host.state)) {
    const row = el("label", "lp-picker-row");
    const checkbox = el("input", "lp-visually-hidden");
    checkbox.type = "checkbox";
    checkbox.value = actor.actorId;
    checkbox.checked = selected.has(actor.actorId);
    const avatar = el("span", "lp-picker-avatar", actor.name.slice(0, 1).toUpperCase());
    avatar.style.setProperty("--message-accent", actor.accent);
    if (actor.avatarUrl) {
      const image = el("img");
      image.src = actor.avatarUrl;
      image.alt = "";
      avatar.replaceChildren(image);
    }
    const identity = identityBlock({
      name: actor.name,
      meta: `${actor.role}${actor.kind === "discovered" ? " · discovered" : ""}`
    });
    const check = el("span", "lp-picker-check", "✓");
    const sync = () => {
      row.dataset.selected = String(checkbox.checked);
    };
    checkbox.addEventListener("change", sync);
    checkbox.addEventListener("change", remember);
    sync();
    row.append(avatar, identity, checkbox, check);
    choices.appendChild(row);
  }
  saveGroup = () => {
    const participantActorIds = [...choices.querySelectorAll("input:checked")].map((entry) => entry.value);
    if (participantActorIds.length < 2)
      return;
    save.disabled = true;
    save.textContent = "Creating…";
    if (host.groupSaving)
      return;
    host.saveGroup(conversation ? "lumiphone:update_conversation" : "lumiphone:create_conversation", {
      conversationId: conversation?.id,
      title: title.value.trim(),
      participantActorIds
    });
  };
  content.append(fieldBlock("Group name", title), count, selectedNames, search, choices);
  remember();
  if (conversation) {
    const remove = button("Delete group", "lp-button lp-button-danger");
    remove.addEventListener("click", () => host.send("lumiphone:delete", { kind: "conversation", id: conversation.id }));
    content.appendChild(remove);
  }
  return page;
}
function participantAvatar(actor, continuation = false) {
  const node = el("div", continuation ? "lp-group-avatar lp-group-avatar-spacer" : "lp-group-avatar", actor.name.slice(0, 1).toUpperCase());
  node.style.setProperty("--message-accent", actor.accent);
  if (!continuation && actor.avatarUrl) {
    const image = el("img");
    image.src = actor.avatarUrl;
    image.alt = "";
    node.replaceChildren(image);
  }
  return node;
}
function handoffActivity(host, conversation, relay) {
  const continuation = relay.continuation;
  const failed = relay.status === "pending" && (continuation.state === "blocked" || continuation.state === "failed" || continuation.state === "stopped" || Boolean(relay.injectionError));
  const completed = relay.status === "consumed" || continuation.state === "completed";
  const generating = !failed && !completed && Boolean(relay.injectedAt || continuation.state === "started");
  const accepted = !failed && !completed && !generating && continuation.state === "accepted";
  const state = completed ? "completed" : failed ? "failed" : generating ? "generating" : accepted ? "accepted" : "preparing";
  const actor = host.state.contacts.find((entry) => entry.id === relay.contactId)?.name || conversation.title || "Conversation";
  const activity = el("div", "lp-handoff-activity");
  activity.dataset.relayId = relay.id;
  activity.dataset.state = state;
  activity.setAttribute("role", "status");
  const primary = el("div", "lp-handoff-primary");
  const mark = el("span", "lp-handoff-mark", completed ? "✓" : failed ? "!" : "");
  const copy = el("div", "lp-grow");
  const arrival = relay.kind === "arrival";
  const title = arrival ? completed ? "Continued toward arrival" : failed ? "Couldn’t continue toward arrival" : generating ? "Continuing toward arrival…" : accepted ? "Host accepted the arrival bridge" : "Preparing arrival bridge…" : completed ? "Continued in roleplay" : failed ? "Couldn’t continue in roleplay" : generating ? "Continuing in roleplay…" : accepted ? "Host accepted the handoff" : "Preparing roleplay handoff…";
  const subtitle = arrival ? completed ? `${actor} is still marked on the way until the RP establishes arrival.` : failed ? continuation.error || relay.injectionError || "The arrival bridge is still pending." : generating ? `${actor} is moving toward you; you can continue chatting.` : accepted ? "Waiting for arrival-relay injection." : `${actor} is moving toward you; you can continue chatting. After a quiet moment, Pocket continues the roleplay.` : completed ? `${actor} continued in the main RP.` : failed ? continuation.error || relay.injectionError || "The handoff is still pending." : generating ? "Pocket delivered the conversation context to the scene." : accepted ? "Waiting for relay injection." : "Gathering the latest phone exchange.";
  copy.append(el("strong", "", title), el("span", "lp-copy", subtitle));
  primary.append(mark, copy);
  if (completed) {
    const open = button("Open RP", "lp-handoff-action");
    open.addEventListener("click", () => host.openRoleplay());
    primary.appendChild(open);
  } else if (failed) {
    const retry = button("Retry", "lp-handoff-action");
    retry.addEventListener("click", () => host.continueRelay());
    primary.appendChild(retry);
  }
  activity.appendChild(primary);
  const more = el("details", "lp-handoff-more");
  const summary = el("summary", "", "More");
  const secondary = el("div", "lp-handoff-secondary");
  if (relay.status === "pending") {
    const anyway = button("Message anyway", "lp-button lp-button-quiet");
    anyway.addEventListener("click", () => host.messageAnyway(conversation.id));
    secondary.appendChild(anyway);
  }
  if (relay.timelineEventId) {
    const timeline = button("Timeline handoff", "lp-button lp-button-quiet");
    timeline.addEventListener("click", () => host.openTimeline(relay.timelineEventId));
    secondary.appendChild(timeline);
  }
  const permissions = continuation.permissions ? `chat mutation ${continuation.permissions.chatMutation ? "granted" : "missing"} · generation ${continuation.permissions.generation ? "granted" : "missing"}` : "not checked";
  const diagnostics = el("div", "lp-handoff-diagnostics");
  for (const row of [
    `Relay: ${relay.id}`,
    `State: ${continuation.state}`,
    `Invoked: ${continuation.invokedAt || "not yet"}`,
    `Permissions: ${permissions}`,
    `Method: ${continuation.method || "not called"}`,
    `Host accepted: ${continuation.hostAcceptedAt || "no"}`,
    `Generation event: ${continuation.generationStartedAt || "not observed"}`,
    `Generation completed: ${continuation.generationCompletedAt || "not observed"}`,
    `Generation ID: ${continuation.generationId || "none"}`,
    `Relay snapshot: ${relay.conversationTail.text.length} chars`,
    `Recent exchange: ${relay.relayExchangeMessageCount ?? relay.conversationTail.recentMessageIds.length} messages`,
    `Serialized relay: ${relay.serializedRelayChars || 0} chars`,
    `Injected: ${relay.injectedAt ? `yes · ${relay.injectedGenerationId || "generation association pending"}` : "no"}`,
    `Consumption: ${relay.status}`,
    relay.injectionError ? `Injection error: ${relay.injectionError}` : "",
    continuation.error ? `Error: ${continuation.error}` : ""
  ].filter(Boolean))
    diagnostics.appendChild(el("span", "lp-copy", row));
  const decision = conversation.lastDecision;
  if (decision?.relayId === relay.id)
    diagnostics.appendChild(el("span", "lp-copy", `Channel decision: ${decision.rawAction} → ${decision.normalizedAction}${decision.reason ? ` · ${decision.reason}` : ""}${decision.normalizationReason ? ` · ${decision.normalizationReason}` : ""}`));
  secondary.appendChild(diagnostics);
  if (relay.serializedRelay) {
    const serialized = el("details", "lp-channel-diagnostic");
    serialized.append(el("summary", "", "View serialized relay"), el("pre", "lp-code-block", relay.serializedRelay));
    secondary.appendChild(serialized);
  }
  more.append(summary, secondary);
  activity.appendChild(more);
  if (host.shouldFocusHandoff(relay.id))
    requestAnimationFrame(() => activity.scrollIntoView?.({ block: "center", behavior: "smooth" }));
  return activity;
}
function referenceAttachment(host, reference) {
  const node = el("div", "lp-reference-attachment");
  node.dataset.referenceId = reference.id;
  node.dataset.state = reference.status;
  node.setAttribute("role", "status");
  const copy = el("div", "lp-grow");
  const title = reference.status === "failed" ? "Reference wasn’t delivered" : reference.status === "injected" ? "Reference attached to roleplay generation" : "Attached to next roleplay turn";
  const scope = reference.scope === "selected_messages" ? `${reference.messages.length} selected message${reference.messages.length === 1 ? "" : "s"}` : reference.scope === "recent_messages" ? "Recent messages" : "Current conversation";
  copy.append(el("strong", "", title), el("span", "lp-copy", `${reference.conversationTitle} · ${scope}`));
  const mark = el("span", "lp-reference-mark", reference.status === "failed" ? "!" : reference.status === "injected" ? "↗" : "✓");
  const actions = el("div", "lp-reference-actions");
  if (reference.status === "armed") {
    const roleplay = button("Return to roleplay", "lp-reference-action");
    roleplay.addEventListener("click", () => host.openRoleplay());
    const cancel = button("Cancel", "lp-reference-action lp-reference-action-quiet");
    cancel.addEventListener("click", () => host.cancelReference(reference.id));
    actions.append(roleplay, cancel);
  } else if (reference.status === "failed") {
    const retry = button("Attach again", "lp-reference-action");
    retry.addEventListener("click", () => host.rearmReference(reference.id));
    const cancel = button("Dismiss", "lp-reference-action lp-reference-action-quiet");
    cancel.addEventListener("click", () => host.cancelReference(reference.id));
    actions.append(retry, cancel);
  }
  const head = el("div", "lp-reference-head");
  head.append(mark, copy, actions);
  node.appendChild(head);
  node.appendChild(el("p", "lp-reference-safety", reference.status === "injected" ? "Pocket supplied this as context only; participant scene presence was not changed." : reference.status === "failed" ? reference.error || "The reference remains available to attach again." : "Pocket will wait for your RP message. This does not move any participant into the scene."));
  const diagnostics = el("details", "lp-reference-diagnostics");
  const body = el("div", "lp-handoff-diagnostics");
  for (const row of [
    `Reference: ${reference.id}`,
    `Status: ${reference.status}`,
    `Scope: ${reference.scope}`,
    `Messages: ${reference.messages.length}`,
    `Bound user message: ${reference.boundUserMessageId || "waiting for next RP turn"}`,
    `Generation: ${reference.injectedGenerationId || "not bound"}`,
    `Injected: ${reference.injectedAt || "no"}`,
    `Serialized reference: ${reference.serializedReferenceChars || 0} chars`,
    reference.error ? `Error: ${reference.error}` : ""
  ].filter(Boolean))
    body.appendChild(el("span", "lp-copy", row));
  if (reference.serializedReference) {
    const serialized = el("details", "lp-channel-diagnostic");
    serialized.append(el("summary", "", "View serialized reference"), el("pre", "lp-code-block", reference.serializedReference));
    body.appendChild(serialized);
  }
  diagnostics.append(el("summary", "", "Diagnostics"), body);
  node.appendChild(diagnostics);
  return node;
}
function renderMessagesView(host) {
  const selectedConversation = host.state.conversations.find((item) => item.id === host.selectedConversationId && conversationVisibleOnDevice(host.state, item, host.deviceOwnerActorId)) || null;
  if (host.selectedView === "new-group")
    return newConversationView(host);
  if (host.selectedView === "group-editor")
    return groupEditor(host, null);
  if (selectedConversation?.kind === "group" && host.selectedView === "group-detail")
    return groupEditor(host, selectedConversation);
  if (!selectedConversation) {
    const conversations = host.state.conversations.filter((conversation) => conversationVisibleOnDevice(host.state, conversation, host.deviceOwnerActorId)).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    const { page, content } = host.page("Messages", `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`, {
      label: host.readOnlyDevice ? "" : "New",
      callback: () => host.selectConversation("", "new-group"),
      enabled: !host.readOnlyDevice
    });
    content.classList.add("lp-conversation-list");
    for (const conversation of conversations) {
      const row = button("", "lp-conversation-row");
      row.dataset.clickable = "true";
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      const titleText = conversationTitle(host.state, conversation, host.deviceOwnerActorId);
      const members = counterpartActorIds(host.state, conversation, host.deviceOwnerActorId);
      const avatar = el("div", "lp-avatar", conversation.kind === "group" ? String(members.length) : titleText.slice(0, 1).toUpperCase());
      const directActor = conversation.kind === "direct" ? resolvePocketActor(host.state, members[0]) : null;
      if (directActor?.avatarUrl) {
        const image = el("img");
        image.src = directActor.avatarUrl;
        image.alt = "";
        avatar.replaceChildren(image);
      }
      avatar.style.background = avatarColor(members[0] || titleText);
      const latest = conversation.messages.at(-1);
      const description = latest ? `${conversation.kind === "group" && latest.sender === "contact" ? `${latest.senderName}: ` : ""}${latest.text}` : "";
      const identity = identityBlock({ name: titleText, meta: latest ? formatTime(latest.createdAt) : "", description });
      row.append(avatar, identity);
      const unread = conversationUnreadForDevice(host.state, conversation, host.deviceOwnerActorId);
      if (unread)
        row.appendChild(el("span", "lp-unread", String(unread)));
      const open = () => host.selectConversation(conversation.id);
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
      content.appendChild(row);
    }
    if (!conversations.length)
      content.appendChild(host.empty("No conversations yet", "Open Contacts to message a character, Council member, or Pocket NPC."));
    return page;
  }
  const conversation = selectedConversation;
  const titleText = conversationTitle(host.state, conversation, host.deviceOwnerActorId);
  const page = el("div", "lp-thread");
  const nav = el("header", "lp-nav");
  const back = button("‹ Back", "lp-nav-action");
  back.addEventListener("click", () => host.back());
  const title = el("div", "lp-nav-title", titleText);
  const memberActorIds = conversationDeviceActorIds(host.state, conversation);
  const counterpartIds = counterpartActorIds(host.state, conversation, host.deviceOwnerActorId);
  title.appendChild(el("span", "lp-nav-subtitle", host.readOnlyDevice ? `${conversation.kind === "group" ? memberActorIds.length : 2} participants · inspection mode` : conversation.kind === "group" ? `${memberActorIds.length} participants` : "Direct message"));
  const menu = el("details", "lp-conversation-menu");
  const menuToggle = el("summary", "lp-nav-action", "⋯");
  menuToggle.setAttribute("aria-label", "Conversation menu");
  const menuSheet = el("div", "lp-conversation-menu-sheet");
  const menuAction = (label, callback) => {
    const action = button(label, "lp-conversation-menu-action");
    action.addEventListener("click", () => {
      menu.open = false;
      callback();
    });
    return action;
  };
  menuSheet.appendChild(menuAction(conversation.kind === "group" ? "Participants" : "Contact info", () => {
    if (conversation.kind === "group")
      host.selectConversation(conversation.id, "group-detail");
    else if (counterpartIds[0])
      host.openActor(counterpartIds[0]);
  }));
  const referenceAction = menuAction("Reference in roleplay", () => host.showReferenceSheet(conversation.id));
  referenceAction.disabled = host.readOnlyDevice || !conversation.messages.some((message) => message.sender !== "system");
  menuSheet.appendChild(referenceAction);
  menuSheet.appendChild(menuAction("View Timeline", () => host.openTimeline("")));
  menuSheet.appendChild(menuAction("Generation info", () => host.showConversationGenerationInfo(conversation.id)));
  menuSheet.appendChild(menuAction("Outgoing prompt", () => host.showOutgoingPrompt(conversation.id)));
  menu.append(menuToggle, menuSheet);
  nav.append(back, title, menu);
  page.appendChild(nav);
  const referenceSlot = el("div", "lp-reference-slot");
  const activeReference = [...host.state.references].reverse().find((entry) => entry.conversationId === conversation.id && (entry.status === "armed" || entry.status === "injected" || entry.status === "failed"));
  if (activeReference)
    referenceSlot.appendChild(referenceAttachment(host, activeReference));
  page.appendChild(referenceSlot);
  const busy = host.busyConversations.get(conversation.id);
  const replyBusy = Boolean(busy);
  const directActor = conversation.kind === "direct" ? resolvePocketActor(host.state, counterpartIds[0] || "") : null;
  const directContact = directActor?.contact || null;
  const scenePresent = Boolean(directContact?.presence.inScene);
  const bubbles = el("div", "lp-bubbles");
  bubbles.dataset.pocketThread = conversation.id;
  bubbles.dataset.conversationKind = conversation.kind;
  const conversationRelays = host.readOnlyDevice ? [] : host.state.relays.filter((entry) => entry.conversationId === conversation.id && entry.status !== "dismissed");
  const renderedRelayIds = new Set;
  let priorGroupSpeakerId = "";
  let priorBurstKey = "";
  for (const message of conversation.messages) {
    const bubble = el("div", "lp-bubble lp-message-surface");
    bubble.dataset.messageId = message.id;
    bubble.dataset.selected = String(message.id === host.selectedMessageId);
    if (message.call) {
      bubble.classList.add("lp-call-history");
      bubble.dataset.callStatus = message.call.status;
    }
    const direction = messageDirection(host.state, conversation, message, host.deviceOwnerActorId);
    bubble.dataset.sender = direction === "outbound" ? "persona" : message.sender === "system" ? "system" : "contact";
    const senderActor = message.senderActorId ? resolvePocketActor(host.state, message.senderActorId) : message.sender === "contact" ? resolvePocketActor(host.state, message.senderContactId || counterpartIds[0] || "") : null;
    const resolvedAccent = senderActor?.accent || message.senderAccent || directActor?.accent || "";
    if (direction !== "outbound")
      bubble.style.setProperty("--message-accent", resolvedAccent);
    const messageActorId = message.senderActorId || message.senderContactId || "";
    const burstKey = `${bubble.dataset.sender}:${messageActorId}`;
    bubble.dataset.burstContinuation = String(priorBurstKey === burstKey && message.sender !== "system");
    priorBurstKey = burstKey;
    const continuesRun = conversation.kind === "group" && direction !== "outbound" && priorGroupSpeakerId === messageActorId;
    if (conversation.kind === "group" && direction !== "outbound" && !continuesRun && senderActor) {
      const sender = button(senderActor?.name || message.senderName, "lp-bubble-sender lp-actor-link");
      sender.addEventListener("click", () => {
        if (messageActorId)
          host.openActor(messageActorId);
      });
      bubble.appendChild(sender);
    }
    bubble.append(message.format === "voice" && host.renderVoiceMessage ? host.renderVoiceMessage(message) : document.createTextNode(message.text), el("span", "lp-bubble-time", `${formatTime(message.createdAt)} · ${message.status}`));
    if (message.generation || message.origin || !host.readOnlyDevice) {
      const tools = el("div", "lp-bubble-tools");
      if (message.generation && !host.readOnlyDevice) {
        const retry = button("↻", "lp-bubble-action");
        retry.textContent = "Retry message";
        retry.type = "button";
        retry.title = "Retry";
        retry.setAttribute("aria-label", `Retry message from ${message.senderName}`);
        retry.addEventListener("click", () => host.send("lumiphone:retry_message", { conversationId: conversation.id, messageId: message.id }));
        tools.appendChild(retry);
      }
      if (message.generation || message.origin) {
        const generationInfo = button("ⓘ", "lp-bubble-action");
        generationInfo.textContent = "Generation info";
        generationInfo.type = "button";
        generationInfo.title = "Generation info";
        generationInfo.setAttribute("aria-label", "Generation info");
        generationInfo.addEventListener("click", () => host.showGenerationInfo(message));
        tools.appendChild(generationInfo);
      }
      if (!host.readOnlyDevice) {
        const remove = button("×", "lp-bubble-action");
        remove.textContent = "Delete message";
        remove.type = "button";
        remove.title = "Delete message";
        remove.setAttribute("aria-label", "Delete message");
        remove.dataset.destructive = "true";
        remove.addEventListener("click", () => host.send("lumiphone:delete", { kind: "message", conversationId: conversation.id, id: message.id }));
        tools.appendChild(remove);
      }
      const more = button("⋯", "lp-message-more");
      more.setAttribute("aria-label", "Message actions");
      more.addEventListener("click", () => showPocketSheet(more, "Message actions", tools));
      bubble.appendChild(more);
    }
    if (conversation.kind === "group" && direction !== "outbound" && senderActor) {
      const row = el("div", "lp-group-message");
      row.style.setProperty("--message-accent", resolvedAccent);
      row.dataset.continuation = String(continuesRun);
      const avatar = participantAvatar(senderActor, continuesRun);
      if (!continuesRun) {
        avatar.dataset.clickable = "true";
        avatar.tabIndex = 0;
        avatar.setAttribute("role", "button");
        avatar.addEventListener("click", () => host.openActor(messageActorId));
        avatar.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            host.openActor(messageActorId);
          }
        });
      }
      row.append(avatar, bubble);
      bubbles.appendChild(row);
      priorGroupSpeakerId = messageActorId;
    } else {
      bubbles.appendChild(bubble);
      priorGroupSpeakerId = "";
    }
    for (const relay of conversationRelays.filter((entry) => entry.sourceMessageId === message.id)) {
      bubbles.appendChild(handoffActivity(host, conversation, relay));
      renderedRelayIds.add(relay.id);
      priorBurstKey = "";
    }
  }
  for (const relay of conversationRelays.filter((entry) => !renderedRelayIds.has(entry.id)))
    bubbles.appendChild(handoffActivity(host, conversation, relay));
  if (!host.readOnlyDevice) {
    const seenInvites = new Set;
    for (const message of conversation.messages) {
      if (!message.eventSuggestion || seenInvites.has(message.eventSuggestion.id))
        continue;
      seenInvites.add(message.eventSuggestion.id);
      bubbles.append(eventInvite(message, conversation.id, host));
    }
  }
  if (busy?.phase === "checking") {
    const checking = el("div", conversation.kind === "group" ? "lp-group-typing" : "lp-conversation-status");
    checking.appendChild(el("span", "", conversation.kind === "group" ? titleText : "Checking for reply…"));
    if (conversation.kind === "group") {
      const dots = el("span", "lp-typing-dots");
      dots.append(el("i"), el("i"), el("i"));
      checking.appendChild(dots);
    }
    checking.setAttribute("role", "status");
    bubbles.appendChild(checking);
  } else if (busy) {
    const pending = el("div", conversation.kind === "group" ? "lp-group-typing" : "lp-bubble lp-bubble-pending");
    const busyActor = resolvePocketActor(host.state, busy.speakerContactId);
    if (conversation.kind === "group")
      pending.appendChild(el("span", "", `${busyActor?.name || "Someone"} is typing…`));
    else
      pending.dataset.sender = "contact";
    pending.setAttribute("role", "status");
    pending.setAttribute("aria-label", conversation.kind === "group" ? `${busyActor?.name || "Someone"} is typing` : "Contact is typing");
    const dots = el("span", "lp-typing-dots");
    dots.append(el("i"), el("i"), el("i"));
    pending.appendChild(dots);
    bubbles.appendChild(pending);
  }
  const availability = scenePresent && conversation.availability.state !== "local" ? { state: "local", reason: "in_scene" } : conversation.availability;
  if (!replyBusy && (availability.state === "arriving" || availability.state === "paused" || conversation.pause)) {
    const reason = availability.state === "local" ? LOCAL_COPY[availability.reason] : availability.state === "arriving" ? "is on the way." : PAUSE_COPY[availability.state === "paused" ? availability.reason : conversation.pause.reason];
    const banner = el("div", availability.state === "arriving" ? "lp-conversation-status lp-arrival-status" : "lp-conversation-status");
    banner.dataset.pauseReason = availability.state === "local" ? availability.reason : availability.state === "arriving" ? "arriving" : availability.state === "paused" ? availability.reason : conversation.pause.reason;
    banner.appendChild(el("span", "", `${directContact?.name || titleText} ${reason}`));
    if (availability.state === "arriving" && directContact && !host.readOnlyDevice) {
      const activeArrivalRelay = conversationRelays.some((entry) => entry.kind === "arrival" && entry.status === "pending" && (entry.continuation.state === "launching" || entry.continuation.state === "accepted" || entry.continuation.state === "started"));
      if (!activeArrivalRelay) {
        const continueButton = button("Continue to arrival", "lp-handoff-action");
        continueButton.type = "button";
        continueButton.addEventListener("click", () => host.continueArrival(conversation.id));
        banner.appendChild(continueButton);
      }
    }
    bubbles.appendChild(banner);
  }
  if (!conversation.messages.length)
    bubbles.appendChild(host.empty("Say hello", "This thread is private to this Pocket roleplay state."));
  if (host.readOnlyDevice) {
    const inspect = el("div", "lp-conversation-status", `Viewing ${resolvePocketActor(host.state, host.deviceOwnerActorId)?.name || "this actor"}'s Pocket · inspection mode`);
    page.append(bubbles, inspect);
    return page;
  }
  if (availability.state === "local" && !host.manualOverride) {
    if (!conversationRelays.length)
      bubbles.appendChild(el("div", "lp-conversation-status", `${directContact?.name || titleText} is currently with you.`));
    page.appendChild(bubbles);
    return page;
  }
  const compose = el("form", "lp-compose");
  const sparkle = replyBusy ? button("■", "lp-button lp-button-icon lp-reply-stop") : scenePresent || conversation.pause ? button("⋯", "lp-button lp-button-icon lp-manual-reply") : host.iconButton("sparkle", "Generate one contact reply");
  const selectedGroupSpeaker = conversation.kind === "group" && memberActorIds.includes(host.selectedGroupSpeakerId) ? host.selectedGroupSpeakerId : "auto";
  const selectedGroupActor = selectedGroupSpeaker === "auto" ? null : resolvePocketActor(host.state, selectedGroupSpeaker);
  const generationLabel = conversation.kind === "group" ? selectedGroupActor ? `Generate one reply from ${selectedGroupActor.name}` : "Generate the next natural group burst" : "Generate one contact reply";
  sparkle.setAttribute("aria-label", scenePresent ? "Manually generate a reply while contact is here" : conversation.pause ? "Manually generate a reply in paused conversation" : generationLabel);
  sparkle.title = scenePresent ? "Manual reply — this contact is currently with you" : conversation.pause ? "Manual reply — conversation is paused" : generationLabel;
  if (replyBusy) {
    sparkle.setAttribute("aria-label", "Stop generating reply");
    sparkle.title = "Stop generating reply";
  }
  sparkle.disabled = !host.generationAvailable && !replyBusy;
  const speakerMenu = el("details", "lp-speaker-menu");
  if (conversation.kind === "group") {
    const summary = el("summary", "", selectedGroupActor ? `Next reply: ${selectedGroupActor.name} ×` : `${memberActorIds.length} participants · Auto speaker`);
    const sheet = el("div", "lp-speaker-sheet");
    sheet.appendChild(el("strong", "", "Who replies?"));
    const auto = button(`${selectedGroupSpeaker === "auto" ? "✓ " : ""}Auto`, "lp-speaker-option");
    auto.addEventListener("click", () => {
      speakerMenu.open = false;
      host.selectGroupSpeaker(conversation.id, "auto");
    });
    sheet.appendChild(auto);
    for (const actorId of memberActorIds) {
      const actor = resolvePocketActor(host.state, actorId);
      if (!actor)
        continue;
      const option = button(`${selectedGroupSpeaker === actor.actorId ? "✓ " : ""}${actor.name}`, "lp-speaker-option");
      option.addEventListener("click", () => {
        speakerMenu.open = false;
        host.selectGroupSpeaker(conversation.id, actor.actorId);
      });
      sheet.appendChild(option);
    }
    speakerMenu.append(summary, sheet);
  } else
    speakerMenu.hidden = true;
  sparkle.addEventListener("click", () => replyBusy ? host.cancelReply(conversation.id) : host.generateReply(conversation.id, conversation.kind === "group" ? selectedGroupSpeaker : counterpartIds[0]));
  const textarea = el("textarea", "lp-textarea");
  textarea.rows = 1;
  textarea.placeholder = "Message…";
  textarea.value = host.draft;
  textarea.dataset.pocketComposer = conversation.id;
  const resizeComposer = () => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 112 ? "auto" : "hidden";
  };
  textarea.addEventListener("focus", () => host.composerState(conversation.id, true));
  textarea.addEventListener("input", () => {
    host.updateDraft(conversation.id, textarea.value);
    host.composerState(conversation.id, true);
    resizeComposer();
  });
  textarea.addEventListener("blur", () => host.composerState(conversation.id, false));
  const submit = host.iconButton("send", "Send message");
  submit.type = "submit";
  textarea.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing)
      return;
    event.preventDefault();
    compose.requestSubmit();
  });
  compose.append(sparkle, textarea, submit);
  compose.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = inputValue(textarea);
    if (!message)
      return;
    host.send("lumiphone:action", { action: "message", payload: { conversationId: conversation.id, text: message, sender: "persona", explicitRemoteOverride: host.manualOverride } });
    textarea.value = "";
    host.updateDraft(conversation.id, "");
    resizeComposer();
  });
  const composerStack = el("div", "lp-compose-stack");
  if (conversation.kind === "group")
    composerStack.appendChild(speakerMenu);
  composerStack.appendChild(compose);
  page.append(bubbles, composerStack);
  requestAnimationFrame(() => {
    resizeComposer();
    const selected = host.selectedMessageId ? bubbles.querySelector(`[data-message-id="${CSS.escape(host.selectedMessageId)}"]`) : null;
    if (selected)
      selected.scrollIntoView({ block: "center" });
    else
      bubbles.scrollTop = bubbles.scrollHeight;
  });
  return page;
}

// src/frontend/components/ranked-search.ts
var normalize = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
function applyRankedSearch(rows, value) {
  const query = normalize(value), tokens = query.split(/\s+/).filter(Boolean);
  const ranked = rows.map((row, index) => {
    const name = normalize(row.name), terms = normalize(row.terms);
    const matches = tokens.every((token) => terms.includes(token));
    const score = !query ? 0 : name === query ? 0 : name.startsWith(query) ? 1 : name.split(/\s+/).some((word) => word.startsWith(query)) ? 2 : name.includes(query) ? 3 : tokens.every((token) => name.includes(token)) ? 4 : 5;
    row.node.dataset.pocketSearchResult = "true";
    row.node.hidden = !matches;
    return { row, index, score };
  }).sort((a, b) => a.score - b.score || a.index - b.index);
  for (const { row } of ranked)
    row.node.parentElement?.appendChild(row.node);
  return ranked.filter(({ row }) => !row.node.hidden).length;
}

// src/frontend/apps/contact-groups.ts
function members(host, bank) {
  return bank ? host.npcBank : host.state.contacts;
}
function groupEditor2(host, bank, importing = false) {
  const group = (bank ? host.bankGroups : host.state.contactGroups || []).find((group) => group.id === host.selectedGroupId);
  if (host.selectedGroupId && !group)
    return host.empty("Group unavailable", "This group has been removed.");
  const { page, content } = host.page(importing ? "Import Cast" : group ? `Edit ${group.name}` : bank ? "New Portable Cast" : "New Contact Group", bank ? "Saved NPC identities across chats" : "Contacts in this roleplay");
  const name = el("input", "lp-input");
  name.value = host.collectionDraft?.name ?? group?.name ?? "";
  name.placeholder = "Group name";
  const selected = new Set(host.collectionDraft?.memberIds ?? group?.memberIds ?? []);
  const choices = el("div", "lp-contact-checklist lp-participant-picker");
  const available = members(host, bank).filter((entry) => !importing || group?.memberIds.includes(entry.id));
  const count = el("p", "lp-copy");
  const actions = actionGroup();
  const save = button(host.collectionSaving ? "Saving…" : importing ? "Import selected" : "Save group", "lp-button");
  const remember = () => {
    const memberIds = [...choices.querySelectorAll("input:checked")].map((input) => input.value);
    host.updateCollectionDraft({ name: name.value, memberIds });
    count.textContent = `${memberIds.length} selected${importing ? " · linked members will be reused" : ""}`;
    save.disabled = host.collectionSaving || !memberIds.length || !importing && !name.value.trim();
  };
  for (const entry of available) {
    const row = el("label", "lp-picker-row");
    const check = el("input");
    check.type = "checkbox";
    check.value = entry.id;
    check.checked = selected.has(entry.id);
    const linked = bank && host.state.contacts.some((contact) => contact.source.kind === "npc" && contact.source.bankId === entry.id);
    row.append(check, identityBlock({ name: entry.name, meta: `${entry.role}${linked ? " · already in this chat" : ""}` }));
    check.addEventListener("change", remember);
    choices.append(row);
  }
  const all = button("Select all", "lp-button lp-button-quiet");
  all.addEventListener("click", () => {
    for (const input of choices.querySelectorAll("input"))
      input.checked = true;
    remember();
  });
  const none = button("Clear", "lp-button lp-button-quiet");
  none.addEventListener("click", () => {
    for (const input of choices.querySelectorAll("input"))
      input.checked = false;
    remember();
  });
  actions.append(all, none);
  name.addEventListener("input", remember);
  save.addEventListener("click", () => {
    const memberIds = [...choices.querySelectorAll("input:checked")].map((input) => input.value);
    host.saveCollection(importing ? "lumiphone:npc_cast_import" : bank ? "lumiphone:npc_cast_save" : "lumiphone:contact_group_save", { groupId: group?.id, name: name.value.trim(), memberIds });
  });
  if (!importing)
    content.append(fieldBlock("Name", name));
  else
    content.append(el("p", "lp-copy", "Import stable profiles and photos. Presence, relationships, messages, and tracker values stay in their original chats."));
  content.append(count, actions, choices, save);
  if (!available.length)
    content.append(el("p", "lp-copy", bank ? "Save some NPC profiles to the Bank first." : "Add contacts first."));
  remember();
  return page;
}
function bankEditor(host) {
  const entry = host.npcBank.find((entry) => entry.id === host.selectedContactId);
  if (!entry)
    return host.empty("Profile unavailable", "This NPC Bank profile has been removed.");
  const { page, content } = host.page("Edit Bank Profile", "Changes affect future imports");
  const source = { ...entry, ...host.collectionDraft };
  const fields = {};
  for (const [key, label, multiline, value] of [
    ["name", "Name", false, source.name],
    ["role", "Role", false, source.role],
    ["identityBrief", "Compact profile", true, source.identityBrief],
    ["personality", "Personality", true, source.phoneProfile?.personality],
    ["appearance", "Appearance", true, source.phoneProfile?.appearance],
    ["textingStyle", "Texting style", true, source.phoneProfile?.textingStyle],
    ["aliases", "Aliases · one per line", true, source.aliases.join(`
`)],
    ["tags", "Tags · one per line", true, source.tags.join(`
`)]
  ]) {
    const input = multiline ? el("textarea", "lp-textarea") : el("input", "lp-input");
    input.value = String(value || "");
    fields[key] = input;
    content.append(fieldBlock(label, input));
  }
  const collect = () => ({ name: fields.name.value, role: fields.role.value, identityBrief: fields.identityBrief.value, phoneProfile: { personality: fields.personality.value, appearance: fields.appearance.value, textingStyle: fields.textingStyle.value }, aliases: fields.aliases.value.split(`
`).filter(Boolean), tags: fields.tags.value.split(`
`).filter(Boolean) });
  content.addEventListener("input", () => host.updateCollectionDraft(collect()));
  const save = button(host.collectionSaving ? "Saving…" : "Save Bank profile");
  save.disabled = host.collectionSaving;
  save.addEventListener("click", () => host.saveCollection("lumiphone:npc_bank_edit", { bankId: entry.id, entry: collect() }));
  content.append(save);
  return page;
}
function renderContactGroups(host) {
  if (host.selectedView === "group-config")
    return groupEditor2(host, false);
  if (host.selectedView === "cast-config")
    return groupEditor2(host, true);
  if (host.selectedView === "cast-import")
    return groupEditor2(host, true, true);
  if (host.selectedView === "bank-entry")
    return bankEditor(host);
  const bank = host.selectedView === "bank";
  const { page, content } = host.page(bank ? "NPC Bank" : "Contact Groups", bank ? `${host.npcBank.length} reusable profiles` : "Collections for this roleplay", { label: "New", callback: () => host.selectGroup("", bank ? "cast-config" : "group-config") });
  const groups = bank ? host.bankGroups : host.state.contactGroups || [];
  const search = el("input", "lp-input");
  search.type = "search";
  search.placeholder = bank ? "Search casts and saved NPCs" : "Search contact groups";
  search.setAttribute("aria-label", bank ? "Search NPC Bank" : "Search contact groups");
  const noMatches = el("p", "lp-copy", "No matching profiles or casts.");
  noMatches.hidden = true;
  const cards = [];
  content.append(search);
  if (!bank) {
    const portable = button("NPC Bank & portable casts", "lp-button lp-button-quiet");
    portable.addEventListener("click", () => host.selectGroup("", "bank"));
    content.append(portable);
  }
  const casts = bank ? sectionBlock("Portable casts", "Groups you can bring into another chat.", "lp-bank-casts") : null;
  const profiles = bank ? sectionBlock("Individual NPCs", "Saved identities, ready to reuse.", "lp-bank-individuals") : null;
  if (casts)
    content.append(casts.section);
  for (const group of groups) {
    const people = group.memberIds.map((id) => members(host, bank).find((entry) => entry.id === id)).filter((entry) => Boolean(entry));
    const { section, body } = sectionBlock(group.name, `${people.length} members${bank ? " · portable cast" : ""}`, "lp-card lp-contact-group");
    body.append(el("p", "lp-copy", people.map((entry) => entry.name).join(" · ") || "No members left. Edit this group to add people."));
    const actions = actionGroup();
    const edit = button("Edit", "lp-button lp-button-quiet");
    edit.addEventListener("click", () => host.selectGroup(group.id, bank ? "cast-config" : "group-config"));
    actions.append(edit);
    if (bank) {
      const importCast = button("Import…");
      importCast.disabled = !people.length;
      importCast.addEventListener("click", () => host.selectGroup(group.id, "cast-import"));
      actions.append(importCast);
    } else {
      const chat = button("Start group chat");
      chat.disabled = group.memberIds.length < 2;
      chat.addEventListener("click", () => host.startGroup(group.name, group.memberIds));
      actions.append(chat);
      const save = button(group.bankGroupId ? "Update saved cast" : "Save as portable cast", "lp-button lp-button-quiet");
      save.disabled = !people.length || people.some((entry) => !entry || !("source" in entry) || entry.source.kind !== "npc") || host.collectionSaving;
      save.addEventListener("click", () => host.saveCollection("lumiphone:contact_group_bank", { groupId: group.id }));
      actions.append(save);
      if (save.disabled && people.length)
        body.append(el("p", "lp-copy", "Portable casts contain Pocket NPCs. Linked Characters stay local."));
    }
    const remove = button("Remove group", "lp-button lp-button-danger");
    remove.disabled = host.collectionSaving;
    remove.addEventListener("click", () => host.saveCollection(bank ? "lumiphone:npc_cast_delete" : "lumiphone:contact_group_delete", { groupId: group.id }));
    actions.append(remove);
    body.append(actions);
    (casts?.body || content).append(section);
    cards.push({ node: section, name: group.name, terms: `${group.name} ${people.map((entry) => entry.name).join(" ")}`.toLowerCase() });
  }
  if (!groups.length)
    (casts?.body || content).append(el("p", "lp-copy", bank ? "Save a cast to reuse the same NPCs in other chats." : "Organize a cast, family, team, or faction here."));
  if (profiles)
    content.append(profiles.section);
  if (bank && !host.npcBank.length)
    profiles.body.append(el("p", "lp-copy", "Save an NPC contact to reuse their profile in other chats."));
  if (bank)
    for (const entry of host.npcBank) {
      const row = el("div", "lp-card lp-bank-profile");
      row.append(identityBlock({ name: entry.name, meta: entry.role, description: entry.identityBrief }));
      const actions = actionGroup();
      const edit = button("Edit saved profile", "lp-button lp-button-quiet");
      edit.addEventListener("click", () => host.select(entry.id, "bank-entry"));
      actions.append(edit);
      const linked = host.state.contacts.find((contact) => contact.source.kind === "npc" && contact.source.bankId === entry.id);
      const add = button(linked ? "Open local contact" : "Add to this chat");
      add.addEventListener("click", () => linked ? host.select(linked.id, "detail") : host.send("lumiphone:npc_bank_add", { bankId: entry.id }));
      actions.append(add);
      row.append(actions);
      profiles.body.append(row);
      cards.push({ node: row, name: entry.name, terms: `${entry.name} ${entry.role} ${entry.aliases.join(" ")} ${entry.tags.join(" ")}`.toLowerCase() });
    }
  content.append(noMatches);
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    const visible = applyRankedSearch(cards, query);
    noMatches.hidden = !query || visible > 0;
    for (const group of [casts, profiles])
      if (group) {
        group.section.dataset.pocketSearchResult = "true";
        group.section.hidden = Boolean(query && !cards.some((card) => group.body.contains(card.node) && !card.node.hidden));
      }
  });
  return page;
}

// src/frontend/apps/contacts.ts
function avatar(contact) {
  const node = el("div", "lp-avatar", contact.name.slice(0, 1).toUpperCase());
  node.style.setProperty("--contact-accent", contactAccent(contact));
  if (contactAvatar(contact)) {
    const image = el("img");
    image.src = contactAvatar(contact);
    image.alt = "";
    image.style.objectPosition = `${contact.avatarFocus?.x ?? 50}% ${contact.avatarFocus?.y ?? 50}%`;
    node.replaceChildren(image);
  }
  return node;
}
function draftPayload(draft) {
  return {
    name: draft.name,
    role: draft.role,
    identityBrief: draft.identityBrief,
    description: draft.identityBrief,
    phoneProfile: draft.phoneProfile,
    accent: draft.accent,
    colorMode: "pocket",
    messagingStyle: draft.messagingStyle,
    avatarOverrideUrl: draft.avatarUrl || "",
    avatarSource: draft.avatarSource,
    avatarFocus: draft.avatarFocus,
    source: { kind: "npc", origin: "generated", description: draft.identityBrief },
    presence: { inScene: false, lastSceneAt: "" },
    contextPolicy: { pinned: false },
    generationPolicy: { relevant: true },
    messagingPolicy: { remoteEligible: true, allowAmbientInScene: false, lastInitiatedMessageAt: "", lastInitiatedRoleplayAt: "" }
  };
}
function contactEditor(host, contact, draft = null) {
  let saveContact = () => {};
  const { page, content } = host.page(contact ? "Contact Settings" : draft ? "Edit Draft" : "New Contact", contact?.source.kind || (draft ? "Generated preview · unsaved" : "Pocket NPC"), { label: "Save", callback: () => saveContact() });
  const name = el("input", "lp-input");
  name.placeholder = "Name";
  name.value = contact?.name || draft?.name || "";
  const role = el("input", "lp-input");
  role.placeholder = "Role";
  role.value = contact?.role || draft?.role || "";
  const description = el("textarea", "lp-textarea");
  description.placeholder = "Compact profile — stable identity, role, relationship";
  description.maxLength = 500;
  description.value = contact?.identityBrief || contact?.description || draft?.identityBrief || "";
  const phoneProfile = contact?.phoneProfile || draft?.phoneProfile || { personality: "", appearance: "", textingStyle: "" };
  const personality = el("textarea", "lp-textarea");
  personality.placeholder = "Personality — stable traits that shape conversation";
  personality.maxLength = 600;
  personality.value = phoneProfile.personality;
  const appearance = el("textarea", "lp-textarea");
  appearance.placeholder = "Minimal appearance — only a few recognizable details";
  appearance.maxLength = 360;
  appearance.value = phoneProfile.appearance;
  const textingStyle = el("textarea", "lp-textarea");
  textingStyle.placeholder = "Texting quirks — casing, punctuation, slang/register, emoji/kaomoji habits, fragmentation…";
  textingStyle.maxLength = 600;
  textingStyle.value = phoneProfile.textingStyle;
  const sceneNote = el("textarea", "lp-textarea");
  sceneNote.placeholder = "Current scene note — temporary state, objective, or reason they are here";
  sceneNote.maxLength = 600;
  sceneNote.value = contact?.sceneNote || "";
  const accent = el("input", "lp-color-input");
  accent.type = "color";
  accent.value = /^#[0-9a-f]{6}$/i.test(contact?.accent || draft?.accent || "") ? contact?.accent || draft.accent : "#8b7dff";
  const colorRow = controlRow("Contact color", accent);
  const colorMode = el("select", "lp-select");
  for (const [value, label] of [["pocket", "Pocket color"], ["source", contact?.sourceAccent ? "Inherit source color" : "Inherit source color (unavailable)"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = (contact?.colorMode || "pocket") === value;
    option.disabled = value === "source" && !contact?.sourceAccent;
    colorMode.appendChild(option);
  }
  const colorModeLabel = fieldBlock("Color source", colorMode);
  const relationship = el("select", "lp-select");
  for (const [value, label] of [["background", "Background / plot actor"], ["close", "Close to this character"]]) {
    const option = el("option", "", label);
    option.value = value;
    option.selected = (contact?.relationship || "background") === value;
    relationship.appendChild(option);
  }
  const relationshipLabel = fieldBlock("Relationship importance", relationship);
  const inScene = el("input");
  inScene.type = "checkbox";
  inScene.checked = contact?.presence.inScene || false;
  const sceneRow = controlRow("Here in current scene", inScene);
  const pinned = el("input");
  pinned.type = "checkbox";
  pinned.checked = contact?.contextPolicy.pinned || false;
  const pinRow = controlRow("Pin compact brief to model context", pinned);
  const relevant = el("input");
  relevant.type = "checkbox";
  relevant.checked = contact?.generationPolicy.relevant ?? true;
  const relevantRow = controlRow("Relevant to Pocket generation", relevant);
  const remote = el("input");
  remote.type = "checkbox";
  remote.checked = contact?.messagingPolicy.remoteEligible ?? true;
  const remoteRow = controlRow("Eligible for remote messages", remote);
  const ambientHere = el("input");
  ambientHere.type = "checkbox";
  ambientHere.checked = contact?.messagingPolicy.allowAmbientInScene || false;
  const ambientHereRow = controlRow("Allow ambient texts while in scene", ambientHere);
  const style = contact?.messagingStyle || draft?.messagingStyle || { talkativeness: 50, fragmentation: 35 };
  const talkativeness = el("input");
  talkativeness.type = "range";
  talkativeness.min = "0";
  talkativeness.max = "100";
  talkativeness.value = String(style.talkativeness);
  const talkValue = el("span", "lp-copy", `${talkativeness.value}%`);
  talkativeness.addEventListener("input", () => {
    talkValue.textContent = `${talkativeness.value}%`;
  });
  const talkHead = el("span", "lp-row-between");
  talkHead.append(el("strong", "", "Talkativeness"), talkValue);
  const talkEnds = el("span", "lp-range-ends");
  talkEnds.append(el("span", "", "Quiet"), el("span", "", "Chatty"));
  const talkRow = el("label", "lp-style-control");
  talkRow.append(talkHead, talkativeness, talkEnds);
  const fragmentation = el("input");
  fragmentation.type = "range";
  fragmentation.min = "0";
  fragmentation.max = "100";
  fragmentation.value = String(style.fragmentation);
  const fragmentValue = el("span", "lp-copy", `${fragmentation.value}%`);
  fragmentation.addEventListener("input", () => {
    fragmentValue.textContent = `${fragmentation.value}%`;
  });
  const fragmentHead = el("span", "lp-row-between");
  fragmentHead.append(el("strong", "", "Texting style"), fragmentValue);
  const fragmentEnds = el("span", "lp-range-ends");
  fragmentEnds.append(el("span", "", "Compact"), el("span", "", "Bursty"));
  const fragmentRow = el("label", "lp-style-control");
  fragmentRow.append(fragmentHead, fragmentation, fragmentEnds);
  let photoCard = null;
  if (contact) {
    const { section, body } = sectionBlock("Contact photo", contact.sourceAvatarUrl ? "Uses the linked source image unless you choose a Pocket override." : "Choose any Pocket/Lumiverse gallery image as a local override.", "lp-card lp-contact-photo-editor");
    const actions = actionGroup();
    const choosePhoto = button("Choose from Gallery", "lp-button lp-button-quiet");
    choosePhoto.addEventListener("click", () => host.choosePhoto(contact.id));
    actions.appendChild(choosePhoto);
    const uploadPhoto = button("Upload avatar", "lp-button lp-button-quiet");
    uploadPhoto.disabled = !host.capabilities?.images;
    uploadPhoto.addEventListener("click", () => host.uploadPhoto(contact.id));
    actions.append(uploadPhoto);
    const generatePhoto = button("Quick Generate", "lp-button");
    generatePhoto.addEventListener("click", () => host.generatePhoto(contact.id));
    actions.appendChild(generatePhoto);
    if (contact.sourceAvatarUrl && contact.avatarOverrideUrl) {
      const sourcePhoto = button("Use linked image", "lp-button lp-button-quiet");
      sourcePhoto.addEventListener("click", () => host.useSourcePhoto(contact.id));
      actions.appendChild(sourcePhoto);
    }
    body.append(avatar(contact), actions);
    photoCard = section;
  }
  saveContact = () => {
    if (!name.value.trim()) {
      host.showError("A contact needs a name.");
      return;
    }
    host.send("lumiphone:save_contact", { contact: {
      id: contact?.id,
      name: name.value.trim(),
      role: role.value.trim(),
      identityBrief: description.value.trim(),
      description: description.value.trim(),
      phoneProfile: {
        personality: personality.value.trim(),
        appearance: appearance.value.trim(),
        textingStyle: textingStyle.value.trim()
      },
      sceneNote: sceneNote.value.trim(),
      accent: accent.value,
      colorMode: colorMode.value,
      relationship: relationship.value,
      presence: { inScene: inScene.checked, lastSceneAt: inScene.checked ? new Date().toISOString() : contact?.presence.lastSceneAt || "" },
      contextPolicy: { pinned: pinned.checked },
      generationPolicy: { relevant: relevant.checked },
      messagingPolicy: {
        remoteEligible: remote.checked,
        allowAmbientInScene: ambientHere.checked,
        lastInitiatedMessageAt: contact?.messagingPolicy.lastInitiatedMessageAt || "",
        lastInitiatedRoleplayAt: contact?.messagingPolicy.lastInitiatedRoleplayAt || ""
      },
      messagingStyle: { talkativeness: Number(talkativeness.value), fragmentation: Number(fragmentation.value) },
      ...draft ? { avatarOverrideUrl: draft.avatarUrl || "", avatarSource: draft.avatarSource, avatarFocus: draft.avatarFocus } : {},
      source: contact?.source || (draft ? { kind: "npc", origin: "generated", description: description.value.trim() } : { kind: "npc", origin: "manual", description: description.value.trim() })
    } });
  };
  if (photoCard)
    content.appendChild(photoCard);
  content.append(fieldBlock("Name", name), fieldBlock("Role", role), fieldBlock("Compact profile", description, "Stable identity, role, and relationship summary."), fieldBlock("Personality", personality, "Stable social and temperamental traits that shape conversation."), fieldBlock("Minimal appearance", appearance, "Only recognizable details worth occasional reference in texts."), fieldBlock("Texting quirks", textingStyle, "Casing, punctuation, slang/register, dialect when established, emoji or kaomoji habits, abbreviations, and message rhythm."), fieldBlock("Current scene note", sceneNote, "Temporary state, objective, or reason they are here."), colorRow, colorModeLabel, relationshipLabel, talkRow, fragmentRow, sceneRow, pinRow, relevantRow, remoteRow, ambientHereRow);
  if (contact) {
    if (contact.source.kind === "character")
      content.append(identityProfileControls(host.identityProfiles || [], "character", contact.id, host.send, () => ({ name: name.value, role: role.value, identityBrief: description.value, phoneProfile: { personality: personality.value, appearance: appearance.value, textingStyle: textingStyle.value } })));
    if (contact.avatarOverrideUrl && contact.sourceAvatarUrl) {
      const sourcePhoto = button("Use source photo", "lp-button lp-button-quiet");
      sourcePhoto.addEventListener("click", () => host.send("lumiphone:set_contact_photo", { contactId: contact.id, useSource: true }));
      content.appendChild(sourcePhoto);
    }
    const remove = button("Delete contact", "lp-button lp-button-danger");
    remove.addEventListener("click", () => {
      host.send("lumiphone:delete", { kind: "contact", id: contact.id });
      host.select("", "list");
    });
    content.appendChild(remove);
  }
  return page;
}
function importView(host) {
  const { page, content } = host.page("Add Contact", "Character, Council, or Pocket NPC");
  const search = el("input", "lp-input");
  search.type = "search";
  search.placeholder = "Search saved or importable contacts";
  search.setAttribute("aria-label", "Search contacts to add");
  const searchableRows = [];
  const searchableSections = [];
  const noMatches = el("p", "lp-copy", "No matching saved or importable contacts.");
  noMatches.dataset.contactSearchEmpty = "true";
  noMatches.hidden = true;
  content.appendChild(search);
  const { section: manual, body: manualBody } = sectionBlock("Pocket NPC", "Generate a compact NPC seed or create one manually.", "lp-card lp-contact-import");
  const description = el("textarea", "lp-textarea");
  description.placeholder = "Describe someone; Pocket will generate one compact contact profile.";
  description.maxLength = 2000;
  description.value = host.generationBrief;
  description.addEventListener("input", () => host.updateGenerationBrief(description.value));
  const npcOperation = [...host.operations.values()].find((entry) => entry.task === "npc-contact" && entry.phase !== "complete" && entry.phase !== "error");
  const generate = button(npcOperation ? "Generating…" : "Generate NPC");
  generate.disabled = !host.capabilities?.generation || Boolean(npcOperation);
  generate.addEventListener("click", () => {
    host.select("", "quick-gen");
  });
  const primitive = button("Create manually", "lp-button lp-button-quiet");
  primitive.addEventListener("click", () => host.select("", "new"));
  manualBody.append(description, generate, primitive);
  if (host.npcDraft) {
    const draft = host.npcDraft;
    const preview = el("section", "lp-card lp-npc-draft");
    const previewHead = el("div", "lp-row-between");
    previewHead.append(el("span", "lp-eyebrow", "Unsaved preview"), statusBadge(`${draft.messagingStyle.talkativeness}% talkative · ${draft.messagingStyle.fragmentation}% bursty`));
    preview.append(previewHead, identityBlock({ name: draft.name, meta: draft.role, description: draft.identityBrief }));
    const actions = actionGroup("lp-draft-actions");
    const retry = button("Retry", "lp-button lp-button-quiet");
    retry.disabled = Boolean(npcOperation);
    retry.addEventListener("click", () => host.send("lumiphone:generate_contact", { description: draft.sourceDescription }));
    const edit = button("Edit", "lp-button lp-button-quiet");
    edit.addEventListener("click", () => host.select("", "draft"));
    const use = button("Use", "lp-button lp-button-primary");
    use.addEventListener("click", () => host.send("lumiphone:save_contact", { contact: draftPayload(draft) }));
    actions.append(retry, edit, use);
    if (host.previousNpcDraft) {
      const previous = button("Undo reroll", "lp-button lp-button-quiet");
      previous.addEventListener("click", () => host.restorePreviousNpcDraft());
      actions.prepend(previous);
    }
    preview.appendChild(actions);
    manualBody.appendChild(preview);
  }
  if (npcOperation) {
    const progress = el("div", "lp-operation-progress");
    progress.dataset.operationRequest = npcOperation.requestId;
    progress.dataset.phase = npcOperation.phase;
    progress.setAttribute("role", "status");
    const message = el("strong", "", npcOperation.message || "Generating contact…");
    message.dataset.operationMessage = "true";
    progress.append(el("span", "lp-indeterminate"), message);
    manualBody.appendChild(progress);
  }
  content.appendChild(manual);
  const { section: bank, body: bankBody } = sectionBlock("NPC Bank", "Reusable identity seeds across roleplays. Scene state, relationships, and message history always stay local to each RP.", "lp-contact-source-section");
  const bankRows = [];
  if (!host.npcBank.length) {
    bankBody.appendChild(el("div", "lp-card lp-copy", "No saved NPCs yet. Open any Pocket NPC contact and choose “Save to NPC Bank”."));
  } else {
    for (const entry of [...host.npcBank].sort((a, b) => a.name.localeCompare(b.name))) {
      const row = el("div", "lp-card");
      row.style.display = "grid";
      row.style.gap = "10px";
      row.style.minWidth = "0";
      const identity = identityBlock({ name: entry.name, meta: entry.role || "Pocket NPC" });
      const linked = host.state.contacts.find((contact) => contact.source.kind === "npc" && contact.source.bankId === entry.id);
      const actions = actionGroup();
      actions.style.display = "grid";
      actions.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
      actions.style.width = "100%";
      actions.style.minWidth = "0";
      const edit = button("Edit", "lp-button lp-button-quiet");
      edit.addEventListener("click", () => {
        host.select(entry.id, "bank-entry");
      });
      const add = button(linked ? "Added" : "Add", "lp-button lp-button-quiet");
      add.disabled = Boolean(linked);
      add.addEventListener("click", () => {
        if (!linked)
          host.send("lumiphone:npc_bank_add", { bankId: entry.id });
      });
      const forget = button("Forget", "lp-button lp-button-danger");
      forget.addEventListener("click", () => {
        if (window.confirm(`Forget ${entry.name} from NPC Bank? Existing contacts and messages in roleplays will not be deleted.`)) {
          host.send("lumiphone:npc_bank_delete", { bankId: entry.id });
        }
      });
      for (const action of [edit, add, forget]) {
        action.style.width = "100%";
        action.style.minWidth = "0";
      }
      actions.append(edit, add, forget);
      row.append(identity, actions);
      bankBody.appendChild(row);
      bankRows.push(row);
      searchableRows.push({ node: row, name: entry.name, terms: `${entry.name} ${entry.role || "Pocket NPC"} ${entry.aliases.join(" ")} ${entry.tags.join(" ")} npc bank`.toLocaleLowerCase() });
    }
  }
  content.appendChild(bank);
  searchableSections.push({ section: bank, rows: bankRows });
  const grouped = new Map;
  for (const option of host.sources)
    grouped.set(option.kind, [...grouped.get(option.kind) || [], option]);
  for (const [kind, sources] of grouped) {
    const { section, body } = sectionBlock(kind === "character" ? "Lumiverse Characters" : "Active Council", "", "lp-contact-source-section");
    const sourceRows = [];
    for (const source of sources) {
      const row = el("div", "lp-card lp-list-row");
      const identity = identityBlock({ name: source.name, meta: source.role });
      let trailing;
      if (source.importedContactId)
        trailing = statusBadge("Imported");
      else {
        const add = button("Add", "lp-button lp-button-quiet");
        add.addEventListener("click", () => host.send("lumiphone:import_contact", { kind: source.kind, sourceId: source.sourceId, itemId: source.itemId }));
        trailing = add;
      }
      row.append(identity, trailing);
      body.appendChild(row);
      sourceRows.push(row);
      searchableRows.push({ node: row, name: source.name, terms: `${source.name} ${source.role} ${kind}`.toLocaleLowerCase() });
    }
    content.appendChild(section);
    searchableSections.push({ section, rows: sourceRows });
  }
  if (!host.sources.length)
    content.appendChild(el("p", "lp-copy", "No importable Characters or active Council members were returned. Manual NPC contacts remain available."));
  const applySearch = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = applyRankedSearch(searchableRows, query);
    for (const entry of searchableSections) {
      entry.section.dataset.pocketSearchResult = "true";
      entry.section.hidden = Boolean(query && !entry.rows.some((row) => !row.hidden));
    }
    noMatches.hidden = !query || visible > 0;
  };
  search.addEventListener("input", applySearch);
  content.appendChild(noMatches);
  return page;
}
function quickGenerateView(host) {
  const active = [...host.operations.values()].find((entry) => entry.task === "npc-contact" && entry.phase !== "complete" && entry.phase !== "error");
  const { page, content } = host.page("Quick Generate", "NPC profiles");
  page.classList.add("lp-npc-camera");
  const finder = el("div", "lp-npc-viewfinder");
  const mode = el("div", "lp-camera-mode", "ϟ AUTO");
  mode.append(el("span", "", "POCKET"), el("span", "", "PROFILE"));
  const focus = el("div", "lp-focus-frame");
  const draft = host.npcDraft;
  const mark = el("div", "lp-npc-camera-mark", draft ? draft.name.slice(0, 1).toUpperCase() : "+");
  focus.append(mark);
  const copy = el("div", "lp-npc-camera-copy");
  copy.append(el("strong", "", active ? "Developing profile…" : draft?.name || "Frame a new character"), el("p", "", active?.message || draft?.identityBrief || "Describe an NPC, then tap the shutter."));
  const subject = el("div", "lp-camera-subject");
  subject.append(focus, copy);
  finder.append(subject);
  const brief = el("textarea", "lp-textarea");
  brief.placeholder = "A sleepy florist with a sharp wit and a soft spot for stray cats…";
  brief.maxLength = 2000;
  brief.rows = 3;
  brief.value = host.generationBrief;
  brief.addEventListener("input", () => host.updateGenerationBrief(brief.value));
  const floating = fieldBlock("Character brief", brief);
  floating.classList.add("lp-camera-floating-brief");
  finder.append(floating);
  const footer = el("div", "lp-camera-bottom-strip");
  const caption = el("p", "lp-camera-caption", draft ? "PREVIEW · UNSAVED" : "PROFILE");
  const controls = el("div", "lp-quick-controls");
  const manual = button("Manual", "lp-nav-action");
  manual.addEventListener("click", () => host.select("", "new"));
  const shutter = button("", "lp-shutter");
  shutter.setAttribute("aria-label", draft ? "Generate another NPC" : "Generate NPC");
  shutter.disabled = Boolean(active) || !host.capabilities?.generation;
  shutter.addEventListener("click", () => {
    if (!brief.value.trim()) {
      brief.focus();
      host.showError("Describe someone first.");
      return;
    }
    shutter.disabled = true;
    host.send("lumiphone:generate_contact", { description: brief.value.trim() });
  });
  const edit = button("Edit", "lp-nav-action");
  edit.disabled = !draft || Boolean(active);
  edit.addEventListener("click", () => host.select("", "draft"));
  controls.append(manual, shutter, edit);
  footer.append(caption, controls);
  content.append(mode, finder, footer);
  if (draft) {
    const actions = actionGroup("lp-draft-actions");
    const use = button(`Use ${draft.name}`, "lp-button lp-button-primary");
    use.disabled = Boolean(active);
    use.addEventListener("click", () => {
      use.disabled = true;
      host.send("lumiphone:save_contact", { contact: draftPayload(draft) });
    });
    actions.append(use);
    const portraits = el("div", "lp-npc-portrait-actions");
    portraits.setAttribute("role", "group");
    portraits.setAttribute("aria-label", "NPC portrait source");
    const gallery = button("Gallery", "lp-button lp-button-quiet");
    gallery.disabled = !host.capabilities?.images;
    gallery.addEventListener("click", () => host.choosePhoto());
    const upload = button("Upload avatar", "lp-button lp-button-quiet");
    upload.disabled = !host.capabilities?.images;
    upload.addEventListener("click", () => host.uploadPhoto());
    const photo = button(draft.avatarUrl ? "Retake portrait" : "Generate portrait", "lp-button lp-button-quiet");
    photo.disabled = !host.capabilities?.imageGen;
    photo.addEventListener("click", () => host.generateDraftPhoto());
    portraits.append(gallery, upload, photo);
    footer.append(portraits);
    if (draft.avatarUrl) {
      const image = el("img", "lp-draft-portrait");
      image.src = draft.avatarUrl;
      image.alt = `${draft.name} portrait`;
      finder.prepend(image);
    }
    if (host.previousNpcDraft) {
      const undo = button("Previous", "lp-button lp-button-quiet");
      undo.addEventListener("click", () => host.restorePreviousNpcDraft());
      actions.append(undo);
    }
    footer.append(actions);
  }
  if (!host.capabilities?.generation)
    footer.append(el("p", "lp-warning", "Enable text generation in Settings to generate an NPC."));
  return page;
}
function renderContactsView(host) {
  if (["groups", "group-config", "bank", "cast-config", "cast-import", "bank-entry"].includes(host.selectedView))
    return renderContactGroups(host);
  if (host.selectedView === "quick-gen")
    return quickGenerateView(host);
  const contact = host.state.contacts.find((entry) => entry.id === host.selectedContactId) || null;
  if (host.selectedView === "import") {
    host.requestSources();
    return importView(host);
  }
  if (host.selectedView === "draft" && host.npcDraft)
    return contactEditor(host, null, host.npcDraft);
  if (host.selectedView === "new")
    return contactEditor(host, null);
  if (contact && host.selectedView === "config")
    return contactEditor(host, contact);
  if (contact && host.selectedView === "detail") {
    const { page, content } = host.page(contact.name, contact.role, { label: "Edit", callback: () => host.select(contact.id, "config") });
    const hero = el("div", "lp-card lp-contact-detail");
    hero.append(avatar(contact), identityBlock({ name: contact.name, description: contact.identityBrief || contact.description || "No compact identity brief.", prominent: true, centered: true }));
    if (contact.sceneNote)
      hero.append(el("p", "lp-scene-note", contact.sceneNote));
    const phoneProfile = contact.phoneProfile;
    if (phoneProfile && (phoneProfile.personality || phoneProfile.appearance || phoneProfile.textingStyle)) {
      const profileCard = el("div", "lp-card lp-contact-phone-profile");
      profileCard.appendChild(el("div", "lp-eyebrow", "Phone profile"));
      if (phoneProfile.personality)
        profileCard.appendChild(el("p", "lp-copy", `Personality: ${phoneProfile.personality}`));
      if (phoneProfile.appearance)
        profileCard.appendChild(el("p", "lp-copy", `Appearance: ${phoneProfile.appearance}`));
      if (phoneProfile.textingStyle)
        profileCard.appendChild(el("p", "lp-copy", `Texting: ${phoneProfile.textingStyle}`));
      content.appendChild(disclosure("Phone voice & appearance", profileCard));
    }
    const source = contact.source.kind === "character" ? "Linked Character" : contact.source.kind === "council" ? "Linked Council member" : `Pocket NPC · ${contact.source.origin}`;
    hero.append(el("span", "lp-eyebrow", `${source} · ${contact.relationship === "close" ? "Close connection" : "Background actor"}`));
    const presence = el("div", "lp-card");
    presence.append(el("div", "lp-title", contact.presence.inScene ? "Here now" : "Not in current scene"), el("p", "lp-copy", `${contact.contextPolicy.pinned ? "Pinned to model context" : "Included only while in scene"}${contact.presence.lastSceneAt ? ` · last scene ${formatDate(contact.presence.lastSceneAt)}` : ""}`), el("p", "lp-copy", `${contact.generationPolicy.relevant ? "Generation-relevant" : "Excluded from Pocket generation"} · ${contact.messagingPolicy.remoteEligible ? "Remote-message eligible" : "No remote messages"}${contact.messagingPolicy.allowAmbientInScene ? " · ambient override while here" : ""}`));
    const presenceControls = el("div", "lp-row");
    presenceControls.setAttribute("role", "group");
    presenceControls.setAttribute("aria-label", "Current scene presence");
    for (const [label, inScene] of [["Here", true], ["Away", false]]) {
      const choice = button(label, "lp-button lp-button-quiet");
      choice.setAttribute("aria-pressed", String(contact.presence.inScene === inScene));
      choice.disabled = contact.presence.inScene === inScene;
      choice.addEventListener("click", () => host.send("lumiphone:set_presence", { contactId: contact.id, inScene }));
      presenceControls.appendChild(choice);
    }
    presence.append(presenceControls, el("p", "lp-copy", "Correct their location now. Later story updates can change it."));
    const message = button("Message");
    message.addEventListener("click", () => host.openDirect(contact.id));
    content.prepend(hero);
    content.append(presence);
    if (contact.source.kind === "npc") {
      const bankId = contact.source.bankId;
      const bankEntry = bankId ? host.npcBank.find((entry) => entry.id === bankId) || null : null;
      const { section: bankCard, body: bankBody } = sectionBlock(bankEntry ? "Saved to NPC Bank" : contact.source.bankId ? "NPC Bank copy missing" : "Reusable NPC", "Stable identity and texting style saved separately from this story.", "lp-card");
      const saveBank = button(bankEntry ? "Update NPC Bank" : contact.source.bankId ? "Restore NPC Bank" : "Save to NPC Bank", "lp-button lp-button-quiet");
      saveBank.addEventListener("click", () => host.send("lumiphone:npc_bank_save", { contactId: contact.id }));
      bankBody.appendChild(saveBank);
      content.appendChild(bankCard);
    }
    if (contact.source.kind !== "npc" || contact.source.origin === "discovered") {
      const profileOperation = [...host.operations.values()].find((entry) => entry.task === "profile-refresh" && entry.phase !== "complete" && entry.phase !== "error");
      const refresh = button(profileOperation ? contact.source.kind === "npc" ? "Describing…" : "Refreshing…" : contact.source.kind === "npc" ? "Describe from RP ✦" : "Refresh compact profile ✦", "lp-button lp-button-quiet");
      refresh.disabled = !host.capabilities?.generation || Boolean(profileOperation);
      refresh.addEventListener("click", () => host.send("lumiphone:refresh_contact_profile", { contactId: contact.id }));
      content.appendChild(refresh);
      if (profileOperation) {
        const progress = el("div", "lp-operation-progress");
        progress.dataset.operationRequest = profileOperation.requestId;
        progress.dataset.phase = profileOperation.phase;
        progress.setAttribute("role", "status");
        const progressMessage = el("strong", "", profileOperation.message);
        progressMessage.dataset.operationMessage = "true";
        progress.append(el("span", "lp-indeterminate"), progressMessage);
        content.appendChild(progress);
      }
    }
    content.append(message);
    return page;
  }
  const { page, content } = host.page("Contacts", `${host.state.contacts.length} people`, { label: "Add", callback: () => host.select("", "import") });
  const search = el("input", "lp-input");
  search.type = "search";
  search.placeholder = "Search contacts";
  const toolbar = el("div", "lp-contact-toolbar");
  const filters = el("div", "lp-chipbar lp-contact-filters");
  filters.setAttribute("aria-label", "Filter contacts");
  const library = el("div", "lp-contact-library");
  library.setAttribute("role", "group");
  library.setAttribute("aria-label", "Contact library");
  library.append(el("span", "lp-contact-library-label", "Library"));
  const all = button("All", "lp-chip");
  const here = button("Here", "lp-chip");
  const recent = button("Recent", "lp-chip");
  all.setAttribute("aria-pressed", "true");
  filters.append(all, here, recent);
  const groups = button("Groups", "lp-contact-library-action");
  groups.title = "Contact groups for this roleplay";
  groups.setAttribute("aria-description", groups.title);
  groups.addEventListener("click", () => host.selectGroup("", "groups"));
  const bank = button("NPC Bank", "lp-contact-library-action");
  bank.title = "Reusable NPC profiles and casts across chats";
  bank.setAttribute("aria-description", bank.title);
  const bankIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  bankIcon.setAttribute("viewBox", "0 0 24 24");
  bankIcon.setAttribute("width", "12");
  bankIcon.setAttribute("height", "12");
  bankIcon.setAttribute("aria-hidden", "true");
  bankIcon.setAttribute("focusable", "false");
  const bankPath = document.createElementNS(bankIcon.namespaceURI, "path");
  bankPath.setAttribute("d", "M4 8h16v12H4zM3 4h18v4H3zM9 12h6");
  bankPath.setAttribute("fill", "none");
  bankPath.setAttribute("stroke", "currentColor");
  bankPath.setAttribute("stroke-width", "1.5");
  bankPath.setAttribute("stroke-linejoin", "round");
  bankIcon.append(bankPath);
  bank.prepend(bankIcon);
  bank.addEventListener("click", () => host.selectGroup("", "bank"));
  library.append(groups, bank);
  toolbar.append(filters, library);
  const sync = button("Sync current scene", "lp-button lp-button-quiet");
  const sceneOperation = [...host.operations.values()].find((entry) => entry.task === "scene-sync" && entry.phase !== "complete" && entry.phase !== "error");
  sync.disabled = !host.capabilities?.generation || !host.capabilities?.sceneSync || Boolean(sceneOperation);
  sync.addEventListener("click", () => host.send("lumiphone:sync_scene_contacts"));
  const snapshot = host.state.sceneSnapshot;
  const snapshotStatus = el("p", snapshot?.stale ? "lp-warning" : "lp-copy", !snapshot ? "Refresh to see who is in the scene." : `${snapshot.stale ? "Scene snapshot is stale" : "Scene snapshot is current"} · ${snapshot.actors.length} actor${snapshot.actors.length === 1 ? "" : "s"} · source turn ${snapshot.sourceMessageIndex}`);
  const list = el("div", "lp-contact-list");
  const renderList = (filter = "all") => {
    list.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase();
    const contacts = host.state.contacts.filter((entry) => {
      if (query && !`${entry.name} ${entry.role}`.toLocaleLowerCase().includes(query))
        return false;
      if (filter === "here")
        return entry.presence.inScene;
      if (filter === "recent")
        return Boolean(entry.presence.lastSceneAt);
      return true;
    }).sort((a, b) => Number(b.presence.inScene) - Number(a.presence.inScene) || Date.parse(b.presence.lastSceneAt || "0") - Date.parse(a.presence.lastSceneAt || "0"));
    for (const entry of contacts) {
      const row = button("", "lp-card lp-contact-row");
      const identity = identityBlock({ name: entry.name, meta: entry.role, className: "lp-grow" });
      const status = el("span", entry.presence.inScene ? "lp-contact-presence-label" : "lp-contact-presence-label lp-contact-presence-away", entry.presence.inScene ? "Here" : "Away");
      row.append(avatar(entry), identity, status);
      row.addEventListener("click", () => host.select(entry.id, "detail"));
      list.appendChild(row);
    }
    if (!contacts.length)
      list.appendChild(host.empty("No matching contacts", "Try another search or sync the current scene."));
  };
  let active = "all";
  const useFilter = (next) => {
    active = next;
    for (const chip of [all, here, recent])
      chip.setAttribute("aria-pressed", String(chip === { all, here, recent }[next]));
    renderList(active);
  };
  all.addEventListener("click", () => useFilter("all"));
  here.addEventListener("click", () => useFilter("here"));
  recent.addEventListener("click", () => useFilter("recent"));
  search.addEventListener("input", () => renderList(active));
  renderList();
  content.append(search, toolbar, sync, snapshotStatus);
  if (sceneOperation) {
    const progress = el("div", "lp-operation-progress");
    progress.dataset.operationRequest = sceneOperation.requestId;
    progress.dataset.phase = sceneOperation.phase;
    progress.setAttribute("role", "status");
    const message = el("strong", "", sceneOperation.message || "Syncing scene…");
    message.dataset.operationMessage = "true";
    progress.append(el("span", "lp-indeterminate"), message);
    content.appendChild(progress);
  }
  content.appendChild(list);
  return page;
}

// src/domain/app-review.ts
function storyDate(now, offset = 0) {
  const stamp = Date.parse(now);
  return Number.isFinite(stamp) ? new Date(stamp - offset * 60000).toISOString().slice(0, 10) : "";
}
function normalizeWeatherOutlook(value) {
  const raw = value;
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw.startDate || "") || !Number.isFinite(Date.parse(raw.startDate)))
    return;
  const clean = (text, max) => typeof text === "string" ? text.trim().slice(0, max) : "";
  const days = (Array.isArray(raw.days) ? raw.days : []).slice(0, 7).flatMap((day, i) => {
    if (!day || !Number.isFinite(day.high) || !Number.isFinite(day.low) || !clean(day.condition, 80) || day.low > day.high)
      return [];
    return [{ date: new Date(Date.parse(raw.startDate) + i * 86400000).toISOString().slice(0, 10), condition: clean(day.condition, 80), high: Math.max(-150, Math.min(200, day.high)), low: Math.max(-150, Math.min(200, day.low)), details: clean(day.details, 240) }];
  });
  if (days.length !== 7)
    return;
  return { startDate: raw.startDate, location: clean(raw.location, 160), unit: raw.unit === "F" ? "F" : "C", generatedAt: clean(raw.generatedAt, 80), days };
}
function usableWeatherOutlook(weather, now, offset = 0) {
  const outlook = normalizeWeatherOutlook(weather.outlook);
  return outlook?.startDate === storyDate(now, offset) && outlook.location === weather.location && outlook.unit === weather.unit ? outlook : undefined;
}

// src/frontend/components/weather-outlook.ts
function weatherConditionKind(condition) {
  if (/storm|thunder|lightning/i.test(condition))
    return "storm";
  if (/snow|sleet|blizzard|flurr/i.test(condition))
    return "snow";
  if (/rain|shower|drizzle/i.test(condition))
    return "rain";
  if (/fog|mist|haze|smoke/i.test(condition))
    return "fog";
  if (/wind|breez|gust/i.test(condition))
    return "wind";
  if (/partly|mostly\s+sunny|sun.*cloud|cloud.*sun/i.test(condition))
    return "partly";
  if (/cloud|overcast/i.test(condition))
    return "cloud";
  return "clear";
}
function glyphMarkup(kind) {
  if (kind === "storm")
    return '<path class="lp-weather-soft" d="M14 35c-4.8 0-8.6-3.5-8.6-8 0-4.1 3.3-7.5 7.5-7.9C14.5 12.8 20 8 26.8 8c7.5 0 13.7 5.7 14.5 13 5.8.5 10.3 5.2 10.3 10.9 0 6.1-5 11.1-11.1 11.1H14Z"/><path d="M14 35c-4.8 0-8.6-3.5-8.6-8 0-4.1 3.3-7.5 7.5-7.9C14.5 12.8 20 8 26.8 8c7.5 0 13.7 5.7 14.5 13 5.8.5 10.3 5.2 10.3 10.9 0 6.1-5 11.1-11.1 11.1H14Z"/><path class="lp-weather-bolt" d="m30 39-7 12h7l-3 8 13-16h-8l3-4Z"/><path d="M13 49l-2 6m31-6-2 6"/>';
  if (kind === "snow")
    return '<path class="lp-weather-soft" d="M15 34c-4.8 0-8.7-3.5-8.7-8 0-4.2 3.3-7.6 7.6-8C15.4 11.9 21 7.4 27.6 7.4c7.3 0 13.3 5.4 14.3 12.4 5.3.8 9.4 5.2 9.4 10.6 0 5.9-4.8 10.7-10.7 10.7H15Z"/><path d="M15 34c-4.8 0-8.7-3.5-8.7-8 0-4.2 3.3-7.6 7.6-8C15.4 11.9 21 7.4 27.6 7.4c7.3 0 13.3 5.4 14.3 12.4 5.3.8 9.4 5.2 9.4 10.6 0 5.9-4.8 10.7-10.7 10.7H15Z"/><path d="M18 47v10m-4-8 8 6m0-6-8 6m24-8v10m-4-8 8 6m0-6-8 6"/>';
  if (kind === "rain")
    return '<path class="lp-weather-soft" d="M14 36c-4.8 0-8.6-3.5-8.6-8 0-4.2 3.3-7.6 7.6-8C14.5 13.7 20 9 26.8 9c7.5 0 13.7 5.7 14.5 13 5.8.5 10.3 5.2 10.3 10.9 0 6.1-5 11.1-11.1 11.1H14Z"/><path d="M14 36c-4.8 0-8.6-3.5-8.6-8 0-4.2 3.3-7.6 7.6-8C14.5 13.7 20 9 26.8 9c7.5 0 13.7 5.7 14.5 13 5.8.5 10.3 5.2 10.3 10.9 0 6.1-5 11.1-11.1 11.1H14Z"/><path d="m15 49-2 7m14-7-2 7m15-7-2 7"/>';
  if (kind === "fog")
    return '<path class="lp-weather-soft" d="M16 31c-4.4 0-8-3.2-8-7.3 0-3.8 3-6.9 7-7.3C16.4 10.9 21.3 7 27.2 7c6.8 0 12.5 5 13.5 11.6 5 .7 8.8 4.8 8.8 9.9 0 .9-.1 1.7-.3 2.5H16Z"/><path d="M16 31c-4.4 0-8-3.2-8-7.3 0-3.8 3-6.9 7-7.3C16.4 10.9 21.3 7 27.2 7c6.8 0 12.5 5 13.5 11.6 5 .7 8.8 4.8 8.8 9.9 0 .9-.1 1.7-.3 2.5H16ZM10 39h42M15 47h34M21 55h24"/>';
  if (kind === "wind")
    return '<path class="lp-weather-soft" d="M13 17h25c5.4 0 8.6-7.1 4.3-10.5"/><path d="M8 18h30c5.4 0 8.6-7.1 4.3-10.5M5 30h42c6.5 0 9.8 8.3 4.5 12.3M11 42h25c4.8 0 7.4 6 3.6 9"/>';
  if (kind === "partly")
    return '<circle class="lp-weather-soft" cx="23" cy="21" r="12"/><circle cx="23" cy="21" r="9"/><path d="M23 5v4m0 24v4M7 21h4m24 0h4M12 10l3 3m16 16 3 3M12 32l3-3M31 13l3-3"/><path class="lp-weather-cloud-fill" d="M25 47c-4.7 0-8.5-3.4-8.5-7.7 0-4 3.1-7.3 7.3-7.7 1.5-5.7 6.5-9.9 12.6-9.9 6.8 0 12.4 5 13.2 11.4 5 .5 8.9 4.6 8.9 9.5 0 5.3-4.4 9.7-9.7 9.7H25Z"/><path d="M25 47c-4.7 0-8.5-3.4-8.5-7.7 0-4 3.1-7.3 7.3-7.7 1.5-5.7 6.5-9.9 12.6-9.9 6.8 0 12.4 5 13.2 11.4 5 .5 8.9 4.6 8.9 9.5 0 5.3-4.4 9.7-9.7 9.7H25Z"/>';
  if (kind === "cloud")
    return '<path class="lp-weather-soft" d="M14 39c-5.1 0-9.2-3.7-9.2-8.4 0-4.3 3.4-7.8 7.9-8.3C14.3 15.8 20.1 11 27.1 11c7.8 0 14.2 5.8 15.1 13.2 6 .6 10.7 5.4 10.7 11.3 0 6.3-5.2 11.5-11.5 11.5H14Z"/><path d="M14 39c-5.1 0-9.2-3.7-9.2-8.4 0-4.3 3.4-7.8 7.9-8.3C14.3 15.8 20.1 11 27.1 11c7.8 0 14.2 5.8 15.1 13.2 6 .6 10.7 5.4 10.7 11.3 0 6.3-5.2 11.5-11.5 11.5H14Z"/>';
  return '<circle class="lp-weather-soft" cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="11"/><path d="M32 5v8m0 38v8M5 32h8m38 0h8M13 13l6 6m26 26 6 6M13 51l6-6m26-26 6-6"/>';
}
function weatherGlyph(condition) {
  const kind = weatherConditionKind(condition);
  const node = el("span", "lp-weather-glyph");
  node.dataset.weatherKind = kind;
  node.setAttribute("aria-hidden", "true");
  node.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${glyphMarkup(kind)}</svg>`;
  return node;
}
function weatherOutlook(weather, now, offset = 0) {
  const panel = el("section", "lp-weather-week");
  panel.setAttribute("aria-label", "Seven-day story forecast");
  const head = el("header", "lp-weather-week-head");
  const heading = el("div", "lp-weather-week-heading");
  heading.append(el("span", "lp-eyebrow", "Story forecast"), el("h3", "lp-title", "The week ahead"));
  head.append(heading, el("span", "lp-weather-week-badge", `7 days · °${weather.unit}`));
  panel.append(head);
  const outlook = usableWeatherOutlook(weather, now, offset);
  if (!outlook) {
    const empty = el("div", "lp-weather-empty");
    empty.append(weatherGlyph(weather.condition), el("span", "", weather.outlook ? "The story date, location or unit changed. Refresh the outlook for this scene." : "Build a seven-day outlook from this scene’s weather."));
    panel.append(empty);
    return panel;
  }
  const min = Math.min(...outlook.days.map((day) => day.low)), max = Math.max(...outlook.days.map((day) => day.high)), span = Math.max(1, max - min);
  for (const [i, day] of outlook.days.entries()) {
    const row = el("div", "lp-weather-day");
    row.dataset.condition = weatherConditionKind(day.condition);
    if (i === 0)
      row.dataset.today = "true";
    const date = new Date(day.date + "T12:00:00Z");
    const dayName = el("strong", "lp-weather-day-name", i === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" }));
    const body = el("div", "lp-weather-day-copy");
    body.append(el("strong", "lp-weather-day-condition", day.condition), el("small", "lp-copy", day.details));
    const range = el("div", "lp-weather-day-range"), rail = el("span", "lp-weather-range-rail"), fill = el("span");
    range.setAttribute("aria-label", `Low ${day.low} degrees, high ${day.high} degrees`);
    fill.style.left = `${(day.low - min) / span * 100}%`;
    fill.style.width = `${Math.max(3, (day.high - day.low) / span * 100)}%`;
    rail.append(fill);
    range.append(el("span", "lp-weather-low", `${day.low}°`), rail, el("strong", "lp-weather-high", `${day.high}°`));
    row.append(dayName, weatherGlyph(day.condition), body, range);
    panel.append(row);
  }
  return panel;
}

// src/domain/notifications.ts
function activeNotifications(notifications) {
  return notifications.filter((entry) => !entry.dismissedAt);
}

// src/frontend/apps/notifications.ts
function sameDay(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}
function notificationRow(host, notification) {
  const row = el("div", "lp-card lp-notification-row");
  row.dataset.read = String(notification.read);
  row.dataset.severity = notification.severity || "info";
  const open = button("", "lp-notification-open");
  const copy = el("span", "lp-grow");
  copy.append(el("strong", "", notification.title), el("span", "lp-copy", notification.body), el("time", "lp-copy", formatTime(notification.createdAt)));
  const avatar = el("span", "lp-notification-avatar", notification.title.slice(0, 1).toUpperCase());
  avatar.setAttribute("aria-hidden", "true");
  open.append(avatar, copy);
  open.setAttribute("aria-label", `Open ${notification.title}`);
  open.addEventListener("click", () => {
    host.send("lumiphone:notification_mark_read", { notificationId: notification.id });
    host.navigate(notification.route || { app: notification.app });
  });
  const dismiss = button("×", "lp-notification-dismiss");
  dismiss.setAttribute("aria-label", `Dismiss ${notification.title}`);
  dismiss.addEventListener("click", () => host.send("lumiphone:notification_dismiss", { notificationId: notification.id }));
  row.append(open, dismiss);
  return row;
}
function renderNotificationsView(host) {
  const notifications = activeNotifications(host.notifications).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const unread = notifications.filter((entry) => !entry.read).length;
  const { page, content } = host.page("Notification Center", unread ? `${unread} unread` : "All caught up", { label: notifications.length ? "Clear" : "", enabled: Boolean(notifications.length), callback: () => {
    if (window.confirm("Clear all notifications? Messages remain in their apps."))
      host.send("lumiphone:notifications_clear", { mode: "all" });
  } });
  if (notifications.some((entry) => entry.read)) {
    const clearRead = button("Clear read", "lp-button lp-button-quiet");
    clearRead.addEventListener("click", () => host.send("lumiphone:notifications_clear", { mode: "read" }));
    content.appendChild(clearRead);
  }
  const today = [];
  const earlier = [];
  const now = new Date;
  for (const entry of notifications)
    (sameDay(new Date(entry.createdAt), now) ? today : earlier).push(entry);
  for (const [label, entries] of [["Today", today], ["Earlier", earlier]]) {
    if (!entries.length)
      continue;
    const group = el("section", "lp-notification-group");
    group.appendChild(el("div", "lp-eyebrow", label));
    for (const entry of entries)
      group.appendChild(notificationRow(host, entry));
    content.appendChild(group);
  }
  if (!notifications.length)
    content.appendChild(el("p", "lp-notification-empty", "No notifications. Messages, trackers, notes, and timeline data remain in their apps."));
  return page;
}

// src/frontend/router.ts
function sameRoute(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

class PocketRouteHistory {
  entries = [];
  current = { app: "home" };
  navigate(routeInput, replace = false) {
    const route = normalizePocketRoute(routeInput);
    if (sameRoute(route, this.current))
      return this.current;
    if (!replace)
      this.entries.push(this.current);
    this.current = route;
    return route;
  }
  settle(routeInput) {
    const route = normalizePocketRoute(routeInput);
    if (sameRoute(route, this.current))
      return this.current;
    const parent = this.entries.at(-1);
    if (parent && sameRoute(parent, route))
      this.entries.pop();
    this.current = route;
    return route;
  }
  back() {
    this.current = this.entries.pop() || { app: "home" };
    return this.current;
  }
  home() {
    this.entries = [];
    this.current = { app: "home" };
    return this.current;
  }
  reset(route = { app: "home" }) {
    this.entries = [];
    this.current = normalizePocketRoute(route);
    return this.current;
  }
  get canGoBack() {
    return this.entries.length > 0 || this.current.app !== "home";
  }
}

// src/domain/activity-clock.ts
function activityClock(activity, state) {
  let { storyAt, storyTimeLabel, storyTimezoneOffsetMinutes } = activity.presentation || {};
  if (!validStamp(storyAt) && !storyTimeLabel?.trim() && state && activity.source?.messageId) {
    const sourceId = activity.source.messageId;
    const selected = [...state.hostSwipeSelections || []].reverse().find((entry) => entry.hostMessageId === sourceId);
    const snapshot = [...state.candidateClocks || []].reverse().find((entry) => entry.hostMessageId === sourceId && selected && entry.swipeId === selected.swipeId);
    if (snapshot) {
      storyAt = snapshot.source === "manual" || snapshot.precision === "exact" ? snapshot.roleplayNow : undefined;
      storyTimeLabel = snapshot.source === "manual" || snapshot.precision === "exact" ? undefined : snapshot.label;
      storyTimezoneOffsetMinutes = state.roleplayTimezoneOffsetMinutes;
    }
  }
  if (validStamp(storyAt)) {
    const offset = typeof storyTimezoneOffsetMinutes === "number" && Number.isFinite(storyTimezoneOffsetMinutes) && Math.abs(storyTimezoneOffsetMinutes) <= 840 ? storyTimezoneOffsetMinutes : 0;
    const date = new Date(Date.parse(storyAt) - offset * 60000);
    return { time: date.toISOString().slice(11, 16), date: new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(date), precision: "exact" };
  }
  const label = clockLabel(storyTimeLabel);
  return { time: label, date: "", precision: label ? "approximate" : "unknown" };
}
function validStamp(value) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)));
}

// src/frontend/phone-screen.ts
function node(tag, className, text = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}
function portrait2(name, url) {
  const avatar = node("span", "pocket-phone-avatar", name.slice(0, 1).toUpperCase());
  avatar.setAttribute("aria-hidden", "true");
  if (url) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = "";
    avatar.replaceChildren(image);
  }
  return avatar;
}
var ICON_PATHS = {
  wifi: ["M3 9.5a14.5 14.5 0 0 1 18 0", "M6.5 13a9 9 0 0 1 11 0", "M10 16.5a3.6 3.6 0 0 1 4 0", "M12 20h.01"],
  back: ["m15 18-6-6 6-6"],
  video: ["M15 10l4.6-2.6A1 1 0 0 1 21 8.3v7.4a1 1 0 0 1-1.4.9L15 14", "M4 6.5h9a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"],
  plus: ["M12 5v14", "M5 12h14"],
  send: ["M12 19V5", "m6 11 6-6 6 6"],
  message: ["M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"],
  phone: ["M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"],
  mute: ["M11 5 6 9H3v6h3l5 4V5Z", "m19 9-6 6", "m13 9 6 6"],
  speaker: ["M11 5 6 9H3v6h3l5 4V5Z", "M15 9a4 4 0 0 1 0 6", "M17.8 6.5a8 8 0 0 1 0 11"],
  contacts: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]
};
function icon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  if (className)
    svg.setAttribute("class", className);
  if (name === "signal") {
    [[4, 15, 2, 5], [8, 12, 2, 8], [12, 9, 2, 11], [16, 6, 2, 14]].forEach(([x, y, width, height]) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(width));
      rect.setAttribute("height", String(height));
      rect.setAttribute("rx", "1");
      rect.setAttribute("fill", "currentColor");
      rect.setAttribute("stroke", "none");
      svg.append(rect);
    });
    return svg;
  }
  if (name === "battery") {
    const shell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    shell.setAttribute("x", "3");
    shell.setAttribute("y", "7");
    shell.setAttribute("width", "16");
    shell.setAttribute("height", "10");
    shell.setAttribute("rx", "2");
    const nub = document.createElementNS("http://www.w3.org/2000/svg", "path");
    nub.setAttribute("d", "M21 10v4");
    const fill = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    fill.setAttribute("x", "5");
    fill.setAttribute("y", "9");
    fill.setAttribute("width", "11");
    fill.setAttribute("height", "6");
    fill.setAttribute("rx", "1");
    fill.setAttribute("fill", "currentColor");
    fill.setAttribute("stroke", "none");
    svg.append(shell, nub, fill);
    return svg;
  }
  for (const pathData of ICON_PATHS[name]) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.append(path);
  }
  return svg;
}
function callSymbol() {
  const symbol = node("span", "pocket-call-symbol");
  symbol.setAttribute("aria-hidden", "true");
  const handset = icon("phone");
  handset.style.transform = "rotate(135deg)";
  symbol.append(handset);
  return symbol;
}
function phoneStatus(time) {
  const status = node("div", "pocket-phone-status");
  status.append(node("span", "pocket-phone-status-time", time || "Pocket"), node("span", "pocket-phone-island"));
  const indicators = node("span", "pocket-phone-indicators");
  indicators.append(icon("signal"), icon("wifi"), icon("battery"));
  status.append(indicators);
  return status;
}
function appHeader(title, subtitle, openRoute, avatarUrl) {
  const header = node("button", "pocket-phone-app-header");
  header.type = "button";
  header.setAttribute("aria-label", `Open ${title} in Pocket`);
  header.addEventListener("click", openRoute);
  const back = node("span", "pocket-phone-header-back");
  back.append(icon("back"));
  const identity = node("span", "pocket-phone-header-identity");
  identity.append(portrait2(title, avatarUrl), node("strong", "pocket-phone-conversation-title", title));
  if (subtitle)
    identity.append(node("span", "pocket-phone-subtitle", subtitle));
  const video = node("span", "pocket-phone-header-action");
  video.append(icon("video"));
  header.append(back, identity, video);
  return header;
}
function composer() {
  const bar = node("span", "pocket-mock-composer pocket-phone-composer");
  bar.setAttribute("aria-hidden", "true");
  const add = node("span", "pocket-phone-composer-action");
  add.append(icon("plus"));
  const field = node("span", "pocket-phone-composer-field", "Message");
  const send = node("span", "pocket-phone-composer-send");
  send.append(icon("send"));
  bar.append(add, field, send);
  return bar;
}
function buildPhoneScreen(activity, openRoute, options) {
  const presentation = activity.presentation;
  if (!presentation || !["received", "observed", "sent", "batch"].includes(presentation.kind))
    return null;
  const type = presentation.call ? "call" : presentation.kind === "batch" ? "group" : presentation.kind === "sent" ? "chat" : "lock";
  const phone = node("div", "pocket-inline-frame pocket-phone-device");
  phone.dataset.pocketUi = "true";
  phone.dataset.appearance = "phone";
  phone.dataset.screen = type;
  phone.style.setProperty("--pocket-inline-accent", options.accent || "#8b7dff");
  if (options.textColor)
    phone.style.setProperty("--pocket-inline-text", options.textColor);
  if (options.surfaceColor)
    phone.style.setProperty("--pocket-inline-surface", options.surfaceColor);
  const clock = options.clock || activityClock(activity);
  const time = clock.precision === "exact" ? clock.time : "";
  const screen = node("div", "pocket-phone-screen");
  screen.append(phoneStatus(time));
  phone.append(screen);
  const routeButton = (label, className, aria) => {
    const button = node("button", className, label);
    button.type = "button";
    button.setAttribute("aria-label", aria);
    button.addEventListener("click", () => openRoute(activity.route));
    return button;
  };
  const recipients = presentation.recipientNames?.filter(Boolean).join(", ") || "";
  const title = presentation.conversationTitle || (type === "lock" ? presentation.senderName : recipients) || activity.title || "Messages";
  if (type === "lock") {
    screen.classList.add("pocket-phone-lock");
    if (options.background)
      screen.style.backgroundImage = `linear-gradient(rgba(12, 10, 18, .18), rgba(12, 10, 18, .36)), ${options.background}`;
    screen.style.backgroundSize = options.backgroundSize || "cover";
    screen.style.backgroundPosition = options.backgroundPosition || "center";
    const lockHero = node("div", "pocket-phone-lock-hero");
    const deviceLabel = presentation.kind === "observed" ? `${recipients || "Another actor"}'s phone` : recipients ? `${recipients}'s phone` : "Pocket";
    const display = node("span", "pocket-phone-clock", clock.time || "New message");
    display.dataset.precision = clock.precision;
    lockHero.append(node("span", "pocket-phone-lock-label", deviceLabel), display);
    if (clock.date)
      lockHero.append(node("span", "pocket-phone-lock-caption", clock.date));
    const notification = routeButton("", "pocket-phone-notification", `Open ${presentation.kind === "observed" ? `${recipients}'s phone · ` : ""}${title} in Pocket`);
    const app = node("span", "pocket-phone-notification-app");
    app.append(icon("message"), node("span", "pocket-phone-app-label", "Messages"));
    const body = node("span", "pocket-phone-notification-body");
    body.append(portrait2(presentation.senderName || "?", options.avatarUrl));
    const copy = node("span", "pocket-phone-notification-content");
    copy.append(node("strong", "pocket-phone-notification-sender", presentation.senderName || "Message"), node("span", "pocket-phone-notification-copy", `${presentation.format === "voice" ? "▶ Voice message · " : ""}${activity.summary || ""}`));
    body.append(copy);
    notification.append(app, body);
    screen.append(lockHero, notification, node("span", "pocket-phone-home-indicator"));
  } else if (type === "call") {
    screen.classList.add("pocket-phone-call");
    screen.dataset.callStatus = presentation.call.status;
    const callHeader = routeButton("", "pocket-phone-app-header pocket-phone-call-header", "Open call history in Pocket");
    const back = node("span", "pocket-phone-header-back");
    back.append(icon("back"));
    callHeader.append(back, node("span", "pocket-phone-app-label", "Phone"));
    const identity = node("div", "pocket-phone-call-identity");
    identity.append(portrait2(presentation.senderName || "Call", options.avatarUrl), node("strong", "pocket-phone-call-name", [presentation.senderName, recipients].filter(Boolean).join(" → ") || activity.title), node("span", "pocket-phone-call-status", callSummary(presentation.call)));
    const controls = node("div", "pocket-phone-call-controls");
    const control = (name, label, danger = false) => {
      const item = node("span", `pocket-phone-call-control${danger ? " pocket-phone-call-danger" : ""}`);
      const glyph = node("span", "pocket-phone-call-control-icon");
      glyph.append(name === "phone" ? callSymbol() : icon(name));
      item.append(glyph, node("span", "pocket-phone-control-caption", label));
      return item;
    };
    controls.append(control("mute", "Mute"), control("speaker", "Speaker"), control("message", "Message"), control("phone", presentation.call.status === "ended" ? "Ended" : "End", true));
    screen.append(callHeader, identity, controls, node("span", "pocket-phone-home-indicator"));
  } else {
    screen.classList.add("pocket-phone-chat");
    const subtitle = type === "group" ? `${presentation.batchMessages?.length || 0} messages` : recipients ? "Messages" : "";
    screen.append(appHeader(title, subtitle, () => openRoute(activity.route), type === "chat" ? options.avatarUrl : undefined));
    const thread = node("div", "pocket-phone-thread");
    thread.tabIndex = 0;
    thread.setAttribute("role", "region");
    thread.setAttribute("aria-label", `${title} conversation`);
    const messages = type === "group" ? presentation.batchMessages || [] : [{ senderName: presentation.senderName || "You", senderActorId: presentation.senderActorId, format: presentation.format, text: activity.summary || "", direction: "sent" }];
    for (const [index, message] of messages.entries()) {
      const row = node("div", "pocket-phone-message");
      row.dataset.direction = message.direction;
      const previous = messages[index - 1];
      row.dataset.continuation = String(Boolean(previous && previous.senderName === message.senderName));
      if (message.direction !== "sent") {
        row.append(portrait2(message.senderName, options.avatars?.[message.senderActorId || ""]));
        const content = node("span", "pocket-phone-message-content");
        if (row.dataset.continuation !== "true")
          content.append(node("strong", "pocket-phone-sender", message.senderName));
        content.append(node("span", "pocket-phone-bubble", `${message.format === "voice" ? "▶ Voice message · " : ""}${message.text}`));
        row.append(content);
      } else {
        const content = node("span", "pocket-phone-message-content");
        content.append(node("span", "pocket-phone-bubble", `${message.format === "voice" ? "▶ Voice message · " : ""}${message.text}`));
        row.append(content);
      }
      thread.append(row);
    }
    if (type === "chat")
      thread.append(node("span", "pocket-phone-delivery", "Delivered"));
    screen.append(thread, composer(), node("span", "pocket-phone-home-indicator"));
  }
  return phone;
}

// src/frontend/components/pocket-inline-redesign.css
var pocket_inline_redesign_default = `/* Normalize the Pocket-owned mount wrappers too; a transformed parent distorts the whole device. */\r
.pocket-artifact-stack[data-pocket-ui="true"],\r
.pocket-inline-anchor[data-pocket-host="true"],\r
.pocket-receipt-host[data-pocket-host="true"] {\r
  all: revert;\r
  font: 400 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\r
  text-transform: none;\r
  text-shadow: none;\r
  letter-spacing: normal;\r
  color: #f5f2fb;\r
  display: grid;\r
  gap: 5px;\r
  min-width: 0;\r
  width: 100%;\r
  box-sizing: border-box;\r
  position: static;\r
  transform: none;\r
  padding: 0;\r
  border: 0;\r
  background: none;\r
}\r
.pocket-inline-anchor[data-pocket-host="true"] { margin: 12px 0; }\r
.pocket-receipt-host[data-pocket-host="true"] { margin: 8px 0 2px; max-width: min(100%,460px); }\r
.pocket-artifact-stack[data-pocket-ui="true"]::before,\r
.pocket-artifact-stack[data-pocket-ui="true"]::after,\r
.pocket-inline-anchor[data-pocket-host="true"]::before,\r
.pocket-inline-anchor[data-pocket-host="true"]::after,\r
.pocket-receipt-host[data-pocket-host="true"]::before,\r
.pocket-receipt-host[data-pocket-host="true"]::after { content: none; }\r
.pocket-artifact-stack[data-pocket-ui="true"] > .pocket-inline-frame[data-pocket-ui="true"] { margin-inline: auto; }\r
\r
/* Pocket owns its inline UI; host prose/theme rules must not become phone chrome. */\r
.pocket-inline-frame[data-pocket-ui="true"] {\r
  all: revert;\r
  display: block;\r
  isolation: isolate;\r
  color-scheme: dark;\r
  font: 400 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\r
  color: var(--pocket-inline-text, #f5f2fb);\r
  text-align: left;\r
  text-transform: none;\r
  letter-spacing: normal;\r
  text-shadow: none;\r
  white-space: normal;\r
  word-break: normal;\r
  overflow-wrap: anywhere;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] :where(div, span, strong, button, input, textarea, img, time) {\r
  all: revert;\r
  margin: 0;\r
  padding: 0;\r
  border: 0;\r
  background: none;\r
  font: inherit;\r
  color: inherit;\r
  letter-spacing: inherit;\r
  text-transform: none;\r
  text-shadow: none;\r
  text-align: inherit;\r
  white-space: normal;\r
  overflow-wrap: inherit;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"],\r
.pocket-inline-frame[data-pocket-ui="true"] *,\r
.pocket-inline-frame[data-pocket-ui="true"] *::before,\r
.pocket-inline-frame[data-pocket-ui="true"] *::after {\r
  box-sizing: border-box;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"]::before,\r
.pocket-inline-frame[data-pocket-ui="true"]::after,\r
.pocket-inline-frame[data-pocket-ui="true"] *::before,\r
.pocket-inline-frame[data-pocket-ui="true"] *::after {\r
  all: revert;\r
  content: none;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] :where(button, input, textarea) {\r
  appearance: none;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] :where(svg) {\r
  display: inline-block;\r
  position: static;\r
  margin: 0;\r
  padding: 0;\r
  border: 0;\r
  background: none;\r
  filter: none;\r
  text-transform: none;\r
  letter-spacing: inherit;\r
  text-shadow: none;\r
  transform: none;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] {\r
  --pocket-inline-accent: #8b7dff;\r
  --pocket-inline-text: #f5f2fb;\r
  --pocket-inline-muted: #a8a2b3;\r
  --pocket-inline-surface: #242129;\r
  --pocket-inline-surface-2: #2b2731;\r
  --pocket-inline-surface-3: #17151c;\r
  --pocket-inline-border: rgba(255, 255, 255, .075);\r
  --pocket-inline-shadow: 0 16px 46px rgba(0, 0, 0, .32), inset 0 1px 0 rgba(255, 255, 255, .025);\r
}\r
\r
.pocket-artifact-stack,\r
.pocket-inline-frame[data-pocket-ui="true"] {\r
  box-sizing: border-box;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"][data-appearance="cards"] {\r
  width: min(100%, 470px);\r
  color: var(--pocket-inline-text);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"][data-appearance="cards"] .pocket-inline-artifact,\r
.pocket-inline-frame[data-pocket-ui="true"][data-appearance="cards"] .pocket-inline-batch {\r
  width: 100%;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact {\r
  box-sizing: border-box;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 10px;\r
  width: 100%;\r
  min-width: 0;\r
  padding: 16px 18px;\r
  color: var(--pocket-inline-text);\r
  text-align: left;\r
  font: inherit;\r
  background:\r
    linear-gradient(180deg, rgba(255,255,255,.018), transparent 26%),\r
    linear-gradient(145deg, #27242d 0%, #211f27 68%, #1d1b22 100%);\r
  border: 1px solid var(--pocket-inline-border);\r
  border-radius: 18px;\r
  box-shadow: var(--pocket-inline-shadow);\r
  cursor: pointer;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact:hover {\r
  border-color: color-mix(in srgb, var(--pocket-inline-accent) 22%, rgba(255,255,255,.08));\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact:focus-visible,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-more:focus-visible,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device button:focus-visible {\r
  outline: 2px solid color-mix(in srgb, var(--pocket-inline-accent) 72%, white 12%);\r
  outline-offset: 3px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-device {\r
  display: block;\r
  margin-bottom: -2px;\r
  color: #8f8998;\r
  font-size: 11px;\r
  font-weight: 650;\r
  letter-spacing: .015em;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-header,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-header,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-chrome {\r
  min-width: 0;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-header,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-header {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 7px;\r
  padding-bottom: 10px;\r
  border-bottom: 1px solid rgba(255,255,255,.055);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-chrome {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  gap: 12px;\r
  color: #a9a3b2;\r
  font-size: 11px;\r
  font-weight: 650;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-app {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-app svg {\r
  width: 14px;\r
  height: 14px;\r
  color: var(--pocket-inline-accent);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-state,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-recipient {\r
  color: #8e8897;\r
  font-size: 10px;\r
  font-weight: 560;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-recipient {\r
  align-self: flex-end;\r
  margin-top: -24px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-message-body {\r
  display: grid;\r
  grid-template-columns: 34px minmax(0, 1fr);\r
  gap: 11px;\r
  align-items: start;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-message-content,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-content,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-call-details {\r
  display: flex;\r
  min-width: 0;\r
  flex-direction: column;\r
  gap: 5px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-avatar,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-avatar {\r
  display: inline-grid;\r
  place-items: center;\r
  flex: 0 0 auto;\r
  overflow: hidden;\r
  color: white;\r
  font-weight: 720;\r
  background:\r
    linear-gradient(145deg, color-mix(in srgb, var(--pocket-inline-accent) 76%, white 6%), color-mix(in srgb, var(--pocket-inline-accent) 52%, #231f2c));\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 4px 14px rgba(0,0,0,.18);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-avatar {\r
  width: 34px;\r
  height: 34px;\r
  border-radius: 50%;\r
  font-size: 13px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-avatar img,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-avatar img {\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-actors,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-title {\r
  color: #fbf9ff;\r
  font-weight: 760;\r
  letter-spacing: -.01em;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-actors {\r
  font-size: 14px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact-copy {\r
  color: #e5e1ea;\r
  font-size: 13px;\r
  line-height: 1.46;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-chat-bubble,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-bubble {\r
  border: 1px solid rgba(255,255,255,.035);\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 5px 14px rgba(0,0,0,.11);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-chat-bubble {\r
  align-self: flex-end;\r
  max-width: 82%;\r
  padding: 9px 13px;\r
  border-radius: 15px 15px 5px 15px;\r
  color: white;\r
  background: linear-gradient(145deg, color-mix(in srgb, var(--pocket-inline-accent) 90%, white 10%), color-mix(in srgb, var(--pocket-inline-accent) 78%, black));\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-call {\r
  align-items: center;\r
  min-height: 180px;\r
  justify-content: center;\r
  text-align: center;\r
  background:\r
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--pocket-inline-accent) 10%, transparent), transparent 48%),\r
    linear-gradient(160deg, #28252e, #1d1b22);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-call-identity {\r
  display: flex;\r
  flex-direction: column;\r
  align-items: center;\r
  gap: 9px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-call .pocket-inline-avatar {\r
  width: 46px;\r
  height: 46px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-call .pocket-inline-artifact-chrome {\r
  justify-content: center;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-call-symbol {\r
  display: inline-grid;\r
  place-items: center;\r
  width: 38px;\r
  height: 38px;\r
  margin-top: 4px;\r
  color: #fff;\r
  background: linear-gradient(145deg, #bd5d69, #974552);\r
  border: 1px solid rgba(255,255,255,.1);\r
  border-radius: 50%;\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 8px 20px rgba(0,0,0,.22);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-call-symbol svg {\r
  width: 18px;\r
  height: 18px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-title {\r
  font-size: 15px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 14px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-row {\r
  display: grid;\r
  grid-template-columns: 28px minmax(0, 1fr);\r
  gap: 10px;\r
  align-items: start;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-row[data-continuation="true"] .pocket-inline-avatar {\r
  visibility: hidden;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-row .pocket-inline-avatar {\r
  width: 28px;\r
  height: 28px;\r
  font-size: 11px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-sender {\r
  color: #938d9b;\r
  font-size: 10px;\r
  font-weight: 700;\r
  letter-spacing: .01em;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-bubble {\r
  align-self: flex-start;\r
  max-width: 90%;\r
  padding: 9px 12px;\r
  color: #f0edf5;\r
  font-size: 12px;\r
  line-height: 1.42;\r
  background: linear-gradient(145deg, #2c2933, #27242d);\r
  border-radius: 5px 13px 13px 13px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-row[data-direction="sent"] .pocket-inline-transcript-bubble {\r
  color: #fff;\r
  background: linear-gradient(145deg, color-mix(in srgb, var(--pocket-inline-accent) 78%, black), color-mix(in srgb, var(--pocket-inline-accent) 64%, black));\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-batch {\r
  border-radius: 18px;\r
  overflow: hidden;\r
  background: #1e1c23;\r
  border: 1px solid var(--pocket-inline-border);\r
  box-shadow: var(--pocket-inline-shadow);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-batch .pocket-inline-artifact {\r
  border: 0;\r
  border-radius: 0;\r
  box-shadow: none;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-transcript-more {\r
  width: 100%;\r
  padding: 11px 14px;\r
  color: #a8a2b2;\r
  font: inherit;\r
  font-size: 11px;\r
  background: linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,.012));\r
  border: 0;\r
  border-top: 1px solid rgba(255,255,255,.055);\r
  cursor: pointer;\r
}\r
\r
/* Full-phone renderer */\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device {\r
  box-sizing: border-box;\r
  width: min(360px, 92vw);\r
  aspect-ratio: 9 / 18.4;\r
  padding: 5px;\r
  color: var(--pocket-inline-text);\r
  background:\r
    linear-gradient(145deg, #4a4650 0%, #27242c 22%, #121116 64%, #343039 100%);\r
  border: 1px solid rgba(255,255,255,.12);\r
  border-radius: 42px;\r
  box-shadow:\r
    0 32px 70px rgba(0,0,0,.48),\r
    0 8px 24px rgba(0,0,0,.3),\r
    inset 0 1px 0 rgba(255,255,255,.18),\r
    inset 0 -1px 0 rgba(255,255,255,.04);\r
  overflow: hidden;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-screen {\r
  position: relative;\r
  display: flex;\r
  flex-direction: column;\r
  width: 100%;\r
  height: 100%;\r
  min-height: 0;\r
  overflow: hidden;\r
  color: #f7f5fb;\r
  background:\r
    radial-gradient(circle at 40% -5%, color-mix(in srgb, var(--pocket-inline-accent) 11%, transparent), transparent 34%),\r
    linear-gradient(180deg, #15131a 0%, #100f14 100%);\r
  border-radius: 36px;\r
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.035);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-status {\r
  position: relative;\r
  z-index: 5;\r
  display: grid;\r
  grid-template-columns: 1fr auto 1fr;\r
  align-items: center;\r
  flex: 0 0 35px;\r
  padding: 0 17px;\r
  color: rgba(255,255,255,.92);\r
  font-size: 10px;\r
  font-weight: 720;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-status-time {\r
  justify-self: start;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-island {\r
  width: 76px;\r
  height: 20px;\r
  border-radius: 999px;\r
  background: rgba(0,0,0,.82);\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 1px 0 rgba(255,255,255,.02);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-indicators {\r
  display: flex;\r
  align-items: center;\r
  justify-self: end;\r
  gap: 5px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-indicators svg {\r
  width: 13px;\r
  height: 13px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-indicators svg:last-child {\r
  width: 18px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-home-indicator {\r
  position: absolute;\r
  left: 50%;\r
  bottom: 7px;\r
  width: 92px;\r
  height: 4px;\r
  transform: translateX(-50%);\r
  border-radius: 999px;\r
  background: rgba(255,255,255,.64);\r
  box-shadow: 0 1px 4px rgba(0,0,0,.25);\r
}\r
\r
/* Lock screen */\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-lock {\r
  background:\r
    radial-gradient(circle at 68% 8%, color-mix(in srgb,var(--pocket-inline-accent) 34%,transparent), transparent 28%),\r
    radial-gradient(circle at 18% 44%, color-mix(in srgb,var(--pocket-inline-accent) 22%,transparent), transparent 34%),\r
    linear-gradient(155deg, #242229 0%, #17151b 44%, #0d0c10 100%);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-lock::after {\r
  content: '';\r
  position: absolute;\r
  inset: 35px 0 0;\r
  pointer-events: none;\r
  background: linear-gradient(180deg, rgba(255,255,255,.025), transparent 24%, rgba(0,0,0,.12));\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-lock-hero {\r
  position: relative;\r
  z-index: 1;\r
  display: flex;\r
  flex-direction: column;\r
  align-items: center;\r
  gap: 5px;\r
  padding: 40px 18px 26px;\r
  text-shadow: 0 2px 14px rgba(0,0,0,.28);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-lock-label {\r
  color: rgba(255,255,255,.64);\r
  font-size: 11px;\r
  font-weight: 580;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-clock {\r
  color: #fff;\r
  font-size: 54px;\r
  font-weight: 280;\r
  line-height: 1;\r
  letter-spacing: -.045em;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-clock[data-precision="approximate"],\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-clock[data-precision="unknown"] { font-size:28px; line-height:1.2; letter-spacing:-.02em; max-width:100%; overflow-wrap:anywhere; }\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-lock-caption {\r
  color: rgba(255,255,255,.74);\r
  font-size: 12px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification {\r
  position: relative;\r
  z-index: 2;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 10px;\r
  width: calc(100% - 28px);\r
  margin: 0 14px;\r
  padding: 13px 14px 14px;\r
  color: #f7f4fb;\r
  text-align: left;\r
  font: inherit;\r
  background:\r
    linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.024)),\r
    rgba(28,25,34,.86);\r
  border: 1px solid rgba(255,255,255,.11);\r
  border-radius: 18px;\r
  box-shadow: 0 14px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.055);\r
  backdrop-filter: blur(14px);\r
  cursor: pointer;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification-app {\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  color: rgba(255,255,255,.68);\r
  font-size: 10px;\r
  font-weight: 650;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification-app svg {\r
  width: 14px;\r
  height: 14px;\r
  color: color-mix(in srgb, var(--pocket-inline-accent) 88%, white 8%);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification-body {\r
  display: grid;\r
  grid-template-columns: 34px minmax(0,1fr);\r
  gap: 10px;\r
  align-items: start;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification-content {\r
  display: flex;\r
  min-width: 0;\r
  flex-direction: column;\r
  gap: 4px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-avatar {\r
  width: 34px;\r
  height: 34px;\r
  border-radius: 50%;\r
  font-size: 12px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification-sender {\r
  font-size: 13px;\r
  font-weight: 760;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-notification-copy {\r
  display: -webkit-box;\r
  overflow: hidden;\r
  color: rgba(255,255,255,.9);\r
  font-size: 12px;\r
  line-height: 1.4;\r
  -webkit-box-orient: vertical;\r
  -webkit-line-clamp: 4;\r
}\r
\r
/* Open chat */\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-chat {\r
  background:\r
    radial-gradient(circle at 70% -8%, color-mix(in srgb, var(--pocket-inline-accent) 8%, transparent), transparent 32%),\r
    #0c0b0f;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-app-header {\r
  position: relative;\r
  z-index: 2;\r
  display: grid;\r
  grid-template-columns: 36px minmax(0,1fr) 36px;\r
  align-items: center;\r
  flex: 0 0 72px;\r
  width: 100%;\r
  padding: 7px 12px 9px;\r
  color: inherit;\r
  text-align: center;\r
  font: inherit;\r
  background: linear-gradient(180deg, rgba(31,28,36,.98), rgba(22,20,27,.96));\r
  border: 0;\r
  border-bottom: 1px solid rgba(255,255,255,.065);\r
  box-shadow: 0 9px 18px rgba(0,0,0,.12);\r
  cursor: pointer;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-back,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-action {\r
  display: grid;\r
  place-items: center;\r
  width: 32px;\r
  height: 32px;\r
  color: color-mix(in srgb, var(--pocket-inline-accent) 82%, white 10%);\r
  border-radius: 50%;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-back svg,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-action svg {\r
  width: 20px;\r
  height: 20px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-action {\r
  background: rgba(255,255,255,.055);\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.045);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-identity {\r
  display: grid;\r
  grid-template-columns: 34px minmax(0,1fr);\r
  grid-template-rows: auto auto;\r
  align-items: center;\r
  justify-self: center;\r
  column-gap: 8px;\r
  min-width: 0;\r
  text-align: left;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-header-identity .pocket-phone-avatar {\r
  grid-row: 1 / 3;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-conversation-title {\r
  overflow: hidden;\r
  font-size: 13px;\r
  font-weight: 760;\r
  line-height: 1.2;\r
  text-overflow: ellipsis;\r
  white-space: nowrap;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-subtitle {\r
  color: #918b99;\r
  font-size: 9px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-thread {\r
  display: flex;\r
  flex: 1 1 auto;\r
  min-height: 0;\r
  overflow: auto;\r
  flex-direction: column;\r
  gap: 12px;\r
  padding: 16px 13px 20px;\r
  scrollbar-color: rgba(255,255,255,.12) transparent;\r
  scrollbar-width: thin;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-thread::-webkit-scrollbar {\r
  width: 6px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-thread::-webkit-scrollbar-thumb {\r
  background: rgba(255,255,255,.12);\r
  border-radius: 999px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-thread::-webkit-scrollbar-track {\r
  background: transparent;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-message {\r
  display: flex;\r
  align-items: flex-end;\r
  gap: 8px;\r
  width: 100%;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-message[data-continuation="false"] {\r
  margin-top: 4px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-message[data-direction="sent"] {\r
  justify-content: flex-end;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-message[data-continuation="true"] .pocket-phone-avatar {\r
  visibility: hidden;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-message-content {\r
  display: flex;\r
  max-width: 76%;\r
  min-width: 0;\r
  flex-direction: column;\r
  gap: 4px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-sender {\r
  margin-left: 4px;\r
  color: #878190;\r
  font-size: 9px;\r
  font-weight: 680;\r
  letter-spacing: .01em;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-bubble {\r
  display: block;\r
  padding: 10px 12px;\r
  color: #f3eff7;\r
  font-size: 12px;\r
  line-height: 1.42;\r
  background: linear-gradient(145deg, #2b2731, #232029);\r
  border: 1px solid rgba(255,255,255,.045);\r
  border-radius: 6px 15px 15px 15px;\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 4px 12px rgba(0,0,0,.16);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-message[data-direction="sent"] .pocket-phone-bubble {\r
  color: #fff;\r
  background: linear-gradient(145deg, color-mix(in srgb, var(--pocket-inline-accent) 92%, #a698ff 8%), color-mix(in srgb, var(--pocket-inline-accent) 78%, #5f54d5));\r
  border-radius: 15px 15px 5px 15px;\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 8px 18px rgba(67,52,149,.18);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-delivery {\r
  align-self: flex-end;\r
  margin: -3px 3px 0 0;\r
  color: #77727f;\r
  font-size: 8px;\r
  font-weight: 680;\r
  text-transform: uppercase;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer {\r
  display: grid;\r
  grid-template-columns: 34px minmax(0,1fr) 32px;\r
  align-items: center;\r
  flex: 0 0 58px;\r
  gap: 7px;\r
  padding: 8px 10px 13px;\r
  background: linear-gradient(180deg, rgba(19,17,23,.94), rgba(11,10,14,.98));\r
  border-top: 1px solid rgba(255,255,255,.065);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer-action,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer-send {\r
  display: grid;\r
  place-items: center;\r
  width: 30px;\r
  height: 30px;\r
  color: #aaa4b3;\r
  background: #24212a;\r
  border: 1px solid rgba(255,255,255,.055);\r
  border-radius: 50%;\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer-send {\r
  color: #fff;\r
  background: linear-gradient(145deg, color-mix(in srgb, var(--pocket-inline-accent) 92%, #aaa0ff), color-mix(in srgb, var(--pocket-inline-accent) 72%, #5449c7));\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer-action svg,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer-send svg {\r
  width: 16px;\r
  height: 16px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-composer-field {\r
  display: flex;\r
  align-items: center;\r
  min-width: 0;\r
  height: 34px;\r
  padding: 0 12px;\r
  color: #797480;\r
  font-size: 11px;\r
  background: #131117;\r
  border: 1px solid rgba(255,255,255,.12);\r
  border-radius: 999px;\r
  box-shadow: inset 0 2px 8px rgba(0,0,0,.2);\r
}\r
\r
/* Dedicated call screen */\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call {\r
  background:\r
    radial-gradient(circle at 50% 15%, color-mix(in srgb, var(--pocket-inline-accent) 26%, transparent), transparent 34%),\r
    radial-gradient(circle at 80% 75%, color-mix(in srgb,var(--pocket-inline-accent) 18%,transparent), transparent 30%),\r
    linear-gradient(180deg, #24202d 0%, #151219 55%, #0d0c10 100%);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-header {\r
  grid-template-columns: 36px 1fr;\r
  justify-items: start;\r
  flex-basis: 54px;\r
  background: transparent;\r
  border-bottom: 0;\r
  box-shadow: none;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-header .pocket-phone-app-label {\r
  color: #aaa4b3;\r
  font-size: 11px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-identity {\r
  display: flex;\r
  flex: 1 1 auto;\r
  min-height: 0;\r
  flex-direction: column;\r
  align-items: center;\r
  justify-content: center;\r
  gap: 9px;\r
  padding: 0 24px 40px;\r
  text-align: center;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-identity .pocket-phone-avatar {\r
  width: 86px;\r
  height: 86px;\r
  margin-bottom: 9px;\r
  font-size: 28px;\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 18px 42px rgba(0,0,0,.28);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-name {\r
  font-size: 20px;\r
  font-weight: 760;\r
  letter-spacing: -.025em;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-status {\r
  color: #a39dab;\r
  font-size: 12px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-controls {\r
  display: grid;\r
  grid-template-columns: repeat(4, 1fr);\r
  gap: 9px;\r
  flex: 0 0 auto;\r
  padding: 0 18px 36px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-control {\r
  display: flex;\r
  min-width: 0;\r
  flex-direction: column;\r
  align-items: center;\r
  gap: 7px;\r
  color: #aaa4b3;\r
  font-size: 9px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-control-icon {\r
  display: grid;\r
  place-items: center;\r
  width: 48px;\r
  height: 48px;\r
  color: #f8f6fb;\r
  background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.06));\r
  border: 1px solid rgba(255,255,255,.09);\r
  border-radius: 50%;\r
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 9px 20px rgba(0,0,0,.18);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-control-icon > svg,\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-control-icon .pocket-call-symbol svg {\r
  width: 19px;\r
  height: 19px;\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-control.pocket-phone-call-danger .pocket-phone-call-control-icon {\r
  background: linear-gradient(145deg, #c35d69, #984651);\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device .pocket-phone-call-control-icon .pocket-call-symbol {\r
  width: 100%;\r
  height: 100%;\r
  margin: 0;\r
  background: transparent;\r
  border: 0;\r
  box-shadow: none;\r
}\r
\r
@media (max-width: 560px) {\r
  .pocket-inline-frame[data-pocket-ui="true"][data-appearance="cards"] {\r
    width: 100%;\r
  }\r
\r
  .pocket-inline-frame[data-pocket-ui="true"] .pocket-inline-artifact {\r
    padding: 14px;\r
    border-radius: 16px;\r
  }\r
\r
  .pocket-inline-frame[data-pocket-ui="true"].pocket-phone-device {\r
    width: min(340px, 94vw);\r
  }\r
}\r
\r
.pocket-inline-frame[data-pocket-ui="true"] [hidden] { display: none; }\r
\r
/* Between-turn connectors stay compact even when prose artifacts use Full Phone. */\r
.pocket-receipt-host[data-pocket-host="true"][data-pocket-connector="true"] { width:100%; max-width:none; margin:8px 0; }\r
.pocket-receipt-host[data-pocket-host="true"][data-pocket-connector="true"][hidden] { display:none; }\r
.pocket-inline-frame[data-pocket-ui="true"][data-appearance="connector"] { width:100%; }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector { display:grid; gap:0; border:1px solid var(--pocket-inline-border); border-radius:12px; background:var(--pocket-inline-surface,#201e25); overflow:hidden; box-shadow:0 3px 12px #0002; }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-heading { display:block; width:100%; padding:9px 12px; text-align:left; color:var(--pocket-inline-text); font-size:11px; font-weight:650; border-bottom:1px solid var(--pocket-inline-border); cursor:pointer; opacity:.8; }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-row { display:grid; position:relative; grid-template-columns:minmax(0,1fr); gap:3px; width:100%; padding:10px 12px; text-align:left; cursor:pointer; }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-row + .pocket-connector-row { border-top:1px solid var(--pocket-inline-border); }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-row[data-direction="sent"] { text-align:right; border-right:2px solid var(--pocket-inline-accent); }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-sender { font-size:10px; font-weight:650; opacity:.65; }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-copy { font-size:13px; line-height:1.45; white-space:pre-wrap; }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-row:hover { background:color-mix(in srgb,var(--pocket-inline-text) 4%,transparent); }\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-row:focus-visible,\r
.pocket-inline-frame[data-pocket-ui="true"] .pocket-connector-heading:focus-visible { outline:2px solid var(--pocket-inline-accent); outline-offset:-3px; }\r
`;

// src/frontend/components/inline-styles.ts
var INLINE_BASE_STYLES = `
  .pocket-receipt-host { display:block; margin:8px 0 2px; max-width:min(100%,460px); }
  .pocket-inline-anchor { display:block; width:100%; margin:12px 0; min-height:0; }
  .pocket-inline-anchor[hidden] { display:none !important; }
  .pocket-inline-anchor .pocket-artifact-stack { width:100%; }
  .pocket-artifact-stack { display:grid; gap:5px; }
  .pocket-artifact-stack > .pocket-inline-frame { margin-inline:auto; }
  .pocket-inline-transcript-row[hidden] { display:none; }
  .pocket-receipt { appearance:none; width:100%; min-height:30px; padding:4px 7px; border:0; border-radius:9px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:7px; background:color-mix(in srgb,var(--lumiverse-fill,#17151d) 75%,transparent); color:var(--lumiverse-text,#f7f5ff); font:inherit; text-align:left; opacity:.72; }
  button.pocket-receipt { cursor:pointer; }
  button.pocket-receipt:hover { opacity:1; background:color-mix(in srgb,var(--lumiverse-primary,#8b7dff) 9%,var(--lumiverse-fill,#17151d)); }
  button.pocket-receipt:focus-visible,.pocket-inline-artifact:focus-visible { outline:3px solid color-mix(in srgb,var(--lumiverse-primary,#8b7dff) 55%,white); outline-offset:2px; }
  .pocket-receipt-kind { padding:2px 5px; border-radius:7px; background:color-mix(in srgb,var(--lumiverse-primary,#8b7dff) 12%,transparent); font-size:8px; font-weight:800; }
  .pocket-receipt-copy { min-width:0; display:flex; align-items:baseline; gap:6px; }
  .pocket-receipt-copy strong,.pocket-receipt-copy span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pocket-receipt-copy strong { font-size:9px; }
  .pocket-receipt-copy span { opacity:.6; font-size:8px; }
  .pocket-receipt-arrow { font-size:14px; opacity:.45; }
`;
var INLINE_FINISH_STYLES = `
  .pocket-receipt { width:min(100%,420px); min-height:52px; padding:10px 12px; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; border-radius:18px; border:1px solid color-mix(in srgb,var(--lumiverse-text,#fff) 12%,transparent); box-shadow:none; background:#222027; backdrop-filter:none; opacity:1; }
  button.pocket-receipt:hover { background:color-mix(in srgb,var(--lumiverse-fill,#17151d) 85%,var(--lumiverse-primary,#8b7dff)); }
  .pocket-receipt-kind { padding:7px; border-radius:10px; background:color-mix(in srgb,var(--lumiverse-primary,#8b7dff) 22%,transparent); font-size:9px; font-weight:750; }
  .pocket-receipt-copy strong { font-size:11px; font-weight:650; }
  .pocket-receipt-copy { display:grid; gap:3px; }
  .pocket-receipt-copy span { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; white-space:normal; font-size:12px; line-height:1.35; opacity:.8; }
  .pocket-receipt-arrow { font-size:11px; opacity:.4; }
  .pocket-receipt-details { margin:0 2px; font-size:9px; opacity:.42; order:3; }
  .pocket-receipt-details summary { width:max-content; cursor:pointer; }
  .pocket-receipt-details > span { display:block; margin-top:3px; max-width:460px; line-height:1.35; }
@media (prefers-reduced-motion:reduce) { .pocket-inline-artifact { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
${pocket_inline_redesign_default}
`;
var INLINE_STYLES = INLINE_BASE_STYLES + INLINE_FINISH_STYLES;

// src/frontend/components/activity-shadow.ts
var sheets = new WeakMap;
var ISOLATED_STYLES = `
:host {
  all: initial !important;
  display: block !important;
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  color-scheme: dark;
}
:host::before, :host::after { content: none !important; display: none !important; }
${INLINE_STYLES}
`;
function isolatedActivity(content) {
  const island = document.createElement("pocket-inline-ui");
  island.dataset.pocketShadow = "true";
  const root = island.attachShadow({ mode: "open" });
  const doc = island.ownerDocument;
  const Sheet = doc.defaultView?.CSSStyleSheet;
  if (Sheet && "replaceSync" in Sheet.prototype && "adoptedStyleSheets" in root) {
    let sheet = sheets.get(doc);
    if (!sheet) {
      sheet = new Sheet;
      sheet.replaceSync(ISOLATED_STYLES);
      sheets.set(doc, sheet);
    }
    root.adoptedStyleSheets = [sheet];
  } else {
    const style = doc.createElement("style");
    style.textContent = ISOLATED_STYLES;
    root.append(style);
  }
  root.append(content);
  return island;
}

// src/frontend/components/activity-connectors.ts
function refreshActivityConnectors(entries, open) {
  const byHost = new Map(entries.map((entry) => [entry.host, entry]));
  const visited = new Set;
  for (const entry of entries) {
    if (visited.has(entry.host))
      continue;
    const group = [entry];
    const key = connectorKey(entry);
    if (key) {
      let previous = adjacent(entry.host, "previousSibling");
      while (previous && byHost.has(previous) && connectorKey(byHost.get(previous)) === key) {
        group.unshift(byHost.get(previous));
        previous = adjacent(previous, "previousSibling");
      }
      let next = adjacent(entry.host, "nextSibling");
      while (next && byHost.has(next) && connectorKey(byHost.get(next)) === key) {
        group.push(byHost.get(next));
        next = adjacent(next, "nextSibling");
      }
    }
    const leader = group[0];
    for (const item of group) {
      visited.add(item.host);
      item.host.setAttribute("data-pocket-connector", "true");
    }
    const cache = JSON.stringify(group.map((item) => [item.activity, item.options, item.owner]));
    leader.host.removeAttribute("hidden");
    if (leader.host.getAttribute("data-pocket-connector-render") !== cache) {
      leader.host.replaceChildren(isolatedActivity(connector(group, open)));
      leader.host.setAttribute("data-pocket-connector-render", cache);
    }
    for (const item of group.slice(1)) {
      item.host.replaceChildren();
      item.host.setAttribute("hidden", "");
      item.host.removeAttribute("data-pocket-connector-render");
    }
  }
}
function adjacent(host, direction) {
  let node = host[direction];
  while (node && (node.nodeType === 8 || node.nodeType === 3 && !node.textContent?.trim()))
    node = node[direction];
  return node?.nodeType === 1 ? node : null;
}
function connectorKey(entry) {
  const { activity } = entry;
  if (!entry.owner || activity.kind !== "message" || activity.route.app !== "messages")
    return "";
  const conversation = activity.route.conversationId || activity.source?.conversationId;
  return conversation ? JSON.stringify([activity.scope.chatId, activity.scope.characterId, activity.source?.messageId, conversation, entry.owner]) : "";
}
function connector(group, open) {
  const first = group[0];
  const frame = document.createElement("div");
  frame.className = "pocket-inline-frame";
  frame.dataset.pocketUi = "true";
  frame.dataset.appearance = "connector";
  for (const [token, value] of [["accent", first.options.accent], ["text", first.options.textColor], ["surface", first.options.surfaceColor]]) {
    if (value)
      frame.style.setProperty(`--pocket-inline-${token}`, value);
  }
  const section = document.createElement("section");
  section.className = "pocket-connector";
  const heading = document.createElement("button");
  heading.type = "button";
  heading.className = "pocket-connector-heading";
  heading.textContent = first.activity.presentation?.conversationTitle || first.activity.title || "Messages";
  heading.setAttribute("aria-label", `Open ${heading.textContent} in Pocket`);
  heading.addEventListener("click", () => open(group.at(-1).activity));
  section.append(heading);
  for (const { activity } of group) {
    const batch = activity.presentation?.batchMessages;
    const messages = batch?.length ? batch : [{ senderName: activity.presentation?.senderName || activity.title, senderActorId: activity.presentation?.senderActorId, direction: activity.presentation?.kind === "sent" ? "sent" : "received", text: activity.summary || "", messageId: "" }];
    for (const message of messages) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "pocket-connector-row";
      row.dataset.direction = message.direction;
      row.dataset.pocketConnectorActivity = activity.id;
      const sender = document.createElement("span");
      sender.className = "pocket-connector-sender";
      sender.textContent = activity.kind === "call" ? "Call" : message.senderName;
      const body = document.createElement("span");
      body.className = "pocket-connector-copy";
      body.textContent = message.text;
      row.append(sender, body);
      row.setAttribute("aria-label", `Open ${message.senderName}'s ${activity.kind === "call" ? "call" : "message"} in Pocket`);
      row.addEventListener("click", () => open(message.messageId && activity.route.app === "messages" ? { ...activity, route: { ...activity.route, messageId: message.messageId } } : activity));
      section.append(row);
    }
  }
  frame.append(section);
  return frame;
}

// src/frontend/activity.ts
function frameArtifact(artifact, activity, options) {
  const frame = document.createElement("div");
  frame.className = "pocket-inline-frame";
  frame.dataset.pocketUi = "true";
  frame.dataset.appearance = options.appearance || "cards";
  frame.dataset.kind = activity.presentation?.kind || activity.kind;
  if (options.accent)
    frame.style.setProperty("--pocket-inline-accent", options.accent);
  if (options.background)
    frame.style.setProperty("--pocket-inline-bg", options.background);
  if (options.backgroundSize)
    frame.style.backgroundSize = options.backgroundSize;
  if (options.backgroundPosition)
    frame.style.backgroundPosition = options.backgroundPosition;
  if (options.textColor)
    frame.style.setProperty("--pocket-inline-text", options.textColor);
  if (options.surfaceColor)
    frame.style.setProperty("--pocket-inline-surface", options.surfaceColor);
  frame.append(artifact);
  return frame;
}
function avatar2(name, url) {
  const icon = document.createElement("span");
  icon.className = "pocket-inline-avatar";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = name.slice(0, 1).toUpperCase();
  if (url) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = "";
    icon.replaceChildren(image);
  }
  return icon;
}
var ICONS = {
  message: "Pocket",
  "tracker-change": "Tracker",
  timeline: "Timeline",
  note: "Journal",
  contact: "Contact",
  image: "Photo",
  weather: "Weather",
  system: "Pocket",
  call: "Call"
};
function presentationLabel(activity) {
  switch (activity.presentation?.kind) {
    case "sent":
      return "Sent";
    case "received":
      return "Received";
    case "observed":
      return "Observed";
    case "referenced":
      return "Referenced";
    case "batch":
      return "Chat";
    default:
      return ICONS[activity.kind];
  }
}
function actorLine(activity) {
  const presentation = activity.presentation;
  if (!presentation)
    return "";
  const sender = presentation.senderName || "";
  const recipients = presentation.recipientNames?.filter(Boolean).join(", ") || "";
  if (sender && recipients)
    return `${sender} → ${recipients}`;
  return sender || recipients || presentation.conversationTitle || "";
}
function recipientLine(activity) {
  const presentation = activity.presentation;
  if (!presentation)
    return "";
  const recipients = presentation.recipientNames?.filter(Boolean) || [];
  if (recipients.length === 1)
    return recipients[0];
  if (recipients.length > 1)
    return presentation.conversationTitle || recipients.join(", ");
  return presentation.conversationTitle || "";
}
function observedDeviceLine(activity) {
  const recipient = recipientLine(activity);
  return recipient ? `${recipient}'s phone` : "Another phone";
}
function messageChrome(stateText = "", appName = "Messages") {
  const chrome = document.createElement("span");
  chrome.className = "pocket-inline-artifact-chrome";
  const app = document.createElement("span");
  app.className = "pocket-inline-artifact-app";
  app.textContent = appName;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "1.8");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", appName === "Phone" ? "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" : "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z");
  icon.append(path);
  app.prepend(icon);
  const state = document.createElement("span");
  state.className = "pocket-inline-artifact-state";
  state.textContent = stateText;
  chrome.append(app, state);
  return chrome;
}
function buildBatchArtifact(activity, openRoute, options) {
  const presentation = activity.presentation;
  if (presentation?.kind !== "batch" || !presentation.batchMessages?.length)
    return null;
  const primary = document.createElement("button");
  primary.type = "button";
  primary.className = "pocket-inline-artifact pocket-inline-chat-transcript";
  primary.dataset.kind = "batch";
  const header = document.createElement("span");
  header.className = "pocket-inline-transcript-header";
  header.appendChild(messageChrome(`${presentation.batchMessages.length} messages`));
  const title = document.createElement("strong");
  title.className = "pocket-inline-transcript-title";
  title.textContent = presentation.conversationTitle || activity.title || "Group chat";
  header.appendChild(title);
  primary.appendChild(header);
  const transcript = document.createElement("span");
  transcript.className = "pocket-inline-transcript";
  const visible = presentation.batchMessages;
  for (const [index, item] of visible.entries()) {
    const row = document.createElement("span");
    row.className = "pocket-inline-transcript-row";
    row.dataset.direction = item.direction;
    const previous = visible[index - 1];
    row.dataset.continuation = String(Boolean(previous && (previous.senderActorId || previous.senderName) === (item.senderActorId || item.senderName)));
    row.hidden = index >= 3;
    const content = document.createElement("span");
    content.className = "pocket-inline-transcript-content";
    const sender = document.createElement("strong");
    sender.className = "pocket-inline-transcript-sender";
    sender.textContent = item.senderName;
    const bubble = document.createElement("span");
    bubble.className = "pocket-inline-transcript-bubble";
    bubble.textContent = `${item.format === "voice" ? "▶ Voice message · " : ""}${item.text}`;
    content.append(sender, bubble);
    row.append(avatar2(item.senderName, options.avatars?.[item.senderActorId || ""]), content);
    transcript.appendChild(row);
  }
  primary.appendChild(transcript);
  primary.setAttribute("aria-label", `Open ${presentation.conversationTitle || activity.title || "group chat"} in Pocket`);
  primary.addEventListener("click", () => openRoute(activity.route));
  const group = document.createElement("div");
  group.className = "pocket-inline-batch";
  group.append(primary);
  if (visible.length > 3) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "pocket-inline-transcript-more";
    more.setAttribute("aria-expanded", "false");
    const collapsed = `Show ${visible.length - 3} more messages`;
    more.textContent = collapsed;
    more.addEventListener("click", () => {
      const expanded = more.getAttribute("aria-expanded") !== "true";
      more.setAttribute("aria-expanded", String(expanded));
      more.textContent = expanded ? "Show fewer messages" : collapsed;
      for (const [index, row] of [...transcript.children].entries())
        row.hidden = !expanded && index >= 3;
    });
    group.append(more);
  }
  return frameArtifact(group, activity, options);
}
function buildMessageArtifact(activity, openRoute, options) {
  const presentation = activity.presentation;
  if (!presentation || !["sent", "received", "observed"].includes(presentation.kind))
    return null;
  const primary = document.createElement("button");
  primary.type = "button";
  primary.className = "pocket-inline-artifact";
  primary.dataset.kind = presentation.kind;
  const copy = document.createElement("span");
  copy.className = "pocket-inline-artifact-copy";
  copy.textContent = `${activity.presentation?.format === "voice" ? "▶ Voice message · " : ""}${activity.summary || ""}`;
  if (presentation.call) {
    primary.classList.add("pocket-inline-call");
    primary.dataset.callStatus = presentation.call.status;
    const identity = document.createElement("span");
    identity.className = "pocket-inline-call-identity";
    identity.append(avatar2(presentation.senderName || "Call", options.avatarUrl));
    const details = document.createElement("span");
    details.className = "pocket-inline-call-details";
    details.append(messageChrome("", "Phone"));
    const name = document.createElement("strong");
    name.className = "pocket-inline-artifact-actors";
    name.textContent = actorLine(activity) || activity.title;
    const status = document.createElement("span");
    status.className = "pocket-inline-artifact-copy";
    status.textContent = callSummary(presentation.call);
    details.append(name, status);
    identity.append(details);
    primary.append(identity, callSymbol());
  } else if (presentation.kind === "sent") {
    const header = document.createElement("span");
    header.className = "pocket-inline-artifact-header";
    const recipient = document.createElement("span");
    recipient.className = "pocket-inline-artifact-recipient";
    const recipientName = recipientLine(activity);
    recipient.textContent = recipientName ? `To ${recipientName}` : "Sent message";
    header.append(messageChrome("sent"), recipient);
    const bubble = document.createElement("span");
    bubble.className = "pocket-inline-chat-bubble";
    bubble.append(copy);
    primary.append(header, bubble);
  } else {
    if (presentation.kind === "observed") {
      const device = document.createElement("span");
      device.className = "pocket-inline-artifact-device";
      device.textContent = observedDeviceLine(activity);
      primary.appendChild(device);
    }
    primary.appendChild(messageChrome(presentation.storyAt?.slice(11, 16) || ""));
    const body = document.createElement("span");
    body.className = "pocket-inline-message-body";
    body.append(avatar2(presentation.senderName || "Messages", options.avatarUrl));
    const content = document.createElement("span");
    content.className = "pocket-inline-message-content";
    const sender = document.createElement("strong");
    sender.className = "pocket-inline-artifact-actors";
    sender.textContent = presentation.senderName || presentation.conversationTitle || activity.title;
    content.append(sender, copy);
    body.append(content);
    primary.append(body);
  }
  primary.setAttribute("aria-label", `Open ${presentation.kind === "observed" ? `${observedDeviceLine(activity)} · ` : ""}${presentation.conversationTitle || activity.title} in Pocket`);
  primary.addEventListener("click", () => openRoute(activity.route));
  return frameArtifact(primary, activity, options);
}
function buildActivityStack(activity, openRoute, options = {}) {
  const stack = document.createElement("span");
  stack.className = "pocket-artifact-stack";
  stack.dataset.pocketUi = "true";
  if (options.includeArtifact !== false) {
    const artifact = options.appearance === "phone" ? buildPhoneScreen(activity, openRoute, options) : buildBatchArtifact(activity, openRoute, options) || buildMessageArtifact(activity, openRoute, options);
    if (artifact)
      stack.appendChild(artifact);
  }
  if (options.includeReceipt !== false) {
    const receipt = document.createElement("button");
    receipt.type = "button";
    receipt.className = "pocket-receipt";
    const label = document.createElement("span");
    label.className = "pocket-receipt-kind";
    label.textContent = ICONS[activity.kind];
    const copy = document.createElement("span");
    copy.className = "pocket-receipt-copy";
    const title = document.createElement("strong");
    const conversation = activity.presentation?.conversationTitle || activity.title;
    title.textContent = conversation ? `${presentationLabel(activity)} · ${conversation}` : presentationLabel(activity);
    copy.appendChild(title);
    if (activity.summary) {
      const summary = document.createElement("span");
      summary.textContent = activity.summary;
      copy.append(summary);
    }
    const arrow = document.createElement("span");
    arrow.className = "pocket-receipt-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "›";
    receipt.append(label, copy, arrow);
    if (receipt instanceof HTMLButtonElement) {
      receipt.setAttribute("aria-label", `Open ${activity.presentation?.conversationTitle || activity.title} in Pocket`);
      receipt.addEventListener("click", () => openRoute(activity.route));
    }
    stack.appendChild(receipt);
    const detail = actorLine(activity) || activity.summary;
    if (detail) {
      const details = document.createElement("details");
      details.className = "pocket-receipt-details";
      const toggle = document.createElement("summary");
      toggle.textContent = "Provenance";
      const summary = document.createElement("span");
      summary.textContent = detail;
      details.append(toggle, summary);
      stack.appendChild(details);
    }
  }
  return stack;
}
function renderActivityHost(host, activity, openRoute, options = {}) {
  host.setAttribute("data-pocket-host", "true");
  host.replaceChildren(isolatedActivity(buildActivityStack(activity, openRoute, options)));
  return host;
}
function activityReceipt(ctx, activity, openRoute, options = {}) {
  const messageId = activity.source?.messageId;
  if (!messageId)
    return null;
  const bubble = ctx.dom.findMessageElement(messageId);
  if (!bubble)
    return null;
  const wrapper = ctx.dom.inject(bubble, '<span class="pocket-receipt-host"></span>', "beforeend");
  wrapper.classList.add("pocket-receipt-host");
  wrapper.setAttribute("data-pocket-activity-id", activity.id);
  const communication = activity.kind === "message" || activity.kind === "call";
  if (communication) {
    wrapper.setAttribute("data-pocket-host", "true");
    refreshActivityConnectors([{ host: wrapper, activity, options, owner: "" }], (entry) => openRoute(entry.route));
    return wrapper;
  }
  return renderActivityHost(wrapper, activity, openRoute, { ...options, includeArtifact: false, includeReceipt: true });
}

// src/frontend/components/avatar-crop.ts
function avatarCropRect(width, height, focus) {
  if (!(width > 0 && height > 0))
    throw new Error("The photo has no usable dimensions.");
  const position = normalizeAvatarFocus(focus);
  const size = Math.min(width, height);
  return { x: (width - size) * position.x / 100, y: (height - size) * position.y / 100, size };
}
async function cropAvatarPhoto(url, focus) {
  const image = new Image;
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  const crop = avatarCropRect(image.naturalWidth, image.naturalHeight, focus);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(512, crop.size);
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Avatar framing is unavailable in this browser.");
  context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

// src/frontend/components/app-review-control.ts
function renderAppReviewControl(host, task, label, type) {
  const panel = el("section", "lp-app-review");
  const scope = JSON.stringify([host.chatId, host.characterId]);
  const operation = [...host.operations.values()].reverse().find((entry) => entry.task === task && host.scopes.get(entry.requestId) === scope);
  const busy = operation && !["complete", "error"].includes(operation.phase);
  const action = button(busy ? "Working…" : label, "lp-button lp-button-quiet");
  action.disabled = Boolean(busy) || !host.canGenerate;
  action.dataset.operationIdle = label;
  if (busy)
    action.dataset.operationAction = operation.requestId;
  action.addEventListener("click", () => {
    for (const [key, entry] of host.operations)
      if (entry.task === task)
        host.operations.delete(key);
    const operationRequestId = host.send(type, {});
    host.scopes.set(operationRequestId, scope);
    if (host.scopes.size > 100)
      host.scopes.delete(host.scopes.keys().next().value);
    host.progress({ task, requestId: operationRequestId, phase: "request", message: "Starting…" });
    host.render();
  });
  panel.append(action);
  if (busy) {
    const stop = button("Stop", "lp-button lp-button-quiet");
    stop.dataset.operationStop = operation.requestId;
    stop.addEventListener("click", () => {
      host.send("lumiphone:cancel_app_review", { operationRequestId: operation.requestId });
      host.progress({ ...operation, phase: "error", message: "Stopped. Your saved data is unchanged." });
    });
    panel.append(stop);
  }
  if (operation) {
    const status = el("div", "lp-operation-progress");
    const message = el("span", "", operation.message);
    message.dataset.operationMessage = "true";
    status.append(message);
    status.dataset.operationRequest = operation.requestId;
    status.dataset.phase = operation.phase;
    status.setAttribute("role", "status");
    panel.append(status);
  }
  return panel;
}

// src/frontend/components/device-picker.ts
var GLYPHS = {
  phone: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M10 18h4"/>',
  message: '<path d="M20 11a8 8 0 0 1-8 8H4l1-4a8 8 0 1 1 15-4Z"/>',
  call: '<path d="m5 3 4 1 1 5-2 2a15 15 0 0 0 5 5l2-2 5 1 1 4c-7 4-22-11-16-16Z"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>'
};
function glyph(kind) {
  const node = el("span", "lumiphone-device-glyph");
  node.setAttribute("aria-hidden", "true");
  node.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[kind]}</svg>`;
  return node;
}
function renderDevicePicker(state, selected, deviceKey, select) {
  const personaId = pocketPersonaActorId(state);
  const ids = new Set([personaId]);
  for (const conversation of state.conversations)
    for (const id of conversationDeviceActorIds(state, conversation))
      ids.add(id);
  const latestByDevice = latestDeviceInteractions(state);
  const entries = [...ids].map((actorId) => ({ actorId, actor: resolvePocketActor(state, actorId), latest: latestByDevice.get(actorId) || null })).filter((entry) => entry.actor);
  const list = el("div", "lumiphone-device-list");
  const section = (title, kind) => {
    const group = el("section", "lumiphone-device-section");
    group.dataset.section = kind;
    group.append(el("h3", "lumiphone-device-section-title", title));
    list.append(group);
    return group;
  };
  const addRow = (entry, group, compact = false) => {
    const { actorId, actor, latest } = entry;
    if (!actor)
      return;
    const isPersona = actorId === personaId;
    const row = button("", "lumiphone-device-row");
    row.dataset.selected = String(actorId === selected);
    row.dataset.recent = String(Boolean(latest) && !isPersona && !compact);
    row.dataset.persona = String(isPersona);
    row.dataset.pocketDeviceOwner = actorId;
    row.dataset.pocketDeviceKey = deviceKey(actorId);
    row.setAttribute("aria-label", `${isPersona || !latest ? "Open" : "Last interaction on"} ${actor.name}'s phone${actorId === selected ? ", current device" : ""}`);
    row.setAttribute("aria-pressed", String(actorId === selected));
    const avatar = el("span", "lumiphone-device-avatar", actor.name.trim().slice(0, 1).toUpperCase() || "?");
    if (actor.avatarUrl) {
      const image = el("img");
      image.src = actor.avatarUrl;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => image.remove(), { once: true });
      avatar.append(image);
    }
    const identity = el("span", "lumiphone-device-identity");
    identity.append(el("strong", "", actor.name), el("span", "lumiphone-device-role", isPersona ? "Roleplay Persona" : actor.role || "Pocket actor"));
    const meta = el("span", "lumiphone-device-meta");
    if (isPersona) {
      row.classList.add("lumiphone-device-rp");
      const status = el("span", "lumiphone-device-current", actorId === selected ? "Current" : "Open phone");
      status.prepend(glyph("phone"));
      meta.append(status);
      const messages = state.conversations.reduce((sum, conversation) => sum + conversationUnreadForDevice(state, conversation, actorId), 0);
      const notifications = state.notifications.filter((entry) => !entry.read && !entry.dismissedAt && notificationBelongsToDevice(state, actorId, entry.deviceOwnerActorId)).length;
      const unread = Math.max(messages, notifications);
      if (unread) {
        const badge = el("span", "lumiphone-device-unread", unread > 99 ? "99+" : String(unread));
        badge.setAttribute("aria-label", `${unread} unread`);
        meta.append(badge);
      }
    } else {
      if (latest && !compact) {
        const preview = latest.message.call ? `Call ${latest.message.call.status}` : latest.message.text || (latest.message.imageId || latest.message.imageUrl ? "Photo" : "Message");
        const line = el("span", "lumiphone-device-preview");
        line.append(glyph(latest.message.call ? "call" : "message"), el("span", "", preview));
        identity.append(line);
        row.title = `${conversationTitleForDevice(state, latest.conversation, actorId)}: ${preview}`;
        if (Number.isFinite(Date.parse(latest.message.createdAt))) {
          const time = el("time", "lumiphone-device-time", formatDate(latest.message.createdAt));
          time.dateTime = latest.message.createdAt;
          time.title = formatDate(latest.message.createdAt, true);
          meta.append(time);
        }
      }
      if (actorId === selected)
        meta.append(el("span", "lumiphone-device-current", "Viewing"));
      else
        meta.append(glyph("chevron"));
    }
    row.append(avatar, identity, meta);
    row.addEventListener("click", () => select(actorId, !isPersona && latest ? { app: "messages", conversationId: latest.conversation.id, messageId: latest.message.id, view: "thread" } : undefined));
    group.append(row);
  };
  const own = entries.find((entry) => entry.actorId === personaId);
  if (own)
    addRow(own, section("Your phone", "persona"));
  const recent = entries.filter((entry) => entry.actorId !== personaId && entry.latest).sort((a, b) => (Date.parse(b.latest.message.createdAt) || 0) - (Date.parse(a.latest.message.createdAt) || 0)).slice(0, 6);
  if (recent.length) {
    const group = section("Recent", "recent");
    for (const entry of recent)
      addRow(entry, group);
  }
  const recentIds = new Set(recent.map((entry) => entry.actorId));
  const others = entries.filter((entry) => entry.actorId !== personaId && !recentIds.has(entry.actorId));
  if (others.length) {
    const group = section("Others", "others");
    for (const entry of others)
      addRow(entry, group, true);
  }
  if (entries.length > 9) {
    const search = el("input", "lumiphone-device-search");
    search.type = "search";
    search.placeholder = "Find a phone";
    search.setAttribute("aria-label", "Find a Pocket device");
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase();
      for (const row of list.querySelectorAll(".lumiphone-device-row"))
        row.hidden = !row.textContent?.toLocaleLowerCase().includes(query);
      for (const group of list.querySelectorAll("section"))
        group.hidden = !group.querySelector(".lumiphone-device-row:not([hidden])");
    });
    list.prepend(search);
  }
  return list;
}

// src/frontend/controller.ts
var PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.7" y="2.5" width="10.6" height="19" rx="2.6"/><path d="M10 5h4M10.7 18.7h2.6"/></svg>';
var EMPTY_RESOLVED_IMAGE = { url: "", status: "empty", sourceKind: "none", sourceLabel: "Theme gradient" };
function pocketDeviceKey(chatId, characterId, deviceOwnerActorId) {
  return [chatId || "_none", characterId || "_none", deviceOwnerActorId || "_unassigned"].map((value) => encodeURIComponent(value)).join("::");
}
function pocketSurfaceId() {
  return requestId("pocket_surface").replace(/[^a-zA-Z0-9_-]/g, "_");
}
var APP_META = [
  { app: "mochi", label: "Mochi", icon: "sparkle" },
  { app: "messages", label: "Messages", icon: "messages", dock: true },
  { app: "camera", label: "Camera", icon: "camera", dock: true },
  { app: "gallery", label: "Gallery", icon: "gallery", dock: true },
  { app: "notes", label: "Notes", icon: "notes", dock: true },
  { app: "weather", label: "Weather", icon: "weather" },
  { app: "contacts", label: "Contacts", icon: "contacts" },
  { app: "calendar", label: "Timeline", icon: "calendar" },
  { app: "trackers", label: "Trackers", icon: "trackers" },
  { app: "settings", label: "Settings", icon: "settings" }
];
function icon2(name) {
  const node = el("span");
  node.innerHTML = POCKET_ICONS[name] || POCKET_ICONS.home;
  return node;
}
function iconButton(name, label) {
  const node = button("", "lp-button lp-button-icon");
  node.setAttribute("aria-label", label);
  node.appendChild(icon2(name));
  return node;
}

class PocketController {
  voicePlayer = new VoiceMessagePlayer;
  ctx;
  surfaceId = pocketSurfaceId();
  cleanups = [];
  drawer;
  dockPanel = null;
  dockVisibilityCleanup = null;
  widget = null;
  mobileWidget = null;
  widgetRoot = null;
  handsetHost;
  launcher;
  launcherBadge;
  shell;
  screen;
  alert;
  clock;
  expanded = false;
  currentApp = "home";
  dismissMochiNotification;
  mochi = new MochiView((payload) => this.ctx.sendToBackend(payload), () => {
    if (this.currentApp === "mochi")
      this.render(false);
  }, (roomId) => this.openPocket({ app: "mochi", roomId }), () => ({ enabled: this.preferences.notifyMessages, previews: this.preferences.notificationPreviews, visible: this.expanded && this.currentApp === "mochi" && !document.hidden }), (n) => this.showMochiNotification(n), (notices, rooms) => reconcileMochiNotifications(this.shell, notices, rooms));
  state = null;
  preferences = defaultPreferences();
  settingsDraft = null;
  settingsSaveTimer = 0;
  activePersona = null;
  caps = null;
  swarmProfile = null;
  generation = null;
  resolvedWallpapers = {
    deviceHome: { ...EMPTY_RESOLVED_IMAGE },
    deviceChat: { ...EMPTY_RESOLVED_IMAGE },
    personaHome: { ...EMPTY_RESOLVED_IMAGE },
    personaChat: { ...EMPTY_RESOLVED_IMAGE }
  };
  contextPreview = null;
  personaPreview = null;
  operations = new Map;
  router = new PocketRouteHistory;
  gallery = { data: [], total: 0 };
  galleryScope = "chat";
  galleryRequestId = "";
  galleryLoading = false;
  galleryActionButtons = new Map;
  pendingWallpaperTarget = null;
  pendingContactPhotoId = "";
  pendingContactPhotoDraft = null;
  selectedContactId = "";
  selectedContactView = "list";
  selectedContactGroupId = "";
  npcBankGroups = [];
  collectionDrafts = new Map;
  collectionRequest = "";
  collectionRequestKey = "";
  npcBriefs = new Map;
  contactFormDrafts = new Map;
  npcDraft = null;
  previousNpcDraft = null;
  selectedConversationId = "";
  deviceOwnerActorId = "";
  syncIndicator;
  syncIndicatorTimer = 0;
  selectedConversationView = "thread";
  groupDrafts = new Map;
  groupSaveRequest = "";
  groupSaveDraftKey = "";
  trackerDrafts = new Map;
  trackerSaveRequest = "";
  trackerMutationRequest = "";
  trackerJevRequest = "";
  jevWorking = false;
  jevKeyConfigured = false;
  trackerSaveDraftKey = "";
  cameraDraft = { scene: "", enhance: undefined };
  selectedMessageId = "";
  selectedNoteId = "";
  selectedEventId = "";
  pendingEventSuggestion = null;
  selectedTrackerId = "";
  selectedGalleryImageId = "";
  selectedSettingsSection = "";
  selectedTrackerView = "detail";
  cameraPreview = "";
  cameraContactId = "";
  cameraReady = false;
  cameraImageId = "";
  cameraOptions = { purpose: "scene", aspect: "", connectionId: "", model: "" };
  imageConnections = [];
  pendingAvatarDraft = null;
  cameraFocus = { x: 50, y: 50 };
  cameraNpcDraft = null;
  cameraProgress = "";
  cameraBusy = false;
  cameraRequestId = "";
  messageRequests = new Map;
  messageDrafts = new Map;
  groupSpeakerSelections = new Map;
  manualMessageOverrides = new Set;
  focusedHandoffRelays = new Set;
  contactSources = [];
  npcBank = [];
  identityProfiles = [];
  appReviewScopes = new Map;
  contactSourcesRequested = false;
  lastTagKeys = new Set;
  tagKeyOrder = [];
  destroyed = false;
  collapseTimer = 0;
  alertTimer = 0;
  launcherFocus = null;
  suppressLauncherClick = false;
  launcherPointer = null;
  pendingRoute = null;
  injectedActivities = new Map;
  pendingActivities = new Map;
  knownActivities = new Map;
  provisionalActivities = new Map;
  inlineArtifactObserver = null;
  inlineMountFrame = 0;
  viewCleanups = [];
  receiptSweepTimer = 0;
  notificationTimer = 0;
  notificationIsland;
  customStyle;
  setupModalOpen = false;
  setupModalBody = null;
  setupModalDismiss = null;
  setupPersonaEditing = false;
  setupControlCleanups = [];
  settledOperationRequests = new Set;
  composerReferencePill = null;
  composerSyncFrame = 0;
  lastComposerReferenceId = "";
  constructor(ctx) {
    this.ctx = ctx;
    this.drawer = ctx.ui.registerDrawerTab({
      id: "lumiphone",
      title: "Pocket",
      shortName: "Pocket",
      headerTitle: "Pocket",
      description: "Open the character-aware roleplay phone",
      keywords: ["phone", "messages", "camera", "gallery", "journal", "calendar", "timeline", "tracker"],
      iconSvg: PHONE_ICON
    });
    this.launcher = el("button", "lumiphone-launcher");
    this.launcher.type = "button";
    this.launcher.title = "Open Pocket";
    this.launcher.setAttribute("aria-label", "Open Pocket");
    const launcherPhone = el("span", "lumiphone-launcher-phone");
    launcherPhone.setAttribute("aria-hidden", "true");
    const launcherScreen = el("span", "lumiphone-launcher-screen");
    for (let index = 0;index < 4; index++)
      launcherScreen.append(el("i"));
    launcherPhone.append(launcherScreen);
    this.launcher.append(launcherPhone);
    this.launcherBadge = el("span", "lumiphone-badge");
    this.launcherBadge.hidden = true;
    this.launcher.appendChild(this.launcherBadge);
    this.handsetHost = el("div", "lumiphone-widget-root lumiphone-handset-host");
    this.shell = el("div", "lumiphone-shell");
    this.shell.hidden = true;
    const status = el("div", "lumiphone-statusbar");
    const dismiss = iconButton("back", "Dismiss phone");
    dismiss.className = "lumiphone-dismiss";
    dismiss.addEventListener("click", () => this.close());
    this.clock = el("span", "lumiphone-time", formatTime(new Date));
    const island = button("", "lumiphone-island");
    island.setAttribute("aria-label", "Open Notification Center");
    island.addEventListener("click", () => this.openPocket({ app: "notifications" }));
    this.notificationIsland = island;
    const signals = el("span", "lumiphone-signals");
    const bars = el("span", "lumiphone-signal-bars");
    for (let i = 0;i < 4; i += 1)
      bars.appendChild(el("i"));
    signals.append(bars, el("span", "", "5G"), el("span", "lumiphone-battery"));
    const statusLeading = el("div", "lumiphone-status-leading");
    statusLeading.append(dismiss, this.clock);
    status.append(statusLeading, island, signals);
    this.screen = el("main", "lumiphone-screen");
    this.alert = el("div", "lp-alert");
    this.alert.hidden = true;
    this.syncIndicator = el("div", "lumiphone-sync-indicator");
    this.syncIndicator.hidden = true;
    const homebar = el("div", "lumiphone-homebar");
    const homeButton = button("");
    homeButton.setAttribute("aria-label", "Home or dismiss phone");
    homebar.appendChild(homeButton);
    this.customStyle = document.createElement("style");
    this.customStyle.dataset.pocketCustomCss = "true";
    this.shell.append(status, this.syncIndicator, this.screen, homebar, this.alert, this.customStyle);
    this.syncSurfaceIdentity();
    this.launcher.addEventListener("pointerdown", (event) => {
      this.launcherPointer = { x: event.clientX, y: event.clientY };
    });
    this.launcher.addEventListener("pointermove", (event) => {
      if (!this.launcherPointer)
        return;
      if (Math.hypot(event.clientX - this.launcherPointer.x, event.clientY - this.launcherPointer.y) > 7)
        this.suppressLauncherClick = true;
    });
    this.launcher.addEventListener("pointerup", () => {
      this.launcherPointer = null;
    });
    this.launcher.addEventListener("pointercancel", () => {
      this.launcherPointer = null;
    });
    this.launcher.addEventListener("click", (event) => {
      if (this.suppressLauncherClick) {
        event.preventDefault();
        this.suppressLauncherClick = false;
        return;
      }
      this.open();
    });
    homeButton.addEventListener("click", () => {
      if (this.currentApp !== "home")
        this.home();
      else
        this.close();
    });
    this.installSwipeDismiss(status);
    this.installNotificationPull(status);
    this.renderDrawerLanding();
    this.installHostIntegrations();
    this.tickClock();
    this.refresh();
  }
  destroy() {
    this.dismissMochiNotification?.();
    this.mochi.destroy();
    this.voicePlayer.stop();
    this.setupModalDismiss?.();
    this.destroyed = true;
    window.clearTimeout(this.collapseTimer);
    window.clearTimeout(this.alertTimer);
    window.clearInterval(this.receiptSweepTimer);
    window.clearTimeout(this.notificationTimer);
    window.clearTimeout(this.syncIndicatorTimer);
    window.clearTimeout(this.settingsSaveTimer);
    if (this.inlineMountFrame)
      cancelAnimationFrame(this.inlineMountFrame);
    this.inlineArtifactObserver?.disconnect();
    this.inlineArtifactObserver = null;
    for (const cleanup of this.cleanups.splice(0)) {
      try {
        cleanup();
      } catch {}
    }
    this.widget?.destroy();
    this.mobileWidget?.destroy();
    this.releaseDockPanel();
    for (const injected of this.injectedActivities.values())
      this.ctx.dom.uninject(injected);
    this.injectedActivities.clear();
    for (const cleanup of this.viewCleanups.splice(0))
      cleanup();
    this.drawer.destroy();
  }
  installHostIntegrations() {
    this.cleanups.push(this.drawer.onActivate(() => this.renderDrawerLanding()));
    const action = this.ctx.ui.registerInputBarAction({
      id: "open-lumiphone",
      label: "Open Pocket",
      subtitle: "Open the character-aware roleplay phone",
      iconSvg: PHONE_ICON
    });
    this.cleanups.push(action.onClick(() => this.open()));
    this.cleanups.push(() => action.destroy());
    this.cleanups.push(this.ctx.messages.registerTagInterceptor({ tagName: "lumi-phone", removeFromMessage: true }, (payload) => {
      if (payload.isStreaming)
        return;
      const key = `${payload.messageId || ""}:${payload.fullMatch}`;
      if (this.lastTagKeys.has(key))
        return;
      this.lastTagKeys.add(key);
      this.tagKeyOrder.push(key);
      while (this.tagKeyOrder.length > 120) {
        const old = this.tagKeyOrder.shift();
        if (old)
          this.lastTagKeys.delete(old);
      }
      const active = this.ctx.getActiveChat();
      this.ctx.sendToBackend({
        type: "lumiphone:model_action",
        requestId: requestId("tag"),
        chatId: payload.chatId || active.chatId,
        characterId: active.characterId,
        attrs: payload.attrs,
        content: payload.content,
        messageId: payload.messageId,
        fullMatch: payload.fullMatch,
        idempotencyKey: `tag:${payload.messageId || ""}:${payload.fullMatch}`
      });
    }));
    this.cleanups.push(this.ctx.messages.registerTagInterceptor({ tagName: "pocket-artifact", removeFromMessage: true }, () => {}));
    this.cleanups.push(this.ctx.messages.registerTagInterceptor({ tagName: "pocket-commit", removeFromMessage: true }, () => {}));
    this.installInlineArtifactObserver();
    this.cleanups.push(this.ctx.onBackendMessage((payload) => this.onBackend(payload)));
    this.cleanups.push(this.ctx.events.on("CHAT_SWITCHED", () => {
      this.setupModalDismiss?.();
      this.settledOperationRequests.clear();
      this.operations.clear();
      this.personaPreview = null;
      this.clearActivitySurfaces(true, true);
      this.hideComposerReferencePill();
      this.refresh();
      window.setTimeout(() => this.sweepActivityReceipts(), 0);
    }));
    const returned = (event) => {
      const detail = event.detail;
      if (detail?.extensionId === "lumiphone")
        this.refresh();
    };
    window.addEventListener("spindle:desktop-widget-returned", returned);
    this.cleanups.push(() => window.removeEventListener("spindle:desktop-widget-returned", returned));
    const resize = () => {
      if (this.expanded)
        this.resizeExpanded();
    };
    window.addEventListener("resize", resize);
    this.cleanups.push(() => window.removeEventListener("resize", resize));
    const scaleObserver = new MutationObserver(resize);
    scaleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    scaleObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    this.cleanups.push(() => scaleObserver.disconnect());
    window.visualViewport?.addEventListener("resize", resize);
    this.cleanups.push(() => window.visualViewport?.removeEventListener("resize", resize));
    window.visualViewport?.addEventListener("scroll", resize);
    this.cleanups.push(() => window.visualViewport?.removeEventListener("scroll", resize));
    const focusin = (event) => {
      if (!this.expanded || this.handsetHost.dataset.fullscreen !== "true")
        return;
      this.resizeExpanded();
      const target = event.target instanceof HTMLElement ? event.target : null;
      window.setTimeout(() => {
        this.resizeExpanded();
        target?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }, 60);
    };
    this.shell.addEventListener("focusin", focusin);
    this.cleanups.push(() => this.shell.removeEventListener("focusin", focusin));
    const keydown = (event) => {
      if (!this.expanded)
        return;
      if (event.key === "Escape") {
        if (this.currentApp !== "home")
          this.back();
        else
          this.close();
        return;
      }
      if (event.key !== "Tab")
        return;
      const focusable = [...this.shell.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter((node) => !node.hidden && node.getClientRects().length > 0);
      if (!focusable.length)
        return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    this.cleanups.push(() => window.removeEventListener("keydown", keydown));
    this.installComposerReferenceBridge();
    this.ensureWidget();
  }
  async ensureWidget() {
    if (this.widget)
      return;
    try {
      const granted = await this.ctx.permissions.getGranted();
      if (!granted.includes("ui_panels"))
        return;
      if (this.destroyed)
        return;
      this.widget = this.ctx.ui.createFloatWidget({
        width: 58,
        height: 58,
        initialPosition: { x: Math.max(12, window.innerWidth - 82), y: Math.max(58, window.innerHeight * 0.22) },
        snapToEdge: true,
        tooltip: "Pocket",
        chromeless: true,
        resizable: false,
        aspectLock: PHONE_ASPECT,
        persistGeometry: false
      });
      this.widgetRoot = el("div", "lumiphone-widget-root");
      this.widget.root.appendChild(this.widgetRoot);
      this.widgetRoot.append(this.launcher);
      this.cleanups.push(this.widget.onDragEnd(() => {
        this.suppressLauncherClick = true;
        window.setTimeout(() => {
          this.suppressLauncherClick = false;
        }, 180);
      }));
      this.launcher.hidden = false;
      this.renderDrawerLanding();
    } catch {
      this.widget = null;
      this.mountPhoneInDrawer();
    }
  }
  renderDrawerLanding() {
    this.drawer.root.replaceChildren();
    const outer = el("div", "lumiphone-drawer lumiphone-device-drawer");
    const card = el("div", "lumiphone-device-switcher");
    const logo = el("div", "lumiphone-device-mark");
    logo.innerHTML = PHONE_ICON;
    const title = el("h2", "lumiphone-device-title", "Pocket devices");
    const copy = el("p", "lumiphone-device-copy", "Switch devices without changing your roleplay Persona.");
    const header = el("div", "lumiphone-device-heading");
    header.append(logo, title);
    card.append(header, copy);
    if (this.state) {
      const personaId = pocketPersonaActorId(this.state);
      const selected = this.currentDeviceOwnerActorId() || personaId;
      const list = renderDevicePicker(this.state, selected, (actorId) => pocketDeviceKey(this.state.chatId, this.state.characterId, actorId), (actorId, route) => {
        if (this.cameraBusy)
          this.send("lumiphone:camera_cancel", { requestId: this.cameraRequestId });
        this.cameraRequestId = "";
        this.cameraBusy = false;
        this.cameraReady = false;
        this.cameraPreview = "";
        this.cameraContactId = "";
        this.cameraNpcDraft = null;
        this.deviceOwnerActorId = actorId;
        this.syncSurfaceIdentity();
        this.selectedConversationId = "";
        this.selectedMessageId = "";
        this.currentApp = "home";
        this.mochi.leave();
        this.router.reset({ app: "home" });
        this.updateBadge();
        this.renderDrawerLanding();
        this.announceView();
        if (this.widget)
          this.open();
        else
          this.mountPhoneInDrawer();
        if (route)
          this.openPocket(route);
      });
      card.appendChild(list);
    } else {
      card.appendChild(el("p", "lumiphone-drawer-copy", "Pocket is still loading this chat."));
    }
    const actions = el("div", "lumiphone-device-footer");
    const permission = button("Manage access", "lumiphone-device-access");
    permission.addEventListener("click", () => this.requestPermissions());
    actions.append(permission);
    const restore = button("Show launcher", "lumiphone-device-access");
    restore.addEventListener("click", async () => {
      await this.ensureWidget();
      this.widget?.setVisible(true);
      if (!this.expanded)
        this.launcher.hidden = false;
    });
    actions.append(restore);
    if (this.state && !this.state.setup.initialized) {
      const resume = button("Set up Pocket", "lumiphone-device-access");
      resume.addEventListener("click", () => this.showFirstChatSetup(true));
      actions.append(resume);
    }
    card.appendChild(actions);
    outer.appendChild(card);
    this.drawer.root.appendChild(outer);
  }
  ensureDockPanel() {
    if (this.dockPanel)
      return this.dockPanel;
    try {
      this.dockPanel = this.ctx.ui.requestDockPanel({
        edge: "right",
        title: "Pocket",
        size: desktopDockSize(this.preferences.handsetScale),
        minSize: 292,
        maxSize: 620,
        resizable: false,
        startCollapsed: true,
        chromeless: true,
        centerContent: true
      });
      this.dockVisibilityCleanup = this.dockPanel.onVisibilityChange((visible) => {
        if (!visible && this.expanded && !calculatePhoneSurface(this.preferences.handsetScale).fullscreen) {
          this.expanded = false;
          this.shell.hidden = true;
          this.launcher.hidden = false;
        }
      });
      return this.dockPanel;
    } catch {
      this.dockPanel = null;
      return null;
    }
  }
  releaseDockPanel() {
    try {
      this.dockVisibilityCleanup?.();
    } catch {}
    this.dockVisibilityCleanup = null;
    try {
      this.dockPanel?.destroy();
    } catch {}
    this.dockPanel = null;
  }
  ensureMobileWidget() {
    if (this.mobileWidget)
      return this.mobileWidget;
    try {
      const viewport = currentViewport();
      this.mobileWidget = this.ctx.ui.createFloatWidget({
        width: viewport.width,
        height: viewport.height,
        initialPosition: { x: 0, y: 0 },
        fullscreen: true,
        chromeless: true,
        snapToEdge: false,
        persistGeometry: false,
        touchScrollMode: resolvePocketTouchScrollMode(this.preferences.nativeTouchScrollMode)
      });
      applyPocketTouchScroll(this.mobileWidget, this.preferences.nativeTouchScrollMode);
      this.mobileWidget.setVisible(false);
      return this.mobileWidget;
    } catch {
      this.mobileWidget = null;
      return null;
    }
  }
  mountInteractiveSurface() {
    const geometry = calculatePhoneSurface(this.preferences.handsetScale);
    if (geometry.fullscreen) {
      this.releaseDockPanel();
      const mobile = this.ensureMobileWidget();
      if (!mobile)
        return false;
      if (this.handsetHost.parentElement !== mobile.root)
        mobile.root.replaceChildren(this.handsetHost);
      if (this.shell.parentElement !== this.handsetHost)
        this.handsetHost.replaceChildren(this.shell);
      this.handsetHost.dataset.fullscreen = "true";
      applyMobilePhoneSurface(mobile, 1);
      applyVisualViewportSurface(this.handsetHost, (pixels) => {
        if (this.ctx.ui.geometry)
          return this.ctx.ui.geometry.toLayoutPx(pixels);
        const scale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lumiverse-ui-scale"));
        return pixels / (Number.isFinite(scale) && scale > 0 ? scale : 1);
      });
      if (!mobile.isVisible())
        mobile.setVisible(true);
      return true;
    }
    if (this.mobileWidget) {
      this.mobileWidget.setFullscreen(false);
      this.mobileWidget.setVisible(false);
    }
    const panel = this.ensureDockPanel();
    if (!panel)
      return false;
    if (this.handsetHost.parentElement !== panel.root)
      panel.root.replaceChildren(this.handsetHost);
    if (this.shell.parentElement !== this.handsetHost)
      this.handsetHost.replaceChildren(this.shell);
    this.handsetHost.dataset.fullscreen = "false";
    clearVisualViewportSurface(this.handsetHost);
    if ("setSize" in panel && typeof panel.setSize === "function") {
      panel.setSize(desktopDockSize(this.preferences.handsetScale));
    }
    panel.expand();
    const desktop = calculatePhoneSurface(this.preferences.handsetScale, currentViewport(), false);
    this.handsetHost.style.width = `${desktop.width}px`;
    this.handsetHost.style.height = `${desktop.height}px`;
    return true;
  }
  mountPhoneInDrawer() {
    if (this.widget && (this.dockPanel || this.mobileWidget))
      return;
    this.drawer.root.replaceChildren();
    const host = this.handsetHost;
    const viewport = currentViewport();
    const geometry = calculatePhoneSurface(this.preferences.handsetScale, { width: Math.min(viewport.width, 620), height: Math.max(320, viewport.height - 130) }, false);
    host.style.width = geometry.fullscreen ? "100%" : `${geometry.width}px`;
    host.style.height = geometry.fullscreen ? "calc(100dvh - 110px)" : `${geometry.height}px`;
    host.style.aspectRatio = String(PHONE_ASPECT);
    host.dataset.fullscreen = "false";
    this.drawer.root.appendChild(host);
    host.replaceChildren(this.shell);
    this.launcher.hidden = true;
    this.shell.hidden = false;
    this.expanded = true;
    this.render(true);
  }
  async requestPermissions() {
    try {
      await this.ctx.permissions.request([
        "ui_panels",
        "chats",
        "chat_mutation",
        "characters",
        "personas",
        "generation",
        "tools",
        "interceptor",
        "images",
        "image_gen",
        "push_notification"
      ], { reason: "Pocket uses these permissions for its launcher and handset, per-chat character state, generated text messages, user-requested scene contact sync, model actions, gallery, camera, and optional push notifications." });
      await this.ensureWidget();
      this.refresh();
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
    }
  }
  installSwipeDismiss(target) {
    let startX = 0;
    let startY = 0;
    let active = false;
    target.addEventListener("pointerdown", (event) => {
      if (event.target?.closest("button,input,select,textarea,a"))
        return;
      startX = event.clientX;
      startY = event.clientY;
      active = true;
    });
    target.addEventListener("pointerup", (event) => {
      if (!active)
        return;
      active = false;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const dismissLeft = dx < -64 && Math.abs(dx) > Math.abs(dy) * 1.35;
      const dismissUp = dy < -64 && Math.abs(dy) > Math.abs(dx) * 1.35;
      if (dismissLeft || dismissUp)
        this.close();
    });
    target.addEventListener("pointercancel", () => {
      active = false;
    });
  }
  installNotificationPull(target) {
    let startY = 0;
    let active = false;
    target.addEventListener("pointerdown", (event) => {
      if (event.target?.closest("button,input,select,textarea,a"))
        return;
      startY = event.clientY;
      active = true;
    });
    target.addEventListener("pointerup", (event) => {
      if (!active)
        return;
      active = false;
      if (event.clientY - startY > 52)
        this.openPocket({ app: "notifications" });
    });
    target.addEventListener("pointercancel", () => {
      active = false;
    });
  }
  tickClock() {
    const timer = window.setInterval(() => {
      this.clock.textContent = formatTime(new Date);
    }, 30000);
    this.cleanups.push(() => window.clearInterval(timer));
  }
  activeContext() {
    const active = this.ctx.getActiveChat();
    return {
      chatId: active.chatId || this.state?.chatId || null,
      characterId: active.characterId || this.state?.characterId || null
    };
  }
  currentDeviceOwnerActorId() {
    if (!this.state)
      return this.deviceOwnerActorId;
    return this.deviceOwnerActorId || pocketPersonaActorId(this.state);
  }
  deviceIdentity() {
    const context = this.activeContext();
    const chatId = String(this.state?.chatId || context.chatId || "_lobby");
    const characterId = String(this.state?.characterId || context.characterId || "_none");
    const deviceOwnerActorId = this.currentDeviceOwnerActorId() || "_unassigned";
    const personaActorId = this.state ? pocketPersonaActorId(this.state) : "";
    const role = personaActorId && deviceOwnerActorId === personaActorId ? "persona" : "actor";
    return {
      key: pocketDeviceKey(chatId, characterId, deviceOwnerActorId),
      chatId,
      characterId,
      deviceOwnerActorId,
      role,
      inspection: role !== "persona",
      surfaceId: this.surfaceId
    };
  }
  syncSurfaceIdentity() {
    const identity = this.deviceIdentity();
    for (const node of [this.shell, this.handsetHost]) {
      node.dataset.pocketSurface = identity.surfaceId;
      node.dataset.pocketDeviceKey = identity.key;
      node.dataset.pocketChatId = identity.chatId;
      node.dataset.pocketCharacterId = identity.characterId;
      node.dataset.pocketDeviceOwner = identity.deviceOwnerActorId;
      node.dataset.pocketDeviceRole = identity.role;
      node.dataset.pocketInspection = String(identity.inspection);
    }
    return identity;
  }
  send(type, payload = {}) {
    const context = this.activeContext();
    const id = String(payload.requestId || requestId());
    if (type === "lumiphone:generate_pocket_persona")
      this.operations.set(id, { task: "persona-profile", requestId: id, phase: "generating", message: "Enriching phone profile…" });
    if (type === "lumiphone:cancel_persona_generation") {
      const operation = this.operations.get(String(payload.operationRequestId || ""));
      if (operation)
        this.recordOperationProgress({ ...operation, phase: "error", message: "Enrichment stopped. You can retry whenever you’re ready." });
    }
    this.ctx.sendToBackend({ type, requestId: id, chatId: context.chatId, characterId: context.characterId, deviceOwnerActorId: this.currentDeviceOwnerActorId(), ...payload });
    return id;
  }
  refresh() {
    this.send("lumiphone:get_state");
  }
  announceView() {
    this.send("lumiphone:view_state", { open: this.expanded, route: this.router.current });
  }
  activeComposerReference() {
    if (!this.state)
      return null;
    const active = this.ctx.getActiveChat();
    if (active.chatId && this.state.chatId !== active.chatId)
      return null;
    if (active.characterId && this.state.characterId !== active.characterId)
      return null;
    return [...this.state.references || []].reverse().find((reference) => reference.status === "armed" || reference.status === "injected" || reference.status === "failed") || null;
  }
  findHostComposerAboveMount() {
    const candidates = [...document.querySelectorAll('[data-spindle-mount="chat_composer_above"]')].filter((node) => !node.closest(".lumiphone-widget-root,.lumiphone-drawer"));
    const active = this.ctx.getActiveChat();
    if (active.chatId) {
      const expectedScope = `chat:${active.chatId}:composer-above`;
      const exact = candidates.find((node) => node.dataset.spindleScope === expectedScope);
      if (exact)
        return exact;
    }
    return candidates.find((node) => node.isConnected) || candidates[0] || null;
  }
  installComposerReferenceBridge() {
    if (typeof MutationObserver === "undefined" || typeof window.requestAnimationFrame !== "function")
      return;
    const pill = el("div", "pocket-composer-reference");
    pill.hidden = true;
    pill.setAttribute("role", "group");
    pill.setAttribute("aria-label", "Attached Pocket reference");
    const open = button("", "pocket-composer-reference-open");
    open.type = "button";
    open.title = "Open attached Pocket reference";
    const mark = el("span", "pocket-composer-reference-mark");
    mark.innerHTML = PHONE_ICON;
    const copy = el("span", "pocket-composer-reference-copy");
    const meta = el("span", "pocket-composer-reference-meta");
    const source = el("span", "pocket-composer-reference-source", "Pocket attached");
    const separator = el("span", "pocket-composer-reference-separator", "·");
    const conversation = el("span", "pocket-composer-reference-conversation");
    const count = el("span", "pocket-composer-reference-count");
    count.hidden = true;
    const preview = el("span", "pocket-composer-reference-preview");
    meta.append(source, separator, conversation, count);
    copy.append(meta, preview);
    open.append(mark, copy);
    const clear = button("×", "pocket-composer-reference-clear");
    clear.type = "button";
    clear.title = "Clear Pocket reference";
    clear.setAttribute("aria-label", "Clear Pocket reference");
    pill.append(open, clear);
    this.composerReferencePill = pill;
    open.addEventListener("click", () => {
      const reference = this.activeComposerReference();
      if (!reference)
        return;
      const messageId = reference.messages.at(-1)?.messageId;
      this.openPocket({ app: "messages", conversationId: reference.conversationId, messageId });
    });
    clear.addEventListener("click", (event) => {
      event.stopPropagation();
      const reference = this.activeComposerReference();
      if (!reference || reference.status === "injected")
        return;
      this.send("lumiphone:cancel_reference", { referenceId: reference.id });
    });
    const schedule = () => this.scheduleComposerReferenceSync();
    const mutationObserver = new MutationObserver(() => {
      const mount = this.findHostComposerAboveMount();
      if (!pill.isConnected || mount && pill.parentElement !== mount)
        schedule();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    this.cleanups.push(() => {
      mutationObserver.disconnect();
      if (this.composerSyncFrame)
        window.cancelAnimationFrame(this.composerSyncFrame);
      this.composerSyncFrame = 0;
      pill.remove();
      if (this.composerReferencePill === pill)
        this.composerReferencePill = null;
    });
    schedule();
  }
  scheduleComposerReferenceSync() {
    if (this.destroyed || this.composerSyncFrame)
      return;
    this.composerSyncFrame = window.requestAnimationFrame(() => {
      this.composerSyncFrame = 0;
      this.syncComposerReferencePill();
    });
  }
  hideComposerReferencePill() {
    if (!this.composerReferencePill)
      return;
    this.composerReferencePill.hidden = true;
    this.lastComposerReferenceId = "";
  }
  syncComposerReferencePill() {
    const pill = this.composerReferencePill;
    if (!pill)
      return;
    const reference = this.activeComposerReference();
    const mount = this.findHostComposerAboveMount();
    if (!reference || !mount || !mount.isConnected) {
      this.hideComposerReferencePill();
      return;
    }
    if (pill.parentElement !== mount)
      mount.appendChild(pill);
    const status = pill.querySelector(".pocket-composer-reference-source");
    const conversation = pill.querySelector(".pocket-composer-reference-conversation");
    const count = pill.querySelector(".pocket-composer-reference-count");
    const preview = pill.querySelector(".pocket-composer-reference-preview");
    const open = pill.querySelector(".pocket-composer-reference-open");
    const clear = pill.querySelector(".pocket-composer-reference-clear");
    const message = reference.messages.at(-1);
    const messageText = message?.text?.replace(/\s+/g, " ").trim() || "";
    const conversationTitle = reference.conversationTitle || (reference.conversationKind === "group" ? "Group chat" : "Conversation");
    const fallback = `${reference.messages.length} message${reference.messages.length === 1 ? "" : "s"}`;
    const statusLabel = reference.status === "injected" ? "Pocket applying" : reference.status === "failed" ? "Pocket attach failed" : "Pocket attached";
    if (status)
      status.textContent = statusLabel;
    if (conversation)
      conversation.textContent = conversationTitle;
    if (count) {
      const messageCount = reference.messages.length;
      count.hidden = messageCount <= 1;
      count.textContent = messageCount > 1 ? `${messageCount} msgs` : "";
      count.title = messageCount > 1 ? `${messageCount} Pocket messages attached` : "";
      count.setAttribute("aria-label", count.title || "One Pocket message attached");
    }
    if (preview) {
      if (messageText) {
        const speaker = reference.conversationKind === "group" && message?.senderName ? `${message.senderName} — ` : "";
        preview.textContent = `${speaker}“${messageText}”`;
      } else {
        preview.textContent = fallback;
      }
    }
    if (open)
      open.setAttribute("aria-label", `Open attached Pocket reference from ${conversationTitle}`);
    if (clear) {
      clear.hidden = reference.status === "injected";
      clear.disabled = reference.status === "injected";
    }
    pill.dataset.status = reference.status;
    pill.style.setProperty("--pocket-reference-accent", this.preferences.colors.accent);
    pill.hidden = false;
    if (this.lastComposerReferenceId !== reference.id && !this.preferences.reducedMotion) {
      pill.animate([
        { opacity: 0.25, transform: "translateY(3px) scale(.995)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ], { duration: 170, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
    this.lastComposerReferenceId = reference.id;
  }
  onBackend(payload) {
    if (this.mochi.receive(payload))
      return;
    if (!payload || typeof payload !== "object" || typeof payload.type !== "string")
      return;
    if (payload.type === "lumiphone:state" && payload.state) {
      const active = this.ctx.getActiveChat();
      if (active.chatId && payload.state.chatId !== active.chatId)
        return;
      if (active.characterId && payload.state.characterId !== active.characterId)
        return;
      const previousUnread = this.unreadCount();
      if (payload.reason === "host_swipe")
        this.clearActivitySurfaces(true);
      if (this.state && (this.state.chatId !== payload.state.chatId || this.state.characterId !== payload.state.characterId)) {
        this.trackerMutationRequest = "";
        this.trackerJevRequest = "";
        this.jevWorking = false;
        this.collectionRequest = "";
        this.cameraDraft = { scene: "", enhance: undefined };
        this.cameraPreview = "";
        this.cameraProgress = "";
        this.cameraBusy = false;
        this.cameraRequestId = "";
        this.cameraContactId = "";
        this.cameraReady = false;
        this.cameraImageId = "";
        this.cameraNpcDraft = null;
        this.cameraOptions = { purpose: "scene", aspect: "", connectionId: "", model: "" };
        this.cameraFocus = { x: 50, y: 50 };
        this.npcDraft = null;
        this.previousNpcDraft = null;
      }
      this.state = payload.state;
      const personaDeviceId = pocketPersonaActorId(this.state);
      const availableDeviceIds = new Set([personaDeviceId, ...this.state.conversations.flatMap((conversation) => conversationDeviceActorIds(this.state, conversation))]);
      if (!this.deviceOwnerActorId || !availableDeviceIds.has(this.deviceOwnerActorId))
        this.deviceOwnerActorId = personaDeviceId;
      this.syncSurfaceIdentity();
      this.npcBank = Array.isArray(payload.npcBank?.entries) ? payload.npcBank.entries : [];
      this.identityProfiles = Array.isArray(payload.identityProfiles) ? payload.identityProfiles : [];
      this.npcBankGroups = Array.isArray(payload.npcBank?.groups) ? payload.npcBank.groups : [];
      for (const conversationId of this.manualMessageOverrides) {
        const conversation = this.state.conversations.find((entry) => entry.id === conversationId);
        if (!conversation || conversation.availability.state !== "local")
          this.manualMessageOverrides.delete(conversationId);
      }
      this.jevKeyConfigured = payload.jevKeyConfigured === true;
      const nextPreferences = normalizePreferences(payload.preferences || this.preferences);
      if (nextPreferences.notifyMessages !== this.preferences.notifyMessages || nextPreferences.notificationPreviews !== this.preferences.notificationPreviews)
        this.dismissMochiNotification?.();
      this.preferences = nextPreferences;
      applyPocketTouchScroll(this.mobileWidget, this.preferences.nativeTouchScrollMode);
      if (payload.reason === "import" || payload.reason === "reset_preferences" || payload.reason === "preferences")
        this.settingsDraft = structuredClone(this.preferences);
      this.caps = payload.capabilities || this.caps;
      this.swarmProfile = payload.swarmProfile || this.swarmProfile;
      this.generation = payload.generation || this.generation;
      if (payload.resolvedWallpapers)
        this.resolvedWallpapers = payload.resolvedWallpapers;
      if ("activePersona" in payload)
        this.activePersona = payload.activePersona || null;
      if (this.setupModalOpen && this.setupModalBody) {
        if (this.state.setup.initialized)
          this.setupModalDismiss?.();
        else if (!this.setupPersonaEditing)
          this.renderFirstChatSetupBody();
      }
      this.knownActivities.clear();
      for (const activity of this.state.activities || []) {
        this.knownActivities.set(activity.id, activity);
        this.provisionalActivities.delete(activity.id);
      }
      this.pruneInactiveActivitySurfaces();
      this.mountInlineArtifacts();
      for (const activity of this.state.activities || [])
        this.queueActivityReceipt(activity);
      this.applyAppearance();
      this.syncComposerReferencePill();
      this.updateBadge();
      this.renderDrawerLanding();
      this.announceView();
      if (payload.open)
        this.open();
      const pending = this.pendingRoute;
      this.pendingRoute = null;
      if (pending)
        this.openPocket(pending);
      else if (this.expanded && this.currentApp === "settings")
        this.updateSettingsDiagnostics();
      else if (this.expanded && payload.reason !== "identity_profile_saved")
        this.render(false);
      if (this.unreadCount() > previousUnread && !this.expanded)
        this.launcher.animate([
          { transform: "scale(1)" },
          { transform: "scale(1.13) rotate(-4deg)" },
          { transform: "scale(1)" }
        ], { duration: 420, easing: "ease-out" });
      return;
    }
    if (payload.type === "lumiphone:jev_status") {
      const context = this.activeContext();
      if (payload.chatId !== context.chatId || payload.characterId !== context.characterId)
        return;
      this.jevWorking = payload.status === "working";
      if (!this.jevWorking)
        this.trackerJevRequest = "";
      if (this.currentApp === "trackers")
        this.render(false);
      this.showFeedback(String(payload.message || "Tracker evaluation updated."), payload.status === "error");
      return;
    }
    if (payload.type === "lumiphone:reconciliation_status") {
      if (!this.preferences.showReconciliationStatus)
        return;
      window.clearTimeout(this.syncIndicatorTimer);
      const status = String(payload.status || "");
      this.syncIndicator.dataset.status = status;
      if (status === "working") {
        this.syncIndicator.textContent = "Pocket syncing…";
        this.syncIndicator.title = "Pocket is reconciling roleplay state.";
        this.syncIndicator.hidden = false;
        this.launcher.dataset.sync = "working";
      } else if (status === "complete") {
        const domains = Array.isArray(payload.domains) ? payload.domains.filter(Boolean).join(", ") : "";
        this.syncIndicator.textContent = domains ? `Synced · ${domains}` : "Pocket synced";
        this.syncIndicator.title = domains ? `Pocket synced: ${domains}` : "Pocket synced.";
        this.syncIndicator.hidden = false;
        this.launcher.dataset.sync = "complete";
        this.syncIndicatorTimer = window.setTimeout(() => {
          this.syncIndicator.hidden = true;
          delete this.launcher.dataset.sync;
        }, 1800);
      } else {
        const detail = payload.error ? String(payload.error).slice(0, 240) : "";
        this.syncIndicator.textContent = "Pocket sync issue";
        this.syncIndicator.title = detail || "Pocket could not reconcile roleplay state.";
        this.syncIndicator.hidden = false;
        this.launcher.dataset.sync = "error";
        this.syncIndicatorTimer = window.setTimeout(() => {
          this.syncIndicator.hidden = true;
          delete this.launcher.dataset.sync;
        }, 5000);
      }
      return;
    }
    if (payload.type === "lumiphone:debug_prompt") {
      this.showOutgoingPromptResult(payload);
      return;
    }
    if (payload.type === "lumiphone:provisional_activity" && payload.activity && payload.origin) {
      const activity = payload.activity;
      const origin = payload.origin;
      const active = this.activeContext();
      if (activity.scope.chatId !== active.chatId || activity.scope.characterId !== active.characterId || origin.chatId !== active.chatId)
        return;
      this.provisionalActivities.set(activity.id, { activity, origin });
      this.mountInlineArtifacts();
      return;
    }
    if (payload.type === "lumiphone:candidate_activity_discard" && Array.isArray(payload.activityIds)) {
      for (const rawId of payload.activityIds) {
        const activityId = typeof rawId === "string" ? rawId : "";
        if (!activityId)
          continue;
        this.provisionalActivities.delete(activityId);
        if (this.knownActivities.has(activityId))
          continue;
        for (const host of this.inlineHosts(activityId)) {
          host.replaceChildren();
          host.hidden = true;
          delete host.dataset.pocketMounted;
          delete host.dataset.pocketActivityId;
        }
        const fallback = this.injectedActivities.get(activityId);
        if (fallback) {
          this.ctx.dom.uninject(fallback);
          this.injectedActivities.delete(activityId);
        }
        this.pendingActivities.delete(activityId);
      }
      return;
    }
    if (payload.type === "lumiphone:activity" && payload.activity) {
      this.knownActivities.set(payload.activity.id, payload.activity);
      this.queueActivityReceipt(payload.activity);
      return;
    }
    if (payload.type === "lumiphone:notification" && payload.notification) {
      this.showIncomingNotification(payload.notification);
      return;
    }
    if (payload.type === "lumiphone:generation_status" && payload.run) {
      const history = (this.generation?.history || this.preferences.generationHistory || []).filter((entry) => entry.requestId !== payload.run.requestId);
      history.push(payload.run);
      this.preferences.generationHistory = history.slice(-24);
      if (this.generation)
        this.generation.history = this.preferences.generationHistory;
      if (this.currentApp === "settings")
        this.updateSettingsDiagnostics();
      if (this.setupModalOpen && this.setupModalBody && !this.setupPersonaEditing)
        this.renderFirstChatSetupBody();
      return;
    }
    if (payload.type === "lumiphone:context_preview" && payload.diagnostics) {
      this.contextPreview = payload.diagnostics;
      if (this.currentApp === "settings")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:action_done" && payload.requestId === this.trackerMutationRequest) {
      this.trackerMutationRequest = "";
      if (this.currentApp === "trackers")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:action_done" && payload.result?.trackerId && payload.requestId === this.trackerSaveRequest) {
      this.trackerDrafts.delete(this.trackerSaveDraftKey);
      this.trackerSaveRequest = "";
      if (this.currentApp === "trackers" && this.selectedTrackerView === "config")
        this.openPocket(this.router.settle({ app: "trackers", trackerId: String(payload.result.trackerId), view: "detail" }), false);
      return;
    }
    if (payload.type === "lumiphone:pocket_persona_preview" && payload.persona) {
      if (this.settledOperationRequests.has(payload.requestId))
        return;
      this.personaPreview = payload.persona;
      if (this.setupModalOpen && this.setupPersonaEditing)
        this.renderFirstChatPersonaEditor();
      else if (this.currentApp === "settings")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:identity_profile_saved") {
      refreshIdentityProfileControls(this.screen, this.identityProfiles);
      if (this.setupModalBody)
        refreshIdentityProfileControls(this.setupModalBody, this.identityProfiles);
      return;
    }
    if (payload.type === "lumiphone:identity_profile_applied") {
      this.personaPreview = null;
      if (this.setupModalOpen)
        this.setupPersonaEditing ? this.renderFirstChatPersonaEditor() : this.renderFirstChatSetupBody();
      else if (this.expanded)
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:pocket_persona_saved") {
      this.personaPreview = null;
      if (this.setupModalOpen && this.setupPersonaEditing) {
        this.setupPersonaEditing = false;
        this.renderFirstChatSetupBody();
      }
      return;
    }
    if (payload.type === "lumiphone:operation_progress" && payload.requestId) {
      const operation = {
        task: payload.task,
        requestId: payload.requestId,
        phase: payload.phase,
        message: payload.message || "Working…"
      };
      this.recordOperationProgress(operation);
      return;
    }
    if (payload.type === "lumiphone:capabilities") {
      this.caps = payload.capabilities;
      if (!this.caps?.panels && this.widget) {
        try {
          this.widget.destroy();
        } catch {}
        this.widget = null;
        this.widgetRoot = null;
        this.expanded = false;
        this.renderDrawerLanding();
      } else {
        this.ensureWidget();
      }
      if (this.currentApp === "settings")
        this.updateSettingsDiagnostics();
      return;
    }
    if (payload.type === "lumiphone:collection_done") {
      if (payload.requestId === this.collectionRequest) {
        this.collectionRequest = "";
        this.collectionDrafts.delete(this.collectionRequestKey);
        this.openPocket(this.router.settle({ app: "contacts", view: payload.view || "groups" }), false);
      }
      this.showFeedback(payload.message || "Contacts updated.");
      return;
    }
    if (payload.type === "lumiphone:gallery") {
      if (payload.scope && payload.scope !== this.galleryScope)
        return;
      if (payload.requestId && payload.requestId !== this.galleryRequestId)
        return;
      this.galleryLoading = false;
      this.gallery = { data: payload.data || [], total: Number(payload.total) || 0, offset: Number(payload.offset) || 0, limit: Number(payload.limit) || GALLERY_PAGE_SIZE };
      if (this.currentApp === "gallery")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:gallery_action_done" && payload.requestId) {
      const pending = this.galleryActionButtons.get(payload.requestId);
      if (pending) {
        pending.button.disabled = false;
        pending.button.textContent = "✓ Done";
        window.setTimeout(() => {
          pending.button.textContent = pending.idle;
        }, 1400);
        this.galleryActionButtons.delete(payload.requestId);
      }
      if (payload.action === "delete" && payload.imageId === this.selectedGalleryImageId)
        this.selectedGalleryImageId = "";
      this.showFeedback(payload.message || "Gallery action complete.");
      return;
    }
    if (payload.type === "lumiphone:contact_sources") {
      this.contactSources = Array.isArray(payload.sources) ? payload.sources : [];
      this.contactSourcesRequested = true;
      if (this.currentApp === "contacts")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:contact_draft" && payload.draft) {
      if (this.npcDraft)
        this.previousNpcDraft = structuredClone(this.npcDraft);
      this.npcDraft = structuredClone(payload.draft);
      if (this.currentApp === "contacts") {
        if (this.selectedContactView === "quick-gen")
          this.render(false);
        else
          this.openPocket({ app: "contacts", view: "import" }, false);
      }
      return;
    }
    if (payload.type === "lumiphone:reference_armed") {
      this.showFeedback("Conversation attached to your next roleplay turn.");
      return;
    }
    if (payload.type === "lumiphone:conversation_opened" && payload.conversationId) {
      if (payload.requestId === this.groupSaveRequest) {
        this.groupDrafts.delete(this.groupSaveDraftKey);
        this.groupSaveRequest = "";
        this.openPocket(this.router.settle({ app: "messages", conversationId: payload.conversationId, view: "thread" }), false);
      } else
        this.openPocket({ app: "messages", conversationId: payload.conversationId, view: "thread" });
      return;
    }
    if ((payload.type === "lumiphone:contact_created" || payload.type === "lumiphone:contact_saved") && payload.contactId) {
      for (const key of this.contactFormDrafts.keys())
        if (key.startsWith(`${this.state?.chatId}:${this.state?.characterId}:`))
          this.contactFormDrafts.delete(key);
      this.contactSourcesRequested = false;
      this.npcDraft = null;
      this.previousNpcDraft = null;
      const settled = this.router.settle({ app: "contacts", contactId: payload.contactId, view: "detail" });
      this.openPocket(settled, false);
      return;
    }
    if (payload.type === "lumiphone:discovered_actor_promoted" && payload.contactId) {
      this.openPocket({ app: "contacts", contactId: payload.contactId, view: "detail" }, false);
      return;
    }
    if (payload.type === "lumiphone:npc_bank_saved") {
      this.showFeedback(`${payload.name || "NPC"} saved to NPC Bank.`);
      return;
    }
    if (payload.type === "lumiphone:npc_bank_added" && payload.contactId) {
      if (payload.openConfig)
        this.openPocket({ app: "contacts", contactId: payload.contactId, view: "config" }, false);
      else
        this.showFeedback(`${payload.name || "NPC"} added to this roleplay.`);
      return;
    }
    if (payload.type === "lumiphone:npc_bank_deleted") {
      this.showFeedback(`${payload.name || "NPC"} removed from NPC Bank. Existing RP contacts were left untouched.`);
      return;
    }
    if (payload.type === "lumiphone:swarm_profile") {
      this.swarmProfile = payload.profile;
      if (this.currentApp === "settings")
        this.updateSettingsDiagnostics();
      else if (this.currentApp === "camera")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:camera_progress") {
      if (payload.requestId !== this.cameraRequestId)
        return;
      this.cameraBusy = true;
      this.cameraProgress = (payload.message || (payload.phase === "preview" ? "Preview developing…" : "Working…")) + (payload.totalSteps ? ` ${payload.step || 0}/${payload.totalSteps}` : "");
      if (payload.imageDataUrl)
        this.cameraPreview = payload.imageDataUrl;
      if (payload.profile)
        this.swarmProfile = payload.profile;
      if (this.currentApp === "camera")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:message_progress") {
      const active = this.activeContext();
      if (payload.chatId !== active.chatId || payload.characterId !== active.characterId)
        return;
      if (payload.phase === "done")
        this.messageRequests.delete(payload.requestId);
      else
        this.messageRequests.set(payload.requestId, { conversationId: payload.conversationId, speakerContactId: payload.speakerContactId || payload.contactId, phase: payload.phase === "checking" ? "checking" : "pending" });
      if (this.currentApp === "messages")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:avatar_uploaded") {
      const pending = this.pendingAvatarDraft;
      if (!pending || pending.requestId !== payload.requestId)
        return;
      this.pendingAvatarDraft = null;
      if (pending.draft && pending.draft === this.npcDraft) {
        pending.draft.avatarUrl = payload.imageUrl;
        pending.draft.avatarSource = { kind: "asset", assetId: payload.imageId };
        pending.draft.avatarFocus = { x: 50, y: 50 };
        if (this.currentApp === "camera" && this.cameraNpcDraft === pending.draft)
          this.back();
        else
          this.render(false);
      }
      return;
    }
    if (payload.type === "lumiphone:camera_done") {
      if (payload.requestId !== this.cameraRequestId)
        return;
      this.cameraBusy = false;
      this.cameraProgress = "Photo saved to Gallery";
      this.cameraPreview = payload.imageUrl || this.cameraPreview;
      this.cameraReady = Boolean(payload.imageUrl);
      this.cameraImageId = payload.imageId || "";
      if (payload.profile)
        this.swarmProfile = payload.profile;
      if (this.currentApp === "camera")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:image_options") {
      this.imageConnections = payload.connections || [];
      const imageSelect = this.screen.querySelector("[data-pocket-image-connection]");
      if (imageSelect) {
        const selected = imageSelect.value;
        imageSelect.replaceChildren(new Option("Follow Lumiverse", ""), ...this.imageConnections.map((entry) => new Option(entry.name, entry.id)));
        if (selected && !this.imageConnections.some((entry) => entry.id === selected))
          imageSelect.append(new Option("Saved connection", selected));
        imageSelect.value = selected;
      }
      if (this.currentApp === "camera")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:camera_cancelled") {
      if (payload.requestId !== this.cameraRequestId)
        return;
      this.cameraBusy = false;
      this.cameraProgress = "Cancelled";
      if (this.currentApp === "camera")
        this.render(false);
      return;
    }
    if (payload.type === "lumiphone:export_data" && payload.data) {
      const blob = new Blob([JSON.stringify(payload.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pocket-${this.state?.chatId || "backup"}.json`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      return;
    }
    if (payload.type === "lumiphone:error") {
      if (payload.requestId === this.galleryRequestId)
        this.galleryLoading = false;
      if (payload.requestId === this.trackerMutationRequest)
        this.trackerMutationRequest = "";
      if (payload.requestId === this.trackerJevRequest) {
        this.trackerJevRequest = "";
        this.jevWorking = false;
      }
      if (payload.requestId === this.collectionRequest)
        this.collectionRequest = "";
      if (payload.requestId === this.groupSaveRequest)
        this.groupSaveRequest = "";
      if (payload.requestId === this.trackerSaveRequest)
        this.trackerSaveRequest = "";
      if (payload.requestId === this.pendingAvatarDraft?.requestId)
        this.pendingAvatarDraft = null;
      if (payload.requestId === this.cameraRequestId) {
        this.cameraBusy = false;
        this.cameraReady = false;
        this.cameraProgress = payload.error || "Image generation failed. Try again.";
      }
      this.messageRequests.delete(payload.requestId);
      const operation = this.operations.get(payload.requestId);
      if (operation)
        this.recordOperationProgress({ ...operation, phase: "error", message: payload.error || "Operation failed" });
      const galleryAction = this.galleryActionButtons.get(payload.requestId);
      if (galleryAction) {
        galleryAction.button.disabled = false;
        galleryAction.button.textContent = galleryAction.idle;
        this.galleryActionButtons.delete(payload.requestId);
      }
      const identitySaveError = this.screen.querySelector('[data-identity-request="' + CSS.escape(payload.requestId) + '"]') || this.setupModalBody?.querySelector('[data-identity-request="' + CSS.escape(payload.requestId) + '"]');
      if (identitySaveError) {
        refreshIdentityProfileControls(this.screen, this.identityProfiles, true);
        if (this.setupModalBody)
          refreshIdentityProfileControls(this.setupModalBody, this.identityProfiles, true);
      }
      this.showError(payload.error || "Pocket could not complete that action.");
      if (this.expanded && !identitySaveError)
        this.render(false);
    }
  }
  unreadCount() {
    if (!this.state)
      return 0;
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state);
    const notifications = this.state.notifications.filter((item) => !item.read && !item.dismissedAt && notificationBelongsToDevice(this.state, owner, item.deviceOwnerActorId)).length;
    const messages = this.state.conversations.reduce((sum, conversation) => sum + conversationUnreadForDevice(this.state, conversation, owner), 0);
    return Math.min(999, Math.max(notifications, messages));
  }
  updateBadge() {
    const unread = this.unreadCount();
    this.launcherBadge.hidden = unread === 0;
    this.launcherBadge.textContent = unread > 99 ? "99+" : String(unread);
    this.drawer.setBadge(unread ? unread > 99 ? "99+" : String(unread) : null);
    const owner = this.state ? this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state) : "";
    const notificationUnread = this.state?.notifications.filter((entry) => !entry.read && !entry.dismissedAt && notificationBelongsToDevice(this.state, owner, entry.deviceOwnerActorId)).length || 0;
    this.notificationIsland.dataset.unread = String(notificationUnread > 0);
    this.notificationIsland.setAttribute("aria-label", notificationUnread ? `Open Notification Center, ${notificationUnread} unread` : "Open Notification Center");
  }
  recordOperationProgress(operation) {
    if (this.settledOperationRequests.has(operation.requestId))
      return;
    const terminal = operation.phase === "complete" || operation.phase === "error";
    if (terminal) {
      this.settledOperationRequests.add(operation.requestId);
      if (this.settledOperationRequests.size > 100)
        this.settledOperationRequests.delete(this.settledOperationRequests.values().next().value);
    }
    this.operations.set(operation.requestId, operation);
    const updated = this.updateOperationProgress(operation);
    if (this.currentApp === "contacts" && !updated)
      this.render(false);
    if (terminal)
      window.setTimeout(() => {
        if (this.operations.get(operation.requestId) !== operation)
          return;
        this.operations.delete(operation.requestId);
        if (operation.phase !== "error")
          this.updateOperationProgress(null, operation.requestId);
        if (this.currentApp === "contacts" || this.currentApp === "settings" && operation.task === "persona-profile")
          this.render(false);
        if (this.setupModalOpen && this.setupModalBody && !this.setupPersonaEditing)
          this.renderFirstChatSetupBody();
      }, operation.phase === "error" ? 1800 : 700);
  }
  updateOperationProgress(operation, requestId = operation?.requestId || "") {
    if (!requestId)
      return false;
    const selector = `[data-operation-request="${CSS.escape(requestId)}"]`;
    const node = this.screen.querySelector(selector) || this.setupModalBody?.querySelector(selector) || null;
    if (!node)
      return false;
    if (!operation) {
      node.remove();
      return true;
    }
    const label = node.querySelector("[data-operation-message]");
    if (label)
      label.textContent = operation.message;
    node.dataset.phase = operation.phase;
    if (operation.phase === "complete" || operation.phase === "error")
      node.querySelector(".lp-indeterminate")?.remove();
    const action = this.screen.querySelector(`[data-operation-action="${CSS.escape(requestId)}"]`) || this.setupModalBody?.querySelector(`[data-operation-action="${CSS.escape(requestId)}"]`);
    if (action && (operation.phase === "complete" || operation.phase === "error")) {
      action.disabled = false;
      action.textContent = action.dataset.operationIdle || (operation.phase === "error" ? "Retry enrichment" : "Enrich with LLM");
      delete action.dataset.operationAction;
      this.screen.querySelector(`[data-operation-stop="${CSS.escape(requestId)}"]`)?.remove();
      this.setupModalBody?.querySelector(`[data-operation-stop="${CSS.escape(requestId)}"]`)?.remove();
    }
    return true;
  }
  updateSettingsDiagnostics() {
    const keyStatus = this.screen.querySelector("[data-pocket-jev-key-status]");
    if (keyStatus)
      keyStatus.textContent = this.jevKeyConfigured ? "API key saved on the host." : "No TypeSafe API key saved.";
    const generationNode = this.screen.querySelector("[data-pocket-generation-diagnostic]");
    if (generationNode) {
      const run = [...this.generation?.history || this.preferences.generationHistory || []].reverse().find((entry) => entry.task === "connection-test");
      generationNode.dataset.status = run?.status || "idle";
      generationNode.textContent = !run ? "Not tested yet." : run.status === "started" ? "● Testing…" : run.status === "completed" ? `✓ Success · ${run.latencyMs ?? 0} ms · ${run.connectionName} / ${run.model}` : `Failed · ${run.error || "Unknown provider error"}`;
      const testButton = this.screen.querySelector("[data-pocket-generation-test]");
      if (testButton)
        testButton.disabled = !this.caps?.generation || run?.status === "started";
    }
    const effectiveNode = this.screen.querySelector("[data-pocket-generation-effective]");
    if (effectiveNode) {
      const effective = this.generation?.effective;
      const title = effectiveNode.querySelector("strong");
      const detail = effectiveNode.querySelector("span");
      if (title)
        title.textContent = effective?.name || "No effective connection";
      const model = this.settingsDraft?.generationMode === "sidecar" && this.settingsDraft.sidecarModelOverride || effective?.model || "model not set";
      if (detail)
        detail.textContent = effective ? `${effective.provider} · ${model}` : "Configure a Lumiverse LLM connection.";
    }
    const swarmNode = this.screen.querySelector("[data-pocket-swarm-status]");
    if (swarmNode && this.swarmProfile) {
      swarmNode.dataset.status = this.swarmProfile.status;
      swarmNode.textContent = this.swarmProfile.status === "connected" ? `Connected · ${this.swarmProfile.checkpoint || "profile macros resolved"}` : this.swarmProfile.status === "disabled" ? "Swarm profile sync is disabled." : this.swarmProfile.status === "error" ? `Error · ${this.swarmProfile.error}` : "Swarm Studio macros were not detected for this character/persona.";
    }
    for (const row of this.screen.querySelectorAll("[data-pocket-swarm-macro]")) {
      const name = row.dataset.pocketSwarmMacro;
      const field = this.swarmProfile?.fields?.[name];
      row.textContent = `${name} · ${field?.detected ? `${field.length} chars · ${field.preview}` : "empty"}`;
    }
  }
  updatePreferences(next, options = {}) {
    const normalized = normalizePreferences(next);
    if (this.settingsDraft)
      Object.assign(this.settingsDraft, structuredClone(normalized));
    else
      this.settingsDraft = structuredClone(normalized);
    if (normalized.notifyMessages !== this.preferences.notifyMessages || normalized.notificationPreviews !== this.preferences.notificationPreviews)
      this.dismissMochiNotification?.();
    this.preferences = normalized;
    applyPocketTouchScroll(this.mobileWidget, normalized.nativeTouchScrollMode);
    this.applyAppearance();
    if (options.resize)
      this.resizeExpanded();
    this.mountInlineArtifacts();
    this.refreshActivityConnectors();
    if (options.persist === false)
      return;
    window.clearTimeout(this.settingsSaveTimer);
    this.settingsSaveTimer = window.setTimeout(() => {
      this.send("lumiphone:save_preferences", { preferences: this.settingsDraft || this.preferences });
    }, 240);
  }
  showMochiNotification(notification) {
    if (!this.preferences.notifyMessages || !this.expanded || document.hidden)
      return;
    if (this.shell.querySelector(".lp-floating-notification:not(.mochi-notification-toast)"))
      return;
    this.dismissMochiNotification?.();
    this.dismissMochiNotification = showMochiNotification(this.shell, notification, this.preferences.notificationPreviews, () => this.mochi.openRoom(notification.roomId));
  }
  showIncomingNotification(notification) {
    if (this.state && !notificationBelongsToDevice(this.state, this.currentDeviceOwnerActorId(), notification.deviceOwnerActorId))
      return;
    if (!this.expanded) {
      this.launcher.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 360 });
      return;
    }
    window.clearTimeout(this.notificationTimer);
    this.shell.querySelector(".lp-floating-notification")?.remove();
    const toast = button("", "lp-floating-notification");
    toast.setAttribute("role", "status");
    toast.append(icon2(notification.app), el("span", "lp-grow", ""), el("span", "lp-home-activity-arrow", "›"));
    const copy = toast.children[1];
    copy.append(el("strong", "", notification.title), el("span", "", notification.body));
    toast.addEventListener("click", () => {
      this.send("lumiphone:notification_mark_read", { notificationId: notification.id });
      this.openPocket(notification.route || { app: notification.app });
      toast.remove();
    });
    this.shell.appendChild(toast);
    this.notificationTimer = window.setTimeout(() => toast.remove(), 6000);
  }
  applyAppearance() {
    const settings = this.settingsDraft || this.preferences;
    const identity = this.syncSurfaceIdentity();
    const persona = identity.role === "persona" && this.activePersona ? settings.personaAppearance[this.activePersona.id] : null;
    const appearance = persona?.enabled ? persona : settings;
    this.shell.dataset.theme = appearance.theme;
    this.shell.style.setProperty("--lp-accent", appearance.colors.accent);
    this.shell.style.setProperty("--lp-outgoing", outgoingSurface(appearance.colors.accent));
    this.shell.style.setProperty("--lp-bezel", appearance.colors.bezel);
    this.shell.style.setProperty("--lp-bg", appearance.colors.background);
    this.shell.style.setProperty("--lp-surface", appearance.colors.surface);
    this.shell.style.setProperty("--lp-text", appearance.colors.text);
    const homeWallpaper = wallpaperCss(appearance.colors.wallpaperPrimary, appearance.colors.wallpaperSecondary);
    const chatWallpaper = wallpaperCss(appearance.colors.chatPrimary, appearance.colors.chatSecondary);
    const homeSetting = persona?.enabled && persona.homeWallpaper.source ? persona.homeWallpaper : settings.homeWallpaper;
    const chatSetting = persona?.enabled && persona.chatWallpaper.source ? persona.chatWallpaper : settings.chatWallpaper;
    const homeImage = (persona?.enabled && persona.homeWallpaper.source ? this.resolvedWallpapers.personaHome : this.resolvedWallpapers.deviceHome).url;
    const chatImage = (persona?.enabled && persona.chatWallpaper.source ? this.resolvedWallpapers.personaChat : this.resolvedWallpapers.deviceChat).url;
    const imageLayer = (url, setting, gradient) => url ? `linear-gradient(rgba(7,6,11,${setting.scrim}),rgba(7,6,11,${setting.scrim})),url(${JSON.stringify(url)}),${gradient}` : gradient;
    this.shell.style.setProperty("--lp-wallpaper", imageLayer(homeImage, homeSetting, homeWallpaper));
    this.shell.style.setProperty("--lp-chat-wallpaper", imageLayer(chatImage, chatSetting, chatWallpaper));
    this.shell.style.setProperty("--lp-home-wallpaper-size", homeSetting.fit === "stretch" ? "100% 100%" : homeSetting.fit);
    this.shell.style.setProperty("--lp-home-wallpaper-position", `${homeSetting.focalX * 100}% ${homeSetting.focalY * 100}%`);
    this.shell.style.setProperty("--lp-chat-wallpaper-size", chatSetting.fit === "stretch" ? "100% 100%" : chatSetting.fit);
    this.shell.style.setProperty("--lp-chat-wallpaper-position", `${chatSetting.focalX * 100}% ${chatSetting.focalY * 100}%`);
    this.shell.style.setProperty("--pocket-ui-scale", String(settings.uiScale));
    this.shell.style.setProperty("--lp-animation-ms", `${settings.reducedMotion ? 0 : settings.animationDurationMs}ms`);
    this.shell.dataset.reducedMotion = String(settings.reducedMotion);
    const customCss = [settings.customCss, persona?.enabled ? persona.customCss : ""].filter(Boolean).join(`
`);
    const surfaceSelector = `[data-pocket-surface="${identity.surfaceId}"]`;
    this.customStyle.textContent = customCss ? `@scope (${surfaceSelector}) { ${customCss} }` : "";
  }
  open() {
    if (!this.widget) {
      this.drawer.activate();
      this.mountPhoneInDrawer();
      return;
    }
    this.expanded = true;
    window.clearTimeout(this.collapseTimer);
    this.launcherFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!this.mountInteractiveSurface()) {
      this.expanded = false;
      this.drawer.activate();
      this.mountPhoneInDrawer();
      return;
    }
    this.launcher.hidden = true;
    this.shell.hidden = false;
    this.resizeExpanded();
    this.render(true);
    this.refresh();
    this.announceView();
    requestAnimationFrame(() => {
      this.shell.tabIndex = -1;
      this.shell.focus({ preventScroll: true });
    });
  }
  close() {
    this.dismissMochiNotification?.();
    this.mochi.leave();
    this.voicePlayer.stop();
    if (!this.widget && !this.dockPanel && !this.mobileWidget)
      return;
    this.expanded = false;
    this.shell.hidden = true;
    this.launcher.hidden = false;
    this.releaseDockPanel();
    if (this.mobileWidget) {
      this.mobileWidget.setFullscreen(false);
      this.mobileWidget.setVisible(false);
    }
    this.announceView();
    window.clearTimeout(this.collapseTimer);
    this.collapseTimer = window.setTimeout(() => {
      this.launcherFocus?.focus({ preventScroll: true });
      this.launcherFocus = null;
    }, this.preferences.reducedMotion || this.preferences.animation === "none" ? 0 : this.preferences.animationDurationMs);
  }
  resizeExpanded() {
    if (!this.expanded)
      return;
    const previousRoot = this.handsetHost.parentElement;
    this.mountInteractiveSurface();
    if (this.currentApp === "settings" && previousRoot !== this.handsetHost.parentElement)
      this.render(false);
  }
  openApp(app) {
    this.openPocket({ app });
  }
  inlineOptions(activity) {
    if (!this.state)
      return {};
    const owner = activityDeviceOwner(this.state, activity, this.currentDeviceOwnerActorId());
    const persona = owner === pocketPersonaActorId(this.state) && this.activePersona ? this.preferences.personaAppearance[this.activePersona.id] : null;
    const appearance = persona?.enabled ? persona : this.preferences;
    const image = persona?.enabled && persona.chatWallpaper.source ? this.resolvedWallpapers.personaChat : this.resolvedWallpapers.deviceChat;
    const wallpaper = persona?.enabled && persona.chatWallpaper.source ? persona.chatWallpaper : this.preferences.chatWallpaper;
    const gradient = wallpaperCss(appearance.colors.chatPrimary, appearance.colors.chatSecondary);
    const background = image.url ? `linear-gradient(rgba(7,6,11,${wallpaper.scrim}),rgba(7,6,11,${wallpaper.scrim})),url(${JSON.stringify(image.url)}),${gradient}` : gradient;
    return {
      appearance: this.preferences.inlineAppearance || "cards",
      clock: activityClock(activity, this.state),
      accent: appearance.colors.accent,
      background,
      backgroundSize: `cover,${wallpaper.fit},cover`,
      backgroundPosition: `center,${wallpaper.focalX * 100}% ${wallpaper.focalY * 100}%,center`,
      textColor: appearance.colors.text,
      surfaceColor: appearance.colors.surface,
      avatarUrl: activity.presentation?.senderActorId ? resolvePocketActor(this.state, activity.presentation.senderActorId)?.avatarUrl : undefined,
      avatars: Object.fromEntries((activity.presentation?.batchMessages || []).map((row) => [row.senderActorId || "", resolvePocketActor(this.state, row.senderActorId || "")?.avatarUrl || ""]))
    };
  }
  openActivity(activity) {
    if (!this.state)
      return;
    const owner = activityDeviceOwner(this.state, activity, this.currentDeviceOwnerActorId());
    if (!owner) {
      this.showError("This conversation is no longer available.");
      return;
    }
    if (owner !== this.currentDeviceOwnerActorId()) {
      if (this.cameraBusy)
        this.send("lumiphone:camera_cancel", { requestId: this.cameraRequestId });
      this.cameraRequestId = "";
      this.cameraBusy = false;
      this.cameraReady = false;
      this.cameraPreview = "";
      this.cameraContactId = "";
      this.cameraNpcDraft = null;
      this.deviceOwnerActorId = owner;
      this.selectedConversationId = "";
      this.selectedMessageId = "";
      this.router.reset({ app: "home" });
      this.syncSurfaceIdentity();
      this.updateBadge();
      this.renderDrawerLanding();
    }
    this.openPocket(activity.route);
  }
  back() {
    this.openPocket(this.router.back(), false);
  }
  home() {
    this.openPocket(this.router.home(), false);
  }
  openPocket(routeInput, pushHistory = true) {
    const normalized = normalizePocketRoute(routeInput);
    const route = this.router.navigate(normalized, !pushHistory);
    if (this.currentApp === "mochi" && route.app !== "mochi")
      this.mochi.leave();
    if (!this.state && route.app !== "mochi") {
      this.pendingRoute = route;
      this.open();
      this.refresh();
      return;
    }
    if (!this.expanded)
      this.open();
    if (this.currentApp === "settings" && route.app !== "settings")
      this.settingsDraft = null;
    this.currentApp = route.app;
    if (route.app === "mochi") {
      this.mochi.select(route.roomId || "");
      if (!this.mochi.state)
        this.mochi.load();
      this.render(true);
      return;
    }
    if (!this.state)
      return;
    if (route.app === "messages") {
      const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state);
      const conversation = (route.conversationId ? this.state.conversations.find((entry) => entry.id === route.conversationId && conversationVisibleOnDevice(this.state, entry, owner)) : null) || (route.contactId ? this.state.conversations.find((entry) => entry.kind === "direct" && conversationVisibleOnDevice(this.state, entry, owner) && conversationActorIds(entry).includes(route.contactId)) : null);
      this.selectedConversationId = conversation?.id || "";
      this.selectedConversationView = route.view || "thread";
      this.selectedMessageId = conversation && route.messageId && conversation.messages.some((entry) => entry.id === route.messageId) ? route.messageId : "";
      this.send("lumiphone:mark_read", conversation ? { app: "messages", conversationId: conversation.id } : { app: "messages" });
    } else if (route.app === "contacts") {
      const contact = route.contactId ? this.state.contacts.find((entry) => entry.id === route.contactId) : null;
      this.selectedContactId = route.view === "bank-entry" ? route.contactId || "" : contact?.id || "";
      this.selectedContactGroupId = route.groupId || "";
      this.selectedContactView = contact ? route.view === "config" ? "config" : "detail" : route.view || "list";
      this.send("lumiphone:mark_read", { app: "contacts" });
    } else if (route.app === "trackers") {
      const tracker = route.trackerId ? this.state.trackers.find((entry) => entry.id === route.trackerId) : null;
      this.selectedTrackerId = tracker?.id || (route.trackerId?.startsWith("__template") ? route.trackerId : "");
      this.selectedTrackerView = route.view || "detail";
      this.send("lumiphone:mark_read", { app: "trackers" });
    } else if (route.app === "calendar") {
      this.selectedEventId = route.eventId === "__new__" || route.eventId && this.state.events.some((entry) => entry.id === route.eventId) ? route.eventId : "";
      this.send("lumiphone:mark_read", { app: "calendar" });
    } else if (route.app === "notes") {
      this.selectedNoteId = route.noteId === "__new__" || route.noteId && this.state.notes.some((entry) => entry.id === route.noteId) ? route.noteId : "";
      this.send("lumiphone:mark_read", { app: "notes" });
    } else if (route.app === "camera") {
      const contactId = route.draft ? "__draft__" : route.contactId || "";
      if (contactId !== this.cameraContactId) {
        this.cameraContactId = contactId;
        this.cameraPreview = "";
        this.cameraReady = false;
        this.cameraRequestId = "";
        this.cameraBusy = false;
        this.cameraProgress = "";
        const contact = this.state.contacts.find((entry) => entry.id === contactId);
        this.cameraNpcDraft = route.draft ? this.npcDraft : null;
        const subject = contact || this.cameraNpcDraft;
        this.cameraDraft = { scene: subject ? [`Portrait of ${subject.name}`, subject.phoneProfile?.appearance || subject.identityBrief, "Head and shoulders, one subject, looking at the camera, clean background"].filter(Boolean).map((part) => part.trim().replace(/[.!]+$/, "")).join(". ") + "." : "", enhance: false };
        this.cameraOptions = { purpose: route.draft ? "draft" : contactId ? "contact" : "scene", aspect: contactId ? "1:1" : "", connectionId: "", model: "" };
        this.cameraFocus = { x: 50, y: 50 };
        this.cameraImageId = "";
      }
      this.send("lumiphone:image_options");
      this.send("lumiphone:mark_read", { app: "camera" });
    } else if (route.app === "gallery") {
      this.selectedGalleryImageId = route.imageId || "";
      this.requestGallery(this.galleryScope);
      this.send("lumiphone:mark_read", { app: "gallery" });
    } else if (route.app === "settings") {
      this.selectedSettingsSection = route.section || "";
      this.settingsDraft ||= structuredClone(this.preferences);
      if (this.selectedSettingsSection === "camera")
        this.send("lumiphone:image_options", {});
      this.send("lumiphone:mark_read", { app: "settings" });
    } else if (route.app !== "home") {
      this.send("lumiphone:mark_read", { app: route.app });
    }
    this.announceView();
    this.render(true);
  }
  installInlineArtifactObserver() {
    if (this.inlineArtifactObserver || typeof MutationObserver === "undefined")
      return;
    this.inlineArtifactObserver = new MutationObserver(() => this.scheduleInlineArtifactMount());
    this.inlineArtifactObserver.observe(document.body, { childList: true, subtree: true });
    this.scheduleInlineArtifactMount();
  }
  scheduleInlineArtifactMount() {
    if (this.inlineMountFrame || this.destroyed)
      return;
    let firedSynchronously = false;
    const frame = requestAnimationFrame(() => {
      firedSynchronously = true;
      this.inlineMountFrame = 0;
      this.mountInlineArtifacts();
    });
    if (!firedSynchronously)
      this.inlineMountFrame = frame;
  }
  inlineHosts(activityId) {
    return [...document.querySelectorAll("[data-pocket-inline-anchor]")].filter((node) => node.dataset.pocketInlineAnchor === activityId);
  }
  provisionalActivityIsActive(record) {
    const active = this.activeContext();
    if (record.activity.scope.chatId !== active.chatId || record.activity.scope.characterId !== active.characterId)
      return false;
    if (record.origin.chatId !== active.chatId)
      return false;
    const selection = [...this.state?.hostSwipeSelections || []].reverse().find((entry) => entry.hostMessageId === record.origin.hostMessageId);
    return !selection || selection.swipeId === record.origin.swipeId;
  }
  inlineActivity(activityId) {
    const canonical = this.knownActivities.get(activityId);
    if (canonical)
      return canonical;
    const provisional = this.provisionalActivities.get(activityId);
    return provisional && this.provisionalActivityIsActive(provisional) ? provisional.activity : undefined;
  }
  mountInlineArtifacts() {
    const active = this.activeContext();
    for (const host of document.querySelectorAll("[data-pocket-inline-anchor]")) {
      const activityId = host.dataset.pocketInlineAnchor || "";
      const activity = this.inlineActivity(activityId);
      if (!activity || activity.scope.chatId !== active.chatId || activity.scope.characterId !== active.characterId) {
        if (host.dataset.pocketMounted === "true")
          host.replaceChildren();
        host.hidden = true;
        delete host.dataset.pocketMounted;
        continue;
      }
      host.hidden = false;
      host.classList.add("pocket-inline-anchor");
      host.dataset.pocketActivityId = activity.id;
      const options = this.inlineOptions(activity);
      const appearanceKey = JSON.stringify(options);
      if (host.dataset.pocketMounted !== "true" || host.dataset.pocketAppearance !== appearanceKey) {
        host.dataset.pocketMounted = "true";
        host.dataset.pocketAppearance = appearanceKey;
        renderActivityHost(host, activity, () => this.openActivity(activity), { ...options, includeArtifact: true, includeReceipt: false });
      }
      const fallback = this.injectedActivities.get(activity.id);
      if (fallback) {
        this.ctx.dom.uninject(fallback);
        this.injectedActivities.delete(activity.id);
      }
      this.pendingActivities.delete(activity.id);
    }
    this.refreshActivityConnectors();
  }
  refreshActivityConnectors() {
    if (!this.state)
      return;
    const entries = [...this.injectedActivities].flatMap(([id, host]) => {
      const activity = this.inlineActivity(id);
      return activity && (activity.kind === "message" || activity.kind === "call") ? [{ host, activity, options: this.inlineOptions(activity), owner: activityDeviceOwner(this.state, activity, this.currentDeviceOwnerActorId()) || "" }] : [];
    });
    refreshActivityConnectors(entries, (activity) => this.openActivity(activity));
  }
  pruneInactiveActivitySurfaces() {
    for (const [activityId, injected] of this.injectedActivities) {
      if (this.inlineActivity(activityId))
        continue;
      this.ctx.dom.uninject(injected);
      this.injectedActivities.delete(activityId);
      this.pendingActivities.delete(activityId);
    }
    this.refreshActivityConnectors();
    for (const activityId of [...this.pendingActivities.keys()]) {
      if (!this.inlineActivity(activityId))
        this.pendingActivities.delete(activityId);
    }
  }
  clearActivitySurfaces(clearKnown = false, clearProvisional = false) {
    for (const injected of this.injectedActivities.values())
      this.ctx.dom.uninject(injected);
    this.injectedActivities.clear();
    this.pendingActivities.clear();
    if (clearKnown)
      this.knownActivities.clear();
    if (clearProvisional)
      this.provisionalActivities.clear();
    for (const host of document.querySelectorAll("[data-pocket-inline-anchor]")) {
      host.replaceChildren();
      host.hidden = true;
      delete host.dataset.pocketMounted;
      delete host.dataset.pocketActivityId;
    }
  }
  tryRenderInlineArtifact(activity) {
    this.mountInlineArtifacts();
    const hosts = this.inlineHosts(activity.id).filter((host) => host.dataset.pocketMounted === "true" && !host.hidden);
    if (!hosts.length)
      return false;
    const fallback = this.injectedActivities.get(activity.id);
    if (fallback) {
      this.ctx.dom.uninject(fallback);
      this.injectedActivities.delete(activity.id);
    }
    return true;
  }
  queueActivityReceipt(activity) {
    const active = this.activeContext();
    if (activity.scope.chatId !== active.chatId || activity.scope.characterId !== active.characterId)
      return;
    if (this.tryRenderInlineArtifact(activity))
      return;
    if (this.injectedActivities.has(activity.id)) {
      this.refreshActivityConnectors();
      return;
    }
    if (!activity.source?.messageId)
      return;
    this.pendingActivities.set(activity.id, activity);
    this.sweepActivityReceipts();
  }
  sweepActivityReceipts() {
    this.mountInlineArtifacts();
    for (const [activityId, activity] of this.pendingActivities) {
      if (this.tryRenderInlineArtifact(activity)) {
        this.pendingActivities.delete(activityId);
        continue;
      }
      const injected = activityReceipt(this.ctx, activity, () => this.openActivity(activity), this.inlineOptions(activity));
      if (!injected)
        continue;
      this.pendingActivities.delete(activityId);
      this.injectedActivities.set(activityId, injected);
    }
    this.refreshActivityConnectors();
    if (this.pendingActivities.size && !this.receiptSweepTimer) {
      this.receiptSweepTimer = window.setInterval(() => {
        if (!this.pendingActivities.size) {
          window.clearInterval(this.receiptSweepTimer);
          this.receiptSweepTimer = 0;
          return;
        }
        this.sweepActivityReceipts();
      }, 1500);
    }
  }
  render(transition = false) {
    const oldView = this.screen.querySelector(".lumiphone-app-view");
    const oldViewScroll = oldView?.scrollTop || 0;
    const oldThread = this.screen.querySelector("[data-pocket-thread]");
    const oldThreadScroll = oldThread?.scrollTop;
    const oldThreadNearBottom = oldThread ? oldThread.scrollHeight - oldThread.clientHeight - oldThread.scrollTop < 72 : false;
    const focusedComposer = document.activeElement instanceof HTMLTextAreaElement ? document.activeElement.dataset.pocketComposer : "";
    const selection = document.activeElement instanceof HTMLTextAreaElement ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
    for (const cleanup of this.viewCleanups.splice(0))
      cleanup();
    if (!this.state && this.currentApp !== "mochi") {
      this.screen.replaceChildren(this.loadingView());
      return;
    }
    this.applyAppearance();
    const view = this.currentApp === "mochi" ? this.mochi.render() : this.currentApp === "home" ? this.renderHome() : this.currentApp === "messages" ? this.renderMessages() : this.currentApp === "contacts" ? this.renderContacts() : this.currentApp === "gallery" ? this.renderGallery() : this.currentApp === "camera" ? this.renderCamera() : this.currentApp === "notes" ? this.renderNotes() : this.currentApp === "weather" ? this.renderWeather() : this.currentApp === "calendar" ? this.renderCalendar() : this.currentApp === "trackers" ? this.renderTrackers() : this.currentApp === "notifications" ? this.renderNotifications() : this.renderSettings();
    view.classList.add("lumiphone-app-view");
    if (this.state && this.currentApp === "contacts" && ["config", "new", "draft"].includes(this.selectedContactView)) {
      const key = `${this.state.chatId}:${this.state.characterId}:${this.selectedContactId}:${this.selectedContactView}`;
      const fields = [...view.querySelectorAll("input, textarea, select")];
      const draft = this.contactFormDrafts.get(key);
      fields.forEach((field, index) => {
        if (draft?.[index]) {
          field.value = draft[index].value;
          if (field instanceof HTMLInputElement)
            field.checked = draft[index].checked;
        }
      });
      const remember = () => this.contactFormDrafts.set(key, fields.map((field) => ({ value: field.value, checked: field instanceof HTMLInputElement && field.checked })));
      view.addEventListener("input", remember);
      view.addEventListener("change", remember);
    }
    view.dataset.pocketApp = this.currentApp;
    const animation = this.preferences.reducedMotion ? "none" : this.preferences.animation;
    if (transition && animation !== "none") {
      view.dataset.animate = animation;
      view.addEventListener("animationend", () => view.removeAttribute("data-animate"), { once: true });
    }
    this.screen.replaceChildren(view);
    if (!transition)
      requestAnimationFrame(() => {
        view.scrollTop = oldViewScroll;
        const thread = this.screen.querySelector("[data-pocket-thread]");
        if (thread && oldThreadScroll !== undefined)
          thread.scrollTop = oldThreadNearBottom ? thread.scrollHeight : oldThreadScroll;
        if (focusedComposer) {
          const composer = this.screen.querySelector(`[data-pocket-composer="${CSS.escape(focusedComposer)}"]`);
          composer?.focus({ preventScroll: true });
          if (composer && selection)
            composer.setSelectionRange(selection[0], selection[1]);
        }
      });
  }
  loadingView() {
    const node = el("div", "lp-page lp-empty");
    const inner = el("div");
    inner.innerHTML = `${PHONE_ICON}<p>Waking Pocket…</p>`;
    node.appendChild(inner);
    return node;
  }
  page(title, subtitle = "", action) {
    const page = el("div", "lp-page");
    const nav = el("header", "lp-nav");
    const back = button("‹ Back", "lp-nav-action");
    back.addEventListener("click", () => this.back());
    const heading = el("div", "lp-nav-title", title);
    if (subtitle)
      heading.appendChild(el("span", "lp-nav-subtitle", subtitle));
    const right = button(action?.label || "", "lp-nav-action");
    right.disabled = !action || action.enabled === false;
    if (action?.ariaLabel)
      right.setAttribute("aria-label", action.ariaLabel);
    if (action)
      right.addEventListener("click", action.callback);
    nav.append(back, heading, right);
    const content = el("div", "lp-content");
    page.append(nav, content);
    return { page, content };
  }
  renderHome() {
    const state = this.state;
    const home = el("div", "lp-home");
    const head = el("div", "lp-home-head");
    const left = el("div");
    const roleplayClockText = state.roleplayClockSource === "narrative" && state.roleplayClockPrecision !== "exact" ? clockLabel(state.roleplayClockLabel) || "Story time" : formatTime(state.roleplayNow);
    left.append(el("div", "lp-home-date", formatDate(state.roleplayNow, false)), el("div", "lp-home-clock", roleplayClockText));
    const weather = el("button", "lp-home-weather");
    weather.type = "button";
    weather.append(icon2("weather"), el("span", "", `${state.weather.temperature}°${state.weather.unit} · ${state.weather.condition}`));
    weather.addEventListener("click", () => this.openApp("weather"));
    head.append(left, weather);
    const grid = el("div", "lp-app-grid");
    for (const meta of APP_META.filter((entry) => !entry.dock))
      grid.appendChild(this.appIcon(meta));
    const activity = el("div", "lp-home-activity");
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(state);
    const recentNotifications = state.notifications.filter((entry) => !entry.dismissedAt && !entry.read && notificationBelongsToDevice(state, owner, entry.deviceOwnerActorId)).slice(0, 3);
    for (const item of recentNotifications) {
      const receipt = button("", "lp-home-activity-item");
      receipt.append(el("strong", "", item.title), el("span", "", item.body || item.app), el("span", "lp-home-activity-arrow", "›"));
      receipt.setAttribute("aria-label", `Open ${item.title}`);
      receipt.addEventListener("click", () => {
        this.send("lumiphone:notification_mark_read", { notificationId: item.id });
        this.openPocket(item.route || { app: item.app });
      });
      activity.appendChild(receipt);
    }
    if (recentNotifications.length) {
      const all = button("View all notifications", "lp-home-notifications-all");
      all.addEventListener("click", () => this.openPocket({ app: "notifications" }));
      activity.appendChild(all);
    }
    const dock = el("div", "lp-home-dock");
    for (const meta of APP_META.filter((entry) => entry.dock))
      dock.appendChild(this.appIcon(meta));
    home.append(head);
    if (!state.setup.initialized && !state.setup.dismissed && owner === pocketPersonaActorId(state)) {
      const prompt = el("section", "lp-home-setup");
      prompt.setAttribute("aria-label", "Set up Pocket");
      prompt.append(el("strong", "", "Make this phone yours"), el("p", "", "Ready when you are. Connect a model and choose how Pocket joins your story."));
      const actions = el("div", "lp-row");
      const run = button("Run setup", "lp-button");
      run.addEventListener("click", () => this.showFirstChatSetup(true));
      const skip = button("Skip", "lp-button lp-button-quiet");
      skip.addEventListener("click", () => {
        this.send("lumiphone:dismiss_setup");
        prompt.remove();
      });
      actions.append(run, skip);
      prompt.append(actions);
      home.append(prompt);
    }
    home.append(grid);
    if (activity.childElementCount)
      home.appendChild(activity);
    home.appendChild(dock);
    return home;
  }
  appIcon(meta) {
    const node = el("button", "lp-app-icon");
    node.type = "button";
    node.setAttribute("aria-label", meta.label);
    const box = el("span", `lp-app-icon-box lp-icon-${meta.icon}`);
    box.appendChild(icon2(meta.icon));
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state);
    const unread = meta.app === "messages" ? this.state.conversations.reduce((sum, conversation) => sum + conversationUnreadForDevice(this.state, conversation, owner), 0) : this.state.notifications.filter((item) => !item.read && !item.dismissedAt && item.app === meta.app && notificationBelongsToDevice(this.state, owner, item.deviceOwnerActorId)).length;
    if (unread)
      box.appendChild(el("span", "lp-app-dot", unread > 99 ? "99+" : String(unread)));
    node.append(box, el("span", "lp-app-label", meta.label));
    node.addEventListener("click", () => this.openApp(meta.app));
    return node;
  }
  renderMessages() {
    this.viewCleanups.push(() => this.voicePlayer.stop());
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state);
    return renderMessagesView({
      state: this.state,
      selectedConversationId: this.selectedConversationId,
      renderVoiceMessage: (message) => this.voicePlayer.render(message, this.preferences.ttsVoiceURI, this.preferences.voiceMessages !== false, this.preferences.ttsConnectionId, this.preferences.ttsConnectionOptions?.[this.preferences.ttsConnectionId || ""]),
      deviceOwnerActorId: owner,
      readOnlyDevice: owner !== pocketPersonaActorId(this.state),
      selectedMessageId: this.selectedMessageId,
      selectedView: this.selectedConversationView,
      groupDraft: this.groupDrafts.get(`${this.state.chatId}:${this.state.characterId}:${this.selectedConversationId || "new"}`),
      updateGroupDraft: (draft) => {
        this.groupDrafts.set(`${this.state.chatId}:${this.state.characterId}:${this.selectedConversationId || "new"}`, draft);
      },
      groupSaving: Boolean(this.groupSaveRequest),
      saveGroup: (type, payload) => {
        if (this.groupSaveRequest)
          return;
        this.groupSaveDraftKey = `${this.state.chatId}:${this.state.characterId}:${this.selectedConversationId || "new"}`;
        this.groupSaveRequest = this.send(type, payload);
      },
      openContacts: () => this.openPocket({ app: "contacts", view: "import" }),
      startContactGroup: (title, participants) => {
        const actors = listPocketActors(this.state);
        this.groupDrafts.set(`${this.state.chatId}:${this.state.characterId}:new`, { title, participants: participants.map((id) => actors.find((actor) => actor.contact?.id === id)?.actorId || id) });
        this.openPocket({ app: "messages", view: "group-editor" });
      },
      generationAvailable: Boolean(this.caps?.generation),
      busyConversations: new Map([...this.messageRequests.values()].map((entry) => [entry.conversationId, { speakerContactId: entry.speakerContactId, phase: entry.phase }])),
      selectedGroupSpeakerId: this.groupSpeakerSelections.get(this.selectedConversationId) || "auto",
      draft: this.messageDrafts.get(this.selectedConversationId) || "",
      updateDraft: (conversationId, value) => {
        if (value)
          this.messageDrafts.set(conversationId, value);
        else
          this.messageDrafts.delete(conversationId);
      },
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      empty: (title, copy) => this.empty("messages", title, copy),
      iconButton,
      selectConversation: (conversationId, view = "thread") => this.openPocket({ app: "messages", conversationId: conversationId || undefined, view }),
      openActor: (actorId) => {
        const actor = resolvePocketActor(this.state, actorId);
        if (actor?.contact)
          this.openPocket({ app: "contacts", contactId: actor.contact.id, view: "detail" });
        else if (actor?.discovered)
          this.send("lumiphone:promote_discovered_actor", { actorId });
      },
      openDirect: (contactId) => this.send("lumiphone:open_direct", { contactId }),
      send: (type, payload) => {
        this.send(type, payload);
      },
      generateReply: (conversationId, speakerContactId) => this.generateReply(conversationId, speakerContactId),
      cancelReply: (conversationId) => {
        this.send("lumiphone:cancel_message_generation", { conversationId });
        for (const [requestId, request] of this.messageRequests)
          if (request.conversationId === conversationId)
            this.messageRequests.delete(requestId);
        this.render();
      },
      selectGroupSpeaker: (conversationId, speakerContactId) => {
        if (speakerContactId === "auto")
          this.groupSpeakerSelections.delete(conversationId);
        else
          this.groupSpeakerSelections.set(conversationId, speakerContactId);
        this.render(false);
      },
      composerState: (conversationId, held) => {
        this.send("lumiphone:composer_state", { conversationId, held });
      },
      messageAnyway: (conversationId) => {
        this.manualMessageOverrides.add(conversationId);
        this.render(false);
      },
      manualOverride: this.manualMessageOverrides.has(this.selectedConversationId),
      continueRelay: () => {
        this.send("lumiphone:continue_relay", { conversationId: this.selectedConversationId });
      },
      continueArrival: (conversationId) => {
        this.send("lumiphone:continue_arrival", { conversationId });
      },
      openRoleplay: () => this.close(),
      openTimeline: (eventId) => this.openPocket({ app: "calendar", eventId }),
      scheduleEventSuggestion: (conversationId, messageId) => this.scheduleEventSuggestion(conversationId, messageId),
      declineEventSuggestion: (conversationId, messageId) => this.declineEventSuggestion(conversationId, messageId),
      showReferenceSheet: (conversationId) => this.showReferenceSheet(conversationId),
      cancelReference: (referenceId) => this.send("lumiphone:cancel_reference", { referenceId }),
      rearmReference: (referenceId) => this.send("lumiphone:rearm_reference", { referenceId }),
      showConversationGenerationInfo: (conversationId) => this.showConversationGenerationInfo(conversationId),
      showOutgoingPrompt: (conversationId) => this.showOutgoingPrompt(conversationId),
      shouldFocusHandoff: (relayId) => {
        if (this.focusedHandoffRelays.has(relayId))
          return false;
        const relay = this.state?.relays.find((entry) => entry.id === relayId);
        const conversation = relay ? this.state?.conversations.find((entry) => entry.id === relay.conversationId) : null;
        if (!relay || (relay.kind === "arrival" ? conversation?.availability.state !== "arriving" : conversation?.availability.state !== "local"))
          return false;
        this.focusedHandoffRelays.add(relayId);
        return true;
      },
      showGenerationInfo: (message) => this.showMessageGenerationInfo(message),
      back: () => this.back()
    });
  }
  scheduleEventSuggestion(conversationId, messageId) {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId);
    const message = conversation?.messages.find((entry) => entry.id === messageId);
    const suggestion = message?.eventSuggestion;
    if (!conversation || !message || !suggestion || suggestion.status !== "pending")
      return;
    this.pendingEventSuggestion = { conversationId, messageId, suggestion: structuredClone(suggestion) };
    this.openPocket({ app: "calendar", eventId: "__new__" });
  }
  declineEventSuggestion(conversationId, messageId) {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId);
    const message = conversation?.messages.find((entry) => entry.id === messageId);
    const suggestion = message?.eventSuggestion;
    if (!suggestion || suggestion.status !== "pending")
      return;
    this.send("lumiphone:decline_event_suggestion", {
      conversationId,
      messageId,
      suggestionId: suggestion.id
    });
    requestAnimationFrame(() => {
      const composer = this.screen.querySelector(`[data-pocket-composer="${CSS.escape(conversationId)}"]`);
      composer?.focus({ preventScroll: false });
      composer?.classList.add("lp-scheduler-composer-focus");
      window.setTimeout(() => composer?.classList.remove("lp-scheduler-composer-focus"), 900);
    });
  }
  showMessageGenerationInfo(message) {
    const info = message.generation?.info;
    const modal = this.ctx.ui.showModal({ title: "Generation info", width: 460, maxHeight: 620 });
    const content = el("div", "lp-settings-section");
    if (!info && message.origin) {
      const selectedSwipe = [...this.state?.hostSwipeSelections || []].reverse().find((entry) => entry.hostMessageId === message.origin.hostMessageId)?.swipeId;
      for (const [label, value] of [
        ["Source", "Main roleplay generation · Pocket Action"],
        ["Host message", message.origin.hostMessageId],
        ["Swipe candidate", String(message.origin.swipeId + 1)],
        ["Candidate state", selectedSwipe === undefined || selectedSwipe === message.origin.swipeId ? "active" : "inactive"],
        ["Generation ID", message.origin.generationId || "not recorded"]
      ]) {
        const row = el("div", "lp-row-between");
        row.append(el("strong", "", label), el("span", "lp-copy", value));
        content.appendChild(row);
      }
      content.appendChild(el("p", "lp-copy", "This message was authored by the main RP model and persisted through Pocket Action. Retry is intentionally not offered here because rewriting only the phone bubble would diverge from the source RP swipe."));
    } else if (!info) {
      content.appendChild(el("p", "lp-copy", `Request ${message.generation?.requestId || "unknown"} predates detailed diagnostics.`));
    } else {
      for (const [label, value] of [
        ["Speaker", info.speaker],
        ["Source", `${info.source} · ${info.sourceId}`],
        ["Source resolution", info.sourceResolution],
        ["Active character used", `${info.activeCharacterUsed ? "yes" : "no"} · ${info.activeCharacterId}`],
        ["Identity", `${info.identityChars} chars`],
        ["Scene snapshot", info.sceneSnapshotStale ? "stale" : "current"],
        ["Context mode", info.contextMode],
        ["Recent RP", `${info.recentCount} messages · ${info.recentChars} chars`],
        ["Story", `${info.storyCount} facts · ${info.storyChars} chars`],
        ["Phone thread", `${info.threadCount} messages · ${info.threadChars} chars`],
        ["Generation", `${info.generationMode} · ${info.connectionName} · ${info.model}`]
      ]) {
        const row = el("div", "lp-row-between");
        row.append(el("strong", "", label), el("span", "lp-copy", value));
        content.appendChild(row);
      }
      if (info.replyDecision) {
        const decision = info.replyDecision;
        const row = el("div", "lp-row-between");
        row.append(el("strong", "", "Channel decision"), el("span", "lp-copy", `${decision.rawAction} → ${decision.normalizedAction}${decision.reason ? ` · ${decision.reason}` : ""}${decision.normalizationReason ? ` · ${decision.normalizationReason}` : ""}`));
        content.appendChild(row);
      }
      if (info.groupBatch) {
        for (const [label, value] of [
          ["Group batch", info.groupBatch.id],
          ["Batch position", `${info.groupBatch.position} of ${info.groupBatch.size}`],
          ["Eligible contacts", String(info.groupBatch.eligibleCount)]
        ]) {
          const row = el("div", "lp-row-between");
          row.append(el("strong", "", label), el("span", "lp-copy", value));
          content.appendChild(row);
        }
      }
    }
    modal.root.appendChild(content);
  }
  showReferenceSheet(conversationId) {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId);
    if (!conversation)
      return;
    const modal = this.ctx.ui.showModal({ title: "Reference in roleplay", width: 480, maxHeight: 680 });
    const content = el("div", "lp-reference-sheet");
    content.appendChild(el("p", "lp-copy", "Attach Pocket context to your next normal roleplay turn. Pocket will wait for your RP message and will not change anyone’s scene presence."));
    let scope = "conversation";
    const messageInputs = [];
    const attach = button("Attach to next RP turn", "lp-button lp-button-primary");
    const update = () => {
      for (const input of messageInputs)
        input.disabled = scope !== "selected_messages";
      attach.disabled = scope === "selected_messages" && !messageInputs.some((input) => input.checked);
    };
    const addScope = (value, label, description) => {
      const row = el("label", "lp-reference-scope");
      const input = el("input");
      input.type = "radio";
      input.name = `reference-scope-${conversation.id}`;
      input.value = value;
      input.checked = scope === value;
      input.dataset.referenceScope = value;
      input.addEventListener("change", () => {
        if (input.checked) {
          scope = value;
          update();
        }
      });
      const copy = el("span", "lp-grow");
      copy.append(el("strong", "", label), el("span", "lp-copy", description));
      row.append(input, copy);
      content.appendChild(row);
    };
    addScope("conversation", "Current conversation", "Conversation state, participants, and up to 8 recent messages.");
    addScope("recent_messages", "Recent messages", "Only the last 6 messages and minimal conversation context.");
    addScope("selected_messages", "Selected messages", "Choose the exact bubbles Pocket should attach.");
    const choices = el("div", "lp-reference-message-list");
    for (const message of conversation.messages.filter((entry) => entry.sender !== "system").slice(-12)) {
      const row = el("label", "lp-reference-message-choice");
      const input = el("input");
      input.type = "checkbox";
      input.value = message.id;
      input.dataset.referenceMessage = message.id;
      input.checked = message.id === this.selectedMessageId;
      input.addEventListener("change", update);
      const copy = el("span", "lp-grow");
      copy.append(el("strong", "", message.senderName), el("span", "lp-copy", message.text.slice(0, 180)));
      row.append(input, copy);
      choices.appendChild(row);
      messageInputs.push(input);
    }
    content.appendChild(choices);
    attach.addEventListener("click", () => {
      const messageIds = messageInputs.filter((input) => input.checked).map((input) => input.value);
      this.send("lumiphone:arm_reference", { conversationId, scope, messageIds });
      modal.dismiss();
    });
    content.appendChild(attach);
    modal.root.appendChild(content);
    update();
  }
  showOutgoingPrompt(conversationId) {
    this.send("lumiphone:get_debug_prompt", { conversationId });
  }
  showOutgoingPromptResult(payload) {
    const modal = this.ctx.ui.showModal({ title: "Outgoing prompt", width: 680, maxHeight: 760 });
    const content = el("div", "lp-settings-section");
    const debug = payload.debug && typeof payload.debug === "object" ? payload.debug : null;
    if (!debug) {
      content.appendChild(el("p", "lp-copy", payload.promptRequestId ? `No captured prompt exists for request ${String(payload.promptRequestId)}. Generate a new Pocket reply after installing this debug build.` : "This conversation has no generated Pocket reply to inspect yet."));
      modal.root.appendChild(content);
      return;
    }
    for (const [label, value] of [
      ["Task", String(debug.task || "unknown")],
      ["Request", String(debug.requestId || payload.promptRequestId || "unknown")],
      ["Captured", String(debug.capturedAt || "unknown")],
      ["Message", String(payload.messageId || "unknown")]
    ]) {
      const row = el("div", "lp-row-between");
      row.append(el("strong", "", label), el("span", "lp-copy", value));
      content.appendChild(row);
    }
    const messages = Array.isArray(debug.messages) ? debug.messages : [];
    const fullPrompt = messages.map((message, index) => {
      const role = String(message?.role || "unknown");
      const body = String(message?.content || "");
      return `[${index + 1}] ${role.toUpperCase()}
${body}`;
    }).join(`

` + "─".repeat(48) + `

`);
    const copy = button("Copy full prompt", "lp-button lp-button-quiet");
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(fullPrompt);
        copy.textContent = "✓ Copied";
        window.setTimeout(() => {
          copy.textContent = "Copy full prompt";
        }, 1400);
      } catch {
        this.showFeedback("Could not copy the prompt automatically.");
      }
    });
    content.appendChild(copy);
    if (!messages.length) {
      content.appendChild(el("p", "lp-copy", "The captured request contained no message array."));
    } else {
      messages.forEach((message, index) => {
        const block = el("details", "lp-channel-diagnostic");
        if (index === 0)
          block.open = true;
        block.appendChild(el("summary", "", `[${index + 1}] ${String(message?.role || "unknown").toUpperCase()}`));
        const pre = el("pre", "lp-code-block", String(message?.content || ""));
        pre.style.whiteSpace = "pre-wrap";
        pre.style.overflowWrap = "anywhere";
        block.appendChild(pre);
        content.appendChild(block);
      });
    }
    const requestDetails = el("details", "lp-channel-diagnostic");
    requestDetails.appendChild(el("summary", "", "Parameters / raw debug metadata"));
    const raw = {
      type: debug.type || "",
      parameters: debug.parameters || {},
      reasoning: debug.reasoning || undefined
    };
    const pre = el("pre", "lp-code-block", JSON.stringify(raw, null, 2));
    pre.style.whiteSpace = "pre-wrap";
    pre.style.overflowWrap = "anywhere";
    requestDetails.appendChild(pre);
    content.appendChild(requestDetails);
    modal.root.appendChild(content);
  }
  showConversationGenerationInfo(conversationId) {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId);
    if (!conversation)
      return;
    const modal = this.ctx.ui.showModal({ title: "Conversation diagnostics", width: 500, maxHeight: 680 });
    const content = el("div", "lp-settings-section");
    const generated = conversation.messages.filter((message) => message.generation).slice(-5);
    const reference = [...this.state?.references || []].reverse().find((entry) => entry.conversationId === conversationId);
    for (const [label, value] of [
      ["Conversation", conversation.title],
      ["Kind", conversation.kind],
      ["Messages", String(conversation.messages.length)],
      ["Generated messages", String(conversation.messages.filter((message) => message.generation).length)],
      ["Latest reference", reference ? `${reference.id} · ${reference.status}` : "none"]
    ]) {
      const row = el("div", "lp-row-between");
      row.append(el("strong", "", label), el("span", "lp-copy", value));
      content.appendChild(row);
    }
    if (reference) {
      const referenceDetails = el("details", "lp-channel-diagnostic");
      const detail = el("div", "lp-handoff-diagnostics");
      for (const row of [
        `Scope: ${reference.scope}`,
        `Messages: ${reference.messages.length}`,
        `Bound user message: ${reference.boundUserMessageId || "none"}`,
        `Generation: ${reference.injectedGenerationId || "none"}`,
        `Injected: ${reference.injectedAt || "no"}`,
        `Serialized: ${reference.serializedReferenceChars || 0} chars`,
        `Consumed message: ${reference.consumedMessageId || "none"}`,
        reference.error ? `Error: ${reference.error}` : ""
      ].filter(Boolean))
        detail.appendChild(el("span", "lp-copy", row));
      if (reference.serializedReference)
        detail.appendChild(el("pre", "lp-code-block", reference.serializedReference));
      referenceDetails.append(el("summary", "", "Reference diagnostics"), detail);
      content.appendChild(referenceDetails);
    }
    for (const message of generated) {
      const row = button(`${message.senderName} · ${formatTime(message.createdAt)}`, "lp-button lp-button-quiet");
      row.addEventListener("click", () => {
        modal.dismiss();
        this.showMessageGenerationInfo(message);
      });
      content.appendChild(row);
    }
    if (!generated.length)
      content.appendChild(el("p", "lp-copy", "No generated Pocket bubbles have diagnostics yet."));
    modal.root.appendChild(content);
  }
  generateReply(conversationId, speakerContactId = "") {
    if ([...this.messageRequests.values()].some((entry) => entry.conversationId === conversationId))
      return;
    const id = requestId("reply");
    this.messageRequests.set(id, { conversationId, speakerContactId, phase: "pending" });
    this.send("lumiphone:generate_message", { requestId: id, conversationId, speakerContactId });
    if (speakerContactId && speakerContactId !== "auto")
      this.groupSpeakerSelections.delete(conversationId);
    this.render();
  }
  renderContacts() {
    const collectionKey = `${this.state.chatId}:${this.state.characterId}:${this.selectedContactView}:${this.selectedContactGroupId}:${this.selectedContactId}`;
    return renderContactsView({
      state: this.state,
      selectedContactId: this.selectedContactId,
      selectedView: this.selectedContactView,
      generationBrief: this.npcBriefs.get(`${this.state.chatId}:${this.state.characterId}`) || "",
      updateGenerationBrief: (brief) => {
        this.npcBriefs.set(`${this.state.chatId}:${this.state.characterId}`, brief);
      },
      sources: this.contactSources,
      npcBank: this.npcBank,
      identityProfiles: this.identityProfiles,
      capabilities: this.caps,
      selectedGroupId: this.selectedContactGroupId,
      bankGroups: this.npcBankGroups,
      collectionDraft: this.collectionDrafts.get(collectionKey),
      collectionSaving: Boolean(this.collectionRequest),
      updateCollectionDraft: (draft) => {
        this.collectionDrafts.set(collectionKey, draft);
      },
      saveCollection: (type, payload) => {
        if (this.collectionRequest)
          return;
        this.collectionRequestKey = collectionKey;
        this.collectionRequest = this.send(type, payload);
        this.render(false);
      },
      selectGroup: (groupId, view) => this.openPocket({ app: "contacts", groupId: groupId || undefined, view }),
      startGroup: (title, participants) => {
        const actors = listPocketActors(this.state);
        this.groupDrafts.set(`${this.state.chatId}:${this.state.characterId}:new`, { title, participants: participants.map((id) => actors.find((actor) => actor.contact?.id === id)?.actorId || id) });
        this.openPocket({ app: "messages", view: "group-editor" });
      },
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      empty: (title, copy) => this.empty("contacts", title, copy),
      operations: this.operations,
      npcDraft: this.npcDraft,
      previousNpcDraft: this.previousNpcDraft,
      select: (contactId, view = contactId ? "detail" : "list", replace = false) => this.openPocket({ app: "contacts", contactId: contactId || undefined, view }, !replace),
      restorePreviousNpcDraft: () => {
        if (!this.previousNpcDraft)
          return;
        const current = this.npcDraft;
        this.npcDraft = this.previousNpcDraft;
        this.previousNpcDraft = current;
        this.render(false);
      },
      openDirect: (contactId) => this.send("lumiphone:open_direct", { contactId }),
      choosePhoto: (contactId) => this.chooseContactPhoto(contactId),
      uploadPhoto: (contactId) => {
        this.uploadAvatarPhoto(contactId);
      },
      generatePhoto: (contactId) => this.openPocket({ app: "camera", contactId }),
      generateDraftPhoto: () => this.openPocket({ app: "camera", draft: true }),
      useSourcePhoto: (contactId) => this.send("lumiphone:set_contact_photo", { contactId, useSource: true }),
      requestSources: () => {
        if (this.contactSourcesRequested)
          return;
        this.contactSourcesRequested = true;
        this.send("lumiphone:list_contact_sources");
      },
      send: (type, payload) => {
        this.send(type, payload);
      },
      showError: (message) => this.showError(message)
    });
  }
  async uploadAvatarPhoto(contactId = "__draft__") {
    const context = this.activeContext(), draft = this.npcDraft;
    if (this.cameraBusy) {
      this.showFeedback("Stop the current photo generation before uploading an avatar.");
      return;
    }
    if (contactId === "__draft__" && !draft)
      return;
    try {
      const files = await this.ctx.uploads.pickFile({ accept: ["image/*", ".png", ".jpg", ".jpeg", ".webp", ".gif"], multiple: false, maxSizeBytes: 8 * 1024 * 1024 });
      const file = files[0];
      if (!file)
        return;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader;
        reader.addEventListener("load", () => resolve(String(reader.result || "")), { once: true });
        reader.addEventListener("error", () => reject(reader.error || new Error("Could not read the image.")), { once: true });
        reader.readAsDataURL(new Blob([file.bytes.slice().buffer], { type: file.mimeType }));
      });
      const current = this.activeContext();
      if (this.destroyed || current.chatId !== context.chatId || current.characterId !== context.characterId || contactId === "__draft__" && draft !== this.npcDraft)
        return;
      if (contactId !== "__draft__" && !this.state?.contacts.some((contact) => contact.id === contactId))
        return;
      this.openPocket(contactId === "__draft__" ? { app: "camera", draft: true } : { app: "camera", contactId });
      this.cameraPreview = dataUrl;
      this.cameraImageId = "";
      this.cameraReady = true;
      this.cameraFocus = { x: 50, y: 50 };
      this.cameraProgress = "Uploaded photo ready. Frame it, then choose Use photo.";
      this.render(false);
    } catch (error) {
      this.showError(error instanceof Error ? error.message : "Could not upload this avatar.");
    }
  }
  chooseContactPhoto(contactId = "__draft__") {
    if (contactId === "__draft__" && !this.npcDraft)
      return;
    this.pendingContactPhotoDraft = contactId === "__draft__" ? this.npcDraft : null;
    this.pendingWallpaperTarget = "contact-avatar";
    this.pendingContactPhotoId = contactId;
    this.requestGallery("all");
    this.openPocket({ app: "gallery" });
  }
  requestGallery(scope, offset = 0) {
    if (scope !== this.galleryScope)
      this.gallery = { data: [], total: 0 };
    this.galleryScope = scope;
    this.galleryLoading = true;
    this.galleryRequestId = requestId("gallery-list");
    this.send("lumiphone:gallery_list", { scope, offset, requestId: this.galleryRequestId });
    if (this.currentApp === "gallery")
      this.render(false);
  }
  renderGallery() {
    const { page, content } = this.page("Gallery", `${this.gallery.total} assets`, { label: "Refresh", callback: () => this.requestGallery(this.galleryScope, this.gallery.offset || 0) });
    const chips = el("div", "lp-chipbar");
    for (const [scope, label] of [["chat", "This chat"], ["character", "Character"], ["phone", "Pocket"], ["all", "All"]]) {
      const chip = button(label, "lp-chip");
      chip.setAttribute("aria-pressed", String(this.galleryScope === scope));
      chip.addEventListener("click", () => this.requestGallery(scope));
      chips.appendChild(chip);
    }
    content.appendChild(chips);
    if (!this.caps?.images) {
      content.appendChild(this.empty("gallery", "Gallery access is off", "Grant Images permission from Settings to browse Lumiverse assets."));
      return page;
    }
    const grid = el("div", "lp-gallery-grid");
    for (const item of this.gallery.data) {
      const tile = el("button", "lp-gallery-item");
      tile.type = "button";
      tile.dataset.selected = String(item.id === this.selectedGalleryImageId);
      if (item.id === this.selectedGalleryImageId)
        tile.setAttribute("aria-current", "true");
      const image = el("img");
      image.loading = "lazy";
      image.src = item.thumbnailUrl || item.url;
      image.alt = item.filename || "Gallery image";
      image.addEventListener("error", () => {
        tile.dataset.missing = "true";
        image.replaceWith(el("span", "lp-gallery-missing", "Image unavailable"));
      }, { once: true });
      tile.append(image, el("span", "lp-gallery-meta", item.filename || formatDate(item.createdAt * 1000)));
      tile.addEventListener("click", () => this.inspectImage(item));
      grid.appendChild(tile);
    }
    content.appendChild(grid);
    const offset = this.gallery.offset || 0, limit = this.gallery.limit || GALLERY_PAGE_SIZE;
    const pagination = el("nav", "lp-gallery-pagination lp-actions");
    pagination.setAttribute("aria-label", "Gallery pages");
    const previous = button("Previous", "lp-button lp-button-quiet"), next = button("Next", "lp-button lp-button-quiet");
    previous.disabled = this.galleryLoading || offset === 0;
    next.disabled = this.galleryLoading || offset + limit >= this.gallery.total;
    previous.addEventListener("click", () => this.requestGallery(this.galleryScope, Math.max(0, offset - limit)));
    next.addEventListener("click", () => this.requestGallery(this.galleryScope, offset + limit));
    const range = el("span", "lp-copy", this.galleryLoading ? "Loading images…" : this.gallery.total ? `${offset + 1}–${offset + this.gallery.data.length} of ${this.gallery.total}` : "0 images");
    range.setAttribute("role", "status");
    pagination.append(previous, range, next);
    content.insertBefore(pagination, grid);
    if (!this.gallery.data.length && !this.galleryLoading)
      content.appendChild(this.empty("gallery", "Nothing here yet", "Take a photo with Camera or switch the gallery filter."));
    return page;
  }
  inspectImage(item) {
    const modal = this.ctx.ui.showModal({ title: item.filename || "Pocket photo", width: 760, maxHeight: 820 });
    const image = el("img");
    image.src = item.fullUrl || item.url;
    image.alt = item.filename || "Pocket photo";
    image.style.cssText = "display:block;width:100%;max-height:76vh;object-fit:contain;border-radius:12px;background:#080808";
    const actions = el("div", "lp-gallery-actions");
    if (item.canDelete) {
      const remove = button("Delete photo", "lp-button lp-button-quiet");
      remove.addEventListener("click", () => {
        const confirmation = el("div", "lp-camera-sheet-fields");
        confirmation.append(el("p", "lp-copy", "Permanently delete this Pocket photo from Lumiverse Gallery? Chats, avatars and wallpapers using it may lose their image. This cannot be undone."));
        const cancel = button("Keep photo", "lp-button");
        const confirm = button("Permanently delete", "lp-button");
        const sheet = showPocketSheet(remove, "Delete photo?", confirmation);
        cancel.addEventListener("click", () => sheet?.dismiss());
        confirm.addEventListener("click", () => {
          this.runGalleryAction(confirm, "Deleting…", "lumiphone:gallery_delete", { imageId: item.id, scope: this.galleryScope, offset: this.gallery.offset || 0, confirmed: true });
          sheet?.dismiss();
          modal.dismiss();
        });
        confirmation.append(cancel, confirm);
      });
      actions.append(remove);
    }
    if (this.pendingWallpaperTarget === "contact-avatar" && this.pendingContactPhotoId) {
      const contactId = this.pendingContactPhotoId;
      const targetContact = this.state?.contacts.find((entry) => entry.id === contactId);
      const draft = contactId === "__draft__" ? this.pendingContactPhotoDraft : null;
      const use = button(`Use for ${draft?.name || targetContact?.name || "contact"}`, "lp-button lp-button-primary");
      use.addEventListener("click", () => {
        if (draft) {
          if (draft !== this.npcDraft) {
            this.showFeedback("That NPC preview has changed. Choose its portrait again.");
            return;
          }
          draft.avatarUrl = item.fullUrl || item.url;
          draft.avatarSource = { kind: "gallery", imageId: item.id };
          draft.avatarFocus = { x: 50, y: 50 };
          modal.dismiss();
          this.openPocket({ app: "contacts", view: "quick-gen" });
        } else
          this.runGalleryAction(use, "Applying…", "lumiphone:set_contact_photo", { contactId, imageId: item.id, imageUrl: item.fullUrl || item.url });
        this.pendingContactPhotoDraft = null;
        this.pendingWallpaperTarget = null;
        this.pendingContactPhotoId = "";
      });
      actions.appendChild(use);
    } else if (this.pendingWallpaperTarget) {
      const target = this.pendingWallpaperTarget;
      const use = button("Use this image", "lp-button");
      use.addEventListener("click", () => {
        const personaTarget = target.startsWith("persona-");
        this.runGalleryAction(use, "Applying…", "lumiphone:gallery_set_wallpaper", {
          imageId: item.id,
          target: target.endsWith("chat") ? "chat" : "home",
          personaId: personaTarget ? this.activePersona?.id : undefined
        });
        this.pendingWallpaperTarget = null;
      });
      actions.appendChild(use);
    }
    const open = button("Open image", "lp-button");
    open.addEventListener("click", () => window.open(item.fullUrl || item.url, "_blank", "noopener,noreferrer"));
    const attach = button("Add to current RP chat", "lp-button");
    attach.disabled = !this.caps?.sceneSync;
    attach.addEventListener("click", () => this.runGalleryAction(attach, "Adding…", "lumiphone:gallery_add_to_chat", { imageId: item.id, imageUrl: item.fullUrl || item.url, filename: item.filename }));
    const homeWallpaper = button("Set as home wallpaper", "lp-button lp-button-quiet");
    homeWallpaper.addEventListener("click", () => this.runGalleryAction(homeWallpaper, "Applying…", "lumiphone:gallery_set_wallpaper", { imageId: item.id, imageUrl: item.fullUrl || item.url, target: "home" }));
    const chatWallpaper = button("Set as chat wallpaper", "lp-button lp-button-quiet");
    chatWallpaper.addEventListener("click", () => this.runGalleryAction(chatWallpaper, "Applying…", "lumiphone:gallery_set_wallpaper", { imageId: item.id, imageUrl: item.fullUrl || item.url, target: "chat" }));
    const contact = el("select", "lp-select");
    const choose = el("option", "", "Choose a contact photo…");
    choose.value = "";
    contact.appendChild(choose);
    for (const entry of this.state?.contacts || []) {
      const option = el("option", "", entry.name);
      option.value = entry.id;
      contact.appendChild(option);
    }
    const setPhoto = button("Set contact photo", "lp-button lp-button-quiet");
    setPhoto.addEventListener("click", () => {
      if (!contact.value) {
        this.showError("Choose a contact first.");
        return;
      }
      this.runGalleryAction(setPhoto, "Applying…", "lumiphone:set_contact_photo", { contactId: contact.value, imageId: item.id, imageUrl: item.fullUrl || item.url });
    });
    const uses = el("div", "lp-sheet-actions");
    const useAs = button("Use as…", "lp-button");
    useAs.addEventListener("click", () => showPocketSheet(useAs, "Use photo as", uses));
    actions.append(attach, useAs, open);
    uses.append(homeWallpaper, chatWallpaper);
    const personaAppearance = this.activePersona ? this.preferences.personaAppearance[this.activePersona.id] : null;
    if (this.activePersona && personaAppearance?.enabled) {
      const personaHome = button(`Set ${this.activePersona.name} home wallpaper`, "lp-button lp-button-quiet");
      personaHome.addEventListener("click", () => this.runGalleryAction(personaHome, "Applying…", "lumiphone:gallery_set_wallpaper", { imageId: item.id, imageUrl: item.fullUrl || item.url, target: "home", personaId: this.activePersona.id }));
      const personaChat = button(`Set ${this.activePersona.name} chat wallpaper`, "lp-button lp-button-quiet");
      personaChat.addEventListener("click", () => this.runGalleryAction(personaChat, "Applying…", "lumiphone:gallery_set_wallpaper", { imageId: item.id, imageUrl: item.fullUrl || item.url, target: "chat", personaId: this.activePersona.id }));
      uses.append(personaHome, personaChat);
    }
    if (!(this.pendingWallpaperTarget === "contact-avatar" && this.pendingContactPhotoId))
      uses.append(fieldBlock("Contact photo", contact), setPhoto);
    modal.root.classList.add("lp-media-viewer");
    modal.root.append(image, actions);
  }
  runGalleryAction(buttonNode, progress, type, payload) {
    const idle = buttonNode.textContent || "Action";
    const actionRequestId = requestId("gallery");
    buttonNode.disabled = true;
    buttonNode.textContent = progress;
    this.galleryActionButtons.set(actionRequestId, { button: buttonNode, idle });
    this.send(type, { ...payload, requestId: actionRequestId });
  }
  wallpaperTargetPayload(target) {
    return { target, personaId: target.startsWith("persona-") ? this.activePersona?.id : undefined };
  }
  async chooseImage(target, mode) {
    if (mode === "gallery") {
      this.pendingWallpaperTarget = target;
      this.requestGallery("all");
      this.openPocket({ app: "gallery" });
      return;
    }
    if (mode === "upload") {
      try {
        const files = await this.ctx.uploads.pickFile({ accept: ["image/*", ".png", ".jpg", ".jpeg", ".webp", ".gif"], multiple: false, maxSizeBytes: 8 * 1024 * 1024 });
        const file = files[0];
        if (!file)
          return;
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader;
          reader.addEventListener("load", () => resolve(String(reader.result || "")), { once: true });
          reader.addEventListener("error", () => reject(reader.error || new Error("Could not read the image.")), { once: true });
          reader.readAsDataURL(new Blob([file.bytes.slice().buffer], { type: file.mimeType }));
        });
        this.send("lumiphone:upload_wallpaper_asset", { ...this.wallpaperTargetPayload(target), dataUrl, filename: file.name });
      } catch (error) {
        this.showError(error instanceof Error ? error.message : String(error));
      }
      return;
    }
    const modal = this.ctx.ui.showModal({ title: "Use image URL", width: 460, maxHeight: 320 });
    const content = el("div", "lp-settings-section");
    content.appendChild(el("p", "lp-copy", "Use a durable HTTPS image URL. Pocket stores the URL, never a downloaded base64 copy."));
    const input = el("input", "lp-input");
    input.type = "url";
    input.placeholder = "https://example.com/wallpaper.jpg";
    const apply = button("Use image", "lp-button");
    apply.addEventListener("click", () => {
      const url = input.value.trim();
      if (!/^https:\/\//i.test(url)) {
        this.showError("Enter an HTTPS image URL.");
        return;
      }
      this.send("lumiphone:set_wallpaper", { ...this.wallpaperTargetPayload(target), source: { kind: "url", url } });
      modal.dismiss();
    });
    content.append(input, apply);
    modal.root.appendChild(content);
    input.focus();
  }
  renderCamera() {
    const page = el("div", "lp-camera lp-npc-camera");
    page.dataset.captureState = this.cameraBusy ? "generating" : this.cameraReady ? "review" : "compose";
    const contact = this.state.contacts.find((entry) => entry.id === this.cameraContactId);
    const subject = contact || (this.cameraContactId === "__draft__" ? this.cameraNpcDraft : null);
    const nav = el("header", "lp-nav");
    const back = button("‹ Back", "lp-nav-action");
    back.addEventListener("click", () => this.back());
    const profileLabel = this.swarmProfile?.available ? "Lumiverse + Swarm profile" : "Lumiverse image settings";
    const title = el("div", "lp-nav-title", this.cameraContactId ? "Quick Generate" : "Camera");
    title.appendChild(el("span", "lp-nav-subtitle", subject ? `${subject.name} · Contact photo` : profileLabel));
    const gallery = button("Gallery", "lp-nav-action");
    gallery.addEventListener("click", () => this.openApp("gallery"));
    nav.append(back, title, gallery);
    const controls = el("form", "lp-content lp-camera-body");
    const mode = el("div", "lp-camera-mode", "ϟ AUTO");
    mode.append(el("span", "", "POCKET"), el("span", "", this.cameraContactId ? "PORTRAIT" : "PHOTO"));
    const viewfinder = el("div", "lp-npc-viewfinder lp-photo-viewfinder");
    if (this.cameraPreview) {
      const image = el("img");
      image.src = this.cameraPreview;
      image.alt = "Camera preview";
      viewfinder.appendChild(image);
    } else {
      const placeholder = el("div", "lp-camera-subject");
      const focus = el("div", "lp-focus-frame");
      focus.append(el("div", "lp-npc-camera-mark", "+"));
      const copy = el("div", "lp-npc-camera-copy");
      copy.append(el("strong", "", subject ? `Frame ${subject.name}` : "Frame a moment"), el("p", "", "Describe the photo, then tap the shutter."));
      placeholder.append(focus, copy);
      viewfinder.appendChild(placeholder);
    }
    const prompt = el("textarea", "lp-textarea");
    prompt.placeholder = "Describe the photo or moment…";
    prompt.rows = 2;
    prompt.maxLength = 12000;
    prompt.value = this.cameraDraft.scene;
    prompt.addEventListener("input", () => {
      this.cameraDraft.scene = prompt.value;
    });
    const floating = fieldBlock("Photo description", prompt);
    floating.classList.add("lp-camera-floating-brief");
    floating.hidden = this.cameraReady && !this.cameraBusy;
    viewfinder.append(floating);
    const footer = el("div", "lp-camera-bottom-strip");
    const optionRow = el("div", "lp-row-between");
    const enhanceLabel = el("label", "lp-row");
    const enhance = el("input");
    enhance.type = "checkbox";
    enhance.checked = this.cameraDraft.enhance ?? this.preferences.sceneEnhancer;
    enhance.addEventListener("change", () => {
      this.cameraDraft.enhance = enhance.checked;
    });
    enhanceLabel.append(enhance, el("span", "lp-copy", "Enhance scene description"));
    const source = el("span", "lp-copy", this.swarmProfile?.source === "swarm_studio" ? "Swarm Studio" : "Manual profile");
    optionRow.append(enhanceLabel, source);
    const makeChoice = (label, values, value, update) => {
      const select = el("select", "lp-select");
      for (const [id, name] of values) {
        const option = el("option", "", name);
        option.value = id;
        option.selected = id === value;
        select.append(option);
      }
      select.addEventListener("change", () => update(select.value));
      return fieldBlock(label, select);
    };
    const purpose = makeChoice("Subject", this.cameraContactId ? [[this.cameraOptions.purpose, subject?.name || "Contact"]] : [["scene", "Scene · character and persona"], ["character", this.state.characterName], ["persona", this.state.pocketPersona.displayName || "Persona"]], this.cameraOptions.purpose, (value) => {
      this.cameraOptions.purpose = value;
    });
    const aspect = makeChoice("Framing", [["", "Profile default"], ["1:1", "Square · avatar"], ["3:4", "Portrait"], ["4:3", "Landscape"], ["9:16", "Tall"], ["16:9", "Wide"]], this.cameraOptions.aspect, (value) => {
      this.cameraOptions.aspect = value;
    });
    const connection = makeChoice("Image connection", [["", "Profile default"], ...this.imageConnections.map((entry) => [entry.id, entry.name])], this.cameraOptions.connectionId, (value) => {
      this.cameraOptions.connectionId = value;
    });
    const model = el("div", "lp-model-combobox");
    const mountModel = () => {
      modelHandle?.destroy();
      modelHandle = this.ctx.components.mountModelCombobox(model, { value: this.cameraOptions.model, connection: { kind: "image", id: this.cameraOptions.connectionId || this.preferences.manualVisualProfile.connectionId || undefined }, placeholder: "Use native checkpoint", onChange: (value) => {
        this.cameraOptions.model = value;
      } });
    };
    let modelHandle;
    this.viewCleanups.push(() => modelHandle?.destroy());
    connection.querySelector("select")?.addEventListener("change", () => {
      this.cameraOptions.model = "";
      mountModel();
    });
    const nativeSettings = button("Lumiverse image settings", "lp-button lp-button-quiet");
    nativeSettings.addEventListener("click", () => {
      nativeSettings.closest("dialog")?.close();
      this.close();
      this.send("lumiphone:open_native_image_settings", {});
    });
    const pipelineCopy = el("p", "lp-copy", "Without saved or per-photo overrides, use Lumiverse presets, workflow and LoRA stack. Connection/checkpoint overrides use direct generation. Set saved defaults in Pocket Settings.");
    const shutterRow = el("div", "lp-shutter-row");
    const shutterAction = el("div", "lp-camera-shutter-action");
    const shutter = el("button", "lp-shutter");
    shutter.type = "submit";
    shutter.disabled = !this.cameraBusy && (!this.caps?.imageGen || Boolean(this.cameraContactId && !subject));
    shutter.dataset.busy = String(this.cameraBusy);
    const album = button("Gallery", "lp-nav-action");
    album.addEventListener("click", () => this.openApp("gallery"));
    album.classList.add("lp-camera-album");
    album.setAttribute("aria-label", "Open photo gallery");
    if (this.cameraPreview) {
      const thumb = el("img");
      thumb.src = this.cameraPreview;
      thumb.alt = "";
      album.replaceChildren(thumb);
    } else
      album.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m4 18 6-6 4 4 3-3 4 5"/></svg>';
    shutterAction.append(el("span", "lp-camera-shutter-label", this.cameraBusy ? "Tap to stop" : this.cameraReady ? "Retake" : "Capture"));
    shutterRow.append(album, shutter, shutterAction);
    const progress = el("div", "lp-camera-progress", this.cameraProgress || (!this.caps?.imageGen ? "Grant Image Generation permission in Settings" : ""));
    progress.setAttribute("role", "status");
    progress.setAttribute("aria-live", "polite");
    const optionsDrawer = button("Camera options", "lp-camera-options-chip");
    const optionFields = el("div", "lp-camera-sheet-fields");
    optionFields.append(pipelineCopy, nativeSettings, purpose, aspect, connection, (() => {
      const row = el("div", "lp-field");
      row.append(el("div", "lp-label", "Checkpoint override"), model);
      return row;
    })(), optionRow);
    optionsDrawer.addEventListener("click", () => {
      showPocketSheet(optionsDrawer, "Camera options", optionFields);
      mountModel();
    });
    footer.append(el("p", "lp-camera-caption", this.cameraContactId ? "PORTRAIT" : "PHOTO"), shutterRow, progress, optionsDrawer);
    if (this.cameraContactId && this.cameraReady && !this.cameraBusy) {
      const use = button("Use photo", "lp-button lp-camera-accept");
      use.disabled = !subject || this.cameraContactId === "__draft__" && this.npcDraft !== this.cameraNpcDraft;
      use.addEventListener("click", async () => {
        const contactId = this.cameraContactId;
        const draft = this.npcDraft;
        use.disabled = true;
        use.textContent = "Framing…";
        try {
          const croppedDataUrl = await cropAvatarPhoto(this.cameraPreview, { ...this.cameraFocus });
          if (!use.isConnected || contactId !== this.cameraContactId || draft !== this.npcDraft)
            return;
          if (this.cameraContactId === "__draft__") {
            if (!this.npcDraft || this.npcDraft !== this.cameraNpcDraft)
              return;
            const uploadId = requestId("avatar");
            this.pendingAvatarDraft = { requestId: uploadId, draft: this.npcDraft };
            this.send("lumiphone:upload_avatar", { croppedDataUrl, requestId: uploadId });
          } else
            this.runGalleryAction(use, "Applying…", "lumiphone:set_contact_photo", { contactId: this.cameraContactId, imageId: this.cameraImageId || undefined, imageUrl: this.cameraPreview, croppedDataUrl, focus: { x: 50, y: 50 } });
        } catch (error) {
          use.disabled = false;
          use.textContent = "Use photo";
          this.showFeedback(error instanceof Error ? error.message : "Could not frame this photo.");
        }
      });
      const crop = el("div", "lp-avatar-framing");
      const preview = el("img");
      preview.src = this.cameraPreview;
      preview.alt = "Contact avatar framing";
      preview.style.objectPosition = `${this.cameraFocus.x}% ${this.cameraFocus.y}%`;
      crop.append(preview);
      const framing = el("div", "lp-avatar-framing-controls");
      for (const [axis, label] of [["x", "Horizontal focus"], ["y", "Vertical focus"]]) {
        const slider = el("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = "100";
        slider.value = String(this.cameraFocus[axis]);
        slider.addEventListener("input", () => {
          this.cameraFocus[axis] = Number(slider.value);
          preview.style.objectPosition = `${this.cameraFocus.x}% ${this.cameraFocus.y}%`;
        });
        framing.append(fieldBlock(label, slider));
      }
      const frame = button("Avatar framing", "lp-camera-options-chip");
      const frameFields = el("div", "lp-camera-sheet-fields");
      frameFields.append(crop, framing);
      frame.addEventListener("click", () => showPocketSheet(frame, "Avatar framing", frameFields));
      const review = el("div", "lp-camera-review-actions");
      review.append(el("span", "lp-copy", "Ready for " + (subject?.name || "this contact")), frame, use);
      footer.append(review);
    }
    controls.append(mode, viewfinder, footer);
    shutter.setAttribute("aria-label", this.cameraBusy ? "Stop generating photo" : this.cameraReady ? "Retake photo" : "Take photo");
    controls.addEventListener("submit", (event) => {
      event.preventDefault();
      const scene = inputValue(prompt);
      if (this.cameraBusy) {
        this.send("lumiphone:camera_cancel", { requestId: this.cameraRequestId });
        this.cameraRequestId = "";
        this.cameraBusy = false;
        this.cameraReady = false;
        this.cameraProgress = "Cancelled";
        this.render();
        return;
      }
      if (this.cameraReady) {
        this.cameraReady = false;
        this.cameraProgress = "";
        this.render(false);
        return;
      }
      if (!scene) {
        prompt.focus();
        return;
      }
      this.cameraRequestId = requestId("camera");
      this.cameraBusy = true;
      this.cameraReady = false;
      this.cameraProgress = "Sending scene to camera…";
      this.send("lumiphone:camera_generate", { requestId: this.cameraRequestId, scene, enhance: enhance.checked, ...this.cameraOptions, contactId: this.cameraContactId && this.cameraContactId !== "__draft__" ? this.cameraContactId : undefined, subject: this.cameraNpcDraft?.phoneProfile?.appearance || this.cameraNpcDraft?.identityBrief });
      this.render();
    });
    page.append(nav, controls);
    return page;
  }
  renderNotes() {
    const state = this.state;
    const selected = state.notes.find((item) => item.id === this.selectedNoteId);
    if (this.selectedNoteId === "__new__" || selected)
      return this.renderNoteEditor(selected || null);
    const { page, content } = this.page("Notes", `${state.notes.length} journal entries`, { label: "New", callback: () => this.openPocket({ app: "notes", noteId: "__new__" }) });
    const sorted = [...state.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    for (const note of sorted) {
      const card = button("", "lp-card lp-note-card");
      card.dataset.clickable = "true";
      card.dataset.pinned = String(note.pinned);
      const head = el("div", "lp-row-between");
      head.append(el("h3", "lp-title", note.title), el("span", "lp-copy", formatDate(note.updatedAt)));
      const preview = el("p", "lp-copy lp-note-preview", note.body || "Empty note");
      card.append(head, preview);
      card.appendChild(el("span", "lp-eyebrow", [note.pinned ? "◆ Pinned" : "", note.author, note.mood].filter(Boolean).join(" · ")));
      card.addEventListener("click", () => this.openPocket({ app: "notes", noteId: note.id }));
      content.appendChild(card);
    }
    if (!state.notes.length)
      content.appendChild(this.empty("notes", "The journal is blank", "You or the character can write the first entry."));
    return page;
  }
  renderNoteEditor(note) {
    const { page, content } = this.page(note ? "Edit Note" : "New Note", note?.mood || "Character journal", { label: "Save", callback: () => save() });
    const title = el("input", "lp-input");
    title.placeholder = "Title";
    title.value = note?.title || "";
    const mood = el("input", "lp-input");
    mood.placeholder = "Mood or tag";
    mood.value = note?.mood || "";
    const body = el("textarea", "lp-textarea");
    content.classList.add("lp-note-editor");
    title.classList.add("lp-note-title");
    body.classList.add("lp-note-body");
    title.setAttribute("aria-label", "Title");
    mood.setAttribute("aria-label", "Mood or tag");
    body.setAttribute("aria-label", "Journal entry");
    body.placeholder = "Write a memory, thought, or journal entry…";
    body.value = note?.body || "";
    const pinRow = el("label", "lp-row-between lp-card");
    pinRow.append(el("span", "lp-title", "Pin for model memory"));
    const pinned = el("input");
    pinned.type = "checkbox";
    pinned.checked = note?.pinned || false;
    pinRow.appendChild(pinned);
    const save = () => {
      this.send("lumiphone:action", { action: "note", payload: { id: note?.id, title: inputValue(title), body: body.value, mood: inputValue(mood), pinned: pinned.checked } });
      this.back();
    };
    content.append(title, mood, body, pinRow);
    if (note) {
      const remove = button("Delete note", "lp-button lp-button-danger");
      remove.addEventListener("click", () => {
        this.send("lumiphone:delete", { kind: "note", id: note.id });
        this.back();
      });
      content.appendChild(remove);
    }
    return page;
  }
  appReviewControl(task, label, type) {
    return renderAppReviewControl({
      chatId: this.state.chatId,
      characterId: this.state.characterId,
      canGenerate: Boolean(this.caps?.generation),
      operations: this.operations,
      scopes: this.appReviewScopes,
      send: (type, payload) => this.send(type, payload),
      progress: (operation) => this.recordOperationProgress(operation),
      render: () => this.render(false)
    }, task, label, type);
  }
  renderWeather(editing = false) {
    const weather = this.state.weather;
    const { page, content } = this.page("Weather", weather.location, { label: editing ? "Save" : "Edit", callback: () => {
      if (editing)
        save();
      else {
        const editor = this.renderWeather(true);
        editor.classList.add("lumiphone-app-view");
        editor.dataset.pocketApp = "weather";
        page.replaceWith(editor);
      }
    } });
    const hero = el("div", "lp-weather-hero");
    const top = el("div", "lp-weather-hero-top");
    top.append(el("div", "lp-weather-condition", weather.condition), el("div", "lp-copy", weather.location));
    const temp = el("div", "lp-weather-temp", `${weather.temperature}°${weather.unit}`);
    const bottom = el("div", "lp-weather-hero-bottom");
    bottom.append(el("span", "lp-weather-stat", `↑ ${weather.high}°`), el("span", "lp-weather-stat", `↓ ${weather.low}°`), el("span", "lp-weather-updated", weather.updatedAt ? `Updated ${formatTime(weather.updatedAt)}` : ""));
    hero.append(top, weatherGlyph(weather.condition), temp, bottom);
    hero.dataset.condition = weatherConditionKind(weather.condition);
    const fields = el("div", "lp-fields");
    const location = this.field("Location", weather.location);
    const condition = this.field("Condition", weather.condition);
    const temperature = this.field("Temperature", String(weather.temperature), "number");
    const unit = el("select", "lp-select");
    for (const value of ["C", "F"]) {
      const option = el("option", "", `°${value}`);
      option.value = value;
      option.selected = weather.unit === value;
      unit.appendChild(option);
    }
    const unitLabel = el("label", "lp-label", "Unit");
    unitLabel.appendChild(unit);
    const high = this.field("High", String(weather.high), "number");
    const low = this.field("Low", String(weather.low), "number");
    fields.append(location.label, condition.label, temperature.label, unitLabel, high.label, low.label);
    const details = el("textarea", "lp-textarea");
    details.placeholder = "Atmosphere and roleplay weather details…";
    details.value = weather.details;
    if (editing)
      content.append(hero, fields, fieldBlock("Atmosphere", details));
    else
      content.append(hero, el("p", "lp-weather-note", weather.details || "Enjoy the day."), weatherOutlook(weather, this.state.roleplayNow, this.state.roleplayTimezoneOffsetMinutes), this.appReviewControl("weather-week", weather.outlook ? "Refresh story outlook" : "Build story outlook", "lumiphone:weather_week"));
    const save = () => {
      this.send("lumiphone:action", { action: "weather", payload: {
        location: inputValue(location.input),
        condition: inputValue(condition.input),
        temperature: Number(temperature.input.value),
        unit: unit.value,
        high: Number(high.input.value),
        low: Number(low.input.value),
        details: details.value
      } });
      this.render();
    };
    return page;
  }
  renderCalendar() {
    const state = this.state;
    const selected = state.events.find((item) => item.id === this.selectedEventId);
    if (this.selectedEventId === "__new__" || selected)
      return this.renderEventEditor(selected || null);
    const { page, content } = this.page("Timeline", formatDate(state.roleplayNow, true), { label: "Add", callback: () => this.openPocket({ app: "calendar", eventId: "__new__" }) });
    const nowCard = el("div", "lp-card");
    const nowField = el("input", "lp-input");
    nowField.type = "datetime-local";
    nowField.value = dateTimeLocal(state.roleplayNow);
    const setNow = button("Set roleplay now", "lp-button");
    setNow.addEventListener("click", () => {
      const parsed = new Date(nowField.value);
      if (!Number.isNaN(parsed.getTime()))
        this.send("lumiphone:save_roleplay_time", { roleplayNow: parsed.toISOString(), timezoneOffsetMinutes: new Date().getTimezoneOffset() });
    });
    const clockSource = state.roleplayClockSource === "manual" ? "Manual" : state.roleplayClockSource === "narrative" ? "Narrative" : "Legacy / fallback";
    const clockPrecision = state.roleplayClockPrecision && state.roleplayClockPrecision !== "unknown" ? ` · ${state.roleplayClockPrecision}` : "";
    const clockLabel = state.roleplayClockLabel ? ` · ${state.roleplayClockLabel}` : "";
    nowCard.append(el("div", "lp-eyebrow", "Roleplay clock"), nowField, el("p", "lp-copy", `${clockSource}${clockPrecision}${clockLabel}`), setNow);
    content.appendChild(disclosure("Story clock · " + formatTime(state.roleplayNow), nowCard));
    const overview = el("div", "lp-timeline-overview");
    overview.append(el("strong", "", String(state.events.filter((event) => !event.completed).length)), el("span", "lp-copy", "open beats"), el("strong", "", String(state.events.filter((event) => event.completed).length)), el("span", "lp-copy", "resolved"));
    content.append(overview, this.appReviewControl("timeline-review", "Review recent story", "lumiphone:timeline_review"));
    const timeline = el("div", "lp-timeline");
    const events = [...state.events].sort((a, b) => Number(a.completed) - Number(b.completed) || (a.completed ? Date.parse(b.start) - Date.parse(a.start) : Date.parse(a.start) - Date.parse(b.start)));
    let section = "";
    for (const event of events) {
      const nextSection = event.completed ? "Resolved" : "In the story";
      if (section !== nextSection) {
        section = nextSection;
        timeline.append(el("h3", "lp-timeline-section", section));
      }
      const row = el("div", "lp-event");
      row.dataset.completed = String(event.completed);
      const dot = el("span", "lp-event-dot");
      dot.style.setProperty("--event-color", event.color);
      const card = button("", "lp-card lp-event-card");
      card.dataset.clickable = "true";
      card.append(el("div", "lp-eyebrow", `${event.lane} · ${event.whenText || formatDate(event.start, true)}`), el("h3", "lp-title", event.title));
      if (event.completed)
        card.appendChild(el("span", "lp-status-badge", "✓ Completed"));
      if (event.description)
        card.appendChild(el("p", "lp-copy", event.description));
      card.addEventListener("click", () => this.openPocket({ app: "calendar", eventId: event.id }));
      row.append(dot, card);
      timeline.appendChild(row);
    }
    content.appendChild(timeline);
    if (!events.length)
      content.appendChild(this.empty("calendar", "No timeline events", "Schedule story beats, dates, appointments, or alternate-timeline milestones."));
    return page;
  }
  renderEventEditor(event) {
    const { page, content } = this.page(event ? "Edit Event" : "New Event", "Roleplay timeline", { label: "Save", callback: () => save() });
    const schedulerSeed = !event ? this.pendingEventSuggestion : null;
    const suggestion = schedulerSeed?.suggestion || null;
    const title = this.field("Title", event?.title || suggestion?.title || "");
    const lane = this.field("Timeline lane", event?.lane || (suggestion ? "Plans" : "Main timeline"));
    const whenKindLabel = el("label", "lp-label", "Time precision");
    const whenKind = el("select", "lp-select");
    for (const [value, label] of [["exact", "Exact date/time"], ["approximate", "Approximate"], ["relative", "Relative to story"], ["unscheduled", "Unscheduled"]]) {
      const option = el("option", "", label);
      option.value = value;
      option.selected = (event?.whenKind || suggestion?.whenKind || "exact") === value;
      whenKind.appendChild(option);
    }
    whenKindLabel.appendChild(whenKind);
    const whenText = this.field("Timeline label", event?.whenText || suggestion?.whenText || (event ? formatDate(event.start, true) : ""));
    const start = this.field("Start", event ? dateTimeLocal(event.start) : suggestion?.start ? dateTimeLocal(suggestion.start) : dateTimeLocal(this.state.roleplayNow), "datetime-local");
    const end = this.field("End", event ? dateTimeLocal(event.end) : suggestion?.end ? dateTimeLocal(suggestion.end) : suggestion?.start ? dateTimeLocal(suggestion.start) : dateTimeLocal(this.state.roleplayNow), "datetime-local");
    const exactTiming = el("div", "lp-settings-section");
    exactTiming.style.minWidth = "0";
    exactTiming.style.width = "100%";
    exactTiming.append(start.label, end.label);
    const syncTimingPrecision = () => {
      exactTiming.style.display = whenKind.value === "exact" ? "grid" : "none";
      whenText.input.placeholder = whenKind.value === "approximate" ? "Morning, late afternoon, around noon…" : whenKind.value === "relative" ? "After the press conference, before patrol…" : whenKind.value === "unscheduled" ? "No scheduled time" : "Timeline label";
    };
    whenKind.addEventListener("change", syncTimingPrecision);
    syncTimingPrecision();
    const description = el("textarea", "lp-textarea");
    description.placeholder = "What happens?";
    description.value = event?.description || suggestion?.description || "";
    const selectedParticipantNames = new Set(event?.participantNames || suggestion?.participantNames || []);
    const participants = el("section", "lp-card lp-settings-section");
    participants.appendChild(el("div", "lp-eyebrow", "Participants"));
    const picker = el("div", "lp-contact-checklist lp-participant-picker");
    const candidateNames = [
      this.state.pocketPersona.displayName,
      ...listPocketActors(this.state).map((actor) => actor.name),
      ...suggestion?.participantNames || [],
      ...event?.participantNames || []
    ].filter((name, index, all) => Boolean(name) && all.findIndex((other) => normalizeActorName(other) === normalizeActorName(name)) === index);
    for (const name of candidateNames) {
      const row = el("label", "lp-contact-check");
      const input = el("input");
      input.type = "checkbox";
      input.checked = [...selectedParticipantNames].some((entry) => normalizeActorName(entry) === normalizeActorName(name));
      input.addEventListener("change", () => {
        for (const existing of [...selectedParticipantNames]) {
          if (normalizeActorName(existing) === normalizeActorName(name))
            selectedParticipantNames.delete(existing);
        }
        if (input.checked)
          selectedParticipantNames.add(name);
      });
      const known = normalizeActorName(name) === normalizeActorName(this.state.pocketPersona.displayName) || listPocketActors(this.state).some((actor) => normalizeActorName(actor.name) === normalizeActorName(name));
      row.append(input, el("span", "lp-grow", name), el("span", "lp-copy", known ? "Known actor" : "Name-only · profile not required"));
      picker.appendChild(row);
    }
    participants.appendChild(picker);
    const completed = el("input");
    completed.type = "checkbox";
    completed.checked = event?.completed || false;
    const completeRow = el("label", "lp-card lp-row-between");
    completeRow.append(el("span", "lp-title", "Completed"), completed);
    content.append(title.label, lane.label, whenKindLabel, whenText.label, exactTiming, description, participants, completeRow);
    if (event?.source) {
      const source = button("Open source conversation", "lp-button lp-button-quiet");
      source.addEventListener("click", () => this.openPocket({ app: "messages", conversationId: event.source.conversationId, messageId: event.source.messageId }));
      content.appendChild(source);
    }
    const save = () => {
      const startDate = new Date(start.input.value);
      const endDate = new Date(end.input.value);
      this.send("lumiphone:action", { action: "event", payload: {
        id: event?.id,
        title: inputValue(title.input),
        lane: inputValue(lane.input),
        description: description.value,
        start: whenKind.value === "exact" ? Number.isNaN(startDate.getTime()) ? this.state.roleplayNow : startDate.toISOString() : event?.start || this.state.roleplayNow,
        end: whenKind.value === "exact" ? Number.isNaN(endDate.getTime()) ? this.state.roleplayNow : endDate.toISOString() : event?.end || event?.start || this.state.roleplayNow,
        whenKind: whenKind.value,
        whenText: inputValue(whenText.input),
        completed: completed.checked,
        participants: [...selectedParticipantNames],
        sourceConversationId: event?.source?.conversationId || schedulerSeed?.conversationId,
        sourceMessageId: event?.source?.messageId || schedulerSeed?.messageId,
        sourceSuggestionId: event?.source?.suggestionId || schedulerSeed?.suggestion.id
      } });
      this.pendingEventSuggestion = null;
      this.back();
    };
    if (event) {
      const remove = button("Delete event", "lp-button lp-button-danger");
      remove.addEventListener("click", () => {
        this.send("lumiphone:delete", { kind: "event", id: event.id });
        this.back();
      });
      content.appendChild(remove);
    }
    return page;
  }
  renderTrackers() {
    const draftKey = `${this.state.chatId}:${this.state.characterId}:${this.selectedTrackerId}`;
    return renderTrackersView({
      state: this.state,
      selectedId: this.selectedTrackerId,
      selectedView: this.selectedTrackerView,
      accent: this.preferences.colors.accent,
      draft: this.trackerDrafts.get(draftKey),
      updateDraft: (draft) => {
        this.trackerDrafts.set(draftKey, draft);
      },
      saving: Boolean(this.trackerSaveRequest),
      pending: Boolean(this.trackerMutationRequest) || this.jevWorking,
      save: (payload) => {
        if (this.trackerSaveRequest)
          return;
        this.trackerSaveDraftKey = draftKey;
        this.trackerSaveRequest = this.send("lumiphone:action", { action: "tracker", payload });
      },
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      field: (label, value, type) => this.field(label, value, type),
      send: (type, payload) => {
        if (this.trackerMutationRequest || this.jevWorking)
          return;
        if (type === "lumiphone:jev_evaluate") {
          this.jevWorking = true;
          this.trackerJevRequest = this.send(type, payload);
        } else
          this.trackerMutationRequest = this.send(type, payload);
        this.render(false);
      },
      select: (id, view = "detail", replace = false) => this.openPocket({ app: "trackers", trackerId: id || undefined, view }, !replace),
      back: () => this.back(),
      onCleanup: (cleanup) => this.viewCleanups.push(cleanup)
    });
  }
  renderNotifications() {
    return renderNotificationsView({
      notifications: this.state.notifications.filter((entry) => notificationBelongsToDevice(this.state, this.currentDeviceOwnerActorId(), entry.deviceOwnerActorId)),
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      navigate: (route) => this.openPocket(route),
      send: (type, payload) => {
        this.send(type, payload);
      }
    });
  }
  renderSettings() {
    this.settingsDraft ||= structuredClone(this.preferences);
    return renderSettingsView({
      identityProfiles: this.identityProfiles,
      draft: this.settingsDraft,
      jevKeyConfigured: this.jevKeyConfigured,
      state: this.state,
      section: this.selectedSettingsSection,
      activePersona: this.activePersona,
      capabilities: this.caps,
      imageConnections: this.imageConnections,
      swarmProfile: this.swarmProfile,
      generation: this.generation,
      resolvedWallpapers: this.resolvedWallpapers,
      contextPreview: this.contextPreview,
      personaPreview: this.personaPreview,
      operations: this.operations,
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      update: (preferences, options) => this.updatePreferences(preferences, options),
      navigate: (section) => this.openPocket({ app: "settings", section }),
      send: (type, payload) => {
        if (type === "lumiphone:open_native_image_settings")
          this.close();
        return this.send(type, payload);
      },
      requestPermissions: () => {
        this.requestPermissions();
      },
      showError: (message) => this.showError(message),
      rerender: () => this.render(false),
      onCleanup: (cleanup) => this.viewCleanups.push(cleanup),
      resumeSetup: () => this.showFirstChatSetup(true),
      chooseImage: (target, mode) => {
        this.chooseImage(target, mode);
      },
      mountModelCombobox: (target, options) => {
        let stopped = false;
        let observer;
        let handle;
        const stop = () => {
          stopped = true;
          observer?.disconnect();
          handle?.destroy();
          handle = undefined;
        };
        this.viewCleanups.push(stop);
        const mount = () => {
          if (stopped || handle || !target.isConnected)
            return;
          observer?.disconnect();
          handle = this.ctx.components.mountModelCombobox(target, {
            value: options.value,
            connection: options.connection,
            appearance: "standard",
            placeholder: "Use connection model",
            disabled: options.disabled,
            onChange: options.onChange
          });
        };
        queueMicrotask(() => {
          if (stopped)
            return;
          if (target.isConnected)
            mount();
          else {
            observer = new MutationObserver(mount);
            observer.observe(document.body, { childList: true, subtree: true });
          }
        });
        return stop;
      }
    });
  }
  showFirstChatSetup(manual = false) {
    if (this.setupModalOpen || !this.state || this.state.setup.initialized || !manual && this.state.setup.dismissed)
      return;
    const active = this.ctx.getActiveChat();
    if (active.chatId !== this.state.chatId)
      return;
    this.setupModalOpen = true;
    this.setupPersonaEditing = false;
    const modal = this.ctx.ui.showModal({ title: "Set up Pocket", width: 620, maxHeight: 760 });
    const body = el("div", "lp-settings-section lp-setup");
    this.setupModalBody = body;
    this.setupModalDismiss = () => modal.dismiss();
    modal.root.appendChild(body);
    this.renderFirstChatSetupBody();
    modal.onDismiss(() => {
      for (const cleanup of this.setupControlCleanups.splice(0))
        cleanup();
      this.setupModalOpen = false;
      this.setupPersonaEditing = false;
      this.setupModalBody = null;
      this.setupModalDismiss = null;
    });
  }
  renderFirstChatSetupBody() {
    const body = this.setupModalBody;
    const state = this.state;
    if (!body || !state)
      return;
    for (const cleanup of this.setupControlCleanups.splice(0))
      cleanup();
    body.replaceChildren();
    const hero = el("header", "lp-setup-hero");
    const diagram = el("div", "lp-setup-diagram");
    diagram.innerHTML = PHONE_ICON;
    diagram.setAttribute("aria-hidden", "true");
    const intro = el("div", "lp-setup-intro");
    intro.append(el("div", "lp-setup-code", "POCKET / INITIALIZE"), el("h1", "lp-setup-title", "A phone for your story."), el("p", "lp-copy", "Connect a model, choose its owner, and bring your world along."));
    hero.append(intro, diagram);
    body.appendChild(hero);
    const stage = (section, number, title, status, ready = false) => {
      section.classList.add("lp-setup-stage");
      section.dataset.setupStage = number;
      const heading = el("div", "lp-setup-stage-heading");
      const index = el("span", "lp-setup-index", number);
      index.setAttribute("aria-hidden", "true");
      const badge = el("span", "lp-setup-status", status);
      badge.dataset.ready = String(ready);
      heading.append(index, el("h2", "lp-setup-stage-title", title), badge);
      section.prepend(heading);
    };
    const authorship = el("section", "lp-card lp-settings-section");
    stage(authorship, "01", "Who writes your character?", "This chat");
    const mode = el("input");
    mode.type = "hidden";
    mode.value = state.setup.authorship || "roleplay";
    const modes = el("div", "lp-setup-modes");
    modes.setAttribute("role", "radiogroup");
    modes.setAttribute("aria-label", "Character authorship");
    for (const [value, title, copy] of [["roleplay", "Roleplay", "You write your character. Pocket writes the people around them."], ["impersonation", "Impersonation", "AI can write both sides, including your character’s phone messages."]]) {
      const choice = el("label", "lp-setup-mode");
      const radio = el("input");
      radio.type = "radio";
      radio.name = "pocket-authorship-" + this.surfaceId;
      radio.value = value;
      radio.checked = mode.value === value;
      const wording = el("span", "lp-setup-mode-copy");
      wording.append(el("strong", "", title), el("span", "", copy));
      radio.addEventListener("change", () => {
        if (!radio.checked)
          return;
        mode.value = value;
        this.send("lumiphone:set_authorship", { authorship: value });
      });
      choice.append(radio, wording);
      modes.append(choice);
    }
    authorship.append(modes, el("p", "lp-copy", "You can always send messages manually inside Pocket."));
    const effective = this.generation?.effective;
    const latestTest = [...this.generation?.history || this.preferences.generationHistory || []].reverse().find((entry) => entry.task === "connection-test");
    const llmReady = Boolean(this.caps?.generation && effective?.configured);
    const llm = el("section", "lp-card lp-settings-section");
    llm.append(el("strong", "", effective?.name || "No effective connection"), el("p", "lp-copy", effective ? `${effective.provider} · ${effective.model || "model not set"}` : "Pocket needs a usable Lumiverse text-generation connection."));
    if (latestTest) {
      llm.appendChild(el("p", "lp-copy", latestTest.status === "started" ? "● Testing…" : latestTest.status === "completed" ? `✓ Test passed · ${latestTest.latencyMs ?? 0} ms` : `Test failed · ${latestTest.error || "Unknown provider error"}`));
    }
    stage(llm, "02", "Connect your model", llmReady ? "Connected" : "Needs connection", llmReady);
    const llmActions = el("div", "lp-row");
    const test = button("Test LLM", "lp-button lp-button-quiet");
    test.disabled = !this.caps?.generation || latestTest?.status === "started";
    test.addEventListener("click", () => {
      test.disabled = true;
      test.textContent = "Testing…";
      this.send("lumiphone:test_generation", {
        generationMode: this.preferences.generationMode,
        sidecarConnectionId: this.preferences.sidecarConnectionId,
        sidecarModelOverride: this.preferences.sidecarModelOverride
      });
    });
    const configureLlm = button("Generation settings", "lp-button lp-button-quiet");
    configureLlm.addEventListener("click", () => {
      this.setupModalDismiss?.();
      this.openPocket({ app: "settings", section: "generation" });
    });
    llmActions.append(test, configureLlm);
    llm.appendChild(llmActions);
    const afterAttachment = (target, mount) => {
      let stopped = false;
      let observer;
      let handle;
      this.setupControlCleanups.push(() => {
        stopped = true;
        observer?.disconnect();
        handle?.destroy();
      });
      const attach = () => {
        if (stopped || handle || !target.isConnected)
          return;
        observer?.disconnect();
        handle = mount();
      };
      queueMicrotask(() => {
        if (stopped)
          return;
        if (target.isConnected)
          attach();
        else {
          observer = new MutationObserver(attach);
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    };
    const sourceControls = el("div", "lp-setup-generation");
    const source = el("select", "lp-select");
    source.setAttribute("aria-label", "Pocket generation source");
    for (const [value, label] of [["roleplay", "Follow roleplay connection"], ["sidecar", "Choose a Pocket connection"]]) {
      const option = el("option", "", label);
      option.value = value;
      option.selected = this.preferences.generationMode === value;
      source.append(option);
    }
    source.addEventListener("change", () => {
      this.updatePreferences({ ...this.preferences, generationMode: source.value === "sidecar" ? "sidecar" : "roleplay" });
      this.renderFirstChatSetupBody();
    });
    sourceControls.append(source);
    if (this.preferences.generationMode === "sidecar") {
      const connectionMount = el("div", "lp-model-combobox");
      const connectionOptions = (this.generation?.connections || []).map((entry) => ({ value: entry.id, label: entry.name, sublabel: `${entry.provider} · ${entry.model || "Choose model"}` }));
      const changeConnection = (value) => {
        this.updatePreferences({ ...this.preferences, sidecarConnectionId: value, sidecarModelOverride: "" });
        this.renderFirstChatSetupBody();
      };
      if (this.ctx.components.mountSelect) {
        afterAttachment(connectionMount, () => this.ctx.components.mountSelect(connectionMount, { value: this.preferences.sidecarConnectionId, options: connectionOptions, ariaLabel: "Pocket connection", placeholder: "Choose connection", portal: false, className: "lp-setup-connection-select", maxHeight: 220, onChange: changeConnection }));
      } else {
        const connection = el("select", "lp-select");
        connection.setAttribute("aria-label", "Pocket connection");
        connection.append(new Option("Choose connection", ""));
        for (const entry of connectionOptions)
          connection.append(new Option(entry.label, entry.value, false, entry.value === this.preferences.sidecarConnectionId));
        connection.addEventListener("change", () => changeConnection(connection.value));
        connectionMount.append(connection);
      }
      const modelMount = el("div", "lp-model-combobox");
      afterAttachment(modelMount, () => this.ctx.components.mountModelCombobox(modelMount, { value: this.preferences.sidecarModelOverride, connection: { kind: "llm", id: this.preferences.sidecarConnectionId || undefined }, disabled: !this.preferences.sidecarConnectionId, placeholder: "Use connection model", onChange: (value) => this.updatePreferences({ ...this.preferences, sidecarModelOverride: value }) }));
      const connectionLabel = el("div", "lp-setup-field", "Connection");
      connectionLabel.append(connectionMount);
      const modelLabel = el("div", "lp-setup-field", "Model");
      modelLabel.append(modelMount);
      sourceControls.append(connectionLabel, modelLabel);
    }
    llm.append(sourceControls);
    const personaReady = Boolean(state.setup.personaConfigured);
    const persona = el("section", "lp-card lp-settings-section");
    persona.append(el("strong", "", personaReady ? state.pocketPersona.displayName : this.activePersona?.name || "Choose the phone owner"), el("p", "lp-copy", personaReady ? "This character owns Pocket and is the recipient role for private DMs." : "Choose who Pocket follows as the phone owner."));
    stage(persona, "03", "Choose the phone owner", personaReady ? "Linked" : "Choose owner", personaReady);
    const personaActions = el("div", "lp-row");
    if (this.activePersona) {
      const follow = button(`Follow ${this.activePersona.name}`, "lp-button");
      follow.addEventListener("click", () => {
        follow.disabled = true;
        follow.textContent = "Saving…";
        this.send("lumiphone:save_pocket_persona", { followLumiverse: true, persona: state.pocketPersona });
      });
      personaActions.appendChild(follow);
    }
    const customize = button("Customize", "lp-button lp-button-quiet");
    customize.addEventListener("click", () => {
      this.setupPersonaEditing = true;
      this.personaPreview = null;
      this.renderFirstChatPersonaEditor();
    });
    personaActions.appendChild(customize);
    persona.appendChild(personaActions);
    const worldStatus = state.setup.worldStatus || "unconfigured";
    const goal = state.events.find((event) => event.lane === "Current goal" && !event.completed);
    const world = el("section", "lp-card lp-settings-section");
    world.append(el("strong", "", worldStatus === "seeded" ? "Seeded from this roleplay" : worldStatus === "skipped" ? "Skipped" : "No world baseline yet"), el("p", "lp-copy", worldStatus === "seeded" ? goal ? `Timeline goal: ${goal.title}` : "Weather and Timeline were seeded; no clear current goal was found." : worldStatus === "skipped" ? "Pocket will start without situational first-turn hooks. You can add world state later." : "Seed a sanitized world snapshot from the current RP. Raw narrative is not used as phone history."));
    stage(world, "04", "Bring in your world", worldStatus === "seeded" ? "Seeded" : "Optional", worldStatus === "seeded");
    const worldActions = el("div", "lp-row");
    const worldOperation = [...this.operations.values()].find((entry) => entry.task === "world-seed" && entry.phase !== "complete" && entry.phase !== "error");
    const seed = button(worldOperation ? "Seeding…" : worldStatus === "seeded" ? "Reseed from RP" : "Seed from current RP", "lp-button");
    seed.disabled = !this.caps?.generation || Boolean(worldOperation);
    seed.addEventListener("click", () => {
      seed.disabled = true;
      seed.textContent = "Seeding…";
      const operationRequestId = this.send("lumiphone:setup_world_seed", { timezoneOffsetMinutes: new Date().getTimezoneOffset() });
      const progress = el("div", "lp-operation-progress");
      progress.dataset.operationRequest = operationRequestId;
      progress.dataset.phase = "generating";
      progress.setAttribute("role", "status");
      const label = el("strong", "", "Reading roleplay and seeding world…");
      label.dataset.operationMessage = "true";
      progress.append(el("span", "lp-indeterminate"), label);
      world.appendChild(progress);
    });
    const skip = button("Skip", "lp-button lp-button-quiet");
    skip.addEventListener("click", () => this.send("lumiphone:setup_world_skip"));
    worldActions.append(seed, skip);
    world.appendChild(worldActions);
    if (worldOperation) {
      const progress = el("div", "lp-operation-progress");
      progress.dataset.operationRequest = worldOperation.requestId;
      progress.dataset.phase = worldOperation.phase;
      progress.setAttribute("role", "status");
      const label = el("strong", "", worldOperation.message);
      label.dataset.operationMessage = "true";
      progress.append(el("span", "lp-indeterminate"), label);
      world.appendChild(progress);
    }
    const start = button("Start Pocket", "lp-button");
    start.disabled = !llmReady || !personaReady;
    start.title = !llmReady ? "Pocket needs a working LLM first." : !personaReady ? "Choose the phone owner first." : "";
    start.addEventListener("click", () => {
      start.disabled = true;
      start.textContent = "Starting…";
      this.send("lumiphone:finish_setup", { authorship: mode.value });
    });
    const later = button("Not now", "lp-button lp-button-quiet");
    later.addEventListener("click", () => {
      this.send("lumiphone:dismiss_setup");
      this.setupModalDismiss?.();
    });
    const footer = el("footer", "lp-setup-footer");
    const readiness = el("p", "lp-copy", !llmReady ? "Connect a model to continue." : !personaReady ? "Choose a phone owner to continue." : "Your phone is ready. World setup is optional.");
    readiness.setAttribute("role", "status");
    start.classList.add("lp-setup-start");
    footer.append(readiness, later, start);
    body.append(authorship, llm, persona, world, footer);
  }
  renderFirstChatPersonaEditor() {
    const body = this.setupModalBody;
    const state = this.state;
    if (!body || !state)
      return;
    body.replaceChildren();
    for (const cleanup of this.setupControlCleanups.splice(0))
      cleanup();
    const profile = this.personaPreview || state.pocketPersona;
    const phoneProfile = profile.phoneProfile || { personality: "", appearance: "", textingStyle: "" };
    const back = button("← Back to setup", "lp-button lp-button-quiet");
    back.addEventListener("click", () => {
      this.setupPersonaEditing = false;
      this.personaPreview = null;
      this.renderFirstChatSetupBody();
    });
    body.append(back, el("div", "lp-setup-code", "POCKET / IDENTITY"), el("h1", "lp-setup-title", "Make it their phone."), el("p", "lp-copy", "Keep this compact and useful for texting. Pocket does not need a full prose character card to generate a DM."));
    const source = el("select", "lp-select");
    for (const [value, label] of [["lumiverse", "Follow Lumiverse Persona"], ["manual", "Use Pocket profile"]]) {
      const option = el("option", "", label);
      option.value = value;
      option.selected = profile.source === value || profile.source === "generated" && value === "manual";
      source.appendChild(option);
    }
    const name = el("input", "lp-input");
    name.placeholder = "Display name";
    name.value = profile.displayName;
    const pronouns = el("input", "lp-input");
    pronouns.placeholder = "Pronouns";
    pronouns.value = profile.pronouns;
    const role = el("input", "lp-input");
    role.placeholder = "Role";
    role.value = profile.role;
    const personality = el("textarea", "lp-textarea");
    personality.placeholder = "Personality — stable traits that shape conversation";
    personality.value = phoneProfile.personality;
    const appearance = el("textarea", "lp-textarea");
    appearance.placeholder = "Minimal appearance — only a few recognizable details";
    appearance.value = phoneProfile.appearance;
    const textingStyle = el("textarea", "lp-textarea");
    textingStyle.placeholder = "Texting quirks — lowercase, punctuation, slang/register, emoji/kaomoji habits, fragmentation…";
    textingStyle.value = phoneProfile.textingStyle;
    const coreFields = [name, pronouns, role];
    const syncSource = () => {
      const followsLumiverse = source.value === "lumiverse";
      for (const field of coreFields)
        field.disabled = followsLumiverse;
    };
    source.addEventListener("change", syncSource);
    syncSource();
    const fields = el("section", "lp-card lp-settings-section lp-setup-profile");
    const labelled = (title, control) => {
      const label = el("label", "lp-setup-field", title);
      label.append(control);
      return label;
    };
    fields.append(labelled("Profile source", source), labelled("Display name", name), labelled("Pronouns", pronouns), labelled("Role", role), labelled("Personality", personality), labelled("Appearance", appearance), labelled("Texting style", textingStyle));
    const actions = el("div", "lp-row");
    const personaOperation = [...this.operations.values()].find((entry) => entry.task === "persona-profile" && entry.phase !== "complete" && entry.phase !== "error");
    const stopButton = (requestId) => {
      const stop = button("Stop enrichment", "lp-button lp-enrichment-stop");
      stop.dataset.operationStop = requestId;
      stop.addEventListener("click", () => {
        this.send("lumiphone:cancel_persona_generation", { operationRequestId: requestId });
        this.recordOperationProgress({ task: "persona-profile", requestId, phase: "error", message: "Enrichment stopped. You can retry whenever you’re ready." });
      });
      return stop;
    };
    const enrich = button(personaOperation ? "Enriching…" : "Enrich with LLM", "lp-button lp-button-quiet");
    enrich.disabled = !this.caps?.generation || Boolean(personaOperation);
    enrich.addEventListener("click", () => {
      enrich.disabled = true;
      enrich.textContent = "Enriching…";
      for (const old of body.querySelectorAll(".lp-operation-progress"))
        old.remove();
      const operationRequestId = this.send("lumiphone:generate_pocket_persona");
      this.operations.set(operationRequestId, { task: "persona-profile", requestId: operationRequestId, phase: "generating", message: "Enriching phone profile…" });
      enrich.dataset.operationAction = operationRequestId;
      actions.append(stopButton(operationRequestId));
      const progress = el("div", "lp-operation-progress");
      progress.dataset.operationRequest = operationRequestId;
      progress.dataset.phase = "generating";
      progress.setAttribute("role", "status");
      const label = el("strong", "", "Enriching phone profile…");
      label.dataset.operationMessage = "true";
      progress.append(el("span", "lp-indeterminate"), label);
      body.appendChild(progress);
    });
    const save = button("Save phone profile", "lp-button");
    save.addEventListener("click", () => {
      save.disabled = true;
      save.textContent = "Saving…";
      this.send("lumiphone:save_pocket_persona", {
        followLumiverse: source.value === "lumiverse",
        persona: {
          ...state.pocketPersona,
          ...profile,
          source: source.value,
          displayName: name.value.trim(),
          pronouns: pronouns.value.trim(),
          role: role.value.trim(),
          phoneProfile: {
            personality: personality.value.trim(),
            appearance: appearance.value.trim(),
            textingStyle: textingStyle.value.trim()
          }
        }
      });
    });
    actions.append(enrich, save);
    body.append(fields, actions, identityProfileControls(this.identityProfiles, "persona", undefined, (type, payload) => this.send(type, payload), () => ({ name: name.value, pronouns: pronouns.value, role: role.value, identityBrief: profile.identityBrief, phoneProfile: { personality: personality.value, appearance: appearance.value, textingStyle: textingStyle.value } })));
    if (personaOperation) {
      enrich.dataset.operationAction = personaOperation.requestId;
      actions.append(stopButton(personaOperation.requestId));
      const progress = el("div", "lp-operation-progress");
      progress.dataset.operationRequest = personaOperation.requestId;
      progress.dataset.phase = personaOperation.phase;
      progress.setAttribute("role", "status");
      const label = el("strong", "", personaOperation.message);
      label.dataset.operationMessage = "true";
      progress.append(el("span", "lp-indeterminate"), label);
      body.appendChild(progress);
    }
    if (this.personaPreview) {
      body.insertBefore(el("p", "lp-copy", "✓ LLM enrichment loaded into the fields above. Review it, then save."), actions);
    }
  }
  field(labelText, value = "", type = "text") {
    const label = el("label", "lp-label", labelText);
    const input = el("input", "lp-input");
    input.type = type;
    input.value = value;
    label.appendChild(input);
    return { label, input };
  }
  empty(iconName, title, copy) {
    const node = el("div", "lp-empty");
    const inner = el("div");
    inner.append(icon2(iconName), el("h3", "lp-title", title), el("p", "lp-copy", copy));
    node.appendChild(inner);
    return node;
  }
  showError(message) {
    this.showFeedback(message, true);
  }
  showFeedback(message, error = false) {
    window.clearTimeout(this.alertTimer);
    this.alert.textContent = message;
    this.alert.dataset.severity = error ? "error" : "success";
    this.alert.hidden = false;
    this.alertTimer = window.setTimeout(() => {
      this.alert.hidden = true;
    }, 5500);
  }
}
function setupPhone(ctx) {
  const controller = new PocketController(ctx);
  ctx.ready();
  return () => controller.destroy();
}

// src/frontend/components/style-tokens.ts
var SURFACE_TOKENS = `
  .lumiphone-shell, .lp-media-viewer {
    --lp-space-1:4px; --lp-space-2:8px; --lp-space-3:12px; --lp-space-4:16px; --lp-space-5:24px;
    --lp-radius:18px; --lp-radius-control:12px; --lp-radius-bubble:18px;
    --lp-touch:44px; --lp-row-height:64px; --lp-outgoing:var(--lp-accent);
    --lp-incoming:color-mix(in srgb,var(--lp-text) 8%,var(--lp-bg)); --lp-destructive:#ed7c8c; --lp-success:#71cfa1;
    --lp-ease:cubic-bezier(.2,.8,.2,1); --lp-sheet-bg:var(--lp-bg,#141319);
    --lp-elevation:0 12px 36px #0002;
    --pocket-font-xs:calc(10px * var(--pocket-ui-scale,1));
    --pocket-font-sm:calc(12px * var(--pocket-ui-scale,1));
    --pocket-font-md:calc(14px * var(--pocket-ui-scale,1));
    --pocket-control-h:44px;
  }
`;

// src/frontend/components/design-system.ts
var POCKET_DESIGN_SYSTEM = `
${SURFACE_TOKENS}
  .lumiphone-shell { container-type:inline-size; }
  .lumiphone-shell :is(button,input,textarea,select,summary) { font-family:inherit; }
  .lumiphone-shell :is(button,input,textarea,select,summary):focus-visible,
  .lp-sheet :is(button,input,textarea,select):focus-visible { outline:2px solid var(--lp-accent,#a99bff); outline-offset:3px; }
  .lumiphone-shell .lp-nav { grid-template-columns:minmax(0,1fr) minmax(0,2fr) minmax(0,1fr); min-height:64px; gap:8px; padding:4px 12px; }
  .lumiphone-shell .lp-nav-title { white-space:normal; overflow-wrap:anywhere; font-size:15px; line-height:1.2; text-wrap:balance; }
  .lumiphone-shell .lp-nav-subtitle { font-size:10px; line-height:1.35; margin-top:4px; }
  .lumiphone-shell .lp-nav-action { min-width:0; min-height:var(--lp-touch); font-size:12px; overflow-wrap:anywhere; }
  .lumiphone-shell .lp-content { gap:var(--lp-space-3); padding:var(--lp-space-4); padding-bottom:calc(28px + env(safe-area-inset-bottom,0px)); }
  .lumiphone-shell .lp-card { border:0; border-radius:var(--lp-radius); box-shadow:none; padding:var(--lp-space-4); background:color-mix(in srgb,var(--lp-text) 5%,var(--lp-surface)); }
  .lumiphone-shell .lp-title { font-size:var(--pocket-font-md); }
  .lumiphone-shell .lp-copy { font-size:var(--pocket-font-sm); line-height:1.5; }
  .lumiphone-shell .lp-eyebrow { font-size:var(--pocket-font-xs); letter-spacing:.065em; line-height:1.4; }
  .lumiphone-shell .lp-fields { grid-template-columns:minmax(0,1fr); gap:var(--lp-space-4); }
  .lumiphone-shell :is(.lp-input,.lp-select,.lp-textarea) { width:100%; min-width:0; min-height:var(--lp-touch); border:1px solid var(--lp-border); border-radius:var(--lp-radius-control); padding:12px; font-size:var(--pocket-font-md); background:color-mix(in srgb,var(--lp-text) 3%,var(--lp-bg)); scroll-margin-block:80px; }
  .lumiphone-shell .lp-textarea { min-height:104px; resize:vertical; line-height:1.5; }
  .lumiphone-shell :is(.lp-field,.lp-label) { display:grid; gap:8px; min-width:0; font-size:12px; }
  .lumiphone-shell :is(.lp-field-label,.lp-control-label) { font-size:13px; font-weight:650; }
  .lumiphone-shell :is(.lp-field-help,.lp-control-help) { display:block; font-size:12px; line-height:1.45; margin-top:4px; }
  .lumiphone-shell .lp-button { min-height:var(--lp-touch); font-size:12px; border-radius:var(--lp-radius-control); }
  .lumiphone-shell .lp-button-quiet { background:transparent; border-color:transparent; }
  .lumiphone-shell .lp-button-danger { color:var(--lp-destructive); }
  .lumiphone-shell .lp-chip { min-height:36px; padding:8px 12px; font-size:11px; }
  .lumiphone-shell .lp-chipbar { gap:4px; flex-wrap:wrap; }
  .lumiphone-shell .lp-chip[aria-pressed="true"] { background:color-mix(in srgb,var(--lp-accent) 22%,var(--lp-surface)); color:var(--lp-text); border-color:transparent; }
  .lumiphone-shell .lp-setting-row { min-height:58px; padding:10px 0; border-bottom:1px solid var(--lp-border); gap:16px; }
  .lp-setting-row > span:first-child { min-width:0; display:grid; gap:4px; }
  .lp-setting-row strong { font-size:13px; font-weight:650; }
  .lp-setting-row .lp-copy { display:block; }
  .lp-wallpaper-control .lp-row-between > span { display:grid; gap:4px; min-width:0; }
  .lumiphone-shell .lp-contact-check { display:grid; grid-template-columns:24px minmax(0,1fr); gap:4px 8px; align-items:center; padding:10px 0; min-height:44px; border-bottom:1px solid var(--lp-border); }
  .lp-contact-check input { grid-row:1 / 3; width:18px; height:18px; margin:0; }
  .lp-contact-check > .lp-copy { grid-column:2; }
  .lumiphone-shell .lp-toggle { flex:0 0 40px; }
  .lumiphone-shell .lp-settings-list { gap:0; }
  .lumiphone-shell .lp-settings-category { min-height:var(--lp-row-height); border-radius:0; border-bottom:1px solid var(--lp-border); padding:14px 12px; }
  .lp-settings-category:first-child { border-radius:18px 18px 0 0; }
  .lp-settings-category:last-child { border-radius:0 0 18px 18px; border-bottom:0; }
  .lp-settings-category strong { font-size:14px; }
  .lp-disclosure { border-radius:var(--lp-radius,16px); background:color-mix(in srgb,var(--lp-text,#fff) 5%,var(--lp-surface,#18171e)); min-width:0; }
  .lp-disclosure > summary { cursor:pointer; min-height:44px; padding:14px; font-size:12px; font-weight:650; }
  .lp-disclosure > :not(summary) { margin:0 12px 12px; }
  .lp-theme-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
  .lp-theme-preview { min-width:0; min-height:60px; border:1px solid transparent; background:transparent; color:var(--lp-text); border-radius:12px; padding:8px 4px; font-size:11px; font-weight:550; display:grid; justify-items:center; align-content:center; gap:6px; cursor:pointer; }
  .lp-theme-preview::before { content:''; width:24px; height:24px; border-radius:50%; background:var(--theme-color); box-shadow:inset 0 0 0 1px #ffffff30; }
  .lp-theme-preview[aria-pressed="true"] { border-color:var(--lp-border); background:color-mix(in srgb,var(--lp-text) 7%,transparent); }
  .lumiphone-shell .lp-accent-control { min-height:56px; padding:6px 14px; border:0; border-radius:var(--lp-radius-control); background:color-mix(in srgb,var(--lp-text) 5%,var(--lp-surface)); }
  .lumiphone-shell .lp-palette-disclosure { padding:2px; }
  .lp-palette-disclosure > summary { padding:12px; }
  .lp-palette-disclosure > .lp-palette-sections { margin:0; padding:0 12px 14px; display:grid; gap:12px; }
  .lp-palette-group { min-width:0; }
  .lp-palette-heading { margin:0 0 6px; color:var(--lp-muted); font-size:11px; font-weight:600; }
  .lp-palette-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
  .lp-palette-grid:has(> :nth-child(2):last-child) { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .lumiphone-shell .lp-palette-grid .lp-setting-row { min-width:0; min-height:78px; padding:8px 3px; border:0; border-radius:12px; display:flex; flex-direction:column-reverse; justify-content:center; gap:4px; background:color-mix(in srgb,var(--lp-text) 4%,transparent); }
  .lp-palette-grid .lp-setting-row strong { font-size:10px; font-weight:550; overflow-wrap:anywhere; text-align:center; }
  .lumiphone-shell .lp-palette-bezel { min-height:48px; padding:2px 0 8px; }
  .lumiphone-shell :is(.lp-accent-control,.lp-palette-sections) .lp-color-input { flex-shrink:0; width:44px; height:44px; padding:5px; border:1px solid var(--lp-border); border-radius:50%; background:transparent; cursor:pointer; overflow:hidden; }
  .lumiphone-shell :is(.lp-accent-control,.lp-palette-sections) .lp-color-input::-webkit-color-swatch-wrapper { padding:0; }
  .lumiphone-shell :is(.lp-accent-control,.lp-palette-sections) .lp-color-input::-webkit-color-swatch { border:0; border-radius:50%; }
  .lumiphone-shell :is(.lp-accent-control,.lp-palette-sections) .lp-color-input::-moz-color-swatch { border:0; border-radius:50%; }
  .lp-theme-live { display:grid; gap:12px; border-radius:22px; padding:20px; min-height:145px; border:1px solid var(--lp-border); }
  .lp-theme-live .lp-message-surface { justify-self:end; }
  .lumiphone-shell .lp-color-grid { grid-template-columns:minmax(0,1fr); }
  .lumiphone-shell .lp-home-activity-item { grid-template-columns:minmax(0,1fr) 16px; gap:4px 8px; padding:12px; border-radius:18px; }
  .lp-home-activity-item strong { grid-column:1; font-size:12px; }
  .lp-home-activity-item > span:not(.lp-home-activity-arrow) { grid-row:2; grid-column:1; font-size:11px; }
  .lp-home-activity-arrow { grid-column:2; grid-row:1 / 3; }
  .lumiphone-shell .lp-conversation-row { width:100%; min-height:80px; background:transparent; color:var(--lp-text); border:0; border-bottom:1px solid var(--lp-border); text-align:left; padding:12px 0; }
  .lumiphone-shell .lp-avatar { width:calc(44px * var(--pocket-ui-scale,1)); height:calc(44px * var(--pocket-ui-scale,1)); flex:0 0 calc(44px * var(--pocket-ui-scale,1)); aspect-ratio:1; font-size:calc(17px * var(--pocket-ui-scale,1)); }
  .lumiphone-shell .lp-identity-line { display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; }
  .lumiphone-shell .lp-identity-name { font-size:14px; line-height:1.35; }
  .lumiphone-shell .lp-identity-meta { font-size:10px; }
  .lumiphone-shell .lp-identity-description { font-size:12px; line-height:1.5; }
  .lp-conversation-row .lp-identity-line { flex-wrap:nowrap; justify-content:space-between; }
  .lp-conversation-row .lp-identity-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-conversation-row .lp-identity-meta { white-space:nowrap; flex-shrink:0; }
  .lumiphone-shell .lp-bubbles { gap:12px; padding:16px 12px 24px; }
  .lp-message-surface, .lumiphone-shell .lp-bubble { padding:10px 13px; border-radius:var(--lp-radius-bubble,18px); font-size:var(--pocket-font-md,14px); line-height:1.5; overflow-wrap:anywhere; box-shadow:none; }
  .lumiphone-shell .lp-bubble { max-width:86%; position:relative; }
  .lumiphone-shell .lp-bubble[data-sender="persona"] { background:var(--lp-outgoing); color:#fff; border-bottom-right-radius:7px; }
  .lumiphone-shell .lp-bubble[data-sender="contact"] { background:var(--lp-incoming); border-bottom-left-radius:7px; }
  .lumiphone-shell .lp-bubble::after { display:none; }
  .lumiphone-shell .lp-bubble[data-burst-continuation="true"] { margin-top:-8px; }
  .lumiphone-shell .lp-bubble[data-burst-continuation="true"][data-sender="persona"] { border-top-right-radius:7px; }
  .lumiphone-shell .lp-bubble[data-burst-continuation="true"][data-sender="contact"] { border-top-left-radius:7px; }
  .lumiphone-shell .lp-group-message { max-width:94%; margin-top:0; }
  .lumiphone-shell .lp-group-message[data-continuation="true"] { margin-top:-8px; }
  .lumiphone-shell .lp-group-message .lp-bubble { max-width:100%; margin-top:0; }
  .lumiphone-shell .lp-bubble-time { font-size:9px; opacity:.78; padding-right:30px; min-height:22px; margin-top:6px; }
  .lp-message-more { position:absolute; bottom:2px; right:2px; width:44px; height:44px; border:0; border-radius:50%; background:transparent; color:inherit; font-size:20px; cursor:pointer; }
  .lp-sheet { box-sizing:border-box; width:min(440px,calc(100% - 24px)); max-height:calc(100dvh - 48px); border:1px solid var(--lp-border,#ffffff25); border-radius:calc(24px * var(--pocket-ui-scale,1)); padding:0; background:var(--lp-sheet-bg,#17151d); color:var(--lp-text,#f7f5ff); box-shadow:0 24px 80px #0008; }
  .lp-sheet::backdrop { background:#0006; backdrop-filter:blur(4px); }
  .lp-sheet-panel { display:grid; gap:calc(16px * var(--pocket-ui-scale,1)); padding:calc(20px * var(--pocket-ui-scale,1)); padding-bottom:max(calc(20px * var(--pocket-ui-scale,1)),env(safe-area-inset-bottom)); }
  .lp-sheet-actions, .lp-sheet .lp-bubble-tools { display:grid; gap:calc(6px * var(--pocket-ui-scale,1)); margin:0; }
  .lp-sheet .lp-bubble-action { width:100%; min-height:max(44px,calc(44px * var(--pocket-ui-scale,1))); opacity:1; font-size:calc(14px * var(--pocket-ui-scale,1)); border-radius:calc(12px * var(--pocket-ui-scale,1)); justify-content:start; padding:calc(12px * var(--pocket-ui-scale,1)); background:#ffffff09; }
  .lp-sheet .lp-button { min-height:max(44px,calc(44px * var(--pocket-ui-scale,1))); }
  .lumiphone-shell .lp-notification-row { padding:0; border-radius:18px; }
  .lp-notification-open { gap:10px; align-items:flex-start; }
  .lp-notification-avatar { flex:0 0 32px; height:32px; border-radius:10px; background:var(--lp-incoming); display:grid!important; place-items:center; font-size:13px; }
  .lp-notification-dismiss { min-width:44px; align-self:start; height:44px; }
  .lp-notification-open time { margin-top:6px; }
  .lp-notification-open strong { font-size:13px; }
  .lumiphone-shell .lp-note-editor { display:flex; flex-direction:column; min-height:calc(100% - 64px); gap:8px; }
  .lumiphone-shell .lp-note-editor :is(.lp-note-title,.lp-note-body) { border:0; background:transparent; padding:8px 0; border-radius:0; }
  .lumiphone-shell .lp-note-editor .lp-note-title { font-size:24px; font-weight:700; }
  .lumiphone-shell .lp-note-editor .lp-note-body { flex:1; min-height:240px; line-height:1.8; resize:vertical; }
  .lumiphone-shell .lp-note-card { text-align:left; color:var(--lp-text); }
  .lumiphone-shell .lp-weather-hero { min-height:280px; border-radius:24px; padding:24px; }
  .lp-weather-note { margin:8px 4px; font-size:14px; line-height:1.7; color:var(--lp-muted); }
  .lumiphone-shell .lp-event[data-completed="true"] { opacity:1; }
  .lumiphone-shell .lp-event[data-completed="true"] .lp-title { text-decoration:none; color:var(--lp-muted); }
  .lp-event-card { width:100%; text-align:left; color:var(--lp-text); }
  .lp-event-card .lp-status-badge { margin-top:8px; }
  .lumiphone-shell .lp-status-badge { font-size:10px; }
  .lumiphone-shell .lp-camera { min-height:100%; }
  .lumiphone-shell .lp-viewfinder { min-height:240px; border-radius:0; margin:0; }
  .lumiphone-shell .lp-camera-controls { gap:6px; }
  .lp-camera .lp-disclosure { background:#16161a; }
  .lp-camera .lp-disclosure > summary { color:#e9e7ef; }
  .lp-media-viewer { --lp-text:#f7f5ff; --lp-bg:#141319; --lp-muted:#b9b5c5; --lp-border:#ffffff22; }
  .lp-media-viewer .lp-gallery-actions { display:flex; flex-wrap:wrap; justify-content:space-around; gap:8px; padding:16px 0; }
  .lp-media-viewer .lp-button { min-height:44px; font-size:13px; color:var(--lp-text); background:#ffffff0b; }
  .lp-bubble.lp-call-history { align-self:center; max-width:90%; border-radius:16px; background:var(--lp-surface); border:1px solid var(--lp-border); text-align:center; }
  @container (max-width:360px) {
    .lumiphone-shell .lp-content { padding-inline:12px; }
    .lumiphone-shell .lp-nav { padding-inline:8px; gap:4px; }
    .lumiphone-shell .lp-nav-title { font-size:14px; }
    .lumiphone-shell .lp-actions { flex-wrap:wrap; }
    .lumiphone-shell .lp-row { flex-wrap:wrap; }
  }
  @media (prefers-reduced-motion:reduce) { .lumiphone-shell * { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
`;

// src/frontend/components/voice-message-styles.ts
var VOICE_MESSAGE_STYLES = `
.lp-voice-message { display:grid; gap:8px; min-width:0; }
.lp-voice-play { padding:9px 12px; border:1px solid currentColor; border-radius:10px; color:inherit; background:transparent; font:inherit; cursor:pointer; text-align:left; }
.lp-voice-play:focus-visible { outline:2px solid currentColor; outline-offset:3px; }
.lp-voice-play:disabled { opacity:.6; cursor:default; }
.lp-voice-status { font-size:11px; }
.lp-voice-status:empty { display:none; }
.lp-voice-transcript { font-size:12px; }
.lp-voice-transcript summary { cursor:pointer; }
.lp-voice-transcript p { white-space:pre-wrap; overflow-wrap:anywhere; margin:8px 0 0; }
`;

// src/styles.ts
var PHONE_STYLES = `
  .lumiphone-widget-root, .lumiphone-widget-root *, .lumiphone-drawer, .lumiphone-drawer * { box-sizing: border-box; }
  .lumiphone-widget-root {
    width: 100%; height: 100%; display: grid; place-items: center; overflow: visible;
    color: #f7f5ff; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .lumiphone-handset-host { margin:auto; cursor:default; overscroll-behavior:contain; }
  .lp-setup { --lp-accent:var(--lumiverse-primary,#9399ab); --lp-text:var(--lumiverse-text,#eee); --lp-muted:var(--lumiverse-text-muted,#a5a3ac); --lp-border:var(--lumiverse-border,#ffffff14); --lp-setup-surface:var(--lumiverse-bg-elevated,#201e25); font:400 14px/1.5 Inter,ui-sans-serif,system-ui,sans-serif; color:var(--lp-text); display:grid; gap:16px; min-width:0; }
  .lp-setup, .lp-setup * { box-sizing:border-box; }
  .lp-setup .lp-setup-hero { display:flex; align-items:center; gap:18px; padding:22px; border:1px solid var(--lp-border); border-radius:16px; background:linear-gradient(90deg,transparent 23px,var(--lp-border) 24px,transparent 25px),linear-gradient(transparent 23px,var(--lp-border) 24px,transparent 25px); background-size:24px 24px; }
  .lp-setup .lp-setup-intro { flex:1; min-width:0; }
  .lp-setup .lp-setup-code { font:600 10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; letter-spacing:.12em; color:var(--lp-accent); }
  .lp-setup .lp-setup-title { font-size:25px; line-height:1.15; letter-spacing:-.04em; font-weight:700; margin:9px 0; color:var(--lp-text); }
  .lp-setup .lp-setup-diagram { flex:none; width:60px; height:80px; padding:13px; border:1px solid color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border)); border-radius:14px; background:var(--lp-setup-surface); color:var(--lp-accent); box-shadow:0 6px 16px #0002; transform:rotate(7deg); }
  .lp-setup .lp-setup-diagram svg { width:100%; height:100%; }
  .lp-setup > .lp-card { display:grid; gap:12px; padding:18px; border:1px solid var(--lp-border); border-radius:14px; background:var(--lp-setup-surface); box-shadow:0 3px 10px #0001; min-width:0; }
  .lp-setup .lp-setup-stage-heading { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .lp-setup .lp-setup-index { color:var(--lp-accent); font:600 11px ui-monospace,Consolas,monospace; border-right:1px solid var(--lp-border); padding-right:10px; }
  .lp-setup .lp-setup-stage-title { font:650 14px/1.4 Inter,ui-sans-serif,system-ui,sans-serif; color:var(--lp-text); margin:0; flex:1; min-width:140px; }
  .lp-setup .lp-setup-status { font:500 10px/1.5 ui-monospace,Consolas,monospace; color:var(--lp-muted); padding:3px 7px; border:1px solid var(--lp-border); border-radius:6px; }
  .lp-setup .lp-setup-status[data-ready="true"] { color:var(--lp-accent); border-color:color-mix(in srgb,var(--lp-accent) 30%,var(--lp-border)); }
  .lp-setup .lp-copy { font-size:12px; line-height:1.6; color:var(--lp-muted); margin:0; overflow-wrap:anywhere; }
  .lp-setup .lp-row { display:flex; flex-wrap:wrap; gap:8px; }
  .lp-setup :is(.lp-select,.lp-input,.lp-textarea) { width:100%; min-width:0; min-height:42px; font:inherit; color:var(--lp-text); padding:10px; background:var(--lumiverse-fill-subtle,#ffffff05); border:1px solid var(--lp-border); border-radius:9px; }
  .lp-setup .lp-button { appearance:none; border:1px solid var(--lp-border); border-radius:9px; min-height:40px; padding:9px 14px; font:600 12px/1.4 Inter,ui-sans-serif,system-ui,sans-serif; color:var(--lp-text); background:var(--lumiverse-fill,#ffffff08); cursor:pointer; white-space:normal; }
  .lp-setup .lp-button:disabled { opacity:.45; cursor:default; }
  .lp-setup :is(button,input,select,textarea):focus-visible { outline:2px solid var(--lp-accent); outline-offset:3px; }
  .lp-setup .lp-setup-modes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .lp-setup .lp-setup-mode { display:flex; align-items:flex-start; gap:9px; border:1px solid var(--lp-border); border-radius:10px; padding:13px; cursor:pointer; background:var(--lumiverse-fill-subtle,#ffffff03); }
  .lp-setup .lp-setup-mode:has(input:checked) { border-color:color-mix(in srgb,var(--lp-accent) 55%,var(--lp-border)); background:color-mix(in srgb,var(--lp-accent) 7%,var(--lp-setup-surface)); }
  .lp-setup .lp-setup-mode input { appearance:auto; accent-color:var(--lp-accent); margin:3px 0 0; width:14px; height:14px; flex:none; }
  .lp-setup .lp-setup-mode-copy { display:grid; gap:5px; min-width:0; }
  .lp-setup .lp-setup-mode-copy strong { font-size:13px; }
  .lp-setup .lp-setup-mode-copy > span { font-size:11px; line-height:1.5; color:var(--lp-muted); }
  .lp-setup .lp-setup-field { display:grid; gap:7px; font-size:11px; font-weight:600; color:var(--lp-muted); min-width:0; }
  .lp-setup .lp-setup-profile { gap:16px; }
  .lp-setup .lp-setup-footer { display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:12px; padding:8px 0 2px; }
  .lp-setup .lp-setup-start { background:var(--lp-accent); color:var(--lumiverse-text-on-primary,#111); border-color:transparent; }
  .lp-setup .lp-operation-progress { display:grid; gap:7px; padding:12px; border:1px solid var(--lp-border); border-radius:9px; background:var(--lumiverse-fill-subtle,#ffffff05); font-size:12px; }
  .lp-setup .lp-operation-progress[data-phase="error"] { border-color:var(--lumiverse-danger,#c65c65); }
  .lp-setup .lp-setup-connection-select [role="listbox"] { position:relative; top:auto; left:auto; right:auto; margin-top:6px; }
  .lumiphone-device-search { width:100%; min-height:38px; padding:8px 11px; margin:0 0 14px; border:1px solid var(--pocket-border,var(--lumiverse-border,#ffffff14)); border-radius:9px; background:var(--lumiverse-fill-subtle,#ffffff05); color:var(--lumiverse-text,#eee); font:inherit; }
  .lumiphone-device-row[hidden], .lumiphone-device-section[hidden] { display:none; }
  .lumiphone-shell .lp-sheet .lp-bubble-tools { display:grid; grid-template-columns:1fr; gap:calc(6px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-sheet .lp-bubble-action { display:flex; align-items:center; justify-content:flex-start; gap:calc(12px * var(--pocket-ui-scale)); border:1px solid var(--lp-border); color:var(--lp-text); }
  .lumiphone-shell .lp-sheet .lp-bubble-action::before { content:'↻'; font-size:calc(19px * var(--pocket-ui-scale)); width:calc(24px * var(--pocket-ui-scale)); text-align:center; color:var(--lp-accent); }
  .lumiphone-shell .lp-sheet .lp-bubble-action[aria-label="Generation info"]::before { content:'ⓘ'; }
  .lumiphone-shell .lp-sheet .lp-bubble-action[data-destructive="true"] { color:var(--lp-destructive); }
  .lumiphone-shell .lp-sheet .lp-bubble-action[data-destructive="true"]::before { content:'×'; color:inherit; }
  .lumiphone-shell .lp-theme-preview::before { content:none; }
  .lp-theme-preview { position:relative; }
  .lp-theme-selected { display:none; position:absolute; top:10px; right:10px; width:22px; height:22px; border-radius:50%; background:var(--theme-color); color:#fff; font-size:14px; text-shadow:0 1px 3px #000; align-items:center; justify-content:center; }
  .lp-theme-preview[aria-pressed="true"] .lp-theme-selected { display:flex; }
  .lp-theme-custom-label { position:absolute; bottom:40px; left:0; width:100%; color:#fff; font-size:var(--pocket-font-sm); text-shadow:0 1px 4px #000; }
  .lumiphone-shell .lp-theme-miniature { display:flex; flex-direction:column; align-items:center; justify-content:space-between; width:100%; aspect-ratio:9 / 12; padding:14px 6px 6px; border-radius:10px; border:1px solid var(--lp-border); background-color:var(--theme-color); background-size:cover; background-position:center; color:#fff; font-size:17px; font-weight:400; text-shadow:0 1px 5px #0007; }
  .lumiphone-shell .lp-theme-miniature-dock { width:100%; border-radius:6px; padding:3px; background:#0004; font-size:12px; letter-spacing:5px; }
  .lumiphone-shell .lp-theme-preview-incoming { padding:11px 14px; border-radius:14px 14px 14px 4px; background:var(--lp-surface); justify-self:start; font-size:13px; }
  .lumiphone-shell .lp-contact-list { display:grid; gap:2px; }
  .lumiphone-shell .lp-contact-row { border-radius:10px; min-height:64px; padding:10px 12px; background:transparent; border:1px solid transparent; }
  .lumiphone-shell .lp-contact-row:hover { background:color-mix(in srgb,var(--lp-text) 4%,var(--lp-surface)); border-color:var(--lp-border); }
  .lumiphone-shell .lp-contact-presence-label { font-size:10px; color:var(--lp-success); padding:4px 7px; border-radius:6px; background:color-mix(in srgb,var(--lp-success) 8%,transparent); }
  .lumiphone-shell .lp-contact-presence-away { color:var(--lp-muted); background:color-mix(in srgb,var(--lp-text) 4%,transparent); }
  .lp-setup-generation { display:grid; gap:10px; min-width:0; }
  @media(max-width:480px) { .lp-setup .lp-setup-modes { grid-template-columns:1fr; } .lp-setup .lp-setup-hero { padding:18px; } .lp-setup .lp-setup-diagram { width:48px; height:66px; padding:10px; } .lp-setup .lp-setup-footer { grid-template-columns:1fr 1fr; } .lp-setup .lp-setup-footer > p { grid-column:1 / -1; } }
  .lumiphone-launcher {
    appearance: none; width: 58px; height: 58px; padding: 0; border: 0;
    border-radius: 18px; display: grid; place-items: center; position: relative; cursor: pointer;
    color: #fff; background: transparent;
    filter:drop-shadow(0 5px 7px #0006);
    transition: transform .2s ease, box-shadow .2s ease; touch-action: none;
  }
  .lumiphone-launcher:hover { transform: translateY(-2px) rotate(-5deg); }
  .lumiphone-launcher-phone { width:31px; height:48px; display:grid; position:relative; border:2px solid #b8afd2; border-radius:10px; padding:6px 3px; background:#252131; transform:rotate(8deg); box-shadow:inset 0 0 0 1px #17141f; }
  .lumiphone-launcher-phone::before { content:''; position:absolute; top:3px; left:10px; width:7px; height:2px; border-radius:4px; background:#b8afd2; z-index:1; }
  .lumiphone-launcher-phone::after { content:''; position:absolute; bottom:3px; left:10px; width:7px; height:2px; border-radius:4px; background:#d6cfee; }
  .lumiphone-launcher-screen { display:grid; grid-template-columns:repeat(2,1fr); align-content:end; gap:3px; padding:5px 3px; border-radius:5px; background:linear-gradient(155deg,#b6a0e3,#7c86bb 50%,#5daca4); }
  .lumiphone-launcher-screen i { width:6px; height:6px; border-radius:2px; background:#fff9; }
  .lumiphone-launcher-screen i:nth-child(2) { background:#ffe3a7; }
  .lumiphone-launcher-screen i:nth-child(3) { background:#84e2b1; }
  .lumiphone-launcher-screen i:nth-child(4) { background:#e3b1d9; }
  .lumiphone-launcher:focus-visible { outline: 3px solid color-mix(in srgb,#9a8cff 58%,white); outline-offset: 3px; }
  .lumiphone-launcher svg { width: 27px; height: 27px; }
  .lumiphone-badge {
    position: absolute; top: -5px; right: -5px; min-width: 20px; height: 20px; padding: 0 5px;
    border: 2px solid #1b1722; border-radius: 999px; display: grid; place-items: center;
    background: #ff496d; color: white; font-size: 10px; font-weight: 850; line-height: 1;
  }
  .lumiphone-badge[hidden] { display: none; }

  .lumiphone-shell {
    --lp-accent: #8b7dff; --lp-bezel: #17151d; --lp-wallpaper: linear-gradient(145deg,#171327,#33235f 48%,#123a4a);
    --lp-chat-wallpaper: linear-gradient(180deg,rgba(139,125,255,.16),rgba(19,17,28,.03));
    --lp-bg: #0d0c12; --lp-surface: rgba(31,29,40,.88); --lp-surface-2: rgba(50,47,62,.78);
    --lp-text: #f7f5ff; --lp-muted: #aaa5b6; --lp-border: rgba(255,255,255,.11); --lp-shadow: rgba(0,0,0,.45);
    --lp-animation-ms: 280ms; --pocket-ui-scale:1; --pocket-device-ratio:9 / 18.4;
    --pocket-font-xs:calc(8px * var(--pocket-ui-scale)); --pocket-font-sm:calc(10px * var(--pocket-ui-scale));
    --pocket-font-md:calc(13px * var(--pocket-ui-scale)); --pocket-control-h:calc(38px * var(--pocket-ui-scale));
    --pocket-gap:calc(10px * var(--pocket-ui-scale)); --pocket-icon:calc(54px * var(--pocket-ui-scale));
    width: 100%; height: 100%; min-width: 0; min-height: 0; aspect-ratio: var(--pocket-device-ratio); overflow: hidden; position: relative; isolation: isolate;
    border: 8px solid var(--lp-bezel); border-radius: 45px; background: var(--lp-bg); color: var(--lp-text);
    box-shadow: 0 36px 90px var(--lp-shadow), 0 0 0 1px rgba(255,255,255,.09) inset;
    display: grid; grid-template-rows: 34px minmax(0,1fr) 24px;
  }
  .lumiphone-shell[hidden], .lumiphone-launcher[hidden] { display: none !important; }
  .lumiphone-shell[data-theme="pink"] { --lp-surface-2:#f4d4e6; --lp-muted:#754b63; --lp-border:rgba(56,18,44,.18); --lp-shadow:rgba(80,20,55,.24); }
  .lumiphone-shell[data-theme="porcelain"] { --lp-bg:#f2f0ed; --lp-surface:rgba(255,255,255,.9); --lp-surface-2:rgba(226,222,218,.82); --lp-text:#231f2a; --lp-muted:#746e78; --lp-border:rgba(37,30,45,.12); --lp-shadow:rgba(35,28,46,.24); }
  .lumiphone-shell[data-theme="rose"] { --lp-bg:#171318; --lp-surface:#271e25; --lp-surface-2:#3b2b31; --lp-text:#fff5ec; --lp-muted:#d1b8ad; --lp-border:rgba(255,201,160,.17); --lp-shadow:rgba(28,16,23,.5); }
  .lumiphone-shell[data-theme="forest"] { --lp-bg:#0d1713; --lp-surface:rgba(23,48,38,.9); --lp-surface-2:rgba(38,77,59,.76); --lp-text:#effcf5; --lp-muted:#9ebcad; --lp-border:rgba(204,255,224,.12); --lp-shadow:rgba(3,26,16,.54); }
  .lumiphone-statusbar {
    height: 34px; padding: 5px 16px 0; display: grid; grid-template-columns: minmax(0,1fr) 92px minmax(0,1fr); align-items: start;
    position: relative; z-index: 20; font-size: 10px; font-weight: 760; letter-spacing: .01em; user-select: none;
  }
  .lumiphone-status-leading { min-width:0; display:flex; align-items:flex-start; gap:4px; }
  .lumiphone-dismiss { appearance:none; width:22px; height:22px; padding:4px; border:0; border-radius:50%; display:grid; place-items:center; background:color-mix(in srgb,var(--lp-surface) 72%,transparent); color:var(--lp-text); cursor:pointer; }
  .lumiphone-dismiss svg { width:14px; height:14px; }
  .lumiphone-time { padding-top: 3px; }
  .lumiphone-island {
    appearance:none; padding:0 9px; color:inherit; cursor:pointer;
    width: 92px; height: 23px; border-radius: 999px; background: #050506; border: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: flex-end; gap: 6px;
  }
  .lumiphone-island[data-unread="true"] { box-shadow:0 0 0 2px color-mix(in srgb,var(--lp-accent) 70%,transparent); }
  .lumiphone-island::before { content:""; width: 31px; height: 5px; border-radius: 99px; background: #111; }
  .lumiphone-island::after { content:""; width: 5px; height: 5px; border-radius: 50%; background: #17203c; box-shadow: inset 0 0 0 1px #253568; }
  .lumiphone-signals { padding-top: 3px; display: flex; justify-content: flex-end; align-items: center; gap: 5px; }
  .lumiphone-signal-bars { display:flex; align-items:flex-end; gap:1px; height:9px; }
  .lumiphone-signal-bars i { display:block; width:2px; border-radius:1px; background:currentColor; }
  .lumiphone-signal-bars i:nth-child(1){height:3px}.lumiphone-signal-bars i:nth-child(2){height:5px}.lumiphone-signal-bars i:nth-child(3){height:7px}.lumiphone-signal-bars i:nth-child(4){height:9px}
  .lumiphone-battery { width:14px; height:7px; border:1px solid currentColor; border-radius:2px; padding:1px; position:relative; opacity:.9; }
  .lumiphone-battery::before { content:""; display:block; width:75%; height:100%; border-radius:1px; background:currentColor; }
  .lumiphone-battery::after { content:""; position:absolute; width:1px; height:3px; top:1px; right:-3px; border-radius:0 1px 1px 0; background:currentColor; }
  .lumiphone-screen { min-height: 0; overflow: hidden; position: relative; background: var(--lp-bg); }
  .lumiphone-app-view { width:100%; height:100%; min-height:0; overflow:auto; overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:color-mix(in srgb,var(--lp-accent) 42%,transparent) transparent; }
  .lumiphone-app-view[data-animate="spring"] { animation: lp-spring var(--lp-animation-ms) cubic-bezier(.2,.9,.28,1.12); }
  .lumiphone-app-view[data-animate="slide"] { animation: lp-slide var(--lp-animation-ms) cubic-bezier(.2,.8,.2,1); }
  .lumiphone-app-view[data-animate="fade"] { animation: lp-fade var(--lp-animation-ms) ease; }
  @keyframes lp-spring { from{opacity:.25;transform:scale(.88) translateY(16px);filter:blur(4px)} to{opacity:1;transform:none;filter:none} }
  @keyframes lp-slide { from{opacity:.2;transform:translateX(32px)} to{opacity:1;transform:none} }
  @keyframes lp-fade { from{opacity:0} to{opacity:1} }
  .lumiphone-homebar { display:grid; place-items:start center; background:var(--lp-bg); position:relative; z-index:20; }
  .lumiphone-homebar button { appearance:none; width:112px; height:17px; padding:0; border:0; background:transparent; cursor:pointer; position:relative; }
  .lumiphone-homebar button::after { content:""; position:absolute; left:8px; right:8px; top:7px; height:4px; border-radius:99px; background:var(--lp-text); opacity:.88; }

  .lp-home { min-height:100%; padding: 14px 16px 18px; background-image:var(--lp-wallpaper); background-size:var(--lp-home-wallpaper-size,cover); background-position:var(--lp-home-wallpaper-position,center); background-repeat:no-repeat; color:#fff; display:flex; flex-direction:column; }
  .lumiphone-shell .lp-home-setup { display:grid; gap:10px; padding:14px; margin-bottom:16px; border:1px solid var(--lp-border); border-radius:14px; background:var(--lp-surface); box-shadow:0 4px 14px #0002; color:var(--lp-text); }
  .lumiphone-shell .lp-home-setup p { margin:0; font-size:12px; line-height:1.5; color:var(--lp-muted); }
  .lp-setup .lp-enrichment-stop { border-color:var(--lumiverse-danger,#c65c65); color:var(--lumiverse-danger,#c65c65); }
  .lp-home-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; padding:10px 3px 20px; text-shadow:0 2px 12px rgba(0,0,0,.35); }
  .lp-home-date { font-size:11px; font-weight:650; opacity:.82; }
  .lp-home-clock { margin-top:1px; font-size:34px; line-height:1; font-weight:310; letter-spacing:-.045em; }
  .lp-home-weather { color:inherit; display:flex; align-items:center; gap:8px; padding:8px 10px; border:1px solid rgba(255,255,255,.18); border-radius:15px; background:rgba(15,13,24,.22); backdrop-filter:blur(18px); font-size:11px; }
  .lp-app-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px 10px; align-content:start; }
  .lp-app-icon { appearance:none; min-width:0; padding:0; border:0; background:transparent; color:#fff; cursor:pointer; display:grid; justify-items:center; gap:6px; font:inherit; }
  .lp-app-icon:hover .lp-app-icon-box { transform:translateY(-2px) scale(1.035); }
  .lp-app-icon-box { width:54px; height:54px; border-radius:16px; display:grid; place-items:center; position:relative; box-shadow:0 8px 22px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.25); transition:transform .18s ease; }
  .lp-app-icon-box svg { width:27px; height:27px; stroke-width:1.7; }
  .lp-app-label { max-width:76px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; font-weight:600; text-shadow:0 1px 6px rgba(0,0,0,.65); }
  .lp-app-dot { position:absolute; top:-5px; right:-5px; min-width:18px; height:18px; padding:0 4px; display:grid; place-items:center; border:2px solid rgba(22,17,35,.9); border-radius:99px; background:#ff4164; font-size:9px; font-weight:850; }
  .lp-home-dock { margin-top:auto; min-height:74px; padding:10px; border:1px solid rgba(255,255,255,.18); border-radius:24px; background:rgba(15,13,24,.28); backdrop-filter:blur(24px) saturate(1.3); display:grid; grid-template-columns:repeat(4,1fr); align-items:center; }
  .lp-home-dock .lp-app-icon-box { width:50px; height:50px; }
  .lp-home-dock .lp-app-label { display:none; }
  .lp-home-activity { margin:12px 0; display:grid; gap:5px; }
  .lp-home-activity-item { appearance:none; min-height:38px; padding:7px 9px; border:1px solid rgba(255,255,255,.16); border-radius:13px; display:grid; grid-template-columns:minmax(0,auto) minmax(0,1fr) auto; align-items:center; gap:7px; background:rgba(15,13,24,.28); color:#fff; backdrop-filter:blur(18px); font:inherit; text-align:left; cursor:pointer; }
  .lp-home-activity-item strong,.lp-home-activity-item span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-home-activity-item strong { font-size:10px; }
  .lp-home-activity-item > span:not(.lp-home-activity-arrow) { opacity:.68; font-size:9px; }
  .lp-home-activity-arrow { font-size:17px; }
  .lp-home-notifications-all { appearance:none; min-height:25px; border:0; background:transparent; color:#fff; opacity:.78; font:inherit; font-size:9px; cursor:pointer; }
  .lp-icon-messages { background:linear-gradient(145deg,#4ee580,#12aa4b); }
  .lp-icon-contacts { background:linear-gradient(145deg,#63b8ff,#3468d9); }
  .lp-icon-camera { background:linear-gradient(145deg,#74757c,#18191d); }
  .lp-icon-gallery { background:linear-gradient(145deg,#fff,#e9e8ec); color:#6d49da; }
  .lp-icon-notes { background:linear-gradient(#ffd84a 0 24%,#fff7c4 24%); color:#725d00; }
  .lp-icon-weather { background:linear-gradient(145deg,#48b5ff,#4166d7); }
  .lp-icon-calendar { background:linear-gradient(#fff 0 26%,#ff4f68 26%); color:#24212b; }
  .lp-icon-trackers { background:linear-gradient(145deg,#a269ff,#5632d3); }
  .lp-icon-settings { background:linear-gradient(145deg,#a8a9af,#4c4e54); }

  .lp-page { min-height:100%; background:var(--lp-bg); color:var(--lp-text); }
  .lp-nav { min-height:48px; padding:7px 12px 8px; display:grid; grid-template-columns:74px minmax(0,1fr) 74px; align-items:center; gap:4px; position:sticky; top:0; z-index:15; background:color-mix(in srgb,var(--lp-bg) 88%,transparent); border-bottom:1px solid var(--lp-border); backdrop-filter:blur(20px) saturate(1.25); }
  .lp-nav-title { min-width:0; text-align:center; font-size:14px; font-weight:780; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-nav-subtitle { display:block; color:var(--lp-muted); font-size:9px; font-weight:550; margin-top:2px; }
  .lp-nav-action { appearance:none; min-height:30px; padding:5px 4px; border:0; background:transparent; color:var(--lp-accent); font:inherit; font-size:11px; font-weight:680; cursor:pointer; text-align:left; }
  .lp-nav-action:last-child { text-align:right; }
  .lp-content { padding:12px; display:grid; gap:10px; }
  .lp-card { padding:12px; border:1px solid var(--lp-border); border-radius:17px; background:var(--lp-surface); box-shadow:0 8px 24px rgba(0,0,0,.06); }
  .lp-card[data-clickable="true"] { cursor:pointer; transition:transform .18s ease,border-color .18s ease; }
  .lp-card[data-clickable="true"]:hover { transform:translateY(-1px); border-color:color-mix(in srgb,var(--lp-accent) 38%,var(--lp-border)); }
  .lp-row { display:flex; align-items:center; gap:10px; min-width:0; }
  .lp-row-between { display:flex; align-items:center; justify-content:space-between; gap:10px; min-width:0; }
  .lp-stack { display:grid; gap:8px; min-width:0; }
  .lp-grow { flex:1; min-width:0; }
  .lp-title { margin:0; font-size:13px; font-weight:760; line-height:1.3; overflow-wrap:anywhere; }
  .lp-copy { margin:0; color:var(--lp-muted); font-size:10px; line-height:1.5; overflow-wrap:anywhere; }
  .lp-eyebrow { color:var(--lp-muted); font-size:8px; line-height:1.2; font-weight:780; letter-spacing:.11em; text-transform:uppercase; }
  .lp-empty { min-height:190px; padding:32px 20px; display:grid; place-items:center; text-align:center; color:var(--lp-muted); }
  .lp-empty svg { width:44px; height:44px; margin-bottom:10px; color:var(--lp-accent); opacity:.8; }
  .lp-button { appearance:none; min-height:34px; padding:7px 11px; border:1px solid var(--lp-border); border-radius:11px; background:var(--lp-surface-2); color:var(--lp-text); font:inherit; font-size:10px; font-weight:720; cursor:pointer; }
  .lp-button:hover { border-color:color-mix(in srgb,var(--lp-accent) 45%,var(--lp-border)); }
  .lp-button:disabled { cursor:not-allowed; opacity:.45; }
  .lp-button-primary { border-color:transparent; background:var(--lp-accent); color:#fff; }
  .lp-button-danger { color:#ff6f87; }
  .lp-button-icon { width:34px; padding:6px; display:grid; place-items:center; }
  .lp-button-icon svg { width:16px; height:16px; }
  .lp-input, .lp-textarea, .lp-select { width:100%; min-height:38px; padding:9px 10px; border:1px solid var(--lp-border); border-radius:11px; outline:none; background:var(--lp-surface); color:var(--lp-text); font:inherit; font-size:11px; }
  .lp-input:focus, .lp-textarea:focus, .lp-select:focus { border-color:color-mix(in srgb,var(--lp-accent) 58%,var(--lp-border)); box-shadow:0 0 0 2px color-mix(in srgb,var(--lp-accent) 16%,transparent); }
  .lp-textarea { min-height:96px; resize:vertical; line-height:1.5; }
  .lp-label { display:grid; gap:5px; color:var(--lp-muted); font-size:9px; font-weight:680; }
  .lp-fields { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .lp-contact-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:calc(10px * var(--pocket-ui-scale)); }
  .lp-contact-filters { flex:none; }
  .lp-contact-library { margin-left:auto; display:flex; align-items:center; gap:calc(6px * var(--pocket-ui-scale)); padding-left:calc(10px * var(--pocket-ui-scale)); border-left:1px solid var(--lp-border); }
  .lp-contact-library-label { color:var(--lp-muted); font-size:var(--pocket-font-xs); letter-spacing:.06em; text-transform:uppercase; }
  .lp-contact-library-action { appearance:none; display:inline-flex; align-items:center; justify-content:center; gap:calc(6px * var(--pocket-ui-scale)); min-height:calc(34px * var(--pocket-ui-scale)); padding:calc(7px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); border:1px solid var(--lp-border); border-radius:calc(9px * var(--pocket-ui-scale)); background:var(--lp-surface); color:var(--lp-text); font:inherit; font-size:var(--pocket-font-sm); white-space:nowrap; cursor:pointer; }
  .lp-contact-library-action:hover { background:var(--lp-surface-2); border-color:var(--lp-accent); }
  .lp-contact-library-action svg { width:calc(13px * var(--pocket-ui-scale)); height:calc(13px * var(--pocket-ui-scale)); flex:none; }
  .lp-chipbar { display:flex; gap:6px; overflow-x:auto; padding-bottom:2px; scrollbar-width:none; }
  .lp-chip { appearance:none; white-space:nowrap; min-height:29px; padding:5px 9px; border:1px solid var(--lp-border); border-radius:99px; background:var(--lp-surface); color:var(--lp-muted); font:inherit; font-size:9px; font-weight:700; cursor:pointer; }
  .lp-chip[aria-pressed="true"] { border-color:transparent; background:var(--lp-accent); color:#fff; }
  .lp-avatar { width:42px; height:42px; flex:0 0 42px; border-radius:50%; overflow:hidden; display:grid; place-items:center; background:linear-gradient(145deg,color-mix(in srgb,var(--lp-accent) 85%,white),var(--lp-accent)); color:#fff; font-size:15px; font-weight:820; }
  .lp-avatar img { width:100%; height:100%; object-fit:cover; }
  .lp-list-separator { height:1px; margin-left:52px; background:var(--lp-border); }
  .lp-unread { min-width:20px; height:20px; padding:0 5px; display:grid; place-items:center; border-radius:99px; background:var(--lp-accent); color:#fff; font-size:9px; font-weight:800; }

  .lp-thread { height:100%; min-height:0; overflow:hidden; display:grid; grid-template-rows:auto auto minmax(0,1fr) auto; background-image:var(--lp-chat-wallpaper); background-color:var(--lp-bg); background-size:var(--lp-chat-wallpaper-size,cover); background-position:var(--lp-chat-wallpaper-position,center); background-repeat:no-repeat; }
  .lp-thread .lp-nav { position:relative; }
  .lumiphone-app-view.lp-thread { overflow:hidden; }
  .lp-thread .lp-bubbles { overscroll-behavior:contain; }
  .lp-conversation-menu { position:relative; justify-self:end; }
  .lp-conversation-menu > summary { display:grid; place-items:center; min-width:30px; cursor:pointer; list-style:none; font-size:18px; line-height:1; }
  .lp-conversation-menu > summary::-webkit-details-marker { display:none; }
  .lp-conversation-menu-sheet { position:absolute; z-index:30; top:calc(100% + 5px); right:0; width:190px; padding:6px; display:grid; gap:2px; border:1px solid var(--lp-border); border-radius:13px; background:var(--lp-bg); box-shadow:0 16px 34px rgba(0,0,0,.28); }
  .lp-conversation-menu-action { appearance:none; min-height:34px; padding:7px 9px; border:0; border-radius:8px; background:transparent; color:var(--lp-text); font:inherit; font-size:var(--pocket-font-sm); text-align:left; cursor:pointer; }
  .lp-conversation-menu-action:hover { background:var(--lp-surface-2); }
  .lp-conversation-menu-action:disabled { opacity:.42; cursor:not-allowed; }
  .lp-reference-slot:empty { min-height:0; }
  .lp-reference-attachment { margin:7px 9px 0; padding:8px 9px; display:grid; gap:5px; border:1px solid color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border)); border-radius:13px; background:color-mix(in srgb,var(--lp-surface) 94%,transparent); box-shadow:0 5px 16px rgba(0,0,0,.09); }
  .lp-reference-head { display:flex; align-items:center; gap:8px; }
  .lp-reference-head .lp-grow { display:grid; gap:1px; }
  .lp-reference-mark { width:21px; height:21px; flex:0 0 21px; display:grid; place-items:center; border-radius:50%; background:color-mix(in srgb,var(--lp-accent) 15%,transparent); color:var(--lp-accent); font-size:10px; font-weight:900; }
  .lp-reference-attachment[data-state="injected"] .lp-reference-mark { animation:lp-reference-pulse 1.4s ease-in-out infinite; }
  .lp-reference-attachment[data-state="failed"] { border-color:color-mix(in srgb,#ff6f87 55%,var(--lp-border)); }
  .lp-reference-attachment[data-state="failed"] .lp-reference-mark { color:#ff6f87; background:color-mix(in srgb,#ff6f87 15%,transparent); }
  .lp-reference-actions { display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end; }
  .lp-reference-action { appearance:none; min-height:27px; padding:5px 7px; border:1px solid var(--lp-border); border-radius:8px; background:var(--lp-accent); color:#fff; font:inherit; font-size:var(--pocket-font-xs); font-weight:750; cursor:pointer; }
  .lp-reference-action-quiet { background:transparent; color:var(--lp-muted); }
  .lp-reference-safety { margin:0 0 0 29px; color:var(--lp-muted); font-size:var(--pocket-font-xs); line-height:1.35; }
  .lp-reference-diagnostics { margin-left:29px; color:var(--lp-muted); font-size:var(--pocket-font-xs); }
  .lp-reference-diagnostics > summary { cursor:pointer; }
  .lp-reference-sheet { display:grid; gap:9px; }
  .lp-reference-scope,.lp-reference-message-choice { padding:9px; display:flex; align-items:flex-start; gap:8px; border:1px solid var(--lp-border); border-radius:11px; background:var(--lp-surface); cursor:pointer; }
  .lp-reference-scope .lp-grow,.lp-reference-message-choice .lp-grow { display:grid; gap:2px; }
  .lp-reference-message-list { max-height:260px; padding:7px; overflow:auto; display:grid; gap:5px; border:1px solid var(--lp-border); border-radius:12px; background:var(--lp-surface-2); }
  .lp-reference-message-choice:has(input:disabled) { opacity:.48; cursor:default; }
  @keyframes lp-reference-pulse { 50% { transform:translateY(-1px); box-shadow:0 0 0 5px color-mix(in srgb,var(--lp-accent) 10%,transparent); } }
  .lumiphone-shell .lp-event-invite { align-self:stretch; min-width:0; margin:12px 0 4px; padding:16px; border:1px solid color-mix(in srgb,var(--lp-accent) 24%,var(--lp-border)); border-radius:18px; background:var(--lp-surface); box-shadow:0 5px 16px #0002; }
  .lp-event-invite-top { display:flex; align-items:center; gap:12px; }
  .lp-event-invite-icon { width:42px; height:42px; display:grid; place-items:center; flex:none; border-radius:12px; color:var(--lp-accent); background:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)); }
  .lp-event-invite-icon svg { width:24px; height:24px; }
  .lp-event-invite-heading { min-width:0; }
  .lp-event-invite-eyebrow { font-size:9px; font-weight:650; letter-spacing:.08em; text-transform:uppercase; color:var(--lp-muted); }
  .lp-event-invite-heading h3 { margin:4px 0 0; font-size:15px; line-height:1.3; overflow-wrap:anywhere; }
  .lp-event-invite-when { margin:14px 0 0; font-size:12px; font-weight:650; }
  .lp-event-invite-description { margin:6px 0 0; font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
  .lp-event-invite-people { margin:10px 0 0; font-size:10px; line-height:1.4; color:var(--lp-muted); }
  .lp-event-invite-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
  .lp-event-invite-actions .lp-button { min-height:36px; padding:8px 14px; border-radius:10px; }
  .lp-event-invite[data-status="declined"] { opacity:.65; }
  .lp-bubbles { min-height:0; overflow:auto; padding:14px 12px; display:flex; flex-direction:column; gap:7px; }
  .lp-bubble { max-width:79%; padding:8px 10px; border-radius:16px; font-size:11px; line-height:1.42; white-space:pre-wrap; overflow-wrap:anywhere; box-shadow:0 3px 10px rgba(0,0,0,.08); }
  .lp-bubble[data-sender="persona"] { align-self:flex-end; border-bottom-right-radius:5px; background:var(--lp-accent); color:#fff; }
  .lp-bubble[data-sender="contact"] { align-self:flex-start; border-bottom-left-radius:5px; background:var(--lp-surface-2); color:var(--lp-text); }
  .lp-bubble[data-sender="system"] { align-self:center; max-width:90%; background:transparent; color:var(--lp-muted); text-align:center; font-size:9px; box-shadow:none; }
  .lp-bubble-time { display:block; margin-top:4px; opacity:.58; font-size:7px; text-align:right; }
  .lp-bubble-sender { display:block; margin-bottom:2px; color:var(--lp-accent); font-size:8px; }
  .lp-actor-link { appearance:none; border:0; padding:0; background:transparent; font:inherit; font-weight:800; text-align:left; cursor:pointer; }
  .lp-group-message { max-width:88%; align-self:flex-start; display:grid; grid-template-columns:25px minmax(0,1fr); align-items:end; gap:6px; }
  .lp-group-message .lp-bubble { max-width:100%; border-left:2px solid color-mix(in srgb,var(--message-accent) 72%,transparent); }
  .lp-group-avatar { width:24px; height:24px; overflow:hidden; display:grid; place-items:center; border:2px solid var(--message-accent); border-radius:50%; background:var(--lp-surface-2); color:var(--message-accent); font-size:8px; font-weight:800; }
  .lp-group-avatar[data-clickable="true"] { cursor:pointer; }
  .lp-group-avatar img { width:100%; height:100%; object-fit:cover; }
  .lp-group-avatar-spacer { visibility:hidden; }
  .lp-group-typing { align-self:flex-start; min-height:30px; padding:6px 10px; display:flex; align-items:center; gap:7px; border-radius:13px; background:var(--lp-surface-2); color:var(--lp-muted); font-size:var(--pocket-font-sm); }
  .lp-bubble-pending { opacity:.82; min-width:42px; }
  .lp-typing-dots { min-height:12px; display:flex; align-items:center; justify-content:center; gap:3px; }
  .lp-typing-dots i { width:5px; height:5px; border-radius:50%; background:currentColor; opacity:.42; animation:lp-typing 1s ease-in-out infinite; }
  .lp-typing-dots i:nth-child(2) { animation-delay:.14s; }
  .lp-typing-dots i:nth-child(3) { animation-delay:.28s; }
  .lp-compose-stack { border-top:1px solid var(--lp-border); background:color-mix(in srgb,var(--lp-bg) 90%,transparent); backdrop-filter:blur(18px); }
  .lp-compose { padding:8px 9px 10px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:6px; align-items:end; }
  .lp-speaker-menu { position:relative; padding:5px 9px 0; color:var(--lp-muted); font-size:var(--pocket-font-xs); }
  .lp-speaker-menu summary { width:max-content; max-width:100%; padding:4px 8px; border:1px solid var(--lp-border); border-radius:99px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; list-style:none; }
  .lp-speaker-menu summary::-webkit-details-marker { display:none; }
  .lp-speaker-sheet { position:absolute; z-index:4; left:9px; right:9px; bottom:calc(100% + 5px); max-height:220px; padding:9px; overflow:auto; display:grid; gap:4px; border:1px solid var(--lp-border); border-radius:14px; background:var(--lp-bg); box-shadow:0 14px 30px rgba(0,0,0,.26); }
  .lp-speaker-option { appearance:none; padding:7px 8px; border:0; border-radius:9px; background:transparent; color:var(--lp-text); text-align:left; font:inherit; cursor:pointer; }
  .lp-speaker-option:hover { background:var(--lp-surface-2); }
  .lp-compose .lp-textarea { min-height:34px; max-height:96px; padding:8px 10px; resize:none; border-radius:17px; }
  .lp-compose .lp-button-icon { border-radius:50%; }

  .lp-operation-progress { padding:10px; display:grid; gap:7px; border:1px solid color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border)); border-radius:12px; background:var(--lp-surface); font-size:10px; }
  .lp-indeterminate { display:block; height:4px; overflow:hidden; border-radius:99px; background:color-mix(in srgb,var(--lp-accent) 16%,var(--lp-surface-2)); position:relative; }
  .lp-indeterminate::after { content:""; position:absolute; inset:0 auto 0 -42%; width:42%; border-radius:inherit; background:var(--lp-accent); animation:lp-indeterminate 1.1s ease-in-out infinite; }
  @keyframes lp-indeterminate { to { left:100%; } }
  .lp-npc-draft { display:grid; gap:7px; border-color:color-mix(in srgb,var(--lp-accent) 42%,var(--lp-border)); }
  .lp-draft-actions { display:flex; flex-wrap:wrap; gap:6px; }
  .lp-style-control { padding:9px 2px; display:grid; gap:6px; color:var(--lp-text); font-size:var(--pocket-font-sm); }
  .lp-style-control input { width:100%; accent-color:var(--lp-accent); }
  .lp-range-ends { display:flex; justify-content:space-between; white-space:pre; color:var(--lp-muted); font-size:var(--pocket-font-xs); }

  .lp-notification-group { display:grid; gap:7px; }
  .lp-notification-row { padding:0; display:grid; grid-template-columns:minmax(0,1fr) auto; overflow:hidden; }
  .lp-notification-row[data-read="false"] { border-left:3px solid var(--lp-accent); }
  .lp-notification-row[data-severity="error"] { border-left-color:#ff6a80; }
  .lp-notification-open { appearance:none; min-width:0; padding:11px 8px 11px 12px; border:0; display:flex; text-align:left; background:transparent; color:var(--lp-text); font:inherit; cursor:pointer; }
  .lp-notification-open > span { display:grid; gap:2px; }
  .lp-notification-open strong,.lp-notification-open span { overflow-wrap:anywhere; }
  .lp-notification-dismiss { appearance:none; width:38px; border:0; background:transparent; color:var(--lp-muted); font-size:20px; cursor:pointer; }
  .lp-notification-empty { margin:36px 12px; color:var(--lp-muted); font-size:10px; line-height:1.5; text-align:center; }
  .lp-floating-notification { appearance:none; position:absolute; z-index:45; top:39px; left:10px; right:10px; min-height:54px; padding:8px 10px; border:1px solid color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border)); border-radius:15px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:8px; background:color-mix(in srgb,var(--lp-surface) 94%,transparent); color:var(--lp-text); backdrop-filter:blur(22px); box-shadow:0 14px 36px rgba(0,0,0,.28); text-align:left; cursor:pointer; }
  .lp-floating-notification > span:first-child svg { width:20px; height:20px; }
  .lp-floating-notification > .lp-grow { display:grid; gap:2px; }
  .lp-floating-notification > .lp-grow span { color:var(--lp-muted); font-size:9px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-generation-effective,.lp-generation-run { padding:8px 9px; border:1px solid var(--lp-border); border-radius:10px; display:grid; gap:2px; }
  .lp-model-combobox { min-height:40px; }
  .lp-context-preview { border-top:1px solid var(--lp-border); padding-top:8px; }
  .lp-context-stats { display:grid; gap:6px; margin:8px 0; }
  .lp-context-exact { max-height:220px; overflow:auto; white-space:pre-wrap; word-break:break-word; padding:9px; border-radius:9px; background:color-mix(in srgb,var(--lp-bg) 75%,black); font:8px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace; }
  .lp-generation-history { display:grid; gap:5px; }
  .lp-generation-run[data-status="failed"] { border-color:color-mix(in srgb,#ff6a80 42%,var(--lp-border)); }

  /* Semantic UI primitives.
     Legacy lp-card/lp-copy/lp-row-* remain compatibility primitives for unmigrated apps. */
  .lp-section { min-width:0; display:grid; gap:7px; }
  .lp-section-head { min-width:0; display:grid; gap:3px; }
  .lp-section-label {
    color:var(--lp-muted); font-size:8px; line-height:1.2; font-weight:780;
    letter-spacing:.11em; text-transform:uppercase;
  }
  .lp-section-help { margin:0; color:var(--lp-muted); font-size:10px; line-height:1.5; overflow-wrap:anywhere; }
  .lp-section-body { min-width:0; display:grid; gap:7px; }

  .lp-identity { min-width:0; display:grid; gap:3px; text-align:left; }
  .lp-identity-line {
    min-width:0; display:flex; align-items:baseline; gap:6px; flex-wrap:wrap;
  }
  .lp-identity-name {
    min-width:0; color:var(--lp-text); font-size:11px; font-weight:760;
    line-height:1.3; overflow-wrap:anywhere;
  }
  .lp-identity-meta {
    min-width:0; color:var(--lp-muted); font-size:9px; font-weight:560;
    line-height:1.3; overflow-wrap:anywhere;
  }
  .lp-identity-description {
    margin:0; color:var(--lp-muted); font-size:10px; line-height:1.48; overflow-wrap:anywhere;
  }
  .lp-identity-prominent .lp-identity-name { font-size:14px; font-weight:790; }
  .lp-identity-prominent .lp-identity-meta { font-size:10px; }
  .lp-identity-centered { justify-items:center; text-align:center; }
  .lp-identity-centered .lp-identity-line { justify-content:center; }

  .lp-list-row {
    min-width:0; display:flex; align-items:center; justify-content:space-between; gap:10px;
  }
  .lp-list-row > .lp-identity { flex:1 1 auto; }

  .lp-actions { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:6px; }
  .lp-status-badge {
    min-height:24px; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center;
    border:1px solid var(--lp-border); border-radius:999px;
    background:color-mix(in srgb,var(--lp-surface-2) 80%,transparent);
    color:var(--lp-muted); font-size:9px; line-height:1; font-weight:760; white-space:nowrap;
  }
  .lp-status-badge[data-tone="accent"] {
    border-color:color-mix(in srgb,var(--lp-accent) 30%,var(--lp-border));
    background:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface));
    color:color-mix(in srgb,var(--lp-accent) 72%,white);
  }
  .lp-status-badge[data-tone="success"] {
    border-color:color-mix(in srgb,#55d69a 34%,var(--lp-border));
    background:color-mix(in srgb,#55d69a 9%,var(--lp-surface));
    color:#79e7b2;
  }
  .lp-status-badge[data-tone="danger"] {
    border-color:color-mix(in srgb,#ff6f87 34%,var(--lp-border));
    background:color-mix(in srgb,#ff6f87 9%,var(--lp-surface));
    color:#ff8fa1;
  }

  .lp-field { min-width:0; display:grid; gap:5px; }
  .lp-field-label { color:var(--lp-muted); font-size:9px; line-height:1.3; font-weight:680; }
  .lp-field-help { color:var(--lp-muted); opacity:.78; font-size:8px; line-height:1.4; }

  .lp-control-row { display:flex; align-items:center; justify-content:space-between; gap:10px; min-width:0; }
  .lp-control-copy { min-width:0; display:grid; gap:2px; }
  .lp-control-label { color:var(--lp-text); font-size:11px; line-height:1.3; font-weight:720; }
  .lp-control-help { color:var(--lp-muted); font-size:8px; line-height:1.4; }

  .lp-contact-list,.lp-contact-checklist,.lp-contact-source-section,.lp-contact-import { display:grid; gap:7px; }
  .lp-contact-row { width:100%; display:flex; align-items:center; gap:10px; text-align:left; }
  .lp-contact-row .lp-avatar { background:linear-gradient(145deg,color-mix(in srgb,var(--contact-accent,var(--lp-accent)) 82%,white),var(--contact-accent,var(--lp-accent))); }
  .lp-presence { width:9px; height:9px; flex:0 0 9px; border:2px solid var(--lp-surface); border-radius:50%; background:#43d67f; box-shadow:0 0 0 1px color-mix(in srgb,#43d67f 45%,transparent); }
  .lp-presence-away { background:var(--lp-muted); box-shadow:none; opacity:.42; }
  .lp-contact-detail { display:grid; justify-items:center; gap:9px; text-align:center; }
  .lp-contact-detail .lp-avatar { width:72px; height:72px; font-size:24px; }
  .lp-contact-checklist .lp-card span { display:grid; gap:2px; }

  .lp-gallery-pagination { justify-content:space-between; gap:8px; margin:10px 0; }
  .lp-npc-portrait-actions { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:12px 0; }
  .lp-npc-portrait-actions .lp-button { min-width:0; white-space:normal; }
  .lp-gallery-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:3px; }
  .lp-gallery-item { appearance:none; aspect-ratio:1; padding:0; border:0; background:var(--lp-surface); cursor:pointer; overflow:hidden; position:relative; }
  .lp-gallery-item img { width:100%; height:100%; object-fit:cover; transition:transform .25s ease; }
  .lp-gallery-item:hover img { transform:scale(1.04); }
  .lp-gallery-meta { position:absolute; left:0; right:0; bottom:0; padding:14px 5px 4px; background:linear-gradient(transparent,rgba(0,0,0,.68)); color:white; font-size:7px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; }
  .lp-gallery-item[data-missing="true"] { display:grid; place-items:center; border:1px dashed var(--lp-border); }
  .lp-gallery-missing { padding:8px; color:var(--lp-muted); font-size:9px; line-height:1.35; }
  .lp-camera { min-height:100%; background:#050505; color:#fff; display:grid; grid-template-rows:auto minmax(0,1fr) auto; }
  .lp-camera .lp-nav { background:rgba(4,4,4,.82); border-color:rgba(255,255,255,.1); color:#fff; }
  .lp-viewfinder { min-height:0; margin:0 10px; border-radius:20px; overflow:hidden; position:relative; display:grid; place-items:center; background:radial-gradient(circle at 50% 42%,#2c2a31,#0b0b0d 62%); border:1px solid rgba(255,255,255,.1); }
  .lp-viewfinder::before,.lp-viewfinder::after { content:""; position:absolute; background:rgba(255,255,255,.12); pointer-events:none; }
  .lp-viewfinder::before { left:33.33%; top:0; bottom:0; width:1px; box-shadow:calc(33.33vw - 8px) 0 rgba(255,255,255,.12); }
  .lp-viewfinder::after { top:33.33%; left:0; right:0; height:1px; box-shadow:0 calc(33.33vh - 70px) rgba(255,255,255,.12); }
  .lp-viewfinder img { width:100%; height:100%; object-fit:contain; position:relative; z-index:2; background:#050505; }
  .lp-camera-placeholder { max-width:240px; padding:22px; text-align:center; color:rgba(255,255,255,.65); font-size:10px; line-height:1.5; position:relative; z-index:3; }
  .lp-camera-placeholder svg { width:44px; height:44px; margin-bottom:8px; }
  .lp-camera-controls { padding:10px 12px 14px; display:grid; gap:8px; background:#050505; }
  .lp-shutter-row { display:grid; grid-template-columns:1fr 66px 1fr; align-items:center; }
  .lp-shutter { appearance:none; width:58px; height:58px; padding:5px; border:3px solid #fff; border-radius:50%; background:transparent; cursor:pointer; justify-self:center; }
  .lp-shutter::after { content:""; display:block; width:100%; height:100%; border-radius:50%; background:#fff; transition:transform .12s ease; }
  .lp-shutter:active::after { transform:scale(.84); }
  .lp-shutter:disabled { opacity:.45; cursor:not-allowed; }
  .lp-shutter:disabled::after { animation:lp-pulse 1s ease-in-out infinite; }
  @keyframes lp-pulse { 50%{transform:scale(.72);opacity:.65} }
  @keyframes lp-typing { 0%,60%,100%{transform:translateY(0);opacity:.38} 30%{transform:translateY(-3px);opacity:1} }
  .lp-camera-progress { color:rgba(255,255,255,.65); font-size:9px; text-align:center; min-height:14px; }

  .lp-note-card[data-pinned="true"] { border-color:color-mix(in srgb,#ffd653 45%,var(--lp-border)); background:color-mix(in srgb,#ffd653 8%,var(--lp-surface)); }
  .lp-note-preview { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; white-space:pre-wrap; }
  .lp-weather-hero { min-height:210px; padding:24px 18px; border-radius:22px; color:#fff; background:linear-gradient(155deg,#4eabf2,#5264c9 58%,#302b72); display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 20px 42px rgba(47,70,151,.28); }
  .lp-weather-temp { font-size:64px; line-height:1; font-weight:240; letter-spacing:-.06em; }
  .lp-weather-condition { font-size:14px; font-weight:720; }
  .lp-weather-range { opacity:.75; font-size:10px; }
  .lp-timeline { position:relative; display:grid; gap:10px; }
  .lp-timeline::before { content:""; position:absolute; left:14px; top:8px; bottom:8px; width:2px; border-radius:99px; background:var(--lp-border); }
  .lp-event { position:relative; padding-left:34px; }
  .lp-event-dot { position:absolute; left:8px; top:15px; width:14px; height:14px; border:3px solid var(--lp-bg); border-radius:50%; background:var(--event-color,var(--lp-accent)); box-shadow:0 0 0 1px var(--lp-border); z-index:2; }
  .lp-event[data-completed="true"] { opacity:.52; }
  .lp-event[data-completed="true"] .lp-title { text-decoration:line-through; }
  .lp-progress { height:7px; overflow:hidden; border-radius:99px; background:var(--lp-surface-2); }
  .lp-progress span { display:block; height:100%; width:var(--progress,0%); border-radius:inherit; background:var(--tracker-color,var(--lp-accent)); transition:width .5s ease; }
  .lp-rate { color:var(--lp-muted); font-size:8px; }
  .lp-toggle { appearance:none; width:40px; height:23px; border:0; border-radius:99px; padding:2px; background:var(--lp-surface-2); cursor:pointer; transition:background .2s ease; }
  .lp-toggle::after { content:""; display:block; width:19px; height:19px; border-radius:50%; background:#fff; box-shadow:0 2px 7px rgba(0,0,0,.28); transition:transform .2s ease; }
  .lp-toggle[aria-pressed="true"] { background:var(--lp-accent); }
  .lp-toggle[aria-pressed="true"]::after { transform:translateX(17px); }
  .lp-color-input { width:42px; height:31px; padding:2px; border:1px solid var(--lp-border); border-radius:9px; background:var(--lp-surface); cursor:pointer; }
  .lp-theme-dot { width:30px; height:30px; border-radius:50%; border:2px solid transparent; box-shadow:0 0 0 1px var(--lp-border); cursor:pointer; }
  .lp-theme-dot[aria-pressed="true"] { border-color:var(--lp-bg); box-shadow:0 0 0 2px var(--lp-accent); }
  .lp-settings-section { display:grid; gap:9px; }
  .lp-color-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px 12px; }
  .lp-color-grid > .lp-row-between { min-height:36px; padding:4px 7px; border:1px solid var(--lp-border); border-radius:10px; }
  .lp-slider-setting { display:grid; gap:6px; padding:6px 0; }
  .lp-slider-setting input[type="range"] { width:100%; accent-color:var(--lp-accent); }
  .lp-permission-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
  .lp-permission { padding:8px; border:1px solid var(--lp-border); border-radius:10px; color:var(--lp-muted); font-size:9px; }
  .lp-permission[data-granted="true"] { color:var(--lp-text); border-color:color-mix(in srgb,#43d17e 34%,var(--lp-border)); }
  .lp-permission::before { content:"○"; margin-right:5px; }
  .lp-permission[data-granted="true"]::before { content:"●"; color:#43d17e; }
  .lp-alert { margin:8px 12px 0; padding:9px 10px; border:1px solid color-mix(in srgb,#ff6a80 42%,var(--lp-border)); border-radius:12px; background:color-mix(in srgb,#ff6a80 10%,var(--lp-surface)); color:var(--lp-text); font-size:9px; line-height:1.4; position:absolute; left:0; right:0; top:34px; z-index:40; box-shadow:0 12px 30px rgba(0,0,0,.22); }
  .lp-alert[hidden] { display:none; }
  .lp-alert[data-severity="success"] { border-color:color-mix(in srgb,#55d69a 42%,var(--lp-border)); background:color-mix(in srgb,#55d69a 13%,var(--lp-surface)); }

  .lumiphone-drawer { min-height:100%; padding:18px; color:var(--lumiverse-text,inherit); display:grid; place-items:center; }
  .lumiphone-drawer-card { width:min(100%,500px); padding:22px; border:1px solid var(--lumiverse-border,rgba(127,127,127,.25)); border-radius:20px; background:var(--lumiverse-fill-subtle,rgba(127,127,127,.08)); text-align:center; display:grid; justify-items:center; gap:12px; }
  .lumiphone-drawer-icon { width:62px; height:62px; border-radius:20px; display:grid; place-items:center; color:white; background:linear-gradient(145deg,#9a8cff,#5746ce); box-shadow:0 16px 36px rgba(73,53,168,.3); }
  .lumiphone-drawer-icon svg { width:31px; height:31px; }
  .lumiphone-drawer-title { margin:0; font-size:20px; font-weight:780; }
  .lumiphone-drawer-copy { margin:0; max-width:390px; color:var(--lumiverse-text-muted,currentColor); font-size:12px; line-height:1.55; }
  .lumiphone-drawer-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; }
  .lumiphone-drawer-button { appearance:none; min-height:36px; padding:8px 13px; border:1px solid var(--lumiverse-border,rgba(127,127,127,.3)); border-radius:11px; background:var(--lumiverse-fill,rgba(127,127,127,.14)); color:inherit; font:inherit; font-size:11px; font-weight:720; cursor:pointer; }
  .lumiphone-drawer-button[data-primary="true"] { border-color:transparent; background:var(--lumiverse-primary,#7866e8); color:white; }
  .lumiphone-device-drawer {
    --pocket-accent:var(--lumiverse-primary,var(--accent-color,var(--lumi-accent,currentColor)));
    --pocket-surface:var(--lumiverse-fill-subtle,rgba(127,127,127,.06));
    --pocket-hover:var(--lumiverse-fill,rgba(127,127,127,.12));
    --pocket-border:var(--lumiverse-border,rgba(127,127,127,.16));
    --pocket-muted:var(--lumiverse-text-muted,inherit);
    --pocket-text:var(--lumiverse-text,inherit);
    display:block; padding:20px 16px; color:var(--pocket-text);
  }
  .lumiphone-device-switcher { width:100%; display:grid; gap:8px; }
  .lumiphone-device-heading { display:flex; align-items:center; gap:8px; }
  .lumiphone-device-mark { display:flex; color:var(--pocket-accent); }
  .lumiphone-device-mark svg { width:16px; height:16px; }
  .lumiphone-device-title { margin:0; font-family:inherit; font-weight:700; line-height:1.4; font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
  .lumiphone-device-copy { margin:0; color:var(--pocket-muted); font-size:11px; line-height:1.5; }
  .lumiphone-device-list { width:100%; display:grid; gap:22px; margin-top:14px; }
  .lumiphone-device-section { display:grid; gap:3px; min-width:0; }
  .lumiphone-device-section-title { display:flex; align-items:center; gap:10px; margin:0 0 6px; color:var(--pocket-muted); font-size:10px; font-weight:650; letter-spacing:.08em; text-transform:uppercase; }
  .lumiphone-device-section-title::after { content:""; flex:1; height:1px; background:var(--pocket-border); }
  .lumiphone-device-row { appearance:none; width:100%; min-height:48px; padding:8px 10px; border:0; border-left:2px solid transparent; border-radius:7px; display:grid; grid-template-columns:32px minmax(0,1fr) auto; align-items:center; gap:10px; background:transparent; color:inherit; font:inherit; text-align:left; cursor:pointer; }
  .lumiphone-device-row[data-persona="true"] { padding-block:13px; background:var(--pocket-surface); }
  .lumiphone-device-row[data-recent="true"] { min-height:70px; }
  .lumiphone-device-row[data-selected="true"] { border-left-color:var(--pocket-accent); background:color-mix(in srgb,var(--pocket-accent) 8%,transparent); }
  .lumiphone-device-row:hover { background:var(--pocket-hover); }
  .lumiphone-device-row:focus-visible,.lumiphone-device-access:focus-visible { outline:2px solid var(--pocket-accent); outline-offset:2px; }
  .lumiphone-device-avatar { position:relative; width:32px; height:32px; overflow:hidden; display:grid; place-items:center; border-radius:10px; background:var(--pocket-hover); color:var(--pocket-text); font-size:12px; font-weight:650; }
  .lumiphone-device-avatar img { position:absolute; width:100%; height:100%; object-fit:cover; }
  .lumiphone-device-identity { min-width:0; display:grid; gap:3px; }
  .lumiphone-device-identity strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:650; }
  .lumiphone-device-role { color:var(--pocket-muted); font-size:10px; }
  .lumiphone-device-meta { display:grid; justify-items:end; gap:5px; color:var(--pocket-muted); }
  .lumiphone-device-current { display:inline-flex; align-items:center; gap:4px; color:var(--pocket-accent); font-size:9px; font-weight:650; }
  .lumiphone-device-unread { min-width:18px; padding:2px 5px; border-radius:999px; background:color-mix(in srgb,var(--pocket-accent) 16%,transparent); color:var(--pocket-text); font-size:9px; font-weight:750; text-align:center; }
  .lumiphone-device-glyph { display:inline-flex; flex-shrink:0; }
  .lumiphone-device-glyph svg { width:13px; height:13px; }
  .lumiphone-device-preview { display:flex; align-items:center; gap:5px; min-width:0; margin-top:2px; color:var(--pocket-muted); font-size:10px; line-height:1.4; }
  .lumiphone-device-preview > span:last-child { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lumiphone-device-time { font-size:9px; white-space:nowrap; }
  .lumiphone-device-footer { padding-top:14px; margin-top:10px; border-top:1px solid var(--pocket-border); }
  .lumiphone-device-access { appearance:none; padding:7px 0; border:0; background:transparent; color:var(--pocket-muted); font:inherit; font-size:11px; cursor:pointer; }
  .lumiphone-device-access:hover { color:var(--pocket-text); }
  @media(max-width:420px) { .lumiphone-device-drawer { padding:16px 12px; } .lumiphone-device-row { min-height:52px; gap:8px; } }

  .lumiphone-sync-indicator { position:absolute; z-index:44; top:104px; left:50%; transform:translateX(-50%); max-width:calc(100% - 34px); min-height:22px; padding:5px 10px; border:1px solid color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border)); border-radius:999px; background:color-mix(in srgb,var(--lp-surface) 94%,transparent); color:var(--lp-muted); box-shadow:0 8px 22px rgba(0,0,0,.18); backdrop-filter:blur(18px); font-size:8px; line-height:1.35; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; pointer-events:none; }
  .lumiphone-shell:has(.lp-home) .lumiphone-sync-indicator { top:42px; }
  .lumiphone-sync-indicator[hidden] { display:none; }
  .lumiphone-sync-indicator[data-status="complete"] { color:var(--lp-text); }
  .lumiphone-sync-indicator[data-status="error"] { border-color:color-mix(in srgb,#ff6a80 50%,var(--lp-border)); color:#ff9dac; }
  .lumiphone-launcher[data-sync="working"] { box-shadow:0 0 0 4px color-mix(in srgb,var(--lumiverse-primary,#8b7dff) 20%,transparent); }

  @media (max-width: 720px) {
    .lumiphone-shell { border:0; border-radius:0; box-shadow:none; aspect-ratio:auto; }
    .lp-app-grid { gap:20px 8px; }
    .lp-app-icon-box { width:58px; height:58px; border-radius:17px; }
    .lp-gallery-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
  }
  .lumiphone-widget-root[data-fullscreen="true"] { width:100%; height:var(--lp-visual-height,100%); max-width:none; overflow:hidden; contain:layout paint; }
  .lumiphone-widget-root[data-fullscreen="true"] .lumiphone-shell { border:0; border-radius:0; box-shadow:none; aspect-ratio:auto; grid-template-rows:calc(34px + var(--app-interactive-safe-top, 0px)) minmax(0,1fr) calc(24px + env(safe-area-inset-bottom)); }
  .lumiphone-widget-root[data-fullscreen="true"] .lumiphone-statusbar { height:calc(34px + var(--app-interactive-safe-top, 0px)); padding-top:calc(5px + var(--app-interactive-safe-top, 0px)); }
  .lumiphone-widget-root[data-fullscreen="true"] .lumiphone-homebar { padding-bottom:env(safe-area-inset-bottom); }
  .lumiphone-widget-root[data-fullscreen="true"] .lp-compose { padding-bottom:max(8px,env(safe-area-inset-bottom)); }
  @media (max-width: 360px) {
    .lp-app-icon-box { width:50px; height:50px; border-radius:15px; }
    .lp-fields { grid-template-columns:1fr; }
    .lp-home { padding-inline:12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .lumiphone-app-view, .lumiphone-launcher, .lp-app-icon-box, .lp-gallery-item img, .lp-progress span, .lp-typing-dots i { animation:none !important; transition:none !important; }
  }
  .lumiphone-shell[data-reduced-motion="true"] *, .lumiphone-shell[data-reduced-motion="true"] *::before, .lumiphone-shell[data-reduced-motion="true"] *::after { animation-duration:0ms !important; transition-duration:0ms !important; }
  .lp-gallery-item[data-selected="true"] { outline:3px solid var(--lp-accent); outline-offset:2px; }
  .lp-bubble[data-selected="true"] { outline:3px solid color-mix(in srgb,var(--lp-accent) 62%,white); outline-offset:2px; }

${INLINE_BASE_STYLES}
  .lp-tracker-filters { display:flex; gap:6px; overflow:auto; padding-bottom:2px; scrollbar-width:none; }
  .lp-tracker-card { display:grid; gap:9px; border-left:3px solid color-mix(in srgb,var(--lp-accent) 68%,transparent); }
  .lp-tracker-card[role="button"]:focus-visible { outline:3px solid color-mix(in srgb,var(--lp-accent) 52%,white); outline-offset:2px; }
  .lp-tracker-compact { padding-block:9px; }
  .lp-progress-segmented { background:repeating-linear-gradient(90deg,var(--lp-surface-2) 0 calc(10% - 2px),transparent calc(10% - 2px) 10%); }
  .lp-tracker-policy { display:grid; gap:5px; }
  .lp-warning { margin:0; color:#f3bd65; font-size:10px; line-height:1.4; }
  .lp-tracker-operations { display:grid; gap:9px; }
  .lp-tracker-operation-row { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
  .lp-tracker-history { display:grid; gap:7px; }
  .lp-history-row { display:grid; gap:3px; }
  .lp-history-row time { overflow-wrap:anywhere; }
  .lp-tracker-config-fields { display:grid; gap:9px; }

  /* Density primitives. These participate in layout; Pocket never transform-scales its fullscreen surface. */
  .lumiphone-shell .lp-content { padding:calc(12px * var(--pocket-ui-scale)); gap:var(--pocket-gap); }
  .lumiphone-shell .lp-card { padding:calc(12px * var(--pocket-ui-scale)); border-radius:calc(17px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-title { font-size:var(--pocket-font-md); }
  .lumiphone-shell .lp-copy { font-size:var(--pocket-font-sm); }
  .lumiphone-shell .lp-eyebrow { font-size:var(--pocket-font-xs); }
  .lumiphone-shell .lp-button { min-height:calc(34px * var(--pocket-ui-scale)); padding:calc(7px * var(--pocket-ui-scale)) calc(11px * var(--pocket-ui-scale)); font-size:var(--pocket-font-sm); }
  .lumiphone-shell .lp-button-icon { width:calc(34px * var(--pocket-ui-scale)); padding:calc(6px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-input,.lumiphone-shell .lp-textarea,.lumiphone-shell .lp-select { min-height:var(--pocket-control-h); padding:calc(9px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); font-size:calc(11px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-label { gap:calc(5px * var(--pocket-ui-scale)); font-size:calc(9px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav { min-height:calc(48px * var(--pocket-ui-scale)); padding:calc(7px * var(--pocket-ui-scale)) calc(12px * var(--pocket-ui-scale)); grid-template-columns:calc(74px * var(--pocket-ui-scale)) minmax(0,1fr) calc(74px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav-title { font-size:calc(14px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav-subtitle { font-size:calc(9px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav-action { min-height:calc(30px * var(--pocket-ui-scale)); font-size:calc(11px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-grid { gap:calc(18px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-icon-box { width:var(--pocket-icon); height:var(--pocket-icon); border-radius:calc(16px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-icon-box svg { width:calc(27px * var(--pocket-ui-scale)); height:calc(27px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-label { font-size:var(--pocket-font-sm); }
  .lumiphone-shell .lp-avatar { width:calc(42px * var(--pocket-ui-scale)); height:calc(42px * var(--pocket-ui-scale)); flex-basis:calc(42px * var(--pocket-ui-scale)); font-size:calc(15px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-bubbles { padding:calc(14px * var(--pocket-ui-scale)) calc(12px * var(--pocket-ui-scale)); gap:calc(7px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-bubble { padding:calc(8px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); border-radius:calc(16px * var(--pocket-ui-scale)); font-size:calc(11px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-compose { padding:calc(8px * var(--pocket-ui-scale)) calc(9px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); gap:calc(6px * var(--pocket-ui-scale)); grid-template-columns:auto minmax(0,1fr) auto; }
  .lumiphone-shell .lp-compose .lp-textarea { min-height:calc(34px * var(--pocket-ui-scale)); max-height:calc(112px * var(--pocket-ui-scale)); border-radius:calc(17px * var(--pocket-ui-scale)); }
  .lp-conversation-status { align-self:center; max-width:92%; margin:5px 0; padding:6px 11px; border-top:1px solid var(--lp-border); border-bottom:1px solid var(--lp-border); color:var(--lp-muted); font-size:var(--pocket-font-sm); text-align:center; }
  .lp-arrival-status { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
  .lp-arrival-status .lp-handoff-action { min-height:24px; padding:4px 7px; }
  .lp-handoff-activity { align-self:stretch; margin:7px 0; border:1px solid color-mix(in srgb,var(--lp-accent) 28%,var(--lp-border)); border-radius:14px; background:color-mix(in srgb,var(--lp-surface) 92%,transparent); box-shadow:0 6px 20px rgba(0,0,0,.10); overflow:hidden; }
  .lp-handoff-primary { min-height:52px; padding:9px 10px; display:flex; align-items:center; gap:9px; }
  .lp-handoff-primary .lp-grow { display:grid; gap:2px; min-width:0; }
  .lp-handoff-mark { width:22px; height:22px; flex:0 0 22px; display:grid; place-items:center; border-radius:50%; background:color-mix(in srgb,var(--lp-accent) 15%,transparent); color:var(--lp-accent); font-size:11px; font-weight:900; }
  .lp-handoff-activity[data-state="preparing"] .lp-handoff-mark::after,.lp-handoff-activity[data-state="accepted"] .lp-handoff-mark::after,.lp-handoff-activity[data-state="generating"] .lp-handoff-mark::after { content:""; width:9px; height:9px; border:2px solid color-mix(in srgb,var(--lp-accent) 25%,transparent); border-top-color:var(--lp-accent); border-radius:50%; animation:lp-handoff-spin .9s linear infinite; }
  .lp-handoff-activity[data-state="generating"] { border-color:color-mix(in srgb,var(--lp-accent) 58%,var(--lp-border)); animation:lp-handoff-glow 1.8s ease-in-out infinite; }
  .lp-handoff-activity[data-state="completed"] { box-shadow:none; }
  .lp-handoff-activity[data-state="failed"] { border-color:color-mix(in srgb,#ff6f87 58%,var(--lp-border)); }
  .lp-handoff-activity[data-state="failed"] .lp-handoff-mark { background:color-mix(in srgb,#ff6f87 15%,transparent); color:#ff6f87; }
  .lp-handoff-action { appearance:none; min-height:27px; padding:5px 8px; border:1px solid var(--lp-border); border-radius:9px; background:transparent; color:var(--lp-accent); font:inherit; font-size:var(--pocket-font-xs); font-weight:750; cursor:pointer; }
  .lp-handoff-more { border-top:1px solid var(--lp-border); color:var(--lp-muted); font-size:var(--pocket-font-xs); }
  .lp-handoff-more > summary { padding:5px 10px; cursor:pointer; text-align:right; list-style:none; }
  .lp-handoff-more > summary::-webkit-details-marker { display:none; }
  .lp-handoff-secondary { padding:0 10px 10px; display:grid; grid-template-columns:1fr 1fr; gap:6px; }
  .lp-handoff-diagnostics { grid-column:1/-1; padding-top:6px; display:grid; gap:3px; border-top:1px solid var(--lp-border); }
  .lp-handoff-diagnostics > span { overflow-wrap:anywhere; }
  @keyframes lp-handoff-spin { to { transform:rotate(360deg); } }
  @keyframes lp-handoff-glow { 50% { box-shadow:0 7px 24px color-mix(in srgb,var(--lp-accent) 20%,transparent); } }
  .lumiphone-shell[data-reduced-motion="true"] .lp-handoff-activity,.lumiphone-shell[data-reduced-motion="true"] .lp-handoff-mark::after,.lumiphone-shell[data-reduced-motion="true"] .lp-reference-mark { animation:none !important; }
  .lp-channel-diagnostic { grid-column:1/-1; color:var(--lp-muted); font-size:var(--pocket-font-xs); }
  .lp-channel-diagnostic summary { cursor:pointer; text-align:center; }
  .lp-channel-diagnostic > span { display:block; margin-top:4px; overflow-wrap:anywhere; text-align:center; }
  .lp-code-block { max-height:220px; margin:8px 0 0; padding:10px; overflow:auto; border-radius:10px; background:rgba(0,0,0,.22); color:var(--lp-text); font:var(--pocket-font-xs)/1.45 ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre-wrap; overflow-wrap:anywhere; text-align:left; }
  .lp-manual-reply { color:var(--lp-muted); background:transparent; }
  .lp-reply-stop { color:var(--lp-danger,#e85c69); background:color-mix(in srgb,var(--lp-danger,#e85c69) 12%,var(--lp-surface)); }
  .lp-bubble-action { appearance:none; margin:5px 0 0 7px; padding:0; border:0; background:transparent; color:inherit; opacity:.58; font:inherit; font-size:var(--pocket-font-xs); cursor:pointer; }
  .lp-bubble-action:hover { opacity:1; text-decoration:underline; }
  .lp-scene-note { margin:0; padding:7px 9px; border-radius:9px; background:color-mix(in srgb,var(--lp-accent) 10%,transparent); color:var(--lp-muted); font-size:var(--pocket-font-sm); }
  .lp-settings-category { width:100%; display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:10px; color:var(--lp-text); text-align:left; cursor:pointer; }
  .lp-settings-category > span:first-child { display:grid; gap:2px; }
  .lp-settings-chevron { color:var(--lp-muted); font-size:22px; }
  .lp-code-input { min-height:150px; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre; }
  .lp-swarm-diagnostics { display:grid; gap:6px; }
  .lp-swarm-diagnostics summary { cursor:pointer; color:var(--lp-muted); font-size:var(--pocket-font-sm); }
  .lp-gallery-actions { margin-top:12px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .lp-gallery-actions .lp-select { grid-column:1 / -1; }
  .lp-wallpaper-control { display:grid; gap:9px; padding:10px 0; border-top:1px solid var(--lp-border); }
  .lp-wallpaper-control:first-of-type { border-top:0; }
  .lp-wallpaper-preview { min-height:120px; display:grid; place-items:center; border:1px solid var(--lp-border); border-radius:14px; background-color:var(--lp-bg); background-repeat:no-repeat; color:var(--lp-muted); font-size:var(--pocket-font-sm); overflow:hidden; }
  .lp-wallpaper-actions { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
  .lp-wallpaper-focal { display:grid; gap:6px; }
  .lp-wallpaper-range { display:grid; grid-template-columns:minmax(100px,auto) 1fr; align-items:center; gap:8px; }
  .lp-wallpaper-range input { width:100%; accent-color:var(--lp-accent); }
  .pocket-composer-reference {
    --pocket-reference-accent:var(--lumiverse-primary,#8b7dff);
    box-sizing:border-box;
    width:calc(100% - 16px);
    min-width:0;
    margin:7px 8px 5px;
    display:grid;
    grid-template-columns:minmax(0,1fr) auto;
    align-items:stretch;
    gap:3px;
    border:1px solid color-mix(in srgb,var(--pocket-reference-accent) 30%,var(--lumiverse-border,transparent));
    border-left:3px solid var(--pocket-reference-accent);
    border-radius:10px;
    background:color-mix(in srgb,var(--lumiverse-fill,#17151d) 95%,var(--pocket-reference-accent) 5%);
    color:var(--lumiverse-text,#f7f5ff);
    box-shadow:0 3px 12px rgba(0,0,0,.09);
    backdrop-filter:blur(10px);
    -webkit-backdrop-filter:blur(10px);
    font:inherit;
    overflow:hidden;
  }
  .pocket-composer-reference[hidden] { display:none; }
  .pocket-composer-reference[data-status="injected"] {
    border-left-color:color-mix(in srgb,var(--pocket-reference-accent) 78%,white);
  }
  .pocket-composer-reference[data-status="failed"] { --pocket-reference-accent:#ff6f87; }

  .pocket-composer-reference-open {
    appearance:none;
    min-width:0;
    display:grid;
    grid-template-columns:22px minmax(0,1fr);
    align-items:center;
    gap:8px;
    padding:7px 6px 7px 8px;
    border:0;
    background:transparent;
    color:inherit;
    font:inherit;
    text-align:left;
    cursor:pointer;
  }
  .pocket-composer-reference-open:hover {
    background:color-mix(in srgb,var(--pocket-reference-accent) 5%,transparent);
  }
  .pocket-composer-reference-open:focus-visible,
  .pocket-composer-reference-clear:focus-visible {
    outline:2px solid color-mix(in srgb,var(--pocket-reference-accent) 62%,white);
    outline-offset:-2px;
  }

  .pocket-composer-reference-mark {
    width:22px;
    height:22px;
    display:grid;
    place-items:center;
    border-radius:7px;
    background:color-mix(in srgb,var(--pocket-reference-accent) 14%,transparent);
    color:var(--pocket-reference-accent);
  }
  .pocket-composer-reference-mark svg { width:12px; height:12px; }

  .pocket-composer-reference-copy {
    min-width:0;
    display:flex;
    flex-direction:column;
    gap:3px;
  }
  .pocket-composer-reference-meta {
    min-width:0;
    display:flex;
    align-items:center;
    gap:4px;
    line-height:1.2;
  }
  .pocket-composer-reference-source {
    flex:0 0 auto;
    white-space:nowrap;
    font-size:11px;
    font-weight:800;
    letter-spacing:-.01em;
  }
  .pocket-composer-reference-separator {
    flex:0 0 auto;
    opacity:.42;
    font-size:10px;
  }
  .pocket-composer-reference-conversation {
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-size:11px;
    font-weight:650;
    opacity:.86;
  }
  .pocket-composer-reference-count {
    flex:0 0 auto;
    padding:1px 5px;
    border:1px solid color-mix(in srgb,var(--pocket-reference-accent) 24%,transparent);
    border-radius:999px;
    background:color-mix(in srgb,var(--pocket-reference-accent) 9%,transparent);
    color:color-mix(in srgb,currentColor 84%,var(--pocket-reference-accent));
    font-size:9px;
    font-weight:800;
    line-height:1.35;
    white-space:nowrap;
  }
  .pocket-composer-reference-count[hidden] { display:none; }

  .pocket-composer-reference-preview {
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    opacity:.66;
    font-size:11px;
    line-height:1.28;
    font-weight:450;
  }

  .pocket-composer-reference-clear {
    appearance:none;
    width:28px;
    min-width:28px;
    align-self:stretch;
    display:grid;
    place-items:center;
    padding:0;
    border:0;
    border-radius:0;
    background:transparent;
    color:inherit;
    opacity:.48;
    font:inherit;
    font-size:16px;
    line-height:1;
    cursor:pointer;
  }
  .pocket-composer-reference-clear:hover {
    opacity:1;
    background:color-mix(in srgb,var(--pocket-reference-accent) 9%,transparent);
  }

  @media (max-width: 520px) {
    .pocket-composer-reference {
      width:calc(100% - 12px);
      margin:6px 6px 4px;
    }
    .pocket-composer-reference-open {
      grid-template-columns:20px minmax(0,1fr);
      gap:7px;
      padding:6px 5px 6px 7px;
    }
    .pocket-composer-reference-mark {
      width:20px;
      height:20px;
    }
    .pocket-composer-reference-source,
    .pocket-composer-reference-conversation,
    .pocket-composer-reference-preview {
      font-size:10px;
    }
    .pocket-composer-reference-count {
      padding-inline:4px;
      font-size:8px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pocket-composer-reference,
    .pocket-composer-reference * {
      animation:none !important;
      transition:none !important;
    }
  }

  /* Messages + Contacts usability v1 */
  .lp-empty > div { min-width:0; display:grid; justify-items:center; text-align:center; }
  .lp-empty > div > span:first-child { display:grid; place-items:center; }
  .lp-empty > div > span:first-child svg { display:block; margin-inline:auto; }

  .lp-conversation-list { gap:0; padding-top:4px; padding-bottom:4px; }
  .lp-conversation-row {
    min-width:0; padding:10px 2px; display:flex; align-items:center; gap:10px;
    border-bottom:1px solid color-mix(in srgb,var(--lp-border) 76%,transparent);
    background:transparent; color:var(--lp-text); cursor:pointer;
  }
  .lp-conversation-row:last-child { border-bottom:0; }
  .lp-conversation-row:hover { background:color-mix(in srgb,var(--lp-surface-2) 42%,transparent); }
  .lp-conversation-row:focus-visible { outline:2px solid color-mix(in srgb,var(--lp-accent) 55%,white); outline-offset:1px; border-radius:10px; }
  .lp-conversation-row > .lp-identity { flex:1 1 auto; }
  .lp-conversation-row .lp-identity-description { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .lp-message-picker-row {
    appearance:none; width:100%; min-width:0; padding:9px 7px; border:0;
    border-bottom:1px solid color-mix(in srgb,var(--lp-border) 72%,transparent);
    display:grid; grid-template-columns:34px minmax(0,1fr) auto; align-items:center; gap:9px;
    background:transparent; color:var(--lp-text); text-align:left; font:inherit; cursor:pointer;
  }
  .lp-message-picker-row:last-child { border-bottom:0; }
  .lp-message-picker-row:hover { background:color-mix(in srgb,var(--lp-surface-2) 48%,transparent); }
  .lp-message-picker-row .lp-avatar { width:34px; height:34px; font-size:11px; }
  .lp-message-picker-chevron { color:var(--lp-muted); font-size:20px; line-height:1; }

  .lp-visually-hidden {
    position:absolute !important; width:1px !important; height:1px !important; padding:0 !important;
    margin:-1px !important; overflow:hidden !important; clip:rect(0,0,0,0) !important;
    white-space:nowrap !important; border:0 !important;
  }
  .lp-participant-picker { gap:5px; }
  .lp-picker-row {
    min-width:0; padding:8px 9px; display:grid; grid-template-columns:32px minmax(0,1fr) 22px;
    align-items:center; gap:9px; border:1px solid var(--lp-border); border-radius:13px;
    background:var(--lp-surface); color:var(--lp-text); cursor:pointer;
    transition:border-color .16s ease,background .16s ease;
  }
  .lp-picker-row:hover { border-color:color-mix(in srgb,var(--lp-accent) 34%,var(--lp-border)); }
  .lp-picker-row[data-selected="true"] {
    border-color:color-mix(in srgb,var(--lp-accent) 60%,var(--lp-border));
    background:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-surface));
  }
  .lp-picker-avatar {
    width:32px; height:32px; overflow:hidden; display:grid; place-items:center;
    border:1px solid color-mix(in srgb,var(--message-accent,var(--lp-accent)) 58%,var(--lp-border));
    border-radius:50%; background:var(--lp-surface-2); color:var(--message-accent,var(--lp-accent));
    font-size:10px; font-weight:800;
  }
  .lp-picker-avatar img { width:100%; height:100%; object-fit:cover; }
  .lp-picker-check {
    width:20px; height:20px; display:grid; place-items:center; border:1px solid var(--lp-border);
    border-radius:50%; color:transparent; font-size:10px; font-weight:900;
  }
  .lp-picker-row[data-selected="true"] .lp-picker-check { border-color:var(--lp-accent); background:var(--lp-accent); color:#fff; }

  .lp-bubbles[data-conversation-kind="direct"] .lp-bubble:not([data-sender="system"]) { position:relative; }
  .lp-bubbles[data-conversation-kind="direct"] .lp-bubble[data-sender="persona"]::after {
    content:""; position:absolute; right:-5px; bottom:1px; width:10px; height:11px;
    background:var(--lp-accent); clip-path:polygon(0 0,0 100%,100% 100%);
  }
  .lp-bubbles[data-conversation-kind="direct"] .lp-bubble[data-sender="contact"]::after {
    content:""; position:absolute; left:-5px; bottom:1px; width:10px; height:11px;
    background:var(--lp-surface-2); clip-path:polygon(100% 0,0 100%,100% 100%);
  }

  .lp-group-message { max-width:90%; grid-template-columns:22px minmax(0,1fr); align-items:end; gap:6px; }
  .lp-group-message[data-continuation="true"] { margin-top:-4px; }
  .lp-group-message .lp-bubble {
    max-width:100%; padding:7px 9px; border:1px solid color-mix(in srgb,var(--message-accent) 16%,var(--lp-border));
    border-left:0; border-radius:13px; box-shadow:none;
    background:color-mix(in srgb,var(--message-accent) 5%,var(--lp-surface-2));
  }
  .lp-group-avatar { width:21px; height:21px; border-width:1px; font-size:7px; }
  .lp-bubble-sender { margin-bottom:3px; color:var(--message-accent,var(--lp-accent)); font-size:8px; }
  .lp-bubble-time { margin-top:3px; }

  .lp-bubble-tools { margin-top:2px; display:flex; justify-content:flex-end; gap:3px; }
  .lp-bubble-action {
    width:20px; height:20px; margin:0; padding:0; display:grid; place-items:center;
    border:0; border-radius:50%; background:transparent; color:inherit;
    opacity:.42; font:inherit; font-size:11px; line-height:1; cursor:pointer;
  }
  .lp-bubble-action:hover { opacity:.9; background:rgba(127,127,127,.13); text-decoration:none; }

  .lp-compose {
    padding:7px 9px 9px;
    grid-template-columns:calc(36px * var(--pocket-ui-scale)) minmax(0,1fr) calc(36px * var(--pocket-ui-scale));
    gap:calc(7px * var(--pocket-ui-scale)); align-items:center;
  }
  .lp-compose .lp-button-icon,.lp-compose .lp-manual-reply {
    width:calc(36px * var(--pocket-ui-scale)); height:calc(36px * var(--pocket-ui-scale));
    min-height:calc(36px * var(--pocket-ui-scale)); padding:0; border-radius:50%;
    display:grid; place-items:center;
  }
  .lp-compose .lp-textarea { min-height:calc(36px * var(--pocket-ui-scale)); padding:8px 11px; border-radius:calc(18px * var(--pocket-ui-scale)); }
  .lp-speaker-menu { padding:4px 9px 0; }
  .lp-speaker-menu summary { padding:3px 7px; font-size:var(--pocket-font-xs); opacity:.8; }

  .lp-handoff-activity {
    margin:5px 0; border-radius:11px; border-color:color-mix(in srgb,var(--lp-accent) 24%,var(--lp-border));
    border-left:2px solid var(--lp-accent); background:color-mix(in srgb,var(--lp-surface) 82%,transparent);
    box-shadow:none;
  }
  .lp-handoff-primary { min-height:0; padding:7px 8px; gap:7px; }
  .lp-handoff-primary .lp-grow { gap:1px; }
  .lp-handoff-primary .lp-grow > strong { font-size:9px; line-height:1.25; }
  .lp-handoff-primary .lp-grow > .lp-copy { font-size:8px; line-height:1.35; }
  .lp-handoff-mark { width:18px; height:18px; flex-basis:18px; font-size:9px; }
  .lp-handoff-action { min-height:23px; padding:3px 6px; border-radius:7px; }
  .lp-handoff-more > summary { padding:4px 8px; opacity:.75; }
  .lp-handoff-secondary { padding:0 8px 8px; gap:5px; }

  .lp-contact-photo-editor .lp-section-body { display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:10px; }
  .lp-contact-photo-editor .lp-avatar { width:54px; height:54px; font-size:18px; }
  .lp-contact-photo-editor .lp-actions { justify-content:flex-start; }

${POCKET_DESIGN_SYSTEM}
${INLINE_FINISH_STYLES}

  /* Recipient columns follow the actual avatar, including profile overrides. */
  .lumiphone-shell, .lumiphone-screen { overflow:clip; }
  .lp-message-picker-row { grid-template-columns:max-content minmax(0,1fr) auto; column-gap:14px; }
  .lp-message-picker-row .lp-identity-line,
  .lp-picker-row .lp-identity-line { flex-direction:column; align-items:flex-start; gap:3px; }
  .lp-message-picker-row .lp-identity-name { line-height:1.4; }
  .lumiphone-shell [data-pocket-search-result][hidden] { display:none !important; }
  .lp-message-picker-row[hidden], .lp-section[hidden], .lp-field[hidden], .lp-tracker-config-fields[hidden] { display:none; }
  .lp-template-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .lp-template-card { appearance:none; padding:18px 12px; border:1px solid var(--lp-border); border-radius:20px; display:grid; justify-items:start; gap:7px; background:var(--lp-surface); color:var(--lp-text); text-align:left; cursor:pointer; }
  .lp-template-card:hover { border-color:var(--lp-accent); background:color-mix(in srgb,var(--lp-accent) 9%,var(--lp-surface)); }
  .lp-template-mark { width:38px; height:38px; display:grid; place-items:center; border-radius:13px; color:var(--lp-accent); background:color-mix(in srgb,var(--lp-accent) 12%,transparent); font-size:24px; }
  .lp-template-card small { color:var(--lp-muted); }
  .lp-tracker-preview { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:6px 14px; padding:22px; border-radius:22px; border:1px solid color-mix(in srgb,var(--tracker-color) 35%,var(--lp-border)); background:linear-gradient(135deg,color-mix(in srgb,var(--tracker-color) 15%,var(--lp-surface)),var(--lp-surface)); }
  .lp-tracker-preview .lp-eyebrow { grid-column:1/-1; }
  .lp-preview-name { font-size:18px; overflow-wrap:anywhere; }
  .lp-preview-value { color:var(--tracker-color); font-size:24px; font-weight:750; overflow-wrap:anywhere; }
  .lp-tracker-preview small { grid-column:1/-1; color:var(--lp-muted); }
  .lp-band-list { display:grid; gap:8px; }
  .lp-band-editor { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,.65fr) minmax(0,.65fr) 28px 28px; gap:5px; align-items:center; }
  .lp-band-editor .lp-input { min-width:0; padding:8px; }
  .lp-band-editor .lp-color-input { width:28px; }
  .lp-tracker-config-fields { display:grid; gap:12px; }
  .lumiphone-shell .lp-tracker-card {
    position:relative; isolation:isolate; overflow:hidden; display:grid; gap:11px; padding:14px 15px 13px;
    min-width:0; border:1px solid color-mix(in srgb,var(--lp-text) 8%,var(--lp-border)); border-radius:26px;
    background:
      linear-gradient(180deg,color-mix(in srgb,var(--lp-text) 3.2%,transparent),transparent 30%),
      color-mix(in srgb,var(--tracker-color) 3.5%,var(--lp-surface));
    box-shadow:inset 0 1px #ffffff0d,0 8px 24px #0000001f; text-align:left;
  }
  .lumiphone-shell .lp-tracker-card::before { content:""; position:absolute; inset:0 0 auto; height:38%; pointer-events:none; background:linear-gradient(180deg,#ffffff07,transparent); opacity:.65; }
  .lp-tracker-card > * { position:relative; z-index:1; }
  .lp-tracker-top { display:flex; align-items:start; justify-content:space-between; gap:12px; min-width:0; }
  .lp-tracker-heading { min-width:0; display:grid; gap:2px; }
  .lp-tracker-heading .lp-eyebrow { color:var(--lp-muted); font-size:7.5px; font-weight:760; letter-spacing:.08em; line-height:1.45; text-transform:uppercase; }
  .lp-tracker-heading .lp-title { margin:0; color:var(--lp-text); font-size:13px; line-height:1.25; letter-spacing:-.015em; overflow-wrap:anywhere; }
  .lp-tracker-update { flex-shrink:0; color:color-mix(in srgb,var(--lp-muted) 88%,var(--tracker-color)); font-size:7.5px; font-weight:650; line-height:1.25; padding:4px 7px; border:1px solid color-mix(in srgb,var(--lp-text) 8%,var(--lp-border)); border-radius:999px; background:color-mix(in srgb,var(--lp-text) 4%,transparent); }
  .lp-tracker-reading { min-width:0; display:flex; justify-content:space-between; align-items:end; gap:10px; flex-wrap:wrap; }
  .lp-tracker-readout { min-width:0; color:var(--lp-text); font-size:31px; font-weight:780; line-height:.98; letter-spacing:-.055em; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
  .lp-tracker-stage { color:var(--tracker-color); font-size:8.5px; font-weight:720; line-height:1.25; text-align:right; }
  .lp-tracker-glyph { width:26px; height:26px; color:var(--tracker-color); flex-shrink:0; }
  .lp-tracker-rail { position:relative; height:6px; border-radius:999px; overflow:hidden; background:color-mix(in srgb,var(--lp-text) 7%,transparent); }
  .lp-tracker-rail-fill { display:block; width:var(--tracker-percent); min-width:2px; height:100%; border-radius:inherit; background:var(--tracker-color); box-shadow:0 0 13px color-mix(in srgb,var(--tracker-color) 22%,transparent); }
  .lp-tracker-limits { display:flex; justify-content:space-between; color:var(--lp-muted); font-size:7.5px; margin-top:-6px; opacity:.72; }

  /* Rings are semantic Health/Fitness-style progress displays, not card decoration. */
  .lp-tracker-ring { --ring-size:66px; width:var(--ring-size); height:var(--ring-size); flex:0 0 var(--ring-size); display:grid; place-items:center; border-radius:50%; background:conic-gradient(var(--tracker-color) 0 var(--ring-percent),color-mix(in srgb,var(--lp-text) 8%,transparent) var(--ring-percent) 360deg); box-shadow:0 0 0 1px color-mix(in srgb,var(--lp-text) 5%,transparent); }
  .lp-tracker-ring-core { width:calc(var(--ring-size) - 12px); height:calc(var(--ring-size) - 12px); display:grid; place-items:center; border-radius:50%; background:color-mix(in srgb,var(--lp-surface) 94%,#000); box-shadow:inset 0 1px #ffffff0a; }
  .lp-tracker-ring .lp-tracker-glyph { width:24px; height:24px; }

  /* Relationship = a soft social widget, not a telemetry panel. */
  .lp-bond-widget { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(100px,.85fr); align-items:center; gap:12px; padding:10px 11px; border-radius:20px; background:linear-gradient(135deg,color-mix(in srgb,var(--tracker-color) 12%,transparent),color-mix(in srgb,var(--lp-text) 3%,transparent)); border:1px solid color-mix(in srgb,var(--tracker-color) 14%,var(--lp-border)); }
  .lp-tracker-pair { min-width:0; display:grid; grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr); align-items:center; gap:2px; }
  .lp-tracker-pair .lp-tracker-glyph { width:18px; height:18px; justify-self:center; opacity:.8; }
  .lp-tracker-person { min-width:0; display:grid; justify-items:center; gap:5px; }
  .lp-tracker-person-name { max-width:100%; color:var(--lp-muted); font-size:8px; font-weight:650; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-tracker-avatar { width:42px; height:42px; display:grid; place-items:center; overflow:hidden; border-radius:15px; background:color-mix(in srgb,var(--tracker-color) 13%,color-mix(in srgb,var(--lp-text) 5%,var(--lp-surface))); border:1px solid color-mix(in srgb,var(--tracker-color) 20%,var(--lp-border)); box-shadow:inset 0 1px #ffffff0c; font-size:15px; font-weight:760; }
  .lp-tracker-avatar img { width:100%; height:100%; object-fit:cover; }
  .lp-bond-score { display:grid; gap:8px; min-width:0; }
  .lp-bond-score .lp-tracker-reading { display:grid; gap:3px; justify-items:start; }
  .lp-bond-score .lp-tracker-readout { font-size:25px; }
  .lp-bond-score .lp-tracker-stage { text-align:left; }

  /* Vitals = Apple Health-ish ring + tiny pulse history. */
  .lp-vital-body,.lp-energy-body,.lp-hunger-body { display:flex; align-items:center; gap:14px; min-width:0; }
  .lp-vital-body .lp-tracker-reading,.lp-energy-body .lp-tracker-reading,.lp-hunger-body .lp-tracker-reading { flex:1; display:grid; gap:4px; justify-items:start; }
  .lp-health-ring { --ring-size:68px; }
  .lp-vital-pulse { height:22px; display:grid; grid-template-columns:repeat(11,minmax(0,1fr)); gap:3px; align-items:center; padding:0 2px; }
  .lp-vital-pulse span { height:5px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 8%,transparent); transition:height .16s ease,background .16s ease; }
  .lp-vital-pulse span:nth-child(2n) { height:9px; }
  .lp-vital-pulse span:nth-child(4n) { height:16px; }
  .lp-vital-pulse span:nth-child(7n) { height:20px; }
  .lp-vital-pulse span[data-filled="true"] { background:var(--tracker-color); box-shadow:0 0 8px color-mix(in srgb,var(--tracker-color) 16%,transparent); }

  /* Hunger = nutrition widget: a warmer semantic ring and quieter status. */
  .lp-hunger-ring { --ring-size:64px; }
  .lp-tracker-card[data-flavor="hunger"] { background:linear-gradient(135deg,color-mix(in srgb,var(--tracker-color) 8%,var(--lp-surface)),var(--lp-surface) 58%); }
  .lp-tracker-card[data-flavor="hunger"] .lp-tracker-ring-core { background:color-mix(in srgb,var(--tracker-color) 5%,var(--lp-surface)); }

  /* Scene tension = live-activity waveform that gets denser as the scene heats up. */
  .lp-tension-body { display:flex; align-items:end; justify-content:space-between; gap:12px; }
  .lp-tension-body .lp-tracker-reading { flex:1; }
  .lp-tension-body > .lp-tracker-glyph { width:25px; height:25px; opacity:.9; }
  .lp-tension-wave { height:28px; display:grid; grid-template-columns:repeat(14,minmax(0,1fr)); gap:3px; align-items:center; padding:4px 7px; border-radius:14px; background:color-mix(in srgb,var(--lp-text) 3.5%,transparent); }
  .lp-tension-wave span { justify-self:stretch; height:5px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 8%,transparent); }
  .lp-tension-wave span:nth-child(3n+1) { height:11px; }
  .lp-tension-wave span:nth-child(4n+2) { height:19px; }
  .lp-tension-wave span:nth-child(7n) { height:25px; }
  .lp-tension-wave span[data-filled="true"] { background:var(--tracker-color); box-shadow:0 0 7px color-mix(in srgb,var(--tracker-color) 15%,transparent); }

  /* Energy = Activity-style ring + segmented charge strip. */
  .lp-energy-ring { --ring-size:61px; }
  .lp-tracker-segments { display:grid; grid-template-columns:repeat(10,minmax(0,1fr)); gap:4px; align-items:center; height:18px; }
  .lp-tracker-segments span { height:8px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 8%,transparent); }
  .lp-tracker-segments span[data-filled="true"] { height:12px; background:var(--tracker-color); box-shadow:0 0 9px color-mix(in srgb,var(--tracker-color) 15%,transparent); }

  /* Counter = compact island. Ammo gets a magazine strip rather than the generic grid icon. */
  .lp-counter-instrument { display:flex; align-items:center; gap:13px; min-width:0; }
  .lp-counter-instrument > .lp-tracker-glyph { width:29px; height:29px; padding:8px; box-sizing:content-box; border-radius:14px; background:color-mix(in srgb,var(--tracker-color) 10%,transparent); }
  .lp-counter-instrument .lp-tracker-reading { flex:1; }
  .lp-tracker-counter .lp-tracker-readout { display:flex; gap:7px; align-items:baseline; font-size:37px; }
  .lp-counter-unit { max-width:110px; color:var(--lp-muted); font-size:10px; font-weight:560; letter-spacing:0; line-height:1.2; overflow-wrap:anywhere; }
  .lp-ammo-visual { flex:0 0 auto; display:grid; grid-template-columns:15px repeat(4,8px); gap:4px 5px; align-items:center; padding:9px 10px; border-radius:17px; background:color-mix(in srgb,var(--tracker-color) 8%,transparent); border:1px solid color-mix(in srgb,var(--tracker-color) 12%,var(--lp-border)); }
  .lp-ammo-visual .lp-tracker-glyph { grid-row:1 / span 2; width:15px; height:28px; opacity:.86; }
  .lp-ammo-visual span { width:8px; height:18px; border-radius:5px 5px 3px 3px; background:color-mix(in srgb,var(--lp-text) 8%,transparent); box-shadow:inset 0 -4px color-mix(in srgb,var(--lp-text) 4%,transparent); }
  .lp-ammo-visual span[data-loaded="true"] { background:linear-gradient(180deg,color-mix(in srgb,var(--tracker-color) 72%,white),var(--tracker-color)); box-shadow:0 0 8px color-mix(in srgb,var(--tracker-color) 15%,transparent); }

  /* Timer = the actual Dynamic-Island-inspired case. */
  .lp-timer-instrument { min-width:0; }
  .lp-timer-island { display:flex; align-items:center; gap:11px; min-width:0; padding:10px 13px; border-radius:999px; background:color-mix(in srgb,#000 72%,var(--lp-surface)); border:1px solid color-mix(in srgb,var(--lp-text) 8%,transparent); box-shadow:inset 0 1px #ffffff0d; }
  .lp-timer-island > .lp-tracker-glyph { width:25px; height:25px; }
  .lp-timer-island .lp-tracker-reading { flex:1; display:flex; align-items:center; flex-wrap:nowrap; }
  .lp-tracker-timer .lp-tracker-readout { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:23px; font-weight:720; letter-spacing:-.045em; }
  .lp-tracker-clock-note { width:max-content; max-width:100%; color:var(--lp-muted); font-size:7.5px; line-height:1.35; padding:4px 7px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 4%,transparent); overflow-wrap:anywhere; }

  /* State trackers = current-state chip plus selectable-looking timeline, but remain non-interactive. */
  .lp-state-current { display:flex; align-items:center; gap:8px; min-width:0; padding:9px 11px; border-radius:16px; background:color-mix(in srgb,var(--tracker-color) 9%,transparent); border:1px solid color-mix(in srgb,var(--tracker-color) 12%,var(--lp-border)); }
  .lp-state-current-dot { width:8px; height:8px; border-radius:50%; background:var(--tracker-color); box-shadow:0 0 0 4px color-mix(in srgb,var(--tracker-color) 11%,transparent); }
  .lp-state-current strong { min-width:0; font-size:15px; line-height:1.2; overflow-wrap:anywhere; }
  .lp-state-path { margin:0; padding:0; list-style:none; display:flex; gap:5px; overflow-x:auto; scrollbar-width:none; }
  .lp-state-path::-webkit-scrollbar { display:none; }
  .lp-state-path li { flex:0 0 auto; max-width:105px; padding:6px 9px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 4%,transparent); color:var(--lp-muted); font-size:7.5px; font-weight:650; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .lp-state-path li[data-active="true"] { color:color-mix(in srgb,var(--tracker-color) 78%,white); background:color-mix(in srgb,var(--tracker-color) 14%,transparent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tracker-color) 20%,transparent); }

  /* Generic/custom meters still look intentional and survive arbitrary labels/units. */
  .lp-meter-body { display:flex; align-items:center; gap:11px; min-width:0; }
  .lp-meter-body .lp-tracker-reading { flex:1; }
  .lp-meter-badge { width:36px; height:36px; flex:0 0 36px; display:grid; place-items:center; border-radius:13px; background:color-mix(in srgb,var(--tracker-color) 9%,transparent); border:1px solid color-mix(in srgb,var(--tracker-color) 12%,var(--lp-border)); }
  .lp-meter-badge .lp-tracker-glyph { width:20px; height:20px; }
  .lp-tracker-meter .lp-tracker-readout { font-size:30px; }
  .lp-tracker-card[data-flavor="custom"] { background:linear-gradient(145deg,color-mix(in srgb,var(--tracker-color) 5%,var(--lp-surface)),var(--lp-surface) 56%); }
  .lp-tracker-card[data-flavor="custom"] .lp-meter-badge { border-radius:11px 15px 11px 15px; }

  .lp-tracker-last-change { justify-self:start; max-width:100%; padding:4px 7px; border:0; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 4%,transparent); color:var(--lp-muted); font-size:7.5px; line-height:1.3; overflow-wrap:anywhere; }
  .lp-counter-controls { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .lp-state-choices { display:flex; flex-wrap:wrap; gap:8px; }
  .lp-state-choices .lp-chip[aria-pressed="true"] { opacity:1; background:color-mix(in srgb,var(--lp-accent) 25%,var(--lp-surface)); }
  .lp-tracker-manual { display:grid; }
  .lp-tracker-manual summary { cursor:pointer; color:var(--lp-muted); padding-block:8px; font-size:12px; }
  .lp-tracker-manual .lp-input { margin-bottom:8px; }

  .lumiphone-shell .lp-tracker-compact { min-height:72px; gap:7px; padding:12px 14px; border-radius:22px; }
  .lp-tracker-compact .lp-tracker-top { align-items:center; }
  .lp-tracker-compact .lp-tracker-reading { align-items:center; }
  .lp-tracker-compact .lp-tracker-readout { font-size:22px; }
  .lp-tracker-preview { padding:0; background:transparent; border:0; }
  .lp-selected-members { display:flex; gap:6px; flex-wrap:wrap; }
  .lp-selected-members:empty { display:none; }
  .lp-band-meaning { grid-column:1/-1; }
  .lp-tracker-card[data-meaning="bad"] { border-color:color-mix(in srgb,var(--tracker-color) 18%,var(--lp-border)); }

  .lumiphone-shell:has(.lumiphone-app-view[data-pocket-app="trackers"], .lumiphone-app-view[data-pocket-app="weather"]) .lumiphone-screen { width:100%; min-width:0; }
  .lumiphone-shell .lumiphone-app-view[data-pocket-app="trackers"], #tracker-sampler { container-type:inline-size; width:100%; }
  @container (max-width:390px) {
    .lumiphone-shell .lp-tracker-card { padding:13px 14px 12px; border-radius:24px; }
    .lp-bond-widget { grid-template-columns:1fr; }
    .lp-bond-score { grid-template-columns:minmax(0,1fr) minmax(88px,.8fr); align-items:end; }
    .lp-bond-score .lp-tracker-rail { align-self:center; }
    .lp-tracker-ring { --ring-size:60px; }
    .lp-tracker-readout { font-size:29px; }
  }
  .lp-contact-group .lp-actions,.lp-bank-profile .lp-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .lp-contact-group .lp-button,.lp-bank-profile .lp-button { flex:1 1 auto; }
  .lumiphone-shell .lp-npc-camera { height:100%; min-height:0; display:grid; grid-template-rows:auto minmax(0,1fr); background:#08080a; }
  .lumiphone-shell .lp-npc-camera .lp-nav { background:#08080a; border-color:#ffffff12; }
  .lumiphone-shell .lp-npc-camera .lp-content { min-height:0; padding:0; display:grid; grid-template-rows:36px minmax(320px,1fr) auto; gap:0; overflow:auto; background:#08080a; }
  .lp-npc-viewfinder { position:relative; min-height:0; min-width:0; height:100%; width:auto; max-width:100%; aspect-ratio:3/4; justify-self:center; overflow:hidden; background:radial-gradient(ellipse at 50% 38%,#353038,#101014 72%); color:#fff; }
  .lp-npc-viewfinder::before { content:''; position:absolute; inset:0; background:linear-gradient(to right,transparent 33%,#ffffff0b 33%,#ffffff0b 33.3%,transparent 33.3%,transparent 66.6%,#ffffff0b 66.6%,#ffffff0b 66.9%,transparent 66.9%),linear-gradient(to bottom,transparent 33%,#ffffff0b 33%,#ffffff0b 33.3%,transparent 33.3%,transparent 66.6%,#ffffff0b 66.6%,#ffffff0b 66.9%,transparent 66.9%); pointer-events:none; }
  .lp-camera-mode { display:flex; align-items:center; justify-content:space-between; padding:0 20px; background:#08080a; border-bottom:1px solid #ffffff12; font-size:9px; letter-spacing:.09em; font-weight:750; color:#fff9; }
  .lp-camera-subject { position:absolute; inset:18px 22px 168px; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:0; }
  .lumiphone-shell .lp-camera-floating-brief { position:absolute; bottom:18px; left:18px; right:18px; padding:14px; gap:8px; border:1px solid #ffffff24; border-radius:20px; background:#15151bba; backdrop-filter:blur(18px); box-shadow:0 10px 32px #0005; }
  .lumiphone-shell .lp-camera-floating-brief .lp-field-label { color:#fffd; font-size:11px; }
  .lumiphone-shell .lp-camera-floating-brief .lp-textarea { background:transparent; border:0; border-radius:0; padding:0; min-height:80px; max-height:130px; font-size:13px; color:#fff; resize:none; }
  .lp-camera-floating-brief .lp-textarea::placeholder { color:#ffffff70; }
  .lumiphone-shell .lp-camera.lp-npc-camera { min-height:0; color:#fff; }
  .lp-photo-viewfinder > img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
  .lumiphone-shell .lp-camera-bottom-strip .lp-copy { color:#ffffff9e; }
  .lp-camera-bottom-strip .lp-shutter-row { padding-top:12px; }
  .lp-camera-bottom-strip .lp-disclosure { margin-top:8px; }
  .lp-camera-options-chip { appearance:none; display:block; margin:8px auto 0; border:1px solid #ffffff24; border-radius:20px; padding:7px 14px; background:#ffffff0b; color:#ffffffb8; font:inherit; font-size:11px; cursor:pointer; }
  .lp-camera-sheet-fields { display:grid; gap:calc(12px * var(--pocket-ui-scale)); text-align:left; }
  .lp-avatar-framing { display:grid; place-items:center; padding:12px; }
  .lp-avatar-framing img { width:96px; height:96px; border-radius:50%; object-fit:cover; }
  .lp-avatar-framing-controls { display:grid; gap:12px; }
  .lp-draft-portrait { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.45; }
  .lp-shutter:disabled::after { animation:none; }
  .lp-shutter[data-busy="true"]::after { animation:lp-pulse 1s ease-in-out infinite; }
  .lp-camera-bottom-strip { background:#08080a; border-top:1px solid #ffffff12; padding:14px 18px 18px; }
  .lp-camera-caption { margin:0; text-align:center; color:#f8d670; font-size:9px; letter-spacing:.1em; font-weight:750; }
  .lp-focus-frame { position:relative; width:84px; height:84px; display:grid; place-items:center; color:#f8d670; background:linear-gradient(#f8d670,#f8d670) left top/16px 2px no-repeat,linear-gradient(#f8d670,#f8d670) left top/2px 16px no-repeat,linear-gradient(#f8d670,#f8d670) right top/16px 2px no-repeat,linear-gradient(#f8d670,#f8d670) right top/2px 16px no-repeat,linear-gradient(#f8d670,#f8d670) left bottom/16px 2px no-repeat,linear-gradient(#f8d670,#f8d670) left bottom/2px 16px no-repeat,linear-gradient(#f8d670,#f8d670) right bottom/16px 2px no-repeat,linear-gradient(#f8d670,#f8d670) right bottom/2px 16px no-repeat; }
  .lp-npc-camera-mark { font-size:38px; font-weight:650; }
  .lp-npc-camera-copy { position:relative; text-align:center; margin-top:18px; max-width:320px; max-height:110px; overflow:auto; }
  .lp-npc-camera-copy strong { font-size:16px; }
  .lp-npc-camera-copy p { font-size:11px; line-height:1.6; color:#fff9; }
  .lp-quick-controls { display:grid; grid-template-columns:1fr 68px 1fr; align-items:center; padding:14px 0 0; }
  .lp-npc-camera .lp-shutter { background:#17171c; }
  .lp-npc-camera .lp-shutter::after { background:#fff; }
  .lp-npc-camera .lp-shutter:focus-visible { outline:3px solid var(--lp-accent); outline-offset:5px; }
  .lp-npc-camera .lp-shutter[data-busy="true"]::after { width:65%; height:65%; margin:17.5%; border-radius:6px; background:var(--lp-danger,#e85c69); animation:none; }
  .lp-camera-shutter-action { justify-self:start; }
  .lp-camera-accept { min-height:36px; font-size:12px; padding:8px 10px; border-radius:12px; }
  .lumiphone-shell .lp-camera-floating-brief { backdrop-filter:none; background:#1c1b20; border-radius:12px; box-shadow:0 6px 18px #0004; }
  .lumiphone-shell .lp-camera-floating-brief[hidden] { display:none; }
  .lumiphone-shell .lp-camera-floating-brief .lp-textarea { min-height:56px; }
  .lp-camera-album { display:grid; place-items:center; width:42px; height:42px; padding:0; overflow:hidden; border:1px solid #ffffff25; border-radius:9px; justify-self:start; }
  .lp-camera-album img { width:100%; height:100%; object-fit:cover; }
  .lp-camera-album svg { width:24px; height:24px; }
  .lp-camera-shutter-action { justify-self:end; color:#fff9; font-size:10px; }
  .lp-camera-review-actions { margin-top:12px; display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; padding-top:12px; border-top:1px solid #ffffff14; }
  .lp-camera-review-actions .lp-camera-options-chip { margin:0; }
  .lumiphone-shell .lp-camera-review-actions .lp-camera-accept { grid-column:1/-1; width:100%; min-height:42px; border-radius:10px; background:var(--lp-accent); color:var(--lp-on-accent,#fff); }
  .lp-camera[data-capture-state="review"] .lp-npc-viewfinder::before { display:none; }
  .lumiphone-shell .lumiphone-app-view[data-pocket-app="weather"], #weather-preview { container-type:inline-size; width:100%; }
  /* Weather = a compact iOS-style live widget: semantic color, strong current conditions, and capsule forecast rows. */
  .lumiphone-shell .lp-weather-hero {
    --weather-a:#1788ed; --weather-b:#42b9f5; --weather-c:#2367ca;
    position:relative; isolation:isolate; overflow:hidden; display:grid;
    grid-template-columns:minmax(0,1fr) 112px; grid-template-areas:"top glyph" "temp glyph" "bottom bottom";
    gap:10px 14px; min-height:224px; padding:20px; border:1px solid #ffffff26; border-radius:30px;
    color:#fff; background:linear-gradient(145deg,var(--weather-a),var(--weather-b) 58%,var(--weather-c));
    box-shadow:inset 0 1px #ffffff2b,0 14px 34px #00000030;
  }
  .lumiphone-shell .lp-weather-hero[data-condition="partly"] { --weather-a:#247ed8; --weather-b:#67b8e9; --weather-c:#3f6b9a; }
  .lumiphone-shell .lp-weather-hero[data-condition="cloud"] { --weather-a:#4c5968; --weather-b:#758391; --weather-c:#39424d; }
  .lumiphone-shell .lp-weather-hero[data-condition="rain"] { --weather-a:#254967; --weather-b:#47738e; --weather-c:#20364d; }
  .lumiphone-shell .lp-weather-hero[data-condition="storm"] { --weather-a:#302e50; --weather-b:#4f5270; --weather-c:#22243d; }
  .lumiphone-shell .lp-weather-hero[data-condition="snow"] { --weather-a:#5689ad; --weather-b:#9abdd2; --weather-c:#486b87; }
  .lumiphone-shell .lp-weather-hero[data-condition="fog"] { --weather-a:#59636c; --weather-b:#889198; --weather-c:#495159; }
  .lumiphone-shell .lp-weather-hero[data-condition="wind"] { --weather-a:#267386; --weather-b:#54a6aa; --weather-c:#285d6b; }
  .lp-weather-hero-top { grid-area:top; align-self:start; min-width:0; display:grid; gap:3px; }
  .lp-weather-hero-top .lp-copy { color:#ffffffb5; font-size:10px; line-height:1.35; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-weather-condition { color:#fff; font-size:14px; font-weight:760; line-height:1.2; letter-spacing:-.015em; }
  .lp-weather-temp { grid-area:temp; align-self:center; color:#fff; font-size:66px; line-height:.88; font-weight:660; letter-spacing:-.065em; font-variant-numeric:tabular-nums; text-shadow:0 3px 20px #0002; }
  .lp-weather-hero > .lp-weather-glyph { grid-area:glyph; align-self:center; justify-self:end; width:108px; height:108px; color:#fff; filter:drop-shadow(0 9px 16px #0003); }
  .lp-weather-glyph { display:inline-flex; width:26px; height:26px; flex:none; color:var(--lp-accent); }
  .lp-weather-glyph svg { width:100%; height:100%; overflow:visible; }
  .lp-weather-glyph .lp-weather-soft { fill:currentColor; stroke:none; opacity:.18; }
  .lp-weather-glyph .lp-weather-cloud-fill { fill:currentColor; stroke:none; opacity:.82; }
  .lp-weather-glyph .lp-weather-bolt { fill:currentColor; stroke:currentColor; }
  .lp-weather-hero-bottom { grid-area:bottom; display:flex; align-items:center; gap:7px; min-width:0; padding-top:3px; }
  .lp-weather-stat,.lp-weather-updated { min-width:0; padding:6px 9px; border-radius:999px; background:#ffffff16; border:1px solid #ffffff19; color:#ffffffe0; font-size:8.5px; font-weight:650; line-height:1.2; backdrop-filter:blur(8px); }
  .lp-weather-updated { margin-left:auto; color:#ffffffa8; font-weight:560; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-weather-note { margin:0; padding:13px 15px; border:1px solid color-mix(in srgb,var(--lp-text) 7%,var(--lp-border)); border-radius:18px; background:color-mix(in srgb,var(--lp-text) 3.5%,var(--lp-surface)); box-shadow:inset 0 1px #ffffff08; color:var(--lp-muted); font-size:11.5px; line-height:1.6; }

  .lp-weather-week { display:grid; gap:8px; padding:12px; border:1px solid color-mix(in srgb,var(--lp-text) 8%,var(--lp-border)); border-radius:28px; background:color-mix(in srgb,var(--lp-text) 2.8%,var(--lp-surface)); box-shadow:inset 0 1px #ffffff08,0 8px 22px #00000018; }
  .lp-weather-week-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:5px 5px 8px; }
  .lp-weather-week-heading { min-width:0; display:grid; gap:2px; }
  .lp-weather-week-heading .lp-eyebrow { color:var(--lp-muted); font-size:7.5px; font-weight:760; text-transform:uppercase; letter-spacing:.08em; }
  .lp-weather-week-heading .lp-title { margin:0; color:var(--lp-text); font-size:14px; line-height:1.2; letter-spacing:-.02em; }
  .lp-weather-week-badge { flex:none; padding:5px 8px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 5%,transparent); color:var(--lp-muted); font-size:7.5px; font-weight:650; }
  .lp-weather-empty { min-height:86px; display:flex; align-items:center; gap:12px; padding:14px; border-radius:20px; background:color-mix(in srgb,var(--lp-text) 4%,transparent); color:var(--lp-muted); font-size:10.5px; line-height:1.5; }
  .lp-weather-empty .lp-weather-glyph { width:34px; height:34px; color:var(--lp-accent); }

  .lp-weather-day {
    --weather-day-accent:#64b9ff;
    display:grid; grid-template-columns:42px 28px minmax(0,1fr); align-items:center; gap:5px 9px;
    min-width:0; padding:10px 11px; border:1px solid color-mix(in srgb,var(--lp-text) 6%,transparent); border-radius:20px;
    background:color-mix(in srgb,var(--lp-text) 3.5%,transparent); font-size:10px;
  }
  .lp-weather-day[data-today="true"] { background:color-mix(in srgb,var(--weather-day-accent) 9%,color-mix(in srgb,var(--lp-text) 3.5%,transparent)); border-color:color-mix(in srgb,var(--weather-day-accent) 13%,var(--lp-border)); }
  .lp-weather-day[data-condition="clear"] { --weather-day-accent:#f3b833; }
  .lp-weather-day[data-condition="partly"] { --weather-day-accent:#e7b747; }
  .lp-weather-day[data-condition="cloud"] { --weather-day-accent:#9aa5b2; }
  .lp-weather-day[data-condition="rain"] { --weather-day-accent:#58a9df; }
  .lp-weather-day[data-condition="storm"] { --weather-day-accent:#9b8ae0; }
  .lp-weather-day[data-condition="snow"] { --weather-day-accent:#b9d9ed; }
  .lp-weather-day[data-condition="fog"] { --weather-day-accent:#a4adb4; }
  .lp-weather-day[data-condition="wind"] { --weather-day-accent:#67c6c6; }
  .lp-weather-day-name { color:var(--lp-text); font-size:10px; font-weight:720; }
  .lp-weather-day > .lp-weather-glyph { width:24px; height:24px; color:var(--weather-day-accent); }
  .lp-weather-day-copy { min-width:0; display:grid; gap:2px; }
  .lp-weather-day-condition { min-width:0; color:var(--lp-text); font-size:10px; font-weight:660; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-weather-day-copy small { min-width:0; color:var(--lp-muted); font-size:8px; line-height:1.35; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lp-weather-day-range { grid-column:1/-1; display:grid; grid-template-columns:30px minmax(0,1fr) 30px; align-items:center; gap:8px; padding-top:2px; }
  .lp-weather-low,.lp-weather-high { font-size:8px; font-variant-numeric:tabular-nums; }
  .lp-weather-low { color:var(--lp-muted); }
  .lp-weather-high { color:var(--lp-text); text-align:right; }
  .lp-weather-range-rail { position:relative; height:5px; border-radius:999px; background:color-mix(in srgb,var(--lp-text) 7%,transparent); overflow:hidden; }
  .lp-weather-range-rail > span { position:absolute; height:100%; border-radius:999px; background:var(--weather-day-accent); box-shadow:0 0 8px color-mix(in srgb,var(--weather-day-accent) 18%,transparent); }
  @container (max-width:360px) {
    .lumiphone-shell .lp-weather-hero { grid-template-columns:minmax(0,1fr) 90px; min-height:210px; padding:17px; border-radius:26px; }
    .lp-weather-temp { font-size:58px; }
    .lp-weather-hero > .lp-weather-glyph { width:86px; height:86px; }
    .lp-weather-updated { flex:1 1 100%; margin-left:0; }
    .lp-weather-hero-bottom { flex-wrap:wrap; }
  }
  .lp-app-review { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .lp-app-review .lp-operation-progress { flex-basis:100%; padding:10px 0; color:var(--lp-muted); font-size:12px; }
  .lp-app-review .lp-operation-progress[data-phase="error"] { color:var(--lp-destructive); }
  .lp-timeline-overview { display:flex; align-items:baseline; gap:8px; padding:12px 0; }
  .lp-timeline-overview strong { font-size:28px; font-weight:500; color:var(--lp-text); }
  .lp-timeline-overview strong:not(:first-child) { margin-left:16px; }
  .lp-timeline-section { position:relative; margin:12px 0 4px; padding:4px 0; background:var(--lp-bg); color:var(--lp-muted); font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
  .lumiphone-shell .lp-event[data-completed="true"] { opacity:1; }
  .lumiphone-shell .lp-event[data-completed="true"] .lp-title { text-decoration:none; color:var(--lp-muted); }
  .lumiphone-shell .lp-event-card { width:100%; padding:16px; border:1px solid var(--lp-border); border-radius:12px; background:color-mix(in srgb,var(--lp-text) 5%,var(--lp-bg)); box-shadow:0 3px 10px #0002; }
  .lp-event-card .lp-copy { line-height:1.65; }
  .lp-wallpaper-library { display:grid; gap:14px; }
  .lp-wallpaper-presets-button { grid-column:1/-1; }
  .lp-wallpaper-library-preview { min-height:190px; border-radius:18px; background-size:cover; background-position:center; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:24px 16px 16px; color:#fff; box-shadow:inset 0 0 0 1px #ffffff18; }
  .lp-wallpaper-library-clock { font-size:48px; font-weight:550; letter-spacing:-.06em; line-height:1; text-shadow:0 2px 16px #0005; }
  .lp-wallpaper-library-caption { font-size:12px; padding:6px 12px; border-radius:20px; background:#10101899; color:#fff; }
  .lp-wallpaper-library-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
  .lp-wallpaper-library-card { display:grid; gap:7px; background:none; color:var(--lp-text); border:0; border-radius:12px; padding:4px; font:inherit; font-size:10px; text-align:left; cursor:pointer; }
  .lp-wallpaper-library-card[aria-pressed="true"] { background:var(--lp-surface); outline:2px solid var(--lp-accent); }
  .lp-wallpaper-library-card:focus-visible { outline:2px solid var(--lp-accent); outline-offset:3px; }
  .lp-wallpaper-library-art { display:block; width:100%; aspect-ratio:3/4; border-radius:9px; background-size:cover; background-position:center; box-shadow:inset 0 0 0 1px #ffffff16; }
  .lp-wallpaper-library-card[hidden] { display:none; }
${VOICE_MESSAGE_STYLES}
`;

// src/frontend.ts
function setup(ctx) {
  const removeStyle = ctx.dom.addStyle(PHONE_STYLES);
  const destroyPhone = setupPhone(ctx);
  return () => {
    destroyPhone();
    removeStyle();
  };
}
export {
  setup
};
