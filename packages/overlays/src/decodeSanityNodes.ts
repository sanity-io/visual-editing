import { pathToString } from 'sanity'

import { OverlayElementSanityData, SanityNode, SanityNodeLegacy } from './types'
import { urlStringToPath } from './urlStringToPath'

/**
 * Transforms a sanity data string into sanity node data
 * @param str - Semicolon separated sanity data string
 */
function decodeCustomStringFormat(
  str: string,
): OverlayElementSanityData | null {
  const segments = str.split(';')

  const data = segments.reduce(
    (acc, segment) => {
      const [key, value] = segment.split('=')
      if (!key || !value) return acc

      switch (key) {
        case 'project-id':
          acc.projectId = value
          break
        case 'dataset':
          acc.dataset = value
          break
        case 'id':
          acc.document.id = value
          break
        case 'type':
          acc.document.type = value
          break
        case 'path':
          acc.document.path = pathToString(urlStringToPath(value))
          break
        case 'workspace':
          acc.studio.workspace = value
          break
        case 'tool':
          acc.studio.tool = value
          break
        default:
      }

      return acc
    },
    {
      document: {},
      studio: {},
    } as SanityNode,
  )

  return {
    type: 'sanity',
    data,
  }
}

/**
 * Transforms sanity data JSON into sanity node data
 * @param str - JSON sanity data
 */
function decodeJson(
  data: Record<string, unknown>,
): OverlayElementSanityData | null {
  const legacyKeys = ['origin', 'href']
  if (legacyKeys.every((key) => key in data)) {
    return {
      type: 'sanity-edit-info',
      data: data as unknown as SanityNodeLegacy,
    }
  }

  const currentKeys = ['projectId', 'dataset', 'document', 'studio']
  if (currentKeys.every((key) => key in data)) {
    return {
      type: 'sanity',
      data: data as unknown as SanityNode,
    }
  }
  return null
}

/**
 * Transforms sanity data from multiple formats into sanity node data
 * @param str - Sanity data as a string of unknown format
 */
export function decodeSanityDataAttributeValue(
  str: string,
): OverlayElementSanityData | null {
  try {
    const json = JSON.parse(str)
    return decodeJson(json)
  } catch {
    return decodeCustomStringFormat(str)
  }
}
