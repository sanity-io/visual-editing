import { useContext } from 'react'

import { ComposerParamsContext } from './ComposerParamsContext'
import { ComposerParams } from './types'

export function useComposerParams(): ComposerParams {
  const params = useContext(ComposerParamsContext)

  if (!params) {
    throw new Error('Composer params context is missing')
  }

  return params
}
