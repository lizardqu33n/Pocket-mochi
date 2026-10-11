# MOCHI-02 — Functional Character Messaging

Implemented locally on the existing `mochi` branch in `Pocket-mochi`, using the accepted
MOCHI-01 working tree as the baseline. No push, pull request, server installation, deployment,
or live provider request was performed.

## Behavior

Mochi stores user messages and character replies in its independent, account-scoped room files.
Room settings select an owned generation connection, automatic replies, context/output budgets,
instructions, and character nicknames. Direct rooms use their character; group rooms support an
explicit responder or automatic selection of one member per reply. Empty Enter/Send continues
without saving a blank user message; Shift+Enter inserts a newline.

Prompts use only room identities, the saved persona snapshot, character definitions, room
instructions, and Mochi message history. The host token counter measures the complete request;
older messages are removed from that request until it fits the configured budget. Stored history
is never trimmed. Messages retain the name and portrait used at the time they were saved.

Mochi calls Pocket's lower-level quiet provider helper directly, with an explicit account and
connection. It does not enter Pocket's RP-linked Messages workflow or read native chat history,
scene context, clocks, or actor memories. Existing phones, profiles, and settings are not migrated.

Room writes use the existing temporary-file replacement protection and revision checks.
Per-account/per-room locks prevent overlapping writes within the extension service. Durable
request receipts prevent repeat sends across service restarts. Generation retains its room slot
until the provider settles, even after cancellation. Stop, leaving the room, and settings changes
abort generation; revision, ownership, existence, and cancellation are checked before committing
a reply. Settings drafts retain their original revision after Refresh.

## Exact files changed in MOCHI-02

These are incremental changes after the accepted MOCHI-01 implementation; Git status also
contains that earlier, still-uncommitted milestone.

| File | Change |
| --- | --- |
| `src/mochi/generation.ts` | New independent prompt assembly, token budgeting, source ownership validation, provider execution, and response validation. |
| `src/mochi/types.ts` | Message, settings, connection, and generation-state types/defaults. |
| `src/mochi/service.ts` | Persisted sends, receipts, generation slots, cancellation, settings, and stale-result protection. |
| `src/mochi/view.ts` | Thread, composer, responder picker, generation controls, room settings, drafts, and responsive layout. |
| `src/backend/generation.ts` | Shared low-level provider helper used by Mochi and Pocket's existing quiet path. |
| `src/frontend/controller.ts` | Cancel Mochi requests when changing room/app, closing, or returning home. |
| `tests/mochi.test.ts` | Targeted storage, generation, ownership, context, cancellation, and navigation tests. |
| `tests/contracts.mjs` | Bundled Mochi composer contract update. |
| `scripts/check-mochi-ui.mjs` | Simulated desktop/mobile messaging interaction checks and preview. |
| `dist/backend.js` | Rebuilt backend bundle. |
| `dist/frontend.js` | Rebuilt frontend bundle. |
| `MOCHI-02.md` | This milestone report. |

No Character Chatroom code, prompts, assets, or bundles were copied in this milestone.

## Verification

- `bun run verify`: passed type checking, both builds, **145 tests / 784 assertions**, and
  Pocket's bundled contracts. This includes the existing Pocket regression suites.
- Targeted Mochi suite: **19 tests / 119 assertions**, all passed. Covers independent persistence
  across restart and simulated active RP/persona changes, stable persona snapshots, preserved
  history, owned connections/characters/personas, repeated sends, overlapping requests, delayed
  results, cancellation, settings changes, deleted room files, malformed output, token limits,
  and stale navigation/settings events.
- `scripts/check-mochi-ui.mjs`: passed at **390px and 900px**, using Chromium **149.0.7827.55**.
  Checks Enter, Shift+Enter, Send, automatic/manual replies, empty continuation, automatic-reply
  setting, Stop, room-switch cancellation, and horizontal overflow. The real Mochi service and
  view run against in-memory host/provider substitutes. The provider deliberately ignores abort
  to verify that late output is discarded. Screenshots were inspected, including the mobile thread.
- Existing `scripts/check-visual.mjs`: attempted and **blocked**, not passed. Its required
  `chromium_headless_shell-1234` executable is absent. Existing baseline metadata requires
  Chromium **151.0.7922.34**; the available browser is a different version. No visual baselines
  or baseline metadata were changed.
- `git diff --check`: passed (Git reports normal local line-ending conversion warnings).
- A second fresh build produced identical SHA-256 hashes for both bundles. Source and built
  bundles agree:
  - Backend: `17df2b358932685a3f13a876e1a481e167e5735d74f780bdf018d210a7add0c9`
  - Frontend: `0aff638773b06714b19c3d6b9dfe8d4350e6fb6d5d5a47e1c838e2a52ce151e4`

## Safe trial

For a provider-free preview, open `tmp/mochi-ui/index.html` after running the simulated UI
script. It uses in-memory demo rooms and loses them on reload. The generated screenshots are
in the same directory. Re-run `bun run verify` for the source/bundle checks.

For later live acceptance, use a separate development Lumiverse instance and test account.
Install this build through the normal development extension flow, open Mochi, create a room,
and choose an owned connection in Room settings. Sending uses that provider and may incur its
normal usage charges. Test direct/group replies, Stop, room switching, refresh/restart, and native
RP/persona changes, then confirm the original Messages app and device switching. No production
mount or server installation has been performed by this batch.

## Remaining limitations

Live Lumiverse/provider integration, physical mobile keyboards, and existing visual baseline
comparisons remain unverified. The host must support quiet generation and message token counting;
unsupported hosts fail with an error while preserving the sent message. Provider replies must
follow the requested JSON format. Group continuation produces one character message per action.
Generation is not streamed, and a provider that never settles after cancellation keeps its room
busy until the extension restarts. The 180-second timer requests cancellation, not forced release.

Locks coordinate one extension service instance; the host storage API provides no cross-process
compare-and-swap transaction. Do not run competing extension instances against the same account
storage. Request receipts and conversation history grow with use; neither is silently pruned.
Source persona deletion/revoked access blocks generation even though its saved snapshot remains.
There is no room deletion UI, message editing, regeneration, import/export, Council support,
background scheduling, lorebooks, linked RP history, mascot animation, or full theme customization.
