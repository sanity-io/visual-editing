import type {ChannelsController} from '@repo/channels'
import type {PresentationMsg, VisualEditingConnectionIds} from '@repo/visual-editing-helpers'
import {DesktopIcon} from '@sanity/icons'
import {memo, useEffect, useMemo} from 'react'
import {renderToString} from 'react-dom/server'

export interface PostMessageRenderProps {
  channel: ChannelsController<VisualEditingConnectionIds, PresentationMsg> | undefined
}

/**
 * Experimental approach for rendering Visual Editing overlays and features
 * using React Server Components over postMessage
 */
function PostMessageRender(props: PostMessageRenderProps): JSX.Element | null {
  const {channel} = props

  const element = useMemo(() => <DesktopIcon />, [])

  useEffect(() => {
    try {
      const html = renderToString(element)
      channel?.send('overlays', 'presentation/rsc', {html})
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }, [channel, element])

  return null
}

export default memo(PostMessageRender)
