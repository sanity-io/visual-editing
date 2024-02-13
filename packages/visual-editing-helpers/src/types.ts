import type {
  ClientPerspective,
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
} from '@sanity/client'

export type { Path } from '@sanity/client/csm'

/**
 * @internal
 * client.fetch(query, params) => `${query}-${JSON.stringify(params)}`
 */
export type QueryCacheKey = `${string}-${string}`

/**
 * Data resolved from a Sanity node
 * @public
 */
export type SanityNode = {
  /** @deprecated */
  projectId?: string
  /** @deprecated */
  dataset?: string
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
  title?: string
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

/**@public */
export interface VisualEditingPayloads {
  documents: {
    projectId: string
    dataset: string
    perspective: ClientPerspective
    documents: ContentSourceMapDocuments
  }
  focus: SanityNode | SanityNodeLegacy
  meta: {
    title: string
  }
  navigate: HistoryUpdate
  toggle: {
    enabled: boolean
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

/** @public */
export interface LoaderPayloads {
  perspective: {
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
  documents: {
    projectId: string
    dataset: string
    perspective: ClientPerspective
    documents: ContentSourceMapDocuments
  }
  /**
   * Experimental new event, may be removed at any time
   */
  'revalidate-tags': {
    projectId: string
    dataset: string
    tags: [documentId: string, documentType: string, documentSlug?: string]
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
  | {
      /**
       * Experimental new event, may be removed at any time
       */
      type: 'loader/revalidate-tags'
      data: LoaderPayloads['revalidate-tags']
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
export type VisualEditingConnectionIds =
  | 'presentation'
  | 'loaders'
  | 'overlays'
  | 'preview-kit'
