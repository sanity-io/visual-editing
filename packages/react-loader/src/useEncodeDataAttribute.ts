import type { ContentSourceMap } from '@sanity/client'
import type {
  ResolveStudioUrl,
  StudioPathLike,
  StudioUrl,
} from '@sanity/client/csm'
import { encodeDataAttribute } from '@sanity/core-loader/encode-data-attribute'
import { useCallback } from 'react'

/** @public */
export type EncodeDataAttributeCallback = (
  path: StudioPathLike,
) => string | undefined

/** @public */
export function useEncodeDataAttribute<QueryResponseResult = unknown>(
  result: QueryResponseResult,
  sourceMap: ContentSourceMap | undefined,
  studioUrl: StudioUrl | ResolveStudioUrl | undefined,
): EncodeDataAttributeCallback {
  return useCallback(
    (path) => {
      if (!studioUrl) {
        return undefined
      }
      return encodeDataAttribute(result, sourceMap, studioUrl, path)
    },
    [result, sourceMap, studioUrl],
  )
}

export type { ContentSourceMap, ResolveStudioUrl, StudioPathLike, StudioUrl }
