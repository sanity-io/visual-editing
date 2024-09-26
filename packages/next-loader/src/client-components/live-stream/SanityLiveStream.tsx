import type {LoaderControllerMsg} from '@repo/visual-editing-helpers'
import {
  type ClientPerspective,
  type ContentSourceMap,
  type InitializedClientConfig,
  type QueryParams,
} from '@sanity/client'
import {stegaEncodeSourceMap} from '@sanity/client/stega'
import isEqual from 'fast-deep-equal'
import {useCallback, useEffect, useState, useSyncExternalStore} from 'react'
import {useEffectEvent} from 'use-effect-event'
import {comlinkListeners, comlink as comlinkSnapshot} from '../../hooks/context'

/**
 * @public
 */
export interface SanityLiveStreamProps
  extends Pick<InitializedClientConfig, 'projectId' | 'dataset'> {
  query: string
  params?: QueryParams
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
  initial: React.ReactNode
  children: (result: {
    data: unknown
    sourceMap: ContentSourceMap | null
    tags: string[]
  }) => Promise<React.ReactNode>
}

const LISTEN_HEARTBEAT_INTERVAL = 1000

/**
 * @public
 */
export function SanityLiveStream(props: SanityLiveStreamProps): React.JSX.Element | null {
  const {query, dataset, params = {}, perspective, projectId, stega} = props

  const subscribe = useCallback((listener: () => void) => {
    comlinkListeners.add(listener)
    return () => comlinkListeners.delete(listener)
  }, [])

  const comlink = useSyncExternalStore(
    subscribe,
    () => comlinkSnapshot,
    () => null,
  )
  const [children, setChildren] = useState(props.initial)

  const handleQueryHeartbeat = useEffectEvent((comlink: NonNullable<typeof comlinkSnapshot>) => {
    comlink.post({
      type: 'loader/query-listen',
      data: {
        projectId: projectId!,
        dataset: dataset!,
        perspective: perspective! as ClientPerspective,
        query,
        params: params!,
        heartbeat: LISTEN_HEARTBEAT_INTERVAL,
      },
    })
  })
  const handleQueryChange = useEffectEvent(
    (event: Extract<LoaderControllerMsg, {type: 'loader/query-change'}>['data']) => {
      if (
        isEqual(
          {
            projectId,
            dataset,
            query,
            params,
          },
          {
            projectId: event.projectId,
            dataset: event.dataset,
            query: event.query,
            params: event.params,
          },
        )
      ) {
        const {result, resultSourceMap, tags} = event
        const data = stega
          ? stegaEncodeSourceMap(result, resultSourceMap, {enabled: true, studioUrl: '/'})
          : result
        props
          .children({
            data,
            sourceMap: resultSourceMap!,
            tags: tags || [],
          })
          .then(setChildren)
      }
    },
  )
  useEffect(() => {
    if (!comlink) return

    const unsubscribe = comlink.on('loader/query-change', handleQueryChange)
    const interval = setInterval(() => handleQueryHeartbeat(comlink), LISTEN_HEARTBEAT_INTERVAL)
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [comlink, handleQueryChange, handleQueryHeartbeat])

  if (!comlink) {
    return <>{props.initial}</>
  }

  return <>{children}</>
}
SanityLiveStream.displayName = 'SanityLiveStream'
