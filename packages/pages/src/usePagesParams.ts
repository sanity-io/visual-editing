import { useContext } from 'react'

import { PagesParamsContext } from './PagesParamsContext'
import { PagesParams } from './types'

export function usePagesParams(): PagesParams {
  const params = useContext(PagesParamsContext)

  if (!params) {
    throw new Error('Pages params context is missing')
  }

  return params
}
