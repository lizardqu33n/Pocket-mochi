import { button, el, requestId } from '../frontend/shared.js'
import { POCKET_ICONS } from '../frontend/components/icons.js'
import { MOCHI_STYLES } from './styles.js'
import { showPocketSheet } from '../frontend/components/ui.js'
import { notificationBody, type MochiNotificationPolicy } from './notifications.js'
import { defaultPresence, STATUSES, statusFor } from './presence.js'

function action(label: string, icon: string, compact = false): HTMLButtonElement {
  const node = button('', `lp-button${compact ? ' mochi-icon-button' : ''}`)
  node.setAttribute('aria-label', label); node.title = label
  const glyph = el('span'); glyph.setAttribute('aria-hidden', 'true')
  const extra: Record<string, string> = { stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', edit: '<path d="m15 4 5 5-11 11H4v-5L15 4Z M12 7l5 5"/>', more: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>' }
  extra.close = '<path d="m6 6 12 12M18 6 6 18"/>'
  glyph.innerHTML = POCKET_ICONS[icon] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${extra[icon] || '<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2"/>'}</svg>`
  node.append(glyph); if (!compact) node.append(el('span', '', label))
  return node
}
function portrait(name: string, url = ''): HTMLSpanElement {
  const node = el('span', 'mochi-avatar', name.slice(0, 1).toUpperCase() || '?'); node.setAttribute('aria-hidden', 'true')
  if (url) { const img = el('img'); img.src = url; img.alt = ''; node.replaceChildren(img) }
  return node
}
import { defaultMochiSettings, type MochiMessage, type MochiNotification, type MochiRoom, type MochiSettings, type MochiState } from './types.js'

export class MochiView {
  state: MochiState | null = null
  roomId = ''
  creating = false
  editing = false
  busy = false
  error = ''
  private feedback = ''
  private notificationsOpen = false
  private seenNotifications = new Set<string>()
  private notificationRevisions = new Map<string, number>()
  private acknowledged = new Set<string>()
  private acknowledgementRequests = new Map<string, string[]>()
  private sheets = new Set<() => void>()
  private operation = ''
  private request = ''
  private drafts = new Map<string, string>()
  private responders = new Map<string, string>()
  private ownGenerations = new Map<string, string>()
  private pendingSends = new Map<string, { roomId: string; content: string }>()
  private selectionVersion = 0
  private requestVersion = 0
  private settingsDraft: MochiSettings | null = null
  private draftRevision = 0
  private timeout: ReturnType<typeof setTimeout> | undefined
  private draft: { title: string; characterIds: string[]; persona: string; name: string; description: string } | null = null
  constructor(private send: (payload: unknown) => void, private redraw: () => void, private navigate: (roomId?: string) => void,
    private notificationPolicy: () => MochiNotificationPolicy = () => ({ enabled: true, previews: true, visible: true }),
    private notify: (n: MochiNotification) => void = () => {},
    private notificationsChanged: (notices: MochiNotification[], rooms: Set<string>) => void = () => {}) {}
  load(): void { this.dispatch('mochi:list') }
  select(id: string): void {
    if (this.roomId !== id) { this.leave(); this.selectionVersion++; this.roomId = id; this.creating = false; this.editing = false; this.draft = null; this.settingsDraft = null }
  }
  leave(): void {
    for (const dismiss of this.sheets) dismiss(); this.sheets.clear()
    const generationRequestId = this.ownGenerations.get(this.roomId)
    if (generationRequestId) this.send({ type: 'mochi:cancel', roomId: this.roomId, generationRequestId })
  }
  destroy(): void { this.leave(); clearTimeout(this.timeout) }
  private dispatch(type: string, values: Record<string, unknown> = {}): void {
    if (this.busy) return
    this.request = requestId('mochi')
    this.requestVersion = this.selectionVersion
    if (type === 'mochi:send' || type === 'mochi:regenerate') this.ownGenerations.set(this.roomId, this.request)
    if (type === 'mochi:send') this.pendingSends.set(this.request, { roomId: this.roomId, content: String(values.content ?? '') })
    this.operation = type
    this.busy = true; this.error = ''; this.feedback = ''
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.busy = false
      this.error = 'No response received. Refresh the inbox to check whether your room was saved before trying again.'
      this.redraw()
    }, 30000)
    this.send({ type, requestId: this.request, ...values })
    this.redraw()
  }
  receive(payload: any): boolean {
    if ((payload?.type === 'mochi:accepted' || (payload?.type === 'mochi:state' && payload.accepted)) && this.pendingSends.has(payload.requestId)) {
      const sent = this.pendingSends.get(payload.requestId)!
      if ((this.drafts.get(sent.roomId) || '') === sent.content) this.drafts.set(sent.roomId, '')
      this.pendingSends.delete(payload.requestId)
    }
    if (payload?.type === 'mochi:accepted') return true
    if (payload?.type === 'mochi:error') this.pendingSends.delete(payload.requestId)
    if (payload?.type === 'mochi:error' && this.acknowledgementRequests.has(payload.requestId)) {
      for (const id of this.acknowledgementRequests.get(payload.requestId)!) this.acknowledged.delete(id)
      this.acknowledgementRequests.delete(payload.requestId)
      this.error = 'Unable to mark notifications as read. Refresh to try again.'; this.redraw(); return true
    }
    if (payload?.type === 'mochi:job_finished') {
      const jobs = this.state?.jobs
      if (jobs && jobs[payload.roomId] === payload.requestId) delete jobs[payload.roomId]
      if (this.ownGenerations.get(payload.roomId) === payload.requestId) this.ownGenerations.delete(payload.roomId)
      this.redraw(); return true
    }
    if (payload?.type === 'mochi:notifications') {
      this.acknowledgementRequests.delete(payload.requestId)
      if (this.state) this.state.notifications = this.mergeNotifications(payload.notifications || [], payload.notificationRevisions || {})
      this.redraw(); return true
    }
    if (payload?.type === 'mochi:notification' && payload.notification) {
      const n = payload.notification as MochiNotification
      if (typeof payload.notificationRevision === 'number' && payload.notificationRevision <= (this.notificationRevisions.get(n.roomId) ?? -1)) return true
      if (this.seenNotifications.has(n.id) || this.state?.notifications?.some(saved => saved.id === n.id)) return true
      if (typeof payload.notificationRevision === 'number') this.notificationRevisions.set(n.roomId, payload.notificationRevision)
      this.seenNotifications.add(n.id)
      if (this.state) this.state.notifications = [n, ...(this.state.notifications || []).filter(item => item.id !== n.id)]
      const policy = this.notificationPolicy()
      if (policy.visible && this.roomId === n.roomId && !this.editing && !this.creating && !this.notificationsOpen) this.markNotifications(n.roomId)
      else if (policy.enabled) this.notify(n)
      this.redraw(); return true
    }
    if (payload?.type !== 'mochi:state' && payload?.type !== 'mochi:error') return false
    if (payload.requestId !== this.request) return true
    clearTimeout(this.timeout)
    this.busy = false
    if (payload.type === 'mochi:error') { if (this.requestVersion === this.selectionVersion) this.error = String(payload.message) }
    else {
      const notifications = this.mergeNotifications(payload.state.notifications || [], Object.fromEntries(payload.state.rooms.map((r: MochiRoom) => [r.id, r.notificationRevision || 0])))
      this.state = { ...payload.state, notifications }
      for (const [id, request] of this.ownGenerations) if (this.state && this.state.jobs?.[id] !== request) this.ownGenerations.delete(id)
      if (payload.selectedRoomId && this.requestVersion === this.selectionVersion) {
        this.creating = false; this.editing = false; this.draft = null
        this.roomId = payload.selectedRoomId
        this.navigate(this.roomId)
      }
    }
    this.redraw()
    if (this.notificationPolicy().visible && this.roomId && !this.editing && !this.creating && !this.notificationsOpen) this.markNotifications(this.roomId)
    return true
  }
  private mergeNotifications(incoming: MochiNotification[], revisions: Record<string, number>): MochiNotification[] {
    const merged = new Map((this.state?.notifications || []).map(n => [n.id, n]))
    const rooms = new Set([...Object.keys(revisions), ...incoming.map(n => n.roomId)])
    const accepted = new Set<string>()
    for (const room of rooms) {
      const revision = revisions[room] ?? 0
      if (revision < (this.notificationRevisions.get(room) ?? -1)) continue
      this.notificationRevisions.set(room, revision)
      accepted.add(room)
      for (const [id, n] of merged) if (n.roomId === room) merged.delete(id)
      for (const n of incoming.filter(n => n.roomId === room)) { merged.set(n.id, n); this.seenNotifications.add(n.id) }
    }
    const notices = [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    this.notificationsChanged(notices, accepted)
    return notices
  }
  render(): HTMLDivElement {
    const page = el('div', 'mochi-view')
    const style = el('style')
    style.textContent = MOCHI_STYLES
    page.append(style)
    const header = el('header'); const brand = el('div', 'mochi-brand')
    const wordmark = el('h2'); wordmark.setAttribute('aria-label', 'Mochi')
    const letters = el('span', '', 'Moch'), lastLetter = el('span', 'mochi-wordmark-i', 'ı')
    letters.setAttribute('aria-hidden', 'true'); lastLetter.setAttribute('aria-hidden', 'true'); wordmark.append(letters, lastLetter); brand.append(wordmark)
    // Original static illustration, drawn here without any external source asset.
    const mascot = el('span', 'mochi-mascot'); mascot.setAttribute('aria-hidden', 'true'); mascot.innerHTML = '<svg viewBox="0 0 64 48" fill="none"><path d="M5 33C5 23 17 7 32 7s27 16 27 26c0 8-12 11-27 11S5 41 5 33Z" fill="#f8e4ef" stroke="#d9abc4" stroke-width="2"/><ellipse cx="17" cy="32" rx="5" ry="3" fill="#eea6c1"/><ellipse cx="47" cy="32" rx="5" ry="3" fill="#eea6c1"/><circle cx="24" cy="27" r="2.5" fill="#443242"/><circle cx="40" cy="27" r="2.5" fill="#443242"/><path d="M28 30q2 4 4 0q2 4 4 0" stroke="#443242" stroke-width="2" stroke-linecap="round"/></svg>'; brand.append(mascot); header.append(brand)
    const headerActions = el('div', 'mochi-actions')
    if (this.notificationPolicy().enabled) {
      const bell = action('Mochi notifications', 'notifications', true); const unread = this.state?.notifications?.filter(n => !n.read).length || 0; bell.dataset.unread = String(unread > 0); bell.title = `Mochi notifications · ${unread} unread`; if (unread) bell.append(el('span', 'mochi-unread-count', String(unread)))
      bell.onclick = () => { this.leave(); this.notificationsOpen = !this.notificationsOpen; this.redraw(); if (!this.state) this.load() }; headerActions.append(bell)
      bell.setAttribute('aria-description', `${unread} unread notifications`)
    }
    header.append(headerActions, mascot); page.append(header)
    if (this.error) { const error = el('p', 'mochi-error', this.error); error.setAttribute('role', 'alert'); page.append(error) }
    if (!this.state) return page
    if (this.feedback) { const status = el('p', 'mochi-muted', this.feedback); status.setAttribute('role', 'status'); page.append(status) }
    for (const warning of this.state.warnings) page.append(el('p', 'mochi-error', warning))
    if (this.notificationsOpen && this.notificationPolicy().enabled) { page.append(this.notificationList()); return page }
    const room = this.state.rooms.find(room => room.id === this.roomId)
    if (this.creating || this.editing) { page.append(this.form(this.editing ? room : undefined)); return page }
    if (room) {
      const roomHeader = el('div', 'mochi-room-header')
      const info = el('div', 'mochi-room-info'), selector = el('select', 'mochi-room-selector'); selector.setAttribute('aria-label', 'Select room')
      for (const r of this.state.rooms) { const option = el('option', '', r.title); option.value = r.id; selector.append(option) }; selector.value = room.id
      selector.onchange = () => this.openRoom(selector.value)
      selector.title = room.title
      const roomSelector = el('div', 'mochi-room-select')
      const groupIcon = el('span', 'mochi-room-select-icon'); groupIcon.setAttribute('aria-hidden', 'true'); groupIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/></svg>'
      roomSelector.append(groupIcon, selector)
      const statuses = room.characterIds.map(id=>statusFor(room,id)), online = statuses.filter(s=>s==='online').length
      const roomMeta = el('p', 'mochi-room-meta', `${room.characterIds.length} ${room.characterIds.length === 1 ? 'participant' : 'participants'} · ${online ? 'active now' : statuses.every(s=>s==='offline') ? 'offline' : 'replies delayed'}`)
      roomMeta.dataset.status = online ? 'online' : statuses.includes('away') ? 'away' : statuses.includes('dnd') ? 'dnd' : 'offline'
      roomMeta.title = room.characterIds.map((id,i)=>`${room.settings?.characterNames[id] || this.state?.characters.find(c=>c.id===id)?.name || id}: ${statuses[i]}`).join('\n')
      info.append(roomSelector, roomMeta)
      const controls = el('div', 'mochi-actions')
      const inbox = action('Room inbox', 'back', true); inbox.onclick = () => { this.select(''); this.navigate() }
      const edit = action('Room settings', 'settings', true); edit.onclick = () => { this.leave(); this.editing = true; this.draft = null; this.settingsDraft = null; this.redraw() }
      const participants = action('Room participants', 'people', true); participants.onclick = () => { const content = el('div', 'mochi-participants'); for (const id of room.characterIds) { const c = this.state?.characters.find(c => c.id === id); const name = room.settings?.characterNames[id] || c?.name || 'Unavailable character'; const row = el('div', 'mochi-member'); row.append(portrait(name, c?.avatarUrl), el('span', '', name)); content.append(row) }; this.sheet(participants, 'Room participants', content) }
      participants.title = 'Room participants'; controls.append(participants, edit); roomHeader.append(info, controls); page.append(roomHeader)
      headerActions.prepend(inbox)
      page.append(this.thread(room), this.composer(room))
      return page
    }
    if (this.roomId) page.append(el('p', 'mochi-error', 'This room is unavailable. Refresh or select another room.'))
    page.append(el('p', 'mochi-muted', 'Your independent character rooms.'))
    const create = action('New room', 'plus'); create.classList.add('mochi-primary'); create.disabled = this.busy
    create.onclick = () => { this.creating = true; this.draft = null; this.redraw() }; page.append(create)
    if (!this.state.rooms.length) page.append(el('p', 'mochi-card', 'No rooms yet. Choose your characters and the identity you want to use.'))
    for (const room of this.state.rooms) {
      const row = button('', 'mochi-card')
      const avatars = el('div', 'mochi-room-avatars'); avatars.dataset.single = String(room.characterIds.length === 1)
      for (const id of room.characterIds.slice(0, 4)) { const c = this.state.characters.find(c => c.id === id); avatars.append(portrait(room.settings?.characterNames[id] || c?.name || '?', c?.avatarUrl)) }
      const copy = el('div', 'mochi-card-copy'); copy.append(el('strong', '', room.title), el('span', 'mochi-muted', `${room.characterIds.length === 1 ? 'Direct room' : `${room.characterIds.length} characters`} · ${room.persona.name}`))
      const last = room.messages.at(-1) as MochiMessage | undefined
      copy.append(el('span', 'mochi-preview', last?.content ? `${last.name}: ${last.content}` : 'Start a conversation'))
      row.append(avatars, copy)
      row.onclick = () => this.openRoom(room.id); page.append(row)
    }
    return page
  }
  private form(room?: MochiRoom): HTMLFormElement {
    const state = this.state!
    if (!this.draft) this.draftRevision = room?.revision || 0
    this.draft ||= { title: room?.title || '', characterIds: [...room?.characterIds || []], persona: room ? 'keep' : 'manual', name: room?.persona.name || 'You', description: room?.persona.description || '' }
    const draft = this.draft
    this.settingsDraft ||= structuredClone(room?.settings || defaultMochiSettings())
    const settings = this.settingsDraft
    const form = el('form', 'mochi-form'); form.append(el('h3', '', room ? 'Room settings' : 'New room'))
    const field = (label: string, input: HTMLElement) => { input.setAttribute('aria-label', label); const node = el('label', input.tagName === 'INPUT' && (input as HTMLInputElement).type === 'checkbox' ? 'mochi-toggle' : '', label); node.append(input); form.append(node) }
    const title = el('input'); title.required = true; title.maxLength = 120; title.value = draft.title
    title.oninput = () => { draft.title = title.value }; field('Room name', title)
    const picker = el('div', 'mochi-picker'); picker.setAttribute('role', 'group'); picker.setAttribute('aria-label', 'Room characters')
    for (const character of state.characters) {
      const choice = button('', 'mochi-choice')
      choice.append(portrait(character.name, character.avatarUrl))
      choice.append(el('span', '', character.name)); choice.setAttribute('aria-pressed', String(draft.characterIds.includes(character.id)))
      choice.onclick = () => { draft.characterIds = draft.characterIds.includes(character.id) ? draft.characterIds.filter(id => id !== character.id) : [...draft.characterIds, character.id]; choice.setAttribute('aria-pressed', String(draft.characterIds.includes(character.id))) }
      picker.append(choice)
    }
    form.append(el('p', '', 'Choose 1–12 characters'), picker)
    const persona = el('select')
    const option = (value: string, label: string) => { const o = el('option', '', label); o.value = value; persona.append(o) }
    if (room) option('keep', `Keep saved identity: ${room.persona.name}`)
    option('manual', 'Custom identity')
    state.personas.forEach((p, i) => option(String(i), `${p.name} (${p.source === 'pocket' ? 'Pocket profile' : 'Lumiverse persona'})`))
    persona.value = draft.persona; persona.onchange = () => { draft.persona = persona.value; this.redraw() }; field('Your identity in this room', persona)
    if (draft.persona === 'manual') {
      const name = el('input'); name.required = true; name.maxLength = 120; name.value = draft.name; name.oninput = () => { draft.name = name.value }; field('Your name', name)
      const description = el('textarea'); description.maxLength = 12000; description.rows = 3; description.value = draft.description; description.oninput = () => { draft.description = description.value }; field('Identity description', description)
    }
    if (room) {
      const connection = el('select')
      const empty = el('option', '', 'Choose connection'); empty.value = ''; connection.append(empty)
      for (const c of state.connections || []) { const o = el('option', '', `${c.name} · ${c.model}`); o.value = c.id; connection.append(o) }
      connection.value = settings.connectionId; connection.onchange = () => { settings.connectionId = connection.value }; field('Generation connection', connection)
      const auto = el('input'); auto.type = 'checkbox'; auto.checked = settings.autoReply; auto.onchange = () => { settings.autoReply = auto.checked }; field('Reply automatically after sending', auto)
      const accountBackground = el('input'); accountBackground.type = 'checkbox'; accountBackground.checked = !!state.backgroundEnabled; accountBackground.disabled = this.busy
      accountBackground.onchange = () => this.dispatch('mochi:background_account', { enabled: accountBackground.checked }); field('Allow server-side background messaging for my account', accountBackground)
      const roomBackground = el('input'); roomBackground.type = 'checkbox'; roomBackground.checked = !!room.background?.enabled; roomBackground.disabled = this.busy
      roomBackground.onchange = () => this.dispatch('mochi:background_room', { roomId: room.id, revision: room.revision, enabled: roomBackground.checked }); field('Allow scheduled messages in this room', roomBackground)
      if (state.backgroundEnabled && room.background?.enabled) {
        const due = el('input'); due.type = 'datetime-local'; field('Scheduled message time', due)
        const schedule = action('Schedule character message', 'plus'); schedule.type = 'button'; schedule.disabled = this.busy
        schedule.onclick = () => this.dispatch('mochi:schedule', { roomId: room.id, revision: room.revision, occurrenceId: requestId('scheduled'), dueAt: new Date(due.value).getTime(), responder: this.responders.get(room.id) || 'auto' })
        form.append(schedule)
        for (const job of room.background.jobs) {
          const row = el('div', 'mochi-actions'); row.append(el('small', 'mochi-muted', `${new Date(job.dueAt).toLocaleString()} · ${job.status}`))
          const cancelJob = action('Cancel scheduled message', 'close'); cancelJob.type = 'button'; cancelJob.disabled = this.busy
          cancelJob.onclick = () => this.dispatch('mochi:schedule_cancel', { roomId: room.id, occurrenceId: job.id }); row.append(cancelJob); form.append(row)
        }
      }
      for (const [label, key] of [['Total token budget', 'contextTokens'], ['Maximum reply tokens', 'outputTokens']] as const) {
        const input = el('input'); input.type = 'number'; input.value = String(settings[key]); input.oninput = () => { settings[key] = Number(input.value) }; field(label, input)
      }
      const instructions = el('textarea'); instructions.maxLength = 6000; instructions.value = settings.instructions; instructions.oninput = () => { settings.instructions = instructions.value }; field('Room instructions', instructions)
      for (const id of room.characterIds) {
        const presence = structuredClone(room.background?.presence?.[id] || defaultPresence()), name = state.characters.find(c=>c.id===id)?.name || id
        const setPresence = () => this.dispatch('mochi:presence',{roomId:room.id,revision:room.revision,characterId:id,presence})
        const status = el('select'); for (const s of STATUSES) { const option=el('option','',s==='dnd'?'DND':s[0].toUpperCase()+s.slice(1));option.value=s;status.append(option) }
        status.value=statusFor(room,id);status.disabled=this.busy;status.onchange=()=>{presence.manual=status.value as typeof presence.manual;setPresence()};field(`Status for ${name}`,status)
        const automatic=el('input');automatic.type='checkbox';automatic.checked=presence.manual===null;automatic.disabled=this.busy;automatic.onchange=()=>{presence.manual=automatic.checked?null:status.value as typeof presence.manual;setPresence()};field(`Automatic status for ${name}`,automatic)
        for (const [label,key] of [['Away delay (minutes)','awayMs'],['DND delay (minutes)','dndMs']] as const) {const delay=el('input');delay.type='number';delay.min='0';delay.max='1440';delay.value=String(presence[key]/60000);delay.disabled=this.busy;delay.onchange=()=>{presence[key]=Number(delay.value)*60000;setPresence()};field(`${label} for ${name}`,delay)}
        const next=el('select');for(const s of STATUSES){const option=el('option','',s==='dnd'?'DND':s);option.value=s;next.append(option)};field(`Scheduled status for ${name}`,next)
        const when=el('input');when.type='datetime-local';field(`Status change time for ${name}`,when)
        const plan=action(`Schedule status change for ${name}`,'plus');plan.type='button';plan.disabled=this.busy;plan.onclick=()=>{presence.transitions.push({at:new Date(when.value).getTime(),status:next.value as typeof presence.automatic});setPresence()};form.append(plan)
        const input = el('input'); input.maxLength = 120; input.value = settings.characterNames[id] || ''; input.oninput = () => { settings.characterNames[id] = input.value }; field(`Room name for ${state.characters.find(c => c.id === id)?.name || id}`, input)
      }
    }
    const save = action(this.busy ? 'Saving…' : room ? 'Save settings' : 'Create room', room ? 'settings' : 'plus'); save.classList.add('mochi-primary'); save.type = 'submit'; save.disabled = this.busy
    const cancel = action('Cancel', 'back'); cancel.disabled = this.busy; cancel.onclick = () => { this.creating = false; this.editing = false; this.draft = null; this.redraw() }
    const actions = el('div', 'mochi-actions'); actions.append(save, cancel); form.append(actions)
    form.onsubmit = event => {
      event.preventDefault()
      const selected = draft.persona === 'keep' ? undefined : draft.persona === 'manual' ? { source: 'manual', name: draft.name, description: draft.description } : state.personas[Number(draft.persona)]
      this.dispatch(room ? 'mochi:update' : 'mochi:create', { roomId: room?.id, revision: room ? this.draftRevision : undefined, title: draft.title, characterIds: draft.characterIds, persona: selected, ...(room ? { settings } : {}) })
    }
    return form
  }
  private thread(room: MochiRoom): HTMLDivElement {
    const thread = el('div', 'mochi-thread'); thread.setAttribute('role', 'log'); thread.setAttribute('aria-label', 'Room messages')
    thread.dataset.pocketThread = 'mochi'
    globalThis.requestAnimationFrame?.(() => { thread.scrollTop = thread.scrollHeight })
    let previous: MochiMessage | undefined
    for (const raw of room.messages) {
      const message = raw as MochiMessage
      const row = el('div', 'mochi-message'); row.dataset.role = message.role
      row.dataset.messageId = message.id
      const elapsed = previous ? Date.parse(message.createdAt) - Date.parse(previous.createdAt) : Infinity
      row.dataset.grouped = String(Boolean(previous && previous.role === message.role && previous.characterId === message.characterId && previous.name === message.name && elapsed >= 0 && elapsed < 300000))
      previous = message
      const avatar = el('span', 'mochi-message-avatar', message.name?.slice(0, 1) || '?')
      if (message.avatarUrl) { const image = el('img'); image.src = message.avatarUrl; image.alt = ''; avatar.replaceChildren(image) }
      const avatarFrame = el('span', 'mochi-avatar-frame'); avatarFrame.append(avatar)
      if (message.role === 'assistant') { const dot = el('span', 'mochi-presence-dot'); dot.dataset.status = statusFor(room,message.characterId || ''); dot.setAttribute('aria-hidden', 'true'); dot.title = `Character status: ${dot.dataset.status}`; avatarFrame.append(dot) }
      const body = el('div', 'mochi-message-body')
      const time = el('time', '', new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); time.dateTime = message.createdAt
      const displayName = message.role === 'user' ? 'You' : message.name || 'Unknown'
      const name = el('strong', 'mochi-message-name', displayName); name.title = message.name || 'Unknown'
      row.setAttribute('aria-label', `Message from ${message.name || 'Unknown'}`)
      const heading = el('div', 'mochi-message-heading'); heading.append(name, time)
      const meta = el('div', 'mochi-message-meta')
      const more = action(`Actions for ${message.name || 'message'}`, 'more', true); more.classList.add('mochi-message-actions'); more.onclick = () => this.messageActions(more, room, message)
      const bubble = el('div', 'mochi-bubble', message.content || '')
      if (message.editedAt) { bubble.title = `Edited ${new Date(message.editedAt).toLocaleString()}`; bubble.setAttribute('aria-description', bubble.title) }
      meta.append(more); body.append(heading, bubble, meta)
      row.append(avatarFrame, body); thread.append(row)
    }
    if (this.state?.jobs?.[room.id]) { const status = el('p', 'mochi-muted', 'Character is replying…'); status.setAttribute('role', 'status'); thread.append(status) }
    return thread
  }
  private sheet(anchor: HTMLElement, title: string, content: HTMLElement): ReturnType<typeof showPocketSheet> {
    const sheet = showPocketSheet(anchor, title, content)
    if (sheet) { this.sheets.add(sheet.dismiss); content.closest('dialog')?.classList.add('mochi-sheet'); content.closest('dialog')?.addEventListener('close', () => this.sheets.delete(sheet.dismiss), { once: true }) }
    return sheet
  }
  private messageActions(anchor: HTMLElement, room: MochiRoom, message: MochiMessage): void {
    const revision = room.revision, content = el('div', 'mochi-action-panel')
    const context = el('p', 'mochi-action-context')
    const author = el('strong', 'mochi-action-author', message.role === 'user' ? 'You' : message.name); author.title = message.name
    const details = el('small', '', `${new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}${message.editedAt ? ` · Edited ${new Date(message.editedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}`)
    if (message.editedAt) details.title = `Edited ${new Date(message.editedAt).toLocaleString()}`
    context.append(author, details)
    content.append(context)
    const sheet = this.sheet(anchor, 'Message actions', content)
    const copy = action('Copy message', 'copy'); copy.onclick = async () => {
      try { await navigator.clipboard.writeText(message.content); this.feedback = 'Message copied.'; sheet?.dismiss(); this.redraw() }
      catch { this.error = 'Clipboard is unavailable. Select the message text to copy it.'; sheet?.dismiss(); this.redraw() }
    }
    const edit = action('Edit message', 'edit'); edit.disabled = this.busy
    edit.onclick = () => {
      const label = el('label', '', 'Message text'), input = el('textarea'); input.value = message.content; input.rows = 5; input.maxLength = 32000; input.required = true; input.setAttribute('aria-label', 'Edit message text'); label.append(input)
      const save = action('Save message', 'edit'); save.onclick = () => { if (!input.value.trim()) { input.focus(); return }; this.dispatch('mochi:message_action', { roomId: room.id, revision, messageId: message.id, action: 'edit', content: input.value }); sheet?.dismiss() }
      content.replaceChildren(label, el('p', 'mochi-muted', 'Later messages stay unchanged. The previous text is retained in room storage.'), save)
    }
    const remove = action('Delete message', 'trash'); remove.disabled = this.busy; remove.onclick = () => {
      const confirm = action('Confirm delete', 'trash'); confirm.onclick = () => { this.dispatch('mochi:message_action', { roomId: room.id, revision, messageId: message.id, action: 'delete', confirmed: true }); sheet?.dismiss() }
      content.replaceChildren(el('p', '', 'Delete this saved message? Only this message and its prior versions will be removed. Later messages stay unchanged. This cannot be undone.'), confirm)
    }
    content.append(copy, edit, remove)
    if (message.role === 'assistant') {
      const reroll = action('Regenerate message', 'refresh'); reroll.disabled = this.busy || Boolean(this.state?.jobs?.[room.id])
      reroll.onclick = () => { const confirm = action('Confirm reroll', 'refresh'); confirm.onclick = () => { this.dispatch('mochi:regenerate', { roomId: room.id, revision, messageId: message.id, confirmed: true }); sheet?.dismiss() }; content.replaceChildren(el('p', '', 'Reroll using the conversation before this reply? The previous text is retained. Later messages stay unchanged and may no longer fit the new reply.'), confirm) }
      content.append(reroll)
    }
  }
  private markNotifications(id: string): void {
    const unread = this.state?.notifications?.filter(n => n.roomId === id && !n.read && !this.acknowledged.has(n.id)) || []
    if (!unread.length) return
    unread.forEach(n => this.acknowledged.add(n.id))
    const idForRequest = requestId('mochi_read')
    this.acknowledgementRequests.set(idForRequest, unread.map(n => n.id))
    this.send({ type: 'mochi:notification_read', requestId: idForRequest, roomId: id, notificationIds: unread.map(n => n.id) })
  }
  openRoom(id: string): void { this.notificationsOpen = false; this.select(id); this.navigate(id); this.markNotifications(id); this.load() }
  private notificationList(): HTMLDivElement {
    const list = el('div', 'mochi-notification-list'); list.append(el('h3', '', 'Mochi notifications'))
    const entries = this.state?.notifications || []
    list.append(el('p', 'mochi-muted', 'Reading marks notifications as read. Dismissing them keeps your room messages.'))
    const controls = el('div', 'mochi-actions')
    const clearRead = action('Clear read', 'trash'); clearRead.disabled = this.busy || !entries.some(n => n.read); clearRead.onclick = () => this.clearNotices('read', entries.filter(n => n.read))
    const clearAll = action('Clear all', 'trash'); clearAll.disabled = this.busy || !entries.length
    clearAll.onclick = () => { const content = el('div', 'mochi-action-panel'); const sheet = this.sheet(clearAll, 'Clear all notifications?', content); const confirm = action('Confirm clear all', 'trash'); confirm.onclick = () => { this.clearNotices('all', entries); sheet?.dismiss() }; content.append(el('p', '', 'Dismiss these notifications, including unread ones? Saved room messages stay intact. New notifications arriving afterwards will remain.'), confirm) }
    controls.append(clearRead, clearAll); list.append(controls)
    if (!entries.length) list.append(el('p', 'mochi-muted', 'No character notifications yet.'))
    for (const n of entries) {
      const entry = el('div', 'mochi-notification-entry'); entry.dataset.notificationId = n.id
      const row = button('', 'mochi-card'); const copy = el('div', 'mochi-card-copy'); copy.append(el('strong', '', `${n.title} · ${n.roomTitle}`), el('span', 'mochi-preview', notificationBody(n, this.notificationPolicy().previews)), el('small', 'mochi-muted', n.read ? 'Read' : 'New')); row.append(portrait(n.title, n.avatarUrl), copy); row.onclick = () => this.openRoom(n.roomId)
      const dismiss = action(`Dismiss notification from ${n.title}`, 'close', true); dismiss.disabled = this.busy; dismiss.onclick = () => this.clearNotices('dismiss', [n]); entry.append(row, dismiss); list.append(entry)
    }
    const back = action('Back to rooms', 'back'); back.onclick = () => { this.notificationsOpen = false; this.redraw() }; list.append(back)
    return list
  }
  private clearNotices(action: string, entries: MochiNotification[]): void {
    const rooms = new Map<string, string[]>()
    for (const n of entries) rooms.set(n.roomId, [...rooms.get(n.roomId) || [], n.id])
    this.dispatch('mochi:notification_clear', { action, rooms: [...rooms].map(([roomId, notificationIds]) => ({ roomId, notificationIds })), confirmed: action === 'all' })
  }
  private composer(room: MochiRoom): HTMLFormElement {
    const form = el('form', 'mochi-composer')
    const responder = el('select'); responder.setAttribute('aria-label', 'Next responder')
    const auto = el('option', '', 'Automatic responder'); auto.value = 'auto'; responder.append(auto)
    for (const id of room.characterIds) { const o = el('option', '', room.settings?.characterNames[id] || this.state?.characters.find(c => c.id === id)?.name || id); o.value = id; responder.append(o) }
    const selected = this.responders.get(room.id) || 'auto'
    responder.value = room.characterIds.includes(selected) ? selected : 'auto'
    const responderField = el('div', 'mochi-responder')
    const identity = el('span', 'mochi-responder-identity'); identity.setAttribute('aria-hidden', 'true')
    const showResponder = () => {
      const character = this.state?.characters.find(c => c.id === responder.value)
      const name = responder.value === 'auto' ? 'Automatic' : room.settings?.characterNames[responder.value] || character?.name || responder.value
      const avatar = portrait(name, character?.avatarUrl)
      if (responder.value === 'auto') avatar.innerHTML = POCKET_ICONS.contacts
      identity.replaceChildren(avatar, el('span', 'mochi-responder-name', name))
      responderField.title = `Next responder: ${name}`
    }
    showResponder(); responder.onchange = () => { this.responders.set(room.id, responder.value); showResponder() }
    responderField.append(identity, responder)
    const input = el('textarea'); input.rows = 1; input.maxLength = 32000; input.setAttribute('aria-label', 'Message'); input.placeholder = 'Message…'; input.value = this.drafts.get(room.id) || ''
    input.dataset.pocketComposer = `mochi_${room.id}`
    const guidance = `Messaging as ${room.persona.name}. Enter to send; Shift+Enter for a new line. Send empty to continue.`
    input.setAttribute('aria-description', guidance); input.title = guidance
    input.oninput = () => { this.drafts.set(room.id, input.value); input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 112)}px` }
    input.onkeydown = event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit() } }
    const job = this.state?.jobs?.[room.id]
    const submit = action('Send', 'send', true); submit.classList.add('mochi-primary'); submit.type = 'submit'; submit.disabled = this.busy || Boolean(job)
    const stop = action('Stop reply', 'stop', true); stop.disabled = !job; stop.hidden = !job; stop.onclick = () => this.send({ type: 'mochi:cancel', roomId: room.id, generationRequestId: job })
    form.onsubmit = event => { event.preventDefault(); if (!this.busy && !job) this.dispatch('mochi:send', { roomId: room.id, revision: room.revision, content: input.value, responder: responder.value }) }
    const actions = el('div', 'mochi-composer-row'); actions.append(input, submit, stop)
    form.append(responderField, actions)
    return form
  }
}
