import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type LiveModeState,
} from '@sanity/core-loader'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

export type * from '@sanity/core-loader'

export type UseQueryHook = <Response>(
  query: string,
  params?: QueryParams,
) => {
  data?: Response
  sourceMap?: ContentSourceMap
  loading: boolean
  error: any
}
export type UseLiveModeHook = () => LiveModeState

export interface QueryStore {
  useQuery: UseQueryHook
  useLiveMode: UseLiveModeHook
}

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
  const { createFetcherStore, $LiveMode } = createCoreQueryStore(options)
  const initialFetch = { loading: true }
  const initialLiveMode = $LiveMode.value!

  const DEFAULT_PARAMS = {}
  const useQuery: UseQueryHook = (query, params = DEFAULT_PARAMS) => {
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
      loading,
      error,
    }
  }

  const useLiveMode: UseLiveModeHook = () => {
    const store = useSyncExternalStore(
      useCallback((onStoreChange) => $LiveMode.listen(onStoreChange), []),
      () => $LiveMode.get(),
      () => initialLiveMode,
    )

    useEffect(() => {
      // eslint-disable-next-line no-console
      console.log('useLiveMode enabled', store.enabled)
    }, [store.enabled])
    useEffect(() => {
      // eslint-disable-next-line no-console
      console.log('useLiveMode connected', store.connected)
    }, [store.connected])

    return store
  }

  return { useQuery, useLiveMode }
}
