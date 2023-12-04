import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import type { StudioPathLike } from '@sanity/client/csm'
import type { SanityStegaClient, StegaConfig } from '@sanity/client/stega'
import type { MapStore } from 'nanostores'

export type { ContentSourceMap, MapStore, QueryParams }

/** @public */
export interface QueryStoreState<QueryResponseResult, QueryResponseError> {
  loading: boolean
  error?: QueryResponseError
  data?: QueryResponseResult
  sourceMap?: ContentSourceMap
  perspective?: ClientPerspective
}

/**
 * Creates a encoded payload suitable for passing to a `data-sanity` attribute, which are used by `@sanity/overlays`
 * @public
 */
export type EncodeDataAttribute<QueryResponseResult = unknown> = (
  result: QueryResponseResult,
  sourceMap: ContentSourceMap | undefined,
  studioUrl: Exclude<StegaConfig['studioUrl'], undefined>,
  path: StudioPathLike,
) => string | undefined

/** @public */
export interface EnableLiveModeOptions {
  /**
   * The origin that are allowed to connect to the loader.
   * If left unspecified it will default to the current origin, and the Studio will have to be hosted by the same origin.
   * @example 'https://my.sanity.studio'
   * @example location.origin
   * @example 'same-origin'
   * @defaultValue 'same-origin'
   */
  allowStudioOrigin:
    | 'same-origin'
    | `https://${string}`
    | `http://${string}`
    | string
  /**
   * You may use any client that is an `instanceof SanityClient` or `instanceof SanityStegaClient`.
   * Required when `ssr: true`, optional otherwise.
   * @example `import {createClient} from '@sanity/client'`
   * @example `import {createClient} from '@sanity/client/stega'`
   * @example `import {createClient} from '@sanity/preview-kit/client'`
   * @example `import {createClient} from 'next-sanity'`
   */
  client?: SanityClient | SanityStegaClient
  /**
   * Fires when a connection is established to a parent Studio window.
   */
  onConnect?: () => void
  /**
   * Fires when a connection is established to a parent Studio window and then lost.
   */
  onDisconnect?: () => void
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
      'data' | 'sourceMap' | 'perspective'
    >,
  ) => QueryStoreState<QueryResponseResult, QueryResponseError>
  fetch: <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>>,
    controller: AbortController,
  ) => void
}
