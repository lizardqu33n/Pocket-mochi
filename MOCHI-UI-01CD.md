# UI-01C / UI-01D follow-up — navigation and menu refinement

2026-10-15. Local source implementation and targeted verification; actual visual
acceptance remains pending. No new sidebar/server rail or social system.

## Baseline and scope

Checkout `<mochi-review-checkout>`, branch
`codex/mochi-desktop-01b-base-review`, HEAD
`c3e036d02f500bfd00c2c6326d1245ee63353714`.
UI-01A/01B and acceptance work already existed uncommitted. Extended the same
working tree; no reset, unrelated commit, branch change, push or installation.
Earlier reports, source functionality and runtime backups remain preserved.

The annotated reference supplies composition and hierarchy, not permission to
copy character text/art or add social features. Earlier current-layout screenshots
showed oversized management controls and tool framing. This pass retains the three
panels and compact header while simplifying navigation further.

## What changed

- Left: branding → compact fictional-profile identity/switch/settings → scoped
  conversation search → **All / Unread / Groups / + New Chat** → conversations.
  All/Unread/Groups are real, local views of the selected account's existing rooms.
  Unread uses unread notification records attached to those rooms; Groups means
  more than one character. Both combine with title/participant text discovery.
  Filtering does not navigate, acknowledge, clear notices, cancel work or save.
  No Requests or friends database was introduced.
- New Chat reuses the existing creation button and its guarded handler. Its updated
  accessible name is also used by the empty-account keyboard focus fallback.
- Notifications: the original control/handler now sits in the active room's icon
  row, between Details and More. Without a selected room it remains accessible in
  a small top-right toolbar in the main pane. Removed from the conversation list;
  notification records, counts, clearing and navigation semantics are unchanged.
- Header: Search / Details / Notifications / three-dot options. Icon controls retain
  accessible names/tooltips and use the original handlers. Messages, composer,
  generation modes, launcher and shared-session ownership are untouched.
- Details: retains real character portraits/nicknames and availability; adds a
  restrained **Schedule snapshot — No current activity available** placeholder.
  No fake biography, member-since date or activity is shown.

### Schedule snapshot boundary

Inspected `scheduling.ts:PublicRuntime/publicRuntime` and the current character DTO.
Available data is reply opportunities/delivery jobs, status/eligibility transitions
and idle allowance—not an authoritative current fictional activity. Job kind,
due/expiry/delivery time cannot safely imply “working” or “sleeping.” The placeholder
therefore makes no inference and introduces no new scheduler. A future projection
can replace it when an authorized activity field exists. Bio/cover/character-created
metadata also remain absent from the current frontend DTO; no backend expansion.

### Menu visibility correction

Source inspection found the menu's core surface/position/action styles in
`src/styles.ts:PHONE_STYLES`, using `--lp-bg`, `--lp-text` and other phone variables
without local fallback. The independent Mochi window establishes its own fallback
surface/text variables, but the menu previously supplied only size/overflow rules.
That dependency can leave the independent popup without a usable surface/text
when phone variables/styles are unavailable. This is a confirmed source-level
dependency gap; the precise live computed-style failure was not profiled here.

Added Mochi-scoped positioning, surface/text fallback, border, shadow, z-index,
44px actions, bounded scrolling and explicit closed-menu hiding. Hover/focus/active
states remain visible through background and accent outlines. Escape closes and
restores the opener; focus-out and original action routing remain intact. Scope
is `.mochi-desktop`, so native Pocket Messages styles were not edited.

The menu still exposes Participants, Settings, Pins & Notes, Conversation Memory,
Presets, Search conversation and Preview AI prompt. No advanced feature was removed
or silently changed. Actual rendered contrast and clipping still need acceptance.

## Files changed in this follow-up

- `src/mochi/view.ts`: local conversation view state, filter controls/composition,
  notification relocation and New Chat label. Added state clears at account-scope
  reset and private teardown; no persistent preferences.
- `src/mochi/desktop-styles.ts`: filter/navigation and snapshot styles, standalone
  popup surface/text/layering/focus/closed-state rules.
- `src/mochi/details-panel.ts`: honest optional activity placeholder.
- `src/mochi/workspace.ts`: empty-list keyboard fallback now targets New Chat.
- `tests/mochi-ui-shell.test.ts`: filter/query intersection, read-state preservation,
  header notification location, menu CSS contract and Escape/opener regressions.
- `tests/mochi-desktop-layout.test.ts`: new label and empty-account Back focus test.
- `dist/frontend.js`: matching built implementation.
- `ROADMAP.md` and this report: verified progress and pending acceptance.

No edits to backend, generation, prompt/memory logic, scheduler, session owner,
schemas, quotas, provider connections or host authentication. Backend artifact is
byte-identical. Existing uncommitted acceptance/candidate changes are earlier work,
not a new readiness or release decision from this follow-up.

## Verification (small sequential selections)

| Selection (`tests/*.test.ts`) | Tests | Assertions |
|---|---:|---:|
| `mochi-ui-shell`, `mochi-desktop-layout` | 16 | 170 |
| `mochi-session`, `mochi-window`, `mochi-sidebar`, `mochi-beta-ux`, `portal` | 45 | 390 |
| `mochi-search`, `mochi-presets`, `mochi-memory`, `mochi-summarization` | 92 | 889 |
| `mochi`, `mochi-scheduling-lifecycle` (imports accounts) | 87 | 650 |

**240 distinct tests / 2,099 assertions / 14 distinct files passed.** No final
failures; iteration reruns excluded. An initial shell assertion still targeted
the removed sidebar tools row; it now verifies the requested filters and actual
notification location. No visual baseline replacement. Fixtures use synthetic
storage/providers and JSDOM, not actual browser/provider acceptance. CSS contract
checks prove explicit rules exist, not that contrast/popup pixels pass visually.

One typecheck passed. One production build passed, sequential backend → frontend;
no runtime source changes followed it. No full suite, Chromium, browser, host
startup, installation or live provider requests. Matching built pair:

| File | SHA-256 |
|---|---|
| Frontend | `58A35491BD91D49663A9E3E27DA006D071A2E4C3B7F9BDB779F1AC12DD261C14` |
| Backend, unchanged | `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B` |

Prior UI-01B pair hash-verified in ignored `tmp/ui-01cd-before-bundles/` before
building. Earlier UI-01A/MEM/01C backups untouched. No installed bundles/data changed.
The pinned beta candidate was not relabeled or overwritten by this checkpoint;
known same-browser real-user limitation and false readiness remain unchanged.

## What remains visually rough / manual acceptance

No after-screenshot or browser inspection was authorized. Column proportions,
very narrow filter wrapping, four-icon header fit and popup clipping at minimum
window height remain visual checks—not known rendered successes or failures.
Details is intentionally sparse where character metadata is unavailable; the
snapshot is a placeholder rather than a routine or delivery promise.

After a separately approved paired update of the existing disposable Windows
`lumiphone`, using compatible backups and no production data:

1. Inspect 320/390/900 and 1070–1100/1200 container widths, light/dark and zoom.
   Confirm no rail, overflow, hidden action or squeezed composer; list/chat/details
   navigation and focus remain usable.
2. Exercise All/Unread/Groups with DM/group/unread/read rooms and discovery text.
   Check real-time replies/read updates, empty views and fictional-profile/legacy
   switching. Filtering must not delete, acknowledge or change selected chat.
3. Use top-bar notifications in a chat and with no chat selected. Confirm original
   dismiss/clear/read/navigation behavior and unsaved-change warnings.
4. Open More while Pocket's phone is closed: every action must have opaque readable
   framing and visible hover/focus; scroll the menu at minimum window height.
   Escape/focus-out should close; tools invoke existing handlers and confirmations.
5. Toggle Details during a reply/summary, preserve composer/quote/suggestion and
   scroll, test incoming refresh and verify only real availability is presented.
6. Search older messages, open memory/presets/pins, Stop/Continue and use launcher/
   portal handoff. Verify native Pocket independently. Capture synthetic screenshots
   for review without private RP text.

Follow existing controlled update and memory-v2 rollback constraints in the
acceptance reports. No update or access to Ubuntu is authorized by this plan.

## Deferred to full settings/UI modernization

Goal-oriented General/Texting/Memory & Prompts/Availability/Advanced settings,
shared tool/dialog primitives, deeper onboarding and final themes remain separate.
Richer biography/cover/member metadata and actual activities need reviewed data
contracts; no source leakage or speculative scheduler inference. No automatic
next UI milestone, publication, deployment, commit or push. Stop for review.
