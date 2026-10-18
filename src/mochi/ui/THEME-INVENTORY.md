# Mochi theme inventory (generated)

Refresh with `bun scripts/audit-mochi-theme.ts`. These are heuristic migration candidates, not a requirement to turn structural CSS into tokens. Counts include literal values inside fallbacks and formulas. Repeated rules are intentionally included.

The supported public selector contract is in [THEME-CONTRACT.md](THEME-CONTRACT.md). Exact class candidates and declaration values per section are in [theme-inventory.json](theme-inventory.json). This inventory does not cover host-owned UI or shared Pocket CSS consumed by Mochi; those require a separate cross-surface audit.

| Section | Literal candidates | Direct host-variable declarations | Class candidates | !important |
|---|---:|---:|---:|---:|
| base | 498 | 36 | 91 | 6 |
| mochi-reply-styles | 11 | 1 | 4 | 0 |
| mochi-reaction-styles | 20 | 3 | 5 | 0 |
| mochi-pin-styles | 18 | 3 | 8 | 0 |
| mochi-search-styles | 17 | 2 | 6 | 0 |
| mochi-texting-styles | 5 | 0 | 2 | 0 |
| mochi-preview-styles | 10 | 1 | 4 | 0 |
| mochi-preset-styles | 12 | 0 | 4 | 0 |
| block-editor | 61 | 0 | 20 | 0 |
| preset-workspace-base | 37 | 0 | 15 | 0 |
| mochi-preset-dedicated-styles | 22 | 0 | 15 | 3 |
| mochi-preset-chrome-styles | 7 | 0 | 6 | 0 |
| preset-workspace-final | 10 | 0 | 6 | 0 |
| mochi-memory-styles | 16 | 2 | 5 | 0 |
| settings-workspace-styles | 143 | 0 | 46 | 2 |
| mochi-disclosure-styles | 34 | 3 | 12 | 0 |
| desktop | 256 | 18 | 60 | 3 |
| mochi-sidebar-styles | 76 | 0 | 50 | 1 |
| launcher | 4 | 1 | 2 | 0 |
| mobile-surface | 1 | 0 | 2 | 1 |
| window | 5 | 1 | 5 | 0 |
| window-focus | 2 | 1 | 2 | 1 |
| workspace | 0 | 0 | 2 | 1 |
| notifications | 4 | 1 | 2 | 0 |

## Inline style audit

- src/mochi/mobile-surface.ts:14 — host root fill geometry (retain)
- src/mochi/personal-settings.ts:67 — saved accessibility backing variables (retain)
- src/mochi/view.ts:708 — measured geometry; visual limits/offsets pending extraction
- src/mochi/view.ts:768 — saved accessibility backing variables (retain)
- src/mochi/view.ts:769 — saved accessibility backing variables (retain)
- src/mochi/view.ts:985 — measured geometry; visual limits/offsets pending extraction
- src/mochi/view.ts:1115 — measured geometry; visual limits/offsets pending extraction
- src/mochi/view.ts:1117 — measured geometry; visual limits/offsets pending extraction
- src/mochi/window.ts:60 — host root fill geometry (retain)

## Current public tokens and original defaults

Copy [starter-theme.css](starter-theme.css) for the full editable starter. Private saved backing values are deliberately not included.

| Token | Default |
|---|---|
| `--mochi-interface-scale` | `var(--mochi-saved-interface-scale,1)` |
| `--mochi-message-scale` | `var(--mochi-saved-message-scale,1)` |
| `--mochi-brand-hue` | `263` |
| `--mochi-brand-saturation` | `55%` |
| `--mochi-brand-lightness` | `60%` |
| `--mochi-brand-accent` | `hsl(var(--mochi-brand-hue) var(--mochi-brand-saturation) var(--mochi-brand-lightness))` |
| `--mochi-input-border` | `color-mix(in srgb,var(--mochi-text) 55%,var(--mochi-input-bg))` |
| `--mochi-radius-panel` | `12px` |
| `--mochi-radius-button` | `6px` |
| `--mochi-mobile-control-size` | `44px` |
| `--mochi-success` | `var(--lumiverse-success,#319c70)` |
| `--mochi-warning` | `var(--lumiverse-warning,#c28730)` |
| `--mochi-drawer-bg` | `var(--lumiverse-bg-deep,var(--lp-bg,#111017))` |
| `--mochi-sidebar-bg` | `var(--lumiverse-bg,var(--lp-bg,#17151d))` |
| `--mochi-elevated-bg` | `var(--lumiverse-bg-elevated,var(--lp-surface-2,#25222d))` |
| `--mochi-section-bg` | `var(--lumiverse-fill-subtle,#00000012)` |
| `--mochi-input-bg` | `var(--lumiverse-bg,var(--lp-bg,#17151d))` |
| `--mochi-control-bg` | `transparent` |
| `--mochi-hover-bg` | `var(--lumiverse-fill-hover,#80808020)` |
| `--mochi-selected-bg` | `color-mix(in srgb,var(--mochi-accent) 15%,var(--mochi-surface))` |
| `--mochi-account-accent` | `var(--mochi-accent)` |
| `--mochi-muted` | `color-mix(in srgb,var(--lumiverse-text-muted,var(--lp-muted,#aaa4b9)) 85%,var(--mochi-text))` |
| `--mochi-on-accent` | `var(--mochi-brand-contrast,#000)` |
| `--mochi-accent-hover` | `color-mix(in srgb,var(--mochi-accent) 90%,var(--mochi-text))` |
| `--mochi-border-hover` | `var(--lumiverse-border-hover,var(--mochi-border))` |
| `--mochi-focus` | `var(--mochi-accent)` |
| `--mochi-focus-bg` | `var(--lumiverse-primary-010,#a99bff1a)` |
| `--mochi-danger` | `var(--lumiverse-danger,#e35b68)` |
| `--mochi-danger-hover` | `var(--lumiverse-danger-hover,#d44354)` |
| `--mochi-danger-bg` | `var(--lumiverse-danger-015,#e35b6826)` |
| `--mochi-editor-control-height` | `34px` |
| `--mochi-editor-gap` | `8px` |
| `--mochi-editor-radius` | `7px` |
| `--mochi-icon-stroke-width` | `1.7` |
| `--mochi-accounts-nav-gap` | `6px` |
| `--mochi-accounts-nav-padding` | `8px` |
| `--mochi-accounts-picker-padding` | `0 8px 12px` |
| `--mochi-accounts-button-padding` | `6px 10px` |
| `--mochi-accounts-avatar-flex` | `0 0 36px` |
| `--mochi-accounts-avatar-size` | `36px` |
| `--mochi-accounts-avatar-radius` | `50%` |
| `--mochi-disabled-opacity` | `.4` |
| `--mochi-accounts-tools-gap` | `4px` |
| `--mochi-accounts-tools-margin` | `7px 0` |
| `--mochi-accounts-icon-control-size` | `34px` |
| `--mochi-accounts-icon-padding` | `8px` |
| `--mochi-accounts-icon-radius` | `6px` |
| `--mochi-accounts-icon-size` | `16px` |
| `--mochi-accounts-list-gap` | `3px` |
| `--mochi-accounts-row-radius` | `8px` |
| `--mochi-accounts-row-padding` | `7px` |
| `--mochi-accounts-row-gap` | `8px` |
| `--mochi-accounts-grid-columns` | `repeat(auto-fill,minmax(116px,1fr))` |
| `--mochi-accounts-grid-row-height` | `112px` |
| `--mochi-accounts-grid-row-padding-top` | `12px` |
| `--mochi-accounts-grid-avatar-size` | `48px` |
| `--mochi-accounts-section-padding` | `8px 0` |
| `--mochi-accounts-section-gap` | `6px` |
| `--mochi-accounts-preview-radius` | `10px` |
| `--mochi-accounts-preview-columns` | `42px minmax(0,1fr)` |
| `--mochi-accounts-preview-padding` | `10px` |
| `--mochi-accounts-preview-gap` | `2px 10px` |
| `--mochi-accounts-preview-avatar-size` | `42px` |
| `--mochi-accounts-persona-max-height` | `190px` |
| `--mochi-accounts-persona-avatar-size` | `28px` |
| `--mochi-accounts-content-max-height` | `220px` |
| `--mochi-accounts-font-10` | `calc(10px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-font-11` | `calc(11px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-font-12` | `calc(12px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-font-13` | `calc(13px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-font-15` | `calc(15px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-font-16` | `calc(16px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-font-18` | `calc(18px * var(--mochi-interface-scale,1))` |
| `--mochi-accounts-field-padding` | `6px 9px` |
| `--mochi-chrome-bg` | `var(--lumiverse-bg-elevated,#201e25)` |
| `--mochi-chrome-text` | `var(--lumiverse-text,#eee)` |
| `--mochi-chrome-border` | `var(--lumiverse-border,#ffffff26)` |
| `--mochi-window-radius` | `14px` |
| `--mochi-window-shadow` | `0 12px 32px #0005` |
| `--mochi-window-bar-padding` | `8px 12px` |
| `--mochi-window-bar-height` | `36px` |
| `--mochi-mobile-font` | `400 13px/1.5 Inter,ui-sans-serif,system-ui,sans-serif` |
| `--mochi-launcher-frame-size` | `58px` |
| `--mochi-launcher-size` | `52px` |
| `--mochi-launcher-padding` | `6px` |
| `--mochi-launcher-radius` | `14px` |
| `--mochi-sidebar-min-width` | `280px` |
| `--mochi-sidebar-width` | `320px` |
| `--mochi-sidebar-details-min-width` | `190px` |
| `--mochi-sidebar-details-width` | `320px` |
| `--mochi-profile-panel-width` | `300px` |
| `--mochi-chat-font-size` | `calc(15px * var(--mochi-message-scale))` |
| `--mochi-bubble-radius` | `22px` |
| `--mochi-bubble-corner-radius` | `6px` |
| `--mochi-bubble-padding-y` | `8px` |
| `--mochi-bubble-padding-x` | `12px` |
| `--mochi-bubble-max-width` | `80%` |
| `--mochi-avatar-size` | `44px` |
| `--mochi-wordmark-width` | `96px` |
| `--mochi-control-font-size` | `calc(14px * var(--mochi-interface-scale))` |
| `--mochi-heading-font-size` | `calc(18px * var(--mochi-interface-scale))` |
| `--mochi-radius-field` | `10px` |
| `--mochi-radius-card` | `14px` |
| `--mochi-space-xs` | `6px` |
| `--mochi-space-sm` | `10px` |
| `--mochi-space-md` | `14px` |
| `--mochi-space-lg` | `20px` |
| `--mochi-space-xl` | `28px` |
| `--mochi-user-bubble-text` | `var(--mochi-on-accent)` |
| `--mochi-list-avatar-size` | `34px` |
| `--mochi-header-avatar-size` | `38px` |
| `--mochi-profile-avatar-size` | `76px` |
| `--mochi-message-avatar-size` | `38px` |
| `--mochi-message-gap` | `12px` |
| `--mochi-messenger-control-size` | `40px` |
| `--mochi-messenger-font` | `var(--lumiverse-font-family, system-ui, sans-serif)` |
| `--mochi-bubble-line-length` | `78ch` |
| `--mochi-panel-radius` | `22px` |
| `--mochi-control-radius` | `8px` |
| `--mochi-header-icon-size` | `18px` |
| `--mochi-composer-min-height` | `48px` |
| `--mochi-action-duration` | `140ms` |
| `--mochi-action-stagger` | `30ms` |
| `--mochi-action-lift` | `-2px` |
| `--mochi-text` | `var(--lumiverse-text,var(--lp-text,#f7f5ff))` |
| `--mochi-accent` | `var(--mochi-brand-accent)` |
| `--mochi-surface` | `var(--lumiverse-bg,var(--lp-bg,#17151d))` |
| `--mochi-border` | `var(--lumiverse-border,var(--lp-border,#ffffff18))` |
| `--mochi-on-accent` | `contrast-color(var(--mochi-accent))` |
