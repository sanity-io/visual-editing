import {type ReactElement} from 'react'
import {type Path} from 'sanity'
import {StructureToolProvider} from '../internals'
import type {PresentationSearchParams, StructureDocumentPaneParams} from '../types'
import {DocumentPane} from './DocumentPane'

export function DocumentPanel(props: {
  documentId: string
  documentType: string
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  searchParams: PresentationSearchParams
  structureParams: StructureDocumentPaneParams
}): ReactElement {
  const {documentId, documentType, onFocusPath, onStructureParams, searchParams, structureParams} =
    props
  return (
    <StructureToolProvider>
      <DocumentPane
        documentId={documentId}
        documentType={documentType}
        onFocusPath={onFocusPath}
        onStructureParams={onStructureParams}
        searchParams={searchParams}
        structureParams={structureParams}
      />
    </StructureToolProvider>
  )
}
