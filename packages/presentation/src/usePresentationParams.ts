import { useContext } from 'react'

import { PresentationParamsContext } from './PresentationParamsContext'
import { PresentationParams } from './types'

export function usePresentationParams(): PresentationParams {
  const params = useContext(PresentationParamsContext)

  if (!params) {
    throw new Error('Presentation params context is missing')
  }

  return params
}
