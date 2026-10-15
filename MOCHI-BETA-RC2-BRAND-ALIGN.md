# MOCHI-BETA-RC2-BRAND-ALIGN

Local RC2 revision `brand-align-1`, 2026-10-15. Base HEAD remains `a542a92891f9091ad0c7e5e3cfa32c4fdfe6dcd9` on `codex/mochi-desktop-01b-base-review`. No commits, pushes, installs, host changes or deployment. The user's screenshots are visual feedback on the prior RC2; this checkpoint has not installed the aligned revision.

## Inspection and correction

The desktop header in `src/mochi/view.ts` renders one wordmark image inside an h2 and one decorative mascot SVG inside `.mochi-shell-mascot`. The outer branding row already used flex centering. The h2 contains a block image, while the mascot previously used an inline 34 × 34 SVG with a font-dependent baseline/descender gap. Centering the enclosing span therefore did not guarantee centering the visible SVG. Its visible face was also smaller than the wordmark's visible artwork.

Read-only alpha inspection of the original, hash-verified wordmark found substantive alpha (>16) bounds `(129,76)`–`(2046,652)` inside its 2172 × 724 canvas. At 108px display width, the image frame is 36px high, visible artwork is 28.641px high, and its visible vertical center is 18.099px from the frame top.

The unchanged mascot SVG viewBox is `83 247 1088 789`; its substantive PNG bounds are `(87,251)`–`(1167,1032)`. The old square 34px viewport gave approximately 24.406px visible artwork height, before accounting for its inline baseline gap. A 40 × 36px SVG viewport with preserved aspect ratio gives 28.713px visible artwork height and a center at exactly 18px. The corrected artwork centers differ by approximately **0.099px**, and heights by approximately **0.073px**. These calculations use the visible alpha bounds rather than full PNG dimensions.

Only the desktop branding CSS changed: h2 and mascot wrappers use centered flex boxes without line-box space; the SVG is block-level in a 40 × 36px frame. Original image pixels, viewBoxes, colors and proportions are untouched. No transforms, destructive crops or regeneration were used. The floating launcher, portal icon asset, native Pocket icons and messenger controls are unchanged. Inspection found no redundant old decorative glyph rendered alongside these two current artworks; unused legacy CSS is not an extra rendered logo. The host's textual window title remains intact.

## Files changed in this correction

- `src/mochi/desktop-styles.ts`: scoped header sizing/centering only.
- `tests/mochi-header-brand-align.test.ts`: alpha-bound geometry and baseline-free header contract.
- `tests/beta-hotfix-artifacts.test.ts`: confirms the compiled desktop contains the corrected CSS.
- `dist/frontend.js`: fresh matching build.
- `MOCHI-BETA-HOTFIX-RC2.json`, `MOCHI-BETA-HOTFIX-RC2-PACKAGE.json`: updated RC2 revision, artifact/provenance references and verification results.
- `MOCHI-BETA-RC2-BRAND-ALIGN.md`: this report.

The sequential production build also ran the backend target; `dist/backend.js` stayed byte-for-byte identical to the verified Power hotfix. The preceding uncommitted Power, wordmark and mascot work remains preserved; these changes are additional to it.

## Lightweight verification

- Header geometry/markup contracts: 2 passed, 14 assertions.
- Original mascot/wordmark asset integrity and proportions: 3 passed, 25 assertions.
- Compiled frontend header/asset/Power checks: 2 passed, 24 assertions.
- Total: **7 passed, 0 failed, 63 assertions**, in small sequential processes.
- One TypeScript typecheck passed.
- One sequential production build passed.
- The initial new compiled-style assertion inspected only the first style node, which holds base styles; the desktop CSS is in another node. Corrected the test to inspect all style nodes and reran successfully. No extra runtime change or rebuild was needed.
- No full suite, automated browser, Chromium, host startup or rendered-browser measurement was run. Tests verify expected geometry and DOM/build contracts, not actual browser pixels. Final alignment and perceived balance still require the user's updated installed-build screenshot, including any nondefault zoom.

## Exact updated RC2 hashes

- Frontend: `E3F6590DADFC63F756B7C54F4E4B0F33EAD6DBFC085616CCAB921EF8F960AED8`.
- Backend: `FB2478EE6AB4B004955CAF046681A82253B73BE6D16C8609936DEEC67AC329B6` (unchanged).
- Package ZIP: `B566725B6C92071BAC8F4AEAA93CC3DB3A7FE9858F07ED63EC4EBA61194D277C`.
- Package manifest: `1E6D0947DC2E51D066064EA97C21840E89F76343D59D3804C3BFCC628C813C8D`.
- Candidate metadata: `49276A8C94D93098C3B5503F9F541A12EF4EFCDDF6A46C9DC107F6D6DD23162E`.

New ZIP: `tmp/releases/mochi-closed-beta1-rc2-brand-aligned-source-runtime.zip` (3,383,336 bytes). All 132 allowlisted source/runtime/config files were reopened and checked byte-for-byte against the current working tree, including both embedded branding assets, both bundles and the unchanged `lumiphone` identifier. CRC checks passed. This is an uncommitted working-tree snapshot, not a Git source commit. Freeze a new committed provenance record before any future publication.

Original RC1 files remain intact. The previous RC2 ZIP remains intact at `tmp/releases/mochi-closed-beta1-rc2-hotfix-source-runtime.zip`, hash `0447040441B3678B2972A86941039E3828744A75B81EA72FAEDCC6BDF6D88397`. Its exact candidate/manifest/bundle files are preserved in ignored `tmp/rc2-brand-align-before/`. Launcher source, both original artwork assets, backend source and backend runtime hashes were verified against that pre-correction snapshot and are unchanged.

No data or backend behavior changed. The Power hotfix and original authentication/release limitations remain as documented; this visual correction makes no new general-release/privacy claim. Stop for user review before committing or publishing.
