import type {FunctionComponent} from 'react'
import type {DragInsertPosition} from '../types'

const markerThickness = 6

function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t
}

export const OverlayDragInsertMarker: FunctionComponent<{
  dragInsertPosition: DragInsertPosition
}> = ({dragInsertPosition}) => {
  if (dragInsertPosition === null) return

  const flow = dragInsertPosition?.left || dragInsertPosition?.right ? 'horizontal' : 'vertical'

  let x = 0
  let y = 0
  let width = 0
  let height = 0
  const offsetMultiplier = 0.0125

  if (flow === 'horizontal') {
    const {left, right} = dragInsertPosition

    width = markerThickness

    if (right && left) {
      const startX = left.rect.x + left.rect.w
      const endX = right.rect.x
      const targetHeight = Math.min(right.rect.h, left.rect.h)
      const offset = targetHeight * offsetMultiplier

      x = lerp(startX, endX, 0.5) - markerThickness / 2
      y = left.rect.y + offset

      height = Math.min(right.rect.h, left.rect.h) - offset * 2
    } else if (right && !left) {
      const targetHeight = right.rect.h
      const offset = targetHeight * offsetMultiplier

      x = right.rect.x - markerThickness / 2
      y = right.rect.y + offset
      height = right.rect.h - offset * 2
    } else if (left && !right) {
      const targetHeight = left.rect.h
      const offset = targetHeight * offsetMultiplier

      x = left.rect.x + left.rect.w - markerThickness / 2
      y = left.rect.y + offset
      height = left.rect.h - offset * 2
    }
  } else {
    const {bottom, top} = dragInsertPosition

    if (bottom && top) {
      const startX = Math.min(top.rect.x, bottom.rect.x)
      const startY = top.rect.y + top.rect.h
      const endY = bottom.rect.y
      const targetWidth = Math.min(bottom.rect.w, top.rect.w)
      const offset = targetWidth * offsetMultiplier

      height = markerThickness

      x = startX + offset
      y = lerp(startY, endY, 0.5) - markerThickness / 2
      width = Math.max(bottom.rect.w, top.rect.w) - offset * 2
    } else if (bottom && !top) {
      const targetWidth = bottom.rect.w
      const offset = targetWidth * offsetMultiplier

      x = bottom.rect.x + offset
      y = bottom.rect.y - markerThickness / 2
      width = bottom.rect.w - offset * 2
      height = markerThickness
    } else if (top && !bottom) {
      const targetWidth = top.rect.w
      const offset = targetWidth * offsetMultiplier

      x = top.rect.x + offset
      y = top.rect.y + top.rect.h - markerThickness / 2
      width = top.rect.w - offset * 2
      height = markerThickness
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${x}px, ${y}px)`,
        background: '#556bfc',
        border: '2px solid white',
        borderRadius: '999px',
        zIndex: '999999',
      }}
    ></div>
  )
}
