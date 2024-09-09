import type {
  ClientPerspective,
  ContentSourceMap,
  ContentSourceMapDocuments,
  MutationEvent,
  QueryParams,
  ReconnectEvent,
  SanityDocument,
  SyncTag,
  WelcomeEvent,
} from '@sanity/client'
import type {PreviewValue} from '@sanity/types'
import type {SanityNode, SanityStegaNode} from './overlays'
import type {ResolvedSchemaTypeMap, SchemaType, UnresolvedPath} from './schema'

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
 * @public
 */
export type VisualEditingControllerMsg =
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
      type: 'presentation/toggle-overlay'
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
      type: 'presentation/preview-snapshots'
      data: {
        snapshots: Array<PreviewValue & {_id: string}>
      }
    }
  | {
      type: 'presentation/snapshot-event'
      data: {
        event: ReconnectEvent | WelcomeEvent | MutationEvent
      }
    }

/**
 * @public
 */
export type VisualEditingNodeMsg =
  | {
      type: 'visual-editing/focus'
      data: SanityNode | SanityStegaNode
    }
  | {
      type: 'overlay/focus'
      data: SanityNode | SanityStegaNode
    }
  | {
      type: 'visual-editing/navigate'
      data: HistoryUpdate
    }
  | {
      type: 'overlay/navigate'
      data: HistoryUpdate
    }
  | {
      type: 'visual-editing/toggle'
      data: {
        enabled: boolean
      }
    }
  | {
      type: 'overlay/toggle'
      data: {
        enabled: boolean
      }
    }
  | {
      type: 'visual-editing/meta'
      data: {
        title: string
      }
    }
  | {
      type: 'visual-editing/documents'
      data: {
        projectId?: string
        dataset?: string
        perspective: ClientPerspective
        documents: ContentSourceMapDocuments
      }
    }
  | {
      type: 'visual-editing/refreshing'
      data: HistoryRefresh
    }
  | {
      type: 'visual-editing/refreshed'
      data: HistoryRefresh
    }
  | {
      type: 'visual-editing/schema-union-types'
      data: {
        paths: UnresolvedPath[]
      }
      response: {
        types: ResolvedSchemaTypeMap
      }
    }
  | {
      type: 'visual-editing/observe-documents'
      data: {
        documentIds: string[]
      }
    }
  | {
      type: 'visual-editing/fetch-snapshot'
      data: {
        documentId: string
      }
      response: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snapshot: SanityDocument<Record<string, any>> | undefined | void
      }
    }
  | {
      type: 'visual-editing/mutate'
      data: {
        transactionId: string | undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutations: any[]
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response: any
    }
  | {
      type: 'visual-editing/listen'
      data: undefined
    }
  | {
      type: 'visual-editing/unlisten'
      data: undefined
    }

/**
 * @public
 */
export type LoaderControllerMsg =
  | {
      type: 'loader/perspective'
      data: {
        projectId: string
        dataset: string
        perspective: ClientPerspective
      }
    }
  | {
      type: 'loader/query-change'
      data: {
        projectId: string
        dataset: string
        perspective: ClientPerspective
        query: string
        params: QueryParams
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: any
        resultSourceMap?: ContentSourceMap
        tags?: SyncTag[]
      }
    }

/**
 * @public
 */
export type LoaderNodeMsg =
  | {
      type: 'loader/query-listen'
      data: {
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
    }
  | {
      /**
       * Sends over the CSM reported documents in use on the page. If there are multiple queries and thus
       * multiple CSM's, they're all deduped and concatenated into a single list.
       */
      type: 'loader/documents'
      data: {
        projectId: string
        dataset: string
        perspective: ClientPerspective
        documents: ContentSourceMapDocuments
      }
    }
// | {
//     type: 'loader/fetch-preview-url-secret'
//     data: {
//       projectId: string
//       dataset: string
//     }
//     response: {
//       secret: string | null
//     }
//   }

/**
 * @public
 */
export type PreviewKitNodeMsg = {
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
