# MOCHI-BUG-03 — Scheduling lifecycle investigation

Historical investigation, before the approved fix. The implementation and current verification are documented in [MOCHI-BUG-03.md](MOCHI-BUG-03.md). Its isolated audit tests were converted into `tests/mochi-scheduling-lifecycle.test.ts` and included in the verification suite; the results below describe the original unfixed baseline.

Baseline: `mochi`, `9259afc51522732469c80b13f957a71a38253a77`.
Investigation only. No production fix, migration, UI redesign, expiry-policy change, commit, push, deployment, or live data access.

## Conclusion

The clarified reproduction—schedule an AI opportunity two minutes ahead, click Save settings, leave, reopen settings, find no item, then receive no message—matches a confirmed local defect in both legacy and fictional-account rooms.

The Schedule button saves immediately. The subsequent room-settings save unconditionally invalidates pending jobs, even when all saved settings are identical. The job becomes `cancelled`, not deleted. The public state removes canceled jobs, so reopening hides the stored record. A canceled job is terminal and never dispatched: the synthetic reproduction makes **zero provider calls**, including after its due time and expiry deadline.

The earlier observation of an item labeled Expired is a separate, unresolved live timeline. Source and simulations establish several expiry paths, but no live record, due/expiry timestamps, or server/provider logs were inspected. It would be incorrect to assign a specific blocker or provider-call count to that earlier item. This version uses internal status `missed` for expiry; the settings view renders raw status text and does not contain an `Expired` label. The deployed build/label mapping remains unverified despite the user's report that it is the latest GitHub pass.

## Evidence and path

| Stage | Source | Finding |
| --- | --- | --- |
| Schedule UI | `src/mochi/view.ts:349–353` | Sends `mochi:schedule` immediately with room revision, responder, occurrence ID, due time; shared `dispatch()` adds current fictional-account scope. This is an AI opportunity, not exact-message scheduling. |
| Backend acceptance | `src/backend.ts:4763–4771`, `MochiScheduler.handle()` | Uses authenticated real user; requires account background opt-in; saves then returns account-scoped state. |
| Durable save | `src/mochi/service.ts:404–415`, `schedule()` / `persist()` | Ownership/revision validation; requires room opt-in; job kind `scheduled`; atomic `.pending` replacement in real user's `mochi/v1/rooms/<roomId>.json`. Fictional ownership is `room.accountId`, not a different storage namespace. |
| Settings save | `src/mochi/view.ts:383–386`, `src/mochi/service.ts:227–242` | Save submits `mochi:update`; even an unchanged update increments revision, cancels every nonterminal job, removes undelivered drafts, and aborts active generation. This is intended stale-output protection applied too broadly to no-op saves. |
| Reopen/list | `src/mochi/service.ts:246–278`, `src/mochi/scheduling.ts:51–53` | Correct real-user/fictional scope is restored, but `publicRuntime()` filters all terminal states: delivered, canceled, failed, missed. Stored records survive. |
| Discovery | `src/mochi/scheduler.ts:87–106`, `tick()` | Reads persistent real-user registry and rooms across fictional scopes; skips canceled jobs. Account selection does not determine scheduler discovery. |
| Eligibility/limits | `src/mochi/scheduling.ts:64–70`, `src/mochi/presence.ts`, `MochiScheduler.reserve()` | Pending opportunities wait for due time, eligible presence, concurrency capacity and quotas. Limits remain 30 attempts/room/hour, 60/real user/hour, 120 globally/hour; one opportunity/account/wake, two global concurrent reservations. |
| Expiry/dispatch | `src/mochi/service.ts:450–483` | After deadline, sets `missed` before reserving quota or calling provider. Expiry cleanup bypasses presence eligibility so Offline jobs can expire. No reason is recorded for expiry or most cancellation cases. |
| Generation/commit | `src/mochi/service.ts:487–553` | Uses room sources and real-user-owned connection; persists generated drafts, then atomically commits messages/notifications/completion tombstone. Temporary failures retry at most three times; permanent source/config errors pause. No automatic revival of terminal jobs. |

`git blame` traces explicit cancellation on settings save to MOCHI-04E (`63d2df4`); terminal filtering existed in MOCHI-04 scheduling. The reproduction is not caused by MOCHI-05 fictional-account isolation or the BUG-02 ordinary-response change.

## Timeline and provider activity

Synthetic clock values are milliseconds since epoch, not the user's live dates:

- Created at `1,000,000`; chosen due time `1,120,000` (two minutes later).
- Initial expiry `4,720,000` (one hour after due; 62 minutes after creation).
- Immediately after unchanged settings save: `cancelled`, attempts `0`, original due/expiry retained.
- After restart/reopen: record still exists; public schedule list is empty.
- At due time and later past expiry: remains `cancelled`, no messages, no notifications, zero provider requests.

Control: schedule without a settings update survives reopening, fictional-account switching and runtime restart; dispatches exactly once at due time in simulation, with correct account ownership and no duplicate after restart.

Separate expiry simulations use due `1,060,000`, deadline `4,660,000`, cleanup tick `4,660,001`. Offline, a two-hour DND delay, exhausted room quota at the due tick, or server inactivity until after deadline each produce a retained `missed` record, attempts `0`, no messages, zero provider requests. The quota case exhausts capacity at due time and next wakes only after expiry; continuous polling could deliver once capacity becomes available inside the window.

Permanent invalid connection ownership pauses visibly with no provider request. Three synthetic 503 provider failures produce a retained `failed` record after exactly three calls, which reopening hides. This differs from zero-attempt expiry.

Scheduled opportunities require account/room autonomy opt-in by current design. Disabling those settings cancels unsolicited opportunities; it does not silently enable autonomy. Ordinary delayed responses use `kind: response` and the BUG-02 exemption. Idle messages use `kind: idle` and their separate allowance. The user-created reproduction is `kind: scheduled`.

## Additional display finding

Only successful message delivery emits `mochi:room_updated`. Queued/generating/paused/failed/expired transitions persist without a corresponding event. `MochiView.receive()` also ignores room updates with the same conversation revision and while settings are open. A synthetic paused transition therefore leaves the already-open settings snapshot showing queued until a fresh state request. This is confirmed stale display behavior, not storage loss. Simply adding an event would not fully correct it.

## Smallest recommended correction — not implemented

1. After existing ownership, input and revision validation, detect an unchanged normalized room-settings update and return the saved room without incrementing revision, canceling jobs or aborting generation. Preserve invalidation for actual prompt/source/member/persona changes. Do not remove revision safeguards or indiscriminately rebase pending work onto changed room context.
2. Expose a bounded, sanitized list of retained canceled/failed/missed schedule summaries in public state and render clear terminal labels without cancellation controls for finished items. Do not expose claims, provider credentials or undelivered drafts; retain all completion tombstones in storage. Include original due/expiry and safe explanations for newly recorded transitions where practical without a schema migration.
3. Refresh schedule state independently from unsaved settings fields, preserving form drafts and scope checks. Address same-revision runtime transitions and failure/expiry publication without changing message revision semantics or introducing a new scheduler.

Keep current expiry rules for this correction. A one-hour opportunity window can deliberately prevent stale surprise messages after downtime, but it also conflicts with user expectations of guaranteed future delivery and with delays configurable up to 24 hours. Any wider window, catch-up behavior or presence override changes semantics and potential provider spending; discuss those separately. Never revive existing canceled/expired jobs automatically.

Temporary safe workaround: save actual room/provider/background settings **before** scheduling, then schedule and leave using Cancel/back rather than Save settings. Scheduling already persisted; avoid later room settings saves or conversation changes that invalidate its snapshot. This does not remove presence/quota/expiry limits and does not guarantee delivery.

Recommendation: correct these defects and perform a controlled live scheduling check before MOCHI-INTEGRATION-01. A shell integration would not repair the lifecycle and could obscure the same failures. No integration work was started.

## Verification and delivery

- `bun run verify`: typecheck and production builds passed; **255 existing tests passed, 0 failed, 1,474 assertions**; Pocket contracts passed.
- New isolated investigation file: `bun test tests/mochi-scheduling-lifecycle-audit.test.ts --test-name-pattern 'BUG03'`: **10 passing diagnostics, 5 deliberately failing regressions, 103 assertions**. The failures are unchanged Save settings in both scopes and hidden canceled/failed/missed records. These failures remain unfixed as requested; the new file is not added to the existing verify script.
- Diagnostic-only run (`--test-name-pattern 'BUG03 evidence'`): **10 passed, 0 failed, 71 assertions**. Diagnostics describe today's behavior; review them when converting this audit into the fix's lasting regression suite.
- UI scheduling/Save flow exercised with JSDOM; due time normalized to the synthetic clock rather than testing system timezone conversion. No real Chromium, browser-closed Lumiverse, Ubuntu runtime or actual provider test was performed.
- Production source and rebuilt bundles remain unchanged from baseline. No visual baseline was changed or run for this investigation.
- Only new local files: this report and `tests/mochi-scheduling-lifecycle-audit.test.ts`. All fixtures are synthetic in-memory data; no real histories/accounts/jobs were read or changed.
- No fix is claimed, no provider request was made against a real service, and no job was revived. No commit or push made.
