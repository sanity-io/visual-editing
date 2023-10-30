import { RefObject } from 'react'

export interface PanelElement {
  id: string
  type: 'panel'
  defaultSize: number | null
  order: number
  maxWidth: number | null
  minWidth: number
}

export interface ResizerElement {
  id: string
  order: number
  type: 'resizer'
  el: RefObject<HTMLDivElement>
}

export type ElementMap = Map<string, PanelElement | ResizerElement>

export interface PanelsState {
  elements: ElementMap
  panels: PanelElement[]
  widths: number[]
}

export interface InitialDragState {
  containerWidth: number
  panelAfter: PanelElement | null
  panelBefore: PanelElement | null
  resizerIndex: number
  startX: number
  resizerRect: DOMRect | null
  widths: number[]
  dragOffset: number
}
