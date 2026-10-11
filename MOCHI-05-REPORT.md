# MOCHI-05B–05E consolidated delivery

Implemented sequentially on local `mochi`, starting from accepted 05A (`330a266`). No push, deployment, rebase, force-push, main/upstream changes, or live account/provider operations. Approved chat CSS/branding and native Pocket messaging/RP behavior are unchanged.

## Checkpoints and commits

| Checkpoint | Local commit | Delivered | Validation before proceeding |
|---|---|---|---|
| 05B | `b637b7f` | Profile create/edit, owned persona selection, optional usernames, portraits/gallery/upload | Typecheck/build; profile target 18 tests/109 assertions; Mochi regressions 99/599 |
| 05C | `d0a6443` | Account picker/create flow; verified logical-phone selection; last-used/always-picker startup | Typecheck/build; phone target 20/113; Mochi regressions 103/615 |
| 05D | `974077f` | Separate profile/chat settings; confirmed archive/restore; explicit safe legacy assignment/reassignment | Typecheck/build; assignment target 19/116; Mochi regressions 106/634 |
| 05E | Commit titled `test(mochi): verify multi-account workflows and navigation (MOCHI-05E)` | Combined regressions, Chromium onboarding/account/scheduling/notification/mobile checks; four small UI-state fixes | Final `bun run verify`: 235 tests, 1,310 assertions, zero failures; Pocket contracts passed; combined Chromium checks passed |

Targeted runs importing the shared account fixture also register its 16 existing tests; their totals are not additive. Full verification contains 109 Mochi tests alongside 126 Pocket regressions. See individual checkpoint reports for implementation evidence and historical test totals.

## Data safety

- Real Lumiverse user remains the storage/API boundary. A fictional account cannot choose another real user through a payload. Owned character, persona, image and connection lookups use scoped host APIs.
- Profiles and per-phone selections use the existing atomic account bank with optimistic revisions. Room ownership is canonical on the room itself; derived room lists require no second index write. No bulk migration or destructive cleanup.
- Profile changes affect future rooms only. Existing room persona snapshots and message authors remain intact. Owned chat forms expose saved identity separately from profile settings.
- Explicit assignment requires a selected owned active target plus preservation confirmation. It changes only fictional ownership, independent association revision, and notification ownership. Content/notification revisions, histories, versions, receipts, runtime jobs, occurrence/tombstone records, pending schedules and timestamps are preserved. The association revision prevents stale A→B→A requests without invalidating saved scheduling revisions.
- Active interactive/deferred generation blocks assignment. Interrupted replacement retains the committed room; abandoned pending files are ignored. A preserved schedule delivered after assignment/restart using the original saved room persona in tests.
- Switching clears visible account state, not saved unread history. Generation selection checks and cancellation retain 05A safeguards. Server jobs remain tied to their room rather than the visible account/phone.
- Archive preserves all room data and pauses autonomous eligibility; confirmed restore may resume schedules under existing expiry/quota rules.

## Confirmed issues fixed in 05E

1. Delayed portrait reads could submit after leaving their profile draft. Reads now require the same draft and an attached form; regression test covers cancel/switch.
2. Editing unrelated profile fields unnecessarily revalidated an unchanged saved portrait. Unchanged portrait choice is omitted from the update; explicit portrait changes still require ownership checks.
3. Late source-account notification batches/events could repopulate visible records after assignment. Known room associations now filter these events and stale state responses; saved records are not deleted.
4. Notification navigation from Pocket home was intercepted by the new startup picker. A known room on the originating logical phone can reopen directly; other phones/unknown rooms follow startup selection. Contract and targeted tests cover this.

## Final verification

- `bun run verify` passed: typecheck, production backend/frontend builds, **235 tests / 1,310 assertions**, then **Pocket contracts passed**. Contract onboarding now explicitly opens the account picker and unassigned legacy inbox before exercising the original independent-room workflow; native phone/preferences equality checks remain.
- Combined synthetic Chromium checks passed at **320px, 390px and 900px**, browser **149.0.7827.55**. Covers original chat keyboard/continuation/Stop/actions/settings/presence/notification behavior plus account creation/editing, long names, separate identity forms, switching, empty isolated inbox, per-phone startup, explicit legacy assignment, archive cancellation/archive/restore, server scheduled delivery while another account is selected, scoped unread counters and notification clearing without history loss. Horizontal overflow checks pass.
- Screenshots inspected for the account picker at 390px and profile form at 320px. Existing chat and new account screenshots are in ignored `tmp/mochi-final-ui-review/`; all contain synthetic data. Other widths and light chat screenshots were generated by the checks.
- **Standard visual-baseline suite BLOCKED**, not passed: required `chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe` is absent, confirmed outside the sandbox. No browser installation or baseline replacement. The explicit available Chromium run is separate from standard baseline comparison.
- Fresh independent builds matched both committed production bundles byte-for-byte. `git diff --check` passed. Reviewed changed paths and added-content credential patterns: no private keys/tokens detected; screenshots, temporary fixtures/logs and account data are ignored and excluded from commits.
- These are simulated host/storage/provider tests and source inspection. No live Lumiverse, Ubuntu/browser-closed scheduling, real credential/provider or real image-upload test was performed.

## Exact changed files since 05A

Source: `src/backend.ts` (read-only Mochi phone resolver); `src/frontend/controller.ts` (Mochi entry/notification route only); `src/mochi/accounts.ts`; `src/mochi/service.ts`; `src/mochi/types.ts`; `src/mochi/view.ts`; new `src/mochi/profile-screen.ts`, `src/mochi/account-picker.ts`, `src/mochi/phone-selection.ts`.

Checks: `tests/contracts.mjs`; `tests/mochi-accounts.test.ts` (fixture export only); new `tests/mochi-profiles.test.ts`, `tests/mochi-phone-selection.test.ts`, `tests/mochi-assignment.test.ts`; `scripts/check-mochi-ui.mjs`; new `scripts/check-mochi-accounts-ui.mjs`; `package.json`.

Artifacts/documentation: `dist/backend.js`, `dist/frontend.js`; `MOCHI-05B.md`, `MOCHI-05C.md`, `MOCHI-05D.md`, this report. No approved chat styles or existing visual baseline files changed.

## Limits and live verification

- Verify first-use picker, persona/gallery access and real PNG/JPEG/WebP upload (up to 2 MB) in Lumiverse before wider use. Gallery currently offers its first 100 allowed images; canceled uploads may remain in the host gallery and are not automatically deleted.
- A phone key identifies a persisted logical Pocket phone in a chat/character/device-owner context, not a physical handset spanning unrelated RP chats. Unverified/unavailable persisted identity visibly falls back to shared real-user startup preferences. Confirm both supported and fallback paths live.
- Assign one room at a time. Current UI does not unassign an owned chat back to legacy. Persona is intentionally preserved during assignment, including a legacy custom persona that differs from the destination profile.
- After an uncertain profile creation/save response, refresh accounts before retrying; no destructive deduplication of similar profiles is performed. Existing revision conflicts are rejected and surfaced.
- Existing single-runtime locking/atomic-file assumptions remain. There is no new cross-process CAS/fsync guarantee. Provider billing after a crash before generated output is durably saved retains the pre-existing risk; no scheduling/generation rewrite was attempted.
- Run a controlled live test with two fictional accounts/two supported phones, a legacy chat backup, and one scheduled occurrence. Check account-scoped notifications, retained saved persona, restart delivery and archive/restore eligibility. Real data/pending schedules were never used in this batch.

## Safe trial and rollback

Use the local built extension in a test Lumiverse account. Open Mochi, create/select a profile, and create a new room. Switch accounts to verify separation. For a legacy room, open **Unassigned legacy chats → Room settings**, load profiles if needed, choose a destination, and check preservation before assignment. Review its saved persona/history before enabling autonomous work. Nothing auto-assigns old rooms.

Before any version rollback, stop Mochi autonomy and active generation; back up the complete real-user `mochi/v1` files plus scheduler registry together. Revert checkpoint commits newest-first and rebuild/verify, stopping on conflicts. A code revert does not revert stored assignment or persona data. Keep optional phone/association metadata; do not erase it. To reverse ownership, use explicit reassignment to the previous fictional account, preserving the saved persona. Do not downgrade below 05A with owned files in the old scan path: pre-account code cannot enforce fictional-account isolation. Follow `MOCHI-05A.md` for deeper rollback precautions. Native Pocket phone files require no migration or rollback from this batch.

Screenshot review paths (local, uncommitted): `tmp/mochi-final-ui-review/accounts-multiple-{320,390,900}.png`, `accounts-profile-{320,390,900}.png`, `accounts-assignment-{320,390,900}.png`, `accounts-notifications-{320,390,900}.png`, and `layout-review-{320,390,900}.png`.
