import { useEffect, useRef } from 'react'

import { createOverlayController } from '../controller'
import { OverlayController, OverlayEventHandler } from '../types'

/**
 * Hook for using an overlay controller
 * @internal
 */
export function useController(
  element: HTMLElement | null,
  handler: OverlayEventHandler,
  preventDefault: boolean,
): OverlayController | undefined {
  const overlayController = useRef<OverlayController | undefined>()

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler,
      overlayElement: element,
      preventDefault,
    })

    return () => {
      overlayController.current?.deactivate()
    }
  }, [element, handler, preventDefault])

  return overlayController.current
}
