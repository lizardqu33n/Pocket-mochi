import { test, expect } from 'bun:test'
import { MochiService, type MochiHost } from '../src/mochi/service.js'
import { normalizePocketRoute } from '../src/domain/navigation.js'
import { PocketRouteHistory } from '../src/frontend/router.js'
import { MochiView } from '../src/mochi/view.js'
import { JSDOM } from 'jsdom'
import { buildMochiPrompt } from '../src/mochi/generation.js'
import { defaultMochiSettings } from '../src/mochi/types.js'

function fixture() {
  const files = new Map<string, unknown>(), writes: string[] = [], responses: any[] = []
  let counter = 0, failWrite = false, failMove = false
  const personas = new Map([['alice:p1', { id: 'p1', name: 'Stable Alice', description: 'A room identity.' }], ['bob:p2', { id: 'p2', name: 'Bob' }]])
  const host: MochiHost = {
    userStorage: {
      exists: async (path, user) => files.has(`${user}:${path}`),
      getJson: async (path, options) => {
        const key = `${options.userId}:${path}`
        if (!files.has(key)) { if ('fallback' in options) return options.fallback; throw new Error('Missing file') }
        return structuredClone(files.get(key))
      },
      setJson: async (path, data, options) => { if (failWrite) throw new Error('Disk write failed'); writes.push(path); files.set(`${options.userId}:${path}`, structuredClone(data)) },
      move: async (from, to, user) => { if (failMove) throw new Error('Rename failed'); files.set(`${user}:${to}`, files.get(`${user}:${from}`)); files.delete(`${user}:${from}`) },
      list: async (prefix, user) => [...files.keys()].filter(key => key.startsWith(`${user}:${prefix}`)).map(key => key.slice(`${user}:${prefix}`.length)),
    },
    characters: {
      get: async (id, user) => id === (user === 'alice' ? 'c1' : 'c2') ? { id, name: 'Character' } : null,
      list: async ({ userId }) => ({ data: [{ id: userId === 'alice' ? 'c1' : 'c2', name: 'Character' }] }),
    },
    personas: { get: async (id, user) => personas.get(`${user}:${id}`) || null, list: async ({ userId }) => ({ data: [...personas.entries()].filter(([key]) => key.startsWith(userId + ':')).map(([, value]) => value) }) },
    permissions: { has: () => true },
    sendToFrontend: (payload, user) => responses.push({ payload, user }),
  }
  const service = new MochiService(host, () => `room_${(++counter).toString(16).padStart(32, '0')}`)
  const input = { title: 'My room', characterIds: ['c1'], persona: { source: 'lumiverse', sourceId: 'p1' } }
  return { service, host, files, writes, responses, personas, input, failWrite: () => { failWrite = true }, failMove: () => { failMove = true } }
}

function messagingFixture() {
  const f = fixture(), requests: any[] = []
  f.host.connections = { get: async (id, user) => id === 'conn1' && user === 'alice' ? { id, model: 'test-model' } : null, list: async user => user === 'alice' ? [{ id: 'conn1', name: 'Test', model: 'test-model' }] : [] }
  f.host.tokens = { countMessages: async (messages, options) => { expect(options.userId).toBe('alice'); return { total_tokens: Math.ceil(JSON.stringify(messages).length / 4) } } }
  f.host.generate = { quiet: async request => { requests.push(request); return { content: JSON.stringify({ speakerId: 'c1', text: 'Character reply' }) } } }
  const create = async (settings: any = {}) => {
    const room = await f.service.create('alice', f.input)
    return f.service.update('alice', { ...f.input, roomId: room.id, revision: room.revision, settings: { ...defaultMochiSettings(), connectionId: 'conn1', ...settings } })
  }
  return { ...f, requests, create }
}
test('user send and direct reply persist independently; duplicate receipts survive restarts', async () => {
  const f = messagingFixture(), room = await f.create()
  const input = { roomId: room.id, revision: room.revision, requestId: 'send_one', content: 'Hello', responder: 'auto', chatId: 'native-secret' }
  f.personas.set('alice:p1', { id: 'p1', name: 'Different live persona', description: 'Other RP identity' })
  await f.service.message('alice', input)
  let saved = await f.service.read('alice', room.id)
  expect(saved.messages).toHaveLength(2)
  expect((saved.messages[0] as any).role).toBe('user')
  expect((saved.messages[1] as any).content).toBe('Character reply')
  expect(f.requests[0].connection_id).toBe('conn1')
  expect(JSON.stringify(f.requests[0].messages)).not.toContain('native-secret')
  expect(JSON.stringify(f.requests[0].messages)).toContain('Stable Alice')
  expect(JSON.stringify(f.requests[0].messages)).not.toContain('Different live persona')
  await new MochiService(f.host).message('alice', input)
  saved = await f.service.read('alice', room.id)
  expect(saved.messages).toHaveLength(2)
  expect(f.requests).toHaveLength(1)
})
test('automatic replies can be disabled; empty continuation creates only a character message', async () => {
  const f = messagingFixture(), room = await f.create({ autoReply: false })
  await f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'manual_send', content: 'Keep this' })
  let saved = await f.service.read('alice', room.id)
  expect(saved.messages).toHaveLength(1)
  expect(f.requests).toHaveLength(0)
  await f.service.message('alice', { roomId: room.id, revision: saved.revision, requestId: 'empty_continue', content: '   ' })
  saved = await f.service.read('alice', room.id)
  expect(saved.messages).toHaveLength(2)
  expect((saved.messages[1] as any).role).toBe('assistant')
})
test('group auto-selection and manual selection enforce current membership and room names/portraits', async () => {
  const f = messagingFixture()
  const original = f.host.characters.get
  f.host.characters.get = async (id, user) => user === 'alice' && id === 'c3' ? { id, name: 'Third', image_id: 'portrait3', personality: 'Kind' } : original(id, user)
  let room = await f.create({ characterNames: { c1: 'Room Alice', c3: 'Room Third' } })
  room = await f.service.update('alice', { ...f.input, roomId: room.id, revision: room.revision, characterIds: ['c1', 'c3'], settings: { ...room.settings, characterNames: { c1: 'Room Alice', c3: 'Room Third' } } })
  f.host.generate!.quiet = async request => { f.requests.push(request); return { content: '{"speakerId":"c3","text":"Group response"}' } }
  await f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'group_auto', content: '' })
  let saved = await f.service.read('alice', room.id)
  expect((saved.messages[0] as any).name).toBe('Room Third')
  expect((saved.messages[0] as any).avatarUrl).toBe('/api/v1/images/portrait3')
  expect(JSON.stringify(f.requests[0].messages)).toContain('Room Alice')
  await f.service.message('alice', { roomId: room.id, revision: saved.revision, requestId: 'group_manual', content: '', responder: 'c3' })
  saved = await f.service.read('alice', room.id)
  await expect(f.service.message('alice', { roomId: room.id, revision: saved.revision, requestId: 'bad_speaker', content: '', responder: 'c2' })).rejects.toThrow('not in')
  await expect(f.service.message('alice', { roomId: room.id, revision: saved.revision, requestId: 'wrong_model_speaker', content: '', responder: 'c1' })).rejects.toThrow('invalid responder')
  expect((await f.service.read('alice', room.id)).messages).toHaveLength(2)
})
test('token trimming preserves stored history and newest turn; oversize prompts never reach provider', async () => {
  const f = messagingFixture(), room = await f.create({ contextTokens: 2048, outputTokens: 128 })
  const messages = Array.from({ length: 20 }, (_, i) => ({ id: String(i), role: 'user', content: 'a'.repeat(700), name: 'Stable Alice', createdAt: new Date().toISOString(), avatarUrl: '', requestId: 'history' }))
  f.files.set(`alice:mochi/v1/rooms/${room.id}.json`, { ...room, messages })
  await f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'trim_request', content: '' })
  expect((await f.service.read('alice', room.id)).messages).toHaveLength(21)
  expect(f.requests[0].messages.length).toBeLessThan(22)
  expect(f.requests[0].messages.at(-2).content).toContain(messages[19].content)
  const oversized = { ...room, messages: [messages[0]], persona: { ...room.persona, description: 'z'.repeat(12000) } }
  await expect(buildMochiPrompt(oversized, [{ id: 'c1' }], 'c1', async m => JSON.stringify(m).length, new AbortController().signal)).rejects.toThrow('budget')
  expect(oversized.messages).toHaveLength(1)
})
test('cancel discards providers that ignore abort and prevents overlaps until they settle', async () => {
  const f = messagingFixture(), room = await f.create()
  let release!: (value: any) => void, started!: () => void
  const ready = new Promise<void>(resolve => { started = resolve })
  f.host.generate!.quiet = request => { f.requests.push(request); started(); return new Promise(resolve => { release = resolve }) }
  const running = f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'running', content: 'One' })
  const observed = running.catch(error => error)
  await ready
  await expect(f.service.cancel('bob', room.id, 'running')).rejects.toThrow('account')
  await f.service.cancel('alice', room.id, 'wrong_request')
  expect(f.requests[0].signal.aborted).toBe(false)
  await f.service.cancel('alice', room.id, 'running')
  expect(f.requests[0].signal.aborted).toBe(true)
  await expect(f.service.message('alice', { roomId: room.id, revision: room.revision + 1, requestId: 'overlap', content: 'Two' })).rejects.toThrow('already running')
  release({ content: '{"speakerId":"c1","text":"Late reply"}' }); await observed
  expect((await f.service.read('alice', room.id)).messages).toHaveLength(1)
  expect((await f.service.state('alice')).jobs).toEqual({})
})
test('settings changes and deleted room files discard stale generation output', async () => {
  for (const mutation of ['settings', 'delete']) {
    const f = messagingFixture(), room = await f.create()
    let release!: (value: any) => void, started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    f.host.generate!.quiet = () => { started(); return new Promise(resolve => { release = resolve }) }
    const result = f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'stale_request', content: '' }).catch(error => error)
    await ready
    if (mutation === 'delete') f.files.delete(`alice:mochi/v1/rooms/${room.id}.json`)
    else { const saved = await f.service.read('alice', room.id); await f.service.update('alice', { ...f.input, roomId: room.id, revision: saved.revision, title: 'Changed' }) }
    release({ content: '{"speakerId":"c1","text":"Late"}' }); await result
    if (mutation === 'settings') expect((await f.service.read('alice', room.id)).messages).toHaveLength(0)
    else expect((await f.service.state('alice')).rooms).toHaveLength(0)
  }
})
test('foreign connections and deleted source personas fail without losing accepted user messages', async () => {
  const f = messagingFixture(), room = await f.create()
  await expect(f.service.update('alice', { ...f.input, roomId: room.id, revision: room.revision, settings: { ...room.settings, connectionId: 'foreign' } })).rejects.toThrow('account')
  f.personas.delete('alice:p1')
  await expect(f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'deleted_persona', content: 'Preserve my send' })).rejects.toThrow('persona')
  expect((await f.service.read('alice', room.id)).messages).toHaveLength(1)
  expect(f.requests).toHaveLength(0)
})
test('malformed replies and unavailable tokenizer fail safely without appending AI output', async () => {
  for (const failure of ['json', 'tokens']) {
    const f = messagingFixture(), room = await f.create()
    if (failure === 'json') f.host.generate!.quiet = async () => ({ content: 'invalid JSON' })
    else f.host.tokens = undefined
    await expect(f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'bad_result', content: 'Keep my message' })).rejects.toThrow()
    expect((await f.service.read('alice', room.id)).messages).toHaveLength(1)
    expect((await f.service.state('alice')).jobs).toEqual({})
  }
})
test('persona ownership is rechecked before committing a delayed result', async () => {
  const f = messagingFixture(), room = await f.create()
  let release!: (value: any) => void, started!: () => void
  const ready = new Promise<void>(resolve => { started = resolve })
  f.host.generate!.quiet = () => { started(); return new Promise(resolve => { release = resolve }) }
  const result = f.service.message('alice', { roomId: room.id, revision: room.revision, requestId: 'revoked', content: '' }).catch(error => error)
  await ready; f.personas.delete('alice:p1')
  release({ content: '{"speakerId":"c1","text":"Reject this"}' }); await result
  expect((await f.service.read('alice', room.id)).messages).toHaveLength(0)
})
test('settings drafts retain their original revision after refresh; stale errors cannot change another room', async () => {
  const dom = new JSDOM('<!doctype html><body></body>'), previous = globalThis.document
  globalThis.document = dom.window.document
  try {
    const f = messagingFixture(), room = await f.create(), sent: any[] = []
    const view = new MochiView(p => sent.push(p), () => {}, () => {})
    view.load(); view.receive({ type: 'mochi:state', requestId: sent.at(-1).requestId, state: await f.service.state('alice') })
    view.select(room.id); view.editing = true; view.render()
    view.load(); const refreshId = sent.at(-1).requestId
    view.receive({ type: 'mochi:state', requestId: refreshId, state: { ...await f.service.state('alice'), rooms: [{ ...room, revision: room.revision + 1 }] } })
    const form = view.render().querySelector('form')!
    form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }))
    expect(sent.at(-1).revision).toBe(room.revision)
    const requestId = sent.at(-1).requestId
    view.select('room_' + 'b'.repeat(32))
    view.receive({ type: 'mochi:error', requestId, message: 'Old room error' })
    expect(view.error).toBe('')
    expect(view.roomId).toBe('room_' + 'b'.repeat(32))
    view.destroy()
  } finally { globalThis.document = previous; dom.window.close() }
})

test('room files persist across service restart and active RP/persona changes without touching phones', async () => {
  const f = fixture()
  f.files.set('alice:phones/chat__character.json', { original: true })
  const room = await f.service.create('alice', { ...f.input, chatId: 'rp-first', history: ['native private history'] })
  f.personas.set('alice:p1', { id: 'p1', name: 'Changed active persona', description: 'different' })
  const restarted = new MochiService(f.host)
  await restarted.handle({ type: 'mochi:list', chatId: 'rp-second', characterId: 'other', requestId: 'later' }, 'alice')
  const saved = (await restarted.state('alice')).rooms[0]
  expect(saved.id).toBe(room.id)
  expect(saved.persona.name).toBe('Stable Alice')
  expect(saved.persona.description).toBe('A room identity.')
  expect(saved.messages).toEqual([])
  expect(f.files.get('alice:phones/chat__character.json')).toEqual({ original: true })
  expect(f.writes.every(path => path.startsWith('mochi/v1/rooms/'))).toBe(true)
})
test('accounts cannot list, read, or update each other’s rooms; payload userId cannot override callback', async () => {
  const f = fixture(), room = await f.service.create('alice', f.input)
  expect((await f.service.state('bob')).rooms).toEqual([])
  await expect(f.service.read('bob', room.id)).rejects.toThrow('account')
  await expect(f.service.update('bob', { ...f.input, roomId: room.id, revision: 1 })).rejects.toThrow('account')
  await f.service.handle({ type: 'mochi:list', userId: 'alice' }, 'bob')
  expect(f.responses.at(-1).user).toBe('bob')
  expect(f.responses.at(-1).payload.state.rooms).toEqual([])
  await f.service.handle({ type: 'mochi:create', ...f.input })
  expect(f.responses).toHaveLength(1)
})
test('malformed storage identifiers and foreign character/persona references are rejected', async () => {
  const f = fixture()
  for (const id of ['../phones/private', 'room_x', 'room_' + 'a'.repeat(32) + '/x', 'room_' + 'a'.repeat(33)]) await expect(f.service.read('alice', id)).rejects.toThrow('identifier')
  await expect(f.service.create('alice', { ...f.input, characterIds: ['c2'] })).rejects.toThrow('account')
  await expect(f.service.create('alice', { ...f.input, characterIds: ['c1', 'c1'] })).rejects.toThrow('once')
  await expect(f.service.create('alice', { ...f.input, persona: { source: 'lumiverse', sourceId: 'p2' } })).rejects.toThrow('account')
  await expect(f.service.create('', f.input)).rejects.toThrow()
  expect(f.writes).toEqual([])
})
test('simultaneous updates reject stale revisions and retain all message data and future fields', async () => {
  const f = fixture(), room = await f.service.create('alice', f.input)
  const key = `alice:mochi/v1/rooms/${room.id}.json`
  f.files.set(key, { ...room, messages: [{ content: 'Keep complete history' }], futureField: 'preserved' })
  const results = await Promise.allSettled(['One', 'Two'].map(title => f.service.update('alice', { roomId: room.id, revision: 1, title, characterIds: ['c1'] })))
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1)
  expect(results.filter(r => r.status === 'rejected')).toHaveLength(1)
  const saved: any = await f.service.read('alice', room.id)
  expect(saved.revision).toBe(2)
  expect(saved.messages).toEqual([{ content: 'Keep complete history' }])
  expect(saved.futureField).toBe('preserved')
  expect(saved.persona).toEqual(room.persona)
})
test('failed writes and interrupted replacements preserve committed room data', async () => {
  for (const fail of ['failWrite', 'failMove'] as const) {
    const f = fixture(), room = await f.service.create('alice', f.input)
    f[fail]()
    await expect(f.service.update('alice', { roomId: room.id, revision: 1, title: 'Unsafe', characterIds: ['c1'] })).rejects.toThrow()
    expect(await f.service.read('alice', room.id)).toEqual(room)
    expect((await f.service.state('alice')).rooms).toHaveLength(1)
  }
})
test('corrupt and newer room files are reported and never replaced by empty defaults', async () => {
  const f = fixture(), room = await f.service.create('alice', f.input), key = `alice:mochi/v1/rooms/${room.id}.json`
  f.files.set(key, { ...room, version: 9 })
  const state = await f.service.state('alice')
  expect(state.rooms).toEqual([])
  expect(state.warnings).toHaveLength(1)
  await expect(f.service.update('alice', { roomId: room.id, revision: 1, title: 'Oops', characterIds: ['c1'] })).rejects.toThrow('preserved')
  expect((f.files.get(key) as any).version).toBe(9)
})
test('manual identities and owned Pocket profiles are snapshotted, never followed live', async () => {
  const f = fixture()
  f.files.set('alice:identity-profiles.json', { version: 1, entries: [{ id: 'profile1', kind: 'persona', name: 'Pocket identity', identityBrief: 'Original identity' }] })
  const pocket = await f.service.create('alice', { ...f.input, persona: { source: 'pocket', sourceId: 'profile1' } })
  f.files.set('alice:identity-profiles.json', { version: 1, entries: [] })
  expect((await f.service.read('alice', pocket.id)).persona.name).toBe('Pocket identity')
  const manual = await f.service.create('alice', { ...f.input, persona: { source: 'manual', name: 'Custom', description: 'My chosen identity' } })
  expect(manual.persona.sourceId).toBe('')
  await expect(f.service.create('bob', { ...f.input, characterIds: ['c2'], persona: { source: 'pocket', sourceId: 'profile1' } })).rejects.toThrow('account')
})
test('Mochi routing validates room IDs and keeps existing Messages/back/home behavior', () => {
  const id = 'room_' + 'a'.repeat(32), router = new PocketRouteHistory()
  router.navigate({ app: 'messages', conversationId: 'native' })
  router.navigate({ app: 'mochi' }); router.navigate({ app: 'mochi', roomId: id })
  expect(router.back()).toEqual({ app: 'mochi' })
  expect(router.back()).toMatchObject({ app: 'messages', conversationId: 'native' })
  expect(router.home()).toEqual({ app: 'home' })
  expect(normalizePocketRoute({ app: 'mochi', roomId: '../phones/a' })).toEqual({ app: 'mochi' })
})
test('Mochi view retains selected room/persona across unrelated Pocket state events and shows a composer', async () => {
  const dom = new JSDOM('<!doctype html><body></body>')
  const previous = globalThis.document
  globalThis.document = dom.window.document
  try {
    const f = fixture(), room = await f.service.create('alice', f.input), sent: any[] = []
    const view = new MochiView(p => sent.push(p), () => {}, () => {})
    view.load()
    view.receive({ type: 'mochi:state', requestId: sent[0].requestId, state: await f.service.state('alice') })
    view.roomId = room.id
    expect(view.receive({ type: 'lumiphone:state', reason: 'chat_switched', state: { chatId: 'other', pocketPersona: { displayName: 'Other' } } })).toBe(false)
    expect(view.roomId).toBe(room.id)
    const element = view.render()
    expect(element.textContent).toContain('Stable Alice')
    expect(element.querySelectorAll('textarea[aria-label="Message"]').length).toBe(1)
    expect(element.textContent).toContain('Send')
  } finally { globalThis.document = previous; dom.window.close() }
})
