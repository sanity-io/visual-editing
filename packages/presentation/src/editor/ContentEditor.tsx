import {WarningOutlineIcon} from '@sanity/icons'
import {Badge, Box, Card, Flex, Text} from '@sanity/ui'
import {type HTMLProps, type ReactElement, useCallback} from 'react'
import {type Path, Translate, useSchema, useTranslation} from 'sanity'
import {StateLink} from 'sanity/router'

import {presentationLocaleNamespace} from '../i18n'
import {Preview} from '../internals'
import type {MainDocumentState, StructureDocumentPaneParams} from '../types'
import {DocumentListPane} from './DocumentListPane'
import {DocumentPanel} from './DocumentPanel'

export function ContentEditor(props: {
  documentId?: string
  documentType?: string
  mainDocumentState?: MainDocumentState
  onFocusPath: (path: Path) => void
  onStructureParams: (params: StructureDocumentPaneParams) => void
  previewUrl?: string
  refs: {_id: string; _type: string}[]
  structureParams: StructureDocumentPaneParams
}): ReactElement {
  const {
    documentId,
    documentType,
    mainDocumentState,
    onFocusPath,
    onStructureParams,
    previewUrl,
    refs,
    structureParams,
  } = props

  const {t} = useTranslation(presentationLocaleNamespace)
  const schema = useSchema()

  const MainDocumentLink = useCallback(
    (props: HTMLProps<HTMLAnchorElement>) => {
      return (
        <StateLink
          {...props}
          state={{
            id: mainDocumentState!.document!._id,
            type: mainDocumentState!.document!._type,
            _searchParams: Object.entries({preview: previewUrl}),
          }}
        />
      )
    },
    [mainDocumentState, previewUrl],
  )

  if (documentId && documentType) {
    return (
      <DocumentPanel
        documentId={documentId}
        documentType={documentType}
        onFocusPath={onFocusPath}
        onStructureParams={onStructureParams}
        previewUrl={previewUrl}
        structureParams={structureParams}
      />
    )
  }

  return (
    <Flex direction="column" flex={1} height="fill">
      {mainDocumentState && (
        <Card padding={3} tone={mainDocumentState.document ? 'inherit' : 'caution'}>
          {mainDocumentState.document ? (
            <Card as={MainDocumentLink} data-as="a" padding={0} radius={2}>
              <Preview
                schemaType={schema.get(mainDocumentState.document._type)!}
                status={<Badge>{t('main-document.label')}</Badge>}
                value={mainDocumentState.document}
              />
            </Card>
          ) : (
            <Card padding={2} radius={2} tone="inherit">
              <Flex gap={3}>
                <Box flex="none">
                  <Text size={1}>
                    <WarningOutlineIcon />
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text size={1}>
                    <Translate
                      t={t}
                      i18nKey="main-document.missing.text"
                      components={{Code: 'code'}}
                      values={{path: mainDocumentState.path}}
                    />
                  </Text>
                </Box>
              </Flex>
            </Card>
          )}
        </Card>
      )}

      <DocumentListPane
        mainDocumentState={mainDocumentState}
        onStructureParams={onStructureParams}
        previewUrl={previewUrl}
        refs={refs}
      />
    </Flex>
  )
}
