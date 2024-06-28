import {
  pathToUrlString,
  type SchemaNode,
  type SchemaType,
  type SchemaUnionOption,
} from '@repo/visual-editing-helpers'
import {createEditUrl, studioPath} from '@sanity/client/csm'
import {DocumentIcon} from '@sanity/icons'
import {Box, Card, Flex, Text} from '@sanity/ui'
import {memo, type MouseEvent, useCallback, useEffect, useMemo, useRef} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {styled} from 'styled-components'

import type {
  ElementFocusedState,
  OverlayMsg,
  OverlayRect,
  SanityNode,
  SanityStegaNode,
  VisualEditingOptions,
} from '../types'
import {HoverZone} from './HoverZone'
import {getField, getSchemaType} from './schema'

const Root = styled(Card)`
  background-color: var(--overlay-bg);
  border-radius: 3px;
  pointer-events: none;
  position: absolute;
  will-change: transform;
  box-shadow: var(--overlay-box-shadow);
  transition: none;
  flex-direction: column;
  justify-content: space-between;

  --overlay-bg: transparent;
  --overlay-box-shadow: inset 0 0 0 1px transparent;

  [data-overlays] & {
    --overlay-bg: color-mix(in srgb, transparent 95%, var(--card-focus-ring-color));
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

  :link {
    text-decoration: none;
  }
`

const Tab = styled(Flex)`
  bottom: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  left: 0;
`

const Labels = styled(Flex)`
  background-color: var(--card-focus-ring-color);
  right: 0;
  border-radius: 3px;
  & [data-ui='Text'],
  & [data-sanity-icon] {
    color: var(--card-bg-color);
    white-space: nowrap;
  }
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
  const {id, type, path, baseUrl, tool, workspace} = node

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
  id: string
  components?: VisualEditingOptions['components']
  doPatch: (data: {id: string; type: string; patch: Record<string, unknown>}) => void
  dispatch: (msg: OverlayMsg) => void
  focused: ElementFocusedState
  hovered: boolean
  rect: OverlayRect
  resolvedTypes: Map<string, Map<string, string>>
  sanity: SanityNode | SanityStegaNode
  schema: SchemaType[] | null
  showActions: boolean
  wasMaybeCollapsed: boolean
}) {
  const {
    id,
    components,
    doPatch,
    dispatch,
    focused,
    hovered,
    rect,
    resolvedTypes,
    sanity,
    schema,
    showActions,
    wasMaybeCollapsed,
  } = props

  const ref = useRef<HTMLDivElement>(null)

  const scrolledIntoViewRef = useRef(false)

  useEffect(() => {
    if (!scrolledIntoViewRef.current && !wasMaybeCollapsed && focused === true && ref.current) {
      const target = ref.current
      scrollIntoView(ref.current, {
        // Workaround issue with scroll-into-view-if-needed struggling with iframes
        behavior: (actions) => {
          if (actions.length === 0) {
            // An empty actions list equals scrolling isn't needed
            return
          }
          // Uses native scrollIntoView to ensure iframes behave correctly
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })
        },
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

  const documentSchema = useMemo(() => {
    return schema ? getSchemaType(sanity, schema) : undefined
  }, [sanity, schema])

  const {field, parent} = useMemo(() => {
    return getField(sanity, documentSchema, resolvedTypes)
  }, [documentSchema, sanity, resolvedTypes])

  const onBubbledEvent = useCallback(
    (event: MouseEvent) => {
      if (event.type === 'contextmenu') {
        dispatch({
          type: 'element/contextmenu',
          id,
          position: {
            x: event.clientX,
            y: event.clientY,
          },
          sanity,
        })
      } else if (event.type === 'click') {
        dispatch({
          type: 'element/click',
          id,
          sanity,
        })
      }
    },
    [dispatch, id, sanity],
  )

  const Icon = useMemo(() => {
    if (documentSchema?.icon) return <div dangerouslySetInnerHTML={{__html: documentSchema.icon}} />
    return <DocumentIcon />
  }, [documentSchema])

  const Custom = useMemo(() => {
    return components?.find((c) => {
      return (
        'path' in sanity &&
        c.name === sanity.type &&
        c.path === sanity.path &&
        c.type === field?.value.type
      )
    })?.component
  }, [components, field, sanity])

  const onAddUnion = useCallback(
    (position: 'top' | 'bottom', name: string) => {
      if ('path' in sanity && sanity.id && sanity.type) {
        const operation = position === 'top' ? 'before' : 'after'
        doPatch({
          id: sanity.id,
          type: sanity.type,
          patch: {
            insert: {
              [operation]: sanity.path,
              items: [{_type: name, _key: Math.random().toString(36).slice(2, 5)}],
            },
          },
        })
      }
    },
    [doPatch, sanity],
  )

  return (
    <Root
      data-focused={focused ? '' : undefined}
      data-hovered={hovered ? '' : undefined}
      ref={ref}
      style={style}
    >
      {hovered && (
        <>
          {showActions ? (
            <Actions gap={1} paddingBottom={1}>
              <Box
                as="a"
                href={href}
                target="_blank"
                rel="noopener"
                // @ts-expect-error -- TODO update typings in @sanity/ui
                referrerPolicy="no-referrer-when-downgrade"
                data-sanity-overlay-element
              >
                <ActionOpen padding={2}>
                  <Text size={1} weight="medium">
                    Open in Studio
                  </Text>
                </ActionOpen>
              </Box>
            </Actions>
          ) : null}

          {documentSchema?.title && (
            <Tab gap={1} paddingBottom={1}>
              <Labels gap={2} padding={2}>
                <Text size={1}>{Icon}</Text>
                <Text size={1} weight="medium">
                  {documentSchema.title}
                </Text>
              </Labels>
            </Tab>
          )}
          {Custom && 'path' in sanity && (
            <div style={{pointerEvents: 'all'}} data-sanity-overlay-element>
              <Custom sanity={sanity} dispatch={doPatch} />
            </div>
          )}

          {parent && parent.type === 'union' && (
            <>
              <HoverZone
                node={parent}
                onAddUnion={onAddUnion}
                onBubbledEvent={onBubbledEvent}
                position="top"
              />
              <HoverZone
                node={parent}
                onAddUnion={onAddUnion}
                onBubbledEvent={onBubbledEvent}
                position="bottom"
              />
            </>
          )}
        </>
      )}
    </Root>
  )
})
