import { useContext } from 'react'

import {
  ComposerNavigateContext,
  ComposerNavigateContextValue,
} from './ComposerNavigateContext'

export function useComposerNavigate(): ComposerNavigateContextValue {
  const navigate = useContext(ComposerNavigateContext)

  if (!navigate) {
    throw new Error('Composer navigate context is missing')
  }

  return navigate
}
