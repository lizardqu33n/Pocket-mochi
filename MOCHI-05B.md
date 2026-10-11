# MOCHI-05B — profile customization checkpoint

Added Mochi profile creation/editing screens with explicit Lumiverse/Pocket persona choice or a custom identity, optional username, display name, persona/gallery portraits, initials, and PNG/JPEG/WebP uploads capped at 2 MB. Images use the real-user-scoped host API; arbitrary URLs/foreign images are rejected. Uploading an asset does not change a profile until Save; canceled uploads may remain in Lumiverse's gallery. Gallery selection currently shows up to 100 images. Profile edits apply to new rooms; existing snapshots/messages are untouched. Own thread labels remain You.

Existing `mochi-form`, card and circular portrait patterns are reused, with separate code in `src/mochi/profile-screen.ts`. No chat layout/style redesign, native Pocket profile edits, or RP inference. Management is currently accessible from the inbox; account startup/picker follows in 05C.

Changed: `src/mochi/accounts.ts`, `src/mochi/service.ts`, `src/mochi/view.ts`, new `src/mochi/profile-screen.ts`, `tests/mochi-accounts.test.ts` (fixture export only), new `tests/mochi-profiles.test.ts`, `package.json`, both bundles and this report.

Typecheck and production builds pass. Targeted profile run: 18 passing tests / 109 assertions including the 16 inherited account tests; new tests verify foreign-image rejection, long username bounds, avatar clearing, SVG rejection, old snapshot preservation, and form drafts/revision/persona behavior. Browser/mobile acceptance and full regressions are scheduled for 05E. No live host/provider test, push or deployment.

Rollback: profile data retains the 05A format and scoped room ownership. Reverting only B and rebuilding leaves account/room data intact but removes customization UI. Never delete uploaded images automatically: they may be referenced elsewhere. Rolling back A still requires the isolation precautions in its report.
