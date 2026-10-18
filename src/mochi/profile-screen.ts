import { button, el } from '../frontend/shared.js'
import type { PersonaSyncReview, MochiAccount, MochiAccountBank } from './accounts.js'
import type { MochiPersona } from './types.js'

export interface AccountScreenState extends MochiAccountBank {
  accounts: Array<MochiAccount & {roomIds: string[]}>
  personas: MochiPersona[]
  avatars: Array<{id: string; name: string; url: string}>
  canUploadAvatar: boolean
  legacyRoomCount?:number
  warnings: string[]
  phone?: {supported: boolean; preference: 'last-used'|'picker'; lastAccountId: string}
}
export class MochiProfiles {
  private baseline = ''
  private personaQuery=''
  private sync?:PersonaSyncReview
  private syncFields=new Set<string>()
  private syncAddons=new Map<string,boolean>()
  get syncOpen():boolean{return !!this.sync}
  backSync():void{this.sync=undefined;this.syncFields.clear();this.syncAddons.clear()}
  acceptSync(review:PersonaSyncReview):void {this.sync=review;this.syncFields.clear();this.syncAddons.clear()}
  hasUnsavedChanges(): boolean { return !!this.draft && (JSON.stringify(this.draft) !== this.baseline || this.syncFields.size>0 || this.syncAddons.size>0) }
  private confirmation?: {kind:'archive'|'restore';account:MochiAccount}
  state: AccountScreenState | null = null
  draft: { id: string; revision: number; displayName: string; username: string; persona: string; description: string; avatarId: string; addonIds:string[]; linked:boolean } | null = null
  start(account?: MochiAccount): void {
    this.confirmation=undefined;this.backSync();this.personaQuery=''
    this.draft = { id: account?.id || '', revision: account?.revision || 0, displayName: account?.displayName || '', username: account?.username || '', persona: account ? 'keep' : 'manual', description: account?.persona.description||'', avatarId: account ? account.avatarUrl.split('/api/v1/images/')[1] || '' : 'persona', addonIds:[...(account?.personaAddons?.enabledIds||[])],linked:!!account?.personaLink }
    this.baseline = JSON.stringify(this.draft)
  }
  render(busy: boolean, send: (type: string, input?: Record<string,unknown>) => void, redraw: () => void, exit: () => void, confirmDiscard: (next: () => void, anchor: HTMLElement) => void = next => next(), refreshSources: () => void = () => send('mochi:choices')): HTMLElement {
    const form = el('form', 'mochi-form mochi-profile-screen')
    if (!this.state) { form.append(el('p','','Loading profiles…')); return form }
    if(this.confirmation){const {kind,account}=this.confirmation;form.append(el('h3','',kind==='archive'?'Archive profile?':'Restore profile?'),el('p','mochi-muted',kind==='archive'?`Archive ${account.displayName} and preserve every chat and schedule? Autonomous work will stop while archived.`:`Restore ${account.displayName}? Preserved schedules may resume subject to their expiry and limits.`));const confirm=button(kind==='archive'?'Confirm archive and preserve chats':'Confirm restore profile','lp-button '+(kind==='archive'?'mochi-danger-action':'mochi-primary'));confirm.disabled=busy;confirm.onclick=()=>{send('mochi:account_'+kind,{accountId:account.id,revision:account.revision,confirmed:true,...(kind==='archive'?{roomPolicy:'preserve'}:{})});this.confirmation=undefined};const cancel=button('Cancel','lp-button');cancel.disabled=busy;cancel.onclick=()=>{this.confirmation=undefined;redraw()};form.append(confirm,cancel);return form}
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
    if(this.sync)return this.renderSync(busy,send,redraw,confirmDiscard)
    form.append(el('h3','',draft.id?'Edit Account':'Create Account'),el('p','mochi-muted','Fictional account · Changes apply on Save.'))
    const back=button('Back to Accounts','lp-button');back.onclick=()=>confirmDiscard(exit,back);form.prepend(back);form.querySelector('h3')!.tabIndex=-1
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
    const field=(label:string,node:HTMLElement)=>{node.setAttribute('aria-label',label);const wrap=el('label','',label);wrap.hidden=node.hidden;wrap.append(node);fields.append(wrap)}
    const name=el('input');name.maxLength=120;name.required=true;name.value=draft.displayName;name.oninput=()=>{draft.displayName=name.value;previewName.textContent=name.value||'Your display name';if(!url)portrait.textContent=name.value.slice(0,1)||'?'};field('Profile display name',name)
    const username=el('input');username.maxLength=33;username.value=draft.username;username.placeholder='@username (optional)';username.oninput=()=>{draft.username=username.value;previewUsername.textContent=username.value?'@'+username.value.replace(/^@/,''):'@username'};field('Profile username',username)
    const persona=el('select');const option=(value:string,label:string)=>{const o=el('option','',label);o.value=value;persona.append(o)}
    if(draft.id)option('keep','Keep saved persona snapshot')
    option('manual','Custom fictional identity');for(const p of this.state.personas)option(p.source+':'+p.sourceId,p.name+' · '+p.source)
    const ai=el('fieldset','mochi-profile-fields');ai.append(el('legend','','AI identity'),el('p','mochi-muted','AI context only · Not your public bio.'));form.append(ai);fields=ai
    persona.value=draft.persona;persona.onchange=()=>{draft.persona=persona.value;draft.linked=false;const p=this.state!.personas.find(p=>p.source+':'+p.sourceId===persona.value);draft.addonIds=persona.value==='keep'?[...(saved?.personaAddons?.enabledIds||[])]:p?.addons?.filter(a=>a.available&&a.enabled).map(a=>a.id)||[];if(p&&!draft.displayName)draft.displayName=p.name;redraw()};persona.hidden=true;field('Profile persona',persona)
    const search=el('input');search.type='search';search.placeholder='Search personas to import…';search.setAttribute('aria-label','Search Lumiverse personas');search.value=this.personaQuery
    const importPicker=el('details','mochi-persona-import');importPicker.open=!draft.id;const importTitle=el('summary','','Import persona');importPicker.append(importTitle,search)
    const choices=el('div','mochi-persona-choices');const fill=()=>{choices.replaceChildren();for(const p of this.state!.personas.filter(p=>(p.name+' '+p.source).toLocaleLowerCase().includes(this.personaQuery.toLocaleLowerCase()))){
      const row=el('div','mochi-persona-row'),pick=button('','mochi-persona-choice'),avatar=el('span','mochi-sidebar-avatar',p.name.slice(0,1));if(p.avatarUrl){const img=el('img');img.src=p.avatarUrl;img.alt='';avatar.replaceChildren(img)}
      pick.setAttribute('aria-label','Import persona '+p.name);pick.setAttribute('aria-pressed',String(draft.persona===p.source+':'+p.sourceId||(draft.persona==='keep'&&saved?.persona.source===p.source&&saved?.persona.sourceId===p.sourceId)));const copy=el('span');copy.append(el('strong','',p.name),el('small','mochi-muted',p.source));pick.append(avatar,copy)
      pick.onclick=()=>{persona.value=p.source+':'+p.sourceId;persona.dispatchEvent(new persona.ownerDocument.defaultView!.Event('change'))}
      const details=el('details','mochi-source-details'),summary=el('summary','','Details');details.append(summary,el('strong','',p.name),el('p','mochi-muted',p.source+' · '+p.sourceId),el('p','mochi-muted',`${p.addons?.length||0} add-ons · Choosing a source imports a snapshot on Save. Linking is separate.`));row.append(pick,details);choices.append(row)
    }};search.oninput=()=>{this.personaQuery=search.value;fill()};fill();importPicker.append(choices);ai.append(importPicker)
    const independent=button(draft.id?'Use independent AI identity':'Independent Mochi Account','lp-button');independent.onclick=()=>{draft.persona='manual';draft.linked=false;draft.addonIds=[];redraw()};ai.append(independent)
    ai.append(el('small','mochi-muted',chosen?'Import: '+chosen.name+' · The source AI description and portrait are captured on Save.':saved?'Saved identity: '+saved.persona.name:'Independent identity'))
    const refresh=button('Refresh personas','lp-button mochi-secondary-action');refresh.onclick=refreshSources;ai.append(refresh)
    if(draft.persona==='manual'||draft.persona==='keep'){const description=el('textarea');description.maxLength=12000;description.rows=3;description.value=draft.description;description.oninput=()=>{draft.description=description.value};field('Profile identity description',description)}
    const source=draft.persona==='keep'?saved?.persona:chosen
    const linked=el('fieldset','mochi-profile-fields');linked.append(el('legend','','Linked persona'),el('p','mochi-muted','Optional source link · Manual sync only.'));form.append(linked)
    if(source?.source==='lumiverse'){const label=el('label','','Keep an explicit Lumiverse source link'),check=el('input');check.type='checkbox';check.checked=draft.linked;check.setAttribute('aria-label','Link Lumiverse persona');check.onchange=()=>{draft.linked=check.checked;redraw()};label.prepend(check);linked.append(label,el('small','mochi-muted',source.name+' · '+source.sourceId))}else linked.append(el('small','mochi-muted','Import a Lumiverse persona above to enable linking.'))
    if(saved?.personaLink){const sync=button('Sync from Lumiverse','lp-button');sync.disabled=busy||this.hasUnsavedChanges();sync.onclick=()=>{if(this.hasUnsavedChanges()){sync.disabled=true;linked.append(el('p','mochi-muted','Save or cancel your changes first.'));return}send('mochi:account_sync_preview',{accountId:saved.id,revision:saved.revision})};linked.append(sync,el('small','mochi-muted','Save or cancel draft changes before reviewing sync.'))}
    if(source?.source==='lumiverse'){
      const native=this.state.personas.find(p=>p.source==='lumiverse'&&p.sourceId===source.sourceId)
      const addons=el('fieldset','mochi-profile-fields');addons.append(el('legend','','Persona add-ons'),el('p','mochi-muted','Selections affect future replies in matching-persona chats.'))
      if(!native)addons.append(el('p','mochi-muted','The source persona is unavailable. Add-ons will not be included.'))
      else if(!native.addons?.length)addons.append(el('p','mochi-muted','No native add-ons are attached to this persona.'))
      for(const [global,heading]of [[false,'Persona Add-Ons'],[true,'Global Add-Ons']] as const){
        const items=(native?.addons||[]).filter(a=>!!a.global===global);if(!items.length)continue
        const group=el('section','mochi-addon-group');group.append(el('h4','',heading))
        for(const addon of items){
          const row=el('div','mochi-addon-row'),label=el('label'),check=el('input');label.append(el('span','mochi-addon-name',addon.label));check.type='checkbox';check.checked=draft.addonIds.includes(addon.id)&&addon.available;check.disabled=busy||!addon.available;check.setAttribute('aria-label','Enable add-on '+addon.label);row.dataset.selected=String(check.checked)
          check.onchange=()=>{draft.addonIds=check.checked?[...new Set([...draft.addonIds,addon.id])]:draft.addonIds.filter(id=>id!==addon.id);row.dataset.selected=String(check.checked)}
          label.prepend(check);const details=el('details','mochi-addon-details'),summary=el('summary','','Details');summary.setAttribute('aria-label','Details for add-on '+addon.label);details.append(summary,el('strong','',addon.label),el('pre','mochi-addon-content',addon.available?addon.content:'Unavailable; omitted from replies.'))
          if(addon.outletName)details.append(el('small','mochi-muted',`Placed only at {{persona_outlet::${addon.outletName}}} in chat or preset instructions.`))
          row.append(label,el('small','mochi-addon-status',addon.available?'Compatible':'Unavailable'),details);group.append(row)
        }
        addons.append(group)
      }
      if(draft.addonIds.some(id=>!native?.addons?.some(a=>a.id===id&&a.available)))addons.append(el('p','mochi-muted','Some saved add-ons are missing or inaccessible. They are omitted from replies and removed from selections on Save.'))
      form.append(addons)
    }
    const appearance=el('fieldset','mochi-profile-fields');appearance.append(el('legend','','Appearance'));form.append(appearance);fields=appearance
    const avatar=el('select');for(const [value,label] of [['persona','Use selected persona portrait'],['','No portrait'],...this.state.avatars.map(a=>[a.id,a.name])]){const o=el('option','',label);o.value=value;avatar.append(o)}
    if(draft.avatarId&&!['persona',...this.state.avatars.map(a=>a.id)].includes(draft.avatarId)){const o=el('option','','Keep saved portrait');o.value=draft.avatarId;avatar.append(o)}
    avatar.value=draft.avatarId;avatar.onchange=()=>{draft.avatarId=avatar.value;redraw()};field('Profile portrait',avatar)

    if(this.state.canUploadAvatar){const upload=el('input');upload.type='file';upload.accept='image/png,image/jpeg,image/webp';upload.disabled=busy;upload.onchange=()=>{const file=upload.files?.[0];if(!file)return;if(file.size>2097152){upload.setCustomValidity('Choose a portrait up to 2 MB.');upload.reportValidity();return}const reader=new FileReader();reader.onload=()=>{if(this.draft===draft&&form.isConnected)send('mochi:account_avatar_upload',{dataUrl:reader.result})};reader.readAsDataURL(file)};field('Upload profile portrait',upload)}
    form.append(el('p','mochi-muted','Name, identity and portrait changes apply to new chats. Add-on selections apply to future replies in matching-persona chats. Existing messages and authorship are preserved.'))
    if(saved){const archive=button('Archive profile','lp-button mochi-danger-action');archive.disabled=busy;archive.onclick=()=>{this.confirmation={kind:'archive',account:saved};redraw()};form.append(archive)}
    const save=button(busy?'Saving…':'Save profile','lp-button mochi-primary');save.type='submit';save.disabled=busy
    const cancel=button('Cancel profile changes','lp-button');cancel.disabled=busy;cancel.onclick=()=>confirmDiscard(()=>{this.draft=null;exit()},cancel);const actions=el('div','mochi-profile-actions');actions.append(save,cancel);form.append(actions)
    form.onsubmit=e=>{e.preventDefault();const p=draft.persona==='keep'?undefined:draft.persona==='manual'?{source:'manual',name:draft.displayName,description:draft.description}:this.state!.personas.find(p=>p.source+':'+p.sourceId===draft.persona);const unchangedPortrait=!p&&saved&&draft.avatarId===(saved.avatarUrl.split('/api/v1/images/')[1]||'');send(draft.id?'mochi:account_update':'mochi:account_create',{accountId:draft.id||undefined,revision:draft.revision,displayName:draft.displayName,username:draft.username,persona:p,...(!p?{identityDescription:draft.description}:{}),personaLink:draft.linked&&((p as MochiPersona)||saved?.persona)?.source==='lumiverse'?{source:'lumiverse',sourceId:((p as MochiPersona)||saved!.persona).sourceId}:null,...((p||!saved||JSON.stringify(draft.addonIds)!==JSON.stringify(saved.personaAddons?.enabledIds||[]))&&(p||saved?.persona)?.source==='lumiverse'&&this.state!.personas.some(native=>native.source==='lumiverse'&&native.sourceId===((p as MochiPersona)||saved!.persona).sourceId)?{personaAddons:{personaId:((p as MochiPersona)||saved!.persona).sourceId,enabledIds:draft.addonIds}}:{}),...(unchangedPortrait?{}:draft.avatarId==='persona'?(p?{}:{avatarId:saved?.persona.avatarUrl.split('/api/v1/images/')[1]||''}):{avatarId:draft.avatarId})})}
    return form
  }
  private renderSync(busy:boolean,send:(type:string,input?:Record<string,unknown>)=>void,redraw:()=>void,confirmDiscard:(next:()=>void,anchor:HTMLElement)=>void):HTMLElement {
    const review=this.sync!,saved=this.state!.accounts.find(a=>a.id===review.accountId)!,root=el('section','mochi-profile-screen mochi-sync-review')
    const heading=el('h3','','Review Persona Sync');heading.tabIndex=-1;root.append(heading)
    const back=button('Back to Edit Account','lp-button');back.onclick=()=>confirmDiscard(()=>{this.backSync();redraw()},back);root.append(back)
    root.append(el('p','mochi-muted','Choose each change explicitly. AI identity and add-ons can affect future replies. Username, public About Me, chat snapshots and history stay unchanged.'))
    if(review.unavailable){const error=el('p','mochi-error',review.unavailable);error.setAttribute('role','alert');root.append(error);return root}
    const incoming=review.incoming!
    for(const [key,label,current,next] of [['displayName','Display name',saved.displayName,incoming.name],['avatar','Avatar',saved.avatarUrl,incoming.avatarUrl],['description','AI identity description',saved.persona.description,incoming.description]]){
      const section=el('fieldset','mochi-profile-fields'),legend=el('legend','',label),check=el('input');check.type='checkbox';check.setAttribute('aria-label','Sync '+label);check.checked=this.syncFields.has(key);check.disabled=busy||current===next;check.onchange=()=>{check.checked?this.syncFields.add(key):this.syncFields.delete(key)}
      const status=current===next?'Unchanged':!next?'Missing incoming value · applying clears this field':'Changed'
      const approval=el('label','',status);approval.prepend(check);section.append(legend,approval,el('small','','Current'),el('pre','mochi-sync-value',current||'(empty)'),el('small','','Incoming'),el('pre','mochi-sync-value',next||'(empty)'));root.append(section)
    }
    const addons=el('fieldset','mochi-profile-fields');addons.append(el('legend','','Persona add-ons'))
    for(const addon of review.addons){
      const current=saved.personaAddons?.enabledIds.includes(addon.id)||false,snapshot=saved.personaAddonSnapshots?.find(a=>a.id===addon.id),changed=current!==addon.enabled||!!snapshot&&(snapshot.content!==addon.content||snapshot.outletName!==addon.outletName)
      const section=el('section','mochi-sync-addon'),label=el('label','',addon.label+' · '+(!addon.available?'Unavailable; preserved':changed?'Changed':'Unchanged')),check=el('input');check.type='checkbox';check.setAttribute('aria-label','Sync add-on '+addon.label);check.disabled=busy||!addon.available||!changed;check.checked=this.syncAddons.has(addon.id);check.onchange=()=>{check.checked?this.syncAddons.set(addon.id,addon.enabled):this.syncAddons.delete(addon.id)};label.prepend(check);section.append(label,el('small','',`Current: ${current?'enabled':'disabled'}`),el('pre','mochi-sync-value',snapshot?.content||'(no saved content)'),el('small','',`Incoming: ${addon.enabled?'enabled':'disabled'}`),el('pre','mochi-sync-value',addon.content||'(empty)'));addons.append(section)
    }
    for(const id of saved.personaAddons?.enabledIds||[])if(!review.addons.some(a=>a.id===id))addons.append(el('p','mochi-muted',id+' · Missing from source; saved selection preserved.'))
    if(!review.addons.length)addons.append(el('p','mochi-muted','No compatible source add-ons. Saved selections are preserved.'))
    root.append(addons)
    const apply=button('Apply approved changes','lp-button mochi-primary');apply.disabled=busy;apply.onclick=()=>send('mochi:account_sync',{accountId:review.accountId,revision:review.revision,signature:review.signature,fields:[...this.syncFields],addons:[...this.syncAddons].map(([id,enabled])=>({id,enabled}))});root.append(apply)
    return root
  }

}
