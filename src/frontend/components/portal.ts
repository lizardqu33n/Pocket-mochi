import { button, el } from '../shared.js'

type Destination = 'home' | 'phones' | 'mochi'
const artwork = {
  phones: '<rect x="41" y="13" width="48" height="76" rx="10"/><path d="M56 22h18M60 79h10M51 41h28M51 50h19"/><path d="M25 42c-10 10-10 25 0 35M105 25c10 10 10 25 0 35" stroke-dasharray="3 5"/><circle cx="24" cy="24" r="5"/><path d="M101 78h12m-6-6v12"/>',
  mochi: '<rect x="15" y="20" width="82" height="54" rx="9"/><path d="M15 34h82M25 27h1m7 0h1m7 0h1M30 47h35M30 56h25"/><path d="M79 52h31v28H95l-10 8v-8h-6z"/><path d="M87 63h15M87 70h9"/>',
}

/** Navigation only: neither destination owns the other's identity or messages. */
export class PocketPortal {
  readonly root = el('section', 'pocket-portal lumiphone-device-drawer')
  private destination: Destination = 'home'
  constructor(private phones: () => HTMLElement, private mochi: () => HTMLElement, private startMochi: () => void, private mochiNavigation?: {back: (exit: () => void, anchor: HTMLElement) => void; home: (exit: () => void, anchor: HTMLElement) => void; window?: () => void}) {
    this.root.setAttribute('aria-label', 'Pocket portal')
    this.render()
  }
  show(destination: Destination): void {
    this.destination = destination
    this.render()
    if (destination === 'mochi') this.startMochi()
    this.root.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }
  refresh(mochi = false): void {
    if (this.destination === 'phones' || (mochi && this.destination === 'mochi')) this.render()
  }
  private render(): void {
    const active = this.root.contains(document.activeElement) ? document.activeElement as HTMLInputElement : null
    const label = active?.getAttribute('aria-label')
    const selection = active && ['INPUT', 'TEXTAREA'].includes(active.tagName) ? [active.selectionStart, active.selectionEnd] : undefined
    const nav = el('nav', 'pocket-portal-nav'); nav.setAttribute('aria-label', 'Portal navigation')
    const home = button('Pocket /', 'pocket-portal-home'); home.title='Return to Pocket portal';home.onclick = () => {const exit=()=>this.show('home');if(this.destination==='mochi'&&this.mochiNavigation)this.mochiNavigation.home(exit,home);else exit()}
    if(this.destination!=='home'){const back=button('← Back','pocket-portal-back');back.setAttribute('aria-label',this.destination==='mochi'?'Back in Mochi':'Back to portal');back.onclick=()=>{const exit=()=>this.show('home');if(this.destination==='mochi'&&this.mochiNavigation)this.mochiNavigation.back(exit,back);else exit()};nav.append(back)}
    nav.append(home, el('span', '', this.destination === 'home' ? 'online' : this.destination === 'phones' ? 'devices' : 'mochi'))
    if(this.mochiNavigation?.window){const windowButton=button('Mochi window','pocket-portal-back');windowButton.setAttribute('aria-label','Open Mochi window');windowButton.onclick=this.mochiNavigation.window;nav.append(windowButton)}
    const body = el('div', 'pocket-portal-body')
    if (this.destination === 'home') {
      const title = el('h2', '', 'A little closer.'); title.tabIndex = -1
      body.append(el('p', 'pocket-portal-eyebrow', 'YOUR POCKET OF THE INTERNET'), title,
        el('p', 'pocket-portal-intro', 'Pick a place to connect.'))
      body.append(el('p', 'pocket-portal-info', 'Pocket uses the active RP. Mochi keeps separate chat histories.'))
      const results = el('div', 'pocket-portal-destinations')
      for (const [id, title, copy, foot] of [
        ['phones', 'Connect to your phone', 'Choose a phone to view its messages and apps.', 'POCKET DEVICES'],
        ['mochi', 'Open Mochi', 'Manage profiles and open independent character chats.', 'INDEPENDENT CHATS'],
      ] as const) {
        const card = button('', 'pocket-portal-destination'); card.setAttribute('aria-label', title)
        const art = el('span', 'pocket-portal-art'); art.setAttribute('aria-hidden', 'true')
        art.innerHTML = `<svg viewBox="0 0 130 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${artwork[id]}</svg>`
        card.append(art, el('small', '', foot), el('strong', '', title), el('span', '', copy), el('span', 'pocket-portal-arrow', '↗'))
        card.onclick = () => this.show(id); results.append(card)
      }
      body.append(results)
    } else body.append(this.destination === 'phones' ? this.phones() : this.mochi())
    body.querySelector<HTMLElement>('h2')?.setAttribute('tabindex', '-1')
    this.root.replaceChildren(nav, body)
    if (label) {
      const replacement = Array.from(this.root.querySelectorAll<HTMLInputElement>('[aria-label]')).find(n => n.tagName === active!.tagName && n.getAttribute('aria-label') === label)
      ;(replacement || this.root.querySelector<HTMLElement>('h2'))?.focus({ preventScroll: true })
      if (replacement && selection?.[0] != null && selection[1] != null) replacement.setSelectionRange(selection[0], selection[1])
    }
  }
}

export const PORTAL_STYLES = `
.mochi-view .mochi-wordmark{margin:0;line-height:1;width:88px;height:32px}.mochi-wordmark svg{display:block;width:88px;height:32px;overflow:visible}


.pocket-portal{--lp-bg:var(--lumiverse-bg-elevated,#201e25);--lp-surface:var(--lumiverse-fill-subtle,#ffffff08);--lp-text:var(--lumiverse-text,#eee);--lp-muted:var(--lumiverse-text-muted,#aaa);--lp-border:var(--lumiverse-border,#ffffff14);--lp-accent:var(--lumiverse-primary,#a6a0d9);box-sizing:border-box;min-width:0;width:100%;min-height:100%;padding:18px 16px;color:var(--lp-text);font:400 13px/1.5 Inter,ui-sans-serif,system-ui,sans-serif}
.pocket-portal *{box-sizing:border-box}.pocket-portal [hidden]{display:none!important}.pocket-portal-nav{display:flex;justify-content:space-between;align-items:center;padding-bottom:22px;font-size:10px;letter-spacing:.08em;color:var(--lp-muted)}.pocket-portal button{font:inherit;cursor:pointer}.pocket-portal-home{border:0;background:none;color:var(--lp-text);padding:6px 0;font-weight:650!important}.pocket-portal-eyebrow{font-size:9px;letter-spacing:.14em;color:var(--lp-muted);margin:8px 0}.pocket-portal h2{font-size:28px;line-height:1.15;letter-spacing:-.05em;font-weight:550;margin:0}.pocket-portal-intro{color:var(--lp-muted);margin:12px 0 24px}.pocket-portal-info{margin:0 0 18px;padding:10px 12px;border-left:2px solid var(--lp-accent);border-radius:0 6px 6px 0;background:var(--lp-surface);color:var(--lp-muted);font-size:11px;line-height:1.5}.pocket-portal-destinations{display:grid;gap:12px}.pocket-portal-destination{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:7px;text-align:left;align-items:start;width:100%;padding:18px 16px;border:1px solid var(--lp-border);border-radius:12px;background:var(--lp-surface);color:var(--lp-text)}.pocket-portal-destination small{grid-column:1;font-size:8px;letter-spacing:.12em;color:var(--lp-muted)}.pocket-portal-destination strong{grid-column:1;font-size:17px;line-height:1.25;letter-spacing:-.03em;font-weight:550}.pocket-portal-destination>span:not(.pocket-portal-art):not(.pocket-portal-arrow){grid-column:1/-1;color:var(--lp-muted);font-size:11px;max-width:30ch}.pocket-portal-art{grid-column:2;grid-row:1/3;align-self:center;color:var(--lp-accent)}.pocket-portal-art svg{display:block;width:92px;height:72px}.pocket-portal-arrow{position:absolute;right:16px;bottom:14px;color:var(--lp-accent)}.pocket-portal-destination:hover{background:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg));border-color:color-mix(in srgb,var(--lp-accent) 35%,var(--lp-border))}.pocket-portal :is(button,input,textarea,select):focus-visible{outline:2px solid var(--lp-accent);outline-offset:3px}.pocket-portal .lumiphone-device-drawer{padding:0;min-height:0}.pocket-portal .lumiphone-device-footer{display:flex;flex-wrap:wrap;gap:8px}.pocket-portal .lumiphone-device-access{flex:1 1 128px;min-height:44px;padding:10px 12px;border:1px solid var(--lp-border);border-radius:8px;background:var(--lp-surface);color:var(--lp-text);font-size:11px;line-height:1.3;text-align:center}.pocket-portal .lumiphone-device-access:disabled{cursor:default;color:var(--lp-muted)}.pocket-portal .lumiphone-device-access:not(:disabled):hover{border-color:var(--lp-accent);background:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg))}.pocket-portal .mochi-view{min-height:0;height:auto;padding:0;background:none;overflow:visible}.pocket-portal .mochi-view>header{display:flex;justify-content:space-between;align-items:center;min-height:46px;padding-bottom:10px}.pocket-portal .mochi-view>header>.mochi-actions{margin-left:auto}.pocket-portal .mochi-view>header .mochi-icon-button{background:transparent;border:0;min-width:36px;width:36px;height:36px;min-height:36px}.pocket-portal .mochi-view h2{font-size:20px;letter-spacing:-.03em}.pocket-portal .mochi-view .mochi-card{border-radius:10px}.pocket-portal .mochi-view>.lp-button{min-height:38px;padding:8px 12px;font-size:12px;background:transparent;border-color:var(--lp-border);justify-content:flex-start}.pocket-portal .mochi-view>.mochi-primary{background:var(--lp-surface);color:var(--lp-text)}
.mochi-view>header{grid-template-columns:minmax(0,1fr) auto;min-height:36px}.mochi-brand h2{font-family:inherit;font-size:17px;line-height:1.3;font-weight:600;letter-spacing:-.02em}.mochi-view[data-surface=chat]>header{display:none}.mochi-view[data-surface=chat]{--mochi-accent:var(--lp-accent);--mochi-surface:var(--lp-bg);--mochi-border:var(--lp-border);gap:8px}.mochi-view[data-surface=chat] .mochi-room-header{grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:0 0 8px;border-bottom:1px solid var(--lp-border)}.mochi-view[data-surface=chat] .mochi-room-header>.mochi-actions{flex-wrap:nowrap}.mochi-view[data-surface=chat] .mochi-room-selector{width:100%;min-width:0;max-width:100%;text-overflow:ellipsis;background:transparent;border:0;border-radius:0;padding-left:0;font-size:14px}.mochi-view[data-surface=chat] .mochi-room-select-icon{display:none}.mochi-view[data-surface=chat] .mochi-room-meta{font-size:10px}.mochi-view[data-surface=chat] .mochi-composer{padding:8px 14px 12px;background:var(--lp-bg);border-top:1px solid var(--lp-border)}.mochi-view[data-surface=chat] .mochi-composer-hint{display:none}.mochi-view[data-surface=chat] .mochi-responder{border:0;padding-block:3px;padding-right:8px;min-height:34px;background:transparent}.mochi-view[data-surface=chat] .mochi-responder::after{content:none}.mochi-view[data-surface=chat] .mochi-message-actions{right:0}.mochi-view[data-surface=chat] .mochi-thread{overflow-x:hidden}.mochi-view[data-surface=chat] .mochi-bubble{border-radius:14px;font-size:13px}
@media(min-width:721px) and (min-height:541px){.pocket-portal-body{max-width:440px;margin-inline:auto}.pocket-portal .mochi-form{gap:14px}.pocket-portal .mochi-form .mochi-picker{grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}.pocket-portal .mochi-form .mochi-choice{padding:10px 6px}.mochi-view[data-surface=chat] .mochi-room-header{grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.mochi-view[data-surface=chat] .mochi-room-header .mochi-actions{gap:4px}.mochi-view[data-surface=chat] .mochi-room-header .mochi-icon-button{width:32px;min-width:32px;height:32px;min-height:32px;padding:7px}.mochi-view[data-surface=chat] .mochi-room-meta{margin-top:0}.mochi-view[data-surface=chat] .mochi-room-selector{min-height:32px}.mochi-view[data-surface=chat] .mochi-room-header>.mochi-actions{padding:0}}

.pocket-portal-nav{gap:12px}.pocket-portal-nav>span{margin-left:auto}.pocket-portal-back{min-height:44px;padding:6px 0;border:0;background:transparent;color:var(--lp-text)}.pocket-portal .mochi-profile-screen{gap:18px}.pocket-portal .mochi-view .mochi-inbox-actions>.lp-button{width:auto;flex:1 1 auto}.pocket-portal .mochi-account-picker .mochi-secondary-action{width:auto}.pocket-portal .mochi-profile-actions .lp-button{font-size:12px}.pocket-portal .mochi-connection-indicator{min-height:44px}.pocket-portal .mochi-profile-fields input,.pocket-portal .mochi-profile-fields select,.pocket-portal .mochi-profile-fields textarea{font-size:13px;border-radius:8px}

.pocket-portal .mochi-sheet{position:fixed;inset:var(--app-interactive-safe-top,0px) 0 0;margin:auto;max-height:calc(100dvh - var(--app-interactive-safe-top,0px) - 32px);font:400 13px/1.5 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:normal;text-transform:none}.pocket-portal .mochi-sheet h2{font-size:18px;letter-spacing:-.02em}.mochi-unsaved-sheet .lp-sheet-close{display:none}
`
