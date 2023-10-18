import {
  Box,
  Button,
  Card,
  Code,
  ErrorBoundary,
  Label,
  Stack,
  Text,
} from '@sanity/ui'
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
  const localhost = useMemo(() => window.location.hostname === 'localhost', [])

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

  const [errorParams, setErrorParams] = useState<{
    info: ErrorInfo
    error: Error
  } | null>(null)

  const handleRetry = useCallback(() => setErrorParams(null), [])

  if (errorParams) {
    return (
      <Box padding={4}>
        <Stack space={3}>
          <Text size={1} weight="semibold">
            An error occured
          </Text>
          <Text muted size={1}>
            Could not render the document editor
          </Text>
        </Stack>
        {localhost && (
          <Card border marginTop={4} overflow="auto" padding={3} radius={2}>
            <Stack space={3}>
              <Label muted size={0}>
                Error message
              </Label>
              <Code size={1} style={{ whiteSpace: 'pre-wrap' }}>
                {errorParams.error.message}
              </Code>
            </Stack>
          </Card>
        )}
        <Box marginTop={4}>
          <Button
            fontSize={1}
            mode="ghost"
            onClick={handleRetry}
            text="Retry"
          />
        </Box>
      </Box>
    )
  }

  return (
    <ErrorBoundary onCatch={setErrorParams}>
      <PaneLayout style={{ height: '100%' }}>
        <DeskToolProvider>
          <ComposerPaneRouterProvider
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
          </ComposerPaneRouterProvider>
        </DeskToolProvider>
      </PaneLayout>
    </ErrorBoundary>
  )
}
