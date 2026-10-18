# notifications

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-notification-toast.mochi-notification-toast` | `max-width` → `--mochi-v2-notification-toastnotification-toast-max-width` = `calc(100% - 24px)`<br>`grid-template-columns` → `--mochi-v2-notification-toastnotification-toast-grid-template-columns` = `32px minmax(0,1fr)` | src/mochi/ui/mochi.css:4769 |
| `.mochi-notification-toast .mochi-notification-avatar` | `width` → `--mochi-v2-notification-toast-notification-avatar-width` = `32px`<br>`height` → `--mochi-v2-notification-toast-notification-avatar-height` = `32px`<br>`border-radius` → `--mochi-v2-notification-toast-notification-avatar-border-radius` = `50%`<br>`overflow` → selector only = `hidden`<br>`flex` → `--mochi-v2-notification-toast-notification-avatar-flex` = `none`<br>`display` → selector only = `grid`<br>`place-items` → `--mochi-v2-notification-toast-notification-avatar-place-items` = `center`<br>`background` → `--mochi-v2-notification-toast-notification-avatar-background` = `var(--lp-surface-2)` | src/mochi/ui/mochi.css:4773 |
| `.mochi-notification-toast .mochi-notification-avatar img` | `width` → selector only = `100%`<br>`height` → selector only = `100%`<br>`object-fit` → `--mochi-v2-notification-toast-notification-avatar-img-object-fit` = `cover` | src/mochi/ui/mochi.css:4783 |
| `.mochi-notification-toast>.lp-grow` | `min-width` → selector only = `0` | src/mochi/ui/mochi.css:4788 |
| `.mochi-notification-toast>.lp-grow>strong` | `overflow-wrap` → `--mochi-v2-notification-toast-grow-strong-overflow-wrap` = `anywhere` | src/mochi/ui/mochi.css:4789 |
