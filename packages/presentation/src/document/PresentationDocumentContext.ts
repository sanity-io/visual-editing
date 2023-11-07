import { createContext } from 'react'

import { PresentationDocumentContextValue } from './types'

export const PresentationDocumentContext =
  createContext<PresentationDocumentContextValue | null>(null)
