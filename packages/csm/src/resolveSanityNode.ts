import {
  type ContentSourceMap,
  type PathSegment,
  resolveMapping,
} from '@sanity/client/csm'
import { SanityNode } from 'visual-editing-helpers'

import { simplifyPath } from './legacy/simplifyPath'
import { resolvedKeyedSourcePath } from './resolveKeyedSourcePath'
import { getPublishedId } from './wrap/getPublishedId'
import { SanityNodeContext } from './wrap/types'

export function resolveSanityNode(
  context: SanityNodeContext,
  csm: ContentSourceMap,
  resultPath: PathSegment[],
  keyedResultPath: PathSegment[],
): SanityNode | undefined {
  const { mapping, pathSuffix } = resolveMapping(resultPath, csm) || {}

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
    return {
      baseUrl: context.baseUrl,
      dataset: context.dataset,
      id: getPublishedId(sourceDoc._id),
      path: simplifyPath(
        resolvedKeyedSourcePath({
          keyedResultPath,
          pathSuffix,
          sourceBasePath,
        }),
      ),
      projectId: context.projectId,
      tool: context.tool,
      type: sourceDoc._type,
      workspace: context.workspace,
    }
  }

  return undefined
}
