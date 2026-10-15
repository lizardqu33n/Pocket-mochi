# MOCHI-BETA-AUTH-INVESTIGATION

2026-10-13 — read-only authentication investigation and locally available Pocket compatibility review.

**Conclusion:** existing Spindle teardown and generation-invalidation infrastructure can be reused, but no supported authenticated-principal signal or guaranteed pre-transition extension disposal was found. A small general Lumiverse host lifecycle integration is needed; a Mochi-only identity detector is insufficient. Beta remains blocked. This report is a proposal, not an implemented security fix or live reproduction.

Only this report was created. No source, runtime bundles, configuration, installed extension, account/authentication files, credentials, private chats or synthetic test data were changed. No tests, builds, network fetches, browser/host startup, screenshots, provider calls, installation, commits or deployment were performed.

## 1. Identified local versions and runtime inputs

| Item | Evidence |
|---|---|
| Mochi development | `<mochi-review-checkout>`, branch `codex/mochi-desktop-01b-base-review`, HEAD `c3e036d02f500bfd00c2c6326d1245ee63353714`; clean before this report. Runtime source/bundle checkpoint remains `08de2db47ab3384bfee7a0280d7a52634f553663`. |
| Local Lumiverse source/install checkout | `<lumiverse-host-checkout>`, HEAD `b1a68d9e32e2a2480a0d5ae71422566845f2657b`, commit subject “Merge staging into main for 1.2.5 release”, committed 2026-10-09. Backend and frontend package versions both `1.2.5`; tracked working tree clean. |
| Regular Windows launcher | That checkout's `start.ps1` runs `bun src/index.ts` (or watch variant) and sets `FRONTEND_DIR` to the chosen frontend's `dist`. These are source/default-launcher findings, not inspection of a currently running process or its environment. No `.env` or account files were opened. |
| Disposable launcher | `Pocket-mochi-01b-base-review/tmp/start-mochi-01d-test.ps1` explicitly uses the same root's `src/index.ts` and `frontend/dist`, with separate working/data directory `tmp/01d-local-host/data` and port 7861. The launcher was read, not executed. The data directory was not inspected. |
| Prebuilt frontend runtime input | `<lumiverse-host-checkout>/frontend/dist/index.html` references `main-CfchXHnW.js` and `global-D2sLGjI8.js`, with build ID `lumiverse-1791573069267`. Index/global assets are tracked and unchanged at the inspected host commit. They are separate compiled artifacts, not the TypeScript source running directly in a browser. No rebuild/source reproducibility or currently served/browser-cached asset identity is claimed. |
| Types actually installed | Host `node_modules/lumiverse-spindle-types`: **0.6.40**. Mochi checkout's installed types: **0.6.32** (its dependency range is older than the installed resolution). Both expose optional `ctx.onTeardown` and V2's required equivalent. These are package metadata/declarations, not runtime feature negotiation. |

Frontend input hashes:

- Host `frontend/dist/index.html`: `820009368AAC005F77586770E97AAF7FF68A5B96ACCC45E7C7BA314B4ECDE8F6`.
- Host `frontend/dist/assets/global-D2sLGjI8.js`: `70E9AFB99128A49EAB8F2B850327EE7F05197DE3B219EF62F398527DDD77B5F8`.
- Mochi frontend remains `1D112A107176EBB01A04D5B5BE14B900C2BFA49C9CC8E15DF61F91053A2CCE92`; backend remains `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B`.

The host global asset contains `onTeardown`, `SPINDLE_FRONTEND_INACTIVE`, the expired-session event and `frontend-session-origin-v1` markers. Presence confirms relevant mechanisms in that public build; it does not prove identity-transition ordering. No source/runtime mismatch was demonstrated for these tracked local inputs. The exact currently running regular Windows instance, any launcher overrides/browser cache, and Ubuntu's installed version remain unverified. A future patch must target the identified host source and rebuild its frontend with explicit approval, then verify what the disposable browser actually loads.

## 2. Authentication and extension lifecycle trace

Host paths below are relative to `<lumiverse-host-checkout>`; extension paths are relative to the Mochi development checkout.

### Authoritative authentication changes

- `frontend/src/store/slices/auth.ts:login`: starts a mutation generation, awaits Better Auth sign-in, ignores superseded results, then resets user-scoped host state and publishes the returned user/session. There is no extension-auth barrier or loader disposal at that point. Login/SSO helpers in `components/auth/LoginPage.tsx` navigate/check the authoritative session; they do not create a general extension lifecycle hook.
- `auth.ts:logout`: invalidates pending auth checks, resets host user state, publishes null user/unauthenticated state, then signs out. No guaranteed pre-publication extension disposal appears here.
- `auth.ts:checkSession`: a current successful response establishes the user. If A differs from B it resets host state, then publishes B with `isAuthenticated: true`. A successful empty session clears identity; an established-session network error retains identity. These distinctions must survive any fix.
- `frontend/src/store/user-scoped-reset.ts:resetUserScopedStoreState` clears settings/preset/chat-head/landing state and resets non-auth store fields. It does not dispose `loadedExtensions` or Mochi's module-owned private maps.
- `frontend/src/hooks/useAppInit.ts` tracks user ID and bootstrap generation, rejecting stale bootstrap application. That guards its own bootstrap data, not every extension list/manifest fetch or frontend module.
- `frontend/src/api/client.ts` recognizes an authoritative `401/SESSION_EXPIRED` through `api/session-lifecycle.ts` and emits `lumiverse:auth-session-invalid`. `AuthGuard` rechecks the session. Mochi listens to this event and clears its session, but this is not a signal for every successful A→B transition.

### Important existing React protection, and its limits

`frontend/src/App.tsx` normally renders `Application` inside `AuthGuard` and `ActiveTabGuard`. `ActiveTabGuard.tsx` compares `readyUser` to the store's user ID; a changed ID temporarily makes its children null before its effect claims the new user's active tab. Thus the main Application can unmount/remount even when `isAuthenticated` stays true. Logout also removes authenticated Application children.

This is stronger than simply assuming all main-app effects continue across silent switches. It normally runs `useWebSocket`'s disconnect cleanup. **It still does not dispose the retained Spindle module/context.** `activeTab.ts:claim` releases listeners on cleanup; it does not abort the document's `activeTab.signal` on identity replacement. That signal aborts for loss of active-tab ownership, a different condition. One-tab enforcement is configurable and is not an identity-security contract.

Host float-widget placements are registered in host store state by `lib/spindle/placement-helper.ts:createFloatWidgetHandle`; store reset/React unmount may remove their rendered host wrappers. This can temporarily hide UI, but it does not clear the extension's retained room/profile/draft/editor state or invalidate every existing handle/callback. There is no source-backed guarantee that A's caches cannot be reused when B's host UI becomes usable.

Native desktop pop-out documents are a distinct route: `App.tsx` skips `ActiveTabGuard` there, and `ws/useDesktopWidgetRuntime.ts` has a target-bound lifecycle effect with cleanup/unload, not a general user-ID dependency. Do not equate Mochi's in-app floating window (`ctx.ui.createFloatWidget`) with a separate native pop-out document. A general host fix should cover both execution routes.

### Existing loader teardown infrastructure

- `frontend/src/lib/spindle/loader.ts:loadFrontendExtension` returns early for an unchanged manifest signature. Its generation is per extension load, not authenticated user. Rehydration after reset can therefore reuse A's module and transport.
- Its `assertFrontendActive` checks active-tab state, loader generation, lifecycle flag and loaded-record identity. These are useful stale-generation guards but currently contain no principal/identity epoch.
- `unloadFrontendExtension` invalidates generation, pending startup/load/permission state and then invokes `loaded.cleanup`. `unloadAllFrontendExtensions` covers loaded and in-flight extensions; the inspected global automatic invocation is the active-tab abort listener, not all auth changes.
- `frontend-extension-cleanup.ts:createFrontendExtensionCleanup` sets cleanup idempotence, destroys placements/processes, runs teardown, drains subscriptions, cleans DOM/mounts and removes registries. Loader cleanup marks lifecycle inactive before extension teardown; returned setup cleanup and registered `onTeardown` handlers are supported, with stale async setup teardown handling.
- `placement-helper.ts:destroyAllPlacementsForExtension` purges generation-owned placements/root records. `loader.ts:cleanupRegistries` clears backend handlers, processes, resolvers, widgets, live roots, mobility and overrides, then deletes the loaded record.
- `loader.ts:routeBackendMessage/deliverBackendMessage` checks the currently loaded extension generation, but routing begins by extension ID. The startup queues and generation checks need a real-user scope barrier as well as a module-generation barrier.
- `store/slices/spindle.ts:loadExtensions` awaits a list, publishes it, then schedules manifest/frontend hydration. `lib/spindle/extension-load-flight.ts:shareExtensionLoad` shares one module-level promise. These operations are not keyed to authenticated identity. A list/manifest fetch begun before loader invalidation can reach the loader later; calling unload once alone does not close that race.

Mochi `src/frontend.ts:setup` already returns cleanup, which calls `setupPhone`'s controller destruction and removes styling. `frontend/controller.ts:destroy` invokes `mochiSession.destroy` and removes listeners/widgets. `mochi/session.ts` clears its single view, surfaces, observers, metadata requests and private caches. Therefore adding another `onTeardown` registration alone would not fix the missing invocation and could duplicate cleanup unless made idempotent. Reuse the existing returned cleanup first.

### WebSocket and server ownership

`frontend/src/ws/useWebSocket.ts`'s main connection effect depends on authentication/store, not user ID; its cleanup disconnects the client. The normal main-app guard remount often supplies that cleanup, but it should not be the sole general auth boundary, especially for retained modules/native pop-outs. `ws/client.ts:disconnect` abandons the old socket and timers; `send` uses the currently open singleton socket. An old retained extension context can otherwise send through a newly connected client's socket because its loader generation was not invalidated.

`src/ws/handler.ts:onOpen` authenticates the upgrade and captures the real user/session for that connection. `SPINDLE_BACKEND_MSG` uses that captured user and checks extension access; it does not trust a payload user ID. The server's CONNECTED payload includes user identity as well as role, while the frontend's extension-sync handler currently gates on role. Connection identity is not an early cached-UI teardown signal exposed to Mochi.

`src/spindle/frontend-session.ts` maps connections by **user ID + per-document frontend session ID**. `frontend/src/lib/frontend-session.ts` creates the document ID once, not once per user transition. This provides user-scoped delivery, not a client principal-change event or a per-authentication extension epoch. Do not reuse the document ID as if it proved unchanged user identity.

**Risk, not live reproduction:** depending on route/timing, A's retained extension cache or old callback can survive host reset and use a later connection/context. The evidence does not establish a live cross-user server read. Main-app unmount reduces exposure; it does not prove the required all-surfaces/pre-display invariant.

## 3. Available APIs and approach comparison

Reviewed host selector registry/authority map, Spindle declarations 0.6.32/0.6.40, frontend-context construction, local `developer-docs/docs/frontend-api/index.md` and backend-communication docs. Unknown selectors are fail-closed; no principal selector/auth-transition hook was found. Supported returned setup cleanup, optional `onTeardown`, generation revocation and process cleanup **do** exist. Process teardown, RP events and active-tab loss are not real-user switches.

| Approach | Exists? / handles silent A→B? | Timing, stale work and reconnect | Required boundary / Mochi-only feasibility |
|---|---|---|---|
| A. Supported principal API | No such API found. `onTeardown` exists but signals actual extension disposal, not identity change by itself. | No existing automatic early signal established; late owner responses cannot substitute. | Cannot solve with Mochi alone. An optional future official principal hook needs host approval and pre-transition semantics. |
| B. Reuse existing disposal | Loader cleanup/revocation is implemented; auth invocation is missing. | Once invoked early, existing guards reject old generations and remove roots. Identity-scoped hydration guards are also required. Same-user reconnect should not trigger disposal. | Preferred implementation basis; host edits required. Existing Mochi setup cleanup can remain. |
| C. Minimal official bridge | Proposed: host-owned identity epoch/transition barrier, optionally an extension callback. | Must revoke/hide before new principal UI or transport, clear stale bootstrap queues, and create fresh contexts. A post-store-change broadcast is too late. Outage/RP/profile events do not change epoch. | Host cooperation required; optional small Mochi adapter only after an official contract exists. No cookies/localStorage/private-store detector. |
| D. Host-owned teardown/reload | General extension teardown exists; mandatory auth-scoped teardown/recreation does not. Full document replacement is technically another host policy, not current guarantee. | Proper disposal before identity publication can protect all extensions. React remount alone retains module caches. A host-enforced document replacement needs an early gate and is heavier/lossier than loader reuse. | Prefer disposal/recreation through B + C's host barrier. Do not offer manual browser reload instructions as a fix. |

## 4. Preferred minimal patch boundaries — proposal only

Use a **general host-owned authentication epoch and disposal barrier** with existing extension cleanup. A new public user selector is unnecessary for the first fix.

1. Add a small internal lifecycle coordinator, e.g. proposed `frontend/src/lib/authenticated-frontend-lifecycle.ts`. It records an opaque principal and monotonic auth epoch, quiesces private extension surfaces/dispatch during a known transition, and coordinates registered host disposers. Keep it independent enough to avoid an auth-store→loader→store import cycle. This module/API does not exist yet.
2. In `store/slices/auth.ts:login/logout/checkSession`, enter the barrier before publishing a different/null identity or resetting user-owned state. Logout revokes synchronously; an authoritative changed/empty checkSession response does likewise. Preserve mutation/request-generation checks so stale auth responses cannot transition identity. A known sign-in transition must gate old private interaction during the asynchronous sign-in; reopening A on failure requires authoritative confirmation rather than assuming credentials stayed unchanged.
3. In `lib/spindle/loader.ts`, connect that barrier to existing synchronous generation invalidation and cleanup; include the auth epoch in load-in-flight/startup/delivery validity. Block new private setup/routing until the new identity is established. Revoke all old contexts first, remove every owned surface even if extension teardown throws, then clear their registries. Existing Promise-returning unload must not be mistaken for a pre-display guarantee unless its synchronous revocation/DOM phase and completion order are tested.
4. In `store/slices/spindle.ts:loadExtensions` and `extension-load-flight.ts`, bind list/retry/manifest/hydration work to the captured principal+epoch; ignore stale publication, cancel/discard delayed hydration and avoid sharing A's load flight with B. This is essential to prevent reactivation after the initial unload. Recheck ownership after each await/scheduled callback.
5. In `ws/useWebSocket.ts`, `ws/client.ts` and `ws/useDesktopWidgetRuntime.ts`, dispose/rebind connection ownership at the same barrier. Do not let A's context send through B's singleton socket. Preserve same-user reconnect/outage behavior and validate server acknowledgement against the intended principal before extension hydration. Document native pop-out handling; relying solely on `ActiveTabGuard` is insufficient.
6. Only then publish B's usable host UI and perform fresh extension setup with new transport functions/generation. Existing Mochi returned cleanup destroys its shared session; B obtains a new session through fresh transport keys. A delayed response must target/reject the old scope, not a new module sharing the extension ID. Keep scheduled backend jobs and stored data user-scoped and intact; do not cancel every user's durable jobs as a logout shortcut.

Required approval: a separately scoped **Lumiverse host authentication lifecycle fix**, covering these host files, targeted tests and one explicitly authorized host frontend rebuild. It must be coordinated with the maintainer because it protects all extensions. No host backend patch is yet justified solely by this investigation; first verify existing socket/session delivery boundaries in synthetic tests, expanding scope only for a demonstrated gap. Do not weaken server user/extension authorization.

Corresponding Mochi change: none necessarily required if supported unload reliably invokes the existing returned cleanup. A future official pre-transition callback could call the single session owner, but do not register duplicate destruction paths without idempotence tests. Owner envelopes may remain defense in depth, never the sole boundary. Host version/feature requirements must be documented before distributing a candidate that depends on this fix.

## 5. Security invariants and proposed acceptance

**Invariant:** before B's interface or authenticated transport becomes usable, A's extension contexts are revoked, private surfaces detached, caches cleared, owned listeners/timers/metadata requests disposed, and stale work unable to register or repopulate B's UI. A response owner is not permission to show cached A data. Same-user reconnect preserves appropriate in-session state; outage/RP/fictional-profile changes alone are not logout.

Proposed lightweight automated coverage (not run): extend `store/slices/auth.test.ts` for publication/disposal ordering and races; extend existing `lib/spindle/loader.lifecycle.*`/`frontend-extension-cleanup` tests for teardown-before-B, throwing cleanup, delayed setup/list/manifest/startup queue, old context sends and callback rejection; test identity-scoped extension-load flights and both WebSocket routes. Retain `active-tab` tests so one-tab policy is independent. Extend Mochi production-shaped owner-less fixtures to use the *real supported automatic invocation*, not just call `authenticatedIdentityChanged` directly. Existing known-gap tests remain evidence, not security passes.

Controlled disposable Windows acceptance requires separate approval, the approved host patch/build and matching Mochi bundles. Use synthetic users/rooms only, no production credentials or logs containing prompt text:

| Scenario | Required observation |
|---|---|
| Login A→B without page reload | Barrier removes A's room/account/profile/editor/window content before B is usable; fresh setup/transport/listener ownership for B. Include failed and superseded sign-in attempts. |
| Logout / expiry | Every private surface/cache is cleared, including hidden windows, floating shortcuts, drawer/profile and in-flight metadata; no confirmation dialog may postpone security teardown. |
| Silent successful checkSession A→B | Same result despite no unauthenticated interval. Test same extension/manifest and same role for both users. |
| Same-user reconnect / temporary outage | No false logout/cache purge; reconnect only resumes after correct principal acknowledgement; no extra provider requests. |
| Fictional profile / RP switch | Correct scope/drafts and intended cancellation, without changing authenticated identity epoch. |
| Delayed A list/manifest/setup/provider/result | No A content in B's sidebar/window/editor/toast; old context cannot send, render/re-register or consume B events. Check counters/opaque fixture IDs, not private text. |
| Hidden/visible and native pop-out surfaces | Main guard and independent document route both obey the barrier; focus/visibility cannot restore old content. |
| Backend delivery/storage | A/B room/provider/schedule/notification ownership stays separate; durable jobs are not deleted on client disposal. Closed old sockets/session keys cannot route A output to B. |

No live switching, host startup, account inspection or actual multi-user/privacy acceptance occurred here. No tests were rerun for this read-only checkpoint.

## 6. Additional Pocket upstream compatibility review — local evidence only

The shared local Git repository is `<lumiverse-host-checkout>/Pocket-mochi`; its review worktree is this checkout. `origin` is the user's `lizardqu33n/Pocket-mochi` fork; no Kitty remote is configured. The `kitty-review/*` remote-style refs were created by earlier explicit branch-only fetches. Kitty's installed data/repository was not opened or changed in this checkpoint.

- `refs/remotes/kitty-review/experimental-mochi-20261012`: `a02b5faf7ffccb68df10f595f9fba67b626a3e39`, fetched 2026-10-12 13:13:27 −05:00. Current integration baseline incorporated its selected source in local `1e753ed`, followed by shared-session/desktop/messaging/memory work; this was reconciliation, not a Git merge making a02 an ancestor.
- `refs/remotes/kitty-review/main-20261012-upstream-review`: `c7f839aa54ce21c3ceee01d5897795fa89f08d1a`, fetched 2026-10-12 14:19:06 −05:00.
- Fork `origin/mochi` cached ref remains `3ab196541b7285a468ec496262ae344cd476a468`; recovery `mochi` remains `9e5267664a99e14ec6bc41db75133bedc830e91e`, Power remains `8b16bdf0f945ac473eb1a25fd7e9f17554b4a248`.

No network recheck was authorized. These are **locally available snapshots**, not today's GitHub heads. More recent upstream updates may be absent. Fetching only `main` and `codex/experimental-mochi` into new review refs, without tags/submodules or working-branch changes, requires separate approval.

### Relevant commit list and history

The main-only updates beyond common base `5cd6ce2994e8ff8e776bfc05749f3fcfd09371b3` are:

| Commit / commit date | Subject | Assessment before Beta 1 |
|---|---|---|
| `6ff9f305393235d0f4c82c15fbd01c1ac482d21f` · 2026-10-11 22:03:06 +02:00 | Animate adjacent full-phone inserts in chat | Relevant native Pocket presentation change; **needs adaptation, defer** during privacy stabilization. No auth fix. |
| `b13bd82e0dd2b3759fe69361e6b85f16ccd68df8` · 2026-10-12 09:03:04 −03:00 | Merge pull request #3 from patatasbravasch-arch/feat/phone-visuals | Merge of the animation change. Second-parent tree diff is empty; do not count/import the same functionality twice. **Defer** with 6ff. |
| `c7f839aa54ce21c3ceee01d5897795fa89f08d1a` · 2026-10-12 11:43:01 −03:00 | Keep Pocket desktop handset on the left | **Already functionally present** from experimental reconciliation; no necessary beta adaptation. |

Main and experimental share the common base; main's three commits do **not** descend from a02. Local main descends normally from its merge parents; there is no locally demonstrated force-push/divergence event. Current remote history cannot be assessed without a fetch.

### Actual source/bundle impacts

**6ff / b13:** reviewed source/controller/style/package/contract diffs. New `src/frontend/components/phone-sequence.ts:refreshPhoneSequences` groups only adjacent compatible full-phone native Messages inserts by scope, source message, device owner and conversation. It hides follower anchors, provides Replay/Show all controls and animates steps. `controller.ts:mountInlineArtifacts/tryRenderInlineArtifact/clearActivitySurfaces/inlineOptions` switches from per-anchor rendering to this grouping/cache logic and threads reduced-motion settings. `activity.ts` adds optional `reducedMotion`; `pocket-inline-redesign.css` adds sequence/playback/arrival styles. Package scripts add animation tests; new preview/check scripts, `phone-sequence.test.ts`, contract assertions and six visual baselines accompany it. `dist/frontend.js` contains the built implementation. The merge introduces no additional tree changes relative to 6ff.

Potential benefit: clearer adjacent native phone cutaways, reduced-motion support, fewer duplicate fallback connectors and explicit playback. Risks requiring targeted verification: controller/context changes overlap our reconciled native/Mochi controller; grouping affects receipt/connector fallback and cleanup; cache serialization scans mounted anchors and Replay forces one layout read. These are performance/compatibility risks, not confirmed freezes. Fixed dark playback colors also need light/theme review. This is not an essential authentication or messaging-data fix; keep it separate from beta privacy work.

**c7:** `controller.ts:ensureDockPanel` uses `edge: 'left'` and `respectRequestedEdge: true`, plus compiled frontend and one contract update. The current fork and a02 already contain the same dock-options behavior. No new Mochi window/session ownership change is needed.

For these main-only updates, the diff changes **no** `src/backend.ts`, `src/generation.ts`, `src/types.ts`, Mochi backend/schema, manifest or lockfile. It adds no real-user hook, provider authorization, scheduler or memory recovery. Thus there is no inspected upstream privacy fix to import. a02's model picker/profile/source-refresh integration is already the reconciliation baseline; replacing its frontend wholesale would undo subsequent account/session/memory safety work.

Do not copy upstream `dist/frontend.js` or its entire `package.json`/controller into this fork. Main has no current independent Mochi implementation; wholesale replacement can remove Mochi runtime/frontend paths and verification scripts even without deleting its source directory. Any later animation integration must apply the coherent source/helper/style/test change, preserve current Mochi ownership/controller adapters and memory-v2 support, then produce matching fork bundles. Upstream screenshot baseline changes were inspected as changed files only; no screenshots were opened, regenerated or imported.

Recommended order: resolve the general host auth lifecycle first; perform approved synthetic/live acceptance and existing native Pocket compatibility checks; consider only a separately scoped animation reconciliation later. Left-handset behavior needs no integration. Recheck newer upstream branches only if separately authorized. No merge/cherry-pick/switch/ref update was performed.

## 7. Remaining uncertainties and stop point

- No direct live evidence establishes which local host process/browser assets are currently active or any actual cross-user exposure. The identified launcher/source/committed artifacts are the patch target inputs, not a substitute for runtime acceptance.
- No existing automatic real-user invalidation guarantee was found. General disposal exists and can be wired; pending pre-loader hydration and native pop-out routes must be covered, not merely a new event name.
- Older extension teardown implementations and exceptions need host-registry cleanup tests. A new principal event alone cannot force all extensions to clear their private caches; host-owned disposal is preferred.
- Installed/fetched type versions are distinct; optional APIs require feature detection and the minimum **host lifecycle behavior**, not only a package version, must be specified.
- More recent Pocket remote changes are unknown because network fetching was not approved.

`MOCHI-BETA-CANDIDATE.json` remains unchanged and **blocked**. Read-only inspection does not remove the privacy or live-acceptance blocker. The next proposed approval is a narrowly scoped general Lumiverse host-auth lifecycle patch, with source-level synthetic tests first and separately controlled host build/manual acceptance. Stop here; no implementation or new milestone started.
