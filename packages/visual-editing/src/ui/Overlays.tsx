import {isAltKey, isHotkey, type VisualEditingControllerMsg} from '@repo/visual-editing-helpers'
import type {ClientPerspective} from '@sanity/client'
import type {Status} from '@sanity/comlink'
import {
  isHTMLAnchorElement,
  isHTMLElement,
  LayerProvider,
  PortalProvider,
  studioTheme,
  ThemeProvider,
  usePrefersDark,
} from '@sanity/ui'
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FunctionComponent,
} from 'react'
import {styled} from 'styled-components'
import {useOptimisticActor, useOptimisticActorReady} from '../react/useOptimisticActor'
import type {
  OverlayComponentResolver,
  OverlayEventHandler,
  OverlayMsg,
  VisualEditingNode,
} from '../types'
import {getDraftId, getPublishedId} from '../util/documents'
import {sanityNodesExistInSameArray} from '../util/findSanityNodes'
import {useDragEndEvents} from '../util/useDragEvents'
import {ContextMenu} from './context-menu/ContextMenu'
import {ElementOverlay} from './ElementOverlay'
import {OverlayDragGroupRect} from './OverlayDragGroupRect'
import {OverlayDragInsertMarker} from './OverlayDragInsertMarker'
import {OverlayDragPreview} from './OverlayDragPreview'
import {OverlayMinimapPrompt} from './OverlayMinimapPrompt'
import {overlayStateReducer} from './overlayStateReducer'
import {PreviewSnapshotsProvider} from './preview/PreviewSnapshotsProvider'
import {SchemaProvider} from './schema/SchemaProvider'
import {SharedStateProvider} from './shared-state/SharedStateProvider'
import {sendTelemetry} from './telemetry/sendTelemetry'
import {useController} from './useController'
import {usePerspectiveSync} from './usePerspectiveSync'
import {useReportDocuments} from './useReportDocuments'

const Root = styled.div<{
  $zIndex?: string | number
}>`
  background-color: transparent;
  direction: ltr;
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: ${({$zIndex}) => $zIndex ?? '9999999'};
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

const DocumentReporter: FunctionComponent<{
  documentIds: string[]
  perspective: ClientPerspective
}> = (props) => {
  const {documentIds} = props
  const [uniqueIds, setUniqueIds] = useState<string[]>([])

  useEffect(() => {
    setUniqueIds((prev) => {
      const next = Array.from(new Set(documentIds))
      return prev.length === next.length &&
        prev.reduce((acc, prevId) => acc.filter((id) => id !== prevId), next)?.length === 0
        ? prev
        : next
    })
  }, [documentIds])

  const actor = useOptimisticActor()

  useEffect(() => {
    for (const id of uniqueIds) {
      actor.send({type: 'observe', documentId: getDraftId(id)})
      actor.send({type: 'observe', documentId: getPublishedId(id)})
    }
    return () => {
      for (const id of uniqueIds) {
        actor.send({type: 'unobserve', documentId: getDraftId(id)})
        actor.send({type: 'unobserve', documentId: getPublishedId(id)})
      }
    }
  }, [actor, uniqueIds])

  return null
}

const OverlaysController: FunctionComponent<{
  comlink?: VisualEditingNode
  dispatch: (value: OverlayMsg | VisualEditingControllerMsg) => void
  inFrame: boolean
  onDrag: (x: number, y: number) => void
  overlayEnabled: boolean
  rootElement: HTMLElement | null
}> = (props) => {
  const {comlink, dispatch, inFrame, onDrag, overlayEnabled, rootElement} = props
  const {dispatchDragEndEvent} = useDragEndEvents()

  const overlayEventHandler: OverlayEventHandler = useCallback(
    (message) => {
      if (message.type === 'element/click') {
        const {sanity} = message
        comlink?.post('visual-editing/focus', sanity)
      } else if (message.type === 'overlay/activate') {
        comlink?.post('visual-editing/toggle', {enabled: true})
      } else if (message.type === 'overlay/deactivate') {
        comlink?.post('visual-editing/toggle', {enabled: false})
      } else if (message.type === 'overlay/dragEnd') {
        const {insertPosition, target, dragGroup, flow, preventInsertDefault} = message

        dispatchDragEndEvent({insertPosition, target, dragGroup, flow, preventInsertDefault})

        if (insertPosition) {
          sendTelemetry('Visual Editing Drag Sequence Completed', null, comlink)
        }
      } else if (message.type === 'overlay/dragUpdateCursorPosition') {
        onDrag(message.x, message.y)

        return
      } else if (message.type === 'overlay/setCursor') {
        const {element, cursor} = message

        if (cursor) {
          element.style.cursor = cursor
        } else {
          element.style.removeProperty('cursor')
        }
      }

      dispatch(message)
    },
    [comlink, dispatch, dispatchDragEndEvent, onDrag],
  )

  const controller = useController(rootElement, overlayEventHandler, inFrame)

  useEffect(() => {
    if (overlayEnabled) {
      controller.current?.activate()
    } else {
      controller.current?.deactivate()
    }
  }, [controller, overlayEnabled])

  return null
}

/**
 * @internal
 */
export const Overlays: FunctionComponent<{
  comlink?: VisualEditingNode
  componentResolver?: OverlayComponentResolver
  inFrame: boolean
  zIndex?: string | number
}> = (props) => {
  const {comlink, componentResolver: _componentResolver, inFrame, zIndex} = props

  const [status, setStatus] = useState<Status>()

  const prefersDark = usePrefersDark()

  const [
    {
      contextMenu,
      dragInsertPosition,
      dragShowMinimap,
      dragShowMinimapPrompt,
      dragSkeleton,
      elements,
      isDragging,
      perspective,
      wasMaybeCollapsed,
      dragMinimapTransition,
      dragGroupRect,
    },
    dispatch,
  ] = useReducer(overlayStateReducer, {
    contextMenu: null,
    dragInsertPosition: null,
    dragShowMinimap: false,
    dragShowMinimapPrompt: false,
    dragSkeleton: null,
    elements: [],
    focusPath: '',
    isDragging: false,
    perspective: 'published',
    wasMaybeCollapsed: false,
    dragMinimapTransition: false,
    dragGroupRect: null,
  })
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [overlayEnabled, setOverlayEnabled] = useState(true)

  useEffect(() => {
    const unsubs = [
      comlink?.on('presentation/focus', (data) => {
        dispatch({type: 'presentation/focus', data})
      }),
      comlink?.on('presentation/blur', (data) => {
        dispatch({type: 'presentation/blur', data})
      }),
      comlink?.on('presentation/toggle-overlay', () => {
        setOverlayEnabled((enabled) => !enabled)
      }),
      comlink?.onStatus((status) => {
        setStatus(status as Status)
      }),
    ].filter(Boolean)

    return () => unsubs.forEach((unsub) => unsub!())
  }, [comlink])

  usePerspectiveSync(comlink, dispatch)

  useReportDocuments(comlink, elements, perspective)

  const updateDragPreviewCustomProps = useCallback(
    (x: number, y: number) => {
      if (!rootElement) return

      rootElement.style.setProperty('--drag-preview-x', `${x}px`)
      rootElement.style.setProperty('--drag-preview-y', `${y - window.scrollY}px`)
    },
    [rootElement],
  )

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

  const documentIds = useMemo(() => {
    return elements.flatMap((element) => ('id' in element.sanity ? [element.sanity.id] : []))
  }, [elements])

  const closeContextMenu = useCallback(() => {
    dispatch({type: 'overlay/blur'})
  }, [])

  const optimisticActorReady = useOptimisticActorReady()

  const componentResolver = useMemo(() => {
    return optimisticActorReady ? _componentResolver : undefined
  }, [_componentResolver, optimisticActorReady])

  const elementsToRender = useMemo(() => {
    if ((inFrame && status !== 'connected') || isDragging) {
      return []
    }

    return elements
      .filter((e) => e.activated || e.focused)
      .map(({id, element, focused, hovered, rect, sanity, dragDisabled}) => {
        const draggable =
          !dragDisabled &&
          !!element.getAttribute('data-sanity') &&
          optimisticActorReady &&
          elements.some((e) =>
            'id' in e.sanity && 'id' in sanity
              ? sanityNodesExistInSameArray(e.sanity, sanity) && e.sanity.path !== sanity.path
              : false,
          )

        return (
          <ElementOverlay
            componentResolver={componentResolver}
            element={element}
            enableScrollIntoView={!isDragging && !dragMinimapTransition && !dragShowMinimap}
            key={id}
            focused={focused}
            hovered={hovered}
            node={sanity}
            rect={rect}
            showActions={!inFrame}
            draggable={draggable}
            isDragging={isDragging || dragMinimapTransition}
            wasMaybeCollapsed={focused && wasMaybeCollapsed}
          />
        )
      })
  }, [
    componentResolver,
    dragMinimapTransition,
    dragShowMinimap,
    elements,
    inFrame,
    isDragging,
    optimisticActorReady,
    status,
    wasMaybeCollapsed,
  ])

  return (
    <ThemeProvider scheme={prefersDark ? 'dark' : 'light'} theme={studioTheme} tone="transparent">
      <LayerProvider>
        <PortalProvider element={rootElement}>
          <SchemaProvider comlink={comlink} elements={elements}>
            <PreviewSnapshotsProvider comlink={comlink}>
              <SharedStateProvider comlink={comlink}>
                <Root
                  data-fading-out={fadingOut ? '' : undefined}
                  data-overlays={overlaysFlash ? '' : undefined}
                  ref={setRootElement}
                  $zIndex={zIndex}
                >
                  <DocumentReporter documentIds={documentIds} perspective={perspective} />
                  <OverlaysController
                    comlink={comlink}
                    dispatch={dispatch}
                    inFrame={inFrame}
                    onDrag={updateDragPreviewCustomProps}
                    overlayEnabled={overlayEnabled}
                    rootElement={rootElement}
                  />
                  {contextMenu && <ContextMenu {...contextMenu} onDismiss={closeContextMenu} />}
                  {elementsToRender}

                  {isDragging && !dragMinimapTransition && (
                    <>
                      {dragInsertPosition && (
                        <OverlayDragInsertMarker dragInsertPosition={dragInsertPosition} />
                      )}
                      {dragShowMinimapPrompt && <OverlayMinimapPrompt />}
                      {dragGroupRect && <OverlayDragGroupRect dragGroupRect={dragGroupRect} />}
                    </>
                  )}
                  {isDragging && dragSkeleton && <OverlayDragPreview skeleton={dragSkeleton} />}
                </Root>
              </SharedStateProvider>
            </PreviewSnapshotsProvider>
          </SchemaProvider>
        </PortalProvider>
      </LayerProvider>
    </ThemeProvider>
  )
}
