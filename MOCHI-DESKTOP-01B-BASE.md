# MOCHI-DESKTOP-01B-BASE — Isolated integration review

Status: integrated review baseline; targeted simulated tests pass; **not fully verified**.

## Provenance and recovery

- Kitty source: `kittyafterdark/Pocket`, `codex/experimental-mochi`, commit `a02b5faf7ffccb68df10f595f9fba67b626a3e39`, rechecked before fetching.
- Fetch was limited to that branch, without tags/submodules, into `refs/remotes/kitty-review/experimental-mochi-20261012`.
- Review branch: `codex/mochi-desktop-01b-base-review`.
- Review checkout: `C:/Users/pekoy/coding.shit/Lumiverse/Pocket-mochi-01b-base-review`.
- Parent baseline: published Mochi `3ab196541b7285a468ec496262ae344cd476a468`.
- Original checkout and local `mochi` stay at recovery commit `9e5267664a99e14ec6bc41db75133bedc830e91e`. The unverified MOCHI-UX-02 work remains recoverable there; none of its four-category UI is applied here.

Kitty's single integration commit descends from shared ancestor `5cd6ce2994e8ff8e776bfc05749f3fcfd09371b3`, not from the 18 published Mochi milestone commits. A whole-branch merge/cherry-pick would obscure copied history and create unnecessary conflicts. Instead, the reviewed file delta from `3ab1965` to Kitty's pinned commit was applied to a new checkout of `3ab1965`. It applied without content conflicts. Existing milestone reports remain in this review branch; Kitty's `MOCHI-TESTING.md` is added.

Imported source, scripts, tests, package file and bundles match Kitty's pinned snapshot. This is source/blob comparison, not a claim that a fresh build reproduced the bundles. No additional redesign, branding work, shared-session refactor or desktop window was implemented.

## Explicit behavior review

### Frontend integration

Retains Kitty's Pocket portal, sidebar configuration / shared-handset chat split, profile preview, source refresh, stable persona source identifiers, model picker, dirty-form navigation confirmation and grouped settings. Mochi's phone home-screen icon is removed by the imported integration. The handset dock requests the left edge with `respectRequestedEdge`; older hosts may require the separately documented Lumiverse core placement fix.

Portal/controller appearance, wordmark, room-options menu and shared-surface CSS are imported as Kitty's existing design, without further theme/asset changes. Permission-button status and controller contracts are included. Native Pocket generation/storage modules are not rewritten.

### Backend/service/types/generation changes

- `src/backend.ts`: adds authenticated `mochi:open_shell` drawer closing for mobile; does not resolve RP context. Existing backend service and scheduler initialization remain intact.
- `src/mochi/service.ts`: validates an optional model string with the existing bounded text validator (500 characters); adds account-scoped `mochi:choices` source metadata refresh. No room migration, assignment, history replacement or scheduler changes.
- `src/mochi/types.ts`: additive optional `model` setting, with no mandatory value/default or room-version change.
- `src/mochi/generation.ts`: counts tokens using the explicit room model or connection default, and adds the explicit override to existing provider parameters. Connection ownership, persona/character ownership, abort handling, history isolation and reply parsing remain intact. The model list is metadata, not an authorization whitelist; saved custom/unavailable model names remain visible and provider availability needs live verification.
- `src/mochi/models.ts`: same-origin authenticated model metadata GET, bounded request timeout, refresh cancellation and retained selection on metadata failure. This fetch is not character generation.

### Preserved safeguards

The account, scheduler, scheduling, presence, AI-behavior, notification, phone-selection, workspace-adapter and lower-level provider modules are unchanged from `3ab1965`. The manifest and native storage schema are unchanged. BUG-02 and BUG-03 regression files are retained unchanged.

BUG-02 ordinary replies remain independent of unsolicited autonomy. BUG-03 no-op settings saves retain revision/jobs/drafts; durable occurrence identity and exactly-once delivery safeguards remain. Genuine context changes still invalidate pending work as before.

## Resource-conscious validation

Only three test commands were run, sequentially, with a 5-second per-test timeout. All providers/storage in these tests are synthetic; no live Lumiverse/provider/server verification occurred.

1. `bun test --timeout 5000 tests/portal.test.ts`: **5 pass, 0 fail, 63 assertions**. Portal startup, cursor/focus retention, profile dirty-state navigation, settings/source refresh, and model-picker selection/failure handling.
2. `bun test --timeout 5000 --test-name-pattern 'choice refresh|room model override' tests/mochi.test.ts`: **2 pass, 0 fail, 11 assertions**. Metadata refresh preserves snapshots; model override persists and reaches tokenizer/provider dispatch; malformed model rejected.
3. `bun test --timeout 5000 --test-name-pattern 'BUG-02 Instant Online|Manual and autoReply=false|unchanged settings save leaves|BUG03B distinct occurrences' tests/mochi-auto-replies.test.ts tests/mochi-scheduling-lifecycle.test.ts`: **8 pass, 0 fail, 84 assertions**. Both legacy and fictional-account cases cover ordinary replies, continuation, no-op scheduling preservation and distinct exactly-once occurrences.

Total: **15 selected tests, 158 assertions, no failures**. Remaining tests were intentionally filtered out. The first test process took approximately 23 seconds including startup; later processes took roughly one second internally. No concurrent verification workloads were started.

The review's ignored `node_modules` junction points to the original checkout's existing dependencies (including jsdom 30.0.1). No dependencies were installed or changed. Git whitespace inspection treats upstream CRLF as line endings rather than trailing spaces.

Not run: typecheck, fresh builds, complete Pocket/Mochi regressions, controller contracts, Chromium/mobile checks, visual baselines, live account/session teardown, browser-closed scheduling or Ubuntu deployment. Bundles are copied from Kitty's pinned commit, not rebuilt. This checkpoint is not a verified release.

## Next review decisions

Review this baseline before moving any result onto `mochi`. Decide how to adapt the preserved UX-02 behavior later without overwriting Kitty's preview/model/refresh/dirty-state work. Confirm host docking compatibility and matching source/bundle deployment only in separately approved validation.

The next development checkpoint, 01B, still needs one authoritative frontend owner. The imported controller constructs a Mochi view and the retained `createMochiWorkspace` factory can construct another; do not activate both as competing clients. No lifecycle refactor is included here.

Rollback now: leave this review checkout unused; the original `mochi` and WIP remain unchanged. No room data is migrated or written by this reconciliation. No push, deployment, upstream changes or branch promotion was performed.
