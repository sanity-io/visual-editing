export interface DocumentSchema {
  type: 'document'
  name: string
  title?: string
  icon?: string
  fields: Record<string, SchemaObjectField>
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
  of: SchemaArrayItem<T> | SchemaUnionNode<T>
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
  fields: Record<string, SchemaObjectField<T>>
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

export interface SchemaUnionNode<T extends SchemaNode = SchemaNode> {
  type: 'union'
  of: SchemaUnionOption<T>[] | SchemaStringNode[] | SchemaNumberNode[]
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
