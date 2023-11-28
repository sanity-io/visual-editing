import type { ContentSourceMap, QueryParams } from '@sanity/client'
import { createQueryStore as createCoreQueryStore } from '@sanity/core-loader'
import { useAsyncData } from 'nuxt/app'
import { computed, onBeforeMount, onUnmounted } from 'vue'

import type {
  CreateQueryStoreOptions,
  QueryStore,
  UseLiveModeComposable,
  UseQueryComposable,
  UseQueryOptions,
} from './types'

export const createQueryStore = (
  storeOptions: CreateQueryStoreOptions,
): QueryStore => {
  const { createFetcherStore, enableLiveMode } = createCoreQueryStore({
    tag: 'nuxt-loader',
    ...storeOptions,
  })

  const DEFAULT_PARAMS = {}

  const useQuery: UseQueryComposable = async <
    QueryResponseResult = unknown,
    QueryResponseError = unknown,
  >(
    key: string,
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions = {},
  ) => {
    const { perspective = 'published' } = options

    const fetcher = createFetcherStore<QueryResponseResult, QueryResponseError>(
      query,
      params,
    )

    let unlisten: (() => void) | undefined

    onBeforeMount(() => {
      unlisten = fetcher.listen((newSnapshot) => {
        result.data.value = {
          data: newSnapshot.data,
          sourceMap: newSnapshot.sourceMap,
        }
      })
    })

    onUnmounted(() => {
      unlisten?.()
    })

    const client = storeOptions.client.config().useCdn
      ? storeOptions.client.withConfig({ useCdn: false })
      : storeOptions.client

    const result = await useAsyncData<
      {
        data: QueryResponseResult | undefined
        sourceMap: ContentSourceMap | undefined
      },
      QueryResponseError
    >(key, async () => {
      const response = await client.fetch<QueryResponseResult>(query, params, {
        filterResponse: false,
        resultSourceMap: 'withKeyArraySelector',
        perspective,
      })
      return { data: response.result, sourceMap: response.resultSourceMap }
    })

    return {
      data: computed(() => result.data.value?.data),
      sourceMap: computed(() => result.data.value?.sourceMap),
      loading: result.pending,
      error: result.error,
    }
  }

  const useLiveMode: UseLiveModeComposable = ({
    allowStudioOrigin,
    client,
    onConnect,
    onDisconnect,
  }) => {
    const disableLiveMode = enableLiveMode({
      allowStudioOrigin,
      client,
      onConnect,
      onDisconnect,
    })

    return disableLiveMode
  }

  return { useQuery, useLiveMode }
}
