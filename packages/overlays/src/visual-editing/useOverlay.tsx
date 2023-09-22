import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { OverlayController, OverlayDispatchHandler } from 'src/types'

import { createOverlayController } from '../controller'

// @todo This seems like a hacky way of avoiding dependencies?
function useStableHandler(
  handler: OverlayDispatchHandler,
): OverlayDispatchHandler {
  // Store the handler as a ref
  const handlerRef = useRef<OverlayDispatchHandler | null>(null)

  // Set the ref before render
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  // Return a stable function
  return useCallback<OverlayDispatchHandler>(
    (...args) => handlerRef.current?.(...args),
    [],
  )
}

export function useOverlay(
  element: HTMLElement | null,
  handler: OverlayDispatchHandler,
): OverlayController | undefined {
  const overlayController = useRef<OverlayController | undefined>()

  const stableHandler = useStableHandler(handler)

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler: stableHandler,
      overlayElement: element,
    })

    return () => {
      overlayController.current?.destroy()
    }
  }, [element, stableHandler])

  return overlayController.current
}
