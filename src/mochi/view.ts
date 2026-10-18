import {GROUP_ICONS,chatIdentity,chatPortrait} from './chat-identity.js'
import {MOCHI_TOOLBAR_ICONS} from './toolbar-icons.js'
import {PersonalSettings} from './personal-settings.js'
import {ChatSettingsLayout,SETTINGS_WORKSPACE_STYLES} from './settings-workspace.js'
import {TOOLBAR_LABELS,type ToolbarAction} from './ui-preferences.js'
import {MochiMemoryPanel,MOCHI_MEMORY_STYLES} from './memory-panel.js'
import { button, el, requestId } from '../frontend/shared.js'
import { POCKET_ICONS } from '../frontend/components/icons.js'
import { MOCHI_STYLES } from './styles.js'
import { mochiModelPicker, type MochiModelChoices } from './models.js'
import { GENERATION_ERROR_MESSAGES } from './generation-errors.js'
import { showPocketSheet } from '../frontend/components/ui.js'
import { notificationBody, type MochiNotificationPolicy } from './notifications.js'
import { defaultPresence, STATUSES, statusFor } from './presence.js'
import { MochiProfiles } from './profile-screen.js'
import { accountPicker } from './account-picker.js'
import type { MochiPhone } from './phone-selection.js'
import { SCHEDULE_LABELS, TERMINAL, type PublicRuntime } from './scheduling.js'

function action(label: string, icon: string, compact = false): HTMLButtonElement {
  const node = button('', `lp-button${compact ? ' mochi-icon-button' : ''}`)
  node.setAttribute('aria-label', label); node.title = label
  const glyph = el('span'); glyph.setAttribute('aria-hidden', 'true')
  const extra: Record<string, string> = { stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', edit: '<path d="m15 4 5 5-11 11H4v-5L15 4Z M12 7l5 5"/>', more: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>' }
  extra.close = '<path d="m6 6 12 12M18 6 6 18"/>'
  extra.search = '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>'
  glyph.innerHTML = MOCHI_TOOLBAR_ICONS[icon] || POCKET_ICONS[icon] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${extra[icon] || '<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2"/>'}</svg>`
  node.append(glyph); if (!compact) node.append(el('span', '', label))
  return node
}
function portrait(name: string, url = ''): HTMLSpanElement {
  const node = el('span', 'mochi-avatar', name.slice(0, 1).toUpperCase() || '?'); node.setAttribute('aria-hidden', 'true')
  if (url) { const img = el('img'); img.src = url; img.alt = ''; node.replaceChildren(img) }
  return node
}
const stateAccountLabel=(id?:string)=>id?'Account settings':'Profiles and account settings'
import { defaultMochiSettings, type MochiMessage, type MochiNotification, type MochiRoom, type MochiSettings, type MochiState } from './types.js'
import { MOCHI_DESKTOP_STYLES } from './desktop-styles.js'
import {roomDetails} from './details-panel.js'
import {MOCHI_SIDEBAR_ICON} from './sidebar-icon.js'
import {mochiWordmark} from './wordmark.js'
import { referencedMessage, quoteExcerpt } from './replies.js'
import { MOCHI_REPLY_STYLES } from './reply-styles.js'
import {REACTION_EMOJI,REACTION_NAMES,readReactions} from './reactions.js'
import {MOCHI_REACTION_STYLES} from './reaction-styles.js'
import {pinsPanel,MOCHI_PIN_STYLES,type NoteDraft} from './pins-panel.js'
import {MochiSearch,MOCHI_SEARCH_STYLES} from './search-panel.js'
import {textingControls,MOCHI_TEXTING_STYLES} from './texting-controls.js'
import {MOCHI_DISCLOSURE_STYLES} from './disclosure.js'
import {DEFAULT_PRESET_ID,DEFAULT_V2_PRESET_ID} from './presets.js'
import {MochiPreview,MOCHI_PREVIEW_STYLES} from './preview-panel.js'
import {MochiPresetPanel,MOCHI_PRESET_STYLES,MOCHI_PRESET_WORKSPACE_STYLES} from './preset-panel.js'

type DisplayMessage = Pick<MochiMessage, 'id' | 'role' | 'content' | 'name' | 'createdAt'> & Partial<Pick<MochiMessage, 'avatarUrl' | 'characterId' | 'editedAt'>> & {replyTo?:unknown}
function isDisplayMessage(value: unknown): value is DisplayMessage {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && 'id' in value && typeof value.id === 'string' && Boolean(value.id)
    && 'role' in value && (value.role === 'user' || value.role === 'assistant')
    && 'content' in value && typeof value.content === 'string'
    && 'name' in value && typeof value.name === 'string'
    && 'createdAt' in value && typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt))
    && (!('avatarUrl' in value) || value.avatarUrl === undefined || typeof value.avatarUrl === 'string')
    && (!('characterId' in value) || value.characterId === undefined || typeof value.characterId === 'string')
    && (!('editedAt' in value) || value.editedAt === undefined || typeof value.editedAt === 'string')
}

export class MochiView {
  private destroyed = false
  private desktopHistory = new Map<string, number>()
  private desktopDetails = false
  private conversationFilter = ''
  private conversationView: 'all'|'groups' = 'all'
  private profiles = new MochiProfiles()
  private profilesOpen = false
  private pickerOpen = false
  private startupOpen = false
  private activeAccountId?: string
  private lastRooms = new Map<string, string>()
  private navigationRequest = ''
  private navigationTimeout?: ReturnType<typeof setTimeout>
  private navigationError = ''
  private restoreRoom = false
  private sidebarProfile = false
  private profileReturn?: () => void
  private accountNavigation?: {picker():void; settings(anchor:HTMLElement):void}
  setAccountNavigation(owner: {picker():void; settings(anchor:HTMLElement):void} | undefined):void {this.accountNavigation=owner}
  get isSidebarProfileOpen():boolean{return this.sidebarProfile}
  editSidebarProfile(anchor:HTMLElement, complete:()=>void, create=false):void {
    // A running reply must reach the existing consequential-navigation warning.
    // Other pending writes still block opening a conflicting profile editor.
    if(this.busy&&!this.ownGenerations.has(this.roomId))return
    const current=this.profiles.state?.accounts.find(a=>a.id===this.state?.accountId&&!a.archived)
    if(!this.profiles.state||(!create&&!current))return
    this.exitPortal(()=>{this.sidebarProfile=true;this.profileReturn=complete;this.profiles.start(create?undefined:current);this.refreshChoices();this.redraw()},anchor,true)
  }
  renderSidebarProfile():HTMLElement {
    const root=el('section','mochi-view');const style=el('style');style.textContent=MOCHI_STYLES;root.append(style)
    const finish=()=>{this.sidebarProfile=false;this.profiles.draft=null;const done=this.profileReturn;this.profileReturn=undefined;this.redraw();done?.()}
    root.append(this.profiles.render(this.busy,(type,input)=>this.dispatch(type,input),()=>{if(!this.profiles.draft)finish();else this.redraw()},finish,(next,anchor)=>this.confirmNavigation(next,anchor),()=>this.refreshChoices()))
    return root
  }
  get navigationState() { return {accounts:this.profiles.state, selectedAccountId:this.state?.accountId||this.activeAccountId, loading:!!this.navigationRequest, error:this.navigationError, switching:this.busy} }
  loadNavigationAccounts(): void {
    if (this.destroyed || this.navigationRequest) return
    this.navigationError = ''; this.navigationRequest = requestId('mochi_navigation')
    this.navigationTimeout = setTimeout(()=>{this.navigationRequest='';this.navigationError='Accounts are unavailable. Try again.';this.redraw()},30000)
    this.send({type:'mochi:accounts',requestId:this.navigationRequest}); this.redraw()
  }
  selectNavigationAccount(id: string | undefined, anchor: HTMLElement, present: () => void): void {
    if (this.destroyed || this.busy) return
    if (id && !this.profiles.state?.accounts.some(a=>a.id===id&&!a.archived)) return
    if (this.state && this.state.accountId === id) { present(); return }
    this.exitPortal(()=>{
      this.restoreRoom=true
      if(id)this.chooseAccount(id)
      else {this.leave();this.resetScope();this.pickerOpen=false;this.profilesOpen=false;this.load()}
      present()
    },anchor,true)
  }
  createNavigationAccount(anchor: HTMLElement, present: () => void): void {
    if (this.destroyed || this.busy || !this.profiles.state) return
    this.exitPortal(()=>{this.leave();this.profiles.start();this.profilesOpen=true;this.pickerOpen=true;this.refreshChoices();this.redraw();present()},anchor,true)
  }
  private phone?: MochiPhone
  private associations=new Map<string,{accountId:string;revision:number}>()
  private retiredSchedulingSessions = new Map<string, Set<string>>()
  private schedulingRoot?: HTMLElement
  private schedulingTime = new Map<string, string>()
  private mergeScheduling(room: MochiRoom, incoming: PublicRuntime | undefined, revision: number): PublicRuntime | undefined {
    const current = room.background, next = incoming?.snapshot, prior = current?.snapshot
    if (revision < room.revision) return current
    if (prior && !next) return current
    if (next && prior) {
      if (next.session === prior.session && next.sequence < prior.sequence) return current
      const retired = this.retiredSchedulingSessions.get(room.id) || new Set<string>()
      if (retired.has(next.session)) return current
      if (next.session !== prior.session) { retired.add(prior.session); this.retiredSchedulingSessions.set(room.id, retired) }
    }
    return incoming
  }
  canOpenRoom(id:string|undefined,phone?:MochiPhone):boolean{
    return !!id&&!!this.state?.rooms.some(r=>r.id===id)&&this.phone?.chatId===phone?.chatId&&this.phone?.characterId===phone?.characterId&&this.phone?.deviceOwnerActorId===phone?.deviceOwnerActorId
  }
  open(phone?:MochiPhone):void{
    this.leave();this.resetScope();this.phone=phone;this.pickerOpen=true;this.startupOpen=true;this.profilesOpen=false;this.profiles.state=null;this.dispatch('mochi:accounts')
  }
  private resetScope():void{
    this.settingsPage='';this.settingsLayout.reset();this.personalSettings.reset();this.personalScroll=0
    this.desktopDetails=false;this.conversationFilter='';this.conversationView='all'
    this.memoryPanel.reset()
    this.presetPanel.reset()
    this.preview.reset()
    this.search.reset()
    if(this.state&&this.roomId)this.lastRooms.set(this.state.accountId||'',this.roomId)
    this.desktopHistory.clear()
    this.retiredSchedulingSessions.clear(); this.schedulingTime.clear(); this.schedulingRoot = undefined
    this.notificationsChanged([],new Set(this.state?.rooms.map(r=>r.id)||[]));this.state=null;this.activeAccountId=undefined;this.roomId='';this.creating=false;this.editing=false;this.draft=null;this.settingsDraft=null;this.notificationsOpen=false;this.busy=false;clearTimeout(this.timeout);this.request='';this.selectionVersion++;this.notificationRevisions.clear();this.seenNotifications.clear();this.acknowledged.clear();this.acknowledgementRequests.clear();this.ownGenerations.clear()
  }
  private chooseAccount(id:string,persist=true):void{
    this.leave();this.resetScope();this.activeAccountId=id;this.profilesOpen=false
    if(persist){this.pickerOpen=true;this.dispatch('mochi:account_select',{accountId:id,revision:this.profiles.state?.revision})}
    else{this.pickerOpen=false;this.load()}
  }
  private showPicker():void{this.leave();this.resetScope();this.pickerOpen=true;this.startupOpen=false;this.profilesOpen=false;this.dispatch('mochi:accounts')}
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
  private replyTargets = new Map<string,string>()
  private quoteJump?:{roomId:string;messageId:string;accountId?:string}
  private replyKey(room:MochiRoom):string{return JSON.stringify([room.accountId||'',room.id])}
  private quoteNode(room:MochiRoom,id:unknown,navigate=false):HTMLElement {
    const candidate=room.accountId===this.state?.accountId?referencedMessage(room.messages,id):undefined,original=candidate&&isDisplayMessage(candidate)?candidate:undefined,label=original?`Reply to ${original.name}: ${quoteExcerpt(original.content)}`:'Reply to unavailable message'
    const node=navigate&&original?button('','mochi-quote'):el('div','mochi-quote');node.setAttribute('aria-label',label)
    node.append(el('strong','',original?original.name:'Message unavailable'),el('span','',original?quoteExcerpt(original.content):'The original message is no longer available.'))
    if(navigate&&original){node.setAttribute('type','button');node.onclick=()=>{
      const index=room.messages.findIndex(m=>typeof m==='object'&&m!==null&&'id'in m&&m.id===original.id)
      this.desktopHistory.set(room.id,Math.max(this.desktopHistory.get(room.id)||100,room.messages.length-index))
      this.quoteJump={roomId:room.id,messageId:original.id,accountId:room.accountId};this.redraw()
      // Compatibility handset routes do not use the workspace scroll controller.
      if(this.quoteJump){const jump=this.consumeQuoteJump();if(jump){const target=Array.from(this.presenceRoot?.querySelectorAll<HTMLElement>('[data-message-id]')||[]).find(n=>n.dataset.messageId===jump.messageId);target?.scrollIntoView?.({block:'center',behavior:'auto'});target?.focus({preventScroll:true})}}
    }}
    return node
  }
  consumeQuoteJump():{roomId:string;messageId:string}|undefined{const jump=this.quoteJump;this.quoteJump=undefined;return jump&&jump.roomId===this.roomId&&jump.accountId===this.state?.accountId?jump:undefined}
  private responders = new Map<string, string>()
  private ownGenerations = new Map<string, string>()
  private pendingSends = new Map<string, { roomId: string; content: string; replyTo?:string; replyKey:string }>()
  private noteDrafts=new Map<string,NoteDraft>()
  private pendingNoteSave?:string
  private search=new MochiSearch(payload=>this.send(payload),()=>this.state?.rooms.find(r=>r.id===this.roomId&&r.accountId===this.state?.accountId),()=>this.redraw(),(incoming,id)=>{
    const room=this.state?.rooms.find(r=>r.id===this.roomId&&r.id===incoming.id&&r.accountId===incoming.accountId)
    if(!room)return
    Object.assign(room,incoming)
    const quote=this.quoteNode(room,id,true);(quote as HTMLButtonElement).click()
  },()=>this.restoreToolFocus())
  private selectionVersion = 0
  private memoryPanel=new MochiMemoryPanel(payload=>this.send(payload),()=>this.state?.rooms.find(r=>r.id===this.roomId&&r.accountId===this.state?.accountId),()=>this.redraw(),p=>{const room=this.state?.rooms.find(r=>r.id===p.roomId&&r.accountId===p.accountId);if(room&&p.revision>=room.revision&&(room.associationRevision||0)===p.associationRevision){room.memory=p.memory;room.revision=p.revision;room.updatedAt=p.updatedAt;room.background=this.mergeScheduling(room,p.background,p.revision);this.preview.invalidate()}},()=>this.restoreToolFocus(),(id,running)=>{if(running){this.ownGenerations.set(this.roomId,id);if(this.state){this.state.jobs||={};this.state.jobs[this.roomId]=id}}else{if(this.ownGenerations.get(this.roomId)===id)this.ownGenerations.delete(this.roomId);if(this.state?.jobs?.[this.roomId]===id)delete this.state.jobs[this.roomId]}},()=>this.busy||Boolean(this.state?.jobs?.[this.roomId]))
  private presetPanel=new MochiPresetPanel(payload=>this.send(payload),()=>this.state?.rooms.find(r=>r.id===this.roomId&&r.accountId===this.state?.accountId),()=>this.redraw(),(presetId,presetRevision)=>{const room=this.state?.rooms.find(r=>r.id===this.roomId);if(!room||this.busy)return;this.presetPanel.reset();this.preview.reset();this.dispatch('mochi:preset_bind',{roomId:room.id,revision:room.revision,presetId,presetRevision,confirmed:true})},()=>this.restoreToolFocus(),blocks=>{const room=this.state?.rooms.find(r=>r.id===this.roomId);if(room){this.presetPanel.open=false;this.preview.show(room,blocks)}})
  private preview=new MochiPreview(payload=>this.send(payload),()=>this.state?.rooms.find(r=>r.id===this.roomId&&r.accountId===this.state?.accountId),()=>this.redraw(),()=>{if(this.preview.isDraft){this.presetPanel.open=true;this.redraw()}else this.restoreToolFocus()},id=>this.state?.characters.find(c=>c.id===id)?.name||id)
  private requestVersion = 0
  private modelControllers = new Set<AbortController>()
  private modelChoices = new Map<string,MochiModelChoices>()
  private choicesRequest = ''
  private choicesVersion = 0
  private choicesTimeout?: ReturnType<typeof setTimeout>
  private refreshChoices(): void {
    if (this.destroyed) return
    this.choicesRequest=requestId('mochi_choices');this.choicesVersion=this.selectionVersion
    clearTimeout(this.choicesTimeout)
    this.choicesTimeout=setTimeout(()=>{this.choicesRequest=''},30000)
    this.send({type:'mochi:choices',requestId:this.choicesRequest,accountId:this.state?.accountId||this.activeAccountId})
  }
  private settingsPage:''|'chat'|'personal'=''
  private settingsLayout=new ChatSettingsLayout()
  private personalSettings=new PersonalSettings(p=>this.send(p),()=>this.state?.accountId,()=>this.profiles.state?.ownerId,()=>this.redraw())
  private settingsReturnFocus=false
  private personalScroll=0
  private settingsInvoker='Room options'
  private toolFocus=''
  private settingsSections = new Set<string>()
  private formBaseline = ''
  private settingsDraft: MochiSettings | null = null
  private draftRevision = 0
  private timeout: ReturnType<typeof setTimeout> | undefined
  private generationErrorRoom = ''
  private presenceTimer?: ReturnType<typeof setInterval>
  private presenceRoot?: HTMLElement
  private draft: { title: string; characterIds: string[]; persona: string; name: string; description: string; groupIcon?:string; presetId?:string } | null = null
  constructor(private send: (payload: unknown) => void, private redraw: () => void, private navigate: (roomId?: string) => void,
    private notificationPolicy: () => MochiNotificationPolicy = () => ({ enabled: true, previews: true, visible: true }),
    private notify: (n: MochiNotification) => void = () => {},
    private notificationsChanged: (notices: MochiNotification[], rooms: Set<string>) => void = () => {}) {}
  hasUnsavedChanges(): boolean {
    if(this.personalSettings.dirty)return true
    if(this.sidebarProfile)return this.profiles.hasUnsavedChanges()
    if (this.profilesOpen) return this.profiles.hasUnsavedChanges()
    return !!(this.creating || this.editing) && !!this.draft && JSON.stringify([this.draft,this.settingsDraft]) !== this.formBaseline
  }
  isConversationOpen(): boolean { return !this.destroyed && !!this.roomId && !this.pickerOpen && !this.profilesOpen && !this.editing && !this.creating && !this.notificationsOpen && !this.settingsPage }
  private generationExitNotice(summaryOnly=false):string {
    if(this.memoryPanel.generating)return 'A summary is still generating. Leaving will cancel it. Saved memories will not be deleted.'
    return !summaryOnly&&this.ownGenerations.has(this.roomId)?'A reply is still generating. Leaving will stop this reply. Saved messages will not be deleted.':''
  }
  /** User-initiated hide/tool transitions only; auth disposal must never wait. */
  confirmGenerationExit(next:()=>void,anchor:HTMLElement,summaryOnly=false):void {
    const notice=this.generationExitNotice(summaryOnly)
    if(!notice){next();return}
    const content=el('div','mochi-action-panel');content.append(el('p','',notice+' Scheduled jobs are unaffected. Drafts are retained only in this frontend session.'))
    const stay=action('Stay here','back'),leave=action('Cancel generation & leave','stop');content.append(stay,leave)
    const sheet=this.sheet(anchor,'Stop generation and leave?',content)
    stay.onclick=()=>sheet?.dismiss();leave.onclick=()=>{sheet?.dismiss();next()}
  }
  private confirmNavigation(next: () => void, anchor: HTMLElement,stopsGeneration=false): void {
    const notice=stopsGeneration?this.generationExitNotice():''
    if (!this.hasUnsavedChanges()) { if(stopsGeneration)this.confirmGenerationExit(next,anchor);else next();return }
    const content=el('div','mochi-action-panel')
    content.append(el('p','','You have unsaved changes to settings or your fictional profile. Leaving discards these edits.'+(notice?' '+notice:'')+' Saved conversation data is unchanged.'))
    const keep=action('Keep editing','edit'),discard=action(notice?'Discard edits, cancel generation & leave':'Discard changes','back')
    content.append(keep,discard)
    const sheet=this.sheet(anchor,'Unsaved changes',content)
    content.closest('dialog')?.classList.add('mochi-unsaved-sheet')
    keep.onclick=()=>sheet?.dismiss()
    discard.onclick=()=>{sheet?.dismiss();next()}
  }
  exitPortal(next: () => void, anchor: HTMLElement,stopsGeneration=false): void {
    this.confirmNavigation(()=>{this.creating=false;this.editing=false;this.draft=null;this.settingsDraft=null;this.profiles.draft=null;this.profilesOpen=false;this.sidebarProfile=false;this.profileReturn=undefined;this.personalSettings.discard();next()},anchor,stopsGeneration)
  }
  back(exit: () => void, anchor: HTMLElement): void {
    if (this.busy) return
    const next=()=>{
      if(this.settingsPage){this.settingsPage='';this.editing=false;this.draft=null;this.settingsDraft=null;this.personalSettings.discard()}
      else if(this.profilesOpen){if(this.profiles.draft)this.profiles.draft=null;else this.profilesOpen=false}
      else if(this.creating||this.editing){this.creating=false;this.editing=false;this.draft=null;this.settingsDraft=null}
      else if(this.notificationsOpen)this.notificationsOpen=false
      else if(this.pickerOpen){exit();return}
      else if(this.roomId)this.select('')
      else {this.showPicker();return}
      this.redraw()
    }
    this.confirmNavigation(next,anchor,this.isConversationOpen())
  }
  load(): void {
    if(!this.presenceTimer) {this.presenceTimer=setInterval(()=>this.refreshPresence(),30000);(this.presenceTimer as unknown as {unref?:()=>void}).unref?.()}
    this.dispatch('mochi:list')
  }
  private refreshPresence(): void {
    const room=this.state?.rooms.find(r=>r.id===this.roomId),root=this.presenceRoot
    if(!room||!root?.isConnected) return
    for(const label of root.closest('.mochi-desktop')?.querySelectorAll<HTMLElement>('.mochi-profile-status')||[])label.textContent=this.state?.characters.some(c=>c.id===label.dataset.characterId)?`Availability: ${statusFor(room,label.dataset.characterId||'')}`:'Character source unavailable'
    for(const dot of root.querySelectorAll<HTMLElement>('.mochi-presence-dot')) {dot.dataset.status=statusFor(room,dot.dataset.characterId||'');dot.title=`Character status: ${dot.dataset.status}`}
    const meta=root.querySelector<HTMLElement>('.mochi-room-meta'),statuses=room.characterIds.map(id=>statusFor(room,id))
    if(meta){const online=statuses.includes('online');meta.dataset.status=online?'online':statuses.includes('away')?'away':statuses.includes('dnd')?'dnd':'offline';meta.textContent=`${room.characterIds.length} ${room.characterIds.length===1?'participant':'participants'} · ${online?'active now':statuses.every(s=>s==='offline')?'offline':'replies delayed'}`;meta.title=room.characterIds.map((id,i)=>`${room.settings?.characterNames[id]||this.state?.characters.find(c=>c.id===id)?.name||id}: ${statuses[i]}`).join('\n')}
  }
  select(id: string): void {
    if(this.roomId!==id)this.desktopDetails=false
    if (this.roomId !== id) { this.settingsPage='';this.settingsLayout.reset();this.leave(); this.selectionVersion++; this.roomId = id; this.creating = false; this.editing = false; this.draft = null; this.settingsDraft = null }
    if(this.state){if(id)this.lastRooms.set(this.state.accountId||'',id);else this.lastRooms.delete(this.state.accountId||'')}
  }
  leave(): void {
    if (this.generationErrorRoom) { this.error = ''; this.generationErrorRoom = '' }
    this.memoryPanel.reset()
    this.presetPanel.reset()
    this.preview.reset()
    this.search.reset()
    for (const dismiss of this.sheets) dismiss(); this.sheets.clear()
    const generationRequestId = this.ownGenerations.get(this.roomId)
    if (generationRequestId) { try { this.send({ type: 'mochi:cancel', accountId: this.state?.accountId, roomId: this.roomId, generationRequestId }) } finally { this.ownGenerations.delete(this.roomId) } }
  }
  destroy(cancel = true): void {
    if (this.destroyed) return
    try { if (cancel) this.leave(); else { for (const dismiss of this.sheets) dismiss(); this.sheets.clear() } }
    finally {
      this.destroyed = true
      this.desktopDetails=false;this.conversationFilter='';this.conversationView='all'
      this.memoryPanel.reset(true)
      this.presetPanel.reset(true)
      clearTimeout(this.navigationTimeout);this.navigationRequest='';this.navigationError='';this.lastRooms.clear()
      clearTimeout(this.timeout); clearTimeout(this.choicesTimeout); clearInterval(this.presenceTimer)
      for (const controller of this.modelControllers) controller.abort()
      this.modelControllers.clear(); this.modelChoices.clear(); this.choicesRequest = ''
      this.resetScope(); this.profiles = new MochiProfiles(); this.profilesOpen = false; this.pickerOpen = false
      this.drafts.clear();this.replyTargets.clear();this.quoteJump=undefined;this.noteDrafts.clear();this.pendingNoteSave=undefined; this.responders.clear(); this.pendingSends.clear(); this.associations.clear(); this.settingsSections.clear(); this.lastRooms.clear();this.sidebarProfile=false;this.profileReturn=undefined;this.accountNavigation=undefined
      this.phone = undefined; this.presenceRoot = undefined; this.error = ''; this.feedback = ''; this.formBaseline = ''
    }
  }
  private dispatch(type: string, values: Record<string, unknown> = {}): void {
    if (this.destroyed) return
    if (this.busy) return
    this.request = requestId('mochi')
    this.requestVersion = this.selectionVersion
    if (type === 'mochi:send' || type === 'mochi:regenerate') this.ownGenerations.set(this.roomId, this.request)
    if (type === 'mochi:send') this.pendingSends.set(this.request, { roomId: this.roomId, content: String(values.content ?? ''),replyTo:typeof values.replyTo==='string'?values.replyTo:undefined,replyKey:JSON.stringify([this.state?.accountId||'',this.roomId]) })
    this.operation = type
    this.busy = true; this.error = ''; this.generationErrorRoom = ''; this.feedback = ''
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.busy = false
      this.error = 'No response received. Refresh the inbox to check whether your room was saved before trying again.'
      this.redraw()
    }, 30000)
    this.send({ type, requestId: this.request, accountId: this.state?.accountId||this.activeAccountId, ...(this.phone?{phone:this.phone}:{}), ...values })
    this.redraw()
  }
  receive(payload: any): boolean {
    if (this.destroyed) return false
    if (payload?.type === 'mochi:error' && payload.roomId &&
        (payload.accountId !== this.state?.accountId || payload.roomId !== this.roomId ||
         this.ownGenerations.get(payload.roomId) !== payload.requestId ||
         this.state?.rooms.find(r => r.id === payload.roomId)?.revision !== payload.roomRevision)) return true
    if(this.personalSettings.receive(payload))return true
    if(this.memoryPanel.receive(payload))return true
    if(this.presetPanel.receive(payload))return true
    if(this.preview.receive(payload))return true
    if(this.search.receive(payload))return true
    if(this.navigationRequest&&payload?.requestId===this.navigationRequest&&(payload.type==='mochi:accounts'||payload.type==='mochi:error')){
      clearTimeout(this.navigationTimeout);this.navigationRequest=''
      if(payload.type==='mochi:error')this.navigationError='Unable to load accounts. Try again.'
      else if(!this.profiles.state||payload.state.revision>=this.profiles.state.revision)this.profiles.state=payload.state
      this.redraw();return true
    }
    if(payload?.requestId===this.choicesRequest&&this.choicesRequest&&(payload.type==='mochi:choices'||payload.type==='mochi:error')){
      clearTimeout(this.choicesTimeout);this.choicesRequest=''
      if(this.choicesVersion!==this.selectionVersion)return true
      if(payload.type==='mochi:error')this.error=String(payload.message)
      else {this.preview.invalidate('Sources refreshed. Refresh preview.');if(this.state){this.state.personas=payload.personas;this.state.characters=payload.characters;this.state.connections=payload.connections}if(this.profiles.state)this.profiles.state.personas=payload.personas}
      this.redraw();return true
    }
    if(payload?.type==='mochi:room_assigned'){
      const previous=this.associations.get(payload.roomId)
      if(previous&&previous.revision>=payload.associationRevision)return true
      this.associations.set(payload.roomId,{accountId:payload.accountId,revision:payload.associationRevision})
      if(this.state&&(this.state.accountId===payload.sourceAccountId||this.state.accountId===payload.accountId)){
        const isSource=this.state.accountId===payload.sourceAccountId
        if(isSource){this.state.rooms=this.state.rooms.filter(r=>r.id!==payload.roomId);this.state.notifications=this.state.notifications?.filter(n=>n.roomId!==payload.roomId);this.notificationsChanged([],new Set([payload.roomId]));if(this.roomId===payload.roomId){this.leave();this.roomId='';this.editing=false;this.settingsDraft=null;this.draft=null;this.navigate()}}
        if(!this.creating&&!this.editing){this.busy=false;clearTimeout(this.timeout);this.dispatch('mochi:list')}else this.redraw()
      }
      return true
    }
    if(payload?.type==='mochi:accounts') {
      if(payload.requestId!==this.request)return true
      clearTimeout(this.timeout);this.busy=false;this.profiles.state=payload.state
      if(payload.uploadedAvatarId&&this.profiles.draft)this.profiles.draft.avatarId=payload.uploadedAvatarId
      else if(this.operation!=='mochi:accounts')this.profiles.draft=null
      if(this.sidebarProfile&&!payload.uploadedAvatarId&&['mochi:account_create','mochi:account_update','mochi:account_archive','mochi:account_restore'].includes(this.operation)){
        this.sidebarProfile=false;const done=this.profileReturn;this.profileReturn=undefined
        if(payload.createdAccountId){this.chooseAccount(payload.createdAccountId);done?.();return true}
        if(this.state?.accountId&&!payload.state.accounts.some((a:any)=>a.id===this.state?.accountId&&!a.archived)){this.leave();this.resetScope();this.pickerOpen=false}
        this.redraw();done?.();return true
      }
      if(this.operation==='mochi:account_select'){
        const id=payload.state.phone?.lastAccountId||payload.state.selectedAccountId
        if(id&&payload.state.accounts.some((a:any)=>a.id===id&&!a.archived)){this.chooseAccount(id,false);return true}
      }
      if(payload.createdAccountId&&this.pickerOpen){this.chooseAccount(payload.createdAccountId);return true}
      if(this.state?.accountId&&!payload.state.accounts.some((a:any)=>a.id===this.state?.accountId&&!a.archived)){this.showPicker();return true}
      if(this.startupOpen){this.startupOpen=false;const id=payload.state.phone?.lastAccountId;if(payload.state.phone?.preference==='last-used'&&payload.state.accounts.some((a:any)=>a.id===id&&!a.archived)){this.chooseAccount(id,false);return true}}
      this.redraw();return true
    }
    if (['mochi:notification', 'mochi:notifications', 'mochi:room_updated', 'mochi:job_finished', 'mochi:scheduling_updated'].includes(payload?.type) &&
        (payload.accountId ?? payload.notification?.accountId ?? payload.room?.accountId) !== this.state?.accountId) return true
    const eventRoom=payload?.roomId??payload?.notification?.roomId??payload?.room?.id
    if(eventRoom&&this.associations.has(eventRoom)&&this.associations.get(eventRoom)!.accountId!==this.state?.accountId)return true
    if (payload?.type === 'mochi:scheduling_updated') {
      const room = this.state?.rooms.find(r => r.id === payload.roomId)
      if (!room || room.accountId !== payload.accountId || (payload.associationRevision || 0) !== (room.associationRevision || 0) || !Number.isSafeInteger(payload.roomRevision) || !payload.background?.snapshot) return true
      room.background = this.mergeScheduling(room, payload.background, payload.roomRevision)
      // Refresh only the schedule list while editing; preserve form nodes, focus,
      // cursor position and unsaved settings. Room/messages are never replaced.
      if (this.editing && room.id === this.roomId && this.schedulingRoot?.isConnected) {
        const updated = this.scheduleList(room)
        this.schedulingRoot.replaceChildren(...Array.from(updated.childNodes))
      } else this.redraw()
      return true
    }
    if (payload?.type === 'mochi:room_updated') {
      const room = this.state?.rooms.find(r => r.id === payload.room?.id)
      if (room && payload.room.revision > room.revision && !this.editing && !this.creating) {
        if (this.generationErrorRoom === room.id) { this.error = ''; this.generationErrorRoom = '' }
        payload.room.background = this.mergeScheduling(room, payload.room.background, payload.room.revision)
        Object.assign(room, payload.room)
        this.redraw()
      }
      return true
    }
    if ((payload?.type === 'mochi:accepted' || (payload?.type === 'mochi:state' && payload.accepted)) && this.pendingSends.has(payload.requestId)) {
      const sent = this.pendingSends.get(payload.requestId)!
      if ((this.drafts.get(sent.roomId) || '') === sent.content) this.drafts.set(sent.roomId, '')
      if(sent.content.trim()&&this.replyTargets.get(sent.replyKey)===sent.replyTo)this.replyTargets.delete(sent.replyKey)
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
      if (this.state) this.state.notifications = this.mergeNotifications((payload.notifications || []).filter((n:MochiNotification)=>!this.associations.has(n.roomId)||this.associations.get(n.roomId)!.accountId===this.state?.accountId), payload.notificationRevisions || {})
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
    if (payload.type === 'mochi:error') { this.pendingNoteSave=undefined; if (this.requestVersion === this.selectionVersion) { this.error = String(payload.message); this.generationErrorRoom = payload.roomId || '' } }
    else {
      payload.state.rooms=payload.state.rooms.filter((r:MochiRoom)=>{const known=this.associations.get(r.id);return !known||(known.accountId===payload.state.accountId&&(r.associationRevision||0)>=known.revision)})
      payload.state.notifications=(payload.state.notifications||[]).filter((n:MochiNotification)=>{const known=this.associations.get(n.roomId);return !known||known.accountId===payload.state.accountId})
      const notifications = this.mergeNotifications(payload.state.notifications || [], Object.fromEntries(payload.state.rooms.map((r: MochiRoom) => [r.id, r.notificationRevision || 0])))
      for (const room of payload.state.rooms as MochiRoom[]) {
        const previous = this.state?.rooms.find(r => r.id === room.id && r.accountId === room.accountId)
        if (previous && (previous.associationRevision || 0) === (room.associationRevision || 0)) room.background = this.mergeScheduling(previous, room.background, room.revision)
      }
      this.state = { ...payload.state, notifications };this.personalSettings.load()
      if(this.operation==='mochi:pinned_content'&&this.pendingNoteSave){this.noteDrafts.delete(this.pendingNoteSave);this.pendingNoteSave=undefined}
      if(this.restoreRoom&&this.state&&this.state.accountId===this.activeAccountId){
        this.restoreRoom=false
        const last=this.lastRooms.get(this.state.accountId||'')
        this.roomId=last&&this.state.rooms.some(r=>r.id===last&&r.accountId===this.state?.accountId)?last:''
        if(!this.roomId)this.lastRooms.delete(this.state.accountId||'')
      }
      for (const [id, request] of this.ownGenerations) if (this.state && this.state.jobs?.[id] !== request) this.ownGenerations.delete(id)
      if (payload.selectedRoomId && this.requestVersion === this.selectionVersion) {
        this.creating = false; this.editing = this.settingsPage==='chat'; this.draft = null;this.settingsDraft=null
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
  renderDesktop(): HTMLDivElement {
    const page=el('div','mochi-view mochi-desktop')
    page.dataset.mode=this.pickerOpen||this.profilesOpen||!this.state?'account':this.creating||this.editing||this.notificationsOpen?'detail':this.roomId?'chat':'list'
    const sidebar=el('nav','mochi-desktop-list');sidebar.setAttribute('aria-label','Conversations')
    const heading=el('div','mochi-desktop-list-head'),branding=el('div','mochi-shell-brand')
    const wordmark=el('h2'),mascot=el('span','mochi-shell-mascot');wordmark.setAttribute('aria-label','Mochi');wordmark.append(mochiWordmark());mascot.innerHTML=MOCHI_SIDEBAR_ICON;mascot.setAttribute('aria-hidden','true');branding.append(wordmark,mascot);heading.append(branding)
    const account=this.profiles.state?.accounts.find(a=>a.id===this.state?.accountId)
    const identity=el('div','mochi-desktop-account',account?.displayName||(this.state?.accountId?'Selected profile':'Legacy chats'));identity.title=account?`Mochi fictional profile: ${account.displayName}`:this.state?.accountId?'Selected Mochi fictional profile':'Unassigned legacy conversations'
    let newChat:HTMLButtonElement|undefined,noticesButton:HTMLButtonElement|undefined
    if(this.state){
      const controls=this.inboxControls(),[change,profiles,create,notices]=Array.from(controls.querySelectorAll<HTMLButtonElement>(':scope > button'))
      for(const control of [change,profiles]){control.classList.add('mochi-icon-button');control.lastElementChild?.remove()}
      const dock=el('div','mochi-profile-dock');dock.dataset.compact=String(this.personalSettings.value.dock==='compact');dock.setAttribute('aria-label','Active fictional profile');const identityCopy=el('div'),switcher=el('select');switcher.setAttribute('aria-label','Switch fictional profile');for(const profile of this.profiles.state?.accounts.filter(a=>!a.archived)||[]){const option=el('option','',profile.displayName+(profile.username?' · @'+profile.username:''));option.value=profile.id;switcher.append(option)}if(!account){const option=el('option','','Unassigned legacy chats');option.value='';switcher.append(option)}switcher.value=this.state.accountId||'';switcher.onchange=()=>this.selectNavigationAccount(switcher.value||undefined,switcher,()=>this.redraw());identityCopy.append(switcher,el('small','mochi-dock-username',account?.username?'@'+account.username:'Fictional profile'));dock.append(portrait(account?.displayName||'?',account?.avatarUrl),identityCopy);identity.replaceChildren(dock)
      const accountRow=el('div','mochi-shell-account-row');accountRow.append(identity,profiles)
      create.setAttribute('aria-label','New Chat');create.title='New Chat';create.textContent='+ New Chat';newChat=create;noticesButton=notices
      heading.append(accountRow)
    }else heading.append(identity)
    const filter=el('input','mochi-conversation-filter');filter.type='search';filter.placeholder='Find a conversation';filter.setAttribute('aria-label','Find a conversation');filter.value=this.conversationFilter;filter.disabled=!this.state
    heading.append(filter)
    const views=el('div','mochi-conversation-filters');views.setAttribute('role','group');views.setAttribute('aria-label','Conversation filters')
    const viewButtons=new Map<string,HTMLButtonElement>()
    for(const [key,label] of [['all','All'],['groups','Groups']] as const){const control=button(label,'lp-button');control.setAttribute('aria-pressed',String(this.conversationView===key));control.onclick=()=>{this.conversationView=key;for(const [id,node]of viewButtons)node.setAttribute('aria-pressed',String(id===key));updateFilter()};viewButtons.set(key,control);views.append(control)}
    if(newChat)views.append(newChat);heading.append(views)
    const rooms=el('div','mochi-desktop-rooms');const unread=new Map<string,number>()
    for(const notice of this.state?.notifications||[])if(!notice.read)unread.set(notice.roomId,(unread.get(notice.roomId)||0)+1)
    for(const room of this.state?.rooms||[]){
      const row=button('','mochi-desktop-room');row.setAttribute('aria-label',`Open conversation: ${room.title}`)
      if(room.id===this.roomId)row.setAttribute('aria-current','true')
      const avatars=el('div','mochi-room-avatars')
      avatars.append(chatPortrait(room,this.state?.characters||[]))
      const copy=el('div','mochi-desktop-room-copy'),title=el('strong','',chatIdentity(room,this.state?.characters||[]).name);title.title='Chat name: '+room.title
      const last=room.messages.at(-1),preview=isDisplayMessage(last)?last.content?`${last.role==='user'?'You':last.name}: ${last.content.slice(0,160)}`:'Start a conversation':room.messages.length?'Message unavailable':'Start a conversation'
      copy.append(title,el('small','',preview.slice(0,180)));row.append(avatars,copy)
      const count=unread.get(room.id)||0
      row.dataset.hasUnread=String(count>0);row.dataset.group=String(room.characterIds.length>1)
      if(count){const badge=el('span','mochi-desktop-unread',String(count));badge.setAttribute('aria-label',`${count} unread notifications`);row.append(badge)}
      row.onclick=()=>this.exitPortal(()=>this.openRoom(room.id),row,room.id!==this.roomId)
      row.dataset.discovery=[room.title,...room.characterIds.map(id=>room.settings?.characterNames[id]||this.state?.characters.find(c=>c.id===id)?.name||'')].join(' ').toLocaleLowerCase()
      row.hidden=!row.dataset.discovery.includes(this.conversationFilter.toLocaleLowerCase())
      rooms.append(row)
    }
    if(this.state&&!this.state.rooms.length)rooms.append(el('p','mochi-muted','No conversations yet. Create a room to get started.'))
    const noMatches=el('p','mochi-muted','No matching conversations.');const updateFilter=()=>{let found=false;for(const row of rooms.querySelectorAll<HTMLElement>('.mochi-desktop-room')){row.hidden=!(row.dataset.discovery||'').includes(filter.value.toLocaleLowerCase())||(this.conversationView==='groups'&&row.dataset.group!=='true');found ||= !row.hidden}noMatches.hidden=found||!this.state?.rooms.length};filter.oninput=()=>{this.conversationFilter=filter.value;updateFilter()};rooms.append(noMatches);updateFilter()
    sidebar.append(heading,rooms)
    const main=el('section','mochi-desktop-main');main.setAttribute('aria-label','Conversation and settings')
    const back=el('div','mochi-desktop-back'),backButton=button('← Conversations');backButton.setAttribute('aria-label','Back to conversations')
    back.hidden=this.pickerOpen||!this.state
    backButton.onclick=()=>this.exitPortal(()=>{this.notificationsOpen=false;this.select('');this.redraw()},backButton,!!this.roomId);back.append(backButton)
    main.append(back,this.render('desktop'));if(main.querySelector('[data-preset-workspace=true]'))page.dataset.presetWorkspace='true';if(main.querySelector('[data-settings-workspace=true]'))page.dataset.settingsWorkspace='true'
    if(noticesButton&&!page.dataset.presetWorkspace&&!page.dataset.settingsWorkspace){const actions=main.querySelector('.mochi-room-header>.mochi-actions');if(actions){}else{const toolbar=el('div','mochi-shell-notifications');toolbar.append(noticesButton);main.prepend(toolbar)}}
    const style=el('style');style.textContent=MOCHI_DESKTOP_STYLES;page.append(sidebar,main,style)
    const selected=this.state?.rooms.find(room=>room.id===this.roomId)
    if(selected&&page.dataset.mode==='chat'&&!page.dataset.presetWorkspace&&!page.dataset.settingsWorkspace){
      page.dataset.details=String(this.desktopDetails)
      const toggle=main.querySelector<HTMLButtonElement>('[aria-label="Character profile"]')
      const setDetails=(open:boolean)=>{this.desktopDetails=open;page.dataset.details=String(open);toggle?.setAttribute('aria-expanded',String(open));if(open)page.querySelector<HTMLButtonElement>('[aria-label="Close character profile"]')?.focus();else toggle?.focus()}
      if(toggle){toggle.setAttribute('aria-controls',`mochi-room-details-${selected.id}`);toggle.setAttribute('aria-expanded',String(this.desktopDetails));toggle.onclick=()=>setDetails(!this.desktopDetails)}
      page.append(roomDetails(selected,this.state!.characters,()=>setDetails(false),()=>{setDetails(false);main.querySelector<HTMLButtonElement>('[aria-label="Settings"]')?.click()}))
    }
    return page
  }
  private inboxControls(): HTMLElement {
    const controls=el('div','mochi-inbox-actions')
    const change=action('Switch Mochi account','people');change.onclick=()=>{if(this.accountNavigation)this.accountNavigation.picker();else this.exitPortal(()=>this.showPicker(),change,true)};controls.append(change)
    const profiles=action(stateAccountLabel(this.state?.accountId),'profile');profiles.disabled=this.busy
    profiles.setAttribute('aria-label','Personal Settings');profiles.title='Personal Settings';profiles.onclick=()=>this.openSettings('personal',profiles);controls.append(profiles)
    const create=action('New chat','plus');create.disabled=this.busy;create.onclick=()=>this.exitPortal(()=>{this.creating=true;this.draft=null;this.refreshChoices();this.redraw()},create);controls.append(create)
    if(this.notificationPolicy().enabled){const notices=action('Mochi notifications','notifications',true),unread=this.state?.notifications?.filter(n=>!n.read).length||0;notices.title=`Mochi notifications · ${unread} unread`;notices.setAttribute('aria-description',`${unread} unread notifications`);notices.onclick=()=>this.exitPortal(()=>{this.leave();this.notificationsOpen=!this.notificationsOpen;this.redraw()},notices,true);controls.append(notices)}
    return controls
  }
  render(surface: 'all' | 'choices' | 'chat' | 'desktop' = 'all', configure: () => void = () => {}): HTMLDivElement {
    if (this.destroyed) return el('div', 'mochi-view')
    // Refresh only status attributes/text between renders, preserving composer focus and drafts.
    const page = el('div', 'mochi-view')
    page.dataset.surface = surface
    if (surface !== 'choices') this.presenceRoot=page
    if(this.settingsReturnFocus){this.settingsReturnFocus=false;queueMicrotask(()=>{const target=Array.from(page.querySelectorAll<HTMLElement>('[aria-label]')).find(n=>n.getAttribute('aria-label')===this.settingsInvoker&&!n.closest('[hidden]'));(target||page.querySelector<HTMLElement>('[aria-label="Room options"]'))?.focus({preventScroll:true})})}
    const style = el('style')
    style.textContent = MOCHI_STYLES+MOCHI_REPLY_STYLES+MOCHI_REACTION_STYLES+MOCHI_PIN_STYLES+MOCHI_SEARCH_STYLES+MOCHI_TEXTING_STYLES+MOCHI_PREVIEW_STYLES+MOCHI_PRESET_STYLES+MOCHI_PRESET_WORKSPACE_STYLES+MOCHI_MEMORY_STYLES+SETTINGS_WORKSPACE_STYLES+MOCHI_DISCLOSURE_STYLES
    page.append(style)
    const header = el('header'); const brand = el('div', 'mochi-brand')
    const wordmark = el('h2', 'mochi-wordmark'); wordmark.setAttribute('aria-label', 'Mochi')
    wordmark.append(mochiWordmark())
    brand.append(wordmark); header.append(brand)
    const headerActions = el('div', 'mochi-actions')
    if (surface !== 'chat' && surface !== 'desktop' && this.notificationPolicy().enabled && !this.pickerOpen && !this.profilesOpen) {
      const bell = action('Mochi notifications', 'notifications', true); const unread = this.state?.notifications?.filter(n => !n.read).length || 0; bell.dataset.unread = String(unread > 0); bell.title = `Mochi notifications · ${unread} unread`; if (unread) bell.append(el('span', 'mochi-unread-count', String(unread)))
      bell.onclick = () => this.confirmGenerationExit(() => { this.leave(); this.notificationsOpen = !this.notificationsOpen; this.redraw(); if (!this.state) this.load() },bell); headerActions.append(bell)
      bell.setAttribute('aria-description', `${unread} unread notifications`)
    }
    header.append(headerActions); if(surface!=='desktop')page.append(header)
    if (surface === 'chat' && (!this.state?.rooms.some(room => room.id === this.roomId) || this.pickerOpen || this.profilesOpen)) {
      page.append(el('p', 'mochi-muted', 'Choose a conversation in the Pocket portal.'))
      const choose = action('Choose conversation', 'back'); choose.onclick = configure; page.append(choose); return page
    }
    if (this.error) {
      const error = el('p', 'mochi-error', this.error); error.setAttribute('role', 'alert'); page.append(error)
      if (this.error === GENERATION_ERROR_MESSAGES.connection && this.roomId && !this.editing) {
        const choose = action('Choose connection', 'settings')
        choose.onclick = () => {this.openSettings('chat',choose);this.settingsLayout.category='Advanced';this.redraw()}
        page.append(choose)
      }
    }
    if(this.profilesOpen){page.append(this.profiles.render(this.busy,(type,input)=>this.dispatch(type,input),()=>this.redraw(),()=>{this.profilesOpen=false;this.redraw()},(next,anchor)=>this.confirmNavigation(next,anchor),()=>this.refreshChoices()));return page}
    if(this.pickerOpen&&surface==='desktop'&&this.accountNavigation){page.append(el('p','mochi-muted',this.busy?'Loading selected account…':'Choose a Mochi account in the Pocket sidebar.'));return page}
    if(this.pickerOpen){page.append(accountPicker(this.profiles.state,this.busy,id=>this.chooseAccount(id),()=>{this.profiles.start();this.profilesOpen=true;this.refreshChoices();this.redraw()},()=>{this.leave();this.resetScope();this.pickerOpen=false;this.load()},preference=>this.dispatch('mochi:account_startup',{preference,revision:this.profiles.state?.revision}),()=>{this.profilesOpen=true;this.profiles.draft=null;this.redraw()},()=>this.dispatch('mochi:accounts')));return page}
    if (!this.state) return page
    if (this.feedback) { const status = el('p', 'mochi-muted', this.feedback); status.setAttribute('role', 'status'); page.append(status) }
    for (const warning of this.state.warnings) page.append(el('p', 'mochi-error', warning))
    if (surface !== 'chat' && this.notificationsOpen && this.notificationPolicy().enabled) { page.append(this.notificationList()); return page }
    const room = this.state.rooms.find(room => room.id === this.roomId)
    if(room&&surface!=='choices'&&(this.presetPanel.open||this.preview.open||(this.memoryPanel.open&&this.settingsPage))){this.preview.sync(room);page.replaceChildren(style,this.presetPanel.open?this.presetPanel.render(room):this.memoryPanel.open?this.memoryPanel.render(room):this.preview.render(room));page.dataset.presetWorkspace='true';page.dataset.conversation='true';return page}
    if(this.settingsPage&&surface!=='choices'){page.replaceChildren(style,this.renderSettings(room));page.dataset.settingsWorkspace='true';page.dataset.conversation='true';return page}
    if (surface !== 'chat' && (this.creating || this.editing)) { page.append(this.form(this.editing ? room : undefined)); return page }
    if (room && surface !== 'choices') {
      const roomHeader = el('div', 'mochi-room-header')
      const info = el('div', 'mochi-room-info'), selector = el('select', 'mochi-room-selector'); selector.setAttribute('aria-label', 'Select chat')
      for (const r of this.state.rooms) { const option = el('option', '', r.title); option.value = r.id; selector.append(option) }; selector.value = room.id
      selector.onchange = () => {const target=selector.value;selector.value=room.id;this.confirmNavigation(()=>this.openRoom(target),selector,target!==room.id)}
      selector.title = room.title
      const roomSelector = el('div', 'mochi-room-select')
      const groupIcon = el('span', 'mochi-room-select-icon'); groupIcon.setAttribute('aria-hidden', 'true'); groupIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/></svg>'
      roomSelector.append(groupIcon, selector)
      const statuses = room.characterIds.map(id=>statusFor(room,id)), online = statuses.filter(s=>s==='online').length
      const roomMeta = el('p', 'mochi-room-meta', `${room.characterIds.length} ${room.characterIds.length === 1 ? 'participant' : 'participants'} · ${online ? 'active now' : statuses.every(s=>s==='offline') ? 'offline' : 'replies delayed'}`)
      roomMeta.dataset.status = online ? 'online' : statuses.includes('away') ? 'away' : statuses.includes('dnd') ? 'dnd' : 'offline'
      roomMeta.title = room.characterIds.map((id,i)=>`${room.settings?.characterNames[id] || this.state?.characters.find(c=>c.id===id)?.name || id}: ${statuses[i]}`).join('\n')
      if(surface==='desktop'){const title=el('h3','mochi-conversation-title',chatIdentity(room,this.state.characters).name);title.title=chatIdentity(room,this.state.characters).name;const copy=el('div','mochi-header-copy');copy.append(title,roomMeta);if(room.characterIds.length===1)copy.append(el('small','mochi-chat-name','Chat name: '+room.title));info.append(chatPortrait(room,this.state.characters),copy)}else info.append(roomSelector, roomMeta)
      const controls = el('div', 'mochi-actions')
      const inbox = action('Chat inbox', 'back', true); inbox.onclick = () => this.confirmNavigation(() => { this.select(''); this.navigate() },inbox,true)
      const openSettings = () => this.openSettings('chat',more)
      const menu=el('details','lp-conversation-menu'), more=el('summary','lp-nav-action')
      more.setAttribute('aria-label','Room options');more.title='Room options';const moreIcon=el('span');moreIcon.setAttribute('aria-hidden','true');moreIcon.innerHTML=MOCHI_TOOLBAR_ICONS.ellipsis;more.append(moreIcon)
      const menuSheet=el('div','lp-conversation-menu-sheet')
      const menuAction=(label:string,callback:()=>void)=>{const item=button(label,'lp-conversation-menu-action');item.setAttribute('aria-label',label);item.addEventListener('click',()=>{menu.open=false;callback()});return item}
      menuSheet.append(menuAction('Participants',()=>{const members=el('div','mochi-participants');for(const id of room.characterIds){const c=this.state?.characters.find(c=>c.id===id),name=room.settings?.characterNames[id]||c?.name||'Unavailable character';const row=el('div','mochi-member');row.append(portrait(name,c?.avatarUrl),el('span','',name));members.append(row)}this.sheet(roomHeader,'Room participants',members);members.closest('dialog')?.addEventListener('close',()=>{if(more.isConnected)more.focus()},{once:true})}),menuAction('Settings',openSettings))
      menuSheet.append(menuAction('Pins & Notes',()=>this.openPins(roomHeader,room)))
      menuSheet.append(menuAction('Conversation Memory',()=>{this.preview.reset();this.search.reset();this.presetPanel.reset();this.memoryPanel.show(room);this.presenceRoot?.querySelector<HTMLButtonElement>('[aria-label="Conversation Memory"] button')?.focus()}))
      menuSheet.append(menuAction('Presets',()=>this.confirmGenerationExit(()=>{this.memoryPanel.reset();this.preview.reset();this.search.reset();this.presetPanel.show(room);this.presenceRoot?.querySelector<HTMLButtonElement>('[aria-label="Mochi presets"] button')?.focus()},more,true)))
      const openSearch=()=>this.confirmGenerationExit(()=>{this.memoryPanel.reset();this.presetPanel.reset();this.preview.reset();this.search.show(room);this.presenceRoot?.querySelector<HTMLInputElement>('[aria-label="Search conversation text"]')?.focus()},more,true)
      menuSheet.append(menuAction('Search conversation',openSearch),menuAction('Personal Settings',()=>this.openSettings('personal',more)))
      if(this.notificationPolicy().enabled)menuSheet.append(menuAction('Mochi notifications',()=>this.exitPortal(()=>{this.leave();this.notificationsOpen=true;this.redraw()},more,true)))
      menuSheet.append(menuAction('Preview AI prompt',()=>this.confirmGenerationExit(()=>{this.memoryPanel.reset();this.presetPanel.reset();this.search.reset();this.preview.show(room);this.presenceRoot?.querySelector<HTMLSelectElement>('[aria-label="Preview scenario"]')?.focus()},more,true)))
      menu.append(more,menuSheet)
      menu.addEventListener('toggle',()=>{
        if(!menu.open)return
        const rect=controls.getBoundingClientRect(),height=document.documentElement.clientHeight
        const below=height-rect.bottom-8,above=rect.top-8,up=below<Math.min(300,menuSheet.scrollHeight)&&above>below
        menu.dataset.direction=up?'up':'down'
        menuSheet.style.maxHeight=`${Math.max(0,Math.min(300,up?above:below))}px`
      })
      menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;more.focus();event.stopPropagation()}})
      menu.addEventListener('focusout',event=>{if(!event.relatedTarget||!menu.contains(event.relatedTarget as Node))menu.open=false})
      controls.classList.add('mochi-custom-toolbar');controls.dataset.presentation=this.personalSettings.value.presentation
      const preferences=this.personalSettings.value,route:Record<ToolbarAction,string>={search:'Search conversation',participants:'Participants',notifications:'Mochi notifications',settings:'Settings',presets:'Presets',memory:'Conversation Memory',preview:'Preview AI prompt',notes:'Pins & Notes'}
      const icons:Record<ToolbarAction,string>={search:'search',participants:'people',notifications:'notifications',settings:'sliders',presets:'layers',memory:'bookmark',preview:'eye',notes:'pin'}
      for(const key of preferences.order){if(preferences.hidden.includes(key))continue;const original=Array.from(menuSheet.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===route[key]);if(!original)continue;const shortcut=action(TOOLBAR_LABELS[key],icons[key],true);shortcut.title=TOOLBAR_LABELS[key];if(preferences.presentation==='labels')shortcut.append(el('span','mochi-toolbar-label',key==='settings'?'Settings':TOOLBAR_LABELS[key]));shortcut.onclick=()=>key==='settings'?this.openSettings('chat',shortcut):original.click();controls.append(shortcut)}
      if(surface==='desktop'){const details=action('Character profile','panel',true);controls.append(details)}
      const rail=el('div','mochi-toolbar-shortcuts');rail.setAttribute('aria-label','Conversation shortcuts');rail.append(...Array.from(controls.children));controls.append(rail,menu); roomHeader.append(info, controls); page.append(roomHeader)
      if (surface === 'chat') roomHeader.classList.add('mochi-chat-heading')
      else headerActions.prepend(inbox)
      if(surface==='desktop')page.dataset.conversation='true'
      this.search.sync(room)
      this.preview.sync(room)
      if(this.memoryPanel.open)page.append(this.memoryPanel.render(room))
      if(this.presetPanel.open)page.append(this.presetPanel.render(room))
      if(this.preview.open)page.append(this.preview.render(room))
      if(this.search.open)page.append(this.search.render(room))
      page.append(this.thread(room,surface==='desktop'), this.composer(room))
      return page
    }
    if (this.roomId && !room) page.append(el('p', 'mochi-error', 'This room is unavailable. Refresh or select another room.'))
    if(surface==='desktop'){page.append(el('p','mochi-card',this.state.rooms.length?'Select a conversation to start messaging.':'Create your first conversation from the list.'));return page}
    page.append(el('p', 'mochi-muted', 'Your chats and characters.'))
    const inboxActions=el('div','mochi-inbox-actions');page.append(inboxActions)
    const change=action('Switch Mochi account','people');change.onclick=()=>this.showPicker();inboxActions.append(change)
    const profiles=action(stateAccountLabel(this.state.accountId),'profile');profiles.disabled=this.busy;profiles.onclick=()=>{this.leave();this.profilesOpen=true;const current=this.profiles.state?.accounts.find(a=>a.id===this.state?.accountId);if(current)this.profiles.start(current);else this.profiles.draft=null;this.dispatch('mochi:accounts')};inboxActions.append(profiles)
    const create = action('New chat', 'plus'); create.classList.add('mochi-primary'); create.disabled = this.busy
    create.onclick = () => { this.creating = true; this.draft = null; this.refreshChoices(); this.redraw() }; inboxActions.append(create)
    if (!this.state.rooms.length) page.append(el('p', 'mochi-card', 'No rooms yet. Choose your characters and the identity you want to use.'))
    for (const room of this.state.rooms) {
      const row = button('', 'mochi-card')
      const avatars = el('div', 'mochi-room-avatars'); avatars.dataset.single = String(room.characterIds.length === 1)
      for (const id of room.characterIds.slice(0, 4)) { const c = this.state.characters.find(c => c.id === id); avatars.append(portrait(room.settings?.characterNames[id] || c?.name || '?', c?.avatarUrl)) }
      const copy = el('div', 'mochi-card-copy'); copy.append(el('strong', '', room.title), el('span', 'mochi-muted', `${room.characterIds.length === 1 ? 'Direct room' : `${room.characterIds.length} characters`} · ${room.persona.name}`))
      const last = room.messages.at(-1) as MochiMessage | undefined
      copy.append(el('span', 'mochi-preview', last?.content ? `${last.name}: ${last.content}` : 'Start a conversation'))
      row.append(avatars, copy)
      if (room.id === this.roomId) row.setAttribute('aria-current', 'true')
      row.onclick = () => this.openRoom(room.id); page.append(row)
    }
    return page
  }
  private openSettings(page:'chat'|'personal',anchor:HTMLElement):void {
    if(!this.settingsPage)this.settingsInvoker=anchor.getAttribute('aria-label')||'Room options'
    const open=()=>{if(!this.settingsPage){this.preview.reset();this.search.reset();this.presetPanel.reset();this.memoryPanel.reset();this.settingsLayout.reset();this.draft=null;this.settingsDraft=null}this.settingsPage=page;this.editing=Boolean(this.roomId);this.creating=false;this.personalSettings.load();this.refreshChoices();this.redraw()}
    if(this.settingsPage)open();else this.confirmGenerationExit(open,anchor,true)
  }
  private renderSettings(room?:MochiRoom):HTMLElement {
    const root=el('section','mochi-settings-workspace');root.setAttribute('aria-label','Mochi Settings')
    const head=el('div','mochi-settings-heading'),close=button(room?'Return to conversation':'Return to conversations');head.append(el('h3','','Mochi Settings'),close)
    close.onclick=()=>this.confirmNavigation(()=>{this.settingsPage='';this.editing=false;this.draft=null;this.settingsDraft=null;this.personalSettings.discard();this.settingsReturnFocus=true;this.redraw()},close)
    const tabs=el('nav','mochi-settings-tabs');tabs.setAttribute('aria-label','Settings workspace')
    for(const [key,label]of [['chat','Chat'],['personal','Personal']] as const){const tab=button(label);tab.setAttribute('aria-pressed',String(this.settingsPage===key));tab.disabled=key==='chat'&&!room;tab.onclick=()=>{this.settingsPage=key;this.personalSettings.load();this.redraw()};tabs.append(tab)}
    root.append(head,tabs,el('p','mochi-muted',this.settingsPage==='chat'?'This conversation · Save settings applies staged edits and may stop pending replies. Actions marked “applies now” are immediate.':'This fictional profile · Profile edits and presentation each have their own explicit Save. Your Lumiverse login stays unchanged.'))
    if(this.error){const error=el('p','mochi-error',this.error);error.setAttribute('role','alert');root.append(error)}
    if(this.settingsPage==='chat'&&room)root.append(this.form(room))
    else{
      const body=el('div','mochi-personal-scroll'),account=this.profiles.state?.accounts.find(a=>a.id===this.state?.accountId)
      const savedScroll=this.personalScroll;body.onscroll=()=>{this.personalScroll=body.scrollTop};queueMicrotask(()=>{if(body.isConnected)body.scrollTop=savedScroll})
      body.append(el('h4','',account?.displayName||'Legacy conversation identity'),el('p','mochi-muted','Fictional profile · Persona, avatar, username and native add-on selections are managed in the existing profile editor. Native Lumiverse theme and real-login preferences stay in Lumiverse.'))
      const manage=button('Manage fictional profile & persona add-ons');manage.onclick=()=>{if(this.accountNavigation)this.accountNavigation.settings(manage);else this.exitPortal(()=>{this.profilesOpen=true;this.profiles.start(account);this.dispatch('mochi:accounts')},manage)}
      const choose=button('Switch fictional profile');choose.onclick=()=>{if(this.accountNavigation)this.accountNavigation.picker();else this.showPicker()};const presentation=this.personalSettings.render(),actions=presentation.querySelector('.mochi-presentation-actions');body.append(manage,choose,presentation);root.append(body);if(actions)root.append(actions)
    }
    root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!root.querySelector('dialog[open]')){event.stopPropagation();close.click()}})
    return root
  }
  private restoreToolFocus():void{if(!this.settingsPage){this.presenceRoot?.querySelector<HTMLElement>('[aria-label="Room options"]')?.focus();return}queueMicrotask(()=>{const root=this.presenceRoot;if(this.settingsPage&&this.toolFocus)Array.from(root?.querySelectorAll<HTMLButtonElement>('button')||[]).find(b=>b.textContent===this.toolFocus)?.focus({preventScroll:true});else root?.querySelector<HTMLElement>('[aria-label="Room options"]')?.focus()})}
  private openSettingsTool(name:string,anchor:HTMLElement,room:MochiRoom):void {
    this.toolFocus=name
    if(name==='Presets')this.presetPanel.show(room)
    else if(name==='Preview AI prompt')this.preview.show(room)
    else if(name==='Conversation Memory')this.memoryPanel.show(room)
    else this.openPins(anchor,room)
    this.redraw()
  }
  private form(room?: MochiRoom): HTMLFormElement {
    const state = this.state!
    const freshDraft = !this.draft
    if (freshDraft) this.draftRevision = room?.revision || 0
    this.draft ||= { groupIcon:room?.groupIcon||'', title: room?.title || '', characterIds: [...room?.characterIds || []], persona: room ? 'keep' : 'manual', name: room?.persona.name || 'You', description: room?.persona.description || '', ...(!room?{presetId:DEFAULT_V2_PRESET_ID}:{}) }
    const draft = this.draft
    this.settingsDraft ||= structuredClone(room?.settings || defaultMochiSettings())
    const settings = this.settingsDraft
    if (freshDraft) this.formBaseline = JSON.stringify([draft,settings])
    const form = el('form', 'mochi-form'); form.append(el('h3', '', room ? 'Chat settings' : 'New chat'))
    let group: HTMLElement = form
    const section = (title: string, collapsed = false) => { const node=el(collapsed?'details':'fieldset','mochi-settings-section');node.append(el(collapsed?'summary':'legend','',title));if(collapsed){const details=node as HTMLDetailsElement;details.open=this.settingsSections.has(title);details.ontoggle=()=>{if(details.open)this.settingsSections.add(title);else this.settingsSections.delete(title)}}form.append(node);group=node;return node }
    section('Conversation')
    const field = (label: string, input: HTMLElement) => { input.setAttribute('aria-label', label); const node = el('label', input.tagName === 'INPUT' && (input as HTMLInputElement).type === 'checkbox' ? 'mochi-toggle' : '', label); node.append(input); group.append(node) }
    const title = el('input'); title.required = true; title.maxLength = 120; title.value = draft.title
    title.oninput = () => { draft.title = title.value }; field('Chat name', title)
    if(!room){const preset=el('select');for(const [id,name]of [[DEFAULT_V2_PRESET_ID,'Mochi Default v2'],[DEFAULT_PRESET_ID,'Mochi Default (legacy)']]){const option=el('option','',name);option.value=id;preset.append(option)}preset.value=draft.presetId||DEFAULT_V2_PRESET_ID;preset.onchange=()=>{draft.presetId=preset.value};field('Initial preset',preset)}
    const picker = el('div', 'mochi-picker'); picker.setAttribute('role', 'group'); picker.setAttribute('aria-label', 'Chat characters')
    for (const character of state.characters) {
      const choice = button('', 'mochi-choice')
      choice.append(portrait(character.name, character.avatarUrl))
      choice.append(el('span', '', character.name)); choice.setAttribute('aria-pressed', String(draft.characterIds.includes(character.id)))
      choice.onclick = () => { draft.characterIds = draft.characterIds.includes(character.id) ? draft.characterIds.filter(id => id !== character.id) : [...draft.characterIds, character.id]; choice.setAttribute('aria-pressed', String(draft.characterIds.includes(character.id))) }
      picker.append(choice)
    }
    group.append(el('p', 'mochi-muted', 'Choose 1–12 characters'), picker)
    const groupIconField=el('select');for(const value of ['',...GROUP_ICONS]){const option=el('option','',value||'Automatic member portraits');option.value=value;groupIconField.append(option)}groupIconField.value=draft.groupIcon||'';groupIconField.onchange=()=>{draft.groupIcon=groupIconField.value};field('Group icon',groupIconField)
    const groupIconLabel=groupIconField.closest('label')!;groupIconLabel.hidden=draft.characterIds.length<2
    picker.addEventListener('click',()=>{groupIconLabel.hidden=draft.characterIds.length<2})

    const persona = el('select')
    const option = (value: string, label: string) => { const o = el('option', '', label); o.value = value; persona.append(o) }
    if (room) option('keep', `Keep saved identity: ${room.persona.name}`)
    option('manual', 'Custom identity')
    state.personas.forEach(p => option(p.source+':'+p.sourceId, `${p.name} (${p.source === 'pocket' ? 'Pocket profile' : 'Lumiverse persona'})`))
    persona.value = draft.persona; persona.onchange = () => { draft.persona = persona.value; this.redraw() }
    if(!state.accountId)field('Your identity in this chat',persona)
    else group.append(el('p','mochi-muted',`Saved chat identity: ${room?.persona.name||this.profiles.state?.accounts.find(a=>a.id===state.accountId)?.displayName||'Account profile'}. Profile settings are separate from chat settings.`))
    if (draft.persona === 'manual'&&!state.accountId) {
      const name = el('input'); name.required = true; name.maxLength = 120; name.value = draft.name; name.oninput = () => { draft.name = name.value }; field('Your name', name)
      const description = el('textarea'); description.maxLength = 12000; description.rows = 3; description.value = draft.description; description.oninput = () => { draft.description = description.value }; field('Identity description', description)
    }
    if (room) {
      section('Connection & replies')
      const connection = el('select')
      const defaults = (state.connections || []).filter(c => c.isDefault)
      const fallback = defaults.length === 1 ? defaults[0] : undefined
      const empty = el('option', '', fallback ? `Use Lumiverse default · ${fallback.name}` : 'Use Lumiverse default (none available)'); empty.value = ''; connection.append(empty)
      for (const c of state.connections || []) { const o = el('option', '', `${c.name} · ${c.model}`); o.value = c.id; connection.append(o) }
      if(settings.connectionId&&!state.connections?.some(c=>c.id===settings.connectionId)){const missing=el('option','','Unavailable connection');missing.value=settings.connectionId;connection.append(missing)}
      connection.value = settings.connectionId; connection.onchange = () => { settings.connectionId = connection.value; delete settings.model; this.redraw() }; field('Generation connection', connection)
      const refresh=button('Refresh connections & personas','lp-button mochi-secondary-action');refresh.onclick=()=>this.refreshChoices();group.append(refresh)
      const effectiveConnection = settings.connectionId ? state.connections?.find(c => c.id === settings.connectionId) : fallback
      group.append(mochiModelPicker(effectiveConnection?.id||'',effectiveConnection?.model||'',settings.model||'',value=>{if(value)settings.model=value;else delete settings.model},this.modelChoices,this.modelControllers))
      const auto = el('input'); auto.type = 'checkbox'; auto.checked = settings.autoReply; auto.onchange = () => { settings.autoReply = auto.checked }; field('Reply automatically after sending', auto)
      const mode=el('select');if(settings.responseMode===undefined){const legacy=el('option','','Existing behavior');legacy.value='';mode.append(legacy)}
      for(const [value,label] of [['natural','Natural group chat'],['instant','Instant replies'],['manual','Manual']] as const){const option=el('option','',label);option.value=value;mode.append(option)}
      mode.value=settings.responseMode||'';mode.onchange=()=>{if(mode.value)settings.responseMode=mode.value as MochiSettings['responseMode'];else delete settings.responseMode};field('Response mode',mode)
      const nextResponder=el('select');for(const id of ['auto',...room.characterIds]){const option=el('option','',id==='auto'?'Automatic responder':state.characters.find(c=>c.id===id)?.name||id);option.value=id;nextResponder.append(option)}nextResponder.value=this.responders.get(room.id)||'auto';nextResponder.onchange=()=>this.responders.set(room.id,nextResponder.value);field('Next responder',nextResponder);group.append(el('p','mochi-muted','Next responder applies now for the next reply in this frontend session. It does not require Save or change the saved response mode.'));nextResponder.setAttribute('aria-description','This conversation · Next reply selection applies now in this frontend session; it does not change saved response mode.')
      auto.disabled=!!settings.responseMode
      group.append(el('p','mochi-muted','This conversation · Requires Save. Natural may choose silence or delayed replies; Instant requests an eligible reply; Manual disables automatic replies, while Continue still works. A selected mode controls automatic replies; Existing behavior uses the automatic-reply checkbox. Ordinary replies do not require idle/background autonomy.'))
      section('Background messaging',true).classList.add('mochi-disclosure')
      group.append(el('p','mochi-muted','Permission, presence and schedule actions apply now. AI timing/status suggestions require Save. Background autonomy is separate from ordinary replies to your messages.'))
      const accountBackground = el('input'); accountBackground.type = 'checkbox'; accountBackground.checked = !!state.backgroundEnabled; accountBackground.disabled = this.busy
      const aiBehavior = el('input'); aiBehavior.type='checkbox';aiBehavior.checked=!!settings.aiBehavior;aiBehavior.disabled=this.busy||(!settings.aiBehavior&&(!state.backgroundEnabled||!room.background?.enabled));aiBehavior.onchange=()=>{settings.aiBehavior=aiBehavior.checked};field('Allow AI delivery timing and status suggestions',aiBehavior)
      accountBackground.onchange = () => this.dispatch('mochi:background_account', { enabled: accountBackground.checked }); field('This Lumiverse login: allow background messaging (applies now)', accountBackground)
      accountBackground.setAttribute('aria-description','This Lumiverse login · Applies now across its fictional profiles. Does not enable ordinary automatic replies.')
      group.append(el('small','mochi-muted','This Lumiverse login: background permission applies across its fictional profiles. It is not a fictional-profile setting.'))
      const roomBackground = el('input'); roomBackground.type = 'checkbox'; roomBackground.checked = !!room.background?.enabled; roomBackground.disabled = this.busy
      roomBackground.onchange = () => this.dispatch('mochi:background_room', { roomId: room.id, revision: room.revision, enabled: roomBackground.checked }); field('This conversation: allow scheduled messages (applies now)', roomBackground)
      roomBackground.setAttribute('aria-description','This conversation · Applies now. Also requires permission for this Lumiverse login.')
      const idle=el('input');idle.type='checkbox';idle.checked=!!room.background?.idle?.enabled;idle.disabled=this.busy||(!idle.checked&&(!state.backgroundEnabled||!room.background?.enabled||settings.responseMode==='manual'));idle.onchange=()=>this.dispatch('mochi:idle',{roomId:room.id,revision:room.revision,enabled:idle.checked});field('Allow idle messages (3 per idle period, 90 minutes apart)',idle)
      if (state.backgroundEnabled && room.background?.enabled) {
        const due = el('input'); due.type = 'datetime-local'; due.value = this.schedulingTime.get(room.id) || ''; due.oninput = () => this.schedulingTime.set(room.id, due.value); field('Scheduled message time', due)
        const schedule = action('Schedule character message', 'plus'); schedule.type = 'button'; schedule.disabled = this.busy
        schedule.onclick = () => this.dispatch('mochi:schedule', { roomId: room.id, revision: room.revision, occurrenceId: requestId('scheduled'), dueAt: new Date(due.value).getTime(), responder: this.responders.get(room.id) || 'auto' })
        group.append(schedule)
      }
      this.schedulingRoot = this.scheduleList(room); group.append(this.schedulingRoot)
      section('Context & token limits',true)
      for (const [label, key] of [['Total token budget', 'contextTokens'], ['Maximum reply tokens', 'outputTokens']] as const) {
        const input = el('input'); input.type = 'number'; input.value = String(settings[key]); input.oninput = () => { settings[key] = Number(input.value) }; field(label, input)
      }
      const instructions = el('textarea'); instructions.maxLength = 6000; instructions.value = settings.instructions; instructions.oninput = () => { settings.instructions = instructions.value }; field('Room instructions', instructions)
      for (const id of room.characterIds) {
        const characterSection=section((state.characters.find(c=>c.id===id)?.name||id)+' · presence & room name',true);characterSection.dataset.characterId=id
        group.append(el('p','mochi-muted','Presence and schedule changes apply immediately.'))
        const presence = structuredClone(room.background?.presence?.[id] || defaultPresence()), baseName=state.characters.find(c=>c.id===id)?.name||id,name=baseName+(room.characterIds.filter(cid=>state.characters.find(c=>c.id===cid)?.name===baseName).length>1?' · character '+(room.characterIds.indexOf(id)+1):'')
        const setPresence = () => this.dispatch('mochi:presence',{roomId:room.id,revision:room.revision,characterId:id,presence})
        const status = el('select'); for (const s of STATUSES) { const option=el('option','',s==='dnd'?'DND':s[0].toUpperCase()+s.slice(1));option.value=s;status.append(option) }
        status.value=statusFor(room,id);status.disabled=this.busy;status.onchange=()=>{presence.manual=status.value as typeof presence.manual;setPresence()};field(`Status for ${name}`,status)
        const automatic=el('input');automatic.type='checkbox';automatic.checked=presence.manual===null;automatic.disabled=this.busy;automatic.onchange=()=>{presence.manual=automatic.checked?null:status.value as typeof presence.manual;setPresence()};field(`Automatic status for ${name}`,automatic)
        for (const [label,key] of [['Away delay (minutes)','awayMs'],['DND delay (minutes)','dndMs']] as const) {const delay=el('input');delay.type='number';delay.min='0';delay.max='1440';delay.value=String(presence[key]/60000);delay.disabled=this.busy;delay.onchange=()=>{presence[key]=Number(delay.value)*60000;setPresence()};field(`${label} for ${name}`,delay)}
        const next=el('select');for(const s of STATUSES){const option=el('option','',s==='dnd'?'DND':s);option.value=s;next.append(option)};field(`Scheduled status for ${name}`,next)
        const when=el('input');when.type='datetime-local';field(`Status change time for ${name}`,when)
        const plan=action(`Schedule status change for ${name}`,'plus');plan.type='button';plan.disabled=this.busy;plan.onclick=()=>{presence.transitions.push({at:new Date(when.value).getTime(),status:next.value as typeof presence.automatic});setPresence()};group.append(plan)
        if(presence.transitions.length){const clear=action(`Clear status schedule for ${name}`,'trash');clear.type='button';clear.disabled=this.busy;clear.onclick=()=>{presence.transitions=[];setPresence()};group.append(clear)}
        const input = el('input'); input.maxLength = 120; input.value = settings.characterNames[id] || ''; input.oninput = () => { settings.characterNames[id] = input.value }; field(`Display name for ${name}`, input)
        group.append(textingControls(settings,id,name))
      }
    }
    if(room){section('Chat ownership',true);group.append(this.assignmentControls(room))}
    const save = action(this.busy ? 'Saving…' : room ? 'Save settings' : 'Create chat', room ? 'settings' : 'plus'); save.classList.add('mochi-primary'); save.type = 'submit'; save.disabled = this.busy
    const cancel = action('Cancel', 'back'); cancel.disabled = this.busy; cancel.onclick = () => this.confirmNavigation(() => { this.creating = false; this.editing = false; this.draft = null; this.settingsDraft = null;this.settingsPage='';this.personalSettings.discard();this.settingsReturnFocus=true; this.redraw() },cancel)
    const actions = el('div', 'mochi-actions'); actions.append(save, cancel); form.append(actions)
    form.onsubmit = event => {
      event.preventDefault()
      const selected = state.accountId ? undefined : draft.persona === 'keep' ? undefined : draft.persona === 'manual' ? { source: 'manual', name: draft.name, description: draft.description } : state.personas.find(p=>p.source+':'+p.sourceId===draft.persona)
      this.dispatch(room ? 'mochi:update' : 'mochi:create', { roomId: room?.id, revision: room ? this.draftRevision : undefined, title: draft.title, groupIcon:draft.characterIds.length>1?draft.groupIcon||'':'', characterIds: draft.characterIds, persona: selected, ...(room ? { settings } : {preset:{id:draft.presetId,revision:1,...(state.accountId?{accountId:state.accountId}:{})}}) })
    }
    return room&&this.settingsPage==='chat'?this.settingsLayout.adapt(form,room,state,()=>this.redraw(),(name,anchor)=>this.openSettingsTool(name,anchor,room)):form
  }
  private scheduleList(room: MochiRoom): HTMLElement {
    const list = el('section'); list.setAttribute('aria-label', 'Scheduled opportunities'); list.setAttribute('aria-live', 'polite')
    for (const job of room.background?.jobs || []) {
      const row = el('div', 'mochi-actions'); row.dataset.scheduleId = job.id; row.dataset.status = job.status
      const times = [`Due ${new Date(job.dueAt).toLocaleString()}`, ...(job.deliverAt ? [`Delivery ${new Date(job.deliverAt).toLocaleString()}`] : []), ...(job.expiresAt ? [`Expires ${new Date(job.expiresAt).toLocaleString()}`] : [])]
      row.append(el('small', 'mochi-muted', `${SCHEDULE_LABELS[job.status]} · ${times.join(' · ')}${job.reason ? ` · ${job.reason}` : ''}`))
      if (!TERMINAL.has(job.status)) {
        const cancelJob = action('Cancel scheduled message', 'close'); cancelJob.type = 'button'; cancelJob.disabled = this.busy
        cancelJob.onclick = () => this.dispatch('mochi:schedule_cancel', { roomId: room.id, occurrenceId: job.id }); row.append(cancelJob)
      }
      list.append(row)
    }
    return list
  }
  private assignmentControls(room:MochiRoom):HTMLElement{
    const section=el('section','mochi-assignment mochi-form');section.append(el('h4','','Chat ownership'),el('p','mochi-muted',`Saved identity: ${room.persona.name}. Assignment keeps this snapshot, all messages and all schedules.`))
    if(!this.profiles.state){const load=action('Load profiles for assignment','people');load.type='button';load.disabled=this.busy;load.onclick=()=>this.dispatch('mochi:accounts');section.append(load);return section}
    const select=el('select');select.setAttribute('aria-label','Assign chat to Mochi account');const empty=el('option','','Choose destination account');empty.value='';select.append(empty)
    for(const a of this.profiles.state.accounts.filter(a=>!a.archived&&a.id!==room.accountId)){const option=el('option','',a.displayName+(a.username?' · @'+a.username:''));option.value=a.id;select.append(option)}
    const confirm=el('input');confirm.type='checkbox';confirm.setAttribute('aria-label','Keep saved persona and all chat data');const label=el('label','mochi-toggle','Keep saved persona and all chat data');label.append(confirm)
    const assign=action(room.accountId?'Reassign chat':'Assign legacy chat','people');assign.type='button';assign.disabled=true
    const update=()=>{assign.disabled=this.busy||!select.value||!confirm.checked};select.onchange=update;confirm.onchange=update
    assign.onclick=()=>this.dispatch('mochi:room_assign',{roomId:room.id,revision:room.revision,associationRevision:room.associationRevision||0,targetAccountId:select.value,confirmed:confirm.checked,preservePersona:confirm.checked})
    section.append(select,label,assign);return section
  }
  private thread(room: MochiRoom, desktop = false): HTMLDivElement {
    const thread = el('div', 'mochi-thread'); thread.setAttribute('role', 'log'); thread.setAttribute('aria-label', 'Room messages')
    thread.dataset.pocketThread = 'mochi'
    thread.dataset.roomId=room.id
    if(desktop)thread.tabIndex=0
    else globalThis.requestAnimationFrame?.(() => { thread.scrollTop = thread.scrollHeight })
    const limit=this.desktopHistory.get(room.id)||100
    const visible=desktop?room.messages.slice(-limit):room.messages
    if(desktop){const first=visible[0];thread.dataset.firstMessageId=isDisplayMessage(first)?first.id:'';if(room.messages.length>limit){const earlier=button('Show earlier messages','lp-button');earlier.onclick=()=>{this.desktopHistory.set(room.id,limit+100);this.redraw()};thread.append(earlier)}}
    let previous: DisplayMessage | undefined
    for (const raw of visible) {
      if(!isDisplayMessage(raw)){thread.append(el('p','mochi-message-unavailable','Message unavailable. Saved record preserved.'));previous=undefined;continue}
      const message = raw
      const row = el('div', 'mochi-message'); row.dataset.role = message.role
      row.tabIndex=-1
      row.dataset.messageId = message.id
      const elapsed = previous ? Date.parse(message.createdAt) - Date.parse(previous.createdAt) : Infinity
      row.dataset.grouped = String(Boolean(previous && previous.role === message.role && previous.characterId === message.characterId && previous.name === message.name && elapsed >= 0 && elapsed < 300000))
      previous = message
      const avatar = el('span', 'mochi-message-avatar', message.name?.slice(0, 1) || '?')
      if (message.avatarUrl) { const image = el('img'); image.src = message.avatarUrl; image.alt = ''; avatar.replaceChildren(image) }
      const avatarFrame = el('span', 'mochi-avatar-frame'); avatarFrame.append(avatar)
      if (message.role === 'assistant') { const dot = el('span', 'mochi-presence-dot'); dot.dataset.characterId=message.characterId||'';dot.dataset.status = statusFor(room,message.characterId || ''); dot.setAttribute('aria-hidden', 'true'); dot.title = `Character status: ${dot.dataset.status}`; avatarFrame.append(dot) }
      const body = el('div', 'mochi-message-body')
      const time = el('time', '', new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); time.dateTime = message.createdAt
      const displayName = message.role === 'user' ? 'You' : message.name || 'Unknown'
      const name = el('strong', 'mochi-message-name', displayName); name.title = message.name || 'Unknown'
      row.setAttribute('aria-label', `Message from ${displayName}`)
      const heading = el('div', 'mochi-message-heading'); heading.append(name, time)
      const meta = el('div', 'mochi-message-meta')
      const more = action(`Actions for ${displayName}`, 'more', true); more.classList.add('mochi-message-actions'); more.onclick = () => this.messageActions(more, room, message)
      const bubble = el('div', 'mochi-bubble', message.content || '')
      if (message.editedAt) { bubble.title = `Edited ${new Date(message.editedAt).toLocaleString()}`; bubble.setAttribute('aria-description', bubble.title) }
      if(room.chatPins?.includes(message.id)){const pinned=el('span','mochi-pin-indicator','Pinned');pinned.setAttribute('aria-label','Pinned chat message');heading.append(pinned)}
      meta.append(more);body.append(heading);if(message.replyTo!==undefined)body.append(this.quoteNode(room,message.replyTo,true));body.append(bubble)
      try{
        const reactions=readReactions('reactions'in raw?raw.reactions:undefined,room),chips=el('div','mochi-reactions')
        for(const emoji of REACTION_EMOJI){const actors=reactions.filter(r=>r.emoji===emoji);if(!actors.length)continue
          const selected=actors.some(r=>r.actor==='user'&&r.actorId===(room.accountId||'legacy')),chip=button(`${emoji} ${actors.length}`,'mochi-reaction')
          chip.type='button';chip.title=actors.map(r=>r.name+(r.actor==='character'?' (character)':' (profile)')).join(', ');chip.setAttribute('aria-label',`${selected?'Remove your':'Add your'} ${REACTION_NAMES[emoji]} reaction. ${chip.title}`);chip.setAttribute('aria-pressed',String(selected));chip.disabled=this.busy||Boolean(this.state?.jobs?.[room.id]);chip.onclick=()=>this.dispatch('mochi:reaction',{roomId:room.id,revision:room.revision,messageId:message.id,emoji});chips.append(chip)
        }
        body.append(chips)
      }catch{body.append(el('small','mochi-muted','Reactions unavailable. Saved records preserved.'))}
      body.append(meta)
      row.append(avatarFrame, body); thread.append(row)
    }
    if (this.state?.jobs?.[room.id]) { const status = el('p', 'mochi-muted', 'Character is replying…'); status.setAttribute('role', 'status'); thread.append(status) }
    return thread
  }
  private sheet(anchor: HTMLElement, title: string, content: HTMLElement): ReturnType<typeof showPocketSheet> {
    // Keep confirmations alive when metadata refresh replaces the inner view.
    const sheet = showPocketSheet(anchor, title, content, anchor.closest<HTMLElement>('.mochi-workspace') || this.presenceRoot?.closest<HTMLElement>('.mochi-workspace') || undefined)
    if (sheet) { this.sheets.add(sheet.dismiss); content.closest('dialog')?.classList.add('mochi-sheet'); content.closest('dialog')?.addEventListener('close', () => {this.sheets.delete(sheet.dismiss);if(!anchor.isConnected)Array.from(this.presenceRoot?.querySelectorAll<HTMLButtonElement>('button')||[]).find(b=>anchor.getAttribute('aria-label')?b.getAttribute('aria-label')===anchor.getAttribute('aria-label'):b.textContent===anchor.textContent)?.focus({preventScroll:true})}, { once: true }) }
    return sheet
  }
  private openPins(anchor:HTMLElement,room:MochiRoom):void {
    const key=this.replyKey(room)
    let sheet:ReturnType<typeof showPocketSheet>
    const content=pinsPanel(room,{
      draft:this.noteDrafts.get(key),setDraft:draft=>{if(draft)this.noteDrafts.set(key,draft);else this.noteDrafts.delete(key)},
      unavailable:this.busy||Boolean(this.state?.jobs?.[room.id]),
      mutate:(values,saveDraft)=>{if(this.busy)return;this.pendingNoteSave=saveDraft?key:undefined;this.dispatch('mochi:pinned_content',{roomId:room.id,revision:room.revision,...values});sheet?.dismiss()},
      jump:id=>{sheet?.dismiss();const quote=this.quoteNode(room,id,true);(quote as HTMLButtonElement).click()}
    })
    sheet=this.sheet(anchor,'Pins & Notes',content)
  }
  private messageActions(anchor: HTMLElement, room: MochiRoom, message: DisplayMessage): void {
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
      content.replaceChildren(label, el('p', 'mochi-muted', 'Later messages stay unchanged. The previous text is retained in room storage.'), save); input.focus()
    }
    const remove = action('Delete message', 'trash'); remove.disabled = this.busy; remove.onclick = () => {
      const confirm = action('Confirm delete', 'trash'); confirm.onclick = () => { this.dispatch('mochi:message_action', { roomId: room.id, revision, messageId: message.id, action: 'delete', confirmed: true }); sheet?.dismiss() }
      content.replaceChildren(el('p', '', 'Delete this saved message? Only this message and its prior versions will be removed. Later messages stay unchanged. This cannot be undone.'), confirm)
    }
    const reply=action('Reply','back');reply.onclick=()=>{this.replyTargets.set(this.replyKey(room),message.id);sheet?.dismiss();this.redraw();const root=this.presenceRoot;root?.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')?.focus({preventScroll:true})}
    const react=action('React','more');react.disabled=this.busy||Boolean(this.state?.jobs?.[room.id]);react.onclick=()=>{
      const palette=el('div','mochi-reaction-palette');palette.setAttribute('aria-label','Common emoji reactions')
      let selected:string[]=[];try{selected=readReactions('reactions'in message?message.reactions:undefined,room).filter(r=>r.actor==='user'&&r.actorId===(room.accountId||'legacy')).map(r=>r.emoji)}catch{/* Backend preserves unsupported records. */}
      for(const emoji of REACTION_EMOJI){const choice=button(emoji,'mochi-reaction');choice.type='button';choice.setAttribute('aria-label',`Toggle ${REACTION_NAMES[emoji]} reaction`);choice.setAttribute('aria-pressed',String(selected.includes(emoji)));choice.onclick=()=>{this.dispatch('mochi:reaction',{roomId:room.id,revision,messageId:message.id,emoji});sheet?.dismiss()};palette.append(choice)}content.replaceChildren(palette);palette.querySelector<HTMLButtonElement>('button')?.focus()
    }
    const pinned=room.chatPins?.includes(message.id)||false,pin=button(pinned?'Unpin':'Pin','lp-button');pin.disabled=this.busy||Boolean(this.state?.jobs?.[room.id]);pin.onclick=()=>{this.pendingNoteSave=undefined;this.dispatch('mochi:pinned_content',{roomId:room.id,revision,messageId:message.id,action:'pin',pinned:!pinned});sheet?.dismiss()}
    content.append(reply,react,pin,copy, edit, remove)
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
    this.send({ type: 'mochi:notification_read', requestId: idForRequest, accountId: this.state?.accountId, roomId: id, notificationIds: unread.map(n => n.id) })
  }
  openRoom(id: string): void { this.notificationsOpen = false; this.select(id); this.navigate(id); this.markNotifications(id); this.load() }
  /** Returning to a retained shell view uses the existing read/acknowledgment path. */
  resume(): void { if (this.notificationPolicy().visible && this.roomId && !this.editing && !this.creating && !this.notificationsOpen) this.markNotifications(this.roomId) }
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
    // Restored drafts did not previously get their measured multiline height back.
    globalThis.requestAnimationFrame?.(()=>{if(input.isConnected&&input.value){input.style.height='auto';input.style.height=`${Math.min(input.scrollHeight,112)}px`}})
    input.onkeydown = event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit() } }
    const job = this.state?.jobs?.[room.id]
    const submit = action('Send', 'send', true); submit.classList.add('mochi-primary'); submit.type = 'submit'; submit.disabled = this.busy || Boolean(job) || this.memoryPanel.generating
    const stop = action('Stop reply', 'stop', true); stop.disabled = !job; stop.hidden = !job; stop.onclick = () => {
      if (this.ownGenerations.get(room.id) === job) this.ownGenerations.delete(room.id)
      this.error = ''; this.generationErrorRoom = ''
      this.send({ type: 'mochi:cancel', accountId: this.state?.accountId, roomId: room.id, generationRequestId: job })
    }
    form.onsubmit = event => { event.preventDefault(); if (!this.busy && !job && !this.memoryPanel.generating) this.dispatch('mochi:send', { roomId: room.id, revision: room.revision, content: input.value, responder: responder.value,...(input.value.trim()&&this.replyTargets.get(this.replyKey(room))?{replyTo:this.replyTargets.get(this.replyKey(room))}:{}) }) }
    const actions = el('div', 'mochi-composer-row'); actions.append(input, submit, stop)
    const target=this.replyTargets.get(this.replyKey(room))
    if(target){const preview=el('div','mochi-reply-preview');preview.append(this.quoteNode(room,target));const clear=action('Clear reply target','close',true);clear.onclick=()=>{this.replyTargets.delete(this.replyKey(room));this.redraw();this.presenceRoot?.querySelector<HTMLTextAreaElement>('[aria-label="Message"]')?.focus({preventScroll:true})};preview.append(clear);form.append(preview)}
    form.append(responderField, actions)
    return form
  }
}
