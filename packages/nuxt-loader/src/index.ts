import { useStore } from '@nanostores/vue'
import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type LiveModeState,
} from '@sanity/core-loader'
import { computed, type DeepReadonly, type Ref } from 'vue'

export type * from '@sanity/core-loader'

export type UseQueryHook = <Response>(
  query: string,
  params?: QueryParams,
) => DeepReadonly<
  Ref<{
    data?: Response
    sourceMap?: ContentSourceMap
    loading: boolean
    refreshing: boolean
    error: any
  }>
>
export type UseLiveModeHook = () => DeepReadonly<Ref<LiveModeState>>

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

  const DEFAULT_PARAMS = {}
  const useQuery: UseQueryHook = (query, params = DEFAULT_PARAMS) => {
    const $params = JSON.stringify(params)
    const $fetch = createFetcherStore([query, $params])
    const snapshot = useStore($fetch)

    return computed(() => {
      const { data, loading, error } = snapshot.value
      return {
        data: (data as any)?.result,
        sourceMap: (data as any)?.resultSourceMap,
        loading: 'data' in snapshot ? false : loading,
        refreshing: loading,
        error,
      }
    })
  }

  const useLiveMode: UseLiveModeHook = () => {
    return useStore($LiveMode)
  }

  return { useQuery, useLiveMode }
}
