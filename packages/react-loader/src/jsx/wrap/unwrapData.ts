import type {SanityKey, UnwrappedValue, WrappedValue} from './types'

import {SANITY_KEYS} from './constants'
import {isArray, isRecord} from './helpers'
import {isSourceNode} from './isSourceNode'

/** @public */
export function unwrapData<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any,
  S extends WrappedValue<T> = WrappedValue<T>,
>(wrapper: S): UnwrappedValue<S> {
  if (wrapper === undefined) {
    return undefined as UnwrappedValue<S>
  }

  if (wrapper === null) {
    return null as UnwrappedValue<S>
  }

  if (isSourceNode(wrapper)) {
    return wrapper.value as UnwrappedValue<S>
  }

  if (isArray(wrapper)) {
    return wrapper.map((item) => unwrapData(item as WrappedValue<unknown>)) as UnwrappedValue<S>
  }

  if (isRecord(wrapper)) {
    return Object.fromEntries(
      Object.entries(wrapper).map(([k, v]) =>
        SANITY_KEYS.includes(k as SanityKey) ? [k, v] : [k, unwrapData(v as WrappedValue<unknown>)],
      ),
    ) as UnwrappedValue<S>
  }

  throw new Error('invalid wrapped value')
}
