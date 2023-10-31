import type { PathSegment } from '@sanity/client/csm'

export function simplifyPath(path: PathSegment[]): string {
  return path
    .map((segment, index) => {
      if (typeof segment === 'number') {
        return `[${segment}]`
      }

      if (typeof segment === 'string') {
        return index === 0 ? segment : `.${segment}`
      }

      return `[_key=="${segment.key}"]`
    })
    .join('')
}
