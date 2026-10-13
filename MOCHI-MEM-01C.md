# MOCHI-MEM-01C — Versioned Custom Presets and Room Bindings

Isolated branch: `codex/mochi-desktop-01b-base-review`.
Starting clean HEAD: `50375d9b66fa955568a41a47356fa9c4c820baec`.
Checkpoint commit: the commit adding this report (`git log -1 -- MOCHI-MEM-01C.md`).
MEM-01A findings and MEM-01B implementation/report were inspected. Neither MEM-01B
nor this checkpoint is claimed manually accepted. No installations or server changes.

## Storage and ownership

`MochiPresets` stores a library in authenticated real-user extension storage:
`mochi/v1/presets/<accountId>.json`, or `mochi/v1/presets/legacy.json` for unassigned
legacy rooms. Account IDs are validated before constructing a path. The bank is
`{version:1,ownerId,accountId?,revision,presets,receipts}`. Copied foreign-user/account
records fail ownership validation. Service operations additionally require access
to the current room and its fictional account. No native preset, character-card,
Pocket phone or RP storage is changed; no new extension permission is needed.

Custom presets contain a server-generated `preset_` + 32-hex ID, name, archive flag
and published revisions. A revision is `{revision,dmInstructions,groupInstructions,
layout:'legacy-v1'}`. Revisions append monotonically and are never edited/deleted.
Names are bounded to 80 characters; each instruction variant to 4000. Limits are
100 presets, 50 published revisions per preset and 10,000 mutation receipts per
library. Hitting a limit errors without evicting saved history. Archived presets
remain recoverable and retain all revisions. Rename changes library metadata only.

The library uses a scoped serialization lock, bank revision checks, retry receipts
and atomic `.pending` → committed-file replacement. Same-request retries cannot
duplicate a preset/revision. Stale concurrent publishing is rejected. Abandoned
pending files are ignored; failed replacement preserves the committed bank.
The bank is separate from room files, so publishing cannot corrupt room history.

## Built-in and revision behavior

Reserved `mochi_default`, revision 1, represents the current legacy-v1 layout with
no additional preset instructions. It is defined in source, always available without
reading a library, and cannot be renamed/published/archived as a custom preset.
Duplicate Default creates a new custom ID. UI labels distinguish Built-in and Custom,
even if a user gives a custom preset the same name.

Unbound rooms preserve the exact previous prompt and are not assigned a binding by
feature startup. Restoring Default removes the optional custom binding. Golden
fixtures are unchanged. Only built-in revision 1 is supported now; future built-in
evolution must retain this version/layout and add explicit revision handling, not
silently mutate the revision-1 contract. Unsupported revisions fail clearly.

Rooms optionally store `preset:{id,revision,accountId?}`. Bindings validate against
the room's current account and resolve the exact saved revision. Publishing a newer
revision does not change bound rooms. The UI offers explicit Update to latest.
Archived presets continue serving existing bindings; new rooms must restore the
archive before selecting it. Restore does not rewrite its content.

Missing, corrupt or foreign custom references are integrity errors, not silent
fallbacks. Generation/preview stop with a clear recovery message; records remain
preserved. An accessible room with a missing library revision can explicitly return
to Default. Malformed room bindings or damaged room records require recovery rather
than a destructive repair. Unbound/default resolution does not depend on a custom bank.

## Cross-file consistency and context changes

A room bind validates a committed library revision before writing the room.
There is no combined publish-and-bind operation. Failed publication cannot produce
a room reference to uncommitted content. A failed room write leaves a recoverable
unused library revision. There is no physical preset/revision deletion endpoint.

Confirmed Apply/Update/Restore uses existing room-context invalidation semantics:
advance room revision, abort that room's active interactive reply, cancel nonterminal
jobs and remove their invalid prepared drafts while retaining scheduling records.
Saved messages, notifications, quote/reaction metadata and unrelated rooms remain
unchanged. Same-request binding retries are receipt-safe; restoring an already
unbound Default is a no-op. Opening the library/selector and publishing/renaming/
archiving do not cancel generation, alter bindings or reserve generation quota.

Custom presets cannot cross fictional accounts via room reassignment. A custom-bound
room must explicitly restore Default first; assignment otherwise stops with a clear
message. This avoids silently copying private library content, losing references or
reinterpreting an ID in another account. Sharing/import and relationship-wide defaults
are not implemented.

## Prompt and preview integration

`resolveGenerationSources` resolves the owned published preset along with existing
authorized cards/connection/persona checks. Both interactive and scheduled generation
pass that immutable snapshot to the same context resolver. Preview uses the same
snapshot and includes it in its post-count source revalidation signature.

Variant selection is based on **room membership**, not the number of currently
eligible speakers: one member uses DM instructions, multiple members use Group.
Custom variant text is inserted once in the existing first system message, immediately
before `ROOM INSTRUCTIONS`. Existing room instructions remain unchanged and separate,
as the later, more specific override. Model compliance is not guaranteed; server
ownership, output-speaker validation, quotas and cancellation are never preset-controlled.

Texting styles, timing/Natural instructions, stable identities, history annotations,
system-note placement and continuation retain their previous locations. Default or
empty custom text adds nothing. Custom text participates in the same real token count,
history trimming and output/envelope budget. Over-budget content errors rather than
dropping instructions or stored history. Literal `{{...}}` remains literal.

Resolved plans/Prompt Preview now include preset ID/name/revision, built-in flag,
layout, DM/group variant and applied instructions. The logical `preset_instructions`
section identifies optional additional content. Existing roles/order, note placement,
budget/range display and inherited Lumiverse parameter precision caveat are unchanged.
No second assembler, provider route, listener or generation owner is introduced.

## UI and lifecycle

Room options include Presets, opening a bounded inline panel while preserving the
composer and selected chat. It provides:

- Effective preset/revision and a selector with confirmed Apply.
- Create and Duplicate Default; custom Edit/Publish, Rename, Duplicate, Archive/Restore.
- Separate DM/Group editors, explicit Publish and dirty feedback.
- Explicit Update to latest and confirmed Restore Mochi Default.
- Refresh, loading/error/empty states and visible pending-reply warnings.

Publishing the library and applying to the chat are clearly separate. The UI edits
the latest revision and appends a new publication; duplicate uses the latest revision
in the UI, while backend validation also supports a specified historical source revision.
It is not a full revision browser or advanced block editor.

Drafts are retained in the shared view's account/room/association-scoped session map.
Close/hide/navigation preserves them for that scope; explicit Cancel requires discard.
Failed/stale saves retain text. Refresh does not overwrite a draft; after a bank
revision conflict, users review current published text and explicitly adopt the
refreshed bank revision before resubmitting. Successful library mutations clear the
submitted editor. Logout/destruction clears private draft caches.

One library request ticket/timer uses the existing backend listener. Room/account
navigation, newer requests and destruction discard stale responses. Opening Search
or Preview closes the library surface without deleting draft text. Refresh rechecks
source/account access; no polling/observer is added. Controls use labels, native keyboard
behavior, safe text nodes, wrapping and scoped focus styles at narrow widths.

The known silent real-user authentication-switch lifecycle concern remains a multi-user
release issue. Simulations do not certify that every actual host transition tears down
the frontend. External library edits require Refresh; this is not a live collaborative
editor. Whole-library JSON is read/validated for custom resolution; large revision
banks have a corresponding storage/parse cost despite count/size limits.

## Verification

- Initial preset/context checks: **29 passed, 249 assertions**.
- Final affected preset/context/texting/search/pin/reaction/quote/automatic reply/
  scheduling/layout/session regressions: **165 passed, 0 failed, 1,258 assertions**,
  eleven selected files including imported account regressions.
- Final preset-only run: **12 passed, 0 failed, 85 assertions**.
- One TypeScript typecheck: passed.
- One sequential backend-then-frontend production build: passed.
- Runtime inspection confirms preset resolution, custom instructions, binding handler
  and frontend library UI in the matching bundles.

Coverage includes unchanged original golden prompts/counter sequences/parameters,
legacy and fictional libraries, immutable revisions, bindings and explicit updates,
archives/recovery, duplicates/renames/receipts, foreign/malformed/missing data,
concurrent publication, interrupted writes, no binding to uncommitted revisions,
DM/group precedence, literal macros, counted budget failure, preview/provider
equivalence, active generation coexisting with publication, fixed-revision scheduled
delivery and migration-free default restoration. DOM fixtures at 320px/390px/900px
exercise staged edits, separate publishing/applying, stale errors and scope tickets.

These are synthetic storage/provider and DOM checks. No full suite, Chromium, real
host, live provider or installed extension was run. Pixel layout, real token counts,
screen-reader behavior and combined live MEM-01B/01C acceptance remain pending.

| Bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `1F87F5B13A113196E22077A233F7DBF56167D92A008326AA7C68DBE9B8603586` |
| `dist/backend.js` | `9433A86E6DB498B290A0294F0BE958F496C56BCDAE4E34D5E9E05D7216C53D97` |

MEM-01B bundles are backed up byte-for-byte in ignored
`tmp/mem-01b-verified-bundles/`; prior backups are untouched. Install both new bundles
together only after separate approval. No migration rewrites existing rooms.

For rollback after future testing: first explicitly restore Default on custom-bound
test rooms using this version, then restore the matching MEM-01B bundle pair/commit.
Retain all preset libraries, room/account data and histories. Older code ignores
custom bindings and would otherwise change generation behavior; do not describe that
as an equivalent downgrade. No rollback/install operation was performed here.

## Changed files

- `src/mochi/presets.ts`, `preset-panel.ts`: owned immutable library and UI lifecycle.
- `src/mochi/types.ts`: optional room binding.
- `src/mochi/service.ts`: authenticated library/bind operations and reassignment guard.
- `src/mochi/context.ts`, `generation.ts`: shared resolved preset context.
- `src/mochi/preview.ts`, `preview-panel.ts`: effective preset metadata/validation/display.
- `src/mochi/view.ts`: existing-session UI/routing and private draft teardown.
- `tests/mochi-presets.test.ts`: synthetic storage, prompt and DOM regressions.
- `dist/frontend.js`, `dist/backend.js`: matching runtime artifacts.
- `MOCHI-MEM-01C.md`, `ROADMAP.md`: report and verified progress only.

## Combined disposable Windows MEM-01B/01C manual checklist

After separate approval to update the existing disposable extension:

1. Preview unbound DM/group prompts with styles, quotes, reactions and notes; confirm
   original roles/order, literal text, token precision and retained history.
2. Create distinct DM/Group instructions, Publish, then separately Apply. Check the
   preset/revision and actual compiled prompt, including unchanged room instructions.
3. Publish revision 2; verify an existing room remains on revision 1 until confirmed
   Update. Confirm another room/account is unaffected. Rename, duplicate, archive,
   restore and reload without losing published revisions.
4. Edit without publishing, close/reopen/switch rooms and confirm scoped draft retention.
   Check stale-library review, invalid input, Default recovery and missing-reference errors.
5. During active generation, open the library/preview and publish without canceling
   the reply. Separately confirm applying context cancels pending work with records
   preserved. Verify a scheduled reply uses its room's fixed published revision.
6. At 320px/390px/desktop, check focus, wrapping, composer access and controls.
   Logout must clear private frontend text. Verify native Pocket remains separate.

Custom macros/placement, summaries, native memory/vector/world books, AI returns,
narrator/persona/multi-bubble output, clocks, RP linking, AI creation and themes
remain deferred. All other branches, installed checkouts, disposable data and Ubuntu
remain untouched. Stop before MEM-01D.
