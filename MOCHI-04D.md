# MOCHI-04D checkpoint — natural response modes and idle messaging

New rooms default to Natural group chat, with account/room autonomy still requiring explicit opt-in. Existing rooms without `responseMode` retain their original automatic preference and behavior until the user selects Natural, Instant or Manual. Manual mode suppresses automatic replies and idle generation; explicit empty continuation remains available, subject to presence.

Natural mode uses one existing reply request to choose zero to three distinct eligible speakers. Empty `messages` means silence. The prompt favors selective contributions and avoids round-robin turns/repeating the recent speaker; no separate model selector or decision loop runs. Duplicate/unowned/ineligible speakers and excessive batches are rejected without retries. Instant uses one reply, and manual responder/continuation requests retain single-message behavior.

Natural batches save atomically. Each notification receives its own increasing notification revision, avoiding loss of later batch notices. Optional AI-deferred batches are kept private and delivered together at the latest required deadline; every speaker's current status and ownership are revalidated.

## Idle policy

- Separate explicit per-room opt-in; account and room background opt-in are also required. Browser connection does not affect character presence or eligibility.
- Idle period begins at opt-in if none exists, and resets on each accepted nonblank user message. Reset cancels superseded response/idle jobs and resets allowance/opportunity count. It never resets the room's last idle delivery timestamp.
- At most three unsolicited deliveries **and** three due opportunities per idle period, shared across all room characters. One generation attempt per opportunity; provider failure or a crashed unrecoverable idle attempt never retries that occurrence. Deferrals already generated deliver without a new model request.
- First opportunity is at least 90 minutes after opt-in or the latest user message. Subsequent idle opportunities/deliveries are at least 90 minutes apart. Actual delivery updates the shared cooldown atomically with the message and completion tombstone.
- Offline eligibility checks use no AI. Disable immediately cancels pending idle work. Overdue opportunities older than an hour skip to a new future deadline instead of generating a downtime backlog.
- Idle messages never create recursive automatic response work. Explicitly scheduled messages and delayed user-triggered replies are separate job types and cannot reset or spend a different idle allowance.

## Cost bounds

This checkpoint supersedes 04A's intentionally small foundation limits: automatic/background attempts are capped at 30 per room/hour, 60 per account/hour and 120 globally/hour. One paid generation slot per account and two globally are shared by new automatic modes, optional AI-behavior requests and scheduled work. Persistent reservations survive restart. Existing legacy interactive behavior is preserved; ordinary user-requested manual generation remains outside autonomy quotas unless optional AI behavior is enabled.

One Natural event = one request, producing zero to three messages. One Instant event = one request. Status/timer checks, draft delivery and mode changes = zero requests. Idle = at most one request per 90-minute opportunity and three per idle period, without generation retries. Explicit schedules/delayed replies retain at most three transient generation attempts. Budgets apply per provider request, including retries; context/output token budgets are unchanged.

## Validation / delivery

Full verification passes: type checks, both production builds, 197 tests / 1,122 assertions and Pocket contracts. Scheduler suite: 30 tests / 137 assertions. Added regressions cover new-room defaults/legacy preservation, silence, multiple group speakers, modes/opt-out/manual continuation, restart-persistent idle caps/cooldown, allowance reset, outages/downtime/Offline, and private deferred group delivery.

Simulated Chromium 149.0.7827.55 passes at 320px, 390px and 900px, including response-mode selection and idle opt-in/cancel controls. Existing legacy messenger fixtures remain explicitly legacy to validate unchanged behavior; new defaults and group/silence behavior are tested separately. No approved visual baseline replacement. Required baseline browser is still unavailable. No actual Ubuntu/browser-closed/live-provider test.

Changed: `src/mochi/types.ts`, `src/mochi/scheduling.ts`, `src/mochi/generation.ts`, `src/mochi/service.ts`, `src/mochi/scheduler.ts`, `src/mochi/view.ts`, `src/backend.ts`, `tests/mochi-scheduler.test.ts`, `scripts/check-mochi-ui.mjs`, both bundles and this report.

Remaining limits: model-specific naturalness is prompted rather than guaranteed; deferred batches wait for all speakers and may be canceled by newer room content. Presence/configured-time limitations and the single-runtime/storage/billing risks from earlier reports remain. No daily recurring scheduling editor or multi-server coordinator is added.

Rollback: disable account background messaging and retain all room/account/registry files before reverting this checkpoint. Prior source ignores the new response-mode setting and will resume legacy interactive behavior; use Manual/disable automatic preferences before rollback if silence must be preserved. Rebuild matching bundles and never delete histories/tombstones to reset allowances.
