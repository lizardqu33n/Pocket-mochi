import { startTransferMaintenance } from './mochi/transfer-runtime.js'
declare const spindle: import('lumiverse-spindle-types').SpindleAPI
declare const MOCHI_TRANSFER_MODE: 'source' | 'destination'
export const teardown = startTransferMaintenance(spindle, MOCHI_TRANSFER_MODE)
