import { button, el, requestId } from '../frontend/shared.js'
import { POCKET_ICONS } from '../frontend/components/icons.js'
import { MOCHI_STYLES } from './styles.js'

function action(label: string, icon: string, compact = false): HTMLButtonElement {
  const node = button('', `lp-button${compact ? ' mochi-icon-button' : ''}`)
  node.setAttribute('aria-label', label); node.title = label
  const glyph = el('span'); glyph.setAttribute('aria-hidden', 'true')
  glyph.innerHTML = POCKET_ICONS[icon] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon === 'stop' ? '<rect x="6" y="6" width="12" height="12" rx="2"/>' : '<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2"/>'}</svg>`
  node.append(glyph); if (!compact) node.append(el('span', '', label))
  return node
}
function portrait(name: string, url = ''): HTMLSpanElement {
  const node = el('span', 'mochi-avatar', name.slice(0, 1).toUpperCase() || '?'); node.setAttribute('aria-hidden', 'true')
  if (url) { const img = el('img'); img.src = url; img.alt = ''; node.replaceChildren(img) }
  return node
}
import { defaultMochiSettings, type MochiMessage, type MochiRoom, type MochiSettings, type MochiState } from './types.js'

export class MochiView {
  state: MochiState | null = null
  roomId = ''
  creating = false
  editing = false
  busy = false
  error = ''
  private request = ''
  private drafts = new Map<string, string>()
  private responders = new Map<string, string>()
  private ownGenerations = new Map<string, string>()
  private selectionVersion = 0
  private requestVersion = 0
  private settingsDraft: MochiSettings | null = null
  private draftRevision = 0
  private timeout: ReturnType<typeof setTimeout> | undefined
  private draft: { title: string; characterIds: string[]; persona: string; name: string; description: string } | null = null
  constructor(private send: (payload: unknown) => void, private redraw: () => void, private navigate: (roomId?: string) => void) {}
  load(): void { this.dispatch('mochi:list') }
  select(id: string): void {
    if (this.roomId !== id) { this.leave(); this.selectionVersion++; this.roomId = id; this.creating = false; this.editing = false; this.draft = null; this.settingsDraft = null }
  }
  leave(): void {
    const generationRequestId = this.ownGenerations.get(this.roomId)
    if (generationRequestId) this.send({ type: 'mochi:cancel', roomId: this.roomId, generationRequestId })
  }
  destroy(): void { this.leave(); clearTimeout(this.timeout) }
  private dispatch(type: string, values: Record<string, unknown> = {}): void {
    if (this.busy) return
    this.request = requestId('mochi')
    this.requestVersion = this.selectionVersion
    if (type === 'mochi:send') this.ownGenerations.set(this.roomId, this.request)
    this.busy = true; this.error = ''
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
    if (payload?.type !== 'mochi:state' && payload?.type !== 'mochi:error') return false
    if (payload.requestId !== this.request) return true
    clearTimeout(this.timeout)
    this.busy = false
    if (payload.type === 'mochi:error') { if (this.requestVersion === this.selectionVersion) this.error = String(payload.message) }
    else {
      this.state = payload.state
      if (payload.accepted && this.ownGenerations.get(this.roomId) === payload.requestId) this.drafts.set(this.roomId, '')
      for (const [id, request] of this.ownGenerations) if (this.state && this.state.jobs?.[id] !== request) this.ownGenerations.delete(id)
      if (payload.selectedRoomId && this.requestVersion === this.selectionVersion) {
        this.creating = false; this.editing = false; this.draft = null
        this.roomId = payload.selectedRoomId
        this.navigate(this.roomId)
      }
    }
    this.redraw()
    return true
  }
  render(): HTMLDivElement {
    const page = el('div', 'mochi-view')
    const style = el('style')
    style.textContent = MOCHI_STYLES
    page.append(style)
    const header = el('header'); const brand = el('div', 'mochi-brand'); brand.append(el('h2', '', 'Mochi')); const sparkle = el('span'); sparkle.innerHTML = POCKET_ICONS.sparkle; sparkle.setAttribute('aria-hidden', 'true'); brand.append(sparkle); header.append(brand)
    const refresh = action('Refresh', 'refresh', true); refresh.disabled = this.busy
    refresh.onclick = () => this.load(); header.append(refresh); page.append(header)
    if (this.error) { const error = el('p', 'mochi-error', this.error); error.setAttribute('role', 'alert'); page.append(error) }
    if (!this.state) return page
    for (const warning of this.state.warnings) page.append(el('p', 'mochi-error', warning))
    const room = this.state.rooms.find(room => room.id === this.roomId)
    if (this.creating || this.editing) { page.append(this.form(this.editing ? room : undefined)); return page }
    if (room) {
      const roomHeader = el('div', 'mochi-room-header')
      const info = el('div', 'mochi-room-info'); info.append(el('h3', '', room.title), el('p', 'mochi-muted', `${room.characterIds.length} ${room.characterIds.length === 1 ? 'character' : 'characters'}`), el('p', 'mochi-muted', `You are ${room.persona.name}`))
      const controls = el('div', 'mochi-actions')
      const inbox = action('Room inbox', 'back', true); inbox.onclick = () => { this.select(''); this.navigate() }
      const edit = action('Room settings', 'settings', true); edit.onclick = () => { this.leave(); this.editing = true; this.draft = null; this.settingsDraft = null; this.redraw() }
      controls.append(inbox, edit); roomHeader.append(info, controls); page.append(roomHeader)
      const members = el('div', 'mochi-member-strip')
      for (const id of room.characterIds) {
        const character = this.state.characters.find(c => c.id === id)
        const name = room.settings?.characterNames[id] || character?.name || 'Unavailable character'
        const card = el('div', 'mochi-member'); card.append(portrait(name, character?.avatarUrl), el('span', '', name))
        members.append(card)
      }
      page.append(members, this.thread(room), this.composer(room))
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
      row.onclick = () => { this.select(room.id); this.navigate(room.id) }; page.append(row)
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
      for (const [label, key] of [['Total token budget', 'contextTokens'], ['Maximum reply tokens', 'outputTokens']] as const) {
        const input = el('input'); input.type = 'number'; input.value = String(settings[key]); input.oninput = () => { settings[key] = Number(input.value) }; field(label, input)
      }
      const instructions = el('textarea'); instructions.maxLength = 6000; instructions.value = settings.instructions; instructions.oninput = () => { settings.instructions = instructions.value }; field('Room instructions', instructions)
      for (const id of room.characterIds) {
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
    for (const raw of room.messages) {
      const message = raw as MochiMessage
      const row = el('div', 'mochi-message'); row.dataset.role = message.role
      const avatar = el('span', 'mochi-message-avatar', message.name?.slice(0, 1) || '?')
      if (message.avatarUrl) { const image = el('img'); image.src = message.avatarUrl; image.alt = ''; avatar.replaceChildren(image) }
      const body = el('div', 'mochi-message-body')
      const time = el('time', '', new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); time.dateTime = message.createdAt
      body.append(el('strong', 'mochi-message-name', message.name || 'Unknown'), el('div', 'mochi-bubble', message.content || ''), time)
      row.append(avatar, body); thread.append(row)
    }
    if (this.state?.jobs?.[room.id]) { const status = el('p', 'mochi-muted', 'Character is replying…'); status.setAttribute('role', 'status'); thread.append(status) }
    return thread
  }
  private composer(room: MochiRoom): HTMLFormElement {
    const form = el('form', 'mochi-composer')
    const responder = el('select'); responder.setAttribute('aria-label', 'Next responder')
    const auto = el('option', '', 'Automatic responder'); auto.value = 'auto'; responder.append(auto)
    for (const id of room.characterIds) { const o = el('option', '', room.settings?.characterNames[id] || this.state?.characters.find(c => c.id === id)?.name || id); o.value = id; responder.append(o) }
    const selected = this.responders.get(room.id) || 'auto'
    responder.value = room.characterIds.includes(selected) ? selected : 'auto'
    responder.onchange = () => this.responders.set(room.id, responder.value)
    const input = el('textarea'); input.rows = 1; input.maxLength = 32000; input.setAttribute('aria-label', 'Message'); input.placeholder = `Message ${room.title}…`; input.value = this.drafts.get(room.id) || ''
    input.dataset.pocketComposer = `mochi_${room.id}`
    input.oninput = () => { this.drafts.set(room.id, input.value); input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 112)}px` }
    input.onkeydown = event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit() } }
    const job = this.state?.jobs?.[room.id]
    const submit = action('Send', 'send', true); submit.classList.add('mochi-primary'); submit.type = 'submit'; submit.disabled = this.busy || Boolean(job)
    const stop = action('Stop reply', 'stop', true); stop.disabled = !job; stop.hidden = !job; stop.onclick = () => this.send({ type: 'mochi:cancel', roomId: room.id, generationRequestId: job })
    form.onsubmit = event => { event.preventDefault(); if (!this.busy && !job) this.dispatch('mochi:send', { roomId: room.id, revision: room.revision, content: input.value, responder: responder.value }) }
    const actions = el('div', 'mochi-composer-row'); actions.append(input, submit, stop)
    form.append(responder, actions, el('p', 'mochi-composer-hint', 'Send empty to continue · Shift+Enter for a new line'))
    return form
  }
}
