# mochi-preview-styles

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-view .mochi-preview-panel` | `min-width` → selector only = `0`<br>`min-height` → selector only = `0`<br>`max-height` → `--mochi-v2-preview-panel-max-height` = `40%`<br>`overflow` → selector only = `auto`<br>`flex` → `--mochi-v2-preview-panel-flex` = `0 1 auto`<br>`padding` → `--mochi-v2-preview-panel-padding` = `10px`<br>`border-bottom` → `--mochi-v2-preview-panel-border-bottom` = `1px solid var(--mochi-border)`<br>`overflow-wrap` → `--mochi-v2-preview-panel-overflow-wrap` = `anywhere` | src/mochi/ui/mochi.css:2194 |
| `.mochi-view .mochi-preview-controls` | `display` → selector only = `flex`<br>`flex-wrap` → `--mochi-v2-preview-controls-flex-wrap` = `wrap`<br>`gap` → `--mochi-v2-preview-controls-gap` = `6px`<br>`min-width` → selector only = `0` | src/mochi/ui/mochi.css:2204 |
| `.mochi-view .mochi-preview-controls select` | `max-width` → selector only = `100%`<br>`min-width` → selector only = `0`<br>`background` → `--mochi-v2-preview-controls-select-background` = `var(--lp-surface-2,#ffffff0c)`<br>`color` → selector only = `inherit`<br>`border` → `--mochi-v2-preview-controls-select-border` = `1px solid var(--mochi-border)`<br>`padding` → `--mochi-v2-preview-controls-select-padding` = `8px`<br>`border-radius` → `--mochi-v2-preview-controls-select-border-radius` = `8px` | src/mochi/ui/mochi.css:2210 |
| `.mochi-view .mochi-preview-panel button` | `min-height` → `--mochi-v2-preview-panel-button-min-height` = `40px` | src/mochi/ui/mochi.css:2219 |
| `.mochi-view .mochi-preview-text` | `white-space` → `--mochi-v2-preview-text-white-space` = `pre-wrap`<br>`overflow-wrap` → `--mochi-v2-preview-text-overflow-wrap` = `anywhere`<br>`font` → selector only = `inherit`<br>`max-width` → selector only = `100%` | src/mochi/ui/mochi.css:2222 |
| `.mochi-view .mochi-preview-panel :focus-visible` | `outline` → `--mochi-v2-preview-panel-focus-visible-outline` = `2px solid var(--mochi-accent)`<br>`outline-offset` → `--mochi-v2-preview-panel-focus-visible-outline-offset` = `2px` | src/mochi/ui/mochi.css:2228 |
