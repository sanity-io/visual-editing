import {createContext} from 'react'

import type {PresentationDocumentContextValue} from './types'

export const PresentationDocumentContext = createContext<PresentationDocumentContextValue | null>(
  null,
)
