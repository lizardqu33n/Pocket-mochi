# Pocket evaluation backlog — 2026-10-06

## Mochi development order (user-approved update, 2026-10-13)

Desktop foundation 01B–01F is source-implemented with targeted simulated tests.
01E3 navigation was manually tested by the user; 01F still requires review and
manual Windows acceptance. Silent real-user switching and external-hide launcher
synchronization remain host API limitations. This is not public-beta readiness.

Messaging Improvements MSG-01A quoted replies are source-implemented with targeted
synthetic verification; manual acceptance and review remain pending. MSG-01B has
not begun. Friends Beta 1 has a tentative October 17–18, 2026 target, explicitly
not a deadline; data safety, compatibility and testing take priority.

1. Messaging Improvements.
2. Memory & Prompt Management — friends Beta 1 begins.
3. Fictional Time & Character Routines.
4. Optional RP Linking — planned wider Beta 2 testing, subject to discussion with Kitty.
5. Bug Fixes & Stabilization.
6. Settings Reorganization.
7. First Theme Pass: Colors — eventual 1.0 when stable and ready.

Essential layout, responsiveness, contrast and accessibility fixes remain allowed
throughout development; keep styling scoped and centralized. More ambitious mascot
cosmetics and AIM/MySpace-style themes are post-1.0 ideas. The user supplies the
replaceable Mochi shortcut SVG; Pocket's icon is unchanged. No agreement from Kitty
to share the branch or conduct wider beta testing is implied.

Main Lumi is the evaluation environment. Update LumiTest after this pass, not during it.
Preserve messaging/candidate commit behavior; changes below are targeted fixes and presentation work.

## Functional fixes

- [x] Setup: in-phone Run setup / Skip invitation avoids the greeting race; chat lifecycle and resume controls.
- [x] Setup: clear hierarchy, unclipped authorship choices, native connection/model controls.
- [x] Setup controls/hierarchy first pass: theme-aware sections, short authorship labels, native select/model controls, resume action.
- [x] Enrichment: thinking/writing/completion/error feedback; unlock retry without losing edits.
- [x] Generation: current connection/model selection verified by the user across two providers and four models on main Lumi.
- [x] Messages: cancellable generation with stop control.
- [x] Messages: quick manual Here/Away presence assignment.
- [x] Profiles: reusable Pocket Persona and character phone profiles.
- [x] Sidebar: restore hidden launcher; six-device Recent limit, search, single-pass interaction index.
- [x] Sidebar: explicit Show launcher recovery action.
- [x] Mobile fullscreen: convert visual viewport/keyboard offsets to host layout pixels under UI scale; observe scale changes.
- [x] World: setup reseed control, weekly weather outlook and timeline review with proposed event updates.
- [x] Camera: shutter doubles as stop; integrated acceptance.
- [x] Camera: native image pipeline by default, shared checkpoint picker and native settings navigation.
- [x] Swarm: consume published swarm_loras directives, preserve ordered native layers and direct Swarm strengths.
- [x] Gallery: delete Pocket-owned images only, with explicit irreversible-delete confirmation.
- [x] Avatar crop: bake accepted cover framing into a separate square asset; preserve the original photo.

## Presentation and correctness

- [x] Message actions sheet: compact action list replaces the empty/right-stacked layout.

- [x] Remove stale handset 9:16 descriptions (retain valid image aspect options).
- [ ] Remove fixed violet material/atmosphere; neutral incoming bubbles, theme accents and semantic colors.
- [x] Tracker compositions by type: participants/trajectory, state rail, compact vitals, instrumentation.
- [x] Remove duplicate tracker metadata and explain story-triggered versus elapsed-time updates.
- [x] Weather, timeline, camera and Settings first presentation passes.
- [x] Contacts: subtle NPC Bank archive hint; separate portable casts and individual profiles.
- [x] Theme previews use miniature chat UI; visual preset swatches with SVG wallpapers instead of names.
- [x] Associate remaining Settings fields; audit keyboard Space activation and prevent avatar scrolling.
- [x] Appearance: sequential edits preserve theme selection; immediate preview updates, explicit Custom state, OLED presets, bubblegum hearts and soft-orange Sunset with SVG scenery.
- [x] Contacts library navigation, scaled handset sheets and separate conversation invite cards.
- [x] Circular avatars at every UI scale; Gallery paging beyond 120 images; shared contact/NPC avatar uploads and draft portrait source row.
- [x] Narrative clocks use constrained day-part keys; generation supports manual/automatic retry; Timeline updates existing beats automatically.

## Protection and maintenance (after visible UI settles)

- [x] Controlled visual regression matrix: 66 mobile/desktop baselines for home/settings/chat/camera/sidebar/tracker widgets/weather/cards/full phone/connectors and clock precision.
- [x] Expand controlled coverage for handset/UI-scale extremes, long notifications and Appearance palettes.
- [x] Hostile global-theme fixture verifies Shadow DOM isolation and visual stability.
- [x] Separate inline styling from handset/app styling; activity ShadowRoots only receive inline styles.
- [ ] Further shared-token/reset cleanup after the remaining design work.
- [x] Initial controller/backend extraction: app reviews and progress controls.
- [ ] Continue gradual orchestration extraction with unchanged behavior and regression coverage.
- [x] Supplied tracker and weather widget passes integrated; compact handset layouts, condition artwork and forecast capsules.
- [x] Live desktop/mobile connector and clock fallback checks: completed by the user on main Lumi.
- [ ] Catch LumiTest up after main Lumi evaluation.

Verification claims must distinguish unit/contracts, controlled browser fixtures, real provider calls,
and live main Lumi checks. Do not use personal chat data as test fixtures or modify it for convenience.
