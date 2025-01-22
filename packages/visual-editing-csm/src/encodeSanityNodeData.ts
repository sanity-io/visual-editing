import {getPublishedId, isDraftId, studioPath} from '@sanity/client/csm'
import type {SanityNode} from '@sanity/visual-editing-types'
import {isValidSanityNode} from './isValidSanityNode'
import {pathToUrlString} from './pathToUrlString'

/**
 * Transforms sanity node data into an encoded string
 * @param node - An unencoded sanity node object
 * @returns An encoded string of sanity data
 * @public
 */
export function encodeSanityNodeData(node: SanityNode): string | undefined {
  const {id: _id, path, baseUrl, tool, workspace, type} = node

  if (!isValidSanityNode(node)) {
    return undefined
  }

  const parts = [
    ['id', getPublishedId(_id)],
    ['type', type],
    ['path', pathToUrlString(studioPath.fromString(path))],
    ['base', encodeURIComponent(baseUrl)],
    ['workspace', workspace],
    ['tool', tool],
    ['isDraft', isDraftId(_id)],
  ]

  return parts
    .filter(([, value]) => !!value)
    .map((part) => {
      const [key, value] = part
      // For true values, just display the key
      if (value === true) return key
      return part.join('=')
    })
    .join(';')
}
