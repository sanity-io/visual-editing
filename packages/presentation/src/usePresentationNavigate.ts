import { useContext } from 'react'

import {
  PresentationNavigateContext,
  PresentationNavigateContextValue,
} from './PresentationNavigateContext'

export function usePresentationNavigate(): PresentationNavigateContextValue {
  const navigate = useContext(PresentationNavigateContext)

  if (!navigate) {
    throw new Error('Presentation navigate context is missing')
  }

  return navigate
}

export type { PresentationNavigateContextValue }
