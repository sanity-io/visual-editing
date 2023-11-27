import {
  ChannelEventHandler,
  ChannelMsg,
  ChannelReturns,
  ConnectionStatus,
  createChannel,
} from 'channels'
import { useEffect, useRef, useState } from 'react'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useChannel<T extends ChannelMsg>(
  handler: ChannelEventHandler<T>,
  targetOrigin: string,
): {
  channel: ChannelReturns<T> | undefined
  status: ConnectionStatus | undefined
} {
  const channelRef = useRef<ChannelReturns<T>>()
  const [status, setStatus] = useState<ConnectionStatus>()

  useEffect(() => {
    const channel = createChannel<T>({
      id: 'overlays',
      connections: [
        {
          target: parent,
          targetOrigin,
          id: 'presentation',
        },
      ],
      handler,
      onStatusUpdate(status) {
        setStatus(status)
      },
    })
    channelRef.current = channel
    return () => {
      channel.disconnect()
      channelRef.current = undefined
    }
  }, [handler, targetOrigin])

  return {
    channel: channelRef.current,
    status,
  }
}
