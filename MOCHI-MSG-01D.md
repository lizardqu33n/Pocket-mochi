# MOCHI-MSG-01D — Current-room Conversation Search

Isolated branch: `codex/mochi-desktop-01b-base-review`.
Starting clean HEAD: `d536c31c2db1447d27a4ad1f0b269e912134b380`.
Local checkpoint commit: the commit adding this report
(`git log -1 -- MOCHI-MSG-01D.md`). No push, install, deployment or host launch.

## Source inspection and architecture

`MochiService.state` already sends complete saved histories in authorized room
snapshots. `MochiView.thread` renders the newest 100 desktop messages initially;
Show earlier messages expands that rendered suffix by 100. The handset compatibility
route renders its loaded history. This is rendering pagination, not partial storage.
`quoteNode`/`consumeQuoteJump` and the workspace scroll controller already expand
the suffix and focus an exact stable message ID; pins reuse this navigation.

Search uses a narrow read-only service path rather than treating the visible window
or a possibly stale frontend snapshot as authoritative. `mochi:search` reads only
the requested real-user/fictional-account/room, scans the complete saved snapshot,
then rechecks ownership, content revision and association revision before publishing.
It does not call the broad inbox/source-list endpoints or read unrelated histories.
Pages contain 30 bounded excerpts and an exact total, not copied full histories.
Pagination uses offset plus the originating revision and rejects changed histories.

Selecting a result uses `mochi:search_target`: fresh ownership, association revision,
content revision and unique message validation are required. It returns the latest
matching room snapshot for that target room only, with runtime claims/drafts stripped
using the established public-room representation. The frontend applies it only in
the matching current scope and reuses quote/pin navigation. Search responses use
the existing single Mochi session/backend listener; no new subscription exists.

## UI and matching rules

Room options include **Search conversation**. An inline panel appears above history;
the composer remains present and usable. Search opens with input focus. Closing
returns focus to Room options, preserves conversation selection, composer draft,
reply target and existing workspace scroll restoration. The same room's query/results
remain available on reopening Search unless a relevant revision changed.

The panel supports explicit Search/Enter submission, Clear search, Close search,
sender filter, readable result count/status, previous/next result pages and original
sender/date/one-based saved-message position. Loading, empty query, no matches,
backend error and 20-second timeout states are visible. No per-keystroke network
requests or debounce loop: changing text clears stale displayed results and waits
for submission. Changing the sender filter explicitly searches again.

- Case-insensitive literal substring matching via Unicode `toLowerCase()`;
  leading/trailing query whitespace is trimmed, internal whitespace is unchanged.
- Maximum raw query length: 200 UTF-16 code units. No regular expressions, fuzzy
  matching, embeddings, macros or AI calls. No accent folding/locale-specific search.
  Emoji sequences match literally; no grapheme-normalization guarantee is added.
- Ordinary user/assistant `content` only. System notes, prompts, reactions, quote
  previews, prior edited versions and metadata are not separately indexed.
- Sender filter: all, user-authored messages (`user`), or an exact historical
  character ID (`character:<id>`). Renaming does not change matching. The user
  filter groups historical user messages, not distinct historical persona names.
  Legacy character messages without a stable character ID remain in All senders.
- Newest saved array position first. At most 30 results/page; exact count scans the
  full room. Excerpts are bounded around the match to 240 characters plus ellipses;
  sender display is bounded to 120 characters. Original message text is untouched.
- Missing/malformed display records and ambiguous duplicate IDs are omitted safely.
  Results use native text nodes, never message/query HTML.

Styles are confined to `.mochi-view`; the inline panel is scrollable and capped at
40% of available height, with wrapping controls/excerpts, bounded sender display,
accessible field/button labels, polite status announcements and visible focus.
No native Pocket layout, theme, settings or sidebar navigation was redesigned.

## Consistency, cancellation and privacy

Search requests do not use the generation/mutation busy flag, cancel replies,
acknowledge notifications, reserve quota, create receipts or persist anything.
Real-user authentication comes from the backend callback, not client identity fields.
Room/account validation uses the existing server `read` boundary. Snapshot reads
take the existing room lock briefly; scanning yields every 512 records without holding
that lock. A concurrent edit produces an explicit repeat-search error, not mixed data.

The single view owns one pending search ticket/timer. New searches supersede old
client tickets. Query edits, Close, room/account navigation and destruction clear
the pending ticket; late results cannot restore another room/account or reopen the
panel. Read-only server work may finish after client cancellation, but cannot change
storage or invoke a provider; its response is ignored. No cancellation request is
sent to the generation controller. Real-user logout follows existing session teardown
and clears private search state; known host silent-identity-change limitations remain.

Received room revision changes invalidate result pages and retain the query with a
Search again message. Editing, deletion, rerolls and new arrivals therefore do not
reuse known-stale results. Updates in another browser become visible on a fresh
search/room refresh; this is not a cross-browser live index. Clicking any result
always revalidates its original ID/revision, so deleted or inaccessible targets yield
an error without showing stale content in a refreshed conversation. Search can find
a newer server snapshot than the frontend initially held; its revision is tracked
separately until the authorized target-room refresh. Search queries/results never
enter generation prompts or stored room data.

## Performance limits

Each explicit search/page does a linear complete-room scan and counts unique IDs;
it yields cooperatively and renders only 30 results. Sender choices are cached for
the current room/association/revision, avoiding repeated history scans on unrelated
redraws. There is no global index, polling, observer, provider call or persistent
search cache. JSON room loading still reads the whole room, as existing storage does.
Rapid repeated explicit searches can leave already dispatched read-only server
scans finishing; no server cancellation/index framework was added.

A very old jump expands the existing rendered suffix from the target to the latest
message. It can therefore create many DOM nodes in a very large conversation.
This pre-existing navigation limitation is retained explicitly, not hidden behind
a new virtualization framework. Tests cover older targets and synthetic 650/1200
record searches, not a benchmark of production-sized histories.

## Verification and artifacts

Sequential, exact-path targeted checks:

- Search-only: **11 passed, 0 failed, 99 assertions**.
- Search/pins/reactions/quotes/automatic replies/scheduling/desktop layout/shared
  session regressions: **121 passed, 0 failed, 918 assertions**, eight selected test
  files including imported account regressions.
- One TypeScript typecheck: passed.
- One backend-then-frontend production build: passed.
- Generated bundle inspection confirms `searchRoom`, scoped search/target handlers,
  the search panel and existing Mochi implementation in the matching artifact pair.

Synthetic tests cover complete older history, pagination/counts, legacy and fictional
rooms, ownership rejection, literal/emoji/Unicode matching, sender IDs, malformed and
ambiguous records, changed/deleted targets, concurrent edits, late/canceled responses,
new revisions and latest-server target refresh. DOM fixtures at 320px/390px/900px
cover keyboard form submission, long names, safe text rendering, result controls,
older-message focus, composer/reply preservation and close focus. Existing quoted
replies, manual reactions, pins/notes, modes, scheduled occurrences, account isolation,
notification ownership and native Pocket separation regressions pass.

These are simulated storage/provider and DOM fixtures, not live Lumiverse/provider,
pixel rendering or screen-reader verification. No Chromium, full suite, host process
or installed extension was run or changed.

| Bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `9F1DD199B5EA47526BCB270A5A598B82093F3157E5C752FBB9CA2690778A9BAA` |
| `dist/backend.js` | `44E10CB91259329EB87BE4CDAEB894159E4D3C1CD5990D90C1028CEA2585F1C3` |

MSG-01C bundles are preserved byte-for-byte in ignored
`tmp/msg-01c-verified-bundles/`; earlier backups remain untouched. Both new bundles
must be installed together after separate approval. No schema migration or persistent
search records exist. Rollback restores the prior matching bundles/commit without
deleting room/account storage. Installed Kitty, disposable synthetic data, original
mochi/settings WIP, Pocket Power and Ubuntu remain untouched.

## Changed files

- `src/mochi/search.ts`: bounded plain-text full-history search and stable senders.
- `src/mochi/search-panel.ts`: request/scope lifecycle, inline panel and scoped CSS.
- `src/mochi/service.ts`: authenticated read-only search/target handlers.
- `src/mochi/view.ts`: existing-listener routing, menu entry and history navigation.
- `tests/mochi-search.test.ts`: targeted synthetic/DOM regressions.
- `dist/frontend.js`, `dist/backend.js`: matching runtime artifacts.
- `MOCHI-MSG-01D.md`, `ROADMAP.md`: checkpoint report and approved progress/order.

## Manual acceptance after a separately approved disposable update

1. Search older-than-100 messages in a DM and group, page results, filter by sender,
   and jump repeatedly. Confirm exact originals and unchanged composer/reply draft.
2. Try mixed case, emoji, punctuation, empty/no-match queries, long names and text.
   Confirm Search/Enter, Clear, Close, result count, keyboard focus and no HTML rendering.
3. Edit/delete a matching message, receive a new reply, and repeat Search. Try a
   stale result from a second tab; expect repeat-search feedback, not a wrong jump.
4. Search while a reply is pending; close/switch account or room/logout before it
   returns. Confirm no stale result, canceled generation or extra notification read.
5. Check 320px/390px/desktop widths, browser zoom, scroll/composer availability and
   earlier-history anchoring. Confirm Pins & Notes and native Pocket still work.

Live focus/pixel layout, very-large-history rendering and real-provider behavior
remain pending. MSG-01E and all deferred systems have not begun. Stop for review.
