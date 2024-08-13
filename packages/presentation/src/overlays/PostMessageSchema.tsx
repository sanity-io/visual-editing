import type {ChannelsChannel} from '@repo/channels'
import type {PresentationAPI} from '@repo/visual-editing-helpers'
import {useRootTheme} from '@sanity/ui'
import {memo, useEffect, useMemo} from 'react'
import {useWorkspace} from 'sanity'

import {extractSchema} from './schema'

export interface PostMessageSchemaProps {
  channel: ChannelsChannel<PresentationAPI, 'visual-editing'>
}

/**
 * Experimental approach for sending a representation of the workspace schema
 * over postMessage so it can be used to enrich the Visual Editing experience
 */
function PostMessageSchema(props: PostMessageSchemaProps): JSX.Element | null {
  const {channel} = props

  const workspace = useWorkspace()
  const theme = useRootTheme()
  const schema = useMemo(() => extractSchema(workspace, theme), [workspace, theme])

  useEffect(() => {
    channel.post('schema', {schema})
  }, [channel, schema])

  return null
}

export default memo(PostMessageSchema)
