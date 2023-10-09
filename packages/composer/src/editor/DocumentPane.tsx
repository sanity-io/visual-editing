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
  DocumentPane as DeskDocumentPane,
  DocumentPaneNode,
  PaneLayout,
} from 'sanity/desk'

import { DeskDocumentPaneParams } from '../types'
import { ComposerPaneRouterProvider } from './ComposerPaneRouterProvider'

export const DocumentPane: FunctionComponent<{
  documentId: string
  documentType: string
  params: DeskDocumentPaneParams
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
}> = function (props) {
  const { documentId, documentType, params, onDeskParams, onFocusPath } = props

  const pane: DocumentPaneNode = useMemo(
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
            <DeskDocumentPane
              paneKey="document"
              index={1}
              itemId="document"
              pane={pane}
              onFocusPath={onFocusPath}
            />
          </ComposerPaneRouterProvider>
        </DeskToolProvider>
      </PaneLayout>
    </ErrorBoundary>
  )
}
