import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'

import type {
  NonUndefinedGuard,
  QueryResponseInitial,
  QueryStore,
  UseLiveModeHook,
  UseQueryOptionsDefinedInitial,
  UseQueryOptionsUndefinedInitial,
} from '../types'

import {defineStudioUrlStore} from '../defineStudioUrlStore'
import {defineUseLiveMode} from '../defineUseLiveMode'
import {defineUseQuery} from '../defineUseQuery'

export type * from '../types'

export const createQueryStore = (options: CreateQueryStoreOptions): QueryStore => {
  const {createFetcherStore, enableLiveMode} = createCoreQueryStore({
    tag: 'react-loader',
    ...options,
  })
  const studioUrlStore = defineStudioUrlStore(options.client)
  // @ts-expect-error - update typings
  const useQuery: QueryStore['useQuery'] = defineUseQuery({createFetcherStore, studioUrlStore})
  const useLiveMode: UseLiveModeHook = defineUseLiveMode({
    enableLiveMode,
    setStudioUrl: studioUrlStore.setStudioUrl,
  })

  const loadQuery: QueryStore['loadQuery'] = () => {
    throw new Error('The `loadQuery` function is server only.')
  }

  const setServerClient: QueryStore['setServerClient'] = () => {
    throw new Error('The `setServerClient` function is server only.')
  }

  return {
    loadQuery,
    useQuery,
    setServerClient,
    useLiveMode,
  }
}

export type {
  NonUndefinedGuard,
  QueryResponseInitial,
  QueryStore,
  UseLiveModeHook,
  UseQueryOptionsDefinedInitial,
  UseQueryOptionsUndefinedInitial,
}

/**
 * Shortcut setup for the main SSR use-case.
 * @public
 */
export const {loadQuery, setServerClient, useLiveMode, useQuery} = createQueryStore({
  client: false,
  ssr: true,
})
