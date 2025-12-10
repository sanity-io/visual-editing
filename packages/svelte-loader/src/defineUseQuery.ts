import type {QueryParams} from '@sanity/client'
import type {QueryStore, QueryStoreState} from '@sanity/core-loader'

import isEqual from 'fast-deep-equal'
import {onMount} from 'svelte'
import {derived, get, writable} from 'svelte/store'

import type {UseQuery, UseQueryOptions} from './types'

import {defineStudioUrlStore} from './defineStudioUrlStore'
import {useEncodeDataAttribute} from './useEncodeDataAttribute'

export function defineUseQuery({
  createFetcherStore,
  studioUrlStore,
}: Pick<QueryStore, 'createFetcherStore'> & {
  studioUrlStore: ReturnType<typeof defineStudioUrlStore>
}): UseQuery {
  const DEFAULT_PARAMS = {}
  const DEFAULT_OPTIONS = {}
  return <QueryResponseResult, QueryResponseError>(
    query:
      | string
      | {
          query: string
          params?: QueryParams
          options?: UseQueryOptions<QueryResponseResult>
        },
    params: QueryParams = DEFAULT_PARAMS,
    options: UseQueryOptions<QueryResponseResult> = DEFAULT_OPTIONS,
  ) => {
    if (typeof query === 'object') {
      params = query.params || DEFAULT_PARAMS
      options = query.options || DEFAULT_OPTIONS
      query = query.query
    }

    const initial = options.initial
      ? {
          perspective: 'published' as const,
          ...options.initial,
        }
      : undefined

    const $params = JSON.stringify(params)

    // Core loader fetcher store
    const $fetcher = createFetcherStore<QueryResponseResult, QueryResponseError>(
      query,
      JSON.parse($params),
      initial,
    )

    // If $fetcher were returned directly, svelte would trigger the nanostores onMount method
    // on the server, so create a new store and keep it in sync
    const $writeable = writable<QueryStoreState<QueryResponseResult, QueryResponseError>>(
      $fetcher.value,
    )

    // Only call subscribe on the client
    onMount(() =>
      $fetcher.subscribe((snapshot) => {
        const prev = get($writeable)

        if (prev.error !== snapshot.error) {
          $writeable.set(snapshot)
        }

        if (prev.loading !== snapshot.loading) {
          $writeable.set(snapshot)
        }

        if (prev.perspective !== snapshot.perspective) {
          $writeable.set(snapshot)
        }

        if (!isEqual(prev.data, snapshot.data)) {
          $writeable.set(snapshot)
        }
      }),
    )

    // Return the store data with encodeDataAttribute
    return derived([$writeable, studioUrlStore], ([value, studioUrl]) => ({
      ...value,
      encodeDataAttribute: useEncodeDataAttribute(value.data, value.sourceMap, studioUrl),
    }))
  }
}
