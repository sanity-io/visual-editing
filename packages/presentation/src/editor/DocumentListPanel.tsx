import { ReactElement, useMemo } from 'react'

import { parseId } from '../lib/parse'
import { DeskDocumentPaneParams } from '../types'
import { DocumentListPane } from './DocumentListPane'

export function DocumentListPanel(props: {
  onDeskParams: (params: DeskDocumentPaneParams) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}): ReactElement {
  const { onDeskParams, previewUrl, refs } = props

  const refsWithParsedIds = useMemo(
    () =>
      refs.map(({ _id, _type }) => ({
        _id: parseId(_id)!,
        _type,
      })),
    [refs],
  )

  return (
    <DocumentListPane
      onDeskParams={onDeskParams}
      previewUrl={previewUrl}
      refs={refsWithParsedIds}
    />
  )
}
