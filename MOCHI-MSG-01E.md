# MOCHI-MSG-01E — Character Texting Preferences

Isolated review branch: `codex/mochi-desktop-01b-base-review`.
Starting clean HEAD: `1c209a06a4f4d4ccb608d64c782bd9e25421d622`.
Checkpoint commit: the commit adding this report (`git log -1 -- MOCHI-MSG-01E.md`).
Nothing pushed, installed, deployed or started in an actual host/browser.

## Inspection and supported scope

`MochiSettings` previously contained room instructions, character room-name overrides,
provider/model/token controls, automatic replies, modes and AI timing suggestions.
Presence/availability and jobs live in room runtime, not texting-style preferences.
`MochiAccounts` has profile identity/selection, not a character-relationship/style bank.
There was no dedicated AI-character length/capitalization/punctuation/emoji setting.

Pocket does have `phoneProfile.textingStyle` (`src/types.ts`,
`src/domain/contacts.ts`, `identity-profiles.ts`, `npc-bank.ts`). Mochi's Pocket persona
snapshot includes that text in the **user identity**, not AI-character overrides
(`MochiService.persona`). Native Pocket contact/NPC controls are separate systems;
this checkpoint does not import them or overwrite source cards. The current Mochi
roster uses authorized source character description/personality/scenario, retained
unchanged. A character card can naturally describe texting habits, but that is not
an independently editable Mochi override and is not copied into a second field.

The existing supported override scope is **room plus stable character ID**, nested
under the owning real user and fictional account. This implementation follows that
scope instead of introducing a parallel account-character store. Settings are not
automatically shared across every conversation of a fictional account. A future
relationship-wide default would require a separately reviewed resolution layer.
Explicit room reassignment preserves its styles with the room, as other room context.

## Controls, representation and defaults

Optional `MochiSettings.textingStyles: Record<characterId, TextingStyle>` contains:

- `length`: short / balanced / detailed.
- `capitalization`: lowercase / natural / formal.
- `punctuation`: minimal / natural / expressive.
- `emoji`: rare / occasional / frequent.
- `tone`: optional texting-habits description, maximum 400 characters.

Every selector defaults to **Character default**, represented by absence rather than
a forced balanced/natural value. Existing rooms add no style prompt text and need no
migration. Empty entries/blank tone normalize to absence. No default AI behavior,
reply mode, provider, schedule or persona changes. Informality and sentence habits
fit the bounded description. Separate informality/double-texting controls are not
added; this checkpoint cannot deliver independent double-text bubbles and does not
pretend otherwise.

Controls appear within the existing expandable per-character room-settings section;
they use existing visual conventions and staged Save settings behavior. No new
settings categories or full-screen redesign. Opening controls does not save or dirty
the form. Edits participate in existing unsaved-change protection. Labels are
accessible, fields wrap and existing focus styles are extended narrowly.

## Persistence and safeguards

Existing authenticated room reads, fictional-account ownership, membership/source
checks, revision locks and atomic pending-file replacement are reused. Validations
reject unknown style keys, unsupported option values, oversized/non-string tone,
malformed/dangerous character identifiers, invalid containers and over 100 entries.
Style edits require current room membership. Previously saved styles for removed
characters remain recoverable, but cannot be edited while absent and never apply to
another responder. Source refresh does not erase configured styles. Original
character cards, profile snapshots, histories, reaction/reply metadata and unrelated
settings remain intact.

Changed style saves follow the **existing room-settings context-change rules**:
advance revision, abort that room's interactive generation, and cancel pending
context-invalid jobs while retaining their scheduling records. Prepared draft payloads
are removed by that existing cancellation path. The UI explicitly warns that Save
may cancel pending replies. This is not a new scheduling policy or an attempt to
modify an already-running prompt. Unchanged/default saves remain no-ops. Unrelated
rooms/accounts are untouched; quotas, retry receipts, modes and scheduling execution
remain unchanged. Failed writes preserve committed records.

## Actual prompt behavior and future extension points

`resolveTextingStyles` is one separately identifiable optional section. The prompt
builder appends it once to the existing system content, attributing each configured
row to exact eligible character ID/name. DM and group generation resolve each
character's own room override. Nonparticipating/unconfigured characters contribute
nothing. The same backend path handles manual, Instant, Natural, scheduled and
unsolicited generation; no provider route or extra request was added.

The section explicitly describes tendencies subordinate to character identity,
conversation meaning and server-enforced rules. Free text is JSON-encoded data;
it cannot mutate storage, choose a provider credential or bypass ownership/quotas.
Output compliance remains model-dependent, not an exact formatting guarantee.
Normal persona/card/room instructions, quotes, reactions and system-note placement
remain intact. Styles are included in the actual token count before history trimming;
over-budget instructions produce the existing budget error, not silent history loss.

Structured values and the bounded description can later support Generate → Preview
→ Edit → Apply suggestions using the same validation boundary. No generator exists
now. Future presets can replace the single resolver placement without duplicating it;
no macro name, preset editor or resolved-prompt preview is implemented here.

## Narrow messaging usability correction

Inspection showed restored multiline composer drafts retain their text but not their
expanded height: sizing previously ran only on input. One connected-element animation
frame now restores measured height, capped at the existing 112px limit. It is not a
timer/polling loop, does not change drafts, focus, Enter/Shift+Enter, empty continuation,
Send/Stop or generation ownership. Detached old composers skip measurement.
No speculative changes to grouping, action menus, sender names, bubbles or navigation.

## Verification

Sequential synthetic storage/provider and DOM checks:

- Affected texting/search/pins/reactions/quotes/automatic replies/scheduling/desktop
  layout/shared-session regressions: **132 passed, 0 failed, 995 assertions**, nine
  selected files including imported account regressions.
- Final texting-only run with two added lifecycle cases and explicit Save warning:
  **13 passed, 0 failed, 84 assertions**.
- One TypeScript typecheck: passed.
- One backend-then-frontend production build: passed.
- Bundle inspection confirms the counted texting section, validation and frontend
  controls in the matching generated pair.

Coverage includes fictional/legacy persistence/reload, real-user/account isolation,
source refresh, unchanged legacy defaults, unrelated field/history preservation,
removed-character recovery, stale/concurrent/invalid edits, interrupted replacement,
two-character Natural provider input, DM/scheduled input with quotes/reactions/notes,
token counting and budget rejection. DOM controls at 320px/390px/900px cover long
names, staged edits and defaults. Existing dirty-form protection and restored composer
height are tested. Existing message lifecycle, notification, search/pin/quote/reaction
and Pocket/session regressions pass.

No full suite, Chromium, actual-host startup or live provider call occurred.
DOM widths are fixture coverage, not measured pixel layout or screen-reader testing.
The initial Natural group test fixture had automatic replies disabled; enabling it
in the fixture exercised the intended provider path without changing production modes.

| Bundle | SHA256 |
| --- | --- |
| `dist/frontend.js` | `08A327FCC98A5D91BECB6176D74B20D6E9DD37B0C0850DFA28D58FB82742E4D2` |
| `dist/backend.js` | `37E1F559A33A3323CB72D078389F409DB327F9FE8CE22DC48E238F6D2922361C` |

Prior search bundles are preserved byte-for-byte in ignored
`tmp/msg-01d-verified-bundles/`; all earlier backups remain untouched. Install both
new runtime bundles together only after separate approval. No schema migration is
required. Downgrading removes style influence/controls but existing room storage must
be retained; restore a matching prior bundle pair/commit, never delete accounts/rooms.
Original mochi/settings WIP, Pocket Power, installed Kitty checkout, disposable
Windows synthetic data and Ubuntu are untouched.

## Changed files

- `src/mochi/texting.ts`: structured preferences, validation and prompt section.
- `src/mochi/texting-controls.ts`: compact staged controls and scoped CSS.
- `src/mochi/types.ts`: optional room-settings field.
- `src/mochi/service.ts`: validated settings and membership-safe updates.
- `src/mochi/generation.ts`: one token-counted section insertion.
- `src/mochi/view.ts`: controls and restored composer sizing.
- `tests/mochi-texting.test.ts`: targeted regressions.
- `dist/frontend.js`, `dist/backend.js`: matching built implementation.
- `MOCHI-MSG-01E.md`, `ROADMAP.md`: report and accurate milestone progress.

## Manual acceptance after a separately approved disposable update

1. In DM/group settings, configure distinct styles, save and reload; refresh sources
   and switch fictional accounts. Confirm names/cards and unrelated histories stay intact.
2. Keep Character default everywhere and confirm previous behavior. Edit style without
   saving, navigate away and verify discard protection. Confirm the pending-reply warning.
3. Compare sanitized prompt diagnostics for two characters; check manual/automatic/
   scheduled replies. Treat style output as a model tendency, not a guarantee.
4. Verify quotes, reactions, pins, search, long names, narrow settings and messaging
   at 320px/390px/desktop. Restore a multiline draft and check its height/focus.
5. Check Enter, Shift+Enter, empty continuation, Stop, room switching, notifications,
   native Pocket and logout without exposing private production content.

Manual acceptance, actual-host/pixel behavior and real-provider style adherence remain
pending. Room-specific rather than account-wide styles, no double-text delivery,
deferred AI reactions/restart drafts and the known silent-real-user-switch host
limitation remain explicit. Messaging's implemented scope is development-verified;
release acceptance is not claimed. Memory & Prompt Management has not begun.
Stop for review.
