import type {PresentationMsg} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'

import type {ElementState, OverlayMsg} from '../types'
import {elementsReducer} from './elementsReducer'

export interface OverlayState {
  focusPath: string
  elements: ElementState[]
  wasMaybeCollapsed: boolean
  perspective: ClientPerspective
  /**
   * Experimental stuff
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rsc: any
}

export function overlayStateReducer(
  state: OverlayState,
  message: OverlayMsg | PresentationMsg,
): OverlayState {
  let focusPath = state.focusPath
  let wasMaybeCollapsed = false
  let perspective = state.perspective
  let schema = state.schema
  let rsc = state.rsc

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

  if (message.type === 'presentation/schema') {
    schema = message.data
  }
  if (message.type === 'presentation/rsc') {
    rsc = message.data
  }

  return {
    ...state,
    elements: elementsReducer(state.elements, message),
    focusPath,
    perspective,
    wasMaybeCollapsed,
    schema,
    rsc,
  }
}
