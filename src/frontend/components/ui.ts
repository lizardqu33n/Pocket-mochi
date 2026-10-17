import { el } from '../shared.js'

function classes(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export interface IdentityBlockOptions {
  name: string
  meta?: string
  description?: string
  className?: string
  prominent?: boolean
  centered?: boolean
}

export function identityBlock(options: IdentityBlockOptions): HTMLDivElement {
  const root = el('div', classes(
    'lp-identity',
    options.prominent && 'lp-identity-prominent',
    options.centered && 'lp-identity-centered',
    options.className,
  ))
  const line = el('div', 'lp-identity-line')
  line.appendChild(el('strong', 'lp-identity-name', options.name))
  if (options.meta) line.appendChild(el('span', 'lp-identity-meta', options.meta))
  root.appendChild(line)
  if (options.description) root.appendChild(el('p', 'lp-identity-description', options.description))
  return root
}

export type StatusTone = 'neutral' | 'accent' | 'success' | 'danger'

export function statusBadge(label: string, tone: StatusTone = 'neutral'): HTMLSpanElement {
  const node = el('span', 'lp-status-badge', label)
  node.dataset.tone = tone
  return node
}

export function actionGroup(className = ''): HTMLDivElement {
  return el('div', classes('lp-actions', className))
}

export interface SectionBlock {
  section: HTMLElement
  body: HTMLDivElement
}

export function sectionBlock(label: string, help = '', className = ''): SectionBlock {
  const section = el('section', classes('lp-section', className))
  const head = el('header', 'lp-section-head')
  head.appendChild(el('div', 'lp-section-label', label))
  if (help) head.appendChild(el('p', 'lp-section-help', help))
  const body = el('div', 'lp-section-body')
  section.append(head, body)
  return { section, body }
}

export function fieldBlock(
  label: string,
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  help = '',
): HTMLLabelElement {
  const field = el('label', 'lp-field')
  field.appendChild(el('span', 'lp-field-label', label))
  field.appendChild(control)
  if (help) field.appendChild(el('span', 'lp-field-help', help))
  return field
}

export function controlRow(
  label: string,
  control: HTMLElement,
  help = '',
): HTMLLabelElement {
  const row = el('label', 'lp-card lp-control-row')
  const copy = el('span', 'lp-control-copy')
  copy.appendChild(el('span', 'lp-control-label', label))
  if (help) copy.appendChild(el('span', 'lp-control-help', help))
  row.append(copy, control)
  return row
}


/** Native disclosure: focusable and keyboard operable without lifecycle listeners. */
export function disclosure(label: string, ...children: Node[]): HTMLDetailsElement {
  const root = el('details', 'lp-disclosure')
  root.append(el('summary', '', label), ...children)
  return root
}

/** A surface-local modal sheet. Never attaches persona styling to document.body. */
export function showPocketSheet(anchor: HTMLElement, title: string, content: HTMLElement, surfaceRoot?: HTMLElement): { dismiss: () => void } | undefined {
  const parent = surfaceRoot || anchor.closest('.lumiphone-shell') || anchor.closest('[role="dialog"]') || anchor.parentElement
  if (!parent) return
  const dialog = el('dialog', 'lp-sheet')
  const panel = el('div', 'lp-sheet-panel')
  const heading = el('h2', 'lp-title', title)
  dialog.setAttribute('aria-label', title)
  const close = el('button', 'lp-button lp-sheet-close', 'Done'); close.type = 'button'
  const home = content.parentNode
  const marker = document.createComment('sheet content')
  home?.insertBefore(marker, content)
  const dismiss = () => dialog.close()
  close.addEventListener('click', dismiss)
  dialog.addEventListener('click', event => { if (event.target === dialog) dismiss() })
  dialog.addEventListener('close', () => {
    if (home) marker.replaceWith(content)
    dialog.remove()
    if (anchor.isConnected) anchor.focus()
  }, { once: true })
  panel.append(heading, content, close); dialog.append(panel); parent.append(dialog)
  const bounds = parent.getBoundingClientRect()
  if (parent.matches('.lumiphone-shell')) {
    // Top-layer dialogs inherit CSS zoom; bounds are already visual pixels.
    const layoutWidth = (parent as HTMLElement).offsetWidth
    const zoom = layoutWidth && bounds.width ? bounds.width / layoutWidth : 1
    const layoutPx = (pixels: number) => pixels / zoom
    dialog.style.position = 'fixed'
    dialog.style.margin = '0'
    dialog.style.left = `${layoutPx(bounds.left + 12)}px`
    dialog.style.top = 'auto'
    dialog.style.bottom = `${layoutPx(Math.max(12, window.innerHeight - bounds.bottom + 24))}px`
    dialog.style.width = `${layoutPx(Math.max(0, bounds.width - 24))}px`
    dialog.style.maxHeight = `${layoutPx(Math.max(120, bounds.height - 70))}px`
  }
  dialog.showModal()
  return { dismiss }
}

/** Keep the selected hue while bounding outgoing luminance for white text. */
export function outgoingSurface(accent: string): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(accent)?.[1] || '8b7dff'
  let rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))
  const luminance = () => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
  while (luminance() > .16) rgb = rgb.map(v => Math.floor(v * .95))
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('')
}

export function avatarColor(identity: string): string {
  const hash = Array.from(identity).reduce((n, c) => ((n * 31) + c.charCodeAt(0)) >>> 0, 0)
  return `hsl(${hash % 360} 27% 34%)`
}
