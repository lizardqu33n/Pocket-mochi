# BETA-HOTFIX-01 — Local verification

This is the earlier Power/wordmark verification record. The subsequent mascot addition and current RC2 artifacts are documented in `MOCHI-BETA-HOTFIX-01-MASCOT.md` and `MOCHI-BETA-HOTFIX-RC2.json`; the artifact hashes below are historical and are not the current frontend.

Date: 2026-10-15. Starting and unchanged HEAD: `a542a92891f9091ad0c7e5e3cfa32c4fdfe6dcd9`, the published `beta/mochi-closed-beta1-rc1` checkpoint. Work remains uncommitted in the existing isolated `codex/mochi-desktop-01b-base-review` checkout. No push, install, deployment, branch promotion or host/data operation was performed.

## Changes and provenance

Pocket Power is ported from approved `874b225fe7be97785b93d0785884ddf293a95bdd` (permission/gate/control) and `8b16bdf0f945ac473eb1a25fd7e9f17554b4a248` (green/red/neutral styles), inspected in the adjacent Pocket Power checkout. Its old compiled bundles were not copied. The new storage/component modules and color test match the approved source after line-ending normalization. Backend/icon/style hunks applied directly. Controller hunks were inserted manually into the newer beta controller, retaining its shared Mochi session and native subscription routing. No whole-file replacement, merge or cherry-pick was used.

The permission remains authenticated-user/per-RP scoped in `rp-context/<chatId>.json`, outside phone data. A missing permission uses the existing initialized/legacy-phone interpretation: configured phones retain On; unconfigured chats default Off. The interceptor gate precedes prompt cleanup, snapshot/handoff/relay/reference injection and receipt writes. The saved-state response and acknowledgment remain the source of truth. On is green, Off red, disabled/unavailable/pending grey; accessible labels, pressed state, hover and focus rules are retained.

The supplied Kawaii Mochi Bubble Wordmark PNG is embedded byte-for-byte as a PNG data URL imported as text, so the frontend remains self-contained in Lumiverse's runtime. Original dimensions: 2172 × 724, RGBA. Decoded image SHA-256: `C097B2889DD77AEDB6BA6446B22DB73364E258E7091C1A72C6C788EF4C3D9F76`. No generation, background removal, tracing or brand redesign was performed. It uses proportional auto height and a bounded width, with alt text “Mochi”. The source supplied by the user is the asset provenance.

Replaced both visual wordmarks: desktop conversation-list header and compatibility/portal/handset header (including account-choice views using that header). Semantic app/window titles, account-screen headings, mascot, floating launcher and sidebar icons remain intact. The embedded asset increases the frontend from approximately 0.98 MB to 2.10 MB; this preserves the supplied PNG rather than making a lossy replacement.

## Exact changed files

- `src/backend.ts`: approved gate, permission endpoint and state response.
- `src/backend/rp-context-power.ts`: approved independent permission storage.
- `src/frontend/controller.ts`: approved home button and scoped acknowledgment handling, conservatively ported.
- `src/frontend/components/rp-context-power.ts`: approved accessible control.
- `src/frontend/components/icons.ts`: approved power glyph.
- `src/styles.ts`: approved power-control colors/layout/focus states.
- `src/css.d.ts`: text-asset import declaration.
- `src/mochi/view.ts`: both headers use the shared wordmark renderer.
- `src/mochi/wordmark.ts`: accessible, proportional image renderer.
- `src/mochi/assets/mochi-wordmark.data-url.txt`: unchanged user PNG encoded for embedding.
- `tests/pocket-power.test.ts`: approved regression tests; only adaptation is optional `POCKET_POWER_BACKEND` import selection for source/built-backend runs.
- `tests/pocket-power-color.test.ts`: approved state/color component test.
- `tests/mochi-wordmark.test.ts`: exact asset hash, dimensions, accessible proportional rendering.
- `tests/mochi-ui-shell.test.ts`: old text-content assertion now checks image alt; added both-header coverage at 320/390/900px.
- `tests/beta-hotfix-artifacts.test.ts`: compiled frontend rendering/session and embedded Power/asset checks.
- `dist/frontend.js`, `dist/backend.js`: freshly built matching runtime pair.
- `BETA-HOTFIX-01.md`: this report.

The pre-existing untracked `MOCHI-BETA-PUBLISH-01.md` remains untouched and outside this hotfix. Manifest identity `lumiphone`, manifest/package/lockfile, Mochi service/scheduler and all persistent data are unchanged. Reviewed changes contain synthetic test data and the supplied asset; no credentials/private account records or generated screenshots are included. Diff whitespace checks pass with the repository's CRLF convention accounted for.

## Sequential verification

- One `bun run typecheck`: passed.
- One `bun run build`: passed, backend then frontend, no concurrent verification.
- Source Power/color/wordmark/UI checks: 22 passed, 239 assertions.
- Built-backend Power checks: 6 passed, 39 assertions (repeat of the six source Power cases against the generated backend).
- Session/portal/desktop compatibility checks: 20 passed, 177 assertions.
- Compiled frontend checks: 2 passed, 20 assertions. The built exported API creates one session/listener and renders the exact embedded wordmark in both presentations.
- Total: 44 distinct tests passed, plus six additional built-backend executions. No final test failures. An initial path-filter invocation accidentally discovered an ignored preserved test copy with missing imports; corrected explicit `./tests/...` paths exclude backups. No backup was altered.

These are simulated storage/interceptor/JSDOM checks, not a live Lumiverse/provider or rendered-browser acceptance test. No Chromium, full suite, server startup or visual-baseline regeneration was run. Actual pixel appearance, browser zoom and live host behavior still need the user's controlled smoke check. Earlier authentication/acceptance limitations remain unchanged; this hotfix does not certify general multi-user release readiness.

## Runtime artifacts and publication

- `dist/frontend.js`: 2,100,198 bytes; SHA-256 `923AF50F42C798E2F5186BBA151C9EE7D70627DC9C5A09E72618907E716C28DA`.
- `dist/backend.js`: 760,010 bytes; SHA-256 `FB2478EE6AB4B004955CAF046681A82253B73BE6D16C8609936DEEC67AC329B6`.

Both bundles match this hotfix source/build. The backend bundle diff contains only the approved Power additions; Mochi generation, scheduler and persistence implementation are retained. Original RC1 runtime bytes are preserved in ignored `tmp/beta-hotfix-01-before-bundles/`, with original frontend hash `58A35491BD91D49663A9E3E27DA006D071A2E4C3B7F9BDB779F1AC12DD261C14` and backend hash `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B`. Earlier backups are untouched.

Implementation verification is complete for this narrow hotfix and it is ready for a separately approved local freeze/publication step. The existing `MOCHI-BETA-CANDIDATE.json`, `MOCHI-BETA-PACKAGE.json` and RC1 archive deliberately still describe immutable original RC1, not this uncommitted hotfix. A publication checkpoint must commit the reviewed source/runtime pair and produce updated hotfix provenance/package hashes before pushing; do not upload the original RC1 archive as if it contained this update. No new release/archive was created here.

Rollback is code-only to the original candidate/runtime pair; do not delete or restore phone/Mochi histories. Old beta code preserves any new Power permission records but does not enforce them. Installation and any storage rollback are outside this checkpoint.
