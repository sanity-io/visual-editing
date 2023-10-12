import { Button, ErrorBoundary } from '@sanity/ui'
import {
  ErrorInfo,
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { Path } from 'sanity'
import {
  DeskToolProvider,
  DocumentListPane,
  DocumentPane as DeskDocumentPane,
  DocumentPaneNode,
  PaneLayout,
  PaneNode,
} from 'sanity/desk'

import { DeskDocumentPaneParams } from '../types'
import { ComposerPaneRouterProvider } from './ComposerPaneRouterProvider'

export const DocumentPane: FunctionComponent<{
  documentId: string
  documentType: string
  params: DeskDocumentPaneParams
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
  refs: { _id: string; _type: string }[]
}> = function (props) {
  const { documentId, documentType, params, onDeskParams, onFocusPath, refs } =
    props

  const paneDocumentNode: DocumentPaneNode = useMemo(
    () => ({
      id: documentId,
      options: {
        id: documentId,
        type: documentType,
      },
      type: 'document',
    }),
    [documentId, documentType],
  )
  const pane: Extract<PaneNode, { type: 'documentList' }> = useMemo(
    () => ({
      id: '$root',
      options: {
        filter: '_id in $ids',
        params: { ids: refs.map((r) => r._id) },
      },
      schemaTypeName: '',
      title: 'Documents on page',
      type: 'documentList',
    }),
    [refs],
  )
  console.log({ pane })

  const [errorParams, setErrorParams] = useState<{
    info: ErrorInfo
    error: Error
  } | null>(null)

  const handleRetry = useCallback(() => setErrorParams(null), [])

  if (errorParams) {
    return (
      <div>
        <div>{errorParams.error.message}</div>
        <Button onClick={handleRetry} text="Retry" />
      </div>
    )
  }

  return (
    <ErrorBoundary onCatch={setErrorParams}>
      <PaneLayout style={{ height: '100%' }}>
        <DeskToolProvider>
          <ComposerPaneRouterProvider
            params={params}
            onDeskParams={onDeskParams}
          >
            <DocumentListPane
              index={0}
              itemId="$root"
              pane={pane}
              paneKey="$root"
            />
            <DeskDocumentPane
              paneKey="document"
              index={1}
              itemId="document"
              pane={paneDocumentNode}
              onFocusPath={onFocusPath}
            />
          </ComposerPaneRouterProvider>
        </DeskToolProvider>
      </PaneLayout>
    </ErrorBoundary>
  )
}
