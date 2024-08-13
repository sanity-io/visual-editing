import type {
  ClientPerspective,
  ContentSourceMap,
  ContentSourceMapDocuments,
  MutationEvent,
  QueryParams,
  ReconnectEvent,
  WelcomeEvent,
} from '@sanity/client'
import type {PreviewValue, SanityDocument} from 'sanity'

import type {SanityNode, SanityStegaNode} from './overlays'
import type {ResolvedSchemaTypeMap, SchemaType} from './schema'

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
      type: 'focus'
      data: {id: string; path: string}
    }
  | {
      type: 'blur'
      data: undefined
    }
  | {
      type: 'navigate'
      data: HistoryUpdate
    }
  | {
      type: 'toggleOverlay'
      data: undefined
    }
  | {
      type: 'refresh'
      data: HistoryRefresh
    }
  | {
      type: 'perspective'
      data: {
        perspective: ClientPerspective
      }
    }
  | {
      type: 'schema'
      data: {
        schema: SchemaType[]
      }
    }
  | {
      type: 'previewSnapshots'
      data: {
        snapshots: Array<PreviewValue & {_id: string}>
      }
    }
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
      }
    }
  | {
      type: 'query-listen'
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
      type: 'mutation'
      data: {
        mutation: MutationEvent
      }
    }
  | {
      type: 'snapshot/event'
      data: {
        event: ReconnectEvent | WelcomeEvent | MutationEvent
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
  schemaTypes: {
    paths: UnresolvedPath[]
  }
  patch: {
    id: string
    type: string
    patch: Record<string, unknown>
  }
  mutate: {
    transactionId: string | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutations: any[]
  }
  snapshot: {
    documentId: string
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
      type: 'focus'
      data: VisualEditingPayloads['focus']
    }
  | {
      type: 'navigate'
      data: VisualEditingPayloads['navigate']
    }
  | {
      type: 'toggle'
      data: VisualEditingPayloads['toggle']
    }
  | {
      type: 'meta'
      data: VisualEditingPayloads['meta']
    }
  | {
      type: 'documents'
      data: VisualEditingPayloads['documents']
    }
  | {
      type: 'refreshing'
      data: VisualEditingPayloads['refresh']
    }
  | {
      type: 'refreshed'
      data: VisualEditingPayloads['refresh']
    }
  | {
      type: 'schemaTypes'
      data: VisualEditingPayloads['schemaTypes']
      response: {
        types: ResolvedSchemaTypeMap
      }
    }
  | {
      type: 'mutate'
      data: VisualEditingPayloads['mutate']
    }
  | {
      type: 'snapshots/snapshot'
      data: VisualEditingPayloads['snapshot']
      response: {
        snapshot: SanityDocument | undefined
      }
    }
  | {
      type: 'snapshots/observe'
      data: {
        documentIds: string[]
      }
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
      type: 'perspective'
      data: LoaderPayloads['perspective']
    }
  | {
      type: 'query-change'
      data: LoaderPayloads['query-change']
    }
  | {
      type: 'query-listen'
      data: LoaderPayloads['query-listen']
    }
  | {
      /**
       * Sends over the CSM reported documents in use on the page. If there are multiple queries and thus
       * multiple CSM's, they're all deduped and concatenated into a single list.
       */
      type: 'documents'
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
  type: 'documents'
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

/** @internal */
export interface PresentationAPI {
  id: 'presentation'
  sends: PresentationMsg
  nodes:
    | {
        id: 'visual-editing'
        message: VisualEditingMsg
      }
    | {
        id: 'loaders'
        message: LoaderMsg
      }
    | {
        id: 'preview-kit'
        message: PreviewKitMsg
      }
}

/** @internal */
export interface VisualEditingAPI {
  id: 'visual-editing'
  controllerId: 'presentation'
  sends: VisualEditingMsg
  receives: PresentationMsg
}

/** @internal */
export interface PreviewKitAPI {
  id: 'preview-kit'
  controllerId: 'presentation'
  sends: PreviewKitMsg
  receives: PresentationMsg
}

/** @internal */
export interface LoadersAPI {
  id: 'loaders'
  controllerId: 'presentation'
  sends: LoaderMsg
  receives: PresentationMsg
}
