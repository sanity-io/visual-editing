import {isArray, type SchemaTypeDefinition} from 'sanity'

export function defineSchema(options: SchemaTypeDefinition[]): {
  types: SchemaTypeDefinition[]
} {
  if (isArray(options)) return {types: options}

  return options
}
