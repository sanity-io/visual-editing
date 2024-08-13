import type {ResolvedSchemaTypeMap, SchemaType} from '@repo/visual-editing-helpers'
import {createContext} from 'react'

export interface SchemaContextValue {
  resolvedTypes: ResolvedSchemaTypeMap
  schema: SchemaType[]
}

export const SchemaContext = createContext<SchemaContextValue | null>(null)
