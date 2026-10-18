# preset-workspace-final

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-view .mochi-preset-editor .mochi-block-detail label` | `border` → selector only = `0`<br>`padding` → selector only = `0` | src/mochi/ui/mochi.css:2818 |
| `.mochi-view .mochi-block-switches` | `display` → selector only = `flex`<br>`gap` → `--mochi-space-xl` = `var(--mochi-space-xl)`<br>`flex-wrap` → `--mochi-v2-block-switches-flex-wrap` = `wrap` | src/mochi/ui/mochi.css:2822 |
| `.mochi-view .mochi-preset-editor .mochi-block-switches label` | `flex-direction` → `--mochi-v2-preset-editor-block-switches-label-flex-direction` = `row`<br>`min-height` → `--mochi-v2-preset-editor-block-switches-label-min-height` = `32px`<br>`justify-content` → `--mochi-v2-preset-editor-block-switches-label-justify-content` = `flex-start`<br>`gap` → `--mochi-v2-preset-editor-block-switches-label-gap` = `10px` | src/mochi/ui/mochi.css:2827 |
| `.mochi-view .mochi-preset-editor .mochi-block-switches input` | `margin` → selector only = `0` | src/mochi/ui/mochi.css:2833 |
| `.mochi-view .mochi-block-detail>h4` | `margin` → selector only = `0` | src/mochi/ui/mochi.css:2836 |
| `.mochi-view .mochi-block-detail` | `gap` → `--mochi-v2-block-detail-gap` = `10px` | src/mochi/ui/mochi.css:2839 |
| `.mochi-view .mochi-preset-navigation` | `display` → selector only = `flex`<br>`flex-wrap` → `--mochi-v2-preset-navigation-flex-wrap` = `wrap`<br>`gap` → `--mochi-v2-preset-navigation-gap` = `8px 24px`<br>`border-bottom` → `--mochi-v2-preset-navigation-border-bottom` = `1px solid var(--mochi-border)`<br>`margin-bottom` → `--mochi-v2-preset-navigation-margin-bottom` = `12px` | src/mochi/ui/mochi.css:2842 |
| `.mochi-view .mochi-preset-navigation>details` | `flex` → `--mochi-v2-preset-navigation-details-flex` = `1 1 220px`<br>`border` → selector only = `0`<br>`margin` → selector only = `0`<br>`padding` → selector only = `0` | src/mochi/ui/mochi.css:2849 |
| `.mochi-view .mochi-preset-navigation>details[open]` | `flex-basis` → selector only = `100%` | src/mochi/ui/mochi.css:2855 |
| `.mochi-view .mochi-preset-navigation>details>summary` | `min-height` → `--mochi-v2-preset-navigation-details-summary-min-height` = `40px`<br>`padding` → selector only = `0`<br>`line-height` → `--mochi-v2-preset-navigation-details-summary-line-height` = `40px` | src/mochi/ui/mochi.css:2858 |
| `.mochi-view .mochi-preset-panel` | `padding-top` → `--mochi-v2-preset-panel-padding-top` = `16px` | src/mochi/ui/mochi.css:2863 |
| `.mochi-view .mochi-preset-editor label:has(input[readonly])` | `display` → selector only = `none` | src/mochi/ui/mochi.css:2866 |
