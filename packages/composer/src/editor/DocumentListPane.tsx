import {
  Box,
  Button,
  Card,
  Code,
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
  useMemo,
  useState,
} from 'react'
import {
  DeskToolProvider,
  DocumentListPane as DeskDocumentListPane,
  PaneLayout,
  PaneNode,
} from 'sanity/desk'
import styled from 'styled-components'

import { DeskDocumentPaneParams } from '../types'
import { ComposerPaneRouterProvider } from './ComposerPaneRouterProvider'

const Root = styled(Flex)`
  & > div {
    min-width: none !important;
    max-width: none !important;
  }
`
export const DocumentListPane: FunctionComponent<{
  onDeskParams: (params: DeskDocumentPaneParams) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}> = function (props) {
  const { onDeskParams, previewUrl, refs } = props
  const localhost = useMemo(() => window.location.hostname === 'localhost', [])

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

  const [errorParams, setErrorParams] = useState<{
    info: ErrorInfo
    error: Error
  } | null>(null)

  const handleRetry = useCallback(() => setErrorParams(null), [])

  const deskParams = useMemo(() => ({}), [])

  if (errorParams) {
    return (
      <Box padding={4}>
        <Stack space={3}>
          <Text size={1} weight="semibold">
            An error occured
          </Text>
          <Text muted size={1}>
            Could not render the document list
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
            params={deskParams}
            onDeskParams={onDeskParams}
            previewUrl={previewUrl}
            refs={refs}
          >
            <Root direction="column" flex={1}>
              <DeskDocumentListPane
                index={0}
                itemId="$root"
                pane={pane}
                paneKey="$root"
              />
            </Root>
          </ComposerPaneRouterProvider>
        </DeskToolProvider>
      </PaneLayout>
    </ErrorBoundary>
  )
}
