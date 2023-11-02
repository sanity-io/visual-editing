import type { ClientPerspective, QueryParams } from '@sanity/client'
import { ChannelReturns } from 'channels'
import { useEffect, useMemo } from 'react'
import { type SanityDocument, useClient } from 'sanity'
import { VisualEditingMsg } from 'visual-editing-helpers'

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

const initialData = {}

function QuerySubscription(props: {
  projectId: string
  dataset: string
  perspective: ClientPerspective
  query: string
  params: QueryParams
  channel: ChannelReturns<VisualEditingMsg> | undefined
}) {
  const { projectId, dataset, perspective, query, params, channel } = props

  const data = useLiveQuery(initialData, query, params)
  const { result, resultSourceMap } = data || ({} as any)

  useEffect(() => {
    channel!.send('loader/query-change', {
      projectId,
      dataset,
      perspective,
      query,
      params,
      result,
      resultSourceMap,
    })
  }, [
    channel,
    dataset,
    params,
    projectId,
    query,
    result,
    resultSourceMap,
    perspective,
  ])

  return null
}
