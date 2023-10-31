import type {
  ContentSourceMap,
  ContentSourceMapMapping,
  PathSegment,
} from '@sanity/client/csm'

import { compileJsonPath } from './jsonpath'
import { Logger } from './types'

export function resolveMapping(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
  logger?: Logger,
):
  | {
      mapping: ContentSourceMapMapping
      matchedPath: string
      pathSuffix: string
    }
  | undefined {
  const resultJsonPath = compileJsonPath(resultPath)

  if (!csm.mappings) {
    logger?.error?.('Missing mappings', {
      resultSourceMap: csm,
    })
    return undefined
  }

  if (csm.mappings[resultJsonPath] !== undefined) {
    return {
      mapping: csm.mappings[resultJsonPath],
      matchedPath: resultJsonPath,
      pathSuffix: '',
    }
  }

  const mappings = Object.entries(csm.mappings)
    .filter(([key]) => resultJsonPath.startsWith(key))
    .sort(([key1], [key2]) => key2.length - key1.length)

  if (mappings.length == 0) {
    return undefined
  }

  const [matchedPath, mapping] = mappings[0]

  return {
    mapping,
    matchedPath,
    pathSuffix: resultJsonPath.substring(matchedPath.length),
  }
}
