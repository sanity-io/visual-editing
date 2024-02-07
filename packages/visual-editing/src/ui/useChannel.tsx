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
export function useChannel<
  Sends extends ChannelMsg,
  Receives extends ChannelMsg,
>(
  handler: ChannelsEventHandler<Receives>,
): {
  channel: ChannelsNode<Sends> | undefined
  status: ChannelStatus | undefined
} {
  const channelRef = useRef<ChannelsNode<Sends>>()
  const [status, setStatus] = useState<ChannelStatus>()

  useEffect(() => {
    const channel = createChannelsNode<Sends, Receives>({
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
