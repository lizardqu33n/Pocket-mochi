# CORE-01C validation record

October 20, 2026, America/Chicago. All execution used isolated source checkouts, synthetic fixtures and fake providers. No installed host, real owner records, private RP/credential data or real model calls were accessed. Read the operational limits in [CORE-01C](MOCHI-CORE-01C.md) before any installation or transfer.

## Provenance and commits

Read the full CORE-01A audit, CORE-01B local/publication handoffs, postfix handoff and recovered B4 proposal. Exact postfix `45d7d139428517bf5e8dfd8d14acec4670658a94` was recovered into fresh clean `CORE-01C-isolated` from the verified complete-history bundle, SHA-256 `6ced13d4297df2779a53a5378fb6ed1ae24c7987ed06dbd62682ec280c4518cb`. A separate pristine postfix checkout was created for build and failure comparison. Prior workspaces and synced sources were not edited.

Read-only live initial refs matched: test-mochi `d0a1f8b8a6c56ed832809b337d2e4f809539cd8d`; beta-mochi `de78a44cd3a41c3af14ac911a2c79bef81276a76`. Beta is protected by task scope; this is not a claim about GitHub enforcement. Final pre/post-publication refs and the delivery commit are recorded in the external handoff.

Local recoverable series preceding the final documentation/delivery commit:

| Commit | Purpose |
| --- | --- |
| 45d7d139428517bf5e8dfd8d14acec4670658a94 | Exact recovered sidebar wrapper and creator metadata postfix |
| 41c3ebc72f147cce4ee8f20290f29f1808ae8aff | Same-owner maintenance transfer, journal/recovery and normal-runtime gate |
| c99c47ce508e39759c99b13aba2da4c605148f82 | Bounded source reads, explicit registry exclusion, denied/alias cases |
| 41dd62a26b6d1569b335cb34dee414fcc84b689d | Dedicated mochi identity, separate actions, coupled 0.6.1 and deterministic due-job fixtures |
| 604f6b9e7b8c6be639c68af9d72553ee73cff218 | Explicit selected Pocket profile copy, no target-bank relink, backing-source checksum |
| 8effd87524f9495da4caa32e69d314756351579a | Maintenance teardown and context-scoped review safety |

## Fresh checks

Toolchain: Bun 1.4.2, Node 25.9.0, locked TypeScript 5.9.3 / Spindle types 0.6.32 / jsdom 30.0.1 / postcss 8.5.30. Existing locked dependencies were copied into the new disposable checkout; no dependency/lockfile changes or lifecycle installation scripts were needed.

- Typecheck, paired main build and CSS diagnostics passed. Repeated paired build was byte-identical.
- Both maintenance build modes passed. Actual source/destination backend delivery bundles were loaded with synthetic hosts; the normal paired delivery bundles were also loaded without Pocket.
- Transfer: 16 tests / 579 assertions pass. Includes two real principals with overlapping stable identifiers, multiple/archived fictional accounts, legacy rooms, saved histories/presets/prompts/preferences, Unicode reactions, selected Pocket profiles, missing/native/image/connection dependencies, false/null consent, path/schema/hash/collision refusal, source drift, every durable import/rollback mutation interruption, owner changes, idempotent repeated import, later-write rollback retention, aliased registry, future timestamps, queued/claimed/deferred/expired/terminal jobs, unavailable capabilities, size bounds and teardown interruption. Copied jobs never generate. Initial test-fixture Unicode encoding mistakes were corrected; no data-validation assertions were removed.
- Standalone: 14 tests / 260 assertions pass. The inherited dueAt=Date.now() race reproduced initially; its two due-job fixtures now use a fixed clock, restored in finally. Root-only final run passes. An early filter invocation also discovered the nested pristine baseline suite and recorded its inherited timing failure; authoritative current runs use explicit `./tests/...` paths.
- Sidebar: 21 / 221 pass. Mobile surface: 5 / 78 pass (final root-only run).
- Browser sidebar regression: four desktop/mobile + capability/fallback scenarios pass, 12 screenshots, editor sizing/focus/Tab/Escape/scroll/cancel/save/account routing/hide-reopen/owner teardown covered, zero provider calls. Desktop picker/editor widths 448/432px; mobile 358/342px. Sandbox Edge startup failed; the approved isolated headless profile run, with HTTP blocked, supplied the passing results.
- Additional per-file passes: accounts 16, presets 14, prompt blocks 15, generation prompts 34, scheduler 40, scheduling lifecycle 44, generation errors 14, persona sync 21, CSS 4, native theme 3, theme contract 3, routine generation 35, routines 25, sched-aigen-fix 36. All providers are synthetic. Raw logs and machine-readable results are retained in the external handoff.
- Protected Git blobs under all src/mochi/ui, shared PHONE_STYLES/design-system/portal CSS and bun.lock are unchanged from the exact postfix. Existing canonical asset/artwork/Lucide provenance and bundled notices pass. No CSS/assets redesign or license replacement occurred.

Selected per-file totals: **443 pass / 6 inherited failures**, 23 file executions, not the entire repository suite. Counts describe executions, not necessarily unique tests across shared fixtures. Full original verify, installed-host tests, real Android tests and real provider probes were deliberately not run.

## Reproduced inherited failures

Each of the following was freshly rerun on the pristine recovered postfix and current candidate with identical pass/fail counts and failure names:

| Suite | Both revisions | Failure |
| --- | --- | --- |
| window | 12 pass / 1 fail | window ownership/settings-draft case queries missing Room instructions |
| session | 8 / 1 | hide/restore settings-draft case queries missing Room instructions |
| workspace | 24 / 2 | close/return settings-draft case; real-user-change fixture expects accountId but gets undefined |
| memory | 37 / 1 | summary-editor scoped draft/confirmation/refresh UI fixture |
| icons | 2 / 1 | raw SVG digest under Windows CRLF; canonical provenance still passes |

The historical broad comparison (826 pass / 32 inherited failures plus settings-workspace timeout) and old toolbar wrap/nowrap caveat remain earlier evidence, not a fresh all-suite result. These are unresolved acceptance debt, not waived or repaired here. The fixed due-job timing fixture is separate from those inherited product/UI failures.

## SHA-256 delivery pairs

Pristine exact postfix rebuilt independently and matched the supplied pair:

| File | SHA-256 |
| --- | --- |
| postfix backend | 5b5224ec23aafaa8ad16d358385a6e31cf1d8c870e98a60d50cee58cc09792dd |
| postfix frontend | efe6010eb2d9ef5fd81577304a49746a69fc0a614a30b378f6331b3a7b1ff2ad |
| 0.6.1 main dist/backend.js | ee77c67f482ff3d3c0a06c496214c5c295ae2937b9926faf5eb15092f9efaa65 |
| 0.6.1 main dist/frontend.js | 9b17cac40b9039ab94cd77cdc92100648224b8815975b2d35223ed5aee35f1c2 |
| local source-maintenance backend | 2631003d2fc7daaf03d1ee010f6284d3d1934ff3ebc7ac82373813a52014aab8 |
| local destination-maintenance backend | 4d91e848e8f69ee3ba58d50e4457cfa00fe09ae217c27b081adfb4e31e28abe1 |
| local maintenance frontend, both modes | af6b605527b8eb9030150697ad985b1e6c950b5ac2df63e5058a0d098a9d6476 |

Main bundle hashes identify the paired tracked artifacts. Maintenance hashes identify local build outputs, not extra installed/released extensions. Reproducibility is for the recorded Windows working-source bytes and toolchain. The inherited embedded shared-CSS line-ending caveat means no universal LF/CRLF or cross-platform reproducibility claim is made; the handoff ZIP preserves the actual working source/dist bytes.

## Publication gate and remaining limits

Conditional publication may make one normal fast-forward push containing the whole series to test-mochi only after live refs still match the approved baseline, completed local checks, recoverability and this safety review. Never push the postfix alone. Ref divergence, critical transfer failure or unsupported safe host operation stops publication. No beta promotion, tag, release, deployment, host reload, real owner migration, private-file bridge, real RP/provider call or new repository is part of this scope.

The maintenance procedure relies on operator-enforced exclusive workers and preserved backups; it does not promise safe concurrent online transfer or arbitrary disk-corruption recovery. The public host API/source supports the scoped primitives and same-identifier code replacement used in the design; actual installed-version permissions/stop/replacement/auth behavior must be accepted in a separately approved disposable host before use. A checksum is not a source signature. Public standalone distribution still requires applicable Pocket permission/license clarification; attribution alone establishes no grant. The owner has requested attribution for now and will contact Pocket's creator. Current authorship/provenance notices are preserved.
