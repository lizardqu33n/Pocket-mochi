# Mochi CSS contract v1 — phase 1

This is the foundation of the whole-interface skinning project. It does **not**
claim every visual value has been tokenized. Account authorization, saved account
selection, revision checks, generation, persistence and required controls remain
TypeScript responsibilities. CSS changes appearance; it does not grant access.

## Plan and delivered boundary

1. **Delivered here:** inspect test-mochi HEAD and delivery; independent bundled
   theme entry point; low-specificity public defaults; 52 Accounts/chrome tokens;
   named shared SVG hooks; complete current token starter; source inventory;
   isolated four-color, mobile and CSS zoom regression checks.
2. **Pending:** migrate the remaining presentational values in all 24 sections,
   including chat/personal settings, accessibility controls, messenger, profiles,
   toolbar/menu states, presets, prompt/block editor, dialogs and notifications.
   Consolidate duplicated rules only with before/after visual evidence. Introduce
   semantic component slots for currently anonymous descendants. Tokenize mobile
   overrides as independent defaults without reducing required hit targets.
3. **Pending:** standardize all icons; locally bundle actual upstream Lucide SVGs
   and the matching upstream license/attribution if selected. Add optional custom
   SVG/image slots with load-error fallback, no script execution, accessible
   button names and unchanged hit targets. Finish browser zoom, contrast,
   keyboard/assistive-technology and whole-interface acceptance coverage.

Each phase can ship independently on test-mochi. No beta promotion or hosted
update is implied.

## Theme files and compiled delivery

Edit **mochi-theme.css** to author a theme independently of application logic.
Copy **starter-theme.css** into that file for a complete template of currently
exposed tokens, or start with a few overrides. The starter deliberately preserves
current host-derived values. It is not an exhaustive inventory of hardcoded CSS.

`styles.ts` embeds token defaults, the requested marked component section, then
the theme text. Independent surfaces receive defaults too. All are local text
inside **dist/frontend.js**, with no extra CSS file to install or runtime fetch.
Rebuild the frontend and commit the matched bundle. The manifest uses that bundle.
Changing the source file alone cannot update an installed extension.

The same theme text is delivered at existing style boundaries; use normal scoped
rules, not `@import`, global rules, registrations or side effects. Keep all 24
`@mochi-section` markers. Colors continue to inherit `--lumiverse-*` / `--lp-*`
unless the theme explicitly overrides a Mochi token. Phase 1 keeps original
default values; it does not redesign the theme.

## Scope and precedence

Token defaults use `:where(...)` (zero specificity). A normal `.mochi-sidebar`
rule in the theme or Lumiverse global Custom CSS can override the same token,
even when a new component's defaults are inserted later. The starter targets
**every root**, since nested views have their own defaults. A variable placed
only on an outer window can be shadowed by the nested view's default.

The starter also uses zero-specificity selectors, letting ordinary host Custom
CSS selectors override its tokens. Keep that convention when adding token blocks.
For tokens: default < a matching scoped theme declaration < a more specific
matching Custom CSS declaration. For component declarations, normal CSS cascade,
specificity, scope proximity and source order apply. The bundled theme does not
make all later CSS automatically win. Saved font-scale settings write private
`--mochi-saved-*` backing values; public scale aliases remain themeable. Avoid
`!important` for normal theming.

**Lumiverse global Custom CSS** and **Pocket device/persona Custom CSS** are
different editors. The latter is wrapped by `controller.ts` in
`@scope ([data-pocket-surface="…"])`; persona CSS follows device CSS only for
the active persona-owned phone. It cannot reach sibling Mochi float windows,
outer Accounts or fullscreen surfaces. This phase preserves that isolation.
The earlier README's blanket statement that any Custom CSS editor can style all
Mochi surfaces was inaccurate. Use the bundled theme for reliable complete
Mochi delivery; host global Custom CSS depends on the host's own cascade.

## Stable public selectors in v1

Keep these names stable in future phases. Additional selectors appear in the
generated inventory but are migration candidates until documented here.

| Surface / semantic slot | Selector | Relevant tokens / states |
|---|---|---|
| Accounts root, navigation, scroll picker | `.mochi-sidebar`, `.mochi-sidebar-nav`, `.mochi-sidebar-picker` | `--mochi-drawer-bg`, `--mochi-accounts-nav-*`, `--mochi-accounts-picker-padding` |
| Account search/sort/tools | `.mochi-account-tools`, `.mochi-account-icon` | `--mochi-accounts-tools-*`, `--mochi-accounts-icon-*`; `:disabled`, `:focus-visible`, `[aria-pressed=true]` |
| Account list / grid | `.mochi-account-list`, `.mochi-account-row`, `.mochi-sidebar-account` | `[data-layout=list/grid]`, `[aria-pressed=true]`; `--mochi-accounts-row-*`, `--mochi-accounts-grid-*` |
| Account portrait / label | `.mochi-sidebar-avatar`, `.mochi-sidebar-label` | `--mochi-accounts-avatar-size`, `--mochi-accounts-avatar-radius` |
| Account editor / fields | `.mochi-sidebar .mochi-profile-screen` | `--mochi-editor-*`, `--mochi-accounts-field-padding`, `--mochi-input-bg`, `--mochi-input-border` |
| Account preview / persona choices | `.mochi-profile-preview`, `.mochi-profile-preview-body`, `.mochi-persona-choices`, `.mochi-persona-choice` | `--mochi-accounts-preview-*`, `--mochi-accounts-persona-*` |
| Add-ons / source details | `.mochi-addon-row`, `.mochi-addon-content`, `.mochi-source-details` | `[data-selected=true]`; `--mochi-section-bg`, `--mochi-accounts-content-max-height` |
| Float chrome / bar / controls | `.mochi-window`, `.mochi-window-bar`, `.mochi-window-close`, `.mochi-window-resize` | `--mochi-chrome-*`, `--mochi-window-*` |
| Fullscreen / launcher | `.mochi-mobile-surface`, `.mochi-launcher-root`, `.mochi-launcher` | `--mochi-mobile-font`, `--mochi-launcher-*`, `--mochi-chrome-*` |
| Messenger layout / conversation list | `.mochi-desktop`, `.mochi-desktop-list`, `.mochi-desktop-room` | existing `--mochi-sidebar-*`; `[data-mode]`, `[data-details]` |
| Messenger header / composer / bubbles | `.mochi-room-header`, `.mochi-header-controls`, `.mochi-composer`, `.mochi-composer-row`, `.mochi-message`, `.mochi-bubble` | existing font, avatar, bubble and spacing tokens; `[data-grouped=true]`, `[data-selected=true]` |
| Profile / settings / toolbar | `.mochi-profile-panel`, `.mochi-settings-workspace`, `.mochi-bottom-toolbar` | existing panel, radius, control tokens; see inventory for remaining literals |
| Dialog / workspace / notification | `.mochi-sheet`, `.mochi-workspace`, `.mochi-notification-toast` | scoped token roots; component-specific migration pending |
| Shared icon artwork | `svg[data-mochi-icon="settings"]` etc. | `--mochi-icon-stroke-width`; default artwork remains bundled |
| Action glyph wrapper | `.mochi-icon-slot[data-mochi-icon-slot="search"]` etc. | decorative only; accessible name remains on button |

`--mochi-accounts-font-10/11/12/13/15/16/18` are compact typography roles named
after their default base size. `--mochi-interface-scale` scales their defaults.
`--mochi-accounts-avatar-flex` controls the outer account avatar flex basis;
change it with avatar-size to avoid flex shrinking. Grid/preview columns and
portrait sizes are separate controls. Responsive mobile control sizes still
override some desktop values and are explicitly pending migration.

## Practical external-editor examples

Paste these rules into mochi-theme.css, then rebuild; no behavioral source edits:

```css
/* All root aliases, including nested dialogs/views. */
:where(.mochi-view,.mochi-sheet,.mochi-sidebar,.mochi-workspace,
    .mochi-window,.mochi-mobile-surface,.mochi-launcher-root,
    .mochi-notification-toast) {
  --mochi-brand-hue: 285;
  --mochi-bubble-radius: 16px;
  --mochi-accounts-row-radius: 12px;
  --mochi-accounts-row-padding: 10px;
  --mochi-window-radius: 18px;
  --mochi-icon-stroke-width: 2;
}
/* Account-only density; native Pocket controls retain their defaults. */
.mochi-sidebar, .mochi-sidebar .mochi-view {
  --mochi-accounts-list-gap: 6px;
  --mochi-accounts-field-padding: 9px 12px;
  --mochi-accounts-preview-avatar-size: 48px;
  --mochi-accounts-preview-columns: 48px minmax(0,1fr);
}
/* Existing SVGs can be styled without altering their parent buttons. */
.mochi-sidebar svg[data-mochi-icon="settings"] { stroke: var(--mochi-accent); }
```

Icon hooks in this phase cover shared `MOCHI_TOOLBAR_ICONS` artwork and action
wrappers. Other Pocket icons, text glyphs, mascot and group art are still in the
inventory. Current artwork is locally authored outline art, **not an assertion
that it is upstream Lucide**. Do not relabel it or attach a guessed license.
Arbitrary image/SVG replacement and load-error fallback are pending. No custom
asset from the owner is required for the current default renderer.

## Structural and accessibility boundaries

Preserve native buttons, labels, inputs, details/summary, dialog semantics,
hidden/disabled states, keyboard routing, focus indicators, required actions,
mobile safe-area insets and host-controlled window geometry. CSS must not expose
`[hidden]` content, fake enabled actions, obscure destructive-action confirmation
or replace account identity labels with misleading content. Existing hidden
guards remain `!important`. Hit targets and required control presence remain
application responsibilities; theme authors should enlarge visual glyphs inside
the existing controls rather than shrink the controls.

Arbitrary trusted CSS can hide or misrepresent UI; CSS is not a security sandbox.
Account/data ownership and data-action checks remain enforced in application
logic. Theme editing does not read personal data or change saved accounts.
Runtime-measured composer growth, action-strip collision adjustment, popup
viewport fitting, host resize/drag geometry and saved scale backing values stay
in JS. Their visual limits/offsets are future token candidates; do not replace
measurements with guessed CSS coordinates.

## Inventory, tests and owner acceptance

Run `bun scripts/audit-mochi-theme.ts` to refresh THEME-INVENTORY.md. This records
all sections, presentational literal counts, class candidates, `!important`
usage and inline geometry locations. Counts are a migration aid, not a promise
that every literal belongs in a token. Zeros, flex/grid topology, visibility and
geometry constraints often remain structural.

Run `node scripts/check-mochi-theme-contract-ui.mjs` with the same Playwright,
browser and Bun variables documented in README. `MOCHI_THEME_OUTPUT` selects the
evidence folder; `MOCHI_THEME_BASELINE` compares unchanged scenes byte-for-byte.
`MOCHI_THEME_SOURCE` can point at an original source snapshot and
`MOCHI_THEME_ORIGINAL=1` captures pre-contract scenes. Synthetic palettes cover
dark/light/brown/purple at 1280/390/320px, Accounts list/grid/editor and messenger.
The after run also checks scoped token overrides, editable composer, unchanged
stored identities, required Save button, SVG stroke override, an unrelated
control, and CSS zoom at 200%. HTTP requests are blocked; provider calls must be
zero. Palette fixtures are approximations, not a live Lumiverse theme-engine run.

Owner acceptance remains: complete UI coverage after phase 2; actual host global
Custom CSS precedence; real browser zoom/OS scaling and screen readers; contrast
ratios in all states; custom-asset success/failure; theme-only loading/switching
expectations. No theme picker/importer is introduced here. Archived accounts,
errors, loading, empty and destructive states need visual matrix expansion.
