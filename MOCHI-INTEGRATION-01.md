# MOCHI-INTEGRATION-01 — Pocket shell boundary and Kitty handoff

Baseline: local `mochi`, `735afd7fe32a03bf94b3f9bfaed90dad249d9380`. BUG-02 (`9259afc`) and BUG-03 (`735afd7`) are confirmed ancestors and their regressions remain included.

**Ready on Mochi's side:** a versioned independent workspace adapter using the existing approved UI. **Still Kitty's work:** sidebar registration, shell route/container ownership, presentation controls and authenticated-session lifecycle wiring. No sidebar button or automatic workspace launch was added to the current installation.

## Existing architecture

- `src/mochi/view.ts` renders the existing account picker, profiles, inbox, direct/group rooms, settings, message actions and composer. It already accepts launch without a phone and has account-wide startup selection. Approved `src/mochi/styles.ts`, branding, bubbles and composer styling are unchanged.
- `src/mochi/service.ts` authenticates operations with the backend callback's real user, validates fictional account/room scope, persists independent histories/snapshots/jobs/notifications, and uses the selected room's sources. `src/mochi/generation.ts` uses Pocket's lower-level provider helper and token safeguards without the RP Messages path.
- `src/backend.ts:77–80` creates the service and starts the existing server scheduler at backend initialization. `handleFrontend()` routes `mochi:*` before native RP context resolution. Scheduling, background discovery, quotas, provider access, expiry windows and generation receipts are unchanged by this milestone.
- The existing phone entry (`PhoneController.openPocket()` in `src/frontend/controller.ts`) still passes a validated device identity where available and belongs to the phone router. This compatibility entry was deliberately not removed or repurposed.

## Implemented boundary

Import `createMochiWorkspace` from `src/mochi/workspace.ts`; it is also exported by `src/frontend.ts` / the built frontend module. This is an internal Pocket module API, not a new global, event-bus command, sidebar registration or cross-extension discovery API.

```ts
import { createMochiWorkspace } from './mochi/workspace.js'

const mochiWorkspace = createMochiWorkspace({
  root: existingPocketWorkspaceRoot, // Dedicated shell container, mounted before open.
  transport: ctx,                   // Existing authenticated Spindle context.
  notificationPolicy: () => ({
    enabled: pocketPreferences.notifyMessages,
    previews: pocketPreferences.notificationPreviews,
  }),
})

// Kitty connects these calls to her existing shell's lifecycle/navigation:
mochiWorkspace.open()             // First open applies account-wide startup policy.
mochiWorkspace.close()            // Hide when another shell workspace becomes active.
mochiWorkspace.open()             // Return: retain account, room, forms and composer.
mochiWorkspace.refresh()          // After same-user reconnect/manual refresh; retain drafts.
mochiWorkspace.openRoom(roomId)   // Returns false for unloaded/foreign-account rooms.
mochiWorkspace.destroy()          // Logout, real-user change, extension teardown; once per instance.
```

`apiVersion` is `1`; `isOpen` reflects the adapter's lifecycle. Create one instance per authenticated shell session and keep it across RP chat/device changes. The adapter creates/removes only its own section inside the supplied root, subscribes once through `ctx.onBackendMessage`, and sends through `ctx.sendToBackend`. These transport methods are documented in installed `lumiverse-spindle-types` and implemented in the inspected Lumiverse `frontend/src/lib/spindle/loader.ts`. No active-chat, phone, persona-following, RP event or native Messages API is requested.

`openRoom()` intentionally does not look up a foreign/unloaded room or auto-switch accounts. Select the desired account through the existing picker, then navigate to a room loaded in that scope. On close, only this view's interactive generation is stopped using existing cancellation; accepted messages remain saved and durable scheduled/background work continues. Repeated open/close is idempotent. Hidden views retain scoped updates but do not mark messages read or show toasts. Returning to a visible chat uses the existing notification acknowledgment path.

`refresh()` performs an account-scoped room reload without resetting forms. An actual concurrent room change can still cause the existing stale-revision check on a later Save; this is intentional data protection. A new real-user session must destroy/recreate the adapter rather than reuse cached private state. Kitty must wire that boundary to the shell's actual authentication teardown; the adapter is not an authentication service.

If the host has already deactivated the transport, cancellation can be rejected and teardown may report that error. `destroy()` still removes owned DOM/subscriptions and clears view timers through finally-cleanup; it does not retry a request or change server generation behavior.

## Identity and data safety

Workspace requests carry no `phone`, `chatId`, RP `characterId` or caller-chosen real user ID. They use the existing fictional-account bank's global `selectedAccountId` and `startupPreference` (last-used or always-ask). Existing per-phone preferences remain stored and unchanged; the phone compatibility entry keeps its established selection behavior. The old phone-unavailable fallback shares global preferences, so Kitty should decide whether/how to keep that compatibility entry discoverable once the sidebar is live.

Rooms remain under authenticated real-user `userStorage` at `mochi/v1/rooms/<roomId>.json`, with fictional ownership in `room.accountId`. Profiles remain `mochi/v1/fictional-accounts.json`; real-user scheduler settings remain `mochi/v1/scheduler.json`, with durable discovery in extension storage `mochi/v1/scheduler-accounts.json`. No migration, account assignment, reset, room merge, schema change or native phone-storage write is performed by launch/return.

Only the selected room's messages, configured character sources, stable persona snapshot and explicit settings enter generation. A shell-level launch does not enable autonomy, change quotas, import RP context or change provider selection. The host's real-user callback continues to enforce ownership.

## Responsive and expanded presentation

The same `MochiView` fills the shell-provided root at 320/390px mobile and expanded 900px desktop widths. The adapter adds container sizing only: width/height 100%, min-size zero and controlled overflow. There is no second chat UI, handset aspect-ratio requirement, full-theme editor or browser Fullscreen API request. Pocket's existing `PHONE_STYLES` installation from frontend setup is still required for shared buttons/sheets; host theme variables are inherited without reading an RP phone appearance.

Kitty supplies a root with a definite height (or correctly constrained flex/grid ancestors), and owns shell show/hide, focus return, Escape/back controls, viewport/safe-area allocation and sidebar routing. Provide the existing Pocket theme variables (`--lp-bg`, `--lp-text`, `--lp-border`, `--lp-muted`, `--lp-accent`) from the shell's shared theme so common sheets/controls inherit them; do not copy an RP phone's appearance. Call `close()` when hiding/routing away, then `open()` after remounting/showing the root. Do not recreate the adapter or clear its root on `CHAT_SWITCHED` or fictional phone changes.

An expanded container is implemented and tested; an actual native full-workspace/sidebar surface is **not yet wired**. Lumiverse also exposes `ctx.ui.mountApp({position:'app-overlay'})`, but inspected `frontend-authority-map.ts:192` gates it with `app_manipulation`, which this manifest does not declare. No overlay or new permission was added. Kitty should choose her existing shell container or explicitly agree on a supported overlay/permission strategy; do not assume a type declaration alone grants access.

## Backend and notification requirements for Kitty

- Keep the existing backend instance/service/scheduler alive independently of shell visibility. Do not instantiate another scheduler on open or stop it on close, RP changes or phone switches.
- Deliver account-targeted backend messages through the existing authenticated transport, including BUG-03 scheduling updates; deploy matching source/frontend bundle versions when separately approved. After a same-user reconnect, call `refresh()`; after logout/real-user change, destroy/recreate instead.
- Supply real Pocket notification/privacy preferences to the getter. No new browser/OS notification channel is created. Keep one active Mochi workspace/toast owner; if the phone entry remains available concurrently, coordinate visibility/toast routing to avoid two visual surfaces for the same account. Shared backend room locks and quotas still prevent overlapping generation, but the adapter does not invent a global shell ownership registry.

## Decisions remaining with Kitty

1. Which existing shell route and persistent root will the sidebar activate? How should back, close, focus return and mobile shell chrome work?
2. Should the old phone Mochi tile remain as compatibility access or route into this workspace? No native-phone route was changed here.
3. Which global Pocket preferences/theme surface should be passed, and which surface owns notifications when another workspace is active?
4. Confirm supported container/dock APIs and authentication/reconnect teardown on Kitty's installed Lumiverse version. No upstream API, overlay permission, new sidebar architecture or real-user lifecycle event name was assumed.

No work on Dry Run, prompt presets/macros, summary markers, RP linking/imports, or scheduling redesign is included.

## Verification and changed files

Simulated verification: full `bun run verify` passed type checks, builds, **293 tests / 1,779 assertions**, and Pocket contracts. Ten new workspace cases cover independent launch/selection, repeated lifecycle, account/legacy isolation, draft retention, close cancellation, hidden scheduled notifications and real-user/inactive-transport teardown. Existing BUG-02/03, accounts, generation and scheduling regressions also pass. Chromium **149.0.7827.55** passed at **320/390/900px** using the actual adapter and views. Expanded desktop, mobile, Send/Enter/Shift+Enter, account navigation and reconnect/refresh drafts are checked; inherited light/dark renderings were captured. All data/providers are synthetic, not a live Lumiverse/sidebar/browser-closed server test. Screenshots remain ignored at `tmp/mochi-final-ui-review/workspace-{320|390|900}.png` and `workspace-light-{320|390|900}.png`.

Changed files: `src/mochi/workspace.ts`, `src/frontend.ts` (export only; existing setup unchanged), `src/mochi/view.ts` (retained-view read acknowledgment and safe timer cleanup on teardown), `tests/mochi-workspace.test.ts`, `scripts/check-mochi-workspace-ui.mjs`, `scripts/check-mochi-ui.mjs`, `package.json`, matching `dist/frontend.js`, and this document. Native phone controller, backend/services/scheduler/provider code, schemas, approved chat CSS and backend bundle are unchanged.

The standard visual-baseline suite's required headless browser remains unavailable; it is blocked, not passing, and baselines were not modified. Actual sidebar/root behavior, authentication teardown, native shell focus/chrome and Ubuntu browser-closed execution require a controlled live integration check after Kitty's wiring. BUG-03B's live identical-response diagnosis still needs its own provider/occurrence evidence; no content workaround was added here.

Local commit only: no push, deployment, rebase, force-push, upstream/main edit or real Lumiverse data access.
