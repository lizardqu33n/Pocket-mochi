# Pocket evaluation backlog — 2026-10-06

## Closed Beta 1 release freeze — 2026-10-15

Current feature set and simplified UI are provisionally accepted and frozen. No
new runtime feature or redesign. Acceptance evidence is locally checkpointed at
7bcb422; approved UI/source/pair at 0f8f9ae. Release metadata pins the full source
commit and a 127-file source/runtime package with verified Git blobs and SHA-256.
480 distinct targeted tests / 3,590 assertions and one typecheck passed; one test
is an unresolved auth-gap reproduction, not privacy safety. No rebuild was needed
because runtime source/pair remained unchanged from the verified UI-01C/01D build.
Disposable disk bundles now match; running/browser identity remains unverified.
Restricted beta awaits simultaneous real-user separate-browser host acceptance,
consistent backup/recovery verification and explicit residual-risk/access approval.
General beta remains blocked. See MOCHI-BETA-RELEASE-01.md and the candidate/package
inventories. No push, installation, deployment or friend access is authorized.

## UI-01C / UI-01D follow-up — 2026-10-15

Local navigation/menu refinement adds scoped All/Unread/Groups/+ New Chat filters,
moves notification access to main/header chrome, adds a truthful activity snapshot
placeholder and supplies independent Mochi popup surface/contrast/layering styles.
No new activity model, rails, backend or schema changes. 240 targeted tests / 2,099
assertions, one typecheck and one sequential build passed. Actual browser contrast,
clipping and narrow layout acceptance remain pending. See MOCHI-UI-01CD.md for
hashes, limitations and manual checklist. Prior work remains uncommitted; beta
candidate/readiness and the known auth limitation are unchanged. No installation,
publication or next milestone started.

## UI-01B refinement — 2026-10-14

Screenshot-driven shell refinement is source-implemented: compact original account/
creation controls, character-first Details, smaller integrated Search and corrected
magnifier glyph. Existing handlers/data boundaries are retained; no backend profile
contract, activity data, settings redesign or theme system. 256 distinct focused
tests / 2,247 assertions, one typecheck and one sequential build passed; backend
bundle is unchanged. Actual rendered visual acceptance is pending, not established
by JSDOM. See MOCHI-UI-01B.md for hashes and the Windows manual checklist.
Prior UI/acceptance work remains uncommitted and preserved. No installed runtime,
publication, privacy/readiness status or next milestone changed.

## UI-01A foundation — 2026-10-14

Dedicated Mochi shell now has scoped conversation discovery, left branding/account
tools, a direct room Search action and a collapsible read-only DM/group details
panel. It reuses the session, message components and guarded secondary handlers.
No bio/banner/routines source is exposed by the current DTO; honest fallbacks remain.
327 distinct focused synthetic tests / 2,818 assertions passed, plus one typecheck
and one sequential matching build. Backend bundle is unchanged. Real container
layout, focus, zoom and visual acceptance are pending; JSDOM is not pixel approval.
See MOCHI-UI-01A.md for hashes, manual checklist and proposed UI-01B scope.
Settings modernization and theme work have not started. Existing restricted-preview
limitations/readiness remain unchanged; no installation or publication occurred.

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
matching bundles. MEM-01E/01F were reviewed by the user with superficial testing;
this permits MEM-01G but is not full live regression or multi-user acceptance.
MEM-01G source/privacy/UI assessment is complete with targeted synthetic tests.
General beta readiness is blocked by the unwired trusted real-user transition
boundary. The user has deferred this issue for a proposed restricted preview using
separate real accounts in dedicated browser profiles/devices; it is unresolved,
not harmless or fixed. Memory-capacity management was a G blocker; BETA-FIX-02 provides
bounded, revision-safe Disable/Clear without evicting saved versions. It uses
explicit managed-memory v2 records (legacy v1 loads unchanged); old memory readers
refuse v2, so rollback must not strip this state or overwrite newer histories.
Small cancellation/scope/save-state wording fixes are development-verified with
337 targeted synthetic tests, one typecheck and one matching build. BETA-FIX-01
cannot implement automatic trusted auth teardown within the approved host boundary.
Host cooperation remains required for unrestricted beta. BETA-ACCEPTANCE-01 passed
473 distinct targeted synthetic tests / 3,489 assertions across 26 files, including
simultaneous Alice/Bob legacy and fictional rooms and independent frontend-context
fixtures. One passing known-gap reproduction confirms the auth limitation, not
privacy safety. One typecheck passed; unchanged source/bundles required no rebuild.
Restricted preview remains pending matching-runtime installation, controlled
actual-host separate-browser, memory/visual/native acceptance and an explicit user
residual-risk/access decision. The disposable instance still has older MEM-01F
bundles; it was not updated. General beta remains blocked, releaseReady stays false.
See MOCHI-BETA-ACCEPTANCE-01.md and user-facing MOCHI-BETA-PREVIEW.md.
See MOCHI-BETA-FIX-01-02.md and the updated MOCHI-BETA-CANDIDATE.json. No publication,
installation or next feature milestone is authorized by these development checks.
See MOCHI-MEM-01G.md and MOCHI-UI-UX-AUDIT.md. No runtime/UI changes were made in G.
Automatic memory extraction/background summarization has
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
8. UI Modernization & Settings Reorganization.
9. First Theme Pass: Colors — eventual 1.0 when stable and ready.

Essential layout, responsiveness, contrast and accessibility fixes remain allowed
throughout development; keep styling scoped and centralized. More ambitious mascot
cosmetics, AIM/MySpace-style themes and advanced AI memory generation are post-1.0 ideas. The user supplies the
replaceable Mochi shortcut SVG; Pocket's icon is unchanged. No agreement from Kitty
to share the branch or conduct wider beta testing is implied.

Main Lumi is the evaluation environment. Update LumiTest after this pass, not during it.
Preserve messaging/candidate commit behavior; changes below are targeted fixes and presentation work.

## MEM-01G UI/UX audit addition — source assessment complete

The user approved proceeding after superficial MEM-01E/01F manual review. Its
authentication/privacy, real-user and fictional-account isolation, persistence,
interrupted-write recovery, generation/cancellation, provider/retry and recoverable
beta-candidate work remain primary. The UI audit must not displace those checks.

Include a comprehensive read-only UI/UX Audit & Modernization Proposal in
`MOCHI-MEM-01G.md`, or a clearly linked report. Inventory the desktop and narrow
messenger, sidebar/shortcuts, accounts/room navigation, composer/actions/notices,
settings/texting preferences, presets/editor/macros, Prompt Preview, Memory/AI
summaries, Search, Pins & Notes, dialogs, errors and loading states. Review actual
source, interactions, CSS/container-width behavior and relevant local Lumiverse
patterns, evaluating their limitations rather than assuming they fit beginners.

Provide the five to ten most significant problems with component/style evidence;
plain-language labels and explanations; proposed settings/navigation hierarchy;
a beginner first-use workflow; desktop/narrow-window recommendations; safe pre-beta
fixes; a prioritized modernization backlog; and screenshot/visual/user-test needs.
Inspect discoverability, developer terminology, Publish versus Apply, Generate
versus Save, invalid memory recovery, leaving during generation, provider errors,
action hierarchy, density, component boundaries, dirty/disabled/selected/loading
states, nested controls, keyboard focus and scrolling.

Classify proposals as A: beta-critical usability/safety issues, B: safe pre-beta
clarity/focus polish, and C: post-beta cohesive modernization. Recommend narrow A
fixes; implement B only when isolated, justified and testable within the approved
checkpoint; document larger work as proposals. DOM labels/width fixtures do not
prove usability. Without separately authorized screenshots/browser inspection,
label findings as source/structure evidence, not verified pixel appearance or
actual multi-user acceptance. Keep verification narrow and sequential; no push,
installation, deployment or actual-host/browser startup without separate approval.

UI Modernization & Settings Reorganization is a researched, cohesive design effort:
reusable cards/fields/toolbars/dialogs, consistent navigation and visual hierarchy,
approachable default workflows, progressive disclosure of prompt controls and
cleaner preset/memory/character tools. Merely moving fields into accordions is
insufficient. The later color Theme Pass does not replace this structural work.

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
