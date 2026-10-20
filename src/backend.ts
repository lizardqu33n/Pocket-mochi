import { startMochiRuntime } from './mochi/runtime.js'
declare const spindle: import('lumiverse-spindle-types').SpindleAPI

const runtime = startMochiRuntime(spindle)
// Explicit disposal for controlled embeddings/tests. Worker termination is host-owned.
export const teardown = () => runtime.stop()
