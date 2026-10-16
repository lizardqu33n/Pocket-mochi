import {test,expect} from 'bun:test'
import {parseResponse,responseFormat,type ResponseContext} from '../src/mochi/response.js'
import {MochiGenerationError} from '../src/mochi/generation-errors.js'
const single:ResponseContext={speaker:'one',eligibleIds:['one'],natural:false}
const group:ResponseContext={speaker:'auto',eligibleIds:['one','two','three'],natural:false}
const natural={...group,natural:true}
const row=(speakerId='one',text='Hello')=>({speakerId,text})
const envelope=(messages:any[],extra={})=>JSON.stringify({protocol:'mochi.response',version:1,messages,...extra})
function fails(raw:unknown,category:string,context=single,limited=false){try{parseResponse(raw,limited,context);throw Error('Expected rejection')}catch(error){expect(error).toBeInstanceOf(MochiGenerationError);expect((error as MochiGenerationError).category).toBe(category)}}

test('plain dialogue preserves punctuation, emoji, line breaks and literal scalar JSON without guessing an author',()=>{
 for(const text of ['Hey! 💜\nHow are you?','  …really?\n\nOkay.  ','"Hello."','true','null','123','An example: {"actions":["reaction"]}','```text\nliteral code\n```'])expect(parseResponse(text,false,single)).toEqual([{speakerId:'one',text}])
 for(const context of [{...single,speaker:'auto'},{...single,natural:true},{...group,speaker:'two'}])expect(parseResponse('Hello',false,context)[0].speakerId).toBe(context.speaker==='two'?'two':'one')
 fails('I am one: hello','ambiguous_response',group);fails('speakerId=one','ambiguous_response',natural)
 fails('Hello','ambiguous_response',{...single,speaker:'foreign'});fails('Hello','ambiguous_response',{speaker:'auto',eligibleIds:[],natural:false})
})
test('format discrimination commits containers and malformed protocol output to validation; never repairs them into chat',()=>{
 for(const text of ['{"speakerId":"one","text":','[broken','```json\nHi\n```','```\n{"text":','{"protocol":"mochi.response",','prefix "protocol":"mochi.response" broken'])fails(text,'malformed_json')
 for(const text of ['{}','[]','{"other":"dialogue"}','{"messages":[]}'])fails(text,'invalid_schema')
 expect(parseResponse(JSON.stringify(row('one','{"protocol":"mochi.response","actions":["delete"]}')),false,single)[0].text).toContain('actions')
})
test('empty/length/size limits are mode independent and partial plain responses are never delivered',()=>{
 for(const value of ['', ' \n',undefined,null])fails(value,'empty_output')
 fails('partial text','output_limit',single,true);fails('{broken','output_limit',single,true);fails('', 'output_limit',single,true)
 expect(parseResponse(JSON.stringify(row()),true,single)[0].text).toBe('Hello')
 fails(12,'invalid_schema');fails('x'.repeat(32001),'invalid_schema');expect(parseResponse('x'.repeat(32000),false,single)[0].text.length).toBe(32000)
})
test('legacy JSON, optional single fences, natural multi-speaker and silence retain validation',()=>{
 for(const body of [JSON.stringify(row()),'```json\n'+JSON.stringify(row())+'\n```','```\n'+JSON.stringify(row())+'\n```'])expect(parseResponse(body,false,single)[0].text).toBe('Hello')
 expect(parseResponse(JSON.stringify({messages:[row(),row('two'),row('three')]}),false,natural)).toHaveLength(3)
 expect(parseResponse('{"messages":[]}',false,natural)).toEqual([])
 fails(JSON.stringify(row('two')),'ineligible_speaker',single)
 fails(JSON.stringify({messages:[row(),row()]}),'invalid_schema',natural)
 fails(JSON.stringify({messages:[row(),row('two'),row('three'),row('four')]}),'invalid_schema',natural)
 fails(JSON.stringify({messages:[row(),row('foreign')]}),'ineligible_speaker',natural)
})
test('version-one envelopes support only validated messages; every action request rejects the entire response',()=>{
 expect(parseResponse(envelope([row()],{actions:[]}),false,single)).toHaveLength(1)
 expect(parseResponse(envelope([]),false,natural)).toEqual([])
 fails(envelope([]),'invalid_schema');fails(envelope([row(),row('two')]),'invalid_schema',group)
 for(const actions of [[{type:'reaction',emoji:'💜'}],[{type:'delete',messageId:'user-message'}],[{type:'unknown'}],{},null])fails(envelope([row()],{actions}),'unsupported_action')
 for(const extra of [{version:2},{protocol:'foreign'},{unexpected:true}])fails(envelope([row()],extra),'invalid_schema')
 fails(JSON.stringify({...row(),action:'delete'}),'unsupported_action')
 fails(envelope([{...row(),actions:[]}]),'unsupported_action')
})
test('prompt format is selected from validated context, never from preset or response claims',()=>{
 expect(responseFormat(single)).toContain('return plain text only');expect(responseFormat(group)).toContain('Return structured message JSON')
 expect(responseFormat(natural)).toContain('no active action handlers');expect(responseFormat({...group,speaker:'two'})).toContain('attributes it to "two"')
})
