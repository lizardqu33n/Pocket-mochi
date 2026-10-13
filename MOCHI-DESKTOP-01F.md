# MOCHI-DESKTOP-01F — Desktop usability, responsiveness and accessibility

Inspected baseline: clean `8afba631b6c73d428523d6d02ea67502f44ecf2c` on isolated
`codex/mochi-desktop-01b-base-review`. The user reports successful live navigation
testing of 01E3. This checkpoint does not claim live verification of 01F.
No host/browser, installed extension, disposable test data or Ubuntu environment
was launched or changed. Original mochi WIP, Pocket Power and Kitty's checkout
remain untouched. Floating-shortcut positioning/snapping is deliberately unchanged.

## Inspection and narrow changes

The existing window factory retains one floating widget/workspace per shared
session, title-bar-only pointer dragging, southeast resize, bounded 320x420 minimum
dimensions (reduced when the viewport cannot fit them), draft/room retention and
app-owned hide/restore. Existing 01E3 navigation/account ownership is preserved.

Confirmed usability gaps and fixes in `src/mochi/window.ts`:

- Opening/restoring had no explicit window focus management. The window now focuses
  its keyboard-accessible title bar or retained focused content, preserving focus
  already inside it. Explicit close/hide returns to the connected opener when it
  is not hidden. Session handoff does not forcibly return focus to another app.
- The title bar gains arrow-key movement in host layout units, bounded to the
  viewport, a visible focus outline and accessible instructions. Escape only hides
  when the title bar itself is the key target. Composer/dialog keys are not consumed
  by a global Escape handler. Buttons retain native Enter/Space semantics.
- Add accessible maximize/restore using the inspected host fullscreen APIs. Save
  the pre-maximize rectangle; restore and clamp it against current viewport bounds.
  Hide the resize grip and block resize/drag while maximized. No title-bar redesign,
  browser fullscreen API or new window manager is introduced.
- Restoring a host-hidden but still leased workspace previously skipped its normal
  resume/read reconciliation. Explicit restore now resumes the existing view after
  making the widget visible. Notification acknowledgments are deduplicated: hidden
  incoming notifications stay unread; explicit restore acknowledges once.

`src/mochi/sidebar.ts` adds alert/status roles to existing sanitized error/loading/
empty feedback. Existing messenger errors already use role=alert, feedback uses
role=status, notifications have accessible feedback, the thread is keyboard
focusable and the composer preserves Enter/Shift+Enter/Stop semantics. No new owned
animation is introduced; reduced-motion behavior needs no new animation override.

## Supported host APIs and maximize decision

Inspected Lumiverse sources (outside this extension, read only):

- `frontend/src/lib/spindle/placement-helper.ts`, `createFloatWidgetHandle`:
  `setFullscreen`, `isFullscreen`, `getPosition`, `moveTo`, `setSize`, `onDragEnd`.
  Fullscreen saves host preFullscreen geometry, applies layoutViewportBounds and
  restores a committed/clamped rectangle. It is supported widget maximization,
  not browser fullscreen or a mobile-only DOM workaround.
- `frontend/src/lib/spindle/frontend-context.ts`: geometry.layoutViewportSize
  reads the viewport using safeUiScale. Window geometry uses these layout units,
  not raw browser pixels multiplied a second time. Keyboard deltas use the same units.
- `node_modules/lumiverse-spindle-types/dist/dom.d.ts`: public floating-widget
  fullscreen methods. The maximize control is omitted if either method is absent.
- `frontend/src/lib/spindle/loader.ts`: extension cleanup/unload lifecycle.
  `frontend/src/api/session-lifecycle.ts`: SESSION_EXPIRED invalidation signal.

Maximize is implemented because both the public API and actual host implementation
provide a supported geometry restore path. While maximized, ordinary window resize
handling leaves geometry to the host. On restore, Mochi additionally clamps its
saved rectangle if the viewport became smaller. Actual host pointer/fullscreen
rendering, live scale changes and React mount/focus timing remain manual checks.

## Responsive and session findings

Existing container CSS remains unchanged: >=640 layout pixels uses two columns;
below 640, list/chat/detail states use one column with Back navigation. Host mobile
routing remains <=600 browser viewport pixels or a coarse pointer, so a 600px host
uses the drawer. A smaller floating window also uses the narrow container layout.

Tests cover 320/390/600/900 logical viewport geometry and 320/390/600 drawer routing,
list -> chat -> Back state, long fixture names, independent history scrolling,
bounded history loading, scroll anchoring, draft/focus preservation and empty/error
states. Existing min-width:0/ellipsis/content-sized bubbles/bounded composer rules
are retained. DOM fixtures do not evaluate pixel layout/container queries; wrapping,
horizontal overflow, keyboard occlusion and zoom are not certified by these tests.

One shared view/session/backend listener/window remains authoritative. Sidebar
account browsing does not take the conversation lease, cancel generation, reset
selection or mark hidden conversations read. Switching/editing profiles preserves
scope, drafts, busy guards and unsaved-change confirmation. Existing native handset
cancellation gates remain; no Pocket phone, account storage, generation, scheduling,
provider, schema or settings behavior changed.

## Explicit unresolved host limitations

Silent real-user identity switching is not fixed. The inspected frontend context
does not expose an authoritative current-user/identity-change subscription usable
by this extension. Existing supported session-expired events, different real-owner
account/room responses and extension teardown destroy private state, but a silent
host auth switch without those signals can leave cached frontend state mounted.
Safe shared multi-user deployment requires host-guaranteed teardown/new frontend
context per authenticated identity, or a supported authenticated identity boundary
wired to `MochiSession.authenticatedIdentityChanged` before new-user interaction.
Simulated owner-change tests cannot prove that live wiring exists.

Floating widgets still have no supported external-hide subscription. Their
isVisible getter prevents hidden-room reads/toasts; explicit restore reconciles
unread state. Arbitrary host-chrome hide/remove may still leave the Mochi shortcut
hidden. Restore through Pocket's existing sidebar. No polling, body observer,
invented host event or shortcut-positioning workaround was added.

Focus management is verified in attached-DOM fixtures. Deferred host root mounting,
host focus interception, actual dialogs, screen-reader announcements and mouse/
keyboard focus after React visibility changes require manual verification. No
global keyboard trap or comprehensive accessibility framework was introduced.

## Changed files and sequential verification

- `src/mochi/window.ts`: supported maximize/restore, scoped focus/keyboard handling,
  explicit restore/read reconciliation.
- `src/mochi/sidebar.ts`: existing feedback exposed as alert/status.
- `tests/mochi-window.test.ts`: fullscreen mock matching inspected host behavior,
  geometry/focus/Escape/maximize/hidden-read regressions.
- `tests/mochi-sidebar.test.ts`: 600px drawer navigation and accessible error checks.
- `dist/frontend.js`: matching built frontend; backend is unchanged.
- `ROADMAP.md`: desktop-foundation status and exact user-approved phase/beta order.
- `MOCHI-DESKTOP-01F.md`: this report and remaining acceptance checklist.

42 focused tests passed, 375 assertions: window (12), sidebar (11), session (9),
desktop layout (5), portal (5). One TypeScript typecheck passed. One sequential
production backend/frontend build passed. These are synthetic DOM/transport/geometry
tests plus source and bundle inspection, not real Lumiverse/provider or browser
pixel verification. No full suite, Chromium, visual pipeline, parallel processes,
live provider calls or host launch ran.

SHA256:

```
frontend C602BB344BE590F83B1B55049504CF5190205AD5735DCD9B83F79CBFA7E618AC
backend  CC9CA7FB5DF7FDBDEDF22B961A1F09333275B1C3DDC7073889F742EA5ACF1983
```

Artifact inspection finds the new controls/focus/read-resume code and unchanged
shared-session/sidebar/window paths in the frontend. Both entry bundles remain
present/tracked; backend SHA256 is identical to 01E3. Before building, 01E3 artifacts
were preserved byte-for-byte in ignored `tmp/01e3-verified-bundles`; older backups
remain untouched. No credentials, screenshots, scratch files or persistent data
are included in this checkpoint.

## Ordered manual acceptance after a separately approved test update

1. Confirm unchanged Pocket/Mochi shortcuts and single Pocket rail tab. Test native
   phone open/close/device switching independently. Do not investigate cosmetic snapping.
2. Open Mochi with keyboard: verify sensible focus and visible focus indicators.
   Move with title-bar arrows and pointer drag; content selection/typing must not drag.
3. Resize with grip/arrow keys, maximize/restore and shrink the viewport while
   maximized. Check bounds/minimum usability at 320/390/600/900px and host UI zoom.
4. Hide/restore with a composer draft and selected room. Verify focus return.
   Escape from the title bar may hide; composer/dialog keys must remain independent.
5. Exercise mobile list/chat/Back and Accounts navigation, long names/text, composer
   Enter/Shift+Enter/Stop, history scrolling/load earlier, errors and retry controls.
6. Switch synthetic fictional accounts and edit/save/cancel a profile. Check drafts,
   dirty-form confirmation, busy protection and no previous-account content leaks.
7. With a test notification, confirm picker-only and hidden windows do not acknowledge
   or toast; explicit restore reconciles once. Test generation ownership and handoff.
8. Check supported logout/extension teardown and assistive-technology feedback.
   Keep silent auth switching and external host hiding separate unresolved checks.

Ready for checkpoint review with those manual checks outstanding. This is not a
public-beta or 1.0 claim. Messaging Improvements has not begun; no push, installation,
merge, rebase or deployment was performed.
