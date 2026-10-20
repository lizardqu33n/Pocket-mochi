# B4 proposal — requires a later owner decision

No B4 code, identity change, coexistence installation, transfer or activation of copied jobs is included in CORE-01B.

## Decisions before implementation

1. Approve a distinct extension identifier (`mochi` is only a candidate), check collisions, and confirm intended host version/capabilities. Identical `lumiphone` identifiers cannot coexist.
2. Choose an explicit same-owner export/import flow or separately approved operator-assisted offline copy. Confirm the applicable Pocket permission/license basis before any redistribution.
3. Preserve Pocket-source profile banks and dormant phone associations, or separately specify a reviewed relink/snapshot operation. Never silently rewrite `source:pocket`. RP linking and optional Pocket integration remain separate.

## Proposed implementation

Keep internal `mochi/v1` paths, schemas and account/room/message/revision/summary/preset/receipt IDs. Use host storage isolation rather than cross-extension writable access. A new identifier starts empty unless the owner explicitly imports a validated same-owner export.

Define a bounded versioned manifest of selected Mochi files, counts, hashes and reference dependencies. Exclude credentials and unrelated RP/phone records; preserve unknown/orphaned originals for review. Source export must remain byte-identical. Freeze writes and scheduler dispatch during transfer; abort if a source hash/revision changes.

Stage into a separate destination. Reject wrong real owner, malformed/future schemas, traversal, duplicate/conflicting destination IDs, missing required references and partial exports. Validate ownership/account bindings, message ordering, all revision histories, summary coverage/current pointers, reactions/pins/quotes, budgets, deferred jobs and receipts. Report unavailable native assets without discarding their identifiers.

Show exact inventory/count/hash differences before explicit commit. Use a recoverable multi-file journal and idempotent crash/retry behavior; `.pending` files alone do not provide a cross-file transaction. Preserve and disable the original source rather than uninstalling it. Target scheduler dispatch stays paused until validation and fresh explicit owner activation. Never run two dispatchers against copied active occurrences.

Rollback must restore matching code and preserved data while keeping later target writes separately; never overwrite new messages silently. A non-empty conflicting destination must not be overwritten automatically.

## Required synthetic acceptance

Two real users with overlapping room IDs; multiple fictional and archived accounts; legacy unassigned rooms; native/manual/Pocket sources; presets/revisions and AIGEN overrides; accepted/rejected summaries and coverage; shared/account presentation; damaged/future schemas; missing assets/references; queued/generated/deferred/expired jobs; consent/quota history; clock rollback; source change mid-copy; destination conflicts; crash at each journal/staging step; repeat retry; rollback before/after new messages.

Require identical preserved source bytes/IDs/content/counts, no cross-owner visibility, no silent omissions and zero generation from import or preview. Verify simultaneous distinct installations with separate actions, roots, permissions and storage only after separate host-testing approval. The optional adapter should later use versioned, consented capabilities and must not create a second session/view or share writable room storage.
