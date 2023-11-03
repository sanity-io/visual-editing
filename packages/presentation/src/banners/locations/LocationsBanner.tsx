import {
  ChevronRightIcon,
  DesktopIcon,
  ErrorOutlineIcon,
  InfoOutlineIcon,
  WarningOutlineIcon,
} from '@sanity/icons'
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'
import {
  ComponentProps,
  ComponentType,
  createElement,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import { DocumentBanner } from 'sanity'
import { useIntentLink } from 'sanity/router'

import { PresentationContext } from '../../PresentationContext'
import { DocumentLocation, PresentationPluginOptions } from '../../types'
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

const TONE_ICONS: Record<'positive' | 'caution' | 'critical', ComponentType> = {
  positive: InfoOutlineIcon,
  caution: WarningOutlineIcon,
  critical: ErrorOutlineIcon,
}

export function LocationsBanner(
  props: {
    options: PresentationPluginOptions
  } & ComponentProps<DocumentBanner['component']>,
): ReactNode {
  const { documentId, options, schemaType } = props
  const presentation = useContext(PresentationContext)

  const { message, locations, tone } = useDocumentLocations({
    id: documentId,
    locate: options.locate,
    type: schemaType.name,
  })

  const len = locations?.length || 0

  const [expanded, setExpanded] = useState(false)

  const toggle = useCallback(() => setExpanded((v) => !v), [])

  const title =
    message ||
    (len ? (
      <>
        Used on {LENGTH_FORMAT[len] || len} {len === 1 ? <>page</> : <>pages</>}
      </>
    ) : null)

  if (len === 0 && !title) {
    return null
  }

  return (
    <Card padding={1} radius={3} border tone={tone}>
      <div style={{ margin: -1 }}>
        {!locations && (
          <Flex align="flex-start" gap={3} padding={3}>
            {tone && (
              <Box flex="none">
                <Text size={1}>{createElement(TONE_ICONS[tone])}</Text>
              </Box>
            )}
            <Box flex={1}>
              <Text size={1} weight="medium">
                {title}
              </Text>
            </Box>
          </Flex>
        )}

        {locations && (
          <>
            <Card
              as="button"
              onClick={toggle}
              padding={3}
              radius={2}
              tone="inherit"
            >
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
                  <Text size={1} weight="medium">
                    {title}
                  </Text>
                </Box>
              </Flex>
            </Card>
            <Stack hidden={!expanded} marginTop={1} space={1}>
              {locations.map((l, index) => (
                <LocationItem
                  active={l.href === presentation?.params.preview}
                  documentId={documentId}
                  documentType={schemaType.name}
                  key={index}
                  node={l}
                />
              ))}
            </Stack>
          </>
        )}
      </div>
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
  const presentation = useContext(PresentationContext)

  const presentationLinkProps = useIntentLink({
    intent: 'edit',
    params: {
      id: documentId,
      type: documentType,
      // @ts-expect-error The `tool` param is not yet part of the `edit` intent
      tool: 'presentation',
    },
    searchParams: {
      ...presentation?.deskParams,
      preview: node.href,
    },
  })

  return (
    <Card
      {...presentationLinkProps}
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
