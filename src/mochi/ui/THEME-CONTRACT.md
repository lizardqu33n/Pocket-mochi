# Mochi whole-interface CSS contract v2

CSS-01 Phase 3 adds [named icon slots and optional safe local image replacements](ICON-THEMING.md).
The existing icon selectors/artwork-key hooks remain compatible; semantic action
slots and their size/color/stroke/image tokens are listed in [reference/icons.md](reference/icons.md).
The icon layer preserves native control semantics, existing hit targets and theme
inheritance. Text-only controls can opt in to icons. Internal SVG/image fill and
hidden state are structural; use slot size tokens for replacement-aware sizing.

Start with [UI-CUSTOMIZATION-MAP.md](UI-CUSTOMIZATION-MAP.md). It links a complete
reference for all 24 Mochi CSS sections and shared Pocket primitives: outer
Accounts/navigation/editor, Settings and Personal categories, accessibility,
messenger list/header/messages/composer/actions, character profiles/editors,
presets and prompt/block editing, dialogs, dropdowns, notification lists/toasts,
mobile layouts, focus/hover/selected/disabled/error/loading/empty states and
reduced motion. Every rule includes its exact selector, conditions, properties,
tokens, original fallback values, importance and source location.

No component section remains deferred from the CSS customization map. This is
an appearance contract, not a theme picker, permissions system or behavior
rewrite. The owner's existing default appearance and behavioral JS remain the
baseline. Phase 1's results are historical; see PHASE2-RESULTS.md for this work.

## Edit a theme independently

1. Copy `starter-theme.css` into **mochi-theme.css**, or begin with a few rules.
2. Use a common `--mochi-*` semantic token first. For a precise component/state
   adjustment, copy the `--mochi-v2-*` token from its reference table. A token's
   fallback lives at the original declaration, so default cascade, host colors,
   saved scale aliases and responsive/state differences stay intact.
3. Place component overrides on that component or a matching Mochi root. For
   shared Pocket primitives, always scope your theme rule to `.mochi-sheet`,
   `.mochi-notification-toast`, `.mochi-view`, `.mochi-sidebar`, etc. The portal
   root is `.pocket-portal[data-destination=mochi]`; this excludes phone/home
   destinations.
4. Rebuild with `bun run build:frontend`. Commit CSS and its matched
   `dist/frontend.js` together. The build embeds local CSS text; no separate
   stylesheet installation, remote CSS fetch or host-source edit is needed.

Keep unedited component tokens **unset**. Their original fallback can differ
between base/desktop/mobile/state rules. The starter keeps common semantic
defaults active and provides opt-in examples; the complete component template
is the map's set of copyable token/value entries, not thousands of active
declarations that flatten those contextual differences.

## Precedence and compatibility

Common defaults use zero-specificity `:where(...)`. Component declarations use
`var(--mochi-v2-component-property, original value)` without redeclaring the
token on the element. Consequently a theme can set component tokens on an
ancestor without defaults on nested views shadowing them. The original common
semantic aliases still have defaults on each root: target all relevant roots
when changing a common alias across the entire interface. Private
`--mochi-saved-*` values back accessibility preferences; public aliases stay
themeable.

Theme text is appended at each existing component-style boundary. Normal CSS
specificity, scope proximity and source order apply. Use zero-specificity token
blocks when convenient so ordinary host Custom CSS selectors can override them.
Avoid blanket `!important`. Existing visibility and layout guards retain their
importance; reduced-motion rules are structural accessibility overrides.

Lumiverse global Custom CSS and Pocket device/persona Custom CSS are separate
editors. Pocket's editor is scoped to `[data-pocket-surface="…"]`; persona CSS
follows device CSS only on its own phone. It cannot style sibling float windows,
outer Accounts or the fullscreen messenger. That privacy/isolation behavior is
unchanged. Use the bundled theme for all Mochi surfaces; actual host global
Custom CSS still follows the host's own cascade.

All selectors in the map and consumed public tokens are compatibility hooks.
Future renames need an alias/deprecation path. Repeated tokens may intentionally
control several matching declarations; the map shows every use. Responsive
tokens include their condition in the name. Conditions themselves are ordinary
marked CSS `@container`, `@media` and `@supports` rules: CSS variables cannot
replace query thresholds. Change a query in the CSS file when needed.

## Layout controls and runtime geometry

Reference tables expose widths, max/min sizes, grid tracks/placement, flex
direction/order/basis, alignment, gaps, margins/padding, insets, transforms,
typography, border/radius/shadow, image fit/position, icon dimensions/strokes,
transitions, animation and state decoration. Existing common sidebar/profile
width and bubble/avatar controls remain supported. `selector only` entries
cover structural declarations and standard zero/fill/inherited resets; edit
their scoped selector only when the structural contract permits it.

Runtime adapters publish **measurements**, never hardcoded inline visual
properties that defeat themes:

| Surface | Public control | Private measurement / default |
|---|---|---|
| Composer | `--mochi-composer-height`; map's textarea max-height tokens | `--mochi-measured-composer-height`; automatic scroll-height measurement |
| Conversation menu | `--mochi-menu-max-height`, `--mochi-menu-viewport-gap` | measured available space; defaults 300px / 8px |
| Message action strip | `--mochi-action-right`, `--mochi-action-bottom`, `--mochi-action-gap`, `--mochi-action-edge-inset` | group-body offset and collision correction; gap 3px / inset 4px |
| Dialog in phone | `--mochi-dialog-left`, `--mochi-dialog-bottom`, `--mochi-dialog-width`, `--mochi-dialog-max-height` | owner-relative bounds, adjusted for host zoom |
| Dialog fitting | `--mochi-dialog-edge`, `--mochi-dialog-bottom-gap`, `--mochi-dialog-height-reserve`, `--mochi-dialog-min-height` | defaults 12px / 24px / 70px / 120px |
| Other dialogs | map's shared `.lp-sheet` width/height and panel controls | native dialog layout and local owner |

Algorithmic fitting margins are **nonnegative pixel lengths**; invalid values
fall back to the listed defaults. Ordinary layout tokens accept normal valid
CSS lengths/functions. The menu remains limited to available viewport space.
Do not set private `--mochi-measured-*` or `--pocket-measured-*` variables. Host
window drag/resize/fullscreen bounds, session ownership and root height fill
remain JS/host responsibilities. Timers, network cancellation and request state
are behavior and do not become CSS parameters.

## Copyable examples

```css
/* Common aliases across the roots, including nested dialogs/views. */
:where(.mochi-view,.mochi-sheet,.mochi-sidebar,.mochi-workspace,
       .mochi-window,.mochi-mobile-surface,.mochi-launcher-root,
       .mochi-notification-toast,.pocket-portal[data-destination=mochi]) {
  --mochi-brand-hue: 285;
  --mochi-sidebar-width: 360px;
  --mochi-profile-panel-width: 280px;
  --mochi-bubble-radius: 16px;
  --mochi-icon-stroke-width: 2;
}
/* Different desktop and mobile header padding, without changing behavior. */
.mochi-settings-workspace {
  --mochi-v2-settings-heading-padding: 20px 24px;
  --mochi-v2-settings-heading-container-max-width-650px-padding: 12px;
  --mochi-v2-settings-heading-container-max-width-550px-padding: 12px;
}
.mochi-sheet {
  --mochi-v2-shared-sheet-width: min(520px,calc(100vw - 24px));
  --mochi-v2-sheet-sheet-panel-background: var(--mochi-elevated-bg);
}
.mochi-notification-toast {
  --mochi-v2-shared-floating-notification-background: var(--mochi-elevated-bg);
}
.mochi-view {
  --mochi-menu-max-height: 240px;
  --mochi-action-gap: 6px;
}
/* State-specific examples: copy exact tokens from the relevant map. */
.mochi-view svg[data-mochi-icon="settings"] { stroke: var(--mochi-accent); }
```

Decorative glyph wrappers (`.mochi-icon-slot[data-mochi-icon-slot]`) and named
shared SVGs (`svg[data-mochi-icon]`) remain available. The map also includes SVG
descendant sizing/style selectors and existing image/mascot slots. Button names,
hit targets and artwork defaults remain unchanged. This pass does not introduce
an arbitrary asset loader or claim existing outline art is upstream Lucide.

## Required structure and data safety

Preserve semantic buttons/labels/inputs, dialog/details behavior, accessible
names, focus feedback, hidden/disabled state, required controls, mobile safe
areas, readable control sizes, reduced-motion overrides and scroll/containment
boundaries. Display/visibility/positioning mode, pointer/touch routing and core
containment deliberately remain structural selectors rather than generic knobs.
Do not unhide account content, fake enabled controls, obscure destructive-action
confirmations or substitute misleading account labels with CSS content.

Arbitrary trusted CSS can hide or misrepresent UI; it is not a security sandbox.
Account ownership, authenticated data actions, revisions, generation and stored
identities remain enforced in application logic. Theme editing does not change
those checks or touch installed/hosted data.

## Small sequential checks

Use explicit `./tests/file.test.ts` paths. Unqualified filters can also match
archived snapshots under `tmp/`. Run one small batch at a time; never run the
full current/base suites concurrently on a constrained machine.

`mochi-theme-contract.test.ts` checks exact original declaration fingerprints
for all six style sources, migration idempotence, map coverage and measured
geometry helpers. The browser checker accepts `MOCHI_THEME_EXTENDED=1`, one
`MOCHI_THEME_COLORS` palette and one `MOCHI_THEME_WIDTHS` value per invocation.
Use `MOCHI_THEME_SOURCE` plus `MOCHI_THEME_ORIGINAL=1` for the saved baseline,
then `MOCHI_THEME_BASELINE` for the matching current comparison. See the results
document for the completed matrix and environment paths described in README.

The matrix covers synthetic dark/light/brown/purple, desktop/390/320px, the
listed views/states, CSS zoom, scoped overrides and zero provider calls. It is
not a live host installation, a full automated accessibility certification, or
proof for every arbitrary user theme. Actual host theme/global CSS interaction,
OS/browser zoom and assistive technology remain normal owner acceptance checks.
