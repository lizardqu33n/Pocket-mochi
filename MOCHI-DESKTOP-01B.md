# MOCHI-DESKTOP-01B — Shared frontend session ownership

Status: source implementation with targeted simulated verification; **not fully verified or install-ready**.

Baseline: isolated `codex/mochi-desktop-01b-base-review`, commit `1e753ed02ec9c33070449b1a6505a15e4328cb61`, containing Kitty's pinned `a02b5faf7ffccb68df10f595f9fba67b626a3e39` integration. Original `mochi` and recovery/WIP `9e5267664a99e14ec6bc41db75133bedc830e91e` remain untouched.

## Ownership boundary

`getMochiSession(transport)` returns the sole owner for the original authenticated context's transport method pair. Transparent `Pick` objects using those original methods share ownership. The session constructor is private. Only this owner constructs `MochiView` and subscribes to backend messages.

Pocket's existing controller now acquires that owner and attaches its existing portal/handset presentation as a surface. Native `lumiphone:*` messages are forwarded to Pocket's existing handler through the owner; Mochi events are consumed once by the shared view. No native generation/storage logic or RP context assembly was changed.

An exclusive presentation lease controls navigation, read policy and toast presentation. A compatibility workspace acquires the same owner instead of creating another view/listener. Handoff hides the previous Mochi surface and cancels only its interactive request, preserving the shared account/room/composer/settings state. The old native phone remains a separate controller and presentation.

## Lifecycle

- First activation applies the existing account startup choice once. Repeat open/hide/restore does not reset the account or discard drafts.
- Workspace close releases presentation and cancels the interactive request; retained form nodes and drafts survive. Pending durable jobs are not canceled by this frontend action.
- Pocket close/dock hide uses existing interactive cancellation. Its notification presenter retains the original shared-Pocket preference behavior while normal native phone navigation remains independent.
- Same-user `refresh()` reloads scoped state without resetting drafts; stale revision errors remain protective. RP/phone events never become authentication changes.
- Fictional-account switching remains in the existing view and keeps Kitty's navigation/dirty-form guards. It does not replace the real-user owner.
- Read policy requires a genuinely open conversation rather than a visible profile/settings screen. Hidden/inactive surfaces never acknowledge records or create a second toast.
- Context teardown destroys the view, aborts model metadata controllers, clears metadata/profile/account/history/composer caches, closes owned sheets, removes surfaces and unsubscribes. Cleanup completes even if cancellation transport is inactive. Repeated teardown is idempotent.
- `authenticatedIdentityChanged(owner)` is a **trusted host hook**, not a backend/user-payload identity override. Same owner refreshes; null/different owner destroys without sending old-account cancellation through a new user's transport.
- An authoritative real-owner mismatch in `mochi:accounts` or owned room state fails closed before replacing cached state. The inspected `lumiverse:auth-session-invalid` host event also disposes private state. Network outages and RP changes do not trigger that event-based destruction.

## Authentication compatibility limit

The inspected extension API does not expose a real-user identity selector or dedicated identity-change subscription. No undocumented selector/event was invented. Production automatic cleanup relies on the host invoking frontend teardown or the inspected auth-invalidation event; the explicit identity hook is available to the shell for other transitions.

**A silent real-user switch that retains the same context, invokes no teardown/hook and sends no owner-bearing response cannot be proven safe by these tests.** Kitty/Lumiverse must wire/validate that boundary before live rollout. Same-user reconnect should call `session.refresh()`; no undocumented reconnect event is assumed. These are host integration requirements, not claims of completed live verification.

## Workspace API compatibility

`createMochiWorkspace`, `apiVersion: 1`, and its open/close/refresh/openRoom/destroy methods remain. `session?: MochiSession` is an additive option for intentional transport wrappers. Pass the original context methods, or explicitly pass the already-acquired session; arbitrary rebinding/wrapping is a distinct registry identity and cannot safely stand in for the original context.

Opening another surface transfers the lease instead of rendering a competing client. `isOpen` becomes false on the displaced workspace. Destroying one workspace only detaches its surface while Pocket/other surfaces remain. Last-surface teardown ends a standalone session. Reusing a destroyed authenticated context is rejected; fresh authentication requires a fresh host context. `getMochiSession` and its type are also exported from the frontend entry.

## Files changed

- `src/mochi/session.ts`: session registry, single event dispatcher, surface lease and identity teardown.
- `src/mochi/workspace.ts`: API-v1 compatibility surface backed by that owner.
- `src/frontend/controller.ts`: portal/handset acquisition, native forwarding, visibility/cleanup wiring.
- `src/frontend.ts`: additive session factory/type export.
- `src/mochi/view.ts`: idempotent private-state disposal, late-event guards, cancellation deduplication and conversation read visibility.
- `tests/mochi-session.test.ts`: ownership, handoff, unread, draft, identity and cleanup regressions.
- `package.json`: targeted session-test command and inclusion in future standard test scripts.
- `MOCHI-DESKTOP-01B.md`: this report.

## Targeted verification

All tests ran sequentially with synthetic state/providers; no browser, full suite or build was launched.

- `bun test --timeout 5000 tests/mochi-session.test.ts`: **9 pass / 66 assertions**.
- `bun test --timeout 5000 --test-name-pattern 'workspace|close/return|inactive transport' tests/mochi-workspace.test.ts`: **9 pass / 79 assertions**, unrelated registered cases filtered out.
- `bun test --timeout 5000 tests/portal.test.ts`: **5 pass / 63 assertions**.

Total unique selected checks: **23 pass, 208 assertions, no failures in final runs**. Initial new fixture failures were corrected to navigate through the real legacy-chat picker path. New-session tests were rerun after implementation adjustments. A lightweight Git diff check passed.

Covered: original-method picks share a listener/view; native event routing; portal/workspace handoff; one cancellation/toast/read owner; retained account/room/composer/settings state; hidden and profile-screen unread behavior; same-owner refresh; logout/foreign-owner rejection; metadata abortion/private cache disposal; stale events; inactive transport; Kitty profile/model/dirty-form behavior.

Not run: typecheck, source build, full Pocket/Mochi regressions/contracts, Chromium, mobile/layout/focus checks in a real host, providers, actual logout/reconnect wiring or Ubuntu tests. **Built bundles remain at the approved 01B-BASE snapshot and do not include this source checkpoint.** Do not install this commit expecting the new ownership code until a separately approved build and verification.

Backend/service/scheduler/storage/schema/quotas/provider helpers, BUG-02/03 files, profile/model components, CSS and branding were not changed. No desktop window, new sidebar icon, settings redesign, themes, clocks or RP linking were added.

## Next approval

Review the source checkpoint first. Request a single typecheck before heavier checks; then approve builds/contracts/browser checks in separate sequential batches. Confirm the trusted auth/context lifecycle with Kitty. The owner is the intended foundation for 01C, but production auth wiring and controller integration still need validation before a live desktop-window rollout. Original WIP remains a recovery point; no promotion to `mochi`, push or deployment occurred.
