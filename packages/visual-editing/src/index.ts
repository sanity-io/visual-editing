import type {DatasetMutatorMachineInput as DatasetMutatorMachineInputDeprecated} from './optimistic/state/datasetMutator'
import type {
  DocumentsGet as DocumentsGetDeprecated,
  DocumentsMutate as DocumentsMutateDeprecated,
  OptimisticDocument as OptimisticDocumentDeprecated,
  OptimisticDocumentPatches as OptimisticDocumentPatchesDeprecated,
  OptimisticReducerAction as OptimisticReducerActionDeprecated,
  OptimisticReducer as OptimisticReducerDeprecated,
  Path as PathDeprecated,
  PathValue as PathValueDeprecated,
} from './optimistic/types'
import {useDocuments as useDocumentsDeprecated} from './react/useDocuments'
import {useOptimistic as useOptimisticDeprecated} from './react/useOptimistic'

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
  type WithRequired,
  createDataAttribute,
} from '@sanity/visual-editing-csm'
export {
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
} from '@sanity/presentation-comlink'
export {getArrayItemKeyAndParentPath} from './util/mutations'

/**
 * @public
 * @deprecated Use `import {useDocuments} from '@sanity/visual-editing/react'` instead
 */
export const useDocuments = useDocumentsDeprecated
/**
 * @public
 * @deprecated Use `import {useOptimistic} from '@sanity/visual-editing/react'` instead
 */
export const useOptimistic = useOptimisticDeprecated
/**
 * @public
 * @deprecated Use `import type {DatasetMutatorMachineInput} from '@sanity/visual-editing/optimistic'` instead
 */
export type DatasetMutatorMachineInput = DatasetMutatorMachineInputDeprecated
/**
 * @public
 * @deprecated Use `import type {DocumentsGet} from '@sanity/visual-editing/optimistic'` instead
 */
export type DocumentsGet = DocumentsGetDeprecated
/**
 * @public
 * @deprecated Use `import type {DocumentsMutate} from '@sanity/visual-editing/optimistic'` instead
 */
export type DocumentsMutate = DocumentsMutateDeprecated
/**
 * @public
 * @deprecated Use `import type {OptimisticDocument} from '@sanity/visual-editing/optimistic'` instead
 */
export type OptimisticDocument = OptimisticDocumentDeprecated
/**
 * @public
 * @deprecated Use `import type {OptimisticDocumentPatches} from '@sanity/visual-editing/optimistic'` instead
 */
export type OptimisticDocumentPatches = OptimisticDocumentPatchesDeprecated
/**
 * @public
 * @deprecated Use `import type {OptimisticReducer} from '@sanity/visual-editing/optimistic'` instead
 */
export type OptimisticReducer<T, U> = OptimisticReducerDeprecated<T, U>
/**
 * @public
 * @deprecated Use `import type {OptimisticReducerAction} from '@sanity/visual-editing/optimistic'` instead
 */
export type OptimisticReducerAction<T> = OptimisticReducerActionDeprecated<T>
/**
 * @public
 * @deprecated Use `import type {Path} from '@sanity/visual-editing/optimistic'` instead
 */
export type Path<T, K extends keyof T> = PathDeprecated<T, K>
/**
 * @public
 * @deprecated Use `import type {PathValue} from '@sanity/visual-editing/optimistic'` instead
 */
export type PathValue<T, P extends string> = PathValueDeprecated<T, P>
/**
 * @internal
 * @deprecated - do not use
 */
export type {
  useDocumentsDeprecated,
  useOptimisticDeprecated,
  DatasetMutatorMachineInputDeprecated,
  DocumentsGetDeprecated,
  DocumentsMutateDeprecated,
  OptimisticDocumentDeprecated,
  OptimisticDocumentPatchesDeprecated,
  OptimisticReducerDeprecated,
  OptimisticReducerActionDeprecated,
  PathDeprecated,
  PathValueDeprecated,
}
