import type {
  ClientPerspective,
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
} from '@sanity/client'
import type {StudioPathLike} from '@sanity/client/csm'

export type {Path} from '@sanity/client/csm'

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
  baseUrl: string
  dataset?: string
  id: string
  isDraft?: string
  path: string
  projectId?: string
  tool?: string
  type?: string
  workspace?: string
}

/**
 * Data resolved from a Sanity Stega node
 * @public
 */
export type SanityStegaNode = {
  origin: string
  href: string
  data?: unknown
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

/**
 * Helper
 * @internal
 */
export type WithRequired<T, K extends keyof T> = T & {[P in K]-?: T[P]}

/**
 * The metadata that can be embedded in a data attribute.
 * All values are marked optional in the base type as they can be provided incrementally using the `createDataAttribute` function.
 * @public
 */
export interface CreateDataAttributeProps {
  /** The studio base URL, optional */
  baseUrl?: string
  /** The dataset, optional */
  dataset?: string
  /** The document ID, required */
  id?: string
  /** The field path, required */
  path?: StudioPathLike
  /** The project ID, optional */
  projectId?: string
  /** The studio tool name, optional */
  tool?: string
  /** The document type, required */
  type?: string
  /** The studio workspace, optional */
  workspace?: string
}

/**
 * @public
 */
export type CreateDataAttribute<T extends CreateDataAttributeProps> = (T extends WithRequired<
  CreateDataAttributeProps,
  'id' | 'type' | 'path'
>
  ? {
      /**
       * Returns a string representation of the data attribute
       * @param path - An optional path to concatenate with any existing path
       * @public
       */
      (path?: StudioPathLike): string
      /**
       * Returns a string representation of the data attribute
       * @public
       */
      toString(): string
    }
  : T extends WithRequired<CreateDataAttributeProps, 'id' | 'type'>
    ? /**
       * Returns a string representation of the data attribute
       * @param path - An optional path to concatenate with any existing path
       * @public
       */
      (path: StudioPathLike) => string
    : object) & {
  /**
   * Concatenate the current path with a new path
   * @param path - A path to concatenate with any existing path
   * @public
   */
  scope(path: StudioPathLike): CreateDataAttribute<T & {path: StudioPathLike}>
  /**
   * Combines the current props with additional props
   * @param props - New props to merge with any existing props
   * @public
   */
  combine: <U extends CreateDataAttributeProps>(props: U) => CreateDataAttribute<T & U>
}
