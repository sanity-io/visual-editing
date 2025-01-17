import type {Path} from '@sanity/client/csm'
import {isArray} from './isArray'

/** @internal */
export function pathToUrlString(path: Path): string {
  let str = ''

  for (const segment of path) {
    if (typeof segment === 'string') {
      if (str) str += '.'
      str += segment
      continue
    }

    if (typeof segment === 'number') {
      if (str) str += ':'
      str += `${segment}`
      continue
    }

    if (isArray(segment)) {
      if (str) str += ':'
      str += `${segment.join(',')}}`
      continue
    }

    if (segment._key) {
      if (str) str += ':'
      str += `${segment._key}`
      continue
    }
  }

  return str
}
