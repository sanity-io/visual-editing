import type {ChannelsNode} from '@repo/channels'
import type {
  HistoryRefresh,
  HistoryUpdate,
  OverlayMsg as OverlayChannelsMsg,
  PresentationMsg,
  SanityNode,
  SanityStegaNode,
  VisualEditingMsg,
} from '@repo/visual-editing-helpers'

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
export type OverlayMsgElementActivate = OverlayMsgElement<'activate'> & {
  sanity: SanityNode | SanityStegaNode
  rect: OverlayRect
}

/** @public */
export type OverlayMsgBlur = Msg<'overlay/blur'>

/** @public */
export type OverlayMsgActivate = Msg<'overlay/activate'>

/** @public */
export type OverlayMsgDeactivate = Msg<'overlay/deactivate'>

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
export type OverlayMsgElementUnregister = OverlayMsgElement<'unregister'>

/** @public */
export type OverlayMsgElementUpdateRect = OverlayMsgElement<'updateRect'> & {
  rect: OverlayRect
}

/**
 * Controller dispatched messages
 * @public
 */
export type OverlayMsg =
  | OverlayMsgBlur
  | OverlayMsgActivate
  | OverlayMsgDeactivate
  | OverlayMsgElementActivate
  | OverlayMsgElementClick
  | OverlayMsgElementDeactivate
  | OverlayMsgElementMouseEnter
  | OverlayMsgElementMouseLeave
  | OverlayMsgElementRegister
  | OverlayMsgElementUnregister
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
  click: (event: Event) => void
  mousedown: (event: Event) => void
  mouseenter: (event: Event) => void
  mouseleave: (event: Event) => void
  mousemove: (event: Event) => void
}

/**
 * @internal
 */
export type VisualEditingChannelSends = OverlayChannelsMsg | VisualEditingMsg

/**
 * @internal
 */
export type VisualEditingChannelReceives = PresentationMsg

/**
 * @internal
 */
export type VisualEditingChannel = ChannelsNode<
  VisualEditingChannelSends,
  VisualEditingChannelReceives
>

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
