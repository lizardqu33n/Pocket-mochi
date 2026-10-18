# mochi-reply-styles

[All surfaces](../UI-CUSTOMIZATION-MAP.md) · [Theme contract](../THEME-CONTRACT.md)

Rules appear in cascade order. Conditions are part of the control. Scope shared selectors to a Mochi root.

| Selector / condition | CSS controls and original fallback values | Source |
|---|---|---|
| `.mochi-view .mochi-quote` | `display` → selector only = `flex`<br>`flex-direction` → `--mochi-v2-quote-flex-direction` = `column`<br>`gap` → `--mochi-v2-quote-gap` = `3px`<br>`min-width` → selector only = `0`<br>`max-width` → selector only = `100%`<br>`text-align` → `--mochi-v2-quote-text-align` = `left`<br>`font` → selector only = `inherit`<br>`color` → selector only = `inherit`<br>`padding` → `--mochi-v2-quote-padding` = `7px 10px`<br>`border` → selector only = `0`<br>`border-left` → `--mochi-v2-quote-border-left` = `3px solid var(--mochi-accent)`<br>`border-radius` → `--mochi-v2-quote-border-radius` = `6px`<br>`background` → `--mochi-v2-quote-background` = `var(--lp-surface-2,#ffffff0c)`<br>`overflow` → selector only = `hidden` | src/mochi/ui/mochi.css:1914 |
| `.mochi-quote strong` | `font-size` → `--mochi-v2-quote-strong-font-size` = `calc(11px * var(--mochi-interface-scale,1))`<br>`overflow-wrap` → `--mochi-v2-quote-strong-overflow-wrap` = `anywhere` | src/mochi/ui/mochi.css:1930 |
| `.mochi-quote span` | `font-size` → `--mochi-v2-quote-span-font-size` = `calc(12px * var(--mochi-interface-scale,1))`<br>`white-space` → `--mochi-v2-quote-span-white-space` = `normal`<br>`overflow-wrap` → `--mochi-v2-quote-span-overflow-wrap` = `anywhere`<br>`display` → selector only = `-webkit-box`<br>`-webkit-line-clamp` → `--mochi-v2-quote-span--webkit-line-clamp` = `2`<br>`-webkit-box-orient` → `--mochi-v2-quote-span--webkit-box-orient` = `vertical`<br>`overflow` → selector only = `hidden` | src/mochi/ui/mochi.css:1934 |
| `.mochi-view button.mochi-quote` | `cursor` → `--mochi-v2-buttonquote-cursor` = `pointer`<br>`min-height` → `--mochi-v2-buttonquote-min-height` = `44px` | src/mochi/ui/mochi.css:1943 |
| `.mochi-view button.mochi-quote:focus-visible,.mochi-message:focus-visible` | `outline` → `--mochi-v2-buttonquote-focus-visible-outline` = `2px solid var(--mochi-accent)`<br>`outline-offset` → `--mochi-v2-buttonquote-focus-visible-outline-offset` = `2px` | src/mochi/ui/mochi.css:1947 |
| `.mochi-view .mochi-reply-preview` | `display` → selector only = `flex`<br>`align-items` → `--mochi-v2-reply-preview-align-items` = `center`<br>`gap` → `--mochi-v2-reply-preview-gap` = `6px`<br>`min-width` → selector only = `0` | src/mochi/ui/mochi.css:1951 |
| `.mochi-reply-preview>.mochi-quote` | `flex` → `--mochi-v2-reply-preview-quote-flex` = `1` | src/mochi/ui/mochi.css:1957 |
| `.mochi-reply-preview>button` | `flex` → `--mochi-v2-reply-preview-button-flex` = `none` | src/mochi/ui/mochi.css:1960 |
