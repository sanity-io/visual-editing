import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

/**
 * pkg-utils v12 re-inserts `browser`/`node` before custom conditions when regenerating
 * exports. Condition order is significant — server conditions must win over `browser` in
 * SSR (see #3337). Wrap the exports composer so the authored order is restored on write.
 *
 * Remove once the upstream fix lands: https://github.com/sanity-io/pkg-utils/pull/3237
 */
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
] as const

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
] as const

function reorderConditions(entry: unknown, keyOrder: readonly string[]): unknown {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry
  const record = entry as Record<string, unknown>
  const next: Record<string, unknown> = {}
  for (const key of keyOrder) {
    if (key in record) next[key] = record[key]
  }
  for (const key of Object.keys(record)) {
    if (!(key in next)) next[key] = record[key]
  }
  return next
}

export default defineConfig({
  ...baseConfig,
  bundles: [
    {
      source: './src/rsc/index.react-server.ts',
      import: './dist/rsc/index.react-server.js',
    },
  ],
  plugins: [
    {
      name: 'preserve-react-loader-export-condition-order',
      tsdownConfig(config) {
        const exportsOption = config.exports
        if (!exportsOption || exportsOption === true || typeof exportsOption === 'string') {
          return
        }

        const previousCustomExports = exportsOption.customExports
        exportsOption.customExports = async (exportsMap, context) => {
          const composed =
            typeof previousCustomExports === 'function'
              ? await previousCustomExports(exportsMap, context)
              : previousCustomExports
                ? {...exportsMap, ...previousCustomExports}
                : exportsMap

          const order = context.isPublish ? PUBLISH_ORDER : EXPORTS_ORDER
          if (composed['.'] !== undefined) {
            composed['.'] = reorderConditions(composed['.'], order)
          }
          return composed
        }

        config.exports = exportsOption
      },
    },
  ],
})
