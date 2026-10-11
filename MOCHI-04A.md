# MOCHI-04A checkpoint — durable backend scheduler

Implemented on the local `mochi` branch. No deployment, push, real provider call, native Pocket messaging rewrite, or approved UI redesign.

## Behavior

- Dedicated server dispatcher starts with Pocket's extension backend. Browser presence is never used to determine account eligibility. Interactive Stop cannot cancel server-owned jobs.
- Explicit account and room opt-in, schedule creation within 30 days, and cancellation are available in the existing Room settings form. Existing rooms remain opted out; their messaging settings are unchanged.
- Account settings and spending reservations use account storage. A minimal extension-storage registry contains participating account identifiers and global attempt timestamps, never credentials. Generation uses the room's existing account-scoped connection reference.
- Room files gain optional versioned scheduling metadata: jobs, occurrence IDs, deadlines, attempts, claims, delivery state and completion tombstones. No existing history is migrated. Unknown/damaged records fail closed and are preserved.
- Delivered occurrence tombstones are committed atomically with messages and notification records. They survive message deletion; retries cannot recreate deleted delivered messages. Interactive acceptance receipts are not used as completion evidence.
- Generated text is persisted before delivery and omitted from ordinary frontend state. A restart after generation can deliver the stored draft without another provider call.
- Claims expire after four minutes. Shutdown aborts active jobs; recoverable work survives. Abrupt host termination leaves a durable claim for recovery after expiry.
- Account and room opt-out cancel pending work and abort active jobs. Room content/settings revisions supersede old work. Source ownership and generation permission are checked before generation, after generation and before delivery.
- At most two concurrent scheduled jobs globally, one per account per dispatcher wake, and one generation per room across interactive/background jobs. Durable hourly limits: 20 scheduled attempts globally, 6 per account, 3 per room. Generation failure consumes its reservation; failed storage reservations can conservatively consume capacity without invoking a provider.
- Temporary failures use 1/2/4-minute bounded retry timing with at most three generation attempts. Credential, ownership, permission and unknown failures pause for attention. Generated-delivery recovery does not regenerate; repeated delivery failures pause after a bounded recovery count and retain the private draft.
- Jobs expire one hour after due time. Expired work is marked missed without AI; at most one opportunity per account is considered per 30-second wake. After a successful message changes the room revision, older jobs from the superseded revision cancel rather than delivering a catch-up batch.

## Validation

- New scheduler regressions: 15 tests / 52 assertions, all passing. Includes server-only fixture delivery, restart before due, shutdown during generation, active/expired claims, persisted generated draft, failed final rename, duplicate dispatch, user deletion, multi-account providers/notifications, account opt-out, revision conflicts, ownership revocation, durable limits, retry caps, overdue work and damaged registry handling.
- Full verification: type checking, production backend/frontend builds, existing Pocket/Mochi regressions, new scheduler regressions and Pocket contracts pass (182 tests / 1,037 assertions).
- Simulated Chromium 149.0.7827.55: existing UI checks plus account/room opt-in, schedule creation and cancellation pass at 320px, 390px and 900px. Screenshots are ignored local artifacts under `tmp/mochi-final-ui-review/scheduler-*.png`; no visual baselines were replaced.
- Standard baseline browser remains unavailable; baseline comparison is blocked, not passed.
- All generation uses synthetic providers; server/browser-closed behavior is simulated. No live Lumiverse/Ubuntu/provider-costing test was performed.

## Files

`src/mochi/scheduler.ts`, `src/mochi/scheduling.ts`, `src/mochi/service.ts`, `src/mochi/types.ts`, `src/mochi/view.ts`, `src/backend.ts`, `tests/mochi-scheduler.test.ts`, `scripts/check-mochi-ui.mjs`, `package.json`, `dist/backend.js`, `dist/frontend.js`, and this report.

## Risks / rollback

- Assumes one active Pocket extension runtime. The host storage API offers atomic rename but no cross-process compare-and-swap or fsync contract. This is not a guarantee against concurrent independent runtimes or sudden power loss during disk writes.
- A crash after a paid provider response but before persisting its draft may require a second paid request. Exactly-once saved message delivery is protected; exactly-once provider billing is not promised.
- Existing token/context limits remain unchanged. Provider-specific context ceilings still depend on correct room configuration.
- There is no graceful extension-unload callback exposed by the inspected runtime; shutdown recovery relies on durable state and leases rather than an unload handler. A provider that ignores cancellation and never settles can hold the current runtime's dispatcher until the host restarts.
- Cancel and recreate paused jobs after fixing their sources; this checkpoint does not add an automatic unpause loop.
- Completion tombstones are retained. At 10,000 occurrences per room, new scheduling is refused instead of forgetting prior deliveries. Pending queue limit is four per room.
- Disable account background messaging before rollback; retain account/room files and the registry. Revert the checkpoint commit and rebuild its matching source. Earlier Mochi preserves extra room fields but does not execute schedules. Do not delete histories or restore `.pending` files blindly.

Presence, AI metadata, natural response modes and idle schedules belong to subsequent checkpoints and are not claimed complete here.
