# Experimental Mochi integration

Branch: `codex/experimental-mochi`. This is a testing branch, not a stable release.

Use Pocket's repository URL with this branch selected in Lumiverse's extension installer. The extension identifier remains `lumiphone`: it replaces Pocket in that installation rather than creating a second extension. Back up extension data before trying it on an existing installation. Built backend/frontend bundles are included.

## Getting started

1. Open the Pocket sidebar and choose **Open Mochi**.
2. Create a Mochi profile, choose its persona, and create a room with characters.
3. In the room's **Room options** menu, open **Settings**. Select a **Generation connection** and optionally a **Model**, then save.
4. Send a message in Pocket's phone shell. Profile and room configuration stay in the sidebar. Mochi has no home-screen app icon.

Mochi histories and identities are separate from the active roleplay and Pocket's narrative messages. A room uses its selected Lumiverse connection; it does not inherit the active RP connection or Pocket's generation preferences. **Connection default** uses that connection's configured model; selecting a model creates a room override.

Connection and persona choices reload when opening relevant forms. Use **Refresh connections & personas**, **Refresh personas**, or **Refresh models** to reload while editing. Refreshing preserves the current draft. These actions fetch metadata and do not generate a reply.

## Things to exercise

- Create/edit profiles, change portraits and personas, and cancel unsaved changes.
- Create a DM and group room; choose responders, continue, stop, edit, delete, and regenerate messages.
- Change a Lumiverse connection or persona, reopen settings, and check the refreshed choices. Check model refresh and room model overrides.
- Open Participants and Settings from the room menu; use keyboard navigation and Escape.
- Switch between phone devices, the portal, profiles, and rooms. Close/reopen Pocket and reload Lumiverse; check history and identity persistence.
- Check unread messages and notifications, narrow/mobile layouts, and desktop placement.
- Keep background messaging disabled for initial tests. Background, scheduled, and idle messaging have separate opt-ins and can make provider calls when enabled. Review **Background messaging** and **Context & token limits** before enabling them. New rooms default to an 8,192-token total budget and 1,200 output tokens.

The left desktop handset also needs Lumiverse core to reserve space on the requested dock side. LumiTest has a separate core fix for this; that fix is not included in this extension branch. Older hosts may show a placement/reserved-space mismatch.

## Local verification

```powershell
bun install --frozen-lockfile
bun run verify
$env:POCKET_PLAYWRIGHT_ROOT = 'path/to/project/with/playwright'
bun run test:mochi-ui
```

The browser harness uses synthetic identities and replies and runs at 320, 390, and 900 pixels. It needs an existing Playwright installation with Chromium. It does not use a real provider or personal chat data.
