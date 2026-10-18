# workspace

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-workspace` | `display` → selector only = `flex`<br>`flex-direction` → `--mochi-v2-workspace-flex-direction` = `column`<br>`width` → selector only = `100%`<br>`height` → selector only = `100%`<br>`min-width` → selector only = `0`<br>`min-height` → selector only = `0`<br>`overflow` → selector only = `hidden`<br>`box-sizing` → selector only = `border-box` | src/mochi/ui/mochi.css:4750 |
| `.mochi-workspace[hidden]` | `display` → selector only = `none` !important | src/mochi/ui/mochi.css:4760 |
| `.mochi-workspace>.mochi-view` | `min-height` → selector only = `0` | src/mochi/ui/mochi.css:4763 |
