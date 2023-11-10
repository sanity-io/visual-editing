import type {
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client'
import type { SanityStegaClient, StegaConfig } from '@sanity/client/stega'
import { type Cache, createCache } from 'async-cache-dedupe'
import { atom, map, type MapStore, onMount, startTask } from 'nanostores'

import { runtime } from './env'
import { isStegaClient } from './isStegaClient'
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
export interface ServerDraftModeOptions {
  /**
   * Toggle draft mode on or off.
   * If you want to change other draft mode options, like setting its `token` or `stega` settings yo
   * can do that by setting `enabled: undefined` explicitly to avoid toggling it.
   */
  enabled: boolean | undefined
  /**
   * Draft content is fetched by using the `perspective: "previewDrafts"` option.
   * It needs a token with read access, otherwise it'll return only published content.
   * Or nothing at all if the dataset is private.
   * You can either set the `token` in the `client` instance you pass to `setServerClient`, or you can set it here.
   */
  token?: string
  /**
   * Change stega settings for draft content.
   * If you only want stega to be enabled when in draft mode, you can set `stega: {enabled: true}` here.
   * It supports the same options as `stega` in `createClient`. If you specify `stega` in both your `client`
   * and here, then it'll be merged.
   */
  stega?: StegaConfig
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
    },
  ) => MapStore<QueryStoreState<QueryResponseResult, QueryResponseError>>
  /**
   * When `ssr: true` you call this in your server entry point that imports the result of `createQueryStore` instance.
   * It's required to call it before any data fetching is done, and it can only be called once.
   */
  setServerClient: (client: SanityClient | SanityStegaClient) => void
  /**
   * When `ssr: true` you can call this to fetch draft content server-side.
   * It's meant for features like "Draft Mode" in Next.js.
   * By implementing this you no longer see a "flash of published content" as you navigate in `@sanity/presentation`.
   * It also lets you see draft content when toggling Draft Mode in the Vercel Preview Toolbar.
   * @link https://vercel.com/docs/workflow-collaboration/draft-mode
   */
  setServerDraftMode: (options: ServerDraftModeOptions) => void
  enableLiveMode: EnableLiveMode
  /** @internal */
  unstable__cache: Cache & {
    fetch: <QueryResponseResult>(key: string) => Promise<{
      result: QueryResponseResult
      resultSourceMap: ContentSourceMap | undefined
    }>
  }
  /** @internal */
  unstable__serverDraftMode: {
    enabled: boolean
    client?: SanityClient | SanityStegaClient
    token?: string
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

    return {
      hydrate: (_query, _params, initial) => ({
        loading:
          initial?.data === undefined || initial?.sourceMap === undefined,
        error: undefined,
        data: initial?.data,
        sourceMap: initial?.sourceMap,
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
      'data' | 'sourceMap'
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
    client = cloneClientWithConfig(newClient)
    $fetcher.set(createDefaultFetcher())
  }
  const unstable__serverDraftMode: QueryStore['unstable__serverDraftMode'] = {
    enabled: false,
  }
  const setServerDraftMode: QueryStore['setServerDraftMode'] = (options) => {
    if (runtime !== 'server') {
      throw new Error(
        '`setServerDraftMode` can only be called in server environments, detected: ' +
          JSON.stringify(runtime),
      )
    }
    if (!ssr) {
      throw new Error(
        '`setServerDraftMode` can only be called when `ssr: true`',
      )
    }
    if (!serverClientCalled) {
      throw new Error(
        '`setServerDraftMode` can only be called after a client is setup with `setServerClient`',
      )
    }
    const { enabled, stega, token } = options
    if (enabled !== undefined) {
      unstable__serverDraftMode.enabled = enabled
    }
    if (!unstable__serverDraftMode.client) {
      unstable__serverDraftMode.client = cloneClientWithConfig(
        client!,
      ).withConfig({
        useCdn: false,
        perspective: 'previewDrafts',
      })
    }
    if (token !== undefined) {
      unstable__serverDraftMode.token = token
    }
    if (!token && !unstable__serverDraftMode.client.config().token) {
      throw new Error(
        '`token` must be set either in the client passed to `setServerClient` or in `setServerDraftMode`',
      )
    }
    if (stega !== undefined) {
      if (!isStegaClient(unstable__serverDraftMode.client)) {
        throw new Error(
          "`stega` can only be set when using `import {createClient} from '@sanity/client/stega'`",
        )
      }
      const prevStegaConfig = (
        unstable__serverDraftMode.client as SanityStegaClient
      ).config().stega
      unstable__serverDraftMode.client =
        unstable__serverDraftMode.client.withConfig({
          stega: {
            ...prevStegaConfig,
            ...stega,
          },
        })
    }
  }

  return {
    createFetcherStore,
    enableLiveMode,
    setServerClient,
    setServerDraftMode: setServerDraftMode,
    unstable__cache: cache,
    unstable__serverDraftMode: unstable__serverDraftMode,
  }
}

export { runtime } from './env'
