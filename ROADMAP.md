# Pocket evaluation backlog — 2026-10-06

## Mochi development order (user-approved update, 2026-10-13)

Desktop foundation 01B–01F is source-implemented with targeted simulated tests.
01E3 navigation was manually tested by the user; 01F still requires review and
manual Windows acceptance. Silent real-user switching and external-hide launcher
synchronization remain host API limitations. This is not public-beta readiness.

Messaging Improvements MSG-01A quoted replies are manually accepted by the user.
MSG-01B persistent user reactions and bounded prompt attribution passed targeted
verification and initial user manual testing. Optional
same-call AI reactions are deferred pending durable delivery metadata support.
MSG-01C chat pins and independent system notes passed core user manual checks.
Notes use one default position; future presets remain deferred. MSG-01D current-room
search passed core user manual checks. MSG-01E character texting overrides and
restored-composer sizing passed targeted development verification and user manual
acceptance. Messaging Improvements' implemented scope is accepted; broader release
readiness still depends on the remaining phases and safety checks. AI
reactions remain explicitly deferred. MEM-01A architecture review is complete.
MEM-01B structured context resolution and authenticated prompt preview are
development-verified with golden comparisons and matching bundles; manual review
remains pending. MEM-01C versioned custom presets and explicit room bindings are
development-verified with matching runtime bundles; combined MEM-01B/01C manual
acceptance remains pending. MEM-01B/01C are now provisionally accepted by the user,
with full live regression and multi-user acceptance still pending. MEM-01D manual
context macros/placement, focused preset workspace polish and empty-response clarity
are development-verified with matching bundles; manual review remains pending.
MEM-01D has received initial user manual testing; comprehensive acceptance remains
pending. MEM-01E manual conversation summaries, exact prefix coverage, recoverable
versions and opt-in outgoing-history exclusion are development-verified with
matching bundles and targeted synthetic/DOM tests. Real-host acceptance remains
pending. MEM-01F explicit AI-assisted Generate/Preview/Edit/Apply summarization is
development-verified with source-proof checks, shared task/quota ownership and
matching bundles. Combined MEM-01E/01F disposable-host manual acceptance remains
pending before MEM-01G. Automatic memory extraction/background summarization has
not begun. Later UI Modernization & Settings Reorganization must research genuinely
beginner-friendly interfaces rather than merely rearranging existing controls.
Messaging order: MSG-01A quotes, MSG-01B reactions, MSG-01C pins, MSG-01D search,
MSG-01E texting preferences and polish, then Memory & Prompt Management.
Friends Beta 1 is tentatively hoped for Friday, October 16, 2026, explicitly
not a deadline; an earlier beta is possible only if necessary features and safety
checks are ready. Data safety, compatibility and testing take priority.

1. Messaging Improvements.
2. Memory & Prompt Management — friends Beta 1 begins.
3. Fictional Time & Character Routines.
4. AI-Assisted Creation — Introductory Tools.
5. Optional RP Linking — planned wider Beta 2 testing, subject to Kitty's agreement.
6. Bug Fixes & Stabilization.
7. Pocket Ecosystem Integration — deeper scope dependent on Kitty's input.
8. Settings Reorganization.
9. First Theme Pass: Colors — eventual 1.0 when stable and ready.

Essential layout, responsiveness, contrast and accessibility fixes remain allowed
throughout development; keep styling scoped and centralized. More ambitious mascot
cosmetics, AIM/MySpace-style themes and advanced AI memory generation are post-1.0 ideas. The user supplies the
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
