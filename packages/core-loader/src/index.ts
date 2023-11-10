import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import type { SanityStegaClient } from '@sanity/client/stega'
import { type Cache, createCache } from 'async-cache-dedupe'
import { atom, map, type MapStore, onMount, startTask } from 'nanostores'

import { runtime } from './env'
import { defineEnableLiveMode } from './live-mode'
import type { EnableLiveMode, Fetcher, QueryStoreState } from './types'

export type { MapStore }

export type * from './types'
export type { WritableAtom } from 'nanostores'

/** @public */
export interface CreateQueryStoreOptions {
  /**
   * The Sanity client to use for fetching data, or `false` if `ssr: true` and it's set with `setServerClient` later
   * You may use any client that is an `instanceof SanityClient` or `instanceof SanityStegaClient`.
   * @example `import {createClient} from '@sanity/client'`
   * @example `import {createClient} from '@sanity/client/stega'`
   * @example `import {createClient} from '@sanity/preview-kit/client'`
   * @example `import {createClient} from 'next-sanity'`
   */
  client: SanityClient | SanityStegaClient | false
  /**
   * If you want all data fetching to be done server-side in production, set this to `true` and `client: false`.
   * Then, in your server entry file, you can set the Sanity client with `setServerClient`.
   */
  ssr?: boolean
}

/** @public */
export interface QueryStore {
  createFetcherStore: <
    QueryResponseResult = unknown,
    QueryResponseError = unknown,
  >(
    query: string,
    params?: QueryParams,
    /**
     * Initial `data` and `sourceMap`, used with SSR hydration and is required if `ssr: true`
     * and an optional speed optimization if `ssr: false`
     */
    initial?: {
      data: QueryResponseResult
      sourceMap: ContentSourceMap | undefined
      perspective: ClientPerspective | undefined
    },
  ) => MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>>
  /**
   * When `ssr: true` you call this in your server entry point that imports the result of `createQueryStore` instance.
   * It's required to call it before any data fetching is done, and it can only be called once.
   */
  setServerClient: (client: SanityClient | SanityStegaClient) => void
  enableLiveMode: EnableLiveMode
  /** @internal */
  unstable__cache: Cache & {
    fetch: <QueryResponseResult>(key: string) => Promise<{
      result: QueryResponseResult
      resultSourceMap: ContentSourceMap | undefined
    }>
  }
  /** @internal */
  unstable__serverClient: {
    /**
     * Only set if `ssr: true` and `setServerClient` has been called.
     */
    instance: SanityClient | SanityStegaClient | undefined
    /**
     * Will be `true` if the client given to `setServerClient` has a token configured.
     */
    canPreviewDrafts?: boolean
  }
}

function cloneClientWithConfig(
  newClient: SanityClient | SanityStegaClient,
): SanityClient | SanityStegaClient {
  return newClient.withConfig({
    allowReconfigure: false,
    perspective: 'published',
    resultSourceMap: 'withKeyArraySelector',
  })
}

/** @public */
export const createQueryStore = (
  options: CreateQueryStoreOptions,
): QueryStore => {
  const { ssr = false } = options
  if (ssr && options.client) {
    throw new TypeError(
      '`client` option is not allowed when `ssr: true`, use `setServerClient` from your server entry point instead',
    )
  }
  if (!ssr && options.client === false) {
    throw new TypeError(
      `You must set \`ssr: true\` when \`client: false\` is used`,
    )
  }
  if (!ssr && !options.client) {
    throw new TypeError(`\`client\` is required`)
  }
  let client = ssr
    ? undefined
    : cloneClientWithConfig(options.client as SanityClient | SanityStegaClient)

  const cache = createCache().define('fetch', async (key: string) => {
    if (!client) {
      throw new Error(
        `You have to set the Sanity client with \`setServerClient\` before any data fetching is done`,
      )
    }
    const { query, params = {} } = JSON.parse(key)
    const { result, resultSourceMap } = await client.fetch(query, params, {
      filterResponse: false,
    })
    return { result, resultSourceMap }
  })

  let defaultFetcherCreated = false
  function createDefaultFetcher(): Fetcher {
    if (defaultFetcherCreated) {
      throw new Error('Default fetcher can only be created once')
    }
    defaultFetcherCreated = true
    const initialPerspective = client?.config().perspective || 'published'

    return {
      hydrate: (_query, _params, initial) => ({
        loading:
          initial?.data === undefined || initial?.sourceMap === undefined,
        error: undefined,
        data: initial?.data,
        sourceMap: initial?.sourceMap,
        perspective: initialPerspective,
      }),
      fetch: (query, params, $fetch, controller) => {
        if (controller.signal.aborted) return

        const finishTask = startTask()

        $fetch.setKey('loading', true)
        $fetch.setKey('error', undefined)
        cache
          .fetch(JSON.stringify({ query, params }))
          .then((response) => {
            if (controller.signal.aborted) return
            $fetch.setKey('data', response.result)
            $fetch.setKey('sourceMap', response.resultSourceMap)
            $fetch.setKey('perspective', initialPerspective)
          })
          .catch((reason) => {
            $fetch.setKey('error', reason)
          })
          .finally(() => {
            $fetch.setKey('loading', false)
            finishTask()
          })
      },
    } satisfies Fetcher
  }

  const $fetcher = atom<Fetcher | undefined>(
    client ? createDefaultFetcher() : undefined,
  )

  const enableLiveMode = defineEnableLiveMode({
    client: client || undefined,
    ssr,
    setFetcher: (fetcher) => {
      const originalFetcher = $fetcher.get()
      $fetcher.set(fetcher)
      return () => $fetcher.set(originalFetcher)
    },
  })

  const createFetcherStore: QueryStore['createFetcherStore'] = <
    QueryResponseResult,
    QueryResponseError,
  >(
    query: string,
    params: QueryParams = {},
    initial?: Pick<
      QueryStoreState<QueryResponseResult, QueryResponseError>,
      'data' | 'sourceMap' | 'perspective'
    >,
  ): MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>> => {
    const fetcher = $fetcher.get()
    const $fetch = map<
      QueryStoreState<QueryResponseResult, QueryResponseError>
    >(
      fetcher
        ? fetcher.hydrate(query, params, initial)
        : {
            loading: false,
            error:
              typeof initial?.data === 'undefined'
                ? (new Error(
                    `The \`initial\` option is required when \`ssr: true\``,
                  ) as QueryResponseError)
                : undefined,
            data: initial?.data,
            sourceMap: initial?.sourceMap,
            perspective: initial?.perspective,
          },
    )

    onMount($fetch, () => {
      let controller = new AbortController()
      const unsubscribe = $fetcher.subscribe((fetcher) => {
        if (!fetcher || controller.signal.aborted) return
        controller.abort()
        controller = new AbortController()
        fetcher.fetch(query, params, $fetch, controller)
      })

      return () => {
        controller.abort()
        unsubscribe()
      }
    })

    return $fetch
  }
  const unstable__serverClient: QueryStore['unstable__serverClient'] = {
    instance: undefined,
    canPreviewDrafts: false,
  }
  let serverClientCalled = false
  const setServerClient: QueryStore['setServerClient'] = (newClient) => {
    if (runtime !== 'server') {
      throw new Error(
        '`setServerClient` can only be called in server environments, detected: ' +
          JSON.stringify(runtime),
      )
    }
    if (!ssr) {
      throw new Error('`setServerClient` can only be called when `ssr: true`')
    }
    if (serverClientCalled) {
      throw new Error('`setServerClient` can only be called once')
    }
    serverClientCalled = true
    unstable__serverClient.instance = client = cloneClientWithConfig(newClient)
    unstable__serverClient.canPreviewDrafts = !!client.config().token
    $fetcher.set(createDefaultFetcher())
  }

  return {
    createFetcherStore,
    enableLiveMode,
    setServerClient,
    unstable__cache: cache,
    unstable__serverClient,
  }
}

export { runtime } from './env'
