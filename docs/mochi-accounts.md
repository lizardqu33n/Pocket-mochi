# Mochi fictional accounts

Open **Pocket → Mochi** in Lumiverse's outer extension sidebar. Account management
stays there, on desktop and narrow screens. Selecting an account keeps the account
list open; **Open Mochi** opens its conversations separately.

- Search by name or username. Sort by name, creation, update time or chat count.
  Switch between list/grid and ascending/descending order.
- Multiple selection provides a read-only total of preserved chats. It does not
  delete, move or merge them.
- The archive filter opens existing account recovery. Archived conversations and
  schedules are preserved; the restoration confirmation explains that schedules
  may resume. Legacy recovery appears only when unassigned records exist.
- **New account** creates an independent identity, or use the searchable persona
  picker to import a Lumiverse/Pocket identity. Save captures an independent
  snapshot. The AI description is not a public About Me.
- The bottom dock shows the selected account. Its cog opens **Edit Account** in
  this same sidebar. Back/Cancel check unsaved changes; saving returns to Accounts.

## Linking and manual sync

When importing a Lumiverse persona, optionally check **Link Lumiverse persona**.
An existing imported Lumiverse account can also be linked. Save first, then choose
**Sync from Lumiverse**. Linking alone never updates the identity automatically.

The full-sidebar review shows current and incoming display name, portrait,
description and individual compatible add-ons. Approve only the changes you want.
Missing/unavailable values are identified; applying an empty incoming portrait or
description explicitly clears that selected field. No changes are preselected.
Apply rechecks both the account revision and the reviewed source fingerprint.
If either changed, refresh Accounts and review again.

Newly linked accounts preserve add-on content as well as enabled selections.
Content changes require individual sync approval. Existing legacy unlinked
accounts retain their previous add-on behavior until explicitly linked; there is
no migration. Unlinking preserves the imported identity and saved content.

Username, public About Me, historical authorship and existing conversation persona
snapshots are never sync targets. Saved AI description changes apply to new chats;
approved add-on changes can affect future replies in matching-persona chats.
Lumiverse's source personas are never edited.

## Fictional logout

The dock's logout icon deselects the fictional account and returns to Accounts.
It never signs out of Lumiverse or deletes account/chat data. Generation and
unsaved-edit warnings apply. Last-used reentry is suppressed until explicit
selection, including a tab refresh when session storage is available. The marker
is scoped to the authenticated owner and browser tab; when browser storage is
unavailable, protection lasts for the current frontend instance.

## Verification boundary

Development checks use in-memory data and synthetic browser viewports, without
live providers or host installation. Physical Android behavior and real-user
authentication switching still require separate owner acceptance; synthetic
fictional-account switching does not establish that privacy gate.
