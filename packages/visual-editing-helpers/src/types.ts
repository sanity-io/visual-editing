import type {
  ClientPerspective,
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
} from '@sanity/client'

/**
 * Extracted from `import {Path} from 'sanity'`
 * @internal
 */
export type Path = (
  | string
  | number
  | {
      _key: string
    }
  | [number | '', number | '']
)[]

/**
 * @internal
 * client.fetch(query, params) => `${query}-${JSON.stringify(params)}`
 */
export type QueryCacheKey = `${string}-${string}`
// export type QueryCacheKey = `${ClientPerspective}-${string}-${string}`

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
 * Messages emitted by the presentation package
 * @public
 */
export type PresentationMsg =
  | {
      type: 'presentation/focus'
      data: { id: string; path: string }
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
      type: 'loader/query-listen'
      data: {
        projectId: string
        dataset: string
        perspective: ClientPerspective
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
        perspective: ClientPerspective
        documents: ContentSourceMapDocuments
      }
    }

/**
 * Union type of visual editing related messages
 * @public
 */
export type VisualEditingMsg = PresentationMsg | LoaderMsg | OverlayMsg

/**
 * Known Channel connection IDs
 * @public
 */
export type VisualEditingConnectionIds = 'presentation' | 'loaders' | 'overlays'
