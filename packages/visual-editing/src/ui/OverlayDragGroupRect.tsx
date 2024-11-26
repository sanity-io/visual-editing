import type {FunctionComponent} from 'react'
import type {OverlayRect} from '../types'

export const OverlayDragGroupRect: FunctionComponent<{
  dragGroupRect: OverlayRect
}> = ({dragGroupRect}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${dragGroupRect.y}px`,
        left: `${dragGroupRect.x}px`,
        width: `${dragGroupRect.w - 1}px`,
        height: `${dragGroupRect.h - 1}px`,
        border: '1px dashed #f0709b',
        pointerEvents: 'none',
      }}
    ></div>
  )
}
