import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import type { MochiNotification } from './types.js'
import type { MochiNotificationPolicy } from './notifications.js'
import { MochiView } from './view.js'

export type MochiTransport = Pick<SpindleFrontendContext, 'sendToBackend' | 'onBackendMessage'>
export interface MochiSurface {
  redraw(): void
  navigate(roomId?: string): void
  policy(): MochiNotificationPolicy
  notify(notice: MochiNotification, open: () => void): void
  reconcile(notices: MochiNotification[], rooms: Set<string>): void
  dismiss(): void
  ownership(active: boolean): void
  disposed(): void
}

// The host creates new transport functions for each frontend context/generation.
// Picks of that context share ownership; rebinding/wrapping functions does not.
const sessions = new WeakMap<MochiTransport['onBackendMessage'], WeakMap<MochiTransport['sendToBackend'], MochiSession>>()

export function getMochiSession(transport: MochiTransport): MochiSession {
  return MochiSession.acquire(transport)
}

/** One view, transport listener, presentation lease and read/toast policy. */
export class MochiSession {
  static acquire(transport: MochiTransport): MochiSession {
    let bySender = sessions.get(transport.onBackendMessage)
    if (!bySender) { bySender = new WeakMap(); sessions.set(transport.onBackendMessage, bySender) }
    let session = bySender.get(transport.sendToBackend)
    if (!session) { session = new MochiSession(transport); bySender.set(transport.sendToBackend, session) }
    session.assertActive()
    return session
  }
  readonly view: MochiView
  private surfaces = new Set<MochiSurface>()
  private active?: MochiSurface
  private nativeListeners = new Set<(payload: unknown) => void>()
  private navigationObservers = new Set<{redraw():void; disposed():void}>()
  private unsubscribe: () => void
  private started = false
  private destroyed = false
  private disposing = false
  private realOwner?: string
  private invalidAuth?: () => void
  private constructor(private transport: MochiTransport) {
    this.view = new MochiView(payload => { this.assertActive(); transport.sendToBackend(payload) },
      () => { for (const surface of this.surfaces) surface.redraw(); for (const observer of this.navigationObservers) observer.redraw() }, id => this.active?.navigate(id),
      () => this.active?.policy() || {enabled:false,previews:false,visible:false},
      notice => { if (this.active?.policy().enabled) this.active.notify(notice, () => this.view.openRoom(notice.roomId)) },
      (notices, rooms) => this.active?.reconcile(notices, rooms))
    this.unsubscribe = transport.onBackendMessage(payload => {
      if (this.destroyed || this.disposing) return
      const p = payload as any
      if (typeof p?.type === 'string' && p.type.startsWith('mochi:')) {
        const owners = p.type === 'mochi:accounts' ? [p.state?.ownerId] : p.type === 'mochi:state' ? (p.state?.rooms || []).map((room:any) => room.ownerId) : []
        for (const owner of owners) if (typeof owner === 'string') {
          if (this.realOwner && this.realOwner !== owner) { this.destroy(false); return }
          this.realOwner = owner
        }
        this.view.receive(payload)
      } else for (const listener of this.nativeListeners) listener(payload)
    })
    // This is an inspected host event for an authoritative SESSION_EXPIRED API
    // response, not a network outage or RP/persona-change event.
    if (typeof window !== 'undefined') {
      this.invalidAuth = () => this.destroy(false)
      window.addEventListener('lumiverse:auth-session-invalid', this.invalidAuth)
    }
  }
  assertActive(): void { if (this.destroyed) throw new Error('This Mochi session is destroyed; use a fresh authenticated frontend context.') }
  get isDestroyed(): boolean { return this.destroyed }
  attach(surface: MochiSurface): () => void {
    this.assertActive(); this.surfaces.add(surface)
    return () => {
      if (!this.surfaces.delete(surface)) return
      try { if (this.active === surface) this.hide(surface) }
      finally { surface.disposed(); if (!this.surfaces.size && !this.nativeListeners.size && !this.navigationObservers.size) this.destroy() }
    }
  }
  subscribeNative(listener: (payload: unknown) => void): () => void {
    this.assertActive(); this.nativeListeners.add(listener)
    return () => { this.nativeListeners.delete(listener) }
  }
  owns(surface: MochiSurface): boolean { return !this.destroyed && this.active === surface }
  /** Navigation observes the same view without acquiring its presentation lease. */
  observeNavigation(observer: {redraw():void; disposed():void}): () => void {
    this.assertActive(); this.navigationObservers.add(observer)
    return () => { if (this.navigationObservers.delete(observer)) observer.disposed() }
  }
  prepareNavigation(): void { this.assertActive(); this.started = true; this.view.loadNavigationAccounts() }
  activate(surface: MochiSurface): void {
    this.assertActive()
    if (!this.surfaces.has(surface)) throw new Error('Mochi surface is not attached.')
    if (this.active === surface) return
    if (this.active) this.hide(this.active)
    this.active = surface; surface.ownership(true)
    if (!this.started) { this.started = true; this.view.open() }
    else this.view.resume()
  }
  hide(surface: MochiSurface): void {
    if (this.active !== surface) return
    this.active = undefined; surface.dismiss(); surface.ownership(false)
    this.view.leave()
  }
  refresh(): void { this.assertActive(); if (this.started) { if(this.view.state)this.view.load();else this.view.loadNavigationAccounts() } }
  /** Trusted shell identity boundary. RP/fictional profile switches never call it. */
  authenticatedIdentityChanged(owner: string | null): void {
    this.assertActive()
    if (owner === null || (this.realOwner && owner !== this.realOwner)) { this.destroy(false); return }
    this.realOwner = owner; this.refresh()
  }
  destroy(cancel = true): void {
    if (this.destroyed || this.disposing) return
    this.disposing = true
    this.active = undefined
    let failure: unknown
    const clean = (action: () => void) => { try { action() } catch (error) { failure ||= error } }
    try { clean(() => this.view.destroy(cancel)) }
    finally {
      this.destroyed = true; this.disposing = false; this.started = false; this.realOwner = undefined
      clean(this.unsubscribe); this.nativeListeners.clear()
      if (this.invalidAuth && typeof window !== 'undefined') window.removeEventListener('lumiverse:auth-session-invalid', this.invalidAuth)
      this.active = undefined
      for (const surface of this.surfaces) { clean(()=>surface.dismiss()); clean(()=>surface.ownership(false)); clean(()=>surface.disposed()) }
      this.surfaces.clear()
      for (const observer of this.navigationObservers) clean(()=>observer.disposed())
      this.navigationObservers.clear()
    }
    if (failure) throw failure
  }
}
