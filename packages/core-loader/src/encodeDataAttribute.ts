import {
  jsonPathToStudioPath,
  resolveEditInfo,
  studioPath,
  studioPathToJsonPath,
} from '@sanity/client/csm'
import {encodeSanityNodeData} from '@sanity/visual-editing-csm'

import type {EncodeDataAttribute} from './types'

/** @public */
export const encodeDataAttribute: EncodeDataAttribute<unknown> = (
  result,
  sourceMap,
  studioUrl,
  studioPathLike,
) => {
  if (!sourceMap || !studioUrl) {
    return undefined
  }
  const resultPath = studioPathToJsonPath(studioPathLike)

  const editInfo = resolveEditInfo({
    resultPath,
    resultSourceMap: sourceMap,
    studioUrl,
  })
  if (!editInfo) {
    return undefined
  }

  return encodeSanityNodeData({
    baseUrl: editInfo.baseUrl,
    workspace: editInfo.workspace,
    tool: editInfo.tool,
    type: editInfo.type,
    id: editInfo.id,
    path:
      typeof editInfo.path === 'string'
        ? editInfo.path
        : studioPath.toString(jsonPathToStudioPath(editInfo.path)),
  })
}

export type {EncodeDataAttribute}

/**
 * @public
 */
export type EncodeDataAttributeFunction = {
  (path: import('@sanity/client/csm').StudioPathLike): string | undefined
  scope: (path: import('@sanity/client/csm').StudioPathLike) => EncodeDataAttributeFunction
}

/**
 * @public
 */
export function defineEncodeDataAttribute<QueryResponseResult = unknown>(
  result: QueryResponseResult,
  sourceMap: import('@sanity/client/csm').ContentSourceMap | undefined,
  studioUrl:
    | Exclude<import('@sanity/client/stega').StegaConfig['studioUrl'], undefined>
    | undefined,
  basePath?: import('@sanity/client/csm').StudioPathLike,
): EncodeDataAttributeFunction {
  const parse = (path?: import('@sanity/client/csm').StudioPathLike) => {
    if (!path) return []
    return typeof path === 'string' ? studioPath.fromString(path) : path
  }

  const parsedBasePath = parse(basePath)

  // This function should encode the given attribute based on the result, sourceMap, and studioUrl
  return Object.assign(
    (path: import('@sanity/client/csm').StudioPathLike) =>
      encodeDataAttribute(result, sourceMap, studioUrl, [...parsedBasePath, ...parse(path)]),
    // The scope method creates a scoped version of encodeDataAttribute
    {
      scope: (scope: import('@sanity/client/csm').StudioPathLike) =>
        defineEncodeDataAttribute(result, sourceMap, studioUrl, [
          ...parsedBasePath,
          ...parse(scope),
        ]),
    },
  )
}
