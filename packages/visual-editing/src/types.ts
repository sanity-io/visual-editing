import type {
  HistoryRefresh,
  HistoryUpdate,
  SanityNode,
  SanityStegaNode,
  VisualEditingControllerMsg,
  VisualEditingNodeMsg,
} from '@repo/visual-editing-helpers'
import type {Node} from '@sanity/comlink'
import type {ComponentType, ReactElement} from 'react'

export type {
  HistoryRefresh,
  HistoryUpdate,
  SanityNode,
  SanityStegaNode,
} from '@repo/visual-editing-helpers'

/**
 * @public
 */
export interface OverlayRect {
  x: number
  y: number
  w: number
  h: number
}

/** @internal */
export interface Ray2D {
  x1: number
  y1: number
  x2: number
  y2: number
}

/** @internal */
export interface Point2D {
  x: number
  y: number
}

/** @internal */
export interface DragInsertPositionRects {
  top?: OverlayRect | null
  left?: OverlayRect | null
  bottom?: OverlayRect | null
  right?: OverlayRect | null
}

/** @public */
export type DragInsertPosition = {
  top?: {rect: OverlayRect; sanity: SanityNode} | null
  left?: {rect: OverlayRect; sanity: SanityNode} | null
  bottom?: {rect: OverlayRect; sanity: SanityNode} | null
  right?: {rect: OverlayRect; sanity: SanityNode} | null
} | null

/** @public */
export interface DragEndEvent {
  insertPosition: DragInsertPosition
  target: SanityNode
}

/** @public */
export type DragSkeleton = {
  w: number
  h: number
  offsetX: number
  offsetY: number
  childRects: {
    x: number
    y: number
    w: number
    h: number
    tagName: string
  }[]
}

/**
 * Base controller dispatched message
 * @typeParam T - Type of message
 * @public
 */
export interface Msg<T extends string> {
  type: T
}

/** @public */
export interface OverlayMsgElement<T extends string> extends Msg<`element/${T}`> {
  id: string
}

/** @public */
export type OverlayMsgElementActivate = OverlayMsgElement<'activate'>

/** @public */
export type OverlayMsgBlur = Msg<'overlay/blur'>

/** @public */
export type OverlayMsgActivate = Msg<'overlay/activate'>

/** @public */
export type OverlayMsgDeactivate = Msg<'overlay/deactivate'>

/** @public */
export type OverlayMsgElementContextMenu =
  | OverlayMsgElement<'contextmenu'>
  | (OverlayMsgElement<'contextmenu'> & {
      position: {
        x: number
        y: number
      }
      sanity: SanityNode
    })

/** @public */
export type OverlayMsgElementDeactivate = OverlayMsgElement<'deactivate'>

/** @public */
export type OverlayMsgElementClick = OverlayMsgElement<'click'> & {
  sanity: SanityNode | SanityStegaNode
}

/** @public */
export type OverlayMsgElementMouseEnter = OverlayMsgElement<'mouseenter'> & {
  rect: OverlayRect
}

/** @public */
export type OverlayMsgElementMouseLeave = OverlayMsgElement<'mouseleave'>

/** @public */
export type OverlayMsgElementRegister = OverlayMsgElement<'register'> & {
  sanity: SanityNode | SanityStegaNode
  rect: OverlayRect
  dragDisabled: boolean
}

/** @public */
export type OverlayMsgElementUpdate = OverlayMsgElement<'update'> & {
  sanity: SanityNode | SanityStegaNode
  rect: OverlayRect
}

/** @public */
export type OverlayMsgElementUnregister = OverlayMsgElement<'unregister'>

/** @public */
export type OverlayMsgElementUpdateRect = OverlayMsgElement<'updateRect'> & {
  rect: OverlayRect
}

/** @public */
export type OverlayMsgDragUpdateInsertPosition = Msg<'overlay/dragUpdateInsertPosition'> & {
  insertPosition: DragInsertPosition | null
}

/** @public */
export type OverlayMsgDragUpdateCursorPosition = Msg<'overlay/dragUpdateCursorPosition'> & {
  x: number
  y: number
}

/** @public */
export type OverlayMsgDragStart = Msg<'overlay/dragStart'> & {
  flow: 'horizontal' | 'vertical'
}

/** @public */
export type OverlayMsgDragToggleMinimapPrompt = Msg<'overlay/dragToggleMinimapPrompt'> & {
  display: boolean
}

/** @public */
export type OverlayMsgDragUpdateSkeleton = Msg<'overlay/dragUpdateSkeleton'> & {
  skeleton: DragSkeleton
}

/** @public */
export type OverlayMsgDragEnd = Msg<'overlay/dragEnd'> & DragEndEvent

/** @public */

export type OverlayMsgDragStartMinimapTransition = Msg<'overlay/dragStartMinimapTransition'>

/** @public */

export type OverlayMsgDragEndMinimapTransition = Msg<'overlay/dragEndMinimapTransition'>

/**
 * Controller dispatched messages
 * @public
 */
export type OverlayMsg =
  | OverlayMsgActivate
  | OverlayMsgBlur
  | OverlayMsgDeactivate
  | OverlayMsgDragEnd
  | OverlayMsgDragEndMinimapTransition
  | OverlayMsgDragStart
  | OverlayMsgDragStartMinimapTransition
  | OverlayMsgDragToggleMinimapPrompt
  | OverlayMsgDragUpdateCursorPosition
  | OverlayMsgDragUpdateInsertPosition
  | OverlayMsgDragUpdateSkeleton
  | OverlayMsgElementActivate
  | OverlayMsgElementClick
  | OverlayMsgElementContextMenu
  | OverlayMsgElementDeactivate
  | OverlayMsgElementMouseEnter
  | OverlayMsgElementMouseLeave
  | OverlayMsgElementRegister
  | OverlayMsgElementUnregister
  | OverlayMsgElementUpdate
  | OverlayMsgElementUpdateRect

/**
 * Callback function used for handling dispatched controller messages
 * @public
 */
export type OverlayEventHandler = (message: OverlayMsg) => void

/**
 * Options passed when instantiating an overlay controller
 * @public
 */
export interface OverlayOptions {
  handler: OverlayEventHandler
  overlayElement: HTMLElement
  inFrame: boolean
}

/**
 * Object returned by a controller instantiation
 * @public
 */
export interface OverlayController {
  activate: () => void
  deactivate: () => void
  destroy: () => void
}

/**
 * Element focus state
 * @public
 */
export type ElementFocusedState = 'clicked' | 'duplicate' | boolean

/**
 * Element state for consuming applications
 * @public
 */
export interface ElementState {
  id: string
  activated: boolean
  focused: ElementFocusedState
  hovered: boolean
  rect: OverlayRect
  sanity: SanityNode | SanityStegaNode
  dragDisabled: boolean
}

/**
 *
 * @public
 */
export type HistoryAdapterNavigate = (update: HistoryUpdate) => void

/**
 *
 * @public
 */
export interface HistoryAdapter {
  subscribe: (navigate: HistoryAdapterNavigate) => () => void
  update: (update: HistoryUpdate) => void
}

/**
 * An element that is safe to parse
 * @internal
 */
export type ElementNode = HTMLElement | SVGElement

/**
 * Object returned by node traversal
 * @internal
 */
export interface SanityNodeElements {
  element: ElementNode
  measureElement: ElementNode
}
/**
 * Object returned by node traversal
 * @internal
 */
export interface ResolvedElement {
  elements: SanityNodeElements
  sanity: SanityNode | SanityStegaNode
}

/**
 * Element data stored in controller state
 * @internal
 */
export interface OverlayElement {
  id: string
  elements: SanityNodeElements
  handlers: EventHandlers
  sanity: SanityNode | SanityStegaNode
}

/**
 * Event handlers attached to each element
 * @internal
 */
export interface EventHandlers {
  click: (event: MouseEvent) => void
  contextmenu: (event: MouseEvent) => void
  mousedown: (event: MouseEvent) => void
  mouseenter: (event: MouseEvent) => void
  mouseleave: (event: MouseEvent) => void
  mousemove: (event: MouseEvent) => void
}

/**
 * @internal
 */
export type VisualEditingNode = Node<VisualEditingControllerMsg, VisualEditingNodeMsg>

/**
 * Cleanup function used when e.g. unmounting
 * @public
 */
export type DisableVisualEditing = () => void

/**
 * @public
 */
export interface VisualEditingOptions {
  /**
   * The history adapter is used for Sanity Presentation to navigate URLs in the preview frame.
   */
  history?: HistoryAdapter
  /**
   * The refresh API allows smarter refresh logic than the default `location.reload()` behavior.
   */
  refresh?: (payload: HistoryRefresh) => false | Promise<void>
  /**
   * The CSS z-index on the root node that renders overlays, tweak it accordingly to what layout you have.
   */
  zIndex?: string | number
}

export interface ContextMenuProps {
  node: SanityNode
  onDismiss: () => void
  position: {
    x: number
    y: number
  }
}

/**
 * @internal
 */
export interface ContextMenuActionNode {
  type: 'action'
  icon?: ReactElement | ComponentType
  label: string
  hotkeys?: string[]
  action?: () => void
}

/**
 * @internal
 */
export interface ContextMenuDividerNode {
  type: 'divider'
}

/**
 * @internal
 */
export interface ContextMenuGroupNode {
  type: 'group'
  icon?: ReactElement | ComponentType
  label: string
  items: ContextMenuNode[]
}

/**
 * @internal
 */
export type ContextMenuNode = ContextMenuDividerNode | ContextMenuActionNode | ContextMenuGroupNode
