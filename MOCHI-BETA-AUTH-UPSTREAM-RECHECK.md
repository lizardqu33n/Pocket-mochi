# MOCHI-BETA-AUTH-UPSTREAM-RECHECK

2026-10-14, America/Chicago. Source/release investigation only. Read alongside `MOCHI-MEM-01G.md`, `MOCHI-BETA-FIX-01-02.md`, `MOCHI-BETA-AUTH-INVESTIGATION.md` and the current blocked candidate inventory.

**Result: the authentication privacy blocker remains in all three inspected source snapshots.** Stable main is unchanged. New staging improves other runtime behavior but does not supply the missing trusted real-user teardown boundary. The identified error-fix release is **Lumi Desktop / Lumiverse Desktop v0.3.1**, a desktop companion release whose specific fix concerns Linux AppImage permissions, not Mochi authentication. Prefer an official general host lifecycle fix; switching versions alone is not that fix.

## 1. Exact versions, refs and environment boundaries

| Snapshot | Exact commit | Version / relationship |
|---|---|---|
| Windows local main | `b1a68d9e32e2a2480a0d5ae71422566845f2657b` | Host backend/frontend `1.2.5`; Spindle dependency `0.6.40`. |
| Current remote main, also tag v1.2.5 | `b1a68d9e32e2a2480a0d5ae71422566845f2657b` | Same as local main; no newer stable-main source to adopt. |
| Current remote staging | `8cbd8db606baa60993af4a53c56a027c69dee8e2` | Backend/frontend package version still `1.2.5`; Spindle dependency `0.6.46`. Main is its ancestor. Version text alone does not identify this newer source. |
| desktop-v0.3.1 tag | `d31ff89d03956176dadb71117af9c3ee4d38c1ce` | Native desktop version `0.3.1`; host source at this tag still says `1.2.5`, types `0.6.46`. Ancestor of current staging, two commits behind it. |

Public remote advertised only `main` and `staging` branch heads; no additional auth-specific branch head was available to select. Ref discovery included tags, but only these three relevant snapshots were fetched, without tags/submodules/history from unrelated branches:

- `refs/remotes/auth-review/main-20261014`
- `refs/remotes/auth-review/staging-20261014`
- `refs/remotes/auth-review/desktop-v0.3.1-20261014`

Fetch did not update the checked-out `main` branch, working files, installed runtime or `FETCH_HEAD`. Git also automatically advanced the configured tracking ref `origin/staging` from `ac1e8e84` to `8cbd8db6`; this was metadata only, not a branch switch. A subsequent isolated fetch should use an empty refmap to avoid that automatic tracking-ref mapping. No refs were force-updated or restored by this investigation.

Paths inspected:

- Windows source/launcher inputs: `<lumiverse-host-checkout>` and its public source/build metadata. Current branch remains `main`, tracked tree clean.
- Mochi review: `<mochi-review-checkout>`, branch `codex/mochi-desktop-01b-base-review`, HEAD `c3e036d02f500bfd00c2c6326d1245ee63353714`. The existing uncommitted authentication investigation report is preserved.
- Existing disposable launcher uses this local root's backend source and `frontend/dist`, with separate data/port. Neither the launcher nor test data was changed or launched.

Local host main frontend build ID remains `lumiverse-1791573069267`. Staging's checked-in frontend is `lumiverse-1791884693871` with `main-HlHFZe7G.js` and `global-NEjMjr2U.js`. These identify repository build inputs, not proof of a presently running process/browser cache. Ubuntu staging is user-reported; its exact installed commit was not inspected and must not be assumed equal to the fetched head. Installing/updating the desktop companion does not update the separate Bun server checkout.

Configuration risks were identified through Git ignore rules/status only: `.env`, `data/`, `node_modules/`, SQLite/WAL files and `.tmp/` are ignored; the three nested Pocket checkouts are untracked in the host repository. None may be cleaned/discarded during a switch. No private configuration, databases, accounts, credentials, cookies, tokens or RP records were opened.

## 2. Lumi Desktop v0.3.1 — what the release actually fixes

The official [Lumiverse Desktop v0.3.1 release](https://github.com/prolix-oc/Lumiverse/releases/tag/desktop-v0.3.1), published October 13 at 6:22 p.m. CDT, identifies `d31ff89d` as its build commit. Public release notes were read through GitHub's release API; no installer was downloaded.

The release repairs Linux AppImage launcher/AppDir execution permissions and packaging checks. Its notes distinguish the standalone desktop companion from a local Lumiverse server: local serving still needs Bun and a separate checkout. Windows/macOS installers are available too, but the stated error fix is not a user-identity lifecycle fix.

Source evidence: `e2cf9aaec76b5d0541127de89ea081a356388926` changes desktop version/package/Cargo metadata and `.github/workflows/desktop-build.yml`; `d31ff89d03956176dadb71117af9c3ee4d38c1ce` changes that packaging workflow and desktop README. The tag includes intervening staging improvements, but its authentication behavior still lacks the required contract. **Classification: release-specific fix unrelated to the blocker; relevant auth safety unverified live and not implemented in inspected source.**

## 3. Authentication and extension lifecycle comparison

Source paths below are relative to the host root. Compared actual branch/tag blobs, not version labels or only changelogs.

| File / mechanism | Main → staging evidence | Safety classification |
|---|---|---|
| `store/slices/auth.ts:login/logout/checkSession` | No changes. Same successful A→B publication/reset path and no pre-transition extension disposal. | Missing contract remains. |
| `store/user-scoped-reset.ts` | No changes; still resets host state rather than retained extension modules. | Missing contract remains. |
| `lib/spindle/frontend-extension-cleanup.ts` | No changes; idempotent disposal machinery exists but auth invocation is still missing. | Existing useful infrastructure, not a new fix. |
| `lib/spindle/extension-load-flight.ts` | No changes; shared load promise remains unkeyed to real-user identity. | Stale hydration risk remains. |
| `lib/spindle/loader.ts` | Adds file downloads, system-audio API/capabilities and permission revocation for audio. Existing identity-free manifest reuse/generation guards and active-tab-abort unload remain. | Confirmed additive APIs; unrelated to real-user cache teardown. |
| `store/slices/spindle.ts:loadExtensions` | Captures a user ID to clear system-audio consent. Does not compare that identity after list/manifest awaits or key shared load flights by identity. | Consent scoping is real but **not** an extension hydration auth barrier. |
| `hooks/useAppInit.ts` | Adds decision-connection bootstrap/fallbacks with existing `isCurrent` checks. | Existing bootstrap race protection preserved; no general extension principal lifecycle fix. |
| `ws/useWebSocket.ts` | Adds decision/deletion/gallery events and reconnect notifications; principal-change handling is not added. | Unrelated to missing auth ordering. |
| `ws/useDesktopWidgetRuntime.ts`, `lib/frontend-session.ts`, `ws/client.ts` | No changes. Document ID is not a real-user epoch; native pop-out lifecycle remains target-bound. | Missing general identity boundary remains. |
| `api/session-lifecycle.ts`, `components/auth/AuthGuard.tsx` | No changes; expiry event remains limited to authoritative SESSION_EXPIRED and session recheck. | Existing partial expiry protection, not all A→B changes. |
| `components/auth/ActiveTabGuard.tsx`, `App.tsx` | Wallpaper, audio-source installation and dock-reservation changes; user-ID ready guard still supplies temporary main-app unmount. | Existing partial UI protection; still not loader/cache disposal. |
| `lib/spindle/state-selectors.ts`, `lib/active-tab.ts` | No changes. No newly implemented principal selector/transition signal found. | Missing supported automatic signal remains. |
| `src/auth/*`, `src/ws/handler.ts`, `src/spindle/frontend-session.ts`, `src/spindle/worker-host-storage-api.ts` | No changes in these compared paths. | Existing server user/session scoping and file storage remain; no new browser private-cache guarantee. |

The desktop tag and staging head have identical versions of the key auth/loader/spindle/WebSocket paths compared above. The two commits after the desktop tag change preset bindings and MCP/native generation functionality, not authentication teardown.

No auth epoch tied to real-user replacement, automatic pre-B extension disposal, identity-keyed loader startup queues, or trustworthy extension principal subscription was found. `onTeardown` remains an actual supported disposal hook, but still is not an automatically invoked authentication signal. The previous proposed host fix therefore remains applicable. This conclusion is **confirmed missing integration in inspected source**, not a live privacy reproduction or proof that every runtime surface leaks.

The installed declarations remain 0.6.40/0.6.32 locally; 0.6.46 was not installed. Staging's source shows its new additions and unchanged auth paths. A types upgrade alone cannot establish a host lifecycle guarantee that those paths do not implement.

## 4. Staging benefits and compatibility risks

Relevant official updates include:

- `ab220481996cbe04e2fd4b9388ab8b0ec338905a`: substantial SQLite execution/service rewrite, new execution subprocess/transport/diagnostics and tests, intended to avoid write locks/main-process blocking. Do not claim this proves a fix for the user's intermittent Pocket freezes; that investigation remains on hold.
- `6ca15e3ee0281a1376a9ffb84e77bc0e54247408`: atomic tokenizer seeding before other DB work. Useful startup reliability, unrelated to real-user caches.
- Spindle file transfer/download, system audio, decisions, generation diagnostics and scoped worker adapters; package dependencies advance from 0.6.40 to 0.6.46. New optional facilities do not justify new Mochi permissions or features.
- Host `App.tsx` now passes `respectRequestedEdge` to dock-reservation calculations. This is relevant to Pocket's existing left-handset request and host layout correctness; it does not change Mochi's authoritative session owner.
- `b2cb026906cff79a878a3d1f5137924e960f838e`: protects preset bindings from `forcePresetId` clobbering; touches native generation UI/prompt binding paths.
- `8cbd8db606baa60993af4a53c56a027c69dee8e2`: separates MCP tools from Council and adds macros. No Council/MCP/RP-context feature is being added to Mochi by this audit.

Source inspection found no removal of Mochi's essential `userStorage`, tokens, character/persona/connection and quiet-generation transport paths, and user-scoped storage implementation is unchanged. However, the broad async database/service rewrite and shared generation changes require focused runtime/provider-adapter regression; absence of a named API removal is not full compatibility acceptance. Check owned source refresh/model lookup, native Pocket phone setup/messages, independent Mochi quiet calls, preview token counts, scheduler restarts and notifications before claiming compatibility.

Important artifact provenance: staging's latest commit touching `frontend/dist` is **`03a1d49931f2c47310b6eff53f913a2ae796e72f`**, earlier than current head `8cbd8db6`. Frontend source changed after that commit (including native generation/preset UI). Thus staging's tracked prebuilt frontend is not verified to contain all current source changes. A faithful latest-source Windows test should prepare a matching frontend build in an isolated checkout, after approval; simply switching branches and serving old checked-in assets is inadequate for a source-level acceptance claim. No build was run here.

## 5. Migration and rollback constraints

New migration files compared with main:

- `124_decision_connections.sql`: decision connection table/indexes.
- `125_deletion_operations.sql`: user-scoped deletion-operation records.
- `126_image_references.sql`: derived reverse-image references, dirty/backfill state, indexes and triggers. Its DELETE statements maintain derived reference rows; the inspected migration does not itself delete original chat histories.

`src/db/migrate.ts` includes these in the baseline list; database execution/maintenance/service behavior also changes. No destructive drop/rewrite of original history was found in these added migrations, but **downgrade compatibility is not verified**. New deletion services and index backfill are substantive behavior changes, not mere package metadata. Do not boot staging against the regular or existing disposable database and then assume old main can safely reopen it.

Use fresh synthetic data first. Keep original data untouched. For any later explicitly approved reuse, stop its host and use a complete consistent backup of the data/runtime pair, including extension storage and database sidecars where applicable. Backups are future actions, not performed here. Never restore a pre-test backup over newer user histories or reuse a partially migrated database with old binaries. Mochi memory-v2 rollback constraints from BETA-FIX-02 also continue to apply independently of host migrations.

## 6. Options and recommendation

| Option | Advantages | Limits / recommendation |
|---|---|---|
| A. Keep Windows main | Known 1.2.5 inputs, dependencies and existing disposable test setup preserved. | Privacy blocker remains. Safe to keep while designing the lifecycle fix; no current official main fix to adopt. |
| B. Separate newest staging test host | Same branch family as the user's Ubuntu host; newer DB/Spindle/docking reliability improvements. | Exact Ubuntu revision is unknown. Requires separate dependencies, matching frontend, fresh data and compatibility checks; **recommended next preparation**, not an auth fix or authorized launch. |
| C. Lumi Desktop v0.3.1 | Official companion packaging fixes; available Windows installers too. | Does not update the Bun server or implement the missing contract. Do not install it as a proposed Mochi privacy fix. |
| D. Minimal general host lifecycle patch | Addresses the confirmed missing invariant using existing loader cleanup. | Still required unless a later official upstream fix appears. Needs separate host-edit/test/build approval and maintainer coordination. Prefer proposing it upstream rather than maintaining an opaque Mochi workaround. |

Recommendation: **do not switch the existing Windows checkout during this checkpoint.** Prepare a pinned isolated staging worktree and fresh synthetic test data only after review. Verify its compatibility, then target any necessary host lifecycle work at a pinned official source with the unchanged invariant. A staging switch alone must not unblock Beta 1. No Pocket upstream changes were fetched or incorporated here.

## 7. Exact safe Windows preparation plan — not executed

1. Recheck host branch/commit/tracked state and preserve existing reports/workspaces. Do not read `.env`, change repository remotes, delete ignored paths or run setup against default data. Record main `b1a68d9…` and verified Mochi runtime checkpoint/bundle hashes.
2. Use an ignored host-root scratch tree rather than replacing main. Proposed source: `<lumiverse-host-checkout>/.tmp/lumi-staging-auth-20261014/source`. Under separate approval, `git worktree add --detach <that-path> 8cbd8db606baa60993af4a53c56a027c69dee8e2` creates the pinned snapshot without advancing main/staging. A detached worktree is for official-source testing; a later approved patch should use a separate `codex/` branch.
3. Install that snapshot's locked backend dependencies sequentially, without borrowing main's 0.6.40 modules. For a matching host frontend, install its locked frontend dependencies separately and run at most the separately approved build/check sequence. Do not copy the current main frontend into staging. No Tauri/Cargo installer build is needed for browser-based authentication diagnostics.
4. Prepare a new launcher (leave the old launcher unchanged) with explicit source/frontend paths, a fresh cleared child environment, `--no-env-file`, isolated cache, fresh data `.../.tmp/lumi-staging-auth-20261014/data` and a distinct port such as 7862. Verify the port is free; never terminate an unrelated process. Do not launch automatically. Original regular and disposable data/configuration remain untouched.
5. Use a separate unsynced browser profile, since ports do not isolate authentication cookies. Create fresh test-only users and synthetic providers; do not import production accounts, histories, credentials or queued provider jobs. Existing disposable accounts/rooms remain in their original instance.
6. After separate installation/launch approval, install exactly one `lumiphone` with both matching approved Mochi bundles/source. Do not modify Kitty's installed extension or install a duplicate in the existing instance. Ensure the test process cannot select Ubuntu as a target; the companion's saved instance selection is not part of this plan.
7. Check supported backup/stop behavior before migration testing. A complete offline backup of existing test extension files/data may be prepared later with approval without exposing its contents; it is not needed to boot a fresh-data instance. Avoid opaque cloning of active provider connections/background jobs into a host that might run them unexpectedly.
8. Rollback: stop only the newly launched test child; return to the unchanged main/original disposable launcher and original data. Retain the staging worktree/data for diagnosis. Never point old main at migrated staging data, downgrade Mochi's managed-memory rooms to v1-only bundles, or recursively delete anything as cleanup. No rollback operations are needed or executed now.

If a later migration audit demonstrates destructive conversion or unsafe compatibility, stop before booting a reused database and review it separately. No dependency install, worktree creation, migration, rebuild, branch switch or backup happened in this recheck.

## 8. Remaining host patch and focused acceptance

The previous general-host proposal remains necessary: trusted principal/epoch barrier before logout/A→B publication; revoke old extension generations and remove surfaces/caches before B is usable; bind pending list/manifest/setup/startup queues to the epoch; rebind old WebSocket/pop-out transports; fresh setup for B. Same-user reconnect/outage/RP/profile changes must remain distinct. Reuse current `onTeardown`/returned setup cleanup; do not add polling, owner-less DTO assumptions, late owner responses or manual browser reload as the security boundary.

Proposed first tests after approval: auth publication ordering, delayed list/manifest/setup, throwing cleanup, old transport sends and responses, unchanged-manifest A→B, logout/expiry, same-user reconnect/outage, fictional profiles, main versus native pop-out, and removal of all old windows/sidebar/editor/toast content. Then controlled synthetic Windows acceptance with fake delayed providers and account-isolated schedules/notifications; no private prompt logs. Re-run narrow Mochi/native Pocket contracts against the selected new host before any live provider test. No tests or actual-host acceptance ran here.

## 9. Delivery state

Only this report was added in the Mochi review checkout; the previous investigation report remains uncommitted and preserved. Host main/files, Mochi commits/runtime bundles, original WIP, Power, Kitty's installation and all data/backups remain unchanged. Fetch/release-note inspection was authorized and limited to Lumiverse. The failed sandbox network attempt was retried with the tool's required network approval; no credentials were printed.

`MOCHI-BETA-CANDIDATE.json` is unchanged: **blocked**, `releaseReady: false`, `multiUserReady: false`. Investigation and unrelated release fixes do not justify changing that status. Stop for review; no custom patch, switch, installation, deployment, host launch or beta publication performed.
