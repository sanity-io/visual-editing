import { isArray, isRecord } from '../legacy/helpers'
import { SourceNode, WrappedValue } from './types'

function isSourceNode(n: unknown): n is SourceNode<unknown> {
  return isRecord(n) && n.$$type$$ === 'sanity'
}

export function unwrapData<T>(wrapped: WrappedValue<T> | T | undefined): T {
  if (!wrapped) {
    return wrapped as T
  }

  if (isSourceNode(wrapped)) {
    return wrapped.value as T
  }

  if (isRecord(wrapped)) {
    return Object.fromEntries(
      Object.entries(wrapped).map(([key, value]) => {
        return [key, unwrapData(value)]
      }),
    ) as T
  }

  if (isArray(wrapped)) {
    return wrapped.map((item) => unwrapData(item)) as unknown as T
  }

  return wrapped as T
}
