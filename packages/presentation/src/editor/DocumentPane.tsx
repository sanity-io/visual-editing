import { Card, Code, ErrorBoundary, Label, Stack } from '@sanity/ui'
import {
  ErrorInfo,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Path } from 'sanity'
import {
  DocumentPane as DeskDocumentPane,
  DocumentPaneNode,
  PaneLayout,
  useDeskTool,
} from 'sanity/desk'
import styled from 'styled-components'

import { ErrorCard } from '../components/ErrorCard'
import { DeskDocumentPaneParams } from '../types'
import { usePresentationTool } from '../usePresentationTool'
import { PresentationPaneRouterProvider } from './PresentationPaneRouterProvider'

const WrappedCode = styled(Code)`
  white-space: pre-wrap;
`

export function DocumentPane(props: {
  documentId: string
  documentType: string
  params: DeskDocumentPaneParams
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
}): ReactElement {
  const { documentId, documentType, params, onDeskParams, onFocusPath } = props
  const { devMode } = usePresentationTool()

  const paneDocumentNode: DocumentPaneNode = useMemo(
    () => ({
      id: documentId,
      options: {
        id: documentId,
        type: documentType,
      },
      title: '',
      type: 'document',
    }),
    [documentId, documentType],
  )

  const [errorParams, setErrorParams] = useState<{
    info: ErrorInfo
    error: Error
  } | null>(null)

  const handleRetry = useCallback(() => setErrorParams(null), [])

  // Reset error state when parameters change
  useEffect(() => {
    setErrorParams(null)
  }, [documentId, documentType, params])

  const { setLayoutCollapsed } = useDeskTool()
  const handleRootCollapse = useCallback(
    () => setLayoutCollapsed(true),
    [setLayoutCollapsed],
  )
  const handleRootExpand = useCallback(
    () => setLayoutCollapsed(false),
    [setLayoutCollapsed],
  )

  if (errorParams) {
    return (
      <ErrorCard
        flex={1}
        message="Could not render the document editor"
        onRetry={handleRetry}
      >
        {devMode && (
          // show runtime error message in dev mode
          <Card overflow="auto" padding={3} radius={2} tone="critical">
            <Stack space={3}>
              <Label muted size={0}>
                Error message
              </Label>
              <WrappedCode size={1}>{errorParams.error.message}</WrappedCode>
            </Stack>
          </Card>
        )}
      </ErrorCard>
    )
  }

  return (
    <ErrorBoundary onCatch={setErrorParams}>
      <PaneLayout
        style={{ height: '100%' }}
        onExpand={handleRootExpand}
        onCollapse={handleRootCollapse}
      >
        <PresentationPaneRouterProvider
          onDeskParams={onDeskParams}
          params={params}
        >
          <DeskDocumentPane
            paneKey="document"
            index={1}
            itemId="document"
            pane={paneDocumentNode}
            onFocusPath={onFocusPath}
          />
        </PresentationPaneRouterProvider>
      </PaneLayout>
    </ErrorBoundary>
  )
}
