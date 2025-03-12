import type {
  DocumentSchema,
  ResolvedSchemaTypeMap,
  SanityNode,
  SanityStegaNode,
  SchemaType,
  TypeSchema,
  UnresolvedPath,
} from '@sanity/presentation-comlink'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren,
} from 'react'
import type {
  ElementState,
  OverlayElementField,
  OverlayElementParent,
  VisualEditingNode,
} from '../../types'
import {SchemaContext, type SchemaContextValue} from './SchemaContext'

function isSanityNode(node: SanityNode | SanityStegaNode): node is SanityNode {
  return 'path' in node
}

function isDocumentSchemaType(type: SchemaType): type is DocumentSchema {
  return type.type === 'document'
}

function isTypeSchemaType(type: SchemaType): type is TypeSchema {
  return type.type === 'type'
}

function popUnkeyedPathSegments(path: string): string {
  return path
    .split('.')
    .toReversed()
    .reduce((acc, part) => {
      if (acc.length) return [part, ...acc]
      if (part.includes('[_key==')) return [part]
      return []
    }, [] as string[])
    .join('.')
}

function getPathsWithUnresolvedTypes(elements: ElementState[]): {id: string; path: string}[] {
  return elements.reduce((acc, element) => {
    const {sanity} = element
    if (!('id' in sanity)) return acc
    if (!sanity.path.includes('[_key==')) return acc
    const path = popUnkeyedPathSegments(sanity.path)
    if (!acc.find((item) => item.id === sanity.id && item.path === path)) {
      acc.push({id: sanity.id, path})
    }
    return acc
  }, [] as UnresolvedPath[])
}

export const SchemaProvider: FunctionComponent<
  PropsWithChildren<{
    comlink?: VisualEditingNode
    elements: ElementState[]
  }>
> = function (props) {
  const {comlink, children, elements} = props

  const [resolvedTypes, setResolvedTypes] = useState<ResolvedSchemaTypeMap>(new Map())

  const [schema, setSchema] = useState<SchemaType[] | null>(null)

  useEffect(() => {
    if (!comlink) return

    async function fetchSchema(signal: AbortSignal) {
      if (!comlink) return
      try {
        const response = await comlink.fetch('visual-editing/schema', undefined, {
          signal,
          suppressWarnings: true,
        })
        setSchema(response.schema)
      } catch (e) {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      }
    }
    const schemaFetch = new AbortController()
    const unsub = comlink.onStatus(() => {
      fetchSchema(schemaFetch.signal)
    }, 'connected')

    return () => {
      schemaFetch.abort()
      unsub()
    }
  }, [comlink])

  const reportedPathsRef = useRef<UnresolvedPath[]>([])
  const paths = getPathsWithUnresolvedTypes(useDeferredValue(elements))
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!paths.length || !comlink) return
    // We report a list of paths that reference array items using a _key. We need
    // to resolve the types of each of these items so we can map them to the
    // correct schema types. One day CSM might include this data for us.
    const reportPaths = async (paths: UnresolvedPath[], signal: AbortSignal) => {
      const initialReportedPaths = reportedPathsRef.current
      try {
        reportedPathsRef.current = paths
        const response = await comlink.fetch(
          'visual-editing/schema-union-types',
          {paths},
          {signal, suppressWarnings: true},
        )
        if (signal.aborted) return
        setResolvedTypes(response.types)
        controllerRef.current = null
      } catch {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      }
      if (signal.aborted) {
        reportedPathsRef.current = initialReportedPaths
      }
    }

    if (
      paths.some(
        (p) => !reportedPathsRef.current.find(({id, path}) => id === p.id && path === p.path),
      )
    ) {
      // Abort any previous requests
      controllerRef.current?.abort()
      controllerRef.current = new AbortController()
      reportPaths(paths, controllerRef.current.signal)
    }
  }, [comlink, paths])

  const getType = useCallback(
    <T extends 'document' | 'type' = 'document'>(
      node: SanityNode | SanityStegaNode | string,
      _type?: T,
    ): T extends 'document' ? DocumentSchema | undefined : TypeSchema | undefined => {
      const type = _type || 'document'
      if (
        !schema ||
        (typeof node !== 'string' && (!isSanityNode(node) || !Array.isArray(schema)))
      ) {
        return undefined
      }
      const name = typeof node === 'string' ? node : node.type
      const filter = type === 'document' ? isDocumentSchemaType : isTypeSchemaType
      return schema
        .filter(filter)
        .find((schemaType) => schemaType.name === name) as T extends 'document'
        ? DocumentSchema | undefined
        : TypeSchema | undefined
    },
    [schema],
  )

  const getField = useCallback(
    (
      node: SanityNode | SanityStegaNode,
    ): {
      field: OverlayElementField
      parent: OverlayElementParent
    } => {
      if (!isSanityNode(node)) {
        return {
          field: undefined,
          parent: undefined,
        }
      }

      const schemaType = getType(node)

      if (!schemaType) {
        return {
          field: undefined,
          parent: undefined,
        }
      }
      function fieldFromPath(
        schemaType: OverlayElementParent,
        path: string[],
        parent: OverlayElementParent,
        prevPath: string[] = [],
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
          if (!objectField && 'rest' in schemaType) {
            return fieldFromPath(schemaType.rest, path, schemaType, prevPath)
          }
          if (!rest.length) {
            return {field: objectField, parent}
          }
          if (!objectField) {
            throw new Error(
              `[@sanity/visual-editing] No field could be resolved at path: "${[...prevPath, ...path].join('.')}"`,
            )
          }
          return fieldFromPath(objectField.value, rest, schemaType, [...prevPath, next])
        } else if (schemaType.type === 'array') {
          return fieldFromPath(schemaType.of, path, schemaType, prevPath)
        } else if (schemaType.type === 'arrayItem') {
          if (!rest.length) return {field: schemaType, parent}
          return fieldFromPath(schemaType.value, rest, schemaType, [...prevPath, next])
        } else if (schemaType.type === 'union') {
          const name = next.startsWith('[_key==')
            ? resolvedTypes
                ?.get((node as SanityNode).id)
                ?.get([prevPath.join('.'), next].filter(Boolean).join(''))
            : next
          return fieldFromPath(
            schemaType.of.find((item) => (item.type === 'unionOption' ? item.name === name : item)),
            rest,
            schemaType,
            [...prevPath, next],
          )
        } else if (schemaType.type === 'unionOption') {
          if (!next) return {field: schemaType, parent}
          return fieldFromPath(schemaType.value, path, schemaType, prevPath)
        } else if (schemaType.type === 'inline') {
          const type = getType(schemaType.name, 'type')
          return fieldFromPath((type as TypeSchema).value, path, schemaType, prevPath)
        }
        throw new Error(
          `[@sanity/visual-editing] No field could be resolved at path: "${[...prevPath, ...path].join('.')}"`,
        )
      }

      const nodePath = node.path.split('.').flatMap((part) => {
        if (part.includes('[')) {
          return part.split(/(\[.+\])/, 2)
        }
        return [part]
      })

      try {
        return fieldFromPath(schemaType, nodePath, undefined)
      } catch (e) {
        // eslint-disable-next-line no-console
        if (e instanceof Error) console.warn(e.message)
        return {field: undefined, parent: undefined}
      }
    },
    [getType, resolvedTypes],
  )

  const context = useMemo<SchemaContextValue>(() => ({getField, getType}), [getField, getType])

  return <SchemaContext.Provider value={context}>{children}</SchemaContext.Provider>
}
