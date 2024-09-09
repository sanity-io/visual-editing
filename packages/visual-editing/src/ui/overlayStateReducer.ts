import type {VisualEditingControllerMsg} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'

import type {DragInsertPosition, DragSkeleton, ElementState, OverlayMsg} from '../types'
import {elementsReducer} from './elementsReducer'

export interface OverlayState {
  focusPath: string
  elements: ElementState[]
  wasMaybeCollapsed: boolean
  perspective: ClientPerspective
  isDragging: boolean
  dragInsertPosition: DragInsertPosition
  dragSkeleton: DragSkeleton | null
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | VisualEditingControllerMsg,
): OverlayState {
  let focusPath = state.focusPath
  let wasMaybeCollapsed = false
  let perspective = state.perspective
  let isDragging = state.isDragging
  let dragInsertPosition = state.dragInsertPosition
  let dragSkeleton = state.dragSkeleton

  if (message.type === 'presentation/focus') {
    const prevFocusPath = state.focusPath

    focusPath = message.data.path

    if (prevFocusPath !== focusPath) {
      wasMaybeCollapsed = prevFocusPath.slice(focusPath.length).startsWith('[')
    }
  }

  if (message.type === 'presentation/perspective') {
    perspective = message.data.perspective
  }

  if (message.type === 'overlay/dragUpdateInsertPosition') {
    dragInsertPosition = message.insertPosition
  }

  if (message.type === 'overlay/dragStart') {
    isDragging = true
    dragSkeleton = message.skeleton
  }

  if (message.type === 'overlay/dragEnd') {
    isDragging = false
  }

  return {
    ...state,
    elements: elementsReducer(state.elements, message),
    dragInsertPosition,
    dragSkeleton,
    isDragging,
    focusPath,
    perspective,
    wasMaybeCollapsed,
  }
}
