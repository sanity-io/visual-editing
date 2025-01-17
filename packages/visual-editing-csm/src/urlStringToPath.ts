import type {Path} from '@sanity/client/csm'

const RE_SEGMENT_WITH_INDEX = /^([\w-]+):(0|[1-9][0-9]*)$/
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
