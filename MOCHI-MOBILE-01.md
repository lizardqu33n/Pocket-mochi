# MOCHI-MOBILE-01 — Mobile entry and bounded messenger surface

2026-10-15. Starting and unchanged Git HEAD: `b71abd1f023f62b08906fd3cc47af2b258899525`, local branch `codex/mochi-desktop-01b-base-review`. Published desktop RC2 is preserved. This is a new **uncommitted, unpublished RC3 mobile candidate**, recorded in `MOCHI-MOBILE-01-CANDIDATE.json`. Ready for separately approved user phone testing, **not mobile acceptance or automatic beta publication**.

## Investigation: confirmed source behavior versus live hypotheses

The `Open messenger` handler exists in `src/mochi/sidebar.ts`, `present()`. It deliberately bypasses the desktop floating window at viewport widths <=600px or on coarse-pointer devices. It previously activated the Pocket portal and reused the embedded workspace. Consequently, clicking Open messenger while that embedded workspace was already open returned to the same presentation rather than producing a distinct mobile surface. It was not a missing handler or a failed attempt to launch the desktop window.

Source inspection confirmed problematic presentation coupling:

- The embedded messenger lived under the Pocket portal, which includes its own navigation/padding and `.pocket-portal .mochi-view` height/overflow rules. Later workspace exceptions restore some layout, but the entire outer host/portal/sidebar height chain still has to be bounded correctly for message-history flex sizing. Narrow-width DOM tests had asserted that the embedded route existed, without measuring its rendered Android geometry.
- `.mochi-sidebar button` applied account-navigation font/background/border/padding rules to descendant conversation controls as well. This is unnecessary coupling; compact chat components have their own styles.
- The mobile branch did not use Pocket's existing visual-viewport/fullscreen presentation strategy, so desktop container queries alone did not establish a keyboard-safe, bounded mobile app surface.

These are confirmed source paths and style relationships. The precise pixel-level cause of the collapsed history on the user's Android browser is not proven by JSDOM. The brief references `16526.jpg`/`16527.jpg`, but those files were not supplied as accessible image attachments in this checkpoint; no claim of inspecting their actual pixels or Android DevTools is made. The user's observed failure remains valid and mobile RC2 is not accepted.

## Native Pocket/host integration inspected

Read-only local Lumiverse host source: `b1a68d9e32e2a2480a0d5ae71422566845f2657b`. This identifies inspected source, not the server's installed host version.

- `src/frontend/controller.ts`, `ensureMobileWidget()` and `mountInteractiveSurface()`: Pocket uses a host-managed chromeless fullscreen float widget, not a scaled desktop dock, for small/short viewports. The same handset node is moved into that surface.
- `src/frontend/surface.ts`, `currentViewport()`, `calculatePhoneSurface()`, `applyVisualViewportSurface()`: native Pocket reads `visualViewport` dimensions/offsets, converts to layout units under UI zoom, sizes its content for the keyboard/address bars, and avoids redundant style assignments. Native Pocket's fullscreen threshold is <=720px width or <=540px height; Mochi retains its existing mobile/coarse-pointer routing threshold rather than changing desktop routing.
- `src/frontend/controller.ts`, viewport/focus listeners, and native screen/router behavior: phone navigation and native Messages retain their own controller/state and are not Mochi inputs. None was modified.
- Host `frontend/src/lib/spindle/frontend-context.ts`, `loader.ts` (`registerDrawerTab`), `placement-helper.ts` (`createDrawerTabHandle`), `components/panels/ViewportDrawer.module.css`, and `components/spindle/SpindleFloatWidget*`: drawer and float-widget surfaces are host-owned bounded/overflow-managed containers; extension content must supply an appropriate internal layout. The existing public fullscreen API is available in the installed type declarations and used by Pocket.
- `src/mochi/window.ts`, launcher, workspace, session, portal and sidebar routes: the desktop window and mobile routing share the existing session. No second view/controller or backend connection is needed.

No host source, installation or data was modified.

## Implemented adaptation

`src/mochi/mobile-surface.ts` creates only a **host shell**, using the same fullscreen/chromeless/native-touch-scroll widget options as native Pocket. It moves the existing Mochi sidebar/workspace into that shell, outside the Pocket portal's CSS/navigation ancestry. It creates no MochiView, transport listener, toast owner or generation controller. A return placeholder restores the existing navigation subtree when the mobile surface hides.

The shell reuses `applyVisualViewportSurface()` and host `toLayoutPx()` where available, with the existing UI-scale fallback. It follows window/visualViewport resize, viewport scroll and focus changes, while open only; listeners are removed on hide/disposal. No polling, body observer or history scan was added. Safe-area padding is inside the bounded visual-viewport surface. Pointer gestures are kept inside the shell rather than initiating host drag.

On mobile, Open messenger now opens this supported full-screen app surface. While it is already open, the redundant Open messenger control is hidden. Account selection/settings remain available through the same navigation owner. A Close action runs the existing generation/summary exit confirmation before hiding; ordinary drafts and settings state stay in the session. In-app Back and existing tools continue to use their original protections. Keyboard resizing does not hide/close the workspace or cancel work.

The mobile layout forces one column, including coarse-pointer screens wider than the desktop container-query breakpoint:

- List: approved wordmark/mascot, account controls, conversation search, All/Unread/Groups/New Chat and independently scrolling rooms.
- Chat: Back, compact title/actions, flexing scrollable history and a nonsticky composer in the same bounded column. The message-history min-height is explicitly allowed to shrink; its max-height is removed. Composer input has a bounded mobile height and 16px text.
- Details replace the chat area on demand. Search/room menu remain existing tools with bounded popup dimensions. No persistent right sidebar, new rail or social section.

The broad navigation-button rule now targets navigation/picker controls, leaving chat components' own styles in charge. Desktop launcher/window code, branding assets/alignment and native Pocket code are unchanged. Unsupported fullscreen hosts retain the embedded fallback with a visible status message; that fallback is **not certified as a repaired Android experience**.

## Exact changed files

- `src/mochi/mobile-surface.ts` — new host-only shell/viewport/lifecycle helper.
- `src/mochi/sidebar.ts` — mobile entry, same-workspace ownership, guarded Close, focus without automatically opening the keyboard, visible fallback status.
- `src/mochi/sidebar-styles.ts` — scoped navigation styles and mobile single-view/history/composer rules.
- `tests/mochi-mobile-surface.test.ts` — new viewport/listener/restore/native-independence/layout contracts.
- `tests/mochi-sidebar.test.ts` — updated mobile expectations and new navigation/draft/quote/action/warning coverage; mock now implements the supported fullscreen API.
- `dist/frontend.js` — matching new runtime.
- `MOCHI-MOBILE-01-CANDIDATE.json` — explicit new candidate/hash record.
- `MOCHI-MOBILE-01.md` — this report.

The backend build target ran but its bytes are identical to RC2; it is not a new backend change. Existing untracked `MOCHI-BETA-PUBLISH-02.md` remains untouched. No files were staged or committed.

## Sequential verification

All runs were small separate processes. Final distinct results (earlier repeated subsets excluded):

| Checks | Tests | Assertions |
|---|---:|---:|
| Mobile surface at 320/360/390/430px, short/tall/keyboard viewport events, cleanup and structural CSS | 5 | 78 |
| Sidebar/mobile routing, legacy/account scopes, Open/Close, list/chat/details/Back, drafts, long names/messages, quotes/action dialog, reply and summary exit warnings, hidden unread behavior, desktop launcher and native portal independence | 13 | 143 |
| Desktop window ownership/handoff, drag/resize, hide warnings, drafts and logout cleanup | 4 | 46 |
| Portal/profile/model-picker compatibility | 5 | 63 |
| Power interceptor/control tests against the freshly built backend | 6 | 39 |
| Compiled frontend approved branding/Power compatibility | 2 | 24 |
| **Total** | **35** | **493** |

One TypeScript typecheck passed. One sequential production build passed. No full suite, Chromium, parallel verification, host startup or provider request. The new mobile module/Close/fallback markers are present in the frontend bundle. Existing RC2 metadata/archive were compared with their preserved copies and remain unchanged.

These are synthetic JSDOM/storage/API-contract checks. They do not measure actual flex/grid pixel heights, keyboard animation, browser bars, touch scrolling, menu clipping or hardware Back on Android. No real phone acceptance is claimed. Account ownership, backend messaging, scheduling, quotas, profiles, notifications and prompts were not changed; frontend tests and unchanged backend hashes provide scoped regression evidence, not a new comprehensive privacy certification. The known same-browser real-user authentication transition limitation remains unresolved.

## Runtime and recovery

- New frontend SHA-256: `3A14C1FE899FDF48D6CC339F00E11583AA66FD44EF163A5D4254A650513B671B`.
- Backend SHA-256: `FB2478EE6AB4B004955CAF046681A82253B73BE6D16C8609936DEEC67AC329B6` (unchanged).
- Source fingerprint: `405BDE7E145B96E2891C1E0D4700C5F5AF55E68F7F70F67377F618C9A91196CF` (sorted current source path/hash map, recorded by the candidate metadata).

Compatible desktop RC2 recovery pair and exact RC2 metadata are preserved in ignored `tmp/mochi-mobile-01-before/`. Recovery frontend is `E3F6590DADFC63F756B7C54F4E4B0F33EAD6DBFC085616CCAB921EF8F960AED8`, paired with the same backend above. The published RC2 archive remains intact, hash `B566725B6C92071BAC8F4AEAA93CC3DB3A7FE9858F07ED63EC4EBA61194D277C`; it does not contain this mobile revision. No new archive/publication was produced. Rollback is code-only using a matching pair, preserving all account/history/permission/memory data.

## Real Android acceptance checklist — pending

Only after separate approval to update the intended test installation with both matching bundles:

1. At 320/360/390/430 CSS widths, open Mochi through the Pocket portal and launcher. Select a fictional account and tap Open messenger. Verify a usable fullscreen Mochi surface appears, without Pocket portal navigation stacked above it. Check account-picker/empty-account/empty-room states.
2. Open DM/group rooms with long names, long paragraphs/unbroken text and quotes. Confirm a nonzero independently scrolling history, no horizontal page scroll and an accessible bottom composer. Load earlier history and check position retention.
3. Open/close the Android keyboard repeatedly in short/tall portrait and landscape views. Expand/collapse address/navigation bars and try the host's nondefault UI zoom. Verify visible Send/Stop, Enter/Shift+Enter/empty continuation and no accidental host dragging. Check safe areas and touch scroll.
4. Exercise details → Back, search, message actions, notifications, presets, memory, pins and settings. Check popup contrast/layering/clipping, unread state and unsaved-draft/navigation protections. In-app Back is implemented; browser/hardware Back behavior needs real-host validation and is not intercepted by this patch.
5. While a reply or summary is pending, Close/Back should warn; Stay preserves the task, confirmed exit stops only interactive work. Existing durable schedules must remain intact. Hide/reopen and switch accounts; check selected room and composer/settings drafts.
6. Verify native Pocket phone/Messages and per-RP Power remain independent. On desktop, open/drag/resize/hide the existing window and launcher normally. On logout/auth invalidation, verify no private Mochi surface remains; this does not replace the outstanding trusted identity-boundary work.

Remaining concerns include actual Android host fullscreen support/version, external host-hide/hardware navigation behavior, virtual-keyboard geometry under UI zoom, and rendered popup/history sizes. The brief's referenced screenshots/actual device measurements would help diagnose any residual issue. Do not announce mobile support accepted until the user completes this check.

No commits, push, deployment, local/Ubuntu installation, upstream integration or release-branch changes were performed. Stop for review.
