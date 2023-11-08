import type { ContentSourceMap, QueryParams } from '@sanity/client'
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
