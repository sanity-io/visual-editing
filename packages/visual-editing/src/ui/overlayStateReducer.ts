import type {ClientPerspective} from '@sanity/client'
import type {SanityNode, VisualEditingControllerMsg} from '@sanity/presentation-comlink'
import type {
  DragInsertPosition,
  DragSkeleton,
  ElementState,
  OverlayMsg,
  OverlayRect,
} from '../types'
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
  dragShowMinimap: boolean
  dragShowMinimapPrompt: boolean
  dragMinimapTransition: boolean
  dragGroupRect: OverlayRect | null
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | VisualEditingControllerMsg,
): OverlayState {
  const {type} = message
  let {
    contextMenu,
    focusPath,
    perspective,
    isDragging,
    dragInsertPosition,
    dragShowMinimap,
    dragShowMinimapPrompt,
    dragSkeleton,
    dragMinimapTransition,
    dragGroupRect,
  } = state
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
  }

  if (message.type === 'overlay/dragUpdateSkeleton') {
    dragSkeleton = message.skeleton
  }

  if (type === 'overlay/dragEnd') {
    isDragging = false
  }

  if (message.type === 'overlay/dragToggleMinimapPrompt') {
    dragShowMinimapPrompt = message.display
  }

  if (type === 'overlay/dragStartMinimapTransition') {
    dragMinimapTransition = true
  }

  if (type === 'overlay/dragEndMinimapTransition') {
    dragMinimapTransition = false
  }

  if (type === 'overlay/dragUpdateGroupRect') {
    dragGroupRect = message.groupRect
  }

  if (type === 'overlay/dragToggleMinimap') {
    dragShowMinimap = message.display
  }

  return {
    ...state,
    contextMenu,
    elements: elementsReducer(state.elements, message),
    dragInsertPosition,
    dragSkeleton,
    dragGroupRect,
    isDragging,
    focusPath,
    perspective,
    wasMaybeCollapsed,
    dragShowMinimap,
    dragShowMinimapPrompt,
    dragMinimapTransition,
  }
}
