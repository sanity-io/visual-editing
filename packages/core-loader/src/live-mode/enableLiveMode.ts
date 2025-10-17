import {
  validateApiPerspective,
  type ClientPerspective,
  type ContentSourceMap,
  type ContentSourceMapDocuments,
  type QueryParams,
  type SanityClient,
} from '@sanity/client'
import {stegaEncodeSourceMap} from '@sanity/client/stega'
import {createNode, createNodeMachine} from '@sanity/comlink'
import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@sanity/presentation-comlink'
import type {WritableAtom} from 'nanostores'
import {atom, type MapStore} from 'nanostores'
import type {EnableLiveModeOptions, QueryStoreState, SetFetcher} from '../types'

/** @internal */
export interface LazyEnableLiveModeOptions extends EnableLiveModeOptions {
  ssr: boolean
  setFetcher: SetFetcher
  $decideParameters: WritableAtom<string>
}

const LISTEN_HEARTBEAT_INTERVAL = 10_000

export function enableLiveMode(options: LazyEnableLiveModeOptions): () => void {
  const {client, setFetcher, onConnect, onDisconnect, onPerspective, onDecideParameters, $decideParameters} = options
  if (!client) {
    throw new Error(
      `Expected \`client\` to be an instance of SanityClient: ${JSON.stringify(client)}`,
    )
  }
  const {projectId, dataset, perspective} = client.config()

  const $perspective = atom<Exclude<ClientPerspective, 'raw'>>(
    perspective && perspective !== 'raw' ? perspective : 'drafts',
  )
  const $connected = atom(false)

  const cache = new Map<
    string,
    {
      projectId: string
      dataset: string
      perspective: ClientPerspective
      decideParameters: string
      query: string
      params: QueryParams
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any
      resultSourceMap?: ContentSourceMap | undefined
    }
  >()

  const comlink = createNode<LoaderNodeMsg, LoaderControllerMsg>(
    {
      name: 'loaders',
      connectTo: 'presentation',
    },
    createNodeMachine<LoaderNodeMsg, LoaderControllerMsg>().provide({
      actors: createCompatibilityActors<LoaderNodeMsg>() as any,
    }),
  )

  comlink.onStatus(() => {
    $connected.set(true)
  }, 'connected')

  comlink.on('loader/perspective', (data) => {
    if (data.projectId === projectId && data.dataset === dataset) {
      validateApiPerspective(data.perspective)
      const nextPerspective = data.perspective === 'raw' ? 'drafts' : data.perspective
      $perspective.set(nextPerspective)
      onPerspective?.(nextPerspective)
      updateLiveQueries()
    }
  })

  comlink.on('loader/decide-parameters', (data) => {
    if (data.projectId === projectId && data.dataset === dataset) {
      $decideParameters.set(data.decideParameters)
      onDecideParameters?.(data.decideParameters)

      // IMPORTANT: Clear cache when decideParameters change to avoid stale conditional content
      cache.clear()

      // Force queries to refetch with new decideParameters
      for (const {$fetch} of liveQueries) {
        $fetch.setKey('loading', true)
      }
      updateLiveQueries()
    }
  })

  comlink.on('loader/query-change', (data) => {
    if (data.projectId === projectId && data.dataset === dataset) {
      const {perspective, query, params, decideParameters} = data
      if (
        data.result !== undefined &&
        data.resultSourceMap !== undefined &&
        (client as SanityClient).config().stega.enabled
      ) {
        cache.set(JSON.stringify({perspective, decideParameters, query, params}), {
          ...data,
          decideParameters,
          result: stegaEncodeSourceMap(
            data.result,
            data.resultSourceMap,
            (client as SanityClient).config().stega,
          ),
        })
      } else {
        cache.set(JSON.stringify({perspective, decideParameters, query, params}), {
          ...data,
          decideParameters,
        })
      }

      updateLiveQueries()
    }
  })

  let unsetFetcher: (() => void) | undefined
  const unlistenConnection = $connected.listen((connected) => {
    if (connected) {
      unsetFetcher = setFetcher({
        hydrate: (query, params, initial) => {
          const perspective = initial?.perspective || $perspective.get()

          if (initial?.decideParameters && initial.decideParameters.trim()) {
            $decideParameters.set(initial.decideParameters)
          }
          const decideParameters = initial?.decideParameters || $decideParameters.get()

          const key = JSON.stringify({
            perspective,
            decideParameters,
            query,
            params,
          })
          const snapshot = cache.get(key)
          if (snapshot?.result !== undefined && snapshot?.resultSourceMap !== undefined) {
            return {
              loading: false,
              error: undefined,
              data: snapshot.result,
              sourceMap: snapshot.resultSourceMap,
              perspective,
              decideParameters,
            }
          }

          return {
            loading:
              ($connected.value === true && initial?.data === undefined) ||
              initial?.sourceMap === undefined,
            error: undefined,
            data: initial?.data,
            sourceMap: initial?.sourceMap,
            perspective: initial?.perspective || 'published',
            decideParameters: initial?.decideParameters || decideParameters,
          }
        },
        fetch: <QueryResponseResult, QueryResponseError>(
          query: string,
          params: QueryParams,
          $fetch: MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>>,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $fetch: MapStore<QueryStoreState<any, any>>
  }>()
  const addLiveQuery = (
    query: string,
    params: QueryParams,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $fetch: MapStore<QueryStoreState<any, any>>,
  ) => {
    const liveQuery = {query, params, $fetch}
    liveQueries.add(liveQuery)
    emitQueryListen()
    const interval = setInterval(() => emitQueryListen(true), LISTEN_HEARTBEAT_INTERVAL)
    return () => {
      clearInterval(interval)
      liveQueries.delete(liveQuery)
      emitQueryListen()
    }
  }
  const emitQueryListen = (skipSetLoading?: boolean) => {
    if (!comlink) {
      throw new Error('No connection')
    }
    const perspective = $perspective.get()
    const decideParameters = $decideParameters.get()
    for (const {query, params, $fetch} of liveQueries) {
      comlink.post('loader/query-listen', {
        projectId: projectId!,
        dataset: dataset!,
        perspective,
        decideParameters,
        query,
        params,
        heartbeat: LISTEN_HEARTBEAT_INTERVAL,
      })
      if (!skipSetLoading && $connected.value === true) {
        $fetch.setKey('loading', true)
      }
      $fetch.setKey('perspective', perspective)
      $fetch.setKey('decideParameters', decideParameters)
    }
  }
  function updateLiveQueries() {
    const perspective = $perspective.get()
    const decideParameters = $decideParameters.get()
    const documentsOnPage: ContentSourceMapDocuments = []
    let hasQueriesWithoutCache = false

    // Loop over liveQueries and apply cache
    for (const {query, params, $fetch} of liveQueries) {
      const key = JSON.stringify({perspective, decideParameters, query, params})
      const value = cache.get(key)

      if (value) {
        $fetch.set({
          data: value.result,
          error: undefined,
          loading: false,
          perspective,
          sourceMap: value.resultSourceMap,
          decideParameters,
        })
        documentsOnPage.push(...(value.resultSourceMap?.documents ?? []))
      } else {
        hasQueriesWithoutCache = true
      }
    }

    // If some queries don't have cached data, emit query-listen to trigger fresh queries
    if (hasQueriesWithoutCache) {
      emitQueryListen()
    }
    comlink.post('loader/documents', {
      projectId: projectId!,
      dataset: dataset!,
      perspective,
      decideParameters,
      documents: documentsOnPage,
    })
  }

  const stop = comlink.start()

  return () => {
    unsetFetcher?.()
    unlistenConnection()
    stop()
    $connected.set(false)
  }
}
