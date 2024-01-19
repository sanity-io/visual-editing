import { type ReactElement } from 'react'
import { type Path } from 'sanity'
import { StructureToolProvider } from 'sanity/structure'

import { DeskDocumentPaneParams } from '../types'
import { DocumentPane } from './DocumentPane'

export function DocumentPanel(props: {
  deskParams: DeskDocumentPaneParams
  documentId: string
  documentType: string
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
}): ReactElement {
  const { deskParams, documentId, documentType, onDeskParams, onFocusPath } =
    props
  return (
    <StructureToolProvider>
      <DocumentPane
        documentId={documentId}
        documentType={documentType}
        params={deskParams}
        onDeskParams={onDeskParams}
        onFocusPath={onFocusPath}
      />
    </StructureToolProvider>
  )
}
