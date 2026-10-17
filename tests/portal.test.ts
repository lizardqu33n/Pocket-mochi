import { expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { PocketPortal } from '../src/frontend/components/portal.js'

test('portal explains the destinations and keeps account startup lazy across host refreshes', () => {
  const dom = new JSDOM('<body></body>'), prior = globalThis.document
  globalThis.document = dom.window.document
  let starts = 0
  try {
    const phones = () => { const p = document.createElement('p'); p.textContent = 'Phone choices'; return p }
    const choices = () => { const p = document.createElement('p'); p.textContent = 'Profile choices'; return p }
    const portal = new PocketPortal(phones, choices, () => { starts++ })
    document.body.append(portal.root)
    const find = (label: string) => portal.root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!
    expect(starts).toBe(0)
    expect(portal.root.querySelector('input[type=search]')).toBeNull()
    expect(portal.root.querySelector('.pocket-portal-info')?.textContent).toBe('Pocket uses the active RP. Mochi keeps separate chat histories.')
    expect(portal.root.querySelectorAll('.pocket-portal-destination').length).toBe(2)
    find('Open Mochi').click()
    expect(starts).toBe(1)
    const content = portal.root.querySelector('.pocket-portal-body')
    portal.refresh() // Ordinary RP state updates must not remount the identity form.
    expect(portal.root.querySelector('.pocket-portal-body')).toBe(content)
    expect(portal.root.textContent).toContain('Profile choices')
    portal.root.querySelector<HTMLButtonElement>('.pocket-portal-home')!.click()
    find('Connect to your phone').click()
    expect(portal.root.textContent).toContain('Phone choices')
    expect(starts).toBe(1)
    expect(portal.root.querySelectorAll('svg[aria-hidden=false]').length).toBe(0)
  } finally { dom.window.close(); globalThis.document = prior }
})

test('Mochi refresh retains the sidebar form cursor and does not move focus from the phone', () => {
  const dom = new JSDOM('<body><textarea aria-label="Phone composer"></textarea></body>'), prior = globalThis.document
  globalThis.document = dom.window.document
  try {
    const choices = () => { const input = document.createElement('textarea'); input.setAttribute('aria-label', 'Identity'); input.value = 'retained draft'; return input }
    const portal = new PocketPortal(choices, choices, () => {})
    document.body.append(portal.root); portal.show('mochi')
    const input = portal.root.querySelector<HTMLTextAreaElement>('[aria-label=Identity]')!
    input.focus(); input.setSelectionRange(3, 7); portal.refresh(true)
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Identity')
    expect((document.activeElement as HTMLTextAreaElement).selectionStart).toBe(3)
    const composer = document.querySelector<HTMLTextAreaElement>('[aria-label="Phone composer"]')!
    composer.focus(); portal.refresh(true)
    expect(document.activeElement).toBe(composer)
  } finally { dom.window.close(); globalThis.document = prior }
})


test('Mochi profile navigation protects changes and separates back from portal exit', async () => {
  const { MochiView } = await import('../src/mochi/view.js')
  const dom = new JSDOM('<body><button id="back">Back</button><main></main></body>'), prior = globalThis.document
  globalThis.document = dom.window.document
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true }
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new dom.window.Event('close')) }
  const sent: any[] = []; let exits = 0
  let view: InstanceType<typeof MochiView>
  const root = document.querySelector('main')!
  const redraw = () => root.replaceChildren(view.render('choices'))
  view = new MochiView(payload => sent.push(payload), redraw, () => {})
  const click = (name: string) => { const node = [...document.querySelectorAll<HTMLButtonElement>('button')].find(n => n.getAttribute('aria-label') === name || n.textContent === name); expect(node).toBeDefined(); node!.click() }
  try {
    view.open()
    view.receive({type:'mochi:accounts',requestId:sent.at(-1).requestId,state:{version:1,ownerId:'test',revision:0,selectedAccountId:'',accounts:[],personas:[],avatars:[],canUploadAvatar:false,warnings:[],phone:{supported:false,preference:'picker',lastAccountId:''}}})
    click('Create Mochi account')
    expect(view.hasUnsavedChanges()).toBe(false)
    const name = document.querySelector<HTMLInputElement>('[aria-label="Profile display name"]')!
    name.value = 'Unsaved identity'; name.dispatchEvent(new dom.window.Event('input'))
    expect(document.querySelector('.mochi-profile-preview-name')!.textContent).toBe('Unsaved identity')
    expect(document.querySelectorAll('fieldset').length).toBe(2)
    expect(view.hasUnsavedChanges()).toBe(true)
    const anchor = document.getElementById('back')!
    view.back(() => exits++,anchor)
    expect(document.querySelector('dialog[aria-label="Unsaved changes"]')).not.toBeNull()
    click('Keep editing')
    expect(name.value).toBe('Unsaved identity');expect(exits).toBe(0)
    view.back(() => exits++,anchor);click('Discard changes')
    expect(view.hasUnsavedChanges()).toBe(false)
    expect(root.textContent).toContain('Mochi profiles');expect(exits).toBe(0)
    view.back(() => exits++,anchor)
    expect(root.textContent).toContain('Choose your Mochi account')
    view.back(() => exits++,anchor);expect(exits).toBe(1)
    click('Create Mochi account')
    const username=document.querySelector<HTMLInputElement>('[aria-label="Profile username"]')!
    username.value='draft_user';username.dispatchEvent(new dom.window.Event('input'))
    view.exitPortal(()=>exits++,anchor);expect(exits).toBe(1)
    click('Discard changes');expect(exits).toBe(2);expect(view.hasUnsavedChanges()).toBe(false)
  } finally { view.destroy();dom.window.close();globalThis.document = prior }
})

test('Mochi exposes room connections and protects edited room settings', async () => {
  const { MochiView } = await import('../src/mochi/view.js')
  const { defaultMochiSettings } = await import('../src/mochi/types.js')
  const dom = new JSDOM('<body><button id="back">Back</button><main></main></body>'), prior=globalThis.document
  globalThis.document=dom.window.document
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
  dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'))}
  const root=document.querySelector('main')!;let surface:'chat'|'choices'='chat'
  const sent:any[]=[]
  const view=new MochiView(payload=>sent.push(payload),()=>render(),()=>{})
  const render=()=>root.replaceChildren(view.render(surface,()=>{surface='choices'}))
  try {
    const room:any={id:'room',title:'Test room',revision:1,characterIds:['char'],persona:{name:'Me',source:'manual',description:''},messages:[],settings:{...defaultMochiSettings(),connectionId:'custom'}}
    view.state={rooms:[room],characters:[{id:'char',name:'Character'}],personas:[],warnings:[],connections:[{id:'custom',name:'Dedicated connection',model:'Test model'}]}
    view.select('room');render()
    expect(root.textContent).not.toContain('Dedicated connection')
    const menu=root.querySelector<HTMLDetailsElement>('.lp-conversation-menu')!
    expect(menu.querySelector('summary')!.getAttribute('aria-label')).toBe('Room options')
    expect([...menu.querySelectorAll('button')].map(n=>n.textContent)).toEqual(['Participants','Settings','Pins & Notes','Conversation Memory','Presets','Search conversation','Personal Settings','Mochi notifications','Preview AI prompt'])
    menu.open=true
    menu.querySelector<HTMLButtonElement>('button')!.click()
    const participants=document.querySelector<HTMLDialogElement>('dialog[aria-label="Room participants"]')!
    expect(participants.open).toBe(true)
    expect(participants.closest('details')).toBeNull()
    participants.querySelector<HTMLButtonElement>('.lp-sheet-close')!.click()
    menu.open=true
    // Messaging tools follow Settings; locate its action rather than its old index.
    Array.from(menu.querySelectorAll<HTMLButtonElement>('button')).find(button=>button.textContent==='Settings')!.click()
    expect(menu.open).toBe(false)
    expect(root.querySelector('[aria-label="General settings"]')).not.toBeNull()
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Advanced')!.click()
    expect(root.querySelector('[aria-label="Advanced settings"]')).not.toBeNull()
    expect(root.querySelector<HTMLSelectElement>('[aria-label="Generation connection"]')!.value).toBe('custom')
    expect(view.hasUnsavedChanges()).toBe(false)
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='General')!.click()
    const title=root.querySelector<HTMLInputElement>('[aria-label="Room name"]')!;title.value='Changed';title.dispatchEvent(new dom.window.Event('input'))
    expect(view.hasUnsavedChanges()).toBe(true)
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Advanced')!.click()
    const refresh=root.querySelector<HTMLButtonElement>('.mochi-secondary-action')!;refresh.click()
    const request=sent.at(-1)
    expect(request.type).toBe('mochi:choices')
    view.receive({type:'mochi:choices',requestId:request.requestId,personas:[{source:'lumiverse',sourceId:'new',name:'New persona'}],characters:[{id:'char',name:'Character'}],connections:[{id:'custom',name:'Renamed connection',model:'Changed model'},{id:'new',name:'New connection',model:'Other model'}]})
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='General')!.click()
    expect(root.querySelector<HTMLInputElement>('[aria-label="Room name"]')!.value).toBe('Changed')
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent==='Advanced')!.click()
    expect(root.querySelector<HTMLSelectElement>('[aria-label="Generation connection"]')!.value).toBe('custom')
    expect(root.textContent).toContain('Renamed connection')
    expect(root.textContent).toContain('New connection')
    expect(view.hasUnsavedChanges()).toBe(true)
    view.back(()=>{},document.getElementById('back')!)
    expect(document.querySelector('dialog[aria-label="Unsaved changes"]')).not.toBeNull()
    ;[...document.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.getAttribute('aria-label')==='Keep editing')!.click()
    expect(title.value).toBe('Changed')
  } finally { view.destroy();dom.window.close();globalThis.document=prior }
})


test('Mochi model picker refreshes provider metadata and preserves the selected override on failure', async () => {
  const { mochiModelPicker }=await import('../src/mochi/models.js')
  const dom=new JSDOM('<body></body>'),prior=globalThis.document,priorFetch=globalThis.fetch
  globalThis.document=dom.window.document
  let rows=['first-model'],fail=false,selected='';const requests:any[]=[]
  globalThis.fetch=(async(url:any,options:any)=>{requests.push({url,options});return new Response(JSON.stringify(fail?{error:'failure'}:{models:rows,model_labels:{'first-model':'First model'}}),{status:fail?502:200})}) as typeof fetch
  const controllers=new Set<AbortController>()
  try {
    const root=mochiModelPicker('owned-connection','default-model','saved-model',value=>selected=value,new Map(),controllers)
    document.body.append(root);await new Promise(resolve=>setTimeout(resolve,0))
    const select=root.querySelector('select')!,refresh=root.querySelector('button')!
    expect(select.value).toBe('saved-model')
    expect(root.textContent).toContain('Connection default · default-model')
    expect(root.textContent).toContain('First model')
    expect(requests[0].url).toBe('/api/v1/connections/owned-connection/models')
    expect(requests[0].options.credentials).toBe('same-origin')
    select.value='first-model';select.dispatchEvent(new dom.window.Event('change'));expect(selected).toBe('first-model')
    rows=['second-model'];refresh.click();await new Promise(resolve=>setTimeout(resolve,0))
    expect(root.textContent).toContain('second-model');expect(select.value).toBe('first-model')
    fail=true;refresh.click();await new Promise(resolve=>setTimeout(resolve,0))
    expect(select.value).toBe('first-model');expect(root.textContent).toContain('Could not load models')
    expect(controllers.size).toBe(0)
  } finally { for(const controller of controllers)controller.abort();globalThis.fetch=priorFetch;globalThis.document=prior;dom.window.close() }
})
