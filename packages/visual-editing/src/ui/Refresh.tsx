import { type FunctionComponent, useEffect, useRef } from 'react'

import type { VisualEditingChannel } from '../types'
import type { VisualEditingOptions } from './enableVisualEditing'

/**
 * @internal
 */
export const Refresh: FunctionComponent<
  {
    channel: VisualEditingChannel
  } & Required<Pick<VisualEditingOptions, 'refresh'>>
> = (props) => {
  const { channel, refresh } = props

  const refreshRef = useRef(0)
  useEffect(
    () =>
      channel.subscribe((type, data) => {
        if (type === 'presentation/refresh/ack' && data.source === 'manual') {
          clearTimeout(refreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          channel.send('visual-editing/refresh/syn-ack', data)
          let timedOut = false
          refreshRef.current = window.setTimeout(() => {
            channel.send('visual-editing/refresh/ack', data)
            timedOut = true
          }, 3000)
          promise?.finally?.(() => {
            if (timedOut) return
            clearTimeout(refreshRef.current)
            channel.send('visual-editing/refresh/ack', data)
          })
        }
      }),
    [channel, refresh],
  )

  return null
}
