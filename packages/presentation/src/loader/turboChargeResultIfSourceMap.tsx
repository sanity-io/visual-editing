import type {
  ClientPerspective,
  ContentSourceMap,
  SanityDocument,
} from '@sanity/client'
import { applySourceDocuments } from '@sanity/client/csm'
import {
  unstable__documentsCache,
  unstable__getDocumentCacheKey,
} from '@sanity/groq-store'

let warnedAboutCrossDatasetReference = false

export function turboChargeResultIfSourceMap(
  draft: SanityDocument | undefined,
  projectId: string,
  dataset: string,
  result: unknown,
  perspective: ClientPerspective,
  resultSourceMap?: ContentSourceMap,
): any {
  if (perspective === 'raw') {
    throw new Error(
      'turboChargeResultIfSourceMap does not support raw perspective',
    )
  }
  return applySourceDocuments(result, resultSourceMap, (sourceDocument) => {
    if (sourceDocument._projectId) {
      // @TODO Handle cross dataset references
      if (!warnedAboutCrossDatasetReference) {
        // eslint-disable-next-line no-console
        console.warn(
          'Cross dataset references are not supported yet, ignoring source document',
          sourceDocument,
        )
        warnedAboutCrossDatasetReference = true
      }
      return undefined
    }
    // If the draft matches, use that as it's the most up to date
    if (
      draft?._id === sourceDocument._id &&
      draft?._type === sourceDocument._type
    ) {
      return draft
    }
    // Fallback to general documents cache
    const key = unstable__getDocumentCacheKey(
      { projectId, dataset, perspective },
      sourceDocument,
    )
    return unstable__documentsCache.get(key)
  })
}
