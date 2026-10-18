# Whole-interface CSS customization result

Base: `test-mochi` at `51840687185fca50a5685a1ffb7942b054bc58ef`.
Remote rechecked at the same hash after validation. No beta promotion, installed
host access, provider integration or personal-data access occurred.

## Delivered

- All 24 Mochi stylesheet sections and shared dialog, control, notification and
  portal primitives have public selector/property references. Settings, Personal
  categories/accessibility, Accounts, messenger, character profiles/editors,
  presets/block editing, prompt previews, dialogs/dropdowns, notifications,
  mobile and existing interaction-state rules are included.
- **1,137 public rule entries** and **2,439 distinct consumed token names** are
  mapped, including existing common aliases. New `--mochi-v2-*` overrides use
  each declaration's original value as its fallback. Contextual defaults and
  cascade order remain intact; no component section is deferred from the map.
- Layout controls cover safe sizes, spacing, grid/flex placement, alignment,
  insets and transforms, plus all visual decoration. Structural visibility,
  containment/input routing and host-owned geometry remain explicit boundaries.
- Composer growth, menu fitting, message-action collision placement and phone
  dialog fitting now provide private measurement variables. CSS controls the
  visible properties and public visual limits; inline properties no longer
  defeat those themes. Dialogs remain local to their owner with focus restoration.
- `mochi-theme.css` remains an independent, locally bundled theme entry point.
  The starter, v2 guide, per-surface references and machine-readable map support
  external editors without touching behavioral code.
- PostCSS 8.5.30 is a locked development dependency for accurate CSS parsing,
  mapping and migration checks. It is not added to the frontend runtime bundle.

## Validation in small sequential batches

**34 targeted tests passed**, in separate small invocations:

| Batch | Passed |
|---|---:|
| CSS delivery/defaults/notifications | 4 |
| Default declaration fingerprints, map/idempotence, measurement helpers | 3 |
| Mobile surface, header alignment, original wordmark | 9 |
| Staged Settings, persistence, accessibility and Personal boundaries | 4 |
| Dialog geometry/lifecycle at 1x/2x and portal positive checks | 5 |
| Narrow UI, details, toolbar/settings and menu focus routing | 5 |
| Account scope, authenticated actions and revision protection | 4 |

The contract test compares every original declaration's default, selector,
condition and cascade order against the base for all six style sources.
Additional measured CSS rules have dedicated geometry and browser checks.

**372 default screenshots matched byte-for-byte**: 31 scenes × four palettes
(dark/light/brown/purple) × 1280/390/320px. Four additional desktop 200% CSS-zoom
captures passed. The matrix includes all Settings/Personal categories, character
profile/editing, preset/block editor/dropdown, prompt preview, dialog/toast,
hover/focus/selected and synthetic loading/empty/error/disabled states.

Positive overrides also passed for Settings padding at each responsive size,
sidebar width, composer sizing independent of measurement, bounded menu height,
dialog width/surface, toast color, Accounts fields and SVG stroke. Theme isolation
checks cover unrelated controls and unchanged synthetic stored identities. Every
browser HTTP request was blocked; all fixture provider-call counts were zero.
Each case ran sequentially with one browser, using fictional in-memory data.

The compact evidence manifest with scene names and screenshot SHA-256 digests is
[phase2-validation.json](phase2-validation.json). Images remain in the local
`tmp/phase2-*-after` folders rather than bloating the repository.

Two legacy `portal.test.ts` assertions still fail: expected two fieldsets vs
four, and expected Participants/Search in a menu whose current UI puts them in
the header. **Both were reproduced on the untouched base**, in a separate tiny
two-test invocation. Their behavior/assertions were not rewritten to conceal the
mismatch. No new failure remained in the selected regression checks. No full
suite pass is claimed, and no concurrent full-suite runs were attempted.

Final typecheck and frontend build passed. `git diff --check` passed. Available
toolchain: Bun 1.4.2 / Node 25.9.0 / local Chromium. The older guide's Bun 1.4.3
was not separately exercised. Backend source and `dist/backend.js` are unchanged.

Matched frontend SHA-256:
`f0d5b85a6c81ed052697eb09add0c2260d232f14056a4d6f41a31c64eb896ea5`.

## Owner acceptance boundaries

Actual Lumiverse global Custom CSS order, real OS/browser zoom, assistive
technology and contrast for arbitrary owner themes remain environment-specific
acceptance checks. Existing default declarations and sampled output are
unchanged. A runtime theme picker/importer or arbitrary SVG/image asset loader
is not part of this CSS pass; existing icon/image styles and slots are exposed.
Host window geometry and account/data behavior remain application responsibilities.

Start editing with [UI-CUSTOMIZATION-MAP.md](UI-CUSTOMIZATION-MAP.md),
[THEME-CONTRACT.md](THEME-CONTRACT.md) and [starter-theme.css](starter-theme.css).
