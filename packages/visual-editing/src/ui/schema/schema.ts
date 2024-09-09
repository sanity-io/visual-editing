import type {
  DocumentSchema,
  ResolvedSchemaTypeMap,
  SanityNode,
  SanityStegaNode,
  SchemaArrayItem,
  SchemaNode,
  SchemaObjectField,
  SchemaType,
  SchemaUnionOption,
} from '@repo/visual-editing-helpers'

function isDocumentSchemaType(type: SchemaType): type is DocumentSchema {
  return type.type === 'document'
}

function isSanityNode(node: SanityNode | SanityStegaNode): node is SanityNode {
  return 'path' in node
}

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
  | undefined

export function getSchemaType(
  node: SanityNode | SanityStegaNode,
  schema: SchemaType[],
): DocumentSchema | undefined {
  if (!isSanityNode(node) || !Array.isArray(schema)) return undefined
  return schema.filter(isDocumentSchemaType).find((schemaType) => schemaType.name === node.type)
}

export function getField(
  node: SanityNode | SanityStegaNode,
  schemaType?: DocumentSchema,
  resolvedTypes?: ResolvedSchemaTypeMap,
): {
  field: OverlayElementField
  parent: OverlayElementParent
} {
  if (!isSanityNode(node) || !schemaType) {
    return {
      field: undefined,
      parent: undefined,
    }
  }

  function fieldFromPath(
    schemaType: OverlayElementParent,
    path: string[],
    parent: OverlayElementParent,
    prevPathPart?: string,
  ): {
    field: OverlayElementField
    parent: OverlayElementParent
  } {
    if (!schemaType) {
      return {field: undefined, parent: undefined}
    }

    const [next, ...rest] = path

    if ('fields' in schemaType) {
      const objectField = schemaType.fields[next]
      if (!rest.length) {
        return {field: objectField, parent}
      }
      return fieldFromPath(objectField.value, rest, schemaType, next)
    } else if (schemaType.type === 'array') {
      return fieldFromPath(schemaType.of, path, schemaType)
    } else if (schemaType.type === 'arrayItem') {
      if (!rest.length) return {field: schemaType, parent}
      return fieldFromPath(schemaType.value, rest, schemaType)
    } else if (schemaType.type === 'union') {
      const name = next.startsWith('[_key==')
        ? resolvedTypes
            ?.get((node as SanityNode).id)
            ?.get([prevPathPart, next].filter(Boolean).join(''))
        : next
      return fieldFromPath(
        schemaType.of.find((item) => (item.type === 'unionOption' ? item.name === name : item)),
        rest,
        schemaType,
      )
    } else if (schemaType.type === 'unionOption') {
      if (!next) return {field: schemaType, parent}
      return fieldFromPath(schemaType.value, path, schemaType)
    }
    // @todo error handling, ofc
    throw new Error('Something went wrong...')
  }

  const nodePath = node.path.split('.').flatMap((part) => {
    if (part.includes('[')) {
      return part.split(/(\[.+\])/, 2)
    }
    return [part]
  })
  return fieldFromPath(schemaType, nodePath, undefined)
}
