import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react'

import {
  ComposerNavigateContext,
  ComposerNavigateContextValue,
} from './ComposerNavigateContext'
import { SetComposerParams } from './types'

export const ComposerNavigateProvider: FunctionComponent<
  PropsWithChildren<{
    setParams: SetComposerParams
  }>
> = function (props) {
  const { children, setParams } = props

  const navigate = useCallback(
    (preview: string) => {
      setParams({ preview })
    },
    [setParams],
  )

  const context = useMemo<ComposerNavigateContextValue>(
    () => navigate,
    [navigate],
  )

  return (
    <ComposerNavigateContext.Provider value={context}>
      {children}
    </ComposerNavigateContext.Provider>
  )
}
