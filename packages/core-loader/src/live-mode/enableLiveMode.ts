import {
  type ClientPerspective,
  type ContentSourceMap,
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

import { isStegaClient } from '../isStegaClient'
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

  const cache = new Map<
    string,
    {
      projectId: string
      dataset: string
      perspective: ClientPerspective
      query: string
      params: QueryParams
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any
      resultSourceMap?: ContentSourceMap | undefined
    }
  >()

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
          data.result !== undefined &&
          data.resultSourceMap !== undefined &&
          isStegaClient(client) &&
          (client as SanityStegaClient).config().stega?.enabled
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
          const perspective = initial?.perspective || $perspective.get()
          const key = JSON.stringify({
            perspective,
            query,
            params,
          })
          const snapshot = cache.get(key)
          if (
            snapshot?.result !== undefined &&
            snapshot?.resultSourceMap !== undefined
          ) {
            return {
              loading: false,
              error: undefined,
              data: snapshot.result,
              sourceMap: snapshot.resultSourceMap,
              perspective,
            }
          }

          return {
            loading:
              initial?.data === undefined || initial?.sourceMap === undefined,
            error: undefined,
            data: initial?.data,
            sourceMap: initial?.sourceMap,
            perspective: initial?.perspective || 'published',
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
      $fetch.setKey('perspective', perspective)
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
        $fetch.setKey('perspective', perspective)
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
