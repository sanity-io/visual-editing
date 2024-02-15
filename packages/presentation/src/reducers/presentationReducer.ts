import type { ClientPerspective } from '@sanity/client'
import type { Dispatch, Reducer } from 'react'
import { fallback, object, parse, picklist } from 'valibot'

export interface PresentationState {
  /**
   * The selected perspective that all previews should use
   */
  perspective: Extract<'published' | 'previewDrafts', ClientPerspective>
}

export const ACTION_PERSPECTIVE = 'ACTION_PERSPECTIVE'

interface PerspectiveAction {
  type: typeof ACTION_PERSPECTIVE
  perspective: Extract<'published' | 'previewDrafts', ClientPerspective>
}

type PresentationAction = PerspectiveAction

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
    default:
      return state
  }
}

const perspectiveSchema = fallback(
  picklist(['published', 'previewDrafts'] satisfies ClientPerspective[]),
  'previewDrafts',
)
const initStateSchema = object({
  perspective: perspectiveSchema,
})

const INITIAL_PRESENTATION_STATE = {
  perspective: 'previewDrafts',
} as const satisfies PresentationState
export function presentationReducerInit(
  state: Readonly<
    Partial<{
      perspective: string
    }>
  >,
): Readonly<PresentationState> {
  return parse(initStateSchema, { ...INITIAL_PRESENTATION_STATE, ...state })
}

export type DispatchPresentationAction = Dispatch<Readonly<PresentationAction>>
