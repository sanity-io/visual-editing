/* eslint-disable no-console */
// Common utils used in templates, demos and tests.
// The JS in here needs to be able to run server side, browser side, in any fw

import {
  type ContentSourceMap,
  encodeJsonPathToUriComponent,
  parseJsonPath,
  type PathSegment,
  resolveMapping,
} from '@sanity/client/csm'
import { encodeSanityNodeData, type SanityNode } from '@sanity/react-loader/jsx'
import { vercelStegaSplit } from '@vercel/stega'

export function formatCurrency(_value: number | string): string {
  let value = typeof _value === 'string' ? undefined : _value
  let encoded = ''
  if (typeof _value === 'string') {
    const split = vercelStegaSplit(_value)
    value = parseInt(split.cleaned, 10)
    encoded = split.encoded
  }
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatter.format(value!)}${encoded}`
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
  } = resolveMappingResult || {}
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
