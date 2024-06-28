import type {
  PresentationMsg,
  SanityNode,
  SanityStegaNode,
  SchemaType,
} from '@repo/visual-editing-helpers'
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
  schema: SchemaType[] | null
  wasMaybeCollapsed: boolean
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | PresentationMsg,
): OverlayState {
  const {type} = message
  let {contextMenu, focusPath, perspective, schema} = state
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
    contextMenu = 'sanity' in message ? {node: message.sanity, position: message.position} : null
  }

  if (
    type === 'element/click' ||
    type === 'overlay/blur' ||
    type === 'presentation/focus' ||
    type === 'presentation/blur'
  ) {
    contextMenu = null
  }

  if (type === 'presentation/schema') {
    schema = message.data.schema
  }

  return {
    ...state,
    contextMenu,
    elements: elementsReducer(state.elements, message),
    focusPath,
    perspective,
    schema,
    wasMaybeCollapsed,
  }
}
