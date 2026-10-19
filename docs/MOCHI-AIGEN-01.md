# AIGEN-01

Consecutive checkpoint after SCHED-01 (`314febb`). Generation uses the existing
owned chat connection, token counter, provider boundary and shared quota. No new
provider permissions, native character writes, RP access or live model calls were
used for implementation or verification.

## Compact schedule and style

```json
{"v":1,"tz":"America/Chicago","b":[{"i":"sleep","d":["mo","tu","we","th","fr"],"t":"2300-0700","a":"Sleeping","p":"offline"}],"x":{"l":"short","c":"lowercase","p":"minimal","e":"occasional","t":"warm"}}
```

`v`, `tz`, `b` are required; `x` is optional. Missing new block IDs become stable
preview IDs `routine_1`, etc. Day codes are mo..su. Times are 24-hour HHMM-HHMM;
end before start means overnight. Gaps remain free time/hobbies. Activity and
presence are separate. The server never adds hourly filler.

Strict validation rejects prose/fences, unknown/privilege fields, bad versions,
IANA zones, times, duplicate days/IDs, equal boundaries, overnight/week-wrap
overlaps, invalid styles and excessive output. Limits: 20,000 output characters,
64 blocks, 160 activity characters, 400 style-tone characters. Model output cannot
choose locks, quiet hours or autonomy. Generated timezone must match the request.

Sources are the selected character's owned description/personality and Mochi About
Me. Only explicit checkbox approval includes the last 20 messages of this exact
Mochi chat, each capped at 2,000 characters. Sources/guidance are bounded and token
counted with the saved output limit and 256-token envelope. Connection, character,
preset, room/association revision and character defaults are revalidated before
exposing/applying a preview. Drafts are scoped to real user, fictional account,
room and character; they expire on backend restart. Attempts are capped at 128 per
real user per runtime, and a used/failed attempt ID cannot trigger another call.

Generate/paste preview never save room data. The preview offers editable blocks,
timezone/autonomy and texting tendencies, compact JSON editing, Reject, Stop,
Regenerate and explicit confirmed Apply. A malformed/truncated output needs a new
explicit attempt; there is no repair/retry loop. Applying preserves locked entries
and stores conversation texting overrides, leaving character defaults untouched.
Undo restores plan and applied style only if that style has not independently
changed. Durable audit history keeps full snapshots; runtime events carry small
summaries. Pending drafts are intentionally transient rather than replayed.

## Accepted reply actions

```json
{"m":"nah, off early, driving home","s":{"a":"Driving home early","p":"away","for":45}}
```

This compact message is accepted only with an enabled non-manual routine. Speaker
identity comes from authorized context; ambiguous groups require `speakerId`.
Natural batches retain existing speaker/count limits. `s` is optional and expires
in 1–240 whole minutes. Optional `e:{"i":"work","d":["mo"],"t":"0900-1600","a":"Short work day","p":"away"}`
proposes replacing one existing stable entry. Characters cannot add/delete entries
or change locks, quiet hours, timezone, autonomy or settings. Only `m` selects the
extension; unrelated extra fields on legacy `text` messages remain inert. Plain
and legacy JSON messages remain supported; nonempty envelope `actions` reject.
Compact messages do not combine legacy `behavior` hints.

Actions validate before reply acceptance and are tied to the source plan. They
commit atomically with accepted immediate/deferred replies, including delivery
retry/restart recovery. Canceled, stale or uncommitted replies cannot apply actions.
Existing receipts and durable tombstones prevent replay. Manual locks, locked
current entries, quiet hours, current DND/offline and stale plans suppress actions.
Opted-in routines ignore legacy unbounded status hints; other rooms retain them.

Manual mode grants no actions. Temporary mode grants only expiring activity.
Review mode retains permanent edits for owner approval/rejection. Explicitly
selected autonomous mode allows only validated edits to existing unlocked entries,
with at most four character audit changes in a rolling 24 hours before permanent
edits fall back to review. Temporary activity changes also consume that conservative
edit allowance. Limits: eight proposals, one per entry; 32 audit changes with
latest-change undo. Quiet hours and manual restrictions remain authoritative.

## Verification and remaining acceptance

Checks ran sequentially in small commands after the owner reported lag. Passing:
routines 25; AIGEN checks 34 plus the separately added production-view integration
check; scheduler 40; lifecycle 44; automatic replies 36; legacy responses 6;
presets 14. Imported account fixtures repeat, so counts are not unique totals.
Type checking and both bundles are checked before publication. New checks cover
schema, DST/overnight mapping, consent, ownership, source revocation, cancellation,
readonly preview, explicit apply/undo, pending approvals, bounded autonomy, atomic
failure/restart recovery and generation/preview parity. The production view's
Generate -> preview -> edit -> Apply path is exercised. DOM labels/focus run at
320/390/900px; this does not establish physical browser layout quality.

Five pre-existing assertions were independently reproduced on untouched baseline
`9f926bb892de7beef467f0e8227df9a8c79bc7c8`:

- Context: three prompt-preview composer assertions at 320/390/900px; the other
  17 checks, including existing prompt goldens, pass.
- Memory: one summary-editor CSS-string assertion at line 222; the other 37 pass.
- Texting: one restored composer inline-height assertion at line 108; the other
  12 pass.

The assertions and existing CSS were preserved. The interrupted aggregate
baseline is not claimed as complete. No physical mobile/browser, installed-host
acceptance or live model quality check was performed. Quiet hours currently use a
labeled JSON editor. Drafts require explicit regeneration after restart. Undo is
latest-only with bounded history. Host clock rollback remains an absolute-time
limitation. RP linking, native lorebooks and contextual emoji reactions are deferred.

Owner acceptance:

1. Request a sparse schedule/style in an isolated fictional chat, history unchecked.
   Verify the requested timezone and source consent.
2. Edit blocks/styles; confirm no changes before Apply. Reject, Regenerate, Apply
   and Undo; reopen and switch accounts to verify ownership.
3. Opt into temporary mode; check natural-chat activity separately from presence,
   expiry after reopening, locks, DND and quiet hours.
4. Review/approve/reject a stable-ID edit. Choose autonomous mode only if desired;
   verify history, Undo and the bounded fallback to review.
5. Check physical mobile wrapping, keyboard navigation and CSS selectors before
   installing this test build. The first real generation remains an owner action.

New hooks: `.mochi-routine-generation`, `.mochi-routine-draft-preview`,
`.mochi-routine-proposal` plus SCHED-01 selectors. Controls use semantic elements
and existing button/icon slots; no stylesheets or host installation were changed.
