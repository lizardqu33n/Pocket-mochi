# MOCHI-05D — Account settings and explicit chat assignment

Account settings are separate from chat settings. Owned chats display their saved identity rather than offering an accidental persona resnapshot. Profiles can be archived/restored with confirmation and preserved chats/schedules.

Assignment is opt-in from chat settings: load profiles, choose an active owned target, and explicitly confirm preservation. The transaction updates only room ownership, an independent association revision, and notification ownership. It preserves message/notification revisions, histories, edits, receipts, persona snapshots, runtime jobs, scheduled records and timestamps. No bulk migration occurs. Active generation blocks assignment rather than discarding work. Reassignment is supported with the same safeguards.

Validation: type check and production build passed; targeted assignment suite 19 tests/116 assertions (includes 16 shared account regressions); all Mochi suites 106 tests/634 assertions. Synthetic tests cover interrupted replacement/restart, stale ABA reassignment, foreign ownership, preserved edited history and receipts, scheduled delivery after assignment, and active-generation refusal. No live Lumiverse/provider verification.

Changed source: `src/mochi/{types,service,view,profile-screen}.ts`; `tests/mochi-assignment.test.ts`; package test lists and production bundles.

Rollback: stop Mochi autonomous generation before any version rollback. Reassign a chat explicitly to its previous fictional account if desired; this does not resnapshot its persona. Legacy assignment cannot currently be undone to unassigned through the UI. Keep backups of the complete real user's `mochi/v1` storage and scheduler registry together. Do not downgrade below 05A against owned room files: old versions do not understand fictional-account isolation. Code-only checkpoint rollback does not automatically restore data ownership.

Remaining limits: assignment is one room at a time; archive preserves data and pauses autonomous eligibility, restore may resume retained schedules under existing expiry/quota rules. The existing single-runtime/atomic-file assumptions remain unchanged.
