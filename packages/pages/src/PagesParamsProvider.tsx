import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import { PagesParamsContext } from './PagesParamsContext'
import { PagesParams } from './types'

export const PagesParamsProvider: FunctionComponent<
  PropsWithChildren<{
    params: PagesParams
  }>
> = function (props) {
  const { children, params } = props

  const context = useMemo<PagesParams>(() => params, [params])

  return (
    <PagesParamsContext.Provider value={context}>
      {children}
    </PagesParamsContext.Provider>
  )
}
