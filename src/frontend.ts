import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { setupPhone } from './frontend/controller.js'
import { PHONE_STYLES } from './styles.js'
import { PORTAL_STYLES } from './frontend/components/portal.js'
// Pocket's future sidebar may import this boundary without phone-controller routing.
export { createMochiWorkspace, type MochiWorkspace, type MochiWorkspaceOptions } from './mochi/workspace.js'
export { getMochiSession, type MochiSession } from './mochi/session.js'

export function setup(ctx: SpindleFrontendContext): () => void {
  const removeStyle = ctx.dom.addStyle(PHONE_STYLES + PORTAL_STYLES)
  const destroyPhone = setupPhone(ctx)
  return () => {
    destroyPhone()
    removeStyle()
  }
}
