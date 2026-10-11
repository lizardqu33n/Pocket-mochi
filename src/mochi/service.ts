import { roomId, defaultMochiSettings, type MochiSettings, type MochiMessage, type MochiPersona, type MochiRoom, type MochiState } from './types.js'
import { generateMochiReply, validateMochiSources } from './generation.js'
import { identifier, MAX_JOBS, publicRuntime, scheduleInput, temporaryFailure, TERMINAL, validateRuntime, type ScheduledJob } from './scheduling.js'
import { delayFor, eligibleResponders, minimumDelay, statusFor, validatePresence } from './presence.js'
import { applyDeliveredStatus } from './behavior.js'
import { MochiAccounts, fictionalAccountId } from './accounts.js'
import { phoneContext, type MochiPhone } from './phone-selection.js'

// New implementation. No Character Chatroom source is included.
export interface MochiHost {
  images?: { get(id: string, userId: string): Promise<any>; list(options: any): Promise<any>; uploadFromDataUrl(dataUrl: string, filename: string, userId: string): Promise<any> }
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
  if (value.accountId !== undefined) fictionalAccountId(value.accountId)
  if(value.associationRevision!==undefined&&(!Number.isSafeInteger(value.associationRevision)||value.associationRevision<0))throw new Error('Damaged room association; its file was preserved.')
  return value
}
export class MochiService {
  resolvePhone: (user: string, phone: MochiPhone) => Promise<string | undefined> = async()=>undefined
  private async phoneKey(user:string,input:unknown):Promise<string|undefined>{const phone=phoneContext(input);return phone?this.resolvePhone(user,phone):undefined}
  backgroundEnabled: (userId: string) => Promise<boolean> = async () => false
  reserveAutomatic: (userId: string, roomId: string) => Promise<boolean> = async () => true
  releaseAutomatic: (userId: string, roomId: string) => void = () => {}
  schedulingWarning: (message:string) => void = () => {}
  private locks = new Map<string, Promise<unknown>>()
  private jobs = new Map<string, { requestId: string; controller: AbortController; accountId?: string; phoneKey?: string }>()
  private pending = new Map<string, Set<{ requestId: string; controller: AbortController; accountId?: string; phoneKey?: string }>>()
  private jobKey(user: string, id: string): string { return JSON.stringify([user, id]) }
  private settings(input: any, ids: string[]): MochiSettings {
    const s = { ...defaultMochiSettings(), ...input }
    if (s.aiBehavior !== undefined && typeof s.aiBehavior !== 'boolean') throw new Error('Invalid AI behavior setting.')
    if (s.responseMode !== undefined && !['natural','instant','manual'].includes(s.responseMode)) throw new Error('Invalid response mode.')
    if (typeof s.autoReply !== 'boolean' || !Number.isSafeInteger(s.contextTokens) || s.contextTokens < 1024 || s.contextTokens > 131072 || !Number.isSafeInteger(s.outputTokens) || s.outputTokens < 128 || s.outputTokens > 8192 || s.outputTokens + 256 >= s.contextTokens) throw new Error('Invalid message token limits.')
    s.connectionId = s.connectionId ? entityId(s.connectionId) : ''
    s.instructions = text(s.instructions, 6000)
    const names: Record<string, string> = {}
    if (!s.characterNames || typeof s.characterNames !== 'object' || Array.isArray(s.characterNames)) throw new Error('Invalid room character names.')
    for (const id of ids) if (s.characterNames[id]) names[id] = text(s.characterNames[id], 120, true)
    return { ...s, characterNames: names }
  }
  readonly fictionalAccounts: MochiAccounts
  constructor(private host: MochiHost, private makeId = () => `room_${crypto.randomUUID().replaceAll('-', '')}`, private now: () => number = Date.now) {
    this.fictionalAccounts = new MochiAccounts(host, (user, input) => this.persona(user, input), now)
  }
  private account(userId: unknown): string { return text(userId, 180, true) }
  async accountsState(userId: string, phone?: unknown) {
    const user = identifier(userId), bank = await this.fictionalAccounts.bank(user)
    const key=await this.phoneKey(user,phone),selection=key?bank.phones?.[key]:undefined
    const associations = new Map(bank.accounts.map(a => [a.id, [] as string[]]))
    const warnings: string[] = []
    for (const file of await this.host.userStorage.list(ROOT, user)) {
      const match = /^(room_[a-f0-9]{32})\.json$/.exec(file)
      if (!match) continue
      try {
        const room = validateRoom(await this.host.userStorage.getJson(pathFor(match[1]), { userId: user }), match[1])
        if (room.accountId) {
          const ids = associations.get(room.accountId)
          if (!ids) throw new Error('Missing room owner')
          ids.push(room.id)
        }
      } catch { warnings.push(`Room ${match[1]} has an unreadable association; its file was preserved.`) }
    }
    const choices = await this.state(user)
    const avatars = this.host.images && this.host.permissions.has('images') ? (await this.host.images.list({ userId: user, limit: 100, offset: 0, specificity: 'thumbnail' })).data.filter((a: any) => /^image\/(png|jpeg|webp|gif)$/.test(a.mime_type)).map((a: any) => ({ id: entityId(a.id), name: String(a.original_filename || 'Portrait').slice(0,120), url: `/api/v1/images/${entityId(a.id)}` })) : []
    return { ...bank, phone: {supported:!!key,preference:key?selection?.preference||'last-used':bank.startupPreference||'last-used',lastAccountId:key?selection?.lastAccountId||'':bank.selectedAccountId}, accounts: bank.accounts.map(a => ({ ...a, roomIds: associations.get(a.id)!.sort() })), personas: choices.personas, avatars, canUploadAvatar: !!this.host.images && this.host.permissions.has('images'), warnings }
  }
  private abortFictional(userId: string, accountId: string, includeServer: boolean, phoneKey?: string): void {
    if (!accountId) return
    for (const [key, job] of this.jobs) if (JSON.parse(key)[0] === userId && job.accountId === accountId && (phoneKey===undefined||job.phoneKey===phoneKey) && (includeServer || !job.requestId.startsWith('server_'))) job.controller.abort()
    for (const [key, queued] of this.pending) if (JSON.parse(key)[0] === userId) for (const job of queued) if (job.accountId === accountId&&(phoneKey===undefined||job.phoneKey===phoneKey)) job.controller.abort()
  }
  private abortScoped(user: string, id: string, accountId: unknown, serverOnly = false): void {
    // Job ownership was validated at launch. Do not await disk reads before interrupting a staged commit.
    const job = this.jobs.get(this.jobKey(user, id))
    if (job && job.accountId === accountId && (!serverOnly || job.requestId.startsWith('server_'))) job.controller.abort()
  }
  async selectAccount(userId: string, input: any): Promise<void> {
    const key=await this.phoneKey(userId,input.phone)
    await this.fictionalAccounts.select(userId, input, previous => this.abortFictional(userId, previous, false,key),key)
  }
  async archiveAccount(userId: string, input: any): Promise<void> {
    await this.fictionalAccounts.archive(userId, input, () => this.abortFictional(userId, input.accountId, true))
  }
  async assignRoom(userId:string,input:any):Promise<void>{
    const user=identifier(userId),id=roomId(input.roomId),target=fictionalAccountId(input.targetAccountId)
    if(input.confirmed!==true||input.preservePersona!==true)throw new Error('Confirm assignment while preserving the saved persona and all chat data.')
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      await this.fictionalAccounts.get(user,target)
      if(input.revision!==room.revision||input.associationRevision!==(room.associationRevision||0))throw new Error('The chat or its assignment changed elsewhere. Refresh before assigning.')
      if(room.accountId===target)throw new Error('This chat already belongs to that account.')
      if(this.jobs.has(this.jobKey(user,id))||(this.pending.get(this.jobKey(user,id))?.size||0)>0||room.runtime?.jobs.some(j=>j.status==='generating'&&(j.leaseUntil||0)>this.now()))throw new Error('Wait for active generation to finish or stop it before assigning this chat. Saved schedules remain intact.')
      const sourceAccountId=room.accountId
      room.accountId=target;room.associationRevision=(room.associationRevision||0)+1
      for(const notice of room.notifications||[])notice.accountId=target
      // Ownership-only transaction: content revisions, source persona, receipts and runtime are unchanged.
      await this.persist(user,room)
      this.host.sendToFrontend({type:'mochi:room_assigned',roomId:id,sourceAccountId,accountId:target,associationRevision:room.associationRevision},user)
    })
  }
  private async locked<T>(user: string, id: string, work: () => Promise<T>): Promise<T> {
    return this.fictionalAccounts.guard(user, () => this.roomLocked(user, id, work))
  }
  private async roomLocked<T>(user: string, id: string, work: () => Promise<T>): Promise<T> {
    const key = JSON.stringify([user, id])
    const previous = this.locks.get(key) || Promise.resolve()
    const current = previous.catch(() => {}).then(work)
    this.locks.set(key, current)
    try { return await current } finally { if (this.locks.get(key) === current) this.locks.delete(key) }
  }
  async read(userId: string, id: string, accountId?: unknown): Promise<MochiRoom> {
    const room = await this.readStored(userId, id)
    if (accountId !== undefined) fictionalAccountId(accountId)
    if (room.accountId !== accountId) throw new Error('This room does not belong to the requested fictional account.')
    return room
  }
  private async readStored(userId: string, id: string): Promise<MochiRoom> {
    const user = this.account(userId), path = pathFor(id)
    if (!await this.host.userStorage.exists(path, user)) throw new Error('This room is not available to your account.')
    const room = validateRoom(await this.host.userStorage.getJson(path, { userId: user }), id)
    if (room.accountId) await this.fictionalAccounts.get(user, room.accountId)
    if (room.runtime !== undefined) validateRuntime(room.runtime)
    if (room.runtime?.presence) for (const [id,p] of Object.entries(room.runtime.presence)) { entityId(id); validatePresence(p) }
    for(const job of room.runtime?.jobs || []) {
      const drafts=[...job.draft?[job.draft]:[],...job.additional||[]],ids=drafts.map(d=>d.characterId)
      if(ids.some(id=>!room.characterIds.includes(id))||new Set(ids).size!==ids.length) throw new Error('Invalid saved deferred membership; room data was preserved.')
    }
    room.settings = this.settings(room.settings, room.characterIds)
    room.receipts ||= []
    if (!Array.isArray(room.receipts) || room.receipts.some(id => typeof id !== 'string')) throw new Error('Invalid saved send receipts.')
    room.notifications ||= []
    room.notificationRevision ??= 0
    if (!Number.isSafeInteger(room.notificationRevision) || room.notificationRevision < 0) throw new Error('Invalid notification revision; the file was preserved.')
    if (!Array.isArray(room.notifications) || room.notifications.some(n => !n || n.roomId !== id || typeof n.read !== 'boolean' || typeof n.messageId !== 'string' || n.id !== n.messageId)) throw new Error('Invalid saved Mochi notifications; the file was preserved.')
    const noticeIds = new Set<string>()
    for (const n of room.notifications) {
      if (n.accountId !== room.accountId) throw new Error('Invalid saved notification account; the file was preserved.')
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
      const profile = input.accountId === undefined ? undefined : await this.fictionalAccounts.get(user, input.accountId)
      if (profile) await this.persona(user, profile.persona) // Recheck ownership; preserve the saved snapshot.
      const now = new Date().toISOString()
      const room: MochiRoom = { version: 1, id, ...(profile ? { accountId: profile.id } : {}), revision: 1, title: text(input.title, 120, true), characterIds: await this.membership(user, input.characterIds), persona: profile ? { ...profile.persona, name: profile.displayName, avatarUrl: profile.avatarUrl } : await this.persona(user, input.persona), messages: [], createdAt: now, updatedAt: now, settings: { ...defaultMochiSettings(), responseMode: 'natural' }, receipts: [], notifications: [], notificationRevision: 0 }
      await this.persist(user, room)
      return room
    })
  }
  async update(userId: string, input: any): Promise<MochiRoom> {
    const user = this.account(userId), id = roomId(input.roomId)
    return this.locked(user, id, async () => {
      const saved = await this.read(user, id, input.accountId)
      if (saved.accountId && input.persona !== undefined) throw new Error('Fictional account rooms retain their identity snapshot. Per-room identity updates are not implemented yet.')
      if (input.revision !== saved.revision) throw new Error('This room changed elsewhere. Refresh before saving again.')
      const ids = await this.membership(user, input.characterIds)
      const settings = this.settings(input.settings ?? saved.settings, ids)
      if (settings.aiBehavior && (!saved.runtime?.enabled || !await this.backgroundEnabled(user))) throw new Error('Enable account and room background messaging before AI timing suggestions.')
      if (settings.connectionId && !await this.host.connections?.get(settings.connectionId, user)) throw new Error('This connection is not available to your account.')
      const room = { ...saved, title: text(input.title, 120, true), characterIds: ids, settings, persona: input.persona ? await this.persona(user, input.persona) : saved.persona, revision: saved.revision + 1, updatedAt: new Date().toISOString() }
      for(const j of room.runtime?.jobs || []) if(!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      for (const n of room.notifications!) n.roomTitle = room.title
      room.notificationRevision = (saved.notificationRevision || 0) + 1
      this.jobs.get(this.jobKey(user, id))?.controller.abort()
      await this.persist(user, room)
      return room
    })
  }
  async state(userId: string, accountId?: unknown): Promise<MochiState> {
    const user = this.account(userId), rooms: MochiRoom[] = [], warnings: string[] = []
    if (accountId !== undefined) await this.fictionalAccounts.get(user, accountId)
    for (const path of await this.host.userStorage.list(ROOT, user)) {
      // Host list paths are relative to the requested directory.
      const match = /^(room_[a-f0-9]{32})\.json$/.exec(path)
      if (!match) continue
      try {
        const raw: any = await this.host.userStorage.getJson(pathFor(match[1]), { userId: user })
        if (raw?.accountId !== accountId) continue
        rooms.push(await this.read(user, match[1], accountId))
      } catch { warnings.push(`Room ${match[1]} could not be read. Its file was preserved.`) }
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
    return { accountId: accountId as string | undefined, backgroundEnabled: await this.backgroundEnabled(user), rooms: rooms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(({ runtime, ...room }) => ({ ...room, background: publicRuntime(runtime) })), characters: characters.map(c => ({ id: c.id, name: c.name, avatarUrl: c.image_id ? `/api/v1/images/${c.image_id}` : '' })), personas: choices, warnings, connections, jobs, notifications: rooms.flatMap(r => r.notifications || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
  }
  async cancel(userId: string, id: string, requestId: string, accountId?: unknown): Promise<void> {
    const user = this.account(userId)
    roomId(id)
    const running = this.jobs.get(this.jobKey(user,id))
    if (running?.requestId === requestId && running.accountId === accountId && !requestId.startsWith('server_')) running.controller.abort()
    for (const queued of this.pending.get(this.jobKey(user,id)) || []) if (queued.requestId === requestId && queued.accountId === accountId) queued.controller.abort()
    await this.read(user, id, accountId)
    const job = this.jobs.get(this.jobKey(user, id))
    let matched = false
    if (job?.requestId === requestId && !job.requestId.startsWith('server_')) { job.controller.abort(); matched = true }
    for (const queued of this.pending.get(this.jobKey(user, id)) || []) if (queued.requestId === requestId) { queued.controller.abort(); matched = true }
    if (!matched) await this.read(user, id, accountId)
  }
  /** Only explicit content changes advance revision; notification reads cannot invalidate a reply. */
  async acknowledge(userId: string, input: any): Promise<void> {
    const user = this.account(userId), id = roomId(input.roomId)
    if (input.notificationId !== undefined) entityId(input.notificationId)
    const ids = input.notificationIds === undefined ? undefined : this.notificationIds(input.notificationIds)
    await this.locked(user, id, async () => {
      const room = await this.read(user, id, input.accountId)
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
    for (const r of selections) await this.read(user, r.id, input.accountId)
    for (const r of selections) await this.locked(user, r.id, async () => {
      const room = await this.read(user, r.id, input.accountId)
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
      const room = await this.read(user, id, input.accountId)
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
      if (match) {try{rooms.push(await this.readStored(user, match[1]))}catch{this.schedulingWarning('Mochi scheduler skipped a damaged room; its file was preserved.')}}
    }
    return rooms
  }
  async configurePresence(userId: string, input: any): Promise<void> {
    const user = identifier(userId), id = roomId(input.roomId), character = entityId(input.characterId), presence = validatePresence(input.presence)
    this.abortScoped(user,id,input.accountId)
    await this.locked(user,id,async()=>{
      const room = await this.read(user,id,input.accountId)
      if (!room.characterIds.includes(character)) throw new Error('This character is not in the room.')
      if (room.revision !== input.revision) throw new Error('Refresh before changing presence.')
      room.runtime ||= { version:1,enabled:false,jobs:[] }
      room.runtime.presence ||= {}; room.runtime.presence[character] = presence
      await this.persist(user,room)
    })
  }
  async configureIdle(userId:string,input:any):Promise<void> {
    const user=identifier(userId),id=roomId(input.roomId)
    if(typeof input.enabled!=='boolean') throw new Error('Invalid idle opt-in.')
    if(!input.enabled) this.abortScoped(user,id,input.accountId,true)
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(room.revision!==input.revision) throw new Error('Refresh before changing idle messaging.')
      if(input.enabled&&(room.settings!.responseMode==='manual'||!room.runtime?.enabled||!await this.backgroundEnabled(user))) throw new Error('Choose an automatic mode and enable account and room background messaging first.')
      room.runtime ||= {version:1,enabled:false,jobs:[]}
      const now=this.now();room.runtime.idle ||= {enabled:false,periodId:crypto.randomUUID().replaceAll('-',''),startedAt:now,delivered:0,opportunities:0,lastDeliveredAt:0,nextDueAt:now+5400000}
      room.runtime.idle.enabled=input.enabled
      if(!input.enabled) for(const j of room.runtime.jobs) if(j.kind==='idle'&&!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      await this.persist(user,room)
    })
  }
  async prepareIdle(userId:string,id:string,now:number):Promise<void> {
    const user=identifier(userId)
    await this.locked(user,roomId(id),async()=>{
      const room=await this.readStored(user,id),idle=room.runtime?.idle
      if(room.settings!.responseMode==='manual'||!room.runtime?.enabled||!idle?.enabled||!await this.backgroundEnabled(user)||idle.delivered>=3||idle.opportunities>=3||idle.nextDueAt>now||this.jobs.has(this.jobKey(user,id))||room.runtime.jobs.some(j=>!TERMINAL.has(j.status))) return
      if(now-idle.nextDueAt>3600000){idle.nextDueAt=now+5400000;await this.persist(user,room);return}
      if(minimumDelay(room,'auto',now)===Infinity||now<idle.lastDeliveredAt+5400000) return
      if(room.runtime.jobs.length>=MAX_JOBS) return
      idle.opportunities++;idle.nextDueAt=now+5400000
      room.runtime.jobs.push({id:`idle_${idle.periodId}_${idle.opportunities}`,idlePeriodId:idle.periodId,kind:'idle',createdAt:now,dueAt:now,expiresAt:now+3600000,revision:room.revision,responder:'auto',status:'queued',attempts:0,nextAttemptAt:now})
      await this.persist(user,room)
    })
  }
  async schedule(userId: string, input: any, now: number): Promise<void> {
    const user = identifier(userId), spec = scheduleInput(input, now)
    await this.locked(user, spec.roomId, async () => {
      const room = await this.read(user, spec.roomId, input.accountId)
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
    if (!input.enabled) this.abortScoped(user,id,input.accountId,true)
    await this.locked(user, id, async () => {
      const room = await this.read(user, id, input.accountId)
      if (input.revision !== room.revision) throw new Error('This room changed elsewhere. Refresh before changing background settings.')
      room.runtime ||= { version: 1, enabled: false, jobs: [] }
      room.runtime.enabled = input.enabled
      if (!input.enabled) for (const j of room.runtime.jobs) if (!TERMINAL.has(j.status)) { j.status = 'cancelled'; delete j.draft; delete j.additional }
      await this.persist(user, room)
    })
  }
  abortScheduled(userId?: string, id?: string, occurrenceId?: string): void {
    for (const [key, job] of this.jobs) {
      const [user, room] = JSON.parse(key)
      if (job.requestId.startsWith('server_') && (!userId || user === userId) && (!id || room === id) && (!occurrenceId || job.requestId === `server_${occurrenceId}`)) job.controller.abort()
    }
  }
  async cancelScheduled(userId: string, id: string, occurrenceId: string, accountId?: unknown): Promise<void> {
    identifier(userId); roomId(id); identifier(occurrenceId)
    const running = this.jobs.get(this.jobKey(userId,id))
    if (running?.requestId === `server_${occurrenceId}` && running.accountId === accountId) running.controller.abort()
    await this.read(userId, id, accountId)
    this.abortScheduled(userId, id, occurrenceId)
    await this.locked(userId, id, async () => {
      const room = await this.read(userId, id, accountId), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
      if (!j || TERMINAL.has(j.status)) return
      j.status = 'cancelled'; delete j.draft;delete j.additional
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
      const room = await this.readStored(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
      if (!j || TERMINAL.has(j.status) || j.status === 'paused' || this.jobs.has(key) || j.nextAttemptAt > now() || (j.status === 'generating' && (j.leaseUntil || 0) > now())) return
      if (j.expiresAt < now() || j.revision !== room.revision) { j.status = j.expiresAt < now() ? 'missed' : 'cancelled'; delete j.draft; delete j.additional; await this.persist(user, room); return }
      if (!room.runtime!.enabled || !await allowed()) { j.status = 'cancelled'; delete j.draft; delete j.additional; await this.persist(user, room); return }
      if (j.kind === 'idle' && (room.settings!.responseMode==='manual'||!room.runtime!.idle?.enabled || j.idlePeriodId !== room.runtime!.idle.periodId || room.runtime!.idle.delivered >= 3)) { j.status='cancelled';delete j.draft;delete j.additional;await this.persist(user,room);return }
      if (j.responder !== 'auto' && !room.characterIds.includes(j.responder)) { j.status = 'paused'; j.reason = 'Responder is unavailable.'; await this.persist(user, room); return }
      const minimum = minimumDelay(room,j.responder,now())
      if (!j.draft && (minimum === Infinity || now() < (j.createdAt ?? j.dueAt) + minimum)) return
      if (j.draft && (statusFor(room,j.draft.characterId,now()) === 'offline' || now() < (j.createdAt ?? j.dueAt) + delayFor(room,j.draft.characterId,now()))) return
      if (j.draft && (j.deliverAt || 0) > now()) return
      if ((j.additional || []).some(d=>statusFor(room,d.characterId,now())==='offline'||now()<(j.createdAt??j.dueAt)+delayFor(room,d.characterId,now()))) return
      // A generated draft is recoverable without another paid request.
      generate = !j.draft
      if (generate && j.attempts >= (j.kind==='idle'?1:3)) { j.status = 'failed'; await this.persist(user, room); return }
      if (!generate && (j.deliveryAttempts || 0) >= 3) { j.status = 'paused'; j.reason = 'Delivery could not be saved. Deferred content is preserved.'; await this.persist(user, room); return }
      if (generate && !await reserve()) return
      j.claim = claim; j.leaseUntil = now() + 240000
      if (generate) { j.status = 'generating'; j.attempts++ }
      else j.deliveryAttempts = (j.deliveryAttempts || 0) + 1
      this.jobs.set(key, { requestId, controller, accountId: room.accountId })
      try { await this.persist(user, room); snapshot = room } catch (error) { this.jobs.delete(key); if(generate) this.releaseAutomatic(user,id); throw error }
    })
    if (!snapshot) return
    const timer = setTimeout(() => controller.abort(), 180000)
    try {
      await permitted(snapshot)
      if (generate) {
        const j = snapshot.runtime!.jobs.find(j => j.id === occurrenceId)!
        const reply = await generateMochiReply(this.host, snapshot, user, j.responder, controller.signal, eligibleResponders(snapshot,j.responder,now()).filter(c => now() >= (j.createdAt ?? j.dueAt) + delayFor(snapshot!,c,now())),j.kind==='response'&&snapshot.settings!.responseMode==='natural'&&j.responder==='auto')
        await this.locked(user, id, async () => {
          const room = await this.readStored(user, id), job = room.runtime?.jobs.find(j => j.id === occurrenceId)
          await permitted(room)
          if (!job || job.claim !== claim || job.status !== 'generating' || room.revision !== j.revision) throw new Error('The room changed; scheduled output was discarded.')
          if(reply.silent){job.status='delivered';job.deliveredAt=now();await this.persist(user,room,controller.signal);return}
          job.draft = { characterId: reply.character.id, text: reply.text, name: room.settings!.characterNames[reply.character.id] || reply.character.name, avatarUrl: reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '' }
          job.status = 'generated'
          job.additional=reply.replies.slice(1).map(r=>({characterId:r.character.id,text:r.text,name:room.settings!.characterNames[r.character.id]||r.character.name,avatarUrl:r.character.image_id?`/api/v1/images/${entityId(r.character.image_id)}`:'',proposedStatus:r.behavior.status}))
          job.deliverAt = Math.max(...reply.replies.map(r=>Math.max(now()+r.behavior.delayMs,(job.createdAt??job.dueAt)+delayFor(room,r.character.id,now()))))
          job.nextAttemptAt = job.deliverAt; job.expiresAt = Math.max(job.expiresAt, job.deliverAt + 3600000); job.proposedStatus = reply.behavior.status
          await this.persist(user, room, controller.signal)
        })
      }
      await this.locked(user, id, async () => {
        const room = await this.readStored(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
        if(j && TERMINAL.has(j.status)) return
        if (j?.draft && (j.deliverAt || 0) > now()) return
        await permitted(room)
        if (!j || j.claim !== claim || j.status !== 'generated' || !j.draft || j.revision !== room.revision || j.expiresAt < now()) throw new Error('The scheduled delivery changed or expired.')
        const draft = j.draft, createdAt = new Date(now()).toISOString(), messageId = crypto.randomUUID()
        if(j.kind==='idle'&&(!room.runtime!.idle?.enabled||j.idlePeriodId!==room.runtime!.idle.periodId||room.runtime!.idle.delivered>=3||now()<room.runtime!.idle.lastDeliveredAt+5400000)) return
        const drafts=[draft,...j.additional || []]
        if(drafts.some(d=>statusFor(room,d.characterId,now())==='offline'||now()<(j.createdAt??j.dueAt)+delayFor(room,d.characterId,now()))) throw new Error('Presence changed before delivery.')
        if (statusFor(room,draft.characterId,now()) === 'offline' || now() < (j.createdAt ?? j.dueAt) + delayFor(room,draft.characterId,now())) throw new Error('Presence changed before delivery.')
        const message: MochiMessage = { id: messageId, requestId, role: 'assistant', characterId: draft.characterId, name: draft.name, avatarUrl: draft.avatarUrl, content: draft.text, createdAt }
        room.messages.push(message)
        const notification = { id: messageId, messageId, roomId: id, roomTitle: room.title, title: draft.name, body: draft.text.slice(0, 220), avatarUrl: draft.avatarUrl, createdAt, read: false, ...(room.accountId ? {accountId:room.accountId} : {}) }
        room.notifications!.push(notification); room.notificationRevision!++; room.revision++; room.updatedAt = createdAt
        const events=[{notification,revision:room.notificationRevision!}]
        for(const d of j.additional || []) {
          const mid=crypto.randomUUID();room.messages.push({id:mid,requestId,role:'assistant',characterId:d.characterId,name:d.name,avatarUrl:d.avatarUrl,content:d.text,createdAt} satisfies MochiMessage)
          const notice={...notification,id:mid,messageId:mid,title:d.name,avatarUrl:d.avatarUrl,body:d.text.slice(0,220)};room.notifications!.push(notice);room.notificationRevision!++;events.push({notification:notice,revision:room.notificationRevision!})
          applyDeliveredStatus(room,d.characterId,d.proposedStatus,now())
        }
        // Completion tombstone is atomic with the message, independent of later deletion.
        j.status = 'delivered'; j.messageId = messageId; j.deliveredAt = now(); delete j.draft
        applyDeliveredStatus(room,draft.characterId,j.proposedStatus,now()); delete j.proposedStatus
        delete j.additional
        if(j.kind==='idle'){const idle=room.runtime!.idle!;idle.delivered++;idle.lastDeliveredAt=now();idle.nextDueAt=now()+5400000}
        await this.persist(user, room, controller.signal)
        for(const event of events) this.host.sendToFrontend({ type: 'mochi:notification', notification:event.notification, notificationRevision:event.revision, accountId: event.notification.accountId }, user)
        const { runtime, ...visible } = room
        this.host.sendToFrontend({ type: 'mochi:room_updated', room: { ...visible, background: publicRuntime(runtime) } }, user)
      })
    } catch (error) {
      await this.locked(user, id, async () => {
        const room = await this.readStored(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
        if (!j || j.claim !== claim || TERMINAL.has(j.status)) return
        if (!room.runtime!.enabled || !await allowed() || j.revision !== room.revision) { j.status = 'cancelled'; delete j.draft; delete j.additional }
        else if (controller.signal.aborted || temporaryFailure(error)) {
          j.status = j.draft ? 'generated' : j.kind !== 'idle' && j.attempts < 3 ? 'queued' : 'failed'
          j.nextAttemptAt = now() + Math.min(900000, 60000 * 2 ** Math.max(0, j.attempts - 1)); j.leaseUntil = 0
        } else { j.status = 'paused'; j.reason = 'Scheduled messaging needs attention. Check room sources, provider and storage.' }
        await this.persist(user, room)
      })
    } finally {
      clearTimeout(timer)
      if (this.jobs.get(key)?.controller === controller) this.jobs.delete(key)
      if(generate) this.releaseAutomatic(user,id)
    }
  }
  async message(userId: string, input: any, regenerate = false): Promise<void> {
    const user = this.account(userId), id = roomId(input.roomId), requestId = entityId(input.requestId)
    const key = this.jobKey(user, id), controller = new AbortController()
    let phoneKey: string | undefined
    const waiting = this.pending.get(key) || new Set<{ requestId: string; controller: AbortController; accountId?: string; phoneKey?: string }>()
    const queued = { requestId, controller, accountId: input.accountId,phoneKey }; waiting.add(queued); this.pending.set(key, waiting)
    const selectedOnPhone=async()=>{if(phoneKey&&input.accountId&&(await this.fictionalAccounts.bank(user)).phones?.[phoneKey]?.lastAccountId!==input.accountId)throw new Error('The Mochi account on this phone changed; refresh before sending.')}
    const launched = await this.phoneKey(user,input.phone).then(resolved=>{phoneKey=resolved;queued.phoneKey=resolved;return this.locked(user, id, async () => {
      await selectedOnPhone()
      const room = await this.read(user, id, input.accountId)
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
      if(content&&room.runtime?.idle) {
        const idle=room.runtime.idle;idle.periodId=requestId;idle.startedAt=this.now();idle.delivered=0;idle.opportunities=0;idle.nextDueAt=Math.max(this.now()+5400000,idle.lastDeliveredAt+5400000)
        for(const j of room.runtime.jobs) if((j.kind==='idle'||j.kind==='response')&&!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      }
      room.receipts!.push(requestId)
      room.revision++; room.updatedAt = new Date().toISOString()
      await this.persist(user, room)
      this.host.sendToFrontend({ type:'mochi:accepted', requestId, roomId:id },user)
      const mode=room.settings!.responseMode,natural=Boolean(content&&mode==='natural'&&responder==='auto')
      let generate = (!content || (mode ? mode!=='manual'&&!!room.runtime?.enabled&&await this.backgroundEnabled(user) : room.settings!.autoReply)) && !controller.signal.aborted
      if (generate && !regenerate && minimumDelay(room,responder,this.now()) > 0) {
        generate = false
        if (!room.runtime?.enabled || !await this.backgroundEnabled(user)) throw new Error('This character is unavailable. Enable account and room background messaging to queue delayed replies.')
        for (const job of room.runtime.jobs) if (job.kind === 'response' && !TERMINAL.has(job.status)) { job.status = 'cancelled'; delete job.draft;delete job.additional }
        if (room.runtime.jobs.length >= MAX_JOBS || room.runtime.jobs.filter(j=>!TERMINAL.has(j.status)).length >= 4) throw new Error('The delayed-response queue is full; your user message is saved.')
        const now = this.now(), delay = minimumDelay(room,responder,now), dueAt = now + (Number.isFinite(delay) ? delay : 0)
        room.runtime.jobs.push({ id: `response_${requestId}`, kind: 'response', createdAt: now, dueAt, expiresAt: now + 86400000 + (Number.isFinite(delay)?delay:0), revision: room.revision, responder, status:'queued', attempts:0, nextAttemptAt:dueAt })
        await this.persist(user,room)
      }
      if (generate && regenerate && minimumDelay(room,responder,this.now()) > 0) throw new Error('The selected character is unavailable for an immediate reroll.')
      if (generate) this.jobs.set(key, { requestId, controller, accountId: room.accountId,phoneKey })
      return { room, responder, generate, natural, targetId, promptRoom: regenerate ? { ...room, messages: room.messages.slice(0, targetIndex) } : room }
    })}).finally(() => { waiting.delete(queued); if (!waiting.size && this.pending.get(key) === waiting) this.pending.delete(key) })
    const publish = async (accepted: boolean) => this.host.sendToFrontend({ type: 'mochi:state', requestId, accepted, state: await this.state(user, input.accountId) }, user)
    if (!launched?.generate) { await publish(true); return }
    const timeout = setTimeout(() => controller.abort(), 180000)
    let automaticReserved=false
    try {
      await publish(true)
      if (launched.room.settings!.aiBehavior || (launched.room.settings!.responseMode && input.content)) {
        if(!await this.backgroundEnabled(user)) throw new Error('Background behavior is disabled.')
        automaticReserved=await this.reserveAutomatic(user,id)
        if(!automaticReserved) throw new Error('The automatic generation limit was reached.')
      }
      const reply = await generateMochiReply(this.host, launched.promptRoom, user, launched.responder, controller.signal, eligibleResponders(launched.room,launched.responder,this.now()).filter(c=>delayFor(launched.room,c,this.now())===0),launched.natural)
      await this.locked(user, id, async () => {
        controller.signal.throwIfAborted()
        await selectedOnPhone()
        const current = await this.read(user, id, input.accountId)
        if (current.revision !== launched.room.revision || this.jobs.get(key)?.controller !== controller) throw new Error('The room changed during generation; the reply was discarded.')
        await validateMochiSources(this.host, current, user)
        if (!this.host.permissions.has('characters')) throw new Error('Character permission is required.')
        for (const characterId of current.characterIds) if (!await this.host.characters.get(characterId, user)) throw new Error('A room character is no longer available; the reply was discarded.')
        if(launched.room.settings!.responseMode&&input.content&&(!current.runtime?.enabled||!await this.backgroundEnabled(user))) throw new Error('Automatic messaging was disabled.')
        if(reply.silent) return
        if(reply.replies.some(r=>delayFor(current,r.character.id,this.now())>0)) throw new Error('Character presence changed; immediate replies were discarded.')
        if (delayFor(current,reply.character.id,this.now()) > 0) throw new Error('Character presence changed; the immediate reply was discarded.')
        const name = current.settings!.characterNames[reply.character.id] || reply.character.name
        if (current.settings!.aiBehavior) {
          if (!current.runtime?.enabled || !await this.backgroundEnabled(user)) throw new Error('Background behavior was disabled; the reply was discarded.')
          if (reply.replies.some(r=>r.behavior.delayMs > 0)) {
            if (launched.targetId) throw new Error('Deferred rerolls are unsupported; the original message was preserved.')
            for (const j of current.runtime.jobs) if (j.kind === 'response' && !TERMINAL.has(j.status)) { j.status='cancelled';delete j.draft; delete j.additional }
            if (current.runtime.jobs.length >= MAX_JOBS || current.runtime.jobs.filter(j=>!TERMINAL.has(j.status)).length >= 4) throw new Error('Deferred queue is full; history was preserved.')
            const now = this.now(), deliverAt = now + Math.max(...reply.replies.map(r=>r.behavior.delayMs))
            current.runtime.jobs.push({id:`deferred_${requestId}`,kind:'response',createdAt:now,dueAt:deliverAt,deliverAt,expiresAt:deliverAt+3600000,revision:current.revision,responder:reply.character.id,status:'generated',attempts:1,nextAttemptAt:deliverAt,proposedStatus:reply.behavior.status,draft:{characterId:reply.character.id,name,avatarUrl:reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '',text:reply.text},additional:reply.replies.slice(1).map(r=>({characterId:r.character.id,name:current.settings!.characterNames[r.character.id]||r.character.name,avatarUrl:r.character.image_id?`/api/v1/images/${entityId(r.character.image_id)}`:'',text:r.text,proposedStatus:r.behavior.status}))})
            await this.persist(user,current,controller.signal)
            return
          }
        }
        const notifications:Array<{notification:any;revision:number}>=[]
        if (launched.targetId) {
          const index = this.messageIndex(current, launched.targetId), previous = current.messages[index] as MochiMessage
          current.messages[index] = { ...previous, content: reply.text, editedAt: new Date().toISOString(), previousVersions: [...previous.previousVersions || [], this.previousVersion(previous)] }
          for (const n of current.notifications!) if (n.messageId === previous.id) n.body = reply.text.slice(0, 220)
        } else {
          for(const r of reply.replies) {
          const name=current.settings!.characterNames[r.character.id]||r.character.name
          const message: MochiMessage = { id: crypto.randomUUID(), role: 'assistant', characterId: r.character.id, name, avatarUrl: r.character.image_id ? `/api/v1/images/${entityId(r.character.image_id)}` : '', content: r.text, createdAt: new Date().toISOString(), requestId }
          current.messages.push(message)
          const notification = { id: message.id, messageId: message.id, roomId: id, roomTitle: current.title, title: name, body: message.content.slice(0, 220), avatarUrl: message.avatarUrl, createdAt: message.createdAt, read: false, ...(current.accountId ? {accountId:current.accountId} : {}) }
          current.notifications!.push(notification)
          current.notificationRevision!++;notifications.push({notification,revision:current.notificationRevision!})
          if(current.settings!.aiBehavior) applyDeliveredStatus(current,r.character.id,r.behavior.status,this.now())
          }
        }
        if (current.settings!.aiBehavior) applyDeliveredStatus(current,reply.character.id,reply.behavior.status,this.now())
        current.revision++; current.updatedAt = new Date().toISOString()
        if(launched.targetId) current.notificationRevision!++
        controller.signal.throwIfAborted()
        await this.persist(user, current, controller.signal)
        for(const event of notifications) this.host.sendToFrontend({ type: 'mochi:notification', notification:event.notification, notificationRevision:event.revision, accountId: event.notification.accountId }, user)
      })
    } finally {
      clearTimeout(timeout)
      if(automaticReserved) this.releaseAutomatic(user,id)
      if (this.jobs.get(key)?.controller === controller) this.jobs.delete(key)
      this.host.sendToFrontend({ type: 'mochi:job_finished', roomId: id, requestId, accountId: input.accountId }, user)
      await publish(false)
    }
  }
  async handle(payload: any, userId?: string): Promise<void> {
    if (!userId) return
    let selectedRoomId: string | undefined
    try {
      if (payload.type.startsWith('mochi:account_') || payload.type === 'mochi:accounts') {
        let createdAccountId: string | undefined, uploadedAvatarId: string | undefined
        if (payload.type === 'mochi:account_create') createdAccountId = (await this.fictionalAccounts.create(userId, payload)).id
        else if (payload.type === 'mochi:account_update') await this.fictionalAccounts.update(userId, payload)
        else if (payload.type === 'mochi:account_select') await this.selectAccount(userId, payload)
        else if (payload.type === 'mochi:account_archive') await this.archiveAccount(userId, payload)
        else if (payload.type === 'mochi:account_restore') await this.fictionalAccounts.restore(userId, payload)
        else if (payload.type === 'mochi:account_startup') await this.fictionalAccounts.startup(userId,payload,await this.phoneKey(userId,payload.phone))
        else if (payload.type === 'mochi:account_avatar_upload') uploadedAvatarId = await this.fictionalAccounts.uploadAvatar(userId, payload.dataUrl)
        else if (payload.type !== 'mochi:accounts') throw new Error('Unsupported fictional account action.')
        this.host.sendToFrontend({ type: 'mochi:accounts', requestId: payload.requestId, createdAccountId, uploadedAvatarId, state: await this.accountsState(userId,payload.phone) }, userId)
        return
      }
      if (payload.type === 'mochi:send') { await this.message(userId, payload); return }
      if (payload.type === 'mochi:regenerate') { await this.message(userId, payload, true); return }
      if (payload.type === 'mochi:message_action') await this.action(userId, payload)
      else if(payload.type==='mochi:room_assign')await this.assignRoom(userId,payload)
      else if (payload.type === 'mochi:notification_read') {
        await this.acknowledge(userId, payload)
        const state = await this.state(userId, payload.accountId)
        this.host.sendToFrontend({ type: 'mochi:notifications', requestId: payload.requestId, accountId: state.accountId, notifications: state.notifications, notificationRevisions: Object.fromEntries(state.rooms.map(r => [r.id, r.notificationRevision || 0])) }, userId)
        return
      }
      else if (payload.type === 'mochi:notification_clear') await this.clearNotifications(userId, payload)
      if (payload.type === 'mochi:cancel') { await this.cancel(userId, payload.roomId, payload.generationRequestId, payload.accountId); return }
      if (payload.type === 'mochi:create') selectedRoomId = (await this.create(userId, payload)).id
      else if (payload.type === 'mochi:update') selectedRoomId = (await this.update(userId, payload)).id
      else if (payload.type !== 'mochi:list' && payload.type !== 'mochi:message_action' && payload.type !== 'mochi:notification_clear' && payload.type !== 'mochi:room_assign') throw new Error('Unsupported Mochi action.')
      this.host.sendToFrontend({ type: 'mochi:state', requestId: payload.requestId, selectedRoomId, state: await this.state(userId, payload.accountId) }, userId)
    } catch (error) {
      const message = error instanceof Error ? error.name === 'AbortError' ? 'Reply stopped. Your messages are saved.' : error.message : 'Unable to save Mochi room.'
      const safeMessage = message.replace(/\b(?:sk-|key-|Bearer\s+)[A-Za-z0-9._-]{8,}\b/gi, '[redacted]').replace(/\s+/g, ' ').trim().slice(0, 500)
      this.host.sendToFrontend({ type: 'mochi:error', requestId: payload.requestId, message: safeMessage || 'Unable to save Mochi room.' }, userId)
    }
  }
}
