import { createEditUrl, studioPath } from '@sanity/client/csm'
import { Box, Card, Flex, Text } from '@sanity/ui'
import { pathToUrlString } from '@sanity/visual-editing-helpers'
import { memo, useEffect, useMemo, useRef } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import styled from 'styled-components'

import {
  ElementFocusedState,
  OverlayRect,
  SanityNode,
  SanityNodeLegacy,
} from '../types'

const Root = styled(Card)`
  background-color: var(--overlay-bg);
  border-radius: 3px;
  pointer-events: none;
  position: absolute;
  will-change: transform;
  box-shadow: var(--overlay-box-shadow);
  transition: none;

  --overlay-bg: transparent;
  --overlay-box-shadow: inset 0 0 0 1px transparent;

  [data-overlays] & {
    --overlay-bg: color-mix(
      in srgb,
      transparent 95%,
      var(--card-focus-ring-color)
    );
    --overlay-box-shadow: inset 0 0 0 2px
      color-mix(in srgb, transparent 50%, var(--card-focus-ring-color));
  }

  [data-fading-out] & {
    transition:
      box-shadow 1550ms,
      background-color 1550ms;

    --overlay-bg: rgba(0, 0, 255, 0);
    --overlay-box-shadow: inset 0 0 0 1px transparent;
  }

  &[data-focused] {
    --overlay-box-shadow: inset 0 0 0 1px var(--card-focus-ring-color);
  }

  &[data-hovered]:not([data-focused]) {
    transition: none;
    --overlay-box-shadow: inset 0 0 0 2px var(--card-focus-ring-color);
  }

  /* [data-unmounted] & {
    --overlay-box-shadow: inset 0 0 0 1px var(--card-focus-ring-color);
  } */
`

const Actions = styled(Flex)`
  bottom: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  right: 0;

  [data-hovered] & {
    pointer-events: all;
  }
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
  const { id, type, path, baseUrl, tool, workspace } = node

  return createEditUrl({
    baseUrl,
    workspace,
    tool,
    type: type!,
    id,
    path: pathToUrlString(studioPath.fromString(path)),
  })
}

export const ElementOverlay = memo(function ElementOverlay(props: {
  focused: ElementFocusedState
  hovered: boolean
  rect: OverlayRect
  showActions: boolean
  sanity: SanityNode | SanityNodeLegacy
  wasMaybeCollapsed: boolean
}) {
  const { focused, hovered, rect, showActions, sanity, wasMaybeCollapsed } =
    props

  const ref = useRef<HTMLDivElement>(null)

  const scrolledIntoViewRef = useRef(false)

  useEffect(() => {
    if (
      !scrolledIntoViewRef.current &&
      !wasMaybeCollapsed &&
      focused === true &&
      ref.current
    ) {
      scrollIntoView(ref.current, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
        block: 'center',
        inline: 'nearest',
      })
    }

    scrolledIntoViewRef.current = focused === true
  }, [focused, wasMaybeCollapsed])

  const style = useMemo(
    () => ({
      width: `${rect.w}px`,
      height: `${rect.h}px`,
      transform: `translate(${rect.x}px, ${rect.y}px)`,
    }),
    [rect],
  )

  const href = 'path' in sanity ? createIntentLink(sanity) : sanity.href
  const hrefWithPreview = useMemo(
    () =>
      typeof document === 'undefined'
        ? href
        : href.replace(
            '/intent/edit/',
            `/intent/edit/mode=presentation;preview=${encodeURIComponent(
              `${location.pathname}${location.search}`,
            )};`,
          ),
    // eslint-disable-next-line no-warning-comments
    // @TODO add search params support in core
    /*
        : `${href}${href.includes('?') ? `&` : `?`}${new URLSearchParams({
            preview: `${location.pathname}${location.search}`,
          })}`,
          // **/
    [href],
  )

  return (
    <Root
      data-focused={focused ? '' : undefined}
      data-hovered={hovered ? '' : undefined}
      ref={ref}
      style={style}
    >
      {showActions && hovered ? (
        <Actions gap={1} paddingBottom={1}>
          <Box as="a" href={hrefWithPreview}>
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
