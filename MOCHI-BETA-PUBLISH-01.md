# MOCHI-BETA-PUBLISH-01 — Frozen RC1 publication

2026-10-15. **Published to GitHub: yes. Installed/confirmed running for friends:
not established. Ready to announce: pending installed-host/recovery preflight.**

## Destination and result

- Repository: [lizardqu33n/Pocket-mochi](https://github.com/lizardqu33n/Pocket-mochi).
- Published branch: [beta/mochi-closed-beta1-rc1](https://github.com/lizardqu33n/Pocket-mochi/tree/beta/mochi-closed-beta1-rc1).
- Verified remote HEAD: [`a542a92891f9091ad0c7e5e3cfa32c4fdfe6dcd9`](https://github.com/lizardqu33n/Pocket-mochi/commit/a542a92891f9091ad0c7e5e3cfa32c4fdfe6dcd9).
- Frozen approved runtime/source: `0f8f9ae9dfae42a467a08b375c1eeb767bb7e6b4`,
  an ancestor of published HEAD. Runtime/source comparison is empty.
- Local branch remained `codex/mochi-desktop-01b-base-review`, HEAD `a542a92`.
  No branch switch or new publication commit; exact reviewed release tree published.

Origin fetch/push URLs were checked against the intended fork. GitHub reported
authenticated login `lizardqu33n`, admin/push permission and public visibility.
Git's credential path also accepted a push dry run and the real push. No token,
credential file or secret value was read or printed.

The target branch was absent at inspection and immediately before the push. A
normal explicit SHA-to-one-ref push created it, with automatic follow-tags disabled.
No force, rebase, merge, tag, GitHub release or pull request. Existing remote heads
were unchanged before/after:

| Branch | SHA |
|---|---|
| `mochi` | `3ab196541b7285a468ec496262ae344cd476a468` |
| `main` | `859903eb55a0871f12d18e4adff6b30319575393` |

## Commit/content and remote verification

Reviewed the complete 26-commit range from remote `mochi` to RC1: reconciliation,
desktop B–F, messaging A–E, memory/presets/summary work, stabilization, acceptance
and frozen UI/release metadata. Ahead/behind relative to remote `mochi`: **26/0**.
No unexpected divergent beta history or unrelated work was overwritten.

106 changed paths are source, tests/scripts, reports, metadata and the two built
entries. Final files and historical changes had no private-key/token pattern
findings or private-artifact filenames. No test databases, stored RP/account data,
`.env`, SSH keys, logs, screenshots or ZIP/backups were published. Historical
development reports are documentation, not installed workstation configuration.
The range's ordinary whitespace check flagged existing CRLF endings; the CRLF-aware
check passed. Preserved exact frozen files rather than formatting/rebuilding them.
Pattern scans are a publication check, not a general security certification.

After pushing, read back remote refs and fetched **only the beta ref** into
`refs/review/mochi-beta-publish-01`. Its HEAD and complete tree equal `a542a92`.
Read the published ref's manifest, bundles and beta documentation through a local
archive of that fetched ref, with line-ending conversion disabled. Verified:

| Published file | SHA-256 |
|---|---|
| `dist/frontend.js` | `58A35491BD91D49663A9E3E27DA006D071A2E4C3B7F9BDB779F1AC12DD261C14` |
| `dist/backend.js` | `8E125CC98969D45B3EF61C2580E162AD652847516D3AD0CF41A6E50F75CCD11B` |

`spindle.json` retains identifier `lumiphone` and both expected entry paths.
All **127 packaged source/runtime Git blobs** match the remotely published tree.
Source plus candidate/package inventory, release dossier and preview guide are
present. No dependence on an older installed Git HEAD was used for publication.

The verified local source/runtime ZIP remains ignored and was **not uploaded**:
`tmp/releases/mochi-closed-beta1-rc1-0f8f9ae-source-runtime.zip`, SHA-256
`942B8A4A5DB452FF60AB603DED74F481C75D061243BCB9A35856424A92ADD28A`.
The rejected CRLF archive remains ignored and was not published. Test/build work
was not repeated; no source or built files changed in this publication task.

## Privacy evidence and limits

**New user-reported result:** two distinct Lumiverse accounts were authenticated
simultaneously in two different browsers, refreshing after changes. Neither
account showed the other's fictional profiles or conversations. This is a **passed
separate-browser privacy smoke test for those observed scenarios**. Browser/host
versions, loaded bundle identity, other private resources and provider/scheduler
outcomes were not independently established by this report. It is not a complete
security assessment or proof of every authorization path.

Previous synthetic authorization/isolation, frozen source/package verification
and provisional visual acceptance remain valid at their documented scope.
Complete actual-host coverage of presets, memories/suggestions, notifications,
connections, schedules and provider failures is still limited/pending. The known
same-browser real-user A→B retained-context teardown issue stays open for upstream
review. Separate profiles/devices remain the intended beta model; reloading is not
a verified host lifecycle fix. General/unrestricted readiness remains false.

The published frozen candidate JSON/dossier retain preparation-time statuses,
including `published: false` and broader host-acceptance gates. They were not
rewritten to change the reviewed release tree. This local publication report is
the subsequent publication/smoke-test record and is deliberately uncommitted.

## Distribution and installation prerequisites

GitHub identifies the repository as **public**: this branch is publicly readable
and cloneable, rather than restricted to invited collaborators. Individual tester
devices were not exercised. Friends-only runtime access must be controlled by the
user's Lumiverse accounts, host access and extension permissions; no invites or
permissions were changed here.

GitHub publication does not install anything on Ubuntu. Unless that host is already
independently running this exact candidate, the user must separately approve and
perform installation/update and host verification before friends use it. Its
version, installed source/bundles, backup or running state were not inspected.

The inspected local Lumiverse source supports repository/branch selection:
`frontend/src/components/panels/SpindlePanel.tsx` lists remote branches and passes
the selected branch to installation; `frontend/src/api/spindle.ts` exposes install,
branch listing and existing-extension branch switching. UI labels vary by language.
This establishes the local supported route, not the unknown Ubuntu version.

After separate approval, operator steps:

1. Verify the chosen host version, actual installed `lumiphone` repository origin,
   current commit/runtime hashes and extension scope. Do not assume Ubuntu matches
   Windows or local staging. Verify the source's branch-selection route exists.
2. Complete and verify the stopped-instance consistent backup/recovery preflight
   in `MOCHI-BETA-RELEASE-01.md`, including database/sidecars, all user/global
   extension storage, job records and compatible runtime. Preserve current data.
3. If the existing extension already tracks this fork, use its supported branch
   selector to choose `beta/mochi-closed-beta1-rc1`. Verify its resolved SHA is the
   published SHA above before accepting an update; stop if the branch has moved.
   For a fresh installation only, use repository URL
   `https://github.com/lizardqu33n/Pocket-mochi` and explicitly select that branch,
   rather than default `main`.
4. If an existing extension tracks Kitty's repository, its branch selector cannot
   be assumed to access this fork. Stop and prepare a separate reviewed replacement
   plan; do not install a second `lumiphone`, change origin blindly, uninstall
   data, reset storage or copy only one bundle.
5. Verify installed and browser-served hashes, backend runtime identity, retained
   data and approved acceptance checks. Respect memory-v2 compatibility: never
   swap MEM-01E/F readers over managed data or restore an old DB over newer chats.
6. Broader host/private-resource coverage, actual provider/scheduled outcomes,
   recovery verification and explicit residual-risk/friend-access decision remain
   before announcing availability. No schedule restart or provider call was made.

Ubuntu, production user data, Windows installed files, Kitty's repository and other
branches were untouched. No installation, deployment, host restart, testers invited,
release announcement or Marinara research. Stop after verified Git publication.
