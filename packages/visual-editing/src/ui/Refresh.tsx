import {type FunctionComponent, useEffect, useRef} from 'react'

import type {VisualEditingChannel, VisualEditingOptions} from '../types'

/**
 * @internal
 */
export const Refresh: FunctionComponent<
  {
    channel: VisualEditingChannel
  } & Required<Pick<VisualEditingOptions, 'refresh'>>
> = (props) => {
  const {channel, refresh} = props

  const manualRefreshRef = useRef(0)
  const mutationRefreshRef = useRef(0)
  useEffect(
    () =>
      channel.subscribe((type, data) => {
        if (type === 'presentation/refresh' && data.source === 'manual') {
          clearTimeout(manualRefreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          channel.send('visual-editing/refreshing', data)
          let timedOut = false
          manualRefreshRef.current = window.setTimeout(() => {
            channel.send('visual-editing/refreshed', data)
            timedOut = true
          }, 3000)
          promise?.finally?.(() => {
            if (timedOut) return
            clearTimeout(manualRefreshRef.current)
            channel.send('visual-editing/refreshed', data)
          })
        } else if (type === 'presentation/refresh' && data.source === 'mutation') {
          clearTimeout(mutationRefreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          channel.send('visual-editing/refreshing', data)
          // Send an additional refresh to account for Content Lake eventual consistency
          mutationRefreshRef.current = window.setTimeout(() => {
            const promise = refresh(data)
            if (promise === false) return
            channel.send('visual-editing/refreshing', data)
            promise?.finally?.(() => {
              channel.send('visual-editing/refreshed', data)
            }) || channel.send('visual-editing/refreshed', data)
          }, 1000)
          promise?.finally?.(() => {
            channel.send('visual-editing/refreshed', data)
          }) || channel.send('visual-editing/refreshed', data)
        }
      }),
    [channel, refresh],
  )

  return null
}
