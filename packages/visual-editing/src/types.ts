import type {
  HistoryRefresh,
  HistoryUpdate,
  SanityNode,
  SanityStegaNode,
} from '@repo/visual-editing-helpers'
import type {Operation} from '@sanity/mutate'

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
export interface DragInsertPosition {
  top?: OverlayRect | null
  left?: OverlayRect | null
  bottom?: OverlayRect | null
  right?: OverlayRect | null
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
      sanity: SanityNode | SanityStegaNode
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
export type OverlayMsgUpdateDragInsertPosition = Msg<'overlay/updateDragInsertPosition'> & {
  insertPosition: {
    top?: {rect: OverlayRect; sanity: SanityNode} | null
    left?: {rect: OverlayRect; sanity: SanityNode} | null
    bottom?: {rect: OverlayRect; sanity: SanityNode} | null
    right?: {rect: OverlayRect; sanity: SanityNode} | null
  } | null
}

/** @public */
export type OverlayMsgUpdateDragCursorPosition = Msg<'overlay/updateDragCursorPosition'> & {
  x: number
  y: number
}

/**
 * Controller dispatched messages
 * @public
 */
export type OverlayMsg =
  | OverlayMsgActivate
  | OverlayMsgBlur
  | OverlayMsgDeactivate
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
  | OverlayMsgUpdateDragInsertPosition
  | OverlayMsgUpdateDragCursorPosition

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
  preventDefault: boolean
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
 * Cleanup function used when e.g. unmounting
 * @public
 */
export type DisableVisualEditing = () => void

/**
 * @public
 */
export type VisualEditingOverlayComponent<T = Record<string, unknown>> = React.ComponentType<{
  commit: () => void
  node: SanityNode
  mutate: (
    operation: Operation,
    options: {
      commit?: boolean
      id?: string
      path?: string | string[]
      type?: string
    },
  ) => void
  value: T | undefined
}>

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
  /**
   * @alpha
   */
  components?: {
    type: string
    name?: string
    path?: string
    component: VisualEditingOverlayComponent
  }[]
}
