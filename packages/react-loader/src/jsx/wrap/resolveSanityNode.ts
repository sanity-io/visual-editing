import {
  getPublishedId,
  jsonPathToStudioPath,
  resolvedKeyedSourcePath,
  resolveMapping,
  studioPath,
  type ContentSourceMap,
  type ContentSourceMapParsedPath,
} from '@sanity/client/csm'
import type {SanityNode} from '@sanity/visual-editing-csm'
import type {SanityNodeContext} from './types'

/** @internal */
export function resolveSanityNode(
  context: SanityNodeContext,
  csm: ContentSourceMap,
  resultPath: ContentSourceMapParsedPath,
  keyedResultPath: ContentSourceMapParsedPath,
): SanityNode | undefined {
  const {mapping, pathSuffix} = resolveMapping(resultPath, csm) || {}

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
      workspace: context.workspace,
      tool: context.tool,
      type: sourceDoc._type,
      id: getPublishedId(sourceDoc._id),
      path: studioPath.toString(
        jsonPathToStudioPath(
          resolvedKeyedSourcePath({
            keyedResultPath,
            pathSuffix,
            sourceBasePath,
          }),
        ),
      ),
    }
  }

  return undefined
}
