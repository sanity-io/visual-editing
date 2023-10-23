import { type FetcherStoreCreator, nanoquery } from '@nanostores/query'
import type {
  ContentSourceMap,
  ContentSourceMapDocuments,
  QueryParams,
  SanityClient,
} from '@sanity/client'
//  import type { ChannelEventHandler, ChannelMsg, ChannelReturns } from 'channels'
import { ChannelReturns, createChannel } from 'channels'
import {
  atom,
  computed,
  listenKeys,
  map,
  type MapStore,
  onMount,
  onStart,
  onStop,
} from 'nanostores'
import {
  getQueryCacheKey,
  type QueryCacheKey,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

export type { FetcherStore } from '@nanostores/query'

export interface CreateQueryStoreOptions {
  client: SanityClient
  studioUrl: string
}

// // @TODO move this into the options somehow
// const DEDUPE_TIME = 4000 // 4s
// const REFETCH_ON_FOCUS = true // false
// const REFETCH_ON_RECONNECT = true // false
// // const REFETCH_INTERVAL = 10000 // 0
// // @TODO temporarily very high
// const REFETCH_INTERVAL = 1000

export interface QueryStoreFetcherData<Response = unknown> {
  query: string
  params: QueryParams
  result: Response
  resultSourceMap?: ContentSourceMap
}

export interface LiveModeState {
  enabled: boolean
  connected: boolean
}

export interface QueryStore {
  createFetcherStore: FetcherStoreCreator<QueryStoreFetcherData>
  $LiveMode: MapStore<LiveModeState>
}

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const { client, studioUrl } = options
  const { projectId, dataset, resultSourceMap } = client.config()
  if (!projectId) throw new Error('Missing projectId')
  if (!dataset) throw new Error('Missing dataset')
  // const $perspective = atom(client.config().perspective || 'previewDrafts')
  // const $token = atom(token || '')
  if (!resultSourceMap) {
    // Enable source maps if not already enabled
    client.config({ resultSourceMap: 'withKeyArraySelector' })
  }

  const initialLiveMode = {
    enabled: false,
    connected: false,
  } satisfies LiveModeState
  const $LiveMode = map<LiveModeState>(initialLiveMode)
  const $resultSourceMapDocuments = map<
    Record<QueryCacheKey, ContentSourceMapDocuments | undefined>
  >({})

  let channel: ChannelReturns<VisualEditingMsg> | null = null

  const cache = new Map<string, any>()
  const [
    _createFetcherStore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createMutatorStore,
    { mutateCache },
  ] = nanoquery({
    // dedupeTime: DEDUPE_TIME,
    // refetchOnFocus: REFETCH_ON_FOCUS,
    // refetchOnReconnect: REFETCH_ON_RECONNECT,
    // refetchInterval: REFETCH_INTERVAL,
    cache,
    fetcher: async (
      ...keys: (string | number)[]
    ): Promise<{
      query: string
      params: any
      result: Response
      resultSourceMap?: ContentSourceMap
    }> => {
      // @TODO we might need to write our own `@nanostores/query` as our needs doesn't neetly fit into its API
      if (cache.has(keys.join(''))) return cache.get(keys.join(''))

      const [query, _params] = keys as [query: string, _params?: string]
      const params = _params ? JSON.parse(_params) : {}

      if ($LiveMode.get().enabled) {
        if (!channel) throw new Error('No channel')
        channel.send('loader/query-listen', {
          projectId,
          dataset,
          query,
          params,
        })
      }

      const { result, resultSourceMap } = await client.fetch(query, params, {
        filterResponse: false,
        // token: $token.get(),
        // perspective: $perspective.get(),
      })
      // console.log('fetcher', { result, resultSourceMap, ...rest })

      if ($LiveMode.get().enabled) {
        $resultSourceMapDocuments.setKey(
          getQueryCacheKey(query, params),
          resultSourceMap?.documents,
        )
      }

      return { query, params, result, resultSourceMap }
    },
  })

  const $queriesInUse = map<
    Record<
      string,
      { query: string; params: QueryParams; listeners: number } | undefined
    >
  >({})
  const $documentsInUse = computed(
    [$resultSourceMapDocuments, $queriesInUse],
    (resultSourceMapDocuments, _queriesInUse) => {
      const queriesInUse = Object.values(_queriesInUse).filter((snapshot) =>
        snapshot?.listeners ? snapshot.listeners > 0 : false,
      ) as { query: string; params: QueryParams }[]
      const documentsOnPage: ContentSourceMapDocuments = []
      for (const { query, params } of queriesInUse) {
        const key = getQueryCacheKey(query, params)
        if (resultSourceMapDocuments[key]) {
          documentsOnPage.push(...resultSourceMapDocuments[key]!)
        }
      }

      return documentsOnPage
    },
  )

  const createFetcherStore: typeof _createFetcherStore = (keys, settings) => {
    const $fetch = _createFetcherStore(keys, settings)

    onStart($fetch, () => {
      const [query, _params] = keys as [query: string, _params?: string]
      const params = _params ? JSON.parse(_params) : {}
      const key = getQueryCacheKey(query, params)
      const value = $queriesInUse.get()[key]
      const listeners = value?.listeners || 0
      $queriesInUse.setKey(key, {
        ...value,
        query,
        params,
        listeners: listeners + 1,
      })
    })
    onStop($fetch, () => {
      const [query, _params] = keys as [query: string, _params?: string]
      const params = _params ? JSON.parse(_params) : {}
      const key = getQueryCacheKey(query, params)
      const value = $queriesInUse.get()[key]
      const listeners = value?.listeners || 1
      if (listeners > 1) {
        $queriesInUse.setKey(key, {
          ...value,
          query,
          params,
          listeners: listeners - 1,
        })
      } else {
        $queriesInUse.setKey(key, undefined)
      }
    })

    // onSet($fetch, ({ newValue, ...rest }) => {
    //   console.log('$fetch onSet', { newValue, ...rest })
    // })

    return $fetch
  }

  const $shouldPong = atom<boolean>(false)
  onMount($LiveMode, () => {
    $LiveMode.setKey('enabled', true)
    channel = createChannel<VisualEditingMsg>({
      id: 'loaders' satisfies VisualEditingConnectionIds,
      onConnect: () => {
        $LiveMode.setKey('connected', true)
      },
      onDisconnect: () => {
        $LiveMode.setKey('connected', false)
      },
      connections: [
        {
          target: parent,
          targetOrigin: studioUrl,
          id: 'composer' satisfies VisualEditingConnectionIds,
        },
      ],
      handler: (type, data) => {
        if (
          type === 'loader/query-change' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          const cacheKey = [data.query, JSON.stringify(data.params)].join('')
          const prevCache = cache.has(cacheKey) ? cache.get(cacheKey) : {}
          mutateCache(cacheKey, {
            query: data.query,
            params: data.params,
            result: data.result,
            // @TODO workaround limitation in live queries not sending source maps
            resultSourceMap: data.resultSourceMap || prevCache.resultSourceMap,
          })
        }
        if (type === 'loader/ping') {
          $shouldPong.set(true)
        }
      },
    })
    const unlistenPong = $shouldPong.subscribe((shouldPong) => {
      if (channel && shouldPong) {
        channel.send('loader/pong', undefined)
        $shouldPong.set(false)
      }
    })

    const unlistenConnection = listenKeys($LiveMode, ['connected'], () => {
      // @TODO handle reconnection and invalidation
      // Revalidate if the connection status changes
      // invalidateKeys(() => true)
    })
    const unlistenQueries = $documentsInUse.subscribe((documents) => {
      if (!channel) {
        throw new Error('No channel')
      }
      channel.send('loader/documents', {
        projectId: projectId!,
        dataset: dataset!,
        documents: documents as ContentSourceMapDocuments,
      })
    })

    return () => {
      unlistenPong()
      unlistenQueries()
      unlistenConnection()
      $LiveMode.setKey('enabled', false)
      $LiveMode.setKey('connected', false)
      channel?.disconnect()
      channel = null
    }
  })
  // onSet($documentsOnPage)
  // onSet($token, () => invalidateKeys(() => true))

  // const $query = atom<string>('')
  // const $params = atom<any>({})
  // const sourceDocuments = new Map<string, any>()

  return { createFetcherStore, $LiveMode }
}
