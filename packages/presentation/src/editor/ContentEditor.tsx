import { ReactElement } from 'react'
import { Path, SanityDocument } from 'sanity'

import { DeskDocumentPaneParams } from '../types'
import { DocumentListPanel } from './DocumentListPanel'
import { DocumentPanel } from './DocumentPanel'

export function ContentEditor(props: {
  deskParams: DeskDocumentPaneParams
  documentId?: string
  documentType?: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (documentId: string, path: Path) => void
  onDocumentChange: (document: SanityDocument | null) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}): ReactElement {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
    onDocumentChange,
    previewUrl,
    refs,
  } = props

  if (documentId && documentType) {
    return (
      <DocumentPanel
        deskParams={deskParams}
        documentId={documentId}
        documentType={documentType}
        onDeskParams={onDeskParams}
        onFocusPath={onFocusPath}
        onDocumentChange={onDocumentChange}
      />
    )
  }

  return (
    <DocumentListPanel
      onDeskParams={onDeskParams}
      previewUrl={previewUrl}
      refs={refs}
    />
  )
}
