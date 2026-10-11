export interface MochiPersona {
  source: 'manual' | 'lumiverse' | 'pocket'
  sourceId: string
  name: string
  description: string
  avatarUrl: string
}
export interface MochiCharacter { id: string; name: string; avatarUrl: string }
export interface MochiMessage {
  id: string; role: 'user' | 'assistant'; content: string; name: string; avatarUrl: string
  characterId?: string; createdAt: string; requestId: string
}
export interface MochiSettings {
  autoReply: boolean; connectionId: string; contextTokens: number; outputTokens: number
  instructions: string; characterNames: Record<string, string>
}
export const defaultMochiSettings = (): MochiSettings => ({ autoReply: true, connectionId: '', contextTokens: 8192, outputTokens: 1200, instructions: '', characterNames: {} })
export interface MochiRoom {
  version: 1
  id: string
  revision: number
  title: string
  characterIds: string[]
  persona: MochiPersona
  messages: unknown[]
  settings?: MochiSettings
  receipts?: string[]
  createdAt: string
  updatedAt: string
}
export interface MochiState {
  rooms: MochiRoom[]
  characters: MochiCharacter[]
  personas: MochiPersona[]
  warnings: string[]
  connections?: Array<{ id: string; name: string; model: string }>
  jobs?: Record<string, string>
}
export const MOCHI_ROOM_ID = /^room_[a-f0-9]{32}$/
export function roomId(value: unknown): string {
  if (typeof value !== 'string' || !MOCHI_ROOM_ID.test(value)) throw new Error('Invalid Mochi room identifier.')
  return value
}
