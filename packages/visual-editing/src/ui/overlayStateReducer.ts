import type {PresentationMsg, SanityNode, SanityStegaNode} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'

import type {ElementState, OverlayMsg} from '../types'
import {elementsReducer} from './elementsReducer'

export interface OverlayState {
  contextMenu: {
    node: SanityNode | SanityStegaNode
    position: {
      x: number
      y: number
    }
  } | null
  focusPath: string
  elements: ElementState[]
  perspective: ClientPerspective
  wasMaybeCollapsed: boolean
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | PresentationMsg,
): OverlayState {
  const {type} = message
  let {contextMenu, focusPath, perspective} = state
  let wasMaybeCollapsed = false

  if (type === 'focus') {
    const prevFocusPath = state.focusPath

    focusPath = message.data.path

    if (prevFocusPath !== focusPath) {
      wasMaybeCollapsed = prevFocusPath.slice(focusPath.length).startsWith('[')
    }
  }

  if (type === 'perspective') {
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
    type === 'blur' ||
    type === 'focus'
  ) {
    contextMenu = null
  }

  return {
    ...state,
    contextMenu,
    elements: elementsReducer(state.elements, message),
    focusPath,
    perspective,
    wasMaybeCollapsed,
  }
}
