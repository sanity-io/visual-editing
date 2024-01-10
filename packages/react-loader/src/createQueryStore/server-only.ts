import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'

import { QueryStore as BaseQueryStore, QueryStore } from '../types'

export type * from '../types'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  if (!options.ssr) {
    throw new Error(
      'When using React Server Components the `ssr` option must be set to `true`.',
    )
  }
  const { setServerClient, unstable__serverClient } = createCoreQueryStore({
    tag: 'react-loader.rsc',
    ...options,
  })
  const loadQuery = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    _options: Parameters<QueryStore['loadQuery']>[2] = {},
  ): Promise<{
    data: QueryResponseResult
    sourceMap: ContentSourceMap | undefined
    perspective?: ClientPerspective
  }> => {
    const { cache, next, stega } = _options
    const perspective =
      _options.perspective ||
      unstable__serverClient.instance?.config().perspective ||
      'published'

    if (
      perspective === 'previewDrafts' &&
      !unstable__serverClient.canPreviewDrafts
    ) {
      throw new Error(
        `You cannot use "previewDrafts" unless you set a "token" in the "client" instance you're pasing to "setServerClient".`,
      )
    }
    // @TODO can this be removed, and `useCdn: undefined` be used instead?
    const useCdn = unstable__serverClient.instance!.config().useCdn

    const { result, resultSourceMap } =
      await unstable__serverClient.instance!.fetch<QueryResponseResult>(
        query,
        params,
        {
          cache: cache ?? next ? undefined : 'no-store',
          filterResponse: false,
          next,
          perspective,
          useCdn: perspective === 'previewDrafts' ? false : useCdn,
          ['stega' as string]: stega,
        },
      )
    return {
      data: result,
      sourceMap: resultSourceMap,
      perspective: perspective === 'previewDrafts' ? perspective : undefined,
    }
  }

  const useQuery: QueryStore['useQuery'] = () => {
    throw new Error(
      'The `useQuery` hook can only be called from a client component.',
    )
  }

  const useLiveMode: QueryStore['useLiveMode'] = () => {
    throw new Error(
      'The `useLiveMode` hook can only be called from a client component.',
    )
  }

  return {
    loadQuery,
    setServerClient,
    useQuery,
    useLiveMode,
  }
}

export const useEncodeDataAttribute = (): void => {
  throw new Error(
    'The `useEncodeDataAttribute` hook can only be called from a client component.',
  )
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

export type { BaseQueryStore }
