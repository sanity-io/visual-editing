import {pathToUrlString} from '@repo/visual-editing-helpers'
import {createEditUrl, studioPath} from '@sanity/client/csm'
import {DocumentIcon, DragHandleIcon} from '@sanity/icons'
import {Box, Card, Flex, Text} from '@sanity/ui'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type FunctionComponent,
} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {styled} from 'styled-components'
import type {ElementFocusedState, OverlayRect, SanityNode, SanityStegaNode} from '../types'
import {getDraftId} from '../util/documents'
import {usePreviewSnapshots} from './preview/usePreviewSnapshots'
import {getSchemaType} from './schema/schema'
import {useSchema} from './schema/useSchema'

export interface ElementOverlayProps {
  focused: ElementFocusedState
  hovered: boolean
  rect: OverlayRect
  node: SanityNode | SanityStegaNode
  showActions: boolean
  wasMaybeCollapsed: boolean
  draggable: boolean
  isDragging: boolean
}

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

const Tab = styled(Flex)`
  bottom: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  left: 0;
`

const Labels = styled(Flex)`
  display: flex;
  align-items: center;
  background-color: var(--card-focus-ring-color);
  right: 0;
  border-radius: 3px;
  & [data-ui='Text'],
  & [data-sanity-icon] {
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

const ElementOverlayInner: FunctionComponent<ElementOverlayProps> = (props) => {
  const {node, showActions, draggable} = props

  const {schema} = useSchema()
  const schemaType = getSchemaType(node, schema)

  const href = 'path' in node ? createIntentLink(node) : node.href

  const previewSnapshots = usePreviewSnapshots()

  const title = useMemo(() => {
    if (!('path' in node)) return undefined
    const id = getDraftId(node.id)
    return previewSnapshots.find((snapshot) => snapshot._id === id)?.title
  }, [node, previewSnapshots])

  const Icon = useMemo(() => {
    if (schemaType?.icon) return <div dangerouslySetInnerHTML={{__html: schemaType.icon}} />
    return <DocumentIcon />
  }, [schemaType?.icon])

  return (
    <>
      {showActions ? (
        <Actions gap={1} paddingBottom={1} data-sanity-overlay-element>
          <Link href={href} />
        </Actions>
      ) : null}

      {title && (
        <Tab gap={1} paddingBottom={1}>
          <Labels gap={2} padding={2}>
            {draggable && (
              <Box marginRight={1}>
                <Text className="drag-handle" size={0}>
                  <DragHandleIcon />
                </Text>
              </Box>
            )}
            <Text size={0}>{Icon}</Text>
            <Text size={1} weight="medium">
              {title}
            </Text>
          </Labels>
        </Tab>
      )}
    </>
  )
}

export const ElementOverlay = memo(function ElementOverlay(props: ElementOverlayProps) {
  const {focused, hovered, rect, wasMaybeCollapsed, isDragging} = props

  const ref = useRef<HTMLDivElement>(null)

  const scrolledIntoViewRef = useRef(false)

  const style = useMemo<CSSProperties>(
    () => ({
      width: `${rect.w}px`,
      height: `${rect.h}px`,
      transform: `translate(${rect.x}px, ${rect.y}px)`,
    }),
    [rect],
  )

  useEffect(() => {
    if (
      !scrolledIntoViewRef.current &&
      !wasMaybeCollapsed &&
      focused === true &&
      ref.current &&
      !isDragging
    ) {
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
  }, [focused, wasMaybeCollapsed, isDragging])

  return (
    <Root
      data-focused={focused ? '' : undefined}
      data-hovered={hovered ? '' : undefined}
      ref={ref}
      style={style}
    >
      {hovered && <ElementOverlayInner {...props} />}
    </Root>
  )
})

const Link = memo(function Link(props: {href: string}) {
  const referer = useSyncExternalStore(
    useCallback((onStoreChange) => {
      const handlePopState = () => onStoreChange()
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }, []),
    () => window.location.href,
  )
  const href = useMemo(() => {
    try {
      const parsed = new URL(props.href)
      parsed.searchParams.set('preview', referer)
      return parsed.toString()
    } catch {
      return props.href
    }
  }, [props.href, referer])

  return (
    <Box as="a" href={href} target="_blank" rel="noopener noreferrer">
      <ActionOpen padding={2}>
        <Text size={1} weight="medium">
          Open in Studio
        </Text>
      </ActionOpen>
    </Box>
  )
})
