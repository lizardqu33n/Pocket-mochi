import type { SpindleAPI } from 'lumiverse-spindle-types'
import { exportArchive, reviewArchive, importArchive, reviewRollback, rollbackImport, type TransferHost } from './transfer.js'

export type MaintenanceMode = 'source' | 'destination'
/** No MochiService runtime, scheduler, Pocket controller, RP hooks or provider exists here. */
export function startTransferMaintenance(host: SpindleAPI, mode: MaintenanceMode): () => void {
  const expected = mode === 'source' ? 'lumiphone' : 'mochi'
  if (host.manifest.identifier !== expected) throw Error('Maintenance package namespace mismatch.')
  for (const api of ['readBinary', 'writeBinary', 'delete', 'list', 'exists', 'move', 'getJson', 'setJson', 'stat'] as const) {
    if (typeof host.userStorage[api] !== 'function') throw Error('Required host storage capability is unavailable: ' + api)
  }
  let stopped = false
  const serial = new Map<string, Promise<unknown>>()
  const unsubscribe = host.onFrontendMessage((payload, owner) => {
    const p = payload as any
    if (stopped || !owner || !p || typeof p !== 'object' || p.type !== 'mochi-transfer:request' || typeof p.requestId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(p.requestId)) return
    const task = (serial.get(owner) || Promise.resolve()).catch(() => {}).then(async () => {
      if (stopped) return
      let result: unknown
      try {
        // The payload's owner is never a storage principal. Always use host identity.
        if (host.users) await host.users.getRole(owner)
        if (stopped) return
        if (p.action === 'identity') result = { ownerId: owner, mode }
        else if (mode === 'source' && p.action === 'export') result = await exportArchive(host as TransferHost, owner, 'lumiphone', p.confirmed)
        else if (mode === 'destination' && p.action === 'review') result = await reviewArchive(p.archive, owner)
        else if (mode === 'destination' && p.action === 'import') { await importArchive(host as TransferHost, owner, p.archive, p.consent); result = { completed: true } }
        else if (mode === 'destination' && p.action === 'review-rollback') result = await reviewRollback(host as TransferHost, owner)
        else if (mode === 'destination' && p.action === 'rollback') { await rollbackImport(host as TransferHost, owner, p.consent); result = { rolledBack: true } }
        else throw Error('Unsupported maintenance operation.')
        if (!stopped) host.sendToFrontend({ type: 'mochi-transfer:result', requestId: p.requestId, ownerId: owner, result }, owner)
      } catch (error) {
        if (!stopped) host.sendToFrontend({ type: 'mochi-transfer:error', requestId: p.requestId, ownerId: owner, message: error instanceof Error ? error.message : 'Maintenance failed safely. Retain originals and inspect the journal.' }, owner)
      }
    })
    serial.set(owner, task)
    void task.finally(() => { if (serial.get(owner) === task) serial.delete(owner) })
  })
  return () => { stopped = true; unsubscribe() }
}
