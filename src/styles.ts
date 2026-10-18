import { INLINE_BASE_STYLES, INLINE_FINISH_STYLES } from './frontend/components/inline-styles.js'
import { POCKET_DESIGN_SYSTEM } from './frontend/components/design-system.js'
import { VOICE_MESSAGE_STYLES } from './frontend/components/voice-message-styles.js'
export const PHONE_STYLES = `
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
  .lp-setup :is(.lp-select,.lp-input,.lp-textarea) { width:100%; min-width:0; min-height:var(--mochi-v2-shared-setup-is-select-min-height,42px); font:inherit; color:var(--mochi-v2-shared-setup-is-select-color,var(--lp-text)); padding:var(--mochi-v2-shared-setup-is-select-padding,10px); background:var(--mochi-v2-shared-setup-is-select-background,var(--lumiverse-fill-subtle,#ffffff05)); border:var(--mochi-v2-shared-setup-is-select-border,1px solid var(--lp-border)); border-radius:var(--mochi-v2-shared-setup-is-select-border-radius,9px); }
  .lp-setup .lp-button { appearance:var(--mochi-v2-shared-setup-button-appearance,none); border:var(--mochi-v2-shared-setup-button-border,1px solid var(--lp-border)); border-radius:var(--mochi-v2-shared-setup-button-border-radius,9px); min-height:var(--mochi-v2-shared-setup-button-min-height,40px); padding:var(--mochi-v2-shared-setup-button-padding,9px 14px); font:var(--mochi-v2-shared-setup-button-font,600 12px/1.4 Inter,ui-sans-serif,system-ui,sans-serif); color:var(--mochi-v2-shared-setup-button-color,var(--lp-text)); background:var(--mochi-v2-shared-setup-button-background,var(--lumiverse-fill,#ffffff08)); cursor:var(--mochi-v2-shared-setup-button-cursor,pointer); white-space:var(--mochi-v2-shared-setup-button-white-space,normal); }
  .lp-setup .lp-button:disabled { opacity:var(--mochi-v2-shared-setup-button-disabled-opacity,.45); cursor:var(--mochi-v2-shared-setup-button-disabled-cursor,default); }
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
  .lumiphone-shell .lp-sheet .lp-bubble-tools { display:grid; grid-template-columns:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-tools-grid-template-columns,1fr); gap:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-tools-gap,calc(6px * var(--pocket-ui-scale))); }
  .lumiphone-shell .lp-sheet .lp-bubble-action { display:flex; align-items:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-align-items,center); justify-content:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-justify-content,flex-start); gap:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-gap,calc(12px * var(--pocket-ui-scale))); border:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-border,1px solid var(--lp-border)); color:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-color,var(--lp-text)); }
  .lumiphone-shell .lp-sheet .lp-bubble-action::before { content:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-before-content,'↻'); font-size:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-before-font-size,calc(19px * var(--pocket-ui-scale))); width:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-before-width,calc(24px * var(--pocket-ui-scale))); text-align:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-before-text-align,center); color:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-before-color,var(--lp-accent)); }
  .lumiphone-shell .lp-sheet .lp-bubble-action[aria-label="Generation info"]::before { content:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-aria-label-generation-info-before-content,'ⓘ'); }
  .lumiphone-shell .lp-sheet .lp-bubble-action[data-destructive="true"] { color:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-data-destructive-true-color,var(--lp-destructive)); }
  .lumiphone-shell .lp-sheet .lp-bubble-action[data-destructive="true"]::before { content:var(--mochi-v2-shared-lumiphone-shell-sheet-bubble-action-data-destructive-true-before-content,'×'); color:inherit; }
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
  .lp-home-context-controls { display:flex; flex-direction:column; align-items:flex-end; gap:6px; min-width:0; }
  .lp-rp-context-power { display:grid; place-items:center; width:36px; height:36px; padding:8px; color:#9ca3af; border:1px solid currentColor; border-radius:50%; background:#161b24; cursor:pointer; }
  .lp-rp-context-power svg { display:block; width:18px; height:18px; }
  .lp-rp-context-power[aria-pressed="true"] { color:#4ade80; }
  .lp-rp-context-power[aria-pressed="false"] { color:#f87171; }
  .lp-rp-context-power:hover:not(:disabled) { background:#232a36; }
  .lp-rp-context-power:focus-visible { outline:2px solid var(--lp-accent); outline-offset:3px; }
  .lp-rp-context-power:disabled { color:#9ca3af; cursor:wait; }
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
  .lp-nav-action { appearance:var(--mochi-v2-shared-nav-action-appearance,none); min-height:var(--mochi-v2-shared-nav-action-min-height,30px); padding:var(--mochi-v2-shared-nav-action-padding,5px 4px); border:0; background:var(--mochi-v2-shared-nav-action-background,transparent); color:var(--mochi-v2-shared-nav-action-color,var(--lp-accent)); font:inherit; font-size:var(--mochi-v2-shared-nav-action-font-size,11px); font-weight:var(--mochi-v2-shared-nav-action-font-weight,680); cursor:var(--mochi-v2-shared-nav-action-cursor,pointer); text-align:var(--mochi-v2-shared-nav-action-text-align,left); }
  .lp-nav-action:last-child { text-align:var(--mochi-v2-shared-nav-action-last-child-text-align,right); }
  .lp-content { padding:12px; display:grid; gap:10px; }
  .lp-card { padding:12px; border:1px solid var(--lp-border); border-radius:17px; background:var(--lp-surface); box-shadow:0 8px 24px rgba(0,0,0,.06); }
  .lp-card[data-clickable="true"] { cursor:pointer; transition:transform .18s ease,border-color .18s ease; }
  .lp-card[data-clickable="true"]:hover { transform:translateY(-1px); border-color:color-mix(in srgb,var(--lp-accent) 38%,var(--lp-border)); }
  .lp-row { display:flex; align-items:center; gap:10px; min-width:0; }
  .lp-row-between { display:flex; align-items:center; justify-content:space-between; gap:10px; min-width:0; }
  .lp-stack { display:grid; gap:8px; min-width:0; }
  .lp-grow { flex:1; min-width:0; }
  .lp-title { margin:0; font-size:var(--mochi-v2-shared-title-font-size,13px); font-weight:var(--mochi-v2-shared-title-font-weight,760); line-height:var(--mochi-v2-shared-title-line-height,1.3); overflow-wrap:var(--mochi-v2-shared-title-overflow-wrap,anywhere); }
  .lp-copy { margin:0; color:var(--lp-muted); font-size:10px; line-height:1.5; overflow-wrap:anywhere; }
  .lp-eyebrow { color:var(--lp-muted); font-size:8px; line-height:1.2; font-weight:780; letter-spacing:.11em; text-transform:uppercase; }
  .lp-empty { min-height:190px; padding:32px 20px; display:grid; place-items:center; text-align:center; color:var(--lp-muted); }
  .lp-empty svg { width:44px; height:44px; margin-bottom:10px; color:var(--lp-accent); opacity:.8; }
  .lp-button { appearance:var(--mochi-v2-shared-button-appearance,none); min-height:var(--mochi-v2-shared-button-min-height,34px); padding:var(--mochi-v2-shared-button-padding,7px 11px); border:var(--mochi-v2-shared-button-border,1px solid var(--lp-border)); border-radius:var(--mochi-v2-shared-button-border-radius,11px); background:var(--mochi-v2-shared-button-background,var(--lp-surface-2)); color:var(--mochi-v2-shared-button-color,var(--lp-text)); font:inherit; font-size:var(--mochi-v2-shared-button-font-size,10px); font-weight:var(--mochi-v2-shared-button-font-weight,720); cursor:var(--mochi-v2-shared-button-cursor,pointer); }
  .lp-button:hover { border-color:var(--mochi-v2-shared-button-hover-border-color,color-mix(in srgb,var(--lp-accent) 45%,var(--lp-border))); }
  .lp-button:disabled { cursor:var(--mochi-v2-shared-button-disabled-cursor,not-allowed); opacity:var(--mochi-v2-shared-button-disabled-opacity,.45); }
  .lp-button-primary { border-color:var(--mochi-v2-shared-button-primary-border-color,transparent); background:var(--mochi-v2-shared-button-primary-background,var(--lp-accent)); color:var(--mochi-v2-shared-button-primary-color,#fff); }
  .lp-button-danger { color:var(--mochi-v2-shared-button-danger-color,#ff6f87); }
  .lp-button-icon { width:var(--mochi-v2-shared-button-icon-width,34px); padding:var(--mochi-v2-shared-button-icon-padding,6px); display:grid; place-items:var(--mochi-v2-shared-button-icon-place-items,center); }
  .lp-button-icon svg { width:var(--mochi-v2-shared-button-icon-svg-width,16px); height:var(--mochi-v2-shared-button-icon-svg-height,16px); }
  .lp-input, .lp-textarea, .lp-select { width:100%; min-height:var(--mochi-v2-shared-input-min-height,38px); padding:var(--mochi-v2-shared-input-padding,9px 10px); border:var(--mochi-v2-shared-input-border,1px solid var(--lp-border)); border-radius:var(--mochi-v2-shared-input-border-radius,11px); outline:var(--mochi-v2-shared-input-outline,none); background:var(--mochi-v2-shared-input-background,var(--lp-surface)); color:var(--mochi-v2-shared-input-color,var(--lp-text)); font:inherit; font-size:var(--mochi-v2-shared-input-font-size,11px); }
  .lp-input:focus, .lp-textarea:focus, .lp-select:focus { border-color:var(--mochi-v2-shared-input-focus-border-color,color-mix(in srgb,var(--lp-accent) 58%,var(--lp-border))); box-shadow:var(--mochi-v2-shared-input-focus-box-shadow,0 0 0 2px color-mix(in srgb,var(--lp-accent) 16%,transparent)); }
  .lp-textarea { min-height:var(--mochi-v2-shared-textarea-min-height,96px); resize:vertical; line-height:var(--mochi-v2-shared-textarea-line-height,1.5); }
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
  .lp-conversation-menu { position:relative; justify-self:var(--mochi-v2-shared-conversation-menu-justify-self,end); }
  .lp-conversation-menu > summary { display:grid; place-items:var(--mochi-v2-shared-conversation-menu-summary-place-items,center); min-width:var(--mochi-v2-shared-conversation-menu-summary-min-width,30px); cursor:var(--mochi-v2-shared-conversation-menu-summary-cursor,pointer); list-style:var(--mochi-v2-shared-conversation-menu-summary-list-style,none); font-size:var(--mochi-v2-shared-conversation-menu-summary-font-size,18px); line-height:var(--mochi-v2-shared-conversation-menu-summary-line-height,1); }
  .lp-conversation-menu > summary::-webkit-details-marker { display:none; }
  .lp-conversation-menu-sheet { position:absolute; z-index:var(--mochi-v2-shared-conversation-menu-sheet-z-index,30); top:var(--mochi-v2-shared-conversation-menu-sheet-top,calc(100% + 5px)); right:0; width:var(--mochi-v2-shared-conversation-menu-sheet-width,190px); padding:var(--mochi-v2-shared-conversation-menu-sheet-padding,6px); display:grid; gap:var(--mochi-v2-shared-conversation-menu-sheet-gap,2px); border:var(--mochi-v2-shared-conversation-menu-sheet-border,1px solid var(--lp-border)); border-radius:var(--mochi-v2-shared-conversation-menu-sheet-border-radius,13px); background:var(--mochi-v2-shared-conversation-menu-sheet-background,var(--lp-bg)); box-shadow:var(--mochi-v2-shared-conversation-menu-sheet-box-shadow,0 16px 34px rgba(0,0,0,.28)); }
  .lp-conversation-menu-action { appearance:var(--mochi-v2-shared-conversation-menu-action-appearance,none); min-height:var(--mochi-v2-shared-conversation-menu-action-min-height,34px); padding:var(--mochi-v2-shared-conversation-menu-action-padding,7px 9px); border:0; border-radius:var(--mochi-v2-shared-conversation-menu-action-border-radius,8px); background:var(--mochi-v2-shared-conversation-menu-action-background,transparent); color:var(--mochi-v2-shared-conversation-menu-action-color,var(--lp-text)); font:inherit; font-size:var(--mochi-v2-shared-conversation-menu-action-font-size,var(--pocket-font-sm)); text-align:var(--mochi-v2-shared-conversation-menu-action-text-align,left); cursor:var(--mochi-v2-shared-conversation-menu-action-cursor,pointer); }
  .lp-conversation-menu-action:hover { background:var(--mochi-v2-shared-conversation-menu-action-hover-background,var(--lp-surface-2)); }
  .lp-conversation-menu-action:disabled { opacity:var(--mochi-v2-shared-conversation-menu-action-disabled-opacity,.42); cursor:var(--mochi-v2-shared-conversation-menu-action-disabled-cursor,not-allowed); }
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
  .lp-event-invite-actions .lp-button { min-height:var(--mochi-v2-shared-event-invite-actions-button-min-height,36px); padding:var(--mochi-v2-shared-event-invite-actions-button-padding,8px 14px); border-radius:var(--mochi-v2-shared-event-invite-actions-button-border-radius,10px); }
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
  .lp-compose .lp-textarea { min-height:var(--mochi-v2-shared-compose-textarea-min-height,34px); max-height:var(--mochi-v2-shared-compose-textarea-max-height,96px); padding:var(--mochi-v2-shared-compose-textarea-padding,8px 10px); resize:none; border-radius:var(--mochi-v2-shared-compose-textarea-border-radius,17px); }
  .lp-compose .lp-button-icon { border-radius:var(--mochi-v2-shared-compose-button-icon-border-radius,50%); }

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
  .lp-floating-notification { appearance:var(--mochi-v2-shared-floating-notification-appearance,none); position:absolute; z-index:var(--mochi-v2-shared-floating-notification-z-index,45); top:var(--mochi-v2-shared-floating-notification-top,39px); left:var(--mochi-v2-shared-floating-notification-left,10px); right:var(--mochi-v2-shared-floating-notification-right,10px); min-height:var(--mochi-v2-shared-floating-notification-min-height,54px); padding:var(--mochi-v2-shared-floating-notification-padding,8px 10px); border:var(--mochi-v2-shared-floating-notification-border,1px solid color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border))); border-radius:var(--mochi-v2-shared-floating-notification-border-radius,15px); display:grid; grid-template-columns:var(--mochi-v2-shared-floating-notification-grid-template-columns,auto minmax(0,1fr) auto); align-items:var(--mochi-v2-shared-floating-notification-align-items,center); gap:var(--mochi-v2-shared-floating-notification-gap,8px); background:var(--mochi-v2-shared-floating-notification-background,color-mix(in srgb,var(--lp-surface) 94%,transparent)); color:var(--mochi-v2-shared-floating-notification-color,var(--lp-text)); backdrop-filter:var(--mochi-v2-shared-floating-notification-backdrop-filter,blur(22px)); box-shadow:var(--mochi-v2-shared-floating-notification-box-shadow,0 14px 36px rgba(0,0,0,.28)); text-align:var(--mochi-v2-shared-floating-notification-text-align,left); cursor:var(--mochi-v2-shared-floating-notification-cursor,pointer); }
  .lp-floating-notification > span:first-child svg { width:var(--mochi-v2-shared-floating-notification-span-first-child-svg-width,20px); height:var(--mochi-v2-shared-floating-notification-span-first-child-svg-height,20px); }
  .lp-floating-notification > .lp-grow { display:grid; gap:var(--mochi-v2-shared-floating-notification-grow-gap,2px); }
  .lp-floating-notification > .lp-grow span { color:var(--mochi-v2-shared-floating-notification-grow-span-color,var(--lp-muted)); font-size:var(--mochi-v2-shared-floating-notification-grow-span-font-size,9px); overflow:hidden; text-overflow:var(--mochi-v2-shared-floating-notification-grow-span-text-overflow,ellipsis); white-space:var(--mochi-v2-shared-floating-notification-grow-span-white-space,nowrap); }
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
  .lp-npc-portrait-actions .lp-button { min-width:0; white-space:var(--mochi-v2-shared-npc-portrait-actions-button-white-space,normal); }
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
  .lp-event[data-completed="true"] .lp-title { text-decoration:var(--mochi-v2-shared-event-data-completed-true-title-text-decoration,line-through); }
  .lp-progress { height:7px; overflow:hidden; border-radius:99px; background:var(--lp-surface-2); }
  .lp-progress span { display:block; height:100%; width:var(--progress,0%); border-radius:inherit; background:var(--tracker-color,var(--lp-accent)); transition:width .5s ease; }
  .lp-rate { color:var(--lp-muted); font-size:8px; }
  .lp-toggle { appearance:var(--mochi-v2-shared-toggle-appearance,none); width:var(--mochi-v2-shared-toggle-width,40px); height:var(--mochi-v2-shared-toggle-height,23px); border:0; border-radius:var(--mochi-v2-shared-toggle-border-radius,99px); padding:var(--mochi-v2-shared-toggle-padding,2px); background:var(--mochi-v2-shared-toggle-background,var(--lp-surface-2)); cursor:var(--mochi-v2-shared-toggle-cursor,pointer); transition:var(--mochi-v2-shared-toggle-transition,background .2s ease); }
  .lp-toggle::after { content:var(--mochi-v2-shared-toggle-after-content,""); display:block; width:var(--mochi-v2-shared-toggle-after-width,19px); height:var(--mochi-v2-shared-toggle-after-height,19px); border-radius:var(--mochi-v2-shared-toggle-after-border-radius,50%); background:var(--mochi-v2-shared-toggle-after-background,#fff); box-shadow:var(--mochi-v2-shared-toggle-after-box-shadow,0 2px 7px rgba(0,0,0,.28)); transition:var(--mochi-v2-shared-toggle-after-transition,transform .2s ease); }
  .lp-toggle[aria-pressed="true"] { background:var(--mochi-v2-shared-toggle-aria-pressed-true-background,var(--lp-accent)); }
  .lp-toggle[aria-pressed="true"]::after { transform:var(--mochi-v2-shared-toggle-aria-pressed-true-after-transform,translateX(17px)); }
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
  .lumiphone-shell .lp-title { font-size:var(--mochi-v2-shared-lumiphone-shell-title-font-size,var(--pocket-font-md)); }
  .lumiphone-shell .lp-copy { font-size:var(--pocket-font-sm); }
  .lumiphone-shell .lp-eyebrow { font-size:var(--pocket-font-xs); }
  .lumiphone-shell .lp-button { min-height:var(--mochi-v2-shared-lumiphone-shell-button-min-height,calc(34px * var(--pocket-ui-scale))); padding:var(--mochi-v2-shared-lumiphone-shell-button-padding,calc(7px * var(--pocket-ui-scale)) calc(11px * var(--pocket-ui-scale))); font-size:var(--mochi-v2-shared-lumiphone-shell-button-font-size,var(--pocket-font-sm)); }
  .lumiphone-shell .lp-button-icon { width:var(--mochi-v2-shared-lumiphone-shell-button-icon-width,calc(34px * var(--pocket-ui-scale))); padding:var(--mochi-v2-shared-lumiphone-shell-button-icon-padding,calc(6px * var(--pocket-ui-scale))); }
  .lumiphone-shell .lp-input,.lumiphone-shell .lp-textarea,.lumiphone-shell .lp-select { min-height:var(--mochi-v2-shared-lumiphone-shell-input-min-height,var(--pocket-control-h)); padding:var(--mochi-v2-shared-lumiphone-shell-input-padding,calc(9px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale))); font-size:var(--mochi-v2-shared-lumiphone-shell-input-font-size,calc(11px * var(--pocket-ui-scale))); }
  .lumiphone-shell .lp-label { gap:calc(5px * var(--pocket-ui-scale)); font-size:calc(9px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav { min-height:calc(48px * var(--pocket-ui-scale)); padding:calc(7px * var(--pocket-ui-scale)) calc(12px * var(--pocket-ui-scale)); grid-template-columns:calc(74px * var(--pocket-ui-scale)) minmax(0,1fr) calc(74px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav-title { font-size:calc(14px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav-subtitle { font-size:calc(9px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-nav-action { min-height:var(--mochi-v2-shared-lumiphone-shell-nav-action-min-height,calc(30px * var(--pocket-ui-scale))); font-size:var(--mochi-v2-shared-lumiphone-shell-nav-action-font-size,calc(11px * var(--pocket-ui-scale))); }
  .lumiphone-shell .lp-app-grid { gap:calc(18px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-icon-box { width:var(--pocket-icon); height:var(--pocket-icon); border-radius:calc(16px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-icon-box svg { width:calc(27px * var(--pocket-ui-scale)); height:calc(27px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-app-label { font-size:var(--pocket-font-sm); }
  .lumiphone-shell .lp-avatar { width:calc(42px * var(--pocket-ui-scale)); height:calc(42px * var(--pocket-ui-scale)); flex-basis:calc(42px * var(--pocket-ui-scale)); font-size:calc(15px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-bubbles { padding:calc(14px * var(--pocket-ui-scale)) calc(12px * var(--pocket-ui-scale)); gap:calc(7px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-bubble { padding:calc(8px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); border-radius:calc(16px * var(--pocket-ui-scale)); font-size:calc(11px * var(--pocket-ui-scale)); }
  .lumiphone-shell .lp-compose { padding:calc(8px * var(--pocket-ui-scale)) calc(9px * var(--pocket-ui-scale)) calc(10px * var(--pocket-ui-scale)); gap:calc(6px * var(--pocket-ui-scale)); grid-template-columns:auto minmax(0,1fr) auto; }
  .lumiphone-shell .lp-compose .lp-textarea { min-height:var(--mochi-v2-shared-lumiphone-shell-compose-textarea-min-height,calc(34px * var(--pocket-ui-scale))); max-height:var(--mochi-v2-shared-lumiphone-shell-compose-textarea-max-height,calc(112px * var(--pocket-ui-scale))); border-radius:var(--mochi-v2-shared-lumiphone-shell-compose-textarea-border-radius,calc(17px * var(--pocket-ui-scale))); }
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
  .lp-code-input { min-height:var(--mochi-v2-shared-code-input-min-height,150px); font-family:var(--mochi-v2-shared-code-input-font-family,ui-monospace,SFMono-Regular,Consolas,monospace); white-space:var(--mochi-v2-shared-code-input-white-space,pre); }
  .lp-swarm-diagnostics { display:grid; gap:6px; }
  .lp-swarm-diagnostics summary { cursor:pointer; color:var(--lp-muted); font-size:var(--pocket-font-sm); }
  .lp-gallery-actions { margin-top:12px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .lp-gallery-actions .lp-select { grid-column:var(--mochi-v2-shared-gallery-actions-select-grid-column,1 / -1); }
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
    width:var(--mochi-v2-shared-compose-button-icon-width,calc(36px * var(--pocket-ui-scale))); height:var(--mochi-v2-shared-compose-button-icon-height,calc(36px * var(--pocket-ui-scale)));
    min-height:var(--mochi-v2-shared-compose-button-icon-min-height,calc(36px * var(--pocket-ui-scale))); padding:0; border-radius:var(--mochi-v2-shared-compose-button-icon-border-radius,50%);
    display:grid; place-items:var(--mochi-v2-shared-compose-button-icon-place-items,center);
  }
  .lp-compose .lp-textarea { min-height:var(--mochi-v2-shared-compose-textarea-min-height,calc(36px * var(--pocket-ui-scale))); padding:var(--mochi-v2-shared-compose-textarea-padding,8px 11px); border-radius:var(--mochi-v2-shared-compose-textarea-border-radius,calc(18px * var(--pocket-ui-scale))); }
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
  .lp-band-editor .lp-input { min-width:0; padding:var(--mochi-v2-shared-band-editor-input-padding,8px); }
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
  .lp-tracker-heading .lp-title { margin:0; color:var(--mochi-v2-shared-tracker-heading-title-color,var(--lp-text)); font-size:var(--mochi-v2-shared-tracker-heading-title-font-size,13px); line-height:var(--mochi-v2-shared-tracker-heading-title-line-height,1.25); letter-spacing:var(--mochi-v2-shared-tracker-heading-title-letter-spacing,-.015em); overflow-wrap:var(--mochi-v2-shared-tracker-heading-title-overflow-wrap,anywhere); }
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
  .lp-tracker-manual .lp-input { margin-bottom:var(--mochi-v2-shared-tracker-manual-input-margin-bottom,8px); }

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
  .lp-contact-group .lp-button,.lp-bank-profile .lp-button { flex:var(--mochi-v2-shared-contact-group-button-flex,1 1 auto); }
  .lumiphone-shell .lp-npc-camera { height:100%; min-height:0; display:grid; grid-template-rows:auto minmax(0,1fr); background:#08080a; }
  .lumiphone-shell .lp-npc-camera .lp-nav { background:#08080a; border-color:#ffffff12; }
  .lumiphone-shell .lp-npc-camera .lp-content { min-height:0; padding:0; display:grid; grid-template-rows:36px minmax(320px,1fr) auto; gap:0; overflow:auto; background:#08080a; }
  .lp-npc-viewfinder { position:relative; min-height:0; min-width:0; height:100%; width:auto; max-width:100%; aspect-ratio:3/4; justify-self:center; overflow:hidden; background:radial-gradient(ellipse at 50% 38%,#353038,#101014 72%); color:#fff; }
  .lp-npc-viewfinder::before { content:''; position:absolute; inset:0; background:linear-gradient(to right,transparent 33%,#ffffff0b 33%,#ffffff0b 33.3%,transparent 33.3%,transparent 66.6%,#ffffff0b 66.6%,#ffffff0b 66.9%,transparent 66.9%),linear-gradient(to bottom,transparent 33%,#ffffff0b 33%,#ffffff0b 33.3%,transparent 33.3%,transparent 66.6%,#ffffff0b 66.6%,#ffffff0b 66.9%,transparent 66.9%); pointer-events:none; }
  .lp-camera-mode { display:flex; align-items:center; justify-content:space-between; padding:0 20px; background:#08080a; border-bottom:1px solid #ffffff12; font-size:9px; letter-spacing:.09em; font-weight:750; color:#fff9; }
  .lp-camera-subject { position:absolute; inset:18px 22px 168px; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:0; }
  .lumiphone-shell .lp-camera-floating-brief { position:absolute; bottom:18px; left:18px; right:18px; padding:14px; gap:8px; border:1px solid #ffffff24; border-radius:20px; background:#15151bba; backdrop-filter:blur(18px); box-shadow:0 10px 32px #0005; }
  .lumiphone-shell .lp-camera-floating-brief .lp-field-label { color:#fffd; font-size:11px; }
  .lumiphone-shell .lp-camera-floating-brief .lp-textarea { background:var(--mochi-v2-shared-lumiphone-shell-camera-floating-brief-textarea-background,transparent); border:0; border-radius:0; padding:0; min-height:var(--mochi-v2-shared-lumiphone-shell-camera-floating-brief-textarea-min-height,80px); max-height:var(--mochi-v2-shared-lumiphone-shell-camera-floating-brief-textarea-max-height,130px); font-size:var(--mochi-v2-shared-lumiphone-shell-camera-floating-brief-textarea-font-size,13px); color:var(--mochi-v2-shared-lumiphone-shell-camera-floating-brief-textarea-color,#fff); resize:none; }
  .lp-camera-floating-brief .lp-textarea::placeholder { color:var(--mochi-v2-shared-camera-floating-brief-textarea-placeholder-color,#ffffff70); }
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
  .lumiphone-shell .lp-camera-floating-brief .lp-textarea { min-height:var(--mochi-v2-shared-lumiphone-shell-camera-floating-brief-textarea-min-height,56px); }
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
  .lp-weather-week-heading .lp-title { margin:0; color:var(--mochi-v2-shared-weather-week-heading-title-color,var(--lp-text)); font-size:var(--mochi-v2-shared-weather-week-heading-title-font-size,14px); line-height:var(--mochi-v2-shared-weather-week-heading-title-line-height,1.2); letter-spacing:var(--mochi-v2-shared-weather-week-heading-title-letter-spacing,-.02em); }
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
  .lumiphone-shell .lp-event[data-completed="true"] .lp-title { text-decoration:var(--mochi-v2-shared-lumiphone-shell-event-data-completed-true-title-text-decoration,none); color:var(--mochi-v2-shared-lumiphone-shell-event-data-completed-true-title-color,var(--lp-muted)); }
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
`
