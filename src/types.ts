export type PhoneApp =
  | 'home'
  | 'messages'
  | 'mochi'
  | 'contacts'
  | 'gallery'
  | 'camera'
  | 'notes'
  | 'weather'
  | 'calendar'
  | 'trackers'
  | 'notifications'
  | 'settings'

export type PhoneTheme = 'midnight' | 'porcelain' | 'rose' | 'forest' | 'pink' | 'custom'
export type OpenAnimation = 'spring' | 'slide' | 'fade' | 'none'

export type PocketRoute =
  | { app: 'home' }
  | { app: 'mochi'; roomId?: string }
  | { app: 'messages'; conversationId?: string; contactId?: string; messageId?: string; view?: 'thread' | 'new-group' | 'group-editor' | 'group-detail' }
  | { app: 'contacts'; contactId?: string; groupId?: string; view?: 'list' | 'detail' | 'config' | 'import' | 'quick-gen' | 'new' | 'draft' | 'groups' | 'group-config' | 'bank' | 'cast-config' | 'cast-import' | 'bank-entry' }
  | { app: 'trackers'; trackerId?: string; view?: 'detail' | 'config' }
  | { app: 'calendar'; eventId?: string }
  | { app: 'notes'; noteId?: string }
  | { app: 'gallery'; imageId?: string }
  | { app: 'camera'; contactId?: string; draft?: boolean }
  | { app: 'weather' }
  | { app: 'notifications' }
  | { app: 'settings'; section?: string }

export interface PhonePalette {
  accent: string
  bezel: string
  background: string
  surface: string
  text: string
  wallpaperPrimary: string
  wallpaperSecondary: string
  chatPrimary: string
  chatSecondary: string
}

export interface ManualVisualProfile {
  positive: string
  negative: string
  model: string
  connectionId: string
  loras: Array<{ name: string; weight: number }>
  parameters: Record<string, unknown>
}

/** Device-wide preferences. These never belong to a chat/character state file. */
export type PocketGenerationMode = 'roleplay' | 'sidecar'
export type AmbientMessageFrequency = 'off' | 'sparse' | 'normal'
export type RoleplayContextMode = 'off' | 'recent' | 'story' | 'smart'
export type ConversationPauseReason = 'ended' | 'busy' | 'away' | 'sleeping' | 'unknown'
export type ConversationLocalReason = 'in_scene' | 'arrived' | 'took_action' | 'continued_in_person'
export type ConversationAvailability =
  | { state: 'remote' }
  | { state: 'arriving' }
  | { state: 'paused'; reason: ConversationPauseReason }
  | { state: 'local'; reason: ConversationLocalReason; resumePauseReason?: ConversationPauseReason }
export type ReplyCadence = 'instant' | 'quick' | 'natural' | 'relaxed'

export type PocketImageSource =
  | { kind: 'builtin'; wallpaperId: string }
  | { kind: 'gallery'; imageId: string }
  | { kind: 'asset'; assetId: string }
  | { kind: 'url'; url: string }

export interface PocketWallpaper {
  source: PocketImageSource | null
  fit: 'cover' | 'contain' | 'stretch'
  focalX: number
  focalY: number
  scrim: number
}

export interface PocketResolvedImage {
  url: string
  status: 'empty' | 'ready' | 'error'
  sourceKind: PocketImageSource['kind'] | 'none'
  sourceLabel: string
  error?: string
}

export interface PocketResolvedWallpapers {
  deviceHome: PocketResolvedImage
  deviceChat: PocketResolvedImage
  personaHome: PocketResolvedImage
  personaChat: PocketResolvedImage
}

/** Frontend identity for one logical Pocket device on one mounted UI surface. */
export interface PocketDeviceIdentity {
  /** Stable semantic key for this chat + character + device owner. */
  key: string
  chatId: string
  characterId: string
  deviceOwnerActorId: string
  role: 'persona' | 'actor'
  inspection: boolean
  /** Ephemeral per-controller mount id used to isolate dynamic CSS and DOM state. */
  surfaceId: string
}

export interface PersonaAppearanceOverride {
  enabled: boolean
  theme: PhoneTheme
  colors: PhonePalette
  customCss: string
  homeWallpaper: PocketWallpaper
  chatWallpaper: PocketWallpaper
}

export interface PocketGenerationRun {
  requestId: string
  task: 'npc-contact' | 'profile-refresh' | 'scene-sync' | 'persona-profile' | 'message-reply' | 'message-retry' | 'group-reply' | 'reply-decision' | 'ambient-decision' | 'continuity-seed' | 'post-turn-audit' | 'scene-planner' | 'connection-test' | 'weather-week' | 'timeline-review' | 'tracker-judge'
  mode: PocketGenerationMode
  connectionId: string
  connectionName: string
  provider: string
  model: string
  status: 'started' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  latencyMs?: number
  error?: string
}

export interface PocketConnectionSummary {
  id: string
  name: string
  provider: string
  model: string
  isDefault: boolean
  configured: boolean
}

export interface PocketGenerationInfo {
  mode: PocketGenerationMode
  effective: PocketConnectionSummary | null
  connections: PocketConnectionSummary[]
  history: PocketGenerationRun[]
  modelOverride: string
}

export interface SceneActorSnapshotEntry {
  contactId: string
  roleHint: string
  sceneBrief: string
}

export interface SceneActorSnapshot {
  actors: SceneActorSnapshotEntry[]
  capturedAt: string
  sourceMessageId: string
  sourceMessageIndex: number
  sourceRevision: number
  stale: boolean
}

export interface PocketPhoneProfile {
  personality: string
  appearance: string
  textingStyle: string
}
export interface ChatPocketPersona {
  source: 'lumiverse' | 'manual' | 'generated'
  linkedPersonaId: string
  displayName: string
  pronouns: string
  role: string
  identityBrief: string
  /** Compact Pocket-only profile optimized for phone conversation generation. */
  phoneProfile?: PocketPhoneProfile
  avatarUrl: string
  accent: string
  canAppear: boolean
  updatedAt: string
}

export interface PocketContextComponentStat {
  count: number
  chars: number
  budget: number
}

export interface PocketContextDiagnostics {
  mode: RoleplayContextMode
  actorIdentityChars: number
  sceneSnapshot: { stale: boolean; capturedAt: string; sourceMessageId: string; sourceMessageIndex: number; chars: number }
  phoneThread: PocketContextComponentStat
  recentRoleplay: PocketContextComponentStat & { latestMessageId: string }
  story: PocketContextComponentStat
  totalChars: number
  estimatedTokens: number
  authoritativeLatest: { id: string; index: number; excerpt: string }
  includedLatest: { id: string; index: number; excerpt: string }
  freshnessWarning: string
  assembled: string
}

export interface PocketOperationProgress {
  task: 'npc-contact' | 'profile-refresh' | 'scene-sync' | 'world-seed' | 'persona-profile' | 'weather-week' | 'timeline-review'
  requestId: string
  phase: 'request' | 'generating' | 'thinking' | 'writing' | 'parsing' | 'saving' | 'complete' | 'error'
  message: string
}

export interface DevicePreferences {
  version: 5
  voiceMessages?: boolean
  ttsVoiceURI?: string
  ttsConnectionId?: string
  ttsConnectionOptions?: Record<string, { voice?: string; model?: string }>
  theme: PhoneTheme
  colors: PhonePalette
  homeWallpaper: PocketWallpaper
  chatWallpaper: PocketWallpaper
  /** Desktop-only physical size of the 9:18.4 handset. */
  handsetScale: number
  /** Device-wide density of Pocket controls and content. Never scales the host surface. */
  uiScale: number
  animation: OpenAnimation
  animationDurationMs: number
  reducedMotion: boolean
  nativeTouchScrollMode: 'auto' | 'native' | 'guarded'
  autoOpenOnModelAction: boolean
  inlineAppearance?: 'cards' | 'phone'
  pushNotifications: boolean
  useSwarmProfile: boolean
  sceneEnhancer: boolean
  jev?: PocketJevSettings
  generationMode: PocketGenerationMode
  automaticGenerationRetry: boolean
  sidecarConnectionId: string
  sidecarModelOverride: string
  samplerOverrides?: Partial<Record<'temperature' | 'top_p' | 'top_k' | 'min_p' | 'frequency_penalty' | 'presence_penalty' | 'repetition_penalty', number>>
  autoReplyAfterSend: boolean
  replyCadence: ReplyCadence
  ambientMessaging: AmbientMessageFrequency
  roleplayContextMode: RoleplayContextMode
  /** Cosmetic status only; reconciliation still runs when hidden. */
  showReconciliationStatus: boolean
  recentRoleplayMessages: number
  notificationSounds: boolean
  notificationPreviews: boolean
  notifyMessages: boolean
  notifyContacts: boolean
  notifyTrackers: boolean
  customCss: string
  personaAppearance: Record<string, PersonaAppearanceOverride>
  generationHistory: PocketGenerationRun[]
  manualVisualProfile: ManualVisualProfile
}

export interface PhoneEventSuggestion {
  id: string
  kind: 'event'
  status: 'pending' | 'declined' | 'scheduled'
  title: string
  description: string
  whenKind: 'exact' | 'approximate' | 'relative' | 'unscheduled'
  whenText: string
  start?: string
  end?: string
  /** Names are valid even when no Contact/profile exists yet. */
  participantNames: string[]
  scheduledEventId?: string
}
export type PocketMessageDirection = 'outbound' | 'inbound' | 'external'

export interface PocketTurnCandidateOrigin {
  chatId: string
  hostMessageId: string
  swipeId: number
  generationId?: string
}

export interface PocketHostSwipeSelection {
  hostMessageId: string
  swipeId: number
  updatedAt: string
}

export interface PocketRoleplayClockSnapshot {
  roleplayNow: string
  source: 'manual' | 'narrative' | 'legacy'
  precision: 'exact' | 'approximate' | 'relative' | 'unknown'
  label: string
}

export interface PocketHostClockBaseline extends PocketRoleplayClockSnapshot {
  hostMessageId: string
  updatedAt: string
}

export interface PocketCandidateClockSnapshot extends PocketRoleplayClockSnapshot {
  hostMessageId: string
  swipeId: number
  generationId?: string
  updatedAt: string
}

export interface PhoneMessage {
  format?: 'voice'
  call?: PocketCallMarker
  id: string
  sender: 'persona' | 'contact' | 'system'
  /** Generic Pocket actor identity. Contact ids remain valid actor ids. Persona messages also carry the canonical Pocket Persona actor id. */
  senderActorId?: string
  /** Canonical recipients in the communication graph. */
  recipientActorIds?: string[]
  /** Device owners that have opened/seen this message. Sender is always included. */
  readByActorIds?: string[]
  senderActorKind?: 'contact' | 'discovered'
  /** Legacy/contact-specific identity retained for compatibility. */
  senderContactId?: string
  /** Stable display fallback when the underlying profile is renamed or removed. */
  senderName: string
  senderAccent: string
  text: string
  createdAt: string
  read: boolean
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  imageId?: string
  imageUrl?: string
  eventSuggestion?: PhoneEventSuggestion
  /** Host roleplay candidate that caused this model-authored side effect. */
  origin?: PocketTurnCandidateOrigin
  /** Candidate-scoped model messages remain hidden until the final assistant candidate commits them. */
  candidateCommitState?: 'provisional' | 'committed'
  generation?: {
    requestId: string
    retryOf?: string
    info?: {
      speaker: string
      source: string
      sourceId: string
      sourceResolution: 'resolved' | 'snapshot' | 'manual'
      activeCharacterId: string
      activeCharacterUsed: boolean
      identityChars: number
      sceneSnapshotStale: boolean
      contextMode: RoleplayContextMode
      recentCount: number
      recentChars: number
      storyCount: number
      storyChars: number
      threadCount: number
      threadChars: number
      generationMode: PocketGenerationMode
      connectionName: string
      model: string
      groupBatch?: {
        id: string
        position: number
        size: number
        eligibleCount: number
      }
      replyDecision?: {
        rawAction: ReplyDecisionAction
        normalizedAction: ReplyDecisionAction
        reason: string
        normalizationReason: string
      }
    }
  }
}

export type ReplyDecisionAction = 'reply' | 'none' | 'pause' | 'handoff' | 'arrival_handoff'

export interface PocketReplyDecision {
  rawAction: ReplyDecisionAction
  normalizedAction: ReplyDecisionAction
  reason: string
  normalizationReason: string
  contactInScene: boolean
  remoteEligible: boolean
  explicitRemoteOverride: boolean
  createdAt: string
  burstId?: string
  relayId?: string
}

export interface PocketActorMemoryEntry {
  id: string
  conversationId: string
  conversationTitle: string
  conversationKind: 'direct' | 'group'
  messageId: string
  speakerActorId: string
  speakerName: string
  text: string
  /** Snapshot of who could read this phone message when it happened. */
  knownByActorIds: string[]
  /** Name fallback keeps memory stable across discovered-actor promotion/renames. */
  knownByNames: string[]
  createdAt: string
}
export interface PocketConversationTailSnapshot {
  text: string
  recentMessageIds: string[]
  updatedAt: string
}

export type PocketContactSource =
  | { kind: 'character'; characterId: string }
  | { kind: 'council'; memberId: string; itemId: string }
  | { kind: 'npc'; origin: 'manual' | 'generated' | 'scene' | 'discovered'; description: string; sceneKey?: string; discoveredActorId?: string; bankId?: string }

export type PocketRelationship = 'background' | 'close'

/**
 * A named actor Pocket has needed to persist, but the user has not chosen to
 * materialize as a full Contact. Profile completeness never gates speech.
 */
export interface DiscoveredActor {
  id: string
  chatId: string
  displayName: string
  normalizedName: string
  firstSeenAt: string
  lastSeenAt: string
  source: 'roleplay' | 'messages' | 'group-chat' | 'model-tool'
  relationship: PocketRelationship
  promotedContactId?: string
}

export interface PocketMessagingStyle {
  /** Participation likelihood, not a guarantee that this contact speaks. */
  talkativeness: number
  /** Likelihood of short consecutive bubbles instead of one compact text. */
  fragmentation: number
}

export interface PocketNpcBankEntry {
  id: string
  name: string
  normalizedName: string
  aliases: string[]
  role: string
  identityBrief: string
  phoneProfile?: PocketPhoneProfile
  avatarUrl: string
  avatarSource?: PocketImageSource | null
  avatarFocus?: { x: number; y: number }
  accent: string
  messagingStyle: PocketMessagingStyle
  tags: string[]
  createdAt: string
  updatedAt: string
}
export interface PocketNpcBank {
  version: 2
  entries: PocketNpcBankEntry[]
  groups: PocketContactGroup[]
  updatedAt: string
}

/** IDs are local contact IDs in PhoneState and stable Bank entry IDs in NPC Bank. */
export interface PocketContactGroup {
  id: string
  name: string
  memberIds: string[]
  bankGroupId?: string
  createdAt: string
  updatedAt: string
}

export interface PocketContactDraft {
  name: string
  role: string
  identityBrief: string
  phoneProfile?: PocketPhoneProfile
  accent: string
  messagingStyle: PocketMessagingStyle
  sourceDescription: string
  avatarUrl?: string
  avatarSource?: PocketImageSource | null
  avatarFocus?: { x: number; y: number }
}

export interface PocketContact {
  id: string
  name: string
  role: string
  description: string
  /** Stable compact identity used in generation. Linked actors refresh from their authoritative source. */
  identityBrief: string
  phoneProfile?: PocketPhoneProfile
  /** Ephemeral scene-only note, maintained by Scene Sync. */
  sceneNote: string
  avatarUrl: string
  sourceAvatarUrl: string
  avatarOverrideUrl: string
  avatarSource?: PocketImageSource | null
  avatarFocus?: { x: number; y: number }
  accent: string
  sourceAccent: string
  colorMode: 'pocket' | 'source'
  source: PocketContactSource
  /** Close actors are disclosed prominently; background actors stay cheap. */
  relationship: PocketRelationship
  presence: { inScene: boolean; lastSceneAt: string }
  contextPolicy: { pinned: boolean }
  generationPolicy: { relevant: boolean }
  messagingPolicy: {
    remoteEligible: boolean
    allowAmbientInScene: boolean
    lastInitiatedMessageAt: string
    lastInitiatedRoleplayAt: string
  }
  messagingStyle: PocketMessagingStyle
  createdAt: string
  updatedAt: string
}

export interface PendingGroupBatchMessage {
  format?: 'voice'
  id: string
  speakerId: string
  text: string
  eventSuggestion?: PhoneEventSuggestion
  state: 'queued' | 'delivered' | 'cancelled'
  deliveredMessageId?: string
  deliveredAt?: string
}

export interface PendingGroupBatch {
  id: string
  requestId: string
  conversationId: string
  sourceBurstId?: string
  eligibleActorIds: string[]
  /** Legacy alias retained while old state is migrated. */
  eligibleContactIds: string[]
  messages: PendingGroupBatchMessage[]
  status: 'queued' | 'delivering' | 'completed' | 'cancelled' | 'failed'
  createdAt: string
  updatedAt: string
  error?: string
}

export interface PocketConversation {
  id: string
  kind: 'direct' | 'group'
  title: string
  /** Non-Persona participants. Contact ids and discovered actor ids share this namespace. */
  participantActorIds: string[]
  /** Whether the configured Pocket Persona is also a participant. Legacy conversations default true. */
  includesPocketPersona: boolean
  /** Contact-only compatibility projection; never use it to infer all members. */
  participantContactIds: string[]
  messages: PhoneMessage[]
  unread: number
  pause?: { reason: ConversationPauseReason; createdAt: string; source: 'model' | 'scene' }
  availability: ConversationAvailability
  tailSnapshot?: PocketConversationTailSnapshot
  lastDecision?: PocketReplyDecision
  outgoingBurst?: {
    id: string
    messageIds: string[]
    open: boolean
    held: boolean
    finalized: boolean
    explicitRemoteOverride: boolean
    updatedAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface PocketContactSourceOption {
  kind: 'character' | 'council'
  sourceId: string
  itemId?: string
  name: string
  role: string
  description: string
  avatarUrl: string
  accent?: string
  importedContactId?: string
}

export interface PhoneNote {
  id: string
  title: string
  body: string
  mood: string
  pinned: boolean
  author: 'user' | 'character' | 'model' | 'shared'
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  whenKind: 'exact' | 'approximate' | 'relative' | 'unscheduled'
  whenText: string
  color: string
  lane: string
  completed: boolean
  createdBy: 'user' | 'character' | 'model'
  kind?: 'event' | 'phone-handoff'
  actorContactIds?: string[]
  /** Generic actor membership. May include discovered/name-only actors and the Pocket Persona. */
  participantActorIds?: string[]
  /** Human-readable fallback retained even when a participant has no profile. */
  participantNames?: string[]
  /** Stable semantic identity for world-seeded Timeline rows across reseeds/promotions. */
  continuityKey?: string
  source?: { app: 'messages'; conversationId: string; relayId?: string; messageId?: string; suggestionId?: string }
  channelTransition?:
    | { from: 'remote' | 'arriving' | 'paused'; to: 'local'; reason: ConversationLocalReason }
    | { from: 'remote' | 'arriving' | 'paused'; to: 'arriving'; reason: 'arriving' }
}

export type PocketRelayKind = 'local' | 'arrival'
export type PocketRelayReason = ConversationLocalReason | 'arriving'

export interface PocketRelay {
  id: string
  chatId: string
  characterId: string
  contactId: string
  conversationId: string
  /** Outgoing decision burst which created this relay. Absent only on migrated/scene-created relays. */
  burstId?: string
  /** Local handoffs close the phone channel; arrival relays keep it remote/arriving. */
  kind: PocketRelayKind
  reason: PocketRelayReason
  actorState: 'arriving' | 'in_scene' | 'arrived' | 'took_action' | 'continued_in_person'
  conversationTail: PocketConversationTailSnapshot
  latestExchange: string
  sourceMessageId?: string
  timelineEventId: string
  createdAt: string
  status: 'pending' | 'consumed' | 'dismissed'
  consumedAt?: string
  consumedMessageId?: string
  injectedAt?: string
  injectedGenerationId?: string
  serializedRelayChars?: number
  serializedRelay?: string
  relayExchangeMessageCount?: number
  injectionError?: string
  continuation: {
    state: 'idle' | 'launching' | 'accepted' | 'started' | 'completed' | 'blocked' | 'failed' | 'stopped'
    generationId?: string
    invokedAt?: string
    permissionCheckedAt?: string
    permissions?: { chatMutation: boolean; generation: boolean }
    method?: 'spindle.chat.appendMessage(triggerGeneration)'
    hostCallReturnedAt?: string
    hostAcceptedAt?: string
    generationStartedAt?: string
    generationCompletedAt?: string
    sourceMessageId?: string
    error?: string
  }
}

export type PocketReferenceScope = 'conversation' | 'recent_messages' | 'selected_messages'

export interface PocketReferenceParticipant {
  actorId: string
  contactId?: string
  name: string
  role: string
  identityBrief: string
}

export interface PocketReferenceMessage {
  messageId: string
  sender: 'persona' | 'contact'
  senderContactId?: string
  senderActorId?: string
  senderName: string
  text: string
  createdAt: string
}

/**
 * A user-armed, one-shot Pocket context attachment for the next normal RP turn.
 * Unlike PocketRelay this never changes channel ownership or scene presence.
 */
export interface PocketContextReference {
  id: string
  chatId: string
  characterId: string
  sourceApp: 'messages'
  conversationId: string
  conversationTitle: string
  conversationKind: 'direct' | 'group'
  scope: PocketReferenceScope
  visibility: 'context'
  participants: PocketReferenceParticipant[]
  snapshot: string
  messages: PocketReferenceMessage[]
  createdAt: string
  status: 'armed' | 'injected' | 'consumed' | 'cancelled' | 'failed'
  injectedAt?: string
  injectedGenerationId?: string
  boundUserMessageId?: string
  serializedReferenceChars?: number
  serializedReference?: string
  consumedAt?: string
  consumedMessageId?: string
  error?: string
}

export interface RoleplayWeather {
  outlook?: import('./domain/app-review.js').WeatherOutlook
  location: string
  condition: string
  temperature: number
  unit: 'C' | 'F'
  high: number
  low: number
  details: string
  updatedAt: string
}

export type TrackerKind = 'meter' | 'counter' | 'state' | 'timer'
export type TrackerClock = 'real' | 'roleplay'
export type TrackerUpdateMode = 'manual' | 'model' | 'automatic' | 'jev'
export interface TrackerJevConfig {
  question: string
  /** Numeric rubric anchors, low to high. State trackers use their allowed states. */
  levels: Array<{ value: number; label: string }>
  minConfidence: number
}
export interface TrackerJevResult {
  sourceKey: string
  status: 'applied' | 'unchanged' | 'uncertain' | 'invalid'
  confidence?: number
  evaluatedAt: string
  message: string
}
export interface PocketJevSettings { enabled: boolean; provider: 'llm' | 'typesafe'; model: string; autoAfterTurn: boolean }
export type TrackerOperation = 'set' | 'add' | 'subtract' | 'reset' | 'set_state'
export type TrackerPresentation = 'relationship' | 'meter' | 'vitals' | 'segmented' | 'counter' | 'timer' | 'state' | 'compact'

export interface TrackerTarget {
  type: 'character' | 'persona' | 'relationship' | 'scene' | 'world' | 'custom'
  id: string
  label: string
}

export interface TrackerBand {
  min: number
  max: number
  label: string
  color: string
  meaning?: 'good' | 'bad' | 'neutral'
}

export interface TrackerHistoryEntry {
  id: string
  previous: number | string
  next: number | string
  operation: TrackerOperation | 'automatic'
  amount?: number
  reason: string
  source: 'user' | 'model' | 'tag' | 'automatic' | 'migration' | 'jev'
  createdAt: string
  roleplayAt?: string
}

interface TrackerBase {
  id: string
  key: string
  label: string
  kind: TrackerKind
  value: number
  initialValue: number
  min: number
  max: number
  unit: string
  color: string
  target: TrackerTarget
  updateMode: TrackerUpdateMode
  jev?: TrackerJevConfig
  jevResult?: TrackerJevResult
  clock: TrackerClock
  allowModelWrite: boolean
  modelPrompt?: string
  presentation: TrackerPresentation
  bands: TrackerBand[]
  history: TrackerHistoryEntry[]
  ratePerHour: number
  lastUpdated: string
  lastRoleplayAt: string
  pausedReason: string
  clockPaused?: boolean
  visibleToModel: boolean
  createdAt: string
  updatedAt: string
}

export interface MeterTracker extends TrackerBase { kind: 'meter' }
export interface CounterTracker extends TrackerBase { kind: 'counter'; step: number }
export interface TimerTracker extends TrackerBase { kind: 'timer'; direction: 'up' | 'down' }
export interface StateTracker extends TrackerBase { kind: 'state'; state: string; initialState: string; states: string[] }

export type PhoneTracker = MeterTracker | CounterTracker | TimerTracker | StateTracker

export interface PhoneNotification {
  id: string
  app: PhoneApp
  title: string
  body: string
  createdAt: string
  read: boolean
  dismissedAt?: string
  source?: 'model' | 'automatic' | 'system'
  /** Device owner this notification belongs to. Empty/missing means the Pocket Persona for legacy rows. */
  deviceOwnerActorId?: string
  severity?: 'info' | 'important' | 'error'
  route?: PocketRoute
  /** Migrated on read; retained only for older backups. */
  action?: string
}

export type PocketActivityPresentationKind = 'sent' | 'received' | 'observed' | 'referenced' | 'generic' | 'batch'
export interface PocketActivityBatchMessage {
  format?: 'voice'
  messageId: string
  senderActorId?: string
  senderName: string
  text: string
  direction: 'sent' | 'received' | 'observed'
}
export interface PocketActivityPresentation {
  format?: 'voice'
  kind: PocketActivityPresentationKind
  senderActorId?: string
  recipientActorIds?: string[]
  senderName?: string
  recipientNames?: string[]
  conversationTitle?: string
  batchMessages?: PocketActivityBatchMessage[]
  call?: PocketCallMarker
  storyAt?: string
  storyTimeLabel?: string
  storyTimezoneOffsetMinutes?: number
}

export interface PocketCallMarker {
  callId: string
  status: 'connected' | 'ended' | 'missed'
  speakerphone: boolean
  durationSeconds?: number
}

export interface PocketActivity {
  id: string
  kind: 'message' | 'call' | 'contact' | 'tracker-change' | 'timeline' | 'note' | 'image' | 'weather' | 'system'
  title: string
  summary?: string
  route: PocketRoute
  createdAt: string
  scope: { chatId: string; characterId: string }
  presentation?: PocketActivityPresentation
  source?: {
    commandId?: string
    messageId?: string
    trackerId?: string
    contactId?: string
    conversationId?: string
    eventId?: string
    noteId?: string
    imageId?: string
    /** Batch transport may attach one inline activity to several canonical messages. */
    messageIds?: string[]
  }
}

export interface ProcessedPocketCommand {
  id: string
  semanticKey: string
  createdAt: string
  activityId?: string
}

export type PocketReconciliationDomain = 'continuity' | 'clock' | 'weather' | 'presence' | 'timeline' | 'trackers'
export interface PocketStateReconciliation {
  revision: number
  sourceKey: string
  sourceMessageIds: string[]
  generationId?: string
  messageId?: string
  updatedAt: string
  domains: PocketReconciliationDomain[]
}
export interface PhoneState {
  version: 11
  chatId: string
  characterId: string
  characterName: string
  roleplayNow: string
  /** Provenance for the in-world clock. Wall clock is never authoritative RP time. */
  roleplayClockSource?: 'manual' | 'narrative' | 'legacy'
  roleplayClockPrecision?: 'exact' | 'approximate' | 'relative' | 'unknown'
  roleplayClockLabel?: string
  /** Browser getTimezoneOffset(), persisted so backend can interpret narrative local times. */
  roleplayTimezoneOffsetMinutes?: number
  /** Monotonic Pocket-state revision advanced by post-turn reconciliation. */
  stateRevision?: number
  /** Active host swipe per assistant message. Used to project candidate-owned side effects. */
  hostSwipeSelections?: PocketHostSwipeSelection[]
  /** Clock state immediately before a host assistant message, shared by all of its swipe candidates. */
  hostClockBaselines?: PocketHostClockBaseline[]
  /** Post-turn clock state for each generated swipe candidate. */
  candidateClocks?: PocketCandidateClockSnapshot[]
  /** Provenance for the latest committed narrative reconciliation pass. */
  lastReconciliation?: PocketStateReconciliation
  sceneSnapshot: SceneActorSnapshot | null
  /** Stable actor id for the configured Pocket Persona inside the communication graph. */
  pocketPersonaActorId: string
  pocketPersona: ChatPocketPersona
  setup: {
    initialized: boolean
    dismissed: boolean
    personaConfigured?: boolean
    worldStatus?: 'unconfigured' | 'seeded' | 'skipped'
    worldSeededAt?: string
    authorship?: 'roleplay' | 'impersonation'
  }
  /** Linked source keys explicitly deleted by the user and therefore not auto-recreated. */
  suppressedContactSourceKeys: string[]
  contacts: PocketContact[]
  contactGroups?: PocketContactGroup[]
  discoveredActors: DiscoveredActor[]
  conversations: PocketConversation[]
  /** RP-local phone knowledge. Stable profile lives elsewhere; these memories never cross RP state files. */
  actorMemoryVersion: number
  actorMemories: PocketActorMemoryEntry[]
  notes: PhoneNote[]
  events: CalendarEvent[]
  relays: PocketRelay[]
  references: PocketContextReference[]
  groupBatches: PendingGroupBatch[]
  weather: RoleplayWeather
  trackers: PhoneTracker[]
  notifications: PhoneNotification[]
  activities: PocketActivity[]
  processedCommands: ProcessedPocketCommand[]
  updatedAt: string
}

/** Kept as a source-compatible alias for integration helpers. */
export type PhoneSettings = DevicePreferences

export interface SwarmVisualProfile {
  available: boolean
  status: 'connected' | 'not-detected' | 'disabled' | 'error'
  error: string
  characterPositive: string
  personaPositive: string
  negative: string
  presets: string
  checkpoint: string
  aspect: string
  loras?: string
  source: 'swarm_studio' | 'manual'
  fields: Record<'char_base' | 'persona_base' | 'swarm_negative' | 'swarm_preset' | 'swarm_checkpoint' | 'swarm_aspect' | 'swarm_loras', {
    detected: boolean
    length: number
    preview: string
  }>
}

export interface PhoneCapabilities {
  generation: boolean
  interceptor: boolean
  tools: boolean
  chats: boolean
  characters: boolean
  personas: boolean
  images: boolean
  corsProxy: boolean
  imageGen: boolean
  panels: boolean
  push: boolean
  sceneSync: boolean
}

export interface GalleryResult {
  offset?: number
  limit?: number
  data: Array<{
    id: string
    thumbnailUrl: string
    fullUrl: string
    url: string
    filename: string
    mimeType: string
    width: number | null
    height: number | null
    createdAt: number
    canDelete?: boolean
  }>
  total: number
}
