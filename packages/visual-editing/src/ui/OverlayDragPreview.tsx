import type {FunctionComponent} from 'react'

import type {DragSkeleton} from '../types'

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
    <div
      style={{
        position: 'fixed',
        background: 'light-dark(#f6f6f8, #13141b)',
        pointerEvents: 'none',
        transformOrigin: `0 0`,
        transform: `translate(calc(var(--drag-preview-x) + ${offsetX}px), calc(var(--drag-preview-y) + ${offsetY}px)) scale(${scaleFactor})`,
        width: `${skeleton.w}px`,
        height: `${skeleton.h}px`,
        zIndex: 1,
        backdropFilter: 'blur(8px)',
        border: '1px solid light-dark(#ffffff, #383d51)',
        colorScheme: 'light dark',
      }}
    >
      <div
        style={{position: 'relative', width: '100%', height: '100%', containerType: 'inline-size'}}
      >
        {showSkeleton && (
          <>
            <svg style={{position: 'absolute'}} viewBox={`0 0 ${skeleton.w} ${skeleton.h}`}>
              {skeleton.childRects.map((r, i) => (
                <rect
                  key={i}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill="light-dark(#e3e4e8, #1b1d27)"
                  stroke="light-dark(#ffffff, #383d51)"
                  strokeWidth="1"
                ></rect>
              ))}
            </svg>
            <svg
              style={{position: 'absolute', top: '4cqmin', left: '4cqmin', width: '6cqmin'}}
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.5 8C10.3284 8 11 7.32843 11 6.5C11 5.67157 10.3284 5 9.5 5C8.67157 5 8 5.67157 8 6.5C8 7.32843 8.67157 8 9.5 8ZM9.5 14C10.3284 14 11 13.3284 11 12.5C11 11.6716 10.3284 11 9.5 11C8.67157 11 8 11.6716 8 12.5C8 13.3284 8.67157 14 9.5 14ZM11 18.5C11 19.3284 10.3284 20 9.5 20C8.67157 20 8 19.3284 8 18.5C8 17.6716 8.67157 17 9.5 17C10.3284 17 11 17.6716 11 18.5ZM15.5 8C16.3284 8 17 7.32843 17 6.5C17 5.67157 16.3284 5 15.5 5C14.6716 5 14 5.67157 14 6.5C14 7.32843 14.6716 8 15.5 8ZM17 12.5C17 13.3284 16.3284 14 15.5 14C14.6716 14 14 13.3284 14 12.5C14 11.6716 14.6716 11 15.5 11C16.3284 11 17 11.6716 17 12.5ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.6716 20 15.5 20Z"
                fill="light-dark(#727892, #515870)"
              />
            </svg>
          </>
        )}
      </div>
    </div>
  )
}
