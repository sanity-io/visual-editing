import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react'

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

  const navigate = useCallback(
    (preview: string) => {
      _navigate({}, { preview })
    },
    [_navigate],
  )

  const context = useMemo<PresentationNavigateContextValue>(
    () => navigate,
    [navigate],
  )

  return (
    <PresentationNavigateContext.Provider value={context}>
      {children}
    </PresentationNavigateContext.Provider>
  )
}
