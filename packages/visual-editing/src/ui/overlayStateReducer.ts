import type {SanityNode, VisualEditingControllerMsg} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import type {DragInsertPosition, DragSkeleton, ElementState, OverlayMsg} from '../types'
import {elementsReducer} from './elementsReducer'

export interface OverlayState {
  contextMenu: {
    node: SanityNode
    position: {
      x: number
      y: number
    }
  } | null
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
  const {type} = message
  let {contextMenu, focusPath, perspective, isDragging, dragInsertPosition, dragSkeleton} = state
  let wasMaybeCollapsed = false

  if (type === 'presentation/focus') {
    const prevFocusPath = state.focusPath

    focusPath = message.data.path

    if (prevFocusPath !== focusPath) {
      wasMaybeCollapsed = prevFocusPath.slice(focusPath.length).startsWith('[')
    }
  }

  if (type === 'presentation/perspective') {
    perspective = message.data.perspective
  }

  if (type === 'element/contextmenu') {
    if ('sanity' in message) {
      contextMenu = {node: message.sanity, position: message.position}
    } else {
      contextMenu = null
    }
  }

  if (
    type === 'element/click' ||
    type === 'element/mouseleave' ||
    type === 'overlay/blur' ||
    type === 'presentation/blur' ||
    type === 'presentation/focus'
  ) {
    contextMenu = null
  }

  if (type === 'overlay/dragUpdateInsertPosition') {
    dragInsertPosition = message.insertPosition
  }

  if (type === 'overlay/dragStart') {
    isDragging = true
    dragSkeleton = message.skeleton
  }

  if (type === 'overlay/dragEnd') {
    isDragging = false
  }

  return {
    ...state,
    contextMenu,
    elements: elementsReducer(state.elements, message),
    dragInsertPosition,
    dragSkeleton,
    isDragging,
    focusPath,
    perspective,
    wasMaybeCollapsed,
  }
}
