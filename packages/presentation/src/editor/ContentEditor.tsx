import { type ReactElement } from 'react'
import type { Path } from 'sanity'

import type { StructureDocumentPaneParams } from '../types'
import { DocumentListPane } from './DocumentListPane'
import { DocumentPanel } from './DocumentPanel'

export function ContentEditor(props: {
  documentId?: string
  documentType?: string
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
  structureParams: StructureDocumentPaneParams
}): ReactElement {
  const {
    documentId,
    documentType,
    onFocusPath,
    onStructureParams,
    previewUrl,
    refs,
    structureParams,
  } = props

  if (documentId && documentType) {
    return (
      <DocumentPanel
        documentId={documentId}
        documentType={documentType}
        onFocusPath={onFocusPath}
        onStructureParams={onStructureParams}
        previewUrl={previewUrl}
        structureParams={structureParams}
      />
    )
  }

  return (
    <DocumentListPane
      onStructureParams={onStructureParams}
      previewUrl={previewUrl}
      refs={refs}
    />
  )
}
