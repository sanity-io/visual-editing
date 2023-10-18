import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import { ComposerContext, ComposerContextValue } from './ComposerContext'
import { ComposerParams, DeskDocumentPaneParams } from './types'

export const ComposerProvider: FunctionComponent<
  PropsWithChildren<{
    deskParams: DeskDocumentPaneParams
    devMode: boolean
    params: ComposerParams
  }>
> = function (props) {
  const { children, deskParams, devMode, params } = props

  const context = useMemo<ComposerContextValue>(
    () => ({
      deskParams,
      devMode,
      params,
    }),
    [deskParams, devMode, params],
  )

  return (
    <ComposerContext.Provider value={context}>
      {children}
    </ComposerContext.Provider>
  )
}
