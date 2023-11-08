import { getPublishedId } from '@sanity/client/csm'
import {
  is,
  minLength,
  object,
  optional,
  parse,
  safeParse,
  string,
} from 'valibot'

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
  projectId: optionalLengthyStr,
  dataset: optionalLengthyStr,
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

/** @internal */
export function isValidSanityNode(
  node: Partial<SanityNode>,
): node is SanityNode {
  return is(sanityNodeSchema, node)
}

/** @internal */
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

  const parts = [
    ['project', projectId],
    ['dataset', dataset],
    ['id', getPublishedId(_id)],
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
 * @internal
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
    try {
      const url = new URL(
        sanityLegacyNode.output.href,
        typeof document === 'undefined'
          ? 'https://example.com'
          : location.origin,
      )
      if (url.searchParams.size > 0) {
        return parse(
          sanityNodeSchema,
          Object.fromEntries(url.searchParams.entries()),
        )
      }
      return sanityLegacyNode.output
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse sanity node', err)
      return sanityLegacyNode.output
    }
  }
  return undefined
}

/**
 * Transforms sanity data from multiple formats into sanity node data
 * @param str - Sanity data as a string of unknown format
 * @internal
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
