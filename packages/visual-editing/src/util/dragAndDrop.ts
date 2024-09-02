import type {
  DragInsertPosition,
  DragInsertPositionRects,
  ElementNode,
  OverlayElement,
  OverlayEventHandler,
  OverlayRect,
  Point2D,
  Ray2D,
  SanityNode,
} from '../types'
import {getRect} from './getRect'

function offsetRect(rect: OverlayRect, px: number) {
  return {
    x: rect.x + px,
    y: rect.y + px,
    w: rect.w - 2 * px,
    h: rect.h - 2 * px,
  }
}

// Ref http://paulbourke.net/geometry/pointlineplane/
function rayIntersect(l1: Ray2D, l2: Ray2D): Point2D | false {
  const {x1, y1, x2, y2} = l1
  const {x1: x3, y1: y3, x2: x4, y2: y4} = l2

  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  const x = x1 + ua * (x2 - x1)
  const y = y1 + ua * (y2 - y1)

  return {x, y}
}

function rectEqual(r1: OverlayRect, r2: OverlayRect) {
  return r1.x === r2.x && r1.y === r2.y && r1.w === r2.w && r1.h === r2.h
}

function rayRectIntersections(line: Ray2D, rect: OverlayRect): Array<Point2D> | false {
  const rectLines: Array<Ray2D> = [
    {x1: rect.x, y1: rect.y, x2: rect.x + rect.w, y2: rect.y},
    {
      x1: rect.x + rect.w,
      y1: rect.y,
      x2: rect.x + rect.w,
      y2: rect.y + rect.h,
    },
    {
      x1: rect.x + rect.w,
      y1: rect.y + rect.h,
      x2: rect.x,
      y2: rect.y + rect.h,
    },
    {
      x1: rect.x,
      y1: rect.y + rect.h,
      x2: rect.x,
      y2: rect.y,
    },
  ]

  const intersections: Array<Point2D> = []

  for (let i = 0; i < rectLines.length; i++) {
    const intersection = rayIntersect(line, rectLines[i])

    if (intersection) {
      let isDuplicate = false

      for (let j = 0; j < intersections.length; j++) {
        if (intersections[j].x === intersection.x && intersections[j].y === intersection.y) {
          isDuplicate = true
        }
      }

      if (!isDuplicate) intersections.push(intersection)
    }
  }

  if (intersections.length === 0) {
    return false
  }

  return intersections.sort(
    (a, b) => pointDist(a, {x: line.x1, y: line.y1}) - pointDist(b, {x: line.x1, y: line.y1}),
  )
}

function pointDist(p1: Point2D, p2: Point2D): number {
  const a = p1.x - p2.x
  const b = p1.y - p2.y

  return Math.sqrt(a * a + b * b)
}

function pointInBounds(point: Point2D, bounds: OverlayRect) {
  const withinX = point.x >= bounds.x && point.x <= bounds.x + bounds.w
  const withinY = point.y >= bounds.y && point.y <= bounds.y + bounds.h

  return withinX && withinY
}

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

function findClosestIntersection(ray: Ray2D, targets: OverlayRect[]) {
  const rayOrigin = {
    x: ray.x1,
    y: ray.y1,
  }

  // Offset rects to ensure raycasting works when siblings touch
  if (targets.some((t) => pointInBounds(rayOrigin, offsetRect(t, Math.min(t.w, t.h) / 10))))
    return null

  let closestIntersection
  let closestRect

  for (const target of targets) {
    const intersections = rayRectIntersections(
      ray,
      offsetRect(target, Math.min(target.w, target.h) / 10),
    )

    if (intersections) {
      const firstIntersection = intersections[0]

      if (closestIntersection) {
        if (pointDist(rayOrigin, firstIntersection) < pointDist(rayOrigin, closestIntersection)) {
          closestIntersection = firstIntersection
          closestRect = target
        }
      } else {
        closestIntersection = firstIntersection
        closestRect = target
      }
    }
  }

  if (closestRect) return closestRect

  return null
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

function buildPreviewSkeleton(e: MouseEvent, element: ElementNode) {
  const bounds = getRect(element)
  const children = [
    ...element.querySelectorAll(':where(h1, h2, h3, h4, p, a, img, span, button):not(:has(*))'),
  ]
  const mousePos = calcMousePos(e)

  const childRects = children.map((child: Element) => {
    // offset to account for stroke in rendered rects
    const rect = offsetRect(getRect(child), 2)

    return {
      x: rect.x - bounds.x,
      y: rect.y - bounds.y,
      w: rect.w,
      h: rect.h,
      tagName: child.tagName,
    }
  })

  return {
    offsetX: bounds.x - mousePos.x,
    offsetY: bounds.y - mousePos.y,
    w: bounds.w,
    h: bounds.h,
    childRects,
  }
}

const minDragDelta = 4

export function handleOverlayDrag(
  mouseEvent: MouseEvent,
  element: ElementNode,
  overlayGroup: OverlayElement[],
  handler: OverlayEventHandler,
): void {
  const rects = overlayGroup.map((e) => getRect(e.elements.measureElement))
  const flow = calcTargetFlow(rects)

  let insertPosition: DragInsertPositionRects | null = null

  const initialMousePos = calcMousePos(mouseEvent)

  let dragSequenceStarted = false

  const handleMouseMove = (e: MouseEvent): void => {
    const mousePos = calcMousePos(e)

    if (Math.abs(pointDist(mousePos, initialMousePos)) < minDragDelta) return

    if (!dragSequenceStarted) {
      const skeleton = buildPreviewSkeleton(e, element)

      handler({
        type: 'overlay/dragStart',
        skeleton,
        flow,
      })

      dragSequenceStarted = true
    }

    handler({
      type: 'overlay/dragUpdateCursorPosition',
      x: mousePos.x,
      y: mousePos.y,
    })

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
    handler({
      type: 'overlay/dragEnd',
      insertPosition: insertPosition
        ? resolveInsertPosition(overlayGroup, insertPosition, flow)
        : null,
    })

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
