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
      case 'perspective':
        acc.perspective = value
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

const EDIT_INTENT_MARKER = '/intent/edit/'

/**
 * Recovers sanity node data from the edit intent segment of an href, i.e.
 * `/intent/edit/<router params>?<search params>`. `new URL(href)` cannot be
 * trusted to locate the search params of the edit intent: if the studio
 * baseUrl itself contains a query string or a hash, the edit intent search
 * params end up inside another search param or inside the URL hash. The raw
 * href still contains the intact edit intent, so parse it from the string
 * instead.
 */
function decodeEditIntentSegment(href: string): SanityNode | undefined {
  const markerIndex = href.indexOf(EDIT_INTENT_MARKER)
  if (markerIndex === -1) return undefined
  try {
    const segment = href.slice(markerIndex + EDIT_INTENT_MARKER.length)
    const searchIndex = segment.indexOf('?')
    const routerParams = searchIndex === -1 ? segment : segment.slice(0, searchIndex)
    const data: Record<string, string> = {}
    for (const routerParam of routerParams.split(';')) {
      const separatorIndex = routerParam.indexOf('=')
      if (separatorIndex === -1) continue
      const key = routerParam.slice(0, separatorIndex)
      if (key === 'id' || key === 'type' || key === 'path' || key === 'tool') {
        data[key] = decodeURIComponent(routerParam.slice(separatorIndex + 1))
      }
    }
    if (searchIndex !== -1) {
      // Search params take precedence: unlike the router params they also
      // carry `baseUrl`, `workspace`, `perspective`, `projectId` and `dataset`
      Object.assign(data, Object.fromEntries(new URLSearchParams(segment.slice(searchIndex + 1))))
    }
    // Everything before the edit intent is the studio baseUrl, possibly
    // followed by a workspace name
    data['baseUrl'] ??= href.slice(0, markerIndex) || '/'
    const sanityNode = safeParse(sanityNodeSchema, data)
    return sanityNode.success ? sanityNode.output : undefined
  } catch {
    return undefined
  }
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
    const {href} = sanityLegacyNode.output
    try {
      const url = new URL(
        href,
        typeof document === 'undefined' ? 'https://example.com' : location.origin,
      )
      if (url.searchParams.size > 0) {
        return parse(sanityNodeSchema, Object.fromEntries(url.searchParams.entries()))
      }
      return decodeEditIntentSegment(href) ?? sanityLegacyNode.output
    } catch (err) {
      const recoveredSanityNode = decodeEditIntentSegment(href)
      if (recoveredSanityNode) {
        return recoveredSanityNode
      }
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
  // @TODO maybe check if the string starts with `{` before attempting to JSON parse it?
  try {
    const obj = JSON.parse(data)
    return decodeSanityObject(obj)
  } catch {
    return decodeSanityString(data)
  }
}
