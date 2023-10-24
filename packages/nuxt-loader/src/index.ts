import { useStore } from '@nanostores/vue'
import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  type LiveModeState,
} from '@sanity/core-loader'
import { computed, type DeepReadonly, type Ref } from 'vue'

export type * from '@sanity/core-loader'

export type UseQueryHook = <Response = unknown, Error = unknown>(
  query: string,
  params?: QueryParams,
) => {
  data: Ref<Response>
  sourceMap: Ref<ContentSourceMap>
  loading: Ref<boolean>
  error: Ref<Error>
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
  const useQuery: UseQueryHook = <Response = unknown, Error = unknown>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
  ) => {
    const $fetch = createFetcherStore<Response, Error>(query, params)
    const snapshot = useStore($fetch)

    return {
      data: computed(() => snapshot.value.data as any),
      sourceMap: computed(() => snapshot.value.sourceMap as any),
      loading: computed(() => snapshot.value.loading),
      error: computed(() => snapshot.value.error),
    } as any
  }

  const useLiveMode: UseLiveModeHook = () => {
    return useStore($LiveMode)
  }

  return { useQuery, useLiveMode }
}
