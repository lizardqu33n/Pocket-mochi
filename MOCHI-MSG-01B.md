# MOCHI-MSG-01B — Persistent emoji reactions

Local checkpoint on `codex/mochi-desktop-01b-base-review`, based on
`f7e437199afe204e970dcae1b80186fa745ae766`. The checkpoint commit is the commit
adding this report (`git log -1 -- MOCHI-MSG-01B.md`). Nothing is installed or pushed.

## Delivered scope

User reactions are implemented. React opens an eight-emoji palette in the existing
message-action sheet. Chips underneath the exact message show counts, attributed
actor names in titles/accessibility labels, and the current profile's selected
state. Clicking the same emoji removes that actor's reaction. Both user and
character messages support reactions; other actors' records remain untouched.
Native buttons support keyboard activation and visible focus. Picker targets are
44px; chip rows wrap within the existing bubble layout. Empty rows are hidden.
There are no new assets, dependencies, subscriptions, polling or generation owners.

## Data model and safeguards

An optional `MochiMessage.reactions` array stores `{emoji, actor, actorId, name}`.
Message UUIDs remain unchanged. No room schema version change or migration occurs;
messages without reactions remain compatible. Attribution is a historical snapshot.
Historical actors remain readable after explicit legacy-room assignment or removal
of a participant; this does not grant access to another account or room.

The authenticated `mochi:reaction` handler reads the real-user/fictional-account
scoped room, validates the request/message identifiers and palette, rejects supplied
actor identities, and derives the user actor from the room's fictional account (or
the legacy marker). Clients cannot create character reactions. Missing, ambiguous,
deleted, inaccessible and foreign-room targets are rejected. Unsupported reaction
records cause an error rather than a history rewrite. Reaction arrays are bounded
to 128 entries and duplicate actor/emoji tuples are rejected.

Existing room locks, revision checks, request receipts and atomic persistence apply.
Replaying a successful request does not toggle twice. Concurrent stale mutations
must refresh. Reactions are rejected during active interactive generation or a
live scheduled generation lease; Stop/cancellation behavior is unchanged.
Metadata-only updates advance matching nonterminal scheduling revision tickets
without changing drafts, statuses, expiry, attempts or quotas. Stale and terminal
jobs are not revived. Editing/rerolling retains reactions; deletion removes only
the targeted message. Quoted references retain their existing missing-target behavior.

## Prompt context

The actual provider history includes JSON reaction attribution as conversation data,
without duplicating message text. At most four reactions per included message and
32 total are sent, prioritizing recent retained messages. The existing token counter
counts this metadata before context trimming. Stored history is never trimmed.
Only the selected room contributes metadata; quotes and message attribution remain
intact. Malformed metadata stops prompt preparation safely instead of deleting it.

## Optional AI reactions: explicitly deferred

The request permits completing persistent user reactions and reporting a follow-up
when all AI requirements cannot fit safely. This checkpoint uses that fallback.
AI reactions are unavailable/off; no nonfunctional toggle is added. There are no
extra provider requests. Model-provided reaction fields are ignored, not executed.
Existing character-attributed records can be displayed, but this endpoint cannot
write them and no character generation produces them in this checkpoint.

Same-call decisions are feasible, but `GeneratedReply`, `ScheduledDraft` and
scheduled completion records do not currently preserve validated reaction targets.
Implementing only interactive reactions would omit delayed and restart-safe delivery.
The smallest follow-up is an opt-in independent of autonomy, bounded prompt-local
target aliases, validated speaker-derived actors, and optional validated decision
metadata carried through durable drafts and atomic exactly-once completion. Every
delivery path must revalidate room/account/target ownership, revision and cancellation.
Keep text replies, quotas and existing silence decisions; do not add a reaction call
or retry loop. This needs separate review before extending the generation pipeline.

## Verification

Sequential simulated checks only, using disposable in-memory records and distinguishable
synthetic provider responses; no private data, live providers, host or browser runs.

- Affected reaction/quote/automatic-reply/scheduling/layout regressions: **87 passed,
  0 failed, 662 assertions**.
- Final reaction-only rerun after accessible-label assertions and empty-row spacing
  correction: **10 passed, 0 failed, 60 assertions**.
- One TypeScript typecheck: passed.
- One sequential backend/frontend production build: passed. A final frontend-only
  refresh incorporated the empty-row CSS correction; backend hash stayed unchanged.
- Synthetic UI checks at 320px and 390px cover attribution, selected state, palette,
  labels and exact-ID dispatch. These are DOM checks, not pixel/Chromium verification.

Coverage includes legacy and fictional rooms, ownership/actor forgery, concurrent
stale mutations, receipt retries, service reload, interrupted atomic writes, editing,
deletion, quotes, rerolls, queued/generated jobs, Stop and late outputs. Provider-input
checks verify bounded counted attribution and unchanged stored history. Existing
automatic reply/mode and scheduling regressions pass. No full suite was run.

SHA256 of matching generated runtime artifacts:

| Bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `14FCAC107434DB1409AB8C118D271010B405F7765892B6C9D5FB6B456B485050` |
| `dist/backend.js` | `406132EB13990DDE1297CFC436CCFC73B6657FB0760B247937A3EE15410BF724` |

MSG-01A bundles are preserved byte-for-byte in ignored `tmp/msg-01a-verified-bundles/`;
prior 01C backups are untouched. Both new bundles must be installed together after
separate approval. No installed checkout or synthetic test-instance storage changed.
A downgrade hides reactions and lacks the endpoint; it is not a data migration.

## Changed files

- `src/mochi/reactions.ts`: palette, accessible names, historical record validation.
- `src/mochi/reaction-styles.ts`: scoped chip/picker styling.
- `src/mochi/types.ts`: optional message reaction representation.
- `src/mochi/service.ts`: owned, receipt-safe atomic user toggle.
- `src/mochi/generation.ts`: bounded counted reaction context.
- `src/mochi/view.ts`: React action, palette and attributed chips.
- `tests/mochi-reactions.test.ts`: targeted synthetic regressions.
- `dist/frontend.js`, `dist/backend.js`: matching compiled implementation.
- `MOCHI-MSG-01B.md`, `ROADMAP.md`: delivery report and approved progress/order.

## Manual acceptance still needed

After a separately approved disposable-instance update:

1. React to user and character messages in a DM and group; toggle, reopen, switch
   rooms/accounts, hide/restore and reload. Confirm exact targets and persistence.
2. Check quoted/edited/rerolled messages and deleted targets; confirm unrelated
   history and notifications remain unchanged.
3. Try a stale second tab and active generation; expect refresh/wait errors, no
   duplicate toggles or late messages. Confirm pending scheduled jobs still deliver.
4. At 320px/390px and desktop width, check wrapping, keyboard focus, screen-reader
   names, actions, composer focus and earlier-message scroll anchoring.
5. Confirm native Pocket remains separate and no unsolicited AI reactions occur.

Real provider and actual-host behavior, pixel layout and assistive-technology checks
remain unverified. Existing host silent-identity-change/external-hide limitations
remain as previously reported. MSG-01C has not begun.
