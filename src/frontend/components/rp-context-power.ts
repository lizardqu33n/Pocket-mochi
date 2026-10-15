import { POCKET_ICONS } from './icons.js'

export function rpContextPowerButton(enabled: boolean | null, save: (enabled: boolean) => void): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'lp-rp-context-power'
  const label = enabled === null ? 'RP context: Unavailable' : `RP context: ${enabled ? 'On' : 'Off'}`
  button.setAttribute('aria-label', label)
  if (enabled !== null) button.setAttribute('aria-pressed', String(enabled))
  button.title = `${label}. Controls automatic Pocket context for this RP only; apps and Mochi stay available.`
  button.disabled = enabled === null
  const icon = document.createElement('span')
  icon.setAttribute('aria-hidden', 'true')
  icon.innerHTML = POCKET_ICONS.power
  button.append(icon)
  button.addEventListener('click', () => {
    if (enabled === null) return
    button.disabled = true
    save(!enabled)
  })
  return button
}
