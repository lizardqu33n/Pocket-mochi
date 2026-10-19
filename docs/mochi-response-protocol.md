# Mochi hybrid responses (QOL-05)

The response parser receives the resolved eligible character IDs, required speaker
and Natural flag from generation. Provider text and presets cannot grant identity,
permissions or action capabilities. Persistence, ownership, quota, cancellation,
revision and scheduling checks remain in the existing service.

## Plain dialogue

Plain text is valid when the required speaker is eligible, or `auto` resolves to
exactly one eligible character. This includes single-speaker Natural DMs and
explicit Manual/Instant group responders. Multi-speaker `auto` requires JSON.
Plain text keeps its exact whitespace, punctuation, emoji and line breaks, must
contain non-whitespace text, and is limited to 32,000 JavaScript string units.
Confirmed provider `finish_reason: length` rejects plain output because completion
cannot be established. Existing complete valid JSON can still be accepted with
that metadata. There is no repair, retry or model-based speaker inference.

## Detection and unavoidable ambiguity

1. Reject missing/empty/non-string provider content with fixed diagnostics.
2. Recognize a complete single unlabelled or JSON code fence for legacy JSON.
3. Try JSON decoding. Objects/arrays always enter structured validation.
4. On decoding failure, leading object/array delimiters, JSON fences, unlabelled
   container fences, and an explicit `"protocol"` / `mochi.response` marker commit
   the output to structured validation. Malformed structured output never falls
   back to dialogue. The delimiter guard protects malformed data; it is not the
   sole format detector.
5. Otherwise accept the original text only with a securely fixed speaker. JSON
   scalars (including quoted dialogue, `true`, `null` and numbers) remain literal
   text with a fixed speaker; they have no action semantics. Without one, decoded
   scalars are invalid schema and other text has an ambiguous-response diagnostic.

JSON-looking dialogue starting with `{` or `[` must use a legacy message JSON
wrapper with the desired literal string in `text`. Prose containing JSON snippets
is ordinary dialogue and never executes anything. This reserved container boundary
is deliberately conservative; a missing opening delimiter in an unmarked fragment
can be indistinguishable from prose. Explicit protocol markers and JSON fences
remain reserved even if malformed. No format choice can bypass speaker validation.

## Existing structured messages

`{"speakerId":"eligible-id","text":"Hello"}` remains supported, with existing
gated `behavior` hints unchanged. Natural also accepts
`{"messages":[{"speakerId":"eligible-id","text":"Hello"}]}` and intentional
silence `{"messages":[]}`. Normal requests permit one message; Natural permits
zero to three with no duplicate speaker. Text, eligibility and required-speaker
checks validate the entire batch before any reply is returned for persistence.
Legacy unrelated extra fields remain inert for compatibility; explicit `action`
or `actions` fields cannot be smuggled into legacy message objects.

## Versioned extension point

Supported message-only envelope:

```json
{
  "protocol": "mochi.response",
  "version": 1,
  "messages": [{"speakerId": "eligible-id", "text": "Hello"}],
  "actions": []
}
```

`protocol`, integer `version: 1` and `messages` are required. `actions` is optional
and must be an empty array. Unknown envelope fields/versions/protocols reject;
nonempty or malformed actions reject the entire response with a fixed diagnostic.
Normal and Natural count/silence rules apply equally to envelopes. No envelope action
registry or migration exists. A future milestone can replace this
explicit rejection point only after specifying permissions, target ownership,
validation, transaction/rollback semantics and replay protection. Merely producing
JSON never authorizes an action.

Envelope reactions, status/time updates, scheduling, multiple same-speaker bubbles
and deletion are **inactive**. The separately opted-in compact routine extension
below does not activate envelope actions. Existing previously authorized behavior hints and
scheduling remain governed by their original feature gates; this protocol adds
no capabilities to them.

Future soft deletion is design-only: display `This message was deleted.`, retain
the original text for restoration, and use `(deleted message) original text` in
AI context. Eligibility, storage and restoration will require a separate milestone.
QOL-05 changes neither message storage nor deletion behavior.

## Prompts and preview

Legacy, manual and block preset assemblies all receive the same mode-aware runtime
response contract. Saved preset revisions and bindings are unchanged. Prompt
Preview uses the same assembly without a provider call. Old JSON-specific custom
instructions remain compatible because JSON stays accepted. Increased format
guidance participates in normal token budgeting and may trim more old context;
stored history is preserved. A conflicting custom block cannot disable parser or
service validation. Original context goldens remain available; hybrid goldens
record the intentional format-guidance and token-count changes.

## AIGEN-01 compact routine extension

An enabled non-manual character routine can accept
`{"m":"off early, driving home","s":{"a":"Driving home early","p":"away","for":45}}`.
The server fixes the speaker from authorized context; ambiguous groups require
`speakerId`. Optional `e:{"i":"stable_entry_id","d":["mo"],"t":"0900-1600","a":"Work","p":"away"}`
proposes a single permanent entry edit. Only `m` selects the compact extension;
unrelated extra fields on legacy `text` messages stay inert. Compact fields are
strict, cannot combine legacy behavior metadata, and cannot grant permissions.
Malformed actions reject the whole compact reply before persistence. Nonempty
envelope `actions` remain unsupported.

Status actions expire after 1–240 whole minutes. Source-plan, ownership, revision,
locks, quiet hours and DND/offline restrictions are enforced server side. Actions
commit with accepted immediate/deferred replies and their replay protection.
Manual mode grants no actions; temporary mode permits only bounded activity;
review mode additionally retains proposed stable-ID edits for approval. Explicit
autonomous mode is bounded and undoable. See [AIGEN-01](MOCHI-AIGEN-01.md) for
full limits, source consent, editable preview/apply workflow and acceptance checks.
