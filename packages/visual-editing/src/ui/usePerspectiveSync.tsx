import type {ClientPerspective} from '@sanity/client'
import type {VisualEditingControllerMsg} from '@sanity/presentation-comlink'

import {useEffect, useEffectEvent} from 'react'

import type {OverlayMsg, VisualEditingNode} from '../types'

export function usePerspectiveSync(
  comlink: VisualEditingNode | undefined,
  dispatch: (value: OverlayMsg | VisualEditingControllerMsg) => void,
  onPerspectiveChange?: (perspective: ClientPerspective) => void,
): void {
  const handlePerspective = useEffectEvent((data: {perspective: ClientPerspective}) => {
    dispatch({type: 'presentation/perspective', data})
    onPerspectiveChange?.(data.perspective)
  })
  useEffect(() => {
    const controller = new AbortController()
    comlink
      ?.fetch('visual-editing/fetch-perspective', undefined, {
        signal: controller.signal,
        suppressWarnings: true,
      })
      .then((data) => {
        handlePerspective(data)
      })
      .catch(() => {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      })

    const unsub = comlink?.on('presentation/perspective', (data) => {
      handlePerspective(data)
    })

    return () => {
      unsub?.()
      controller.abort()
    }
  }, [comlink, dispatch])
}
