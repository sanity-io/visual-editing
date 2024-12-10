export {createOverlayController} from './controller'
export type {
  DisableVisualEditing,
  DragEndEvent,
  DragInsertPosition,
  DragSkeleton,
  ElementFocusedState,
  ElementNode,
  ElementState,
  HistoryAdapter,
  HistoryAdapterNavigate,
  HistoryRefresh,
  HistoryUpdate,
  Msg,
  OverlayComponent,
  OverlayComponentProps,
  OverlayComponentResolver,
  OverlayComponentResolverContext,
  OverlayController,
  OverlayElementField,
  OverlayElementParent,
  OverlayEventHandler,
  OverlayMsg,
  OverlayMsgActivate,
  OverlayMsgBlur,
  OverlayMsgDeactivate,
  OverlayMsgDragEnd,
  OverlayMsgDragEndMinimapTransition,
  OverlayMsgDragStart,
  OverlayMsgDragStartMinimapTransition,
  OverlayMsgDragToggleMinimap,
  OverlayMsgDragToggleMinimapPrompt,
  OverlayMsgDragUpdateCursorPosition,
  OverlayMsgDragUpdateGroupRect,
  OverlayMsgDragUpdateInsertPosition,
  OverlayMsgDragUpdateSkeleton,
  OverlayMsgElement,
  OverlayMsgElementActivate,
  OverlayMsgElementClick,
  OverlayMsgElementContextMenu,
  OverlayMsgElementDeactivate,
  OverlayMsgElementMouseEnter,
  OverlayMsgElementMouseLeave,
  OverlayMsgElementRegister,
  OverlayMsgElementUnregister,
  OverlayMsgElementUpdate,
  OverlayMsgElementUpdateRect,
  OverlayMsgSetCursor,
  OverlayOptions,
  OverlayRect,
  SanityNode,
  SanityStegaNode,
  VisualEditingOptions,
} from './types'
export {enableVisualEditing} from './ui/enableVisualEditing'
export {useSharedState} from './ui/shared-state/useSharedState'
export {
  type CreateDataAttribute,
  type CreateDataAttributeProps,
  type DocumentSchema,
  type SchemaArrayItem,
  type SchemaArrayNode,
  type SchemaBooleanNode,
  type SchemaInlineNode,
  type SchemaNode,
  type SchemaNullNode,
  type SchemaNumberNode,
  type SchemaObjectField,
  type SchemaObjectNode,
  type SchemaStringNode,
  type SchemaUnionNode,
  type SchemaUnionNodeOptions,
  type SchemaUnionOption,
  type SchemaUnknownNode,
  type WithRequired,
  createDataAttribute,
} from '@repo/visual-editing-helpers'
export {getArrayItemKeyAndParentPath} from './util/mutations'

/**
 * Deprecated exports: React specific exports moved to `/react`. Generic
 * optimistic type exports moved to `/optimistic`.
 * @todo How can these be marked as deprecated OR remove and major?
 */
export {useDocuments} from './react/useDocuments'
export {useOptimistic} from './react/useOptimistic'
export type {DatasetMutatorMachineInput} from './optimistic/state/datasetMutator'
export type {
  DocumentsGet,
  DocumentsMutate,
  OptimisticDocument,
  OptimisticDocumentPatches,
  OptimisticReducer,
  OptimisticReducerAction,
  Path,
  PathValue,
} from './optimistic/types'
