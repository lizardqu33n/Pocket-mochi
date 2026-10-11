import type { PhoneApp, PocketRoute } from '../types.js'
import { MOCHI_ROOM_ID } from '../mochi/types.js'

const APPS = new Set<PhoneApp>(['home', 'messages', 'mochi', 'contacts', 'gallery', 'camera', 'notes', 'weather', 'calendar', 'trackers', 'notifications', 'settings'])

function shortId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const clean = value.trim().slice(0, 180)
  return clean || undefined
}

export function normalizePocketRoute(value: unknown, fallback: PocketRoute = { app: 'home' }): PocketRoute {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const raw = value as Record<string, unknown>
  const app = typeof raw.app === 'string' && APPS.has(raw.app as PhoneApp) ? raw.app as PhoneApp : fallback.app
  if (app === 'mochi') return { app, ...(typeof raw.roomId === 'string' && MOCHI_ROOM_ID.test(raw.roomId) ? { roomId: raw.roomId } : {}) }
  if (app === 'messages') return {
    app,
    conversationId: shortId(raw.conversationId),
    contactId: shortId(raw.contactId),
    messageId: shortId(raw.messageId),
    view: raw.view === 'new-group' || raw.view === 'group-editor' || raw.view === 'group-detail' || raw.view === 'thread' ? raw.view : undefined,
  }
  if (app === 'contacts') return {
    app,
    contactId: shortId(raw.contactId),
    groupId: shortId(raw.groupId),
    view: ['detail', 'config', 'import', 'quick-gen', 'new', 'draft', 'list', 'groups', 'group-config', 'bank', 'cast-config', 'cast-import', 'bank-entry'].includes(String(raw.view)) ? raw.view as Extract<PocketRoute, { app: 'contacts' }>['view'] : undefined,
  }
  if (app === 'trackers') return {
    app,
    trackerId: shortId(raw.trackerId),
    view: raw.view === 'config' ? 'config' : raw.view === 'detail' ? 'detail' : undefined,
  }
  if (app === 'calendar') return { app, eventId: shortId(raw.eventId) }
  if (app === 'notes') return { app, noteId: shortId(raw.noteId) }
  if (app === 'gallery') return { app, imageId: shortId(raw.imageId) }
  if (app === 'settings') return { app, section: shortId(raw.section) }
  if (app === 'camera') return { app, contactId: shortId(raw.contactId), ...(raw.draft === true ? { draft: true } : {}) }
  if (app === 'weather' || app === 'notifications' || app === 'home') return { app }
  return fallback
}

export function legacyActionRoute(app: PhoneApp, action?: string): PocketRoute {
  const id = shortId(action)
  if (app === 'messages') return { app, contactId: id }
  if (app === 'contacts') return { app, contactId: id, view: id ? 'detail' : 'list' }
  if (app === 'trackers') return { app, trackerId: id, view: id ? 'detail' : undefined }
  if (app === 'calendar') return { app, eventId: id }
  if (app === 'notes') return { app, noteId: id }
  if (app === 'gallery') return { app, imageId: id }
  if (app === 'settings') return { app, section: id }
  return { app } as PocketRoute
}
