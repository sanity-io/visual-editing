import type {LoaderControllerMsg} from '@repo/visual-editing-helpers'
import {
  type ClientPerspective,
  type ContentSourceMap,
  type InitializedClientConfig,
  type QueryParams,
} from '@sanity/client'
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
  const {query, dataset, params, perspective, projectId} = props

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
    (data: Extract<LoaderControllerMsg, {type: 'loader/query-change'}>['data']) => {
      if (data.projectId === projectId && data.dataset === dataset) {
        const {result, resultSourceMap} = data
        // @TODO handle stega
        // if (
        //   data.result !== undefined &&
        //   data.resultSourceMap !== undefined &&
        //   stega
        // ) {
        //   cache.set(JSON.stringify({perspective, query, params}), {
        //     ...data,
        //     result: stegaEncodeSourceMap(
        //       data.result,
        //       data.resultSourceMap,
        //       (client as SanityClient).config().stega,
        //     ),
        //   })
        // }
        // @TODO pass tags
        props.children({data: result, sourceMap: resultSourceMap!, tags: []}).then(setChildren)
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

  return <>{children}</>
}
SanityLiveStream.displayName = 'SanityLiveStream'
