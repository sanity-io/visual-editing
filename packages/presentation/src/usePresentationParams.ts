import {useContext} from 'react'

import {PresentationParamsContext} from './PresentationParamsContext'
import type {PresentationParams} from './types'

/** @public */
export function usePresentationParams(throwOnMissingContext?: true): PresentationParams
/** @public */
export function usePresentationParams(throwOnMissingContext: false): PresentationParams | null
/** @public */
export function usePresentationParams(throwOnMissingContext = true): PresentationParams | null {
  const params = useContext(PresentationParamsContext)

  if (throwOnMissingContext && !params) {
    throw new Error('Presentation params context is missing')
  }

  return params
}
