import {test,expect} from 'bun:test'
import {JSDOM,VirtualConsole} from 'jsdom'
import {MochiProfiles} from '../src/mochi/profile-screen.js'
import tokens from '../src/mochi/ui/mochi-tokens.css' with {type:'text'}

function fixture(){
 const dom=new JSDOM('<body></body>',{virtualConsole:new VirtualConsole()}),previous={document:globalThis.document,window:globalThis.window}
 Object.assign(globalThis,{document:dom.window.document,window:dom.window})
 const profiles=new MochiProfiles(),sent:any[]=[],content='Complete add-on text. '.repeat(400)
 const persona:any={source:'lumiverse',sourceId:'native',name:'Synthetic',description:'Saved description',avatarUrl:''}
 const account:any={id:'account_'+'a'.repeat(32),revision:4,displayName:'Saved name',username:'saved_name',persona,avatarUrl:'',personaLink:{source:'lumiverse',sourceId:'native'},personaAddons:{personaId:'native',enabledIds:[]}}
 profiles.state={version:1,ownerId:'owner',revision:5,selectedAccountId:account.id,accounts:[{...account,roomIds:[]}],personas:[{...persona,addons:[{id:'local',label:'Local guide',content,enabled:false,available:true,sortOrder:0},{id:'global',label:'Global guide',content:'Global content',enabled:false,available:true,sortOrder:0,global:true},{id:'missing',label:'Unavailable',content:'',enabled:false,available:false,sortOrder:0}]}],avatars:[],canUploadAvatar:false,warnings:[]}
 profiles.start(account)
 const render=()=>document.body.replaceChildren(profiles.render(false,(type,input)=>sent.push({type,...input}),render,()=>{}))
 render()
 return {profiles,sent,dom,content,cleanup:()=>{dom.window.close();Object.assign(globalThis,previous)}}
}
test('Mochi structural aliases inherit native roles with independently editable brand accent',()=>{
 expect(tokens).toContain('--mochi-drawer-bg: var(--lumiverse-bg-deep,')
 expect(tokens).toContain('--mochi-input-bg: var(--lumiverse-bg,')
 expect(tokens).toContain('--mochi-on-accent: var(--mochi-brand-contrast,')
 expect(tokens).toContain('--mochi-accent:var(--mochi-brand-accent)')
 expect(tokens).not.toContain('35%,#b7a0e8')
})
test('compact add-on rows group native/global definitions and keep full text collapsed without changing persistence',()=>{
 const f=fixture()
 try{
  expect(Array.from(document.querySelectorAll('.mochi-addon-group h4')).map(n=>n.textContent)).toEqual(['Persona Add-Ons','Global Add-Ons'])
  const details=document.querySelector<HTMLDetailsElement>('.mochi-addon-details')!
  expect(details.open).toBe(false);expect(details.querySelector('pre')!.textContent).toBe(f.content)
  details.open=true;expect(details.querySelector('pre')!.textContent!.length).toBe(f.content.length)
  const check=document.querySelector<HTMLInputElement>('[aria-label="Enable add-on Local guide"]')!;check.click()
  expect(check.closest<HTMLElement>('.mochi-addon-row')!.dataset.selected).toBe('true')
  expect(document.querySelector<HTMLInputElement>('[aria-label="Enable add-on Unavailable"]')!.disabled).toBe(true)
  document.querySelector('form')!.dispatchEvent(new f.dom.window.Event('submit',{cancelable:true}))
  expect(f.sent.at(-1).personaAddons).toEqual({personaId:'native',enabledIds:['local']})
  expect(f.sent.at(-1).revision).toBe(4);expect(f.sent.at(-1).identityDescription).toBe('Saved description')
 }finally{f.cleanup()}
})
test('compact source rows distinguish import selection from explicit linking',()=>{
 const f=fixture()
 try{
  const chooser=document.querySelector<HTMLDetailsElement>('.mochi-persona-import')!;expect(chooser.open).toBe(false);chooser.open=true
  document.querySelector<HTMLButtonElement>('[aria-label="Import persona Synthetic"]')!.click()
  expect(f.profiles.draft!.persona).toBe('lumiverse:native');expect(f.profiles.draft!.linked).toBe(false)
  expect(document.querySelector('[aria-label="Import persona Synthetic"]')!.getAttribute('aria-pressed')).toBe('true')
  expect(document.querySelector('.mochi-persona-choice .mochi-sidebar-avatar')!==null).toBe(true)
  document.querySelector<HTMLInputElement>('[aria-label="Link Lumiverse persona"]')!.click()
  expect(f.profiles.draft!.linked).toBe(true)
 }finally{f.cleanup()}
})
