import type {FunctionComponent} from 'react'

export const OverlayDragPreview: FunctionComponent = () => {
  return (
    <div
      style={{
        position: 'fixed',
        background: 'color-mix(in lch, #e3e4e8 75%, transparent)',
        pointerEvents: 'none',
        transformOrigin: '0 0',
        transform: `translate(var(--drag-preview-x), var(--drag-preview-y))`,
        width: 'var(--drag-preview-w)',
        height: 'var(--drag-preview-h)',
        zIndex: 1,
        backdropFilter: 'blur(1px)',
      }}
    ></div>
  )
}
