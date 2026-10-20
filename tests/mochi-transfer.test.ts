import { expect, test } from 'bun:test'
import { exportArchive, importArchive, reviewArchive, reviewRollback, rollbackImport, archiveDigest, sha256, TRANSFER_LOCK, type TransferArchive, type TransferHost, type TransferConsent } from '../src/mochi/transfer.js'
import { startTransferMaintenance } from '../src/mochi/transfer-runtime.js'
import { startMochiRuntime } from '../src/mochi/runtime.js'
import { proveCoverage } from '../src/mochi/memory.js'
import { defaultMochiSettings } from '../src/mochi/types.js'
import { defaultUIPreferences } from '../src/mochi/ui-preferences.js'
import { JSDOM } from 'jsdom'
import { setup as maintenanceUI } from '../src/transfer-frontend.js'

const A = 'account_' + 'a'.repeat(32), B = 'account_' + 'b'.repeat(32)
const R = 'room_' + 'a'.repeat(32), L = 'room_' + 'b'.repeat(32), ARCHIVED = 'room_' + 'c'.repeat(32)
const P = 'preset_' + 'a'.repeat(32), S = 'summary_' + 'a'.repeat(32)
const date = '2026-10-20T12:00:00.000Z', enc = new TextEncoder(), dec = new TextDecoder()
function memory(namespace = 'mochi', files = new Map<string, Uint8Array>()) {
  const calls: unknown[] = [], events: any[] = [], listeners = new Set<any>()
  let mutations = 0, crashAt = Infinity
  const key = (p: string, u: string) => namespace + '/' + u + '/' + p
  const put = (p: string, b: Uint8Array, u: string) => { files.set(key(p, u), b.slice()); if (++mutations === crashAt) throw Error('Injected crash after durable mutation') }
  const host: any = {
    manifest: { identifier: namespace },
    userStorage: {
      exists: async (p: string, u: string) => files.has(key(p, u)),
      readBinary: async (p: string, u: string) => { const f = files.get(key(p, u)); if (!f) throw Error('missing file'); return f.slice() },
      writeBinary: async (p: string, b: Uint8Array, u: string) => put(p, b, u),
      getJson: async (p: string, o: any) => { const f = files.get(key(p, o.userId)); return f ? JSON.parse(dec.decode(f)) : o.fallback },
      setJson: async (p: string, v: any, o: any) => put(p, enc.encode(JSON.stringify(v)), o.userId),
      move: async (a: string, b: string, u: string) => { const f = files.get(key(a, u)); if (!f) throw Error('missing staged file'); files.set(key(b, u), f); files.delete(key(a, u)); if (++mutations === crashAt) throw Error('Injected crash after durable mutation') },
      delete: async (p: string, u: string) => { files.delete(key(p, u)); if (++mutations === crashAt) throw Error('Injected crash after durable mutation') },
      list: async (p: string, u: string) => [...files.keys()].filter(k => k.startsWith(key(p, u))).map(k => k.slice(key(p, u).length)),
    },
    storage: { exists: async () => false, getJson: async () => null, setJson: async () => { throw Error('Registry must not be copied') }, move: async () => { throw Error('Registry must not be copied') } },
    users: { getRole: async (u: string) => { if (!['alice', 'bob'].includes(u)) throw Error('auth unavailable'); return 'user' } },
    characters: { get: async (id: string, u: string) => ({ id, ownerId: u }), list: async () => ({ data: [] }) },
    personas: { get: async (id: string, u: string) => ({ id, ownerId: u }), list: async () => ({ data: [] }) },
    images: { get: async (id: string, u: string) => ({ id, ownerId: u }), list: async () => ({ data: [] }) },
    permissions: { has: () => true }, generate: { quiet: async () => { calls.push('forbidden'); throw Error('No generation during transfer') } },
    sendToFrontend: (p: any, u: string) => events.push({ p, u }),
    onFrontendMessage: (f: any) => { listeners.add(f); return () => listeners.delete(f) },
    ui: { closeDrawer: async () => {} }, log: { warn: () => {} },
  }
  return { host: host as TransferHost & any, files, calls, events, key, mutations: () => mutations, crash: (n = Infinity) => { mutations = 0; crashAt = n }, emit: (p: any, u?: string) => { for (const f of listeners) f(p, u) } }
}
async function seed(h: ReturnType<typeof memory>, owner: string) {
  const persona = { source: 'manual', sourceId: '', name: 'Synthetic ' + owner, description: 'Original', avatarUrl: '/api/v1/images/portrait' }
  const account = (id: string, archived: boolean) => ({ version: 1, id, ownerId: owner, revision: 3, displayName: 'Synthetic', username: '', avatarUrl: '', persona, createdAt: date, updatedAt: date, archived })
  const put = async (p: string, v: any) => h.host.userStorage.setJson(p, v, { userId: owner })
  await put('mochi/v1/fictional-accounts.json', { version: 1, ownerId: owner, revision: 5, selectedAccountId: A, accounts: [account(A, false), account(B, true)], startupPreference: 'picker', phones: { 'a::b::c': { preference: 'last-used', lastAccountId: A } } })
  const m = { id: 'msg_original', role: 'user', content: 'Synthetic preserved text', name: 'Me', avatarUrl: '', createdAt: date, requestId: 'original', previousVersions: [{ content: 'Old text', name: 'Me', avatarUrl: '', savedAt: date }] }
  const room: any = { version: 1, id: R, accountId: A, revision: 7, title: 'Preserved', characterIds: ['character'], persona, messages: [m, { ...m, id: 'msg_reply', role: 'assistant', characterId: 'character', replyTo: m.id, reactions: [{ emoji: '❤️', actor: 'user', actorId: A, name: 'Me' }] }], settings: defaultMochiSettings(), receipts: ['receipt'], notifications: [], createdAt: date, updatedAt: date, chatPins: [m.id], runtime: { version: 1, enabled: true, jobs: [ { id: 'pending_response', dueAt: 1, expiresAt: 9999999999999, revision: 7, responder: 'character', status: 'queued', attempts: 0, nextAttemptAt: 0, kind: 'response' }, { id: 'deferred', dueAt: 1, expiresAt: 9999999999999, revision: 7, responder: 'character', status: 'generated', attempts: 1, nextAttemptAt: 0, draft: { characterId: 'character', name: 'Character', avatarUrl: '', text: 'Preserved deferred draft' } } ] } }
  room.memory = { version: 1, ownerId: owner, roomId: R, currentId: S, versions: [{ id: S, text: 'Summary', enabled: true, excludeCovered: true, savedAt: date, coverage: await proveCoverage(room, m.id) }] }
  room.preset = { id: P, accountId: A, revision: 2 }
  await put('mochi/v1/rooms/' + R + '.json', room)
  const legacy = { ...room, id: L, accountId: undefined, preset: undefined, memory: undefined, runtime: undefined, chatPins: [], messages: [] }
  await put('mochi/v1/rooms/' + L + '.json', legacy)
  await put('mochi/v1/rooms/' + ARCHIVED + '.json', { ...legacy, id: ARCHIVED, accountId: B })
  await put('mochi/v1/presets/' + A + '.json', { version: 1, ownerId: owner, accountId: A, revision: 4, receipts: ['preset_receipt'], presets: [{ id: P, name: 'Custom', archived: false, revisions: [1, 2].map(revision => ({ revision, layout: 'legacy-v1', dmInstructions: 'DM ' + revision, groupInstructions: 'Group ' + revision })) }] })
  await put('mochi/v1/generation-prompts.json', { version: 1, ownerId: owner, revision: 2, entries: { [JSON.stringify(['account', A, 'summary'])]: { instructions: 'Preserve prompt', detail: 'balanced', defaultVersion: 'aigen-02-v1' } } })
  await put('mochi/v1/ui-preferences/' + B + '.json', { version: 1, ownerId: owner, accountId: B, revision: 2, preferences: defaultUIPreferences() })
  await put('mochi/v1/shared-presentation.json', { version: 1, ownerId: owner, shared: true, revision: 2, preferences: defaultUIPreferences() })
  await put('mochi/v1/character-preferences/character.json', { version: 1, ownerId: owner, characterId: 'character', revision: 2, about: 'Preserved' })
  await put('mochi/v1/scheduler.json', { version: 1, enabled: true, attempts: [{ at: 9999999999999, roomId: R }] })
  await put('identity-profiles.json', { version: 1, entries: [{ id: 'unrelated', kind: 'persona', name: 'Never exported' }] })
  await put('phones/unrelated.json', { password: 'NOT-EXPORTED' })
}
const consent = (a: { digest: string; ownerId?: string }, owner = a.ownerId || 'alice'): TransferConsent => ({ ownerId: owner, digest: a.digest, confirmed: true, sourceDisabled: true, originalsSaved: true })
async function archive() { const s = memory('lumiphone'); await seed(s, 'alice'); return { source: s, a: await exportArchive(s.host, 'alice', 'lumiphone', true) } }
async function mutate(a: TransferArchive, path: string, work: (v: any) => void) {
  const copy = structuredClone(a), f = copy.files.find(f => f.path === path)!, value = JSON.parse(Buffer.from(f.base64, 'base64').toString('utf8')); work(value)
  const bytes = enc.encode(JSON.stringify(value)); f.bytes = bytes.length; f.sha256 = await sha256(bytes); f.base64 = Buffer.from(bytes).toString('base64'); copy.digest = await archiveDigest(copy); return copy
}

test('same-owner inventory preserves stable IDs, histories, archived accounts, legacy rooms and original bytes; excludes unrelated Pocket data', async () => {
  const { source, a } = await archive(), before = JSON.stringify([...source.files])
  const review = await reviewArchive(a, 'alice')
  expect(review).toMatchObject({ accounts: 2, rooms: 3, legacyRooms: 1, messages: 2, pendingJobs: 2 })
  expect(a.files.some(f => /identity-profiles|phones/.test(f.path))).toBe(false)
  const d = memory(); await importArchive(d.host, 'alice', a, consent(a))
  const saved = await d.host.userStorage.getJson('mochi/v1/rooms/' + R + '.json', { userId: 'alice' })
  expect(saved.runtime.jobs.every((j: any) => j.status === 'paused')).toBe(true)
  expect(saved.runtime.jobs[1].draft.text).toBe('Preserved deferred draft'); expect(saved.runtime.enabled).toBe(false)
  expect(saved.messages).toEqual(JSON.parse(Buffer.from(a.files.find(f => f.path.includes(R))!.base64, 'base64').toString('utf8')).messages)
  expect(saved.memory.currentId).toBe(S); expect(saved.preset.revision).toBe(2)
  const j = await d.host.userStorage.getJson('mochi-transfer/v1/journal.json', { userId: 'alice' })
  expect(j.archive).toEqual(a); expect(JSON.stringify([...source.files])).toBe(before)
  expect((await d.host.userStorage.getJson('mochi/v1/scheduler.json', { userId: 'alice' })).attempts[0].at).toBe(9999999999999)
  expect(d.calls).toHaveLength(0); expect(source.calls).toHaveLength(0)
})
test('two authenticated owners with overlapping IDs and two extension namespaces remain isolated', async () => {
  const files = new Map<string, Uint8Array>(), s = memory('lumiphone', files), d = memory('mochi', files)
  await seed(s, 'alice'); await seed(s, 'bob')
  const a = await exportArchive(s.host, 'alice', 'lumiphone', true), b = await exportArchive(s.host, 'bob', 'lumiphone', true)
  await expect(importArchive(d.host, 'bob', a, consent(a))).rejects.toThrow('owner')
  await importArchive(d.host, 'alice', a, consent(a)); await importArchive(d.host, 'bob', b, consent(b))
  expect((await d.host.userStorage.getJson('mochi/v1/fictional-accounts.json', { userId: 'bob' })).ownerId).toBe('bob')
  expect((await s.host.userStorage.getJson('mochi/v1/scheduler.json', { userId: 'alice' })).enabled).toBe(true)
  expect((await d.host.userStorage.getJson('mochi/v1/scheduler.json', { userId: 'alice' })).enabled).toBe(false)
})
test('null/partial consent, checksum damage, future schemas, conflicts, unsafe paths and orphaned dependencies refuse before writes', async () => {
  const { a } = await archive(), d = memory()
  for (const c of [null, {}, { ...consent(a), confirmed: false }, { ...consent(a), sourceDisabled: false }, { ...consent(a), originalsSaved: false }, { ...consent(a), digest: '0'.repeat(64) }]) await expect(importArchive(d.host, 'alice', a, c as any)).rejects.toThrow()
  const invalid = structuredClone(a); invalid.files[0].sha256 = '0'.repeat(64)
  await expect(importArchive(d.host, 'alice', invalid, consent(invalid))).rejects.toThrow('checksum')
  for (const work of [ (v: any) => { v.version = 99 }, (v: any) => { v.ownerId = 'bob' }, (v: any) => { v.accountId = 'account_' + 'f'.repeat(32) }, (v: any) => { v.chatPins = ['missing'] }, (v: any) => { v.messages[1].replyTo = 'missing' }, (v: any) => { v.messages[0].id = v.messages[1].id }, (v: any) => { v.preset.revision = 99 }, (v: any) => { v.memory.versions[0].coverage.digest = '0'.repeat(64) }, (v: any) => { v.credentials = { apiKey: 'forbidden' } } ]) {
    const bad = await mutate(a, 'mochi/v1/rooms/' + R + '.json', work)
    await expect(importArchive(d.host, 'alice', bad, consent(bad))).rejects.toThrow()
  }
  for (const path of ['../lumiphone/private.json', 'mochi/v1/../private.json', 'mochi/v1/unknown.json', 'mochi\\v1\\rooms\\a.json']) {
    const bad = structuredClone(a); bad.files[0].path = path; bad.digest = await archiveDigest(bad)
    await expect(importArchive(d.host, 'alice', bad, consent(bad))).rejects.toThrow()
  }
  expect(d.files.size).toBe(0)
  await d.host.userStorage.setJson('mochi/v1/rooms/' + R + '.json', { preexisting: true }, { userId: 'alice' })
  await expect(importArchive(d.host, 'alice', a, consent(a))).rejects.toThrow('not empty')
  expect(d.files.size).toBe(1)
})
test('missing image/native/Pocket sources are refused; explicit target repair preserves source:pocket', async () => {
  const { a } = await archive(), d = memory()
  d.host.images.get = async () => null
  await expect(importArchive(d.host, 'alice', a, consent(a))).rejects.toThrow('image')
  d.host.images.get = async () => ({ id: 'portrait' }); d.host.characters.get = async () => null
  await expect(importArchive(d.host, 'alice', a, consent(a))).rejects.toThrow('native')
  d.host.characters.get = async () => ({ id: 'character' })
  const pocket = await mutate(a, 'mochi/v1/rooms/' + R + '.json', v => { v.persona.source = 'pocket'; v.persona.sourceId = 'old_profile' })
  await expect(importArchive(d.host, 'alice', pocket, consent(pocket))).rejects.toThrow('copy/repair')
  await d.host.userStorage.setJson('identity-profiles.json', { version: 1, entries: [{ id: 'old_profile', kind: 'persona', name: 'Explicitly repaired' }] }, { userId: 'alice' })
  await importArchive(d.host, 'alice', pocket, consent(pocket))
  expect((await d.host.userStorage.getJson('mochi/v1/rooms/' + R + '.json', { userId: 'alice' })).persona.source).toBe('pocket')
  expect(d.calls).toHaveLength(0)
})
test('every durable import mutation survives interruption and restart with identical final data', async () => {
  const { a } = await archive(), reference = memory(); await importArchive(reference.host, 'alice', a, consent(a))
  const mutations = reference.mutations()
  expect(mutations).toBeGreaterThan(20)
  for (let point = 1; point <= mutations; point++) {
    const d = memory(); d.crash(point)
    await expect(importArchive(d.host, 'alice', a, consent(a))).rejects.toThrow('crash')
    d.crash()
    const restarted = memory('mochi', d.files)
    await importArchive(restarted.host, 'alice', a, consent(a))
    for (const f of a.files) expect(await restarted.host.userStorage.readBinary(f.path, 'alice')).toEqual(await reference.host.userStorage.readBinary(f.path, 'alice'))
    expect(await restarted.host.userStorage.exists(TRANSFER_LOCK, 'alice')).toBe(false)
    expect(restarted.calls).toHaveLength(0)
  }
})
test('normal runtime fails closed under transfer marker; no copied jobs run after restoring normal runtime', async () => {
  const { a } = await archive(), d = memory()
  await importArchive(d.host, 'alice', a, consent(a))
  const normal = startMochiRuntime(d.host)
  try { await normal.scheduler.tick(); expect(d.calls).toHaveLength(0) } finally { normal.stop() }
  await d.host.userStorage.setJson(TRANSFER_LOCK, { corrupted: true }, { userId: 'alice' })
  const blocked = startMochiRuntime(d.host)
  try { await expect(blocked.service.accountsState('alice')).rejects.toThrow('recovery'); await blocked.scheduler.tick(); expect(d.calls).toHaveLength(0) } finally { blocked.stop() }
})
test('repeat import never overwrites later messages; rollback preserves all later bytes and survives every deletion crash', async () => {
  const { a } = await archive(), d = memory(); await importArchive(d.host, 'alice', a, consent(a))
  const path = 'mochi/v1/rooms/' + R + '.json', later = await d.host.userStorage.getJson(path, { userId: 'alice' }); later.title = 'Later title'
  await d.host.userStorage.setJson(path, later, { userId: 'alice' }); const bytes = await d.host.userStorage.readBinary(path, 'alice')
  await importArchive(d.host, 'alice', a, consent(a)); expect(await d.host.userStorage.readBinary(path, 'alice')).toEqual(bytes)
  const review = await reviewRollback(d.host, 'alice'), c = consent(review)
  const initial = new Map([...d.files].map(([k, v]) => [k, v.slice()]))
  d.crash(); await rollbackImport(d.host, 'alice', c); const count = d.mutations()
  const journal = await d.host.userStorage.getJson('mochi-transfer/v1/journal.json', { userId: 'alice' })
  expect(journal.archive).toEqual(a); expect(journal.rollback.find((f: any) => f.path === path).base64).toBe(Buffer.from(bytes).toString('base64'))
  for (let point = 1; point <= count; point++) {
    const attempt = memory('mochi', new Map(initial)); attempt.crash(point)
    await expect(rollbackImport(attempt.host, 'alice', c)).rejects.toThrow('crash'); attempt.crash()
    await rollbackImport(attempt.host, 'alice', c)
    expect(await attempt.host.userStorage.list('mochi/v1/', 'alice')).toEqual([])
    expect(await attempt.host.userStorage.exists(TRANSFER_LOCK, 'alice')).toBe(false)
  }
  await rollbackImport(d.host, 'alice', c)
  await expect(importArchive(d.host, 'alice', a, consent(a))).rejects.toThrow('rolled back')
})
test('source change during export, incomplete inventory and damaged records do not produce an export', async () => {
  const s = memory('lumiphone'); await seed(s, 'alice')
  const original = s.host.userStorage.readBinary; let reads = 0
  s.host.userStorage.readBinary = async (p: string, u: string) => { const b = await original(p, u); if (++reads === 12) await s.host.userStorage.setJson('mochi/v1/scheduler.json', { version: 1, enabled: false, attempts: [] }, { userId: u }); return b }
  await expect(exportArchive(s.host, 'alice', 'lumiphone', true)).rejects.toThrow('changed')
  s.host.userStorage.readBinary = original
  await s.host.userStorage.setJson('mochi/v1/unknown.json', { version: 99 }, { userId: 'alice' })
  await expect(exportArchive(s.host, 'alice', 'lumiphone', true)).rejects.toThrow('Unsupported file')
  await expect(exportArchive(s.host, 'alice', 'lumiphone', null)).rejects.toThrow('consent')
})
test('maintenance request routing uses host identity; source cannot import; destination cannot export; unauthenticated is inert', async () => {
  const s = memory('lumiphone'); await seed(s, 'alice')
  const stop = startTransferMaintenance(s.host, 'source')
  const wait = async () => { for (let i = 0; i < 12; i++) await new Promise(r => setTimeout(r, 0)) }
  s.emit({ type: 'mochi-transfer:request', action: 'export', requestId: 'missing', confirmed: true }); await wait(); expect(s.events).toHaveLength(0)
  s.emit({ type: 'mochi-transfer:request', action: 'identity', requestId: 'identity', ownerId: 'bob' }, 'alice'); await wait()
  expect(s.events[0]).toMatchObject({ u: 'alice', p: { ownerId: 'alice', result: { ownerId: 'alice' } } })
  s.emit({ type: 'mochi-transfer:request', action: 'import', requestId: 'no_import' }, 'alice'); await wait(); expect(s.events.at(-1).p.type).toBe('mochi-transfer:error')
  stop(); const d = memory(), done = startTransferMaintenance(d.host, 'destination')
  d.emit({ type: 'mochi-transfer:request', action: 'export', requestId: 'no_export', confirmed: true }, 'alice'); await wait(); expect(d.events.at(-1).p.type).toBe('mochi-transfer:error')
  done(); expect(s.calls).toHaveLength(0); expect(d.calls).toHaveLength(0)
})

test('interrupted staging can be explicitly rolled back; damaged journal/changed destination fail closed', async () => {
  const { a } = await archive(), d = memory(); d.crash(10)
  await expect(importArchive(d.host, 'alice', a, consent(a))).rejects.toThrow('crash'); d.crash()
  const review = await reviewRollback(d.host, 'alice')
  await rollbackImport(d.host, 'alice', consent(review))
  expect(await d.host.userStorage.list('mochi/v1/', 'alice')).toEqual([])
  const changed = memory(); changed.crash(15)
  await expect(importArchive(changed.host, 'alice', a, consent(a))).rejects.toThrow('crash'); changed.crash()
  await changed.host.userStorage.setJson('mochi/v1/rooms/' + R + '.json', { unexpected: true }, { userId: 'alice' })
  await expect(importArchive(changed.host, 'alice', a, consent(a))).rejects.toThrow('changed')
  const damaged = memory(); damaged.crash(10)
  await expect(importArchive(damaged.host, 'alice', a, consent(a))).rejects.toThrow('crash'); damaged.crash()
  await damaged.host.userStorage.setJson('mochi-transfer/v1/journal.json', { version: 99 }, { userId: 'alice' })
  await expect(importArchive(damaged.host, 'alice', a, consent(a))).rejects.toThrow('journal')
  expect(await damaged.host.userStorage.exists(TRANSFER_LOCK, 'alice')).toBe(true)
})

test('maintenance UI requires reviewed digest/owner consent and erases private review after logout or owner change', async () => {
  const { a } = await archive(), dom = new JSDOM('<!doctype html><body></body>', { url: 'https://synthetic.invalid' })
  const previous = { window: (globalThis as any).window, document: (globalThis as any).document }
  Object.assign(globalThis, { window: dom.window, document: dom.window.document })
  const listeners = new Set<any>(), sent: any[] = [], root = dom.window.document.createElement('div')
  let owner = 'alice'
  dom.window.document.body.append(root)
  const ctx: any = { ready() {}, onTeardown() { return () => {} }, ui: { registerDrawerTab: () => ({ root, destroy: () => root.remove() }) }, onBackendMessage: (fn: any) => { listeners.add(fn); return () => listeners.delete(fn) }, sendToBackend: (p: any) => {
    sent.push(p)
    void (async () => {
      const result = p.action === 'identity' ? { ownerId: owner, mode: 'destination' } : p.action === 'review' ? await reviewArchive(a, owner) : { completed: true }
      for (const fn of listeners) fn({ type: 'mochi-transfer:result', requestId: p.requestId, ownerId: owner, result })
    })()
  } }
  const flush = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)) }
  let stop = () => {}
  try {
    stop = maintenanceUI(ctx); await flush()
    const button = (text: string) => [...root.querySelectorAll('button')].find(b => b.textContent === text)!
    button('Import reviewed data with copied jobs paused').click(); await flush(); expect(sent.some(p => p.action === 'import')).toBe(false)
    const input = root.querySelector('input[type=file]')!
    Object.defineProperty(input, 'files', { configurable: true, value: [{ size: 1000, text: async () => JSON.stringify(a) }] })
    button('Review selected export').click(); await flush()
    expect(root.querySelector('pre')!.textContent).toContain(a.digest)
    button('Import reviewed data with copied jobs paused').click(); await flush(); expect(sent.some(p => p.action === 'import')).toBe(false)
    ;(root.querySelector('input[type=checkbox]') as HTMLInputElement).checked = true
    ;(root.querySelector('label input:not([type])') as HTMLInputElement).value = 'bob'
    button('Import reviewed data with copied jobs paused').click(); await flush(); expect(sent.some(p => p.action === 'import')).toBe(false)
    ;(root.querySelector('label input:not([type])') as HTMLInputElement).value = 'alice'
    button('Import reviewed data with copied jobs paused').click(); await flush()
    expect(sent.find(p => p.action === 'import').consent.digest).toBe(a.digest)
    // A subsequent response from a new real owner destroys the entire private context.
    owner = 'bob'; for (const fn of listeners) fn({ type: 'mochi-transfer:result', requestId: 'stale', ownerId: 'bob', result: a })
    expect(listeners.size).toBe(0); expect(dom.window.document.body.textContent).toBe('')
    stop(); stop()
  } finally { stop(); Object.assign(globalThis, previous); dom.window.close() }
})

test('both maintenance delivery backends load with the correct identity and never start generation', async () => {
  const previous = (globalThis as any).spindle
  try {
    for (const mode of ['source', 'destination']) {
      const h = memory(mode === 'source' ? 'lumiphone' : 'mochi')
      ;(globalThis as any).spindle = h.host
      const packaged = await import('../tmp/transfer-' + mode + '/dist/backend.js')
      h.emit({ type: 'mochi-transfer:request', action: 'identity', requestId: 'bundle' }, 'alice')
      for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0))
      expect(h.events.at(-1)).toMatchObject({ u: 'alice', p: { result: { mode, ownerId: 'alice' } } })
      expect(h.files.size).toBe(0); expect(h.calls).toHaveLength(0); packaged.teardown()
    }
  } finally { (globalThis as any).spindle = previous }
})

test('user-install aliased scheduler registry is explicitly inventoried but never exported; later target registry is preserved on rollback', async () => {
  const s = memory('lumiphone'); await seed(s, 'alice')
  await s.host.userStorage.setJson('mochi/v1/scheduler-accounts.json', { version: 1, accounts: ['alice', 'bob'], attempts: [9999999999999] }, { userId: 'alice' })
  const a = await exportArchive(s.host, 'alice', 'lumiphone', true)
  expect(a.excluded).toHaveLength(1); expect(a.files.some(f => f.path.endsWith('scheduler-accounts.json'))).toBe(false)
  expect(JSON.stringify(a)).not.toContain('"bob"')
  const d = memory(); await importArchive(d.host, 'alice', a, consent(a))
  await d.host.userStorage.setJson('mochi/v1/scheduler-accounts.json', { version: 1, accounts: ['alice'], attempts: [] }, { userId: 'alice' })
  const review = await reviewRollback(d.host, 'alice'); await rollbackImport(d.host, 'alice', consent(review))
  const j = await d.host.userStorage.getJson('mochi-transfer/v1/journal.json', { userId: 'alice' })
  expect(j.rollback.some((f: any) => f.path.endsWith('scheduler-accounts.json'))).toBe(true)
  expect(await d.host.userStorage.list('mochi/v1/', 'alice')).toEqual([])
})
