import type {
  ClientPerspective,
  ContentSourceMapDocuments,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import { ChannelReturns, createChannel } from 'channels'
import {
  computed,
  listenKeys,
  map,
  MapStore,
  onMount,
  WritableAtom,
  // startTask,
  // task,
} from 'nanostores'
import {
  getQueryCacheKey,
  QueryCacheKey,
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

import { LiveModeState, QueryStoreState } from '../types'

export interface CreateLiveModeStoreOptions {
  client: SanityClient
  studioUrl: string
  $perspective: WritableAtom<ClientPerspective>
}

export function createLiveModeStore(options: CreateLiveModeStoreOptions): {
  $LiveMode: MapStore<LiveModeState>
  runLiveFetch: <Response, Error>(
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<Response, Error>>,
    controller: AbortController,
  ) => Promise<void>
} {
  const { client, studioUrl, $perspective } = options
  const { projectId, dataset } = client.config()
  const $resultSourceMapDocuments = map<
    Record<QueryCacheKey, ContentSourceMapDocuments | undefined>
  >({})
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

  let channel: ChannelReturns<VisualEditingMsg> | null = null

  const initialLiveMode = {
    enabled: false,
    connected: false,
    studioOrigin: '',
  } satisfies LiveModeState
  const $LiveMode = map<LiveModeState>(initialLiveMode)

  const cache = new Map()

  onMount($LiveMode, () => {
    if (typeof document === 'undefined') return
    $LiveMode.setKey('enabled', true)
    const studioOrigin = new URL(studioUrl, location.origin).origin
    $LiveMode.setKey('studioOrigin', studioOrigin)
    channel = createChannel<VisualEditingMsg>({
      id: 'loaders' satisfies VisualEditingConnectionIds,
      onStatusUpdate(status) {
        if (status === 'connected') {
          $LiveMode.setKey('connected', true)
        } else if (status === 'disconnected' || status === 'unhealthy') {
          $LiveMode.setKey('connected', false)
        }
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
          type === 'loader/perspective' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          $perspective.set(data.perspective)
          updateLiveQueries()
        } else if (
          type === 'loader/query-change' &&
          data.projectId === projectId &&
          data.dataset === dataset
        ) {
          const { perspective, query, params } = data
          cache.set(JSON.stringify({ perspective, query, params }), data)
          updateLiveQueries()
        }
      },
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
        perspective: $perspective.get(),
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

  const liveQueries = new Set<{
    query: string
    params: QueryParams
    $fetch: MapStore<QueryStoreState<any, any>>
  }>()
  const addLiveQuery = (
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<any, any>>,
  ) => {
    const liveQuery = { query, params, $fetch }
    liveQueries.add(liveQuery)
    emitQueryListen()
    return () => {
      liveQueries.delete(liveQuery)
      emitQueryListen()
    }
  }
  const emitQueryListen = () => {
    if (!channel) {
      throw new Error('No channel')
    }
    const perspective = $perspective.get()
    for (const { query, params, $fetch } of liveQueries) {
      channel.send('loader/query-listen', {
        projectId: projectId!,
        dataset: dataset!,
        perspective,
        query,
        params,
      })
      $fetch.setKey('loading', true)
    }
  }
  function updateLiveQueries() {
    const perspective = $perspective.get()
    const documentsOnPage: ContentSourceMapDocuments = []
    // Loop over liveQueries and apply cache
    for (const { query, params, $fetch } of liveQueries) {
      const key = JSON.stringify({ perspective, query, params })
      const value = cache.get(key)
      if (value) {
        $fetch.setKey('data', value.result)
        $fetch.setKey('sourceMap', value.resultSourceMap)
        $fetch.setKey('loading', false)
        documentsOnPage.push(...(value.resultSourceMap?.documents ?? []))
      }
    }
    channel?.send('loader/documents', {
      projectId: projectId!,
      dataset: dataset!,
      perspective,
      documents: documentsOnPage,
    })
  }

  const runLiveFetch = async <Response, Error>(
    query: string,
    params: QueryParams,
    $fetch: MapStore<QueryStoreState<Response, Error>>,
    controller: AbortController,
  ) => {
    try {
      const removeLiveQuery = addLiveQuery(query, params, $fetch)
      controller.signal.addEventListener('abort', removeLiveQuery, {
        once: true,
      })
      updateLiveQueries()
      $fetch.setKey('error', undefined)
      if (controller.signal.aborted) return
    } catch (error: unknown) {
      $fetch.setKey('error', error as Error)
      $fetch.setKey('loading', false)
    }
  }

  return { $LiveMode, runLiveFetch }
}
