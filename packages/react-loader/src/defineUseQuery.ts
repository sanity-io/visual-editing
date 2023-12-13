import type { QueryParams } from '@sanity/client'
import type { QueryStore, QueryStoreState } from '@sanity/core-loader'
import isEqual from 'fast-deep-equal'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { defineStudioUrlStore } from './defineStudioUrlStore'
import type { UseQueryOptions, WithEncodeDataAttribute } from './types'
import { useEncodeDataAttribute } from './useEncodeDataAttribute'

export function defineUseQuery({
  createFetcherStore,
  studioUrlStore,
}: Pick<QueryStore, 'createFetcherStore'> & {
  studioUrlStore: ReturnType<typeof defineStudioUrlStore>
}): <QueryResponseResult, QueryResponseError>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => QueryStoreState<QueryResponseResult, QueryResponseError> &
  WithEncodeDataAttribute {
  const DEFAULT_PARAMS = {}
  return <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = {},
  ) => {
    const initial = useMemo(
      () =>
        options.initial
          ? { perspective: 'published' as const, ...options.initial }
          : undefined,
      [options.initial],
    )
    const $params = useMemo(() => JSON.stringify(params), [params])

    const [snapshot, setSnapshot] = useState<
      QueryStoreState<QueryResponseResult, QueryResponseError>
    >(() => {
      const fetcher = createFetcherStore<
        QueryResponseResult,
        QueryResponseError
      >(query, JSON.parse($params), initial)
      return fetcher.value!
    })
    useEffect(() => {
      const fetcher = createFetcherStore<
        QueryResponseResult,
        QueryResponseError
      >(query, JSON.parse($params), initial)
      const unlisten = fetcher.subscribe((snapshot) => {
        setSnapshot((prev) => {
          if (isEqual(prev, snapshot)) {
            // console.warn('do not apply')
            return prev
          }
          // console.log(
          //   'it applies',
          //   JSON.parse(JSON.stringify(snapshot)),
          //   JSON.parse(JSON.stringify(prev)),
          // )
          return snapshot
        })
      })
      return () => unlisten()
    }, [$params, initial, query])
    // useEffect(() => {
    //   console.groupCollapsed(`useQuery`)
    //   console.count(`useQuery(${query}, ${$params})`)
    //   console.log(snapshot.data)
    //   console.groupEnd()
    // }, [$params, query, snapshot.data])
    const studioUrl = useSyncExternalStore(
      studioUrlStore.subscribe,
      studioUrlStore.getSnapshot,
      studioUrlStore.getServerSnapshot,
    )
    const encodeDataAttribute = useEncodeDataAttribute(
      snapshot.data,
      snapshot.sourceMap,
      studioUrl,
    )
    return useMemo(
      () => ({ ...snapshot, encodeDataAttribute }),
      [snapshot, encodeDataAttribute],
    )
  }
}
