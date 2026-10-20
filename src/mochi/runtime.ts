import type { SpindleAPI } from 'lumiverse-spindle-types'
import { MochiService } from './service.js'
import { MochiScheduler } from './scheduler.js'
import { assertTransferUnlocked } from './transfer-gate.js'

type Host = Pick<SpindleAPI, 'onFrontendMessage' | 'ui' | 'log'> & ConstructorParameters<typeof MochiService>[0]
export interface MochiRuntime { readonly service: MochiService; readonly scheduler: MochiScheduler; stop(): void }
const runtimes = new WeakMap<Host, MochiRuntime>()
const scheduling = new Set(['mochi:background_account', 'mochi:background_room', 'mochi:schedule', 'mochi:schedule_cancel', 'mochi:presence', 'mochi:idle'])

/** Host identity is authoritative; no phone resolver, RP registration or Pocket entry import. */
export function startMochiRuntime(host: Host): MochiRuntime {
  const existing = runtimes.get(host)
  if (existing) return existing
  let stopped = false
  const serviceHost = Object.create(host) as Host
  // Interruptions fail closed even if an operator restarts the normal package.
  serviceHost.userStorage = {
    exists: async (p, u) => { await assertTransferUnlocked(host, u); return host.userStorage.exists(p, u) },
    getJson: async (p, o) => { await assertTransferUnlocked(host, o.userId); return host.userStorage.getJson(p, o) },
    setJson: async (p, v, o) => { await assertTransferUnlocked(host, o.userId); return host.userStorage.setJson(p, v, o) },
    move: async (a, b, u) => { await assertTransferUnlocked(host, u); return host.userStorage.move(a, b, u) },
    list: async (p, u) => { await assertTransferUnlocked(host, u); return host.userStorage.list(p, u) },
  }
  serviceHost.sendToFrontend = (payload, user) => { if (!stopped) host.sendToFrontend(payload, user) }
  if (host.generate) serviceHost.generate = { quiet: async input => {
    if (stopped) throw new Error('Mochi runtime is stopped.')
    await assertTransferUnlocked(host, input.userId)
    const result = await host.generate!.quiet(input)
    if (stopped) throw new Error('Mochi runtime is stopped.')
    return result
  } }
  const service = new MochiService(serviceHost)
  const scheduler = new MochiScheduler(serviceHost, service, Date.now, message => host.log.warn(message))
  let unsubscribe: (() => void) | undefined
  const runtime: MochiRuntime = { service, scheduler, stop() {
    if (stopped) return
    stopped = true
    runtimes.delete(host)
    try { unsubscribe?.() } finally { scheduler.stop(); service.dispose() }
  } }
  try {
    unsubscribe = host.onFrontendMessage((payload, userId) => {
      if (stopped || !userId || !payload || typeof payload !== 'object') return
      const p = payload as Record<string, any>
      if (typeof p.type !== 'string' || !p.type.startsWith('mochi:')) return
      void (async () => {
        if (p.type === 'mochi:open_shell') { await host.ui.closeDrawer({ userId }); return }
        if (scheduling.has(p.type)) {
          try {
            await scheduler.handle(p, userId)
            serviceHost.sendToFrontend({ type: 'mochi:state', requestId: p.requestId, state: await service.state(userId, p.accountId) }, userId)
          } catch { serviceHost.sendToFrontend({ type: 'mochi:error', requestId: p.requestId, message: 'Unable to update background messaging. Check account opt-in, room sources, due time and storage.' }, userId) }
        } else await service.handle(p, userId)
      })().catch(() => { if (!stopped) host.log.warn('Mochi request failed safely; stored records were preserved.') })
    })
    runtimes.set(host, runtime)
    scheduler.start(true, false)
    return runtime
  } catch (error) { runtime.stop(); throw error }
}
