import { useEffect, useRef } from 'react'
import { OverlayController, OverlayDispatchHandler } from 'src/types'

import { createOverlayController } from '../controller'

export function useOverlay(
  element: HTMLElement | null,
  handler: OverlayDispatchHandler,
): OverlayController | undefined {
  const overlayController = useRef<OverlayController | undefined>()

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler,
      overlayElement: element,
    })

    return () => {
      overlayController.current?.destroy()
    }
  }, [element, handler])

  return overlayController.current
}
