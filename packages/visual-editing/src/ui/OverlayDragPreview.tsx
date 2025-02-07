import {Card, usePrefersDark, useTheme_v2} from '@sanity/ui/_visual-editing'
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
  --drag-preview-opacity: 0.98;
  --drag-preview-skeleton-stroke: #ffffff;

  @media (prefers-color-scheme: dark) {
    --drag-preview-skeleton-stroke: #383d51;
  }

  position: fixed;
  display: grid;
  transform: ${({$scaleFactor, $width, $height}) =>
    `translate(calc(var(--drag-preview-x) - ${$width / 2}px), calc(var(--drag-preview-y) - ${$height / 2}px)) scale(${$scaleFactor})`};
  width: ${({$width}) => `${$width}px`};
  height: ${({$height}) => `${$height}px`};
  z-index: 9999999;
  opacity: var(--drag-preview-opacity);
  cursor: move;

  .drag-preview-content-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    container-type: inline-size;
  }

  [data-ui='card'] {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .drag-preview-skeleton {
    position: absolute;
    inset: 0;

    rect {
      stroke: var(--drag-preview-skeleton-stroke);
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

function clamp(number: number, min: number, max: number): number {
  return number < min ? min : number > max ? max : number
}

function map(number: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const mapped: number = ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  return clamp(mapped, outMin, outMax)
}

export const OverlayDragPreview: FunctionComponent<{skeleton: DragSkeleton}> = ({skeleton}) => {
  const maxSkeletonWidth = Math.min(skeleton.maxWidth, window.innerWidth / 2)
  const scaleFactor = skeleton.w > maxSkeletonWidth ? maxSkeletonWidth / skeleton.w : 1

  const offsetX = skeleton.offsetX * scaleFactor
  const offsetY = skeleton.offsetY * scaleFactor

  const prefersDark = usePrefersDark()
  const theme = useTheme_v2()

  const radius = theme.radius[~~map(skeleton.w, 0, 1920, 1, theme.radius.length - 2)]

  const imageRects = skeleton.childRects.filter((r) => r.tagName === 'IMG')
  const textRects = skeleton.childRects.filter((r) => r.tagName !== 'IMG')

  return (
    <Root
      $width={skeleton.w}
      $height={skeleton.h}
      $offsetX={offsetX}
      $offsetY={offsetY}
      $scaleFactor={scaleFactor}
    >
      <Card
        radius={radius}
        shadow={4}
        overflow="hidden"
        tone="transparent"
        scheme={prefersDark ? 'dark' : 'light'}
      >
        <div className="drag-preview-content-wrapper">
          <svg className="drag-preview-skeleton" viewBox={`0 0 ${skeleton.w} ${skeleton.h}`}>
            {/* render image rects first to account for background images overlapping text */}
            {[...imageRects, ...textRects].map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={theme.color.skeleton.from}
              ></rect>
            ))}
          </svg>
        </div>
      </Card>
    </Root>
  )
}
