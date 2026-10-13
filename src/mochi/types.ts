export interface MochiPersona {
  source: 'manual' | 'lumiverse' | 'pocket'
  sourceId: string
  name: string
  description: string
  avatarUrl: string
}
export interface MochiCharacter { id: string; name: string; avatarUrl: string }
export interface MochiReaction {emoji:string;actor:'user'|'character';actorId:string;name:string}
export interface MochiSystemNote {id:string;title:string;body:string;enabled:boolean}
export interface MochiMessage {
  id: string; role: 'user' | 'assistant'; content: string; name: string; avatarUrl: string
  characterId?: string; createdAt: string; requestId: string
  editedAt?: string
  replyTo?: string
  reactions?: MochiReaction[]
  previousVersions?: Array<{ content: string; name: string; avatarUrl: string; savedAt: string }>
}
export interface MochiNotification { id: string; roomId: string; messageId: string; title: string; roomTitle: string; body: string; avatarUrl: string; createdAt: string; read: boolean; accountId?: string }
export interface MochiSettings {
  textingStyles?: Record<string,import('./texting.js').TextingStyle>
  model?: string
  aiBehavior?: boolean
  responseMode?: 'natural' | 'instant' | 'manual'
  autoReply: boolean; connectionId: string; contextTokens: number; outputTokens: number
  instructions: string; characterNames: Record<string, string>
}
export const defaultMochiSettings = (): MochiSettings => ({ autoReply: true, connectionId: '', contextTokens: 8192, outputTokens: 1200, instructions: '', characterNames: {} })
export interface MochiRoom {
  preset?: import('./presets.js').PresetBinding
  version: 1
  accountId?: string
  associationRevision?: number
  id: string
  revision: number
  title: string
  characterIds: string[]
  persona: MochiPersona
  messages: unknown[]
  chatPins?: string[]
  systemNotes?: MochiSystemNote[]
  settings?: MochiSettings
  receipts?: string[]
  notifications?: MochiNotification[]
  notificationRevision?: number
  createdAt: string
  updatedAt: string
  runtime?: import('./scheduling.js').RoomRuntime
  background?: import('./scheduling.js').PublicRuntime
}
export interface MochiState {
  accountId?: string
  backgroundEnabled?: boolean
  rooms: MochiRoom[]
  characters: MochiCharacter[]
  personas: MochiPersona[]
  warnings: string[]
  connections?: Array<{ id: string; name: string; model: string }>
  jobs?: Record<string, string>
  notifications?: MochiNotification[]
}
export const MOCHI_ROOM_ID = /^room_[a-f0-9]{32}$/
export function roomId(value: unknown): string {
  if (typeof value !== 'string' || !MOCHI_ROOM_ID.test(value)) throw new Error('Invalid Mochi room identifier.')
  return value
}
