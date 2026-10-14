# MOCHI-MEM-01G — Integration, Privacy & Beta Readiness

Assessment date: 2026-10-13. Branch: `codex/mochi-desktop-01b-base-review`.
Runtime/source candidate: `db5bbba9b8efb4d5a389fa97c0028852272523ef` (MEM-01F).
Inspected local Lumiverse source: `b1a68d9e32e2a2480a0d5ae71422566845f2657b`, clean tracked working tree. This is local source evidence, not evidence about the installed Ubuntu runtime.

**Disposition: assessment complete; multi-user beta release blocked.** E/F have the user's superficial manual acceptance, not comprehensive live acceptance. This checkpoint adds evidence tests and documentation only. No runtime, UI, persistence schema, host code or provider behavior was changed. No push, installation, browser, host startup or deployment occurred.

## Confirmed gaps and required decisions

### 1. Silent authenticated-user transition: release blocker

`src/mochi/session.ts` has one transport listener, one view and one surface lease. Its `authenticatedIdentityChanged` hook tears down caches, listeners and metadata requests when explicitly invoked with a different real user or null. The authoritative `lumiverse:auth-session-invalid` event also tears down the session. Those mechanisms work in simulation.

However, Pocket does not call `authenticatedIdentityChanged`. The fallback observer recognizes `mochi:accounts.state.ownerId`, but scans top-level `room.ownerId` in `mochi:state`; `src/mochi/types.ts:MochiRoom` does not contain that field and `service.ts:state` does not add it. Room-state refresh is therefore not an authenticated identity boundary. A response carrying a different accounts-bank owner can eventually destroy the old view; it does not guarantee teardown before cached content is shown.

Actual inspected host paths:

- `frontend/src/store/slices/auth.ts:login/logout/checkSession` reset host user state. `checkSession` can replace user A with B while authentication remains true. Network errors during an established session are deliberately distinguished from logout.
- `frontend/src/store/user-scoped-reset.ts:resetUserScopedStoreState` resets host store state, not extension module caches.
- `frontend/src/hooks/useAppInit.ts` watches user identity for host bootstrap, but does not itself dispose Mochi.
- `frontend/src/ws/useWebSocket.ts` websocket lifecycle effect depends on authentication state/store; it is not a general extension user-ID teardown contract.
- `frontend/src/lib/spindle/loader.ts:loadFrontendExtension` reuses an existing extension with an unchanged manifest signature. `unloadAllFrontendExtensions` is tied to frontend/tab disposal, not a guaranteed silent-user-change callback to Pocket.
- `frontend/src/lib/spindle/state-selectors.ts` exposes no supported authenticated-principal selector. `frontend/src/api/session-lifecycle.ts` emits the expired-session event for an authoritative session-expiry result, not every successful A→B identity change.
- `src/ws/handler.ts:SPINDLE_BACKEND_MSG` uses the server-authenticated websocket user and extension-access checks. Payload user IDs do not authorize backend reads.

`tests/mochi-beta-readiness.test.ts` reproduces the **conditional retained-context gap** using production-shaped owner-less rooms. An old synthetic session fixture has a top-level `ownerId` not present in production rooms; passing that fixture alone did not resolve this gap. New tests explicitly distinguish a working teardown hook from missing automatic invocation. They do not reproduce a live host privacy leak or prove cross-user backend access.

Smallest reliable next checkpoint: obtain/integrate a supported, trusted host principal-change lifecycle boundary. Dispose the old extension/session before any private render or newly authenticated transport use; start a fresh context for B. Test logout, silent A→B, same-user reconnect and outages separately. Never infer logout from an RP/profile switch or a temporary network failure. Adding an owner envelope to responses is useful defense in depth but cannot clear cached content before a response arrives. Do not poll credentials, import private host internals or treat an owner-less room as safe identity evidence.

Until resolved: no multi-real-user beta approval. Any separately approved diagnostic candidate must use disposable synthetic accounts, separate browser profiles/full frontend reload on real-user changes, and clearly disclose the limitation. This precaution is not a substitute for the missing lifecycle contract.

### 2. Memory capacity prevents management actions

`service.ts:saveMemory` checks `MAX_SUMMARY_VERSIONS` before branching into Save, Restore, Disable or Clear. At 100 versions, even Disable and Clear are refused. Histories and existing versions survive; this is a confirmed recovery/control limitation rather than deletion. The strengthened memory regression records this behavior explicitly. Similarly, the 10,000-receipt safety limit rejects further mutations without pruning records.

Before wider beta: agree on a non-destructive capacity policy that keeps disabling memory possible without silently evicting versions or bypassing concurrency checks. A reserved management allowance or separately versioned enabled state needs focused design/testing. No schema change or capacity increase was improvised here. The 256 summary-attempt limit per real user/backend session is also bounded and non-evicting; the UI must explain refusal rather than promise automatic retry.

### 3. Safety-related UI clarity

Hiding/leaving a surface cancels interactive replies and summary work while retaining in-session drafts; durable scheduled jobs are independent. The generic navigation/hide wording does not explain this consistently. The background section says controls apply immediately although AI timing suggestions are staged in the room-settings draft. Real Lumiverse account-wide permissions are also presented inside room settings with ambiguous “my account” wording. These are source-confirmed clarity problems, not proof of observed user data loss. See the linked audit for narrow pre-beta proposals. No settings defaults or permissions changed.

## Storage, lifecycle and context assessment

| Area | Evidence and outcome | Limit of evidence |
|---|---|---|
| Real/fictional ownership | `service.ts:read/readStored`, `accounts.ts`, `presets.ts`; wrong user/account/room and forged payload tests reject; reassignment preserves association revision/history/jobs. | Simulated users and storage, not simultaneous live logins. |
| Persistence/interruption | Room/account/preset writes use `.pending` then user-scoped move. Injected write/rename failures preserve previously committed records; abandoned pending records are not silently promoted. Invalid/newer records produce warnings and preserve files. | Actual host `src/spindle/worker-host-storage-api.ts:handleUserStorageMove` validates user paths then `renameSync`s. No crash/power-loss/fsync durability test or automatic backup recovery is claimed. |
| Stop/navigation/stale results | Shared owner, abort controller, revision/association/source checks reject late output even when the simulated provider ignores abort. Hide stops interactive work, not durable jobs; explicit auth teardown clears private frontend state. | Silent auth invocation remains unresolved; actual focus/window/logout behavior needs host acceptance. |
| Exactly-once scheduling | BUG-02/03 tests preserve ordinary auto replies independently of idle autonomy, no-op settings saves, terminal summaries, distinct occurrences, persisted drafts and restart retries. | Simulated restart/time/provider. Identical independent provider text is not deduplicated by content. |
| Context/presets/macros | Golden provider-message comparisons, owned immutable preset bindings, bounded macro placement and room-only resolver. No active RP history, story clocks or actor memories are introduced. | Golden fixtures are not live provider acceptance. Publishing a preset is distinct from binding it to a room. |
| Memory/history | SHA-256 proof covers exact ordered prefix and relevant edit/reroll metadata. Invalid summary proof omits memory and prevents covered-prefix exclusion; raw history still uses the room token budget. Search/pins/quotes retain original stored messages. | Manual summaries are user-reviewed recollections, not guaranteed factual truth. Summaries and token trimming never delete stored history. |
| AI summary errors/budgets | One explicit request, shared room ownership/quota reservation, timeout cancellation, no automatic provider retry. At most 1,000 input messages/200,000 characters; input budget bounded by room and 16,384 tokens, output by room and 1,600, with 256-token reserve. Oversized/unavailable inputs fail rather than silently clipping summary coverage. | Tokenizers/providers simulated. Request charges may occur even if cancellation prevents saving. |
| Summary Apply/recovery | Generate returns a suggestion; Use/Edit/Apply/confirmation controls saving. Apply revalidates source/config/coverage and idempotent receipts. Restart expires transient suggestion authority; saved memory survives. Editable text can be explicitly reviewed as manual data, never silently reauthorized. | Unsent frontend drafts are in-session only. Restart persistence remains deferred to a supported host setting/API. |
| Notifications | Read, dismiss and clear act on notification records; unread count ignores read history; late events/revisions cannot revive dismissed items. Room messages and foreign scopes remain intact. | Preview privacy suppresses body text, not necessarily character/room names. Live push/browser behavior untested. |
| Native Pocket | No production source changes in G; previous native controllers, prompt behavior and phone storage remain untouched. | No fresh full native Pocket suite or live RP test was run. |

## Sequential targeted verification

All tests use distinguishable synthetic content, providers and disposable in-memory storage/JSDOM. No real credentials, private accounts, RP histories or installed data were inspected.

| Command selection | Result |
|---|---|
| `bun test ./tests/mochi-beta-readiness.test.ts ./tests/mochi-session.test.ts --timeout 5000` | 12 passed, 78 assertions |
| `bun test ./tests/mochi-memory.test.ts ./tests/mochi-summarization.test.ts --timeout 5000` | 56 passed, 491 assertions |
| `bun test ./tests/mochi-context.test.ts ./tests/mochi-presets.test.ts ./tests/mochi-macros.test.ts --timeout 5000` | 51 passed, 346 assertions |
| `bun test ./tests/mochi-accounts.test.ts ./tests/mochi-assignment.test.ts ./tests/mochi-auto-replies.test.ts ./tests/mochi-scheduling-lifecycle.test.ts --timeout 5000` | 68 passed, 506 assertions |
| `bun test ./tests/mochi.test.ts --test-name-pattern 'notification\|failed writes\|corrupt and newer' --timeout 5000` | 8 passed, 70 assertions; 35 filtered out |

Total: **195 passed, 0 failed, 1,491 assertions**, 12 selected files. Gap-reproduction tests passing means the limitation is confirmed, not solved. No full suite, repeated typecheck/build, Chromium, screenshot baseline, real provider call, real crash/reboot or actual-host multi-user test was run. Width fixtures at 320/390/900 exercise DOM/state behavior, not rendered pixel geometry.

## Recoverable candidate, integrity and rollback

`MOCHI-BETA-CANDIDATE.json` pins the unchanged F runtime, matching bundles and blocked release status. This G documentation/test checkpoint is locally committed separately; its exact SHA is reported with delivery. It is not a published release.

- Frontend SHA-256: `A2AE424F1B229E4403E31AAE49E9EE7EE3828CA1A56F6CFC6352222BE2D5368E`.
- Backend SHA-256: `227CC6CA554BC7C2F922FD0ABF2AF708B17E8452131C89EDD9B75B167F92A299`.
- `spindle.json` identifier remains `lumiphone`, runtime entries `dist/frontend.js` and `dist/backend.js`; both remain tracked together. No duplicate extension installation.
- Existing ignored 01C and MEM-D/E/F bundle backups remain untouched. Recovery point `mochi@9e52676`, Pocket Power and desktop history are unchanged.
- G changed only this report, the UI audit, candidate inventory, roadmap and two tests. No new screenshots, temporary data or secrets are included.

For rollback preparation (not executed): retain the matching source/manifest/bundle pair from the previously accepted commit. Before any approved installation, use the host-supported stopped-instance backup procedure for the *test instance's* extension user storage and runtime files. Restore a matching pair rather than swapping one bundle. Do not delete storage directories, `.pending` evidence, messages, profiles, receipts, presets, summary versions, notifications or scheduled jobs. Never reset a production database to test recovery. No backup was copied in G, and no power-loss recovery guarantee is asserted.

## Acceptance checklist and next order

1. Resolve trusted real-user lifecycle integration and the memory-capacity Disable/Clear limitation with separately scoped fixes. Re-run their focused regressions.
2. Address scoped safety wording: cancellation, real-account versus fictional-profile permissions, staged versus immediate controls; preserve saved values and backend semantics.
3. With separate authorization, verify real host A→B without reload, logout/session expiry, same-user reconnect/outage, room/profile switching, delayed provider completion and closed-window schedules. Use synthetic users; verify both cached UI cleanup and server scoping.
4. Exercise memory Generate/Stop/Edit/Use/Apply, source edits/rerolls/restart interruption, missing provider/source, quota refusal and failed atomic save. Check old search/pins/quotes and native Pocket independently.
5. Capture desktop/narrow/dark/light/zoom screenshots and keyboard/screen-reader checks described in the audit. Do not replace visual baselines to disguise failures.
6. Only after explicit acceptance, prepare a tested distribution/rollback pair and decide beta scope. No clocks, routines, RP linking, themes or wider publication is authorized by this assessment.

## UI/UX Audit & Modernization Proposal

See [MOCHI-UI-UX-AUDIT.md](MOCHI-UI-UX-AUDIT.md) for the complete inventory, ten evidence-backed problems, A/B/C priorities, proposed labels, four-category settings architecture, first-use flow, responsive layouts, and visual/usability acceptance plan. All modernization work is proposed, not implemented. The current approved chat UI is preserved.
