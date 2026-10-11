import { POCKET_ICONS as ICONS } from './components/icons.js'
import { GALLERY_PAGE_SIZE } from '../domain/gallery-page.js'
import { MochiView } from '../mochi/view.js'
import { showMochiNotification, reconcileMochiNotifications } from '../mochi/notifications.js'
import type { MochiNotification } from '../mochi/types.js'
import { VoiceMessagePlayer } from './components/voice-message.js'
import type {
  CalendarEvent,
  DevicePreferences,
  GalleryResult,
  PhoneApp,
  PhoneCapabilities,
  PhoneNote,
  PhoneNotification,
  PocketGenerationInfo,
  PocketContextDiagnostics,
  ChatPocketPersona,
  PocketOperationProgress,
  PocketContactSourceOption,
  PocketContactDraft,
  PhoneEventSuggestion,
  PocketNpcBankEntry,
  PocketContactGroup,
  PocketActivity,
  PocketTurnCandidateOrigin,
  PocketRoute,
  PocketResolvedImage,
  PocketResolvedWallpapers,
  PocketDeviceIdentity,
  PhoneState,
  PhoneTracker,
  SwarmVisualProfile,
} from '../types.js'
import { clockLabel } from '../domain/clock-label.js'
import { defaultPreferences, normalizePreferences, wallpaperCss } from '../domain/preferences.js'
import { normalizePocketRoute } from '../domain/navigation.js'
import { conversationActorIds, listPocketActors, normalizeActorName, resolvePocketActor } from '../domain/actors.js'
import { activityDeviceOwner, conversationDeviceActorIds, conversationUnreadForDevice, conversationVisibleOnDevice, notificationBelongsToDevice, pocketPersonaActorId } from '../domain/device.js'
import { applyMobilePhoneSurface, applyVisualViewportSurface, calculatePhoneSurface, clearVisualViewportSurface, currentViewport, desktopDockSize, PHONE_ASPECT } from './surface.js'
import { applyPocketTouchScroll, resolvePocketTouchScrollMode } from './touch-scroll.js'
import { renderSettingsView } from './apps/settings.js'
import { renderTrackersView } from './apps/trackers.js'
import { renderMessagesView } from './apps/messages.js'
import { renderContactsView } from './apps/contacts.js'
import type { IdentityProfile } from '../domain/identity-profiles.js'
import { identityProfileControls, refreshIdentityProfileControls } from './components/identity-profiles.js'
import { weatherConditionKind, weatherGlyph, weatherOutlook } from './components/weather-outlook.js'
import type { ContactView } from './apps/contacts.js'
import { renderNotificationsView } from './apps/notifications.js'
import { PocketRouteHistory } from './router.js'
import { activityReceipt, renderActivityHost, type ActivityRenderOptions } from './activity.js'
import type { PocketImageTarget } from './components/image-picker.js'
import { disclosure, fieldBlock, outgoingSurface, showPocketSheet } from './components/ui.js'
import { cropAvatarPhoto } from './components/avatar-crop.js'
import { activityClock } from '../domain/activity-clock.js'
import { refreshActivityConnectors } from './components/activity-connectors.js'
import { renderAppReviewControl } from './components/app-review-control.js'
import { renderDevicePicker } from './components/device-picker.js'
import { button, dateTimeLocal, el, formatDate, formatTime, inputValue, requestId } from './shared.js'
import type { PageAction } from './shared.js'
import type {
  SpindleDrawerTabHandle,
  SpindleDockPanelHandle,
  SpindleFloatWidgetHandle,
  SpindleFrontendContext,
} from 'lumiverse-spindle-types'

type Cleanup = () => void
type BackendPayload = Record<string, any>

const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.7" y="2.5" width="10.6" height="19" rx="2.6"/><path d="M10 5h4M10.7 18.7h2.6"/></svg>'

const EMPTY_RESOLVED_IMAGE: PocketResolvedImage = { url: '', status: 'empty', sourceKind: 'none', sourceLabel: 'Theme gradient' }

function pocketDeviceKey(chatId: string, characterId: string, deviceOwnerActorId: string): string {
  return [chatId || '_none', characterId || '_none', deviceOwnerActorId || '_unassigned'].map((value) => encodeURIComponent(value)).join('::')
}

function pocketSurfaceId(): string {
  return requestId('pocket_surface').replace(/[^a-zA-Z0-9_-]/g, '_')
}


const APP_META: Array<{ app: PhoneApp; label: string; icon: string; dock?: boolean }> = [
  { app: 'mochi', label: 'Mochi', icon: 'sparkle' },
  { app: 'messages', label: 'Messages', icon: 'messages', dock: true },
  { app: 'camera', label: 'Camera', icon: 'camera', dock: true },
  { app: 'gallery', label: 'Gallery', icon: 'gallery', dock: true },
  { app: 'notes', label: 'Notes', icon: 'notes', dock: true },
  { app: 'weather', label: 'Weather', icon: 'weather' },
  { app: 'contacts', label: 'Contacts', icon: 'contacts' },
  { app: 'calendar', label: 'Timeline', icon: 'calendar' },
  { app: 'trackers', label: 'Trackers', icon: 'trackers' },
  { app: 'settings', label: 'Settings', icon: 'settings' },
]

function icon(name: string): HTMLSpanElement {
  const node = el('span')
  node.innerHTML = ICONS[name] || ICONS.home
  return node
}

function iconButton(name: string, label: string): HTMLButtonElement {
  const node = button('', 'lp-button lp-button-icon')
  node.setAttribute('aria-label', label)
  node.appendChild(icon(name))
  return node
}

class PocketController {
  private voicePlayer = new VoiceMessagePlayer()
  private ctx: SpindleFrontendContext
  private readonly surfaceId = pocketSurfaceId()
  private cleanups: Cleanup[] = []
  private drawer: SpindleDrawerTabHandle
  private dockPanel: SpindleDockPanelHandle | null = null
  private dockVisibilityCleanup: Cleanup | null = null
  private widget: SpindleFloatWidgetHandle | null = null
  private mobileWidget: SpindleFloatWidgetHandle | null = null
  private widgetRoot: HTMLDivElement | null = null
  private handsetHost: HTMLDivElement
  private launcher: HTMLButtonElement
  private launcherBadge: HTMLSpanElement
  private shell: HTMLDivElement
  private screen: HTMLElement
  private alert: HTMLElement
  private clock: HTMLSpanElement
  private expanded = false
  private currentApp: PhoneApp = 'home'
  private dismissMochiNotification: (() => void) | undefined
  private mochi = new MochiView(payload => this.ctx.sendToBackend(payload), () => { if (this.currentApp === 'mochi') this.render(false) }, roomId => this.openPocket({ app: 'mochi', roomId }),
    () => ({ enabled: this.preferences.notifyMessages, previews: this.preferences.notificationPreviews, visible: this.expanded && this.currentApp === 'mochi' && !document.hidden }), n => this.showMochiNotification(n), (notices, rooms) => reconcileMochiNotifications(this.shell, notices, rooms))
  private state: PhoneState | null = null
  private preferences: DevicePreferences = defaultPreferences()
  private settingsDraft: DevicePreferences | null = null
  private settingsSaveTimer = 0
  private activePersona: { id: string; name: string } | null = null
  private caps: PhoneCapabilities | null = null
  private swarmProfile: SwarmVisualProfile | null = null
  private generation: PocketGenerationInfo | null = null
  private resolvedWallpapers: PocketResolvedWallpapers = {
    deviceHome: { ...EMPTY_RESOLVED_IMAGE }, deviceChat: { ...EMPTY_RESOLVED_IMAGE },
    personaHome: { ...EMPTY_RESOLVED_IMAGE }, personaChat: { ...EMPTY_RESOLVED_IMAGE },
  }
  private contextPreview: PocketContextDiagnostics | null = null
  private personaPreview: ChatPocketPersona | null = null
  private operations = new Map<string, PocketOperationProgress>()
  private router = new PocketRouteHistory()
  private gallery: GalleryResult = { data: [], total: 0 }
  private galleryScope = 'chat'
  private galleryRequestId = ''
  private galleryLoading = false
  private galleryActionButtons = new Map<string, { button: HTMLButtonElement; idle: string }>()
  private pendingWallpaperTarget: PocketImageTarget | null = null
  private pendingContactPhotoId = ''
  private pendingContactPhotoDraft: PocketContactDraft | null = null
  private selectedContactId = ''
  private selectedContactView: ContactView = 'list'
  private selectedContactGroupId = ''
  private npcBankGroups: PocketContactGroup[] = []
  private collectionDrafts = new Map<string, Record<string, unknown>>()
  private collectionRequest = ''
  private collectionRequestKey = ''
  private npcBriefs = new Map<string, string>()
  private contactFormDrafts = new Map<string, Array<{ value: string; checked: boolean }>>()
  private npcDraft: PocketContactDraft | null = null
  private previousNpcDraft: PocketContactDraft | null = null
  private selectedConversationId = ''
  private deviceOwnerActorId = ''
  private syncIndicator: HTMLDivElement
  private syncIndicatorTimer = 0
  private selectedConversationView: 'thread' | 'new-group' | 'group-editor' | 'group-detail' = 'thread'
  private groupDrafts = new Map<string, { title: string; participants: string[] }>()
  private groupSaveRequest = ''
  private groupSaveDraftKey = ''
  private trackerDrafts = new Map<string, Record<string, unknown>>()
  private trackerSaveRequest = ''
  private trackerMutationRequest = ''
  private trackerJevRequest = ''
  private jevWorking = false
  private jevKeyConfigured = false
  private trackerSaveDraftKey = ''
  private cameraDraft = { scene: '', enhance: undefined as boolean | undefined }
  private selectedMessageId = ''
  private selectedNoteId = ''
  private selectedEventId = ''
  private pendingEventSuggestion: { conversationId: string; messageId: string; suggestion: PhoneEventSuggestion } | null = null
  private selectedTrackerId = ''
  private selectedGalleryImageId = ''
  private selectedSettingsSection = ''
  private selectedTrackerView: 'detail' | 'config' = 'detail'
  private cameraPreview = ''
  private cameraContactId = ''
  private cameraReady = false
  private cameraImageId = ''
  private cameraOptions = { purpose: 'scene', aspect: '', connectionId: '', model: '' }
  private imageConnections: Array<{ id: string; name: string }> = []
  private pendingAvatarDraft: { requestId: string; draft: PocketContactDraft | null } | null = null
  private cameraFocus = { x: 50, y: 50 }
  private cameraNpcDraft: PocketContactDraft | null = null
  private cameraProgress = ''
  private cameraBusy = false
  private cameraRequestId = ''
  private messageRequests = new Map<string, { conversationId: string; speakerContactId: string; phase: 'checking' | 'pending' }>()
  private messageDrafts = new Map<string, string>()
  private groupSpeakerSelections = new Map<string, string>()
  private manualMessageOverrides = new Set<string>()
  private focusedHandoffRelays = new Set<string>()
  private contactSources: PocketContactSourceOption[] = []
  private npcBank: PocketNpcBankEntry[] = []
  private identityProfiles: IdentityProfile[] = []
  private appReviewScopes = new Map<string, string>()
  private contactSourcesRequested = false
  private lastTagKeys = new Set<string>()
  private tagKeyOrder: string[] = []
  private destroyed = false
  private collapseTimer = 0
  private alertTimer = 0
  private launcherFocus: HTMLElement | null = null
  private suppressLauncherClick = false
  private launcherPointer: { x: number; y: number } | null = null
  private pendingRoute: PocketRoute | null = null
  private injectedActivities = new Map<string, Element>()
  private pendingActivities = new Map<string, PocketActivity>()
  private knownActivities = new Map<string, PocketActivity>()
  private provisionalActivities = new Map<string, { activity: PocketActivity; origin: PocketTurnCandidateOrigin }>()
  private inlineArtifactObserver: MutationObserver | null = null
  private inlineMountFrame = 0
  private viewCleanups: Cleanup[] = []
  private receiptSweepTimer = 0
  private notificationTimer = 0
  private notificationIsland: HTMLButtonElement
  private customStyle: HTMLStyleElement
  private setupModalOpen = false
  private setupModalBody: HTMLDivElement | null = null
  private setupModalDismiss: (() => void) | null = null
  private setupPersonaEditing = false
  private setupControlCleanups: Cleanup[] = []
  private settledOperationRequests = new Set<string>()
  private composerReferencePill: HTMLDivElement | null = null
  private composerSyncFrame = 0
  private lastComposerReferenceId = ''
  constructor(ctx: SpindleFrontendContext) {
    this.ctx = ctx
    this.drawer = ctx.ui.registerDrawerTab({
      id: 'lumiphone',
      title: 'Pocket',
      shortName: 'Pocket',
      headerTitle: 'Pocket',
      description: 'Open the character-aware roleplay phone',
      keywords: ['phone', 'messages', 'camera', 'gallery', 'journal', 'calendar', 'timeline', 'tracker'],
      iconSvg: PHONE_ICON,
    })
    this.launcher = el('button', 'lumiphone-launcher')
    this.launcher.type = 'button'
    this.launcher.title = 'Open Pocket'
    this.launcher.setAttribute('aria-label', 'Open Pocket')
    const launcherPhone = el('span', 'lumiphone-launcher-phone')
    launcherPhone.setAttribute('aria-hidden', 'true')
    const launcherScreen = el('span', 'lumiphone-launcher-screen')
    for (let index = 0; index < 4; index++) launcherScreen.append(el('i'))
    launcherPhone.append(launcherScreen)
    this.launcher.append(launcherPhone)
    this.launcherBadge = el('span', 'lumiphone-badge')
    this.launcherBadge.hidden = true
    this.launcher.appendChild(this.launcherBadge)
    this.handsetHost = el('div', 'lumiphone-widget-root lumiphone-handset-host')
    this.shell = el('div', 'lumiphone-shell')
    this.shell.hidden = true
    const status = el('div', 'lumiphone-statusbar')
    const dismiss = iconButton('back', 'Dismiss phone')
    dismiss.className = 'lumiphone-dismiss'
    dismiss.addEventListener('click', () => this.close())
    this.clock = el('span', 'lumiphone-time', formatTime(new Date()))
    const island = button('', 'lumiphone-island')
    island.setAttribute('aria-label', 'Open Notification Center')
    island.addEventListener('click', () => this.openPocket({ app: 'notifications' }))
    this.notificationIsland = island
    const signals = el('span', 'lumiphone-signals')
    const bars = el('span', 'lumiphone-signal-bars')
    for (let i = 0; i < 4; i += 1) bars.appendChild(el('i'))
    signals.append(bars, el('span', '', '5G'), el('span', 'lumiphone-battery'))
    const statusLeading = el('div', 'lumiphone-status-leading')
    statusLeading.append(dismiss, this.clock)
    status.append(statusLeading, island, signals)
    this.screen = el('main', 'lumiphone-screen')
    this.alert = el('div', 'lp-alert')
    this.alert.hidden = true
    this.syncIndicator = el('div', 'lumiphone-sync-indicator')
    this.syncIndicator.hidden = true
    const homebar = el('div', 'lumiphone-homebar')
    const homeButton = button('')
    homeButton.setAttribute('aria-label', 'Home or dismiss phone')
    homebar.appendChild(homeButton)
    this.customStyle = document.createElement('style')
    this.customStyle.dataset.pocketCustomCss = 'true'
    this.shell.append(status, this.syncIndicator, this.screen, homebar, this.alert, this.customStyle)
    this.syncSurfaceIdentity()
    this.launcher.addEventListener('pointerdown', (event) => { this.launcherPointer = { x: event.clientX, y: event.clientY } })
    this.launcher.addEventListener('pointermove', (event) => {
      if (!this.launcherPointer) return
      if (Math.hypot(event.clientX - this.launcherPointer.x, event.clientY - this.launcherPointer.y) > 7) this.suppressLauncherClick = true
    })
    this.launcher.addEventListener('pointerup', () => { this.launcherPointer = null })
    this.launcher.addEventListener('pointercancel', () => { this.launcherPointer = null })
    this.launcher.addEventListener('click', (event) => {
      if (this.suppressLauncherClick) { event.preventDefault(); this.suppressLauncherClick = false; return }
      this.open()
    })
    homeButton.addEventListener('click', () => {
      if (this.currentApp !== 'home') this.home()
      else this.close()
    })
    this.installSwipeDismiss(status)
    this.installNotificationPull(status)
    this.renderDrawerLanding()
    this.installHostIntegrations()
    this.tickClock()
    this.refresh()
  }

  destroy(): void {
    this.dismissMochiNotification?.()
    this.mochi.destroy()
    this.voicePlayer.stop()
    this.setupModalDismiss?.()
    this.destroyed = true
    window.clearTimeout(this.collapseTimer)
    window.clearTimeout(this.alertTimer)
    window.clearInterval(this.receiptSweepTimer)
    window.clearTimeout(this.notificationTimer)
    window.clearTimeout(this.syncIndicatorTimer)
    window.clearTimeout(this.settingsSaveTimer)
    if (this.inlineMountFrame) cancelAnimationFrame(this.inlineMountFrame)
    this.inlineArtifactObserver?.disconnect()
    this.inlineArtifactObserver = null
    for (const cleanup of this.cleanups.splice(0)) {
      try { cleanup() } catch { /* best effort */ }
    }
    this.widget?.destroy()
    this.mobileWidget?.destroy()
    this.releaseDockPanel()
    for (const injected of this.injectedActivities.values()) this.ctx.dom.uninject(injected)
    this.injectedActivities.clear()
    for (const cleanup of this.viewCleanups.splice(0)) cleanup()
    this.drawer.destroy()
  }

  private installHostIntegrations(): void {
    this.cleanups.push(this.drawer.onActivate(() => this.renderDrawerLanding()))
    const action = this.ctx.ui.registerInputBarAction({
      id: 'open-lumiphone',
      label: 'Open Pocket',
      subtitle: 'Open the character-aware roleplay phone',
      iconSvg: PHONE_ICON,
    })
    this.cleanups.push(action.onClick(() => this.open()))
    this.cleanups.push(() => action.destroy())
    this.cleanups.push(this.ctx.messages.registerTagInterceptor(
      { tagName: 'lumi-phone', removeFromMessage: true },
      (payload) => {
        if (payload.isStreaming) return
        const key = `${payload.messageId || ''}:${payload.fullMatch}`
        if (this.lastTagKeys.has(key)) return
        this.lastTagKeys.add(key)
        this.tagKeyOrder.push(key)
        while (this.tagKeyOrder.length > 120) {
          const old = this.tagKeyOrder.shift()
          if (old) this.lastTagKeys.delete(old)
        }
        const active = this.ctx.getActiveChat()
        this.ctx.sendToBackend({
          type: 'lumiphone:model_action',
          requestId: requestId('tag'),
          chatId: payload.chatId || active.chatId,
          characterId: active.characterId,
          attrs: payload.attrs,
          content: payload.content,
          messageId: payload.messageId,
          fullMatch: payload.fullMatch,
          idempotencyKey: `tag:${payload.messageId || ''}:${payload.fullMatch}`,
        })
      },
    ))
    // During streaming, hide the display pointer. After commit the backend rewrites
    // it in-place to a durable exact-position anchor for the specific swipe.
    this.cleanups.push(this.ctx.messages.registerTagInterceptor(
      { tagName: 'pocket-artifact', removeFromMessage: true },
      () => {},
    ))
    this.cleanups.push(this.ctx.messages.registerTagInterceptor(
      { tagName: 'pocket-commit', removeFromMessage: true },
      () => {},
    ))
    this.installInlineArtifactObserver()
    this.cleanups.push(this.ctx.onBackendMessage((payload) => this.onBackend(payload as BackendPayload)))
    this.cleanups.push(this.ctx.events.on('CHAT_SWITCHED', () => {
      this.setupModalDismiss?.()
      this.settledOperationRequests.clear()
      this.operations.clear()
      this.personaPreview = null
      this.clearActivitySurfaces(true, true)
      this.hideComposerReferencePill()
      this.refresh()
      window.setTimeout(() => this.sweepActivityReceipts(), 0)
    }))
    const returned = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (detail?.extensionId === 'lumiphone') this.refresh()
    }
    window.addEventListener('spindle:desktop-widget-returned', returned)
    this.cleanups.push(() => window.removeEventListener('spindle:desktop-widget-returned', returned))
    const resize = () => { if (this.expanded) this.resizeExpanded() }
    window.addEventListener('resize', resize)
    this.cleanups.push(() => window.removeEventListener('resize', resize))
    // CSS zoom changes don't fire window.resize. Host tokens live on the root.
    const scaleObserver = new MutationObserver(resize)
    scaleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })
    scaleObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] })
    this.cleanups.push(() => scaleObserver.disconnect())
    window.visualViewport?.addEventListener('resize', resize)
    this.cleanups.push(() => window.visualViewport?.removeEventListener('resize', resize))
    window.visualViewport?.addEventListener('scroll', resize)
    this.cleanups.push(() => window.visualViewport?.removeEventListener('scroll', resize))
    const focusin = (event: FocusEvent) => {
      if (!this.expanded || this.handsetHost.dataset.fullscreen !== 'true') return
      this.resizeExpanded()
      const target = event.target instanceof HTMLElement ? event.target : null
      window.setTimeout(() => {
        this.resizeExpanded()
        target?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }, 60)
    }
    this.shell.addEventListener('focusin', focusin)
    this.cleanups.push(() => this.shell.removeEventListener('focusin', focusin))
    const keydown = (event: KeyboardEvent) => {
      if (!this.expanded) return
      if (event.key === 'Escape') {
        if (this.currentApp !== 'home') this.back()
        else this.close()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...this.shell.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
        .filter((node) => !node.hidden && node.getClientRects().length > 0)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)!
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', keydown)
    this.cleanups.push(() => window.removeEventListener('keydown', keydown))
    this.installComposerReferenceBridge()
    void this.ensureWidget()
  }

  private async ensureWidget(): Promise<void> {
    if (this.widget) return
    try {
      const granted = await this.ctx.permissions.getGranted()
      if (!granted.includes('ui_panels')) return
      if (this.destroyed) return
      this.widget = this.ctx.ui.createFloatWidget({
        width: 58,
        height: 58,
        initialPosition: { x: Math.max(12, window.innerWidth - 82), y: Math.max(58, window.innerHeight * .22) },
        snapToEdge: true,
        tooltip: 'Pocket',
        chromeless: true,
        resizable: false,
        aspectLock: PHONE_ASPECT,
        persistGeometry: false,
      } as any)
      this.widgetRoot = el('div', 'lumiphone-widget-root')
      this.widget.root.appendChild(this.widgetRoot)
      this.widgetRoot.append(this.launcher)
      this.cleanups.push(this.widget.onDragEnd(() => {
        this.suppressLauncherClick = true
        window.setTimeout(() => { this.suppressLauncherClick = false }, 180)
      }))
      this.launcher.hidden = false
      this.renderDrawerLanding()
    } catch {
      this.widget = null
      this.mountPhoneInDrawer()
    }
  }

  private renderDrawerLanding(): void {
    this.drawer.root.replaceChildren()
    const outer = el('div', 'lumiphone-drawer lumiphone-device-drawer')
    const card = el('div', 'lumiphone-device-switcher')
    const logo = el('div', 'lumiphone-device-mark')
    logo.innerHTML = PHONE_ICON
    const title = el('h2', 'lumiphone-device-title', 'Pocket devices')
    const copy = el('p', 'lumiphone-device-copy', 'Switch devices without changing your roleplay Persona.')
    const header = el('div', 'lumiphone-device-heading'); header.append(logo, title)
    card.append(header, copy)

    if (this.state) {
      const personaId = pocketPersonaActorId(this.state)
      const selected = this.currentDeviceOwnerActorId() || personaId
      const list = renderDevicePicker(this.state, selected,
        actorId => pocketDeviceKey(this.state!.chatId, this.state!.characterId, actorId),
        (actorId, route) => {
          if (this.cameraBusy) this.send('lumiphone:camera_cancel', { requestId: this.cameraRequestId })
          this.cameraRequestId = ''; this.cameraBusy = false; this.cameraReady = false; this.cameraPreview = ''; this.cameraContactId = ''; this.cameraNpcDraft = null
          this.deviceOwnerActorId = actorId
          this.syncSurfaceIdentity()
          this.selectedConversationId = ''
          this.selectedMessageId = ''
          this.currentApp = 'home'
          this.mochi.leave()
          this.router.reset({ app: 'home' })
          this.updateBadge()
          this.renderDrawerLanding()
          this.announceView()
          if (this.widget) this.open()
          else this.mountPhoneInDrawer()
          if (route) this.openPocket(route)
        })
      card.appendChild(list)
    } else {
      card.appendChild(el('p', 'lumiphone-drawer-copy', 'Pocket is still loading this chat.'))
    }

    const actions = el('div', 'lumiphone-device-footer')
    const permission = button('Manage access', 'lumiphone-device-access')
    permission.addEventListener('click', () => this.requestPermissions())
    actions.append(permission)
    const restore = button('Show launcher', 'lumiphone-device-access')
    restore.addEventListener('click', async () => {
      await this.ensureWidget()
      this.widget?.setVisible(true)
      if (!this.expanded) this.launcher.hidden = false
    })
    actions.append(restore)
    if (this.state && !this.state.setup.initialized) {
      const resume = button('Set up Pocket', 'lumiphone-device-access')
      resume.addEventListener('click', () => this.showFirstChatSetup(true))
      actions.append(resume)
    }
    card.appendChild(actions)
    outer.appendChild(card)
    this.drawer.root.appendChild(outer)
  }

  private ensureDockPanel(): SpindleDockPanelHandle | null {
    if (this.dockPanel) return this.dockPanel
    try {
      this.dockPanel = this.ctx.ui.requestDockPanel({
        edge: 'right', title: 'Pocket', size: desktopDockSize(this.preferences.handsetScale),
        minSize: 292, maxSize: 620, resizable: false, startCollapsed: true,
        chromeless: true, centerContent: true,
      })
      this.dockVisibilityCleanup = this.dockPanel.onVisibilityChange((visible) => {
        if (!visible && this.expanded && !calculatePhoneSurface(this.preferences.handsetScale).fullscreen) {
          this.expanded = false
          this.shell.hidden = true
          this.launcher.hidden = false
        }
      })
      return this.dockPanel
    } catch {
      this.dockPanel = null
      return null
    }
  }

  private releaseDockPanel(): void {
    try { this.dockVisibilityCleanup?.() } catch { /* best effort */ }
    this.dockVisibilityCleanup = null
    try { this.dockPanel?.destroy() } catch { /* host may already have closed it */ }
    this.dockPanel = null
  }

  private ensureMobileWidget(): SpindleFloatWidgetHandle | null {
    if (this.mobileWidget) return this.mobileWidget
    try {
      const viewport = currentViewport()
      this.mobileWidget = this.ctx.ui.createFloatWidget({
        width: viewport.width, height: viewport.height, initialPosition: { x: 0, y: 0 },
        fullscreen: true, chromeless: true, snapToEdge: false, persistGeometry: false,
        touchScrollMode: resolvePocketTouchScrollMode(this.preferences.nativeTouchScrollMode),
      } as any)
      applyPocketTouchScroll(this.mobileWidget, this.preferences.nativeTouchScrollMode)
      this.mobileWidget.setVisible(false)
      return this.mobileWidget
    } catch {
      this.mobileWidget = null
      return null
    }
  }

  private mountInteractiveSurface(): boolean {
    const geometry = calculatePhoneSurface(this.preferences.handsetScale)
    if (geometry.fullscreen) {
      this.releaseDockPanel()
      const mobile = this.ensureMobileWidget()
      if (!mobile) return false
      if (this.handsetHost.parentElement !== mobile.root) mobile.root.replaceChildren(this.handsetHost)
      if (this.shell.parentElement !== this.handsetHost) this.handsetHost.replaceChildren(this.shell)
      this.handsetHost.dataset.fullscreen = 'true'
      applyMobilePhoneSurface(mobile, 1)
      applyVisualViewportSurface(this.handsetHost, pixels => {
        if (this.ctx.ui.geometry) return this.ctx.ui.geometry.toLayoutPx(pixels)
        const scale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lumiverse-ui-scale'))
        return pixels / (Number.isFinite(scale) && scale > 0 ? scale : 1)
      })
      if (!mobile.isVisible()) mobile.setVisible(true)
      return true
    }
    if (this.mobileWidget) {
      this.mobileWidget.setFullscreen(false)
      this.mobileWidget.setVisible(false)
    }
    const panel = this.ensureDockPanel()
    if (!panel) return false
    if (this.handsetHost.parentElement !== panel.root) panel.root.replaceChildren(this.handsetHost)
    if (this.shell.parentElement !== this.handsetHost) this.handsetHost.replaceChildren(this.shell)
    this.handsetHost.dataset.fullscreen = 'false'
    clearVisualViewportSurface(this.handsetHost)
    if ('setSize' in panel && typeof panel.setSize === 'function') {
      panel.setSize(desktopDockSize(this.preferences.handsetScale))
    }
    panel.expand()
    const desktop = calculatePhoneSurface(this.preferences.handsetScale, currentViewport(), false)
    this.handsetHost.style.width = `${desktop.width}px`
    this.handsetHost.style.height = `${desktop.height}px`
    return true
  }

  private mountPhoneInDrawer(): void {
    if (this.widget && (this.dockPanel || this.mobileWidget)) return
    this.drawer.root.replaceChildren()
    const host = this.handsetHost
    const viewport = currentViewport()
    const geometry = calculatePhoneSurface(this.preferences.handsetScale, { width: Math.min(viewport.width, 620), height: Math.max(320, viewport.height - 130) }, false)
    host.style.width = geometry.fullscreen ? '100%' : `${geometry.width}px`
    host.style.height = geometry.fullscreen ? 'calc(100dvh - 110px)' : `${geometry.height}px`
    host.style.aspectRatio = String(PHONE_ASPECT)
    host.dataset.fullscreen = 'false'
    this.drawer.root.appendChild(host)
    host.replaceChildren(this.shell)
    this.launcher.hidden = true
    this.shell.hidden = false
    this.expanded = true
    this.render(true)
  }

  private async requestPermissions(): Promise<void> {
    try {
      await this.ctx.permissions.request([
        'ui_panels', 'chats', 'chat_mutation', 'characters', 'personas', 'generation', 'tools', 'interceptor', 'images', 'image_gen', 'push_notification',
      ], { reason: 'Pocket uses these permissions for its launcher and handset, per-chat character state, generated text messages, user-requested scene contact sync, model actions, gallery, camera, and optional push notifications.' })
      await this.ensureWidget()
      this.refresh()
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error))
    }
  }

  private installSwipeDismiss(target: HTMLElement): void {
    let startX = 0
    let startY = 0
    let active = false
    target.addEventListener('pointerdown', (event) => {
      if ((event.target as Element | null)?.closest('button,input,select,textarea,a')) return
      startX = event.clientX
      startY = event.clientY
      active = true
    })
    target.addEventListener('pointerup', (event) => {
      if (!active) return
      active = false
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      const dismissLeft = dx < -64 && Math.abs(dx) > Math.abs(dy) * 1.35
      const dismissUp = dy < -64 && Math.abs(dy) > Math.abs(dx) * 1.35
      if (dismissLeft || dismissUp) this.close()
    })
    target.addEventListener('pointercancel', () => { active = false })
  }

  private installNotificationPull(target: HTMLElement): void {
    let startY = 0
    let active = false
    target.addEventListener('pointerdown', (event) => {
      if ((event.target as Element | null)?.closest('button,input,select,textarea,a')) return
      startY = event.clientY
      active = true
    })
    target.addEventListener('pointerup', (event) => {
      if (!active) return
      active = false
      if (event.clientY - startY > 52) this.openPocket({ app: 'notifications' })
    })
    target.addEventListener('pointercancel', () => { active = false })
  }

  private tickClock(): void {
    const timer = window.setInterval(() => {
      this.clock.textContent = formatTime(new Date())
    }, 30_000)
    this.cleanups.push(() => window.clearInterval(timer))
  }

  private activeContext(): { chatId: string | null; characterId: string | null } {
    const active = this.ctx.getActiveChat()
    return {
      chatId: active.chatId || this.state?.chatId || null,
      characterId: active.characterId || this.state?.characterId || null,
    }
  }

  private currentDeviceOwnerActorId(): string {
    if (!this.state) return this.deviceOwnerActorId
    return this.deviceOwnerActorId || pocketPersonaActorId(this.state)
  }

  private deviceIdentity(): PocketDeviceIdentity {
    const context = this.activeContext()
    const chatId = String(this.state?.chatId || context.chatId || '_lobby')
    const characterId = String(this.state?.characterId || context.characterId || '_none')
    const deviceOwnerActorId = this.currentDeviceOwnerActorId() || '_unassigned'
    const personaActorId = this.state ? pocketPersonaActorId(this.state) : ''
    const role: PocketDeviceIdentity['role'] = personaActorId && deviceOwnerActorId === personaActorId ? 'persona' : 'actor'
    return {
      key: pocketDeviceKey(chatId, characterId, deviceOwnerActorId),
      chatId, characterId, deviceOwnerActorId, role,
      inspection: role !== 'persona',
      surfaceId: this.surfaceId,
    }
  }

  private syncSurfaceIdentity(): PocketDeviceIdentity {
    const identity = this.deviceIdentity()
    for (const node of [this.shell, this.handsetHost]) {
      node.dataset.pocketSurface = identity.surfaceId
      node.dataset.pocketDeviceKey = identity.key
      node.dataset.pocketChatId = identity.chatId
      node.dataset.pocketCharacterId = identity.characterId
      node.dataset.pocketDeviceOwner = identity.deviceOwnerActorId
      node.dataset.pocketDeviceRole = identity.role
      node.dataset.pocketInspection = String(identity.inspection)
    }
    return identity
  }

  private send(type: string, payload: Record<string, unknown> = {}): string {
    const context = this.activeContext()
    const id = String(payload.requestId || requestId())
    if (type === 'lumiphone:generate_pocket_persona') this.operations.set(id, { task: 'persona-profile', requestId: id, phase: 'generating', message: 'Enriching phone profile…' })
    if (type === 'lumiphone:cancel_persona_generation') {
      const operation = this.operations.get(String(payload.operationRequestId || ''))
      if (operation) this.recordOperationProgress({ ...operation, phase: 'error', message: 'Enrichment stopped. You can retry whenever you’re ready.' })
    }
    this.ctx.sendToBackend({ type, requestId: id, chatId: context.chatId, characterId: context.characterId, deviceOwnerActorId: this.currentDeviceOwnerActorId(), ...payload })
    return id
  }

  private refresh(): void {
    this.send('lumiphone:get_state')
  }

  private announceView(): void {
    this.send('lumiphone:view_state', { open: this.expanded, route: this.router.current })
  }

  /**
   * Pocket references are already chat-scoped backend state. This bridge only
   * reflects that state in Lumiverse's native chat_composer_above mount; it
   * never creates a second attachment lifecycle.
   */
  private activeComposerReference() {
    if (!this.state) return null
    const active = this.ctx.getActiveChat()
    if (active.chatId && this.state.chatId !== active.chatId) return null
    if (active.characterId && this.state.characterId !== active.characterId) return null
    return [...(this.state.references || [])].reverse().find((reference) =>
      reference.status === 'armed' || reference.status === 'injected' || reference.status === 'failed'
    ) || null
  }

  private findHostComposerAboveMount(): HTMLElement | null {
    const candidates = [...document.querySelectorAll<HTMLElement>(
      '[data-spindle-mount="chat_composer_above"]',
    )].filter((node) => !node.closest('.lumiphone-widget-root,.lumiphone-drawer'))

    const active = this.ctx.getActiveChat()
    if (active.chatId) {
      const expectedScope = `chat:${active.chatId}:composer-above`
      const exact = candidates.find((node) => node.dataset.spindleScope === expectedScope)
      if (exact) return exact
    }

    return candidates.find((node) => node.isConnected) || candidates[0] || null
  }

  private installComposerReferenceBridge(): void {
    // Pocket's frontend contract harness runs in JSDOM without host-level browser observers/RAF.
    // The composer bridge is only meaningful in the real Lumiverse browser surface, so fail closed here.
    if (typeof MutationObserver === 'undefined' || typeof window.requestAnimationFrame !== 'function') return

    const pill = el('div', 'pocket-composer-reference')
    pill.hidden = true
    pill.setAttribute('role', 'group')
    pill.setAttribute('aria-label', 'Attached Pocket reference')

    const open = button('', 'pocket-composer-reference-open')
    open.type = 'button'
    open.title = 'Open attached Pocket reference'

    const mark = el('span', 'pocket-composer-reference-mark')
    mark.innerHTML = PHONE_ICON

    const copy = el('span', 'pocket-composer-reference-copy')
    const meta = el('span', 'pocket-composer-reference-meta')
    const source = el('span', 'pocket-composer-reference-source', 'Pocket attached')
    const separator = el('span', 'pocket-composer-reference-separator', '·')
    const conversation = el('span', 'pocket-composer-reference-conversation')
    const count = el('span', 'pocket-composer-reference-count')
    count.hidden = true
    const preview = el('span', 'pocket-composer-reference-preview')
    meta.append(source, separator, conversation, count)
    copy.append(meta, preview)
    open.append(mark, copy)

    const clear = button('×', 'pocket-composer-reference-clear')
    clear.type = 'button'
    clear.title = 'Clear Pocket reference'
    clear.setAttribute('aria-label', 'Clear Pocket reference')

    pill.append(open, clear)
    this.composerReferencePill = pill

    open.addEventListener('click', () => {
      const reference = this.activeComposerReference()
      if (!reference) return
      const messageId = reference.messages.at(-1)?.messageId
      this.openPocket({ app: 'messages', conversationId: reference.conversationId, messageId })
    })

    clear.addEventListener('click', (event) => {
      event.stopPropagation()
      const reference = this.activeComposerReference()
      if (!reference || reference.status === 'injected') return
      this.send('lumiphone:cancel_reference', { referenceId: reference.id })
    })

    const schedule = () => this.scheduleComposerReferenceSync()
    const mutationObserver = new MutationObserver(() => {
      const mount = this.findHostComposerAboveMount()
      if (!pill.isConnected || (mount && pill.parentElement !== mount)) schedule()
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    this.cleanups.push(() => {
      mutationObserver.disconnect()
      if (this.composerSyncFrame) window.cancelAnimationFrame(this.composerSyncFrame)
      this.composerSyncFrame = 0
      pill.remove()
      if (this.composerReferencePill === pill) this.composerReferencePill = null
    })

    schedule()
  }

  private scheduleComposerReferenceSync(): void {
    if (this.destroyed || this.composerSyncFrame) return
    this.composerSyncFrame = window.requestAnimationFrame(() => {
      this.composerSyncFrame = 0
      this.syncComposerReferencePill()
    })
  }

  private hideComposerReferencePill(): void {
    if (!this.composerReferencePill) return
    this.composerReferencePill.hidden = true
    this.lastComposerReferenceId = ''
  }

  private syncComposerReferencePill(): void {
    const pill = this.composerReferencePill
    if (!pill) return

    const reference = this.activeComposerReference()
    const mount = this.findHostComposerAboveMount()

    if (!reference || !mount || !mount.isConnected) {
      this.hideComposerReferencePill()
      return
    }

    if (pill.parentElement !== mount) mount.appendChild(pill)

    const status = pill.querySelector<HTMLSpanElement>('.pocket-composer-reference-source')
    const conversation = pill.querySelector<HTMLSpanElement>('.pocket-composer-reference-conversation')
    const count = pill.querySelector<HTMLSpanElement>('.pocket-composer-reference-count')
    const preview = pill.querySelector<HTMLSpanElement>('.pocket-composer-reference-preview')
    const open = pill.querySelector<HTMLButtonElement>('.pocket-composer-reference-open')
    const clear = pill.querySelector<HTMLButtonElement>('.pocket-composer-reference-clear')

    const message = reference.messages.at(-1)
    const messageText = message?.text?.replace(/\s+/g, ' ').trim() || ''
    const conversationTitle = reference.conversationTitle
      || (reference.conversationKind === 'group' ? 'Group chat' : 'Conversation')
    const fallback = `${reference.messages.length} message${reference.messages.length === 1 ? '' : 's'}`

    const statusLabel = reference.status === 'injected'
      ? 'Pocket applying'
      : reference.status === 'failed'
        ? 'Pocket attach failed'
        : 'Pocket attached'

    if (status) status.textContent = statusLabel
    if (conversation) conversation.textContent = conversationTitle
    if (count) {
      const messageCount = reference.messages.length
      count.hidden = messageCount <= 1
      count.textContent = messageCount > 1 ? `${messageCount} msgs` : ''
      count.title = messageCount > 1 ? `${messageCount} Pocket messages attached` : ''
      count.setAttribute('aria-label', count.title || 'One Pocket message attached')
    }

    if (preview) {
      if (messageText) {
        const speaker = reference.conversationKind === 'group' && message?.senderName
          ? `${message.senderName} — `
          : ''
        preview.textContent = `${speaker}“${messageText}”`
      } else {
        preview.textContent = fallback
      }
    }

    if (open) open.setAttribute('aria-label', `Open attached Pocket reference from ${conversationTitle}`)
    if (clear) {
      clear.hidden = reference.status === 'injected'
      clear.disabled = reference.status === 'injected'
    }

    pill.dataset.status = reference.status
    pill.style.setProperty('--pocket-reference-accent', this.preferences.colors.accent)
    pill.hidden = false

    if (this.lastComposerReferenceId !== reference.id && !this.preferences.reducedMotion) {
      pill.animate([
        { opacity: .25, transform: 'translateY(3px) scale(.995)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 170, easing: 'cubic-bezier(.2,.8,.2,1)' })
    }
    this.lastComposerReferenceId = reference.id
  }

  private onBackend(payload: BackendPayload): void {
    if (this.mochi.receive(payload)) return
    if (!payload || typeof payload !== 'object' || typeof payload.type !== 'string') return
    if (payload.type === 'lumiphone:state' && payload.state) {
      const active = this.ctx.getActiveChat()
      if (active.chatId && payload.state.chatId !== active.chatId) return
      if (active.characterId && payload.state.characterId !== active.characterId) return
      const previousUnread = this.unreadCount()
      if (payload.reason === 'host_swipe') this.clearActivitySurfaces(true)
      if (this.state && (this.state.chatId !== payload.state.chatId || this.state.characterId !== payload.state.characterId)) {
        this.trackerMutationRequest = ''; this.trackerJevRequest = ''; this.jevWorking = false
        this.collectionRequest = ''
        this.cameraDraft = { scene: '', enhance: undefined }
        this.cameraPreview = ''; this.cameraProgress = ''; this.cameraBusy = false; this.cameraRequestId = ''; this.cameraContactId = ''; this.cameraReady = false
        this.cameraImageId = ''; this.cameraNpcDraft = null; this.cameraOptions = { purpose: 'scene', aspect: '', connectionId: '', model: '' }; this.cameraFocus = { x: 50, y: 50 }
        this.npcDraft = null; this.previousNpcDraft = null
      }
      this.state = payload.state as PhoneState
      const personaDeviceId = pocketPersonaActorId(this.state)
      const availableDeviceIds = new Set([personaDeviceId, ...this.state.conversations.flatMap((conversation) => conversationDeviceActorIds(this.state!, conversation))])
      if (!this.deviceOwnerActorId || !availableDeviceIds.has(this.deviceOwnerActorId)) this.deviceOwnerActorId = personaDeviceId
      this.syncSurfaceIdentity()
      this.npcBank = Array.isArray(payload.npcBank?.entries) ? payload.npcBank.entries as PocketNpcBankEntry[] : []
      this.identityProfiles = Array.isArray(payload.identityProfiles) ? payload.identityProfiles : []
      this.npcBankGroups = Array.isArray(payload.npcBank?.groups) ? payload.npcBank.groups as PocketContactGroup[] : []
      for (const conversationId of this.manualMessageOverrides) {
        const conversation = this.state.conversations.find((entry) => entry.id === conversationId)
        if (!conversation || conversation.availability.state !== 'local') this.manualMessageOverrides.delete(conversationId)
      }
      this.jevKeyConfigured = payload.jevKeyConfigured === true
      const nextPreferences = normalizePreferences(payload.preferences || this.preferences)
      if (nextPreferences.notifyMessages !== this.preferences.notifyMessages || nextPreferences.notificationPreviews !== this.preferences.notificationPreviews) this.dismissMochiNotification?.()
      this.preferences = nextPreferences
      applyPocketTouchScroll(this.mobileWidget, this.preferences.nativeTouchScrollMode)
      if (payload.reason === 'import' || payload.reason === 'reset_preferences' || payload.reason === 'preferences') this.settingsDraft = structuredClone(this.preferences)
      this.caps = payload.capabilities || this.caps
      this.swarmProfile = payload.swarmProfile || this.swarmProfile
      this.generation = payload.generation || this.generation
      if (payload.resolvedWallpapers) this.resolvedWallpapers = payload.resolvedWallpapers as PocketResolvedWallpapers
      if ('activePersona' in payload) this.activePersona = payload.activePersona || null
      if (this.setupModalOpen && this.setupModalBody) {
        if (this.state.setup.initialized) this.setupModalDismiss?.()
        else if (!this.setupPersonaEditing) this.renderFirstChatSetupBody()
      }
      this.knownActivities.clear()
      for (const activity of this.state.activities || []) {
        this.knownActivities.set(activity.id, activity)
        this.provisionalActivities.delete(activity.id)
      }
      this.pruneInactiveActivitySurfaces()
      this.mountInlineArtifacts()
      for (const activity of this.state.activities || []) this.queueActivityReceipt(activity)
      this.applyAppearance()
      this.syncComposerReferencePill()
      this.updateBadge()
      this.renderDrawerLanding()
      this.announceView()
      if (payload.open) this.open()
      const pending = this.pendingRoute
      this.pendingRoute = null
      if (pending) this.openPocket(pending)
      else if (this.expanded && this.currentApp === 'settings') this.updateSettingsDiagnostics()
      else if (this.expanded && payload.reason !== 'identity_profile_saved') this.render(false)
      if (this.unreadCount() > previousUnread && !this.expanded) this.launcher.animate([
        { transform: 'scale(1)' }, { transform: 'scale(1.13) rotate(-4deg)' }, { transform: 'scale(1)' },
      ], { duration: 420, easing: 'ease-out' })
      return
    }
    if (payload.type === 'lumiphone:jev_status') {
      const context = this.activeContext()
      if (payload.chatId !== context.chatId || payload.characterId !== context.characterId) return
      this.jevWorking = payload.status === 'working'
      if (!this.jevWorking) this.trackerJevRequest = ''
      if (this.currentApp === 'trackers') this.render(false)
      this.showFeedback(String(payload.message || 'Tracker evaluation updated.'), payload.status === 'error')
      return
    }
    if (payload.type === 'lumiphone:reconciliation_status') {
      if (!this.preferences.showReconciliationStatus) return
      window.clearTimeout(this.syncIndicatorTimer)
      const status = String(payload.status || '')
      this.syncIndicator.dataset.status = status
      if (status === 'working') {
        this.syncIndicator.textContent = 'Pocket syncing…'
        this.syncIndicator.title = 'Pocket is reconciling roleplay state.'
        this.syncIndicator.hidden = false
        this.launcher.dataset.sync = 'working'
      } else if (status === 'complete') {
        const domains = Array.isArray(payload.domains) ? payload.domains.filter(Boolean).join(', ') : ''
        this.syncIndicator.textContent = domains ? `Synced · ${domains}` : 'Pocket synced'
        this.syncIndicator.title = domains ? `Pocket synced: ${domains}` : 'Pocket synced.'
        this.syncIndicator.hidden = false
        this.launcher.dataset.sync = 'complete'
        this.syncIndicatorTimer = window.setTimeout(() => { this.syncIndicator.hidden = true; delete this.launcher.dataset.sync }, 1800)
      } else {
        const detail = payload.error ? String(payload.error).slice(0, 240) : ''
        this.syncIndicator.textContent = 'Pocket sync issue'
        this.syncIndicator.title = detail || 'Pocket could not reconcile roleplay state.'
        this.syncIndicator.hidden = false
        this.launcher.dataset.sync = 'error'
        this.syncIndicatorTimer = window.setTimeout(() => { this.syncIndicator.hidden = true; delete this.launcher.dataset.sync }, 5000)
      }
      return
    }
    if (payload.type === 'lumiphone:debug_prompt') {
      this.showOutgoingPromptResult(payload)
      return
    }
    if (payload.type === 'lumiphone:provisional_activity' && payload.activity && payload.origin) {
      const activity = payload.activity as PocketActivity
      const origin = payload.origin as PocketTurnCandidateOrigin
      const active = this.activeContext()
      if (activity.scope.chatId !== active.chatId || activity.scope.characterId !== active.characterId || origin.chatId !== active.chatId) return
      this.provisionalActivities.set(activity.id, { activity, origin })
      this.mountInlineArtifacts()
      return
    }
    if (payload.type === 'lumiphone:candidate_activity_discard' && Array.isArray(payload.activityIds)) {
      for (const rawId of payload.activityIds) {
        const activityId = typeof rawId === 'string' ? rawId : ''
        if (!activityId) continue
        this.provisionalActivities.delete(activityId)
        if (this.knownActivities.has(activityId)) continue
        for (const host of this.inlineHosts(activityId)) {
          host.replaceChildren()
          host.hidden = true
          delete host.dataset.pocketMounted
          delete host.dataset.pocketActivityId
        }
        const fallback = this.injectedActivities.get(activityId)
        if (fallback) {
          this.ctx.dom.uninject(fallback)
          this.injectedActivities.delete(activityId)
        }
        this.pendingActivities.delete(activityId)
      }
      return
    }
    if (payload.type === 'lumiphone:activity' && payload.activity) {
      this.knownActivities.set((payload.activity as PocketActivity).id, payload.activity as PocketActivity)
      this.queueActivityReceipt(payload.activity as PocketActivity)
      return
    }
    if (payload.type === 'lumiphone:notification' && payload.notification) {
      this.showIncomingNotification(payload.notification as PhoneNotification)
      return
    }
    if (payload.type === 'lumiphone:generation_status' && payload.run) {
      const history = (this.generation?.history || this.preferences.generationHistory || []).filter((entry) => entry.requestId !== payload.run.requestId)
      history.push(payload.run)
      this.preferences.generationHistory = history.slice(-24)
      if (this.generation) this.generation.history = this.preferences.generationHistory
      if (this.currentApp === 'settings') this.updateSettingsDiagnostics()
      if (this.setupModalOpen && this.setupModalBody && !this.setupPersonaEditing) this.renderFirstChatSetupBody()
      return
    }
    if (payload.type === 'lumiphone:context_preview' && payload.diagnostics) {
      this.contextPreview = payload.diagnostics as PocketContextDiagnostics
      if (this.currentApp === 'settings') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:action_done' && payload.requestId === this.trackerMutationRequest) {
      this.trackerMutationRequest = ''
      if (this.currentApp === 'trackers') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:action_done' && payload.result?.trackerId && payload.requestId === this.trackerSaveRequest) {
      this.trackerDrafts.delete(this.trackerSaveDraftKey)
      this.trackerSaveRequest = ''
      if (this.currentApp === 'trackers' && this.selectedTrackerView === 'config') this.openPocket(this.router.settle({ app: 'trackers', trackerId: String(payload.result.trackerId), view: 'detail' }), false)
      return
    }
    if (payload.type === 'lumiphone:pocket_persona_preview' && payload.persona) {
      if (this.settledOperationRequests.has(payload.requestId)) return
      this.personaPreview = payload.persona as ChatPocketPersona
      if (this.setupModalOpen && this.setupPersonaEditing) this.renderFirstChatPersonaEditor()
      else if (this.currentApp === 'settings') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:identity_profile_saved') {
      refreshIdentityProfileControls(this.screen, this.identityProfiles)
      if (this.setupModalBody) refreshIdentityProfileControls(this.setupModalBody, this.identityProfiles)
      return
    }
    if (payload.type === 'lumiphone:identity_profile_applied') {
      this.personaPreview = null
      if (this.setupModalOpen) this.setupPersonaEditing ? this.renderFirstChatPersonaEditor() : this.renderFirstChatSetupBody()
      else if (this.expanded) this.render(false)
      return
    }
    if (payload.type === 'lumiphone:pocket_persona_saved') {
      this.personaPreview = null
      if (this.setupModalOpen && this.setupPersonaEditing) {
        this.setupPersonaEditing = false
        this.renderFirstChatSetupBody()
      }
      return
    }
    if (payload.type === 'lumiphone:operation_progress' && payload.requestId) {
      const operation: PocketOperationProgress = {
        task: payload.task, requestId: payload.requestId, phase: payload.phase,
        message: payload.message || 'Working…',
      }
      this.recordOperationProgress(operation)
      return
    }
    if (payload.type === 'lumiphone:capabilities') {
      this.caps = payload.capabilities
      if (!this.caps?.panels && this.widget) {
        try { this.widget.destroy() } catch { /* host may already have closed it */ }
        this.widget = null
        this.widgetRoot = null
        this.expanded = false
        this.renderDrawerLanding()
      } else {
        void this.ensureWidget()
      }
      if (this.currentApp === 'settings') this.updateSettingsDiagnostics()
      return
    }
    if (payload.type === 'lumiphone:collection_done') {
      if (payload.requestId === this.collectionRequest) {
        this.collectionRequest = ''
        this.collectionDrafts.delete(this.collectionRequestKey)
        this.openPocket(this.router.settle({ app: 'contacts', view: payload.view || 'groups' }), false)
      }
      this.showFeedback(payload.message || 'Contacts updated.')
      return
    }
    if (payload.type === 'lumiphone:gallery') {
      if (payload.scope && payload.scope !== this.galleryScope) return
      if (payload.requestId && payload.requestId !== this.galleryRequestId) return
      this.galleryLoading = false
      this.gallery = { data: payload.data || [], total: Number(payload.total) || 0, offset: Number(payload.offset) || 0, limit: Number(payload.limit) || GALLERY_PAGE_SIZE }
      if (this.currentApp === 'gallery') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:gallery_action_done' && payload.requestId) {
      const pending = this.galleryActionButtons.get(payload.requestId)
      if (pending) {
        pending.button.disabled = false
        pending.button.textContent = '✓ Done'
        window.setTimeout(() => { pending.button.textContent = pending.idle }, 1_400)
        this.galleryActionButtons.delete(payload.requestId)
      }
      if (payload.action === 'delete' && payload.imageId === this.selectedGalleryImageId) this.selectedGalleryImageId = ''
      this.showFeedback(payload.message || 'Gallery action complete.')
      return
    }
    if (payload.type === 'lumiphone:contact_sources') {
      this.contactSources = Array.isArray(payload.sources) ? payload.sources : []
      this.contactSourcesRequested = true
      if (this.currentApp === 'contacts') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:contact_draft' && payload.draft) {
      if (this.npcDraft) this.previousNpcDraft = structuredClone(this.npcDraft)
      this.npcDraft = structuredClone(payload.draft as PocketContactDraft)
      if (this.currentApp === 'contacts') {
        if (this.selectedContactView === 'quick-gen') this.render(false)
        else this.openPocket({ app: 'contacts', view: 'import' }, false)
      }
      return
    }
    if (payload.type === 'lumiphone:reference_armed') {
      this.showFeedback('Conversation attached to your next roleplay turn.')
      return
    }
    if (payload.type === 'lumiphone:conversation_opened' && payload.conversationId) {
      if (payload.requestId === this.groupSaveRequest) {
        this.groupDrafts.delete(this.groupSaveDraftKey); this.groupSaveRequest = ''
        this.openPocket(this.router.settle({ app: 'messages', conversationId: payload.conversationId, view: 'thread' }), false)
      } else this.openPocket({ app: 'messages', conversationId: payload.conversationId, view: 'thread' })
      return
    }
    if ((payload.type === 'lumiphone:contact_created' || payload.type === 'lumiphone:contact_saved') && payload.contactId) {
      for (const key of this.contactFormDrafts.keys()) if (key.startsWith(`${this.state?.chatId}:${this.state?.characterId}:`)) this.contactFormDrafts.delete(key)
      this.contactSourcesRequested = false
      this.npcDraft = null
      this.previousNpcDraft = null
      const settled = this.router.settle({ app: 'contacts', contactId: payload.contactId, view: 'detail' })
      this.openPocket(settled, false)
      return
    }
    if (payload.type === 'lumiphone:discovered_actor_promoted' && payload.contactId) {
      this.openPocket({ app: 'contacts', contactId: payload.contactId, view: 'detail' }, false)
      return
    }
    if (payload.type === 'lumiphone:npc_bank_saved') {
      this.showFeedback(`${payload.name || 'NPC'} saved to NPC Bank.`)
      return
    }
    if (payload.type === 'lumiphone:npc_bank_added' && payload.contactId) {
      if (payload.openConfig) this.openPocket({ app: 'contacts', contactId: payload.contactId, view: 'config' }, false)
      else this.showFeedback(`${payload.name || 'NPC'} added to this roleplay.`)
      return
    }
    if (payload.type === 'lumiphone:npc_bank_deleted') {
      this.showFeedback(`${payload.name || 'NPC'} removed from NPC Bank. Existing RP contacts were left untouched.`)
      return
    }
    if (payload.type === 'lumiphone:swarm_profile') {
      this.swarmProfile = payload.profile
      if (this.currentApp === 'settings') this.updateSettingsDiagnostics()
      else if (this.currentApp === 'camera') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:camera_progress') {
      if (payload.requestId !== this.cameraRequestId) return
      this.cameraBusy = true
      this.cameraProgress = (payload.message || (payload.phase === 'preview' ? 'Preview developing…' : 'Working…')) + (payload.totalSteps ? ` ${payload.step || 0}/${payload.totalSteps}` : '')
      if (payload.imageDataUrl) this.cameraPreview = payload.imageDataUrl
      if (payload.profile) this.swarmProfile = payload.profile
      if (this.currentApp === 'camera') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:message_progress') {
      const active = this.activeContext()
      if (payload.chatId !== active.chatId || payload.characterId !== active.characterId) return
      if (payload.phase === 'done') this.messageRequests.delete(payload.requestId)
      else this.messageRequests.set(payload.requestId, { conversationId: payload.conversationId, speakerContactId: payload.speakerContactId || payload.contactId, phase: payload.phase === 'checking' ? 'checking' : 'pending' })
      if (this.currentApp === 'messages') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:avatar_uploaded') {
      const pending = this.pendingAvatarDraft
      if (!pending || pending.requestId !== payload.requestId) return
      this.pendingAvatarDraft = null
      if (pending.draft && pending.draft === this.npcDraft) { pending.draft.avatarUrl = payload.imageUrl; pending.draft.avatarSource = { kind: 'asset', assetId: payload.imageId }; pending.draft.avatarFocus = { x: 50, y: 50 }; if (this.currentApp === 'camera' && this.cameraNpcDraft === pending.draft) this.back(); else this.render(false) }
      return
    }
    if (payload.type === 'lumiphone:camera_done') {
      if (payload.requestId !== this.cameraRequestId) return
      this.cameraBusy = false
      this.cameraProgress = 'Photo saved to Gallery'
      this.cameraPreview = payload.imageUrl || this.cameraPreview
      this.cameraReady = Boolean(payload.imageUrl)
      this.cameraImageId = payload.imageId || ''
      if (payload.profile) this.swarmProfile = payload.profile
      if (this.currentApp === 'camera') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:image_options') {
      this.imageConnections = payload.connections || []
      const imageSelect = this.screen.querySelector<HTMLSelectElement>('[data-pocket-image-connection]')
      if (imageSelect) { const selected = imageSelect.value; imageSelect.replaceChildren(new Option('Follow Lumiverse', ''), ...this.imageConnections.map(entry => new Option(entry.name, entry.id))); if (selected && !this.imageConnections.some(entry => entry.id === selected)) imageSelect.append(new Option('Saved connection', selected)); imageSelect.value = selected }
      if (this.currentApp === 'camera') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:camera_cancelled') {
      if (payload.requestId !== this.cameraRequestId) return
      this.cameraBusy = false
      this.cameraProgress = 'Cancelled'
      if (this.currentApp === 'camera') this.render(false)
      return
    }
    if (payload.type === 'lumiphone:export_data' && payload.data) {
      const blob = new Blob([JSON.stringify(payload.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `pocket-${this.state?.chatId || 'backup'}.json`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      return
    }
    if (payload.type === 'lumiphone:error') {
      if (payload.requestId === this.galleryRequestId) this.galleryLoading = false
      if (payload.requestId === this.trackerMutationRequest) this.trackerMutationRequest = ''
      if (payload.requestId === this.trackerJevRequest) { this.trackerJevRequest = ''; this.jevWorking = false }
      if (payload.requestId === this.collectionRequest) this.collectionRequest = ''
      if (payload.requestId === this.groupSaveRequest) this.groupSaveRequest = ''
      if (payload.requestId === this.trackerSaveRequest) this.trackerSaveRequest = ''
      if (payload.requestId === this.pendingAvatarDraft?.requestId) this.pendingAvatarDraft = null
      if (payload.requestId === this.cameraRequestId) { this.cameraBusy = false; this.cameraReady = false; this.cameraProgress = payload.error || 'Image generation failed. Try again.' }
      this.messageRequests.delete(payload.requestId)
      const operation = this.operations.get(payload.requestId)
      if (operation) this.recordOperationProgress({ ...operation, phase: 'error', message: payload.error || 'Operation failed' })
      const galleryAction = this.galleryActionButtons.get(payload.requestId)
      if (galleryAction) { galleryAction.button.disabled = false; galleryAction.button.textContent = galleryAction.idle; this.galleryActionButtons.delete(payload.requestId) }
      const identitySaveError = this.screen.querySelector('[data-identity-request="' + CSS.escape(payload.requestId) + '"]') || this.setupModalBody?.querySelector('[data-identity-request="' + CSS.escape(payload.requestId) + '"]')
      if (identitySaveError) {
        refreshIdentityProfileControls(this.screen, this.identityProfiles, true)
        if (this.setupModalBody) refreshIdentityProfileControls(this.setupModalBody, this.identityProfiles, true)
      }
      this.showError(payload.error || 'Pocket could not complete that action.')
      if (this.expanded && !identitySaveError) this.render(false)
    }
  }

  private unreadCount(): number {
    if (!this.state) return 0
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state)
    const notifications = this.state.notifications.filter((item) => !item.read && !item.dismissedAt && notificationBelongsToDevice(this.state!, owner, item.deviceOwnerActorId)).length
    const messages = this.state.conversations.reduce((sum, conversation) => sum + conversationUnreadForDevice(this.state!, conversation, owner), 0)
    return Math.min(999, Math.max(notifications, messages))
  }

  private updateBadge(): void {
    const unread = this.unreadCount()
    this.launcherBadge.hidden = unread === 0
    this.launcherBadge.textContent = unread > 99 ? '99+' : String(unread)
    this.drawer.setBadge(unread ? (unread > 99 ? '99+' : String(unread)) : null)
    const owner = this.state ? this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state) : ''
    const notificationUnread = this.state?.notifications.filter((entry) => !entry.read && !entry.dismissedAt && notificationBelongsToDevice(this.state!, owner, entry.deviceOwnerActorId)).length || 0
    this.notificationIsland.dataset.unread = String(notificationUnread > 0)
    this.notificationIsland.setAttribute('aria-label', notificationUnread ? `Open Notification Center, ${notificationUnread} unread` : 'Open Notification Center')
  }

  private recordOperationProgress(operation: PocketOperationProgress): void {
    if (this.settledOperationRequests.has(operation.requestId)) return
    const terminal = operation.phase === 'complete' || operation.phase === 'error'
    if (terminal) {
      this.settledOperationRequests.add(operation.requestId)
      if (this.settledOperationRequests.size > 100) this.settledOperationRequests.delete(this.settledOperationRequests.values().next().value!)
    }
    this.operations.set(operation.requestId, operation)
    const updated = this.updateOperationProgress(operation)
    if (this.currentApp === 'contacts' && !updated) this.render(false)
    if (terminal) window.setTimeout(() => {
      if (this.operations.get(operation.requestId) !== operation) return
      this.operations.delete(operation.requestId)
      if (operation.phase !== 'error') this.updateOperationProgress(null, operation.requestId)
      if (this.currentApp === 'contacts' || (this.currentApp === 'settings' && operation.task === 'persona-profile')) this.render(false)
      if (this.setupModalOpen && this.setupModalBody && !this.setupPersonaEditing) this.renderFirstChatSetupBody()
    }, operation.phase === 'error' ? 1_800 : 700)
  }

  private updateOperationProgress(operation: PocketOperationProgress | null, requestId = operation?.requestId || ''): boolean {
    if (!requestId) return false
    const selector = `[data-operation-request="${CSS.escape(requestId)}"]`
    const node = this.screen.querySelector<HTMLElement>(selector) || this.setupModalBody?.querySelector<HTMLElement>(selector) || null
    if (!node) return false
    if (!operation) { node.remove(); return true }
    const label = node.querySelector<HTMLElement>('[data-operation-message]')
    if (label) label.textContent = operation.message
    node.dataset.phase = operation.phase
    if (operation.phase === 'complete' || operation.phase === 'error') node.querySelector('.lp-indeterminate')?.remove()
    const action = this.screen.querySelector<HTMLButtonElement>(`[data-operation-action="${CSS.escape(requestId)}"]`) || this.setupModalBody?.querySelector<HTMLButtonElement>(`[data-operation-action="${CSS.escape(requestId)}"]`)
    if (action && (operation.phase === 'complete' || operation.phase === 'error')) {
      action.disabled = false
      action.textContent = action.dataset.operationIdle || (operation.phase === 'error' ? 'Retry enrichment' : 'Enrich with LLM')
      delete action.dataset.operationAction
      this.screen.querySelector(`[data-operation-stop="${CSS.escape(requestId)}"]`)?.remove()
      this.setupModalBody?.querySelector(`[data-operation-stop="${CSS.escape(requestId)}"]`)?.remove()
    }
    return true
  }

  private updateSettingsDiagnostics(): void {
    const keyStatus = this.screen.querySelector<HTMLElement>('[data-pocket-jev-key-status]')
    if (keyStatus) keyStatus.textContent = this.jevKeyConfigured ? 'API key saved on the host.' : 'No TypeSafe API key saved.'
    const generationNode = this.screen.querySelector<HTMLElement>('[data-pocket-generation-diagnostic]')
    if (generationNode) {
      const run = [...(this.generation?.history || this.preferences.generationHistory || [])].reverse().find((entry) => entry.task === 'connection-test')
      generationNode.dataset.status = run?.status || 'idle'
      generationNode.textContent = !run ? 'Not tested yet.' : run.status === 'started' ? '● Testing…'
        : run.status === 'completed' ? `✓ Success · ${run.latencyMs ?? 0} ms · ${run.connectionName} / ${run.model}`
          : `Failed · ${run.error || 'Unknown provider error'}`
      const testButton = this.screen.querySelector<HTMLButtonElement>('[data-pocket-generation-test]')
      if (testButton) testButton.disabled = !this.caps?.generation || run?.status === 'started'
    }
    const effectiveNode = this.screen.querySelector<HTMLElement>('[data-pocket-generation-effective]')
    if (effectiveNode) {
      const effective = this.generation?.effective
      const title = effectiveNode.querySelector<HTMLElement>('strong')
      const detail = effectiveNode.querySelector<HTMLElement>('span')
      if (title) title.textContent = effective?.name || 'No effective connection'
      const model = (this.settingsDraft?.generationMode === 'sidecar' && this.settingsDraft.sidecarModelOverride) || effective?.model || 'model not set'
      if (detail) detail.textContent = effective ? `${effective.provider} · ${model}` : 'Configure a Lumiverse LLM connection.'
    }
    const swarmNode = this.screen.querySelector<HTMLElement>('[data-pocket-swarm-status]')
    if (swarmNode && this.swarmProfile) {
      swarmNode.dataset.status = this.swarmProfile.status
      swarmNode.textContent = this.swarmProfile.status === 'connected'
        ? `Connected · ${this.swarmProfile.checkpoint || 'profile macros resolved'}`
        : this.swarmProfile.status === 'disabled' ? 'Swarm profile sync is disabled.'
          : this.swarmProfile.status === 'error' ? `Error · ${this.swarmProfile.error}`
            : 'Swarm Studio macros were not detected for this character/persona.'
    }
    for (const row of this.screen.querySelectorAll<HTMLElement>('[data-pocket-swarm-macro]')) {
      const name = row.dataset.pocketSwarmMacro as keyof NonNullable<SwarmVisualProfile['fields']>
      const field = this.swarmProfile?.fields?.[name]
      row.textContent = `${name} · ${field?.detected ? `${field.length} chars · ${field.preview}` : 'empty'}`
    }
  }

  private updatePreferences(next: DevicePreferences, options: { persist?: boolean; resize?: boolean } = {}): void {
    const normalized = normalizePreferences(next)
    if (this.settingsDraft) Object.assign(this.settingsDraft, structuredClone(normalized))
    else this.settingsDraft = structuredClone(normalized)
    if (normalized.notifyMessages !== this.preferences.notifyMessages || normalized.notificationPreviews !== this.preferences.notificationPreviews) this.dismissMochiNotification?.()
    this.preferences = normalized
    applyPocketTouchScroll(this.mobileWidget, normalized.nativeTouchScrollMode)
    this.applyAppearance()
    if (options.resize) this.resizeExpanded()
    this.mountInlineArtifacts()
    this.refreshActivityConnectors()
    if (options.persist === false) return
    window.clearTimeout(this.settingsSaveTimer)
    this.settingsSaveTimer = window.setTimeout(() => {
      this.send('lumiphone:save_preferences', { preferences: this.settingsDraft || this.preferences })
    }, 240)
  }

  private showMochiNotification(notification: MochiNotification): void {
    if (!this.preferences.notifyMessages || !this.expanded || document.hidden) return
    if (this.shell.querySelector('.lp-floating-notification:not(.mochi-notification-toast)')) return
    this.dismissMochiNotification?.()
    this.dismissMochiNotification = showMochiNotification(this.shell, notification, this.preferences.notificationPreviews, () => this.mochi.openRoom(notification.roomId))
  }

  private showIncomingNotification(notification: PhoneNotification): void {
    if (this.state && !notificationBelongsToDevice(this.state, this.currentDeviceOwnerActorId(), notification.deviceOwnerActorId)) return
    if (!this.expanded) {
      this.launcher.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 360 })
      return
    }
    window.clearTimeout(this.notificationTimer)
    this.shell.querySelector('.lp-floating-notification')?.remove()
    const toast = button('', 'lp-floating-notification')
    toast.setAttribute('role', 'status')
    toast.append(icon(notification.app), el('span', 'lp-grow', ''), el('span', 'lp-home-activity-arrow', '›'))
    const copy = toast.children[1]
    copy.append(el('strong', '', notification.title), el('span', '', notification.body))
    toast.addEventListener('click', () => {
      this.send('lumiphone:notification_mark_read', { notificationId: notification.id })
      this.openPocket(notification.route || { app: notification.app })
      toast.remove()
    })
    this.shell.appendChild(toast)
    this.notificationTimer = window.setTimeout(() => toast.remove(), 6_000)
  }

  private applyAppearance(): void {
    const settings = this.settingsDraft || this.preferences
    const identity = this.syncSurfaceIdentity()
    // Persona-specific appearance belongs only to the Persona-owned phone.
    // Inspection surfaces deliberately fall back to the device-wide theme so
    // the active RP Persona cannot visually bleed onto another actor's phone.
    const persona = identity.role === 'persona' && this.activePersona
      ? settings.personaAppearance[this.activePersona.id]
      : null
    const appearance = persona?.enabled ? persona : settings
    this.shell.dataset.theme = appearance.theme
    this.shell.style.setProperty('--lp-accent', appearance.colors.accent)
    this.shell.style.setProperty('--lp-outgoing', outgoingSurface(appearance.colors.accent))
    this.shell.style.setProperty('--lp-bezel', appearance.colors.bezel)
    this.shell.style.setProperty('--lp-bg', appearance.colors.background)
    this.shell.style.setProperty('--lp-surface', appearance.colors.surface)
    this.shell.style.setProperty('--lp-text', appearance.colors.text)
    const homeWallpaper = wallpaperCss(appearance.colors.wallpaperPrimary, appearance.colors.wallpaperSecondary)
    const chatWallpaper = wallpaperCss(appearance.colors.chatPrimary, appearance.colors.chatSecondary)
    const homeSetting = persona?.enabled && persona.homeWallpaper.source ? persona.homeWallpaper : settings.homeWallpaper
    const chatSetting = persona?.enabled && persona.chatWallpaper.source ? persona.chatWallpaper : settings.chatWallpaper
    const homeImage = (persona?.enabled && persona.homeWallpaper.source ? this.resolvedWallpapers.personaHome : this.resolvedWallpapers.deviceHome).url
    const chatImage = (persona?.enabled && persona.chatWallpaper.source ? this.resolvedWallpapers.personaChat : this.resolvedWallpapers.deviceChat).url
    const imageLayer = (url: string, setting: typeof homeSetting, gradient: string) => url
      ? `linear-gradient(rgba(7,6,11,${setting.scrim}),rgba(7,6,11,${setting.scrim})),url(${JSON.stringify(url)}),${gradient}`
      : gradient
    this.shell.style.setProperty('--lp-wallpaper', imageLayer(homeImage, homeSetting, homeWallpaper))
    this.shell.style.setProperty('--lp-chat-wallpaper', imageLayer(chatImage, chatSetting, chatWallpaper))
    this.shell.style.setProperty('--lp-home-wallpaper-size', homeSetting.fit === 'stretch' ? '100% 100%' : homeSetting.fit)
    this.shell.style.setProperty('--lp-home-wallpaper-position', `${homeSetting.focalX * 100}% ${homeSetting.focalY * 100}%`)
    this.shell.style.setProperty('--lp-chat-wallpaper-size', chatSetting.fit === 'stretch' ? '100% 100%' : chatSetting.fit)
    this.shell.style.setProperty('--lp-chat-wallpaper-position', `${chatSetting.focalX * 100}% ${chatSetting.focalY * 100}%`)
    this.shell.style.setProperty('--pocket-ui-scale', String(settings.uiScale))
    this.shell.style.setProperty('--lp-animation-ms', `${settings.reducedMotion ? 0 : settings.animationDurationMs}ms`)
    this.shell.dataset.reducedMotion = String(settings.reducedMotion)
    const customCss = [settings.customCss, persona?.enabled ? persona.customCss : ''].filter(Boolean).join('\n')
    const surfaceSelector = `[data-pocket-surface=\"${identity.surfaceId}\"]`
    this.customStyle.textContent = customCss ? `@scope (${surfaceSelector}) { ${customCss} }` : ''
  }

  private open(): void {
    if (!this.widget) {
      this.drawer.activate()
      this.mountPhoneInDrawer()
      return
    }
    this.expanded = true
    window.clearTimeout(this.collapseTimer)
    this.launcherFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!this.mountInteractiveSurface()) {
      this.expanded = false
      this.drawer.activate()
      this.mountPhoneInDrawer()
      return
    }
    this.launcher.hidden = true
    this.shell.hidden = false
    this.resizeExpanded()
    this.render(true)
    this.refresh()
    this.announceView()
    requestAnimationFrame(() => {
      this.shell.tabIndex = -1
      this.shell.focus({ preventScroll: true })
    })
  }

  private close(): void {
    this.dismissMochiNotification?.()
    this.mochi.leave()
    this.voicePlayer.stop()
    if (!this.widget && !this.dockPanel && !this.mobileWidget) return
    this.expanded = false
    this.shell.hidden = true
    this.launcher.hidden = false
    this.releaseDockPanel()
    if (this.mobileWidget) {
      this.mobileWidget.setFullscreen(false)
      this.mobileWidget.setVisible(false)
    }
    this.announceView()
    window.clearTimeout(this.collapseTimer)
    this.collapseTimer = window.setTimeout(() => {
      this.launcherFocus?.focus({ preventScroll: true })
      this.launcherFocus = null
    }, this.preferences.reducedMotion || this.preferences.animation === 'none' ? 0 : this.preferences.animationDurationMs)
  }

  private resizeExpanded(): void {
    if (!this.expanded) return
    const previousRoot = this.handsetHost.parentElement
    this.mountInteractiveSurface()
    // Shared host controls belong to their placement root; remount after a device moves.
    if (this.currentApp === 'settings' && previousRoot !== this.handsetHost.parentElement) this.render(false)
  }

  private openApp(app: PhoneApp): void {
    this.openPocket({ app } as PocketRoute)
  }

  private inlineOptions(activity: PocketActivity): ActivityRenderOptions {
    if (!this.state) return {}
    const owner = activityDeviceOwner(this.state, activity, this.currentDeviceOwnerActorId())
    const persona = owner === pocketPersonaActorId(this.state) && this.activePersona ? this.preferences.personaAppearance[this.activePersona.id] : null
    const appearance = persona?.enabled ? persona : this.preferences
    const image = persona?.enabled && persona.chatWallpaper.source ? this.resolvedWallpapers.personaChat : this.resolvedWallpapers.deviceChat
    const wallpaper = persona?.enabled && persona.chatWallpaper.source ? persona.chatWallpaper : this.preferences.chatWallpaper
    const gradient = wallpaperCss(appearance.colors.chatPrimary, appearance.colors.chatSecondary)
    const background = image.url ? `linear-gradient(rgba(7,6,11,${wallpaper.scrim}),rgba(7,6,11,${wallpaper.scrim})),url(${JSON.stringify(image.url)}),${gradient}` : gradient
    return { appearance: this.preferences.inlineAppearance || 'cards', clock: activityClock(activity, this.state), accent: appearance.colors.accent, background,
      backgroundSize: `cover,${wallpaper.fit},cover`, backgroundPosition: `center,${wallpaper.focalX * 100}% ${wallpaper.focalY * 100}%,center`,
      textColor: appearance.colors.text, surfaceColor: appearance.colors.surface,
      avatarUrl: activity.presentation?.senderActorId ? resolvePocketActor(this.state, activity.presentation.senderActorId)?.avatarUrl : undefined,
      avatars: Object.fromEntries((activity.presentation?.batchMessages || []).map(row => [row.senderActorId || '', resolvePocketActor(this.state!, row.senderActorId || '')?.avatarUrl || ''])) }
  }

  private openActivity(activity: PocketActivity): void {
    if (!this.state) return
    const owner = activityDeviceOwner(this.state, activity, this.currentDeviceOwnerActorId())
    if (!owner) { this.showError('This conversation is no longer available.'); return }
    if (owner !== this.currentDeviceOwnerActorId()) {
      if (this.cameraBusy) this.send('lumiphone:camera_cancel', { requestId: this.cameraRequestId })
      this.cameraRequestId = ''; this.cameraBusy = false; this.cameraReady = false; this.cameraPreview = ''; this.cameraContactId = ''; this.cameraNpcDraft = null
      this.deviceOwnerActorId = owner
      this.selectedConversationId = ''; this.selectedMessageId = ''
      this.router.reset({ app: 'home' })
      this.syncSurfaceIdentity(); this.updateBadge(); this.renderDrawerLanding()
    }
    this.openPocket(activity.route)
  }

  private back(): void {
    this.openPocket(this.router.back(), false)
  }

  private home(): void {
    this.openPocket(this.router.home(), false)
  }

  private openPocket(routeInput: PocketRoute, pushHistory = true): void {
    const normalized = normalizePocketRoute(routeInput)
    const route = this.router.navigate(normalized, !pushHistory)
    if (this.currentApp === 'mochi' && route.app !== 'mochi') this.mochi.leave()
    if (!this.state && route.app !== 'mochi') {
      this.pendingRoute = route
      this.open()
      this.refresh()
      return
    }
    if (!this.expanded) this.open()
    if (this.currentApp === 'settings' && route.app !== 'settings') this.settingsDraft = null
    this.currentApp = route.app
    if (route.app === 'mochi') {
      this.mochi.select(route.roomId || '')
      if (!this.mochi.state) this.mochi.load()
      this.render(true)
      return
    }
    if (!this.state) return
    if (route.app === 'messages') {
      const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state)
      const conversation = (route.conversationId ? this.state.conversations.find((entry) => entry.id === route.conversationId && conversationVisibleOnDevice(this.state!, entry, owner)) : null)
        || (route.contactId ? this.state.conversations.find((entry) => entry.kind === 'direct' && conversationVisibleOnDevice(this.state!, entry, owner) && conversationActorIds(entry).includes(route.contactId!)) : null)
      this.selectedConversationId = conversation?.id || ''
      this.selectedConversationView = route.view || 'thread'
      this.selectedMessageId = conversation && route.messageId && conversation.messages.some((entry) => entry.id === route.messageId) ? route.messageId : ''
      this.send('lumiphone:mark_read', conversation ? { app: 'messages', conversationId: conversation.id } : { app: 'messages' })
    } else if (route.app === 'contacts') {
      const contact = route.contactId ? this.state.contacts.find((entry) => entry.id === route.contactId) : null
      this.selectedContactId = route.view === 'bank-entry' ? route.contactId || '' : contact?.id || ''
      this.selectedContactGroupId = route.groupId || ''
      this.selectedContactView = contact ? route.view === 'config' ? 'config' : 'detail' : route.view || 'list'
      this.send('lumiphone:mark_read', { app: 'contacts' })
    } else if (route.app === 'trackers') {
      const tracker = route.trackerId ? this.state.trackers.find((entry) => entry.id === route.trackerId) : null
      this.selectedTrackerId = tracker?.id || (route.trackerId?.startsWith('__template') ? route.trackerId : '')
      this.selectedTrackerView = route.view || 'detail'
      this.send('lumiphone:mark_read', { app: 'trackers' })
    } else if (route.app === 'calendar') {
      this.selectedEventId = route.eventId === '__new__' || (route.eventId && this.state.events.some((entry) => entry.id === route.eventId)) ? route.eventId : ''
      this.send('lumiphone:mark_read', { app: 'calendar' })
    } else if (route.app === 'notes') {
      this.selectedNoteId = route.noteId === '__new__' || (route.noteId && this.state.notes.some((entry) => entry.id === route.noteId)) ? route.noteId : ''
      this.send('lumiphone:mark_read', { app: 'notes' })
    } else if (route.app === 'camera') {
      const contactId = route.draft ? '__draft__' : route.contactId || ''
      if (contactId !== this.cameraContactId) {
        this.cameraContactId = contactId
        this.cameraPreview = ''; this.cameraReady = false; this.cameraRequestId = ''; this.cameraBusy = false; this.cameraProgress = ''
        const contact = this.state.contacts.find(entry => entry.id === contactId)
        this.cameraNpcDraft = route.draft ? this.npcDraft : null
        const subject = contact || this.cameraNpcDraft
        this.cameraDraft = { scene: subject ? [`Portrait of ${subject.name}`, subject.phoneProfile?.appearance || subject.identityBrief, 'Head and shoulders, one subject, looking at the camera, clean background'].filter(Boolean).map(part => part.trim().replace(/[.!]+$/, '')).join('. ') + '.' : '', enhance: false }
        this.cameraOptions = { purpose: route.draft ? 'draft' : contactId ? 'contact' : 'scene', aspect: contactId ? '1:1' : '', connectionId: '', model: '' }
        this.cameraFocus = { x: 50, y: 50 }; this.cameraImageId = ''
      }
      this.send('lumiphone:image_options')
      this.send('lumiphone:mark_read', { app: 'camera' })
    } else if (route.app === 'gallery') {
      this.selectedGalleryImageId = route.imageId || ''
      this.requestGallery(this.galleryScope)
      this.send('lumiphone:mark_read', { app: 'gallery' })
    } else if (route.app === 'settings') {
      this.selectedSettingsSection = route.section || ''
      this.settingsDraft ||= structuredClone(this.preferences)
      if (this.selectedSettingsSection === 'camera') this.send('lumiphone:image_options', {})
      this.send('lumiphone:mark_read', { app: 'settings' })
    } else if (route.app !== 'home') {
      this.send('lumiphone:mark_read', { app: route.app })
    }
    this.announceView()
    this.render(true)
  }

  private installInlineArtifactObserver(): void {
    if (this.inlineArtifactObserver || typeof MutationObserver === 'undefined') return
    this.inlineArtifactObserver = new MutationObserver(() => this.scheduleInlineArtifactMount())
    this.inlineArtifactObserver.observe(document.body, { childList: true, subtree: true })
    this.scheduleInlineArtifactMount()
  }

  private scheduleInlineArtifactMount(): void {
    if (this.inlineMountFrame || this.destroyed) return
    let firedSynchronously = false
    const frame = requestAnimationFrame(() => {
      firedSynchronously = true
      this.inlineMountFrame = 0
      this.mountInlineArtifacts()
    })
    // Browser RAF is asynchronous, but test hosts/polyfills may invoke the
    // callback synchronously. Do not overwrite the callback's reset with the
    // returned handle in that case or future inline mounts will deadlock.
    if (!firedSynchronously) this.inlineMountFrame = frame
  }

  private inlineHosts(activityId: string): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>('[data-pocket-inline-anchor]')]
      .filter((node) => node.dataset.pocketInlineAnchor === activityId)
  }

  private provisionalActivityIsActive(record: { activity: PocketActivity; origin: PocketTurnCandidateOrigin }): boolean {
    const active = this.activeContext()
    if (record.activity.scope.chatId !== active.chatId || record.activity.scope.characterId !== active.characterId) return false
    if (record.origin.chatId !== active.chatId) return false
    const selection = [...(this.state?.hostSwipeSelections || [])].reverse().find((entry) => entry.hostMessageId === record.origin.hostMessageId)
    return !selection || selection.swipeId === record.origin.swipeId
  }

  private inlineActivity(activityId: string): PocketActivity | undefined {
    const canonical = this.knownActivities.get(activityId)
    if (canonical) return canonical
    const provisional = this.provisionalActivities.get(activityId)
    return provisional && this.provisionalActivityIsActive(provisional) ? provisional.activity : undefined
  }

  private mountInlineArtifacts(): void {
    const active = this.activeContext()
    for (const host of document.querySelectorAll<HTMLElement>('[data-pocket-inline-anchor]')) {
      const activityId = host.dataset.pocketInlineAnchor || ''
      const activity = this.inlineActivity(activityId)
      if (!activity || activity.scope.chatId !== active.chatId || activity.scope.characterId !== active.characterId) {
        if (host.dataset.pocketMounted === 'true') host.replaceChildren()
        host.hidden = true
        delete host.dataset.pocketMounted
        continue
      }
      host.hidden = false
      host.classList.add('pocket-inline-anchor')
      host.dataset.pocketActivityId = activity.id
      const options = this.inlineOptions(activity)
      const appearanceKey = JSON.stringify(options)
      if (host.dataset.pocketMounted !== 'true' || host.dataset.pocketAppearance !== appearanceKey) {
        host.dataset.pocketMounted = 'true'
        host.dataset.pocketAppearance = appearanceKey
        renderActivityHost(host, activity, () => this.openActivity(activity), { ...options, includeArtifact: true, includeReceipt: false })
      }
      const fallback = this.injectedActivities.get(activity.id)
      if (fallback) {
        this.ctx.dom.uninject(fallback)
        this.injectedActivities.delete(activity.id)
      }
      this.pendingActivities.delete(activity.id)
    }
    this.refreshActivityConnectors()
  }

  private refreshActivityConnectors(): void {
    if (!this.state) return
    const entries = [...this.injectedActivities].flatMap(([id, host]) => {
      const activity = this.inlineActivity(id)
      return activity && (activity.kind === 'message' || activity.kind === 'call') ? [{ host, activity, options: this.inlineOptions(activity), owner: activityDeviceOwner(this.state!, activity, this.currentDeviceOwnerActorId()) || '' }] : []
    })
    refreshActivityConnectors(entries, activity => this.openActivity(activity))
  }

  private pruneInactiveActivitySurfaces(): void {
    for (const [activityId, injected] of this.injectedActivities) {
      if (this.inlineActivity(activityId)) continue
      this.ctx.dom.uninject(injected)
      this.injectedActivities.delete(activityId)
      this.pendingActivities.delete(activityId)
    }
    this.refreshActivityConnectors()
    for (const activityId of [...this.pendingActivities.keys()]) {
      if (!this.inlineActivity(activityId)) this.pendingActivities.delete(activityId)
    }
  }

  private clearActivitySurfaces(clearKnown = false, clearProvisional = false): void {
    for (const injected of this.injectedActivities.values()) this.ctx.dom.uninject(injected)
    this.injectedActivities.clear()
    this.pendingActivities.clear()
    if (clearKnown) this.knownActivities.clear()
    if (clearProvisional) this.provisionalActivities.clear()
    for (const host of document.querySelectorAll<HTMLElement>('[data-pocket-inline-anchor]')) {
      host.replaceChildren()
      host.hidden = true
      delete host.dataset.pocketMounted
      delete host.dataset.pocketActivityId
    }
  }

  private tryRenderInlineArtifact(activity: PocketActivity): boolean {
    this.mountInlineArtifacts()
    const hosts = this.inlineHosts(activity.id).filter((host) => host.dataset.pocketMounted === 'true' && !host.hidden)
    if (!hosts.length) return false
    const fallback = this.injectedActivities.get(activity.id)
    if (fallback) {
      this.ctx.dom.uninject(fallback)
      this.injectedActivities.delete(activity.id)
    }
    return true
  }

  private queueActivityReceipt(activity: PocketActivity): void {
    const active = this.activeContext()
    if (activity.scope.chatId !== active.chatId || activity.scope.characterId !== active.characterId) return
    if (this.tryRenderInlineArtifact(activity)) return
    if (this.injectedActivities.has(activity.id)) { this.refreshActivityConnectors(); return }
    if (!activity.source?.messageId) return
    this.pendingActivities.set(activity.id, activity)
    this.sweepActivityReceipts()
  }

  private sweepActivityReceipts(): void {
    this.mountInlineArtifacts()
    for (const [activityId, activity] of this.pendingActivities) {
      if (this.tryRenderInlineArtifact(activity)) {
        this.pendingActivities.delete(activityId)
        continue
      }
      const injected = activityReceipt(this.ctx, activity, () => this.openActivity(activity), this.inlineOptions(activity))
      if (!injected) continue
      this.pendingActivities.delete(activityId)
      this.injectedActivities.set(activityId, injected)
    }
    this.refreshActivityConnectors()
    if (this.pendingActivities.size && !this.receiptSweepTimer) {
      this.receiptSweepTimer = window.setInterval(() => {
        if (!this.pendingActivities.size) {
          window.clearInterval(this.receiptSweepTimer)
          this.receiptSweepTimer = 0
          return
        }
        this.sweepActivityReceipts()
      }, 1_500)
    }
  }

  private render(transition = false): void {
    const oldView = this.screen.querySelector<HTMLElement>('.lumiphone-app-view')
    const oldViewScroll = oldView?.scrollTop || 0
    const oldThread = this.screen.querySelector<HTMLElement>('[data-pocket-thread]')
    const oldThreadScroll = oldThread?.scrollTop
    const oldThreadNearBottom = oldThread ? oldThread.scrollHeight - oldThread.clientHeight - oldThread.scrollTop < 72 : false
    const focusedComposer = document.activeElement instanceof HTMLTextAreaElement ? document.activeElement.dataset.pocketComposer : ''
    const selection = document.activeElement instanceof HTMLTextAreaElement ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] as const : null
    for (const cleanup of this.viewCleanups.splice(0)) cleanup()
    if (!this.state && this.currentApp !== 'mochi') {
      this.screen.replaceChildren(this.loadingView())
      return
    }
    this.applyAppearance()
    const view = this.currentApp === 'mochi' ? this.mochi.render()
      : this.currentApp === 'home' ? this.renderHome()
      : this.currentApp === 'messages' ? this.renderMessages()
      : this.currentApp === 'contacts' ? this.renderContacts()
      : this.currentApp === 'gallery' ? this.renderGallery()
      : this.currentApp === 'camera' ? this.renderCamera()
      : this.currentApp === 'notes' ? this.renderNotes()
      : this.currentApp === 'weather' ? this.renderWeather()
      : this.currentApp === 'calendar' ? this.renderCalendar()
      : this.currentApp === 'trackers' ? this.renderTrackers()
      : this.currentApp === 'notifications' ? this.renderNotifications()
      : this.renderSettings()
    view.classList.add('lumiphone-app-view')
    if (this.state && this.currentApp === 'contacts' && ['config', 'new', 'draft'].includes(this.selectedContactView)) {
      const key = `${this.state.chatId}:${this.state.characterId}:${this.selectedContactId}:${this.selectedContactView}`
      const fields = [...view.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')]
      const draft = this.contactFormDrafts.get(key)
      fields.forEach((field, index) => { if (draft?.[index]) { field.value = draft[index].value; if (field instanceof HTMLInputElement) field.checked = draft[index].checked } })
      const remember = () => this.contactFormDrafts.set(key, fields.map(field => ({ value: field.value, checked: field instanceof HTMLInputElement && field.checked })))
      view.addEventListener('input', remember); view.addEventListener('change', remember)
    }
    view.dataset.pocketApp = this.currentApp
    const animation = this.preferences.reducedMotion ? 'none' : this.preferences.animation
    if (transition && animation !== 'none') {
      view.dataset.animate = animation
      view.addEventListener('animationend', () => view.removeAttribute('data-animate'), { once: true })
    }
    this.screen.replaceChildren(view)
    if (!transition) requestAnimationFrame(() => {
      view.scrollTop = oldViewScroll
      const thread = this.screen.querySelector<HTMLElement>('[data-pocket-thread]')
      if (thread && oldThreadScroll !== undefined) thread.scrollTop = oldThreadNearBottom ? thread.scrollHeight : oldThreadScroll
      if (focusedComposer) {
        const composer = this.screen.querySelector<HTMLTextAreaElement>(`[data-pocket-composer="${CSS.escape(focusedComposer)}"]`)
        composer?.focus({ preventScroll: true })
        if (composer && selection) composer.setSelectionRange(selection[0], selection[1])
      }
    })
  }

  private loadingView(): HTMLElement {
    const node = el('div', 'lp-page lp-empty')
    const inner = el('div')
    inner.innerHTML = `${PHONE_ICON}<p>Waking Pocket…</p>`
    node.appendChild(inner)
    return node
  }

  private page(title: string, subtitle = '', action?: PageAction): { page: HTMLDivElement; content: HTMLDivElement } {
    const page = el('div', 'lp-page')
    const nav = el('header', 'lp-nav')
    const back = button('‹ Back', 'lp-nav-action')
    back.addEventListener('click', () => this.back())
    const heading = el('div', 'lp-nav-title', title)
    if (subtitle) heading.appendChild(el('span', 'lp-nav-subtitle', subtitle))
    const right = button(action?.label || '', 'lp-nav-action')
    right.disabled = !action || action.enabled === false
    if (action?.ariaLabel) right.setAttribute('aria-label', action.ariaLabel)
    if (action) right.addEventListener('click', action.callback)
    nav.append(back, heading, right)
    const content = el('div', 'lp-content')
    page.append(nav, content)
    return { page, content }
  }

  private renderHome(): HTMLDivElement {
    const state = this.state!
    const home = el('div', 'lp-home')
    const head = el('div', 'lp-home-head')
    const left = el('div')
    const roleplayClockText = state.roleplayClockSource === 'narrative' && state.roleplayClockPrecision !== 'exact'
      ? clockLabel(state.roleplayClockLabel) || 'Story time'
      : formatTime(state.roleplayNow)
    left.append(el('div', 'lp-home-date', formatDate(state.roleplayNow, false)), el('div', 'lp-home-clock', roleplayClockText))
    const weather = el('button', 'lp-home-weather')
    weather.type = 'button'
    weather.append(icon('weather'), el('span', '', `${state.weather.temperature}°${state.weather.unit} · ${state.weather.condition}`))
    weather.addEventListener('click', () => this.openApp('weather'))
    head.append(left, weather)
    const grid = el('div', 'lp-app-grid')
    for (const meta of APP_META.filter((entry) => !entry.dock)) grid.appendChild(this.appIcon(meta))
    const activity = el('div', 'lp-home-activity')
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(state)
    const recentNotifications = state.notifications.filter((entry) => !entry.dismissedAt && !entry.read && notificationBelongsToDevice(state, owner, entry.deviceOwnerActorId)).slice(0, 3)
    for (const item of recentNotifications) {
      const receipt = button('', 'lp-home-activity-item')
      receipt.append(el('strong', '', item.title), el('span', '', item.body || item.app), el('span', 'lp-home-activity-arrow', '›'))
      receipt.setAttribute('aria-label', `Open ${item.title}`)
      receipt.addEventListener('click', () => {
        this.send('lumiphone:notification_mark_read', { notificationId: item.id })
        this.openPocket(item.route || { app: item.app })
      })
      activity.appendChild(receipt)
    }
    if (recentNotifications.length) {
      const all = button('View all notifications', 'lp-home-notifications-all')
      all.addEventListener('click', () => this.openPocket({ app: 'notifications' }))
      activity.appendChild(all)
    }
    const dock = el('div', 'lp-home-dock')
    for (const meta of APP_META.filter((entry) => entry.dock)) dock.appendChild(this.appIcon(meta))
    home.append(head)
    if (!state.setup.initialized && !state.setup.dismissed && owner === pocketPersonaActorId(state)) {
      const prompt = el('section', 'lp-home-setup')
      prompt.setAttribute('aria-label', 'Set up Pocket')
      prompt.append(el('strong', '', 'Make this phone yours'), el('p', '', 'Ready when you are. Connect a model and choose how Pocket joins your story.'))
      const actions = el('div', 'lp-row')
      const run = button('Run setup', 'lp-button')
      run.addEventListener('click', () => this.showFirstChatSetup(true))
      const skip = button('Skip', 'lp-button lp-button-quiet')
      skip.addEventListener('click', () => { this.send('lumiphone:dismiss_setup'); prompt.remove() })
      actions.append(run, skip); prompt.append(actions); home.append(prompt)
    }
    home.append(grid)
    if (activity.childElementCount) home.appendChild(activity)
    home.appendChild(dock)
    return home
  }

  private appIcon(meta: typeof APP_META[number]): HTMLButtonElement {
    const node = el('button', 'lp-app-icon')
    node.type = 'button'
    node.setAttribute('aria-label', meta.label)
    const box = el('span', `lp-app-icon-box lp-icon-${meta.icon}`)
    box.appendChild(icon(meta.icon))
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state!)
    const unread = meta.app === 'messages'
      ? this.state!.conversations.reduce((sum, conversation) => sum + conversationUnreadForDevice(this.state!, conversation, owner), 0)
      : this.state!.notifications.filter((item) => !item.read && !item.dismissedAt && item.app === meta.app && notificationBelongsToDevice(this.state!, owner, item.deviceOwnerActorId)).length
    if (unread) box.appendChild(el('span', 'lp-app-dot', unread > 99 ? '99+' : String(unread)))
    node.append(box, el('span', 'lp-app-label', meta.label))
    node.addEventListener('click', () => this.openApp(meta.app))
    return node
  }

  private renderMessages(): HTMLDivElement {
    this.viewCleanups.push(() => this.voicePlayer.stop())
    const owner = this.currentDeviceOwnerActorId() || pocketPersonaActorId(this.state!)
    return renderMessagesView({
      state: this.state!, selectedConversationId: this.selectedConversationId,
      renderVoiceMessage: message => this.voicePlayer.render(message, this.preferences.ttsVoiceURI, this.preferences.voiceMessages !== false, this.preferences.ttsConnectionId, this.preferences.ttsConnectionOptions?.[this.preferences.ttsConnectionId || '']),
      deviceOwnerActorId: owner, readOnlyDevice: owner !== pocketPersonaActorId(this.state!),
      selectedMessageId: this.selectedMessageId,
      selectedView: this.selectedConversationView,
      groupDraft: this.groupDrafts.get(`${this.state!.chatId}:${this.state!.characterId}:${this.selectedConversationId || 'new'}`),
      updateGroupDraft: draft => { this.groupDrafts.set(`${this.state!.chatId}:${this.state!.characterId}:${this.selectedConversationId || 'new'}`, draft) },
      groupSaving: Boolean(this.groupSaveRequest),
      saveGroup: (type, payload) => { if (this.groupSaveRequest) return; this.groupSaveDraftKey = `${this.state!.chatId}:${this.state!.characterId}:${this.selectedConversationId || 'new'}`; this.groupSaveRequest = this.send(type, payload) },
      openContacts: () => this.openPocket({ app: 'contacts', view: 'import' }),
      startContactGroup: (title, participants) => {
        const actors = listPocketActors(this.state!)
        this.groupDrafts.set(`${this.state!.chatId}:${this.state!.characterId}:new`, { title, participants: participants.map(id => actors.find(actor => actor.contact?.id === id)?.actorId || id) })
        this.openPocket({ app: 'messages', view: 'group-editor' })
      },
      generationAvailable: Boolean(this.caps?.generation), busyConversations: new Map([...this.messageRequests.values()].map((entry) => [entry.conversationId, { speakerContactId: entry.speakerContactId, phase: entry.phase }])),
      selectedGroupSpeakerId: this.groupSpeakerSelections.get(this.selectedConversationId) || 'auto',
      draft: this.messageDrafts.get(this.selectedConversationId) || '',
      updateDraft: (conversationId, value) => { if (value) this.messageDrafts.set(conversationId, value); else this.messageDrafts.delete(conversationId) },
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      empty: (title, copy) => this.empty('messages', title, copy), iconButton,
      selectConversation: (conversationId, view = 'thread') => this.openPocket({ app: 'messages', conversationId: conversationId || undefined, view }),
      openActor: (actorId) => {
        const actor = resolvePocketActor(this.state!, actorId)
        if (actor?.contact) this.openPocket({ app: 'contacts', contactId: actor.contact.id, view: 'detail' })
        else if (actor?.discovered) this.send('lumiphone:promote_discovered_actor', { actorId })
      },
      openDirect: (contactId) => this.send('lumiphone:open_direct', { contactId }),
      send: (type, payload) => { this.send(type, payload) },
      generateReply: (conversationId, speakerContactId) => this.generateReply(conversationId, speakerContactId),
      cancelReply: conversationId => {
        this.send('lumiphone:cancel_message_generation', { conversationId })
        for (const [requestId, request] of this.messageRequests) if (request.conversationId === conversationId) this.messageRequests.delete(requestId)
        this.render()
      },
      selectGroupSpeaker: (conversationId, speakerContactId) => {
        if (speakerContactId === 'auto') this.groupSpeakerSelections.delete(conversationId)
        else this.groupSpeakerSelections.set(conversationId, speakerContactId)
        this.render(false)
      },
      composerState: (conversationId, held) => { this.send('lumiphone:composer_state', { conversationId, held }) },
      messageAnyway: (conversationId) => { this.manualMessageOverrides.add(conversationId); this.render(false) },
      manualOverride: this.manualMessageOverrides.has(this.selectedConversationId),
      continueRelay: () => { this.send('lumiphone:continue_relay', { conversationId: this.selectedConversationId }) },
      continueArrival: (conversationId) => { this.send('lumiphone:continue_arrival', { conversationId }) },
      openRoleplay: () => this.close(),
      openTimeline: (eventId) => this.openPocket({ app: 'calendar', eventId }),
      scheduleEventSuggestion: (conversationId, messageId) => this.scheduleEventSuggestion(conversationId, messageId),
      declineEventSuggestion: (conversationId, messageId) => this.declineEventSuggestion(conversationId, messageId),
      showReferenceSheet: (conversationId) => this.showReferenceSheet(conversationId),
      cancelReference: (referenceId) => this.send('lumiphone:cancel_reference', { referenceId }),
      rearmReference: (referenceId) => this.send('lumiphone:rearm_reference', { referenceId }),
      showConversationGenerationInfo: (conversationId) => this.showConversationGenerationInfo(conversationId),
      showOutgoingPrompt: (conversationId) => this.showOutgoingPrompt(conversationId),
      shouldFocusHandoff: (relayId) => {
        if (this.focusedHandoffRelays.has(relayId)) return false
        const relay = this.state?.relays.find((entry) => entry.id === relayId)
        const conversation = relay ? this.state?.conversations.find((entry) => entry.id === relay.conversationId) : null
        if (!relay || (relay.kind === 'arrival' ? conversation?.availability.state !== 'arriving' : conversation?.availability.state !== 'local')) return false
        this.focusedHandoffRelays.add(relayId)
        return true
      },
      showGenerationInfo: (message) => this.showMessageGenerationInfo(message),
      back: () => this.back(),
    })
  }

  private scheduleEventSuggestion(conversationId: string, messageId: string): void {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId)
    const message = conversation?.messages.find((entry) => entry.id === messageId)
    const suggestion = message?.eventSuggestion
    if (!conversation || !message || !suggestion || suggestion.status !== 'pending') return
    this.pendingEventSuggestion = { conversationId, messageId, suggestion: structuredClone(suggestion) }
    this.openPocket({ app: 'calendar', eventId: '__new__' })
  }

  private declineEventSuggestion(conversationId: string, messageId: string): void {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId)
    const message = conversation?.messages.find((entry) => entry.id === messageId)
    const suggestion = message?.eventSuggestion
    if (!suggestion || suggestion.status !== 'pending') return
    this.send('lumiphone:decline_event_suggestion', {
      conversationId,
      messageId,
      suggestionId: suggestion.id,
    })
    requestAnimationFrame(() => {
      const composer = this.screen.querySelector<HTMLTextAreaElement>(`[data-pocket-composer="${CSS.escape(conversationId)}"]`)
      composer?.focus({ preventScroll: false })
      composer?.classList.add('lp-scheduler-composer-focus')
      window.setTimeout(() => composer?.classList.remove('lp-scheduler-composer-focus'), 900)
    })
  }

  private showMessageGenerationInfo(message: import('../types.js').PhoneMessage): void {
    const info = message.generation?.info
    const modal = this.ctx.ui.showModal({ title: 'Generation info', width: 460, maxHeight: 620 })
    const content = el('div', 'lp-settings-section')
    if (!info && message.origin) {
      const selectedSwipe = [...(this.state?.hostSwipeSelections || [])].reverse().find((entry) => entry.hostMessageId === message.origin!.hostMessageId)?.swipeId
      for (const [label, value] of [
        ['Source', 'Main roleplay generation · Pocket Action'],
        ['Host message', message.origin.hostMessageId],
        ['Swipe candidate', String(message.origin.swipeId + 1)],
        ['Candidate state', selectedSwipe === undefined || selectedSwipe === message.origin.swipeId ? 'active' : 'inactive'],
        ['Generation ID', message.origin.generationId || 'not recorded'],
      ]) {
        const row = el('div', 'lp-row-between'); row.append(el('strong', '', label), el('span', 'lp-copy', value)); content.appendChild(row)
      }
      content.appendChild(el('p', 'lp-copy', 'This message was authored by the main RP model and persisted through Pocket Action. Retry is intentionally not offered here because rewriting only the phone bubble would diverge from the source RP swipe.'))
    } else if (!info) {
      content.appendChild(el('p', 'lp-copy', `Request ${message.generation?.requestId || 'unknown'} predates detailed diagnostics.`))
    } else {
      for (const [label, value] of [
        ['Speaker', info.speaker], ['Source', `${info.source} · ${info.sourceId}`], ['Source resolution', info.sourceResolution],
        ['Active character used', `${info.activeCharacterUsed ? 'yes' : 'no'} · ${info.activeCharacterId}`], ['Identity', `${info.identityChars} chars`],
        ['Scene snapshot', info.sceneSnapshotStale ? 'stale' : 'current'], ['Context mode', info.contextMode],
        ['Recent RP', `${info.recentCount} messages · ${info.recentChars} chars`], ['Story', `${info.storyCount} facts · ${info.storyChars} chars`],
        ['Phone thread', `${info.threadCount} messages · ${info.threadChars} chars`], ['Generation', `${info.generationMode} · ${info.connectionName} · ${info.model}`],
      ]) {
        const row = el('div', 'lp-row-between'); row.append(el('strong', '', label), el('span', 'lp-copy', value)); content.appendChild(row)
      }
      if (info.replyDecision) {
        const decision = info.replyDecision
        const row = el('div', 'lp-row-between')
        row.append(el('strong', '', 'Channel decision'), el('span', 'lp-copy', `${decision.rawAction} → ${decision.normalizedAction}${decision.reason ? ` · ${decision.reason}` : ''}${decision.normalizationReason ? ` · ${decision.normalizationReason}` : ''}`))
        content.appendChild(row)
      }
      if (info.groupBatch) {
        for (const [label, value] of [
          ['Group batch', info.groupBatch.id],
          ['Batch position', `${info.groupBatch.position} of ${info.groupBatch.size}`],
          ['Eligible contacts', String(info.groupBatch.eligibleCount)],
        ]) {
          const row = el('div', 'lp-row-between'); row.append(el('strong', '', label), el('span', 'lp-copy', value)); content.appendChild(row)
        }
      }
    }
    modal.root.appendChild(content)
  }

  private showReferenceSheet(conversationId: string): void {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId)
    if (!conversation) return
    const modal = this.ctx.ui.showModal({ title: 'Reference in roleplay', width: 480, maxHeight: 680 })
    const content = el('div', 'lp-reference-sheet')
    content.appendChild(el('p', 'lp-copy', 'Attach Pocket context to your next normal roleplay turn. Pocket will wait for your RP message and will not change anyone’s scene presence.'))
    let scope: 'conversation' | 'recent_messages' | 'selected_messages' = 'conversation'
    const messageInputs: HTMLInputElement[] = []
    const attach = button('Attach to next RP turn', 'lp-button lp-button-primary')
    const update = () => {
      for (const input of messageInputs) input.disabled = scope !== 'selected_messages'
      attach.disabled = scope === 'selected_messages' && !messageInputs.some((input) => input.checked)
    }
    const addScope = (value: typeof scope, label: string, description: string) => {
      const row = el('label', 'lp-reference-scope')
      const input = el('input')
      input.type = 'radio'; input.name = `reference-scope-${conversation.id}`; input.value = value; input.checked = scope === value
      input.dataset.referenceScope = value
      input.addEventListener('change', () => { if (input.checked) { scope = value; update() } })
      const copy = el('span', 'lp-grow')
      copy.append(el('strong', '', label), el('span', 'lp-copy', description))
      row.append(input, copy)
      content.appendChild(row)
    }
    addScope('conversation', 'Current conversation', 'Conversation state, participants, and up to 8 recent messages.')
    addScope('recent_messages', 'Recent messages', 'Only the last 6 messages and minimal conversation context.')
    addScope('selected_messages', 'Selected messages', 'Choose the exact bubbles Pocket should attach.')
    const choices = el('div', 'lp-reference-message-list')
    for (const message of conversation.messages.filter((entry) => entry.sender !== 'system').slice(-12)) {
      const row = el('label', 'lp-reference-message-choice')
      const input = el('input')
      input.type = 'checkbox'; input.value = message.id; input.dataset.referenceMessage = message.id
      input.checked = message.id === this.selectedMessageId
      input.addEventListener('change', update)
      const copy = el('span', 'lp-grow')
      copy.append(el('strong', '', message.senderName), el('span', 'lp-copy', message.text.slice(0, 180)))
      row.append(input, copy)
      choices.appendChild(row)
      messageInputs.push(input)
    }
    content.appendChild(choices)
    attach.addEventListener('click', () => {
      const messageIds = messageInputs.filter((input) => input.checked).map((input) => input.value)
      this.send('lumiphone:arm_reference', { conversationId, scope, messageIds })
      modal.dismiss()
    })
    content.appendChild(attach)
    modal.root.appendChild(content)
    update()
  }

  private showOutgoingPrompt(conversationId: string): void {
    this.send('lumiphone:get_debug_prompt', { conversationId })
  }
  private showOutgoingPromptResult(payload: BackendPayload): void {
    const modal = this.ctx.ui.showModal({ title: 'Outgoing prompt', width: 680, maxHeight: 760 })
    const content = el('div', 'lp-settings-section')
    const debug = payload.debug && typeof payload.debug === 'object' ? payload.debug as BackendPayload : null

    if (!debug) {
      content.appendChild(el('p', 'lp-copy', payload.promptRequestId
        ? `No captured prompt exists for request ${String(payload.promptRequestId)}. Generate a new Pocket reply after installing this debug build.`
        : 'This conversation has no generated Pocket reply to inspect yet.'))
      modal.root.appendChild(content)
      return
    }

    for (const [label, value] of [
      ['Task', String(debug.task || 'unknown')],
      ['Request', String(debug.requestId || payload.promptRequestId || 'unknown')],
      ['Captured', String(debug.capturedAt || 'unknown')],
      ['Message', String(payload.messageId || 'unknown')],
    ]) {
      const row = el('div', 'lp-row-between')
      row.append(el('strong', '', label), el('span', 'lp-copy', value))
      content.appendChild(row)
    }

    const messages = Array.isArray(debug.messages) ? debug.messages : []
    const fullPrompt = messages.map((message: any, index: number) => {
      const role = String(message?.role || 'unknown')
      const body = String(message?.content || '')
      return `[${index + 1}] ${role.toUpperCase()}\n${body}`
    }).join('\n\n' + '─'.repeat(48) + '\n\n')

    const copy = button('Copy full prompt', 'lp-button lp-button-quiet')
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(fullPrompt)
        copy.textContent = '✓ Copied'
        window.setTimeout(() => { copy.textContent = 'Copy full prompt' }, 1_400)
      } catch {
        this.showFeedback('Could not copy the prompt automatically.')
      }
    })
    content.appendChild(copy)

    if (!messages.length) {
      content.appendChild(el('p', 'lp-copy', 'The captured request contained no message array.'))
    } else {
      messages.forEach((message: any, index: number) => {
        const block = el('details', 'lp-channel-diagnostic')
        if (index === 0) block.open = true
        block.appendChild(el('summary', '', `[${index + 1}] ${String(message?.role || 'unknown').toUpperCase()}`))
        const pre = el('pre', 'lp-code-block', String(message?.content || ''))
        pre.style.whiteSpace = 'pre-wrap'
        pre.style.overflowWrap = 'anywhere'
        block.appendChild(pre)
        content.appendChild(block)
      })
    }

    const requestDetails = el('details', 'lp-channel-diagnostic')
    requestDetails.appendChild(el('summary', '', 'Parameters / raw debug metadata'))
    const raw = {
      type: debug.type || '',
      parameters: debug.parameters || {},
      reasoning: debug.reasoning || undefined,
    }
    const pre = el('pre', 'lp-code-block', JSON.stringify(raw, null, 2))
    pre.style.whiteSpace = 'pre-wrap'
    pre.style.overflowWrap = 'anywhere'
    requestDetails.appendChild(pre)
    content.appendChild(requestDetails)

    modal.root.appendChild(content)
  }

  private showConversationGenerationInfo(conversationId: string): void {
    const conversation = this.state?.conversations.find((entry) => entry.id === conversationId)
    if (!conversation) return
    const modal = this.ctx.ui.showModal({ title: 'Conversation diagnostics', width: 500, maxHeight: 680 })
    const content = el('div', 'lp-settings-section')
    const generated = conversation.messages.filter((message) => message.generation).slice(-5)
    const reference = [...(this.state?.references || [])].reverse().find((entry) => entry.conversationId === conversationId)
    for (const [label, value] of [
      ['Conversation', conversation.title],
      ['Kind', conversation.kind],
      ['Messages', String(conversation.messages.length)],
      ['Generated messages', String(conversation.messages.filter((message) => message.generation).length)],
      ['Latest reference', reference ? `${reference.id} · ${reference.status}` : 'none'],
    ]) {
      const row = el('div', 'lp-row-between'); row.append(el('strong', '', label), el('span', 'lp-copy', value)); content.appendChild(row)
    }
    if (reference) {
      const referenceDetails = el('details', 'lp-channel-diagnostic')
      const detail = el('div', 'lp-handoff-diagnostics')
      for (const row of [
        `Scope: ${reference.scope}`,
        `Messages: ${reference.messages.length}`,
        `Bound user message: ${reference.boundUserMessageId || 'none'}`,
        `Generation: ${reference.injectedGenerationId || 'none'}`,
        `Injected: ${reference.injectedAt || 'no'}`,
        `Serialized: ${reference.serializedReferenceChars || 0} chars`,
        `Consumed message: ${reference.consumedMessageId || 'none'}`,
        reference.error ? `Error: ${reference.error}` : '',
      ].filter(Boolean)) detail.appendChild(el('span', 'lp-copy', row))
      if (reference.serializedReference) detail.appendChild(el('pre', 'lp-code-block', reference.serializedReference))
      referenceDetails.append(el('summary', '', 'Reference diagnostics'), detail)
      content.appendChild(referenceDetails)
    }
    for (const message of generated) {
      const row = button(`${message.senderName} · ${formatTime(message.createdAt)}`, 'lp-button lp-button-quiet')
      row.addEventListener('click', () => { modal.dismiss(); this.showMessageGenerationInfo(message) })
      content.appendChild(row)
    }
    if (!generated.length) content.appendChild(el('p', 'lp-copy', 'No generated Pocket bubbles have diagnostics yet.'))
    modal.root.appendChild(content)
  }

  private generateReply(conversationId: string, speakerContactId = ''): void {
    if ([...this.messageRequests.values()].some((entry) => entry.conversationId === conversationId)) return
    const id = requestId('reply')
    this.messageRequests.set(id, { conversationId, speakerContactId, phase: 'pending' })
    this.send('lumiphone:generate_message', { requestId: id, conversationId, speakerContactId })
    if (speakerContactId && speakerContactId !== 'auto') this.groupSpeakerSelections.delete(conversationId)
    this.render()
  }

  private renderContacts(): HTMLDivElement {
    const collectionKey = `${this.state!.chatId}:${this.state!.characterId}:${this.selectedContactView}:${this.selectedContactGroupId}:${this.selectedContactId}`
    return renderContactsView({
      state: this.state!, selectedContactId: this.selectedContactId, selectedView: this.selectedContactView,
      generationBrief: this.npcBriefs.get(`${this.state!.chatId}:${this.state!.characterId}`) || '',
      updateGenerationBrief: brief => { this.npcBriefs.set(`${this.state!.chatId}:${this.state!.characterId}`, brief) },
      sources: this.contactSources, npcBank: this.npcBank, identityProfiles: this.identityProfiles, capabilities: this.caps,
      selectedGroupId: this.selectedContactGroupId, bankGroups: this.npcBankGroups,
      collectionDraft: this.collectionDrafts.get(collectionKey), collectionSaving: Boolean(this.collectionRequest),
      updateCollectionDraft: draft => { this.collectionDrafts.set(collectionKey, draft) },
      saveCollection: (type, payload) => {
        if (this.collectionRequest) return
        this.collectionRequestKey = collectionKey
        this.collectionRequest = this.send(type, payload)
        this.render(false)
      },
      selectGroup: (groupId, view) => this.openPocket({ app: 'contacts', groupId: groupId || undefined, view }),
      startGroup: (title, participants) => {
        const actors = listPocketActors(this.state!)
        this.groupDrafts.set(`${this.state!.chatId}:${this.state!.characterId}:new`, { title, participants: participants.map(id => actors.find(actor => actor.contact?.id === id)?.actorId || id) })
        this.openPocket({ app: 'messages', view: 'group-editor' })
      },
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      empty: (title, copy) => this.empty('contacts', title, copy),
      operations: this.operations,
      npcDraft: this.npcDraft, previousNpcDraft: this.previousNpcDraft,
      select: (contactId, view = contactId ? 'detail' : 'list', replace = false) => this.openPocket({ app: 'contacts', contactId: contactId || undefined, view }, !replace),
      restorePreviousNpcDraft: () => {
        if (!this.previousNpcDraft) return
        const current = this.npcDraft
        this.npcDraft = this.previousNpcDraft
        this.previousNpcDraft = current
        this.render(false)
      },
      openDirect: (contactId) => this.send('lumiphone:open_direct', { contactId }),
      choosePhoto: (contactId) => this.chooseContactPhoto(contactId),
      uploadPhoto: (contactId) => { void this.uploadAvatarPhoto(contactId) },
      generatePhoto: (contactId) => this.openPocket({ app: 'camera', contactId }),
      generateDraftPhoto: () => this.openPocket({ app: 'camera', draft: true }),
      useSourcePhoto: (contactId) => this.send('lumiphone:set_contact_photo', { contactId, useSource: true }),
      requestSources: () => {
        if (this.contactSourcesRequested) return
        this.contactSourcesRequested = true
        this.send('lumiphone:list_contact_sources')
      },
      send: (type, payload) => { this.send(type, payload) }, showError: (message) => this.showError(message),
    })
  }

  private async uploadAvatarPhoto(contactId = '__draft__'): Promise<void> {
    const context = this.activeContext(), draft = this.npcDraft
    if (this.cameraBusy) { this.showFeedback('Stop the current photo generation before uploading an avatar.'); return }
    if (contactId === '__draft__' && !draft) return
    try {
      const files = await this.ctx.uploads.pickFile({ accept: ['image/*', '.png', '.jpg', '.jpeg', '.webp', '.gif'], multiple: false, maxSizeBytes: 8 * 1024 * 1024 })
      const file = files[0]; if (!file) return
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(String(reader.result || '')), { once: true })
        reader.addEventListener('error', () => reject(reader.error || new Error('Could not read the image.')), { once: true })
        reader.readAsDataURL(new Blob([file.bytes.slice().buffer], { type: file.mimeType }))
      })
      const current = this.activeContext()
      if (this.destroyed || current.chatId !== context.chatId || current.characterId !== context.characterId || (contactId === '__draft__' && draft !== this.npcDraft)) return
      if (contactId !== '__draft__' && !this.state?.contacts.some(contact => contact.id === contactId)) return
      this.openPocket(contactId === '__draft__' ? { app: 'camera', draft: true } : { app: 'camera', contactId })
      this.cameraPreview = dataUrl; this.cameraImageId = ''; this.cameraReady = true; this.cameraFocus = { x: 50, y: 50 }
      this.cameraProgress = 'Uploaded photo ready. Frame it, then choose Use photo.'
      this.render(false)
    } catch (error) { this.showError(error instanceof Error ? error.message : 'Could not upload this avatar.') }
  }

  private chooseContactPhoto(contactId = '__draft__'): void {
    if (contactId === '__draft__' && !this.npcDraft) return
    this.pendingContactPhotoDraft = contactId === '__draft__' ? this.npcDraft : null
    this.pendingWallpaperTarget = 'contact-avatar'
    this.pendingContactPhotoId = contactId
    this.requestGallery('all')
    this.openPocket({ app: 'gallery' })
  }
  private requestGallery(scope: string, offset = 0): void {
    if (scope !== this.galleryScope) this.gallery = { data: [], total: 0 }
    this.galleryScope = scope
    this.galleryLoading = true
    this.galleryRequestId = requestId('gallery-list')
    this.send('lumiphone:gallery_list', { scope, offset, requestId: this.galleryRequestId })
    if (this.currentApp === 'gallery') this.render(false)
  }

  private renderGallery(): HTMLDivElement {
    const { page, content } = this.page('Gallery', `${this.gallery.total} assets`, { label: 'Refresh', callback: () => this.requestGallery(this.galleryScope, this.gallery.offset || 0) })
    const chips = el('div', 'lp-chipbar')
    for (const [scope, label] of [['chat', 'This chat'], ['character', 'Character'], ['phone', 'Pocket'], ['all', 'All']] as const) {
      const chip = button(label, 'lp-chip')
      chip.setAttribute('aria-pressed', String(this.galleryScope === scope))
      chip.addEventListener('click', () => this.requestGallery(scope))
      chips.appendChild(chip)
    }
    content.appendChild(chips)
    if (!this.caps?.images) {
      content.appendChild(this.empty('gallery', 'Gallery access is off', 'Grant Images permission from Settings to browse Lumiverse assets.'))
      return page
    }
    const grid = el('div', 'lp-gallery-grid')
    for (const item of this.gallery.data) {
      const tile = el('button', 'lp-gallery-item')
      tile.type = 'button'
      tile.dataset.selected = String(item.id === this.selectedGalleryImageId)
      if (item.id === this.selectedGalleryImageId) tile.setAttribute('aria-current', 'true')
      const image = el('img')
      image.loading = 'lazy'
      image.src = item.thumbnailUrl || item.url
      image.alt = item.filename || 'Gallery image'
      image.addEventListener('error', () => {
        tile.dataset.missing = 'true'
        image.replaceWith(el('span', 'lp-gallery-missing', 'Image unavailable'))
      }, { once: true })
      tile.append(image, el('span', 'lp-gallery-meta', item.filename || formatDate(item.createdAt * 1000)))
      tile.addEventListener('click', () => this.inspectImage(item))
      grid.appendChild(tile)
    }
    content.appendChild(grid)
    const offset = this.gallery.offset || 0, limit = this.gallery.limit || GALLERY_PAGE_SIZE
    const pagination = el('nav', 'lp-gallery-pagination lp-actions'); pagination.setAttribute('aria-label', 'Gallery pages')
    const previous = button('Previous', 'lp-button lp-button-quiet'), next = button('Next', 'lp-button lp-button-quiet')
    previous.disabled = this.galleryLoading || offset === 0
    next.disabled = this.galleryLoading || offset + limit >= this.gallery.total
    previous.addEventListener('click', () => this.requestGallery(this.galleryScope, Math.max(0, offset - limit)))
    next.addEventListener('click', () => this.requestGallery(this.galleryScope, offset + limit))
    const range = el('span', 'lp-copy', this.galleryLoading ? 'Loading images…' : this.gallery.total ? `${offset + 1}–${offset + this.gallery.data.length} of ${this.gallery.total}` : '0 images')
    range.setAttribute('role', 'status')
    pagination.append(previous, range, next); content.insertBefore(pagination, grid)
    if (!this.gallery.data.length && !this.galleryLoading) content.appendChild(this.empty('gallery', 'Nothing here yet', 'Take a photo with Camera or switch the gallery filter.'))
    return page
  }

  private inspectImage(item: GalleryResult['data'][number]): void {
    const modal = this.ctx.ui.showModal({ title: item.filename || 'Pocket photo', width: 760, maxHeight: 820 })
    const image = el('img')
    image.src = item.fullUrl || item.url
    image.alt = item.filename || 'Pocket photo'
    image.style.cssText = 'display:block;width:100%;max-height:76vh;object-fit:contain;border-radius:12px;background:#080808'
    const actions = el('div', 'lp-gallery-actions')
    if (item.canDelete) {
      const remove = button('Delete photo', 'lp-button lp-button-quiet')
      remove.addEventListener('click', () => {
        const confirmation = el('div', 'lp-camera-sheet-fields')
        confirmation.append(el('p', 'lp-copy', 'Permanently delete this Pocket photo from Lumiverse Gallery? Chats, avatars and wallpapers using it may lose their image. This cannot be undone.'))
        const cancel = button('Keep photo', 'lp-button')
        const confirm = button('Permanently delete', 'lp-button')
        const sheet = showPocketSheet(remove, 'Delete photo?', confirmation)
        cancel.addEventListener('click', () => sheet?.dismiss())
        confirm.addEventListener('click', () => { this.runGalleryAction(confirm, 'Deleting…', 'lumiphone:gallery_delete', { imageId: item.id, scope: this.galleryScope, offset: this.gallery.offset || 0, confirmed: true }); sheet?.dismiss(); modal.dismiss() })
        confirmation.append(cancel, confirm)
      })
      actions.append(remove)
    }
    if (this.pendingWallpaperTarget === 'contact-avatar' && this.pendingContactPhotoId) {
      const contactId = this.pendingContactPhotoId
      const targetContact = this.state?.contacts.find((entry) => entry.id === contactId)
      const draft = contactId === '__draft__' ? this.pendingContactPhotoDraft : null
      const use = button(`Use for ${draft?.name || targetContact?.name || 'contact'}`, 'lp-button lp-button-primary')
      use.addEventListener('click', () => {
        if (draft) {
          if (draft !== this.npcDraft) { this.showFeedback('That NPC preview has changed. Choose its portrait again.'); return }
          draft.avatarUrl = item.fullUrl || item.url; draft.avatarSource = { kind: 'gallery', imageId: item.id }; draft.avatarFocus = { x: 50, y: 50 }
          modal.dismiss(); this.openPocket({ app: 'contacts', view: 'quick-gen' })
        } else this.runGalleryAction(use, 'Applying…', 'lumiphone:set_contact_photo', { contactId, imageId: item.id, imageUrl: item.fullUrl || item.url })
        this.pendingContactPhotoDraft = null
        this.pendingWallpaperTarget = null
        this.pendingContactPhotoId = ''
      })
      actions.appendChild(use)
    } else if (this.pendingWallpaperTarget) {
      const target = this.pendingWallpaperTarget
      const use = button('Use this image', 'lp-button')
      use.addEventListener('click', () => {
        const personaTarget = target.startsWith('persona-')
        this.runGalleryAction(use, 'Applying…', 'lumiphone:gallery_set_wallpaper', {
          imageId: item.id, target: target.endsWith('chat') ? 'chat' : 'home', personaId: personaTarget ? this.activePersona?.id : undefined,
        })
        this.pendingWallpaperTarget = null
      })
      actions.appendChild(use)
    }
    const open = button('Open image', 'lp-button')
    open.addEventListener('click', () => window.open(item.fullUrl || item.url, '_blank', 'noopener,noreferrer'))
    const attach = button('Add to current RP chat', 'lp-button')
    attach.disabled = !this.caps?.sceneSync
    attach.addEventListener('click', () => this.runGalleryAction(attach, 'Adding…', 'lumiphone:gallery_add_to_chat', { imageId: item.id, imageUrl: item.fullUrl || item.url, filename: item.filename }))
    const homeWallpaper = button('Set as home wallpaper', 'lp-button lp-button-quiet')
    homeWallpaper.addEventListener('click', () => this.runGalleryAction(homeWallpaper, 'Applying…', 'lumiphone:gallery_set_wallpaper', { imageId: item.id, imageUrl: item.fullUrl || item.url, target: 'home' }))
    const chatWallpaper = button('Set as chat wallpaper', 'lp-button lp-button-quiet')
    chatWallpaper.addEventListener('click', () => this.runGalleryAction(chatWallpaper, 'Applying…', 'lumiphone:gallery_set_wallpaper', { imageId: item.id, imageUrl: item.fullUrl || item.url, target: 'chat' }))
    const contact = el('select', 'lp-select')
    const choose = el('option', '', 'Choose a contact photo…'); choose.value = ''; contact.appendChild(choose)
    for (const entry of this.state?.contacts || []) {
      const option = el('option', '', entry.name); option.value = entry.id; contact.appendChild(option)
    }
    const setPhoto = button('Set contact photo', 'lp-button lp-button-quiet')
    setPhoto.addEventListener('click', () => {
      if (!contact.value) { this.showError('Choose a contact first.'); return }
      this.runGalleryAction(setPhoto, 'Applying…', 'lumiphone:set_contact_photo', { contactId: contact.value, imageId: item.id, imageUrl: item.fullUrl || item.url })
    })
    const uses = el('div', 'lp-sheet-actions')
    const useAs = button('Use as…', 'lp-button')
    useAs.addEventListener('click', () => showPocketSheet(useAs, 'Use photo as', uses))
    actions.append(attach, useAs, open)
    uses.append(homeWallpaper, chatWallpaper)
    const personaAppearance = this.activePersona ? this.preferences.personaAppearance[this.activePersona.id] : null
    if (this.activePersona && personaAppearance?.enabled) {
      const personaHome = button(`Set ${this.activePersona.name} home wallpaper`, 'lp-button lp-button-quiet')
      personaHome.addEventListener('click', () => this.runGalleryAction(personaHome, 'Applying…', 'lumiphone:gallery_set_wallpaper', { imageId: item.id, imageUrl: item.fullUrl || item.url, target: 'home', personaId: this.activePersona!.id }))
      const personaChat = button(`Set ${this.activePersona.name} chat wallpaper`, 'lp-button lp-button-quiet')
      personaChat.addEventListener('click', () => this.runGalleryAction(personaChat, 'Applying…', 'lumiphone:gallery_set_wallpaper', { imageId: item.id, imageUrl: item.fullUrl || item.url, target: 'chat', personaId: this.activePersona!.id }))
      uses.append(personaHome, personaChat)
    }
    if (!(this.pendingWallpaperTarget === 'contact-avatar' && this.pendingContactPhotoId)) uses.append(fieldBlock('Contact photo', contact), setPhoto)
    modal.root.classList.add('lp-media-viewer')
    modal.root.append(image, actions)
  }

  private runGalleryAction(buttonNode: HTMLButtonElement, progress: string, type: string, payload: Record<string, unknown>): void {
    const idle = buttonNode.textContent || 'Action'
    const actionRequestId = requestId('gallery')
    buttonNode.disabled = true
    buttonNode.textContent = progress
    this.galleryActionButtons.set(actionRequestId, { button: buttonNode, idle })
    this.send(type, { ...payload, requestId: actionRequestId })
  }

  private wallpaperTargetPayload(target: PocketImageTarget): Record<string, unknown> {
    return { target, personaId: target.startsWith('persona-') ? this.activePersona?.id : undefined }
  }

  private async chooseImage(target: PocketImageTarget, mode: 'gallery' | 'upload' | 'url'): Promise<void> {
    if (mode === 'gallery') {
      this.pendingWallpaperTarget = target
      this.requestGallery('all')
      this.openPocket({ app: 'gallery' })
      return
    }
    if (mode === 'upload') {
      try {
        const files = await this.ctx.uploads.pickFile({ accept: ['image/*', '.png', '.jpg', '.jpeg', '.webp', '.gif'], multiple: false, maxSizeBytes: 8 * 1024 * 1024 })
        const file = files[0]
        if (!file) return
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.addEventListener('load', () => resolve(String(reader.result || '')), { once: true })
          reader.addEventListener('error', () => reject(reader.error || new Error('Could not read the image.')), { once: true })
          reader.readAsDataURL(new Blob([file.bytes.slice().buffer], { type: file.mimeType }))
        })
        this.send('lumiphone:upload_wallpaper_asset', { ...this.wallpaperTargetPayload(target), dataUrl, filename: file.name })
      } catch (error) {
        this.showError(error instanceof Error ? error.message : String(error))
      }
      return
    }
    const modal = this.ctx.ui.showModal({ title: 'Use image URL', width: 460, maxHeight: 320 })
    const content = el('div', 'lp-settings-section')
    content.appendChild(el('p', 'lp-copy', 'Use a durable HTTPS image URL. Pocket stores the URL, never a downloaded base64 copy.'))
    const input = el('input', 'lp-input'); input.type = 'url'; input.placeholder = 'https://example.com/wallpaper.jpg'
    const apply = button('Use image', 'lp-button')
    apply.addEventListener('click', () => {
      const url = input.value.trim()
      if (!/^https:\/\//i.test(url)) { this.showError('Enter an HTTPS image URL.'); return }
      this.send('lumiphone:set_wallpaper', { ...this.wallpaperTargetPayload(target), source: { kind: 'url', url } })
      modal.dismiss()
    })
    content.append(input, apply); modal.root.appendChild(content); input.focus()
  }

  private renderCamera(): HTMLDivElement {
    const page = el('div', 'lp-camera lp-npc-camera')
    page.dataset.captureState = this.cameraBusy ? 'generating' : this.cameraReady ? 'review' : 'compose'
    const contact = this.state!.contacts.find(entry => entry.id === this.cameraContactId)
    const subject = contact || (this.cameraContactId === '__draft__' ? this.cameraNpcDraft : null)
    const nav = el('header', 'lp-nav')
    const back = button('‹ Back', 'lp-nav-action')
    back.addEventListener('click', () => this.back())
    const profileLabel = this.swarmProfile?.available ? 'Lumiverse + Swarm profile' : 'Lumiverse image settings'
    const title = el('div', 'lp-nav-title', this.cameraContactId ? 'Quick Generate' : 'Camera')
    title.appendChild(el('span', 'lp-nav-subtitle', subject ? `${subject.name} · Contact photo` : profileLabel))
    const gallery = button('Gallery', 'lp-nav-action')
    gallery.addEventListener('click', () => this.openApp('gallery'))
    nav.append(back, title, gallery)
    const controls = el('form', 'lp-content lp-camera-body')
    const mode = el('div', 'lp-camera-mode', 'ϟ AUTO')
    mode.append(el('span', '', 'POCKET'), el('span', '', this.cameraContactId ? 'PORTRAIT' : 'PHOTO'))
    const viewfinder = el('div', 'lp-npc-viewfinder lp-photo-viewfinder')
    if (this.cameraPreview) {
      const image = el('img')
      image.src = this.cameraPreview
      image.alt = 'Camera preview'
      viewfinder.appendChild(image)
    } else {
      const placeholder = el('div', 'lp-camera-subject')
      const focus = el('div', 'lp-focus-frame')
      focus.append(el('div', 'lp-npc-camera-mark', '+'))
      const copy = el('div', 'lp-npc-camera-copy')
      copy.append(el('strong', '', subject ? `Frame ${subject.name}` : 'Frame a moment'), el('p', '', 'Describe the photo, then tap the shutter.'))
      placeholder.append(focus, copy)
      viewfinder.appendChild(placeholder)
    }
    const prompt = el('textarea', 'lp-textarea')
    prompt.placeholder = 'Describe the photo or moment…'
    prompt.rows = 2
    prompt.maxLength = 12000
    prompt.value = this.cameraDraft.scene
    prompt.addEventListener('input', () => { this.cameraDraft.scene = prompt.value })
    const floating = fieldBlock('Photo description', prompt)
    floating.classList.add('lp-camera-floating-brief')
    floating.hidden = this.cameraReady && !this.cameraBusy
    viewfinder.append(floating)
    const footer = el('div', 'lp-camera-bottom-strip')
    const optionRow = el('div', 'lp-row-between')
    const enhanceLabel = el('label', 'lp-row')
    const enhance = el('input')
    enhance.type = 'checkbox'
    enhance.checked = this.cameraDraft.enhance ?? this.preferences.sceneEnhancer
    enhance.addEventListener('change', () => { this.cameraDraft.enhance = enhance.checked })
    enhanceLabel.append(enhance, el('span', 'lp-copy', 'Enhance scene description'))
    const source = el('span', 'lp-copy', this.swarmProfile?.source === 'swarm_studio' ? 'Swarm Studio' : 'Manual profile')
    optionRow.append(enhanceLabel, source)
    const makeChoice = (label: string, values: Array<[string, string]>, value: string, update: (value: string) => void) => {
      const select = el('select', 'lp-select')
      for (const [id, name] of values) { const option = el('option', '', name); option.value = id; option.selected = id === value; select.append(option) }
      select.addEventListener('change', () => update(select.value))
      return fieldBlock(label, select)
    }
    const purpose = makeChoice('Subject', this.cameraContactId ? [[this.cameraOptions.purpose, subject?.name || 'Contact']] : [['scene', 'Scene · character and persona'], ['character', this.state!.characterName], ['persona', this.state!.pocketPersona.displayName || 'Persona']], this.cameraOptions.purpose, value => { this.cameraOptions.purpose = value })
    const aspect = makeChoice('Framing', [['', 'Profile default'], ['1:1', 'Square · avatar'], ['3:4', 'Portrait'], ['4:3', 'Landscape'], ['9:16', 'Tall'], ['16:9', 'Wide']], this.cameraOptions.aspect, value => { this.cameraOptions.aspect = value })
    const connection = makeChoice('Image connection', [['', 'Profile default'], ...this.imageConnections.map(entry => [entry.id, entry.name] as [string, string])], this.cameraOptions.connectionId, value => { this.cameraOptions.connectionId = value })
    const model = el('div', 'lp-model-combobox')
    const mountModel = () => {
      modelHandle?.destroy()
      modelHandle = this.ctx.components.mountModelCombobox(model, { value: this.cameraOptions.model, connection: { kind: 'image', id: this.cameraOptions.connectionId || this.preferences.manualVisualProfile.connectionId || undefined }, placeholder: 'Use native checkpoint', onChange: value => { this.cameraOptions.model = value } })
    }
    let modelHandle: ReturnType<typeof this.ctx.components.mountModelCombobox> | undefined
    this.viewCleanups.push(() => modelHandle?.destroy())
    connection.querySelector('select')?.addEventListener('change', () => { this.cameraOptions.model = ''; mountModel() })
    const nativeSettings = button('Lumiverse image settings', 'lp-button lp-button-quiet')
    nativeSettings.addEventListener('click', () => { nativeSettings.closest('dialog')?.close(); this.close(); this.send('lumiphone:open_native_image_settings', {}) })
    const pipelineCopy = el('p', 'lp-copy', 'Without saved or per-photo overrides, use Lumiverse presets, workflow and LoRA stack. Connection/checkpoint overrides use direct generation. Set saved defaults in Pocket Settings.')
    const shutterRow = el('div', 'lp-shutter-row')
    const shutterAction = el('div', 'lp-camera-shutter-action')
    const shutter = el('button', 'lp-shutter')
    shutter.type = 'submit'
    shutter.disabled = !this.cameraBusy && (!this.caps?.imageGen || Boolean(this.cameraContactId && !subject))
    shutter.dataset.busy = String(this.cameraBusy)
    const album = button('Gallery', 'lp-nav-action')
    album.addEventListener('click', () => this.openApp('gallery'))
    album.classList.add('lp-camera-album')
    album.setAttribute('aria-label', 'Open photo gallery')
    if (this.cameraPreview) { const thumb = el('img'); thumb.src = this.cameraPreview; thumb.alt = ''; album.replaceChildren(thumb) }
    else album.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m4 18 6-6 4 4 3-3 4 5"/></svg>'
    shutterAction.append(el('span', 'lp-camera-shutter-label', this.cameraBusy ? 'Tap to stop' : this.cameraReady ? 'Retake' : 'Capture'))
    shutterRow.append(album, shutter, shutterAction)
    const progress = el('div', 'lp-camera-progress', this.cameraProgress || (!this.caps?.imageGen ? 'Grant Image Generation permission in Settings' : ''))
    progress.setAttribute('role', 'status'); progress.setAttribute('aria-live', 'polite')
    const optionsDrawer = button('Camera options', 'lp-camera-options-chip')
    const optionFields = el('div', 'lp-camera-sheet-fields')
    optionFields.append(pipelineCopy, nativeSettings, purpose, aspect, connection, (() => { const row = el('div', 'lp-field'); row.append(el('div', 'lp-label', 'Checkpoint override'), model); return row })(), optionRow)
    optionsDrawer.addEventListener('click', () => { showPocketSheet(optionsDrawer, 'Camera options', optionFields); mountModel() })
    footer.append(el('p', 'lp-camera-caption', this.cameraContactId ? 'PORTRAIT' : 'PHOTO'), shutterRow, progress, optionsDrawer)
    if (this.cameraContactId && this.cameraReady && !this.cameraBusy) {
      const use = button('Use photo', 'lp-button lp-camera-accept')
      use.disabled = !subject || (this.cameraContactId === '__draft__' && this.npcDraft !== this.cameraNpcDraft)
      use.addEventListener('click', async () => {
        const contactId = this.cameraContactId
        const draft = this.npcDraft
        use.disabled = true
        use.textContent = 'Framing…'
        try {
          const croppedDataUrl = await cropAvatarPhoto(this.cameraPreview, { ...this.cameraFocus })
          if (!use.isConnected || contactId !== this.cameraContactId || draft !== this.npcDraft) return
        if (this.cameraContactId === '__draft__') {
          if (!this.npcDraft || this.npcDraft !== this.cameraNpcDraft) return
          const uploadId = requestId('avatar')
          this.pendingAvatarDraft = { requestId: uploadId, draft: this.npcDraft }
          this.send('lumiphone:upload_avatar', { croppedDataUrl, requestId: uploadId })
        } else this.runGalleryAction(use, 'Applying…', 'lumiphone:set_contact_photo', { contactId: this.cameraContactId, imageId: this.cameraImageId || undefined, imageUrl: this.cameraPreview, croppedDataUrl, focus: { x: 50, y: 50 } })
        } catch (error) { use.disabled = false; use.textContent = 'Use photo'; this.showFeedback(error instanceof Error ? error.message : 'Could not frame this photo.') }
      })
      const crop = el('div', 'lp-avatar-framing')
      const preview = el('img'); preview.src = this.cameraPreview; preview.alt = 'Contact avatar framing'; preview.style.objectPosition = `${this.cameraFocus.x}% ${this.cameraFocus.y}%`
      crop.append(preview)
      const framing = el('div', 'lp-avatar-framing-controls')
      for (const [axis, label] of [['x', 'Horizontal focus'], ['y', 'Vertical focus']] as const) {
        const slider = el('input'); slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = String(this.cameraFocus[axis]); slider.addEventListener('input', () => { this.cameraFocus[axis] = Number(slider.value); preview.style.objectPosition = `${this.cameraFocus.x}% ${this.cameraFocus.y}%` })
        framing.append(fieldBlock(label, slider))
      }
      const frame = button('Avatar framing', 'lp-camera-options-chip')
      const frameFields = el('div', 'lp-camera-sheet-fields'); frameFields.append(crop, framing)
      frame.addEventListener('click', () => showPocketSheet(frame, 'Avatar framing', frameFields))
      const review = el('div', 'lp-camera-review-actions')
      review.append(el('span', 'lp-copy', 'Ready for ' + (subject?.name || 'this contact')), frame, use)
      footer.append(review)
    }
    controls.append(mode, viewfinder, footer)
    shutter.setAttribute('aria-label', this.cameraBusy ? 'Stop generating photo' : this.cameraReady ? 'Retake photo' : 'Take photo')
    controls.addEventListener('submit', (event) => {
      event.preventDefault()
      const scene = inputValue(prompt)
      if (this.cameraBusy) {
        this.send('lumiphone:camera_cancel', { requestId: this.cameraRequestId })
        this.cameraRequestId = ''
        this.cameraBusy = false
        this.cameraReady = false
        this.cameraProgress = 'Cancelled'
        this.render()
        return
      }
      if (this.cameraReady) { this.cameraReady = false; this.cameraProgress = ''; this.render(false); return }
      if (!scene) { prompt.focus(); return }
      this.cameraRequestId = requestId('camera')
      this.cameraBusy = true
      this.cameraReady = false
      this.cameraProgress = 'Sending scene to camera…'
      this.send('lumiphone:camera_generate', { requestId: this.cameraRequestId, scene, enhance: enhance.checked, ...this.cameraOptions, contactId: this.cameraContactId && this.cameraContactId !== '__draft__' ? this.cameraContactId : undefined, subject: this.cameraNpcDraft?.phoneProfile?.appearance || this.cameraNpcDraft?.identityBrief })
      this.render()
    })
    page.append(nav, controls)
    return page
  }

  private renderNotes(): HTMLDivElement {
    const state = this.state!
    const selected = state.notes.find((item) => item.id === this.selectedNoteId)
    if (this.selectedNoteId === '__new__' || selected) return this.renderNoteEditor(selected || null)
    const { page, content } = this.page('Notes', `${state.notes.length} journal entries`, { label: 'New', callback: () => this.openPocket({ app: 'notes', noteId: '__new__' }) })
    const sorted = [...state.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    for (const note of sorted) {
      const card = button('', 'lp-card lp-note-card')
      card.dataset.clickable = 'true'
      card.dataset.pinned = String(note.pinned)
      const head = el('div', 'lp-row-between')
      head.append(el('h3', 'lp-title', note.title), el('span', 'lp-copy', formatDate(note.updatedAt)))
      const preview = el('p', 'lp-copy lp-note-preview', note.body || 'Empty note')
      card.append(head, preview)
      card.appendChild(el('span', 'lp-eyebrow', [note.pinned ? '◆ Pinned' : '', note.author, note.mood].filter(Boolean).join(' · ')))
      card.addEventListener('click', () => this.openPocket({ app: 'notes', noteId: note.id }))
      content.appendChild(card)
    }
    if (!state.notes.length) content.appendChild(this.empty('notes', 'The journal is blank', 'You or the character can write the first entry.'))
    return page
  }

  private renderNoteEditor(note: PhoneNote | null): HTMLDivElement {
    const { page, content } = this.page(note ? 'Edit Note' : 'New Note', note?.mood || 'Character journal', { label: 'Save', callback: () => save() })
    const title = el('input', 'lp-input')
    title.placeholder = 'Title'
    title.value = note?.title || ''
    const mood = el('input', 'lp-input')
    mood.placeholder = 'Mood or tag'
    mood.value = note?.mood || ''
    const body = el('textarea', 'lp-textarea')
    content.classList.add('lp-note-editor'); title.classList.add('lp-note-title'); body.classList.add('lp-note-body')
    title.setAttribute('aria-label', 'Title'); mood.setAttribute('aria-label', 'Mood or tag'); body.setAttribute('aria-label', 'Journal entry')
    body.placeholder = 'Write a memory, thought, or journal entry…'
    body.value = note?.body || ''
    const pinRow = el('label', 'lp-row-between lp-card')
    pinRow.append(el('span', 'lp-title', 'Pin for model memory'))
    const pinned = el('input')
    pinned.type = 'checkbox'
    pinned.checked = note?.pinned || false
    pinRow.appendChild(pinned)
    const save = () => {
      this.send('lumiphone:action', { action: 'note', payload: { id: note?.id, title: inputValue(title), body: body.value, mood: inputValue(mood), pinned: pinned.checked } })
      this.back()
    }
    content.append(title, mood, body, pinRow)
    if (note) {
      const remove = button('Delete note', 'lp-button lp-button-danger')
      remove.addEventListener('click', () => {
        this.send('lumiphone:delete', { kind: 'note', id: note.id })
        this.back()
      })
      content.appendChild(remove)
    }
    return page
  }

  private appReviewControl(task: 'weather-week' | 'timeline-review', label: string, type: string): HTMLElement {
    return renderAppReviewControl({
      chatId: this.state!.chatId, characterId: this.state!.characterId, canGenerate: Boolean(this.caps?.generation),
      operations: this.operations, scopes: this.appReviewScopes,
      send: (type, payload) => this.send(type, payload), progress: operation => this.recordOperationProgress(operation), render: () => this.render(false),
    }, task, label, type)
  }

  private renderWeather(editing = false): HTMLDivElement {
    const weather = this.state!.weather
    const { page, content } = this.page('Weather', weather.location, { label: editing ? 'Save' : 'Edit', callback: () => {
      if (editing) save()
      else {
        const editor = this.renderWeather(true)
        editor.classList.add('lumiphone-app-view')
        editor.dataset.pocketApp = 'weather'
        page.replaceWith(editor)
      }
    } })
    const hero = el('div', 'lp-weather-hero')
    const top = el('div', 'lp-weather-hero-top')
    top.append(el('div', 'lp-weather-condition', weather.condition), el('div', 'lp-copy', weather.location))
    const temp = el('div', 'lp-weather-temp', `${weather.temperature}°${weather.unit}`)
    const bottom = el('div', 'lp-weather-hero-bottom')
    bottom.append(el('span', 'lp-weather-stat', `↑ ${weather.high}°`), el('span', 'lp-weather-stat', `↓ ${weather.low}°`), el('span', 'lp-weather-updated', weather.updatedAt ? `Updated ${formatTime(weather.updatedAt)}` : ''))
    hero.append(top, weatherGlyph(weather.condition), temp, bottom)
    hero.dataset.condition = weatherConditionKind(weather.condition)
    const fields = el('div', 'lp-fields')
    const location = this.field('Location', weather.location)
    const condition = this.field('Condition', weather.condition)
    const temperature = this.field('Temperature', String(weather.temperature), 'number')
    const unit = el('select', 'lp-select')
    for (const value of ['C', 'F']) {
      const option = el('option', '', `°${value}`)
      option.value = value
      option.selected = weather.unit === value
      unit.appendChild(option)
    }
    const unitLabel = el('label', 'lp-label', 'Unit')
    unitLabel.appendChild(unit)
    const high = this.field('High', String(weather.high), 'number')
    const low = this.field('Low', String(weather.low), 'number')
    fields.append(location.label, condition.label, temperature.label, unitLabel, high.label, low.label)
    const details = el('textarea', 'lp-textarea')
    details.placeholder = 'Atmosphere and roleplay weather details…'
    details.value = weather.details
    if (editing) content.append(hero, fields, fieldBlock('Atmosphere', details))
    else content.append(hero, el('p', 'lp-weather-note', weather.details || 'Enjoy the day.'), weatherOutlook(weather, this.state!.roleplayNow, this.state!.roleplayTimezoneOffsetMinutes), this.appReviewControl('weather-week', weather.outlook ? 'Refresh story outlook' : 'Build story outlook', 'lumiphone:weather_week'))
    const save = () => { this.send('lumiphone:action', { action: 'weather', payload: {
      location: inputValue(location.input), condition: inputValue(condition.input), temperature: Number(temperature.input.value), unit: unit.value,
      high: Number(high.input.value), low: Number(low.input.value), details: details.value,
    } }); this.render() }
    return page
  }

  private renderCalendar(): HTMLDivElement {
    const state = this.state!
    const selected = state.events.find((item) => item.id === this.selectedEventId)
    if (this.selectedEventId === '__new__' || selected) return this.renderEventEditor(selected || null)
    const { page, content } = this.page('Timeline', formatDate(state.roleplayNow, true), { label: 'Add', callback: () => this.openPocket({ app: 'calendar', eventId: '__new__' }) })
    const nowCard = el('div', 'lp-card')
    const nowField = el('input', 'lp-input')
    nowField.type = 'datetime-local'
    nowField.value = dateTimeLocal(state.roleplayNow)
    const setNow = button('Set roleplay now', 'lp-button')
    setNow.addEventListener('click', () => {
      const parsed = new Date(nowField.value)
      if (!Number.isNaN(parsed.getTime())) this.send('lumiphone:save_roleplay_time', { roleplayNow: parsed.toISOString(), timezoneOffsetMinutes: new Date().getTimezoneOffset() })
    })
    const clockSource = state.roleplayClockSource === 'manual' ? 'Manual'
      : state.roleplayClockSource === 'narrative' ? 'Narrative'
        : 'Legacy / fallback'
    const clockPrecision = state.roleplayClockPrecision && state.roleplayClockPrecision !== 'unknown' ? ` · ${state.roleplayClockPrecision}` : ''
    const clockLabel = state.roleplayClockLabel ? ` · ${state.roleplayClockLabel}` : ''
    nowCard.append(
      el('div', 'lp-eyebrow', 'Roleplay clock'),
      nowField,
      el('p', 'lp-copy', `${clockSource}${clockPrecision}${clockLabel}`),
      setNow,
    )
    content.appendChild(disclosure('Story clock · ' + formatTime(state.roleplayNow), nowCard))
    const overview = el('div', 'lp-timeline-overview')
    overview.append(el('strong', '', String(state.events.filter(event => !event.completed).length)), el('span', 'lp-copy', 'open beats'), el('strong', '', String(state.events.filter(event => event.completed).length)), el('span', 'lp-copy', 'resolved'))
    content.append(overview, this.appReviewControl('timeline-review', 'Review recent story', 'lumiphone:timeline_review'))
    const timeline = el('div', 'lp-timeline')
    const events = [...state.events].sort((a, b) => Number(a.completed) - Number(b.completed) || (a.completed ? Date.parse(b.start) - Date.parse(a.start) : Date.parse(a.start) - Date.parse(b.start)))
    let section = ''
    for (const event of events) {
      const nextSection = event.completed ? 'Resolved' : 'In the story'
      if (section !== nextSection) { section = nextSection; timeline.append(el('h3', 'lp-timeline-section', section)) }
      const row = el('div', 'lp-event')
      row.dataset.completed = String(event.completed)
      const dot = el('span', 'lp-event-dot')
      dot.style.setProperty('--event-color', event.color)
      const card = button('', 'lp-card lp-event-card')
      card.dataset.clickable = 'true'
      card.append(el('div', 'lp-eyebrow', `${event.lane} · ${event.whenText || formatDate(event.start, true)}`), el('h3', 'lp-title', event.title))
      if (event.completed) card.appendChild(el('span', 'lp-status-badge', '✓ Completed'))
      if (event.description) card.appendChild(el('p', 'lp-copy', event.description))
      card.addEventListener('click', () => this.openPocket({ app: 'calendar', eventId: event.id }))
      row.append(dot, card)
      timeline.appendChild(row)
    }
    content.appendChild(timeline)
    if (!events.length) content.appendChild(this.empty('calendar', 'No timeline events', 'Schedule story beats, dates, appointments, or alternate-timeline milestones.'))
    return page
  }

  private renderEventEditor(event: CalendarEvent | null): HTMLDivElement {
    const { page, content } = this.page(event ? 'Edit Event' : 'New Event', 'Roleplay timeline', { label: 'Save', callback: () => save() })
    const schedulerSeed = !event ? this.pendingEventSuggestion : null
    const suggestion = schedulerSeed?.suggestion || null
    const title = this.field('Title', event?.title || suggestion?.title || '')
    const lane = this.field('Timeline lane', event?.lane || (suggestion ? 'Plans' : 'Main timeline'))
    const whenKindLabel = el('label', 'lp-label', 'Time precision')
    const whenKind = el('select', 'lp-select')
    for (const [value, label] of [['exact', 'Exact date/time'], ['approximate', 'Approximate'], ['relative', 'Relative to story'], ['unscheduled', 'Unscheduled']] as const) {
      const option = el('option', '', label)
      option.value = value
      option.selected = (event?.whenKind || suggestion?.whenKind || 'exact') === value
      whenKind.appendChild(option)
    }
    whenKindLabel.appendChild(whenKind)
    const whenText = this.field('Timeline label', event?.whenText || suggestion?.whenText || (event ? formatDate(event.start, true) : ''))
    const start = this.field('Start', event ? dateTimeLocal(event.start) : suggestion?.start ? dateTimeLocal(suggestion.start) : dateTimeLocal(this.state!.roleplayNow), 'datetime-local')
    const end = this.field('End', event ? dateTimeLocal(event.end) : suggestion?.end ? dateTimeLocal(suggestion.end) : suggestion?.start ? dateTimeLocal(suggestion.start) : dateTimeLocal(this.state!.roleplayNow), 'datetime-local')
    const exactTiming = el('div', 'lp-settings-section')
    exactTiming.style.minWidth = '0'
    exactTiming.style.width = '100%'
    exactTiming.append(start.label, end.label)
    const syncTimingPrecision = () => {
      exactTiming.style.display = whenKind.value === 'exact' ? 'grid' : 'none'
      whenText.input.placeholder = whenKind.value === 'approximate' ? 'Morning, late afternoon, around noon…'
        : whenKind.value === 'relative' ? 'After the press conference, before patrol…'
          : whenKind.value === 'unscheduled' ? 'No scheduled time' : 'Timeline label'
    }
    whenKind.addEventListener('change', syncTimingPrecision)
    syncTimingPrecision()
    const description = el('textarea', 'lp-textarea')
    description.placeholder = 'What happens?'
    description.value = event?.description || suggestion?.description || ''
    const selectedParticipantNames = new Set<string>(event?.participantNames || suggestion?.participantNames || [])
    const participants = el('section', 'lp-card lp-settings-section')
    participants.appendChild(el('div', 'lp-eyebrow', 'Participants'))
    const picker = el('div', 'lp-contact-checklist lp-participant-picker')
    const candidateNames = [
      this.state!.pocketPersona.displayName,
      ...listPocketActors(this.state!).map((actor) => actor.name),
      ...(suggestion?.participantNames || []),
      ...(event?.participantNames || []),
    ].filter((name, index, all) => Boolean(name) && all.findIndex((other) => normalizeActorName(other) === normalizeActorName(name)) === index)

    for (const name of candidateNames) {
      const row = el('label', 'lp-contact-check')
      const input = el('input')
      input.type = 'checkbox'
      input.checked = [...selectedParticipantNames].some((entry) => normalizeActorName(entry) === normalizeActorName(name))
      input.addEventListener('change', () => {
        for (const existing of [...selectedParticipantNames]) {
          if (normalizeActorName(existing) === normalizeActorName(name)) selectedParticipantNames.delete(existing)
        }
        if (input.checked) selectedParticipantNames.add(name)
      })
      const known = normalizeActorName(name) === normalizeActorName(this.state!.pocketPersona.displayName)
        || listPocketActors(this.state!).some((actor) => normalizeActorName(actor.name) === normalizeActorName(name))
      row.append(input, el('span', 'lp-grow', name), el('span', 'lp-copy', known ? 'Known actor' : 'Name-only · profile not required'))
      picker.appendChild(row)
    }
    participants.appendChild(picker)

    const completed = el('input')
    completed.type = 'checkbox'
    completed.checked = event?.completed || false
    const completeRow = el('label', 'lp-card lp-row-between')
    completeRow.append(el('span', 'lp-title', 'Completed'), completed)
    content.append(title.label, lane.label, whenKindLabel, whenText.label, exactTiming, description, participants, completeRow)
    if (event?.source) {
      const source = button('Open source conversation', 'lp-button lp-button-quiet')
      source.addEventListener('click', () => this.openPocket({ app: 'messages', conversationId: event.source!.conversationId, messageId: event.source!.messageId }))
      content.appendChild(source)
    }
    const save = () => {
      const startDate = new Date(start.input.value)
      const endDate = new Date(end.input.value)
      this.send('lumiphone:action', { action: 'event', payload: {
        id: event?.id, title: inputValue(title.input), lane: inputValue(lane.input), description: description.value,
        start: whenKind.value === 'exact'
          ? (Number.isNaN(startDate.getTime()) ? this.state!.roleplayNow : startDate.toISOString())
          : event?.start || this.state!.roleplayNow,
        end: whenKind.value === 'exact'
          ? (Number.isNaN(endDate.getTime()) ? this.state!.roleplayNow : endDate.toISOString())
          : event?.end || event?.start || this.state!.roleplayNow,
        whenKind: whenKind.value, whenText: inputValue(whenText.input), completed: completed.checked,
        participants: [...selectedParticipantNames],
        sourceConversationId: event?.source?.conversationId || schedulerSeed?.conversationId,
        sourceMessageId: event?.source?.messageId || schedulerSeed?.messageId,
        sourceSuggestionId: event?.source?.suggestionId || schedulerSeed?.suggestion.id,
      } })
      this.pendingEventSuggestion = null
      this.back()
    }
    if (event) {
      const remove = button('Delete event', 'lp-button lp-button-danger')
      remove.addEventListener('click', () => { this.send('lumiphone:delete', { kind: 'event', id: event.id }); this.back() })
      content.appendChild(remove)
    }
    return page
  }

  private renderTrackers(): HTMLDivElement {
    const draftKey = `${this.state!.chatId}:${this.state!.characterId}:${this.selectedTrackerId}`
    return renderTrackersView({
      state: this.state!, selectedId: this.selectedTrackerId, selectedView: this.selectedTrackerView,
      accent: this.preferences.colors.accent,
      draft: this.trackerDrafts.get(draftKey),
      updateDraft: draft => { this.trackerDrafts.set(draftKey, draft) },
      saving: Boolean(this.trackerSaveRequest),
      pending: Boolean(this.trackerMutationRequest) || this.jevWorking,
      save: payload => { if (this.trackerSaveRequest) return; this.trackerSaveDraftKey = draftKey; this.trackerSaveRequest = this.send('lumiphone:action', { action: 'tracker', payload }) },
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      field: (label, value, type) => this.field(label, value, type),
      send: (type, payload) => {
        if (this.trackerMutationRequest || this.jevWorking) return
        if (type === 'lumiphone:jev_evaluate') { this.jevWorking = true; this.trackerJevRequest = this.send(type, payload) }
        else this.trackerMutationRequest = this.send(type, payload)
        this.render(false)
      },
      select: (id, view = 'detail', replace = false) => this.openPocket({ app: 'trackers', trackerId: id || undefined, view }, !replace),
      back: () => this.back(),
      onCleanup: (cleanup) => this.viewCleanups.push(cleanup),
    })
  }

  private renderNotifications(): HTMLDivElement {
    return renderNotificationsView({
      notifications: this.state!.notifications.filter((entry) => notificationBelongsToDevice(this.state!, this.currentDeviceOwnerActorId(), entry.deviceOwnerActorId)),
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      navigate: (route) => this.openPocket(route),
      send: (type, payload) => { this.send(type, payload) },
    })
  }

  private renderSettings(): HTMLDivElement {
    this.settingsDraft ||= structuredClone(this.preferences)
    return renderSettingsView({
      identityProfiles: this.identityProfiles,
      draft: this.settingsDraft,
      jevKeyConfigured: this.jevKeyConfigured,
      state: this.state!,
      section: this.selectedSettingsSection,
      activePersona: this.activePersona,
      capabilities: this.caps,
      imageConnections: this.imageConnections,
      swarmProfile: this.swarmProfile,
      generation: this.generation,
      resolvedWallpapers: this.resolvedWallpapers,
      contextPreview: this.contextPreview,
      personaPreview: this.personaPreview,
      operations: this.operations,
      page: (title, subtitle, action) => this.page(title, subtitle, action),
      update: (preferences, options) => this.updatePreferences(preferences, options),
      navigate: (section) => this.openPocket({ app: 'settings', section }),
      send: (type, payload) => { if (type === 'lumiphone:open_native_image_settings') this.close(); return this.send(type, payload) },
      requestPermissions: () => { void this.requestPermissions() },
      showError: (message) => this.showError(message),
      rerender: () => this.render(false),
      onCleanup: cleanup => this.viewCleanups.push(cleanup),
      resumeSetup: () => this.showFirstChatSetup(true),
      chooseImage: (target, mode) => { void this.chooseImage(target, mode) },
      mountModelCombobox: (target, options) => {
        let stopped = false
        let observer: MutationObserver | undefined
        let handle: ReturnType<typeof this.ctx.components.mountModelCombobox> | undefined
        const stop = () => { stopped = true; observer?.disconnect(); handle?.destroy(); handle = undefined }
        this.viewCleanups.push(stop)
        const mount = () => {
          if (stopped || handle || !target.isConnected) return
          observer?.disconnect()
          handle = this.ctx.components.mountModelCombobox(target, {
            value: options.value,
            connection: options.connection,
            appearance: 'standard',
            placeholder: 'Use connection model',
            disabled: options.disabled,
            onChange: options.onChange,
          })
        }
        queueMicrotask(() => {
          if (stopped) return
          if (target.isConnected) mount()
          else { observer = new MutationObserver(mount); observer.observe(document.body, { childList: true, subtree: true }) }
        })
        return stop
      },
    })
  }

  private showFirstChatSetup(manual = false): void {
    if (this.setupModalOpen || !this.state || this.state.setup.initialized || (!manual && this.state.setup.dismissed)) return
    // Setup is opened only by an explicit user action, never by greeting arrival.
    const active = this.ctx.getActiveChat()
    if (active.chatId !== this.state.chatId) return
    this.setupModalOpen = true
    this.setupPersonaEditing = false
    const modal = this.ctx.ui.showModal({ title: 'Set up Pocket', width: 620, maxHeight: 760 })
    const body = el('div', 'lp-settings-section lp-setup')
    this.setupModalBody = body
    this.setupModalDismiss = () => modal.dismiss()
    modal.root.appendChild(body)
    this.renderFirstChatSetupBody()
    modal.onDismiss(() => {
      for (const cleanup of this.setupControlCleanups.splice(0)) cleanup()
      this.setupModalOpen = false
      this.setupPersonaEditing = false
      this.setupModalBody = null
      this.setupModalDismiss = null
    })
  }

  private renderFirstChatSetupBody(): void {
    const body = this.setupModalBody
    const state = this.state
    if (!body || !state) return
    for (const cleanup of this.setupControlCleanups.splice(0)) cleanup()
    body.replaceChildren()

    const hero = el('header', 'lp-setup-hero')
    const diagram = el('div', 'lp-setup-diagram'); diagram.innerHTML = PHONE_ICON; diagram.setAttribute('aria-hidden', 'true')
    const intro = el('div', 'lp-setup-intro')
    intro.append(el('div', 'lp-setup-code', 'POCKET / INITIALIZE'), el('h1', 'lp-setup-title', 'A phone for your story.'), el('p', 'lp-copy', 'Connect a model, choose its owner, and bring your world along.'))
    hero.append(intro, diagram); body.appendChild(hero)
    const stage = (section: HTMLElement, number: string, title: string, status: string, ready = false) => {
      section.classList.add('lp-setup-stage'); section.dataset.setupStage = number
      const heading = el('div', 'lp-setup-stage-heading')
      const index = el('span', 'lp-setup-index', number); index.setAttribute('aria-hidden', 'true')
      const badge = el('span', 'lp-setup-status', status); badge.dataset.ready = String(ready)
      heading.append(index, el('h2', 'lp-setup-stage-title', title), badge); section.prepend(heading)
    }
    const authorship = el('section', 'lp-card lp-settings-section')
    stage(authorship, '01', 'Who writes your character?', 'This chat')
    const mode = el('input'); mode.type = 'hidden'; mode.value = state.setup.authorship || 'roleplay'
    const modes = el('div', 'lp-setup-modes'); modes.setAttribute('role', 'radiogroup'); modes.setAttribute('aria-label', 'Character authorship')
    for (const [value, title, copy] of [['roleplay', 'Roleplay', 'You write your character. Pocket writes the people around them.'], ['impersonation', 'Impersonation', 'AI can write both sides, including your character’s phone messages.']] as const) {
      const choice = el('label', 'lp-setup-mode'); const radio = el('input'); radio.type = 'radio'; radio.name = 'pocket-authorship-' + this.surfaceId; radio.value = value; radio.checked = mode.value === value
      const wording = el('span', 'lp-setup-mode-copy'); wording.append(el('strong', '', title), el('span', '', copy))
      radio.addEventListener('change', () => { if (!radio.checked) return; mode.value = value; this.send('lumiphone:set_authorship', { authorship: value }) })
      choice.append(radio, wording); modes.append(choice)
    }
    authorship.append(modes, el('p', 'lp-copy', 'You can always send messages manually inside Pocket.'))

    const effective = this.generation?.effective
    const latestTest = [...(this.generation?.history || this.preferences.generationHistory || [])]
      .reverse()
      .find((entry) => entry.task === 'connection-test')
    const llmReady = Boolean(this.caps?.generation && effective?.configured)
    const llm = el('section', 'lp-card lp-settings-section')
    llm.append(
      el('strong', '', effective?.name || 'No effective connection'),
      el('p', 'lp-copy', effective
        ? `${effective.provider} · ${effective.model || 'model not set'}`
        : 'Pocket needs a usable Lumiverse text-generation connection.'),
    )
    if (latestTest) {
      llm.appendChild(el('p', 'lp-copy',
        latestTest.status === 'started' ? '● Testing…'
          : latestTest.status === 'completed' ? `✓ Test passed · ${latestTest.latencyMs ?? 0} ms`
            : `Test failed · ${latestTest.error || 'Unknown provider error'}`))
    }
    stage(llm, '02', 'Connect your model', llmReady ? 'Connected' : 'Needs connection', llmReady)
    const llmActions = el('div', 'lp-row')
    const test = button('Test LLM', 'lp-button lp-button-quiet')
    test.disabled = !this.caps?.generation || latestTest?.status === 'started'
    test.addEventListener('click', () => {
      test.disabled = true
      test.textContent = 'Testing…'
      this.send('lumiphone:test_generation', {
        generationMode: this.preferences.generationMode,
        sidecarConnectionId: this.preferences.sidecarConnectionId,
        sidecarModelOverride: this.preferences.sidecarModelOverride,
      })
    })
    const configureLlm = button('Generation settings', 'lp-button lp-button-quiet')
    configureLlm.addEventListener('click', () => {
      this.setupModalDismiss?.()
      this.openPocket({ app: 'settings', section: 'generation' })
    })
    llmActions.append(test, configureLlm)
    llm.appendChild(llmActions)
    const afterAttachment = (target: HTMLElement, mount: () => { destroy(): void }) => {
      let stopped = false; let observer: MutationObserver | undefined; let handle: { destroy(): void } | undefined
      this.setupControlCleanups.push(() => { stopped = true; observer?.disconnect(); handle?.destroy() })
      const attach = () => { if (stopped || handle || !target.isConnected) return; observer?.disconnect(); handle = mount() }
      queueMicrotask(() => { if (stopped) return; if (target.isConnected) attach(); else { observer = new MutationObserver(attach); observer.observe(document.body, { childList: true, subtree: true }) } })
    }
    const sourceControls = el('div', 'lp-setup-generation')
    const source = el('select', 'lp-select'); source.setAttribute('aria-label', 'Pocket generation source')
    for (const [value, label] of [['roleplay', 'Follow roleplay connection'], ['sidecar', 'Choose a Pocket connection']]) {
      const option = el('option', '', label); option.value = value; option.selected = this.preferences.generationMode === value; source.append(option)
    }
    source.addEventListener('change', () => {
      this.updatePreferences({ ...this.preferences, generationMode: source.value === 'sidecar' ? 'sidecar' : 'roleplay' })
      this.renderFirstChatSetupBody()
    })
    sourceControls.append(source)
    if (this.preferences.generationMode === 'sidecar') {
      const connectionMount = el('div', 'lp-model-combobox')
      const connectionOptions = (this.generation?.connections || []).map(entry => ({ value: entry.id, label: entry.name, sublabel: `${entry.provider} · ${entry.model || 'Choose model'}` }))
      const changeConnection = (value: string) => {
        this.updatePreferences({ ...this.preferences, sidecarConnectionId: value, sidecarModelOverride: '' })
        this.renderFirstChatSetupBody()
      }
      if (this.ctx.components.mountSelect) {
        afterAttachment(connectionMount, () => this.ctx.components.mountSelect(connectionMount, { value: this.preferences.sidecarConnectionId, options: connectionOptions, ariaLabel: 'Pocket connection', placeholder: 'Choose connection', portal: false, className: 'lp-setup-connection-select', maxHeight: 220, onChange: changeConnection }))
      } else {
        const connection = el('select', 'lp-select'); connection.setAttribute('aria-label', 'Pocket connection')
        connection.append(new Option('Choose connection', ''))
        for (const entry of connectionOptions) connection.append(new Option(entry.label, entry.value, false, entry.value === this.preferences.sidecarConnectionId))
        connection.addEventListener('change', () => changeConnection(connection.value)); connectionMount.append(connection)
      }
      const modelMount = el('div', 'lp-model-combobox')
      afterAttachment(modelMount, () => this.ctx.components.mountModelCombobox(modelMount, { value: this.preferences.sidecarModelOverride, connection: { kind: 'llm', id: this.preferences.sidecarConnectionId || undefined }, disabled: !this.preferences.sidecarConnectionId, placeholder: 'Use connection model', onChange: value => this.updatePreferences({ ...this.preferences, sidecarModelOverride: value }) }))
      const connectionLabel = el('div', 'lp-setup-field', 'Connection'); connectionLabel.append(connectionMount)
      const modelLabel = el('div', 'lp-setup-field', 'Model'); modelLabel.append(modelMount)
      sourceControls.append(connectionLabel, modelLabel)
    }
    llm.append(sourceControls)

    const personaReady = Boolean(state.setup.personaConfigured)
    const persona = el('section', 'lp-card lp-settings-section')
    persona.append(
      el('strong', '', personaReady ? state.pocketPersona.displayName : (this.activePersona?.name || 'Choose the phone owner')),
      el('p', 'lp-copy', personaReady
        ? 'This character owns Pocket and is the recipient role for private DMs.'
        : 'Choose who Pocket follows as the phone owner.'),
    )
    stage(persona, '03', 'Choose the phone owner', personaReady ? 'Linked' : 'Choose owner', personaReady)
    const personaActions = el('div', 'lp-row')
    if (this.activePersona) {
      const follow = button(`Follow ${this.activePersona.name}`, 'lp-button')
      follow.addEventListener('click', () => {
        follow.disabled = true
        follow.textContent = 'Saving…'
        this.send('lumiphone:save_pocket_persona', { followLumiverse: true, persona: state.pocketPersona })
      })
      personaActions.appendChild(follow)
    }
    const customize = button('Customize', 'lp-button lp-button-quiet')
    customize.addEventListener('click', () => {
      this.setupPersonaEditing = true
      this.personaPreview = null
      this.renderFirstChatPersonaEditor()
    })
    personaActions.appendChild(customize)
    persona.appendChild(personaActions)

    const worldStatus = state.setup.worldStatus || 'unconfigured'
    const goal = state.events.find((event) => event.lane === 'Current goal' && !event.completed)
    const world = el('section', 'lp-card lp-settings-section')
    world.append(
      el('strong', '', worldStatus === 'seeded' ? 'Seeded from this roleplay' : worldStatus === 'skipped' ? 'Skipped' : 'No world baseline yet'),
      el('p', 'lp-copy',
        worldStatus === 'seeded'
          ? goal ? `Timeline goal: ${goal.title}` : 'Weather and Timeline were seeded; no clear current goal was found.'
          : worldStatus === 'skipped'
            ? 'Pocket will start without situational first-turn hooks. You can add world state later.'
            : 'Seed a sanitized world snapshot from the current RP. Raw narrative is not used as phone history.'),
    )
    stage(world, '04', 'Bring in your world', worldStatus === 'seeded' ? 'Seeded' : 'Optional', worldStatus === 'seeded')
    const worldActions = el('div', 'lp-row')
    const worldOperation = [...this.operations.values()].find((entry) => entry.task === 'world-seed' && entry.phase !== 'complete' && entry.phase !== 'error')
    const seed = button(worldOperation ? 'Seeding…' : worldStatus === 'seeded' ? 'Reseed from RP' : 'Seed from current RP', 'lp-button')
    seed.disabled = !this.caps?.generation || Boolean(worldOperation)
    seed.addEventListener('click', () => {
      seed.disabled = true
      seed.textContent = 'Seeding…'
      const operationRequestId = this.send('lumiphone:setup_world_seed', { timezoneOffsetMinutes: new Date().getTimezoneOffset() })
      const progress = el('div', 'lp-operation-progress')
      progress.dataset.operationRequest = operationRequestId
      progress.dataset.phase = 'generating'
      progress.setAttribute('role', 'status')
      const label = el('strong', '', 'Reading roleplay and seeding world…'); label.dataset.operationMessage = 'true'
      progress.append(el('span', 'lp-indeterminate'), label)
      world.appendChild(progress)
    })
    const skip = button('Skip', 'lp-button lp-button-quiet')
    skip.addEventListener('click', () => this.send('lumiphone:setup_world_skip'))
    worldActions.append(seed, skip)
    world.appendChild(worldActions)
    if (worldOperation) {
      const progress = el('div', 'lp-operation-progress')
      progress.dataset.operationRequest = worldOperation.requestId
      progress.dataset.phase = worldOperation.phase
      progress.setAttribute('role', 'status')
      const label = el('strong', '', worldOperation.message); label.dataset.operationMessage = 'true'
      progress.append(el('span', 'lp-indeterminate'), label)
      world.appendChild(progress)
    }

    const start = button('Start Pocket', 'lp-button')
    start.disabled = !llmReady || !personaReady
    start.title = !llmReady ? 'Pocket needs a working LLM first.' : !personaReady ? 'Choose the phone owner first.' : ''
    start.addEventListener('click', () => {
      start.disabled = true
      start.textContent = 'Starting…'
      this.send('lumiphone:finish_setup', { authorship: mode.value })
    })

    const later = button('Not now', 'lp-button lp-button-quiet')
    later.addEventListener('click', () => {
      this.send('lumiphone:dismiss_setup')
      this.setupModalDismiss?.()
    })

    const footer = el('footer', 'lp-setup-footer')
    const readiness = el('p', 'lp-copy', !llmReady ? 'Connect a model to continue.' : !personaReady ? 'Choose a phone owner to continue.' : 'Your phone is ready. World setup is optional.'); readiness.setAttribute('role', 'status')
    start.classList.add('lp-setup-start'); footer.append(readiness, later, start)
    body.append(authorship, llm, persona, world, footer)
  }

  private renderFirstChatPersonaEditor(): void {
    const body = this.setupModalBody
    const state = this.state
    if (!body || !state) return
    body.replaceChildren()

    for (const cleanup of this.setupControlCleanups.splice(0)) cleanup()
    const profile = this.personaPreview || state.pocketPersona
    const phoneProfile = profile.phoneProfile || { personality: '', appearance: '', textingStyle: '' }

    const back = button('← Back to setup', 'lp-button lp-button-quiet')
    back.addEventListener('click', () => {
      this.setupPersonaEditing = false
      this.personaPreview = null
      this.renderFirstChatSetupBody()
    })

    body.append(
      back,
      el('div', 'lp-setup-code', 'POCKET / IDENTITY'),
      el('h1', 'lp-setup-title', 'Make it their phone.'),
      el('p', 'lp-copy', 'Keep this compact and useful for texting. Pocket does not need a full prose character card to generate a DM.'),
    )

    const source = el('select', 'lp-select')
    for (const [value, label] of [['lumiverse', 'Follow Lumiverse Persona'], ['manual', 'Use Pocket profile']] as const) {
      const option = el('option', '', label)
      option.value = value
      option.selected = profile.source === value || (profile.source === 'generated' && value === 'manual')
      source.appendChild(option)
    }

    const name = el('input', 'lp-input')
    name.placeholder = 'Display name'
    name.value = profile.displayName

    const pronouns = el('input', 'lp-input')
    pronouns.placeholder = 'Pronouns'
    pronouns.value = profile.pronouns

    const role = el('input', 'lp-input')
    role.placeholder = 'Role'
    role.value = profile.role

    const personality = el('textarea', 'lp-textarea')
    personality.placeholder = 'Personality — stable traits that shape conversation'
    personality.value = phoneProfile.personality

    const appearance = el('textarea', 'lp-textarea')
    appearance.placeholder = 'Minimal appearance — only a few recognizable details'
    appearance.value = phoneProfile.appearance

    const textingStyle = el('textarea', 'lp-textarea')
    textingStyle.placeholder = 'Texting quirks — lowercase, punctuation, slang/register, emoji/kaomoji habits, fragmentation…'
    textingStyle.value = phoneProfile.textingStyle

    const coreFields = [name, pronouns, role]
    const syncSource = () => {
      const followsLumiverse = source.value === 'lumiverse'
      for (const field of coreFields) field.disabled = followsLumiverse
    }
    source.addEventListener('change', syncSource)
    syncSource()

    const fields = el('section', 'lp-card lp-settings-section lp-setup-profile')
    const labelled = (title: string, control: HTMLElement) => { const label = el('label', 'lp-setup-field', title); label.append(control); return label }
    fields.append(
      labelled('Profile source', source), labelled('Display name', name), labelled('Pronouns', pronouns), labelled('Role', role),
      labelled('Personality', personality), labelled('Appearance', appearance), labelled('Texting style', textingStyle),
    )

    const actions = el('div', 'lp-row')
    const personaOperation = [...this.operations.values()].find((entry) => entry.task === 'persona-profile' && entry.phase !== 'complete' && entry.phase !== 'error')
    const stopButton = (requestId: string) => {
      const stop = button('Stop enrichment', 'lp-button lp-enrichment-stop')
      stop.dataset.operationStop = requestId
      stop.addEventListener('click', () => {
        this.send('lumiphone:cancel_persona_generation', { operationRequestId: requestId })
        this.recordOperationProgress({ task: 'persona-profile', requestId, phase: 'error', message: 'Enrichment stopped. You can retry whenever you’re ready.' })
      })
      return stop
    }
    const enrich = button(personaOperation ? 'Enriching…' : 'Enrich with LLM', 'lp-button lp-button-quiet')
    enrich.disabled = !this.caps?.generation || Boolean(personaOperation)
    enrich.addEventListener('click', () => {
      enrich.disabled = true
      enrich.textContent = 'Enriching…'
      for (const old of body.querySelectorAll('.lp-operation-progress')) old.remove()
      const operationRequestId = this.send('lumiphone:generate_pocket_persona')
      this.operations.set(operationRequestId, { task: 'persona-profile', requestId: operationRequestId, phase: 'generating', message: 'Enriching phone profile…' })
      enrich.dataset.operationAction = operationRequestId
      actions.append(stopButton(operationRequestId))
      const progress = el('div', 'lp-operation-progress')
      progress.dataset.operationRequest = operationRequestId
      progress.dataset.phase = 'generating'
      progress.setAttribute('role', 'status')
      const label = el('strong', '', 'Enriching phone profile…'); label.dataset.operationMessage = 'true'
      progress.append(el('span', 'lp-indeterminate'), label)
      body.appendChild(progress)
    })

    const save = button('Save phone profile', 'lp-button')
    save.addEventListener('click', () => {
      save.disabled = true
      save.textContent = 'Saving…'
      this.send('lumiphone:save_pocket_persona', {
        followLumiverse: source.value === 'lumiverse',
        persona: {
          ...state.pocketPersona,
          ...profile,
          source: source.value,
          displayName: name.value.trim(),
          pronouns: pronouns.value.trim(),
          role: role.value.trim(),
          phoneProfile: {
            personality: personality.value.trim(),
            appearance: appearance.value.trim(),
            textingStyle: textingStyle.value.trim(),
          },
        },
      })
    })

    actions.append(enrich, save)
    body.append(fields, actions, identityProfileControls(this.identityProfiles, 'persona', undefined, (type, payload) => this.send(type, payload), () => ({ name: name.value, pronouns: pronouns.value, role: role.value, identityBrief: profile.identityBrief, phoneProfile: { personality: personality.value, appearance: appearance.value, textingStyle: textingStyle.value } })))
    if (personaOperation) {
      enrich.dataset.operationAction = personaOperation.requestId
      actions.append(stopButton(personaOperation.requestId))
      const progress = el('div', 'lp-operation-progress')
      progress.dataset.operationRequest = personaOperation.requestId
      progress.dataset.phase = personaOperation.phase
      progress.setAttribute('role', 'status')
      const label = el('strong', '', personaOperation.message); label.dataset.operationMessage = 'true'
      progress.append(el('span', 'lp-indeterminate'), label)
      body.appendChild(progress)
    }

    if (this.personaPreview) {
      body.insertBefore(
        el('p', 'lp-copy', '✓ LLM enrichment loaded into the fields above. Review it, then save.'),
        actions,
      )
    }
  }

  private field(labelText: string, value = '', type = 'text'): { label: HTMLLabelElement; input: HTMLInputElement } {
    const label = el('label', 'lp-label', labelText)
    const input = el('input', 'lp-input')
    input.type = type
    input.value = value
    label.appendChild(input)
    return { label, input }
  }

  private empty(iconName: string, title: string, copy: string): HTMLDivElement {
    const node = el('div', 'lp-empty')
    const inner = el('div')
    inner.append(icon(iconName), el('h3', 'lp-title', title), el('p', 'lp-copy', copy))
    node.appendChild(inner)
    return node
  }

  private showError(message: string): void {
    this.showFeedback(message, true)
  }

  private showFeedback(message: string, error = false): void {
    window.clearTimeout(this.alertTimer)
    this.alert.textContent = message
    this.alert.dataset.severity = error ? 'error' : 'success'
    this.alert.hidden = false
    this.alertTimer = window.setTimeout(() => { this.alert.hidden = true }, 5_500)
  }
}

export function setupPhone(ctx: SpindleFrontendContext): Cleanup {
  const controller = new PocketController(ctx)
  ctx.ready()
  return () => controller.destroy()
}
