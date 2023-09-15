import { LRUCache } from 'lru-cache'
import { nanoquery } from '@nanostores/query'

import type { DefineStoreOptions } from './types'
import { DEFAULT_TAG } from './utils'

export type * from './types'

export { getQueryCacheKey, type QueryCacheKey } from './utils'

// Global documents cache that are separated by a `${projectId}-${dataset}-${documentId}` key, used for live queries
export const documentsCache = new LRUCache({
  // We might want to tune this, presedence says we can use up to 3000 but we shouldn't make it user configurable
  max: 3000,
})

// @TODO move this into the options somehow
const DEDUPE_TIME = 4000 // 4s
const REFETCH_ON_FOCUS = true // false
const REFETCH_ON_RECONNECT = true // false
const REFETCH_INTERVAL = 10000 // 0

export function defineCreateStores(options: DefineStoreOptions): {
  createQueriesStore: ReturnType<typeof nanoquery>[0]
  _internal: {
    createMutatorStore: ReturnType<typeof nanoquery>[1]
    invalidateKeys: ReturnType<typeof nanoquery>[1]['invalidateKeys']
    mutateCache: ReturnType<typeof nanoquery>[1]['mutateCache']
  }
} {
  if (!options || !options.client) {
    throw new Error('`client` is required')
  }

  const client = options.previewDrafts?.enabled
    ? options.client.withConfig({
        requestTagPrefix:
          options.client.config().requestTagPrefix || DEFAULT_TAG,
        token: options.previewDrafts.token ?? options.client.config().token,
        useCdn: false,
        perspective: 'previewDrafts',
        ignoreBrowserTokenWarning: true,
        resultSourceMap: true,
      })
    : options.client

  const [
    createFetcherStore,
    createMutatorStore,
    { invalidateKeys, mutateCache },
  ] = nanoquery({
    dedupeTime: DEDUPE_TIME,
    refetchOnFocus: REFETCH_ON_FOCUS,
    refetchOnReconnect: REFETCH_ON_RECONNECT,
    refetchInterval: REFETCH_INTERVAL,
    fetcher: async (...keys: (string | number)[]) => {
      const [query, params] = keys as [query: string, params?: string]
      const { result, resultSourceMap } = await client.fetch(
        query,
        params ? JSON.parse(params) : {},
        { filterResponse: false },
      )
      // console.log('fetcher', { result, resultSourceMap, ...rest })
      return { result, resultSourceMap }
    },
  })

  return {
    createQueriesStore: createFetcherStore,
    _internal: {
      createMutatorStore,
      invalidateKeys,
      mutateCache,
    },
  }
}

export type CreateStores = ReturnType<typeof defineCreateStores>
