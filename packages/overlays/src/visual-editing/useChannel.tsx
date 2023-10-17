import {
  ChannelEventHandler,
  ChannelMsg,
  ChannelReturns,
  createChannel,
} from 'channels'
import { useEffect, useRef } from 'react'

export function useChannel<T extends ChannelMsg>(
  handler: ChannelEventHandler<T>,
  targetOrigin: string,
): ChannelReturns<T> | undefined {
  const channelRef = useRef<ChannelReturns<T>>()

  useEffect(() => {
    const channel = createChannel<T>({
      id: 'overlays',
      connections: [
        {
          target: parent,
          targetOrigin,
          sourceOrigin: location.origin,
          id: 'composer',
        },
      ],
      handler,
    })
    channelRef.current = channel
    return () => {
      channel.disconnect()
      channelRef.current = undefined
    }
  }, [handler, targetOrigin])

  return channelRef.current
}
