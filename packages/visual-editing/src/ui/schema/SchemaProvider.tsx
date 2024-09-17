import type {ResolvedSchemaTypeMap, SchemaType, UnresolvedPath} from '@repo/visual-editing-helpers'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren,
} from 'react'
import type {ElementState, VisualEditingNode} from '../../types'
import {SchemaContext, type SchemaContextValue} from './SchemaContext'

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
    return comlink?.on('presentation/schema', (data) => {
      setSchema(data.schema)
    })
  }, [comlink])

  // We report a list of paths that reference array items using a _key. We need
  // to resolve the types of each of these items so we can map them to the
  // correct schema types. One day CSM might include this data for us.
  const reportPaths = useCallback(
    async (paths: UnresolvedPath[]) => {
      if (!paths.length || !comlink) return
      try {
        const response = await comlink.fetch({
          type: 'visual-editing/schema-union-types',
          data: {paths},
        })
        setResolvedTypes(response.types)
      } catch (e) {
        // Fail silently as the app may be communicating with a version of
        // Presentation that does not support this feature
      }
    },
    [comlink],
  )

  const pathsRef = useRef<UnresolvedPath[]>([])

  useEffect(() => {
    const paths = getPathsWithUnresolvedTypes(elements)
    if (paths.some((p) => !pathsRef.current.find(({id, path}) => id === p.id && path === p.path))) {
      reportPaths(paths)
      pathsRef.current = paths
    }
  }, [elements, reportPaths])

  const context = useMemo<SchemaContextValue>(
    () => ({
      resolvedTypes,
      schema: schema || [],
    }),
    [resolvedTypes, schema],
  )
  return <SchemaContext.Provider value={context}>{children}</SchemaContext.Provider>
}
