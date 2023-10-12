import { FunctionComponent, useCallback } from 'react'
import { Path, useEditState } from 'sanity'

import { DeskDocumentPaneParams } from '../types'
import { DocumentPane } from './DocumentPane'

const DocumentPanel: FunctionComponent<{
  deskParams: DeskDocumentPaneParams
  documentId: string
  documentType: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (documentId: string, path: Path) => void
  refs: { _id: string; _type: string }[]
}> = function (props) {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
    refs,
  } = props

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
    <DocumentPane
      refs={refs}
      documentId={documentId}
      documentType={documentType}
      params={deskParams}
      onDeskParams={onDeskParams}
      onFocusPath={handleFocusPath}
    />
  )
}

export const ContentEditor: FunctionComponent<{
  deskParams: DeskDocumentPaneParams
  documentId?: string
  documentType?: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (documentId: string, path: Path) => void
  refs: { _id: string; _type: string }[]
}> = function (props) {
  const {
    deskParams,
    documentId,
    documentType,
    onDeskParams,
    onFocusPath,
    refs,
  } = props

  return (
    <>
      {documentId && documentType ? (
        <DocumentPanel
          refs={refs}
          deskParams={deskParams}
          documentId={documentId}
          documentType={documentType}
          onDeskParams={onDeskParams}
          onFocusPath={onFocusPath}
        />
      ) : (
        <div></div>
      )}
    </>
  )
}
