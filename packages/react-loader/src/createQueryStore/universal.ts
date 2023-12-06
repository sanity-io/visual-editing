import type { QueryParams } from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'

import { defineUseLiveMode } from '../defineUseLiveMode'
import { defineUseQuery } from '../defineUseQuery'
import {
  NonUndefinedGuard,
  QueryResponseInitial,
  QueryStore,
  UseLiveModeHook,
  UseQueryOptionsDefinedInitial,
  UseQueryOptionsUndefinedInitial,
} from '../types'

export type * from '../types'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const {
    createFetcherStore,
    setServerClient,
    enableLiveMode,
    unstable__cache,
    unstable__serverClient,
  } = createCoreQueryStore({ tag: 'react-loader', ...options })
  const useQuery = defineUseQuery({ createFetcherStore })
  const useLiveMode: UseLiveModeHook = defineUseLiveMode({ enableLiveMode })

  const loadQuery = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    options: Parameters<QueryStore['loadQuery']>[2] = {},
  ): Promise<QueryResponseInitial<QueryResponseResult>> => {
    const { perspective = 'published' } = options
    if (typeof document !== 'undefined') {
      throw new Error(
        'Cannot use `loadQuery` in a browser environment, you should use it inside a loader, getStaticProps, getServerSideProps, getInitialProps, or in a React Server Component.',
      )
    }
    if (perspective !== 'published' && !unstable__serverClient.instance) {
      throw new Error(
        `You cannot use other perspectives than "published" unless you set "ssr: true" and call "setServerClient" first.`,
      )
    }
    if (perspective === 'previewDrafts') {
      if (!unstable__serverClient.canPreviewDrafts) {
        throw new Error(
          `You cannot use "previewDrafts" unless you set a "token" in the "client" instance you're pasing to "setServerClient".`,
        )
      }
      // Necessary with a new client instanec as `useCdn` can't be set on `client.fetch`
      const client = unstable__serverClient.instance!.config().useCdn
        ? unstable__serverClient.instance!.withConfig({ useCdn: false })
        : unstable__serverClient.instance!
      const { result, resultSourceMap } =
        await client!.fetch<QueryResponseResult>(query, params, {
          filterResponse: false,
          resultSourceMap: 'withKeyArraySelector',
          perspective,
        })
      return { data: result, sourceMap: resultSourceMap, perspective }
    }
    const { result, resultSourceMap } =
      await unstable__cache.fetch<QueryResponseResult>(
        JSON.stringify({ query, params }),
      )
    // @ts-expect-error - update typings
    return resultSourceMap
      ? { data: result, sourceMap: resultSourceMap }
      : { data: result }
  }

  return {
    loadQuery,
    // @ts-expect-error - update typings
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
export const { loadQuery, setServerClient, useLiveMode, useQuery } =
  createQueryStore({
    client: false,
    ssr: true,
  })
