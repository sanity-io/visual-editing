import {Card, Code, ErrorBoundary, Label, Stack} from '@sanity/ui'
import {type ErrorInfo, type ReactElement, useCallback, useEffect, useMemo, useState} from 'react'
import {type Path, useTranslation} from 'sanity'
import {styled} from 'styled-components'

import {ErrorCard} from '../components/ErrorCard'
import {presentationLocaleNamespace} from '../i18n'
import {
  decodeJsonParams,
  DocumentPane as StructureDocumentPane,
  type DocumentPaneNode,
  PaneLayout,
} from '../internals'
import type {StructureDocumentPaneParams} from '../types'
import {usePresentationTool} from '../usePresentationTool'
import {PresentationPaneRouterProvider} from './PresentationPaneRouterProvider'

const WrappedCode = styled(Code)`
  white-space: pre-wrap;
`

export function DocumentPane(props: {
  documentId: string
  documentType: string
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  params: StructureDocumentPaneParams
  previewUrl?: string
}): ReactElement {
  const {documentId, documentType, onFocusPath, onStructureParams, params, previewUrl} = props
  const {template, templateParams} = params

  const {t} = useTranslation(presentationLocaleNamespace)
  const {devMode} = usePresentationTool()

  const paneDocumentNode: DocumentPaneNode = useMemo(
    () => ({
      id: documentId,
      options: {
        id: documentId,
        type: documentType,
        template,
        templateParameters: decodeJsonParams(templateParams),
      },
      title: '',
      type: 'document',
    }),
    [documentId, documentType, template, templateParams],
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

  if (errorParams) {
    return (
      <ErrorCard flex={1} message={t('document-pane.error.text')} onRetry={handleRetry}>
        {devMode && (
          // show runtime error message in dev mode
          <Card overflow="auto" padding={3} radius={2} tone="critical">
            <Stack space={3}>
              <Label muted size={0}>
                {t('presentation-error.label')}
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
      <PaneLayout style={{height: '100%'}}>
        <PresentationPaneRouterProvider
          onStructureParams={onStructureParams}
          params={params}
          previewUrl={previewUrl}
        >
          <StructureDocumentPane
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
