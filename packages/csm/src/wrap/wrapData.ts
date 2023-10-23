import { ContentSourceMap } from '@sanity/client'
import { SanityNode } from 'visual-editing-helpers'

import { Logger, PathSegment } from '../legacy'
import { isArray, isRecord } from '../legacy/helpers'
import { parseJsonPath } from '../legacy/jsonpath'
import { resolveMapping } from '../legacy/resolveMapping'
import { simplifyPath } from '../legacy/simplifyPath'
import { SANITY_KEYS } from './constants'
import { getPublishedId } from './getPublishedId'
import { SanityKey, SanityNodeContext, SourceNode, WrappedValue } from './types'

export function wrapData<T>(
  context: SanityNodeContext & { logger?: Logger },
  value: T,
  sourceMap: ContentSourceMap | undefined,
  path?: PathSegment[],
): WrappedValue<T>
export function wrapData<T>(
  context: SanityNodeContext & { logger?: Logger },
  value: T | undefined,
  sourceMap: ContentSourceMap | undefined,
  path: PathSegment[] = [],
): WrappedValue<T> | undefined {
  if (value === null || value === undefined) {
    return value as WrappedValue<T> | undefined
  }

  if (isRecord(value)) {
    const map = Object.fromEntries(
      Object.entries(value).map(([k, v]) => {
        if (SANITY_KEYS.includes(k as SanityKey)) {
          return [k, v]
        }

        return [k, wrapData(context, v, sourceMap, path.concat(k))]
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
  const [mapping, , pathSuffix] =
    resolveMapping(path, sourceMap, context.logger) || []

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
      id: getPublishedId(sourceDoc._id),
      path: simplifyPath(parseJsonPath(sourcePath + pathSuffix)),
      projectId: context.projectId,
      tool: context.tool,
      type: sourceDoc._type,
      workspace: context.workspace,
    }
  }

  return undefined
}
