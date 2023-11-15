import { Card, Code, ErrorBoundary, Flex, Label, Stack } from '@sanity/ui'
import {
  ErrorInfo,
  ReactElement,
  useCallback,
  useEffect,
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

import { ErrorCard } from '../components/ErrorCard'
import { DeskDocumentPaneParams } from '../types'
import { usePresentationTool } from '../usePresentationTool'
import { PresentationPaneRouterProvider } from './PresentationPaneRouterProvider'

const RootLayout = styled(PaneLayout)`
  height: 100%;
`

const Root = styled(Flex)`
  & > div {
    min-width: none !important;
    max-width: none !important;
  }
`

const WrappedCode = styled(Code)`
  white-space: pre-wrap;
`

export function DocumentListPane(props: {
  onDeskParams: (params: DeskDocumentPaneParams) => void
  previewUrl?: string
  refs: { _id: string; _type: string }[]
}): ReactElement {
  const { onDeskParams, previewUrl, refs } = props
  const { devMode } = usePresentationTool()

  const pane: Extract<PaneNode, { type: 'documentList' }> = useMemo(
    () => ({
      id: '$root',
      options: {
        filter: '_id in $ids',
        params: { ids: refs.map((r) => r._id) },
      },
      schemaTypeName: '',
      title: 'Documents on this page',
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

  // Reset error state when `refs` value schanges
  useEffect(() => setErrorParams(null), [refs])

  if (errorParams) {
    return (
      <ErrorCard
        flex={1}
        message="Could not render the document list"
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
      <RootLayout>
        <DeskToolProvider>
          <PresentationPaneRouterProvider
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
          </PresentationPaneRouterProvider>
        </DeskToolProvider>
      </RootLayout>
    </ErrorBoundary>
  )
}
