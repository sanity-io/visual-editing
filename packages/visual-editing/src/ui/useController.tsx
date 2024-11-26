import {useEffect, useRef, type MutableRefObject} from 'react'
import {createOverlayController} from '../controller'
import type {OverlayController, OverlayEventHandler} from '../types'
import {useOptimisticActorReady} from './optimistic-state/useOptimisticActor'

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

  const optimisticActorReady = useOptimisticActorReady()

  useEffect(() => {
    if (!element) return undefined

    overlayController.current = createOverlayController({
      handler,
      overlayElement: element,
      inFrame,
      optimisticActorReady,
    })

    return () => {
      overlayController.current?.destroy()
      overlayController.current = undefined
    }
  }, [element, handler, inFrame, optimisticActorReady])

  return overlayController
}
