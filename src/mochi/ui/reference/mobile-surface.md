# mobile-surface

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-mobile-surface` | `display` → selector only = `flex`<br>`flex-direction` → `--mochi-v2-mobile-surface-flex-direction` = `column`<br>`overflow` → selector only = `hidden`<br>`box-sizing` → selector only = `border-box`<br>`background` → `--mochi-chrome-bg` = `var(--mochi-chrome-bg)`<br>`color` → `--mochi-chrome-text` = `var(--mochi-chrome-text)`<br>`padding` → `--mochi-v2-mobile-surface-padding` = `env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)`<br>`font` → `--mochi-mobile-font` = `var(--mochi-mobile-font)` | src/mochi/ui/mochi.css:4665 |
| `.mochi-mobile-surface>.mochi-sidebar` | `flex` → `--mochi-v2-mobile-surface-sidebar-flex` = `1`<br>`min-width` → selector only = `0`<br>`min-height` → selector only = `0`<br>`width` → selector only = `100%`<br>`overflow` → selector only = `hidden` | src/mochi/ui/mochi.css:4675 |
| `.mochi-mobile-surface [hidden]` | `display` → selector only = `none` !important | src/mochi/ui/mochi.css:4682 |
