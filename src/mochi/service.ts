import {applyRoutineActions} from './routine-actions.js'
import {callPocketProvider} from '../backend/generation.js'
import {GenerationPromptError,GenerationPrompts,feature,choice,scopeKey,resolvePrompt,PROMPT_VERSION,DEFAULT_GENERATION_PROSE,GLOBAL_PROSE,type GenerationFeature} from './generation-prompts.js'
import {parseRoutineDraft,routinePrompt,preserveLocks,RoutineDraftError,type RoutineDraft} from './routine-generation.js'
import {validatePlan,validateOverride,recordRoutine,planFor,routineId,timezone,type RoutineState} from './routines.js'
import {MochiCharacterPreferences} from './character-preferences.js'
import {groupIcon} from './group-icons.js'
import {MochiUIPreferences} from './ui-preferences.js'
import {SummaryError,prepareSummary,requestSummary,summaryInput,summarySources,summaryConfiguration,hashSummaryInput,type SummarySuggestion} from './summarization.js'
import {validateMemory,proveCoverage,inspectMemory,MAX_SUMMARY_TEXT,MAX_SUMMARY_VERSIONS,type SummaryVersion} from './memory.js'
import { roomId, defaultMochiSettings, type MochiSettings, type MochiMessage, type MochiPersona, type MochiRoom, type MochiState } from './types.js'
import { discoverPersonaAddons } from './persona-addons.js'
import { generateMochiReply, validateMochiSources,resolveGenerationSources } from './generation.js'
import { MochiGenerationError, publicGenerationFailure } from './generation-errors.js'
import { identifier, MAX_JOBS, publicRuntime, scheduleInput, temporaryFailure, TERMINAL, validateRuntime, type ScheduledJob } from './scheduling.js'
import { delayFor, eligibleResponders, minimumDelay, statusFor, validatePresence } from './presence.js'
import { applyDeliveredStatus } from './behavior.js'
import { MochiAccounts, fictionalAccountId } from './accounts.js'
import { phoneContext, type MochiPhone } from './phone-selection.js'
import { referencedMessage, replyIdentifier } from './replies.js'
import { REACTION_EMOJI, readReactions } from './reactions.js'
import {validatePinnedContent,validateNote,noteId,MAX_CHAT_PINS} from './pins.js'
import {searchRoom} from './search.js'
import {validateTextingStyles} from './texting.js'
import {previewContext,sourceSignature} from './preview.js'
import {MochiPresets,validateBinding,DEFAULT_PRESET_ID,DEFAULT_V2_PRESET_ID,isBuiltInPreset} from './presets.js'

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
  global_addons?: { get(id:string,userId:string):Promise<any> }
  personas: { get(id: string, userId: string): Promise<any>; list(options: any): Promise<any> }
  permissions: { has(name: string): boolean }
  sendToFrontend(payload: unknown, userId: string): void
  connections?: { get(id: string, userId: string): Promise<any>; list(userId: string): Promise<any[]> }
  tokens?: { countMessages(messages: any[], options: any): Promise<any> }
  generate?: { quiet(input: any): Promise<any> }
}
const ROOT = 'mochi/v1/rooms/'
const pathFor = (id: unknown) => `${ROOT}${roomId(id)}.json`
function equivalent(a: unknown, b: unknown): boolean {
  const canonical = (value: any): any => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, canonical(value[k])])) : value
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b))
}
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
  groupIcon(value.groupIcon)
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
  readonly generationPrompts:GenerationPrompts
  /** Read-only construction is shared with dispatch; no provider or quota reservation. */
  private async generationPlan(user:string,room:MochiRoom,input:any,f:GenerationFeature):Promise<any>{
    const bank=await this.generationPrompts.read(user)
    const target=f==='summary'?(room.characterIds.length===1?room.characterIds[0]:''):input.characterId||''
    const selected=resolvePrompt(bank,f,room.accountId,target)
    let messages:any[],sources:any,budget:any
    if(f==='schedule'){
      const character=routineId(input.characterId)
      if(!room.characterIds.includes(character))throw new GenerationPromptError('Character is unavailable.')
      if(input.includeHistory!==undefined&&typeof input.includeHistory!=='boolean'||input.includeHistory===true&&input.historyConfirmed!==true)throw new GenerationPromptError('Explicitly approve this chat history before including it.')
      sources=await resolveGenerationSources(this.host,room,user,character,[character])
      const history=input.includeHistory===true?(room.messages.slice(-20) as MochiMessage[]).map(m=>({role:m.role,characterId:m.characterId,text:m.content.slice(0,2000)})):undefined
      messages=routinePrompt({...sources.characters[0],about:room.characterDefaults?.[character]?.about},input.timezone,input.guidance??'',planFor(room,character),history,selected)
      if(!this.host.tokens?.countMessages)throw new GenerationPromptError('Required token counter is unavailable.')
      const count=await this.host.tokens.countMessages(messages,{model:room.settings!.model||sources.connection.model,userId:user})
      budget={inputTokens:count.total_tokens,outputTokens:room.settings!.outputTokens,contextTokens:room.settings!.contextTokens,envelopeTokens:256,approximate:typeof count.approximate==='boolean'?count.approximate:null}
      if(!Number.isFinite(count.total_tokens)||count.total_tokens<0||count.total_tokens+budget.outputTokens+256>budget.contextTokens)throw new GenerationPromptError('Schedule source exceeds this chat’s token budget. Shorten instructions or omit history.')
    }else{
      // The existing Generate summary button approves the visibly selected prefix.
      if(input.historyConfirmed!==undefined&&input.historyConfirmed!==true)throw new GenerationPromptError('Approve the selected conversation prefix first.')
      const plan=await prepareSummary(this.host,room,user,input.boundaryId,input.useCurrent===true,new AbortController().signal,selected)
      messages=plan.messages;sources=plan.sources;budget=plan.budget
      return {...plan,promptRevision:bank.revision,digest:await hashSummaryInput([user,room.id,room.accountId,room.revision,room.associationRevision,bank.revision,messages,sourceSignature(sources)]),effective:selected}
    }
    return {messages,sources,budget,promptRevision:bank.revision,digest:await hashSummaryInput([user,room.id,room.accountId,room.revision,room.associationRevision,bank.revision,messages,sourceSignature(sources)]),effective:selected}
  }
  async promptConfiguration(userId:string,input:any){
    return this.locked(identifier(userId),roomId(input.roomId),async()=>{
    const user=identifier(userId),room=await this.read(user,roomId(input.roomId),input.accountId),f=feature(input.feature)
    if(room.revision!==input.revision)throw new GenerationPromptError('Conversation changed. Reload prompt controls.')
    if(input.characterId&&!room.characterIds.includes(entityId(input.characterId)))throw new GenerationPromptError('Character is unavailable.')
    if(room.accountId)await this.fictionalAccounts.get(user,room.accountId)
    if(input.action==='preview'){
      const plan=await this.generationPlan(user,room,input,f)
      return {messages:plan.messages,budget:plan.budget,digest:plan.digest,promptRevision:plan.promptRevision,effective:plan.effective,wrappers:'Exact Mochi-built messages. Provider or host wrappers are invisible to Mochi and are not shown.'}
    }
    let bank=await this.generationPrompts.read(user)
    if(input.action!=='read'){
      const key=scopeKey(input.scope,f,room.accountId,input.characterId)
      if(!['save','reset','inherit'].includes(input.action))throw new GenerationPromptError('Invalid prompt action.')
      const value=input.action==='inherit'?undefined:input.action==='reset'?{instructions:input.scope==='global'?GLOBAL_PROSE:DEFAULT_GENERATION_PROSE[f],detail:'balanced' as const,defaultVersion:PROMPT_VERSION}:choice(input.value)
      bank=await this.generationPrompts.save(user,input.promptRevision,key,value)
    }
    const target=f==='summary'?(room.characterIds.length===1?room.characterIds[0]:''):input.characterId||''
    const visible=new Set([scopeKey('global',f),scopeKey('feature',f)])
    if(room.accountId)visible.add(scopeKey('account',f,room.accountId))
    if(target)visible.add(scopeKey('character',f,room.accountId,target))
    // Never return another fictional account's or character's saved prompt prose.
    const publicBank={...bank,entries:Object.fromEntries(Object.entries(bank.entries).filter(([key])=>visible.has(key)))}
    return {bank:publicBank,effective:resolvePrompt(bank,f,room.accountId,target),defaultVersion:PROMPT_VERSION}
    })
  }
  resolvePhone: (user: string, phone: MochiPhone) => Promise<string | undefined> = async()=>undefined
  private async phoneKey(user:string,input:unknown):Promise<string|undefined>{const phone=phoneContext(input);return phone?this.resolvePhone(user,phone):undefined}
  backgroundEnabled: (userId: string) => Promise<boolean> = async () => false
  reserveAutomatic: (userId: string, roomId: string, response?: boolean) => Promise<boolean> = async () => true
  registerResponses: (userId: string) => Promise<void> = async () => { throw new Error('Durable response scheduling is unavailable; your message is saved.') }
  releaseAutomatic: (userId: string, roomId: string) => void = () => {}
  schedulingWarning: (message:string) => void = () => {}
  private locks = new Map<string, Promise<unknown>>()
  // Wire-only ordering; no room schema or durable scheduling records change.
  private schedulingSession = crypto.randomUUID()
  private schedulingSequences = new Map<string, number>()
  private visibleRuntime(user: string, room: MochiRoom) {
    const background = publicRuntime(room.runtime)
    return background ? { ...background, snapshot: { session: this.schedulingSession, sequence: this.schedulingSequences.get(this.jobKey(user, room.id)) || 0 } } : undefined
  }
  private summaryAttempts=new Map<string,{accountId?:string;associationRevision:number;coverage?:import('./memory.js').SummaryCoverage;configuration:string;promptRevision?:number;inputDigest:string;sourceSignature:string;useCurrent:boolean;suggestion?:SummarySuggestion}>()
  private routineDrafts=new Map<string,{roomId:string;characterId:string;accountId?:string;revision:number;associationRevision:number;source:string;defaults:string;promptRevision?:number;draftId?:string;raw?:string;draft?:RoutineDraft}>()
  private jobs = new Map<string, { task?:'summary'|'routine'; requestId: string; controller: AbortController; accountId?: string; phoneKey?: string; response?: boolean }>()
  private pending = new Map<string, Set<{ requestId: string; controller: AbortController; accountId?: string; phoneKey?: string }>>()
  private jobKey(user: string, id: string): string { return JSON.stringify([user, id]) }
  private settings(input: any, ids: string[]): MochiSettings {
    const s = { ...defaultMochiSettings(), ...input }
    if (s.aiBehavior !== undefined && typeof s.aiBehavior !== 'boolean') throw new Error('Invalid AI behavior setting.')
    if (s.responseMode !== undefined && !['natural','instant','manual'].includes(s.responseMode)) throw new Error('Invalid response mode.')
    if (typeof s.autoReply !== 'boolean' || !Number.isSafeInteger(s.contextTokens) || s.contextTokens < 1024 || s.contextTokens > 131072 || !Number.isSafeInteger(s.outputTokens) || s.outputTokens < 128 || s.outputTokens > 8192 || s.outputTokens + 256 >= s.contextTokens) throw new Error('Invalid message token limits.')
    s.connectionId = s.connectionId ? entityId(s.connectionId) : ''
    if (s.model !== undefined) s.model = text(s.model, 500)
    s.instructions = text(s.instructions, 6000)
    const names: Record<string, string> = {}
    if (!s.characterNames || typeof s.characterNames !== 'object' || Array.isArray(s.characterNames)) throw new Error('Invalid room character names.')
    for (const id of ids) if (s.characterNames[id]) names[id] = text(s.characterNames[id], 120, true)
    const styles=validateTextingStyles(s.textingStyles)
    if(styles)s.textingStyles=styles;else delete s.textingStyles
    return { ...s, characterNames: names }
  }
  readonly fictionalAccounts: MochiAccounts
  readonly presets:MochiPresets
  constructor(private host: MochiHost, private makeId = () => `room_${crypto.randomUUID().replaceAll('-', '')}`, private now: () => number = Date.now) {
    this.generationPrompts=new GenerationPrompts(host)
    this.presets=new MochiPresets(host)
    this.fictionalAccounts = new MochiAccounts(host, (user, input) => this.persona(user, input), now)
  }
  private account(userId: unknown): string { return text(userId, 180, true) }
  async accountsState(userId: string, phone?: unknown) {
    const user = identifier(userId), bank = await this.fictionalAccounts.bank(user)
    const key=await this.phoneKey(user,phone),selection=key?bank.phones?.[key]:undefined
    const associations = new Map(bank.accounts.map(a => [a.id, [] as string[]]))
    let legacyRoomCount=0
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
        }else legacyRoomCount++
      } catch { warnings.push(`Room ${match[1]} has an unreadable association; its file was preserved.`) }
    }
    const choices = await this.state(user)
    const avatars = this.host.images && this.host.permissions.has('images') ? (await this.host.images.list({ userId: user, limit: 100, offset: 0, specificity: 'thumbnail' })).data.filter((a: any) => /^image\/(png|jpeg|webp|gif)$/.test(a.mime_type)).map((a: any) => ({ id: entityId(a.id), name: String(a.original_filename || 'Portrait').slice(0,120), url: `/api/v1/images/${entityId(a.id)}` })) : []
    return { ...bank, legacyRoomCount, phone: {supported:!!key,preference:key?selection?.preference||'last-used':bank.startupPreference||'last-used',lastAccountId:key?selection?.lastAccountId||'':bank.selectedAccountId}, accounts: bank.accounts.map(a => ({ ...a, roomIds: associations.get(a.id)!.sort() })), personas: choices.personas, avatars, canUploadAvatar: !!this.host.images && this.host.permissions.has('images'), warnings }
  }
  private abortFictional(userId: string, accountId: string, includeServer: boolean, phoneKey?: string): void {
    if (!accountId) return
    for (const [key, job] of this.jobs) if (JSON.parse(key)[0] === userId && job.accountId === accountId && (phoneKey===undefined||job.phoneKey===phoneKey) && (includeServer || !job.requestId.startsWith('server_'))) job.controller.abort()
    for (const [key, queued] of this.pending) if (JSON.parse(key)[0] === userId) for (const job of queued) if (job.accountId === accountId&&(phoneKey===undefined||job.phoneKey===phoneKey)) job.controller.abort()
  }
  private abortScoped(user: string, id: string, accountId: unknown, serverOnly = false, autonomousOnly = false): void {
    // Job ownership was validated at launch. Do not await disk reads before interrupting a staged commit.
    const job = this.jobs.get(this.jobKey(user, id))
    if (job && job.accountId === accountId && (!serverOnly || job.requestId.startsWith('server_')) && (!autonomousOnly || !job.response)) job.controller.abort()
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
      if(room.preset&&!isBuiltInPreset(room.preset.id))throw Error('Restore Mochi Default before assigning this chat to another account. Custom presets are account-scoped.')
      if(this.jobs.has(this.jobKey(user,id))||(this.pending.get(this.jobKey(user,id))?.size||0)>0||room.runtime?.jobs.some(j=>j.status==='generating'&&(j.leaseUntil||0)>this.now()))throw new Error('Wait for active generation to finish or stop it before assigning this chat. Saved schedules remain intact.')
      const sourceAccountId=room.accountId
      room.accountId=target;room.associationRevision=(room.associationRevision||0)+1
      if(room.preset)room.preset={...room.preset,accountId:target}
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
    if(room.preset)validateBinding(room.preset,room.accountId)
    if(room.memory)validateMemory(room.memory,room.id,user)
    validatePinnedContent(room)
    if (room.runtime !== undefined) validateRuntime(room.runtime)
    if(room.runtime?.routines)for(const id of Object.keys(room.runtime.routines))if(!room.characterIds.includes(id))throw Error('Routine character is unavailable.')
    if (room.runtime?.presence) for (const [id,p] of Object.entries(room.runtime.presence)) { entityId(id); validatePresence(p) }
    for(const job of room.runtime?.jobs || []) {
      const drafts=[...job.draft?[job.draft]:[],...job.additional||[]],ids=drafts.map(d=>d.characterId)
      if(ids.some(id=>!room.characterIds.includes(id))||new Set(ids).size!==ids.length) throw new Error('Invalid saved deferred membership; room data was preserved.')
    }
    room.settings = this.settings(room.settings, room.characterIds)
    room.characterDefaults={}
    for(const id of room.characterIds)room.characterDefaults[id]=await new MochiCharacterPreferences(this.host,this.fictionalAccounts).read(user,id,false)
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
    const {characterDefaults,...stored}=room
    await this.host.userStorage.setJson(`${path}.pending`, stored, { userId: user })
    signal?.throwIfAborted()
    await this.host.userStorage.move(`${path}.pending`, path, user)
    if (room.runtime) {
      const key = this.jobKey(user, room.id)
      this.schedulingSequences.set(key, (this.schedulingSequences.get(key) || 0) + 1)
      try { this.host.sendToFrontend({ type: 'mochi:scheduling_updated', roomId: room.id, accountId: room.accountId, associationRevision: room.associationRevision || 0, roomRevision: room.revision, background: this.visibleRuntime(user, room) }, user) }
      catch { this.schedulingWarning('Mochi scheduling status could not be published; committed records remain available on refresh.') }
    }
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
      const now = new Date().toISOString(),icon=groupIcon(input.groupIcon)
      const room: MochiRoom = { version: 1, id, ...(profile ? { accountId: profile.id } : {}), revision: 1, title: text(input.title, 120, true), ...(icon ? {groupIcon:icon} : {}), characterIds: await this.membership(user, input.characterIds), persona: profile ? { ...profile.persona, name: profile.displayName, avatarUrl: profile.avatarUrl } : await this.persona(user, input.persona), messages: [], createdAt: now, updatedAt: now, settings: { ...defaultMochiSettings(), responseMode: 'natural' }, receipts: [], notifications: [], notificationRevision: 0 }
      if(room.characterIds.length<2)delete room.groupIcon
      room.preset=validateBinding(input.preset??{id:DEFAULT_V2_PRESET_ID,revision:1,accountId:room.accountId},room.accountId)
      const preset=await this.presets.resolve(user,room)
      if(!preset.builtIn&&(await this.presets.read(user,room.accountId)).presets.find(p=>p.id===preset.id)?.archived)throw Error('Restore this archived preset before binding another chat.')
      await this.persist(user, room)
      return room
    })
  }
  async update(userId: string, input: any): Promise<MochiRoom> {
    const user = this.account(userId), id = roomId(input.roomId)
    return this.locked(user, id, async () => {
      const saved = await this.read(user, id, input.accountId)
      if(input.routines!==undefined&&saved.receipts!.includes(entityId(input.requestId)))return saved
      if (saved.accountId && input.persona !== undefined) throw new Error('Fictional account rooms retain their identity snapshot. Per-room identity updates are not implemented yet.')
      if (input.revision !== saved.revision) throw new Error('This room changed elsewhere. Refresh before saving again.')
      const ids = await this.membership(user, input.characterIds)
      const icon=groupIcon(input.groupIcon===undefined?saved.groupIcon:input.groupIcon)
      const nextIcon=ids.length>1?icon:undefined
      const settings = this.settings(input.settings ?? saved.settings, ids)
      for(const [id,style]of Object.entries(settings.textingStyles||{}))if(!ids.includes(id)&&!equivalent(style,saved.settings?.textingStyles?.[id]))throw Error('Texting preferences can only be changed for characters in this chat.')
      if (settings.aiBehavior && (!saved.runtime?.enabled || !await this.backgroundEnabled(user))) throw new Error('Enable account and room background messaging before AI timing suggestions.')
      if (settings.connectionId && !await this.host.connections?.get(settings.connectionId, user)) throw new Error('This connection is not available to your account.')
      const title = text(input.title, 120, true), persona = input.persona ? await this.persona(user, input.persona) : saved.persona
      const routines:Record<string,ReturnType<typeof validatePlan>>={}
      if(input.routines!==undefined){
        if(!input.routines||typeof input.routines!=='object'||Array.isArray(input.routines)||Object.keys(input.routines).length>12)throw Error('Invalid routine edits.')
        for(const [cid,patch]of Object.entries(input.routines) as Array<[string,any]>){
          routineId(cid)
          if(!ids.includes(cid)||!saved.characterIds.includes(cid)||!patch||Object.keys(patch).some(k=>!['plan','base'].includes(k)))throw Error('Routine edits require a current chat character.')
          if(!equivalent(patch.base,planFor(saved,cid)||null))throw Error('Routine defaults changed. Refresh and review before saving.')
          routines[cid]=validatePlan(patch.plan)
        }
      }
      const routineChanges=Object.entries(routines).filter(([cid,plan])=>!equivalent(plan,saved.runtime?.routines?.[cid]?.plan))
      if (!routineChanges.length && nextIcon===saved.groupIcon && title === saved.title && equivalent(ids, saved.characterIds) && equivalent(settings, saved.settings) && equivalent(persona, saved.persona)) return saved
      const room = { ...saved, groupIcon:nextIcon, title, characterIds: ids, settings, persona, revision: saved.revision + 1, updatedAt: new Date().toISOString() }
      if(routineChanges.length){
        room.runtime||={version:1,enabled:false,jobs:[]};room.runtime.routines||={}
        for(const [cid,plan]of routineChanges){
          const state=room.runtime.routines[cid]||{history:[],proposals:[]}
          recordRoutine(state,{plan,override:undefined},entityId(input.requestId),this.now(),'user');state.proposals=[];room.runtime.routines[cid]=state
        }
        room.receipts!.push(entityId(input.requestId))
      }
      if(room.runtime?.routines)for(const cid of Object.keys(room.runtime.routines))if(!ids.includes(cid))delete room.runtime.routines[cid]
      for(const j of room.runtime?.jobs || []) if(!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      for (const n of room.notifications!) n.roomTitle = room.title
      room.notificationRevision = (saved.notificationRevision || 0) + 1
      this.jobs.get(this.jobKey(user, id))?.controller.abort()
      await this.persist(user, room)
      return room
    })
  }
  private summaryAttemptKey(user:string,id:string,request:string):string{return JSON.stringify([user,id,request])}
  private async verifySummary(user:string,room:MochiRoom,attempt:NonNullable<ReturnType<typeof this.summaryAttempts.get>>,boundaryId:string):Promise<void>{
    if(attempt.promptRevision!==undefined&&(await this.generationPrompts.read(user)).revision!==attempt.promptRevision)throw new SummaryError('Generation prompts changed. Regenerate explicitly.','stale')
    if(room.accountId!==attempt.accountId||(room.associationRevision||0)!==attempt.associationRevision||summaryConfiguration(room)!==attempt.configuration)throw new SummaryError('The chat identity, settings or saved memory changed. Regenerate the suggestion; your editable text is retained.','stale')
    let input:Awaited<ReturnType<typeof summaryInput>>
    try{input=await summaryInput(room,boundaryId,attempt.useCurrent)}catch{throw new SummaryError('The source range changed or is unavailable. Regenerate or review your draft manually.','stale')}
    if(!attempt.coverage||input.coverage.digest!==attempt.coverage.digest||input.coverage.count!==attempt.coverage.count||input.inputDigest!==attempt.inputDigest)throw new SummaryError('Messages in the summarized prefix changed. Regenerate the suggestion; no memory was saved.','stale')
    const sources=await summarySources(this.host,room,user)
    if(await hashSummaryInput(sources)!==attempt.sourceSignature)throw new SummaryError('The authorized summary sources changed. Regenerate the suggestion.','stale')
  }
  async generateSummary(userId:string,input:any):Promise<SummarySuggestion>{
    const user=this.account(userId),id=roomId(input.roomId),requestId=entityId(input.requestId),key=this.jobKey(user,id),attemptKey=this.summaryAttemptKey(user,id,requestId),controller=new AbortController()
    if(input.useCurrent!==undefined&&typeof input.useCurrent!=='boolean')throw new SummaryError('Invalid summary reference option.','input')
    const queued={requestId,controller,accountId:input.accountId},waiting=this.pending.get(key)||new Set<{requestId:string;controller:AbortController;accountId?:string;phoneKey?:string}>();waiting.add(queued);this.pending.set(key,waiting)
    let launched=false,reserved=false
    const timeout=setTimeout(()=>controller.abort(),180000)
    try{
      const snapshot=await this.locked(user,id,async()=>{
        const room=await this.read(user,id,input.accountId),previous=this.summaryAttempts.get(attemptKey)
        controller.signal.throwIfAborted()
        if(previous){if(previous.suggestion){if(previous.coverage?.boundaryId!==input.boundaryId||previous.useCurrent!==(input.useCurrent===true))throw new SummaryError('This request ID belongs to a different summary range. Generate again explicitly.','duplicate');await this.verifySummary(user,room,previous,previous.suggestion.coverage.boundaryId);return {room,cached:previous.suggestion}}throw new SummaryError('This Generate attempt has already started or ended. Generate again explicitly for a new attempt.','duplicate')}
        if(this.jobs.has(key)||room.runtime?.jobs.some(j=>j.status==='generating'&&(j.leaseUntil||0)>this.now()))throw new SummaryError('A reply is already running in this chat. Wait or Stop it before generating a summary.','busy')
        if(room.revision!==input.revision||(room.associationRevision||0)!==input.associationRevision)throw new SummaryError('The chat changed. Refresh and review the selected range before generating.','stale')
        if(Array.from(this.summaryAttempts.keys()).filter(k=>JSON.parse(k)[0]===user).length>=256)throw new SummaryError('Your summary-attempt safety limit for this backend session was reached. Existing memories are preserved.','limit')
        this.summaryAttempts.set(attemptKey,{accountId:room.accountId,associationRevision:room.associationRevision||0,configuration:summaryConfiguration(room),inputDigest:'',sourceSignature:'',useCurrent:input.useCurrent===true})
        this.jobs.set(key,{task:'summary',requestId,controller,accountId:room.accountId});launched=true
        return {room,cached:undefined}
      })
      if(snapshot.cached)return structuredClone(snapshot.cached)
      this.host.sendToFrontend({type:'mochi:summary_started',roomId:id,accountId:snapshot.room.accountId,requestId},user)
      const plan=await this.generationPlan(user,snapshot.room,input,'summary'),attempt=this.summaryAttempts.get(attemptKey)!
      if(input.previewDigest&&input.previewDigest!==plan.digest)throw new SummaryError('Prompt preview changed. Preview again before generating.','stale')
      attempt.promptRevision=plan.promptRevision
      attempt.coverage=plan.coverage;attempt.inputDigest=plan.inputDigest;attempt.sourceSignature=plan.sourceSignature
      await this.locked(user,id,async()=>{controller.signal.throwIfAborted();const current=await this.read(user,id,input.accountId);await this.verifySummary(user,current,attempt,plan.coverage.boundaryId)})
      reserved=await this.reserveAutomatic(user,id,true)
      if(!reserved)throw new SummaryError('The shared generation quota or concurrency limit was reached. Try again later.','quota')
      controller.signal.throwIfAborted()
      const body=await requestSummary(this.host,snapshot.room,user,plan,controller.signal)
      return await this.locked(user,id,async()=>{
        controller.signal.throwIfAborted();const room=await this.read(user,id,input.accountId)
        if(this.jobs.get(key)?.controller!==controller)throw new SummaryError('The summary task is no longer current.','stale')
        await this.verifySummary(user,room,attempt,plan.coverage.boundaryId);controller.signal.throwIfAborted()
        const latest=await this.read(user,id,input.accountId)
        if(latest.revision!==room.revision||(latest.associationRevision||0)!==(room.associationRevision||0))throw new SummaryError('The source changed during validation. Refresh and regenerate.','stale')
        const suggestion:SummarySuggestion={id:'suggestion_'+crypto.randomUUID().replaceAll('-',''),coverage:{...plan.coverage},text:body,roomId:id,accountId:room.accountId,associationRevision:room.associationRevision||0,sourceRevision:snapshot.room.revision,createdAt:new Date(this.now()).toISOString(),budget:plan.budget}
        attempt.suggestion=suggestion;return structuredClone(suggestion)
      })
    }catch(error){if(controller.signal.aborted)throw new SummaryError('Summary generation stopped or timed out. No memory was saved.','cancelled');if(error instanceof SummaryError)throw error;throw new SummaryError('Unable to generate this summary safely. Check the selected range, permissions and connection. Your saved memory is unchanged.','unavailable')}
    finally{clearTimeout(timeout);waiting.delete(queued);if(!waiting.size&&this.pending.get(key)===waiting)this.pending.delete(key);if(launched){if(this.jobs.get(key)?.controller===controller)this.jobs.delete(key);if(reserved)this.releaseAutomatic(user,id);this.host.sendToFrontend({type:'mochi:job_finished',roomId:id,accountId:input.accountId,requestId},user)}}
  }
  async saveMemory(userId:string,input:any):Promise<void>{
    const user=this.account(userId),id=roomId(input.roomId),requestId=entityId(input.requestId)
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(room.receipts!.includes(requestId))return
      const management=room.memory?.management
      if(management?.requestId===requestId){
        if(input.confirmed!==true||input.action!==management.action||input.revision!==management.baseRevision||(room.associationRevision||0)!==input.associationRevision)throw Error('Memory recovery request changed. Review the current conversation before retrying.')
        return
      }
      if(room.revision!==input.revision||(room.associationRevision||0)!==input.associationRevision)throw Error('Conversation changed. Refresh and review your summary draft before saving.')
      if(input.confirmed!==true)throw Error('Confirm this memory change; active and pending replies may be canceled.')
      const current=room.memory?.versions.find(v=>v.id===room.memory!.currentId)
      if((input.action==='disable'||input.action==='clear')&&current){
        // Management remains possible even when version/receipt capacity is full.
        // Replay of the latest recovery uses this bounded slot; older requests
        // retain their stale revision and cannot overwrite newer state.
        const changed=input.action==='clear'?(!management?.cleared&&(!!current.text||current.enabled||!!current.coverage)):!management&&current.enabled
        if(!changed)return
        const changedAt=new Date(this.now()).toISOString()
        room.memory!.version=2
        room.memory!.management={version:1,action:input.action,cleared:input.action==='clear'||!!management?.cleared,requestId,baseRevision:room.revision,changedAt}
        validateMemory(room.memory,id,user)
        this.jobs.get(this.jobKey(user,id))?.controller.abort()
        for(const job of room.runtime?.jobs||[])if(!TERMINAL.has(job.status)){job.status='cancelled';delete job.draft;delete job.additional}
        if(room.receipts!.length<10000)room.receipts!.push(requestId)
        room.revision++;room.updatedAt=changedAt
        await this.persist(user,room)
        return
      }
      if(room.receipts!.length>=10000)throw Error('Room receipt limit reached. Disable/Clear remain available; no data was removed.')
      if((room.memory?.versions.length||0)>=MAX_SUMMARY_VERSIONS)throw Error('Summary version limit reached. Disable/Clear remain available; saving or restoring a version requires future history-management support. Existing versions were preserved.')
      let data:Omit<SummaryVersion,'id'|'savedAt'>
      if(input.action==='save'){
        const body=text(input.text,MAX_SUMMARY_TEXT,true)
        if(typeof input.enabled!=='boolean'||typeof input.excludeCovered!=='boolean')throw Error('Invalid summary options.')
        const coverage=await proveCoverage(room,input.boundaryId)
        if(input.suggestionId!==undefined){
          if(typeof input.suggestionId!=='string'||!/^suggestion_[a-f0-9]{32}$/.test(input.suggestionId))throw new SummaryError('Invalid summary suggestion.','input')
          const attempt=Array.from(this.summaryAttempts.entries()).find(([key,a])=>JSON.parse(key)[0]===user&&JSON.parse(key)[1]===id&&a.suggestion?.id===input.suggestionId)?.[1]
          if(!attempt?.suggestion)throw new SummaryError('This suggestion expired with the backend session. Regenerate it; your editable text is retained.','stale')
          if(coverage.boundaryId!==attempt.suggestion.coverage.boundaryId||coverage.count!==attempt.suggestion.coverage.count||coverage.digest!==attempt.suggestion.coverage.digest)throw new SummaryError('The generated coverage changed. Regenerate for this range or explicitly review it as a manual draft.','stale')
          await this.verifySummary(user,room,attempt,coverage.boundaryId)
        }
        data={text:body,enabled:input.enabled,excludeCovered:input.excludeCovered,coverage}
      }else if(input.action==='restore'){
        const original=room.memory?.versions.find(v=>v.id===input.versionId)
        if(!original)throw Error('This summary version is unavailable.')
        data={text:original.text,enabled:original.enabled,excludeCovered:original.excludeCovered,coverage:original.coverage,restoredFrom:original.id}
      }else throw Error('Unsupported conversation memory action.')
      // Async hashing cannot authorize a stale association or changed snapshot.
      const latest=await this.read(user,id,input.accountId)
      if(latest.revision!==room.revision||(latest.associationRevision||0)!==(room.associationRevision||0))throw Error('Conversation changed while validating coverage. Review and save again.')
      const saved:SummaryVersion={...data,id:'summary_'+crypto.randomUUID().replaceAll('-',''),savedAt:new Date(this.now()).toISOString()}
      room.memory={version:1,ownerId:user,roomId:id,currentId:saved.id,versions:[...room.memory?.versions||[],saved]}
      validateMemory(room.memory,id,user)
      this.jobs.get(this.jobKey(user,id))?.controller.abort()
      for(const job of room.runtime?.jobs||[])if(!TERMINAL.has(job.status)){job.status='cancelled';delete job.draft;delete job.additional}
      room.receipts!.push(requestId);room.revision++;room.updatedAt=saved.savedAt
      await this.persist(user,room)
    })
  }
  async bindPreset(userId:string,input:any):Promise<void>{
    const user=this.account(userId),id=roomId(input.roomId),requestId=entityId(input.requestId)
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(room.receipts!.includes(requestId))return
      if(room.revision!==input.revision)throw Error('Chat changed elsewhere. Refresh before applying a preset.')
      if(input.confirmed!==true)throw Error('Confirm applying this preset; pending replies may be canceled.')
      const binding=validateBinding({id:input.presetId,revision:input.presetRevision,accountId:room.accountId},room.accountId)
      const resolved=await this.presets.resolve(user,{accountId:room.accountId,preset:binding})
      if(!resolved.builtIn){const bank=await this.presets.read(user,room.accountId);if(bank.presets.find(p=>p.id===resolved.id)?.archived&&room.preset?.id!==resolved.id)throw Error('Restore this archived preset before binding another chat.')}
      if(binding.id===DEFAULT_PRESET_ID&&!room.preset||equivalent(binding,room.preset))return
      if(binding.id===DEFAULT_PRESET_ID)delete room.preset;else room.preset=binding
      this.jobs.get(this.jobKey(user,id))?.controller.abort()
      for(const job of room.runtime?.jobs||[])if(!TERMINAL.has(job.status)){job.status='cancelled';delete job.draft;delete job.additional}
      room.receipts!.push(requestId);room.revision++;room.updatedAt=new Date().toISOString();await this.persist(user,room)
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
        rooms.push(await this.locked(user, match[1], async () => {
          const room = await this.read(user, match[1], accountId)
          return { ...room, background: this.visibleRuntime(user, room) }
        }))
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
    const choices: MochiPersona[] = []
    for(const p of personas)choices.push({source:'lumiverse',sourceId:p.id,name:p.name,description:'',avatarUrl:p.image_id?`/api/v1/images/${p.image_id}`:'',addons:await discoverPersonaAddons(this.host,p,user)})
    if (bank?.version === 1 && Array.isArray(bank.entries)) for (const p of bank.entries.filter((p: any) => p.kind === 'persona')) choices.push({ source: 'pocket', sourceId: p.id, name: p.name, description: '', avatarUrl: '' })
    const connections = this.host.permissions.has('generation') && this.host.connections ? (await this.host.connections.list(user)).map(c => ({ id: c.id, name: c.name || c.model, model: c.model, isDefault: c.is_default === true })) : []
    const jobs: Record<string, string> = {}
    for (const room of rooms) { const job = this.jobs.get(this.jobKey(user, room.id)); if (job && !job.requestId.startsWith('server_')) jobs[room.id] = job.requestId }
    const characterPreferences=new Map<string,any>()
    for(const c of characters)characterPreferences.set(c.id,await new MochiCharacterPreferences(this.host,this.fictionalAccounts).read(user,c.id))
    return { accountId: accountId as string | undefined, backgroundEnabled: await this.backgroundEnabled(user), rooms: rooms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(({ runtime, ...room }) => room), characters: characters.map(c => ({ id: c.id, name: c.name, about:characterPreferences.get(c.id)?.about||'',preferences:characterPreferences.get(c.id), avatarUrl: c.image_id ? `/api/v1/images/${c.image_id}` : '' })), personas: choices, warnings, connections, jobs, notifications: rooms.flatMap(r => r.notifications || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
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
      } else { room.messages.splice(index, 1); room.notifications = room.notifications!.filter(n => n.messageId !== messageId); if(room.chatPins)room.chatPins=room.chatPins.filter(id=>id!==messageId) }
      this.jobs.get(this.jobKey(user, id))?.controller.abort()
      room.receipts!.push(requestId); room.revision++; room.updatedAt = new Date().toISOString()
      room.notificationRevision!++
      await this.persist(user, room)
    })
  }
  async pinnedContent(userId:string,input:any):Promise<void>{
    const user=this.account(userId),id=roomId(input.roomId),requestId=entityId(input.requestId)
    if(!['pin','note_save','note_delete'].includes(input.action))throw Error('Unsupported pinned-content action.')
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(room.receipts!.includes(requestId))return
      if(room.revision!==input.revision)throw Error('This room changed elsewhere. Refresh before saving pinned content.')
      if(this.jobs.has(this.jobKey(user,id))||room.runtime?.jobs.some(j=>j.status==='generating'&&(j.leaseUntil||0)>this.now()))throw Error('Wait for the active reply before changing pinned content.')
      if(input.action==='pin'){
        const messageId=entityId(input.messageId);this.messageIndex(room,messageId)
        if(!replyIdentifier(messageId)||typeof input.pinned!=='boolean')throw Error('Invalid chat pin.')
        const pins=room.chatPins||[]
        room.chatPins=input.pinned?pins.includes(messageId)?pins:[...pins,messageId]:pins.filter(id=>id!==messageId)
        if(room.chatPins.length>MAX_CHAT_PINS)throw Error('This chat has reached its pin limit.')
      }else{
        // A prepared output already captured the old instructions. Never silently discard it.
        if(room.runtime?.jobs.some(j=>!TERMINAL.has(j.status)&&Boolean(j.draft)))throw Error('Wait for or explicitly cancel the prepared scheduled reply before editing system notes.')
        const notes=room.systemNotes||[]
        if(input.action==='note_delete'){
          const target=noteId(input.noteId)
          if(!notes.some(n=>n.id===target)||input.confirmed!==true)throw Error('Confirm deletion of an available system note.')
          room.systemNotes=notes.filter(n=>n.id!==target)
        }else{
          const target=input.noteId===undefined?`note_${crypto.randomUUID().replaceAll('-','')}`:noteId(input.noteId)
          if(input.noteId!==undefined&&!notes.some(n=>n.id===target))throw Error('This system note is unavailable.')
          const note=validateNote({id:target,title:input.title,body:input.body,enabled:input.enabled})
          room.systemNotes=input.noteId===undefined?[...notes,note]:notes.map(n=>n.id===target?note:n)
        }
      }
      validatePinnedContent(room)
      const previousRevision=room.revision
      room.receipts!.push(requestId);room.revision++;room.updatedAt=new Date().toISOString()
      for(const job of room.runtime?.jobs||[])if(!TERMINAL.has(job.status)&&job.revision===previousRevision)job.revision=room.revision
      await this.persist(user,room)
    })
  }
  async react(userId:string,input:any):Promise<void>{
    const user=this.account(userId),id=roomId(input.roomId),requestId=entityId(input.requestId),messageId=entityId(input.messageId)
    if(!REACTION_EMOJI.includes(input.emoji)||input.actor!==undefined||input.actorId!==undefined||input.characterId!==undefined)throw Error('Invalid user reaction.')
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(room.receipts!.includes(requestId))return
      if(room.revision!==input.revision)throw Error('This room changed elsewhere. Refresh before reacting.')
      // Do not invalidate an interactive/scheduled generation snapshot mid-flight.
      if(this.jobs.has(this.jobKey(user,id))||room.runtime?.jobs.some(j=>j.status==='generating'&&(j.leaseUntil||0)>this.now()))throw Error('Wait for the active reply before reacting.')
      const message=room.messages[this.messageIndex(room,messageId)] as MochiMessage
      const reactions=readReactions(message.reactions,room),actorId=room.accountId||'legacy'
      const exists=reactions.some(r=>r.emoji===input.emoji&&r.actor==='user'&&r.actorId===actorId)
      message.reactions=exists?reactions.filter(r=>!(r.emoji===input.emoji&&r.actor==='user'&&r.actorId===actorId)):[...reactions,{emoji:input.emoji,actor:'user',actorId,name:room.persona.name}]
      if(message.reactions.length>128)throw Error('This message has too many reactions.')
      const previousRevision=room.revision
      room.receipts!.push(requestId);room.revision++;room.updatedAt=new Date().toISOString()
      // Metadata-only edits preserve already valid queued/generated opportunities.
      for(const job of room.runtime?.jobs||[])if(!TERMINAL.has(job.status)&&job.revision===previousRevision)job.revision=room.revision
      await this.persist(user,room)
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
  async generateRoutine(userId:string,input:any,parseOnly=false):Promise<any> {
    const user=identifier(userId),id=roomId(input.roomId),character=routineId(input.characterId),request=routineId(input.requestId),key=this.jobKey(user,id),attemptKey=JSON.stringify([user,request]),controller=new AbortController()
    let reserved=false,started=false
    const timeout=setTimeout(()=>controller.abort(),180000)
    try{
      const room=await this.locked(user,id,async()=>{
        const room=await this.read(user,id,input.accountId)
        if(!room.characterIds.includes(character))throw Error('Character is unavailable.')
        if(room.revision!==input.revision)throw Error('Refresh the conversation before generating.')
        if(this.routineDrafts.has(attemptKey))throw Error('Generate again with a new request ID.')
        if(this.jobs.has(key)||room.runtime?.jobs.some(j=>j.status==='generating'&&(j.leaseUntil||0)>this.now()))throw Error('Wait for the current reply or stop it first.')
        if([...this.routineDrafts.keys()].filter(k=>JSON.parse(k)[0]===user).length>=128)throw Error('The draft safety limit for this session was reached.')
        if(input.includeHistory!==undefined&&typeof input.includeHistory!=='boolean'||input.includeHistory===true&&input.historyConfirmed!==true)throw Error('Explicitly approve this chat history before including it.')
        this.routineDrafts.set(attemptKey,{roomId:id,characterId:character,accountId:room.accountId,revision:room.revision,associationRevision:room.associationRevision||0,source:'',defaults:JSON.stringify(room.characterDefaults)})
        this.jobs.set(key,{task:'routine',requestId:request,controller,accountId:room.accountId});started=true
        return room
      })
      const sources=await resolveGenerationSources(this.host,room,user,character,[character]),attempt=this.routineDrafts.get(attemptKey)!
      attempt.source=sourceSignature(sources)
      const base=planFor(room,character)
      let raw=input.raw,promptRevision:number|undefined
      if(!parseOnly){
        const promptPlan=await this.generationPlan(user,room,input,'schedule'),messages=promptPlan.messages
        if(sourceSignature(promptPlan.sources)!==attempt.source)throw Error('Schedule sources changed. Preview again.')
        if(input.previewDigest&&input.previewDigest!==promptPlan.digest)throw Error('Prompt preview changed. Preview again before generating.')
        promptRevision=promptPlan.promptRevision;attempt.promptRevision=promptRevision
        await this.locked(user,id,async()=>{
          const current=await this.read(user,id,input.accountId),fresh=await resolveGenerationSources(this.host,current,user,character,[character])
          if(current.revision!==attempt.revision||(current.associationRevision||0)!==attempt.associationRevision||JSON.stringify(current.characterDefaults)!==attempt.defaults||sourceSignature(fresh)!==attempt.source)throw Error('Schedule sources changed. Preview again.')
          controller.signal.throwIfAborted()
        })
        controller.signal.throwIfAborted();reserved=await this.reserveAutomatic(user,id,true)
        if(!reserved)throw Error('The shared generation quota is unavailable.')
        controller.signal.throwIfAborted()
        if((await this.generationPrompts.read(user)).revision!==promptRevision)throw Error('Generation prompts changed. Preview again.')
        const result=await callPocketProvider(this.host,{messages,connection_id:sources.connection.id,userId:user,signal:controller.signal,reasoning:{source:'off'},parameters:{max_tokens:room.settings!.outputTokens,temperature:0.8,...(room.settings!.model?{model:room.settings!.model}:{})}})
        controller.signal.throwIfAborted();if(result?.finish_reason==='length')throw new RoutineDraftError('Schedule output was truncated. Regenerate a shorter routine.')
        raw=result?.content
      }
      if(promptRevision!==undefined&&(await this.generationPrompts.read(user)).revision!==promptRevision)throw Error('Generation prompts changed. Regenerate explicitly.')
      const draft=parseRoutineDraft(raw,base)
      if(!parseOnly&&draft.plan.timezone!==timezone(input.timezone))throw new RoutineDraftError('Generated timezone differs from the reviewed request. Regenerate using the chosen timezone.')
      return await this.locked(user,id,async()=>{
        controller.signal.throwIfAborted()
        const current=await this.read(user,id,input.accountId),fresh=await resolveGenerationSources(this.host,current,user,character,[character])
        if(this.jobs.get(key)?.controller!==controller||current.revision!==attempt.revision||(current.associationRevision||0)!==attempt.associationRevision||JSON.stringify(current.characterDefaults)!==attempt.defaults||sourceSignature(fresh)!==attempt.source)throw Error('Schedule sources changed. Regenerate explicitly.')
        controller.signal.throwIfAborted()
        attempt.draft=draft;attempt.raw=raw;attempt.draftId='draft_'+crypto.randomUUID().replaceAll('-','')
        return {type:'mochi:routine_draft',requestId:request,roomId:id,characterId:character,accountId:room.accountId,revision:room.revision,draftId:attempt.draftId,raw,draft}
      })
    }finally{clearTimeout(timeout);if(reserved)this.releaseAutomatic(user,id);if(started&&this.jobs.get(key)?.controller===controller)this.jobs.delete(key)}
  }
  async applyRoutineDraft(userId:string,input:any):Promise<void>{
    const user=identifier(userId),id=roomId(input.roomId),character=routineId(input.characterId),request=routineId(input.requestId)
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(room.receipts!.includes(request))return
      if(input.confirmed!==true||room.revision!==input.revision)throw Error('Review and confirm the current draft before applying.')
      const attempt=[...this.routineDrafts.entries()].find(([key,a])=>JSON.parse(key)[0]===user&&a.draftId===input.draftId)?.[1]
      if(!attempt?.draft||attempt.roomId!==id||attempt.characterId!==character||attempt.accountId!==room.accountId||attempt.revision!==room.revision||attempt.associationRevision!==(room.associationRevision||0)||attempt.defaults!==JSON.stringify(room.characterDefaults))throw Error('This draft is unavailable or stale. Regenerate or preview again.')
      if(this.jobs.has(this.jobKey(user,id)))throw Error('Wait for the current reply before applying.')
      const fresh=await resolveGenerationSources(this.host,room,user,character,[character]);if(sourceSignature(fresh)!==attempt.source)throw Error('Character or connection changed. Regenerate the preview.')
      if(attempt.promptRevision!==undefined&&(await this.generationPrompts.read(user)).revision!==attempt.promptRevision)throw Error('Generation prompts changed. Regenerate explicitly.')
      const plan=validatePlan(input.plan);preserveLocks(planFor(room,character),plan)
      const texting=input.texting===undefined?undefined:validateTextingStyles({[character]:input.texting})?.[character]
      room.runtime||={version:1,enabled:false,jobs:[]};room.runtime.routines||={}
      const state=room.runtime.routines[character]||{history:[],proposals:[]}
      recordRoutine(state,{plan,override:undefined},request,this.now(),'user');state.proposals=[];room.runtime.routines[character]=state
      if(texting)state.history.at(-1)!.texting={before:structuredClone(room.settings!.textingStyles?.[character]),after:structuredClone(texting)}
      if(texting){room.settings!.textingStyles||={};room.settings!.textingStyles[character]=texting}
      room.receipts!.push(request);room.revision++
      for(const j of room.runtime.jobs)if(!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      await this.persist(user,room)
      attempt.draft=undefined
    })
  }
  async rejectRoutineDraft(userId:string,input:any):Promise<void>{
    const user=identifier(userId),id=roomId(input.roomId);await this.read(user,id,input.accountId)
    const attempt=this.routineDrafts.get(JSON.stringify([user,input.attemptId]))
    if(attempt&&attempt.roomId===id&&attempt.accountId===input.accountId&&attempt.characterId===input.characterId){await this.cancel(user,id,input.attemptId,input.accountId);attempt.draft=undefined;attempt.draftId=undefined}
  }
  async configureRoutine(userId:string,input:any):Promise<void> {
    const user=identifier(userId),id=roomId(input.roomId),character=routineId(input.characterId),request=routineId(input.requestId)
    await this.locked(user,id,async()=>{
      const room=await this.read(user,id,input.accountId)
      if(!room.characterIds.includes(character))throw Error('Character is not in this conversation.')
      if(room.receipts!.includes(request))return
      if(room.revision!==input.revision)throw Error('Routine changed elsewhere. Refresh before saving.')
      room.runtime||={version:1,enabled:false,jobs:[]};room.runtime.routines||={}
      const state:RoutineState=room.runtime.routines[character]||{history:[],proposals:[]}
      let next={plan:state.plan,override:state.override}
      if(input.action==='save')next={plan:validatePlan(input.plan),override:undefined}
      else if(input.action==='defaults')next={plan:undefined,override:undefined}
      else if(input.action==='override'){
        if(!planFor(room,character)?.enabled)throw Error('Enable routines before setting a live activity.')
        if(!Number.isInteger(input.minutes)||input.minutes<1||input.minutes>240)throw Error('Choose 1–240 whole minutes.')
        next.override=validateOverride({id:request,activity:input.activity,presence:input.presence,startedAt:this.now(),expiresAt:this.now()+input.minutes*60000,source:'user'})
      }else if(input.action==='clear')next.override=undefined
      else if(input.action==='approve'||input.action==='reject'){
        const proposal=state.proposals.find(p=>p.id===input.proposalId),current=planFor(room,character)
        if(!proposal)throw Error('This proposal is unavailable.')
        if(input.action==='approve'){if(!current||JSON.stringify(current)!==proposal.planRevision)throw Error('This proposal is stale. Review the current routine.');const plan=validatePlan({...current,entries:current.entries.map(e=>e.id===proposal.entryId?proposal.entry:e)});preserveLocks(current,plan);next.plan=plan}
      }
      else if(input.action==='undo'){
        const last=state.history.at(-1)
        if(!last||last.id!==input.changeId||last.source==='undo')throw Error('This change is no longer safe to undo.')
        if(last.texting){if(!equivalent(room.settings!.textingStyles?.[character],last.texting.after))throw Error('Texting style changed since this preview. Undo is no longer safe.');room.settings!.textingStyles||={};if(last.texting.before)room.settings!.textingStyles[character]=structuredClone(last.texting.before);else delete room.settings!.textingStyles[character]}
        next=structuredClone({plan:last.before.plan,override:last.before.override})
        if(next.override&&next.override.expiresAt<=this.now())next.override=undefined
      }else throw Error('Unsupported routine action.')
      this.abortScoped(user,id,input.accountId)
      recordRoutine(state,next,request,this.now(),input.action==='undo'?'undo':'user')
      if(input.action==='reject')state.proposals=state.proposals.filter(p=>p.id!==input.proposalId)
      else if(['save','defaults','undo','approve'].includes(input.action))state.proposals=[]
      room.runtime.routines[character]=state;room.receipts!.push(request);room.revision++
      for(const j of room.runtime.jobs)if(!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      await this.persist(user,room)
    })
  }
  async configurePresence(userId: string, input: any): Promise<void> {
    const user = identifier(userId), id = roomId(input.roomId), character = entityId(input.characterId), presence = input.useDefault===true?undefined:validatePresence(input.presence)
    this.abortScoped(user,id,input.accountId)
    await this.locked(user,id,async()=>{
      const room = await this.read(user,id,input.accountId)
      if (!room.characterIds.includes(character)) throw new Error('This character is not in the room.')
      if (room.revision !== input.revision) throw new Error('Refresh before changing presence.')
      room.runtime ||= { version:1,enabled:false,jobs:[] }
      room.runtime.presence ||= {}; if(presence)room.runtime.presence[character] = presence;else {if(room.runtime.presence[character]?.transitions.length)throw Error('Clear this conversation status schedule before using character defaults.');delete room.runtime.presence[character]}
      await this.persist(user,room)
    })
  }
  async configureIdle(userId:string,input:any):Promise<void> {
    const user=identifier(userId),id=roomId(input.roomId)
    if(typeof input.enabled!=='boolean') throw new Error('Invalid idle opt-in.')
    if(!input.enabled) this.abortScoped(user,id,input.accountId,true,true)
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
    if (!input.enabled) this.abortScoped(user,id,input.accountId,true,true)
    await this.locked(user, id, async () => {
      const room = await this.read(user, id, input.accountId)
      if (input.revision !== room.revision) throw new Error('This room changed elsewhere. Refresh before changing background settings.')
      room.runtime ||= { version: 1, enabled: false, jobs: [] }
      room.runtime.enabled = input.enabled
      if (!input.enabled) for (const j of room.runtime.jobs) if (j.kind !== 'response' && !TERMINAL.has(j.status)) { j.status = 'cancelled'; delete j.draft; delete j.additional }
      await this.persist(user, room)
    })
  }
  abortScheduled(userId?: string, id?: string, occurrenceId?: string, autonomousOnly = false): void {
    for (const [key, job] of this.jobs) {
      const [user, room] = JSON.parse(key)
      if (job.requestId.startsWith('server_') && (!autonomousOnly || !job.response) && (!userId || user === userId) && (!id || room === id) && (!occurrenceId || job.requestId === `server_${occurrenceId}`)) job.controller.abort()
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
      if (room.runtime?.jobs.find(j=>j.id===occurrenceId)?.kind !== 'response' && (!room.runtime?.enabled || !await allowed())) throw new Error('Background messaging is disabled.')
      await validateMochiSources(this.host, room, user)
      if (!this.host.permissions.has('characters')) throw new Error('Character permission is required.')
      for (const c of room.characterIds) if (!await this.host.characters.get(c, user)) throw new Error('A room character is not available.')
      controller.signal.throwIfAborted()
    }
    await this.locked(user, id, async () => {
      const room = await this.readStored(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
      if (!j || TERMINAL.has(j.status) || j.status === 'paused' || this.jobs.has(key) || j.nextAttemptAt > now() || (j.status === 'generating' && (j.leaseUntil || 0) > now())) return
      if (j.expiresAt < now() || j.revision !== room.revision) { j.status = j.expiresAt < now() ? 'missed' : 'cancelled'; delete j.draft; delete j.additional; await this.persist(user, room); return }
      if (j.kind !== 'response' && (!room.runtime!.enabled || !await allowed())) { j.status = 'cancelled'; delete j.draft; delete j.additional; await this.persist(user, room); return }
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
      this.jobs.set(key, { requestId, controller, accountId: room.accountId, response: j.kind==='response' })
      try { await this.persist(user, room); snapshot = room } catch (error) { this.jobs.delete(key); if(generate) this.releaseAutomatic(user,id); throw error }
    })
    if (!snapshot) return
    const timer = setTimeout(() => controller.abort(), 180000)
    try {
      await permitted(snapshot)
      if (generate) {
        const j = snapshot.runtime!.jobs.find(j => j.id === occurrenceId)!
        const behaviorEnabled=Boolean(snapshot.settings!.aiBehavior&&snapshot.runtime!.enabled&&await allowed())
        const promptRoom={...snapshot,settings:{...snapshot.settings!,aiBehavior:behaviorEnabled}}
        const reply = await generateMochiReply(this.host, promptRoom, user, j.responder, controller.signal, eligibleResponders(snapshot,j.responder,now()).filter(c => now() >= (j.createdAt ?? j.dueAt) + delayFor(snapshot!,c,now())),j.kind==='response'&&snapshot.settings!.responseMode==='natural'&&j.responder==='auto',now())
        await this.locked(user, id, async () => {
          const room = await this.readStored(user, id), job = room.runtime?.jobs.find(j => j.id === occurrenceId)
          await permitted(room)
          if (!job || job.claim !== claim || job.status !== 'generating' || room.revision !== j.revision) throw new Error('The room changed; scheduled output was discarded.')
          if(reply.silent){job.status='delivered';job.deliveredAt=now();await this.persist(user,room,controller.signal);return}
          job.draft = { characterId: reply.character.id, text: reply.text, name: room.settings!.characterNames[reply.character.id] || reply.character.name, avatarUrl: reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '' }
          job.status = 'generated'
          job.additional=reply.replies.slice(1).map(r=>({characterId:r.character.id,text:r.text,name:room.settings!.characterNames[r.character.id]||r.character.name,avatarUrl:r.character.image_id?`/api/v1/images/${entityId(r.character.image_id)}`:'',proposedStatus:r.behavior.status,routineActions:r.routineActions}))
          job.deliverAt = Math.max(...reply.replies.map(r=>Math.max(now()+r.behavior.delayMs,(job.createdAt??job.dueAt)+delayFor(room,r.character.id,now()))))
          job.nextAttemptAt = job.deliverAt; job.expiresAt = Math.max(job.expiresAt, job.deliverAt + 3600000); job.proposedStatus = reply.behavior.status;job.routineActions=reply.routineActions
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
          applyRoutineActions(room,d.characterId,d.routineActions,mid,now())
          applyDeliveredStatus(room,d.characterId,d.proposedStatus,now())
        }
        // Completion tombstone is atomic with the message, independent of later deletion.
        j.status = 'delivered'; j.messageId = messageId; j.deliveredAt = now(); delete j.draft
        applyRoutineActions(room,draft.characterId,j.routineActions,messageId,now());delete j.routineActions
        applyDeliveredStatus(room,draft.characterId,j.proposedStatus,now()); delete j.proposedStatus
        delete j.additional
        if(j.kind==='idle'){const idle=room.runtime!.idle!;idle.delivered++;idle.lastDeliveredAt=now();idle.nextDueAt=now()+5400000}
        await this.persist(user, room, controller.signal)
        for(const event of events) this.host.sendToFrontend({ type: 'mochi:notification', notification:event.notification, notificationRevision:event.revision, accountId: event.notification.accountId }, user)
        const { runtime, ...visible } = room
        this.host.sendToFrontend({ type: 'mochi:room_updated', room: { ...visible, background: this.visibleRuntime(user, room) } }, user)
      })
    } catch (error) {
      await this.locked(user, id, async () => {
        const room = await this.readStored(user, id), j = room.runtime?.jobs.find(j => j.id === occurrenceId)
        if (!j || j.claim !== claim || TERMINAL.has(j.status)) return
        if ((j.kind !== 'response' && (!room.runtime!.enabled || !await allowed())) || j.revision !== room.revision) { j.status = 'cancelled'; delete j.draft; delete j.additional }
        else if (controller.signal.aborted || (error instanceof MochiGenerationError ? error.temporary : temporaryFailure(error))) {
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
  async message(userId: string, input: any, regenerate = false, reportFailure = false): Promise<void> {
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
      const replyTo=regenerate?undefined:input.replyTo
      if(replyTo!==undefined&&(!content||!replyIdentifier(replyTo)||!referencedMessage(room.messages,replyTo)))throw new Error('The reply target is unavailable in this conversation. Clear it or choose another message.')
      const responder = target ? entityId(target.characterId) : input.responder === 'auto' || !input.responder ? 'auto' : entityId(input.responder)
      if (responder !== 'auto' && !room.characterIds.includes(responder)) throw new Error('The selected responder is not in this room.')
      if (content) room.messages.push({ id: crypto.randomUUID(), role: 'user', content, name: room.persona.name, avatarUrl: room.persona.avatarUrl, createdAt: new Date().toISOString(), requestId, ...(replyTo?{replyTo}:{}) } satisfies MochiMessage)
      if(content&&room.runtime?.idle) {
        const idle=room.runtime.idle;idle.periodId=requestId;idle.startedAt=this.now();idle.delivered=0;idle.opportunities=0;idle.nextDueAt=Math.max(this.now()+5400000,idle.lastDeliveredAt+5400000)
        for(const j of room.runtime.jobs) if((j.kind==='idle'||j.kind==='response')&&!TERMINAL.has(j.status)){j.status='cancelled';delete j.draft;delete j.additional}
      }
      room.receipts!.push(requestId)
      room.revision++; room.updatedAt = new Date().toISOString()
      await this.persist(user, room)
      this.host.sendToFrontend({ type:'mochi:accepted', requestId, roomId:id },user)
      const mode=room.settings!.responseMode,natural=Boolean(content&&mode==='natural'&&responder==='auto')
      // Replies to an accepted user message are not unsolicited background autonomy.
      let generate = (!content || (mode!=='manual'&&room.settings!.autoReply)) && !controller.signal.aborted
      if (generate && !regenerate && minimumDelay(room,responder,this.now()) > 0) {
        generate = false
        await this.registerResponses(user)
        room.runtime ||= { version:1, enabled:false, jobs:[] }
        for (const job of room.runtime.jobs) if (job.kind === 'response' && !TERMINAL.has(job.status)) { job.status = 'cancelled'; delete job.draft;delete job.additional }
        if (room.runtime.jobs.length >= MAX_JOBS || room.runtime.jobs.filter(j=>!TERMINAL.has(j.status)).length >= 4) throw new Error('The delayed-response queue is full; your user message is saved.')
        const now = this.now(), delay = minimumDelay(room,responder,now), dueAt = now + (Number.isFinite(delay) ? delay : 0)
        room.runtime.jobs.push({ id: `response_${requestId}`, kind: 'response', createdAt: now, dueAt, expiresAt: now + 86400000 + (Number.isFinite(delay)?delay:0), revision: room.revision, responder, status:'queued', attempts:0, nextAttemptAt:dueAt })
        await this.persist(user,room)
      }
      if (generate && regenerate && minimumDelay(room,responder,this.now()) > 0) throw new Error('The selected character is unavailable for an immediate reroll.')
      const allowBehavior=Boolean(room.settings!.aiBehavior&&room.runtime?.enabled&&await this.backgroundEnabled(user))
      if (generate) this.jobs.set(key, { requestId, controller, accountId: room.accountId,phoneKey })
      return { room, responder, generate, natural, targetId, allowBehavior, automatic:!!content, promptRoom: { ...room, settings:{...room.settings!,aiBehavior:allowBehavior}, messages:regenerate?room.messages.slice(0,targetIndex):room.messages } }
    })}).finally(() => { waiting.delete(queued); if (!waiting.size && this.pending.get(key) === waiting) this.pending.delete(key) })
    const publish = async (accepted: boolean) => this.host.sendToFrontend({ type: 'mochi:state', requestId, accepted, state: await this.state(user, input.accountId) }, user)
    if (!launched?.generate) { await publish(true); return }
    const timeout = setTimeout(() => controller.abort(), 180000)
    let automaticReserved=false
    try {
      await publish(true)
      if (launched.allowBehavior || (launched.room.settings!.responseMode && launched.automatic)) {
        const response=Boolean(launched.automatic&&launched.room.settings!.responseMode)
        if(!response&&!await this.backgroundEnabled(user)) throw new Error('Background behavior is disabled.')
        automaticReserved=await this.reserveAutomatic(user,id,response)
        if(!automaticReserved) throw new Error('The automatic generation limit was reached.')
      }
      const reply = await generateMochiReply(this.host, launched.promptRoom, user, launched.responder, controller.signal, eligibleResponders(launched.room,launched.responder,this.now()).filter(c=>delayFor(launched.room,c,this.now())===0),launched.natural,this.now())
      await this.locked(user, id, async () => {
        controller.signal.throwIfAborted()
        await selectedOnPhone()
        const current = await this.read(user, id, input.accountId)
        if (current.revision !== launched.room.revision || this.jobs.get(key)?.controller !== controller) throw new Error('The room changed during generation; the reply was discarded.')
        await validateMochiSources(this.host, current, user)
        if (!this.host.permissions.has('characters')) throw new Error('Character permission is required.')
        for (const characterId of current.characterIds) if (!await this.host.characters.get(characterId, user)) throw new Error('A room character is no longer available; the reply was discarded.')
        if(reply.silent) return
        if(reply.replies.some(r=>delayFor(current,r.character.id,this.now())>0)) throw new Error('Character presence changed; immediate replies were discarded.')
        if (delayFor(current,reply.character.id,this.now()) > 0) throw new Error('Character presence changed; the immediate reply was discarded.')
        const name = current.settings!.characterNames[reply.character.id] || reply.character.name
        if (launched.allowBehavior) {
          if (!current.runtime?.enabled || !await this.backgroundEnabled(user)) throw new Error('Background behavior was disabled; the reply was discarded.')
          if (reply.replies.some(r=>r.behavior.delayMs > 0)) {
            if (launched.targetId) throw new Error('Deferred rerolls are unsupported; the original message was preserved.')
            for (const j of current.runtime.jobs) if (j.kind === 'response' && !TERMINAL.has(j.status)) { j.status='cancelled';delete j.draft; delete j.additional }
            if (current.runtime.jobs.length >= MAX_JOBS || current.runtime.jobs.filter(j=>!TERMINAL.has(j.status)).length >= 4) throw new Error('Deferred queue is full; history was preserved.')
            const now = this.now(), deliverAt = now + Math.max(...reply.replies.map(r=>r.behavior.delayMs))
            current.runtime.jobs.push({id:`deferred_${requestId}`,kind:'response',createdAt:now,dueAt:deliverAt,deliverAt,expiresAt:deliverAt+3600000,revision:current.revision,responder:reply.character.id,status:'generated',attempts:1,nextAttemptAt:deliverAt,proposedStatus:reply.behavior.status,routineActions:reply.routineActions,draft:{characterId:reply.character.id,name,avatarUrl:reply.character.image_id ? `/api/v1/images/${entityId(reply.character.image_id)}` : '',text:reply.text},additional:reply.replies.slice(1).map(r=>({characterId:r.character.id,name:current.settings!.characterNames[r.character.id]||r.character.name,avatarUrl:r.character.image_id?`/api/v1/images/${entityId(r.character.image_id)}`:'',text:r.text,proposedStatus:r.behavior.status,routineActions:r.routineActions}))})
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
          applyRoutineActions(current,r.character.id,r.routineActions,message.id,this.now())
          if(launched.allowBehavior) applyDeliveredStatus(current,r.character.id,r.behavior.status,this.now())
          }
        }
        if(launched.targetId)applyRoutineActions(current,reply.character.id,reply.routineActions,crypto.randomUUID(),this.now())
        if (launched.allowBehavior) applyDeliveredStatus(current,reply.character.id,reply.behavior.status,this.now())
        current.revision++; current.updatedAt = new Date().toISOString()
        if(launched.targetId) current.notificationRevision!++
        controller.signal.throwIfAborted()
        await this.persist(user, current, controller.signal)
        for(const event of notifications) this.host.sendToFrontend({ type: 'mochi:notification', notification:event.notification, notificationRevision:event.revision, accountId: event.notification.accountId }, user)
      })
    } catch (error) {
      if (!reportFailure) throw error
      // Publish while the originating job and room snapshot still own this failure.
      // Cancellation/invalidation suppress diagnostics even if a provider ignores abort.
      await this.locked(user, id, async () => {
        if (controller.signal.aborted || this.jobs.get(key)?.controller !== controller) return
        let current: MochiRoom
        try { await selectedOnPhone(); current = await this.read(user, id, input.accountId) } catch { return }
        if (controller.signal.aborted || current.revision !== launched.room.revision ||
            (current.associationRevision || 0) !== (launched.room.associationRevision || 0)) return
        this.host.sendToFrontend({ type: 'mochi:error', requestId, roomId: id, accountId: current.accountId, roomRevision: current.revision,
          ...publicGenerationFailure(error) }, user)
      })
    } finally {
      clearTimeout(timeout)
      if(automaticReserved) this.releaseAutomatic(user,id)
      if (this.jobs.get(key)?.controller === controller) this.jobs.delete(key)
      this.host.sendToFrontend({ type: 'mochi:job_finished', roomId: id, requestId, accountId: input.accountId }, user)
      if (reportFailure) {
        // A failed refresh must not replace a classified failure or emit a stale one.
        try { await publish(false) } catch { /* job_finished already released frontend ownership. */ }
      } else await publish(false)
    }
  }
  async handle(payload: any, userId?: string): Promise<void> {
    if (!userId) return
    let selectedRoomId: string | undefined
    try {
      if(payload.type==='mochi:generation_prompt'){
        try{const result=await this.promptConfiguration(userId,payload);this.host.sendToFrontend({type:'mochi:generation_prompt',requestId:payload.requestId,result},userId)}catch(error){this.host.sendToFrontend({type:'mochi:generation_prompt',requestId:payload.requestId,error:error instanceof GenerationPromptError||error instanceof SummaryError?error.message:'Generation instructions could not be loaded, saved or previewed. Check source permissions, consent, token limits and the current account; reload and retry. Saved defaults are preserved.'},userId)}return
      }
      if(payload.type==='mochi:routine_generate'||payload.type==='mochi:routine_parse'){
        try{this.host.sendToFrontend(await this.generateRoutine(userId,payload,payload.type==='mochi:routine_parse'),userId)}catch(error){this.host.sendToFrontend({type:'mochi:routine_error',requestId:payload.requestId,roomId:payload.roomId,characterId:payload.characterId,accountId:payload.accountId,revision:payload.revision,message:error instanceof RoutineDraftError?'Schedule draft rejected: '+error.message+' No changes were saved. Edit the JSON and preview, or regenerate explicitly.':'Schedule draft was not created. Check JSON, timezone, locked entries, token budget and source availability; retry explicitly.'},userId)}return
      }
      if(payload.type==='mochi:routine_reject'){await this.rejectRoutineDraft(userId,payload);return}
      if(payload.type==='mochi:summary_generate'){
        const suggestion=await this.generateSummary(userId,payload)
        this.host.sendToFrontend({type:'mochi:summary_suggestion',requestId:payload.requestId,roomId:suggestion.roomId,accountId:suggestion.accountId,associationRevision:suggestion.associationRevision,suggestion},userId);return
      }
      if(payload.type==='mochi:memory'){
        const user=this.account(userId),id=roomId(payload.roomId);entityId(payload.requestId)
        if(payload.action!=='read')await this.saveMemory(user,payload)
        const room=await this.locked(user,id,()=>this.read(user,id,payload.accountId)),inspection=await inspectMemory(room)
        const latest=await this.locked(user,id,()=>this.read(user,id,payload.accountId))
        if(latest.revision!==room.revision||(latest.associationRevision||0)!==(room.associationRevision||0))throw Error('Conversation changed. Refresh memory.')
        this.host.sendToFrontend({type:'mochi:memory',requestId:payload.requestId,roomId:id,accountId:room.accountId,associationRevision:room.associationRevision||0,revision:room.revision,updatedAt:room.updatedAt,background:this.visibleRuntime(user,room),memory:room.memory,valid:inspection.valid,reason:inspection.reason},user)
        if(payload.action!=='read'){const {runtime,...visible}=room;this.host.sendToFrontend({type:'mochi:room_updated',room:{...visible,background:this.visibleRuntime(user,room)},accountId:room.accountId},user)}
        return
      }
      if(payload.type==='mochi:presets'){
        const user=this.account(userId),id=roomId(payload.roomId);entityId(payload.requestId)
        await this.locked(user,id,()=>this.read(user,id,payload.accountId))
        if(payload.accountId)await this.fictionalAccounts.get(user,payload.accountId)
        const bank=payload.action==='list'?await this.presets.read(user,payload.accountId):await this.presets.mutate(user,payload)
        const room=await this.locked(user,id,()=>this.read(user,id,payload.accountId)),effective=await this.presets.resolve(user,room)
        this.host.sendToFrontend({type:'mochi:presets',requestId:payload.requestId,accountId:room.accountId,roomId:id,roomRevision:room.revision,bank,effective},user);return
      }

      if(payload.type==='mochi:preview'){
        const user=this.account(userId),id=roomId(payload.roomId);entityId(payload.requestId)
        const room=await this.locked(user,id,()=>this.read(user,id,payload.accountId)),signal=new AbortController().signal
        const backgroundAllowed=await this.backgroundEnabled(user)
        const result=await previewContext(this.host,room,user,payload,backgroundAllowed,signal,this.now())
        const current=await this.locked(user,id,()=>this.read(user,id,payload.accountId))
        const sources=await resolveGenerationSources(this.host,current,user,payload.responder??'auto',eligibleResponders(current,payload.responder??'auto',this.now()))
        const allowedNow=await this.backgroundEnabled(user),finalRoom=await this.locked(user,id,()=>this.read(user,id,payload.accountId))
        if(JSON.stringify(finalRoom.characterDefaults)!==JSON.stringify(room.characterDefaults)||finalRoom.revision!==room.revision||(finalRoom.associationRevision||0)!==(room.associationRevision||0)||sourceSignature(sources)!==sourceSignature(result.sources)||JSON.stringify(finalRoom.runtime?.presence)!==JSON.stringify(room.runtime?.presence)||backgroundAllowed!==allowedNow||Boolean(finalRoom.runtime?.enabled)!==Boolean(room.runtime?.enabled))throw Error('Preview context changed. Refresh the preview.')
        this.host.sendToFrontend({type:'mochi:preview',requestId:payload.requestId,roomId:id,accountId:room.accountId,revision:room.revision,associationRevision:room.associationRevision||0,preview:result.preview},user)
        return
      }
      if(payload.type==='mochi:search'||payload.type==='mochi:search_target'){
        const user=this.account(userId),id=roomId(payload.roomId);entityId(payload.requestId)
        const room=await this.locked(user,id,()=>this.read(user,id,payload.accountId))
        if(payload.type==='mochi:search_target'){
          const target=entityId(payload.messageId)
          if(room.revision!==payload.revision||(room.associationRevision||0)!==payload.associationRevision)throw Error('This conversation changed. Repeat the search before jumping.')
          const message=room.messages[this.messageIndex(room,target)] as MochiMessage
          if(typeof message.name!=='string'||typeof message.createdAt!=='string')throw Error('This original message is unavailable.')
          const {runtime,...visible}=room
          this.host.sendToFrontend({type:'mochi:search_target',requestId:payload.requestId,roomId:id,accountId:room.accountId,messageId:target,room:{...visible,background:this.visibleRuntime(user,room)}},user)
        }else{
          if((payload.offset||0)>0&&payload.revision!==room.revision)throw Error('This conversation changed. Repeat the search.')
          const page=await searchRoom(room,payload)
          const current=await this.locked(user,id,()=>this.read(user,id,payload.accountId))
          if(current.revision!==room.revision||(current.associationRevision||0)!==(room.associationRevision||0))throw Error('This conversation changed. Repeat the search.')
          this.host.sendToFrontend({type:'mochi:search',requestId:payload.requestId,roomId:id,accountId:room.accountId,associationRevision:room.associationRevision||0,revision:room.revision,page},user)
        }
        return
      }
      if (payload.type.startsWith('mochi:account_') || payload.type === 'mochi:accounts') {
        let createdAccountId: string | undefined, uploadedAvatarId: string | undefined
        if(payload.type==='mochi:account_sync_preview'){this.host.sendToFrontend({type:'mochi:account_sync_preview',requestId:payload.requestId,review:await this.fictionalAccounts.syncReview(userId,payload)},userId);return}
        if(payload.type==='mochi:account_sync') await this.fictionalAccounts.sync(userId,payload)
        else if (payload.type === 'mochi:account_create') createdAccountId = (await this.fictionalAccounts.create(userId, payload)).id
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
      if(payload.type==='mochi:character_preferences'){
        if(payload.accountId!==undefined)await this.fictionalAccounts.get(userId,payload.accountId)
        await new MochiCharacterPreferences(this.host,this.fictionalAccounts).save(userId,payload,()=>{if([...this.jobs.keys(),...this.pending.keys()].some(k=>JSON.parse(k)[0]===userId))throw Error('Wait for active replies before editing character defaults.')})
      }
      if(payload.type==='mochi:ui_preferences'){
        const preferences=new MochiUIPreferences(this.host,this.fictionalAccounts)
        if(!['get','save','shared_get','shared_save'].includes(payload.action))throw Error('Unsupported presentation action.')
        const record=payload.action==='shared_save'?await preferences.saveShared(userId,payload):payload.action==='shared_get'?await preferences.shared(userId):payload.action==='save'?await preferences.save(userId,payload):await preferences.read(userId,payload.accountId)
        const layouts=payload.action.startsWith('shared_')&&!record.revision?await preferences.layouts(userId):[]
        this.host.sendToFrontend({type:'mochi:ui_preferences',requestId:payload.requestId,record,layouts},userId);return
      }
      if (payload.type === 'mochi:choices') {
        const state=await this.state(userId,payload.accountId)
        this.host.sendToFrontend({type:'mochi:choices',requestId:payload.requestId,personas:state.personas,characters:state.characters,connections:state.connections},userId)
        return
      }
      if (payload.type === 'mochi:send') { await this.message(userId, payload, false, true); return }
      if (payload.type === 'mochi:regenerate') { await this.message(userId, payload, true, true); return }
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
      else if (payload.type==='mochi:reaction')await this.react(userId,payload)
      else if (payload.type==='mochi:pinned_content')await this.pinnedContent(userId,payload)
      else if(payload.type==='mochi:routine_apply')await this.applyRoutineDraft(userId,payload)
      else if (payload.type==='mochi:routine')await this.configureRoutine(userId,payload)
      else if (payload.type==='mochi:preset_bind')await this.bindPreset(userId,payload)
      else if (payload.type !== 'mochi:character_preferences' && payload.type !== 'mochi:list' && payload.type !== 'mochi:message_action' && payload.type !== 'mochi:notification_clear' && payload.type !== 'mochi:room_assign') throw new Error('Unsupported Mochi action.')
      this.host.sendToFrontend({ type: 'mochi:state', requestId: payload.requestId, selectedRoomId, state: await this.state(userId, payload.accountId) }, userId)
    } catch (error) {
      if(payload.type==='mochi:character_preferences'){this.host.sendToFrontend({type:'mochi:error',requestId:payload.requestId,message:'Character preferences could not be saved. Wait for replies to finish, refresh and review before retrying.'},userId);return}
      if(payload.type==='mochi:ui_preferences'){this.host.sendToFrontend({type:'mochi:error',requestId:payload.requestId,message:'Messenger presentation could not be loaded or saved. Refresh and review before retrying.'},userId);return}
      if (payload.type === 'mochi:send' || payload.type === 'mochi:regenerate') {
        let scope: { roomId?: string; accountId?: string; roomRevision?: number } = {}
        try {
          scope = { roomId: roomId(payload.roomId), accountId: payload.accountId === undefined ? undefined : fictionalAccountId(payload.accountId),
            roomRevision: Number.isSafeInteger(payload.revision) ? payload.revision : undefined }
        } catch { /* Invalid scope must not be echoed as diagnostic metadata. */ }
        this.host.sendToFrontend({ type: 'mochi:error', requestId: payload.requestId, ...scope,
          ...publicGenerationFailure(error) }, userId)
        return
      }
      const message = error instanceof Error ? error.name === 'AbortError' ? 'Reply stopped. Your messages are saved.' : error.message : 'Unable to save Mochi room.'
      const safeMessage = message.replace(/\b(?:sk-|key-|Bearer\s+)[A-Za-z0-9._-]{8,}\b/gi, '[redacted]').replace(/\s+/g, ' ').trim().slice(0, 500)
      this.host.sendToFrontend({ type: 'mochi:error', requestId: payload.requestId, message: safeMessage || 'Unable to save Mochi room.' }, userId)
    }
  }
}
