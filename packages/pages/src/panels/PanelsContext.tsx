import { createContext, type CSSProperties } from 'react'

import { PanelElement, ResizerElement } from './types'

export const PanelsContext = createContext<{
  activeResizer: string | null
  drag: (id: string, event: MouseEvent) => void
  getPanelStyle: (id: string) => CSSProperties
  registerElement: (id: string, panel: PanelElement | ResizerElement) => void
  startDragging: (id: string, event: MouseEvent) => void
  stopDragging: () => void
  unregisterElement: (id: string) => void
} | null>(null)

PanelsContext.displayName = 'PanelsContext'
