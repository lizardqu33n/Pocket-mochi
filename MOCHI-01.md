# MOCHI-01 — Independent Messaging Foundation

Implemented locally on `mochi`, based on Pocket commit `5cd6ce2994e8ff8e776bfc05749f3fcfd09371b3`.
No deployment, installed-extension replacement, GitHub push, or pull request was performed.

## What is available

Mochi is an optional home-screen app. It has an inbox, direct/group room creation,
room selection, character membership settings, and a stable identity per room.
Choose a Lumiverse persona, an existing Pocket persona profile, or a custom identity.
Source personas are copied into room snapshots, never followed automatically.
Changing a room's identity is explicit. Settings default to keeping the saved snapshot.

There is no composer, AI generation, background messaging, lorebook integration,
native RP-history linking, animation, or advanced theme system in this batch.

## Storage and concurrency

- Storage is under `spindle.userStorage`: `mochi/v1/rooms/room_<32 hex digits>.json`.
- The authenticated callback user ID scopes every operation. Payload user IDs are ignored.
- Room IDs and referenced identity IDs are validated. Characters/personas are resolved with the same account ID.
- Room enumeration uses filenames relative to the requested directory, matching the host API.
- Each room is committed independently; there is no shared inbox index that can erase other rooms.
- Updates serialize by account and room, reload committed data, and require the expected revision.
- Writes go to a `.pending` file, then replace the committed file through `userStorage.move`.
- Failed writes/replacements leave the committed room intact. Unfinished pending files are ignored and preserved.
- Unsupported or damaged rooms are reported without rewriting them or inventing empty history.
- Settings updates preserve complete message arrays and unrecognized room fields.
- Existing `phones/` files and Pocket preferences are not migrated or written by Mochi.

This assumes one Pocket backend worker writes these files. It is not a distributed
locking scheme and does not promise filesystem durability against disk failure.
Do not run two Pocket instances against the same extension-storage directory.

Mochi payload handling happens before Pocket's native RP-context resolution.
Its frontend state and selection are separate from `lumiphone:state` filtering.
The app inherits the phone's appearance, but its identity/history are independent.
If the host does not respond within 30 seconds, Refresh is available; inspect the
inbox for an already-saved room before retrying creation. Creation is not retried automatically.

## Changed files

New:

- `src/mochi/types.ts`: room and persona models; room-ID validation.
- `src/mochi/service.ts`: scoped storage, room settings, snapshots, revision checks, request handling.
- `src/mochi/view.ts`: inbox, room creation/selection/settings, independent frontend state.
- `tests/mochi.test.ts`: storage, ownership, concurrency, persistence, persona and routing tests.
- `scripts/check-mochi-ui.mjs`: synthetic Chromium UI checks and screenshots.
- `MOCHI-01.md`: this handoff.

Modified:

- `src/types.ts`, `src/domain/navigation.ts`: Mochi app and route registration.
- `src/frontend/controller.ts`: home icon, render branch, independent transport/state, cleanup.
- `src/backend.ts`: separate Mochi dispatch/service.
- `tests/contracts.mjs`: tenth app expectation and integrated Mochi UI/backend regression case.
- `package.json`: targeted checks; Mochi tests included in `verify`.
- `dist/backend.js`, `dist/frontend.js`: rebuilt bundles.

The original Messages module, phone normalization/storage routines, manifest identifier,
dependencies and dependency lockfile are unchanged.

## Validation

All checks below are local/simulated. No live Lumiverse account, provider, server,
physical phone, or installed extension was used.

- Type checking and both production builds passed.
- Existing Pocket suite: 126 tests, 665 assertions passed.
- Mochi suite: 9 tests, 49 assertions passed.
- Pocket contracts passed, including a real bundled UI/backend Mochi flow with synthetic storage.
  It creates a room, rejects dependence on `chats.getActive`, receives RP/persona refreshes,
  retains the room snapshot/view, and verifies existing phone/preferences data stays unchanged.
- Simulated Chromium creation, selection and inbox checks passed at 390px and 900px.
  Browser: 149.0.7827.55. Screenshots are in ignored `tmp/mochi-ui/`.
- The existing visual-baseline suite could not complete: its required browser is unavailable
  in the sandbox, and its recorded baseline uses Chromium 151.0.7922.34, whereas the available
  local browser is 149.0.7827.55. Baselines were not changed or declared passing.
- The real-host relay check was not run: it requires an actual RP handoff and private phone data,
  and relay behavior is outside this batch.

## Safe trial

The quickest trial uses only synthetic data:

1. In Windows PowerShell, open this checkout directory.
2. Run `bun run verify`.
3. Set `POCKET_PLAYWRIGHT_ROOT` to an existing Playwright package installation and, if needed,
   `POCKET_BROWSER_PATH` to a compatible Chromium executable. Run `bun run test:mochi-ui`.
4. Open `tmp/mochi-ui/index.html` locally for the synthetic view preview. Its rooms are in-memory
   demo fixtures; they are not Lumiverse storage and are lost on reload.

For eventual live acceptance, use a separate development Lumiverse instance and test account.
Install this Pocket build through the normal extension flow only after choosing that development
environment. Do not use the production Oracle server, live data, or `mount:local` as a trial shortcut.
In the development phone, open Mochi, create a room and select an identity; switch native RP chats
and personas, return to the room, refresh, and restart the development instance. Verify the room
and identity persist, then check the original Messages app and device switching.

## Provenance

This batch copies no Character Chatroom source, prompts, assets, fixtures, or bundles.
The supplied package's NOTICE identifies a Lumiverse ChatRoom adaptation and retains the
Lumiverse Community License v2.1; source adaptation remains deferred pending an appropriate
license/provenance review. Mochi's new modules were written for this Pocket contribution and
reuse Pocket's own components and supported Spindle APIs. No claim of permission to redistribute
Character Chatroom code is made.

## Remaining limitations

Live account/storage behavior, physical mobile acceptance, and the original screenshot baseline
comparison remain unverified. Source identity changes/deletions do not update saved snapshots.
Unavailable characters are retained in membership and labeled unavailable; remove or replace
them explicitly before saving settings. There is no room deletion/import/export or background work.
The room picker currently lists the account's available characters without search.
