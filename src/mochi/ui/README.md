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
--mochi-sidebar-width: 280px;       /* desktop conversation list */
--mochi-chat-font-size: 16px;       /* message text */
--mochi-bubble-radius: 26px;        /* main bubble corners */
--mochi-message-avatar-size: 40px;  /* messenger portrait and its frame */
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
| `--mochi-space-xs` through `--mochi-space-xl` | Shared spacing scale |

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

## Compact messenger dimensions

The character-first messenger adds these CSS controls. Change them in `mochi-tokens.css`, then rebuild the frontend as above:

| Variable | What it changes |
|---|---|
| `--mochi-message-avatar-size` | Portraits beside messages (for example `40px`) |
| `--mochi-list-avatar-size` | Conversation list portraits |
| `--mochi-header-avatar-size` | Active character portrait in the header |
| `--mochi-profile-avatar-size` | Large profile-panel portrait |
| `--mochi-message-gap` | Space between separate messages |
| `--mochi-messenger-control-size` | Toolbar hit target; keep at least `40px` |
| `--mochi-messenger-font` | Messenger font; inherits the host font variable by default |

`--mochi-avatar-size` still controls compatibility views; use the more specific message token for the messenger. Bubble padding still uses `--mochi-bubble-padding-x` and `--mochi-bubble-padding-y`. Sidebar and profile panel widths still use the original width tokens.

Group chats have a **Group icon** picker under **Chat Settings → General** (and in New Chat after choosing at least two characters). Choose a built-in local icon or **Automatic member portraits**, then **Save settings**. This changes the group’s presentation, never its members or stored speaker identities. Converting a group to a direct chat restores the character portrait. Custom image uploads are not part of this picker.

For focused messenger screenshots, run `node scripts/check-mochi-messenger-ui.mjs` with the same browser/toolchain variables described above. Optionally set `MOCHI_MESSENGER_OUTPUT` to an evidence folder. It exercises synthetic direct/group chats, profiles, group icon editing, new chats and fictional-profile switching at 1280, 390 and 320px in three themes. No real login switching or host reload is involved.

## Part 1 messenger refresh

The conversation tools are **directly above the message composer, at the bottom of the chat**. Search, Notifications and Participants are permanent header buttons. Click the character portrait/name to open their profile. Chat Settings is the fixed cog at the right end of the bottom toolbar. Saved custom tool visibility/order remains separate; no saved toolbar records are migrated. New unsaved defaults show Presets, Pins & Notes, Memory and Preview.

Next Responder is the small icon **inside the message field, immediately before Send**. Open it to select Automatic or an eligible character. It changes only who answers next, not Natural/Instant/Manual mode.

Useful refresh tokens:

| Token | Purpose |
|---|---|
| `--mochi-sidebar-width`, `--mochi-profile-panel-width` | Default 320px conversation list and 300px profile column |
| `--mochi-bubble-line-length` | Message line-length cap (`62ch` by default) |
| `--mochi-header-icon-size` | Permanent header and bottom tool glyph size |
| `--mochi-composer-min-height` | Minimum message-field height |
| `--mochi-panel-radius`, `--mochi-radius-card`, `--mochi-radius-field`, `--mochi-control-radius` | Distinct panel/card/field/control rounding |
| `--mochi-action-duration`, `--mochi-action-stagger` | Message-action bounce duration and right-to-left delay |
| `--mochi-action-lift` | Selected-bubble lift (`-2px`) |

Click/tap a bubble, long-press it, or focus its message and press Enter to show its actions. Escape dismisses and returns focus to the message. Reduced-motion preference disables the bounce and lift. Messages remain separate records and bubbles even when grouped visually.

Wide layouts (1280px and above) show the profile by default. Medium layouts start closed; narrow screens open it as a dedicated view. Manual desktop open/close is remembered **for this browser tab’s session, keyed by the authenticated Lumiverse owner** when available. Narrow-screen automatic collapse does not rewrite that desktop choice. This adds no shared preference migration or cross-device setting.

The character profile intentionally shows **No Mochi bio saved yet** rather than republishing an AI description. Bio editing belongs to Part 2.

Run `node scripts/check-mochi-refresh-ui.mjs` for focused refresh checks. Set the same browser/toolchain variables described above, and optionally `MOCHI_REFRESH_OUTPUT`. It checks wide/medium/390px/320px layouts, inherited themes, bottom toolbar placement, responder selection, grouping, action selection/animation, Stop and fictional-account isolation. The older messenger check command forwards to this check.
# Live Mochi-only overrides in Lumiverse

Lumiverse 1.2.5's existing Custom CSS panel writes CSS into the same document as
extension drawer tabs and floating windows. You can use that panel for a local
Mochi-only override without rebuilding. Enable Custom CSS there, then try:

```css
.mochi-view.mochi-view {
  --mochi-chat-font-size: 17px;
  --mochi-bubble-radius: 12px;
}
```

The repeated class deliberately gives the rule higher specificity than Mochi's
embedded defaults, even when the extension inserts its styles later. The rule
does not change the rest of Lumiverse. Removing it restores the inherited
defaults. This exact example was checked in a synthetic shared-document browser
fixture; the owner's installed Custom CSS settings were not edited. Host safe
theme mode or disabling Custom CSS prevents these overrides from being applied.
There is no additional Mochi stylesheet loader or CSS editor.

For distributable changes, continue editing the ordinary CSS files and rebuilding
the frontend as described below. Live Custom CSS is a local host setting, not a
replacement for committing a matching compiled extension.

## Native semantic roles (Lumiverse 1.2.5)

Mochi now reads verified host theme roles before Pocket compatibility aliases.
You can override these Mochi-only variables with the same higher-specificity
`.mochi-sidebar.mochi-sidebar` or `.mochi-view.mochi-view` selectors:

| Mochi variable | Default host role |
|---|---|
| `--mochi-drawer-bg` | `--lumiverse-bg-deep` (actual outer drawer backdrop) |
| `--mochi-sidebar-bg`, `--mochi-input-bg` | `--lumiverse-bg` |
| `--mochi-elevated-bg` | `--lumiverse-bg-elevated` |
| `--mochi-section-bg` | `--lumiverse-fill-subtle` |
| `--mochi-accent`, `--mochi-account-accent` | separately editable Mochi brand accent |
| `--mochi-selected-bg` | `--lumiverse-primary-015` |
| `--mochi-hover-bg` | `--lumiverse-fill-hover` |
| `--mochi-text` | `--lumiverse-text` |
| `--mochi-muted` | native muted text mixed slightly toward normal text for contrast |
| `--mochi-border`, `--mochi-border-hover` | native border / border-hover |
| `--mochi-focus`, `--mochi-focus-bg` | Mochi accent outline / native primary-010 supporting ring |
| `--mochi-danger`, `--mochi-danger-hover`, `--mochi-danger-bg` | native danger / danger-hover / danger-015 |

`--mochi-accent` now uses the separately editable `--mochi-brand-accent`.
Its HSL defaults are set by `--mochi-brand-hue`, `--mochi-brand-saturation`, and
`--mochi-brand-lightness`. Structural backgrounds and text still inherit the
Lumiverse theme. Selected navigation also has a checkmark and a thicker leading
border. The host's own controls keep their native accent.

`--mochi-on-accent` uses `contrast-color()` where available. Older browsers use
`--mochi-brand-contrast` (black by default), verified against the default brand
accent. If you choose a substantially darker custom accent, also set its readable
foreground. Test your own palette. Arbitrary custom CSS can reduce contrast.

Compact editor dimensions are exposed as `--mochi-editor-control-height`,
`--mochi-editor-gap`, and `--mochi-editor-radius`. Desktop controls default to
34px; mobile/coarse-pointer targets are at least 40px. Full add-on text remains
in expandable details, with scrolling rather than data truncation.

The identity dock is at the bottom of the messenger conversation-list sidebar.
Accounts and editing remain in the outer Pocket/Mochi sidebar, reached with each
account row's cog or the messenger dock's cog. The outer Accounts page has no
duplicate identity dock.

## Part 2B: shared settings and safe Custom CSS overrides

Personal → Appearance changes density. Personal → Toolbar previews, hides and
reorders the optional bottom shortcuts. Permanent header actions and the fixed
Chat Settings cog remain available. Personal → Accessibility has independent
interface (85–150%) and message (85–170%) sliders. They preview immediately;
Save presentation stores them for this Lumiverse login across its fictional
Mochi accounts. Cancel restores saved settings. Each text slider has its own reset.

On first setup, any previously saved account layouts are offered by name and
source ID with a toolbar preview. Choose one, or New defaults, then Use selected
shared layout. Original layout files stay intact. Setup is retried safely after
an interrupted write. Subsequent edits use the shared record; they do not edit
account identities or chat contents. Native login switching has not been accepted.

### Stable styling variables

| Purpose | Variables |
| --- | --- |
| Accent and its text | `--mochi-accent`, `--mochi-brand-accent`, `--mochi-brand-contrast`, `--mochi-on-accent` |
| Surfaces | `--mochi-drawer-bg`, `--mochi-surface`, `--mochi-sidebar-bg`, `--mochi-section-bg`, `--mochi-elevated-bg` |
| Text and boundaries | `--mochi-text`, `--mochi-muted`, `--mochi-border`, `--mochi-input-border` |
| Selected and focus states | `--mochi-selected-bg`, `--mochi-focus`, `--mochi-focus-bg`, `--mochi-hover-bg` |
| Button/input styles | `--mochi-control-bg`, `--mochi-input-bg`, `--mochi-accent-hover`, `--mochi-danger`, `--mochi-success`, `--mochi-warning` |
| Sizes | `--mochi-editor-control-height`, `--mochi-messenger-control-size`, `--mochi-header-icon-size`, `--mochi-mobile-control-size` |
| Radii | `--mochi-radius-panel`, `--mochi-radius-card`, `--mochi-radius-field`, `--mochi-radius-button`, `--mochi-bubble-radius` |
| Text enlargement | `--mochi-interface-scale`, `--mochi-message-scale`, `--mochi-chat-font-size` |
| Layout | `--mochi-bubble-max-width`, `--mochi-bubble-line-length`, `--mochi-sidebar-width`, `--mochi-profile-panel-width` |

The layering is: native theme → scoped Mochi defaults → saved settings' backing
variables → your explicit public-variable override. Saved runtime settings only
write `--mochi-saved-interface-scale` and `--mochi-saved-message-scale`; they do
not write the public aliases inline. Override the public aliases, not those
backing variables. Nested Mochi surfaces define their own defaults, so target all
listed roots with the repeated class names below. This also wins when native
Custom CSS was inserted before extension styles. No `!important` is needed.

Paste this in Lumiverse's existing Custom CSS editor for a local preview:

```css
.mochi-view.mochi-view,
.mochi-sheet.mochi-sheet,
.mochi-sidebar.mochi-sidebar,
.mochi-workspace.mochi-workspace {
  --mochi-sidebar-width: 340px;
  --mochi-interface-scale: 1.05;
  --mochi-chat-font-size: 17px;
  --mochi-bubble-radius: 14px;
  --mochi-message-avatar-size: 42px;
  --mochi-radius-field: 8px;
}
```

Custom CSS changes are immediate and local to Mochi. For a source CSS edit,
rebuild the frontend and commit the matching `dist/frontend.js` as described
above. A CSS-only edit does not require backend changes. Publication to GitHub
does not authorize reloading a hosted extension with active users.

## Character defaults and About Me

Chat → Characters & Texting → Edit opens chat overrides, character-wide texting
defaults, Availability, and Mochi Character Profile. Chat → Availability &
Schedules opens the same character availability editor plus conversation jobs.
Character defaults have their own Save character profile button. Chat overrides
use Save settings; existing presence and schedule actions explicitly apply now.
About Me is optional public-facing Mochi metadata, never native AI instructions.
The original character card is unchanged. Defaults are per authenticated owner
and stable character ID, shared across that owner's fictional accounts.

Explicit chat values win, then character defaults, then existing fallbacks.
Texting fields merge by key. Use character texting defaults removes the chat
style after Save settings. Use character availability defaults applies now;
clear any scheduled status transitions in that chat first. Message schedules
stay in their original conversation. Character defaults never contain schedules.
Defaults are resolved when rooms are read and excluded from saved room files;
changing defaults does not rewrite histories or explicit overrides. Active reply
or summary jobs block character-default saves until they finish. Refresh after
a stale or failed save, review your values, then retry explicitly.
