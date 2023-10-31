import type { PathSegment } from '@sanity/client/csm'

const ESCAPE: Record<string, string> = {
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  "'": "\\'",
  '\\': '\\\\',
}

// @TODO move to `@sanity/client/csm` package
/** @internal */
export function compileJsonPath(
  path: PathSegment[],
  opts?: {
    keyArraySelectors: boolean
  },
): string {
  return `$${path
    .map((segment) => {
      if (typeof segment === 'string') {
        const escapedKey = segment.replace(/[\f\n\r\t'\\]/g, (match) => {
          return ESCAPE[match]
        })
        return `['${escapedKey}']`
      }

      if (typeof segment === 'number') {
        return `[${segment}]`
      }

      if (opts?.keyArraySelectors && segment.key !== '') {
        const escapedKey = segment.key.replace(/['\\]/g, (match) => {
          return ESCAPE[match]
        })
        return `[?(@._key=='${escapedKey}')]`
      }

      return `[${segment.index}]`
    })
    .join('')}`
}
