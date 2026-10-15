# MOCHI-BETA-HOTFIX-01 — Approved mascot / RC2

2026-10-15. Base HEAD remains `a542a92891f9091ad0c7e5e3cfa32c4fdfe6dcd9` on the isolated `codex/mochi-desktop-01b-base-review` checkout. This is an uncommitted local RC2 snapshot, not the published RC1. No commit, push, installation, deployment, branch promotion, host startup or persistent-data operation occurred.

## Mascot asset and presentation

Source: the user-created `ChatGPT Image Oct 15, 2026, 01_38_17 AM-1.png`, supplied for official Mochi branding. SHA-256 `67655A283DB1F7A41F92291DE46541AEB5F09A1FBDC371E82B1F2AF8054596A5`.

Read-only image inspection found a 1254 × 1254 RGBA PNG with alpha 0–255 and fully transparent corners. All nonzero alpha bounds are `(0,155)`–`(1215,1198)` because a few extremely faint pixels extend beyond the face. Alpha greater than 16 bounds are `(87,251)`–`(1167,1032)`; alpha greater than 128 bounds are `(88,251)`–`(1166,1032)`.

`src/mochi/assets/mochi-mascot.svg` embeds the original PNG bytes unchanged and uses a cropped presentation viewBox `83 247 1088 789`, retaining a four-pixel margin around the substantive visible pixels. This excludes outer padding/faint outliers without stretching or redrawing the face. It does not destructively crop the source bitmap. The SVG uses `preserveAspectRatio="xMidYMid meet"`; the PNG remains embedded locally as a data URL, without a remote asset dependency.

`src/mochi/sidebar-icon.ts` keeps the existing exported icon boundary and imports this asset. Existing consumers now show the approved mascot:

- Floating Mochi launcher button (existing 52px button; approximately 38px content area).
- Mochi-specific portal shortcut artwork.
- Existing compact desktop header mark (34px frame).

No new decorative element was added. The full supplied wordmark remains in both existing name/header presentations. Character avatars, fictional profiles, native Pocket icons, Lumiverse branding, accessible button names and interactions are unchanged.

At the launcher's approximate 38px content width, the visible mascot is approximately 27.6px high; the header's 34px frame shows approximately 24.7px-high artwork. Its white body, lavender outline, eyes and curved mouth retain their original proportions and colors. At 16px the mouth is necessarily much smaller; actual small-scale sharpness/contrast remains a visual acceptance item, not a claimed live-browser pass.

An optional local preview at `tmp/mochi-mascot-rc2-preview.html` shows 16/24/32/40/52px frames on light and dark backgrounds. It was prepared, not automatically opened. No browser automation or rendered-pixel review was performed.

## Changes relative to the preceding verified hotfix

- Added `src/mochi/assets/mochi-mascot.svg`.
- Updated `src/mochi/sidebar-icon.ts` to use the approved asset.
- Updated `src/css.d.ts` for SVG text imports.
- Added `tests/mochi-mascot.test.ts` (exact source-image hash, dimensions/alpha format, crop viewport, proportional/decorative/local markup).
- Updated `tests/mochi-sidebar.test.ts` to check the real mascot viewport/image in portal and launcher while retaining existing navigation assertions. Replaced one obsolete temporary-icon 24-unit-viewBox assertion; no behavior test was removed.
- Updated `tests/beta-hotfix-artifacts.test.ts` to check the mascot in the compiled frontend.
- Regenerated both `dist` bundles sequentially; backend bytes are unchanged from the verified Power hotfix.
- Added `MOCHI-BETA-HOTFIX-RC2.json`, `MOCHI-BETA-HOTFIX-RC2-PACKAGE.json`, this report, and a historical-status note in `BETA-HOTFIX-01.md`.

Earlier Power and wordmark source changes remain as documented in `BETA-HOTFIX-01.md`. Original RC1 candidate/package records and ZIP are unchanged. Existing untracked publication notes and every earlier backup remain preserved. The pre-mascot verified pair is additionally backed up in ignored `tmp/beta-hotfix-01-before-mascot/` (frontend `923AF50F42C798E2F5186BBA151C9EE7D70627DC9C5A09E72618907E716C28DA`, backend `FB2478EE6AB4B004955CAF046681A82253B73BE6D16C8609936DEEC67AC329B6`).

## Verification and resource incident

One typecheck passed. One production build passed, backend followed by frontend. All completed verification commands ran sequentially.

The first combined targeted test process became unresponsive at its final color-test file after its other individual tests had passed. A lightweight process check was also slow. An attempt to identify/stop only that test initially required elevated process-query access; by the subsequent query it had already exited. No Bun test process remained. The cause was not established, and no app performance claim is inferred from it. The combined run is excluded from pass counts. Its affected checks were rerun in smaller processes, with each finishing successfully:

- Mascot and wordmark: 3 tests, 25 assertions.
- Sidebar/launcher: 11 tests, 110 assertions.
- Header/UI shell at 320/390/900px and existing compatibility coverage: 13 tests, 146 assertions.
- Power colors: 1 test, 42 assertions.
- Compiled frontend: 2 tests, 23 assertions.

Total completed reruns: **30 tests passed, 0 failed, 346 assertions**. The prior backend Power tests are not counted again; the backend hash remains exactly the previously tested hotfix hash. No full suite, Chromium, server, provider request or live Lumiverse test ran. Future DOM suites should remain split into small processes on this PC.

Manifest identity `lumiphone`, permissions, dependencies, native messaging behavior, Mochi backend/service/scheduler and stored data are unchanged by the mascot addition. The PNG hash and wordmark hash tests verify that neither supplied design was redrawn. Source diff whitespace checks pass under the repository's CRLF conventions.

## Updated RC2 artifacts

Candidate: `mochi-closed-beta1-rc2`. This explicitly supersedes RC1; it does not claim the new runtime matches RC1.

- Frontend SHA-256: `BB02CBEA806699DD629740CD120F781C78EB779D86A22E485EC43E41341741A9` (2,753,269 bytes).
- Backend SHA-256: `FB2478EE6AB4B004955CAF046681A82253B73BE6D16C8609936DEEC67AC329B6` (760,010 bytes; unchanged from the verified Power hotfix).
- Source/runtime ZIP: `tmp/releases/mochi-closed-beta1-rc2-hotfix-source-runtime.zip`, SHA-256 `0447040441B3678B2972A86941039E3828744A75B81EA72FAEDCC6BDF6D88397` (3,383,290 bytes).
- Package manifest SHA-256: `D6C5C22198118233FCCA2BBFAE31E0B41DE8F8B150728CF25DB4953EBECB5EDA`.
- Candidate metadata SHA-256: `D9EFA080D28BF118865DD12172BE9C9785CF1B2E92C742291BAC4A7823DDB042`.

The package has **132 allowlisted files**: `src/`, both `dist` bundles, `spindle.json`, `package.json`, `bun.lock`, and `tsconfig.json`. Verification reopened the ZIP, checked CRCs, compared every entry SHA-256 to current source/runtime bytes, checked the `lumiphone` identity, and confirmed both branding assets and both Power modules are included. No test fixture, temporary preview, private account/storage record or backup is packaged. This is an exact working-tree snapshot, not a Git archive or newly committed source tree. Re-freeze its provenance if any packaged source changes before publication.

The source PNG is preserved at original resolution, adding approximately 0.65 MB to the frontend versus the preceding hotfix. Asset optimization can be considered separately after visual review; no lossy transformation was introduced here.

Ready for user visual review and a separately approved commit/publication checkpoint. All original authentication/security/host-acceptance limitations remain unchanged; RC2 does not promote general multi-user release readiness. No push or installation is authorized by this report.

Rollback is code-only to the preceding pair; do not delete or restore histories, account data or permission records. Old RC1 code does not enforce the newly added Power permissions, even though those records remain stored.
