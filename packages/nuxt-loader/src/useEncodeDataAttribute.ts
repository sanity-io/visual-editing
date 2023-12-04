import type { ContentSourceMap } from '@sanity/client'
import type {
  ResolveStudioUrl,
  StudioPathLike,
  StudioUrl,
} from '@sanity/client/csm'
import { encodeDataAttribute } from '@sanity/core-loader/encode-data-attribute'
import type { Ref } from 'vue'

/** @public */
export type EncodeDataAttributeCallback = (
  path: StudioPathLike,
) => string | undefined

/** @public */
export function useEncodeDataAttribute<QueryResponseResult = unknown>(
  result: Ref<QueryResponseResult>,
  sourceMap: Ref<ContentSourceMap | undefined>,
  studioUrl: StudioUrl | ResolveStudioUrl,
): EncodeDataAttributeCallback {
  return (path) =>
    encodeDataAttribute(result.value, sourceMap.value, studioUrl, path)
}

export type { ContentSourceMap, ResolveStudioUrl, StudioPathLike, StudioUrl }
