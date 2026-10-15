# MOCHI-UI-01A — Messenger shell foundation

## Design contract

The annotated image is a composition reference: left conversations and selected
fictional-profile controls; center existing chat; optional right character details.
Keep Mochi's wordmark/heart and small original project mascot. Do not copy image
assets, names, wallpaper or colors. No calling, requests, social rail, member-since,
badges, fabricated activities, or decorative controls. Theme work remains later.

Conversation discovery filters the selected account's room names and participant
names locally; it is not cross-account/global message search. The dedicated Search
button opens the existing current-room search handler. The three-dot menu retains
the existing secondary tools and lifecycle guards. Full settings reorganization is
deferred: future General, Texting Behavior, Memory & Prompts, Availability &
Schedules, Advanced; this checkpoint changes neither settings nor their scope.

Details is a read-only, collapsible view of existing authorized character choices,
room nicknames and actual availability. DM shows its character; groups list their
participants. Current DTOs provide no bio/banner/routine source: show an honest
fallback, no additional request or profile database. Future routine integration
requires an explicit authorized source contract, independent of queued reply jobs.
The settings link invokes the original guarded Settings handler.

At >=1000 container pixels, Details opens a third column. At 640–999, it replaces
the main conversation pane while retaining the list. Below 640, list → chat →
details is single-column navigation. Closing details returns focus to its opener;
Escape within details closes it. The collapsed panel is removed from keyboard
navigation through display:none. Long names wrap in details and truncate in list/
header with full-name titles. No body observer, new polling or new session owner.

Panel toggles change only presentation attributes and focus, without rebuilding
the thread/composer, canceling tasks, resetting suggestions, acknowledging notices
or dispatching backend operations. Room/account changes retain original guards.
Filter and details state clear with scope reset. Existing empty/loading/error and
unavailable-room states remain; no-match filtering has an explicit empty state.

## Implementation and verification

Starting/final Git HEAD: `c3e036d02f500bfd00c2c6326d1245ee63353714`, branch
`codex/mochi-desktop-01b-base-review`, in the approved isolated checkout.
Starting tree already contained the uncommitted acceptance inventory/roadmap,
portal test correction, multi-user acceptance fixtures and acceptance/auth reports.
They remain recoverable; this milestone does not commit or discard that work.
No branch switch, install, publication, host/browser launch or live provider call.

Implemented:

- `src/mochi/view.ts`: left branding/account tools/discovery, dedicated chat title,
  direct Search plus existing secondary menu, details presentation state and
  existing guarded Settings routing. Filter uses room/participant names only and
  hides existing list rows without rerendering history. Existing unread records
  drive badges. Account changes/teardown clear the added private presentation state.
- `src/mochi/details-panel.ts`: read-only DM/group projection with original portrait,
  room nickname, availability, safe text rendering, explicit missing-data fallbacks,
  Back and real conversation-settings action. No source metadata fetches.
- `src/mochi/desktop-styles.ts`: centralized shell/list/header/details rules using
  existing theme variables, touch controls and container breakpoints. Smaller
  containers keep the conversation's layout geometry while hiding it behind the
  details view, so existing scroll measurements are not intentionally zeroed.
  The panel is initially collapsed; users open it explicitly at every size.
- `tests/mochi-ui-shell.test.ts`: six new DOM regressions covering DM/group,
  long names, 320/390/900/1200 width fixtures, live node/scroll/draft retention,
  no task cancellation, suggestion identity, filter/source fallbacks, Search,
  guarded Settings and focus/Escape.
- `tests/mochi-beta-ux.test.ts`: uses the actual outer desktop shell and its Back
  control instead of the removed duplicate inner desktop-header inbox.
- `dist/frontend.js`: matching newly built artifact. `dist/backend.js` was built
  sequentially as required but remains byte-identical, with no Git content diff.
- This report and `ROADMAP.md`: foundation progress only.

While checking the actual narrow navigation route, Back needed the existing
generation-exit warning guard. It now passes its leaving-room flag to the original
`exitPortal` handler: Stay preserves the reply/draft, confirmation cancels once,
durable scheduled work remains independent. No new cancellation policy, controller
or backend behavior was introduced. The compatibility portal/handset keeps its
original header and menu; shell changes apply only to dedicated desktop rendering.

### Final sequential targeted selections

| Tests (`tests/*.test.ts`) | Passed | Assertions |
|---|---:|---:|
| `mochi-ui-shell`, `mochi-desktop-layout`, `mochi-session`, `mochi-window`, `mochi-sidebar`, `mochi-beta-ux`, `portal` | 56 | 518 |
| `mochi-context`, `mochi-presets`, `mochi-macros`, `mochi-memory`, `mochi-summarization` | 120 | 1051 |
| `mochi`, `mochi-scheduling-lifecycle`, `mochi-replies`, `mochi-reactions`, `mochi-pins`, `mochi-search`, `mochi-texting` (imports accounts) | 143 | 1057 |
| `mochi-multi-user-acceptance` (also imports accounts) | 24 | 289 |

**327 distinct targeted tests / 2,818 assertions / 21 distinct files, zero final
failures.** Deduplicates 16 imported account tests / 97 assertions. Iteration runs
are excluded. An intermediate UX run failed because it targeted the removed inner
desktop inbox; adapting it to the real Back route also verified the guard above.
No tests were deleted or visual baselines replaced.

One TypeScript check passed (`bun run typecheck`, source scope `src/**/*.ts`). One
production build passed (`bun run build`, backend then frontend). Source code and
build match this working tree; no source changes followed these checks. No separate
static typecheck of test files is claimed. Bundle text includes the new details,
discovery and fallback strings; this is not compiled end-to-end host execution.

| Artifact | SHA-256 |
|---|---|
| Frontend | `D2B68BCDC9CC0CC3015DA43AEDBAD5939B9D911AC22883080E343A900ADCD7E1` |
| Backend, unchanged | `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B` |

Both pre-UI stabilization bundles were copied and hash-verified in ignored
`tmp/ui-01a-before-bundles/` before the build. Older 01C/MEM backups remain untouched.
The new artifact is a UI review build, **not an accepted replacement of the pinned
stabilization candidate**: `MOCHI-BETA-CANDIDATE.json` is unchanged by UI-01A, still
pins its prior runtime and retains false readiness. The memory-v2 rollback warning
and restricted-preview authentication limitation remain in the existing reports
and `MOCHI-BETA-PREVIEW.md`. UI work does not change release/privacy acceptance.

### Limits and outstanding visual acceptance

All verification here is synthetic storage/provider or JSDOM/source inspection.
Width fixtures do not compute CSS pixels, contrast, wrapping, native focus or
container-query rendering. No screenshots were generated; no browser was authorized.
The real 320/390/900/1200 layout, intermediate details navigation, zoom, menu clipping
and hidden-chat scroll geometry must be reviewed in Windows before visual approval.

Biography/cover and routines remain unsupported in the current character DTO,
even if richer source characters elsewhere contain descriptions. UI-01A does not
broaden that DTO or fetch private source documents. Settings opens the existing
conversation settings, not an invented full character-profile editor. Presence is
real reply eligibility, not human activity. Missing characters remain explicitly
unavailable. The existing message history cap/batch loading is retained, not full
virtualization; no new history scan or observer was added for discovery/details.
Longer group/large-library ergonomics still need manual review. No final theme pass.

### Windows disposable test checklist — pending separate authorization

Do not replace the installed pair or launch the host as part of this checkpoint.
The existing test extension is the single `lumiphone` under
`tmp/01d-local-host/data/extensions/lumiphone/repo`; do not add a duplicate or
alter Kitty's regular checkout. Follow the controlled backup/paired-update process
in `MOCHI-BETA-ACCEPTANCE-01.md` after approval, substituting **both UI-01A hashes
above** and this working-source provenance. Never restore older memory-v1 readers
over managed v2 room data or replace newer histories with a pre-test backup.

1. Confirm installed source/runtime provenance and paired hashes after an approved
   update, then use only synthetic accounts/rooms. Existing installation was not
   changed by this work.
2. At 1200 container width, select DM and open Details: three columns, correct room
   nickname/portrait/status, no invented profile/activity. Collapse and restore.
   At 900, Details should replace the central view with Back; at 320/390, verify
   list → chat → details → chat without horizontal overflow. Include 12-member
   groups, very long names and unavailable character sources.
3. Filter by room title or participant, no matches, clear search, switch fictional
   profiles and visit legacy rooms. Ensure results never include another scope and
   list filtering does not navigate away from the selected chat. Check real unread
   counts, previews and selected-row indication.
4. Type a multiline unsent draft, quote a message, scroll to older history, open/
   close Details during a live test reply or reviewed summary. No provider call,
   cancellation, loss of selection/scroll/draft or implicit read acknowledgment
   should result merely from toggling Details. Test incoming refresh while open.
5. Search must open current-room search. Menu actions, pins/notes, message actions,
   memory Save/Restore/Disable/Clear and preset Publish/Apply retain their existing
   confirmations. Advanced editors remain in secondary tools; no new defaults.
6. Narrow Back during generation: Stay preserves work; confirmed leave stops the
   interactive task once. Settings still protects unsaved edits. Enter, Shift+Enter,
   empty continuation and Stop retain existing behavior. Schedules keep running
   independently of harmless panel toggles.
7. Keyboard: Details focuses its Back control; Escape returns to the opener. Tab
   must skip collapsed/hidden content. Check focus after backend refresh and room
   changes, menu Escape, text selection and scroll anchoring. Inspect light/dark
   contrast and 110/125/150% zoom in the host, not only viewport size.
8. Verify Pocket portal/window handoff, account selection, notifications and native
   Messages independently. Separate-browser real-account testing remains the
   restricted-preview model; no same-browser identity safety claim is made.
9. Capture synthetic screenshots at 320/390/900 and a wide three-column state for
   user review, keeping private RP content out of screenshots/logs.

## UI-01B recommendations and stop point

Review actual shell screenshots/interactions first. Then separately scope the
goal-oriented settings/tool hierarchy, small guided entry points for Memory &
Prompts, and scalable per-character preferences; preserve staged/immediate scope
and original Publish/Apply/summary semantics. Any richer character bio/banner or
routine presentation needs a separately reviewed authorized data contract.
Do not start settings modernization, routines, themes or host-auth work here.

All UI-01A edits remain local and uncommitted alongside the preserved acceptance
work. No push, installation, deployment, beta publication or next milestone.
