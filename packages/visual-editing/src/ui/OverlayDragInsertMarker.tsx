import type {FunctionComponent} from 'react'
import {styled} from 'styled-components'

import type {DragInsertPosition} from '../types'

const Root = styled.div<{$x: number; $y: number; $width: number; $height: number}>`
  position: absolute;
  width: ${({$width}) => `${$width}px`};
  height: ${({$height}) => `${$height}px`};
  background: color-mix(in srgb, #556bfc 95%, transparent);
  pointer-events: none;
  transform: ${({$x, $y}) => `translate(${$x}px, ${$y}px)`};
`

const markerThickness = 2
const markerGap = 0

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

    width = markerThickness

    if (right && left) {
      const startX = left.rect.x + left.rect.w
      const endX = right.rect.x

      x = lerp(startX, endX, 0.5) - markerThickness / 2
      y = left.rect.y

      height = Math.min(right.rect.h, left.rect.h)
    } else if (right && !left) {
      x = right.rect.x - markerThickness - markerGap
      y = right.rect.y
      height = right.rect.h
    } else if (left && !right) {
      x = left.rect.x + left.rect.w + markerGap
      y = left.rect.y
      height = left.rect.h
    }
  } else {
    const {bottom, top} = dragInsertPosition

    if (bottom && top) {
      const startY = top.rect.y + top.rect.h
      const endY = bottom.rect.y

      height = markerThickness

      x = top.rect.x
      y = lerp(startY, endY, 0.5) - markerThickness / 2
      width = Math.min(bottom.rect.w, top.rect.w)
    } else if (bottom && !top) {
      x = bottom.rect.x
      y = bottom.rect.y - markerGap
      width = bottom.rect.w
      height = markerThickness
    } else if (top && !bottom) {
      x = top.rect.x
      y = top.rect.y + top.rect.h + markerGap
      width = top.rect.w
      height = markerThickness
    }
  }

  return <Root $x={x} $y={y} $width={width} $height={height}></Root>
}
