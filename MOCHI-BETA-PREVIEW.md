# Mochi friends preview — limitations and testing rules

2026-10-15. **Closed Beta 1 candidate only. Access has not been authorized or opened.**

## What this candidate includes

An independent desktop messenger with fictional profiles, private DM/group chats,
automatic/manual replies, texting preferences, quotes/reactions, pins/notes and
full-history search. Presets, prompt preview, saved summaries and reviewed AI
summary suggestions are available as optional tools. Existing schedules, quotas
and notifications remain; the simplified All/Unread/Groups/New Chat interface is
frozen for this candidate. Pocket's native phone remains separate.

No social servers/calls, new routines, themes or automatic background summaries.
The character activity snapshot is an honest placeholder; availability is real
reply eligibility. A scheduled AI opportunity is not an exact-message guarantee.

The proposed preview is a small invited group using separate real Lumiverse
accounts in dedicated browser profiles or on separate devices, on the inspected
Lumiverse 1.2.5 host. Fictional Mochi profiles are characters within one real
login; they are not separate security identities.

## Switching Lumiverse accounts in the same browser

Mochi has an unresolved compatibility limitation involving frontend extension
state when one Lumiverse account signs out and another signs in without a full
frontend reset. Previously loaded private interface information may remain cached.
No live privacy leak was demonstrated; the source-level risk remains unresolved.

For the proposed friends preview, use a dedicated browser or browser profile for
each real Lumiverse account. Avoid switching real accounts within an existing
Lumiverse tab. Closing all relevant tabs and reloading reduces exposure but is
**not a verified security fix**. Incognito windows can share a session with other
incognito windows; use genuinely separate profiles/devices for different people.

Separate-session synthetic tests passed. Real separate-browser acceptance is
still pending. This restriction does not establish unrestricted multi-user safety.
The underlying host lifecycle issue remains open for upstream reporting and
eventual verification.

## Data and recovery

- Unsent drafts survive supported in-session navigation, not full frontend or
  server restarts. Do not use the composer as permanent storage.
- Summary Disable/Clear preserves messages and saved memory versions. Clear
  changes effective memory; it does not erase historical versions.
- At 100 summary versions, Save/Restore is refused; Disable/Clear remains available.
- Disable/Clear can write memory-v2 management metadata. Older MEM-01E/F runtimes
  cannot read those rooms. **Never swap older bundles over newer memory data,
  strip management metadata, or restore old data over newer conversations.**
- Provider failures and canceled generations should not silently retry. Scheduled
  opportunities can legitimately pause, miss or expire; they are not exact-message
  delivery promises. Ordinary replies and unsolicited background opt-in are separate.

Before opening access, complete the controlled checklist in
[MOCHI-BETA-RELEASE-01.md](MOCHI-BETA-RELEASE-01.md), retain a consistent backup
and compatible recovery runtime, and make an explicit residual-risk decision.
On suspected cross-account disclosure or lost saved history, stop testing/access
and report the candidate hashes, action, time and anonymized record identifiers.
Do not send credentials, private messages or full prompt dumps as diagnostics.

## Feedback

Report the candidate/source commit or bundle hashes, host version, browser/profile,
approximate time, action and expected/actual result. Mention whether a room was
legacy or owned by a fictional profile. Use synthetic examples and anonymized IDs;
redact screenshots. For suspected disclosure or missing saved history, pause access
and preserve data rather than repeatedly retrying, downgrading or resetting it.
