import { getMochiSession, type MochiSession, type MochiSurface, type MochiTransport } from './session.js'
import { reconcileMochiNotifications, showMochiNotification, type MochiNotificationPolicy } from './notifications.js'

export interface MochiWorkspaceOptions {
  root: HTMLElement
  /** Pass the original context methods, without rebinding/wrapping them. */
  transport: MochiTransport
  notificationPolicy: () => Pick<MochiNotificationPolicy, 'enabled' | 'previews'>
  /** For hosts whose transport wrapper cannot retain context method identity. */
  session?: MochiSession
}
export interface MochiWorkspace {
  readonly apiVersion: 1
  readonly isOpen: boolean
  open(): void
  close(): void
  refresh(): void
  openRoom(roomId: string): boolean
  destroy(): void
}

/** Compatibility surface: shares the authenticated session, never another view. */
export function createMochiWorkspace(options: MochiWorkspaceOptions): MochiWorkspace {
  const session = options.session || getMochiSession(options.transport)
  session.assertActive()
  const view = session.view, frame = document.createElement('section')
  frame.className = 'mochi-workspace'; frame.setAttribute('aria-label', 'Mochi workspace'); frame.hidden = true
  const style = document.createElement('style')
  style.textContent = '.mochi-workspace{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;box-sizing:border-box}.mochi-workspace[hidden]{display:none!important}.mochi-workspace>.mochi-view{min-height:0}'
  frame.append(style); options.root.append(frame)
  let opened = false, destroyed = false, dirty = true
  let dismissNotice: (() => void) | undefined
  const visible = () => opened && session.owns(surface) && frame.isConnected && !document.hidden && !frame.closest('[hidden]') && (typeof frame.checkVisibility !== 'function' || frame.checkVisibility({ visibilityProperty: true }))
  const policy = (): MochiNotificationPolicy => ({ ...options.notificationPolicy(), visible: visible() && view.isConversationOpen() })
  const render = () => {
    if (destroyed || !opened) { dirty = true; return }
    if (!dirty) return
    const focused = frame.contains(document.activeElement) ? document.activeElement as HTMLInputElement | HTMLTextAreaElement : null
    const label = focused?.getAttribute('aria-label')
    const selection = focused && ['TEXTAREA', 'INPUT'].includes(focused.tagName) ? [focused.selectionStart, focused.selectionEnd] : null
    const node = view.render(); node.classList.add('lumiphone-app-view')
    const old = frame.querySelector(':scope > .mochi-view')
    if (old) old.replaceWith(node); else frame.append(node)
    if (label) {
      const replacement = Array.from(node.querySelectorAll<HTMLInputElement>('[aria-label]')).find(n => n.tagName === focused!.tagName && n.getAttribute('aria-label') === label)
      replacement?.focus({preventScroll:true})
      if (replacement && selection?.[0] != null && selection[1] != null) replacement.setSelectionRange(selection[0], selection[1])
    }
    dirty = false
  }
  const surface: MochiSurface = {
    redraw: () => { dirty = true; render() },
    navigate: id => { view.select(id || ''); dirty = true; render() }, policy,
    notify: (notice, open) => { if (!visible()) return; dismissNotice?.(); dismissNotice = showMochiNotification(frame, notice, policy().previews, open) },
    reconcile: (notices, rooms) => reconcileMochiNotifications(frame, notices, rooms),
    dismiss: () => { dismissNotice?.(); dismissNotice = undefined },
    ownership: active => { opened = active; frame.hidden = !active; if (active) render() },
    disposed: () => { destroyed = true; opened = false; frame.remove() },
  }
  const detach = session.attach(surface)
  const ensureActive = () => { if (destroyed) throw new Error('This Mochi workspace is destroyed.'); session.assertActive() }
  return {
    apiVersion: 1,
    get isOpen() { return opened },
    open() { ensureActive(); if (opened) return; session.activate(surface) },
    close() { if (!destroyed) session.hide(surface) },
    refresh() { ensureActive(); session.refresh() },
    openRoom(id) { ensureActive(); if (!view.canOpenRoom(id)) return false; session.activate(surface); view.openRoom(id); return true },
    destroy() { if (destroyed) return; try { detach() } finally { surface.dismiss(); surface.disposed() } },
  }
}
