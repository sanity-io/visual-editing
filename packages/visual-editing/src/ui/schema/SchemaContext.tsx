import type {
  DocumentSchema,
  SanityNode,
  SanityStegaNode,
  TypeSchema,
} from '@sanity/presentation-comlink'
import {createContext} from 'react'
import type {OverlayElementField, OverlayElementParent} from '../../types'

export interface SchemaContextValue {
  getField: (node: SanityNode | SanityStegaNode) => {
    field: OverlayElementField
    parent: OverlayElementParent
  }
  getType: <T extends 'document' | 'type' = 'document'>(
    node: SanityNode | SanityStegaNode | string,
    type?: T,
  ) => T extends 'document' ? DocumentSchema | undefined : TypeSchema | undefined
}

export const SchemaContext = createContext<SchemaContextValue | null>(null)
