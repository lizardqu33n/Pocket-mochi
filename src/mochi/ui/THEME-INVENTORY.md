# Mochi theme coverage

The complete reference is [UI-CUSTOMIZATION-MAP.md](UI-CUSTOMIZATION-MAP.md); machine-readable data is [theme-inventory.json](theme-inventory.json). No Mochi CSS section is deferred. Structural declarations use listed selectors rather than generic visual tokens. Shared Pocket primitives are included.

| Section | Rules | Distinct consumed tokens |
|---|---:|---:|
| base | 340 | 741 |
| mochi-reply-styles | 8 | 22 |
| mochi-reaction-styles | 9 | 25 |
| mochi-pin-styles | 11 | 30 |
| mochi-search-styles | 12 | 29 |
| mochi-texting-styles | 4 | 8 |
| mochi-preview-styles | 6 | 16 |
| mochi-preset-styles | 8 | 19 |
| block-editor | 47 | 102 |
| preset-workspace-base | 22 | 62 |
| mochi-preset-dedicated-styles | 25 | 40 |
| mochi-preset-chrome-styles | 12 | 12 |
| preset-workspace-final | 12 | 15 |
| mochi-memory-styles | 8 | 25 |
| settings-workspace-styles | 120 | 257 |
| mochi-disclosure-styles | 24 | 54 |
| desktop | 200 | 434 |
| mochi-sidebar-styles | 105 | 207 |
| launcher | 4 | 11 |
| mobile-surface | 3 | 6 |
| window | 6 | 19 |
| window-focus | 2 | 2 |
| workspace | 3 | 1 |
| notifications | 5 | 10 |
| icons | 223 | 333 |
| shared-pocket | 141 | 394 |

## Inline assignments

These are private measurements, saved accessibility backing values, or host root-fill invariants. Dialog measurements live in the shared sheet helper and are consumed through CSS variables.

- src/mochi/mobile-surface.ts:14 — host root fill invariant
- src/mochi/personal-settings.ts:68 — saved accessibility backing values
- src/mochi/ui/geometry.ts:4 — private geometry measurements; public CSS controls mapped separately
- src/mochi/ui/geometry.ts:5 — private geometry measurements; public CSS controls mapped separately
- src/mochi/view.ts:710 — private geometry measurements; public CSS controls mapped separately
- src/mochi/view.ts:770 — saved accessibility backing values
- src/mochi/view.ts:771 — saved accessibility backing values
- src/mochi/view.ts:987 — private geometry measurements; public CSS controls mapped separately
- src/mochi/window.ts:61 — host root fill invariant

## Common semantic tokens

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
| `--mochi-menu-max-height` | `300px` |
| `--mochi-menu-viewport-gap` | `8px` |
| `--mochi-action-gap` | `3px` |
| `--mochi-action-edge-inset` | `4px` |
| `--mochi-dialog-edge` | `12px` |
| `--mochi-dialog-bottom-gap` | `24px` |
| `--mochi-dialog-height-reserve` | `70px` |
| `--mochi-dialog-min-height` | `120px` |
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
