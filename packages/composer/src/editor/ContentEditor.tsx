import { FunctionComponent, useCallback } from 'react'
import { Path, useEditState } from 'sanity'
import { DeskDocumentPaneParams } from 'src/types'

import { DocumentPane } from './DocumentPane'

const DocumentPanel: FunctionComponent<{
  deskParams: DeskDocumentPaneParams
  documentId: string
  documentType: string
  onFocusPath: (documentId: string, path: Path) => void
}> = function (props) {
  const { deskParams, documentId, documentType, onFocusPath } = props

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
      onFocusPath={handleFocusPath}
    />
  )
}

export const ContentEditor: FunctionComponent<{
  deskParams: DeskDocumentPaneParams
  documentId?: string
  documentType?: string
  onFocusPath: (documentId: string, path: Path) => void
}> = function (props) {
  const { deskParams, documentId, documentType, onFocusPath } = props

  return (
    <>
      {documentId && documentType ? (
        <DocumentPanel
          documentId={documentId}
          documentType={documentType}
          deskParams={deskParams}
          onFocusPath={onFocusPath}
        />
      ) : (
        <div>Nothing</div>
      )}
    </>
  )
}
