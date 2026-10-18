# launcher

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-launcher-root` | `width` → `--mochi-launcher-frame-size` = `var(--mochi-launcher-frame-size)`<br>`height` → `--mochi-launcher-frame-size` = `var(--mochi-launcher-frame-size)`<br>`display` → selector only = `grid`<br>`place-items` → `--mochi-v2-launcher-root-place-items` = `center` | src/mochi/ui/mochi.css:4638 |
| `.mochi-launcher` | `width` → `--mochi-launcher-size` = `var(--mochi-launcher-size)`<br>`height` → `--mochi-launcher-size` = `var(--mochi-launcher-size)`<br>`padding` → `--mochi-launcher-padding` = `var(--mochi-launcher-padding)`<br>`background` → `--mochi-chrome-bg` = `var(--mochi-chrome-bg)`<br>`color` → `--mochi-v2-launcher-color` = `var(--lumiverse-primary,#a6a0d9)`<br>`border` → `--mochi-v2-launcher-border` = `1px solid var(--mochi-chrome-border)`<br>`border-radius` → `--mochi-launcher-radius` = `var(--mochi-launcher-radius)`<br>`cursor` → `--mochi-v2-launcher-cursor` = `pointer` | src/mochi/ui/mochi.css:4644 |
| `.mochi-launcher svg` | `width` → selector only = `100%`<br>`height` → selector only = `100%`<br>`display` → selector only = `block` | src/mochi/ui/mochi.css:4654 |
| `.mochi-launcher:focus-visible` | `outline` → `--mochi-v2-launcher-focus-visible-outline` = `2px solid currentColor`<br>`outline-offset` → `--mochi-v2-launcher-focus-visible-outline-offset` = `2px` | src/mochi/ui/mochi.css:4659 |
