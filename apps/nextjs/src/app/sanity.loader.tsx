'use client'

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useStore } from '@nanostores/react'
import {
  defineCreateStores,
  documentsCache,
  type CreateStores,
  type QueryParams,
  getQueryCacheKey,
  type QueryCacheKey,
} from '@sanity/groq-store'
import { client } from './sanity.client'
import { logger } from '@nanostores/logger'
import { map, onMount, onAction, onSet } from 'nanostores'

const SanityLoaderContext = createContext<
  CreateStores['createQueriesStore'] | null
>(null)

const DEFAULT_PARAMS = {} as QueryParams
export function useSanityQuery<QueryResponse>(
  query: string,
  params: QueryParams = DEFAULT_PARAMS,
) {
  const createQueriesStore = useContext(SanityLoaderContext)
  if (createQueriesStore === null) {
    throw new Error('useSanityQuery must be used within a SanityLoaderProvider')
  }
  const [$data] = useState(createQueriesStore(query, params))
  const $params = useMemo(() => JSON.stringify(params), [params])
  useEffect(
    () => logger({ [`useQuery(${query}, ${$params})`]: $data }),
    [$data, $params, query],
  )
  const { data, loading } = useStore($data) as {
    data: { result: QueryResponse; resultSourceMap: any }
    loading: boolean
  }
  return [data?.result, loading] as const
}

export function SanityLoaderProvider({
  children,
  previewDrafts = true,
  token,
}: {
  children: React.ReactNode
  previewDrafts?: boolean
  token?: string
}) {
  if (previewDrafts && !token) {
    throw new Error(
      'When using SanityStoreProvider, you must provide a token prop',
    )
  }

  const [stores] = useState(() =>
    defineCreateStores({
      client: client as any,
      previewDrafts: {
        enabled: previewDrafts,
        token,
      },
    }),
  )
  const [usedDocumentsIds] = useState<Map<QueryCacheKey, Set<Set<string>>>>(
    new Map(),
  )
  const [tick, setTick] = useState(0)
  const forceRender = useCallback(
    () => startTransition(() => setTick((prev) => (prev > 0 ? ++prev : prev))),
    [],
  )
  const [createQueriesStore] = useState(() => (query: any, params: any) => {
    const $queries = stores.createQueriesStore(query, params)
    const documentIdsInQuery = new Set<string>()
    const queryCacheKey = getQueryCacheKey(query, params)

    onMount($queries, () => {
      if (!usedDocumentsIds.has(queryCacheKey)) {
        usedDocumentsIds.set(queryCacheKey, new Set())
      }
      usedDocumentsIds.get(queryCacheKey)!.add(documentIdsInQuery)
      forceRender()
      return () => {
        usedDocumentsIds.get(queryCacheKey)!.delete(documentIdsInQuery)
        forceRender()
      }
    })
    onSet($queries, ({ newValue }) => {
      const { loading, data } = newValue
      if (!loading && data) {
        documentIdsInQuery.clear()

        if ((data as any).resultSourceMap?.documents?.length) {
          for (const documentRef of (data as any).resultSourceMap.documents) {
            documentIdsInQuery.add(documentRef)
          }
        }
      }
      forceRender()
    })

    return $queries
  })

  useEffect(() => {
    console.log(stores)
    if (tick) {
      const allIdsInUse: string[] = []
      for (const groupedByQuery of usedDocumentsIds.values()) {
        for (const idsInQuery of groupedByQuery) {
          allIdsInUse.push(...idsInQuery)
        }
      }
      parent.postMessage(
        {
          type: 'ids',
          ids: allIdsInUse,
          sanity: true,
        },
        location.origin,
      )
    } else {
      startTransition(() => setTick(1))
    }
  }, [tick, usedDocumentsIds])

  return (
    <SanityLoaderContext.Provider
      value={createQueriesStore as typeof stores.createQueriesStore}
    >
      {children}
    </SanityLoaderContext.Provider>
  )
}
