import {
  type ChannelMsg,
  type ChannelsEventHandler,
  type ChannelsNode,
  type ChannelStatus,
  createChannelsNode,
} from '@sanity/channels'
import type { VisualEditingConnectionIds } from '@sanity/visual-editing-helpers'
import { useEffect, useRef, useState } from 'react'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useChannel<T extends ChannelMsg>(
  handler: ChannelsEventHandler<T>,
): {
  channel: ChannelsNode<T> | undefined
  status: ChannelStatus | undefined
} {
  const channelRef = useRef<ChannelsNode<T>>()
  const [status, setStatus] = useState<ChannelStatus>()

  useEffect(() => {
    const channel = createChannelsNode<T>({
      id: 'overlays' satisfies VisualEditingConnectionIds,
      connectTo: 'presentation' satisfies VisualEditingConnectionIds,
      onEvent: handler,
      onStatusUpdate: setStatus,
    })
    channelRef.current = channel
    return () => {
      channel.destroy()
      channelRef.current = undefined
    }
  }, [handler])

  return {
    channel: channelRef.current,
    status,
  }
}
