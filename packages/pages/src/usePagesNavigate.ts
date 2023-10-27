import { useContext } from 'react'

import {
  PagesNavigateContext,
  PagesNavigateContextValue,
} from './PagesNavigateContext'

export function usePagesNavigate(): PagesNavigateContextValue {
  const navigate = useContext(PagesNavigateContext)

  if (!navigate) {
    throw new Error('Pages navigate context is missing')
  }

  return navigate
}
