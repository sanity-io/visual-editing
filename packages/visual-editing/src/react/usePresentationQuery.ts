import type {ClientPerspective, ClientReturn, ContentSourceMap, QueryParams} from '@sanity/client'
import type {LoaderControllerMsg} from '@sanity/presentation-comlink'

import {stegaEncodeSourceMap} from '@sanity/client/stega'
import {dequal} from 'dequal/lite'
import {useEffect, useMemo, useReducer, useRef, useSyncExternalStore} from 'react'

import {
  comlink as comlinkSnapshot,
  comlinkDataset,
  comlinkPerspective,
  comlinkProjectId,
  subscribe,
} from '../ui/loader-comlink/context'

/** @alpha */
export type UsePresentationQueryReturnsInactive = {
  data: null
  sourceMap: null
  perspective: null
}

/** @alpha */
export type UsePresentationQueryReturnsActive<QueryString extends string> = {
  data: ClientReturn<QueryString>
  sourceMap: ContentSourceMap | null
  perspective: ClientPerspective
}

export type UsePresentationQueryReturns<QueryString extends string> =
  | UsePresentationQueryReturnsInactive
  | UsePresentationQueryReturnsActive<QueryString>

type Action<QueryString extends string> = {
  type: 'query-change'
  payload: UsePresentationQueryReturnsActive<QueryString>
}

function reducer<QueryString extends string>(
  state: UsePresentationQueryReturns<QueryString>,
  {type, payload}: Action<QueryString>,
): UsePresentationQueryReturns<QueryString> {
  switch (type) {
    case 'query-change':
      return dequal(state, payload)
        ? state
        : {
            ...state,
            data: dequal(state.data, payload.data)
              ? (state.data as ClientReturn<QueryString>)
              : payload.data,
            sourceMap: dequal(state.sourceMap, payload.sourceMap)
              ? state.sourceMap
              : payload.sourceMap,
            perspective: dequal(state.perspective, payload.perspective)
              ? (state.perspective as Exclude<ClientPerspective, 'raw'>)
              : payload.perspective,
          }
    default:
      return state
  }
}

const initialState: UsePresentationQueryReturnsInactive = {
  data: null,
  sourceMap: null,
  perspective: null,
}

const EMPTY_QUERY_PARAMS: QueryParams = {}
const LISTEN_HEARTBEAT_INTERVAL = 10_000

/**
 * Experimental hook that can run queries in Presentation Tool.
 * Query results are sent back over postMessage whenever the query results change.
 * It also works with optimistic updates in the studio itself, offering low latency updates.
 * It's not as low latency as the `useOptimistic` hook, but it's a good compromise for some use cases.
 *
 * Requires `<VisualEditing />` to be rendered on the page to establish the comlink connection.
 * @alpha
 */
export function usePresentationQuery<const QueryString extends string>(props: {
  query: QueryString
  params?: QueryParams | Promise<QueryParams>
  stega?: boolean
}): UsePresentationQueryReturns<QueryString> {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {query, params = EMPTY_QUERY_PARAMS, stega = true} = props

  const comlink = useSyncExternalStore(
    subscribe,
    () => comlinkSnapshot,
    () => null,
  )

  const projectId = useSyncExternalStore(
    subscribe,
    () => comlinkProjectId,
    () => null,
  )

  const dataset = useSyncExternalStore(
    subscribe,
    () => comlinkDataset,
    () => null,
  )

  const perspective = useSyncExternalStore(
    subscribe,
    () => comlinkPerspective,
    () => null,
  )

  // Use refs to access latest values inside effects without re-creating intervals/subscriptions
  const latestRef = useRef({projectId, dataset, perspective, query, params})
  useEffect(() => {
    latestRef.current = {projectId, dataset, perspective, query, params}
  })

  useEffect(() => {
    if (!comlink) return

    const sendHeartbeat = () => {
      const {projectId, dataset, perspective, query, params} = latestRef.current
      if (!projectId || !dataset || !perspective) return
      comlink.post('loader/query-listen', {
        projectId,
        dataset,
        perspective,
        query,
        params,
        heartbeat: LISTEN_HEARTBEAT_INTERVAL,
      })
    }

    const handleQueryChange = (
      event: Extract<LoaderControllerMsg, {type: 'loader/query-change'}>['data'],
    ) => {
      const {projectId, dataset, query, params} = latestRef.current
      if (
        dequal(
          {projectId, dataset, query, params},
          {
            projectId: event.projectId,
            dataset: event.dataset,
            query: event.query,
            params: event.params,
          },
        )
      ) {
        dispatch({
          type: 'query-change',
          payload: {
            data: event.result,
            sourceMap: event.resultSourceMap || null,
            perspective: event.perspective,
          },
        })
      }
    }

    const unsubscribe = comlink.on('loader/query-change', handleQueryChange)

    // Send initial heartbeat immediately
    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, LISTEN_HEARTBEAT_INTERVAL)

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [comlink])

  return useMemo(() => {
    if (stega && state.sourceMap) {
      return {
        ...state,
        data: stegaEncodeSourceMap(state.data, state.sourceMap, {enabled: true, studioUrl: '/'}),
      }
    }
    return state
  }, [state, stega])
}
