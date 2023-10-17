import type {
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
} from '@sanity/client'

/**
 * @internal
 */
export type QueryCacheKey = `${string}-${string}`

/**
 * Data resolved from a Sanity node
 * @public
 */
export type SanityNode = {
  projectId: string
  dataset: string
  id: string
  path: string
  type?: string
  baseUrl: string
  tool?: string
  workspace?: string
}

/**
 * Data resolved from a (legacy) Sanity node
 * @public
 */
export type SanityNodeLegacy = {
  origin: string
  href: string
  data?: string
}

/**
 * Preview frame history update
 * @public
 */
export type HistoryUpdate = {
  type: 'push' | 'pop' | 'replace'
  url: string
}

/**
 * Messages emitted by the composer package
 * @public
 */
export type ComposerMsg =
  | {
      type: 'composer/focus'
      data: { id: string; path: string }
    }
  | {
      type: 'composer/blur'
      data: undefined
    }
  | {
      type: 'composer/navigate'
      data: HistoryUpdate
    }
  | {
      type: 'composer/toggleOverlay'
      data: undefined
    }

/**
 * Messages emitted by the overlays package
 * @public
 */
export type OverlayMsg =
  | {
      type: 'overlay/focus'
      data: SanityNode | SanityNodeLegacy
    }
  | {
      type: 'overlay/navigate'
      data: HistoryUpdate
    }
  | {
      type: 'overlay/toggle'
      data: {
        enabled: boolean
      }
    }

/**
 * Messages emitted by the loader packages
 * @public
 */
export type LoaderMsg =
  | {
      type: 'loader/query-change'
      data: {
        projectId: string
        dataset: string
        query: string
        params: QueryParams
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: any
        resultSourceMap?: ContentSourceMap
      }
    }
  | {
      type: 'loader/query-listen'
      data: {
        projectId: string
        dataset: string
        query: string
        params: QueryParams
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
        documents: ContentSourceMapDocuments
      }
    }

/**
 * Union type of visual editing related messages
 * @public
 */
export type VisualEditingMsg = ComposerMsg | LoaderMsg | OverlayMsg

/**
 * Known Channel connection IDs
 * @public
 */
export type VisualEditingConnectionIds = 'composer' | 'loaders' | 'overlays'
