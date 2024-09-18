import {Card, Code, ErrorBoundary, Label, Stack} from '@sanity/ui'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactElement,
} from 'react'
import {useTranslation, type Path} from 'sanity'
import {styled} from 'styled-components'
import {ErrorCard} from '../components/ErrorCard'
import {presentationLocaleNamespace} from '../i18n'
import {
  decodeJsonParams,
  PaneLayout,
  DocumentPane as StructureDocumentPane,
  type DocumentPaneNode,
} from '../internals'
import {PresentationSpinner} from '../PresentationSpinner'
import type {PresentationSearchParams, StructureDocumentPaneParams} from '../types'
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
  structureParams: StructureDocumentPaneParams
  searchParams: PresentationSearchParams
}): ReactElement {
  const {documentId, documentType, onFocusPath, onStructureParams, searchParams, structureParams} =
    props
  const {template, templateParams} = structureParams

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
  }, [documentId, documentType, structureParams])

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
          searchParams={searchParams}
          onStructureParams={onStructureParams}
          structureParams={structureParams}
        >
          <Suspense fallback={<PresentationSpinner />}>
            <StructureDocumentPane
              paneKey="document"
              index={1}
              itemId="document"
              pane={paneDocumentNode}
              onFocusPath={onFocusPath}
            />
          </Suspense>
        </PresentationPaneRouterProvider>
      </PaneLayout>
    </ErrorBoundary>
  )
}
