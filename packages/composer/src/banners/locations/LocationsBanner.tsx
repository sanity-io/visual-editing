import { DesktopIcon } from '@sanity/icons'
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'
import { ComponentProps, ReactNode, useContext } from 'react'
import { DocumentBanner } from 'sanity'
import { useIntentLink } from 'sanity/router'

import { ComposerContext } from '../../ComposerContext'
import { ComposerPluginOptions, DocumentLocation } from '../../types'
import { useDocumentLocations } from '../../useDocumentLocations'

const LENGTH_FORMAT: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
}

export function LocationsBanner(
  props: {
    options: ComposerPluginOptions
  } & ComponentProps<DocumentBanner['component']>,
): ReactNode {
  const { documentId, options, schemaType } = props
  const composer = useContext(ComposerContext)

  const { message, locations, tone } = useDocumentLocations({
    id: documentId,
    locate: options.locate,
    type: schemaType.name,
  })

  const len = locations.length

  if (len === 0) {
    return null
  }

  return (
    <Card borderBottom tone={tone}>
      <Box padding={4} paddingBottom={1}>
        <Text size={1} weight="semibold">
          {message || (
            <>
              Used on {LENGTH_FORMAT[len] || len}{' '}
              {len === 1 ? <>page</> : <>pages</>}
            </>
          )}
        </Text>
      </Box>

      <Stack padding={2} space={1}>
        {locations.map((l, index) => (
          <LocationItem
            active={l.href === composer?.params.preview}
            documentId={documentId}
            documentType={schemaType.name}
            key={index}
            node={l}
          />
        ))}
      </Stack>
    </Card>
  )
}

function LocationItem(props: {
  active: boolean
  documentId: string
  documentType: string
  node: DocumentLocation
}) {
  const { documentId, documentType, node, active } = props
  const composer = useContext(ComposerContext)

  const composerLinkProps = useIntentLink({
    intent: 'edit',
    params: {
      id: documentId,
      type: documentType,
      // @ts-expect-error The `tool` param is not yet part of the `edit` intent
      tool: 'composer',
    },
    searchParams: {
      ...composer?.deskParams,
      preview: node.href,
    },
  })

  return (
    <Card
      {...composerLinkProps}
      as="a"
      key={node.href}
      padding={3}
      radius={2}
      pressed={active}
      tone="inherit"
    >
      <Flex gap={3}>
        <Box flex="none" hidden>
          <Text size={1}>
            <DesktopIcon />
          </Text>
        </Box>
        <Stack flex={1} space={2}>
          <Text size={1} weight="medium">
            {node.title}
          </Text>
          <Text muted size={1} textOverflow="ellipsis">
            {node.href}
          </Text>
        </Stack>
      </Flex>
    </Card>
  )
}
