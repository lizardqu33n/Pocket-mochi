# MOCHI-DESKTOP-01D-LOCAL — Windows visual-test preparation

Preparation only. No host, browser, installation, deployment or push has been started.

## Source and publication

Source checkpoint: `ed61e397a1b08806b18ee558edf9dfc4238d6770` on `codex/mochi-desktop-01b-base-review`. The new local publication checkpoint includes both built entry files and this report, without changing source. Suggested remote test branch after separate push approval: `codex/mochi-desktop-01d-test` in `lizardqu33n/Pocket-mochi`. Do not advance stable `mochi`, Power, main or upstream refs. Recheck the remote before any push.

Current bundle SHA-256:

- Backend `CC9CA7FB5DF7FDBDEDF22B961A1F09333275B1C3DDC7073889F742EA5ACF1983`.
- Frontend `13B1CA9ABD288701079B8FA9D378997A17C25C8772507F70713646A279FA6843` (01B/01C/01D and message guard).

Both tracked bundles must travel together. The inspected installer uses tracked dist rather than recompiling. Backend normalized Git content is unchanged. The 01C backups in `tmp/01c-verified-bundles` remain untouched: same backend hash, frontend `3F58AB10BFED01B510C0B6BD92F48C302859DFBD5643CD3A74072DA2029568E7`. No successful build or test was repeated during preparation.

## Isolated Windows setup

Recommended: reuse the existing Lumiverse code/dependencies and its existing `frontend/dist` as read-only runtime inputs, with a fresh working directory, data directory, environment, browser profile and port. This does not replace the regular installed extension or change its Git origin.

- Working directory: `Pocket-mochi-01b-base-review/tmp/01d-local-host`.
- Data directory: `Pocket-mochi-01b-base-review/tmp/01d-local-host/data` (fresh database/identity/accounts/extensions).
- Port: **7861**, if free; stop if occupied rather than terminating another process.
- Frontend: `C:/Users/pekoy/coding.shit/Lumiverse/frontend/dist`, already present; no frontend dev server/build.
- Cache: isolated `tmp/01d-local-host/bun-cache`, overriding the entrypoint's regular-checkout cache default.
- Environment: fresh child-process environment, no automatic `.env` loading or inherited provider/auth secrets. Only Windows runtime/path variables and explicit test settings are passed.
- Account: new `mochi_test` owner with a newly entered test-only password. Fresh encryption identity is generated in the test data directory. No real databases, users, histories, credentials, connection profiles, extension storage or jobs are copied.
- Browser: create a separate unsynced profile manually and open `http://localhost:7861`. Cookies are not isolated by port, so merely opening another regular-profile tab is insufficient.

The ignored preparation launcher `tmp/start-mochi-01d-test.ps1` was syntax-checked only. It requires PowerShell 7 and an explicit `-Approved` switch; it has not executed. It refuses an occupied port or missing frontend, creates only the fresh scratch directories, starts one child host and retains its process handle for shutdown. The test data directory has not yet been created. Prefer closing a regular local host yourself before the approved test to avoid running two full hosts on the PC; this preparation does not stop anything.

After separate launch approval, from PowerShell 7:

```powershell
& 'C:\Users\pekoy\coding.shit\Lumiverse\Pocket-mochi-01b-base-review\tmp\start-mochi-01d-test.ps1' -Approved
```

Choose a NEW test-only password when prompted. The script prompts to stop its own child; first leave generation/installation idle, then press Enter in that terminal. No launcher service or recurring task is created. Child termination is abrupt, so test-only work should be saved and idle beforehand.

Do not run the regular setup wizard for this task: inspection shows it hardcodes the regular checkout's data and .env paths. The launcher uses the inspected fresh-owner boot path instead.

The inspected server binds `::` (all interfaces), not loopback. Trusted origins are not a firewall. Before launching, approve/arrange Windows firewall restriction for port 7861 if loopback-only access is required. No firewall/core changes are made here. Actual startup/resource usage is unverified; migration/seed work occurs only in the fresh test instance on first launch.

## Installation only after launch/push approval

Once the publication branch exists and the disposable host is approved/running, use its extension installer with repository `https://github.com/lizardqu33n/Pocket-mochi` and branch `codex/mochi-desktop-01d-test`. Identifier remains `lumiphone`; it is installed once in the NEW instance. Its permissions and files are separate from the regular data directory.

Kitty's currently installed checkout remains unchanged. Its branch selector reads its own origin and cannot access the fork test branch. Do not uninstall it, change its remote, copy it into this new instance or install a second lumiphone in the same database. No branch publication or extension installation has been attempted.

## Manual checklist

Use only synthetic characters, personas, fictional accounts and rooms. Manual reply mode and nonempty synthetic messages avoid unintended automatic generations; no production provider/room data is imported. Actual generation/background-job tests require separately configured test connections. A room with more than 100 synthetic messages is needed for the earlier-history check; no bulk seed/population was performed.

1. Open Mochi window using the temporary Pocket portal button; verify a single view and one active presentation.
2. At 900px width verify conversation list/chat columns; at 390px and 320px verify list → chat → back navigation and no horizontal overflow.
3. Drag the title bar; text selection, scrolling, buttons and typing must not drag. Resize southeast grip with pointer/arrow keys.
4. Switch two rooms with an unsent draft; hide/restore and portal handoff must retain it and the fictional account. Dirty settings must require confirmation.
5. Scroll history, load earlier messages and check anchoring; exercise Enter/Shift+Enter, message menus, connections/source refresh and model picker without changing saved behavior inadvertently.
6. Verify native Pocket Messages navigation independently; portal/window takeover must not duplicate clients.
7. At non-default browser/UI zoom, inspect sizing, focus and scrolling. Log out of the disposable account and confirm private window state clears.

Do not claim the last logout check has passed automatically: the existing host identity-hook/silent-switch concern remains pending, as do actual pointer/external-hide behavior and pixel layout. No screenshots or personal RP content were collected.

## Rollback

Stop only the disposable child host; keep its scratch data if troubleshooting is needed. Regular Windows Pocket and Ubuntu never change, so they require no restore. The separate test browser profile is optional to keep. No cleanup deletion is performed; removing scratch data later needs explicit user intent and path verification. To compare older window code, use an explicitly approved older test branch/package inside the disposable instance only; preserve its storage.

Before 01E: review preparation, approve a push if GitHub delivery is desired, and approve a single local host launch/manual smoke test. Keep 01C backup bundles recoverable. No source/layout redesign or active-environment operation is included in this checkpoint.
