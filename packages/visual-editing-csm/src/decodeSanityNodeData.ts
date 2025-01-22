import {studioPath} from '@sanity/client/csm'
import type {SanityNode, SanityStegaNode} from '@sanity/visual-editing-types'
import {minLength, object, optional, parse, pipe, record, safeParse, string, unknown} from 'valibot'
import {isValidSanityNode} from './isValidSanityNode'
import {sanityNodeSchema} from './sanityNodeSchema'
import {urlStringToPath} from './urlStringToPath'

const lengthyStr = pipe(string(), minLength(1))

const sanityLegacyNodeSchema = object({
  origin: lengthyStr,
  href: lengthyStr,
  data: optional(record(string(), unknown())),
})

/**
 * Transforms a sanity data string into sanity node data
 * @param str - An encoded string of sanity data
 * @internal
 */
export function decodeSanityString(str: string): SanityNode | undefined {
  const segments = str.split(';')

  const data = segments.reduce((acc, segment) => {
    const [key, value] = segment.split('=')
    if (!key || (segment.includes('=') && !value)) return acc

    switch (key) {
      case 'id':
        acc.id = value
        break
      case 'type':
        acc.type = value
        break
      case 'path':
        acc.path = studioPath.toString(urlStringToPath(value))
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
      case 'projectId':
        acc.projectId = value
        break
      case 'dataset':
        acc.dataset = value
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
function decodeSanityObject(
  data: Record<string, unknown>,
): SanityNode | SanityStegaNode | undefined {
  const sanityNode = safeParse(sanityNodeSchema, data)
  if (sanityNode.success) {
    return sanityNode.output
  }
  const sanityLegacyNode = safeParse(sanityLegacyNodeSchema, data)
  if (sanityLegacyNode.success) {
    try {
      const url = new URL(
        sanityLegacyNode.output.href,
        typeof document === 'undefined' ? 'https://example.com' : location.origin,
      )
      if (url.searchParams.size > 0) {
        return parse(sanityNodeSchema, Object.fromEntries(url.searchParams.entries()))
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
  data: SanityStegaNode | string,
): SanityNode | SanityStegaNode | undefined {
  if (typeof data === 'object' && data !== null) {
    return decodeSanityObject(data)
  }
  try {
    const obj = JSON.parse(data)
    return decodeSanityObject(obj)
  } catch {
    return decodeSanityString(data)
  }
}
