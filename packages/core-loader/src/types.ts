import type {
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import type { SanityStegaClient } from '@sanity/client/stega'
import type { MapStore } from 'nanostores'

export type { ContentSourceMap, MapStore, QueryParams }

/** @public */
export interface QueryStoreState<Response, Error> {
  loading: boolean
  error: Error | undefined
  data: Response | undefined
  sourceMap: ContentSourceMap | undefined
}

/** @public */
export interface EnableLiveModeOptions {
  /**
   * The origin that are allowed to connect to the loader.
   * If left unspecified it will default to the current origin, and the Studio will have to be hosted by the same origin.
   * @example `https://my.sanity.studio`
   * @defaultValue `location.origin`
   */
  allowStudioOrigin: string
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
  hydrate: <Response, Error>(
    query: string,
    params: QueryParams,
    initialData?: Response,
    initialSourceMap?: ContentSourceMap,
  ) => QueryStoreState<Response, Error>
  fetch: <Response, Error>(
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<Response, Error>>,
    controller: AbortController,
  ) => void
}
