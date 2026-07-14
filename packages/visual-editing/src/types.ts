import type {ClientPerspective} from '@sanity/client'
import type {Node} from '@sanity/comlink'
import type {
  DocumentSchema,
  HistoryRefresh,
  HistoryUpdate,
  SanityNode,
  SanityStegaNode,
  SchemaArrayItem,
  SchemaNode,
  SchemaObjectField,
  SchemaUnionNode,
  SchemaUnionOption,
  VisualEditingControllerMsg,
  VisualEditingNodeMsg,
} from '@sanity/presentation-comlink'
import type {
  ComponentType,
  FunctionComponent,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react'

import type {TelemetryContextValue, TelemetryEventNames} from './ui/telemetry/TelemetryContext'

export type {
  HistoryRefresh,
  HistoryUpdate,
  SanityNode,
  SanityStegaNode,
} from '@sanity/presentation-comlink'

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
  dragGroup: string | null
  flow: string
  preventInsertDefault: boolean
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
  maxWidth: number
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
export type OverlayMsgSetCursor = Msg<'overlay/setCursor'> & {
  element: ElementNode
  cursor: string | undefined
}

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
  element: ElementNode
  sanity: SanityNode | SanityStegaNode
  rect: OverlayRect
  dragDisabled: boolean
  targets: ElementChildTarget[]
  elementType: 'element' | 'group'
}

/** @public */
export type OverlayMsgElementUpdate = OverlayMsgElement<'update'> & {
  sanity: SanityNode | SanityStegaNode
  rect: OverlayRect
  targets: ElementChildTarget[]
  elementType: 'element' | 'group'
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
export type OverlayMsgDragToggleMinimap = Msg<'overlay/dragToggleMinimap'> & {
  display: boolean
}

/** @public */
export type OverlayMsgDragUpdateSkeleton = Msg<'overlay/dragUpdateSkeleton'> & {
  skeleton: DragSkeleton
}

/** @public */
export type OverlayMsgDragEnd = Msg<'overlay/dragEnd'> & DragEndEvent

/** @public */
export type OverlayMsgDragUpdateGroupRect = Msg<'overlay/dragUpdateGroupRect'> & {
  groupRect: OverlayRect | null
}

/** @public */
export type OverlayMsgDragStartMinimapTransition = Msg<'overlay/dragStartMinimapTransition'>

/** @public */
export type OverlayMsgDragEndMinimapTransition = Msg<'overlay/dragEndMinimapTransition'>

/** @public */
export type OverlayMsgResetMouseState = Msg<'overlay/reset-mouse-state'>

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
  | OverlayMsgDragToggleMinimap
  | OverlayMsgDragToggleMinimapPrompt
  | OverlayMsgDragUpdateCursorPosition
  | OverlayMsgDragUpdateGroupRect
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
  | OverlayMsgSetCursor
  | OverlayMsgResetMouseState

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
  inPopUp: boolean
  optimisticActorReady: boolean
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
  element: ElementNode
  focused: ElementFocusedState
  hovered: boolean
  rect: OverlayRect
  sanity: SanityNode | SanityStegaNode
  dragDisabled: boolean
  targets: ElementChildTarget[]
  elementType: 'element' | 'group'
}

/**
 * @public
 */
export interface ElementChildTarget {
  sanity: SanityNode | SanityStegaNode
  element: ElementNode
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
 * Type used by node traversal
 * @internal
 */
export type ResolvedElementReason =
  | 'edit-target'
  | 'stega-text'
  | 'stega-attribute'
  | 'data-attribute'

/**
 * Object returned by node traversal
 * @internal
 */
export interface ResolvingElement {
  elements: SanityNodeElements
  sanity: SanityNode | SanityStegaNode
  reason: ResolvedElementReason
  preventGrouping?: boolean
}
/**
 * @internal
 */
export interface ResolvedElementTarget {
  sanity: SanityNode | SanityStegaNode
  elements: SanityNodeElements
  reason: ResolvedElementReason
}
/**
 * Object returned by node traversal
 * @internal
 */
export interface ResolvedElement {
  /**
   * The HTML element that the visual overlay should be attached to
   */
  elements: SanityNodeElements
  /**
   * Attempted common sanity node data, may be the first target's sanity node if no common node is found
   */
  commonSanity?: SanityNode | SanityStegaNode
  /**
   * Sanity nodes for the visual overlay, can contain multiple if a group
   */
  targets: ResolvedElementTarget[]
  /**
   * The type of the visual overlay
   */
  type: 'element' | 'group'
}

/**
 * Element data stored in controller state
 * @internal
 */
export interface OverlayElement {
  type: 'element' | 'group'
  id: string
  elements: SanityNodeElements
  handlers: EventHandlers
  sanity?: SanityNode | SanityStegaNode
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
export type VisualEditingNode = Node<VisualEditingNodeMsg, VisualEditingControllerMsg>

/**
 * Cleanup function used when e.g. unmounting
 * @public
 */
export type DisableVisualEditing = () => void

/**
 * @public
 */
export interface OverlayComponentResolverContext<
  P extends OverlayElementParent = OverlayElementParent,
> {
  /**
   * The resolved field's document schema type
   */
  document: DocumentSchema
  /**
   * The element node that the overlay is attached to
   */
  element: ElementNode
  /**
   * The element node that the Sanity node data is detected on
   */
  targetElement: ElementNode
  /**
   * The resolved field schema type
   */
  field: OverlayElementField
  /**
   * Whether the overlay is focused or not
   */
  focused: boolean
  /**
   * The Sanity node data that triggered the overlay
   */
  node: SanityNode
  /**
   * The resolved field's parent schema type
   */
  parent: P
  /**
   * A convience property, equal to `field.value.type`
   */
  type: string
}

/**
 * @public
 */
export type OverlayComponentResolver<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends OverlayComponent = OverlayComponent<Record<string, unknown>, any>,
> = (
  context: OverlayComponentResolverContext,
) =>
  | T
  | {component: T; props?: Record<string, unknown>}
  | Array<T | {component: T; props?: Record<string, unknown>}>
  | ReactElement
  | undefined
  | void

/** @public  */
export interface OverlayPluginDefinitionBase {
  name: string
  title?: string
  icon?: ComponentType
  guard?: (context: OverlayComponentResolverContext) => boolean
}

/** @public  */
export interface OverlayPluginExclusiveDefinition extends OverlayPluginDefinitionBase {
  type: 'exclusive'
  component?: OverlayPluginComponent<
    Record<string, unknown> & {closeExclusiveView: () => void},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >
}
/** @public  */
export interface OverlayPluginHudDefinition extends OverlayPluginDefinitionBase {
  type: 'hud'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: OverlayPluginComponent<Record<string, unknown>, any>
}

/** @public  */
export type OverlayPluginDefinition = OverlayPluginExclusiveDefinition | OverlayPluginHudDefinition

/**
 * A report of a stega payload found somewhere it will always cause a bug or unnecessary bloat.
 * Reports are produced when the `onSuspiciousStega` callback is provided to Visual Editing.
 * @public
 */
export interface SuspiciousStegaReport {
  /**
   * Where the stega payload was found:
   * - `attribute` — in an element attribute where stega always causes problems, such as `class`
   *   (selectors no longer match), `id` (broken anchors and `getElementById`), `href`/`src` and
   *   other URL attributes (the invisible characters end up percent-encoded in requests),
   *   `style`, `name`, `value` or `data-*` attributes (broken equality checks).
   * - `head` — anywhere inside `<head>`, e.g. `<title>` or `meta[content]`. Content in `<head>`
   *   is never rendered, so the payload is pure bloat and corrupts SEO/social metadata.
   * - `script` — inside a `<script>` element, e.g. JSON-LD or embedded state.
   * - `style` — inside a `<style>` element, breaking selectors or values.
   * - `form-value` — in a form field value (e.g. `<textarea>` content), where it would be
   *   submitted along with user input.
   * - `url` — in the page URL itself, meaning the page was reached through a link that had
   *   stega encoded into it.
   */
  kind: 'attribute' | 'head' | 'script' | 'style' | 'form-value' | 'url'
  /**
   * The element the stega payload was found on or in. Undefined for `url` reports.
   */
  element?: Element
  /**
   * The name of the attribute containing the stega payload, if it was found in an attribute.
   */
  attribute?: string
  /**
   * The raw value containing the stega payload.
   */
  value: string
  /**
   * The value with the stega payload stripped — what the value should have been. Apply
   * `stegaClean` from `@sanity/client/stega` to the source value to fix the issue.
   */
  cleaned: string
  /**
   * The decoded edit info, if the payload could be decoded. Points to the document and field
   * that produced the value.
   */
  sanity?: SanityNode | SanityStegaNode
}

/**
 * @public
 */
export interface VisualEditingOptions {
  /**
   * @alpha
   * This API is unstable and could change at any time.
   */
  plugins?: OverlayPluginDefinition[]
  /**
   * @alpha
   * This API is unstable and could change at any time.
   */
  components?: OverlayComponentResolver
  /**
   * The history adapter is used for Sanity Presentation to navigate URLs in the preview frame.
   */
  history?: HistoryAdapter
  /**
   * While Visual Editing is enabled, stega-encoded metadata (invisible characters) is
   * automatically stripped from clipboard data when content is copied from the page, so copied
   * text can be pasted into other tools without the hidden characters tagging along.
   * Set this option to `true` to opt out and keep stega in copied content.
   */
  keepStegaOnCopy?: boolean
  /**
   * This event can be used to make sure server side data fetching uses the same client perspective as the Sanity Studio that is driving the visual editing.
   */
  onPerspectiveChange?: (perspective: ClientPerspective) => void
  /**
   * Reports stega payloads found in places where they always cause bugs or bloat, such as
   * `class`, `href`, `src`, `id` and other attributes, inside `<head>` (e.g. `<title>`),
   * `<script>` or `<style>` contents, form values, or the page URL.
   * Providing the callback opts in to the detection logic — when it isn't provided no scanning
   * runs. Reports are deduped and batched, and include the decoded edit info when available so
   * the source field can be tracked down and cleaned with `stegaClean` from
   * `@sanity/client/stega`.
   */
  onSuspiciousStega?: (reports: SuspiciousStegaReport[]) => void
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
  icon?: React.JSX.Element | React.ComponentType
  label: string
  hotkeys?: string[]
  action?: () => void
  telemetryEvent: TelemetryEventNames
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
  icon?: React.JSX.Element | React.ComponentType
  label: string
  items: ContextMenuNode[]
}

/**
 * @internal
 */
export interface ContextMenuCustomNode {
  type: 'custom'
  component: ComponentType<{
    boundaryElement: HTMLDivElement | null
    sendTelemetry: TelemetryContextValue
  }>
}

/**
 * @internal
 */
export type ContextMenuNode =
  | ContextMenuDividerNode
  | ContextMenuActionNode
  | ContextMenuGroupNode
  | ContextMenuCustomNode

/**
 * @public
 */
export interface OverlayComponentProps<
  P extends OverlayElementParent = OverlayElementParent,
> extends OverlayComponentResolverContext<P> {
  PointerEvents: FunctionComponent<PropsWithChildren<HTMLAttributes<HTMLDivElement>>>
}

/**
 * @public
 */
export type OverlayComponent<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends OverlayElementParent = OverlayElementParent,
> = ComponentType<OverlayComponentProps<P | undefined> & T>

/**
 * @public
 */
export type OverlayPluginComponent<
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends OverlayElementParent = OverlayElementParent,
> = ComponentType<OverlayComponentResolverContext<P | undefined> & T>

export type OverlayElementField =
  | SchemaArrayItem
  | SchemaObjectField
  | SchemaUnionOption
  | undefined

export type OverlayElementParent =
  | DocumentSchema
  | SchemaNode
  | SchemaArrayItem
  | SchemaUnionOption
  | SchemaUnionNode
  | undefined
