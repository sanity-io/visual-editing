import type { ClientPerspective } from '@sanity/client'
import type { Dispatch, Reducer } from 'react'
import { boolean, fallback, object, parse, picklist } from 'valibot'

export interface PresentationState {
  /**
   * The selected perspective that all previews should use
   */
  perspective: Extract<'published' | 'previewDrafts', ClientPerspective>
  /**
   * The viewport size of the preview iframe is currently hardcoded, using this enum to determine the size
   */
  viewport: 'desktop' | 'mobile'
  visualEditing: {
    overlays: {
      enabled: boolean
    }
  }
}

export const ACTION_PERSPECTIVE = 'ACTION_PERSPECTIVE'
export const ACTION_VIEWPORT = 'ACTION_VIEWPORT'
export const ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE =
  'ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE'

interface PerspectiveAction {
  type: typeof ACTION_PERSPECTIVE
  perspective: PresentationState['perspective']
}
interface ViewportAction {
  type: typeof ACTION_VIEWPORT
  viewport: PresentationState['viewport']
}
interface VisualEditingOverlaysToggleAction {
  type: typeof ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE
  enabled: boolean
}

type PresentationAction =
  | PerspectiveAction
  | ViewportAction
  | VisualEditingOverlaysToggleAction

export const presentationReducer: Reducer<
  Readonly<PresentationState>,
  Readonly<PresentationAction>
> = (state, action) => {
  switch (action.type) {
    case ACTION_PERSPECTIVE:
      return {
        ...state,
        perspective: parse(perspectiveSchema, action.perspective),
      }
    case ACTION_VIEWPORT:
      return {
        ...state,
        viewport: parse(viewportSchema, action.viewport),
      }
    case ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE:
      return toggleVisualEditingOverlays(state, action)
    default:
      return state
  }
}

const toggleVisualEditingOverlays: Reducer<
  Readonly<PresentationState>,
  Readonly<VisualEditingOverlaysToggleAction>
> = (state, action) => {
  if (state.visualEditing.overlays.enabled === action.enabled) return state
  return {
    ...state,
    visualEditing: {
      ...state.visualEditing,
      overlays: {
        ...state.visualEditing.overlays,
        enabled: action.enabled,
      },
    },
  }
}

const perspectiveSchema = fallback(
  picklist([
    'published',
    'previewDrafts',
  ] satisfies PresentationState['perspective'][]),
  'previewDrafts',
)
const viewportSchema = fallback(
  picklist(['desktop', 'mobile'] satisfies PresentationState['viewport'][]),
  'desktop',
)
const initStateSchema = object({
  perspective: perspectiveSchema,
  viewport: viewportSchema,
  visualEditing: object({ overlays: object({ enabled: boolean() }) }),
})

const INITIAL_PRESENTATION_STATE = {
  perspective: 'previewDrafts',
  viewport: 'desktop',
  visualEditing: {
    overlays: {
      enabled: false,
    },
  },
} as const satisfies PresentationState
export function presentationReducerInit(
  state: Readonly<
    Partial<{
      perspective: string
      viewport: string
    }>
  >,
): Readonly<PresentationState> {
  return parse(initStateSchema, { ...INITIAL_PRESENTATION_STATE, ...state })
}

export type DispatchPresentationAction = Dispatch<Readonly<PresentationAction>>
