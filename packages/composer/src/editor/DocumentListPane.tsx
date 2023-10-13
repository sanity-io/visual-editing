import { Button, ErrorBoundary, Flex } from '@sanity/ui'
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
