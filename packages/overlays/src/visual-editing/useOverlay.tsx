import { useEffect, useRef } from 'react'

import { createOverlayController } from '../controller'
import { OverlayController, OverlayEventHandler } from '../types'

export function useOverlay(
  element: HTMLElement | null,
  handler: OverlayEventHandler,
): OverlayController | undefined {
  const overlayController = useRef<OverlayController | undefined>()

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler,
      overlayElement: element,
    })

    return () => {
      overlayController.current?.deactivate()
    }
  }, [element, handler])

  return overlayController.current
}
