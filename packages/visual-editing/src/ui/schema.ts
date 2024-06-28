import type {
  DocumentSchema,
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

type FieldReturnType = SchemaArrayItem | SchemaObjectField | SchemaUnionOption | undefined
type ParentReturnType =
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
  resolvedTypes?: Map<string, Map<string, string>>,
): {
  field: FieldReturnType
  parent: ParentReturnType
} {
  if (!isSanityNode(node) || !schemaType)
    return {
      field: undefined,
      parent: undefined,
    }
  const nodePath = node.path
    .split('.')
    .map((part) => {
      if (part.includes('[_key==')) {
        const unionType = resolvedTypes?.get(node.id)?.get(part)
        return [part.split('[')[0], unionType].join('.')
      }
      return part
    })
    .join('.')
  return fieldFromPath(schemaType, nodePath.split('.'), undefined)
}

export function fieldFromPath(
  schemaType: ParentReturnType,
  path: string[],
  parent: ParentReturnType,
): {
  field: FieldReturnType
  parent: ParentReturnType
} {
  if (!schemaType) {
    return {field: undefined, parent: undefined}
  }
  const [next, ...rest] = path
  if ('fields' in schemaType) {
    const objectField = schemaType.fields[next]
    if (!rest.length) return {field: objectField, parent}
    return fieldFromPath(objectField.value, rest, schemaType)
  } else if (schemaType.type === 'array') {
    return fieldFromPath(schemaType.of, path, schemaType)
  } else if (schemaType.type === 'arrayItem') {
    return fieldFromPath(schemaType.value, rest, schemaType)
  } else if (schemaType.type === 'union') {
    return fieldFromPath(
      schemaType.of.find((item) => (item.type === 'unionOption' ? item.name === next : item)),
      rest,
      schemaType,
    )
  } else if (schemaType.type === 'unionOption') {
    if (!next) return {field: schemaType, parent}
    return fieldFromPath(schemaType.value, path, schemaType)
  }
  throw new Error('@TODO Something went wrong here...')
}
