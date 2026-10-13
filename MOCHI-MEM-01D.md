# MOCHI-MEM-01D — Macros, Placement and Preset Workspace

Starting clean HEAD: `42d9c3e1e347a65a94bb92fdfa6de4c37753752d`.
Branch: `codex/mochi-desktop-01b-base-review`.
Checkpoint commit: the commit adding this report (`git log -1 -- MOCHI-MEM-01D.md`).
Prior architecture/resolver/preset reports and actual source were reviewed.
No installations, push, deployment, host/browser startup or live provider calls.

## Host UI inspection and focused adaptation

Inspected local Lumiverse frontend:

- `../frontend/src/components/panels/LoomBuilder.tsx` and `.module.css`:
  distinct header/toolbar, flexible selector/action groups, section/category controls,
  enabled state and a contained, height-aware editor layout.
- `../frontend/src/components/modals/LoomSelector.tsx` and `.module.css`:
  library selection, category/group navigation, collapsible groups and scoped styling.
- `../frontend/src/components/panels/PresetManager.tsx` and `.module.css`:
  routine controls separated from advanced collapsible provider/reasoning settings.
  This component is not the full prompt-block editor; LoomBuilder is the relevant editor.

Mochi's former library/editor was a long inline list with similarly styled fields.
It now has an actual library-navigation pane and selected published/editor pane,
framed cards, explicit selected state and draft/published headings. Switching from
a draft to another preset requires discard confirmation. The workspace uses two
columns when its own container is at least 600px wide; narrower containers stack
the panes, with a bounded library navigation area. This is independent of viewport
width or hidden host components. Controls, borders, colors and focus use scoped
Pocket/Mochi variables; no React/component framework or host stylesheet was copied.

The editor has bordered instruction fields and ordered manual-section cards with
Move up/down, Remove, title/template controls and Add. Publish and Apply remain
distinct. Preview has a read-only identity header, warning treatments, framed role
blocks and bounded wrapped text. There is no messenger/theme/settings-wide redesign.
Actual pixel appearance remains unverified without a separately approved browser test.

## Supported pure macro vocabulary

| Expression | Content |
| --- | --- |
| `{{mochi_characters}}` | Authorized eligible participant roster with stable IDs/names/cards |
| `{{mochi_persona}}` | Stable room persona JSON |
| `{{mochi_room_instructions}}` | Saved room instructions |
| `{{mochi_texting_styles}}` | Existing attributed tendencies, empty when absent |
| `{{mochi_system_notes}}` | Enabled notes as separate system messages |
| `{{mochi_history}}` | Retained structured dialogue with original quote/reaction annotations |
| `{{mochi_summary}}` | Reserved, always empty, with inactive warning |

Names are case-sensitive; whitespace around a name inside braces is permitted.
Only manual-row templates expand expressions. Source cards, persona/message/note
text and DM/Group instructions are not recursively evaluated. Unknown expressions,
including native host macros, remain literal with warnings. No Lumiverse macro API,
RP context, variable mutation or provider request is used. Duplicate singleton macros
expand only once across the plan and warn. Missing character/persona/history macros
warn without blocking publication. Optional absent data inserts no blank message.

## Placement semantics and exact Automatic compatibility

Existing `legacy-v1` revisions retain Automatic behavior and meaning. All original
golden provider messages, counter sequences and parameters pass unchanged.
Selecting Automatic in a draft publishes a new legacy-v1 revision; it never changes
the layout of an older revision or silently updates a bound room.

New `manual-v1` revisions carry `placement:{version:1,rows:[{id,title,template}]}`.
Rows are ordered; each has a validated stable `section_` + 32-hex ID. Limits: 12 rows,
80-character titles, 2000 characters/template and 8000 total template characters.
Unsupported roles/fields, duplicate row IDs, malformed/unbalanced expressions and
invalid versions are rejected server-side. History and system notes each require
a standalone macro row; flattening them into a text row is rejected.

Manual output:

1. Fixed system core: messenger/response/speaker rules, room title, literal selected
   DM/Group preset instructions and currently enabled timing/Natural rules.
2. Ordered user rows: scalar macros/literal text produce system messages; history
   preserves user/assistant roles; notes preserve their system role and internal order.
3. Mandatory final user continuation request.

Manual rows replace automatic context insertion entirely; persona/cards/instructions/
styles/notes/history are not also inserted through legacy positions. The fixed core
and continuation cannot be reordered or removed. Arbitrary roles, history depths,
dragging provider-level internals and host macro-language compatibility are not
supported. This documented subset preserves Automatic bytes while enabling actual
independent note/history placement. In Manual mode, room instructions apply only
where their macro is placed; omission is deliberate, not an invisible fallback.

Ownership, allowed speakers, source permissions, quotas, cancellation and parser
validation remain server-enforced regardless of prompt text. Manual instructions
remain model-visible data/instructions, not authority to mutate service state.

## Revisions, bindings, preview and budgets

The existing account-owned preset bank, locks, receipts and atomic replacement remain
in use. Manual layout validation applies both on publishing and reading stored data.
Duplication retains the chosen source revision's layout/plan. Publishing appends an
immutable revision; explicit Apply/Update is still needed for a room. Archive/recovery
and cross-account safeguards remain unchanged. No existing records are migrated.

The same context resolver powers real generation and preview. Each trimming pass
composes the actual manual plan before calling the same host token counter. Dialogue
is trimmed only from outgoing context, with original quote excerpts/reaction attribution
retained; source history is never rewritten. Core/notes/templates are not silently
discarded to fit. If history is omitted, preview reports retained zero and explicit
omission rather than pretending messages were token-trimmed.

Preview shows effective layout/revision, ordered row-to-provider-role mapping,
missing/duplicate/unknown/reserved warnings and actual compiled text. Fixed core and
continuation are labeled server-required. Token precision and inherited native
connection-preset parameter caveats remain intact. Publishing/previewing do not
cancel generation; applying a changed revision uses existing context invalidation.
There are no extra listeners, provider routes, polling loops or persistent message stores.

## Empty output clarity and upstream boundary

At Mochi's successful provider-return boundary, absent/null/empty/whitespace content
now reports: **The AI returned an empty response. Please try again.**
Nonempty malformed JSON reports malformed message JSON. Nonempty valid JSON with
invalid speakers/messages retains structural validation. Natural silence remains
an intentional empty messages array, not an empty provider response.

Provider transport/API exceptions propagate without being relabeled. Stop remains
AbortSignal-controlled. Accepted user messages and receipts remain saved, same-request
replays do not generate again, and no automatic retry or extra call is introduced.
No raw private response is logged. This distinguishes observable output; it does not
establish the reverse proxy's root cause. Failures thrown inside Lumiverse's provider
adapter before Mochi receives text remain outside this diagnostic improvement.

## Verification

- Macro/context/preset targeted pass: **49 tests passed, 339 assertions**.
- Final affected macros/context/presets/texting/search/pins/reactions/quotes/automatic
  replies/scheduling/layout/session pass: **185 passed, 0 failed, 1,348 assertions**,
  twelve selected files including imported account regressions.
- One TypeScript typecheck: passed after the final omission-display refinement.
- One backend-then-frontend production build: passed.
- Bundle inspection confirms manual expansion, workspace controls and separate
  empty-output diagnostic in the matching artifacts.

Coverage includes original golden equivalence, both account/legacy publication,
immutable bindings and duplication, no recursion/duplicate injection, unknown and
missing macros, structural rejection, independent notes, structured history,
quotes/reactions, preview/provider parity, manual token trimming, saved-history
preservation, empty/whitespace/missing/malformed/valid/transport output, newly
accepted Instant text and receipt replay. DOM fixtures at 320px/390px/900px cover
section movement, Automatic recovery, framed library/editor navigation, selection,
warnings and staged drafts. Existing ownership/scheduling/session regressions pass.

The first targeted process stalled before producing results and was explicitly stopped.
Its outcome is not counted as passing. Isolated pure expansion and subsequent targeted
runs completed normally; the stall's cause is unknown. Verification stayed sequential.
No full suite, Chromium, actual host or live provider ran. DOM structures are not
pixel/real-pointer or screen-reader acceptance.

| Bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `C7BBDAD80DD27C6DB2C1125CD329021E66B774021D48E1C6830CB95AF8F00468` |
| `dist/backend.js` | `A61ECAA5A2BD867BEDF6B9C057BBF6D1BD6269F3E71E7F264F7E47D52602830F` |

MEM-01C bundles are preserved byte-for-byte in ignored
`tmp/mem-01c-verified-bundles/`; prior backups are untouched. Both new bundles must
be installed together after separate approval. For a later downgrade, first explicitly
return test rooms to Default/Automatic supported revisions. Preserve all libraries
and histories: older code cannot manage a bank containing manual-v1 revisions, though
unbound Default generation does not read that bank. Do not delete revisions to force
a downgrade; restore this version to regain access. No downgrade/install happened here.

## Changed files

- `src/mochi/macros.ts`: pure expansion, limits, structural validation and warnings.
- `src/mochi/placement-controls.ts`: ordered-row editor and live local warnings.
- `src/mochi/presets.ts`: additive immutable manual revision support.
- `src/mochi/context.ts`: manual composition with unchanged Automatic path.
- `src/mochi/preset-panel.ts`: actual library/editor workspace and layout publishing.
- `src/mochi/preview-panel.ts`: layout/warnings/omission display and readable output.
- `src/mochi/generation.ts`: empty-versus-malformed successful-output diagnostic.
- `src/mochi/view.ts`: scoped workspace styling integration.
- `tests/mochi-macros.test.ts`: targeted synthetic/DOM regressions.
- `dist/frontend.js`, `dist/backend.js`: matching runtime artifacts.
- `MOCHI-MEM-01D.md`, `ROADMAP.md`: report/progress only.

## Disposable Windows acceptance after separate update approval

1. Confirm Default/Automatic prompts match prior behavior; keep drafts and active
   replies while opening/publishing/previewing presets. Applying still needs confirmation.
2. Publish Manual, reorder notes and history, inspect compiled roles/order and token
   ranges. Check quotes/reactions, literal source macros and no double injection.
3. Omit essential macros, repeat a singleton and try unknown/unbalanced expressions.
   Verify warnings, safe publication/rejection and recoverable Automatic revisions.
4. Check library/editor selection, dirty discard, Publish versus Apply, fixed room
   revisions, archives and account switching. Logout must clear private frontend text.
5. At 320px/390px/desktop and zoom, check two-pane threshold, stacked navigation,
   wrapping, keyboard/focus, composer access and read-only preview cards.
6. If the proxy fails, distinguish empty output from malformed JSON or transport
   errors without exposing raw private responses. Verify saved messages and manual retry.

Unresolved silent real-user auth-switch remains a multi-user release concern.
Actual UI appearance and full manual regression remain pending. Summaries, native
memory/worldbooks, AI returns, narrator/persona output, multi-bubble delivery, clocks,
RP linking, themes and settings-wide changes remain deferred. Other branches/WIP,
installed Kitty, disposable data and Ubuntu remain untouched. Stop before MEM-01E.
