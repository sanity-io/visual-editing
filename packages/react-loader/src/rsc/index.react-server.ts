import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import {
  createQueryStore as createCoreQueryStore,
  type CreateQueryStoreOptions,
} from '@sanity/core-loader'

import { QueryOptions, QueryStore } from './types'

export type * from './types'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  if (!options.ssr) {
    throw new Error(
      'When using React Server Components the `ssr` option must be set to `true`.',
    )
  }
  const { setServerClient, unstable__serverClient } =
    createCoreQueryStore(options)
  const loadQuery = async <QueryResponseResult>(
    query: string,
    params: QueryParams = {},
    options: QueryOptions = {},
  ): Promise<{
    data: QueryResponseResult
    sourceMap: ContentSourceMap | undefined
    perspective?: ClientPerspective
  }> => {
    const { perspective = 'published' } = options
    if (
      perspective === 'previewDrafts' &&
      !unstable__serverClient.canPreviewDrafts
    ) {
      throw new Error(
        `You cannot use "previewDrafts" unless you set a "token" in the "client" instance you're pasing to "setServerClient".`,
      )
    }
    // Necessary with a new client instanec as `useCdn` can't be set on `client.fetch`
    const client =
      perspective === 'published' &&
      !unstable__serverClient.instance!.config().useCdn &&
      !options.cache &&
      !options.next
        ? unstable__serverClient.instance!.withConfig({ useCdn: true })
        : 'previewDrafts' && unstable__serverClient.instance!.config().useCdn
          ? unstable__serverClient.instance!.withConfig({ useCdn: false })
          : unstable__serverClient.instance!
    const { result, resultSourceMap } =
      await client!.fetch<QueryResponseResult>(query, params, {
        filterResponse: false,
        cache: options.next ? undefined : 'no-store',
        ...options,
        perspective,
      })
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
