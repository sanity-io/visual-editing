import { useContext } from 'react'

import { ComposerContext, ComposerContextValue } from './ComposerContext'

export function useComposer(): ComposerContextValue {
  const composer = useContext(ComposerContext)

  if (!composer) {
    throw new Error('Composer context is missing')
  }

  return composer
}
