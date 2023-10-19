import type { ClientPerspective, QueryParams } from '@sanity/client'
import { ChannelReturns } from 'channels'
import { useEffect, useMemo } from 'react'
import { useClient } from 'sanity'
import { VisualEditingMsg } from 'visual-editing-helpers'

import LiveStoreProvider from './LiveStoreProvider'
import { useLiveQuery } from './useLiveQuery'

export default function LoaderQueries(props: {
  channel: ChannelReturns<VisualEditingMsg> | undefined
  perspective: ClientPerspective
  liveQueries: Record<string, { query: string; params: QueryParams }>
}): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { channel, perspective, liveQueries } = props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const studioClient = useClient({ apiVersion: '2023-10-16' })
  const clientConfig = useMemo(() => studioClient.config(), [studioClient])
  const client = useMemo(
    () => studioClient.withConfig({ perspective, resultSourceMap: true }),
    [perspective, studioClient],
  )

  return (
    <LiveStoreProvider
      client={client}
      turboSourceMap
      logger={console}
      perspective={perspective}
    >
      {Object.entries(liveQueries).map(([key, { query, params }]) => (
        <QuerySubscription
          key={`${key}${perspective}`}
          projectId={clientConfig.projectId!}
          dataset={clientConfig.dataset!}
          query={query}
          params={params}
          channel={channel}
        />
      ))}
    </LiveStoreProvider>
  )
}

const initialData = {}

function QuerySubscription(props: {
  projectId: string
  dataset: string
  query: string
  params: QueryParams
  channel: ChannelReturns<VisualEditingMsg> | undefined
}) {
  const { projectId, dataset, query, params, channel } = props

  const data = useLiveQuery(initialData, query, params)
  const { result, resultSourceMap } = data || ({} as any)
  const shouldSend = useMemo(
    () => channel && initialData !== result,
    [channel, result],
  )

  useEffect(() => {
    console.log('QuerySubscription', {
      shouldSend,
      projectId,
      dataset,
      query,
      params,
      result,
    })
    if (shouldSend) {
      channel!.send('loader/query-change', {
        projectId,
        dataset,
        // perspective,
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
    projectId,
    query,
    result,
    shouldSend,
    resultSourceMap,
  ])

  return null
}
