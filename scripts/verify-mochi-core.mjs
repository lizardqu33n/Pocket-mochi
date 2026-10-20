// Synthetic Mochi tests only. A fresh process per file prevents jsdom state/heap
// accumulation from turning later UI checks into misleading timeout failures.
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root=resolve(process.argv[2]||'.'),output=resolve(process.argv[3]||'evidence/current')
mkdirSync(output,{recursive:true})
const results=[]
for(const file of readdirSync(resolve(root,'tests')).filter(f=>/^mochi.*\.test\.ts$/.test(f)).sort()){
  const result=spawnSync('bun',['test','--timeout','30000',resolve(root,'tests',file)],{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024})
  const log=(result.stdout||'')+(result.stderr||'')+(result.error?'\n'+result.error.message:'')
  writeFileSync(resolve(output,file+'.log'),log)
  const row={file,status:result.status,signal:result.signal,pass:Number(log.match(/\b(\d+) pass\b/)?.[1]||0),fail:Number(log.match(/\b(\d+) fail\b/)?.[1]||0)}
  results.push(row)
  writeFileSync(resolve(output,'results.json'),JSON.stringify(results,null,2)+'\n')
  console.log(`${file}: ${row.status===0?'PASS':'FAIL'} (${row.pass} pass, ${row.fail} fail)`)
}
const failed=results.filter(r=>r.status!==0)
console.log(JSON.stringify({files:results.length,pass:results.reduce((n,r)=>n+r.pass,0),fail:results.reduce((n,r)=>n+r.fail,0),failed:failed.map(r=>r.file)}))
process.exitCode=failed.length?1:0
