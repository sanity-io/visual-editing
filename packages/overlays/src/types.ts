/**
 * Data resolved from a Sanity node
 * @public
 */
export interface SanityNode {
  projectId: string
  dataset: string
  document: {
    id: string
    type?: string
    path: string
  }
  studio: {
    baseUrl: string
    workspace?: string
    tool?: string
  }
}

/**
 * Data resolved from a (legacy) Sanity node
 * @public
 */
export interface SanityNodeLegacy {
  origin: string
  href: string
}

/**
 * Wrappers to differentiate supported node types
 * @public
 */
export type OverlayElementSanityData =
  | {
      type: 'sanity'
      data: SanityNode
    }
  | {
      type: 'sanity-edit-info'
      data: SanityNodeLegacy
    }

/**
 * Element positioning and size, similiar to DOMRect
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
  sanity: OverlayElementSanityData
  rect: OverlayRect
}

/** @public */
export type OverlayMsgElementDeactivate = OverlayMsgElement<'deactivate'>
/** @public */
export type OverlayMsgElementEdit = OverlayMsgElement<'edit'> & {
  sanity: OverlayElementSanityData
}

/** @public */
export type OverlayMsgElementMouseEnter = OverlayMsgElement<'mouseenter'>

/** @public */
export type OverlayMsgElementMouseLeave = OverlayMsgElement<'mouseleave'>

/** @public */
export type OverlayMsgElementRegister = OverlayMsgElement<'register'> & {
  sanity: OverlayElementSanityData
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
  | OverlayMsgElementActivate
  | OverlayMsgElementDeactivate
  | OverlayMsgElementEdit
  | OverlayMsgElementMouseEnter
  | OverlayMsgElementMouseLeave
  | OverlayMsgElementRegister
  | OverlayMsgElementUnregister
  | OverlayMsgElementUpdateRect

/**
 * Callback function used for handling dispatched controller messages
 * @public
 */
export type OverlayDispatchHandler = (message: OverlayMsg) => void

/**
 * Options passed when instantiating an overlay controller
 * @public
 */
export interface OverlayOptions {
  dispatch: OverlayDispatchHandler
  overlayElement: HTMLElement
}

/**
 * Object returned by a controller instantiation
 * @public
 */
export interface OverlayController {
  destroy: () => void
  toggle: () => void
}

/**
 * Element state for consuming applications
 * @public
 */
export interface ElementState {
  id: string
  rect: OverlayRect
  sanity: OverlayElementSanityData
  hovered: boolean
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
  sanity: OverlayElementSanityData
}

/**
 * Element data stored in controller state
 * @internal
 */
export interface _OverlayElement {
  id: string
  elements: _SanityNodeElements
  handlers: _EventHandlers
  sanity: OverlayElementSanityData
}

/**
 * Event handlers attached to each element
 * @internal
 */
export interface _EventHandlers {
  click: (event: MouseEvent) => void
  mouseenter: (event: MouseEvent) => void
  mouseleave: (event: MouseEvent) => void
}
