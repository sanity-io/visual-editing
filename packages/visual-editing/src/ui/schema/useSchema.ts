import {useContext} from 'react'
import {SchemaContext, type SchemaContextValue} from './SchemaContext'

export function useSchema(): SchemaContextValue {
  const context = useContext(SchemaContext)

  if (!context) {
    throw new Error('Schema context is missing')
  }

  return context
}
