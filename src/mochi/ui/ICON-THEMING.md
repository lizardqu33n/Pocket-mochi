# Mochi icon theming (CSS-01 Phase 3)

Mochi bundles verified **lucide-static 0.468.0** SVG artwork as text assets.
There is no React host dependency, icon font, CDN, runtime package fetch or owner
asset requirement. [Named slots](reference/icons.md) list every supported artwork
key, semantic slot and token family. [icon-inventory.json](icon-inventory.json)
records rendering/action boundaries and retained art; the normal CSS inventory
also includes the new `icons` style layer.

## Coverage and compatibility

Messenger header/toolbar/composer/message actions, Accounts outer navigation,
profile editing, Settings/Personal/accessibility, presets/block editor/toolbar
previews, prompt preview, custom disclosures, dialogs, window chrome and mobile
use the same slot implementation. Mochi-owned shared sheets and portal back
navigation use it without converting unrelated Pocket app icons.

Text-only buttons remain text-only by default; their semantic action families
have optional slots (e.g. save, add, edit, delete, refresh, back, settings).
Unclassified text/content buttons do not acquire invented icons. Native browser
select/checkbox/disclosure/input controls remain native. Search and character
selection retain their labels and behavior. Selected custom checkmarks and
custom disclosure chevrons use Lucide.

Mochi mascot/wordmark (including launcher and portal shortcut), character/account
portraits, owner-selected group emoji and reaction emoji remain artwork/content.
Message/preset/preview text is not interpreted as icon markup. Phone/home portal
illustrations and Pocket-only device/app/weather/chart artwork remain outside
Mochi ownership. The named Lucide `smile` for the React action changes only that
control's visual; reaction behavior is unchanged.

Existing `.mochi-icon-slot`, `data-mochi-icon-slot="sliders"` and
`[data-mochi-icon="sliders"]` hooks remain available. The legacy attribute is
the artwork key. New `data-mochi-icon-action="toolbar-presets"` identifies the
semantic slot. Repeated keys can be scoped to a surface, e.g.
`.mochi-preset-panel [data-mochi-icon-action=save]`. Existing common stroke and
contextual v2 width tokens feed the new slots. Artwork fills the slot; its
internal SVG/image width, height, hidden state and pointer routing are structural.
For square icons, use the new size token to set both dimensions together. The
original public CSS declarations/selectors remain in place; direct SVG sizing
should migrate to slot size tokens, since replacement images share that footprint.
Explicit v2 checkmark/chevron pseudo-content tokens retain their custom glyph;
the corresponding Lucide indicator yields to that legacy override on refresh.

## CSS-only appearance and replacement

Edit `mochi-theme.css` and rebuild `bun run build:frontend`. Bundled CSS is
delivered at every existing style boundary; Lumiverse host colors and v2 scope
and cascade rules remain unchanged. Host global Custom CSS can also set these
variables where its scope reaches the slot.

```css
:where(.mochi-view,.mochi-sidebar,.mochi-sheet,.mochi-window) {
  --mochi-icon-stroke-width: 1.8;
  --mochi-icon-hover-color: var(--mochi-accent);
  --mochi-icon-focus-color: var(--mochi-accent);
  --mochi-icon-selected-color: var(--mochi-accent);
  --mochi-icon-disabled-opacity: .55;
  --mochi-icon-toolbar-presets-size: 20px;
  --mochi-icon-toolbar-presets-color: #ac89db;
  --mochi-icon-toolbar-presets-stroke-width: 2;
}
/* Opt in to icons alongside existing text, without changing behavioral TS. */
.mochi-settings-workspace { --mochi-icon-text-display: inline-flex; }
/* A complete, working static SVG substitution. */
.mochi-view {
  --mochi-icon-toolbar-presets-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%228%22%20fill%3D%22%239866cc%22%2F%3E%3C%2Fsvg%3E");
}
```

All named slots support `--mochi-icon-SLOT-{size,color,stroke-width,image}`.
Global size is optional: `--mochi-icon-size`; unset uses contextual defaults.
`--mochi-icon-text-gap` controls optional text-icon spacing. Set the image token
to `none` to use a bundled owner asset if present, otherwise Lucide. To suppress
a bundled owner asset, remove its registry entry and rebuild.

Use a **quoted** `url("data:...")` value for image tokens. Supported raster
types are base64 PNG/JPEG/WebP. SVG accepts percent encoding or base64. Raster
color is authored in the image; an isolated SVG image does not inherit the
button's currentColor. Give owner SVG shapes explicit colors.

CSS controls the value; the slot adapter validates it and listens for image
load/error. CSS itself cannot detect load failures. Lucide remains visible
while loading, on invalid/missing input, or on decoding failure. Only a loaded
image with positive natural dimensions replaces it. Inspect
`data-mochi-icon-state="default|fallback|custom"` on the slot for diagnostics.

CSS size/color/stroke changes react immediately. Image values are read after a
new view mounts. If an external editor changes CSS after mounting, refresh the
view, or call the optional `refreshMochiIcons(root)` helper. In the browser,
the equivalent is:

```js
document.querySelectorAll('[data-mochi-icon-slot]').forEach(slot =>
  slot.dispatchEvent(new Event('mochi:icons-refresh')))
```

This explicit refresh avoids a persistent document-wide observer. There is no
theme importer/picker or stored theme/asset schema. Repeated delivery of the
same stylesheet does not register duplicate observers or listeners on roots.

## Optional bundled owner assets

Place a local SVG in `src/mochi/ui/owner/` and edit **only the presentation
registry** `icon-assets.ts`, for example:

```ts
import orbit from './examples/orbit.svg' with {type:'text'}
export const MOCHI_ICON_ASSETS = {'toolbar-presets': {svg: orbit}}
```

The included [orbit.svg](examples/orbit.svg) is a working shape-subset example.
PNG/JPEG/WebP assets can instead use `{data:'data:image/png;base64,...'}`. Convert
local raster files to a data URI before bundling. The browser never fetches a
file path. A missing source import fails the build clearly; it does not publish
a broken bundle. Invalid registry assets fail the pre-build check. Runtime
validation also preserves Lucide if an invalid entry reaches it. No behavioral
component TS, backend, account schema or owner font is required.

## Asset security and failure examples

Only local data images of at most 128 KiB encoded input are candidates. SVG
must have a viewBox and the SVG namespace. The accepted subset is `svg`, `g`,
`path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`, with static
shape, transform, fill/stroke and opacity attributes. Scripts, event handlers,
style, foreignObject, image/use, href, external references, animation, unknown
elements/attributes, XML declarations, DTDs/entities and comments are rejected.
This conservative subset deliberately excludes gradients, filters and fonts.
Custom SVG is parsed in a detached document, validated, serialized to a data
image and rendered as an `img`; it is **never injected into the live DOM**.

These examples all retain the original Lucide icon and accessible action:

```css
.mochi-view { --mochi-icon-toolbar-presets-image: url("/missing.svg"); }
.mochi-view { --mochi-icon-toolbar-presets-image: url("https://example.com/icon.svg"); }
.mochi-view { --mochi-icon-toolbar-presets-image: url("data:image/png;base64,AAAA"); }
.mochi-view { --mochi-icon-toolbar-presets-image: url("data:image/svg+xml,%3Csvg%3E"); }
```

An otherwise valid SVG containing `onload`, `script`, `foreignObject` or any
external href is rejected too. Missing/remote paths are rejected before any
image request. Decode failures restore the original; no broken-image glyph is
shown. A host CSP that blocks data images also keeps the Lucide fallback.

Do not hide the fallback manually or implement a replacement solely with
`background-image`, `mask-image`, `display:none` or pseudo-element content when
failure recovery matters. Such CSS has no load-error event. Arbitrary owner CSS
can hide controls, defeat focus or reduce contrast; the slot mechanism cannot
undo deliberate CSS changes.

## Accessibility and licensing

Decorative SVG and image children are hidden from assistive technology; the
native button/link/summary supplies the original name/title, focus and keyboard
semantics. Slots do not receive pointer events or become tab stops. Size tokens
change artwork, not hit targets. Keep existing touch targets and focus outlines;
selected/disabled state remains semantic on the control. There is no icon
animation, and existing reduced-motion rules still apply.

[provenance.json](icons/provenance.json) records the pinned npm tarball, published
SHA-512 integrity and every exact upstream SVG's SHA-256. The archive was
verified before copying. [Lucide LICENSE](icons/LICENSE) is copied from that
version; [Feather MIT license](icons/FEATHER-LICENSE) covers inherited artwork.
Both grants are retained in `dist/frontend.js`. The upstream project's current
[license explanation](https://lucide.dev/license) describes the dual provenance;
the bundled version's actual license remains the authority for these assets.

Run `bun scripts/audit-mochi-icons.ts`, then `bun scripts/audit-mochi-theme.ts`
to regenerate references. Run `bun test ./tests/mochi-icons.test.ts` and the
sequential browser fixtures for security, successful/failed loading and layout.
Real assistive technology, real host Custom CSS order/CSP, owner asset rights
and arbitrary theme contrast remain owner acceptance checks.
