import type {ChannelsNode, ChannelStatus} from '@repo/channels'
import {
  isAltKey,
  isHotkey,
  type SanityNode,
  type VisualEditingAPI,
} from '@repo/visual-editing-helpers'
import {DRAFTS_PREFIX} from '@repo/visual-editing-helpers/csm'
import type {ClientPerspective, ContentSourceMapDocuments} from '@sanity/client'
import {
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

import type {HistoryAdapter, OverlayEventHandler, VisualEditingOptions} from '../types'
import {ContextMenu} from './ContextMenu'
import {ElementOverlay} from './ElementOverlay'
import {OptimisticStateProvider} from './optimistic-state/OptimisticStateProvider'
import {OverlayDragInsertMarker} from './OverlayDragInsertMarker'
import {OverlayDragPreview} from './OverlayDragPreview'
import {overlayStateReducer} from './overlayStateReducer'
import {PreviewSnapshotsProvider} from './preview/PreviewSnapshotsProvider'
import {SchemaProvider} from './schema/SchemaProvider'
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

/**
 * @internal
 */
export const Overlays: FunctionComponent<{
  components?: VisualEditingOptions['components']
  channel: ChannelsNode<VisualEditingAPI>
  history?: HistoryAdapter
  zIndex?: string | number
}> = (props) => {
  const {components, channel, history, zIndex} = props

  const [status, setStatus] = useState<ChannelStatus>()

  const [
    {contextMenu, elements, wasMaybeCollapsed, isDragging, dragInsertPosition, dragSkeleton, perspective},
    dispatch,
  ] = useReducer(overlayStateReducer, {
    contextMenu: null,
    elements: [],
    focusPath: '',
    wasMaybeCollapsed: false,
    isDragging: false,
    dragInsertPosition: null,
    dragSkeleton: null,
    perspective: 'published',
  })
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [overlayEnabled, setOverlayEnabled] = useState(true)

  useEffect(() => {
    const unsubscribeFromStatus = channel.onStatus(setStatus)
    const unsubscribeFromEvents = [
      channel.on('focus', (data) => {
        if (data.path?.length) {
          dispatch({type: 'focus', data})
        }
      }),
      channel.on('blur', (data) => {
        dispatch({type: 'blur', data})
      }),
      channel.on('perspective', (data) => {
        dispatch({type: 'perspective', data})
      }),
      channel.on('navigate', (data) => {
        history?.update(data)
      }),
      channel.on('toggleOverlay', () => {
        setOverlayEnabled((enabled) => !enabled)
      }),
    ]

    return () => {
      unsubscribeFromEvents.forEach((unsub) => unsub())
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

  // We report the documents currently in use in the DOM, along with the current
  // perspective. This means Presentation can display a list of documents
  // _without_ the need for loaders.
  const reportDocuments = useCallback(
    (documents: ContentSourceMapDocuments, perspective: ClientPerspective) => {
      channel.post('documents', {
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

  const updateDragPreviewCustomProps = (rootElement: HTMLElement | null, x: number, y: number) => {
    if (!rootElement) return

    rootElement.style.setProperty('--drag-preview-x', `${x}px`)
    rootElement.style.setProperty('--drag-preview-y', `${y - window.scrollY}px`)
  }

  const overlayEventHandler: OverlayEventHandler = useCallback(
    (message) => {
      if (message.type === 'element/click') {
        const {sanity} = message
        channel.post('focus', sanity)
      } else if (message.type === 'overlay/activate') {
        channel.post('toggle', {enabled: true})
      } else if (message.type === 'overlay/deactivate') {
        channel.post('toggle', {enabled: false})
      } else if (message.type === 'overlay/dragStart') {
        if (message.flow === 'vertical') {
          document.body.style.cursor = 'ns-resize'
        } else {
          document.body.style.cursor = 'ew-resize'
        }
      } else if (message.type === 'overlay/dragEnd') {
        document.body.style.cursor = 'auto'
      } else if (message.type === 'overlay/dragUpdateCursorPosition') {
        updateDragPreviewCustomProps(rootElement, message.x, message.y)

        return
      }

      dispatch(message)
    },
    [channel, rootElement],
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
        channel.post('navigate', update)
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

  const documentIds = useMemo(() => {
    return elements.flatMap((element) => ('id' in element.sanity ? [element.sanity.id] : []))
  }, [elements])

  const closeContextMenu = useCallback(() => {
    dispatch({type: 'overlay/blur'})
  }, [])

  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <LayerProvider>
        <PortalProvider element={rootElement}>
          <SchemaProvider channel={channel} elements={elements}>
            <PreviewSnapshotsProvider channel={channel}>
              <OptimisticStateProvider channel={channel} documentIds={documentIds}>
                <Root
                  data-fading-out={fadingOut ? '' : undefined}
                  data-overlays={overlaysFlash ? '' : undefined}
                  ref={setRootElement}
                  $zIndex={zIndex}
                >
                  {contextMenu && <ContextMenu {...contextMenu} onDismiss={closeContextMenu} />}
                  {!isDragging && <Elements>
                    {elementsToRender.map(({focused, hovered, id, rect, sanity}) => {
                      return (
                        <ElementOverlay
                          key={id}
                          // @todo Config provider?
                          components={components}
                          dispatch={overlayEventHandler}
                          focused={focused}
                          hovered={hovered}
                          id={id}
                          rect={rect}
                          node={sanity}
                          showActions={!channel.inFrame}
                          wasMaybeCollapsed={focused && wasMaybeCollapsed}
                        />
                      )
                    })}
                  </Elements>}
                  {isDragging && dragSkeleton && <OverlayDragPreview skeleton={dragSkeleton} />}
                  {isDragging && <OverlayDragInsertMarker dragInsertPosition={dragInsertPosition} />}
                </Root>
              </OptimisticStateProvider>
            </PreviewSnapshotsProvider>
          </SchemaProvider>
        </PortalProvider>
      </LayerProvider>
    </ThemeProvider>
  )
}
