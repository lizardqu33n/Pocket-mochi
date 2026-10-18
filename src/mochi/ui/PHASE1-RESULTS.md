# Whole-interface skinning: phase 1 result

Base: `test-mochi` at `c1f18694b904a0578483217ee047c44a467d7e9a`.
The remote was rechecked at that same hash before publication preparation.

## Implemented

- A separate, locally bundled `mochi-theme.css` entry point, delivered through
  existing CSS section adapters into the tracked frontend build.
- Zero-specificity token defaults; independent chrome, launcher, mobile,
  workspace and notification styles receive defaults without depending on a
  messenger view. Component-only sections reuse those defaults to limit repeated
  CSS parsing. Existing section ordering remains intact.
- 52 newly extracted Accounts/chrome tokens plus a shared SVG stroke token.
  Values retain the original defaults. Named action wrappers and shared SVG
  artwork hooks preserve button labels and DOM behavior.
- A starter covering every currently declared public token, a public selector
  reference, scoped examples, precedence guidance, structural boundaries and a
  generated inventory of all 24 Mochi CSS sections / 9 inline geometry sites.
- No account, generation, storage, provider, revision or ownership logic changes.
  No backend bundle changes. No installed or hosted application was accessed.

## Validation and limits

- Typecheck passed. Frontend build passed and embeds the matched CSS locally.
  Toolchain available on this machine: Bun **1.4.2**, Node **25.9.0**. The older
  README names Bun 1.4.3; that exact version was not exercised here.
- Focused regression run: **97 passed / 0 failed** across CSS delivery, native
  roles, Accounts/sidebar, settings, account isolation, messenger/mobile and UI
  shell tests. That completed before the final removal of redundant token copies
  from component-only sections. The final typecheck/build passed; a repeated
  focused run was stopped to reduce load after the owner reported resource
  pressure. No final full-suite pass is claimed.
- Synthetic Chromium run: **48 default screenshots matched byte-for-byte**
  against production source from the base commit: Accounts list/grid/editor and
  messenger in dark/light/brown/purple at 1280/390/320px. Four additional 200%
  CSS-zoom scenes and scoped token/SVG overrides passed. All browser HTTP requests
  were blocked; fixture provider calls were zero. This also preceded the
  redundant-token-copy reduction, which did not change any declarations.
- The existing `check-mochi-css-ui.mjs` failed on the **unchanged base** at its
  toolbar `flex-wrap` assertion (`wrap` vs `nowrap`). It was not changed to conceal
  that mismatch. The dedicated new checker avoids that stale toolbar assumption.
- Broader current/base suite attempts were interrupted under machine resource
  pressure. Logs contain timeouts and other assertions that remain untriaged;
  they are neither a clean regression verdict nor evidence of a full-suite pass.
  Further heavy runs were stopped after the owner's clarification.
- `git diff --check` passed. Build outputs use the repository's existing Git line
  ending behavior. Runtime geometry remains JS-owned.

## Pending / owner acceptance

The remaining component, state, responsive and shared Pocket CSS migration is
phase 2. Actual upstream Lucide assets/licensing, custom image/SVG loading with
graceful error fallback, and non-shared icon migration are phase 3. See
[THEME-CONTRACT.md](THEME-CONTRACT.md) and
[THEME-INVENTORY.md](THEME-INVENTORY.md) for exact boundaries.

Acceptance still needs all settings/presets/dialogs/states, quantitative contrast,
actual Lumiverse global Custom CSS order, actual browser zoom and assistive
technology, and custom-asset failures. A CSS-only build workflow is supported;
a runtime theme importer/picker is not included. No owner SVG is needed for the
current default renderer. No beta promotion or hosted reload is authorized by
this result.
