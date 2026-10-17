import {mochiStyle} from './ui/styles.js'
import { button, el } from '../frontend/shared.js'
import type { MochiNotification } from './types.js'

export interface MochiNotificationPolicy { enabled: boolean; previews: boolean; visible: boolean }
export function notificationBody(n: MochiNotification, previews: boolean): string { return previews ? n.body : 'New character message' }
const activeNotices = new WeakMap<HTMLElement, MochiNotification>()
/** Retire read, dismissed or changed toasts within this account's handset only. */
export function reconcileMochiNotifications(shell: HTMLElement, notices: MochiNotification[], rooms: Set<string>): void {
  for (const toast of shell.querySelectorAll<HTMLElement>('.mochi-notification-toast')) {
    const previous = activeNotices.get(toast)
    if (!previous || !rooms.has(previous.roomId)) continue
    const current = notices.find(n => n.id === previous.id && n.roomId === previous.roomId)
    if (!current || current.read || current.body !== previous.body || current.title !== previous.title || current.roomTitle !== previous.roomTitle || current.avatarUrl !== previous.avatarUrl) toast.remove()
  }
}
/** Uses Pocket's in-handset notification surface; never invokes OS/browser push. */
export function showMochiNotification(shell: HTMLElement, n: MochiNotification, previews: boolean, open: () => void): () => void {
  const toast = button('', 'lp-floating-notification mochi-notification-toast'); toast.setAttribute('role', 'status')
  activeNotices.set(toast, { ...n })
  const portrait = el('span', 'mochi-notification-avatar', n.title.slice(0, 1))
  // This toast also appears while another Pocket app is open, outside Mochi's scoped stylesheet.
  if (n.avatarUrl) { const image = el('img'); image.src = n.avatarUrl; image.alt = ''; portrait.replaceChildren(image) }
  const copy = el('span', 'lp-grow'); copy.append(el('strong', '', `${n.title} · ${n.roomTitle}`), el('span', '', notificationBody(n, previews)))
  toast.append(portrait, copy); toast.onclick = () => { open(); dismiss() }; shell.append(toast)
  if(!shell.querySelector(':scope > style[data-mochi-notifications]')){const style=el('style');style.dataset.mochiNotifications='true';style.textContent=mochiStyle('notifications');shell.append(style)}
  const timer = setTimeout(() => toast.remove(), 6000)
  const dismiss = () => { clearTimeout(timer); toast.remove() }
  return dismiss
}
