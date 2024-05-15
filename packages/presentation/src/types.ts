import type {ClientPerspective, QueryParams} from '@sanity/client'
import type {
  PreviewUrlResolver,
  PreviewUrlResolverOptions,
} from '@sanity/preview-url-secret/define-preview-url'
import type {ComponentType} from 'react'
import type {Observable} from 'rxjs'
import type {SanityClient} from 'sanity'

import type {DocumentStore} from './internals'

export type {PreviewUrlResolver, PreviewUrlResolverOptions}

/**
 * Represents a document location
 * @typeParam title - Title of the document
 * @typeParam href - URL of the document location
 * @public
 */
export interface DocumentLocation {
  title: string
  href: string
}

/**
 * State for describing document locations or providing a message if no document
 * locations are unavailable
 * @typeParam locations - Array of document locations
 * @typeParam message - Message to display if locations are unavailable
 * @typeParam tone - Tone of the message
 * @public
 */
export interface DocumentLocationsState {
  locations?: DocumentLocation[]
  message?: string
  tone?: 'positive' | 'caution' | 'critical'
}

/**
 * @internal
 */
export type DocumentLocationsStatus = 'empty' | 'resolving' | 'resolved'

/**
 * Function used for advanced document location resolution
 * @param params - Object with document `id` and document `type` properties
 * @param context - Object with `documentStore` property for creating listenQuery subscriptions
 * @returns Document location state, optionally as an Observable, or null/undefined if no locations are available
 * @public
 */
export type DocumentLocationResolver = (
  params: {id: string; type: string},
  context: {documentStore: DocumentStore},
) =>
  | DocumentLocationsState
  | null
  | undefined
  | Observable<DocumentLocationsState | null | undefined>

export interface NavigatorOptions {
  minWidth?: number
  maxWidth?: number
  component: ComponentType
}

export type PreviewUrlOption = string | PreviewUrlResolver<SanityClient> | PreviewUrlResolverOptions

/**
 * Object of document location resolver definitions per document type
 * @public
 */
export type DocumentLocationResolvers = Record<
  string,
  DocumentLocationResolverObject | DocumentLocationsState
>

/**
 * Document location resolver object
 * @typeParam select - object for selecting document fields
 * @typeParam resolve - function that accepts a document with the selected fields and returns an optional document location state
 * @public
 */
export type DocumentLocationResolverObject<K extends string = string> = {
  select: Record<K, string>
  resolve: (value: Record<K, any> | null) => DocumentLocationsState | null | undefined | void
}

/**
 * @internal
 */
export interface DocumentResolverContext {
  origin: string | undefined
  params: Record<string, string>
  path: string
}

/**
 * @internal
 */
export type ContextFn<T> = (context: DocumentResolverContext) => T

/**
 * Object for resolving a document for a given route pattern
 * @public
 */
export type DocumentResolver =
  | {
      route: string | Array<string>
      type: string
      filter?: never
      params?: never
      resolve?: never
    }
  | {
      route: string | Array<string>
      type?: never
      filter: ContextFn<string> | string
      params?: ContextFn<Record<string, string>> | Record<string, string>
      resolve?: never
    }
  | {
      route: string | Array<string>
      type?: never
      filter?: never
      params?: never
      resolve: ContextFn<
        | {
            filter: string
            params?: Record<string, string>
          }
        | undefined
      >
    }

export interface PresentationPluginOptions {
  devMode?: boolean | (() => boolean)
  icon?: ComponentType
  name?: string
  title?: string
  /**
   * @deprecated use `resolve.locations` instead
   */
  locate?: DocumentLocationResolver
  resolve?: {
    mainDocuments?: DocumentResolver[]
    locations?: DocumentLocationResolvers | DocumentLocationResolver
  }
  previewUrl: PreviewUrlOption
  components?: {
    unstable_navigator?: NavigatorOptions
  }
  /**
   * @deprecated this feature flag is no longer needed
   */
  unstable_showUnsafeShareUrl?: boolean
}

export interface PresentationStateParams {
  type?: string
  id?: string
  path?: string
}

export interface StructureDocumentPaneParams {
  inspect?: string
  path?: string
  rev?: string
  prefersLatestPublished?: string
  since?: string
  template?: string
  templateParams?: string
  view?: string

  // assist
  pathKey?: string
  instruction?: string

  // comments
  comment?: string
}

export interface PresentationParams extends PresentationStateParams, StructureDocumentPaneParams {
  id?: string
  preview?: string
  perspective?: string
  viewport?: string
}

export interface PresentationSearchParams extends StructureDocumentPaneParams {
  preview?: string
  perspective?: string
  viewport?: string
}

export type PresentationNavigate = (
  nextState: PresentationStateParams,
  nextSearchState?: PresentationSearchParams,
  forceReplace?: boolean,
) => void

/** @internal */
export type LiveQueriesState = Record<string, LiveQueriesStateValue>

/** @internal */
export interface LiveQueriesStateValue {
  query: string
  params: QueryParams
  perspective: ClientPerspective
  receivedAt: number
  /**
   * If false it means the query can't safely be garbage collected,
   * as older versions of @sanity/core-loader doesn't fire listen events
   * on an interval.
   */
  heartbeat: number | false
}

/** @internal */
export interface FrameState {
  title: string | undefined
  url: string | undefined
}

/**
 * @internal
 */
export interface MainDocument {
  _id: string
  _type: string
}

/**
 * @internal
 */
export interface MainDocumentState {
  path: string
  document: MainDocument | undefined
}
