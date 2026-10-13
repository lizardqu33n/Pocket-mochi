# MOCHI-MEM-01F — AI-Assisted Conversation Summarization

Starting clean HEAD: `2326c29f1ff8668087875fe1d40005d052caf3fa`.
Branch: `codex/mochi-desktop-01b-base-review`.
Checkpoint: the local commit adding this report (`git log -1 -- MOCHI-MEM-01F.md`).
MEM-01B–01E reports and actual source paths were reviewed. MEM-01A findings are
referenced by those reports; no separate tracked MEM-01A report exists here.
MEM-01E remains development-verified, without disposable-host manual acceptance.
This checkpoint is also simulated/development verification, not live acceptance.

## Provider and task ownership

`MochiService.generateSummary` is a task on the existing per-real-user/room `jobs`
map, using existing room/account locks, pending cancellation registration and
`mochi:cancel`. It does not create a second provider worker, frontend view,
subscription, scheduler or persistent generation owner. Interactive and scheduled
tasks see the same occupied room slot. The current shared frontend session owns
the panel, Stop ticket and navigation/logout cleanup.

The task calls `src/backend/generation.ts:callPocketProvider` directly, with saved
room connection/model, explicit authenticated user, abort signal, no tools,
reasoning off, temperature 0.2 and bounded output. It does not call Pocket's RP
generation/preference workflow or ordinary character-response parser.

Source inspection also covered local Lumiverse:

- `../src/spindle/worker-runtime.ts`: `generate.quiet` and `tokens.countMessages`.
- `../src/spindle/worker-host.ts`: user-scoped connection access and
  `handleTokensCountMessages` / scoped model token counting.
- `../src/services/generation/direct-generation.ts`: `prepareQuietCall` and
  `quietGenerate`, connection-owned provider dispatch, inherited preset parameters,
  explicit parameter/model precedence and caller messages.
- `../src/types/connection-profile.ts`: model plus generic metadata, without a
  universally defined model-window field in the exposed connection API.
- `../src/llm/providers/openrouter.ts`: provider-specific model context metadata;
  this is not a universal Spindle connection-limit contract.
- `../src/llm/providers/anthropic.ts`: exhaustion may use `max_tokens` rather than
  `length`; both are rejected as incomplete summary output.

No provider/model endpoint was queried live. The counter receives the explicitly
selected model or saved connection model and the authenticated real user. Its
approximate/fallback indication is carried to the review UI. True provider context
windows cannot be universally discovered through the inspected API. The saved room
budget must fit the chosen model; the additional conservative task cap is not a
claim about every provider's actual window. Provider rejection remains possible.

## Exact source and bounded one-call approach

Generate takes an exact stable ending message ID, not a trusted array offset.
MEM-01E validates the full prefix and message-ID uniqueness/order. The task supplies
all selected messages from the beginning through that boundary, in order, including
IDs, roles, stored sender names, character IDs, creation times, content, reply
references and validated reactions. It does not trim or abbreviate source messages.
The complete prefix contains prior quote targets; it does not fetch facts from
another room or beyond the selected boundary. Authorized participant names and
the room persona name provide identity context, without importing character-card
scenario/personality instructions, room prompts, native RP history or memories.

Internal task instructions ask for concise recalled events, relationships,
significant facts and changes, with attributed claims/uncertainty rather than
assuming all fictional dialogue is objectively true. Source JSON is untrusted
conversation data, never permissions or instructions. An optional current summary
is off by default and allowed only when enabled, coverage-verified and contained
within the selected prefix; it is explicitly untrusted reference to verify against
the supplied messages. No macros in source/reference/output are expanded.

Limits:

- At most 1,000 source messages and 200,000 serialized source/reference characters.
- Input budget: smaller of saved room context budget and 16,384 tokens.
- Output reserve: smaller of saved room output reserve and 1,600 tokens.
- Additional envelope reserve: 256 tokens.
- Host counter counts both instructions and the full serialized source/reference.
- Generated JSON response is bounded; summary text is nonempty and at most 6,000
  characters. User-reviewed edits retain MEM-01E's 12,000-character save limit.

Oversized ranges fail before quota reservation/provider dispatch and clearly ask
for an earlier boundary or reviewed limits. No hidden chunking, iterative calls,
old-message clipping, coverage expansion or retry loop exists. One explicit Generate
normally makes one provider call; rejected/canceled preflight makes zero. Completion
must be valid `{"summary":"..."}`; fenced JSON is supported. Empty, malformed,
oversized and output-exhausted results are rejected without saving. Provider errors
use bounded fixed explanations rather than exposing raw responses/credentials.
Review is still essential: instructions cannot guarantee that a model never invents
or misattributes a fact.

## Provenance and stale validation

A private attempt record binds real user, room, exact fictional account,
association revision, relevant room configuration/current memory version, selected
prefix proof, full task-data digest (including reactions/reference), authorized
source signature and generation request ID. The public result has an opaque
`suggestion_` ID, source revision/association, actual coverage, timestamp, text and
safe budget metadata. Connection/source metadata is hashed privately and never
serialized into the result. Returned suggestions are cloned, not references to
the server's retained record.

Ownership, configuration, character/persona/connection access and both digests are
revalidated before dispatch and on completion. Relevant revisions are re-read
after asynchronous validation. Covered edits/deletion/rerolls/attribution changes,
reaction changes, settings/source changes and concurrent saved-memory changes
reject obsolete output. Same-text reroll metadata also invalidates the MEM-01E
proof. New messages appended after the fixed boundary do not change a valid prefix
and can remain compatible; they are not silently included in the suggestion.

Apply calls **the existing `saveMemory` transaction** with the suggestion ID and
current room/association revisions. It checks the private record, exact original
boundary/count/proof and task/source fingerprints again. It cannot replace an old
proof with an expanded or changed prefix. User-edited summary text is allowed;
source provenance remains fixed. Exactly one immutable version and normal save
receipt are committed atomically. Interrupted replacement preserves the previous
room; receipt replay appends no duplicate version. Generate itself adds no room
receipt, message, notification, schedule, draft-delivery record or memory version.

Changing generated coverage requires regeneration or the explicit **Review as a
manual draft** confirmation. That action relinquishes AI provenance after the user
reviews text and covered messages; the existing manual save rules then apply. It
does not silently reclassify stale output or claim the AI saw a changed prefix.

## Cancellation, quotas and retry safety

The existing scheduler reservation is used with the solicited-task flag:
background autonomy remains off unless already enabled by the user. Existing
limits remain 120 global / 60 real-user / 30 room attempts per hour, two global
reserved tasks and one reserved task per user. Existing ordinary interactive
reply reservation rules are unchanged. Summary quota is reserved after successful
preflight, before dispatch, and released in cleanup. A consumed attempt is not
quietly refunded after a provider error.

Stop, panel/navigation close, surface hide, account selection and recognized
logout destroy the frontend request ticket and request existing cancellation.
The backend timeout is 180 seconds; the panel requests cancellation if no result
arrives by 185 seconds. A provider ignoring cancellation can still consume its
original request, but late output cannot become a saved memory/chat message or
appear in another room/account. There are no automatic retries. A confirmed manual
memory save cancels incompatible generation under MEM-01E's context-change policy.
Read-only memory/prompt browsing remains side-effect-free.

Attempt/suggestion records are transient, bounded to 256 attempts per real user
per backend session, without silently evicting retry tombstones. Replaying the same
finished request can return its revalidated cached suggestion without a new call;
replaying a failed/canceled/in-progress attempt rejects. Reusing a request ID with
another range/reference option rejects. A new attempt always requires an explicit
Generate action. Backend restart clears suggestions/tombstones, but not durable
quotas, memory versions, histories or schedules. A surviving frontend draft from
before restart cannot Apply its lost AI ticket: regenerate or explicitly review
it as manual. No automatic restart resubmission occurs.

## Editor and compatibility

Conversation Memory now offers Choose range → Generate → editable AI preview →
Use in editor → explicit confirmed Apply. Saved memory remains available alongside
the suggestion for comparison. Generation never replaces handwritten unsaved text.
Replacing that draft or an earlier suggestion requires confirmation. Previous
suggestions survive generation errors and normal memory save/disable/clear/restore;
only explicit discard or successful application of that same suggestion clears it.
Applying an older editor draft does not discard a different newer preview.

The existing panel contains source range, honest generating state, Stop, safe
errors, output budget, saved-versus-draft labels and review controls. Scoped draft
maps/tickets retain edited text in the session and reject late/wrong-scope results.
Recognized logout clears private frontend caches. Fields wrap, use existing theme
tokens/focus indicators and bounded scrolling, and preserve the composer/quoted
reply. Generate is disabled while an ordinary reply owns the room; its Stop ticket
is preserved. Send is guarded while summary generation owns the room as well.
There is no additional frontend subscription or messenger/settings redesign.

Ordinary context resolution, macros, presets, source refresh, model picker,
quotes/reactions/pins/notes/Search/texting styles, memory exclusion and response
modes are unchanged. All original no-summary golden provider messages/counts pass.
Scheduled opportunities/drafts/notifications are untouched by Generate; Apply
retains the existing explicit context-save cancellation warning and behavior.
Native Pocket phone/RP controllers and Pocket Power are unchanged.

## Verification and matching bundles

Final selected sequential run: **241 passed, 0 failed, 1,835 assertions / 14 files**.
Summarization-specific coverage: **29 tests / 253 assertions**. Tests cover exact
legacy/fictional prefixes, full budget counting and rejection, one-call behavior,
preview/edit/apply isolation, stale proofs and same-text rerolls, newer-message
append, permission/foreign/restart rejection, Stop/timeout/contention, actual shared
scheduler quota enforcement with autonomy off, private DTOs, atomic retry,
request-ID replay, preserved handwritten/suggestion text and 320/390/900px DOM
fixtures. The other selected files cover memory, macros, context goldens, presets,
texting, search, pins, reactions, replies, automatic replies, scheduling lifecycle,
desktop layout and shared session/native-controller independence.

The initial typecheck/build passed. Final review found a newly introduced
suggestion-preservation issue; the user explicitly approved one additional
sequential verification/build pass. The correction and new regression passed;
final TypeScript check and backend-then-frontend production build passed. This was
two sequential builds/checks with explicit approval for the second, not parallel
or silently repeated verification. Earlier fixture-only failures were corrected
to clear seed events, expect the correct ownership rejection and finish the initial
memory read before clicking Generate. Final results above are from current source.

Final SHA-256:

- Frontend: `A2AE424F1B229E4403E31AAE49E9EE7EE3828CA1A56F6CFC6352222BE2D5368E`
- Backend: `227CC6CA554BC7C2F922FD0ABF2AF708B17E8452131C89EDD9B75B167F92A299`

Source and generated routes/editor/task markers agree. Backend output is identical
between the two builds; the final correction changes frontend behavior only.
Prior MEM-01E pair is verified and preserved in ignored
`tmp/mem-01e-verified-bundles/`; the first F candidate is in ignored
`tmp/mem-01f-before-draft-fix-bundles/`. All earlier backups remain untouched.
No full suite, Chromium, actual browser, host startup, live provider, installation,
push or deployment was performed. DOM widths do not establish pixel acceptance.

## Changed files and rollback

- `src/mochi/summarization.ts`: authorized source task, budgets, parser, safe errors.
- `src/mochi/service.ts`: shared task ownership, transient provenance/idempotency,
  source validation and Apply-through-memory checks.
- `src/mochi/memory-panel.ts`: generation/review controls, Stop, explicit replacement,
  scoped suggestion drafts and preservation.
- `src/mochi/view.ts`: existing frontend task ownership/composer contention guards.
- `tests/mochi-summarization.test.ts`: targeted new backend/UI regressions.
- `tests/mochi-memory.test.ts`: existing options queried by accessible label rather
  than incidental checkbox order.
- `dist/backend.js`, `dist/frontend.js`: matching generated pair.
- `ROADMAP.md`, this report: verified progress and combined acceptance plan.

No room schema migration or new durable memory format is needed. Code rollback
uses commit `2326c29` and its matching MEM-01E pair together in a separately approved
test environment. Do not delete extension storage or overwrite room files with
older copies. Saved F summaries are ordinary E versions, so E can read them.
Rollback/restart loses only transient AI tickets, not saved history or versions;
it does not revive canceled jobs. Original `mochi` remains `9e5267664a99e14ec6bc41db75133bedc830e91e`,
Pocket Power remains `8b16bdf0f945ac473eb1a25fd7e9f17554b4a248`, and installed/disposable
test environments and Ubuntu are untouched. No private data/screenshots/backups
are included in this checkpoint.

## Combined MEM-01E + MEM-01F disposable acceptance checklist

After separate installation/provider-testing approval, use only synthetic rooms:

1. Create legacy and fictional-account histories. Manually save a summary through
   a known message, edit/save/restore/disable/clear, reopen/reload and inspect
   unchanged originals, revisions and recovery versions.
2. Preview Automatic with summary/exclusion off/on; verify actual prefix exclusion
   versus token trimming and old quote excerpts. Test Manual missing/duplicate/
   standalone summary rows, invalid coverage fallback and literal macro-like text.
3. Choose a small prefix, Generate once, check the source count/boundary, review
   claims and facts, edit the AI preview and compare saved memory. Confirm saved
   memory does not change until Apply; confirm replacing a handwritten draft.
4. Apply once/retry; inspect one version, preserved original chat/receipts/notices,
   and working normal Manual/Instant/Natural replies afterwards.
5. Append newer messages before Apply; verify valid prefix remains applicable.
   Edit/delete/reroll a covered message, including identical reroll output; verify
   stale Apply rejects and preserves editable text. Test changed coverage and
   explicit manual review; no silent proof expansion.
6. Generate while a reply is active and vice versa; test Stop, window hide,
   account/room switching and recognized logout. Check no late text, duplicate
   provider request, memory/chat write or notification. Confirm durable scheduled
   jobs survive Generate; Apply cancellation is explicitly warned.
7. Test provider empty/malformed/length/rate-limit failures and an oversized prefix;
   check safe explanations, no hidden retries, no source clipping or lost drafts.
   Keep autonomy off and verify explicit summary generation can still work.
8. With an edited AI preview present, save/disable/clear/restore current memory;
   confirm the unsaved suggestion survives. Apply the matching suggestion or
   explicitly discard it; verify only that candidate is cleared.
9. At 320/390/desktop widths check real wrapping, Tab/selection/caret/Stop/focus,
   long history scrolling, composer/quoted target and portal/window handoff.
   Exercise provider/model selection, source refresh and native Pocket Messages.
10. Restart the disposable backend with an unapplied suggestion if practical;
    check lost-ticket rejection without losing saved memories/rooms/schedules.

Remaining limits: one-call prefix-only summarization; no chunking or auto-summary;
provider accuracy and real cancellation behavior need manual testing; model windows
and approximate counter precision depend on host/provider; transient tickets and
drafts do not provide restart persistence; 256-attempt/session and MEM-01E's
100-version/no-compaction bounds remain. The silent real-user-switch host lifecycle
concern remains explicitly open for multi-user beta readiness. No MEM-01G, native
memory/Cortex/World Book/vector/RP linking, clocks, narrator, multi-bubble or theme
work began. Stop for combined E/F review.
