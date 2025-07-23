import {createEditUrl, studioPath} from '@sanity/client/csm'
import {DocumentIcon, DragHandleIcon, EllipsisVerticalIcon, PlugIcon} from '@sanity/icons'
import {MenuButton, MenuDivider} from '@sanity/ui'
import {vars} from '@sanity/ui/css'
import {Box, Button, Card, Flex, Menu, MenuItem, Stack, Text} from '@sanity/ui'
import {pathToUrlString} from '@sanity/visual-editing-csm'
import {
  Fragment,
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
  type MouseEventHandler,
  type ReactElement,
} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {styled} from 'styled-components'
import {v4 as uuid} from 'uuid'
import {PointerEvents} from '../overlay-components/components/PointerEvents'
import type {
  ElementChildTarget,
  ElementFocusedState,
  ElementNode,
  OverlayComponent,
  OverlayComponentResolver,
  OverlayComponentResolverContext,
  OverlayPluginDefinition,
  OverlayPluginExclusiveDefinition,
  OverlayPluginHudDefinition,
  OverlayRect,
  SanityNode,
  SanityStegaNode,
  VisualEditingNode,
} from '../types'
import {getLinkHref} from '../util/getLinkHref'
import {PopoverBackground} from './PopoverPortal'
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
  id: string
  comlink?: VisualEditingNode
  componentResolver?: OverlayComponentResolver
  plugins?: OverlayPluginDefinition[]
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
  onActivateExclusivePlugin?: (
    plugin: OverlayPluginExclusiveDefinition,
    context: OverlayComponentResolverContext,
  ) => void
  onMenuOpenChange: (open: boolean) => void
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
    --overlay-bg: color-mix(in srgb, transparent 95%, ${vars.color.focusRing});
    --overlay-box-shadow: inset 0 0 0 2px
      color-mix(in srgb, transparent 50%, ${vars.color.focusRing});
  }

  [data-fading-out] & {
    transition:
      box-shadow 1550ms,
      background-color 1550ms;

    --overlay-bg: rgba(0, 0, 255, 0);
    --overlay-box-shadow: inset 0 0 0 1px transparent;
  }

  &[data-focused] {
    --overlay-box-shadow: inset 0 0 0 1px ${vars.color.focusRing};
  }

  &[data-hovered]:not([data-focused]) {
    transition: none;
    --overlay-box-shadow: inset 0 0 0 2px ${vars.color.focusRing};
  }

  /* [data-unmounted] & {
    --overlay-box-shadow: inset 0 0 0 1px ${vars.color.focusRing};
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

  [data-hovered]:not([data-menu-open]) & {
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

  [data-hovered]:not([data-menu-open]) & {
    pointer-events: all;
  }

  [data-flipped] & {
    top: calc(100% + 2rem);
  }
`

const MenuWrapper = styled(Flex)`
  margin: -0.5rem;

  [data-hovered]:not([data-menu-open]) & {
    pointer-events: all;
  }
`

const Tab = styled(Flex)`
  bottom: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  left: 0;

  [data-hovered]:not([data-menu-open]) & {
    pointer-events: all;
  }

  [data-flipped] & {
    bottom: auto;
    top: 100%;
  }
`

const ActionOpen = styled(Card)`
  cursor: pointer;
  background-color: ${vars.color.focusRing};
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
  background-color: ${vars.color.focusRing};
  right: 0;
  border-radius: 3px;
  & [data-ui='Text'],
  & [data-sanity-icon] {
    color: #fff;
    white-space: nowrap;
  }
`

const ExclusivePluginContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: all;
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
  const {
    id,
    element,
    focused,
    componentResolver,
    node,
    showActions,
    draggable,
    targets,
    elementType,
    comlink,
    onActivateExclusivePlugin,
    onMenuOpenChange,
  } = props

  const {getField, getType} = useSchema()
  const schemaType = getType(node)

  const href = 'path' in node ? createIntentLink(node) : node.href

  const previewSnapshots = usePreviewSnapshots()

  const title = useMemo(() => {
    if (!('path' in node)) return undefined
    return previewSnapshots.find((snapshot) => snapshot._id === node.id)?.title
  }, [node, previewSnapshots])

  const resolverContexts = useMemo<{
    legacyComponentContext: OverlayComponentResolverContext | undefined
    pluginContexts: OverlayComponentResolverContext[]
  }>(() => {
    function getContext(
      node: SanityNode | SanityStegaNode,
      nodeElement?: ElementNode,
    ): OverlayComponentResolverContext | undefined {
      const schemaType = getType(node)
      const {field, parent} = getField(node)
      if (!('id' in node)) return undefined
      if (!field || !schemaType) return undefined
      const type = field.value.type
      return {
        document: schemaType,
        element,
        targetElement: nodeElement || element,
        field,
        focused: !!focused,
        node,
        parent,
        type,
      }
    }
    return {
      legacyComponentContext: elementType === 'element' ? getContext(node) : undefined,
      pluginContexts: targets
        .map((target) => getContext(target.sanity, target.element))
        .filter((ctx) => ctx !== undefined),
    }
  }, [elementType, node, targets, getType, getField, element, focused])

  const customComponents = useCustomComponents(
    resolverContexts.legacyComponentContext,
    componentResolver,
  )

  const nodePluginCollections = useResolvedNodePlugins(
    resolverContexts.pluginContexts,
    props.plugins,
  )

  const icon = schemaType?.icon ? (
    <div dangerouslySetInnerHTML={{__html: schemaType.icon}} />
  ) : (
    <DocumentIcon />
  )

  const menuId = useId()

  const hasMenuitems = nodePluginCollections?.some(
    (nodePluginCollection) => nodePluginCollection.exclusive.length > 0,
  )
  const showMenu = hasMenuitems || nodePluginCollections?.length > 1

  const handleLabelClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent('sanity-overlay/label-click', {detail: {id}}))
  }, [id])

  return (
    <>
      <PointerEvents>
        {showActions ? (
          <Actions gap={1} paddingY={1}>
            <Link href={href} />
          </Actions>
        ) : null}
        {(title || showMenu) && (
          <Tab gap={1} paddingY={1} onClick={handleLabelClick}>
            <Labels gap={2} padding={2}>
              {draggable && (
                <Box marginRight={1}>
                  <Text className="drag-handle" size={0}>
                    <DragHandleIcon />
                  </Text>
                </Box>
              )}
              <Text size={0}>{icon}</Text>

              {title && (
                <Text size={1} weight="medium">
                  {title}
                </Text>
              )}

              {showMenu && (
                <Box
                  paddingLeft={2}
                  onClick={(e) => {
                    // Do not propagate and click the label too if clicking menu button
                    e.stopPropagation()
                  }}
                >
                  <MenuWrapper>
                    <MenuButton
                      id={menuId}
                      popover={{
                        animate: true,
                        placement: 'bottom-start',
                        constrainSize: true,
                        tone: 'default',
                      }}
                      onOpen={() => {
                        onMenuOpenChange?.(true)
                      }}
                      onClose={() => {
                        onMenuOpenChange?.(false)
                      }}
                      button={<Button icon={EllipsisVerticalIcon} tone="primary" padding={2} />}
                      menu={
                        <Menu paddingY={0}>
                          <PointerEvents>
                            {nodePluginCollections?.map((nodePluginCollection, index) => (
                              <Fragment key={nodePluginCollection.id}>
                                <Stack role="group" paddingY={1} gap={0}>
                                  <MenuItem
                                    paddingY={2}
                                    text={
                                      <Box paddingY={2}>
                                        <Text muted size={1} style={{textTransform: 'capitalize'}}>
                                          {`${nodePluginCollection.context.document.name}: ${nodePluginCollection.context.field?.name}`}
                                        </Text>
                                      </Box>
                                    }
                                    onClick={() => {
                                      if (nodePluginCollection.context.node) {
                                        comlink?.post(
                                          'visual-editing/focus',
                                          nodePluginCollection.context.node,
                                        )
                                      }
                                    }}
                                  />
                                  {nodePluginCollection.exclusive.map((exclusive) => {
                                    const Component = exclusive.component
                                    if (!Component) return null
                                    return (
                                      <MenuItem
                                        paddingY={2}
                                        key={exclusive.name}
                                        icon={exclusive.icon || <PlugIcon />}
                                        text={
                                          <Box paddingY={2}>
                                            <Text size={1}>
                                              {exclusive.title || exclusive.name}
                                            </Text>
                                          </Box>
                                        }
                                        onClick={() =>
                                          onActivateExclusivePlugin?.(
                                            exclusive,
                                            nodePluginCollection.context,
                                          )
                                        }
                                      />
                                    )
                                  })}
                                </Stack>
                                {index < nodePluginCollections.length - 1 && <MenuDivider />}
                              </Fragment>
                            ))}
                          </PointerEvents>
                        </Menu>
                      }
                    />
                  </MenuWrapper>
                </Box>
              )}
            </Labels>
          </Tab>
        )}

        <HUD>
          {nodePluginCollections?.map((nodePluginCollection) => (
            <Fragment key={nodePluginCollection.id}>
              {nodePluginCollection.hud.map((hud) => {
                const Component = hud.component
                if (!Component) return null
                return <Component key={hud.name} {...nodePluginCollection.context} />
              })}
            </Fragment>
          ))}
        </HUD>
      </PointerEvents>

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

export const ElementOverlay = memo(function ElementOverlay(
  props: Omit<ElementOverlayProps, 'setActiveExclusivePlugin' | 'onMenuOpenChange'>,
) {
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

  const [activeExclusivePlugin, setActiveExclusivePlugin] = useState<{
    plugin: OverlayPluginExclusiveDefinition
    context: OverlayComponentResolverContext
  } | null>(null)

  const closeExclusivePluginView = useCallback(() => {
    setActiveExclusivePlugin(null)
    window.dispatchEvent(new CustomEvent('sanity-overlay/exclusive-plugin-closed'))
  }, [])

  const onActivateExclusivePlugin = useCallback(
    (plugin: OverlayPluginExclusiveDefinition, context: OverlayComponentResolverContext) => {
      setActiveExclusivePlugin({plugin, context})
    },
    [],
  )

  const handleExclusivePluginClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation()
  }

  const ExclusivePluginComponent = activeExclusivePlugin?.plugin.component

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [hovered])

  return (
    <>
      {menuOpen || ExclusivePluginComponent ? (
        <PopoverBackground onDismiss={closeExclusivePluginView} blockScroll={menuOpen} />
      ) : null}
      <Root
        data-focused={focused ? '' : undefined}
        data-hovered={hovered ? '' : undefined}
        data-flipped={isNearTop ? '' : undefined}
        data-draggable={draggable ? '' : undefined}
        data-menu-open={menuOpen ? '' : undefined}
        ref={ref}
        style={style}
      >
        {ExclusivePluginComponent ? (
          <ExclusivePluginContainer
            data-sanity-overlay-element
            onClick={handleExclusivePluginClick}
          >
            <ExclusivePluginComponent
              {...activeExclusivePlugin.context}
              closeExclusiveView={closeExclusivePluginView}
            />
          </ExclusivePluginContainer>
        ) : hovered ? (
          <ElementOverlayInner
            {...props}
            onActivateExclusivePlugin={onActivateExclusivePlugin}
            onMenuOpenChange={setMenuOpen}
          />
        ) : null}
      </Root>
    </>
  )
})

interface NodePluginCollection {
  id: string
  context: OverlayComponentResolverContext
  hud: OverlayPluginHudDefinition[]
  exclusive: OverlayPluginExclusiveDefinition[]
}

function useResolvedNodePlugins(
  componentContexts: OverlayComponentResolverContext[],
  plugins?: OverlayPluginDefinition[],
) {
  return useMemo(
    () =>
      componentContexts.map((componentContext) => {
        const instance: NodePluginCollection = {
          id: uuid(),
          context: componentContext,
          hud: [],
          exclusive: [],
        }

        plugins?.forEach((plugin) => {
          if (!plugin.guard?.(componentContext)) return
          if (plugin.type === 'hud') instance.hud.push(plugin)
          if (plugin.type === 'exclusive') instance.exclusive.push(plugin)
        })

        return instance
      }),
    [componentContexts, plugins],
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
