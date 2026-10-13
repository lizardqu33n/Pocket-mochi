# MOCHI-MEM-01E — Conversation Summaries, Coverage and Versions

Starting clean HEAD: `d83ea0cb976b7224cd638f24d285b206633e23d3`.
Branch: `codex/mochi-desktop-01b-base-review`.
Checkpoint: the local commit adding this report (`git log -1 -- MOCHI-MEM-01E.md`).
MEM-01B/C/D reports and the actual storage, context, preset, message, frontend and
scheduling paths were inspected. MEM-01A findings are referenced by those reports;
no separate tracked MEM-01A report was present in this checkout. B/C remain
provisionally accepted; D has initial manual testing, with comprehensive acceptance
pending. This checkpoint does not imply live multi-user or beta acceptance.

## Representation and exact coverage

Rooms gain optional `memory` metadata without migrating existing rooms:
`{version:1,ownerId,roomId,currentId,versions}`. Each immutable version stores
`{id,text,enabled,excludeCovered,coverage?,savedAt,restoredFrom?}`. IDs are generated
server-side (`summary_` plus 32 hex characters). Limits: 12,000 characters per text,
100 retained versions, and the existing 10,000-receipt safety bound. No versions
are silently evicted. Every mutation, including restore/disable/clear, needs a
remaining version slot; reaching the limit returns an explicit preservation error.
Version export/compaction and a separate override at capacity are not implemented.

Coverage is `{boundaryId,count,digest}`. The backend resolves a unique saved stable
ID against the authenticated room's order, rejecting missing, foreign, malformed
and duplicate/ambiguous message IDs. SHA-256 covers the room ID and the exact
ordered prefix's message ID, role, character ID, stored name, content, creation
time, request ID, edit time, previous versions and reply reference. Array offsets
are neither accepted nor persisted as authorization or coverage identifiers.
The editor's human-readable message number resolves to a stable ID before sending;
the server determines the position and proof again. Coverage never grows on append.

Covered edits, deletion, reorder, attribution changes and rerolls invalidate the
proof, including rerolls whose replacement text is identical. Reactions and pins
are independent metadata and do not invalidate it. Current validation is computed
on read/resolve; it never rewrites a saved digest to make obsolete memory valid.
New explicit reviewed saves calculate a new proof and append a version.

## Storage, ownership and transactions

`MochiService.saveMemory` uses the existing real-user/account guard and room lock,
exact fictional-account ownership, room and association revision checks, receipts
and `.pending` then atomic replacement. It re-reads ownership/revisions after
asynchronous hashing. Replayed receipts do not append duplicate versions. Failed
replacement leaves the original room and receipts intact; retry can commit once.
Malformed saved memory fails closed with the room file preserved, rather than
clearing history. Such corrupted records require explicit maintenance/recovery.

Memory lives inside the room's authenticated user storage and includes validated
real-user and room ownership. Fictional-account authorization comes from the room;
no second cross-account memory bank is introduced. Explicit existing room assignment
carries memory with the room/history under the new authorized association. No
phone, RP, native memory, provider-credential or other account storage changes occur.

Restore copies an older version, including its original proof, into a new version.
It does not bless an invalid proof or mutate the selected historical version.
Disable appends an inactive copy; clear appends an inactive empty version without
discarding older versions or messages. All are explicitly confirmed.

Saving any memory version is a context change: it advances the room revision,
aborts active interactive generation and cancels nonterminal pending jobs/removes
their undelivered drafts, using the same policy as applying a preset. The UI warns
before confirmation. Terminal schedule records and receipts remain. Opening,
browsing, editing drafts, refreshing and previewing do not cancel or save anything,
reserve quotas or contact a provider.

## Prompt placement and exclusion

Automatic layout inserts one user-role conversation-data message immediately after
the existing first system message and before retained dialogue. It labels and
JSON-quotes the summary as recalled, untrusted information, not instructions.
No-summary and disabled-summary provider messages remain unchanged; all eight
original no-summary golden fixtures and count sequences pass unchanged.

Manual layout activates a standalone `{{mochi_summary}}` row at its selected place,
also with a user role. Duplicates expand only once; source text is never recursively
evaluated. Omitted, inactive and duplicate cases explain themselves in Preview.
Inline summary placeholders retain MEM-01D's empty expansion, with an explanation
that an active summary requires its own row. This preserves old inline preset
meaning and prevents recalled text becoming system instructions. Published preset
records are unchanged; users publish a new revision to change placement. Other
macros, structured history roles and System Notes retain their existing behavior.

Raw-prefix exclusion defaults off. It requires explicit opt-in, enabled summary,
verified proof and actual summary inclusion in the final layout. Only the verified
prefix is removed from the outgoing history copy. A Manual plan omitting the summary
never excludes raw history; a plan omitting history reports that separate manual
omission rather than claiming summary exclusion. Newer dialogue still uses normal
token trimming. Preview separately reports deliberate exclusion, token trimming
and manual omissions, plus whether memory was included and coverage verified.

**Invalidation fallback:** omit outdated summary from outgoing prompts, suspend
prefix exclusion, warn, and use raw history with normal existing token trimming.
Retain all summary text, versions and originals for review. Restoring an invalid
older proof keeps this fallback until an explicit reviewed save.

The existing host counter counts the complete assembled prompt, including the
memory wrapper/quoted text; output reserve and 256-token envelope are unchanged.
The summary is a protected section, never silently trimmed. Oversized protected
context produces the existing budget error without deleting stored history.
No extra provider requests, retries, quotas, jobs or AI summarization were added.

## Messaging and UI compatibility

Both interactive and durable scheduled generation use the same resolver. Quote
targets remain indexed from full saved history before exclusion, so a retained
reply to a summarized original carries its bounded excerpt. Stored reactions,
attribution, pins, Search, jump navigation, message actions, texting styles, persona
snapshots, notes, presets, availability, response modes and cancellation remain.
Memory is never a chat bubble, notification, reaction or scheduled message.

Room options now includes Conversation Memory. A bounded, theme-aware panel shows
saved text/time/range, an explicit draft editor, enable/exclusion controls, a
boundary selector, confirmation/discard actions and historical versions with
restore-as-new-version. There is no messenger/settings/theme redesign.

The existing single view/listener owns responses. Separate scoped request tickets
reject late, wrong-room/account/association or stale responses. Drafts are keyed
by fictional account, room and association, retained across in-session navigation
and panel close, and cleared on owned session destruction/logout. Refresh does
not overwrite unsaved text. Changed revisions require explicit review before save.
Focus/caret survives asynchronous read refresh; confirmation receives keyboard
focus, and closing returns focus to Room options. CSS wraps text and controls,
uses bounded scrolling and preserves the composer outside the panel.

## Verification

Final sequential selection: **212 passed, 0 failed, 1,582 assertions, 13 files**:
memory, macros, context, presets, texting, search, pins, reactions, replies,
automatic replies, scheduling lifecycle, desktop layout and shared session.
The memory-specific file has **27 tests / 234 assertions**. Coverage includes
legacy/fictional scope, concurrency/stale writes, foreign boundaries, atomic-write
interruption, receipt replay, version bounds, restore/clear, exact proof invalidation,
quote/pin/reaction/search preservation, preview/provider/count parity, scheduled
restart and exactly-once delivery, read-only browsing during generation, late-result
cancellation, and DOM/accessibility/draft/caret fixtures at 320/390/900px.

One TypeScript typecheck: passed. One sequential backend-then-frontend production
build: passed. Built routes/editor/proof/resolver markers checked against source.
Matching SHA-256 bundles:

- Frontend: `C75813790FADD90E8D90BFF4F3D7E65ED598F7221640AB89C5CCA574C23F41BB`
- Backend: `0DE21690D75532EBD0EB7345BCA68D3808E78F59E138E0822A1F6D481180467B`

An initial DOM run found a delayed document-wide focus callback after cleanup;
it was replaced with scoped connected-element focus. Expanded test fixtures were
corrected to use the scheduled responder and existing reroll confirmation contract.
The final selection passed after those corrections. No visual baselines were
changed. No full suite, browser/Chromium, host, live provider, installation, push
or deployment ran. Width fixtures do not establish actual pixel layout acceptance.

## Changed files

- `src/mochi/memory.ts`: types, bounds, validation, exact SHA-256 proof, fallback.
- `src/mochi/memory-panel.ts`: editor, versions, scoped drafts/tickets, styling/focus.
- `src/mochi/types.ts`: optional room memory field.
- `src/mochi/service.ts`: scoped read/save/version transactions and validation.
- `src/mochi/context.ts`: shared insertion, proof-gated exclusion, counted metadata.
- `src/mochi/macros.ts`: standalone memory activation and omission explanations.
- `src/mochi/preview-panel.ts`: memory and intentional-exclusion explanations.
- `src/mochi/view.ts`: Room options entry and existing ownership/lifecycle routing.
- `tests/mochi-memory.test.ts`: new targeted synthetic regressions.
- `tests/mochi-macros.test.ts`: reserved-to-inactive explanation expectation.
- `dist/backend.js`, `dist/frontend.js`: matching generated pair.
- `ROADMAP.md`, this report: verified progress and limitations.

## Rollback and remaining acceptance

The prior MEM-01D bundles were hash-checked and backed up byte-for-byte to ignored
`tmp/mem-01d-verified-bundles/`. Existing 01C and other backups were untouched.
Original `mochi` stays at `9e5267664a99e14ec6bc41db75133bedc830e91e`;
Pocket Power stays at `8b16bdf0f945ac473eb1a25fd7e9f17554b4a248`.
Only this isolated checkout changes. No private accounts/data/screenshots/test
storage or backup directories are included in the checkpoint.

No migration is needed. For code rollback, use the previous source checkpoint and
its matching pair together in a separately approved environment; do not delete
user storage or restore stale room JSON over newer conversations. Old code ignores
optional memory but preserves it in room writes. While downgraded, it cannot apply
summary exclusion; returning to this version revalidates proofs against any edits.
Code rollback does not revive jobs intentionally canceled by a confirmed save.

Disposable Windows acceptance checklist, after separate installation approval:

1. Use synthetic legacy and fictional-account rooms; save a summary through a known
   message, reopen/reload, inspect versions and unchanged original Search/pins.
2. At 320/390/desktop widths check actual wrapping, scrolling, contrast, Tab/focus,
   selection/caret, composer retention and portal/window handoff.
3. Preview Automatic; toggle exclusion explicitly; check prefix removal versus
   token trimming, output reserve and quotes to originals. No provider required.
4. Bind a Manual revision with a standalone summary row; test duplicate/missing
   macros and inactive summary; verify inline placeholders stay inactive.
5. Edit/delete/reroll covered originals; verify warnings, raw-history fallback,
   recoverable text and explicit review/save. Restore an invalid old version.
6. Test confirmed save with pending generation/schedule and cancellation warning;
   verify no late reply, no canceled-job revival, and unaffected other rooms/accounts.
7. Switch accounts/log out during refresh/save; inspect scoped restoration and
   late-response rejection. Any live-provider run needs separate approval.

Known limitations: summaries are manual; prefix-only coverage; no version export
or compaction; proof validation hashes saved history (not incrementally indexed);
drafts remain session-only; malformed storage requires explicit recovery. The
unresolved silent real-user-switch host lifecycle issue remains a multi-user beta
concern and is not fixed or claimed accepted. Browser/real-provider acceptance is
pending. Stop here; MEM-01F has not begun.
