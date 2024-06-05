import type {ChannelsController} from '@repo/channels'
import type {PresentationMsg, VisualEditingConnectionIds} from '@repo/visual-editing-helpers'
import {memo, useEffect, useMemo} from 'react'
import {useWorkspace} from 'sanity'

import {extractSchema} from './extractSchema'

export interface PostMessageSchemaProps {
  channel: ChannelsController<VisualEditingConnectionIds, PresentationMsg> | undefined
}

/**
 * Experimental approach for sending a representation of the workspace schema
 * over postMessage so it can be used to enrich the Visual Editing experience
 */
function PostMessageSchema(props: PostMessageSchemaProps): JSX.Element | null {
  const {channel} = props

  const workspace = useWorkspace()
  const schema = useMemo(() => extractSchema(workspace.schema, {}), [workspace.schema])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('PostMessageSchema', channel)
    channel?.send('overlays', 'presentation/schema', schema)
  }, [channel, schema])

  return null
}

export default memo(PostMessageSchema)
