# MOCHI-DESKTOP-01C — Dedicated window host

Status: source implementation with targeted simulated verification. Not fully verified, built or install-ready.

Starting branch `codex/mochi-desktop-01b-base-review` was clean at `89deee22304e2a066dee64d3eb0f05cbf664ce36`. Its completed 01B shared-session implementation is the sole owner used here. Original `mochi`/settings WIP, Pocket Power and upstream branches were not merged or edited.

## Host inspection and implementation

Inspected actual local Lumiverse APIs:

- `frontend/src/lib/spindle/placement-helper.ts`, `createFloatWidgetHandle`: `moveTo`, `getPosition`, `setSize`, `setVisible`, `destroy`, `onDragEnd`, bounded host geometry and explicit `persistGeometry:false`.
- `frontend/src/lib/spindle/frontend-context.ts`, `createFrontendGeometryAPI`: `layoutViewportSize()` returns layout coordinates; `createResizeController(element, options)` binds the first configured handle, finds `[data-resize-handle="se"]`, accepts bounds/change/commit callbacks and returns a cleanup function.
- `frontend/src/components/spindle/SpindleFloatWidget.tsx`: host drag starts on bubbling pointerdown across non-editable content, respects resize markers, cancels active drag on hide, and clamps movement. The window's event boundary lets only bare title-bar presses reach host drag; message/form/control presses stay inside the extension. Native host drag supplies scale/capture/slop behavior; no custom drag controller was introduced.
- Existing `requestDockPanel` remains solely Pocket's existing compatibility presentation. No docking/fullscreen/maximize action is introduced for the dedicated window.

`src/mochi/window.ts` creates one lazy, chromeless floating widget through existing `ui_panels`, with native touch scrolling and no second host resize mechanism. The extension-owned southeast grip uses the inspected geometry resize controller; arrow keys resize in 16-layout-pixel increments. Initial target size is 560×720 at (64,64), with 320×420 minimum when the viewport permits. Placement/size are bounded to the current viewport with an 8-pixel inset, including on restore and viewport resize. Smaller viewports lower the minimum so the frame fits. Geometry persists in the live instance only; no new storage/schema or reload-persistent geometry is added.

The window reuses `createMochiWorkspace({session,...})`. A per-session WeakMap also deduplicates the window factory itself. A visibility callback hides the host widget when another surface takes the lease. A disposal callback removes the widget and its resize/drag/window listeners on session teardown. There is still one `MochiView`, one backend subscription, one generation owner and one active toast/read presenter.

The temporary **Mochi window** button in Pocket's portal navigation opens/restores this lazy instance. Existing **Open Mochi**, phone selection, portal navigation and handset routes remain available. Unsupported/missing geometry or denied float creation reports the limitation and opens the existing portal. No permissions were added.

## Lifecycle and compatibility

- Open activates the existing session's presentation lease; handoff hides the previous Mochi surface.
- Hide/title-bar close preserves account/room/view state and form/composer drafts; it cancels only the existing frontend-owned interactive request through `view.leave()`. No schedule cancellation command is sent.
- Restore reuses the same window/workspace/session, clamps retained geometry, and keeps unchanged form nodes.
- Portal/handset takeover hides the window through the lease; reopening reverses the handoff without another live view or backend subscription.
- Session identity teardown disposes the window and listeners. The inherited 01B host identity-hook limitation remains: silent real-user changes retaining a context still require authoritative host wiring/verification.
- Host chrome context-menu hiding is suppressed inside this surface so ordinary user close follows the session cancellation path. No host visibility-change callback exists on the inspected float handle; externally forced placement hiding remains a live-host verification concern. Read policy still requires connected/visible workspace content.
- `createMochiWorkspace` API version 1 is retained. Additive options are `onVisibilityChange` and `onDispose`; transport may be omitted when an explicit authenticated session is supplied. Omitting both fails immediately. Existing transport callers remain supported.

## Limitations

The installed published `lumiverse-spindle-types` geometry signature is older than the actual local host's options/cleanup API. A narrow, documented structural type plus runtime checks isolates that mismatch; old hosts without the inspected geometry methods fall back to the portal. No undocumented drag handle, visibility subscription or workspace-maximize API is assumed.

Viewport containment does not promise avoidance of sidebars or reserved host workspace regions. Safe maximize, saved geometry across reload, final sidebar entry, two-column layout and new theming remain deferred. Real pointer/touch capture, UI zoom, native host external-hide controls, focus, scrolling, mobile layout and authentication must be checked in an actual host before installation. No actual floating-window browser test was performed.

## Verification

Tests ran sequentially with JSDOM/synthetic transports and mocked inspected host handles:

- `bun test --timeout 5000 tests/mochi-window.test.ts`: **5 pass, 48 assertions**. Covers portal/window entry and handoff, deduplicated window/backend owner, room/composer/settings retention, interactive-only cancellation, title-bar drag event boundary, resize/keyboard grip, viewport-clamped restoration, cleanup and unsupported-host fallback.
- `bun test --timeout 5000 tests/mochi-session.test.ts`: **9 pass, 66 assertions**. Covers ownership/read/toast isolation, metadata cancellation, private-state teardown and dirty configuration.
- `bun test --timeout 5000 tests/portal.test.ts`: **5 pass, 63 assertions**. Covers Kitty portal, profile navigation, room settings and model/source behavior.

Final unique total: **19 pass, 177 assertions**. An initial window fixture needed the existing scoped state refresh to leave startup selection; after correcting that fixture, all final checks passed. Lightweight Git whitespace/scope checks passed.

Not run: typecheck, production build, full suite/contracts, Chromium or full visual baselines, real providers or live Lumiverse. Tracked dist bundles remain unchanged at 01B-BASE and contain neither 01B nor this window implementation. Do not install this source checkpoint expecting the window.

## Changed files and next step

- `src/mochi/window.ts`: supported host window and geometry lifecycle.
- `src/mochi/workspace.ts`: additive visibility/disposal integration and explicit-session-only acquisition.
- `src/frontend/controller.ts`: lazy window wiring and safe portal fallback.
- `src/frontend/components/portal.ts`: temporary functional window entry.
- `tests/mochi-window.test.ts`: targeted window/session regressions.
- `MOCHI-DESKTOP-01C.md`: this report.

Backend/service/scheduler/storage/provider/account/profile/model code, manifest, dependencies, approved chat renderer and built bundles were not changed. No push, deployment or installation occurred.

Stop for review. The source foundation for 01D is present, but approve sequential typecheck/build and a focused real-host window check before relying on drag/resize/mobile behavior or undertaking the final layout redesign. Original portal remains the rollback presentation; original branches remain recovery points.
