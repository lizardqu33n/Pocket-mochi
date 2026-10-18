# Native theme mapping — discovery before implementation

Read-only inspection: Lumiverse 1.2.5, b1a68d9e32e2a2480a0d5ae71422566845f2657b.

| Native role | Verified token / rule | Mochi alias to use |
|---|---|---|
| Drawer backdrop | ViewportDrawer.module.css `.drawer`: `--lumiverse-bg-deep` | `--mochi-drawer-bg` |
| Native drawer/settings navigation rail | ViewportDrawer / SettingsModal `.sidebar`: `color-mix(in srgb, var(--lumiverse-primary) 6%, var(--lumiverse-bg-deep))` | Host-owned rail remains unchanged |
| Mochi conversation sidebar / native input surface | `--lumiverse-bg`; native PersonaEditor `.nameInput`, `.descTextarea` | `--mochi-sidebar-bg`, `--mochi-input-bg` |
| Elevated content | `--lumiverse-bg-elevated` / `--lumiverse-surface-raised` | `--mochi-elevated-bg` |
| Restrained section fill | `--lumiverse-fill-subtle`; native PersonaEditor `.editor` | `--mochi-section-bg` |
| Primary action | FormComponents `.btnPrimary`: `--lumiverse-primary`, `--lumiverse-primary-contrast` | `--mochi-accent`, `--mochi-on-accent` |
| Primary hover | `--lumiverse-primary-hover` | `--mochi-accent-hover` |
| Secondary control | FormComponents `.btn`: transparent, `--lumiverse-border`, `--lumiverse-text-muted` | `--mochi-control-bg`, `--mochi-muted` |
| Hover | `--lumiverse-fill-hover` / `--lumiverse-bg-hover` | `--mochi-hover-bg` |
| Selection | PersonaToolbar `.tabBtnActive`: `--lumiverse-primary-015`; `.iconBtnActive`: `--lumiverse-primary-010`, primary border | `--mochi-selected-bg`, `--mochi-account-accent` |
| Borders/dividers | `--lumiverse-border`, hover `--lumiverse-border-hover` | `--mochi-border`, `--mochi-border-hover` |
| Text / supporting text | `--lumiverse-text`, `--lumiverse-text-muted` | `--mochi-text`, `--mochi-muted` |
| Focus | FormComponents `.input:focus`: primary-muted border and primary-010 ring; PersonaEditor uses primary border | `--mochi-focus`, `--mochi-focus-bg` |
| Disabled | FormComponents `.btn:disabled`: opacity .4 / not-allowed | local disabled state |
| Warning/destructive | `--lumiverse-danger`, `--lumiverse-danger-hover`, `--lumiverse-danger-015` | `--mochi-danger`, `--mochi-danger-hover`, `--mochi-danger-bg` |

Other inspected sources: PersonaToolbar/CardList/CardGrid, PersonaAddonsModal, theme/engine.ts,
theme/variables.css and theme/presets.ts. The engine exports these native tokens and mode-aware
base-color overrides. No private host data or installed extension was opened or modified.

The original mapping incorrectly lets Pocket's elevated `--lp-bg` paint the entire outer
Mochi editor, and blends an accent with a fixed lilac. Native host tokens must take precedence;
Pocket aliases remain fallbacks for standalone compatibility. Scope the correction to Mochi;
do not restyle native Pocket or introduce a theme engine.

## Contrast findings during visual verification

The native default dark purple `primary` / `primary-contrast` pair measured
3.64:1 in the rendered fixture; the native muted text role on the light drawer
measured 4.28:1. Mochi retains the actual host accent/input/drawer roles and
corrects its on-accent foreground with progressive CSS `contrast-color()` plus
a tested opposite-surface fallback. Its supporting text mixes 15% native normal
text into native muted text. Final measured values are in the report's JSON.

No host theme token is invented. The additional names are scoped Mochi aliases.
The comparison fixture namespaces unchanged installed Personas/Form/Add-On CSS;
it does not claim to mount the complete native React panel or the live host.

The native outer navigation rail has its own 6% accent/deep-surface mix. Mochi does not restyle that host-owned rail. Its conversation-list column uses the native main/secondary background role; its account editor uses the actual deep drawer backdrop.

## Part 2B refinement (supersedes the accent rows above)

Structural backgrounds, elevation, inputs, text, borders and native warning,
success and danger roles remain inherited from Lumiverse. Mochi now has a
separate editable brand accent, defined by scoped HSL tokens (263 / 55% / 60%).
`--mochi-accent` points to `--mochi-brand-accent`; it no longer adopts a custom
host's primary color. Selected accounts/conversations, checked actions, focused
controls and primary actions use this accent. Native host controls are unchanged.
Selected category navigation also uses a checkmark and thicker leading border.

Essential settings input boundaries use `--mochi-input-border`, blending 55%
native text into the inherited input surface. Fields, navigation, elevated
previews and action footers use different surface/radius roles. Brand foreground
uses CSS contrast-color when supported, with black as the default-accent fallback.
Custom accent authors should supply a matching brand-contrast fallback as needed.

Shared saved text scales write only backing variables. Public interface/message
scale aliases and other CSS variables remain overridable with scoped, doubled
class selectors. See the UI README for the full precedence and examples.
The four tested palettes include a synthetic muted-brown approximation based on
the owner's screenshot; it is not the owner's saved theme configuration.
