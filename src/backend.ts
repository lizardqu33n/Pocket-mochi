import { GALLERY_PAGE_SIZE, galleryOffset } from './domain/gallery-page.js'
import { MochiService } from './mochi/service.js'
import { MochiScheduler } from './mochi/scheduler.js'
import { voiceMessage } from './domain/voice.js'
import type {
  CalendarEvent,
  GalleryResult,
  PhoneCapabilities,
  PhoneEventSuggestion,
  DevicePreferences,
  DiscoveredActor,
  PhoneMessage,
  PhoneNote,
  PhoneNotification,
  PocketActivity,
  PocketActorMemoryEntry,
  PocketRoute,
  PocketGenerationInfo,
  PocketGenerationRun,
  ProcessedPocketCommand,
  PhoneState,
  PhoneTracker,
  PocketContact,
  PocketContactDraft,
  PocketContactSourceOption,
  PocketNpcBank,
  PocketContextReference,
  PocketConversation,
  PendingGroupBatch,
  PocketReferenceScope,
  PocketRelay,
  PocketResolvedWallpapers,
  PocketTurnCandidateOrigin,
  PocketRoleplayClockSnapshot,
  PocketHostClockBaseline,
  PocketCandidateClockSnapshot,
  ChatPocketPersona,
  SceneActorSnapshot,
  RoleplayWeather,
  SwarmVisualProfile,
} from './types.js'
import { defaultPreferences, isFuturePreferences, normalizeImageSource, normalizePreferences, normalizeWallpaper, PREFERENCES_PATH } from './domain/preferences.js'
import { clockDayPart, clockLabel, CLOCK_DAY_PART_KEYS } from './domain/clock-label.js'
import { projectPhoneContext } from './domain/projection.js'
import { assertPersonaAuthorship, callSummary, normalizeCallMarker } from './domain/phone-events.js'
import { legacyActionRoute, normalizePocketRoute } from './domain/navigation.js'
import { applyTrackerOperation, materializeTracker, normalizeTracker, setTrackerClockPaused, trackerKey, uniqueTrackerKey, validateTrackerConfig } from './domain/trackers.js'
import { contactAccent, contactSourceKey, ensureDirectConversation, normalizeAvatarFocus, normalizeContactCollections, normalizePocketContact, stableContactAccent } from './domain/contacts.js'
import { applyNpcBankProfile, contactFromNpcBank, findNpcBankMatch, isFutureNpcBank, normalizeNpcBank, normalizeNpcBankName, NPC_BANK_PATH, removeNpcBankEntry, upsertNpcBankFromContact } from './domain/npc-bank.js'
import { actorAsGenerationContact, conversationActorIds, ensureDirectActorConversation, ensureDiscoveredActor, ensureExternalDirectConversation, matchingActorIds, normalizeActorName, normalizeDiscoveredActors, promoteDiscoveredActor, resolvePocketActor } from './domain/actors.js'
import { clearNotifications, destinationIsVisible, dismissNotification, markNotificationRead } from './domain/notifications.js'
import { conversationDeviceActorIds, conversationUnreadForDevice, messageDirection, notificationBelongsToDevice, pocketPersonaActorId } from './domain/device.js'
import { ambientEligibleContacts, contactCooldownReady, shouldTakeAmbientOpportunity } from './domain/messaging.js'
import { actorPhoneMemoryContext, groupActorPhoneMemoryContext, normalizeActorMemories, removeActorMemoryByMessageId, upsertActorMemory } from './domain/actor-memory.js'
import { generatedEventSuggestion, normalizeEventSuggestion } from './domain/scheduler.js'
import { ReplyJobs } from './backend/reply-jobs.js'
import { inspectPocketGeneration, runPocketGeneration } from './backend/generation.js'
import { parseGeneratedObject, parseWithTruncationRetry } from './backend/structured.js'
import { ArrivalIdle } from './backend/arrival-idle.js'
import { applyTimelineReview, normalizeWeatherOutlook } from './domain/app-review.js'
import { snapshotActivityClock } from './domain/activity-clock.js'
import { AppReviews } from './backend/app-reviews.js'
import { IDENTITY_PROFILES_PATH, normalizeIdentityProfiles, saveIdentityProfile, applyIdentityProfile } from './domain/identity-profiles.js'
import { assemblePocketContext } from './backend/roleplay-context.js'
import { narrativeExcerpt, sanitizeNarrativeContent, stripPocketPresentationMarkup } from './backend/narrative-content.js'
import { conversationTailSnapshot, normalizeReplyDecision, pendingRelayContext, persistentHandoffContext, relayForGeneration, relayIdFromMessages, relayLatestExchange } from './backend/continuity.js'
import { assertPocketImageResolved, resolvePocketImageSource } from './backend/image-sources.js'
import { effectiveImageRequest, runImageJob } from './backend/image-jobs.js'
import type { ImagePurpose } from './backend/image-jobs.js'
import { runTypeSafeJev, jevSourceKey, readJevAnswers, jevLlmRequest } from './backend/jev.js'
import { applyJevAnswer, jevQuestion, normalizeJevSettings } from './domain/jev.js'
import { normalizeContactGroups, saveContactGroup } from './domain/contact-groups.js'
import { createPocketReference, latestArmedReference, referenceForGeneration, serializePocketReference } from './backend/references.js'

declare const spindle: import('lumiverse-spindle-types').SpindleAPI
const mochi = new MochiService(spindle)
const mochiScheduler = new MochiScheduler(spindle, mochi, Date.now, message => spindle.log.warn(message))
mochiScheduler.start()

type AnyRecord = Record<string, unknown>
function stringArray(value: unknown, limit: number, maxLength: number): string[] {
  return [...new Set((Array.isArray(value) ? value : []).map(entry => text(entry, maxLength)).filter(Boolean))].slice(0, limit)
}

const STATE_VERSION = 11 as const
const MAX_MESSAGES = 240
const MAX_NOTIFICATIONS = 80
const MAX_NOTES = 120
const MAX_EVENTS = 200
const MAX_TRACKERS = 40
const MAX_ACTIVITIES = 120
const stateLocks = new Map<string, Promise<unknown>>()
const jevFlights = new Set<string>()
interface CameraJob { controller: AbortController; cancelled: boolean; chatId: string; characterId: string; userId?: string }
const cameraJobs = new Map<string, CameraJob>()
const personaJobs = new Map<string, CameraJob>()
const appReviews = new AppReviews({ loadState, saveState, sendState, send, getMessages: chatId => spindle.chat.getMessages(chatId), runStructuredGeneration, withStateLock, stateKey, nowIso })
const replyJobs = new ReplyJobs()
const arrivalIdle = new ArrivalIdle()
const replyJobScope = (chatId: string, characterId: string, conversationId: string, userId?: string) => JSON.stringify([userId || '', chatId, characterId, conversationId])
const notificationThrottle = new Map<string, number>()
const ambientFlights = new Set<string>()
const replyDecisionFlights = new Set<string>()
const replyBurstTimers = new Map<string, ReturnType<typeof setTimeout>>()
const relayFlights = new Set<string>()
const groupBatchFlights = new Map<string, string>()
interface PocketViewState { chatId: string; characterId: string; deviceOwnerActorId: string; open: boolean; route: PocketRoute; updatedAt: number }
const frontendViews = new Map<string, PocketViewState>()
interface ActivePocketCandidate extends PocketTurnCandidateOrigin {
  userKey: string
  characterId: string
  generationType: string
  startedAt: number
}
const activePocketCandidates = new Map<string, ActivePocketCandidate>()

const PHONE_GUIDANCE = `Pocket is the authoritative persistence layer for in-world phone state.
The per-chat ROLEPLAY/IMPERSONATION authorship rule below is authoritative. Persona-authored messages are available only in Impersonation; never bypass this through tags, aliases, or batches.
For a character voice message, use action="message" with format="voice" and text containing only the spoken transcript. Each message_batch row also accepts format="voice". Playback uses the user's selected TTS on request; do not invent audio URLs.
For an established voice call use action="call", with speaker, target or conversationId, status="connected"|"ended"|"missed", and optional speakerphone. A connected call returns callId; ending it must supply that same callId and conversation. Use durationSeconds only when the story explicitly establishes elapsed time. Put the returned artifactTag or commitTag exactly once in the final scene, as with messages. Spoken dialogue stays in ordinary prose; never create text messages for every spoken line. These are story events, not real voice/video calls.

Pocket reference blocks are read-only history. Their messages already happened. Never recreate, resend, or restyle a referenced message merely because it appears in the prompt. Pocket automatically renders successfully persisted phone actions in the roleplay UI. Do not repeat or shim a phone message in prose merely to make it visible. Normal prose may naturally describe using, reading, showing, or reacting to a phone when that action matters to the scene.

Pocket Action is an execution step, not an output section. Do not reason about where the tool call or its result belongs in the written response, whether the user can see it, or how to compensate for it. Invoke it when the phone action occurs, then continue the roleplay normally. After a successful Pocket Action, do not ask the user to click, continue, confirm, or complete anything; Pocket owns persistence and UI presentation.

When this request exposes a Pocket Action function/tool, CALL that tool for every newly-created phone action that should persist in Pocket, especially a message sent or received during the generated scene. One Pocket Action invocation persists exactly one action, except message_batch which intentionally carries one coherent burst of multiple messages from the SAME group chat. Multiple Pocket Action calls in the same assistant turn are expected whenever distinct phone actions occur; a successful first call does NOT cover later unrelated actions. Do not reduce, summarize, or omit meaningful group-chat participants merely to save Pocket calls: when several newly-authored messages belong to one GC burst, use message_batch and let the gremlins gremlin. If another separate text, reply, call, event, or other phone action happens later in the same scene, invoke Pocket Action again for that later action before continuing past it. Do not write the tool name, arguments, JSON, or a fake tool result into narrative prose. Do not substitute markdown, inline code, custom typography, colors, labels, or preset-specific text styling for a Pocket message. Pocket owns the persisted message payload and its visual presentation.
A newly-authored phone message MUST NOT exist only as quoted dialogue, lock-screen text, notification text, or narrated message content in prose. Persist it through Pocket Action first; if and only if the tool is unavailable, use the hidden <lumi-phone> fallback.
After each successful message Pocket Action, Pocket returns two candidate-commit markers: artifactTag and commitTag. The tool mutation is PROVISIONAL until the final assistant candidate carries exactly one returned marker. Every phone message that survives into final canon MUST have exactly one marker in final assistant content. If the phone action is visible/readable/observed in the final scene, place artifactTag exactly ON ITS OWN LINE at that narrative position and do NOT also quote, retype, color, italicize, or otherwise print the message text in prose. artifactTag is already a durable inline HTML anchor; place it verbatim so Pocket can render the phone artifact immediately while the response is still streaming. If the action truly happens in canon but should remain completely off-screen/unrendered, place commitTag exactly once; Pocket removes it from visible prose. If you invoked Pocket while reasoning and decide that action does NOT belong in the final scene, emit neither marker and Pocket will discard that provisional action at commit. Never emit both markers for one action. Do not assume the tool call itself commits canon; the final marker is the commit receipt.

For a new direct message, use action="message" with payload containing channel="dm", speaker, target or conversationId, and text. If speaker names the configured Pocket Persona, Pocket canonicalizes it as an outbound Persona message; sender="persona" is only an optional shortcut. For NPC-to-NPC direct messages, provide both speaker and target. Pocket stores the communication canonically and projects it only onto participating characters' devices. This requirement still applies when the current POV cannot read the screen: if the scene establishes that one NPC actually sends or receives a new message, call Pocket Action with the canonical sender, recipient, and message text you are establishing in-world even if that text is not quoted in prose. A phone lighting up, a visible notification preview, an NPC reacting to a newly arrived message, or prose saying one actor texted another are all phone actions; do not skip them merely because neither participant is the Pocket Persona.
For one group message, use action="message" with channel="gc", conversation/exact title or conversationId, speaker, and text. If the GC is not in Pocket yet, supply participants and Pocket may create/ensure the group while sending. For a burst of several newly-authored messages in the SAME GC, prefer action="message_batch" with channel="gc", conversation/title, participants when known, and messages:[{"speaker":"Name","text":"..."}, ...]. Pocket may materialize lightweight named actors and ensure those speakers are group members; explicit conversation actions remain for deliberate membership edits/renames outside the message burst. A batch persists every underlying message individually and returns one inline/commit marker for the coherent burst.
A new named actor may be lightweight; Pocket can persist them without a full profile. A message already supplied verbatim in Pocket reference/history is historical and MUST NOT be recreated. A message whose exact text YOU invent in this response is newly-authored canon even if the story says it was sent earlier; persist it rather than summarizing it away.

ONLY when no Pocket Action function/tool is present in the model's available tools, emit hidden machine data using at most 3 <lumi-phone> action tags. The three-tag limit is an ACTION limit, not a dialogue limit: one message_batch tag may carry up to 24 newly-authored messages from the same GC. Do not summarize or omit meaningful speakers merely to stay under the tag limit.
<lumi-phone action="message">{"channel":"dm","speaker":"Name","target":"Name","text":"message text"}</lumi-phone>
<lumi-phone action="message_batch">{"channel":"gc","conversation":"Class 3-A","participants":["Katsuki Bakugo","Mina Ashido","Izuku Midoriya"],"messages":[{"speaker":"Mina Ashido","text":"..."},{"speaker":"Izuku Midoriya","text":"..."}]}</lumi-phone>
The tag is machine data. Pocket compiles valid fallback tags through the same canonical action pipeline and rewrites fallback message/message_batch tags into durable inline anchors automatically; the model does not need an activity id. Do not explain the tag, quote it, wrap it in markdown, or imitate it elsewhere in the response. Other supported actions are conversation, contact, scene, note, event, weather, tracker, camera, notify, and open.

Pocket messages, contacts, notes, calendar events, weather, trackers, and scene state persist separately for this chat and character.`

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown, max = 4_000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function numberValue(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 14)
  return `${prefix}_${random || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`}`
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 160) || '_none'
}

function stateKey(chatId: string, characterId: string): string {
  return `${safeSegment(chatId || '_lobby')}__${safeSegment(characterId || '_none')}`
}

function canonicalPocketPersonaActorId(chatId: string, characterId: string): string {
  return `persona:${safeSegment(chatId || '_lobby')}:${safeSegment(characterId || '_none')}`
}

function statePath(chatId: string, characterId: string): string {
  return `phones/${stateKey(chatId, characterId)}.json`
}

function defaultWeather(): RoleplayWeather {
  return {
    location: 'The current scene',
    condition: 'Clear',
    temperature: 21,
    unit: 'C',
    high: 24,
    low: 16,
    details: 'Quiet, clear conditions in the roleplay timeline.',
    updatedAt: nowIso(),
  }
}

function defaultPocketPersona(createdAt = nowIso()): ChatPocketPersona {
  return {
    source: 'lumiverse',
    linkedPersonaId: '',
    displayName: 'You',
    pronouns: '',
    role: 'Persona',
    identityBrief: '',
    phoneProfile: { personality: '', appearance: '', textingStyle: '' },
    avatarUrl: '',
    accent: '#8b7dff',
    canAppear: false,
    updatedAt: createdAt,
  }
}

function normalizePocketPersona(value: unknown, fallback = defaultPocketPersona()): ChatPocketPersona {
  const raw = isRecord(value) ? value : {}
  const source = raw.source === 'manual' || raw.source === 'generated' ? raw.source : 'lumiverse'
  const rawPhoneProfile = isRecord(raw.phoneProfile) ? raw.phoneProfile : null
  const fallbackPhoneProfile = fallback.phoneProfile || { personality: '', appearance: '', textingStyle: '' }
  return {
    source,
    linkedPersonaId: text(raw.linkedPersonaId, 180),
    displayName: text(raw.displayName, 120) || fallback.displayName,
    pronouns: text(raw.pronouns, 120),
    role: text(raw.role, 120) || fallback.role,
    identityBrief: text(raw.identityBrief, 1_200),
    phoneProfile: rawPhoneProfile ? {
      personality: text(rawPhoneProfile.personality, 600),
      appearance: text(rawPhoneProfile.appearance, 360),
      textingStyle: text(rawPhoneProfile.textingStyle, 600),
    } : { ...fallbackPhoneProfile },
    avatarUrl: text(raw.avatarUrl, 2_000),
    accent: /^#[0-9a-f]{6}$/i.test(text(raw.accent, 20)) ? text(raw.accent, 20) : fallback.accent,
    canAppear: bool(raw.canAppear),
    updatedAt: text(raw.updatedAt, 40) || fallback.updatedAt,
  }
}

function pocketPersonaPhoneBrief(persona: ChatPocketPersona): string {
  const profile = persona.phoneProfile
  const lines = [
    profile?.personality ? `Personality: ${text(profile.personality, 420)}` : '',
    profile?.appearance ? `Minimal appearance: ${text(profile.appearance, 240)}` : '',
    profile?.textingStyle ? `Texting style: ${text(profile.textingStyle, 420)}` : '',
  ].filter(Boolean)
  if (lines.length) return lines.join('\n').slice(0, 900)
  return text(persona.identityBrief, 520)
}

function defaultState(chatId: string, characterId: string, characterName = 'Character'): PhoneState {
  const createdAt = nowIso()
  const personaActorId = canonicalPocketPersonaActorId(chatId, characterId)
  const collections = normalizeContactCollections({}, { characterId, characterName, now: createdAt, makeId: id, personaActorId })
  return {
    version: STATE_VERSION,
    chatId,
    characterId,
    characterName: characterName || 'Character',
    roleplayNow: createdAt,
    stateRevision: 0,
    hostSwipeSelections: [],
    hostClockBaselines: [],
    candidateClocks: [],
    sceneSnapshot: null,
    pocketPersona: defaultPocketPersona(createdAt),
    pocketPersonaActorId: personaActorId,
    suppressedContactSourceKeys: [],
    setup: { initialized: false, dismissed: false, personaConfigured: false, worldStatus: 'unconfigured', authorship: 'roleplay' },
    contacts: collections.contacts,
    contactGroups: [],
    discoveredActors: [],
    conversations: collections.conversations,
    actorMemoryVersion: 1,
    actorMemories: [],
    notes: [],
    events: [],
    relays: [],
    references: [],
    groupBatches: [],
    weather: defaultWeather(),
    trackers: [],
    notifications: [],
    activities: [],
    processedCommands: [],
    updatedAt: createdAt,
  }
}

function normalizeState(value: unknown, chatId: string, characterId: string, characterName: string): PhoneState {
  const fallback = defaultState(chatId, characterId, characterName)
  if (!isRecord(value)) return fallback
  if (Number(value.version) > STATE_VERSION) return fallback
  const personaActorId = text(value.pocketPersonaActorId, 180) || canonicalPocketPersonaActorId(chatId, characterId)
  const collections = normalizeContactCollections(value, { characterId, characterName, now: nowIso(), makeId: id, personaActorId })
  const suppressedContactSourceKeys = (Array.isArray(value.suppressedContactSourceKeys) ? value.suppressedContactSourceKeys : [])
    .map((entry) => text(entry, 240)).filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index).slice(-160)
  const discoveredActors: DiscoveredActor[] = normalizeDiscoveredActors(value.discoveredActors, chatId, nowIso())
  const actorMemories = normalizeActorMemories(value.actorMemories)
  const notes: PhoneNote[] = (Array.isArray(value.notes) ? value.notes : []).slice(0, MAX_NOTES).flatMap((item) => {
    if (!isRecord(item)) return []
    const body = text(item.body, 40_000)
    const title = text(item.title, 180) || body.slice(0, 36) || 'Untitled note'
    return [{
      id: text(item.id, 120) || id('note'), title, body,
      mood: text(item.mood, 80), pinned: bool(item.pinned),
      author: item.author === 'character' || item.author === 'model' || item.author === 'shared' ? item.author : 'user',
      createdAt: text(item.createdAt, 40) || nowIso(), updatedAt: text(item.updatedAt, 40) || nowIso(),
    }]
  })
  const events: CalendarEvent[] = (Array.isArray(value.events) ? value.events : []).slice(0, MAX_EVENTS).flatMap((item) => {
    if (!isRecord(item)) return []
    const title = text(item.title, 180)
    if (!title) return []
    const createdBy = item.createdBy === 'character' || item.createdBy === 'model' ? item.createdBy : 'user'
    return [{
      id: text(item.id, 120) || id('evt'), title,
      description: text(item.description, 8_000), start: text(item.start, 80) || nowIso(),
      end: text(item.end, 80) || text(item.start, 80) || nowIso(), color: text(item.color, 40) || '#8b7dff',
      whenKind: item.whenKind === 'approximate' || item.whenKind === 'relative' || item.whenKind === 'unscheduled' ? item.whenKind : 'exact',
      whenText: text(item.whenText, 240) || text(item.start, 80) || 'Unscheduled',
      lane: text(item.lane, 80) || 'Main timeline', completed: item.kind === 'phone-handoff' ? true : bool(item.completed), createdBy,
      kind: item.kind === 'phone-handoff' ? 'phone-handoff' : 'event',
      actorContactIds: (Array.isArray(item.actorContactIds) ? item.actorContactIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 16),
      participantActorIds: (Array.isArray(item.participantActorIds) ? item.participantActorIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 16),
      participantNames: (Array.isArray(item.participantNames) ? item.participantNames : []).map((entry) => text(entry, 120)).filter(Boolean).slice(0, 16),
      continuityKey: text(item.continuityKey, 500) || undefined,
      source: isRecord(item.source) && item.source.app === 'messages' ? {
        app: 'messages' as const, conversationId: text(item.source.conversationId, 180), relayId: text(item.source.relayId, 180) || undefined, messageId: text(item.source.messageId, 180) || undefined, suggestionId: text(item.source.suggestionId, 180) || undefined,
      } : undefined,
      channelTransition: isRecord(item.channelTransition) && item.channelTransition.to === 'arriving' ? {
        from: item.channelTransition.from === 'arriving' || item.channelTransition.from === 'paused' ? item.channelTransition.from : 'remote',
        to: 'arriving' as const,
        reason: 'arriving' as const,
      } : isRecord(item.channelTransition) && item.channelTransition.to === 'local' ? {
        from: item.channelTransition.from === 'arriving' || item.channelTransition.from === 'paused' ? item.channelTransition.from : 'remote',
        to: 'local' as const,
        reason: item.channelTransition.reason === 'arrived' || item.channelTransition.reason === 'took_action' || item.channelTransition.reason === 'continued_in_person' ? item.channelTransition.reason : 'in_scene',
      } : undefined,
    }]
  })
  const trackers: PhoneTracker[] = (Array.isArray(value.trackers) ? value.trackers : [])
    .slice(0, MAX_TRACKERS)
    .map((item) => normalizeTracker(item, { roleplayNow: text(value.roleplayNow, 80), characterId, characterName }))
    .filter((item): item is PhoneTracker => Boolean(item))
  const notifications: PhoneNotification[] = (Array.isArray(value.notifications) ? value.notifications : []).slice(0, MAX_NOTIFICATIONS).flatMap((item) => {
    if (!isRecord(item)) return []
    const title = text(item.title, 160)
    if (!title) return []
    const app = text(item.app, 40) as PhoneNotification['app'] || 'home'
    return [{
      id: text(item.id, 120) || id('ntf'), app,
      title, body: text(item.body, 1_000), createdAt: text(item.createdAt, 40) || nowIso(),
      read: bool(item.read), route: normalizePocketRoute(item.route, legacyActionRoute(app, text(item.action, 120))),
      dismissedAt: text(item.dismissedAt, 40) || undefined,
      source: item.source === 'automatic' || item.source === 'system' ? item.source : 'model',
      deviceOwnerActorId: text(item.deviceOwnerActorId, 180) || undefined,
      severity: item.severity === 'important' || item.severity === 'error' ? item.severity : 'info',
      action: text(item.action, 120) || undefined,
    }]
  })
  const activities: PocketActivity[] = (Array.isArray(value.activities) ? value.activities : []).slice(-MAX_ACTIVITIES).flatMap((item) => {
    if (!isRecord(item)) return []
    const title = text(item.title, 160)
    if (!title) return []
    const source = isRecord(item.source) ? item.source : {}
    const presentation = isRecord(item.presentation) ? item.presentation : null
    const presentationKind = presentation && (presentation.kind === 'sent' || presentation.kind === 'received' || presentation.kind === 'observed' || presentation.kind === 'referenced' || presentation.kind === 'generic' || presentation.kind === 'batch') ? presentation.kind : undefined
    return [{
      id: text(item.id, 160) || id('act'),
      kind: item.kind === 'message' || item.kind === 'call' || item.kind === 'contact' || item.kind === 'tracker-change' || item.kind === 'timeline' || item.kind === 'note' || item.kind === 'image' || item.kind === 'weather' ? item.kind : 'system',
      title, summary: text(item.summary, 500) || undefined, route: normalizePocketRoute(item.route),
      presentation: presentationKind ? {
        kind: presentationKind,
        senderActorId: text(presentation?.senderActorId, 180) || undefined,
        recipientActorIds: (Array.isArray(presentation?.recipientActorIds) ? presentation.recipientActorIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 16),
        senderName: text(presentation?.senderName, 120) || undefined,
        recipientNames: (Array.isArray(presentation?.recipientNames) ? presentation.recipientNames : []).map((entry) => text(entry, 120)).filter(Boolean).slice(0, 16),
        conversationTitle: text(presentation?.conversationTitle, 120) || undefined,
        call: normalizeCallMarker(presentation?.call),
        format: voiceMessage(presentation?.format) ? 'voice' : undefined,
        storyAt: text(presentation?.storyAt, 80) || undefined,
        storyTimeLabel: text(presentation?.storyTimeLabel, 160) || undefined,
        storyTimezoneOffsetMinutes: typeof presentation?.storyTimezoneOffsetMinutes === 'number' && Number.isFinite(presentation.storyTimezoneOffsetMinutes) && Math.abs(presentation.storyTimezoneOffsetMinutes) <= 840 ? presentation.storyTimezoneOffsetMinutes : undefined,
        batchMessages: (Array.isArray(presentation?.batchMessages) ? presentation.batchMessages : []).slice(0, 24).flatMap((entry) => {
          if (!isRecord(entry)) return []
          const senderName = text(entry.senderName, 120)
          const messageText = text(entry.text, 12_000)
          if (!senderName || !messageText) return []
          return [{
            messageId: text(entry.messageId, 180),
            senderActorId: text(entry.senderActorId, 180) || undefined,
            senderName,
            text: messageText,
            format: voiceMessage(entry.format) ? 'voice' as const : undefined,
            direction: entry.direction === 'sent' || entry.direction === 'observed' ? entry.direction : 'received',
          }]
        }),
      } : undefined,
      createdAt: text(item.createdAt, 40) || nowIso(), scope: { chatId, characterId },
      source: {
        commandId: text(source.commandId, 240) || undefined, messageId: text(source.messageId, 180) || undefined,
        trackerId: text(source.trackerId, 180) || undefined, contactId: text(source.contactId, 180) || undefined,
        conversationId: text(source.conversationId, 180) || undefined,
        eventId: text(source.eventId, 180) || undefined, noteId: text(source.noteId, 180) || undefined,
        imageId: text(source.imageId, 180) || undefined,
        messageIds: (Array.isArray(source.messageIds) ? source.messageIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 24),
      },
    }]
  })
  const processedCommands = (Array.isArray(value.processedCommands) ? value.processedCommands : []).slice(-160).flatMap((item) => {
    if (!isRecord(item)) return []
    const commandId = text(item.id, 240)
    if (!commandId) return []
    return [{ id: commandId, semanticKey: text(item.semanticKey, 4_000), createdAt: text(item.createdAt, 40) || nowIso(), activityId: text(item.activityId, 180) || undefined }]
  })
  const weatherValue = isRecord(value.weather) ? value.weather : {}
  const weather: RoleplayWeather = {
    outlook: normalizeWeatherOutlook(weatherValue.outlook),
    location: text(weatherValue.location, 160) || fallback.weather.location,
    condition: text(weatherValue.condition, 120) || fallback.weather.condition,
    temperature: numberValue(weatherValue.temperature, fallback.weather.temperature),
    unit: weatherValue.unit === 'F' ? 'F' : 'C',
    high: numberValue(weatherValue.high, fallback.weather.high),
    low: numberValue(weatherValue.low, fallback.weather.low),
    details: text(weatherValue.details, 2_000) || fallback.weather.details,
    updatedAt: text(weatherValue.updatedAt, 40) || nowIso(),
  }
  if (weather.details === 'A quiet, clear day in the roleplay timeline.') weather.details = 'Quiet, clear conditions in the roleplay timeline.'
  const snapshotValue = isRecord(value.sceneSnapshot) ? value.sceneSnapshot : null
  const sceneSnapshot: SceneActorSnapshot | null = snapshotValue ? {
    actors: (Array.isArray(snapshotValue.actors) ? snapshotValue.actors : []).slice(0, 8).flatMap((entry) => {
      if (!isRecord(entry)) return []
      const contactId = text(entry.contactId, 180)
      if (!contactId) return []
      return [{ contactId, roleHint: text(entry.roleHint, 120), sceneBrief: text(entry.sceneBrief, 600) }]
    }),
    capturedAt: text(snapshotValue.capturedAt, 40) || nowIso(),
    sourceMessageId: text(snapshotValue.sourceMessageId, 180),
    sourceMessageIndex: Math.max(-1, Math.round(numberValue(snapshotValue.sourceMessageIndex, -1))),
    sourceRevision: Math.max(0, Math.round(numberValue(snapshotValue.sourceRevision, 0))),
    stale: bool(snapshotValue.stale, true),
  } : null
  const setupValue = isRecord(value.setup) ? value.setup : {}
  const relays: PocketRelay[] = (Array.isArray(value.relays) ? value.relays : []).slice(-24).flatMap((item) => {
    if (!isRecord(item)) return []
    const relayId = text(item.id, 180)
    const contactId = text(item.contactId, 180)
    const conversationId = text(item.conversationId, 180)
    const tail = isRecord(item.conversationTail) ? item.conversationTail : isRecord(item.conversationSnapshot) ? item.conversationSnapshot : {}
    const continuation = isRecord(item.continuation) ? item.continuation : {}
    if (!relayId || !contactId || !conversationId) return []
    const kind = item.kind === 'arrival' || item.reason === 'arriving' || item.actorState === 'arriving' ? 'arrival' as const : 'local' as const
    const reason = kind === 'arrival' ? 'arriving' as const : item.reason === 'arrived' || item.reason === 'took_action' || item.reason === 'continued_in_person' ? item.reason : 'in_scene' as const
    const continuationState = continuation.state === 'launching' || continuation.state === 'accepted' || continuation.state === 'started' || continuation.state === 'completed' || continuation.state === 'blocked' || continuation.state === 'failed' || continuation.state === 'stopped'
      ? continuation.state
      : continuation.state === 'requested' ? 'accepted' : 'idle'
    return [{
      id: relayId, chatId, characterId, contactId, conversationId, kind, reason, actorState: reason,
      burstId: text(item.burstId, 180) || undefined,
      conversationTail: {
        text: text(tail.text ?? tail.summary, 2_400),
        recentMessageIds: (Array.isArray(tail.recentMessageIds) ? tail.recentMessageIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(-8),
        updatedAt: text(tail.updatedAt, 40) || nowIso(),
      },
      latestExchange: text(item.latestExchange, 1_800), sourceMessageId: text(item.sourceMessageId, 180) || undefined,
      timelineEventId: text(item.timelineEventId, 180), createdAt: text(item.createdAt, 40) || nowIso(),
      status: item.status === 'consumed' || item.status === 'dismissed' ? item.status : 'pending',
      consumedAt: text(item.consumedAt, 40) || undefined, consumedMessageId: text(item.consumedMessageId, 180) || undefined,
      injectedAt: text(item.injectedAt, 40) || undefined,
      injectedGenerationId: text(item.injectedGenerationId, 180) || undefined,
      serializedRelayChars: Math.max(0, Math.round(numberValue(item.serializedRelayChars, 0))) || undefined,
      serializedRelay: text(item.serializedRelay, 3_600) || undefined,
      relayExchangeMessageCount: Math.max(0, Math.round(numberValue(item.relayExchangeMessageCount, 0))) || undefined,
      injectionError: text(item.injectionError, 500) || undefined,
      continuation: {
        state: continuationState,
        generationId: text(continuation.generationId, 180) || undefined,
        invokedAt: text(continuation.invokedAt ?? continuation.attemptedAt, 40) || undefined,
        permissionCheckedAt: text(continuation.permissionCheckedAt, 40) || undefined,
        permissions: isRecord(continuation.permissions) ? {
          chatMutation: continuation.permissions.chatMutation === true,
          generation: continuation.permissions.generation === true,
        } : undefined,
        method: continuation.method === 'spindle.chat.appendMessage(triggerGeneration)' ? continuation.method : undefined,
        hostCallReturnedAt: text(continuation.hostCallReturnedAt, 40) || undefined,
        hostAcceptedAt: text(continuation.hostAcceptedAt, 40) || undefined,
        generationStartedAt: text(continuation.generationStartedAt, 40) || undefined,
        generationCompletedAt: text(continuation.generationCompletedAt, 40) || undefined,
        sourceMessageId: text(continuation.sourceMessageId, 180) || undefined,
        error: text(continuation.error, 500) || undefined,
      },
    }]
  })
  const references: PocketContextReference[] = (Array.isArray(value.references) ? value.references : []).slice(-24).flatMap((item) => {
    if (!isRecord(item)) return []
    const referenceId = text(item.id, 180)
    const conversationId = text(item.conversationId, 180)
    if (!referenceId || !conversationId) return []
    const scope: PocketReferenceScope = item.scope === 'recent_messages' || item.scope === 'selected_messages' ? item.scope : 'conversation'
    const status = item.status === 'injected' || item.status === 'consumed' || item.status === 'cancelled' || item.status === 'failed' ? item.status : 'armed'
    const participants = (Array.isArray(item.participants) ? item.participants : []).slice(0, 16).flatMap((participant) => {
      if (!isRecord(participant)) return []
      const contactId = text(participant.contactId, 180) || undefined
      const actorId = text(participant.actorId, 180) || contactId
      const name = text(participant.name, 120)
      if (!actorId || !name) return []
      return [{ actorId, contactId, name, role: text(participant.role, 100), identityBrief: text(participant.identityBrief, 180) }]
    })
    const messages = (Array.isArray(item.messages) ? item.messages : []).slice(-8).flatMap((message) => {
      if (!isRecord(message)) return []
      const messageId = text(message.messageId, 180)
      const body = text(message.text, 420)
      if (!messageId || !body) return []
      return [{
        messageId,
        sender: message.sender === 'contact' ? 'contact' as const : 'persona' as const,
        senderActorId: text(message.senderActorId, 180) || text(message.senderContactId, 180) || undefined,
        senderContactId: text(message.senderContactId, 180) || undefined,
        senderName: text(message.senderName, 120) || (message.sender === 'contact' ? 'Participant' : 'Persona'),
        text: body,
        createdAt: text(message.createdAt, 40) || nowIso(),
      }]
    })
    return [{
      id: referenceId,
      chatId,
      characterId,
      sourceApp: 'messages' as const,
      conversationId,
      conversationTitle: text(item.conversationTitle, 120) || 'Pocket conversation',
      conversationKind: item.conversationKind === 'group' ? 'group' as const : 'direct' as const,
      scope,
      visibility: 'context' as const,
      participants,
      snapshot: text(item.snapshot, 600),
      messages,
      createdAt: text(item.createdAt, 40) || nowIso(),
      status,
      injectedAt: text(item.injectedAt, 40) || undefined,
      injectedGenerationId: text(item.injectedGenerationId, 180) || undefined,
      boundUserMessageId: text(item.boundUserMessageId, 180) || undefined,
      serializedReferenceChars: Math.max(0, Math.round(numberValue(item.serializedReferenceChars, 0))) || undefined,
      serializedReference: text(item.serializedReference, 3_000) || undefined,
      consumedAt: text(item.consumedAt, 40) || undefined,
      consumedMessageId: text(item.consumedMessageId, 180) || undefined,
      error: text(item.error, 500) || undefined,
    }]
  })
  const groupBatches: PendingGroupBatch[] = (Array.isArray(value.groupBatches) ? value.groupBatches : []).slice(-24).flatMap((item) => {
    if (!isRecord(item)) return []
    const batchId = text(item.id, 180)
    const requestId = text(item.requestId, 180)
    const conversationId = text(item.conversationId, 180)
    if (!batchId || !requestId || !conversationId) return []
    const status = item.status === 'queued' || item.status === 'delivering' || item.status === 'completed' || item.status === 'cancelled' || item.status === 'failed'
      ? item.status : 'cancelled'
    const messages = (Array.isArray(item.messages) ? item.messages : []).slice(0, 4).flatMap((message) => {
      if (!isRecord(message)) return []
      const id = text(message.id, 180)
      const speakerId = text(message.speakerId, 180)
      const body = text(message.text, 8_000)
      if (!id || !speakerId || !body) return []
      const messageState: 'queued' | 'delivered' | 'cancelled' = message.state === 'delivered' || message.state === 'cancelled' ? message.state : 'queued'
      return [{
        id, speakerId, text: body, format: voiceMessage(message.format) ? 'voice' as const : undefined,
        eventSuggestion: normalizeEventSuggestion(message.eventSuggestion, (prefix) => `${prefix}_${id}`),
        state: messageState,
        deliveredMessageId: text(message.deliveredMessageId, 180) || undefined,
        deliveredAt: text(message.deliveredAt, 40) || undefined,
      }]
    })
    return [{
      id: batchId, requestId, conversationId,
      sourceBurstId: text(item.sourceBurstId, 180) || undefined,
      eligibleActorIds: (Array.isArray(item.eligibleActorIds) ? item.eligibleActorIds : Array.isArray(item.eligibleContactIds) ? item.eligibleContactIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 16),
      eligibleContactIds: (Array.isArray(item.eligibleContactIds) ? item.eligibleContactIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 16),
      messages, status, createdAt: text(item.createdAt, 40) || nowIso(), updatedAt: text(item.updatedAt, 40) || nowIso(),
      error: text(item.error, 500) || undefined,
    }]
  })
  const reconciliationValue = isRecord(value.lastReconciliation) ? value.lastReconciliation : {}
  const reconciliationDomains = (Array.isArray(reconciliationValue.domains) ? reconciliationValue.domains : [])
    .map((entry) => text(entry, 40))
    .filter((entry) => entry === 'continuity' || entry === 'clock' || entry === 'weather' || entry === 'presence' || entry === 'timeline' || entry === 'trackers')
    .slice(0, 6) as NonNullable<PhoneState['lastReconciliation']>['domains']
  const hostSwipeSelections = (Array.isArray(value.hostSwipeSelections) ? value.hostSwipeSelections : []).slice(-320).flatMap((item) => {
    if (!isRecord(item)) return []
    const hostMessageId = text(item.hostMessageId, 180)
    const swipeValue = item.swipeId
    const swipeId = Number(swipeValue)
    if (!hostMessageId || swipeValue === null || swipeValue === undefined || !Number.isInteger(swipeId) || swipeId < 0) return []
    return [{ hostMessageId, swipeId, updatedAt: text(item.updatedAt, 40) || nowIso() }]
  })
  const normalizeClockSource = (raw: unknown): PocketRoleplayClockSnapshot['source'] => raw === 'manual' || raw === 'narrative' ? raw : 'legacy'
  const normalizeClockPrecision = (raw: unknown): PocketRoleplayClockSnapshot['precision'] => raw === 'exact' || raw === 'approximate' || raw === 'relative' ? raw : 'unknown'
  const hostClockBaselines: PocketHostClockBaseline[] = (Array.isArray(value.hostClockBaselines) ? value.hostClockBaselines : []).slice(-320).flatMap((item) => {
    if (!isRecord(item)) return []
    const hostMessageId = text(item.hostMessageId, 180)
    const roleplayNow = text(item.roleplayNow, 80)
    if (!hostMessageId || !roleplayNow) return []
    return [{
      hostMessageId, roleplayNow, source: normalizeClockSource(item.source), precision: normalizeClockPrecision(item.precision),
      label: text(item.label, 160), updatedAt: text(item.updatedAt, 40) || nowIso(),
    }]
  })
  const candidateClocks: PocketCandidateClockSnapshot[] = (Array.isArray(value.candidateClocks) ? value.candidateClocks : []).slice(-640).flatMap((item) => {
    if (!isRecord(item)) return []
    const hostMessageId = text(item.hostMessageId, 180)
    const swipeValue = item.swipeId
    const swipeId = Number(swipeValue)
    const roleplayNow = text(item.roleplayNow, 80)
    if (!hostMessageId || !roleplayNow || swipeValue === null || swipeValue === undefined || !Number.isInteger(swipeId) || swipeId < 0) return []
    return [{
      hostMessageId, swipeId, generationId: text(item.generationId, 180) || undefined, roleplayNow,
      source: normalizeClockSource(item.source), precision: normalizeClockPrecision(item.precision), label: text(item.label, 160),
      updatedAt: text(item.updatedAt, 40) || nowIso(),
    }]
  })
  const lastReconciliation: PhoneState['lastReconciliation'] = text(reconciliationValue.sourceKey, 1_600)
    ? {
        revision: Math.max(0, Math.round(numberValue(reconciliationValue.revision, 0))),
        sourceKey: text(reconciliationValue.sourceKey, 1_600),
        sourceMessageIds: (Array.isArray(reconciliationValue.sourceMessageIds) ? reconciliationValue.sourceMessageIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(-8),
        generationId: text(reconciliationValue.generationId, 180) || undefined,
        messageId: text(reconciliationValue.messageId, 180) || undefined,
        updatedAt: text(reconciliationValue.updatedAt, 40) || nowIso(),
        domains: reconciliationDomains,
      }
    : undefined
  const hadPocketData = Number(value.version || 0) > 0 && (collections.contacts.length > 1 || collections.conversations.some((entry) => entry.messages.length > 0) || notes.length > 0 || events.length > 0 || trackers.length > 0 || relays.length > 0 || references.length > 0 || groupBatches.length > 0)
  return {
    version: STATE_VERSION,
    chatId,
    characterId,
    characterName: characterName || text(value.characterName, 120) || fallback.characterName,
    roleplayNow: text(value.roleplayNow, 80) || fallback.roleplayNow,
    roleplayClockSource: value.roleplayClockSource === 'manual' || value.roleplayClockSource === 'narrative' ? value.roleplayClockSource : 'legacy',
    roleplayClockPrecision: value.roleplayClockPrecision === 'exact' || value.roleplayClockPrecision === 'approximate' || value.roleplayClockPrecision === 'relative' ? value.roleplayClockPrecision : 'unknown',
    roleplayClockLabel: value.roleplayClockPrecision === 'exact' || value.roleplayClockSource === 'manual' ? text(value.roleplayClockLabel, 160) : clockLabel(value.roleplayClockLabel),
    roleplayTimezoneOffsetMinutes: Number.isFinite(Number(value.roleplayTimezoneOffsetMinutes)) ? Number(value.roleplayTimezoneOffsetMinutes) : undefined,
    stateRevision: Math.max(0, Math.round(numberValue(value.stateRevision, 0))),
    hostSwipeSelections,
    hostClockBaselines,
    candidateClocks,
    lastReconciliation,
    sceneSnapshot,
    pocketPersona: normalizePocketPersona(value.pocketPersona, fallback.pocketPersona),
    pocketPersonaActorId: personaActorId,
    suppressedContactSourceKeys,
    setup: {
      initialized: bool(setupValue.initialized, hadPocketData),
      authorship: setupValue.authorship === 'impersonation' ? 'impersonation' : 'roleplay',
      dismissed: bool(setupValue.dismissed),
      personaConfigured: bool(setupValue.personaConfigured, bool(setupValue.initialized, hadPocketData)),
      worldStatus: setupValue.worldStatus === 'seeded' || setupValue.worldStatus === 'skipped'
        ? setupValue.worldStatus
        : bool(setupValue.initialized, hadPocketData) ? 'skipped' : 'unconfigured',
      worldSeededAt: text(setupValue.worldSeededAt, 80) || undefined,
    },
    contacts: collections.contacts,
    contactGroups: normalizeContactGroups(value.contactGroups, collections.contacts.map(entry => entry.id), nowIso()),
    discoveredActors,
    conversations: collections.conversations,
    actorMemoryVersion: Math.max(0, Math.round(numberValue(value.actorMemoryVersion, 0))),
    actorMemories,
    notes, events, relays, references, groupBatches, weather, trackers, notifications, activities, processedCommands,
    updatedAt: text(value.updatedAt, 40) || fallback.updatedAt,
  }
}

async function characterPresentationFor(characterId: string, userId?: string): Promise<{ name: string; avatarUrl: string; accent: string }> {
  if (!characterId || !spindle.permissions.has('characters')) return { name: 'Character', avatarUrl: '', accent: '' }
  try {
    const character: any = await (spindle.characters.get as any)(characterId, userId)
    let avatarUrl = text(character?.avatar_url ?? character?.avatarUrl, 2_000)
    const imageId = text(character?.image_id ?? character?.imageId, 180)
    if (!avatarUrl && imageId && spindle.permissions.has('images')) {
      const image: any = await spindle.images.get(imageId, { specificity: 'sm', userId }).catch(() => null)
      avatarUrl = text(image?.url, 2_000)
    }
    const accentCandidate = text(character?.color ?? character?.accent ?? character?.metadata?.color ?? character?.metadata?.accent, 20)
    return {
      name: text(character?.name, 120) || 'Character',
      avatarUrl,
      accent: /^#[0-9a-f]{6}$/i.test(accentCandidate) ? accentCandidate : '',
    }
  } catch {
    return { name: 'Character', avatarUrl: '', accent: '' }
  }
}
async function characterNameFor(characterId: string, userId?: string): Promise<string> {
  return (await characterPresentationFor(characterId, userId)).name
}

/** Interceptor DTOs in some Lumiverse builds omit characterId; chat ownership is authoritative for Pocket state scope. */
async function stateCharacterIdForChat(chatId: string, hintedCharacterId: unknown, userId?: string): Promise<string> {
  if (chatId && chatId !== '_lobby' && spindle.permissions.has('chats')) {
    try {
      const chat: any = await spindle.chats.get(chatId, userId)
      const characterId = text(chat?.character_id, 180)
      if (characterId) return characterId
    } catch { /* use the host hint when chat lookup is unavailable */ }
  }
  return text(hintedCharacterId, 180) || '_none'
}

async function resolveActivePocketPersona(userId?: string): Promise<ChatPocketPersona | null> {
  if (!spindle.permissions.has('personas')) return null
  try {
    const persona: any = await spindle.personas.getActive(userId)
    if (!persona) return null
    let avatarUrl = ''
    if (persona.image_id && spindle.permissions.has('images')) {
      const image: any = await spindle.images.get(String(persona.image_id), { specificity: 'sm', userId }).catch(() => null)
      avatarUrl = text(image?.url, 2_000)
    }
    const metadata = isRecord(persona.metadata) ? persona.metadata : {}
    return {
      source: 'lumiverse', linkedPersonaId: text(persona.id, 180), displayName: text(persona.name, 120) || 'You',
      pronouns: text(metadata.pronouns, 120), role: text(persona.title, 120) || text(metadata.role, 120) || 'Persona',
      identityBrief: text(persona.description, 1_200), avatarUrl, accent: /^#[0-9a-f]{6}$/i.test(text(metadata.color ?? metadata.accent, 20)) ? text(metadata.color ?? metadata.accent, 20) : '#8b7dff',
      canAppear: bool(metadata.canAppear), updatedAt: nowIso(),
    }
  } catch {
    return null
  }
}

function pocketPersonaCollidesWithActor(state: PhoneState, persona: ChatPocketPersona): boolean {
  const candidate = normalizeActorName(persona.displayName)
  if (!candidate) return false
  if (normalizeActorName(state.characterName) === candidate) return true
  if (state.contacts.some((entry) => normalizeActorName(entry.name) === candidate)) return true
  if (state.discoveredActors.some((entry) => normalizeActorName(entry.displayName) === candidate)) return true
  return false
}
async function resolveGenerationPocketPersona(state: PhoneState, userId?: string): Promise<ChatPocketPersona> {
  const configured = state.pocketPersona
  if (configured.source === 'lumiverse') return configured
  if (!pocketPersonaCollidesWithActor(state, configured) || !spindle.permissions.has('personas')) return configured

  const hostPersona = await resolveActivePocketPersona(userId)
  if (!hostPersona || pocketPersonaCollidesWithActor(state, hostPersona)) return configured

  spindle.log.warn(`Pocket Persona "${configured.displayName}" collides with a roleplay actor; using active Lumiverse Persona "${hostPersona.displayName}" for this phone generation.`)
  return hostPersona
}
function directGenerationHistory(conversation: PocketConversation, actorId: string, contactId: string, personaName: string, contactName: string): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (const message of conversation.messages.slice(-20)) {
    const body = text(message.text, 8_000)
    if (!body) continue

    if (message.sender === 'persona') {
      history.push({ role: 'user', content: `[DM TURN: ${personaName} → ${contactName}]\n${body}` })
      continue
    }

    const senderId = message.senderActorId || message.senderContactId || ''
    if (senderId && senderId !== actorId && senderId !== contactId) continue
    history.push({ role: 'assistant', content: `[DM TURN: ${contactName} → ${personaName}]\n${body}` })
  }

  return history
}
function personaMemoryActorId(state: PhoneState): string {
  return pocketPersonaActorId(state)
}

function conversationMemoryAudience(
  state: PhoneState,
  conversation: PocketConversation,
): { ids: string[]; names: string[] } {
  const personaIds = conversation.includesPocketPersona ? [personaMemoryActorId(state)] : []
  const personaNames = conversation.includesPocketPersona ? [state.pocketPersona.displayName] : []
  const ids = [...personaIds, ...conversationActorIds(conversation)]
    .filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index)
  const names = [
    ...personaNames,
    ...conversationActorIds(conversation).map((actorId) => resolvePocketActor(state, actorId)?.name || ''),
  ].map((entry) => text(entry, 120)).filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index)
  return { ids, names }
}

function rememberPhoneMessage(
  state: PhoneState,
  conversation: PocketConversation,
  message: PhoneMessage,
): void {
  if (message.sender === 'system') return
  const speakerActorId = message.sender === 'persona'
    ? personaMemoryActorId(state)
    : text(message.senderActorId || message.senderContactId, 180)
  if (!speakerActorId) return
  const audience = conversationMemoryAudience(state, conversation)
  state.actorMemories = upsertActorMemory(state.actorMemories, {
    id: `memory:${message.id}`,
    conversationId: conversation.id,
    conversationTitle: conversation.title,
    conversationKind: conversation.kind,
    messageId: message.id,
    speakerActorId,
    speakerName: message.sender === 'persona'
      ? (state.pocketPersona.displayName || message.senderName || 'You')
      : message.senderName,
    text: message.text,
    knownByActorIds: audience.ids,
    knownByNames: audience.names,
    createdAt: message.createdAt,
  })
}

function backfillDirectPhoneMemories(state: PhoneState): void {
  for (const conversation of state.conversations) {
    if (conversation.kind !== 'direct') continue
    for (const message of conversation.messages) rememberPhoneMessage(state, conversation, message)
  }
}

async function loadState(chatId: string, characterId: string, userId?: string): Promise<PhoneState> {
  const characterPresentation = await characterPresentationFor(characterId, userId)
  const characterName = characterPresentation.name
  const raw = await spindle.userStorage.getJson<unknown>(statePath(chatId, characterId), {
    fallback: null,
    userId,
  })
  if (isRecord(raw) && Number(raw.version) > STATE_VERSION) throw new Error('This phone state was created by a newer Pocket version.')
  const state = normalizeState(raw, chatId, characterId, characterName)
  await loadPreferences(userId, isRecord(raw) ? raw.settings : undefined)
  let stateChanged = Boolean(isRecord(raw) && Number(raw.version || 0) <= STATE_VERSION && (raw.settings !== undefined || Number(raw.version || 0) < STATE_VERSION))
  if (state.actorMemoryVersion < 1) {
    backfillDirectPhoneMemories(state)
    state.actorMemoryVersion = 1
    stateChanged = true
  }
  state.trackers = state.trackers.map((tracker) => {
    const trackerRoleplayNow = state.roleplayClockSource === 'narrative' && state.roleplayClockPrecision !== 'exact' ? '' : state.roleplayNow
    const result = materializeTracker(tracker, trackerRoleplayNow)
    stateChanged ||= result.changed
    return result.tracker
  })
  const contact = state.contacts.find((item) => item.source.kind === 'character' && item.source.characterId === characterId)
  if (contact) {
    if (characterName !== 'Character' && contact.name !== characterName) {
      contact.name = characterName
      stateChanged = true
    }
    if (characterPresentation.avatarUrl && contact.sourceAvatarUrl !== characterPresentation.avatarUrl) {
      contact.sourceAvatarUrl = characterPresentation.avatarUrl
      stateChanged = true
    }
    if (characterPresentation.accent && contact.sourceAccent !== characterPresentation.accent) {
      contact.sourceAccent = characterPresentation.accent
      stateChanged = true
    }
  }
  state.characterName = characterName
  if (state.pocketPersona.source === 'lumiverse') {
    const hostPersona = await resolveActivePocketPersona(userId)
    if (hostPersona) {
      const preservedPhoneProfile = state.pocketPersona.phoneProfile
      const mergedHostPersona: ChatPocketPersona = { ...hostPersona, phoneProfile: preservedPhoneProfile }
      const changed = JSON.stringify({ ...state.pocketPersona, updatedAt: '' }) !== JSON.stringify({ ...mergedHostPersona, updatedAt: '' })
      state.pocketPersona = changed ? mergedHostPersona : state.pocketPersona
      stateChanged ||= changed
    }
  }
  if (raw === null) {
    const profiles = normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId })).entries
    const personaProfile = profiles.find(entry => entry.kind === 'persona' && entry.sourceId && entry.sourceId === state.pocketPersona.linkedPersonaId)
    if (personaProfile) { state.pocketPersona = { ...applyIdentityProfile(state.pocketPersona, personaProfile), source: 'manual' }; state.setup.personaConfigured = true; stateChanged = true }
    for (const contact of state.contacts) {
      const source = contact.source
      const profile = source.kind === 'character' ? profiles.find(entry => entry.kind === 'character' && entry.sourceId === source.characterId) : undefined
      if (profile) { Object.assign(contact, applyIdentityProfile(contact, profile)); stateChanged = true }
    }
  }
  if (stateChanged) await spindle.userStorage.setJson(statePath(chatId, characterId), state, { indent: 2, userId })
  return state
}

async function loadPreferences(userId?: string, legacy?: unknown): Promise<DevicePreferences> {
  const raw = await spindle.userStorage.getJson<unknown>(PREFERENCES_PATH, { fallback: null, userId })
  const preferences = normalizePreferences(raw ?? legacy)
  if (isFuturePreferences(raw)) {
    spindle.log.warn('Pocket left newer device preferences untouched and used safe defaults for this session.')
    return preferences
  }
  if (raw === null || Number((isRecord(raw) ? raw.version : 0)) !== preferences.version) {
    await spindle.userStorage.setJson(PREFERENCES_PATH, preferences, { indent: 2, userId })
  }
  return preferences
}

async function savePreferences(value: unknown, userId?: string): Promise<DevicePreferences> {
  const preferences = normalizePreferences(value)
  await spindle.userStorage.setJson(PREFERENCES_PATH, preferences, { indent: 2, userId })
  return preferences
}

const JEV_CREDENTIALS_PATH = 'private/typesafe-jev.json'
async function getJevApiKey(userId?: string): Promise<string> {
  const credentials = await spindle.userStorage.getJson<unknown>(JEV_CREDENTIALS_PATH, { fallback: null, userId })
  return isRecord(credentials) ? text(credentials.apiKey, 500) : ''
}

async function evaluateJevTrackers(chatId: string, characterId: string, userId?: string, trackerId = '', force = false): Promise<void> {
  const judgePreferences = await loadPreferences(userId)
  const settings = normalizeJevSettings(judgePreferences.jev)
  if (!settings.enabled) { if (force) throw new Error('Enable the tracker judge in Settings first.'); return }
  if (!spindle.permissions.has('chats')) throw new Error('Tracker judging needs chat access.')
  if (!spindle.permissions.has(settings.provider === 'typesafe' ? 'cors_proxy' : 'generation')) throw new Error('The selected judge provider is missing its request permission.')
  const apiKey = settings.provider === 'typesafe' ? await getJevApiKey(userId) : ''
  if (settings.provider === 'typesafe' && !apiKey) { if (force) throw new Error('Save your TypeSafe API key in Tracker judge settings first.'); return }
  const connectionSignature = async (preferences: DevicePreferences) => {
    const info = await inspectPocketGeneration({ spindle, loadPreferences, savePreferences, send }, preferences, userId)
    return JSON.stringify([preferences.generationMode, preferences.sidecarConnectionId, preferences.sidecarModelOverride, info.effective?.id, info.effective?.provider, info.effective?.model])
  }
  const generationSignature = settings.provider === 'llm' ? await connectionSignature(judgePreferences) : ''
  const flightKey = `${viewKey(userId)}:${stateKey(chatId, characterId)}:jev`
  if (jevFlights.has(flightKey)) { if (force) throw new Error('The tracker judge is already evaluating this chat.'); return }
  jevFlights.add(flightKey)
  try {
    const messages = await spindle.chat.getMessages(chatId)
    const narrative = (messages as any[]).filter(entry => ['user', 'assistant'].includes(entry?.role) && sanitizeNarrativeContent(entry.content, 1)).slice(-6)
      .map(entry => ({ id: entry.id, role: entry.role, content: sanitizeNarrativeContent(entry.content, 1_500) }))
    if (!narrative.length) throw new Error('The tracker judge needs a story message to evaluate.')
    const state = await loadState(chatId, characterId, userId)
    const selected = state.trackers.filter(entry => entry.updateMode === 'jev' && (!trackerId || entry.id === trackerId))
    if (!selected.length) { if (force) throw new Error('Choose a tracker with Tracker judge updates.'); return }
    const eligible = selected.map(tracker => {
      const sourceKey = jevSourceKey({ narrative, target: tracker.target, config: tracker.jev, kind: tracker.kind, states: tracker.kind === 'state' ? tracker.states : [], provider: settings.provider, model: settings.model, generationSignature: settings.provider === 'llm' ? generationSignature : undefined })
      return { tracker, sourceKey, baseline: JSON.stringify(tracker) }
    }).filter(entry => force || entry.tracker.jevResult?.sourceKey !== entry.sourceKey)
    if (!eligible.length) return
    send({ type: 'lumiphone:jev_status', chatId, characterId, status: 'working', message: `Reading the story with ${settings.provider === 'typesafe' ? 'TypeSafe Jev' : 'the LLM judge'}…` }, userId)
    // Bound batches for LLM response size. Each question carries its own target.
    const batchSize = settings.provider === 'llm' ? 8 : 24
    for (let offset = 0; offset < eligible.length; offset += batchSize) {
      const batch = eligible.slice(offset, offset + batchSize)
      const context = JSON.stringify({ story: narrative, subjects: batch.map((entry, index) => ({ id: `subject${index + 1}`, tracker: entry.tracker.label, target: entry.tracker.target, current: entry.tracker.kind === 'state' ? entry.tracker.state : entry.tracker.value })) })
      const questions = batch.map((entry, index) => ({ ...jevQuestion(entry.tracker), question: `For subject${index + 1}: ${entry.tracker.jev!.question}` }))
      const answers = settings.provider === 'typesafe'
        ? await runTypeSafeJev((url, options) => spindle.cors(url, options), apiKey, settings.model, context, questions)
        : readJevAnswers(await runStructuredGeneration('tracker-judge', id('tracker_judge'), jevLlmRequest(context, questions), userId), questions)
      const currentMessages = await spindle.chat.getMessages(chatId)
      const currentNarrative = (currentMessages as any[]).filter(entry => ['user', 'assistant'].includes(entry?.role) && sanitizeNarrativeContent(entry.content, 1)).slice(-6).map(entry => ({ id: entry.id, role: entry.role, content: sanitizeNarrativeContent(entry.content, 1_500) }))
      if (JSON.stringify(currentNarrative) !== JSON.stringify(narrative)) throw new Error('The story changed while the judge was evaluating. Evaluate again.')
      await withStateLock(stateKey(chatId, characterId), async () => {
        const currentPreferences = await loadPreferences(userId)
        const currentSettings = normalizeJevSettings(currentPreferences.jev)
        if (settings.provider === 'llm' && await connectionSignature(currentPreferences) !== generationSignature) return
        if (!currentSettings.enabled || currentSettings.provider !== settings.provider || currentSettings.model !== settings.model) return
        if (settings.provider === 'typesafe' && await getJevApiKey(userId) !== apiKey) return
        const latest = await loadState(chatId, characterId, userId)
        let changed = false
        batch.forEach((entry, index) => {
          const at = latest.trackers.findIndex(tracker => tracker.id === entry.tracker.id)
          if (at < 0 || JSON.stringify(latest.trackers[at]) !== entry.baseline) return
          if ((answers[index] as any)?.id !== `q${index + 1}`) return
          latest.trackers[at] = applyJevAnswer(latest.trackers[at], answers[index], entry.sourceKey, nowIso(), latest.roleplayNow, settings.provider)
          changed = true
        })
        if (changed) { await saveState(latest, userId); await sendState(latest, userId, 'jev') }
      })
    }
    send({ type: 'lumiphone:jev_status', chatId, characterId, status: 'complete', message: 'Tracker evaluation complete. Results are in each tracker.' }, userId)
  } catch (error) {
    send({ type: 'lumiphone:jev_status', chatId, characterId, status: 'error', message: error instanceof Error ? error.message : 'Tracker judge evaluation failed.' }, userId)
    throw error
  } finally { jevFlights.delete(flightKey) }
}

async function loadNpcBank(userId?: string): Promise<PocketNpcBank> {
  const raw = await spindle.userStorage.getJson<unknown>(NPC_BANK_PATH, { fallback: null, userId })
  const bank = normalizeNpcBank(raw, nowIso())
  if (isFutureNpcBank(raw)) {
    spindle.log.warn('Pocket left a newer NPC Bank untouched and used an empty bank for this session.')
    return bank
  }
  if (raw === null || Number(isRecord(raw) ? raw.version : 0) !== bank.version) {
    await spindle.userStorage.setJson(NPC_BANK_PATH, bank, { indent: 2, userId })
  }
  return bank
}
async function saveNpcBank(value: unknown, userId?: string): Promise<PocketNpcBank> {
  const stored = await spindle.userStorage.getJson<unknown>(NPC_BANK_PATH, { fallback: null, userId })
  if (isFutureNpcBank(stored)) throw new Error('This NPC Bank was created by a newer Pocket version. Update Pocket before editing it.')
  const bank = normalizeNpcBank(value, nowIso())
  await spindle.userStorage.setJson(NPC_BANK_PATH, bank, { indent: 2, userId })
  return bank
}

async function saveState(state: PhoneState, userId?: string): Promise<void> {
  state.updatedAt = nowIso()
  await spindle.userStorage.setJson(statePath(state.chatId, state.characterId), state, { indent: 2, userId })
}

function withStateLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = stateLocks.get(key) || Promise.resolve()
  const current = previous.catch(() => undefined).then(task)
  stateLocks.set(key, current)
  const release = () => {
    if (stateLocks.get(key) === current) stateLocks.delete(key)
  }
  void current.then(release, release)
  return current
}

function capabilities(): PhoneCapabilities {
  return {
    generation: spindle.permissions.has('generation'), interceptor: spindle.permissions.has('interceptor'),
    tools: spindle.permissions.has('tools'), chats: spindle.permissions.has('chats'),
    characters: spindle.permissions.has('characters'), personas: spindle.permissions.has('personas'),
    images: spindle.permissions.has('images'), corsProxy: spindle.permissions.has('cors_proxy'), imageGen: spindle.permissions.has('image_gen'),
    panels: spindle.permissions.has('ui_panels'), push: spindle.permissions.has('push_notification'),
    sceneSync: spindle.permissions.has('chat_mutation'),
  }
}

function send(payload: unknown, userId?: string): void {
  spindle.sendToFrontend(payload, userId)
}

async function resolveWallpaperUrls(preferences: DevicePreferences, personaId: string, userId?: string): Promise<PocketResolvedWallpapers> {
  const persona = personaId ? preferences.personaAppearance[personaId] : null
  const [deviceHome, deviceChat, personaHome, personaChat] = await Promise.all([
    resolvePocketImageSource(spindle, preferences.homeWallpaper.source, userId),
    resolvePocketImageSource(spindle, preferences.chatWallpaper.source, userId),
    resolvePocketImageSource(spindle, persona?.enabled ? persona.homeWallpaper.source : null, userId),
    resolvePocketImageSource(spindle, persona?.enabled ? persona.chatWallpaper.source : null, userId),
  ])
  return { deviceHome, deviceChat, personaHome, personaChat }
}

function assignWallpaper(preferences: DevicePreferences, payload: AnyRecord, forcedSource?: unknown): void {
  const target = text(payload.target, 40)
  const personaId = text(payload.personaId, 180)
  const current = target === 'persona-home' || target === 'persona-chat'
    ? preferences.personaAppearance[personaId]?.[target === 'persona-chat' ? 'chatWallpaper' : 'homeWallpaper']
    : preferences[target === 'device-chat' || target === 'chat' ? 'chatWallpaper' : 'homeWallpaper']
  if ((target === 'persona-home' || target === 'persona-chat') && (!personaId || !preferences.personaAppearance[personaId])) throw new Error('Enable a Persona appearance before assigning its wallpaper.')
  const raw = isRecord(payload.wallpaper) ? payload.wallpaper : {}
  const wallpaper = normalizeWallpaper({ ...current, ...raw, source: forcedSource === undefined ? raw.source ?? payload.source : forcedSource })
  if (target === 'persona-home' || target === 'persona-chat') {
    preferences.personaAppearance[personaId][target === 'persona-chat' ? 'chatWallpaper' : 'homeWallpaper'] = wallpaper
  } else preferences[target === 'device-chat' || target === 'chat' ? 'chatWallpaper' : 'homeWallpaper'] = wallpaper
}

function imageSourceKey(source: DevicePreferences['homeWallpaper']['source']): string {
  if (!source) return ''
  return source.kind === 'builtin' ? `builtin:${source.wallpaperId}` : source.kind === 'gallery' ? `gallery:${source.imageId}` : source.kind === 'asset' ? `asset:${source.assetId}` : `url:${source.url}`
}

function candidateRuntimeKey(userId: string | undefined, generationId: string): string {
  return `${viewKey(userId)}:${generationId}`
}

function candidateOrigin(value: unknown, expectedChatId = ''): PocketTurnCandidateOrigin | undefined {
  if (!isRecord(value)) return undefined
  const chatId = text(value.chatId, 180)
  const hostMessageId = text(value.hostMessageId, 180)
  const swipeId = Number(value.swipeId)
  if (!chatId || !hostMessageId || !Number.isInteger(swipeId) || swipeId < 0) return undefined
  if (expectedChatId && chatId !== expectedChatId) return undefined
  return { chatId, hostMessageId, swipeId, generationId: text(value.generationId, 180) || undefined }
}

function setHostSwipeSelection(state: PhoneState, hostMessageId: string, swipeId: number): boolean {
  if (!hostMessageId || !Number.isInteger(swipeId) || swipeId < 0) return false
  state.hostSwipeSelections ||= []
  const existing = state.hostSwipeSelections.find((entry) => entry.hostMessageId === hostMessageId)
  if (existing?.swipeId === swipeId) return false
  if (existing) {
    existing.swipeId = swipeId
    existing.updatedAt = nowIso()
  } else {
    state.hostSwipeSelections.push({ hostMessageId, swipeId, updatedAt: nowIso() })
    state.hostSwipeSelections = state.hostSwipeSelections.slice(-320)
  }
  return true
}

function selectedHostSwipe(state: PhoneState, hostMessageId: string): number | undefined {
  return [...(state.hostSwipeSelections || [])].reverse().find((entry) => entry.hostMessageId === hostMessageId)?.swipeId
}

function roleplayClockSnapshot(state: PhoneState): PocketRoleplayClockSnapshot {
  return {
    roleplayNow: state.roleplayNow,
    source: state.roleplayClockSource === 'manual' || state.roleplayClockSource === 'narrative' ? state.roleplayClockSource : 'legacy',
    precision: state.roleplayClockPrecision === 'exact' || state.roleplayClockPrecision === 'approximate' || state.roleplayClockPrecision === 'relative' ? state.roleplayClockPrecision : 'unknown',
    label: text(state.roleplayClockLabel, 160),
  }
}

function applyRoleplayClockSnapshot(state: PhoneState, snapshot: PocketRoleplayClockSnapshot): boolean {
  let changed = false
  if (snapshot.roleplayNow && state.roleplayNow !== snapshot.roleplayNow) { state.roleplayNow = snapshot.roleplayNow; changed = true }
  if (state.roleplayClockSource !== snapshot.source) { state.roleplayClockSource = snapshot.source; changed = true }
  if (state.roleplayClockPrecision !== snapshot.precision) { state.roleplayClockPrecision = snapshot.precision; changed = true }
  if (state.roleplayClockLabel !== snapshot.label) { state.roleplayClockLabel = snapshot.label; changed = true }
  return changed
}

function ensureHostClockBaseline(state: PhoneState, hostMessageId: string): { baseline: PocketHostClockBaseline; created: boolean } {
  state.hostClockBaselines ||= []
  const existing = state.hostClockBaselines.find((entry) => entry.hostMessageId === hostMessageId)
  if (existing) return { baseline: existing, created: false }
  const baseline: PocketHostClockBaseline = { hostMessageId, ...roleplayClockSnapshot(state), updatedAt: nowIso() }
  state.hostClockBaselines.push(baseline)
  state.hostClockBaselines = state.hostClockBaselines.slice(-320)
  return { baseline, created: true }
}

function storeCandidateClock(state: PhoneState, origin: PocketTurnCandidateOrigin, snapshot: PocketRoleplayClockSnapshot): boolean {
  state.candidateClocks ||= []
  const existing = state.candidateClocks.find((entry) => entry.hostMessageId === origin.hostMessageId && entry.swipeId === origin.swipeId)
  const next: PocketCandidateClockSnapshot = {
    hostMessageId: origin.hostMessageId, swipeId: origin.swipeId, generationId: origin.generationId, ...snapshot, updatedAt: nowIso(),
  }
  if (existing) {
    const same = existing.roleplayNow === next.roleplayNow && existing.source === next.source && existing.precision === next.precision && existing.label === next.label && existing.generationId === next.generationId
    Object.assign(existing, next)
    return !same
  }
  state.candidateClocks.push(next)
  state.candidateClocks = state.candidateClocks.slice(-640)
  return true
}

function candidateClockSnapshot(state: PhoneState, hostMessageId: string, swipeId: number): PocketCandidateClockSnapshot | undefined {
  return [...(state.candidateClocks || [])].reverse().find((entry) => entry.hostMessageId === hostMessageId && entry.swipeId === swipeId)
}

function restoreClockForSelectedCandidate(state: PhoneState, hostMessageId: string, swipeId: number): boolean {
  const candidate = candidateClockSnapshot(state, hostMessageId, swipeId)
  if (candidate) return applyRoleplayClockSnapshot(state, candidate)
  const baseline = [...(state.hostClockBaselines || [])].reverse().find((entry) => entry.hostMessageId === hostMessageId)
  return baseline ? applyRoleplayClockSnapshot(state, baseline) : false
}

function formatRoleplayClockLabel(iso: string, timezoneOffsetMinutes: number | undefined): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  const offset = Number.isFinite(Number(timezoneOffsetMinutes)) ? Number(timezoneOffsetMinutes) : 0
  const local = new Date(parsed.getTime() - offset * 60_000)
  let hour = local.getUTCHours()
  const minute = local.getUTCMinutes()
  const suffix = hour >= 12 ? 'PM' : 'AM'
  hour %= 12
  if (!hour) hour = 12
  return `${hour}:${String(minute).padStart(2, '0')} ${suffix}`
}

function pocketMessageActiveForSwipe(state: PhoneState, message: PhoneMessage): boolean {
  if (message.candidateCommitState === 'provisional') return false
  const origin = message.origin
  if (!origin || origin.chatId !== state.chatId) return true
  const selected = selectedHostSwipe(state, origin.hostMessageId)
  return selected === undefined || selected === origin.swipeId
}

function activeConversationMessages(state: PhoneState, conversation: PocketConversation): PhoneMessage[] {
  return conversation.messages.filter((message) => pocketMessageActiveForSwipe(state, message))
}

function routeTargetsPocketMessage(route: PocketRoute | undefined, hiddenMessageIds: Set<string>): boolean {
  return Boolean(route?.app === 'messages' && route.messageId && hiddenMessageIds.has(route.messageId))
}

function projectSwipeScopedState(state: PhoneState): PhoneState {
  const projected = structuredClone(state)
  const hiddenMessageIds = new Set<string>()
  for (const sourceConversation of state.conversations) {
    for (const message of sourceConversation.messages) {
      if (!pocketMessageActiveForSwipe(state, message)) hiddenMessageIds.add(message.id)
    }
  }
  if (!hiddenMessageIds.size) return projected
  for (const conversation of projected.conversations) {
    conversation.messages = conversation.messages.filter((message) => !hiddenMessageIds.has(message.id))
    conversation.unread = conversationUnreadForDevice(projected, conversation, pocketPersonaActorId(projected))
    if (conversation.outgoingBurst) {
      conversation.outgoingBurst.messageIds = conversation.outgoingBurst.messageIds.filter((messageId) => !hiddenMessageIds.has(messageId))
      if (!conversation.outgoingBurst.messageIds.length) conversation.outgoingBurst = undefined
    }
  }
  projected.notifications = projected.notifications.filter((entry) => !routeTargetsPocketMessage(entry.route, hiddenMessageIds))
  projected.activities = projected.activities.filter((entry) => !routeTargetsPocketMessage(entry.route, hiddenMessageIds))
  projected.actorMemories = projected.actorMemories.filter((entry) => !hiddenMessageIds.has(entry.messageId))
  return projected
}

function activeCandidateForTool(userId: string, chatId: string): ActivePocketCandidate | undefined {
  const userKey = viewKey(userId)
  const cutoff = Date.now() - 10 * 60_000
  for (const [key, candidate] of activePocketCandidates) {
    if (candidate.startedAt < cutoff) activePocketCandidates.delete(key)
  }
  const matches = [...activePocketCandidates.values()].filter((candidate) => candidate.userKey === userKey && candidate.chatId === chatId)
  return matches.length === 1 ? matches[0] : undefined
}

function removePocketMessageArtifacts(state: PhoneState, conversationId: string, messageId: string): boolean {
  const conversation = state.conversations.find((entry) => entry.id === conversationId)
  if (!conversation) return false
  const before = conversation.messages.length
  conversation.messages = conversation.messages.filter((entry) => entry.id !== messageId)
  if (conversation.messages.length === before) return false
  state.actorMemories = removeActorMemoryByMessageId(state.actorMemories, messageId)
  state.notifications = state.notifications.filter((entry) => !(entry.route?.app === 'messages' && entry.route.messageId === messageId))
  const removedActivityIds = new Set<string>()
  for (const entry of state.activities) {
    if (entry.route?.app !== 'messages') continue
    const batchIds = entry.source?.messageIds || []
    if (batchIds.includes(messageId)) {
      const remaining = batchIds.filter((entryId) => entryId !== messageId)
      if (remaining.length) {
        if (entry.source) entry.source.messageIds = remaining
        if (entry.route.messageId === messageId) entry.route.messageId = remaining.at(-1)
        if (entry.presentation?.kind === 'batch') {
          entry.presentation.batchMessages = (entry.presentation.batchMessages || []).filter((item) => item.messageId !== messageId)
          entry.summary = `${remaining.length} message${remaining.length === 1 ? '' : 's'}`
        }
        continue
      }
      removedActivityIds.add(entry.id)
      continue
    }
    if (entry.route.messageId === messageId) removedActivityIds.add(entry.id)
  }
  if (removedActivityIds.size) {
    state.activities = state.activities.filter((entry) => !removedActivityIds.has(entry.id))
    state.processedCommands = state.processedCommands.filter((entry) => !entry.activityId || !removedActivityIds.has(entry.activityId))
  }
  if (conversation.outgoingBurst) {
    conversation.outgoingBurst.messageIds = conversation.outgoingBurst.messageIds.filter((entry) => entry !== messageId)
    if (!conversation.outgoingBurst.messageIds.length) conversation.outgoingBurst = undefined
  }
  conversation.unread = conversationUnreadForDevice(state, conversation, pocketPersonaActorId(state))
  conversation.updatedAt = nowIso()
  return true
}

async function validateChangedWallpaperSources(existing: DevicePreferences, next: DevicePreferences, userId?: string): Promise<void> {
  const pairs: Array<[DevicePreferences['homeWallpaper']['source'], DevicePreferences['homeWallpaper']['source']]> = [
    [existing.homeWallpaper.source, next.homeWallpaper.source],
    [existing.chatWallpaper.source, next.chatWallpaper.source],
  ]
  const personaIds = new Set([...Object.keys(existing.personaAppearance), ...Object.keys(next.personaAppearance)])
  for (const personaId of personaIds) {
    pairs.push(
      [existing.personaAppearance[personaId]?.homeWallpaper.source || null, next.personaAppearance[personaId]?.homeWallpaper.source || null],
      [existing.personaAppearance[personaId]?.chatWallpaper.source || null, next.personaAppearance[personaId]?.chatWallpaper.source || null],
    )
  }
  for (const [before, after] of pairs) {
    if (!after || imageSourceKey(before) === imageSourceKey(after)) continue
    assertPocketImageResolved(await resolvePocketImageSource(spindle, after, userId))
  }
}

async function sendState(state: PhoneState, userId?: string, reason = 'refresh', open = false): Promise<void> {
  const preferences = await loadPreferences(userId)
  const npcBank = await loadNpcBank(userId)
  const identityProfiles = normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId })).entries
  let generation: PocketGenerationInfo = { mode: preferences.generationMode, effective: null, connections: [], history: preferences.generationHistory, modelOverride: preferences.sidecarModelOverride }
  try { generation = await inspectPocketGeneration({ spindle, loadPreferences, savePreferences, send }, preferences, userId) }
  catch (error) { spindle.log.warn(`Pocket could not inspect generation profiles: ${error instanceof Error ? error.message : String(error)}`) }
  const swarmProfile = await resolveSwarmProfile(state.chatId, state.characterId, preferences, userId)
  let activePersona: { id: string; name: string } | null = null
  if (spindle.permissions.has('personas')) {
    try {
      const persona = await spindle.personas.getActive(userId)
      if (persona) activePersona = { id: text(persona.id, 180), name: text(persona.name, 120) || 'Persona' }
    } catch { /* appearance falls back to device defaults */ }
  }
  const resolvedWallpapers = await resolveWallpaperUrls(preferences, activePersona?.id || '', userId)
  for (const [target, result] of Object.entries(resolvedWallpapers)) {
    if (result.status === 'error') spindle.log.warn(`Pocket image resolution failed (${target}/${result.sourceKind}): ${result.error || 'unknown error'}`)
  }
  const displayState = projectSwipeScopedState(structuredClone(state))
  await Promise.all([...displayState.contacts, ...npcBank.entries].map(async contact => {
    if (!contact.avatarSource) return
    const image = await resolvePocketImageSource(spindle, contact.avatarSource, userId)
    if (image.status !== 'ready') return
    if ('avatarOverrideUrl' in contact) contact.avatarOverrideUrl = image.url
    else contact.avatarUrl = image.url
  }))
  send({ type: 'lumiphone:state', state: displayState, npcBank, identityProfiles, preferences, jevKeyConfigured: Boolean(await getJevApiKey(userId)), resolvedWallpapers, capabilities: capabilities(), generation, swarmProfile, activePersona, reason, open }, userId)
}

function viewKey(userId?: string): string { return userId || '_default' }

function currentView(userId?: string): PocketViewState | null {
  const view = frontendViews.get(viewKey(userId))
  return view && Date.now() - view.updatedAt < 120_000 ? view : null
}

function notificationDestinationVisible(state: PhoneState, route: PocketRoute, userId?: string, deviceOwnerActorId = pocketPersonaActorId(state)): boolean {
  const view = currentView(userId)
  return Boolean(
    view
    && view.chatId === state.chatId
    && view.characterId === state.characterId
    && view.deviceOwnerActorId === deviceOwnerActorId
    && destinationIsVisible(view.open, view.route, route)
  )
}

function addNotification(state: PhoneState, notification: Omit<PhoneNotification, 'id' | 'createdAt' | 'read'>, userId?: string): PhoneNotification | null {
  const route = notification.route || { app: notification.app }
  const deviceOwnerActorId = notification.deviceOwnerActorId || pocketPersonaActorId(state)
  if (notificationDestinationVisible(state, route as PocketRoute, userId, deviceOwnerActorId)) return null
  const entry: PhoneNotification = { ...notification, deviceOwnerActorId, id: id('ntf'), createdAt: nowIso(), read: false }
  state.notifications.unshift(entry)
  state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS)
  return entry
}

function sendNotification(notification: PhoneNotification | null, userId?: string): void {
  if (notification) send({ type: 'lumiphone:notification', notification }, userId)
}

function addActivity(
  state: PhoneState,
  activity: Omit<PocketActivity, 'id' | 'createdAt' | 'scope'>,
  command?: ProcessedPocketCommand,
): PocketActivity {
  const entry: PocketActivity = {
    ...activity,
    id: id('act'),
    createdAt: nowIso(),
    scope: { chatId: state.chatId, characterId: state.characterId },
    source: { ...activity.source, commandId: command?.id || activity.source?.commandId },
  }
  state.activities.push(entry)
  state.activities = state.activities.slice(-MAX_ACTIVITIES)
  if (command) command.activityId = entry.id
  return entry
}

function sendActivity(activity: PocketActivity | undefined, userId?: string): void {
  if (activity) send({ type: 'lumiphone:activity', activity }, userId)
}

async function maybePush(state: PhoneState, preferences: DevicePreferences, notification: PhoneNotification, userId?: string): Promise<void> {
  if (!preferences.pushNotifications || !spindle.permissions.has('push_notification')) return
  const throttleKey = `${userId || '_default'}:${stateKey(state.chatId, state.characterId)}:${notification.app}`
  const lastSent = notificationThrottle.get(throttleKey) || 0
  if (Date.now() - lastSent < 15_000) return
  notificationThrottle.set(throttleKey, Date.now())
  try {
    const status = await spindle.push.getStatus(userId)
    if (!status.available) return
    await spindle.push.send({
      title: notification.title,
      body: notification.body || `Open ${notification.app} in Pocket`,
      tag: `lumiphone-${stateKey(state.chatId, state.characterId)}-${notification.app}`,
      url: `/chat/${state.chatId}`,
    }, userId)
  } catch (error) {
    spindle.log.warn(`Pocket push notification failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function resolveContext(input: AnyRecord, userId?: string): Promise<{ chatId: string; characterId: string }> {
  let chatId = text(input.chat_id ?? input.chatId, 180)
  let characterId = text(input.character_id ?? input.characterId, 180)
  if ((!chatId || !characterId) && spindle.permissions.has('chats')) {
    try {
      const active = await (spindle.chats.getActive as any)(userId)
      chatId ||= text(active?.id, 180)
      characterId ||= text(active?.character_id, 180)
    } catch { /* use explicit context */ }
  }
  return { chatId: chatId || '_lobby', characterId: characterId || '_none' }
}

function sourceMatches(contact: PocketContact, kind: string, sourceId: string, itemId = ''): boolean {
  if (kind === 'character') return contact.source.kind === 'character' && contact.source.characterId === sourceId
  if (kind === 'council') return contact.source.kind === 'council' && (contact.source.memberId === sourceId || Boolean(itemId && contact.source.itemId === itemId) || contact.source.itemId === sourceId)
  return false
}

async function listContactSources(state: PhoneState, userId?: string): Promise<PocketContactSourceOption[]> {
  const options: PocketContactSourceOption[] = []
  if (spindle.permissions.has('characters')) {
    try {
      const listed: any = await spindle.characters.list({ limit: 200, offset: 0, userId })
      for (const character of Array.isArray(listed?.data) ? listed.data : []) {
        const sourceId = text(character?.id, 180)
        const name = text(character?.name, 120)
        if (!sourceId || !name) continue
        options.push({
          kind: 'character', sourceId, name, role: 'Character',
          description: text(character?.description, 600),
          avatarUrl: text(character?.avatar_url ?? character?.avatarUrl, 2_000),
          accent: text(character?.color ?? character?.accent ?? character?.metadata?.color, 20),
          importedContactId: state.contacts.find((entry) => sourceMatches(entry, 'character', sourceId))?.id,
        })
      }
    } catch { /* source stays unavailable */ }
  }
  try {
    const members: any[] = await (spindle.council.getMembers as any)({ userId })
    for (const member of Array.isArray(members) ? members : []) {
      const sourceId = text(member?.memberId, 180)
      const itemId = text(member?.itemId, 180)
      const name = text(member?.name, 120)
      if (!sourceId || !name) continue
      options.push({
        kind: 'council', sourceId, itemId, name,
        role: text(member?.role, 120) || 'Council member',
        description: text(member?.definition, 600), avatarUrl: text(member?.avatarUrl, 2_000),
        accent: text(member?.color ?? member?.accent, 20),
        importedContactId: state.contacts.find((entry) => sourceMatches(entry, 'council', sourceId, itemId))?.id,
      })
    }
  } catch { /* council is optional */ }
  return options
}

function generatedPhoneProfile(value: unknown): PocketContact['phoneProfile'] {
  if (!isRecord(value)) return undefined
  const personality = text(value.personality, 600)
  const appearance = text(value.appearance, 360)
  const textingStyle = text(value.textingStyle, 600)
  return personality || appearance || textingStyle ? { personality, appearance, textingStyle } : undefined
}

function pocketContactPhoneBrief(
  contact: PocketContact,
  fallback?: { description: string; personality: string; behavior: string },
): string {
  const phone = contact.phoneProfile
  const lines = [
    contact.identityBrief ? `Compact profile: ${text(contact.identityBrief, 520)}` : '',
    phone?.personality ? `Personality: ${text(phone.personality, 420)}` : '',
    phone?.appearance ? `Minimal appearance: ${text(phone.appearance, 220)}` : '',
    phone?.textingStyle ? `Texting style: ${text(phone.textingStyle, 420)}` : '',
  ].filter(Boolean)
  if (lines.length) return lines.join('\n').slice(0, 1_200)
  return [
    fallback?.description,
    fallback?.personality,
    fallback?.behavior,
  ].filter(Boolean).join('. ').slice(0, 900)
}

async function resolveContactProfile(contact: PocketContact, userId?: string): Promise<{ name: string; role: string; description: string; personality: string; behavior: string; source: string }> {
  if (contact.source.kind === 'character') {
    if (!spindle.permissions.has('characters')) throw new Error(`Character access is required to reply as ${contact.name}.`)
    const character: any = await (spindle.characters.get as any)(contact.source.characterId, userId).catch(() => null)
    if (!character) throw new Error(`The linked character for ${contact.name} is unavailable. Re-link or remove this contact.`)
    return {
      name: text(character.name, 120) || contact.name, role: contact.role,
      description: text(character.description, 8_000), personality: text(character.personality, 4_000),
      behavior: text(character.scenario ?? character.mes_example, 3_000), source: `character:${contact.source.characterId}`,
    }
  }
  if (contact.source.kind === 'council') {
    const councilSource = contact.source
    const members: any[] = await (spindle.council.getMembers as any)({ userId }).catch(() => [])
    const member = members.find((entry) => text(entry?.memberId, 180) === councilSource.memberId || text(entry?.itemId, 180) === councilSource.itemId)
    if (member) return {
      name: text(member.name, 120) || contact.name, role: text(member.role, 120) || contact.role,
      description: text(member.definition, 8_000), personality: text(member.personality, 4_000),
      behavior: text(member.behavior, 3_000), source: `council:${councilSource.memberId || councilSource.itemId}`,
    }
    const items: any[] = await (spindle.council.getAvailableLumiaItems as any)({ userId }).catch(() => [])
    const item = items.find((entry) => text(entry?.id, 180) === councilSource.itemId)
    if (!item) throw new Error(`The linked Council profile for ${contact.name} is unavailable. Re-link or remove this contact.`)
    return {
      name: text(item.name, 120) || contact.name, role: contact.role,
      description: text(item.definition, 8_000), personality: text(item.personality, 4_000),
      behavior: text(item.behavior, 3_000), source: `council-item:${councilSource.itemId}`,
    }
  }
  return {
    name: contact.name, role: contact.role, description: text(contact.source.description || contact.description, 600),
    personality: '', behavior: '', source: `npc:${contact.source.origin}`,
  }
}

interface PocketPromptDebugMessage {
  role: string
  content: string
}
interface PocketPromptDebugRecord {
  version: 1
  task: string
  requestId: string
  capturedAt: string
  type: string
  messages: PocketPromptDebugMessage[]
  parameters: AnyRecord
  reasoning?: AnyRecord
}

function promptDebugPath(requestId: string): string {
  return `debug/prompts/${safeSegment(requestId)}.json`
}
function promptDebugSnapshot(task: PocketGenerationRun['task'], requestId: string, request: AnyRecord): PocketPromptDebugRecord {
  const messages = (Array.isArray(request.messages) ? request.messages : []).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const role = text(entry.role, 40)
    const content = typeof entry.content === 'string' ? entry.content : ''
    if (!role && !content) return []
    return [{ role: role || 'unknown', content }]
  })
  return {
    version: 1,
    task,
    requestId,
    capturedAt: nowIso(),
    type: text(request.type, 80),
    messages,
    parameters: isRecord(request.parameters) ? request.parameters : {},
    reasoning: isRecord(request.reasoning) ? request.reasoning : undefined,
  }
}
async function savePromptDebug(task: PocketGenerationRun['task'], requestId: string, request: AnyRecord, userId?: string): Promise<void> {
  try {
    await spindle.userStorage.setJson(
      promptDebugPath(requestId),
      promptDebugSnapshot(task, requestId, request),
      { indent: 2, userId },
    )
  } catch (error) {
    spindle.log.warn(`Pocket could not persist outgoing-prompt debug for ${requestId}: ${error instanceof Error ? error.message : String(error)}`)
  }
}
async function loadPromptDebug(requestId: string, userId?: string): Promise<PocketPromptDebugRecord | null> {
  if (!requestId) return null
  const raw = await spindle.userStorage.getJson<unknown>(promptDebugPath(requestId), { fallback: null, userId })
  if (!isRecord(raw) || raw.version !== 1) return null
  return {
    version: 1,
    task: text(raw.task, 120),
    requestId: text(raw.requestId, 180) || requestId,
    capturedAt: text(raw.capturedAt, 80),
    type: text(raw.type, 80),
    messages: (Array.isArray(raw.messages) ? raw.messages : []).flatMap((entry) => {
      if (!isRecord(entry)) return []
      return [{ role: text(entry.role, 40) || 'unknown', content: typeof entry.content === 'string' ? entry.content : '' }]
    }),
    parameters: isRecord(raw.parameters) ? raw.parameters : {},
    reasoning: isRecord(raw.reasoning) ? raw.reasoning : undefined,
  }
}

async function runStructuredGeneration(
  task: PocketGenerationRun['task'],
  requestId: string,
  request: AnyRecord,
  userId?: string,
): Promise<AnyRecord> {
  await savePromptDebug(task, requestId, request, userId)
  const first: any = await runPocketGeneration({ spindle, loadPreferences, savePreferences, send }, task, requestId, request, userId)
  const preferences = await loadPreferences(userId)
  return parseWithTruncationRetry(first.content, async () => {
    const parameters = isRecord(request.parameters) ? request.parameters : {}
    const maxTokens = Math.min(1_600, Math.max(80, Math.round(numberValue(parameters.max_tokens, 400) * 1.6)))
    const retry: any = await runPocketGeneration({ spindle, loadPreferences, savePreferences, send }, task, `${requestId}:truncation-retry`, {
      ...request,
      parameters: { ...parameters, max_tokens: maxTokens },
    }, userId)
    return retry.content
  }, preferences.automaticGenerationRetry)
}

function upsertContact(state: PhoneState, contact: PocketContact, preserveCustomization = true): PocketContact {
  const sourceKey = contactSourceKey(contact.source)
  const existing = state.contacts.find((entry) => entry.id === contact.id || (contact.source.kind !== 'npc' && contactSourceKey(entry.source) === sourceKey) || (
    contact.source.kind === 'npc' && entry.source.kind === 'npc' && contact.source.sceneKey && entry.source.sceneKey === contact.source.sceneKey
  ))
  if (existing) {
    const preserved = preserveCustomization ? {
      createdAt: existing.createdAt, accent: existing.accent, contextPolicy: existing.contextPolicy,
      avatarOverrideUrl: existing.avatarOverrideUrl, colorMode: existing.colorMode, sourceAccent: contact.sourceAccent || existing.sourceAccent,
      avatarSource: existing.avatarSource, avatarFocus: existing.avatarFocus,
      generationPolicy: contact.generationPolicy || existing.generationPolicy,
      messagingPolicy: contact.messagingPolicy || existing.messagingPolicy,
      messagingStyle: contact.messagingStyle || existing.messagingStyle,
      relationship: contact.relationship || existing.relationship,
    } : { createdAt: existing.createdAt }
    Object.assign(existing, contact, preserved, { updatedAt: nowIso() })
    return existing
  }
  state.contacts.push(contact)
  state.contacts = state.contacts.slice(-80)
  return contact
}

function directConversationForContact(state: PhoneState, contactId: string): PocketConversation | undefined {
  return state.conversations.find((entry) => entry.kind === 'direct' && entry.includesPocketPersona !== false && resolvePocketActor(state, conversationActorIds(entry)[0])?.contact?.id === contactId)
}

function reconcileContactAvailability(state: PhoneState, contact: PocketContact): void {
  const conversation = directConversationForContact(state, contact.id)
  if (!conversation) return
  if (contact.presence.inScene) {
    const prior = conversation.availability.state === 'paused' ? conversation.availability.reason : undefined
    const reason = conversation.availability.state === 'arriving' ? 'arrived' : 'in_scene'
    conversation.availability = prior ? { state: 'local', reason, resumePauseReason: prior } : { state: 'local', reason }
  } else if (conversation.availability.state === 'local') {
    conversation.availability = conversation.availability.resumePauseReason ? { state: 'paused', reason: conversation.availability.resumePauseReason } : { state: 'remote' }
    if (conversation.availability.state === 'remote') conversation.pause = undefined
  }
}

function commitConversationHandoff(
  state: PhoneState,
  conversation: PocketConversation,
  contact: PocketContact,
  decision: ReturnType<typeof normalizeReplyDecision>,
): PocketRelay {
  const createdAt = decision.createdAt
  const reason = decision.reason === 'arrived' || decision.reason === 'took_action' || decision.reason === 'continued_in_person' ? decision.reason : 'in_scene'
  const previous = conversation.availability.state === 'arriving' || conversation.availability.state === 'paused' ? conversation.availability.state : 'remote'
  const resumePauseReason = conversation.availability.state === 'paused' ? conversation.availability.reason : undefined
  conversation.availability = resumePauseReason ? { state: 'local', reason, resumePauseReason } : { state: 'local', reason }
  conversation.pause = undefined
  conversation.tailSnapshot = conversationTailSnapshot(conversation, createdAt)
  const existing = state.relays.find((entry) => entry.kind === 'local' && entry.status === 'pending' && entry.conversationId === conversation.id && decision.burstId && entry.burstId === decision.burstId)
  if (existing) {
    decision.relayId = existing.id
    conversation.lastDecision = decision
    return existing
  }
  const relayId = id('relay')
  const eventId = id('evt')
  const latestMessageId = conversation.messages.at(-1)?.id
  const relay: PocketRelay = {
    id: relayId, chatId: state.chatId, characterId: state.characterId, contactId: contact.id, conversationId: conversation.id,
    burstId: decision.burstId, kind: 'local', reason, actorState: reason, conversationTail: conversation.tailSnapshot, latestExchange: relayLatestExchange(conversation),
    sourceMessageId: latestMessageId, timelineEventId: eventId, createdAt, status: 'pending', continuation: { state: 'idle' },
  }
  decision.relayId = relayId
  conversation.lastDecision = decision
  state.relays.push(relay)
  state.relays = state.relays.slice(-24)
  state.events.push({
    id: eventId, title: `${contact.name} continued in person`, description: relay.latestExchange,
    start: state.roleplayNow || createdAt, end: state.roleplayNow || createdAt, whenKind: 'relative', whenText: 'Now',
    color: contactAccent(contact), lane: 'Phone handoffs', completed: true, createdBy: 'model', kind: 'phone-handoff',
    actorContactIds: [contact.id], source: { app: 'messages', conversationId: conversation.id, relayId, messageId: latestMessageId },
    channelTransition: { from: previous, to: 'local', reason },
  })
  state.events = state.events.slice(-MAX_EVENTS)
  addActivity(state, {
    kind: 'timeline', title: `${contact.name} is here now`, summary: 'Pocket handed the conversation back to the physical scene.',
    route: { app: 'calendar', eventId }, source: { contactId: contact.id, conversationId: conversation.id, eventId },
  })
  return relay
}

function commitArrivalHandoff(
  state: PhoneState,
  conversation: PocketConversation,
  contact: PocketContact,
  decision: ReturnType<typeof normalizeReplyDecision>,
): PocketRelay {
  const createdAt = decision.createdAt
  const previous = conversation.availability.state === 'paused' || conversation.availability.state === 'arriving' ? conversation.availability.state : 'remote'
  conversation.availability = { state: 'arriving' }
  conversation.pause = undefined
  conversation.tailSnapshot = conversationTailSnapshot(conversation, createdAt)
  const existing = [...state.relays].reverse().find((entry) => entry.kind === 'arrival' && entry.status === 'pending' && entry.conversationId === conversation.id)
  if (existing) {
    const active = existing.continuation.state === 'launching' || existing.continuation.state === 'accepted' || existing.continuation.state === 'started'
    if (!active) {
      existing.burstId = decision.burstId || existing.burstId
      existing.conversationTail = conversation.tailSnapshot
      existing.latestExchange = relayLatestExchange(conversation)
      existing.sourceMessageId = conversation.messages.at(-1)?.id
      existing.injectionError = undefined
    }
    decision.relayId = existing.id
    conversation.lastDecision = decision
    return existing
  }
  const relayId = id('relay')
  const eventId = id('evt')
  const latestMessageId = conversation.messages.at(-1)?.id
  const relay: PocketRelay = {
    id: relayId, chatId: state.chatId, characterId: state.characterId, contactId: contact.id, conversationId: conversation.id,
    burstId: decision.burstId, kind: 'arrival', reason: 'arriving', actorState: 'arriving',
    conversationTail: conversation.tailSnapshot, latestExchange: relayLatestExchange(conversation),
    sourceMessageId: latestMessageId, timelineEventId: eventId, createdAt, status: 'pending', continuation: { state: 'idle' },
  }
  decision.relayId = relayId
  conversation.lastDecision = decision
  state.relays.push(relay)
  state.relays = state.relays.slice(-24)
  state.events.push({
    id: eventId, title: `${contact.name} started heading over`, description: relay.latestExchange,
    start: state.roleplayNow || createdAt, end: state.roleplayNow || createdAt, whenKind: 'relative', whenText: 'Now',
    color: contactAccent(contact), lane: 'Phone handoffs', completed: true, createdBy: 'model', kind: 'phone-handoff',
    actorContactIds: [contact.id], source: { app: 'messages', conversationId: conversation.id, relayId, messageId: latestMessageId },
    channelTransition: { from: previous, to: 'arriving', reason: 'arriving' },
  })
  state.events = state.events.slice(-MAX_EVENTS)
  addActivity(state, {
    kind: 'timeline', title: `${contact.name} is on the way`, summary: 'Pocket handed the narrative back to the roleplay without claiming they have arrived yet.',
    route: { app: 'calendar', eventId }, source: { contactId: contact.id, conversationId: conversation.id, eventId },
  })
  return relay
}

async function requestRelayContinuation(chatId: string, characterId: string, relayId: string, userId?: string): Promise<void> {
  const method = 'spindle.chat.appendMessage(triggerGeneration)' as const
  const permissions = {
    chatMutation: spindle.permissions.has('chat_mutation'),
    generation: spindle.permissions.has('generation'),
  }
  const invokedAt = nowIso()
  spindle.log.info(`Pocket relay continuation invoked: relay=${relayId} chat=${chatId} method=${method} chat_mutation=${permissions.chatMutation} generation=${permissions.generation}`)
  const flightKey = `${viewKey(userId)}:${chatId}`
  if (relayFlights.has(flightKey)) return
  relayFlights.add(flightKey)
  try {
    const launch = await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      const relay = state.relays.find((entry) => entry.id === relayId && entry.status === 'pending')
      if (!relay || relay.continuation.state === 'launching' || relay.continuation.state === 'accepted' || relay.continuation.state === 'started') return { proceed: false, error: '', kind: relay?.kind || 'local' as const }
      const missing = [!permissions.chatMutation ? 'Chat mutation' : '', !permissions.generation ? 'Generation' : ''].filter(Boolean)
      if (missing.length) {
        const error = `${missing.join(' and ')} permission${missing.length > 1 ? 's are' : ' is'} required to continue in roleplay.`
        relay.continuation = {
          state: 'blocked', invokedAt, permissionCheckedAt: nowIso(), permissions, method, error,
        }
        await saveState(state, userId)
        await sendState(state, userId, 'relay_blocked')
        return { proceed: false, error, kind: relay.kind }
      }
      const activeRelay = state.relays.find((entry) => entry.id !== relayId && entry.status === 'pending' && (
        entry.continuation.state === 'launching' || entry.continuation.state === 'accepted' || entry.continuation.state === 'started'
      ))
      if (activeRelay) return { proceed: false, error: `Pocket is already continuing relay ${activeRelay.id} in this roleplay.`, kind: relay.kind }
      relay.continuation = {
        state: 'launching', invokedAt, permissionCheckedAt: nowIso(), permissions, method,
      }
      relay.injectedAt = undefined
      relay.injectedGenerationId = undefined
      relay.serializedRelayChars = undefined
      relay.serializedRelay = undefined
      relay.relayExchangeMessageCount = undefined
      relay.injectionError = undefined
      await saveState(state, userId)
      await sendState(state, userId, 'relay_launching')
      return { proceed: true, error: '', kind: relay.kind }
    })
    if (!launch.proceed) {
      if (launch.error) send({ type: 'lumiphone:error', error: launch.error }, userId)
      return
    }
    const appended = await spindle.chat.appendMessage(chatId, {
      role: 'user',
      content: launch.kind === 'arrival' ? 'Continue the current scene toward the arrival established by the Pocket conversation.' : 'Continue the current scene from the Pocket conversation handoff.',
      metadata: { source: 'pocket', pocketRelayId: relayId, pocketContinuation: true },
    }, { triggerGeneration: true })
    await spindle.chat.setMessageHidden(chatId, appended.id, true).catch(() => undefined)
    const generationId = text(appended.generationId, 180)
    if (!generationId) throw new Error(`Lumiverse returned from ${method} without a generation ID; the continuation was not accepted.`)
    const hostReturnedAt = nowIso()
    spindle.log.info(`Pocket relay host call accepted: relay=${relayId} generation=${generationId} message=${appended.id}`)
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      const relay = state.relays.find((entry) => entry.id === relayId && entry.status === 'pending')
      if (!relay) return
      relay.continuation = {
        ...relay.continuation,
        state: relay.continuation.state === 'started' ? 'started' : 'accepted',
        generationId,
        sourceMessageId: appended.id,
        hostCallReturnedAt: hostReturnedAt,
        hostAcceptedAt: hostReturnedAt,
        error: undefined,
      }
      // Interception can occur synchronously inside appendMessage before the host
      // returns its generation id. Bind that already-recorded receipt here too;
      // GENERATION_STARTED remains an independent observed diagnostic.
      if (relay.injectedAt && !relay.injectedGenerationId) relay.injectedGenerationId = generationId
      await saveState(state, userId)
      await sendState(state, userId, relay.continuation.state === 'started' ? 'relay_started' : 'relay_accepted')
    })
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500)
    spindle.log.error(`Pocket relay continuation failed: relay=${relayId} method=${method} error=${message}`)
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      const relay = state.relays.find((entry) => entry.id === relayId && entry.status === 'pending')
      if (!relay) return
      relay.continuation = {
        ...relay.continuation,
        state: 'failed',
        invokedAt: relay.continuation.invokedAt || invokedAt,
        permissionCheckedAt: relay.continuation.permissionCheckedAt || invokedAt,
        permissions: relay.continuation.permissions || permissions,
        method,
        hostCallReturnedAt: nowIso(),
        error: message,
      }
      await saveState(state, userId)
      await sendState(state, userId, 'relay_failed')
    })
    send({ type: 'lumiphone:error', error: message }, userId)
  } finally {
    relayFlights.delete(flightKey)
  }
}

function contactFromSource(option: PocketContactSourceOption): PocketContact {
  const createdAt = nowIso()
  const source = option.kind === 'character'
    ? { kind: 'character' as const, characterId: option.sourceId }
    : { kind: 'council' as const, memberId: option.sourceId, itemId: option.itemId || '' }
  return {
    id: id('contact'), name: option.name, role: option.role, description: option.description,
    identityBrief: option.description, sceneNote: '',
    avatarUrl: option.avatarUrl, sourceAvatarUrl: option.avatarUrl, avatarOverrideUrl: '',
    accent: stableContactAccent(`${option.kind}:${option.sourceId}`), sourceAccent: /^#[0-9a-f]{6}$/i.test(option.accent || '') ? option.accent! : '', colorMode: 'pocket', source,
    relationship: 'background',
    presence: { inScene: false, lastSceneAt: '' }, contextPolicy: { pinned: false }, generationPolicy: { relevant: true },
    messagingPolicy: { remoteEligible: true, allowAmbientInScene: false, lastInitiatedMessageAt: '', lastInitiatedRoleplayAt: '' },
    messagingStyle: { talkativeness: 50, fragmentation: 35 }, createdAt, updatedAt: createdAt,
  }
}

function resolveConversation(state: PhoneState, input: AnyRecord): PocketConversation {
  const conversationId = text(input.conversationId ?? input.conversation_id, 180)
  if (conversationId) {
    const conversation = state.conversations.find((entry) => entry.id === conversationId)
    if (!conversation) throw new Error('That Pocket conversation no longer exists.')
    return conversation
  }
  const actorId = text(input.actorId ?? input.actor_id ?? input.contactId ?? input.contact_id, 180)
  const actor = resolvePocketActor(state, actorId) || (!actorId ? resolvePocketActor(state, state.contacts.find((entry) => entry.source.kind === 'character' && entry.source.characterId === state.characterId)?.id || '') : null)
  if (!actor) throw new Error('Choose a valid actor before opening a conversation.')
  return ensureDirectActorConversation(state, actor.actorId, nowIso(), id)
}

function relationshipValue(value: unknown): 'close' | 'background' {
  return value === 'close' || value === true ? 'close' : 'background'
}

function actorRefParts(value: unknown): { id: string; name: string; relationship: 'close' | 'background' } {
  if (typeof value === 'string') return { id: '', name: text(value, 120), relationship: 'background' }
  if (!isRecord(value)) return { id: '', name: '', relationship: 'background' }
  return {
    id: text(value.actorId ?? value.actor_id ?? value.contactId ?? value.contact_id ?? value.id, 180),
    name: text(value.name ?? value.displayName ?? value.display_name, 120),
    relationship: relationshipValue(value.relationship ?? value.close),
  }
}

function actorReferenceIsPocketPersona(state: PhoneState, value: unknown): boolean {
  const ref = actorRefParts(value)
  const personaId = pocketPersonaActorId(state)
  if (ref.id && (ref.id === personaId || ref.id === text(state.pocketPersona.linkedPersonaId, 180))) return true
  if (!ref.name) return false
  return Boolean(uniqueAliasMatch(ref.name, [state.pocketPersona.displayName, 'You'].filter(Boolean)))
}

function ensureMessageActor(state: PhoneState, value: unknown, source: 'model' | 'user' | 'tag', relationship?: unknown): ReturnType<typeof resolvePocketActor> {
  if (actorReferenceIsPocketPersona(state, value)) return resolvePocketActor(state, pocketPersonaActorId(state))
  let actor = resolveActorReference(state, value)
  const ref = actorRefParts(value)
  if (!actor && ref.name) {
    const discovered = ensureDiscoveredActor(state, {
      name: ref.name,
      source: source === 'model' ? 'model-tool' : 'messages',
      relationship: ref.relationship === 'close' ? 'close' : relationshipValue(relationship),
      now: nowIso(),
      makeId: id,
    })
    actor = resolvePocketActor(state, discovered.id)
  }
  return actor
}

function resolveActorReference(state: PhoneState, value: unknown, allowedIds?: string[]): ReturnType<typeof resolvePocketActor> {
  const ref = actorRefParts(value)
  const allowed = allowedIds ? new Set(allowedIds) : null
  if (actorReferenceIsPocketPersona(state, value)) {
    const personaId = pocketPersonaActorId(state)
    return allowed && !allowed.has(personaId) ? null : resolvePocketActor(state, personaId)
  }
  if (ref.id) {
    if (allowed && !allowed.has(ref.id)) return null
    return resolvePocketActor(state, ref.id)
  }
  if (!ref.name) return null
  const matches = matchingActorIds(state, ref.name, allowedIds)
  if (matches.length > 1) throw new Error(`Actor name “${ref.name}” is ambiguous; use a stable actor or contact id.`)
  return matches.length ? resolvePocketActor(state, matches[0]) : null
}

function ensureGroupConversationForMessaging(
  state: PhoneState,
  payload: AnyRecord,
  source: 'model' | 'user' | 'tag',
  extraParticipantRefs: unknown[] = [],
): PocketConversation {
  const requestedId = text(payload.conversationId ?? payload.conversation_id, 180)
  const title = text(payload.conversation ?? payload.conversationTitle ?? payload.conversation_title ?? payload.title ?? payload.target, 120)
  let conversation = requestedId ? state.conversations.find((entry) => entry.id === requestedId && entry.kind === 'group') : undefined
  if (requestedId && !conversation) throw new Error('That group conversation no longer exists.')
  if (!conversation && title) {
    const normalized = title.toLocaleLowerCase()
    const matches = state.conversations.filter((entry) => entry.kind === 'group' && entry.title.trim().toLocaleLowerCase() === normalized)
    if (matches.length > 1) throw new Error(`Group title “${title}” is ambiguous; use its stable conversation id.`)
    conversation = matches[0]
  }

  const explicitRefs = Array.isArray(payload.participants) ? payload.participants.slice(0, 16) : []
  const refs = [...explicitRefs, ...extraParticipantRefs].slice(0, 24)
  if (!conversation && !title) throw new Error('A new group message needs a conversation title when no existing conversation id is available.')
  if (!conversation && !refs.length) throw new Error(`Group “${title}” does not exist. Supply participants so Pocket can create it.`)

  const participantActorIds = conversation ? [...conversationActorIds(conversation)] : []
  let includesPocketPersona = conversation?.includesPocketPersona ?? false
  for (const value of refs) {
    if (actorReferenceIsPocketPersona(state, value)) {
      includesPocketPersona = true
      continue
    }
    const ref = actorRefParts(value)
    let actor = resolveActorReference(state, value)
    if (!actor && ref.name) {
      const discovered = ensureDiscoveredActor(state, {
        name: ref.name,
        source: 'group-chat',
        relationship: ref.relationship,
        now: nowIso(),
        makeId: id,
      })
      actor = resolvePocketActor(state, discovered.id)
    }
    if (!actor || actor.kind === 'persona') throw new Error('Every group participant needs a valid id or name.')
    if (ref.relationship === 'close') {
      if (actor.contact) actor.contact.relationship = 'close'
      if (actor.discovered) actor.discovered.relationship = 'close'
    }
    if (!participantActorIds.includes(actor.actorId)) participantActorIds.push(actor.actorId)
  }

  const totalParticipants = participantActorIds.length + (includesPocketPersona ? 1 : 0)
  if (totalParticipants < 2) throw new Error('A group conversation needs at least two participants.')
  const participantContactIds = participantActorIds
    .flatMap((actorId) => resolvePocketActor(state, actorId)?.contact?.id || [])
    .filter((entry, index, all) => all.indexOf(entry) === index)
  const changedAt = nowIso()
  if (conversation) {
    conversation.participantActorIds = participantActorIds.slice(0, 24)
    conversation.includesPocketPersona = includesPocketPersona
    conversation.participantContactIds = participantContactIds
    if (title) conversation.title = title
    conversation.updatedAt = changedAt
    return conversation
  }

  const names = participantActorIds.map((actorId) => resolvePocketActor(state, actorId)?.name).filter(Boolean)
  const created: PocketConversation = {
    id: id('conversation'),
    kind: 'group',
    title: title || names.join(', ').slice(0, 120) || 'Group',
    participantActorIds: participantActorIds.slice(0, 24),
    includesPocketPersona,
    participantContactIds,
    messages: [],
    unread: 0,
    availability: { state: 'remote' },
    createdAt: changedAt,
    updatedAt: changedAt,
  }
  state.conversations.push(created)
  return created
}

function exactGroupConversation(state: PhoneState, payload: AnyRecord): PocketConversation {
  const conversationId = text(payload.conversationId ?? payload.conversation_id, 180)
  if (conversationId) {
    const found = state.conversations.find((entry) => entry.id === conversationId && entry.kind === 'group')
    if (!found) throw new Error('That group conversation no longer exists.')
    return found
  }
  const title = text(payload.conversation ?? payload.conversationTitle ?? payload.conversation_title ?? payload.target, 120)
  if (!title) throw new Error('A group message needs an existing conversation id or exact title.')
  const normalized = title.toLocaleLowerCase()
  const matches = state.conversations.filter((entry) => entry.kind === 'group' && entry.title.trim().toLocaleLowerCase() === normalized)
  if (matches.length > 1) throw new Error(`Group title “${title}” is ambiguous; use its stable conversation id.`)
  if (!matches.length) throw new Error(`Group “${title}” does not exist. Create it explicitly before sending messages.`)
  return matches[0]
}

async function resolveSwarmProfile(chatId: string, characterId: string, settings?: DevicePreferences, userId?: string): Promise<SwarmVisualProfile> {
  const manual = settings?.manualVisualProfile || defaultPreferences().manualVisualProfile
  const fallback: SwarmVisualProfile = {
    available: false,
    status: settings?.useSwarmProfile === false ? 'disabled' : 'not-detected',
    error: '',
    characterPositive: manual.positive,
    personaPositive: '',
    negative: manual.negative,
    presets: '',
    checkpoint: manual.model,
    aspect: '',
    source: 'manual',
    fields: {
      char_base: { detected: false, length: 0, preview: '' },
      persona_base: { detected: false, length: 0, preview: '' },
      swarm_negative: { detected: false, length: 0, preview: '' },
      swarm_preset: { detected: false, length: 0, preview: '' },
      swarm_checkpoint: { detected: false, length: 0, preview: '' },
      swarm_aspect: { detected: false, length: 0, preview: '' },
      swarm_loras: { detected: false, length: 0, preview: '' },
    },
  }
  if (!settings?.useSwarmProfile) return fallback
  try {
    const marker = '\n__LUMIPHONE_PROFILE_FIELD__\n'
    const template = ['{{char_base}}', '{{persona_base}}', '{{swarm_negative}}', '{{swarm_preset}}', '{{swarm_checkpoint}}', '{{swarm_aspect}}', '{{swarm_loras}}'].join(marker)
    const result = await spindle.macros.resolve(template, { chatId, characterId, userId, commit: false })
    const fields = result.text.split(marker).map((part) => part.trim().replace(/^\{\{[^}]+\}\}$/, ''))
    const [characterPositive = '', personaPositive = '', negative = '', presets = '', checkpoint = '', aspect = '', loras = ''] = fields
    const macroNames = ['char_base', 'persona_base', 'swarm_negative', 'swarm_preset', 'swarm_checkpoint', 'swarm_aspect', 'swarm_loras'] as const
    const diagnostics = Object.fromEntries(macroNames.map((name, index) => [name, {
      detected: Boolean(fields[index]), length: fields[index]?.length || 0, preview: (fields[index] || '').slice(0, 120),
    }])) as SwarmVisualProfile['fields']
    const available = Boolean(characterPositive || personaPositive || negative || presets || checkpoint || aspect || loras)
    const resolutionWarnings = result.diagnostics.map((entry) => text(entry.message, 240)).filter(Boolean).slice(0, 3)
    if (!available) return resolutionWarnings.length
      ? { ...fallback, status: 'error', error: resolutionWarnings.join(' · '), fields: diagnostics }
      : { ...fallback, fields: diagnostics }
    return {
      available,
      status: 'connected',
      error: '',
      characterPositive: [manual.positive, characterPositive].filter(Boolean).join(', '),
      personaPositive,
      negative: [manual.negative, negative].filter(Boolean).join(', '),
      presets,
      checkpoint: manual.model || checkpoint,
      aspect,
      loras,
      source: 'swarm_studio',
      fields: diagnostics,
    }
  } catch (error) {
    return { ...fallback, status: 'error', error: text(error instanceof Error ? error.message : String(error), 500) || 'Macro resolution failed.' }
  }
}

async function listGallery(input: AnyRecord, userId?: string): Promise<GalleryResult> {
  if (!spindle.permissions.has('images')) throw new Error('Enable the Images permission to use Gallery.')
  const context = await resolveContext(input, userId)
  const scope = text(input.scope, 30) || 'chat'
  const options: AnyRecord & { limit: number; offset: number } = { limit: GALLERY_PAGE_SIZE, offset: galleryOffset(input.offset), specificity: 'full', userId }
  if (scope === 'chat') options.chatId = context.chatId
  if (scope === 'character') options.characterId = context.characterId
  if (scope === 'phone') options.onlyOwned = true
  let result = await spindle.images.list(options as any)
  if (options.offset >= result.total && options.offset > 0) {
    options.offset = Math.max(0, Math.ceil(result.total / GALLERY_PAGE_SIZE) - 1) * GALLERY_PAGE_SIZE
    result = await spindle.images.list(options as any)
  }
  return {
    offset: options.offset, limit: GALLERY_PAGE_SIZE,
    total: result.total,
    data: result.data.map((item) => ({
      id: item.id, url: item.url, fullUrl: item.url, thumbnailUrl: `${item.url}${String(item.url).includes('?') ? '&' : '?'}size=sm`, filename: item.original_filename, mimeType: item.mime_type,
      width: item.width, height: item.height, createdAt: item.created_at, canDelete: item.owner_extension_identifier === 'lumiphone',
    })),
  }
}

async function enhanceScene(scene: string, state: PhoneState, preferences: DevicePreferences, profile: SwarmVisualProfile, requestId: string, userId?: string): Promise<string> {
  if (!preferences.sceneEnhancer || !spindle.permissions.has('generation')) return scene
  const response: any = await runPocketGeneration({ spindle, loadPreferences, savePreferences, send }, 'scene-planner', `${requestId}:planner`, {
    type: 'quiet',
    messages: [
      { role: 'system', content: 'You are a concise image scene planner. Expand the user brief into one vivid diffusion-ready prompt. Preserve identity facts, subject count, action, camera, environment, lighting, and mood. Do not add names, explanations, headings, negative prompts, or markdown.' },
      { role: 'user', content: `Roleplay context: ${state.weather.location}; ${state.weather.condition}. Visual profile source: ${profile.source}.\nScene brief: ${scene}` },
    ],
    parameters: { temperature: 0.45, max_tokens: 450 },
    reasoning: { source: 'off' },
    userId,
  }, userId)
  return text(response.content, 12_000) || scene
}

async function cameraGenerate(input: AnyRecord, userId?: string): Promise<AnyRecord> {
  if (!spindle.permissions.has('image_gen')) throw new Error('Enable the Image Generation permission to use Camera.')
  const context = await resolveContext(input, userId)
  const state = await loadState(context.chatId, context.characterId, userId)
  const preferences = await loadPreferences(userId)
  const requestId = text(input.requestId, 180) || id('cam')
  const scene = text(input.scene ?? input.prompt ?? input.text ?? input.content, 12_000)
  if (!scene) throw new Error('Describe the scene you want the camera to capture.')
  const contactId = text(input.contactId, 180)
  const portraitContact = contactId ? state.contacts.find(entry => entry.id === contactId) : undefined
  if (contactId && !portraitContact) throw new Error('That contact no longer exists.')
  const purpose: ImagePurpose = portraitContact ? 'contact' : ['character', 'persona', 'draft'].includes(text(input.purpose, 30)) ? input.purpose as ImagePurpose : 'scene'
  const subject = portraitContact ? portraitContact.phoneProfile?.appearance || portraitContact.identityBrief || portraitContact.description : text(input.subject, 2000)
  const profile = await resolveSwarmProfile(context.chatId, context.characterId, preferences, userId)
  const controller = new AbortController()
  const job: CameraJob = { controller, cancelled: false, chatId: context.chatId, characterId: context.characterId, userId }
  const jobKey = `${viewKey(userId)}:${requestId}`
  const previousJob = cameraJobs.get(jobKey)
  if (previousJob) { previousJob.cancelled = true; previousJob.controller.abort() }
  cameraJobs.set(jobKey, job)
  send({ type: 'lumiphone:camera_progress', requestId, phase: 'planning', message: 'Planning the scene…', profile }, userId)
  let expanded = scene
  if (bool(input.enhance, preferences.sceneEnhancer)) {
    try {
      expanded = await enhanceScene(scene, state, preferences, profile, requestId, userId)
    } catch (error) {
      spindle.log.warn(`Pocket scene planner fell back to the original brief: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  if (job.cancelled) return { ok: false, cancelled: true }
  const manual = preferences.manualVisualProfile
  const effective = effectiveImageRequest(expanded, purpose, subject, text(input.aspect, 40), profile, preferences, isRecord(input.parameters) ? input.parameters : {})
  const generationInput: any = { ...effective, owner_character_id: context.characterId === '_none' ? undefined : context.characterId, owner_chat_id: context.chatId === '_lobby' ? undefined : context.chatId, userId, includeDataUrl: false }
  const connectionId = text(input.connectionId, 200) || manual.connectionId
  const model = text(input.model, 500) || profile.checkpoint
  if (connectionId) generationInput.connection_id = connectionId
  if (model) generationInput.model = model
  let result: any = null
  try {
    result = await runImageJob(spindle, generationInput, controller.signal, event => send({ type: 'lumiphone:camera_progress', requestId, ...event }, userId), !connectionId && !text(input.model, 500) && !manual.model ? { chatId: context.chatId, requestId, purpose } : undefined)
  } catch (error) {
    if (!job.cancelled) throw error
  } finally {
    if (cameraJobs.get(jobKey) === job) cameraJobs.delete(jobKey)
  }
  if (job.cancelled) return { ok: false, cancelled: true }
  if (!result) throw new Error('The camera did not return an image.')
  const imageUrl = text(result.imageUrl, 2_000)
  const imageId = text(result.imageId, 200)
  const route: PocketRoute = imageId ? { app: 'gallery', imageId } : { app: 'gallery' }
  await withStateLock(stateKey(context.chatId, context.characterId), async () => {
    const latest = await loadState(context.chatId, context.characterId, userId)
  const notification = addNotification(latest, {
    app: 'camera', title: 'Photo ready', body: scene.slice(0, 180), route, source: 'system', severity: 'important',
  }, userId)
  const command = latest.processedCommands.find((entry) => entry.id === text(input.__commandId, 240))
  const activity = addActivity(latest, {
    kind: 'image', title: 'Photo ready', summary: scene.slice(0, 280), route,
    source: { messageId: text(input.__sourceMessageId, 180) || undefined, imageId: imageId || undefined },
  }, command)
  await saveState(latest, userId)
  if (notification) await maybePush(latest, preferences, notification, userId)
  await sendState(latest, userId, 'camera', false)
  sendActivity(activity, userId)
  sendNotification(notification, userId)
  })
  send({ type: 'lumiphone:camera_done', requestId, imageId, imageUrl, prompt: expanded, profile }, userId)
  return { ok: true, imageId, imageUrl, prompt: expanded, profileSource: profile.source }
}

type NarrativeSeedVisibility = 'public' | 'scene' | 'private'
type NarrativeSeedTtl = 'turn' | 'scene' | 'persistent'
type NarrativeActorStatus = 'available' | 'busy' | 'away' | 'asleep' | 'in_scene' | 'unknown'
type NarrativeActorPresence = 'with_persona' | 'away' | 'unknown'
type NarrativeTimelineScope = 'world' | 'actor'

interface NarrativeSeedWeather {
  condition: string
  location: string
  details: string
}
interface NarrativeSeedClock {
  date: string
  time: string
  dayPart: string
  precision: 'exact' | 'approximate' | 'relative' | 'unknown'
  label: string
}
interface NarrativeSeedWorld {
  setting: string
  facts: string[]
  weather: NarrativeSeedWeather | null
  clock: NarrativeSeedClock
}
interface NarrativeSeedFact {
  text: string
  visibility: NarrativeSeedVisibility
  knownBy: string[]
  actors: string[]
  ttl: NarrativeSeedTtl
}
interface NarrativeSeedActor {
  name: string
  status: NarrativeActorStatus
  presence: NarrativeActorPresence
  activity: string
  location: string
  visibility: NarrativeSeedVisibility
  knownBy: string[]
  ttl: NarrativeSeedTtl
}
interface NarrativeSeedTimeline {
  scope: NarrativeTimelineScope
  title: string
  description: string
  whenText: string
  whenKind: 'exact' | 'approximate' | 'relative' | 'unscheduled'
  actors: string[]
  completed: boolean
  visibility: NarrativeSeedVisibility
  knownBy: string[]
}
interface NarrativeSeedSnapshot {
  version: 4
  sourceKey: string
  sourceMessageIds: string[]
  world: NarrativeSeedWorld
  facts: NarrativeSeedFact[]
  actors: NarrativeSeedActor[]
  timeline: NarrativeSeedTimeline[]
  updatedAt: string
}
interface NarrativeTrackerDelta {
  key: string
  operation: 'set' | 'add' | 'subtract' | 'reset' | 'set_state'
  amount?: number
  state?: string
  reason: string
}

interface PostTurnAuditClock extends NarrativeSeedClock {
  /** Explicit scene advancement relative to the pre-turn Pocket clock. Never inferred from an event age. */
  advanceMinutes: number
}
interface RecoveredPhoneMessage {
  channel: 'dm' | 'gc'
  speaker: string
  target: string
  conversation: string
  text: string
}
interface PostTurnAuditResult {
  clock: PostTurnAuditClock
  phoneMessages: RecoveredPhoneMessage[]
}

const POCKET_CONTINUITY_SEED_VERSION = 4 as const
const narrativeSeedFlights = new Map<string, Promise<NarrativeSeedSnapshot | null>>()

function continuitySeedPath(chatId: string, characterId: string): string {
  return `phones/${stateKey(chatId, characterId)}.continuity-seed.json`
}
function seedStringList(value: unknown, max = 12): string[] {
  const values = (Array.isArray(value) ? value : []).map((entry) => text(entry, 120)).filter(Boolean)
  return values.filter((entry, index) => values.findIndex((other) => normalizeActorName(other) === normalizeActorName(entry)) === index).slice(0, max)
}
function seedVisibility(value: unknown): NarrativeSeedVisibility {
  return value === 'public' || value === 'scene' ? value : 'private'
}
function seedTtl(value: unknown): NarrativeSeedTtl {
  return value === 'persistent' || value === 'scene' ? value : 'turn'
}
function normalizeNarrativeTrackerDeltas(value: unknown): NarrativeTrackerDelta[] {
  const raw = isRecord(value) && Array.isArray(value.trackerOps) ? value.trackerOps : []
  return raw.slice(0, 12).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const key = trackerKey(entry.key, '')
    const operation = entry.operation === 'set' || entry.operation === 'add' || entry.operation === 'subtract' || entry.operation === 'reset' || entry.operation === 'set_state'
      ? entry.operation : ''
    if (!key || !operation) return []
    const amount = Number(entry.amount)
    const state = text(entry.state, 80)
    if ((operation === 'set' || operation === 'add' || operation === 'subtract') && !Number.isFinite(amount)) return []
    if (operation === 'set_state' && !state) return []
    return [{
      key,
      operation,
      amount: Number.isFinite(amount) ? amount : undefined,
      state: state || undefined,
      reason: text(entry.reason, 300) || 'Narrative state reconciliation',
    }]
  })
}
function normalizePostTurnAudit(value: unknown): PostTurnAuditResult {
  const raw = isRecord(value) ? value : {}
  const rawClock = isRecord(raw.clock) ? raw.clock : {}
  const rawAdvance = Number(rawClock.advanceMinutes ?? rawClock.advance_minutes)
  const clock: PostTurnAuditClock = {
    date: /^\d{4}-\d{2}-\d{2}$/.test(text(rawClock.date, 20)) ? text(rawClock.date, 20) : '',
    time: /^\d{2}:\d{2}$/.test(text(rawClock.time, 10)) ? text(rawClock.time, 10) : '',
    dayPart: clockDayPart(rawClock.dayPart ?? rawClock.day_part),
    precision: rawClock.precision === 'exact' || rawClock.precision === 'approximate' || rawClock.precision === 'relative' ? rawClock.precision : 'unknown',
    label: rawClock.precision === 'exact' ? clockLabel(rawClock.label) : clockLabel(rawClock.label, rawClock.dayPart ?? rawClock.day_part),
    advanceMinutes: Number.isFinite(rawAdvance) ? Math.max(-1_440, Math.min(1_440, Math.round(rawAdvance))) : 0,
  }
  const rawMessages = Array.isArray(raw.phoneMessages) ? raw.phoneMessages : Array.isArray(raw.phone_messages) ? raw.phone_messages : []
  const phoneMessages = rawMessages.slice(0, 4).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const channel: RecoveredPhoneMessage['channel'] = entry.channel === 'gc' || entry.channel === 'group' ? 'gc' : 'dm'
    const speaker = text(entry.speaker, 120)
    const target = text(entry.target, 120)
    const conversation = text(entry.conversation ?? entry.conversationTitle ?? entry.conversation_title, 120)
    const body = text(entry.text ?? entry.message ?? entry.content, 12_000)
    if (!speaker || !body) return []
    if (channel === 'dm' && !target) return []
    if (channel === 'gc' && !conversation) return []
    return [{ channel, speaker, target, conversation, text: body }]
  })
  return { clock, phoneMessages }
}

function compactStableHash(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(36)
}
function normalizeNarrativeSeed(value: unknown, sourceKey = '', sourceMessageIds: string[] = []): NarrativeSeedSnapshot {
  const raw = isRecord(value) ? value : {}
  const rawWorld = isRecord(raw.world) ? raw.world : {}
  const rawWeather = isRecord(rawWorld.weather) ? rawWorld.weather : null
  const rawClock = isRecord(rawWorld.clock) ? rawWorld.clock : {}
  const worldFacts = (Array.isArray(rawWorld.facts) ? rawWorld.facts : [])
    .map((entry) => text(entry, 360))
    .filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index)
    .slice(0, 8)

  const world: NarrativeSeedWorld = {
    setting: text(rawWorld.setting, 360),
    facts: worldFacts,
    weather: rawWeather
      ? {
          condition: text(rawWeather.condition, 120),
          location: text(rawWeather.location, 180),
          details: text(rawWeather.details, 360),
        }
      : null,
    clock: {
      date: /^\d{4}-\d{2}-\d{2}$/.test(text(rawClock.date, 20)) ? text(rawClock.date, 20) : '',
      time: /^\d{2}:\d{2}$/.test(text(rawClock.time, 10)) ? text(rawClock.time, 10) : '',
      dayPart: clockDayPart(rawClock.dayPart),
      precision: rawClock.precision === 'exact' || rawClock.precision === 'approximate' || rawClock.precision === 'relative'
        ? rawClock.precision : 'unknown',
      label: rawClock.precision === 'exact' ? clockLabel(rawClock.label) : clockLabel(rawClock.label, rawClock.dayPart),
    },
  }

  const facts: NarrativeSeedFact[] = (Array.isArray(raw.facts) ? raw.facts : []).slice(0, 10).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const body = text(entry.text ?? entry.fact, 360)
    const actors = seedStringList(entry.actors)
    // Ambiguous actorless facts are intentionally dropped. World facts have an
    // explicit home at world.facts; "forgot to scope it" never becomes global.
    if (!body || !actors.length) return []
    return [{
      text: body,
      visibility: seedVisibility(entry.visibility),
      knownBy: seedStringList(entry.knownBy ?? entry.known_by),
      actors,
      ttl: seedTtl(entry.ttl),
    }]
  })

  const rawActors = Array.isArray(raw.actors) ? raw.actors : Array.isArray(raw.actorUpdates) ? raw.actorUpdates : []
  const actors: NarrativeSeedActor[] = rawActors.slice(0, 12).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const name = text(entry.name, 120)
    if (!name) return []
    const status: NarrativeActorStatus =
      entry.status === 'available' || entry.status === 'busy' || entry.status === 'away' || entry.status === 'asleep' || entry.status === 'in_scene'
        ? entry.status : 'unknown'
    return [{
      name,
      status,
      presence: entry.presence === 'with_persona' || entry.presence === 'away'
        ? entry.presence
        : status === 'in_scene' ? 'with_persona' : 'unknown',
      activity: text(entry.activity, 260),
      location: text(entry.location, 180),
      visibility: seedVisibility(entry.visibility),
      knownBy: seedStringList(entry.knownBy ?? entry.known_by),
      ttl: seedTtl(entry.ttl),
    }]
  })

  const timeline: NarrativeSeedTimeline[] = (Array.isArray(raw.timeline) ? raw.timeline : []).slice(0, 6).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const title = text(entry.title ?? entry.event, 180)
    if (!title) return []
    const scope: NarrativeTimelineScope = entry.scope === 'world' ? 'world' : 'actor'
    const actors = seedStringList(entry.actors, 8)
    // Actor-scoped events without subjects are ambiguous and stay out.
    if (scope === 'actor' && !actors.length) return []
    const whenKind: NarrativeSeedTimeline['whenKind'] =
      entry.whenKind === 'exact' || entry.whenKind === 'approximate' || entry.whenKind === 'relative' ? entry.whenKind : 'unscheduled'
    return [{
      scope,
      title,
      description: text(entry.description, 500),
      whenText: text(entry.whenText ?? entry.when, 180) || 'Unscheduled',
      whenKind,
      actors: scope === 'world' ? [] : actors,
      completed: entry.completed === true,
      visibility: seedVisibility(entry.visibility),
      knownBy: seedStringList(entry.knownBy ?? entry.known_by),
    }]
  })

  return {
    version: POCKET_CONTINUITY_SEED_VERSION,
    sourceKey: text(raw.sourceKey, 1_600) || sourceKey,
    sourceMessageIds: seedStringList(raw.sourceMessageIds, 8).length ? seedStringList(raw.sourceMessageIds, 8) : sourceMessageIds.slice(-8),
    world,
    facts,
    actors,
    timeline,
    updatedAt: text(raw.updatedAt, 40) || nowIso(),
  }
}
function mergeNarrativeSeed(previous: NarrativeSeedSnapshot | null, fresh: NarrativeSeedSnapshot): NarrativeSeedSnapshot {
  const factMap = new Map<string, NarrativeSeedFact>()
  const actorMap = new Map<string, NarrativeSeedActor>()

  for (const entry of (previous?.facts || []).filter((item) => item.ttl !== 'turn')) factMap.set(entry.text.toLocaleLowerCase(), entry)
  for (const entry of fresh.facts) factMap.set(entry.text.toLocaleLowerCase(), entry)
  for (const entry of (previous?.actors || []).filter((item) => item.ttl !== 'turn')) actorMap.set(normalizeActorName(entry.name), entry)
  for (const entry of fresh.actors) actorMap.set(normalizeActorName(entry.name), entry)

  const previousWorldFacts = previous?.world?.facts || []
  const worldFacts = [...previousWorldFacts, ...fresh.world.facts]
    .filter((entry, index, all) => Boolean(entry) && all.findIndex((other) => other.toLocaleLowerCase() === entry.toLocaleLowerCase()) === index)
    .slice(-10)

  return {
    ...fresh,
    world: {
      setting: fresh.world.setting || previous?.world?.setting || '',
      facts: worldFacts,
      weather: fresh.world.weather || previous?.world?.weather || null,
      clock: (fresh.world.clock.time || fresh.world.clock.dayPart || fresh.world.clock.label)
        ? fresh.world.clock
        : previous?.world?.clock || fresh.world.clock,
    },
    facts: [...factMap.values()].slice(-12),
    actors: [...actorMap.values()].slice(-16),
  }
}
function narrativeSeedSourceKey(messages: any[]): string {
  return messages.map((message, index) => {
    const idPart = text(message?.id, 180) || `row-${index}`
    return `${idPart}:${String(message?.revision ?? '')}:${text(message?.role, 20)}:${sanitizeNarrativeContent(message?.content, 180)}`
  }).join('|').slice(0, 1_600)
}
function seedVisibleTo(entry: { visibility: NarrativeSeedVisibility; knownBy: string[] }, speakerName: string): boolean {
  if (entry.visibility === 'public') return true
  const speaker = normalizeActorName(speakerName)
  return Boolean(speaker && entry.knownBy.some((name) => normalizeActorName(name) === speaker))
}
function narrativeSeedContext(seed: NarrativeSeedSnapshot | null, speakerName = '', participantNames: string[] = []): string {
  if (!seed) return ''

  const speaker = normalizeActorName(speakerName)
  const participants = new Set(participantNames.map(normalizeActorName).filter(Boolean))
  if (speaker) participants.add(speaker)

  const intersectsParticipants = (actors: string[]): boolean =>
    actors.some((name) => participants.has(normalizeActorName(name)))

  const facts = seed.facts.filter((entry) => {
    if (!intersectsParticipants(entry.actors)) return false
    return seedVisibleTo(entry, speakerName)
      || Boolean(speaker && entry.actors.some((name) => normalizeActorName(name) === speaker))
  }).slice(-8)

  const actors = seed.actors.filter((entry) => {
    if (!participants.has(normalizeActorName(entry.name))) return false
    return seedVisibleTo(entry, speakerName)
      || Boolean(speaker && normalizeActorName(entry.name) === speaker)
  }).slice(-8)

  const timeline = seed.timeline.filter((entry) => {
    if (!seedVisibleTo(entry, speakerName)) return false
    return entry.scope === 'world' || intersectsParticipants(entry.actors)
  }).slice(-4)

  const worldLines = [
    seed.world.setting ? `Setting: ${seed.world.setting}` : '',
    seed.world.clock.label || seed.world.clock.time || seed.world.clock.dayPart
      ? `Narrative time: ${seed.world.clock.label || [seed.world.clock.date, seed.world.clock.time, seed.world.clock.dayPart].filter(Boolean).join(' ')} (${seed.world.clock.precision})`
      : '',
    ...seed.world.facts.map((entry) => `World fact: ${entry}`),
    seed.world.weather?.condition
      ? `Weather: ${seed.world.weather.condition}${seed.world.weather.location ? ` at ${seed.world.weather.location}` : ''}${seed.world.weather.details ? `; ${seed.world.weather.details}` : ''}`
      : '',
  ].filter(Boolean)

  return [
    'WORLD STATE — SHARED SETTING, NOT ACTOR ROUTING',
    ...worldLines,
    '',
    'CURRENT PHONE PARTICIPANTS ONLY: ' + participantNames.filter(Boolean).join(', '),
    'Actor-specific continuity about anyone outside this channel is intentionally omitted.',
    ...facts.map((entry) => `Actor fact: ${entry.text}`),
    ...actors.map((entry) => `Actor status: ${entry.name} — ${entry.status}${entry.activity ? `; ${entry.activity}` : ''}${entry.location ? `; at ${entry.location}` : ''}`),
    ...timeline.map((entry) => `Timeline: ${entry.whenText} — ${entry.title}`),
  ].filter((entry, index, all) => Boolean(entry) || (index > 0 && index < all.length - 1)).join('\n').slice(0, 2_800)
}
function seedActorContactIds(state: PhoneState, names: string[]): string[] {
  const wanted = new Set(names.map(normalizeActorName).filter(Boolean))
  return state.contacts.filter((contact) => wanted.has(normalizeActorName(contact.name))).map((contact) => contact.id).slice(0, 8)
}
function narrativeClockIso(state: PhoneState, clock: NarrativeSeedClock): string | null {
  if (clock.precision !== 'exact' || !/^\d{2}:\d{2}$/.test(clock.time)) return null
  const timezoneOffset = Number(state.roleplayTimezoneOffsetMinutes)
  if (!Number.isFinite(timezoneOffset)) return null
  const [hour, minute] = clock.time.split(':').map(Number)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  let year: number
  let month: number
  let day: number
  if (/^\d{4}-\d{2}-\d{2}$/.test(clock.date)) {
    ;[year, month, day] = clock.date.split('-').map(Number)
  } else {
    const current = new Date(state.roleplayNow)
    if (Number.isNaN(current.getTime())) return null
    const local = new Date(current.getTime() - timezoneOffset * 60_000)
    year = local.getUTCFullYear()
    month = local.getUTCMonth() + 1
    day = local.getUTCDate()
  }
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) + timezoneOffset * 60_000
  const result = new Date(utcMs)
  return Number.isNaN(result.getTime()) ? null : result.toISOString()
}

function applyNarrativeClock(state: PhoneState, clock: NarrativeSeedClock): boolean {
  const explicitExact = clock.precision === 'exact' && /^\d{2}:\d{2}$/.test(clock.time)
  if (state.roleplayClockSource === 'manual' && !explicitExact) return false
  const hasEvidence = Boolean(clock.time || clock.dayPart || clock.label)
  if (!hasEvidence) return false

  let changed = false
  const nextExact = narrativeClockIso(state, clock)
  if (nextExact && nextExact !== state.roleplayNow) {
    state.trackers = state.trackers.map((tracker) => materializeTracker(tracker, nextExact).tracker)
    state.roleplayNow = nextExact
    changed = true
  }
  const nextPrecision = clock.precision
  const nextLabel = clock.label || [clock.date, clock.time, clock.dayPart].filter(Boolean).join(' ')
  if (state.roleplayClockSource !== 'narrative') { state.roleplayClockSource = 'narrative'; changed = true }
  if (state.roleplayClockPrecision !== nextPrecision) { state.roleplayClockPrecision = nextPrecision; changed = true }
  if (state.roleplayClockLabel !== nextLabel) { state.roleplayClockLabel = nextLabel; changed = true }
  return changed
}

function deriveCandidateClockFromAudit(state: PhoneState, baseline: PocketRoleplayClockSnapshot, audit: PostTurnAuditClock): PocketRoleplayClockSnapshot {
  const explicitExact = audit.precision === 'exact' && /^\d{2}:\d{2}$/.test(audit.time)
  if (audit.advanceMinutes) {
    const baseMs = Date.parse(baseline.roleplayNow)
    if (Number.isFinite(baseMs)) {
      const roleplayNow = new Date(baseMs + audit.advanceMinutes * 60_000).toISOString()
      const exactBaseline = baseline.precision === 'exact' || baseline.source === 'manual'
      return {
        roleplayNow,
        source: 'narrative',
        precision: exactBaseline ? 'exact' : 'relative',
        label: audit.label || (exactBaseline ? formatRoleplayClockLabel(roleplayNow, state.roleplayTimezoneOffsetMinutes) : `${audit.advanceMinutes > 0 ? '+' : ''}${audit.advanceMinutes} minutes`),
      }
    }
  }
  if (explicitExact) {
    const temp = { ...state, roleplayNow: baseline.roleplayNow } as PhoneState
    const roleplayNow = narrativeClockIso(temp, audit) || baseline.roleplayNow
    return {
      roleplayNow, source: 'narrative', precision: 'exact',
      label: audit.label || formatRoleplayClockLabel(roleplayNow, state.roleplayTimezoneOffsetMinutes) || [audit.date, audit.time].filter(Boolean).join(' '),
    }
  }
  const hasEvidence = Boolean(audit.time || audit.dayPart || audit.label)
  if (!hasEvidence || baseline.source === 'manual') return { ...baseline }
  return {
    roleplayNow: baseline.roleplayNow, source: 'narrative', precision: audit.precision,
    label: audit.label || [audit.date, audit.time, audit.dayPart].filter(Boolean).join(' '),
  }
}

function hostMessageCandidateContent(message: any, swipeId: number, max = 120_000): string {
  const swipes = Array.isArray(message?.swipes) ? message.swipes : []
  if (typeof swipes[swipeId] === 'string') return text(swipes[swipeId], max)
  const displayedSwipeId = Number.isInteger(message?.swipe_id) ? Number(message.swipe_id) : swipeId
  return displayedSwipeId === swipeId ? text(message?.content, max) : ''
}

function candidateMessagesForOrigin(state: PhoneState, origin: PocketTurnCandidateOrigin): Array<{ conversation: string; speaker: string; recipients: string[]; text: string }> {
  const rows: Array<{ conversation: string; speaker: string; recipients: string[]; text: string }> = []
  for (const conversation of state.conversations) {
    for (const message of conversation.messages) {
      const messageOrigin = message.origin
      if (!messageOrigin || messageOrigin.chatId !== origin.chatId || messageOrigin.hostMessageId !== origin.hostMessageId || messageOrigin.swipeId !== origin.swipeId) continue
      rows.push({
        conversation: conversation.title,
        speaker: message.senderName,
        recipients: (message.recipientActorIds || []).map((actorId) => resolvePocketActor(state, actorId)?.name || (actorId === pocketPersonaActorId(state) ? state.pocketPersona.displayName : '')).filter(Boolean),
        text: message.text,
      })
    }
  }
  return rows.slice(-12)
}

function narrativeLikelyContainsPhoneAction(value: string): boolean {
  return /\b(?:text(?:ed|ing|s)?|message(?:d|s|ing)?|dm(?:ed|s|ing)?|phone|screen|notification|reply|replied|sent|send|another\s+text|group\s*chat|gc)\b/i.test(value)
}

async function reconcilePostTurnCandidate(
  chatId: string,
  characterId: string,
  origin: PocketTurnCandidateOrigin,
  generationType: string,
  userId?: string,
  options: { auditClock: boolean } = { auditClock: false },
): Promise<void> {
  if (!spindle.permissions.has('generation') || !spindle.permissions.has('chat_mutation')) return
  const hostMessages: any[] = await spindle.chat.getMessages(chatId).catch(() => [])
  const current = hostMessages.find((message) => text(message?.id, 180) === origin.hostMessageId)
  const currentNarrative = sanitizeNarrativeContent(hostMessageCandidateContent(current, origin.swipeId, 12_000), 6_000)
  if (!currentNarrative) return

  const state = await loadState(chatId, characterId, userId)
  const persisted = candidateMessagesForOrigin(state, origin)
  if (!options.auditClock && !persisted.length && !narrativeLikelyContainsPhoneAction(currentNarrative)) return

  const currentIndex = hostMessages.findIndex((message) => text(message?.id, 180) === origin.hostMessageId)
  const contextMessages = (currentIndex >= 0 ? hostMessages.slice(Math.max(0, currentIndex - 3), currentIndex + 1) : [current])
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
  const recentNarrative = contextMessages.map((message, index) => {
    const role = message?.role === 'assistant' ? 'ASSISTANT' : 'USER'
    const sourceContent = text(message?.id, 180) === origin.hostMessageId
      ? hostMessageCandidateContent(message, origin.swipeId, 4_000)
      : message?.content
    return `${role} [${index + 1}]: ${sanitizeNarrativeContent(sourceContent, 1_500)}`
  }).join('\n\n').slice(-6_000)
  const baseline = [...(state.hostClockBaselines || [])].reverse().find((entry) => entry.hostMessageId === origin.hostMessageId) || {
    hostMessageId: origin.hostMessageId, ...roleplayClockSnapshot(state), updatedAt: nowIso(),
  }

  const parsed = await runStructuredGeneration('post-turn-audit', id('post_turn_audit'), {
    type: 'quiet',
    messages: [
      { role: 'system', content: `Audit one committed fictional roleplay assistant turn for two narrowly-scoped things: narrative clock evidence and phone messages that were written into prose but not persisted through Pocket.

Return strict JSON only:
{
  "clock":{"date":"YYYY-MM-DD or empty","time":"HH:MM or empty","dayPart":"${CLOCK_DAY_PART_KEYS.join('|')} or empty","precision":"exact|approximate|relative|unknown","label":"HH:MM only for exact time; otherwise empty","advanceMinutes":0},
  "phoneMessages":[{"channel":"dm|gc","speaker":"exact actor name","target":"exact DM recipient or empty for gc","conversation":"exact group title or empty for dm","text":"exact message body"}]
}

CLOCK RULES:
- The PRE-TURN CLOCK is an anchor, not narrative evidence. Never copy it into clock merely because it exists.
- exact requires an explicit current-scene clock time in the supplied narrative. Do not invent minutes.
- advanceMinutes is ONLY for explicit elapsed scene progression inside the CURRENT ASSISTANT TURN, e.g. "ten minutes later" or "an hour passed". Sum multiple explicit forward/backward scene advances when clear.
- Do NOT use event ages or retrospective phrases such as "he was asleep twenty minutes ago" as scene advancement.
- Approximate evidence must use a listed dayPart key and an empty label. Never put scenery, sentences, or descriptions in clock fields. Relative elapsed time uses advanceMinutes; do not invent a day part.

PHONE RECOVERY RULES:
- Inspect only phone messages newly authored as events in CURRENT ASSISTANT TURN.
- ALREADY PERSISTED messages already succeeded; NEVER return them again, even if the prose repeats or paraphrases them.
- Recover only messages that the prose clearly depicts as actually sent, received, or observed. Omit plans, hypotheticals, remembered/history quotes, and messages merely being read from prior context.
- Preserve the authored message body as closely as possible. Do not improve or rewrite it.
- A phrase such as "another text" may inherit the immediately preceding sender/recipient/thread only when the same-turn context makes that inheritance unambiguous. Otherwise omit it.
- DM requires both speaker and target. GC requires speaker and an existing group title.
- Return at most four missing phone messages. When uncertain, omit.` },
      { role: 'user', content: `GENERATION TYPE: ${generationType || 'unknown'}

PRE-TURN CLOCK — ANCHOR ONLY:
${JSON.stringify(baseline)}

ALREADY PERSISTED POCKET MESSAGES FOR THIS CANDIDATE:
${JSON.stringify(persisted)}

RECENT NARRATIVE CONTEXT:
${recentNarrative}

CURRENT ASSISTANT TURN — AUDIT THIS TURN FOR MISSING PHONE MESSAGES:
${currentNarrative}` },
    ],
    parameters: { temperature: 0.02, max_tokens: 700 },
    userId,
  }, userId)
  const audit = normalizePostTurnAudit(parsed)

  if (options.auditClock) {
    await withStateLock(stateKey(chatId, characterId), async () => {
      const latest = await loadState(chatId, characterId, userId)
      const latestBaseline = [...(latest.hostClockBaselines || [])].reverse().find((entry) => entry.hostMessageId === origin.hostMessageId) || baseline
      const nextClock = deriveCandidateClockFromAudit(latest, latestBaseline, audit.clock)
      const snapshotChanged = storeCandidateClock(latest, origin, nextClock)
      const selected = selectedHostSwipe(latest, origin.hostMessageId)
      const activeChanged = selected === origin.swipeId ? applyRoleplayClockSnapshot(latest, nextClock) : false
      if (!snapshotChanged && !activeChanged) return
      await saveState(latest, userId)
      await sendState(latest, userId, 'candidate_clock_reconciled')
    })
  }

  for (const [index, recovered] of audit.phoneMessages.entries()) {
    const payload: AnyRecord = recovered.channel === 'gc'
      ? { channel: 'gc', speaker: recovered.speaker, conversation: recovered.conversation, text: recovered.text }
      : { channel: 'dm', speaker: recovered.speaker, target: recovered.target, text: recovered.text }
    const recoveryKey = `postturn:${origin.hostMessageId}:${origin.swipeId}:${compactStableHash(JSON.stringify(payload))}`.slice(0, 240)
    try {
      await applyAction({
        action: 'message', chat_id: chatId, character_id: characterId, payload, idempotencyKey: recoveryKey,
        messageId: origin.hostMessageId, __candidateOrigin: origin, __candidateCommitted: true, __recoveredFromNarrative: true, recoveryIndex: index,
      }, userId, 'model')
    } catch (error) {
      spindle.log.warn(`Pocket post-turn phone recovery skipped one message: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

function resolveEventParticipants(
  state: PhoneState,
  rawNames: unknown,
): { actorIds: string[]; contactIds: string[]; names: string[] } {
  const names = (Array.isArray(rawNames) ? rawNames : [])
    .map((entry) => text(entry, 120).replace(/\s+/g, ' '))
    .filter((entry, index, all) => Boolean(entry) && all.findIndex((other) => normalizeActorName(other) === normalizeActorName(entry)) === index)
    .slice(0, 16)
  const actorIds: string[] = []
  const contactIds: string[] = []
  const now = nowIso()

  for (const name of names) {
    if (normalizeActorName(name) === normalizeActorName(state.pocketPersona.displayName)) {
      const personaId = personaMemoryActorId(state)
      if (!actorIds.includes(personaId)) actorIds.push(personaId)
      continue
    }

    const matches = matchingActorIds(state, name)
    const actorId = matches[0] || ensureDiscoveredActor(state, {
      name,
      source: 'messages',
      now,
      makeId: id,
    }).id

    if (!actorIds.includes(actorId)) actorIds.push(actorId)
    const actor = resolvePocketActor(state, actorId)
    if (actor?.contact && !contactIds.includes(actor.contact.id)) contactIds.push(actor.contact.id)
  }

  return { actorIds, contactIds, names }
}

function messageSuggestion(
  conversation: PocketConversation,
  messageId: string,
): { message: PhoneMessage; suggestion: NonNullable<PhoneMessage['eventSuggestion']> } | null {
  const message = conversation.messages.find((entry) => entry.id === messageId)
  if (!message?.eventSuggestion) return null
  return { message, suggestion: message.eventSuggestion }
}


function phoneMessageTimestamp(state: PhoneState): string {
  const candidate = text(state.roleplayNow, 80)
  return Number.isFinite(Date.parse(candidate)) ? candidate : nowIso()
}

function continuityEventKey(item: NarrativeSeedTimeline): string {
  const subject = item.scope === 'actor'
    ? item.actors.map(normalizeActorName).filter(Boolean).sort().join('|')
    : 'world'
  return [
    item.scope,
    normalizeActorName(item.title),
    subject,
  ].join(':').slice(0, 500)
}

function seededEventLane(event: CalendarEvent): boolean {
  return event.createdBy === 'model' && (event.lane === 'Continuity' || event.lane === 'Current goal')
}
function applyNarrativeActorPresence(state: PhoneState, actors: NarrativeSeedActor[], updatedAt: string): boolean {
  let changed = false
  for (const item of actors) {
    if (item.presence === 'unknown') continue
    const matchedContactIds = new Set<string>()
    for (const actorId of matchingActorIds(state, item.name)) {
      const contact = resolvePocketActor(state, actorId)?.contact
      if (!contact || matchedContactIds.has(contact.id)) continue
      matchedContactIds.add(contact.id)
      const nextInScene = item.presence === 'with_persona'
      if (contact.presence.inScene !== nextInScene) {
        contact.presence.inScene = nextInScene
        if (nextInScene) contact.presence.lastSceneAt = updatedAt
        changed = true
      }
      const nextSceneNote = nextInScene ? [item.activity, item.location].filter(Boolean).join(' — ').slice(0, 600) : ''
      if (contact.sceneNote !== nextSceneNote && (nextSceneNote || item.presence === 'away')) {
        contact.sceneNote = nextSceneNote
        changed = true
      }
      reconcileContactAvailability(state, contact)
    }
  }
  return changed
}
function applyNarrativeTrackerDeltas(state: PhoneState, deltas: NarrativeTrackerDelta[], updatedAt: string): boolean {
  let changed = false
  for (const delta of deltas) {
    const index = state.trackers.findIndex((tracker) => tracker.key === delta.key && tracker.allowModelWrite && tracker.updateMode === 'model')
    if (index < 0) continue
    const tracker = state.trackers[index]
    try {
      const next = applyTrackerOperation(tracker, {
        operation: delta.operation,
        amount: delta.amount,
        state: delta.state,
        reason: delta.reason,
        source: 'model',
        now: updatedAt,
        roleplayNow: state.roleplayClockSource === 'narrative' && state.roleplayClockPrecision !== 'exact' ? undefined : state.roleplayNow,
      })
      if (next !== tracker) {
        state.trackers[index] = next
        changed = true
      }
    } catch (error) {
      spindle.log.warn(`Pocket ignored invalid narrative tracker delta for ${delta.key}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return changed
}
function applyNarrativeSeedState(state: PhoneState, seed: NarrativeSeedSnapshot): boolean {
  let changed = applyNarrativeClock(state, seed.world.clock)

  const weather = seed.world.weather
  if (weather) {
    const nextCondition = weather.condition || state.weather.condition
    const nextLocation = weather.location || state.weather.location
    const nextDetails = weather.details || state.weather.details
    if (state.weather.condition !== nextCondition || state.weather.location !== nextLocation || state.weather.details !== nextDetails) {
      state.weather.outlook = undefined
      state.weather.condition = nextCondition
      state.weather.location = nextLocation
      state.weather.details = nextDetails
      state.weather.updatedAt = seed.updatedAt
      changed = true
    }
  }

  for (const item of seed.timeline) {
    const actorContactIds = item.scope === 'actor' ? seedActorContactIds(state, item.actors) : []
    const continuityKey = continuityEventKey(item)
    const normalizedTitle = normalizeActorName(item.title)

    // New rows use continuityKey. For pre-v6.12 rows, migrate only model-created
    // Continuity/Current-goal rows with the same title. This intentionally ignores
    // whenText because "Today" vs "Later today" is wording drift, not a new event.
    const candidates = state.events.filter((event) =>
      event.continuityKey === continuityKey
      || (!event.continuityKey && seededEventLane(event) && normalizeActorName(event.title) === normalizedTitle)
    )
    const existing = candidates.find((event) => event.lane === 'Current goal') || candidates[0]

    if (existing) {
      existing.continuityKey = continuityKey
      existing.title = item.title
      existing.description = item.description || existing.description
      existing.whenKind = item.whenKind
      existing.whenText = item.whenText
      existing.actorContactIds = actorContactIds.length ? actorContactIds : existing.actorContactIds
      existing.completed = existing.completed || item.completed

      // Collapse only duplicate model-seeded siblings for this current seed item.
      const duplicateIds = new Set(candidates.filter((event) => event.id !== existing.id).map((event) => event.id))
      if (duplicateIds.size) state.events = state.events.filter((event) => !duplicateIds.has(event.id))
      changed = true
      continue
    }

    const firstContact = actorContactIds.length ? state.contacts.find((contact) => contact.id === actorContactIds[0]) : undefined
    const start = state.roleplayNow || seed.updatedAt
    state.events.push({
      id: id('evt'),
      title: item.title,
      description: item.description,
      start,
      end: start,
      whenKind: item.whenKind,
      whenText: item.whenText,
      color: firstContact ? contactAccent(firstContact) : '#8b7dff',
      lane: 'Continuity',
      completed: item.completed,
      createdBy: 'model',
      actorContactIds,
      continuityKey,
    })
    changed = true
  }
  if (changed) state.events = state.events.slice(-MAX_EVENTS)
  return changed
}
function applySetupCurrentGoal(state: PhoneState, seed: NarrativeSeedSnapshot): boolean {
  const activeGoal = state.events.find((event) => event.lane === 'Current goal' && !event.completed)
  if (activeGoal) return false

  const persona = normalizeActorName(state.pocketPersona.displayName)
  const actorGoal = seed.timeline.find((item) =>
    item.scope === 'actor'
    && item.actors.some((name) => normalizeActorName(name) === persona)
  )
  const worldGoal = seed.timeline.find((item) => item.scope === 'world')
  const candidate = actorGoal || worldGoal
  if (!candidate) return false

  const candidateKey = continuityEventKey(candidate)
  const matchingEvent = state.events.find((event) =>
    event.continuityKey === candidateKey
    || (!event.continuityKey && seededEventLane(event) && normalizeActorName(event.title) === normalizeActorName(candidate.title))
  )
  if (matchingEvent) {
    matchingEvent.continuityKey = candidateKey
    matchingEvent.lane = 'Current goal'
    matchingEvent.completed = false
    return true
  }

  const actorContactIds = candidate.scope === 'actor' ? seedActorContactIds(state, candidate.actors) : []
  const firstContact = actorContactIds.length ? state.contacts.find((contact) => contact.id === actorContactIds[0]) : undefined
  const start = state.roleplayNow || seed.updatedAt
  state.events.push({
    id: id('evt'),
    title: candidate.title,
    description: candidate.description,
    start,
    end: start,
    whenKind: candidate.whenKind,
    whenText: candidate.whenText,
    color: firstContact ? contactAccent(firstContact) : '#8b7dff',
    lane: 'Current goal',
    completed: false,
    createdBy: 'model',
    actorContactIds,
    continuityKey: candidateKey,
  })
  state.events = state.events.slice(-MAX_EVENTS)
  return true
}

async function loadNarrativeSeed(chatId: string, characterId: string, userId?: string): Promise<NarrativeSeedSnapshot | null> {
  const raw = await spindle.userStorage.getJson<unknown>(continuitySeedPath(chatId, characterId), { fallback: null, userId })
  if (!isRecord(raw)) return null
  if (raw.version !== POCKET_CONTINUITY_SEED_VERSION) {
    spindle.log.info(`Pocket continuity seed cache invalidated (stored v${String(raw.version ?? 'legacy')} → world-seed v${POCKET_CONTINUITY_SEED_VERSION}).`)
    return null
  }
  return normalizeNarrativeSeed(raw)
}
async function refreshNarrativeSeed(chatId: string, characterId: string, userId?: string, options: { generationId?: string; messageId?: string } = {}): Promise<NarrativeSeedSnapshot | null> {
  if (!chatId || chatId === '_lobby' || !spindle.permissions.has('generation') || !spindle.permissions.has('chat_mutation')) {
    return loadNarrativeSeed(chatId, characterId, userId)
  }

  const flightKey = `${viewKey(userId)}:${stateKey(chatId, characterId)}:continuity`
  const existingFlight = narrativeSeedFlights.get(flightKey)
  if (existingFlight) return existingFlight

  const flight = (async () => {
    const hostMessages: any[] = await spindle.chat.getMessages(chatId).catch(() => [])
    const sourceMessages = hostMessages
      .filter((message) => (message?.role === 'user' || message?.role === 'assistant') && sanitizeNarrativeContent(message?.content, 1))
      .slice(-4)
    if (!sourceMessages.length) return loadNarrativeSeed(chatId, characterId, userId)

    const sourceKey = `v${POCKET_CONTINUITY_SEED_VERSION}:${narrativeSeedSourceKey(sourceMessages)}`
    const sourceMessageIds = sourceMessages.map((message) => text(message?.id, 180)).filter(Boolean).slice(-8)
    const previous = await loadNarrativeSeed(chatId, characterId, userId)
    const state = await loadState(chatId, characterId, userId)
    if (previous?.sourceKey === sourceKey && state.lastReconciliation?.sourceKey === sourceKey) return previous
    const knownActors = [
      state.pocketPersona.displayName,
      state.characterName,
      ...state.contacts.map((contact) => contact.name),
    ].filter((name, index, all) => Boolean(name) && all.findIndex((other) => normalizeActorName(other) === normalizeActorName(name)) === index).slice(0, 40)

    const recentNarrative = sourceMessages.map((message, index) => {
      const role = message?.role === 'assistant' ? 'ASSISTANT NARRATIVE' : 'USER NARRATIVE'
      return `${role} [${index + 1}]: ${narrativeExcerpt(message?.content, 2_600)}`
    }).join('\n\n').slice(-10_400)
    const timelineSnapshot = structuredClone(state.events.filter(event => !event.completed).slice(0, 16))
    const modelWritableTrackers = state.trackers
      .filter((tracker) => tracker.allowModelWrite && tracker.updateMode === 'model')
      .slice(0, 12)
      .map((tracker) => ({
        key: tracker.key,
        label: tracker.label,
        updateGuidance: tracker.modelPrompt || undefined,
        kind: tracker.kind,
        value: tracker.kind === 'state' ? tracker.state : tracker.value,
        min: tracker.kind === 'state' ? undefined : tracker.min,
        max: tracker.kind === 'state' ? undefined : tracker.max,
        states: tracker.kind === 'state' ? tracker.states : undefined,
        target: tracker.target.label || tracker.target.id || tracker.target.type,
      }))
    const currentStateAdvisory = {
      clock: {
        roleplayNow: state.roleplayNow,
        source: state.roleplayClockSource || 'legacy',
        precision: state.roleplayClockPrecision || 'unknown',
        label: state.roleplayClockLabel || '',
      },
      weather: {
        location: state.weather.location,
        condition: state.weather.condition,
        details: state.weather.details,
      },
      inSceneActors: state.contacts.filter((contact) => contact.presence.inScene).map((contact) => contact.name).slice(0, 16),
      activeTimeline: timelineSnapshot.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        whenText: event.whenText,
        actorContactIds: event.actorContactIds,
      })),
      previousWorld: previous?.world || null,
    }
    const parsed = await runStructuredGeneration('continuity-seed', id('continuity_seed'), {
      type: 'quiet',
      messages: [
        {
          role: 'system',
          content: `Extract a small structured RP WORLD STATE delta from recent fictional roleplay prose. This is NOT a phone conversation and nobody in the prose becomes a phone recipient.

Return strict JSON only:
{
  "world":{
    "setting":"short shared setting/location/era if explicitly established, else empty",
    "clock":{"date":"YYYY-MM-DD only if narratively established, else empty","time":"HH:MM 24-hour only if an explicit narrative clock time is established, else empty","dayPart":"${CLOCK_DAY_PART_KEYS.join('|')} or empty if not established","precision":"exact|approximate|relative|unknown","label":"HH:MM only for exact time; otherwise empty"},
    "facts":["genuinely actor-neutral shared world/group facts only"],
    "weather":{"condition":"short condition","location":"where it applies","details":"short atmospheric detail"} | null
  },
  "facts":[{"text":"actor-specific factual state","visibility":"public|scene|private","knownBy":["exact actor names"],"actors":["REQUIRED subject actor names"],"ttl":"turn|scene|persistent"}],
  "actors":[{"name":"exact known actor name","status":"available|busy|away|asleep|in_scene|unknown","presence":"with_persona|away|unknown","activity":"short current activity","location":"short location","visibility":"public|scene|private","knownBy":["exact actor names"],"ttl":"turn|scene|persistent"}],
  "timeline":[{"scope":"world|actor","title":"event/beat","description":"short detail","whenText":"Now|Later today|Tomorrow|etc","whenKind":"exact|approximate|relative|unscheduled","actors":["REQUIRED when scope=actor; empty when scope=world"],"completed":false,"visibility":"public|scene|private","knownBy":["exact actor names"]}],
  "eventUpdates":[{"id":"existing activeTimeline id","description":"established context or resolution","completed":true,"evidence":"exact quotation from RECENT NARRATIVE, at least 12 characters"}],
  "trackerOps":[{"key":"ONLY a key from MODEL-WRITABLE TRACKERS","operation":"set|add|subtract|reset|set_state","amount":0,"state":"state value for set_state","reason":"short evidence from recent narrative"}]
}

Rules:
- Extract only facts supported by the supplied prose. Do not invent recipients, phone conversations, relationships, weather, or off-screen knowledge.
- WORLD means genuinely shared setting state that is not primarily ABOUT one named actor. Examples: "The kingdom requires a seasonal tribute", "Class 1-A is holding a party tonight", "A storm is hitting the city".
- A named actor doing/feeling/planning/having something is NEVER a world fact. Put it in facts/actors with that actor explicitly listed.
- weather is null unless weather/atmosphere is actually established by the prose. Never invent temperature.
- world.clock comes ONLY from temporal evidence inside RECENT NARRATIVE. Never copy the computer/session/Pocket clock into it.
- If prose explicitly says "Sent 05:42am", "at 11", or another clock time that clearly anchors the current scene, normalize it to HH:MM and use precision=exact. If only "morning", "later that afternoon", "after patrol", etc. is known, use approximate/relative with a listed dayPart key and empty label; DO NOT invent an exact time or put scenery/prose in clock fields.
- date stays empty unless the narrative itself establishes a calendar date. An explicit time without a date is valid.
- facts is actor-specific only. Every facts entry MUST have at least one subject in actors.
- timeline scope=world only for group/world events. If an event concerns a named actor (Shoto's press conference, Bakugo's cooking shift, Mina's arrival), scope=actor and actors MUST identify them.
- public means reasonably shared/cast-visible information. scene means explicitly witnessed; list witnesses in knownBy. private is the default for personal/internal information.
- knownBy must be conservative. Never assume everyone knows a private fact.
- Actor status is world/physical state only. busy does NOT mean unable to text.
- actors[].presence is RELATIVE PHYSICAL CO-LOCATION with the Pocket Persona: with_persona only when recent prose supports that they are together; away only when recent prose supports separation; unknown when the latest prose does not establish it. Do not preserve a stale CURRENT POCKET STATE presence merely because it is already there.
- CURRENT POCKET STATE is advisory and may be stale. It exists so you can emit corrections, not as evidence. RECENT NARRATIVE is authoritative when they conflict.
- Update existing activeTimeline beats through eventUpdates using their exact id and an exact prose quotation. Summarize or complete only when supported by the narrative; never complete solely because a scheduled time passed. Do not recreate an existing beat in timeline with a different title. For legacy timeline updates, keep the existing title and actor scope. Use whenText="Now" only when the latest supplied prose makes it explicitly current.
- trackerOps is an EPHEMERAL delta list. Use ONLY keys listed under MODEL-WRITABLE TRACKERS and only when recent prose directly supports the change. Do not infer tracker changes from CURRENT POCKET STATE. Use [] when nothing changed.
- Prefer 0–6 world facts, 0–6 actor facts, 0–8 actor updates, and 0–4 timeline rows.
- Use exact names from KNOWN ACTORS when possible.`,
        },
        {
          role: 'user',
          content: `KNOWN ACTORS:
${knownActors.join('\n')}

CURRENT POCKET STATE — ADVISORY / MAY BE STALE / NEVER EVIDENCE:
${JSON.stringify(currentStateAdvisory)}

MODEL-WRITABLE TRACKERS:
${JSON.stringify(modelWritableTrackers)}

RECENT NARRATIVE — AUTHORITATIVE:
${recentNarrative}`,
        },
      ],
      parameters: { temperature: 0.08, max_tokens: 1_000 },
      userId,
    }, userId)

    const fresh = normalizeNarrativeSeed({ ...parsed, sourceKey, sourceMessageIds, updatedAt: nowIso() }, sourceKey, sourceMessageIds)
    const trackerDeltas = normalizeNarrativeTrackerDeltas(parsed)
    const seed = mergeNarrativeSeed(previous, fresh)

    await withStateLock(stateKey(chatId, characterId), async () => {
      const latest = await loadState(chatId, characterId, userId)
      const alreadyApplied = latest.lastReconciliation?.sourceKey === sourceKey
      const continuityChanged = alreadyApplied ? false : applyNarrativeSeedState(latest, { ...seed, timeline: fresh.timeline })
      const presenceChanged = alreadyApplied ? false : applyNarrativeActorPresence(latest, fresh.actors, fresh.updatedAt)
      const trackersChanged = alreadyApplied ? false : applyNarrativeTrackerDeltas(latest, trackerDeltas, fresh.updatedAt)
      const timelineChanged = alreadyApplied ? 0 : applyTimelineReview(latest.events, timelineSnapshot, parsed.eventUpdates, recentNarrative)
      const domains = new Set<NonNullable<PhoneState['lastReconciliation']>['domains'][number]>(['continuity'])
      if (fresh.world.clock.time || fresh.world.clock.dayPart || fresh.world.clock.label) domains.add('clock')
      if (fresh.world.weather) domains.add('weather')
      if (fresh.actors.some((actor) => actor.presence !== 'unknown') || presenceChanged) domains.add('presence')
      if (seed.timeline.length || timelineChanged) domains.add('timeline')
      if (trackerDeltas.length || trackersChanged) domains.add('trackers')
      if (!alreadyApplied) {
        const nextRevision = Math.max(0, latest.stateRevision || 0) + 1
        latest.stateRevision = nextRevision
        latest.lastReconciliation = {
          revision: nextRevision,
          sourceKey,
          sourceMessageIds,
          generationId: text(options.generationId, 180) || undefined,
          messageId: text(options.messageId, 180) || undefined,
          updatedAt: fresh.updatedAt,
          domains: [...domains],
        }
        await saveState(latest, userId)
        await sendState(latest, userId, 'state_reconciled')
      }
    })
    await spindle.userStorage.setJson(continuitySeedPath(chatId, characterId), seed, { indent: 2, userId })

    return seed
  })()

  narrativeSeedFlights.set(flightKey, flight)
  try {
    return await flight
  } catch (error) {
    spindle.log.warn(`Pocket continuity seed skipped: ${error instanceof Error ? error.message : String(error)}`)
    return loadNarrativeSeed(chatId, characterId, userId)
  } finally {
    if (narrativeSeedFlights.get(flightKey) === flight) narrativeSeedFlights.delete(flightKey)
  }
}

async function generateMessage(input: AnyRecord, userId?: string): Promise<void> {
  const context = await resolveContext(input, userId)
  try {
    await replyJobs.run(replyJobScope(context.chatId, context.characterId, text(input.conversationId, 180), userId), signal => generateMessageJob({ ...input, signal }, userId), input.signal instanceof AbortSignal ? input.signal : undefined)
  } finally {
    send({ type: 'lumiphone:message_progress', requestId: input.requestId, chatId: context.chatId, characterId: context.characterId, conversationId: input.conversationId, phase: 'done' }, userId)
  }
}

async function generateMessageJob(input: AnyRecord & { signal: AbortSignal }, userId?: string): Promise<void> {
  if (!spindle.permissions.has('generation')) throw new Error('Enable the Generation permission to create an in-phone reply.')
  const context = await resolveContext(input, userId)
  const requestId = text(input.requestId, 180) || id('reply')
  const key = stateKey(context.chatId, context.characterId)
  const continuitySeed = (await loadPreferences(userId)).roleplayContextMode === 'off'
    ? null
    : await refreshNarrativeSeed(context.chatId, context.characterId, userId)
  await withStateLock(key, async () => {
    const state = await loadState(context.chatId, context.characterId, userId)
    const preferences = await loadPreferences(userId)
    const generationPersona = await resolveGenerationPocketPersona(state, userId)
    const generationState: PhoneState = generationPersona === state.pocketPersona ? state : { ...state, pocketPersona: generationPersona }
    const conversation = resolveConversation(state, input)
    const participantActors = conversationActorIds(conversation)
      .map((actorId) => resolvePocketActor(state, actorId))
      .filter((entry): entry is NonNullable<ReturnType<typeof resolvePocketActor>> => Boolean(entry))
    const participants = participantActors.map((actor) => ({ actor, contact: actorAsGenerationContact(actor, nowIso()) }))
    if (!participants.length) throw new Error('This conversation has no available contact participants.')
    let contact: PocketContact
    let actor = participantActors[0]
    const requestedSpeaker = text(input.speakerActorId ?? input.speaker_actor_id ?? input.speakerContactId ?? input.speaker_contact_id, 180)
    if (requestedSpeaker && requestedSpeaker !== 'auto') {
      const explicit = participants.find((entry) => entry.actor.actorId === requestedSpeaker || entry.contact.id === requestedSpeaker)
      if (!explicit) throw new Error('The selected speaker is not a participant in this conversation.')
      actor = explicit.actor
      contact = explicit.contact
    } else if (conversation.kind === 'direct') {
      actor = participants[0].actor
      contact = participants[0].contact
    } else {
      const lastSpeakerId = [...activeConversationMessages(state, conversation)].reverse().find((entry) => entry.sender === 'contact')?.senderActorId
      const currentIndex = participants.findIndex((entry) => entry.actor.actorId === lastSpeakerId)
      const selected = participants[(currentIndex + 1 + participants.length) % participants.length]
      actor = selected.actor
      contact = selected.contact
    }
    if (bool(input.autonomous) && (contact.presence.inScene || !contact.messagingPolicy.remoteEligible || (conversation.availability.state !== 'remote' && conversation.availability.state !== 'arriving'))) return
    send({
      type: 'lumiphone:message_progress', requestId, chatId: context.chatId, characterId: context.characterId,
      conversationId: conversation.id, actorId: actor.actorId, contactId: actor.contact?.id, speakerContactId: actor.actorId, phase: 'pending',
    }, userId)
    const profile = await resolveContactProfile(contact, userId)
    const replaceMessageId = text(input.replaceMessageId, 180)
    const replaceIndex = replaceMessageId ? conversation.messages.findIndex((message) => message.id === replaceMessageId && message.sender === 'contact') : -1
    const activeMessages = activeConversationMessages(state, conversation)
    const replaceActiveIndex = replaceMessageId ? activeMessages.findIndex((message) => message.id === replaceMessageId && message.sender === 'contact') : -1
    const contextConversation = { ...conversation, messages: replaceActiveIndex >= 0 ? activeMessages.slice(0, replaceActiveIndex) : activeMessages }
    const knownIdentity = pocketContactPhoneBrief(contact, profile)
    const compactIdentity = `Relationship importance: ${actor.relationship}.\n${knownIdentity || 'No full profile is registered; use only the name and current phone exchange.'}`.slice(0, 1_400)
    const assembled = await assemblePocketContext({
      state: generationState, contact, conversation: contextConversation, preferences,
      actorIdentity: compactIdentity,
      getMessages: spindle.permissions.has('chat_mutation') ? () => spindle.chat.getMessages(context.chatId) : undefined,
      includePhoneThread: conversation.kind !== 'direct',
      includeRoleplayBackground: false,
    })
    const requestedInstruction = text(input.instruction, 2_000)
    const hasPhoneHistory = contextConversation.messages.length > 0
    const defaultReplyInstruction = 'Reply naturally to the latest phone message.'
    const firstDmInstruction = [
      'Start a new DM naturally. There is no prior phone message in this thread.',
      'Do not imply or answer an unseen prior message, shared plan, appointment, event, or conversation unless it appears in the structured Pocket continuity above.',
      requestedInstruction && !/^reply naturally to the latest (?:phone )?message\.?$/i.test(requestedInstruction)
        ? `Additional direction: ${requestedInstruction}`
        : '',
    ].filter(Boolean).join(' ')
    const instruction = conversation.kind === 'direct' && !hasPhoneHistory
      ? firstDmInstruction
      : requestedInstruction || defaultReplyInstruction
    const directThreadState = hasPhoneHistory
      ? `EXISTING THREAD — ${contextConversation.messages.length} prior phone message(s).`
      : 'EMPTY THREAD — no prior phone messages exist. This generated message starts the conversation.'
    const generationTask = replaceIndex >= 0 ? 'message-retry' : 'message-reply'
    const generationInfo = await inspectPocketGeneration({ spindle, loadPreferences, savePreferences, send }, preferences, userId)
    const personaName = generationPersona.displayName?.trim() || 'You'
    const personaIdentity = pocketPersonaPhoneBrief(generationPersona)
    const continuityText = preferences.roleplayContextMode === 'off' ? '' : narrativeSeedContext(continuitySeed, profile.name, [profile.name, personaName])
    const actorMemoryText = actorPhoneMemoryContext(state.actorMemories, {
      actorIds: [actor.actorId, contact.id],
      actorNames: [actor.name, profile.name],
      actorName: profile.name,
      excludeConversationId: conversation.id,
      maxChars: 2_600,
    })
    const generationMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = conversation.kind === 'direct'
      ? [
          {
            role: 'system',
            content: `You are ${profile.name} writing a private phone DM to ${personaName}.

IMMUTABLE DM OWNERSHIP:
- This thread belongs to ${personaName} and ${profile.name}.
- THIS THREAD IS NOT THE ACTIVE RP CHARACTER'S PHONE.
- It was not rerouted, borrowed, swapped, or inherited from another actor.
- If an older generated message implies a different owner/addressee, that older text is a continuity mistake. Correct it; do not rationalize it.
${personaIdentity ? `- Pocket Persona identity: ${personaIdentity}\n` : ''}
DM ROLE BINDING — AUTHORITATIVE:
- assistant role = ${profile.name}, the contact who writes the generated phone message.
- user role = ${personaName}, the Pocket Persona / phone owner / recipient.
- The host roleplay's active character is not automatically the user role or DM recipient.
- Raw host roleplay transcript is intentionally excluded from direct-message generation; cross-thread continuity must come from explicit Pocket state, not host-chat dialogue.
- Names appearing inside old messages or RP background are text content, not routing metadata.
- A historical generated message may contain a mistaken addressee; do not inherit that mistake.
- Never reinterpret the user role as another actor.

Return strict JSON only:
{"recipient":"${personaName}","message":"the phone text","after":{"state":"remote|arriving|local|paused","reason":""},"suggestion":null}

${preferences.voiceMessages !== false ? 'You may add "format":"voice" when the character naturally sends a spoken voice message; message must contain only its spoken transcript. Omit format for ordinary text.' : 'Send ordinary text only; voice messages are disabled.'}
The recipient field MUST be exactly "${personaName}".
after describes the channel immediately after this message.
suggestion is null unless THIS message proposes, confirms, changes, or meaningfully references a concrete future plan that would make sense on Timeline.
When present, suggestion MUST be {"kind":"event","title":"short event title","description":"why/what","whenKind":"exact|approximate|relative|unscheduled","whenText":"human story-time label","start":"optional ISO only when exact and confidently grounded","end":"optional ISO only when exact and confidently grounded","participants":["exact character names"]}.
A participant name is valid even when Pocket has no Contact/profile for that person. Do not invent an event merely to make the conversation feel active.
Use arriving while traveling toward the physical scene, local only when the message itself crosses into physical action or confirms arrival, paused for ended/busy/away/sleeping/unknown, otherwise remote.
No narration, markdown, or custom UI copy.`,
          },
          {
            role: 'system',
            content: `POCKET BACKGROUND — REFERENCE ONLY, NOT CHAT-ROLE ROUTING\n${assembled.text || '(no additional background)'}${continuityText ? `\n\nSTRUCTURED CONTINUITY — NOT RAW NARRATIVE\n${continuityText}` : ''}${actorMemoryText ? `\n\n${actorMemoryText}` : ''}`,
          },
          ...directGenerationHistory(contextConversation, actor.actorId, contact.id, personaName, profile.name),
          {
            role: 'user',
            content: `[POCKET CONTROL — NOT AN IN-WORLD MESSAGE]
The user role is still ${personaName}.
Generate the next assistant-role phone text from ${profile.name} TO ${personaName}.
THREAD STATE: ${directThreadState}
DIRECTION: ${instruction}
FINAL GENERATION LOCK: recipient=${personaName}; speaker=${profile.name}; thread_owner=${personaName}. This is ${personaName}'s phone conversation, not another actor's device.`,
          },
        ]
      : [
          {
            role: 'system',
            content: `Write exactly one private phone text as ${profile.name}. Stay in character and do not speak for another participant. The FINAL CHANNEL LOCK in the bounded context is authoritative. Return strict JSON only: {"message":"the phone text","after":{"state":"remote|arriving|local|paused","reason":""}}. after describes the channel immediately after this message.
Use arriving while traveling toward the physical scene, local only when the message itself crosses into physical action or confirms arrival, paused for ended/busy/away/sleeping/unknown, otherwise remote. No narration, markdown, or custom UI copy.`,
          },
          {
            role: 'user',
            content: `${assembled.text || '(no context)'}\n\nDIRECTION\n${instruction}\n\nFINAL GENERATION LOCK\nSPEAKER / CONTACT: ${profile.name}\nRECIPIENT / POCKET PERSONA: ${personaName}\nGenerate ${profile.name}'s phone text TO the Pocket Persona named above. Other actors may be discussed, but they are not the recipient of this DM.`,
          },
        ]

    input.signal?.throwIfAborted()
    const generationRequest: AnyRecord = {
      signal: input.signal,
      type: 'quiet',
      messages: generationMessages,
      parameters: { temperature: 0.85, max_tokens: 720 },
      userId,
    }
    // Capture the exact direct-message request immediately before dispatch.
    // This is intentionally the same object passed into runPocketGeneration.
    await savePromptDebug(generationTask, requestId, generationRequest, userId)
    const response: any = await runPocketGeneration(
      { spindle, loadPreferences, savePreferences, send },
      generationTask,
      requestId,
      generationRequest,
      userId,
    )
    input.signal?.throwIfAborted()
    let generated: AnyRecord = {}
    try { generated = parseGeneratedObject(response.content) }
    catch { generated = { message: response.content, after: { state: 'remote' } } }
    const reply = text(generated.message, 8_000)
    if (!reply) throw new Error('The character did not return a phone message.')
    if (conversation.kind === 'direct') {
      const declaredRecipient = text(generated.recipient, 120)
      if (declaredRecipient && normalizeActorName(declaredRecipient) !== normalizeActorName(personaName)) {
        throw new Error(`Pocket refused a misrouted DM: model declared recipient "${declaredRecipient}" instead of "${personaName}". Retry the message.`)
      }
    }
    const route: PocketRoute = { app: 'messages', conversationId: conversation.id }
    const visible = notificationDestinationVisible(state, route, userId)
    const nextMessage: PhoneMessage = {
      id: id('msg'), sender: 'contact', senderActorId: actor.actorId, senderActorKind: actor.kind === 'contact' || actor.kind === 'discovered' ? actor.kind : undefined, senderContactId: actor.contact?.id, senderName: actor.name, senderAccent: actor.accent,
      text: reply, format: preferences.voiceMessages !== false && voiceMessage(generated.format) ? 'voice' : undefined, createdAt: phoneMessageTimestamp(state), read: visible, status: visible ? 'read' : 'delivered',
      eventSuggestion: generatedEventSuggestion(generated.suggestion, id),
      generation: { requestId, retryOf: replaceIndex >= 0 ? replaceMessageId : undefined },
    }
    nextMessage.generation!.info = {
      speaker: profile.name,
      source: profile.source,
      sourceId: contact.source.kind === 'character' ? contact.source.characterId : contact.source.kind === 'council' ? contact.source.memberId || contact.source.itemId : contact.id,
      sourceResolution: contact.source.kind === 'character' || contact.source.kind === 'council' ? 'resolved' : contact.source.origin === 'manual' ? 'manual' : 'snapshot',
      activeCharacterId: state.characterId,
      activeCharacterUsed: contact.source.kind === 'character' && contact.source.characterId === state.characterId,
      identityChars: assembled.diagnostics.actorIdentityChars,
      sceneSnapshotStale: assembled.diagnostics.sceneSnapshot.stale,
      contextMode: preferences.roleplayContextMode,
      recentCount: assembled.diagnostics.recentRoleplay.count,
      recentChars: assembled.diagnostics.recentRoleplay.chars,
      storyCount: assembled.diagnostics.story.count,
      storyChars: assembled.diagnostics.story.chars,
      threadCount: assembled.diagnostics.phoneThread.count,
      threadChars: assembled.diagnostics.phoneThread.chars,
      generationMode: preferences.generationMode,
      connectionName: generationInfo.effective?.name || '',
      model: preferences.sidecarModelOverride || generationInfo.effective?.model || '',
    }
    nextMessage.senderAccent = contactAccent(contact)
    if (replaceIndex >= 0) {
      state.actorMemories = removeActorMemoryByMessageId(state.actorMemories, replaceMessageId)
      conversation.messages.splice(replaceIndex, 1, nextMessage)
    } else {
      conversation.messages.push(nextMessage)
    }
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES)
    rememberPhoneMessage(state, conversation, nextMessage)
    if (!visible && replaceIndex < 0) conversation.unread += 1
    conversation.updatedAt = nowIso()
    const phoneMessageId = conversation.messages.at(-1)?.id
    route.messageId = phoneMessageId
    const notification = preferences.notifyMessages && replaceIndex < 0
      ? addNotification(state, { app: 'messages', title: contact.name, body: preferences.notificationPreviews ? reply.slice(0, 220) : 'New message', route, source: bool(input.ambient) ? 'automatic' : 'model', severity: 'important' }, userId)
      : null
    if (bool(input.initiated) && actor.contact) {
      contact.messagingPolicy.lastInitiatedMessageAt = nowIso()
      contact.messagingPolicy.lastInitiatedRoleplayAt = state.roleplayNow
    }
    let relayToContinue: PocketRelay | null = null
    if (replaceIndex < 0 && !bool(input.manualOverride)) {
      const after = isRecord(generated.after) ? generated.after : {}
      if (after.state === 'arriving') {
        conversation.pause = undefined
        conversation.availability = { state: 'arriving' }
      } else if (after.state === 'paused') {
        const allowed = new Set(['ended', 'busy', 'away', 'sleeping', 'unknown'])
        const reason = allowed.has(String(after.reason)) ? String(after.reason) as NonNullable<PocketConversation['pause']>['reason'] : 'unknown'
        conversation.pause = { reason, createdAt: nowIso(), source: 'model' }
        conversation.availability = { state: 'paused', reason }
      } else if (after.state === 'local' && actor.contact) {
        const decision = normalizeReplyDecision({ rawAction: 'handoff', rawReason: after.reason, contact, conversation, explicitRemoteOverride: false, createdAt: nowIso() })
        relayToContinue = commitConversationHandoff(state, conversation, contact, decision)
        if (nextMessage.generation?.info) nextMessage.generation.info.replyDecision = {
          rawAction: decision.rawAction, normalizedAction: decision.normalizedAction, reason: decision.reason, normalizationReason: decision.normalizationReason,
        }
      } else {
        conversation.pause = undefined
        conversation.availability = { state: 'remote' }
      }
    }
    const activity = replaceIndex < 0 ? addActivity(state, { kind: 'message', title: actor.name, summary: reply.slice(0, 280), route, source: { contactId: actor.contact?.id, conversationId: conversation.id } }) : undefined
    await saveState(state, userId)
    if (notification) await maybePush(state, preferences, notification, userId)
    await sendState(state, userId, 'message', preferences.autoOpenOnModelAction)
    sendActivity(activity, userId)
    sendNotification(notification, userId)
    if (relayToContinue) setTimeout(() => void requestRelayContinuation(context.chatId, context.characterId, relayToContinue!.id, userId), 0)
    else if (conversation.availability.state === 'arriving') void scheduleArrivalContinuation(context.chatId, context.characterId, conversation.id, userId)
    send({
      type: 'lumiphone:message_progress', requestId, chatId: context.chatId, characterId: context.characterId,
      conversationId: conversation.id, actorId: actor.actorId, contactId: actor.contact?.id, speakerContactId: actor.actorId, phase: 'done',
    }, userId)
  })
}

function groupRevealDelayMs(preferences: DevicePreferences, body: string, position: number, seed: string): number {
  if (preferences.replyCadence === 'instant') return 0
  let hash = 0
  for (const character of seed) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0
  const jitter = Math.abs(hash) % 650
  const base = position === 0 ? 700 : 1_150
  const typing = Math.min(2_800, body.length * 18)
  const multiplier = preferences.replyCadence === 'quick' ? .62 : preferences.replyCadence === 'relaxed' ? 1.35 : 1
  return Math.round((base + typing + jitter) * multiplier)
}

async function generateGroupBatch(input: AnyRecord, userId?: string): Promise<void> {
  const context = await resolveContext(input, userId)
  await replyJobs.run(replyJobScope(context.chatId, context.characterId, text(input.conversationId, 180), userId), signal => generateGroupBatchJob({ ...input, signal }, userId), input.signal instanceof AbortSignal ? input.signal : undefined)
}

async function generateGroupBatchJob(input: AnyRecord & { signal: AbortSignal }, userId?: string): Promise<void> {
  if (!spindle.permissions.has('generation')) throw new Error('Enable the Generation permission to create a group reply.')
  const context = await resolveContext(input, userId)
  const requestId = text(input.requestId, 180) || id('group_reply')
  const conversationId = text(input.conversationId, 180)
  const flightKey = `${viewKey(userId)}:${stateKey(context.chatId, context.characterId)}:${conversationId}`
  if (groupBatchFlights.has(flightKey)) throw new Error('This group is already generating a reply burst.')
  const flightToken = id('group_flight')
  groupBatchFlights.set(flightKey, flightToken)
  let progressOpen = false
  try {
    const state = await loadState(context.chatId, context.characterId, userId)
    const preferences = await loadPreferences(userId)
    const conversation = state.conversations.find((entry) => entry.id === conversationId && entry.kind === 'group')
    if (!conversation) throw new Error('That group conversation no longer exists.')
    const activeBatch = state.groupBatches.find((entry) => entry.conversationId === conversation.id && (entry.status === 'queued' || entry.status === 'delivering'))
    if (activeBatch) throw new Error('This group already has a reply burst in progress.')
    const groupContinuitySeed = await refreshNarrativeSeed(context.chatId, context.characterId, userId)
    const sourceBurstId = text(input.sourceBurstId, 180) || conversation.outgoingBurst?.id
    const manualOverride = bool(input.manualOverride)
    const eligible = conversationActorIds(conversation)
      .map((actorId) => resolvePocketActor(state, actorId))
      .filter((entry): entry is NonNullable<ReturnType<typeof resolvePocketActor>> => Boolean(entry && (!entry.contact || (
        entry.contact.generationPolicy.relevant && (manualOverride || (entry.contact.messagingPolicy.remoteEligible && !entry.contact.presence.inScene))
      ))))
    if (!eligible.length) {
      send({ type: 'lumiphone:message_progress', requestId, chatId: context.chatId, characterId: context.characterId, conversationId, phase: 'done' }, userId)
      return
    }
    progressOpen = true
    send({ type: 'lumiphone:message_progress', requestId, chatId: context.chatId, characterId: context.characterId, conversationId, phase: 'checking' }, userId)
    const profiles = await Promise.all(eligible.map(async (actor) => {
      const contact = actorAsGenerationContact(actor, nowIso())
      return { actor, contact, profile: await resolveContactProfile(contact, userId) }
    }))
    const primary = profiles[0]
    const projectedConversation = { ...conversation, messages: activeConversationMessages(state, conversation) }
    const assembled = await assemblePocketContext({
      state, contact: primary.contact, conversation: projectedConversation, preferences,
      actorIdentity: profiles.map(({ actor, contact, profile }) => `${actor.name} (${actor.actorId}, ${actor.relationship})\n${pocketContactPhoneBrief(contact, profile) || 'No profile; infer only from the live exchange.'}`.slice(0, 900)).join('\n\n').slice(0, 3_600),
      getMessages: spindle.permissions.has('chat_mutation') ? () => spindle.chat.getMessages(context.chatId) : undefined,
      includeRoleplayBackground: false,
    })
    const groupContinuityText = preferences.roleplayContextMode === 'off' ? '' : narrativeSeedContext(groupContinuitySeed, '', profiles.map(({ actor }) => actor.name))
    const groupMemoryText = groupActorPhoneMemoryContext(
      state.actorMemories,
      profiles.map(({ actor, contact }) => ({
        actorIds: [actor.actorId, contact.id],
        actorNames: [actor.name],
        name: actor.name,
      })),
      conversation.id,
      5_200,
    )
    const roster = profiles.map(({ actor, contact, profile }) => [
      `id=${actor.actorId}`,
      `name=${actor.name}`,
      `role=${contact.role}`,
      `relationship=${actor.relationship}`,
      `profile=${actor.kind === 'discovered' ? 'minimal-discovered-actor' : 'contact'}`,
      `talkativeness=${contact.messagingStyle.talkativeness}/100`,
      `fragmentation=${contact.messagingStyle.fragmentation}/100`,
      `identity=${pocketContactPhoneBrief(contact, profile).replace(/\n/g, ' · ').slice(0, 900)}`,
    ].join(' | ')).join('\n').slice(0, 5_000)
    input.signal?.throwIfAborted()
    const parsed = await runStructuredGeneration('group-reply', requestId, {
      signal: input.signal,
      type: 'quiet',
      messages: [
        { role: 'system', content: `Generate the next natural burst in a fictional private group chat. The CURRENT PHONE CHANNEL block below is authoritative for current membership. Actors marked former participant in PHONE THREAD are historical only and are not current recipients or speakers. Return strict JSON only: {"messages":[{"speakerId":"exact eligible id","text":"phone text","suggestion":null}]}. Return 0–3 messages normally and never more than 4. Silence is valid. Use only eligible speaker IDs. Select only participants with something natural to contribute; never make everyone answer by default. The ordered array is one evolving exchange: later messages may directly react to earlier generated messages. A close relationship is important social context; a background/minimal discovered actor may still speak when the plot or current exchange makes them relevant, without inventing a biography. Talkativeness changes likelihood but never forces participation. Fragmentation may produce short consecutive messages by the same speaker, while low fragmentation favors one composed bubble.
${preferences.voiceMessages !== false ? 'Each row may add "format":"voice" for a natural character voice message; text is its spoken transcript. Omit format for ordinary text.' : 'Send ordinary text only; voice messages are disabled.'}
Each row may include suggestion only when THAT speaker's message itself proposes, confirms, changes, or meaningfully references a concrete future plan. suggestion is null otherwise. When present use {"kind":"event","title":"short event title","description":"why/what","whenKind":"exact|approximate|relative|unscheduled","whenText":"human story-time label","start":"optional ISO only when exact and grounded","end":"optional ISO only when exact and grounded","participants":["exact character names"]}. Name-only participants are valid. Do not manufacture events from casual chatter.
No narration, markdown, delay values, or hidden reasoning.` },
        { role: 'user', content: `${assembled.text || '(no context)'}${groupContinuityText ? `\n\nSTRUCTURED CONTINUITY — PUBLIC/SHARED FACTS ONLY\n${groupContinuityText}` : ''}${groupMemoryText ? `\n\n${groupMemoryText}` : ''}\n\nELIGIBLE GROUP PARTICIPANTS\n${roster}\n\nGenerate the next group-chat burst.\n\nFINAL GENERATION LOCK\nPOCKET PERSONA / USER: ${state.pocketPersona.displayName?.trim() || 'You'}\nCURRENT GROUP ACTORS: ${profiles.map(({ actor }) => actor.name).join(', ')}\nOnly the Pocket Persona and CURRENT GROUP ACTORS above can read this channel. An absent/former actor may be discussed, but must not be directly addressed as though they are still in the group.` },
      ],
      parameters: { temperature: .82, max_tokens: 1_150 }, userId,
    }, userId)
    input.signal?.throwIfAborted()
    const generatedRows = (Array.isArray(parsed.messages) ? parsed.messages : []).slice(0, 4).flatMap((row) => {
      if (!isRecord(row)) return []
      const speakerId = text(row.speakerId, 180)
      const body = text(row.text, 8_000)
      if (!body || !eligible.some((actor) => actor.actorId === speakerId)) return []
      return [{ id: id('group_slot'), speakerId, text: body, format: preferences.voiceMessages !== false && voiceMessage(row.format) ? 'voice' as const : undefined, eventSuggestion: generatedEventSuggestion(row.suggestion, id), state: 'queued' as const }]
    })
    const generationInfo = await inspectPocketGeneration({ spindle, loadPreferences, savePreferences, send }, preferences, userId)
    const batchId = id('group_batch')
    const batch = await withStateLock(stateKey(context.chatId, context.characterId), async () => {
      const latest = await loadState(context.chatId, context.characterId, userId)
      const latestConversation = latest.conversations.find((entry) => entry.id === conversationId && entry.kind === 'group')
      input.signal?.throwIfAborted()
      if (!latestConversation) return null
      if (sourceBurstId && latestConversation.outgoingBurst?.id !== sourceBurstId) return null
      const currentActorIds = new Set(conversationActorIds(latestConversation))
      const currentEligible = eligible.filter((entry) => currentActorIds.has(entry.actorId))
      const queuedRows = generatedRows.filter((entry) => currentActorIds.has(entry.speakerId))
      const createdAt = nowIso()
      const next: PendingGroupBatch = {
        id: batchId, requestId, conversationId, sourceBurstId,
        eligibleActorIds: currentEligible.map((entry) => entry.actorId),
        eligibleContactIds: currentEligible.flatMap((entry) => entry.contact?.id || []), messages: queuedRows,
        status: queuedRows.length ? 'queued' : 'completed', createdAt, updatedAt: createdAt,
      }
      latest.groupBatches.push(next)
      latest.groupBatches = latest.groupBatches.slice(-24)
      await saveState(latest, userId)
      await sendState(latest, userId, queuedRows.length ? 'group_batch_queued' : 'group_batch_empty')
      return next
    })
    if (!batch || !batch.messages.length) return
    for (let position = 0; position < batch.messages.length; position += 1) {
      input.signal.throwIfAborted()
      const slot = batch.messages[position]
      const speaker = eligible.find((entry) => entry.actorId === slot.speakerId)
      if (!speaker) continue
      send({ type: 'lumiphone:message_progress', requestId, chatId: context.chatId, characterId: context.characterId, conversationId, actorId: speaker.actorId, contactId: speaker.contact?.id, speakerContactId: speaker.actorId, phase: 'pending' }, userId)
      const delay = groupRevealDelayMs(preferences, slot.text, position, slot.id)
      if (delay) await new Promise<void>((resolve) => setTimeout(resolve, delay))
      input.signal?.throwIfAborted()
      const delivered = await withStateLock(stateKey(context.chatId, context.characterId), async () => {
        input.signal?.throwIfAborted()
        const latest = await loadState(context.chatId, context.characterId, userId)
        input.signal.throwIfAborted()
        const latestBatch = latest.groupBatches.find((entry) => entry.id === batch.id)
        const latestSlot = latestBatch?.messages.find((entry) => entry.id === slot.id)
        const latestConversation = latest.conversations.find((entry) => entry.id === conversationId && entry.kind === 'group')
        if (!latestBatch || !latestSlot || !latestConversation || latestBatch.status === 'cancelled' || latestSlot.state !== 'queued') return null
        if (!conversationActorIds(latestConversation).includes(speaker.actorId)) {
          latestSlot.state = 'cancelled'
          latestBatch.updatedAt = nowIso()
          if (!latestBatch.messages.some((entry) => entry.state === 'queued')) latestBatch.status = 'completed'
          await saveState(latest, userId)
          await sendState(latest, userId, 'group_batch_membership_changed')
          return { skipped: true as const }
        }
        latestBatch.status = 'delivering'
        const visible = notificationDestinationVisible(latest, { app: 'messages', conversationId }, userId)
        const profileRow = profiles.find((entry) => entry.actor.actorId === speaker.actorId)!
        const profile = profileRow.profile
        const speakerContact = profileRow.contact
        const message: PhoneMessage = {
          id: id('msg'), sender: 'contact', senderActorId: speaker.actorId, senderActorKind: speaker.kind === 'contact' || speaker.kind === 'discovered' ? speaker.kind : undefined, senderContactId: speaker.contact?.id, senderName: speaker.name, senderAccent: speaker.accent,
          text: latestSlot.text, format: latestSlot.format, createdAt: phoneMessageTimestamp(latest), read: visible, status: visible ? 'read' : 'delivered',
          eventSuggestion: latestSlot.eventSuggestion,
          generation: { requestId, info: {
            speaker: profile.name, source: profile.source,
            sourceId: speakerContact.source.kind === 'character' ? speakerContact.source.characterId : speakerContact.source.kind === 'council' ? speakerContact.source.memberId || speakerContact.source.itemId : speaker.actorId,
            sourceResolution: speakerContact.source.kind === 'character' || speakerContact.source.kind === 'council' ? 'resolved' : speakerContact.source.origin === 'manual' ? 'manual' : 'snapshot',
            activeCharacterId: latest.characterId, activeCharacterUsed: speakerContact.source.kind === 'character' && speakerContact.source.characterId === latest.characterId,
            identityChars: (speakerContact.identityBrief || speakerContact.description).length, sceneSnapshotStale: latest.sceneSnapshot?.stale ?? true,
            contextMode: preferences.roleplayContextMode,
            recentCount: assembled.diagnostics.recentRoleplay.count, recentChars: assembled.diagnostics.recentRoleplay.chars,
            storyCount: assembled.diagnostics.story.count, storyChars: assembled.diagnostics.story.chars,
            threadCount: assembled.diagnostics.phoneThread.count, threadChars: assembled.diagnostics.phoneThread.chars,
            generationMode: preferences.generationMode, connectionName: generationInfo.effective?.name || '',
            model: preferences.sidecarModelOverride || generationInfo.effective?.model || '',
            groupBatch: { id: batch.id, position: position + 1, size: batch.messages.length, eligibleCount: eligible.length },
          } },
        }
        latestConversation.messages.push(message)
        latestConversation.messages = latestConversation.messages.slice(-MAX_MESSAGES)
        rememberPhoneMessage(latest, latestConversation, message)
        latestConversation.updatedAt = message.createdAt
        if (!visible) latestConversation.unread += 1
        latestSlot.state = 'delivered'
        latestSlot.deliveredMessageId = message.id
        latestSlot.deliveredAt = message.createdAt
        latestBatch.updatedAt = message.createdAt
        if (!latestBatch.messages.some((entry) => entry.state === 'queued')) latestBatch.status = 'completed'
        const route: PocketRoute = { app: 'messages', conversationId, messageId: message.id }
        const notification = preferences.notifyMessages
          ? addNotification(latest, { app: 'messages', title: speaker.name, body: preferences.notificationPreviews ? message.text.slice(0, 220) : 'New message', route, source: 'model', severity: 'important' }, userId)
          : null
        const activity = addActivity(latest, { kind: 'message', title: speaker.name, summary: message.text.slice(0, 280), route, source: { contactId: speaker.contact?.id, conversationId } })
        await saveState(latest, userId)
        await sendState(latest, userId, 'group_message', preferences.autoOpenOnModelAction)
        return { notification, activity }
      })
      if (!delivered) break
      if ('skipped' in delivered && delivered.skipped) continue
      if (delivered.notification) await maybePush(await loadState(context.chatId, context.characterId, userId), preferences, delivered.notification, userId)
      sendActivity(delivered.activity, userId)
      sendNotification(delivered.notification, userId)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500)
    await withStateLock(stateKey(context.chatId, context.characterId), async () => {
      const state = await loadState(context.chatId, context.characterId, userId)
      const batch = [...state.groupBatches].reverse().find((entry) => entry.requestId === requestId && (entry.status === 'queued' || entry.status === 'delivering'))
      if (batch) {
        batch.status = input.signal.aborted ? 'cancelled' : 'failed'; batch.error = input.signal.aborted ? undefined : message; batch.updatedAt = nowIso()
        if (input.signal.aborted) for (const slot of batch.messages) if (slot.state === 'queued') slot.state = 'cancelled'
        await saveState(state, userId); await sendState(state, userId, input.signal.aborted ? 'group_batch_cancelled' : 'group_batch_failed')
      }
    })
    throw error
  } finally {
    if (groupBatchFlights.get(flightKey) === flightToken) groupBatchFlights.delete(flightKey)
    if (progressOpen) send({ type: 'lumiphone:message_progress', requestId, chatId: context.chatId, characterId: context.characterId, conversationId, phase: 'done' }, userId)
  }
}

async function generateNpcContact(input: AnyRecord, userId?: string): Promise<void> {
  if (!spindle.permissions.has('generation')) throw new Error('Enable Generation to create an NPC contact from a description.')
  const context = await resolveContext(input, userId)
  const prompt = text(input.description, 2_000)
  if (!prompt) throw new Error('Describe the NPC you want to add.')
  const requestId = text(input.requestId, 180) || id('npc')
  send({ type: 'lumiphone:operation_progress', task: 'npc-contact', requestId, phase: 'generating', message: 'Generating contact…' }, userId)
  const request: AnyRecord = {
    type: 'quiet',
    messages: [
      { role: 'system', content: 'Create one compact PHONE-SPECIFIC roleplay contact draft from the user description. Return strict JSON only: {"name":"","role":"","identityBrief":"","phoneProfile":{"personality":"","appearance":"","textingStyle":""},"talkativeness":50,"fragmentation":35}. No markdown. identityBrief is a concise stable identity/relationship summary. phoneProfile.personality contains stable social/temperamental traits useful in conversation; appearance contains only 1-3 recognizable details useful for occasional texting references; textingStyle contains casing, punctuation, slang/register, dialect/AAVE only when actually established, emoji/kaomoji habits, abbreviations, fragmentation, and other stable texting quirks. Infer only from supplied evidence; do not stereotype demographics or invent unsupported quirks. Infer talkativeness and fragmentation from 0 to 100 as editable tendencies, never guarantees. Name/role max 120; identityBrief max 500; personality/textingStyle max 420; appearance max 240.' },
      { role: 'user', content: prompt },
    ],
    parameters: { temperature: 0.45, max_tokens: 650 }, userId,
  }
  const parsed = await runStructuredGeneration('npc-contact', requestId, request, userId)
  send({ type: 'lumiphone:operation_progress', task: 'npc-contact', requestId, phase: 'parsing', message: 'Parsing profile…' }, userId)
  const name = text(parsed.name, 120)
  if (!name) throw new Error('NPC generation did not return a valid name.')
  const identityBrief = text(parsed.identityBrief ?? parsed.description, 900)
  const draft: PocketContactDraft = {
    name,
    role: text(parsed.role, 120) || 'Pocket NPC',
    identityBrief,
    phoneProfile: generatedPhoneProfile(parsed.phoneProfile),
    accent: stableContactAccent(name),
    messagingStyle: {
      talkativeness: Math.max(0, Math.min(100, Math.round(numberValue(parsed.talkativeness, 50)))),
      fragmentation: Math.max(0, Math.min(100, Math.round(numberValue(parsed.fragmentation, 35)))),
    },
    sourceDescription: prompt,
  }
  send({ type: 'lumiphone:contact_draft', requestId, chatId: context.chatId, characterId: context.characterId, draft }, userId)
  send({ type: 'lumiphone:operation_progress', task: 'npc-contact', requestId, phase: 'complete', message: 'Draft ready' }, userId)
}

async function refreshCompactContactProfile(input: AnyRecord, userId?: string): Promise<void> {
  if (!spindle.permissions.has('generation')) throw new Error('Enable Generation to refresh a compact contact profile.')
  const context = await resolveContext(input, userId)
  const requestId = text(input.requestId, 180) || id('profile')
  const state = await loadState(context.chatId, context.characterId, userId)
  const contact = state.contacts.find((entry) => entry.id === text(input.contactId, 180))
  if (!contact) throw new Error('That contact no longer exists.')
  const profile = await resolveContactProfile(contact, userId)
  const discoveredSource = contact.source.kind === 'npc' && contact.source.origin === 'discovered'
  const discoveredActorId = contact.source.kind === 'npc' ? contact.source.discoveredActorId : undefined
  const phoneEvidence = discoveredSource
    ? state.conversations.flatMap((conversation) => activeConversationMessages(state, conversation).filter((message) => message.senderActorId === discoveredActorId || message.senderContactId === contact.id)).slice(-12).map((message) => `${message.senderName}: ${message.text.slice(0, 600)}`).join('\n')
    : ''
  const roleplayEvidence = discoveredSource && spindle.permissions.has('chat_mutation')
    ? (await spindle.chat.getMessages(context.chatId)).slice(-18).map((message: any) => `${message.role}: ${sanitizeNarrativeContent(message.content, 700)}`).join('\n').slice(-9_000)
    : ''
  send({ type: 'lumiphone:operation_progress', task: 'profile-refresh', requestId, phase: 'generating', message: 'Refreshing compact profile…' }, userId)
  const parsed = await runStructuredGeneration('profile-refresh', requestId, {
    type: 'quiet',
    messages: [
      { role: 'system', content: 'Condense the authoritative actor evidence into a PHONE-SPECIFIC contact profile. Return strict JSON only: {"identityBrief":"","phoneProfile":{"personality":"","appearance":"","textingStyle":""}}. identityBrief is a concise stable identity/relationship summary, max 500 chars. personality contains stable social/temperamental traits useful in conversation, max 420. appearance contains only 1-3 recognizable details useful for occasional texting references, max 240. textingStyle contains casing, punctuation, slang/register, dialect/AAVE only when actually established, emoji/kaomoji habits, abbreviations, fragmentation, message length, and other stable texting quirks, max 420. Exclude temporary scene state. Infer only from evidence, never stereotype demographics, and leave unsupported quirks blank.' },
      { role: 'user', content: discoveredSource
        ? `Name: ${profile.name}\nKnown phone messages:\n${phoneEvidence || '(none)'}\nRecent roleplay evidence:\n${roleplayEvidence || '(unavailable)'}\nOnly describe facts genuinely supported by this evidence.`
        : `Name: ${profile.name}\nRole: ${profile.role}\nDescription: ${profile.description}\nPersonality: ${profile.personality}\nBehavior: ${profile.behavior}` },
    ],
    parameters: { temperature: 0.12, max_tokens: 650 }, userId,
  }, userId)
  const identityBrief = text(parsed.identityBrief, 500)
  const phoneProfile = generatedPhoneProfile(parsed.phoneProfile)
  if (!identityBrief && !phoneProfile) throw new Error('Profile refresh returned no usable phone profile.')
  await withStateLock(stateKey(context.chatId, context.characterId), async () => {
    const latest = await loadState(context.chatId, context.characterId, userId)
    const target = latest.contacts.find((entry) => entry.id === contact.id)
    if (!target) throw new Error('That contact no longer exists.')
    target.name = profile.name
    target.role = profile.role || target.role
    if (identityBrief) {
      target.identityBrief = identityBrief
      target.description = identityBrief
    }
    if (phoneProfile) target.phoneProfile = phoneProfile
    target.updatedAt = nowIso()
    await saveState(latest, userId)
    await sendState(latest, userId, 'contact_profile')
    send({ type: 'lumiphone:operation_progress', task: 'profile-refresh', requestId, phase: 'complete', message: 'Compact profile refreshed' }, userId)
  })
}

function sceneKeyFor(name: string): string {
  return name.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 120) || name.toLocaleLowerCase().slice(0, 120)
}

function actorName(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function uniqueAliasMatch(candidate: string, names: string[]): string | null {
  const normalized = actorName(candidate)
  if (!normalized) return null
  const exact = names.find((name) => actorName(name) === normalized)
  if (exact) return exact
  if (normalized.includes(' ')) return null
  const matches = names.filter((name) => actorName(name).split(' ').includes(normalized))
  return matches.length === 1 ? matches[0] : null
}

async function syncSceneContacts(input: AnyRecord, userId?: string): Promise<void> {
  if (!spindle.permissions.has('generation')) throw new Error('Enable Generation to identify scene contacts.')
  if (!spindle.permissions.has('chat_mutation')) throw new Error('Enable Chat Mutation so Pocket can read the recent scene when you request a sync.')
  const context = await resolveContext(input, userId)
  const requestId = text(input.requestId, 180) || id('scene')
  send({ type: 'lumiphone:operation_progress', task: 'scene-sync', requestId, phase: 'request', message: 'Reading current scene…' }, userId)
  const messages: any[] = await spindle.chat.getMessages(context.chatId)
  const authoritative = messages.at(-1)
  const transcript = messages.slice(-24).map((message) => `${message.role}: ${sanitizeNarrativeContent(message.content, 1_200)}`).join('\n').slice(-16_000)
  const preflightState = await loadState(context.chatId, context.characterId, userId)
  const exclusions = [preflightState.characterName, preflightState.pocketPersona.displayName].filter(Boolean)
  send({ type: 'lumiphone:operation_progress', task: 'scene-sync', requestId, phase: 'generating', message: 'Finding scene contacts…' }, userId)
  const request: AnyRecord = {
    type: 'quiet',
    messages: [
      { role: 'system', content: `Identify named non-user actors physically present in the most recent roleplay scene. Return strict JSON only: {"contacts":[{"name":"","role":"","identityBrief":"","sceneNote":""}]}. Return at most 6. Exclude the primary Character and active Persona, including unambiguous short aliases. Explicit exclusions: ${exclusions.join(', ') || '(none)'}. Exclude merely mentioned, messaged, absent, historical, or hypothetical people. identityBrief is stable role/personality/relationship evidence only; sceneNote is why they are present, what they are doing, or their temporary state. Do not invent unsupported biography. Name/role max 120; identityBrief max 350; sceneNote max 220.` },
      { role: 'user', content: transcript || '(empty chat)' },
    ],
    parameters: { temperature: 0.2, max_tokens: 1_500 }, userId,
  }
  const parsed = await runStructuredGeneration('scene-sync', requestId, request, userId)
  send({ type: 'lumiphone:operation_progress', task: 'scene-sync', requestId, phase: 'parsing', message: 'Parsing scene roster…' }, userId)
  if (!Array.isArray(parsed.contacts)) throw new Error('Scene Sync returned no contacts array; no contact state was changed.')
  const aliasUniverse = [...new Set([...exclusions, ...preflightState.contacts.map((entry) => entry.name)])]
  const found = parsed.contacts.slice(0, 6).flatMap((entry) => {
    if (!isRecord(entry)) return []
    const name = text(entry.name, 120)
    if (!name) return []
    const excluded = uniqueAliasMatch(name, exclusions)
    if (excluded) return []
    return [{
      name, role: text(entry.role, 120) || 'Scene contact',
      identityBrief: text(entry.identityBrief ?? entry.description, 350),
      sceneNote: text(entry.sceneNote ?? entry.currentState, 220),
    }]
  })
  const relayIds: string[] = []
  await withStateLock(stateKey(context.chatId, context.characterId), async () => {
    send({ type: 'lumiphone:operation_progress', task: 'scene-sync', requestId, phase: 'saving', message: 'Saving scene contacts…' }, userId)
    const state = await loadState(context.chatId, context.characterId, userId)
    const npcBank = await loadNpcBank(userId)
    const sceneAt = nowIso()
    for (const contact of state.contacts) contact.presence.inScene = false
    const contactIds: string[] = []
    for (const candidate of found) {
      const sceneKey = sceneKeyFor(candidate.name)
      const matchedName = uniqueAliasMatch(candidate.name, aliasUniverse)
      let existing = state.contacts.find((entry) => entry.source.kind === 'npc' && entry.source.origin === 'scene' && entry.source.sceneKey === sceneKey)
        || state.contacts.find((entry) => actorName(entry.name) === actorName(matchedName || candidate.name))
      if (!existing) {
        const discovered = state.discoveredActors.find((entry) => entry.normalizedName === normalizeActorName(candidate.name))
        if (discovered) existing = promoteDiscoveredActor(state, discovered.id, sceneAt, id)
      }
      const bankEntry = findNpcBankMatch(npcBank, candidate.name)
      if (existing?.source.kind === 'npc' && !existing.source.bankId && bankEntry) {
        existing = applyNpcBankProfile(existing, bankEntry, sceneAt)
      } else if (!existing && bankEntry) {
        existing = upsertContact(state, contactFromNpcBank(bankEntry, sceneAt, id), false)
      }
      if (existing && !(existing.source.kind === 'npc' && existing.source.origin === 'scene')) {
        existing.presence.inScene = true
        existing.presence.lastSceneAt = sceneAt
        existing.sceneNote = candidate.sceneNote
        existing.updatedAt = sceneAt
        contactIds.push(existing.id)
        continue
      }
      const createdAt = existing?.createdAt || sceneAt
      const contact = upsertContact(state, {
        id: existing?.id || id('contact'), name: candidate.name, role: candidate.role,
        description: existing?.identityBrief || candidate.identityBrief, identityBrief: existing?.identityBrief || candidate.identityBrief,
        sceneNote: candidate.sceneNote,
        avatarUrl: existing?.avatarUrl || '', sourceAvatarUrl: existing?.sourceAvatarUrl || '', avatarOverrideUrl: existing?.avatarOverrideUrl || '',
        accent: existing?.accent || stableContactAccent(sceneKey), sourceAccent: existing?.sourceAccent || '', colorMode: existing?.colorMode || 'pocket',
        source: { kind: 'npc', origin: 'scene', description: existing?.identityBrief || candidate.identityBrief, sceneKey, bankId: existing?.source.kind === 'npc' ? existing.source.bankId : undefined },
        relationship: existing?.relationship || 'background',
        presence: { inScene: true, lastSceneAt: sceneAt }, contextPolicy: existing?.contextPolicy || { pinned: false },
        generationPolicy: existing?.generationPolicy || { relevant: true },
        messagingPolicy: existing?.messagingPolicy || { remoteEligible: true, allowAmbientInScene: false, lastInitiatedMessageAt: '', lastInitiatedRoleplayAt: '' },
        messagingStyle: existing?.messagingStyle || { talkativeness: 50, fragmentation: 35 }, createdAt, updatedAt: sceneAt,
      })
      contactIds.push(contact.id)
    }
    state.sceneSnapshot = {
      actors: contactIds.map((contactId) => {
        const contact = state.contacts.find((entry) => entry.id === contactId)!
        return { contactId, roleHint: contact.role, sceneBrief: contact.sceneNote }
      }),
      capturedAt: sceneAt,
      sourceMessageId: text(authoritative?.id, 180),
      sourceMessageIndex: Number.isFinite(Number(authoritative?.index_in_chat)) ? Number(authoritative.index_in_chat) : messages.length - 1,
      sourceRevision: Math.max(0, Math.round(numberValue(authoritative?.revision, 0))),
      stale: false,
    }
    for (const conversation of state.conversations) {
      if (conversation.kind !== 'direct') continue
      const participant = resolvePocketActor(state, conversationActorIds(conversation)[0])?.contact
      if (participant?.presence.inScene && conversation.availability.state !== 'local') {
        const decision = normalizeReplyDecision({
          rawAction: 'handoff', rawReason: conversation.availability.state === 'arriving' ? 'arrived' : 'in_scene',
          contact: participant, conversation, explicitRemoteOverride: false, createdAt: sceneAt,
        })
        const relay = commitConversationHandoff(state, conversation, participant, decision)
        relayIds.push(relay.id)
      } else if (participant) {
        reconcileContactAvailability(state, participant)
      }
    }
    const activity = addActivity(state, {
      kind: 'contact', title: 'Scene contacts synced', summary: `${contactIds.length} actor${contactIds.length === 1 ? '' : 's'} present`,
      route: { app: 'contacts' }, source: {},
    })
    await saveState(state, userId)
    await sendState(state, userId, 'scene_contacts')
    sendActivity(activity, userId)
    send({ type: 'lumiphone:operation_progress', task: 'scene-sync', requestId, phase: 'complete', message: 'Scene contacts synced' }, userId)
    send({ type: 'lumiphone:scene_contacts_done', requestId, contactIds }, userId)
  })
  for (const relayId of [...new Set(relayIds)]) void requestRelayContinuation(context.chatId, context.characterId, relayId, userId)
}

function replyCadenceMs(preferences: DevicePreferences): number {
  return preferences.replyCadence === 'instant' ? 0 : preferences.replyCadence === 'quick' ? 1_200 : preferences.replyCadence === 'relaxed' ? 6_500 : 3_200
}

function burstTimerKey(chatId: string, characterId: string, conversationId: string, userId?: string): string {
  return `${viewKey(userId)}:${stateKey(chatId, characterId)}:${conversationId}`
}

async function scheduleArrivalContinuation(chatId: string, characterId: string, conversationId: string, userId?: string): Promise<void> {
  const key = burstTimerKey(chatId, characterId, conversationId, userId)
  arrivalIdle.schedule(key, async current => {
    try {
      const view = currentView(userId)
      if (!view || view.chatId !== chatId || view.characterId !== characterId) return
      const preferences = await loadPreferences(userId)
      if (!preferences.autoReplyAfterSend || !current()) return
      let relayId = ''
      await withStateLock(stateKey(chatId, characterId), async () => {
        const state = await loadState(chatId, characterId, userId)
        const conversation = state.conversations.find(entry => entry.id === conversationId && entry.kind === 'direct' && entry.includesPocketPersona !== false)
        if (!current() || !conversation || conversation.availability.state !== 'arriving' || conversation.outgoingBurst?.held || (conversation.outgoingBurst?.open && !conversation.outgoingBurst.finalized)) return
        const actor = resolvePocketActor(state, conversationActorIds(conversation)[0])
        if (!actor?.contact || actor.contact.presence.inScene) return
        const contact = actorAsGenerationContact(actor, nowIso())
        const decision = normalizeReplyDecision({ rawAction: 'arrival_handoff', rawReason: 'arriving', contact, conversation, explicitRemoteOverride: false, createdAt: nowIso() })
        const relay = commitArrivalHandoff(state, conversation, contact, decision)
        if (relay.continuation.state !== 'idle') return
        relayId = relay.id
        await saveState(state, userId); await sendState(state, userId, 'arrival_idle')
      })
      if (current() && relayId) await requestRelayContinuation(chatId, characterId, relayId, userId)
    } catch (error) { spindle.log.warn('Pocket idle arrival skipped: ' + (error instanceof Error ? error.message : String(error))) }
  })
}

async function scheduleReplyBurst(chatId: string, characterId: string, conversationId: string, userId?: string): Promise<void> {
  const timerKey = burstTimerKey(chatId, characterId, conversationId, userId)
  const previous = replyBurstTimers.get(timerKey)
  if (previous) clearTimeout(previous)
  const preferences = await loadPreferences(userId)
  if (!preferences.autoReplyAfterSend) return
  const state = await loadState(chatId, characterId, userId)
  const burst = state.conversations.find((entry) => entry.id === conversationId)?.outgoingBurst
  if (!burst?.open || burst.finalized || burst.held) return
  const timer = setTimeout(() => {
    replyBurstTimers.delete(timerKey)
    void maybeReplyAfterSend(chatId, characterId, conversationId, userId, burst.id)
  }, replyCadenceMs(preferences))
  replyBurstTimers.set(timerKey, timer)
}

async function maybeReplyAfterSend(chatId: string, characterId: string, conversationId: string, userId?: string, expectedBurstId = ''): Promise<void> {
  try {
    await replyJobs.run(replyJobScope(chatId, characterId, conversationId, userId), signal => maybeReplyAfterSendJob(chatId, characterId, conversationId, userId, expectedBurstId, signal))
  } catch (error) {
    if (!(error instanceof Error && error.name === 'AbortError')) throw error
  }
}

async function maybeReplyAfterSendJob(chatId: string, characterId: string, conversationId: string, userId: string | undefined, expectedBurstId: string, signal: AbortSignal): Promise<void> {
  const flightKey = `${viewKey(userId)}:${stateKey(chatId, characterId)}:${conversationId}`
  if (replyDecisionFlights.has(flightKey)) return
  replyDecisionFlights.add(flightKey)
  let progressRequestId = ''
  try {
    const preferences = await loadPreferences(userId)
    if (!preferences.autoReplyAfterSend || !spindle.permissions.has('generation')) return
    const state = await loadState(chatId, characterId, userId)
    const conversation = state.conversations.find((entry) => entry.id === conversationId)
    if (!conversation || conversation.messages.at(-1)?.sender !== 'persona') return
    const burst = conversation.outgoingBurst
    if (expectedBurstId && (!burst || burst.id !== expectedBurstId || !burst.open || burst.finalized || burst.held)) return
    if (conversation.kind === 'group') {
      if (!burst) return
      await withStateLock(stateKey(chatId, characterId), async () => {
        const latest = await loadState(chatId, characterId, userId)
        const current = latest.conversations.find((entry) => entry.id === conversationId)
        if (!current?.outgoingBurst || current.outgoingBurst.id !== burst.id || current.outgoingBurst.finalized) return
        current.outgoingBurst.open = false
        current.outgoingBurst.finalized = true
        current.outgoingBurst.updatedAt = nowIso()
        await saveState(latest, userId)
      })
      // The batch owns its own per-conversation flight. Release the reply-decision
      // guard before reveal delays so a new user burst can cancel and supersede it.
      replyDecisionFlights.delete(flightKey)
      await generateGroupBatch({ requestId: id('group_auto'), chatId, characterId, conversationId, sourceBurstId: burst.id, autonomous: true, signal }, userId)
      return
    }
    const actor = resolvePocketActor(state, conversationActorIds(conversation)[0])
    if (!actor) return
    const contact = actorAsGenerationContact(actor, nowIso())
    if (!contact.generationPolicy.relevant) return
    const burstMessages = burst?.messageIds.length
      ? conversation.messages.filter((message) => burst.messageIds.includes(message.id) && message.sender === 'persona')
      : [conversation.messages.at(-1)!]
    const requestId = id('reply_decision')
    progressRequestId = requestId
    send({
      type: 'lumiphone:message_progress', requestId, chatId, characterId,
      conversationId, actorId: actor.actorId, contactId: actor.contact?.id, speakerContactId: actor.actorId, phase: 'checking',
    }, userId)
    const explicitRemoteOverride = Boolean(burst?.explicitRemoteOverride)
    const deterministicLocal = !explicitRemoteOverride && (contact.presence.inScene || conversation.availability.state === 'local')
    const rawDecision = deterministicLocal ? { action: 'handoff', reason: contact.presence.inScene ? conversation.availability.state === 'arriving' ? 'arrived' : 'in_scene' : conversation.availability.state === 'local' ? conversation.availability.reason : 'continued_in_person' } : !contact.messagingPolicy.remoteEligible && conversation.availability.state !== 'arriving'
      ? { action: 'pause', reason: 'away' }
      : await runStructuredGeneration('reply-decision', requestId, {
        signal,
        type: 'quiet',
        messages: [
          { role: 'system', content: 'Classify the next channel state of this fictional direct-message thread. The physical-scene facts are authoritative. Return strict JSON only: {"action":"reply"}, {"action":"none"}, {"action":"pause","reason":"ended|busy|away|sleeping|unknown"}, {"action":"arrival_handoff","reason":"arriving"}, or {"action":"handoff","reason":"arrived|took_action|continued_in_person"}. reply means the latest Persona text genuinely warrants a remote answer. none means the remote channel remains valid but no reply is warranted and the narrative does not need to move toward an arrival. arrival_handoff means the off-scene actor has begun traveling toward the Persona/current scene AND the remote exchange has naturally reached an endpoint; use it to return narrative control to the main RP without claiming the actor has arrived. Prefer arrival_handoff over filler acknowledgements such as “okay”, “I know”, “coming”, or another repeated ETA when travel has already begun and no substantive remote answer is needed. handoff is only for interaction that has already become physical/local. Never use none when the actor is physically in the active scene. No prose or custom UI copy.' },
          { role: 'user', content: `Contact: ${contact.name} (${contact.role})\nChannel: ${conversation.availability.state}\nPresence: ${contact.presence.inScene ? 'physically in the active scene' : 'off-scene'}\nRemote eligible: ${contact.messagingPolicy.remoteEligible}\nScene snapshot: ${(state.sceneSnapshot?.actors || []).map((actor) => `${state.contacts.find((entry) => entry.id === actor.contactId)?.name || actor.contactId}: ${actor.sceneBrief}`).join(' | ') || 'none'}\nRecent DM:\n${conversation.messages.slice(-8).map((message) => `${message.senderName}: ${message.text.slice(0, 700)}`).join('\n')}\nSettled outgoing burst:\n${burstMessages.map((message) => message.text.slice(0, 1_200)).join('\n')}` },
        ],
        parameters: { temperature: 0.1, max_tokens: 100 }, userId,
      }, userId)
    signal.throwIfAborted()
    const rawAction = rawDecision.action === 'reply' || rawDecision.reply === true ? 'reply' : rawDecision.action === 'pause' ? 'pause' : rawDecision.action === 'arrival_handoff' ? 'arrival_handoff' : rawDecision.action === 'handoff' ? 'handoff' : 'none'
    const outcome = await withStateLock(stateKey(chatId, characterId), async (): Promise<{ action: ReturnType<typeof normalizeReplyDecision>['normalizedAction']; relayId?: string } | null> => {
      const latestState = await loadState(chatId, characterId, userId)
      signal.throwIfAborted()
      const latestConversation = latestState.conversations.find((entry) => entry.id === conversationId)
      if (!latestConversation?.outgoingBurst || (expectedBurstId && latestConversation.outgoingBurst.id !== expectedBurstId)) return null
      const latestActor = resolvePocketActor(latestState, actor.actorId)
      if (!latestActor) return null
      const latestContact = actorAsGenerationContact(latestActor, nowIso())
      latestConversation.outgoingBurst.open = false
      latestConversation.outgoingBurst.finalized = true
      latestConversation.outgoingBurst.updatedAt = nowIso()
      const decision = normalizeReplyDecision({
        rawAction, rawReason: rawDecision.reason, contact: latestContact, conversation: latestConversation,
        explicitRemoteOverride: latestConversation.outgoingBurst.explicitRemoteOverride, createdAt: nowIso(), burstId: latestConversation.outgoingBurst.id,
      })
      latestConversation.lastDecision = decision
      let relayId: string | undefined
      if (decision.normalizedAction === 'reply') {
        if (latestConversation.availability.state !== 'arriving') latestConversation.availability = { state: 'remote' }
        latestConversation.pause = undefined
      } else if (decision.normalizedAction === 'pause') {
        const reason = decision.reason as NonNullable<PocketConversation['pause']>['reason']
        latestConversation.pause = { reason, createdAt: decision.createdAt, source: 'model' }
        latestConversation.availability = { state: 'paused', reason }
      } else if (decision.normalizedAction === 'arrival_handoff' && !latestContact.presence.inScene) {
        latestConversation.availability = { state: 'arriving' }
        latestConversation.pause = undefined
        if (latestActor.contact) relayId = commitArrivalHandoff(latestState, latestConversation, latestContact, decision).id
      } else if (decision.normalizedAction === 'handoff' && decision.reason === 'arriving' && !latestContact.presence.inScene) {
        // Legacy classifier compatibility: arriving without an explicit arrival_handoff
        // updates channel state but does not force a main-RP continuation.
        latestConversation.availability = { state: 'arriving' }
        latestConversation.pause = undefined
      } else if (decision.normalizedAction === 'handoff' && latestActor.contact) {
        relayId = commitConversationHandoff(latestState, latestConversation, latestContact, decision).id
      } else if (decision.normalizedAction === 'handoff') {
        latestConversation.availability = { state: 'local', reason: decision.reason === 'arrived' || decision.reason === 'in_scene' || decision.reason === 'took_action' || decision.reason === 'continued_in_person' ? decision.reason : 'continued_in_person' }
      }
      await saveState(latestState, userId)
      await sendState(latestState, userId, decision.normalizedAction === 'arrival_handoff' ? 'conversation_arrival_handoff' : decision.normalizedAction === 'handoff' ? 'conversation_handoff' : decision.normalizedAction === 'pause' ? 'conversation_pause' : 'reply_decision')
      return { action: decision.normalizedAction, relayId }
    })
    send({ type: 'lumiphone:message_progress', requestId, chatId, characterId, conversationId, actorId: actor.actorId, contactId: actor.contact?.id, phase: 'done' }, userId)
    progressRequestId = ''
    if (outcome?.relayId) {
      if (outcome.action === 'arrival_handoff') void scheduleArrivalContinuation(chatId, characterId, conversationId, userId)
      else void requestRelayContinuation(chatId, characterId, outcome.relayId, userId)
      return
    }
    if (outcome?.action !== 'reply') return
    await generateMessage({ requestId: id('auto_reply'), chatId, characterId, conversationId, speakerActorId: actor.actorId, autonomous: true, signal, instruction: 'Reply naturally only because the latest user text warrants a response.' }, userId)
  } catch (error) {
    spindle.log.warn(`Pocket reply decision skipped: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    if (progressRequestId) send({ type: 'lumiphone:message_progress', requestId: progressRequestId, chatId, characterId, conversationId, phase: 'done' }, userId)
    replyDecisionFlights.delete(flightKey)
  }
}

async function considerAmbientMessage(chatId: string, characterId: string, opportunity: 'turn' | 'roleplay-time', userId?: string): Promise<void> {
  const flightKey = `${viewKey(userId)}:${stateKey(chatId, characterId)}`
  if (ambientFlights.has(flightKey)) return
  ambientFlights.add(flightKey)
  try {
    const preferences = await loadPreferences(userId)
    if (!spindle.permissions.has('generation') || !shouldTakeAmbientOpportunity(preferences.ambientMessaging)) return
    const state = await loadState(chatId, characterId, userId)
    if (preferences.ambientMessaging === 'off') return
    const candidates = ambientEligibleContacts(state.contacts)
      .filter((contact) => contact.generationPolicy.relevant && contactCooldownReady(contact, preferences.ambientMessaging as 'sparse' | 'normal', state.roleplayNow))
      .slice(0, 16)
    if (!candidates.length) return
    const requestId = id('ambient_decision')
    const decision = await runStructuredGeneration('ambient-decision', requestId, {
      type: 'quiet',
      messages: [
        { role: 'system', content: 'Choose at most one conservative fictional off-scene phone-message opportunity. Most opportunities should be none. Return strict JSON only: {"action":"none"} or {"action":"message","contactId":"exact id","direction":"short reason or topic"}. Never select an actor marked in-scene. Do not write the actual message.' },
        { role: 'user', content: `Opportunity: ${opportunity}. Roleplay time: ${state.roleplayNow}. Candidates:\n${candidates.map((contact) => `${contact.id} | ${contact.name} | ${contact.role} | ${contact.description.slice(0, 240)}`).join('\n')}` },
      ],
      parameters: { temperature: 0.35, max_tokens: 120 }, userId,
    }, userId)
    if (decision.action !== 'message') return
    const contact = candidates.find((entry) => entry.id === text(decision.contactId, 180))
    if (!contact) return
    const conversation = ensureDirectConversation(state, contact.id, nowIso(), id)
    await saveState(state, userId)
    await generateMessage({
      requestId: id('ambient_message'), chatId, characterId, conversationId: conversation.id, speakerContactId: contact.id,
      instruction: text(decision.direction, 500) || 'Send a brief natural message appropriate to your off-scene life.', ambient: true, initiated: true, autonomous: true,
    }, userId)
  } catch (error) {
    spindle.log.warn(`Pocket ambient opportunity skipped: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    ambientFlights.delete(flightKey)
  }
}

function parseTagContent(content: string): AnyRecord {
  const trimmed = content.trim()
  if (!trimmed.startsWith('{')) return { text: trimmed }
  try {
    const parsed = JSON.parse(trimmed)
    return isRecord(parsed) ? parsed : { text: trimmed }
  } catch {
    return { text: trimmed }
  }
}

function actionSemanticKey(action: string, input: AnyRecord, payload: AnyRecord): string {
  const merged: AnyRecord = { ...input, ...payload }
  for (const key of ['type', 'requestId', 'request_id', 'commandId', 'command_id', 'idempotencyKey', 'chatId', 'chat_id', 'characterId', 'character_id', 'messageId', 'message_id', 'payload', '__candidateOrigin', '__candidateCommitted', '__recoveredFromNarrative', 'recoveryIndex']) delete merged[key]
  const normalized = Object.keys(merged).sort().reduce<AnyRecord>((result, key) => {
    const value = merged[key]
    result[key] = typeof value === 'string' ? value.trim() : value
    return result
  }, {})
  return `${action}:${JSON.stringify(normalized).slice(0, 4_000)}`
}

function reserveCommand(state: PhoneState, input: AnyRecord, action: string, payload: AnyRecord, source: 'model' | 'user' | 'tag'): { accepted: boolean; command: ProcessedPocketCommand } {
  const commandId = text(input.idempotencyKey ?? input.commandId ?? input.command_id ?? input.requestId, 240)
  const origin = source !== 'user' ? candidateOrigin(input.__candidateOrigin) : undefined
  const baseSemanticKey = actionSemanticKey(action, input, payload)
  const semanticKey = origin
    ? `candidate:${origin.chatId}:${origin.hostMessageId}:${origin.swipeId}:${baseSemanticKey}`.slice(0, 4_000)
    : baseSemanticKey
  const cutoff = Date.now() - 20_000
  const commandDuplicate = commandId ? state.processedCommands.find((entry) => entry.id === commandId) : undefined
  const candidateScoped = Boolean(origin)
  const semanticDuplicate = source !== 'user' && (!commandId || candidateScoped)
    ? state.processedCommands.find((entry) => entry.semanticKey === semanticKey && Date.parse(entry.createdAt) >= cutoff)
    : undefined
  const duplicate = commandDuplicate || semanticDuplicate
  if (duplicate) return { accepted: false, command: duplicate }
  const command: ProcessedPocketCommand = { id: commandId || id('cmd'), semanticKey, createdAt: nowIso() }
  state.processedCommands.push(command)
  state.processedCommands = state.processedCommands.slice(-160)
  return { accepted: true, command }
}

async function applyAction(input: AnyRecord, userId?: string, source: 'model' | 'user' | 'tag' = 'model'): Promise<AnyRecord> {
  const context = await resolveContext(input, userId)
  const action = text(input.action, 40).toLowerCase()
  const key = stateKey(context.chatId, context.characterId)
  const payload = isRecord(input.payload) ? input.payload : input
  const candidateMessageProvisional = source === 'model' && (action === 'message' || action === 'message_batch' || action === 'call') && Boolean(candidateOrigin(input.__candidateOrigin, context.chatId)) && !bool(input.__candidateCommitted)
  if (action === 'camera') {
    const reserved = await withStateLock(key, async () => {
      const state = await loadState(context.chatId, context.characterId, userId)
      const reservation = reserveCommand(state, input, action, payload, source)
      if (!reservation.accepted) {
        sendActivity(state.activities.find((entry) => entry.id === reservation.command.activityId), userId)
        return null
      }
      await saveState(state, userId)
      return reservation.command
    })
    return reserved ? cameraGenerate({ ...input, __commandId: reserved.id, __sourceMessageId: input.messageId }, userId) : { ok: true, action, deduplicated: true }
  }
  return withStateLock(key, async () => {
    const state = await loadState(context.chatId, context.characterId, userId)
    const preferences = await loadPreferences(userId)
    const reservation = reserveCommand(state, input, action, payload, source)
    if (!reservation.accepted) {
      const duplicateActivity = state.activities.find((entry) => entry.id === reservation.command.activityId)
      if (!candidateMessageProvisional) sendActivity(duplicateActivity, userId)
      return { ok: true, action, deduplicated: true, activityId: duplicateActivity?.id }
    }
    const command = reservation.command
    const relayIds: string[] = []
    let notification: PhoneNotification | null = null
    let activity: PocketActivity | undefined
    let result: AnyRecord = { ok: true, action }
    if (action === 'open') {
      await saveState(state, userId)
      await sendState(state, userId, 'open', true)
      return result
    }
    if (action === 'scene') {
      const actors = (Array.isArray(payload.actors) ? payload.actors : Array.isArray(payload.contacts) ? payload.contacts : []).slice(0, 8)
      const sceneAt = nowIso()
      for (const contact of state.contacts) contact.presence.inScene = false
      const snapshotActors: SceneActorSnapshot['actors'] = []
      for (const raw of actors) {
        if (!isRecord(raw)) continue
        const name = text(raw.name, 120)
        if (!name || uniqueAliasMatch(name, [state.characterName, state.pocketPersona.displayName].filter(Boolean))) continue
        let actor = state.contacts.find((entry) => entry.id === text(raw.contactId, 180) || actorName(entry.name) === actorName(name))
        if (!actor) {
          const discovered = state.discoveredActors.find((entry) => entry.normalizedName === normalizeActorName(name))
          if (discovered) actor = promoteDiscoveredActor(state, discovered.id, sceneAt, id)
        }
        if (!actor) {
          const identityBrief = text(raw.identityBrief ?? raw.description, 350)
          actor = upsertContact(state, {
            id: id('contact'), name, role: text(raw.role, 120) || 'Scene contact', description: identityBrief, identityBrief,
            sceneNote: '', avatarUrl: '', sourceAvatarUrl: '', avatarOverrideUrl: '', accent: stableContactAccent(name), sourceAccent: '', colorMode: 'pocket',
            source: { kind: 'npc', origin: 'scene', description: identityBrief, sceneKey: sceneKeyFor(name) },
            relationship: 'background',
            presence: { inScene: true, lastSceneAt: sceneAt }, contextPolicy: { pinned: false }, generationPolicy: { relevant: true },
            messagingPolicy: { remoteEligible: true, allowAmbientInScene: false, lastInitiatedMessageAt: '', lastInitiatedRoleplayAt: '' },
            messagingStyle: { talkativeness: 50, fragmentation: 35 }, createdAt: sceneAt, updatedAt: sceneAt,
          })
        }
        actor.presence = { inScene: true, lastSceneAt: sceneAt }
        actor.sceneNote = text(raw.sceneBrief ?? raw.sceneNote, 600)
        snapshotActors.push({ contactId: actor.id, roleHint: text(raw.roleHint ?? raw.role, 120) || actor.role, sceneBrief: actor.sceneNote })
      }
      for (const contact of state.contacts) {
        const conversation = directConversationForContact(state, contact.id)
        if (contact.presence.inScene && conversation && conversation.availability.state !== 'local') {
          const decision = normalizeReplyDecision({
            rawAction: 'handoff', rawReason: conversation.availability.state === 'arriving' ? 'arrived' : 'in_scene',
            contact, conversation, explicitRemoteOverride: false, createdAt: sceneAt,
          })
          relayIds.push(commitConversationHandoff(state, conversation, contact, decision).id)
        } else reconcileContactAvailability(state, contact)
      }
      state.sceneSnapshot = { actors: snapshotActors, capturedAt: sceneAt, sourceMessageId: text(input.messageId, 180), sourceMessageIndex: Math.round(numberValue(payload.sourceMessageIndex, -1)), sourceRevision: Math.max(0, Math.round(numberValue(payload.sourceRevision, 0))), stale: false }
      result.contactIds = snapshotActors.map((entry) => entry.contactId)
      activity = addActivity(state, { kind: 'contact', title: 'Scene snapshot updated', summary: `${snapshotActors.length} actor${snapshotActors.length === 1 ? '' : 's'} present`, route: { app: 'contacts' }, source: { messageId: text(input.messageId, 180) || undefined } }, command)
    } else if (action === 'conversation') {
      if (payload.kind !== undefined && payload.kind !== 'group' && payload.channel !== 'gc' && payload.channel !== 'group') throw new Error('Only explicit group-conversation changes are supported.')
      const title = text(payload.title ?? payload.conversation ?? payload.conversationTitle ?? payload.conversation_title, 120)
      const requestedId = text(payload.conversationId ?? payload.conversation_id, 180)
      let conversation = requestedId ? state.conversations.find((entry) => entry.id === requestedId && entry.kind === 'group') : undefined
      if (requestedId && !conversation) throw new Error('That group conversation no longer exists.')
      if (!conversation && title) {
        const matches = state.conversations.filter((entry) => entry.kind === 'group' && entry.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase())
        if (matches.length > 1) throw new Error(`Group title “${title}” is ambiguous; use its stable conversation id.`)
        conversation = matches[0]
      }
      const refs = Array.isArray(payload.participants) ? payload.participants.slice(0, 16) : []
      const participantActorIds: string[] = []
      let includesPocketPersona = conversation?.includesPocketPersona ?? (source === 'user')
      for (const value of refs) {
        if (actorReferenceIsPocketPersona(state, value)) {
          includesPocketPersona = true
          continue
        }
        const ref = actorRefParts(value)
        let actor = resolveActorReference(state, value)
        if (!actor && ref.name) {
          const discovered = ensureDiscoveredActor(state, {
            name: ref.name, source: 'group-chat', relationship: ref.relationship, now: nowIso(), makeId: id,
          })
          actor = resolvePocketActor(state, discovered.id)
        }
        if (!actor || actor.kind === 'persona') throw new Error('Every group participant needs a valid id or name.')
        if (ref.relationship === 'close') {
          if (actor.contact) actor.contact.relationship = 'close'
          if (actor.discovered) actor.discovered.relationship = 'close'
        }
        if (!participantActorIds.includes(actor.actorId)) participantActorIds.push(actor.actorId)
      }
      if (!refs.length && conversation) {
        participantActorIds.push(...conversationActorIds(conversation))
        includesPocketPersona = conversation.includesPocketPersona
      }
      const totalParticipants = participantActorIds.length + (includesPocketPersona ? 1 : 0)
      if (totalParticipants < 2) throw new Error('A group conversation needs at least two explicit participants.')
      const participantContactIds = participantActorIds.flatMap((actorId) => resolvePocketActor(state, actorId)?.contact?.id || []).filter((entry, index, all) => all.indexOf(entry) === index)
      const changedAt = nowIso()
      if (conversation) {
        conversation.participantActorIds = participantActorIds
        conversation.includesPocketPersona = includesPocketPersona
        conversation.participantContactIds = participantContactIds
        if (title) conversation.title = title
        conversation.updatedAt = changedAt
      } else {
        const names = participantActorIds.map((actorId) => resolvePocketActor(state, actorId)?.name).filter(Boolean)
        conversation = {
          id: id('conversation'), kind: 'group', title: title || names.join(', ').slice(0, 120) || 'Group',
          participantActorIds, includesPocketPersona, participantContactIds, messages: [], unread: 0, availability: { state: 'remote' }, createdAt: changedAt, updatedAt: changedAt,
        }
        state.conversations.push(conversation)
      }
      result = { ...result, conversationId: conversation.id, participantActorIds: [...conversation.participantActorIds], includesPocketPersona: conversation.includesPocketPersona }
      activity = addActivity(state, { kind: 'message', title: conversation.title, summary: `${totalParticipants} participants`, route: { app: 'messages', conversationId: conversation.id }, source: { conversationId: conversation.id } }, command)
    } else if (action === 'message_batch') {
      const rawMessages = Array.isArray(payload.messages) ? payload.messages.slice(0, 24) : []
      const rows = rawMessages.flatMap((entry) => {
        if (!isRecord(entry)) return []
        const messageText = text(entry.text ?? entry.message ?? entry.content, 12_000)
        const speaker = entry.speaker ?? entry.speakerRef ?? entry.speaker_ref ?? entry.sender
        if (!messageText || !speaker) return []
        return [{ raw: entry, speaker, messageText }]
      })
      if (!rows.length) throw new Error('A message batch needs at least one message with speaker and text.')
      const channel = text(payload.channel, 20).toLowerCase()
      if (channel && channel !== 'gc' && channel !== 'group') throw new Error('message_batch currently supports group chats only.')

      const conversation = ensureGroupConversationForMessaging(state, { ...payload, channel: 'gc' }, source, rows.map((entry) => entry.speaker))
      const personaActorId = pocketPersonaActorId(state)
      const communicationActors = conversationDeviceActorIds(state, conversation)
      const actionOrigin = source !== 'user' ? candidateOrigin(input.__candidateOrigin, context.chatId) : undefined
      const createdMessages: PhoneMessage[] = []
      const batchPresentation: NonNullable<PocketActivity['presentation']>['batchMessages'] = []
      const pendingNotifications = new Map<string, { title: string; body: string; route: PocketRoute }>()

      for (const row of rows) {
        const speakerIsPersona = actorReferenceIsPocketPersona(state, row.speaker)
        const sender: PhoneMessage['sender'] = speakerIsPersona || row.raw.sender === 'persona' || row.raw.sender === 'user'
          ? 'persona'
          : row.raw.sender === 'system' ? 'system' : 'contact'
        assertPersonaAuthorship(state, source, sender === 'persona')
        let senderActor = sender === 'persona' ? resolvePocketActor(state, personaActorId) : null
        if (sender === 'contact') {
          senderActor = resolveActorReference(state, row.speaker, conversationDeviceActorIds(state, conversation))
          if (!senderActor || senderActor.kind === 'persona') throw new Error('Every batched group-message sender must resolve to a current group participant.')
        }

        const senderActorId = sender === 'persona' ? personaActorId : sender === 'contact' ? senderActor!.actorId : undefined
        const senderContact = sender === 'contact' ? senderActor!.contact : undefined
        const recipientActorIds = senderActorId ? communicationActors.filter((actorId) => actorId !== senderActorId) : communicationActors
        const readByActorIds = senderActorId ? [senderActorId] : []
        const routeBase: PocketRoute = { app: 'messages', conversationId: conversation.id }
        for (const ownerActorId of recipientActorIds) {
          if (notificationDestinationVisible(state, routeBase, userId, ownerActorId) && !readByActorIds.includes(ownerActorId)) readByActorIds.push(ownerActorId)
        }
        const personaRead = readByActorIds.includes(personaActorId)
        const message: PhoneMessage = {
          id: id('msg'),
          sender,
          senderActorId,
          recipientActorIds,
          readByActorIds,
          senderActorKind: sender === 'contact' ? (senderActor!.kind === 'persona' ? undefined : senderActor!.kind) : undefined,
          senderContactId: senderContact?.id,
          senderName: sender === 'persona' ? (state.pocketPersona.displayName || 'You') : sender === 'system' ? 'Pocket' : senderActor!.name,
          senderAccent: sender === 'contact' ? senderActor!.accent : state.pocketPersona.accent,
          text: row.messageText,
          format: preferences.voiceMessages !== false && voiceMessage(row.raw.format) ? 'voice' : undefined,
          createdAt: phoneMessageTimestamp(state),
          read: personaRead,
          status: sender === 'persona' ? 'sent' : sender === 'system' ? 'read' : personaRead ? 'read' : 'delivered',
          origin: actionOrigin,
          candidateCommitState: actionOrigin ? (candidateMessageProvisional ? 'provisional' : 'committed') : undefined,
        }
        conversation.messages.push(message)
        createdMessages.push(message)

        const direction = messageDirection(state, conversation, message, personaActorId)
        batchPresentation?.push({
          messageId: message.id,
          senderActorId,
          senderName: message.senderName,
          text: row.messageText,
          direction: direction === 'outbound' ? 'sent' : direction === 'inbound' ? 'received' : 'observed',
          format: message.format,
        })

        if (sender !== 'system' && preferences.notifyMessages) {
          const route: PocketRoute = { app: 'messages', conversationId: conversation.id, messageId: message.id }
          for (const ownerActorId of recipientActorIds) {
            if (readByActorIds.includes(ownerActorId)) continue
            pendingNotifications.set(ownerActorId, {
              title: sender === 'persona' ? (state.pocketPersona.displayName || 'You') : senderActor!.name,
              body: preferences.notificationPreviews ? row.messageText.slice(0, 220) : 'New message',
              route,
            })
          }
        }
      }

      conversation.messages = conversation.messages.slice(-MAX_MESSAGES)
      conversation.updatedAt = createdMessages.at(-1)?.createdAt || nowIso()
      conversation.unread = conversationUnreadForDevice(state, conversation, personaActorId)
      for (const [ownerActorId, pending] of pendingNotifications) {
        const ownerNotification = addNotification(state, {
          app: 'messages',
          title: pending.title,
          body: pending.body,
          route: pending.route,
          source: source === 'user' ? 'system' : 'model',
          severity: 'important',
          deviceOwnerActorId: ownerActorId,
        }, userId)
        if (ownerActorId === personaActorId) notification = ownerNotification
      }

      const lastMessage = createdMessages.at(-1)!
      const route: PocketRoute = { app: 'messages', conversationId: conversation.id, messageId: lastMessage.id }
      const messageIds = createdMessages.map((entry) => entry.id)
      result = { ...result, conversationId: conversation.id, messageIds, messageId: lastMessage.id, count: createdMessages.length }
      if (source !== 'user') activity = addActivity(state, {
        kind: 'message',
        title: conversation.title,
        summary: `${createdMessages.length} message${createdMessages.length === 1 ? '' : 's'}`,
        route,
        presentation: {
          kind: 'batch',
          conversationTitle: conversation.title,
          recipientActorIds: conversationDeviceActorIds(state, conversation),
          recipientNames: conversationDeviceActorIds(state, conversation).map((actorId) => resolvePocketActor(state, actorId)?.name || (actorId === personaActorId ? state.pocketPersona.displayName : 'Unknown')).filter(Boolean),
          batchMessages: batchPresentation,
          ...snapshotActivityClock(state),
        },
        source: {
          messageId: text(input.messageId, 180) || actionOrigin?.hostMessageId || undefined,
          conversationId: conversation.id,
          messageIds,
        },
      }, command)
    } else if (action === 'message' || action === 'call') {
      const call = action === 'call' ? normalizeCallMarker({ ...payload, callId: text(payload.callId, 180) || (payload.status !== 'ended' ? id('call') : '') }) : undefined
      if (action === 'call' && !call) throw new Error('A call needs status connected, ended, or missed. Ending a call requires its callId.')
      if (action === 'call' && payload.durationSeconds !== undefined && (typeof payload.durationSeconds !== 'number' || !Number.isFinite(payload.durationSeconds) || payload.durationSeconds < 0 || payload.durationSeconds > 86_400)) throw new Error('Use an explicit duration in seconds, up to one day, or omit it.')
      let messageText = call ? callSummary(call) : text(payload.text ?? payload.message ?? payload.content, 12_000)
      if (!messageText) throw new Error('A phone message needs text.')
      const rawSpeaker = payload.speaker ?? payload.speakerRef ?? payload.speaker_ref
        ?? (payload.sender !== 'user' && payload.sender !== 'persona' && payload.sender !== 'contact' && payload.sender !== 'system' ? payload.sender : undefined)
        ?? (text(payload.senderContactId ?? payload.sender_contact_id, 180) ? { contactId: payload.senderContactId ?? payload.sender_contact_id } : undefined)
        ?? (text(payload.contact_name ?? payload.contactName, 120) ? { contactId: payload.contact_id ?? payload.contactId, name: payload.contact_name ?? payload.contactName, relationship: payload.relationship } : undefined)
      const speakerIsPersona = actorReferenceIsPocketPersona(state, rawSpeaker)
      const sender = source === 'user' || payload.sender === 'user' || payload.sender === 'persona' || speakerIsPersona
        ? 'persona'
        : payload.sender === 'system' ? 'system' : 'contact'
      assertPersonaAuthorship(state, source, sender === 'persona')
      if (call && sender === 'system') throw new Error('A call needs an actual participating speaker.')
      const explicitConversationId = text(payload.conversationId ?? payload.conversation_id, 180)
      const foundConversation = explicitConversationId ? state.conversations.find((entry) => entry.id === explicitConversationId) : undefined
      const channel = text(payload.channel, 20).toLowerCase()
      const groupMessage = channel === 'gc' || channel === 'group' || foundConversation?.kind === 'group' || Boolean(!explicitConversationId && text(payload.conversation ?? payload.conversationTitle ?? payload.conversation_title, 120))
      let conversation: PocketConversation
      let senderActor: ReturnType<typeof resolvePocketActor> = sender === 'persona' ? resolvePocketActor(state, pocketPersonaActorId(state)) : null

      if (groupMessage) {
        const participantRefs = Array.isArray(payload.participants) ? payload.participants : []
        conversation = participantRefs.length
          ? ensureGroupConversationForMessaging(state, payload, source, rawSpeaker ? [rawSpeaker] : [])
          : exactGroupConversation(state, payload)
        const allowed = conversationDeviceActorIds(state, conversation)
        if (sender === 'persona') {
          if (!conversation.includesPocketPersona) throw new Error('The Pocket Persona is not a member of this group. Supply participants to establish membership or change it explicitly before they can speak.')
        } else if (sender === 'contact') {
          senderActor = resolveActorReference(state, rawSpeaker, allowed)
          if (!senderActor || senderActor.kind === 'persona') throw new Error('The named sender is not a participant in this group. Supply participants to establish membership or change it explicitly before they can speak.')
        }
      } else if (foundConversation) {
        conversation = foundConversation
        if (conversation.kind !== 'direct') throw new Error('Use channel "gc" for group messages.')
        if (sender === 'persona') {
          if (!conversation.includesPocketPersona) throw new Error('The Pocket Persona is not a participant in this direct conversation.')
        } else if (sender === 'contact') {
          senderActor = rawSpeaker
            ? resolveActorReference(state, rawSpeaker, conversationActorIds(conversation))
            : conversationActorIds(conversation).length === 1 ? resolvePocketActor(state, conversationActorIds(conversation)[0]) : null
          if (!senderActor || senderActor.kind === 'persona') throw new Error('The message sender must be a participant in this direct conversation.')
        }
      } else if (sender === 'persona') {
        const targetRef = payload.target ?? payload.contactId ?? payload.contact_id
        if (!targetRef && source === 'user') {
          // Preserve the legacy native-phone send path: the frontend historically
          // omitted an explicit target and resolved the active Character DM.
          // Model/tag-authored Persona traffic remains strict so it cannot guess
          // which device conversation should receive a newly-authored message.
          conversation = resolveConversation(state, payload)
        } else {
          const target = ensureMessageActor(state, targetRef, source, payload.relationship ?? payload.close)
          if (!target || target.kind === 'persona') throw new Error('Choose a valid non-Persona direct-message target.')
          conversation = ensureDirectActorConversation(state, target.actorId, nowIso(), id)
        }
      } else if (sender === 'contact') {
        senderActor = ensureMessageActor(state, rawSpeaker, source, payload.relationship ?? payload.close)
        if (!senderActor || senderActor.kind === 'persona') throw new Error('A new direct-message sender needs a name; no full profile is required.')
        const targetRef = payload.target ?? payload.targetRef ?? payload.target_ref
        if (!targetRef || actorReferenceIsPocketPersona(state, targetRef)) {
          conversation = ensureDirectActorConversation(state, senderActor.actorId, nowIso(), id)
        } else {
          const targetActor = ensureMessageActor(state, targetRef, source, payload.relationship ?? payload.close)
          if (!targetActor || targetActor.kind === 'persona') throw new Error('Choose a valid direct-message target.')
          if (targetActor.actorId === senderActor.actorId) throw new Error('A direct message needs two distinct participants.')
          conversation = ensureExternalDirectConversation(state, senderActor.actorId, targetActor.actorId, nowIso(), id)
        }
      } else {
        const target = ensureMessageActor(state, payload.target ?? payload.contactId ?? payload.contact_id, source, payload.relationship ?? payload.close)
        if (!target || target.kind === 'persona') throw new Error('Choose a valid direct-message target.')
        conversation = ensureDirectActorConversation(state, target.actorId, nowIso(), id)
      }

      const personaActorId = pocketPersonaActorId(state)
      const senderActorId = sender === 'persona' ? personaActorId : sender === 'contact' ? senderActor!.actorId : undefined
      const senderContact = sender === 'contact' ? senderActor!.contact : undefined
      const communicationActors = conversationDeviceActorIds(state, conversation)
      const recipientActorIds = senderActorId
        ? communicationActors.filter((actorId) => actorId !== senderActorId)
        : communicationActors
      if (call) {
        const prior = conversation.messages.filter(entry => entry.call?.callId === call.callId).at(-1)?.call
        if (call.status === 'ended' && prior?.status !== 'connected') throw new Error('End an existing connected call in this conversation.')
        if (call.status !== 'ended' && prior) throw new Error('That callId is already used. Start a new call with a fresh id.')
        if (call.status === 'ended' && payload.speakerphone === undefined) call.speakerphone = prior!.speakerphone
        messageText = callSummary(call)
      }
      const readByActorIds = senderActorId ? [senderActorId] : []
      const routeBase: PocketRoute = { app: 'messages', conversationId: conversation.id }
      for (const ownerActorId of recipientActorIds) {
        if (notificationDestinationVisible(state, routeBase, userId, ownerActorId) && !readByActorIds.includes(ownerActorId)) readByActorIds.push(ownerActorId)
      }
      const personaRead = readByActorIds.includes(personaActorId)
      const actionOrigin = source !== 'user' ? candidateOrigin(input.__candidateOrigin, context.chatId) : undefined
      const message: PhoneMessage = {
        id: id('msg'), sender, senderActorId, recipientActorIds, readByActorIds,
        senderActorKind: sender === 'contact' ? (senderActor!.kind === 'persona' ? undefined : senderActor!.kind) : undefined,
        senderContactId: senderContact?.id,
        senderName: sender === 'persona' ? (state.pocketPersona.displayName || 'You') : sender === 'system' ? 'Pocket' : senderActor!.name,
        senderAccent: sender === 'contact' ? senderActor!.accent : state.pocketPersona.accent,
        text: messageText, format: !call && preferences.voiceMessages !== false && voiceMessage(payload.format) ? 'voice' : undefined, createdAt: phoneMessageTimestamp(state), read: personaRead,
        call,
        status: sender === 'persona' ? 'sent' : sender === 'system' ? 'read' : personaRead ? 'read' : 'delivered',
        origin: actionOrigin,
        candidateCommitState: actionOrigin ? (candidateMessageProvisional ? 'provisional' : 'committed') : undefined,
      }
      conversation.messages.push(message)
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES)
      conversation.updatedAt = message.createdAt

      if (sender === 'persona' && source === 'user' && !call) {
        if (conversation.kind === 'group') {
          for (const batch of state.groupBatches.filter((entry) => entry.conversationId === conversation.id && (entry.status === 'queued' || entry.status === 'delivering'))) {
            batch.status = 'cancelled'
            batch.updatedAt = message.createdAt
            for (const queued of batch.messages) if (queued.state === 'queued') queued.state = 'cancelled'
          }
          groupBatchFlights.delete(`${viewKey(userId)}:${stateKey(context.chatId, context.characterId)}:${conversation.id}`)
        }
        const previousBurst = conversation.outgoingBurst
        const explicitRemoteOverride = bool(payload.explicitRemoteOverride ?? payload.explicit_remote_override)
        conversation.outgoingBurst = previousBurst?.open && !previousBurst.finalized
          ? { ...previousBurst, messageIds: [...previousBurst.messageIds, message.id].slice(-12), explicitRemoteOverride: previousBurst.explicitRemoteOverride || explicitRemoteOverride, updatedAt: message.createdAt }
          : { id: id('burst'), messageIds: [message.id], open: true, held: false, finalized: false, explicitRemoteOverride, updatedAt: message.createdAt }
      }
      if (sender === 'contact' && conversation.includesPocketPersona && conversation.kind === 'direct') {
        conversation.pause = undefined
        if (senderContact?.presence.inScene) reconcileContactAvailability(state, senderContact)
        else conversation.availability = { state: 'remote' }
      }

      conversation.unread = conversationUnreadForDevice(state, conversation, personaActorId)
      const route: PocketRoute = { app: 'messages', conversationId: conversation.id, messageId: message.id }
      if (sender !== 'system' && preferences.notifyMessages) {
        for (const ownerActorId of recipientActorIds) {
          if (readByActorIds.includes(ownerActorId)) continue
          const ownerNotification = addNotification(state, {
            app: 'messages',
            title: sender === 'persona' ? (state.pocketPersona.displayName || 'You') : senderActor!.name,
            body: preferences.notificationPreviews ? messageText.slice(0, 220) : 'New message',
            route, source: source === 'user' ? 'system' : 'model', severity: 'important', deviceOwnerActorId: ownerActorId,
          }, userId)
          if (ownerActorId === personaActorId) notification = ownerNotification
        }
      }
      const direction = messageDirection(state, conversation, message, personaActorId)
      const recipientNames = recipientActorIds.map((actorId) => resolvePocketActor(state, actorId)?.name || (actorId === personaActorId ? state.pocketPersona.displayName : 'Unknown')).filter(Boolean)
      result = { ...result, actorId: senderActorId, contactId: senderContact?.id, conversationId: conversation.id, messageId: message.id, direction, callId: call?.callId }
      if (source !== 'user') activity = addActivity(state, {
        kind: call ? 'call' : 'message',
        title: call ? callSummary(call) : direction === 'outbound' ? 'Sent message' : direction === 'inbound' ? 'Received message' : 'Observed message',
        summary: messageText.slice(0, 280), route,
        presentation: {
          kind: direction === 'outbound' ? 'sent' : direction === 'inbound' ? 'received' : 'observed',
          senderActorId, recipientActorIds,
          senderName: message.senderName, recipientNames, conversationTitle: conversation.title,
          format: message.format,
          call,
          ...snapshotActivityClock(state),
        },
        source: { messageId: text(input.messageId, 180) || actionOrigin?.hostMessageId || undefined, contactId: senderContact?.id, conversationId: conversation.id },
      }, command)
    } else if (action === 'contact') {
      const contactId = text(payload.contactId ?? payload.contact_id ?? payload.id, 180)
      let existing = state.contacts.find((entry) => entry.id === contactId)
      const requestedName = text(payload.name ?? payload.title, 120)
      if (!existing && requestedName) {
        const discoveredMatch = state.discoveredActors.find((entry) => entry.normalizedName === requestedName.trim().replace(/\s+/g, ' ').toLocaleLowerCase())
        if (discoveredMatch) existing = promoteDiscoveredActor(state, discoveredMatch.id, nowIso(), id)
      }
      if (requestedName && (!existing || (existing.source.kind === 'npc' && !existing.source.bankId))) {
        const bankEntry = findNpcBankMatch(await loadNpcBank(userId), requestedName)
        if (bankEntry) {
          existing = existing && existing.source.kind === 'npc'
            ? applyNpcBankProfile(existing, bankEntry, nowIso())
            : upsertContact(state, contactFromNpcBank(bankEntry, nowIso(), id), false)
        }
      }
      const name = requestedName || existing?.name
      if (!name) throw new Error('A contact action needs a name.')
      const createdAt = existing?.createdAt || nowIso()
      const requestedAccent = text(payload.accent, 20)
      const identityBrief = text(payload.identityBrief ?? payload.description ?? payload.text ?? payload.content, 1_200) || existing?.identityBrief || existing?.description || ''
      const contact = upsertContact(state, {
        id: existing?.id || id('contact'), name,
        role: text(payload.role, 120) || existing?.role || 'Pocket NPC',
        description: identityBrief, identityBrief, sceneNote: text(payload.sceneNote, 600) || existing?.sceneNote || '',
        avatarUrl: existing?.avatarUrl || '', sourceAvatarUrl: existing?.sourceAvatarUrl || '', avatarOverrideUrl: existing?.avatarOverrideUrl || '',
        accent: /^#[0-9a-f]{6}$/i.test(requestedAccent) ? requestedAccent : existing?.accent || stableContactAccent(name),
        sourceAccent: existing?.sourceAccent || '', colorMode: payload.colorMode === 'source' ? 'source' : existing?.colorMode || 'pocket',
        source: existing?.source || { kind: 'npc', origin: 'manual', description: identityBrief },
        relationship: payload.relationship === 'close' ? 'close' : payload.relationship === 'background' ? 'background' : existing?.relationship || 'background',
        presence: {
          inScene: bool(payload.inScene ?? payload.in_scene, existing?.presence.inScene),
          lastSceneAt: bool(payload.inScene ?? payload.in_scene, existing?.presence.inScene) ? nowIso() : existing?.presence.lastSceneAt || '',
        },
        contextPolicy: { pinned: bool(payload.pinned, existing?.contextPolicy.pinned) },
        generationPolicy: { relevant: bool(payload.generationRelevant ?? payload.generation_relevant, existing?.generationPolicy.relevant ?? true) },
        messagingPolicy: {
          remoteEligible: bool(payload.remoteEligible ?? payload.remote_eligible, existing?.messagingPolicy.remoteEligible ?? true),
          allowAmbientInScene: bool(payload.allowAmbientInScene ?? payload.allow_ambient_in_scene, existing?.messagingPolicy.allowAmbientInScene),
          lastInitiatedMessageAt: existing?.messagingPolicy.lastInitiatedMessageAt || '',
          lastInitiatedRoleplayAt: existing?.messagingPolicy.lastInitiatedRoleplayAt || '',
        },
        messagingStyle: {
          talkativeness: Math.max(0, Math.min(100, Math.round(numberValue(payload.talkativeness, existing?.messagingStyle.talkativeness ?? 50)))),
          fragmentation: Math.max(0, Math.min(100, Math.round(numberValue(payload.fragmentation, existing?.messagingStyle.fragmentation ?? 35)))),
        }, createdAt, updatedAt: nowIso(),
      })
      reconcileContactAvailability(state, contact)
      const route: PocketRoute = { app: 'contacts', contactId: contact.id, view: 'detail' }
      notification = source !== 'user' && preferences.notifyContacts ? addNotification(state, { app: 'contacts', title: contact.name, body: contact.role, route, source: 'model', severity: 'info' }, userId) : null
      result.contactId = contact.id
      activity = addActivity(state, { kind: 'contact', title: contact.name, summary: contact.role, route, source: { messageId: text(input.messageId, 180) || undefined, contactId: contact.id } }, command)
    } else if (action === 'note') {
      const noteId = text(payload.id, 120)
      const existing = state.notes.find((item) => item.id === noteId)
      const body = text(payload.body ?? payload.text ?? payload.content, 40_000)
      const title = text(payload.title, 180) || body.slice(0, 42) || 'Journal entry'
      if (existing) {
        Object.assign(existing, { title, body, mood: text(payload.mood, 80), pinned: bool(payload.pinned, existing.pinned), updatedAt: nowIso() })
        result.noteId = existing.id
      } else {
        const note: PhoneNote = { id: id('note'), title, body, mood: text(payload.mood, 80), pinned: bool(payload.pinned), author: source === 'user' ? 'user' : source === 'tag' ? 'character' : 'model', createdAt: nowIso(), updatedAt: nowIso() }
        state.notes.unshift(note)
        state.notes = state.notes.slice(0, MAX_NOTES)
        result.noteId = note.id
      }
      const route: PocketRoute = { app: 'notes', noteId: String(result.noteId) }
      if (source !== 'user') notification = addNotification(state, { app: 'notes', title: 'Journal updated', body: title, route, source: 'model', severity: 'info' }, userId)
      activity = addActivity(state, { kind: 'note', title: 'Journal updated', summary: title, route, source: { messageId: text(input.messageId, 180) || undefined, noteId: String(result.noteId) } }, command)
    } else if (action === 'event') {
      const eventId = text(payload.id, 120)
      const existing = state.events.find((item) => item.id === eventId)
      const title = text(payload.title, 180) || 'Untitled event'
      const start = text(payload.start, 80) || state.roleplayNow
      const participants = resolveEventParticipants(state, payload.participants ?? payload.participantNames)
      const sourceConversationId = text(payload.sourceConversationId, 180)
      const sourceMessageId = text(payload.sourceMessageId, 180)
      const sourceSuggestionId = text(payload.sourceSuggestionId, 180)
      const event: CalendarEvent = {
        id: existing?.id || id('evt'), title, description: text(payload.description ?? payload.text, 8_000),
        start, end: text(payload.end, 80) || start, color: text(payload.color, 40) || preferences.colors.accent,
        whenKind: payload.whenKind === 'approximate' || payload.whenKind === 'relative' || payload.whenKind === 'unscheduled' ? payload.whenKind : 'exact',
        whenText: text(payload.whenText, 240) || start,
        lane: text(payload.lane, 80) || 'Main timeline', completed: bool(payload.completed, existing?.completed),
        createdBy: source === 'user' ? 'user' : source === 'tag' ? 'character' : 'model',
        actorContactIds: participants.contactIds,
        participantActorIds: participants.actorIds,
        participantNames: participants.names,
        source: sourceConversationId ? {
          app: 'messages',
          conversationId: sourceConversationId,
          messageId: sourceMessageId || undefined,
          suggestionId: sourceSuggestionId || undefined,
        } : existing?.source,
      }
      if (existing) Object.assign(existing, event)
      else state.events.push(event)
      if (sourceConversationId && sourceMessageId && sourceSuggestionId) {
        const sourceConversation = state.conversations.find((entry) => entry.id === sourceConversationId)
        const sourceEntry = sourceConversation ? messageSuggestion(sourceConversation, sourceMessageId) : null
        if (sourceEntry && sourceEntry.suggestion.id === sourceSuggestionId) {
          sourceEntry.suggestion.status = 'scheduled'
          sourceEntry.suggestion.scheduledEventId = event.id
        }
      }
      state.events = state.events.slice(-MAX_EVENTS)
      const route: PocketRoute = { app: 'calendar', eventId: event.id }
      notification = source !== 'user' ? addNotification(state, { app: 'calendar', title: 'Timeline updated', body: title, route, source: 'model', severity: 'important' }, userId) : null
      result.eventId = event.id
      activity = addActivity(state, { kind: 'timeline', title: 'Timeline updated', summary: title, route, source: { messageId: text(input.messageId, 180) || undefined, eventId: event.id } }, command)
    } else if (action === 'weather') {
      state.weather = {
        location: text(payload.location, 160) || state.weather.location,
        condition: text(payload.condition, 120) || state.weather.condition,
        temperature: numberValue(payload.temperature, state.weather.temperature),
        unit: payload.unit === 'F' ? 'F' : 'C',
        high: numberValue(payload.high, state.weather.high), low: numberValue(payload.low, state.weather.low),
        details: text(payload.details ?? payload.text, 2_000) || state.weather.details, updatedAt: nowIso(),
      }
      const route: PocketRoute = { app: 'weather' }
      notification = source !== 'user' ? addNotification(state, { app: 'weather', title: state.weather.location, body: `${state.weather.condition}, ${state.weather.temperature}°${state.weather.unit}`, route, source: 'model', severity: 'info' }, userId) : null
      activity = addActivity(state, { kind: 'weather', title: state.weather.location, summary: `${state.weather.condition}, ${state.weather.temperature}°${state.weather.unit}`, route, source: { messageId: text(input.messageId, 180) || undefined } }, command)
    } else if (action === 'tracker') {
      const trackerCommand = text(payload.command, 30)
      if (trackerCommand && !['create', 'configure', 'update', 'clock'].includes(trackerCommand)) throw new Error('Unknown tracker command.')
      if (trackerCommand === 'create') {
        if (source !== 'user') throw new Error('Tracker creation requires a user request.')
        payload.id = id('trk')
        payload.key = uniqueTrackerKey(payload.key || payload.label, state.trackers)
      }
      const trackerId = text(payload.trackerId ?? payload.tracker_id ?? payload.id, 120)
      const requestedKey = trackerKey(payload.key, '')
      let existing = trackerId ? state.trackers.find((item) => item.id === trackerId) : undefined
      if (!existing && requestedKey && trackerCommand !== 'create') existing = state.trackers.find((item) => item.key === requestedKey)
      if (!existing && !trackerId && !requestedKey && text(payload.label, 120)) {
        const matches = state.trackers.filter((item) => item.label.toLocaleLowerCase() === text(payload.label, 120).toLocaleLowerCase())
        if (matches.length > 1) throw new Error('Tracker label is ambiguous; use trackerId or key.')
        existing = matches[0]
      }
      if (existing && source !== 'user' && (!existing.allowModelWrite || existing.updateMode !== 'model')) {
        throw new Error(`Tracker ${existing.label} does not allow model updates.`)
      }
      const operation = text(payload.operation ?? payload.op, 30) as import('./types.js').TrackerOperation
      if ((trackerCommand === 'configure' || trackerCommand === 'update' || operation) && !existing) throw new Error('That tracker no longer exists.')
      if (trackerCommand === 'configure' && source !== 'user') throw new Error('Only you can change tracker settings.')
      if (trackerCommand === 'configure' && state.trackers.some(entry => entry.id !== existing?.id && entry.key === trackerKey(payload.key))) throw new Error('That tracker key is already used.')
      if (trackerCommand === 'create' || trackerCommand === 'configure') validateTrackerConfig({ ...(existing || {}), ...payload })
      if (trackerCommand === 'update' && !operation) throw new Error('Choose a tracker operation.')
      if (operation && existing?.kind !== 'state' && operation !== 'reset' && !Number.isFinite(Number(payload.amount ?? payload.value))) throw new Error('Enter a valid amount.')
      let next: PhoneTracker
      if (trackerCommand === 'clock') {
        if (source !== 'user' || !existing) throw new Error('Only you can pause an existing tracker.')
        if (!['pause', 'resume'].includes(String(payload.clockAction))) throw new Error('Choose pause or resume.')
        next = setTrackerClockPaused(existing, payload.clockAction === 'pause', state.roleplayClockSource === 'narrative' && state.roleplayClockPrecision !== 'exact' ? '' : state.roleplayNow)
      } else if (existing && operation) {
        next = applyTrackerOperation(existing, {
          operation, amount: numberValue(payload.amount ?? payload.value, 0), state: text(payload.state ?? payload.value, 80),
          reason: text(payload.reason, 300), source, roleplayNow: state.roleplayNow,
        })
      } else {
        const candidate = normalizeTracker({
          ...(existing || {}), ...payload,
          id: existing?.id || trackerId || id('trk'), key: text(payload.key, 120) || existing?.key || text(payload.label, 120),
          label: text(payload.label, 120) || existing?.label || 'Tracker',
          color: text(payload.color, 40) || existing?.color || preferences.colors.accent,
          ratePerHour: payload.ratePerHour ?? payload.rate_per_hour ?? existing?.ratePerHour,
          updatedAt: nowIso(), lastUpdated: existing?.lastUpdated || nowIso(),
        }, { roleplayNow: state.roleplayNow, characterId: state.characterId, characterName: state.characterName })
        if (!candidate) throw new Error('Tracker configuration is invalid.')
        next = candidate
        if (trackerCommand === 'configure' && existing && existing.kind === candidate.kind) {
          if (candidate.kind === 'state' && existing.kind === 'state' && candidate.state !== existing.state) next = applyTrackerOperation({ ...candidate, state: existing.state }, { operation: 'set_state', state: candidate.state, reason: 'Changed in tracker settings', source, roleplayNow: state.roleplayNow })
          else if (candidate.kind !== 'state' && candidate.value !== existing.value) next = applyTrackerOperation({ ...candidate, value: existing.value }, { operation: 'set', amount: candidate.value, reason: 'Changed in tracker settings', source, roleplayNow: state.roleplayNow })
        }
      }
      if (existing) state.trackers[state.trackers.indexOf(existing)] = next
      else state.trackers.push(next)
      state.trackers = state.trackers.slice(-MAX_TRACKERS)
      const route: PocketRoute = { app: 'trackers', trackerId: next.id, view: 'detail' }
      const trackerSummary = next.kind === 'state' ? next.state : `${Number(next.value.toFixed(2))}${next.unit}`
      notification = source !== 'user' && preferences.notifyTrackers ? addNotification(state, { app: 'trackers', title: next.label, body: trackerSummary, route, source: 'model', severity: 'info' }, userId) : null
      result.trackerId = next.id
      activity = addActivity(state, { kind: 'tracker-change', title: next.label, summary: trackerSummary, route, source: { messageId: text(input.messageId, 180) || undefined, trackerId: next.id } }, command)
    } else if (action === 'notify') {
      const requestedApp = text(payload.app ?? input.app, 40)
      const allowedApps = new Set(['home', 'messages', 'contacts', 'gallery', 'camera', 'notes', 'weather', 'calendar', 'trackers', 'settings'])
      const notifyTitle = text(payload.title ?? input.title, 160) || 'Pocket'
      const notifyBody = text(payload.body ?? payload.text ?? payload.content, 1_000)
      const notifyRoute = normalizePocketRoute(payload.route, { app: (allowedApps.has(requestedApp) ? requestedApp : 'home') as PhoneNotification['app'] } as PocketRoute)
      notification = source === 'user' ? null : addNotification(state, {
        app: (allowedApps.has(requestedApp) ? requestedApp : 'home') as PhoneNotification['app'],
        title: notifyTitle, body: notifyBody, route: notifyRoute,
        source: 'model', severity: payload.severity === 'important' || payload.severity === 'error' ? payload.severity : 'info',
      }, userId)
      if (source !== 'user') activity = addActivity(state, { kind: 'system', title: notifyTitle, summary: notifyBody, route: notifyRoute, source: { messageId: text(input.messageId, 180) || undefined } }, command)
    } else {
      throw new Error(`Unsupported phone action: ${action || '(empty)'}`)
    }
    await saveState(state, userId)
    if (!candidateMessageProvisional) {
      if (notification) await maybePush(state, preferences, notification, userId)
      await sendState(state, userId, action, source !== 'user' && preferences.autoOpenOnModelAction)
      sendActivity(activity, userId)
      sendNotification(notification, userId)
    }
    if (action === 'message' && source === 'user' && preferences.autoReplyAfterSend && typeof result.conversationId === 'string') {
      arrivalIdle.cancel(burstTimerKey(context.chatId, context.characterId, result.conversationId, userId))
      void scheduleReplyBurst(context.chatId, context.characterId, result.conversationId, userId)
    }
    for (const relayId of [...new Set(relayIds)]) setTimeout(() => void requestRelayContinuation(context.chatId, context.characterId, relayId, userId), 0)
    return { ...result, activityId: activity?.id }
  })
}

async function handleFrontend(payload: unknown, userId?: string): Promise<void> {
  if (isRecord(payload) && typeof payload.type === 'string' && payload.type.startsWith('mochi:')) {
    if (['mochi:background_account', 'mochi:background_room', 'mochi:schedule', 'mochi:schedule_cancel'].includes(payload.type)) {
      if (!userId) return
      try {
        await mochiScheduler.handle(payload, userId)
        spindle.sendToFrontend({ type: 'mochi:state', requestId: payload.requestId, state: await mochi.state(userId) }, userId)
      } catch { spindle.sendToFrontend({ type: 'mochi:error', requestId: payload.requestId, message: 'Unable to update background messaging. Check account opt-in, room sources, due time and storage.' }, userId) }
      return
    }
    await mochi.handle(payload, userId)
    return
  }
  if (!isRecord(payload) || !text(payload.type, 120).startsWith('lumiphone:')) return
  const requestId = text(payload.requestId, 180)
  try {
    const context = await resolveContext(payload, userId)
    switch (payload.type) {
      case 'lumiphone:get_debug_prompt': {
        const state = await loadState(context.chatId, context.characterId, userId)
        const conversationId = text(payload.conversationId, 180)
        const conversation = state.conversations.find((entry) => entry.id === conversationId)
        if (!conversation) throw new Error('That conversation is no longer available.')
        const generated = [...activeConversationMessages(state, conversation)].reverse().find((message) => Boolean(message.generation?.requestId))
        const promptRequestId = generated?.generation?.requestId || ''
        const debug = await loadPromptDebug(promptRequestId, userId)
        send({
          type: 'lumiphone:debug_prompt',
          requestId,
          conversationId,
          messageId: generated?.id || '',
          generatedAt: generated?.createdAt || '',
          promptRequestId,
          debug,
        }, userId)
        break
      }
      case 'lumiphone:get_state': {
        const state = await loadState(context.chatId, context.characterId, userId)
        await sendState(state, userId, 'load')
        break
      }
      case 'lumiphone:jev_save_key': {
        const apiKey = typeof payload.apiKey === 'string' ? payload.apiKey.trim() : ''
        if (apiKey.length > 500 || /\s/.test(apiKey)) throw new Error('Enter a valid TypeSafe API key without whitespace.')
        await spindle.userStorage.setJson(JEV_CREDENTIALS_PATH, { apiKey }, { userId })
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'jev_key')
        break
      }
      case 'lumiphone:jev_evaluate': {
        await evaluateJevTrackers(context.chatId, context.characterId, userId, text(payload.trackerId, 120), true)
        break
      }
      case 'lumiphone:view_state': {
        frontendViews.set(viewKey(userId), {
          chatId: context.chatId, characterId: context.characterId, deviceOwnerActorId: text(payload.deviceOwnerActorId, 180) || pocketPersonaActorId(await loadState(context.chatId, context.characterId, userId)), open: bool(payload.open),
          route: normalizePocketRoute(payload.route), updatedAt: Date.now(),
        })
        break
      }
      case 'lumiphone:list_contact_sources': {
        const state = await loadState(context.chatId, context.characterId, userId)
        send({ type: 'lumiphone:contact_sources', requestId, sources: await listContactSources(state, userId) }, userId)
        break
      }
      case 'lumiphone:import_contact': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const kind = text(payload.kind, 30)
          const sourceId = text(payload.sourceId, 180)
          const itemId = text(payload.itemId, 180)
          let option = (await listContactSources(state, userId)).find((entry) => entry.kind === kind && entry.sourceId === sourceId && (!itemId || entry.itemId === itemId))
          if (!option) throw new Error('That Character or Council source is no longer available.')
          if (option.kind === 'character' && (!option.avatarUrl || !option.accent)) {
            const presentation = await characterPresentationFor(option.sourceId, userId)
            option = { ...option, avatarUrl: presentation.avatarUrl || option.avatarUrl, accent: presentation.accent || option.accent }
          }
          let imported = contactFromSource(option)
          if (option.kind === 'character') {
            const profiles = normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId })).entries
            const saved = profiles.find(entry => entry.kind === 'character' && entry.sourceId === option.sourceId)
            if (saved) imported = applyIdentityProfile(imported, saved)
          }
          const sourceKey = contactSourceKey(imported.source)
          if (sourceKey) state.suppressedContactSourceKeys = state.suppressedContactSourceKeys.filter((entry) => entry !== sourceKey)
          const contact = upsertContact(state, imported)
          const conversation = ensureDirectConversation(state, contact.id, nowIso(), id)
          const activity = addActivity(state, { kind: 'contact', title: `${contact.name} imported`, summary: contact.role, route: { app: 'contacts', contactId: contact.id, view: 'detail' }, source: { contactId: contact.id, conversationId: conversation.id } })
          await saveState(state, userId)
          await sendState(state, userId, 'contact')
          sendActivity(activity, userId)
          send({ type: 'lumiphone:contact_created', requestId, contactId: contact.id, conversationId: conversation.id }, userId)
        })
        break
      }
      case 'lumiphone:set_presence': {
        if (typeof payload.inScene !== 'boolean') throw new Error('Choose Here or Away for this contact.')
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const contact = state.contacts.find(entry => entry.id === text(payload.contactId, 180))
          if (!contact) throw new Error('That contact is no longer available.')
          contact.presence.inScene = payload.inScene as boolean
          if (contact.presence.inScene) contact.presence.lastSceneAt = nowIso()
          else contact.sceneNote = ''
          contact.updatedAt = nowIso()
          if (state.sceneSnapshot) state.sceneSnapshot.stale = true
          reconcileContactAvailability(state, contact)
          await saveState(state, userId)
          await sendState(state, userId, 'presence')
        })
        break
      }
      case 'lumiphone:save_contact': {
        spindle.log.info(`Pocket contact save invoked: request=${requestId} chat=${context.chatId}`)
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const raw = isRecord(payload.contact) ? payload.contact : payload
          const existing = state.contacts.find((entry) => entry.id === text(raw.id, 180))
          const candidate = normalizePocketContact({
            ...(existing || {}), ...raw,
            id: existing?.id || text(raw.id, 180) || id('contact'),
            source: existing?.source || { kind: 'npc', origin: 'manual', description: text(raw.description, 600) },
            createdAt: existing?.createdAt || nowIso(), updatedAt: nowIso(),
          }, { characterId: state.characterId, characterName: state.characterName, now: nowIso(), makeId: id })
          if (!candidate) throw new Error('A contact needs a name.')
          if (raw.avatarSource && candidate.avatarSource) {
            const image = await resolvePocketImageSource(spindle, candidate.avatarSource, userId)
            assertPocketImageResolved(image)
            candidate.avatarOverrideUrl = image.url
          }
          const contact = upsertContact(state, candidate, false)
          reconcileContactAvailability(state, contact)
          await saveState(state, userId)
          await sendState(state, userId, 'contact')
          spindle.log.info(`Pocket contact save completed: request=${requestId} contact=${contact.id} accent=${contactAccent(contact)}`)
          send({ type: 'lumiphone:contact_saved', requestId, contactId: contact.id, contact }, userId)
        })
        break
      }
      case 'lumiphone:npc_bank_save': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const contact = state.contacts.find((entry) => entry.id === text(payload.contactId, 180))
          if (!contact) throw new Error('That contact no longer exists.')
          if (contact.source.kind !== 'npc') throw new Error('Only Pocket NPC contacts can be saved to NPC Bank.')
          const savedEntry = await withStateLock(`npc-bank:${viewKey(userId)}`, async () => {
            const bank = await loadNpcBank(userId)
            const entry = upsertNpcBankFromContact(bank, contact, nowIso(), id)
            await saveNpcBank(bank, userId)
            return entry
          })
          contact.source = { ...contact.source, bankId: savedEntry.id, description: savedEntry.identityBrief }
          contact.updatedAt = nowIso()
          await saveState(state, userId)
          await sendState(state, userId, 'npc_bank')
          send({ type: 'lumiphone:npc_bank_saved', requestId, contactId: contact.id, bankId: savedEntry.id, name: savedEntry.name }, userId)
        })
        break
      }
      case 'lumiphone:contact_group_save':
      case 'lumiphone:contact_group_delete':
      case 'lumiphone:contact_group_bank':
      case 'lumiphone:npc_cast_import': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          state.contactGroups ||= []
          let groupId = text(payload.groupId, 180)
          if (payload.type === 'lumiphone:contact_group_save') {
            const group = saveContactGroup(state.contactGroups, { id: groupId || undefined, name: text(payload.name, 120), memberIds: stringArray(payload.memberIds, 80, 180) }, state.contacts.map(entry => entry.id), nowIso(), id)
            groupId = group.id
          } else if (payload.type === 'lumiphone:contact_group_delete') {
            if (!state.contactGroups.some(group => group.id === groupId)) throw new Error('That group no longer exists.')
            state.contactGroups = state.contactGroups.filter(group => group.id !== groupId)
          } else if (payload.type === 'lumiphone:contact_group_bank') {
            const group = state.contactGroups.find(group => group.id === groupId)
            if (!group) throw new Error('That group no longer exists.')
            const members = group.memberIds.map(memberId => state.contacts.find(contact => contact.id === memberId)).filter((contact): contact is PocketContact => Boolean(contact))
            if (!members.length || members.some(contact => contact.source.kind !== 'npc')) throw new Error('Portable casts contain Pocket NPCs. Choose an NPC-only group first.')
            await withStateLock(`npc-bank:${viewKey(userId)}`, async () => {
              const bank = await loadNpcBank(userId)
              const memberIds = members.map(contact => {
                const entry = upsertNpcBankFromContact(bank, contact, nowIso(), id)
                if (contact.source.kind === 'npc') contact.source.bankId = entry.id
                return entry.id
              })
              const existing = bank.groups.find(cast => cast.id === group.bankGroupId)
              const cast = saveContactGroup(bank.groups, { id: existing?.id, name: group.name, memberIds }, bank.entries.map(entry => entry.id), nowIso(), id)
              group.bankGroupId = cast.id
              await saveNpcBank(bank, userId)
            })
          } else {
            const bank = await loadNpcBank(userId)
            const cast = bank.groups.find(group => group.id === groupId)
            if (!cast) throw new Error('That saved cast no longer exists.')
            const selected = stringArray(payload.memberIds, 80, 180)
            if (!selected.length || selected.some(memberId => !cast.memberIds.includes(memberId))) throw new Error('Choose valid cast members to import.')
            const entries = selected.map(memberId => bank.entries.find(entry => entry.id === memberId))
            if (entries.some(entry => !entry)) throw new Error('A cast member no longer exists.')
            const newCount = entries.filter(entry => !state.contacts.some(contact => contact.source.kind === 'npc' && contact.source.bankId === entry!.id)).length
            if (state.contacts.length + newCount > 80) throw new Error('This cast would exceed the contact limit. Import fewer members.')
            const memberIds = entries.map(entry => {
              const existing = state.contacts.find(contact => contact.source.kind === 'npc' && contact.source.bankId === entry!.id)
              return existing?.id || upsertContact(state, contactFromNpcBank(entry!, nowIso(), id), false).id
            })
            let local = state.contactGroups.find(group => group.bankGroupId === cast.id)
            if (local) { local.memberIds = [...new Set([...local.memberIds, ...memberIds])]; local.updatedAt = nowIso() }
            else local = saveContactGroup(state.contactGroups, { name: cast.name, memberIds, bankGroupId: cast.id }, state.contacts.map(entry => entry.id), nowIso(), id)
            groupId = local.id
          }
          await saveState(state, userId)
          await sendState(state, userId, 'contact_groups')
          send({ type: 'lumiphone:collection_done', requestId, groupId, view: 'groups', message: payload.type === 'lumiphone:npc_cast_import' ? 'Cast imported. Existing local state was preserved.' : 'Contact group updated.' }, userId)
        })
        break
      }
      case 'lumiphone:npc_cast_save':
      case 'lumiphone:npc_cast_delete':
      case 'lumiphone:npc_bank_edit': {
        await withStateLock(`npc-bank:${viewKey(userId)}`, async () => {
          const bank = await loadNpcBank(userId)
          const groupId = text(payload.groupId, 180)
          if (payload.type === 'lumiphone:npc_cast_save') saveContactGroup(bank.groups, { id: groupId || undefined, name: text(payload.name, 120), memberIds: stringArray(payload.memberIds, 80, 180) }, bank.entries.map(entry => entry.id), nowIso(), id)
          else if (payload.type === 'lumiphone:npc_cast_delete') {
            if (!bank.groups.some(group => group.id === groupId)) throw new Error('That saved cast no longer exists.')
            bank.groups = bank.groups.filter(group => group.id !== groupId)
          } else {
            const entry = bank.entries.find(entry => entry.id === text(payload.bankId, 180))
            if (!entry) throw new Error('That NPC Bank profile no longer exists.')
            const edit = isRecord(payload.entry) ? payload.entry : {}
            const name = text(edit.name, 120)
            if (!name) throw new Error('Give the NPC a name.')
            const previousName = entry.name
            Object.assign(entry, { name, normalizedName: normalizeNpcBankName(name), role: text(edit.role, 120), identityBrief: text(edit.identityBrief, 1200), phoneProfile: isRecord(edit.phoneProfile) ? edit.phoneProfile : entry.phoneProfile, aliases: [...new Set([...entry.aliases, ...(previousName !== name ? [previousName] : []), ...stringArray(edit.aliases, 24, 120)])], tags: stringArray(edit.tags, 24, 80), updatedAt: nowIso() })
          }
          await saveNpcBank(bank, userId)
        })
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'npc_bank')
        send({ type: 'lumiphone:collection_done', requestId, view: 'bank', message: 'NPC Bank updated. Existing chats keep their local state.' }, userId)
        break
      }
      case 'lumiphone:npc_bank_add': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const bank = await loadNpcBank(userId)
          const bankId = text(payload.bankId, 180)
          const bankEntry = bank.entries.find((entry) => entry.id === bankId)
          if (!bankEntry) throw new Error('That NPC Bank profile no longer exists.')
          const bankNames = new Set([bankEntry.name, ...bankEntry.aliases].map((name) => normalizeNpcBankName(name)))
          let contact = state.contacts.find((entry) => entry.source.kind === 'npc' && entry.source.bankId === bankId)
            || state.contacts.find((entry) => entry.source.kind === 'npc' && bankNames.has(normalizeNpcBankName(entry.name)))
          if (!contact) {
            const discovered = state.discoveredActors.find((entry) => bankNames.has(normalizeNpcBankName(entry.displayName)))
            if (discovered) {
              contact = promoteDiscoveredActor(state, discovered.id, nowIso(), id)
              for (const conversation of state.conversations) {
                if (!conversationActorIds(conversation).includes(discovered.id) || conversation.participantContactIds.includes(contact.id)) continue
                conversation.participantContactIds.push(contact.id)
              }
            }
          }
          if (contact) contact = applyNpcBankProfile(contact, bankEntry, nowIso())
          else contact = upsertContact(state, contactFromNpcBank(bankEntry, nowIso(), id), false)
          await saveState(state, userId)
          await sendState(state, userId, 'npc_bank')
          send({ type: 'lumiphone:npc_bank_added', requestId, contactId: contact.id, bankId, name: contact.name, openConfig: bool(payload.openConfig) }, userId)
        })
        break
      }
      case 'lumiphone:npc_bank_delete': {
        const bankId = text(payload.bankId, 180)
        if (!bankId) throw new Error('Choose an NPC Bank profile to forget.')
        const removedName = await withStateLock(`npc-bank:${viewKey(userId)}`, async () => {
          const bank = await loadNpcBank(userId)
          const existing = bank.entries.find((entry) => entry.id === bankId)
          if (!existing || !removeNpcBankEntry(bank, bankId, nowIso())) throw new Error('That NPC Bank profile no longer exists.')
          await saveNpcBank(bank, userId)
          return existing.name
        })
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'npc_bank')
        send({ type: 'lumiphone:npc_bank_deleted', requestId, bankId, name: removedName }, userId)
        break
      }
      case 'lumiphone:generate_contact':
        await generateNpcContact(payload, userId)
        break
      case 'lumiphone:refresh_contact_profile':
        await refreshCompactContactProfile(payload, userId)
        break
      case 'lumiphone:sync_scene_contacts':
        await syncSceneContacts(payload, userId)
        break
      case 'lumiphone:open_direct': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const actorId = text(payload.actorId ?? payload.contactId, 180)
          if (!resolvePocketActor(state, actorId)) throw new Error('That actor no longer exists.')
          const conversation = ensureDirectActorConversation(state, actorId, nowIso(), id)
          await saveState(state, userId)
          send({ type: 'lumiphone:conversation_opened', requestId, conversationId: conversation.id }, userId)
          await sendState(state, userId, 'conversation')
        })
        break
      }
      case 'lumiphone:promote_discovered_actor': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const actorId = text(payload.actorId, 180)
          const promotedAt = nowIso()
          let contact = promoteDiscoveredActor(state, actorId, promotedAt, id)
          const bankEntry = findNpcBankMatch(await loadNpcBank(userId), contact.name)
          if (contact.source.kind === 'npc' && !contact.source.bankId && bankEntry) {
            contact = applyNpcBankProfile(contact, bankEntry, promotedAt)
          }
          for (const conversation of state.conversations) {
            if (!conversationActorIds(conversation).includes(actorId) || conversation.participantContactIds.includes(contact.id)) continue
            conversation.participantContactIds.push(contact.id)
          }
          await saveState(state, userId)
          await sendState(state, userId, 'actor_promoted')
          send({ type: 'lumiphone:discovered_actor_promoted', requestId, actorId, contactId: contact.id }, userId)
        })
        break
      }
      case 'lumiphone:create_conversation': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const participantActorIds = [...new Set((Array.isArray(payload.participantActorIds) ? payload.participantActorIds : Array.isArray(payload.participantContactIds) ? payload.participantContactIds : []).map((entry) => text(entry, 180)).filter((entry) => Boolean(resolvePocketActor(state, entry))))].slice(0, 16)
          if (participantActorIds.length < 2) throw new Error('A group conversation needs at least two participants.')
          const participantContactIds = participantActorIds.flatMap((actorId) => resolvePocketActor(state, actorId)?.contact?.id || []).filter((entry, index, all) => all.indexOf(entry) === index)
          const createdAt = nowIso()
          const conversation: PocketConversation = {
            id: id('conversation'), kind: 'group', title: text(payload.title, 120) || participantActorIds.map((entry) => resolvePocketActor(state, entry)?.name).filter(Boolean).join(', ').slice(0, 120) || 'Group',
            participantActorIds, includesPocketPersona: true, participantContactIds, messages: [], unread: 0, availability: { state: 'remote' }, createdAt, updatedAt: createdAt,
          }
          state.conversations.push(conversation)
          await saveState(state, userId)
          await sendState(state, userId, 'conversation')
          send({ type: 'lumiphone:conversation_opened', requestId, conversationId: conversation.id }, userId)
        })
        break
      }
      case 'lumiphone:update_conversation': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const conversation = state.conversations.find((entry) => entry.id === text(payload.conversationId, 180))
          if (!conversation || conversation.kind !== 'group') throw new Error('That group conversation no longer exists.')
          const participantActorIds = [...new Set((Array.isArray(payload.participantActorIds) ? payload.participantActorIds : Array.isArray(payload.participantContactIds) ? payload.participantContactIds : conversationActorIds(conversation)).map((entry) => text(entry, 180)).filter((entry) => Boolean(resolvePocketActor(state, entry))))].slice(0, 16)
          if (participantActorIds.length < 2) throw new Error('A group conversation needs at least two participants.')
          const participantContactIds = participantActorIds.flatMap((actorId) => resolvePocketActor(state, actorId)?.contact?.id || []).filter((entry, index, all) => all.indexOf(entry) === index)
          conversation.participantActorIds = participantActorIds
          conversation.participantContactIds = participantContactIds
          conversation.title = text(payload.title, 120) || conversation.title
          conversation.updatedAt = nowIso()
          await saveState(state, userId)
          await sendState(state, userId, 'conversation')
          send({ type: 'lumiphone:conversation_opened', requestId, conversationId: conversation.id }, userId)
        })
        break
      }
      case 'lumiphone:save_preferences':
      case 'lumiphone:save_settings': {
        const existing = await loadPreferences(userId)
        const next = normalizePreferences({ ...existing, ...(isRecord(payload.preferences) ? payload.preferences : isRecord(payload.settings) ? payload.settings : {}) })
        await validateChangedWallpaperSources(existing, next, userId)
        await savePreferences(next, userId)
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'preferences')
        break
      }
      case 'lumiphone:identity_profile_save': {
        const state = await loadState(context.chatId, context.characterId, userId)
        const kind = payload.kind === 'persona' ? 'persona' : 'character'
        const contact = state.contacts.find(entry => entry.id === text(payload.contactId, 180) && entry.source.kind === 'character')
        if (kind === 'character' && !contact) throw new Error('Choose a character contact to save its profile.')
        let value = kind === 'persona' ? state.pocketPersona : contact!
        const sourceId = kind === 'persona' ? state.pocketPersona.linkedPersonaId || (await resolveActivePocketPersona(userId))?.linkedPersonaId || '' : contact!.source.kind === 'character' ? contact!.source.characterId : ''
        if (isRecord(payload.profile)) {
          const draft = normalizeIdentityProfiles({ version: 1, entries: [{ ...payload.profile, id: 'draft', kind, sourceId, updatedAt: nowIso() }] }).entries[0]
          if (!draft) throw new Error('Give this profile a name before saving it.')
          value = applyIdentityProfile(value, draft)
        }
        await withStateLock('identity-profiles:' + viewKey(userId), async () => {
          const bank = normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId }))
          saveIdentityProfile(bank, value, kind, sourceId, nowIso(), () => id('profile'))
          await spindle.userStorage.setJson(IDENTITY_PROFILES_PATH, bank, { indent: 2, userId })
        })
        await sendState(state, userId, 'identity_profile_saved')
        send({ type: 'lumiphone:identity_profile_saved', requestId }, userId)
        break
      }
      case 'lumiphone:identity_profile_apply': {
        const profiles = normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId })).entries
        const profile = profiles.find(entry => entry.id === text(payload.profileId, 180) && entry.kind === payload.kind)
        if (!profile) throw new Error('That saved profile is unavailable.')
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          if (profile.kind === 'persona') {
            state.pocketPersona = { ...applyIdentityProfile(state.pocketPersona, profile), source: 'manual' }
            state.setup.personaConfigured = true
          } else {
            const contact = state.contacts.find(entry => entry.id === text(payload.contactId, 180) && entry.source.kind === 'character')
            if (!contact) throw new Error('Choose a character contact to apply this profile.')
            Object.assign(contact, applyIdentityProfile(contact, profile))
          }
          await saveState(state, userId); await sendState(state, userId, 'identity_profile_applied')
        })
        send({ type: 'lumiphone:identity_profile_applied', requestId }, userId)
        break
      }
      case 'lumiphone:save_pocket_persona': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const next = normalizePocketPersona(payload.persona, state.pocketPersona)
          next.source = payload.followLumiverse === true ? 'lumiverse' : next.source === 'lumiverse' ? 'manual' : next.source
          if (next.source === 'lumiverse') {
            const preservedPhoneProfile = next.phoneProfile
            const hostPersona = await resolveActivePocketPersona(userId)
            if (hostPersona) Object.assign(next, hostPersona)
            next.phoneProfile = preservedPhoneProfile
          }
          next.updatedAt = nowIso()
          state.pocketPersona = next
          state.setup.personaConfigured = true
          await saveState(state, userId)
          await sendState(state, userId, 'pocket_persona')
          send({ type: 'lumiphone:pocket_persona_saved', requestId }, userId)
        })
        break
      }
      case 'lumiphone:cancel_app_review': {
        appReviews.cancel(context, text(payload.operationRequestId, 180), userId)
        break
      }
      case 'lumiphone:weather_week':
      case 'lumiphone:timeline_review': {
        if (!spindle.permissions.has('generation')) throw new Error('Enable Generation to review this app.')
        await appReviews.run(context, payload.type === 'lumiphone:weather_week' ? 'weather-week' : 'timeline-review', requestId, userId)
        break
      }
      case 'lumiphone:setup_world_seed': {
        if (!spindle.permissions.has('generation')) throw new Error('Enable Generation before seeding Pocket world state.')
        send({ type: 'lumiphone:operation_progress', task: 'world-seed', requestId, phase: 'generating', message: 'Reading roleplay and seeding world…' }, userId)
        try {
          const timezoneOffsetMinutes = Number(payload.timezoneOffsetMinutes)
          if (Number.isFinite(timezoneOffsetMinutes)) {
            await withStateLock(stateKey(context.chatId, context.characterId), async () => {
              const state = await loadState(context.chatId, context.characterId, userId)
              state.roleplayTimezoneOffsetMinutes = Math.max(-840, Math.min(840, timezoneOffsetMinutes))
              await saveState(state, userId)
            })
          }
        const seed = await refreshNarrativeSeed(context.chatId, context.characterId, userId)
        if (!seed) throw new Error('Pocket could not find committed roleplay text to seed the world yet.')
        send({ type: 'lumiphone:operation_progress', task: 'world-seed', requestId, phase: 'saving', message: 'Saving world, Weather, and Timeline…' }, userId)
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          state.setup.worldStatus = 'seeded'
          state.setup.worldSeededAt = nowIso()
          applySetupCurrentGoal(state, seed)
          await saveState(state, userId)
          await sendState(state, userId, 'setup_world')
        })
        send({
          type: 'lumiphone:setup_world_done',
          requestId,
          setting: seed.world.setting,
          worldFacts: seed.world.facts.length,
          timelineItems: seed.timeline.length,
        }, userId)
        send({ type: 'lumiphone:operation_progress', task: 'world-seed', requestId, phase: 'complete', message: 'World seed ready' }, userId)
        } catch (error) {
          send({ type: 'lumiphone:operation_progress', task: 'world-seed', requestId, phase: 'error', message: error instanceof Error ? error.message : 'World seed failed' }, userId)
          throw error
        }
        break
      }
      case 'lumiphone:setup_world_skip': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          state.setup.worldStatus = 'skipped'
          state.setup.worldSeededAt = undefined
          await saveState(state, userId)
          await sendState(state, userId, 'setup_world')
        })
        break
      }
      case 'lumiphone:set_authorship': {
        if (payload.authorship !== 'roleplay' && payload.authorship !== 'impersonation') throw new Error('Choose Roleplay or Impersonation.')
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          state.setup.authorship = payload.authorship === 'impersonation' ? 'impersonation' : 'roleplay'
          await saveState(state, userId)
          await sendState(state, userId, 'authorship')
        })
        break
      }
      case 'lumiphone:finish_setup': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          if (!state.setup.personaConfigured) throw new Error('Choose the Pocket Persona before finishing setup.')
          if (payload.authorship === 'roleplay' || payload.authorship === 'impersonation') state.setup.authorship = payload.authorship
          if (state.setup.worldStatus !== 'seeded' && state.setup.worldStatus !== 'skipped') state.setup.worldStatus = 'skipped'
          state.setup.initialized = true
          state.setup.dismissed = false
          await saveState(state, userId)
          await sendState(state, userId, 'setup_complete')
        })
        break
      }
      case 'lumiphone:dismiss_setup': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          state.setup.dismissed = true
          await saveState(state, userId)
          await sendState(state, userId, 'setup')
        })
        break
      }
      case 'lumiphone:cancel_persona_generation': {
        const operationRequestId = text(payload.operationRequestId, 180)
        const job = personaJobs.get(operationRequestId)
        if (job && job.chatId === context.chatId && job.characterId === context.characterId && job.userId === userId) {
          job.cancelled = true
          job.controller.abort()
          send({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId: operationRequestId, phase: 'error', message: 'Enrichment stopped.' }, userId)
        }
        break
      }
      case 'lumiphone:generate_pocket_persona': {
        if (!spindle.permissions.has('generation')) throw new Error('Enable Generation to describe the Pocket Persona from roleplay.')
        const job: CameraJob = { controller: new AbortController(), cancelled: false, chatId: context.chatId, characterId: context.characterId, userId }
        personaJobs.set(requestId, job)
        send({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId, phase: 'generating', message: 'Enriching phone profile…' }, userId)
        try {
        const state = await loadState(context.chatId, context.characterId, userId)
        const messages = spindle.permissions.has('chat_mutation') ? await spindle.chat.getMessages(context.chatId) : []
        const response = await runStructuredGeneration('persona-profile', requestId || id('persona'), {
          signal: job.controller.signal, type: 'quiet',
          messages: [
            { role: 'system', content: 'Create a compact PHONE-SPECIFIC Pocket Persona profile for text-message generation. Describe only the user/persona, never the primary host-RP character. Return strict JSON only: {"displayName":"","pronouns":"","role":"","identityBrief":"","phoneProfile":{"personality":"","appearance":"","textingStyle":""}}. personality: stable temperament/social traits that affect conversation, max 420 chars. appearance: only 1-3 recognizable physical/style details useful for occasional texting references, max 240 chars; no body dossier. textingStyle: casing, punctuation, slang/register, dialect or AAVE only when actually established, emoji vs kaomoji habits, message length/fragmentation, abbreviations, and other stable texting quirks, max 420 chars. identityBrief: a compact fallback identity/role summary, max 300 chars. Infer only from supplied evidence; do not stereotype from demographics and leave unsupported quirks blank. No markdown.' },
            { role: 'user', content: `CURRENT POCKET PERSONA\nName: ${state.pocketPersona.displayName}\nRole: ${state.pocketPersona.role}\nSource description: ${text(state.pocketPersona.identityBrief, 1_500) || '(none)'}\n\nRECENT ROLEPLAY EVIDENCE\n${messages.slice(-18).map((message: any) => `${message.role}: ${sanitizeNarrativeContent(message.content, 700)}`).join('\n').slice(-9_000) || '(none)'}` },
          ],
          parameters: { temperature: 0.2, max_tokens: 360 }, userId,
        }, userId)
        job.controller.signal.throwIfAborted()
        const preview = normalizePocketPersona({ ...state.pocketPersona, ...response, source: 'generated', linkedPersonaId: '', updatedAt: nowIso() }, state.pocketPersona)
        send({ type: 'lumiphone:pocket_persona_preview', requestId, persona: preview }, userId)
        send({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId, phase: 'complete', message: 'Phone profile ready' }, userId)
        } catch (error) {
          if (!job.cancelled) {
            send({ type: 'lumiphone:operation_progress', task: 'persona-profile', requestId, phase: 'error', message: error instanceof Error ? error.message : 'Persona enrichment failed' }, userId)
            throw error
          }
        } finally {
          if (personaJobs.get(requestId) === job) personaJobs.delete(requestId)
        }
        break
      }
      case 'lumiphone:preview_context': {
        const state = await loadState(context.chatId, context.characterId, userId)
        const conversation = state.conversations.find((entry) => entry.id === text(payload.conversationId, 180))
        if (!conversation) throw new Error('Choose a conversation to preview.')
        const actor = resolvePocketActor(state, conversationActorIds(conversation)[0])
        if (!actor) throw new Error('That conversation has no available actor.')
        const contact = actorAsGenerationContact(actor, nowIso())
        const profile = await resolveContactProfile(contact, userId)
        const projectedConversation = { ...conversation, messages: activeConversationMessages(state, conversation) }
        const assembled = await assemblePocketContext({
          state, contact, conversation: projectedConversation, preferences: await loadPreferences(userId),
          actorIdentity: contact.identityBrief || profile.description,
          getMessages: spindle.permissions.has('chat_mutation') ? () => spindle.chat.getMessages(context.chatId) : undefined,
        })
        send({ type: 'lumiphone:context_preview', requestId, conversationId: conversation.id, diagnostics: assembled.diagnostics }, userId)
        break
      }
      case 'lumiphone:save_roleplay_time': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const nextRoleplayNow = text(payload.roleplayNow, 80) || state.roleplayNow
          state.trackers = state.trackers.map((tracker) => materializeTracker(tracker, nextRoleplayNow).tracker)
          state.roleplayNow = nextRoleplayNow
          state.roleplayClockSource = 'manual'
          state.roleplayClockPrecision = 'exact'
          state.roleplayClockLabel = 'Manual roleplay time'
          const timezoneOffsetMinutes = Number(payload.timezoneOffsetMinutes)
          if (Number.isFinite(timezoneOffsetMinutes)) state.roleplayTimezoneOffsetMinutes = Math.max(-840, Math.min(840, timezoneOffsetMinutes))
          await saveState(state, userId)
          await sendState(state, userId, 'calendar')
          void considerAmbientMessage(context.chatId, context.characterId, 'roleplay-time', userId)
        })
        break
      }
      case 'lumiphone:action': {
        const result = await applyAction(payload, userId, 'user')
        send({ type: 'lumiphone:action_done', requestId, result }, userId)
        break
      }
      case 'lumiphone:model_action': {
        const attrs = isRecord(payload.attrs) ? payload.attrs : {}
        const hostMessageId = text(payload.messageId, 180)
        const fullMatch = text(payload.fullMatch, 40_000)
        const tagOrigin = hostMessageId ? await resolveLegacyTagCandidateOrigin(context.chatId, hostMessageId, userId) : undefined
        const tagPayload = {
          ...parseTagContent(text(payload.content, 40_000)), ...attrs,
          action: text(attrs.action, 40), chat_id: context.chatId, character_id: context.characterId,
          messageId: hostMessageId,
          idempotencyKey: legacyTagIdempotencyKey(hostMessageId, fullMatch),
          ...(tagOrigin ? { __candidateOrigin: tagOrigin, __candidateCommitted: true } : {}),
        }
        const result = await applyAction(tagPayload, userId, 'tag')
        if (tagOrigin && fullMatch) {
          try {
            await rewriteCompiledLegacyTag(tagOrigin, fullMatch, text(result.activityId, 180), text(result.action, 40))
          } catch (error) {
            spindle.log.warn(`Pocket fallback tag rewrite skipped: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
        break
      }
      case 'lumiphone:composer_state': {
        const conversationId = text(payload.conversationId, 180)
        arrivalIdle.cancel(burstTimerKey(context.chatId, context.characterId, conversationId, userId))
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const conversation = state.conversations.find((entry) => entry.id === text(payload.conversationId, 180))
          if (!conversation?.outgoingBurst?.open || conversation.outgoingBurst.finalized) return
          conversation.outgoingBurst.held = bool(payload.held)
          conversation.outgoingBurst.updatedAt = nowIso()
          await saveState(state, userId)
        })
        if (!bool(payload.held)) { void scheduleReplyBurst(context.chatId, context.characterId, conversationId, userId); void scheduleArrivalContinuation(context.chatId, context.characterId, conversationId, userId) }
        break
      }
      case 'lumiphone:cancel_message_generation': {
        arrivalIdle.cancel(burstTimerKey(context.chatId, context.characterId, text(payload.conversationId, 180), userId))
        const conversationId = text(payload.conversationId, 180)
        replyJobs.cancel(replyJobScope(context.chatId, context.characterId, conversationId, userId))
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const conversation = state.conversations.find(entry => entry.id === conversationId)
          if (conversation?.outgoingBurst) {
            conversation.outgoingBurst.open = false
            conversation.outgoingBurst.finalized = true
          }
          for (const batch of state.groupBatches.filter(entry => entry.conversationId === conversationId && (entry.status === 'queued' || entry.status === 'delivering'))) {
            batch.status = 'cancelled'
            for (const slot of batch.messages) if (slot.state === 'queued') slot.state = 'cancelled'
          }
          await saveState(state, userId)
          await sendState(state, userId, 'message_generation_cancelled')
        })
        break
      }
      case 'lumiphone:generate_message':
        {
        let groupAuto = false
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const conversation = state.conversations.find((entry) => entry.id === text(payload.conversationId, 180))
          groupAuto = Boolean(conversation?.kind === 'group' && (!text(payload.speakerContactId, 180) || text(payload.speakerContactId, 180) === 'auto'))
          if (conversation?.outgoingBurst) {
            conversation.outgoingBurst.open = false
            conversation.outgoingBurst.finalized = true
            conversation.outgoingBurst.updatedAt = nowIso()
            await saveState(state, userId)
          }
        })
        if (groupAuto) await generateGroupBatch({ ...payload, manualOverride: true }, userId)
        else await generateMessage({ ...payload, manualOverride: true }, userId)
        break
        }
      case 'lumiphone:retry_message': {
        const state = await loadState(context.chatId, context.characterId, userId)
        const conversation = state.conversations.find((entry) => entry.id === text(payload.conversationId, 180))
        const message = conversation?.messages.find((entry) => entry.id === text(payload.messageId, 180))
        if (!conversation || !message || message.sender !== 'contact') throw new Error('That generated message can no longer be retried.')
        await generateMessage({
          ...payload,
          replaceMessageId: message.id,
          speakerActorId: message.senderActorId || message.senderContactId,
          instruction: 'Generate a different natural reply for this same point in the phone conversation.',
        }, userId)
        break
      }
      case 'lumiphone:continue_arrival': {
        arrivalIdle.cancel(burstTimerKey(context.chatId, context.characterId, text(payload.conversationId, 180), userId))
        let relayId = ''
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const conversationId = text(payload.conversationId, 180)
          const conversation = state.conversations.find((entry) => entry.id === conversationId && entry.kind === 'direct' && entry.includesPocketPersona !== false)
          if (!conversation) throw new Error('That direct conversation is no longer available.')
          const actor = resolvePocketActor(state, conversationActorIds(conversation)[0])
          if (!actor?.contact) throw new Error('Pocket needs a saved contact before it can bridge this arrival into the main roleplay.')
          const contact = actorAsGenerationContact(actor, nowIso())
          if (contact.presence.inScene || conversation.availability.state === 'local') throw new Error(`${contact.name} is already in the physical scene.`)
          const existing = [...state.relays].reverse().find((entry) => entry.kind === 'arrival' && entry.status === 'pending' && entry.conversationId === conversation.id)
          if (existing) {
            relayId = existing.id
            return
          }
          const decision = normalizeReplyDecision({
            rawAction: 'arrival_handoff', rawReason: 'arriving', contact, conversation,
            explicitRemoteOverride: false, createdAt: nowIso(),
          })
          conversation.lastDecision = decision
          relayId = commitArrivalHandoff(state, conversation, contact, decision).id
          await saveState(state, userId)
          await sendState(state, userId, 'conversation_arrival_handoff')
        })
        if (!relayId) throw new Error('Pocket could not prepare the arrival bridge.')
        void requestRelayContinuation(context.chatId, context.characterId, relayId, userId)
        break
      }
      case 'lumiphone:continue_relay': {
        const state = await loadState(context.chatId, context.characterId, userId)
        const conversationId = text(payload.conversationId, 180)
        const relay = [...state.relays].reverse().find((entry) => entry.status === 'pending' && (!conversationId || entry.conversationId === conversationId))
        if (!relay) throw new Error('There is no pending Pocket handoff for this conversation.')
        void requestRelayContinuation(context.chatId, context.characterId, relay.id, userId)
        break
      }
      case 'lumiphone:arm_reference': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          if (state.references.some((entry) => entry.status === 'injected')) throw new Error('A Pocket reference is already attached to an active roleplay generation.')
          const conversation = state.conversations.find((entry) => entry.id === text(payload.conversationId, 180))
          if (!conversation) throw new Error('That Pocket conversation no longer exists.')
          const scope: PocketReferenceScope = payload.scope === 'recent_messages' || payload.scope === 'selected_messages' ? payload.scope : 'conversation'
          const selectedMessageIds = (Array.isArray(payload.messageIds) ? payload.messageIds : []).map((entry) => text(entry, 180)).filter(Boolean).slice(0, 12)
          const projectedConversation = { ...conversation, messages: activeConversationMessages(state, conversation) }
          if (scope === 'selected_messages' && !selectedMessageIds.some((messageId) => projectedConversation.messages.some((message) => message.id === messageId))) {
            throw new Error('Select at least one message to reference.')
          }
          const reference = createPocketReference({ state, conversation: projectedConversation, scope, selectedMessageIds, createdAt: nowIso(), makeId: id })
          if (!reference.messages.length) throw new Error('That conversation has no messages to reference yet.')
          for (const existing of state.references) {
            if (existing.status === 'armed' || existing.status === 'failed') existing.status = 'cancelled'
          }
          state.references.push(reference)
          state.references = state.references.slice(-24)
          await saveState(state, userId)
          await sendState(state, userId, 'reference_armed')
          send({ type: 'lumiphone:reference_armed', requestId, referenceId: reference.id, conversationId: conversation.id }, userId)
        })
        break
      }
      case 'lumiphone:rearm_reference': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          if (state.references.some((entry) => entry.status === 'injected')) throw new Error('A Pocket reference is already attached to an active roleplay generation.')
          const reference = state.references.find((entry) => entry.id === text(payload.referenceId, 180) && entry.status === 'failed')
          if (!reference) throw new Error('That failed Pocket reference is no longer available to retry.')
          for (const existing of state.references) if (existing.status === 'armed') existing.status = 'cancelled'
          reference.status = 'armed'
          reference.injectedAt = undefined
          reference.injectedGenerationId = undefined
          reference.boundUserMessageId = undefined
          reference.serializedReferenceChars = undefined
          reference.serializedReference = undefined
          reference.consumedAt = undefined
          reference.consumedMessageId = undefined
          reference.error = undefined
          await saveState(state, userId)
          await sendState(state, userId, 'reference_rearmed')
          send({ type: 'lumiphone:reference_armed', requestId, referenceId: reference.id, conversationId: reference.conversationId }, userId)
        })
        break
      }
      case 'lumiphone:cancel_reference': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const reference = state.references.find((entry) => entry.id === text(payload.referenceId, 180) && (entry.status === 'armed' || entry.status === 'failed'))
          if (!reference) throw new Error('That Pocket reference can no longer be cancelled.')
          reference.status = 'cancelled'
          reference.error = undefined
          await saveState(state, userId)
          await sendState(state, userId, 'reference_cancelled')
        })
        break
      }
      case 'lumiphone:test_generation': {
        const testRequestId = requestId || id('connection_test')
        const existing = await loadPreferences(userId)
        await savePreferences({
          ...existing,
          generationMode: payload.generationMode === 'sidecar' ? 'sidecar' : 'roleplay',
          sidecarConnectionId: text(payload.sidecarConnectionId, 180),
          sidecarModelOverride: text(payload.sidecarModelOverride, 500),
        }, userId)
        const started = Date.now()
        const response: any = await runPocketGeneration({ spindle, loadPreferences, savePreferences, send }, 'connection-test', testRequestId, {
          type: 'quiet', messages: [{ role: 'user', content: 'Reply with exactly POCKET_OK' }],
          parameters: { temperature: 0, max_tokens: 32 }, reasoning: { source: 'off' }, userId,
        }, userId)
        send({ type: 'lumiphone:generation_test_result', requestId: testRequestId, ok: text(response.content, 100).includes('POCKET_OK'), latencyMs: Date.now() - started }, userId)
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'generation_test')
        break
      }
      case 'lumiphone:gallery_list':
        send({ type: 'lumiphone:gallery', requestId, scope: payload.scope, ...(await listGallery(payload, userId)) }, userId)
        break
      case 'lumiphone:open_native_image_settings':
        await spindle.ui.openDrawerTab('imagegen', { userId })
        break
      case 'lumiphone:gallery_delete': {
        if (!spindle.permissions.has('images')) throw new Error('Enable Images to manage Pocket photos.')
        if (payload.confirmed !== true) throw new Error('Confirm permanent deletion first.')
        const imageId = text(payload.imageId, 180)
        const asset = imageId ? await spindle.images.get(imageId, { specificity: 'full', onlyOwned: true, userId }) : null
        if (!asset || asset.owner_extension_identifier !== 'lumiphone') throw new Error('Pocket can only delete its own photos. Manage other assets in Lumiverse Gallery.')
        if (!await spindle.images.delete(imageId, userId)) throw new Error('The image could not be deleted.')
        send({ type: 'lumiphone:gallery_action_done', requestId, action: 'delete', imageId, message: 'Photo deleted.' }, userId)
        send({ type: 'lumiphone:gallery', scope: payload.scope, ...(await listGallery(payload, userId)) }, userId)
        break
      }
      case 'lumiphone:gallery_add_to_chat': {
        if (!spindle.permissions.has('chat_mutation')) throw new Error('Enable Chat Mutation to add a Gallery image to the roleplay chat.')
        const imageId = text(payload.imageId, 180)
        const asset: any = imageId && spindle.permissions.has('images') ? await spindle.images.get(imageId, { specificity: 'full', userId }) : null
        const imageUrl = text(asset?.url ?? payload.imageUrl, 2_000)
        if (!imageUrl) throw new Error('That Gallery image is unavailable.')
        const label = (text(asset?.original_filename ?? payload.filename, 180) || 'Pocket photo').replace(/[\[\]]/g, '')
        const messages: any[] = await spindle.chat.getMessages(context.chatId)
        const target = [...messages].reverse().find((message) => message.role === 'assistant' && text(message.content, 40_000))
        if (!target?.id) throw new Error('There is no existing narrative response to attach this image to yet.')
        const marker = `![${label}](${imageUrl})`
        const content = `${text(target.content, 40_000)}\n\n${marker}`
        await spindle.chat.updateMessage(context.chatId, String(target.id), { content })
        send({ type: 'lumiphone:gallery_action_done', requestId, action: 'add-to-chat', messageId: target.id, message: 'Added to the latest narrative response.' }, userId)
        break
      }
      case 'lumiphone:gallery_set_wallpaper': {
        const imageId = text(payload.imageId, 180)
        if (!imageId || !spindle.permissions.has('images')) throw new Error('That Gallery image is unavailable.')
        const source = { kind: 'gallery' as const, imageId }
        assertPocketImageResolved(await resolvePocketImageSource(spindle, source, userId))
        const preferences = await loadPreferences(userId)
        assignWallpaper(preferences, { ...payload, target: payload.personaId ? payload.target === 'chat' ? 'persona-chat' : 'persona-home' : payload.target === 'chat' ? 'device-chat' : 'device-home' }, source)
        await savePreferences(preferences, userId)
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'preferences')
        send({ type: 'lumiphone:gallery_action_done', requestId, action: 'set-wallpaper', message: payload.target === 'chat' ? 'Chat wallpaper updated.' : 'Home wallpaper updated.' }, userId)
        break
      }
      case 'lumiphone:set_wallpaper': {
        const preferences = await loadPreferences(userId)
        const source = payload.source === null ? null : normalizeImageSource(payload.source)
        if (payload.source !== null && !source) throw new Error('Choose a valid Gallery image, uploaded asset, or HTTPS image URL.')
        if (source) assertPocketImageResolved(await resolvePocketImageSource(spindle, source, userId))
        assignWallpaper(preferences, payload, source)
        await savePreferences(preferences, userId)
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'preferences')
        break
      }
      case 'lumiphone:upload_wallpaper_asset': {
        if (!spindle.permissions.has('images')) throw new Error('Enable Images to upload a Pocket background.')
        const dataUrl = text(payload.dataUrl, 12_000_000)
        if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(dataUrl)) throw new Error('Choose a valid image file.')
        const image = await spindle.images.uploadFromDataUrl(dataUrl, {
          originalFilename: text(payload.filename, 240) || 'pocket-background',
          owner_character_id: context.characterId === '_none' ? undefined : context.characterId,
          owner_chat_id: context.chatId === '_lobby' ? undefined : context.chatId,
          userId,
        })
        const source = { kind: 'asset' as const, assetId: image.id }
        assertPocketImageResolved(await resolvePocketImageSource(spindle, source, userId))
        const preferences = await loadPreferences(userId)
        assignWallpaper(preferences, payload, source)
        await savePreferences(preferences, userId)
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'preferences')
        send({ type: 'lumiphone:wallpaper_uploaded', requestId, imageId: image.id }, userId)
        break
      }
      case 'lumiphone:upload_avatar': {
        if (!spindle.permissions.has('images')) throw new Error('Enable Images to save an avatar.')
        const dataUrl = text(payload.croppedDataUrl, 4_000_000)
        if (!/^data:image\/png;base64,[a-z0-9+/=]+$/i.test(dataUrl)) throw new Error('Choose a valid framed avatar.')
        const image = await spindle.images.uploadFromDataUrl(dataUrl, { originalFilename: 'pocket-avatar.png', owner_character_id: context.characterId === '_none' ? undefined : context.characterId, owner_chat_id: context.chatId === '_lobby' ? undefined : context.chatId, userId })
        send({ type: 'lumiphone:avatar_uploaded', requestId, imageId: image.id, imageUrl: image.url }, userId)
        break
      }
      case 'lumiphone:set_contact_photo': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const contact = state.contacts.find((entry) => entry.id === text(payload.contactId, 180))
          if (!contact) throw new Error('That contact no longer exists.')
          let framedSource: any = null
          if (payload.croppedDataUrl) {
            if (!spindle.permissions.has('images')) throw new Error('Enable Images to save an avatar.')
            const dataUrl = text(payload.croppedDataUrl, 4_000_000)
            if (!/^data:image\/png;base64,[a-z0-9+/=]+$/i.test(dataUrl)) throw new Error('Choose a valid framed avatar.')
            const image = await spindle.images.uploadFromDataUrl(dataUrl, { originalFilename: 'pocket-avatar.png', owner_character_id: context.characterId === '_none' ? undefined : context.characterId, owner_chat_id: context.chatId === '_lobby' ? undefined : context.chatId, userId })
            framedSource = { kind: 'asset', assetId: image.id }
          }
          const source = payload.useSource === true ? null : framedSource || normalizeImageSource(payload.source) || normalizeImageSource(payload.imageId ? { kind: 'gallery', imageId: payload.imageId } : { kind: 'url', url: payload.imageUrl })
          let imageUrl = ''
          if (source) { const image = await resolvePocketImageSource(spindle, source, userId); assertPocketImageResolved(image); imageUrl = image.url }
          else if (payload.useSource !== true) throw new Error('Choose a valid contact image.')
          contact.avatarSource = source
          contact.avatarOverrideUrl = imageUrl
          contact.avatarFocus = normalizeAvatarFocus(payload.focus)
          contact.updatedAt = nowIso()
          await saveState(state, userId)
          await sendState(state, userId, 'contact_photo')
          send({ type: 'lumiphone:gallery_action_done', requestId, action: 'set-contact-photo', message: `${contact.name} photo updated.` }, userId)
        })
        break
      }
      case 'lumiphone:camera_generate':
        await cameraGenerate(payload, userId)
        break
      case 'lumiphone:image_options': {
        const connections = spindle.permissions.has('image_gen') ? await spindle.imageGen.listConnections(userId) : []
        send({ type: 'lumiphone:image_options', requestId, connections: connections.map(entry => ({ id: entry.id, name: entry.name })) }, userId)
        break
      }
      case 'lumiphone:camera_cancel': {
        const jobKey = `${viewKey(userId)}:${requestId}`
        const job = cameraJobs.get(jobKey)
        if (job) job.cancelled = true
        job?.controller.abort()
        cameraJobs.delete(jobKey)
        send({ type: 'lumiphone:camera_cancelled', requestId }, userId)
        break
      }
      case 'lumiphone:decline_event_suggestion': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const conversationId = text(payload.conversationId, 180)
          const messageId = text(payload.messageId, 180)
          const suggestionId = text(payload.suggestionId, 180)
          const conversation = state.conversations.find((entry) => entry.id === conversationId)
          const sourceEntry = conversation ? messageSuggestion(conversation, messageId) : null
          if (!sourceEntry || sourceEntry.suggestion.id !== suggestionId) throw new Error('That event suggestion is no longer available.')
          if (sourceEntry.suggestion.status === 'pending') sourceEntry.suggestion.status = 'declined'
          await saveState(state, userId)
          await sendState(state, userId, 'event_suggestion_declined')
        })
        break
      }
      case 'lumiphone:mark_read': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const ownerActorId = text(payload.deviceOwnerActorId, 180) || pocketPersonaActorId(state)
          const app = text(payload.app, 40)
          const notificationId = text(payload.notificationId, 180)
          if (notificationId) {
            const target = state.notifications.find((entry) => entry.id === notificationId)
            if (target && notificationBelongsToDevice(state, ownerActorId, target.deviceOwnerActorId)) markNotificationRead(state.notifications, notificationId)
          }
          const conversationId = text(payload.conversationId, 180)
          const legacyContactId = text(payload.contactId, 180)
          const conversation = state.conversations.find((entry) => entry.id === conversationId) || directConversationForContact(state, legacyContactId)
          if (conversation && conversationDeviceActorIds(state, conversation).includes(ownerActorId)) {
            for (const message of conversation.messages) {
              if (!message.readByActorIds) message.readByActorIds = []
              if (!message.readByActorIds.includes(ownerActorId)) message.readByActorIds.push(ownerActorId)
              if (ownerActorId === pocketPersonaActorId(state)) { message.read = true; message.status = 'read' }
            }
            conversation.unread = conversationUnreadForDevice(state, conversation, pocketPersonaActorId(state))
            state.notifications.forEach((entry) => {
              if (notificationBelongsToDevice(state, ownerActorId, entry.deviceOwnerActorId) && entry.route?.app === 'messages' && entry.route.conversationId === conversation.id) entry.read = true
            })
          } else if (app && app !== 'messages') {
            state.notifications.forEach((entry) => { if (notificationBelongsToDevice(state, ownerActorId, entry.deviceOwnerActorId) && entry.app === app) entry.read = true })
          }
          await saveState(state, userId)
          await sendState(state, userId, 'read')
        })
        break
      }
      case 'lumiphone:notification_dismiss':
      case 'lumiphone:notification_mark_read':
      case 'lumiphone:notifications_clear': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const ownerActorId = text(payload.deviceOwnerActorId, 180) || pocketPersonaActorId(state)
          const notificationId = text(payload.notificationId, 180)
          const target = state.notifications.find((entry) => entry.id === notificationId)
          if (payload.type === 'lumiphone:notification_dismiss' && target && notificationBelongsToDevice(state, ownerActorId, target.deviceOwnerActorId)) dismissNotification(state.notifications, notificationId, nowIso())
          else if (payload.type === 'lumiphone:notification_mark_read' && target && notificationBelongsToDevice(state, ownerActorId, target.deviceOwnerActorId)) markNotificationRead(state.notifications, notificationId)
          else if (payload.type === 'lumiphone:notifications_clear') {
            const scoped = state.notifications.filter((entry) => notificationBelongsToDevice(state, ownerActorId, entry.deviceOwnerActorId))
            clearNotifications(scoped, payload.mode === 'read' ? 'read' : 'all', nowIso())
          }
          await saveState(state, userId)
          await sendState(state, userId, 'notifications')
        })
        break
      }
      case 'lumiphone:delete': {
        await withStateLock(stateKey(context.chatId, context.characterId), async () => {
          const state = await loadState(context.chatId, context.characterId, userId)
          const kind = text(payload.kind, 30)
          const targetId = text(payload.id, 120)
          if (kind === 'note') state.notes = state.notes.filter((entry) => entry.id !== targetId)
          if (kind === 'event') state.events = state.events.filter((entry) => entry.id !== targetId)
          if (kind === 'tracker') state.trackers = state.trackers.filter((entry) => entry.id !== targetId)
          if (kind === 'contact') {
            const deleting = state.contacts.find((entry) => entry.id === targetId)
            if (deleting) {
              const sourceKey = contactSourceKey(deleting.source)
              if (sourceKey && (deleting.source.kind === 'character' || deleting.source.kind === 'council') && !state.suppressedContactSourceKeys.includes(sourceKey)) {
                state.suppressedContactSourceKeys.push(sourceKey)
                state.suppressedContactSourceKeys = state.suppressedContactSourceKeys.slice(-160)
              }
            }
            state.contacts = state.contacts.filter((entry) => entry.id !== targetId)
            for (const actor of state.discoveredActors) if (actor.promotedContactId === targetId) actor.promotedContactId = undefined
            for (const conversation of state.conversations) conversation.participantContactIds = conversation.participantContactIds.filter((entry) => entry !== targetId)
          }
          if (kind === 'conversation') state.conversations = state.conversations.filter((entry) => entry.id !== targetId)
          if (kind === 'message') {
            const conversationId = text(payload.conversationId, 180)
            if (!conversationId) throw new Error('Deleting a Pocket message requires its conversation id.')
            removePocketMessageArtifacts(state, conversationId, targetId)
          }
          await saveState(state, userId)
          await sendState(state, userId, 'delete')
        })
        break
      }
      case 'lumiphone:get_swarm_profile': {
        send({ type: 'lumiphone:swarm_profile', requestId, profile: await resolveSwarmProfile(context.chatId, context.characterId, await loadPreferences(userId), userId) }, userId)
        break
      }
      case 'lumiphone:export_data': {
        const state = await loadState(context.chatId, context.characterId, userId)
        send({ type: 'lumiphone:export_data', requestId, data: { product: 'Pocket', exportVersion: 6, state: { ...state, processedCommands: [] }, preferences: await loadPreferences(userId), npcBank: await loadNpcBank(userId), identityProfiles: normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId })) } }, userId)
        break
      }
      case 'lumiphone:import_data': {
        if (!isRecord(payload.data)) throw new Error('Import must be a Pocket JSON object.')
        const rawState = isRecord(payload.data.state) ? payload.data.state : payload.data
        if (Number(rawState.version) > STATE_VERSION) throw new Error('This backup uses a newer Pocket state schema.')
        const characterName = await characterNameFor(context.characterId, userId)
        const state = normalizeState(rawState, context.chatId, context.characterId, characterName)
        let importedPreferences: DevicePreferences | null = null
        let importedNpcBank: PocketNpcBank | null = null
        if (payload.data.preferences !== undefined) {
          const existing = await loadPreferences(userId)
          importedPreferences = normalizePreferences(payload.data.preferences)
          await validateChangedWallpaperSources(existing, importedPreferences, userId)
        }
        if (payload.data.npcBank !== undefined) {
          if (isFutureNpcBank(payload.data.npcBank)) throw new Error('This backup uses a newer NPC Bank schema.')
          importedNpcBank = normalizeNpcBank(payload.data.npcBank, nowIso())
        }
        const importedIdentityProfiles = payload.data.identityProfiles === undefined ? null : normalizeIdentityProfiles(payload.data.identityProfiles)
        if (importedIdentityProfiles) normalizeIdentityProfiles(await spindle.userStorage.getJson(IDENTITY_PROFILES_PATH, { fallback: null, userId }))
        await saveState(state, userId)
        if (importedIdentityProfiles) await spindle.userStorage.setJson(IDENTITY_PROFILES_PATH, importedIdentityProfiles, { indent: 2, userId })
        if (importedPreferences) await savePreferences(importedPreferences, userId)
        if (importedNpcBank) await saveNpcBank(importedNpcBank, userId)
        await sendState(state, userId, 'import')
        break
      }
      case 'lumiphone:reset_current': {
        const state = defaultState(context.chatId, context.characterId, await characterNameFor(context.characterId, userId))
        await saveState(state, userId)
        await sendState(state, userId, 'reset_current')
        break
      }
      case 'lumiphone:reset_all_roleplay': {
        const files = await spindle.userStorage.list('phones/', userId)
        await Promise.all(files.filter((path) => path.startsWith('phones/')).map((path) => spindle.userStorage.delete(path, userId)))
        const state = defaultState(context.chatId, context.characterId, await characterNameFor(context.characterId, userId))
        await saveState(state, userId)
        await sendState(state, userId, 'reset_all_roleplay')
        break
      }
      case 'lumiphone:reset_preferences': {
        await savePreferences(defaultPreferences(), userId)
        await sendState(await loadState(context.chatId, context.characterId, userId), userId, 'reset_preferences')
        break
      }
      default:
        break
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (error instanceof Error && error.name === 'AbortError') return
    spindle.log.error(`Pocket request failed: ${message}`)
    send({ type: 'lumiphone:error', requestId, error: message }, userId)
  }
}

function registerTool(): void {
  if (!spindle.permissions.has('tools')) return
  spindle.registerTool({
    name: 'phone_action',
    display_name: 'Pocket Action',
    description: 'Pocket persistence tool for the primary roleplay model. Call this tool for every newly-created phone action in the scene, including NPC-to-NPC and off-POV communication, instead of formatting phone messages into narrative text. message_batch may carry one coherent burst of multiple newly-authored messages from the SAME group chat so busy GCs do not need to be summarized or artificially limited. Message/message_batch/call actions are provisional: the tool call alone does NOT commit canon. Every surviving message action MUST include exactly one returned commit marker. Use artifactTag on its own line at the exact story position when the action is visible/readable/observed and DO NOT also quote or style the message text. Use commitTag exactly once when the action truly occurs but should remain wholly off-screen/unrendered. If a call happened only during reasoning and is not part of the final scene, emit neither marker so Pocket discards it. If an NPC phone lights up or an NPC reacts to a newly arrived message, persist the canonical sender, recipient, and message text even when the current POV cannot read the screen. Messages already supplied verbatim in Pocket reference/history are historical and MUST NOT be resent; text invented now is newly-authored canon even when narrated as older chat history. Named actors may be lightweight and need no full profile. GC messages may ensure a missing group when participants are supplied; message_batch can also materialize named speakers and ensure them as members. Explicit conversation actions remain for deliberate membership edits/renames. State persists per chat and character.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['message', 'message_batch', 'call', 'conversation', 'contact', 'scene', 'note', 'event', 'weather', 'tracker', 'camera', 'notify', 'open'] },
        chat_id: { type: 'string', description: 'Current chat id when known.' },
        character_id: { type: 'string', description: 'Current character id when known.' },
        payload: {
          type: 'object',
          description: 'Action data. Respect the chat authorship mode: persona-authored actions are forbidden in Roleplay and allowed in Impersonation. call accepts speaker, target/conversationId, status connected|ended|missed, optional speakerphone and explicit durationSeconds (ended only); reuse the returned callId to end a connected call. Spoken dialogue remains prose. message and each message_batch row may include format="voice" with text containing the spoken transcript to send a playable TTS voice message. Omit format for ordinary text. message accepts channel dm|gc, speaker as a name or {contactId|name}, text/content, and target or a conversation id/exact group title. GC messages may include participants to ensure/create the group and establish membership. message_batch is GC-only and accepts conversation/title, optional participants, and messages:[{speaker,text}, ...] (max 24); Pocket persists each row as an individual canonical message while returning one batch artifact. Named actors can become lightweight discovered actors. conversation uses kind=group, title, and participants as names or actor/contact refs for explicit membership edits/renames. tracker operations target trackerId or stable key and use operation set/add/subtract/reset/set_state.',
          additionalProperties: true,
        },
      },
      required: ['action', 'payload'],
    },
    inline_available: true,
    council_eligible: false,
  } as any)
}

let interceptorDisposer: (() => void) | null = null

function ensureInterceptor(): void {
  if (interceptorDisposer || !spindle.permissions.has('interceptor')) return
  interceptorDisposer = spindle.registerInterceptor(async (messages, context) => {
    try {
      const chatId = context.chatId || '_lobby'
      const characterId = await stateCharacterIdForChat(chatId, context.characterId, context.userId)
      const generationId = text(context.generationId, 180)
      let state = await loadState(chatId, characterId, context.userId)
      const cleanMessages = messages.map((message: any) => typeof message?.content === 'string'
        ? { ...message, content: stripPocketPresentationMarkup(message.content) }
        : message)
      const metadataRelayId = relayIdFromMessages(cleanMessages as unknown as Array<Record<string, unknown>>)
      const generationRelay = generationId ? state.relays.find((entry) => entry.status === 'pending' && entry.continuation.generationId === generationId) : undefined
      const active = state.relays.filter((entry) => entry.status === 'pending' && (
        entry.continuation.state === 'launching' || entry.continuation.state === 'accepted' || entry.continuation.state === 'started'
      ))
      // Current Lumiverse releases omit generationId from interceptor context. Only use
      // the single-active fallback when the host truly supplied no generation identity;
      // an explicit, unrelated generation id must never inherit a Pocket relay.
      const targetRelayId = metadataRelayId || generationRelay?.id || (!generationId && active.length === 1 ? active[0].id : '')
      const relayBlock = pendingRelayContext(state, { relayId: targetRelayId, maxChars: 3_600 })
      const handoffMemoryBlock = targetRelayId ? '' : persistentHandoffContext(state, { maxChars: 2_600 })
      const authorship = state.setup.authorship === 'impersonation'
        ? 'IMPERSONATION: you may author and persist newly-written messages as the Pocket Persona as well as other actors.'
        : 'ROLEPLAY: the human exclusively authors the Pocket Persona. Never send a message or initiate a call as that persona, including aliases, sender=user/persona, or group batches. Explicit phone input is supplied as history; never resend it. Persist other actors’ communication normally. Quoted dialogue in prose is not automatically a text message.'
      const generic = { role: 'system' as const, content: `${PHONE_GUIDANCE}\n${authorship}\nCurrent Pocket snapshot:\n${projectPhoneContext(state)}` }
      const injectedMessages = [...cleanMessages, generic]
      const breakdown = [{ messageIndex: cleanMessages.length, name: 'Pocket memory' }]
      if (handoffMemoryBlock) {
        injectedMessages.push({ role: 'system' as const, content: handoffMemoryBlock })
        breakdown.push({ messageIndex: injectedMessages.length - 1, name: 'Pocket handoff memory — established history' })
      }
      if (relayBlock && targetRelayId) {
        const injectedAt = nowIso()
        let receiptStored = false
        try {
          state = await withStateLock(stateKey(chatId, characterId), async () => {
            const current = await loadState(chatId, characterId, context.userId)
            const target = current.relays.find((entry) => entry.id === targetRelayId && entry.status === 'pending')
            if (!target) throw new Error(`Pending relay ${targetRelayId} disappeared before injection.`)
            const matchedGenerationId = generationId || target.continuation.generationId
            target.injectedAt = injectedAt
            target.injectedGenerationId = matchedGenerationId || undefined
            target.serializedRelayChars = relayBlock.length
            target.serializedRelay = relayBlock
            target.relayExchangeMessageCount = target.conversationTail.recentMessageIds.length
            target.injectionError = undefined
            await saveState(current, context.userId)
            receiptStored = true
            return current
          })
        } catch (error) {
          spindle.log.error(`Pocket relay injection receipt failed: relay=${targetRelayId} error=${error instanceof Error ? error.message : String(error)}`)
        }
        if (receiptStored) {
          injectedMessages.push({ role: 'system' as const, content: relayBlock })
          breakdown.push({ messageIndex: injectedMessages.length - 1, name: 'Pocket continuity relay — newer state' })
          spindle.log.info(`Pocket relay injected: relay=${targetRelayId} generation=${generationId || state.relays.find((entry) => entry.id === targetRelayId)?.continuation.generationId || 'awaiting-association'} chars=${relayBlock.length}`)
        }
      }

      // References are deliberately limited to normal, user-led RP turns. A relay
      // continuation, dry run, swipe/regeneration, or non-user continuation cannot
      // consume the one-shot attachment.
      const generationType = text(context.generationType, 40)
      const lastUserMessage = [...cleanMessages].reverse().find((message: any) => message?.role === 'user' && message.__isChatHistory === true && text(message.sourceMessageId, 180)) as any
      const referenceEligible = !targetRelayId && context.isDryRun !== true && generationType === 'normal' && Boolean(lastUserMessage)
      const armedReference = referenceEligible ? latestArmedReference(state) : undefined
      if (armedReference) {
        let referenceBlock = ''
        try {
          state = await withStateLock(stateKey(chatId, characterId), async () => {
            const current = await loadState(chatId, characterId, context.userId)
            const target = current.references.find((entry) => entry.id === armedReference.id && entry.status === 'armed')
            if (!target) return current
            referenceBlock = serializePocketReference(target, 2_200)
            target.status = 'injected'
            target.injectedAt = nowIso()
            target.injectedGenerationId = generationId || undefined
            target.boundUserMessageId = text(lastUserMessage?.sourceMessageId, 180) || undefined
            target.serializedReferenceChars = referenceBlock.length
            target.serializedReference = referenceBlock
            target.error = undefined
            await saveState(current, context.userId)
            return current
          })
        } catch (error) {
          spindle.log.error(`Pocket reference injection receipt failed: reference=${armedReference.id} error=${error instanceof Error ? error.message : String(error)}`)
          referenceBlock = ''
        }
        if (referenceBlock) {
          injectedMessages.push({ role: 'system' as const, content: referenceBlock })
          breakdown.push({ messageIndex: injectedMessages.length - 1, name: 'Pocket user reference — this turn' })
          spindle.log.info(`Pocket reference injected: reference=${armedReference.id} generation=${generationId || 'awaiting-association'} chars=${referenceBlock.length}`)
        }
      }
      return { messages: injectedMessages, breakdown }
    } catch (error) {
      spindle.log.error(`Pocket interceptor failed: ${error instanceof Error ? error.message : String(error)}`)
      return messages
    }
  }, 70)
}

spindle.frontendCapabilities.declare('message_tag_interceptor')
spindle.onFrontendMessage(handleFrontend)
function pocketArtifactTag(activityId: unknown, action: unknown): string | undefined {
  const value = text(activityId, 180)
  const actionName = text(action, 40)
  return value && (actionName === 'message' || actionName === 'message_batch' || actionName === 'call') ? pocketInlineAnchor(value) : undefined
}

const POCKET_ARTIFACT_TAG_PATTERN = /<pocket-artifact\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/pocket-artifact\s*>)/gi
const POCKET_COMMIT_TAG_PATTERN = /<pocket-commit\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/pocket-commit\s*>)/gi
const POCKET_INLINE_ANCHOR_REF_PATTERN = /\bdata-pocket-inline-anchor\s*=\s*(?:"([^"]+)"|'([^']+)')/gi

function pocketArtifactRef(attrs: string): string {
  const match = /\bref\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(attrs)
  return text(match?.[1] || match?.[2], 180)
}

function candidateCommitRefs(content: string): Set<string> {
  const refs = new Set<string>()
  for (const pattern of [POCKET_ARTIFACT_TAG_PATTERN, POCKET_COMMIT_TAG_PATTERN]) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(content))) {
      const ref = pocketArtifactRef(match[1] || '')
      if (ref) refs.add(ref)
      if (!match[0]) pattern.lastIndex += 1
    }
  }
  POCKET_INLINE_ANCHOR_REF_PATTERN.lastIndex = 0
  let anchorMatch: RegExpExecArray | null
  while ((anchorMatch = POCKET_INLINE_ANCHOR_REF_PATTERN.exec(content))) {
    const ref = text(anchorMatch[1] || anchorMatch[2], 180)
    if (ref) refs.add(ref)
    if (!anchorMatch[0]) POCKET_INLINE_ANCHOR_REF_PATTERN.lastIndex += 1
  }
  return refs
}

function escapePocketHtmlAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function pocketInlineAnchor(activityId: string): string {
  return `<div class="pocket-inline-anchor" data-pocket-inline-anchor="${escapePocketHtmlAttribute(activityId)}"></div>`
}

const LEGACY_LUMI_PHONE_TAG_PATTERN = /<lumi-phone\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/lumi-phone\s*>)/gi

function legacyTagAttributes(raw: string): AnyRecord {
  const attrs: AnyRecord = {}
  const pattern = /([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw))) {
    const key = text(match[1], 120)
    if (key) attrs[key] = match[2] ?? match[3] ?? match[4] ?? ''
    if (!match[0]) pattern.lastIndex += 1
  }
  return attrs
}

function legacyTagIdempotencyKey(hostMessageId: string, fullMatch: string): string {
  return `tag:${hostMessageId || 'unknown'}:${compactStableHash(fullMatch)}`.slice(0, 240)
}

async function resolveLegacyTagCandidateOrigin(chatId: string, hostMessageId: string, userId?: string): Promise<PocketTurnCandidateOrigin | undefined> {
  if (!chatId || !hostMessageId) return undefined
  const active = [...activePocketCandidates.values()].find((entry) => entry.userKey === viewKey(userId) && entry.chatId === chatId && entry.hostMessageId === hostMessageId)
  if (active) return { chatId, hostMessageId, swipeId: active.swipeId, generationId: active.generationId }
  if (!spindle.permissions.has('chats')) return undefined
  const messages: any[] = await spindle.chat.getMessages(chatId).catch(() => [])
  const target = messages.find((message: any) => text(message?.id, 180) === hostMessageId)
  if (!target) return undefined
  const rawSwipeId = Number(target?.swipe_id ?? target?.swipeId ?? 0)
  const swipeId = Number.isInteger(rawSwipeId) && rawSwipeId >= 0 ? rawSwipeId : 0
  return { chatId, hostMessageId, swipeId }
}

async function rewriteCompiledLegacyTag(
  origin: PocketTurnCandidateOrigin,
  fullMatch: string,
  activityId: string,
  action: string,
): Promise<boolean> {
  if (!spindle.permissions.has('chat_mutation') || !fullMatch) return false
  const messages: any[] = await spindle.chat.getMessages(origin.chatId)
  const target = messages.find((message: any) => text(message?.id, 180) === origin.hostMessageId)
  if (!target) return false
  const candidateContent = hostMessageCandidateContent(target, origin.swipeId, 120_000)
  const at = candidateContent.indexOf(fullMatch)
  if (at < 0) return false
  const replacement = (action === 'message' || action === 'message_batch' || action === 'call') && activityId ? pocketInlineAnchor(activityId) : ''
  const nextContent = `${candidateContent.slice(0, at)}${replacement}${candidateContent.slice(at + fullMatch.length)}`
  await updateCandidateHostContent(origin, target, nextContent)
  return true
}

async function compileLegacyPhoneTags(
  characterId: string,
  origin: PocketTurnCandidateOrigin,
  userId?: string,
): Promise<{ compiled: number; messageAnchors: number }> {
  if (!spindle.permissions.has('chats')) return { compiled: 0, messageAnchors: 0 }
  const messages: any[] = await spindle.chat.getMessages(origin.chatId).catch(() => [])
  const target = messages.find((message: any) => text(message?.id, 180) === origin.hostMessageId)
  if (!target) return { compiled: 0, messageAnchors: 0 }
  const candidateContent = hostMessageCandidateContent(target, origin.swipeId, 120_000)
  if (!candidateContent.includes('<lumi-phone')) return { compiled: 0, messageAnchors: 0 }

  LEGACY_LUMI_PHONE_TAG_PATTERN.lastIndex = 0
  const matches: Array<{ full: string; attrsRaw: string; body: string; index: number }> = []
  let match: RegExpExecArray | null
  while ((match = LEGACY_LUMI_PHONE_TAG_PATTERN.exec(candidateContent))) {
    matches.push({ full: match[0], attrsRaw: match[1] || '', body: match[2] || '', index: match.index })
    if (!match[0]) LEGACY_LUMI_PHONE_TAG_PATTERN.lastIndex += 1
  }
  if (!matches.length) return { compiled: 0, messageAnchors: 0 }

  let cursor = 0
  let nextContent = ''
  let compiled = 0
  let messageAnchors = 0
  for (let itemIndex = 0; itemIndex < matches.length; itemIndex += 1) {
    const item = matches[itemIndex]
    nextContent += candidateContent.slice(cursor, item.index)
    cursor = item.index + item.full.length
    const attrs = legacyTagAttributes(item.attrsRaw)
    const action = text(attrs.action, 40).toLowerCase()
    let replacement = ''
    // Keep the documented fallback bounded. Extra machine tags are stripped
    // from presentation but cannot create additional side effects.
    if (action && itemIndex < 3) {
      try {
        const tagPayload = {
          ...parseTagContent(item.body), ...attrs,
          action, chat_id: origin.chatId, character_id: characterId,
          messageId: origin.hostMessageId,
          idempotencyKey: legacyTagIdempotencyKey(origin.hostMessageId, item.full),
          __candidateOrigin: origin,
          __candidateCommitted: true,
        }
        const result = await applyAction(tagPayload, userId, 'tag')
        const activityId = text(result.activityId, 180)
        if ((action === 'message' || action === 'message_batch' || action === 'call') && activityId) {
          replacement = pocketInlineAnchor(activityId)
          messageAnchors += 1
        }
        compiled += 1
      } catch (error) {
        spindle.log.warn(`Pocket could not compile fallback <lumi-phone> action=${action}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    nextContent += replacement
  }
  nextContent += candidateContent.slice(cursor)
  if (spindle.permissions.has('chat_mutation') && nextContent !== candidateContent) {
    await updateCandidateHostContent(origin, target, nextContent)
  }
  if (compiled) spindle.log.info(`Pocket compiled fallback tags: message=${origin.hostMessageId} swipe=${origin.swipeId} actions=${compiled} inline=${messageAnchors}`)
  return { compiled, messageAnchors }
}

function activityBelongsToCandidate(state: PhoneState, activity: PocketActivity, origin: PocketTurnCandidateOrigin): boolean {
  const route = activity.route.app === 'messages' ? activity.route : undefined
  if ((activity.kind !== 'message' && activity.kind !== 'call') || !route?.messageId) return false
  const pocketMessage = state.conversations.flatMap((entry) => entry.messages).find((entry) => entry.id === route.messageId)
  const messageOrigin = pocketMessage?.origin
  return Boolean(messageOrigin
    && messageOrigin.chatId === origin.chatId
    && messageOrigin.hostMessageId === origin.hostMessageId
    && messageOrigin.swipeId === origin.swipeId)
}

async function discardCandidateMessages(
  characterId: string,
  origin: PocketTurnCandidateOrigin,
  userId?: string,
  reason = 'candidate_discarded',
): Promise<{ removed: number; activityIds: string[] }> {
  return withStateLock(stateKey(origin.chatId, characterId), async () => {
    const state = await loadState(origin.chatId, characterId, userId)
    let removed = 0
    const activityIds: string[] = []
    for (const conversation of state.conversations) {
      const deleteIds = conversation.messages
        .filter((message) => message.origin?.chatId === origin.chatId && message.origin.hostMessageId === origin.hostMessageId && message.origin.swipeId === origin.swipeId)
        .map((message) => message.id)
      for (const messageId of deleteIds) {
        const activity = state.activities.find((entry) => (entry.kind === 'message' || entry.kind === 'call') && entry.route?.app === 'messages' && entry.route.messageId === messageId)
        if (activity?.id) activityIds.push(activity.id)
        if (removePocketMessageArtifacts(state, conversation.id, messageId)) removed += 1
      }
    }
    if (!removed) return { removed: 0, activityIds: [] }
    await saveState(state, userId)
    const uniqueActivityIds = [...new Set(activityIds)]
    if (uniqueActivityIds.length) send({ type: 'lumiphone:candidate_activity_discard', activityIds: uniqueActivityIds, origin, reason }, userId)
    await sendState(state, userId, reason)
    return { removed, activityIds: uniqueActivityIds }
  })
}

function normalizedRenderedMessageLine(value: string): string {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*>\s*/, '')
    .trim()
    .replace(/^(?:\*\*|__|\*|_|~~|`)+/, '')
    .replace(/(?:\*\*|__|\*|_|~~|`)+$/, '')
    .trim()
    .replace(/^["'“”‘’]+/, '')
    .replace(/["'“”‘’]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function replacePlaintextMessageWithInlineAnchor(content: string, messageText: string, activityId: string): { content: string; changed: boolean } {
  const target = messageText.replace(/\s+/g, ' ').trim()
  if (!target || !activityId) return { content, changed: false }
  const anchor = pocketInlineAnchor(activityId)
  const newline = content.includes('\r\n') ? '\r\n' : '\n'
  const lines = content.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    if (normalizedRenderedMessageLine(lines[index]) !== target) continue
    lines[index] = anchor
    return { content: lines.join(newline), changed: true }
  }
  const exactAt = content.indexOf(messageText)
  if (exactAt < 0) return { content, changed: false }
  return { content: `${content.slice(0, exactAt)}${anchor}${content.slice(exactAt + messageText.length)}`, changed: true }
}

async function updateCandidateHostContent(origin: PocketTurnCandidateOrigin, target: any, nextContent: string): Promise<void> {
  const swipes = Array.isArray(target?.swipes) ? [...target.swipes] : []
  if (typeof swipes[origin.swipeId] === 'string') {
    swipes[origin.swipeId] = nextContent
    await spindle.chat.updateMessage(origin.chatId, origin.hostMessageId, {
      swipes,
      swipe_id: Number.isInteger(target?.swipe_id) ? Number(target.swipe_id) : origin.swipeId,
      skipChunkRebuild: true,
    })
    return
  }
  await spindle.chat.updateMessage(origin.chatId, origin.hostMessageId, { content: nextContent, skipChunkRebuild: true })
}

async function pruneUncommittedCandidateMessages(
  characterId: string,
  origin: PocketTurnCandidateOrigin,
  userId?: string,
): Promise<{ removed: number; kept: number; rescuedInline: number; removedActivityIds: string[]; keptActivityIds: string[] }> {
  const hostMessages: any[] = await spindle.chat.getMessages(origin.chatId).catch(() => [])
  const target = hostMessages.find((message: any) => text(message?.id, 180) === origin.hostMessageId)
  let candidateContent = hostMessageCandidateContent(target, origin.swipeId, 120_000)
  const committedRefs = candidateCommitRefs(candidateContent)
  let rescuedInline = 0
  const result = await withStateLock(stateKey(origin.chatId, characterId), async () => {
    const state = await loadState(origin.chatId, characterId, userId)
    let removed = 0
    let kept = 0
    const removedActivityIds: string[] = []
    const keptActivityIds: string[] = []
    for (const conversation of state.conversations) {
      const candidateRows = conversation.messages.filter((message) => {
        const messageOrigin = message.origin
        return Boolean(messageOrigin
          && messageOrigin.chatId === origin.chatId
          && messageOrigin.hostMessageId === origin.hostMessageId
          && messageOrigin.swipeId === origin.swipeId)
      })
      for (const message of candidateRows) {
        const activity = state.activities.find((entry) => (entry.kind === 'message' || entry.kind === 'call') && entry.route?.app === 'messages' && (
          entry.route.messageId === message.id || entry.source?.messageIds?.includes(message.id)
        ))
        if (activity?.id && committedRefs.has(activity.id)) {
          if (message.candidateCommitState !== 'committed') message.candidateCommitState = 'committed'
          keptActivityIds.push(activity.id)
          kept += 1
          continue
        }
        if (activity?.id && !message.call && activity.presentation?.kind !== 'batch') {
          const rescued = replacePlaintextMessageWithInlineAnchor(candidateContent, message.text, activity.id)
          if (rescued.changed) {
            candidateContent = rescued.content
            committedRefs.add(activity.id)
            message.candidateCommitState = 'committed'
            keptActivityIds.push(activity.id)
            kept += 1
            rescuedInline += 1
            continue
          }
        }
        if (activity?.id) removedActivityIds.push(activity.id)
        if (removePocketMessageArtifacts(state, conversation.id, message.id)) removed += 1
      }
    }
    if (removed || kept) await saveState(state, userId)
    const uniqueRemovedActivityIds = [...new Set(removedActivityIds)]
    const uniqueKeptActivityIds = [...new Set(keptActivityIds)]
    if (uniqueRemovedActivityIds.length) send({ type: 'lumiphone:candidate_activity_discard', activityIds: uniqueRemovedActivityIds, origin, reason: 'candidate_uncommitted' }, userId)
    if (removed || kept) await sendState(state, userId, removed ? 'candidate_provisionals_pruned' : 'candidate_committed')
    return { removed, kept, removedActivityIds: uniqueRemovedActivityIds, keptActivityIds: uniqueKeptActivityIds }
  })
  if (rescuedInline && target && candidateContent) await updateCandidateHostContent(origin, target, candidateContent)
  return { ...result, rescuedInline }
}

async function finalizeCandidateArtifactTags(
  characterId: string,
  origin: PocketTurnCandidateOrigin,
  userId?: string,
): Promise<boolean> {
  if (!spindle.permissions.has('chat_mutation')) return false
  const hostMessages: any[] = await spindle.chat.getMessages(origin.chatId)
  const target = hostMessages.find((message: any) => text(message?.id, 180) === origin.hostMessageId)
  if (!target) return false
  const candidateContent = hostMessageCandidateContent(target, origin.swipeId, 120_000)
  if (!candidateContent || (!candidateContent.includes('<pocket-artifact') && !candidateContent.includes('<pocket-commit'))) return false

  const state = await loadState(origin.chatId, characterId, userId)
  const activities = new Map(state.activities.map((activity) => [activity.id, activity] as const))
  let changed = false
  let nextContent = candidateContent.replace(POCKET_ARTIFACT_TAG_PATTERN, (_full: string, attrs: string) => {
    changed = true
    const ref = pocketArtifactRef(attrs)
    const activity = ref ? activities.get(ref) : undefined
    return activity && activityBelongsToCandidate(state, activity, origin) ? pocketInlineAnchor(ref) : ''
  })
  nextContent = nextContent.replace(POCKET_COMMIT_TAG_PATTERN, (_full: string, attrs: string) => {
    changed = true
    const ref = pocketArtifactRef(attrs)
    const activity = ref ? activities.get(ref) : undefined
    return activity && activityBelongsToCandidate(state, activity, origin) ? '' : ''
  })
  if (!changed || nextContent === candidateContent) return false
  await updateCandidateHostContent(origin, target, nextContent)
  spindle.log.info(`Pocket finalized inline artifacts: message=${origin.hostMessageId} swipe=${origin.swipeId}`)
  return true
}

spindle.on('TOOL_INVOCATION', async (payload, eventUserId) => {
  if (payload.toolName !== 'phone_action') return ''
  try {
    const userId = eventUserId
    if (!userId) throw new Error('Pocket tool invocation is missing authenticated user context')
    const args = isRecord(payload.args) ? payload.args : {}
    const merged = {
      ...args, ...(isRecord(args.payload) ? args.payload : {}), payload: args.payload,
      idempotencyKey: text(payload.requestId, 240), messageId: text((payload as any).messageId, 180),
    }
    const context = await resolveContext(args, userId)
    const activeCandidate = activeCandidateForTool(userId, context.chatId)
    const actionCandidateOrigin = activeCandidate ? {
      chatId: activeCandidate.chatId, hostMessageId: activeCandidate.hostMessageId, swipeId: activeCandidate.swipeId, generationId: activeCandidate.generationId,
    } : undefined
    const result = await applyAction(actionCandidateOrigin ? { ...merged, __candidateOrigin: actionCandidateOrigin } : merged, userId, 'model')
    const artifactTag = pocketArtifactTag((result as AnyRecord).activityId, (result as AnyRecord).action)
    const activityId = text((result as AnyRecord).activityId, 180)
    const commitTag = activityId && artifactTag ? `<pocket-commit ref="${escapePocketHtmlAttribute(activityId)}"></pocket-commit>` : undefined
    if (actionCandidateOrigin && activityId && artifactTag) {
      const stagedState = await loadState(context.chatId, context.characterId, userId)
      const stagedActivity = stagedState.activities.find((entry) => entry.id === activityId)
      if (stagedActivity) send({ type: 'lumiphone:provisional_activity', activity: stagedActivity, origin: actionCandidateOrigin }, userId)
    }
    return JSON.stringify({
      ...result,
      artifactTag,
      commitTag,
      artifactInstruction: artifactTag
        ? 'REQUIRED COMMIT RECEIPT: this message action (or whole GC batch) is PROVISIONAL until final assistant content contains exactly one returned marker. If visible/readable/observed, put artifactTag EXACTLY ON ITS OWN LINE at that story position and do not print the message text separately. For message_batch, the one artifactTag represents the whole coherent burst. artifactTag is the durable inline anchor and lets Pocket render the phone artifact immediately during streaming. If wholly off-screen, put commitTag exactly once. If this was exploratory reasoning and is absent from the final scene, emit neither. Never emit both. Continue the roleplay normally after placing the required marker.'
        : undefined,
      presentation: 'Pocket staged exactly this action provisionally. Continue the roleplay normally. If another distinct phone action occurs later in this turn, call Pocket Action again.',
    })
  } catch (error) {
    return `Pocket action failed: ${error instanceof Error ? error.message : String(error)}`
  }
})

ensureInterceptor()
registerTool()
spindle.permissions.onChanged(({ permission, granted }) => {
  if (permission === 'tools') {
    if (granted) registerTool()
    else spindle.unregisterTool('phone_action')
  }
  if (permission === 'interceptor') {
    if (granted) ensureInterceptor()
    else {
      interceptorDisposer?.()
      interceptorDisposer = null
    }
  }
  send({ type: 'lumiphone:capabilities', capabilities: capabilities() })
})

spindle.on('CHAT_SWITCHED', async (payload: any, userId?: string) => {
  arrivalIdle.cancelPrefix(viewKey(userId) + ':')
  const chatId = text(payload?.chatId, 180)
  if (!chatId) return
  try {
    const chat = spindle.permissions.has('chats') ? await (spindle.chats.get as any)(chatId, userId) : null
    const characterId = text(chat?.character_id, 180) || '_none'
    await sendState(await loadState(chatId, characterId, userId), userId, 'chat_switched')
  } catch { /* frontend will request a fresh state */ }
})

spindle.on('PERSONA_CHANGED', async (_payload: any, userId?: string) => {
  try {
    if (!spindle.permissions.has('chats')) return
    const chat: any = await spindle.chats.getActive(userId)
    const chatId = text(chat?.id, 180)
    if (!chatId) return
    const characterId = text(chat?.character_id, 180) || '_none'
    await sendState(await loadState(chatId, characterId, userId), userId, 'persona_changed')
  } catch { /* frontend will refresh on its next host event */ }
})

spindle.on('GENERATION_STARTED', async (payload: any, userId?: string) => {
  arrivalIdle.cancelPrefix(viewKey(userId) + ':')
  const chatId = text(payload?.chatId, 180)
  const generationId = text(payload?.generationId, 180)
  if (!chatId || !generationId || !spindle.permissions.has('chats')) return
  const hostMessageId = text(payload?.targetMessageId ?? payload?.target_message_id, 180)
  const rawSwipeValue = payload?.targetSwipeId ?? payload?.target_swipe_id
  const rawSwipeId = Number(rawSwipeValue)
  const hasCandidate = Boolean(hostMessageId && rawSwipeValue !== null && rawSwipeValue !== undefined && Number.isInteger(rawSwipeId) && rawSwipeId >= 0)
  const payloadCharacterId = text(payload?.characterId ?? payload?.character_id, 180)
  if (hasCandidate) {
    activePocketCandidates.set(candidateRuntimeKey(userId, generationId), {
      userKey: viewKey(userId), chatId, characterId: payloadCharacterId || '_none', hostMessageId, swipeId: rawSwipeId, generationId,
      generationType: text(payload?.generationType ?? payload?.generation_type, 40), startedAt: Date.now(),
    })
  }
  try {
    const chat: any = await spindle.chats.get(chatId, userId)
    const characterId = payloadCharacterId || text(chat?.character_id, 180) || '_none'
    if (hasCandidate) {
      const active = activePocketCandidates.get(candidateRuntimeKey(userId, generationId))
      if (active) active.characterId = characterId
    }
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      const baselineResult = hasCandidate ? ensureHostClockBaseline(state, hostMessageId) : null
      const selectionChanged = hasCandidate ? setHostSwipeSelection(state, hostMessageId, rawSwipeId) : false
      const clockRestored = hasCandidate ? restoreClockForSelectedCandidate(state, hostMessageId, rawSwipeId) : false
      let relay = relayForGeneration(state, generationId)
      if (!relay) {
        const launching = state.relays.filter((entry) => entry.status === 'pending' && entry.continuation.state === 'launching' && !entry.continuation.generationId)
        if (launching.length === 1) relay = launching[0]
      }
      let reference = referenceForGeneration(state, generationId)
      if (!reference) {
        const unbound = state.references.filter((entry) => entry.status === 'injected' && entry.injectedAt && !entry.injectedGenerationId)
        if (unbound.length === 1) reference = unbound[0]
      }
      if (!relay && !reference && !selectionChanged && !baselineResult?.created && !clockRestored) return
      if (relay) {
        relay.continuation.state = 'started'
        relay.continuation.generationId = generationId
        relay.continuation.generationStartedAt = nowIso()
        relay.continuation.error = undefined
        if (relay.injectedAt && !relay.injectedGenerationId) relay.injectedGenerationId = generationId
        spindle.log.info(`Pocket observed GENERATION_STARTED: relay=${relay.id} generation=${generationId}`)
      }
      if (reference) {
        reference.injectedGenerationId = generationId
        reference.error = undefined
        spindle.log.info(`Pocket observed GENERATION_STARTED: reference=${reference.id} generation=${generationId}`)
      }
      await saveState(state, userId)
      await sendState(state, userId, relay ? 'relay_started' : reference ? 'reference_started' : 'generation_candidate_started')
    })
  } catch (error) {
    spindle.log.warn(`Pocket could not associate GENERATION_STARTED: ${error instanceof Error ? error.message : String(error)}`)
  }
})

spindle.on('MESSAGE_SWIPED', async (payload: any, userId?: string) => {
  const chatId = text(payload?.chatId, 180)
  const hostMessageId = text(payload?.message?.id ?? payload?.messageId, 180)
  if (!chatId || !hostMessageId || !spindle.permissions.has('chats')) return
  try {
    const chat: any = await spindle.chats.get(chatId, userId)
    const characterId = text(payload?.characterId ?? payload?.character_id, 180) || text(chat?.character_id, 180) || '_none'
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      let changed = false
      const removedActivityIds: string[] = []
      const action = text(payload?.action, 40).toLowerCase()
      const eventSwipeValue = payload?.swipeId
      const eventSwipeId = Number(eventSwipeValue)
      if ((action === 'delete' || action === 'deleted') && eventSwipeValue !== null && eventSwipeValue !== undefined && Number.isInteger(eventSwipeId) && eventSwipeId >= 0) {
        for (const conversation of state.conversations) {
          const deleteIds: string[] = []
          for (const message of conversation.messages) {
            const origin = message.origin
            if (!origin || origin.chatId !== chatId || origin.hostMessageId !== hostMessageId) continue
            if (origin.swipeId === eventSwipeId) deleteIds.push(message.id)
            else if (origin.swipeId > eventSwipeId) { origin.swipeId -= 1; changed = true }
          }
          for (const messageId of deleteIds) {
            const activity = state.activities.find((entry) => (entry.kind === 'message' || entry.kind === 'call') && entry.route?.app === 'messages' && entry.route.messageId === messageId)
            if (activity?.id) removedActivityIds.push(activity.id)
            changed = removePocketMessageArtifacts(state, conversation.id, messageId) || changed
          }
        }
        const beforeClockCount = (state.candidateClocks || []).length
        state.candidateClocks = (state.candidateClocks || []).filter((entry) => !(entry.hostMessageId === hostMessageId && entry.swipeId === eventSwipeId))
        if (state.candidateClocks.length !== beforeClockCount) changed = true
        for (const entry of state.candidateClocks) {
          if (entry.hostMessageId === hostMessageId && entry.swipeId > eventSwipeId) { entry.swipeId -= 1; changed = true }
        }
      }
      const selectedSwipeValue = payload?.message?.swipe_id ?? payload?.message?.swipeId ?? payload?.swipeId
      const selectedSwipeId = Number(selectedSwipeValue)
      if (selectedSwipeValue !== null && selectedSwipeValue !== undefined && Number.isInteger(selectedSwipeId) && selectedSwipeId >= 0) {
        changed = setHostSwipeSelection(state, hostMessageId, selectedSwipeId) || changed
        changed = restoreClockForSelectedCandidate(state, hostMessageId, selectedSwipeId) || changed
      }
      if (changed) await saveState(state, userId)
      const uniqueRemovedActivityIds = [...new Set(removedActivityIds)]
      if (uniqueRemovedActivityIds.length) send({ type: 'lumiphone:candidate_activity_discard', activityIds: uniqueRemovedActivityIds, reason: 'host_swipe_deleted' }, userId)
      // Always republish on host swipe navigation. The host can reuse the same
      // message DOM while changing its selected swipe, so a no-op state delta
      // still needs a fresh projection to evict stale inline/receipt surfaces.
      await sendState(state, userId, 'host_swipe')
    })
  } catch (error) {
    spindle.log.warn(`Pocket could not project MESSAGE_SWIPED: ${error instanceof Error ? error.message : String(error)}`)
  }
})

spindle.on('MESSAGE_DELETED', async (payload: any, userId?: string) => {
  const chatId = text(payload?.chatId, 180)
  const hostMessageId = text(payload?.messageId ?? payload?.message?.id, 180)
  if (!chatId || !hostMessageId || !spindle.permissions.has('chats')) return
  for (const [key, candidate] of activePocketCandidates) {
    if (candidate.chatId === chatId && candidate.hostMessageId === hostMessageId && candidate.userKey === viewKey(userId)) activePocketCandidates.delete(key)
  }
  try {
    const chat: any = await spindle.chats.get(chatId, userId)
    const characterId = text(payload?.characterId ?? payload?.character_id, 180) || text(chat?.character_id, 180) || '_none'
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      let changed = false
      for (const conversation of state.conversations) {
        const deleteIds = conversation.messages
          .filter((message) => message.origin?.chatId === chatId && message.origin.hostMessageId === hostMessageId)
          .map((message) => message.id)
        for (const messageId of deleteIds) changed = removePocketMessageArtifacts(state, conversation.id, messageId) || changed
      }
      const swipeSelectionCount = (state.hostSwipeSelections || []).length
      state.hostSwipeSelections = (state.hostSwipeSelections || []).filter((entry) => entry.hostMessageId !== hostMessageId)
      if (state.hostSwipeSelections.length !== swipeSelectionCount) changed = true
      const baselineCount = (state.hostClockBaselines || []).length
      state.hostClockBaselines = (state.hostClockBaselines || []).filter((entry) => entry.hostMessageId !== hostMessageId)
      if (state.hostClockBaselines.length !== baselineCount) changed = true
      const candidateClockCount = (state.candidateClocks || []).length
      state.candidateClocks = (state.candidateClocks || []).filter((entry) => entry.hostMessageId !== hostMessageId)
      if (state.candidateClocks.length !== candidateClockCount) changed = true
      const removedHostActivityIds = new Set(state.activities.filter((entry) => entry.source?.messageId === hostMessageId).map((entry) => entry.id))
      const activityCount = state.activities.length
      state.activities = state.activities.filter((entry) => entry.source?.messageId !== hostMessageId)
      if (state.activities.length !== activityCount) changed = true
      if (removedHostActivityIds.size) {
        const commandCount = state.processedCommands.length
        state.processedCommands = state.processedCommands.filter((entry) => !entry.activityId || !removedHostActivityIds.has(entry.activityId))
        if (state.processedCommands.length !== commandCount) changed = true
      }
      if (!changed) return
      await saveState(state, userId)
      if (removedHostActivityIds.size) send({ type: 'lumiphone:candidate_activity_discard', activityIds: [...removedHostActivityIds], reason: 'host_message_deleted' }, userId)
      await sendState(state, userId, 'host_message_deleted')
    })
  } catch (error) {
    spindle.log.warn(`Pocket could not clean deleted host message: ${error instanceof Error ? error.message : String(error)}`)
  }
})

spindle.on('GENERATION_ENDED', async (payload: any, userId?: string) => {
  const chatId = text(payload?.chatId, 180)
  const messageId = text(payload?.messageId, 180)
  const generationId = text(payload?.generationId, 180)
  const endedCandidate = generationId ? activePocketCandidates.get(candidateRuntimeKey(userId, generationId)) : undefined
  if (generationId) activePocketCandidates.delete(candidateRuntimeKey(userId, generationId))
  if (!chatId || !spindle.permissions.has('chats')) return
  try {
    const chat: any = await spindle.chats.get(chatId, userId)
    const characterId = text(chat?.character_id, 180) || '_none'
    const generationType = text(payload?.generationType ?? payload?.generation_type, 40)
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      let changed = false
      const relay = generationId ? relayForGeneration(state, generationId) : undefined
      let reference = generationId ? referenceForGeneration(state, generationId) : undefined
      let endedBoundUserMessageId = ''

      // Some host/runtime combinations can lose the generation association between
      // interception and GENERATION_ENDED even though the assistant message itself
      // was committed. The reference already records the exact user turn it bound
      // to, so reconcile through chat history before leaving it stuck "applying".
      if (!reference && generationType === 'normal' && messageId && spindle.permissions.has('chat_mutation')) {
        try {
          const hostMessages: any[] = await spindle.chat.getMessages(chatId)
          const generatedIndex = hostMessages.findIndex((message: any) => text(message?.id, 180) === messageId)
          if (generatedIndex >= 0) {
            const precedingUser = hostMessages
              .slice(0, generatedIndex)
              .reverse()
              .find((message: any) => message?.role === 'user' && text(message?.id, 180))
            endedBoundUserMessageId = text(precedingUser?.id, 180)
            if (endedBoundUserMessageId) {
              const boundMatches = state.references.filter((entry) =>
                entry.status === 'injected'
                && entry.boundUserMessageId === endedBoundUserMessageId
                && (!generationId || !entry.injectedGenerationId || entry.injectedGenerationId === generationId)
              )
              if (boundMatches.length === 1) {
                reference = boundMatches[0]
                if (generationId && !reference.injectedGenerationId) reference.injectedGenerationId = generationId
                spindle.log.info(`Pocket reference completion fallback matched bound user turn: reference=${reference.id} generation=${generationId || 'missing'} userMessage=${endedBoundUserMessageId}`)
              }
            }
          }
        } catch (error) {
          spindle.log.warn(`Pocket could not reconcile reference completion from chat history: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      if (relay) {
        relay.continuation.generationCompletedAt = nowIso()
        const injectionMatched = Boolean(relay.injectedAt && relay.injectedGenerationId === generationId)
        if (payload?.error || !messageId) {
          relay.continuation = { ...relay.continuation, state: 'failed', error: text(payload?.error, 500) || 'The roleplay continuation did not produce a message.' }
        } else if (!injectionMatched) {
          relay.injectionError = 'The generation completed without a confirmed matching Pocket relay injection.'
          relay.continuation = { ...relay.continuation, state: 'failed', error: relay.injectionError }
        } else {
          relay.status = 'consumed'
          relay.consumedAt = nowIso()
          relay.consumedMessageId = messageId
          relay.continuation = { ...relay.continuation, state: 'completed', error: undefined }
        }
        changed = true
        spindle.log.info(`Pocket observed GENERATION_ENDED: relay=${relay.id} generation=${generationId || 'unknown'} status=${relay.status} message=${messageId || 'none'}`)
      }
      if (reference) {
        const injectionMatched = Boolean(reference.injectedAt && (
          (generationId && reference.injectedGenerationId === generationId)
          || (endedBoundUserMessageId && reference.boundUserMessageId === endedBoundUserMessageId)
        ))
        if (payload?.error || !messageId) {
          reference.status = 'failed'
          reference.error = text(payload?.error, 500) || 'The roleplay generation did not produce a message. The reference was not consumed.'
        } else if (!injectionMatched) {
          reference.status = 'failed'
          reference.error = 'The generation completed without a confirmed matching Pocket reference injection.'
        } else {
          reference.status = 'consumed'
          reference.consumedAt = nowIso()
          reference.consumedMessageId = messageId
          reference.error = undefined
          addActivity(state, {
            kind: 'message',
            title: 'Referenced chat',
            summary: `${reference.conversationTitle} · ${reference.messages.length} message${reference.messages.length === 1 ? '' : 's'}`,
            route: { app: 'messages', conversationId: reference.conversationId },
            presentation: { kind: 'referenced', conversationTitle: reference.conversationTitle },
            source: { messageId, conversationId: reference.conversationId },
          })
        }
        changed = true
        spindle.log.info(`Pocket observed GENERATION_ENDED: reference=${reference.id} generation=${generationId || 'unknown'} status=${reference.status} message=${messageId || 'none'}`)
      }
      if (messageId && state.sceneSnapshot && state.sceneSnapshot.sourceMessageId !== messageId) {
        state.sceneSnapshot.stale = true
        changed = true
      }
      if (!changed) return
      await saveState(state, userId)
      const reason = relay ? relay.status === 'consumed' ? 'relay_consumed' : 'relay_failed'
        : reference ? reference.status === 'consumed' ? 'reference_consumed' : 'reference_failed'
          : 'scene_stale'
      await sendState(state, userId, reason)
    })

    const completedOrigin: PocketTurnCandidateOrigin | undefined = messageId && !payload?.error
      ? endedCandidate
        ? { chatId: endedCandidate.chatId, hostMessageId: endedCandidate.hostMessageId, swipeId: endedCandidate.swipeId, generationId: endedCandidate.generationId }
        : await resolveLegacyTagCandidateOrigin(chatId, messageId, userId)
      : undefined
    if (completedOrigin && messageId && !payload?.error) {
      try {
        await compileLegacyPhoneTags(characterId, completedOrigin, userId)
      } catch (error) {
        spindle.log.warn(`Pocket fallback tag compiler skipped: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    if (generationType === 'normal' && messageId && !payload?.error) {
      send({ type: 'lumiphone:reconciliation_status', status: 'working', generationId, messageId }, userId)
      try {
        await refreshNarrativeSeed(chatId, characterId, userId, { generationId, messageId })
        const reconciled = await loadState(chatId, characterId, userId)
        send({
          type: 'lumiphone:reconciliation_status', status: 'complete', generationId, messageId,
          revision: reconciled.lastReconciliation?.revision || reconciled.stateRevision || 0,
          domains: reconciled.lastReconciliation?.domains || [],
        }, userId)
      } catch (error) {
        send({ type: 'lumiphone:reconciliation_status', status: 'error', generationId, messageId, error: error instanceof Error ? error.message : String(error) }, userId)
        throw error
      }
      void considerAmbientMessage(chatId, characterId, 'turn', userId)
      const jevSettings = normalizeJevSettings((await loadPreferences(userId)).jev)
      if (jevSettings.enabled && jevSettings.autoAfterTurn) void evaluateJevTrackers(chatId, characterId, userId).catch(error => spindle.log.warn(`Pocket JEV: ${error instanceof Error ? error.message : 'evaluation failed'}`))
    }

    if (endedCandidate && (payload?.error || !messageId)) {
      try {
        await discardCandidateMessages(characterId, {
          chatId: endedCandidate.chatId,
          hostMessageId: endedCandidate.hostMessageId,
          swipeId: endedCandidate.swipeId,
          generationId: endedCandidate.generationId,
        }, userId, 'candidate_failed')
      } catch (error) {
        spindle.log.warn(`Pocket failed to discard errored candidate side effects: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    if (endedCandidate && messageId && !payload?.error) {
      const origin: PocketTurnCandidateOrigin = {
        chatId: endedCandidate.chatId, hostMessageId: endedCandidate.hostMessageId, swipeId: endedCandidate.swipeId, generationId: endedCandidate.generationId,
      }
      if (generationType === 'normal') {
        await withStateLock(stateKey(chatId, characterId), async () => {
          const latest = await loadState(chatId, characterId, userId)
          const changed = storeCandidateClock(latest, origin, roleplayClockSnapshot(latest))
          if (!changed) return
          await saveState(latest, userId)
        })
      }
      try {
        const commitResult = await pruneUncommittedCandidateMessages(characterId, origin, userId)
        if (commitResult.removed || commitResult.rescuedInline) spindle.log.info(`Pocket candidate commit: removed=${commitResult.removed} rescuedInline=${commitResult.rescuedInline} message=${origin.hostMessageId} swipe=${origin.swipeId}`)
      } catch (error) {
        spindle.log.warn(`Pocket provisional commit pruning skipped: ${error instanceof Error ? error.message : String(error)}`)
      }
      try {
        await reconcilePostTurnCandidate(chatId, characterId, origin, generationType, userId, { auditClock: generationType === 'regenerate' || generationType === 'swipe' || generationType === 'continue' })
      } catch (error) {
        spindle.log.warn(`Pocket post-turn candidate audit skipped: ${error instanceof Error ? error.message : String(error)}`)
      }
      try {
        await finalizeCandidateArtifactTags(characterId, origin, userId)
      } catch (error) {
        spindle.log.warn(`Pocket inline artifact finalization skipped: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    spindle.log.warn(`Pocket post-turn reconciliation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
})

spindle.on('GENERATION_STOPPED', async (payload: any, userId?: string) => {
  const chatId = text(payload?.chatId, 180)
  const generationId = text(payload?.generationId, 180)
  const stoppedCandidate = generationId ? activePocketCandidates.get(candidateRuntimeKey(userId, generationId)) : undefined
  if (generationId) activePocketCandidates.delete(candidateRuntimeKey(userId, generationId))
  if (!chatId || !generationId || !spindle.permissions.has('chats')) return
  try {
    const chat: any = await spindle.chats.get(chatId, userId)
    const characterId = text(chat?.character_id, 180) || stoppedCandidate?.characterId || '_none'
    await withStateLock(stateKey(chatId, characterId), async () => {
      const state = await loadState(chatId, characterId, userId)
      const relay = relayForGeneration(state, generationId)
      const reference = referenceForGeneration(state, generationId)
      if (relay) relay.continuation = { ...relay.continuation, state: 'stopped', error: 'Generation was stopped. The relay remains pending.' }
      if (reference) {
        reference.status = 'failed'
        reference.error = 'Generation was stopped. The reference was not consumed.'
      }
      if (!relay && !reference) return
      await saveState(state, userId)
      await sendState(state, userId, relay ? 'relay_stopped' : 'reference_failed')
    })
    if (stoppedCandidate) {
      await discardCandidateMessages(characterId, {
        chatId: stoppedCandidate.chatId,
        hostMessageId: stoppedCandidate.hostMessageId,
        swipeId: stoppedCandidate.swipeId,
        generationId: stoppedCandidate.generationId,
      }, userId, 'candidate_stopped')
    }
  } catch { /* best-effort status update */ }
})



spindle.log.info('Pocket backend loaded.')
