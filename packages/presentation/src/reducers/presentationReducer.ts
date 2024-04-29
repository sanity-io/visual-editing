import type {ClientPerspective} from '@sanity/client'
import type {Dispatch, Reducer} from 'react'
import {boolean, fallback, object, parse, picklist} from 'valibot'

export interface PresentationState {
  mainDocument: boolean
  iframe: {
    status: 'loading' | 'loaded' | 'refreshing' | 'reloading'
  }
  /**
   * The selected perspective that all previews should use
   */
  perspective: Extract<'published' | 'previewDrafts', ClientPerspective>
  /**
   * The viewport size of the preview iframe is currently hardcoded, using this enum to determine the size
   */
  viewport: 'desktop' | 'mobile'
  visualEditing: {
    overlaysEnabled: boolean
  }
}

export const ACTION_IFRAME_LOADED = 'ACTION_IFRAME_LOADED'
export const ACTION_IFRAME_REFRESH = 'ACTION_IFRAME_REFRESH'
export const ACTION_IFRAME_RELOAD = 'ACTION_IFRAME_RELOAD'
export const ACTION_PERSPECTIVE = 'ACTION_PERSPECTIVE'
export const ACTION_VIEWPORT = 'ACTION_VIEWPORT'
export const ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE = 'ACTION_VISUAL_EDITING_OVERLAYS_TOGGLE'

interface IframeLoadedAction {
  type: typeof ACTION_IFRAME_LOADED
}
interface IframeRefreshAction {
  type: typeof ACTION_IFRAME_REFRESH
}
interface IframeReloadAction {
  type: typeof ACTION_IFRAME_RELOAD
}
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
  | IframeLoadedAction
  | IframeRefreshAction
  | IframeReloadAction
  | PerspectiveAction
  | ViewportAction
  | VisualEditingOverlaysToggleAction

export const presentationReducer: Reducer<
  Readonly<PresentationState>,
  Readonly<PresentationAction>
> = (state, action) => {
  switch (action.type) {
    case ACTION_IFRAME_LOADED:
      return state.iframe.status === 'loaded'
        ? state
        : {
            ...state,
            iframe: {
              ...state.iframe,
              status: 'loaded',
            },
          }
    case ACTION_IFRAME_REFRESH:
      return state.iframe.status === 'refreshing'
        ? state
        : {
            ...state,
            iframe: {
              ...state.iframe,
              status: 'refreshing',
            },
          }
    case ACTION_IFRAME_RELOAD:
      return state.iframe.status === 'reloading'
        ? state
        : {
            ...state,
            iframe: {
              ...state.iframe,
              status: 'reloading',
            },
          }
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
  if (state.visualEditing.overlaysEnabled === action.enabled) return state
  return {
    ...state,
    visualEditing: {
      ...state.visualEditing,
      overlaysEnabled: action.enabled,
    },
  }
}

const mainDocumentSchema = fallback(boolean(), false)

const iframeStatusSchema = picklist(['loading', 'loaded', 'refreshing', 'reloading'])
const perspectiveSchema = fallback(
  picklist(['published', 'previewDrafts'] satisfies PresentationState['perspective'][]),
  'previewDrafts',
)
const viewportSchema = fallback(
  picklist(['desktop', 'mobile'] satisfies PresentationState['viewport'][]),
  'desktop',
)
const initStateSchema = object({
  mainDocument: mainDocumentSchema,
  iframe: object({
    status: iframeStatusSchema,
  }),
  perspective: perspectiveSchema,
  viewport: viewportSchema,
  visualEditing: object({overlaysEnabled: boolean()}),
})

const INITIAL_PRESENTATION_STATE = {
  mainDocument: false,
  iframe: {
    status: 'loading',
  },
  perspective: 'previewDrafts',
  viewport: 'desktop',
  visualEditing: {
    overlaysEnabled: false,
  },
} as const satisfies PresentationState
export function presentationReducerInit(
  state: Readonly<
    Partial<{
      mainDocument: boolean
      perspective: string
      viewport: string
    }>
  >,
): Readonly<PresentationState> {
  return parse(initStateSchema, {...INITIAL_PRESENTATION_STATE, ...state})
}

export type DispatchPresentationAction = Dispatch<Readonly<PresentationAction>>
