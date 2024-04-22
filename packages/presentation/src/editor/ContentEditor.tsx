import {Badge, Card, Flex} from '@sanity/ui'
import {type HTMLProps, type ReactElement, useCallback} from 'react'
import {type Path, Preview, useSchema} from 'sanity'
import {StateLink} from 'sanity/router'

import type {StructureDocumentPaneParams} from '../types'
import {DocumentListPane} from './DocumentListPane'
import {DocumentPanel} from './DocumentPanel'

export function ContentEditor(props: {
  documentId?: string
  documentType?: string
  mainDocument?: {_id: string; _type: string}
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  previewUrl?: string
  refs: {_id: string; _type: string}[]
  structureParams: StructureDocumentPaneParams
}): ReactElement {
  const {
    documentId,
    documentType,
    mainDocument,
    onFocusPath,
    onStructureParams,
    previewUrl,
    refs,
    structureParams,
  } = props

  const schema = useSchema()

  const MainDocumentLink = useCallback(
    (props: HTMLProps<HTMLAnchorElement>) => {
      return (
        <StateLink
          {...props}
          state={{
            id: mainDocument!._id,
            type: mainDocument!._type,
            _searchParams: Object.entries({preview: previewUrl}),
          }}
        />
      )
    },
    [mainDocument, previewUrl],
  )

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
    <Flex direction="column" flex={1} height="fill">
      {mainDocument && (
        <Card borderBottom padding={3}>
          <Card as={MainDocumentLink} data-as="a" padding={0} radius={2}>
            <Preview
              schemaType={schema.get(mainDocument._type)!}
              status={<Badge>Main document</Badge>}
              value={mainDocument}
            />
          </Card>
        </Card>
      )}

      <DocumentListPane
        mainDocument={mainDocument}
        onStructureParams={onStructureParams}
        previewUrl={previewUrl}
        refs={refs}
      />
    </Flex>
  )
}
