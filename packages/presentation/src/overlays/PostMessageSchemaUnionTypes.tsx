import type {
  UnresolvedPath,
  VisualEditingControllerMsg,
  VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import type {ConnectionInstance} from '@sanity/comlink'
import {type FC, memo, useEffect} from 'react'
import {useClient} from 'sanity'

import {API_VERSION} from '../constants'

export interface PostMessageSchemaUnionTypesProps {
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

const PostMessageSchemaUnionTypes: FC<PostMessageSchemaUnionTypesProps> = (props) => {
  const {comlink, perspective} = props
  const client = useClient({apiVersion: API_VERSION})

  useEffect(() => {
    return comlink.on('visual-editing/schemaTypes', async (data) => {
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

export default memo(PostMessageSchemaUnionTypes)
