/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  jsonPathToStudioPath,
  studioPath,
  type ContentSourceMap,
  type ContentSourceMapParsedPath,
} from '@sanity/client/csm'

import type {SanityKey, SanityNodeContext, WrappedValue} from './types'

import {SANITY_KEYS} from './constants'
import {isArray, isRecord} from './helpers'
import {resolveSanityNode} from './resolveSanityNode'

/** @public */
export function wrapData<T>(
  context: SanityNodeContext,
  value: T,
  sourceMap: ContentSourceMap | undefined,
  resultPath: ContentSourceMapParsedPath = [],
  keyedResultPath: ContentSourceMapParsedPath = [],
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
          isRecord(t) && '_key' in t && typeof t['_key'] === 'string'
            ? {_key: t['_key'], _index: idx}
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
          : [k, wrapData(context, v, sourceMap, resultPath.concat(k), keyedResultPath.concat(k))],
      ),
    ) as WrappedValue<T>
  }

  return {
    $$type$$: 'sanity',
    path: studioPath.toString(jsonPathToStudioPath(resultPath)) || undefined,
    source: sourceMap
      ? resolveSanityNode(context, sourceMap, resultPath, keyedResultPath)
      : undefined,
    value,
  } as unknown as WrappedValue<T>
}
