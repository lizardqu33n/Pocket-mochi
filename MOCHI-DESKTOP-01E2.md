# MOCHI-DESKTOP-01E2 — Correct Pocket/Mochi navigation placement

Baseline: clean `54d7e08b1bd88d6cf9d119f43e75e83c1dfdbe09` on isolated
`codex/mochi-desktop-01b-base-review`. This clarification supersedes the separate
Mochi rail entry described in 01E. No installed extension or test data was changed.

## Inspected and corrected route

Kitty's `PocketPortal` already renders native phone choices via `phones()` and a
second Mochi destination. `PocketController.renderPhoneChoices` retains device
selection, native phone opening and its existing settings/footer actions. The
existing portal supports adjacent destinations without a host API/core change.

The only top-level drawer registration remains the original Pocket `lumiphone`
contribution, with the original PHONE_ICON and existing activation/cleanup.
Its home portal now has side-by-side Pocket and Mochi shortcut cards. Pocket's
internal shortcut uses the same unchanged PHONE_ICON; Mochi uses the existing
replaceable `MOCHI_SIDEBAR_ICON` in `src/mochi/sidebar-icon.ts`. No new branding or
theme is introduced. Existing accessible shortcut names remain "Connect to your
phone" and "Open Mochi", with visible Pocket/Mochi labels.

Flow: Pocket rail tab -> Mochi internal shortcut -> fictional account picker
inside Pocket's portal/sidebar -> independent floating messenger on desktop.
The standalone `registerDrawerTab({id:'mochi'})`, activation callback and owned
drawer cleanup are removed. No separate tab is registered by the picker anymore.
The duplicate always-visible "Mochi window" portal button is no longer wired by
the controller; Open messenger is available in the existing account-navigation
panel. Home/Back returns to the portal; Accounts returns to the picker within
that panel. Existing handset Mochi compatibility routes remain available.

## Reuse and safeguards

The 01E picker is the same component and retains its profile creation, account
switching, loading/error/empty states, legacy-room entry and validated per-account
session-memory last-room restoration. It now returns a mountable `root`, `open()`
and `destroy()` to the controller rather than creating/destroying a host drawer.
This is an internal helper API change; `createMochiWorkspace` remains unchanged.

The portal attaches that root directly, retaining the same navigation observer,
shared view, drafts and workspace. Opening the picker only loads correlated
account metadata; it does not activate the phone presentation lease, cancel
generation, discard drafts, reset account selection or acknowledge room messages.
Account switching still uses existing busy protections and dirty-form confirmation.
Selecting an account uses the unchanged floating-window factory and its per-session
deduplication. A handset-to-window handoff no longer forces the portal back home,
which would otherwise dismiss the newly displayed picker. Native phone closing
and ownership behavior remain intact.

Mobile (<=600px or coarse pointer) and hosts lacking supported floating geometry
continue using the same responsive messenger inside the picker panel, now inside
Pocket's existing drawer. Container-only CSS keeps its history/composer bounded
and scrollable rather than inheriting the old phone-oriented portal sizing. No
fullscreen API, new permission, backend change or settings redesign is added.

Logout/session destruction removes the observer, picker root and owned workspace
through the existing session lifecycle. No new backend subscription, toast owner,
account store, polling or generation controller was introduced. Silent real-user
switching without an authoritative host signal remains unresolved and must not be
represented as verified shared-account safety.

## Changed files

- `src/frontend/controller.ts`: mount/reuse picker in original Pocket portal,
  supply shortcut icons, retain sidebar during presentation handoff.
- `src/frontend/components/portal.ts`: adjacent shortcut layout, supplied icons,
  bounded embedded Mochi drawer presentation.
- `src/mochi/sidebar.ts`: remove separate drawer registration and expose the
  existing account-navigation panel for embedding.
- `tests/mochi-sidebar.test.ts`: use the real portal with the same picker; prove
  no extra registration, native phone routing, window opening, draft/generation
  preservation, account restoration, mobile paths and cleanup.
- `dist/frontend.js`: matching production frontend artifact.
- `MOCHI-DESKTOP-01E2.md`: this report.

## Sequential verification and artifacts

27 targeted tests passed: 8 account/sidebar, 5 portal, 9 session, 5 window, with
242 assertions across their final runs. The sidebar fixture uses the real portal
and checks no drawer is registered by the embedded picker. A controller source
contract checks there is exactly one registerDrawerTab call with `lumiphone`.
Simulations include 320/390px and 900px routes, long names, legacy/fictional scopes,
last-room restoration, missing-room fallback, modal keep/discard, metadata during
generation, no hidden-picker read acknowledgment and one view/listener/window.

One TypeScript typecheck passed. One sequential production build passed.
Artifact inspection confirms one drawer registration, embedded account-picker
mounting and retained 01B session/01C window/01D layout. Backend SHA256 is identical
to 01E; no backend sources, permissions or schemas changed. These are source/DOM
simulations and build provenance checks, not live host or provider verification.
No full suite, automated Chromium, parallel builds or heavy visual pipeline ran.

SHA256:

```
frontend 255DE8CA5D08D99C605645097DDDB5DF0A54ED8313EFE244571995C9C217E160
backend  CC9CA7FB5DF7FDBDEDF22B961A1F09333275B1C3DDC7073889F742EA5ACF1983
```

Both runtime bundles remain present and tracked; only the frontend changed.
01E bundles were preserved in ignored `tmp/01e-verified-bundles` before rebuilding.
Earlier 01C/01D backups remain untouched. No temporary files, credentials, test
accounts, screenshots or stored messages belong in the checkpoint.

## Remaining disposable Windows manual checks

After separately approved update of the existing test extension and full frontend
reload (the disposable instance still has 01E until updated):

1. Confirm exactly one top-level Pocket tab with its original phone icon. Inside
   its home portal, confirm adjacent Pocket/Mochi shortcuts and no extra launcher.
2. Pocket must still reach phone selection/settings and native Messages. Mochi
   must show accounts inside the sidebar without opening a fictional handset.
3. Select two synthetic profiles: confirm one floating messenger and each valid
   last room. Hide/restore, keep a composer draft and cancel dirty-form navigation.
4. Open the picker during interactive generation: it must not cancel or claim
   hidden-room read visibility. Account switches remain blocked while busy.
5. At 320/390px, exercise drawer list/chat/Accounts/portal Back, keyboard focus,
   long names, scrolling and bottom composer. At 900px, test floating two columns,
   pointer drag/resize, browser/UI zoom and unsupported-host fallback if available.
6. Test handset/window handoff and logout cleanup without duplicate clients;
   keep the known silent identity-switch limitation separate from supported signals.

No push, installation, deployment, merge, rebase, upstream changes or 01F work.
Original mochi/settings WIP, Pocket Power and Kitty's installed checkout are preserved.
