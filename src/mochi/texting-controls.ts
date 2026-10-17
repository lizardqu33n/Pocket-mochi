import {mochiStyle} from './ui/styles.js'
import {el} from '../frontend/shared.js'
import type {MochiSettings} from './types.js'
import {TEXTING_OPTIONS,type TextingStyle} from './texting.js'

export function textingControls(settings:MochiSettings,id:string,name:string):HTMLElement {
 const group=el('fieldset','mochi-texting-controls');group.append(el('legend','','Texting style in this chat'),el('small','mochi-muted','Optional tendencies. Character default keeps existing behavior. Save settings applies changes and may cancel pending replies.'))
 const change=(key:keyof TextingStyle,value:string)=>{
  const styles={...settings.textingStyles},style={...styles[id]}
  if(value)Object.assign(style,{[key]:value});else delete style[key]
  if(Object.keys(style).length)styles[id]=style;else delete styles[id]
  if(Object.keys(styles).length)settings.textingStyles=styles;else delete settings.textingStyles
 }
 const labels={length:'Message length',capitalization:'Capitalization',punctuation:'Punctuation',emoji:'Emoji use'}
 for(const key of Object.keys(TEXTING_OPTIONS)as Array<keyof typeof TEXTING_OPTIONS>){
  const label=el('label','',labels[key]),select=el('select'),defaultOption=el('option','','Character default');defaultOption.value='';select.append(defaultOption)
  select.setAttribute('aria-label',`${labels[key]} for ${name}`)
  for(const value of TEXTING_OPTIONS[key]){const option=el('option','',value==='lowercase'?'Casual lowercase':value[0].toUpperCase()+value.slice(1));option.value=value;select.append(option)}
  select.value=settings.textingStyles?.[id]?.[key]||'';select.onchange=()=>change(key,select.value);label.append(select);group.append(label)
 }
 const label=el('label','','Texting habits'),tone=el('textarea');tone.rows=2;tone.maxLength=400;tone.value=settings.textingStyles?.[id]?.tone||'';tone.placeholder='Optional: casual abbreviations, complete sentences, dry humor…';tone.setAttribute('aria-label',`Texting habits for ${name}`);tone.oninput=()=>change('tone',tone.value);label.append(tone);group.append(label)
 return group
}
export const MOCHI_TEXTING_STYLES=mochiStyle('mochi-texting-styles')
