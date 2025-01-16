export type {
  ElementNode,
  HistoryAdapter,
  HistoryAdapterNavigate,
  HistoryRefresh,
  HistoryUpdate,
  OverlayComponent,
  OverlayComponentProps,
  OverlayComponentResolver,
  OverlayComponentResolverContext,
  OverlayElementField,
  OverlayElementParent,
  SanityNode,
  VisualEditingOptions,
  VisualEditingNode,
} from '../types'
export {VisualEditing} from '../ui/VisualEditing'
export {
  type DocumentSchema,
  type PreviewSnapshot,
  type ResolvedSchemaTypeMap,
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
  type SchemaType,
  type SchemaUnionNode,
  type SchemaUnionNodeOptions,
  type SchemaUnionOption,
  type SchemaUnknownNode,
  type Serializable,
  type SerializableArray,
  type SerializableObject,
  type SerializablePrimitive,
  type TypeSchema,
  type UnresolvedPath,
  type VisualEditingControllerMsg,
  type VisualEditingNodeMsg,
} from '@sanity/presentation-comlink'
export {
  createDataAttribute,
  type CreateDataAttribute,
  type CreateDataAttributeProps,
  type WithRequired,
  type SanityStegaNode,
} from '@sanity/visual-editing-csm'
export {createDocumentMutator} from '../optimistic/state/documentMutator'
export {
  createDatasetMutator,
  type DatasetMutatorMachineInput,
} from '../optimistic/state/datasetMutator'
export {emptyActor, type MutatorActor, type EmptyActor} from '../optimistic/context'
export type {
  DocumentsGet,
  DocumentsMutate,
  OptimisticDocument,
  OptimisticDocumentPatches,
  OptimisticReducer,
  OptimisticReducerAction,
  Path,
  PathValue,
} from '../optimistic/types'
export {useOptimistic} from './useOptimistic'
export {useOptimisticActor} from './useOptimisticActor'
export {useDocuments} from './useDocuments'
