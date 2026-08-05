/**
 * pkg-utils v12's exports reconciler always inserts `browser`/`node` before
 * custom conditions (deno, edge, worker, …). Export condition order is
 * significant — server conditions must win over `browser` in SSR (see #3337).
 * Re-apply the authored order after local `pkg build` rewrites package.json.
 */
import {readFileSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json')

const EXPORTS_ORDER = [
  'source',
  'deno',
  'edge',
  'edge-light',
  'worker',
  'react-server',
  'browser',
  'import',
  'require',
  'default',
]

const PUBLISH_ORDER = [
  'deno',
  'edge',
  'edge-light',
  'worker',
  'react-server',
  'browser',
  'import',
  'require',
  'default',
]

function reorder(obj, keyOrder) {
  const next = {}
  for (const key of keyOrder) {
    if (key in obj) next[key] = obj[key]
  }
  for (const key of Object.keys(obj)) {
    if (!(key in next)) next[key] = obj[key]
  }
  return next
}

const source = readFileSync(pkgPath, 'utf8')
const pkg = JSON.parse(source)

pkg.exports['.'] = reorder(pkg.exports['.'], EXPORTS_ORDER)
pkg.publishConfig.exports['.'] = reorder(pkg.publishConfig.exports['.'], PUBLISH_ORDER)

const indent = /^([ \t]+)\S/m.exec(source)?.[1] ?? '  '
let output = JSON.stringify(pkg, null, indent)
if (source.endsWith('\n')) output += '\n'
writeFileSync(pkgPath, output)
