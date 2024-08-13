import type {ChannelsNode} from '@repo/channels'
import type {VisualEditingAPI} from '@repo/visual-editing-helpers'
import {type FunctionComponent, useEffect, useRef} from 'react'

import type {VisualEditingOptions} from '../types'

/**
 * @internal
 */
export const Refresh: FunctionComponent<
  {
    channel: ChannelsNode<VisualEditingAPI>
  } & Required<Pick<VisualEditingOptions, 'refresh'>>
> = (props) => {
  const {channel, refresh} = props

  const manualRefreshRef = useRef(0)
  const mutationRefreshRef = useRef(0)
  useEffect(
    () =>
      channel.on('refresh', (data) => {
        if (data.source === 'manual') {
          clearTimeout(manualRefreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          channel.post('refreshing', data)
          let timedOut = false
          manualRefreshRef.current = window.setTimeout(() => {
            channel.post('refreshed', data)
            timedOut = true
          }, 3000)
          promise?.finally?.(() => {
            if (timedOut) return
            clearTimeout(manualRefreshRef.current)
            channel.post('refreshed', data)
          })
        } else if (data.source === 'mutation') {
          clearTimeout(mutationRefreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          channel.post('refreshing', data)
          // Send an additional refresh to account for Content Lake eventual consistency
          mutationRefreshRef.current = window.setTimeout(() => {
            const promise = refresh(data)
            if (promise === false) return
            channel.post('refreshing', data)
            promise?.finally?.(() => {
              channel.post('refreshed', data)
            }) || channel.post('refreshed', data)
          }, 1000)
          promise?.finally?.(() => {
            channel.post('refreshed', data)
          }) || channel.post('refreshed', data)
        }
      }),
    [channel, refresh],
  )

  return null
}
