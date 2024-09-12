import {type MutableRefObject, useEffect, useRef} from 'react'

import {createOverlayController} from '../controller'
import type {OverlayController, OverlayEventHandler} from '../types'

/**
 * Hook for using an overlay controller
 * @internal
 */
export function useController(
  element: HTMLElement | null,
  handler: OverlayEventHandler,
  inFrame: boolean,
): MutableRefObject<OverlayController | undefined> {
  const overlayController = useRef<OverlayController | undefined>()

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler,
      overlayElement: element,
      inFrame,
    })

    return () => {
      overlayController.current?.destroy()
      overlayController.current = undefined
    }
  }, [element, handler, inFrame])

  return overlayController
}
