import { createContext } from 'react'

import { PresentationParams } from './types'

export const PresentationParamsContext =
  createContext<PresentationParams | null>(null)
