import { ChannelReturns } from '@sanity/channels'
import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import { VisualEditingMsg } from '@sanity/visual-editing-helpers'
import { useEffect, useMemo } from 'react'
import { type SanityDocument, useClient } from 'sanity'

import LiveStoreProvider from './LiveStoreProvider'
import { useLiveQuery } from './useLiveQuery'

export default function LoaderQueries(props: {
  activePerspective: boolean
  liveDocument: SanityDocument | null
  channel: ChannelReturns<VisualEditingMsg> | undefined
  perspective: ClientPerspective
  liveQueries: Record<string, { query: string; params: QueryParams }>
}): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activePerspective, liveDocument, channel, perspective, liveQueries } =
    props
  // @TODO lift up this client instance to the root, re-use it everywhere
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const studioClient = useClient({ apiVersion: '2023-10-16' })
  const clientConfig = useMemo(() => studioClient.config(), [studioClient])
  const client = useMemo(
    () =>
      studioClient.withConfig({
        perspective,
        resultSourceMap: 'withKeyArraySelector',
      }),
    [perspective, studioClient],
  )
  useEffect(() => {
    if (channel && activePerspective) {
      const { projectId, dataset } = clientConfig
      channel.send('loader/perspective', {
        projectId: projectId!,
        dataset: dataset!,
        perspective,
      })
    }
  }, [activePerspective, channel, clientConfig, perspective])

  return (
    <LiveStoreProvider
      liveDocument={liveDocument}
      client={client}
      perspective={perspective}
      refreshInterval={activePerspective ? 2000 : 0}
    >
      {Object.entries(liveQueries).map(([key, { query, params }]) => (
        <QuerySubscription
          key={`${key}${perspective}`}
          projectId={clientConfig.projectId!}
          dataset={clientConfig.dataset!}
          perspective={perspective}
          query={query}
          params={params}
          channel={channel}
        />
      ))}
    </LiveStoreProvider>
  )
}

function QuerySubscription(props: {
  projectId: string
  dataset: string
  perspective: ClientPerspective
  query: string
  params: QueryParams
  channel: ChannelReturns<VisualEditingMsg> | undefined
}) {
  const { projectId, dataset, perspective, query, params, channel } = props

  const data = useLiveQuery<null | {
    result: any
    resultSourceMap?: ContentSourceMap
  }>(null, query, params)
  const result = data?.result
  const resultSourceMap = data?.resultSourceMap

  useEffect(() => {
    if (resultSourceMap) {
      channel!.send('loader/query-change', {
        projectId,
        dataset,
        perspective,
        query,
        params,
        result,
        resultSourceMap,
      })
    }
  }, [
    channel,
    dataset,
    params,
    perspective,
    projectId,
    query,
    result,
    resultSourceMap,
  ])

  return null
}
