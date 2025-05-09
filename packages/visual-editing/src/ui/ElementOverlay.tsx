import {createEditUrl, studioPath} from '@sanity/client/csm'
import {DocumentIcon, DragHandleIcon, EllipsisHorizontalIcon} from '@sanity/icons'
import {Label, MenuButton} from '@sanity/ui'
import {Box, Button, Card, Flex, Menu, MenuItem, Stack, Text} from '@sanity/ui/_visual-editing'
import {pathToUrlString} from '@sanity/visual-editing-csm'
import {
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FunctionComponent,
  type ReactElement,
} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {styled} from 'styled-components'
import {PointerEvents} from '../overlay-components/components/PointerEvents'
import type {
  ElementChildTarget,
  ElementFocusedState,
  ElementNode,
  OverlayComponent,
  OverlayComponentResolver,
  OverlayComponentResolverContext,
  OverlayExtensionDefinition,
  OverlayExtensionExclusiveDefinition,
  OverlayExtensionHudDefinition,
  OverlayRect,
  SanityNode,
  SanityStegaNode,
} from '../types'
import {getLinkHref} from '../util/getLinkHref'
import {usePreviewSnapshots} from './preview/usePreviewSnapshots'
import {useSchema} from './schema/useSchema'

const isReactElementOverlayComponent = (
  component:
    | OverlayComponent
    | {component: OverlayComponent; props?: Record<string, unknown>}
    | Array<OverlayComponent | {component: OverlayComponent; props?: Record<string, unknown>}>
    | ReactElement,
): component is React.JSX.Element => {
  return isValidElement(component)
}

export interface ElementOverlayProps {
  componentResolver?: OverlayComponentResolver
  extensionDefinitions?: OverlayExtensionDefinition[]
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
  targets: ElementChildTarget[]
  elementType: 'element' | 'group'
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

  [data-flipped] & {
    bottom: auto;
    top: 100%;
  }
`

const HUD = styled(Flex)`
  top: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  left: 0;

  gap: 4px;
  padding: 4px 0;
  flex-wrap: wrap;

  [data-hovered] & {
    pointer-events: all;
  }
`

const MenuWrapper = styled(Flex)`
  top: 0;
  cursor: pointer;
  /* pointer-events: none; */
  position: absolute;
  right: 0;

  /* background-color: var(--card-focus-ring-color); */

  gap: 4px;
  padding: 4px;
  flex-direction: column;

  [data-hovered] & {
    pointer-events: all;
  }
`

const Tab = styled(Flex)`
  bottom: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  left: 0;

  [data-hovered] & {
    pointer-events: all;
  }

  [data-flipped] & {
    bottom: auto;
    top: 100%;
  }
`

const ActionOpen = styled(Card)`
  cursor: pointer;
  background-color: var(--card-focus-ring-color);
  right: 0;
  border-radius: 3px;

  & [data-ui='Text'] {
    color: #fff;
    white-space: nowrap;
  }
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

function createIntentLink(node: SanityNode) {
  const {id, type, path, baseUrl, tool, workspace} = node

  return createEditUrl({
    baseUrl,
    workspace,
    tool,
    type: type!,
    id,
    path: path ? pathToUrlString(studioPath.fromString(path)) : [],
  })
}

const ElementOverlayInner: FunctionComponent<ElementOverlayProps> = (props) => {
  const {element, focused, componentResolver, node, showActions, draggable, targets, elementType} =
    props

  const {getField, getType} = useSchema()
  const schemaType = getType(node)

  const href = 'path' in node ? createIntentLink(node) : node.href

  const previewSnapshots = usePreviewSnapshots()

  const title = useMemo(() => {
    if (!('path' in node)) return undefined
    return (
      previewSnapshots.find((snapshot) => snapshot._id === node.id)?.title +
      (targets.length > 1 ? ` [${targets.length}]` : '')
    )
  }, [node, previewSnapshots, targets])

  const resolverContexts = useMemo<{
    legacyComponentContext: OverlayComponentResolverContext | undefined
    extensionContexts: OverlayComponentResolverContext[]
  }>(() => {
    function getContext(
      node: SanityNode | SanityStegaNode,
    ): OverlayComponentResolverContext | undefined {
      const schemaType = getType(node)
      const {field, parent} = getField(node)
      // console.log('getContext', {node, field, schemaType})
      if (!('id' in node)) return undefined
      if (!field || !schemaType) return undefined
      const type = field.value.type
      return {
        document: schemaType,
        element,
        field,
        focused: !!focused,
        node,
        parent,
        type,
      }
    }
    // console.log('resolverContexts', {targets})
    return {
      legacyComponentContext: elementType === 'element' ? getContext(node) : undefined,
      extensionContexts: targets
        .map((target) => getContext(target.sanity))
        .filter((ctx) => ctx !== undefined),
    }
  }, [elementType, node, targets, getType, getField, element, focused])

  const customComponents = useCustomComponents(
    resolverContexts.legacyComponentContext,
    componentResolver,
  )

  const extensions = useExtensions(resolverContexts.extensionContexts, props.extensionDefinitions)

  const icon = schemaType?.icon ? (
    <div dangerouslySetInnerHTML={{__html: schemaType.icon}} />
  ) : (
    <DocumentIcon />
  )

  const id = useId()
  const [exclusiveExtension, setExclusiveExtension] = useState<{
    extension: OverlayExtensionExclusiveDefinition
    context: OverlayComponentResolverContext
  } | null>(null)

  if (exclusiveExtension?.extension?.component && exclusiveExtension?.context) {
    const ExclusiveExtensionComponent = exclusiveExtension.extension.component

    return (
      <ExclusiveExtensionComponent {...exclusiveExtension.context} PointerEvents={PointerEvents} />
    )
  }

  const hasMenuitems = extensions?.some((extension) => extension.exclusive.length > 0)

  return (
    <>
      {showActions ? (
        <Actions gap={1} paddingY={1} data-sanity-overlay-element>
          <Link href={href} />
        </Actions>
      ) : null}
      {title && (
        <Tab gap={1} paddingY={1}>
          <Labels gap={2} padding={2}>
            {draggable && (
              <Box marginRight={1}>
                <Text className="drag-handle" size={0}>
                  <DragHandleIcon />
                </Text>
              </Box>
            )}
            <Text size={0}>{icon}</Text>
            <Text size={1} weight="medium">
              {title}
            </Text>
          </Labels>
        </Tab>
      )}

      <HUD>
        {extensions?.map((extension, i) =>
          extension.hud.map((hud) => {
            const Component = hud.component
            if (!Component) return null
            return <Component key={i} PointerEvents={PointerEvents} {...extension.context} />
          }),
        )}
      </HUD>
      {hasMenuitems && (
        <PointerEvents>
          <MenuWrapper>
            <MenuButton
              id={id}
              popover={{
                animate: true,
                placement: 'bottom-start',
                constrainSize: true,
                tone: 'default',
              }}
              button={<Button icon={EllipsisHorizontalIcon} tone="primary" padding={2} />}
              menu={
                <PointerEvents>
                  <Menu>
                    {extensions?.map((extension) => (
                      <Stack role="group" space={1} key={extension.context.node.id}>
                        <Stack padding={3} paddingBottom={2}>
                          <Label muted size={1}>
                            {extension.context.document.name}: {extension.context.field?.name}
                          </Label>
                        </Stack>

                        {extension.exclusive.map((exclusive) => {
                          const Component = exclusive.component
                          if (!Component) return null
                          return (
                            <MenuItem
                              key={exclusive.name}
                              fontSize={2}
                              padding={3}
                              onClick={() =>
                                setExclusiveExtension({
                                  extension: exclusive,
                                  context: extension.context,
                                })
                              }
                            >
                              {exclusive.title || exclusive.name}
                            </MenuItem>
                          )
                        })}
                      </Stack>
                    ))}
                  </Menu>
                </PointerEvents>
              }
            />
          </MenuWrapper>
        </PointerEvents>
      )}
      {Array.isArray(customComponents)
        ? customComponents.map(({component: Component, props}, i) => {
            return (
              <Component
                key={i}
                PointerEvents={PointerEvents}
                {...resolverContexts.legacyComponentContext!}
                {...props}
              />
            )
          })
        : customComponents}
    </>
  )
}

export const ElementOverlay = memo(function ElementOverlay(props: ElementOverlayProps) {
  const {draggable, focused, hovered, rect, wasMaybeCollapsed, enableScrollIntoView} = props

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

  const [isNearTop, setIsNearTop] = useState(false)
  useEffect(() => {
    if (!ref.current || !hovered) return undefined

    const io = new IntersectionObserver(
      ([intersection]) => {
        setIsNearTop(intersection.boundingClientRect.top < 0)
      },
      {threshold: 1},
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [hovered, isNearTop])

  return (
    <Root
      data-focused={focused ? '' : undefined}
      data-hovered={hovered ? '' : undefined}
      data-flipped={isNearTop ? '' : undefined}
      data-draggable={draggable ? '' : undefined}
      ref={ref}
      style={style}
    >
      {hovered && <ElementOverlayInner {...props} />}
    </Root>
  )
})

interface ExtensionInstance {
  context: OverlayComponentResolverContext
  hud: OverlayExtensionHudDefinition[]
  exclusive: OverlayExtensionExclusiveDefinition[]
}

function useExtensions(
  componentContexts: OverlayComponentResolverContext[],
  extensionDefinitions?: OverlayExtensionDefinition[],
) {
  return useMemo(
    () =>
      componentContexts.map((componentContext) => {
        const instance: ExtensionInstance = {
          context: componentContext,
          hud: [],
          exclusive: [],
        }

        extensionDefinitions?.forEach((definition) => {
          if (!definition.guard?.(componentContext)) return
          if (definition.type === 'hud') instance.hud.push(definition)
          if (definition.type === 'exclusive') instance.exclusive.push(definition)
        })

        return instance
      }),
    [componentContexts, extensionDefinitions],
  )
}

function useCustomComponents(
  componentContext: OverlayComponentResolverContext | undefined,
  componentResolver: OverlayComponentResolver | undefined,
) {
  return useMemo(() => {
    if (!componentContext) return undefined
    const resolved = componentResolver?.(componentContext)
    if (!resolved) return undefined

    if (isReactElementOverlayComponent(resolved)) {
      return resolved
    }

    return (Array.isArray(resolved) ? resolved : [resolved]).map((component) => {
      if (typeof component === 'object' && 'component' in component) {
        return component
      }
      return {component, props: {}}
    })
  }, [componentResolver, componentContext])
}

const Link = memo(function Link(props: {href: string}) {
  const referer = useSyncExternalStore(
    useCallback((onStoreChange) => {
      const handlePopState = () => onStoreChange()
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }, []),
    () => window.location.href,
  )
  const href = useMemo(() => getLinkHref(props.href, referer), [props.href, referer])

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
