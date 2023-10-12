import { ContentSourceMap } from '@sanity/preview-kit/client'
import type { ChannelEventHandler, ChannelMsg, ChannelReturns } from 'channels'
import { createChannel } from 'channels'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { VisualEditingMsg } from 'visual-editing-helpers'

export function useChannel<T extends ChannelMsg>(
  handler: ChannelEventHandler<T>,
): ChannelReturns<T> | undefined {
  const channelRef = useRef<ChannelReturns<T>>()

  useEffect(() => {
    const channel = createChannel<T>({
      id: 'overlays',
      connections: [
        {
          target: parent,
          // @TODO using parent.origin fails if the parent is on a different origin
          // targetOrigin: parent.origin,
          targetOrigin: '*',
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
  }, [handler])

  return channelRef.current
}

export function useSourceDocuments(csm?: ContentSourceMap | null | undefined) {
  const [connected, setConnected] = useState(false)
  const channelEventHandler = useCallback<
    ChannelEventHandler<VisualEditingMsg>
  >((type, data) => {
    console.log('channelEventHandler', { type, data })
    // @TODO just a quick test
    setConnected(true)
  }, [])
  const channel = useChannel<VisualEditingMsg>(channelEventHandler)
  const jsonDocuments = useMemo(
    () => JSON.stringify(csm?.documents || []),
    [csm?.documents],
  )
  const documents = useMemo(() => JSON.parse(jsonDocuments), [jsonDocuments])

  useEffect(() => {
    if (!connected) {
      const timeout = setTimeout(() => setConnected(true), 1000)
      return () => clearTimeout(timeout)
    }
    console.log('sending documents', documents)
    channel?.send('overlay/documents', documents)
    return () => setConnected(false)
  }, [documents, channel, connected])
}
