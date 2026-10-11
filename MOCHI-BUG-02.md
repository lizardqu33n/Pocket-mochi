# MOCHI-BUG-02 — Automatic replies versus background autonomy

Fixed on local `mochi`, based on `c5d8149`. No push, deployment, rebase, upstream/main changes or live provider operations.

## Confirmed root cause and reproduction

The accepted-message path in `MochiService.message()` persisted a user message and receipt, then computed generation using `!content || (mode ? mode !== 'manual' && runtime.enabled && backgroundEnabled(user) : autoReply)`. Consequently an Instant/Online room with autonomy off saved nonempty messages and quietly returned without a provider call or queued job. Empty continuation passed `!content` and worked. The stored mode was consulted; the frontend did not need to send an extra automatic-generation flag.

The initial regression test ran against unchanged production source and failed in **both fictional-account-owned and unassigned legacy rooms**: saved user message/receipt, expected one provider call, received zero. Its log is ignored `tmp/mochi-bug-02-before.log`. Source blame traces the mode gate to MOCHI-04D (`2ce8f0d`), and the delayed-response opt-in requirement to MOCHI-04B (`88acc64`). This is not a MOCHI-05 ownership failure, a provider error or a Natural silence decision: the broken path never reached the provider.

## Exact fix

- Trigger ordinary generation using the saved room's `autoReply` and non-Manual mode, or explicit empty continuation. Keep ownership checks, acceptance receipts, room locks, stale-revision checks, cancellation and provider/source validation.
- Separate solicited `kind: 'response'` jobs from unsolicited scheduled/idle jobs throughout quota reservation, durable discovery, dispatch eligibility and autonomy cancellation. This classification already exists in storage; no schema migration or room-history rewrite is needed.
- Away/DND/Offline follow-ups use the existing durable queue and scheduler registry even when account/room autonomy is false. Registering a real user for queue discovery does **not** enable autonomy. The account opt-in and room runtime enabled flags remain false. Unsolicited jobs and idle preparation still require their existing opt-ins.
- Preserve the same shared spending/concurrency limits: 30 attempts/room/hour, 60/real-user/hour, 120/global/hour; one paid job per real user and two globally. Delayed temporary failures retain the existing maximum of three generation attempts, backoff, expiry, claims and completion tombstones. No retry loop was added to immediate sends.
- Autonomy opt-out cancels unsolicited work, not an already requested follow-up. Explicit queued-job cancellation still works. Stop on immediate generation rejects late provider output; server jobs retain their existing explicit schedule-cancel behavior.
- A saved optional AI timing/status setting does not block an ordinary reply after autonomy is disabled. Those optional suggestions are omitted from the outgoing prompt when unavailable; the saved setting/snapshots are untouched. Already stored jobs/drafts retain their existing data.
- Keep the existing queued-job cancellation rows visible in room settings even when unsolicited scheduling is disabled. No CSS, branding, bubble, composer or native Pocket UI redesign.

## Verification

`bun run verify` passed: type checking, both production builds, **255 tests / 1,474 assertions**, zero failures, and **Pocket contracts passed**. This includes 20 new BUG-02 test cases and the existing Pocket/Mochi regressions. The targeted BUG-02 run passed before full verification; the additional cancellation-control test also passed in the final full run.

| Scenario | Simulated result |
|---|---|
| Instant/Online, fictional and legacy, autonomy off | User saved; exactly one provider call; reply + notification committed; empty continuation still works |
| Natural/Online, fictional and legacy, autonomy off | Exactly one call; valid reply or intentional `messages: []` silence; no forced reply |
| Away, fictional and legacy | Queue survives service restart; no request before 5-minute delay; one delivery at eligibility |
| DND, fictional and legacy | Queue survives restart; no request before 15-minute delay; one delivery at eligibility |
| Offline, fictional and legacy | Queued with no provider request; waits until explicitly Online, then delivers once |
| Manual and `autoReply=false`, fictional and legacy | Nonempty message saved without generation/job; empty continuation generates normally |
| Actual composer/transport | Scoped payload reaches backend; persisted mode wins over stray payload flags; final view renders both messages |
| Stop/provider/quota failure | Accepted history/receipts retained; late output rejected; no immediate automatic retry |
| Delayed provider outage | Three attempts maximum; failed record retained; no extra calls from later ticks |
| Autonomy opt-out and explicit queue cancellation | Solicited job survives autonomy opt-out; explicit cancel prevents delivery; unsolicited schedule remains rejected |
| Optional AI behavior after autonomy opt-out | Ordinary reply succeeds; no optional behavior instructions; saved opt-in unchanged |

The available Chromium checks also pass at **320px, 390px and 900px** using local Chromium **149.0.7827.55**. The account flow now verifies Manual continuation, switches to Instant with both autonomy flags off, clicks nonempty Send, observes a committed automatic reply, and uses empty Enter to continue. Existing chat/actions/notifications/settings/mobile checks are retained. No visual baselines were replaced. The standard visual-baseline comparison was not rerun in this batch; its required headless shell was blocked as documented in the accepted MOCHI-05 report, and is not claimed as passing.

Fresh independent builds match `dist/backend.js` and `dist/frontend.js` byte-for-byte. Changed paths and added content are reviewed for sensitive files/tokens; generated browser fixtures, screenshots and logs remain ignored/uncommitted.

## Exact changed files

- `src/mochi/service.ts`: acceptance trigger, purpose-aware quota and delayed execution/cancellation, effective optional behavior.
- `src/mochi/scheduler.ts`: durable response discovery, purpose-aware dispatch/reservation and autonomy opt-out.
- `src/mochi/view.ts`: existing queue cancellation controls available without autonomy.
- New `tests/mochi-auto-replies.test.ts`: failing-before reproduction, mode/presence matrix, UI transport and failure/safety checks.
- `tests/mochi-scheduler.test.ts`: two assertions that encoded the old erroneous background dependency now distinguish solicited replies from autonomy; other regressions retained.
- `scripts/check-mochi-accounts-ui.mjs`: actual Send/empty Enter Instant scenario at all three widths.
- `package.json`: include new test file in full and Mochi suites.
- `dist/backend.js`, `dist/frontend.js`, this report.

## Live verification and remaining limits

All executable verification used disposable synthetic in-memory accounts/rooms, simulated providers and mocked host storage. Your reported live failure informed the reproduction, but I did not execute the fix against your real Lumiverse instance/provider, create real rooms, use real credentials, or install it on Ubuntu. No real histories/accounts/schedules were opened or edited.

For controlled live checking after an approved installation, keep unsolicited account/room autonomy off, enable room auto replies, choose Instant/Online with a valid connection and source persona, and compare one nonempty Send with empty continuation. Then test Natural and short Away/DND delays plus Offline→Online and Manual. A delayed response may finish after the browser closes because it is a follow-up requested by the user message, not unsolicited autonomy.

Existing limits remain: scheduler polling is about 30 seconds; offline responses retain their existing bounded expiry (normally 24 hours), so they do not wait indefinitely. Natural intentional silence remains a no-reply result in the existing UI. Provider errors use existing error handling; deferred failures use retained job status/reason. There is no new cross-runtime locking/fsync guarantee or crash-time billing guarantee. A response suppressed by the old bug is not retroactively regenerated; use explicit continuation to request a reply to that saved history.
