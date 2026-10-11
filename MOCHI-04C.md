# MOCHI-04C checkpoint — optional AI behavior metadata

Optional room setting permits delivery timing and own-character status suggestions during an already authorized reply request. Account and room background opt-in are required. Existing rooms default to the previous text-only behavior.

- Structured output may add `behavior:{delivery:"now"|"later",delayMs:0..86400000,status?:"online"|"away"|"dnd"|"offline"}`. Metadata never authorizes additional model calls or arbitrary schedules.
- Invalid/nonfinite/out-of-range/contradictory metadata falls back to ordinary timing with no status suggestion and no retry. Message/responder validation remains mandatory.
- Current presence delays and Offline eligibility are enforced before generation and delivery. AI cannot override manual locks. AI status changes apply **after delivery**, atomically with the message; future configured transitions remain effective.
- Generated deferred text is durable and excluded from public histories, notifications and frontend state until delivery. Recovery delivers the draft without regenerating. Opt-out/cancellation removes undelivered content; later user/content revisions supersede it.
- Interactive generation keeps existing Stop behavior while the provider is running. Once accepted as a private deferred delivery, it is server-owned and survives browser closure.
- Optional behavior requests share durable account/room/global generation reservations with scheduled generation. No extra provider call decides a status or checks a timer.
- Deferred rerolls are refused, preserving the original reply rather than silently introducing delayed message replacement semantics.

Validation: type checks, both production builds, 190 tests / 1,080 assertions and Pocket contracts pass. Scheduler/behavior suite: 23 tests / 95 assertions. New checks cover one-call private deferral/restart, interactive deferral, status timing/manual locks, malformed metadata and cancellation. Simulated Chromium at 320/390/900px passes existing UI/settings controls and the optional behavior toggle. Standard visual-baseline comparison remains blocked by its unavailable browser. No live Lumiverse/Ubuntu/provider-costing testing.

Changed: `src/mochi/behavior.ts`, `src/mochi/generation.ts`, `src/mochi/types.ts`, `src/mochi/scheduling.ts`, `src/mochi/scheduler.ts`, `src/mochi/service.ts`, `src/mochi/view.ts`, `tests/mochi-scheduler.test.ts`, `scripts/check-mochi-ui.mjs`, both bundles and this report.

Request counts: one request to generate text plus optional metadata; zero to wait, change status, cancel or deliver an already stored draft. Provider failure retry limits from 04A remain. The crash-before-draft-save billing window and single-runtime storage limitations remain.

Rollback: disable account background generation before reverting this commit; retain room files, private pending jobs and delivery tombstones. Do not restore private drafts into visible messages manually. Natural response modes and idle generation belong to the next checkpoint.
