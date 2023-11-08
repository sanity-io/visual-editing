import type {
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import type { SanityStegaClient } from '@sanity/client/stega'
import { type Cache, createCache } from 'async-cache-dedupe'
import {
  atom,
  computed,
  map,
  type MapStore,
  onMount,
  startTask,
} from 'nanostores'

import { defineEnableLiveMode } from './live-mode'
import type { EnableLiveMode, Fetcher, QueryStoreState } from './types'

export type { MapStore }

export type * from './types'
export type { WritableAtom } from 'nanostores'

/** @public */
export interface CreateQueryStoreOptions {
  client: SanityClient | SanityStegaClient
}

/** @public */
export interface QueryStore {
  createFetcherStore: <Response = unknown, Error = unknown>(
    query: string,
    params?: QueryParams,
    initialData?: Response,
    initialSourceMap?: ContentSourceMap,
  ) => MapStore<QueryStoreState<Response, Error>>
  enableLiveMode: EnableLiveMode
  /** @internal */
  unstable__cache: Cache & {
    fetch: <Response>(key: string) => Promise<{
      result: Response
      resultSourceMap: ContentSourceMap | undefined
    }>
  }
}

/** @public */
export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const { client } = options
  const { projectId, dataset, resultSourceMap, perspective } = client.config()
  if (!projectId) throw new Error('Missing projectId')
  if (!dataset) throw new Error('Missing dataset')
  if (!resultSourceMap) {
    // Enable source maps if not already enabled
    client.config({ resultSourceMap: 'withKeyArraySelector' })
  }
  // Handle the perspective setting, it has to be 'published' or 'previewDrafts'
  if (perspective !== 'published' && perspective !== 'previewDrafts') {
    client.config({ perspective: 'published' })
  }

  const cache = createCache().define('fetch', async (key: string) => {
    const { query, params = {} } = JSON.parse(key)
    const { result, resultSourceMap } = await client.fetch(query, params, {
      filterResponse: false,
    })
    return { result, resultSourceMap }
  })

  const $defaultFetcher = atom<Fetcher>({
    hydrate: (_query, _params, initialData, initialSourceMap) => ({
      loading: true,
      error: undefined,
      data: initialData,
      sourceMap: initialSourceMap,
    }),
    fetch: (query, params, $fetch, controller) => {
      if (controller.signal.aborted) return

      const finishTask = startTask()

      $fetch.setKey('loading', true)
      $fetch.setKey('error', undefined)
      cache
        .fetch(JSON.stringify({ query, params }))
        .then((response) => {
          if (controller.signal.aborted) return
          $fetch.setKey('data', response.result)
          $fetch.setKey('sourceMap', response.resultSourceMap)
        })
        .catch((reason) => {
          $fetch.setKey('error', reason)
        })
        .finally(() => {
          $fetch.setKey('loading', false)
          finishTask()
        })
    },
  })
  const $liveModeFetcher = atom<Fetcher | undefined>(undefined)
  const $fetcher = computed(
    [$liveModeFetcher, $defaultFetcher],
    (liveModeFetcher, defaultFetcher) => liveModeFetcher || defaultFetcher,
  )

  const enableLiveMode = defineEnableLiveMode({
    client,
    setFetcher: (fetcher) => {
      $liveModeFetcher.set(fetcher)
      return () => $liveModeFetcher.set(undefined)
    },
  })

  const createFetcherStore: QueryStore['createFetcherStore'] = <
    Response,
    Error,
  >(
    query: string,
    params: QueryParams = {},
    initialData?: Response,
    initialSourceMap?: ContentSourceMap,
  ): MapStore<QueryStoreState<Response, Error>> => {
    const $fetch = map<QueryStoreState<Response, Error>>(
      $fetcher.get().hydrate(query, params, initialData, initialSourceMap),
    )

    onMount($fetch, () => {
      const unsubscribe = $fetcher.subscribe((fetcher) => {
        const controller = new AbortController()
        fetcher.fetch(query, params, $fetch, controller)
      })

      return () => {
        unsubscribe()
      }
    })

    return $fetch
  }

  return { createFetcherStore, enableLiveMode, unstable__cache: cache }
}
