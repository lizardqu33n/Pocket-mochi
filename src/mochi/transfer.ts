import { MochiService, type MochiHost } from './service.js'
import { MochiUIPreferences } from './ui-preferences.js'
import { MochiCharacterPreferences } from './character-preferences.js'
import { proveCoverage } from './memory.js'
import { readReactions } from './reactions.js'
import { replyIdentifier } from './replies.js'
import { identifier, TERMINAL } from './scheduling.js'
import type { MochiRoom, MochiMessage } from './types.js'

// Maintenance workers only. Never import this module to start a normal runtime.
export const TRANSFER_ROOT = 'mochi-transfer/v1/'
export const TRANSFER_LOCK = TRANSFER_ROOT + 'blocked.json'
const JOURNAL = TRANSFER_ROOT + 'journal.json'
const MAX_FILES = 5000, MAX_BYTES = 32 * 1024 * 1024
export type TransferHost = MochiHost & {
  userStorage: MochiHost['userStorage'] & {
    readBinary(path: string, user: string): Promise<Uint8Array>
    writeBinary(path: string, bytes: Uint8Array, user: string): Promise<void>
    delete(path: string, user: string): Promise<void>
    stat(path: string, user: string): Promise<{ exists: boolean; isFile: boolean; sizeBytes: number }>
  }
}
export interface TransferFile { path: string; bytes: number; sha256: string; base64: string }
export interface TransferArchive {
  format: 'mochi-transfer'; version: 1; ownerId: string; source: 'lumiphone' | 'mochi'
  createdAt: string; files: TransferFile[]; digest: string
  profileSourceSha256?: string
  excluded: Array<{ path: 'mochi/v1/scheduler-accounts.json'; bytes: number; sha256: string; reason: 'extension-registry-not-owner-data' }>
}
export interface TransferConsent {
  ownerId: string; digest: string; confirmed: true; sourceDisabled: true; originalsSaved: true
  copyPocketProfiles?: true
}
export interface TransferReview {
  digest: string; ownerId: string; files: Array<Omit<TransferFile, 'base64'>>
  accounts: number; rooms: number; messages: number; legacyRooms: number; pendingJobs: number
  pocketSourceIds: string[]; imageReferences: string[]; nativeReferences: string[]
  warnings: string[]; changes: string[]
  excluded: TransferArchive['excluded']
}
interface Journal {
  version: 1; ownerId: string; digest: string; archive: TransferArchive
  phase: 'staging' | 'copying' | 'committed' | 'rolling-back' | 'rolled-back'
  files: TransferFile[]; rollback?: TransferFile[]; rollbackDigest?: string
}
const encoder = new TextEncoder(), decoder = new TextDecoder('utf-8', { fatal: true })
function fail(message: string): never { throw Error(message + ' Original records were preserved.') }
const hex = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v)
export async function sha256(bytes: Uint8Array): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>)), b => b.toString(16).padStart(2, '0')).join('')
}
function encode(bytes: Uint8Array): string {
  let result = ''
  for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(result)
}
function decode(base64: string): Uint8Array {
  if (typeof base64 !== 'string' || base64.length > MAX_BYTES * 1.4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) fail('Invalid archive encoding.')
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}
export function transferPath(path: string, registry = false): string {
  if (typeof path !== 'string' || path.includes('\\') || path.includes('..') || path.includes('%') || path.length > 300) fail('Unsafe transfer path.')
  if (registry && path === 'mochi/v1/scheduler-accounts.json') return path
  if (path === 'identity-profiles.json') return path
  if (!/^mochi\/v1\/(?:fictional-accounts|generation-prompts|shared-presentation|scheduler)\.json$/.test(path) &&
      !/^mochi\/v1\/(?:rooms\/room_[a-f0-9]{32}|(?:presets|ui-preferences)\/(?:legacy|account_[a-f0-9]{32})|character-preferences\/[A-Za-z0-9_-]{1,180})\.json$/.test(path)) fail('Unsupported file in Mochi inventory: ' + path)
  return path
}
async function file(path: string, bytes: Uint8Array, registry = false): Promise<TransferFile> {
  transferPath(path, registry)
  if (bytes.length > MAX_BYTES) fail('Transfer file exceeds limit.')
  return { path, bytes: bytes.length, sha256: await sha256(bytes), base64: encode(bytes) }
}
async function inventoryDigest(files: TransferFile[]): Promise<string> {
  return sha256(encoder.encode(JSON.stringify(files.map(({ path, bytes, sha256 }) => [path, bytes, sha256]))))
}
export async function archiveDigest(a: Omit<TransferArchive, 'digest'>): Promise<string> {
  return sha256(encoder.encode(JSON.stringify([a.format, a.version, a.ownerId, a.source, a.createdAt, await inventoryDigest(a.files), a.excluded, a.profileSourceSha256 || null])))
}
function credentials(value: unknown, depth = 0): void {
  if (depth > 80) fail('Excessive record nesting.')
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (/^(?:__proto__|prototype|constructor|token|secret)$/i.test(key) || /api.?key|access.?token|refresh.?token|auth.?token|authorization|password|credential|client.?secret/i.test(key)) fail('Unsupported sensitive field in transfer.')
    credentials(child, depth + 1)
  }
}
async function validatedFiles(a: TransferArchive, owner: string): Promise<Map<string, any>> {
  identifier(owner)
  if (!a || a.format !== 'mochi-transfer' || a.version !== 1 || a.ownerId !== owner || !['lumiphone', 'mochi'].includes(a.source) || !Number.isFinite(Date.parse(a.createdAt)) || !Array.isArray(a.files) || a.files.length > MAX_FILES || !hex(a.digest)) fail('Unsupported archive, owner or manifest.')
  if (!Array.isArray(a.excluded) || a.excluded.length > 1 || a.excluded.some(f => !f || f.path !== 'mochi/v1/scheduler-accounts.json' || f.reason !== 'extension-registry-not-owner-data' || !hex(f.sha256) || !Number.isSafeInteger(f.bytes) || f.bytes < 0)) fail('Unsupported excluded-file manifest.')
  if (a.profileSourceSha256 !== undefined && !hex(a.profileSourceSha256)) fail('Invalid original profile-bank checksum.')
  const records = new Map<string, any>(), paths: string[] = []
  let total = 0
  for (const f of a.files) {
    transferPath(f?.path)
    if (records.has(f.path) || !Number.isSafeInteger(f.bytes) || f.bytes < 0 || !hex(f.sha256)) fail('Duplicate or damaged inventory.')
    const bytes = decode(f.base64)
    total += bytes.length
    if (total > MAX_BYTES || bytes.length !== f.bytes || await sha256(bytes) !== f.sha256) fail('Archive checksum or size mismatch.')
    let record: any
    try { record = JSON.parse(decoder.decode(bytes)) } catch { fail('Unreadable JSON record.') }
    if (!record || typeof record !== 'object' || Array.isArray(record) || record.version !== 1 || record.ownerId !== undefined && record.ownerId !== owner) fail('Unsupported schema or record owner.')
    credentials(record)
    records.set(f.path, record); paths.push(f.path)
  }
  if (paths.join('\n') !== [...paths].sort().join('\n') || await archiveDigest(a) !== a.digest) fail('Inventory order or manifest checksum mismatch.')
  return records
}
function readonlyHost(records: Map<string, any>, owner: string): MochiHost {
  const check = (user: string) => { if (user !== owner) fail('Owner isolation failure.') }
  const denied = async (): Promise<never> => fail('Read-only validation attempted a write or host call.')
  return {
    userStorage: {
      exists: async (p, u) => { check(u); return records.has(p) },
      getJson: async (p, o) => { check(o.userId); if (!records.has(p)) return o.fallback; return structuredClone(records.get(p)) },
      list: async (p, u) => { check(u); return [...records.keys()].filter(k => k.startsWith(p)).map(k => k.slice(p.length)) },
      setJson: denied, move: denied,
    },
    characters: { get: denied, list: denied }, personas: { get: denied, list: denied },
    permissions: { has: () => false }, sendToFrontend: () => fail('Validation attempted transport.'), generate: { quiet: denied },
  }
}
/** Validate every saved record, all histories and dependencies without live/private source reads. */
export async function reviewArchive(a: TransferArchive, owner: string): Promise<TransferReview> {
  const records = await validatedFiles(a, owner), host = readonlyHost(records, owner)
  const service = new MochiService(host), accounts = service.fictionalAccounts
  const bank = await accounts.bank(owner), ids = new Set(bank.accounts.map(a => a.id))
  const ui = new MochiUIPreferences(host, accounts), characters = new MochiCharacterPreferences(host, accounts)
  const review: TransferReview = { digest: a.digest, ownerId: owner, files: a.files.map(({ base64, ...f }) => f), excluded: a.excluded, accounts: bank.accounts.length, rooms: 0, messages: 0, legacyRooms: 0, pendingJobs: 0, pocketSourceIds: [], imageReferences: [], nativeReferences: [], warnings: [], changes: [] }
  const pocket = new Set<string>(), images = new Set<string>(), native = new Set<string>()
  const refs = (value: any): void => {
    if (!value || typeof value !== 'object') return
    if (value.source === 'pocket') { identifier(value.sourceId); pocket.add(value.sourceId) }
    if (value.source === 'lumiverse') { identifier(value.sourceId); native.add('persona:' + value.sourceId) }
    for (const child of Object.values(value)) {
      if (typeof child === 'string') {
        for (const match of child.matchAll(/\/api\/v1\/images\/([A-Za-z0-9_-]+)/g)) images.add(match[1])
      } else refs(child)
    }
  }
  try {
    for (const [path, value] of records) {
      refs(value)
      if (path.includes('/rooms/')) {
        if (path !== `mochi/v1/rooms/${value.id}.json`) fail('Room path and stable identifier disagree.')
        const room = await service.validateTransferredRoom(owner, value.id)
        if (room.accountId && !ids.has(room.accountId)) fail('Missing fictional account dependency.')
        review.rooms++; if (!room.accountId) review.legacyRooms++
        room.characterIds.forEach(id => native.add('character:' + id))
        if (room.settings?.connectionId) native.add('connection:' + identifier(room.settings.connectionId))
        const seen = new Set<string>()
        for (const raw of room.messages) {
          const m = raw as MochiMessage
          if (!replyIdentifier(m?.id)) fail('Invalid stable message identifier.')
          if (seen.has(m.id) || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 100000 || typeof m.name !== 'string' || typeof m.avatarUrl !== 'string' || !Number.isFinite(Date.parse(m.createdAt)) || typeof m.requestId !== 'string') fail('Damaged or ambiguous message history.')
          if (m.replyTo && !room.messages.some((r: any) => r.id === m.replyTo)) fail('Orphaned quote reference; repair explicitly.')
          readReactions(m.reactions, room)
          if (m.previousVersions !== undefined && (!Array.isArray(m.previousVersions) || m.previousVersions.some(v => !v || typeof v.content !== 'string' || typeof v.name !== 'string' || typeof v.avatarUrl !== 'string' || !Number.isFinite(Date.parse(v.savedAt))))) fail('Damaged message revision history.')
          seen.add(m.id); review.messages++
        }
        if (room.chatPins?.some(id => !seen.has(id))) fail('Orphaned pin reference; repair explicitly.')
        for (const summary of room.memory?.versions || []) if (summary.coverage) {
          const actual = await proveCoverage(room, summary.coverage.boundaryId)
          if (actual.count !== summary.coverage.count || actual.digest !== summary.coverage.digest) fail('Stale summary coverage; review and repair explicitly.')
        }
        await service.presets.resolve(owner, room)
        review.pendingJobs += room.runtime?.jobs.filter(j => !TERMINAL.has(j.status)).length || 0
      } else if (path.includes('/presets/')) {
        const id = path.split('/').at(-1)!.slice(0, -5)
        if (id !== 'legacy' && !ids.has(id)) fail('Orphaned preset account.')
        await service.presets.read(owner, id === 'legacy' ? undefined : id)
      } else if (path.includes('/ui-preferences/')) {
        await ui.read(owner, value.accountId, true)
        if (path !== `mochi/v1/ui-preferences/${value.accountId || 'legacy'}.json`) fail('Layout path does not match its account.')
      } else if (path.includes('/character-preferences/')) {
        if (path !== `mochi/v1/character-preferences/${value.characterId}.json`) fail('Character preference path mismatch.')
        await characters.read(owner, value.characterId, false)
        native.add('character:' + identifier(value.characterId))
      } else if (path.endsWith('/generation-prompts.json')) {
        const prompts = await service.generationPrompts.read(owner)
        for (const key of Object.keys(prompts.entries)) {
          const parts = JSON.parse(key)
          if (['account', 'character'].includes(parts[0]) && parts[1] && !ids.has(parts[1])) fail('Orphaned prompt account.')
          if (parts[0] === 'character') native.add('character:' + identifier(parts[2]))
        }
      } else if (path.endsWith('/shared-presentation.json')) await ui.shared(owner)
      else if (path.endsWith('/scheduler.json')) {
        if (typeof value.enabled !== 'boolean' || !Array.isArray(value.attempts) || value.attempts.length > 60 || value.attempts.some((v: any) => !v || !Number.isSafeInteger(v.at) || v.at < 0 || typeof v.roomId !== 'string')) fail('Damaged scheduler settings.')
      }
    }
  } finally { service.dispose() }
  review.pocketSourceIds = [...pocket].sort(); review.imageReferences = [...images].sort(); review.nativeReferences = [...native].sort()
  const profiles = records.get('identity-profiles.json')
  if (profiles) {
    if (!a.profileSourceSha256 || profiles.ownerId !== owner || Object.keys(profiles).some(k => !['version', 'ownerId', 'entries'].includes(k)) || !Array.isArray(profiles.entries) || profiles.entries.length !== pocket.size || !pocket.size || new Set(profiles.entries.map((p: any) => p?.id)).size !== pocket.size) fail('Selected Pocket profile inventory does not match required identities.')
    for (const p of profiles.entries) {
      if (!p || !pocket.has(p.id) || p.kind !== 'persona' || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 120 || Object.keys(p).some(k => !['id', 'kind', 'sourceId', 'name', 'pronouns', 'role', 'identityBrief', 'phoneProfile', 'updatedAt'].includes(k))) fail('Unsupported selected Pocket persona; repair explicitly.')
      for (const [key, max] of [['sourceId', 180], ['pronouns', 120], ['role', 120], ['identityBrief', 1200], ['updatedAt', 80]] as const) if (p[key] !== undefined && (typeof p[key] !== 'string' || p[key].length > max)) fail('Damaged selected Pocket persona.')
      if (p.phoneProfile !== undefined) {
        if (!p.phoneProfile || typeof p.phoneProfile !== 'object' || Array.isArray(p.phoneProfile) || Object.keys(p.phoneProfile).some(k => !['personality', 'appearance', 'textingStyle'].includes(k))) fail('Unsupported Pocket persona fields.')
        for (const [key, max] of [['personality', 600], ['appearance', 360], ['textingStyle', 600]] as const) if (p.phoneProfile[key] !== undefined && (typeof p.phoneProfile[key] !== 'string' || p.phoneProfile[key].length > max)) fail('Damaged Pocket persona fields.')
      }
    }
  }
  review.warnings.push('Source must remain disabled from final export through completed import. Operator attestation is required; the host provides no cross-extension lock.', 'Native assets and image bytes are not copied. References must be available to this same owner on this host.', 'Browser session-only drafts and unrelated Pocket/RP records are not included.', 'Global scheduler registry is not copied; imported owner history is retained and all copied dispatch is disabled.')
  if (pocket.size) review.warnings.push('Pocket identities retain source:pocket. Import requires a consented export of exactly these backing profiles and a separate copy checkbox. Existing target profile banks cause collision refusal. Missing source profiles must be explicitly repaired before re-export; this tool never reads another extension namespace.')
  review.changes.push('Every copied nonterminal job becomes paused; room and idle scheduling are disabled. Account background opt-in becomes false. Original bytes are retained in the journal archive.', 'Copied jobs remain paused even after enabling account background messaging; recreate or explicitly repair them after review. Import never resumes a job.')
  return review
}
async function snapshot(host: TransferHost, owner: string, profiles = false): Promise<TransferFile[]> {
  const names = (await host.userStorage.list('mochi/v1/', owner)).map(n => 'mochi/v1/' + n.replaceAll('\\', '/')).sort()
  if (profiles && await host.userStorage.exists('identity-profiles.json', owner)) names.push('identity-profiles.json')
  names.sort()
  if (names.length > MAX_FILES || new Set(names).size !== names.length) fail('Invalid source inventory.')
  const files: TransferFile[] = []
  let total = 0
  for (const path of names) {
    transferPath(path, true)
    const stat = await host.userStorage.stat(path, owner)
    if (!stat.exists || !stat.isFile || !Number.isSafeInteger(stat.sizeBytes) || stat.sizeBytes < 0 || (total += stat.sizeBytes) > MAX_BYTES) fail('Invalid or oversized source file inventory.')
    files.push(await file(path, await host.userStorage.readBinary(path, owner), true))
  }
  if (files.reduce((sum, f) => sum + f.bytes, 0) > MAX_BYTES) fail('Transfer exceeds archive limit.')
  return files
}
function consent(c: TransferConsent, owner: string, digest: string): void {
  if (!c || c.confirmed !== true || c.sourceDisabled !== true || c.originalsSaved !== true || c.ownerId !== owner || c.digest !== digest) fail('Explicit same-owner reviewed consent is required.')
}
/** Export only this extension's authenticated owner's Mochi files. No writes. */
export async function exportArchive(host: TransferHost, owner: string, source: TransferArchive['source'], confirmed: unknown, includeProfiles = false): Promise<TransferArchive> {
  identifier(owner)
  if (confirmed !== true) fail('Explicit export consent is required.')
  const all = await snapshot(host, owner), registry = all.filter(f => f.path === 'mochi/v1/scheduler-accounts.json')
  const files = all.filter(f => f.path !== 'mochi/v1/scheduler-accounts.json')
  const excluded: TransferArchive['excluded'] = registry.map(f => ({ path: 'mochi/v1/scheduler-accounts.json', bytes: f.bytes, sha256: f.sha256, reason: 'extension-registry-not-owner-data' }))
  const a: TransferArchive = { format: 'mochi-transfer', version: 1, ownerId: owner, source, createdAt: new Date().toISOString(), files, excluded, digest: '' }
  a.digest = await archiveDigest(a)
  const review = await reviewArchive(a, owner)
  if (includeProfiles && review.pocketSourceIds.length) {
    const stat = await host.userStorage.stat('identity-profiles.json', owner)
    if (!stat.exists || !stat.isFile || stat.sizeBytes > 1024 * 1024) fail('Missing or oversized source Pocket profile bank; repair explicitly.')
    const bytes = await host.userStorage.readBinary('identity-profiles.json', owner)
    const bank = JSON.parse(decoder.decode(bytes))
    if (bank?.version !== 1 || !Array.isArray(bank.entries)) fail('Damaged source Pocket profile bank.')
    const entries = bank.entries.filter((p: any) => p?.kind === 'persona' && review.pocketSourceIds.includes(p.id))
    a.profileSourceSha256 = await sha256(bytes)
    a.files.push(await file('identity-profiles.json', encoder.encode(JSON.stringify({ version: 1, ownerId: owner, entries }))))
    a.files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
    a.digest = await archiveDigest(a)
    await reviewArchive(a, owner)
    if (await sha256(await host.userStorage.readBinary('identity-profiles.json', owner)) !== a.profileSourceSha256) fail('Source profiles changed during export.')
  }
  if (await inventoryDigest(await snapshot(host, owner)) !== await inventoryDigest(all)) fail('Source changed during export.')
  return a
}
async function loadJournal(host: TransferHost, owner: string): Promise<Journal | undefined> {
  if (!await host.userStorage.exists(JOURNAL, owner)) return
  const j = await host.userStorage.getJson(JOURNAL, { userId: owner }) as Journal
  if (!j || j.version !== 1 || j.ownerId !== owner || !hex(j.digest) || !['staging', 'copying', 'committed', 'rolling-back', 'rolled-back'].includes(j.phase)) fail('Damaged transfer journal; operator recovery required.')
  await validatedFiles(j.archive, owner)
  if (j.archive.digest !== j.digest || JSON.stringify(j.files) !== JSON.stringify(await pausedFiles(j.archive))) fail('Journal checksum mismatch; operator recovery required.')
  if (j.rollback) {
    if (await inventoryDigest(j.rollback) !== j.rollbackDigest) fail('Rollback archive checksum mismatch.')
    for (const f of j.rollback) {
      transferPath(f.path, true)
      const bytes = decode(f.base64)
      if (bytes.length !== f.bytes || await sha256(bytes) !== f.sha256) fail('Rollback bytes are damaged; no live file was removed.')
    }
  }
  return j
}
async function saveJournal(host: TransferHost, owner: string, j: Journal): Promise<void> {
  await host.userStorage.setJson(JOURNAL + '.pending', j, { userId: owner })
  await host.userStorage.move(JOURNAL + '.pending', JOURNAL, owner)
}
async function pausedFiles(a: TransferArchive): Promise<TransferFile[]> {
  const files: TransferFile[] = []
  for (const f of a.files) {
    const value = JSON.parse(decoder.decode(decode(f.base64)))
    let changed = false
    if (f.path.endsWith('/scheduler.json')) { value.enabled = false; changed = true }
    if (f.path.includes('/rooms/') && value.runtime) {
      value.runtime.enabled = false
      if (value.runtime.idle) value.runtime.idle.enabled = false
      for (const job of value.runtime.jobs) if (!TERMINAL.has(job.status)) { job.status = 'paused'; delete job.claim; delete job.leaseUntil }
      changed = true
    }
    files.push(changed ? await file(f.path, encoder.encode(JSON.stringify(value))) : f)
  }
  return files
}
async function verifyReferences(host: TransferHost, owner: string, review: TransferReview, a: TransferArchive, c: TransferConsent): Promise<void> {
  if (review.pocketSourceIds.length) {
    if (!a.files.some(f => f.path === 'identity-profiles.json') || c.copyPocketProfiles !== true) fail('Referenced Pocket profiles need explicit selected-source export and copy/repair consent before import.')
  }
  for (const reference of review.nativeReferences) {
    const [kind, id] = reference.split(':')
    if (kind === 'connection') {
      if (!host.connections || !await host.connections.get(id, owner)) fail('Missing owner connection reference: ' + id)
      continue
    }
    if (!host.permissions.has(kind === 'persona' ? 'personas' : 'characters') || !await (kind === 'persona' ? host.personas : host.characters).get(id, owner)) fail('Missing native reference: ' + reference)
  }
  for (const id of review.imageReferences) if (!host.images || !host.permissions.has('images') || !await host.images.get(id, owner)) fail('Missing owner image reference: ' + id)
}
/** Exclusive maintenance worker: review first, explicit consent second, then resumable commit. */
export async function importArchive(host: TransferHost, owner: string, a: TransferArchive, c: TransferConsent): Promise<void> {
  const review = await reviewArchive(a, owner)
  consent(c, owner, a.digest)
  if (a.source !== 'lumiphone') fail('This path accepts legacy lumiphone exports only.')
  await verifyReferences(host, owner, review, a, c)
  let journal = await loadJournal(host, owner)
  if (journal && journal.digest !== a.digest) fail('A different transfer already owns this destination.')
  if (journal?.phase === 'rolled-back' || journal?.phase === 'rolling-back') fail('Transfer was rolled back or is rolling back; retain its archive and use a fresh destination.')
  if (journal?.phase === 'committed') {
    if (await host.userStorage.exists(TRANSFER_LOCK, owner)) await host.userStorage.delete(TRANSFER_LOCK, owner)
    return // Idempotent retry never overwrites later messages.
  }
  if (!journal) {
    if ((await host.userStorage.list('mochi/v1/', owner)).length) fail('Destination is not empty; collision refused.')
    if (a.files.some(f => f.path === 'identity-profiles.json') && await host.userStorage.exists('identity-profiles.json', owner)) fail('Destination profile bank exists; collision refused, never silently relink.')
    if (await host.userStorage.exists(TRANSFER_LOCK, owner)) {
      const lock = await host.userStorage.getJson(TRANSFER_LOCK, { userId: owner }) as any
      if (lock?.version !== 1 || lock.ownerId !== owner || lock.digest !== a.digest) fail('Unfinished transfer lock; inspect before recovery.')
    }
    await host.userStorage.setJson(TRANSFER_LOCK, { version: 1, ownerId: owner, digest: a.digest }, { userId: owner })
    journal = { version: 1, ownerId: owner, digest: a.digest, archive: a, phase: 'staging', files: await pausedFiles(a) }
    await saveJournal(host, owner, journal)
  }
  if (!await host.userStorage.exists(TRANSFER_LOCK, owner)) fail('Transfer lock is missing; recovery refused.')
  const expected = new Map(journal.files.map(f => [f.path, f]))
  for (const name of await host.userStorage.list('mochi/v1/', owner)) {
    const path = 'mochi/v1/' + name.replaceAll('\\', '/'), f = expected.get(path)
    if (!f || await sha256(await host.userStorage.readBinary(path, owner)) !== f.sha256) fail('Destination changed during transfer; collision refused.')
  }
  for (const f of journal.files) {
    const path = TRANSFER_ROOT + 'staging/' + f.path
    if (!await host.userStorage.exists(path, owner) || await sha256(await host.userStorage.readBinary(path, owner)) !== f.sha256) await host.userStorage.writeBinary(path, decode(f.base64), owner)
    if (await sha256(await host.userStorage.readBinary(path, owner)) !== f.sha256) fail('Staging verification failed.')
  }
  journal.phase = 'copying'; await saveJournal(host, owner, journal)
  for (const f of journal.files) {
    if (await host.userStorage.exists(f.path, owner)) {
      if (await sha256(await host.userStorage.readBinary(f.path, owner)) !== f.sha256) fail('Destination collision during commit.')
      continue
    }
    await host.userStorage.move(TRANSFER_ROOT + 'staging/' + f.path, f.path, owner)
    if (await sha256(await host.userStorage.readBinary(f.path, owner)) !== f.sha256) fail('Committed file verification failed.')
  }
  // Marker deletion is the final activation point, after the durable completed journal.
  journal.phase = 'committed'; await saveJournal(host, owner, journal)
  await host.userStorage.delete(TRANSFER_LOCK, owner)
}
export async function reviewRollback(host: TransferHost, owner: string): Promise<{ digest: string; files: Array<Omit<TransferFile, 'base64'>> }> {
  const j = await loadJournal(host, owner)
  if (!j || !['staging', 'copying', 'committed', 'rolling-back', 'rolled-back'].includes(j.phase)) fail('No import available for rollback.')
  if (j.rollback && j.rollbackDigest) return { digest: j.rollbackDigest, files: j.rollback.map(({ base64, ...f }) => f) }
  const files = await snapshot(host, owner, j.files.some(f => f.path === 'identity-profiles.json'))
  return { digest: await inventoryDigest(files), files: files.map(({ base64, ...f }) => f) }
}
/** Preserve ALL later Mochi writes in a durable rollback archive before removing live copies. */
export async function rollbackImport(host: TransferHost, owner: string, c: TransferConsent): Promise<void> {
  const j = await loadJournal(host, owner)
  if (!j || !['staging', 'copying', 'committed', 'rolling-back', 'rolled-back'].includes(j.phase)) fail('No import available for rollback.')
  if (j.phase === 'rolled-back') {
    consent(c, owner, j.rollbackDigest!)
    if (await host.userStorage.exists(TRANSFER_LOCK, owner)) await host.userStorage.delete(TRANSFER_LOCK, owner)
    return
  }
  if (['staging', 'copying', 'committed'].includes(j.phase)) {
    const files = await snapshot(host, owner, j.files.some(f => f.path === 'identity-profiles.json')), digest = await inventoryDigest(files)
    consent(c, owner, digest)
    await host.userStorage.setJson(TRANSFER_LOCK, { version: 1, ownerId: owner, digest }, { userId: owner })
    j.rollback = files; j.rollbackDigest = digest; j.phase = 'rolling-back'
    await saveJournal(host, owner, j)
  } else consent(c, owner, j.rollbackDigest!)
  if (!j.rollback || !await host.userStorage.exists(TRANSFER_LOCK, owner)) fail('Rollback recovery is incomplete.')
  const expected = new Map(j.rollback.map(f => [f.path, f]))
  for (const f of j.rollback) if (await host.userStorage.exists(f.path, owner) && await sha256(await host.userStorage.readBinary(f.path, owner)) !== f.sha256) fail('Rollback source changed; retain the newer bytes before recovery.')
  for (const name of await host.userStorage.list('mochi/v1/', owner)) {
    const path = 'mochi/v1/' + name.replaceAll('\\', '/'), f = expected.get(path)
    if (!f || await sha256(await host.userStorage.readBinary(path, owner)) !== f.sha256) fail('Rollback source changed; recover without overwriting later writes.')
  }
  // Journal already contains every original byte including writes after import.
  for (const f of j.rollback) if (await host.userStorage.exists(f.path, owner)) await host.userStorage.delete(f.path, owner)
  j.phase = 'rolled-back'; await saveJournal(host, owner, j)
  await host.userStorage.delete(TRANSFER_LOCK, owner)
}
