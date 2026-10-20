import type { MochiHost } from './service.js'
export const TRANSFER_LOCK = 'mochi-transfer/v1/blocked.json'
/** Only maintenance removes the marker after a durable completed journal. */
export async function assertTransferUnlocked(host: MochiHost, owner: string): Promise<void> {
  if (await host.userStorage.exists(TRANSFER_LOCK, owner)) throw Error('Mochi transfer recovery is required. Open the approved maintenance package before using this account.')
}
