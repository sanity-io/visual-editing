import { useStore } from '@nanostores/vue'
import type { ContentSourceMap, QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
  EnableLiveModeOptions,
} from '@sanity/core-loader'
import { computed, type Ref } from 'vue'

export type * from '@sanity/core-loader'

export type UseQueryHook = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  query: string,
  params?: QueryParams,
) => {
  data: Ref<QueryResponseResult>
  sourceMap: Ref<ContentSourceMap>
  loading: Ref<boolean>
  error: Ref<QueryResponseError>
}
export type EnableLiveMode = (options: EnableLiveModeOptions) => void

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  useQuery: UseQueryHook
  enableLiveMode: EnableLiveMode
} => {
  const { createFetcherStore, enableLiveMode } = createCoreQueryStore(options)

  const DEFAULT_PARAMS = {}
  const useQuery: UseQueryHook = <
    QueryResponseResult = unknown,
    QueryResponseError = unknown,
  >(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
  ) => {
    const $fetch = createFetcherStore<QueryResponseResult, QueryResponseError>(
      query,
      params,
    )
    const snapshot = useStore($fetch)

    return {
      data: computed(() => snapshot.value.data as any),
      sourceMap: computed(() => snapshot.value.sourceMap as any),
      loading: computed(() => snapshot.value.loading),
      error: computed(() => snapshot.value.error),
    } as any
  }

  return { useQuery, enableLiveMode }
}
