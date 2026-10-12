import assert from 'node:assert/strict'
import { resolve } from 'node:path'

// Production views/service/scheduler; synthetic in-memory host and clock only.
export async function checkMochiScheduling(browser, output) {
  for (const width of [320, 390, 900]) for (const fictional of [false, true]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, isMobile: width < 900, hasTouch: width < 900 })
    const errors = []; page.on('pageerror', error => errors.push(error.message))
    await page.goto(new URL('file:///' + resolve(output, 'index.html').replaceAll('\\', '/')).href)
    await page.waitForFunction(() => !window.__mochiDemo.view.busy)
    await page.evaluate(async fictional => {
      const { service, scheduler, view } = window.__mochiDemo
      window.__scheduleClock = Date.now(); service.now = scheduler.now = () => window.__scheduleClock
      const accountId = fictional ? (await service.fictionalAccounts.create('synthetic-user', { persona: { source: 'manual', name: 'Synthetic scheduling identity' } })).id : undefined
      let room = await service.create('synthetic-user', { accountId, title: 'Scheduled room to preserve', characterIds: ['character1'], persona: { source: 'manual', name: 'Stable scheduling identity' } })
      room = await service.update('synthetic-user', { accountId, roomId: room.id, revision: room.revision, title: room.title, characterIds: room.characterIds, settings: { ...room.settings, connectionId: 'test', responseMode: 'instant' } })
      await scheduler.configure('synthetic-user', true)
      await service.configureScheduledRoom('synthetic-user', { accountId, roomId: room.id, revision: room.revision, enabled: true })
      view.state = await service.state('synthetic-user', accountId); view.openRoom(room.id)
      window.__scheduleRoom = room.id; window.__scheduleAccount = accountId
    }, fictional)
    const settled = () => page.waitForFunction(() => !window.__mochiDemo.view.busy)
    await settled(); await page.getByLabel('Room options',{exact:true}).click(); await page.getByRole('button',{name:'Settings',exact:true}).click(); for(const summary of await page.locator('details.mochi-settings-section > summary').all()) if((await summary.locator('..').getAttribute('open'))===null) await summary.click()
    const due = await page.evaluate(() => { const d = new Date(window.__scheduleClock + 120000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) })
    await page.getByLabel('Scheduled message time', { exact: true }).fill(due)
    await page.getByRole('button', { name: 'Schedule character message', exact: true }).click(); await settled()
    const before = await page.evaluate(async () => JSON.stringify(await window.__mochiDemo.service.read('synthetic-user', window.__scheduleRoom, window.__scheduleAccount)))
    await page.getByRole('button', { name: 'Save settings', exact: true }).click(); await settled()
    assert.equal(await page.evaluate(async () => JSON.stringify(await window.__mochiDemo.service.read('synthetic-user', window.__scheduleRoom, window.__scheduleAccount))), before, 'Unchanged Save preserves every room field')
    await page.getByLabel('Room options',{exact:true}).click(); await page.getByRole('button',{name:'Settings',exact:true}).click(); for(const summary of await page.locator('details.mochi-settings-section > summary').all()) if((await summary.locator('..').getAttribute('open'))===null) await summary.click()
    await page.locator('[data-status="queued"]').waitFor()
    const instructions = page.getByLabel('Room instructions', { exact: true })
    await instructions.fill('Unsaved draft remains focused'); await instructions.focus()
    await page.evaluate(async () => {
      const { service, scheduler } = window.__mochiDemo
      const room = await service.read('synthetic-user', window.__scheduleRoom, window.__scheduleAccount)
      await service.cancelScheduled('synthetic-user', room.id, room.runtime.jobs[0].id, window.__scheduleAccount)
      window.__scheduleClock += 120000; await scheduler.tick()
    })
    await page.locator('[data-status="cancelled"]').waitFor()
    assert.equal(await instructions.inputValue(), 'Unsaved draft remains focused')
    assert.equal(await instructions.evaluate(node => document.activeElement === node), true, 'Runtime updates preserve focused form nodes')
    assert.equal(await page.getByRole('button', { name: 'Cancel scheduled message', exact: true }).count(), 0)
    const scheduleText = await page.getByLabel('Scheduled opportunities', { exact: true }).textContent()
    assert.ok(scheduleText.includes('Canceled') && scheduleText.includes('Due') && scheduleText.includes('Expires'))
    await page.evaluate(async () => {
      const { service, scheduler, host } = window.__mochiDemo
      const room = await service.read('synthetic-user', window.__scheduleRoom, window.__scheduleAccount)
      const schedule = id => scheduler.handle({ type: 'mochi:schedule', accountId: window.__scheduleAccount, roomId: room.id, revision: room.revision, occurrenceId: id, dueAt: window.__scheduleClock }, 'synthetic-user')
      host.generate.quiet = async () => { throw Error('Invalid synthetic configuration') }
      await schedule('paused_opportunity'); await scheduler.tick()
      await service.cancelScheduled('synthetic-user', room.id, 'paused_opportunity', window.__scheduleAccount)
      host.generate.quiet = async () => { throw Error('503 temporarily unavailable') }
      await schedule('failed_opportunity'); await scheduler.tick()
      window.__scheduleClock += 60000; await scheduler.tick()
      window.__scheduleClock += 120000; await scheduler.tick()
      await schedule('expired_opportunity')
      window.__scheduleClock += 3600001; await scheduler.tick()
    })
    await page.locator('[data-status="failed"]').waitFor(); await page.locator('[data-status="missed"]').waitFor()
    assert.equal(await instructions.inputValue(), 'Unsaved draft remains focused')
    assert.ok((await page.getByLabel('Scheduled opportunities', { exact: true }).textContent()).includes('Expired'))
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Schedule history fits ' + width + 'px')
    await page.screenshot({ path: resolve(output, `scheduling-history-${fictional ? 'fictional' : 'legacy'}-${width}.png`) })
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    if (await page.getByRole('dialog', { name: 'Unsaved changes', exact: true }).count()) await page.getByRole('button', { name: 'Discard changes', exact: true }).click()
    await page.getByLabel('Room options',{exact:true}).click(); await page.getByRole('button',{name:'Settings',exact:true}).click(); for(const summary of await page.locator('details.mochi-settings-section > summary').all()) if((await summary.locator('..').getAttribute('open'))===null) await summary.click()
    assert.equal(await instructions.inputValue(), '', 'Cancel discards unsaved settings')
    assert.equal(await page.locator('[data-status="failed"]').count(), 1)
    assert.equal(await page.locator('[data-status="missed"]').count(), 1)
    assert.equal(await page.evaluate(async () => (await window.__mochiDemo.service.read('synthetic-user', window.__scheduleRoom, window.__scheduleAccount)).messages.length), 0)
    assert.deepEqual(errors, []); await page.close()
  }
  console.log('Mochi scheduling Chromium checks passed for legacy/fictional rooms at 320px, 390px and 900px.')
}
