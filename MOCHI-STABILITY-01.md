# MOCHI-STABILITY-01

Date: 2026-10-11. Branch: `mochi`. Local reliability fixes only; no push, deployment, UI redesign, schema migration, or native Pocket messaging changes.

## Confirmed defects and targeted fixes

Each defect was reproduced with a failing regression before its fix.

1. **Cancellation during the initial user-message save:** Stop, switching rooms, or closing Mochi could miss a request because its generation job was registered only after persistence. Register transient, account/room/request-scoped cancellation controllers before waiting for the room lock. Preserve the accepted user message but skip generation when canceled during that save.
2. **Delayed acceptance left a sent draft behind:** A room switch or newer refresh could prevent the originating draft from being cleared, risking a duplicate manual resend. Track the submitted room and exact draft; process its acceptance independently of stale screen snapshots. Never clear a newer unsent draft.
3. **Provider errors exposed credential-like strings:** Frontend error messages now redact common API-key/Bearer patterns, normalize whitespace, and cap length, following Pocket's existing sanitization convention. Regression credentials are synthetic.
4. **Group ownership changed during generation:** Only the responding character was rechecked before committing. Recheck character permission and every room member, alongside existing connection/persona checks; discard the reply if a group member is unavailable. Keep the accepted user message.

## Already-correct behavior verified

- Sends, edits, deletion and rerolls persist across service reloads. Action receipts deduplicate retries; edits/rerolls retain earlier versions and preserve unrelated and later messages.
- Same-process room locks and revision checks reject concurrent stale writes. Repeated submissions, duplicate receipts, overlapping generation, rapid switching and app exit do not append duplicate or unwanted replies in the tested cancellation windows.
- Canceled providers that ignore abort cannot commit results after returning. Settings changes, room removal and revoked source ownership discard stale results.
- Context uses the selected room's history, stable persona snapshot, selected character roster and configured instructions. Tests trap attempted RP history/scene/clock/memory access and exclude another room's private context.
- Interrupted staging writes or failed replacements leave committed history intact. Malformed/newer records are reported and preserved; orphan staging files do not silently replace committed records on reload.
- Notification read state is separate from persistent notification history: read records intentionally remain until dismissal or clearing. Read/unread counts, individual dismiss, clear read, confirmed clear all, routing, privacy, revision-based duplicate prevention and preservation of room messages pass existing regressions and browser interactions.
- Existing Pocket regression and contract checks pass; native Messages, contacts, phones and generation helpers were not edited.

## Token and request audit

- Defaults: 8,192 total context tokens, 1,200 output tokens, 256-token envelope reserve: 6,736 counted input tokens available.
- Existing settings require context 1,024–131,072, output 128–8,192, and output plus reserve strictly below context. Full outgoing messages are counted; invalid counts and oversize prompts fail before the provider call.
- Trimming removes oldest turns from the outgoing copy only, preserving the newest turn and all stored history. Large character/system instructions can still exceed the budget and produce a safe error.
- One provider request per automatic reply, manual continuation or reroll; nonempty sends with automatic replies disabled use none. Failed/malformed responses do not automatically retry; retrying the same receipt does not generate again. Token counting may repeat while trimming, but those are not generation requests.
- The configured context ceiling is not independently matched to a provider's model-specific limit. Output limits are sent to the host/provider; no real model usage or costs were measured.

## Validation

- `bun run verify`: PASS — type checking, both production bundles, 167 tests / 985 assertions across 14 files, and Pocket contract checks.
- Mochi suite: PASS — 41 tests / 320 assertions, including 10 new regressions for cancellation, stale draft acknowledgements, ownership, concurrent receipts, context isolation, token safeguards and malformed/interrupted storage.
- Simulated Chromium UI: PASS at 320px, 390px and 900px using Chromium 149.0.7827.55, including composer/actions/settings/notification interactions. Existing approved presentation and visual baselines were not changed.
- Standard visual-baseline suite: BLOCKED — its required Playwright Chromium headless-shell executable is unavailable. This is not a passing baseline comparison.
- Source and checked-in bundles agree: both bundles regenerated successfully from the final source by `verify`.
- All service/provider/storage tests use fixtures; browser checks run a local simulated host. No live Lumiverse, real provider, Ubuntu installation or server testing was performed.

## Remaining risks and boundaries

- Room locks and generation jobs coordinate one service process. Multiple independent service instances are not protected by host-level compare-and-swap. A larger fix would require an atomic host revision contract or shared locking; neither was introduced here.
- Cancellation is checked before replacing the committed file. Once the host begins its atomic rename, Stop cannot safely undo the already committing write. The host storage API has no cancelable rename/transaction interface. Cancellation tests cover the staging and generation windows, not reversal after this commit boundary.
- A host/provider promise that never settles despite abort can retain a busy room; overlapping generation stays blocked. Stronger settlement guarantees would require a host-level lifecycle change.
- Orphan `.pending` files are preserved for inspection, not automatically restored: they can contain canceled/stale output. There is no added automatic backup recovery.
- Clearing notifications across several rooms uses per-room writes, not a global transaction; a storage failure can require refresh/retry. Room messages remain independent and preserved.

## Changed files and local delivery

- `src/mochi/service.ts`: early cancellation registration, full group ownership recheck, safe error text.
- `src/mochi/view.ts`: originating-draft acknowledgement tracking; no presentation changes.
- `tests/mochi.test.ts`: ten targeted regression tests.
- `dist/backend.js`, `dist/frontend.js`: regenerated production bundles.
- `MOCHI-STABILITY-01.md`: this report.

The previously approved, already present UI work was saved separately as local baseline commit `bea816b` (`style(mochi): preserve approved final messenger UI baseline`). Stability changes are committed separately on top. Neither commit was pushed. To roll back only this batch after review, revert the stability commit; retain the approved UI baseline and saved account data.
