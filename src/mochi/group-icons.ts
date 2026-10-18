// Built-in glyphs keep group artwork local and avoid arbitrary remote image URLs.
export const GROUP_ICONS=['💬','🌙','⭐','🌸','🍡','🎮','📚','🎵','🌿','❤️'] as const
export function groupIcon(value:unknown):string|undefined {
 if(value===undefined||value==='')return undefined
 if(typeof value!=='string'||!GROUP_ICONS.includes(value as typeof GROUP_ICONS[number]))throw Error('Choose a supported group icon.')
 return value
}
