import type {ChannelsController} from '@repo/channels'
import type {
  LoaderMsg,
  PresentationMsg,
  UnresolvedPath,
  VisualEditingConnectionIds,
} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import {useEffect, useReducer, useRef, useState} from 'react'
import {useClient} from 'sanity'

import {API_VERSION} from './constants'

type ResolvedState = Map<string, Map<string, string>>

export function useResolveUnionTypes(props: {
  channel: ChannelsController<VisualEditingConnectionIds, PresentationMsg | LoaderMsg> | undefined
  perspective: ClientPerspective
}): {
  setPaths: (paths: UnresolvedPath[]) => void
  resolved: ResolvedState
} {
  const {channel, perspective} = props
  const client = useClient({apiVersion: API_VERSION})

  const pathRef = useRef([])
  const [paths, setPaths] = useState<UnresolvedPath[]>([])
  const [resolved, dispatchResolved] = useReducer(
    (
      state: ResolvedState,
      action: {
        id: string
        paths: {
          path: string
          type: any
        }[]
      },
    ): ResolvedState => {
      const newState = new Map(state)
      newState.set(action.id, new Map(action.paths.map(({path, type}) => [path, type])))
      return newState
    },
    new Map(),
  )

  useEffect(() => {
    // const documentIds = new Set(paths.map(({id}) => id))

    const foo = paths.reduce(
      (acc, {id, path}) => {
        if (acc[id]) {
          acc[id].add(path)
        } else {
          acc[id] = new Set<string>([path])
        }
        return acc
      },
      {} as Record<string, Set<string>>,
    )

    const loop = Object.entries(foo)
    for (const [id, paths] of loop) {
      const arr = Array.from(paths)
      const projection = arr
        // .map((path, i) => `'${path}': ${path}[0]._type`)
        .map((path, i) => `"${i}": ${path}[0]._type`)
        .join(',')
      const query = `*[_id == $id][0]{${projection}}`
      client.fetch(query, {id}, {perspective}).then((result) => {
        const mapped = arr.map((path, i) => ({path: path, type: result[i]}))
        dispatchResolved({id, paths: mapped})
      })
    }
    // console.log(foo)
  }, [client, paths, perspective])

  useEffect(() => {
    if (channel && resolved.size > 0) {
      channel.send('overlays', 'presentation/schemaTypes', {
        types: resolved,
      })
    }
  }, [channel, resolved])

  return {setPaths, resolved}
}
