import {useEffect, useRef, type FunctionComponent} from 'react'
import type {VisualEditingNode, VisualEditingOptions} from '../types'

/**
 * @internal
 */
export const Refresh: FunctionComponent<
  {
    comlink: VisualEditingNode
  } & Required<Pick<VisualEditingOptions, 'refresh'>>
> = (props) => {
  const {comlink, refresh} = props

  const manualRefreshRef = useRef(0)
  const mutationRefreshRef = useRef(0)

  useEffect(
    () =>
      comlink.on('presentation/refresh', (data) => {
        if (data.source === 'manual') {
          clearTimeout(manualRefreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          comlink.post('visual-editing/refreshing', data)
          let timedOut = false
          manualRefreshRef.current = window.setTimeout(() => {
            comlink.post('visual-editing/refreshed', data)
            timedOut = true
          }, 3000)
          promise?.finally?.(() => {
            if (timedOut) return
            clearTimeout(manualRefreshRef.current)
            comlink.post('visual-editing/refreshed', data)
          })
        } else if (data.source === 'mutation') {
          clearTimeout(mutationRefreshRef.current)
          const promise = refresh(data)
          if (promise === false) return
          comlink.post('visual-editing/refreshing', data)
          // Send an additional refresh to account for Content Lake eventual consistency
          mutationRefreshRef.current = window.setTimeout(() => {
            const promise = refresh(data)
            if (promise === false) return
            comlink.post('visual-editing/refreshing', data)
            promise?.finally?.(() => {
              comlink.post('visual-editing/refreshed', data)
            }) || comlink.post('visual-editing/refreshed', data)
          }, 1000)
          promise?.finally?.(() => {
            comlink.post('visual-editing/refreshed', data)
          }) || comlink.post('visual-editing/refreshed', data)
        }
      }),
    [comlink, refresh],
  )

  return null
}
