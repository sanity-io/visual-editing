import type {OverlayRect} from '../types'

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
