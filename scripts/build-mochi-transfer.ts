// Builds local maintenance artifacts only; never installs, mounts or reloads a host.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
const mode = process.argv[2]
if (!['source', 'destination'].includes(mode)) throw Error('Choose source or destination maintenance mode.')
const output = `tmp/transfer-${mode}`
await mkdir(output + '/dist', { recursive: true })
const manifest = JSON.parse(await readFile('spindle.json', 'utf8'))
manifest.identifier = mode === 'source' ? 'lumiphone' : 'mochi'
manifest.name = `Mochi ${mode} maintenance`
manifest.permissions = mode === 'source' ? ['ui_panels'] : ['characters', 'personas', 'images', 'ui_panels']
manifest.description = 'Exclusive operator-assisted transfer maintenance. No messenger, scheduler or model calls. Restore normal code after completion.'
for (const [entry, target, outfile] of [['src/transfer-backend.ts', 'bun', 'backend.js'], ['src/transfer-frontend.ts', 'browser', 'frontend.js']] as const) {
  const built = await Bun.build({ entrypoints: [entry], target, format: 'esm', outdir: output + '/dist', naming: outfile, define: { MOCHI_TRANSFER_MODE: JSON.stringify(mode) } })
  if (!built.success) throw new AggregateError(built.logs)
}
await writeFile(output + '/spindle.json', JSON.stringify(manifest, null, 2) + '\n')
await writeFile(output + '/MAINTENANCE-NOT-A-RELEASE.txt', 'Local operator-assisted maintenance only. Read docs/MOCHI-CORE-01C.md in the matching source checkout. Preserve Pocket and Lucide/Feather provenance. This is not an approved public release.\n')
console.log(output)
