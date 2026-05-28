import type {
  DragInsertPosition,
  DragInsertPositionRects,
  ElementNode,
  OverlayElement,
  OverlayEventHandler,
  OverlayRect,
  Point2D,
  SanityNode,
} from '../types'
import {
  findClosestIntersection,
  getRect,
  getRectGroupXExtent,
  getRectGroupYExtent,
  pointDist,
  rectEqual,
  scaleRect,
} from './geometry'

function calcTargetFlow(targets: OverlayRect[]) {
  if (
    targets.some((t1) => {
      const others = targets.filter((t2) => !rectEqual(t1, t2))

      return others.some((t2) => {
        return t1.y === t2.y
      })
    })
  ) {
    return 'horizontal'
  } else {
    return 'vertical'
  }
}

function calcInsertPosition(origin: Point2D, targets: OverlayRect[], flow: string) {
  if (flow === 'horizontal') {
    const rayLeft = {
      x1: origin.x,
      y1: origin.y,
      x2: origin.x - 100_000_000,
      y2: origin.y,
    }

    const rayRight = {
      x1: origin.x,
      y1: origin.y,
      x2: origin.x + 100_000_000,
      y2: origin.y,
    }

    return {
      left: findClosestIntersection(rayLeft, targets, flow),
      right: findClosestIntersection(rayRight, targets, flow),
    }
  } else {
    const rayTop = {
      x1: origin.x,
      y1: origin.y,
      x2: origin.x,
      y2: origin.y - 100_000_000,
    }

    const rayBottom = {
      x1: origin.x,
      y1: origin.y,
      x2: origin.x,
      y2: origin.y + 100_000_000,
    }

    return {
      top: findClosestIntersection(rayTop, targets, flow),
      bottom: findClosestIntersection(rayBottom, targets, flow),
    }
  }
}

function findRectSanityData(rect: OverlayRect, overlayGroup: OverlayElement[]) {
  return overlayGroup.find((e) => rectEqual(getRect(e.elements.element), rect))
    ?.sanity as SanityNode
}

function resolveInsertPosition(
  overlayGroup: OverlayElement[],
  insertPosition: DragInsertPositionRects,
  flow: string,
): DragInsertPosition {
  if (Object.values(insertPosition).every((v) => v === null)) return null

  if (flow === 'horizontal') {
    return {
      left: insertPosition.left
        ? {
            rect: insertPosition.left,
            sanity: findRectSanityData(insertPosition.left, overlayGroup),
          }
        : null,
      right: insertPosition.right
        ? {
            rect: insertPosition.right,
            sanity: findRectSanityData(insertPosition.right, overlayGroup),
          }
        : null,
    }
  } else {
    return {
      top: insertPosition.top
        ? {
            rect: insertPosition.top,
            sanity: findRectSanityData(insertPosition.top, overlayGroup),
          }
        : null,
      bottom: insertPosition.bottom
        ? {
            rect: insertPosition.bottom,
            sanity: findRectSanityData(insertPosition.bottom, overlayGroup),
          }
        : null,
    }
  }
}

function calcMousePos(e: MouseEvent) {
  const bodyBounds = document.body.getBoundingClientRect()

  return {
    x: Math.max(bodyBounds.x, Math.min(e.clientX, bodyBounds.x + bodyBounds.width)),
    y: e.clientY + window.scrollY,
  }
}

function calcMousePosInverseTransform(mousePos: Point2D) {
  const body = document.body
  const computedStyle = window.getComputedStyle(body)
  const transform = computedStyle.transform

  if (transform === 'none') {
    return {
      x: mousePos.x,
      y: mousePos.y,
    }
  }

  const matrix = new DOMMatrix(transform)
  const inverseMatrix = matrix.inverse()

  const point = new DOMPoint(mousePos.x, mousePos.y)
  const transformedPoint = point.matrixTransform(inverseMatrix)

  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
  }
}

function buildPreviewSkeleton(mousePos: Point2D, element: ElementNode, scaleFactor: number) {
  const bounds = getRect(element)

  const children = [
    ...element.querySelectorAll(':where(h1, h2, h3, h4, p, a, img, span, button):not(:has(*))'),
  ]

  if (mousePos.x <= bounds.x) mousePos.x = bounds.x
  if (mousePos.x >= bounds.x + bounds.w) mousePos.x = bounds.x + bounds.w

  if (mousePos.y >= bounds.y + bounds.h) mousePos.y = bounds.y + bounds.h
  if (mousePos.y <= bounds.y) mousePos.y = bounds.y

  const childRects = children.map((child: Element) => {
    // offset to account for stroke in rendered rects
    const rect = scaleRect(getRect(child), scaleFactor, {
      x: bounds.x,
      y: bounds.y,
    })

    return {
      x: rect.x - bounds.x,
      y: rect.y - bounds.y,
      w: rect.w,
      h: rect.h,
      tagName: child.tagName,
    }
  })

  return {
    offsetX: (bounds.x - mousePos.x) * scaleFactor,
    offsetY: (bounds.y - mousePos.y) * scaleFactor,
    w: bounds.w * scaleFactor,
    h: bounds.h * scaleFactor,
    maxWidth: bounds.w * scaleFactor * 0.75,
    childRects,
  }
}

const minDragDelta = 4

async function applyMinimapWrapperTransform(
  target: HTMLElement,
  scaleFactor: number,
  minYScaled: number,
  handler: OverlayEventHandler,
  rectUpdateFrequency: number,
): Promise<void> {
  return new Promise((resolve) => {
    target.addEventListener(
      'transitionend',
      () => {
        setTimeout(() => {
          handler({
            type: 'overlay/dragEndMinimapTransition',
          })
        }, rectUpdateFrequency * 2)

        resolve()
      },
      {once: true},
    )

    handler({
      type: 'overlay/dragStartMinimapTransition',
    })

    handler({
      type: 'overlay/dragToggleMinimap',
      display: true,
    })

    document.body.style.overflow = 'hidden'
    document.body.style.height = '100%'
    document.documentElement.style.overflow = 'initial'
    document.documentElement.style.height = '100%'

    // ensure overflow hidden has applied and scrolling stopped before applying transform, prevent minor y-position transform issues
    setTimeout(() => {
      target.style.transformOrigin = '50% 0px'
      target.style.transition = 'transform 150ms ease'
      target.style.transform = `translate3d(0px, ${-minYScaled + scrollY}px, 0px) scale(${scaleFactor})`
    }, 25)
  })
}

function calcMinimapTransformValues(rects: OverlayRect[], groupHeightOverride: number | null) {
  let groupHeight = groupHeightOverride || getRectGroupYExtent(rects).height

  const padding = 100 // px

  groupHeight += padding * 2

  const scaleFactor = groupHeight > window.innerHeight ? window.innerHeight / groupHeight : 1
  const scaledRects = rects.map((r) => scaleRect(r, scaleFactor, {x: window.innerWidth / 2, y: 0}))

  const {min: minYScaled} = getRectGroupYExtent(scaledRects)

  return {
    scaleFactor,
    minYScaled: minYScaled - padding * scaleFactor,
  }
}
function calcGroupBoundsPreview(rects: OverlayRect[]) {
  const groupBoundsX = getRectGroupXExtent(rects)
  const groupBoundsY = getRectGroupYExtent(rects)

  const offsetDist = 8

  const canOffsetX =
    groupBoundsX.min > offsetDist &&
    groupBoundsX.min + groupBoundsX.width <= window.innerWidth - offsetDist
  const canOffsetY =
    groupBoundsY.min > offsetDist &&
    groupBoundsY.min + groupBoundsY.height <= document.body.scrollHeight - offsetDist
  const canOffset = canOffsetX && canOffsetY

  const groupRect = {
    x: canOffset ? groupBoundsX.min - offsetDist : groupBoundsX.min,
    y: canOffset ? groupBoundsY.min - offsetDist : groupBoundsY.min,
    w: canOffset ? groupBoundsX.width + offsetDist * 2 : groupBoundsX.width,
    h: canOffset ? groupBoundsY.height + offsetDist * 2 : groupBoundsY.height,
  }

  return groupRect
}

async function resetMinimapWrapperTransform(
  endYOrigin: number,
  target: HTMLElement,
  prescaleHeight: number,
  handler: OverlayEventHandler,
  rectUpdateFrequency: number,
  previousRootStyleValues: PreviousRootStyleValues | null,
): Promise<void> {
  return new Promise((resolve) => {
    const computedStyle = window.getComputedStyle(target)
    const transform = computedStyle.transform

    const matrix = new DOMMatrix(transform)

    const scale = matrix.a

    if (scale === 1) return

    const maxScroll = prescaleHeight - window.innerHeight
    const prevScrollY = scrollY

    endYOrigin -= window.innerHeight / 2

    if (endYOrigin < 0) endYOrigin = 0

    target.addEventListener(
      'transitionend',
      () => {
        target.style.transition = `none`
        target.style.transform = `none`

        scrollTo({
          top: endYOrigin,
          behavior: 'instant',
        })

        setTimeout(() => {
          handler({
            type: 'overlay/dragEndMinimapTransition',
          })

          handler({
            type: 'overlay/dragToggleMinimap',
            display: false,
          })
        }, rectUpdateFrequency * 2)

        resolve()
      },
      {once: true},
    )

    handler({
      type: 'overlay/dragStartMinimapTransition',
    })

    target.style.transform = `translateY(${Math.max(prevScrollY - endYOrigin, -maxScroll + prevScrollY)}px) scale(${1})`

    if (!previousRootStyleValues) return

    document.body.style.overflow = previousRootStyleValues.body.overflow
    document.body.style.height = previousRootStyleValues.body.height
    document.documentElement.style.overflow = previousRootStyleValues.documentElement.overflow
    document.documentElement.style.height = previousRootStyleValues.documentElement.height
  })
}

interface PreviousRootStyleValues {
  body: {
    overflow: string
    height: string
  }
  documentElement: {
    overflow: string
    height: string
  }
}

interface HandleOverlayDragOpts {
  mouseEvent: MouseEvent
  element: ElementNode
  overlayGroup: OverlayElement[]
  handler: OverlayEventHandler
  target: SanityNode
  onSequenceStart: () => void
  onSequenceEnd: () => void
}

let minimapScaleApplied = false

let mousePosInverseTransform = {x: 0, y: 0}
let mousePos = {x: 0, y: 0}

let prescaleHeight = typeof document === 'undefined' ? 0 : document.documentElement.scrollHeight

let previousRootStyleValues: PreviousRootStyleValues | null = null

export function handleOverlayDrag(opts: HandleOverlayDragOpts): void {
  const {mouseEvent, element, overlayGroup, handler, target, onSequenceStart, onSequenceEnd} = opts

  // do not trigger drag sequence on anything other than "main" (0) click, ignore right click, etc
  if (mouseEvent.button !== 0) return

  // ensure keyboard events fire within frame context
  window.focus()

  const rectUpdateFrequency = 150
  let rects = overlayGroup.map((e) => getRect(e.elements.element))

  const flow = (element.getAttribute('data-sanity-drag-flow') || calcTargetFlow(rects)) as
    | 'horizontal'
    | 'vertical'

  const dragGroup = element.getAttribute('data-sanity-drag-group')

  const disableMinimap = !!element.getAttribute('data-sanity-drag-minimap-disable')

  const preventInsertDefault = !!element.getAttribute('data-sanity-drag-prevent-default')

  const documentHeightOverride = element.getAttribute('data-unstable_sanity-drag-document-height')
  const groupHeightOverride = element.getAttribute('data-unstable_sanity-drag-group-height')

  let insertPosition: DragInsertPositionRects | null = null

  const initialMousePos = calcMousePos(mouseEvent)

  const scaleTarget = document.body

  const {minYScaled, scaleFactor} = calcMinimapTransformValues(
    rects,
    groupHeightOverride ? ~~groupHeightOverride : null,
  )

  let sequenceStarted = false
  let minimapPromptShown = false

  let mousedown = true

  if (!minimapScaleApplied) {
    previousRootStyleValues = {
      body: {
        overflow: window.getComputedStyle(document.body).overflow,
        height: window.getComputedStyle(document.body).height,
      },
      documentElement: {
        overflow: window.getComputedStyle(document.documentElement).overflow,
        height: window.getComputedStyle(document.documentElement).height,
      },
    }

    prescaleHeight = documentHeightOverride
      ? ~~documentHeightOverride
      : document.documentElement.scrollHeight
  }

  const rectsInterval = setInterval(() => {
    rects = overlayGroup.map((e) => getRect(e.elements.element))
  }, rectUpdateFrequency)

  const applyMinimap = (): void => {
    if (scaleFactor >= 1) return

    const skeleton = buildPreviewSkeleton(mousePos, element, scaleFactor)

    handler({
      type: 'overlay/dragUpdateSkeleton',
      skeleton,
    })

    handler({
      type: 'overlay/dragToggleMinimapPrompt',
      display: false,
    })

    applyMinimapWrapperTransform(
      scaleTarget,
      scaleFactor,
      minYScaled,
      handler,
      rectUpdateFrequency,
    ).then(() => {
      setTimeout(() => {
        handler({
          type: 'overlay/dragUpdateGroupRect',
          groupRect: calcGroupBoundsPreview(rects),
        })
      }, rectUpdateFrequency * 2)
    })
  }

  const handleScroll = (e: WheelEvent) => {
    if (
      Math.abs(e.deltaY) >= 10 &&
      scaleFactor < 1 &&
      !minimapScaleApplied &&
      !minimapPromptShown &&
      !disableMinimap &&
      mousedown
    ) {
      handler({
        type: 'overlay/dragToggleMinimapPrompt',
        display: true,
      })

      minimapPromptShown = true
    }

    if (e.shiftKey && !minimapScaleApplied && !disableMinimap) {
      window.dispatchEvent(new CustomEvent('unstable_sanity/dragApplyMinimap'))

      minimapScaleApplied = true

      setTimeout(() => {
        applyMinimap()
      }, 50)
    }
  }

  const handleMouseMove = (e: MouseEvent): void => {
    e.preventDefault()

    mousePos = calcMousePos(e)
    mousePosInverseTransform = calcMousePosInverseTransform(mousePos)

    if (Math.abs(pointDist(mousePos, initialMousePos)) < minDragDelta) return

    if (!sequenceStarted) {
      const groupRect = calcGroupBoundsPreview(rects)

      const skeleton = buildPreviewSkeleton(mousePos, element, 1)

      handler({
        type: 'overlay/dragStart',
        flow,
      })

      handler({
        type: 'overlay/dragUpdateSkeleton',
        skeleton,
      })

      handler({
        type: 'overlay/dragUpdateGroupRect',
        groupRect,
      })

      sequenceStarted = true
      onSequenceStart()
    }

    handler({
      type: 'overlay/dragUpdateCursorPosition',
      x: mousePos.x,
      y: mousePos.y,
    })

    if (e.shiftKey && !minimapScaleApplied && !disableMinimap) {
      window.dispatchEvent(new CustomEvent('unstable_sanity/dragApplyMinimap'))

      minimapScaleApplied = true

      setTimeout(() => {
        applyMinimap()
      }, 50)
    }

    const newInsertPosition = calcInsertPosition(mousePos, rects, flow)

    if (JSON.stringify(insertPosition) !== JSON.stringify(newInsertPosition)) {
      insertPosition = newInsertPosition

      handler({
        type: 'overlay/dragUpdateInsertPosition',
        insertPosition: resolveInsertPosition(overlayGroup, insertPosition, flow),
      })
    }
  }

  const handleMouseUp = (): void => {
    mousedown = false

    handler({
      type: 'overlay/dragEnd',
      target,
      insertPosition: insertPosition
        ? resolveInsertPosition(overlayGroup, insertPosition, flow)
        : null,
      dragGroup,
      flow,
      preventInsertDefault,
    })

    if (minimapPromptShown) {
      handler({
        type: 'overlay/dragToggleMinimapPrompt',
        display: false,
      })
    }

    if (!minimapScaleApplied) {
      clearInterval(rectsInterval)
      onSequenceEnd()

      removeFrameListeners()
      removeKeyListeners()
    }

    removeMouseListeners()
  }

  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && minimapScaleApplied) {
      minimapScaleApplied = false

      const skeleton = buildPreviewSkeleton(mousePos, element, 1 / scaleFactor)

      handler({
        type: 'overlay/dragUpdateSkeleton',
        skeleton,
      })

      window.dispatchEvent(new CustomEvent('unstable_sanity/dragResetMinimap'))

      setTimeout(() => {
        resetMinimapWrapperTransform(
          mousePosInverseTransform.y,
          scaleTarget,
          prescaleHeight,
          handler,
          rectUpdateFrequency,
          previousRootStyleValues,
        )
      }, 50)

      handler({
        type: 'overlay/dragUpdateGroupRect',
        groupRect: null,
      })

      // cleanup keyup after drag sequence is complete
      if (!mousedown) {
        clearInterval(rectsInterval)

        removeMouseListeners()
        removeFrameListeners()
        removeKeyListeners()

        onSequenceEnd()
      }
    }
  }

  const handleBlur = () => {
    handler({
      type: 'overlay/dragUpdateGroupRect',
      groupRect: null,
    })

    window.dispatchEvent(new CustomEvent('unstable_sanity/dragResetMinimap'))

    setTimeout(() => {
      resetMinimapWrapperTransform(
        mousePosInverseTransform.y,
        scaleTarget,
        prescaleHeight,
        handler,
        rectUpdateFrequency,
        previousRootStyleValues,
      ).then(() => {
        minimapScaleApplied = false
      })
    }, 50)

    clearInterval(rectsInterval)

    removeMouseListeners()
    removeFrameListeners()
    removeKeyListeners()

    onSequenceEnd()
  }

  const removeMouseListeners = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('wheel', handleScroll)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const removeKeyListeners = () => {
    window.removeEventListener('keyup', handleKeyup)
  }

  const removeFrameListeners = () => {
    window.removeEventListener('blur', handleBlur)
  }

  window.addEventListener('blur', handleBlur)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('wheel', handleScroll)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
