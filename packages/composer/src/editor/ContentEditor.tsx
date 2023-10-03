import { FunctionComponent, useCallback } from 'react'
import { Path, useEditState } from 'sanity'
import { DeskDocumentPaneParams } from 'src/types'

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
      if (documentValue) {
        const _id = documentValue._id

        if (_id) {
          onFocusPath(_id, path)
        }
      }
    },
    [documentValue, onFocusPath],
  )

  return (
    <DocumentPane
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
}> = function (props) {
  const { deskParams, documentId, documentType, onDeskParams, onFocusPath } =
    props

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
        <div></div>
      )}
    </>
  )
}
