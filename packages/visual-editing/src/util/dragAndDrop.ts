import type {
  OverlayRect,
  OverlayElement,
  OverlayEventHandler,
  OverlayMsgUpdateDragInsertPosition,
  Ray2D,
  Point2D,
  SanityNode,
  DragInsertPosition,
  DragState,
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

  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)

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
        // @TODO this could be more robust
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
  if (targets.some((t) => pointInBounds(rayOrigin, offsetRect(t, 8)))) return null

  let closestIntersection
  let closestRect

  for (const target of targets) {
    const intersections = rayRectIntersections(ray, offsetRect(target, 8))

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

function resolveInsertMsg(
  overlayGroup: OverlayElement[],
  insertPosition: DragInsertPosition,
  flow: string,
): OverlayMsgUpdateDragInsertPosition {
  if (Object.values(insertPosition).every((v) => v === null))
    return {
      type: 'overlay/updateDragInsertPosition',
      insertPosition: null,
    }

  if (flow === 'horizontal') {
    return {
      type: 'overlay/updateDragInsertPosition',
      insertPosition: {
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
      },
    }
  } else {
    return {
      type: 'overlay/updateDragInsertPosition',
      insertPosition: {
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
      },
    }
  }
}

export function handleOverlayDrag(
  overlayGroup: OverlayElement[],
  dragState: DragState,
  handler: OverlayEventHandler,
): void {
  const rects = overlayGroup.map((e) => getRect(e.elements.measureElement))
  const flow = calcTargetFlow(rects)

  const handleMouseMove = (e: MouseEvent): void => {
    const mousePos = {
      x: e.clientX,
      y: e.clientY + window.scrollY,
    }

    handler({
      type: 'overlay/updateDragCursorPosition',
      x: mousePos.x,
      y: mousePos.y,
    })

    const insertPosition = calcInsertPosition(mousePos, rects, flow)

    // @TODO better insert position comparison
    if (JSON.stringify(insertPosition) !== JSON.stringify(dragState.insertPosition)) {
      dragState.insertPosition = insertPosition

      handler(resolveInsertMsg(overlayGroup, insertPosition, flow))
    }
  }

  const handleMouseUp = (): void => {
    dragState.status = 'idle'

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
