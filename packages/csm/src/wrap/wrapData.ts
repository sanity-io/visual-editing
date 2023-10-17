import { ContentSourceMap } from '@sanity/client'
import { SanityNode } from 'visual-editing-helpers'

import { Logger, PathSegment } from '../legacy'
import { isArray, isRecord } from '../legacy/helpers'
import { parseJsonPath } from '../legacy/jsonpath'
import { resolveMapping } from '../legacy/resolveMapping'
import { simplifyPath } from '../legacy/simplifyPath'
import { SANITY_KEYS } from './constants'
import { SanityKey, SanityNodeContext, SourceNode, WrappedValue } from './types'

export function wrapData<T>(
  context: SanityNodeContext & { logger?: Logger },
  value: T,
  sourceMap: ContentSourceMap | undefined,
  path: PathSegment[] = [],
): WrappedValue<T> {
  if (isRecord(value)) {
    const map = Object.fromEntries(
      Object.entries(value).map(([key, _value]) => {
        if (SANITY_KEYS.includes(key as SanityKey)) {
          return [key, _value]
        }

        return [key, wrapData(context, _value, sourceMap, path.concat(key))]
      }),
    )

    return map as WrappedValue<T>
  }

  if (isArray(value)) {
    return value.map((item, idx) =>
      wrapData(context, item, sourceMap, path.concat(idx)),
    ) as unknown as WrappedValue<T>
  }

  const node: SourceNode<T> = {
    $$type$$: 'sanity',
    value,
    source: sourceMap ? getValueSource(context, sourceMap, path) : undefined,
  }

  return node as unknown as WrappedValue<T>
}

function getValueSource(
  context: SanityNodeContext & { logger?: Logger },
  sourceMap: ContentSourceMap,
  path: PathSegment[],
): SanityNode | undefined {
  const [
    mapping,
    // matchedPath,
    // pathSuffix,
  ] = resolveMapping(path, sourceMap, context.logger) || []

  if (!mapping) {
    // console.warn('no mapping for path', {path, sourceMap})
    return undefined
  }

  if (mapping.source.type === 'literal') {
    return undefined
  }

  if (mapping.source.type === 'unknown') {
    return undefined
  }

  const sourceDoc = sourceMap.documents[mapping.source.document]
  const sourcePath = sourceMap.paths[mapping.source.path]

  if (sourceDoc && sourcePath) {
    return {
      baseUrl: context.baseUrl,
      dataset: context.dataset,
      id: sourceDoc._id,
      path: simplifyPath(parseJsonPath(sourcePath)),
      projectId: context.projectId,
      tool: context.tool,
      type: sourceDoc._type,
      workspace: context.workspace,
    }
  }

  return undefined
}
