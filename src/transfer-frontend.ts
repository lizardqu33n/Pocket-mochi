import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { MOCHI_SIDEBAR_ICON } from './mochi/sidebar-icon.js'
import type { TransferArchive, TransferReview } from './mochi/transfer.js'

/** Operator-assisted maintenance UI, deliberately separate from the owner messenger/CSS. */
export function setup(ctx: SpindleFrontendContext): () => void {
  const tab = ctx.ui.registerDrawerTab({ id: 'mochi-transfer-maintenance', title: 'Mochi transfer', iconSvg: MOCHI_SIDEBAR_ICON })
  const root = document.createElement('section'), heading = document.createElement('h2'), notice = document.createElement('p')
  heading.textContent = 'Mochi transfer maintenance'
  notice.textContent = 'Use only after operator approval: stop the normal source and destination workers, preserve their original code/data, and keep the source disabled through import. No messaging or generation runs in this package. This transfers only the currently authenticated owner.'
  const status = document.createElement('p'); status.setAttribute('role', 'status')
  const preview = document.createElement('pre'); preview.style.whiteSpace = 'pre-wrap'
  const file = document.createElement('input'); file.type = 'file'; file.accept = '.json,application/json'; file.setAttribute('aria-label', 'Choose Mochi export')
  const label = document.createElement('label'), check = document.createElement('input'); check.type = 'checkbox'
  label.append(check, ' I reviewed this inventory, saved the original bytes, and confirm the old source is disabled. I consent to this operation for my authenticated owner ID.')
  const ownerLabel = document.createElement('label'), ownerInput = document.createElement('input')
  ownerLabel.append('Confirm the real owner ID shown above ', ownerInput)
  let owner = '', archive: TransferArchive | undefined, review: TransferReview | undefined, rollbackDigest = '', stopped = false, sequence = 0
  const pending = new Map<string, { resolve(v: any): void; reject(e: Error): void }>()
  const buttons: HTMLButtonElement[] = []
  const resetConsent = () => { check.checked = false; ownerInput.value = '' }
  const request = (action: string, more: Record<string, unknown> = {}) => new Promise<any>((resolve, reject) => {
    if (stopped) { reject(Error('Authentication changed. Reopen a fresh maintenance context.')); return }
    const requestId = 'transfer_' + (++sequence)
    pending.set(requestId, { resolve, reject })
    ctx.sendToBackend({ type: 'mochi-transfer:request', requestId, action, ...more })
  })
  const consent = (digest: string) => {
    if (!check.checked || !owner || ownerInput.value !== owner) throw Error('Review the inventory, check consent and type the matching authenticated owner ID.')
    return { ownerId: owner, digest, confirmed: true, sourceDisabled: true, originalsSaved: true }
  }
  const button = (title: string, work: () => Promise<void>) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = title
    b.onclick = () => { buttons.forEach(b => { b.disabled = true }); void work().catch(e => { status.textContent = e.message }).finally(() => { buttons.forEach(b => { b.disabled = stopped }) }) }
    buttons.push(b); return b
  }
  const exporter = button('Export my legacy Mochi data', async () => {
    consent('export')
    const a = await request('export', { confirmed: true }) as TransferArchive
    const blob = new Blob([JSON.stringify(a)], { type: 'application/json' }), url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = 'mochi-' + a.ownerId + '-' + a.digest.slice(0, 12) + '.json'; link.textContent = 'Save Mochi archive'
    root.append(link); link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000)
    preview.textContent = JSON.stringify({ ownerId: a.ownerId, digest: a.digest, files: a.files.map(({ base64, ...f }) => f) }, null, 2)
    status.textContent = 'Save the original export. Keep the source worker disabled. Original source bytes were not changed.'; resetConsent()
  })
  const reviewer = button('Review selected export', async () => {
    archive = undefined; review = undefined; rollbackDigest = ''; resetConsent()
    const chosen = file.files?.[0]
    if (!chosen || chosen.size > 48 * 1024 * 1024) throw Error('Choose a Mochi archive up to 48 MB.')
    const candidate = JSON.parse(await chosen.text())
    const result = await request('review', { archive: candidate })
    archive = candidate; review = result
    preview.textContent = JSON.stringify(result, null, 2); status.textContent = 'Review every file, dependency, warning and scheduler change before consenting.'
  })
  const importer = button('Import reviewed data with copied jobs paused', async () => {
    if (!archive || !review) throw Error('Review an archive first.')
    await request('import', { archive, consent: consent(review.digest) })
    status.textContent = 'Import complete. Original export bytes are retained in the journal. Restore the approved normal Mochi package. Copied jobs remain paused.'; resetConsent()
  })
  const rollbackReview = button('Review rollback and later-write backup', async () => {
    review = undefined; archive = undefined; resetConsent()
    const result = await request('review-rollback'); rollbackDigest = result.digest
    preview.textContent = JSON.stringify(result, null, 2); status.textContent = 'Rollback will retain all these current bytes, including later messages, in the journal before clearing imported Mochi files.'
  })
  const rollback = button('Roll back reviewed import', async () => {
    if (!rollbackDigest) throw Error('Review rollback first. For interrupted rollback, retain and reuse its reviewed digest with the operator recovery procedure.')
    await request('rollback', { consent: consent(rollbackDigest) })
    status.textContent = 'Rollback complete. The preserved source and journal archives remain. Later destination writes are retained separately in the rollback archive.'; resetConsent()
  })
  root.append(heading, notice, status, file, preview, ownerLabel, label, exporter, reviewer, importer, rollbackReview, rollback)
  tab.root.append(root)
  const dispose = () => {
    if (stopped) return
    stopped = true; archive = undefined; review = undefined; rollbackDigest = ''; owner = ''; preview.textContent = ''; file.value = ''; resetConsent()
    for (const p of pending.values()) p.reject(Error('Maintenance context ended. Retain the archive and journal for recovery.'))
    pending.clear(); off(); tab.destroy(); window.removeEventListener('lumiverse:auth-session-invalid', dispose)
  }
  const off = ctx.onBackendMessage(payload => {
    const p = payload as any
    if (stopped || !['mochi-transfer:result', 'mochi-transfer:error'].includes(p?.type)) return
    if (owner && owner !== p.ownerId) { dispose(); return }
    const task = pending.get(p.requestId)
    if (!task) return
    pending.delete(p.requestId)
    if (p.type === 'mochi-transfer:error') task.reject(Error(p.message))
    else task.resolve(p.result)
  })
  window.addEventListener('lumiverse:auth-session-invalid', dispose)
  ctx.onTeardown?.(dispose)
  void request('identity').then(identity => {
    if (stopped) return
    owner = identity.ownerId; status.textContent = 'Authenticated real owner: ' + owner + '. Mode: ' + identity.mode
    exporter.hidden = identity.mode !== 'source'
    for (const element of [file, reviewer, importer, rollbackReview, rollback]) element.hidden = identity.mode !== 'destination'
  }).catch(e => { if (!stopped) status.textContent = e.message })
  ctx.ready(); return dispose
}
