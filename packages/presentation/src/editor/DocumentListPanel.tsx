import { ReactElement } from 'react'

import { DeskDocumentPaneParams } from '../types'
import { DocumentListPane } from './DocumentListPane'

export function DocumentListPanel(props: {
  onDeskParams: (params: DeskDocumentPaneParams) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}): ReactElement {
  const { onDeskParams, previewUrl, refs } = props

  return (
    <DocumentListPane
      onDeskParams={onDeskParams}
      previewUrl={previewUrl}
      refs={refs}
    />
  )
}
