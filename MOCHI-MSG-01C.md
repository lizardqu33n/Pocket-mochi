# MOCHI-MSG-01C — Chat Pins and System Notes

Local isolated review branch: `codex/mochi-desktop-01b-base-review`.
Starting clean HEAD: `b49c7d8c6bf52be5941335a0a0f31bc3b83f8a33` (MSG-01B).
The checkpoint commit is the commit adding this report:
`git log -1 -- MOCHI-MSG-01C.md`. No push, installation, deployment or host launch.

## Lumiverse inspection before implementation

Actual local host source was inspected, not a live host execution:

- `../frontend/src/components/chat/AuthorsNotePanel.tsx`: loads
  `chat.metadata.authors_note`, saves through `chatsApi.patchMetadata` after a 400ms
  debounce. Empty text saves null. Frontend defaults depth 4 and system role;
  role choices are system/user/assistant, depth clamps to 0–9999. There is no
  periodic activation control in this panel.
- `../src/types/preset.ts:AuthorsNote`: content, position, depth and role fields.
  The inspected Author's Note injection path uses depth/role, not position.
- `../src/services/prompt-assembly.service.ts:resolveChatHistoryInsertionIndex`:
  depth counts actual tagged chat messages backwards, ignoring other prompt blocks;
  depth 0 inserts immediately after the latest chat message.
- The same file's Author's Note injection section (around line 3942) reads the RP's
  metadata, expands macros with `evaluateForPromptAssembly`, inserts nonempty text
  with system role fallback, and adds a prompt-breakdown entry. It is included
  whenever nonempty; no interval/periodic condition is present in this path.
  Subsequent preset depth blocks are assembled separately. Host context clipping
  counts/protects non-history prompt content and clips history, with explicit budget
  diagnostics (around lines 7271–7426). This is part of RP preset assembly.
- `node_modules/lumiverse-spindle-types/dist/api.d.ts`: no dedicated Author's Note
  editor/injection API was found. Generic prompt/interceptor APIs exist, but are not
  needed here and would couple Mochi to RP assembly.
- `src/backend/generation.ts:callPocketProvider`: direct `generate.quiet` boundary;
  independent `src/mochi/generation.ts:buildMochiPrompt` assembles Mochi messages and
  counts them before provider submission. It does not load an active RP or its notes.

Mochi models the supported subset independently. It does not copy native RP metadata,
run native macros or reuse RP presets. No active RP is required.

## Implemented UI and representations

Room options now include **Pins & Notes** with two clearly separate sections.

**Chat Pins:** optional room `chatPins: string[]` of exact stable message IDs,
maximum 50. Message actions offer Pin/Unpin; the original message has a subtle
Pinned label. The panel shows sender/excerpt, original creation time in the title,
and an Unpin button. Pins are listed in pin insertion order; removing/re-pinning
moves a bookmark to the end. Clicking expands the existing bounded history window
as needed and reuses quoted-reply navigation/focus to reach the original message.
No copied message text is stored in bookmarks. Deleted targets are removed by normal
message deletion; missing/ambiguous targets are hidden without exposing deleted text.

**System Notes:** optional room `systemNotes` array of
`{id, title, body, enabled}`. IDs are server-generated `note_` plus 32 hexadecimal
characters. Maximum eight notes, title 80 characters, body 2000 characters each,
8000 total body characters including disabled notes. New notes start enabled.
Create, edit, enable/disable and confirmed delete are supported. Explicit Save is
required; toggles and confirmed deletion are immediate. Notes never become chat
bubbles. Creation order is deterministic; editing/toggling preserves that order.

The editor retains unsaved drafts in the shared frontend view, keyed by fictional
account and room. Closing the panel/hiding the surface does not discard the draft;
Cancel editing requires explicit discard when dirty. Failed saves retain text.
When a refreshed revision differs, the panel shows saved content and requires an
explicit Apply draft to refreshed chat action before resubmission. Missing note IDs
remain rejected rather than recreated accidentally. Successful acknowledgments clear
the saved draft; destruction/logout clears private drafts. Full-restart draft
persistence remains deferred. Buttons/fields have accessible labels, native keyboard
behavior, visible focus and scoped wrapping styles. No theme or messenger redesign.

## Actual prompt semantics and future placement

`src/mochi/pins.ts:resolveSystemNotes` resolves the authorized room's enabled notes
as a dedicated ordered section. Default placement: **after all retained dialogue and
before the final user continuation request**, equivalent to depth 0. Every enabled
note is included once on every generation, in stored order, with **system role**.
No role/depth/periodicity selectors are exposed because this checkpoint implements
one documented supported insertion point. This differs from native depth-4 defaults,
selectable roles and macro expansion.

Notes are user-controlled room instructions. System role grants prompt influence,
not server privileges: note text never selects credentials, changes ownership,
executes operations or bypasses generation validation. Provider compliance cannot
be guaranteed. Chat pins do not enter this section, gain priority, duplicate dialogue
or change prompt input at all.

Titles and bodies are counted by the existing real token counter. Context trimming
removes oldest outgoing dialogue only; it never trims stored histories or silently
drops active notes. If instructions/latest dialogue cannot fit alongside output and
the existing envelope reserve, generation reports a budget error. Disabled notes
are excluded from provider input but preserved in storage. No additional provider
call is introduced.

The resolver is a separate section boundary, suitable for future preset placement.
A future macro must replace the single default insertion rather than append a second
copy. No macro name or preset API is finalized in this checkpoint.

## Isolation, consistency and scheduling

`MochiService.pinnedContent` uses existing authenticated real-user storage,
fictional-account ownership, exact-room access, locks, revisions, receipts and
atomic pending-file replacement. Cross-room targets, inaccessible notes, malformed
IDs, over-limit content and stale revisions fail without rewriting history.
Pin/unpin carries desired state, not an ambiguous toggle; receipt replay is safe.
Optional fields do not require migration or change room version 1. Existing message
content, quotes, reactions, versions, receipts and notifications are retained.

Mutations are rejected while that room has active interactive generation or a live
scheduled lease. They do not cancel it or affect an unrelated room. A consistent
authorized room snapshot therefore reaches each provider call. Note changes are also
rejected when an undelivered prepared draft exists: the user must wait or explicitly
cancel that occurrence. Output is never silently discarded merely to edit a note.

For queued, ungenerated opportunities, matching nonterminal revision tickets advance
with the new note revision; established server dispatch resolves current notes.
Chat bookmark changes preserve prepared drafts with matching revision tickets.
No stale/terminal occurrence is revived. Status, expiry, claims, quota reservations,
attempts and autonomy gates are unchanged. Native Pocket code and RP prompts were
not modified; there is still one shared Mochi view/listener/generation owner.

## Verification and artifacts

Resource-conscious, sequential simulated verification:

- Exact current-checkout regression paths: **108 tests passed, 0 failed,
  808 assertions**, across pins, reactions, quotes, automatic replies, scheduling,
  desktop layout and shared-session tests (including imported account regressions).
- Additional final pin/note-only run after two added regression cases:
  **14 passed, 0 failed, 89 assertions**.
- One TypeScript typecheck: passed.
- One sequential production build: passed, backend then frontend.
- Source/bundle inspection confirms `resolveSystemNotes`, `pinnedContent` and
  the Pins & Notes interface occur in the matching generated pair.

The initial broad filename-pattern invocation also matched ignored backup test
copies (264 passes). Those results are excluded from current-source verification;
the exact-path rerun above is authoritative. No browser/host/provider process ran.

Synthetic coverage includes legacy/fictional persistence and restart, wrong scopes,
duplicate/retry/concurrent writes, interrupted replacement, malformed records,
note limits/activation/edit/deletion, deleted bookmarks, character reroll preservation,
ordered counted prompt input, no bookmark privilege, quotes/reactions, current notes
in scheduled dispatch, protected prepared drafts, and active/unrelated generation.
DOM fixtures at 320px/390px/900px include long sender/room names, excerpts, note
drafts, explicit discard, stale-save recovery and old-history navigation.
They verify structure/controls, not measured pixel layout or real screen readers.
No full suite, Chromium or live provider calls were performed.

| Runtime bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `EED5C3B6AAB584FA1EFD81B987CE6A3993356AFE30F91206E8119646DB51152D` |
| `dist/backend.js` | `A2766F14891A285F7946C63593093F16CFC159CADFA943EB90A093638F6151E0` |

MSG-01B bundles are backed up byte-for-byte in ignored
`tmp/msg-01b-verified-bundles/`. Earlier backups are untouched. Both new bundles
must be installed together only after separate approval. No installed extension or
disposable-instance data was updated. Downgrading to MSG-01B hides pins/notes and
does not inject notes; optional fields remain in stored room records. Restore the
prior matching bundle pair/commit without deleting room storage.

## Changed files

- `src/mochi/pins.ts`: validated limits, IDs and independent notes resolver.
- `src/mochi/pins-panel.ts`: scoped panel/editor, explicit save/discard and styles.
- `src/mochi/types.ts`: optional bookmark/note fields.
- `src/mochi/service.ts`: scoped atomic mutations, deletion cleanup, scheduling safety.
- `src/mochi/generation.ts`: one counted notes-section insertion.
- `src/mochi/view.ts`: menu/actions/indicators, navigation and session-scoped drafts.
- `tests/mochi-pins.test.ts`: synthetic regressions.
- `dist/frontend.js`, `dist/backend.js`: matching generated artifacts.
- `MOCHI-MSG-01C.md`, `ROADMAP.md`: report and approved progress only.

## Manual acceptance remaining

After a separately approved disposable Windows update:

1. Pin/unpin user and character messages in a DM/group, jump to an older bookmark,
   edit/reroll/delete originals and reload; confirm unrelated history is unchanged.
2. Create multiple notes, edit, disable, delete and reload. Verify explicit Save,
   listed order, retained unsaved text and stale-revision review. Switch accounts
   and rooms; confirm private drafts and stored notes stay in their own scope.
3. Compare diagnostic provider input for enabled/disabled notes without private RP
   content. Verify automatic and scheduled replies use notes; bookmarks alone do
   not change it. Check prepared-delivery editing reports a wait/cancel requirement.
4. Check 320px/390px/desktop wrapping, keyboard focus, screen-reader labels, composer
   focus and scroll anchoring after jumps. Confirm native Pocket remains independent.
5. Logout and confirm private frontend drafts disappear.

Live-provider behavior, actual-host focus and pixel rendering remain unverified.
Existing host authentication/external-hide limitations remain as previously reported.
AI reactions, variable note placement, presets/macros and restart draft persistence
remain deferred. MSG-01D has not begun. Stop for review.
