# SCHED-01

Optional v1 weekly routines extend existing durable message jobs. No migration or
timer-generated activity records are needed. Existing rooms and presence behavior
remain unchanged until a routine is enabled. A new routine suggests temporary
override autonomy; saving/enabling is explicit. Character defaults are scoped to
the authenticated real user and shared across that user's fictional accounts.
An explicit chat plan (including a disabled plan) replaces character defaults.
Live overrides and audit history belong to the owning conversation.

Resolution: enabled routine quiet hours block delivery; explicit manual presence
then wins over routine presence; an unexpired permitted live override supplies
actual activity; otherwise use the usual weekly entry, or the free-time/hobbies
fallback. Activity is separate from online/away/dnd/offline. Quiet hours do not
invent events. Legacy Away/DND delays remain intact. Character changes cannot
unlock entries, remove quiet hours or bypass manual locks. SCHED-01 provides the
autonomy settings; AIGEN-01 supplies the separately gated character action path.

Intervals are half-open local wall-time minute ranges in an IANA timezone. An end
before start wraps overnight, including Sunday to Monday. Equal endpoints reject;
split a full day into two intervals. Overlapping routine entries reject rather
than silently selecting a winner; quiet periods may overlap and take precedence.
At spring DST gaps nonexistent wall times have no duration; repeated fall times
resolve to the same routine twice, without creating jobs or duplicate messages.
Overrides use absolute instants and expire after 1–240 minutes even across DST.
Expired overrides do not resume after clock progress/restart; a backward host
clock can extend their apparent lifetime, as with existing durable job clocks.

Room changes use the existing serialized atomic pending-file replacement. Routine
mutations require current room revision, correct fictional ownership and a request
receipt; changes invalidate pending replies. User edits retain the last 32 before/
after snapshots. Undo applies only to the latest change and does not revive an
expired override. Removing a character removes its chat routine state. Character
default edits use their existing revision guard and require replies to finish.

Controls reuse existing semantic fields, icon slots and CSS. New selectors:
`.mochi-routine-panel`, `.mochi-routine-editor`, `.mochi-routine-entry`,
`.mochi-routine-history`, `[data-mochi-routine]`, `[data-entry-id]`,
`[data-routine-activity]`. No stylesheet is modified. Quiet periods currently have
a labeled JSON editor; weekly activities have individual labeled controls.

Focused synthetic validation: new routine tests (25 passes including imported
account fixtures), existing scheduler tests (40), lifecycle tests (44), TypeScript
and both bundles pass. The initial multi-file baseline was interrupted after the
owner reported lag; no assertion failures were observed in its returned output,
but it is not counted as a completed baseline. Browser/mobile visual and physical
keyboard acceptance remain owner checks; DOM labels and controls were exercised.

Owner acceptance: enable one fictional character routine; edit a weekday and an
overnight block; verify activity separately from presence; check fallback and
quiet hours; set a short override, reopen and wait for expiry; undo the latest
edit; switch fictional accounts; verify manual locks and keyboard access on mobile.
No provider calls, host reload, deployment, beta changes or private RP access were
performed. AIGEN-01 is the next separate checkpoint.
