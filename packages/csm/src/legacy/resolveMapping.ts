import { ContentSourceMap, ContentSourceMapMapping } from '@sanity/client'

import { compileJsonPath } from './jsonpath'
import { Logger, PathSegment } from './types'

export function resolveMapping(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
  logger?: Logger,
): [ContentSourceMapMapping, string, string] | undefined {
  const resultJsonPath = compileJsonPath(resultPath)

  if (!csm.mappings) {
    logger?.error?.('Missing mappings', {
      resultSourceMap: csm,
    })
    return undefined
  }

  if (csm.mappings[resultJsonPath] !== undefined) {
    return [csm.mappings[resultJsonPath], resultJsonPath, '']
  }

  const mappings = Object.entries(csm.mappings)
    .filter(([key]) => resultJsonPath.startsWith(key))
    .sort(([key1], [key2]) => key2.length - key1.length)

  if (mappings.length == 0) {
    return undefined
  }

  const [matchedPath, mapping] = mappings[0]
  const pathSuffix = resultJsonPath.substring(matchedPath.length)
  return [mapping, matchedPath, pathSuffix]
}
