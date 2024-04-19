import type {FunctionComponent} from 'react'
import type {Path} from 'sanity'

import type {PresentationParams, StructureDocumentPaneParams} from '../types'
import {DocumentPanel} from './DocumentPanel'

export const MainDocumentEditor: FunctionComponent<{
  mainDocument: {_id: string; _type: string} | undefined
  params: PresentationParams
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  structureParams: StructureDocumentPaneParams
}> = (props) => {
  const {mainDocument, params, onFocusPath, onStructureParams, structureParams} = props
  const documentId = params.id || mainDocument?._id
  const documentType = params.type || mainDocument?._type
  if (documentId && documentType) {
    return (
      <DocumentPanel
        documentId={documentId}
        documentType={documentType}
        onFocusPath={onFocusPath}
        onStructureParams={onStructureParams}
        previewUrl={params.preview}
        structureParams={structureParams}
      />
    )
  }
  return <div>@todo No Main Document</div>
}
