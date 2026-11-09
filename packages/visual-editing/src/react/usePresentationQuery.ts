import type {
  ClientParams,
  ClientPerspective,
  ClientReturn,
  ContentSourceMap,
  QueryParams,
  QueryWithoutParams,
} from '@sanity/client'
import {stegaEncodeSourceMap} from '@sanity/client/stega'
import type {LoaderControllerMsg} from '@sanity/presentation-comlink'
import {dequal} from 'dequal/lite'
import {useEffect, useEffectEvent, useMemo, useReducer, useState, useSyncExternalStore} from 'react'

import {
  addQueryListener,
  comlink as comlinkSnapshot,
  comlinkDataset,
  comlinkPerspective,
  comlinkProjectId,
  comlinkVariant,
  subscribe,
} from '../ui/loader-comlink/context'

/** @alpha */
export type UsePresentationQueryReturnsInactive = {
  data: null
  sourceMap: null
  perspective: null
  variant: null
}

/** @alpha */
export type UsePresentationQueryReturnsActive<QueryString extends string> = {
  data: ClientReturn<QueryString>
  sourceMap: ContentSourceMap | null
  perspective: ClientPerspective
  variant: string | undefined
}

/**
 * Returns the inactive state when no Presentation Tool connection is available,
 * or the active state with query results when connected.
 * @alpha
 */
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
      if (dequal(state, payload)) return state

      const current = state.perspective === null ? undefined : state
      return {
        data: current && dequal(current.data, payload.data) ? current.data : payload.data,
        sourceMap:
          current && dequal(current.sourceMap, payload.sourceMap)
            ? current.sourceMap
            : payload.sourceMap,
        perspective:
          current && dequal(current.perspective, payload.perspective)
            ? current.perspective
            : payload.perspective,
        variant:
          current && dequal(current.variant, payload.variant) ? current.variant : payload.variant,
      }
    default:
      return state
  }
}

const initialState: UsePresentationQueryReturnsInactive = {
  data: null,
  sourceMap: null,
  perspective: null,
  variant: null,
}

const EMPTY_QUERY_PARAMS: QueryParams = {}
const LISTEN_HEARTBEAT_INTERVAL = 20_000

function isThenable(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  )
}

/**
 * Returns a referentially stable params value when only the object identity changed.
 * Thenables are stored once so a promise created during render cannot retrigger forever;
 * the listen effect reads the latest thenable separately.
 */
function useStableQueryParams<T>(params: T): T {
  const [stableParams, setStableParams] = useState(params)
  const paramsAreThenable = isThenable(params)
  const stableAreThenable = isThenable(stableParams)

  if (paramsAreThenable || stableAreThenable) {
    if (paramsAreThenable !== stableAreThenable) {
      setStableParams(params)
      return params
    }
    return stableParams
  }

  if (stableParams === params || dequal(stableParams, params)) return stableParams
  setStableParams(params)
  return params
}

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
  params?:
    | ClientParams<QueryString>
    | QueryWithoutParams
    | Promise<ClientParams<QueryString> | QueryWithoutParams>
  stega?: boolean
}): UsePresentationQueryReturns<QueryString> {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {query, params = EMPTY_QUERY_PARAMS, stega = true} = props
  const stableParams = useStableQueryParams(params)

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

  const variant = useSyncExternalStore(
    subscribe,
    () => comlinkVariant,
    () => null,
  )

  // Register this hook instance as a query listener so LoaderComlink is mounted
  useEffect(() => addQueryListener(), [])

  // Latest params for thenables, whose identity is not a safe effect dependency.
  const readParams = useEffectEvent(() => params)

  const handleQueryChange = useEffectEvent(
    (event: Extract<LoaderControllerMsg, {type: 'loader/query-change'}>['data']) => {
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
            variant: event.variant || undefined,
          },
        })
      }
    },
  )

  useEffect(() => {
    if (!comlink) return
    return comlink.on('loader/query-change', handleQueryChange)
  }, [comlink])

  useEffect(() => {
    // The comlink connects before Presentation sends project, dataset, and perspective.
    // Re-listen as soon as those values, the variant, the query, or its params are available.
    // The heartbeat is only a keepalive, not the first chance to subscribe.
    if (!comlink || !projectId || !dataset || !perspective) return

    const listen = () => {
      comlink.post('loader/query-listen', {
        projectId,
        dataset,
        perspective,
        variant: variant ?? undefined,
        query,
        params: isThenable(stableParams) ? readParams() : stableParams,
        heartbeat: LISTEN_HEARTBEAT_INTERVAL,
      })
    }

    listen()
    const interval = setInterval(listen, LISTEN_HEARTBEAT_INTERVAL)
    return () => clearInterval(interval)
  }, [comlink, dataset, perspective, projectId, query, stableParams, variant])

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
