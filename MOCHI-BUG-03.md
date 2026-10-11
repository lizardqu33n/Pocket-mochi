# MOCHI-BUG-03 — Scheduling persistence and lifecycle display fix

Baseline: `mochi`, `9259afc51522732469c80b13f957a71a38253a77`. Local-only implementation. The original investigation is retained in `MOCHI-BUG-03-AUDIT.md`.

## Root cause and correction

The Schedule action persisted an AI opportunity immediately. Clicking Save settings afterward always incremented room revision, canceled pending work, removed drafts, and aborted generation, even when settings were unchanged. Canceled records survived but the public-state filter hid them on reopening. This exactly reproduced the user's clarified two-minute Schedule → Save → reopen sequence in legacy and fictional-account rooms.

`MochiService.update()` now performs its existing ownership, stale-revision, membership, provider, setting and explicit persona validation first, compares normalized fields with object-key-order-independent equality, and returns the original room when nothing changed. It performs no write, revision increment, cancellation, draft removal or abort for that case. Actual changes retain the previous invalidation behavior. No room/persona/profile schema changed.

`publicRuntime()` now includes all pending jobs plus the last 20 canceled/failed/missed records, in reverse record order. Storage is never pruned: all jobs, completion tombstones and histories survive. Summaries contain only ID, job kind, original due time, expiry, optional deferred-delivery time, status, attempt count and controlled safe explanations. Arbitrary stored reasons, claims, leases, message drafts and provider details are not copied. Delivered completion records remain in storage but are not added to settings history.

Settings show Scheduled / Generating / Waiting to deliver / Needs attention / Canceled / Failed / Expired labels and due/expiry information. Terminal jobs have no cancellation button. The chat design and message-action UI are unchanged.

After a committed runtime write, the service publishes an account-scoped `mochi:scheduling_updated` event. This updates only the scheduling projection, even when the conversation revision is unchanged. In settings, only schedule-list nodes are refreshed; text fields, focus, cursor position and unsaved settings remain intact. A partially entered scheduling time is also retained across ordinary redraws.

Wire-only server-session/sequence cursors reject out-of-order snapshots and already-retired runtime sessions. Room snapshots capture the runtime/cursor under the existing room lock so an older list response cannot falsely carry a newer sequence. Account, room, association and conversation-revision checks remain enforced; event data never replaces stored messages or settings drafts. These cursors are not written into room files and are not generation receipts. A frontend publication failure cannot turn a successful commit into a storage failure/retry.

No scheduling windows, presence rules, source isolation, quotas, generation selection, retries or autonomy permissions were changed. No terminal job was revived. Normal automatic replies, explicit Stop/cancel, background opt-out, and stale-context cancellation remain covered by the existing regressions.

## MOCHI-BUG-03B — Identical scheduled text

Source inspection and four additional regressions found **no confirmed cross-occurrence output reuse, duplicate commit or duplicate rendering**. No generation/content change was made for this report.

- Distinct occurrences are claimed separately and invoke generation with the latest saved room history. The second synthetic request contains the first occurrence's reply and excludes another room's private context.
- Distinguishable synthetic responses remain attached to the correct occurrence. Stored messages carry unique message IDs, `server_<occurrenceId>` request IDs and the simulated creation times; each completion record points to its own message ID. Drafts are removed at successful delivery. Repeated delivery events render one row per saved message ID.
- A deferred draft is read from the selected job, not the room's previous message or another job. Restart and a simulated failed delivery write preserve that job's draft and commit it once without another provider call.
- When two independent synthetic provider calls deliberately return identical text, both are preserved as distinct legitimate messages. There is no content deduplication, rewriting or extra request to make their text different.

The live identical-text occurrence's stored draft, raw provider response and logs were not available/inspected. These results establish local behavior and regression coverage, not the actual cause of that live repetition. A live diagnosis still requires the two occurrence/message IDs, due/creation timestamps, completion records and safely redacted provider evidence.

Provider requests are not transactionally exactly-once across a crash before a response can be durably stored. The existing conservative reservations/retry limits remain; delivered jobs cannot commit again, and saved drafts do not regenerate. No new retry loop or paid request was introduced.

## Verification

- Full `bun run verify`: type checks and both production builds passed; **283 tests passed, 0 failed, 1,696 assertions**, across 21 files; Pocket contracts passed.
- New lifecycle file: **28 new regressions**; all five original red regressions converted and passing, with legacy and fictional terminal-history cases, no-op active generation/private drafts, validation, genuine-change invalidation, focus/draft preservation, stale events/list responses, scope rejection, restart ordering, summary bounds/privacy and four repetition cases.
- Existing BUG-02 Instant/Natural/Manual, Online/Away/DND/Offline, cancellation, automatic reply and background-permission tests pass unchanged. Native Pocket regression tests and legitimate deferred group-output tests pass.
- Simulated Chromium **149.0.7827.55**: existing Mochi chat/account checks plus new scheduling checks passed at **320px, 390px and 900px**, in both legacy and fictional rooms. Actual date input, unchanged Save/reopen, retained cancellation/failure/expiry history, due/expiry labels, no terminal cancel actions, unsaved instruction focus and no horizontal overflow were checked. Test screenshots are ignored files under `tmp/mochi-final-ui-review/scheduling-history-{legacy|fictional}-{320|390|900}.png`.
- Standard `bun run test:visual`: **BLOCKED**, not passed. Its required `chromium_headless_shell-1234` executable is absent, confirmed outside the sandbox. Existing visual baselines were not edited or replaced, and no browser was installed to change the baseline environment. Mochi's independent Chromium checks used the already installed browser explicitly.
- Fresh independent backend/frontend builds byte-match `dist/backend.js` and `dist/frontend.js`.
- All data and providers in verification are synthetic/in-memory. No live Lumiverse/provider, browser-closed Ubuntu execution or real-account migration was tested. No real histories, credentials or schedules were read or changed.

## Exact files

1. `src/mochi/service.ts` — validated no-op saves; post-commit runtime events; consistent wire snapshots.
2. `src/mochi/scheduling.ts` — sanitized bounded terminal history and display labels.
3. `src/mochi/view.ts` — scoped scheduling-event merging and settings-only list refresh/display.
4. `tests/mochi-scheduling-lifecycle.test.ts` — converted audit and new BUG-03/03B regressions.
5. `scripts/check-mochi-scheduling-ui.mjs` — new synthetic Chromium scheduling checks.
6. `scripts/check-mochi-ui.mjs` — runs new checks and asserts retained terminal history.
7. `package.json` — includes lasting regressions in `verify` and `test:mochi`.
8. `dist/backend.js` — matching backend bundle.
9. `dist/frontend.js` — matching frontend bundle.
10. `MOCHI-BUG-03-AUDIT.md` — historical investigation with implementation pointer.
11. `MOCHI-BUG-03.md` — this delivery report.

Generated screenshots, temporary fixtures, verification logs and comparison builds are excluded from the commit. No native Messages files, scheduling provider helpers, approved Mochi chat styles or main/upstream branches were modified.

## Remaining limits and controlled live check

- Previously canceled/expired jobs remain terminal; users must explicitly schedule a new opportunity if desired.
- Scheduled opportunities still have the existing one-hour post-due window. Offline presence, configured delays, quota pressure or downtime can legitimately prevent delivery within it. Actual room-context changes still invalidate pending opportunities. A settings form opened before a real conversation change may correctly fail its stale-revision check.
- Settings show only 20 retained terminal summaries; older records remain durably stored. Historical cancellation explanations cannot distinguish explicit cancel from room invalidation because that distinction was not recorded previously.
- Runtime events require the updated backend and frontend pair. Reopening/refreshing remains the recovery path if an event cannot be delivered. The existing single-runtime storage assumption is unchanged; this is not multi-worker coordination.
- Before MOCHI-INTEGRATION-01, perform a controlled live check in a disposable room with a valid provider and existing background opt-in: schedule two minutes ahead, click unchanged Save settings, reopen, confirm Scheduled remains, and confirm one reply/completion at due time while Online. Then explicitly cancel a new job and confirm Canceled history persists with no message. For repetition testing, schedule a second distinct occurrence after the first completion and compare occurrence IDs and provider evidence without altering identical legitimate content.

Only a local `mochi` commit is authorized for this batch. No push, deployment, rebase, force-push or upstream/main change.
