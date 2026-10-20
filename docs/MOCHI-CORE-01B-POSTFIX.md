# CORE-01B post-publication sidebar and metadata repair

Scope: local candidate based on published test-mochi `d0a1f8b8a6c56ed832809b337d2e4f809539cd8d`. No host installation, publication, beta change, storage migration or provider dispatch is part of this repair.

## Reproduced cause and change

The owner reported a small account picker and a blank account editor. The standalone shell mounted the sidebar directly under `.lumiphone-drawer`. `src/styles.ts` defines that phone landing-card wrapper as a padded grid with `place-items:center`. The sidebar has no explicit width; when editing hides its navigation, the profile view's `container-type:inline-size` supplies no intrinsic inline size. The centered sidebar shrinks to 16px (its picker padding), leaving a 0px-wide profile form.

In a 480px synthetic desktop drawer, published code produces a 258px picker and 0px editor. At a 390px viewport it produces a 282px picker and 0px editor. The existing jsdom checks inspect DOM presence without layout, and the earlier browser shell check never opens the account editor, so neither caught this collapse.

The shell now supplies the legacy layout structure: `.pocket-portal[data-destination=mochi] > .pocket-portal-body > .mochi-sidebar`. The existing `PORTAL_STYLES` already stretches this structure and supplies its shared presentation variables. No Pocket controller, portal home screen, RP integration or handset is created. No stylesheet, owner theme, asset, font size, interface scale or public CSS variable is edited. Fixed picker/editor widths are 448/432px in the desktop drawer and 358/342px on mobile.

`spindle.json` had retained the original Pocket author's display and repository fields. Mochi's author is now `lizardqu33n`; github/homepage are `https://github.com/lizardqu33n/Pocket-mochi`. Identifier `lumiphone`, version, permissions, storage paths and schemas are unchanged. This is upgrade-compatible identity, not coexistence or B4 migration.

## Host API and metadata limits

The published Spindle 0.6.32 types expose drawer `activate()` and `onActivate()`, float widgets and style injection. Geometry is an optional host addition; the shell retains existing desktop drawer and mobile fullscreen-failure fallbacks. Styles remain injected through the existing frontend helper and sidebar boundaries. Routing, session ownership, launcher, backend drawer-close handoff and teardown mechanics are unchanged.

Pinned public Lumiverse source at `3ca135a20a31f4ba18c8e96b24724cd73ad7c8eb`, `src/spindle/manager.service.ts`, stores author/github/homepage in extension database rows. `syncManifestToDb` (lines 976–1030) compares those fields and updates them without requiring a version change. `finishUpdate` (lines 1653 onward) also refreshes them after building. A local source edit does not change an already installed manifest/database row; a frontend-only reload cannot be assumed to refresh the creator label. This host snapshot does not establish the owner's installed version or guarantee its update behavior. No database edit, uninstall/reinstall or host reload was performed.

Public source: https://github.com/prolix-oc/Lumiverse/blob/3ca135a20a31f4ba18c8e96b24724cd73ad7c8eb/src/spindle/manager.service.ts

## Focused regression

`scripts/check-mochi-postfix-ui.mjs` uses an isolated headless browser and the synthetic service fixture, with HTTP blocked. Set `POCKET_PLAYWRIGHT_ROOT` to the installed Playwright module location and `POCKET_BROWSER_PATH` to a browser executable, then run `node scripts/check-mochi-postfix-ui.mjs`. Evidence goes under ignored `tmp/postfix-ui/fixed`.

The runner checks startup without Pocket, constrained drawer width, visible edit forms, focus/Tab/Escape, cancel/save, selected-account routing, conversation opening, three hide/reopen cycles, desktop/mobile optional-capability fallbacks, no duplicate surface, real-owner switch/logout cleanup, idempotent disposal, no browser errors and zero provider calls. `--baseline` with `MOCHI_FIXTURE_ROOT` pointing to the unchanged published source explicitly reproduces the collapsed layout; it is a diagnostic baseline mode, not a passing repair claim. Baseline and fixed results and screenshots use separate directories.

The standalone unit delivery contract also freezes the three branding fields. Existing standalone bundle-load tests execute both rebuilt dist bundles against synthetic hosts. Existing sidebar/window/mobile/session/workspace tests remain relevant; inherited failures must be reported separately, not removed to obtain a passing run.

## Exact owner acceptance steps after separate installation approval

Do not use the installed app for this local-only task. In a later approved isolated host with synthetic data and the candidate's matching source, manifest and dist pair:

1. Confirm the installed source is this candidate and identity remains `lumiphone`. Do not install alongside another `lumiphone`, uninstall an existing owner installation, or migrate records.
2. Open Spindle's extension details after the host's supported update/start metadata synchronization. Confirm author `lizardqu33n` and both repository links point to Pocket-mochi. If stale, record host version/update path; do not edit its database.
3. At desktop width, open the Mochi rail tab or Open Mochi action. Confirm Accounts fills the drawer with existing padding. Open Edit account and New account; confirm fields are visible and vertically scrollable to Save/Cancel.
4. Tab through the editor, press Escape without edits, reopen, and Cancel. Change a synthetic display name, Save, and confirm return to Accounts and preservation of the synthetic account's chats. Repeat opening/closing three times.
5. Select a synthetic account, open the messenger, open a conversation, type an unsent draft, hide with title-bar Escape, and reopen via the launcher three times. Confirm one window, preserved draft and no unintended generation.
6. At mobile width, repeat account edit and scrolling; open the messenger fullscreen, Close and reopen three times. Check keyboard visibility and rotation on an actual device in the separately approved scope.
7. With optional geometry/fullscreen unavailable in an isolated fixture, confirm the messenger remains in the drawer, fallback text is visible and reopening remains usable. Test logout/real-owner change with synthetic accounts: surfaces and subscriptions must disappear and no previous-owner content remain.
8. Capture any remaining clipping/blank panel with the exact steps, viewport, host version and screenshot. Synthetic browser coverage is not installed-host or real-Android acceptance.

## Provenance

Mochi derives from Pocket by kittyafterdark and its original contributors. Updating Mochi's display author does not reassign original code authorship. All existing source acknowledgments and Lucide/Feather copyright/license notices remain intact. No top-level Pocket license grant was established by the earlier audit; no license is invented and no redistribution right or public-release approval is claimed here.
