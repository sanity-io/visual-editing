import { is, minLength, object, optional, safeParse, string } from 'valibot'

import {
  pathToString,
  pathToUrlString,
  stringToPath,
  urlStringToPath,
} from '../paths'
import { SanityNode, SanityNodeLegacy } from '../types'

export type { SanityNode, SanityNodeLegacy }

const lengthyStr = string([minLength(1)])
const optionalLengthyStr = optional(lengthyStr)

const sanityNodeSchema = object({
  projectId: lengthyStr,
  dataset: lengthyStr,
  id: lengthyStr,
  path: lengthyStr,
  type: optionalLengthyStr,
  baseUrl: lengthyStr,
  workspace: optionalLengthyStr,
  tool: optionalLengthyStr,
})

const sanityLegacyNodeSchema = object({
  origin: lengthyStr,
  href: lengthyStr,
  data: optionalLengthyStr,
})

export function isValidSanityNode(
  node: Partial<SanityNode>,
): node is SanityNode {
  return is(sanityNodeSchema, node)
}

export function isValidSanityLegacyNode(
  node: Partial<SanityNodeLegacy>,
): node is SanityNodeLegacy {
  return is(sanityLegacyNodeSchema, node)
}

/**
 * Transforms sanity node data into an encoded string
 * @param node - An unencoded sanity node object
 * @returns An encoded string of sanity data
 * @public
 */
export function encodeSanityNodeData(node: SanityNode): string | undefined {
  const {
    projectId,
    dataset,
    id: _id,
    path,
    baseUrl,
    tool,
    workspace,
    type,
  } = node

  if (!isValidSanityNode(node)) {
    return undefined
  }

  // @TODO figure out why this workaround is needed
  const id = _id.startsWith('drafts.') ? _id.slice(7) : _id

  const parts = [
    ['project', projectId],
    ['dataset', dataset],
    ['id', id],
    ['type', type],
    ['path', pathToUrlString(stringToPath(path))],
    ['base', encodeURIComponent(baseUrl)],
    ['workspace', workspace],
    ['tool', tool],
  ]

  return parts
    .filter(([, value]) => !!value)
    .map((part) => part.join('='))
    .join(';')
}

/**
 * Transforms a sanity data string into sanity node data
 * @param str - An encoded string of sanity data
 */
export function decodeSanityString(str: string): SanityNode | undefined {
  const segments = str.split(';')

  const data = segments.reduce((acc, segment) => {
    const [key, value] = segment.split('=')
    if (!key || !value) return acc

    switch (key) {
      case 'project':
        acc.projectId = value
        break
      case 'dataset':
        acc.dataset = value
        break
      case 'id':
        acc.id = value
        break
      case 'type':
        acc.type = value
        break
      case 'path':
        acc.path = pathToString(urlStringToPath(value))
        break
      case 'base':
        acc.baseUrl = decodeURIComponent(value)
        break
      case 'tool':
        acc.tool = value
        break
      case 'workspace':
        acc.workspace = value
        break
      default:
    }

    return acc
  }, {} as Partial<SanityNode>)

  if (!isValidSanityNode(data)) return undefined

  return data
}

/**
 * Transforms stringified JSON into sanity node data
 * @param str - JSON sanity data
 */
function decodeSanityJson(
  data: Record<string, unknown>,
): SanityNode | SanityNodeLegacy | undefined {
  const sanityNode = safeParse(sanityNodeSchema, data)
  if (sanityNode.success) {
    return sanityNode.output
  }
  const sanityLegacyNode = safeParse(sanityLegacyNodeSchema, data)
  if (sanityLegacyNode.success) {
    return sanityLegacyNode.output
  }
  return undefined
}

/**
 * Transforms sanity data from multiple formats into sanity node data
 * @param str - Sanity data as a string of unknown format
 */
export function decodeSanityNodeData(
  str: string,
): SanityNode | SanityNodeLegacy | undefined {
  try {
    const json = JSON.parse(str)
    return decodeSanityJson(json)
  } catch {
    return decodeSanityString(str)
  }
}
