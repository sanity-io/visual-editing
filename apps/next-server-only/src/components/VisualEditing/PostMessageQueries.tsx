'use client'

import { type ChannelsNode, createChannelsNode } from '@sanity/channels'
import type { ContentSourceMapDocuments } from '@sanity/client/csm'
import {
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import { ClientPerspective, ContentSourceMap } from '@sanity/client/csm'
import { useLiveMode, useQuery } from '@sanity/react-loader'
import isEqual from 'fast-deep-equal'
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'
import { revalidate } from './actions'
import { client } from '@/lib/client'

type PostMessageQueriesProps = {
  payload: string
}

type CacheValue = {
  data: unknown
  sourceMap: ContentSourceMap | undefined
}
const queriesInUse = new Map<string, CacheValue>()
const listeners = new Set<(state: typeof queriesInUse) => void>()
const addEventListener = (cb: (state: typeof queriesInUse) => void) => {
  cb(queriesInUse)
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const addQuery = (payload: any) => {
  const { projectId, dataset, query, params, perspective, data, sourceMap } =
    payload
  const id = JSON.stringify({
    projectId,
    dataset,
    query,
    params: params || {},
    perspective,
  })
  queriesInUse.set(id, { data, sourceMap })
  listeners.forEach((cb) => cb(queriesInUse))
  return () => {
    queriesInUse.delete(id)
    listeners.forEach((cb) => cb(queriesInUse))
  }
}

export function PostMessageQueries(props: PostMessageQueriesProps) {
  const { payload } = props
  useEffect(() => {
    console.log('PostMessageQueries is running', { payload })
    const remove = addQuery(payload)
    return () => remove()
  }, [payload])

  return null
}

type RevalidateQueryProps = {
  projectId: string
  dataset: string
  query: string
  params: Record<string, any>
  perspective: ClientPerspective
  data: any
  sourceMap: ContentSourceMap
  tags: string[]
}

export function RevalidateQuery(props: RevalidateQueryProps) {
  const {
    projectId,
    dataset,
    query,
    params = {},
    perspective,
    data,
    sourceMap,
    tags,
  } = props
  const payload = useMemo(
    () =>
      JSON.stringify({
        projectId,
        dataset,
        query,
        params,
        perspective,
        data,
        sourceMap,
      }),
    [data, dataset, params, perspective, projectId, query, sourceMap],
  )
  useEffect(() => {
    console.log('RevalidateQuery is running', { payload: JSON.parse(payload) })
    const remove = addQuery(JSON.parse(payload))
    return () => remove()
  }, [payload])
  const snapshot = useQuery(query, params)
  const snapshotRef = useRef(snapshot)
  const revalidateRef = useRef<number>(0)

  useEffect(() => {
    if ('debugReactLoader' in window) {
      // @ts-ignore
      window.debugReactLoader(snapshotRef.current.data, snapshot.data)
    }
    if (
      !snapshot.loading &&
      snapshot.perspective === perspective &&
      snapshotRef.current.data &&
      !isEqual(snapshotRef.current.data, snapshot.data)
      ) {
        clearTimeout(revalidateRef.current)
        revalidate({tags})
        revalidateRef.current = window.setTimeout(() => {
          revalidate({tags})
        }, 1000)
      }
      snapshotRef.current = snapshot
    }, [perspective, snapshot, tags])

    /*
    const [shouldRevalidate, setShouldRevalidate] = useState(false)
  const revalidating = useRef(false)
  useEffect(() => {
    if (revalidating.current) {
      return
    }
    if (shouldRevalidate) {
      revalidating.current = true
      setShouldRevalidate(false)
      console.log('revalidating', { tags })
      revalidate({ tags }).finally(() => {
        revalidating.current = false
      })
    }
  }, [shouldRevalidate, tags])
  // */

  return null
}

export function PostMessageDone(props: PostMessageQueriesProps) {
  const timeoutRef = useRef<number>(0)
  useEffect(() => {
    clearTimeout(timeoutRef.current)
    return () => {
      timeoutRef.current = window.setTimeout(() => {
        console.log(props.payload)
      }, 1000)
    }
  }, [props.payload])
}

const PostMessageContext = createContext<((add: any) => () => void) | null>(
  null,
)

export function PostMessageReporter(props: PropsWithChildren) {
  /*
  const [channel, setChannel] = useState<
    ChannelsNode<VisualEditingMsg> | undefined
  >()

  useEffect(() => {
    const channel = createChannelsNode<VisualEditingMsg>({
      id: 'preview-kit' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
    })
    const timeout = setTimeout(() => setChannel(channel), 0)
    return () => {
      clearTimeout(timeout)
      channel.destroy()
      setChannel(undefined)
    }
  }, [])

  useEffect(() => {
    console.log('PostMessageReporter is running')
    const handler = (state: typeof queriesInUse) => {
      console.log('state', state)
      let projectId: string | undefined = undefined
      let dataset: string | undefined = undefined
      let perspective: ClientPerspective | undefined = undefined
      const documents: ContentSourceMapDocuments = []
      for (const [key, value] of state) {
        const { query, params, ...parsed } = JSON.parse(key)
        if (!projectId) {
          projectId = parsed.projectId
        }
        if (!dataset) {
          dataset = parsed.dataset
        }
        if (!perspective) {
          perspective = parsed.perspective
        }
        if (value.sourceMap?.documents) {
          documents.push(...value.sourceMap.documents)
        }
      }
      console.log('sending', {
        projectId,
        dataset,
        perspective,
        documents,
      })
      channel?.send('preview-kit/documents', {
        projectId: projectId!,
        dataset: dataset!,
        perspective: perspective!,
        documents,
      })
    }
    const unlisten = addEventListener(handler)
    return () => {
      unlisten()
    }
  }, [channel])
  // */

  useLiveMode({ client })

  return null
}

export function PostMessageProvider(props: PropsWithChildren) {
  const [state, setState] = useState(() => new Set())

  const value = useCallback((add: any) => {
    setState((prev) => {
      const prevSize = prev.size
      const next = new Set(prev)
      next.add(add)
      if (next.size === prevSize) {
        return prev
      }
      return next
    })
    return () => {
      setState((prev) => {
        const prevSize = prev.size
        const next = new Set(prev)
        next.delete(add)
        if (next.size === prevSize) {
          return prev
        }
        return next
      })
    }
  }, [])

  useEffect(() => {
    console.log('provider is running', { state })
  }, [state])

  return (
    <PostMessageContext.Provider value={value}></PostMessageContext.Provider>
  )
}
