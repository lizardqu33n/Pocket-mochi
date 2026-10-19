# AIGEN-02 — customizable independent Mochi generation

Starting branch: `test-mochi`, freshly verified and cloned at
`3db5d4d351846d1018ef401803d7dfee8298521d` on October 19, 2026.
Protected `beta-mochi`: `de78a44cd3a41c3af14ac911a2c79bef81276a76`.
Publication SHA, exact files, bundle hashes and final checks are recorded in the
publication report outside this checkout, so it can identify its own commit.

## Source inventory and scope

The inventory follows actual provider boundaries and frontend actions, rather
than treating every manually editable text field as a separate generator.

| Existing tool | Source | AIGEN-02 treatment |
| --- | --- | --- |
| AI weekly schedules and optional generated texting tendencies (`x`) | `mochi/routine-generation.ts`, `routine-draft-controls.ts`, `service.ts` | Shared replaceable instructions, all scopes, exact prompt preview/copy, detail preferences. These are one provider request and one reviewed draft. |
| Conversation-memory summary suggestion | `mochi/summarization.ts`, `memory-panel.ts`, `service.ts` | Same shared mechanism and source-prefix preview. Character overrides apply to single-character chats; group summaries use account/feature/global defaults. |
| Ordinary replies, rerolls, natural group replies, scheduled/automatic replies | `mochi/generation.ts`, `context.ts`, presets, prompt blocks, preview | Existing editable preset revisions and prompt preview remain authoritative. No competing reply-template layer; new controls identify the preset tools. |
| Manual character/chat texting settings, About Me, notes, pins, manually edited schedules/memory | Corresponding Mochi editors | No separate model generation exists here. Their existing edit/save behavior remains. |
| Older Pocket NPC/contact drafting and refresh, persona enrichment, scene actor discovery | `backend.ts`: `npc-contact`, `profile-refresh`, `persona-profile`, `scene-sync` | Existing legacy Pocket identity and RP-state system; excluded from this independent Mochi implementation. |
| Older Pocket world seeding, weather outlook and timeline review | `backend.ts`: `continuity-seed`; `backend/app-reviews.ts` | Bound to existing Pocket RP/world state; excluded. |
| Older Pocket DM/group replies, reply/ambient decisions, post-turn audit and tracker judge | `backend.ts`: `message-reply`, `message-retry`, `group-reply`, `reply-decision`, `ambient-decision`, `post-turn-audit`, `tracker-judge` | Existing RP-connected behavior, not new independent Mochi drafting tools; excluded. |
| Camera/image generation and optional scene prompt enhancement | `backend/image-jobs.ts`, `backend.ts`: `scene-planner` | Existing Pocket visual profiles, direct scene/negative prompts and native image provider path; excluded from Mochi's text JSON generation configuration. |
| Connection smoke test | `backend.ts`: `connection-test` | Diagnostic fixed-response probe, not a drafting tool. |

This is universal coverage of **existing independent Mochi generation editors**,
not a claim that every legacy Pocket generator in the repository now supports
this configuration. The concrete boundary is that those tools use RP-associated
PhoneState, DevicePreferences, identity ownership and provider/image paths rather
than Mochi rooms/fictional accounts. Extending them needs separate source,
consent, validation, preview and ownership adapters; silently sharing Mochi
account prompts with them would violate the requested identity separation and
RP exclusion. No RP linking, native lorebook generation, or new generation tool
has been implemented. Future independent tools should register a feature and use
the shared store, interpolation, message builder and semantic controls with their
own immutable schema, authorized source adapter, validator and approval gate.

## Stored settings and precedence

`mochi/v1/generation-prompts.json` is an additive file in authenticated real-user
storage: version, ownerId, monotonically increasing revision, and scoped entries.
There are no database/schema-destructive migrations. Legacy room files are not
rewritten to add prompt settings. Failed writes leave the prior saved file intact
under the existing storage API's semantics.

Precedence is versioned feature default → global → feature → account-specific
feature → character-specific feature within that account. The highest present entry
replaces the **complete prose and detail selection**, not an appended suffix.
Global means all independent Mochi generation tools for this real user; it does
not override reply presets or legacy Pocket settings. Account/character scopes
cannot be supplied by payload owner IDs. They derive from the authorized room.
Legacy unassigned rooms also support character overrides, isolated under an empty
account namespace; those overrides never carry into fictional-account chats.

Saved values contain a default version (`aigen-02-v1`), full instruction text and
minimal/balanced/detailed selection. Missing configuration means the current
versioned feature default. Explicit **Save generation instructions** persists
the selected scope independently of Chat Settings. **Reset to aigen-02-v1 default
and save** writes that version's prose and balanced detail at the selected scope.
**Remove override and inherit** deletes only that scope. Reset and inheritance
are deliberately distinct. More specific saved overrides still win after a reset
of a broader scope. The editor identifies this and preview reports the effective
source; a missing override's editor shows its versioned default.

Writes serialize per real user and reject stale bank revisions. Room-scoped
configuration operations serialize with room edits and validate membership,
association and account ownership. Only applicable global/feature/current-account/
current-character entries are returned to the editor. Another account's prompt
prose is not returned. Browser state is transient, scoped by account, room,
association, revision and character, and cleared on identity-scope reset. No
instruction/source text is written into browser storage. Requests time out with
the edited text retained; reload before retrying an uncertain write.

## Sources, macros and immutable boundaries

All tools accept `{{detail}}`. Schedule instructions additionally accept
`{{timezone}}`, `{{guidance}}`, `{{character_name}}` and explicitly approved
`{{chat_history}}`. Summary instructions accept `{{conversation_title}}` and
`{{chat_history}}` for the visibly selected summary prefix. Global instructions
should use only `{{detail}}`, the intersection supported by both features.
`\{{name}}` produces literal `{{name}}`. Interpolation is allowlisted,
single-pass, and does not evaluate code, recursively expand source values, read
arbitrary properties, fetch URLs, or access host macros. Unknown/unapproved
variables reject construction before a provider call. Source macros remain data.

Schedules retain only the bounded authorized character name/description/
personality/About Me, current routine entries, timezone and request guidance.
History is absent unless the existing explicit approval checkbox is selected:
last 20 messages from this exact Mochi room, up to 2,000 characters each. Summary
source is the existing explicit chronological prefix (not silently trimmed),
participant labels, persona name and optional verified existing summary reference.
The Generate summary action explicitly approves sending that visibly selected
prefix; the UI explains this beside the action. Preview is read-only and does not
call a model. No arbitrary RP history, other room, other identity, connections,
credentials, add-on bodies or provider/token metadata are exposed as variables.
Host failures at the new wire endpoint produce a controlled error rather than
returning a raw host exception that could contain secrets.

The immutable system message carries JSON shape and source/safety rules. Editable
prose is a task value inside the JSON user message, separate from source fields.
Code, not instructions, enforces permissions, source ownership, locks, budgets,
quotas, job ownership, cancellation, revision checks, whole-output validation and
explicit Apply. No instruction can grant tool calls, change a schema, move an
identity or directly save generated content. Summary output now also rejects
fences and unknown keys; schedules retain their existing strict parser.

Instructions are limited to 8,000 characters and expanded prose to 64,000.
Existing source/output limits remain. Both builders count the complete expanded
messages plus output reserve and 256-token envelope. Invalid/negative counts,
oversized prompts, missing counters and revoked sources reject before dispatch.
Summary has its existing 16,384 context / 1,600 output ceiling. Schedule retains
configured room limits, 20,000 output characters and at most 64 blocks. Detail
changes meaningful coverage in the actual model-facing message without adding
hard per-block quotas or automatic fillers.

## Preview parity and stale state

Preview and actual generation call the same builder. The returned message array
includes readable expanded prose and exact JSON source context, with roles,
budget and effective scope. Copy uses the browser clipboard when available, with
selectable text as a fallback. The preview explicitly distinguishes exact
Mochi-built messages from provider/host-added wrappers that Mochi cannot inspect.
Token counts are labeled potentially approximate unless the host confirms exactness.

A digest binds messages to the authenticated owner, room, account, source revision,
association, prompt-bank revision and privately hashed resolved source signature.
When a preview remains selected, Generate sends that digest; changed options,
sources or settings require a fresh preview before a provider call. Without a
selected preview (including after navigation to a different source revision),
Generate builds from the current saved configuration through the same path.
Unsaved editor text is never silently dispatched; it blocks generation until Save
or reload. No preview text is used as a client-supplied provider message.

Generation revalidates sources/settings after counting and before dispatch;
changes during a provider request discard the result. Prompt-bank changes also
invalidate retained generated drafts/suggestions before Apply. This uses a
conservative **bank-wide revision**: even an unrelated prompt save by the same
real user requires regeneration/repreview of older snapshots. Cross-process
compare-and-swap is not provided by the existing storage API; the normal single
backend process serializes saves. Backend restart preserves saved configuration
but expires generated drafts, as before. Provider wrappers remain outside parity.

## Default schedule behavior

The default distinguishes compact encoding from sparse daily life. It asks for
plausible meaningful weekday/weekend sleep, grounded work/study, meals, commutes,
hobbies, downtime, social life and chores without inventing major character facts,
employment, relationships, stereotypes or fixed hourly filler. Matching days are
grouped. Minimal/balanced/detailed are model-facing preferences, not slot quotas.
Sleep examples remain alternatives for day/night workers, respecting explicit
hours, weekends, overnight/week wrap, IANA wall time/DST and nonhuman exceptions.
Existing advisory sleep warnings, editable review, Reject/Regenerate, explicit
Apply, strict JSON, locks, timezone/autonomy and Undo remain. Model-quality claims
require later owner-approved real generation; fixtures alone do not establish it.

## UI contract and manual acceptance

No CSS or aesthetic redesign. Semantic fieldsets, legends, labels, buttons, alerts/
status text, selectable preview and existing Lucide slots integrate into editors.
Stable CSS-01 hooks:

- `.mochi-generation-prompts` and `[data-mochi-generation-feature="schedule"|"summary"]`
- `.mochi-generation-prompt-scope`, `.mochi-generation-prompt-instructions`
- `.mochi-generation-prompt-detail`, `.mochi-generation-prompt-action`
- `.mochi-generation-prompt-status`, `.mochi-generation-prompt-preview`
- Existing icon-slot contract with `data-mochi-icon-action="generation-prompt-save|refresh|back|eye|copy"` and corresponding semantic Lucide slot names.

Owner acceptance on an isolated test host, after choosing to install this build:

1. Chat Settings → Availability & Schedules → character → AI schedule/texting:
   Load defaults, replace the entire prose, set detail, Save, close/reopen. Repeat
   after a later normal host restart. No automatic install/reload is part of this task.
2. Save a global setting, feature setting, two fictional-account settings and a
   character setting. Check effective preview precedence and another account's
   isolation. Test legacy-character isolation separately. Reset and Remove override
   should have visibly different effects; more specific overrides still win.
3. Preview and copy the schedule messages with history off, then explicitly on.
   Confirm sources, expanded values and role labels. Try `\{{detail}}`, unsupported
   variables and `{{chat_history}}` without approval. No unexpected source should appear.
4. Change guidance/timezone or saved instructions after preview; Generate must
   request a new preview rather than send a different reviewed snapshot. Save from
   a second open editor to exercise stale-revision rejection and retained edits.
5. With an owner-approved real model request, compare minimal/balanced/detailed
   routines for a grounded character, including weekends/night-work/nonhuman
   cases. Review JSON and warning text. Nothing applies before the existing Apply
   action; malformed output must reject without repair loops or silent saves.
6. Conversation Memory: select a prefix, Load/Save summary instructions, Preview
   the exact source and optional reference, Generate, edit/review, Apply. Verify
   group summaries use no arbitrary one-character override. Repeat after reopening.
7. Check keyboard focus, textarea/select labels, copy fallback, wrapping and owner
   CSS at physical mobile/desktop widths. Check ordinary replies still use Presets
   and their existing preview, and scheduled replies/locks/quiet hours remain normal.

No physical browser/installed-host acceptance, live provider/model quality test,
legacy Pocket prompt customization, deployment, beta promotion, personal/RP data
access, installed Lumiverse edits or user CSS changes are claimed.

## Synthetic verification

- Final integrated generation/routine/summary/regression group: 104 passed,
  0 failed, 724 assertions. This includes production schedule routing and
  production-view summary prompt routing, Save/Reset followed by reopening and
  backend restart, source revocation during counting, account DTO isolation,
  host-error privacy, precedence, macro escaping, context consent, limits,
  exact preview/dispatch parity, malformed JSON, detail and unchanged ordinary
  replies. The last small interpolation-allocation guard is additionally covered
  by the final unit/preset run recorded in the publication report.
- Broader routines, scheduler, scheduling lifecycle, automatic replies, response,
  generation lifecycle and settings workspace group: 158 passed, 0 failed,
  1,147 assertions. Imported account fixtures run again across separate commands;
  these counts must not be summed as unique tests.
- Final shared-prompt unit/preset run after the interpolation-allocation guard:
  48 passed, 0 failed, 323 assertions. The 18 new AIGEN-02 test cases also include
  three parameterized detail settings. Counts include imported fixtures.
- Type checking, both builds, the frontend CSS-source contract and repository
  contracts pass. Whitespace checks pass and no CSS source changes exist.
- Serial untouched-starting-commit versus final-source comparison of context,
  memory and texting suites: both 66 passed, 5 failed, 676 assertions. The exact
  same five failure names and outcomes were compared; no new failure was added.
  SHA-256 manifest and publication verification are in the publication report.

An earlier development run caught four integration assertions (three source-data
layout checks plus the prior sleep prose's system-message placement), which were
resolved before the passing focused rerun. The sleep regression now checks the
assembled prompt because editable prose intentionally moved out of the immutable
schema message. The other existing assertions were preserved. Five unrelated
context/memory/texting UI failures were reproduced on the untouched starting
commit and are reported separately from passing AIGEN checks; no CSS workaround
or weakened assertion was introduced for them.
