// Compatibility entry point for the current Part 1 messenger verification.
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const result=spawnSync(process.execPath,[fileURLToPath(new URL('./check-mochi-refresh-ui.mjs',import.meta.url))],{stdio:'inherit',env:{...process.env,...(process.env.MOCHI_MESSENGER_OUTPUT?{MOCHI_REFRESH_OUTPUT:process.env.MOCHI_MESSENGER_OUTPUT}:{})}})
process.exit(result.status??1)
