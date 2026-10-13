# MOCHI-MSG-01A — Quoted replies and reply context

Baseline: clean `b8e0c046d748c06ca28c9e14b50fb1df2fa54690`, isolated
`codex/mochi-desktop-01b-base-review`. 01F report/model/storage/generation/actions
were inspected before editing. The design summary was provided before implementation.
No original mochi WIP, Pocket Power, Kitty checkout, installed extension, test data,
host/browser or Ubuntu environment was modified or started.

## Representation and backward compatibility

Mochi messages have stable UUIDs assigned by the backend, independent of array
position. Add optional `MochiMessage.replyTo?: string`, containing the original
message ID, never copied content or another room/account identifier. Sent references
persist in the existing account-owned room JSON through existing revision locks,
atomic temporary-file replacement and send receipts. No schema version bump,
migration, phone-data change or historical rewrite occurs. Old messages without
replyTo retain their original prompt representation and rendering.

Before accepting a send, the backend validates real-user/fictional-account/room
ownership, revision, bounded identifier and a unique supported original inside
that exact room. Inaccessible, cross-room, malformed, ambiguous or missing targets
fail before acceptance. An empty send with explicit replyTo is rejected; the UI
omits pending reply metadata for empty continuation. No foreign-room lookup occurs.

Old installations accept the optional field under their existing unknown[] history
container and preserve existing message fields during edits, but do not render or
serialize quote context. Install the matching frontend AND backend together for
this feature; pairing the new UI with an old backend can drop quote metadata on
new sends. Rollback does not require deleting or migrating stored histories.

## UI, navigation and draft semantics

- Reply is added to the existing message-action sheet, for user/character messages.
  It selects a composer target, displays the sender and a whitespace-normalized
  excerpt (220 characters plus optional ellipsis) and focuses the composer.
- Clear reply target removes it without deleting draft text. Selecting another
  message replaces it. Pending targets are keyed by fictional account and room in
  the one authoritative view; real-user destruction clears them. They survive
  in-session room navigation, window hide/restore and workspace/portal handoff.
- Sent replies show a keyboard-accessible reference above their existing bubble.
  Activating it expands the existing history rendering limit to include the target,
  scrolls to it and focuses the message. It does not fetch another account/room or
  create a new client. The compatibility handset route also supports target focus.
- Original content is resolved from the current message record. Edits are reflected
  in previews/references, not tracked as a stale quote copy. Deleted, malformed or
  unavailable originals show Message unavailable with no old content/author invented.
- Layout uses scoped quote styles, existing theme tokens, bounded excerpts,
  wrapping for unbroken names/text and visible focus. Existing portraits, names
  outside bubbles, grouping, bubble caps, composer keys and controls remain intact.
- Failed/pre-acceptance sends retain target and text. On successful nonempty-message
  acceptance, only the still-matching target clears; a newer target selected while
  the prior request was in flight survives its acknowledgment. Empty continuation
  leaves the pending target intact and uses the previously accepted conversation.
  Stop/provider failure after acceptance preserves the saved user message/reference;
  explicit continuation can use its context without resending that user message.

Pending text/targets remain session memory, matching existing drafts. Restart draft
persistence conditional on Lumiverse's host setting remains a separate deferred
quality-of-life item; no browser storage or unrelated draft persistence was added.

## Generation input, budgets and limitations

`buildMochiPrompt` still uses only the selected room's messages, stable persona,
characters and settings, then the existing lower-level Pocket provider helper.
No active RP context, other Mochi room, actor memory or new provider pathway is used.

For a retained quoted message, the serialized dialogue contains a distinct Reply
reference with original message ID and author. If the original is already included,
its own serialized entry gets a matching Message reference ID; no duplicate full
content is added. If it was trimmed out, resolve it from the same full room history
and add a bounded 480-character normalized excerpt. Missing/ambiguous originals
produce an unavailable marker. One-level references do not recursively expand
chains of quotes. Excerpts remain untrusted dialogue, not system instructions.

All reference overhead is included in the actual token counter before provider
dispatch, preserving the output reservation and envelope margin. Each trimming
iteration recalculates which originals remain included. Only the outgoing array is
trimmed; stored histories and previous versions are untouched. Original lookup and
included/reference membership use maps/sets rather than adding a per-message
whole-history scan to prompt serialization.

Tests inspect the actual synthetic provider messages, including an edited original,
a group character author and an older original outside the outgoing window. This
verifies generation INPUT, not real model understanding or response quality.
No extra provider requests, retry loop or changes to Natural/Instant/Manual policy,
presence delays, scheduling/autonomy permissions, quotas or output parsing occur.

AI-authored structured reply metadata is intentionally deferred. Existing generated
replies and scheduled drafts contain speaker/text/behavior, not validated reply IDs.
Supporting that would also require validated provider output and scheduled-draft
delivery handling. Future extension point: optional validated replyTo on generated
reply/draft records, checked against the same scoped room before commit. This
checkpoint does not automatically attach a user's target to AI replies.

## Edits, deletions and rerolls

Existing edit/reroll operations spread the original record and preserve its intended
replyTo. Deleting a reply does not mutate the original. Deleting an original leaves
its replies with a dangling ID rendered as unavailable; no cascading history deletion.
Existing regenerated AI messages do not acquire an unrelated user reply target.
Message ordering, authorship, revisions, prior versions, receipts and notifications
continue through the existing service. Delayed/scheduled generation shares the same
prompt builder and room history; its runtime/job representation is unchanged.

## Changed files and verification

- `src/mochi/types.ts`: optional sent reply ID.
- `src/mochi/replies.ts`: bounded IDs, unique scoped resolution and bounded excerpts.
- `src/mochi/service.ts`: validate/persist user reply reference before acceptance.
- `src/mochi/generation.ts`: token-counted attributed quote context and indexing.
- `src/mochi/view.ts`: Reply action, scoped composer target, rendering and navigation.
- `src/mochi/workspace.ts`: apply quote scroll/focus after rendering older history.
- `src/mochi/reply-styles.ts`: scoped bounded quote/preview presentation.
- `tests/mochi-replies.test.ts`: synthetic persistence, scope, UI and provider-input tests.
- `dist/backend.js`, `dist/frontend.js`: matching installation artifacts.
- `ROADMAP.md`: checkpoint status/tentative Beta 1 target; phase order unchanged.
- `MOCHI-MSG-01A.md`: this report.

129 targeted tests passed across final affected runs, 1001 assertions. New quote
tests: 8 passing, 75 assertions. The affected sets cover Mochi storage/generation,
automatic replies, scheduling lifecycle, shared session and desktop rendering.
No complete Pocket suite, Chromium, parallel workload or live provider calls ran.
Tests use synthetic in-memory storage/providers and jsdom; no persistent user data.
Quote coverage includes legacy/fictional rooms, cross-user/room/account rejection,
interrupted rename, exactly-once retry receipts, edit/delete/reroll preservation,
current/missing originals, older history navigation, changed pending targets,
empty continuation, failures and hide/restore.

One TypeScript typecheck passed. One sequential production backend/frontend build
passed. Bundle inspection confirms validation/context code in the backend and
quote UI/navigation in the frontend. Both artifacts changed and must be delivered
together. 01F bundles were preserved in ignored `tmp/01f-verified-bundles`; all
earlier backups and installed copies remain untouched.

SHA256:

```
frontend 70A9869279009AC23BF68B65F98F832AD4AE375886367BF7904C0525E18740F1
backend  CD2FD6DEB47CF630C12A07B58B0E91D17233B4D54CBA2582E311AC443FBC974E
```

## Manual disposable Windows acceptance after separately approved update

1. Use a synthetic DM and group. Reply to user and character messages, change/clear
   targets and send. Confirm quote authors, message ordering and normal automatic replies.
2. At 320/390px and desktop width, inspect long names/excerpts, wrapping, bubble caps,
   composer visibility and keyboard/focus behavior. Pixel layout is not certified by jsdom.
3. Activate a quote targeting history older than the visible 100 messages; confirm
   loading/focus/scroll behavior. Very old targets can expand substantial existing
   history rendering; no new virtualized history system is introduced here.
4. Edit originals and replies; delete originals/replies; reroll a character message.
   Confirm current text, unavailable references and preservation of unrelated history.
5. Switch rooms/accounts, hide/restore and portal handoff with pending text/target.
   Test failed sends, empty continuation and Stop with a separately configured test provider.
6. Reload to verify SENT references persist. Unsent drafts/targets do not survive full
   restart yet. Check supported logout cleanup; known silent real-user switching and
   external-hide launcher limitations from 01F remain unresolved.

No migration/deployment was performed. MSG-01B and later features have not begun.
No push, installation, merge, rebase or deployment. Stop for checkpoint review.
