import { dispatchReady, identifier, TERMINAL } from './scheduling.js'
import { MochiService, type MochiHost } from './service.js'

const REGISTRY = 'mochi/v1/scheduler-accounts.json'
const ACCOUNT = 'mochi/v1/scheduler.json'
const HOUR = 3600000
interface AccountConfig { version: 1; enabled: boolean; attempts: Array<{ at: number; roomId: string }> }
interface Registry { version: 1; accounts: string[]; attempts: number[] }

/** One server-runtime dispatcher; timers wake it, durable records are the source of truth. */
export class MochiScheduler {
  private timer?: ReturnType<typeof setTimeout>
  private stopped = true
  private ticking = false
  private blocked = new Set<string>()
  private slots = new Set<string>()
  private serial: Promise<unknown> = Promise.resolve()
  constructor(private host: MochiHost, private service: MochiService, private now: () => number = Date.now, private report: (message: string) => void = () => {}) { service.backgroundEnabled = user => this.enabled(user); service.reserveAutomatic = (user,room) => this.reserve(user,room);service.releaseAutomatic=(user,room)=>{this.slots.delete(JSON.stringify([user,room]))};service.schedulingWarning=report }
  private async locked<T>(work: () => Promise<T>): Promise<T> {
    const task = this.serial.catch(() => {}).then(work); this.serial = task
    return task
  }
  private async registry(): Promise<Registry> {
    const storage = this.host.storage
    if (!storage?.exists) throw new Error('This host does not support durable scheduler discovery.')
    const r: Registry = await storage.exists(REGISTRY) ? await storage.getJson(REGISTRY) : { version: 1, accounts: [], attempts: [] }
    if (!r || r.version !== 1 || !Array.isArray(r.accounts) || r.accounts.length > 1000 || new Set(r.accounts).size !== r.accounts.length || !Array.isArray(r.attempts) || r.attempts.length > 120 || r.attempts.some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Damaged scheduler registry; it was preserved.')
    r.accounts.forEach(identifier)
    return r
  }
  private async account(userId: string): Promise<AccountConfig> {
    const user = identifier(userId)
    const c: AccountConfig = await this.host.userStorage.exists(ACCOUNT, user) ? await this.host.userStorage.getJson(ACCOUNT, { userId: user }) as AccountConfig : { version: 1, enabled: false, attempts: [] }
    if (!c || c.version !== 1 || typeof c.enabled !== 'boolean' || !Array.isArray(c.attempts) || c.attempts.length > 60 || c.attempts.some(a => !a || !Number.isSafeInteger(a.at) || a.at < 0 || typeof a.roomId !== 'string')) throw new Error('Damaged account scheduling settings; they were preserved.')
    return c
  }
  private async saveAccount(user: string, c: AccountConfig): Promise<void> {
    await this.host.userStorage.setJson(ACCOUNT + '.pending', c, { userId: user })
    await this.host.userStorage.move(ACCOUNT + '.pending', ACCOUNT, user)
  }
  private async saveRegistry(r: Registry): Promise<void> {
    await this.host.storage!.setJson(REGISTRY + '.pending', r)
    await this.host.storage!.move(REGISTRY + '.pending', REGISTRY)
  }
  async enabled(userId: string): Promise<boolean> {
    return !this.blocked.has(userId) && (await this.account(userId)).enabled
  }
  async configure(userId: string, enabled: unknown): Promise<void> {
    const user = identifier(userId)
    if (typeof enabled !== 'boolean') throw new Error('Invalid account opt-in.')
    if (!enabled) { this.blocked.add(user); this.service.abortScheduled(user) }
    await this.locked(async () => {
      if (this.host.users) await this.host.users.getRole(user)
      const r = await this.registry(), c = await this.account(user)
      if (!r.accounts.includes(user)) {
        if (r.accounts.length >= 1000) throw new Error('Scheduler account registry is full.')
        r.accounts.push(user); await this.saveRegistry(r)
      }
      c.enabled = enabled; await this.saveAccount(user, c)
      if (enabled) this.blocked.delete(user)
    })
    if (!enabled) for (const room of await this.service.scheduledRooms(user)) {
      for (const job of room.runtime?.jobs || []) if (!TERMINAL.has(job.status)) await this.service.cancelScheduled(user, room.id, job.id, room.accountId)
    }
  }
  private async reserve(user: string, roomId: string): Promise<boolean> {
    return this.locked(async () => {
      if (this.stopped || !await this.enabled(user)) return false
      if(this.slots.size>=2||[...this.slots].some(k=>JSON.parse(k)[0]===user)) return false
      const r = await this.registry(), c = await this.account(user), now = this.now()
      // Keep future timestamps too: clock rollback must not reset spending limits.
      r.attempts = r.attempts.filter(at => at > now - HOUR)
      c.attempts = c.attempts.filter(a => a.at > now - HOUR)
      if (r.attempts.length >= 120 || c.attempts.length >= 60 || c.attempts.filter(a => a.roomId === roomId).length >= 30) return false
      r.attempts.push(now); c.attempts.push({ at: now, roomId })
      // Conservative reservation precedes provider dispatch; failed writes may consume capacity, never reset it.
      await this.saveRegistry(r); await this.saveAccount(user, c)
      this.slots.add(JSON.stringify([user,roomId]))
      return true
    })
  }
  async tick(): Promise<void> {
    if (this.stopped || this.ticking) return
    this.ticking = true
    try {
      const registry = await this.registry(), work: Promise<void>[] = []
      for (const user of registry.accounts) {
        if (work.length >= 2 || this.stopped) break
        try {
          if (!await this.enabled(user)) continue
          if (this.host.users) await this.host.users.getRole(user)
          const rooms = await this.service.scheduledRooms(user)
          for(const room of rooms) await this.service.prepareIdle(user,room.id,this.now())
          const refreshed = await this.service.scheduledRooms(user)
          // At most one opportunity per account per wake, and two globally. No catch-up burst.
          const candidates = refreshed.flatMap(room => (room.runtime?.enabled ? room.runtime.jobs : []).filter(j => dispatchReady(room,j,this.now())).map(job => ({ room, job }))).sort((a,b) => a.job.dueAt - b.job.dueAt)
          const candidate = candidates[0]
          if (candidate) work.push(this.service.dispatchScheduled(user, candidate.room.id, candidate.job.id, this.now, () => this.enabled(user), () => this.reserve(user, candidate.room.id)).catch(() => { this.report('Mochi scheduled work failed safely; records were retained for recovery.') }))
        } catch { this.report('Mochi scheduler skipped an unavailable account or damaged record; stored data was preserved.') }
      }
      await Promise.all(work)
    } finally { this.ticking = false }
  }
  start(poll = true): void {
    if (!this.stopped) return
    this.stopped = false
    if (!poll) return
    const wake = async () => {
      try { await this.tick() } catch { this.report('Mochi scheduler could not read its registry; no work was generated.') }
      if (!this.stopped) { this.timer = setTimeout(wake, 30000); (this.timer as unknown as { unref?: () => void }).unref?.() }
    }
    void wake()
  }
  stop(): void { this.stopped = true; clearTimeout(this.timer); this.service.abortScheduled() }
  async handle(payload: any, userId: string): Promise<void> {
    identifier(userId)
    if (payload.type === 'mochi:background_account') await this.configure(userId, payload.enabled)
    else if (payload.type === 'mochi:background_room') await this.service.configureScheduledRoom(userId, payload)
    else if (payload.type === 'mochi:schedule') {
      if (!await this.enabled(userId)) throw new Error('Opt in to background messaging first.')
      await this.service.schedule(userId, payload, this.now())
    } else if (payload.type === 'mochi:presence') await this.service.configurePresence(userId,payload)
    else if(payload.type==='mochi:idle') await this.service.configureIdle(userId,payload)
    else if (payload.type === 'mochi:schedule_cancel') await this.service.cancelScheduled(userId, payload.roomId, payload.occurrenceId, payload.accountId)
    else throw new Error('Unsupported scheduling action.')
  }
}
