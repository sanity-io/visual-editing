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
  getRectGroupYExtent,
  offsetRect,
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
      left: findClosestIntersection(rayLeft, targets),
      right: findClosestIntersection(rayRight, targets),
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
      top: findClosestIntersection(rayTop, targets),
      bottom: findClosestIntersection(rayBottom, targets),
    }
  }
}

function findRectSanityData(rect: OverlayRect, overlayGroup: OverlayElement[]) {
  return overlayGroup.find((e) => rectEqual(getRect(e.elements.measureElement), rect))
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
  return {
    x: e.clientX,
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
    const rect = scaleRect(offsetRect(getRect(child), 2), scaleFactor, {
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
    childRects,
  }
}

const minDragDelta = 4

async function applyMinimapWrapperTransform(
  target: HTMLElement,
  scaleFactor: number,
  minYScaled: number,
): Promise<void> {
  return new Promise((resolve) => {
    target.addEventListener(
      'transitionend',
      () => {
        resolve()
      },
      {once: true},
    )

    document.body.style.overflow = 'hidden'

    // ensure overflow hidden has applied and scrolling stopped before applying transform, prevent minor y-position transform issues
    setTimeout(() => {
      target.style.transformOrigin = '50% 0px'
      target.style.transition = 'transform 150ms ease'
      target.style.transform = `translateY(${-minYScaled + scrollY}px) scale(${scaleFactor})`
    }, 25)
  })
}

function calcMinimapTransformValues(rects: OverlayRect[]) {
  const {height: groupHeight} = getRectGroupYExtent(rects)

  const scaleFactor = groupHeight > window.innerHeight ? window.innerHeight / groupHeight : 1
  const scaledRects = rects.map((r) => scaleRect(r, scaleFactor, {x: window.innerWidth / 2, y: 0}))

  const {min: minYScaled} = getRectGroupYExtent(scaledRects)

  return {
    scaleFactor,
    minYScaled,
  }
}

async function resetMinimapWrapperTransform(
  endYOrigin: number,
  target: HTMLElement,
  prescaleHeight: number,
): Promise<void> {
  return new Promise((resolve) => {
    const computedStyle = window.getComputedStyle(target)
    const transform = computedStyle.transform

    const matrix = new DOMMatrix(transform)

    const scale = matrix.a

    if (scale === 1) return

    const maxScroll = prescaleHeight - window.innerHeight
    const prevScrollY = scrollY

    target.addEventListener(
      'transitionend',
      () => {
        target.style.transition = `none`
        target.style.transform = `none`

        scrollTo({
          top: endYOrigin,
          behavior: 'instant',
        })

        resolve()
      },
      {once: true},
    )

    target.style.transform = `translateY(${Math.max(prevScrollY - endYOrigin, -maxScroll + prevScrollY)}px) scale(${1})`
    document.body.style.overflow = 'auto'
  })
}

let minimapScaleApplied = false

let mousePosInverseTransform = {x: 0, y: 0}
let mousePos = {x: 0, y: 0}

let prescaleHeight = document.documentElement.scrollHeight

export function handleOverlayDrag(
  mouseEvent: MouseEvent,
  element: ElementNode,
  overlayGroup: OverlayElement[],
  handler: OverlayEventHandler,
  target: SanityNode,
): void {
  // do not trigger drag sequence on anything other than "main" (0) click, ignore right click, etc
  if (mouseEvent.button !== 0) return

  // ensure keyboard events fire within frame context
  window.focus()

  let rects = overlayGroup.map((e) => getRect(e.elements.measureElement))
  const flow = calcTargetFlow(rects)

  let insertPosition: DragInsertPositionRects | null = null

  const initialMousePos = calcMousePos(mouseEvent)

  const scaleTarget = document.body

  const {minYScaled, scaleFactor} = calcMinimapTransformValues(rects)

  let sequenceStarted = false
  let minimapPromptShown = false

  let mousedown = true

  if (!minimapScaleApplied) prescaleHeight = document.documentElement.scrollHeight

  const applyMinimap = (): void => {
    const skeleton = buildPreviewSkeleton(mousePos, element, scaleFactor)

    handler({
      type: 'overlay/dragUpdateSkeleton',
      skeleton,
    })

    handler({
      type: 'overlay/dragToggleMinimapPrompt',
      display: false,
    })

    minimapScaleApplied = true

    applyMinimapWrapperTransform(scaleTarget, scaleFactor, minYScaled).then(() => {
      rects = overlayGroup.map((e) => getRect(e.elements.measureElement))
    })
  }

  const handleScroll = (e: WheelEvent) => {
    if (
      Math.abs(e.deltaY) >= 10 &&
      scaleFactor !== 1 &&
      !minimapScaleApplied &&
      !minimapPromptShown
    ) {
      handler({
        type: 'overlay/dragToggleMinimapPrompt',
        display: true,
      })

      minimapPromptShown = true
    }

    if (e.shiftKey && !minimapScaleApplied) {
      applyMinimap()
    }
  }

  const handleMouseMove = (e: MouseEvent): void => {
    e.preventDefault()

    mousePos = calcMousePos(e)
    mousePosInverseTransform = calcMousePosInverseTransform(mousePos)

    if (Math.abs(pointDist(mousePos, initialMousePos)) < minDragDelta) return

    if (!sequenceStarted) {
      const skeleton = buildPreviewSkeleton(mousePos, element, 1)

      handler({
        type: 'overlay/dragStart',
        flow,
      })

      handler({
        type: 'overlay/dragUpdateSkeleton',
        skeleton,
      })

      sequenceStarted = true
    }

    handler({
      type: 'overlay/dragUpdateCursorPosition',
      x: mousePos.x,
      y: mousePos.y,
    })

    if (e.shiftKey && !minimapScaleApplied) {
      applyMinimap()
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
    })

    if (minimapPromptShown) {
      handler({
        type: 'overlay/dragToggleMinimapPrompt',
        display: false,
      })
    }

    if (!minimapScaleApplied) {
      window.removeEventListener('keyup', handleKeyup)
    }

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('wheel', handleScroll)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && minimapScaleApplied) {
      const skeleton = buildPreviewSkeleton(mousePos, element, 1 / scaleFactor)

      handler({
        type: 'overlay/dragUpdateSkeleton',
        skeleton,
      })

      resetMinimapWrapperTransform(mousePosInverseTransform.y, scaleTarget, prescaleHeight).then(
        () => {
          rects = overlayGroup.map((e) => getRect(e.elements.measureElement))

          minimapScaleApplied = false
        },
      )

      // cleanup keyup after drag sequence is complete
      if (!mousedown) {
        window.removeEventListener('keyup', handleKeyup)
      }
    }
  }

  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('wheel', handleScroll)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
