import type { MochiHost } from './service.js'
import type { MochiPersona } from './types.js'
import { identifier } from './scheduling.js'

const PATH = 'mochi/v1/fictional-accounts.json'
export interface MochiAccount {
  version: 1; id: string; ownerId: string; revision: number
  displayName: string; username: string; avatarUrl: string; persona: MochiPersona
  createdAt: string; updatedAt: string; archived: boolean
}
export interface MochiAccountBank {
  version: 1; ownerId: string; revision: number; selectedAccountId: string; accounts: MochiAccount[]
}
export function fictionalAccountId(value: unknown): string {
  if (typeof value !== 'string' || !/^account_[a-f0-9]{32}$/.test(value)) throw new Error('Invalid fictional account identifier.')
  return value
}
function field(value: unknown, limit: number, required = false): string {
  if (typeof value !== 'string' || value.length > limit || (required && !value.trim())) throw new Error('Invalid fictional profile field.')
  return value.trim()
}
function username(value: unknown): string {
  const name = field(value ?? '', 33).replace(/^@/, '')
  if (name && !/^[A-Za-z0-9_.-]{1,32}$/.test(name)) throw new Error('Use up to 32 letters, numbers, dots, underscores or hyphens for a username.')
  return name
}
/** Account records and selection share one atomic file; room ownership is stored on each room. */
export class MochiAccounts {
  private locks = new Map<string, Promise<unknown>>()
  constructor(private host: MochiHost, private snapshot: (user: string, input: any) => Promise<MochiPersona>, private now: () => number = Date.now) {}
  async guard<T>(user: string, work: () => Promise<T>): Promise<T> {
    identifier(user)
    const previous = this.locks.get(user) || Promise.resolve()
    const task = previous.catch(() => {}).then(work)
    this.locks.set(user, task)
    try { return await task } finally { if (this.locks.get(user) === task) this.locks.delete(user) }
  }
  async bank(userId: string): Promise<MochiAccountBank> {
    const user = identifier(userId)
    if (!await this.host.userStorage.exists(PATH, user)) return { version: 1, ownerId: user, revision: 0, selectedAccountId: '', accounts: [] }
    const bank = await this.host.userStorage.getJson(PATH, { userId: user }) as MochiAccountBank
    if (!bank || bank.version !== 1 || bank.ownerId !== user || !Number.isSafeInteger(bank.revision) || bank.revision < 1 || !Array.isArray(bank.accounts) || bank.accounts.length > 100) throw new Error('Damaged fictional accounts; stored data was preserved.')
    const ids = new Set<string>()
    for (const account of bank.accounts) {
      if (!account || account.version !== 1 || account.ownerId !== user || !Number.isSafeInteger(account.revision) || account.revision < 1 || typeof account.archived !== 'boolean') throw new Error('Damaged fictional account; stored data was preserved.')
      fictionalAccountId(account.id)
      if (ids.has(account.id)) throw new Error('Ambiguous fictional accounts; stored data was preserved.')
      ids.add(account.id)
      field(account.displayName, 120, true)
      if (typeof account.username !== 'string' || username(account.username) !== account.username) throw new Error('Invalid saved fictional username; stored data was preserved.')
      field(account.avatarUrl, 500)
      if (!account.persona || !['manual','lumiverse','pocket'].includes(account.persona.source)) throw new Error('Invalid fictional persona snapshot; stored data was preserved.')
      field(account.persona.name, 120, true); field(account.persona.description, 12000); field(account.persona.sourceId, 180); field(account.persona.avatarUrl, 500)
      if (account.persona.source !== 'manual') identifier(account.persona.sourceId)
      for (const date of [account.createdAt, account.updatedAt]) if (typeof date !== 'string' || !Number.isFinite(Date.parse(date))) throw new Error('Invalid fictional account metadata; stored data was preserved.')
    }
    if (bank.selectedAccountId !== '' && !bank.accounts.some(a => a.id === bank.selectedAccountId && !a.archived)) throw new Error('Invalid fictional account selection; stored data was preserved.')
    return bank
  }
  async get(user: string, id: unknown, includeArchived = false): Promise<MochiAccount> {
    const target = fictionalAccountId(id), account = (await this.bank(user)).accounts.find(a => a.id === target)
    if (!account || (account.archived && !includeArchived)) throw new Error('This fictional account is not available.')
    return account
  }
  private async save(user: string, bank: MochiAccountBank): Promise<void> {
    bank.revision++
    await this.host.userStorage.setJson(PATH + '.pending', bank, { userId: user })
    await this.host.userStorage.move(PATH + '.pending', PATH, user)
  }
  async create(user: string, input: any): Promise<MochiAccount> {
    return this.guard(user, async () => {
      const bank = await this.bank(user)
      if (bank.accounts.length >= 100) throw new Error('Fictional account limit reached; existing profiles were preserved.')
      const persona = await this.snapshot(user, input.persona), timestamp = new Date(this.now()).toISOString()
      const id = fictionalAccountId(`account_${crypto.randomUUID().replaceAll('-', '')}`)
      if (bank.accounts.some(a => a.id === id)) throw new Error('Fictional account identifier collision; retry creation.')
      const account: MochiAccount = { version: 1, id, ownerId: user, revision: 1, displayName: field(input.displayName ?? persona.name, 120, true), username: username(input.username), avatarUrl: persona.avatarUrl, persona, createdAt: timestamp, updatedAt: timestamp, archived: false }
      bank.accounts.push(account); await this.save(user, bank)
      return account
    })
  }
  async update(user: string, input: any): Promise<MochiAccount> {
    return this.guard(user, async () => {
      const bank = await this.bank(user), account = bank.accounts.find(a => a.id === fictionalAccountId(input.accountId) && !a.archived)
      if (!account) throw new Error('This fictional account is not available.')
      if (input.revision !== account.revision) throw new Error('This fictional profile changed elsewhere. Refresh before saving.')
      // Explicit resnapshot applies only to future rooms; existing room snapshots/authorship stay unchanged.
      if (input.persona !== undefined) { account.persona = await this.snapshot(user, input.persona); account.avatarUrl = account.persona.avatarUrl }
      if (input.displayName !== undefined) account.displayName = field(input.displayName, 120, true)
      if (input.username !== undefined) account.username = username(input.username)
      account.revision++; account.updatedAt = new Date(this.now()).toISOString()
      await this.save(user, bank); return account
    })
  }
  async select(user: string, input: any, switched: (previous: string) => void): Promise<void> {
    await this.guard(user, async () => {
      const bank = await this.bank(user), id = fictionalAccountId(input.accountId)
      if (!bank.accounts.some(a => a.id === id && !a.archived)) throw new Error('This fictional account is not available.')
      if (input.revision !== bank.revision) throw new Error('Account selection changed elsewhere. Refresh before switching.')
      const previous = bank.selectedAccountId
      bank.selectedAccountId = id; await this.save(user, bank)
      if (previous !== id) switched(previous)
    })
  }
  async archive(user: string, input: any, changed: () => void): Promise<void> {
    await this.guard(user, async () => {
      if (input.confirmed !== true || input.roomPolicy !== 'preserve') throw new Error('Confirm account archival and explicitly preserve its rooms. Permanent chat deletion is unsupported.')
      const bank = await this.bank(user), account = bank.accounts.find(a => a.id === fictionalAccountId(input.accountId))
      if (!account) throw new Error('This fictional account is not available.')
      if (input.revision !== account.revision) throw new Error('This fictional profile changed elsewhere. Refresh before archival.')
      account.archived = true; account.revision++; account.updatedAt = new Date(this.now()).toISOString()
      if (bank.selectedAccountId === account.id) bank.selectedAccountId = ''
      await this.save(user, bank); changed()
    })
  }
  async restore(user: string, input: any): Promise<void> {
    await this.guard(user, async () => {
      const bank = await this.bank(user), account = bank.accounts.find(a => a.id === fictionalAccountId(input.accountId))
      if (!account) throw new Error('This fictional account is not available.')
      if (input.confirmed !== true || input.revision !== account.revision) throw new Error('Confirm restoration using the current profile revision. Preserved schedules may resume.')
      account.archived = false; account.revision++; account.updatedAt = new Date(this.now()).toISOString()
      await this.save(user, bank)
    })
  }
}
