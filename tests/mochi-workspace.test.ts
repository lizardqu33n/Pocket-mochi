import { test, expect } from 'bun:test'
import { JSDOM } from 'jsdom'
import { fixture } from './mochi-accounts.test.js'
import { createMochiWorkspace } from '../src/mochi/workspace.js'

function harness(f = fixture(), user = 'alice') {
  const dom = new JSDOM('<!doctype html><body><main id="shell"></main></body>', { pretendToBeVisual: true })
  const prior = globalThis.document; globalThis.document = dom.window.document
  const root = dom.window.document.getElementById('shell')!, listeners = new Set<(p: any) => void>(), sent: any[] = [], pending = new Set<Promise<void>>()
  let transportLive = true
  const originalSend = f.host.sendToFrontend
  f.host.sendToFrontend = (p, u) => { originalSend(p, u); if (u === user) for (const listener of listeners) listener(p) }
  const workspace = createMochiWorkspace({ root,
    notificationPolicy: () => ({ enabled: true, previews: false }),
    transport: {
      onBackendMessage: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
      sendToBackend: payload => {
        if (!transportLive) throw new Error('SPINDLE_FRONTEND_INACTIVE')
        sent.push(payload)
        const p: any = payload
        const task = (async () => {
          if (['mochi:background_account', 'mochi:background_room', 'mochi:schedule', 'mochi:schedule_cancel', 'mochi:presence', 'mochi:idle'].includes(p.type)) {
            await f.scheduler.handle(p, user); f.host.sendToFrontend({ type: 'mochi:state', requestId: p.requestId, state: await f.service.state(user, p.accountId) }, user)
          } else await f.service.handle(p, user)
        })()
        pending.add(task); void task.finally(() => pending.delete(task))
      },
    },
  })
  const flush = async () => { for (let i = 0; pending.size && i < 30; i++) await Promise.all([...pending]); expect(pending.size).toBe(0) }
  const click = (label: string) => { const node = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(n => n.getAttribute('aria-label') === label || n.textContent === label); expect(node).toBeDefined(); node!.click() }
  return { f, dom, root, workspace, sent, listeners, flush, click, rejectTransport: () => { transportLive = false },
    cleanup: () => { workspace.destroy(); f.scheduler.stop(); dom.window.close(); globalThis.document = prior },
  }
}

test('workspace starts without a phone/RP chat and uses account-wide last-used preference', async () => {
  const f = fixture(), a = await f.profile(); await f.select(a.id)
  const b = await f.profile('p2')
  f.service.resolvePhone = async () => 'rp_chat::rp_character::rp_owner'
  await f.service.selectAccount('alice', { accountId: b.id, revision: (await f.service.fictionalAccounts.bank('alice')).revision, phone: { chatId: 'rp_chat', characterId: 'rp_character', deviceOwnerActorId: 'rp_owner' } })
  const before = structuredClone([...f.files])
  const h = harness(f)
  try {
    h.workspace.open(); await h.flush()
    expect(h.workspace.apiVersion).toBe(1); expect(h.workspace.isOpen).toBe(true)
    expect(h.sent.map(p => p.type)).toEqual(['mochi:accounts', 'mochi:list'])
    expect(h.sent.every(p => p.phone === undefined && p.chatId === undefined && p.characterId === undefined)).toBe(true)
    expect(h.sent.at(-1).accountId).toBe(a.id)
    expect([...f.files]).toEqual(before)
    expect(h.root.textContent).toContain('New room')
  } finally { h.cleanup() }
})

test('workspace always-ask startup shows the existing picker and does not select another account implicitly', async () => {
  const f = fixture(), a = await f.profile(); await f.select(a.id)
  await f.service.fictionalAccounts.startup('alice', { revision: (await f.service.fictionalAccounts.bank('alice')).revision, preference: 'picker' })
  const h = harness(f)
  try {
    h.workspace.open(); h.workspace.open(); await h.flush()
    expect(h.sent.map(p => p.type)).toEqual(['mochi:accounts'])
    expect(h.root.textContent).toContain('Mary')
    h.click('Use Mochi account Mary'); await h.flush()
    expect(h.sent.at(-1).accountId).toBe(a.id)
  } finally { h.cleanup() }
})

test('close/return and unrelated RP/phone updates preserve selected room, settings draft and composer', async () => {
  const f = fixture(), a = await f.profile(), room = await f.room(a.id); await f.select(a.id)
  const h = harness(f)
  try {
    h.workspace.open(); await h.flush(); expect(h.workspace.openRoom(room.id)).toBe(true); await h.flush()
    const composer = h.root.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!
    composer.value = 'Unsent composer draft'; composer.dispatchEvent(new h.dom.window.Event('input')); composer.focus()
    h.workspace.close(); h.workspace.open(); h.workspace.open()
    expect(h.root.querySelector('[aria-label="Message"]')).toBe(composer)
    expect(composer.value).toBe('Unsent composer draft')
    h.click('Room settings')
    const instructions = h.root.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!
    instructions.value = 'Unsaved room settings'; instructions.dispatchEvent(new h.dom.window.Event('input'))
    const count = h.sent.length
    for (const listener of h.listeners) listener({ type: 'lumiphone:state', state: { chatId: 'another_rp', characterId: 'other_phone', activePersona: 'RP_PRIVATE' } })
    h.workspace.close(); h.workspace.open()
    expect(h.root.querySelector('[aria-label="Room instructions"]')).toBe(instructions)
    expect(instructions.value).toBe('Unsaved room settings')
    expect(h.sent).toHaveLength(count)
    h.workspace.refresh(); await h.flush()
    expect(h.root.querySelector<HTMLTextAreaElement>('[aria-label="Room instructions"]')!.value).toBe('Unsaved room settings')
    expect(h.sent.at(-1).accountId).toBe(a.id)
    expect((await f.service.read('alice', room.id, a.id)).settings!.instructions).toBe('')
  } finally { h.cleanup() }
})

test('workspace navigation rejects unloaded and foreign-account rooms', async () => {
  const f = fixture(), a = await f.profile(), b = await f.profile('p2'), one = await f.room(a.id), two = await f.room(b.id), foreign = await f.room(undefined, 'bob')
  await f.select(a.id)
  const h = harness(f)
  try {
    h.workspace.open(); await h.flush()
    expect(h.workspace.openRoom(two.id)).toBe(false); expect(h.workspace.openRoom(foreign.id)).toBe(false)
    expect(h.workspace.openRoom('invalid')).toBe(false)
    expect(h.workspace.openRoom(one.id)).toBe(true); await h.flush()
    expect(h.sent.filter(p => p.type === 'mochi:list').every(p => p.accountId === a.id)).toBe(true)
    expect(h.sent.some(p => p.roomId === two.id || p.roomId === foreign.id)).toBe(false)
  } finally { h.cleanup() }
})

test('closing stops this workspace interactive generation and preserves accepted messages', async () => {
  const f = fixture(), a = await f.profile(), room = await f.room(a.id); await f.select(a.id)
  const h = harness(f)
  let release!: (r: any) => void, ready!: () => void
  const started = new Promise<void>(r => { ready = r })
  try {
    h.workspace.open(); await h.flush(); h.workspace.openRoom(room.id); await h.flush()
    f.host.generate!.quiet = async request => { f.calls.push(request); ready(); return new Promise(r => { release = r }) }
    const composer = h.root.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!
    composer.value = 'Accepted before close'; composer.dispatchEvent(new h.dom.window.Event('input')); h.click('Send')
    await started; h.workspace.close()
    release({ content: '{"speakerId":"alice_character","text":"Unwanted late result"}' }); await h.flush()
    const saved = await f.service.read('alice', room.id, a.id)
    expect(saved.messages).toHaveLength(1); expect((saved.messages[0] as any).content).toBe('Accepted before close')
    expect(h.sent.filter(p => p.type === 'mochi:cancel')).toHaveLength(1)
    h.workspace.open(); expect(h.root.textContent).not.toContain('Unwanted late result')
  } finally { h.cleanup() }
})

test('hidden workspace retains unread scheduled messages without cancelling or marking them read', async () => {
  const f = fixture(), a = await f.profile(), room = await f.room(a.id); await f.select(a.id)
  await f.scheduler.configure('alice', true)
  await f.service.configureScheduledRoom('alice', { accountId: a.id, roomId: room.id, revision: room.revision, enabled: true })
  await f.scheduler.handle({ type: 'mochi:schedule', accountId: a.id, roomId: room.id, revision: room.revision, occurrenceId: 'workspace_hidden', dueAt: f.now + 60000 }, 'alice')
  const h = harness(f)
  try {
    h.workspace.open(); await h.flush(); h.workspace.openRoom(room.id); await h.flush(); h.workspace.close()
    f.advance(60000); await f.scheduler.tick(); await h.flush()
    const saved = await f.service.read('alice', room.id, a.id)
    expect(saved.runtime!.jobs[0].status).toBe('delivered'); expect(saved.messages).toHaveLength(1)
    expect(saved.notifications![0].read).toBe(false)
    expect(h.sent.some(p => p.type === 'mochi:schedule_cancel')).toBe(false)
    expect(h.root.querySelector('.mochi-notification-toast')).toBeNull()
    h.workspace.open(); await h.flush(); expect(h.root.querySelectorAll('.mochi-message')).toHaveLength(1)
    expect((await f.service.read('alice', room.id, a.id)).notifications![0].read).toBe(true)
    expect(h.sent.filter(p => p.type === 'mochi:notification_read')).toHaveLength(1)
  } finally { h.cleanup() }
})

test('destroy removes only owned content and subscription', async () => {
  const h = harness()
  try {
    const retained = h.dom.window.document.createElement('div'); retained.textContent = 'Pocket shell chrome'; h.root.append(retained)
    h.workspace.open(); await h.flush(); h.workspace.destroy(); h.workspace.destroy()
    expect(h.listeners.size).toBe(0); expect(h.root.querySelector('.mochi-workspace')).toBeNull()
    expect(h.root.contains(retained)).toBe(true)
    expect(() => h.workspace.open()).toThrow('destroyed')
  } finally { h.cleanup() }
})

test('real-user change recreates the workspace with a fresh isolated account scope', async () => {
  const f = fixture(), a = await f.profile(), b = await f.profile('p3', 'bob')
  await f.select(a.id); await f.service.selectAccount('bob', { accountId: b.id, revision: (await f.service.fictionalAccounts.bank('bob')).revision })
  const alice = harness(f)
  try { alice.workspace.open(); await alice.flush(); expect(alice.sent.at(-1).accountId).toBe(a.id) }
  finally { alice.cleanup() }
  const bob = harness(f, 'bob')
  try {
    bob.workspace.open(); await bob.flush()
    expect(bob.sent.at(-1).accountId).toBe(b.id)
    expect(bob.root.textContent).not.toContain('Mary')
    expect(bob.listeners.size).toBe(1)
  } finally { bob.cleanup() }
})

test('workspace retains legacy rooms without fictional-account assignment or data migration', async () => {
  const f = fixture(), legacy = await f.room(), before = structuredClone([...f.files])
  const h = harness(f)
  try {
    h.workspace.open(); await h.flush(); h.click('Unassigned legacy chats'); await h.flush()
    expect(h.workspace.openRoom(legacy.id)).toBe(true); await h.flush()
    expect(h.sent.every(p => p.accountId === undefined)).toBe(true)
    expect([...f.files]).toEqual(before)
  } finally { h.cleanup() }
})

test('inactive transport cannot leave workspace DOM or subscriptions behind during teardown', async () => {
  const f = fixture(), a = await f.profile(), room = await f.room(a.id); await f.select(a.id)
  const h = harness(f)
  let release!: (r: any) => void, ready!: () => void
  const started = new Promise<void>(r => { ready = r })
  try {
    h.workspace.open(); await h.flush(); h.workspace.openRoom(room.id); await h.flush()
    f.host.generate!.quiet = async () => { ready(); return new Promise(r => { release = r }) }
    const composer = h.root.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')!
    composer.value = 'Accepted before transport teardown'; composer.dispatchEvent(new h.dom.window.Event('input')); h.click('Send')
    await started; h.rejectTransport()
    expect(() => h.workspace.destroy()).toThrow('SPINDLE_FRONTEND_INACTIVE')
    expect(h.listeners.size).toBe(0); expect(h.root.querySelector('.mochi-workspace')).toBeNull()
    expect(h.workspace.isOpen).toBe(false); expect(() => h.workspace.open()).toThrow('destroyed')
    h.workspace.destroy() // cleanup completed despite the canceled transport
    release({ content: '{"speakerId":"alice_character","text":"Original request completion"}' }); await h.flush()
    expect(h.root.querySelector('.mochi-workspace')).toBeNull()
  } finally { h.cleanup() }
})
