import type {OverlayRect, Point2D, Ray2D} from '../types'

export function getRect(element: Element): OverlayRect {
  const domRect = element.getBoundingClientRect()

  const rect = {
    x: domRect.x + scrollX,
    y: domRect.y + scrollY,
    w: domRect.width,
    h: domRect.height,
  }

  return rect
}

export function offsetRect(rect: OverlayRect, px: number, axis: 'x' | 'y'): OverlayRect {
  if (axis === 'x') {
    return {
      x: rect.x + px,
      y: rect.y,
      w: rect.w - 2 * px,
      h: rect.h,
    }
  } else {
    return {
      x: rect.x,
      y: rect.y + px,
      w: rect.w,
      h: rect.h - 2 * px,
    }
  }
}

// Ref http://paulbourke.net/geometry/pointlineplane/
export function rayIntersect(l1: Ray2D, l2: Ray2D): Point2D | false {
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

export function rectEqual(r1: OverlayRect, r2: OverlayRect): boolean {
  return r1.x === r2.x && r1.y === r2.y && r1.w === r2.w && r1.h === r2.h
}

export function rayRectIntersections(line: Ray2D, rect: OverlayRect): Array<Point2D> | false {
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
export function pointDist(p1: Point2D, p2: Point2D): number {
  const a = p1.x - p2.x
  const b = p1.y - p2.y

  return Math.sqrt(a * a + b * b)
}

export function pointInBounds(point: Point2D, bounds: OverlayRect): boolean {
  const withinX = point.x >= bounds.x && point.x <= bounds.x + bounds.w
  const withinY = point.y >= bounds.y && point.y <= bounds.y + bounds.h

  return withinX && withinY
}

export function findClosestIntersection(
  ray: Ray2D,
  targets: OverlayRect[],
  flow: string,
): OverlayRect | null {
  const rayOrigin = {
    x: ray.x1,
    y: ray.y1,
  }

  // Offset rects to ensure raycasting works when siblings touch
  if (
    targets.some((t) =>
      pointInBounds(
        rayOrigin,
        offsetRect(t, Math.min(t.w, t.h) / 10, flow === 'horizontal' ? 'x' : 'y'),
      ),
    )
  )
    return null
  let closestIntersection
  let closestRect

  for (const target of targets) {
    const intersections = rayRectIntersections(
      ray,
      offsetRect(target, Math.min(target.w, target.h) / 10, flow === 'horizontal' ? 'x' : 'y'),
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

export function scaleRect(
  rect: OverlayRect,
  scale: number,
  origin: {x: number; y: number},
): OverlayRect {
  const {x, y, w, h} = rect
  const {x: originX, y: originY} = origin

  const newX = originX + (x - originX) * scale
  const newY = originY + (y - originY) * scale

  const newWidth = w * scale
  const newHeight = h * scale

  return {
    x: newX,
    y: newY,
    w: newWidth,
    h: newHeight,
  }
}

export function getRectGroupXExtent(rects: OverlayRect[]): {
  min: number
  max: number
  width: number
} {
  const minGroupX = Math.max(0, Math.min(...rects.map((r) => r.x)))
  const maxGroupX = Math.min(document.body.offsetWidth, Math.max(...rects.map((r) => r.x + r.w)))

  return {
    min: minGroupX,
    max: maxGroupX,
    width: maxGroupX - minGroupX,
  }
}

export function getRectGroupYExtent(rects: OverlayRect[]): {
  min: number
  max: number
  height: number
} {
  const minGroupY = Math.max(0, Math.min(...rects.map((r) => r.y)))
  const maxGroupY = Math.min(document.body.scrollHeight, Math.max(...rects.map((r) => r.y + r.h)))

  return {
    min: minGroupY,
    max: maxGroupY,
    height: maxGroupY - minGroupY,
  }
}
