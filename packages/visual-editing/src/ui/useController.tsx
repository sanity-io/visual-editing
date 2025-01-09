import {useEffect, useRef, type MutableRefObject} from 'react'
import {createOverlayController} from '../controller'
import {useOptimisticActorReady} from '../react/useOptimisticActor'
import type {OverlayController, OverlayEventHandler} from '../types'

/**
 * Hook for using an overlay controller
 * @internal
 */
export function useController(
  element: HTMLElement | null,
  handler: OverlayEventHandler,
  inFrame: boolean,
  inPopUp: boolean,
): MutableRefObject<OverlayController | undefined> {
  const overlayController = useRef<OverlayController | undefined>(undefined)

  const optimisticActorReady = useOptimisticActorReady()

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler,
      overlayElement: element,
      inFrame,
      inPopUp,
      optimisticActorReady,
    })

    return () => {
      overlayController.current?.destroy()
      overlayController.current = undefined
    }
  }, [element, handler, inFrame, inPopUp, optimisticActorReady])

  return overlayController
}
