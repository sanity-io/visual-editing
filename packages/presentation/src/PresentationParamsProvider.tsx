import {type FunctionComponent, type PropsWithChildren, useMemo} from 'react'

import {PresentationParamsContext} from './PresentationParamsContext'
import type {PresentationParams} from './types'

export const PresentationParamsProvider: FunctionComponent<
  PropsWithChildren<{
    params: PresentationParams
  }>
> = function (props) {
  const {children, params} = props

  const context = useMemo<PresentationParams>(() => params, [params])

  return (
    <PresentationParamsContext.Provider value={context}>
      {children}
    </PresentationParamsContext.Provider>
  )
}
