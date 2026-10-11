import { roomId, defaultMochiSettings, type MochiSettings, type MochiMessage, type MochiPersona, type MochiRoom, type MochiState } from './types.js'
import { generateMochiReply, validateMochiSources } from './generation.js'

// New implementation. No Character Chatroom source is included.
export interface MochiHost {
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
  private locks = new Map<string, Promise<unknown>>()
  private jobs = new Map<string, { requestId: string; controller: AbortController }>()
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
  constructor(private host: MochiHost, private makeId = () => `room_${crypto.randomUUID().replaceAll('-', '')}`) {}
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
    room.settings = this.settings(room.settings, room.characterIds)
    room.receipts ||= []
    if (!Array.isArray(room.receipts) || room.receipts.some(id => typeof id !== 'string')) throw new Error('Invalid saved send receipts.')
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
      const room: MochiRoom = { version: 1, id, revision: 1, title: text(input.title, 120, true), characterIds: await this.membership(user, input.characterIds), persona: await this.persona(user, input.persona), messages: [], createdAt: now, updatedAt: now, settings: defaultMochiSettings(), receipts: [] }
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
    for (const room of rooms) { const job = this.jobs.get(this.jobKey(user, room.id)); if (job) jobs[room.id] = job.requestId }
    return { rooms: rooms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), characters: characters.map(c => ({ id: c.id, name: c.name, avatarUrl: c.image_id ? `/api/v1/images/${c.image_id}` : '' })), personas: choices, warnings, connections, jobs }
  }
  async cancel(userId: string, id: string, requestId: string): Promise<void> {
    const user = this.account(userId)
    roomId(id)
    const job = this.jobs.get(this.jobKey(user, id))
    if (job?.requestId === requestId) job.controller.abort()
    else await this.read(user, id)
  }
  async message(userId: string, input: any): Promise<void> {
    const user = this.account(userId), id = roomId(input.roomId), requestId = entityId(input.requestId)
    const key = this.jobKey(user, id), controller = new AbortController()
    const launched = await this.locked(user, id, async () => {
      const room = await this.read(user, id)
      if (room.receipts!.includes(requestId)) return null
      if (this.jobs.has(key)) throw new Error('A reply is already running in this room. Wait or stop it first.')
      if (room.revision !== input.revision) throw new Error('This room changed elsewhere. Refresh before sending again.')
      const content = text(input.content ?? '', 32000)
      const responder = input.responder === 'auto' || !input.responder ? 'auto' : entityId(input.responder)
      if (responder !== 'auto' && !room.characterIds.includes(responder)) throw new Error('The selected responder is not in this room.')
      if (content) room.messages.push({ id: crypto.randomUUID(), role: 'user', content, name: room.persona.name, avatarUrl: room.persona.avatarUrl, createdAt: new Date().toISOString(), requestId } satisfies MochiMessage)
      room.receipts!.push(requestId)
      room.revision++; room.updatedAt = new Date().toISOString()
      await this.persist(user, room)
      const generate = !content || room.settings!.autoReply
      if (generate) this.jobs.set(key, { requestId, controller })
      return { room, responder, generate }
    })
    const publish = async (accepted: boolean) => this.host.sendToFrontend({ type: 'mochi:state', requestId, accepted, state: await this.state(user) }, user)
    if (!launched?.generate) { await publish(true); return }
    const timeout = setTimeout(() => controller.abort(), 180000)
    try {
      await publish(true)
      const reply = await generateMochiReply(this.host, launched.room, user, launched.responder, controller.signal)
      await this.locked(user, id, async () => {
        controller.signal.throwIfAborted()
        const current = await this.read(user, id)
        if (current.revision !== launched.room.revision || this.jobs.get(key)?.controller !== controller) throw new Error('The room changed during generation; the reply was discarded.')
        await validateMochiSources(this.host, current, user)
        if (!await this.host.characters.get(reply.character.id, user)) throw new Error('The responder is no longer available.')
        const name = current.settings!.characterNames[reply.character.id] || reply.character.name
        current.messages.push({ id: crypto.randomUUID(), role: 'assistant', characterId: reply.character.id, name, avatarUrl: reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '', content: reply.text, createdAt: new Date().toISOString(), requestId } satisfies MochiMessage)
        current.revision++; current.updatedAt = new Date().toISOString()
        controller.signal.throwIfAborted()
        await this.persist(user, current, controller.signal)
      })
    } finally {
      clearTimeout(timeout)
      if (this.jobs.get(key)?.controller === controller) this.jobs.delete(key)
      await publish(false)
    }
  }
  async handle(payload: any, userId?: string): Promise<void> {
    if (!userId) return
    let selectedRoomId: string | undefined
    try {
      if (payload.type === 'mochi:send') { await this.message(userId, payload); return }
      if (payload.type === 'mochi:cancel') { await this.cancel(userId, payload.roomId, payload.generationRequestId); return }
      if (payload.type === 'mochi:create') selectedRoomId = (await this.create(userId, payload)).id
      else if (payload.type === 'mochi:update') selectedRoomId = (await this.update(userId, payload)).id
      else if (payload.type !== 'mochi:list') throw new Error('Unsupported Mochi action.')
      this.host.sendToFrontend({ type: 'mochi:state', requestId: payload.requestId, selectedRoomId, state: await this.state(userId) }, userId)
    } catch (error) {
      this.host.sendToFrontend({ type: 'mochi:error', requestId: payload.requestId, message: error instanceof Error ? error.name === 'AbortError' ? 'Reply stopped. Your messages are saved.' : error.message : 'Unable to save Mochi room.' }, userId)
    }
  }
}
