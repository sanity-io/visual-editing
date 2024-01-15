'use client'

import { type ChannelsNode, createChannelsNode } from '@sanity/channels'
import type { ContentSourceMapDocuments } from '@sanity/client/csm'
import {
  type VisualEditingConnectionIds,
  type VisualEditingMsg,
} from '@sanity/visual-editing-helpers'
import { ClientPerspective, ContentSourceMap } from '@sanity/client/csm'
import {
  PropsWithChildren,
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

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
