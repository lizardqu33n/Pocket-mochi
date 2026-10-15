# MOCHI-MOBILE-03 — Dismiss the redundant Pocket drawer

2026-10-15. Local base/unchanged HEAD: `4927b63034e2389bc359a856790fcf15ca770b10`, branch `codex/mochi-desktop-01b-base-review`. The user reports real Android fullscreen RC3 works; the blank underlying Pocket drawer is the new issue. This is a new **uncommitted, unpublished RC4 drawer-handoff candidate**, not a rewrite of RC3.

## Confirmed root cause and supported mechanism

`src/mochi/mobile-surface.ts`, `open()`, moves the existing `.mochi-sidebar` subtree from the Pocket portal into a separate host fullscreen float widget and leaves a return placeholder. RC3's `src/mochi/sidebar.ts`, `present()`, activated that workspace but never dismissed the original host drawer. Moving extension content does not close the host drawer; its `drawerOpen` state remains true. That explains the empty portal/sidebar remaining behind the functioning messenger.

The existing registered drawer handle exposes activate/destroy, not close. Destroying it is unnecessary and would remove Pocket's navigation contribution. Public frontend host-surface invocation also does not map a drawer-close action in the inspected host.

Pocket already has the appropriate supported bridge:

1. `src/frontend/controller.ts`, existing native mobile Mochi route, sends `mochi:open_shell`.
2. `src/backend.ts`, `handleFrontend()`, already handles that message before Mochi service dispatch: if the trusted frontend `userId` is present, it calls **`spindle.ui.closeDrawer({userId})`**. No user ID is accepted from the payload for this operation.
3. Host `src/spindle/worker-runtime.ts`, `ui.closeDrawer()`, submits the supported `ui_navigate / close_drawer` request.
4. Host `worker-host-presentation-api.ts`, `handleUINavigate()`, resolves/enforces the target user and emits the host navigation event to that user.
5. Host `frontend/src/ws/useWebSocket.ts`, `SPINDLE_UI_NAVIGATE` handler, invokes `spindleUiActionRuntime.closeDrawer()`.
6. Host `frontend/src/store/slices/ui.ts`, `closeDrawer()`, changes only `drawerOpen:false`. `ViewportDrawer.tsx` retains its drawer/tab content and changes its open styling; it does not destroy the extension/session. `placement-helper.ts` only calls activation listeners on tab changes, not on this drawer-open flag.

These paths were inspected read-only in local Lumiverse host commit `b1a68d9e32e2a2480a0d5ae71422566845f2657b`. They are source evidence, not a direct inspection of the deployed Android/server runtime. Existing backend code and permissions were sufficient; no host or backend modification was needed.

## Narrow fix

`createMochiSidebar()` now accepts an optional fifth callback, `dismissDrawer`. Pocket supplies the existing `ctx.sendToBackend({type:'mochi:open_shell'})` bridge.

The callback runs only after a newly opened mobile fullscreen surface has moved the content, activated its existing workspace and rendered it. It does not run on desktop entry, embedded unsupported-fullscreen fallback, or ordinary in-app room/Back/details navigation. Reopening after Close sends one new close request. Existing callers omitting the optional callback remain compatible.

The callback does not hide/destroy the workspace, unregister the drawer, reset selection, or cancel generation. In-app Back still returns to the room list in the fullscreen app. Explicit Close retains its original generation/summary warning, restores the navigation subtree/account picker into the now-closed drawer, and keeps drafts in the existing session. Native Pocket can be opened independently afterward.

No global CSS, host DOM close-button simulation, private store access, browser-history interception, session duplication, new UI controls or layout changes were added.

## Exact changed files

- `src/frontend/controller.ts` — wire the existing supported close message into the sidebar callback.
- `src/mochi/sidebar.ts` — optional callback after a successful newly opened mobile handoff; preserve the full surface if a synchronous callback failure occurs.
- `tests/mochi-sidebar.test.ts` — drawer-close lifecycle, ownership, selected chat/thread/draft/generation retention, Back, Close/reopen, native Pocket and desktop/fallback tests.
- `tests/pocket-power.test.ts` — extend its existing backend fixture with the host close stub and a regression proving the real unchanged close handler uses the authenticated user and leaves storage untouched.
- `dist/frontend.js` — matching rebuilt frontend.
- `MOCHI-MOBILE-03-CANDIDATE.json` — explicit new local revision/provenance/hash record.
- `MOCHI-MOBILE-03.md` — this report.

Backend source/runtime, mobile shell implementation, workspace/session, desktop window/launcher, both original artwork assets, manifest/identity/permissions and data schemas remain unchanged. Existing untracked publication receipts are untouched. No staging or commits were performed.

## Very small sequential verification

- New drawer handoff and unsupported/failed bridge lifecycle checks: **2 passed, 29 assertions**.
- Existing mobile Open/Close/details/Back/draft/summary/reply warning, desktop floating launcher and native Pocket rail checks: **3 passed, 51 assertions**.
- Existing Power regressions plus the close bridge against the rebuilt backend: **7 passed, 42 assertions**.
- Total: **12 passed, 0 failed, 122 assertions**.
- One TypeScript typecheck passed.
- One production build passed, backend then frontend. Backend bytes are unchanged.
- Compiled frontend contains the existing close-message connection and the safe manual-close failure notice. CRLF-aware diff checks pass.

The lifecycle test simulates the asynchronous host close by hiding the original portal ancestor after selecting a conversation. The fullscreen root remains outside that ancestor, with the same session listener, room, thread/composer nodes, draft and pending generation. Closing the drawer sends no cancellation or storage operation. Explicit Close restores a populated picker into the closed drawer rather than leaving a blank visible surface.

The backend test executes the actual existing handler, including a forged payload user ID and unauthenticated call: only the trusted authenticated user is targeted, and stored room/job/phone data are unchanged. These are synthetic source/API/JSDOM checks; no actual Android/browser acceptance or server request was performed.

One filtered regression process took approximately 22 seconds wall time, although its three test bodies totaled about 1.4 seconds; it completed successfully. No full/parallel suite, Chromium, host startup or profiling was run. All verification was sequential.

## Runtime and recovery

- Frontend SHA-256: `764BCA8E9D5F7C4C8A62EECD72391105D4FB3FC7090986A3B21F7F00954F8915`.
- Backend SHA-256: `FB2478EE6AB4B004955CAF046681A82253B73BE6D16C8609936DEEC67AC329B6` (unchanged).
- Current source fingerprint: `53F596A9361C598FF7ECDCCD9A456A37675EA8F512E0AAC4D0E89372AC341A17`.
- Compatible RC3 pair and candidate metadata preserved in ignored `tmp/mochi-mobile-03-before/`; recovery frontend is `3A14C1FE899FDF48D6CC339F00E11583AA66FD44EF163A5D4254A650513B671B`, with the same backend above.

Remote heads were checked before editing: RC3 remains `4927b63034e2389bc359a856790fcf15ca770b10` at `beta/mochi-mobile-rc3`; RC2 remains `b71abd1f023f62b08906fd3cc47af2b258899525` at `beta/mochi-closed-beta1-rc2`. Neither was changed. Old candidate metadata, release archives and backups are preserved. No new package/publication was made.

## Unsupported hosts and remaining Android checks

If fullscreen cannot open, keep the existing embedded fallback and **do not dismiss the drawer**. If the optional callback is absent, no host close is attempted; an older/custom integration can leave the drawer for manual closure. If the callback throws synchronously, Mochi remains open and shows “Close the Pocket drawer manually.” No unsafe fallback is used.

The reused bridge is asynchronous and has no frontend completion acknowledgment. A host which ignores/rejects the server-delivered close event cannot be reliably detected here without a new contract. The messenger still remains usable, and the user can close the Pocket drawer manually. The API targets the authenticated **user**, not a specific browser connection; behavior across multiple simultaneous sessions of that same real user should also be checked. This is an existing host-API scope, not a new session-targeting guarantee.

After separate approval to update the intended test installation with the matching candidate pair, verify on Android:

1. From Pocket's drawer/account picker, open fullscreen Mochi and choose a conversation. The Pocket drawer should close after the transition, while that chat remains visible and usable.
2. Enter a draft; scroll history; use Details and in-app Back. Back returns to Mochi's list without reopening Pocket's drawer. Opening another room should not send another drawer-close transition.
3. With an interactive reply or summary pending, verify automatic drawer closure does not cancel it. Explicit Close should still warn; Stay keeps the task.
4. Close fullscreen Mochi: no blank drawer should be exposed. Reopen it and confirm selection/draft behavior, then open native Pocket independently and verify Messages/Power.
5. Check desktop window/launcher operation, any same-user second browser/tab, and the deployed host's actual delivery/animation timing. A brief delay is possible because the supported close is server-delivered.

Real Android drawer-fix acceptance remains pending. The user's prior fullscreen success is retained as prior evidence, not acceptance of this new revision. Existing same-browser real-user authentication-transition limitations are unchanged.

No push, force-push, commit, deployment, install, host restart, data operation, Ubuntu access or upstream modification occurred. Ready for review and separately approved phone-test publication.
