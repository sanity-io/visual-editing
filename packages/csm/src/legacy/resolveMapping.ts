import {
  type ContentSourceMap,
  type ContentSourceMapMapping,
  type PathSegment,
  resolveMapping as _resolveMapping,
} from '@sanity/client/csm'

import { Logger } from './types'

// @TODO make this function the default behavior in `@sanity/client/csm`, and apply a legacy backwards compatible version in `@sanity/preview-kit/csm`
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
  if (!csm) {
    return undefined
  }
  const resolved = _resolveMapping(resultPath, csm)

  if (!csm.mappings) {
    logger?.error?.('Missing mappings', {
      resultSourceMap: csm,
    })
    return undefined
  }

  if (Array.isArray(resolved)) {
    const [mapping, matchedPath, pathSuffix] = resolved
    return {
      mapping,
      matchedPath,
      pathSuffix,
    }
  }

  return undefined
}
