import type { ClientPerspective, SanityDocument } from '@sanity/client'
import LRUCache from 'mnemonist/lru-cache'

export type { ClientPerspective, SanityDocument }

/**
 * TODO add `ClientProjectId` to `@sanity/client`
 * @alpha
 */
export type ClientProjectId = string

/**
 * TODO add `ClientDataset` to `@sanity/client`
 * @alpha
 */
export type ClientDataset = string

/**
 * The only perspectives supported by the cache is `published` and `previewDrafts`.
 * @alpha
 */
export type DocumentCachePerspective = Extract<
  ClientPerspective,
  'published' | 'previewDrafts'
>

/**
 * @alpha
 */
export type DocumentId = string

/**
 * @alpha
 */
export type DocumentCacheKey =
  `${ClientProjectId}-${ClientDataset}-${DocumentCachePerspective}-${DocumentId}`

/**
 * @alpha
 */
export const unstable__documentsCache = new LRUCache<
  DocumentCacheKey,
  SanityDocument
>(1024)

/**
 * @alpha
 */
export interface ClientConfigLike {
  projectId: ClientProjectId
  dataset: ClientDataset
  perspective: DocumentCachePerspective
}

/**
 * @alpha
 */
export interface SanityDocumentLike {
  _id: DocumentId
}

/**
 * @alpha
 */
export function unstable__getDocumentCacheKey(
  config: ClientConfigLike,
  document: SanityDocumentLike,
): DocumentCacheKey {
  const { projectId, dataset, perspective } = config
  const { _id } = document
  if (
    ![projectId, dataset, perspective, _id].every(
      (input) => typeof input === 'string' && input.length > 0,
    )
  ) {
    throw new Error(
      'Invalid document cache key, all inputs must be non-empty strings',
      { cause: { config, document } },
    )
  }
  if (perspective !== 'published' && perspective !== 'previewDrafts') {
    throw new Error(
      'Invalid document cache key, perspective must be "published" or "previewDrafts"',
      { cause: { config, document } },
    )
  }
  return `${projectId}-${dataset}-${perspective}-${_id}`
}
