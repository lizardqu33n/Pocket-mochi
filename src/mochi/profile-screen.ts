import { button, el } from '../frontend/shared.js'
import type { MochiAccount, MochiAccountBank } from './accounts.js'
import type { MochiPersona } from './types.js'

export interface AccountScreenState extends MochiAccountBank {
  accounts: Array<MochiAccount & {roomIds: string[]}>
  personas: MochiPersona[]
  avatars: Array<{id: string; name: string; url: string}>
  canUploadAvatar: boolean
  warnings: string[]
  phone?: {supported: boolean; preference: 'last-used'|'picker'; lastAccountId: string}
}
export class MochiProfiles {
  private baseline = ''
  hasUnsavedChanges(): boolean { return !!this.draft && JSON.stringify(this.draft) !== this.baseline }
  private confirmation?: {kind:'archive'|'restore';account:MochiAccount}
  state: AccountScreenState | null = null
  draft: { id: string; revision: number; displayName: string; username: string; persona: string; description: string; avatarId: string } | null = null
  start(account?: MochiAccount): void {
    this.confirmation=undefined
    this.draft = { id: account?.id || '', revision: account?.revision || 0, displayName: account?.displayName || '', username: account?.username || '', persona: account ? 'keep' : 'manual', description: account?.persona.description||'', avatarId: account ? account.avatarUrl.split('/api/v1/images/')[1] || '' : 'persona' }
    this.baseline = JSON.stringify(this.draft)
  }
  render(busy: boolean, send: (type: string, input?: Record<string,unknown>) => void, redraw: () => void, exit: () => void, confirmDiscard: (next: () => void, anchor: HTMLElement) => void = next => next(), refreshSources: () => void = () => send('mochi:choices')): HTMLElement {
    const form = el('form', 'mochi-form mochi-profile-screen')
    if (!this.state) { form.append(el('p','','Loading profiles…')); return form }
    if(this.confirmation){const {kind,account}=this.confirmation;form.append(el('h3','',kind==='archive'?'Archive profile?':'Restore profile?'),el('p','mochi-muted',kind==='archive'?`Archive ${account.displayName} and preserve every chat and schedule? Autonomous work will stop while archived.`:`Restore ${account.displayName}? Preserved schedules may resume subject to their expiry and limits.`));const confirm=button(kind==='archive'?'Confirm archive and preserve chats':'Confirm restore profile','lp-button mochi-primary');confirm.disabled=busy;confirm.onclick=()=>{send('mochi:account_'+kind,{accountId:account.id,revision:account.revision,confirmed:true,...(kind==='archive'?{roomPolicy:'preserve'}:{})});this.confirmation=undefined};const cancel=button('Cancel','lp-button');cancel.disabled=busy;cancel.onclick=()=>{this.confirmation=undefined;redraw()};form.append(confirm,cancel);return form}
    if (!this.draft) {
      form.append(el('h3','','Mochi profiles'),el('p','mochi-muted','Fictional identities owned by your Lumiverse account.'))
      const create=button('New profile','lp-button mochi-primary');create.disabled=busy;create.onclick=()=>{this.start();refreshSources();redraw()};form.append(create)
      for(const account of this.state.accounts.filter(a=>!a.archived)) {
        const edit=button('','mochi-card');edit.disabled=busy
        const avatar=el('span','mochi-avatar',account.displayName.slice(0,1));if(account.avatarUrl){const img=el('img');img.src=account.avatarUrl;img.alt='';avatar.replaceChildren(img)}
        const copy=el('span','mochi-card-copy');copy.append(el('strong','',account.displayName),el('small','mochi-muted',account.username?'@'+account.username:'No username'));edit.append(avatar,copy);edit.setAttribute('aria-label','Edit profile '+account.displayName);edit.onclick=()=>{this.start(account);refreshSources();redraw()};form.append(edit)
      }
      for(const account of this.state.accounts.filter(a=>a.archived)){const restore=button('Restore '+account.displayName,'lp-button');restore.disabled=busy;restore.onclick=()=>{this.confirmation={kind:'restore',account};redraw()};form.append(restore)}
      const back=button('Back','lp-button');back.onclick=exit;form.append(back);return form
    }
    const draft=this.draft
    form.append(el('h3','',draft.id?'Edit Mochi profile':'New Mochi profile'),el('p','mochi-muted','This fictional profile · Save applies persona, name and avatar edits. Your Lumiverse login is unchanged.'))
    const saved=this.state.accounts.find(a=>a.id===draft.id),chosen=this.state.personas.find(p=>p.source+':'+p.sourceId===draft.persona)
    const url=draft.avatarId==='persona'?(chosen?.avatarUrl||saved?.persona.avatarUrl||''):draft.avatarId?'/api/v1/images/'+draft.avatarId:''
    const preview=el('section','mochi-profile-preview'); preview.setAttribute('aria-label','Profile preview')
    const banner=el('div','mochi-profile-banner'); banner.setAttribute('aria-hidden','true')
    const portrait=el('span','mochi-avatar mochi-profile-portrait',draft.displayName.slice(0,1)||'?'); portrait.setAttribute('aria-hidden','true')
    if(url){const img=el('img');img.src=url;img.alt='';portrait.replaceChildren(img)}
    const previewName=el('strong','mochi-profile-preview-name',draft.displayName||'Your display name')
    const previewUsername=el('span','mochi-muted',draft.username?'@'+draft.username.replace(/^@/,''):'@username')
    const previewBody=el('div','mochi-profile-preview-body');previewBody.append(portrait,previewName,previewUsername)
    preview.append(banner,previewBody);form.append(preview)
    const identity=el('fieldset','mochi-profile-fields');identity.append(el('legend','','Identity'));form.append(identity)
    let fields:HTMLElement=identity
    const field=(label:string,node:HTMLElement)=>{node.setAttribute('aria-label',label);const wrap=el('label','',label);wrap.append(node);fields.append(wrap)}
    const name=el('input');name.maxLength=120;name.required=true;name.value=draft.displayName;name.oninput=()=>{draft.displayName=name.value;previewName.textContent=name.value||'Your display name';if(!url)portrait.textContent=name.value.slice(0,1)||'?'};field('Profile display name',name)
    const username=el('input');username.maxLength=33;username.value=draft.username;username.placeholder='@username (optional)';username.oninput=()=>{draft.username=username.value;previewUsername.textContent=username.value?'@'+username.value.replace(/^@/,''):'@username'};field('Profile username',username)
    const persona=el('select');const option=(value:string,label:string)=>{const o=el('option','',label);o.value=value;persona.append(o)}
    if(draft.id)option('keep','Keep saved persona snapshot')
    option('manual','Custom fictional identity');for(const p of this.state.personas)option(p.source+':'+p.sourceId,p.name+' · '+p.source)
    persona.value=draft.persona;persona.onchange=()=>{draft.persona=persona.value;const p=this.state!.personas.find(p=>p.source+':'+p.sourceId===persona.value);if(p&&!draft.displayName)draft.displayName=p.name;redraw()};field('Profile persona',persona)
    const refresh=button('Refresh personas','lp-button mochi-secondary-action');refresh.onclick=refreshSources;identity.append(refresh)
    if(draft.persona==='manual'){const description=el('textarea');description.maxLength=12000;description.rows=3;description.value=draft.description;description.oninput=()=>{draft.description=description.value};field('Profile identity description',description)}
    const appearance=el('fieldset','mochi-profile-fields');appearance.append(el('legend','','Appearance'));form.append(appearance);fields=appearance
    const avatar=el('select');for(const [value,label] of [['persona','Use selected persona portrait'],['','No portrait'],...this.state.avatars.map(a=>[a.id,a.name])]){const o=el('option','',label);o.value=value;avatar.append(o)}
    if(draft.avatarId&&!['persona',...this.state.avatars.map(a=>a.id)].includes(draft.avatarId)){const o=el('option','','Keep saved portrait');o.value=draft.avatarId;avatar.append(o)}
    avatar.value=draft.avatarId;avatar.onchange=()=>{draft.avatarId=avatar.value;redraw()};field('Profile portrait',avatar)

    if(this.state.canUploadAvatar){const upload=el('input');upload.type='file';upload.accept='image/png,image/jpeg,image/webp';upload.disabled=busy;upload.onchange=()=>{const file=upload.files?.[0];if(!file)return;if(file.size>2097152){upload.setCustomValidity('Choose a portrait up to 2 MB.');upload.reportValidity();return}const reader=new FileReader();reader.onload=()=>{if(this.draft===draft&&form.isConnected)send('mochi:account_avatar_upload',{dataUrl:reader.result})};reader.readAsDataURL(file)};field('Upload profile portrait',upload)}
    form.append(el('p','mochi-muted','Profile changes apply to new chats. Existing chats keep their saved identity and authorship.'))
    if(saved){const archive=button('Archive profile','lp-button mochi-secondary-action');archive.disabled=busy;archive.onclick=()=>{this.confirmation={kind:'archive',account:saved};redraw()};form.append(archive)}
    const save=button(busy?'Saving…':'Save profile','lp-button mochi-primary');save.type='submit';save.disabled=busy
    const cancel=button('Cancel profile changes','lp-button');cancel.disabled=busy;cancel.onclick=()=>confirmDiscard(()=>{this.draft=null;redraw()},cancel);const actions=el('div','mochi-profile-actions');actions.append(save,cancel);form.append(actions)
    form.onsubmit=e=>{e.preventDefault();const p=draft.persona==='keep'?undefined:draft.persona==='manual'?{source:'manual',name:draft.displayName,description:draft.description}:this.state!.personas.find(p=>p.source+':'+p.sourceId===draft.persona);const unchangedPortrait=!p&&saved&&draft.avatarId===(saved.avatarUrl.split('/api/v1/images/')[1]||'');send(draft.id?'mochi:account_update':'mochi:account_create',{accountId:draft.id||undefined,revision:draft.revision,displayName:draft.displayName,username:draft.username,persona:p,...(unchangedPortrait?{}:draft.avatarId==='persona'?(p?{}:{avatarId:saved?.persona.avatarUrl.split('/api/v1/images/')[1]||''}):{avatarId:draft.avatarId})})}
    return form
  }
}
