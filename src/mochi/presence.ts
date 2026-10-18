import type { MochiRoom } from './types.js'
export const STATUSES = ['online', 'away', 'dnd', 'offline'] as const
export type PresenceStatus = typeof STATUSES[number]
export interface CharacterPresence {
  automatic: PresenceStatus; manual: PresenceStatus | null; awayMs: number; dndMs: number
  transitions: Array<{ at: number; status: PresenceStatus }>
}
export function defaultPresence(): CharacterPresence { return { automatic: 'online', manual: null, awayMs: 300000, dndMs: 900000, transitions: [] } }
export function validatePresence(value: unknown): CharacterPresence {
  const p = value as CharacterPresence
  if (!p || !STATUSES.includes(p.automatic) || (p.manual !== null && !STATUSES.includes(p.manual)) ||
    ![p.awayMs,p.dndMs].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 86400000) || !Array.isArray(p.transitions) || p.transitions.length > 16 ||
    p.transitions.some(t => !t || !Number.isSafeInteger(t.at) || t.at < 0 || !STATUSES.includes(t.status))) throw new Error('Invalid presence settings; stored data was preserved.')
  return { ...p, transitions: p.transitions.slice().sort((a,b) => a.at-b.at) }
}
export function statusFor(room: MochiRoom, id: string, now = Date.now()): PresenceStatus {
  const p = room.runtime?.presence?.[id] || room.background?.presence?.[id] || room.characterDefaults?.[id]?.availability || defaultPresence()
  if (p.manual) return p.manual
  return p.transitions.filter(t => t.at <= now).sort((a,b) => a.at-b.at).at(-1)?.status || p.automatic
}
export function delayFor(room: MochiRoom, id: string, now = Date.now()): number {
  const p = room.runtime?.presence?.[id] || room.background?.presence?.[id] || room.characterDefaults?.[id]?.availability || defaultPresence(), s = statusFor(room,id,now)
  return s === 'offline' ? Infinity : s === 'away' ? p.awayMs : s === 'dnd' ? p.dndMs : 0
}
export function eligibleResponders(room: MochiRoom, responder: string, now: number): string[] {
  return room.characterIds.filter(id => (responder === 'auto' || responder === id) && statusFor(room,id,now) !== 'offline')
}
export function minimumDelay(room: MochiRoom, responder: string, now: number): number {
  const candidates = eligibleResponders(room,responder,now)
  return candidates.length ? Math.min(...candidates.map(id => delayFor(room,id,now))) : Infinity
}
