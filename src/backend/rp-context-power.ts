/** Separate from phone state: one permission per authenticated user and RP. */
export class RpContextPower {
  constructor(private storage: {
    getJson(path: string, options: {userId: string; fallback: null}): Promise<unknown>
    setJson(path: string, value: unknown, options: {userId: string; indent: number}): Promise<unknown>
  }) {}
  private path(chatId: string): string {
    if (!/^[A-Za-z0-9_-]{1,180}$/.test(chatId) || chatId === '_lobby') throw new Error('Select a saved RP chat first.')
    return `rp-context/${chatId}.json`
  }
  async enabled(chatId: string, userId: string | undefined, configured: () => Promise<boolean>): Promise<boolean> {
    if (!userId || chatId === '_lobby') return false
    const record = await this.storage.getJson(this.path(chatId), {userId, fallback:null})
    if (record === null) return configured()
    if (typeof record !== 'object' || record === null || (record as any).version !== 1 || typeof (record as any).enabled !== 'boolean') {
      throw new Error('Pocket RP-context permission is unreadable; it has not been overwritten.')
    }
    return (record as {enabled: boolean}).enabled
  }
  async save(chatId: string, userId: string | undefined, enabled: unknown): Promise<void> {
    if (!userId || typeof enabled !== 'boolean') throw new Error('An authenticated user and explicit RP-context permission are required.')
    const path = this.path(chatId)
    // Validate existing records before updating; never repair corruption silently.
    await this.enabled(chatId, userId, async () => false)
    await this.storage.setJson(path, {version:1, enabled}, {userId, indent:2})
  }
}
