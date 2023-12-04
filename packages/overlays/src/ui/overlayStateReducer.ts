import { PresentationMsg } from '@sanity/visual-editing-helpers'

import { ElementState, OverlayMsg } from '../types'
import { elementsReducer } from './elementsReducer'

export interface OverlayState {
  focusPath: string
  elements: ElementState[]
  wasMaybeCollapsed: boolean
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | PresentationMsg,
): OverlayState {
  let focusPath = state.focusPath
  let wasMaybeCollapsed = false

  if (message.type === 'presentation/focus') {
    const prevFocusPath = state.focusPath

    focusPath = message.data.path

    if (prevFocusPath !== focusPath) {
      wasMaybeCollapsed = prevFocusPath.slice(focusPath.length).startsWith('[')
    }
  }

  return {
    ...state,
    focusPath,
    elements: elementsReducer(state.elements, message),
    wasMaybeCollapsed,
  }
}
