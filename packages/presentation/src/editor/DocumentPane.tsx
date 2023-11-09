import {
  Box,
  Button,
  Card,
  Code,
  Container,
  ErrorBoundary,
  Flex,
  Label,
  Stack,
  Text,
} from '@sanity/ui'
import {
  ErrorInfo,
  FunctionComponent,
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

import { DeskDocumentPaneParams } from '../types'
import { usePresentationTool } from '../usePresentationTool'
import { PresentationPaneRouterProvider } from './PresentationPaneRouterProvider'

export const DocumentPane: FunctionComponent<{
  documentId: string
  documentType: string
  params: DeskDocumentPaneParams
  onDeskParams: (params: DeskDocumentPaneParams) => void
  onFocusPath: (path: Path) => void
}> = function (props) {
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
      <Flex align="center" height="fill" justify="center">
        <Container padding={4} sizing="border" width={0}>
          <Stack space={3}>
            <Text size={1} weight="semibold">
              An error occured
            </Text>
            <Text muted size={1}>
              Could not render the document editor
            </Text>
          </Stack>
          {devMode && (
            <Card
              marginTop={4}
              overflow="auto"
              padding={3}
              radius={2}
              tone="critical"
            >
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
        </Container>
      </Flex>
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
