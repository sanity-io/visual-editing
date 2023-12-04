import {
  jsonPathToStudioPath,
  resolveEditInfo,
  studioPath,
  studioPathToJsonPath,
} from '@sanity/client/csm'
import { encodeSanityNodeData } from '@sanity/visual-editing-helpers/csm'

import type { EncodeDataAttribute } from './types'

/** @public */
export const encodeDataAttribute: EncodeDataAttribute<unknown> = (
  result,
  sourceMap,
  studioUrl,
  studioPathLike,
) => {
  if (!sourceMap) {
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

export type { EncodeDataAttribute }
