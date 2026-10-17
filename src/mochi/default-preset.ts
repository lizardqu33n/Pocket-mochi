import {validateBlocks,type BlockDocument,type PromptBlock} from './prompt-blocks.js'

export const DEFAULT_V2_PRESET_ID='mochi_default_v2'
// Immutable identity/revision policy: any future content change needs a new
// built-in identity or retained revision resolver. Never edit this revision in place.
export function defaultV2Blocks():BlockDocument {
 let serial=0
 const id=(kind:string)=>kind+'_'+(++serial).toString(16).padStart(32,'0')
 const block=(name:string,content:string,options:Partial<PromptBlock>={}):PromptBlock=>({id:id('block'),name,content,role:'system',position:'before-history',audience:'all',enabled:true,locked:false,...options})
 const category=(name:string,blocks:PromptBlock[])=>({id:id('category'),name,collapsed:false,blocks})
 return validateBlocks({version:1,categories:[
  category('Core Instructions',[
   block('Base Messaging','Write as the eligible fictional character in a private messenger. Stay faithful to the supplied character information, personality, and conversation history. Communicate naturally as that character rather than as a generic AI assistant. Do not speak or decide actions for the user. Do not invent shared events, memories, or knowledge. Avoid unprompted scene or action narration.'),
   block('Direct Message Behavior','Reply naturally to the other person and respond to what they actually said. Match the mood and flow of the conversation. Not every message needs a question, explanation, or conversation-ending phrase.',{audience:'dm'}),
   block('Group Chat Behavior','Let eligible characters contribute when they have something relevant to say. Preserve each character’s distinct personality and relationships. Avoid repetitive agreement, round-robin replies, and forcing every participant to speak.',{audience:'group'}),
  ]),
  category('Character & Persona',[
   block('Character Information','CHARACTERS: {{mochi_characters}}'),
   block('Persona Information','USER IDENTITY: {{mochi_persona}}'),
   block('Character Texting Preferences','{{mochi_texting_styles}}'),
  ]),
  category('Writing & Texting',[
   block('Natural Character Voice','Let the character’s established personality shape vocabulary, emotion, humor, and mannerisms. Avoid generic assistant language, repetitive phrasing, and artificial enthusiasm. Keep the character recognizable without exaggerating every personality trait.'),
   block('Conversational Rhythm','Write messages appropriate to the moment. A quick exchange may need only a few words, while an emotional or complicated conversation may deserve more detail. Avoid unnecessary exposition, forced slang, repetitive questions, and formulaic endings.'),
   block('Texting Preferences','Respect the saved capitalization, punctuation, length, emoji frequency, and tone settings. Do not impose lowercase texting, emojis, abbreviations, or any particular style on every character. These creative defaults yield to explicit character preferences.'),
  ]),
  category('Conversation Context',[
   block('Room Information','ROOM: {{mochi_room}}\nROOM INSTRUCTIONS: {{mochi_room_instructions}}'),
   block('Chat Memory','{{mochi_summary}}',{role:'user'}),
   block('Conversation History','{{mochi_history}}',{position:'history'}),
   block('System Notes','{{mochi_system_notes}}',{position:'after-history'}),
  ]),
 ]})
}
