import type { ReactElement } from 'react'
import type { Path } from 'sanity'

import type { DeskDocumentPaneParams } from '../types'
import { DocumentListPane } from './DocumentListPane'
import { DocumentPanel } from './DocumentPanel'

export function ContentEditor(props: {
  deskParams: DeskDocumentPaneParams
  documentId?: string
  documentType?: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
  imperativeFocusPath: string
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}): ReactElement {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
    previewUrl,
    imperativeFocusPath,
    refs,
  } = props

  if (documentId && documentType) {
    return (
      <DocumentPanel
        key={`${documentId}-${documentType}`}
        deskParams={deskParams}
        imperativeFocusPath={imperativeFocusPath}
        documentId={documentId}
        documentType={documentType}
        onDeskParams={onDeskParams}
        onFocusPath={onFocusPath}
      />
    )
  }

  return (
    <DocumentListPane
      onDeskParams={onDeskParams}
      previewUrl={previewUrl}
      refs={refs}
    />
  )
}
