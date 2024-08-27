import type {FunctionComponent} from 'react'

import type {DragInsertPosition} from '../types'

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

  if (flow === 'horizontal') {
    const {left, right} = dragInsertPosition

    width = 4

    if (right && left) {
      const startX = left.rect.x + left.rect.w
      const endX = right.rect.x

      x = lerp(startX, endX, 0.5) - 2
      y = left.rect.y

      height = Math.min(right.rect.h, left.rect.h)
    } else if (right && !left) {
      x = right.rect.x - 4 - 4
      y = right.rect.y
      height = right.rect.h
    } else if (left && !right) {
      x = left.rect.x + left.rect.w + 4
      y = left.rect.y
      height = left.rect.h
    }
  } else {
    const {bottom, top} = dragInsertPosition

    if (bottom && top) {
      const startY = top.rect.y + top.rect.h
      const endY = bottom.rect.y

      height = 4

      x = top.rect.x
      y = lerp(startY, endY, 0.5) - 2
      width = Math.min(bottom.rect.w, top.rect.w)
    } else if (bottom && !top) {
      x = bottom.rect.x
      y = bottom.rect.y - 4 - 4
      width = bottom.rect.w
      height = 4
    } else if (top && !bottom) {
      x = top.rect.x
      y = top.rect.y + top.rect.h + 4
      width = top.rect.w
      height = 4
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(${x}px, ${y}px)`,
        width,
        height,
        background: '#596ffc',
        pointerEvents: 'none',
      }}
    ></div>
  )
}
