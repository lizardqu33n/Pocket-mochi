# CSS-01 Phase 3: icon standardization and owner acceptance

Base: remote `test-mochi` at `b6ee1accc5bd73afbf1760b3af4bbb1623d37d56`.
The original checkout was clean and remains at that base. Work used the fresh
detached `Pocket-mochi-css01-phase3` Git worktree. The target remote was rechecked
without divergence before publication preparation; the final commit/SHA and
normal-push result are reported in the handoff. [Exact changed files](phase3-files.txt).

## Delivered and inventoried

- **58 exact upstream Lucide SVG files**, **97 named/reserved slots**, and
  **246 source action/rendering boundaries** in [icon-inventory.json](icon-inventory.json).
  The [named reference](reference/icons.md) distinguishes artwork keys and semantic
  slots; generic keys are also reserved for compatible reuse.
- Messenger header, toolbar, composer and message actions; Accounts outer
  sidebar and fictional logout; Settings/Personal/accessibility; character and
  account editing; presets/block editor/toolbar preview; prompt preview; custom
  disclosure/selected glyphs; dialogs and window/mobile controls share the slots.
  Mochi-owned shared sheet/portal controls are included. Notifications retain
  character portraits and text; launcher/portal shortcut retain the mascot.
- Existing icon selector/key hooks remain. `data-mochi-icon-action` adds semantic
  identity without renaming the old `data-mochi-icon-slot` artwork key.
  Per-action size/color/stroke/image tokens, global interaction colors and
  optional text-button slots are documented. Explicit v2 custom checkmark and
  chevron pseudo-content overrides remain usable, yielding the new indicator.
- The normal CSS map now contains **1,360 rules / 26 sections**, including the
  icon layer and shared controls. The starter, bundled theme, both READMEs,
  contract, generated references and inventories were updated.
- Retained art/content: Mochi mascot/wordmark; character/account portraits;
  chosen group emoji; reaction emoji; user-authored text. Native browser
  controls remain native. Unrelated Pocket phone/home illustrations, device
  diagrams and app/chart/weather artwork remain outside Mochi ownership.
  The legacy responder font-chevron rule is dormant in the current popup UI.

## Provenance and replacements

[icons/provenance.json](icons/provenance.json) records `lucide-static` **0.468.0**,
its upstream repository, npm tarball and published SHA-512 integrity. The archive
passed that integrity check before copying; each copied SVG has a verified
SHA-256. Archive SHA-256:
`d87c47325f0b2ac3ad2d6f056889da32b8f1216eafe4ed6534bc02786effe8cc`.
The package's actual [ISC license](icons/LICENSE) and the inherited
[Feather MIT grant](icons/FEATHER-LICENSE) are retained locally and in the
frontend bundle. No React dependency, icon font or CDN is required.

[ICON-THEMING.md](ICON-THEMING.md) provides real CSS data-SVG and bundled
[orbit.svg](examples/orbit.svg) examples. Optional `icon-assets.ts` entries are
presentation configuration only. The normal build validates supplied entries;
missing imports fail the build before publication. No owner artwork is required.

The adapter accepts local data SVG/PNG/JPEG/WebP. A strict static SVG shape subset
rejects scripts, handlers, foreignObject, href/external references, style,
animation, DTD/entities and unsupported markup. Owner SVG is parsed detached,
validated, serialized and rendered as an image, never live-injected.

The original Lucide remains visible until a valid image loads with positive
dimensions. Invalid input and image decoding/error events retain it. Original
control name/title, semantics, focus, keyboard and pointer handling stay on the
native control. CSS alone cannot detect load failure: image tokens are read by
the adapter after mount; runtime external-editor changes require view refresh
or the documented refresh event. Bundled CSS/assets require rebuilding the
frontend. Scope/cascade and optional image refresh limits are explicit.

## Validation (small sequential batches)

| Selected unit/regression batch | Passed | Base-reproduced failures |
|---|---:|---:|
| Icons/security, CSS delivery, native roles, v2 contract/measurements | 13 | 0 |
| Accounts/sidebar/mobile/ownership and generation guards | 21 | 0 |
| Window lifecycle/geometry/focus | 12 | 1 |
| Portal/profile/model metadata | 3 | 2 |

**49 passed; 3 unchanged legacy unit assertions failed.** No full-suite pass is
claimed. The two known portal assertions still expect two fieldsets rather than
four, and Participants/Search inside More rather than the current header. The
additional window test looks for `Room instructions` in Advanced, where the
untouched base also returns no such control. All three were reproduced in the
clean original checkout at the base SHA. Their tests were not changed.

The older `check-mochi-css-ui.mjs` also fails its CSS `nowrap` assertion on both
base and Phase 3 (`wrap` on both). It remains unchanged. The separate new
production icon check verifies actual control geometry and operation rather
than requiring that legacy style value.

The final-source browser matrix passed **376 captures**: 31 scenes × four
palettes (dark/light/brown/purple) × 1280/390/320px, plus four desktop 200% CSS
zoom captures. Layout/overflow, scoped theme overrides and existing synthetic
interactions passed. Compared with retained Phase 2 captures, **52 are byte
identical**; icons intentionally change the remainder. The largest pixel change
is **4.2264%** in a 320px dialog with blurred backdrop; sampled before/after
images, including that dialog, were visually inspected. No screenshot equality
claim is made for changed artwork. Digests and comparisons are recorded in
[phase3-validation.json](phase3-validation.json).

Additional focused browser checks passed:

- Twelve four-palette/three-width icon catalog captures, all 97 named buttons,
  accessible-name snapshots, keyboard/disabled behavior and reduced motion.
- CSS SVG and PNG substitutions and the actually bundled `orbit.svg` example.
  Five failure cases retain Lucide: missing path, remote URL, malformed SVG,
  event-handler SVG and undecodable raster. No blank/broken essential action.
- Explicit v2 pseudo-content compatibility and per-action size/stroke changes.
- Production controls at 1280/390/320: toolbar targets at least 40×40, header
  pointer targets at least 24×24, menu Enter/Escape/focus restoration, CSS icon
  resizing without shrinking the button, and a real Presets button whose custom
  replacement preserves its accessible name and pointer routing.
- Browser fixtures use fictional in-memory identities. HTTP requests are blocked
  throughout the matrix; focused icon/production fixtures observed **zero HTTP
  requests** and production provider-call counts were **zero**.

Final typecheck and frontend build passed. Original declaration fingerprints
remain unchanged. Available tools: Bun 1.4.2, Node 25.9.0, local Chromium.
Only `dist/frontend.js` was rebuilt; backend sources/bundle and package/schema/
auth state were not changed. Frontend SHA-256:
`2f77765930645fd778bf10a351b3f464ef98f4d339f4210be6d713e14dfdc176`.

## Owner acceptance still required

Real Lumiverse global Custom CSS order and CSP; physical browser/OS zoom;
actual assistive technology; and contrast/licensing of arbitrary owner themes
and assets remain environment-specific acceptance checks. Automated names and
synthetic zoom do not substitute for those checks. CSS-01 is ready for owner
acceptance, and concludes only after that acceptance.

No beta promotion or installed/hosted Lumiverse access occurred. Real data and
`beta-mochi` were left untouched. Roadmap phase 2C, lorebooks, new reaction
behavior, schema/auth work and theme importers/pickers remain separate work.
