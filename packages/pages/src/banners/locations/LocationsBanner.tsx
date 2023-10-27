import { ChevronRightIcon, DesktopIcon } from '@sanity/icons'
import { Box, Card, Container, Flex, Stack, Text } from '@sanity/ui'
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import { DocumentBanner } from 'sanity'
import { useIntentLink } from 'sanity/router'

import { PagesContext } from '../../PagesContext'
import { DocumentLocation, PagesPluginOptions } from '../../types'
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
    options: PagesPluginOptions
  } & ComponentProps<DocumentBanner['component']>,
): ReactNode {
  const { documentId, options, schemaType } = props
  const pages = useContext(PagesContext)

  const { message, locations, tone } = useDocumentLocations({
    id: documentId,
    locate: options.locate,
    type: schemaType.name,
  })

  const len = locations.length

  const [expanded, setExpanded] = useState(false)

  const toggle = useCallback(() => setExpanded((v) => !v), [])

  if (len === 0) {
    return null
  }

  return (
    <Card tone={tone}>
      <Container width={1}>
        <Box padding={2} paddingBottom={expanded ? 0 : 2}>
          <Card as="button" onClick={toggle} padding={3} radius={2}>
            <Flex gap={3}>
              <Box flex="none">
                <Text size={1}>
                  <ChevronRightIcon
                    style={{
                      transform: `rotate(${expanded ? '90deg' : 0})`,
                      transition: 'transform 100ms ease-in-out',
                    }}
                  />
                </Text>
              </Box>
              <Box flex={1}>
                <Text size={1} weight="semibold">
                  {message || (
                    <>
                      Used on {LENGTH_FORMAT[len] || len}{' '}
                      {len === 1 ? <>page</> : <>pages</>}
                    </>
                  )}
                </Text>
              </Box>
            </Flex>
          </Card>
        </Box>

        <Stack hidden={!expanded} padding={2} paddingTop={1} space={1}>
          {locations.map((l, index) => (
            <LocationItem
              active={l.href === pages?.params.preview}
              documentId={documentId}
              documentType={schemaType.name}
              key={index}
              node={l}
            />
          ))}
        </Stack>
      </Container>
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
  const pages = useContext(PagesContext)

  const pagesLinkProps = useIntentLink({
    intent: 'edit',
    params: {
      id: documentId,
      type: documentType,
      // @ts-expect-error The `tool` param is not yet part of the `edit` intent
      tool: 'pages',
    },
    searchParams: {
      ...pages?.deskParams,
      preview: node.href,
    },
  })

  return (
    <Card
      {...pagesLinkProps}
      as="a"
      key={node.href}
      padding={3}
      radius={2}
      pressed={active}
      tone="inherit"
    >
      <Flex gap={3}>
        <Box flex="none">
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
