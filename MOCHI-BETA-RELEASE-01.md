# MOCHI-BETA-RELEASE-01 — Closed Beta 1 candidate freeze

2026-10-15. **Frozen local candidate, not an opened or deployed beta.** The user
provisionally accepts the current simplified UI and feature set. No new feature,
UI redesign, runtime patch, schema migration or host-auth workaround was made.

## Decision

| Gate | Current finding |
|---|---|
| Frozen source, manifest, pair and package | Verified locally. |
| Synthetic multi-user/storage/task isolation and regressions | Passed, with one explicitly unresolved auth-gap reproduction. |
| Installed disposable pair on disk | Both hashes match; installed Git HEAD is older. |
| Running host/backend and browser-loaded asset identity | Pending; no authenticated browser/process acceptance performed. |
| Simultaneous real A/B accounts in separate browser profiles | Pending actual-host acceptance. Synthetic contexts do not replace this. |
| Final memory/preset/messaging/native Pocket and UI acceptance | Pending controlled host checks; current UI is provisionally accepted, not pixel-tested here. |
| Consistent stopped-instance data backup and recovery validation | Pending on the chosen beta host. No data backup was performed. |
| User residual-risk decision and friend access | Not authorized. |
| Unrestricted/general beta | Blocked by trusted real-user transition lifecycle and broader acceptance. |

**Recommendation:** proceed to the narrow manual acceptance below using the
existing disposable instance after approval. Recommend opening restricted access
only after those gates pass and the user explicitly accepts residual risk.
`releaseReady`, `multiUserReady` and restricted-preview `ready` remain false.

## Frozen scope

Independent Mochi desktop messenger and shared session/launcher; fictional profiles,
legacy and profile-owned DM/group rooms; normal Natural/Instant/Manual messaging,
automatic user replies independent of unsolicited opt-in, texting preferences;
manual reactions/quotes, message actions, pins/System Notes/full-room search;
immutable presets and bindings, prompt macros/placement and read-only preview;
manual/AI-reviewed summaries, coverage proof/history exclusion, retained versions
and memory-v2 Disable/Clear management; durable opportunities/delayed replies,
quotas, notifications and native Pocket compatibility.

The approved three-panel interface, scoped All/Unread/Groups/+ New Chat, icon
header and optional Details are frozen. Character availability is real reply
eligibility. Schedule snapshot is a placeholder, not an invented activity source.
Optional same-call AI reactions, restart-persistent composer drafts, clocks/routines,
new narrator/bubble delivery, themes, lorebooks/vector memory, calls/social rails
and upstream integrations are not added or implied by this freeze.

## Local checkpoints and preservation

Branch `codex/mochi-desktop-01b-base-review`; starting HEAD
`c3e036d02f500bfd00c2c6326d1245ee63353714`. Work stays in the existing isolated
review checkout. Original `mochi` recovery/settings WIP, Pocket Power, Kitty's
repositories, host source, installed files, test data and Ubuntu remain untouched.

| Checkpoint | Exact commit / scope |
|---|---|
| Existing stabilization | `08de2db47ab3384bfee7a0280d7a52634f553663`: backend memory-v2 recovery and previous fixes; already committed before this task. |
| Acceptance evidence | `7bcb4225ac91a7dfcc7b54383b49cf208815bef9`: two-user fixtures, corrected portal regression, acceptance and two authentication reports. Five files. |
| Approved UI/source freeze | `0f8f9ae9dfae42a467a08b375c1eeb767bb7e6b4`: five frontend modules, matching frontend bundle, four UI tests and three UI reports. Thirteen files. |
| Release metadata | Following documentation-only commit: this dossier, candidate JSON, preview guide, packaging manifest and reconciled roadmap. Its own SHA is recorded by Git/final delivery, not embedded recursively in itself. |

Earlier stabilization/feature implementation is inherited, not reconstructed or
merged. Source tree at the runtime freeze is
`bbc20dbe11b9ed13ffde7f6c0f7b6cd8061c903a`. Combined UI edits were intentionally
checkpointed together: splitting the uncommitted A/B/C/D source into artificial
historical states would be riskier than preserving the exact reviewed final state.

Before edits/staging, all **21 pre-existing changed files** were copied and
SHA-256 verified in ignored `tmp/beta-release-01-preserved/`, with `snapshot.json`.
This is a working-tree snapshot, **not a host-data backup**. New report copies use
logical checkout roots instead of machine-specific absolute paths; exact original
reports remain in that ignored snapshot. Source/tests/bundles were preserved
byte-for-byte. Historical reports retain their dated evidence and uncommitted-state
descriptions; this dossier supersedes those descriptions for current Git state.

Explicit file staging and staged diff/check reviews were used, never `git add .`.
No screenshots, `.env`, private keys, cookies, account records, RP histories,
logs, databases, installed backups or runtime data were staged. Only the intended
reviewed Mochi work was included. No branch promotion, rebase, merge or push.

## Source and artifact provenance

`spindle.json` remains Pocket / `lumiphone`, manifest version `0.2.0`, author
`kittyafterdark`, entries `dist/frontend.js` and `dist/backend.js`. Existing
permissions are unchanged. Candidate label `mochi-closed-beta1-rc1` versions the
local freeze/package; it does not alter the extension identity or storage namespace.
The manifest's minimum host version is not a claim of fresh acceptance of every
older host; the inspected source/test baseline is Lumiverse 1.2.5.

| Artifact | SHA-256 |
|---|---|
| Frontend | `58A35491BD91D49663A9E3E27DA006D071A2E4C3B7F9BDB779F1AC12DD261C14` |
| Backend | `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B` |

Reused the successful sequential UI-01C/01D production build. No runtime source
changed during release prep; compared source/bundle hashes with the pre-task
snapshot. Git diff of backend, service, scheduler, session and schema against the
starting checkpoint is empty. Backend contains memory-v2 validation/management;
targeted recovery tests passed. No repeat production build was necessary.

### Installed Windows test provenance

- Host source inspected: `b1a68d9e32e2a2480a0d5ae71422566845f2657b`, package 1.2.5.
  No staging switch or host edit. This is source metadata, not a running-process check.
- Disposable repository: `tmp/01d-local-host/data/extensions/lumiphone/repo`.
- Its Git HEAD remains `54d7e08b1bd88d6cf9d119f43e75e83c1dfdbe09`, with locally
  modified bundles and older backups. **Both current disk hashes equal the frozen
  pair above.** This differs from the older installed pair seen during the prior
  acceptance assessment; that report remains historical.
- Thus runtime files match, but installed source checkout provenance does not.
  The frozen review commit/package is the authoritative source snapshot. Do not
  infer runtime or source identity from that installed HEAD alone.
- Browser module/cache and already-running backend identity are unverified. No
  authentication, credential, database or user-storage content was opened.

Do not reinstall merely because a package now exists. First verify running/cache
identity during approved manual testing. Any reload/restart or replacement still
requires separate approval; do not reset or overwrite the installed checkout.

## Privacy and regression evidence

One shared synthetic service/scheduler and concurrent real-principal fixtures
verify both legacy and fictional rooms, independently authorized connections,
different provider responses held/released out of order, previews, presets,
suggestion Apply, notes/pins/reactions/quotes, notification routing, independent
quotas, forged IDs and durable restart/idempotency. Callback principal, not payload
`userId`, authorizes backend operations. Frontend fixtures have independently
bound transports; they are **not actual separate browsers or host cookies**.

Server `src/ws/handler.ts:SPINDLE_BACKEND_MSG` and user storage adapters remain
inspected evidence, not end-to-end authentication acceptance. Ordinary fictional
profile switching and same-user reconnect are distinct from real-login replacement.
Per-user isolation does not remove intentional global quota/concurrency contention.

Final sequential selections (each separate; no full suite):

| Selection (`tests/*.test.ts`) | Tests | Assertions |
|---|---:|---:|
| `mochi-multi-user-acceptance`, `mochi-beta-readiness` (imports accounts) | 29 | 309 |
| `mochi-context`, `mochi-presets`, `mochi-macros`, `mochi-memory`, `mochi-summarization` | 120 | 1051 |
| `mochi`, `mochi-auto-replies`, `mochi-scheduler`, `mochi-scheduling-lifecycle` (imports accounts) | 147 | 984 |
| `mochi-replies`, `mochi-reactions`, `mochi-pins`, `mochi-search`, `mochi-texting` | 56 | 407 |
| `mochi-ui-shell`, `mochi-desktop-layout`, `mochi-session`, `mochi-window`, `mochi-sidebar`, `mochi-beta-ux`, `portal` | 61 | 560 |
| `domain`, `generation-lifecycle` | 83 | 376 |

**480 distinct tests / 3,590 assertions / 26 files, zero test failures.** Deduplicates
16 account tests / 97 assertions imported in two selections. **One passing test is
a KNOWN RELEASE GAP reproduction confirming missing silent real-user teardown;
it is not evidence the issue is fixed or private.** One typecheck passed (project
checks source). No runtime patch, full suite, browser, Chromium, live provider,
host reboot, storage restore or actual multi-user host acceptance was performed.

## Known same-browser limitation

The source-level risk remains: when a different real Lumiverse user replaces the
previous user in one retained frontend context, there is no verified host-owned
pre-transition extension disposal guarantee. Cached private extension information
can remain. No live leak has been demonstrated, but this is neither fixed nor
declared harmless. Explicit teardown tests do not establish automatic host behavior.

The proposed restricted beta uses **separate real users in dedicated browser
profiles/devices**. Do not switch real accounts in an existing tab. Closing/reloading
is a precaution, not a verified platform fix. Keep the upstream host-lifecycle
report opportunity open. No credential polling, DOM observer or host patch.
User-facing wording is in `MOCHI-BETA-PREVIEW.md`.

## Versioned package and reproducibility

Verified local archive:
`tmp/releases/mochi-closed-beta1-rc1-0f8f9ae-source-runtime.zip`.

SHA-256: `942B8A4A5DB452FF60AB603DED74F481C75D061243BCB9A35856424A92ADD28A`.

`MOCHI-BETA-PACKAGE.json` lists **127 files**, Git blob IDs, per-file SHA-256/size,
source commit/tree and exact archive arguments. Allowlist is `src/`, both named
`dist` entries, `spindle.json`, `package.json`, `bun.lock`, `tsconfig.json`. It retains
the full approved Pocket/Mochi source and dependencies' build metadata, without
installed storage, tests, historical reports, Git internals or node_modules.
The compiled pair needs no installed build dependencies to run on the host.

Each ZIP file was verified against its pinned Git blob; both embedded bundle hashes
also match the frozen hashes. The archive is source/runtime only: provide this
dossier and preview/privacy guide separately. It is not friend-access authorization.

Reproduce from any checkout containing the frozen commit (choose a new output
path if the file exists; don't overwrite the verified copy):

```text
git -c core.autocrlf=false archive --format=zip --output=mochi-closed-beta1-rc1-source-runtime.zip 0f8f9ae9dfae42a467a08b375c1eeb767bb7e6b4 -- spindle.json src dist/frontend.js dist/backend.js package.json bun.lock tsconfig.json
```

Windows `core.autocrlf=true` changed the first archive's bytes. Verification rejected
it before any distribution. It is retained only as ignored
`tmp/releases/UNVERIFIED-crlf-mochi-beta1-rc1.zip`—**do not use it**. The command above
disables conversion for one command, without changing Git config. File hashes are
the cross-platform payload check; archive-container bytes may depend on Git tooling.
No global setting, source file or runtime bundle was changed to fix packaging.

## Controlled manual acceptance — still required

No host/browser/account/provider action below was executed or authorized implicitly.
Use the disposable instance only after separate approval; no production accounts
or histories copied to Windows. The existing launcher's intended port is 7861 and
data root is `tmp/01d-local-host/data`; do not run it automatically or start another
instance. Existing disk pair matches: replacement is not the default next step.

1. **Identity and backup:** user/operator verifies the actual running host version,
   chosen data root and extension process. Complete a stopped-instance consistent
   backup below before persistent testing changes. Verify both bundle hashes.
   In each approved browser profile, inspect the existing Spindle frontend bundle
   request in DevTools Network (loader fetches `getFrontendBundleUrl`). Save only
   that extension JS response locally and hash it; compare with the frontend hash.
   Do not export cookies, authorization headers, HARs, prompts or RP requests.
   If process/cache identity is uncertain, request a supported extension reload or
   host restart; do not silently assume disk bytes equal loaded code.
2. **Two real users simultaneously:** use two disposable Lumiverse test accounts
   in separate full browser profiles/devices (two incognito windows can share a
   session). Existing accounts only if suitable; account creation requires separate
   approval. Each creates its own fictional profile, legacy room, private preset
   and distinguishable synthetic history. A must never see B's choices/content,
   and vice versa. Keep both signed in; do not test successive A→B in one tab here.
3. **Messaging:** each independently sends and receives, quotes/reacts, edits/rerolls,
   searches older messages, switches rooms and uses a group responder. Observe
   independent drafts, unread counts, notification navigation/clear and source/model
   choices. Stop/navigation/close must warn appropriately and discard late results
   without duplicate replies or lost accepted user messages. Check Instant/Natural/
   Manual; Natural silence can be valid. Normal automatic replies must not require
   unsolicited-background permission.
4. **Memory/presets:** in both scopes review summary Generate → Preview → Edit →
   Apply, covered-edit/reroll invalidation, Preview exclusions and Disable/Clear.
   Retain original history and versions; use isolated synthetic fixtures for the
   100-version limit rather than filling existing rooms. Publish a preset and apply
   its immutable revision explicitly; ensure the other user's library is unchanged.
5. **Schedules/recovery:** after explicit opt-in schedule one synthetic opportunity
   for each user, record occurrence/outcome and verify one delivery/notification.
   With approval, perform one controlled reload/restart, confirm no duplicate/reuse
   or cross-user outcome; do not revive terminal jobs or force an unexpected send.
   Real provider calls require a separately agreed small request budget; synthetic
   provider evidence here is not a live-provider pass.
6. **UI/native:** check agreed filters/header/menu/Details at 320/390 and 1070–1100px,
   keyboard focus, zoom, composer and old-history scrolling. Menu must be readable
   and unclipped with Pocket closed. Launcher and portal handoff must keep one Mochi
   session. Verify original Pocket Messages independently. Use synthetic screenshots.
7. **Decision record:** record host/candidate hashes, A/B profile separation, each
   gate/result, provider request count and backup verification. Any disclosure,
   data loss or unexpected delivery stops acceptance. User explicitly decides
   residual risk and whether to open a small invited group. No automatic release.

## Packaging, installation and recovery procedure

### Before any deployment or installed-file replacement

The intended beta host is chosen by the user; Ubuntu is off-limits to this agent.
Do not assume its running version/data root equals local main or fetched staging.
Publishing a frozen fork branch, installing/updating, host stop/start, copying data
and friend access each require separate approval. Do not change upstream/main,
Kitty's installed checkout or extension origin as a shortcut.

Operator procedure on the chosen host (not performed):

1. Confirm actual running host version and configured `DATA_DIR` and any external
   storage paths. Record current runtime pair/source, extension ID and data roots.
2. Cleanly stop that instance through its supported procedure, verify it is stopped
   and has no active extension writer. Do not copy a live SQLite file alone.
3. Make a dated, access-restricted complete backup of the configured data root and
   external roots, plus the installed runtime/source/manifest. Source inspection:
   `src/db/connection.ts` defaults to `DATA_DIR/lumiverse.db`; include any `-wal`,
   `-shm` or journal files present, never delete sidecars to simplify copying.
   `src/auth/provision.ts:getUserExtensionPath` places user extension data under
   `DATA_DIR/users/<real-user-id>/extensions/lumiphone`; shared extension storage
   is also under the data root. Copy the complete tree rather than selected room
   files, preserving profiles, histories, presets, memory, notifications, receipts,
   job tombstones/drafts, quotas, host connections and global discovery state.
4. Verify backup existence, file counts/sizes and a hash inventory while stopped;
   privately test readability. Keep it outside served extension paths and release
   archives. A path name alone or the ignored bundle snapshot is not a data backup.
   Do not print/copy production credentials into this development checkout.
5. After separate publication/installation approval, use the existing single
   `lumiphone` update workflow with the frozen source/manifest/pair together. If
   using the local archive, first review its extracted structure and supported
   host install route; it is not an automatic installer. Do not blindly reset an
   older locally modified repository or replace only one bundle. Preserve installed
   source before any replacement. Verify installed pair against the manifest.
6. Resume only after operator approval and verify loaded identity, storage and
   scheduler outcomes. Existing matching Windows disk files need no replacement
   merely to create a freeze commit. No install/update route was exercised here.

### Rollback constraints

Memory-v2 management is already implemented. After Disable/Clear, old MEM-01E/F
readers cannot read those rooms. **Never swap those older bundles over current
data, strip management metadata, or restore an old database over newer history.**

| Operation | Evidence / limitation |
|---|---|
| Reinstall exact frozen v2-aware pair over unchanged retained data | Source/schema compatibility and synthetic v1/v2 tests support it; installed restore still pending. |
| Runtime-only fallback to another reviewed v2-aware matching pair | Requires explicit compatibility/hash review and approval; preserve latest data. Not live-tested here. |
| Restore pre-test data over newer live data | Not safe: loses intervening messages/receipts and can replay jobs from old tombstones. Do not do this. |
| Inspect backup in separate offline recovery environment | Proposed recovery route only; no production credentials/providers connected. No automatic scheduler wake or message replay. Requires approval. |

Prefer stopping use and forward repair with current data plus a compatible runtime.
If recovering old data, preserve newer data separately and reconcile only through
a reviewed non-destructive procedure. No backup/restore/migration/reboot test was
performed, and successful package verification is not recovery acceptance.

## Delivery state and remaining risks

Release metadata changes: this dossier, `MOCHI-BETA-CANDIDATE.json`,
`MOCHI-BETA-PACKAGE.json`, `MOCHI-BETA-PREVIEW.md` and `ROADMAP.md`. Earlier reviewed
files are grouped in the two commits above. No unrelated source/data was added.
Final tracked/untracked state is checked after the metadata commit. Ignored local
preservation snapshots, verified package and rejected CRLF archive remain outside
Git intentionally. No source changes require another build.

Known auth limitation remains a general-beta privacy blocker. Actual separate-browser
isolation, loaded runtime identity, real providers, minimum-window menu/contrast,
memory recovery, native host behavior and stopped-data restore are unverified
release gates. These are limits of evidence, not invented confirmed regressions.
No confirmed release-blocking runtime defect required repair in this checkpoint.

Stop after preparation. No push, release tag/publication, install, deployment,
account/provider operation, staging switch, upstream update or friend access.
