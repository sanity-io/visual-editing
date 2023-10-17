import { isArray, isRecord } from './helpers'
import { PathSegment } from './types'

export type WalkMapFn = (value: unknown, path: PathSegment[]) => unknown

// generic way to walk a nested object or array and apply a mapping function to each value
export function walkMap(
  value: unknown,
  mappingFn: WalkMapFn,
  path: PathSegment[] = [],
): unknown {
  if (isArray(value)) {
    return value.map((v, idx) => {
      if (isRecord(v)) {
        const key = v['_key']
        if (typeof key === 'string') {
          return walkMap(v, mappingFn, path.concat({ key, index: idx }))
        }
      }

      return walkMap(v, mappingFn, path.concat(idx))
    })
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        walkMap(v, mappingFn, path.concat(k)),
      ]),
    )
  }

  return mappingFn(value, path)
}
