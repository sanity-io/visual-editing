import type {
  UnresolvedPath,
  VisualEditingControllerMsg,
  VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import type {ConnectionInstance} from '@sanity/comlink'
import {useRootTheme} from '@sanity/ui'
import {memo, useEffect, useMemo} from 'react'

import {API_VERSION} from '../../constants'
import {useClient, useWorkspace} from '../../internals'
import {extractSchema} from './extract'

export interface PostMessageSchemaProps {
  comlink: ConnectionInstance<VisualEditingNodeMsg, VisualEditingControllerMsg>
  perspective: ClientPerspective
}

function getDocumentPathArray(paths: UnresolvedPath[]) {
  const documentPathMap = paths.reduce(
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

  return Object.entries(documentPathMap)
}

/**
 * Experimental approach for sending a representation of the workspace schema
 * over postMessage so it can be used to enrich the Visual Editing experience
 */
function PostMessageSchema(props: PostMessageSchemaProps): JSX.Element | null {
  const {comlink, perspective} = props

  const workspace = useWorkspace()
  const theme = useRootTheme()
  const schema = useMemo(() => extractSchema(workspace, theme), [workspace, theme])

  // Send a representation of the schema to the visual editing context
  useEffect(() => {
    comlink.post({type: 'presentation/schema', data: {schema}})
  }, [comlink, schema])

  const client = useClient({apiVersion: API_VERSION})

  // Resolve union types from an array of unresolved paths
  useEffect(() => {
    return comlink.on('visual-editing/schemaUnionTypes', async (data) => {
      const documentPathArray = getDocumentPathArray(data.paths)
      const unionTypes = await Promise.all(
        documentPathArray.map(async ([id, paths]) => {
          const arr = Array.from(paths)
          const projection = arr.map((path, i) => `"${i}": ${path}[0]._type`).join(',')
          const query = `*[_id == $id][0]{${projection}}`
          const result = await client.fetch(query, {id}, {perspective, tag: 'presentation-schema'})
          const mapped = arr.map((path, i) => ({path: path, type: result[i]}))
          return {id, paths: mapped}
        }),
      )

      const newState = new Map()
      unionTypes.forEach((action) => {
        newState.set(action.id, new Map(action.paths.map(({path, type}) => [path, type])))
      })
      return {types: newState}
    })
  }, [comlink, client, perspective])

  return null
}

export default memo(PostMessageSchema)
