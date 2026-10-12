import assert from 'node:assert/strict'
import { resolve } from 'node:path'

export async function checkMochiWorkspace(browser, output) {
  for (const width of [320, 390, 900]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, isMobile: width < 900, hasTouch: width < 900 })
    const errors = []; page.on('pageerror', e => errors.push(e.message))
    await page.goto(new URL('file:///' + resolve(output, 'index.html').replaceAll('\\', '/')).href)
    await page.waitForFunction(() => !window.__mochiDemo.view.busy)
    await page.evaluate(async () => {
      const { host, service, createMochiWorkspace, demoPortrait } = window.__mochiDemo
      const one = await service.fictionalAccounts.create('synthetic-user', { displayName: 'Workspace identity one', persona: { source: 'manual', name: 'Stable independent identity' } })
      const two = await service.fictionalAccounts.create('synthetic-user', { displayName: 'Workspace identity two', persona: { source: 'manual', name: 'Other independent identity' } })
      const create = async (accountId, title) => {
        let room = await service.create('synthetic-user', { accountId, title, characterIds: ['character1', 'character2'] })
        return service.update('synthetic-user', { accountId, roomId: room.id, revision: room.revision, title: room.title, characterIds: room.characterIds, settings: { ...room.settings, connectionId: 'test', responseMode: 'instant' } })
      }
      const room = await create(one.id, 'An independent long group room name inside the Pocket shell')
      const other = await create(two.id, 'Another account private room')
      await service.selectAccount('synthetic-user', { accountId: one.id, revision: (await service.fictionalAccounts.bank('synthetic-user')).revision })
      const listeners = new Set(), sent = []
      host.sendToFrontend = p => {
        if (p.state) for (const c of p.state.characters || []) c.avatarUrl = demoPortrait
        for (const listener of listeners) listener(p)
      }
      const root = document.createElement('main'); root.id = 'pocket-workspace-fixture'; root.style.cssText = 'height:100dvh;width:100%;min-width:0;min-height:0;--lp-bg:#17151d;--lp-text:#f7f5ff;--lp-border:#ffffff18;--lp-muted:#a9a3b5;--lp-accent:#a99bff'
      document.body.replaceChildren(root)
      const workspace = createMochiWorkspace({ root,
        notificationPolicy: () => ({ enabled: true, previews: false }),
        transport: {
          onBackendMessage: listener => { listeners.add(listener); return () => listeners.delete(listener) },
          sendToBackend: p => { sent.push(p); void service.handle(p, 'synthetic-user') },
        },
      })
      window.__workspaceFixture = { workspace, root, listeners, sent, room, other, one, two }
      workspace.open()
    })
    await page.getByRole('button', { name: 'New room', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => window.__workspaceFixture.workspace.openRoom(window.__workspaceFixture.other.id)), false)
    assert.equal(await page.evaluate(() => window.__workspaceFixture.workspace.openRoom(window.__workspaceFixture.room.id)), true)
    await page.getByLabel('Message', { exact: true }).waitFor()
    const input = page.getByLabel('Message', { exact: true })
    await input.fill('A retained composer draft'); await input.press('Shift+Enter')
    const draft = await input.inputValue()
    const requests = await page.evaluate(() => window.__workspaceFixture.sent.length)
    await page.evaluate(() => { const w = window.__workspaceFixture.workspace; w.close(); w.open(); w.open(); window.__mochiDemo.host.sendToFrontend({ type: 'lumiphone:state', state: { chatId: 'other_rp', characterId: 'other_phone' } }) })
    assert.equal(await input.inputValue(), draft)
    assert.equal(await page.evaluate(() => window.__workspaceFixture.sent.length), requests)
    await input.fill('Independent ordinary user message'); await input.press('Enter')
    await page.locator('.mochi-message[data-role=assistant]').waitFor()
    await page.waitForFunction(() => !document.querySelector('[aria-label="Message"]').disabled)
    await page.getByLabel('Room options',{exact:true}).click(); await page.getByRole('button',{name:'Participants',exact:true}).click()
    assert.ok((await page.getByRole('dialog').textContent()).includes('Second character'))
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    await page.locator('.mochi-message[data-role=assistant]').getByRole('button', { name: /Actions for/ }).click()
    assert.ok(await page.getByRole('dialog').locator('.mochi-action-panel button').count() >= 3)
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    await page.getByLabel('Room options',{exact:true}).click(); await page.getByRole('button',{name:'Settings',exact:true}).click(); for(const summary of await page.locator('details.mochi-settings-section > summary').all()) if((await summary.locator('..').getAttribute('open'))===null) await summary.click()
    const instructions = page.getByLabel('Room instructions', { exact: true })
    await instructions.fill('Retained unsaved workspace settings')
    await page.evaluate(() => window.__workspaceFixture.workspace.refresh())
    await page.getByRole('button', { name: 'Save settings', exact: true }).waitFor()
    assert.equal(await instructions.inputValue(), 'Retained unsaved workspace settings')
    assert.equal(await instructions.evaluate(n => document.activeElement === n), true, 'Refresh preserves focused settings fields')
    await page.evaluate(() => { const w = window.__workspaceFixture.workspace; w.close(); w.open() })
    assert.equal(await instructions.inputValue(), 'Retained unsaved workspace settings')
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    if (await page.getByRole('dialog', { name: 'Unsaved changes', exact: true }).count()) await page.getByRole('button', { name: 'Discard changes', exact: true }).click()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.ok(await page.locator('.mochi-workspace').evaluate(n => Math.abs(n.getBoundingClientRect().width - innerWidth) < 2), 'Workspace fills the host container, including expanded desktop')
    assert.ok(await page.locator('.mochi-bubble').evaluateAll(nodes => nodes.every(n => n.getBoundingClientRect().width <= innerWidth * .88)), 'Approved bubble width cap remains')
    assert.equal(await page.evaluate(() => window.__workspaceFixture.sent.every(p => !p.phone && !p.chatId && !p.characterId)), true)
    await page.screenshot({ path: resolve(output, 'workspace-' + width + '.png') })
    await page.locator('#pocket-workspace-fixture').evaluate(n => { n.style.setProperty('--lp-bg', '#f7f3fb'); n.style.setProperty('--lp-text', '#21182e'); n.style.setProperty('--lp-border', '#21182e22'); n.style.setProperty('--lp-muted', '#6c6274') })
    await page.screenshot({ path: resolve(output, 'workspace-light-' + width + '.png') })
    await page.getByRole('button', { name: 'Room inbox', exact: true }).click()
    await page.getByRole('button', { name: 'Switch Mochi account', exact: true }).click()
    await page.getByRole('button', { name: 'Use Mochi account Workspace identity two', exact: true }).click()
    await page.getByRole('button', { name: 'New room', exact: true }).waitFor()
    const cards = (await page.locator('.mochi-card-copy').allTextContents()).join('\n')
    assert.ok(cards.includes('Another account private room'))
    assert.ok(!cards.includes('An independent long group room'))
    assert.equal(await page.evaluate(() => window.__workspaceFixture.workspace.openRoom(window.__workspaceFixture.room.id)), false)
    await page.evaluate(() => { const f = window.__workspaceFixture; f.workspace.destroy(); f.workspace.destroy(); if (f.listeners.size) throw Error('Workspace listener leaked') })
    assert.equal(await page.locator('.mochi-workspace').count(), 0)
    assert.deepEqual(errors, []); await page.close()
  }
  console.log('Mochi independent workspace Chromium checks passed at 320px, 390px and expanded 900px.')
}
