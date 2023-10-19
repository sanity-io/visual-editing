import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import { ComposerParamsContext } from './ComposerParamsContext'
import { ComposerParams } from './types'

export const ComposerParamsProvider: FunctionComponent<
  PropsWithChildren<{
    params: ComposerParams
  }>
> = function (props) {
  const { children, params } = props

  const context = useMemo<ComposerParams>(() => params, [params])

  return (
    <ComposerParamsContext.Provider value={context}>
      {children}
    </ComposerParamsContext.Provider>
  )
}
