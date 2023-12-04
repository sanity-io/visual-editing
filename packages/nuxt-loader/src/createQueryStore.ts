import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import { createQueryStore as createCoreQueryStore } from '@sanity/core-loader'
import { useAsyncData } from 'nuxt/app'
import { computed, onMounted, onUnmounted } from 'vue'

import type {
  CreateQueryStoreOptions,
  QueryStore,
  UseLiveModeComposable,
  UseQueryComposable,
  UseQueryOptions,
} from './types'

/** @public */
export const createQueryStore = (
  storeOptions: CreateQueryStoreOptions,
): QueryStore => {
  const {
    createFetcherStore,
    enableLiveMode,
    setServerClient,
    unstable__serverClient,
  } = createCoreQueryStore({
    tag: storeOptions.tag || 'nuxt-loader',
    client: false,
    ssr: true,
  })

  if (import.meta.server) {
    setServerClient(storeOptions.client)
  }

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

    let unlisten: (() => void) | undefined

    onMounted(() => {
      const initial = result.data.value?.data
        ? { perspective: 'published' as const, ...result.data.value }
        : undefined

      const fetcher = createFetcherStore<
        QueryResponseResult,
        QueryResponseError
      >(query, params, initial)

      unlisten = fetcher.subscribe((newSnapshot) => {
        result.data.value = {
          data: newSnapshot.data as unknown as QueryResponseResult,
          sourceMap: newSnapshot.sourceMap,
          perspective: newSnapshot.perspective,
        }
      })
    })

    onUnmounted(() => {
      unlisten?.()
    })

    const result = await useAsyncData<
      {
        data: QueryResponseResult
        sourceMap?: ContentSourceMap | undefined
        perspective?: ClientPerspective
      },
      QueryResponseError
    >(key, async () => {
      const client = unstable__serverClient.instance || storeOptions.client

      if (perspective === 'previewDrafts') {
        if (!unstable__serverClient.canPreviewDrafts) {
          throw new Error(
            `You cannot use "previewDrafts" unless you set a "token" in the "client" instance you're passing to "createQueryStore".`,
          )
        }
        // Necessary with a new client instance as `useCdn` can't be set on `client.fetch`
        const clientNotUsingCdn = client.config().useCdn
          ? client.withConfig({ useCdn: false })
          : client

        const { result, resultSourceMap } =
          await clientNotUsingCdn!.fetch<QueryResponseResult>(query, params, {
            filterResponse: false,
            resultSourceMap: 'withKeyArraySelector',
            perspective,
          })
        return { data: result, sourceMap: resultSourceMap, perspective }
      }

      const { result, resultSourceMap } =
        await client.fetch<QueryResponseResult>(query, params, {
          filterResponse: false,
        })

      return resultSourceMap
        ? { data: result, sourceMap: resultSourceMap }
        : { data: result }
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
      client: client || storeOptions.client,
      onConnect,
      onDisconnect,
    })

    return disableLiveMode
  }

  return { useQuery, useLiveMode }
}
