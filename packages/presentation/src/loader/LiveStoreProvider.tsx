import type {
  ClientConfig,
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
  SanityClient,
  SanityDocument,
} from '@sanity/client'
import { applyPatch } from 'mendoza'
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { defineListenerContext as Context, IsEnabledContext } from './context'
import { documentsCache } from './documentsCache'
import { getTurboCacheKey } from './getTurboCacheKey'
import { turboChargeResultIfSourceMap } from './turboChargeResultIfSourceMap'
import type {
  DefineListenerContext,
  ListenerGetSnapshot,
  ListenerSubscribe,
  Logger,
} from './types'
import { getQueryCacheKey, type QueryCacheKey } from './utils'

export type { Logger }

/**
 * @internal
 */
export interface LiveStoreProviderProps {
  children: React.ReactNode
  /**
   * The Sanity client to use for fetching data and listening to mutations.
   */
  client: SanityClient
  /**
   * How frequently queries should be refetched in the background to refresh the parts of queries that can't be source mapped.
   * Setting it to `0` will disable background refresh.
   * @defaultValue 10000
   */
  refreshInterval?: number
  perspective: ClientPerspective
  draft: SanityDocument
}
/**
 * @internal
 */
const LiveStoreProvider = memo(function LiveStoreProvider(
  props: LiveStoreProviderProps,
) {
  const { draft, children, client, refreshInterval = 2000, perspective } = props

  const [subscriptions, setSubscriptions] = useState<QueryCacheKey[]>([])
  const [snapshots] = useState<QuerySnapshotsCache>(() => new Map())
  const hooks = useHooks(setSubscriptions)
  const [context] = useState<DefineListenerContext>(() => {
    return function defineListener<QueryResult>(
      initialSnapshot: QueryResult,
      query: string,
      params: QueryParams,
    ) {
      const key = getQueryCacheKey(perspective, query, params)

      // Warm up the cache by setting the initial snapshot, showing stale-while-revalidate
      if (!snapshots.has(key)) {
        snapshots.set(key, {
          result: initialSnapshot,
          resultSourceMap: {} as ContentSourceMap,
        })
      }

      const subscribe: ListenerSubscribe = (onStoreChange) => {
        const unsubscribe = hooks.subscribe(
          key,
          perspective,
          query,
          params,
          onStoreChange,
        )

        return () => unsubscribe()
      }
      const getSnapshot: ListenerGetSnapshot<{
        result: QueryResult
        resultSourceMap?: ContentSourceMap
      }> = () =>
        snapshots.get(key) as unknown as {
          result: QueryResult
          resultSourceMap?: ContentSourceMap
        }

      return { subscribe, getSnapshot }
    } satisfies DefineListenerContext
  })
  const [turboIds, setTurboIds] = useState<string[]>([])
  const turboIdsFromSourceMap = useCallback(
    (contentSourceMap: ContentSourceMap) => {
      // This handler only adds ids, on each query fetch. But that's ok since <Turbo /> purges ids that are unused
      const nextTurboIds = new Set<string>()
      if (contentSourceMap.documents?.length) {
        for (const { _id } of contentSourceMap.documents) {
          nextTurboIds.add(_id)
        }
      }
      startTransition(() =>
        setTurboIds((prevTurboIds) => {
          const mergedTurboIds = Array.from(
            new Set([...prevTurboIds, ...nextTurboIds]),
          )
          if (
            JSON.stringify(mergedTurboIds.sort()) ===
            JSON.stringify(prevTurboIds.sort())
          ) {
            return prevTurboIds
          }
          return mergedTurboIds
        }),
      )
    },
    [],
  )

  return (
    <Context.Provider value={context}>
      <IsEnabledContext.Provider value>{children}</IsEnabledContext.Provider>
      <Turbo
        draft={draft}
        cache={hooks.cache}
        client={client}
        setTurboIds={setTurboIds}
        snapshots={snapshots}
        turboIds={turboIds}
        perspective={perspective}
      />
      {subscriptions.map((key) => {
        if (!hooks.cache.has(key)) return null
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { query, params, listeners } = hooks.cache.get(key)!
        return (
          <QuerySubscription
            key={key}
            draft={draft}
            client={client}
            listeners={listeners}
            params={params}
            query={query}
            refreshInterval={refreshInterval}
            snapshots={snapshots}
            turboIdsFromSourceMap={turboIdsFromSourceMap}
            perspective={perspective}
          />
        )
      })}
    </Context.Provider>
  )
})
LiveStoreProvider.displayName = 'LiveStoreProvider'
export default LiveStoreProvider

interface QuerySubscriptionProps
  extends Required<Pick<LiveStoreProviderProps, 'client' | 'refreshInterval'>> {
  draft: SanityDocument
  query: string
  params: QueryParams
  listeners: Set<() => void>
  turboIdsFromSourceMap: (contentSourceMap: ContentSourceMap) => void
  snapshots: QuerySnapshotsCache
  perspective: ClientPerspective
}
const QuerySubscription = memo(function QuerySubscription(
  props: QuerySubscriptionProps,
) {
  const {
    draft,
    client,
    refreshInterval,
    query,
    params,
    listeners,
    snapshots,
    turboIdsFromSourceMap,
    perspective,
  } = props
  const { projectId, dataset } = useMemo(() => {
    const { projectId, dataset } = client.config()
    return { projectId, dataset } as Required<
      Pick<ClientConfig, 'projectId' | 'dataset'>
    >
  }, [client])

  // Make sure any async errors bubble up to the nearest error boundary
  const [error, setError] = useState<unknown>(null)
  if (error) throw error

  const [revalidate, startRefresh] = useRevalidate({ refreshInterval })
  const shouldRefetch = revalidate === 'refresh' || revalidate === 'inflight'
  useEffect(() => {
    if (!shouldRefetch) {
      return
    }

    let fulfilled = false
    const controller = new AbortController()
    // eslint-disable-next-line no-inner-declarations
    async function effect() {
      const { signal } = controller
      const { result, resultSourceMap } = await client.fetch(query, params, {
        signal,
        perspective,
        filterResponse: false,
      })

      if (!signal.aborted) {
        snapshots.set(getQueryCacheKey(perspective, query, params), {
          result: turboChargeResultIfSourceMap(
            draft,
            projectId,
            dataset,
            result,
            perspective,
            resultSourceMap,
          ),
          resultSourceMap: resultSourceMap ?? ({} as ContentSourceMap),
        })

        if (resultSourceMap) {
          turboIdsFromSourceMap(resultSourceMap)
        }

        // Notify listeners that snapshots are updated
        for (const listener of listeners.values()) {
          listener()
        }
        fulfilled = true
      }
    }
    const onFinally = startRefresh()
    effect()
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error)
        }
      })
      .finally(onFinally)
    return () => {
      if (!fulfilled) {
        controller.abort()
      }
    }
  }, [
    draft,
    client,
    dataset,
    listeners,
    params,
    projectId,
    query,
    shouldRefetch,
    snapshots,
    startRefresh,
    turboIdsFromSourceMap,
    perspective,
  ])

  return null
})
QuerySubscription.displayName = 'QuerySubscription'

type QuerySnapshotsCache = Map<
  QueryCacheKey,
  { result: unknown; resultSourceMap: ContentSourceMap }
>

function onVisibilityChange(onStoreChange: () => void): () => void {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

/**
 * Keeps track of when revalidation and activities should be paused
 */
function useShouldPause(): boolean {
  const [online, setOnline] = useState(false)
  useEffect(() => {
    setOnline(navigator.onLine)
    const online = () => startTransition(() => setOnline(true))
    const offline = () => startTransition(() => setOnline(false))
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])
  const visibilityState = useSyncExternalStore(
    onVisibilityChange,
    () => document.visibilityState,
    () => 'hidden' satisfies DocumentVisibilityState,
  )

  // Should pause activity when offline
  if (!online) {
    return true
  }

  // Should pause when the document isn't visible, as it's likely the user isn't looking at the page
  if (visibilityState === 'hidden') {
    return true
  }

  return false
}

/**
 * 'hit' - the cache is fresh and valid
 * 'stale' - the cache should revalidate, but can't/shouldn't yet (offline, visibility = hidden)
 * 'refresh' - stale cache, and now is a great time to start refreshing
 * 'inflight' - refreshing cache, revalidate events should be ignored
 */
type RevalidateState = 'hit' | 'stale' | 'refresh' | 'inflight'
/**
 * Keeps track of when queries should revalidate
 */
function useRevalidate(
  props: Pick<LiveStoreProviderProps, 'refreshInterval'>,
): [RevalidateState, () => () => void] {
  const { refreshInterval } = props

  const shouldPause = useShouldPause()
  const [state, setState] = useState<RevalidateState>('hit')

  // Keep track of indicators for when revalidation should be 'paused'
  // Like if we're currently offline, or the document isn't visible
  // Basically if 'stale' and all good we return 'refresh'

  // Next keep track of staleness itself. If we come back online, on a windows focus event
  // or on a refreshInterval timeout
  // Basically it controls if cache should be 'hit' or 'stale'

  // How to handle refresh to inflight?

  const startRefresh = useCallback(() => {
    startTransition(() => setState('inflight'))
    return () => startTransition(() => setState('hit'))
  }, [])

  // Revalidate on refreshInterval
  useEffect(() => {
    // If refreshInterval is nullish then we don't want to refresh.
    // Inflight means it's already refreshing and we pause the countdown.
    // It's only necessary to start the countdown if the cache isn't already stale
    if (!refreshInterval || state !== 'hit') {
      return
    }
    const timeout = setTimeout(
      () => startTransition(() => setState('stale')),
      refreshInterval,
    )
    return () => clearTimeout(timeout)
  }, [refreshInterval, state])
  // Revalidate on windows focus
  useEffect(() => {
    if (state !== 'hit') {
      return
    }
    const onFocus = () => startTransition(() => setState('stale'))
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshInterval, state])
  // Revalidate on changes to shouldPause
  useEffect(() => {
    // Mark as stale pre-emptively if we're offline or the document isn't visible
    if (shouldPause && state === 'hit') {
      startTransition(() => setState('stale'))
    }
    // If not paused we can mark stale as ready for refresh
    if (!shouldPause && state === 'stale') {
      startTransition(() => setState('refresh'))
    }
  }, [shouldPause, state])

  return [state, startRefresh]
}

type LiveStoreQueryCacheMap = Map<
  QueryCacheKey,
  {
    query: string
    params: QueryParams
    perspective: ClientPerspective
    listeners: Set<() => void>
  }
>

/**
 * Keeps track of store subscribers per cache key, in a way that's designed for useSyncExternalStore.
 * The main difference from a typical subscription state with useEffect is that `adding` and `cleanup`
 * is wholly managed by the `subscribe` function in `useSyncExternalStore`, instead of lifecycles in useEffect.
 * And since the `onStoreChange` callback, provided to `subscribe`, notifies React when to re-render,
 * there is no need to use `setState` to trigger a re-render. That's why the Map is persisted in `useState` but the state setter isn't used.
 */
function useHooks(
  setSubscriptions: React.Dispatch<React.SetStateAction<QueryCacheKey[]>>,
): {
  cache: LiveStoreQueryCacheMap
  subscribe: (
    key: QueryCacheKey,
    perspective: ClientPerspective,
    query: string,
    params: QueryParams,
    listener: () => void,
  ) => () => void
} {
  const [cache] = useState<LiveStoreQueryCacheMap>(() => new Map())
  const subscribe = useCallback(
    (
      key: QueryCacheKey,
      perspective: ClientPerspective,
      query: string,
      params: QueryParams,
      listener: () => void,
    ) => {
      if (!cache.has(key)) {
        cache.set(key, {
          perspective,
          query,
          params,
          listeners: new Set<() => void>(),
        })
        startTransition(() =>
          setSubscriptions((prevSubscriptions) => {
            if (prevSubscriptions.includes(key)) {
              return prevSubscriptions
            }
            return [...prevSubscriptions, key]
          }),
        )
      }
      const hook = cache.get(key)
      if (!hook || !hook.listeners) {
        throw new TypeError('Inconsistent cache for key: ' + key)
      }
      const { listeners } = hook
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          cache.delete(key)
          startTransition(() =>
            setSubscriptions((prevSubscriptions) => {
              if (prevSubscriptions.includes(key)) {
                return prevSubscriptions.filter((sub) => sub !== key)
              }
              return prevSubscriptions
            }),
          )
        }
      }
    },
    [cache, setSubscriptions],
  )
  return useMemo(() => ({ cache, subscribe }), [cache, subscribe])
}

interface TurboProps extends Pick<LiveStoreProviderProps, 'client'> {
  draft: SanityDocument
  turboIds: string[]
  setTurboIds: React.Dispatch<React.SetStateAction<string[]>>
  cache: LiveStoreQueryCacheMap
  snapshots: QuerySnapshotsCache
  perspective: ClientPerspective
}
/**
 * A turbo-charged mutation observer that uses Content Source Maps to apply mendoza patches on your queries
 */
const Turbo = memo(function Turbo(props: TurboProps) {
  const {
    draft,
    client,
    snapshots,
    cache,
    turboIds,
    setTurboIds,
    perspective,
  } = props
  const { projectId, dataset } = useMemo(() => {
    const { projectId, dataset } = client.config()
    return { projectId, dataset } as Required<
      Pick<ClientConfig, 'projectId' | 'dataset'>
    >
  }, [client])

  // Keep track of document ids that the active `useLiveQuery` hooks care about
  useEffect(() => {
    const nextTurboIds = new Set<string>()
    for (const { perspective, query, params } of cache.values()) {
      const key = getQueryCacheKey(perspective, query, params)
      const snapshot = snapshots.get(key)
      if (snapshot && snapshot.resultSourceMap?.documents?.length) {
        for (const { _id } of snapshot.resultSourceMap.documents) {
          nextTurboIds.add(_id)
        }
      }
    }
    const nextTurboIdsSnapshot = [...nextTurboIds].sort()
    if (JSON.stringify(turboIds) !== JSON.stringify(nextTurboIdsSnapshot)) {
      startTransition(() => setTurboIds(nextTurboIdsSnapshot))
    }
  }, [cache, setTurboIds, snapshots, turboIds])

  // Figure out which documents are missing from the cache
  const [batch, setBatch] = useState<string[][]>([])
  useEffect(() => {
    const batchSet = new Set(batch.flat())
    const nextBatch = new Set<string>()
    for (const turboId of turboIds) {
      if (
        !batchSet.has(turboId) &&
        !documentsCache.has(
          getTurboCacheKey(projectId, dataset, perspective, turboId),
        )
      ) {
        nextBatch.add(turboId)
      }
    }
    const nextBatchSlice = [...nextBatch].slice(0, 10)
    if (nextBatchSlice.length === 0) return
    startTransition(() =>
      setBatch((prevBatch) => [...prevBatch.slice(-10), nextBatchSlice]),
    )
  }, [batch, dataset, perspective, projectId, turboIds])

  const [lastMutatedDocumentId, setLastMutatedDocumentId] = useState<string>()
  // Use the same listen instance and patch documents as they come in
  useEffect(() => {
    const subscription = client
      .listen(
        perspective === 'published'
          ? `*[!(_id in path("drafts.**"))]`
          : `*[_id in path("drafts.**")]`,
        {},
        {
          events: ['mutation'],
          effectFormat: 'mendoza',
          includePreviousRevision: false,
          includeResult: false,
          tag: 'turbo',
        },
      )
      .subscribe((update) => {
        if (update.type !== 'mutation' || !update.effects?.apply?.length) return
        // Schedule a reach state update with the ID of the document that were mutated
        // This react handler will apply the document to related source map snapshots
        const key = getTurboCacheKey(
          projectId,
          dataset,
          perspective,
          update.documentId,
        )
        const cachedDocument = documentsCache.peek(key)
        if (cachedDocument as SanityDocument) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const patchDoc = { ...cachedDocument } as any
          delete patchDoc._rev
          const patchedDocument = applyPatch(patchDoc, update.effects.apply)
          documentsCache.set(key, patchedDocument)
        }

        startTransition(() => setLastMutatedDocumentId(update.documentId))
      })
    return () => subscription.unsubscribe()
  }, [client, dataset, perspective, projectId])

  // If the last mutated document is in the list over turboIds then lets apply the source map
  useEffect(() => {
    if (!lastMutatedDocumentId || !turboIds.includes(lastMutatedDocumentId))
      return

    const updatedKeys: QueryCacheKey[] = []
    for (const [key, snapshot] of snapshots.entries()) {
      if (snapshot.resultSourceMap?.documents?.length) {
        snapshot.result = turboChargeResultIfSourceMap(
          draft,
          projectId,
          dataset,
          snapshot.result,
          perspective,
          snapshot.resultSourceMap,
        )
        updatedKeys.push(key)
      }
    }
    for (const updatedKey of updatedKeys) {
      const listeners = cache.get(updatedKey)?.listeners
      if (listeners) {
        for (const listener of listeners) {
          listener()
        }
      }
    }
    startTransition(() => setLastMutatedDocumentId(undefined))
  }, [
    draft,
    cache,
    dataset,
    lastMutatedDocumentId,
    perspective,
    projectId,
    snapshots,
    turboIds,
  ])

  const [lastDraftDocumentRev, setLastDraftDocumentRev] = useState<string>()
  useEffect(() => {
    if (!lastDraftDocumentRev) return

    const updatedKeys: QueryCacheKey[] = []
    for (const [key, snapshot] of snapshots.entries()) {
      if (snapshot.resultSourceMap?.documents?.length) {
        snapshot.result = turboChargeResultIfSourceMap(
          draft,
          projectId,
          dataset,
          snapshot.result,
          perspective,
          snapshot.resultSourceMap,
        )
        updatedKeys.push(key)
      }
    }
    for (const updatedKey of updatedKeys) {
      const listeners = cache.get(updatedKey)?.listeners
      if (listeners) {
        for (const listener of listeners) {
          listener()
        }
      }
    }
  }, [
    cache,
    dataset,
    draft,
    lastDraftDocumentRev,
    perspective,
    projectId,
    snapshots,
  ])
  useEffect(() => {
    if (draft) {
      startTransition(() => setLastDraftDocumentRev(draft._rev))
    }
  }, [draft])

  return (
    <>
      {batch.map((ids) => (
        <GetDocuments
          key={JSON.stringify(ids)}
          client={client}
          projectId={projectId}
          dataset={dataset}
          ids={ids}
          perspective={perspective}
        />
      ))}
    </>
  )
})
Turbo.displayName = 'Turbo'

interface GetDocumentsProps extends Pick<LiveStoreProviderProps, 'client'> {
  projectId: string
  dataset: string
  ids: string[]
  perspective: ClientPerspective
}
const GetDocuments = memo(function GetDocuments(props: GetDocumentsProps) {
  const { client, projectId, dataset, ids, perspective } = props

  useEffect(() => {
    const missingIds = ids.filter(
      (id) =>
        !documentsCache.has(
          getTurboCacheKey(projectId, dataset, perspective, id),
        ),
    )
    if (missingIds.length === 0) return
    client.getDocuments(missingIds).then((documents) => {
      for (const doc of documents) {
        if (doc && doc?._id) {
          documentsCache.set(
            getTurboCacheKey(projectId, dataset, perspective, doc._id),
            doc,
          )
        }
      }
      // eslint-disable-next-line no-console
    }, console.error)
  }, [client, dataset, ids, perspective, projectId])

  return null
})
GetDocuments.displayName = 'GetDocuments'
