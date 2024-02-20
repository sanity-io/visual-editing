import { type FunctionComponent, useEffect, useRef } from 'react'

import type { VisualEditingChannel } from '../types'

/**
 * @internal
 */
export const Refresh: FunctionComponent<{
  channel: VisualEditingChannel
}> = (props) => {
  const { channel } = props

  const refreshRef = useRef(0)
  useEffect(
    () =>
      channel.subscribe((type, data) => {
        if (type === 'presentation/refresh/ack' && data.source === 'manual') {
          clearTimeout(refreshRef.current)
          channel.send('visual-editing/refresh/syn-ack', data)
          refreshRef.current = window.setTimeout(() => {
            channel.send('visual-editing/refresh/ack', data)
          }, 1000)
        }
      }),
    [channel],
  )

  return null
}
