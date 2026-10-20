import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { PHONE_STYLES } from '../styles.js'
import { PORTAL_STYLES } from '../frontend/components/portal.js'
import { getMochiSession } from './session.js'
import { createMochiSidebar } from './sidebar.js'
import { createMochiLauncher } from './launcher.js'
import { MOCHI_SIDEBAR_ICON } from './sidebar-icon.js'

const shells = new WeakMap<SpindleFrontendContext, () => void>()
/** Own the authenticated session and all registrations, including partial startup. */
export function setupMochiShell(ctx: SpindleFrontendContext): () => void {
  const existing = shells.get(ctx)
  if (existing) return existing
  const cleanups: Array<() => void> = []
  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    shells.delete(ctx)
    for (const clean of cleanups.splice(0).reverse()) { try { clean() } catch { /* Complete the remaining cleanup even after transport loss. */ } }
  }
  try {
    cleanups.push(ctx.dom.addStyle(PHONE_STYLES + PORTAL_STYLES))
    const session = getMochiSession(ctx)
    cleanups.push(() => session.destroy())
    const drawer = ctx.ui.registerDrawerTab({ id: 'mochi-independent', title: 'Mochi', shortName: 'Mochi', headerTitle: 'Mochi', description: 'Mochi accounts and messenger', keywords: ['mochi', 'messages', 'accounts'], iconSvg: MOCHI_SIDEBAR_ICON })
    cleanups.push(() => drawer.destroy())
    // Reuse the legacy portal's full-size Mochi layout contract. The phone
    // landing-card wrapper centers intrinsic-width children and collapses the
    // container-query profile editor when its navigation is hidden.
    const root = document.createElement('div')
    root.className = 'pocket-portal'
    root.dataset.destination = 'mochi'
    const body = document.createElement('div')
    body.className = 'pocket-portal-body'
    root.append(body)
    drawer.root.append(root)
    const navigation = createMochiSidebar(ctx, session, () => ({ enabled: true, previews: false }), () => drawer.activate(), () => ctx.sendToBackend({ type: 'mochi:open_shell' }))
    body.append(navigation.root)
    cleanups.push(() => navigation.destroy())
    cleanups.push(drawer.onActivate(() => navigation.open()))
    const action = ctx.ui.registerInputBarAction({ id: 'mochi-open-independent', label: 'Open Mochi', subtitle: 'Open Mochi accounts and messenger', iconSvg: MOCHI_SIDEBAR_ICON })
    cleanups.push(() => action.destroy())
    cleanups.push(action.onClick(() => { drawer.activate(); navigation.openMessenger() }))
    // Widgets/geometry are optional; the owned drawer/action remain available.
    try { cleanups.push(createMochiLauncher(ctx.ui, undefined, session, navigation)) } catch { /* Supported drawer fallback. */ }
    cleanups.push(session.observeNavigation({ redraw() {}, disposed: dispose }))
    if (ctx.onTeardown) cleanups.push(ctx.onTeardown(dispose))
    shells.set(ctx, dispose)
    ctx.ready()
    return dispose
  } catch (error) { dispose(); throw error }
}
