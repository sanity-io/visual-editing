import type {
  ClientParams,
  ClientPerspective,
  ClientReturn,
  ContentSourceMap,
  QueryParams,
  QueryWithoutParams,
} from '@sanity/client'
import type {SanityClientLike} from '@sanity/visual-editing-types'
import type {MapStore} from 'nanostores'

export type {ContentSourceMap, MapStore, QueryParams}

/**
 * The result type for a query of type `QueryString`.
 *
 * A query carrying a `__groqResult` brand, such as the default export of a `.groq` file
 * imported through `@sanity-labs/groq-content-mapper`, resolves to the branded result through
 * `ClientReturn` from `@sanity/client`. Any other query resolves to `Fallback`, so unbranded
 * queries type exactly as they did before the brand existed, including queries registered in
 * `SanityQueries`.
 *
 * @remarks
 * Reading the brand is experimental and follows `ClientReturn` in `@sanity/client`.
 *
 * @experimental
 * @public
 */
export type BrandedQueryResult<
  QueryString extends string,
  Fallback = unknown,
> = QueryString extends {readonly __groqResult?: unknown}
  ? ClientReturn<QueryString, Fallback>
  : Fallback

/**
 * The params type accepted alongside a query of type `QueryString`. Params passed with a query
 * carrying a `__groqParams` brand are checked against it, other queries accept any
 * `QueryParams`. Leaving params out, or passing `{}`, is accepted for every query.
 *
 * @experimental
 * @public
 */
export type BrandedQueryParams<QueryString extends string> =
  | ClientParams<QueryString>
  | QueryWithoutParams
export type {
  SanityClientLike,
  SanityClientLikeConfig,
  SanityClientLikeQueryOptions,
} from '@sanity/visual-editing-types'

/** @public */
export interface QueryStoreState<QueryResponseResult, QueryResponseError> {
  loading: boolean
  error?: QueryResponseError
  data?: QueryResponseResult
  sourceMap?: ContentSourceMap
  perspective?: ClientPerspective
  variant?: string
}

/**
 * Creates a encoded payload suitable for passing to a `data-sanity` attribute, which are used by `@sanity/visual-editing`
 * @public
 */
export type EncodeDataAttribute<QueryResponseResult = unknown> = (
  result: QueryResponseResult,
  sourceMap: ContentSourceMap | undefined,
  studioUrl:
    | Exclude<import('@sanity/client/stega').StegaConfig['studioUrl'], undefined>
    | undefined,
  path: import('@sanity/client/csm').StudioPathLike,
) => string | undefined

/** @public */
export interface EnableLiveModeOptions {
  /**
   * @deprecated -- no longer needed
   */
  allowStudioOrigin?: 'same-origin' | `https://${string}` | `http://${string}` | string
  /**
   * Required when `ssr: true`, optional otherwise.
   * @example `import {createClient} from '@sanity/client'`
   * @example `import {createClient} from '@sanity/client/stega'`
   * @example `import {createClient} from '@sanity/preview-kit/client'`
   * @example `import {createClient} from 'next-sanity'`
   */
  client?: SanityClientLike
  /**
   * Fires when a connection is established to a parent Studio window.
   */
  onConnect?: () => void
  /**
   * Fires when a connection is established to a parent Studio window and then lost.
   */
  onDisconnect?: () => void
  /**
   * Fires when the perspective changes in the Studio, allowing you to persist the change to a session cookie if needed
   */
  onPerspective?: (perspective: Exclude<ClientPerspective, 'raw'>) => void
  /**
   * Fires when the variant changes in the Studio, allowing you to persist the change to a session cookie if needed
   */
  onVariant?: (variant: string | undefined) => void
}

/** @public */
export type EnableLiveMode = (options: EnableLiveModeOptions) => () => void

/** @internal */
export type SetFetcher = (fetcher: Fetcher) => () => void

/** @internal */
export interface Fetcher {
  hydrate: <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams,
    initial?: Pick<
      QueryStoreState<QueryResponseResult, QueryResponseError>,
      'data' | 'sourceMap' | 'perspective' | 'variant'
    >,
  ) => QueryStoreState<QueryResponseResult, QueryResponseError>
  fetch: <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>>,
    controller: AbortController,
  ) => void
}
