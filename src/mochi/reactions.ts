import type {MochiReaction,MochiRoom} from './types.js'
export const REACTION_EMOJI=['👍','❤️','😂','😮','😢','🎉','🤔','👀'] as const
export const REACTION_NAMES:Record<string,string>={'👍':'thumbs up','❤️':'heart','😂':'laugh','😮':'surprised','😢':'sad','🎉':'celebration','🤔':'thinking','👀':'eyes'}
// Historical actors stay attributed after explicit room assignment/member removal.
export function readReactions(value:unknown,room:MochiRoom):MochiReaction[]{
 if(value===undefined)return []
 if(!Array.isArray(value)||value.length>128)throw Error('Unsupported reactions; stored history was preserved.')
 const seen=new Set<string>()
 for(const r of value){
  if(!r||!REACTION_EMOJI.includes(r.emoji)||typeof r.name!=='string'||r.name.length>120||!r.name.trim()||!['user','character'].includes(r.actor)||typeof r.actorId!=='string'||(r.actor==='user'?r.actorId!=='legacy'&&!/^account_[a-f0-9]{32}$/.test(r.actorId):!/^[A-Za-z0-9_.:-]{1,180}$/.test(r.actorId)))throw Error('Unsupported reaction ownership; stored history was preserved.')
  const key=JSON.stringify([r.emoji,r.actor,r.actorId]);if(seen.has(key))throw Error('Ambiguous reactions; stored history was preserved.');seen.add(key)
 }
 return value
}
