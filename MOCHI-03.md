# MOCHI-03 — Message Actions, Notifications & UI Refinement

Baseline: `8c669098106830e146afe8db8523cdfd5930742d` on the user's `mochi` branch.
This milestone is a separate commit on that branch. No Ubuntu installation, deployment,
release, upstream/main modification, or pull request is included.

## Changelog

Messages now offer a compact, accessible actions button opening Pocket's surface-local sheet.
Copy uses the clipboard API and reports unavailable access without changing history. Edit saves
nonblank text, retains the message ID/name/portrait/timestamp, and archives the previous text.
Delete requires a second explicit confirmation and removes only the selected message, its archived
versions, and its notification. Closing the sheet cancels the action. Later messages are never
implicitly removed or regenerated.

Reroll is available only for character replies. It uses the current stored history strictly before
the selected reply, the current room settings/stable persona, and the same owned character.
The existing quiet-generation helper, token budgeting, job lock, ownership checks, and Stop flow
are reused. Successful rerolls replace text in place with the same message ID and retain the
previous text in `previousVersions`. Later messages remain byte-for-byte unchanged and are excluded
from the reroll prompt; confirmation explains that they may no longer fit the new reply.
This is a reroll of the current saved conversation prefix, not a historical replay of old provider
settings or character-library revisions. Failure/cancellation preserves the original reply.

Edit/delete actions use durable request receipts and room revision checks. They cancel the room's
active generation; a late provider result cannot overwrite the newer edit/delete. Requests remain
blocked until an aborted provider settles. A separate job-finished event clears stale frontend job
indicators even when a newer edit or refresh superseded the original request.

New character messages create a notification in the same atomic room write as the reply. User
messages, rerolls, repeats, cancelled results, and failed writes do not create new notifications.
Notification IDs match their message IDs. Records contain the actual character name/portrait and
room identity, and are account-scoped; old rooms get no invented/backfilled notifications.
Read changes are separately locked metadata writes that do not invalidate generation context.
Edits/rerolls update existing notification previews; deletion removes the matching record.

Mochi reuses Pocket's in-handset notification surface and exposes its own bell/notification list.
Opening a notification selects and refreshes the correct Mochi room and acknowledges its notices.
Visible room replies are marked read without an extra toast. Duplicate/replayed events are ignored.
Pocket's existing Message notifications and Show notification previews settings control Mochi's
notification visibility/previews. Changing those settings dismisses an existing Mochi toast.
Existing Pocket toasts take precedence. Native Pocket Notification Center, phone badges, devices,
preferences, and RP-linked notification storage are unchanged.

Notifications are connected-session, in-app features. There is no new browser/OS push API,
notification sound, background schedule, or promise of delivery while the server/browser is absent.
The existing System push notifications toggle does not turn Mochi into an OS-push implementation.

The UI adds a restrained Standalone chip where space permits, a rounded room selector, matching
participant/settings controls, and a participant sheet. Consecutive messages from the same saved
identity within five minutes receive closer spacing and share the portrait visually. Names remain
outside content-sized bubbles, with the existing 86% width cap and readable time/edit metadata.
The composer retains Enter/Shift+Enter, empty continuation, responder selection, draft isolation,
and Stop. There are no decorative attachments, online indicators, mascots, or invented counts.

## Changed files

| File | Change |
| --- | --- |
| `src/mochi/types.ts` | Optional prior-version/edit metadata and independent notification types. |
| `src/mochi/service.ts` | Edit/delete, prefix rerolls, notification persistence/read actions, and job-finished events. |
| `src/mochi/view.ts` | Message sheets, clipboard, confirmations, notification list, room selector, participants, and grouping. |
| `src/mochi/styles.ts` | Scoped header, action, sheet, grouping, and narrow-screen styling. |
| `src/mochi/notifications.ts` | New in-handset character notification helper and preview policy. |
| `src/frontend/controller.ts` | Mochi-only notification adapter respecting existing preferences and visibility. |
| `tests/mochi.test.ts` | Targeted action, ownership, concurrency, persistence, cancellation, and notification tests. |
| `tests/contracts.mjs` | Bundled notification delivery/routing/privacy checks while preserving original phone data. |
| `scripts/check-mochi-ui.mjs` | Expanded action, notification, keyboard, selector, and screenshot checks. |
| `dist/backend.js` | Updated production backend. |
| `dist/frontend.js` | Updated production frontend. |
| `MOCHI-03.md` | This changelog, verification, limitations, and rollback guide. |

No Character Chatroom source/assets were copied. No room-file migration or native phone changes
are required: new room/message fields are optional, defaults are applied on read without a write,
and existing unknown fields/history remain preserved on normal updates.

## Verification

- `bun run verify`: type checking, both production builds, **152 tests / 869 assertions**, and
  Pocket's bundled contracts passed. Includes **26 Mochi tests / 204 assertions**.
- Storage tests cover edit/delete/reroll IDs and archives, prefix prompts excluding target/later
  messages, preserved later history, confirmed deletion, stale revisions, concurrent actions,
  duplicate requests across restart, account/source ownership, ignored aborts, original reply
  retention on cancellation/provider failure, failed writes/replacements, and legacy no-write reads.
- Notification tests cover account isolation, matching message references, new-character-only
  creation, no duplicate reroll notices, persistence/read state, deletion cleanup, redacted previews,
  visibility settings, duplicate events, correct room routing, and read writes during generation.
- Chromium **149.0.7827.55** checks passed at **320px, 390px, and 900px**, using production Pocket
  styles and the complete handset shell with actual Mochi service/view and synthetic storage/provider.
  Checks include copy (keyboard activation and failure), edit, delete confirmation dismissal/commit,
  earlier reply reroll with preserved draft/later messages, notification list/privacy/toast/routing,
  real room-selector switching, per-room drafts, participant sheets, Enter/Shift+Enter/empty Send,
  automatic/manual replies, cancellation, settings, circular portraits, long names/strings,
  content/max bubble widths, 44px action targets, composer growth, dark/light fit, and no overflow.
- Screenshots were visually inspected. No existing visual baselines were modified.
- Original `test:visual` remains **blocked**, not passed: required Playwright
  `chromium_headless_shell-1234` is absent. Baseline metadata specifies Chromium **151.0.7922.34**,
  while the available browser is **149.0.7827.55**.
- Both production bundle hashes match an additional fresh rebuild. Source and bundles agree.

## Review screenshots / safe preview

New ignored test artifacts are in `tmp/mochi03-ui/`, separate from earlier Mochi captures.
For each width 320, 390, and 900:

- `refined-room-WIDTH.png`: edited/rerolled messages and refined header/composer.
- `actions-WIDTH.png`, `edit-WIDTH.png`: compact action sheet and editing.
- `notifications-WIDTH.png`, `notification-toast-WIDTH.png`: character notices and routing toast.
- `selector-WIDTH.png`: another room with a long title and preserved draft.
- `create-WIDTH.png`, `settings-WIDTH.png`, `settings-bottom-WIDTH.png`, `inbox-WIDTH.png`,
  `room-WIDTH.png`, `room-light-WIDTH.png`: remaining synthetic review states.

Open `tmp/mochi03-ui/index.html` for a provider-free interactive preview; demo data resets on
reload. Regenerate with `bun run test:mochi-ui`, using an installed Playwright package/browser
through `POCKET_PLAYWRIGHT_ROOT` and `POCKET_BROWSER_PATH`. Screenshots, preview bundles, temporary
fixtures, and dependencies are ignored and are not part of the commit.

## Remaining limitations

Live Lumiverse/provider acceptance, physical mobile keyboards, clipboard permissions across host
embedding modes, other themes, and the original visual comparison remain unverified. Notification
preferences use the currently loaded Pocket settings; a disconnected frontend has no toast delivery.
Read state synchronizes on refresh/notification events, not through a background subscription.
Prior text is archived but there is no version-restore UI. Explicit deletion is permanent.
Later dialogue is not rewritten after edits or rerolls. Long room titles can truncate in the native
selector; the full title is present in its option. Large histories and archived versions grow on disk.

As before, locks coordinate one extension service instance; storage offers no cross-process
compare-and-swap. An abort-ignoring provider retains its generation slot until it settles or the
extension restarts. Stop cannot retract a reply that already committed. There is no streaming,
Council, RP history injection, lorebook integration, notification scheduling, mascot, or theme editor.

## Rollback

Before testing against real data, back up the test account's `mochi/v1/rooms/` directory through the
host's supported storage/backup flow. Do not delete phone or identity-profile storage.

To reverse the code milestone later, create a normal `git revert` commit for the MOCHI-03 commit,
then run `bun run verify`. Review before pushing that rollback to `origin/mochi`; do not reset or
force-push. The previous reviewed source/bundles are at baseline `8c66909`.

Code rollback does not undo user edits, rerolls, or deletions. The earlier Mochi implementation
ignores the added optional metadata, so current message IDs/text remain readable; restoring old
conversation contents requires the explicit account backup. No storage migration reversal is needed.
