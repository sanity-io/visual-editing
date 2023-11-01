/* eslint-disable no-console */
// Common utils used in templates, demos and tests.
// The JS in here needs to be able to run server side, browser side, in any fw

import { encodeJsonPathToUriComponent } from '@sanity/client/csm'
import { parseJsonPath, type PathSegment } from '@sanity/client/csm'
import { resolveMapping } from '@sanity/csm'
import { encodeSanityNodeData, type SanityNode } from '@sanity/overlays'
import type { ContentSourceMap } from '@sanity/preview-kit/client'

export function formatCurrency(value: number): string {
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(value)
}

export function defineDataAttribute(
  config: Pick<
    SanityNode,
    'baseUrl' | 'workspace' | 'tool' | 'projectId' | 'dataset'
  >,
  csm?: ContentSourceMap,
): (resultPath: PathSegment[]) => string | undefined {
  if (!csm) {
    return () => undefined
  }
  const { baseUrl, projectId, dataset, tool, workspace } = config
  return function dataAttribute(resultPath: PathSegment[]): string | undefined {
    const resolvedNode = resolveSanityNodeFromResultSourceMapPath(
      resultPath,
      csm,
    )
    if (!resolvedNode) {
      return
    }
    return encodeSanityNodeData({
      // baseUrl,
      // @TODO temporary workaround as overlays fails to find the right workspace
      baseUrl: workspace ? `${baseUrl}/${workspace}` : baseUrl,
      workspace,
      tool,
      ...resolvedNode,
      projectId: resolvedNode?.projectId || projectId,
      dataset: resolvedNode?.dataset || dataset,
    })
  }
}

function resolveSanityNodeFromResultSourceMapPath(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
):
  | (Partial<Pick<SanityNode, 'projectId' | 'dataset'>> &
      Pick<SanityNode, 'id' | 'type' | 'path'>)
  | null {
  if (!csm) {
    return null
  }
  const resolveMappingResult = resolveMapping(resultPath, csm)

  if (!resolveMappingResult) {
    /*
    console.warn('resolveMappingResult not found', {
      resultPath,
      csm,
      resolveMappingResult,
    })
    // */
    return null
  }

  const {
    mapping,
    matchedPath: tmpDebug,
    pathSuffix,
  } = resolveMappingResult || []
  if (mapping.type !== 'value') {
    console.warn('mapping.type !== value', {
      resultPath,
      csm,
      resolveMappingResult,
      mapping,
      pathSuffix,
      tmpDebug,
    })
    return null
  }

  if (mapping.source.type !== 'documentValue') {
    console.warn('mapping.source.type !== documentValue', {
      resultPath,
      csm,
      resolveMappingResult,
      mapping,
      pathSuffix,
      tmpDebug,
    })
    return null
  }

  const sourceDocument =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    csm.documents[mapping.source.document!]
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sourcePath = csm.paths[mapping.source.path]

  if (sourceDocument._projectId) {
    // console.log(sourceDocument._dataset)
  }

  return {
    projectId: sourceDocument._projectId,
    dataset: sourceDocument._dataset,
    type: sourceDocument._type,
    id: sourceDocument._id,
    path: encodeJsonPathToUriComponent(parseJsonPath(sourcePath + pathSuffix)),
  }
}
