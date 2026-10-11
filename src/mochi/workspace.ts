import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { MochiView } from './view.js'
import { reconcileMochiNotifications, showMochiNotification, type MochiNotificationPolicy } from './notifications.js'

export interface MochiWorkspaceOptions {
  /** A dedicated, theme-inheriting container owned by Pocket's shell. */
  root: HTMLElement
  transport: Pick<SpindleFrontendContext, 'sendToBackend' | 'onBackendMessage'>
  /** Reuse Pocket's actual notification/privacy preferences; never phone identity. */
  notificationPolicy: () => Pick<MochiNotificationPolicy, 'enabled' | 'previews'>
}
export interface MochiWorkspace {
  readonly apiVersion: 1
  readonly isOpen: boolean
  open(): void
  close(): void
  /** Host reconnect/refresh: reload account-scoped rooms without resetting drafts. */
  refresh(): void
  /** Only navigate to a room already loaded in the selected account. */
  openRoom(roomId: string): boolean
  destroy(): void
}

/** One authenticated session, one independent view; no RP/chat/phone dependency. */
export function createMochiWorkspace(options: MochiWorkspaceOptions): MochiWorkspace {
  const frame = document.createElement('section')
  frame.className = 'mochi-workspace'; frame.setAttribute('aria-label', 'Mochi workspace'); frame.hidden = true
  const style = document.createElement('style')
  // Container sizing only. Keep the approved Mochi view/CSS and inherited theme.
  style.textContent = '.mochi-workspace{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;box-sizing:border-box}.mochi-workspace[hidden]{display:none!important}.mochi-workspace>.mochi-view{min-height:0}'
  frame.append(style); options.root.append(frame)
  let opened = false, started = false, destroyed = false, dirty = false
  let dismissNotice: (() => void) | undefined
  const policy = (): MochiNotificationPolicy => ({ ...options.notificationPolicy(), visible: opened && frame.isConnected && !document.hidden && !frame.closest('[hidden]') && (typeof frame.checkVisibility !== 'function' || frame.checkVisibility({ visibilityProperty: true })) })
  const render = () => {
    if (destroyed) return
    if (!opened) { dirty = true; return }
    const focused = frame.contains(document.activeElement) ? document.activeElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement : null
    const label = focused?.getAttribute('aria-label')
    const selection = focused && (focused.tagName === 'TEXTAREA' || focused.tagName === 'INPUT') ? [(focused as HTMLInputElement).selectionStart, (focused as HTMLInputElement).selectionEnd] : null
    const viewNode = view.render(); viewNode.classList.add('lumiphone-app-view')
    const old = frame.querySelector(':scope > .mochi-view')
    if (old) old.replaceWith(viewNode); else frame.append(viewNode)
    if (label) {
      const replacement = Array.from(viewNode.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[aria-label]')).find(n => n.tagName === focused!.tagName && n.getAttribute('aria-label') === label)
      replacement?.focus({ preventScroll: true })
      if (replacement && selection?.[0] !== null && selection?.[0] !== undefined && selection[1] !== null && (replacement.tagName === 'INPUT' || replacement.tagName === 'TEXTAREA')) (replacement as HTMLInputElement).setSelectionRange(selection[0], selection[1])
    }
    dirty = false
  }
  const view = new MochiView(payload => { if (!destroyed) options.transport.sendToBackend(payload) }, render,
    roomId => { view.select(roomId || ''); render() }, policy,
    notice => {
      if (!policy().visible) return
      dismissNotice?.()
      dismissNotice = showMochiNotification(frame, notice, policy().previews, () => view.openRoom(notice.roomId))
    }, (notices, rooms) => reconcileMochiNotifications(frame, notices, rooms))
  const unsubscribe = options.transport.onBackendMessage(payload => { if (!destroyed) view.receive(payload) })
  const ensureActive = () => { if (destroyed) throw new Error('This Mochi workspace has been destroyed.') }
  const openWorkspace = () => {
    ensureActive(); if (opened) return
    opened = true; frame.hidden = false
    if (!started) { started = true; view.open() }
    else { if (dirty) render(); view.resume() }
  }
  return {
    apiVersion: 1,
    get isOpen() { return opened },
    open: openWorkspace, // Account-wide startup; repeated open retains UI state.
    close() {
      if (destroyed || !opened) return
      opened = false; frame.hidden = true; dismissNotice?.(); dismissNotice = undefined
      view.leave() // Stop only this view's interactive generation; durable server work continues.
    },
    refresh() { ensureActive(); if (started) view.load() },
    openRoom(roomId) {
      ensureActive()
      if (!view.canOpenRoom(roomId)) return false
      openWorkspace(); view.openRoom(roomId); return true
    },
    destroy() {
      if (destroyed) return
      opened = false; frame.hidden = true; dismissNotice?.(); unsubscribe()
      try { view.destroy() } finally { destroyed = true; frame.remove() }
    },
  }
}
