import { defaultPresence, STATUSES, type PresenceStatus } from './presence.js'
import type { MochiRoom } from './types.js'
export interface Behavior { delayMs: number; status?: PresenceStatus }
/** Malformed optional metadata falls back to ordinary delivery, never a retry. */
export function parseBehavior(value: unknown): Behavior {
  if (value === undefined) return { delayMs:0 }
  const v = value as any
  if (!v || typeof v !== 'object' || Array.isArray(v) || !['now','later'].includes(v.delivery) ||
    !Number.isSafeInteger(v.delayMs) || v.delayMs < 0 || v.delayMs > 86400000 || (v.delivery === 'now' && v.delayMs !== 0) ||
    (v.status !== undefined && !STATUSES.includes(v.status))) return { delayMs:0 }
  return { delayMs:v.delayMs, ...(v.status === undefined ? {} : {status:v.status}) }
}
export function applyDeliveredStatus(room: MochiRoom, characterId: string, status: PresenceStatus | undefined, now: number): void {
  if (!status || !room.characterIds.includes(characterId)) return
  room.runtime ||= {version:1,enabled:false,jobs:[]};room.runtime.presence ||= {}
  const p = room.runtime.presence[characterId] || defaultPresence()
  if (p.manual !== null) return
  // AI suggestion applies after delivery; future user-configured transitions still take precedence later.
  p.automatic = status; p.transitions = p.transitions.filter(t=>t.at > now)
  room.runtime.presence[characterId] = p
}
