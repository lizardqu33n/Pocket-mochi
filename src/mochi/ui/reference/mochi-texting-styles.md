# mochi-texting-styles

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-view .mochi-texting-controls` | `min-width` → selector only = `0`<br>`display` → selector only = `grid`<br>`gap` → `--mochi-space-sm` = `var(--mochi-space-sm)`<br>`border` → `--mochi-v2-texting-controls-border` = `1px solid var(--mochi-border)`<br>`border-radius` → `--mochi-v2-texting-controls-border-radius` = `10px`<br>`padding` → `--mochi-v2-texting-controls-padding` = `10px` | src/mochi/ui/mochi.css:2168 |
| `.mochi-view .mochi-texting-controls label` | `min-width` → selector only = `0`<br>`display` → selector only = `grid`<br>`gap` → `--mochi-space-xs` = `var(--mochi-space-xs)`<br>`overflow-wrap` → `--mochi-v2-texting-controls-label-overflow-wrap` = `anywhere` | src/mochi/ui/mochi.css:2176 |
| `.mochi-view .mochi-texting-controls select,.mochi-view .mochi-texting-controls textarea` | `box-sizing` → selector only = `border-box`<br>`min-width` → selector only = `0`<br>`width` → selector only = `100%`<br>`max-width` → selector only = `100%` | src/mochi/ui/mochi.css:2182 |
| `.mochi-view .mochi-texting-controls :focus-visible` | `outline` → `--mochi-v2-texting-controls-focus-visible-outline` = `2px solid var(--mochi-accent)`<br>`outline-offset` → `--mochi-v2-texting-controls-focus-visible-outline-offset` = `2px` | src/mochi/ui/mochi.css:2188 |
