import { FunctionComponent, PropsWithChildren, useMemo } from 'react'

import { ComposerContext, ComposerContextValue } from './ComposerContext'
import { ComposerParams, DeskDocumentPaneParams } from './types'

export const ComposerProvider: FunctionComponent<
  PropsWithChildren<{
    deskParams: DeskDocumentPaneParams
    params: ComposerParams
  }>
> = function (props) {
  const { children, deskParams, params } = props

  const context = useMemo<ComposerContextValue>(
    () => ({
      deskParams,
      params,
    }),
    [deskParams, params],
  )

  return (
    <ComposerContext.Provider value={context}>
      {children}
    </ComposerContext.Provider>
  )
}
