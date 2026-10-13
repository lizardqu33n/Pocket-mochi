# MOCHI-MEM-01B — Structured Context Resolver and Prompt Preview

Starting branch: `codex/mochi-desktop-01b-base-review`.
Starting clean HEAD: `096f8b8d6335cff14ca22e0c477ba2739ab64cb8`.
Checkpoint commit: the commit adding this report (`git log -1 -- MOCHI-MEM-01B.md`).
The previous MSG-01E report and read-only MEM-01A findings were inspected before edits.
No installation, push, deployment, host/browser launch or live provider request.

## Old/new structure and exact equivalence

Previously `generation.ts:buildMochiPrompt` constructed one system message,
annotated and budgeted history, enabled system notes and the continuation request.
The existing construction now lives in `context.ts:resolveMochiContext`, returning
the same provider messages plus section/budget/history metadata. `buildMochiPrompt`
remains a compatible wrapper returning only `plan.messages`. Generation continues
through the same provider boundary and output parser. Source authorization was
extracted to `resolveGenerationSources`, preserving the former order of checks and
card resolution; preview reuses it without generating.

Eight synthetic goldens were captured **before extraction**, using the source at
the starting commit. Committed fixtures cover default DM, texting style, group,
enabled/disabled notes, quotes/reactions, trimmed history, Natural/timing and
scheduled context. They contain exact serialized messages and every synthetic
token-count result during trimming. After extraction all comparisons match byte
for byte. Actual synthetic provider input, max_tokens, temperature, model override
and reasoning match too; durable scheduled dispatch separately matches its golden.
Goldens were not replaced after refactoring.

The trimming loop, history order, quote excerpts, reaction limits, note placement,
default omission behavior, output reservation and 256-token envelope remain intact.
No stored history/settings/room schema changed. Metadata is not added to provider
messages, and the resolver introduces no extra token-counter/provider calls in
ordinary generation.

## Internal section identities

`core`, `room_title`, `persona`, `characters`, `room_instructions`, `texting_styles`,
`timing`, `natural`, `history`, `quotes`, `reactions`, `system_notes`, `continuation`.

These identify logical context groups, not an exposed macro/template API. Several
share provider message 1; quote/reaction annotation groups belong to dialogue.
System notes retain separate system messages after dialogue; continuation remains
the last user message. Preview shows active/omitted groups and their provider-message
group mapping. There is no user editing, role/position change or macro evaluation.
Literal `{{...}}` text remains literal. Ownership, speaker restrictions, quotas,
cancellation, scheduling and output validation remain outside editable prompt data.

## Read-only preview contract and authorization

`mochi:preview` accepts request ID, room ID, fictional-account scope, transient
`scenario` (`continue` or `automatic`) and responder (`auto` or a room character).
The authenticated callback supplies the real user; payload identities cannot select
another real user. The service reads the owned room under its existing lock,
validates persona/connection/character access and current eligible speakers, and
resolves context through the same builder and token API as generation.

The response contains request/scope/revision tickets and an explicit preview DTO:
messages, logical sections, input/output/envelope/context/remaining token counts,
stored/retained/trimmed message counts and first/last retained IDs, snapshot time,
selected scenario/responder, Natural-mode flag, assumptions, tokenization precision
and explicit Mochi parameters. Raw connection/source DTOs, credentials, authentication
tokens and arbitrary tokenizer metadata are never serialized. Connection/source
signatures are compared only privately in memory and are not logged or returned.

After asynchronous counting, sources and authorization are checked again, followed
by another room read. Changed content/association revisions, card/connection data,
presence settings or autonomy eligibility reject the result. Preview never writes
storage, creates a receipt, acknowledges notifications, reserves quotas, claims a
job, schedules delivery or enters the active provider-job map. An active reply can
continue normally while preview resolves. No second subscription/session exists.

## Precision, provider parameters and dynamic limitations

Continue previews the same current saved-history context as empty continuation.
Automatic previews the current saved history with the saved mode and responder;
it does not accept a new user message. Natural selection is enabled only for the
automatic scenario with Natural mode and automatic responder. If automatic replies
are disabled, the preview explicitly labels that scenario hypothetical.

Current Offline eligibility is honored; no eligible characters means unavailable.
Away/DND delay is disclosed rather than treated as an immediate dispatch. Timing
suggestions are included only when the existing AI-behavior, room and real-account
background gates allow them. Future scheduled prompts are not predicted: history,
presence and permissions may change. Snapshot time is shown.

Counts use the same `host.tokens.countMessages` API and selected model as generation,
not an invented preview estimator. Local Lumiverse inspection of
`worker-host.ts:handleTokensCountMessages/buildTokenCountResult` shows scoped tokenizer
resolution/counting, not provider dispatch or persistent writes. Tokenizer caches
may warm during resolution. The response surfaces the host `approximate` flag;
absent precision metadata is labeled unknown. A matched tokenizer count is still
not guaranteed to equal provider billing/envelope usage.

Explicit request parameters remain max_tokens = room outputTokens, temperature 0.8,
optional room model override, reasoning source off. Native quiet generation can merge
connection-preset parameters, but the current permitted connection API does not
expose that complete effective merge to this preview. The UI states this limitation
instead of returning secrets, requesting preset access or claiming an exact full
provider call. Provider-side transformations, quota outcomes and actual dispatch
eligibility are not executed or forecast. Budget failures show an error.

## UI, lifecycle and performance

Room options now include **Preview AI prompt**. A bounded inline scroll panel shows
transient scenario/responder selectors, Refresh, Close, loading/errors, token/history
information, assumptions, logical sections and collapsible ordered role/text blocks.
It says previewing does not contact the AI. Names use room overrides/source labels,
while exact IDs drive selection. Safe text nodes and wrapped preformatted text are
used; long text cannot become HTML. Search and preview panels are mutually exclusive.
The composer, draft and pending quote are retained. Opening focuses the selector;
closing returns focus to Room options. Styles are scoped to Mochi with visible focus,
accessible names and polite status announcements.

The shared view owns one preview ticket/timer. New requests supersede old ones;
room/account changes, destruction/logout, received relevant room/presence changes
and source-refresh acknowledgments invalidate tickets/data. Late replies cannot
reopen or expose another room. Closed-client backend work may finish read-only;
its result is ignored and does not cancel generation. No polling/observer is added.

Unannounced source edits in another host view require explicit Refresh; this is a
timestamped snapshot, not a live source subscription. If the frontend conversation
revision is behind the backend, refresh the conversation before previewing again.
The known silent real-user identity-switch host lifecycle concern is not fixed or
certified by this checkpoint.

Generation retains its existing trimming cost. Preview repeats source/ownership
reads for safety and may make the same multiple token-count calls as a long-history
generation. No provider calls occur. Rendering is bounded by panel height and uses
collapsed prompt blocks; very large prompts can still contain substantial text.

## Verification and artifacts

- Eight pre-extraction golden cases: exact message serialization and counter-call
  sequence match; actual synthetic provider parameters match.
- Targeted resolver/preview + texting/search/pins/reactions/quotes/automatic replies/
  scheduling/layout/session regressions: **153 passed, 0 failed, 1,173 assertions**,
  ten selected files including imported account regressions.
- Final resolver/preview run after responder display-label refinement:
  **19 passed, 0 failed, 171 assertions**.
- One TypeScript typecheck: passed.
- One backend-then-frontend production build: passed.
- Bundle inspection confirms shared resolver, authenticated preview handler and UI.

Coverage includes scheduled golden dispatch, legacy/fictional ownership, credential
sentinel exclusion, unchanged persisted records, revoked/changed sources, mode gates,
active-generation coexistence, stale tickets, source invalidation, literal macros,
safe HTML text and DOM fixtures at 320px/390px/900px with opening/closing focus and
draft retention. Tests use synthetic providers/token counters only. No full suite,
Chromium, actual host or real provider was run. Pixel layout, real tokenization and
assistive-technology behavior remain manual acceptance work.

| Bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `B0F132D08EB7A66624B64825B8EEF9B9B64BA42C15523A4E0F72B8F0819857CE` |
| `dist/backend.js` | `F8F0C256037B591179D1C409D0EF0FCCC1A7281CE2E45FB4BA52C629D0883C64` |

MSG-01E bundles remain recoverable byte-for-byte in ignored
`tmp/msg-01e-verified-bundles/`; all earlier backups are untouched. Both new bundles
must be installed together only after separate approval. No migration exists;
rollback restores the previous matching bundles/commit without deleting storage.
The ignored one-time golden-capture helper is not part of the checkpoint.

## Changed files

- `src/mochi/context.ts`: existing byte-preserving builder plus plan metadata.
- `src/mochi/generation.ts`: compatibility wrapper and shared source resolution.
- `src/mochi/preview.ts`: read-only resolution and explicitly whitelisted output.
- `src/mochi/service.ts`: authenticated preview and final scope/source rechecks.
- `src/mochi/preview-panel.ts`: ticket lifecycle, bounded UI and scoped styles.
- `src/mochi/view.ts`: existing listener/menu integration and invalidation.
- `tests/mochi-context.test.ts`: golden, authorization and DOM regressions.
- `tests/fixtures/mochi-context-cases.ts`, `mochi-context-golden.json`: synthetic baseline.
- `dist/frontend.js`, `dist/backend.js`: matching generated artifacts.
- `MOCHI-MEM-01B.md`, `ROADMAP.md`: report and verified progress only.

## Manual acceptance after a separately approved disposable update

1. Preview a DM/group with styles, enabled/disabled notes, quotes and reactions.
   Inspect actual role/order, section groups, token precision and retained range.
2. Compare Continue/automatic and selected responders in Manual/Instant/Natural,
   including Away/DND/Offline. Confirm saved settings do not change.
3. Keep a draft/quote and active generation, open/refresh/close preview and confirm
   no extra reply, cancellation, quota charge or notification acknowledgment.
4. Change source/settings while resolving; switch accounts/rooms or logout before
   response. Confirm stale content is unavailable and private state is cleared.
5. Check 320px/390px/desktop wrapping, keyboard focus, scroll/composer access and
   literal template text. Use synthetic data only in diagnostics.

Custom presets/bindings, macros, summaries, AI returns, narrator/persona output,
multi-bubble delivery, clocks, RP linking, AI creation, themes and settings redesign
remain deferred. Original branches/WIP, Pocket Power, installed Kitty, disposable
data and Ubuntu remain untouched. Stop before MEM-01C.
