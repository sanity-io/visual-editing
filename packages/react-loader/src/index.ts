import { nanoquery } from '@nanostores/query'
import type { ContentSourceMap, SanityClient } from '@sanity/client'
// import { useStore } from '@nanostores/react'
import { listenKeys } from 'nanostores'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ChannelEventHandler, ChannelMsg, ChannelReturns } from 'channels'
import { createChannel } from 'channels'

function useParams(params?: undefined | null | any): any {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params],
  )
  return useMemo(() => JSON.parse(stringifiedParams), [stringifiedParams])
}

function useStore(store: any, opts: any = {}) {
  const keys = useParams(opts.keys || [])
  const subscribe = useCallback(
    (onChange: any) =>
      keys ? listenKeys(store, keys, onChange) : store.listen(onChange),
    [keys, store],
  )

  // initialSnapshot might change before hydration is done, so deep cloning it on the first hook call
  // helps ensure that we don't get a mismatch between the server and client snapshots
  const [serverSnapshot] = useState(() => store.get())
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot])

  return useSyncExternalStore(subscribe, () => store.get(), getServerSnapshot)
}

export interface CreateQueryStoreOptions {
  client: SanityClient
}

// @TODO move this into the options somehow
const DEDUPE_TIME = 4000 // 4s
const REFETCH_ON_FOCUS = true // false
const REFETCH_ON_RECONNECT = true // false
// const REFETCH_INTERVAL = 10000 // 0
// @TODO temporarily very high
const REFETCH_INTERVAL = 1000

/**
 * Default tag to use, makes it easier to debug Content Lake requests
 */
export const DEFAULT_TAG = 'sanity.react-loader'

export const createQueryStore = (
  options: CreateQueryStoreOptions,
): {
  useQuery: <Response>(
    query: string,
    params?: any,
  ) => {
    data: Response
    sourceMap?: ContentSourceMap
    loading: boolean
    error: any
  }
  invalidate: any
  mutate: any
} => {
  const { client: _client } = options

  const config = _client.config()

  if (!config.token) {
    throw new Error('No SANITY_API_READ_TOKEN provided')
  }
  const client = _client.withConfig({
    requestTagPrefix: options.client.config().requestTagPrefix || DEFAULT_TAG,
    useCdn: false,
    perspective: 'previewDrafts',
    ignoreBrowserTokenWarning: true,
    resultSourceMap: true,
  })

  const [
    createFetcherStore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createMutatorStore,
    { invalidateKeys, mutateCache },
  ] = nanoquery({
    dedupeTime: DEDUPE_TIME,
    refetchOnFocus: REFETCH_ON_FOCUS,
    refetchOnReconnect: REFETCH_ON_RECONNECT,
    refetchInterval: REFETCH_INTERVAL,
    fetcher: async (
      ...keys: (string | number)[]
    ): Promise<{
      result: Response
      resultSourceMap?: ContentSourceMap
    }> => {
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
  // const $query = atom<string>('')
  // const $params = atom<any>({})
  const sourceDocuments = new Map<string, any>()
  const channel =
    typeof document === 'undefined'
      ? null
      : createChannel({
          id: 'overlays',
          connections: [
            {
              target: parent,
              // @TODO using parent.origin fails if the parent is on a different origin
              // targetOrigin: parent.origin,
              targetOrigin: '*',
              sourceOrigin: location.origin,
              id: 'composer',
            },
          ],
          handler: () => {},
        })

  const DEFAULT_PARAMS = {}
  const useQuery = <Response>(
    query: string,
    params: any = DEFAULT_PARAMS,
  ): {
    data: Response
    sourceMap?: ContentSourceMap
    loading: boolean
    error: any
  } => {
    const $params = useMemo(() => JSON.stringify(params), [params])
    const $fetch = useMemo(
      () => createFetcherStore([query, $params]),
      [query, $params],
    )
    const { data, loading, error } = useStore($fetch)
    const jsonDocuments = useMemo(
      () => JSON.stringify(data?.resultSourceMap?.documents || []),
      [data?.resultSourceMap?.documents],
    )
    const documents = useMemo(() => JSON.parse(jsonDocuments), [jsonDocuments])
    useEffect(() => {
      if (channel?.send) {
        channel?.send('overlay/documents', documents)
      }
    }, [channel?.send, documents])
    return {
      data: (data as any)?.result,
      sourceMap: (data as any)?.resultSourceMap,
      loading,
      error,
    }
  }

  const invalidate = (query: string) => {
    invalidateKeys(query)
  }

  const mutate = (query: string, data: any) => {
    mutateCache(query, data)
  }

  return { useQuery, invalidate, mutate }
}
