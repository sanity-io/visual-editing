import {
  type ClientPerspective,
  type ContentSourceMapDocuments,
  type QueryParams,
  SanityClient,
} from '@sanity/client'
import { SanityStegaClient, stegaEncodeSourceMap } from '@sanity/client/stega'
import { createChannel } from 'channels'
import { atom, MapStore } from 'nanostores'
import {
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from 'visual-editing-helpers'

import { EnableLiveModeOptions, QueryStoreState, SetFetcher } from '../types'

/** @internal */
export interface LazyEnableLiveModeOptions extends EnableLiveModeOptions {
  ssr: boolean
  setFetcher: SetFetcher
}

export function enableLiveMode(options: LazyEnableLiveModeOptions): () => void {
  const {
    client,
    allowStudioOrigin = '/',
    setFetcher,
    onConnect,
    onDisconnect,
  } = options
  if (!client || !(client instanceof SanityClient)) {
    throw new Error(
      `Expected \`client\` to be an instance of SanityClient or SanityStegaClient: ${JSON.stringify(
        client,
      )}`,
    )
  }
  const { projectId, dataset } = client.config()
  const $perspective = atom<Exclude<ClientPerspective, 'raw'>>('previewDrafts')
  const $connected = atom(false)

  const cache = new Map()

  const targetOrigin = new URL(allowStudioOrigin, location.origin).origin
  const channel = createChannel<VisualEditingMsg>({
    id: 'loaders' satisfies VisualEditingConnectionIds,
    onStatusUpdate(status) {
      if (status === 'connected') {
        $connected.set(true)
      } else if (status === 'disconnected' || status === 'unhealthy') {
        $connected.set(false)
      }
    },
    connections: [
      {
        target: parent,
        targetOrigin,
        id: 'presentation' satisfies VisualEditingConnectionIds,
      },
    ],
    handler: (type, data) => {
      if (
        type === 'loader/perspective' &&
        data.projectId === projectId &&
        data.dataset === dataset
      ) {
        if (
          data.perspective !== 'published' &&
          data.perspective !== 'previewDrafts'
        ) {
          throw new Error(
            `Unsupported perspective: ${JSON.stringify(data.perspective)}`,
          )
        }
        $perspective.set(data.perspective)
        updateLiveQueries()
      } else if (
        type === 'loader/query-change' &&
        data.projectId === projectId &&
        data.dataset === dataset
      ) {
        const { perspective, query, params } = data
        if (
          isStegaClient(client) &&
          (client as SanityStegaClient).config().stega?.enabled &&
          data.resultSourceMap
        ) {
          cache.set(JSON.stringify({ perspective, query, params }), {
            ...data,
            result: stegaEncodeSourceMap(
              data.result,
              data.resultSourceMap,
              (client as SanityStegaClient).config().stega,
              { projectId: data.projectId, dataset: data.dataset },
            ),
          })
        } else {
          cache.set(JSON.stringify({ perspective, query, params }), data)
        }

        updateLiveQueries()
      }
    },
  })

  let unsetFetcher: (() => void) | undefined
  const unlistenConnection = $connected.listen((connected) => {
    if (connected) {
      unsetFetcher = setFetcher({
        hydrate: (query, params, initial) => {
          const key = JSON.stringify({
            perspective: $perspective.get(),
            query,
            params,
          })
          if (!cache.has(key) && initial?.data) {
            cache.set(key, {
              projectId,
              dataset,
              perspective: $perspective.get(),
              query,
              params,
              result: initial.data,
              resultSourceMap: initial.sourceMap,
            })
          }
          const { result, resultSourceMap } = cache.get(key) || {}

          return {
            loading: !cache.has(key),
            error: undefined,
            data: result,
            sourceMap: resultSourceMap,
          }
        },
        fetch: <QueryResponseResult, QueryResponseError>(
          query: string,
          params: QueryParams,
          $fetch: MapStore<
            QueryStoreState<QueryResponseResult, QueryResponseError>
          >,
          controller: AbortController,
        ) => {
          try {
            const removeLiveQuery = addLiveQuery(query, params, $fetch)
            controller.signal.addEventListener(
              'abort',
              () => {
                removeLiveQuery()
                updateLiveQueries()
              },
              {
                once: true,
              },
            )
            updateLiveQueries()
            $fetch.setKey('error', undefined)
            if (controller.signal.aborted) return
          } catch (error: unknown) {
            $fetch.setKey('error', error as QueryResponseError)
            $fetch.setKey('loading', false)
          }
        },
      })
      onConnect?.()
    } else {
      unsetFetcher?.()
      onDisconnect?.()
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

  return () => {
    unsetFetcher?.()
    unlistenConnection()
    channel.disconnect()
  }
}

function isStegaClient(
  client: SanityClient | SanityStegaClient,
): client is SanityStegaClient {
  return client instanceof SanityStegaClient
}
