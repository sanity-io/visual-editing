import { Path } from 'sanity'

const RE_SEGMENT_WITH_INDEX = /^([A-Za-z]+):([0-9]+)$/
const RE_SEGMENT_WITH_TUPLE = /^([A-Za-z]+):([0-9]+),([0-9]+)$/
const RE_SEGMENT_WITH_KEY = /^([A-Za-z]+):([a-z0-9]+)$/

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
      path.push(withKey[1], { _key: withKey[2] })
      continue
    }

    path.push(segment)
  }

  return path
}
