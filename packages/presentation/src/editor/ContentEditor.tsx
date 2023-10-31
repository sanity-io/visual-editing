import { FunctionComponent, useCallback } from 'react'
import { Path, useEditState } from 'sanity'
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
}> = function (props) {
  const { deskParams, documentId, documentType, onDeskParams, onFocusPath } =
    props

  const editState = useEditState(documentId, documentType)
  const documentValue = editState.draft || editState.published

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
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}> = function (props) {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
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
