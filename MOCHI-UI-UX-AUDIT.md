# Mochi UI/UX Audit & Modernization Proposal

MEM-01G, 2026-10-13. **Read-only source/structure audit**, not a verified pixel review, usability study or actual multi-user acceptance. Inspected the MEM-01F frontend, styles and local Lumiverse patterns; no browser, screenshots, server or private content was used. The user's E/F superficial testing permits this assessment, not assumptions of comprehensive acceptance.

Priority: A = beta-critical safety/usability, B = safe isolated pre-beta clarity work, C = later cohesive **UI Modernization & Settings Reorganization**. No frontend redesign or wording changes were implemented here. Backend invariants and the approved chat screen remain intact. Authentication and capacity blockers are documented in [MOCHI-MEM-01G.md](MOCHI-MEM-01G.md).

## Current-interface inventory

| Surface | Actual implementation inspected | Current interaction / structural observation |
|---|---|---|
| Desktop and narrow messenger | `src/mochi/view.ts:renderDesktop/thread/composer`, `desktop-styles.ts`, `window.ts` | Left conversations/right chat; container-dependent single-column flow; floating window initial 840×720, minimum 320×420. Message history initially renders 100 items, extends in batches; this is not full virtualization. |
| Sidebar and floating entry | `sidebar.ts`, `sidebar-styles.ts`, `sidebar-icon.ts`, `launcher.ts`, `workspace.ts`, `frontend/controller.ts` | Dedicated account picker, floating shortcut, window and Pocket portal compatibility routes use the shared session. Selection can depend on viewport/coarse pointer while the interior responds to container width. |
| Profiles, selection and room lists | `account-picker.ts`, `profile-screen.ts`, `phone-selection.ts`, `view.ts` | Fictional profiles have persona/avatar/username and startup choices. Legacy chats remain a separate route. Room list shows active/unread state and previews; create/configure is a separate form. |
| Composer/messages | `view.ts`, `styles.ts`, `reply-styles.ts`, `reaction-styles.ts`, `texting-controls.ts` | Circular portraits, names outside content-sized bubbles, display-only truncation, You label, quote/reactions, Enter/Shift+Enter/empty continuation and Stop. Preserve these approved patterns. |
| Message actions and notifications | `view.ts:messageMenu/notificationsPanel`, `notifications.ts`, `frontend/components/ui.ts` | Action dialogs and destructive confirmations; unread/read history, dismiss/clear-read/clear-all, scoped navigation. Hidden preview body does not imply all identity/room labels disappear. |
| Room settings | `view.ts:form/scheduleList` | Connection/model, instructions/budgets, mode/auto reply, names/texting, autonomy/statuses/schedules in a long form. Some actions dispatch immediately; others edit the draft until Save. UX-02 recovery WIP is not the integrated frontend. |
| Presets/macros | `preset-panel.ts`, `placement-controls.ts`, `presets.ts`, `macros.ts` | Reusable library, immutable published versions, explicit room binding, editable draft, restore default; placement ordering and advanced template expressions. Multiple similarly styled actions. |
| Prompt Preview | `preview-panel.ts`, `context.ts` | Read-only resolved context/section and token diagnostics; not a conversation message or provider request. Raw prompt data is advanced. |
| Memory/AI summaries | `memory-panel.ts`, `summarization.ts`, `memory.ts` | Saved summary, editable memory draft, AI suggestion preview/edit, coverage selections, Use/Apply/confirmation, version history and conflict handling. Several stages are simultaneously visible. |
| Search/Pins/Notes | `search-panel.ts`, `pins-panel.ts`, `search.ts` | Search current room and jump to saved messages; bookmarks separate from enabled System Notes that contribute instructions. Tool panels can consume space above the thread. |
| Dialogs/errors/loading | `frontend/components/ui.ts`, panel/view handlers and scoped styles | Real labeled buttons, confirmations, focus styles, request tickets and disabled/loading states; room/library conflicts have explicit refresh/review flows. Host focus/overlay/keyboard acceptance still needs testing. |

## Ten highest-impact findings

| # / priority | Concrete evidence | Recommended correction and boundary |
|---|---|---|
| 1 / A | `session.ts` trusted real-user callback is unused; production room DTOs have no top-level owner used by its fallback. A fictional-profile switch is not a real-user logout. | Resolve trusted host identity teardown first. Make real-login scope explicit in permissions UI. No label or accordion can solve the lifecycle blocker. |
| 2 / A, wording B | `window.ts` hide affordance says Hide; `session.ts:hide` calls `view.leave`, stopping interactive/summary work. `view.ts:confirmNavigation` focuses on room/profile dirty forms, not an explanation of generation cancellation. | Explain “Leave and stop this reply/summary” when relevant, distinguish retained in-session draft from discarded staged settings, and state scheduled jobs continue. Avoid claiming everything survives restart. Verify close, navigation and portal handoff independently. |
| 3 / A, wording B | In `view.ts:form`, “These controls apply immediately” sits above `aiBehavior`, which merely mutates `settings.aiBehavior` until Save. `background_account` immediately changes real-user-wide permission inside room settings; “my account” can mean fictional profile to beginners. | Label sections/actions “Requires Save” or “Applies now”; call the scope “This Lumiverse login” versus “This conversation” versus “Fictional profile”. No opt-in/default changes and no conflation of normal auto replies with idle autonomy. |
| 4 / A | `service.ts:saveMemory` rejects all actions at 100 versions, including Disable/Clear; UI still offers those controls. `memory-panel.ts` displays all retained versions. | Fix the non-destructive management-capacity policy before wider beta; show an actionable refusal. Do not silently remove versions or propose retries that cannot succeed. This needs a separately scoped safety change, not cosmetic error suppression. |
| 5 / B | `view.ts` “Schedule character message” creates an AI opportunity, not authored text or guaranteed delivery. Jobs can be queued, paused, failed, canceled or missed by existing eligibility/quota/expiry rules. | “Schedule an AI message opportunity”; separate Upcoming and Recent outcomes and show due/expiry with a short eligibility explanation. Preserve terminal records and existing expiry policy; never imply an expired job will retry. |
| 6 / C, wording B | `preset-panel.ts` library/editor/room binding are distinct but Publish/Apply/Restore actions share visual prominence. Conflict review can expose `JSON.stringify`ed version data. `placement-controls.ts` reveals template expressions and ordered section machinery. | Explain “Save a reusable template version” versus “Use this version in this chat”. Keep binding/current revision visible. Place custom macros under intentionally opened advanced editing; replace raw JSON conflict review with a readable saved/draft comparison later. |
| 7 / C | `memory-panel.ts` has separate AI suggestion and memory editor textareas, coverage controls and Use→Apply→confirm stages. History eagerly creates up to 100 version rows. Panel maximum height is 70%, alongside thread/composer and other scroll regions. | One clearly labeled working draft, source/proof badge and a readable saved-version comparison; versions selected on demand rather than every long version expanded into DOM. Preserve explicit review/confirmation and source proofs. Tools should become a main-pane mode, not squeeze chat underneath stacked editors. |
| 8 / C | `view.ts:form` repeats name/texting/status/delay configuration per character; long group configuration scales with membership. Essential chat settings and advanced prompt/provider settings are mixed. | Portrait + character name + status/texting summary rows opening focused detail controls. Use four categories and explicit setting scope, not a wholesale merge of unverified UX-02 WIP. Do not remove controls or redefine stored modes. |
| 9 / A/B | Memory/preset controls such as “Use refreshed conversation revision”/“Use refreshed library revision” can authorize another save after a conflict; raw structured details do not make the overwrite decision easy to understand. F correctly refuses obsolete AI suggestion proofs and allows explicit manual review. | Show what changed and “Keep my edits after review” versus “Use saved version”. Explain “Conversation changed; regenerate or review this as a manual summary.” Keep optimistic checks and confirmation. No hidden rebasing/retries. |
| 10 / C, targeted focus B | `view.ts` Room options lists Settings, Participants, Pins & Notes, Presets, Search, Preview and Memory with comparable visibility. Preset tools adapt near 600px of their own container; conversation column threshold is 640px; a 900px viewport may still yield a narrow tool pane. Repeated character labels can create duplicate accessible names and ambiguous label-based focus recovery. | Prioritize Conversations/Search/Chat preferences; move developer-oriented tools under Advanced. Use stable control IDs and return focus to the actual invoking control. Validate resized containers, duplicate names, zoom and keyboard, not viewport fixtures alone. |

These observations describe code and interaction structure. Cramped rendering, contrast failure, focus loss and perceived visual heaviness are **risks requiring screenshots or interaction testing**, not confirmed pixel defects. No speculative performance fix is justified. Rendering 100 long memory versions or a large search-jump suffix merits later measurement, not an assertion that it caused earlier freezes.

## Plain-language vocabulary

| Current concept | Proposed wording / short explanation |
|---|---|
| Room | Conversation in ordinary navigation; retain IDs/types internally. |
| Fictional account | Fictional profile — who you are in Mochi. Does not change your Lumiverse login. |
| Real account permission | This Lumiverse login — applies across its Mochi profiles. |
| Auto reply / response mode | Automatic replies after you send; explain legacy automatic-reply setting separately from mode. Natural may choose silence/timing; Instant requests an eligible reply; Manual leaves automatic replies off and explicit Continue available. Presence still affects eligibility/delay. Preserve actual stored legacy behavior. |
| Idle/background permission | Allow characters to start conversations while you are away — separate opt-in from replies to your messages. |
| Preset / Publish / Apply | Prompt template / Save reusable version / Use in this conversation. Publishing does not update other bound rooms automatically. |
| Macros | Context placeholders (advanced) — insert supported context sections. Do not call arbitrary syntax an everyday requirement. |
| Prompt Preview | Preview AI context (advanced, read-only). Not a provider generation. |
| Conversation Memory | Conversation summary — reviewed recollection of a selected message range; original history remains saved. |
| Generate / Use / Apply | Suggest summary with AI / Use suggestion as draft / Save reviewed summary. Keep the cost-bearing action distinct from saving. |
| Invalid coverage | Earlier messages changed — summary no longer matches that range; AI uses raw history within its normal budget until reviewed. |
| System Notes | AI instructions for this conversation — unlike bookmarks or a descriptive summary, these intentionally guide generation. |
| Expired | Missed opportunity — show due/expiry and known reason; no invented provider attempt. |

Labels are proposals. They must be checked against saved legacy states and effective response behavior; do not silently reset settings to make wording convenient.

## Recommended navigation and four-category settings

Primary shell: current fictional-profile selector, Conversations and New conversation. Selected conversation retains header, Participants, message history and composer. Search is a primary chat tool. Memory and Chat preferences are reachable without knowing about templates. Advanced tools contain Prompt templates, Preview AI context, context placement and diagnostics. Preserve notifications as a separate view; unread/read history semantics stay visible.

| Category | Contents and scope |
|---|---|
| General | Conversation title, participants and room nicknames. Link to separate Fictional profile settings for persona/avatar/username/startup selection. Shared Pocket preferences live in Pocket and are labeled as shared, not copied into room storage. |
| Texting Behavior | Existing automatic replies/mode explanation, responder selection and compact per-character texting rows. Show actual saved/effective legacy state; clear “Requires Save”. No new response modes or implicit autonomy opt-in. |
| Availability & Schedules | Per-character immediate status rows/detail delays, Upcoming opportunities and Recent outcomes. Show room permission beneath real-login permission dependency. Idle opt-in explicitly distinct; AI timing suggestion setting marked staged. Show known quota/eligibility blockers rather than hiding unavailable controls without explanation. |
| Advanced (collapsed initially) | Connection/model, token budgets, room instructions, prompt-template binding/editor, macros/placement, System Notes and context diagnostics. Keep provider failures actionable; connection ownership remains enforced. Opening a section never saves, fetches a provider reply, resets a legacy field or changes defaults. |

Migration-free plan: present the same fields/endpoints through grouped UI adapters; retain original draft object/revision, immediate dispatcher and explicit Save path. Separate fictional-profile editor, conversation editor and real-login permission actions by visible scope headers. Reuse validation, dirty navigation and ticket cancellation rather than constructing another session/view. Tests must show disclosure toggles alone produce no mutation.

## Beginner first-use workflow

1. Open Mochi; select/create a fictional profile and choose an owned persona. Explain this identity is independent of the active RP.
2. Start a DM/group, select characters with portraits, and choose an available connection/model if required. Saving creates a conversation, not a scheduled task.
3. Send ordinary text. Show whether automatic replies are enabled and explain Natural/Instant/Manual only where that choice is made. Empty Continue remains discoverable in tooltip/help.
4. If provider/source/limits prevent a reply, keep the accepted user message and draft, show an actionable reason, and require an explicit retry; do not add hidden requests.
5. Open Texting Behavior to change a character's style. Show whether Save is required and retain unsaved edits during harmless disclosure/navigation.
6. Introduce optional memory only when requested: choose range, generate once or write manually, review, save. Never require a template/macro to chat.
7. Offer Advanced prompt templates and notes later, explaining publish versus room binding and instruction versus recollection. Scheduling is optional with explicit permissions, not onboarding default.

## Desktop/narrow composition and reusable patterns

Keep the approved chat identity: circular portraits, readable smaller sender names beside time, content-sized bubbles, compact participants, integrated composer and recognizable branding. Maintain existing light/dark tokens and centralized scoped CSS. Themes/colors remain a separate later milestone.

Desktop: persistent left conversations and right selected chat. Open a tool in the right main pane with clear Back to conversation, preserving composer/settings/tool drafts and thread scroll. In sufficiently wide *tool containers*, show saved content and working draft side by side; do not assume viewport width equals available space. Keep one clear primary action in the tool footer and secondary actions in a toolbar.

Narrow: list→chat→tool as a single-column flow with stable back/focus behavior. One main scrolling region per mode plus a usable bottom action bar; no compressed dual editors above a half-visible composer. Compact portrait/status rows expand into full-width detail. Do not implement this redesign in G.

Local Lumiverse references: `frontend/src/components/panels/PresetManager.tsx` uses shared Button, CollapsibleSection, Toggle and NumericInput; useful control consistency but copying every accordion would repeat disclosure overload. `LoomBuilder.tsx`/its module CSS separates toolbar/blocks/editing surfaces and supports keyboard operations; its category/block concepts are too advanced for default Mochi onboarding. `LoomSelector.tsx` provides a reusable-library selection model but selection and editing still need stronger separation here. Reuse patterns conceptually within Mochi's existing DOM/session architecture; no React/framework rewrite.

External primary guidance informs proposals, not claims of tested usability: the [GNOME design principles](https://developer.gnome.org/hig/principles.html) support a guided default experience with less-used complexity disclosed deliberately. Its [adaptive interface guidance](https://developer.gnome.org/hig/guidelines/adaptive.html) supports changing navigation composition with available space rather than only shrinking columns. Follow [W3C's modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for intentional focus entry, containment and restoration; labels alone do not prove this behavior in the host.

## Prioritized delivery backlog

**A — before wider beta:** trusted real-user lifecycle; non-destructive memory-capacity management; explicit cancellation consequences; accurate staged/immediate/scope wording; understandable stale-source/overwrite decisions. Authentication and capacity changes require separate targeted checkpoints. Preserve all histories, receipts, quotas, account guards and old defaults.

**B — shortlist of isolated polish:** label scheduled opportunities accurately; clarify Publish/Apply and Generate/Use/Save; label body-preview privacy precisely; add scope/apply badges; stable focus identifiers for repeated names; failure reasons with explicit next action. Implement only after reviewing each current state and testing keyboard, dirty draft and request-count behavior. G documents these instead of bundling unverified UI patches with safety findings.

**C — UI Modernization & Settings Reorganization:**

1. Beginner task research and approved wireframes; settle vocabulary/scope/action hierarchy before CSS work.
2. Shared form/card/toolbar/dialog primitives with one draft/focus/status convention.
3. Four-category preferences and scalable per-character detail editor, without storage migration.
4. Cohesive memory/template workspace, readable conflict comparison and bounded version browsing.
5. Consistent list/chat/tool navigation and contextual first-use help.
6. User acceptance at real narrow/desktop widths; then separately consider final colors/themes.

Fictional clocks/weekly routines/status schedules and AI-suggested schedules remain later functional milestones, not hidden additions to settings modernization. First inspect existing clock/scheduler primitives; add optional explicit fictional time, then bounded weekly availability, then suggestions with review/confirmation and existing permissions. No scheduling policy or old Character Chatroom source is copied by this audit.

## Required visual and usability acceptance

With separate authorization, capture synthetic fixtures at 320px, 390px and 900px, also resize the floating window inside a wider host. Include minimum height 420px, 110/125/150% browser/UI zoom, light/dark, coarse pointer, long duplicate names, 12-character groups, long message history, and maximum retained memory versions. Inspect actual bubble widths, nested scrollers, typography, touch targets, status/dirty/error/loading distinction and content overlap.

Record keyboard-only open/back/dialog/escape/focus-return flow, text selection and scroll anchoring. Test Stop and close during reply/summary work; save conflicts; unsaved room/memory/template drafts; hidden/reopened notifications; previews disabled; portal handoff and logout. Check screen-reader names/status announcements and real contrast, not just selector presence. Never show private RP content in screenshots.

Ask a beginner to start a conversation, change texting style, recover from a provider error, distinguish template publish from room use, and Generate→review→Save a summary. Observe wrong turns and explanations needed before finalizing the workspace. Do not claim success from source review or JSDOM width fixtures. Visual-baseline and actual-user acceptance remain pending, not passed.
