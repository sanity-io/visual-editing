import type { ContentSourceMap } from '@sanity/client'
import type {
  ResolveStudioUrl,
  StudioPathLike,
  StudioUrl,
} from '@sanity/client/csm'
import { encodeDataAttribute } from '@sanity/core-loader/encode-data-attribute'

/** @public */
export type EncodeDataAttributeCallback = (
  path: StudioPathLike,
) => string | undefined

/** @public */
export function useEncodeDataAttribute<QueryResponseResult = unknown>(
  result: QueryResponseResult,
  sourceMap: ContentSourceMap | undefined,
  studioUrl: StudioUrl | ResolveStudioUrl,
): EncodeDataAttributeCallback {
  return (path) => {
    return encodeDataAttribute(result, sourceMap, studioUrl, path)
  }
}

export type { ContentSourceMap, ResolveStudioUrl, StudioPathLike, StudioUrl }
