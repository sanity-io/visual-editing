import { Box, Card, Flex, Text } from '@sanity/ui'
import { memo, useEffect, useMemo, useRef } from 'react'
import { stringToPath } from 'sanity'
import styled from 'styled-components'

import { pathToUrlString } from '../pathToUrlString'
import { OverlayRect, SanityNode, SanityNodeLegacy } from '../types'

const Root = styled(Card)<{
  $hovered: boolean
  $focused: boolean
}>`
  background-color: transparent;
  border-radius: 3px;
  opacity: ${({ $focused, $hovered }) => ($hovered ? 1 : $focused ? 0.75 : 0)};
  outline-color: var(--card-focus-ring-color);
  outline-offset: 0px;
  outline-style: solid;
  outline-width: 1px;
  pointer-events: none;
  position: absolute;
  will-change: transform;
`

const Actions = styled(Flex)<{
  $hovered: boolean
}>`
  bottom: 100%;
  cursor: pointer;
  pointer-events: ${({ $hovered }) => ($hovered ? 'all' : 'none')};
  position: absolute;
  right: 0;
`

const ActionOpen = styled(Card)`
  background-color: var(--card-focus-ring-color);
  right: 0;
  border-radius: 3px;
  & [data-ui='Text'] {
    color: var(--card-bg-color);
    white-space: nowrap;
  }
`

function createIntentLink(node: SanityNode) {
  const { projectId, dataset, id, type, path, baseUrl, tool, workspace } = node

  const parts = [
    ['project', projectId],
    ['dataset', dataset],
    ['id', id],
    ['type', type],
    ['path', pathToUrlString(stringToPath(path))],
    ['workspace', workspace],
    ['tool', tool],
  ]

  const intent = parts
    .filter(([, value]) => !!value)
    .map((part) => part.join('='))
    .join(';')

  return `${baseUrl}/intent/edit/${intent}`
}

export const ElementOverlay = memo(function ElementOverlay(props: {
  focused: boolean
  hovered: boolean
  rect: OverlayRect
  showActions: boolean
  sanity: SanityNode | SanityNodeLegacy
}) {
  const { focused, hovered, rect, showActions, sanity } = props

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focused) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [focused])

  const style = useMemo(
    () => ({
      width: `${rect.w}px`,
      height: `${rect.h}px`,
      transform: `translate(${rect.x}px, ${rect.y}px)`,
    }),
    [rect],
  )

  const href = 'path' in sanity ? createIntentLink(sanity) : ''

  return (
    <Root ref={ref} $focused={focused} $hovered={hovered} style={style}>
      {showActions && hovered ? (
        <Actions $hovered={hovered} gap={1} paddingBottom={1}>
          <Box as="a" href={href}>
            <ActionOpen padding={2}>
              <Text size={1} weight="medium">
                Open in Studio
              </Text>
            </ActionOpen>
          </Box>
        </Actions>
      ) : null}
    </Root>
  )
})
