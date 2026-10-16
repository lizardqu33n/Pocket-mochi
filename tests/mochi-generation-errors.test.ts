import { test, expect } from 'bun:test'
import { JSDOM } from 'jsdom'
import { generateMochiReply } from '../src/mochi/generation.js'
import { GENERATION_ERROR_MESSAGES, MochiGenerationError, providerFailure, publicGenerationFailure } from '../src/mochi/generation-errors.js'
import { MochiService, type MochiHost } from '../src/mochi/service.js'
import { defaultMochiSettings } from '../src/mochi/types.js'
import { MochiView } from '../src/mochi/view.js'

// All provider output, accounts and storage in this file are synthetic and in memory.
const secret = 'SYNTHETIC_UNPATTERNED_SECRET_SENTINEL'
function fixture() {
  const files = new Map<string, any>(), events: Array<{ payload: any; user: string }> = [], calls: any[] = []
  const host: MochiHost = {
    userStorage: {
      exists: async (path, user) => files.has(user + ':' + path),
      getJson: async (path, o) => files.has(o.userId + ':' + path) ? structuredClone(files.get(o.userId + ':' + path)) : o.fallback,
      setJson: async (path, value, o) => { files.set(o.userId + ':' + path, structuredClone(value)) },
      move: async (from, to, user) => { files.set(user + ':' + to, files.get(user + ':' + from)); files.delete(user + ':' + from) },
      list: async (prefix, user) => [...files.keys()].filter(k => k.startsWith(user + ':' + prefix)).map(k => k.slice((user + ':' + prefix).length)),
    },
    permissions: { has: () => true },
    characters: {
      get: async (id, user) => [1, 2, 3, 4].some(i => id === user + '_c' + i) ? { id, name: id } : null,
      list: async ({ userId }) => ({ data: [1, 2, 3, 4].map(i => ({ id: userId + '_c' + i, name: 'Synthetic character' })) }),
    },
    personas: { get: async () => null, list: async () => ({ data: [] }) },
    connections: { get: async (id, user) => id === user + '_conn' ? { id, model: 'synthetic' } : null, list: async () => [] },
    tokens: { countMessages: async () => ({ total_tokens: 100 }) },
    generate: { quiet: async request => { calls.push(request); return { content: '{"speakerId":"alice_c1","text":"Valid reply"}' } } },
    sendToFrontend: (payload, user) => { events.push({ payload, user }) },
  }
  const service = new MochiService(host)
  const create = async (user = 'alice', count = 1, accountId?: string) => {
    const input = { accountId, title: 'Synthetic chat', characterIds: Array.from({ length: count }, (_, i) => user + '_c' + (i + 1)), persona: accountId ? undefined : { source: 'manual', name: 'Synthetic user', description: '' } }
    const room = await service.create(user, input)
    return service.update(user, { ...input, roomId: room.id, revision: room.revision, settings: { ...defaultMochiSettings(), responseMode: 'natural', connectionId: user + '_conn' } })
  }
  const output = (content: unknown, metadata: any = {}) => { host.generate!.quiet = async request => { calls.push(request); return { content, ...metadata } } }
  const request = (room: any, requestId: string, extra = {}) => ({ type: 'mochi:send', accountId: room.accountId, roomId: room.id, revision: room.revision, requestId, content: 'Synthetic send', ...extra })
  return { host, files, events, calls, service, create, output, request }
}

test('ordinary JSON and existing single-fence JSON remain valid, with no extra provider call', async () => {
  for (const fenced of [false, true]) {
    const f = fixture(), room = await f.create(), json = '{"speakerId":"alice_c1","text":"  Valid reply  "}'
    f.output(fenced ? '```json\n' + json + '\n```' : json)
    const reply = await generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal)
    expect(reply.text).toBe('Valid reply'); expect(reply.character.id).toBe('alice_c1'); expect(f.calls).toHaveLength(1)
  }
})

test('Natural accepts three eligible distinct speakers and intentional silence with correct attribution', async () => {
  for (const silent of [false, true]) {
    const f = fixture(), room = await f.create('alice', 3)
    f.output(JSON.stringify({ messages: silent ? [] : [1, 2, 3].map(i => ({ speakerId: 'alice_c' + i, text: 'Reply ' + i })) }))
    await f.service.handle(f.request(room, 'natural'), 'alice')
    const saved = await f.service.read('alice', room.id)
    expect(saved.messages).toHaveLength(silent ? 1 : 4)
    expect(saved.messages.slice(1).map((m: any) => [m.characterId, m.content])).toEqual(silent ? [] : [1, 2, 3].map(i => ['alice_c' + i, 'Reply ' + i]))
    expect(saved.notifications).toHaveLength(silent ? 0 : 3); expect(f.calls).toHaveLength(1)
    expect(f.events.filter(e => e.payload.type === 'mochi:error')).toEqual([])
  }
})

test('unreadable output distinguishes malformed JSON, heuristic text, empty and metadata-supported output limit', async () => {
  const cases: Array<[unknown, any, string]> = [
    ['{"speakerId":"alice_c1","text":', {}, 'malformed_json'],
    ['Hello ' + secret, {}, 'ambiguous_response'],
    ['   ', {}, 'empty_output'], [null, {}, 'empty_output'], [undefined, {}, 'empty_output'],
    ['{"text":', { finish_reason: 'length' }, 'output_limit'],
    ['', { finish_reason: 'length' }, 'output_limit'],
    ['{"text":', { finish_reason: 'stop', usage: { completion_tokens: 8192 } }, 'malformed_json'],
    ['{"text":', { finishReason: 'length' }, 'malformed_json'],
  ]
  for (const [content, metadata, category] of cases) {
    const f = fixture(), room = await f.create('alice',2); f.output(content, metadata)
    await f.service.handle(f.request(room, 'invalid'), 'alice')
    const failure = f.events.find(e => e.payload.type === 'mochi:error')!
    expect(failure.user).toBe('alice'); expect(failure.payload.message).toBe(GENERATION_ERROR_MESSAGES[category as keyof typeof GENERATION_ERROR_MESSAGES])
    expect(failure.payload.diagnostic).toEqual({ category, ...(category === 'suspected_plain_text' ? { heuristic: true } : {}), ...(category === 'output_limit' ? { finishReason: 'length' } : {}) })
    expect(JSON.stringify(f.events)).not.toContain(secret); expect(JSON.stringify([...f.files])).not.toContain(secret)
    const saved = await f.service.read('alice', room.id)
    expect(saved.messages).toHaveLength(1); expect(saved.notifications).toEqual([]); expect(f.calls).toHaveLength(1)
    expect((await f.service.state('alice')).jobs).toEqual({})
  }
})

test('complete valid JSON is accepted even when output-limit metadata is present', async () => {
  const f = fixture(), room = await f.create()
  f.output('{"speakerId":"alice_c1","text":"Complete"}', { finish_reason: 'length' })
  expect((await generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal)).text).toBe('Complete')
})

test('schema, duplicate, count, nonempty and size limits reject whole batches; foreign/ineligible speakers are distinct', async () => {
  const row = (speakerId = 'alice_c1', text: any = 'Valid') => ({ speakerId, text })
  const cases: Array<[unknown, string]> = [
    [{}, 'invalid_schema'], [null, 'invalid_schema'], [[], 'invalid_schema'], [true, 'invalid_schema'],
    [{ messages: 'wrong' }, 'invalid_schema'], [{ messages: [null] }, 'invalid_schema'],
    [{ messages: [row(), row()] }, 'invalid_schema'],
    [{ messages: [1, 2, 3, 4].map(i => row('alice_c' + i)) }, 'invalid_schema'],
    [row('alice_c1', ''), 'invalid_schema'], [row('alice_c1', ' '), 'invalid_schema'],
    [row('alice_c1', 12), 'invalid_schema'], [row('alice_c1', 'x'.repeat(32001)), 'invalid_schema'],
    [{ messages: [row(), row('bob_c1', secret)] }, 'ineligible_speaker'],
  ]
  for (const [value, category] of cases) {
    const f = fixture(), room = await f.create('alice', 4); f.output(JSON.stringify(value))
    await f.service.handle(f.request(room, 'schema'), 'alice')
    expect(f.events.find(e => e.payload.type === 'mochi:error')?.payload.diagnostic).toEqual({ category })
    expect((await f.service.read('alice', room.id)).messages).toHaveLength(1)
    expect(JSON.stringify([...f.files])).not.toContain(secret); expect(f.calls).toHaveLength(1)
  }
  const f = fixture(), room = await f.create('alice', 2); f.output(JSON.stringify(row('alice_c2')))
  await expect(generateMochiReply(f.host, room, 'alice', 'alice_c1', new AbortController().signal)).rejects.toThrow(GENERATION_ERROR_MESSAGES.ineligible_speaker)
  await expect(generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal, ['alice_c1'])).rejects.toThrow(GENERATION_ERROR_MESSAGES.ineligible_speaker)
  f.output(JSON.stringify(row('alice_c1', 'x'.repeat(32000))))
  expect((await generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal)).text).toHaveLength(32000)
  f.output('{"messages":[]}')
  await expect(generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal, room.characterIds, false)).rejects.toThrow(GENERATION_ERROR_MESSAGES.invalid_schema)
  f.output({ speakerId: 'alice_c1', text: secret })
  await expect(generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal)).rejects.toThrow(GENERATION_ERROR_MESSAGES.invalid_schema)
})

test('missing, invalid, unauthorized connections and denied permission fail before provider dispatch', async () => {
  for (const mode of ['missing', 'invalid', 'unauthorized', 'permission', 'api']) {
    const f = fixture(), room = await f.create()
    if (mode === 'missing') room.settings!.connectionId = ''
    if (mode === 'invalid') f.host.connections!.get = async () => null
    if (mode === 'unauthorized') f.host.connections!.get = async () => { throw Object.assign(Error(secret), { status: 403 }) }
    if (mode === 'permission') f.host.permissions.has = name => name !== 'generation'
    if (mode === 'api') f.host.connections = undefined
    await expect(generateMochiReply(f.host, room, 'alice', 'auto', new AbortController().signal)).rejects.toThrow(GENERATION_ERROR_MESSAGES.connection)
    expect(f.calls).toEqual([])
  }
})

test('upstream/transport exceptions expose only fixed labels and numeric authorization classification', async () => {
  for (const upstream of [Error(secret), new TypeError('fetch failed ' + secret), secret,
    Object.assign(Error(secret), { status: 401, response: { data: secret }, authorization: secret }),
    Object.assign(Error(secret), { statusCode: 403 }), { response: { status: 401, body: secret } },
    { status: '401', message: secret }, { get status() { throw Error(secret) } }]) {
    const f = fixture(), room = await f.create()
    f.host.generate!.quiet = async request => { f.calls.push(request); throw upstream }
    await f.service.handle(f.request(room, 'upstream'), 'alice')
    const failure = f.events.find(e => e.payload.type === 'mochi:error')!.payload
    expect(failure.diagnostic).toEqual({ category: providerFailure(upstream).category })
    expect(failure.message).toBe(GENERATION_ERROR_MESSAGES[providerFailure(upstream).category])
    expect(JSON.stringify(f.events)).not.toContain(secret); expect(JSON.stringify([...f.files])).not.toContain(secret)
    expect(f.calls).toHaveLength(1); expect((await f.service.read('alice', room.id)).messages).toHaveLength(1)
  }
  const e = Object.assign(new MochiGenerationError('provider'), { message: secret, cause: secret, headers: secret })
  expect(publicGenerationFailure(e)).toEqual({ message: GENERATION_ERROR_MESSAGES.provider, diagnostic: { category: 'provider' } })
  expect(JSON.stringify(publicGenerationFailure({ message: secret, category: 'provider' }))).not.toContain(secret)
})

test('token/source exceptions are safe at UI boundary and failed regeneration retains complete history', async () => {
  const f = fixture(), room = await f.create()
  await f.service.message('alice', f.request(room, 'seed'))
  let saved = await f.service.read('alice', room.id)
  await f.service.message('alice', f.request(saved, 'later', { content: 'Later synthetic message' }))
  for (const mode of ['text', 'provider', 'tokens', 'source']) {
    saved = await f.service.read('alice', room.id)
    const messages = structuredClone(saved.messages), notices = structuredClone(saved.notifications), target = saved.messages[1] as any
    const tokens = f.host.tokens, get = f.host.characters.get
    f.output('{"text": "' + secret)
    if (mode === 'provider') f.host.generate!.quiet = async () => { throw Error(secret) }
    if (mode === 'tokens') f.host.tokens = { countMessages: async () => { throw Error(secret) } }
    if (mode === 'source') f.host.characters.get = async () => { throw Error(secret) }
    await f.service.handle({ ...f.request(saved, 'regen_' + mode), type: 'mochi:regenerate', messageId: target.id, confirmed: true }, 'alice')
    f.host.tokens = tokens; f.host.characters.get = get
    saved = await f.service.read('alice', room.id)
    expect(saved.messages).toEqual(messages); expect(saved.notifications).toEqual(notices)
    expect(JSON.stringify(f.events)).not.toContain(secret); expect(JSON.stringify([...f.files])).not.toContain(secret)
    expect((await f.service.state('alice')).jobs).toEqual({})
  }
})

test('cancellation and room invalidation suppress late diagnostics from providers ignoring abort', async () => {
  for (const mode of ['cancel_resolve', 'cancel_reject', 'revision', 'revision_plain']) {
    const f = fixture(), room = await f.create(); let resolve!: (v: any) => void, reject!: (e: unknown) => void, started!: () => void
    const ready = new Promise<void>(r => { started = r })
    f.host.generate!.quiet = async request => { f.calls.push(request); started(); return new Promise((yes, no) => { resolve = yes; reject = no }) }
    const pending = f.service.handle(f.request(room, 'pending'), 'alice'); await ready
    if (mode === 'revision'||mode==='revision_plain') {
      const saved = await f.service.read('alice', room.id)
      // Simulate a separately committed revision without relying on local abort.
      f.files.set('alice:mochi/v1/rooms/' + room.id + '.json', { ...saved, revision: saved.revision + 1 })
    } else await f.service.cancel('alice', room.id, 'pending')
    if (mode === 'cancel_resolve'||mode==='revision_plain') resolve({ content: secret }); else reject(Error(secret))
    await pending
    expect(f.events.filter(e => e.payload.type === 'mochi:error')).toEqual([])
    expect((await f.service.read('alice', room.id)).messages).toHaveLength(1)
    expect((await f.service.state('alice')).jobs).toEqual({}); expect(f.calls).toHaveLength(1)
  }
})

test('authenticated user, fictional account, room and request ownership remain enforced', async () => {
  const f = fixture(), room = await f.create(), other = await f.create(), bob = await f.create('bob')
  const a = await f.service.fictionalAccounts.create('alice', { displayName: 'A', username: '', persona: { source: 'manual', name: 'A', description: '' } })
  const b = await f.service.fictionalAccounts.create('alice', { displayName: 'B', username: '', persona: { source: 'manual', name: 'B', description: '' } })
  const owned = await f.create('alice', 1, a.id), before = structuredClone([...f.files])
  await f.service.handle(f.request(room, 'foreign_user'), 'bob')
  await f.service.handle(f.request(owned, 'foreign_account', { accountId: b.id }), 'alice')
  await f.service.handle(f.request(room, 'unauthenticated'))
  expect([...f.files]).toEqual(before); expect(f.calls).toEqual([])
  let reject!: (e: unknown) => void, started!: () => void
  const ready = new Promise<void>(r => { started = r })
  f.host.generate!.quiet = async request => { f.calls.push(request); started(); return new Promise((_, no) => { reject = no }) }
  const pending = f.service.handle(f.request(room, 'owned_request'), 'alice'); await ready
  await expect(f.service.cancel('bob', room.id, 'owned_request')).rejects.toThrow()
  await f.service.cancel('alice', room.id, 'wrong_request')
  expect(f.calls[0].signal.aborted).toBe(false)
  reject(Error(secret)); await pending
  const failure = f.events.find(e => e.payload.requestId === 'owned_request' && e.payload.type === 'mochi:error')!
  expect(failure.user).toBe('alice'); expect(failure.payload.roomId).toBe(room.id)
  expect((await f.service.read('alice', other.id)).messages).toEqual([]); expect((await f.service.read('bob', bob.id)).messages).toEqual([])
})

test('view ignores canceled/foreign/stale diagnostics and clears displayed diagnostics when leaving', async () => {
  const dom = new JSDOM('<body></body>'), previous = globalThis.document; globalThis.document = dom.window.document
  const f = fixture(), room = await f.create(), other = await f.create(), sent: any[] = []
  const view = new MochiView(p => sent.push(p), () => {}, () => {})
  try {
    view.state = await f.service.state('alice'); view.select(room.id)
    const form = view.render().querySelector<HTMLFormElement>('.mochi-composer')!
    form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }))
    const request = sent.find(p => p.type === 'mochi:send')
    view.state!.jobs = { [room.id]: request.requestId }
    const packet = { type: 'mochi:error', requestId: request.requestId, roomId: room.id, roomRevision: room.revision, message: GENERATION_ERROR_MESSAGES.provider, diagnostic: { category: 'provider' } }
    for (const patch of [{ accountId: 'foreign' }, { roomId: other.id }, { roomRevision: room.revision + 1 }, { requestId: 'foreign_request' }]) {
      view.receive({ ...packet, ...patch }); expect(view.error).toBe('')
    }
    view.receive(packet); expect(view.error).toBe(GENERATION_ERROR_MESSAGES.provider)
    view.select(other.id); expect(view.error).toBe(''); view.receive(packet); expect(view.error).toBe('')
    view.select(room.id)
    // Prior request finished; a new request owns the next diagnostic.
    view.receive({ type: 'mochi:job_finished', roomId: room.id, requestId: request.requestId })
    const again = view.render().querySelector<HTMLFormElement>('.mochi-composer')!
    again.dispatchEvent(new dom.window.Event('submit', { cancelable: true }))
    const next = sent.filter(p => p.type === 'mochi:send').at(-1)
    view.state!.jobs = { [room.id]: next.requestId }
    view.render().querySelector<HTMLButtonElement>('[aria-label="Stop reply"]')!.click()
    view.receive({ ...packet, requestId: next.requestId }); expect(view.error).toBe('')
    expect(sent.some(p => p.type === 'mochi:cancel' && p.generationRequestId === next.requestId)).toBe(true)
  } finally { view.destroy(); globalThis.document = previous; dom.window.close() }
})

test('hybrid replies use validated DM/explicit speakers and preserve regeneration and history',async()=>{
 for(const mode of ['instant','manual','natural'] as const){
  const f=fixture();let room=await f.create('alice',mode==='natural'?1:2)
  room=await f.service.update('alice',{roomId:room.id,revision:room.revision,title:room.title,characterIds:room.characterIds,persona:room.persona,settings:{...room.settings,responseMode:mode}})
  const text='Hey 💜\nA natural reply, with punctuation!';f.output(text)
  await f.service.handle(f.request(room,'hybrid_'+mode,mode==='natural'?{}:{responder:'alice_c2',...(mode==='manual'?{content:''}:{})}),'alice')
  const saved=await f.service.read('alice',room.id);expect(saved.messages.at(-1)!.content).toBe(text);expect(saved.messages.at(-1)!.characterId).toBe(mode==='natural'?'alice_c1':'alice_c2');expect(f.calls).toHaveLength(1)
 }
})

test('ineligible explicit responder is rejected before provider; unsupported envelopes persist no partial batch',async()=>{
 const f=fixture(),room=await f.create('alice',2)
 await expect(generateMochiReply(f.host,room,'alice','alice_c2',new AbortController().signal,['alice_c1'])).rejects.toMatchObject({category:'ineligible_speaker'});expect(f.calls).toHaveLength(0)
 f.output(JSON.stringify({protocol:'mochi.response',version:1,messages:[{speakerId:'alice_c1',text:secret}],actions:[{type:'delete',messageId:'user_message'}]}))
 await f.service.handle(f.request(room,'inactive_action'),'alice')
 const saved=await f.service.read('alice',room.id);expect(saved.messages).toHaveLength(1);expect(saved.notifications).toEqual([]);expect(JSON.stringify([...f.files])).not.toContain(secret)
 expect(f.events.find(e=>e.payload.type==='mochi:error')!.payload.diagnostic).toEqual({category:'unsupported_action'})
})

test('plain regeneration keeps later messages and reversible versions',async()=>{
 const f=fixture(),room=await f.create();await f.service.message('alice',f.request(room,'plain_seed'))
 let saved=await f.service.read('alice',room.id);await f.service.message('alice',f.request(saved,'plain_later',{content:'Later user text'}));saved=await f.service.read('alice',room.id)
 const before=structuredClone(saved.messages),target=before[1] as any;f.output('Replacement 💜\nTwo lines')
 await f.service.handle({...f.request(saved,'plain_regeneration'),type:'mochi:regenerate',messageId:target.id,confirmed:true},'alice')
 const after=await f.service.read('alice',room.id);expect(after.messages).toHaveLength(before.length);expect(after.messages.slice(2)).toEqual(before.slice(2));expect(after.messages[1].content).toBe('Replacement 💜\nTwo lines');expect((after.messages[1] as any).previousVersions[0].content).toBe(target.content)
})
