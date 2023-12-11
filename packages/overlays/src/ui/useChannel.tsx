import {
  type ChannelsConnectionStatus,
  type ChannelsEventHandler,
  type ChannelsMsg,
  type ChannelsSubscriber,
  createChannelsSubscriber,
} from '@sanity/channels'
import type { VisualEditingConnectionIds } from '@sanity/visual-editing-helpers'
import { useEffect, useRef, useState } from 'react'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useChannel<T extends ChannelsMsg>(
  handler: ChannelsEventHandler<T>,
): {
  channel: ChannelsSubscriber<T> | undefined
  status: ChannelsConnectionStatus | undefined
} {
  const channelRef = useRef<ChannelsSubscriber<T>>()
  const [status, setStatus] = useState<ChannelsConnectionStatus>()

  useEffect(() => {
    const channel = createChannelsSubscriber<T>({
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
