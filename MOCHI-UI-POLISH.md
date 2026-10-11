# Mochi UI polish

Completed locally on `mochi`, using the accepted MOCHI-01/MOCHI-02 working tree. No backend,
room schema, storage, prompt, or generation behavior was changed. No push, pull request,
deployment, or Ubuntu installation was performed.

## Design and changes

Inspected Pocket's controller and handset icon implementations, shared controls, design system,
surface tokens, and production stylesheet before editing. Used the supplied evening-chat mockup
as a visual reference for the lilac accent, portraits, names outside bubbles, and compact composer.
No reference-image assets were copied. No unread counts, presence dots, or fabricated statuses
were added. The existing real generation state still displays a reply-in-progress message.

- Extracted Pocket's existing controller icon strings unchanged into a shared module. Pocket's
  existing icon output and Messages UI remain the same. Mochi uses those icons, with matching
  line icons for Refresh/Stop. Icon controls have accessible labels, native tooltips, and 44px targets.
- Scoped all new styling to Mochi. Surfaces, text, muted text, borders, and focus treatment follow
  Pocket/host tokens, with a locally blended lilac accent. Dark and porcelain modes were inspected.
- Character choices use circular portraits or initials, names below, selected borders and checkmarks,
  and accessible pressed states. Narrow handsets use two columns; larger handsets use three.
- Forms have consistent inputs, spacing, action buttons, focus outlines, and an automatic-reply
  checkbox inside a toggle row. Cancel/save behavior and stale revision protection remain intact.
- Room headers expose title, actual participant count, saved identity, inbox access, and settings.
  Inbox cards use participant portraits and the last stored message as their preview.
- Bubbles size to content, cap at 86% of the row (also reserving portrait space), wrap long strings,
  and use restrained 12px corners. Names remain outside, portraits circular, timestamps readable.
- Composer places input and icon controls together, limits growth to 112px, hides Stop while idle,
  and explains empty continuation/Shift+Enter. Enter, cancellation, and responder behavior are unchanged.

## Exact incremental file list

Earlier milestones remain uncommitted too, so their changes also appear in Git status.

| File | Change in this batch |
| --- | --- |
| `src/mochi/view.ts` | Polished markup, shared icons, portraits, header, inbox previews, forms, and composer. |
| `src/mochi/styles.ts` | New scoped styles and responsive layout. |
| `src/frontend/components/icons.ts` | New shared module containing the existing Pocket controller icons unchanged. |
| `src/frontend/controller.ts` | Imports the extracted icon table; no existing Messages rendering changes. |
| `scripts/check-mochi-ui.mjs` | Expanded synthetic handset UI checks and screenshots. |
| `dist/frontend.js` | Production frontend rebuilt from the final source. |
| `MOCHI-UI-POLISH.md` | This report. |

The backend bundle was rebuilt during verification but is byte-identical to the accepted
MOCHI-02 backend bundle. Existing visual baseline files were not changed.

## Test results

- Final `bun run verify`: type checking and both production builds passed; **145 tests,
  784 assertions, zero failures**, plus Pocket's bundled contracts passed. Includes **19 Mochi
  tests / 119 assertions** and the existing Pocket regression suites.
- Simulated browser checks passed at **320px, 390px, and 900px** in Chromium **149.0.7827.55**,
  using the actual Mochi view/service, production Pocket styles, and complete handset shell with
  in-memory storage and a fake provider. Checks include choice toggle states, loaded circular
  portraits, long-name wrapping, full handset width, overflow, short/long bubble sizing, name/time
  placement, touch targets, composer growth, Enter/Shift+Enter, empty continuation, automatic/manual
  replies, settings save/cancel/persistence, Stop, room-switch cancellation, saved inbox previews,
  and light-mode fit. Late fake-provider results are discarded after cancellation.
- Screenshots were visually inspected after the final layout corrections. Initial standalone
  screenshots caught container shrinkage; the fix and explicit width assertion are included.
- Original Pocket visual suite was attempted but blocked by the absent Playwright
  `chromium_headless_shell-1234` executable. Existing baselines require Chromium **151.0.7922.34**.
  This is not a baseline-comparison pass; no baseline replacement was performed.
- `git diff --check` passed. Final bundles match an additional fresh rebuild, so source and bundles agree.

## Screenshots and preview

All captures show synthetic characters/messages, not a live Lumiverse session. Files are under
`tmp/mochi-ui/` (ignored test artifacts). For each width 320, 390, and 900:

- `create-WIDTH.png`: portrait picker and creation form.
- `settings-WIDTH.png`, `settings-bottom-WIDTH.png`: settings and reachable save/cancel controls.
- `room-WIDTH.png`, `room-light-WIDTH.png`: dark/light conversation and composer.
- `inbox-WIDTH.png`: avatars and saved-message preview.

Open `tmp/mochi-ui/index.html` for a safe, provider-free interactive preview. Demo rooms reset
on reload. To regenerate captures, set `POCKET_PLAYWRIGHT_ROOT` to an existing Playwright install
and `POCKET_BROWSER_PATH` to an installed Chromium executable, then run `bun run test:mochi-ui`.

## Remaining visual limitations

No overflow or collapsed layout was observed at the tested widths in either inspected theme.
Very long participant names wrap and increase header height. Large forms scroll inside the
handset, with top/bottom captures provided. Native dropdown appearance follows the browser/OS;
tooltips follow native browser behavior. Physical mobile keyboards, live Lumiverse embedding,
other host themes, and the original screenshot baseline comparison remain unverified.
The supplied reference's photo attachments, mascot, presence markers, and extra controls were
not implemented because they are outside this approved polish batch.
