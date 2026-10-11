import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { fixture } from './mochi-accounts.test.js'
import { defaultPresence } from '../src/mochi/presence.js'
import { MochiView } from '../src/mochi/view.js'
import { publicRuntime, SCHEDULE_HISTORY_LIMIT } from '../src/mochi/scheduling.js'

// Converted from the approved BUG03 audit. Synthetic storage/provider only.
async function setup(fictional = false) {
  const f = fixture()
  const accountId = fictional ? (await f.profile()).id : undefined
  const room = await f.room(accountId)
  await f.scheduler.configure('alice', true)
  await f.service.configureScheduledRoom('alice', { accountId, roomId: room.id, revision: room.revision, enabled: true })
  const schedule = (id = 'audit_opportunity', dueAt = f.now + 60000) => f.scheduler.handle({ type: 'mochi:schedule', accountId, roomId: room.id, revision: room.revision, occurrenceId: id, dueAt, responder: 'alice_character' }, 'alice')
  return { f, accountId, room, schedule }
}

for (const fictional of [false, true]) {
  const scope = fictional ? 'fictional' : 'legacy'
  test(`BUG03 evidence: ${scope} queued opportunity survives reopening, account switching and restart`, async () => {
    const { f, accountId, room, schedule } = await setup(fictional)
    try {
      await schedule()
      const before = await f.service.read('alice', room.id, accountId)
      expect(before.runtime!.jobs[0]).toMatchObject({ kind: 'scheduled', dueAt: 1060000, expiresAt: 4660000, attempts: 0, status: 'queued' })
      if (fictional) {
        const other = await f.profile('p2')
        await f.select(other.id)
        expect((await f.service.state('alice', other.id)).rooms).toEqual([])
        await f.select(accountId!)
      }
      f.restart()
      const reopened = await f.service.state('alice', accountId)
      expect(reopened.rooms[0].background!.jobs[0].id).toBe('audit_opportunity')
      expect(await f.service.read('alice', room.id, accountId)).toEqual(before)
      expect((await f.service.state('bob')).rooms).toEqual([])
      await f.scheduler.tick()
      expect(f.calls).toHaveLength(0)
      f.advance(60000)
      await f.scheduler.tick()
      expect(f.calls).toHaveLength(1)
      const saved = await f.service.read('alice', room.id, accountId)
      expect(saved.messages).toHaveLength(1)
      expect(saved.runtime!.jobs[0].status).toBe('delivered')
      f.restart(); await f.scheduler.tick()
      expect(f.calls).toHaveLength(1)
    } finally { f.scheduler.stop() }
  })

  test(`BUG03 regression: ${scope} Schedule then unchanged Save settings preserves the pending opportunity`, async () => {
    const { f, accountId, room } = await setup(fictional)
    const dom = new JSDOM('<!doctype html><body></body>')
    const original = globalThis.document
    globalThis.document = dom.window.document
    const sent: any[] = []
    const view = new MochiView(p => sent.push(p), () => {}, () => {}, () => ({ enabled: false, previews: false, visible: false }))
    try {
      view.state = await f.service.state('alice', accountId)
      view.select(room.id); view.editing = true
      let page = view.render()
      const due = page.querySelector<HTMLInputElement>('[aria-label="Scheduled message time"]')!
      due.value = new Date(f.now + 120000).toISOString().slice(0, 16)
      page.querySelector<HTMLButtonElement>('[aria-label="Schedule character message"]')!.click()
      const request = sent.at(-1)
      // Match the backend scheduling relay while keeping the synthetic clock
      // independent of the machine's local timezone.
      await f.scheduler.handle({ ...request, dueAt: f.now + 120000 }, 'alice')
      view.receive({ type: 'mochi:state', requestId: request.requestId, state: await f.service.state('alice', accountId) })
      expect((await f.service.read('alice', room.id, accountId)).runtime!.jobs[0].status).toBe('queued')
      page = view.render()
      const form = page.querySelector('form')!
      form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
      expect(sent.at(-1).type).toBe('mochi:update')
      const saved = await f.service.update('alice', sent.at(-1))
      expect(saved.runtime!.jobs).toHaveLength(1) // record is retained, not deleted
      expect(saved.messages).toEqual([])
      expect(saved.receipts).toEqual([])
      expect(saved.notifications).toEqual([])
      expect(f.calls).toHaveLength(0)
      expect(saved.runtime!.jobs[0].dueAt).toBe(1120000)
      expect(saved.runtime!.jobs[0].expiresAt).toBe(4720000)
      expect(saved.runtime!.jobs[0].status).toBe('queued')
      f.restart(); f.advance(120000); await f.scheduler.tick()
      expect((await f.service.read('alice', room.id, accountId)).messages).toHaveLength(1)
      expect(f.calls).toHaveLength(1)
    } finally { view.destroy(); f.scheduler.stop(); dom.window.close(); globalThis.document = original }
  })

  test(`BUG03 regression: ${scope} unchanged settings save leaves every stored field and deadline intact`, async () => {
    const { f, accountId, room, schedule } = await setup(fictional)
    try {
      await schedule('two_minutes', f.now + 120000)
      const before = await f.service.read('alice', room.id, accountId)
      const saved = await f.service.update('alice', { accountId, roomId: room.id, revision: before.revision, title: before.title, characterIds: before.characterIds, settings: before.settings })
      expect(saved).toEqual(before)
      expect(saved.runtime!.jobs[0]).toMatchObject({ status: 'queued', attempts: 0, dueAt: 1120000, expiresAt: 4720000 })
      f.restart()
      const reopened = await f.service.read('alice', room.id, accountId)
      expect(reopened.runtime!.jobs).toEqual(saved.runtime!.jobs)
      expect((await f.service.state('alice', accountId)).rooms[0].background!.jobs[0].status).toBe('queued')
      expect(reopened.messages).toEqual(before.messages)
      expect(reopened.notifications).toEqual(before.notifications)
      expect(reopened.receipts).toEqual(before.receipts)
      expect(f.calls).toHaveLength(0)
      f.advance(120000); await f.scheduler.tick()
      expect((await f.service.read('alice', room.id, accountId)).runtime!.jobs[0].status).toBe('delivered')
      expect(f.calls).toHaveLength(1)
    } finally { f.scheduler.stop() }
  })
}

for (const fictional of [false, true]) for (const status of ['cancelled', 'failed', 'missed'] as const) {
  test(`BUG03 regression: ${fictional ? 'fictional' : 'legacy'} stored ${status} schedule remains visible after reopening`, async () => {
    const { f, accountId, room, schedule } = await setup(fictional)
    try {
      await schedule()
      if (status === 'cancelled') await f.service.cancelScheduled('alice', room.id, 'audit_opportunity', accountId)
      else if (status === 'missed') { f.advance(3660001); await f.scheduler.tick() }
      else {
        f.host.generate!.quiet = async request => { f.calls.push(request); throw Error('503 temporarily unavailable') }
        f.advance(60000); await f.scheduler.tick()
        f.advance(60000); await f.scheduler.tick()
        f.advance(120000); await f.scheduler.tick()
      }
      f.restart()
      expect((await f.service.read('alice', room.id, accountId)).runtime!.jobs[0].status).toBe(status)
      expect(f.calls).toHaveLength(status === 'failed' ? 3 : 0)
      expect((await f.service.read('alice', room.id, accountId)).messages).toEqual([])
      expect((await f.service.state('alice', accountId)).rooms[0].background!.jobs.map(j => j.status)).toContain(status)
    } finally { f.scheduler.stop() }
  })
}

for (const blocker of ['offline', 'long-dnd', 'quota', 'server-down'] as const) {
  test(`BUG03 evidence: ${blocker} can expire a discovered opportunity without a provider request`, async () => {
    const { f, accountId, room, schedule } = await setup(true)
    try {
      if (blocker === 'offline' || blocker === 'long-dnd') await f.service.configurePresence('alice', { accountId, roomId: room.id, revision: room.revision, characterId: 'alice_character', presence: { ...defaultPresence(), manual: blocker === 'offline' ? 'offline' : 'dnd', dndMs: 7200000 } })
      await schedule()
      if (blocker === 'quota') f.files.get('alice:mochi/v1/scheduler.json').attempts = Array.from({ length: 30 }, () => ({ at: f.now, roomId: room.id }))
      f.advance(60000)
      if (blocker !== 'server-down') {
        await f.scheduler.tick()
        expect((await f.service.read('alice', room.id, accountId)).runtime!.jobs[0].status).toBe('queued')
      }
      f.advance(3600001)
      f.restart(); await f.scheduler.tick()
      const saved = await f.service.read('alice', room.id, accountId)
      expect(saved.runtime!.jobs[0]).toMatchObject({ status: 'missed', attempts: 0, dueAt: 1060000, expiresAt: 4660000 })
      expect(saved.messages).toEqual([]); expect(saved.notifications).toEqual([])
      expect(f.calls).toHaveLength(0)
      expect(saved.runtime!.jobs[0].reason).toBeUndefined()
      // Expiry cleanup does not consume provider quota or resurrect the job.
      f.advance(7200000); await f.scheduler.tick(); expect(f.calls).toHaveLength(0)
    } finally { f.scheduler.stop() }
  })
}

test('BUG03 evidence: permanent source errors pause visibly without a provider request', async () => {
  const { f, accountId, room, schedule } = await setup(true)
  try {
    await schedule(); f.revoke(); f.advance(60000); await f.scheduler.tick()
    const saved = await f.service.read('alice', room.id, accountId)
    expect(saved.runtime!.jobs[0].status).toBe('paused')
    expect((await f.service.state('alice', accountId)).rooms[0].background!.jobs[0].status).toBe('paused')
    expect(f.calls).toHaveLength(0)
  } finally { f.scheduler.stop() }
})

for (const fictional of [false, true]) {
  test(`BUG03 no-op save preserves active generation and private draft (${fictional ? 'fictional' : 'legacy'})`, async () => {
    const { f, accountId, room, schedule } = await setup(fictional)
    let release!: (value: any) => void, ready!: () => void
    const started = new Promise<void>(r => { ready = r })
    try {
      await schedule('active', f.now)
      const original = f.host.generate!.quiet
      f.host.generate!.quiet = async request => { f.calls.push(request); ready(); return new Promise(resolve => { release = resolve }) }
      const running = f.scheduler.tick(); await started
      const before = await f.service.read('alice', room.id, accountId)
      const saved = await f.service.update('alice', { accountId, roomId: room.id, revision: before.revision, title: before.title, characterIds: before.characterIds, settings: before.settings })
      expect(saved).toEqual(before)
      expect(f.calls[0].signal.aborted).toBe(false)
      release({ content: JSON.stringify({ speakerId: 'alice_character', text: 'Still authorized' }) }); await running
      expect((await f.service.read('alice', room.id, accountId)).messages).toHaveLength(1)
      expect(f.calls).toHaveLength(1)
      f.host.generate!.quiet = original
      let fresh = await f.service.read('alice', room.id, accountId)
      fresh = await f.service.update('alice', { accountId, roomId: room.id, revision: fresh.revision, title: fresh.title, characterIds: fresh.characterIds, settings: { ...fresh.settings!, aiBehavior: true } })
      f.host.generate!.quiet = async request => { f.calls.push(request); return { content: JSON.stringify({ speakerId: 'alice_character', text: 'Private deferred content', behavior: { delivery: 'later', delayMs: 60000 } }) } }
      await f.scheduler.handle({ type: 'mochi:schedule', accountId, roomId: room.id, revision: fresh.revision, occurrenceId: 'private_draft', dueAt: f.now }, 'alice')
      await f.scheduler.tick()
      const deferred = await f.service.read('alice', room.id, accountId)
      expect(deferred.runtime!.jobs.at(-1)!.draft!.text).toBe('Private deferred content')
      const unchanged = await f.service.update('alice', { accountId, roomId: room.id, revision: deferred.revision, title: deferred.title, characterIds: deferred.characterIds, settings: deferred.settings })
      expect(unchanged).toEqual(deferred)
      expect(JSON.stringify(await f.service.state('alice', accountId))).not.toContain('Private deferred content')
      f.advance(60000); await f.scheduler.tick()
      expect((await f.service.read('alice', room.id, accountId)).messages).toHaveLength(2)
      expect(f.calls).toHaveLength(2)
    } finally { f.scheduler.stop() }
  })

  test(`BUG03 validation and genuine changes remain revision-safe (${fictional ? 'fictional' : 'legacy'})`, async () => {
    const { f, accountId, room, schedule } = await setup(fictional)
    try {
      await schedule()
      const before = await f.service.read('alice', room.id, accountId)
      const input = { accountId, roomId: room.id, revision: before.revision, title: before.title, characterIds: before.characterIds, settings: before.settings }
      await expect(f.service.update('alice', { ...input, revision: before.revision - 1 })).rejects.toThrow('changed elsewhere')
      await expect(f.service.update('alice', { ...input, settings: { ...before.settings!, outputTokens: 999999 } })).rejects.toThrow('token limits')
      await expect(f.service.update('alice', { ...input, characterIds: ['bob_character'] })).rejects.toThrow('not available')
      expect(await f.service.read('alice', room.id, accountId)).toEqual(before)
      const changed = await f.service.update('alice', { ...input, settings: { ...before.settings!, instructions: 'Changed generation context' } })
      expect(changed.revision).toBe(before.revision + 1)
      expect(changed.runtime!.jobs[0].status).toBe('cancelled')
      expect(changed.messages).toEqual(before.messages)
      f.advance(60000); await f.scheduler.tick(); expect(f.calls).toHaveLength(0)
    } finally { f.scheduler.stop() }
  })
}

test('BUG03 status events retain focused settings drafts, reject old snapshots and foreign scopes', async () => {
  const { f, accountId, room, schedule } = await setup(true)
  const dom = new JSDOM('<!doctype html><body></body>'), original = globalThis.document
  globalThis.document = dom.window.document
  const view = new MochiView(() => {}, () => {}, () => {}, () => ({ enabled: false, previews: false, visible: false }))
  try {
    await schedule(); view.state = await f.service.state('alice', accountId); view.select(room.id); view.editing = true
    const page = view.render(); dom.window.document.body.append(page)
    const input = page.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!
    input.value = 'Unsaved private instructions'; input.dispatchEvent(new dom.window.Event('input')); input.focus(); input.setSelectionRange(7, 7)
    const oldState = structuredClone(view.state)
    f.revoke(); f.advance(60000); await f.scheduler.tick()
    const updates = f.events.filter(e => e.payload.type === 'mochi:scheduling_updated')
    const latest = updates.at(-1)!.payload
    view.receive(latest)
    expect(page.querySelector('[data-status="paused"]')).not.toBeNull()
    expect(dom.window.document.activeElement).toBe(input)
    expect(input.value).toBe('Unsaved private instructions'); expect(input.selectionStart).toBe(7)
    expect((view as any).settingsDraft.instructions).toBe('Unsaved private instructions')
    view.receive(updates.at(-2)!.payload)
    expect(view.state.rooms[0].background!.jobs[0].status).toBe('paused')
    view.load()
    view.receive({ type: 'mochi:state', requestId: (view as any).request, state: oldState })
    expect(view.state!.rooms[0].background!.jobs[0].status).toBe('paused')
    const foreign = { ...latest, accountId: 'mochi_account_foreign' }
    const snapshot = structuredClone(view.state)
    view.receive(foreign); view.receive({ ...latest, roomRevision: room.revision - 1 }); view.receive({ ...latest, associationRevision: 1 })
    expect(view.state).toEqual(snapshot)
    f.restart()
    const newRoom = (await f.service.state('alice', accountId)).rooms[0]
    view.receive({ ...latest, background: newRoom.background })
    expect(view.state!.rooms[0].background!.snapshot!.session).toBe(newRoom.background!.snapshot!.session)
    view.receive(latest) // retired server session cannot replace the current snapshot
    expect(view.state!.rooms[0].background!.snapshot!.session).toBe(newRoom.background!.snapshot!.session)
  } finally { view.destroy(); f.scheduler.stop(); dom.window.close(); globalThis.document = original }
})

test('BUG03 terminal summaries are bounded and sanitized without pruning durable tombstones', async () => {
  const { f, accountId, room, schedule } = await setup(true)
  try {
    await schedule()
    const saved = await f.service.read('alice', room.id, accountId), template = saved.runtime!.jobs[0]
    saved.runtime!.jobs = Array.from({ length: 50 }, (_, i) => ({ ...template, id: 'history_' + i, status: 'cancelled' as const, claim: 'private_claim', reason: 'UNSAFE_PRIVATE_PROVIDER_DETAIL', draft: { characterId: 'alice_character', name: 'Sam', avatarUrl: '', text: 'UNDELIVERED_PRIVATE_DRAFT' } }))
    saved.runtime!.jobs.push({ ...template, id: 'active' })
    const original = structuredClone(saved.runtime)
    const summary = publicRuntime(saved.runtime)!
    expect(summary.jobs).toHaveLength(SCHEDULE_HISTORY_LIMIT + 1)
    expect(summary.jobs[0].id).toBe('active'); expect(summary.jobs[1].id).toBe('history_49')
    expect(summary.jobs[0].dueAt).toBe(template.dueAt); expect(summary.jobs[0].expiresAt).toBe(template.expiresAt)
    expect(JSON.stringify(summary)).not.toContain('PRIVATE'); expect(JSON.stringify(summary)).not.toContain('claim')
    expect(saved.runtime).toEqual(original)
  } finally { f.scheduler.stop() }
})

for (const fictional of [false, true]) {
  test(`BUG03B distinct occurrences generate from current room history exactly once (${fictional ? 'fictional' : 'legacy'})`, async () => {
    const { f, accountId, room, schedule } = await setup(fictional)
    const trace: any[] = []
    try {
      const unrelated = await f.room(accountId)
      await f.service.message('alice', { accountId, roomId: unrelated.id, revision: unrelated.revision, requestId: 'unrelated', content: 'OTHER_ROOM_PRIVATE_CONTEXT' })
      f.host.generate!.quiet = async request => {
        f.calls.push(request)
        const stored = await f.service.read('alice', room.id, accountId)
        const occurrence = stored.runtime!.jobs.find(j => j.status === 'generating')!
        const output = 'Distinct output for ' + occurrence.id
        trace.push({ occurrenceId: occurrence.id, request, output, attempts: occurrence.attempts, time: f.now })
        return { content: JSON.stringify({ speakerId: 'alice_character', text: output }) }
      }
      const offset = f.calls.length
      await schedule('first_occurrence', f.now); await f.scheduler.tick()
      const first = await f.service.read('alice', room.id, accountId)
      f.restart(); await f.scheduler.tick()
      const due = f.now + 120000
      await f.scheduler.handle({ type: 'mochi:schedule', accountId, roomId: room.id, revision: first.revision, occurrenceId: 'second_occurrence', responder: 'alice_character', dueAt: due }, 'alice')
      f.restart(); f.advance(120000); await f.scheduler.tick(); await f.scheduler.tick()
      const second = await f.service.read('alice', room.id, accountId)
      expect(f.calls).toHaveLength(offset + 2)
      expect(trace.map(t => t.occurrenceId)).toEqual(['first_occurrence', 'second_occurrence'])
      expect(JSON.stringify(trace[1].request.messages)).toContain('Distinct output for first_occurrence')
      expect(JSON.stringify(trace[1].request.messages)).not.toContain('OTHER_ROOM_PRIVATE_CONTEXT')
      const messages = second.messages as any[]
      expect(messages.map(m => m.content)).toEqual(trace.map(t => t.output))
      expect(new Set(messages.map(m => m.id)).size).toBe(2)
      expect(messages.map(m => m.requestId)).toEqual(['server_first_occurrence', 'server_second_occurrence'])
      expect(messages.map(m => m.createdAt)).toEqual(trace.map(t => new Date(t.time).toISOString()))
      expect(second.runtime!.jobs.map(j => j.messageId)).toEqual(messages.map(m => m.id))
      expect(second.runtime!.jobs.map(j => j.status)).toEqual(['delivered', 'delivered'])
      expect(second.runtime!.jobs.every(j => !j.draft && !j.additional && j.attempts === 1)).toBe(true)
      f.restart(); await f.scheduler.tick(); expect(f.calls).toHaveLength(offset + 2)
      const dom = new JSDOM('<!doctype html><body></body>'), original = globalThis.document
      globalThis.document = dom.window.document
      const view = new MochiView(() => {}, () => {}, () => {}, () => ({ enabled: false, previews: false, visible: false }))
      try {
        view.state = await f.service.state('alice', accountId); view.select(room.id)
        const event = f.events.filter(e => e.payload.type === 'mochi:room_updated' && e.payload.room.id === room.id).at(-1)!.payload
        view.receive(event); view.receive(event)
        const ids = Array.from(view.render().querySelectorAll('.mochi-message')).map(n => (n as HTMLElement).dataset.messageId)
        expect(ids).toEqual(messages.map(m => m.id))
        expect(new Set(ids).size).toBe(2)
      } finally { view.destroy(); dom.window.close(); globalThis.document = original }
    } finally { f.scheduler.stop() }
  })
}

test('BUG03B independent identical provider responses retain distinct message identities', async () => {
  const { f, accountId, room, schedule } = await setup(true)
  try {
    await schedule('identical_one', f.now); await f.scheduler.tick()
    const first = await f.service.read('alice', room.id, accountId)
    f.advance(60000)
    await f.scheduler.handle({ type: 'mochi:schedule', accountId, roomId: room.id, revision: first.revision, occurrenceId: 'identical_two', dueAt: f.now }, 'alice')
    await f.scheduler.tick()
    const stored = await f.service.read('alice', room.id, accountId), messages = stored.messages as any[]
    expect(f.calls).toHaveLength(2)
    expect(messages).toHaveLength(2)
    expect(messages[0].content).toBe(messages[1].content)
    expect(messages[0].id).not.toBe(messages[1].id)
    expect(messages[0].createdAt).not.toBe(messages[1].createdAt)
    expect(stored.notifications).toHaveLength(2)
    expect(JSON.stringify(f.calls[1].messages)).toContain(messages[0].content)
    f.restart(); await f.scheduler.tick(); expect(f.calls).toHaveLength(2)
  } finally { f.scheduler.stop() }
})

test('BUG03B persisted draft retries and restarts deliver that occurrence without reusing another output', async () => {
  const { f, accountId, room, schedule } = await setup(true)
  try {
    await schedule('older', f.now); await f.scheduler.tick()
    let stored = await f.service.read('alice', room.id, accountId)
    stored = await f.service.update('alice', { accountId, roomId: room.id, revision: stored.revision, title: stored.title, characterIds: stored.characterIds, settings: { ...stored.settings!, aiBehavior: true } })
    f.host.generate!.quiet = async request => { f.calls.push(request); return { content: JSON.stringify({ speakerId: 'alice_character', text: 'NEW_OCCURRENCE_PRIVATE_DRAFT', behavior: { delivery: 'later', delayMs: 60000 } }) } }
    await f.scheduler.handle({ type: 'mochi:schedule', accountId, roomId: room.id, revision: stored.revision, occurrenceId: 'new_draft', dueAt: f.now }, 'alice')
    await f.scheduler.tick()
    const draft = (await f.service.read('alice', room.id, accountId)).runtime!.jobs.at(-1)!
    expect(draft.draft!.text).toBe('NEW_OCCURRENCE_PRIVATE_DRAFT')
    expect(draft.id).toBe('new_draft')
    expect(draft.attempts).toBe(1)
    f.restart(); f.advance(60000)
    const write = f.host.userStorage.setJson
    let failed = false
    f.host.userStorage.setJson = async (path, data: any, options) => {
      if (!failed && data?.runtime?.jobs?.at(-1)?.status === 'delivered') { failed = true; throw Error('Disk write failed') }
      await write(path, data, options)
    }
    await f.scheduler.tick()
    expect(failed).toBe(true)
    expect((await f.service.read('alice', room.id, accountId)).messages).toHaveLength(1)
    expect(f.calls).toHaveLength(2)
    f.restart(); f.advance(60000); await f.scheduler.tick()
    stored = await f.service.read('alice', room.id, accountId)
    expect((stored.messages as any[]).map(m => m.content)).toEqual(['Synthetic reply', 'NEW_OCCURRENCE_PRIVATE_DRAFT'])
    expect((stored.messages[1] as any).requestId).toBe('server_new_draft')
    expect(stored.runtime!.jobs.at(-1)!.messageId).toBe((stored.messages[1] as any).id)
    expect(f.calls).toHaveLength(2)
    f.restart(); await f.scheduler.tick(); expect((await f.service.read('alice', room.id, accountId)).messages).toHaveLength(2); expect(f.calls).toHaveLength(2)
  } finally { f.scheduler.stop() }
})

test('BUG03 regression: same-revision runtime event refreshes settings without replacing room data', async () => {
  const { f, accountId, room, schedule } = await setup(true)
  const view = new MochiView(() => {}, () => {}, () => {}, () => ({ enabled: false, previews: false, visible: false }))
  try {
    await schedule(); view.state = await f.service.state('alice', accountId)
    view.select(room.id); view.editing = true
    f.revoke(); f.advance(60000); await f.scheduler.tick()
    const fresh = (await f.service.state('alice', accountId)).rooms[0]
    expect(fresh.revision).toBe(view.state.rooms[0].revision)
    expect(fresh.background!.jobs[0].status).toBe('paused')
    const event = f.events.filter(e => e.payload.type === 'mochi:scheduling_updated').at(-1)!
    view.receive(event.payload)
    expect(view.state.rooms[0].background!.jobs[0].status).toBe('paused')
    expect(view.state.rooms[0].revision).toBe(room.revision)
    expect(view.state.rooms[0].messages).toEqual([])
  } finally { view.destroy(); f.scheduler.stop() }
})
