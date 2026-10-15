# MOCHI-UI-01B — Messenger refinement

2026-10-14. Implemented locally; actual rendered visual acceptance remains pending.

## Starting state and image interpretation

Checkout: `<mochi-review-checkout>`.
Branch: `codex/mochi-desktop-01b-base-review`.
Starting/final HEAD: `c3e036d02f500bfd00c2c6326d1245ee63353714`.

UI-01A source, frontend bundle, report and tests were already uncommitted, along
with acceptance/roadmap/inventory work and prior auth reports. All remain local
and recoverable; no reset, branch switch, unrelated commit or source replacement.
This checkpoint extends those files and leaves the entire working tree uncommitted.

Reviewed the earlier annotated design image and both newly supplied screenshots:

1. **Annotated reference:** conversations, chat and optional profile form the
   hierarchy. Keep Mochi identity and purposeful Search/Details/More actions.
   Removed calls/social widgets, wallpaper and fabricated activity stay excluded.
2. **`Screenshot 2026-10-14 234827.png`:** three-column ownership is correct, but
   large management controls occupy the left panel and explanatory paragraphs
   dominate Details. Center messages/composer are retained, rather than redesigned.
3. **`Screenshot 2026-10-14 234836.png`:** Search stacks an input, sender selector
   and three similarly weighted buttons, taking significant conversation height.
   Compact the existing controls; preserve full-room search and result navigation.

These are inspections of the user's screenshots, not a fresh inspection of the
newly rendered output. No browser, screenshots, host or provider was started.

## Before and after

| Area | UI-01A | UI-01B implementation |
|---|---|---|
| Profile/account navigation | Long switch/settings buttons above list | Selected fictional-profile name beside compact, labeled switch/settings controls. Legacy chats are explicitly identified as unassigned, not a fictional profile. |
| Conversation creation | New room management button | Compact visible **New conversation** action, alongside notifications. Same original creation handler. |
| Discovery/list | Existing scoped filter, previews and real unread badges | Retained; less control text above it. No cross-account discovery, social tabs or invented timestamps. |
| Header | Search appeared as circular refresh glyph | Proper magnifier, same current-conversation Search handler. Existing Details and three-dot menu remain. No actual source-refresh function was removed. |
| Direct character details | Avatar/name/status plus permanent missing-data explanations | Character-first avatar/name/actual availability, no missing-bio/routine paragraphs; concise status explanation available via tooltip. Secondary conversation-settings action below a quiet separator. |
| Group details | Repeated large character blocks | Compact portrait/name/status rows using existing authorized participants and room nicknames. |
| Search | Full-width stacked controls and equally prominent actions | Compact query/sender grid, primary Search, secondary Clear and close icon with accessible names/tooltips. Existing results/status/pagination retained. |
| Wide columns | Left up to 220px, details 250px | Left up to 210px, details 224px, remaining space for chat. At 1070px this reserves roughly 636px for the middle before its padding/borders; this is CSS arithmetic, not a pixel measurement. |

No theme system, new color palette, animation, wallpaper, social/calling controls,
activity inference, generation behavior or settings reorganization.

## Implementation and data boundaries

- `src/mochi/view.ts`: adds the missing Search glyph and rearranges the original
  inbox buttons into compact desktop account/tools rows. The **same button nodes
  and handlers** are reused, including original account navigation, unsaved-change,
  cancellation and creation guards. The visible creation label becomes New
  conversation only in the desktop shell; the compatibility portal remains intact.
- `src/mochi/details-panel.ts`: presentation-only DM/group structure, shorter Back
  control, availability tooltip and removal of permanent developer explanations.
  Settings still invokes its original guarded handler. Existing fallback initials
  and unavailable-character status remain honest.
- `src/mochi/desktop-styles.ts`: centralized, Mochi-scoped compact navigation,
  profile, Search and column proportions. Reuses host theme variables, focus rules
  and existing 1000px/640px container breakpoints. No viewport observer or polling.
- `src/mochi/search-panel.ts`: query placeholder, shorter Clear text, close glyph,
  accessible labels/tooltips and secondary-control classes. The query, sender,
  request tickets, complete-room backend search, ordering, pagination and jump
  handlers are unchanged. No restriction to rendered messages.
- `tests/mochi-ui-shell.test.ts`: retains panel/task/draft/focus regressions;
  removes the old assertion requiring the now-unwanted routines paragraph, and
  adds compact controls, real notification routing, correct Search glyph and
  query/clear/close coverage.
- `tests/mochi-desktop-layout.test.ts`: expects the approved New conversation
  desktop label; other account/draft/history contracts remain.
- `tests/mochi-search.test.ts`: locates Close search through its accessible name
  rather than its old visible text. Full-history jump, query safety and focus
  assertions are retained, not weakened.
- `dist/frontend.js`: matching built UI-01B runtime. Backend built sequentially
  but remains byte-identical. This report and `ROADMAP.md` record verified progress.

Current authorized `MochiCharacter` DTO contains only ID, name and avatar URL;
`service.ts:state` deliberately maps those fields. No safe biography/cover field
crosses the existing frontend boundary. Therefore optional bio/cover are omitted,
not fetched from full source characters and not fabricated. No backend contract,
permission, database or extra provider request was added. A future routine snapshot
needs a separately authorized routine source; pending reply jobs are not activities.

## Responsive behavior and preservation

Wide containers (>=1000px): optional third column with revised proportions.
Intermediate containers: existing replaceable Details pane while chat geometry
remains laid out but visually hidden. Narrow containers (<640px): existing
list → chat → details navigation, with compact two-row Search controls.
Long names still wrap in Details and truncate with full-name titles in the list/
header. Absent portrait URLs retain initials; failed image downloads still need
actual-host inspection.

Details toggling retains the UI-01A attribute/focus-only path: no thread rebuild,
summary reset, composer loss, read acknowledgment or mutation. Escape, Back and
focus restoration retain their handlers. Account/settings/navigation scope and
staged-versus-immediate semantics remain unchanged. Native Pocket, session owner,
backend generation, scheduling, room schemas, quota protections and data ownership
were not edited. Git comparison of those core paths/backend artifact is empty.

## Sequential verification

| Targeted selection (`tests/*.test.ts`) | Passed | Assertions |
|---|---:|---:|
| `mochi-ui-shell`, `mochi-desktop-layout`, `mochi-search` | 24 | 246 |
| `mochi-session`, `mochi-sidebar`, `mochi-window`, `mochi-beta-ux`, `portal` | 45 | 390 |
| `mochi-context`, `mochi-presets`, `mochi-memory`, `mochi-summarization` | 100 | 961 |
| `mochi`, `mochi-scheduling-lifecycle` (imports accounts) | 87 | 650 |

**256 distinct targeted tests, 2,247 assertions, 15 distinct files, zero final
failures.** Imports include the accounts file once. No full suite or parallel
jobs. Initial failures were outdated visible-text expectations (removed profile
paragraph, renamed creation label and icon-only Close); updated tests preserve
the original functional assertions. Final runs above exclude iteration reruns.

One `bun run typecheck` passed; one `bun run build` passed, backend then frontend.
The project static check covers source, while Bun executes test fixtures. No
runtime source changed after the successful check/build. Prior UI-01A pair was
copied and hash-verified in ignored `tmp/ui-01b-before-bundles/`; all older backups
remain untouched.

| Built file | SHA-256 |
|---|---|
| Frontend | `7C75A9C9E08EAFEABF0D241705BD529FDA38EA7B84D6F9DEDB4423E8D4ABBD48` |
| Backend, unchanged | `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B` |

Tests are synthetic providers/storage and JSDOM. Width fixtures do **not** verify
actual CSS geometry, contrast or native keyboard behavior. No new output
screenshots were taken and no claim is made that rendered UI now matches the
reference. Native Pocket compatibility is source/targeted-contract evidence,
not fresh live Messages acceptance. No installed Windows or Ubuntu files changed.

## Focused manual visual acceptance — pending approval

Use only the existing disposable Windows instance after a separately approved
paired runtime update/backup. Do not install another `lumiphone`, modify Kitty's
checkout, or reuse production data. Record both hashes above. Keep memory-v2-aware
recovery; never downgrade old readers over managed memory or overwrite newer chats
with a pre-test backup. UI-01A runtime backup is preserved but not installed.

1. Compare both supplied states at 1070–1100px container width: list gets more room,
   chat remains primary, profile is character-first and Search doesn't dominate.
   Check 1000px breakpoint and a wider 1200px three-column state as well.
2. At 900/390/320px, inspect replaceable Details, clear Back/Escape, focus return,
   two-row Search and composer usability. Verify no horizontal overflow or clipped
   menu/filter/options. Test zoom and light/dark; DOM checks cannot establish this.
3. Use long profile/room/character names and a 12-character group. Inspect compact
   switch/settings tooltips, selected profile identity and group rows. Missing
   bio/banner should produce no diagnostic paragraph or invented information.
4. Keyboard-open account switch/settings, creation and notifications. Dirty drafts
   must still warn; real unread counts/navigation and legacy access must persist.
5. Search a message older than the rendered batch, filter by sender, clear, close,
   paginate and jump. Check focus return and safe result text; source search remains
   complete-room, not DOM-only. The header must show a magnifier, not refresh.
6. Toggle Details during an interactive reply or reviewed summary. Preserve task,
   composer/quote/suggestion and scroll position; no read or provider mutation.
   Test room changes, live status refresh and portal/window handoff independently.
7. Check Stop, Continue, Enter/Shift+Enter, source/model controls inside Settings,
   memory/presets tools, scheduled outcomes and native Pocket Messages. No new
   generation/provider requests are authorized merely by this checklist.
8. Capture synthetic after-screenshots for review; do not include private RP text.

## Deferred work and release status

Future biography/banner and routines require reviewed authorized data contracts;
no parallel profile database. Full goal-oriented settings hierarchy, advanced
Memory & Prompts onboarding, fictional routines and final Theme Pass remain
separate milestones. No further UI pass starts automatically.

Beta acceptance findings and `MOCHI-BETA-PREVIEW.md` remain valid, including the
unresolved same-browser real-user lifecycle limitation. The candidate inventory
was not updated by this UI checkpoint: it still pins the prior stabilization pair,
with false readiness. This is an unaccepted UI review build, not beta publication
or general privacy acceptance. All prior acceptance/WIP changes are preserved.
No commit, push, deployment, installation, live account/provider operation or
host-auth change. Stop for user review.
