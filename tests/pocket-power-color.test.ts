import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { rpContextPowerButton } from '../src/frontend/components/rp-context-power.js'
import { PHONE_STYLES } from '../src/styles.js'

test('power colors follow acknowledged state on light/dark surfaces; pending stays neutral', () => {
  const dom = new JSDOM(), previous = globalThis.document
  globalThis.document = dom.window.document
  try {
    const style = document.createElement('style')
    style.textContent = PHONE_STYLES.split('\n').filter(line => line.trimStart().startsWith('.lp-rp-context-power')).join('\n')
    document.head.append(style)
    for (const surface of ['#ffffff', '#09090b']) {
      document.body.style.background = surface
      const saved: boolean[] = []
      for (const [state, color] of [[true, 'rgb(74, 222, 128)'], [false, 'rgb(248, 113, 113)'], [null, 'rgb(156, 163, 175)']] as const) {
        const button = rpContextPowerButton(state, value => saved.push(value))
        document.body.append(button)
        expect(dom.window.getComputedStyle(button).color).toBe(color)
        expect(dom.window.getComputedStyle(button).backgroundColor).toBe('rgb(22, 27, 36)')
        expect(button.getAttribute('aria-pressed')).toBe(state === null ? null : String(state))
        expect(button.title).toContain('apps and Mochi stay available')
        if (state !== null) {
          button.click(); button.click()
          expect(saved.at(-1)).toBe(!state)
          expect(button.getAttribute('aria-pressed')).toBe(String(state))
          expect(dom.window.getComputedStyle(button).color).toBe('rgb(156, 163, 175)')
        } else expect(button.disabled).toBe(true)
        button.remove()
      }
      expect(saved).toEqual([false, true])
    }
    expect(style.textContent).toContain('.lp-rp-context-power:hover:not(:disabled) { background:#232a36; }')
    expect(style.textContent).toContain('outline:2px solid var(--lp-accent); outline-offset:3px;')
  } finally { globalThis.document = previous; dom.window.close() }
})
