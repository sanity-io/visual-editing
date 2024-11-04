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
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {styled} from 'styled-components'
import type {
  ElementFocusedState,
  ElementNode,
  OverlayComponent,
  OverlayComponentResolver,
  OverlayElementParent,
  OverlayRect,
  SanityNode,
  SanityStegaNode,
} from '../types'
import {usePreviewSnapshots} from './preview/usePreviewSnapshots'
import {useSchema} from './schema/useSchema'

export interface ElementOverlayProps {
  componentResolver?: OverlayComponentResolver
  draggable: boolean
  element: ElementNode
  focused: ElementFocusedState
  hovered: boolean
  isDragging: boolean
  node: SanityNode | SanityStegaNode
  rect: OverlayRect
  showActions: boolean
  wasMaybeCollapsed: boolean
  enableScrollIntoView: boolean
  releases: any[]
  versions: any[]
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
    color: #fff;
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
    color: #fff;
    white-space: nowrap;
  }
`

const Releases = styled.div`
  opacity: 0;
  animation: o 300ms 500ms ease forwards;

  @keyframes o {
    from {
      opacity: 0%;
    }

    to {
      opacity: 100%;
    }
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

const PointerEvents: FunctionComponent<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  style,
  ...rest
}) => {
  return (
    <div style={{...style, pointerEvents: 'all'}} data-sanity-overlay-element {...rest}>
      {children}
    </div>
  )
}

const ComponentWrapper: FunctionComponent<{
  element: ElementNode
  components: OverlayComponent[]
  parent: OverlayElementParent
  node: SanityNode
}> = (props) => {
  const {components, element, node, parent} = props

  return components.map((Component, i) => {
    return (
      <Component
        key={i}
        element={element}
        node={node}
        parent={parent}
        PointerEvents={PointerEvents}
      />
    )
  })
}

const ElementOverlayInner: FunctionComponent<ElementOverlayProps> = (props) => {
  const {element, focused, componentResolver, node, showActions, draggable, releases, versions} =
    props

  const {getField, getType} = useSchema()
  const schemaType = getType(node)
  const {field, parent} = getField(node)

  const href = 'path' in node ? createIntentLink(node) : node.href

  const previewSnapshots = usePreviewSnapshots()

  const title = useMemo(() => {
    if (!('path' in node)) return undefined
    return previewSnapshots.find((snapshot) => snapshot._id === node.id)?.title
  }, [node, previewSnapshots])

  const Icon = useMemo(() => {
    if (schemaType?.icon) return <div dangerouslySetInnerHTML={{__html: schemaType.icon}} />
    return <DocumentIcon />
  }, [schemaType?.icon])

  const customComponentsProps = useMemo(() => {
    if (!('path' in node)) return undefined

    const type = field?.value.type
    if (!type) return undefined

    const props = {focused: !!focused, node, type}
    const resolved = componentResolver?.(props)
    if (!resolved) return undefined

    const components = Array.isArray(resolved) ? resolved : [resolved]
    if (!components.length) return undefined

    return {
      components,
      element,
      node,
      parent,
    }
  }, [componentResolver, element, field, focused, node, parent])

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

      {customComponentsProps && <ComponentWrapper {...customComponentsProps} />}
    </>
  )
}

export const ElementOverlay = memo(function ElementOverlay(props: ElementOverlayProps) {
  const {
    element,
    focused,
    hovered,
    rect,
    wasMaybeCollapsed,
    enableScrollIntoView,
    releases,
    versions,
  } = props

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
      enableScrollIntoView
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
  }, [focused, wasMaybeCollapsed, enableScrollIntoView])

  function getTimeDifferenceInDays(targetDateStr: string): number {
    const now = new Date()

    const targetDate = new Date(targetDateStr)
    const timeDifference = targetDate.getTime() - now.getTime()
    // Convert milliseconds to days
    return Math.round(timeDifference / (1000 * 60 * 60 * 24))
  }

  let nearestUpcomingRelease = null
  let timeTilNextRelease = null

  const showReleasePreview = element.getAttribute('data-sanity-release-preview') === 'true'

  if (showReleasePreview) {
    const releaseVersions = versions ? versions.filter((v) => v._id.startsWith('versions.')) : []
    const nearestRelease = releases.find((release) => {
      return releaseVersions.some((version) => {
        const releaseName = version._id.split('.').at(1)
        return releaseName === release.name
      })
    })

    if (nearestRelease) {
      nearestUpcomingRelease = nearestRelease
      if (nearestRelease.metadata?.releaseType === 'scheduled') {
        timeTilNextRelease = getTimeDifferenceInDays(
          nearestUpcomingRelease.metadata.intendedPublishAt,
        )
      }
    }
  }

  useEffect(() => {
    if (!showReleasePreview) return

    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--release-x', e.clientX + 'px')
      document.documentElement.style.setProperty('--release-y', e.clientY + 'px')
    }
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [showReleasePreview])

  return (
    <>
      <Root
        data-focused={focused ? '' : undefined}
        data-hovered={hovered ? '' : undefined}
        ref={ref}
        style={style}
      >
        {hovered && <ElementOverlayInner {...props} />}
      </Root>
      {hovered && showReleasePreview && nearestUpcomingRelease && (
        <Releases
          style={{
            top: '0px',
            left: '0px',
            position: 'fixed',
            transform: `translate(calc(var(--release-x) + 8px), calc(var(--release-y) + 8px))`,
            display: 'flex',
            gap: '4px',
            background: '#fff',
            border: '1px solid #f1f1f1',
            borderRadius: '999px',
            padding: '0.125rem 0.375rem',
          }}
        >
          <div className="flex items-center">
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: {asap: '#f24f3e', scheduled: '#9b61f3'}[
                  nearestUpcomingRelease.metadata.releaseType as string
                ],
                flexShrink: 0,
                marginRight: '0.375rem',
              }}
            ></div>
            <p className="text-xs leading-none">
              Changes with <i className="font-semibold">{nearestUpcomingRelease.metadata.title}</i>{' '}
              {timeTilNextRelease ? <span>in {timeTilNextRelease} days</span> : 'ASAP'}
            </p>
          </div>
        </Releases>
      )}
    </>
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
