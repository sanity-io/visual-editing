import { FunctionComponent, PropsWithChildren, useCallback } from 'react'

import {
  PresentationNavigateContext,
  PresentationNavigateContextValue,
} from './PresentationNavigateContext'
import { PresentationNavigate } from './types'

export const PresentationNavigateProvider: FunctionComponent<
  PropsWithChildren<{
    navigate: PresentationNavigate
  }>
> = function (props) {
  const { children, navigate: _navigate } = props

  const navigate = useCallback<PresentationNavigateContextValue>(
    (preview, document = undefined) => {
      _navigate(document || {}, preview ? { preview } : {})
    },
    [_navigate],
  )

  return (
    <PresentationNavigateContext.Provider value={navigate}>
      {children}
    </PresentationNavigateContext.Provider>
  )
}
