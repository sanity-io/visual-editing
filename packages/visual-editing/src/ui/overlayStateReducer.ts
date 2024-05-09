import type {PresentationMsg} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'

import type {ElementState, OverlayMsg} from '../types'
import {elementsReducer} from './elementsReducer'

export interface OverlayState {
  focusPath: string
  elements: ElementState[]
  wasMaybeCollapsed: boolean
  perspective: ClientPerspective
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | PresentationMsg,
): OverlayState {
  let focusPath = state.focusPath
  let wasMaybeCollapsed = false
  let perspective = state.perspective

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

  return {
    ...state,
    elements: elementsReducer(state.elements, message),
    focusPath,
    perspective,
    wasMaybeCollapsed,
  }
}
