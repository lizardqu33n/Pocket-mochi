# MOCHI-DESKTOP-01E — Dedicated sidebar and fictional account navigation

Starting point: `552024e34392ea001a947bcb7f3c60d72f733c4f`, clean isolated
`codex/mochi-desktop-01b-base-review` checkout. Original mochi/settings WIP,
Pocket Power and Kitty's installed checkout were not changed. No installation,
push, server operation or host/browser startup was performed.

## Host API and replaceable icon

The existing `ctx.ui.registerDrawerTab` supports multiple contributions from one
extension. Mochi registers `id: 'mochi'`, title/short name/header `Mochi`; Pocket
keeps its existing `lumiphone` tab and PHONE_ICON. Inspected implementation:
Lumiverse `frontend/src/lib/spindle/placement-helper.ts`,
`createDrawerTabHandle`, and published `dom.d.ts` drawer options/handle.
Host-generated IDs isolate contributions. Registration requires no new permission.
Activation uses `onActivate`; cleanup uses its unsubscribe and `destroy`.
There is no supported drawer-close/deactivation callback on this handle, so no
invented event or close/fullscreen API is used.

Replace only `MOCHI_SIDEBAR_ICON` in `src/mochi/sidebar-icon.ts` for the user's final
asset. The temporary original outline SVG uses `viewBox="0 0 24 24"`, width/height
100%, currentColor, 1.8-unit rounded strokes and no external assets. This follows
Pocket's 24-unit outline convention while depicting a mochi instead of a phone.
The host `DynamicExtensionIcon.tsx` sanitizes inline SVG and sizes the enclosing
box; default 16px, inspected drawer placements 19/20px. Design a legible square
icon at those sizes; a 24x24 viewBox scales appropriately. The API also accepts
`iconUrl` for a 16x16/24x24 image, mutually exclusive with `iconSvg`. Inline SVG is
the recommended replacement here; retain currentColor and avoid executable or
external content. Pocket's icon and the manifest were not redesigned.

## Navigation and ownership

- The drawer shows profile names/portraits, selected identity, chat counts,
  create-account and unassigned legacy-chat actions, loading/empty/error/retry
  states, plus Accounts and Open messenger navigation.
- Existing `MochiProfiles.state` and the existing selected account/room are the
  authoritative data. There is no second view, account cache, generation owner,
  draft cache or backend subscription. Profile creation uses the existing form
  and validated service. Account switches use the existing account-selection
  endpoint and dirty-form confirmation; busy operations disable switching.
- A navigation observer in `MochiSession` redraws the picker without acquiring
  the presentation lease. Correlated account metadata requests do not replace
  the interactive request, cancel generation or acknowledge notifications.
  Picker redraws are skipped when their displayed data is unchanged. No polling
  or new mutation observer was introduced.
- Selecting an account on desktop opens/restores `createMochiWindow`; its existing
  WeakMap ensures portal and sidebar reuse one floating window. Conversation
  presentation still uses the existing shared workspace/session lease.
- Last room per fictional account (and separately for legacy chats) is remembered
  in the authoritative view's session memory. After account-scoped room loading,
  restoration checks existence and matching account. Missing/inaccessible rooms
  fall back to the list. No schema or persistent preference was added; a full
  page reload does not retain this new last-room memory. Same-account reopening
  preserves the current room and unsaved forms. Logout/destruction clears memory.
- On mobile, use the inspected host rule: viewport <=600px or coarse pointer.
  Selection presents the existing responsive messenger in the Mochi drawer,
  never in Pocket's phone. Accounts returns to the picker without canceling an
  active request; hidden conversation content cannot claim read visibility.
  Desktop hosts lacking floating geometry use the same drawer fallback with an
  explanatory message. No automatic fullscreen behavior is added.
- Portal/handset routes, profile previews, source refresh, model picker, native
  Pocket Messages, scheduling, quotas, schemas and provider behavior remain intact.
  `createMochiWorkspace` API remains compatible; session navigation methods are
  additive. Refresh before any account selection requests metadata only rather
  than loading an unintended legacy scope.

## Files

- `src/mochi/sidebar.ts`: dedicated tab, lightweight account navigation, window/
  drawer presentation and cleanup.
- `src/mochi/sidebar-icon.ts`: single replaceable temporary asset.
- `src/mochi/sidebar-styles.ts`: scoped centralized navigation styling using host
  variables; no theme system.
- `src/mochi/session.ts`: navigation observers/startup and cleanup, same owner.
- `src/mochi/view.ts`: correlated metadata, existing account/create navigation and
  validated session-memory room restoration.
- `src/frontend/controller.ts`: register/clean up Mochi alongside Pocket.
- `tests/mochi-sidebar.test.ts`: synthetic sidebar/account/ownership regressions.
- `dist/frontend.js`: rebuilt installation artifact; backend remains unchanged.
- `ROADMAP.md`: full themes/branding moved to FINAL milestone before 1.0, after
  desktop/settings/clocks/messaging/memory/optional RP linking/stability.
- `MOCHI-DESKTOP-01E.md`: this report and manual acceptance checklist.

## Sequential verification

Final targeted checks: 26 passing tests (7 sidebar + 9 session + 5 window + 5
desktop layout), 211 assertions. Tests are jsdom/transport/geometry simulations,
not a running Lumiverse or real provider. Native modal dialog lifecycle is
explicitly simulated in the new fixture. Cases include 320/390px drawer paths,
900px desktop routing, long names, per-account and legacy restoration, missing
rooms, one listener/window, generation preservation while browsing accounts,
hidden-picker read/toast behavior, dirty-form keep/discard, profile creation form,
error/empty states and authentication teardown. Existing targeted checks cover
portal handoff, drafts, model/render contracts and malformed messages.

Typecheck initially identified four nullable-state accesses in the new restoration
block. An explicit state guard fixed them; the sequential rerun passed. One
production build passed after that; no backend source changed. Narrow source/
artifact inspection confirms 01B/01C/01D/01E functions and styles in the frontend.
This is build provenance/contract inspection, not compiled live UI verification.
No full suite, Chromium, visual baseline, parallel builds or live provider calls.

SHA256 of new installation artifacts:

```
frontend DEBAD81A7E04D4251351C4EDAB3EC844575EF559883F43770E212F34D14F4E60
backend  CC9CA7FB5DF7FDBDEDF22B961A1F09333275B1C3DDC7073889F742EA5ACF1983
```

Both manifest entry files remain present and Git-tracked, identifier `lumiphone`,
permissions unchanged. The backend is byte-identical to 01D/01C. Original 01C
backups in ignored `tmp/01c-verified-bundles` remain intact. Current 01D bundles
were preserved byte-for-byte in ignored `tmp/01d-verified-bundles` before building
01E. No scratch data, screenshots, credentials or test-instance accounts are
included in the checkpoint. Windows CRLF is allowed in whitespace validation.

## Manual Windows acceptance still required

After separately approved installation into the disposable instance only:

1. Confirm Pocket and Mochi are distinct sidebar entries. Mochi opens the account
   picker, not the Pocket phone; selecting a synthetic account opens the floating
   messenger at desktop widths. Confirm geometry permissions/focus in the real host.
2. Switch two fictional accounts and legacy rooms; verify separate last-room
   restoration. Delete a remembered disposable room and verify list fallback.
   Cancel dirty-form navigation; reopen the same account without losing edits.
3. Repeat sidebar clicks/window hide/restore/portal handoff; confirm only one client
   and preserved drafts. Picker-only browsing must not cancel an active interactive
   request or mark hidden room notifications read. Confirm native Pocket separately.
4. At 320/390px and coarse-pointer devices test drawer list/chat/back/accounts,
   keyboard/composer, long names and vertical/horizontal scrolling. At 900px test
   two columns. Test browser and host UI zoom, title-bar dragging and resize/focus.
5. Test logout/extension reload and late metadata responses with synthetic accounts.

The existing session-expired event, authoritative different-owner response and
extension teardown destroy private frontend state. Silent real-user switching
without an authoritative signal still requires host lifecycle integration and
live validation; do not certify shared multi-user deployment on these simulations.
Drawer deactivation/external hide is not observable through the inspected handle;
DOM visibility suppresses read/toast presentation, but immediate cancellation on
external drawer closure is not asserted. No fixes to unrelated host behavior were
attempted. Review these manual results before 01F; nothing was pushed or installed.
