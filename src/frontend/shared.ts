export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', content = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (content) node.textContent = content
  return node
}

export function button(label: string, className = 'lp-button'): HTMLButtonElement {
  const node = el('button', className, label)
  node.type = 'button'
  return node
}

/** Nonnegative pixel margins used by measured overlays; invalid CSS keeps defaults. */
export function cssPixelToken(node:HTMLElement,name:string,fallback:number):number {
  const raw=node.ownerDocument.defaultView?.getComputedStyle(node).getPropertyValue(name).trim()||''
  return /^\d+(?:\.\d+)?px$/.test(raw)?Number.parseFloat(raw):fallback
}

export interface PageAction {
  label: string
  callback: () => void
  enabled?: boolean
  ariaLabel?: string
}

export function formatTime(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatDate(value: string | number | Date, detail = false): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value || '')
  return new Intl.DateTimeFormat(undefined, detail
    ? { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric' }).format(date)
}

export function dateTimeLocal(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function inputValue(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  return input.value.trim()
}

export function requestId(prefix = 'req'): string {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`
}
