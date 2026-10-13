# MOCHI-DESKTOP-01E3 — Floating shortcut and sidebar account ownership

Baseline: clean `e8a674ab37c2bc0c741388983954f3cb1f083fec` on isolated
`codex/mochi-desktop-01b-base-review`. No installed extension, disposable data,
original mochi/settings WIP, Pocket Power or Ubuntu environment was modified.

## Inspection and implemented behavior

Pocket creates its 58x58 chromeless launcher widget in
`PocketController.ensureWidget`, attaches the existing tilted phone DOM, suppresses
drag clicks using `onDragEnd`, and hides/restores the phone button in `open/close`.
That phone artwork and widget behavior remain unchanged. Its existing `ui_panels`
permission check also gates creation of the new independent Mochi shortcut.

`createMochiLauncher` creates a separate 58x58 supported floating widget alongside
Pocket, using the existing replaceable `MOCHI_SIDEBAR_ICON`. It follows committed
Pocket drag positions using the supported `onDragEnd` callback, sitting to its
left when space permits or to its right at the left edge. Host geometry clamps
placement; no body observer, polling or theme system is introduced. Dragging the
Mochi shortcut suppresses its immediate click. Its accessible button opens the
messenger directly when the shared session has a loaded, nonarchived fictional
account matching the current room scope. It does not traverse a picker or call
native Pocket opening. Without that validated fictional selection it activates
the existing Pocket sidebar picker; it never silently loads legacy chats.

The same 01C window factory remains deduplicated per session. Its app-owned
visibility callbacks hide the shortcut on open and restore it on window hide,
close or presentation handoff. Session destruction removes the shortcut, click/
drag handlers, timer and visibility subscription. The user-supplied final icon can
replace the single SVG constant used by both floating and portal shortcuts.

The original Pocket `lumiphone` drawer is still the sole extension-rail entry.
01E2's adjacent portal shortcuts remain intact. The account picker still owns
identity navigation; 01E session-memory last-room restoration remains unchanged.

## Account navigation and editing

- The messenger's Switch Mochi account activates the existing Pocket sidebar and
  opens the existing picker. It does not replace the chat, cancel generation,
  claim read visibility, discard drafts or reset selection. Switching identities
  still requires existing busy-operation and dirty-form safeguards.
- Account settings opens the selected fictional profile in that same sidebar,
  reusing `MochiProfiles`, its draft/baseline, validation, persona/source refresh,
  portrait controls and service endpoints. Creation also uses this sidebar editor.
  There is no second account store, picker, profile draft cache or backend listener.
- Cancel or successful save of the selected profile returns to its conversations
  via the existing window/workspace, preserving its room and composer draft.
  It does not reset into the window's old picker. A successful new profile creation
  explicitly selects that profile using the existing validated selection flow.
  Archiving an active profile clears its visible room scope and falls back to the
  sidebar picker rather than displaying the previous identity's conversations.
- A staged profile draft can remain preserved while browsing the picker; selecting
  another account still asks to discard changes. Busy controls remain protected.
- New room, room settings, models and conversation controls remain in the messenger.
  Its pending selection/empty account prompt refers users to the sidebar instead
  of rendering a duplicate account picker.

Two existing Pocket paths (native device selection and handset close) called
`mochi.leave()` unconditionally. They now do so only when the handset owns the
Mochi presentation. This keeps native phone operations from canceling an independent
window's generation; native Pocket messaging/storage behavior is unchanged.

## Visibility, compatibility and limitations

Window/workspace read and toast visibility now additionally consult the supported
widget `isVisible()` getter. A host-hidden window cannot acknowledge incoming
notifications just because its workspace lease is still active. The public
workspace options gain an optional host-visibility predicate; existing callers
remain compatible. The window gains an additive app-owned visibility subscription.
Backend scheduling, schemas, quota/generation/provider logic are unchanged.

The inspected host `SpindleFloatWidgetHandle` has no external visibility callback.
Its placement helper changes store visibility in `setVisible()` and exposes
`isVisible()`; the similarly named visibility subscription belongs to dock panels,
not floating widgets. This limitation was reported before implementation. Shortcut
restoration is verified for Mochi's own close/hide and session handoffs, not arbitrary
host-chrome hide/remove actions. Those external actions may leave the shortcut
hidden; use the Pocket sidebar's Open messenger route. No invented host events or
polling attempt to fill that API gap. External hide does not assert cancellation;
unread data stays preserved, and read reconciliation after external restore still
needs real-host testing.

Mobile/coarse-pointer and missing-floating-geometry hosts keep the existing
drawer messenger fallback. A floating shortcut is unavailable if the existing
panel permission/widget API is unavailable; the portal shortcut remains usable.
Adjacency is based on supported drag commits, not continuous drag or externally
changed Pocket geometry. Browser zoom/edge clamping and pointer behavior require
manual verification. The known silent real-user-switch limitation is unchanged:
supported expiry/owner-change/extension teardown clears private state, but these
tests do not certify shared multi-user host wiring.

## Files and verification

- `src/mochi/launcher.ts`: new independent replaceable floating shortcut.
- `src/frontend/controller.ts`: launcher setup; sidebar activation; handset-only
  Mochi cancellation gates.
- `src/mochi/sidebar.ts`: window visibility forwarding and existing sidebar editor.
- `src/mochi/view.ts`: sidebar navigation callbacks/profile completion; no duplicated
  desktop picker; existing profile editor/drafts reused.
- `src/mochi/window.ts`: app-owned visibility subscription and actual visibility.
- `src/mochi/workspace.ts`: optional host visibility predicate for read/toast policy.
- `tests/mochi-sidebar.test.ts`: shortcut/edge positions/hide/restore/teardown,
  sidebar account settings, completion, drafts and existing navigation regressions.
- `tests/mochi-window.test.ts`: host-hidden notification/read/toast regression.
- `dist/frontend.js`: matching runtime frontend.
- `MOCHI-DESKTOP-01E3.md`: report and manual checklist.

61 targeted regressions passed across sidebar, window, session, workspace, desktop
layout and portal checks (503 assertions across final runs). Synthetic transports,
DOM, providers and widget APIs cover account isolation, pending schedules,
legacy rooms, selection restoration, cancellation ownership, draft retention,
single view/listener/window, profile completion and hidden notifications. No live
Lumiverse/provider calls, automated Chromium, full suite or parallel workloads ran.

Typecheck initially rejected newer host widget options on an inline literal under
the older published typings. Using the same structurally typed options-variable
pattern as the existing window fixed it without an unchecked cast; the rerun passed.
One sequential backend/frontend production build passed. A final left-edge
positioning correction passed the targeted check and required one frontend-only
artifact refresh; the backend was not rebuilt again. Build provenance inspection
confirms one Pocket tab and the launcher/sidebar/window paths in the frontend.

SHA256:

```
frontend D26834D451372A93ACEF749FA48BF3A6B5E79E6AE43BF631B824B92C43F8A6CF
backend  CC9CA7FB5DF7FDBDEDF22B961A1F09333275B1C3DDC7073889F742EA5ACF1983
```

Both bundles remain present/tracked; the backend is byte-identical to 01E2.
01E2 artifacts were preserved in ignored `tmp/01e2-verified-bundles`; prior backups
and disposable installation are untouched. Staged files exclude credentials,
private/test-instance data, screenshots and scratch files.

## Manual Windows acceptance after separately approved update

1. Confirm one Pocket rail tab and adjacent portal shortcuts; verify the floating
   tilted phone is unchanged and the Mochi shortcut appears beside it. Drag Pocket
   to each edge; test Mochi keyboard activation and drag-click suppression.
2. With a selected fictional profile, click Mochi: directly restore one independent
   window and last valid room. With no validated selection, use the sidebar picker,
   never unintended legacy scope. Hide/restore and confirm shortcut visibility.
3. Switch account opens the Pocket sidebar without replacing chat or canceling
   generation. Account settings/save/cancel should return to conversations with
   drafts intact; confirm dirty-form guards and no previous-account content leaks.
4. Test native Pocket opening, closing and device selection during Mochi generation;
   independently test portal/handset handoff, unread notifications and Stop.
5. Check 320/390px drawer paths and 900px desktop layout, browser/UI zoom, focus,
   pointer resize and external host-hide limitations. Use synthetic data only.
6. Test supported logout/extension teardown: no shortcut/window/listener remains.
   Keep silent identity switching a separate unverified host integration concern.

No push, install, deployment, merge, rebase or 01F work was performed.
