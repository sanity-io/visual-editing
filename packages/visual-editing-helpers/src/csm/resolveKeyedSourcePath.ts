import { jsonPath, parseJsonPath, type PathSegment } from '@sanity/client/csm'

export function resolvedKeyedSourcePath(options: {
  keyedResultPath: PathSegment[]
  pathSuffix?: string
  sourceBasePath: string
}): PathSegment[] {
  const { keyedResultPath, pathSuffix, sourceBasePath } = options

  const inferredResultPath =
    pathSuffix === undefined ? [] : parseJsonPath(pathSuffix)

  const inferredPath = keyedResultPath.slice(
    keyedResultPath.length - inferredResultPath.length,
  )

  const inferredPathSuffix = inferredPath.length
    ? jsonPath(inferredPath, { keyArraySelectors: true }).slice(1)
    : ''

  return parseJsonPath(sourceBasePath + inferredPathSuffix)
}
