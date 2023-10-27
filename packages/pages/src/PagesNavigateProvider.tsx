import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react'

import {
  PagesNavigateContext,
  PagesNavigateContextValue,
} from './PagesNavigateContext'
import { SetPagesParams } from './types'

export const PagesNavigateProvider: FunctionComponent<
  PropsWithChildren<{
    setParams: SetPagesParams
  }>
> = function (props) {
  const { children, setParams } = props

  const navigate = useCallback(
    (preview: string) => {
      setParams({ preview })
    },
    [setParams],
  )

  const context = useMemo<PagesNavigateContextValue>(() => navigate, [navigate])

  return (
    <PagesNavigateContext.Provider value={context}>
      {children}
    </PagesNavigateContext.Provider>
  )
}
