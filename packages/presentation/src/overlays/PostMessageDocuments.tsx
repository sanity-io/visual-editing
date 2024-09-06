import {
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import type {ConnectionInstance} from '@sanity/comlink'
import {useRootTheme} from '@sanity/ui'
import {memo, useEffect, useMemo} from 'react'
import {useWorkspace} from 'sanity'

import {extractSchema} from './schema'

export interface PostMessageSchemaProps {
  comlink: ConnectionInstance<VisualEditingNodeMsg, VisualEditingControllerMsg>
}

/**
 * Experimental approach for sending a representation of the workspace schema
 * over postMessage so it can be used to enrich the Visual Editing experience
 */
function PostMessageSchema(props: PostMessageSchemaProps): JSX.Element | null {
  const {comlink} = props

  const workspace = useWorkspace()
  const theme = useRootTheme()
  const schema = useMemo(() => extractSchema(workspace, theme), [workspace, theme])

  useEffect(() => {
    comlink.post({type: 'presentation/schema', data: {schema}})
  }, [comlink, schema])

  return null
}

export default memo(PostMessageSchema)
