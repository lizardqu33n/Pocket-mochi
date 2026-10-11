# MOCHI-04B checkpoint — presence and delayed replies

Adds durable Online, Away, DND and Offline presence without a presence system based on browser connectivity. The approved header, branding, portraits, bubbles, menus and composer remain intact. Only settings controls and status-dot colors/meta text change.

- Online permits an immediate reply. Away and DND both delay replies by configured timers (defaults five and fifteen minutes; editable from zero to 1,440 minutes). Offline excludes the character from generation and delivery.
- Per-character room settings offer manual status locks, release to automatic status, adjustable delays and scheduled automatic status transitions. A manual lock takes precedence over every transition.
- Automatic transitions are durable absolute deadlines, evaluated deterministically. No AI request polls status. This checkpoint offers bounded one-off transitions rather than recurring calendar rules.
- Delayed replies require account and room background opt-in. Offline queues wait for eligibility with a 24-hour expiry. Delay is measured from the triggering user message; time already spent waiting Offline counts toward Away/DND delay after eligibility returns.
- A newer user message supersedes older pending delayed response work; stored user/character history is retained. The next generated response uses the latest room revision. Queue limits, ownership checks, cancellation and restart recovery from 04A remain in force.
- Group automatic selection includes only currently eligible characters whose delay has elapsed. Offline characters cannot be selected by the provider. Immediate rerolls refuse unavailable characters, preserving the original message.
- A lightweight durable acceptance acknowledgement clears an accepted draft even if presence prevents generation afterwards; it does not mark generation complete or alter interactive receipts.

## Validation / counts

Full verification passes: type checks, both production builds, 186 tests / 1,056 assertions and Pocket contracts. Scheduler/presence suite: 19 tests / 71 assertions. Four added regressions cover configurable Away/DND delay, restart, Offline/manual overrides/scheduled eligibility, newest-message coalescing and opt-out safety.

Simulated Chromium 149.0.7827.55 checks at 320px, 390px and 900px cover status selection, manual-lock release, configurable DND delay and existing messenger interactions. Local screenshots: ignored `tmp/mochi-final-ui-review/presence-*.png`. Standard baseline comparison remains blocked by the unavailable required browser. No baseline replacement or live Ubuntu/provider test.

Online direct replies use one normal provider call. Waiting status checks use zero. A coalesced delayed response uses one call when eligible; malformed/provider failures retain the existing bounded safeguards.

## Files / remaining limits / rollback

Changed: `src/mochi/presence.ts`, `src/mochi/scheduling.ts`, `src/mochi/scheduler.ts`, `src/mochi/service.ts`, `src/mochi/generation.ts`, `src/mochi/view.ts`, `src/mochi/styles.ts`, `src/backend.ts`, `tests/mochi-scheduler.test.ts`, `scripts/check-mochi-ui.mjs`, both bundles and this report.

Presence dots reflect status when the view renders; scheduled changes may require refreshing the view to show their latest color. No browser timer controls backend eligibility. Transition history is bounded to sixteen entries per character; invalid/full configurations preserve previous records. Full daily recurring status schedules are not implemented.

The 04A single-runtime, atomic-rename, cancellation commit-boundary and provider-billing limitations remain. Background scheduled work observes stored presence at dispatch and commit; a status change during a provider request discards/pauses affected work rather than delivering through Offline.

Disable background messaging before reverting this checkpoint. Preserve all room/account files. AI behavior metadata and natural/idle response modes are not claimed implemented by this checkpoint.
