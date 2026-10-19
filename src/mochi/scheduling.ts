import {validateStoredActions,type RoutineActions} from './routine-actions.js'
import {validateRoutineState,routineId,publicRoutines,type PublicRoutineState} from './routines.js'
import { roomId } from './types.js'
import type { MochiRoom } from './types.js'
import { delayFor, minimumDelay, statusFor } from './presence.js'

export type ScheduledStatus = 'queued' | 'generating' | 'generated' | 'delivered' | 'cancelled' | 'paused' | 'failed' | 'missed'
export interface ScheduledDraft { characterId: string; name: string; avatarUrl: string; text: string; routineActions?:RoutineActions; proposedStatus?: import('./presence.js').PresenceStatus }
export interface ScheduledJob {
  id: string; dueAt: number; expiresAt: number; revision: number; responder: string
  status: ScheduledStatus; attempts: number; nextAttemptAt: number; claim?: string; leaseUntil?: number
  draft?: ScheduledDraft; deliveredAt?: number; messageId?: string; reason?: string
  deliveryAttempts?: number
  kind?: 'scheduled' | 'response' | 'idle'; createdAt?: number
  deliverAt?: number; proposedStatus?: import('./presence.js').PresenceStatus
  routineActions?:RoutineActions; additional?: ScheduledDraft[]; idlePeriodId?: string
}
export interface IdleState { enabled: boolean; periodId: string; startedAt: number; delivered: number; opportunities: number; lastDeliveredAt: number; nextDueAt: number }
export interface RoomRuntime { version: 1; enabled: boolean; jobs: ScheduledJob[]; presence?: Record<string, import('./presence.js').CharacterPresence>; idle?: IdleState; routines?:Record<string,import('./routines.js').RoutineState> }
export interface PublicRuntime { enabled: boolean; jobs: Array<Pick<ScheduledJob, 'id' | 'dueAt' | 'status' | 'attempts' | 'reason'> & Partial<Pick<ScheduledJob, 'expiresAt' | 'deliverAt' | 'kind'>>>; presence?: Record<string, import('./presence.js').CharacterPresence>; idle?: IdleState; routines?:Record<string,PublicRoutineState>; snapshot?: { session: string; sequence: number } }
export const SCHEDULE_HISTORY_LIMIT = 20
export const SCHEDULE_LABELS: Record<ScheduledStatus, string> = { queued: 'Scheduled', generating: 'Generating', generated: 'Waiting to deliver', delivered: 'Delivered', cancelled: 'Canceled', paused: 'Needs attention', failed: 'Failed', missed: 'Expired' }
export const TERMINAL = new Set<ScheduledStatus>(['delivered', 'cancelled', 'failed', 'missed'])
export const MAX_JOBS = 10000 // Never evict completion tombstones and silently allow duplicate delivery.
export function identifier(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,180}$/.test(value)) throw new Error('Invalid scheduling identifier.')
  return value
}
export function validateRuntime(value: unknown): RoomRuntime {
  const r = value as RoomRuntime
  if (!r || r.version !== 1 || typeof r.enabled !== 'boolean' || !Array.isArray(r.jobs) || r.jobs.length > MAX_JOBS) throw new Error('Damaged scheduling records; the room file was preserved.')
  const ids = new Set<string>()
  if(r.routines!==undefined){if(!r.routines||typeof r.routines!=='object'||Array.isArray(r.routines)||Object.keys(r.routines).length>12)throw Error('Invalid routine records.');for(const [id,state]of Object.entries(r.routines)){routineId(id);validateRoutineState(state)}}
  if (r.idle) { const i=r.idle; identifier(i.periodId); if(typeof i.enabled!=='boolean'||![i.startedAt,i.lastDeliveredAt,i.nextDueAt,i.delivered,i.opportunities].every(n=>Number.isSafeInteger(n)&&n>=0)||i.delivered>3||i.opportunities>3) throw new Error('Invalid idle allowance; room data was preserved.') }
  for (const j of r.jobs) {
    identifier(j.id); identifier(j.responder)
    if(j.routineActions)validateStoredActions(j.routineActions)
    for(const d of j.additional||[])if(d.routineActions)validateStoredActions(d.routineActions)
    if (ids.has(j.id) || !['queued','generating','generated','delivered','cancelled','paused','failed','missed'].includes(j.status) ||
      ![j.dueAt,j.expiresAt,j.nextAttemptAt,j.revision,j.attempts].every(Number.isSafeInteger) || j.dueAt < 0 || j.expiresAt < j.dueAt || j.nextAttemptAt < 0 || j.revision < 1 || j.attempts < 0 || j.attempts > 3 ||
      (j.leaseUntil !== undefined && (!Number.isSafeInteger(j.leaseUntil) || j.leaseUntil < 0))) throw new Error('Damaged scheduled job; history was preserved.')
    if (j.deliveryAttempts !== undefined && (!Number.isSafeInteger(j.deliveryAttempts) || j.deliveryAttempts < 0 || j.deliveryAttempts > 3)) throw new Error('Damaged delivery attempts; history was preserved.')
    if (j.deliverAt !== undefined && (!Number.isSafeInteger(j.deliverAt) || j.deliverAt < 0)) throw new Error('Invalid deferred delivery deadline.')
    if (j.proposedStatus !== undefined && !['online','away','dnd','offline'].includes(j.proposedStatus)) throw new Error('Invalid deferred presence suggestion.')
    if (j.kind !== undefined && !['scheduled','response','idle'].includes(j.kind)) throw new Error('Invalid scheduled job type.')
    if (j.createdAt !== undefined && (!Number.isSafeInteger(j.createdAt) || j.createdAt < 0)) throw new Error('Invalid job creation time.')
    if (j.idlePeriodId !== undefined) identifier(j.idlePeriodId)
    if (j.additional !== undefined && (!Array.isArray(j.additional)||j.additional.length>2||j.additional.some(d=>!d||typeof d.text!=='string'||!d.text.trim()||d.text.length>32000||typeof d.name!=='string'||d.name.length>120||typeof d.avatarUrl!=='string'||d.avatarUrl.length>500))) throw new Error('Invalid deferred group replies.')
    for(const d of j.additional || []) { identifier(d.characterId); if(d.proposedStatus!==undefined&&!['online','away','dnd','offline'].includes(d.proposedStatus)) throw new Error('Invalid group status suggestion.') }
    if (j.claim !== undefined) identifier(j.claim)
    if (j.draft && (typeof j.draft.text !== 'string' || !j.draft.text.trim() || j.draft.text.length > 32000 || typeof j.draft.name !== 'string' || j.draft.name.length > 120 || typeof j.draft.avatarUrl !== 'string' || j.draft.avatarUrl.length > 500)) throw new Error('Damaged deferred message; history was preserved.')
    if (j.draft) identifier(j.draft.characterId)
    if (j.status === 'generated' && !j.draft) throw new Error('Missing deferred message; history was preserved.')
    ids.add(j.id)
  }
  return r
}
export function publicRuntime(r?: RoomRuntime): PublicRuntime | undefined {
  if (!r) return undefined
  const active = r.jobs.filter(j => !TERMINAL.has(j.status))
  const history = r.jobs.filter(j => ['cancelled', 'failed', 'missed'].includes(j.status)).slice(-SCHEDULE_HISTORY_LIMIT).reverse()
  const safeReasons = new Set(['Responder is unavailable.', 'Delivery could not be saved. Deferred content is preserved.', 'Scheduled messaging needs attention. Check room sources, provider and storage.'])
  return { enabled: r.enabled, presence: r.presence, idle: r.idle, routines:publicRoutines(r.routines), jobs: [...active, ...history].map(({id,dueAt,expiresAt,deliverAt,kind,status,attempts,reason}) => ({id,dueAt,expiresAt,deliverAt,kind,status,attempts,
    reason: status === 'missed' ? 'The delivery window ended without a message.' : status === 'cancelled' ? 'Canceled explicitly or invalidated by a room change.' : status === 'failed' ? 'The allowed attempts were exhausted.' : safeReasons.has(reason || '') ? reason : undefined })) }
}
export function scheduleInput(input: any, now: number): { id: string; roomId: string; responder: string; dueAt: number } {
  const dueAt = input?.dueAt
  if (!Number.isSafeInteger(dueAt) || dueAt < now || dueAt > now + 30 * 86400000) throw new Error('Choose a schedule within the next 30 days.')
  return { id: identifier(input.occurrenceId), roomId: roomId(input.roomId), responder: input.responder === undefined ? 'auto' : identifier(input.responder), dueAt }
}
/** Only clearly temporary errors retry; unknown/auth/configuration failures pause. */
export function temporaryFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /\b(?:429|502|503|504)\b|rate.?limit|temporar|ECONNRESET|ETIMEDOUT|fetch failed|network|timed? ?out|disk|rename|storage|ENOSPC/i.test(message) && !/credential|API key|permission|not available|not found|decrypt/i.test(message)
}
export function dispatchReady(room:MochiRoom,j:ScheduledJob,now:number):boolean {
  if(TERMINAL.has(j.status)||j.status==='paused'||j.nextAttemptAt>now||(j.status==='generating'&&(j.leaseUntil||0)>now)) return false
  if(j.expiresAt<now||j.revision!==room.revision) return true // cleanup, never generation
  if(j.draft) return (j.deliverAt||0)<=now&&[j.draft,...j.additional||[]].every(d=>statusFor(room,d.characterId,now)!=='offline'&&now>=(j.createdAt??j.dueAt)+delayFor(room,d.characterId,now))
  const delay=minimumDelay(room,j.responder,now)
  return Number.isFinite(delay)&&now>=(j.createdAt??j.dueAt)+delay
}
