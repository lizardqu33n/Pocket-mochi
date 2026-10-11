import { button, el } from '../frontend/shared.js'
import type { MochiNotification } from './types.js'

export interface MochiNotificationPolicy { enabled: boolean; previews: boolean; visible: boolean }
export function notificationBody(n: MochiNotification, previews: boolean): string { return previews ? n.body : 'New character message' }
/** Uses Pocket's in-handset notification surface; never invokes OS/browser push. */
export function showMochiNotification(shell: HTMLElement, n: MochiNotification, previews: boolean, open: () => void): () => void {
  const toast = button('', 'lp-floating-notification mochi-notification-toast'); toast.setAttribute('role', 'status')
  const portrait = el('span', 'mochi-notification-avatar', n.title.slice(0, 1))
  // This toast also appears while another Pocket app is open, outside Mochi's scoped stylesheet.
  portrait.style.cssText = 'width:32px;height:32px;border-radius:50%;overflow:hidden;flex:none;display:grid;place-items:center;background:var(--lp-surface-2)'
  if (n.avatarUrl) { const image = el('img'); image.src = n.avatarUrl; image.alt = ''; image.style.cssText = 'width:100%;height:100%;object-fit:cover'; portrait.replaceChildren(image) }
  const copy = el('span', 'lp-grow'); copy.append(el('strong', '', `${n.title} · ${n.roomTitle}`), el('span', '', notificationBody(n, previews)))
  toast.append(portrait, copy); toast.onclick = () => { open(); dismiss() }; shell.append(toast)
  toast.style.maxWidth = 'calc(100% - 24px)'
  toast.style.gridTemplateColumns = '32px minmax(0,1fr)'
  copy.style.minWidth = '0'; (copy.firstElementChild as HTMLElement).style.overflowWrap = 'anywhere'
  const timer = setTimeout(() => toast.remove(), 6000)
  const dismiss = () => { clearTimeout(timer); toast.remove() }
  return dismiss
}
