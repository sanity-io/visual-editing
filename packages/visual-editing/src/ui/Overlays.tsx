import {isAltKey, isHotkey, type SanityNode} from '@repo/visual-editing-helpers'
import {DRAFTS_PREFIX} from '@repo/visual-editing-helpers/csm'
import type {ClientPerspective, ContentSourceMapDocuments} from '@sanity/client'
import type {Status} from '@sanity/comlink'
import {isHTMLAnchorElement, isHTMLElement, studioTheme, ThemeProvider} from '@sanity/ui'
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

import type {HistoryAdapter, OverlayEventHandler, VisualEditingComlink} from '../types'
import {ElementOverlay} from './ElementOverlay'
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

/**
 * @internal
 */
export const Overlays: FunctionComponent<{
  comlink: VisualEditingComlink
  history?: HistoryAdapter
  inFrame: boolean
  zIndex?: string | number
}> = (props) => {
  const {comlink, inFrame, history, zIndex} = props

  const [status, setStatus] = useState<Status>()

  const [
    {elements, wasMaybeCollapsed, isDragging, dragInsertPosition, dragSkeleton, perspective},
    dispatch,
  ] = useReducer(overlayStateReducer, {
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
      comlink.on('presentation/toggleOverlay', () => {
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

  const updateDragPreviewCustomProps = (rootElement: HTMLElement | null, x: number, y: number) => {
    if (!rootElement) return

    rootElement.style.setProperty('--drag-preview-x', `${x}px`)
    rootElement.style.setProperty('--drag-preview-y', `${y - window.scrollY}px`)
  }

  const overlayEventHandler: OverlayEventHandler = useCallback(
    (message) => {
      if (message.type === 'element/click') {
        const {sanity} = message
        comlink.post({type: 'overlay/focus', data: sanity})
      } else if (message.type === 'overlay/activate') {
        comlink.post({type: 'overlay/toggle', data: {enabled: true}})
      } else if (message.type === 'overlay/deactivate') {
        comlink.post({type: 'overlay/toggle', data: {enabled: false}})
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
    [comlink, rootElement],
  )

  const controller = useController(rootElement, overlayEventHandler, !!inFrame)

  useEffect(() => {
    if (overlayEnabled) {
      controller.current?.activate()
    } else {
      controller.current?.deactivate()
    }
  }, [controller, overlayEnabled])

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
        comlink.post({type: 'overlay/navigate', data: update})
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

  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <SchemaProvider comlink={comlink} elements={elements}>
        <PreviewSnapshotsProvider comlink={comlink}>
          <Root
            data-fading-out={fadingOut ? '' : undefined}
            data-overlays={overlaysFlash ? '' : undefined}
            ref={setRootElement}
            $zIndex={zIndex}
          >
            {!isDragging &&
              elementsToRender.map(({id, focused, hovered, rect, sanity}) => {
                return (
                  <ElementOverlay
                    key={id}
                    rect={rect}
                    focused={focused}
                    hovered={hovered}
                    showActions={!inFrame}
                    sanity={sanity}
                    wasMaybeCollapsed={focused && wasMaybeCollapsed}
                  />
                )
              })}

            {isDragging && dragSkeleton && <OverlayDragPreview skeleton={dragSkeleton} />}
            {isDragging && <OverlayDragInsertMarker dragInsertPosition={dragInsertPosition} />}
          </Root>
        </PreviewSnapshotsProvider>
      </SchemaProvider>
    </ThemeProvider>
  )
}
