# MOCHI-BETA-FIX-01/02 — Privacy, Memory Recovery & Critical UX Stabilization

2026-10-13. Starting branch `codex/mochi-desktop-01b-base-review`, HEAD `2db3fde858907137c90a8d0d2847f7cae7453481`, clean working tree. All work remained in the isolated review checkout. Original settings WIP, Pocket Power, Kitty's repositories/installed checkout, disposable host data and Ubuntu were untouched.

**Result: memory recovery and narrow UX fixes implemented and development-verified; beta remains blocked by trusted real-user lifecycle integration and actual-host acceptance.** No host source changes, new session owners, providers, polling, runtime workers, prompt features, publication, installation or live provider calls were introduced.

## BETA-FIX-01: verified missing host integration

Rechecked local Lumiverse `b1a68d9e32e2a2480a0d5ae71422566845f2657b` (tracked tree clean), installed `lumiverse-spindle-types` frontend declarations and current Pocket session source. There is still **no demonstrated supported principal-change signal** satisfying pre-display teardown. This part stopped at the approved host boundary; independently safe fixes continued.

- Spindle `dom.d.ts:SpindleFrontendContext` offers backend messaging, active-chat lookup, public state selectors and process lifecycle APIs; the inspected selector registry has no authenticated-principal projection. Backend/frontend process lifecycle is not the real-user authentication lifecycle.
- Host `frontend/src/store/slices/auth.ts:login/logout/checkSession` resets user-scoped host state. `checkSession` can replace A with B while authentication stays true; an established-session network error is intentionally not logout.
- `frontend/src/store/user-scoped-reset.ts` resets host store values but not retained extension modules. `hooks/useAppInit.ts` handles host bootstrap for identity changes, without an authoritative Mochi disposal boundary.
- `frontend/src/lib/spindle/loader.ts` can reuse an unchanged manifest's loaded module and transport. The extension unload/tab-abort route is not a demonstrated synchronous hook for every A→B transition. `ws/useWebSocket.ts` reconnect/role signals are not authenticated-principal evidence.
- `frontend/src/api/session-lifecycle.ts` emits `lumiverse:auth-session-invalid` for authoritative expiry, not every successful identity replacement.
- Pocket `src/mochi/session.ts:authenticatedIdentityChanged` remains an explicit working hook with no automatic host caller. Accounts-bank ownership is late defense; production `MochiRoom` and room-state DTOs still have no top-level real-owner field. No invented owner field or credential polling was added.
- Host `src/ws/handler.ts:SPINDLE_BACKEND_MSG` retains server-authenticated user scoping. The unresolved risk is retained private frontend content; tests do not demonstrate a cross-user backend read or a live leak.

### Minimal proposed host contract (not implemented)

Prefer host-owned extension-context disposal, with an optional official non-secret lifecycle callback, rather than teaching Mochi to inspect private authentication state:

1. Establish an authoritative real-user ID and frontend generation/epoch through the host. Before the host exposes logout or a different principal to extension UI/transport, revoke the old context's ability to render/send, synchronously dispose its extension surfaces/listeners/caches, and reject its delayed callbacks. Gate private surfaces during a known authentication transition; do not expose a replacement user while old surfaces remain interactive.
2. Wire this boundary for login/logout, successful A→B `checkSession`, authoritative expiry and frontend unload. It must cover retained module instances as well as newly mounted ones. Server-delivered asynchronous events/responses must target the correct principal and context generation.
3. Create a fresh Spindle context/session only after B is established. Do not reuse A's transport functions/listener set. Same-user reconnect can retain drafts if identity/epoch are still valid; outage, RP change and fictional-profile change alone must not invalidate identity.
4. If an official callback is provided, invoke the existing session teardown through it before replacement, and unsubscribe on disposal. It must be a host-authoritative API, not an untrusted DOM/user-ID payload. A response owner envelope is additional defense only.

Approval required: a **separate Lumiverse host integration checkpoint**, with explicit permission to modify host authentication/loader/bridge APIs and coordinate upstream compatibility. That approval is absent here. No browser-reload workaround is called a privacy solution. Real host acceptance must validate the order of disposal, transport rebinding and delayed delivery, not merely assert that the callback exists.

### Identity-transition evidence

Production-shaped owner-less fixtures now separately cover explicit logout (metadata abort and delayed-response exclusion), explicit A→B teardown, expiry, trusted same-user notification, network error, principal-less reconnect and fictional-account DTOs. The retained-context silent-switch test remains named **KNOWN RELEASE GAP**. Its green assertion confirms missing enforcement, not a privacy fix. Existing session/window/sidebar tests verify one listener/view/toast/read owner and explicit cache teardown. No actual-host login, logout, cookie/token handling or multi-user acceptance was performed.

## BETA-FIX-02: bounded memory management

Policy: a **single optional revisioned management slot**, not more summary versions. Disable/Clear now preserve the saved version array and `currentId`; they set active memory disabled, with Clear also removing text/coverage/exclusion from the *effective* summary. Original text, digests, messages and all retained versions remain stored. Clear after Disable updates this slot; repeated effective Disable/Clear is a no-op. No automatic eviction, compaction or export was added.

`memory.ts:currentSummary` applies the management overlay for context resolution and display. Prompt Preview, macros, verified-history exclusion and optional summary reference all use this effective state. `summarization.ts:summaryConfiguration` includes management state so an earlier AI suggestion cannot bypass Disable/Clear even when the saved version ID stays unchanged. New Save or Restore below capacity creates its ordinary immutable version and resets the management override explicitly.

| Operation | At 99 versions | At 100 versions / full receipts |
|---|---|---|
| Save | Appends version 100 if receipts allow; validates coverage/options/suggestion proof. | Refused with actionable limit message. |
| Restore | Appends a reviewed copy if version and receipt capacity allow; old proof is not repaired silently. | Refused; retained versions remain readable. |
| Disable | Disables effective memory using the bounded slot; no new version. | Remains possible; no history/receipt eviction. |
| Clear | Clears effective memory using the bounded slot; no new version. | Remains possible; saved versions/messages retained. |
| Repeated Disable/Clear | No effective change means no write, revision bump or cancellation. | Same no-op behavior. |

Ownership, account/association scope, confirmation, room lock, expected revision and temporary-write→atomic-move checks remain in place. A real management change uses the existing active-generation abort and pending-job cancellation path; invalid/no-op/replayed requests do not launch providers or new jobs. Successful management writes invalidate prior context tickets through room/config checks. Failed writes preserve committed room data; the user must retry explicitly.

Receipts remain capped at 10,000. Management appends its receipt when space exists; at capacity, the bounded slot records the latest request ID, original revision and action. An exact latest recovery replay is idempotent. Older recovery replay is either already receipted (no mutation) or stale-revision rejected; it cannot revert newer state. No unlimited recovery receipt/version log is introduced. Future history management/export is required for further Save/Restore after capacity; this checkpoint does not pretend it exists.

### Versioning and rollback safety

Legacy memory v1 is read unchanged and never migrated on load. **Only an explicit Disable/Clear write creates memory v2**, containing validated management metadata. The outer room schema remains v1. Ordinary Save/Restore constructs a v1 memory object after explicitly replacing effective memory. The existing memory v1 reader rejects v2 instead of silently ignoring a disabled/cleared state. The new reader rejects a management field disguised as v1 and malformed v2 metadata.

This is a minimal, justified versioned representation change to fix the demonstrated data-safety/control defect. Older MEM-E/F bundles cannot read rooms with memory v2: they preserve files and report unsupported memory, rather than reactivate summaries. Therefore **do not downgrade a managed room to old bundles, strip its metadata or restore an old database over newer history**. Recovery requires a matching v2-aware runtime or a separately reviewed non-destructive compatibility tool. Runtime backups are useful only with this limitation understood; no rollback/recovery was performed.

## Critical UX changes

- User-triggered floating-window × and title-bar Escape warn before stopping an owned reply/summary; Stay leaves the task/draft intact. Confirmed exit uses existing cancellation. Programmatic hide, auth disposal and host-forced teardown remain unconditional; this patch cannot intercept an unsupported external host hide.
- Room list/inbox/selector and applicable account/notification navigation warn where the underlying action actually cancels work. The selector restores the saved selection while awaiting confirmation. Opening tools that reset a running summary gives a summary-specific warning; ordinary tool browsing does not falsely warn about stopping an unrelated reply.
- Memory Close explains cancellation of a running summary and preserves saved data. Generation warnings distinguish session-retained drafts from restart persistence and state that scheduled jobs are independent.
- Staged versus immediate settings are explained accurately: selected modes determine automatic replies; legacy Existing behavior uses the checkbox; normal automatic replies do not require idle autonomy. AI timing/status suggestions require Save; real-login/room background permissions, presence and schedule actions apply now.
- Permission labels explicitly name “This Lumiverse login” and “This conversation”; fictional-profile editor explains its separate identity/saved scope. Existing opt-ins, defaults and dispatch endpoints are unchanged.
- Preset help explains Publish versus Apply without renaming operations. Memory help distinguishes suggestion/editing from saving, no-op feedback from a new version, and retained saved versions from effective Clear. Capacity feedback disables new Save/Restore, while confirmed Disable/Clear remain reachable outside an editor draft. Existing unsaved drafts/suggestions are preserved.

No broad settings reorganization, colors/themes, desktop redesign or prompt wording change was made. An audit inventory typo was corrected: the actual floating-shortcut module is `launcher.ts`, not `app-shortcut.ts`.

## Targeted sequential verification

Final successful selections (one command at a time):

| Files | Tests / assertions |
|---|---|
| `mochi-beta-readiness`, `mochi-memory`, `mochi-summarization` | 74 / 725 |
| `mochi-beta-ux`, `mochi-window`, `mochi-session`, `mochi-desktop-layout`, `mochi-sidebar` | 45 / 373 |
| `mochi-context`, `mochi-presets`, `mochi-macros` | 51 / 346 |
| `mochi-accounts`, `mochi-assignment`, `mochi-auto-replies`, `mochi-scheduling-lifecycle`, `mochi` | 111 / 837 |
| `mochi-replies`, `mochi-reactions`, `mochi-pins`, `mochi-search`, `mochi-texting` | 56 / 407 |

**337 distinct targeted tests passed, 2,688 assertions, 21 files, zero final failures.** After the final no-op status wording adjustment, the overlapping UX/summarization selection was rerun: 38 passed / 314 assertions; do not double-count it in the total.

Coverage includes legacy/fictional rooms, 99/100 versions and full receipts, Disable/Clear, rejected Save/Restore, wrong owner/account/association/revision, request replay, interrupted replacement, no-op behavior, history/digest retention, context exclusion/preview, stale suggestions, scheduled draft cancellation, providers ignoring abort, notification actions, modes, quotes/reactions/pins/notes/search/texting and DOM/focus/draft behavior at 320/390/900.

Development iterations corrected test-harness mistakes (wrong preview API, absent navigation callback) and updated expected version counts because management no longer appends versions. New UX tests capture uncaught JSDOM errors, preventing a misleading green result. Two pre-existing `mochi.test.ts` assertions expected “invalid message JSON”; source comparison against the starting commit confirmed unchanged generation code already reported empty versus malformed responses. Assertions now match those existing classifications; data-preservation and no-retry checks remain. No visual baseline was replaced.

- One `bun run typecheck`: passed.
- One `bun run build`: passed, backend then frontend sequentially.
- Built-marker checks: management validation, recovery errors/config state and cancellation/scope/retention wording present. These are bundle-content checks, not compiled end-to-end execution.
- Frontend SHA-256: `1D112A107176EBB01A04D5B5BE14B900C2BFA49C9CC8E15DF61F91053A2CCE92`.
- Backend SHA-256: `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B`.
- Previous matching F bundles copied byte-for-byte to ignored `tmp/beta-fix-01-02-before-bundles/`; existing 01C/MEM backups untouched. The source/bundle checkpoint is pinned by the updated candidate inventory.

Tests use synthetic providers, in-memory storage and JSDOM. No full Pocket suite, Chromium, visual baseline, live tokenizer/provider, reboot/power-loss, actual host focus/drag or multi-user test was run. Source-scoped changes and existing Mochi/native-routing contracts support compatibility, not fresh live native Pocket acceptance.

## Changed files

- Runtime: `src/mochi/memory.ts`, `service.ts`, `summarization.ts`, `memory-panel.ts`, `view.ts`, `window.ts`, `profile-screen.ts`, `preset-panel.ts`.
- Tests: `tests/mochi-beta-readiness.test.ts`, `mochi-memory.test.ts`, `mochi-summarization.test.ts`, `mochi-window.test.ts`, `mochi.test.ts`; new `mochi-beta-ux.test.ts`.
- Matching artifacts: `dist/backend.js`, `dist/frontend.js`.
- Documentation/inventory: this report, `MOCHI-BETA-CANDIDATE.json`, `ROADMAP.md`, `MOCHI-UI-UX-AUDIT.md`.

`src/backend.ts`, `src/frontend.ts`, native Pocket controller/modules, `session.ts`, manifest, extension permissions and generation parser were not edited. No credentials or private fixtures were added. No installed data was inspected or changed.

## Release status and focused manual acceptance (not executed)

Auth integration **blocked**; memory-capacity blocker **development-fixed, live acceptance pending**; UX fixes **development-tested, pixel/focus acceptance pending**. Candidate remains non-releasable. E/F's superficial acceptance has not been upgraded to comprehensive acceptance.

After separate authorization for a controlled test-instance update, install both matching bundles/source together, not a duplicate `lumiphone`. Keep current synthetic data and make a host-supported backup first; do not copy production data or overwrite installed Kitty source. Verify:

1. Legacy and fictional rooms: Disable/Clear preserve messages and saved versions; Preview omits disabled/cleared memory and restores raw history within budgets. At capacity, Save/Restore refusal is clear; management remains possible. Inspect v2 compatibility before choosing any rollback.
2. Reply and summary generation: ×/Escape, room/inbox/selector changes, notifications and summary-tool exits show the right warning. Stay preserves work; confirmed exit stops only interactive work. Confirm composer/settings/suggestion drafts, schedules and notification records survive expected in-session navigation.
3. Settings: login-wide and conversation permissions apply immediately; AI timing/texting/instructions remain staged until Save. Verify Natural silence/delay, Instant eligibility and Manual Continue without enabling idle autonomy.
4. Desktop/narrow 320/390/900, zoom, keyboard/focus return, dialog placement and long names: no new overlap or unintended loss of selection. Verify single session, Pocket portal/sidebar/shortcut separation and native Messages independently.
5. Only after the missing host contract is implemented and approved, test real-user logout, silent A→B, expiry, same-user reconnect/outage and delayed responses. Do not claim current explicit-hook simulation proves automatic privacy safety.

Stop here. No clocks, AI creation, RP linking, UI modernization, beta publication or friend onboarding started.
