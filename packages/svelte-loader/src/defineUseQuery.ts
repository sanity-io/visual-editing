import type { QueryParams } from '@sanity/client'
import { type QueryStore, QueryStoreState } from '@sanity/core-loader'
import { onMount } from 'svelte'
import { derived, writable } from 'svelte/store'

import { defineStudioUrlStore } from './defineStudioUrlStore'
import type { UseQuery, UseQueryOptions } from './types'
import { useEncodeDataAttribute } from './useEncodeDataAttribute'

export function defineUseQuery({
  createFetcherStore,
  studioUrlStore,
}: Pick<QueryStore, 'createFetcherStore'> & {
  studioUrlStore: ReturnType<typeof defineStudioUrlStore>
}): UseQuery {
  const DEFAULT_PARAMS = {}
  return <QueryResponseResult, QueryResponseError>(
    query: string,
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = {},
  ) => {
    const initial = options.initial
      ? {
          perspective: 'published' as const,
          ...options.initial,
        }
      : undefined

    const $params = JSON.stringify(params)

    // Core loader fetcher store
    const $fetcher = createFetcherStore<
      QueryResponseResult,
      QueryResponseError
    >(query, JSON.parse($params), initial)

    // If $fetcher were returned directly, svelte would trigger the nanostores onMount method
    // on the server, so create a new store and keep it in sync
    const $writeable = writable<
      QueryStoreState<QueryResponseResult, QueryResponseError>
    >($fetcher.value)

    // Only call subscribe on the client
    onMount(() =>
      $fetcher.subscribe((snapshot) => {
        $writeable.set(snapshot)
      }),
    )

    // Return the store data with encodeDataAttribute
    return derived([$writeable, studioUrlStore], ([value, studioUrl]) => ({
      ...value,
      encodeDataAttribute: useEncodeDataAttribute(
        value.data,
        value.sourceMap,
        studioUrl,
      ),
    }))
  }
}
