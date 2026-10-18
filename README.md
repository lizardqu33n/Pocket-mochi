<img width="1254" height="1254" alt="image" src="https://github.com/user-attachments/assets/5cae7d35-77d1-450b-9007-5e81ba1f9af2" />

# Pocket

Pocket is a live-mounted Lumiverse Spindle extension that gives every chat + character pair its own persistent in-world phone.

The extension identifier and storage namespace intentionally remain `lumiphone` so existing installations and roleplay data upgrade in place.

## Included apps

- **Messages** — direct and group conversations with a chat-scoped Pocket Persona, outgoing-message bursts, group-native generation, narrative pause/handoff states, one-shot RP context references, generation diagnostics, and per-conversation unread state.
- **Contacts** — reusable Character, active Council, and Pocket NPC identities with search, compact context policy, direct-message entry, manual/generated creation, and a replaceable current-scene snapshot with source-turn freshness.
- **Gallery** — chat, character, Pocket-owned, or full Lumiverse image filters; full-resolution inspection, current-RP append, contact photos, and device/Persona wallpaper actions backed by stable Lumiverse image IDs.
- **Camera** — native Lumiverse image generation, streamed previews where supported, an optional LLM scene-planning sidecar, and automatic chat/character image ownership.
- **Notes** — a private or model-visible character journal with pinned memory entries.
- **Weather** — fictional scene weather rather than an external real-world feed.
- **Timeline** — roleplay clock, event lanes, completed story beats, and exact, approximate, relative, or unscheduled story time.
- **Trackers** — bounded values with optional automatic change-per-hour and model visibility.
- **Settings** — device-wide theme colors, home/chat image wallpapers, separate desktop handset and cross-device UI scales, real animation timing, context inspection, discovered-model selection, notification behavior, visual profiles, backup, import, and separate reset controls.

<img width="409" height="853" alt="image" src="https://github.com/user-attachments/assets/883405f1-5382-410a-9d5f-b16387102b52" />

On desktop, the 58px draggable launcher opens a centered strict 9:18.4 phone in an opt-in transparent/chromeless host dock. Closing Pocket destroys that dock, and reopening creates a fresh one. `handsetScale` (`0.80`–`1.25`) controls only the physical desktop handset; pixel dimensions are derived again from the current viewport on every mount, open, resize, keyboard viewport change, and scale edit. `uiScale` (`0.70`–`1.30`) controls Pocket's primitive sizes and density on desktop and mobile. Narrow/mobile viewports always use the host's full available viewport and safe-area/visual-viewport handling rather than shrinking the surface. Use the visible top-left dismiss button or a deliberate up/left status-area gesture; the home indicator returns to Home first, then closes the phone.

Each visible phone now has two explicit frontend identities. Its logical device key is derived from `chatId + characterId + deviceOwnerActorId`, so the Persona phone and every inspected NPC phone are distinct devices even inside the same roleplay. Each mounted controller also owns a unique `surfaceId`; all dynamic CSS is scoped to that surface rather than the generic `.lumiphone-shell`. Persona appearance overrides, Persona wallpapers, and Persona custom CSS apply only when the current device owner is the Pocket Persona. NPC inspection falls back to device-wide appearance and cannot inherit the active Persona skin.

> Contributions!
> - Lunch: Characters can send voice messages in direct and group conversations by returning format: "voice" with a spoken transcript. Pocket preserves the format through model actions, fallback tags, generated replies, queued group delivery, reloads, and inline presentation. Messages provide Play/Stop and an expandable transcript; playback starts only when requested.

## Model integration

### Character voice messages

Characters can send voice messages through `message` and individual `message_batch` rows by adding `"format":"voice"`; `text` contains the spoken transcript. Generated direct and group replies can choose the same format. For example:

```xml
<lumi-phone action="message">{"speaker":"Alice","text":"I'll meet you at the station.","format":"voice"}</lumi-phone>
```

Open the message in Pocket and tap **Play voice message**, or expand **Voice message transcript** to read it. Playback never starts automatically. Settings → Messages → **Playback TTS** lets you choose a saved Lumiverse TTS connection or installed browser voices. Choose a **TTS model** and **TTS voice** from that provider's lists, or keep the connection defaults. Pocket remembers these choices separately for each connection and does not modify the host connection profile. On Play, Pocket sends the transcript and chosen overrides through Lumiverse's signed-in TTS API while provider credentials stay in the host. Generated audio is held only for playback and released on completion, Stop, or closing Pocket. Hosts without that API can still use browser voices.

Settings can disable new character voice messages and playback or choose a browser voice. Browser automatic selection follows the app language and assigns a consistent voice by character identity on the current device; available languages depend on the browser/OS. Choose a Lumiverse TTS connection when the needed language is not installed. Transcripts remain readable when speech is unsupported or fails, without silently switching a failed connection to a browser voice. Voice messages persist as transcripts and format markers, with no API keys, audio URLs, or generated audio files saved in Pocket. Browser voices may use the platform's speech service.

With `tools` permission, Pocket registers `phone_action` with these actions:

```text
message | message_batch | contact | scene | note | event | weather | tracker | camera | notify | open
```

The prompt interceptor adds a compact phone snapshot (pinned notes, in-scene/pinned contact briefs, timeline, weather, and model-visible trackers) to the current generation. It deliberately excludes arbitrary direct-message history; reply generation receives only the selected conversation's bounded recent thread. If the active provider/path does not expose extension tools, the same actions can be emitted as a hidden message tag:

```xml
<lumi-phone action="message" app="messages" title="Alice">Meet me by the station.</lumi-phone>
```

Structured content is supported:

```xml
<lumi-phone action="event" app="calendar">{"title":"Train arrives","start":"2026-09-01T20:00:00Z","lane":"Main timeline"}</lumi-phone>
```

Busy group chats can use one transport batch instead of rationing dialogue around fallback/tool overhead:

```xml
<lumi-phone action="message_batch">{"channel":"gc","conversation":"Class 3-A","participants":["Mina Ashido","Denki Kaminari","Izuku Midoriya"],"messages":[{"speaker":"Mina Ashido","text":"YOU COUNTED THE SECONDS????"},{"speaker":"Denki Kaminari","text":"BROOOOOOOOO"},{"speaker":"Izuku Midoriya","text":"Technically the timestamps do support—"}]}</lumi-phone>
```

`message_batch` is transport compression only: Pocket still stores every row as an ordinary canonical `PhoneMessage`, with normal actor/device projection and candidate provenance. One batch activity renders the burst as a compact inline mini-chat (up to eight visible rows before a `+ N more` affordance). A missing GC may be ensured during `message`/`message_batch` when explicit participants are supplied; deliberate membership edits and renames still use the `conversation` action. The fallback limit remains three **actions**, not three messages—a batch can carry up to 24 GC messages.

A cooperating main model may also provide a bounded structured scene update with `<lumi-phone action="scene">`. Natural-language narration is never regex-parsed into scene state.

The frontend removes these tags from rendered prose. Frontend actions, model tools, and tags converge on one backend action path with durable request-id deduplication plus a short semantic duplicate window, so a tool/tag retry does not produce two entries. Settings control whether model actions also open the phone and whether to send rate-limited OS push notifications.

The fallback tag path is also a compatibility compiler for providers/models without reliable tool calling. On a committed assistant candidate, Pocket regex-parses only its own explicit `<lumi-phone>` protocol, persists each valid action through the canonical backend command path, binds message and message-batch actions to the host `(chatId, messageId, swipeId)` candidate, and rewrites each raw message tag into the same durable inline activity anchor used by tool calls. Non-message fallback tags are removed after successful compilation. This is protocol parsing only; Pocket still never infers actions from ordinary narrative English. The frontend tag interceptor remains as a race-safe backup, and both paths share the same idempotency key so a backend/frontend double delivery cannot duplicate the action.

When a Pocket Action message call succeeds inside a host generation, its side effect is **provisional** until the final assistant candidate commits it. The tool result provides both an `artifactTag` that is already a durable `<div class="pocket-inline-anchor" data-pocket-inline-anchor="activity_123"></div>` and a hidden `commitTag`. Visible/readable/observed phone actions place the `artifactTag` exactly where the artifact belongs; genuinely off-screen actions use the `commitTag`; reasoning-only tool calls use neither and are deleted at candidate commit. Provisional messages are excluded from Pocket projection and model-facing phone context, so refreshing Pocket mid-generation cannot make exploratory tool calls canon.

Pocket publishes only the provisional activity metadata to the frontend. As soon as the streamed assistant response reaches the durable `artifactTag`, the existing MutationObserver mounts the diegetic Pocket card into that exact anchor immediately—`GENERATION_ENDED` remains the canonical commit boundary, not the visual-render boundary. If the final candidate keeps the anchor, its provisional activity graduates into normal state without a host-message rewrite. If the generation fails, stops, or drops the marker, Pocket revokes the transient preview and deletes the provisional side effect. Legacy `<pocket-artifact>` markers are still finalized for compatibility. If the model ignores the marker but prints the exact canonical Pocket message as a standalone quoted/styled line, Pocket can rescue that line at commit by replacing it with the same inline anchor. Missing placement evidence degrades to a compact provenance receipt rather than guessing a paragraph location. Swipe projection republishes on every host navigation and clears stale receipts/inline surfaces; deleted swipes use Lumiverse's `deleted` action semantics, and deleting a host assistant message removes every Pocket message/activity/notification and candidate clock owned by that turn.

## Roleplay context and identity

Pocket keeps five concepts deliberately separate: source identity (Character Card, Council member, or Pocket NPC), replaceable scene snapshot, recent/story roleplay context, the selected phone thread, and the chat-scoped Pocket Persona.

The Messages context modes are deterministic:

- **Off** uses compact actor identity and the selected Pocket conversation only.
- **Recent** adds a bounded tail of the authoritative committed Lumiverse chat.
- **Story** adds Pocket's roleplay clock, weather, scene actors, relevant Timeline events and Trackers, and pinned model-visible Notes, without the main transcript.
- **Smart** includes Story and also includes Recent when a committed main-chat tail is available.

DM assembly is capped at 10,500 characters with separate budgets for actor identity, scene state, phone thread, recent RP, and story state. Settings → Messages can preview the exact sanitized block, its character/token estimate, source counts, the newest authoritative host-message anchor, and the newest included anchor. Generated incoming bubbles retain a non-secret Generation Info record with the actor source ID, context mode/budgets, scene freshness, Pocket Persona size, connection, and model.

The authoritative recent source is `spindle.chat.getMessages(chatId)` at the instant generation or preview begins. Pocket does not reuse an earlier event payload or timeout-based cache. Lumiverse emits `GENERATION_ENDED` after the final assistant row is persisted; Pocket uses that event to mark an existing snapshot stale, while the next preview/generation fetches the committed rows and their IDs/indexes directly.

Scene Sync replaces `sceneSnapshot` after validating the entire bounded result. It stores the actor/contact links, temporary scene briefs, capture time, and source message ID/index/revision. A later completed RP turn marks the snapshot potentially stale. Exact known names and conservative unambiguous single-token aliases prevent the active Character from becoming a duplicate NPC; the active Pocket Persona is always excluded from Contacts.

Each chat owns a compact Pocket Persona. It may follow the current Lumiverse Persona or use a manual/generated profile without modifying Lumiverse. Generated profiles are previews until explicitly accepted. A new chat receives one dismissible setup sheet; the offered/completed state persists with that chat.

Automatic replies settle a device-configurable `Instant`, `Quick`, `Natural`, or `Relaxed` outgoing burst. Consecutive bubbles join the same persisted burst, active composition holds evaluation, and exactly one reply decision runs after settlement. Manual sparkle generation flushes the burst immediately. The channel state is explicit: `remote`, `arriving`, `paused`, or `local`. Scene presence is checked before the reply model, and an impossible `none`/`reply` result is normalized to `handoff` if scene truth changed during evaluation. `arriving` remains textable until scene presence corroborates arrival. When travel has begun and the remote exchange naturally closes, the reply decision may choose `arrival_handoff`: Pocket keeps the actor `arriving`, preserves the composer, and triggers the main RP with an arrival-specific relay that explicitly forbids treating the actor as already present. The arriving banner also exposes **Continue to arrival** as a manual RP bridge when the user wants to move the camera back to the scene without waiting for another phone reply.

An arrival handoff writes a Timeline transition from remote/arriving to `arriving` and uses the same native continuation path without claiming physical presence; the generated RP remains authoritative for the eventual `arriving → local` transition. A local handoff writes an already-occurred Timeline event and a bounded pending continuity relay, then uses Lumiverse's native `spindle.chat.appendMessage(..., { triggerGeneration: true })` path to continue the main RP. Every relay retains its creating burst ID. The interceptor resolves the phone through the authoritative chat when older hosts omit `characterId`, then injects only the relay matched by Pocket message metadata or generation ID. On hosts that also omit the generation ID from interceptor context, exactly one active continuation is used as the conservative fallback; explicit unrelated generation IDs never inherit it. Generic Pocket memory and the urgent relay are separate system contributions, with the latter serialized last and capped at 3,600 characters. A relay is consumed only by its matching successful generation after a persisted injection receipt and remains retryable after missing permissions, host failure, stop, or an unconfirmed injection. Messages renders that lifecycle as a chronological inline Handoff Activity—preparing, accepted, injected/generating, completed, or failed—at the source message rather than as a footer control stack. The active generation treatment is visibly animated without borrowing the DM typing indicator; completion collapses to a link back to the main RP, while retry, Message anyway, Timeline navigation, channel decisions, serialized size, and injection diagnostics remain available under the secondary disclosure. Leaving the scene restores remote eligibility without erasing an unrelated pause.

**Reference in roleplay** is a separate bridge from Relay. It stores a bounded, chat-scoped snapshot of a Pocket conversation or selected messages, then waits for the user's next normal RP turn. The interceptor injects it as a distinct late system contribution, bound to the host generation and source user-message IDs where available. Its prompt contract explicitly says that phone context does not change channel ownership, scene presence, visibility, or character knowledge. Dry runs, relay continuations, swipes, regenerations, and Pocket quiet generations cannot consume it. A matching successful RP generation consumes the reference exactly once; failure or stop leaves a visible retryable diagnostic state. Arming or consuming a reference never creates a Timeline event. The Messages header exposes Participants/Contact info, Reference, Timeline, and generation diagnostics under a compact `⋯` menu, while an armed reference remains visible with Return to roleplay and Cancel controls.

Group conversations use a single structured generation to produce an ordered 0–3-message burst (hard maximum 4). Auto mode supplies only eligible off-scene members and their independent talkativeness/fragmentation styles; later array entries can react to earlier entries. A participant may be a full Contact or a lightweight discovered actor. Close relationships are disclosed as important social context, while background plot actors remain deliberately profile-light. Group membership is authoritative and explicit: discovering a name never adds that actor to unrelated groups. Pocket owns reveal timing, and queued entries are not canonical messages until their reveal. A new user message preserves anything already delivered while cancelling the stale remainder. Per-conversation flight guards prevent overlapping batches. Choosing a specific participant from the compact **Auto speaker** sheet instead requests exactly one reply and clears that one-shot selection afterward. Group bubbles resolve each sender's current actor/contact accent and avatar at render time, so editing or promoting an actor immediately restyles existing history without rewriting messages. State rerenders preserve the user's scroll anchor and follow a new burst only when the thread was already near the bottom.

Model-created messages support lazy NPC materialization. An unknown named DM sender becomes a minimal chat-scoped discovered actor, can keep sending under one stable identity, and does not clutter Contacts. Tapping that sender promotes it into one minimal Pocket NPC Contact; historical messages keep their actor IDs and resolve through the promotion link. Unknown speakers cannot talk in an existing group until an explicit `conversation` action establishes membership, and ordinary message actions never create typo-duplicate groups. Contact profile depth is optional enrichment, not permission to participate in the story.

Generated NPCs are frontend drafts, not Contacts: generation opens an unsaved preview with **Retry**, **Edit**, and **Use**, retaining the immediately previous reroll for recovery. Only Use/Save persists one Contact. Contact form edits never navigate, Save waits for backend acknowledgement, and the acknowledged detail route replaces the editor route so one Back behaves normally.

## Text generation routing

Generation can follow the active roleplay connection or use a sidecar connection. For sidecar mode, Settings presents:

```text
Sidecar
Connection profile
Model override
```

The model override uses Lumiverse's host model combobox, so it receives the selected connection and discovers that provider's current model options. Leaving it empty uses the connection profile's configured model. The selected override is persisted device-side and passed through the supported per-generation `parameters.model` field; diagnostics report the effective connection/model without credentials.

## Swarm Studio bridge

When **Sync active Swarm Studio profile** is enabled, Camera resolves Swarm Studio's live macros in the active chat:

- `{{char_base}}`
- `{{persona_base}}`
- `{{swarm_negative}}`
- `{{swarm_preset}}`
- `{{swarm_checkpoint}}`
- `{{swarm_aspect}}`

This carries the current character/persona positives, negative prompt, preset directives, checkpoint, and aspect into the photo request without reading another extension's private storage. The integration uses published macro contracts only; Swarm Studio remains optional and unchanged. Manual positive/negative text is additive, and manual connection, model, LoRA stack, and provider-parameter JSON remain available for users without Swarm Studio. If scene planning or profile resolution fails, Camera falls back to the original brief/manual profile. Cancellation suppresses association, notification, and UI completion from late results.

## Ready-made wallpapers

Settings → Personalization → Device appearance (or Persona appearance) includes **Pocket Wallpapers** on both Home and Chat controls. Browse 14 bundled SVG patterns, gradients, and scenes, preview a selection, then apply it. These wallpapers work offline and persist as catalog IDs, so exports stay small and portable. Existing fit, focal-position, scrim, Gallery, Upload, and URL controls remain available.

## iPhone touch scrolling

Native touch scrolling defaults on for iPhone and iPod in Pocket's mobile widget. Settings > Appearance > Native touch scrolling remains available even before the widget opens. Turning it off saves an explicit override and restores the widget's scroll guard; turning it on enables native scrolling. Other devices keep the guard by default.

The old default-off preference migrates to automatic device selection; an old enabled preference stays enabled. New explicit choices survive reloads. The widget requests its scroll mode at creation and updates it through Spindle's setter when available. Older hosts need the new Spindle touch scroll API for the override to take effect. This does not change host handlers or other extensions' widgets.

## Tracker judge

Settings → Tracker judge supports two providers:

- **LLM connection** uses the connection and model selected in Pocket’s Connection tab, including nano or OpenRouter models. Its confidence is an estimate from that model.
- **TypeSafe Jev** uses the native [TypeSafe System One API](https://docs.typesafe.ai/api), a TypeSafe API key, and `jev-latest` by default. Save or remove the key in this page; it is stored per user on the host and excluded from Pocket exports. Only a saved-key indicator returns to the frontend.

Judging is disabled by default. Older Open JEV Space settings migrate disabled; choose a provider and enable judging again. Evaluation sends the last six story messages and selected tracker targets to the chosen provider. You can evaluate manually or opt into evaluation after story turns.

In a meter or state tracker’s settings, choose **Tracker judge** updates, ask one short question, and set a confidence threshold. Meters use 2–10 numeric anchors with descriptions; states use their allowed states as choices. Zero-based scores interpolate across the numeric anchors. TypeSafe’s reported confidence controls the threshold separately from option probabilities. Counters and timers keep exact updates. Judge-owned trackers remain read-only for model tools; manual edits remain available.

Accepted changes enter tracker history with the provider named in the reason. Uncertain, malformed, or failed answers preserve current values. Automatic evaluations deduplicate unchanged inputs. In-flight results reject changed story context, tracker edits, provider settings, credentials, or the selected LLM connection/model.

`bun scripts/check-typesafe-jev.ts` checks the native adapter using synthetic context only. Set `TYPESAFE_API_KEY` in the environment first; an optional first argument selects a Jev model. This makes an authenticated API request. It never reads Pocket or Lumiverse chat data.

## Storage

State is kept under Lumiverse user storage at:

```text
users/{userId}/extensions/lumiphone/phones/{chatId}__{characterId}.json
```

Device preferences are deliberately separate:

```text
users/{userId}/extensions/lumiphone/device/preferences.json
```

Roleplay state (currently schema v10) contains the chat-scoped Pocket Persona and setup flag, reusable Contacts, lightweight discovered actors and promotion links, explicit actor-based conversation membership, messaging styles, a replaceable scene snapshot, separate conversations/messages and outgoing bursts, persisted group-batch delivery state, channel decisions, continuity relays, one-shot context references, notes/provenance, fictional weather, timeline events, trackers, notifications, and bounded internal idempotency receipts. Device preferences (currently schema v5) contain theme colors, typed image-source wallpapers, Persona appearance overrides, `handsetScale`, `uiScale`, motion, reply cadence, notification behavior, and Camera/Swarm/generation routing. All Gallery, uploaded-asset, and URL references pass through one resolver before rendering or preference commit. Uploaded backgrounds use Lumiverse's shared Images API; remote URLs are verified and cached as host-owned image assets, while preferences retain only the original stable source reference plus fit, normalized focal coordinates, and scrim—not base64 or resolver-cache data. Legacy URL wallpapers, embedded settings, conversation tail snapshots, contact-owned message threads, contact-only conversation membership, missing messaging styles, and older states without discovered actors, group queues, or references migrate on read; malformed records normalize safely; unknown future schemas fail closed. Import is validated and forced to the active chat/character rather than trusting IDs in a file. Settings exposes distinct reset actions for this phone, all roleplay phones, and device preferences.

State arrays and text fields are normalized and bounded on every read. Tracker rates are deterministically materialized from their last persisted timestamp, so they continue advancing across phone closes and process restarts. The main-model Pocket snapshot has a hard 5,600-character serialized ceiling rather than dumping storage; selected-conversation DM context uses the separate bounded assembler described above.

## Source layout

- `src/frontend.ts` — small host bootstrap and teardown relay.
- `src/frontend/controller.ts` — host lifecycle, scope switching, action routing, and app orchestration.
- `src/frontend/surface.ts` — semantic scale and fresh viewport-to-9:18.4 geometry.
- `src/frontend/apps/settings.ts` — Settings view and device-management controls.
- `src/frontend/apps/messages.ts` — conversation list, threads, group editing, compose, and reply controls.
- `src/frontend/apps/contacts.ts` — contact discovery, presence, import, detail, and configuration flows.
- `src/frontend/apps/trackers.ts` — tracker dashboard, detail, history, and configuration.
- `src/frontend/components/image-picker.ts` — reusable stable-reference wallpaper/image controls.
- `src/domain/contacts.ts` — contact/conversation normalization, migration, and direct-thread invariants.
- `src/domain/preferences.ts` — preference defaults, validation, and migration.
- `src/domain/projection.ts` — bounded model-context projection.
- `src/backend/roleplay-context.ts` — authoritative RP fetch, context-mode assembly, budgets, anchors, and diagnostics.
- `src/backend/continuity.ts` — bounded channel-decision normalization, tail snapshots, relay matching, and targeted relay projection.
- `src/backend/image-sources.ts` — the single persisted-image-source resolver, URL verification/cache, and render diagnostics.
- `src/backend/generation.ts` — roleplay/sidecar routing, connection inspection, model override, and run history.
- `src/backend.ts` — Spindle adapters and canonical command pipeline.
- `src/styles.ts` — centralized phone/design tokens and responsive states.

 its installed checkout is `Lumiverse/data/extensions/lumiphone/repo` and built entries are `dist/backend.js` and `dist/frontend.js`.
## Mochi icon customization

Mochi bundles verified Lucide SVG artwork locally, with CSS-themeable semantic
slots and optional safe local SVG/PNG/JPEG/WebP replacements. Start with
[icon theming and examples](src/mochi/ui/ICON-THEMING.md), the
[named slot reference](src/mochi/ui/reference/icons.md), and the
[v2 CSS contract](src/mochi/ui/THEME-CONTRACT.md). No owner icons/fonts are required.
Edit `mochi-theme.css`, then rebuild the tracked frontend with `bun run build:frontend`.
