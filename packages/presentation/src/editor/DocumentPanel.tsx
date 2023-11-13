import { ReactElement, useCallback, useEffect } from 'react'
import { Path, SanityDocument, useEditState } from 'sanity'
import { DeskToolProvider } from 'sanity/desk'

import { DeskDocumentPaneParams } from '../types'
import { DocumentPane } from './DocumentPane'

export function DocumentPanel(props: {
  deskParams: DeskDocumentPaneParams
  documentId: string
  documentType: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (documentId: string, path: Path) => void
  onDocumentChange: (document: SanityDocument | null) => void
}): ReactElement {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
    onDocumentChange,
  } = props

  const editState = useEditState(documentId, documentType)
  const documentValue = editState.draft || editState.published

  // Sync changes to the document being edited back up to the live loaders
  useEffect(
    () => onDocumentChange(documentValue),
    [documentValue, onDocumentChange],
  )

  const handleFocusPath = useCallback(
    (path: Path) => {
      if (documentValue?._id) {
        onFocusPath(documentValue._id, path)
      }
    },
    [documentValue, onFocusPath],
  )

  return (
    <DeskToolProvider>
      <DocumentPane
        documentId={documentId}
        documentType={documentType}
        params={deskParams}
        onDeskParams={onDeskParams}
        onFocusPath={handleFocusPath}
      />
    </DeskToolProvider>
  )
}
