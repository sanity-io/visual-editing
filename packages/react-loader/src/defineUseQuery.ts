import type { QueryParams } from '@sanity/client'
import type { QueryStore, QueryStoreState } from '@sanity/core-loader'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import isEqual from 'react-fast-compare'

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
          /*
          // Uncomment and to debug run this in your browser console:
          // const {diffString} = await import('https://esm.sh/json-diff')
          // window.debugReactLoader = (a, b) => console.log(diffString(a, b, {color: false}))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const debug: (a: any, b: any) => void =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'debugReactLoader' in window
              ? (window.debugReactLoader as (a: any, b: any) => void)
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                (a: any, b: any) => {}
                // */

          if (!isEqual(prev.data, snapshot.data)) {
            // console.log('data changed')
            // debug(prev.data, snapshot.data)
            return snapshot
          }

          /*
          // TODO: sourceMaps reorder randomly and can't be compared in a reliable way
          if (!isEqual(prev.sourceMap, snapshot.sourceMap)) {
            if (
              !isEqual(prev.sourceMap?.documents, snapshot.sourceMap?.documents)
            ) {
              console.log('sourceMap.documents changed')
              debug(prev.sourceMap?.documents, snapshot.sourceMap?.documents)
            }
            if (
              !isEqual(prev.sourceMap?.mappings, snapshot.sourceMap?.mappings)
            ) {
              console.log('sourceMap.mappings changed')
              debug(prev.sourceMap?.mappings, snapshot.sourceMap?.mappings)
            }
            if (!isEqual(prev.sourceMap?.paths, snapshot.sourceMap?.paths)) {
              console.log('sourceMap.paths changed')

              debug(prev.sourceMap?.paths, snapshot.sourceMap?.paths)
            }
            return snapshot
          }
          // */

          if (prev.error !== snapshot.error) {
            // console.log('error changed', prev.error, snapshot.error)
            return snapshot
          }

          if (prev.loading !== snapshot.loading) {
            // console.log('loading changed', prev.loading, snapshot.loading)
            return snapshot
          }

          if (prev.perspective !== snapshot.perspective) {
            // console.log(
            //   'perspective changed',
            //   prev.perspective,
            //   snapshot.perspective,
            // )
            return snapshot
          }

          return prev
        })
      })
      return () => unlisten()
    }, [$params, initial, query])
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
