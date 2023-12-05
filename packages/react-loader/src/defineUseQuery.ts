import type { QueryParams } from '@sanity/client'
import type { QueryStore, QueryStoreState } from '@sanity/core-loader'
import { useEffect, useMemo, useState } from 'react'

import type { UseQueryOptions } from './types'

export function defineUseQuery({
  createFetcherStore,
}: Pick<QueryStore, 'createFetcherStore'>): <
  QueryResponseResult,
  QueryResponseError,
>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptions<QueryResponseResult>,
) => QueryStoreState<QueryResponseResult, QueryResponseError> {
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
        setSnapshot(snapshot)
      })

      return () => unlisten()
    }, [$params, initial, query])

    return snapshot
  }
}
