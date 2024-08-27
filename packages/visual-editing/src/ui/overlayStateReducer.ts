import type {PresentationMsg} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'

import type {DragInsertPosition, ElementState, OverlayMsg} from '../types'
import {elementsReducer} from './elementsReducer'

export interface OverlayState {
  focusPath: string
  elements: ElementState[]
  wasMaybeCollapsed: boolean
  perspective: ClientPerspective
  isDragging: boolean
  dragInsertPosition: DragInsertPosition
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | PresentationMsg,
): OverlayState {
  let focusPath = state.focusPath
  let wasMaybeCollapsed = false
  let perspective = state.perspective
  let isDragging = state.isDragging
  let dragInsertPosition = state.dragInsertPosition

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
  } else if (message.type === 'overlay/dragEnd') {
    isDragging = false
  }

  return {
    ...state,
    elements: elementsReducer(state.elements, message),
    dragInsertPosition,
    isDragging,
    focusPath,
    perspective,
    wasMaybeCollapsed,
  }
}
