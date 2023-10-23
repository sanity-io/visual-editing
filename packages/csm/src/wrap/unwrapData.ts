import { isArray, isRecord } from '../legacy/helpers'
import { SourceNode, WrappedValue } from './types'

function isSourceNode(n: unknown): n is SourceNode<unknown> {
  return isRecord(n) && n.$$type$$ === 'sanity'
}

export function unwrapData<T, W = WrappedValue<T>>(
  wrapped: W,
): T | null | undefined {
  if (wrapped === null || wrapped === undefined) {
    return wrapped as null | undefined
  }

  if (isSourceNode(wrapped)) {
    return wrapped.value as T
  }

  if (isRecord(wrapped)) {
    return Object.fromEntries(
      Object.entries(wrapped).map(([key, value]) => {
        return [key, unwrapData(value as WrappedValue<unknown>)]
      }),
    ) as T
  }

  if (isArray(wrapped)) {
    return wrapped.map((item) => unwrapData(item)) as T
  }

  return wrapped as T
}
