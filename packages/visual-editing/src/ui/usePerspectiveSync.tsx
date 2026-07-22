import type {ClientPerspective} from '@sanity/client'
import type {VisualEditingControllerMsg} from '@sanity/presentation-comlink'
import {useEffect, useEffectEvent} from 'react'

import type {OverlayMsg, VisualEditingNode} from '../types'

export function usePerspectiveSync(
  comlink: VisualEditingNode | undefined,
  dispatch: (value: OverlayMsg | VisualEditingControllerMsg) => void,
  onPerspectiveChange?: (perspective: ClientPerspective) => void,
  onVariantChange?: (variant: string | undefined) => void,
): void {
  const handlesPerspectiveChange = !!onPerspectiveChange
  const handlesVariantChange = !!onVariantChange
  const handlePerspective = useEffectEvent(
    (data: {perspective: ClientPerspective; variant?: string}) => {
      dispatch({type: 'presentation/perspective', data})
      onPerspectiveChange?.(data.perspective)
      onVariantChange?.(data.variant || undefined)
    },
  )
  useEffect(() => {
    const controller = new AbortController()
    comlink
      ?.fetch(
        'visual-editing/fetch-perspective',
        {handlesPerspectiveChange, handlesVariantChange},
        {
          signal: controller.signal,
          suppressWarnings: true,
        },
      )
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
  }, [comlink, dispatch, handlesPerspectiveChange, handlesVariantChange])
}
