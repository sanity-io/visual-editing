import { FunctionComponent, useCallback, useEffect } from 'react'
import { Path, SanityDocument, useEditState } from 'sanity'
import { DeskToolProvider } from 'sanity/desk'

import { DeskDocumentPaneParams } from '../types'
import { DocumentListPane } from './DocumentListPane'
import { DocumentPane } from './DocumentPane'

const DocumentPanel: FunctionComponent<{
  deskParams: DeskDocumentPaneParams
  documentId: string
  documentType: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (documentId: string, path: Path) => void
  onDocumentChange: (document: SanityDocument | null) => void
}> = function (props) {
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

const DocumentListPanel = ({
  onDeskParams,
  previewUrl,
  refs,
}: {
  onDeskParams: (params: DeskDocumentPaneParams) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}) => {
  return (
    <DocumentListPane
      onDeskParams={onDeskParams}
      previewUrl={previewUrl}
      refs={refs}
    />
  )
}

export const ContentEditor: FunctionComponent<{
  deskParams: DeskDocumentPaneParams
  documentId?: string
  documentType?: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (documentId: string, path: Path) => void
  onDocumentChange: (document: SanityDocument | null) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}> = function (props) {
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

  return (
    <>
      {documentId && documentType ? (
        <DocumentPanel
          deskParams={deskParams}
          documentId={documentId}
          documentType={documentType}
          onDeskParams={onDeskParams}
          onFocusPath={onFocusPath}
          onDocumentChange={onDocumentChange}
        />
      ) : (
        <DocumentListPanel
          onDeskParams={onDeskParams}
          previewUrl={previewUrl}
          refs={refs}
        />
      )}
    </>
  )
}
