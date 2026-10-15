# MOCHI-BETA-ACCEPTANCE-01

2026-10-14. **Synthetic acceptance completed; controlled actual-host acceptance
pending. Restricted preview is a conditional candidate, not an opened beta.
Unrestricted/general beta remains blocked.**

## Starting state and boundaries

- Checkout: `<mochi-review-checkout>`.
- Branch: `codex/mochi-desktop-01b-base-review`.
- Starting and final HEAD: `c3e036d02f500bfd00c2c6326d1245ee63353714`.
- Runtime source/bundle checkpoint: `08de2db47ab3384bfee7a0280d7a52634f553663`.
- Starting tree contained the two prior untracked reports
  `MOCHI-BETA-AUTH-INVESTIGATION.md` and `MOCHI-BETA-AUTH-UPSTREAM-RECHECK.md`.
  They remain preserved, unchanged. This assessment leaves its changes uncommitted.
- Windows host source: `b1a68d9e32e2a2480a0d5ae71422566845f2657b`, Lumiverse 1.2.5.
  This is inspected source, not proof of a currently running process's identity.
- Original `mochi` recovery/WIP remains `9e5267664a99e14ec6bc41db75133bedc830e91e`;
  Pocket Power remains `8b16bdf0f945ac473eb1a25fd7e9f17554b4a248`.

No runtime code, host source, installed extension, accounts, persistent histories,
backups or other branches were modified. No fetch, commit, push, installation,
server start/stop, browser, provider request, migration or Ubuntu access occurred.
No new features, auth workaround, UI redesign or test-baseline replacement.

The reviewed MEM-01G, UI/UX audit, BETA-FIX-01/02 and authentication reports remain
the historical evidence baseline. Their global beta-blocked conclusions are now
qualified by the user's explicit separate-browser restricted-preview scope;
their unresolved auth finding is retained, not overturned.

## Artifact provenance

Both development bundles exist, match the expected stabilization pair, and are
unchanged from runtime checkpoint `08de2db`. Git comparison of `src/` and `dist/`
against that checkpoint is empty. No production build was needed or performed.

| Artifact | Development SHA-256 |
|---|---|
| `dist/frontend.js` | `1D112A107176EBB01A04D5B5BE14B900C2BFA49C9CC8E15DF61F91053A2CCE92` |
| `dist/backend.js` | `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B` |

Inspected disposable managed repository:
`tmp/01d-local-host/data/extensions/lumiphone/repo`.
Its Git HEAD is `54d7e08b1bd88d6cf9d119f43e75e83c1dfdbe09` (01E), with locally
modified runtime files and existing historical bundle backups. Its current pair
matches the earlier MEM-01F artifacts, **not the new stabilization candidate**:

| Installed file | SHA-256 |
|---|---|
| `dist/frontend.js` | `A2AE424F1B229E4403E31AAE49E9EE7EE3828CA1A56F6CFC6352222BE2D5368E` |
| `dist/backend.js` | `227CC6CA554BC7C2F922FD0ABF2AF708B17E8452131C89EDD9B75B167F92A299` |

Only managed-repository metadata/bundle hashes were inspected; user files,
credentials and databases were not opened. An installed Git HEAD alone cannot
identify these locally replaced runtime files. Fresh acceptance cannot be claimed
against the installed older pair. Existing backups were not overwritten.

`spindle.json` still identifies the single extension as `lumiphone`, using
`dist/backend.js` and `dist/frontend.js`; no permission/manifest changes.

## Intended deployment model and isolation evidence

One shared server, two or more real Lumiverse users, **separate browser profiles
or devices**, each with their own Mochi fictional profiles and legacy rooms.
Same-browser successive real-user switching is explicitly excluded from this
proposed preview model; fictional-profile switching within a login is supported.

New `tests/mochi-multi-user-acceptance.test.ts` uses one shared service, scheduler
and synthetic storage with concurrent Alice/Bob operations. Identical client
request IDs and scheduled occurrence IDs are deliberately reused across users.
Fake provider responses are distinguishable and held in flight together; Bob's
response is released before Alice's. These are source-level fixtures, not HTTP,
cookie, OS-process, real-provider or browser security tests.

| Boundary | Evidence and result |
|---|---|
| Authenticated principal | `src/mochi/service.ts:handle(payload,userId)` follows its callback principal. Forged payload `userId`/`ownerId` does not select another user; cross-user room sends return an error only to the caller, without writes/provider calls. Host `src/ws/handler.ts:SPINDLE_BACKEND_MSG` checks extension access and forwards its authenticated `userId` and frontend session. Host bridge inspected, not exercised end to end. |
| Durable isolation | `service.ts:read/readStored/persist`, `accountsState`, `fictional-accounts.ts` and userStorage use real-user scope plus room/fictional-account validation. Concurrent legacy and fictional histories, notifications, memories and presets remain distinct after synthetic backend restart. |
| Provider context | `generation.ts:validateMochiSources/resolveGenerationSources` checks connection, persona and character ownership; fake requests use the correct `userId` and `connection_id`. Concurrent prompts contain their own sentinel history/persona/preset, never the other user's. Existing context tests reject other-room/RP context, revoked sources and invalid budgets. |
| Presets, preview, memory | Both users bind independent immutable preset revisions and request previews/summaries simultaneously. Foreign room/account, preset, missing revision, suggestion and message identifiers reject. Forged preview/memory/search requests return errors without private content. Applying valid independent summaries preserves both users' histories and versions across restart. |
| Pins/notes/quotes/reactions | Both users independently create pins, notes, reactions and quoted messages. Foreign mutations reject without changing the shared storage snapshot. Existing feature tests cover deletion/edit/reroll attribution, bounded context and search navigation. |
| Notifications | Responses and job events target only the intended user. Existing tests cover unread/read, dismiss/clear, delayed-event deduplication, refresh and message preservation. Clearing Bob's records does not alter Alice's room. |
| Schedules | Both users schedule the same occurrence ID in their own rooms. Bob cannot cancel Alice's. Disabling Alice's autonomy cancels only her unsolicited job; Bob delivers once, including repeated ticks/restart, with one distinguishable provider request and one notification. Existing lifecycle tests cover distinct occurrences, staged drafts, restart/retry, expiry and legitimate multi-message output. |
| Quotas/task ownership | Concurrent users can reserve separate slots; Alice's exhausted per-user hourly quota does not consume Bob's quota. **The global concurrency and 120/hour safety cap are intentionally shared**; this is bounded resource contention, not account data mixing. Per-user cap 60/hour and per-room 30/hour remain unchanged. |
| Frontend contexts | Two live `getMochiSession` instances use independently bound transports/listeners and separate surface roots in one JSDOM document. Drafts survive hide/restore, late Bob notification routing leaves Alice untouched, Alice's actual fictional-profile switch remains a live session, and explicit Alice logout leaves Bob's session/draft/listener intact. This is an independent-context DOM simulation, **not two actual browser profiles**. |

Host `src/spindle/worker-host-storage-api.ts:resolveUserId/resolveUserStoragePath`
uses the installed user for user-scoped extensions or the requested authenticated
operator context, then confines paths under that user's extension directory.
These inspected host adapters, cookie/session behavior and provider authorization
still need actual-host acceptance. The extension is trusted server code; this
assessment is not a sandbox audit against a malicious extension or administrator.

## Memory-v2 and stabilization acceptance

Re-ran targeted Save/Restore/Disable/Clear and 99/100-version fixtures, including
10,000 receipts. Disable/Clear retains original versions, messages and digests;
new Save/Restore refuses capacity rather than evicting data. Failed atomic writes
retain committed data. Covered edits/rerolls invalidate proof. Summary provider
output is reviewed before Apply; forged, stale, canceled, source-changed or
restarted suggestions cannot be applied. Preview/history exclusion follows
effective memory and token budgets without clipping stored history.

`src/mochi/memory.ts:currentSummary/validateMemory` and
`service.ts:saveMemory` retain the bounded v2 management record; no representation
or migration change here. Legacy v1 reads remain unchanged. **After explicit
Disable/Clear creates v2, older MEM-01E/F readers cannot read that room.**
An old bundle backup is not a safe downgrade over newer data. Keep histories and
management metadata intact and use a compatible v2-aware runtime; do not restore
an old database over conversations created since the backup. Recovery of old
data, if needed, belongs in a separate offline instance, followed by a separately
reviewed reconciliation—not blind copying into current storage.

These automated results do not manually accept memory recovery, prompt wording,
dialog focus or saved/unsaved behavior on the host. Those remain checklist items.

## Messaging, failures and native compatibility

Targeted fixtures cover DM/group membership and manual responder choice;
Instant/Natural/Manual including silence; Away/DND/Offline durable replies;
normal replies independent of unsolicited opt-in; double-send/Enter conflicts;
Stop, room switch/close and late provider results; edits/deletes/rerolls;
search/quotes/reactions/pins/notes/texting; preset/macros/placement; and memory.
No retry loop, unbounded request or new context path was introduced.

Existing assertions distinguish empty/whitespace/missing output, nonempty malformed
structured output, transport errors, token-budget refusal and cancellation.
Accepted user messages remain saved on failure. Scheduled opportunities keep
their existing eligibility, expiry, deduplication and no-catch-up behavior.

Native Pocket domain, generation lifecycle and portal fixtures passed. An old
portal test still assumed the pre-MSG room menu and two fieldsets: corrected the
expected supported menu, selected Settings by name rather than last position, and
asserted the required section legends instead of forbidding the added texting
section. No runtime behavior or visual baseline was changed to make this pass.
This is targeted compatibility evidence, not a full Pocket regression or fresh
live native Messages acceptance.

## Test results (sequential; no full suite)

Final successful selections, each invoked separately with a five-second per-test
timeout:

| Test selection (`tests/*.test.ts`) | Pass | Assertions |
|---|---:|---:|
| `mochi-multi-user-acceptance` (includes imported `mochi-accounts`) | 24 | 289 |
| `mochi-beta-readiness`, `mochi-memory`, `mochi-summarization` | 74 | 725 |
| `mochi-context`, `mochi-presets`, `mochi-macros` | 51 | 346 |
| `mochi`, `mochi-auto-replies`, `mochi-scheduling-lifecycle`, `mochi-scheduler`, `mochi-assignment` (also imports accounts) | 151 | 1007 |
| `mochi-replies`, `mochi-reactions`, `mochi-pins`, `mochi-search`, `mochi-texting` | 56 | 407 |
| `mochi-beta-ux`, `mochi-window`, `mochi-session`, `mochi-desktop-layout`, `mochi-sidebar` | 45 | 373 |
| `domain`, `generation-lifecycle`, `portal` | 88 | 439 |

**473 distinct tests / 3,489 assertions / 26 distinct files; zero final failures.**
The 16 imported account tests / 97 assertions occur in two selections and are
counted only once. Eight new tests add simultaneous-user evidence. Intermediate
harness failures (missing update fields/preview scenario, request field naming,
navigation redraw/refresh tickets) were corrected; they did not establish runtime
bugs. The native/portal run initially failed stale expectations described above;
its final three-file selection passed. Iteration reruns are not added to totals.

One `bun run typecheck` passed. The project typecheck covers `src/**/*.ts`; Bun
executes the test fixtures but does not separately statically typecheck them.
No runtime source changed, so no production build was repeated. The previously
verified pair remains byte-identical. No Chromium, screenshot, visual-baseline,
actual-host, real provider, real disk interruption/reboot or live multi-account
acceptance was performed. 320/390/900 fixtures check DOM/state contracts only.

One passing test is explicitly named **KNOWN RELEASE GAP**: it reproduces the
missing silent real-user transition teardown. Its passing assertion confirms
the unresolved gap; it must not be counted as a successful privacy guarantee.

## Known limitation and separate release decisions

See user-facing [MOCHI-BETA-PREVIEW.md](MOCHI-BETA-PREVIEW.md). The host does not
provide a demonstrated trusted pre-transition disposal boundary for all retained
frontend real-user replacements. `session.ts:authenticatedIdentityChanged` works
when explicitly called; source inspection still finds no automatic host caller.
Owner-less room DTOs and later accounts-bank responses do not fix that boundary.
No live privacy leak has been demonstrated, and the risk is not declared harmless.

| Assessment | Recommendation |
|---|---|
| Restricted friends preview | **Synthetic gate passed; actual-host acceptance pending.** Reasonable to continue controlled separate-browser testing on the inspected host. Opening to friends requires the checklist, matching runtime installation, compatible backup/recovery, communicated limitation and the user's explicit residual-risk/access decision. No publication/access permission inferred. |
| Unrestricted/general beta | **Blocked.** Trusted host authentication lifecycle integration and actual verification remain privacy requirements, alongside broader browsers/providers/storage/recovery/visual acceptance. Separate-browser simulations do not resolve this. `releaseReady` and `multiUserReady` remain false. |

Other known limitations: restart-persistent composer drafts remain deferred;
finite memory version/receipt capacity remains explicit; host external-hide/focus
behavior and real layout/zoom/contrast require review. UI modernization remains
later work under `MOCHI-UI-UX-AUDIT.md`, not part of this acceptance checkpoint.

## Controlled Windows update and manual acceptance plan — not executed

Every host change below needs separate authorization. Do not run the launcher,
replace files or create users as part of this report.

1. **Choose the existing disposable host only.** Launcher is
   `tmp/start-mochi-01d-test.ps1`, with explicit `DATA_DIR=tmp/01d-local-host/data`,
   port `7861`, existing host frontend assets and host source at the inspected
   root. Do not redirect the regular installation, use staging, or run a second
   `lumiphone`. The script's `-Approved` switch is not permission to launch now.
2. **Make an authorized, consistent backup first.** With the disposable process
   cleanly stopped through the supported host workflow, preserve its entire test
   data directory, installed extension repository and current runtime pair as a
   dated private local backup outside the served extension path. Do not print
   credentials or copy production data. Verify completion before replacement.
   Existing historical bundle backups stay untouched. Host stop/backup operations
   have not been done here.
3. **Stage the exact candidate, not a remote update.** The managed repository is
   older with locally replaced bundles; its updater/origin is not proof of this
   candidate. After approval, prepare a separate clean runtime package from
   source checkpoint `08de2db` containing its `spindle.json` and **both** matching
   bundles above; preserve the installed repository/source as backup and use a
   supported local package/update route if available. Otherwise review an exact
   in-place paired-artifact update plan before executing it. Do not reset its
   repository, alter origin, or update one bundle alone. No update script is
   executed or assumed approved by this plan.
4. **Verify before opening.** Hash both staged and installed files using
   `Get-FileHash -Algorithm SHA256` and compare every hex character with the
   development pair above. Reload/restart only after the approved paired update;
   record candidate hashes plus host version so stale frontend assets are visible.
   Browser cache reload is an artifact check, not an auth security fix.
5. **Prepare separate identities after approval.** Use two disposable test real
   accounts with separate browser profiles/devices on that host. Never reuse
   production data. Each creates a distinguishable fictional profile and a legacy
   room with synthetic messages. Account creation and any provider usage need
   separate permission. For live providers, agree on a small request cap first.
6. **Concurrent isolation.** Keep A and B open together. Each lists only its own
   accounts/rooms/connections/presets. Send distinguishable turns; exercise room
   switching, hide/restore, reconnect and late replies independently. Check both
   sides after each action. Use anonymized IDs and pass/fail notes, not prompt
   dumps. Record unread counters and clear/dismiss behavior without deleting
   saved messages. Simulated forged-ID rejection is already covered; do not poke
   private production records during manual testing.
7. **Memory and settings.** In both scopes Save/Restore, Disable/Clear and Preview;
   verify effective exclusion and retained history/versions. Generate → review →
   edit → Apply, then reject stale suggestions after a covered edit/reroll. Use
   isolated synthetic capacity fixtures for 100-version recovery, not an existing
   room edited hundreds of times. Confirm Stay versus cancel-and-leave, room/tool
   draft preservation, and staged Save versus immediate permission labels.
8. **Messaging and scheduler.** Check quoted replies, reactions, pins/notes,
   search older messages, texting preferences, published preset revision versus
   room Apply, DM/group responders, Natural/Instant/Manual, Stop and errors.
   Ordinary auto replies must work without unsolicited autonomy. Separately opt
   in to one scheduled opportunity per test user; record due/outcome, notifications
   and restart recovery with no duplicate message. Do not revive expired jobs.
9. **UI/native checks.** At 320, 390 and 900px with long names and groups, capture
   synthetic screenshots for review. Check keyboard/dialog focus, text selection,
   scroll anchoring, 110/125/150% zoom, light/dark, touch targets and maximum memory
   history. Test portal/window handoff and native Pocket Messages independently.
   Do not switch two real users inside the same retained browser context for this
   restricted acceptance; that remains a separate blocked auth test.
10. **Record results and decide.** Mark actual host/build, profiles, each check,
    provider count and limitations. If privacy/data-loss occurs, stop access and
    preserve evidence without publishing private content. Opening a small friends
    group requires explicit approval after these results. General beta stays blocked.

Rollback: before any v2/new writes, an approved restoration must keep a complete
consistent runtime/data pair and preserve intervening data separately. After
new writes or memory-v2 management, prefer stopping use and restoring a compatible
v2-aware runtime; never roll back by replacing histories with the pre-test backup
or swapping the old installed MEM-F bundles over newer data. No rollback occurred.

## Changed files and stop point

- New `tests/mochi-multi-user-acceptance.test.ts`: simultaneous backend and
  independently bound frontend-context fixtures, fake providers/storage only.
- `tests/portal.test.ts`: stale menu/section expectations corrected; no runtime edit.
- New `MOCHI-BETA-ACCEPTANCE-01.md` and `MOCHI-BETA-PREVIEW.md`: evidence, limitation,
  readiness decisions and controlled manual plan.
- `MOCHI-BETA-CANDIDATE.json`, `ROADMAP.md`: current acceptance evidence and separate
  restricted/general readiness, keeping auth and live-acceptance limitations.

No confirmed runtime defect required a source fix. No build, commit, installation,
publication or next milestone began. Await manual acceptance and the user's decision.
