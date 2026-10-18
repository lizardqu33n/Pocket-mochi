# mochi-preset-styles

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-view .mochi-preset-panel` | `min-width` → selector only = `0`<br>`min-height` → selector only = `0`<br>`max-height` → `--mochi-v2-preset-panel-max-height` = `45%`<br>`overflow` → selector only = `auto`<br>`flex` → `--mochi-v2-preset-panel-flex` = `0 1 auto`<br>`padding` → `--mochi-v2-preset-panel-padding` = `10px`<br>`border-bottom` → `--mochi-v2-preset-panel-border-bottom` = `1px solid var(--mochi-border)`<br>`overflow-wrap` → `--mochi-v2-preset-panel-overflow-wrap` = `anywhere` | src/mochi/ui/mochi.css:2234 |
| `.mochi-view .mochi-preset-panel button` | `min-height` → `--mochi-v2-preset-panel-button-min-height` = `40px`<br>`margin` → `--mochi-v2-preset-panel-button-margin` = `3px` | src/mochi/ui/mochi.css:2244 |
| `.mochi-view .mochi-preset-panel select` | `max-width` → selector only = `100%`<br>`min-width` → selector only = `0` | src/mochi/ui/mochi.css:2248 |
| `.mochi-view .mochi-preset-editor` | `display` → selector only = `grid`<br>`gap` → `--mochi-space-sm` = `var(--mochi-space-sm)`<br>`min-width` → selector only = `0` | src/mochi/ui/mochi.css:2252 |
| `.mochi-view .mochi-preset-editor label` | `display` → selector only = `grid`<br>`gap` → `--mochi-space-xs` = `var(--mochi-space-xs)`<br>`min-width` → selector only = `0` | src/mochi/ui/mochi.css:2257 |
| `.mochi-view .mochi-preset-editor input,.mochi-view .mochi-preset-editor textarea` | `box-sizing` → selector only = `border-box`<br>`width` → selector only = `100%`<br>`min-width` → selector only = `0`<br>`font` → selector only = `inherit`<br>`background` → `--mochi-v2-preset-editor-input-background` = `color-mix(in srgb,currentColor 3%,var(--mochi-surface))`<br>`color` → selector only = `inherit`<br>`border` → `--mochi-v2-preset-editor-input-border` = `1px solid var(--mochi-border)`<br>`border-radius` → `--mochi-radius-field` = `var(--mochi-radius-field)`<br>`padding` → `--mochi-v2-preset-editor-input-padding` = `8px` | src/mochi/ui/mochi.css:2262 |
| `.mochi-view .mochi-preset-entry` | `border` → `--mochi-v2-preset-entry-border` = `1px solid var(--mochi-border)`<br>`border-radius` → `--mochi-v2-preset-entry-border-radius` = `10px`<br>`padding` → `--mochi-v2-preset-entry-padding` = `8px`<br>`margin-top` → `--mochi-v2-preset-entry-margin-top` = `8px` | src/mochi/ui/mochi.css:2273 |
| `.mochi-view .mochi-preset-panel :focus-visible` | `outline` → `--mochi-v2-preset-panel-focus-visible-outline` = `2px solid var(--mochi-accent)`<br>`outline-offset` → `--mochi-v2-preset-panel-focus-visible-outline-offset` = `2px` | src/mochi/ui/mochi.css:2279 |
