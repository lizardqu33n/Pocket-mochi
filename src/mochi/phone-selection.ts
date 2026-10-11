export interface MochiPhone { chatId: string; characterId: string; deviceOwnerActorId: string }
export function phoneContext(value: unknown): MochiPhone | undefined {
  if (value === undefined) return undefined
  const p = value as MochiPhone
  if (!p || [p.chatId,p.characterId,p.deviceOwnerActorId].some(v=>typeof v!=='string'||!v||v.length>180)) throw new Error('Invalid Mochi phone identity.')
  return p
}
/** Inspect only persisted phone identity, never normalize/save native state or read RP context. */
export function storedPhoneKey(phone: MochiPhone, raw: any): string | undefined {
  if (!raw || raw.chatId!==phone.chatId || raw.characterId!==phone.characterId) return undefined
  const owner=phone.deviceOwnerActorId
  if(owner!==raw.pocketPersonaActorId && ![...(Array.isArray(raw.contacts)?raw.contacts:[]),...(Array.isArray(raw.discoveredActors)?raw.discoveredActors:[])].some(a=>a.id===owner)) return undefined
  return [phone.chatId,phone.characterId,owner].map(encodeURIComponent).join('::')
}
