# QOL-06 settings and navigation

Chat and Personal share one settings workspace. Chat keeps four explicit categories: General, Texting Behavior, Availability & Schedules, and Advanced. Category and character navigation retain in-session edits. Save settings applies the existing conversation update; presence, delays and schedule controls remain immediate. Next responder is session-local and immediate. Opening settings and saving presentation do not cancel an active reply. Leaving for profile management/picking confirms consequential navigation.

Character overview rows retain character IDs and provide focused Texting & nickname and Availability views. Duplicate names receive ordinal accessible labels. Back restores the invoking row and overview scroll. Presets remain in the existing dedicated workspace, retaining Publish versus Apply separation. Settings tool exits return to their original category.

Personal links the existing fictional-profile/persona editor and native profile picker. The profile dock shows the owned active identity; its selector uses the existing account-switch lifecycle. Toolbar visibility, ordering, icons/labels, and comfortable/compact dock presentation require Save presentation. Reset stages defaults. Hidden actions remain in Room options; essential navigation and message composition remain accessible. Labels collapse to icons in narrow host panes.

Presentation uses authenticated host userStorage at `mochi/v1/ui-preferences/<fictional-account-id>.json`; legacy presentation uses `legacy.json` within that same real-user storage. Optional records are versioned and revision checked under the account guard. Ownership, complete action permutations and values are validated. Damaged records are preserved. Storage failures return a fixed safe error. There is no browser-global preference store or database migration. Profile changes clear preference tickets/drafts; stale or foreign responses cannot apply.

Settings inherit Lumiverse colors, with existing lilac focus/selection accents. They replace the conversation/composer while open and keep explicit actions outside one scrolling body. Drafts survive navigation only within the current frontend session; restart persistence is claimed only for saved presentation/settings.

Development verification uses disposable synthetic data and provider fixtures. Physical Android and genuine authenticated-user A-to-B switching remain separate owner/HQ release gates. Passing builds, synthetic identities and browser checks do not constitute owner acceptance or beta promotion.
