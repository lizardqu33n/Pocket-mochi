# MOCHI HQ — CORE-01B, B0–B3

Private local implementation of the CORE-01A proposal. This is a Lumiverse/Spindle extension, not a hostless application. Remote publication, installation, host reload, real-data migration, beta promotion, RP linking, and the optional Pocket adapter are excluded.

## Independent composition

`src/backend.ts` starts `src/mochi/runtime.ts`: one MochiService, one MochiScheduler and one authenticated frontend listener per host object. Only `mochi:*` is dispatched. Host-supplied real user identity remains authoritative; payload identity never selects a principal. There is no phone resolver, phone-state normalization, Pocket controller, tool/interceptor registration, RP event subscription or native-phone startup in this path.

`src/frontend.ts` starts `src/mochi/shell.ts`: one session using the original transport functions, owned `mochi` drawer, `open-mochi` action and optional original-artwork floating launcher. Missing float/geometry/fullscreen capabilities retain the drawer path. Shared PHONE_STYLES/PORTAL_STYLES remain embedded because existing dialogs and controls use them; no owner stylesheet or icon is edited. Desktop and mobile continue to use the existing session/workspace presentation lease. In-app notifications default to enabled with previews off; they do not use OS push or Pocket phone preferences.

Setup is idempotent per frontend context. Disposal removes owned actions, drawer, widgets, style injection and session subscriptions, including partial startup, trusted invalid-auth events and observed real-owner changes. Fictional-account and RP changes are not treated as real logout. A fresh authenticated host context is needed after session destruction. Hosts may call the returned disposer or supported `ctx.onTeardown`.

Backend `teardown()` explicitly stops the runtime and aborts scheduled, interactive and queued generation. Late provider output and transport sends are suppressed. Cancellation recovery can still read/write its existing durable job record, so shutdown does not silently turn consent off or erase pending work. The Spindle backend API used here has no general extension-shutdown callback: the host owns worker termination; merely exporting teardown does not claim the host invokes it.

The independent scheduler's first automatic poll occurs after 30 seconds, so boot performs no storage discovery, provider call or immediate catch-up dispatch. Subsequent polls retain existing durable discovery, budgets, consent, dedupe and cancellation. The original scheduler default remains available to legacy callers. Due jobs can run on subsequent polls under their existing authorization; this milestone does not pause existing approved jobs permanently.

## Frozen compatibility and storage

- Manifest identity remains `lumiphone`; display name becomes Mochi. It cannot coexist with any other installation using `lumiphone`.
- All `mochi/v1` paths, record versions, IDs, source discriminators and workspace API version 1 remain unchanged. Existing `source:pocket` records still require their original identity profile for generation; missing profiles are errors, never an implicit conversion to manual.
- No transfer/import/export controls, migration journal, schema rewrite or automatic activation of copied jobs are implemented. No real owner records are read or changed.
- Legacy combined entries are retained in `src/backend-legacy.ts` and `src/frontend-legacy.ts`. `build:legacy` is an explicit build-only option producing `tmp/legacy-dist`; default manifest entries always use the independent composition. Legacy execution is not part of this milestone's verification.
- `tests/fixtures/mochi-core-01b-assets.json` freezes canonical LF bytes for every `src/mochi/ui` file, the launcher artwork, PHONE_STYLES and shared design system. Git text newline conversion is normalized by the test. The actual source tree remains unchanged for these files.

## Host capability contract

Required: authenticated/user-targeted transport; `ui_panels` drawer/action APIs; scoped `userStorage` exists/getJson/setJson/move/list; character lookup/list; connection resolution; token counting and quiet generation for explicit AI actions. Native personas/add-ons use persona APIs. Portrait/upload features retain `images`; missing optional image access must not prevent core boot. Scheduling needs durable extension storage, and uses optional users.getRole revalidation. Native model lists use the existing authenticated same-origin endpoint.

Manifest permissions are `generation`, `characters`, `personas`, `images`, `ui_panels`. Independent tests deny legacy tools/interceptor/chat/chat mutation/CORS/image-generation/push APIs. No required Mochi feature was removed to achieve that reduction.

Geometry, resize-controller and fullscreen APIs enhance supported desktop/mobile surfaces. Missing geometry/fullscreen falls back to the owned drawer. Theme delivery uses existing public Lumiverse native variables, including `--lumiverse-bg-deep`, and existing owner CSS hooks. The historical manifest minimum remains 1.1.6, but this is not proof that every release since 1.1.6 satisfies the capability/auth/theme contract. The installed host was deliberately not inspected. Source/type compatibility and synthetic mocks do not certify its version or trusted auth teardown behavior.

## Local verification

Inspect commands before use. `scripts/verify-mochi-core.mjs` runs only `tests/mochi*.test.ts`, one file per process with bounded timeouts. It does not run mount:local, host relay/probes, real provider requests or private RP APIs. Individual test imports are synthetic fixtures.

```
bun install --frozen-lockfile --ignore-scripts
bun run typecheck
bun run build
bun test tests/mochi-standalone.test.ts
node scripts/verify-mochi-core.mjs <pristine-baseline-root> <baseline-output>
node scripts/verify-mochi-core.mjs . <current-output>
```

Browser scripts require Playwright plus a browser executable supplied through `POCKET_PLAYWRIGHT_ROOT` and `POCKET_BROWSER_PATH`. They create temporary profiles, open generated local fixtures and block HTTP requests. No host database or installed extension is used.

```
node scripts/check-mochi-css-ui.mjs
node scripts/check-mochi-core-snapshots.mjs <baseline-root> <baseline-output>
node scripts/check-mochi-core-snapshots.mjs . <current-output> <baseline-output>
node scripts/check-mochi-core-shell-ui.mjs
```

The original CSS acceptance script remains unchanged; failures must be reported alongside the supplemental pixel comparisons. Exact results, baseline failures, delivery hashes, commands and manual acceptance limits are in the external CORE-01B handoff report. Do not interpret a build or local bundle as host acceptance or release authorization.

## Provenance and rollback

Original Pocket source and author/repository metadata are retained. CORE-01A found no verified Pocket redistribution license. Public source visibility does not establish distribution rights; these local artifacts are not a public release. Lucide/Feather licenses, notices, SVGs and provenance are retained, including bundle notices. Their terms do not license Pocket-derived code.

For this synthetic-only milestone, rollback is the original Git revision and matching original dist. No real data needs rollback because none was touched. An eventual live upgrade must preserve a matching data snapshot; after new messages, reverting code alone or overwriting new data with an old snapshot is unsafe. B4 requires separate owner authorization and a validated transfer/rollback design; see the separate proposal.
