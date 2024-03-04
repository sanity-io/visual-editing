import { ChannelsNode } from '@sanity/channels'
import type {
  HistoryUpdate,
  OverlayMsg as OverlayChannelsMsg,
  PresentationMsg,
  SanityNode,
  SanityStegaNode,
  VisualEditingMsg,
} from '@sanity/visual-editing-helpers'

export type {
  DisableVisualEditing,
  VisualEditingOptions,
} from './ui/enableVisualEditing'
export type {
  HistoryRefresh,
  HistoryUpdate,
  SanityNode,
  SanityStegaNode,
} from '@sanity/visual-editing-helpers'

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
export interface OverlayMsgElement<T extends string>
  extends Msg<`element/${T}`> {
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
 * Object returned by node traversal
 * @internal
 */
export interface _SanityNodeElements {
  element: HTMLElement
  measureElement: HTMLElement
}
/**
 * Object returned by node traversal
 * @internal
 */
export interface _ResolvedElement {
  elements: _SanityNodeElements
  sanity: SanityNode | SanityStegaNode
}

/**
 * Element data stored in controller state
 * @internal
 */
export interface _OverlayElement {
  id: string
  elements: _SanityNodeElements
  handlers: _EventHandlers
  sanity: SanityNode | SanityStegaNode
}

/**
 * Event handlers attached to each element
 * @internal
 */
export interface _EventHandlers {
  click: (event: MouseEvent) => void
  mousedown: (event: MouseEvent) => void
  mouseenter: (event: MouseEvent) => void
  mouseleave: (event: MouseEvent) => void
  mousemove: (event: MouseEvent) => void
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
