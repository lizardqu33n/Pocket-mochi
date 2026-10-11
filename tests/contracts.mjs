import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

if (process.env.POCKET_VISUAL_DIR) {
  const RealDate = Date
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-09-04T12:00:00.000Z'])) }
    static now() { return new RealDate('2026-09-04T12:00:00.000Z').getTime() }
  }
}

// Inspect open Pocket roots explicitly; normal document queries must not see their UI.
function inlineAll(host, selector) {
  const result = [...host.querySelectorAll(selector)]
  for (const island of host.querySelectorAll('pocket-inline-ui')) {
    assert.ok(island.shadowRoot, 'Pocket must keep its isolated root open for inspection')
    result.push(...island.shadowRoot.querySelectorAll(selector))
  }
  return result
}
function inlineOne(host, selector) { return inlineAll(host, selector)[0] || null }
function inlineText(host) { return inlineAll(host, '.pocket-artifact-stack').map(node => node.textContent).join(' ') }

const root = new URL('../', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('spindle.json', root), 'utf8'))
const backendSource = await readFile(new URL('src/backend.ts', root), 'utf8') + await readFile(new URL('src/backend/image-jobs.ts', root), 'utf8')
const frontendSource = await readFile(new URL('src/frontend.ts', root), 'utf8')
const controllerSource = await readFile(new URL('src/frontend/controller.ts', root), 'utf8')
const messagesSource = await readFile(new URL('src/frontend/apps/messages.ts', root), 'utf8')
const surfaceSource = await readFile(new URL('src/frontend/surface.ts', root), 'utf8')
const stylesSource = await readFile(new URL('src/styles.ts', root), 'utf8') + await readFile(new URL('src/frontend/components/inline-styles.ts', root), 'utf8')
const inlineStyles = await readFile(new URL('src/frontend/components/pocket-inline-redesign.css', root), 'utf8')
assert.doesNotMatch(inlineStyles, /:root\s*\{|!important/, 'inline styles must keep defaults local and avoid specificity escalation with important')
for (const selectorLine of inlineStyles.split(/\r?\n/).map(line => line.trim()).filter(line => line.startsWith('.'))) {
  assert.match(selectorLine, /^\.pocket-inline-frame\[data-pocket-ui="true"\]|^\.pocket-(?:artifact-stack|inline-anchor|receipt-host)/, `inline selector escaped its ownership boundary: ${selectorLine}`)
}


assert.equal(manifest.identifier, 'lumiphone')
assert.equal(manifest.name, 'Pocket')
assert.equal(manifest.entry_backend, 'dist/backend.js')
assert.equal(manifest.entry_frontend, 'dist/frontend.js')
for (const permission of ['generation', 'interceptor', 'tools', 'chats', 'chat_mutation', 'characters', 'images', 'cors_proxy', 'image_gen', 'ui_panels']) {
  assert.ok(manifest.permissions.includes(permission), `missing ${permission} permission`)
}

for (const token of ['phone_action', 'lumi-phone', 'message_batch', 'compileLegacyPhoneTags', 'LEGACY_LUMI_PHONE_TAG_PATTERN', 'pocket-artifact', 'pocket-commit', 'artifactTag', 'commitTag', 'lumiphone:provisional_activity', 'candidate_activity_discard', 'data-pocket-inline-anchor', 'registerInterceptor', 'resolveSwarmProfile', 'generateStream', 'owner_chat_id', 'PocketActivity', 'materializeTracker', 'syncSceneContacts', 'resolveContactProfile', 'ensureDiscoveredActor', 'ensureExternalDirectConversation', 'actorReferenceIsPocketPersona', "action === 'conversation'", 'Pocket automatically renders successfully persisted phone actions', 'Pocket Action is an execution step', 'Multiple Pocket Action calls in the same assistant turn are expected', 'do not skip them merely because neither participant is the Pocket Persona', 'post-turn-audit', 'arrival_handoff', 'commitArrivalHandoff', 'lumiphone:continue_arrival', 'hostClockBaselines', 'candidateClocks', 'MESSAGE_SWIPED', 'MESSAGE_DELETED', 'targetSwipeId']) {
  assert.ok(backendSource.includes(token), `backend contract missing ${token}`)
}
for (const token of ['createFloatWidget', 'requestDockPanel', 'setFullscreen', 'registerTagInterceptor', 'registerInputBarAction', 'spindle:desktop-widget-returned', 'handsetScale', 'activityReceipt', 'renderContactsView', 'Pocket devices', 'lumiphone:reconciliation_status', 'pocketDeviceKey', 'pocketSurfaceId', 'pocketDeviceRole', 'pocketInspection']) {
  assert.ok(`${frontendSource}\n${controllerSource}\n${surfaceSource}`.includes(token), `frontend contract missing ${token}`)
}
assert.ok(controllerSource.includes('oldThreadNearBottom') && controllerSource.includes('thread.scrollHeight'), 'thread rerenders must preserve/follow the GC scroll anchor intentionally')
for (const token of ['participantActorIds', 'resolvePocketActor', 'lp-actor-link', 'Delete message', "kind: 'message'", 'message.origin']) assert.ok(messagesSource.includes(token), `message actor UI missing ${token}`)
for (const token of ['.lp-thread', '.lp-camera', '.lp-timeline', '.lp-progress', '@media (max-width: 720px)']) {
  assert.ok(stylesSource.includes(token), `style contract missing ${token}`)
}
assert.doesNotMatch(backendSource, /\beval\s*\(|new\s+Function\s*\(/)
assert.doesNotMatch(frontendSource, /innerHTML\s*=\s*(?:payload|state|message|note|event|tracker)/)
assert.doesNotMatch(controllerSource, /innerHTML\s*=\s*(?:payload|state|message|note|event|tracker)/)

const storage = new Map()
const frontendMessages = []
const backendEvents = new Map()
let frontendHandler = null
let interceptorHandler = null
let registeredTool = null
const quietRequests = []
const appendedChatMessages = []
const updatedChatMessages = []
const macroResolveCalls = []
const hostImages = new Map([
  ['image-a', { id: 'image-a', url: '/api/v1/images/image-a', original_filename: 'Scene.png', mime_type: 'image/png' }],
])
let uploadedImageCount = 0

const permissions = new Set(manifest.permissions)
storage.set('phones/chat-a__char-a.json', {
  version: 0,
  chatId: 'wrong-scope-is-ignored',
  characterId: 'wrong-character-is-ignored',
  settings: { handsetScale: 1.15, accent: '#abcdef', bezelColor: '#010203', wallpaper: 'url(javascript:bad)' },
  notes: [null, { title: 'Migrated note', body: 'Still safe.', pinned: true }],
  events: [{ id: 'legacy-handoff', title: 'Already happened', kind: 'phone-handoff', completed: false }],
  trackers: [{ id: 'legacy-meter', label: 'Affinity', value: 42, min: 0, max: 100, unit: '%', ratePerHour: 2, lastUpdated: '2026-01-01T00:00:00.000Z' }],
})
globalThis.spindle = {
  permissions: {
    has: (name) => permissions.has(name),
    onChanged: () => () => {},
  },
  frontendCapabilities: { declare: () => () => {} },
  onFrontendMessage: (handler) => { frontendHandler = handler; return () => {} },
  sendToFrontend: (payload) => frontendMessages.push(payload),
  registerTool: (tool) => { registeredTool = tool },
  unregisterTool: () => {},
  registerInterceptor: (handler) => { interceptorHandler = handler; return () => {} },
  on: (name, handler) => { backendEvents.set(name, handler); return () => {} },
  log: { info: () => {}, warn: () => {}, error: () => {} },
  userStorage: {
    getJson: async (path, options) => storage.has(path) ? structuredClone(storage.get(path)) : structuredClone(options?.fallback),
    setJson: async (path, value) => storage.set(path, structuredClone(value)),
    list: async (prefix = '') => [...storage.keys()].filter((path) => path.startsWith(prefix)),
    delete: async (path) => { storage.delete(path) },
  },
  characters: {
    get: async (id) => id === 'missing-character' ? null : ({ id, name: id === 'char-b' ? 'Bob' : 'Alice', description: 'A curious traveler.', personality: 'Warm and observant.' }),
    list: async () => ({ data: [{ id: 'char-a', name: 'Alice', description: 'A curious traveler.' }, { id: 'char-b', name: 'Bob', description: 'A careful scout.' }], total: 2 }),
  },
  chats: {
    getActive: async () => ({ id: 'chat-a', character_id: 'char-a' }),
    get: async () => ({ id: 'chat-a', character_id: 'char-a' }),
  },
  chat: {
    getMessages: async () => [{ id: 'BED-111', index_in_chat: 0, role: 'user', content: 'At the market.' }, { id: 'KITCHEN-222', index_in_chat: 1, role: 'assistant', content: 'Mira, the flower seller, waves from her stall.' }],
    appendMessage: async (chatId, message, options) => { appendedChatMessages.push({ chatId, message, options }); return { id: `host-message-${appendedChatMessages.length}`, generationId: options?.triggerGeneration ? `generation-${appendedChatMessages.length}` : undefined } },
    updateMessage: async (chatId, messageId, patch) => { updatedChatMessages.push({ chatId, messageId, patch }) },
    setMessageHidden: async () => {},
  },
  personas: { getActive: async () => ({ id: 'persona-test', name: 'Test Persona' }) },
  council: {
    getMembers: async () => [{ memberId: 'member-luna', itemId: 'item-luna', name: 'Luna', role: 'Dream director', avatarUrl: '', definition: 'A lunar dream guide.', personality: 'Gentle', behavior: 'Poetic' }],
    getAvailableLumiaItems: async () => [],
  },
  macros: {
    resolve: async (template, options) => {
      macroResolveCalls.push({ template, options })
      if (!options?.userId) throw new Error('userId is required for operator-scoped extensions')
      return ({
      text: template
        .replace('{{char_base}}', 'silver hair, violet eyes')
        .replace('{{persona_base}}', 'red coat')
        .replace('{{swarm_negative}}', 'blurry')
        .replace('{{swarm_preset}}', '<preset:cinematic>')
        .replace('{{swarm_checkpoint}}', 'illustrious')
        .replace('{{swarm_aspect}}', '4:3'),
      diagnostics: [],
      })
    },
  },
  generate: { quiet: async (request) => { quietRequests.push(request); return { content: 'Meet me by the station.', finish_reason: 'stop' } } },
  connections: {
    list: async () => [
      { id: 'rp-default', name: 'Roleplay Default', provider: 'openai', model: 'test-model', is_default: true, has_api_key: true },
      { id: 'pocket-sidecar', name: 'Pocket Sidecar', provider: 'openrouter', model: 'sidecar-model', is_default: false, has_api_key: true },
    ],
    get: async (id) => id === 'rp-default' ? { id, name: 'Roleplay Default', provider: 'openai', model: 'test-model', is_default: true, has_api_key: true } : null,
  },
  images: {
    list: async () => ({ data: [], total: 0 }),
    get: async (id) => hostImages.get(id) || null,
    uploadFromDataUrl: async () => {
      uploadedImageCount += 1
      const id = uploadedImageCount === 1 ? 'uploaded-wallpaper' : `cached-remote-${uploadedImageCount}`
      const image = { id, url: `/api/v1/images/${id}`, original_filename: 'Wallpaper.png', mime_type: 'image/png' }
      hostImages.set(id, image)
      return image
    },
  },
  cors: async () => ({ status: 200, statusText: 'OK', headers: { 'content-type': 'image/png' }, body: 'iVBORw0KGgo=', encoding: 'base64' }),
  imageGen: {
    listConnections: async () => [],
    getProviders: async () => [],
    generate: async () => ({ imageId: 'image-a', imageUrl: '/api/v1/image-gen/results/image-a' }),
  },
  push: { getStatus: async () => ({ available: false, subscriptionCount: 0 }), send: async () => ({ sent: 0 }) },
}

await import(`${new URL('dist/backend.js', root).href}?backend-contract=${Date.now()}`)
assert.equal(typeof frontendHandler, 'function')
assert.equal(registeredTool?.name, 'phone_action')
assert.equal(typeof interceptorHandler, 'function')

await frontendHandler({ type: 'lumiphone:get_state', requestId: 'state-1', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
const firstState = frontendMessages.find((message) => message.type === 'lumiphone:state')
assert.equal(firstState.state.chatId, 'chat-a')
assert.equal(firstState.state.characterId, 'char-a')
assert.equal(firstState.state.characterName, 'Alice')
assert.equal(firstState.state.version, 11)
assert.equal(firstState.state.setup.authorship, 'roleplay', 'existing chats default to human-owned persona authorship')
assert.deepEqual(firstState.state.discoveredActors, [])
assert.deepEqual(firstState.state.references, [])
assert.deepEqual(firstState.state.groupBatches, [])
assert.equal(firstState.state.contacts[0].source.kind, 'character')
assert.equal(firstState.state.conversations.length, 1)
assert.equal(firstState.state.events.find((entry) => entry.id === 'legacy-handoff').completed, true)
assert.equal(firstState.state.trackers[0].kind, 'meter')
assert.equal(firstState.state.trackers[0].clock, 'real')
assert.equal(firstState.state.trackers[0].target.type, 'custom')
assert.equal(firstState.state.settings, undefined)
assert.equal(firstState.preferences.handsetScale, 1.15)
assert.equal(firstState.preferences.uiScale, 1)
assert.equal(firstState.activePersona.id, 'persona-test')
assert.ok(storage.has('device/preferences.json'))
assert.equal(storage.get('phones/chat-a__char-a.json').settings, undefined)
assert.equal(storage.get('phones/chat-a__char-a.json').chatId, 'chat-a')
assert.equal(firstState.swarmProfile.source, 'swarm_studio')
assert.equal(firstState.swarmProfile.status, 'connected')
assert.equal(firstState.swarmProfile.fields.char_base.detected, true)
assert.equal(macroResolveCalls.at(-1).options.userId, 'user-a')
// Historical tests below intentionally exercise AI-authored persona messages.
await frontendHandler({ type: 'lumiphone:set_authorship', chatId: 'chat-a', characterId: 'char-a', authorship: 'impersonation' }, 'user-a')

await frontendHandler({ type: 'lumiphone:gallery_add_to_chat', requestId: 'attach-image', chatId: 'chat-a', characterId: 'char-a', imageId: 'image-a', imageUrl: '/api/v1/images/image-a', filename: 'Scene.png' }, 'user-a')
assert.equal(updatedChatMessages.at(-1).chatId, 'chat-a')
assert.equal(updatedChatMessages.at(-1).messageId, 'KITCHEN-222')
assert.match(updatedChatMessages.at(-1).patch.content, /!\[Scene\.png\]\(\/api\/v1\/images\/image-a\)/)

await frontendHandler({ type: 'lumiphone:gallery_set_wallpaper', requestId: 'gallery-wallpaper', chatId: 'chat-a', characterId: 'char-a', imageId: 'image-a', target: 'home' }, 'user-a')
assert.deepEqual(storage.get('device/preferences.json').homeWallpaper.source, { kind: 'gallery', imageId: 'image-a' })
assert.deepEqual(frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).resolvedWallpapers.deviceHome, {
  url: '/api/v1/images/image-a', status: 'ready', sourceKind: 'gallery', sourceLabel: 'Lumiverse Gallery',
})
await frontendHandler({ type: 'lumiphone:upload_wallpaper_asset', requestId: 'upload-wallpaper', chatId: 'chat-a', characterId: 'char-a', target: 'device-chat', filename: 'wall.png', dataUrl: 'data:image/png;base64,AA==' }, 'user-a')
assert.deepEqual(storage.get('device/preferences.json').chatWallpaper.source, { kind: 'asset', assetId: 'uploaded-wallpaper' })
assert.deepEqual(frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).resolvedWallpapers.deviceChat, {
  url: '/api/v1/images/uploaded-wallpaper', status: 'ready', sourceKind: 'asset', sourceLabel: 'Uploaded asset',
})
assert.doesNotMatch(JSON.stringify(storage.get('device/preferences.json')), /data:image/, 'device preferences must retain only the durable asset id')

const personaPreferences = structuredClone(storage.get('device/preferences.json'))
personaPreferences.personaAppearance['persona-test'] = {
  enabled: true, theme: personaPreferences.theme, colors: structuredClone(personaPreferences.colors), customCss: '',
  homeWallpaper: { source: null, fit: 'cover', focalX: .5, focalY: .5, scrim: .22 },
  chatWallpaper: { source: null, fit: 'cover', focalX: .5, focalY: .5, scrim: .22 },
}
await frontendHandler({ type: 'lumiphone:save_preferences', requestId: 'persona-appearance', chatId: 'chat-a', characterId: 'char-a', preferences: personaPreferences }, 'user-a')
await frontendHandler({ type: 'lumiphone:set_wallpaper', requestId: 'url-wallpaper', chatId: 'chat-a', characterId: 'char-a', target: 'persona-home', personaId: 'persona-test', source: { kind: 'url', url: 'https://example.test/wall.png' } }, 'user-a')
assert.deepEqual(storage.get('device/preferences.json').personaAppearance['persona-test'].homeWallpaper.source, { kind: 'url', url: 'https://example.test/wall.png' })
const urlWallpaperState = frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1)
assert.deepEqual(urlWallpaperState.resolvedWallpapers.personaHome, {
  url: '/api/v1/images/cached-remote-2', status: 'ready', sourceKind: 'url', sourceLabel: 'Image URL',
})
assert.doesNotMatch(JSON.stringify(storage.get('device/preferences.json')), /cached-remote/, 'URL preferences must retain the URL rather than its resolver cache asset')

for (const source of [
  { kind: 'builtin', wallpaperId: 'moonrise' },
  { kind: 'gallery', imageId: 'image-a' },
  { kind: 'asset', assetId: 'uploaded-wallpaper' },
  { kind: 'url', url: 'https://example.test/wall.png' },
]) {
  for (const target of ['device-home', 'device-chat', 'persona-home', 'persona-chat']) {
    await frontendHandler({ type: 'lumiphone:set_wallpaper', requestId: `persist-${source.kind}-${target}`, chatId: 'chat-a', characterId: 'char-a', target, personaId: target.startsWith('persona-') ? 'persona-test' : undefined, source }, 'user-a')
    const saved = storage.get('device/preferences.json')
    const wallpaper = target === 'device-home' ? saved.homeWallpaper
      : target === 'device-chat' ? saved.chatWallpaper
        : target === 'persona-home' ? saved.personaAppearance['persona-test'].homeWallpaper
          : saved.personaAppearance['persona-test'].chatWallpaper
    assert.deepEqual(wallpaper.source, source, `${source.kind} source must persist for ${target}`)
  }
}
const beforeInvalidWallpaper = structuredClone(storage.get('device/preferences.json').homeWallpaper)
await frontendHandler({ type: 'lumiphone:set_wallpaper', requestId: 'missing-wallpaper', chatId: 'chat-a', characterId: 'char-a', target: 'device-home', source: { kind: 'asset', assetId: 'missing-asset' } }, 'user-a')
assert.deepEqual(storage.get('device/preferences.json').homeWallpaper, beforeInvalidWallpaper, 'an unresolvable source must not be committed')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:error' && message.requestId === 'missing-wallpaper' && /missing/i.test(message.error)))

const userActivityCount = storage.get('phones/chat-a__char-a.json').activities.length
await frontendHandler({
  type: 'lumiphone:action', requestId: 'message-1', chatId: 'chat-a', characterId: 'char-a',
  action: 'message', payload: { text: 'Hello from the phone.', sender: 'user' },
}, 'user-a')
const latestState = frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).state
assert.equal(latestState.conversations[0].messages.at(-1).text, 'Hello from the phone.')
assert.equal(latestState.conversations[0].messages.at(-1).sender, 'persona')
const personaDeviceId = latestState.pocketPersonaActorId
const recipientDeviceId = latestState.conversations[0].participantActorIds[0]
assert.equal(
  latestState.notifications.some((entry) => !entry.deviceOwnerActorId || entry.deviceOwnerActorId === personaDeviceId),
  false,
  'user send must not notify the sender device',
)
assert.ok(
  latestState.notifications.some((entry) => entry.deviceOwnerActorId === recipientDeviceId && entry.body.includes('Hello from the phone.')),
  'user send should notify the recipient device',
)
assert.equal(latestState.activities.length, userActivityCount, 'user send must not emit a user-visible Pocket activity')

const firstConversationId = latestState.conversations[0].id
await frontendHandler({ type: 'lumiphone:view_state', requestId: 'view-thread', chatId: 'chat-a', characterId: 'char-a', open: true, route: { app: 'messages', conversationId: firstConversationId } }, 'user-a')
const visibleNotificationsBefore = storage.get('phones/chat-a__char-a.json').notifications.length
await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'visible-incoming', args: {
    action: 'message', chat_id: 'chat-a', character_id: 'char-a', payload: { conversationId: firstConversationId, text: 'Visible incoming', format: 'voice', senderContactId: 'char-a' },
  },
}, 'user-a')
let notificationState = storage.get('phones/chat-a__char-a.json')
assert.equal(notificationState.notifications.length, visibleNotificationsBefore, 'exact visible destination must suppress notification')
assert.equal(notificationState.conversations.find((entry) => entry.id === firstConversationId).messages.at(-1).status, 'read')
assert.equal(notificationState.conversations.find((entry) => entry.id === firstConversationId).messages.at(-1).format, 'voice', 'model actions must persist voice format')

await frontendHandler({ type: 'lumiphone:view_state', requestId: 'view-home', chatId: 'chat-a', characterId: 'char-a', open: true, route: { app: 'home' } }, 'user-a')
await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'elsewhere-incoming', args: {
    action: 'message', chat_id: 'chat-a', character_id: 'char-a', payload: { conversationId: firstConversationId, text: 'Elsewhere incoming', senderContactId: 'char-a' },
  },
}, 'user-a')
notificationState = storage.get('phones/chat-a__char-a.json')
const elsewhereNotification = notificationState.notifications.find((entry) => entry.body === 'Elsewhere incoming')
assert.equal(notificationState.conversations.find((entry) => entry.id === firstConversationId).messages.find(entry => entry.text === 'Visible incoming').format, 'voice', 'voice format must survive a subsequent state load')
assert.equal(elsewhereNotification.route.conversationId, firstConversationId, 'notification must retain a typed deep link')
const messageCountBeforeDismiss = notificationState.conversations.find((entry) => entry.id === firstConversationId).messages.length
await frontendHandler({ type: 'lumiphone:notification_dismiss', requestId: 'dismiss-incoming', chatId: 'chat-a', characterId: 'char-a', notificationId: elsewhereNotification.id }, 'user-a')
notificationState = storage.get('phones/chat-a__char-a.json')
assert.equal(notificationState.conversations.find((entry) => entry.id === firstConversationId).messages.length, messageCountBeforeDismiss, 'dismiss must not delete its message')
assert.ok(notificationState.notifications.find((entry) => entry.id === elsewhereNotification.id).dismissedAt)

await frontendHandler({ type: 'lumiphone:save_preferences', requestId: 'auto-reply-on', chatId: 'chat-a', characterId: 'char-a', preferences: { autoReplyAfterSend: true, replyCadence: 'instant', generationMode: 'roleplay' } }, 'user-a')
const autoQuiet = spindle.generate.quiet
let autoDecisionCalls = 0
spindle.generate.quiet = async () => { autoDecisionCalls += 1; return { content: '{"reply":false}' } }
let autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
const beforeFalseDecision = autoConversation.messages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'auto-false-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'No response needed', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoDecisionCalls, 1, 'false decision must perform only the bounded decision call')
assert.equal(autoConversation.messages.length, beforeFalseDecision + 1, 'false decision must not generate a reply')

autoDecisionCalls = 0
const beforeBurst = autoConversation.messages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'burst-one', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'First part', sender: 'persona' } }, 'user-a')
await frontendHandler({ type: 'lumiphone:action', requestId: 'burst-two', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'Second part', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoDecisionCalls, 1, 'one settled outgoing burst must produce one reply decision')
assert.equal(autoConversation.messages.length, beforeBurst + 2)
assert.equal(autoConversation.outgoingBurst.messageIds.length, 2)

autoDecisionCalls = 0
spindle.generate.quiet = async () => { autoDecisionCalls += 1; return { content: '{"action":"none"}' } }
await frontendHandler({ type: 'lumiphone:action', requestId: 'held-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'Wait, I am still typing', sender: 'persona' } }, 'user-a')
await frontendHandler({ type: 'lumiphone:composer_state', requestId: 'held-focus', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId, held: true }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoDecisionCalls, 0, 'composer activity must postpone reply evaluation')
assert.equal(autoConversation.outgoingBurst.open, true)
assert.equal(autoConversation.outgoingBurst.held, true)
await frontendHandler({ type: 'lumiphone:composer_state', requestId: 'held-blur', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId, held: false }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoDecisionCalls, 1, 'blur must resume and finalize the held burst once')
assert.equal(autoConversation.outgoingBurst.finalized, true)

let manualReplyDecisionCalls = 0
spindle.generate.quiet = async (request) => {
  const systemPrompt = String(request?.messages?.find((message) => message?.role === 'system')?.content || '')
  if (systemPrompt.includes('Classify the next channel state')) {
    manualReplyDecisionCalls += 1
    return { content: '{"action":"none"}' }
  }
  // Continuity-seed generation is orthogonal to this contract.
  // Preserve the old stub's non-JSON behavior so this test does not persist
  // a new continuity seed and change unrelated downstream interceptor state.
  return { content: 'Manual flush reply.' }
}
const beforeManualFlush = autoConversation.messages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'manual-flush-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'Answer this now', sender: 'persona' } }, 'user-a')
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'manual-flush-generate', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(manualReplyDecisionCalls, 0, 'manual generation must flush the burst without a separate reply decision')
assert.equal(autoConversation.messages.length, beforeManualFlush + 2)
assert.equal(autoConversation.messages.at(-1).text, 'Manual flush reply.')
assert.equal(autoConversation.outgoingBurst.finalized, true)

// A slow provider may ignore AbortSignal. Its late text must still never commit.
const beforeCancelledReply = storage.get('phones/chat-a__char-a.json').conversations.find(entry => entry.id === firstConversationId).messages.length
let releaseCancelledReply
let markReplyStarted
let markReplyAborted
const replyStarted = new Promise(resolve => { markReplyStarted = resolve })
const replyAborted = new Promise(resolve => { markReplyAborted = resolve })
spindle.generate.quiet = async request => {
  if (!request.signal) return { content: 'Unrelated continuity request.' }
  request.signal.addEventListener('abort', markReplyAborted, { once: true })
  markReplyStarted()
  await new Promise(resolve => { releaseCancelledReply = resolve })
  return { content: 'This cancelled reply must never appear.' }
}
const slowReply = frontendHandler({ type: 'lumiphone:generate_message', requestId: 'slow-cancel-test', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId }, 'user-a')
await replyStarted
const stopReply = frontendHandler({ type: 'lumiphone:cancel_message_generation', requestId: 'cancel-slow-test', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId }, 'user-a')
await replyAborted
releaseCancelledReply()
await Promise.all([slowReply, stopReply])
assert.equal(storage.get('phones/chat-a__char-a.json').conversations.find(entry => entry.id === firstConversationId).messages.length, beforeCancelledReply, 'cancelled generation must not append a late reply')
assert.equal(frontendMessages.some(entry => entry.type === 'lumiphone:error' && entry.requestId === 'slow-cancel-test'), false, 'intentional cancellation must not surface as a provider error')

const presenceContactId = autoConversation.participantContactIds[0]
await frontendHandler({ type: 'lumiphone:set_presence', requestId: 'presence-here', chatId: 'chat-a', characterId: 'char-a', contactId: presenceContactId, inScene: true }, 'user-a')
let presenceState = storage.get('phones/chat-a__char-a.json')
assert.equal(presenceState.contacts.find(entry => entry.id === presenceContactId).presence.inScene, true)
assert.equal(presenceState.conversations.find(entry => entry.id === firstConversationId).availability.state, 'local')
await frontendHandler({ type: 'lumiphone:set_presence', requestId: 'presence-away', chatId: 'chat-a', characterId: 'char-a', contactId: presenceContactId, inScene: false }, 'user-a')
presenceState = storage.get('phones/chat-a__char-a.json')
assert.equal(presenceState.contacts.find(entry => entry.id === presenceContactId).presence.inScene, false)
assert.equal(presenceState.conversations.find(entry => entry.id === firstConversationId).availability.state, 'remote', 'marking a contact away must reopen their remote channel')
assert.equal(presenceState.conversations.find(entry => entry.id === firstConversationId).messages.length, beforeCancelledReply, 'presence correction must not fabricate messages')

spindle.generate.quiet = async () => ({ content: '{"action":"pause","reason":"busy"}' })
const beforePauseDecision = autoConversation.messages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'auto-pause-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'See you when you get here', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoConversation.messages.length, beforePauseDecision + 1, 'pause decision must not generate a remote reply')
assert.deepEqual(autoConversation.pause.reason, 'busy')

spindle.generate.quiet = async () => ({ content: '{"action":"handoff","reason":"arriving"}' })
await frontendHandler({ type: 'lumiphone:action', requestId: 'auto-handoff-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'The door is open', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 40))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.deepEqual(autoConversation.availability, { state: 'arriving' }, 'arriving must remain a usable remote transition until scene presence corroborates it')

// Once travel is established and the remote exchange naturally closes, Pocket may
// bridge narrative control back to the main RP without claiming physical arrival.
spindle.generate.quiet = async () => ({ content: '{"action":"arrival_handoff","reason":"arriving"}' })
const beforeArrivalAppendCount = appendedChatMessages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'arrival-bridge-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'gave it to you for a reason, dumbass', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 60))
let arrivalState = storage.get('phones/chat-a__char-a.json')
autoConversation = arrivalState.conversations.find((entry) => entry.id === firstConversationId)
const arrivalRelay = [...arrivalState.relays].reverse().find((entry) => entry.kind === 'arrival' && entry.status === 'pending' && entry.conversationId === firstConversationId)
assert.ok(arrivalRelay, 'arrival_handoff must create a pending arrival relay')
assert.equal(arrivalRelay.reason, 'arriving')
assert.equal(arrivalRelay.actorState, 'arriving')
assert.deepEqual(autoConversation.availability, { state: 'arriving' }, 'arrival relay must not localize the actor')
assert.equal(autoConversation.lastDecision.normalizedAction, 'arrival_handoff')
assert.equal(appendedChatMessages.length, beforeArrivalAppendCount, 'arrival waits for quiet time instead of immediately interrupting phone chat')
await frontendHandler({ type: 'lumiphone:continue_arrival', requestId: 'manual-arrival-now', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId }, 'user-a')
await new Promise(resolve => setTimeout(resolve, 40))
assert.equal(appendedChatMessages.length, beforeArrivalAppendCount + 1, 'Continue to arrival still starts the main RP immediately')
assert.equal(appendedChatMessages.at(-1).options.triggerGeneration, true)
assert.match(appendedChatMessages.at(-1).message.content, /toward the arrival/i)
const arrivalEvent = arrivalState.events.find((entry) => entry.source?.relayId === arrivalRelay.id)
assert.equal(arrivalEvent?.channelTransition?.to, 'arriving')
assert.equal(arrivalEvent?.channelTransition?.reason, 'arriving')
const arrivalIntercept = await interceptorHandler([{ role: 'user', content: 'Continue toward arrival.', sourceMessageMetadata: { pocketContinuation: true, pocketRelayId: arrivalRelay.id } }], { chatId: 'chat-a', userId: 'user-a' })
assert.match(arrivalIntercept.messages.at(-1).content, /POCKET ARRIVAL RELAY — NEWER STATE/)
assert.match(arrivalIntercept.messages.at(-1).content, /NOT physically present yet/)
assert.doesNotMatch(arrivalIntercept.messages.at(-1).content, /transition: remote -> local/)
const injectedArrivalRelay = storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === arrivalRelay.id)
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-a', generationId: injectedArrivalRelay.continuation.generationId }, 'user-a')
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: injectedArrivalRelay.continuation.generationId, messageId: 'arrival-rp-message' }, 'user-a')
arrivalState = storage.get('phones/chat-a__char-a.json')
assert.equal(arrivalState.relays.find((entry) => entry.id === arrivalRelay.id).status, 'consumed')
assert.deepEqual(arrivalState.conversations.find((entry) => entry.id === firstConversationId).availability, { state: 'arriving' }, 'consuming an arrival relay must still wait for narrative presence')

const handoffState = storage.get('phones/chat-a__char-a.json')
handoffState.contacts.find((entry) => entry.id === 'char-a').presence.inScene = true
storage.set('phones/chat-a__char-a.json', handoffState)
autoDecisionCalls = 0
spindle.generate.quiet = async () => { autoDecisionCalls += 1; return { content: '{"action":"none"}' } }
await frontendHandler({ type: 'lumiphone:action', requestId: 'present-handoff-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'You are literally standing here', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 60))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoDecisionCalls, 0, 'scene-present actors must hand off deterministically without asking the reply model for none')
assert.deepEqual(autoConversation.availability, { state: 'local', reason: 'arrived' })
assert.equal(storage.get('phones/chat-a__char-a.json').relays.filter((entry) => entry.status === 'pending').length, 1)
const localHandoffEvents = storage.get('phones/chat-a__char-a.json').events.filter((entry) => entry.kind === 'phone-handoff' && entry.id !== 'legacy-handoff' && entry.channelTransition?.to === 'local')
assert.equal(localHandoffEvents.length, 1)
assert.equal(localHandoffEvents[0].completed, true, 'Timeline records the occurred local handoff independently of relay consumption')
assert.equal(appendedChatMessages.at(-1).options.triggerGeneration, true, 'handoff must trigger native main roleplay generation')
const pendingRelay = storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.status === 'pending')
assert.equal(pendingRelay.burstId, autoConversation.lastDecision.burstId, 'relay must persist its creating decision burst')
assert.equal(pendingRelay.continuation.state, 'accepted', 'host return with generation id accepts the continuation request')
assert.equal(pendingRelay.continuation.method, 'spindle.chat.appendMessage(triggerGeneration)')
assert.equal(pendingRelay.continuation.permissions.chatMutation, true)
assert.equal(pendingRelay.continuation.permissions.generation, true)
const ordinaryIntercept = await interceptorHandler([{ role: 'user', content: 'An unrelated next turn.' }], { chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'unrelated-generation' })
assert.doesNotMatch(ordinaryIntercept.messages.at(-1).content, /POCKET CONTINUITY RELAY/, 'ordinary generations must not receive every pending relay')
// Match the current real Lumiverse payload: interceptor context supplies the chat,
// but not characterId/generationId and the internal continuation row may omit metadata.
const pendingIntercept = await interceptorHandler([{ role: 'user', content: 'Continue.' }], { chatId: 'chat-a', userId: 'user-a' })
assert.equal(pendingIntercept.messages.length, 3, 'the urgent relay must be a separate system contribution after generic Pocket memory')
assert.match(pendingIntercept.messages.at(-2).content, /"contacts":\[\{/, 'the generic snapshot must load the authoritative chat/character phone')
assert.match(pendingIntercept.messages.at(-1).content, /=== POCKET CONTINUITY RELAY — NEWER STATE ===/, 'pending relay must outrank stale scene context')
assert.match(pendingIntercept.messages.at(-1).content, /You are literally standing here/)
assert.equal(pendingIntercept.breakdown.at(-1).name, 'Pocket continuity relay — newer state')
let injectedRelay = storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === pendingRelay.id)
assert.equal(injectedRelay.injectedGenerationId, pendingRelay.continuation.generationId)
assert.ok(injectedRelay.injectedAt)
assert.equal(injectedRelay.serializedRelay, pendingIntercept.messages.at(-1).content)
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-a', generationId: pendingRelay.continuation.generationId }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === pendingRelay.id).continuation.state, 'started', 'a real host start event must be observed separately from request acceptance')

await frontendHandler({ type: 'lumiphone:action', requestId: 'second-present-handoff', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'A distinct later handoff', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 60))
const pendingAfterSecondBurst = storage.get('phones/chat-a__char-a.json').relays.filter((entry) => entry.status === 'pending')
assert.equal(pendingAfterSecondBurst.length, 2, 'a new decision burst must not reuse an older pending relay')
assert.notEqual(pendingAfterSecondBurst[0].burstId, pendingAfterSecondBurst[1].burstId)
const secondRelay = pendingAfterSecondBurst[1]
const permissionState = storage.get('phones/chat-a__char-a.json')
permissionState.relays.find((entry) => entry.id === secondRelay.id).continuation = { state: 'started', generationId: 'generation-without-injection' }
storage.set('phones/chat-a__char-a.json', permissionState)
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: 'generation-without-injection', messageId: 'uninformed-rp-message' }, 'user-a')
const uninjectedRelay = storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id)
assert.equal(uninjectedRelay.status, 'pending', 'a generation cannot consume a relay it never received')
assert.match(uninjectedRelay.injectionError, /without a confirmed matching Pocket relay injection/i)
uninjectedRelay.continuation = { state: 'idle' }
storage.set('phones/chat-a__char-a.json', storage.get('phones/chat-a__char-a.json'))
permissions.delete('chat_mutation')
await frontendHandler({ type: 'lumiphone:continue_relay', requestId: 'blocked-continuation', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 30))
assert.match(storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id).continuation.error, /Chat mutation permission/i)
assert.equal(storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id).status, 'pending')
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: pendingRelay.continuation.generationId, messageId: 'continued-rp-message' }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === pendingRelay.id).status, 'consumed', 'relay must be consumed only after a successful matching injected generation')
permissions.add('chat_mutation')
await frontendHandler({ type: 'lumiphone:continue_relay', requestId: 'retry-continuation', chatId: 'chat-a', characterId: 'char-a', conversationId: firstConversationId }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 30))
assert.equal(storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id).continuation.state, 'accepted', 'retry must use the same native continuation path')
const retriedRelay = storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id)
const retryIntercept = await interceptorHandler([{ role: 'user', content: 'Continue retry.', sourceMessageMetadata: { pocketContinuation: true, pocketRelayId: retriedRelay.id } }], { chatId: 'chat-a', userId: 'user-a' })
assert.equal(retryIntercept.messages.length, 3, 'message provenance must target a relay even when runtime context omits character and generation IDs')
assert.match(retryIntercept.messages.at(-1).content, /A distinct later handoff/)
const retriedInjectedRelay = storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id)
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-a', generationId: retriedInjectedRelay.continuation.generationId }, 'user-a')
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: retriedInjectedRelay.continuation.generationId, messageId: 'retried-rp-message' }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').relays.find((entry) => entry.id === secondRelay.id).status, 'consumed')

const resumedState = storage.get('phones/chat-a__char-a.json')
resumedState.contacts.find((entry) => entry.id === 'char-a').presence.inScene = false
resumedState.conversations.find((entry) => entry.id === firstConversationId).availability = { state: 'remote' }
storage.set('phones/chat-a__char-a.json', resumedState)
autoConversation = resumedState.conversations.find((entry) => entry.id === firstConversationId)

autoDecisionCalls = 0
let autoReplyGenerationCalls = 0
spindle.generate.quiet = async (request) => {
  const systemPrompt = String(request?.messages?.find((message) => message?.role === 'system')?.content || '')
  if (systemPrompt.includes('Classify the next channel state')) {
    autoDecisionCalls += 1
    return { content: '{"reply":true}' }
  }
  // generateMessage may refresh narrative continuity before writing the phone reply.
  // Keep that orthogonal generation observationally neutral for this contract.
  if (systemPrompt.includes('Extract a small structured RP WORLD STATE delta')) {
    return { content: 'I can reply now.' }
  }
  autoReplyGenerationCalls += 1
  return { content: 'I can reply now.' }
}
const beforeTrueDecision = autoConversation.messages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'auto-true-send', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: firstConversationId, text: 'Please reply', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 60))
autoConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === firstConversationId)
assert.equal(autoDecisionCalls, 1, 'true decision must perform exactly one bounded reply-decision call')
assert.equal(autoReplyGenerationCalls, 1, 'true decision must trigger exactly one separate reply generation')
assert.equal(autoConversation.messages.length, beforeTrueDecision + 2)
assert.equal(autoConversation.messages.at(-1).text, 'I can reply now.')
assert.equal(autoConversation.pause, undefined, 'a successful new incoming reply must resume a paused conversation')
spindle.generate.quiet = autoQuiet
await frontendHandler({ type: 'lumiphone:save_preferences', requestId: 'auto-reply-off', chatId: 'chat-a', characterId: 'char-a', preferences: { autoReplyAfterSend: false } }, 'user-a')

const intercepted = await interceptorHandler([{ role: 'user', content: 'Continue.' }], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a',
})
const interceptedContent = intercepted.messages.map((message) => String(message.content || '')).join('\n\n')
assert.equal(intercepted.messages.length, 3, 'consumed relay must fall back to persistent established handoff history')
assert.deepEqual(
  intercepted.breakdown.map((entry) => entry.name),
  ['Pocket memory', 'Pocket handoff memory — established history'],
)
assert.match(intercepted.messages[1].content, /Current Pocket snapshot/)
assert.match(intercepted.messages[2].content, /POCKET HANDOFF MEMORY — ESTABLISHED SHARED HISTORY/)
assert.doesNotMatch(interceptedContent, /POCKET CONTINUITY RELAY — NEWER STATE/, 'consumed relay urgency must disappear')
assert.doesNotMatch(intercepted.messages[1].content, /Hello from the phone/)

const toolResult = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'tool-1', args: {
    action: 'note', chat_id: 'chat-a', character_id: 'char-a', payload: { title: 'Private thought', body: 'Remember the station.' },
  },
}, 'user-a')
assert.equal(JSON.parse(toolResult).ok, true)
await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'tool-1', args: {
    action: 'note', chat_id: 'chat-a', character_id: 'char-a', payload: { title: 'Private thought', body: 'Remember the station.' },
  },
}, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').notes.filter((note) => note.title === 'Private thought').length, 1)
assert.equal(storage.get('phones/chat-a__char-a.json').activities.filter((activity) => activity.title === 'Journal updated').length, 1)

const lazyDm = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'lazy-maya-1', args: {
    action: 'message', chat_id: 'chat-a', character_id: 'char-a',
    payload: { channel: 'dm', speaker: 'Maya', target: 'Alice', message: 'Tell Shoto he still owes me twenty bucks.' },
  },
}, 'user-a')
assert.equal(JSON.parse(lazyDm).ok, true)
let lazyState = storage.get('phones/chat-a__char-a.json')
const mayaActor = lazyState.discoveredActors.find((actor) => actor.displayName === 'Maya')
assert.ok(mayaActor, 'an unknown named DM sender must materialize as a discovered actor')
assert.equal(lazyState.contacts.some((contact) => contact.name === 'Maya'), false, 'lazy discovery must not clutter Contacts')
const mayaDm = lazyState.conversations.find((conversation) => conversation.kind === 'direct' && conversation.participantActorIds?.[0] === mayaActor.id)
assert.equal(mayaDm.messages[0].senderActorId, mayaActor.id)
assert.equal(mayaDm.messages[0].senderContactId, undefined)
await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'lazy-maya-2', args: {
    action: 'message', chat_id: 'chat-a', character_id: 'char-a', payload: { channel: 'dm', speaker: { name: 'Maya' }, text: 'Still twenty bucks.' },
  },
}, 'user-a')
lazyState = storage.get('phones/chat-a__char-a.json')
assert.equal(lazyState.discoveredActors.filter((actor) => actor.displayName === 'Maya').length, 1, 'repeat names must reuse the same discovered actor')
const externalMayaAlice = lazyState.conversations.find((conversation) => conversation.id === mayaDm.id)
assert.equal(externalMayaAlice.messages.length, 1, 'the explicit Maya → Alice external DM must remain its own communication')
const personaMayaDm = lazyState.conversations.find((conversation) =>
  conversation.kind === 'direct'
  && conversation.includesPocketPersona
  && conversation.participantActorIds?.includes(mayaActor.id)
)
assert.ok(personaMayaDm, 'a targetless Maya message should resolve as Maya → current Pocket Persona')
assert.equal(personaMayaDm.messages.length, 1)
assert.equal(personaMayaDm.messages[0].senderActorId, mayaActor.id, 'the reused Maya actor must author the Persona-facing DM')
assert.equal(personaMayaDm.messages[0].text, 'Still twenty bucks.')

// Device projection: model-authored Persona names canonicalize to the Persona actor,
// while NPC-to-NPC direct messages persist externally without leaking onto the Persona phone.
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'device-state', chatId: 'chat-device', characterId: 'char-a' }, 'user-a')
await frontendHandler({
  type: 'lumiphone:save_pocket_persona', requestId: 'device-persona', chatId: 'chat-device', characterId: 'char-a',
  persona: { displayName: 'Kai', role: 'Persona', source: 'manual' },
}, 'user-a')
const protectedDeviceBefore = JSON.stringify(storage.get('phones/chat-device__char-a.json'))
for (const payload of [
  { speaker: 'Kai', target: 'Tyler', text: 'Blocked alias' },
  { sender: 'user', target: 'Tyler', text: 'Blocked shortcut' },
  { sender: 'persona', target: 'Tyler', text: 'Blocked persona' },
]) {
  const denied = await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', args: { action: 'message', chat_id: 'chat-device', character_id: 'char-a', payload } }, 'user-a')
  assert.match(denied, /Roleplay mode/)
}
assert.equal(JSON.stringify(storage.get('phones/chat-device__char-a.json')), protectedDeviceBefore, 'rejected persona writes must have no persisted side effects')
await frontendHandler({ type: 'lumiphone:model_action', requestId: 'blocked-persona-tag', chatId: 'chat-device', characterId: 'char-a', attrs: { action: 'message' }, content: JSON.stringify({ sender: 'persona', target: 'Tyler', text: 'Blocked tag' }) }, 'user-a')
assert.ok(frontendMessages.some(entry => entry.type === 'lumiphone:error' && entry.requestId === 'blocked-persona-tag' && /Roleplay mode/.test(entry.error)))
await frontendHandler({ type: 'lumiphone:set_authorship', chatId: 'chat-device', characterId: 'char-a', authorship: 'impersonation' }, 'user-a')
const personaSendResult = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'device-kai-to-tyler', args: {
    action: 'message', chat_id: 'chat-device', character_id: 'char-a',
    payload: { channel: 'dm', speaker: 'Kai', target: 'Tyler', text: 'Bring him. Just you two.' },
  },
}, 'user-a')
const personaSendPayload = JSON.parse(personaSendResult)
assert.equal(personaSendPayload.ok, true)
assert.match(personaSendPayload.artifactTag, /data-pocket-inline-anchor=/, 'message tool result must use the durable inline anchor protocol')
let deviceState = storage.get('phones/chat-device__char-a.json')
const devicePersonaId = deviceState.pocketPersonaActorId
const tylerActor = deviceState.discoveredActors.find((actor) => actor.displayName === 'Tyler')
assert.ok(tylerActor, 'Persona-authored direct-message targets may materialize as lightweight actors')
const kaiTyler = deviceState.conversations.find((conversation) => conversation.kind === 'direct' && conversation.includesPocketPersona && conversation.participantActorIds.includes(tylerActor.id))
assert.ok(kaiTyler, 'Kai → Tyler must use a Persona-participating direct conversation')
assert.equal(kaiTyler.messages.at(-1).sender, 'persona')
assert.equal(kaiTyler.messages.at(-1).senderActorId, devicePersonaId, 'speaker matching the configured Pocket Persona must canonicalize to Persona identity')
assert.deepEqual(kaiTyler.messages.at(-1).recipientActorIds, [tylerActor.id])
assert.equal(kaiTyler.unread, 0, 'outbound Persona messages must never unread-notify their own device')
assert.equal(deviceState.contacts.some((contact) => contact.name === 'Kai'), false, 'the configured Persona must never be materialized as a Contact')
assert.equal(deviceState.notifications.some((entry) => entry.deviceOwnerActorId === devicePersonaId && entry.source === 'model' && entry.body.includes('Bring him')), false)
assert.ok(deviceState.notifications.some((entry) => entry.deviceOwnerActorId === tylerActor.id && entry.body.includes('Bring him')), 'the recipient device should own the unread notification')
assert.equal(deviceState.activities.at(-1).presentation.kind, 'sent')

const externalResult = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'device-marcus-to-tyler', args: {
    action: 'message', chat_id: 'chat-device', character_id: 'char-a',
    payload: { channel: 'dm', speaker: 'Marcus', target: 'Tyler', text: 'Track him. Send the pin.' },
  },
}, 'user-a')
const externalPayload = JSON.parse(externalResult)
assert.equal(externalPayload.ok, true)
assert.match(externalPayload.artifactTag, /data-pocket-inline-anchor=/, 'external message tool result must use the durable inline anchor protocol')
deviceState = storage.get('phones/chat-device__char-a.json')
const marcusActor = deviceState.discoveredActors.find((actor) => actor.displayName === 'Marcus')
const externalDm = deviceState.conversations.find((conversation) => conversation.kind === 'direct' && conversation.includesPocketPersona === false && conversation.participantActorIds.includes(marcusActor.id) && conversation.participantActorIds.includes(tylerActor.id))
assert.ok(externalDm, 'NPC ↔ NPC communication must persist as an external direct conversation')
assert.equal(externalDm.messages.at(-1).senderActorId, marcusActor.id)
assert.deepEqual(externalDm.messages.at(-1).recipientActorIds, [tylerActor.id])
assert.equal(deviceState.notifications.some((entry) => entry.deviceOwnerActorId === devicePersonaId && entry.body.includes('Track him')), false, 'external NPC traffic must not leak onto the Persona device')
assert.ok(deviceState.notifications.some((entry) => entry.deviceOwnerActorId === tylerActor.id && entry.body.includes('Track him')))
assert.equal(deviceState.activities.at(-1).presentation.kind, 'observed')

// Calls use the same durable candidate commit protocol and conversation history.
await frontendHandler({ type: 'lumiphone:get_state', chatId: 'chat-call', characterId: 'char-a' }, 'user-a')
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-call', characterId: 'char-a', generationId: 'call-gen', generationType: 'regenerate', targetMessageId: 'call-host', targetSwipeId: 0 }, 'user-a')
const callStart = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', args: { action: 'call', chat_id: 'chat-call', character_id: 'char-a', payload: { speaker: 'Alice', status: 'connected', speakerphone: true } } }, 'user-a'))
assert.ok(callStart.callId); assert.match(callStart.artifactTag, /data-pocket-inline-anchor/)
assert.ok(frontendMessages.some(entry => entry.type === 'lumiphone:provisional_activity' && entry.activity.id === callStart.activityId && entry.activity.kind === 'call'))
const callEnd = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', args: { action: 'call', chat_id: 'chat-call', character_id: 'char-a', payload: { speaker: 'Alice', status: 'ended', conversationId: callStart.conversationId, callId: callStart.callId, durationSeconds: 240 } } }, 'user-a'))
assert.equal(callEnd.ok, true)
const ghostCall = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', args: { action: 'call', chat_id: 'chat-call', character_id: 'char-a', payload: { speaker: 'Alice', status: 'missed' } } }, 'user-a'))
const callMessagesBefore = spindle.chat.getMessages
const callContent = `${callStart.artifactTag}\nOrdinary spoken dialogue.\n${callEnd.artifactTag}`
spindle.chat.getMessages = async () => [{ id: 'call-host', role: 'assistant', content: callContent, swipes: [callContent], swipe_id: 0 }]
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-call', generationId: 'call-gen', generationType: 'regenerate', messageId: 'call-host' }, 'user-a')
spindle.chat.getMessages = callMessagesBefore
const callState = storage.get('phones/chat-call__char-a.json')
const callRows = callState.conversations.flatMap(entry => entry.messages)
assert.equal(callRows.filter(entry => entry.call).length, 2)
assert.equal(callRows.some(entry => entry.id === ghostCall.messageId), false, 'reasoning-only call markers must be discarded')
assert.equal(callRows.find(entry => entry.id === callEnd.messageId).call.speakerphone, true)
assert.match(callRows.find(entry => entry.id === callEnd.messageId).text, /Call ended.*Speakerphone.*4:00/)
assert.ok(callState.activities.some(entry => entry.id === callStart.activityId && entry.kind === 'call'))
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'call-reload', chatId: 'chat-call', characterId: 'char-a' }, 'user-a')
assert.ok(frontendMessages.filter(entry => entry.type === 'lumiphone:state').at(-1).state.conversations.flatMap(entry => entry.messages).some(entry => entry.call?.status === 'ended'))
const invalidEnd = await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', args: { action: 'call', chat_id: 'chat-call', character_id: 'char-a', payload: { speaker: 'Alice', status: 'ended', conversationId: callStart.conversationId, callId: 'unknown' } } }, 'user-a')
assert.match(invalidEnd, /existing connected call/)
const batchDenied = await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', args: { action: 'message_batch', chat_id: 'chat-call', character_id: 'char-a', payload: { conversation: 'Guarded group', participants: ['Test Persona', 'Alice'], messages: [{ sender: 'user', text: 'Cannot sneak into a batch' }] } } }, 'user-a')
assert.match(batchDenied, /Roleplay mode/)
await frontendHandler({ type: 'lumiphone:action', requestId: 'manual-in-rp', chatId: 'chat-call', characterId: 'char-a', action: 'message', payload: { conversationId: callStart.conversationId, text: 'Human typed this' } }, 'user-a')
assert.ok(storage.get('phones/chat-call__char-a.json').conversations.flatMap(entry => entry.messages).some(entry => entry.text === 'Human typed this' && entry.sender === 'persona'))

// Character/council-backed contact deletion leaves a source tombstone so normalization cannot resurrect it.
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'delete-state', chatId: 'chat-delete', characterId: 'char-a' }, 'user-a')
await frontendHandler({ type: 'lumiphone:delete', requestId: 'delete-character-contact', chatId: 'chat-delete', characterId: 'char-a', kind: 'contact', id: 'char-a' }, 'user-a')
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'delete-state-again', chatId: 'chat-delete', characterId: 'char-a' }, 'user-a')
const deletedState = storage.get('phones/chat-delete__char-a.json')
assert.equal(deletedState.contacts.some((contact) => contact.id === 'char-a'), false, 'deleted linked Character contact must stay deleted')
assert.ok(deletedState.suppressedContactSourceKeys.includes('character:char-a'))

// Swipe candidates are mutually exclusive phone realities inside one host message.
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-a', characterId: 'char-a', generationId: 'swipe-gen-0', generationType: 'normal', targetMessageId: 'host-swipe-message', targetSwipeId: 0 }, 'user-a')
const swipeZeroResult = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'swipe-tool-0', args: { action: 'message', chat_id: 'chat-a', character_id: 'char-a', payload: { channel: 'dm', speaker: 'Test Persona', target: 'Tyler', text: 'Candidate zero.' } },
}, 'user-a'))
assert.match(swipeZeroResult.presentation, /Continue the roleplay normally/i)
assert.match(swipeZeroResult.artifactTag, /data-pocket-inline-anchor=/, 'visible message tool result must return the durable inline anchor directly')
assert.doesNotMatch(swipeZeroResult.artifactTag, /<pocket-artifact\b/i, 'new visible marker must not wait for a legacy tag rewrite')
const swipeZeroProvisionalEvent = frontendMessages.filter((message) => message.type === 'lumiphone:provisional_activity' && message.activity?.id === swipeZeroResult.activityId).at(-1)
assert.ok(swipeZeroProvisionalEvent, 'provisional message tool call must publish transient render metadata before candidate commit')
assert.equal(swipeZeroProvisionalEvent.origin.swipeId, 0)
const swipeZeroActivity = storage.get('phones/chat-a__char-a.json').activities.find((entry) => entry.id === swipeZeroResult.activityId)
assert.equal(swipeZeroActivity?.source?.messageId, 'host-swipe-message', 'tool-authored message activity must anchor to its host candidate even when TOOL_INVOCATION omits messageId')
const sameCandidateDuplicate = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'swipe-tool-0-repeat', args: { action: 'message', chat_id: 'chat-a', character_id: 'char-a', payload: { channel: 'dm', speaker: 'Test Persona', target: 'Tyler', text: 'Candidate zero.' } },
}, 'user-a'))
assert.equal(sameCandidateDuplicate.deduplicated, true, 'same candidate must not commit the same phone side effect twice')
assert.equal(storage.get('phones/chat-a__char-a.json').conversations.flatMap((entry) => entry.messages).filter((entry) => entry.text === 'Candidate zero.').length, 1)
const getMessagesBeforeInlineFinalize = spindle.chat.getMessages
const candidateZeroHostContent = `Before the phone.\n\n${swipeZeroResult.artifactTag}\n\nAfter the phone.`
spindle.chat.getMessages = async () => [{ id: 'host-swipe-message', index_in_chat: 1, role: 'assistant', content: candidateZeroHostContent, swipes: [candidateZeroHostContent], swipe_id: 0 }]
const updatesBeforeInlineFinalize = updatedChatMessages.length
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: 'swipe-gen-0', generationType: 'regenerate', messageId: 'host-swipe-message' }, 'user-a')
const inlineFinalizeUpdates = updatedChatMessages.slice(updatesBeforeInlineFinalize).filter((entry) => entry.messageId === 'host-swipe-message')
assert.equal(inlineFinalizeUpdates.length, 0, 'durable inline artifact anchors must not require a GENERATION_ENDED rewrite on the normal path')
assert.match(candidateZeroHostContent, /data-pocket-inline-anchor=/, 'candidate content must already contain the exact-position anchor before commit')
spindle.chat.getMessages = getMessagesBeforeInlineFinalize
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-a', characterId: 'char-a', generationId: 'swipe-gen-1', generationType: 'regenerate', targetMessageId: 'host-swipe-message', targetSwipeId: 1 }, 'user-a')
const swipeOneResult = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'swipe-tool-1', args: { action: 'message', chat_id: 'chat-a', character_id: 'char-a', payload: { channel: 'dm', speaker: 'Test Persona', target: 'Tyler', text: 'Candidate zero.' } },
}, 'user-a'))
assert.match(swipeOneResult.commitTag, /<pocket-commit\b/, 'message tool result must provide an off-screen commit marker')
const candidateOneHostContent = `The message happens off-screen.

${swipeOneResult.commitTag}`
spindle.chat.getMessages = async () => [{ id: 'host-swipe-message', index_in_chat: 1, role: 'assistant', content: candidateOneHostContent, swipes: [candidateZeroHostContent, candidateOneHostContent], swipe_id: 1 }]
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: 'swipe-gen-1', generationType: 'regenerate', messageId: 'host-swipe-message' }, 'user-a')
spindle.chat.getMessages = getMessagesBeforeInlineFinalize
const swipeStored = storage.get('phones/chat-a__char-a.json')
const swipeConversation = swipeStored.conversations.find((entry) => entry.id === swipeZeroResult.conversationId)
assert.equal(swipeConversation.messages.find((entry) => entry.id === swipeZeroResult.messageId).origin.swipeId, 0)
assert.equal(swipeConversation.messages.find((entry) => entry.id === swipeOneResult.messageId).origin.swipeId, 1)
assert.equal(swipeConversation.messages.filter((entry) => entry.text === 'Candidate zero.').length, 2, 'identical text on two different swipe candidates must persist once per candidate')
const projectedSwipeOne = frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).state.conversations.find((entry) => entry.id === swipeZeroResult.conversationId)
assert.equal(projectedSwipeOne.messages.some((entry) => entry.id === swipeZeroResult.messageId), false)
assert.equal(projectedSwipeOne.messages.some((entry) => entry.id === swipeOneResult.messageId), true)
await backendEvents.get('MESSAGE_SWIPED')({ chatId: 'chat-a', action: 'navigated', swipeId: 0, message: { id: 'host-swipe-message', swipe_id: 0 } }, 'user-a')
const projectedSwipeZero = frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).state.conversations.find((entry) => entry.id === swipeZeroResult.conversationId)
assert.equal(projectedSwipeZero.messages.some((entry) => entry.id === swipeZeroResult.messageId), true)
assert.equal(projectedSwipeZero.messages.some((entry) => entry.id === swipeOneResult.messageId), false)
const statesBeforeNoopSwipe = frontendMessages.filter((message) => message.type === 'lumiphone:state').length
await backendEvents.get('MESSAGE_SWIPED')({ chatId: 'chat-a', action: 'navigated', swipeId: 0, message: { id: 'host-swipe-message', swipe_id: 0 } }, 'user-a')
assert.equal(frontendMessages.filter((message) => message.type === 'lumiphone:state').length, statesBeforeNoopSwipe + 1, 'host swipe navigation must republish projection even when the selected swipe id is unchanged')
await backendEvents.get('MESSAGE_SWIPED')({ chatId: 'chat-a', action: 'deleted', swipeId: 0, message: { id: 'host-swipe-message', swipe_id: 0 } }, 'user-a')
const reindexedSwipeState = storage.get('phones/chat-a__char-a.json')
const reindexedSwipeConversation = reindexedSwipeState.conversations.find((entry) => entry.id === swipeZeroResult.conversationId)
assert.equal(reindexedSwipeConversation.messages.some((entry) => entry.id === swipeZeroResult.messageId), false, "deleting a host swipe must remove that candidate's Pocket side effects")
assert.equal(reindexedSwipeConversation.messages.find((entry) => entry.id === swipeOneResult.messageId).origin.swipeId, 0, 'host swipe deletion must reindex later Pocket candidate origins')
const projectedAfterHostDelete = frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).state.conversations.find((entry) => entry.id === swipeZeroResult.conversationId)
assert.equal(projectedAfterHostDelete.messages.some((entry) => entry.id === swipeOneResult.messageId), true, 'the surviving host candidate must become active after swipe deletion')
await frontendHandler({ type: 'lumiphone:delete', requestId: 'delete-single-pocket-message', chatId: 'chat-a', characterId: 'char-a', kind: 'message', conversationId: swipeZeroResult.conversationId, id: swipeOneResult.messageId }, 'user-a')
const afterPocketMessageDelete = storage.get('phones/chat-a__char-a.json')
assert.equal(afterPocketMessageDelete.conversations.find((entry) => entry.id === swipeZeroResult.conversationId).messages.some((entry) => entry.id === swipeOneResult.messageId), false)
assert.equal(afterPocketMessageDelete.notifications.some((entry) => entry.route?.app === 'messages' && entry.route.messageId === swipeOneResult.messageId), false)
assert.equal(afterPocketMessageDelete.activities.some((entry) => entry.route?.app === 'messages' && entry.route.messageId === swipeOneResult.messageId), false)


// Tool calls made during exploratory reasoning are provisional and disappear unless final content commits them.
const ghostMessagesBefore = spindle.chat.getMessages
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'ghost-state', chatId: 'chat-ghost', characterId: 'char-a' }, 'user-a')
const ghostState = storage.get('phones/chat-ghost__char-a.json')
ghostState.pocketPersona.displayName = 'Kai'
storage.set('phones/chat-ghost__char-a.json', ghostState)
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-ghost', characterId: 'char-a', generationId: 'ghost-gen', generationType: 'regenerate', targetMessageId: 'ghost-host', targetSwipeId: 0 }, 'user-a')
const ghostTool = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'ghost-tool', args: { action: 'message', chat_id: 'chat-ghost', character_id: 'char-a', payload: { channel: 'dm', speaker: 'Kai', target: 'Tyler', text: 'Reasoning-only ghost.' } },
}, 'user-a'))
assert.equal(ghostTool.ok, true)
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'ghost-mid-generation-state', chatId: 'chat-ghost', characterId: 'char-a' }, 'user-a')
const ghostProjectedMidGeneration = frontendMessages.filter((message) => message.type === 'lumiphone:state').at(-1).state
assert.equal(ghostProjectedMidGeneration.conversations.flatMap((entry) => entry.messages).some((entry) => entry.text === 'Reasoning-only ghost.'), false, 'provisional reasoning tool calls must stay hidden from Pocket projection before candidate commit')
spindle.chat.getMessages = async () => [{ id: 'ghost-host', role: 'assistant', content: 'Kai considered texting Tyler, then decided against it.', swipes: ['Kai considered texting Tyler, then decided against it.'], swipe_id: 0 }]
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-ghost', generationId: 'ghost-gen', generationType: 'regenerate', messageId: 'ghost-host' }, 'user-a')
assert.equal(storage.get('phones/chat-ghost__char-a.json').conversations.flatMap((entry) => entry.messages).some((entry) => entry.text === 'Reasoning-only ghost.'), false, 'uncommitted reasoning tool calls must not survive the final candidate')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:candidate_activity_discard' && message.activityIds?.includes(ghostTool.activityId)), 'discarded reasoning tool calls must revoke transient inline preview metadata')
spindle.chat.getMessages = ghostMessagesBefore

// Deleting a host assistant message removes every Pocket side effect owned by that turn.
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'host-delete-state', chatId: 'chat-host-delete', characterId: 'char-a' }, 'user-a')
const hostDeleteState = storage.get('phones/chat-host-delete__char-a.json')
hostDeleteState.pocketPersona.displayName = 'Kai'
storage.set('phones/chat-host-delete__char-a.json', hostDeleteState)
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-host-delete', characterId: 'char-a', generationId: 'host-delete-gen', generationType: 'regenerate', targetMessageId: 'host-delete-message', targetSwipeId: 0 }, 'user-a')
const hostDeleteTool = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'host-delete-tool', args: { action: 'message', chat_id: 'chat-host-delete', character_id: 'char-a', payload: { channel: 'dm', speaker: 'Kai', target: 'Tyler', text: 'Delete me with the RP turn.' } },
}, 'user-a'))
spindle.chat.getMessages = async () => [{ id: 'host-delete-message', role: 'assistant', content: hostDeleteTool.commitTag, swipes: [hostDeleteTool.commitTag], swipe_id: 0 }]
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-host-delete', generationId: 'host-delete-gen', generationType: 'regenerate', messageId: 'host-delete-message' }, 'user-a')
assert.equal(storage.get('phones/chat-host-delete__char-a.json').conversations.flatMap((entry) => entry.messages).some((entry) => entry.id === hostDeleteTool.messageId), true)
await backendEvents.get('MESSAGE_DELETED')({ chatId: 'chat-host-delete', messageId: 'host-delete-message' }, 'user-a')
const afterHostMessageDelete = storage.get('phones/chat-host-delete__char-a.json')
assert.equal(afterHostMessageDelete.conversations.flatMap((entry) => entry.messages).some((entry) => entry.id === hostDeleteTool.messageId), false, 'host message deletion must remove candidate-owned Pocket messages')
assert.equal(afterHostMessageDelete.activities.some((entry) => entry.source?.messageId === 'host-delete-message'), false, 'host message deletion must remove candidate-owned activities')
assert.equal((afterHostMessageDelete.hostClockBaselines || []).some((entry) => entry.hostMessageId === 'host-delete-message'), false, 'host message deletion must remove the turn clock baseline')
spindle.chat.getMessages = ghostMessagesBefore

const groupCreateTool = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'lazy-group-create', args: {
    action: 'conversation', chat_id: 'chat-a', character_id: 'char-a',
    payload: { kind: 'group', title: 'Agency Staff', participants: [{ name: 'Maya', relationship: 'close' }, 'Jun'] },
  },
}, 'user-a')
assert.equal(JSON.parse(groupCreateTool).ok, true)
lazyState = storage.get('phones/chat-a__char-a.json')
const agencyGroup = lazyState.conversations.find((conversation) => conversation.title === 'Agency Staff')
const junActor = lazyState.discoveredActors.find((actor) => actor.displayName === 'Jun')
assert.deepEqual(new Set(agencyGroup.participantActorIds), new Set([mayaActor.id, junActor.id]))
assert.equal(lazyState.discoveredActors.find((actor) => actor.id === mayaActor.id).relationship, 'close')
const groupMessageTool = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'lazy-group-message', args: {
    action: 'message', chat_id: 'chat-a', character_id: 'char-a',
    payload: { channel: 'gc', conversation: 'Agency Staff', speaker: 'Jun', text: 'conference room changed to three, btw' },
  },
}, 'user-a')
assert.equal(JSON.parse(groupMessageTool).ok, true)
const rejectedOutsider = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'lazy-group-outsider', args: {
    action: 'message', chat_id: 'chat-a', character_id: 'char-a',
    payload: { channel: 'gc', conversation: 'Agency Staff', speaker: 'Random Receptionist', text: 'I have opinions.' },
  },
}, 'user-a')
assert.match(rejectedOutsider, /not a participant/i)
assert.equal(storage.get('phones/chat-a__char-a.json').discoveredActors.some((actor) => actor.displayName === 'Random Receptionist'), false, 'rejected GC speech must not mutate membership or actor state')
const mayaContactCount = storage.get('phones/chat-a__char-a.json').contacts.length
await frontendHandler({ type: 'lumiphone:promote_discovered_actor', requestId: 'promote-maya', chatId: 'chat-a', characterId: 'char-a', actorId: mayaActor.id }, 'user-a')
lazyState = storage.get('phones/chat-a__char-a.json')
const promotedMaya = lazyState.contacts.find((contact) => contact.source?.kind === 'npc' && contact.source.discoveredActorId === mayaActor.id)
assert.ok(promotedMaya, 'tapping a discovered actor must materialize one minimal Contact')
assert.equal(lazyState.contacts.length, mayaContactCount + 1)
assert.equal(lazyState.conversations.find((conversation) => conversation.id === mayaDm.id).messages[0].senderActorId, mayaActor.id, 'promotion must not rewrite historical message identity')
assert.equal(lazyState.discoveredActors.find((actor) => actor.id === mayaActor.id).promotedContactId, promotedMaya.id)

const readState = storage.get('phones/chat-a__char-a.json')
const now = new Date().toISOString()
readState.contacts.push({
  id: 'bob-contact', name: 'Bob', role: 'Scout', description: 'A careful scout.', avatarUrl: '', accent: '#55bfa3',
  source: { kind: 'character', characterId: 'char-b' }, presence: { inScene: false, lastSceneAt: '' }, contextPolicy: { pinned: false }, createdAt: now, updatedAt: now,
})
readState.conversations = [
  { id: 'dm-alice', kind: 'direct', title: 'Alice', participantContactIds: ['char-a'], unread: 1, createdAt: now, updatedAt: now, messages: [{ id: 'm-a', sender: 'contact', senderContactId: 'char-a', senderName: 'Alice', senderAccent: '#8b7dff', text: 'A', createdAt: now, read: false, status: 'delivered' }] },
  { id: 'dm-bob', kind: 'direct', title: 'Bob', participantContactIds: ['bob-contact'], unread: 1, createdAt: now, updatedAt: now, messages: [{ id: 'm-b', sender: 'contact', senderContactId: 'bob-contact', senderName: 'Bob', senderAccent: '#55bfa3', text: 'B', createdAt: now, read: false, status: 'delivered' }] },
]
readState.notifications.push({ id: 'weather-unread', app: 'weather', title: 'Rain', body: '', createdAt: new Date().toISOString(), read: false, route: { app: 'weather' } })
storage.set('phones/chat-a__char-a.json', readState)
await frontendHandler({ type: 'lumiphone:mark_read', requestId: 'read-weather', chatId: 'chat-a', characterId: 'char-a', app: 'weather' }, 'user-a')
assert.deepEqual(storage.get('phones/chat-a__char-a.json').conversations.map((conversation) => conversation.unread), [1, 1])
await frontendHandler({ type: 'lumiphone:mark_read', requestId: 'read-messages-root', chatId: 'chat-a', characterId: 'char-a', app: 'messages' }, 'user-a')
assert.deepEqual(storage.get('phones/chat-a__char-a.json').conversations.map((conversation) => conversation.unread), [1, 1])
await frontendHandler({ type: 'lumiphone:mark_read', requestId: 'read-one', chatId: 'chat-a', characterId: 'char-a', app: 'messages', contactId: 'char-a' }, 'user-a')
assert.deepEqual(storage.get('phones/chat-a__char-a.json').conversations.map((conversation) => conversation.unread), [0, 1])

await frontendHandler({
  type: 'lumiphone:action', requestId: 'private-tracker-create', chatId: 'chat-a', characterId: 'char-a', action: 'tracker',
  payload: { id: 'private-tracker', key: 'private_meter', label: 'Private Meter', kind: 'meter', value: 5, min: 0, max: 100, updateMode: 'model', allowModelWrite: false },
}, 'user-a')
const deniedTrackerTool = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'private-tracker-tool', args: { action: 'tracker', chat_id: 'chat-a', character_id: 'char-a', payload: { trackerId: 'private-tracker', operation: 'add', amount: 5 } },
}, 'user-a')
assert.match(deniedTrackerTool, /does not allow model updates/)
await frontendHandler({
  type: 'lumiphone:action', requestId: 'private-tracker-user', chatId: 'chat-a', characterId: 'char-a', action: 'tracker',
  payload: { trackerId: 'private-tracker', operation: 'add', amount: 5 },
}, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find((tracker) => tracker.id === 'private-tracker').value, 10)

await frontendHandler({
  type: 'lumiphone:action', requestId: 'writable-tracker-create', chatId: 'chat-a', characterId: 'char-a', action: 'tracker',
  payload: { id: 'writable-tracker', key: 'writable_meter', label: 'Writable Meter', kind: 'meter', value: 1, min: 0, max: 100, updateMode: 'model', allowModelWrite: true },
}, 'user-a')
const allowedTrackerTool = await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'writable-tracker-tool', args: { action: 'tracker', chat_id: 'chat-a', character_id: 'char-a', payload: { key: 'writable_meter', operation: 'add', amount: 4, reason: 'story change' } },
}, 'user-a')
assert.equal(JSON.parse(allowedTrackerTool).ok, true)
const writableTracker = storage.get('phones/chat-a__char-a.json').trackers.find((tracker) => tracker.id === 'writable-tracker')
assert.equal(writableTracker.value, 5)
assert.equal(writableTracker.history.at(-1).source, 'model')
await frontendHandler({ type: 'lumiphone:action', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { command: 'configure', trackerId: 'writable-tracker', modelPrompt: 'Subtract one when a supply is used.' } }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === 'writable-tracker').modelPrompt, 'Subtract one when a supply is used.', 'Tracker configuration persists its prompt')
const guidanceIntercept = await interceptorHandler([{ role: 'user', content: 'Continue.' }], { chatId: 'chat-a', characterId: 'char-a', userId: 'user-a' })
const guidanceText = guidanceIntercept.messages.map(message => message.content).join('\n')
assert.match(guidanceText, /Subtract one when a supply is used./, 'Shared generation context includes custom tracker guidance')
assert.match(guidanceText, /<lumi-phone>/, 'The same context retains normal tag fallback instructions')

const templateConfig = {
  command: 'create', key: 'health', label: 'Health', kind: 'meter', presentation: 'vitals',
  value: 100, initialValue: 100, min: 0, max: 100, ratePerHour: 0, updateMode: 'manual', allowModelWrite: false,
  target: { type: 'character', id: 'char-a', label: 'Alice' }, bands: [],
}
for (const requestId of ['health-first', 'health-second']) await frontendHandler({
  type: 'lumiphone:action', requestId, chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { ...templateConfig },
}, 'user-a')
const healthTrackers = storage.get('phones/chat-a__char-a.json').trackers.filter(entry => entry.label === 'Health')
assert.equal(healthTrackers.length, 2, 'template creation must not overwrite another target with the same key')
assert.notEqual(healthTrackers[0].key, healthTrackers[1].key)
const missingTrackerCount = storage.get('phones/chat-a__char-a.json').trackers.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'missing-tracker-operation', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { command: 'update', trackerId: 'gone', operation: 'add', amount: 1 } }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.length, missingTrackerCount, 'missing operation targets must not create placeholders')
const trackerCountBeforeClear = storage.get('phones/chat-a__char-a.json').trackers.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'clock-create', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { ...templateConfig, trackerId: 'clock-contract', key: 'journey-clock', label: 'Journey clock', kind: 'timer', direction: 'down', presentation: 'timer', updateMode: 'automatic', ratePerHour: -1, clock: 'real', value: 60, unit: 'min' } }, 'user-a')
await frontendHandler({ type: 'lumiphone:action', requestId: 'clock-pause', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { command: 'clock', trackerId: 'clock-contract', clockAction: 'pause' } }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === 'clock-contract').clockPaused, true)
assert.ok(frontendMessages.some(entry => entry.type === 'lumiphone:action_done' && entry.requestId === 'clock-pause'))
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'clock-reload', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.equal(frontendMessages.filter(entry => entry.type === 'lumiphone:state').at(-1).state.trackers.find(entry => entry.id === 'clock-contract').clockPaused, true)
const modelClockResult = await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', requestId: 'clock-model', args: { action: 'tracker', chat_id: 'chat-a', character_id: 'char-a', payload: { command: 'clock', trackerId: 'clock-contract', clockAction: 'resume' } } }, 'user-a')
assert.match(modelClockResult, /does not allow model updates/, 'model tools must not resume a user-paused clock')
await frontendHandler({ type: 'lumiphone:action', requestId: 'clock-resume', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { command: 'clock', trackerId: 'clock-contract', clockAction: 'resume' } }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === 'clock-contract').clockPaused, false)
await frontendHandler({ type: 'lumiphone:notifications_clear', requestId: 'clear-notifications', chatId: 'chat-a', characterId: 'char-a', mode: 'all' }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.length, trackerCountBeforeClear + 1, 'clear all must not delete trackers')

// Tracker judge updates have their own writer policy and preserve intervening edits.
const jevContractPreferences = structuredClone(storage.get('device/preferences.json'))
await frontendHandler({ type: 'lumiphone:save_preferences', chatId: 'chat-a', characterId: 'char-a', preferences: { ...jevContractPreferences, jev: { provider: 'typesafe', enabled: true, model: 'jev-latest', autoAfterTurn: false } } }, 'user-a')
await frontendHandler({ type: 'lumiphone:action', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { ...templateConfig, command: 'create', label: 'JEV trust', updateMode: 'jev', value: 50, initialValue: 50, jev: { question: 'How much does Alice trust you?', minConfidence: .6, levels: [{ value: 0, label: 'Low' }, { value: 100, label: 'High' }] } } }, 'user-a')
const jevTrackerId = storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.label === 'JEV trust').id
await frontendHandler({ type: 'lumiphone:jev_save_key', chatId: 'chat-a', characterId: 'char-a', apiKey: 'synthetic-test-key' }, 'user-a')
const originalCors = globalThis.spindle.cors
let jevIntervene = null
let jevAnswerProbabilities = [.1, .9]
globalThis.spindle.cors = async (url, options) => {
  assert.equal(url, 'https://api.typesafe.ai/v1/systemone')
  assert.equal(options.headers.Authorization, 'Bearer synthetic-test-key')
  const body = JSON.parse(options.body)
  assert.equal(body.questions.q1.instructions, 'For subject1: How much does Alice trust you?')
  assert.equal(body.model, 'jev-latest')
  if (jevIntervene) await jevIntervene()
  return { status: 200, body: JSON.stringify({ answers: { q1: { type: 'score', legend: { '0': 'Low', '1': 'High' }, probabilities: { '0': jevAnswerProbabilities[0], '1': jevAnswerProbabilities[1] }, score: jevAnswerProbabilities[1], confidence: jevAnswerProbabilities[0] === .5 ? .1 : .8 } } }) }
}
const evaluateJev = () => frontendHandler({ type: 'lumiphone:jev_evaluate', requestId: 'jev-contract', chatId: 'chat-a', characterId: 'char-a', trackerId: jevTrackerId }, 'user-a')
await evaluateJev()
let jevTracker = storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId)
assert.equal(jevTracker.value, 90); assert.equal(jevTracker.history.at(-1).source, 'jev')
const jevHistoryLength = jevTracker.history.length
await evaluateJev()
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId).history.length, jevHistoryLength, 're-evaluation of the same value must not duplicate history')
jevAnswerProbabilities = [.5, .5]
await evaluateJev()
jevTracker = storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId)
assert.equal(jevTracker.value, 90); assert.equal(jevTracker.jevResult.status, 'uncertain')
jevAnswerProbabilities = [.9, .1]
jevIntervene = async () => frontendHandler({ type: 'lumiphone:action', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { trackerId: jevTrackerId, operation: 'set', amount: 33 } }, 'user-a')
await evaluateJev()
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId).value, 33, 'a running JEV request must not overwrite manual edits')
// LLM judging follows the selected connection/model and never calls the native API.
const originalJudgeQuiet = globalThis.spindle.generate.quiet
const llmJudgePreferences = { ...storage.get('device/preferences.json'), generationMode: 'sidecar', sidecarConnectionId: 'pocket-sidecar', sidecarModelOverride: 'nano', jev: { provider: 'llm', enabled: true, model: 'jev-latest', autoAfterTurn: false } }
await frontendHandler({ type: 'lumiphone:save_preferences', chatId: 'chat-a', characterId: 'char-a', preferences: llmJudgePreferences }, 'user-a')
globalThis.spindle.cors = async () => { throw new Error('LLM judging must not call TypeSafe') }
let judgeConnectionIntervene = false
globalThis.spindle.generate.quiet = async request => {
  assert.equal(request.connection_id, 'pocket-sidecar')
  assert.equal(request.parameters.model, 'nano')
  assert.ok(request.messages[1].content.includes('How much does Alice trust you?'))
  if (judgeConnectionIntervene) await frontendHandler({ type: 'lumiphone:save_preferences', chatId: 'chat-a', characterId: 'char-a', preferences: { ...storage.get('device/preferences.json'), sidecarModelOverride: 'another-model' } }, 'user-a')
  return { content: JSON.stringify({ answers: { q1: { type: 'score', legend: { '0': 'Low', '1': 'High' }, probabilities: { '0': .3, '1': .7 }, score: .7, confidence: .8 } } }) }
}
await evaluateJev()
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId).value, 70)
assert.ok(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId).history.at(-1).reason.includes('LLM judge'))
assert.equal(storage.get('device/preferences.json').generationHistory.at(-1).task, 'tracker-judge')
await frontendHandler({ type: 'lumiphone:action', chatId: 'chat-a', characterId: 'char-a', action: 'tracker', payload: { trackerId: jevTrackerId, operation: 'set', amount: 42 } }, 'user-a')
judgeConnectionIntervene = true
await evaluateJev()
assert.equal(storage.get('phones/chat-a__char-a.json').trackers.find(entry => entry.id === jevTrackerId).value, 42, 'changed connection settings must discard in-flight judge results')
globalThis.spindle.generate.quiet = originalJudgeQuiet
await frontendHandler({ type: 'lumiphone:export_data', requestId: 'judge-export', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
const judgeExport = frontendMessages.findLast(message => message.type === 'lumiphone:export_data' && message.requestId === 'judge-export')
assert.ok(judgeExport)
assert.ok(!JSON.stringify(judgeExport).includes('synthetic-test-key'), 'credentials must be excluded from exports')
assert.ok(!JSON.stringify(frontendMessages).includes('synthetic-test-key'), 'saved credentials must never return to the frontend')
await frontendHandler({ type: 'lumiphone:jev_save_key', chatId: 'chat-a', characterId: 'char-a', apiKey: '' }, 'user-a')
assert.equal(storage.get('private/typesafe-jev.json').apiKey, '', 'removing the key must clear the stored credential')
globalThis.spindle.cors = originalCors
await frontendHandler({ type: 'lumiphone:save_preferences', chatId: 'chat-a', characterId: 'char-a', preferences: jevContractPreferences }, 'user-a')

await frontendHandler({
  type: 'lumiphone:model_action', requestId: 'tag-action', chatId: 'chat-a', characterId: 'char-a', messageId: 'host-message-a',
  attrs: { action: 'note', title: 'Tag journal' }, content: 'Accepted from a hidden tag', fullMatch: '<lumi-phone action="note">Accepted from a hidden tag</lumi-phone>',
  idempotencyKey: 'tag:host-message-a:note',
}, 'user-a')
const tagActivity = storage.get('phones/chat-a__char-a.json').activities.find((activity) => activity.title === 'Journal updated' && activity.source?.messageId === 'host-message-a')
assert.ok(tagActivity, 'accepted tag did not create a source-scoped activity')

// No-tool models may emit the documented <lumi-phone> fallback. The backend
// compiler must persist it with candidate provenance and replace the raw tag
// with the same durable inline anchor used by tool-calling models.
const legacyFallbackText = 'Confirmed for 9:00 tomorrow. Call me before you leave.'
const legacyFallbackTag = `<lumi-phone action="message">{"channel":"dm","speaker":"Hoshino","target":"Shoto Todoroki","text":"${legacyFallbackText}"}</lumi-phone>`
const legacyFallbackContent = `The phone lit up.

${legacyFallbackTag}

He read it twice.`
const messagesBeforeLegacyFallback = spindle.chat.getMessages
spindle.chat.getMessages = async () => [{ id: 'legacy-fallback-host', role: 'assistant', content: legacyFallbackContent, swipes: [legacyFallbackContent], swipe_id: 0 }]
const legacyUpdatesBefore = updatedChatMessages.length
await backendEvents.get('GENERATION_ENDED')({
  chatId: 'chat-legacy-fallback', generationId: 'legacy-fallback-gen', generationType: 'regenerate', messageId: 'legacy-fallback-host',
}, 'user-a')
const legacyFallbackState = storage.get('phones/chat-legacy-fallback__char-a.json')
const legacyFallbackMessage = legacyFallbackState.conversations.flatMap((conversation) => conversation.messages).find((message) => message.text === legacyFallbackText)
assert.ok(legacyFallbackMessage, 'backend fallback compiler did not persist the legacy message action')
assert.equal(legacyFallbackMessage.candidateCommitState, 'committed', 'fallback message must commit immediately because the final candidate itself carried the action tag')
assert.equal(legacyFallbackMessage.origin.hostMessageId, 'legacy-fallback-host')
assert.equal(legacyFallbackMessage.origin.swipeId, 0)
const legacyFallbackActivity = legacyFallbackState.activities.find((activity) => activity.route?.app === 'messages' && activity.route.messageId === legacyFallbackMessage.id)
assert.ok(legacyFallbackActivity, 'fallback message did not create its canonical Pocket activity')
const legacyFallbackUpdate = updatedChatMessages.slice(legacyUpdatesBefore).find((entry) => entry.messageId === 'legacy-fallback-host')
assert.ok(legacyFallbackUpdate, 'fallback compiler did not rewrite the committed host candidate')
assert.match(JSON.stringify(legacyFallbackUpdate.patch), new RegExp(`data-pocket-inline-anchor=.{0,80}${legacyFallbackActivity.id}`), 'fallback message tag was not compiled into the durable inline anchor')
assert.doesNotMatch(JSON.stringify(legacyFallbackUpdate.patch), /<lumi-phone\b/i, 'compiled host candidate must not retain raw fallback action markup')
spindle.chat.getMessages = messagesBeforeLegacyFallback

// A no-tool model must be able to let a busy GC actually be busy. One fallback
// batch creates/ensures the group, materializes named participants, persists
// every message individually, and compiles to one coherent inline artifact.
const legacyBatchRows = [
  { speaker: 'Mina Ashido', text: 'YOU COUNTED THE SECONDS????', format: 'voice' },
  { speaker: 'Denki Kaminari', text: 'BROOOOOOOOO' },
  { speaker: 'Eijiro Kirishima', text: 'WAIT LET HIM EXPLAIN' },
  { speaker: 'Izuku Midoriya', text: 'Technically the timestamps do support—' },
  { speaker: 'Shoto Todoroki', text: 'I am not participating in this analysis.' },
  { speaker: 'Yuga Aoyama', text: 'romance' },
  { speaker: 'Momo Yaoyorozu', text: 'Please stop yelling in the class chat.' },
]
const legacyBatchTag = `<lumi-phone action="message_batch">${JSON.stringify({
  channel: 'gc', conversation: 'Class 3-A',
  participants: ['Mina Ashido', 'Denki Kaminari', 'Eijiro Kirishima', 'Izuku Midoriya', 'Shōto Todoroki', 'Yuga Aoyama', 'Momo Yaoyorozu'],
  messages: legacyBatchRows,
})}</lumi-phone>`
const legacyBatchContent = `They opened the class chat together.

${legacyBatchTag}

It was, predictably, a disaster.`
spindle.chat.getMessages = async () => [{ id: 'legacy-batch-host', role: 'assistant', content: legacyBatchContent, swipes: [legacyBatchContent], swipe_id: 0 }]
const legacyBatchUpdatesBefore = updatedChatMessages.length
await backendEvents.get('GENERATION_ENDED')({
  chatId: 'chat-legacy-batch', generationId: 'legacy-batch-gen', generationType: 'regenerate', messageId: 'legacy-batch-host',
}, 'user-a')
const legacyBatchState = storage.get('phones/chat-legacy-batch__char-a.json')
const classChat = legacyBatchState.conversations.find((conversation) => conversation.kind === 'group' && conversation.title === 'Class 3-A')
assert.ok(classChat, 'message_batch must implicitly ensure a missing named group when participants are supplied')
assert.equal(classChat.messages.length, legacyBatchRows.length, 'message_batch must persist every authored GC message instead of summarizing the riot')
assert.deepEqual(classChat.messages.map((message) => message.text), legacyBatchRows.map((row) => row.text))
assert.equal(classChat.messages[0].format, 'voice', 'fallback batches must retain the voice-message format')
assert.ok(classChat.messages.every((message) => message.origin?.hostMessageId === 'legacy-batch-host' && message.origin?.swipeId === 0), 'batched messages must retain host-candidate provenance')
const shotoActors = legacyBatchState.discoveredActors.filter((actor) => actor.normalizedName === 'shoto todoroki')
assert.equal(shotoActors.length, 1, 'diacritic variants Shoto/Shōto must resolve to one lightweight actor identity')
const legacyBatchActivity = legacyBatchState.activities.find((activity) => activity.presentation?.kind === 'batch' && activity.presentation?.conversationTitle === 'Class 3-A')
assert.ok(legacyBatchActivity, 'message_batch must create one coherent batch activity')
assert.equal(legacyBatchActivity.presentation.batchMessages.length, legacyBatchRows.length)
assert.equal(legacyBatchActivity.presentation.batchMessages[0].format, 'voice', 'inline batch presentation must retain voice format')
assert.equal(legacyBatchActivity.source.messageIds.length, legacyBatchRows.length)
const legacyBatchUpdate = updatedChatMessages.slice(legacyBatchUpdatesBefore).find((entry) => entry.messageId === 'legacy-batch-host')
assert.ok(legacyBatchUpdate, 'message_batch fallback compiler did not rewrite the host candidate')
assert.match(JSON.stringify(legacyBatchUpdate.patch), new RegExp(`data-pocket-inline-anchor=.{0,80}${legacyBatchActivity.id}`), 'message_batch must compile to one durable inline anchor')
assert.doesNotMatch(JSON.stringify(legacyBatchUpdate.patch), /<lumi-phone\b/i, 'compiled batch candidate must not retain raw fallback markup')
spindle.chat.getMessages = messagesBeforeLegacyFallback

await frontendHandler({ type: 'lumiphone:list_contact_sources', requestId: 'sources', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
const sourceResult = frontendMessages.find((message) => message.type === 'lumiphone:contact_sources' && message.requestId === 'sources')
assert.ok(sourceResult.sources.some((source) => source.kind === 'character' && source.sourceId === 'char-b'))
assert.ok(sourceResult.sources.some((source) => source.kind === 'council' && source.sourceId === 'member-luna'))
await frontendHandler({ type: 'lumiphone:import_contact', requestId: 'import-bob', chatId: 'chat-a', characterId: 'char-a', kind: 'character', sourceId: 'char-b' }, 'user-a')
let bobState = storage.get('phones/chat-a__char-a.json')
const bob = bobState.contacts.find((contact) => contact.source.kind === 'character' && contact.source.characterId === 'char-b')
const bobDirect = bobState.conversations.find((conversation) => conversation.kind === 'direct' && conversation.participantContactIds[0] === bob.id)
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'reply-bob', chatId: 'chat-a', characterId: 'char-a', conversationId: bobDirect.id }, 'user-a')
bobState = storage.get('phones/chat-a__char-a.json')
const generatedBob = bobState.conversations.find((conversation) => conversation.id === bobDirect.id).messages.at(-1)
assert.equal(generatedBob.generation.info.source, 'character:char-b', 'non-active Character contacts must resolve their own source card')
assert.equal(generatedBob.generation.info.activeCharacterUsed, false, 'non-active Character generation must not fall back to the active card')
await frontendHandler({ type: 'lumiphone:import_contact', requestId: 'import-luna', chatId: 'chat-a', characterId: 'char-a', kind: 'council', sourceId: 'member-luna', itemId: 'item-luna' }, 'user-a')
let contactState = storage.get('phones/chat-a__char-a.json')
const luna = contactState.contacts.find((contact) => contact.source.kind === 'council')
assert.ok(luna, 'Council source was not imported')
const lunaDirect = contactState.conversations.find((conversation) => conversation.kind === 'direct' && conversation.participantContactIds[0] === luna.id)
const quietBeforeCouncil = quietRequests.length
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'reply-luna', chatId: 'chat-a', characterId: 'char-a', conversationId: lunaDirect.id }, 'user-a')
const councilGenerationRequests = quietRequests.slice(quietBeforeCouncil)
assert.equal(councilGenerationRequests.length, 2, 'Council DM generation must perform one continuity refresh and one phone reply generation')
assert.ok(
  councilGenerationRequests.some((request) =>
    String(request?.messages?.find((message) => message?.role === 'system')?.content || '').includes('Extract a small structured RP WORLD STATE delta')
  ),
  'Council DM generation must include the bounded continuity-seed refresh',
)
assert.ok(
  councilGenerationRequests.some((request) =>
    String(request?.messages?.find((message) => message?.role === 'system')?.content || '').includes('You are Luna writing a private phone DM')
  ),
  'Council DM generation must include Luna\'s direct-message generation request',
)
contactState = storage.get('phones/chat-a__char-a.json')
assert.equal(contactState.conversations.find((conversation) => conversation.id === lunaDirect.id).messages.at(-1).senderContactId, luna.id)
const generatedLuna = contactState.conversations.find((conversation) => conversation.id === lunaDirect.id).messages.at(-1)
assert.equal(generatedLuna.generation.requestId, 'reply-luna')
assert.equal(generatedLuna.generation.info.source, 'council:member-luna')
const retryQuiet = spindle.generate.quiet
spindle.generate.quiet = async (request) => { quietRequests.push(request); return { content: 'A different lunar answer.' } }
await frontendHandler({ type: 'lumiphone:retry_message', requestId: 'retry-luna', chatId: 'chat-a', characterId: 'char-a', conversationId: lunaDirect.id, messageId: generatedLuna.id }, 'user-a')
contactState = storage.get('phones/chat-a__char-a.json')
const retriedLunaThread = contactState.conversations.find((conversation) => conversation.id === lunaDirect.id)
assert.equal(retriedLunaThread.messages.length, 1, 'retry must replace the generated slot in place')
assert.equal(retriedLunaThread.messages[0].text, 'A different lunar answer.')
assert.equal(retriedLunaThread.messages[0].generation.retryOf, generatedLuna.id)
spindle.generate.quiet = retryQuiet

await frontendHandler({ type: 'lumiphone:create_conversation', requestId: 'group-create', chatId: 'chat-a', characterId: 'char-a', title: 'Night Shift', participantContactIds: ['char-a', luna.id] }, 'user-a')
const groupId = frontendMessages.find((message) => message.type === 'lumiphone:conversation_opened' && message.requestId === 'group-create').conversationId
const groupBefore = storage.get('phones/chat-a__char-a.json').conversations.find((conversation) => conversation.id === groupId).messages.length
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'group-reply', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, speakerContactId: luna.id }, 'user-a')
const groupAfter = storage.get('phones/chat-a__char-a.json').conversations.find((conversation) => conversation.id === groupId)
assert.equal(groupAfter.messages.length, groupBefore + 1, 'group generation must append exactly one reply')
assert.equal(groupAfter.messages.at(-1).senderContactId, luna.id)
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'group-invalid-speaker', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, speakerContactId: 'not-a-participant' }, 'user-a')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:error' && message.requestId === 'group-invalid-speaker'))

const groupBatchState = storage.get('phones/chat-a__char-a.json')
for (const contactId of groupBatchState.conversations.find((entry) => entry.id === groupId).participantContactIds) {
  const contact = groupBatchState.contacts.find((entry) => entry.id === contactId)
  contact.presence.inScene = true
  contact.messagingPolicy.remoteEligible = false
}
storage.set('phones/chat-a__char-a.json', groupBatchState)
const groupBatchQuiet = spindle.generate.quiet
let groupBatchCalls = 0
spindle.generate.quiet = async (request) => {
  quietRequests.push(request)
  const systemPrompt = String(request?.messages?.find((message) => message?.role === 'system')?.content || '')
  const isGroupReplyRequest = systemPrompt.includes('Generate the next natural burst in a fictional private group chat')
  if (!isGroupReplyRequest) return { content: 'continuity seed intentionally omitted in this scoped group-generation contract' }
  groupBatchCalls += 1
  return { content: JSON.stringify({ messages: [
    { speakerId: 'char-a', text: 'The first group reaction.', format: 'voice' },
    { speakerId: luna.id, text: 'I am reacting to that first message.' },
    { speakerId: luna.id, text: 'Wait—one more thing.' },
  ] }) }
}
const beforeBatch = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === groupId).messages.length
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'group-auto-batch', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, speakerContactId: 'auto' }, 'user-a')
const groupBatchResult = storage.get('phones/chat-a__char-a.json')
const groupAfterBatch = groupBatchResult.conversations.find((entry) => entry.id === groupId)
assert.equal(groupBatchCalls, 1, 'one Auto trigger must use one structured group generation call')
assert.equal(groupAfterBatch.messages.length, beforeBatch + 3, 'one Auto trigger must reveal the bounded ordered batch')
assert.equal(groupAfterBatch.messages.at(-3).format, 'voice', 'generated group voice messages must survive queue normalization and delivery')
assert.deepEqual(groupAfterBatch.messages.slice(-3).map((entry) => entry.senderContactId), ['char-a', luna.id, luna.id])
assert.equal(groupAfterBatch.messages.at(-1).generation.info.groupBatch.position, 3)
assert.equal(groupAfterBatch.messages.at(-1).generation.info.groupBatch.size, 3)
assert.equal(groupBatchResult.groupBatches.at(-1).status, 'completed')
assert.ok(groupBatchResult.groupBatches.at(-1).messages.every((entry) => entry.state === 'delivered'))
assert.match(quietRequests.at(-1).messages[0].content, /later messages may directly react to earlier generated messages/i)
assert.match(quietRequests.at(-1).messages[1].content, /talkativeness=/)
assert.ok(groupBatchResult.groupBatches.at(-1).eligibleActorIds.length >= 2, 'manual Auto speaker must honor the explicit user override even when participants are in-scene or remote-disabled')
const autonomousGroupState = storage.get('phones/chat-a__char-a.json')
for (const contactId of autonomousGroupState.conversations.find((entry) => entry.id === groupId).participantContactIds) {
  const contact = autonomousGroupState.contacts.find((entry) => entry.id === contactId)
  contact.presence.inScene = false
  contact.messagingPolicy.remoteEligible = true
}
storage.set('phones/chat-a__char-a.json', autonomousGroupState)
await frontendHandler({ type: 'lumiphone:save_preferences', requestId: 'group-auto-on', chatId: 'chat-a', characterId: 'char-a', preferences: { autoReplyAfterSend: true, replyCadence: 'instant' } }, 'user-a')
const callsBeforeAutomaticGroup = groupBatchCalls
const messagesBeforeAutomaticGroup = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === groupId).messages.length
await frontendHandler({ type: 'lumiphone:action', requestId: 'group-user-burst', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: groupId, text: 'What does everyone think?', sender: 'persona' } }, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 60))
const automaticGroup = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === groupId)
assert.equal(groupBatchCalls, callsBeforeAutomaticGroup + 1, 'a settled user group burst must trigger exactly one group-native generation')
assert.equal(automaticGroup.messages.length, messagesBeforeAutomaticGroup + 4, 'the user message and its three generated replies must become canonical in reveal order')
assert.equal(automaticGroup.messages.at(-4).sender, 'persona')
await frontendHandler({ type: 'lumiphone:save_preferences', requestId: 'group-auto-off', chatId: 'chat-a', characterId: 'char-a', preferences: { autoReplyAfterSend: false } }, 'user-a')
spindle.generate.quiet = groupBatchQuiet

const pendingBatchState = storage.get('phones/chat-a__char-a.json')
pendingBatchState.groupBatches.push({
  id: 'batch-stale', requestId: 'batch-stale-request', conversationId: groupId,
  eligibleContactIds: ['char-a', luna.id], status: 'delivering', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  messages: [
    { id: 'slot-delivered', speakerId: 'char-a', text: 'Already visible', state: 'delivered', deliveredMessageId: 'existing-message' },
    { id: 'slot-stale', speakerId: luna.id, text: 'This future reply is stale', state: 'queued' },
  ],
})
storage.set('phones/chat-a__char-a.json', pendingBatchState)
const quietBeforeOverlap = quietRequests.length
await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'group-overlap', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, speakerContactId: 'auto' }, 'user-a')
assert.equal(quietRequests.length, quietBeforeOverlap, 'a persisted active group batch must block an overlapping generation call')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:error' && message.requestId === 'group-overlap'))
await frontendHandler({ type: 'lumiphone:action', requestId: 'interrupt-group-batch', chatId: 'chat-a', characterId: 'char-a', action: 'message', payload: { conversationId: groupId, text: 'A newer user interruption', sender: 'persona' } }, 'user-a')
const cancelledBatch = storage.get('phones/chat-a__char-a.json').groupBatches.find((entry) => entry.id === 'batch-stale')
assert.equal(cancelledBatch.status, 'cancelled', 'a new user message must cancel the undelivered remainder')
assert.equal(cancelledBatch.messages[0].state, 'delivered', 'already delivered batch messages remain canonical')
assert.equal(cancelledBatch.messages[1].state, 'cancelled', 'undelivered generated replies must never enter canonical history')

const referenceEventsBefore = storage.get('phones/chat-a__char-a.json').events.length
await frontendHandler({ type: 'lumiphone:arm_reference', requestId: 'reference-group', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, scope: 'conversation' }, 'user-a')
let referenceState = storage.get('phones/chat-a__char-a.json')
let pocketReference = referenceState.references.at(-1)
assert.equal(pocketReference.status, 'armed')
assert.equal(pocketReference.conversationKind, 'group')
assert.equal(pocketReference.conversationTitle, 'Night Shift')
assert.ok(pocketReference.participants.some((entry) => entry.name === 'Luna'))
assert.ok(pocketReference.messages.length > 0 && pocketReference.messages.length <= 8)
assert.equal(referenceState.events.length, referenceEventsBefore, 'arming a reference must not create a Timeline event')
const regenerationWithReferenceArmed = await interceptorHandler([{ role: 'user', content: 'Regenerate this.' }], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'reference-regen', generationType: 'regenerate', isDryRun: false,
})
assert.doesNotMatch(regenerationWithReferenceArmed.messages.at(-1).content, /POCKET USER REFERENCE/, 'a regeneration must not steal an armed one-shot reference')
assert.equal(storage.get('phones/chat-a__char-a.json').references.at(-1).status, 'armed')
const syntheticNormalPrompt = await interceptorHandler([{ role: 'user', content: 'Synthetic instruction without a stored host turn.' }], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'reference-synthetic', generationType: 'normal', isDryRun: false,
})
assert.doesNotMatch(syntheticNormalPrompt.messages.at(-1).content, /POCKET USER REFERENCE/, 'synthetic user-shaped prompts must not steal an armed reference')
assert.equal(storage.get('phones/chat-a__char-a.json').references.at(-1).status, 'armed')
const normalReferenceIntercept = await interceptorHandler([{
  role: 'user', content: 'Mizi says you are all useless.', __isChatHistory: true, sourceMessageId: 'rp-user-reference',
}], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'reference-generation', generationType: 'normal', isDryRun: false,
})
assert.equal(normalReferenceIntercept.messages.length, 4, 'Pocket snapshot, established handoff history, and explicit reference must remain separate prompt contributions')
assert.deepEqual(
  normalReferenceIntercept.breakdown.map((entry) => entry.name),
  ['Pocket memory', 'Pocket handoff memory — established history', 'Pocket user reference — this turn'],
)
assert.match(normalReferenceIntercept.messages.at(-1).content, /POCKET USER REFERENCE — THIS TURN/)
assert.match(normalReferenceIntercept.messages.at(-1).content, /Conversation: Night Shift/)
assert.match(normalReferenceIntercept.messages.at(-1).content, /Participants: .*Luna/)
assert.match(normalReferenceIntercept.messages.at(-1).content, /does not hand off the conversation, change channel ownership, or establish that any participant is physically present/i)
assert.ok(normalReferenceIntercept.messages.at(-1).content.length <= 2_200, 'reference serialization must respect its total prompt budget')
assert.equal(normalReferenceIntercept.breakdown.at(-1).name, 'Pocket user reference — this turn')
referenceState = storage.get('phones/chat-a__char-a.json')
pocketReference = referenceState.references.at(-1)
assert.equal(pocketReference.status, 'injected')
assert.equal(pocketReference.injectedGenerationId, 'reference-generation')
assert.equal(pocketReference.boundUserMessageId, 'rp-user-reference')
assert.equal(pocketReference.serializedReferenceChars, normalReferenceIntercept.messages.at(-1).content.length)
const overlappingReferenceIntercept = await interceptorHandler([{ role: 'user', content: 'Another message.' }], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'reference-other-generation', generationType: 'normal', isDryRun: false,
})
assert.doesNotMatch(overlappingReferenceIntercept.messages.at(-1).content, /POCKET USER REFERENCE/, 'an injected reference must never double-dip into another generation')
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-a', generationId: 'reference-generation' }, 'user-a')
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: 'reference-generation', messageId: 'rp-answer-reference' }, 'user-a')
pocketReference = storage.get('phones/chat-a__char-a.json').references.at(-1)
assert.equal(pocketReference.status, 'consumed')
assert.equal(pocketReference.consumedMessageId, 'rp-answer-reference')
assert.equal(storage.get('phones/chat-a__char-a.json').events.length, referenceEventsBefore, 'consuming a reference must still not create a Timeline event')
const afterReferenceConsumed = await interceptorHandler([{ role: 'user', content: 'Later turn.' }], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'reference-later', generationType: 'normal', isDryRun: false,
})
assert.doesNotMatch(afterReferenceConsumed.messages.at(-1).content, /POCKET USER REFERENCE/, 'a consumed reference must remain one-shot')

const referenceConversation = storage.get('phones/chat-a__char-a.json').conversations.find((entry) => entry.id === groupId)
const selectedReferenceIds = referenceConversation.messages.slice(-2).map((entry) => entry.id)
await frontendHandler({ type: 'lumiphone:arm_reference', requestId: 'reference-selected', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, scope: 'selected_messages', messageIds: selectedReferenceIds }, 'user-a')
pocketReference = storage.get('phones/chat-a__char-a.json').references.at(-1)
assert.equal(pocketReference.scope, 'selected_messages')
assert.deepEqual(pocketReference.messages.map((entry) => entry.messageId), selectedReferenceIds)
await frontendHandler({ type: 'lumiphone:cancel_reference', requestId: 'reference-cancel', chatId: 'chat-a', characterId: 'char-a', referenceId: pocketReference.id }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').references.at(-1).status, 'cancelled')

await frontendHandler({ type: 'lumiphone:arm_reference', requestId: 'reference-failure', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, scope: 'recent_messages' }, 'user-a')
pocketReference = storage.get('phones/chat-a__char-a.json').references.at(-1)
await interceptorHandler([{ role: 'user', content: 'Use this context.', __isChatHistory: true, sourceMessageId: 'rp-user-failure' }], {
  chatId: 'chat-a', characterId: 'char-a', userId: 'user-a', generationId: 'reference-failure-generation', generationType: 'normal', isDryRun: false,
})
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', generationId: 'reference-failure-generation', error: 'Provider unavailable' }, 'user-a')
pocketReference = storage.get('phones/chat-a__char-a.json').references.at(-1)
assert.equal(pocketReference.status, 'failed', 'failed RP generation must not consume its reference')
assert.match(pocketReference.error, /Provider unavailable/)
await frontendHandler({ type: 'lumiphone:rearm_reference', requestId: 'reference-rearm', chatId: 'chat-a', characterId: 'char-a', referenceId: pocketReference.id }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').references.at(-1).status, 'armed')
await frontendHandler({ type: 'lumiphone:cancel_reference', requestId: 'reference-rearm-cancel', chatId: 'chat-a', characterId: 'char-a', referenceId: pocketReference.id }, 'user-a')

const sceneQuiet = spindle.generate.quiet
spindle.generate.quiet = async () => ({ content: '{"name":"Kestrel","role":"Courier","identityBrief":"An off-scene courier.","talkativeness":72,"fragmentation":61}' })
const contactsBeforeDraft = storage.get('phones/chat-a__char-a.json').contacts.length
await frontendHandler({ type: 'lumiphone:generate_contact', requestId: 'npc-progress', chatId: 'chat-a', characterId: 'char-a', description: 'A courier named Kestrel' }, 'user-a')
const npcPhases = frontendMessages.filter((message) => message.type === 'lumiphone:operation_progress' && message.requestId === 'npc-progress').map((message) => message.phase)
assert.deepEqual(npcPhases, ['generating', 'parsing', 'complete'])
assert.equal(storage.get('phones/chat-a__char-a.json').contacts.length, contactsBeforeDraft, 'generation must not create a Contact before Use')
const kestrelDraft = frontendMessages.find((message) => message.type === 'lumiphone:contact_draft' && message.requestId === 'npc-progress').draft
assert.deepEqual(kestrelDraft.messagingStyle, { talkativeness: 72, fragmentation: 61 })
spindle.generate.quiet = async () => ({ content: '{"name":"Kestrel Two","role":"Scout","identityBrief":"A better draft.","talkativeness":35,"fragmentation":20}' })
await frontendHandler({ type: 'lumiphone:generate_contact', requestId: 'npc-retry', chatId: 'chat-a', characterId: 'char-a', description: 'A courier named Kestrel' }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').contacts.length, contactsBeforeDraft, 'reroll must still not create duplicate Contacts')
const retryDraft = frontendMessages.find((message) => message.type === 'lumiphone:contact_draft' && message.requestId === 'npc-retry').draft
await frontendHandler({ type: 'lumiphone:save_contact', requestId: 'npc-use', chatId: 'chat-a', characterId: 'char-a', contact: {
  ...retryDraft, description: retryDraft.identityBrief,
  source: { kind: 'npc', origin: 'generated', description: retryDraft.identityBrief },
  messagingPolicy: { remoteEligible: true }, messagingStyle: retryDraft.messagingStyle,
} }, 'user-a')
const generatedContacts = storage.get('phones/chat-a__char-a.json').contacts.filter((contact) => contact.name.startsWith('Kestrel'))
assert.equal(generatedContacts.length, 1, 'Use must commit exactly one generated Contact')
assert.equal(generatedContacts[0].name, 'Kestrel Two')
const editableLuna = storage.get('phones/chat-a__char-a.json').contacts.find((contact) => contact.id === luna.id)
await frontendHandler({ type: 'lumiphone:save_contact', requestId: 'save-luna-accent', chatId: 'chat-a', characterId: 'char-a', contact: {
  ...editableLuna, accent: '#12abef', colorMode: 'pocket',
  messagingStyle: { talkativeness: 82, fragmentation: 17 },
} }, 'user-a')
const savedLuna = storage.get('phones/chat-a__char-a.json').contacts.find((contact) => contact.id === luna.id)
assert.equal(savedLuna.accent, '#12abef', 'Contact Save must persist a changed manual accent')
assert.deepEqual(savedLuna.messagingStyle, { talkativeness: 82, fragmentation: 17 })
assert.equal(frontendMessages.findLast((message) => message.type === 'lumiphone:contact_saved' && message.requestId === 'save-luna-accent').contact.accent, '#12abef', 'save acknowledgement must carry the returned Contact')
spindle.generate.quiet = async () => ({ content: '{"contacts":[{"name":"Alice","role":"Primary character"},{"name":"Test Persona","role":"Active persona"},{"name":"Mira","role":"Flower seller","description":"A bright-eyed merchant at the market."}]}' })
await frontendHandler({ type: 'lumiphone:sync_scene_contacts', requestId: 'scene-one', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
let mira = storage.get('phones/chat-a__char-a.json').contacts.find((contact) => contact.name === 'Mira')
assert.equal(mira.presence.inScene, true)
const sceneOneState = storage.get('phones/chat-a__char-a.json')
assert.equal(sceneOneState.contacts.filter((contact) => contact.name === 'Alice').length, 1, 'Scene Sync must not create a Character duplicate')
assert.equal(sceneOneState.contacts.some((contact) => contact.name === 'Test Persona'), false, 'Scene Sync must never turn the active Persona into a Contact')
assert.deepEqual(sceneOneState.sceneSnapshot.actors.map((actor) => actor.contactId), [mira.id])
assert.equal(sceneOneState.sceneSnapshot.sourceMessageId, 'KITCHEN-222')
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-a', messageId: 'NEXT-TURN-333' }, 'user-a')
assert.equal(storage.get('phones/chat-a__char-a.json').sceneSnapshot.stale, true, 'a newly committed RP turn must mark the prior scene snapshot stale')
const overfullSceneContacts = Array.from({ length: 8 }, (_, index) => ({
  name: `Bounded actor ${index + 1}`, role: 'R'.repeat(180), identityBrief: 'I'.repeat(600), sceneNote: 'S'.repeat(400),
}))
spindle.generate.quiet = async () => ({ content: JSON.stringify({ contacts: overfullSceneContacts }) })
await frontendHandler({ type: 'lumiphone:sync_scene_contacts', requestId: 'scene-bounds', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
const boundedActors = storage.get('phones/chat-a__char-a.json').contacts.filter((contact) => contact.name.startsWith('Bounded actor'))
assert.equal(boundedActors.length, 6, 'Scene Sync must commit at most six complete contacts')
assert.ok(boundedActors.every((contact) => contact.role.length <= 120 && contact.identityBrief.length <= 350 && contact.sceneNote.length <= 220))
const sceneMutationSurface = (state) => JSON.stringify({
  contacts: state.contacts,
  sceneSnapshot: state.sceneSnapshot,
  conversations: state.conversations,
})
const beforeInvalidScene = sceneMutationSurface(storage.get('phones/chat-a__char-a.json'))
spindle.generate.quiet = async () => ({ content: '{"wrong":[]}' })
await frontendHandler({ type: 'lumiphone:sync_scene_contacts', requestId: 'scene-invalid', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.equal(sceneMutationSurface(storage.get('phones/chat-a__char-a.json')), beforeInvalidScene, 'invalid Scene Sync output must not partially mutate contact state')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:error' && message.requestId === 'scene-invalid'))
spindle.generate.quiet = async () => ({ content: '{"contacts":[]}' })
await frontendHandler({ type: 'lumiphone:sync_scene_contacts', requestId: 'scene-two', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
mira = storage.get('phones/chat-a__char-a.json').contacts.find((contact) => contact.name === 'Mira')
assert.equal(mira.presence.inScene, false, 'absent scene-derived contacts must be retained and marked away')
spindle.generate.quiet = sceneQuiet

// Regenerated swipe candidates get a narrow post-turn audit: recover plaintexted phone messages and
// reconcile only candidate-local clock state, leaving full world reconciliation to committed normal turns.
const recoveryQuiet = spindle.generate.quiet
const recoveryMessages = spindle.chat.getMessages
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'recovery-state', chatId: 'chat-recovery', characterId: 'char-a' }, 'user-a')
const recoveryStatePath = 'phones/chat-recovery__char-a.json'
const recoveryBefore = storage.get(recoveryStatePath)
recoveryBefore.pocketPersona.displayName = 'Kai'
recoveryBefore.roleplayNow = '2026-09-04T03:39:00.000Z'
recoveryBefore.roleplayClockSource = 'manual'
recoveryBefore.roleplayClockPrecision = 'exact'
recoveryBefore.roleplayClockLabel = '3:39 AM'
recoveryBefore.roleplayTimezoneOffsetMinutes = 0
storage.set(recoveryStatePath, recoveryBefore)
spindle.chat.getMessages = async () => [
  { id: 'recovery-assistant', revision: 1, role: 'assistant', content: 'Kai texted Tyler: “First.” Another text: “Second.” A minute later, he put the phone down.' },
]
spindle.generate.quiet = async (request) => {
  const systemPrompt = String(request?.messages?.find((message) => message?.role === 'system')?.content || '')
  assert.match(systemPrompt, /Audit one committed fictional roleplay assistant turn/)
  return { content: JSON.stringify({
    clock: { date: '', time: '', dayPart: '', precision: 'relative', label: '', advanceMinutes: 1 },
    phoneMessages: [{ channel: 'dm', speaker: 'Kai', target: 'Tyler', conversation: '', text: 'Second.' }],
  }) }
}
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-recovery', characterId: 'char-a', generationId: 'recovery-gen-0', generationType: 'regenerate', targetMessageId: 'recovery-assistant', targetSwipeId: 0 }, 'user-a')
const recoveryFirst = JSON.parse(await backendEvents.get('TOOL_INVOCATION')({
  toolName: 'phone_action', requestId: 'recovery-tool-first', args: {
    action: 'message', chat_id: 'chat-recovery', character_id: 'char-a', payload: { channel: 'dm', speaker: 'Kai', target: 'Tyler', text: 'First.' },
  },
}, 'user-a'))
assert.equal(recoveryFirst.ok, true)
const recoveryUpdatesBefore = updatedChatMessages.length
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-recovery', generationId: 'recovery-gen-0', generationType: 'regenerate', messageId: 'recovery-assistant' }, 'user-a')
const rescuedInlineUpdate = updatedChatMessages.slice(recoveryUpdatesBefore).find((entry) => entry.messageId === 'recovery-assistant' && /data-pocket-inline-anchor=/.test(JSON.stringify(entry.patch || {})))
assert.ok(rescuedInlineUpdate, 'a provisional tool message plaintexted into final prose must be rescued into an inline Pocket anchor')
let recoveryAfter = storage.get(recoveryStatePath)
const recoveredConversation = recoveryAfter.conversations.find((entry) => entry.id === recoveryFirst.conversationId)
assert.equal(recoveredConversation.messages.filter((entry) => entry.text === 'First.').length, 1)
assert.equal(recoveredConversation.messages.filter((entry) => entry.text === 'Second.').length, 1, 'post-turn audit must recover an unpersisted same-turn text')
assert.equal(recoveredConversation.messages.find((entry) => entry.text === 'Second.').origin.swipeId, 0)
assert.equal(recoveryAfter.roleplayNow, '2026-09-04T03:40:00.000Z', 'explicit one-minute scene advancement should advance the candidate clock from its pre-turn anchor')
assert.equal(recoveryAfter.candidateClocks.find((entry) => entry.hostMessageId === 'recovery-assistant' && entry.swipeId === 0).roleplayNow, '2026-09-04T03:40:00.000Z')

// Starting a replacement swipe restores the pre-turn clock before the new candidate is audited.
await backendEvents.get('GENERATION_STARTED')({ chatId: 'chat-recovery', characterId: 'char-a', generationId: 'recovery-gen-1', generationType: 'regenerate', targetMessageId: 'recovery-assistant', targetSwipeId: 1 }, 'user-a')
recoveryAfter = storage.get(recoveryStatePath)
assert.equal(recoveryAfter.roleplayNow, '2026-09-04T03:39:00.000Z')
spindle.chat.getMessages = recoveryMessages
spindle.generate.quiet = recoveryQuiet

// Successful committed normal turns own bounded world-state reconciliation.
// Use an isolated chat so this contract cannot perturb the primary Pocket fixture.
const reconciliationQuiet = spindle.generate.quiet
const reconciliationMessages = spindle.chat.getMessages
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'reconcile-state', chatId: 'chat-reconcile', characterId: 'char-a' }, 'user-a')
const reconciliationStatePath = 'phones/chat-reconcile__char-a.json'
const reconciliationBefore = storage.get(reconciliationStatePath)
reconciliationBefore.contacts.find((contact) => contact.name === 'Alice').presence.inScene = true
reconciliationBefore.roleplayNow = '2026-09-04T21:39:03.137Z'
reconciliationBefore.roleplayClockSource = 'narrative'
reconciliationBefore.roleplayClockPrecision = 'approximate'
reconciliationBefore.roleplayClockLabel = 'stale evening'
reconciliationBefore.trackers.push({
  id: 'reconcile-tracker', key: 'scene_tension', label: 'Scene Tension', kind: 'meter', modelPrompt: 'Increase only when the scene becomes tense.',
  value: 10, initialValue: 10, min: 0, max: 100, updateMode: 'model', allowModelWrite: true, visibleToModel: true,
})
reconciliationBefore.events.push({ id: 'stable-beat', title: 'Press Conference', description: 'Agency conference', completed: false, lane: 'Continuity', createdBy: 'model', start: reconciliationBefore.roleplayNow, end: reconciliationBefore.roleplayNow, color: '#ffffff' })
storage.set(reconciliationStatePath, reconciliationBefore)
spindle.chat.getMessages = async () => [
  { id: 'reconcile-user', revision: 1, role: 'user', content: 'It is around 3–4 AM. Alice is across town, away from me. The clear night is tenser now.' },
  { id: 'reconcile-assistant', revision: 1, role: 'assistant', content: [
    { type: 'reasoning', text: 'Do not leak this tool thought.' },
    { type: 'text', text: 'Alice remains across town while the clear night continues.' },
  ] },
]
spindle.generate.quiet = async (request) => {
  const systemPrompt = String(request?.messages?.find((message) => message?.role === 'system')?.content || '')
  const userPrompt = String(request?.messages?.find((message) => message?.role === 'user')?.content || '')
  assert.match(systemPrompt, /RP WORLD STATE delta/)
  assert.match(systemPrompt, /early_morning\|morning\|late_morning/, 'Clock instructions must enumerate fixed day-part keys')
  assert.match(systemPrompt, /otherwise empty/, 'Approximate clock labels must not invite free-form prose')
  assert.match(userPrompt, /CURRENT POCKET STATE — ADVISORY/)
  assert.match(userPrompt, /RECENT NARRATIVE — AUTHORITATIVE/)
  assert.match(userPrompt, /stable-beat/, 'Automatic reconciliation receives stable event IDs')
  assert.match(userPrompt, /Increase only when the scene becomes tense./, 'Reconciliation receives saved tracker update guidance')
  assert.doesNotMatch(userPrompt, /Do not leak this tool thought/)
  return { content: JSON.stringify({
    world: {
      setting: '',
      clock: { date: '', time: '', dayPart: 'night', precision: 'approximate', label: 'around 3–4 AM' },
      facts: [],
      weather: { condition: 'Clear', location: 'City', details: 'Clear night.' },
    },
    facts: [],
    actors: [{ name: 'Alice', status: 'away', presence: 'away', activity: 'across town', location: 'across town', visibility: 'public', knownBy: [], ttl: 'turn' }],
    timeline: [],
    eventUpdates: [{ id: 'stable-beat', description: 'The conference was resolved in this controlled narrative.', completed: true, evidence: 'Alice remains across town while the clear night continues.' }],
    trackerOps: [{ key: 'scene_tension', operation: 'add', amount: 5, reason: 'The scene grew tenser.' }],
  }) }
}
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-reconcile', generationId: 'gen-reconcile', generationType: 'normal', messageId: 'reconcile-assistant' }, 'user-a')
let reconciliationAfter = storage.get(reconciliationStatePath)
assert.equal(reconciliationAfter.stateRevision, 1)
assert.equal(reconciliationAfter.lastReconciliation.generationId, 'gen-reconcile')
assert.equal(reconciliationAfter.events.find(event => event.id === 'stable-beat').completed, true, 'Existing beats update by ID without a title or scope match')
assert.ok(reconciliationAfter.lastReconciliation.domains.includes('timeline'))
assert.equal(reconciliationAfter.lastReconciliation.messageId, 'reconcile-assistant')
assert.ok(reconciliationAfter.lastReconciliation.domains.includes('clock'))
assert.ok(reconciliationAfter.lastReconciliation.domains.includes('weather'))
assert.ok(reconciliationAfter.lastReconciliation.domains.includes('presence'))
assert.ok(reconciliationAfter.lastReconciliation.domains.includes('trackers'))
assert.equal(reconciliationAfter.contacts.find((contact) => contact.name === 'Alice').presence.inScene, false)
assert.equal(reconciliationAfter.roleplayClockPrecision, 'approximate')
assert.equal(reconciliationAfter.roleplayClockLabel, 'Night')
assert.equal(reconciliationAfter.roleplayNow, '2026-09-04T21:39:03.137Z', 'approximate reconciliation must not manufacture an exact ISO')
assert.equal(reconciliationAfter.weather.details, 'Clear night.')
assert.equal(reconciliationAfter.trackers.find((tracker) => tracker.key === 'scene_tension').value, 15)
assert.equal(reconciliationAfter.trackers.find((tracker) => tracker.key === 'scene_tension').history.at(-1).source, 'model')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:state' && message.reason === 'state_reconciled' && message.state?.chatId === 'chat-reconcile'))

// Replaying the same host source is idempotent: no double tracker delta/revision bump.
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-reconcile', generationId: 'gen-reconcile-repeat', generationType: 'normal', messageId: 'reconcile-assistant' }, 'user-a')
reconciliationAfter = storage.get(reconciliationStatePath)
assert.equal(reconciliationAfter.stateRevision, 1)
assert.equal(reconciliationAfter.trackers.find((tracker) => tracker.key === 'scene_tension').value, 15)
spindle.generate.quiet = reconciliationQuiet
spindle.chat.getMessages = reconciliationMessages

// A manual setup clock is an anchor, not an immortal veto: newer explicit exact narrative time wins.
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'clock-state', chatId: 'chat-clock', characterId: 'char-a' }, 'user-a')
const clockStatePath = 'phones/chat-clock__char-a.json'
const manualClockState = storage.get(clockStatePath)
manualClockState.roleplayNow = '2026-09-04T03:39:00.000Z'
manualClockState.roleplayClockSource = 'manual'
manualClockState.roleplayClockPrecision = 'exact'
manualClockState.roleplayClockLabel = '03:39 AM'
manualClockState.roleplayTimezoneOffsetMinutes = 0
storage.set(clockStatePath, manualClockState)
spindle.chat.getMessages = async () => [
  { id: 'clock-user', revision: 1, role: 'user', content: "It's 6:30 AM now." },
  { id: 'clock-assistant', revision: 1, role: 'assistant', content: 'The room is washed in early morning light.' },
]
spindle.generate.quiet = async () => ({ content: JSON.stringify({
  world: { setting: '', clock: { date: '2026-09-04', time: '06:30', dayPart: 'morning', precision: 'exact', label: '6:30 AM' }, facts: [], weather: null },
  facts: [], actors: [], timeline: [], trackerOps: [],
}) })
await backendEvents.get('GENERATION_ENDED')({ chatId: 'chat-clock', generationId: 'gen-clock', generationType: 'normal', messageId: 'clock-assistant' }, 'user-a')
const exactClockState = storage.get(clockStatePath)
assert.equal(exactClockState.roleplayClockSource, 'narrative')
assert.equal(exactClockState.roleplayClockPrecision, 'exact')
assert.equal(exactClockState.roleplayClockLabel, '6:30 AM')
assert.match(exactClockState.roleplayNow, /T06:30:00\.000Z$/, 'explicit exact narrative time must supersede a stale manual setup clock')
spindle.generate.quiet = reconciliationQuiet
spindle.chat.getMessages = reconciliationMessages

await frontendHandler({
  type: 'lumiphone:test_generation', requestId: 'sidecar-test', chatId: 'chat-a', characterId: 'char-a',
  generationMode: 'sidecar', sidecarConnectionId: 'pocket-sidecar', sidecarModelOverride: 'discovered-model',
}, 'user-a')
assert.equal(quietRequests.at(-1).connection_id, 'pocket-sidecar', 'sidecar test must use the selected connection')
assert.equal(quietRequests.at(-1).parameters.model, 'discovered-model', 'sidecar test must pass the model override through parameters.model')
const sidecarRun = storage.get('device/preferences.json').generationHistory.find((entry) => entry.requestId === 'sidecar-test')
assert.deepEqual({ connectionId: sidecarRun.connectionId, model: sidecarRun.model, status: sidecarRun.status }, { connectionId: 'pocket-sidecar', model: 'discovered-model', status: 'completed' })

const originalQuiet = spindle.generate.quiet
spindle.generate.quiet = async () => { throw new Error('planner unavailable') }
await frontendHandler({
  type: 'lumiphone:camera_generate', requestId: 'camera-fallback', chatId: 'chat-a', characterId: 'char-a',
  scene: 'Alice at the station', enhance: true,
}, 'user-a')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:camera_done' && message.requestId === 'camera-fallback'))
spindle.generate.quiet = originalQuiet

const originalImageGenerate = spindle.imageGen.generate
const castMembers = storage.get('phones/chat-a__char-a.json').contacts.filter(contact => contact.source.kind === 'npc').slice(0, 2)
assert.equal(castMembers.length, 2)
await frontendHandler({ type: 'lumiphone:contact_group_save', requestId: 'cast-local', chatId: 'chat-a', characterId: 'char-a', name: 'Test Crew', memberIds: castMembers.map(contact => contact.id) }, 'user-a')
const localCast = storage.get('phones/chat-a__char-a.json').contactGroups.find(group => group.name === 'Test Crew')
await frontendHandler({ type: 'lumiphone:contact_group_bank', requestId: 'cast-save', chatId: 'chat-a', characterId: 'char-a', groupId: localCast.id }, 'user-a')
const savedCast = storage.get('device/npc-bank.json').groups.find(group => group.name === 'Test Crew')
assert.equal(savedCast.memberIds.length, 2)
await frontendHandler({ type: 'lumiphone:npc_cast_import', requestId: 'cast-import', chatId: 'chat-cast', characterId: 'char-a', groupId: savedCast.id, memberIds: savedCast.memberIds }, 'user-a')
const importedCastState = storage.get('phones/chat-cast__char-a.json')
assert.equal(importedCastState.contactGroups[0].memberIds.length, 2)
for (const contact of importedCastState.contacts.filter(contact => contact.source.kind === 'npc')) { assert.equal(contact.presence.inScene, false); assert.equal(contact.sceneNote, '') }
const localCastActor = importedCastState.contacts.find(contact => contact.source.kind === 'npc')
await frontendHandler({ type: 'lumiphone:save_contact', requestId: 'cast-local-edit', chatId: 'chat-cast', characterId: 'char-a', contact: { ...localCastActor, sceneNote: 'Only this chat', presence: { inScene: true, lastSceneAt: new Date().toISOString() } } }, 'user-a')
const beforeCastRetry = storage.get('phones/chat-cast__char-a.json').contacts.length
await frontendHandler({ type: 'lumiphone:npc_cast_import', requestId: 'cast-import-again', chatId: 'chat-cast', characterId: 'char-a', groupId: savedCast.id, memberIds: savedCast.memberIds }, 'user-a')
assert.equal(storage.get('phones/chat-cast__char-a.json').contacts.length, beforeCastRetry)
assert.equal(storage.get('phones/chat-cast__char-a.json').contacts.find(contact => contact.id === localCastActor.id).sceneNote, 'Only this chat', 'cast reuse must not reset local scene state')
const castBankEntry = storage.get('device/npc-bank.json').entries.find(entry => entry.id === savedCast.memberIds[0])
await frontendHandler({ type: 'lumiphone:npc_bank_edit', requestId: 'cast-bank-edit', chatId: 'chat-a', characterId: 'char-a', bankId: castBankEntry.id, entry: { ...castBankEntry, name: 'Bank only rename' } }, 'user-a')
assert.notEqual(storage.get('phones/chat-a__char-a.json').contacts.find(contact => contact.source.kind === 'npc' && contact.source.bankId === castBankEntry.id).name, 'Bank only rename', 'bank editing must not edit the local contact')

let nativeRequest
spindle.imageGen.generateNative = async input => { nativeRequest = input; return { generated: true, imageId: 'native-photo', imageUrl: '/api/v1/images/native-photo' } }
await frontendHandler({ type: 'lumiphone:camera_generate', requestId: 'native-camera', chatId: 'chat-a', characterId: 'char-a', scene: 'A scene', enhance: false }, 'user-a')
assert.equal(nativeRequest.chat_id, 'chat-a')
assert.equal(nativeRequest.clientJobId, 'native-camera')
assert.ok(frontendMessages.some(message => message.type === 'lumiphone:camera_done' && message.requestId === 'native-camera'))
const beforeCameraDefaults = structuredClone(storage.get('device/preferences.json'))
await frontendHandler({ type: 'lumiphone:save_preferences', chatId: 'chat-a', characterId: 'char-a', preferences: { ...beforeCameraDefaults, manualVisualProfile: { ...beforeCameraDefaults.manualVisualProfile, connectionId: 'saved-image-connection', model: 'saved-checkpoint' } } }, 'user-a')
let savedDefaultsRequest
spindle.imageGen.generate = async input => { savedDefaultsRequest = input; return { imageId: 'saved-default-photo', imageUrl: '/api/v1/images/saved-default-photo' } }
nativeRequest = undefined
await frontendHandler({ type: 'lumiphone:camera_generate', requestId: 'saved-camera-defaults', chatId: 'chat-a', characterId: 'char-a', scene: 'A scene', enhance: false }, 'user-a')
assert.equal(nativeRequest, undefined, 'saved camera overrides must select direct generation')
assert.equal(savedDefaultsRequest.connection_id, 'saved-image-connection')
assert.equal(savedDefaultsRequest.model, 'saved-checkpoint')
await frontendHandler({ type: 'lumiphone:save_preferences', chatId: 'chat-a', characterId: 'char-a', preferences: beforeCameraDefaults }, 'user-a')
spindle.imageGen.generate = originalImageGenerate
delete spindle.imageGen.generateNative
let deletedAsset
spindle.images.delete = async (imageId, userId) => { deletedAsset = { imageId, userId }; hostImages.delete(imageId); return true }
hostImages.set('owned-delete-fixture', { id: 'owned-delete-fixture', owner_extension_identifier: 'lumiphone', url: '/api/v1/images/owned-delete-fixture', mime_type: 'image/png' })
hostImages.set('foreign-delete-fixture', { id: 'foreign-delete-fixture', owner_extension_identifier: 'other', url: '/api/v1/images/foreign-delete-fixture', mime_type: 'image/png' })
await frontendHandler({ type: 'lumiphone:gallery_delete', requestId: 'delete-no-confirm', imageId: 'owned-delete-fixture', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.equal(deletedAsset, undefined)
await frontendHandler({ type: 'lumiphone:gallery_delete', requestId: 'delete-foreign', imageId: 'foreign-delete-fixture', confirmed: true, chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.equal(deletedAsset, undefined)
await frontendHandler({ type: 'lumiphone:gallery_delete', requestId: 'delete-owned', imageId: 'owned-delete-fixture', confirmed: true, chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.deepEqual(deletedAsset, { imageId: 'owned-delete-fixture', userId: 'user-a' })
await frontendHandler({ type: 'lumiphone:upload_avatar', requestId: 'upload-framed-avatar', croppedDataUrl: 'data:image/png;base64,aGVsbG8=', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.ok(frontendMessages.some(message => message.type === 'lumiphone:avatar_uploaded' && message.requestId === 'upload-framed-avatar'))
let portraitInput
spindle.imageGen.generate = async input => { portraitInput = input; return { imageId: 'portrait-image', imageUrl: '/api/v1/image-gen/results/portrait-image' } }
const portraitContact = storage.get('phones/chat-a__char-a.json').contacts[0]
const oldAvatar = portraitContact.avatarOverrideUrl
await frontendHandler({ type: 'lumiphone:camera_generate', requestId: 'portrait-test', chatId: 'chat-a', characterId: 'char-a', contactId: portraitContact.id, scene: 'Head and shoulders, neutral background', enhance: false }, 'user-a')
assert.match(portraitInput.prompt, /Single-subject contact portrait/)
assert.equal(storage.get('phones/chat-a__char-a.json').contacts[0].avatarOverrideUrl, oldAvatar, 'portrait generation must wait for an explicit apply action')
portraitInput = null
await frontendHandler({ type: 'lumiphone:camera_generate', requestId: 'portrait-missing', chatId: 'chat-a', characterId: 'char-a', contactId: 'missing-contact', scene: 'Portrait', enhance: false }, 'user-a')
assert.equal(portraitInput, null, 'missing portrait target must fail before image generation')
assert.ok(frontendMessages.some(message => message.type === 'lumiphone:error' && message.requestId === 'portrait-missing'))
spindle.imageGen.generate = originalImageGenerate

let completeConcurrentImage
spindle.imageGen.generate = async () => new Promise(resolve => { completeConcurrentImage = resolve })
const concurrentCamera = frontendHandler({ type: 'lumiphone:camera_generate', requestId: 'camera-concurrent', chatId: 'chat-a', characterId: 'char-a', scene: 'A new photo', enhance: false }, 'user-a')
await new Promise(resolve => setTimeout(resolve, 0))
const concurrentContact = storage.get('phones/chat-a__char-a.json').contacts[0]
await frontendHandler({ type: 'lumiphone:save_contact', requestId: 'during-camera', chatId: 'chat-a', characterId: 'char-a', contact: { ...concurrentContact, sceneNote: 'Changed during image generation' } }, 'user-a')
completeConcurrentImage({ imageId: 'concurrent-image', imageUrl: '/api/v1/images/concurrent-image' })
await concurrentCamera
assert.equal(storage.get('phones/chat-a__char-a.json').contacts[0].sceneNote, 'Changed during image generation', 'image completion must not overwrite concurrent edits')
spindle.imageGen.generate = originalImageGenerate

let resolveLateImage
spindle.imageGen.generate = async () => new Promise((resolve) => { resolveLateImage = resolve })
const cancelledGeneration = frontendHandler({
  type: 'lumiphone:camera_generate', requestId: 'camera-cancelled', chatId: 'chat-a', characterId: 'char-a',
  scene: 'A late image', enhance: false,
}, 'user-a')
await new Promise((resolve) => setTimeout(resolve, 0))
await frontendHandler({ type: 'lumiphone:camera_cancel', requestId: 'camera-cancelled', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
resolveLateImage({ imageId: 'late-image', imageUrl: '/api/v1/image-gen/results/late-image' })
await cancelledGeneration
assert.ok(!frontendMessages.some((message) => message.type === 'lumiphone:camera_done' && message.requestId === 'camera-cancelled'))

await frontendHandler({
  type: 'lumiphone:import_data', requestId: 'future-import', chatId: 'chat-a', characterId: 'char-a',
  data: { state: { version: 999 } },
}, 'user-a')
assert.ok(frontendMessages.some((message) => message.type === 'lumiphone:error' && message.requestId === 'future-import'))
storage.set('device/preferences.json', { version: 999, handsetScale: 42, futureToken: 'preserve-me' })
await frontendHandler({ type: 'lumiphone:get_state', requestId: 'future-preferences', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
assert.deepEqual(storage.get('device/preferences.json'), { version: 999, handsetScale: 42, futureToken: 'preserve-me' })

const originalImageList = spindle.images.list
const pagedImages = Array.from({ length: 719 }, (_, i) => ({ id: 'paged-' + i, url: '/api/v1/images/paged-' + i, original_filename: 'Photo ' + i, mime_type: 'image/png', created_at: 1 }))
const imageListCalls = []
spindle.images.list = async options => { imageListCalls.push(options); return { data: pagedImages.slice(options.offset, options.offset + options.limit), total: pagedImages.length } }
for (const offset of [0, 120, 672, 9999, -5]) {
  await frontendHandler({ type: 'lumiphone:gallery_list', requestId: 'page-' + offset, scope: 'character', offset, chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
  const result = frontendMessages.findLast(entry => entry.requestId === 'page-' + offset && entry.type === 'lumiphone:gallery')
  assert.ok(result); assert.equal(result.limit, 48); assert.equal(result.total, 719)
  assert.equal(result.offset, offset < 0 ? 0 : offset > 719 ? 672 : offset)
  assert.equal(result.data[0].id, 'paged-' + result.offset); assert.ok(result.data.length <= 48)
  assert.equal(imageListCalls.at(-1).characterId, 'char-a'); assert.equal(imageListCalls.at(-1).userId, 'user-a')
}
spindle.images.list = originalImageList

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new dom.window.Event('close')) }
dom.window.HTMLImageElement.prototype.decode = async function () {}
Object.defineProperty(dom.window.HTMLImageElement.prototype, 'naturalWidth', { get: () => 800 })
Object.defineProperty(dom.window.HTMLImageElement.prototype, 'naturalHeight', { get: () => 1200 })
dom.window.HTMLCanvasElement.prototype.getContext = () => ({ drawImage: () => {} })
dom.window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,aGVsbG8='
globalThis.Image = dom.window.Image
Object.assign(globalThis, {
  window: dom.window,
  FileReader: dom.window.FileReader,
  Blob: dom.window.Blob,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  HTMLButtonElement: dom.window.HTMLButtonElement,
  HTMLInputElement: dom.window.HTMLInputElement,
  HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
  HTMLSelectElement: dom.window.HTMLSelectElement,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
  MutationObserver: dom.window.MutationObserver,
  Option: dom.window.Option,
  getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
  CSS: { escape: value => String(value).replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`) },
  requestAnimationFrame: (callback) => { callback(0); return 1 },
  cancelAnimationFrame: () => {},
})
dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
dom.window.HTMLElement.prototype.animate = () => ({ cancel() {}, finished: Promise.resolve() })
let handoffScrollCount = 0
dom.window.HTMLElement.prototype.scrollIntoView = () => { handoffScrollCount += 1 }

let backendReceiver = null
const tagReceivers = new Map()
const frontendSends = []
const frontendStyles = []

// Controlled contract states double as visual fixtures; never export live user data.
async function exportVisual(name, source) {
  if (!process.env.POCKET_VISUAL_DIR) return
  const preview = source.cloneNode(true)
  if (name.startsWith('judge-')) {
    for (const input of preview.querySelectorAll('input')) {
      if (input.type !== 'password') input.setAttribute('value', input.value)
      if (input.type === 'checkbox') input.toggleAttribute('checked', input.checked)
    }
    const originalSelects = [...source.querySelectorAll('select')]
    for (const [index, select] of [...preview.querySelectorAll('select')].entries()) {
      select.value = originalSelects[index].value
      for (const option of select.options) option.toggleAttribute('selected', option.selected)
    }
  }
  const originals = [...source.querySelectorAll('pocket-inline-ui')]
  for (const [index, island] of [...preview.querySelectorAll('pocket-inline-ui')].entries()) {
    const template = document.createElement('template')
    template.setAttribute('shadowrootmode', 'open')
    template.innerHTML = originals[index].shadowRoot.innerHTML
    island.append(template)
  }
  for (const image of preview.querySelectorAll('img')) image.removeAttribute('src')
  // JSDOM has no layout: native sheet bounds are supplied by the controlled browser fixture.
  if (name.startsWith('sheet-')) preview.querySelector('dialog').removeAttribute('style')
  await writeFile(new URL(name + '.html', 'file://' + process.env.POCKET_VISUAL_DIR.replaceAll('\\', '/') + '/'), '<!doctype html><meta charset="utf-8"><style>' + frontendStyles.join('\n') + '\nbody{margin:0;padding:24px;background:#151318;color:#eee;font-family:system-ui;--lumiverse-primary:#d7a978}' + (name === 'npc-draft-portrait' || name === 'chat-voice' ? 'body>main' : 'main') + '{max-width:560px;margin:auto}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style><main>' + preview.outerHTML + '</main>')
}

const drawerRoot = document.createElement('div')
const widgetRoot = document.createElement('div')
const dockRoot = document.createElement('div')
const shownModals = []
const messageBubble = document.createElement('article')
document.body.append(drawerRoot, widgetRoot, dockRoot, messageBubble)
const drawerHandle = {
  root: drawerRoot,
  setBadge: () => {},
  activate: () => {},
  onActivate: () => () => {},
  destroy: () => {},
}
const inputHandle = {
  onClick: () => () => {}, destroy: () => {}, setLabel: () => {}, setSubtitle: () => {}, setEnabled: () => {},
}
const floatWidgetOptions = []
const widgetHandle = {
  root: widgetRoot, widgetId: 'widget-a', moveTo: () => {}, getPosition: () => ({ x: 0, y: 0 }),
  setSize: (width, height) => { widgetHandle.width = width; widgetHandle.height = height }, setVisible: () => {}, isVisible: () => true,
  setFullscreen: (value) => { widgetHandle.fullscreen = value }, isFullscreen: () => Boolean(widgetHandle.fullscreen),
  destroy: () => {}, onDragEnd: () => () => {},
}
const dockHandle = {
  root: dockRoot, panelId: 'pocket-dock', collapsed: true, size: 0,
  collapse() { this.collapsed = true }, expand() { this.collapsed = false }, isCollapsed() { return this.collapsed },
  setTitle: () => {}, setSize(size) { this.size = size }, destroy: () => { dockDestroyCount += 1 }, onVisibilityChange: () => () => {},
}
let dockRequestCount = 0
let dockDestroyCount = 0
const injected = []
let uploadFiles = []
const frontendContext = {
  uploads: { pickFile: async () => uploadFiles },
  components: { mountModelCombobox: (target, options) => { assert.equal(target.isConnected, true, 'host model controls must mount only on connected targets'); target.dataset.modelPickerMounted = 'true'; if (options.connection?.kind === 'image') { assert.equal(target.isConnected, true, 'camera picker must mount after its sheet joins the DOM'); target.dataset.imagePickerMounted = 'true' }; return { getValue: () => '', refresh: () => {}, update: () => {}, destroy: () => {} } } },
  dom: {
    addStyle: css => { frontendStyles.push(css); return () => {} },
    findMessageElement: (messageId) => messageId === 'host-message-a' ? messageBubble : null,
    inject: (target, html) => { const wrapper = document.createElement('span'); wrapper.innerHTML = html; target.appendChild(wrapper); injected.push(wrapper); return wrapper },
    uninject: (element) => element.remove(),
  },
  ui: {
    registerDrawerTab: () => drawerHandle,
    registerInputBarAction: () => inputHandle,
    createFloatWidget: options => { floatWidgetOptions.push(options); return widgetHandle },
    requestDockPanel: (options) => { dockRequestCount += 1; assert.equal(options.chromeless, true); assert.equal(options.centerContent, true); return dockHandle },
    showModal: (options) => {
      const record = { options, root: document.createElement('div'), dismissed: false }
      shownModals.push(record)
      return { root: record.root, onDismiss: () => () => {}, dismiss: () => { record.dismissed = true } }
    },
  },
  messages: { getLatestMessageId: () => 'host-message-a', registerTagInterceptor: (options, handler) => { tagReceivers.set(options.tagName, handler); return () => { if (tagReceivers.get(options.tagName) === handler) tagReceivers.delete(options.tagName) } } },
  events: { on: () => () => {} },
  permissions: { getGranted: async () => manifest.permissions, request: async () => manifest.permissions },
  getActiveChat: () => ({ chatId: 'chat-a', characterId: 'char-a' }),
  sendToBackend: (payload) => frontendSends.push(payload),
  onBackendMessage: (handler) => { backendReceiver = handler; return () => {} },
  ready: () => {},
}
const { setup } = await import(`${new URL('dist/frontend.js', root).href}?frontend-contract=${Date.now()}`)
const cleanup = setup(frontendContext)
await new Promise((resolve) => setTimeout(resolve, 0))
backendReceiver(firstState)
const launcher = widgetRoot.querySelector('.lumiphone-launcher')
assert.ok(launcher, 'float launcher was not rendered')
launcher.click()
assert.equal(widgetRoot.querySelector('.lumiphone-shell'), null, 'interactive phone leaked into draggable launcher float')
assert.ok(dockRoot.querySelector('.lumiphone-shell:not([hidden])'), 'phone did not open in the interactive desktop dock')
assert.equal(dockRequestCount, 1)

// Every handset has a stable logical device key and an isolated per-mount surface id.
// Persona appearance is legal only on the Persona-owned phone; inspecting an NPC
// must fall back to device-wide styling without changing the mounted surface id.
const identityUiState = structuredClone(firstState)
const pickerAlice = identityUiState.state.contacts.find(contact => contact.name === 'Alice')
identityUiState.state.conversations.push({
  id: 'picker-latest', kind: 'direct', title: 'Alice', includesPocketPersona: true, availability: { state: 'remote' },
  participantActorIds: [pickerAlice.id], participantContactIds: [pickerAlice.id], unread: 1,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  messages: [{ id: 'picker-message', sender: 'contact', senderActorId: pickerAlice.id, senderName: 'Alice', senderAccent: '#8b7dff', text: 'Latest picker interaction', createdAt: '2026-01-01T00:00:00Z', read: false, status: 'delivered' }],
})
identityUiState.preferences = structuredClone(firstState.preferences)
identityUiState.preferences.colors.accent = '#224466'
identityUiState.preferences.customCss = '.lp-title { letter-spacing: 7px; } /* device-css-marker */'
identityUiState.preferences.personaAppearance ||= {}
identityUiState.preferences.personaAppearance['persona-test'] = {
  enabled: true,
  theme: identityUiState.preferences.theme,
  colors: { ...structuredClone(identityUiState.preferences.colors), accent: '#ff00aa' },
  customCss: '.lp-title { font-weight: 900; } /* persona-css-marker */',
  homeWallpaper: { source: { kind: 'url', url: 'https://example.test/persona-only.png' }, fit: 'cover', focalX: .5, focalY: .5, scrim: .22 },
  chatWallpaper: { source: null, fit: 'cover', focalX: .5, focalY: .5, scrim: .22 },
}
identityUiState.resolvedWallpapers = {
  ...structuredClone(firstState.resolvedWallpapers),
  personaHome: { url: '/persona-only.png', status: 'ready', sourceKind: 'url', sourceLabel: 'Persona-only test' },
}
backendReceiver(identityUiState)
const identityShell = dockRoot.querySelector('.lumiphone-shell')
const identityStyle = identityShell.querySelector('style[data-pocket-custom-css="true"]')
const personaSurfaceId = identityShell.dataset.pocketSurface
const personaDeviceKey = identityShell.dataset.pocketDeviceKey
assert.ok(personaSurfaceId, 'mounted handset must expose an isolated Pocket surface id')
assert.ok(personaDeviceKey, 'mounted handset must expose its logical Pocket device key')
assert.equal(identityShell.dataset.pocketDeviceRole, 'persona')
assert.equal(identityShell.dataset.pocketInspection, 'false')
assert.equal(identityShell.style.getPropertyValue('--lp-accent'), '#ff00aa', 'Persona override must apply to the Persona-owned phone')
assert.match(identityShell.style.getPropertyValue('--lp-wallpaper'), /persona-only\.png/, 'Persona-only wallpaper must apply to the Persona-owned phone')
assert.match(identityStyle.textContent, new RegExp(`data-pocket-surface=[\\"']?${personaSurfaceId}`), 'dynamic custom CSS must be scoped to this mounted Pocket surface')
assert.match(identityStyle.textContent, /device-css-marker/)
assert.match(identityStyle.textContent, /persona-css-marker/)
assert.doesNotMatch(identityStyle.textContent, /@scope \(\.lumiphone-shell\)/, 'dynamic CSS must never scope against every Pocket shell in the document')

const npcDeviceRow = [...drawerRoot.querySelectorAll('.lumiphone-device-row')].find((node) => node.textContent.includes('Alice') && !node.textContent.includes('Roleplay Persona'))
assert.ok(npcDeviceRow, 'device selector must expose a non-Persona phone for isolation QA')
assert.ok(drawerRoot.querySelector('[data-section="persona"] .lumiphone-device-rp'), 'your phone must have a dedicated section')
assert.ok(drawerRoot.querySelector('[data-section="recent"] .lumiphone-device-preview'), 'recent phones must show their interaction preview')
assert.equal(drawerRoot.querySelector('.lumiphone-drawer-card'), null, 'switcher must not nest an outer card inside the sidebar')
assert.equal([...drawerRoot.querySelectorAll('button')].some(node => node.textContent === 'Open selected phone'), false, 'row selection replaces the redundant footer CTA')
assert.ok([...drawerRoot.querySelectorAll('.lumiphone-device-footer button')].some(node => node.textContent === 'Show launcher'), 'hidden launcher must be recoverable from the sidebar')

assert.ok(npcDeviceRow.dataset.pocketDeviceKey, 'device selector rows must expose the logical phone id before opening them')
assert.equal(drawerRoot.querySelectorAll('.lumiphone-device-row:not(.lumiphone-device-rp) .lumiphone-device-unread').length, 0, 'inspected actor phones must not show unread badges in the picker')
await exportVisual('devices', drawerRoot)
const npcLatestJump = npcDeviceRow
assert.ok(npcLatestJump, 'actor phone with history must offer a latest-interaction jump')
npcLatestJump.click()
assert.ok(dockRoot.querySelector('[data-message-id="picker-message"][data-selected="true"]'), 'jump must render and highlight the exact latest message')
assert.ok(frontendSends.some(payload => payload.type === 'lumiphone:mark_read' && payload.deviceOwnerActorId === npcDeviceRow.dataset.pocketDeviceOwner && payload.conversationId), 'jump must route into a conversation on the chosen device')
assert.equal(identityShell.dataset.pocketSurface, personaSurfaceId, 'inspecting another logical phone must not replace the mounted surface identity')
assert.notEqual(identityShell.dataset.pocketDeviceKey, personaDeviceKey, 'logical device key must change with the inspected phone owner')
assert.equal(identityShell.dataset.pocketDeviceRole, 'actor')
assert.equal(identityShell.dataset.pocketInspection, 'true')
assert.equal(identityShell.style.getPropertyValue('--lp-accent'), '#224466', 'NPC inspection must not inherit the active Persona accent')
assert.doesNotMatch(identityShell.style.getPropertyValue('--lp-wallpaper'), /persona-only\.png/, 'NPC inspection must not inherit the active Persona wallpaper')
assert.match(identityStyle.textContent, /device-css-marker/)
assert.doesNotMatch(identityStyle.textContent, /persona-css-marker/, 'NPC inspection must not inherit Persona custom CSS')

const personaDeviceRow = [...drawerRoot.querySelectorAll('.lumiphone-device-row')].find((node) => node.textContent.includes('Roleplay Persona'))
assert.ok(personaDeviceRow)
personaDeviceRow.click()
assert.equal(identityShell.dataset.pocketDeviceKey, personaDeviceKey, 'returning to the Persona phone must restore its logical device key')
assert.equal(identityShell.style.getPropertyValue('--lp-accent'), '#ff00aa')
backendReceiver({ type: 'lumiphone:conversation_opened', conversationId: 'picker-latest' })
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'ui-slow-reply', chatId: 'chat-a', characterId: 'char-a', conversationId: 'picker-latest', phase: 'pending' })
await exportVisual('chat', dockRoot)
const stopReplyButton = dockRoot.querySelector('[aria-label="Stop generating reply"]')
assert.ok(stopReplyButton && !stopReplyButton.disabled, 'busy composer must offer an enabled stop button')
stopReplyButton.click()
assert.ok(frontendSends.some(entry => entry.type === 'lumiphone:cancel_message_generation' && entry.conversationId === 'picker-latest'), 'stop button must cancel the current conversation')
assert.equal(dockRoot.querySelector('[aria-label="Stop generating reply"]'), null, 'stop must clear the local busy state')
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'ui-slow-reply', chatId: 'chat-a', characterId: 'char-a', conversationId: 'picker-latest', phase: 'done' })

const voiceUiState = structuredClone(identityUiState)
const speechBeforeVoiceFixture = { synthesis: dom.window.speechSynthesis, utterance: dom.window.SpeechSynthesisUtterance }
dom.window.speechSynthesis = { getVoices: () => [], speak: () => {}, cancel: () => {} }
dom.window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
voiceUiState.state.conversations.find(entry => entry.id === 'picker-latest').messages[0].format = 'voice'
backendReceiver({ ...voiceUiState, reason: 'refresh' })
assert.ok(dockRoot.querySelector('.lp-voice-message'), 'canonical voice messages must render a playback control and transcript')
await exportVisual('chat-voice', dockRoot)
backendReceiver({ ...identityUiState, reason: 'refresh' })
if (speechBeforeVoiceFixture.synthesis === undefined) delete dom.window.speechSynthesis
else dom.window.speechSynthesis = speechBeforeVoiceFixture.synthesis
if (speechBeforeVoiceFixture.utterance === undefined) delete dom.window.SpeechSynthesisUtterance
else dom.window.SpeechSynthesisUtterance = speechBeforeVoiceFixture.utterance
dockRoot.querySelector('[aria-label="Home or dismiss phone"]').click()
const dismissPhone = dockRoot.querySelector('.lumiphone-dismiss')
dismissPhone.click()
assert.equal(dockDestroyCount, 1, 'closing Pocket must destroy the dock handle')
launcher.click()
assert.equal(dockRequestCount, 2, 'reopening Pocket must request a fresh dock handle')
assert.ok(dockRoot.querySelector('.lumiphone-shell:not([hidden])'))
const handsetHost = dockRoot.querySelector('.lumiphone-handset-host')
assert.ok(Math.abs((parseFloat(handsetHost.style.width) / parseFloat(handsetHost.style.height)) - (9 / 18.4)) < 0.01, 'desktop phone bounds are not 9:18.4')
assert.equal(dockRoot.querySelectorAll('.lp-app-icon').length, 10)
assert.ok(dockRoot.querySelector('.lp-app-icon[aria-label="Messages"]'), 'original Messages stays registered')
const mochiStorage = spindle.userStorage, mochiActive = spindle.chats.getActive
const mochiPersonasList = spindle.personas.list
const mochiFiles = new Map()
const beforeMochiPhones = structuredClone([...storage.entries()])
try {
  spindle.personas.list = async () => ({ data: [] })
  spindle.userStorage = {
    exists: async (path, user) => mochiFiles.has(user + ':' + path),
    getJson: async (path, options) => structuredClone(mochiFiles.get(options.userId + ':' + path) ?? options.fallback),
    setJson: async (path, value, options) => { mochiFiles.set(options.userId + ':' + path, structuredClone(value)) },
    move: async (from, to, user) => { mochiFiles.set(user + ':' + to, mochiFiles.get(user + ':' + from)); mochiFiles.delete(user + ':' + from) },
    list: async (prefix, user) => [...mochiFiles.keys()].filter(path => path.startsWith(user + ':' + prefix)).map(path => path.slice((user + ':' + prefix).length)),
  }
  spindle.chats.getActive = async () => { throw new Error('Mochi must not resolve native RP context') }
  dockRoot.querySelector('.lp-app-icon[aria-label="Mochi"]').click()
  const request = frontendSends.at(-1)
  assert.equal(request.type, 'mochi:list')
  assert.equal(request.chatId, undefined, 'Mochi transport does not attach active RP context')
  await frontendHandler(request, 'user-a')
  backendReceiver(frontendMessages.at(-1))
  assert.match(dockRoot.querySelector('.mochi-view').textContent, /No rooms yet/)
  ;[...dockRoot.querySelectorAll('.mochi-view button')].find(node => node.textContent === 'New room').click()
  const form = dockRoot.querySelector('.mochi-view form')
  const fields = form.querySelectorAll('input')
  fields[0].value = 'Independent room'; fields[0].dispatchEvent(new dom.window.Event('input'))
  fields[1].value = 'Stable room persona'; fields[1].dispatchEvent(new dom.window.Event('input'))
  form.querySelector('.mochi-choice').click()
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
  await frontendHandler(frontendSends.at(-1), 'user-a')
  const response = frontendMessages.at(-1)
  assert.equal(response.type, 'mochi:state')
  backendReceiver(response)
  assert.match(dockRoot.querySelector('.mochi-view').textContent, /Stable room persona/)
  backendReceiver({ ...firstState, reason: 'chat_switched' })
  backendReceiver({ ...firstState, reason: 'persona_changed' })
  assert.match(dockRoot.querySelector('.mochi-view').textContent, /Stable room persona/, 'RP refresh must retain the independent view and snapshot')
  assert.ok(dockRoot.querySelector('.mochi-view textarea[aria-label="Message"]'), 'Mochi has an independent message composer')
  dockRoot.querySelector('.lumiphone-homebar button').click()
  Object.defineProperty(dom.window.document, 'hidden', { configurable: true, value: false })
  backendReceiver({ ...firstState, preferences: { ...firstState.preferences, notifyMessages: true, notificationPreviews: false } })
  const notice = { id: 'synthetic_notice', messageId: 'synthetic_notice', roomId: response.selectedRoomId, roomTitle: 'Independent room', title: 'Actual character', body: 'Hidden private preview', avatarUrl: '', createdAt: new Date().toISOString(), read: false }
  backendReceiver({ type: 'mochi:notification', notification: notice })
  backendReceiver({ type: 'mochi:notification', notification: notice })
  const toast = dockRoot.querySelector('.mochi-notification-toast')
  assert.ok(toast, 'Mochi can notify while Pocket home is visible')
  assert.match(toast.textContent, /Actual character/)
  assert.doesNotMatch(toast.textContent, /Hidden private preview/)
  assert.equal(dockRoot.querySelectorAll('.mochi-notification-toast').length, 1, 'Notification events deduplicate')
  toast.click()
  assert.ok(dockRoot.querySelector('.mochi-view textarea[aria-label="Message"]'), 'Mochi notification opens its independent room')
  assert.equal(dockRoot.querySelector('select[aria-label="Select room"]').value, response.selectedRoomId)
  assert.equal(frontendSends.at(-1).type, 'mochi:list', 'Notification route refreshes Mochi without native RP requests')
  await frontendHandler(frontendSends.at(-1), 'user-a')
  backendReceiver(frontendMessages.at(-1))
  assert.deepEqual([...storage.entries()], beforeMochiPhones, 'Mochi must not write existing phones or preferences')
} finally {
  spindle.userStorage = mochiStorage; spindle.chats.getActive = mochiActive
  spindle.personas.list = mochiPersonasList
  delete dom.window.document.hidden
  backendReceiver(firstState)
  dockRoot.querySelector('.lumiphone-homebar button').click()
}
await exportVisual('home', dockRoot)
for (const [name, width, scale] of [['min', 288, .7], ['max', 443, 1.3]]) {
  const scaledHome = dockRoot.cloneNode(true)
  const handset = scaledHome.querySelector('.lumiphone-handset-host')
  handset.style.width = width + 'px'; handset.style.height = Math.floor(width / (9 / 18.4)) + 'px'
  scaledHome.querySelector('.lumiphone-shell').style.setProperty('--pocket-ui-scale', String(scale))
  await exportVisual('home-scale-' + name, scaledHome)
}
const settingsIcon = [...dockRoot.querySelectorAll('.lp-app-icon')].find((node) => node.textContent.includes('Settings'))
settingsIcon.click()
assert.equal(dockRoot.querySelectorAll('[data-settings-category]').length, 8, 'Settings root must render category navigation')
await exportVisual('settings', dockRoot)
dockRoot.querySelector('[data-settings-category="jev"]').click()
await exportVisual('judge-llm', dockRoot)
const judgeProvider = [...dockRoot.querySelectorAll('label')].find(node => node.querySelector('.lp-field-label')?.textContent === 'Provider').querySelector('select')
judgeProvider.value = 'typesafe'; judgeProvider.dispatchEvent(new Event('change'))
await exportVisual('judge-typesafe', dockRoot)
backendReceiver({ ...identityUiState, jevKeyConfigured: true, reason: 'jev_key' })
assert.equal(dockRoot.querySelector('[data-pocket-jev-key-status]').textContent, 'API key saved on the host.')
assert.equal(judgeProvider.value, 'typesafe', 'key acknowledgement must preserve the provider draft')
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Settings').click()
const appearanceFixture = structuredClone(identityUiState)
appearanceFixture.preferences.personaAppearance['persona-test'].enabled = false
backendReceiver({ ...appearanceFixture, reason: 'preferences' })
dockRoot.querySelector('[data-settings-category="personalization"]').click()
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent.includes('Device appearance')).click()
for (const theme of ['midnight', 'forest', 'pink', 'rose']) {
  dockRoot.querySelector('button[title="' + (theme === 'rose' ? 'Sunset' : theme) + '"]').click()
  await exportVisual('appearance-' + (theme === 'rose' ? 'sunset' : theme), dockRoot)
}
backendReceiver({ ...identityUiState, reason: 'preferences' })
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Settings').click()
dockRoot.remove()
dockRoot.querySelector('[data-settings-category="camera"]').click()
await new Promise(resolve => setTimeout(resolve, 0))
const delayedSettingsPicker = dockRoot.querySelector('.lp-model-combobox')
assert.equal(delayedSettingsPicker.dataset.imagePickerMounted, undefined, 'settings picker must wait for a connected dock')
document.body.append(dockRoot)
await new Promise(resolve => setTimeout(resolve, 0))
assert.equal(delayedSettingsPicker.dataset.imagePickerMounted, 'true', 'settings picker must mount when the host attaches its dock later')
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'iPhone' } })
const originalViewportWidth = window.innerWidth
Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
window.dispatchEvent(new Event('resize'))
await new Promise(resolve => setTimeout(resolve, 0))
const mobileSettingsPicker = widgetRoot.querySelector('.lp-model-combobox')
assert.ok(mobileSettingsPicker && mobileSettingsPicker !== delayedSettingsPicker, 'moving to mobile must recreate placement-bound settings controls')
assert.equal(mobileSettingsPicker.dataset.imagePickerMounted, 'true')
assert.equal(floatWidgetOptions.at(-1).touchScrollMode, 'native', 'iPhone widget creation must opt into native scrolling even without a handle setter')
if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator)
else delete globalThis.navigator
Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalViewportWidth })
window.dispatchEvent(new Event('resize'))
await new Promise(resolve => setTimeout(resolve, 0))
assert.equal(dockRoot.querySelector('.lp-model-combobox').dataset.imagePickerMounted, 'true', 'returning to desktop must remount its settings picker')
dockRoot.querySelector('.lp-nav-action').click()
dockRoot.remove()
dockRoot.querySelector('[data-settings-category="camera"]').click()
await new Promise(resolve => setTimeout(resolve, 0))
const cancelledSettingsPicker = dockRoot.querySelector('.lp-model-combobox')
dockRoot.querySelector('.lp-nav-action').click()
document.body.append(dockRoot)
await new Promise(resolve => setTimeout(resolve, 0))
assert.equal(cancelledSettingsPicker.dataset.imagePickerMounted, undefined, 'leaving settings must cancel its deferred picker mount')
dockRoot.querySelector('[data-settings-category="personalization"]').click()
;[...dockRoot.querySelectorAll('.lp-settings-category')].find(node => node.textContent.includes('Device appearance')).click()
const uiScaleInput = [...dockRoot.querySelectorAll('input[type="range"]')].find((node) => node.min === '0.7' && node.max === '1.3')
assert.ok(uiScaleInput, 'UI density scale control was not rendered')
const scaleInput = [...dockRoot.querySelectorAll('input[type="range"]')].find((node) => node.min === '0.8' && node.max === '1.25')
assert.ok(scaleInput, 'semantic phone scale control was not rendered')
const initialDockSize = dockHandle.size
uiScaleInput.value = '0.75'
uiScaleInput.dispatchEvent(new Event('input', { bubbles: true }))
assert.equal(dockHandle.size, initialDockSize, 'UI density must not resize the desktop handset')
scaleInput.value = '0.8'
scaleInput.dispatchEvent(new Event('input', { bubbles: true }))
assert.ok(Math.abs((parseFloat(handsetHost.style.width) / parseFloat(handsetHost.style.height)) - (9 / 18.4)) < 0.01, 'scale update broke 9:18.4 bounds')
assert.ok(dockHandle.size < initialDockSize, 'scale control did not derive a new semantic dock size')

dockRoot.querySelector('.lumiphone-homebar button').click()
const messagesIcon = [...dockRoot.querySelectorAll('.lp-app-icon')].find((node) => node.textContent.includes('Messages'))
messagesIcon.click()
const conversationCard = dockRoot.querySelector('.lp-conversation-list .lp-conversation-row[role="button"][data-clickable="true"]')
assert.ok(conversationCard, 'conversation list must render a clickable conversation row')
conversationCard.click()
assert.equal(dockRoot.querySelector('.lp-conversation-menu > summary').textContent, '⋯', 'thread header must use a compact conversation menu instead of the overloaded Info button')
assert.equal(dockRoot.querySelector('.lp-conversation-menu > summary').getAttribute('aria-label'), 'Conversation menu')
const messageTextarea = dockRoot.querySelector('.lp-compose textarea')
const sendButton = dockRoot.querySelector('.lp-compose button[aria-label="Send message"]')
const actionCountBeforeClick = frontendSends.filter((message) => message.type === 'lumiphone:action' && message.action === 'message').length
messageTextarea.value = 'Sent with the paper plane'
sendButton.click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:action' && message.action === 'message').length, actionCountBeforeClick + 1, 'paper-plane click must submit exactly once')
messageTextarea.value = 'Sent with Enter'
messageTextarea.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:action' && message.action === 'message').length, actionCountBeforeClick + 2, 'Enter must submit exactly once')
messageTextarea.value = 'keep editing'
messageTextarea.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }))
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:action' && message.action === 'message').length, actionCountBeforeClick + 2, 'Shift+Enter must not submit')
const activeConversationId = firstState.state.conversations[0].id
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'checking-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: activeConversationId, speakerContactId: 'char-a', phase: 'checking' })
assert.match(dockRoot.textContent, /Checking for reply/, 'reply decision status must be observable')
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'checking-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: activeConversationId, speakerContactId: 'char-a', phase: 'done' })
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'typing-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: activeConversationId, speakerContactId: 'char-a', phase: 'pending' })
assert.equal(dockRoot.querySelectorAll('.lp-typing-dots i').length, 3, 'pending reply must render three typing dots')
assert.ok(!dockRoot.textContent.includes('Writing…'), 'pending reply must not render the literal Writing label')
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'typing-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: activeConversationId, speakerContactId: 'char-a', phase: 'done' })
const pausedUiState = structuredClone(firstState)
pausedUiState.state.conversations[0].availability = { state: 'arriving' }
backendReceiver(pausedUiState)
assert.match(dockRoot.textContent, /Alice is on the way\./, 'arriving must render Pocket-owned transition copy')
assert.ok(dockRoot.querySelector('.lp-compose'), 'arriving must keep remote messaging usable until the actor becomes local')
const continueToArrival = [...dockRoot.querySelectorAll('button')].find((node) => node.textContent === 'Continue to arrival')
assert.ok(continueToArrival, 'arriving state must expose an explicit roleplay bridge without disabling texting')
const arrivalBridgeRequestsBefore = frontendSends.filter((message) => message.type === 'lumiphone:continue_arrival').length
continueToArrival.click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:continue_arrival').length, arrivalBridgeRequestsBefore + 1)

const localUiState = structuredClone(pausedUiState)
const localConversation = localUiState.state.conversations[0]
const handoffSource = localConversation.messages.at(-1) || {
  id: 'handoff-source-ui', sender: 'persona', senderName: 'You', senderAccent: '', text: 'See you here',
  createdAt: new Date().toISOString(), read: true, status: 'sent',
}
if (!localConversation.messages.length) localConversation.messages.push(handoffSource)
localConversation.availability = { state: 'local', reason: 'arrived' }
localConversation.lastDecision = {
  rawAction: 'handoff', normalizedAction: 'handoff', reason: 'arrived', normalizationReason: '',
  contactInScene: true, remoteEligible: true, explicitRemoteOverride: false,
  createdAt: new Date().toISOString(), relayId: 'relay-ui', burstId: 'burst-ui',
}
localUiState.state.relays = [{
  id: 'relay-ui', chatId: 'chat-a', characterId: 'char-a', contactId: 'char-a', conversationId: localConversation.id,
  burstId: 'burst-ui', kind: 'local', reason: 'arrived', actorState: 'arrived', sourceMessageId: handoffSource.id,
  conversationTail: { text: 'You: See you here', recentMessageIds: [handoffSource.id], updatedAt: new Date().toISOString() },
  latestExchange: 'You: See you here', timelineEventId: 'timeline-ui', createdAt: new Date().toISOString(), status: 'pending',
  continuation: { state: 'launching', invokedAt: new Date().toISOString() },
}]
backendReceiver(localUiState)
await new Promise((resolve) => setTimeout(resolve, 0))
let handoffActivityNode = dockRoot.querySelector('[data-relay-id="relay-ui"]')
assert.equal(handoffActivityNode.dataset.state, 'preparing')
assert.match(handoffActivityNode.textContent, /Preparing roleplay handoff/)
assert.ok(dockRoot.querySelector(`[data-message-id="${handoffSource.id}"]`).nextElementSibling?.matches('[data-relay-id="relay-ui"]'), 'handoff activity must be anchored immediately after its chronological source message')
assert.equal(handoffScrollCount, 1, 'a newly local conversation must scroll its handoff activity into view once')

const acceptedUiState = structuredClone(localUiState)
acceptedUiState.state.relays[0].continuation = { ...acceptedUiState.state.relays[0].continuation, state: 'accepted', hostAcceptedAt: new Date().toISOString(), generationId: 'gen-ui' }
backendReceiver(acceptedUiState)
handoffActivityNode = dockRoot.querySelector('[data-relay-id="relay-ui"]')
assert.equal(handoffActivityNode.dataset.state, 'accepted')
assert.match(handoffActivityNode.textContent, /Host accepted the handoff/)
assert.equal(handoffScrollCount, 1, 'relay progress rerenders must not repeatedly steal scroll')

const generatingUiState = structuredClone(acceptedUiState)
generatingUiState.state.relays[0].injectedAt = new Date().toISOString()
generatingUiState.state.relays[0].injectedGenerationId = 'gen-ui'
generatingUiState.state.relays[0].serializedRelayChars = 812
generatingUiState.state.relays[0].serializedRelay = '=== POCKET CONTINUITY RELAY — NEWER STATE ==='
generatingUiState.state.relays[0].continuation.state = 'started'
backendReceiver(generatingUiState)
handoffActivityNode = dockRoot.querySelector('[data-relay-id="relay-ui"]')
assert.equal(handoffActivityNode.dataset.state, 'generating')
assert.match(handoffActivityNode.textContent, /Continuing in roleplay/)
assert.equal(handoffActivityNode.querySelector('.lp-typing-dots'), null, 'handoff generation must not masquerade as an incoming DM typing indicator')
assert.match(handoffActivityNode.querySelector('.lp-handoff-diagnostics').textContent, /Injected: yes · gen-ui/)
assert.match(handoffActivityNode.querySelector('.lp-handoff-diagnostics').textContent, /Serialized relay: 812 chars/)

const failedUiState = structuredClone(generatingUiState)
failedUiState.state.relays[0].injectionError = 'Host rejected the generation.'
failedUiState.state.relays[0].continuation.state = 'failed'
failedUiState.state.relays[0].continuation.error = 'Host rejected the generation.'
backendReceiver(failedUiState)
handoffActivityNode = dockRoot.querySelector('[data-relay-id="relay-ui"]')
assert.equal(handoffActivityNode.dataset.state, 'failed')
const retryHandoff = [...handoffActivityNode.querySelectorAll('button')].find((node) => node.textContent === 'Retry')
const continuationRequestsBefore = frontendSends.filter((message) => message.type === 'lumiphone:continue_relay').length
retryHandoff.click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:continue_relay').length, continuationRequestsBefore + 1)

const completedUiState = structuredClone(generatingUiState)
completedUiState.state.relays[0].status = 'consumed'
completedUiState.state.relays[0].continuation.state = 'completed'
completedUiState.state.relays[0].continuation.generationCompletedAt = new Date().toISOString()
backendReceiver(completedUiState)
handoffActivityNode = dockRoot.querySelector('[data-relay-id="relay-ui"]')
assert.equal(handoffActivityNode.dataset.state, 'completed')
assert.match(handoffActivityNode.textContent, /Continued in roleplay/)
assert.ok([...handoffActivityNode.querySelectorAll('button')].some((node) => node.textContent === 'Open RP'))

const groupUiState = structuredClone(completedUiState)
groupUiState.state = structuredClone(storage.get('phones/chat-a__char-a.json'))
backendReceiver(groupUiState)
backendReceiver({ type: 'lumiphone:conversation_opened', conversationId: groupId })
assert.equal(dockRoot.querySelector('.lp-speaker-select'), null, 'the permanent speaker dropdown must not occupy the composer row')
assert.match(dockRoot.querySelector('.lp-speaker-menu summary').textContent, /participants · Auto speaker/)
const avatarSpace = new dom.window.KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
dockRoot.querySelector('.lp-group-message [data-clickable="true"]').dispatchEvent(avatarSpace)
assert.equal(avatarSpace.defaultPrevented, true, 'Space must activate actor navigation without scrolling')
backendReceiver(groupUiState)
backendReceiver({ type: 'lumiphone:conversation_opened', conversationId: groupId })
const inviteUiState = structuredClone(groupUiState)
const inviteConversation = inviteUiState.state.conversations.find((entry) => entry.id === groupId)
inviteConversation.messages = inviteConversation.messages.slice(-1)
inviteConversation.messages.at(-1).eventSuggestion = {
  id: 'invite-ui', kind: 'event', status: 'pending', title: 'Movie night', description: 'Bring takeout and pick a film together.',
  whenKind: 'relative', whenText: 'Tonight', participantNames: ['Alex', 'Sam'],
}
backendReceiver(inviteUiState)
const inviteCard = dockRoot.querySelector('.lp-event-invite')
assert.ok(inviteCard, 'conversation suggestions render as separate invite cards')
assert.equal(inviteCard.closest('.lp-bubble, .lp-group-message'), null, 'invites must not live inside messages')
assert.equal(inviteCard.parentElement, dockRoot.querySelector('.lp-bubbles'))
assert.equal(inviteCard.previousElementSibling.querySelector('.lp-bubble')?.dataset.messageId || inviteCard.previousElementSibling.dataset.messageId, inviteConversation.messages.at(-1).id)
await exportVisual('chat-invite', dockRoot)
backendReceiver(groupUiState)
const conversationMenu = dockRoot.querySelector('.lp-conversation-menu')
conversationMenu.open = true
assert.ok([...conversationMenu.querySelectorAll('button')].some((node) => node.textContent === 'Participants'))
const referenceMenuAction = [...conversationMenu.querySelectorAll('button')].find((node) => node.textContent === 'Reference in roleplay')
referenceMenuAction.click()
const referenceModal = shownModals.at(-1)
assert.equal(referenceModal.options.title, 'Reference in roleplay')
assert.equal(referenceModal.root.querySelectorAll('[data-reference-scope]').length, 3)
const selectedScope = referenceModal.root.querySelector('[data-reference-scope="selected_messages"]')
selectedScope.checked = true
selectedScope.dispatchEvent(new Event('change', { bubbles: true }))
const selectableReferenceMessages = [...referenceModal.root.querySelectorAll('[data-reference-message]')]
assert.ok(selectableReferenceMessages.length > 1)
selectableReferenceMessages.at(-1).checked = true
selectableReferenceMessages.at(-1).dispatchEvent(new Event('change', { bubbles: true }))
const referenceRequestsBefore = frontendSends.filter((message) => message.type === 'lumiphone:arm_reference').length
referenceModal.root.querySelector('.lp-button-primary').click()
const referenceRequest = frontendSends.filter((message) => message.type === 'lumiphone:arm_reference').at(-1)
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:arm_reference').length, referenceRequestsBefore + 1)
assert.equal(referenceRequest.scope, 'selected_messages')
assert.deepEqual(referenceRequest.messageIds, [selectableReferenceMessages.at(-1).value])
assert.equal(referenceModal.dismissed, true)

const armedReferenceUiState = structuredClone(groupUiState)
const sourceReference = armedReferenceUiState.state.references.find((entry) => entry.conversationId === groupId) || pocketReference
armedReferenceUiState.state.references.push({
  ...structuredClone(sourceReference), id: 'reference-ui', conversationId: groupId, conversationTitle: 'Night Shift', status: 'armed',
  injectedAt: undefined, injectedGenerationId: undefined, boundUserMessageId: undefined, serializedReferenceChars: undefined,
  serializedReference: undefined, consumedAt: undefined, consumedMessageId: undefined, error: undefined,
})
backendReceiver(armedReferenceUiState)
let referenceBanner = dockRoot.querySelector('[data-reference-id="reference-ui"]')
assert.equal(referenceBanner.dataset.state, 'armed')
assert.match(referenceBanner.textContent, /Attached to next roleplay turn/)
assert.match(referenceBanner.textContent, /does not move any participant into the scene/i)
const cancelReferenceRequestsBefore = frontendSends.filter((message) => message.type === 'lumiphone:cancel_reference').length
;[...referenceBanner.querySelectorAll('button')].find((node) => node.textContent === 'Cancel').click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:cancel_reference').length, cancelReferenceRequestsBefore + 1)

const injectedReferenceUiState = structuredClone(armedReferenceUiState)
Object.assign(injectedReferenceUiState.state.references.at(-1), {
  status: 'injected', injectedAt: new Date().toISOString(), injectedGenerationId: 'reference-ui-generation',
  boundUserMessageId: 'reference-ui-user', serializedReferenceChars: 1_431, serializedReference: '=== POCKET USER REFERENCE — THIS TURN ===',
})
backendReceiver(injectedReferenceUiState)
referenceBanner = dockRoot.querySelector('[data-reference-id="reference-ui"]')
assert.equal(referenceBanner.dataset.state, 'injected')
assert.match(referenceBanner.textContent, /Reference attached to roleplay generation/)
assert.match(referenceBanner.querySelector('.lp-handoff-diagnostics').textContent, /Serialized reference: 1431 chars/)

const failedReferenceUiState = structuredClone(injectedReferenceUiState)
Object.assign(failedReferenceUiState.state.references.at(-1), { status: 'failed', error: 'Provider unavailable.' })
backendReceiver(failedReferenceUiState)
referenceBanner = dockRoot.querySelector('[data-reference-id="reference-ui"]')
assert.equal(referenceBanner.dataset.state, 'failed')
assert.match(referenceBanner.textContent, /Provider unavailable/)
const rearmReferenceRequestsBefore = frontendSends.filter((message) => message.type === 'lumiphone:rearm_reference').length
;[...referenceBanner.querySelectorAll('button')].find((node) => node.textContent === 'Attach again').click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:rearm_reference').length, rearmReferenceRequestsBefore + 1)
const lunaGroupMessage = [...dockRoot.querySelectorAll('.lp-bubble[data-sender="contact"]')].find((node) => node.dataset.messageId && node.textContent.includes('reacting to that first message'))
assert.equal(lunaGroupMessage.parentElement.style.getPropertyValue('--message-accent'), '#12abef', 'existing group bubbles must resolve the participant’s current saved accent')
const groupRuns = [...dockRoot.querySelectorAll('.lp-group-message')]
assert.equal(groupRuns.at(-1).dataset.continuation, 'true', 'consecutive messages from one speaker must collapse repeated identity chrome')
assert.ok(groupRuns.at(-1).querySelector('.lp-group-avatar-spacer'))
const speakerMenu = dockRoot.querySelector('.lp-speaker-menu')
speakerMenu.open = true
const lunaSpeakerOption = [...speakerMenu.querySelectorAll('.lp-speaker-option')].find((node) => node.textContent.includes(savedLuna.name))
lunaSpeakerOption.click()
assert.match(dockRoot.querySelector('.lp-speaker-menu summary').textContent, /Next reply: Luna/)
const groupGenerate = dockRoot.querySelector('.lp-compose button[aria-label*="Luna"]')
const groupRequestsBefore = frontendSends.filter((message) => message.type === 'lumiphone:generate_message').length
groupGenerate.click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:generate_message').length, groupRequestsBefore + 1)
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:generate_message').at(-1).speakerContactId, luna.id)
assert.match(dockRoot.querySelector('.lp-speaker-menu summary').textContent, /Auto speaker/, 'manual speaker selection applies to only the next generated reply')
backendReceiver({ type: 'lumiphone:message_progress', requestId: frontendSends.filter((message) => message.type === 'lumiphone:generate_message').at(-1).requestId, chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, phase: 'done' })
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'group-checking-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, phase: 'checking' })
assert.match(dockRoot.querySelector('.lp-group-typing').textContent, /Night Shift/)
assert.equal(dockRoot.querySelectorAll('.lp-group-typing .lp-typing-dots i').length, 3)
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'group-checking-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, phase: 'pending', speakerContactId: luna.id })
assert.match(dockRoot.querySelector('.lp-group-typing').textContent, /Luna is typing/)
backendReceiver({ type: 'lumiphone:message_progress', requestId: 'group-checking-ui', chatId: 'chat-a', characterId: 'char-a', conversationId: groupId, phase: 'done' })

const draftOne = { name: 'Draft One', role: 'Scout', identityBrief: 'First unsaved attempt.', accent: '#334455', messagingStyle: { talkativeness: 60, fragmentation: 40 }, sourceDescription: 'A useful scout' }
dockRoot.querySelector('.lumiphone-homebar button').click()
const contactsIconForDraft = [...dockRoot.querySelectorAll('.lp-app-icon')].find((node) => node.textContent.includes('Contacts'))
contactsIconForDraft.click()
const addContactForDraft = [...dockRoot.querySelectorAll('.lp-nav-action')].find((node) => node.textContent === 'Add')
addContactForDraft.click()
const addContactSearch = dockRoot.querySelector('input[type="search"][aria-label="Search contacts to add"]')
assert.ok(addContactSearch, 'Add Contact must expose search for saved/importable contacts')
addContactSearch.value = 'definitely-not-a-pocket-contact'
addContactSearch.dispatchEvent(new Event('input', { bubbles: true }))
assert.equal(dockRoot.querySelector('[data-contact-search-empty="true"]').hidden, false, 'Add Contact search must surface an empty result state')
backendReceiver({ type: 'lumiphone:contact_draft', requestId: 'ui-draft-one', draft: draftOne })
assert.match(dockRoot.textContent, /Unsaved preview/)
assert.match(dockRoot.textContent, /Draft One/)
const contactsBeforeUiRetry = groupUiState.state.contacts.length
const retryDraftButton = [...dockRoot.querySelectorAll('.lp-npc-draft button')].find((node) => node.textContent === 'Retry')
retryDraftButton.click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:generate_contact').at(-1).description, draftOne.sourceDescription)
assert.equal(groupUiState.state.contacts.length, contactsBeforeUiRetry)
const draftTwo = { name: 'Draft Two', role: 'Courier', identityBrief: 'Second unsaved attempt.', accent: '#556677', messagingStyle: { talkativeness: 73, fragmentation: 22 }, sourceDescription: 'A useful scout' }
backendReceiver({ type: 'lumiphone:contact_draft', requestId: 'ui-draft-two', draft: draftTwo })
assert.ok([...dockRoot.querySelectorAll('.lp-npc-draft button')].some((node) => node.textContent === 'Undo reroll'), 'one previous draft must remain recoverable')
const editDraftButton = [...dockRoot.querySelectorAll('.lp-npc-draft button')].find((node) => node.textContent === 'Edit')
editDraftButton.click()
const routeEventsBeforeDraftEdits = frontendSends.filter((message) => message.type === 'lumiphone:view_state').length
const draftColor = dockRoot.querySelector('.lp-color-input')
draftColor.value = '#abcdef'
draftColor.dispatchEvent(new Event('input', { bubbles: true }))
const draftTalk = [...dockRoot.querySelectorAll('input[type="range"]')].find((node) => node.min === '0' && node.max === '100')
draftTalk.value = '91'
draftTalk.dispatchEvent(new Event('input', { bubbles: true }))
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:view_state').length, routeEventsBeforeDraftEdits, 'draft field changes must never grow route history')
const saveDraftButton = [...dockRoot.querySelectorAll('.lp-nav-action')].find((node) => node.textContent === 'Save')
saveDraftButton.click()
const draftSavePayload = frontendSends.filter((message) => message.type === 'lumiphone:save_contact').at(-1).contact
assert.equal(draftSavePayload.accent, '#abcdef')
assert.equal(draftSavePayload.messagingStyle.talkativeness, 91)
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:view_state').length, routeEventsBeforeDraftEdits, 'Save must wait for backend acknowledgement instead of navigating optimistically')
const savedDraftId = 'saved-draft-contact'
const savedDraftState = structuredClone(groupUiState)
savedDraftState.state.contacts.push({
  ...savedDraftState.state.contacts[0], ...draftSavePayload, id: savedDraftId,
  source: { kind: 'npc', origin: 'generated', description: draftSavePayload.identityBrief }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
})
backendReceiver(savedDraftState)
backendReceiver({ type: 'lumiphone:contact_saved', requestId: 'ui-save-draft', contactId: savedDraftId })
assert.match(dockRoot.textContent, /Draft Two/)
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Edit').click()
const contactNameDraft = dockRoot.querySelector('input[placeholder="Name"]')
contactNameDraft.value = 'Draft Two edited'
contactNameDraft.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Quick Generate').click()
assert.ok(dockRoot.querySelector('.lp-photo-viewfinder'))
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Camera options').click()
assert.ok(dockRoot.querySelector('[data-image-picker-mounted="true"]'))
await exportVisual('sheet-camera', dockRoot)
;[...dockRoot.querySelectorAll('dialog button')].find(node => node.textContent === 'Done').click()
assert.match(dockRoot.querySelector('textarea').value, /Portrait of Draft Two/)
await exportVisual('camera-compose', dockRoot)
dockRoot.querySelector('form.lp-camera-body').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
const cancelledPortrait = frontendSends.filter(message => message.type === 'lumiphone:camera_generate').at(-1)
const photoStop = dockRoot.querySelector('[aria-label="Stop generating photo"]')
assert.ok(photoStop && !photoStop.disabled, 'busy shutter must remain actionable as stop')
photoStop.click()
assert.equal(frontendSends.filter(message => message.type === 'lumiphone:camera_cancel').at(-1).requestId, cancelledPortrait.requestId)
backendReceiver({ type: 'lumiphone:camera_progress', requestId: cancelledPortrait.requestId, phase: 'preview', imageDataUrl: 'ignored-late-preview' })
assert.ok(dockRoot.querySelector('[aria-label="Take photo"]'), 'late cancelled progress must not restart the camera')
dockRoot.querySelector('form.lp-camera-body').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
const portraitRequest = frontendSends.filter(message => message.type === 'lumiphone:camera_generate').at(-1)
assert.equal(portraitRequest.contactId, savedDraftId)
backendReceiver({ type: 'lumiphone:camera_progress', requestId: portraitRequest.requestId, imageDataUrl: 'data:image/png;base64,preview', phase: 'preview' })
assert.ok(![...dockRoot.querySelectorAll('button')].some(node => node.textContent === 'Use photo'), 'partial previews cannot be applied')
backendReceiver({ type: 'lumiphone:camera_done', requestId: portraitRequest.requestId, imageUrl: '/api/v1/images/portrait' })
assert.ok(dockRoot.querySelector('.lp-camera-review-actions .lp-camera-accept'), 'acceptance has its own review flow rather than sharing the shutter row')
assert.equal(dockRoot.querySelector('.lp-camera-floating-brief').hidden, true, 'review keeps the finished image unobscured')
assert.equal(dockRoot.querySelector('.lp-shutter').getAttribute('aria-label'), 'Retake photo')
await exportVisual('camera-review', dockRoot)
const captureCountBeforeRetake = frontendSends.filter(message => message.type === 'lumiphone:camera_generate').length
dockRoot.querySelector('.lp-shutter').click()
assert.equal(dockRoot.querySelector('.lp-camera-floating-brief').hidden, false, 'Retake returns to composition before spending another generation')
assert.equal(frontendSends.filter(message => message.type === 'lumiphone:camera_generate').length, captureCountBeforeRetake)
dockRoot.querySelector('.lp-shutter').click()
const retakeRequest = frontendSends.filter(message => message.type === 'lumiphone:camera_generate').at(-1)
backendReceiver({ type: 'lumiphone:camera_done', requestId: retakeRequest.requestId, imageUrl: '/api/v1/images/portrait' })

;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Use photo').click()
await new Promise(resolve => setTimeout(resolve, 0))
const photoApply = frontendSends.filter(message => message.type === 'lumiphone:set_contact_photo').at(-1)
assert.equal(photoApply.contactId, savedDraftId)
assert.equal(photoApply.imageUrl, '/api/v1/images/portrait')
dockRoot.querySelector('.lp-nav-action').click()
assert.equal(dockRoot.querySelector('input[placeholder="Name"]').value, 'Draft Two edited', 'camera round trip preserves unsaved contact edits')
dockRoot.querySelector('.lp-nav-action').click()
dockRoot.querySelector('.lp-nav-action').click()
assert.match(dockRoot.textContent, /Add Contact/, 'one Back after saving a new draft must return to the ordinary import screen')

const quickGenerate = [...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Generate NPC')
quickGenerate.click()
assert.ok(dockRoot.querySelector('.lp-npc-viewfinder'), 'quick generation opens a camera-style preview')
const quickBrief = dockRoot.querySelector('textarea')
quickBrief.value = 'A sleepy florist'
quickBrief.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
backendReceiver(savedDraftState)
assert.equal(dockRoot.querySelector('textarea').value, 'A sleepy florist', 'quick generation keeps the brief across state updates')

dockRoot.querySelector('.lumiphone-homebar button').click()
const draftMessagesIcon = [...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Messages')
draftMessagesIcon.click()
;[...dockRoot.querySelectorAll('.lp-nav-action')].find(node => node.textContent === 'New').click()
const recipientSearch = dockRoot.querySelector('input[type="search"]')
recipientSearch.value = 'NO SUCH CONTACT'
recipientSearch.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
assert.ok([...dockRoot.querySelectorAll('.lp-message-picker-row')].every(node => node.hidden))
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === '＋ New group').click()
const groupNameDraft = dockRoot.querySelector('input[placeholder="Group name"]')
groupNameDraft.value = 'Little garden club'
groupNameDraft.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
const groupChoices = [...dockRoot.querySelectorAll('input[type="checkbox"]')]
for (const checkbox of groupChoices.slice(0, 2)) { checkbox.checked = true; checkbox.dispatchEvent(new dom.window.Event('change', { bubbles: true })) }
backendReceiver(savedDraftState)
assert.equal(dockRoot.querySelector('input[placeholder="Group name"]').value, 'Little garden club', 'group editor is a real route and keeps its draft')
assert.equal(dockRoot.querySelectorAll('input[type="checkbox"]:checked').length, 2)

dockRoot.querySelector('.lumiphone-homebar button').click()
const trackerIcon = [...dockRoot.querySelectorAll('.lp-app-icon')].find((node) => node.textContent.includes('Trackers'))
trackerIcon.click()
const addTracker = [...dockRoot.querySelectorAll('.lp-nav-action')].find((node) => node.textContent === 'Add')
addTracker.click()
assert.match(dockRoot.textContent, /Pick a starting point/)
const blankTemplate = [...dockRoot.querySelectorAll('.lp-template-card')].find(node => node.textContent.includes('Blank meter'))
blankTemplate.click()
const trackerUpdateMode = [...dockRoot.querySelectorAll('select')].find(node => node.querySelector('option[value="automatic"]'))
trackerUpdateMode.value = 'automatic'; trackerUpdateMode.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
assert.match(dockRoot.querySelector('.lp-tracker-mode-help').textContent, /No model judgment/)
trackerUpdateMode.value = 'model'; trackerUpdateMode.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
assert.match(dockRoot.querySelector('.lp-tracker-mode-help').textContent, /tools or tags/)
const trackerPrompt = dockRoot.querySelector('textarea[placeholder="Increase by 1 when a clue is discovered. Reset when the mystery is solved."]')
assert.equal(trackerPrompt.closest('.lp-field').hidden, false)
trackerPrompt.value = 'Add one for each clue found.'; trackerPrompt.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
trackerUpdateMode.value = 'manual'; trackerUpdateMode.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
const trackerName = [...dockRoot.querySelectorAll('label')].find(node => node.textContent === 'Name').querySelector('input')
trackerName.value = 'Pocket progress'
trackerName.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
backendReceiver(savedDraftState)
assert.equal([...dockRoot.querySelectorAll('label')].find(node => node.textContent === 'Name').querySelector('input').value, 'Pocket progress', 'tracker drafts survive backend rerenders')
assert.equal(dockRoot.querySelector('textarea[placeholder="Increase by 1 when a clue is discovered. Reset when the mystery is solved."]').value, 'Add one for each clue found.', 'Prompt draft survives backend rerenders')
const saveTracker = [...dockRoot.querySelectorAll('.lp-nav-action')].find((node) => node.textContent === 'Save')
assert.equal(saveTracker.disabled, false, 'Tracker Save must be enabled by the page action contract')
const trackerActionsBefore = frontendSends.filter((message) => message.type === 'lumiphone:action' && message.action === 'tracker').length
saveTracker.click()
assert.equal(frontendSends.filter((message) => message.type === 'lumiphone:action' && message.action === 'tracker').length, trackerActionsBefore + 1, 'Tracker Save must dispatch its action')
assert.equal(frontendSends.at(-1).payload.modelPrompt, 'Add one for each clue found.', 'Tracker save carries its custom prompt')
// Controlled tracker fixtures exercise the same controller and pending pipeline.
const trackerUiState = structuredClone(savedDraftState)
const trackerBase = { ...trackerUiState.state.trackers[0], updateMode: 'manual', ratePerHour: 0, history: [] }
trackerUiState.state.trackers = [
  { ...trackerBase, id: 'fixture-counter', label: 'Supplies', kind: 'counter', presentation: 'counter', step: 2, value: 10 },
  { ...trackerBase, id: 'fixture-state', label: 'Weather mood', kind: 'state', presentation: 'state', states: ['Clear', 'Stormy'], state: 'Clear', initialState: 'Clear' },
  { ...trackerBase, id: 'fixture-timer', label: 'Journey', kind: 'timer', presentation: 'timer', updateMode: 'automatic', clock: 'roleplay', ratePerHour: -1, value: 60, unit: 'min' },
]
backendReceiver(trackerUiState)
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.textContent.includes('Trackers')).click()
const openFixtureTracker = id => dockRoot.querySelector(`[data-tracker-id="${id}"]`).dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
openFixtureTracker('fixture-counter')
assert.ok(dockRoot.querySelector('.lp-counter-instrument .lp-tracker-readout'))
const preciseAmount = dockRoot.querySelector('input[aria-label="Tracker amount"]')
preciseAmount.value = '7'; preciseAmount.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
backendReceiver(trackerUiState)
assert.equal(dockRoot.querySelector('input[aria-label="Tracker amount"]').value, '7')
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent.startsWith('Use 2')).click()
const counterMutation = frontendSends.at(-1)
assert.equal(counterMutation.payload.operation, 'subtract'); assert.equal(counterMutation.payload.amount, 2)
assert.ok([...dockRoot.querySelectorAll('.lp-tracker-operations button')].every(node => node.disabled))
backendReceiver({ type: 'lumiphone:error', requestId: counterMutation.requestId, error: 'Controlled failure' })
assert.ok([...dockRoot.querySelectorAll('.lp-tracker-operations button')].some(node => !node.disabled))
dockRoot.querySelector('.lp-nav-action').click()
openFixtureTracker('fixture-state')
assert.equal(dockRoot.querySelector('.lp-state-choices [aria-pressed="true"]').textContent, 'Clear')
;[...dockRoot.querySelectorAll('.lp-state-choices button')].find(node => node.textContent === 'Stormy').click()
const stateMutation = frontendSends.at(-1)
assert.equal(stateMutation.payload.operation, 'set_state'); assert.equal(stateMutation.payload.state, 'Stormy')
backendReceiver({ type: 'lumiphone:action_done', requestId: stateMutation.requestId, result: { trackerId: 'fixture-state' } })
dockRoot.querySelector('.lp-nav-action').click()
openFixtureTracker('fixture-timer')
assert.ok(dockRoot.querySelector('.lp-timer-instrument'))
assert.doesNotMatch(dockRoot.querySelector('.lp-tracker-stage').textContent, /High|Low|Steady/, 'timer status must describe the clock, not meter bands')
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Pause clock').click()
const clockMutation = frontendSends.at(-1)
assert.equal(clockMutation.payload.command, 'clock'); assert.equal(clockMutation.payload.clockAction, 'pause')
trackerUiState.state.trackers[2].clockPaused = true
backendReceiver(trackerUiState)
backendReceiver({ type: 'lumiphone:action_done', requestId: clockMutation.requestId, result: { trackerId: 'fixture-timer' } })
assert.ok([...dockRoot.querySelectorAll('button')].some(node => node.textContent === 'Resume clock' && !node.disabled))
backendReceiver(savedDraftState)

const inlineMessageActivity = {
  id: 'inline-message-activity', kind: 'message', title: 'Received message', summary: 'He is awake and on his way.',
  route: { app: 'messages', conversationId: 'conversation-inline', messageId: 'message-inline' },
  createdAt: new Date().toISOString(), scope: { chatId: 'chat-a', characterId: 'char-a' },
  presentation: { kind: 'received', senderName: 'Devon', recipientNames: ['Kai'], conversationTitle: 'Devon' },
  source: { messageId: 'host-message-a', conversationId: 'conversation-inline' },
}
const streamingInlineActivity = { ...inlineMessageActivity, id: 'streaming-inline-activity', summary: 'Rendered before the generation ends.' }
backendReceiver({
  type: 'lumiphone:provisional_activity', activity: streamingInlineActivity,
  origin: { chatId: 'chat-a', hostMessageId: 'host-message-a', swipeId: 0, generationId: 'streaming-ui-gen' },
})
const streamingArtifactHost = document.createElement('div')
streamingArtifactHost.className = 'pocket-inline-anchor'
streamingArtifactHost.dataset.pocketInlineAnchor = streamingInlineActivity.id
messageBubble.prepend(streamingArtifactHost)
await new Promise((resolve) => setTimeout(resolve, 24))
assert.equal(inlineAll(streamingArtifactHost, '.pocket-inline-artifact[data-kind="received"]').length, 1, 'streamed durable anchor must render from provisional activity metadata before any committed state arrives')
assert.equal(streamingArtifactHost.querySelector('.pocket-inline-artifact'), null, 'phone/card internals must be unreachable by host theme selectors')
assert.equal(streamingArtifactHost.querySelectorAll('pocket-inline-ui').length, 1, 'each mounted inline activity must have exactly one isolation host')
const streamingShadow = streamingArtifactHost.querySelector('pocket-inline-ui').shadowRoot
assert.ok(streamingShadow.querySelector('style')?.textContent.includes('.pocket-phone-thread'), 'mock/older browser path must install styles inside the shadow root')
assert.equal(streamingArtifactHost.querySelector('style'), null, 'isolated stylesheet fallback must never leak back into the host document')
assert.doesNotMatch(streamingShadow.querySelector('style').textContent, /\.lumiphone-shell|\.lp-camera|\.lumiphone-drawer/, 'inline isolation must not ship handset, app or sidebar CSS')

assert.match(inlineText(streamingArtifactHost) || '', /Rendered before the generation ends\./)
backendReceiver({ type: 'lumiphone:candidate_activity_discard', activityIds: [streamingInlineActivity.id], origin: { chatId: 'chat-a', hostMessageId: 'host-message-a', swipeId: 0 } })
assert.equal(streamingArtifactHost.childElementCount, 0, 'discarded provisional activity must evaporate its optimistic inline preview')
assert.equal(streamingArtifactHost.hidden, true, 'discarded optimistic preview anchor must be hidden')

backendReceiver({ type: 'lumiphone:activity', activity: inlineMessageActivity })
assert.equal(inlineAll(messageBubble, '.pocket-connector-row[data-direction="received"]').length, 1, 'between-turn fallback uses a compact connector instead of a device scene')
assert.equal(inlineAll(messageBubble, '[data-pocket-activity-id="inline-message-activity"] .pocket-receipt').length, 0, 'communication fallback must not add a competing provenance card')
const exactArtifactHost = document.createElement('div')
exactArtifactHost.className = 'pocket-inline-anchor'
exactArtifactHost.dataset.pocketInlineAnchor = 'inline-message-activity'
messageBubble.prepend(exactArtifactHost)
backendReceiver({ type: 'lumiphone:activity', activity: inlineMessageActivity })
assert.equal(inlineAll(exactArtifactHost, '.pocket-inline-artifact[data-kind="received"]').length, 1, 'persisted exact-position anchor must render the diegetic Pocket artifact')
assert.match(inlineText(exactArtifactHost) || '', /Messages.*Devon.*He is awake and on his way\./s)
assert.equal(inlineAll(exactArtifactHost, '.pocket-receipt').length, 0, 'inline story artifact must not carry the diagnostic receipt underneath it')
assert.equal(inlineAll(messageBubble, '[data-pocket-activity-id="inline-message-activity"]').length, 1, 'inline placement must replace the fallback receipt rather than duplicate it')
const observedInlineActivity = {
  ...inlineMessageActivity,
  id: 'observed-inline-activity',
  summary: 'Todoroki. I am sitting in a budget review. Please tell me you are okay.',
  presentation: { kind: 'observed', senderName: 'Izuku Midoriya', recipientNames: ['Shoto Todoroki'], conversationTitle: 'Shoto Todoroki' },
}
const observedArtifactHost = document.createElement('div')
observedArtifactHost.className = 'pocket-inline-anchor'
observedArtifactHost.dataset.pocketInlineAnchor = observedInlineActivity.id
messageBubble.prepend(observedArtifactHost)
backendReceiver({ type: 'lumiphone:activity', activity: observedInlineActivity })
assert.equal(inlineAll(observedArtifactHost, '.pocket-inline-artifact[data-kind="observed"]').length, 1, 'observed communication must render as a phone notification glimpse')
assert.match(inlineText(observedArtifactHost) || '', /Shoto Todoroki's phone.*Messages.*Izuku Midoriya.*budget review/s)
assert.doesNotMatch(inlineText(observedArtifactHost) || '', /observed phone|glimpse|Izuku Midoriya\s*→\s*Shoto Todoroki/i, 'diegetic observed UI must not expose debug/event-card language')

const externalUiState = structuredClone(savedDraftState)
externalUiState.state.discoveredActors.push(...structuredClone(deviceState.discoveredActors).map(actor => ({ ...actor, chatId: 'chat-a' })))
externalUiState.state.conversations.push(structuredClone(externalDm))
backendReceiver(externalUiState)
const externalUiActivity = { ...structuredClone(deviceState.activities.find(entry => entry.route.conversationId === externalDm.id)), id: 'cross-phone-ui', scope: { chatId: 'chat-a', characterId: 'char-a' }, source: { messageId: 'host-message-a' } }
const externalAnchor = document.createElement('div'); externalAnchor.className = 'pocket-inline-anchor'; externalAnchor.dataset.pocketInlineAnchor = externalUiActivity.id; messageBubble.prepend(externalAnchor)
backendReceiver({ type: 'lumiphone:activity', activity: externalUiActivity })
const externalButton = inlineOne(externalAnchor, 'button.pocket-inline-artifact')
assert.ok(externalButton, 'observed artifact is keyboard accessible')
externalButton.click()
assert.equal(frontendSends.filter(entry => entry.type === 'lumiphone:view_state').at(-1).deviceOwnerActorId, tylerActor.id)
assert.match(dockRoot.textContent, /Track him\. Send the pin\./)
assert.ok(dockRoot.querySelector('.lp-bubble[data-selected="true"]'), 'observed route selects its specific message')
assert.equal(dockRoot.querySelector('textarea'), null, 'observed actor phone stays read-only')
backendReceiver(savedDraftState)

const sentInlineActivity = {
  ...inlineMessageActivity,
  id: 'sent-inline-activity',
  summary: 'Bring some food when you come over.',
  presentation: { kind: 'sent', senderName: 'Kai', recipientNames: ['Shoto Todoroki'], conversationTitle: 'Shoto Todoroki' },
}
const sentArtifactHost = document.createElement('div')
sentArtifactHost.className = 'pocket-inline-anchor'
sentArtifactHost.dataset.pocketInlineAnchor = sentInlineActivity.id
messageBubble.prepend(sentArtifactHost)
backendReceiver({ type: 'lumiphone:activity', activity: sentInlineActivity })
assert.equal(inlineAll(sentArtifactHost, '.pocket-inline-artifact[data-kind="sent"] .pocket-inline-chat-bubble').length, 1, 'sent inline communication must use the chat-bubble primitive')
assert.match(inlineText(sentArtifactHost) || '', /Messages.*sent.*To Shoto Todoroki.*Bring some food when you come over\./s)
assert.doesNotMatch(inlineText(sentArtifactHost) || '', /Pocket chat|Kai\s*→\s*Shoto Todoroki/i, 'sent diegetic UI must avoid middleware-style sender arrows')
const batchInlineActivity = {
  ...inlineMessageActivity,
  id: 'batch-inline-activity',
  title: 'Class 3-A', summary: '7 messages',
  route: { app: 'messages', conversationId: 'class-3a', messageId: 'batch-msg-7' },
  presentation: {
    kind: 'batch', conversationTitle: 'Class 3-A',
    batchMessages: legacyBatchRows.map((row, index) => ({
      messageId: `batch-msg-${index + 1}`, senderName: row.speaker, text: row.text,
      direction: row.speaker === 'Katsuki Bakugo' ? 'sent' : 'received',
    })),
  },
  source: { messageId: 'host-message-a', conversationId: 'class-3a', messageIds: legacyBatchRows.map((_, index) => `batch-msg-${index + 1}`) },
}
const batchArtifactHost = document.createElement('div')
batchArtifactHost.className = 'pocket-inline-anchor'
batchArtifactHost.dataset.pocketInlineAnchor = batchInlineActivity.id
messageBubble.prepend(batchArtifactHost)
backendReceiver({ type: 'lumiphone:activity', activity: batchInlineActivity })
assert.equal(inlineAll(batchArtifactHost, '.pocket-inline-chat-transcript').length, 1, 'group message_batch must render as one coherent mini chat transcript')
assert.equal(inlineAll(batchArtifactHost, '.pocket-inline-transcript-row').length, legacyBatchRows.length, 'bounded seven-person GC riot should surface every authored bubble inline')
assert.match(inlineText(batchArtifactHost) || '', /Class 3-A.*Mina Ashido.*YOU COUNTED THE SECONDS.*Denki Kaminari.*BROOOOOOOOO/s)
assert.equal(inlineAll(batchArtifactHost, '.pocket-inline-transcript-row:not([hidden])').length, 3)
const expandBatch = inlineOne(batchArtifactHost, 'button.pocket-inline-transcript-more')
const sendsBeforeExpand = frontendSends.length
expandBatch.click()
assert.equal(inlineAll(batchArtifactHost, '.pocket-inline-transcript-row:not([hidden])').length, legacyBatchRows.length)
assert.equal(expandBatch.getAttribute('aria-expanded'), 'true')
assert.equal(frontendSends.length, sendsBeforeExpand, 'inline expansion must not navigate or send a message')
expandBatch.click()
assert.equal(inlineAll(batchArtifactHost, '.pocket-inline-transcript-row:not([hidden])').length, 3)
await exportVisual('scene-group', batchArtifactHost)
const inlineAppearanceState = { ...savedDraftState, state: { ...savedDraftState.state, activities: [inlineMessageActivity, observedInlineActivity, sentInlineActivity, batchInlineActivity] } }
backendReceiver({ ...inlineAppearanceState, preferences: { ...firstState.preferences, inlineAppearance: 'phone' } })
assert.equal(inlineOne(batchArtifactHost, '.pocket-inline-frame').dataset.appearance, 'phone')
assert.equal(inlineOne(batchArtifactHost, '.pocket-inline-frame').dataset.pocketUi, 'true', 'full phone must declare the Pocket styling boundary')
assert.equal(inlineOne(batchArtifactHost, '.pocket-phone-device').dataset.screen, 'group')
assert.equal(inlineOne(batchArtifactHost, '.pocket-inline-artifact'), null, 'Full Phone must not wrap the scene-card component')
assert.equal(inlineAll(batchArtifactHost, '.pocket-phone-message').length, legacyBatchRows.length, 'group phone shows its complete scrollable conversation')
assert.match(inlineOne(batchArtifactHost, '.pocket-phone-conversation-title').textContent, /Class 3-A/)
assert.ok(inlineOne(batchArtifactHost, '.pocket-mock-composer'))
assert.ok(inlineOne(batchArtifactHost, '.pocket-phone-status .pocket-phone-indicators svg'), 'phone chrome must use real SVG indicators rather than text glyphs')
assert.ok(inlineOne(batchArtifactHost, '.pocket-phone-app-header svg'), 'open chat header must use SVG controls')
assert.equal(inlineOne(batchArtifactHost, 'input,textarea'), null, 'mock composer must not pretend to send messages')
assert.equal(inlineOne(exactArtifactHost, '.pocket-phone-device').dataset.screen, 'lock')
assert.equal(inlineOne(observedArtifactHost, '.pocket-phone-device').dataset.screen, 'lock')
assert.match(inlineOne(observedArtifactHost, '.pocket-phone-lock-label').textContent, /Shoto Todoroki's phone/)
assert.doesNotMatch(inlineText(observedArtifactHost), /\bLocked\b/, 'lock state must be communicated by composition, not a giant debug-style Locked label')
assert.ok(inlineOne(observedArtifactHost, '.pocket-phone-notification-app svg'), 'lock notification must use an SVG app icon')
assert.equal(inlineOne(sentArtifactHost, '.pocket-phone-device').dataset.screen, 'chat')
assert.equal(inlineOne(sentArtifactHost, '.pocket-phone-notification'), null)
assert.equal(inlineOne(sentArtifactHost, '.pocket-phone-bubble').textContent, 'Bring some food when you come over.')
assert.ok(inlineOne(sentArtifactHost, '.pocket-phone-composer-send svg'), 'mock composer should render a proper SVG send affordance')
await exportVisual('phone-group', batchArtifactHost)
await exportVisual('phone-lock', exactArtifactHost)
await exportVisual('phone-chat', sentArtifactHost)
const callUiActivity = { ...inlineMessageActivity, id: 'call-ui', kind: 'call', presentation: { kind: 'received', senderName: 'Alice', recipientNames: ['Kai'], call: { callId: 'call-ui-id', status: 'ended', speakerphone: true, durationSeconds: 240 } } }
const callUiAnchor = document.createElement('div'); callUiAnchor.dataset.pocketInlineAnchor = callUiActivity.id; messageBubble.prepend(callUiAnchor)
backendReceiver({ type: 'lumiphone:activity', activity: callUiActivity })
assert.ok(inlineOne(callUiAnchor, '.pocket-phone-call[data-call-status="ended"]'))
assert.equal(inlineOne(callUiAnchor, '.pocket-inline-artifact'), null, 'call must be a dedicated screen, not a message panel')
assert.equal(inlineOne(callUiAnchor, '.pocket-mock-composer'), null)
assert.ok(inlineOne(callUiAnchor, '.pocket-phone-call-controls svg'))
assert.match(inlineText(callUiAnchor), /Call ended.*Speakerphone.*4:00/)
await exportVisual('phone-call', callUiAnchor)
backendReceiver({ ...inlineAppearanceState, state: { ...inlineAppearanceState.state, activities: [...inlineAppearanceState.state.activities, callUiActivity] }, preferences: { ...firstState.preferences, inlineAppearance: 'cards' } })
assert.equal(inlineOne(batchArtifactHost, '.pocket-inline-frame').dataset.appearance, 'cards')
assert.equal(inlineOne(batchArtifactHost, '.pocket-inline-frame').dataset.pocketUi, 'true', 'scene cards must declare the Pocket styling boundary')
assert.equal(inlineOne(batchArtifactHost, '.lp-message-surface'), null, 'inline bubbles must not carry shared handset surface hooks')
assert.equal(inlineOne(batchArtifactHost, '.pocket-mock-composer'), null)
await exportVisual('scene-message', exactArtifactHost)

const activity = { ...tagActivity, route: { app: 'notes', noteId: 'missing-safe-fallback' } }
backendReceiver({ type: 'lumiphone:activity', activity })
backendReceiver({ type: 'lumiphone:activity', activity })
const acceptedActivityHosts = inlineAll(messageBubble, `[data-pocket-activity-id="${activity.id}"]`)
assert.equal(acceptedActivityHosts.length, 1, 'accepted activity receipt was not deduplicated')
assert.equal(inlineAll(acceptedActivityHosts[0], '.pocket-receipt').length, 1, 'accepted activity host must contain exactly one provenance receipt')
inlineOne(acceptedActivityHosts[0], '.pocket-receipt').click()
assert.match(dockRoot.textContent, /Notes|Edit Note/, 'activity route did not open Pocket safely')
backendReceiver({ ...firstState, reason: 'host_swipe', state: { ...structuredClone(firstState.state), activities: [] } })
assert.equal(acceptedActivityHosts[0].isConnected, false, 'swipe projection must remove stale injected provenance surfaces from the previous candidate')
assert.equal(exactArtifactHost.childElementCount, 0, 'swipe projection must clear mounted inline content from the previous candidate')
assert.equal(exactArtifactHost.hidden, true, 'stale exact-position anchor must be hidden until the selected swipe supplies its activity')
tagReceivers.get('lumi-phone')({
  messageId: 'message-a', chatId: 'chat-a', attrs: { action: 'notify', app: 'home', title: 'Ping' },
  content: 'Open the phone', fullMatch: '<lumi-phone>Open the phone</lumi-phone>', isStreaming: false,
})
assert.ok(frontendSends.some((message) => message.type === 'lumiphone:model_action'))

// UI pass: burst grouping and contextual actions preserve the original command payload.
dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true }
dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')) }
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Settings').click()
dockRoot.querySelector('[data-settings-category="personalization"]').click()
;[...dockRoot.querySelectorAll('.lp-settings-category')].find(node => node.textContent.includes('Device appearance')).click()
dockRoot.querySelector('[data-image-target="device-chat"] .lp-wallpaper-presets-button').click()
assert.equal(dockRoot.querySelectorAll('.lp-wallpaper-library-card').length, 18)
;[...dockRoot.querySelectorAll('dialog .lp-chip')].find(node => node.textContent === 'Patterns').click()
assert.equal(dockRoot.querySelectorAll('.lp-wallpaper-library-card:not([hidden])').length, 7)
dockRoot.querySelector('[data-wallpaper-id="sage-check"]').click()
assert.equal(dockRoot.querySelector('.lp-wallpaper-library-caption').textContent, 'Sage Check')
;[...dockRoot.querySelectorAll('dialog button')].find(node => node.textContent === 'Use for Chat').click()
assert.equal(dockRoot.querySelector('dialog'), null)
await new Promise(resolve => setTimeout(resolve, 300))
assert.deepEqual(frontendSends.filter(message => message.type === 'lumiphone:save_preferences').at(-1).preferences.chatWallpaper.source, { kind: 'builtin', wallpaperId: 'sage-check' })
const burstState = structuredClone(firstState)
burstState.preferences.colors.accent = '#ffffff'
burstState.state.conversations[0].messages = Array.from({ length: 5 }, (_, index) => ({
  id: `burst-${index}`, sender: 'persona', senderName: 'Persona', senderAccent: '#ffffff',
  text: `Message ${index}`, createdAt: new Date().toISOString(), read: true, status: 'read',
}))
backendReceiver(burstState)
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Messages').click()
dockRoot.querySelector('.lp-conversation-row').click()
assert.equal(dockRoot.querySelectorAll('[data-burst-continuation="true"]').length, 4)
const moreAction = dockRoot.querySelector('.lp-message-more')
moreAction.click()
assert.equal(dockRoot.querySelectorAll('dialog[open]').length, 1, 'message actions must open an accessible sheet')
const deleteAction = dockRoot.querySelector('dialog button[aria-label="Delete message"]')
assert.ok(deleteAction, 'delete remains available in the message sheet')
await exportVisual('sheet-message', dockRoot)
deleteAction.click()
assert.ok(frontendSends.some(payload => payload.type === 'lumiphone:delete' && payload.id === 'burst-0'))
dockRoot.querySelector('.lp-sheet-close').click()
assert.equal(dockRoot.querySelector('dialog'), null, 'closing sheets must clean up the modal')
assert.equal(document.activeElement, moreAction, 'sheet close restores keyboard focus')
const outgoingHex = dockRoot.querySelector('.lumiphone-shell').style.getPropertyValue('--lp-outgoing')
const linear = [1,3,5].map(i => parseInt(outgoingHex.slice(i,i+2),16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
assert.ok(1.05 / (.05 + linear.reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0)) >= 4.5, 'extreme outgoing accents retain readable white text')
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Weather').click()
assert.equal(dockRoot.querySelectorAll('.lp-content input').length, 0, 'Weather opens in viewer mode')
await exportVisual('weather-app', dockRoot)
;[...dockRoot.querySelectorAll('.lp-nav-action')].find(node => node.textContent === 'Edit').click()
assert.ok(dockRoot.querySelectorAll('.lp-content input').length >= 5, 'Weather edit retains all fields')
assert.ok(dockRoot.querySelector('.lumiphone-app-view[data-pocket-app="weather"]'), 'Weather edit must remain inside the scrollable app-view container')

// Collection routes keep unsaved membership and seed the real message-group editor.
backendReceiver(savedDraftState)
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Contacts').click()
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Groups').click()
;[...dockRoot.querySelectorAll('.lp-nav-action')].find(node => node.textContent === 'New').click()
const collectionName = dockRoot.querySelector('input[placeholder="Group name"]')
collectionName.value = 'UI cast'
collectionName.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
for (const check of [...dockRoot.querySelectorAll('input[type="checkbox"]')].slice(0, 2)) { check.checked = true; check.dispatchEvent(new dom.window.Event('change', { bubbles: true })) }
backendReceiver(savedDraftState)
assert.equal(dockRoot.querySelector('input[placeholder="Group name"]').value, 'UI cast')
assert.equal(dockRoot.querySelectorAll('input:checked').length, 2)
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Save group').click()
const uiCollectionSave = frontendSends.filter(message => message.type === 'lumiphone:contact_group_save').at(-1)
const uiCollections = structuredClone(savedDraftState)
uiCollections.state.contactGroups = [{ id: 'ui-cast', name: 'UI cast', memberIds: uiCollectionSave.memberIds, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
backendReceiver(uiCollections)
backendReceiver({ type: 'lumiphone:collection_done', requestId: uiCollectionSave.requestId, view: 'groups' })
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Start group chat').click()
assert.equal(dockRoot.querySelector('input[placeholder="Group name"]').value, 'UI cast')
assert.equal(dockRoot.querySelectorAll('input:checked').length, 2)
assert.equal(dockRoot.querySelectorAll('.lp-selected-members .lp-chip').length, 2)

dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Contacts').click()
const uiBank = { ...uiCollections, npcBank: storage.get('device/npc-bank.json') }
backendReceiver(uiBank)
assert.deepEqual([...dockRoot.querySelectorAll('.lp-contact-filters button')].map(node => node.textContent), ['All', 'Here', 'Recent'], 'Only contact filters belong in the chip bar')
assert.deepEqual([...dockRoot.querySelectorAll('.lp-contact-library button')].map(node => node.textContent), ['Groups', 'NPC Bank'], 'Groups and the reusable bank share a separate library area')
await exportVisual('contacts', dockRoot)
dockRoot.querySelector('.lp-contact-row').click()
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Edit').click()
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Upload avatar').click()
await new Promise(resolve => setTimeout(resolve, 0))
assert.ok(dockRoot.querySelector('.lp-contact-photo-editor'), 'cancelled upload must keep contact editing open')
uploadFiles = [{ bytes: new Uint8Array([1, 2, 3]), mimeType: 'image/png', name: 'portrait.png' }]
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Upload avatar').click()
await new Promise(resolve => setTimeout(resolve, 20))
assert.match(dockRoot.textContent, /Uploaded photo ready/)
assert.ok(dockRoot.querySelector('.lp-camera-accept'), 'uploaded contact photos reuse the framing/accept flow')
dockRoot.querySelector('.lp-camera-accept').click()
await new Promise(resolve => setTimeout(resolve, 0))
const uploadedAvatar = frontendSends.findLast(entry => entry.type === 'lumiphone:set_contact_photo')
assert.ok(uploadedAvatar.croppedDataUrl.startsWith('data:image/png;base64,')); assert.ok(uploadedAvatar.contactId)
uploadFiles = []
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Gallery').click()
let requestedPage = frontendSends.findLast(entry => entry.type === 'lumiphone:gallery_list')
const showGalleryPage = request => backendReceiver({ type: 'lumiphone:gallery', requestId: request.requestId, scope: request.scope, offset: request.offset, limit: 48, total: 719, data: pagedImages.slice(request.offset, request.offset + 48).map(item => ({ ...item, filename: item.original_filename, createdAt: 1 })) })
showGalleryPage(requestedPage)
assert.equal(dockRoot.querySelectorAll('.lp-gallery-item').length, 48)
assert.equal(dockRoot.querySelector('.lp-gallery-pagination button').disabled, true)
for (let offset = 48; offset <= 672; offset += 48) {
  const previousRequest = requestedPage
  ;[...dockRoot.querySelectorAll('.lp-gallery-pagination button')].find(node => node.textContent === 'Next').click()
  requestedPage = frontendSends.findLast(entry => entry.type === 'lumiphone:gallery_list'); assert.equal(requestedPage.offset, offset)
  showGalleryPage(previousRequest)
  assert.match(dockRoot.querySelector('.lp-gallery-pagination').textContent, /Loading images/)
  showGalleryPage(requestedPage)
}
assert.equal(dockRoot.querySelectorAll('.lp-gallery-item').length, 47)
assert.match(dockRoot.querySelector('.lp-gallery-pagination').textContent, /673–719 of 719/)
assert.equal([...dockRoot.querySelectorAll('.lp-gallery-pagination button')].find(node => node.textContent === 'Next').disabled, true)
await exportVisual('gallery-paged', dockRoot)
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Refresh').click()
requestedPage = frontendSends.findLast(entry => entry.type === 'lumiphone:gallery_list')
assert.equal(requestedPage.offset, 672)
backendReceiver({ type: 'lumiphone:error', requestId: requestedPage.requestId, error: 'Fixture page failed' })
assert.equal(dockRoot.querySelector('.lp-gallery-pagination button').disabled, false, 'failed page must unlock navigation')
;[...dockRoot.querySelectorAll('.lp-chip')].find(node => node.textContent === 'Character').click()
requestedPage = frontendSends.findLast(entry => entry.type === 'lumiphone:gallery_list'); assert.equal(requestedPage.offset, 0); assert.equal(requestedPage.scope, 'character')
showGalleryPage(requestedPage)
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Contacts').click()
backendReceiver(uiBank)
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'NPC Bank').click()
assert.ok(dockRoot.querySelector('.lp-bank-casts'), 'portable casts have their own section')
assert.ok(dockRoot.querySelector('.lp-bank-individuals'), 'individual profiles have their own section')
const bankSearch = dockRoot.querySelector('input[placeholder="Search casts and saved NPCs"]')
bankSearch.value = 'no matching saved identity'; bankSearch.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
assert.ok(dockRoot.querySelector('.lp-bank-casts').hidden && dockRoot.querySelector('.lp-bank-individuals').hidden, 'search hides empty sections')
bankSearch.value = ''; bankSearch.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
assert.ok(!dockRoot.querySelector('.lp-bank-casts').hidden && !dockRoot.querySelector('.lp-bank-individuals').hidden, 'clearing search restores both sections')
await exportVisual('npc-bank', dockRoot)
const importsBeforeBankEdit = frontendSends.filter(message => message.type === 'lumiphone:npc_bank_add').length
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Edit saved profile').click()
assert.match(dockRoot.textContent, /Edit Bank Profile/)
assert.equal(frontendSends.filter(message => message.type === 'lumiphone:npc_bank_add').length, importsBeforeBankEdit)

// A generated NPC can accept a portrait without first being persisted as a contact.
dockRoot.querySelector('.lumiphone-homebar button').click()
;[...dockRoot.querySelectorAll('.lp-app-icon')].find(node => node.getAttribute('aria-label') === 'Contacts').click()
;[...dockRoot.querySelectorAll('.lp-nav-action')].find(node => node.textContent === 'Add').click()
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Generate NPC').click()
backendReceiver({ type: 'lumiphone:contact_draft', requestId: 'draft-with-photo', draft: { ...draftOne, name: 'Portrait Draft' } })
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Generate portrait').click()
dockRoot.querySelector('form.lp-camera-body').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
const draftPortraitRequest = frontendSends.filter(message => message.type === 'lumiphone:camera_generate').at(-1)
assert.equal(draftPortraitRequest.purpose, 'draft')
assert.equal(draftPortraitRequest.contactId, undefined)
backendReceiver({ type: 'lumiphone:camera_done', requestId: draftPortraitRequest.requestId, imageId: 'draft-photo', imageUrl: '/api/v1/images/draft-photo' })
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Use photo').click()
await new Promise(resolve => setTimeout(resolve, 0))
const avatarUpload = frontendSends.filter(message => message.type === 'lumiphone:upload_avatar').at(-1)
assert.ok(avatarUpload.croppedDataUrl.startsWith('data:image/png'))
backendReceiver({ type: 'lumiphone:avatar_uploaded', requestId: avatarUpload.requestId, imageId: 'framed-draft', imageUrl: '/api/v1/images/framed-draft' })
assert.ok(dockRoot.querySelector('.lp-draft-portrait'))
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Use Portrait Draft').click()
const withPhoto = frontendSends.filter(message => message.type === 'lumiphone:save_contact').at(-1).contact
assert.deepEqual(withPhoto.avatarSource, { kind: 'asset', assetId: 'framed-draft' })
assert.equal(withPhoto.avatarOverrideUrl, '/api/v1/images/framed-draft')
assert.deepEqual([...dockRoot.querySelectorAll('.lp-npc-portrait-actions button')].map(node => node.textContent), ['Gallery', 'Upload avatar', 'Retake portrait'])
uploadFiles = [{ bytes: new Uint8Array([1, 2, 3]), mimeType: 'image/png', name: 'npc.png' }]
;[...dockRoot.querySelectorAll('.lp-npc-portrait-actions button')].find(node => node.textContent === 'Upload avatar').click()
await new Promise(resolve => setTimeout(resolve, 20))
assert.match(dockRoot.textContent, /Uploaded photo ready/)
dockRoot.querySelector('.lp-camera-accept').click()
await new Promise(resolve => setTimeout(resolve, 0))
const draftFileUpload = frontendSends.findLast(message => message.type === 'lumiphone:upload_avatar')
assert.notEqual(draftFileUpload.requestId, avatarUpload.requestId)
backendReceiver({ type: 'lumiphone:avatar_uploaded', requestId: draftFileUpload.requestId, imageId: 'uploaded-draft', imageUrl: '/api/v1/images/uploaded-draft' })
uploadFiles = []
;[...dockRoot.querySelectorAll('.lp-npc-portrait-actions button')].find(node => node.textContent === 'Gallery').click()
requestedPage = frontendSends.findLast(entry => entry.type === 'lumiphone:gallery_list'); showGalleryPage(requestedPage)
dockRoot.querySelector('.lp-gallery-item').click()
const draftGalleryModal = shownModals.at(-1)
;[...draftGalleryModal.root.querySelectorAll('button')].find(node => node.textContent === 'Use for Portrait Draft').click()
assert.equal(draftGalleryModal.dismissed, true)
assert.ok(dockRoot.querySelector('.lp-npc-portrait-actions'), 'Gallery selection returns to the unsaved NPC preview')
dockRoot.querySelector('.lp-alert').hidden = true
await exportVisual('npc-draft-portrait', dockRoot)
;[...dockRoot.querySelectorAll('button')].find(node => node.textContent === 'Use Portrait Draft').click()
assert.deepEqual(frontendSends.findLast(entry => entry.type === 'lumiphone:save_contact').contact.avatarSource, { kind: 'gallery', imageId: 'paged-0' })

frontendContext.components.mountSelect = (target, options) => {
  assert.equal(target.isConnected, true)
  assert.equal(options.portal, false, 'setup connection list stays inside the modal stacking context')
  target.dataset.selectMounted = 'true'
  return { getValue: () => options.value, update: () => {}, destroy: () => {} }
}
const beforeGreetingSetupCount = shownModals.length
const originalLatestMessageId = frontendContext.messages.getLatestMessageId
frontendContext.messages.getLatestMessageId = () => null
backendReceiver({ ...savedDraftState, reason: 'chat_switched', state: { ...savedDraftState.state, setup: { ...savedDraftState.state.setup, initialized: false, dismissed: false, authorship: 'roleplay' } } })
assert.equal(shownModals.length, beforeGreetingSetupCount, 'setup must not cover an empty chat still choosing its greeting')
frontendContext.messages.getLatestMessageId = originalLatestMessageId
backendReceiver({ ...savedDraftState, reason: 'chat_switched', state: { ...savedDraftState.state, setup: { ...savedDraftState.state.setup, initialized: false, dismissed: false, authorship: 'roleplay' } } })
assert.equal(shownModals.length, beforeGreetingSetupCount, 'greeting arrival must never automatically open setup')
dockRoot.querySelector('[aria-label="Home or dismiss phone"]').click()
const setupPrompt = dockRoot.querySelector('.lp-home-setup')
assert.ok(setupPrompt, 'unconfigured phones offer setup inside the phone')
;[...setupPrompt.querySelectorAll('button')].find(node => node.textContent === 'Skip').click()
assert.equal(frontendSends.at(-1).type, 'lumiphone:dismiss_setup')
assert.equal(shownModals.length, beforeGreetingSetupCount, 'Skip must not open a modal')
backendReceiver({ ...savedDraftState, reason: 'refresh', state: { ...savedDraftState.state, setup: { ...savedDraftState.state.setup, initialized: false, dismissed: false, authorship: 'roleplay' } } })
;[...dockRoot.querySelectorAll('.lp-home-setup button')].find(node => node.textContent === 'Run setup').click()
assert.equal(shownModals.length, beforeGreetingSetupCount + 1, 'only Run setup opens the modal')
document.body.append(shownModals.at(-1).root)
const setupAuthorship = shownModals.at(-1).root.querySelector('input[type="radio"][value="roleplay"]')
assert.ok(setupAuthorship, 'authorship choice must appear in first-run setup')
assert.equal(setupAuthorship.value, 'roleplay')
const impersonationChoice = shownModals.at(-1).root.querySelector('input[type="radio"][value="impersonation"]')
impersonationChoice.click()
assert.equal(frontendSends.at(-1).type, 'lumiphone:set_authorship')
assert.equal(frontendSends.at(-1).authorship, 'impersonation')
const setupRoot = shownModals.at(-1).root
assert.equal(setupRoot.querySelectorAll('[data-setup-stage]').length, 4)
assert.match(setupRoot.querySelector('.lp-setup-footer').textContent, /Start Pocket/)
document.body.append(setupRoot)
const setupSource = setupRoot.querySelector('[aria-label="Pocket generation source"]')
setupSource.value = 'sidecar'; setupSource.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
await new Promise(resolve => setTimeout(resolve, 0))
assert.equal(setupRoot.querySelector('.lp-setup-generation [data-model-picker-mounted]').dataset.modelPickerMounted, 'true', 'setup mounts the native picker after joining its modal')
assert.ok(setupRoot.querySelector('[data-select-mounted]'))
const exportSetupPreview = async (filename) => {
  if (!process.env.POCKET_SETUP_PREVIEW) return
  const preview = setupRoot.cloneNode(true)
  const liveFields = [...setupRoot.querySelectorAll('input,select,textarea')]
  ;[...preview.querySelectorAll('input,select,textarea')].forEach((field, index) => {
    const live = liveFields[index]
    if (field.tagName === 'INPUT') { field.setAttribute('value', live.value); field.toggleAttribute('checked', live.checked) }
    else if (field.tagName === 'TEXTAREA') field.textContent = live.value
    else [...field.options].forEach((option, i) => option.toggleAttribute('selected', live.options[i].selected))
  })
  for (const model of preview.querySelectorAll('[data-model-picker-mounted]')) { const input = document.createElement('input'); input.className = 'lp-input'; input.placeholder = 'Use connection model'; input.setAttribute('aria-label', 'Model'); model.append(input) }
  await writeFile(filename, '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#151318;color:#eee;padding:24px;--lumiverse-primary:#d7a978}.preview{max-width:580px;margin:auto}'+frontendStyles.join('\n')+'</style><main class="preview">'+preview.innerHTML+'</main>')
}
await exportSetupPreview(process.env.POCKET_SETUP_PREVIEW)
;[...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Customize').click()
await exportSetupPreview(process.env.POCKET_SETUP_PREVIEW?.replace('.html', '-persona.html'))
const originalEnrich = [...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Enrich with LLM')
originalEnrich.click()
const enrichRequest = frontendSends.at(-1).requestId
const profileInput = setupRoot.querySelector('textarea')
profileInput.value = 'Unsaved profile details'
backendReceiver({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId: enrichRequest, phase: 'thinking', message: 'Thinking…' })
assert.match(setupRoot.textContent, /Thinking…/)
backendReceiver({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId: enrichRequest, phase: 'error', message: 'Provider unavailable' })
assert.equal(originalEnrich.disabled, false, 'failed enrichment must immediately unlock retry')
assert.equal(profileInput.value, 'Unsaved profile details', 'progress updates must preserve unsaved profile fields')
assert.match(setupRoot.textContent, /Provider unavailable/, 'setup must show the actual enrichment error')
backendReceiver({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId: enrichRequest, phase: 'thinking', message: 'Late thinking…' })
assert.equal(originalEnrich.disabled, false, 'late progress cannot revive a failed request')
originalEnrich.click()
const retryEnrichRequest = frontendSends.at(-1).requestId
backendReceiver({ type: 'lumiphone:pocket_persona_preview', requestId: retryEnrichRequest, persona: { ...savedDraftState.state.pocketPersona, displayName: 'Enriched owner' } })
backendReceiver({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId: retryEnrichRequest, phase: 'complete', message: 'Phone profile ready' })
assert.equal([...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Enrich with LLM').disabled, false, 'successful enrichment must return its action to idle')
;[...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Enrich with LLM').click()
const stoppedRequest = frontendSends.at(-1).requestId
;[...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Stop enrichment').click()
assert.equal(frontendSends.at(-1).type, 'lumiphone:cancel_persona_generation')
assert.equal(frontendSends.at(-1).operationRequestId, stoppedRequest)
assert.equal(setupRoot.querySelector('[data-operation-stop]'), null, 'Stop immediately removes the active cancellation control')
assert.equal(setupRoot.querySelector('.lp-operation-progress .lp-indeterminate'), null, 'stopped enrichment has no animated progress bar')
backendReceiver({ type: 'lumiphone:pocket_persona_preview', requestId: stoppedRequest, persona: { ...savedDraftState.state.pocketPersona, displayName: 'Cancelled result' } })
assert.doesNotMatch(setupRoot.textContent, /Cancelled result/)
;[...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Retry enrichment').click()
const abandonedRequest = frontendSends.at(-1).requestId
assert.equal(setupRoot.querySelectorAll('.lp-operation-progress').length, 1, 'retry replaces stopped status rather than stacking status boxes')
;[...setupRoot.querySelectorAll('button')].find(node => node.textContent === '← Back to setup').click()
backendReceiver({ type: 'lumiphone:error', requestId: abandonedRequest, error: 'Failed while away' })
backendReceiver({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId: abandonedRequest, phase: 'writing', message: 'Late writing…' })
;[...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Customize').click()
assert.equal([...setupRoot.querySelectorAll('button')].find(node => node.textContent === 'Enrich with LLM').disabled, false, 'errors while away release enrichment on reentry')

const libraryDraft = setupRoot.querySelector('textarea')
libraryDraft.value = 'Keep my unsaved identity details'
const librarySave = setupRoot.querySelector('[data-identity-save]')
librarySave.click()
assert.equal(frontendSends.at(-1).type, 'lumiphone:identity_profile_save')
assert.ok(Object.values(frontendSends.at(-1).profile.phoneProfile).includes('Keep my unsaved identity details'), 'save library reads the current draft')
backendReceiver({ type: 'lumiphone:identity_profile_saved', requestId: frontendSends.at(-1).requestId })
assert.equal(libraryDraft.value, 'Keep my unsaved identity details', 'saving a reusable profile preserves unsaved editor fields')
assert.equal(librarySave.disabled, false)

await frontendHandler({ type: 'lumiphone:get_state', chatId: 'profile-source-chat', characterId: 'char-a' }, 'user-a')
const profileSourceState = frontendMessages.filter(event => event.type === 'lumiphone:state' && event.state.chatId === 'profile-source-chat').at(-1).state
const characterProfileContact = profileSourceState.contacts.find(entry => entry.source.kind === 'character' && entry.source.characterId === 'char-a')
await frontendHandler({ type: 'lumiphone:identity_profile_save', chatId: 'profile-source-chat', characterId: 'char-a', kind: 'persona', profile: { name: 'Reusable owner', pronouns: 'they', role: 'Hero', identityBrief: 'Stable brief', phoneProfile: { personality: 'Practical', appearance: 'Blond', textingStyle: 'Short messages' } } }, 'user-a')
await frontendHandler({ type: 'lumiphone:identity_profile_save', chatId: 'profile-source-chat', characterId: 'char-a', kind: 'character', contactId: characterProfileContact.id, profile: { name: 'Reusable character', role: 'Hero', identityBrief: 'Stable character', phoneProfile: { personality: 'Patient', appearance: 'Tall', textingStyle: 'Precise' } } }, 'user-a')
assert.equal(storage.get('identity-profiles.json').entries.length, 2)
await frontendHandler({ type: 'lumiphone:get_state', chatId: 'profile-new-chat', characterId: 'char-a' }, 'user-a')
const restoredProfiles = frontendMessages.filter(event => event.type === 'lumiphone:state' && event.state.chatId === 'profile-new-chat').at(-1).state
assert.equal(restoredProfiles.pocketPersona.phoneProfile.textingStyle, 'Short messages')
assert.equal(restoredProfiles.setup.personaConfigured, true)
assert.equal(restoredProfiles.contacts.find(entry => entry.source.kind === 'character').phoneProfile.textingStyle, 'Precise')
assert.equal(restoredProfiles.conversations.flatMap(entry => entry.messages).length, 0, 'profile reuse must never copy old phone messages')
assert.equal(restoredProfiles.contacts.find(entry => entry.source.kind === 'character').presence.inScene, false, 'profile reuse never imports scene presence')

// A slow provider may finish after cancellation; its result must never become a preview.
const priorQuiet = spindle.generate.quiet
let releasePersona, startPersona
const personaStarted = new Promise(resolve => { startPersona = resolve })
let personaSignal
spindle.generate.quiet = async request => {
  personaSignal = request.signal; startPersona()
  await new Promise(resolve => { releasePersona = resolve })
  return { content: '{"displayName":"Late cancelled profile"}', finish_reason: 'stop' }
}
try {
  const pendingPersona = frontendHandler({ type: 'lumiphone:generate_pocket_persona', requestId: 'cancel-profile-test', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
  await personaStarted
  await frontendHandler({ type: 'lumiphone:cancel_persona_generation', requestId: 'wrong-owner', operationRequestId: 'cancel-profile-test', chatId: 'chat-a', characterId: 'char-a' }, 'user-b')
  assert.equal(personaSignal.aborted, false, 'another user cannot stop this enrichment')
  await frontendHandler({ type: 'lumiphone:cancel_persona_generation', requestId: 'stop-profile', operationRequestId: 'cancel-profile-test', chatId: 'chat-a', characterId: 'char-a' }, 'user-a')
  assert.equal(personaSignal.aborted, true, 'Stop reaches the provider request')
  releasePersona(); await pendingPersona
  assert.equal(frontendMessages.some(event => event.type === 'lumiphone:pocket_persona_preview' && event.requestId === 'cancel-profile-test'), false, 'cancelled provider results must be discarded')
} finally { spindle.generate.quiet = priorQuiet }
cleanup()

const appQuiet = spindle.generate.quiet, appMessages = spindle.chat.getMessages
try {
  spindle.generate.quiet = async () => ({ content: JSON.stringify({ days: Array.from({ length: 7 }, () => ({ condition: 'Rain', high: 24, low: 14, details: 'Bring an umbrella.' })) }), finish_reason: 'stop' })
  await frontendHandler({ type: 'lumiphone:weather_week', requestId: 'weather-week-test', chatId: 'profile-new-chat', characterId: 'char-a' }, 'user-a')
  const weekState = frontendMessages.filter(event => event.type === 'lumiphone:state' && event.reason === 'weather-week').at(-1).state
  assert.equal(weekState.weather.outlook.days.length, 7)
  assert.equal(weekState.weather.outlook.days[0].condition, weekState.weather.condition, 'forecast preserves established today')
  await frontendHandler({ type: 'lumiphone:action', chatId: 'profile-new-chat', characterId: 'char-a', action: 'event', payload: { title: 'Breakfast', description: 'Planned breakfast.', start: weekState.roleplayNow, end: weekState.roleplayNow } }, 'user-a')
  const eventState = frontendMessages.filter(event => event.type === 'lumiphone:state' && event.state.chatId === 'profile-new-chat').at(-1).state
  const breakfast = eventState.events.find(event => event.title === 'Breakfast')
  spindle.chat.getMessages = async () => [{ role: 'assistant', content: 'They finished breakfast and cleared the plates.' }]
  spindle.generate.quiet = async () => ({ content: JSON.stringify({ events: [{ id: breakfast.id, description: 'Breakfast finished together; the plates are cleared.', completed: true, evidence: 'They finished breakfast and cleared the plates.' }] }), finish_reason: 'stop' })
  await frontendHandler({ type: 'lumiphone:timeline_review', requestId: 'timeline-review-test', chatId: 'profile-new-chat', characterId: 'char-a' }, 'user-a')
  const reviewed = frontendMessages.filter(event => event.type === 'lumiphone:state' && event.reason === 'timeline-review').at(-1).state.events.find(event => event.id === breakfast.id)
  assert.equal(reviewed.completed, true); assert.match(reviewed.description, /plates/)
  let releaseWeek, startWeek
  const weekStarted = new Promise(resolve => { startWeek = resolve })
  spindle.generate.quiet = async () => { startWeek(); await new Promise(resolve => { releaseWeek = resolve }); return { content: JSON.stringify({ days: [] }), finish_reason: 'stop' } }
  const pendingWeek = frontendHandler({ type: 'lumiphone:weather_week', requestId: 'cancel-week-test', chatId: 'profile-new-chat', characterId: 'char-a' }, 'user-a')
  await weekStarted
  await frontendHandler({ type: 'lumiphone:cancel_app_review', operationRequestId: 'cancel-week-test', chatId: 'profile-new-chat', characterId: 'char-a' }, 'user-a')
  releaseWeek(); await pendingWeek
  assert.equal(frontendMessages.some(event => event.type === 'lumiphone:operation_progress' && event.requestId === 'cancel-week-test' && event.phase === 'complete'), false, 'cancelled forecast never completes')
} finally { spindle.generate.quiet = appQuiet; spindle.chat.getMessages = appMessages }

// Direct reply generation must preserve voice format and respect the opt-out.
const voicePreferencesBefore = structuredClone(storage.get('device/preferences.json'))
const quietBeforeVoice = spindle.generate.quiet
try {
  await frontendHandler({ type: 'lumiphone:get_state', chatId: 'voice-contract', characterId: 'char-a' }, 'user-a')
  await frontendHandler({ type: 'lumiphone:save_preferences', preferences: { ...voicePreferencesBefore, voiceMessages: true, generationMode: 'roleplay', autoReplyAfterSend: false } }, 'user-a')
  await backendEvents.get('TOOL_INVOCATION')({ toolName: 'phone_action', requestId: 'voice-dm-seed', args: { action: 'message', chat_id: 'voice-contract', character_id: 'char-a', payload: { senderContactId: 'char-a', text: 'An opening voice message', format: 'voice' } } }, 'user-a')
  const voiceConversationId = storage.get('phones/voice-contract__char-a.json').conversations[0].id
  spindle.generate.quiet = async () => ({ content: JSON.stringify({ message: 'Here is my spoken reply.', format: 'voice', after: { state: 'remote' } }) })
  await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'voice-dm-reply', chatId: 'voice-contract', characterId: 'char-a', conversationId: voiceConversationId }, 'user-a')
  assert.equal(storage.get('phones/voice-contract__char-a.json').conversations[0].messages.at(-1).format, 'voice', 'generated direct replies must retain voice format')
  await frontendHandler({ type: 'lumiphone:save_preferences', preferences: { ...voicePreferencesBefore, voiceMessages: false, generationMode: 'roleplay', autoReplyAfterSend: false } }, 'user-a')
  await frontendHandler({ type: 'lumiphone:generate_message', requestId: 'voice-dm-disabled', chatId: 'voice-contract', characterId: 'char-a', conversationId: voiceConversationId }, 'user-a')
  assert.equal(storage.get('phones/voice-contract__char-a.json').conversations[0].messages.at(-1).format, undefined, 'disabled voice generation must normalize model voice output to text')
} finally {
  spindle.generate.quiet = quietBeforeVoice
  await frontendHandler({ type: 'lumiphone:save_preferences', preferences: voicePreferencesBefore }, 'user-a')
}

console.log('Pocket contracts passed.')
