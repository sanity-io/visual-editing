import type {StudioPathLike} from '@sanity/client/csm'
import type {ArrayOptions, PreviewValue} from '@sanity/types'

/**
 * Counterpart of the `InsertMenuOptions` type exported by `@sanity/types`,
 * which powers `ArrayOptions['insertMenu']` in studio schemas. The two must be
 * kept in sync. It is defined locally here because `@sanity/types` is an
 * optional peer dependency of this package.
 * @alpha This API may change
 */
interface InsertMenuOptions {
  /**
   * @defaultValue `'auto'`
   * `filter: 'auto'` automatically turns on filtering if there are more than 5
   * schema types added to the menu.
   */
  filter?: 'auto' | boolean | undefined
  groups?: Array<{name: string; title?: string; of?: Array<string>}> | undefined
  /** defaultValue `true` */
  showIcons?: boolean | undefined
  /** @defaultValue `[{name: 'list'}]` */
  views?:
    | Array<
        | {name: 'list'}
        | {name: 'grid'; previewImageUrl?: (schemaTypeName: string) => string | undefined}
      >
    | undefined
}

export type {InsertMenuOptions}

export type {Path} from '@sanity/client/csm'

/**
 * Data resolved from a Sanity node
 * @public
 */
export type SanityNode = {
  baseUrl: string
  id: string
  path: string
  perspective?: string
  dataset?: string
  projectId?: string
  tool?: string
  type?: string
  workspace?: string
}

/**
 * Data resolved from a Sanity Stega node
 * @public
 */
export type SanityStegaNode = {
  origin: string
  href: string
  data?: unknown
}

export interface DocumentSchema {
  type: 'document'
  name: string
  title?: string
  icon?: string
  fields: Partial<Record<string, SchemaObjectField>>
}

export interface TypeSchema {
  type: 'type'
  name: string
  title?: string
  value: SchemaNode
}

export type SchemaType = DocumentSchema | TypeSchema

export interface SchemaArrayNode<T extends SchemaNode = SchemaNode> {
  type: 'array'
  of: SchemaArrayItem<T>
}

export interface SchemaArrayItem<T extends SchemaNode = SchemaNode> {
  type: 'arrayItem'
  name: string
  title?: string
  value: T
}

export interface SchemaBooleanNode {
  type: 'boolean'
  value?: boolean
}

export interface SchemaInlineNode {
  type: 'inline'
  /** the name of the referenced type */
  name: string
}

export interface SchemaNullNode {
  type: 'null'
}

export interface SchemaNumberNode {
  type: 'number'
  value?: number
}

export interface SchemaObjectNode<T extends SchemaNode = SchemaNode> {
  type: 'object'
  fields: Partial<Record<string, SchemaObjectField<T>>>
  rest?: SchemaObjectNode | SchemaUnknownNode | SchemaInlineNode
  dereferencesTo?: string
}

export interface SchemaObjectField<T extends SchemaNode = SchemaNode> {
  type: 'objectField'
  name: string
  title?: string
  value: T
  optional?: boolean
}

export interface SchemaStringNode {
  type: 'string'
  value?: string
}

export type SchemaUnionNodeOptions = Omit<ArrayOptions, 'insertMenu'> & {
  insertMenu?: Omit<InsertMenuOptions, 'views'> & {
    views?: Array<
      | {
          name: 'list'
        }
      | {
          name: 'grid'
          previewImageUrls?: Record<string, string | undefined>
        }
    >
  }
}
export interface SchemaUnionNode<T extends SchemaNode = SchemaNode> {
  type: 'union'
  of: SchemaUnionOption<T>[] | SchemaStringNode[] | SchemaNumberNode[]
  options?: SchemaUnionNodeOptions
}

export interface SchemaUnionOption<T extends SchemaNode = SchemaNode> {
  type: 'unionOption'
  name: string
  title?: string
  icon?: string
  value: T
}

export interface SchemaUnknownNode {
  type: 'unknown'
}

export type SchemaNode =
  | SchemaArrayNode
  | SchemaBooleanNode
  | SchemaInlineNode
  | SchemaNullNode
  | SchemaNumberNode
  | SchemaObjectNode
  | SchemaStringNode
  | SchemaUnionNode
  | SchemaUnknownNode

export type ResolvedSchemaTypeMap = Map<string, Map<string, StudioPathLike>>

export interface UnresolvedPath {
  id: string
  path: string
}

/**
 * @public
 */
export type PreviewSnapshot = {
  // Explicitly exclude media, as it's not serializable
  [K in keyof Omit<PreviewValue, 'media'>]?: Omit<PreviewValue, 'media'>[K]
} & {
  _id: string
}
