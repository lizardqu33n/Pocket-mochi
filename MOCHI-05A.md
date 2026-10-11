# MOCHI-05A — persistent fictional account foundation

Implemented against `63d2df4` on local `mochi`. This checkpoint is backend persistence/protocol work only. Profile/onboarding screens, per-phone startup preferences and explicit legacy-room assignment remain MOCHI-05B–05D. The approved v1 interface, branding and chat layout are unchanged. No push, deployment, installation, rebase, upstream change or live provider call.

## Model and persistence

`mochi/v1/fictional-accounts.json` lives in the authenticated real Lumiverse user's storage. Its versioned bank contains owner ID, revision, selected fictional account ID and up to 100 profile records (including archived records). Each profile has a stable `account_<32 hex digits>` ID, real owner, its own revision, display name, optional normalized username, persona-derived avatar reference, saved persona identity, creation/update timestamps and archival state. No passwords, authentication service, API credentials or RP-derived selection.

Records and selection use one atomic `.pending`/rename replacement with per-real-user serialization and optimistic revisions. Malformed/future-version/foreign-owner/duplicate account records fail closed without defaults overwriting them. Abandoned pending files are not promoted automatically. Concurrent creates append safely; stale edits/selections are rejected.

The authoritative room association is an optional immutable `accountId` in each **new** account-owned room. The account API exposes associated `roomIds` by scanning committed validated room records; it does not maintain a second index that could disagree after an interrupted write. Account records must already exist before room creation. A failed room rename cannot expose a half-associated room, and successful creation needs no subsequent index write.

Existing rooms remain unassigned and accessible exactly as before; no automatic migration, persona guessing, room rewriting or merging occurs. Room IDs, messages, snapshots, receipts, notifications, runtimes, claims/drafts/tombstones and budget files are retained. Reassignment/import is deliberately absent until 05D.

## Ownership, identity and lifecycle

- Client room operations explicitly carry `accountId` for owned rooms. Missing/wrong account scope cannot read or mutate them. The default legacy inbox contains only unassigned rooms. Account inboxes, histories, notifications and active jobs are separately filtered.
- Ownership is checked at creation, reads and every room mutation, including sends/rerolls/actions, notification reads/clears and schedule/presence/idle controls. Server work resolves the saved room association; it never consults the currently selected fictional account. Existing real-user-scoped provider/persona/character checks remain in force before generation/commit.
- A per-real-user guard serializes account state changes with short room mutations/commits. It never surrounds a provider request. Different real users remain independent; existing generation concurrency/spending limits stay scoped to the real user/global runtime, preventing quota bypass by creating profiles.
- Successful selection aborts interactive generation/pending sends from the previously selected fictional account. Providers that ignore abort cannot commit late replies; accepted user messages/receipts remain saved. Server-owned schedules stay attached to their original room/account and survive selection changes/restart.
- Profile edits are **prospective for newly created rooms only**. Existing room identity snapshots and historical message authorship remain unchanged. New rooms copy the saved account persona with the account display name/avatar. Room-specific identity replacement is rejected for owned rooms until an explicit update/import policy is provided later. Local own-message labels still read **You**. Character names are unaffected.
- Notification events/acknowledgements carry fictional account scope; views ignore events from other fictional accounts. Stored notification ownership is validated against the room. No notification clear deletes messages.
- Account deletion is initially confirmed **archival with `roomPolicy: 'preserve'`**, not destruction. Omitted confirmation/policy and requested permanent room deletion are rejected. The profile tombstone and all rooms remain; associated rooms and their autonomous work become inaccessible/ineligible. Archive aborts in-flight work. Restore requires the current revision and explicit confirmation that preserved schedules may resume, subject to original expiry/limits. No room/job records are rewritten or erased for archival.

Running-job ownership permits immediate Stop/opt-out cancellation without waiting for a new storage read. A full regression initially exposed a staged-delivery race introduced by awaiting that check; the corrected implementation uses validated job ownership for immediate abort and still validates persisted room ownership for updates. The unchanged MOCHI-04 staged-delivery test now passes.

## Protocol available for subsequent screens

Authenticated backend actions: `mochi:accounts`, `mochi:account_create`, `mochi:account_update`, `mochi:account_select`, `mochi:account_archive`, `mochi:account_restore`. Account operations reply with `mochi:accounts`, including bank revision, selected ID, profiles, derived room IDs and preservation warnings. Update/archive/restore require profile revision; selection requires bank revision. Caller-supplied real `userId`/owner values cannot override the host callback.

Owned-room actions use their existing protocol plus explicit `accountId`; creation derives the room persona from that profile. The existing view propagates its state's account scope on requests, cancellation and notification acknowledgement, without rendering any new controls. Username validation accepts an optional leading `@` and stores at most 32 letters/numbers/dots/underscores/hyphens. Custom portrait editing/upload and profile-selection UX are deferred to 05B.

Selection is durable at **real-user scope for this foundation**. This is not a claim of per-phone last-used behavior. 05C will inspect/use actual stable phone identity and implement preferences; no fragile phone identifier was invented here. The current ordinary UI continues using the legacy inbox, so fictional profiles are exercised through tests/protocol until later screens exist.

## Verification

| Check | Result |
|---|---|
| `bun run verify` | PASS: type checks, both production builds, 223 tests / 1,252 assertions, Pocket contracts |
| Targeted Mochi suites | PASS: 97 tests / 587 assertions, including 16 new account tests |
| Existing stability / MOCHI-04 suites | Retained unchanged and passing |
| Simulated Chromium 149.0.7827.55 | PASS at 320px, 390px and 900px |
| Standard approved visual-baseline suite | BLOCKED: required `chromium_headless_shell-1234` executable unavailable; no baselines replaced |
| Live Lumiverse / Ubuntu / browser-closed / paid providers | NOT RUN |
| Source/bundles | Both final bundles rebuilt from final source during verification |
| Diff / sensitive files | Clean whitespace check; zero credential-pattern matches; no private data or screenshots staged |

New tests cover multiple real/fictional accounts, owned personas/portraits, separate inboxes/notifications/history, every wrong-scope mutation, prospective identity changes, stale revisions, switching during an abort-ignoring provider request, archive/restore with retained schedules, server delivery after selection/restart, interrupted account/room replacement, malformed records, caller spoofing, notification routing, scoped edits/rerolls/clear, and revoked sources. Fixtures are synthetic; restart/storage/provider/time behavior is simulated. Existing Chromium checks validate preserved messenger/settings/actions/notification behavior rather than nonexistent account onboarding screens. Synthetic screenshots remain ignored under `tmp/mochi-final-ui-review`.

## Exact changed files

- Added `src/mochi/accounts.ts`: model, validation, atomic persistence, revision-safe CRUD/selection/archive/restore.
- Changed `src/mochi/service.ts`: canonical room association, scoped access/state/actions/events, account endpoints and cancellation coordination.
- Changed `src/mochi/types.ts`: optional room/state/notification account identifiers.
- Changed `src/mochi/scheduler.ts`: scoped room cancellation while retaining server-owned room resolution and spending rules.
- Changed `src/mochi/view.ts`: protocol scoping/event filtering only; no layout/styles.
- Changed `src/backend.ts`: return correctly scoped Mochi state after scheduling controls.
- Added `tests/mochi-accounts.test.ts`; changed `package.json` to include it in verification/Mochi runs.
- Rebuilt `dist/backend.js`, `dist/frontend.js`; added this report.

Pocket native Messages/contacts/device/profile/phone modules and existing tests are unchanged.

## Limits and rollback

No account picker/profile editor, phone preference, custom-avatar UI, explicit legacy import/reassignment or permanent account/chat deletion yet. Archived profiles still count toward the 100-record bound. Bank corruption blocks owned accounts without erasing them; legacy rooms continue to work. Selection currently interrupts the previous account's interactive work across this real user's sessions; phone/session-specific selection belongs to 05C. Archival preserves leases/drafts; after restore, interrupted work follows existing claim recovery/expiry, rather than guaranteeing immediate delivery.

Existing single-runtime/atomic-rename/no-fsync limitations and possible repeated billing after a crash before draft persistence remain. A provider that never settles can retain a slot until restart. Cancellation cannot reverse a rename that has already crossed its commit boundary. Nothing in this checkpoint proves live host behavior.

**Rollback must preserve fictional isolation.** Disable real-user background messaging and back up all room/account/registry/budget files first. If no account-owned rooms exist, revert this local checkpoint and rebuild matching bundles. If account-owned rooms exist, a plain revert is unsafe: pre-05A code would treat them as legacy shared rooms and might execute their jobs without recognizing archival. Preserve those files outside the old room-scan directory (or restore the prior legacy-only backup while retaining account data separately) before using old code, or retain the ownership guard. This requires a deliberate reviewed recovery operation, not an automatic deletion/migration. Never delete histories, receipts, drafts, tombstones or budget records to reset state. No such recovery operation was performed here.
