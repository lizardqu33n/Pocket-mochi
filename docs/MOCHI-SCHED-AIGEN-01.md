# SCHED/AIGEN-01 owner acceptance fixes — October 19, 2026

Baseline: remote `test-mochi` verified at
`39cc4bd6a293a233eab86b42fa5c9c2660989b36`; `beta-mochi` at
`de78a44cd3a41c3af14ac911a2c79bef81276a76`. Work used a fresh isolated clone,
plus a separate detached baseline reproduction worktree. Existing owner checkouts,
CSS sources, installed Lumiverse and synced project references were not edited.

## Causes and changes

- **Missing sleep:** the generation contract specified sparse blocks, illustrated
  only work, allowed an empty block list, and emphasized free-time fallback. It
  had no sleep guidance. The strict parser maps every valid block; it does not
  filter sleep. Synthetic sleep survives generation, parsing, explicit Apply and
  restart. Invalid intervals/overlaps reject the entire draft. The owner's actual
  provider output was unavailable, so its exact omission/rejection is unproven.
  The contract now requests reviewable recurring sleep for typical characters,
  uses local IANA wall time, explains overnight start days, weekends and daytime
  sleep for night workers, and respects explicit facts, partial requests and
  intentionally sleepless characters. It proposes hours only when unspecified,
  without adding hourly filler or new work/shift facts. Free time is for genuinely
  unspecified waking hours, not a sleep substitute.
- **Disabled toggle / deleted entry reappears:** room controls edited a disposable
  clone outside the settings draft; redraw rebuilt it from persisted data, dirty
  detection missed it, and Save settings sent no routine. The separate Apply
  weekly routine button already persisted correctly. Routine edits now join the
  staged form, survive category/character navigation and redraw, and commit with
  settings in one atomic room replacement. The backend validates all patches,
  current membership, real/fictional ownership, room revision and the original
  effective routine (including inherited defaults), records audit snapshots and
  receipts, clears stale proposals/overrides and invalidates pending replies.
- **Delete semantics:** Remove entry removes just that entry. Removing the last
  entry persists an explicit empty plan, retaining its enabled setting. New Delete
  weekly routine removes all entries and disables the plan. It retains timezone,
  autonomy, locks and quiet-hour settings. Both require Save settings or the
  explicit Apply button in a chat; character defaults require Save character
  profile. An empty/disabled chat plan replaces defaults and cannot resurrect
  through inheritance. Only Use character routine defaults removes that override.
  No schema change, autosave, automatic generation or migration is introduced.
- **Character Preferences distinction:** on untouched baseline, disabling and
  removing entries with Save character profile both passed restart tests. Opening
  availability nevertheless eagerly created a routine and marked unspecified
  defaults dirty; this is now lazy until a user edits. Help text distinguishes
  the two Save scopes, and Save settings refuses to discard unsaved profile edits.
  The owner's exact original screen/button cannot be established from the report.

The shared editor and AI preview now show a live advisory if no English sleep
label is recognized, if sleep start-days omit part of the week, or if a block is
under 4/over 12 hours. These are review prompts, not biological requirements or
hard validation rules. Localized/unusual labels, naps, overnight carryover and
nonhuman characters require owner judgment. Edit blocks/JSON, regenerate explicitly,
or intentionally accept; no hours are inserted by the parser or backend. Strict
draft rejections expose controlled validation reasons (e.g. overlap, bad times,
locked entries, wrong timezone, truncation), without exposing provider/storage
errors. Rejected drafts save nothing.

## Reproduction and verification

Untouched baseline, using deterministic fixtures and production DOM controls:

1. Enabled chat routine → uncheck Enable weekly routine → Save settings → backend
   restart/read: **fails**, expected false, received true.
2. Enabled chat routine → Remove its last entry → Save settings → backend
   restart/read: **fails**, expected zero entries, received one.
3. Initial regression run: disabled/removal edits did not mark the form dirty;
   whole-routine delete, sleep prompt guidance and warning were absent: five
   failing assertions (16 imported account checks passed).
4. Save character profile → reopen/restart for disable/removal: **two passes** on
   baseline. This is a separate save path, not a claimed baseline backend defect.

New regressions cover Save with and without redraw, navigation, re-open/restart,
inherited vs explicit empty/disabled plans, independent account isolation, wrong
owners, receipts, stale room/default edits, atomic write failure, audit/undo,
explicit inheritance, character defaults, missing-sleep preview acceptance,
actionable rejection/privacy, day/night and sparse fixtures, Sunday overnight and
both DST transitions. Organized navigation exercises 320/900px DOM environments;
these are not screenshots or physical browser/layout acceptance.

The existing SCHED/AIGEN suites retain locks, quiet hours, explicit autonomy,
generation consent and draft review, cancellation, bounded actions, status
interactions, reply recovery and provider-boundary tests. All provider responses
are synthetic; no real model quality claim is made. Test result counts are
recorded below; imported account fixtures are counted again when suites run
separately. Initial long DOM navigation runs exceeded Bun's
default five-second timeout; reruns use an explicit longer timeout, serially.

Completed validation:

- New fix regressions (20), routines, routine generation, profiles and presets:
  **81 passed, 0 failed**, across five files (`--timeout 30000`).
- Scheduler, scheduling lifecycle, automatic replies and legacy response:
  **110 passed, 0 failed**, across four files.
- Settings workspace: **28 passed, 0 failed** (`--timeout 60000`).
- TypeScript, backend build, frontend build and editable CSS contract: **passed**.
- `git diff --check`: passed. No CSS source file changed.

The first combined profiles/presets/workspace run was stopped after a workspace
test exceeded its default timeout; it is not counted as a completed run. The
successful serial workspace rerun took approximately 193 seconds. The complete
focused five-file run took approximately 61 seconds. Broader unrelated context,
memory and texting suites were not rerun; their five baseline failures are
documented in MOCHI-AIGEN-01.md and are outside these fixes.

## Owner acceptance on the test build

1. Open Chat Settings → Availability & Schedules → Edit character → Availability.
   Uncheck the **chat** Enable weekly routine; switch categories and return;
   Save settings, reopen and later restart the test host when convenient. It
   should remain off. Check a different fictional account is unchanged.
2. Remove one entry and Save settings. Then Delete weekly routine and Save
   settings. Reopen: entries stay absent and whole deletion stays off, even if
   the character has enabled defaults. Undo should restore the prior state.
   Use character routine defaults only when inheritance is intended.
3. In character-wide defaults, use Save character profile for equivalent edits.
   Save settings should direct you to that button while profile edits are dirty.
4. Generate a typical sparse day-worker routine, then a stated night worker.
   Inspect local timezone, recurring sleep including weekends, Sunday overnight
   and no overlapping work. Review/edit/regenerate before Apply. An intentionally
   empty or partial routine remains allowed with a visible warning. Invalid
   overlap should reject the entire draft and explain why.
5. Check keyboard focus/mobile wrapping, locked statuses, quiet hours, draft
   Reject/Regenerate and latest-change Undo. Physical browser/installed-host
   acceptance and live provider quality remain owner checks.

Publication is only to `test-mochi` by normal non-force push after remote recheck,
with both dist bundles built from the same source. No beta promotion, host
deployment/reload, native installation, private account/RP data, credentials,
authentication change or real provider call is part of this work.
