import type {
  ClientPerspective,
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
} from '@sanity/client'

import type {SanityNode, SanityStegaNode} from './overlays'
import type {SchemaType} from './schema'

/**
 * @internal
 * client.fetch(query, params) => `${query}-${JSON.stringify(params)}`
 */
export type QueryCacheKey = `${string}-${string}`

/**
 * Preview frame history update
 * @public
 */
export type HistoryUpdate = {
  type: 'push' | 'pop' | 'replace'
  title?: string
  url: string
}

/**
 * Preview frame history refresh event, emitted by Presentation Tool
 * @public
 */
export type HistoryRefresh =
  | {
      /**
       * source 'manual' means the refresh button were clicked by the user
       */
      source: 'manual'
      /**
       * If true then there's either preview-kit or a loader connected on the page
       */
      livePreviewEnabled: boolean
    }
  | {
      /**
       * source 'mutation' means a document were mutated and the preview might need to refresh
       */
      source: 'mutation'
      /**
       * If true then there's either preview-kit or a loader connected on the page
       */
      livePreviewEnabled: boolean
      /**
       * Select metadata about the document that were mutated
       * If it's prefixed with `drafts.` then it's a draft document, otherwise it's a published document.
       */
      document: {
        /**
         * If it's prefixed with `drafts.` then it's a draft document, otherwise it's a published document.
         */
        _id: string
        /**
         * The document type is frequently used in `revalidateTag` scenarios with Next.js App Router
         */
        _type: string
        /**
         * The document revision, can be used to dedupe requests, as we always send two due to debouncing and handling Content Lake eventual consistency
         */
        _rev: string
        /**
         * If the document has a top level slug field named `slug` with the type `slug`, then it'll be included here
         */
        slug?: {current?: string | null}
      }
    }

/**
 * Messages emitted by the presentation package
 * @public
 */
export type PresentationMsg =
  | {
      type: 'presentation/focus'
      data: {id: string; path: string}
    }
  | {
      type: 'presentation/blur'
      data: undefined
    }
  | {
      type: 'presentation/navigate'
      data: HistoryUpdate
    }
  | {
      type: 'presentation/toggleOverlay'
      data: undefined
    }
  | {
      type: 'presentation/refresh'
      data: HistoryRefresh
    }
  | {
      type: 'presentation/perspective'
      data: {
        perspective: ClientPerspective
      }
    }
  | {
      type: 'presentation/schema'
      data: {
        schema: SchemaType[]
      }
    }
  | {
      type: 'presentation/schemaTypes'
      data: {
        types: Map<string, Map<string, string>>
      }
    }

/**@public */
export interface UnresolvedPath {
  id: string
  path: string
}

/**@public */
export interface VisualEditingPayloads {
  documents: {
    projectId?: string
    dataset?: string
    perspective: ClientPerspective
    documents: ContentSourceMapDocuments
  }
  focus: SanityNode | SanityStegaNode
  meta: {
    title: string
  }
  navigate: HistoryUpdate
  toggle: {
    enabled: boolean
  }
  refresh: HistoryRefresh
  schemaPaths: {
    paths: UnresolvedPath[]
  }
  patch: {
    id: string
    type: string
    patch: Record<string, unknown>
  }
}

/**
 * Messages emitted by the overlays package
 * @deprecated use VisualEditingMsg instead
 */
export type OverlayMsg =
  | {
      type: 'overlay/focus'
      data: VisualEditingPayloads['focus']
    }
  | {
      type: 'overlay/navigate'
      data: VisualEditingPayloads['navigate']
    }
  | {
      type: 'overlay/toggle'
      data: VisualEditingPayloads['toggle']
    }

/**
 * Messages emitted by the visual-editing package
 * @public
 */
export type VisualEditingMsg =
  | {
      type: 'visual-editing/focus'
      data: VisualEditingPayloads['focus']
    }
  | {
      type: 'visual-editing/navigate'
      data: VisualEditingPayloads['navigate']
    }
  | {
      type: 'visual-editing/toggle'
      data: VisualEditingPayloads['toggle']
    }
  | {
      type: 'visual-editing/meta'
      data: VisualEditingPayloads['meta']
    }
  | {
      type: 'visual-editing/documents'
      data: VisualEditingPayloads['documents']
    }
  | {
      type: 'visual-editing/refreshing'
      data: VisualEditingPayloads['refresh']
    }
  | {
      type: 'visual-editing/refreshed'
      data: VisualEditingPayloads['refresh']
    }
  | {
      type: 'visual-editing/schemaPaths'
      data: VisualEditingPayloads['schemaPaths']
    }
  | {
      type: 'visual-editing/patch'
      data: VisualEditingPayloads['patch']
    }

/** @public */
export interface LoaderPayloads {
  'perspective': {
    projectId: string
    dataset: string
    perspective: ClientPerspective
  }
  'query-change': {
    projectId: string
    dataset: string
    perspective: ClientPerspective
    query: string
    params: QueryParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any
    resultSourceMap?: ContentSourceMap
  }
  'query-listen': {
    projectId: string
    dataset: string
    perspective: ClientPerspective
    query: string
    params: QueryParams
    /**
     * If above 0, then the loader will fire listen events on a heartbeat interval,
     * allowing Presentation Tool to detect when it's no longer necessary to subscribe to a query.
     */
    heartbeat?: number
  }
  'documents': {
    projectId: string
    dataset: string
    perspective: ClientPerspective
    documents: ContentSourceMapDocuments
  }
}

/**
 * Messages emitted by the loader packages
 * @public
 */
export type LoaderMsg =
  | {
      type: 'loader/perspective'
      data: LoaderPayloads['perspective']
    }
  | {
      type: 'loader/query-change'
      data: LoaderPayloads['query-change']
    }
  | {
      type: 'loader/query-listen'
      data: LoaderPayloads['query-listen']
    }
  | {
      /**
       * Sends over the CSM reported documents in use on the page. If there are multiple queries and thus
       * multiple CSM's, they're all deduped and concatenated into a single list.
       */
      type: 'loader/documents'
      data: LoaderPayloads['documents']
    }

/**
 * Messages emitted by the preview-kit-compat package
 * @public
 */
export type PreviewKitMsg = {
  /**
   * Sends over the CSM reported documents in use on the page. If there are multiple queries and thus
   * multiple CSM's, they're all deduped and concatenated into a single list.
   */
  type: 'preview-kit/documents'
  data: {
    projectId: string
    dataset: string
    perspective: ClientPerspective
    documents: ContentSourceMapDocuments
  }
}

/**
 * Known Channel connection IDs
 * @public
 */
export type VisualEditingConnectionIds = 'presentation' | 'loaders' | 'overlays' | 'preview-kit'
