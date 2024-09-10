import {encodeSanityNodeData} from '@repo/visual-editing-helpers/csm'
import {
  jsonPathToStudioPath,
  resolveEditInfo,
  studioPath,
  studioPathToJsonPath,
  type ContentSourceMap,
  type StudioPathLike,
} from '@sanity/client/csm'
import type {StegaConfig} from '@sanity/client/stega'
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
  (path: StudioPathLike): string | undefined
  scope: (path: StudioPathLike) => EncodeDataAttributeFunction
}

/**
 * @public
 */
export function defineEncodeDataAttribute<QueryResponseResult = unknown>(
  result: QueryResponseResult,
  sourceMap: ContentSourceMap | undefined,
  studioUrl: Exclude<StegaConfig['studioUrl'], undefined> | undefined,
  basePath?: StudioPathLike,
): EncodeDataAttributeFunction {
  const parse = (path?: StudioPathLike) => {
    if (!path) return []
    return typeof path === 'string' ? studioPath.fromString(path) : path
  }

  const parsedBasePath = parse(basePath)

  // This function should encode the given attribute based on the result, sourceMap, and studioUrl
  return Object.assign(
    (path: StudioPathLike) =>
      encodeDataAttribute(result, sourceMap, studioUrl, [...parsedBasePath, ...parse(path)]),
    // The scope method creates a scoped version of encodeDataAttribute
    {
      scope: (scope: StudioPathLike) =>
        defineEncodeDataAttribute(result, sourceMap, studioUrl, [
          ...parsedBasePath,
          ...parse(scope),
        ]),
    },
  )
}
