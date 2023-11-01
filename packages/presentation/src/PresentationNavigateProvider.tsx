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
import { SetPresentationParams } from './types'

export const PresentationNavigateProvider: FunctionComponent<
  PropsWithChildren<{
    setParams: SetPresentationParams
  }>
> = function (props) {
  const { children, setParams } = props

  const navigate = useCallback(
    (preview: string) => {
      setParams({ preview })
    },
    [setParams],
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
