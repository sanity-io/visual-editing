import {getPublishedId, studioPath} from '@sanity/client/csm'
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
  ]

  return parts
    .filter(([, value]) => !!value)
    .map((part) => part.join('='))
    .join(';')
}
