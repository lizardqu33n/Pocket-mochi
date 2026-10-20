import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { setupMochiShell } from './mochi/shell.js'
export { createMochiWorkspace, type MochiWorkspace, type MochiWorkspaceOptions } from './mochi/workspace.js'
export { getMochiSession, type MochiSession } from './mochi/session.js'

export function setup(ctx: SpindleFrontendContext): () => void {
  return setupMochiShell(ctx)
}
