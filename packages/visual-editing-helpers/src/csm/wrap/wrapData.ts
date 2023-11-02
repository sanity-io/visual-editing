/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ContentSourceMap, PathSegment } from '@sanity/client/csm'

import { isArray, isRecord } from '../legacy/helpers'
import { simplifyPath } from '../legacy/simplifyPath'
import { resolveSanityNode } from '../resolveSanityNode'
import { SANITY_KEYS } from './constants'
import { SanityKey, SanityNodeContext, WrappedValue } from './types'

/** @public */
export function wrapData<T>(
  context: SanityNodeContext,
  value: T,
  sourceMap: ContentSourceMap | undefined,
  resultPath: PathSegment[] = [],
  keyedResultPath: PathSegment[] = [],
): WrappedValue<T> {
  if (value === undefined) {
    return undefined as WrappedValue<T>
  }

  if (value === null) {
    return null as WrappedValue<T>
  }

  if (isArray(value)) {
    return value.map((t, idx) =>
      wrapData(
        context,
        t as T,
        sourceMap,
        resultPath.concat(idx),
        keyedResultPath.concat(
          isRecord(t) && '_key' in t && typeof t._key === 'string'
            ? { key: t._key, index: idx }
            : idx,
        ),
      ),
    ) as WrappedValue<T>
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) =>
        SANITY_KEYS.includes(k as SanityKey)
          ? [k, v]
          : [
              k,
              wrapData(
                context,
                v,
                sourceMap,
                resultPath.concat(k),
                keyedResultPath.concat(k),
              ),
            ],
      ),
    ) as WrappedValue<T>
  }

  return {
    $$type$$: 'sanity',
    path: simplifyPath(resultPath) || undefined,
    source: sourceMap
      ? resolveSanityNode(context, sourceMap, resultPath, keyedResultPath)
      : undefined,
    value,
  } as unknown as WrappedValue<T>
}
