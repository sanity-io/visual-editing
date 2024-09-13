import {
  isAltKey,
  isHotkey,
  type SanityNode,
  type VisualEditingControllerMsg,
} from '@repo/visual-editing-helpers'
import {DRAFTS_PREFIX} from '@repo/visual-editing-helpers/csm'
import type {ClientPerspective, ContentSourceMapDocuments} from '@sanity/client'
import type {Status} from '@sanity/comlink'
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

import type {HistoryAdapter, OverlayEventHandler, OverlayMsg, VisualEditingNode} from '../types'
import {getDraftId} from '../util/documents'
import {useDragEndEvents} from '../util/useDragEvents'
import {ContextMenu} from './context-menu/ContextMenu'
import {ElementOverlay} from './ElementOverlay'
import {useOptimisticActor} from './optimistic-state/useOptimisticActor'
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

function isEqualSets(a: Set<string>, b: Set<string>) {
  if (a === b) return true
  if (a.size !== b.size) return false
  for (const value of a) if (!b.has(value)) return false
  return true
}

const DocumentReporter: FunctionComponent<{
  documentIds: string[]
}> = (props) => {
  const {documentIds} = props
  const [uniqueIds, setUniqueIds] = useState<string[]>([])

  useEffect(() => {
    setUniqueIds((prev) => {
      const next = Array.from(new Set(documentIds.map(getDraftId)))
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
    }
    return () => {
      for (const id of uniqueIds) {
        actor.send({type: 'unobserve', documentId: getDraftId(id)})
      }
    }
  }, [actor, uniqueIds])

  return null
}

const OverlaysController: FunctionComponent<{
  comlink: VisualEditingNode
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
        comlink.post({type: 'visual-editing/focus', data: sanity})
      } else if (message.type === 'overlay/activate') {
        comlink.post({type: 'visual-editing/toggle', data: {enabled: true}})
      } else if (message.type === 'overlay/deactivate') {
        comlink.post({type: 'visual-editing/toggle', data: {enabled: false}})
      } else if (message.type === 'overlay/dragStart') {
        if (message.flow === 'vertical') {
          document.body.style.cursor = 'ns-resize'
        } else {
          document.body.style.cursor = 'ew-resize'
        }
      } else if (message.type === 'overlay/dragEnd') {
        document.body.style.cursor = 'auto'
        const {insertPosition, target} = message
        dispatchDragEndEvent({insertPosition, target})
      } else if (message.type === 'overlay/dragUpdateCursorPosition') {
        onDrag(message.x, message.y)

        return
      }

      dispatch(message)
    },
    [comlink, dispatch, dispatchDragEndEvent, onDrag],
  )

  const controller = useController(rootElement, overlayEventHandler, !!inFrame)

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
  comlink: VisualEditingNode
  history?: HistoryAdapter
  inFrame: boolean
  zIndex?: string | number
}> = (props) => {
  const {comlink, inFrame, history, zIndex} = props

  const [status, setStatus] = useState<Status>()

  const [
    {
      contextMenu,
      dragInsertPosition,
      dragSkeleton,
      elements,
      isDragging,
      perspective,
      wasMaybeCollapsed,
    },
    dispatch,
  ] = useReducer(overlayStateReducer, {
    contextMenu: null,
    dragInsertPosition: null,
    dragSkeleton: null,
    elements: [],
    focusPath: '',
    isDragging: false,
    perspective: 'published',
    wasMaybeCollapsed: false,
  })
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [overlayEnabled, setOverlayEnabled] = useState(true)

  useEffect(() => {
    const unsubs = [
      comlink.on('presentation/focus', (data) => {
        dispatch({type: 'presentation/focus', data})
      }),
      comlink.on('presentation/blur', (data) => {
        dispatch({type: 'presentation/blur', data})
      }),
      comlink.on('presentation/perspective', (data) => {
        dispatch({type: 'presentation/perspective', data})
      }),
      comlink.on('presentation/navigate', (data) => {
        history?.update(data)
      }),
      comlink.on('presentation/toggle-overlay', () => {
        setOverlayEnabled((enabled) => !enabled)
      }),
      comlink.onStatus((status) => {
        setStatus(status as Status)
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [comlink, history])

  const lastReported = useRef<
    | {
        nodeIds: Set<string>
        perspective: ClientPerspective
      }
    | undefined
  >(undefined)

  const reportDocuments = useCallback(
    (documents: ContentSourceMapDocuments, perspective: ClientPerspective) => {
      comlink.post({
        type: 'visual-editing/documents',
        data: {
          documents,
          perspective,
        },
      })
    },
    [comlink],
  )

  useEffect(() => {
    // Report only nodes of type `SanityNode`. Untransformed `SanityStegaNode`
    // nodes without an `id`, are not reported as they will not contain the
    // necessary document data.
    const nodes = elements
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
  }, [elements, perspective, reportDocuments])

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

  useEffect(() => {
    if (history) {
      return history.subscribe((update) => {
        update.title = update.title || document.title
        comlink.post({type: 'visual-editing/navigate', data: update})
      })
    }
    return
  }, [comlink, history])

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
    if (!comlink || (inFrame && status !== 'connected')) {
      return []
    }
    return elements.filter((e) => e.activated || e.focused)
  }, [comlink, elements, inFrame, status])

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
          <SchemaProvider comlink={comlink} elements={elements}>
            <PreviewSnapshotsProvider comlink={comlink}>
              {/* <OptimisticStateProvider comlink={comlink} documentIds={documentIds}> */}
              <Root
                data-fading-out={fadingOut ? '' : undefined}
                data-overlays={overlaysFlash ? '' : undefined}
                ref={setRootElement}
                $zIndex={zIndex}
              >
                <DocumentReporter documentIds={documentIds} />
                <OverlaysController
                  comlink={comlink}
                  dispatch={dispatch}
                  inFrame={inFrame}
                  onDrag={updateDragPreviewCustomProps}
                  overlayEnabled={overlayEnabled}
                  rootElement={rootElement}
                />
                {contextMenu && <ContextMenu {...contextMenu} onDismiss={closeContextMenu} />}
                {!isDragging &&
                  elementsToRender.map(({id, focused, hovered, rect, sanity}) => {
                    return (
                      <ElementOverlay
                        key={id}
                        focused={focused}
                        hovered={hovered}
                        node={sanity}
                        rect={rect}
                        showActions={!inFrame}
                        wasMaybeCollapsed={focused && wasMaybeCollapsed}
                      />
                    )
                  })}

                {isDragging && dragSkeleton && <OverlayDragPreview skeleton={dragSkeleton} />}
                {isDragging && <OverlayDragInsertMarker dragInsertPosition={dragInsertPosition} />}
              </Root>
            </PreviewSnapshotsProvider>
          </SchemaProvider>
        </PortalProvider>
      </LayerProvider>
    </ThemeProvider>
  )
}
