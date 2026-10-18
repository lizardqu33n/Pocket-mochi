import type { MochiHost } from './service.js'
import type { MochiPersona } from './types.js'
import { validateAddonSelection, saveAddonSelection, type PersonaAddonSelection } from './persona-addons.js'
import { identifier } from './scheduling.js'
import { discoverPersonaAddons, type PersonaAddonChoice } from './persona-addons.js'

export interface PersonaSyncReview { accountId:string; revision:number; signature:string; incoming?:MochiPersona; addons:PersonaAddonChoice[]; unavailable?:string }
function personaLink(value:unknown, persona:MochiPersona):MochiAccount['personaLink'] {
  if(value===null)return undefined
  const v=value as MochiAccount['personaLink']
  if(!v||v.source!=='lumiverse'||identifier(v.sourceId)!==persona.sourceId||persona.source!=='lumiverse')throw Error('Link an imported Lumiverse identity before syncing.')
  return {source:'lumiverse',sourceId:v.sourceId}
}

function validateAddonSnapshots(value:unknown):PersonaAddonChoice[] {
  const snapshots=value as PersonaAddonChoice[]
  if(!Array.isArray(snapshots)||snapshots.length>200||snapshots.some(a=>!a||typeof a.id!=='string'||!a.id||a.id.length>180||typeof a.content!=='string'||a.content.length>12000||typeof a.label!=='string'||a.label.length>200||typeof a.enabled!=='boolean'||typeof a.available!=='boolean'||!Number.isFinite(a.sortOrder)||(a.outletName!==undefined&&(typeof a.outletName!=='string'||a.outletName.length>180))||(a.global!==undefined&&typeof a.global!=='boolean'))||new Set(snapshots.map(a=>a.id)).size!==snapshots.length)throw Error('Invalid saved add-on snapshots; stored data was preserved.')
  return snapshots
}

const PATH = 'mochi/v1/fictional-accounts.json'
export interface MochiAccount {
  version: 1; id: string; ownerId: string; revision: number
  displayName: string; username: string; avatarUrl: string; persona: MochiPersona
  personaAddons?: PersonaAddonSelection
  personaAddonSnapshots?: PersonaAddonChoice[]
  personaLink?: {source:'lumiverse';sourceId:string}
  createdAt: string; updatedAt: string; archived: boolean
}
export interface MochiAccountBank {
  version: 1; ownerId: string; revision: number; selectedAccountId: string; accounts: MochiAccount[]
  startupPreference?: 'last-used' | 'picker'
  phones?: Record<string, {lastAccountId: string; preference: 'last-used'|'picker'}>
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
      if(account.personaAddons!==undefined){const selection=validateAddonSelection(account.personaAddons);if(account.persona.source!=='lumiverse'||selection.personaId!==account.persona.sourceId)throw Error('Invalid saved add-on persona; stored data was preserved.')}
      if (account.persona.source !== 'manual') identifier(account.persona.sourceId)
      if(account.personaLink!==undefined)personaLink(account.personaLink,account.persona)
      if(account.personaAddonSnapshots!==undefined)validateAddonSnapshots(account.personaAddonSnapshots)
      for (const date of [account.createdAt, account.updatedAt]) if (typeof date !== 'string' || !Number.isFinite(Date.parse(date))) throw new Error('Invalid fictional account metadata; stored data was preserved.')
    }
    if (bank.selectedAccountId !== '' && !bank.accounts.some(a => a.id === bank.selectedAccountId && !a.archived)) throw new Error('Invalid fictional account selection; stored data was preserved.')
    if(bank.startupPreference!==undefined&&!['last-used','picker'].includes(bank.startupPreference))throw new Error('Invalid startup preference; stored data was preserved.')
    if(bank.phones!==undefined){if(!bank.phones||typeof bank.phones!=='object'||Array.isArray(bank.phones)||Object.keys(bank.phones).length>1000)throw new Error('Damaged phone selections; stored data was preserved.');for(const [key,p]of Object.entries(bank.phones)){if(key.length>1700||key.split('::').length!==3||!p||!['last-used','picker'].includes(p.preference))throw new Error('Invalid saved phone selection; stored data was preserved.');if(p.lastAccountId!=='')fictionalAccountId(p.lastAccountId)}}
    return bank
  }
  async get(user: string, id: unknown, includeArchived = false): Promise<MochiAccount> {
    const target = fictionalAccountId(id), account = (await this.bank(user)).accounts.find(a => a.id === target)
    if (!account || (account.archived && !includeArchived)) throw new Error('This fictional account is not available.')
    return account
  }
  private async save(user: string, bank: MochiAccountBank): Promise<void> {
    for(const account of bank.accounts){if(account.personaAddonSnapshots!==undefined)validateAddonSnapshots(account.personaAddonSnapshots);if(account.personaAddons!==undefined)validateAddonSelection(account.personaAddons)}
    bank.revision++
    await this.host.userStorage.setJson(PATH + '.pending', bank, { userId: user })
    await this.host.userStorage.move(PATH + '.pending', PATH, user)
  }
  private async avatar(user: string, id: unknown): Promise<string> {
    if (id === '') return ''
    const imageId = identifier(id)
    if (!this.host.images || !this.host.permissions.has('images')) throw new Error('Images permission is required for custom portraits.')
    const image = await this.host.images.get(imageId, user)
    if (!image || !/^image\/(png|jpeg|webp|gif)$/.test(image.mime_type)) throw new Error('This portrait is not available to your account.')
    return `/api/v1/images/${imageId}`
  }
  async uploadAvatar(userId: string, dataUrl: unknown): Promise<string> {
    const user = identifier(userId)
    if (!this.host.images || !this.host.permissions.has('images')) throw new Error('Images permission is required.')
    if (typeof dataUrl !== 'string' || dataUrl.length > 2800000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl)) throw new Error('Choose a PNG, JPEG or WebP portrait up to 2 MB.')
    if (atob(dataUrl.split(',')[1]).length > 2097152) throw new Error('Portrait exceeds 2 MB.')
    const image = await this.host.images.uploadFromDataUrl(dataUrl, 'mochi-portrait', user)
    return identifier(image.id)
  }
  async create(user: string, input: any): Promise<MochiAccount> {
    return this.guard(user, async () => {
      const bank = await this.bank(user)
      if (bank.accounts.length >= 100) throw new Error('Fictional account limit reached; existing profiles were preserved.')
      const persona = await this.snapshot(user, input.persona), timestamp = new Date(this.now()).toISOString()
      const id = fictionalAccountId(`account_${crypto.randomUUID().replaceAll('-', '')}`)
      if (bank.accounts.some(a => a.id === id)) throw new Error('Fictional account identifier collision; retry creation.')
      const account: MochiAccount = { version: 1, id, ownerId: user, revision: 1, displayName: field(input.displayName ?? persona.name, 120, true), username: username(input.username), avatarUrl: persona.avatarUrl, persona, createdAt: timestamp, updatedAt: timestamp, archived: false }
      if (input.avatarId !== undefined) account.avatarUrl = await this.avatar(user, input.avatarId)
      if(input.personaAddons!==undefined)account.personaAddons=await saveAddonSelection(this.host,user,persona,input.personaAddons)
      if(input.personaLink!=null)account.personaLink=personaLink(input.personaLink,persona)
      if(account.personaLink)account.personaAddonSnapshots=await discoverPersonaAddons(this.host,await this.host.personas.get(persona.sourceId,user),user)
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
      if(input.persona!==undefined){delete account.personaLink;delete account.personaAddonSnapshots}
      if(input.personaLink!==undefined){const link=personaLink(input.personaLink,account.persona);if(link)account.personaLink=link;else delete account.personaLink}
      if(input.persona!==undefined&&(account.persona.source!=='lumiverse'||account.personaAddons?.personaId!==account.persona.sourceId))delete account.personaAddons
      if(input.personaAddons!==undefined)account.personaAddons=await saveAddonSelection(this.host,user,account.persona,input.personaAddons)
      if (input.displayName !== undefined) account.displayName = field(input.displayName, 120, true)
      if(input.identityDescription!==undefined){if(input.persona!==undefined)throw Error('Import an identity or edit its saved description separately.');account.persona={...account.persona,description:field(input.identityDescription,12000)}}
      if (input.username !== undefined) account.username = username(input.username)
      if (input.avatarId !== undefined) account.avatarUrl = await this.avatar(user, input.avatarId)
      if(account.personaLink&&!account.personaAddonSnapshots)account.personaAddonSnapshots=await discoverPersonaAddons(this.host,await this.host.personas.get(account.persona.sourceId,user),user)
      else if(account.personaAddonSnapshots&&input.personaAddons!==undefined){const choices=await discoverPersonaAddons(this.host,await this.host.personas.get(account.persona.sourceId,user),user);for(const id of account.personaAddons?.enabledIds||[])if(!account.personaAddonSnapshots.some(a=>a.id===id)){const choice=choices.find(a=>a.id===id&&a.available);if(choice)account.personaAddonSnapshots.push(choice)}}
      account.revision++; account.updatedAt = new Date(this.now()).toISOString()
      await this.save(user, bank); return account
    })
  }
  /** Fresh owner-scoped native data; never writes the source or existing chats. */
  async syncReview(user:string, input:any):Promise<PersonaSyncReview> {
    const account=await this.get(user,input.accountId)
    if(input.revision!==account.revision)throw Error('This fictional profile changed elsewhere. Refresh before syncing.')
    if(!account.personaLink)throw Error('This account has no linked Lumiverse persona.')
    try {
      const incoming=await this.snapshot(user,account.personaLink)
      const native=await this.host.personas.get(account.personaLink.sourceId,user)
      const addons=validateAddonSnapshots(await discoverPersonaAddons(this.host,native,user))
      const bytes=new TextEncoder().encode(JSON.stringify([incoming,addons]))
      const signature=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')
      return {accountId:account.id,revision:account.revision,signature,incoming,addons}
    } catch { return {accountId:account.id,revision:account.revision,signature:'',addons:[],unavailable:'The linked persona is missing, unavailable or incompatible. Saved Mochi values are preserved.'} }
  }
  async sync(user:string,input:any):Promise<void> {
    await this.guard(user,async()=>{
      const review=await this.syncReview(user,input)
      if(!review.incoming||!input.signature||input.signature!==review.signature)throw Error('The source changed or is unavailable. Review again before applying.')
      if(!Array.isArray(input.fields)||input.fields.some((f:unknown)=>!['displayName','avatar','description'].includes(f as string))||new Set(input.fields).size!==input.fields.length)throw Error('Invalid sync field selection.')
      if(!Array.isArray(input.addons)||input.addons.length>200||input.addons.some((a:any)=>!a||typeof a.id!=='string'||typeof a.enabled!=='boolean')||new Set(input.addons.map((a:any)=>a.id)).size!==input.addons.length)throw Error('Invalid sync add-on selection.')
      const bank=await this.bank(user),account=bank.accounts.find(a=>a.id===review.accountId)!
      // Account guard protects all Mochi writes; verify again after reading the source.
      if(account.revision!==review.revision)throw Error('This fictional profile changed elsewhere. Refresh before syncing.')
      const selected=new Set(account.personaAddons?.enabledIds||[])
      for(const change of input.addons){if(!review.addons.some(a=>a.id===change.id&&a.available))throw Error('An add-on is unavailable or incompatible. Saved selections are preserved.');if(change.enabled)selected.add(change.id);else selected.delete(change.id)}
      if(input.fields.includes('displayName'))account.displayName=review.incoming.name
      if(input.fields.includes('avatar'))account.avatarUrl=review.incoming.avatarUrl
      if(input.fields.includes('description'))account.persona={...account.persona,description:review.incoming.description}
      if(selected.size>200)throw Error('Too many saved add-ons. Preserve existing selections or review fewer changes.')
      if(input.addons.length){account.personaAddons={personaId:account.persona.sourceId,enabledIds:[...selected]};const snapshots=new Map((account.personaAddonSnapshots||[]).map(a=>[a.id,a]));for(const change of input.addons)snapshots.set(change.id,review.addons.find(a=>a.id===change.id)!);if(snapshots.size>200)throw Error('Too many saved add-on snapshots. No changes were applied.');account.personaAddonSnapshots=[...snapshots.values()]}
      if(!input.fields.length&&!input.addons.length)throw Error('Choose at least one change to apply.')
      account.revision++;account.updatedAt=new Date(this.now()).toISOString();await this.save(user,bank)
    })
  }
  async select(user: string, input: any, switched: (previous: string) => void, phoneKey?: string): Promise<void> {
    await this.guard(user, async () => {
      const bank = await this.bank(user), id = fictionalAccountId(input.accountId)
      if (!bank.accounts.some(a => a.id === id && !a.archived)) throw new Error('This fictional account is not available.')
      if (input.revision !== bank.revision) throw new Error('Account selection changed elsewhere. Refresh before switching.')
      const previous = phoneKey ? bank.phones?.[phoneKey]?.lastAccountId || '' : bank.selectedAccountId
      if(phoneKey){bank.phones||={};if(!bank.phones[phoneKey]&&Object.keys(bank.phones).length>=1000)throw new Error('Phone selection limit reached.');bank.phones[phoneKey]={lastAccountId:id,preference:bank.phones[phoneKey]?.preference||'last-used'}}else bank.selectedAccountId = id
      await this.save(user, bank)
      if (previous !== id) switched(previous)
    })
  }
  async startup(user:string,input:any,phoneKey?:string):Promise<void>{
    await this.guard(user,async()=>{const bank=await this.bank(user);if(input.revision!==bank.revision)throw new Error('Startup preference changed elsewhere. Refresh first.');if(!['last-used','picker'].includes(input.preference))throw new Error('Invalid startup preference.');if(phoneKey){bank.phones||={};if(!bank.phones[phoneKey]&&Object.keys(bank.phones).length>=1000)throw new Error('Phone selection limit reached.');bank.phones[phoneKey]={lastAccountId:bank.phones[phoneKey]?.lastAccountId||'',preference:input.preference}}else bank.startupPreference=input.preference;await this.save(user,bank)})
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
