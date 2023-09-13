import { Card, Flex, Text } from '@sanity/ui'
import { memo, useMemo } from 'react'
import styled from 'styled-components'

import { OverlayRect } from '../types'

const Root = styled(Card)<{
  $hovered: boolean
}>`
  background-color: transparent;
  border-radius: 3px;
  opacity: ${({ $hovered }) => ($hovered ? 1 : 0)};
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

export const ElementOverlay = memo(function ElementOverlay(props: {
  hovered: boolean
  rect: OverlayRect
}) {
  const { hovered, rect } = props

  const style = useMemo(
    () => ({
      width: `${rect.w}px`,
      height: `${rect.h}px`,
      transform: `translate(${rect.x}px, ${rect.y}px)`,
    }),
    [rect],
  )

  return (
    <Root $hovered={hovered} style={style}>
      <Actions $hovered={hovered} gap={1} paddingBottom={1}>
        <ActionOpen padding={2}>
          <Text size={1} weight="medium">
            Open in Studio
          </Text>
        </ActionOpen>
      </Actions>
    </Root>
  )
})
