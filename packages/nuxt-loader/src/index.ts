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
) => {
  data: Ref<Response>
  sourceMap: Ref<ContentSourceMap>
  loading: Ref<boolean>
  refreshing: Ref<boolean>
  error: Ref<any>
}
export type UseLiveModeHook = () => DeepReadonly<Ref<LiveModeState>>

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  useQuery: UseQueryHook
  useLiveMode: () => void
} => {
  const { createFetcherStore, $LiveMode } = createCoreQueryStore(options)

  const DEFAULT_PARAMS = {}
  const useQuery: UseQueryHook = (query, params = DEFAULT_PARAMS) => {
    const $params = JSON.stringify(params)
    const $fetch = createFetcherStore([query, $params])
    const snapshot = useStore($fetch)

    return {
      data: computed(() => (snapshot.value.data as any)?.result),
      sourceMap: computed(() => (snapshot.value.data as any)?.resultSourceMap),
      loading: computed(() =>
        'data' in snapshot.value ? false : snapshot.value.loading,
      ),
      refreshing: computed(() => snapshot.value.loading),
      error: computed(() => snapshot.value.error),
    }
  }

  const useLiveMode: UseLiveModeHook = () => {
    return useStore($LiveMode)
  }

  return { useQuery, useLiveMode }
}
