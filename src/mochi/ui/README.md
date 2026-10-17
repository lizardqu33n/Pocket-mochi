# Editing Mochi's appearance

You can change Mochi's appearance in ordinary CSS. You do not need to edit TypeScript, presets, or application logic. There is no theme picker or theme loader in this change.

## Get the files

For a quick look, open `mochi-tokens.css` or `mochi.css` on GitHub, choose **Raw**, and save the file. For changes you intend to build and merge, use a complete checkout of **lizardqu33n/Pocket-mochi**, branch **test-mochi**, and open that folder in VS Code (**File → Open Folder**). A downloaded CSS file alone cannot rebuild the extension.

- **mochi-tokens.css** is the best starting point: named sizes, spacing, typography, and inherited colors.
- **mochi.css** contains component rules and responsive layouts. Use VS Code's Find to locate a component such as `mochi-bubble`, `mochi-avatar-frame`, or `mochi-preset-panel`.

Keep a copy or commit your work before experimenting. Make one small change at a time.

## Four working examples

Inside the existing token block, change values such as:

```css
--mochi-sidebar-width: 280px;       /* default 240px; desktop conversation list */
--mochi-chat-font-size: 16px;       /* default 14px; message text */
--mochi-bubble-radius: 22px;        /* default 18px; main bubble corners */
--mochi-avatar-size: 44px;          /* default 40px; chat portrait and its frame */
```

Change the existing lines; do not add a second token block with competing values. Keep units such as `px` and the ending semicolons.

Useful related controls:

| Token | Controls |
| --- | --- |
| `--mochi-sidebar-min-width` | Minimum desktop conversation-list width |
| `--mochi-sidebar-details-width`, `--mochi-sidebar-details-min-width` | Conversation list when the participant/details panel is open |
| `--mochi-profile-panel-width` | Desktop participant/details column |
| `--mochi-bubble-corner-radius` | Smaller speaker-side bubble corner |
| `--mochi-bubble-padding-x`, `--mochi-bubble-padding-y` | Space inside chat bubbles |
| `--mochi-bubble-max-width` | Maximum chat-bubble body proportion |
| `--mochi-wordmark-width` | Mochi logo width |
| `--mochi-control-font-size`, `--mochi-heading-font-size` | Shared control/heading defaults |
| `--mochi-radius-field`, `--mochi-radius-card` | Common field/card rounding |
| `--mochi-space-xs` through `--mochi-space-xl` | Common gaps, from 4px to 24px |

Avatars in participant lists, profile previews, and the responder picker intentionally have their own sizes in `mochi.css`; the chat-avatar token does not enlarge every avatar. Mobile layouts intentionally hide or stack the desktop sidebar, so changing sidebar width does not force a sidebar onto a small screen. Host-owned floating-window bounds, dragging/resizing, and measured composer auto-growth remain application/host layout responsibilities.

## Keep the host theme

The default colors reference Lumiverse/Pocket variables (`--lp-*` and `--lumiverse-*`). This preserves the host's Light, Dark, and custom colors, with the existing restrained lilac accent mix. Leave those references intact if you want automatic host-theme inheritance. The tokens are scoped to Mochi surfaces; do not move them to `:root` or rename host variables.

## Preview locally

Use a disposable synthetic preview, not an active installation with users. The repository's `scripts/check-mochi-css-ui.mjs` builds a file-based fixture from the production UI source and captures chat, settings, presets, prompt preview, and dropdowns at desktop, 390px, and 320px in dark, light, and custom host colors. It uses in-memory fictional data and blocks external HTTP requests.

This optional browser check needs an existing Playwright/Chromium setup. Set `POCKET_PLAYWRIGHT_ROOT` to the folder from which Playwright resolves, `POCKET_BROWSER_PATH` to its browser executable, and `MOCHI_BUN` to Bun if it is not on your PATH. Set `MOCHI_CSS_OUTPUT` to a new output folder, then run `node scripts/check-mochi-css-ui.mjs`. Open that output folder's `index.html` in a browser for an interactive synthetic preview. Refresh after rebuilding the fixture to see your CSS changes. This fixture is not connected to Lumiverse or a provider.

To compare an extraction with saved screenshots, set `MOCHI_CSS_BASELINE` to the earlier screenshot folder. Unset that variable when making intentional visual changes; otherwise the comparison correctly reports a difference.

## Build the frontend

Use the repository's supported **Bun 1.4.3** toolchain and existing project dependencies. In VS Code's terminal, from the repository folder:

```powershell
bun run typecheck
bun run build:frontend
```

The build first checks that every required CSS section still exists, then Bun imports both CSS files **as text inside `dist/frontend.js`**. There is no separate stylesheet to install, no CDN, and no runtime CSS download. A CSS-only edit needs only the frontend rebuild; backend source changes are not necessary. The full release build remains `bun run build`, which builds backend and frontend sequentially.

Keep the CSS files' **LF** line endings (shown at the bottom of VS Code). The repository's Git attributes preserve these on Windows and Linux because the files are embedded as text.

## Save and merge your work

Start from an up-to-date `test-mochi`. Make your edits on your own working branch if you want review before merging. Review the diff, then commit the CSS changes **and the freshly built `dist/frontend.js` together**. Merge that commit into `test-mochi` using your normal GitHub workflow. Pull concurrent changes, resolve conflicts carefully, rebuild the frontend after resolving them, and check the resulting diff again. Never force-push or merge this work into `beta-mochi` without separate authorization.

For a CSS-only edit, an unchanged backend bundle is expected. Do not replace it with an unrelated build. The manifest loads compiled JavaScript; Lumiverse's inspected Git installer uses tracked `dist` bundles instead of rebuilding them. **Committing CSS without the matching frontend bundle will leave installed extensions showing the old styling.**

## Update the hosted test installation

Pushing a commit does **not** authorize reloading an installation with active users. Arrange a separately approved test update window first. In that window, preserve the installed pair using the established backup/hash procedure, confirm the installed repository and `test-mochi` branch, choose **Extensions → Update**, wait for success, then reload the browser and check the affected views. Restart alone does not fetch GitHub. Do not uninstall or clear storage as a routine refresh: removal can delete extension data.

Do not use this guide to change Ubuntu production, saved credentials, or private conversations. This refactor performs no hosted update.

## Troubleshooting and merge notes

- **No visible change:** confirm your edited file is in this checkout, rebuild, confirm the compiled frontend is in the commit, then check the installed repository/branch and approved update procedure.
- **Missing CSS section:** restore the `/* @mochi-section ... */` comment. These markers preserve the existing stylesheet insertion boundaries. Edit the ordinary declarations inside a section; do not delete, rename, or duplicate its marker.
- **A rule appears more than once:** some existing responsive/surface refinements override earlier base rules. Their order and specificity are intentionally preserved. Prefer the common token for supported dimensions. For other changes, edit the relevant final rule in its labeled section instead of appending a new competing override.
- **Colors no longer follow the host:** restore the inherited variable references in `mochi-tokens.css` and avoid hardcoded global colors.
- **Only a narrow layout breaks:** inspect the existing `@container` rules, and check both 320px and 390px before merging. Do not remove responsive rules just to make desktop work.
- **Browser test cannot find Playwright/Chromium:** use an existing configured toolchain or ask the maintainer to run the optional browser checks. The normal frontend build needs Bun and the project's dependencies, not Playwright.

The small TypeScript files that used to hold CSS now import named sections. They contain no component-style definitions. Those adapters retain the original cascade/insertion order; normal styling edits belong in these two CSS files.
