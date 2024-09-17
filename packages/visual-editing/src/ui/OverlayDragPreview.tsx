import type {FunctionComponent} from 'react'
import {styled} from 'styled-components'
import type {DragSkeleton} from '../types'

const Root = styled.div<{
  $width: number
  $height: number
  $offsetX: number
  $offsetY: number
  $scaleFactor: number
}>`
  --drag-preview-bg: #f6f6f8;
  --drag-preview-border: #ffffff;
  --drag-preview-opacity: 0.875;
  --drag-preview-skeleton-fill: #e3e4e8;
  --drag-preview-skeleton-stroke: #ffffff;
  --drag-preview-handle-fill: #727892;

  @media (prefers-color-scheme: dark) {
    --drag-preview-bg: #13141b;
    --drag-preview-border: #383d51;
    --drag-preview-skeleton-fill: #1b1d27;
    --drag-preview-skeleton-stroke: #383d51;
    --drag-preview-handle-fill: #515870;
  }

  position: fixed;
  background: var(--drag-preview-bg);
  pointer-events: none;
  transform-origin: 0 0;
  transform: ${({$offsetX, $offsetY, $scaleFactor}) =>
    `translate(calc(var(--drag-preview-x) + ${$offsetX}px), calc(var(--drag-preview-y) + ${$offsetY}px)) scale(${$scaleFactor})`};
  width: ${({$width}) => `${$width}px`};
  height: ${({$height}) => `${$height}px`};
  z-index: 9999999;
  border: 1px solid var(--drag-preview-border);
  opacity: var(--drag-preview-opacity);

  .drag-preview-content-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    container-type: inline-size;
  }

  .drag-preview-skeleton {
    position: absolute;
    inset: 0;

    rect {
      fill: var(--drag-preview-skeleton-fill);
      stroke: var(--drag-preview-skeleton-stroke);
      opacity: var(--drag-preview-opacity);
      stroke-width: 1;
    }
  }

  .drag-preview-handle {
    position: absolute;
    top: 4cqmin;
    left: 4cqmin;
    width: 6cqmin;
    fill: var(--drag-preview-handle-fill);
  }
`

export const OverlayDragPreview: FunctionComponent<{skeleton: DragSkeleton}> = ({skeleton}) => {
  const minSkeletonWidth = 100
  const minSkeletonHeight = 100

  const maxSkeletonWidth = window.innerWidth / 2
  const scaleFactor = skeleton.w > maxSkeletonWidth ? maxSkeletonWidth / skeleton.w : 1

  const showSkeleton =
    skeleton.w * scaleFactor >= minSkeletonWidth && skeleton.h * scaleFactor >= minSkeletonHeight

  const offsetX = skeleton.offsetX * scaleFactor
  const offsetY = skeleton.offsetY * scaleFactor

  return (
    <Root
      $width={skeleton.w}
      $height={skeleton.h}
      $offsetX={offsetX}
      $offsetY={offsetY}
      $scaleFactor={scaleFactor}
    >
      <div className="drag-preview-content-wrapper">
        {showSkeleton && (
          <>
            <svg className="drag-preview-skeleton" viewBox={`0 0 ${skeleton.w} ${skeleton.h}`}>
              {skeleton.childRects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h}></rect>
              ))}
            </svg>
            <svg className="drag-preview-handle" viewBox="0 0 25 25">
              <path d="M9.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM9.5 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM11 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
          </>
        )}
      </div>
    </Root>
  )
}
