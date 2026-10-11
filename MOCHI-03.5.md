# MOCHI-03.5 — Visual refinement and notification management

Baseline: `mochi`, commit `8b122848fe5b20b3a44059c56ba04f8dd9cb82ac`.

## Changelog

- Stronger Mochi wordmark with an original static SVG mochi, restrained lilac accents, a rounded room selector, circular participant chips, and balanced header controls.
- Names, timestamps and edited labels sit outside content-sized bubbles. Bubbles remain limited to 86% of the message row (also allowing space for portraits). Outgoing bubbles use lilac; incoming bubbles follow the host surface.
- Message actions use small borderless glyphs with 44px hit targets: reveal on desktop hover/keyboard focus, remain subtly visible on touch. The composer has one rounded input/control surface and retains Send, Stop, Enter, Shift+Enter, IME handling, empty continuation and per-room drafts/responders.
- Existing behavior was read-state tracking plus persistent notification history: reading already marked notices read, but there were no removal controls. Added individual dismissal, Clear read, and confirmed Clear all. The bell counts only unread records; navigating a room marks reviewed records read without deleting them.
- Clearing targets the specific displayed IDs, so concurrent replies survive. Notification changes use a separate persisted per-room revision, account-scoped room locks and pending-file replacement. Delayed snapshots/events cannot restore dismissed, read or outdated records. Read/clear operations do not change conversation revisions or cancel replies.
- Edits/rerolls update existing previews; deletion removes the matching notice. Read, dismissed and changed toasts are retired inside their own handset. Preview privacy and account boundaries remain in place.
- No external mascot assets or Character Chatroom source were copied. The SVG is newly drawn in this implementation.

## Exact changed files

| File | Purpose |
| --- | --- |
| `src/mochi/view.ts` | Branding, message layout, notification controls/counter, ordered notification reconciliation |
| `src/mochi/styles.ts` | Scoped dark/light handset styling, touch/desktop message actions, composer and notification layouts |
| `src/mochi/types.ts` | Optional persisted notification revision |
| `src/mochi/service.ts` | Validated account-scoped dismissal/clearing, reviewed-ID read tracking, notification revisions |
| `src/mochi/notifications.ts` | Retire stale/read/dismissed Mochi toasts without exposing hidden previews |
| `src/frontend/controller.ts` | Mochi-only callback wiring for toast reconciliation |
| `tests/mochi.test.ts` | Five new storage/concurrency/account/read/stale-event tests |
| `scripts/check-mochi-ui.mjs` | Expanded touch/mobile and desktop interaction/layout/clearing checks and screenshots |
| `dist/backend.js` | Production backend rebuilt from current source |
| `dist/frontend.js` | Production frontend rebuilt from current source |
| `MOCHI-03.5.md` | Delivery notes, screenshots, limitations and rollback |

Original Messages UI, native phone storage, devices, profiles and existing visual baseline files were not edited.

## Validation

- `bun run verify`: PASS — type checking, production backend/frontend builds, 157 tests across 14 files, 912 assertions, and Pocket contract tests.
- Source and bundled files agree: a second production rebuild produced identical SHA-256 hashes for both bundles. The commit audit found no sensitive filenames or credential-pattern matches; generated screenshots and preview files remain ignored.
- Mochi coverage: 31 tests, including clearing without message loss, read/unread selection, account isolation, invalid identifiers, failed writes/replacements, concurrent generation, dismissed-notice persistence across restart, reroll preservation and stale event/snapshot rejection.
- Chromium interaction checks: PASS at 320px and 390px with touch/mobile emulation, and 900px with Pocket's desktop handset. Installed Chromium: `149.0.7827.55`.
- Browser coverage includes character selection/long names, bubble limits, header/composer overflow, names outside bubbles, keyboard actions, hover/touch action visibility, 44px targets, settings, Send/Stop/empty continuation, drafts, routing, preview privacy, read-only counters, individual dismissal, clear-read preservation, clear-all confirmation/cancellation, stale replay, refresh and exact saved-history equality after clearing.
- Standard `bun run test:visual`: BLOCKED — Playwright requires the absent `chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe`. Existing visual baselines were not replaced and this suite is not reported as passing.
- These are simulated storage/provider/browser checks, not live Lumiverse verification. No server deployment or installation was performed.

## Before/after screenshots

Screenshots use synthetic characters, personas, rooms and generated replies. They remain local under ignored `tmp/`; they are not part of the Git commit. The original concept is a reference, not a shipped asset.

| Viewport | Before | After |
| --- | --- | --- |
| 320px | [Room](tmp/mochi035-ui/before/refined-room-320.png) | [Room](tmp/mochi035-ui/after/refined-room-320.png) |
| 390px | [Room](tmp/mochi035-ui/before/refined-room-390.png) | [Room](tmp/mochi035-ui/after/refined-room-390.png) |
| 900px | [Room](tmp/mochi035-ui/before/refined-room-900.png) | [Room](tmp/mochi035-ui/after/refined-room-900.png) |

Each width also has inbox, character picker, settings, message-action sheet, light-theme room, long room selector, notification history, managed unread notification and cleared-history captures in the same folders. Before captures used the existing viewport simulation; after captures add touch emulation for mobile. Compared dark/light rooms and all three widths visually; no horizontal overflow was found. Native select controls truncate long room titles at narrow widths; full titles remain available in the room options/inbox. The existing six-second Pocket toast can temporarily overlay the header.

## Try safely

Use the local Mochi app in Pocket and a test room. Open the bell: reading a room marks its displayed notices read but retains history. Dismiss removes one record; Clear read retains unread records; Clear all asks for confirmation and removes only records present when the action was opened. Reopen the room to verify its saved messages remain. No real provider is needed for the simulated preview at `tmp/mochi035-ui/after/index.html`.

## Limitations and rollback

- Multi-room clearing commits each room atomically, not as one transaction across every room. A storage error can leave some rooms cleared and others unchanged; refresh and retry. Saved messages are never modified by clearing.
- Concurrency protection follows the existing single backend service's locks; multiple independently running backend processes remain outside the host storage guarantees. No background scheduling or new generation features were added.
- Clearing notifications is permanent for those notification records. It does not erase room messages or prior message versions and does not recreate old notifications.
- To roll back code, first preserve local changes and back up Mochi room files through your normal host backup method. On `mochi`, revert the single commit titled `feat(mochi): refine UI and manage notification history (MOCHI-03.5)` using `git revert <commit-hash>`, then run `bun run verify`. This restores the previous source and bundled app together without rewriting branch history. Only push the revert to `origin/mochi` when approved. Existing room files need no downgrade or migration; the older code tolerates the additional revision field. A code revert does not resurrect dismissed notification history. Do not reset or copy native phone data.
