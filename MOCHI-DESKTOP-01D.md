# MOCHI-DESKTOP-01D — Independent messenger interior

Status: source implementation and targeted simulated regressions passed. Not typechecked, rebuilt, browser-verified or installed for 01D.

## Starting point and bundle preservation

Started on `codex/mochi-desktop-01b-base-review` at `49a49f3bb84d797064638297125f02a5df7e1156`. The only initial working changes were the generated 01C verification bundles. Before editing, copied both byte-for-byte into ignored `tmp/01c-verified-bundles/`; originals and copies retain these SHA-256 values:

- Backend: `CC9CA7FB5DF7FDBDEDF22B961A1F09333275B1C3DDC7073889F742EA5ACF1983`.
- Frontend: `3F58AB10BFED01B510C0B6BD92F48C302859DFBD5643CD3A74072DA2029568E7`.

No build ran for 01D. Those existing dist changes remain preserved and uncommitted; they include 01B/01C, not this layout. Only 01D source/tests/report are included in its local commit. No original/recovery, Power or upstream branches were changed. Pocket performance investigation remains on hold; no speculative performance fixes were made.

## Layout and ownership

The dedicated window requests `presentation:'messenger'` from the existing workspace. Default workspace consumers and Kitty's portal/handset renderers remain unchanged.

`MochiView.renderDesktop()` creates a conversation navigation column and a main conversation/settings column, inside the same authoritative view. It reuses character portraits, scoped room names, existing header, message actions, composer/responder controls, cancellation, settings forms, source refresh and model picker. Fictional account/profile controls remain reachable without introducing a sidebar redesign.

Room buttons expose accessible full names, truncate long visible names/previews, identify the active room with `aria-current`, and show counts derived only from actual unread notification records. Opening a conversation follows existing scoped `openRoom` behavior. Switching conversations, profiles or creation from the new toolbar uses the existing unsaved-change confirmation. Selected account, room and composer drafts remain in the shared session; no new backend subscription, view, generation controller or toast presenter is created.

At container widths **640px and above**, list and content appear side-by-side. Below **640px**, the list and chat/settings use a single-column flow with Back to conversations. Account selection uses the main pane. Zero-room accounts and no-selection states have explicit, actionable empty states. The floating window's initial requested width is 840 rather than 560; height and supported geometry mechanisms are unchanged, and existing clamping still fits small viewports. No maximize or advanced geometry was added.

The conversation header and composer remain outside the scrolling history. The history has its own keyboard-focusable scroll area. Workspace rerenders preserve composer selection, list scroll and conversation scroll when appropriate, including scroll offset adjustment when earlier messages are prepended. Conversation selection moves keyboard focus to the composer; returning to the list moves it to a conversation button. When supported, visibility checks avoid restoring focus to a CSS-hidden control. Actual host focus and scroll anchoring still require validation.

## Bounded display work

Only the selected room's latest **100** messages are initially rendered in the dedicated window. Show earlier messages explicitly expands that display by 100. Stored history, revisions, snapshots and outgoing generation context are never trimmed or changed. Compatibility handset/portal rendering is unchanged. Room previews inspect only the last message and a bounded text excerpt; other rooms' histories are not rendered.

No body-wide observers, polling, scroll handlers or new timers were introduced. Conversation rows are still rendered for all scoped rooms, and selected content is rebuilt on existing redraw events. Explicitly loading many earlier messages can increase DOM cost. This is bounded initial rendering, not a complete virtualized history system. Incoming replies may advance the oldest boundary of the limited display window; long-running scroll behavior should be checked manually.

## Targeted verification

Sequential source/JSDOM tests with synthetic records and mocked host handles:

- `tests/mochi-desktop-layout.test.ts`: **4 pass / 38 assertions**. Conversation flow, active/unread indicators, 1,000-message stored history with 100/200 rendered messages, fictional-account selection, draft switching/handoff, dirty-settings protection, empty accounts, composer focus/selection and simulated scroll restoration.
- `tests/mochi-window.test.ts`: **5 pass / 48 assertions**. Dedicated window entry, geometry, hide/restore, portal handoff, interactive-only cancellation, cleanup and fallback.
- `tests/mochi-session.test.ts`: **9 pass / 66 assertions**. Single ownership, notifications/read behavior, private teardown and metadata cancellation.
- `tests/portal.test.ts`: **5 pass / 63 assertions**. Kitty compatibility portal, profile/source/model controls and dirty navigation.

Total: **23 tests passed, 215 assertions**. Initial new fixture failures were corrected to follow the real fictional-account acknowledgment path and supply consistent synthetic scroll metrics; all final runs pass. CSS breakpoint declarations and flow state were inspected, not rendered at real pixel widths. No full suite, typecheck, production build, Chromium or visual baseline generation ran.

## Manual Windows plan (requires later approval)

After separately approved typecheck/build and local-host preparation, use synthetic rooms:

1. At 900px window width, verify list/main columns, active room, unread counts, portraits and long names.
2. At 390px and 320px, verify list → chat → list navigation, settings/notifications/new-room access and no horizontal overflow.
3. Switch rooms while retaining a composer draft; verify confirmation protects a settings draft. Hide/restore and portal handoff must preserve account and room.
4. Scroll a long room, receive a synthetic update and load earlier messages; check viewport anchoring, focus, Enter/Shift+Enter and action menus.
5. Check host resize/UI zoom, title-bar-only drag, native Pocket Messages, interactive cancellation and untouched scheduled jobs.

No host was launched. The inherited 01B silent identity-change wiring concern and 01C external-hide/pointer/zoom concerns remain open. Container queries require a supporting browser. Built source agreement and actual pixel layout must be verified before installation.

## Changed files and next milestone

- `src/mochi/view.ts`: desktop composition, existing-action reuse and display-only history window.
- `src/mochi/desktop-styles.ts`: scoped two-column/container-responsive styles.
- `src/mochi/workspace.ts`: messenger opt-in and scroll/focus preservation.
- `src/mochi/window.ts`: messenger presentation and wider initial size.
- `tests/mochi-desktop-layout.test.ts`: targeted layout/session regressions.
- `MOCHI-DESKTOP-01D.md`: this report.

No backend/provider/scheduler/account storage/schema, permissions, theme/branding, native Pocket Messages, settings categories or RP linking changes. No push, installation, deployment or merge.

01E can be scoped after this review, but the current source is not install-ready. Approve focused typecheck/build and manual responsive/focus verification before relying on the messenger layout in a live host. Stop here for review.
