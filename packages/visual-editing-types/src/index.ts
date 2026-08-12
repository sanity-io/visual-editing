import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
  ResponseQueryOptions,
} from '@sanity/client'
import type {StudioPathLike} from '@sanity/client/csm'
import type {InitializedStegaConfig, StegaConfig} from '@sanity/client/stega'
import type {ArrayOptions, InsertMenuOptions, PreviewValue} from '@sanity/types'

export type {InsertMenuOptions}

export type {Path} from '@sanity/client/csm'

/**
 * The subset of `@sanity/client` configuration that loaders reconfigure clients with.
 * @public
 */
export interface SanityClientLikeConfig {
  allowReconfigure?: boolean
  apiVersion?: string
  perspective?: ClientPerspective
  resultSourceMap?: boolean | 'withKeyArraySelector'
  stega?: StegaConfig | boolean
  useCdn?: boolean
}

/**
 * The subset of `@sanity/client` query options that loaders pass to `fetch`.
 * @public
 */
export type SanityClientLikeQueryOptions = Pick<
  ResponseQueryOptions,
  | 'cache'
  | 'headers'
  | 'next'
  | 'perspective'
  | 'resultSourceMap'
  | 'stega'
  | 'tag'
  | 'useCdn'
  | 'variant'
>

/**
 * A structural subset of `SanityClient` describing only what loaders need: reading the
 * configuration, cloning with a new configuration, and running queries.
 *
 * Prefer this over `SanityClient` in public options. `SanityClient` declares a `#private`
 * field, which makes it nominal rather than structural, so a client is only assignable to it
 * if it comes from the exact same copy of `@sanity/client`. Any duplicate install fails to
 * typecheck, even at the same version, and so does passing a client from a different major.
 *
 * Satisfied by clients from `@sanity/client`, `@sanity/client/stega`,
 * `@sanity/preview-kit/client` and `next-sanity`, across versions.
 * @public
 */
export interface SanityClientLike {
  config(): {
    dataset?: string
    perspective?: ClientPerspective
    projectId?: string
    stega: InitializedStegaConfig
    token?: string
    useCdn: boolean
  }
  withConfig(config: SanityClientLikeConfig): SanityClientLike
  /**
   * `R` defaults to `any` to match `SanityClient['fetch']`, where the same default lets callers
   * pass the result straight into a generic position. Defaulting to `unknown` instead would be
   * stricter than the client it stands in for, and callers cannot always name the type.
   */
  fetch<R = any>(
    query: string,
    params?: QueryParams,
    options?: SanityClientLikeQueryOptions & {filterResponse?: true},
  ): Promise<R>
  fetch<R = any>(
    query: string,
    params: QueryParams,
    options: SanityClientLikeQueryOptions & {filterResponse: false},
  ): Promise<{result: R; resultSourceMap?: ContentSourceMap}>
}

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
