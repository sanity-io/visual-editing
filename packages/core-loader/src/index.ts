import type {
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import type { SanityStegaClient } from '@sanity/client/stega'
import { type Cache, createCache } from 'async-cache-dedupe'
import {
  atom,
  listenKeys,
  map,
  type MapStore,
  onMount,
  startTask,
} from 'nanostores'

import { createLiveModeStore } from './live-mode'
import { LiveModeState, QueryStoreState } from './types'

export type { MapStore }

export type * from './types'

export interface CreateQueryStoreOptions {
  client: SanityClient | SanityStegaClient
  /**
   * The origin that are allowed to connect to the overlay.
   * If left unspecified it will default to the current origin, and the Studio will have to be hosted by the same origin.
   * @example `https://my.sanity.studio`
   * @defaultValue `location.origin`
   */
  allowStudioOrigin: string
}

export interface QueryStore {
  createFetcherStore: <Response = unknown, Error = unknown>(
    query: string,
    params?: QueryParams,
    initialData?: Response,
    initialSourceMap?: ContentSourceMap,
  ) => MapStore<QueryStoreState<Response, Error>>
  $LiveMode: MapStore<LiveModeState>
  unstable__cache: Cache & {
    fetch: <Response>(key: string) => Promise<{
      result: Response
      resultSourceMap: ContentSourceMap | undefined
    }>
  }
}

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const { client, allowStudioOrigin } = options
  const { projectId, dataset, resultSourceMap, perspective } = client.config()
  if (!projectId) throw new Error('Missing projectId')
  if (!dataset) throw new Error('Missing dataset')
  // const $perspective = atom(client.config().perspective || 'previewDrafts')
  // const $token = atom(token || '')
  if (!resultSourceMap) {
    // Enable source maps if not already enabled
    client.config({ resultSourceMap: 'withKeyArraySelector' })
  }
  // Handle the perspective setting, it has to be 'published' or 'previewDrafts'
  if (perspective !== 'published' && perspective !== 'previewDrafts') {
    client.config({ perspective: 'published' })
  }

  const $perspective = atom(client.config().perspective!)
  // const $queries = map<Record<string, QueryStoreState<any, any>>>()

  const { $LiveMode, runLiveFetch } = createLiveModeStore({
    client,
    allowStudioOrigin,
    $perspective,
  })

  const cache = createCache().define('fetch', async (key: string) => {
    const { query, params = {} } = JSON.parse(key)
    const { result, resultSourceMap } = await client.fetch(query, params, {
      filterResponse: false,
    })
    return { result, resultSourceMap }
  })

  const runFetch = async <Response, Error>(
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<Response, Error>>,
    controller: AbortController,
  ) => {
    if (controller.signal.aborted) return
    if ($LiveMode.get().connected) {
      return runLiveFetch<Response, Error>(query, params, $fetch, controller)
    }
    const finishTask = startTask()
    try {
      $fetch.setKey('loading', true)
      $fetch.setKey('error', undefined)
      const response = await cache.fetch(JSON.stringify({ query, params }))
      if (controller.signal.aborted) return
      $fetch.setKey('data', response.result)
      $fetch.setKey('sourceMap', response.resultSourceMap)
    } catch (error: unknown) {
      $fetch.setKey('error', error as Error)
    } finally {
      $fetch.setKey('loading', false)
      finishTask()
    }
  }

  // const [
  //   _createFetcherStore,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _createMutatorStore,
  //   { mutateCache },
  // ] = nanoquery({
  //   // dedupeTime: DEDUPE_TIME,
  //   // refetchOnFocus: REFETCH_ON_FOCUS,
  //   // refetchOnReconnect: REFETCH_ON_RECONNECT,
  //   // refetchInterval: REFETCH_INTERVAL,
  //   fetcher: async (
  //     ...keys: (string | number)[]
  //   ): Promise<{
  //     query: string
  //     params: any
  //     result: Response
  //     resultSourceMap?: ContentSourceMap
  //   }> => {
  //     // @TODO we might need to write our own `@nanostores/query` as our needs doesn't neetly fit into its API
  //     // if (cache.has(keys.join(''))) return cache.get(keys.join(''))

  //     const [query, _params] = keys as [query: string, _params?: string]
  //     const params = _params ? JSON.parse(_params) : {}

  //     if ($LiveMode.get().enabled) {
  //       if (!channel) throw new Error('No channel')
  //       channel.send('loader/query-listen', {
  //         projectId,
  //         dataset,
  //         perspective: $perspective.get(),
  //         query,
  //         params,
  //       })
  //     }

  //     const { result, resultSourceMap } = await client.fetch(query, params, {
  //       filterResponse: false,
  //       // token: $token.get(),
  //       // perspective: $perspective.get(),
  //     })
  //     // console.log('fetcher', { result, resultSourceMap, ...rest })

  //     if ($LiveMode.get().enabled) {
  //       $resultSourceMapDocuments.setKey(
  //         getQueryCacheKey(query, params),
  //         resultSourceMap?.documents,
  //       )
  //     }

  //     return { query, params, result, resultSourceMap }
  //   },
  // })

  const createFetcherStore: QueryStore['createFetcherStore'] = <
    Response,
    Error,
  >(
    query: string,
    params: QueryParams = {},
    initialData?: Response,
    initialSourceMap?: ContentSourceMap,
  ): MapStore<QueryStoreState<Response, Error>> => {
    const $fetch = map<QueryStoreState<Response, Error>>({
      loading: true,
      error: undefined,
      data: initialData,
      sourceMap: initialSourceMap,
    })

    onMount($fetch, () => {
      let controller = new AbortController()
      // const key = JSON.stringify({ query, params })
      // const value = $queries.get()[key]

      // const unsub = listenKeys($queries, [key], (value, changed) => {
      //   console.log('listenKeys', {value, changed})
      // })
      runFetch<Response, Error>(query, params, $fetch, controller)
      const unListenKeys = listenKeys(
        $LiveMode,
        ['enabled', 'connected'],
        () => {
          controller.abort()
          controller = new AbortController()
          runFetch<Response, Error>(query, params, $fetch, controller)
        },
      )
      return () => {
        unListenKeys()
        controller.abort()
      }
    })

    return $fetch
  }
  // const createFetcherStore: typeof _createFetcherStore = (keys, settings) => {
  //   const $fetch = _createFetcherStore(keys, settings)

  //   onStart($fetch, () => {
  //     const [query, _params] = keys as [query: string, _params?: string]
  //     const params = _params ? JSON.parse(_params) : {}
  //     const key = getQueryCacheKey(query, params)
  //     const value = $queriesInUse.get()[key]
  //     const listeners = value?.listeners || 0
  //     $queriesInUse.setKey(key, {
  //       ...value,
  //       query,
  //       params,
  //       listeners: listeners + 1,
  //     })
  //   })
  //   onStop($fetch, () => {
  //     const [query, _params] = keys as [query: string, _params?: string]
  //     const params = _params ? JSON.parse(_params) : {}
  //     const key = getQueryCacheKey(query, params)
  //     const value = $queriesInUse.get()[key]
  //     const listeners = value?.listeners || 1
  //     if (listeners > 1) {
  //       $queriesInUse.setKey(key, {
  //         ...value,
  //         query,
  //         params,
  //         listeners: listeners - 1,
  //       })
  //     } else {
  //       $queriesInUse.setKey(key, undefined)
  //     }
  //   })

  //   // onSet($fetch, ({ newValue, ...rest }) => {
  //   //   console.log('$fetch onSet', { newValue, ...rest })
  //   // })

  //   return $fetch
  // }

  return { createFetcherStore, $LiveMode, unstable__cache: cache }
}
