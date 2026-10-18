# mochi-preset-chrome-styles

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-view .mochi-preset-heading` | `display` → selector only = `flex`<br>`align-items` → `--mochi-v2-preset-heading-align-items` = `center`<br>`gap` → `--mochi-space-md` = `var(--mochi-space-md)`<br>`flex-wrap` → `--mochi-v2-preset-heading-flex-wrap` = `wrap`<br>`margin-bottom` → `--mochi-v2-preset-heading-margin-bottom` = `8px` | src/mochi/ui/mochi.css:2773 |
| `.mochi-view .mochi-preset-heading h3` | `flex` → `--mochi-v2-preset-heading-h3-flex` = `1`<br>`margin` → selector only = `0`<br>`font-size` → `--mochi-v2-preset-heading-h3-font-size` = `calc(18px * var(--mochi-interface-scale,1))` | src/mochi/ui/mochi.css:2780 |
| `.mochi-view .mochi-preset-heading button` | `font-size` → `--mochi-v2-preset-heading-button-font-size` = `calc(12px * var(--mochi-interface-scale,1))` | src/mochi/ui/mochi.css:2785 |
| `.mochi-view .mochi-preset-panel>.mochi-preset-heading+p` | `margin` → `--mochi-v2-preset-panel-preset-heading-p-margin` = `0 0 8px` | src/mochi/ui/mochi.css:2788 |
| `.mochi-view .mochi-preset-panel>.mochi-preset-workspace` | `margin-top` → `--mochi-v2-preset-panel-preset-workspace-margin-top` = `4px` | src/mochi/ui/mochi.css:2791 |
| `.mochi-view .mochi-preset-panel>.mochi-preset-workspace>.mochi-preset-library` | `margin-bottom` → `--mochi-v2-preset-panel-preset-workspace-preset-library-margin-bottom` = `10px`<br>`padding-bottom` → selector only = `0` | src/mochi/ui/mochi.css:2794 |
| `.mochi-view .mochi-preset-panel[data-block-editing=true]>.mochi-preset-heading` | `justify-content` → `--mochi-v2-preset-panel-data-block-editing-true-preset-heading-justify-content` = `flex-end` | src/mochi/ui/mochi.css:2798 |
| `.mochi-view .mochi-preset-panel[data-block-editing=true]>.mochi-preset-heading>h3` | `display` → selector only = `none` | src/mochi/ui/mochi.css:2801 |
| `.mochi-view .mochi-preset-panel[data-block-editing=true]>.mochi-preset-heading+p` | `display` → selector only = `none` | src/mochi/ui/mochi.css:2804 |
| `.mochi-view .mochi-preset-panel[data-block-editing=true] .mochi-block-detail>h4` | `font-size` → `--mochi-v2-preset-panel-data-block-editing-true-block-detail-h4-font-size` = `calc(20px * var(--mochi-interface-scale,1))` | src/mochi/ui/mochi.css:2807 |
| `.mochi-view .mochi-preset-panel[data-block-editing=true] .mochi-block-detail>p` | `margin` → selector only = `0` | src/mochi/ui/mochi.css:2810 |
| `.mochi-view .mochi-preset-panel[data-block-editing=true] .mochi-block-detail>label:has(input[type=checkbox])` | `display` → selector only = `inline-flex` | src/mochi/ui/mochi.css:2813 |
