import { ContentSourceMap } from '@sanity/client'
import { SanityNode } from 'visual-editing-helpers'

import { Logger, PathSegment } from '../legacy'
import { compileJsonPath, parseJsonPath } from '../legacy/jsonpath'
import { resolveMapping } from '../legacy/resolveMapping'
import { simplifyPath } from '../legacy/simplifyPath'
import { getPublishedId } from './getPublishedId'
import { SanityNodeContext } from './types'

export function getValueSource(
  context: SanityNodeContext,
  csm: ContentSourceMap,
  resultPath: PathSegment[],
  keyedResultPath: PathSegment[],
  logger?: Logger,
): SanityNode | undefined {
  const { mapping, pathSuffix } = resolveMapping(resultPath, csm, logger) || {}

  if (!mapping) {
    // console.warn('no mapping for path', { path: resultPath, sourceMap: csm })
    return undefined
  }

  if (mapping.source.type === 'literal') {
    return undefined
  }

  if (mapping.source.type === 'unknown') {
    return undefined
  }

  const sourceDoc = csm.documents[mapping.source.document]
  const sourceBasePath = csm.paths[mapping.source.path]

  if (sourceDoc && sourceBasePath) {
    const inferredResultPath = pathSuffix ? parseJsonPath(pathSuffix) : []
    const inferredPath = keyedResultPath.slice(
      keyedResultPath.length - inferredResultPath.length,
    )
    const inferredPathSuffix = inferredPath.length
      ? compileJsonPath(inferredPath, { keyArraySelectors: true }).slice(1)
      : ''
    const sourcePath = parseJsonPath(sourceBasePath + inferredPathSuffix)

    return {
      baseUrl: context.baseUrl,
      dataset: context.dataset,
      id: getPublishedId(sourceDoc._id),
      path: simplifyPath(sourcePath),
      projectId: context.projectId,
      tool: context.tool,
      type: sourceDoc._type,
      workspace: context.workspace,
    }
  }

  return undefined
}
