# MOCHI-04E — final recovery and safety validation

MOCHI-04A–04D are implemented sequentially on the local `mochi` branch. This checkpoint hardens recovery and completes simulated validation. It does **not** establish live Ubuntu, live provider, or actual browser-closed server acceptance. No push, deployment, installation, native phone migration, RP linking or approved messenger redesign was performed.

## Confirmed defects corrected in this checkpoint

- An oldest due Offline job could repeatedly occupy an account's dispatcher opportunity and block eligible rooms. Deterministic candidate eligibility now skips unavailable work while still allowing expired/stale work to be cleaned up.
- One malformed room could prevent unrelated valid rooms from being dispatched. It is now preserved and reported individually; other rooms remain usable. Malformed account/registry records still fail closed.
- Deferred group drafts needed stronger stored membership validation. Foreign or duplicate speakers now fail closed. Legitimate settings/membership changes cancel pending drafts atomically, keeping rooms readable and retaining their real message history.
- Cancellation must erase every private draft in a deferred batch, not just its primary message. All cancellation paths now remove additional undelivered content as well.
- A maximum 24-hour DND delay previously met the pending response expiry exactly; timer resolution could mark it missed. The expiry now leaves a delivery window after that delay.
- Stored future status transitions needed visible refresh while the screen stayed open. A status-only 30-second refresh updates dots/meta without replacing the focused composer or generating requests.
- Idle/AI-behavior controls now allow disabling existing choices when account autonomy is off. Configured status transitions can be cleared.
- Successful server delivery now sends an account-addressed, public room update so an open thread receives the committed message/status without exposing runtime drafts or replacing unsent text. Settings/create drafts remain protected from unsolicited replacement.

## Verification results

| Check | Result |
|---|---|
| `bun run verify` | PASS: type checks, backend/frontend production builds, 207 tests / 1,155 assertions, Pocket contracts |
| `bun run test:mochi` | PASS: 81 tests / 490 assertions |
| Scheduler/runtime suite included above | PASS: 40 tests, including 10 new final regressions |
| Simulated desktop/mobile Chromium | PASS at 320px, 390px, 900px; Chromium 149.0.7827.55 |
| Standard approved visual-baseline suite | BLOCKED: required `chromium_headless_shell-1234` executable unavailable; no baselines replaced |
| Actual Ubuntu / browser-closed server / paid-provider testing | NOT RUN; not authorized |
| Source and bundles | Both checked-in bundles rebuilt from final source during verification |
| Whitespace / staged-file audit | Clean diff; no credential-pattern matches or private account records/screenshots in tracked changes |

The tests use synthetic accounts, providers, token counts, in-memory storage and controlled time. Restart tests reconstruct the service/scheduler from persisted fixture records without a browser. They simulate rename/write interruption, revoked ownership, provider errors, expired claims, opt-out during staged delivery, and delivery after reconnection. They are evidence of implementation behavior, not proof of the installed Ubuntu runtime or disk power-loss guarantees.

Existing Mochi tests continue checking edits, deletion/rerolls, notification read/unread/dismiss/clear, history preservation, context/persona isolation, duplicate sends, cancellation, stale revisions and account separation. New runtime tests cover modes, selective/silent group replies, both presence delays, manual locks, Offline transitions, deferred batches, restart recovery, quotas, idle-period reset/caps/cooldown, downtime and no recursive AI messaging. UI checks retain the approved header/mascot, long-name truncation, clusters, message actions, keyboard/composer behavior, settings and notification interactions; they also exercise autonomy, scheduled-message, status/delay, mode and idle controls.

## Cost and delivery rules

- Timer/status checks and delivery of persisted drafts use zero provider requests.
- Natural mode chooses silence or up to three distinct speakers within one provider request; no separate selector call. Model-specific naturalness remains prompt dependent.
- Instant/manual continuation uses one reply request. Manual mode suppresses automatic/idle generation; explicit empty continuation remains available subject to presence.
- Idle generation permits one attempt per due opportunity, at most three opportunities/deliveries per idle period, shared across all characters, with a 90-minute minimum room gap. A nonblank accepted user message resets the period allowance but retains the last delivery cooldown. Idle messages never trigger recursive replies.
- Explicit scheduled/delayed-response generation has at most three transient attempts with durable backoff. A saved generated draft never needs another generation request. Delivery write retries are bounded separately.
- Automatic/background limits: 30 requests/room/hour, 60/account/hour, 120 globally/hour; one generation slot/account and two globally. Reservations persist across restart. Ordinary explicit manual and unchanged legacy interactive generation retain prior behavior outside autonomy quotas unless AI behavior is enabled.
- Existing defaults remain 8,192 context tokens, 1,200 output tokens and 256 reserved tokens (6,736 outgoing input budget). At these defaults the automatic output allowances are at most 36,000/72,000/144,000 tokens per hour for room/account/global respectively. These are ceilings, not usage estimates. Actual provider ceilings and tokenizer accuracy require live validation. Stored history is never trimmed to meet outgoing context budgets.

## Files

This checkpoint changes `src/mochi/scheduler.ts`, `src/mochi/scheduling.ts`, `src/mochi/service.ts`, `src/mochi/view.ts`, `tests/mochi-scheduler.test.ts`, `dist/backend.js`, `dist/frontend.js` and this report.

Across all MOCHI-04 checkpoints: those files plus `src/mochi/behavior.ts`, `src/mochi/presence.ts`, `src/mochi/generation.ts`, `src/mochi/types.ts`, `src/mochi/styles.ts`, `src/backend.ts`, `package.json`, `scripts/check-mochi-ui.mjs`, and `MOCHI-04A.md` through `MOCHI-04D.md`. Native Pocket messaging/contacts/phone modules are unchanged. The backend entry point adds only Mochi scheduler startup/routing. Styles add presence colors; the approved messenger structure remains intact.

Synthetic screenshots are intentionally ignored and not committed, under `tmp/mochi-final-ui-review`: `layout-review-{320,390,900}.png`, `layout-review-light-{320,390,900}.png`, `scheduler-{320,390,900}.png`, `presence-{320,390,900}.png`, `settings-{320,390,900}.png`, and the action/notification check screenshots in that directory.

## Remaining limits and safe trial

Assumes one active extension runtime. The host provides atomic rename but no cross-process compare-and-swap/fsync guarantee. A crash after paid output but before draft persistence can repeat provider billing; committed occurrence tombstones prevent replay of saved messages, including after user deletion. Cancellation cannot undo a rename that already crossed its commit boundary. A provider that ignores cancellation and never settles can hold its slot/dispatcher until runtime restart. No host graceful-unload callback was available; abrupt restart recovery uses persisted claims/leases.

Schedules/status transitions use bounded absolute deadlines, not a recurring daily calendar editor. Paused work requires cancel/recreate after correcting sources. Queues are bounded to four active jobs/room; 10,000 retained occurrences refuse further scheduling instead of forgetting completions. The discovery registry is bounded to 1,000 accounts; dispatch follows its account order rather than promising round-robin fairness. Deferred group batches wait for every speaker and may be canceled by newer content/settings. Malformed files are retained and need deliberate recovery; never blindly promote `.pending` files or replace them with empty defaults.

For a controlled future trial, use a separate test account/room with an owned connection. Enable account background messaging and then room scheduling; choose Natural/Instant/Manual explicitly, configure presence/delays, and schedule one future message. AI behavior and idle messaging are separate optional controls. Verify delivery/reconnection and account opt-out before enabling idle messaging. This can incur provider charges and should only be performed with separate approval. Disable account background messaging to stop autonomous work immediately; histories remain saved.

Rollback: disable account autonomy, preserve all room/account/registry records, and revert E, D, C, B, A in reverse order, rebuilding matching bundles. Disable legacy automatic preferences if silence is required when reverting response modes. Do not delete histories, tombstones or budget records to reset allowances. Checkpoint-specific rollback details are in the earlier reports.
