# window-focus

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-window-bar:focus-visible` | `outline` → `--mochi-v2-window-bar-focus-visible-outline` = `2px solid var(--lumiverse-primary,#9399ab)`<br>`outline-offset` → `--mochi-v2-window-bar-focus-visible-outline-offset` = `-2px` | src/mochi/ui/mochi.css:4741 |
| `.mochi-window [hidden]` | `display` → selector only = `none` !important | src/mochi/ui/mochi.css:4745 |
