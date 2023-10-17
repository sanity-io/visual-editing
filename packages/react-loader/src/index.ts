import { nanoquery } from '@nanostores/query'
import type {
  ContentSourceMap,
  ContentSourceMapDocuments,
  SanityClient,
} from '@sanity/client'
//  import type { ChannelEventHandler, ChannelMsg, ChannelReturns } from 'channels'
import { ChannelReturns, createChannel } from 'channels'
import { computed, listenKeys, map, onMount, onStart, onStop } from 'nanostores'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { QueryParams } from 'sanity'
import {
  getQueryCacheKey,
  type QueryCacheKey,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

export interface CreateQueryStoreOptions {
  client: SanityClient
  targetOrigin?: string
}

// // @TODO move this into the options somehow
// const DEDUPE_TIME = 4000 // 4s
// const REFETCH_ON_FOCUS = true // false
// const REFETCH_ON_RECONNECT = true // false
// // const REFETCH_INTERVAL = 10000 // 0
// // @TODO temporarily very high
// const REFETCH_INTERVAL = 1000

/**
 * Default tag to use, makes it easier to debug Content Lake requests
 */
export const DEFAULT_TAG = 'sanity.react-loader'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  useQuery: <Response>(
    query: string,
    params?: any,
  ) => {
    data?: Response
    sourceMap?: ContentSourceMap
    loading: boolean
    error: any
  }
  useLiveMode: () => void
} => {
  const { client: _client } = options
  const client = _client.withConfig({
    requestTagPrefix: options.client.config().requestTagPrefix || DEFAULT_TAG,
    resultSourceMap: true,
  })

  const { projectId, dataset } = client.config()
  if (!projectId) throw new Error('Missing projectId')
  if (!dataset) throw new Error('Missing dataset')
  // const $perspective = atom(client.config().perspective || 'previewDrafts')
  // const $token = atom(token || '')
  const initialFetch = { loading: true }
  const initialLiveMode = { enabled: false, connected: false }
  const $LiveMode = map(initialLiveMode)
  const $resultSourceMapDocuments = map<
    Record<QueryCacheKey, ContentSourceMapDocuments | undefined>
  >({})

  let channel: ChannelReturns<VisualEditingMsg> | null = null

  const cache = new Map<string, any>()
  const [
    _createFetcherStore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createMutatorStore,
    { invalidateKeys, mutateCache },
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

  onMount($LiveMode, () => {
    $LiveMode.setKey('enabled', true)

    channel = createChannel<VisualEditingMsg>({
      id: 'loaders' satisfies VisualEditingConnectionIds,
      onConnect: () => {
        if ($LiveMode.get().enabled) {
          $LiveMode.setKey('connected', true)
        }
      },
      onDisconnect: () => {
        $LiveMode.setKey('connected', false)
      },
      connections: [
        {
          target: parent,
          // @TODO using parent.origin fails if the parent is on a different origin
          // targetOrigin: parent.origin,
          targetOrigin: '*',
          sourceOrigin: location.origin,
          id: 'composer' satisfies VisualEditingConnectionIds,
        },
      ],
      handler: (type, data) => {
        if (
          type === 'loader/query-change' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          mutateCache([data.query, JSON.stringify(data.params)], {
            query: data.query,
            params: data.params,
            result: data.result,
            resultSourceMap: data.resultSourceMap,
          })
        }
      },
    })

    const unlistenConnection = listenKeys($LiveMode, ['connected'], () => {
      console.warn(
        "listenKeys($LiveMode, ['connected'] invalidateKeys",
        JSON.stringify([...cache]),
      )
      // Revalidate if the connection status changes
      invalidateKeys(() => true)
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

  const DEFAULT_PARAMS = {}
  const useQuery = <Response>(
    query: string,
    params: any = DEFAULT_PARAMS,
  ): {
    data?: Response
    sourceMap?: ContentSourceMap
    loading: boolean
    refreshing: boolean
    error: any
  } => {
    const $params = useMemo(() => JSON.stringify(params), [params])
    const $fetch = useMemo(
      () => createFetcherStore([query, $params]),
      [query, $params],
    )
    const snapshot = useSyncExternalStore(
      useCallback((onStoreChange) => $fetch.listen(onStoreChange), [$fetch]),
      () => $fetch.get(),
      () => initialFetch as any,
    )
    const { data, loading, error } = snapshot
    return {
      data: (data as any)?.result,
      sourceMap: (data as any)?.resultSourceMap,
      loading: 'data' in snapshot ? false : loading,
      refreshing: loading,
      error,
    }
  }

  function useLiveMode(): { enabled: boolean; connected: boolean } {
    const store = useSyncExternalStore(
      useCallback((onStoreChange) => $LiveMode.listen(onStoreChange), []),
      () => $LiveMode.get(),
      () => initialLiveMode,
    )

    useEffect(() => {
      console.log('useLiveMode enabled', store.enabled)
    }, [store.enabled])
    useEffect(() => {
      console.log('useLiveMode connected', store.connected)
    }, [store.connected])

    return store
  }

  return { useQuery, useLiveMode }
}
