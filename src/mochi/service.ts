import { roomId, defaultMochiSettings, type MochiSettings, type MochiMessage, type MochiPersona, type MochiRoom, type MochiState } from './types.js'
import { generateMochiReply, validateMochiSources } from './generation.js'
import { identifier, MAX_JOBS, publicRuntime, scheduleInput, temporaryFailure, TERMINAL, validateRuntime, type ScheduledJob } from './scheduling.js'
import { delayFor, eligibleResponders, minimumDelay, statusFor, validatePresence } from './presence.js'

// New implementation. No Character Chatroom source is included.
export interface MochiHost {
  storage?: { exists(path: string): Promise<boolean>; getJson(path: string, options?: { fallback?: unknown }): Promise<any>; setJson(path: string, data: unknown): Promise<void>; move(from: string, to: string): Promise<unknown> }
  users?: { getRole(userId?: string): Promise<unknown> }
  userStorage: {
    exists(path: string, userId: string): Promise<boolean>
    getJson(path: string, options: { userId: string; fallback?: unknown }): Promise<unknown>
    setJson(path: string, data: unknown, options: { userId: string }): Promise<void>
    move(from: string, to: string, userId: string): Promise<unknown>
    list(prefix: string, userId: string): Promise<string[]>
  }
  characters: { get(id: string, userId: string): Promise<any>; list(options: any): Promise<any> }
  personas: { get(id: string, userId: string): Promise<any>; list(options: any): Promise<any> }
  permissions: { has(name: string): boolean }
  sendToFrontend(payload: unknown, userId: string): void
  connections?: { get(id: string, userId: string): Promise<any>; list(userId: string): Promise<any[]> }
  tokens?: { countMessages(messages: any[], options: any): Promise<any> }
  generate?: { quiet(input: any): Promise<any> }
}
const ROOT = 'mochi/v1/rooms/'
const pathFor = (id: unknown) => `${ROOT}${roomId(id)}.json`
function text(value: unknown, max: number, required = false): string {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('Invalid Mochi field.')
  return value.trim()
}
function entityId(value: unknown): string {
  const id = text(value, 180, true)
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error('Invalid identity identifier.')
  return id
}
function validateRoom(value: any, id: string): MochiRoom {
  if (!value || value.version !== 1 || value.id !== id || !Number.isSafeInteger(value.revision) || value.revision < 1 ||
      !Array.isArray(value.messages) || !Array.isArray(value.characterIds) || !value.persona ||
      !['manual', 'lumiverse', 'pocket'].includes(value.persona.source)) throw new Error('Unsupported or damaged room; its file has been preserved.')
  text(value.title, 120, true)
  text(value.persona.name, 120, true)
  text(value.persona.description, 12000)
  text(value.persona.sourceId, 180)
  text(value.persona.avatarUrl, 500)
  text(value.createdAt, 80, true); text(value.updatedAt, 80, true)
  if (value.characterIds.length > 12 || new Set(value.characterIds).size !== value.characterIds.length) throw new Error('Invalid saved room membership.')
  value.characterIds.forEach(entityId)
  return value
}
export class MochiService {
  backgroundEnabled: (userId: string) => Promise<boolean> = async () => false
  private locks = new Map<string, Promise<unknown>>()
  private jobs = new Map<string, { requestId: string; controller: AbortController }>()
  private pending = new Map<string, Set<{ requestId: string; controller: AbortController }>>()
  private jobKey(user: string, id: string): string { return JSON.stringify([user, id]) }
  private settings(input: any, ids: string[]): MochiSettings {
    const s = { ...defaultMochiSettings(), ...input }
    if (typeof s.autoReply !== 'boolean' || !Number.isSafeInteger(s.contextTokens) || s.contextTokens < 1024 || s.contextTokens > 131072 || !Number.isSafeInteger(s.outputTokens) || s.outputTokens < 128 || s.outputTokens > 8192 || s.outputTokens + 256 >= s.contextTokens) throw new Error('Invalid message token limits.')
    s.connectionId = s.connectionId ? entityId(s.connectionId) : ''
    s.instructions = text(s.instructions, 6000)
    const names: Record<string, string> = {}
    if (!s.characterNames || typeof s.characterNames !== 'object' || Array.isArray(s.characterNames)) throw new Error('Invalid room character names.')
    for (const id of ids) if (s.characterNames[id]) names[id] = text(s.characterNames[id], 120, true)
    return { ...s, characterNames: names }
  }
  constructor(private host: MochiHost, private makeId = () => `room_${crypto.randomUUID().replaceAll('-', '')}`, private now: () => number = Date.now) {}
  private account(userId: unknown): string { return text(userId, 180, true) }
  private async locked<T>(user: string, id: string, work: () => Promise<T>): Promise<T> {
    const key = JSON.stringify([user, id])
    const previous = this.locks.get(key) || Promise.resolve()
    const current = previous.catch(() => {}).then(work)
    this.locks.set(key, current)
    try { return await current } finally { if (this.locks.get(key) === current) this.locks.delete(key) }
  }
  async read(userId: string, id: string): Promise<MochiRoom> {
    const user = this.account(userId), path = pathFor(id)
    if (!await this.host.userStorage.exists(path, user)) throw new Error('This room is not available to your account.')
    const room = validateRoom(await this.host.userStorage.getJson(path, { userId: user }), id)
    if (room.runtime !== undefined) validateRuntime(room.runtime)
    if (room.runtime?.presence) for (const [id,p] of Object.entries(room.runtime.presence)) { entityId(id); validatePresence(p) }
    room.settings = this.settings(room.settings, room.characterIds)
    room.receipts ||= []
    if (!Array.isArray(room.receipts) || room.receipts.some(id => typeof id !== 'string')) throw new Error('Invalid saved send receipts.')
    room.notifications ||= []
    room.notificationRevision ??= 0
    if (!Number.isSafeInteger(room.notificationRevision) || room.notificationRevision < 0) throw new Error('Invalid notification revision; the file was preserved.')
    if (!Array.isArray(room.notifications) || room.notifications.some(n => !n || n.roomId !== id || typeof n.read !== 'boolean' || typeof n.messageId !== 'string' || n.id !== n.messageId)) throw new Error('Invalid saved Mochi notifications; the file was preserved.')
    const noticeIds = new Set<string>()
    for (const n of room.notifications) {
      entityId(n.id); text(n.title, 120, true); text(n.roomTitle, 120, true); text(n.body, 220); text(n.avatarUrl, 500); text(n.createdAt, 80, true)
      if (noticeIds.has(n.id) || !room.messages.some((m: any) => m?.id === n.messageId && m.role === 'assistant')) throw new Error('Invalid saved notification reference; the file was preserved.')
      noticeIds.add(n.id)
    }
    return room
  }
  private async persist(user: string, room: MochiRoom, signal?: AbortSignal): Promise<void> {
    const path = pathFor(room.id)
    await this.host.userStorage.setJson(`${path}.pending`, room, { userId: user })
    signal?.throwIfAborted()
    await this.host.userStorage.move(`${path}.pending`, path, user)
  }
  private async membership(user: string, value: unknown): Promise<string[]> {
    if (!Array.isArray(value) || !value.length || value.length > 12) throw new Error('Choose 1–12 characters.')
    const ids = value.map(entityId)
    if (new Set(ids).size !== ids.length) throw new Error('Choose each character once.')
    if (!this.host.permissions.has('characters')) throw new Error('Character permission is required.')
    for (const id of ids) if (!await this.host.characters.get(id, user)) throw new Error('A character is not available to your account.')
    return ids
  }
  private async persona(user: string, input: any): Promise<MochiPersona> {
    if (input?.source === 'manual') return { source: 'manual', sourceId: '', name: text(input.name, 120, true), description: text(input.description ?? '', 12000), avatarUrl: '' }
    const sourceId = entityId(input?.sourceId)
    if (input?.source === 'lumiverse') {
      if (!this.host.permissions.has('personas')) throw new Error('Persona permission is required.')
      const persona = await this.host.personas.get(sourceId, user)
      if (!persona) throw new Error('This persona is not available to your account.')
      return { source: 'lumiverse', sourceId, name: text(persona.name, 120, true), description: text(persona.description ?? '', 12000), avatarUrl: persona.image_id ? `/api/v1/images/${entityId(persona.image_id)}` : '' }
    }
    if (input?.source === 'pocket') {
      const bank: any = await this.host.userStorage.getJson('identity-profiles.json', { userId: user, fallback: null })
      if (bank && bank.version !== 1) throw new Error('Unsupported identity profile version.')
      const profile = bank?.entries?.find((entry: any) => entry.id === sourceId && entry.kind === 'persona')
      if (!profile) throw new Error('This identity profile is not available to your account.')
      return { source: 'pocket', sourceId, name: text(profile.name, 120, true), description: text([profile.pronouns, profile.role, profile.identityBrief, profile.phoneProfile?.personality, profile.phoneProfile?.textingStyle].filter(Boolean).join('\n'), 12000), avatarUrl: '' }
    }
    throw new Error('Choose a room persona.')
  }
  async create(userId: string, input: any): Promise<MochiRoom> {
    const user = this.account(userId), id = roomId(this.makeId())
    return this.locked(user, id, async () => {
      if (await this.host.userStorage.exists(pathFor(id), user)) throw new Error('Room identifier collision; retry creation.')
      const now = new Date().toISOString()
      const room: MochiRoom = { version: 1, id, revision: 1, title: text(input.title, 120, true), characterIds: await this.membership(user, input.characterIds), persona: await this.persona(user, input.persona), messages: [], createdAt: now, updatedAt: now, settings: defaultMochiSettings(), receipts: [], notifications: [], notificationRevision: 0 }
      await this.persist(user, room)
      return room
    })
  }
  async update(userId: string, input: any): Promise<MochiRoom> {
    const user = this.account(userId), id = roomId(input.roomId)
    return this.locked(user, id, async () => {
      const saved = await this.read(user, id)
      if (input.revision !== saved.revision) throw new Error('This room changed elsewhere. Refresh before saving again.')
      const ids = await this.membership(user, input.characterIds)
      const settings = this.settings(input.settings ?? saved.settings, ids)
      if (settings.connectionId && !await this.host.connections?.get(settings.connectionId, user)) throw new Error('This connection is not available to your account.')
      const room = { ...saved, title: text(input.title, 120, true), characterIds: ids, settings, persona: input.persona ? await this.persona(user, input.persona) : saved.persona, revision: saved.revision + 1, updatedAt: new Date().toISOString() }
      for (const n of room.notifications!) n.roomTitle = room.title
      room.notificationRevision = (saved.notificationRevision || 0) + 1
      this.jobs.get(this.jobKey(user, id))?.controller.abort()
      await this.persist(user, room)
      return room
    })
  }
  async state(userId: string): Promise<MochiState> {
    const user = this.account(userId), rooms: MochiRoom[] = [], warnings: string[] = []
    for (const path of await this.host.userStorage.list(ROOT, user)) {
      // Host list paths are relative to the requested directory.
      const match = /^(room_[a-f0-9]{32})\.json$/.exec(path)
      if (!match) continue
      try { rooms.push(await this.read(user, match[1])) } catch { warnings.push(`Room ${match[1]} could not be read. Its file was preserved.`) }
    }
    const collect = async (list: (options: any) => Promise<any>) => {
      const rows: any[] = []
      for (let offset = 0; ; offset += 100) {
        const result = await list({ userId: user, limit: 100, offset })
        const data = result?.data
        if (!Array.isArray(data)) throw new Error('Unable to read identity choices.')
        rows.push(...data)
        if (data.length < 100) return rows
        if (offset >= 9900) throw new Error('Too many identities; narrow the source library.')
      }
    }
    const characters = this.host.permissions.has('characters') ? await collect(options => this.host.characters.list(options)) : []
    const personas = this.host.permissions.has('personas') ? await collect(options => this.host.personas.list(options)) : []
    const bank: any = await this.host.userStorage.getJson('identity-profiles.json', { userId: user, fallback: null })
    const choices: MochiPersona[] = personas.map(p => ({ source: 'lumiverse', sourceId: p.id, name: p.name, description: '', avatarUrl: p.image_id ? `/api/v1/images/${p.image_id}` : '' }))
    if (bank?.version === 1 && Array.isArray(bank.entries)) for (const p of bank.entries.filter((p: any) => p.kind === 'persona')) choices.push({ source: 'pocket', sourceId: p.id, name: p.name, description: '', avatarUrl: '' })
    const connections = this.host.permissions.has('generation') && this.host.connections ? (await this.host.connections.list(user)).map(c => ({ id: c.id, name: c.name || c.model, model: c.model })) : []
    const jobs: Record<string, string> = {}
    for (const room of rooms) { const job = this.jobs.get(this.jobKey(user, room.id)); if (job && !job.requestId.startsWith('server_')) jobs[room.id] = job.requestId }
    return { backgroundEnabled: await this.backgroundEnabled(user), rooms: rooms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(({ runtime, ...room }) => ({ ...room, background: publicRuntime(runtime) })), characters: characters.map(c => ({ id: c.id, name: c.name, avatarUrl: c.image_id ? `/api/v1/images/${c.image_id}` : '' })), personas: choices, warnings, connections, jobs, notifications: rooms.flatMap(r => r.notifications || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
  }
  async cancel(userId: string, id: string, requestId: string): Promise<void> {
    const user = this.account(userId)
    roomId(id)
    const job = this.jobs.get(this.jobKey(user, id))
    let matched = false
    if (job?.requestId === requestId && !job.requestId.startsWith('server_')) { job.controller.abort(); matched = true }
    for (const queued of this.pending.get(this.jobKey(user, id)) || []) if (queued.requestId === requestId) { queued.controller.abort(); matched = true }
    if (!matched) await this.read(user, id)
  }
  /** Only explicit content changes advance revision; notification reads cannot invalidate a reply. */
  async acknowledge(userId: string, input: any): Promise<void> {
    const user = this.account(userId), id = roomId(input.roomId)
    if (input.notificationId !== undefined) entityId(input.notificationId)
    const ids = input.notificationIds === undefined ? undefined : this.notificationIds(input.notificationIds)
    await this.locked(user, id, async () => {
      const room = await this.read(user, id)
      let changed = false
      for (const n of room.notifications!) if (!n.read && (!input.notificationId || n.id === input.notificationId) && (!ids || ids.includes(n.id))) { n.read = true; changed = true }
      if (changed) { room.notificationRevision!++; await this.persist(user, room) }
    })
  }
  private notificationIds(value: unknown): string[] {
    if (!Array.isArray(value) || value.length > 10000) throw new Error('Invalid notification selection.')
    const ids = value.map(entityId)
    if (new Set(ids).size !== ids.length) throw new Error('Duplicate notification selection.')
    return ids
  }
  /** Remove only the reviewed records; concurrent new replies survive clearing. */
  async clearNotifications(userId: string, input: any): Promise<void> {
    const user = this.account(userId)
    if (!['dismiss', 'read', 'all'].includes(input.action) || !Array.isArray(input.rooms) || input.rooms.length > 10000) throw new Error('Invalid notification action.')
    if (input.action === 'all' && input.confirmed !== true) throw new Error('Confirm clearing all notifications first.')
    const selections = input.rooms.map((r: any) => ({ id: roomId(r?.roomId), ids: this.notificationIds(r?.notificationIds) }))
    if (new Set(selections.map((r: any) => r.id)).size !== selections.length || (input.action === 'dismiss' && (selections.length !== 1 || selections[0].ids.length !== 1))) throw new Error('Invalid notification selection.')
    // Validate every account-scoped target before performing any writes.
    for (const r of selections) await this.read(user, r.id)
    for (const r of selections) await this.locked(user, r.id, async () => {
      const room = await this.read(user, r.id)
      const remaining = room.notifications!.filter(n => !r.ids.includes(n.id) || (input.action === 'read' && !n.read))
      if (remaining.length === room.notifications!.length) return
      room.notifications = remaining; room.notificationRevision!++
      await this.persist(user, room)
    })
  }
  async action(userId: string, input: any): Promise<void> {
    const user = this.account(userId), id = roomId(input.roomId), requestId = entityId(input.requestId), messageId = entityId(input.messageId)
    if (!['edit', 'delete'].includes(input.action)) throw new Error('Unsupported message action.')
    if (input.action === 'delete' && input.confirmed !== true) throw new Error('Confirm message deletion first.')
    const content = input.action === 'edit' ? text(input.content, 32000, true) : ''
    await this.locked(user, id, async () => {
      const room = await this.read(user, id)
      if (room.receipts!.includes(requestId)) return
      if (room.revision !== input.revision) throw new Error('This room changed elsewhere. Refresh before changing a message.')
      const index = this.messageIndex(room, messageId), message = room.messages[index] as MochiMessage
      if (input.action === 'edit') {
        room.messages[index] = { ...message, content, editedAt: new Date().toISOString(), previousVersions: [...message.previousVersions || [], this.previousVersion(message)] }
        for (const n of room.notifications!) if (n.messageId === messageId) n.body = content.slice(0, 220)
      } else { room.messages.splice(index, 1); room.notifications = room.notifications!.filter(n => n.messageId !== messageId) }
      this.jobs.get(this.jobKey(user, id))?.controller.abort()
      room.receipts!.push(requestId); room.revision++; room.updatedAt = new Date().toISOString()
      room.notificationRevision!++
      await this.persist(user, room)
    })
  }
  private messageIndex(room: MochiRoom, id: string): number {
    const matches = room.messages.map((m: any, i) => m?.id === id ? i : -1).filter(i => i >= 0)
    if (matches.length !== 1) throw new Error('This message is unavailable or has an ambiguous identifier.')
    const m = room.messages[matches[0]] as MochiMessage
    if (!['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || (m.previousVersions !== undefined && !Array.isArray(m.previousVersions))) throw new Error('Unsupported message; history was preserved.')
    return matches[0]
  }
  private previousVersion(m: MochiMessage) { return { content: m.content, name: m.name, avatarUrl: m.avatarUrl, savedAt: new Date().toISOString() } }
  async scheduledRooms(userId: string): Promise<MochiRoom[]> {
    const user = identifier(userId), rooms: MochiRoom[] = []
    for (const file of await this.host.userStorage.list(ROOT, user)) {
      const match = /^(room_[a-f0-9]{32})\.json$/.exec(file)
      if (match) rooms.push(await this.read(user, match[1]))
    }
    return rooms
  }
  async configurePresence(userId: string, input: any): Promise<void> {
    const user = identifier(userId), id = roomId(input.roomId), character = entityId(input.characterId), presence = validatePresence(input.presence)
    this.jobs.get(this.jobKey(user,id))?.controller.abort()
    await this.locked(user,id,async()=>{
      const room = await this.read(user,id)
      if (!room.characterIds.includes(character)) throw new Error('This character is not in the room.')
      if (room.revision !== input.revision) throw new Error('Refresh before changing presence.')
      room.runtime ||= { version:1,enabled:false,jobs:[] }
      room.runtime.presence ||= {}; room.runtime.presence[character] = presence
      await this.persist(user,room)
    })
  }
  async schedule(userId: string, input: any, now: number): Promise<void> {
    const user = identifier(userId), spec = scheduleInput(input, now)
    await this.locked(user, spec.roomId, async () => {
      const room = await this.read(user, spec.roomId)
      if (room.revision !== input.revision) throw new Error('This room changed elsewhere. Refresh before scheduling.')
      if (!room.runtime?.enabled) throw new Error('Enable background messaging for this room first.')
      if (spec.responder !== 'auto' && !room.characterIds.includes(spec.responder)) throw new Error('The selected responder is not in this room.')
      if (room.runtime.jobs.some(j => j.id === spec.id)) return
      if (room.runtime.jobs.length >= MAX_JOBS || room.runtime.jobs.filter(j => !TERMINAL.has(j.status)).length >= 4) throw new Error('The scheduled queue is full.')
      room.runtime.jobs.push({ id: spec.id, kind: 'scheduled', createdAt: now, dueAt: spec.dueAt, expiresAt: spec.dueAt + 3600000, revision: room.revision, responder: spec.responder, status: 'queued', attempts: 0, nextAttemptAt: spec.dueAt })
      await this.persist(user, room)
    })
  }
  async configureScheduledRoom(userId: string, input: any): Promise<void> {
    const user = identifier(userId), id = roomId(input.roomId)
    if (typeof input.enabled !== 'boolean') throw new Error('Invalid background setting.')
    if (!input.enabled) this.abortScheduled(user, id)
    await this.locked(user, id, async () => {
      const room = await this.read(user, id)
      if (input.revision !== room.revision) throw new Error('This room changed elsewhere. Refresh before changing background settings.')
      room.runtime ||= { version: 1, enabled: false, jobs: [] }
      room.runtime.enabled = input.enabled
      if (!input.enabled) for (const j of room.runtime.jobs) if (!TERMINAL.has(j.status)) { j.status = 'cancelled'; delete j.draft }
      await this.persist(user, room)
    })
  }
  abortScheduled(userId?: string, id?: string, occurrenceId?: string): void {
    for (const [key, job] of this.jobs) {
      const [user, room] = JSON.parse(key)
      if (job.requestId.startsWith('server_') && (!userId || user === userId) && (!id || room === id) && (!occurrenceId || job.requestId === `server_${occurrenceId}`)) job.controller.abort()
    }
  }
  async cancelScheduled(userId: string, id: string, occurrenceId: string): Promise<void> {
    identifier(userId); roomId(id); identifier(occurrenceId)
    this.abortScheduled(userId, id, occurrenceId)
    await this.locked(userId, id, async () => {
      const room = await this.read(userId, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
      if (!j || TERMINAL.has(j.status)) return
      j.status = 'cancelled'; delete j.draft
      await this.persist(userId, room)
    })
  }
  /** Server-owned execution never uses interactive acceptance receipts or frontend acknowledgements. */
  async dispatchScheduled(userId: string, id: string, occurrenceId: string, now: () => number, allowed: () => Promise<boolean>, reserve: () => Promise<boolean>): Promise<void> {
    const user = identifier(userId), key = this.jobKey(user, roomId(id)), controller = new AbortController(), requestId = `server_${identifier(occurrenceId)}`
    const claim = crypto.randomUUID().replaceAll('-', '')
    let snapshot: MochiRoom | undefined, generate = false
    const permitted = async (room: MochiRoom) => {
      controller.signal.throwIfAborted()
      if (!room.runtime?.enabled || !await allowed()) throw new Error('Background messaging is disabled.')
      await validateMochiSources(this.host, room, user)
      if (!this.host.permissions.has('characters')) throw new Error('Character permission is required.')
      for (const c of room.characterIds) if (!await this.host.characters.get(c, user)) throw new Error('A room character is not available.')
      controller.signal.throwIfAborted()
    }
    await this.locked(user, id, async () => {
      const room = await this.read(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
      if (!j || TERMINAL.has(j.status) || j.status === 'paused' || this.jobs.has(key) || j.nextAttemptAt > now() || (j.status === 'generating' && (j.leaseUntil || 0) > now())) return
      if (j.expiresAt < now() || j.revision !== room.revision) { j.status = j.expiresAt < now() ? 'missed' : 'cancelled'; delete j.draft; await this.persist(user, room); return }
      if (!room.runtime!.enabled || !await allowed()) { j.status = 'cancelled'; delete j.draft; await this.persist(user, room); return }
      if (j.responder !== 'auto' && !room.characterIds.includes(j.responder)) { j.status = 'paused'; j.reason = 'Responder is unavailable.'; await this.persist(user, room); return }
      const minimum = minimumDelay(room,j.responder,now())
      if (!j.draft && (minimum === Infinity || now() < (j.createdAt ?? j.dueAt) + minimum)) return
      if (j.draft && (statusFor(room,j.draft.characterId,now()) === 'offline' || now() < (j.createdAt ?? j.dueAt) + delayFor(room,j.draft.characterId,now()))) return
      // A generated draft is recoverable without another paid request.
      generate = !j.draft
      if (generate && j.attempts >= 3) { j.status = 'failed'; await this.persist(user, room); return }
      if (!generate && (j.deliveryAttempts || 0) >= 3) { j.status = 'paused'; j.reason = 'Delivery could not be saved. Deferred content is preserved.'; await this.persist(user, room); return }
      if (generate && !await reserve()) return
      j.claim = claim; j.leaseUntil = now() + 240000
      if (generate) { j.status = 'generating'; j.attempts++ }
      else j.deliveryAttempts = (j.deliveryAttempts || 0) + 1
      this.jobs.set(key, { requestId, controller })
      try { await this.persist(user, room); snapshot = room } catch (error) { this.jobs.delete(key); throw error }
    })
    if (!snapshot) return
    const timer = setTimeout(() => controller.abort(), 180000)
    try {
      await permitted(snapshot)
      if (generate) {
        const j = snapshot.runtime!.jobs.find(j => j.id === occurrenceId)!
        const reply = await generateMochiReply(this.host, snapshot, user, j.responder, controller.signal, eligibleResponders(snapshot,j.responder,now()).filter(c => now() >= (j.createdAt ?? j.dueAt) + delayFor(snapshot!,c,now())))
        await this.locked(user, id, async () => {
          const room = await this.read(user, id), job = room.runtime?.jobs.find(j => j.id === occurrenceId)
          await permitted(room)
          if (!job || job.claim !== claim || job.status !== 'generating' || room.revision !== j.revision) throw new Error('The room changed; scheduled output was discarded.')
          job.draft = { characterId: reply.character.id, text: reply.text, name: room.settings!.characterNames[reply.character.id] || reply.character.name, avatarUrl: reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '' }
          job.status = 'generated'
          await this.persist(user, room, controller.signal)
        })
      }
      await this.locked(user, id, async () => {
        const room = await this.read(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
        await permitted(room)
        if (!j || j.claim !== claim || j.status !== 'generated' || !j.draft || j.revision !== room.revision || j.expiresAt < now()) throw new Error('The scheduled delivery changed or expired.')
        const draft = j.draft, createdAt = new Date(now()).toISOString(), messageId = crypto.randomUUID()
        if (statusFor(room,draft.characterId,now()) === 'offline' || now() < (j.createdAt ?? j.dueAt) + delayFor(room,draft.characterId,now())) throw new Error('Presence changed before delivery.')
        const message: MochiMessage = { id: messageId, requestId, role: 'assistant', characterId: draft.characterId, name: draft.name, avatarUrl: draft.avatarUrl, content: draft.text, createdAt }
        room.messages.push(message)
        const notification = { id: messageId, messageId, roomId: id, roomTitle: room.title, title: draft.name, body: draft.text.slice(0, 220), avatarUrl: draft.avatarUrl, createdAt, read: false }
        room.notifications!.push(notification); room.notificationRevision!++; room.revision++; room.updatedAt = createdAt
        // Completion tombstone is atomic with the message, independent of later deletion.
        j.status = 'delivered'; j.messageId = messageId; j.deliveredAt = now(); delete j.draft
        await this.persist(user, room, controller.signal)
        this.host.sendToFrontend({ type: 'mochi:notification', notification, notificationRevision: room.notificationRevision }, user)
      })
    } catch (error) {
      await this.locked(user, id, async () => {
        const room = await this.read(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
        if (!j || j.claim !== claim || TERMINAL.has(j.status)) return
        if (!room.runtime!.enabled || !await allowed() || j.revision !== room.revision) { j.status = 'cancelled'; delete j.draft }
        else if (controller.signal.aborted || temporaryFailure(error)) {
          j.status = j.draft ? 'generated' : j.attempts < 3 ? 'queued' : 'failed'
          j.nextAttemptAt = now() + Math.min(900000, 60000 * 2 ** Math.max(0, j.attempts - 1)); j.leaseUntil = 0
        } else { j.status = 'paused'; j.reason = 'Scheduled messaging needs attention. Check room sources, provider and storage.' }
        await this.persist(user, room)
      })
    } finally {
      clearTimeout(timer)
      if (this.jobs.get(key)?.controller === controller) this.jobs.delete(key)
    }
  }
  async message(userId: string, input: any, regenerate = false): Promise<void> {
    const user = this.account(userId), id = roomId(input.roomId), requestId = entityId(input.requestId)
    const key = this.jobKey(user, id), controller = new AbortController()
    const waiting = this.pending.get(key) || new Set<{ requestId: string; controller: AbortController }>()
    const queued = { requestId, controller }; waiting.add(queued); this.pending.set(key, waiting)
    const launched = await this.locked(user, id, async () => {
      const room = await this.read(user, id)
      if (room.receipts!.includes(requestId)) return null
      if (this.jobs.has(key)) throw new Error('A reply is already running in this room. Wait or stop it first.')
      if (room.revision !== input.revision) throw new Error('This room changed elsewhere. Refresh before sending again.')
      const targetId = regenerate ? entityId(input.messageId) : ''
      if (regenerate && input.confirmed !== true) throw new Error('Confirm reroll first; later messages will remain unchanged.')
      const targetIndex = regenerate ? this.messageIndex(room, targetId) : -1
      const target = regenerate ? room.messages[targetIndex] as MochiMessage : null
      if (target && (target.role !== 'assistant' || !target.characterId)) throw new Error('Only character messages can be regenerated.')
      const content = regenerate ? '' : text(input.content ?? '', 32000)
      const responder = target ? entityId(target.characterId) : input.responder === 'auto' || !input.responder ? 'auto' : entityId(input.responder)
      if (responder !== 'auto' && !room.characterIds.includes(responder)) throw new Error('The selected responder is not in this room.')
      if (content) room.messages.push({ id: crypto.randomUUID(), role: 'user', content, name: room.persona.name, avatarUrl: room.persona.avatarUrl, createdAt: new Date().toISOString(), requestId } satisfies MochiMessage)
      room.receipts!.push(requestId)
      room.revision++; room.updatedAt = new Date().toISOString()
      await this.persist(user, room)
      this.host.sendToFrontend({ type:'mochi:accepted', requestId, roomId:id },user)
      let generate = (!content || room.settings!.autoReply) && !controller.signal.aborted
      if (generate && !regenerate && minimumDelay(room,responder,this.now()) > 0) {
        generate = false
        if (!room.runtime?.enabled || !await this.backgroundEnabled(user)) throw new Error('This character is unavailable. Enable account and room background messaging to queue delayed replies.')
        for (const job of room.runtime.jobs) if (job.kind === 'response' && !TERMINAL.has(job.status)) { job.status = 'cancelled'; delete job.draft }
        if (room.runtime.jobs.length >= MAX_JOBS || room.runtime.jobs.filter(j=>!TERMINAL.has(j.status)).length >= 4) throw new Error('The delayed-response queue is full; your user message is saved.')
        const now = this.now(), delay = minimumDelay(room,responder,now), dueAt = now + (Number.isFinite(delay) ? delay : 0)
        room.runtime.jobs.push({ id: `response_${requestId}`, kind: 'response', createdAt: now, dueAt, expiresAt: now + 86400000, revision: room.revision, responder, status:'queued', attempts:0, nextAttemptAt:dueAt })
        await this.persist(user,room)
      }
      if (generate && regenerate && minimumDelay(room,responder,this.now()) > 0) throw new Error('The selected character is unavailable for an immediate reroll.')
      if (generate) this.jobs.set(key, { requestId, controller })
      return { room, responder, generate, targetId, promptRoom: regenerate ? { ...room, messages: room.messages.slice(0, targetIndex) } : room }
    }).finally(() => { waiting.delete(queued); if (!waiting.size && this.pending.get(key) === waiting) this.pending.delete(key) })
    const publish = async (accepted: boolean) => this.host.sendToFrontend({ type: 'mochi:state', requestId, accepted, state: await this.state(user) }, user)
    if (!launched?.generate) { await publish(true); return }
    const timeout = setTimeout(() => controller.abort(), 180000)
    try {
      await publish(true)
      const reply = await generateMochiReply(this.host, launched.promptRoom, user, launched.responder, controller.signal, eligibleResponders(launched.room,launched.responder,this.now()).filter(c=>delayFor(launched.room,c,this.now())===0))
      await this.locked(user, id, async () => {
        controller.signal.throwIfAborted()
        const current = await this.read(user, id)
        if (current.revision !== launched.room.revision || this.jobs.get(key)?.controller !== controller) throw new Error('The room changed during generation; the reply was discarded.')
        await validateMochiSources(this.host, current, user)
        if (!this.host.permissions.has('characters')) throw new Error('Character permission is required.')
        for (const characterId of current.characterIds) if (!await this.host.characters.get(characterId, user)) throw new Error('A room character is no longer available; the reply was discarded.')
        if (delayFor(current,reply.character.id,this.now()) > 0) throw new Error('Character presence changed; the immediate reply was discarded.')
        const name = current.settings!.characterNames[reply.character.id] || reply.character.name
        let notification
        if (launched.targetId) {
          const index = this.messageIndex(current, launched.targetId), previous = current.messages[index] as MochiMessage
          current.messages[index] = { ...previous, content: reply.text, editedAt: new Date().toISOString(), previousVersions: [...previous.previousVersions || [], this.previousVersion(previous)] }
          for (const n of current.notifications!) if (n.messageId === previous.id) n.body = reply.text.slice(0, 220)
        } else {
          const message: MochiMessage = { id: crypto.randomUUID(), role: 'assistant', characterId: reply.character.id, name, avatarUrl: reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '', content: reply.text, createdAt: new Date().toISOString(), requestId }
          current.messages.push(message)
          notification = { id: message.id, messageId: message.id, roomId: id, roomTitle: current.title, title: name, body: message.content.slice(0, 220), avatarUrl: message.avatarUrl, createdAt: message.createdAt, read: false }
          current.notifications!.push(notification)
        }
        current.revision++; current.updatedAt = new Date().toISOString()
        current.notificationRevision!++
        controller.signal.throwIfAborted()
        await this.persist(user, current, controller.signal)
        if (notification) this.host.sendToFrontend({ type: 'mochi:notification', notification, notificationRevision: current.notificationRevision }, user)
      })
    } finally {
      clearTimeout(timeout)
      if (this.jobs.get(key)?.controller === controller) this.jobs.delete(key)
      this.host.sendToFrontend({ type: 'mochi:job_finished', roomId: id, requestId }, user)
      await publish(false)
    }
  }
  async handle(payload: any, userId?: string): Promise<void> {
    if (!userId) return
    let selectedRoomId: string | undefined
    try {
      if (payload.type === 'mochi:send') { await this.message(userId, payload); return }
      if (payload.type === 'mochi:regenerate') { await this.message(userId, payload, true); return }
      if (payload.type === 'mochi:message_action') await this.action(userId, payload)
      else if (payload.type === 'mochi:notification_read') {
        await this.acknowledge(userId, payload)
        const state = await this.state(userId)
        this.host.sendToFrontend({ type: 'mochi:notifications', requestId: payload.requestId, notifications: state.notifications, notificationRevisions: Object.fromEntries(state.rooms.map(r => [r.id, r.notificationRevision || 0])) }, userId)
        return
      }
      else if (payload.type === 'mochi:notification_clear') await this.clearNotifications(userId, payload)
      if (payload.type === 'mochi:cancel') { await this.cancel(userId, payload.roomId, payload.generationRequestId); return }
      if (payload.type === 'mochi:create') selectedRoomId = (await this.create(userId, payload)).id
      else if (payload.type === 'mochi:update') selectedRoomId = (await this.update(userId, payload)).id
      else if (payload.type !== 'mochi:list' && payload.type !== 'mochi:message_action' && payload.type !== 'mochi:notification_clear') throw new Error('Unsupported Mochi action.')
      this.host.sendToFrontend({ type: 'mochi:state', requestId: payload.requestId, selectedRoomId, state: await this.state(userId) }, userId)
    } catch (error) {
      const message = error instanceof Error ? error.name === 'AbortError' ? 'Reply stopped. Your messages are saved.' : error.message : 'Unable to save Mochi room.'
      const safeMessage = message.replace(/\b(?:sk-|key-|Bearer\s+)[A-Za-z0-9._-]{8,}\b/gi, '[redacted]').replace(/\s+/g, ' ').trim().slice(0, 500)
      this.host.sendToFrontend({ type: 'mochi:error', requestId: payload.requestId, message: safeMessage || 'Unable to save Mochi room.' }, userId)
    }
  }
}
