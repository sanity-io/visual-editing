import type {Path} from '@sanity/client/csm'

// An all-digit segment is ambiguous, as `pathToUrlString` serialises an array
// index and a `_key` identically. Cap indexes at 9 digits so that longer
// numbers, which no array can be indexed by anyway, fall through to
// RE_SEGMENT_WITH_KEY.
const RE_SEGMENT_WITH_INDEX = /^([\w-]+):(0|[1-9][0-9]{0,8})$/
const RE_SEGMENT_WITH_TUPLE = /^([\w-]+):([0-9]+),([0-9]+)$/
const RE_SEGMENT_WITH_KEY = /^([\w-]+):([\w-]+)$/

/** @internal */
export function urlStringToPath(str: string): Path {
  const path: Path = []

  for (const segment of str.split('.')) {
    const withIndex = RE_SEGMENT_WITH_INDEX.exec(segment)

    if (withIndex) {
      path.push(withIndex[1], Number(withIndex[2]))
      continue
    }

    const withTuple = RE_SEGMENT_WITH_TUPLE.exec(segment)

    if (withTuple) {
      path.push(withTuple[1], [Number(withTuple[2]), Number(withTuple[3])])
      continue
    }

    const withKey = RE_SEGMENT_WITH_KEY.exec(segment)

    if (withKey) {
      path.push(withKey[1], {_key: withKey[2]})
      continue
    }

    path.push(segment)
  }

  return path
}
