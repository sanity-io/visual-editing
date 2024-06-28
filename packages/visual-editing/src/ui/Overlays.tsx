import type {ChannelStatus} from '@repo/channels'
import {
  isAltKey,
  isHotkey,
  type SanityNode,
  type UnresolvedPath,
} from '@repo/visual-editing-helpers'
import {DRAFTS_PREFIX} from '@repo/visual-editing-helpers/csm'
import type {ClientPerspective, ContentSourceMapDocuments} from '@sanity/client'
import {
  BoundaryElementProvider,
  isHTMLAnchorElement,
  isHTMLElement,
  LayerProvider,
  PortalProvider,
  studioTheme,
  ThemeProvider,
} from '@sanity/ui'
import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import {styled} from 'styled-components'

import type {
  ElementState,
  HistoryAdapter,
  OverlayEventHandler,
  VisualEditingChannel,
  VisualEditingOptions,
} from '../types'
import {ContextMenu} from './ContextMenu'
import {ElementOverlay} from './ElementOverlay'
import {overlayStateReducer} from './overlayStateReducer'
import {useController} from './useController'

const Root = styled.div<{
  $zIndex?: string | number
}>`
  background-color: transparent;
  inset: 0;
  position: absolute;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: ${({$zIndex}) => $zIndex ?? '9999999'};
`

const Elements = styled.div`
  background: transparent
  direction: ltr;
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
`

function raf2(fn: () => void) {
  let r0: number | undefined = undefined
  let r1: number | undefined = undefined

  r0 = requestAnimationFrame(() => {
    r1 = requestAnimationFrame(fn)
  })

  return () => {
    if (r0 !== undefined) cancelAnimationFrame(r0)
    if (r1 !== undefined) cancelAnimationFrame(r1)
  }
}

function isEqualSets(a: Set<string>, b: Set<string>) {
  if (a === b) return true
  if (a.size !== b.size) return false
  for (const value of a) if (!b.has(value)) return false
  return true
}

// function getTypesToResolve(elements: ElementState[]): UnresolvedPath[] {
//   const typesToResolve = elements.reduce(
//     (acc, element) => {
//       const {sanity} = element
//       if (!('id' in sanity) || !sanity.path.includes('[_key==')) return acc
//       const path = sanity.path
//         .split('.')
//         .toReversed()
//         .reduce((acc, part) => {
//           if (acc.length) return [part, ...acc]
//           if (part.includes('[_key==')) return [part]
//           return []
//         }, [] as string[])
//         .join('.')
//       if (acc[sanity.id]) {
//         acc[sanity.id].paths.add(path)
//       } else {
//         acc[sanity.id] = {type: sanity.type!, paths: new Set<string>([path])}
//       }
//       return acc
//     },
//     {} as Record<string, {type: string; paths: Set<string>}>,
//   )

//   return Object.entries(typesToResolve).reduce(
//     (acc, [id, {type, paths}]) => [...acc, {id, type, paths: Array.from(paths)}],
//     [] as UnresolvedPath[],
//   )
// }

function popUnkeyedPathSegments(path: string): string {
  return path
    .split('.')
    .toReversed()
    .reduce((acc, part) => {
      if (acc.length) return [part, ...acc]
      if (part.includes('[_key==')) return [part]
      return []
    }, [] as string[])
    .join('.')
}

function getPathsWithUnresolvedTypes(elements: ElementState[]): {id: string; path: string}[] {
  return elements.reduce((acc, element) => {
    const {sanity} = element
    if (!('id' in sanity) || !sanity.path.includes('[_key==')) return acc
    const path = popUnkeyedPathSegments(sanity.path)
    if (!acc.find((item) => item.id === sanity.id && item.path === path)) {
      acc.push({id: sanity.id, path})
    }
    return acc
  }, [] as UnresolvedPath[])
}

/**
 * @internal
 */
export const Overlays: FunctionComponent<{
  components?: VisualEditingOptions['components']
  channel: VisualEditingChannel
  history?: HistoryAdapter
  zIndex?: string | number
}> = (props) => {
  const {components, channel, history, zIndex} = props

  const [status, setStatus] = useState<ChannelStatus>()

  const [{contextMenu, elements, wasMaybeCollapsed, perspective, schema}, dispatch] = useReducer(
    overlayStateReducer,
    {
      contextMenu: null,
      elements: [],
      focusPath: '',
      perspective: 'published',
      schema: null,
      wasMaybeCollapsed: false,
    },
  )

  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [overlayEnabled, setOverlayEnabled] = useState(true)
  const [resolvedTypes, setResolvedTypes] = useState(new Map())

  useEffect(() => {
    const unsubscribeFromStatus = channel.onStatusUpdate(setStatus)
    const unsubscribeFromEvents = channel.subscribe((type, data) => {
      if (type === 'presentation/focus' && data.path?.length) {
        dispatch({type, data})
      } else if (type === 'presentation/blur') {
        dispatch({type, data})
      } else if (type === 'presentation/perspective') {
        dispatch({type, data})
      } else if (type === 'presentation/navigate') {
        history?.update(data)
      } else if (type === 'presentation/toggleOverlay') {
        setOverlayEnabled((enabled) => !enabled)
      } else if (type === 'presentation/schema') {
        console.log('[Overlays] Received schema', data)
        dispatch({type, data})
      } else if (type === 'presentation/schemaTypes') {
        console.log('[Overlays] Received resolved schema types', data)
        setResolvedTypes(data.types)
      }
    })

    return () => {
      unsubscribeFromEvents()
      unsubscribeFromStatus()
    }
  }, [channel, history])

  const lastReported = useRef<
    | {
        nodeIds: Set<string>
        perspective: ClientPerspective
      }
    | undefined
  >(undefined)

  const elementIdsRef = useRef<string[]>(elements.map((e) => e.id))
  const [uniqueElements, setUniqueElements] = useState(elements)

  useEffect(() => {
    setUniqueElements((uniqueElements) => {
      if (
        elements.length === elementIdsRef.current.length &&
        elements.every((e, i) => e.id === elementIdsRef.current[i])
      ) {
        return uniqueElements
      }
      elementIdsRef.current = elements.map((e) => e.id)
      return elements
    })
  }, [elements])

  // We report a list of paths that reference array items using a _key. We need
  // to resolve the types of each of these items so we can map them to the
  // correct schema types. One day CSM might include this data for us.
  const reportPaths = useCallback(
    (paths: UnresolvedPath[]) => {
      channel?.send('visual-editing/schemaPaths', {
        paths,
      })
    },
    [channel],
  )

  const doPatch = useCallback(
    (data: {id: string; type: string; patch: Record<string, unknown>}) => {
      channel?.send('visual-editing/patch', data)
    },
    [channel],
  )

  useEffect(() => {
    const paths = getPathsWithUnresolvedTypes(uniqueElements)
    reportPaths(paths)
  }, [uniqueElements, reportPaths])

  // We report the documents currently in use in the DOM, along with the current
  // perspective. This means Presentation can display a list of documents
  // _without_ the need for loaders.
  const reportDocuments = useCallback(
    (documents: ContentSourceMapDocuments, perspective: ClientPerspective) => {
      channel?.send('visual-editing/documents', {
        documents,
        perspective,
      })
    },
    [channel],
  )

  useEffect(() => {
    // Report only nodes of type `SanityNode`. Untransformed `SanityStegaNode`
    // nodes without an `id`, are not reported as they will not contain the
    // necessary document data.
    const nodes = uniqueElements
      .map((e) => {
        const {sanity} = e
        if (!('id' in sanity)) return null
        return {
          ...sanity,
          id: 'isDraft' in sanity ? `${DRAFTS_PREFIX}${sanity.id}` : sanity.id,
        }
      })
      .filter((s) => !!s) as SanityNode[]

    const nodeIds = new Set<string>(nodes.map((e) => e.id))
    // Report if:
    // - Documents not yet reported
    // - Document IDs changed
    // - Perspective changed
    if (
      !lastReported.current ||
      !isEqualSets(nodeIds, lastReported.current.nodeIds) ||
      perspective !== lastReported.current.perspective
    ) {
      const documentsOnPage: ContentSourceMapDocuments = Array.from(nodeIds).map((_id) => {
        const node = nodes.find((node) => node.id === _id)!
        const {type, projectId: _projectId, dataset: _dataset} = node
        return _projectId && _dataset
          ? {_id, _type: type!, _projectId, _dataset}
          : {_id, _type: type!}
      })
      lastReported.current = {nodeIds, perspective}
      reportDocuments(documentsOnPage, perspective)
    }
  }, [uniqueElements, perspective, reportDocuments])

  const overlayEventHandler: OverlayEventHandler = useCallback(
    (message) => {
      if (message.type === 'element/click') {
        const {sanity} = message
        channel.send('overlay/focus', sanity)
      } else if (message.type === 'overlay/activate') {
        channel.send('overlay/toggle', {enabled: true})
      } else if (message.type === 'overlay/deactivate') {
        channel.send('overlay/toggle', {enabled: false})
      }
      dispatch(message)
    },
    [channel],
  )

  const controller = useController(rootElement, overlayEventHandler, !!channel.inFrame)

  useEffect(() => {
    if (overlayEnabled) {
      controller.current?.activate()
    } else {
      controller.current?.deactivate()
    }
  }, [channel, controller, overlayEnabled])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target

      // We only need to modify the default behavior if the target is a link
      const targetsLink = Boolean(
        isHTMLAnchorElement(target) || (isHTMLElement(target) && target.closest('a')),
      )

      if (targetsLink && event.altKey) {
        event.preventDefault()
        event.stopPropagation()
        const newEvent = new MouseEvent(event.type, {
          ...event,
          altKey: false,
          bubbles: true,
          cancelable: true,
        })
        event.target?.dispatchEvent(newEvent)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isAltKey(e)) {
        setOverlayEnabled((enabled) => !enabled)
      }
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (isAltKey(e)) {
        setOverlayEnabled((enabled) => !enabled)
      }

      if (isHotkey(['mod', '\\'], e)) {
        setOverlayEnabled((enabled) => !enabled)
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setOverlayEnabled])

  useEffect(() => {
    if (history) {
      return history.subscribe((update) => {
        update.title = update.title || document.title
        channel.send('overlay/navigate', update)
      })
    }
    return
  }, [channel, history])

  const [overlaysFlash, setOverlaysFlash] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const fadeOutTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Flash overlays when they are enabled
  useEffect(() => {
    if (overlayEnabled) {
      return raf2(() => {
        setOverlaysFlash(true)
        raf2(() => {
          setFadingOut(true)
          fadeOutTimeoutRef.current = setTimeout(() => {
            setFadingOut(false)
            setOverlaysFlash(false)
          }, 1500)
        })
      })
    } else if (fadeOutTimeoutRef.current) {
      clearTimeout(fadeOutTimeoutRef.current)
      setOverlaysFlash(false)
      setFadingOut(false)
    }

    return
  }, [overlayEnabled])

  const elementsToRender = useMemo(() => {
    if (!channel || (channel.inFrame && status !== 'connected')) {
      return []
    }
    return elements.filter((e) => e.activated || e.hovered || e.focused)
  }, [channel, elements, status])

  const closeContextMenu = useCallback(() => {
    dispatch({type: 'element/contextmenu', id: ''})
  }, [])

  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <LayerProvider>
        <Root
          data-fading-out={fadingOut ? '' : undefined}
          data-overlays={overlaysFlash ? '' : undefined}
          ref={setRootElement}
          $zIndex={zIndex}
        >
          {/* <BoundaryElementProvider element={rootElement}> */}

          <PortalProvider element={rootElement}>
            {contextMenu && schema && (
              <ContextMenu
                schema={schema}
                resolvedTypes={resolvedTypes}
                node={contextMenu.node}
                position={contextMenu.position}
                onClose={closeContextMenu}
              />
            )}
            <Elements>
              {elementsToRender.map(({id, focused, hovered, rect, sanity}) => {
                return (
                  <ElementOverlay
                    key={id}
                    components={components}
                    doPatch={doPatch}
                    dispatch={overlayEventHandler}
                    focused={focused}
                    hovered={hovered}
                    id={id}
                    rect={rect}
                    resolvedTypes={resolvedTypes}
                    sanity={sanity}
                    schema={schema}
                    showActions={!channel.inFrame}
                    wasMaybeCollapsed={focused && wasMaybeCollapsed}
                  />
                )
              })}
            </Elements>
          </PortalProvider>
        </Root>
      </LayerProvider>
    </ThemeProvider>
  )
}
