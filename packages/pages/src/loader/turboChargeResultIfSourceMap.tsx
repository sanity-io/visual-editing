import type {
  ClientPerspective,
  ContentSourceMap,
  SanityDocument,
} from '@sanity/client'
import { parseJsonPath, resolveMapping, walkMap } from '@sanity/csm'
import { vercelStegaSplit } from '@vercel/stega'

import { documentsCache } from './documentsCache'
import { getTurboCacheKey } from './getTurboCacheKey'

export function turboChargeResultIfSourceMap(
  draft: SanityDocument,
  projectId: string,
  dataset: string,
  result: unknown,
  perspective: ClientPerspective,
  resultSourceMap?: ContentSourceMap,
): any {
  if (!resultSourceMap) return result

  return walkMap(result, (value, path) => {
    const resolveMappingResult = resolveMapping(path, resultSourceMap)
    if (!resolveMappingResult) {
      return value
    }

    const { mapping, pathSuffix } = resolveMappingResult
    if (mapping.type !== 'value') {
      return value
    }

    if (mapping.source.type !== 'documentValue') {
      return value
    }

    const sourceDocument = resultSourceMap.documents[mapping.source.document]
    const sourcePath = resultSourceMap.paths[mapping.source.path]

    if (sourceDocument && sourceDocument._id) {
      const cachedDocument =
        draft?._id === sourceDocument._id
          ? draft
          : documentsCache.get(
              getTurboCacheKey(
                projectId,
                dataset,
                perspective,
                sourceDocument._id,
              ),
            )

      const cachedValue = cachedDocument
        ? getField(
            cachedDocument,
            parseJsonPath(sourcePath + pathSuffix) as any,
          ) ?? value
        : value
      // Preserve stega encoded strings, if they exist
      if (typeof cachedValue === 'string' && typeof value === 'string') {
        const { encoded } = vercelStegaSplit(value)
        const { cleaned } = vercelStegaSplit(cachedValue)
        return `${encoded}${cleaned}`
      }
      return cachedValue
    }

    return value
  })
}

function getField(obj: any, path: (string | { key: string })[]): any {
  let value = obj
  for (const segment of path) {
    if (typeof segment === 'string') {
      value = value[segment]
    } else {
      const match = value.find((item: any) => item._key === segment.key)
      value = match || null
    }
    if (value === null || value === undefined) {
      break
    }
  }
  return value
}
